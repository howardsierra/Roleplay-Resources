// Keeps the repo and site in sync with the files in presets/.
//
//   node scripts/build.mjs            rebuild regex bundles, counts, links, previews
//   node scripts/build.mjs --fetch    also refresh extension versions from GitHub
//
// No dependencies; needs Node 20+.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const config = JSON.parse(read("scripts/config.json"));
const fetchVersions = process.argv.includes("--fetch");

const changed = [];
function write(path, text) {
  const full = join(root, path);
  if (existsSync(full) && readFileSync(full, "utf8") === text) return;
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text);
  changed.push(path);
}

// ---------- presets ----------

// "LOVESICK_v1.4.1.json" -> [1, 4, 1]
function versionOf(file) {
  const m = file.match(/_v(\d+(?:\.\d+)*)\.json$/i);
  return m ? m[1].split(".").map(Number) : [0];
}
function compareVersions(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

const presetFiles = readdirSync(join(root, "presets")).filter((f) => f.endsWith(".json"));
const presets = config.presets.map((cfg) => {
  const matches = presetFiles.filter((f) => f.startsWith(cfg.prefix));
  if (!matches.length) throw new Error(`No preset file in presets/ starts with "${cfg.prefix}"`);
  const file = matches.sort((a, b) => compareVersions(versionOf(b), versionOf(a)))[0];
  const data = JSON.parse(read(`presets/${file}`));
  const regex = data.extensions?.regex_scripts ?? [];
  return {
    ...cfg,
    file,
    version: versionOf(file).join("."),
    regex,
    prompts: data.prompts?.length ?? 0,
    context: data.openai_max_context ? `${Math.round(data.openai_max_context / 1000)}k` : "—",
  };
});

for (const p of presets) {
  write(`regex/${p.bundle}`, JSON.stringify(p.regex, null, 4));
}

// ---------- site + README ----------

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function setText(html, attr, value) {
  return html.replace(new RegExp(`(<[^>]*${esc(attr)}[^>]*>)[^<]*`, "g"), `$1${value}`);
}
function setHref(html, attr, href) {
  return html.replace(new RegExp(`(${esc(attr)} href=")[^"]*`, "g"), `$1${href}`);
}

let html = read("index.html");
for (const p of presets) {
  html = setText(html, `data-preset-ver="${p.key}"`, `v${p.version}`);
  html = setText(html, `data-preset-stat="${p.key}:prompts"`, p.prompts);
  html = setText(html, `data-preset-stat="${p.key}:regex"`, p.regex.length);
  html = setText(html, `data-preset-stat="${p.key}:context"`, p.context);
  html = setHref(html, `data-preset="${p.key}" data-kind="download"`, `presets/${p.file}`);
  html = setHref(html, `data-preset="${p.key}" data-kind="regex"`, `regex/${p.bundle}`);
}
html = setText(html, 'data-total="regex"', presets.reduce((n, p) => n + p.regex.length, 0));

// Janitor.AI prompts: show each one's length, since Janitor's prompt boxes have limits.
for (const j of config.janitor ?? []) {
  if (!existsSync(join(root, j.file))) continue;
  const chars = [...read(j.file)].length.toLocaleString("en-US");
  html = setText(html, `data-jai-chars="${j.key}"`, `${chars} characters`);
}

if (fetchVersions) {
  for (const ext of config.extensions) {
    const url = `https://raw.githubusercontent.com/howardsierra/${ext.repo}/HEAD/${ext.file}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { version } = await res.json();
      if (version) html = setText(html, `data-ext="${ext.repo}"`, `v${version}`);
    } catch (err) {
      console.warn(`! Could not read ${ext.repo} version (${err.message}); keeping the current one.`);
    }
  }
}
write("index.html", html);

const table = [
  "| Preset | Host | Best for | Prompts | Regex |",
  "| --- | --- | --- | --- | --- |",
  ...presets.map((p) =>
    `| [**${p.title}** v${p.version}](presets/${p.file}) | ${p.host} | ${p.bestFor} | ${p.prompts} | [${p.regex.length} scripts](regex/${p.bundle}) |`),
].join("\n");
write("README.md", read("README.md").replace(
  /<!-- presets:start -->[\s\S]*?<!-- presets:end -->/,
  `<!-- presets:start -->\n${table}\n<!-- presets:end -->`));

// ---------- previews ----------
// Runs previews/samples/<key>.txt through that preset's own regex scripts, the way
// SillyTavern does for AI output, and writes previews/<key>.html.

function parseRegex(str) {
  const m = str.match(/^\/([\s\S]+)\/([dgimsuvy]*)$/);
  return m ? new RegExp(m[1], m[2]) : new RegExp(str);
}

function applyScripts(text, scripts, macros) {
  for (const s of scripts) {
    // AI-output scripts that change what's displayed (not prompt-only ones).
    if (s.disabled || s.promptOnly || !s.placement?.includes(2) || !s.findRegex) continue;
    let re;
    try { re = parseRegex(s.findRegex); } catch { continue; }
    text = text.replace(re, (...args) => {
      const hasGroups = typeof args[args.length - 1] === "object";
      const named = hasGroups ? args[args.length - 1] : {};
      const groups = args.slice(0, hasGroups ? -3 : -2);
      let out = s.replaceString.replace(/\{\{match\}\}/gi, "$0");
      out = out.replace(/\$(\d+)|\$<([^>]+)>/g, (_, n, name) => {
        let v = n !== undefined ? groups[Number(n)] ?? "" : named?.[name] ?? "";
        for (const t of s.trimStrings ?? []) if (t) v = v.split(t).join("");
        return v;
      });
      return out;
    });
  }
  return text.replace(/\{\{(char|user)\}\}/gi, (_, k) => macros[k.toLowerCase()]);
}

// A small stand-in for SillyTavern's markdown pass: paragraphs, line breaks, *italics*, **bold**.
const BLOCK = /^\s*<(div|details|table|section|figure|ul|ol|hr|h\d|blockquote|p|center|!--)/i;
function format(text) {
  return text.trim().split(/\n\s*\n/).map((block) => {
    if (BLOCK.test(block)) return block;
    const inline = block
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*\w])\*([^*\n]+)\*(?=[^*\w]|$)/g, "$1<em>$2</em>")
      .replace(/\n/g, "<br>");
    return `<p>${inline}</p>`;
  }).join("\n");
}

const page = (p, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${p.title} preview</title>
<!-- Generated by scripts/build.mjs from previews/samples/${p.key}.txt. Edit the sample, not this file. -->
<style>
  html { background: #16161a; }
  body { margin: 0; padding: 16px; color: #dcdcd2; font: 15px/1.6 "Noto Sans", Inter, system-ui, sans-serif; }
  .mes { display: flex; gap: 12px; max-width: 760px; margin: 0 auto; padding: 14px; border-radius: 12px; background: #1f1f25; border: 1px solid #2c2c34; }
  .avatar { flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; background: #2a2a33; }
  .main { flex: 1; min-width: 0; }
  .name { font-weight: 600; color: #f0eee8; }
  .name small { margin-left: 8px; font-weight: 400; font-size: 12px; color: #8b8b95; }
  .mes_text { margin-top: 4px; overflow-wrap: anywhere; }
  .mes_text p { margin: 0 0 .85em; }
  .mes_text em { color: #b9b4a8; }
  .mes_text q, .mes_text q::before, .mes_text q::after { content: none; }
  .mes_text::after { content: ""; display: block; clear: both; }
  @media (max-width: 480px) { body { padding: 8px; } .mes { padding: 10px; gap: 8px; } .avatar { width: 34px; height: 34px; font-size: 18px; } }
</style>
</head>
<body>
<div class="mes">
  <div class="avatar" aria-hidden="true">${p.persona.avatar}</div>
  <div class="main">
    <div class="name">${p.persona.char}<small>${p.title.replace(/^\S+\s/, "")} v${p.version}</small></div>
    <div class="mes_text">
${body}
    </div>
  </div>
</div>
</body>
</html>
`;

for (const p of presets) {
  const sample = `previews/samples/${p.key}.txt`;
  if (!existsSync(join(root, sample))) continue;
  const macros = { char: p.persona.char, user: p.persona.user };
  write(`previews/${p.key}.html`, page(p, format(applyScripts(read(sample), p.regex, macros))));
}

console.log(changed.length ? `Updated:\n  ${changed.join("\n  ")}` : "Everything is already up to date.");
