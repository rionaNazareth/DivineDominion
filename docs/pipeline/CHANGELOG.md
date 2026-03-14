# DIVINE DOMINION — Pipeline Changelog

> **Human reference only.** This file documents what changed from the original 12-stage pipeline and why. Agents do not need to read this file.

Based on pre-review by a Mobile Game Director (15+ years) and Indie Game Studio CEO (4 shipped titles with AI agents):

| Change | Reason |
|--------|--------|
| 12 stages merged to 9 | Too many context switches for a solo designer |
| UX moved before Systems (Stage 2) | Formulas must respect mobile interaction constraints |
| Balance moved after Content (Stage 6) | Can't balance commandments without knowing the events they interact with |
| Narrative + Events merged (Stage 5) | Both are content; one agent handles both coherently |
| Art + Sound merged (Stage 7) | Both are asset specs; should stay consistent |
| Tech + QA merged (Stage 8) | Architecture and test invariants are the same design pass |
| Prototype checkpoint added | Validate simulation before designing content, balance, and visuals |
| Playtest framework designed in Stage 8, executed in Phase 7 | Automated playtesting replaces manual beta testers. Framework spec (thresholds, fix playbook, strategies) defined in design pipeline so a small model can execute it mechanically during implementation |
| Ship Readiness stage added (Stage 9) | Monetization, analytics, store listing, privacy — everything needed to actually ship |
| Retention + FTUE added to Stage 1 | Mobile churn is highest in first 5 minutes; must be designed upfront |
| Content expanded to full vision | 80 events, 8-12 religions, 50 commandments. Content is additive (same schema, more rows), not structurally different. Main complexity risk is commandment balance at 50 — addressed with category-level balancing and 20 Monte Carlo scenarios in Stage 6 |
| Stage 3 formula validation protocol added | Three mandatory validation steps (formula walkthrough, edge case audit, cross-formula integration) prevent rushing the simulation foundation |
| Constants sync check added to every stage | Mandatory cross-doc number consistency check before sign-off catches value drift early |
| Localization permanently cut | English-only; narrative tone doesn't survive translation; cost-prohibitive for solo indie |
| Every stage requires testable output | Prose doesn't translate to agent-implementable code; types/constants/tests do |
| UX split into 2A (Screens) + 2B (Interactions) | Stage 2 had 17+ deliverables — too large for one session. 2A handles menus/store/history/settings; 2B handles HUD/powers/events/overlays |
| 2A → 2B handoff protocol added | Split stages risk UX inconsistency. 2A now produces an explicit handoff (settings→behavior map, tutorial callout targets, shared design tokens, error state ownership) that 2B must comply with |
| Stage 3 mandatory interim checkpoint added | 13 deliverables + validation is too critical for one pass. Agent must stop after deliverable 6 (core simulation), get human sign-off, then continue to deliverables 7-13 (game systems). Battle walkthrough runs immediately after deliverable 2 |
| Stage 3 structured formula output format added | Every formula must use a fixed template (inputs, formula, output, edge cases, constants) to prevent ambiguity and quality drift across 13 deliverables |
| Auto-save, speed control added to Stage 3 | Pause/resume pillar depends on save timing; 2×/4× speed undefined without tick-rate formula |
| Tutorial script, error copy added to Stage 5 | Tutorial callouts need actual words; error messages need to feel human |
| Device matrix, corrupted save added to Stage 8 | "Test on mobile" isn't a plan; corrupted saves need graceful recovery |
| Beta plan, legal, Data Safety added to Stage 9 | Can't ship without testing, EULA, or Data Safety form. Lose keystore = can never update |
| Verification Subagent Protocol added for critical stages | LLMs checking their own work is unreliable. Stages 3, 5, 6, 8 get a separate verification agent that checks completeness and consistency with fresh context — catches skips, math errors, and contradictions the author agent misses |
| Stage 3 independent formula verification session | A fresh agent recomputes 6 formula walkthroughs with fixed inputs. If results differ from the author's walkthroughs, the formula is wrong. Eliminates self-verification blindness on the most critical stage |
| Stage 5 structured JSON event batches + master index | Events produced in batches of 10 with JSON summaries (count, trigger hashes). Master event-index.json enables automated duplicate-trigger detection. Prevents quality drift and silent skips across 80 events |
| Stage 6 Monte Carlo scenarios as executable JSON | `monte-carlo-scenarios.json` with exact schema that the playtest harness loads directly. Eliminates prose specs that can't be run. Forces exact IDs, exact win rates, exact seeds |
| Stage 8 cross-stage consistency audit | Mandatory audit of all naming, IDs, and values across design docs, types, and constants before committing. Catches the #1 source of downstream bugs: cross-file drift |
| `scripts/audit-consistency.sh` added | Automated 18-check script comparing constants.md vs constants.ts, milestone counts, era counts, power counts. Run after every stage. Zero-tolerance for mismatches |
| Stage 2B expanded scope: 3 new engagement systems | Fun factor analysis revealed passive gameplay gaps. Added Divine Whispers (free micro-nudges), Power Combos (chain reactions), and Follower Voices (named petitioning characters). Also added Progressive Power Unlock and Smart Context FAB to manage complexity. Created new doc `13-follower-voices.md` and new interaction spec `09c-in-game-interactions.md` |
| `09c-in-game-interactions.md` split from `09-ui-and-visuals.md` | Stage 2B interaction specs exceeded the 300-line limit. `09-ui-and-visuals.md` retains art style, map visuals, VFX, SFX. `09c` holds all 11 interaction specifications |
| The Harbinger: alien saboteur AI added | Transforms the alien invasion from a passive timer into an active antagonist. Transmitted alien intelligence (not a god) with 6 sabotage actions, adaptive targeting, rubber banding. Dormant Eras 1-6, active 7+. Created `14-harbinger.md`. Pillar 2 reworded. All pipeline stages and implementation phases annotated with Harbinger deliverables. Concept-level doc — detailed formulas, AI trees, and balance numbers owned by Stages 3, 4, 6 respectively |
| Divine Purge combo added | Shield of Faith + Miracle on a Harbinger-corrupted region = removes corruption + immunizes for 1 era. Power Combos count updated from 8 to 9 |
| Post-integration sync pass | Added Harbinger cross-references to 6 design docs (04-world, 05-religions, 07-eras, 08-events, 09-ui, 09c). Fixed combo count 8→9 in constants.md, constants.ts, 12-scope, INDEX.md, stage-02b. Added Harbinger-as-scout section to 07-eras-and-endgame.md. Added Harbinger-caused events to 08-events.md. Verified all constants in sync. |
