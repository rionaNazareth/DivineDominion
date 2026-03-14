# Session Protocol — Implementation Session Orchestrator

Follow this protocol exactly when running a session.

---

## Session Map

| Session | Phase Doc | Focus |
|---------|-----------|-------|
| 1 | `docs/implementation/phase-0.md` | Foundation: skeleton, types, constants, commandments, powers, combos, Harbinger, PRNG |
| 2 | `docs/implementation/phase-1a-world-systems.md` | Simulation: world gen, nation, nation AI, religion, commandments, disease, trade |
| 3 | `docs/implementation/phase-1b-military.md` | Simulation: army, battle |
| 4 | `docs/implementation/phase-1c-divine.md` | Simulation: events, science, divine, whispers, combos |
| 5 | `docs/implementation/phase-1d-characters-runner.md` | Simulation: runner, voices, harbinger + boundary + integration tests |
| **V1** | **VALIDATION GATE — Do NOT start Session 6 until this is done (see below)** | |
| 6 | `docs/implementation/phase-2.md` | Map rendering (Phaser/PixiJS) |
| 7 | `docs/implementation/phase-3.md` (tasks 3.1–3.8) | Core UI: menu, commandment select, HUD, FAB, events, bottom sheet, overlay, era |
| 8 | `docs/implementation/phase-3.md` (tasks 3.9–3.15) | Stage 2B UI: dual-arc FAB, whispers, prayer, voices, combos, petitions, Harbinger |
| 9 | `docs/implementation/phase-4.md` | Integration: LLM, save/load, audio, mobile touch |
| 10 | `docs/implementation/phase-5.md` | Content: 50 commandments, 80 events, 10 religions, narrative templates |
| 11 | `docs/implementation/phase-6.md` | Polish: Monte Carlo, sharing, analytics, performance, mobile deploy |
| 12 | `docs/implementation/phase-7.md` (tasks 7.1–7.4) | Playtest core: agent player, profiles, metrics, headless runner |
| 13 | `docs/implementation/phase-7.md` (tasks 7.5–7.8) | Playtest analysis: analyzer, fix playbook, visual tests, npm scripts |

---

## Steps — Execute in Order

### Step 1 — Read Prior Handoff

- Read `docs/session/SESSION_{N-1}_SUMMARY.md` (skip for session 1).
- If the prior session's tests **FAILED**, report the failures and **stop**. Wait for the user to decide.

**VALIDATION GATE:** If you are about to start **Session 6**, check for `docs/session/VALIDATION_V1_COMPLETE.md`. If it does NOT exist, **stop** and tell the user:

> "Session 5 is complete. Before Session 6 can begin, the simulation layer must be validated on the work laptop. Run 'start validation session 1' there, then create docs/session/VALIDATION_V1_COMPLETE.md with the results. Do not proceed until this file exists."

Do NOT start Session 6 without this file.

### Step 2 — Read Context

- Read the phase doc from the session map above.
- Read every file in the phase doc's **Reading List** section.
- Read `src/types/game.ts` and `src/config/constants.ts`.

### Step 3 — Implement

- Write all code for the tasks in the phase doc.
- After each module: run `npm test`. Fix failures before moving to the next module.
- Use Immer `produce()` for all state mutations:

```typescript
import { produce } from 'immer';

export function tickModule(state: GameState, delta: number): GameState {
  return produce(state, draft => {
    // mutate draft freely
  });
}
```

### Step 4 — Self-Check

Re-read your own code. Verify:

- [ ] Constants imported from `src/config/constants.ts` (no hardcoded numbers)
- [ ] Types imported from `src/types/game.ts` (no `any`, no missing fields)
- [ ] No `Math.random` anywhere in `src/simulation/` (use `src/simulation/prng.ts`)
- [ ] Cross-dependency notes from the phase doc are honored
- [ ] `npm test` passes

### Step 5 — Sign Off (Non-Blocking)

When (and only when) you have finished all tasks for Session N’s phase doc (or explicitly reached a deliberate stopping point agreed with the human), output this summary to chat:

```
## Sign-Off — Session N
### Built
- [modules and exports created]
### Tests
- npm test: PASS/FAIL (X passing, Y failing)
### Known Gaps
- [anything incomplete]
### Human Decisions Needed
- [anything needing judgment, or "none"]
```

This sign-off is for **logging and visibility**, not an automatic hard stop. After writing it:

- If there are still tasks remaining in the phase doc and the human has not asked you to pause, **continue to Step 6 and keep implementing**.
- If you are proposing a deviation from the design/spec, or need a human call, clearly list it under “Human Decisions Needed” and then wait.

### Step 6 — Write Handoff

Write `docs/session/SESSION_N_SUMMARY.md`:

```markdown
# Session N Summary — [Phase Name]

## Test Results
- npm test: PASS/FAIL (X passing, Y failing)
- Failing tests (if any): [list]

## Files Created/Modified
- [file list]

## Known Gaps
- [anything incomplete or deferred]

## Decision Points for Human
- [anything requiring human judgment]
```

### Step 7 — Commit

```
session N: [phase name]

[1-2 sentence description]

Checklist:
[x] npm test passes
[x] types match game.ts
[x] constants synced
[x] no Math.random in simulation/
[x] handoff summary written
```

### Step 8 — Push to Remote

After the commit succeeds, push the work to the canonical remote so progress is saved after **every phase**:

1. Ensure a remote is configured (for example `origin` pointing at `git@github.com:rionaNazareth/DivineDominion.git` or `https://github.com/rionaNazareth/DivineDominion.git`).
2. On the main branch for this project (e.g. `main`):
   - First-time push: `git push -u origin main`
   - Subsequent pushes: `git push`

---

## Rules

- **Types are sacred.** Import from `src/types/game.ts`. Never shadow them with local aliases.
- **Constants are sacred.** Import from `src/config/constants.ts`. Never hardcode values.
- **Tests are the spec.** If a test expects a value, that value is correct. Do not change test expectations.
- **PRNG only.** Use `src/simulation/prng.ts` for all randomness in `src/simulation/`.
- **Immer always.** Use `produce()` for all state mutations.
- **Deliverable names, not line numbers.** Reference formulas by "Deliverable N", test specs by "§N section name".
