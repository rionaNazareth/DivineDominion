# Stage 1: Game Director & Vision Lock

> **Goal:** Lock the game's identity — what it is, who it's for, what gets cut, and what the first 5 minutes feel like.
>
> **Estimated sessions:** 1-2

---

## Agent Prompt

Copy this into a new chat session:

```
You are a Senior Game Director with 15+ years shipping mobile strategy games (god games, 4X-lite, simulation). You have shipped 6 mobile titles with >1M downloads each.

Read these files first:
- docs/design/01-overview.md
- docs/design/02-narrative.md
- docs/design/07-eras-and-endgame.md
- docs/design/09-ui-and-visuals.md
- docs/design/11-tech.md
- docs/design/12-scope-and-risks.md
- docs/INDEX.md

Your job is to finalize the game's vision, define the target player, design the first-time user experience, establish retention pillars, make the engine decision, and produce a kill list of features to defer.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables. Do not proceed until every one is complete:

1. VISION STATEMENT — Rewrite 01-overview.md Section 1 with a finalized 1-paragraph elevator pitch and 3-5 design pillars. Each pillar gets a one-sentence description and one concrete "this means..." example.

2. TARGET PLAYER PERSONA — Add a new section to 01-overview.md defining:
   - Demographics (age, platform, play context)
   - Gaming background (what games they play now)
   - Session pattern (when, how long, how often)
   - Motivation profile (Bartle type, what "fun" means to them)

3. SESSION DESIGN — Add a new section to 01-overview.md specifying:
   - First session flow (minute by minute, what the player does)
   - Returning session flow (what they see on app open, "what happened while away")
   - Session 2 hook (why they come back tomorrow)
   - Pause/resume behavior (what state is saved, what resuming looks like)

4. FIRST-TIME USER EXPERIENCE (FTUE) — Add to 01-overview.md:
   - Exact sequence of screens/interactions for a brand new player
   - What is explained and what is discovered
   - The "aha moment" — when the player first feels like a god
   - Commandment selection onboarding (how to make 50 options not overwhelming)

5. RETENTION PILLARS — Add to 01-overview.md:
   - 3-5 specific reasons players start a new Earth after finishing one
   - Meta-progression design (unlocks, achievements, stats across Earths)
   - Daily/weekly hooks (if any)
   - What makes Earth #5 different from Earth #1

6. BUSINESS MODEL DECISION — Add to 01-overview.md:
   - Choose one: premium ($), free with ads, free with IAP, free with tip jar
   - Justify the choice for this game type and audience
   - If IAP: what is sold (cosmetics only? convenience? content?)
   - LLM cost consideration (~17 calls per game at scale)

7. CORE LOOP TIMING VALIDATION — Review and update 01-overview.md:
   - Is 4 hours per Earth correct? Validate with session math.
   - Is 10-20 min per session satisfying? What happens in one session?
   - How many sessions per Earth? Does that feel right?
   - Are 12 eras too many? Too few?

8. ENGINE DECISION — Add to 11-tech.md:
   - Choose: Phaser 3 vs PixiJS vs plain Canvas/SVG
   - Justify based on: mobile performance, agent-friendliness (docs, examples), 2D vector rendering, animation support, bundle size
   - Specify exact version

9. KILL LIST — Add to 12-scope-and-risks.md:
   - Features to CUT entirely (never build)
   - Features to DEFER to post-launch (build later)
   - Features that are MVP-essential (must ship)
   - For each deferred feature: why it's safe to defer

Quality gate: You can describe exactly what a player does in their first, fifth, and twentieth session — minute by minute — and it sounds fun.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Business model:** Premium ($3-7) / Free with cosmetic IAP / Free with ads + tip jar | Determines audience size, monetization surface, and whether live-service mechanics are needed. Irreversible once UX is designed around it. |
| 2 | **Target player archetype:** Present 2-3 persona sketches (e.g., "Strategy commuter" vs. "Weekend deep-diver" vs. "Idle-curious tapper") | Every UX, pacing, and complexity decision flows from who the player is. |
| 3 | **Session length target:** 10-15 min / 15-25 min / 30-60 min | Affects era count, event density, and how much a single session resolves. |
| 4 | **FTUE approach:** Archetype starter packs / Guided builder (one-at-a-time) / Personality quiz → auto-build | How new players meet 50 commandments. Getting this wrong = high churn. |
| 5 | **Engine:** Phaser 3 vs PixiJS vs plain Canvas/SVG | Locks the rendering stack for the entire project. Present comparison table. |
| 6 | **Kill list review:** Present each CUT and DEFER candidate individually | The human must confirm scope cuts. Don't silently decide what gets shipped. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., "12 eras, not 8 or 16")
3. **Biggest risk** — which decision would cause the most rework if wrong?
4. **Open question** — "Is anything here surprising or wrong?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/01-overview.md` | Current vision, pillars, core loop |
| `docs/design/02-narrative.md` | Multiverse framing, win/lose conditions |
| `docs/design/07-eras-and-endgame.md` | Era pacing, alien clock |
| `docs/design/09-ui-and-visuals.md` | Current mobile UI approach |
| `docs/design/11-tech.md` | Tech stack, engine options |
| `docs/design/12-scope-and-risks.md` | Current MVP scope, risks |
| `docs/INDEX.md` | Project structure, glossary |

## Output Files (Modified)

| File | What changes |
|------|-------------|
| `docs/design/01-overview.md` | Vision, persona, FTUE, session design, retention, business model |
| `docs/design/11-tech.md` | Engine decision |
| `docs/design/12-scope-and-risks.md` | Kill list |

## Quality Gate

- [x] Vision statement is one paragraph, clear enough for a stranger to understand
- [x] Target player persona is specific (not "everyone")
- [x] First session is described minute-by-minute
- [x] Session 2 hook is concrete and compelling
- [x] FTUE doesn't overwhelm (50 commandments → manageable selection)
- [x] At least 5 features on the kill/defer list
- [x] Engine decision is final with justification
- [x] All changes follow design-change protocol (`.cursor/rules/design-changes.mdc`)
