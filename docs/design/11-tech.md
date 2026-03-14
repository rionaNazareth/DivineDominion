# DIVINE DOMINION — Tech Stack & Project Structure

> Cross-references: [Overview](01-overview.md) · [LLM Integration](10-llm-integration.md) · [Harbinger](14-harbinger.md) · [Scope & Risks](12-scope-and-risks.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## Engine Decision (Stage 1 — Final)

**Choice: Phaser 3 (v3.80+)**

| Criterion | Phaser 3 | PixiJS v8 | Plain Canvas/SVG |
|-----------|----------|-----------|------------------|
| **Scene management** | Built-in (menu → game → results) | Must build or import | Must build |
| **Camera system** | Built-in zoom, pan, follow | Requires @pixi/viewport plugin | Must build |
| **Mobile input** | Touch, multi-touch, gestures built-in | Basic pointer events, rest is custom | Raw touch events |
| **Tweens / animation** | Built-in tween system | Requires gsap or custom | Must build |
| **Audio** | Built-in WebAudio manager | Requires howler.js or custom | Must build |
| **Asset loading** | Built-in loader with caching | Built-in but simpler | Must build |
| **Vector rendering** | Graphics class (curves, gradients, fills) | Graphics class (similar capability) | Native Canvas API |
| **Bundle size** | ~1.5 MB (gzipped ~400 KB) | ~500 KB | 0 KB |
| **Agent-friendliness** | Excellent — vast docs, thousands of examples, extensive training data | Good, but v8 is newer with fewer examples | Poor — no abstraction, verbose |
| **Mobile performance** | Proven on mobile, WebGL by default | Excellent, WebGPU support | Depends on implementation |

**Why Phaser 3:**

1. **Batteries included.** Scene management, camera, input, tweens, and audio are all features this game needs. Building them from scratch with PixiJS adds 2–4 weeks of work for no benefit.
2. **Agent-driven development.** AI agents generate more correct Phaser code because of extensive docs and community examples in training data. PixiJS v8 is newer with a changed API — higher hallucination risk.
3. **The rendering gap is small.** Both Phaser and PixiJS use the same underlying WebGL for vector rendering. Phaser's Graphics class handles the curves, gradients, and fills this map game needs.
4. **Bundle size is acceptable.** ~400 KB gzipped for a game that downloads once and runs offline. Not a concern.

**What we won't use from Phaser:** Physics engine, tilemap system, sprite sheet packer, arcade physics. These stay disabled / unused.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **2D Map Rendering** | Phaser 3 (v3.80+) | Batteries-included: scenes, camera, input, tweens, audio. Mobile-proven. Agent-friendly. |
| **Language** | TypeScript | Type safety, testability, tooling |
| **Build** | Vite | Fast dev, tree-shaking, modern ESM |
| **Mobile** | Capacitor | iOS/Android packaging, native APIs |
| **State** | Pure TS (no framework) | No React/Vue—simulation is framework-agnostic, fully testable |
| **Persistence** | localStorage + IndexedDB | Save/load, cross-session, offline-first |
| **LLM** | Gemini Flash | Cheap, fast, narrative polish only |
| **Procedural Gen** | Voronoi + noise | World regions, nation borders, terrain |

---

## Project Structure

```
ai-game/
├── docs/                          ← Design + implementation
│   ├── INDEX.md
│   ├── design/                    ← Game design docs
│   └── implementation/            ← Build phases, tasks
├── src/
│   ├── types/game.ts              ← THE CONTRACT (all type shapes)
│   ├── config/                    ← Constants, commandments, powers, events
│   ├── simulation/                ← Pure TS: world, nations, religion, armies,
│   │   ├── world.ts               │   disease, trade, science, events
│   │   ├── nations.ts             │   NO Phaser, NO browser APIs
│   │   ├── religion.ts            │
│   │   ├── ...
│   │   └── __tests__/             ← Vitest specs (the spec)
│   ├── rendering/                 ← Phaser 3: map, overlays, effects, UI
│   ├── scenes/                    ← Menu, commandment-select, game, result, earth-history
│   ├── llm/                       ← LLM client, narrative generation, fallbacks
│   ├── data/                      ← Commandment definitions, event templates, religion templates
│   └── systems/                   ← Save-manager, sharing, analytics
└── package.json
```

---

## Key Invariant

**All simulation logic is pure TypeScript.** No Phaser, no browser APIs in `simulation/`. Types from `game.ts`. Constants from `config/constants.ts`. LLM never blocking.

```
simulation/     → Pure functions, deterministic, Vitest-tested
rendering/      → Phaser/PixiJS, visual only, no game logic
scenes/         → Orchestration, UI flow, user input
llm/            → Async, optional, fallback always available
```

---

## Testing Strategy

| Layer | Approach |
|-------|----------|
| **Simulation** | Vitest. Pure unit tests. Tests are the spec—code conforms to tests. |
| **Rendering** | Visual/manual. No headless rendering tests in MVP. |
| **Balance** | Monte Carlo: run 1000 sims, check invariants (e.g., religion % bounds, no NaN, no infinite loops). |
| **Integration** | Smoke tests: load game, run 1 era, save, load, verify state. |

---

## Data Flow

```
User Input → Scenes → Simulation (state updates) → Rendering (display)
                ↓
            Save Manager (persist to IndexedDB)
                ↓
            LLM (async, non-blocking, narrative only)
```

---

## Dependencies (Proposed)

- `phaser` (v3.80+) — rendering engine
- `typescript` — language
- `vite` — build
- `vitest` — testing
- `@capacitor/core` — mobile
- `idb` — IndexedDB wrapper (optional, for structured saves)
- Gemini API client (REST or SDK)

---

## Build Output

- Web: `dist/` (static assets, deployable to any host)
- iOS: `ios/` (Capacitor)
- Android: `android/` (Capacitor)
