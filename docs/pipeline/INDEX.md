# DIVINE DOMINION — Design Production Pipeline

> **Purpose:** Guide a solo designer through the full lifecycle: design → implement → validate → ship. The pipeline has three parts:
> 1. **Design Pipeline** (Stages 1-8 + Prototype Checkpoint) — uses a capable model to produce specs, assets, test cases, and a playtest framework spec
> 2. **Implementation & Validation** (Phases 0-7) — uses a smaller model to build the game AND run automated validation (the playtest framework is fully specified in Stage 8 — no creative decisions left)
> 3. **Ship** (Stage 9) — uses a capable model for store listing, legal review, and final handoff
>
> **How to use:** Work through stages in order. Each stage is an independent AI agent session. Open the stage file, copy the agent prompt, and run the session. Review output before proceeding.

---

## Pipeline Overview

```
╔══════════════════════════════════════════════╗
║          PART 1: DESIGN PIPELINE             ║
║  (uses capable model, human decision points) ║
╚══════════════════════════════════════════════╝

Stage 1:  Game Director & Vision Lock
    |
Stage 2A: Screens & Flows (menus, store, history, tutorial, settings)
    |
Stage 2B: In-Game Interactions (HUD, powers, events, map, overlays)
    |
Stage 3:  Systems & Formulas
    |
Stage 4:  World & AI Architecture
    |
=== PROTOTYPE CHECKPOINT ===
  Build text-only simulation.
  Run 100 sims. Validate.
  If broken → return to Stage 3.
================================
    |
Stage 5:  Narrative & Content
    |
Stage 6:  Balance & Economy
    |
Stage 7:  Art, Audio & Asset Production
    |
Stage 8:  Technical Spec & QA
    |
    ▼ Design complete. All docs, specs, assets, and test cases ready.

╔══════════════════════════════════════════════╗
║        PART 2: IMPLEMENTATION & VALIDATION   ║
║  (uses smaller model, follows AGENT_BRIEF)   ║
║  (all creative decisions made in Part 1)     ║
╚══════════════════════════════════════════════╝

Phase 0:  Foundation (project skeleton, types, config)
    |
Phase 1:  Simulation Engine (pure TS, no rendering)
    |
Phase 2:  Map Rendering (Phaser 3)
    |
Phase 3:  UI & Scenes (menus, HUD, overlays)
    |
Phase 4:  Integration (LLM, audio, persistence)
    |
Phase 5:  Content (data files from Stage 5+6)
    |
Phase 6:  Polish (balance tuning, mobile deploy)
    |
Phase 7:  Playtest Harness (from Stage 8 spec §14)
    |
=== PLAYTEST CHECKPOINT ===
  npm run playtest:all
  1000 headless games + Playwright visual tests.
  If criteria fail → apply fix playbook.
  Loop max 5×. Escalate to human only if stuck.
================================
    |
    ▼ Game validated. All criteria pass.

╔══════════════════════════════════════════════╗
║        PART 3: SHIP                          ║
║  (uses capable model for store/legal review) ║
╚══════════════════════════════════════════════╝

Stage 9:  Ship Readiness & Handoff
```

---

## Stage Checklist

Mark each stage as you complete it. Do not skip stages.

**Part 1: Design Pipeline** (capable model, human decision points)

| # | Stage | File | Status | Sessions |
|---|-------|------|--------|----------|
| 1 | Game Director & Vision Lock | [stage-01-game-director.md](stage-01-game-director.md) | [x] Complete | 1-2 |
| 2A | Screens & Flows | [stage-02a-screens.md](stage-02a-screens.md) | [x] Complete | 1 |
| 2B | In-Game Interactions | [stage-02b-interactions.md](stage-02b-interactions.md) | [x] Complete | 1 |
| 3 | Systems & Formulas | [stage-03-systems.md](stage-03-systems.md) | [x] Complete | 2-4 |
| 4 | World & AI Architecture | [stage-04-world-ai.md](stage-04-world-ai.md) | [x] Complete | 2-3 |
| P | Prototype Checkpoint | [prototype-checkpoint.md](prototype-checkpoint.md) | [x] Complete | 1-2 |
| 5 | Narrative & Content | [stage-05-content.md](stage-05-content.md) | [x] Complete | 4-6 |
| 6 | Balance & Economy | [stage-06-balance.md](stage-06-balance.md) | [x] Complete | 3-5 |
| 7 | Art, Audio & Asset Production | [stage-07-art-audio.md](stage-07-art-audio.md) | [x] Complete | 2-4 |
| 8 | Technical Spec & QA | [stage-08-tech-qa.md](stage-08-tech-qa.md) | [x] Complete | 2-3 |
| | **Design subtotal** | | | **~20-33** |

**Part 2: Implementation & Validation** (smaller model, follows `AGENT_BRIEF.md` and `docs/implementation/`)

All creative decisions were made in Part 1. The small model implements code from specs and runs automated tests. No judgment calls needed.

| Phase | Focus | File | Status |
|-------|-------|------|--------|
| 0 | Foundation (skeleton, types, config) | [phase-0.md](../implementation/phase-0.md) | [ ] Not started |
| 1 | Simulation Engine (pure TS) | [phase-1.md](../implementation/phase-1.md) | [ ] Not started |
| 2 | Map Rendering (Phaser 3) | [phase-2.md](../implementation/phase-2.md) | [ ] Not started |
| 3 | UI & Scenes | [phase-3.md](../implementation/phase-3.md) | [ ] Not started |
| 4 | Integration (LLM, audio, persistence) | [phase-4.md](../implementation/phase-4.md) | [ ] Not started |
| 5 | Content (data files) | [phase-5.md](../implementation/phase-5.md) | [ ] Not started |
| 6 | Polish (balance, mobile deploy) | [phase-6.md](../implementation/phase-6.md) | [ ] Not started |
| 7 | Playtest Harness + Validation | [playtest-checkpoint.md](playtest-checkpoint.md) | [ ] Not started |

Phase 7 builds the playtest framework from Stage 8 spec §14, runs `npm run playtest:all`, and applies the fix playbook until all criteria pass. Escalates to human only if 5 fix iterations can't resolve a criterion.

**Part 3: Ship** (capable model, for store listing and legal review)

| # | Stage | File | Status | Sessions |
|---|-------|------|--------|----------|
| 9 | Ship Readiness & Handoff | [stage-09-ship-readiness.md](stage-09-ship-readiness.md) | [ ] Not started | 1-2 |

| | **Design pipeline total (Part 1)** | | | **~20-33 sessions** |
| | **Ship total (Part 3)** | | | **~1-2 sessions** |

---

## Rules for Every Stage

1. **Read the stage file completely** before starting the agent session.
2. **Copy the agent prompt** from the stage file into a new chat.
3. **Decision Points are mandatory.** Every stage has a `Decision Points` section listing high-stakes choices. The agent MUST present these to the human with options and tradeoffs BEFORE writing deliverables. Do not assume — ask and wait.
4. **Review every deliverable** before marking the stage complete.
5. **Every stage must produce testable artifacts** — types, constants, test cases, or structured data. Prose alone is not sufficient.
6. **Update design docs** as specified in each stage's deliverable list. Follow the design-change protocol in `.cursor/rules/design-changes.mdc`.
7. **Do not skip the checkpoints.** The Prototype Checkpoint catches broken formulas early. The Playtest Checkpoint catches balance, pacing, and UX issues before ship. Both exist because "design docs that don't translate to code" and "untested player experience" are the top two pipeline risks.
8. **Full vision scope.** Stages 5 and 6 target full-vision content (80 events, 8-12 religions, 50 commandments). Content is additive (more rows in the same schema), not structurally different. The main complexity risk is commandment balance at 50 (combinatorial explosion) — Stage 6 addresses this with category-level balancing and 20 Monte Carlo test scenarios.
9. **Sign-Off Summary is mandatory.** At the end of every stage, the agent MUST present the sign-off summary (see protocol below) and wait for human confirmation before the stage is marked complete.
10. **Expert Review is mandatory.** After human sign-off, the agent reviews all decisions as a domain expert (see Expert Review protocol below). Red flags must be addressed before commit.
11. **Git commit is mandatory.** After expert review and any fixes, commit all changes from the stage. Follow the Git Commit Protocol below. No stage is complete without a commit.
12. **Constants & Numbers Sync Check is mandatory.** Before presenting the Sign-Off Summary, the agent MUST run the sync check described below. This catches cross-doc number drift before it compounds.

---

## Constants & Numbers Sync Check (Every Stage)

Inconsistent numbers across design docs are the #1 source of downstream bugs. Every stage MUST run this check before sign-off.

### What to check

The agent must verify these values are consistent across ALL files that reference them:

| Value | Files that must agree |
|-------|----------------------|
| Commandment counts (base, starting unlocked, total) | `03-commandments.md`, `01-overview.md`, `12-scope-and-risks.md`, `constants.md`, `constants.ts` |
| Religion counts (rival, symbols, colors) | `05-religions.md`, `09-ui-and-visuals.md`, `12-scope-and-risks.md`, `constants.md`, `constants.ts` |
| Event counts (MVP, full vision) | `08-events.md`, `01-overview.md`, `12-scope-and-risks.md` |
| Divine energy (start, max, regen) | `06-divine-powers.md`, `constants.md`, `constants.ts` |
| Blessing/disaster counts | `06-divine-powers.md`, `09-ui-and-visuals.md`, `12-scope-and-risks.md`, `constants.md` |
| Science milestone counts and Dev thresholds | `07-eras-and-endgame.md`, `constants.md`, `constants.ts` |
| Era count, duration, timing | `07-eras-and-endgame.md`, `01-overview.md`, `constants.md`, `constants.ts` |
| Nation/region counts | `04-world.md`, `constants.md`, `constants.ts` |
| Time scale (game-years/min, total duration) | `07-eras-and-endgame.md`, `01-overview.md`, `constants.md`, `constants.ts` |
| Type field names | `game.ts` vs design docs that reference field names |

### How to run it

1. After all deliverables are written, read every file in the "Files that must agree" column for any row this stage touched
2. List every discrepancy found (value X says Y in file A but Z in file B)
3. Fix all discrepancies — update the less-authoritative file to match the more-authoritative one (authority: `game.ts` > `constants.md`/`constants.ts` > design docs > scope/risks)
4. If no discrepancies found, state "Sync check passed — no discrepancies" in the Sign-Off Summary
5. If discrepancies were found and fixed, list them in the Sign-Off Summary under "Sync fixes applied"

### Pass criteria

Zero discrepancies remain across all referenced files. If a value was intentionally changed by this stage, ALL files referencing it have been updated.

---

## Human Review Protocol

Every stage includes two structured human checkpoints. These are NOT optional.

### Decision Points (Before Writing)

Each stage file has a `Decision Points` section listing 3-6 high-impact choices. The agent must:

1. Present each decision with 2-3 concrete options and tradeoffs
2. Wait for the human to choose before proceeding
3. Document the human's choice in the deliverable (e.g., "Business model: Premium $4.99 — chosen by designer")

The agent handles all other decisions autonomously. Decision Points are reserved for choices that are expensive to reverse once downstream stages build on them.

### Sign-Off Summary (After Writing)

When all deliverables are complete, the agent presents:

1. **Decisions made** — one line per Decision Point, showing the choice taken
2. **Assumptions made** — things the agent decided without asking (lower-stakes calls)
3. **Biggest risk** — if any decision above is wrong, which one would cause the most rework?
4. **Open question** — "Is anything here surprising or wrong?" — wait for human response

The stage is NOT complete until the human confirms the sign-off. If the human flags issues, fix them before marking the stage done.

### Expert Review (After Sign-Off, Before Commit)

After the human confirms the sign-off, the agent launches a **subagent** to perform the expert review. The subagent gets a fresh context — it hasn't been part of the conversation that produced the deliverables, so it reviews with unbiased eyes.

**Why a subagent:** The agent that wrote the deliverables is biased toward defending its own decisions. A separate agent with only the deliverables and the expert persona produces a more honest critique.

**How it works:**

1. The main agent launches a subagent (using the Task tool) with:
   - The expert persona for this stage (see table below)
   - A list of files to read (the stage's output files)
   - The list of human-confirmed Decision Points and agent assumptions
   - Instructions to flag red flags, yellow flags, and blind spots
2. The subagent reads the deliverables cold and produces a structured review
3. The main agent presents the subagent's review to the human
4. If red flags exist, the human decides: fix now or accept the risk

**Subagent prompt template:**

```
You are a [EXPERT PERSONA] reviewing the output of Stage [N] of a game 
design pipeline. You have NOT seen the conversation that produced these 
deliverables. Your job is a devil's-advocate review — not a rubber stamp.

Read these files:
[LIST OF OUTPUT FILES FROM THIS STAGE]

These decisions were made:
[LIST OF DECISION POINTS + CHOICES]

These assumptions were made by the AI without asking the human:
[LIST OF ASSUMPTIONS]

Produce a structured review with:
1. RED FLAGS — decisions that could seriously hurt the game. Must address.
2. YELLOW FLAGS — decisions with risk but defensible. Note and proceed.
3. BLIND SPOTS — things nobody asked about that you, as [EXPERT], would 
   care about.

Be brutally honest. Your job is to catch mistakes before they compound 
in downstream stages.
```

**Expert personas by stage:**

| Stage | Expert Persona |
|-------|---------------|
| 1 | Senior Game Director (mobile strategy, 15+ years) |
| 2A | Senior Mobile UX Designer (menu flows, IAP conversion) |
| 2B | Senior Mobile UX Designer (in-game interactions, strategy games) |
| 3 | Systems Designer (simulation games — CK3, Stellaris, Civ) |
| 4 | Procedural Generation & World Sim Specialist |
| P | Senior Game Engineer (simulation validation) |
| 5 | Narrative Designer (procedural narrative — CK3, Stellaris, RimWorld) |
| 6 | Game Economy Designer & Balance Specialist |
| 7 | Art Director & Sound Designer (mobile, vector/geometric) |
| 8 | Senior Game Engineer (mobile performance, simulation architecture) |
| 9 | Production Director & Release Manager (iOS/Android) |

---

### Verification Subagent Protocol (Critical Stages Only)

Stages rated CRITICAL for LLM reliability (3, 5, 6, 8) get a **Verification Subagent** in addition to the Expert Review. The Expert Review checks "is this design good?" (subjective). The Verification checks "is this complete and consistent?" (objective).

**Why this exists:** LLMs checking their own output is unreliable. The agent that wrote 13 formulas or 80 events will claim they're all correct without systematically verifying. A separate agent with fresh context and a strict checklist catches skips, contradictions, and math errors.

**How it works:**

1. After human sign-off and Expert Review, the main agent launches a **Verification Subagent** (using the Task tool)
2. The verification subagent receives ONLY the stage's output files + a verification template (below)
3. The subagent checks every item systematically and produces a pass/fail report
4. If any FAIL items exist, the main agent fixes them before committing

**Verification Subagent prompt template:**

```
You are a QA Auditor verifying the output of Stage [N]. You have NOT seen 
the conversation that produced these deliverables. Your job is objective 
completeness and consistency checking — not design critique.

Read these output files:
[LIST OF OUTPUT FILES FROM THIS STAGE]

Read these reference files (source of truth):
[LIST OF AUTHORITATIVE FILES — constants.md, constants.ts, game.ts]

Run these checks:

COMPLETENESS:
- Count every deliverable listed in the stage's quality gate
- For each: present? (yes/no), complete? (all sub-items present?)
- Report exact count vs expected count

CONSISTENCY:
- Every constant value referenced matches constants.md / constants.ts
- Every type/field referenced exists in game.ts
- Every ID (commandment, power, event, religion) matches source files
- No value contradicts a value in another output file

STAGE-SPECIFIC CHECKS:
[STAGE-SPECIFIC ITEMS — see each stage file for its verification checklist]

Output format:
- PASS: [item] — verified
- FAIL: [item] — [specific error: expected X, found Y]
- MISSING: [item] — not found in output

Summary: X passed, Y failed, Z missing.
```

**Verification checklists by stage:**

| Stage | Key checks |
|-------|-----------|
| 3 | Every formula uses structured format. Constants referenced exist. Battle walkthrough math is independently recomputed. No formula references undefined inputs. |
| 5 | Exactly 80 events (count). No two events share trigger conditions. All commandment IDs valid. All variable slots match game.ts fields. Religion count is 8-12. All 50 commandments have flavor text. |
| 6 | All 20 Monte Carlo scenarios parse as valid JSON config. Modifier values are numbers (not ranges). Win rate targets match Decision Point choices. Hypocrisy pairs reference valid commandment+power combos. Harbinger signal strength + sabotage costs have exact values. Whisper nudge strength and combo modifiers validated. All 80 events reviewed against event-index.json. Difficulty scaling values exist for Earths 1-20. |
| 8 | Every module in file map has an API contract. Every API contract's types match game.ts. Analyzer thresholds reference valid criterion IDs. Fix playbook covers every criterion. Playtest config sums to 1000 headless runs. |

---

### Consistency Audit (Every Stage)

After every stage (not just critical ones), run `scripts/audit-consistency.sh` before committing. This script checks cross-file value consistency automatically.

**What it checks:**
- Constant values in `constants.md` vs `constants.ts` (name, value, type)
- Science milestone IDs/years/dev levels across `07-eras`, `constants.md`, `constants.ts`
- Commandment count in `03-commandments.md` vs `constants.md` TOTAL_BASE / TOTAL_WITH_UNLOCKS
- Religion count in `05-religions.md` vs `constants.md` RIVAL_RELIGIONS_MIN/MAX
- Event count in `08-events.md` vs stage output
- Power IDs in `06-divine-powers.md` vs `constants.ts` BLESSINGS/DISASTERS keys

**Pass criteria:** Zero mismatches. If any mismatch is found, fix it before committing.

**How to run:** `bash scripts/audit-consistency.sh` — outputs PASS/FAIL per check.

---

### Git Commit Protocol (After Expert Review + Verification)

Every stage produces a git commit. This is the final step — after the human confirms the sign-off.

**Commit checklist:**

1. Run `git status` to verify which files were changed
2. Run `git diff --stat` to confirm the scope matches what the stage should have touched
3. Stage only files relevant to this pipeline stage (don't commit unrelated changes)
4. Write a descriptive commit message following this format:

```
Stage N: [Stage Name] — [1-line summary of what was decided/produced]

Decision Points (human-confirmed):
- [Decision 1]: [choice taken]
- [Decision 2]: [choice taken]
- ...

Files changed:
- [file]: [what changed]
- [file]: [what changed]
- ...
```

5. Verify the commit succeeded with `git log --oneline -1`

**Rules:**
- One commit per stage completion (not mid-stage commits for partial work)
- If the stage required revisions after sign-off feedback, include those fixes in the same commit
- If a stage spans multiple sessions, only commit after the final sign-off
- The commit message must list the Decision Point outcomes — this is the permanent record of human choices
- Never amend a previous stage's commit — each stage gets its own history entry

**Naming convention for commit messages:**

| Stage | Commit prefix |
|-------|--------------|
| Stage 1 | `Stage 1: Game Director` |
| Stage 2A | `Stage 2A: Screens & Flows` |
| Stage 2B | `Stage 2B: In-Game Interactions` |
| Stage 3 | `Stage 3: Systems & Formulas` |
| Stage 4 | `Stage 4: World & AI` |
| Prototype | `Prototype: Simulation Validation` |
| Stage 5 | `Stage 5: Content & Narrative` |
| Stage 6 | `Stage 6: Balance` |
| Stage 7 | `Stage 7: Art & Audio` |
| Stage 8 | `Stage 8: Tech & QA` |
| Stage 9 | `Stage 9: Ship Readiness` |

---

## Dependencies

### Part 1: Design Pipeline
- Stage 2A (Screens) uses Stage 1 (vision, session design, business model)
- Stage 2B (Interactions) uses Stage 2A (screen flow, tutorial plan)
- Stage 3 (Systems) uses Stage 2B (interaction constraints)
- Stage 4 (World) uses Stage 3 (formulas, tick order)
- Prototype Checkpoint uses Stages 3 + 4 (builds throwaway simulation code)
- Stage 5 (Content) uses Stage 4 (nation AI, religion rules) + Stage 2A (tutorial flow) — produces `docs/design/event-index.json`
- Stage 6 (Balance) uses Stages 3 + 5 (formulas + content + `event-index.json`) — produces `docs/design/monte-carlo-scenarios.json`
- Stage 7 (Art/Audio/Assets) uses Stages 2A + 2B (UX layout) — produces committed asset files in assets/
- Stage 8 (Tech) uses ALL prior stages (including `event-index.json`, `monte-carlo-scenarios.json`) — produces `AGENT_BRIEF.md` for the implementation agent

### Part 2: Implementation & Validation (all use smaller model)
- Phases 0-6 follow `AGENT_BRIEF.md` and `docs/implementation/phase-*.md`
- Phase 7 implements the playtest framework from Stage 8 spec §14 and runs it
- Uses a smaller/cheaper model — all creative decisions were made in Part 1
- Playtest fix playbook is deterministic — no judgment needed
- Estimated timeline: 16-20 weeks for MVP (see `docs/design/12-scope-and-risks.md`)

### Part 3: Ship
- Stage 9 (Ship) uses validated game (Phase 7 passed) + Stage 8 (architecture) + Stage 2A (store UX, settings)
- Uses a capable model for store listing copy, legal review, and cross-reference audit
