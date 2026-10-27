# Roleplay Resources

SillyTavern extensions, Chat Completion presets, and regex bundles by **Sierra** ([@howardsierra](https://github.com/howardsierra)).

> 🌐 Prefer browsing? This repo also serves a one-page site via GitHub Pages: **https://howardsierra.github.io/Roleplay-Resources/**

---

## ✦ Reverie: my own frontend

[**Reverie**](https://github.com/howardsierra/roleplay-frontend-personal) is a self-hosted roleplay frontend that looks good on phones and computers and needs very little setup.

- **Phone-first.** Works in a phone browser and installs to your home screen.
- **Compatible with what you already have.** SillyTavern character cards, chat-completion presets (including the ones below), themes, lorebooks, regex scripts, chats, and third-party extensions, plus Lumiverse "Loom" presets and extensions. Offstage, Wardrobe, Surtitle, Context Lens, and Extension Organizer are tested working, and Preset Organizer and Prompt Checkboxes are built in.
- **Agents (new).** Helper AIs that run around your replies, switched on per story, optionally on their own cheaper model:
  - **Narrative Director:** a 🧭 *Push story* button that advances the threads or adds a random event
  - **Secret Plot:** a hidden long-term arc it quietly steers toward, which you can peek at and edit
  - **Prose Guardian:** removes banned words, clichés, and repetition from each reply
  - **Continuity Checker:** lists slips as a checklist of fixes
  - **Trackers:** editable, lockable world, character, quest, inventory, and relationship state
  - **Choices:** tappable "what you do next" options
  - **Lorebook Keeper:** suggests lore entries for you to approve
  - **Echo Chamber:** a pretend live audience in a floating feed
- **Regenerate with a note, Branch & send, and preset options.** Tell a regeneration what to change, edit an earlier message onto a new branch, and expose `{{var::name}}` prompt variables as sliders, dropdowns, and switches.
- **Live replies.** HTML, CSS, JavaScript, and Python blocks run inside messages as sandboxed mini-apps.
- **Story tools.** Scene lighting that follows the story, and "Previously on…" recaps when you come back.
- **Built-in Persona Manager and Avatar Banner,** ported from the SillyTavern extensions and reading their saved data.
- **Backups.** One-file backups of everything, plus snapshots to merge or restore.
- **Image generation.** Pollinations, NovelAI, ComfyUI, OpenAI, Gemini, and more, with inline `<pic>` tags the model can write.
- **No database or build step.** Runs on Node.js 20+ and stores everything as plain files. Deploy it on Railway, with Docker, on your computer, or on an Android phone with Termux ([how to run it](https://github.com/howardsierra/roleplay-frontend-personal#run-it)).

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
| [**Roleplay Housing**](https://github.com/howardsierra/roleplayhousing) | Keeps track of where everyone lives: home type, location, a room-by-room layout, and amenities. Reads them from the card, fleshes out a home from one sentence, and feeds it to the model every turn. |
| [**Guided Gens SI**](https://github.com/howardsierra/guidedgens-si) | Four in-character buttons: Impersonate, Respond, Swipe, and Correct. Steer the next message from your input box while keeping each speaker's voice. |
| [**Surtitle**](https://github.com/howardsierra/SillyTavern-surtitle) | English surtitles under foreign-language lines (Japanese, Russian, Old Norse, even Runic) without replacing the original text. |
| [**LoreLink**](https://github.com/howardsierra/LoreLink) | Pairs global lorebooks with specific characters, so your fantasy worldbook stops firing in your modern-day chats. |
| [**Revamped Image Gen**](https://github.com/howardsierra/revampedimagegen) | Inline image and video generation with a mobile-first Studio panel: a real queue, a gallery, character reference photos, a model picker, and a Diagnose tool. Powers CALLBOARD's Stills Department. Based on notsosillynotsoimages by aceenvw. |

### Prompt & preset tools

| Extension | What it does |
| --- | --- |
| [**CALLBOARD Suite**](https://github.com/howardsierra/CALLBOARD) | A stage manager's control board for the CALLBOARD preset: pick-one bands, per-module token costs, a checker with one-click fixes, 16 starter loadouts, per-chat pins, `/cb` slash commands, and a 🎨 Studio for Pollinations images with a key that stays on your device. |
| [**Preset Organizer**](https://github.com/howardsierra/preset-manager) | Collapsible sections, search, and bulk toggles for the Chat Completion prompt manager, plus a grid-style Preset Navigator. |
| [**Prompt Checkboxes**](https://github.com/howardsierra/prompt-checkboxes) | Replaces the prompt manager's on/off toggle icon with a real checkbox. A UI-only swap. |
| [**Context Lens**](https://github.com/howardsierra/contextlens) | A context-window dashboard: how much of the prompt budget is used (with a reply reserve), per-category token bars, the lorebook entries that fired, where truncation cut off, and a fill trend. Works on phones. |

### Interface

| Extension | What it does |
| --- | --- |
| [**Encore**](https://github.com/howardsierra/SillyTavern-Encore) | A floating, draggable regenerate button. Tap to reroll; hold for swipe, continue, or stop. Great on mobile. |
| [**Character Grid**](https://github.com/howardsierra/Character-Grid) | An image-first home screen: a portrait grid ordered by each character's latest chat, where you can browse, open, rename, and delete chats. Based on Ace Character Grid by aceenvw. |
| [**Extension Organizer**](https://github.com/howardsierra/ExtensionOrganizer) | Sorts the Extensions panel by type automatically, color-codes each drawer, and adds search, pins, and categories. |

---

## 🎭 Presets

Chat Completion presets, tuned for Claude. Each has a hostess character who narrates and, if you let her, comments.

<!-- presets:start -->
| Preset | Host | Best for | Prompts | Regex |
| --- | --- | --- | --- | --- |
| [**🌹 Rosie Full Bloom** v2.7](presets/Rosie_Full_Bloom_v2.7.json) | Rosie, a fangirly creative-writing mascot | Everything: romance, dark romance, horror, mystery, cozy. Prose Wardrobe styles, Writer's Room lenses, info boards and status reports. | 140 | [34 scripts](regex/Rosie_regex_bundle.json) |
| [**🥀 The Velvet Vigil** v3.2.2](presets/The_Velvet_Vigil_v3.2.2.json) | Vesper, a night-archivist | Gothic and literary storytelling. Voice and genre picks, story systems, diegetic HTML visuals, and Loom Mode. | 107 | [8 scripts](regex/Velvet_Vigil_regex_bundle.json) |
| [**💌 LOVESICK** v1.4.1](presets/LOVESICK_v1.4.1.json) | Juno, a romance editor with a matchmaker's god complex | Modern-day romance and heat. Trope picks, a heat dial, Screenlife visuals (texts, group chat, delulu meter), and an Assistant Mode. | 78 | [12 scripts](regex/LOVESICK_regex_bundle.json) |
| [**📋 CALLBOARD** v1.6.1](presets/CALLBOARD_v1.6.1.json) | Xavi, your stage manager | Fourteen setting "wings" (Modern, Y2K, Regency, Westeros, Wuxia, Cyberpunk, Sci-Fi…), Cue Calls, The Program, trackers, model correction layers, the 📸 Stills Department and 🖥️ Pure HTML mode, and panels for Twitch, Discord, X, Reddit, the press, a dating app, a browser, Instagram, private photos, a creator page, and a K-pop fan platform. | 160 | [167 scripts](regex/CALLBOARD_regex_bundle.json) |
| [**📋 CALLBOARD Lite** v1.6.1](presets/CALLBOARD_Lite_v1.6.1.json) | Xavi, your stage manager | The same show in about 3k tokens instead of 14.2k: every wing at full strength, merged charters, compact Cue Calls and Program, and the same panels, including the v1.5 apps. For cheaper models, small context windows, and long chats. | 110 | [167 scripts](regex/CALLBOARD_regex_bundle.json) |
<!-- presets:end -->

Every preset ships a **Read Me** prompt at the top of its list (disabled, so it's never sent to the model) with a quick start.

### Installing a preset

1. Download the `.json` from [`presets/`](presets/).
2. In SillyTavern, open **AI Response Configuration** (the sliders icon), set the API to Chat Completion, and click **Import preset**.
3. Follow the preset's Read Me prompt to choose your toggles.

### Regex

Each preset already carries its regex scripts inside it. Recent SillyTavern versions offer to import them with the preset. If yours doesn't, or you want them separately, grab the matching bundle from [`regex/`](regex/) and import it under **Extensions → Regex → Import**.

The visual modules (boards, trackers, chat panels, Loom / Signal Mode) need these regexes to render. Without them, leave those modules off.

**What does each regex do?** See the [Regex Guide](regex/README.md) ([on the site](https://howardsierra.github.io/Roleplay-Resources/regex.html)). It covers all of them, with the tag that triggers each one.

---

## Repository layout

```
presets/   Chat Completion presets (import in AI Response Configuration)
regex/     Regex bundles pulled from each preset, plus the Regex Guide (README.md)
janitor/   Janitor.AI setting prompts, plus add-on modules
previews/  "See it in action" previews; edit samples/, not the .html files
assets/    Social preview image (og-image.png) and its source
scripts/   build.mjs, which keeps everything in sync; regex-notes.json, the guide's blurbs
regex.html The Regex Guide page
index.html The GitHub Pages site
```

### Keeping things in sync

You don't need to edit the site or README by hand when you update something. A GitHub Action runs `scripts/build.mjs` on every push and once a week. It:

- picks the newest version of each preset in `presets/` (by the `_v1.2.3` in the file name) and points the download buttons at it
- rebuilds that preset's regex bundle and updates its prompt, regex and context counts
- re-renders the "See it in action" previews through the preset's own regex scripts
- refreshes each extension's version number from its repo
- updates the Janitor prompts' character counts
- rebuilds the Regex Guide from `scripts/regex-notes.json`, and warns in the log about any regex that doesn't have a blurb yet

To ship a new preset version, upload the new file to `presets/` (for example `LOVESICK_v1.5.0.json`). You can delete the old one or keep it around. To run the script yourself: `node scripts/build.mjs --fetch` (needs Node 20+).
