# DIVINE DOMINION — Implementation Overview

> Read this first before any phase file. Then start with [Phase 0](phase-0.md).

---

## Purpose

This plan guides an LLM agent through implementing DIVINE DOMINION. Each task is small, atomic, and has automated test gates or visual verification. Implementation is split into 13 sessions + 1 validation session, each mapped to a phase doc.

---

## Architecture

- **Simulation layer** — Pure TypeScript, no Phaser. All game logic (world, nations, religion, armies, disease, trade, events, science, divine). Testable with Vitest.
- **Rendering layer** — Phaser 3 or PixiJS. Map, regions, overlays, effects, zoom. Visual verification.
- **UI layer** — Menus, HUD, overlays, scenes. Integrates with rendering.

---

## Setup

The project already exists. Add dependencies:

```bash
npm install phaser immer lz-string d3-delaunay simplex-noise
npm install -D vitest @vitest/coverage-v8 @playwright/test tsx @types/node
npm install @capacitor/core @capacitor/cli && npx cap init
```

Configure `tsconfig.json`, `vitest.config.ts`. Add scripts: `test`, `test:watch`, `dev`, `build`.

**State management:** All simulation modules use the Immer `produce()` pattern. See `docs/pipeline/stage-08-tech-qa.md` for the mandatory template.

---

## Testing Strategy

- **Simulation logic** — Vitest unit tests. Monte Carlo balance tests (1000 sims). Tests are the spec.
- **Rendering** — Visual verification in browser. No automated pixel tests.
- **Invariant:** All simulation logic is pure TS, no browser APIs. Types from `src/types/game.ts`. Constants from `src/config/constants.ts`. LLM never blocking. Deterministic with seed.

---

## Session Map (13 implementation + 1 validation)

| Session | Phase Doc | Focus | Expected Tests |
|---------|-----------|-------|----------------|
| 1 | phase-0.md | Foundation: skeleton, types, constants, commandments, powers, Harbinger, PRNG | data-integrity |
| 2 | phase-1a-world-systems.md | Simulation: world gen, nation, nation AI, religion, commandments, disease, trade | 130 |
| 3 | phase-1b-military.md | Simulation: army, battle | 30 |
| 4 | phase-1c-divine.md | Simulation: events, science, divine, whispers, combos | 90 |
| 5 | phase-1d-characters-runner.md | Simulation: runner, voices, harbinger + boundary + integration | 117 |
| V1 | **VALIDATION_PROTOCOL.md** | **Strong model: simulation layer audit (work laptop)** | — |
| 6 | phase-2.md | Map rendering (Phaser/PixiJS) | visual |
| 7 | phase-3.md (tasks 3.1–3.8) | Core UI: menu, commandment select, HUD, FAB, events, bottom sheet, overlay, era | visual |
| 8 | phase-3.md (tasks 3.9–3.15) | Stage 2B UI: dual-arc FAB, whispers, prayer, voices, combos, petitions, Harbinger | visual |
| 9 | phase-4.md | Integration: LLM, save/load, audio, mobile touch | integration |
| 10 | phase-5.md | Content: 50 commandments, 80 events, 10 religions, narrative templates | content-integrity |
| 11 | phase-6.md | Polish: Monte Carlo, sharing, analytics, performance, mobile deploy | balance |
| 12 | phase-7.md (tasks 7.1–7.4) | Playtest core: agent player, profiles, metrics, headless runner | harness |
| 13 | phase-7.md (tasks 7.5–7.8) | Playtest analysis: analyzer, fix playbook, visual tests, npm scripts | §14d criteria |

### Phase 1 Split Details

Phase 1 (Simulation Engine) is split into 4 chunks to keep each session focused:

- **1a — World & Natural Systems:** world-gen, nation, nation-ai, religion, commandments, disease, trade (tick steps 1–9, 13)
- **1b — Military:** army, battle (tick steps 10–11)
- **1c — Divine & Progression:** events, science, divine, whispers, combos (tick steps 2, 12, 16)
- **1d — Characters & Runner:** runner, voices, harbinger + boundary + integration tests (tick steps 14–15, 17, full pipeline)

---

## Session Handoff Protocol

Each session writes `docs/session/SESSION_N_SUMMARY.md` with: test results, files created/modified, known gaps, decision points for human.

The next session reads the prior summary. If tests FAILED, the agent pauses for human decision before proceeding.

See `SESSION_PROTOCOL.md` for the full lifecycle. The session router (`.cursor/rules/session-router.mdc`) automatically directs agents to the correct protocol when you say "run session N".

---

## Phase Summary

| Phase | Focus | Tasks |
|-------|-------|-------|
| 0 | Foundation | Project setup, types, config, PRNG, Stage 2B types/constants, Harbinger types (0.1–0.10) |
| 1 | Simulation Engine | Pure logic: world, nations, nation AI, religion, armies, disease, trade, events, science, divine, whispers, combos, voices, harbinger (1.1–1.16) |
| 2 | Map Rendering | Phaser/PixiJS: regions, overlays, effects, zoom (2.1–2.8) |
| 3 | UI & Scenes | Menus, commandment select, game HUD, overlays, Stage 2B FAB/whispers/voices/combos/petitions, Harbinger overlay (3.1–3.15) |
| 4 | Integration | LLM, audio, persistence, mobile controls (4.1–4.6) |
| 5 | Content | Commandments data, events data, 10 religion templates (5.1–5.5) |
| 6 | Polish | Balance testing, sharing, analytics, mobile deploy (6.1–6.5) |
| 7 | Playtest Harness | Agent player, profiles, metrics, headless runner, analyzer, fix playbook, visual tests (7.1–7.8) |

---

## Rules

- Types from `src/types/game.ts` — single source of truth
- Constants from `src/config/constants.ts` — no magic numbers
- Tests define behavior — code conforms to tests
- LLM calls never block — always have template fallbacks
- Simulation deterministic given seed — for reproducibility
- Use Immer `produce()` for all state mutations — no spread operators for nested updates
- Use `src/simulation/prng.ts` for all randomness — no `Math.random` in simulation/
