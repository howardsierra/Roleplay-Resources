# Roleplay Resources

SillyTavern extensions, Chat Completion presets, and regex bundles by **Sierra** ([@howardsierra](https://github.com/howardsierra)).

> 🌐 Prefer browsing? This repo also serves a one-page site via GitHub Pages: **https://howardsierra.github.io/Roleplay-Resources/**

---

## ✦ Reverie: my own frontend

[**Reverie**](https://github.com/howardsierra/roleplay-frontend-personal) is a self-hosted roleplay frontend that looks good on phones and computers and needs very little setup.

- **Phone-first.** Works in a phone browser and installs to your home screen.
- **Compatible with what you already have.** SillyTavern character cards, chat-completion presets (including the ones below), themes, lorebooks, regex scripts, chats, and third-party extensions, plus Lumiverse "Loom" presets.
- **Live replies.** HTML, CSS, JavaScript, and Python blocks run inside messages as sandboxed mini-apps.
- **Image generation.** Pollinations, NovelAI, ComfyUI, OpenAI, Gemini, and more, with inline `<pic>` tags the model can write.
- **No database or build step.** Runs on Node.js 20+ and stores everything as plain files in one `data/` folder. Deploy it on Railway or run it locally ([how to run it](https://github.com/howardsierra/roleplay-frontend-personal#run-it)).

---

## 🧳 Janitor.AI prompts

Setting prompts for [Janitor.AI](https://janitorai.com). Pick the one your bot lives in and paste it into **API Settings → Custom Prompt**. All of them are 18+.

| Prompt | Setting | Highlights |
| --- | --- | --- |
| [🧁 **Modern**](janitor/modern.md) | Contemporary | Ordinary-first characters, a Media Module for texts, DMs and group chats, and an Explicit Module |
| [🐉 **Fantasy**](janitor/fantasy.md) | High fantasy | Magic with laws and costs, bells and moons, old-style numbers (five-and-twenty) |
| [🏰 **Medieval**](janitor/medieval.md) | Historical | The tongue of the age, letters by rider and herald, consequences that outlive their makers |
| [⚔️ **ASOIAF**](janitor/asoiaf.md) | Westeros | Westerosi vocabulary, ravens and decrees, and a Tension line in the status bar |
| [🎀 **Regency**](janitor/regency.md) | The ton | Forms of address, scandal sheets, and a Reputation tracker |

**Companion:** [Chat Memory module](janitor/modules/chat-memory-module.md). Paste it into the chat's **Chat Memory**. It sets up the guided-novel format and OOC notes in parentheses, and holds the **Intensity dial** the status bar reports (`[INTENSITY: SIMMER | STANDARD | FILTHY | DEPRAVED | TENDER]`, stackable with `+`). It also has an optional block that keeps a diabetic character's Dexcom CGM portrayed accurately; delete it if your character doesn't need it.

**Add-on:** [Opus 4.7 correction layer](janitor/modules/correction-layer-opus-4.7.md). Paste it under any setting when you're running Opus 4.7. It pulls the model back from an elevated literary register to the close, raw voice these prompts are written for.

Every prompt runs in **Impersonate mode** by default, so the model writes your character too. Type `[MANUAL: ON]` to take the pen back and `[MANUAL: OFF]` to hand it over again.

---

## 🧩 Extensions

Install any of these from SillyTavern: **Extensions → Install extension →** paste the repo URL.

### Writing & roleplay

| Extension | What it does |
| --- | --- |
| [**Offstage**](https://github.com/howardsierra/SillyTavern-Offstage) | A private dossier per character: public / private / never-admitted traits, tastes, and an inbox of model-noticed details you approve before they stick. Every fact carries its provenance (canon, established, inferred, emergent, headcanon). |
| [**Wardrobe**](https://github.com/howardsierra/SillyTavern-Wardrobe) | Per-chat persona lore. Give each persona a library of small pieces (backstory, habits, voice) and toggle which ones are true in this chat, without ever editing the persona. |
| [**Guided Gens SI**](https://github.com/howardsierra/guidedgens-si) | Four in-character buttons: Impersonate, Respond, Swipe, and Correct. Steer the next message from your input box while keeping each speaker's voice. |
| [**Surtitle**](https://github.com/howardsierra/SillyTavern-surtitle) | English surtitles under foreign-language lines (Japanese, Russian, Old Norse, even Runic) without replacing the original text. |
| [**LoreLink**](https://github.com/howardsierra/LoreLink) | Pairs global lorebooks with specific characters, so your fantasy worldbook stops firing in your modern-day chats. |

### Prompt & preset tools

| Extension | What it does |
| --- | --- |
| [**Preset Organizer**](https://github.com/howardsierra/preset-manager) | Collapsible sections, search, and bulk toggles for the Chat Completion prompt manager, plus a grid-style Preset Navigator. |
| [**Prompt Checkboxes**](https://github.com/howardsierra/prompt-checkboxes) | Replaces the prompt manager's on/off toggle icon with a real checkbox. A UI-only swap. |
| [**Context Lens**](https://github.com/howardsierra/contextlens) | A context-window dashboard: fill donut, per-category token bars, the lorebook entries that fired, and where truncation cut off. |

### Interface

| Extension | What it does |
| --- | --- |
| [**Encore**](https://github.com/howardsierra/SillyTavern-Encore) | A floating, draggable regenerate button. Tap to reroll; hold for swipe, continue, or stop. Great on mobile. |
| [**Extension Organizer**](https://github.com/howardsierra/ExtensionOrganizer) | Search, pin, sort, and categorize the drawers in the Extensions panel. |

---

## 🎭 Presets

Chat Completion presets, tuned for Claude. Each has a hostess character who narrates and, if you let her, comments.

<!-- presets:start -->
| Preset | Host | Best for | Prompts | Regex |
| --- | --- | --- | --- | --- |
| [**🌹 Rosie Full Bloom** v2.7](presets/Rosie_Full_Bloom_v2.7.json) | Rosie, a fangirly creative-writing mascot | Everything: romance, dark romance, horror, mystery, cozy. Prose Wardrobe styles, Writer's Room lenses, info boards and status reports. | 140 | [34 scripts](regex/Rosie_regex_bundle.json) |
| [**🥀 The Velvet Vigil** v3.2.2](presets/The_Velvet_Vigil_v3.2.2.json) | Vesper, a night-archivist | Gothic and literary storytelling. Voice and genre picks, story systems, diegetic HTML visuals, and Loom Mode. | 107 | [8 scripts](regex/Velvet_Vigil_regex_bundle.json) |
| [**💌 LOVESICK** v1.4.1](presets/LOVESICK_v1.4.1.json) | Juno, a romance editor with a matchmaker's god complex | Modern-day romance and heat. Trope picks, a heat dial, Screenlife visuals (texts, group chat, delulu meter), and an Assistant Mode. | 78 | [12 scripts](regex/LOVESICK_regex_bundle.json) |
| [**📋 CALLBOARD** v1.3.0](presets/CALLBOARD_v1.3.0.json) | Xavi, your stage manager | Modular setting "wings" (Modern, College AU, Y2K, Westeros, Regency, Fantasy…), trackers, model correction layers, and chat panels for Twitch, Discord, X, Reddit, and the press. | 139 | [98 scripts](regex/CALLBOARD_regex_bundle.json) |
<!-- presets:end -->

Every preset ships a **Read Me** prompt at the top of its list (disabled, so it's never sent to the model) with a quick start.

### Installing a preset

1. Download the `.json` from [`presets/`](presets/).
2. In SillyTavern, open **AI Response Configuration** (the sliders icon), set the API to Chat Completion, and click **Import preset**.
3. Follow the preset's Read Me prompt to choose your toggles.

### Regex

Each preset already carries its regex scripts inside it. Recent SillyTavern versions offer to import them with the preset. If yours doesn't, or you want them separately, grab the matching bundle from [`regex/`](regex/) and import it under **Extensions → Regex → Import**.

The visual modules (boards, trackers, chat panels, Loom / Signal Mode) need these regexes to render. Without them, leave those modules off.

---

## Repository layout

```
presets/   Chat Completion presets (import in AI Response Configuration)
regex/     Regex bundles pulled from each preset (import in Extensions → Regex)
janitor/   Janitor.AI setting prompts, plus add-on modules
previews/  "See it in action" previews; edit samples/, not the .html files
assets/    Social preview image (og-image.png) and its source
scripts/   build.mjs, which keeps everything in sync
index.html The GitHub Pages site
```

### Keeping things in sync

You don't need to edit the site or README by hand when you update something. A GitHub Action runs `scripts/build.mjs` on every push and once a week. It:

- picks the newest version of each preset in `presets/` (by the `_v1.2.3` in the file name) and points the download buttons at it
- rebuilds that preset's regex bundle and updates its prompt, regex and context counts
- re-renders the "See it in action" previews through the preset's own regex scripts
- refreshes each extension's version number from its repo
- updates the Janitor prompts' character counts

To ship a new preset version, upload the new file to `presets/` (for example `LOVESICK_v1.5.0.json`). You can delete the old one or keep it around. To run the script yourself: `node scripts/build.mjs --fetch` (needs Node 20+).
