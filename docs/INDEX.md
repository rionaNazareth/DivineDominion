# DIVINE DOMINION — Documentation Index

> **Start here.** This is the single entry point for any agent working on DIVINE DOMINION.
> Read this file first, then follow the routing table to the specific doc you need.

---

## One-Paragraph Summary

DIVINE DOMINION is a god game where you create a religion by choosing 10 commandments, then guide 600 years of civilization from 1600 to 2200 AD. You are the only active God — rival religions have passive deities with hidden rules. Expand through war or peace. Bless your followers or unleash disasters on enemies. Watch armies march, plagues spread, and trade routes form on a smooth vector world map. But the real threat is hidden: an alien invasion is approaching, and humanity must reach space-age technology to survive. Each 4-hour run is one Earth. Lose, and you awaken on another. Built with Phaser 3 + Vite + TypeScript. Mobile-first, pause-friendly.

---

## Glossary

| Term | Definition |
|------|-----------|
| **Commandment** | One of 10 player-chosen rules that define their religion's behavior and modifiers |
| **Earth** | A single playthrough/run. Each Earth is a procedurally generated world. |
| **Era** | One of 12 time periods spanning 1600-2200 AD (~20 real minutes each) |
| **Divine Energy** | Resource (0–20) spent to cast blessings and disasters. Regenerates 1/min. |
| **Blessing** | Positive divine power (harvest, inspiration, miracle, prophet, shield, golden age) |
| **Disaster** | Destructive divine power (earthquake, flood, plague, storm, famine, wildfire) |
| **Divine Overlay** | God's omniscient view showing attack plans, religion pressure, schism risk, etc. |
| **Divine Hypocrisy** | Consequence system when your actions contradict your commandments |
| **Region** | A geographic area on the map, belonging to a nation |
| **Nation** | A political entity with territory, population, military, government, and religion |
| **Rival Religion** | AI-generated faith with visible commandments and hidden divine rules |
| **Hidden Divine Rule** | Invisible mechanic in rival religions that creates emergent "miracles" |
| **Schism** | A split in your religion caused by commandment tension or contradictory actions |
| **Trade Route** | Golden line connecting trading cities — carries wealth, tech, religion, and disease |
| **Science Milestone** | Global technology achievement (11 total, from Printing Press to Defense Grid) |
| **Defense Grid** | The planetary defense system needed to repel the alien invasion (win condition) |
| **Harbinger** | Transmitted alien intelligence (not a god). Advance scout of the fleet. Sabotages humanity from Era 7+. Adaptive AI with 6 actions. |
| **Signal Strength** | The Harbinger's resource. Grows with time (fleet proximity), not player actions. Budget: 3 (Era 7) → 25 (Era 12). |
| **Veil** | Harbinger sabotage action that hides a region's true overlay state. Shows "⚠ Data unreliable" indicator. |
| **Divine Purge** | Power combo: Shield of Faith + Miracle on a corrupted region. Removes Harbinger corruption + immunizes for 1 era. |
| **Alien Fleet** | Hidden threat approaching Earth — arrival at ~2200 AD. Sent the Harbinger ahead as advance scout. |
| **Multiverse** | The meta-frame: infinite Earths, your God travels between them on death |
| **FAB** | Floating Action Button — dual-arc contextual power menu on the phone UI |
| **Divine Whisper** | Free micro-nudge (war, peace, science, faith) cast on a region via the bottom sheet. 0 energy, 30s cooldown. |
| **Power Combo** | Chain reaction when a divine power interacts with a specific world state (e.g., Earthquake + army = scatter). 9 at MVP (8 standard + Divine Purge). |
| **Follower Voice** | Named character (Prophet, Ruler, General, Scholar, Heretic) who emerges from the simulation and petitions the player |
| **Petition** | A Follower Voice's request for divine intervention. Expire after 90s if unanswered. |
| **Prayer Counter** | HUD badge showing pending petition count. Tap to pan to nearest petitioning voice. |
| **Progressive Power Unlock** | Powers unlock era-by-era (2 at start → 12 by Era 6), managing early-game complexity |
| **Smart Context FAB** | FAB curates 3–4 most relevant powers from the unlocked set, based on nearby world state |
| **Development (Dev)** | A nation's technology/infrastructure level (1-12) |
| **Commander** | Named army leader with a trait (aggressive, cautious, brilliant, reckless) |
| **Tension Pair** | Two conflicting commandments that increase schism risk when both selected |
| **God Profile** | Lifetime stats across all Earths (total wins, losses, interventions, etc.) |
| **Archetype** | One of 3 starter packs (Shepherd, Judge, Conqueror) for first-time commandment selection |
| **Nation AI Personality** | One of 5 archetypes (aggressive, defensive, expansionist, isolationist, balanced) determining a nation's decision weights |
| **Event Template** | Pre-authored event with variable slots, trigger conditions, weight formula, and 2-3 player choices. 80 total across 8 categories. |
| **Batch Summary** | JSON verification artifact for each group of 10 events during Stage 5 content production |
| **Theocracy** | Government type where religion controls the state; boosts faith spread +30%, reduces economy/development |
| **Military Junta** | Government type focused on military power; +40% military, but low development and happiness, cannot form alliances |
| **Stability** | Nation stat (0.0–1.0) that decays during war and recovers in peace; low stability triggers revolutions |
| **War Weariness** | Nation stat (0.0–1.0) that grows during war; pushes nations toward suing for peace |
| **War Score** | Weighted formula that determines whether a nation AI declares war (threshold: 0.60) |
| **Religion Merge** | When two similar religions (7+ shared commandments) in proximity combine into one |
| **Religion Reform** | When a religion changes 2 commandments under crisis conditions |
| **Hidden Rule Condition** | One of 11 typed conditions that trigger a rival religion's hidden divine rule |
| **Hidden Rule Effect** | One of 9 typed effects that activate when a hidden rule's condition is met |
| **Divine Eye** | Overlay toggle at the FAB apex — opens the Divine Overlay view |
| **Earth History** | In-game record of each run: commandments chosen, pivotal moments, achievements |
| **Pivotal Moment** | Key event (war, schism, miracle, etc.) auto-logged to the Earth History timeline |
| **Anomaly Overlay** | Era 10+ overlay layer showing Harbinger influence and corruption on the map |
| **Era Transition** | Narrative summary displayed when crossing an era boundary |

---

## Project Structure

```
ai-game/
├── scripts/                       ← Automation scripts
│   └── audit-consistency.sh       ← Cross-stage consistency audit (run after every stage)
├── docs/                          ← YOU ARE HERE
│   ├── INDEX.md                   ← This file (start here)
│   ├── design/                    ← Game design (split from GDD)
│   │   ├── 01-overview.md         ← Elevator pitch, pillars, core loop
│   │   ├── 02-narrative.md        ← Intros, endings, alien reveal, Harbinger narrative
│   │   ├── 02b-era-narratives.md  ← Era transition templates (12 eras × 3 fills)
│   │   ├── 03-commandments.md     ← The 10 Commandments system (core innovation)
│   │   ├── 04-world.md            ← World gen, nations, armies, disease, trade
│   │   ├── 05-religions.md        ← Rival religions, passive Gods, hidden rules
│   │   ├── 05b-religions-premade.md ← 10 pre-made rival religions (Stage 5)
│   │   ├── 06-divine-powers.md    ← Energy, blessings, disasters, hypocrisy
│   │   ├── 07-eras-and-endgame.md ← Time scale, 12 eras, alien clock, science
│   │   ├── 08-events.md           ← Procedural event system, templates, choices
│   │   ├── 09-ui-and-visuals.md   ← Art style, phone layout, living map, overlay
│   │   ├── 09b-ux-flows.md        ← Screens, menus, settings, tutorial, 2B handoff
│   │   ├── 09c-in-game-interactions.md ← HUD, FAB, events, bottom sheet, overlay, whispers, combos, voices
│   │   ├── 10-llm-integration.md  ← LLM role, prompts, call budget, fallbacks
│   │   ├── 11-tech.md             ← Tech stack, project structure, testing
│   │   ├── 12-scope-and-risks.md  ← MVP checklist, timeline, risks
│   │   ├── 13-follower-voices.md  ← Follower Voices system, petitions, lifecycle
│   │   ├── 14-harbinger.md       ← The Harbinger: alien saboteur AI, Signal Strength, counter-play
│   │   ├── constants.md           ← ALL numerical values in one place
│   │   ├── formulas.md            ← [Stage 3 output] All simulation formulas
│   │   ├── event-index.json       ← [Stage 5 output] Master event index (80 events)
│   │   ├── monte-carlo-scenarios.json ← [Stage 6 output] 20 executable balance scenarios
│   │   ├── art-spec.md            ← [Stage 7 output] Visual identity, palettes, VFX
│   │   ├── sound-spec.md          ← [Stage 7 output] Music, SFX, haptics spec
│   │   ├── test-spec.md           ← [Stage 8 output] Test specs, invariants, playtest framework
│   │   └── ship-readiness.md      ← [Stage 9 output] Store listing, analytics, privacy
│   ├── implementation/
│   │   ├── OVERVIEW.md            ← Setup, architecture, session map, testing strategy
│   │   ├── phase-0.md             ← Foundation (project setup, types, config, PRNG)
│   │   ├── phase-1.md             ← Simulation engine master (all 16 tasks)
│   │   ├── phase-1a-world-systems.md ← Session 2: world gen, nation, nation AI, religion, commandments, disease, trade
│   │   ├── phase-1b-military.md   ← Session 3: army, battle
│   │   ├── phase-1c-divine.md     ← Session 4: events, science, divine, whispers, combos
│   │   ├── phase-1d-characters-runner.md ← Session 5: runner, voices, harbinger + boundary + integration
│   │   ├── phase-2.md             ← Map rendering (Phaser/PixiJS)
│   │   ├── phase-3.md             ← UI & scenes (3.1–3.8 Session 7, 3.9–3.15 Session 8)
│   │   ├── phase-4.md             ← Integration (LLM, audio, persistence)
│   │   ├── phase-5.md             ← Content (commandments, events, 10 religions)
│   │   ├── phase-6.md             ← Polish (balance, sharing, mobile deploy)
│   │   └── phase-7.md             ← Playtest harness (7.1–7.4 Session 12, 7.5–7.8 Session 13)
│   ├── session/                   ← Session handoff summaries (created during implementation)
│   ├── wireframes/                ← Interactive HTML wireframes
│   │   ├── commandment-selection.html
│   │   ├── fab-overlay-combos.html
│   │   ├── overlay-activation.html
│   │   ├── first-session-flow.html
│   │   └── combo3-labeled.html
│   └── pipeline/                  ← DESIGN PRODUCTION PIPELINE
│       ├── INDEX.md               ← Pipeline overview, checklist, run order
│       ├── CHANGELOG.md           ← Pipeline change log
│       ├── stage-01-game-director.md  ← Vision lock, FTUE, retention, kill list
│       ├── stage-02a-screens.md       ← Menus, settings, store, history, tutorial, loading
│       ├── stage-02b-interactions.md  ← HUD, FAB, events, overlays, map, accessibility
│       ├── stage-03-systems.md        ← All simulation formulas, tick order
│       ├── stage-04-world-ai.md       ← World gen algorithm, nation AI, religion lifecycle
│       ├── prototype-checkpoint.md    ← Build + validate text-only simulation
│       ├── stage-05-content.md        ← 80 events, 8-12 religions, 50 commandments, narrative
│       ├── stage-06-balance.md        ← Commandment matrix, power values, win rates
│       ├── stage-07-art-audio.md      ← Palettes, VFX, music, SFX, haptics + ASSET FILES
│       ├── stage-08-tech-qa.md        ← Architecture, API contracts, test specs
│       ├── playtest-checkpoint.md     ← Automated agent playtesting (1000 headless + visual)
│       └── stage-09-ship-readiness.md ← Analytics, store listing, AGENT_BRIEF.md
├── assets/                        ← COMMITTED ASSET FILES (produced by Stage 7)
│   ├── manifest.json              ← Master manifest: asset ID → path, type, source, license
│   ├── LICENSES.md                ← Attribution for all sourced assets
│   ├── icons/                     ← SVG icons (city progression, religion symbols)
│   ├── sfx/                       ← Sound effects (WAV, organized by category)
│   ├── music/                     ← Era tracks (OGG + MP3)
│   ├── branding/                  ← App icon, splash screen
│   └── fonts/                     ← Font files (from Google Fonts or similar)
├── src/
│   ├── types/game.ts              ← Type definitions (THE CONTRACT)
│   ├── config/                    ← Constants, commandments, powers, events
│   ├── simulation/                ← Pure TS logic (testable without Phaser)
│   │   └── __tests__/             ← Vitest specs
│   ├── rendering/                 ← Phaser/PixiJS map rendering
│   ├── scenes/                    ← Game scenes (menu, game, result)
│   ├── llm/                       ← LLM client + narrative generation
│   ├── data/                      ← JSON data files (commandments, events, religions)
│   ├── systems/                   ← Save manager, sharing, analytics
│   ├── prototype/                 ← Throwaway text-only simulation (Prototype Checkpoint)
│   └── playtest/                  ← Automated playtest harness (Playtest Checkpoint)
└── package.json
```

---

## Routing Table — PIPELINE (Design Production Stages)

Use this when you need to **run a design stage** to fill gaps and produce implementation-ready docs.

| Stage | File | What it produces |
|-------|------|-----------------|
| Overview & Checklist | `docs/pipeline/INDEX.md` | Stage ordering, dependencies, how to run |
| 1. Game Director | `docs/pipeline/stage-01-game-director.md` | Vision, FTUE, retention, business model, kill list |
| 2A. Screens & Flows | `docs/pipeline/stage-02a-screens.md` | Menus, settings, store UX, Earth History, results, tutorial, loading |
| 2B. In-Game Interactions | `docs/pipeline/stage-02b-interactions.md` | HUD, FAB, events, overlays, map, accessibility |
| 3. Systems | `docs/pipeline/stage-03-systems.md` | All formulas, tick order, commandment mapping |
| 4. World & AI | `docs/pipeline/stage-04-world-ai.md` | World gen, nation AI, religion lifecycle |
| Prototype Checkpoint | `docs/pipeline/prototype-checkpoint.md` | Text-only simulation validation |
| 5. Content | `docs/pipeline/stage-05-content.md` | 80 events, 8-12 religions, 50 commandments, narrative, fallbacks |
| 6. Balance | `docs/pipeline/stage-06-balance.md` | Commandment matrix, power values, win rates |
| 7. Art, Audio & Assets | `docs/pipeline/stage-07-art-audio.md` | Palettes, VFX, music, SFX, haptics + committed asset files in assets/ |
| 8. Tech & QA | `docs/pipeline/stage-08-tech-qa.md` | Architecture, API contracts, test specs |
| Playtest Checkpoint | `docs/pipeline/playtest-checkpoint.md` | Automated agent playtesting — 1000 headless + visual browser runs |
| 9. Ship Readiness | `docs/pipeline/stage-09-ship-readiness.md` | Analytics, store listing, AGENT_BRIEF.md |

---

## Routing Table — DESIGN (What to Read)

Use this when you need to **understand or redesign** a game system.

| I need to understand... | Read this file | Lines |
|------------------------|----------------|-------|
| Vision, pillars, player persona, FTUE, sessions, retention, business model, timing | `docs/design/01-overview.md` | ~295 |
| Multiverse frame, intros, endings, alien reveal, Harbinger narrative | `docs/design/02-narrative.md` | ~200 |
| Era transition narrative templates (12 eras × 3 fills each) | `docs/design/02b-era-narratives.md` | ~250 |
| Commandment system, 50 commandments (35 base + 15 unlockable), flavor text | `docs/design/03-commandments.md` | ~210 |
| World gen algorithm (seed → world), nations, armies, disease, trade | `docs/design/04-world.md` | ~240 |
| Nation AI decision tree, government evolution, whisper/voice/harbinger integration | `docs/design/04b-nation-ai.md` | ~270 |
| Rival religions, personality archetypes, hidden rules schema, religion lifecycle | `docs/design/05-religions.md` | ~230 |
| 10 pre-made rival religions with commandments, hidden rules, flavor text | `docs/design/05b-religions-premade.md` | ~200 |
| Divine powers, energy, blessings, disasters, hypocrisy, whispers, combos, progressive unlock | `docs/design/06-divine-powers.md` | ~151 |
| Time scale, eras, alien clock, science, win conditions, mid-era narrative moments, Harbinger scout | `docs/design/07-eras-and-endgame.md` | ~158 |
| Procedural events, categories, player choices, Harbinger-caused events | `docs/design/08-events.md` | ~183 |
| Art style, phone UI, living map, divine overlay, ambient life, zoom depth, critical SFX | `docs/design/09-ui-and-visuals.md` | ~280 |
| Screens, flows, menus, settings, commandment selection, store, history, results, tutorial, loading, 2B handoff | `docs/design/09b-ux-flows.md` | ~619 |
| HUD, FAB dual-arc, events, bottom sheet, overlay, map, accessibility, errors, whispers, combos, follower voices | `docs/design/09c-in-game-interactions.md` | ~535 |
| Asset manifest, sourced icons, SFX, music, fonts, licenses | `assets/manifest.json` + `assets/LICENSES.md` | (Stage 7) |
| LLM integration, prompts, call budget | `docs/design/10-llm-integration.md` | ~95 |
| Engine decision, tech stack, project structure, testing | `docs/design/11-tech.md` | ~129 |
| MVP scope, timeline, risks, kill list (SFX split: critical=MVP, ambient=deferred) | `docs/design/12-scope-and-risks.md` | ~135 |
| Follower Voices system: types, emergence, petitions, loyalty, lifecycle, lineage | `docs/design/13-follower-voices.md` | ~231 |
| The Harbinger: alien saboteur AI, Signal Strength, sabotage actions, adaptive targeting, counter-play, visibility timeline | `docs/design/14-harbinger.md` | ~200 |
| Exact numerical values (energy, timing, balance, religion, disease, trade, UI, eras) | `docs/design/constants.md` | ~810 |
| All simulation formulas, tick order, structured format | `docs/design/formulas.md` | (Stage 3) |
| Master event index — all 80 events with triggers and categories | `docs/design/event-index.json` | (Stage 5) |
| 20 executable Monte Carlo balance scenarios | `docs/design/monte-carlo-scenarios.json` | (Stage 6) |
| Visual identity, palettes, VFX specs, city/religion icons | `docs/design/art-spec.md` | (Stage 7) |
| Music, SFX, haptics specs | `docs/design/sound-spec.md` | (Stage 7) |
| Architecture, API contracts, test specs, playtest framework | `docs/design/test-spec.md` | (Stage 8) |
| Store listing, analytics, privacy, content policy | `docs/design/ship-readiness.md` | (Stage 9) |

---

## Routing Table — IMPLEMENTATION (What to Build)

Use this when you need to **implement or fix** code. See `OVERVIEW.md` for the full session map (13 sessions + 1 validation).

| I need to... | Read this file | Tasks / Session |
|-------------|----------------|-----------------|
| Understand session workflow | `docs/implementation/OVERVIEW.md` | Session map, handoff protocol |
| Set up the project (Session 1) | `docs/implementation/phase-0.md` | 0.1–0.10 |
| Implement world & natural systems (Session 2) | `docs/implementation/phase-1a-world-systems.md` | 1.1–1.4, 1.7–1.8 + Nation AI |
| Implement military (Session 3) | `docs/implementation/phase-1b-military.md` | 1.5–1.6 |
| Implement divine & progression (Session 4) | `docs/implementation/phase-1c-divine.md` | 1.9–1.11, 1.13–1.14 |
| Implement runner & characters (Session 5) | `docs/implementation/phase-1d-characters-runner.md` | 1.12, 1.15–1.16 + boundary + integration |
| Run simulation layer audit (Validation V1) | `docs/implementation/VALIDATION_PROTOCOL.md` | 7 checks |
| Build map rendering (Session 6) | `docs/implementation/phase-2.md` | 2.1–2.8 |
| Create core UI (Session 7) | `docs/implementation/phase-3.md` | 3.1–3.8 |
| Create Stage 2B UI (Session 8) | `docs/implementation/phase-3.md` | 3.9–3.15 |
| Wire up LLM, audio, persistence (Session 9) | `docs/implementation/phase-4.md` | 4.1–4.6 |
| Add content data (Session 10) | `docs/implementation/phase-5.md` | 5.1–5.5 |
| Polish (Session 11) | `docs/implementation/phase-6.md` | 6.1–6.5 |
| Build playtest core (Session 12) | `docs/implementation/phase-7.md` | 7.1–7.4 |
| Build playtest analysis (Session 13) | `docs/implementation/phase-7.md` | 7.5–7.8 |
| See all simulation tasks in one place | `docs/implementation/phase-1.md` | 1.1–1.16 (master ref) |

---

## Routing Table — CODE (Where Things Live)

| System | Source file | Test file |
|--------|-----------|-----------|
| Type definitions | `src/types/game.ts` | (compile check) |
| Constants | `src/config/constants.ts` | (compile check) |
| Commandment definitions | `src/config/commandments.ts` | (compile check) |
| Power definitions | `src/config/powers.ts` | (compile check) |
| Event templates | `src/config/events.ts` | (compile check) |
| World generation | `src/simulation/world-gen.ts` | `__tests__/world-gen.test.ts` |
| Nation simulation | `src/simulation/nation.ts` | `__tests__/nation.test.ts` |
| Nation AI decisions | `src/simulation/nation-ai.ts` | `__tests__/nation-ai.test.ts` |
| Religion spread | `src/simulation/religion.ts` | `__tests__/religion.test.ts` |
| Army management | `src/simulation/army.ts` | `__tests__/army.test.ts` |
| Battle resolution | `src/simulation/battle.ts` | `__tests__/battle.test.ts` |
| Disease system | `src/simulation/disease.ts` | `__tests__/disease.test.ts` |
| Trade routes | `src/simulation/trade.ts` | `__tests__/trade.test.ts` |
| Event engine | `src/simulation/events.ts` | `__tests__/events.test.ts` |
| Science progression | `src/simulation/science.ts` | `__tests__/science.test.ts` |
| Divine powers | `src/simulation/divine.ts` | `__tests__/divine.test.ts` |
| Divine Whispers | `src/simulation/whispers.ts` | `__tests__/whispers.test.ts` |
| Power Combos | `src/simulation/combos.ts` | `__tests__/combos.test.ts` |
| Follower Voices | `src/simulation/voices.ts` | `__tests__/voices.test.ts` |
| Harbinger AI | `src/simulation/harbinger.ts` | `__tests__/harbinger.test.ts` |
| PRNG utility | `src/simulation/prng.ts` | `__tests__/prng.test.ts` |
| Simulation runner | `src/simulation/runner.ts` | `__tests__/runner.test.ts` |
| Data integrity validation | — | `__tests__/data-integrity.test.ts` |
| Content integrity validation | — | `__tests__/content-integrity.test.ts` |
| Save/load persistence | `src/systems/save-manager.ts` | (integration) |
| Sharing / card rendering | `src/systems/sharing.ts` | (visual) |
| Automated playtest harness | `src/playtest/runner.ts` | `src/playtest/__tests__/` |
| Cross-stage consistency audit | `scripts/audit-consistency.sh` | (run manually) |

---

## How to Make Design Changes

1. Read the relevant design doc from `docs/design/`
2. Make your changes in that specific doc
3. If the change affects types → update `src/types/game.ts`
4. If the change affects constants → update `docs/design/constants.md` AND `src/config/constants.ts`
5. If the change affects tests → update the test file AND the implementation
6. Update `docs/INDEX.md` glossary if you add new concepts

**Cross-references:** Each design doc lists which other docs it connects to at the top.

---

## How to Implement

1. Read `docs/implementation/OVERVIEW.md` for the session map and setup
2. Say "run session N" — the `.cursor/rules/run-session.mdc` rule handles the full lifecycle
3. Sessions run in order: 1 → 2 → 3 → 4 → 5 → V1 (validation) → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13
4. Each session reads its phase doc, implements all tasks, runs tests, writes a handoff summary, and commits
5. For simulation tasks: write code → run `npm test` → fix until green
6. For rendering tasks: write code → open browser → verify visually
7. **Never modify test files** — they are the specification
8. After Session 13 passes → run **Stage 9: Ship Readiness** (`docs/pipeline/stage-09-ship-readiness.md`) with a capable model

---

## Key Invariants

These rules are always true. Violating them means something is wrong:

- All simulation logic is pure TypeScript (no Phaser, no browser APIs in `simulation/`)
- Types come from `src/types/game.ts` — the single source of truth
- Constants come from `src/config/constants.ts` — no magic numbers elsewhere
- Tests are the specification — code conforms to tests, not the other way around
- LLM calls are never blocking — always have template fallbacks
- Game is 100% offline-playable — LLM adds narrative polish only
- Each run is ~4 hours — if it takes significantly longer, pacing is wrong
- The simulation must be deterministic given a seed — for reproducibility and testing
