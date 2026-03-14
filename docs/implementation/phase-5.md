# Phase 5 — Content Data

> Prerequisites: Phase 4 complete.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [03-commandments](../design/03-commandments.md) · [05-religions](../design/05-religions.md) · [08-events](../design/08-events.md)

---

## Reading List

Read these before writing any code:

- **Types:** `src/types/game.ts` — `Commandment`, `CommandmentEffects`, `GameEvent`, `RivalReligion`, `HiddenRule`
- **Design:** `docs/design/03-commandments.md` — commandment system, 50 commandments, flavor text
- **Design:** `docs/design/05-religions.md` — rival religions, hidden rules schema
- **Design:** `docs/design/05b-religions-premade.md` — the 10 pre-made rival religions (authoritative source)
- **Design:** `docs/design/08-events.md` — event system, categories, choices
- **Design:** `docs/design/event-index.json` — master event index (80 events)
- **Design:** `docs/design/02b-era-narratives.md` — era narrative templates
- **Design:** `docs/design/constants.md` — verify `RIVAL_RELIGIONS_PREMADE_POOL: 10`

---

## 5.1 Commandment Data — Finalize

Review and finalize the 50 commandment definitions created in Phase 0.4 (`src/config/commandments.ts`). Do NOT recreate from scratch — the file already exists.

- Verify all 50 commandments have complete `effects` objects with correct numerical modifiers from `docs/design/03-commandments.md`
- Verify all flavor text is filled in (not placeholder)
- Verify all tension pairs are bidirectional
- Verify unlock conditions for the 15 unlockable commandments match design doc
- Fix any values that don't match the design doc

---

## 5.2 Event Template Data

50–80 event templates across 8 categories.

- Categories: religious, political, scientific, natural, cultural, military, internal, alien
- Variable fills (region name, nation name, year, etc.)
- Choices with binary/ternary options
- Outcome effects

---

## 5.3 Pre-made Rival Religion Templates

10 religions as fallback data (matches `RIVAL_RELIGIONS_PREMADE_POOL: 10` in `constants.md` and the 10 religions defined in `docs/design/05b-religions-premade.md`).

- Name
- Commandments (10 each)
- Hidden rules (3 per religion)
- Personality (peaceful, expansionist, scholarly, militant, etc.)

---

## 5.4 Narrative Templates

- Era summary templates (fallback when LLM unavailable)
- Alien revelation text
- Endgame text (win/lose variants)
- Religion origin text

---

## 5.5 Content Integrity Validation Tests

Create `src/simulation/__tests__/content-integrity.test.ts` — validates all content data.

**Tests:**
- Event template count >= 50 (target 80, but at least 50 for MVP)
- Religion template count = 10 (matches `RIVAL_RELIGIONS_PREMADE_POOL` constant)
- Every event template has required fields: `id`, `category`, `weight`, `choices` (at least 2)
- Every event category is in valid set: religious, political, scientific, natural, cultural, military, internal, alien
- All event template IDs are unique
- All religion template IDs are unique
- Every commandment ID referenced in religion templates exists in `BASE_COMMANDMENTS` or unlockable commandments
- Every religion has exactly 10 commandments and 3 hidden rules
