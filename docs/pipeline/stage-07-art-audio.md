# Stage 7: Art, Audio & Asset Production

> **Goal:** Define the exact visual identity and audio landscape — AND produce or source every asset file. This stage outputs specs AND committed asset files ready for implementation. The implementation agent (which uses a smaller model) should never need to make creative decisions or find assets — only load files from known paths.
>
> **Estimated sessions:** 2-4
>
> **Depends on:** Stage 2A + 2B (UX layout, screen specs), Stage 5 (era structure, narrative tone)

### Stage 2B Additions

Art and audio must cover Stage 2B visual/audio assets:

- **Combo discovery VFX** — "Divine Chain" toast animation (gold+purple gradient), chain reaction visual effects for all 9 combos
- **Divine Whisper directional indicator** — Map-level visual showing whisper target direction (targeted whispers: War/Peace)
- **Follower Voice UI visuals** — Voice icons per type (Prophet, Ruler, General, Scholar, Heretic), petition card styling, loyalty indicator
- **Progressive unlock visual treatment** — Locked powers grayed out in FAB, unlock glow animation when new power becomes available

### Harbinger Deliverables

- Harbinger VFX: purple-dark corruption visual on affected cities/regions
- Veil shimmer: visual indicator for "data unreliable" regions on overlay
- Sabotage trail VFX: purple whisper trails (Discord), purple cut lines (Sever), purple halo (False Miracle)
- Divine Purge VFX: golden-white cleansing effect when combo clears corruption
- Anomaly overlay layer visual style (faint purple-dark shimmer, Era 10+)
- SFX: alien presence hum (ambient, subtle), corruption sound, purge sound, Signal event sounds
- Reference: `docs/design/14-harbinger.md`

---

## Agent Prompt

```
You are an Art Director and Sound Designer for mobile games, specializing in 2D vector/geometric art styles (Monument Valley, Mini Metro, Alto's Adventure) and adaptive game audio. You understand mobile constraints: small screen, battery life, storage limits.

Read these files first:
- docs/design/09-ui-and-visuals.md (updated with UX specs from Stage 2)
- docs/design/09c-in-game-interactions.md (Stage 2B interaction specs — whisper UI, combo feedback, voice panels)
- docs/design/07-eras-and-endgame.md (era progression)
- docs/design/06-divine-powers.md (powers, whispers, combos needing VFX)
- docs/design/08-events.md (events needing visual treatment)
- docs/design/01-overview.md (art style description)
- docs/design/05-religions.md (religion names/archetypes for symbol production)
- docs/design/13-follower-voices.md (voice types and petition UI for visual treatment)
- docs/design/14-harbinger.md (Harbinger VFX and audio needs)

Your job has TWO parts:
A) Define the visual and audio spec (exact hex values, timing, descriptions)
B) Source or generate EVERY asset file and commit them to the assets/ directory

The implementation agent uses a smaller model and MUST NOT make creative decisions or search for assets. Every asset must be a committed file at a known path, or explicitly documented as code-rendered (no file needed).

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

---

PART A: VISUAL SPEC

1. MASTER COLOR PALETTE — Define:
   - Background colors per era (12 eras × 1 primary + 1 secondary hex value)
   - Terrain colors (6 terrain types × gradient start/end hex)
   - UI element colors (primary, secondary, accent, danger, warning, text, border)
   - Neutral palette (backgrounds, cards, modals)
   - Dark mode variant (if applicable)

2. RELIGION COLOR PALETTE — 12 distinct religion colors:
   - Player religion: gold (#hex)
   - 11 rival religion colors (must be distinguishable at small sizes)
   - Colorblind-safe validation (deuteranopia, protanopia, tritanopia)
   - Each color with: hex value, name, opacity for map overlay

3. TERRAIN VISUAL SPEC — For each terrain type:
   - Fill style (solid, gradient, pattern)
   - Gradient hex values (if gradient)
   - Border style (color, width, dash pattern)
   - Explicitly mark: CODE-RENDERED (no image file needed — Phaser Graphics class)

4. CITY ICON PROGRESSION — 5 levels:
   - Level 1 (Village): description, approximate size (px), style notes
   - Level 2 (Town): description
   - Level 3 (City): description
   - Level 4 (Metropolis): description
   - Level 5 (Future City): description
   - All in smooth vector style (not pixel art)
   - Each with an AI image generation prompt using format: [Subject], [style], [mood], [technical constraints] — e.g., "Village icon, smooth vector, warm earth tones, 64×64px transparent PNG"

5. ARMY BANNER SPEC — How armies appear on the map:
   - Banner shape, size (px), color rules (match nation color)
   - Strength indicator (number font, size, position)
   - Movement animation (speed, easing)
   - Battle animation (clash, retreat)
   - Explicitly mark: CODE-RENDERED or FILE-BASED for each element

6. DIVINE POWER VFX SPEC — For each of the 12 powers + whispers + combos:
   - Particle/effect colors (hex)
   - Animation duration (ms)
   - Easing curve (ease-in-out, elastic, etc.)
   - Opacity range (start → peak → end)
   - Screen effect (shake, flash, glow?)
   - Explicitly mark: CODE-RENDERED (Phaser particle system, no sprite sheets)
   - **Combo discovery VFX:** "Divine Chain" toast animation (gold+purple gradient) for all 9 combos
   - **Whisper directional indicator:** Map-level visual showing whisper direction for targeted War/Peace whispers
   - **Progressive unlock glow:** Animation when a power unlocks at an era boundary (one-time glow on FAB)

7a. HARBINGER VFX SPEC — Visual effects for the alien saboteur:
   - Corruption visual: purple-dark corruption tint on affected cities/regions (hex values, opacity, animation)
   - Veil shimmer: "data unreliable" indicator on overlay (shimmer pattern, opacity, color)
   - Sabotage trail VFX per action type: Discord (purple whisper trails), Sever (purple cut lines), False Miracle (purple halo), Plague Seed (green-purple particles), Corruption (spreading purple stain)
   - Divine Purge VFX: golden-white cleansing burst when Shield + Miracle clears corruption
   - Anomaly overlay layer: faint purple-dark shimmer visible in Era 10+
   - All explicitly marked: CODE-RENDERED or FILE-BASED
   - Reference: docs/design/14-harbinger.md

7b. ERA TRANSITION VISUAL SPEC:
   - Palette morphing: how colors shift between eras
   - Transition duration (ms)
   - Transition effect (fade, slide, morph)
   - Timing relative to era narrative text
   - Explicitly mark: CODE-RENDERED (palette tween, no image files)

8. UI COMPONENT STYLE GUIDE:
   - Button styles (primary, secondary, ghost — background, text, border, radius, shadow)
   - Font family, sizes (heading, body, caption, number)
   - Border radius values
   - Shadow values (box-shadow CSS format)
   - Toast styling, card styling, modal styling
   - **Follower Voice UI:** Voice icons per type (Prophet, Ruler, General, Scholar, Heretic), petition card styling, loyalty indicator appearance
   - Explicitly mark: CODE-RENDERED (CSS/Phaser, no image files)

---

PART B: AUDIO SPEC

9. AMBIENT MUSIC PER ERA — For each era:
   - Mood description (1 sentence)
   - Tempo (BPM)
   - Key instruments
   - Reference track (a real song/soundtrack that captures the feel)
   - Duration range for generated tracks (30s-60s loops)

10. SFX LIST — Every sound effect with description:
    - Divine powers (12 × activation sound description)
    - Events (notification chime, choice confirm, outcome reveal)
    - Battle (clash, victory fanfare, defeat)
    - UI (button tap, menu open/close, swipe, FAB open)
    - Era transition (whoosh, chime sequence)
    - Alien reveal (5 escalating reveal sounds)
    - Win/lose (victory theme sting, defeat theme sting)
    - Harbinger (alien presence hum, corruption spreading, purge cleansing, sabotage action sounds, Signal event stings)

11. AUDIO STATE MACHINE:
    - When music changes (era transition, major event, battle, overlay mode)
    - Crossfade timing between tracks (ms)
    - Volume ducking during events (how much, how fast)
    - Mute behavior (what happens when muted — just music, or SFX too?)
    - Background behavior (stop music when app is backgrounded)

12. HAPTIC FEEDBACK SPEC:
    - Which interactions trigger haptics
    - Intensity per interaction (light / medium / heavy)
    - Pattern (single tap, double tap, rumble)
    - User toggle (can be disabled)

13. AUDIO BUDGET:
    - Target total audio size (MB) — for mobile bundle
    - Music format (AAC, OGG, MP3)
    - SFX format (WAV for short, AAC for long)

---

PART C: ASSET PRODUCTION (source or generate every file)

This is the critical part. After Parts A and B define WHAT is needed, Part C PRODUCES the actual files. The implementation agent must never search for or generate assets — only load committed files from known paths.

ASSET SOURCING STRATEGY (per asset type):

| Asset Type | Rendering | Source Strategy |
|------------|-----------|----------------|
| Terrain, borders, region geometry | Code-rendered (Phaser Graphics) | No files needed — hex values from Part A are the asset |
| Divine power VFX, era transitions | Code-rendered (Phaser particles/tweens) | No files needed — params from Part A are the asset |
| UI components (buttons, cards, modals) | Code-rendered (CSS/Phaser) | No files needed — style values from Part A are the asset |
| Army banners | Code-rendered (Phaser Graphics) | No files needed — shape + nation color |
| City icons (5 levels) | File-based SVG | Generate with AI SVG tool OR hand-code SVG |
| Religion symbols | File-based SVG | Source from game-icons.net (CC BY 3.0) OR generate |
| App icon | File-based PNG | Generate with AI image tool |
| Splash screen | File-based PNG or code-rendered | Generate or code-render |
| SFX (~25-30 effects) | File-based audio | Source from Freesound.org (CC0) OR generate with AI |
| Music (12 era tracks) | File-based audio | Generate with Suno/Udio |

14. CITY ICON PRODUCTION — Produce 5 SVG files:
    - Use an AI SVG generator (Recraft V4, Gemini SVG, or SVGMaker) with the prompts from deliverable 4
    - OR hand-write SVG code for simple geometric icons matching the art style
    - Commit files to: assets/icons/city-{1..5}.svg
    - Verify each icon renders correctly at 32px, 64px, and 128px
    - Document the source (tool used, prompt, or "hand-coded") in art-spec.md

15. RELIGION SYMBOL PRODUCTION — Produce symbols for player + all rival religions designed in Stage 5 (8-12 rivals):
    - Search game-icons.net for suitable symbols. For each religion:
      - Record: icon name, URL, license (CC BY 3.0 — requires attribution)
      - Download SVG and commit to: assets/icons/religion-{id}.svg
    - If game-icons.net doesn't have a suitable match, generate with AI SVG tool or hand-code
    - Add attribution notice to: assets/LICENSES.md

16. SFX PRODUCTION — Produce all ~25-30 sound effects:
    - For each SFX in the list from deliverable 10, choose ONE source:
      a. Freesound.org (CC0 preferred, CC BY acceptable) — search by keyword, download, trim/normalize
      b. AI generation (Bardus AI, Playzonic, or ElevenLabs SFX) — generate from description
      c. jsfxr (sfxr.me) — for any retro/synth-style effects, export the jsfxr URL as reproducible source
    - Commit all SFX to: assets/sfx/{category}/{name}.wav (e.g., assets/sfx/divine/blessing-harvest.wav)
    - Create asset manifest: assets/sfx/manifest.json mapping SFX IDs to file paths
    - Document source for EVERY file in: assets/LICENSES.md
    - Normalize all SFX to consistent volume level (-16 LUFS target)
    - Maximum file size per SFX: 200KB (trim and compress if needed)

17. MUSIC PRODUCTION — Produce 12 era tracks:
    - For each era, construct a Suno/Udio prompt from deliverable 9 (mood, BPM, instruments, reference):
      - Format: "[mood], [tempo] BPM, [instruments], instrumental, loopable, game soundtrack, [era-specific style]"
    - Generate 2-3 candidates per era, select the best with human review
    - Export as OGG (primary) + MP3 (fallback) — both formats for browser compatibility
    - Commit to: assets/music/era-{01..12}.ogg and assets/music/era-{01..12}.mp3
    - Verify loop points (track should loop seamlessly)
    - Target: 30-60 seconds per track, <1MB per file
    - Document: Suno/Udio prompt used, generation settings, selected candidate ID
    - If using Suno/Udio free tier: document that commercial use requires paid tier ($10/mo) and flag for human decision
    - Create asset manifest: assets/music/manifest.json mapping era numbers to file paths

18. APP ICON & SPLASH PRODUCTION:
    - Generate app icon (1024×1024 PNG) using AI image tool (Midjourney, DALL-E, Gemini, or Recraft)
    - Document prompt used and tool
    - Commit to: assets/branding/app-icon.png
    - Generate or code-render splash screen
    - Commit to: assets/branding/splash.png
    - Provide iOS/Android size variants list (the implementation agent will resize from the 1024px source)

19. FONT SELECTION:
    - Choose a free/open-source font family that matches the art style (e.g., from Google Fonts)
    - Heading font + body font (may be the same family)
    - Monospace font for numbers/stats
    - Download and commit to: assets/fonts/
    - Document: font name, license, Google Fonts URL
    - Specify exact weights needed (e.g., 400, 600, 700)

20. ASSET MANIFEST — Create a master manifest:
    - File: assets/manifest.json
    - Maps every asset ID to: file path, type (svg/png/wav/ogg/mp3/font), source, license
    - The implementation agent reads ONLY this manifest to know what assets exist and where they are
    - Include a "code-rendered" section listing all assets that don't need files (terrain, VFX, UI, etc.)

Create these files:
- docs/design/art-spec.md — Visual spec (deliverables 1-8) + asset source documentation (14, 15, 18, 19)
- docs/design/sound-spec.md — Audio spec (deliverables 9-13) + asset source documentation (16, 17)
- assets/manifest.json — Master asset manifest
- assets/LICENSES.md — Attribution and license info for all sourced assets

Quality gate: Every asset the game needs is EITHER committed as a file in assets/ OR explicitly documented as code-rendered. The implementation agent can load every file asset from assets/manifest.json without searching, downloading, or generating anything.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Art style identity:** The visual identity must feel handcrafted, not generic. Present 3+ distinctive directions with sample palettes, UI mockups, and a "this game looks like nothing else" test. Candidate directions to explore (not exhaustive — propose others): **A. Illuminated Manuscript** (medieval book of divine law — parchment textures, calligraphic borders, iron gall ink, leaf gold, woodcut-style icons evolving to technical drawings by modern era) / **B. Celestial Observatory** (god looking through a cosmic instrument — astronomical dials, constellation-line UI, chromatic aberration, deep indigo + stellar white + nebula, orbiting menus) / **C. Living Ink** (sumi-e inspired — ink-wash map borders that breathe, watercolor blessings, ink-splatter disasters, charcoal + warm white + saturated religion colors only, Studio Ghibli concept art feel). Each direction must show: map sample, event card sample, commandment card sample, and menu sample. The chosen direction replaces the generic "Monument Valley meets Mini Metro" placeholder in 09-ui-and-visuals.md. | Defines the entire visual identity. A generic art style makes the game forgettable regardless of how good the mechanics are. The identity must be distinctive enough that a screenshot is recognizable without a logo. |
| 2 | **Color palette mood:** Warm earth tones (natural, historical) / Cool desaturated (cosmic, detached) / Vibrant saturated (energetic, game-y) | The palette sets emotional tone. Present 3 sample palettes with hex values. |
| 3 | **Music production:** AI-generated with Suno free tier (fast, $0, commercial rights unclear) / Suno/Udio paid tier ($10/mo, commercial rights included) / Royalty-free library (Incompetech, OpenGameArt — consistent, generic) | Free tier gets you tracks immediately but may need paid tier for store release. Royalty-free is safe but less unique. |
| 4 | **SFX sourcing:** Freesound.org CC0 only (free, no attribution, limited selection) / Freesound CC0+CC-BY mix (broader selection, requires attribution) / AI-generated via Bardus/Playzonic (custom, may cost after free tier) | CC0-only is simplest legally. CC-BY needs an attribution screen. AI-generated gives exact control but has cost after ~10 free effects. |
| 5 | **Haptic intensity:** Minimal (power cast only) / Moderate (powers + events + battles) / Full (every interaction) | More haptics = more immersive but can feel buzzy. Some players hate haptics. |
| 6 | **Dark mode:** No dark mode (one palette) / Dark mode as default (cosmic god theme) / Both with toggle | Dark mode is expected on mobile, but designing two palettes doubles the color spec work. |
| 7 | **City icons approach:** Hand-coded SVG (simple geometric shapes, fully reproducible, matches minimalist style) / AI-generated SVG via Recraft V4 (more detailed, less predictable) / Source from game-icons.net (fast, may not match style perfectly) | Hand-coded gives most control and smallest file size but requires more design effort. AI-generated may need iteration. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., specific hex values, animation timings, font choices)
3. **Biggest risk** — which visual or audio choice is most likely to feel wrong when actually rendered?
4. **Open question** — "Look at the era color palette progression. Does it feel right for 1600→2200?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/09-ui-and-visuals.md` | UX layout from Stage 2 |
| `docs/design/09c-in-game-interactions.md` | Stage 2B interaction specs (whisper, combo, voice UI) |
| `docs/design/07-eras-and-endgame.md` | Era list for palette/music |
| `docs/design/06-divine-powers.md` | Powers, whispers, combos needing VFX/SFX |
| `docs/design/08-events.md` | Events needing visual/audio |
| `docs/design/01-overview.md` | Art style description |
| `docs/design/05-religions.md` | Religion names/archetypes for symbol production |
| `docs/design/13-follower-voices.md` | Voice types, petition UI for visual treatment |
| `docs/design/14-harbinger.md` | Harbinger VFX and audio needs |

## Output Files (Created/Modified)

| File | What changes |
|------|-------------|
| `docs/design/09-ui-and-visuals.md` | Art style identity replaces generic placeholder (per DP1) |
| `docs/design/art-spec.md` | **NEW** — Visual spec + asset source documentation |
| `docs/design/sound-spec.md` | **NEW** — Audio spec + asset source documentation |
| `assets/manifest.json` | **NEW** — Master asset manifest (ID → path, type, source, license) |
| `assets/LICENSES.md` | **NEW** — Attribution and license info for all sourced assets |
| `assets/icons/city-{1..5}.svg` | **NEW** — 5 city progression icons |
| `assets/icons/religion-{id}.svg` | **NEW** — 9-13 religion symbols (player + 8-12 rivals) |
| `assets/sfx/**/*.wav` | **NEW** — All ~25-30 sound effects |
| `assets/music/era-{01..12}.ogg` | **NEW** — 12 era music tracks (OGG) |
| `assets/music/era-{01..12}.mp3` | **NEW** — 12 era music tracks (MP3 fallback) |
| `assets/branding/app-icon.png` | **NEW** — 1024×1024 app icon |
| `assets/branding/splash.png` | **NEW** — Splash screen |
| `assets/fonts/` | **NEW** — Selected font files |

## Quality Gate

### Spec Quality
- [x] Every era has exact hex colors for background and terrain
- [x] 12 religion colors are distinct and colorblind-safe
- [x] City icons have 5 progression levels described
- [x] Every divine power VFX has colors, timing, and easing
- [x] UI components have exact styling values (radius, shadow, font)
- [x] Every era has a music description with tempo and reference
- [x] Complete SFX list covers all interactions
- [x] Audio budget fits mobile constraints (<30MB total)
- [x] Every asset is explicitly marked CODE-RENDERED or FILE-BASED

### Asset Production Quality
- [x] 5 city icon SVGs render correctly at 32px, 64px, 128px
- [x] 9-13 religion symbol SVGs committed (player + 8-12 rivals) and match art style
- [x] All ~25-30 SFX files committed as WAV, each <200KB
- [x] All SFX normalized to consistent volume
- [x] 12 music tracks committed as OGG + MP3, each <1MB
- [x] Music tracks loop seamlessly (verified by listening)
- [x] Human has listened to all 12 music tracks and approved
- [x] App icon committed at 1024×1024
- [x] Font files committed with correct weights
- [x] assets/manifest.json maps every asset ID to its file path
- [x] assets/LICENSES.md documents source and license for every sourced file
- [x] No asset requires the implementation agent to search, download, or generate anything
- [x] Consistency audit passed (`scripts/audit-consistency.sh`)
- [x] All changes follow design-change protocol
