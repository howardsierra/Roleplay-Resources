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

// A preset that shares another's regex (CALLBOARD Lite) leaves the bundle to that preset.
for (const p of presets) {
  if (!p.sameRegexAs) write(`regex/${p.bundle}`, JSON.stringify(p.regex, null, 4));
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
html = setText(html, 'data-total="regex"', presets.filter((p) => !p.sameRegexAs).reduce((n, p) => n + p.regex.length, 0));

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

// ---------- regex guide ----------
// scripts/regex-notes.json holds a blurb (and the tag to write) for every regex script.
// This writes regex/README.md and regex.html from it, with badges taken from each
// script's own settings, and warns about scripts that have no notes yet.

const notes = existsSync(join(root, "scripts/regex-notes.json")) ? JSON.parse(read("scripts/regex-notes.json")) : {};
const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function badgesFor(s) {
  const b = [];
  if (s.disabled) b.push("Off by default");
  if (s.promptOnly) b.push("Only changes what the model sees");
  else if (!s.markdownOnly) b.push("Edits the message itself");
  if (s.placement?.includes(1)) b.push("Also runs on your messages");
  return b;
}

// Presets that share another preset's regex (CALLBOARD Lite) are covered by that preset's section.
const guide = presets.filter((p) => !p.sameRegexAs).map((p) => {
  const n = notes[p.key] ?? { intro: "", groups: [] };
  const byName = new Map(p.regex.map((s) => [s.scriptName, s]));
  const described = new Set();
  const groups = n.groups.map((g) => ({
    ...g,
    scripts: g.scripts.filter((e) => byName.has(e.name)).map((e) => {
      described.add(e.name);
      return { ...e, badges: badgesFor(byName.get(e.name)) };
    }),
  })).filter((g) => g.scripts.length);
  const undescribed = p.regex.filter((s) => !described.has(s.scriptName));
  for (const s of undescribed) console.warn(`! ${p.title}: "${s.scriptName}" has no notes in scripts/regex-notes.json yet.`);
  if (undescribed.length) {
    groups.push({
      title: "Not described yet", intro: "",
      scripts: undescribed.map((s) => ({ name: s.scriptName, syntax: "", blurb: "No notes yet.", badges: badgesFor(s) })),
    });
  }
  const sharers = presets.filter((o) => o.sameRegexAs === p.key).map((o) => `${o.title.replace(/^\S+\s/, "")} v${o.version}`);
  const intro = sharers.length ? `${n.intro} ${sharers.join(" and ")} uses exactly the same regex.` : n.intro;
  return { ...p, intro, groups };
});

const md = [
  "# What each regex does",
  "",
  "<!-- Generated by scripts/build.mjs from scripts/regex-notes.json. Edit the notes, not this file. -->",
  "",
  "Every preset ships with regex scripts that turn short tags into styled panels. Here's what each one does, and the tag the model writes to trigger it. You can also browse this on the site: https://howardsierra.github.io/Roleplay-Resources/regex.html",
  "",
  ...guide.map((p) => `- [${p.title}](#${p.key}) (${p.regex.length})`),
  "",
  ...guide.flatMap((p) => [
    `<a id="${p.key}"></a>`,
    `## ${p.title} v${p.version}`,
    "",
    `${p.intro} Bundle: [\`${p.bundle}\`](${p.bundle}).`,
    "",
    ...p.groups.flatMap((g) => [
      `### ${g.title}`,
      "",
      ...(g.intro ? [g.intro, ""] : []),
      ...g.scripts.flatMap((e) => [
        `- **${e.name}**: ${e.blurb}${e.badges.length ? ` _(${e.badges.join(" · ")})_` : ""}`,
        ...(e.syntax ? [`  \`${e.syntax.replace(/`/g, "'")}\``] : []),
      ]),
      "",
    ]),
  ]),
].join("\n");
write("regex/README.md", md);

const accents = { rosie: ["#b8234f", "#f08bb8"], vigil: ["#8f3346", "#e2b05a"], lovesick: ["#c81d68", "#ff7fb0"], callboard: ["#8a6a00", "#f4c430"] };
const guideHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Regex Guide</title>
<meta name="description" content="What every regex script in Sierra's SillyTavern presets does, and the tag that triggers it.">
<!-- Generated by scripts/build.mjs from scripts/regex-notes.json. Edit the notes, not this file. -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎭</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500..800;1,6..96,500..700&family=Cormorant+Garamond:ital,wght@1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --page: #f7f0e6; --page-2: #efe4d4; --ink: #2b1a1d; --muted: #6f5a57; --line: #dccbb4; --card: #fffaf2;
    --gold: #9a6f22; --focus: #c2410c;
    --display: "Bodoni Moda", Georgia, serif; --script: "Cormorant Garamond", Georgia, serif; --body: Inter, system-ui, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --page: #120b0e; --page-2: #1a1014; --ink: #f3e9e0; --muted: #b4a199; --line: #3a2a2c; --card: #1e1418; --gold: #e2b65c; --focus: #fb923c; }
  }
  :root[data-theme="dark"] { --page: #120b0e; --page-2: #1a1014; --ink: #f3e9e0; --muted: #b4a199; --line: #3a2a2c; --card: #1e1418; --gold: #e2b65c; --focus: #fb923c; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; scroll-padding-top: 130px; }
  body { margin: 0; background: var(--page); color: var(--ink); font: 15.5px/1.6 var(--body); -webkit-font-smoothing: antialiased; }
  a { color: inherit; }
  :focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 6px; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 0 16px; }
  header.top {
    color: #fbefd9; text-align: center; padding: 56px 16px 40px;
    background:
      radial-gradient(ellipse 60% 80% at 50% 30%, rgba(255, 226, 170, .25), transparent 70%),
      repeating-linear-gradient(90deg, #4a0c19 0 6px, #6e1426 22px, #8a1c31 34px, #6e1426 46px, #4a0c19 62px);
    border-bottom: 3px solid #c79a45;
  }
  .back { display: inline-block; margin-bottom: 18px; font-size: 13px; color: #f0d9b5; text-decoration: none; }
  .back:hover { text-decoration: underline; }
  header.top h1 {
    margin: 0; font: 700 clamp(2.4rem, 8vw, 4rem)/1 var(--display); letter-spacing: -.02em;
    background: linear-gradient(180deg, #fff6d8, #f2cf7d 50%, #c08a2e); -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  header.top p { margin: 14px auto 0; max-width: 560px; font: italic 500 1.25rem/1.4 var(--script); color: #f6e3c2; }
  nav.bar {
    position: sticky; top: 0; z-index: 5; background: color-mix(in srgb, var(--page) 92%, transparent);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line);
  }
  nav.bar .wrap { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding-top: 12px; padding-bottom: 12px; }
  nav.bar a {
    text-decoration: none; font: 600 13px var(--body); padding: 8px 12px; border-radius: 999px;
    border: 1px solid var(--line); background: var(--card);
  }
  nav.bar a:hover { border-color: var(--gold); }
  nav.bar input {
    flex: 1 1 200px; min-width: 0; font: 14px var(--body); color: var(--ink); background: var(--card);
    border: 1px solid var(--line); border-radius: 999px; padding: 9px 14px;
  }
  .empty { display: none; text-align: center; color: var(--muted); padding: 40px 0; }
  section.preset { padding: 44px 0 8px; }
  .preset > h2 { margin: 0; font: 700 clamp(1.8rem, 5vw, 2.6rem)/1.1 var(--display); color: var(--ink); }
  .preset > h2 small { font: 600 13px var(--body); color: var(--muted); margin-left: 8px; }
  .preset > .intro { margin: 10px 0 0; color: var(--muted); max-width: 720px; }
  .preset > .intro a { color: var(--a); font-weight: 600; }
  h3.group { margin: 30px 0 4px; font: 600 12px var(--body); letter-spacing: .2em; text-transform: uppercase; color: var(--a); }
  .group-intro { margin: 0 0 12px; color: var(--muted); font-size: 14px; }
  ul.scripts { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 10px; }
  .scripts li {
    background: var(--card); border: 1px solid var(--line); border-left: 3px solid var(--a);
    border-radius: 12px; padding: 13px 16px;
  }
  [hidden] { display: none !important; }
  .name { font-weight: 600; }
  .blurb { margin: 3px 0 0; color: var(--muted); font-size: 14.5px; }
  code {
    display: inline-block; margin-top: 8px; max-width: 100%; overflow-x: auto; white-space: pre-wrap; word-break: break-word;
    font: 12.5px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    background: var(--page-2); border-radius: 6px; padding: 4px 8px; color: var(--ink);
  }
  .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .badges span { font: 600 11px/1 var(--body); padding: 5px 8px; border-radius: 6px; background: var(--page-2); color: var(--muted); }
  footer { text-align: center; color: var(--muted); font-size: 13px; padding: 48px 16px 64px; }
  ${guide.map((p) => `#${p.key} { --a: ${accents[p.key]?.[0] ?? "#8f1d33"}; }`).join("\n  ")}
  @media (prefers-color-scheme: dark) {
    ${guide.map((p) => `:root:not([data-theme="light"]) #${p.key} { --a: ${accents[p.key]?.[1] ?? "#e8798f"}; }`).join("\n    ")}
  }
  ${guide.map((p) => `:root[data-theme="dark"] #${p.key} { --a: ${accents[p.key]?.[1] ?? "#e8798f"}; }`).join("\n  ")}
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
</style>
</head>
<body>
<header class="top">
  <a class="back" href="./">← Back to Roleplay Resources</a>
  <h1>Regex Guide</h1>
  <p>What every regex script in the presets does, and the tag that brings it onstage.</p>
</header>
<nav class="bar" aria-label="Presets">
  <div class="wrap">
    ${guide.map((p) => `<a href="#${p.key}">${escHtml(p.title)} <span style="opacity:.6">${p.regex.length}</span></a>`).join("\n    ")}
    <input type="search" id="find" placeholder="Search regexes…" aria-label="Search regexes">
  </div>
</nav>
<main class="wrap">
${guide.map((p) => `  <section class="preset" id="${p.key}">
    <h2>${escHtml(p.title)}<small>v${p.version} · ${p.regex.length} scripts</small></h2>
    <p class="intro">${escHtml(p.intro)} <a href="regex/${p.bundle}" download>Download the bundle</a>.</p>
${p.groups.map((g) => `    <div class="grp">
    <h3 class="group">${escHtml(g.title)}</h3>
${g.intro ? `    <p class="group-intro">${escHtml(g.intro)}</p>\n` : ""}    <ul class="scripts">
${g.scripts.map((e) => `      <li><div class="name">${escHtml(e.name)}</div><p class="blurb">${escHtml(e.blurb)}</p>${e.syntax ? `<code>${escHtml(e.syntax)}</code>` : ""}${e.badges.length ? `<div class="badges">${e.badges.map((b) => `<span>${escHtml(b)}</span>`).join("")}</div>` : ""}</li>`).join("\n")}
    </ul>
    </div>`).join("\n")}
  </section>`).join("\n")}
  <p class="empty" id="none">No regex matches that search.</p>
</main>
<footer>Part of <a href="./">Roleplay Resources</a> by @howardsierra.</footer>
<script>
  const find = document.getElementById("find");
  find.addEventListener("input", () => {
    const q = find.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll(".scripts li").forEach((li) => {
      li.hidden = Boolean(q) && !li.textContent.toLowerCase().includes(q);
      if (!li.hidden) shown++;
    });
    document.querySelectorAll(".grp, section.preset").forEach((el) => {
      el.hidden = !el.querySelector(".scripts li:not([hidden])");
    });
    document.getElementById("none").style.display = shown ? "none" : "block";
  });
</script>
</body>
</html>
`;
write("regex.html", guideHtml);

console.log(changed.length ? `Updated:\n  ${changed.join("\n  ")}` : "Everything is already up to date.");
