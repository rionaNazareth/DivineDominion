# Stage 5: Narrative & Content — COMPLETE

> **Goal:** Write all narrative text and content data — event templates, rival religions, era narratives, endings, and LLM fallbacks. Full-vision scope: 80 events, 8-12 religions, 50 commandments with flavor text.
>
> **Estimated sessions:** 4-6 (expanded from 2-3 due to full-vision scope)
>
> **Depends on:** Stage 4 (nation AI, religion rules). Note: Prototype Checkpoint is listed as a dependency in the pipeline but content generation is independent of simulation validation — the checkpoint validates formulas, not narrative text. Stage 5 was completed before the Prototype Checkpoint.
>
> **Status:** COMPLETE. All deliverables produced. Expert review passed (15 red flags resolved, 10 yellow flags addressed, 11 blind spots documented). Sign-off confirmed.

### Stage 2B Additions

Content must include Stage 2B narrative and feedback text:

- **Petition templates for 5 voice types** — Text templates for each Follower Voice type’s petition requests
- **Combo discovery text** — Player-facing text when Power Combos are discovered or triggered
- **Whisper feedback text** — Feedback shown when Divine Whispers influence nations (success, partial, resisted)
- **Voice names per era** — Era-appropriate naming conventions for Follower Voices

### Harbinger Deliverables

- Harbinger discovery event chain text (Eras 7-12): 3-4 narrative events building from "strange signal" to "confirmation"
- Era 9 confirmation event text (special auto-pause event: "You sense it now — a presence...")
- Follower Voice Harbinger-sensing petition templates (Prophet and Scholar variants, Era 8+)
- "⚠ Data unreliable" overlay indicator text
- Earth History reveal text for Harbinger-caused events ("You didn't know it at the time, but...")
- Harbinger-influenced Heretic emergence text (late-game variant)
- Reference: `docs/design/14-harbinger.md`

---

## Agent Prompt

```
You are a Narrative Designer and Content Writer for strategy/simulation games. You've written event systems for games like Crusader Kings, Stellaris, and RimWorld. You understand procedural narrative — text that feels authored but is generated from templates and variables.

Read these files first:
- docs/design/02-narrative.md
- docs/design/08-events.md
- docs/design/10-llm-integration.md
- docs/design/07-eras-and-endgame.md
- docs/design/03-commandments.md
- docs/design/05-religions.md
- docs/design/06-divine-powers.md (combos and whispers needing discovery/feedback text)
- docs/design/09-ui-and-visuals.md (tutorial UI elements for deliverable 11)
- docs/design/09c-in-game-interactions.md (Stage 2B interaction specs — whisper, combo, voice UI text)
- docs/design/13-follower-voices.md (voice types, petition UI for templates)
- docs/design/14-harbinger.md (Harbinger discovery chain, Era 9 confirmation, heretic text)
- docs/design/formulas.md (from Stage 3)
- docs/design/constants.md
- src/types/game.ts

Your job is to write the actual content players will see — not just templates, but real text — and define the complete event system data. Full-vision scope: 80 event templates across 8 categories, 8-12 rival religions, flavor text for all 50 commandments (35 base + 15 unlockable).

SCOPE NOTE: We are targeting full vision, not MVP. The content is additive (more rows in the same schema), not structurally different. Write events in batches of 10, reviewing quality after each batch to prevent quality drop-off at scale. Rival religions beyond 5 follow the same data shape — no new systems needed.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

1. FIRST-RUN INTRO SEQUENCE — Exact text the player reads when starting their first Earth. Should establish:
   - The player's identity as a god
   - The multiverse framing (infinite Earths to guide)
   - The stakes (your religion must thrive)
   - Tone: mythic but not pompous, a hint of dark humor

2. RETURNING-PLAYER INTRO VARIANTS — 5 versions for:
   - Earth 2 (first retry — "You've seen how it ends. Try again.")
   - Earth 3 (pattern forming — reference prior failures)
   - Earth 5 (veteran — brief, confident)
   - Earth 10 (old god — weary, determined)
   - Earth 20+ (eternal — cosmic perspective)

3. ERA TRANSITION NARRATIVE TEMPLATES — One per era (12 total):
   - Template structure with variable slots ({nationName}, {religionName}, {warCount}, {dominantTech}, etc.)
   - 3 example fills per template showing different world states
   - Tone should shift: Renaissance (hopeful) → Industrial (ambitious) → Modern (anxious) → Space (urgent)

4. ALIEN REVELATION SEQUENCE — Exact text for each reveal stage:
   - 1950: first anomaly (subtle, deniable)
   - 2000: confirmed signal (unsettling)
   - 2050: visual confirmation (frightening)
   - 2100: approach trajectory (urgent)
   - 2150: arrival / endgame (climactic)

5. ENDING NARRATIVES — Exact text for all ending types:
   - Victory: humanity defends (triumph)
   - Victory: humanity befriends aliens (hope)
   - Defeat: overrun (tragedy)
   - Defeat: humanity self-destructs before aliens arrive (irony)
   - Stalemate: partial survival (bittersweet)
   - Special: player abandoned followers (judgment)

6. COMMANDMENT FLAVOR TEXT — Review all commandments and ensure each has:
   - A "scripture" line (how believers recite it)
   - A "effect" description (what it does in-game, player-facing)
   - Consistent tone across all commandments

7. EVENT TEMPLATE SCHEMA — Define the exact TypeScript structure:
   - All fields with types and descriptions
   - Trigger condition format
   - Weight calculation format
   - Choice/outcome format
   - Auto-resolve format

8. 80 EVENT TEMPLATES — Across 8 categories (10 per category):
   Categories: War & Conflict, Faith & Religion, Nature & Disease, Economy & Trade, Science & Discovery, Social & Culture, Internal/Political, Alien (era-gated)
   Each event must have:
   - Title and description (with variable slots)
   - Trigger conditions (era range, nation/religion state)
   - Base weight + modifier formula
   - 2-3 player choices with exact numerical outcomes
   - Auto-resolve outcome (for when the player doesn't intervene)
   
   QUALITY CONTROL: Write in batches of 10. After each batch, produce a STRUCTURED BATCH SUMMARY as JSON:
   ```json
   {
     "batch": 1,
     "category": "War & Conflict",
     "event_count": 10,
     "events": [
       {
         "id": "EVT_001",
         "title": "Border Skirmish",
         "era_range": [1, 12],
         "trigger_hash": "military_imbalance+border_tension",
         "choice_count": 3
       }
     ],
     "duplicate_trigger_check": "none found",
     "quality_notes": "all choices meaningfully different"
   }
   ```
   The batch summary enables automated verification:
   - event_count MUST equal 10 (hard fail if not)
   - trigger_hash must be unique across ALL batches (not just within one batch)
   - Running total must reach exactly 80 after 8 batches
   
   Present the first batch (10 events + batch summary) for human review before continuing.
   After ALL 8 batches, produce a MASTER EVENT INDEX: a single JSON array of all 80 event IDs, titles, categories, and trigger_hashes. This becomes the verification artifact.

9. 8-12 RIVAL RELIGION DEFINITIONS — Each with:
   - Name, symbol description, color (hex)
   - 10 commandments (from the available pool)
   - 3 hidden divine rules (condition → effect)
   - Personality archetype
   - Flavor text (how followers describe their god)

10. LLM FALLBACK TEMPLATES — For every LLM call type:
    - Rival religion generation fallback (if LLM fails, use which preset?)
    - Era narrative fallback (template fill without LLM)
    - Endgame summary fallback
    - Each fallback must be indistinguishable from LLM output in quality

11. TUTORIAL SCRIPT TEXT — The exact words shown during onboarding:
    - Every tutorial callout/tooltip from the Stage 2A tutorial flow
    - Tone-consistent with the rest of the narrative
    - Brief and action-oriented ("Tap your followers to see their faith" not "This is the region panel which shows...")

12. ERROR MESSAGE COPY — User-facing text for edge cases:
    - Save failed: reassuring, actionable ("Couldn't save. We'll try again in a moment.")
    - Corrupted save: empathetic, clear options ("Something went wrong. Start fresh or try your last save?")
    - Purchase failed: helpful ("Purchase didn't go through. Check your connection and try again.")
    - Generic fallback: calm, not technical

13. STAGE 2B NARRATIVE TEXT — Content for Stage 2B interaction systems:
    - **Petition templates for 5 voice types** — Text templates for each Follower Voice type's petition requests (Prophet, Ruler, General, Scholar, Heretic)
    - **Combo discovery text** — Player-facing "Divine Chain" toast text when each of the 9 Power Combos is discovered
    - **Whisper feedback text** — Text shown when Divine Whispers influence nations (success, partial, resisted variants for all 4 whisper types + targeted War/Peace variants)
    - **Voice names per era** — Era-appropriate naming conventions for Follower Voices across all 12 eras

14. HARBINGER NARRATIVE — Content for the alien saboteur storyline:
    - Harbinger discovery event chain text (Eras 7-12): 3-4 narrative events building from "strange signal" to "confirmation"
    - Era 9 confirmation event text (special auto-pause event)
    - Follower Voice Harbinger-sensing petition templates (Prophet and Scholar variants, Era 8+)
    - "Data unreliable" overlay indicator text
    - Earth History reveal text for Harbinger-caused events ("You didn't know it at the time, but...")
    - Harbinger-influenced Heretic emergence text (late-game variant)
    - Reference: docs/design/14-harbinger.md

Update these files:
- docs/design/02-narrative.md — Intro sequences, endings, alien reveals (split to 02b if exceeds 300 lines)
- docs/design/03-commandments.md — Commandment flavor text (scripture lines, effect descriptions) + 15 unlockable commandments
- docs/design/05-religions.md — Rival religion system updates (split premade religions to 05b if needed)
- docs/design/06-divine-powers.md — Combo discovery text, whisper feedback text
- docs/design/08-events.md — Event schema, event system updates
- docs/design/10-llm-integration.md — Fallback templates
- docs/design/13-follower-voices.md — Voice names per era, petition templates per voice type
- docs/design/constants.md — Any new content-related constants
- src/config/constants.ts — Synced with constants.md

Important notes on events:
- Map Stage 5 categories to 08-events.md EventCategory enum. Some Stage 5 categories map to multiple enum values: War & Conflict → military + political (split ~5/5); Faith & Religion → religious; Nature & Disease → natural; Economy & Trade → economic (mapped to political or internal as needed); Science & Discovery → scientific; Social & Culture → cultural; Internal/Political → internal; Alien → alien (era-gated, ~2 events per reveal stage). Total must be exactly 80 events across all mappings.
- Provide 2-3 fully worked example events (complete trigger, weight, outcomes) BEFORE generating all 80. Use these as the quality standard.
- Each event must have a distinct trigger niche — no two events with identical trigger conditions.
- Write in batches of 10. Present the first batch (10 events) for human quality review before continuing.
- After all 80 are written, review the last 20 specifically for quality drop-off.

Important notes on religions:
- The first 5 religions should cover the core personality archetypes (peaceful, expansionist, scholarly, apocalyptic, syncretic).
- Religions 6-12 should add variety without duplicating archetypes. Consider: isolationist, mercantile, mystical, revolutionary, traditionalist, nomadic, hedonistic.
- All religions use the same data schema — no new fields or systems needed beyond 5.

Important notes on commandments:
- 35 base commandments already exist in 03-commandments.md. Add flavor text (scripture + effect description) to all 35.
- Design 15 unlockable commandments following the same category structure (7 categories). Distribute ~2 per category.
- Unlockable commandments should enable NEW strategies, not just be stronger versions of existing ones.

Quality gate: You can read through a full 4-hour game's narrative beats (intro → 12 era summaries → alien reveals → ending) and it feels like a complete, coherent story. The 80 events cover all eras and categories without repetition. All 50 commandments have flavor text.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Narrative tone:** Mythic-serious (Bible, epic poetry) / Mythic with dark humor (Pratchett, Hades) / Detached cosmic (Hitchhiker's, Outer Wilds) | Every line of text — intro, events, endings — follows this tone. Wrong tone = the game feels off even if mechanics are perfect. |
| 2 | **Alien reveal pacing:** Subtle hints from Era 1 / Nothing until Era 9 (sudden shock) / Gradual 5-stage reveal (current design) | Determines whether the twist is a slow burn or a gut punch. Affects replay value and first-run surprise. |
| 3 | **Event choice philosophy:** Always a "right" answer (player skill) / No right answer (all tradeoffs) / Mix (some clear, some ambiguous) | Pure tradeoffs feel mature but can frustrate. Clear answers reward mastery but reduce replayability. |
| 4 | **Rival religion themes:** Real-world inspired (recognizable archetypes) / Fully fictional (alien-feeling faiths) / Mix (some familiar, some strange) | Real-world echoes create instant recognition but risk offense. Fully fictional is safer but less resonant. |
| 5 | **Commandment flavor text style:** Brief and mechanical ("Followers prioritize education") / Scriptural and evocative ("Let knowledge be thy sword") / Both (scripture + mechanical note) | Affects whether commandment selection feels like game setup or world-building. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., specific event trigger conditions, religion color choices)
3. **Biggest risk** — which content decision is most likely to feel wrong during playtesting?
4. **Open question** — "Read the first-run intro and one sample event. Do they feel right?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/02-narrative.md` | Current narrative structure |
| `docs/design/03-commandments.md` | Commandment list |
| `docs/design/05-religions.md` | Religion system |
| `docs/design/06-divine-powers.md` | Combos and whispers needing text |
| `docs/design/07-eras-and-endgame.md` | Era structure, alien clock |
| `docs/design/08-events.md` | Current event system |
| `docs/design/09-ui-and-visuals.md` | Tutorial UI elements for script text |
| `docs/design/09c-in-game-interactions.md` | Stage 2B interaction specs |
| `docs/design/10-llm-integration.md` | LLM usage, fallbacks |
| `docs/design/13-follower-voices.md` | Voice types, petition UI |
| `docs/design/14-harbinger.md` | Harbinger discovery chain, sabotage text |
| `docs/design/formulas.md` | System formulas (for event outcomes) |
| `docs/design/constants.md` | Current constants |
| `src/types/game.ts` | Type definitions for events |

## Output Files (Modified/Created)

| File | What changes |
|------|-------------|
| `docs/design/02-narrative.md` | Intro sequences, endings, alien reveals |
| `docs/design/02b-era-narratives.md` | **NEW** — Era transition templates (split from 02-narrative.md for 300-line limit) |
| `docs/design/03-commandments.md` | Commandment flavor text (scripture, effects) + 15 unlockable commandments |
| `docs/design/05-religions.md` | Rival religion system updates, archetype disclaimer |
| `docs/design/05b-religions-premade.md` | **NEW** — 10 pre-made rival religions (split from 05-religions.md) |
| `docs/design/06-divine-powers.md` | Combo discovery text, whisper feedback text |
| `docs/design/08-events.md` | Event schema, event system updates |
| `docs/design/event-index.json` | **NEW** — Machine-readable data for all 80 events |
| `docs/design/10-llm-integration.md` | Fallback templates |
| `docs/design/13-follower-voices.md` | Voice names per era, petition templates per voice type |
| `docs/design/constants.md` | Content-related constants (event counts, cooldowns, etc.) |
| `src/config/constants.ts` | Synced with constants.md |
| `src/types/game.ts` | EffectTarget type, economyChange field |

## Quality Gate

- [x] First-run intro establishes god identity and stakes
- [x] 5 returning-player variants feel distinct
- [x] 12 era templates have variable slots AND 3 example fills each
- [x] Alien reveal sequence builds tension across 5 stages
- [x] All 6 ending types have complete text
- [x] 80 events have trigger conditions, weights, choices, and outcomes
- [x] No two events share identical trigger conditions
- [x] All 8 event categories have at least 8 events each
- [x] 8-12 rival religions have full definitions (commandments, rules, personality)
- [x] No two rival religions share the same personality archetype (variants of the same archetype are acceptable if commandments and hidden rules are distinct — required when pool > 8)
- [x] Every LLM call has a fallback that matches LLM quality
- [x] All 50 commandments (35 base + 15 unlockable) have flavor text (scripture + effect)
- [x] 15 unlockable commandments enable new strategies, not just stronger versions
- [x] Event quality is consistent across all 80 (no drop-off in later batches)
- [x] Event categories map correctly to 08-events.md categories
- [x] Master event index (event-index.json) has exactly 80 entries
- [x] All trigger_hashes in event-index.json are unique (no duplicates)
- [x] All commandment IDs in events and religions reference valid IDs from 03-commandments.md
- [x] All variable slots in event templates match fields in game.ts
- [x] 8 batch summaries produced with event_count=10 each
- [x] Verification subagent passed (see pipeline INDEX — Verification Subagent Protocol)
- [x] Consistency audit passed (`scripts/audit-consistency.sh`)
- [x] All changes follow design-change protocol
