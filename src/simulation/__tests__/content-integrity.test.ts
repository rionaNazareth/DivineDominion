// =============================================================================
// DIVINE DOMINION — Content Data Integrity Tests
// =============================================================================
// Phase 5.5 — validates all content data files
// See docs/implementation/phase-5.md §5.5
// =============================================================================

import { describe, it, expect } from 'vitest';
import { ALL_EVENT_TEMPLATES, VALID_EVENT_CATEGORIES } from '../../config/events.js';
import { PREMADE_RIVAL_RELIGIONS } from '../../config/rival-religions.js';
import { ERA_NARRATIVE_TEMPLATES, ENDGAME_NARRATIVES } from '../../config/narratives.js';
import { ALL_COMMANDMENTS, BASE_COMMANDMENTS, UNLOCKABLE_COMMANDMENTS } from '../../config/commandments.js';
import { WORLD_GEN, SPEED, ERAS, COMMANDMENTS } from '../../config/constants.js';
import type { EndingType } from '../../types/game.js';

// ---------------------------------------------------------------------------
// Event template tests
// ---------------------------------------------------------------------------

describe('Event templates', () => {
  it('has at least 50 event templates (target 80)', () => {
    expect(ALL_EVENT_TEMPLATES.length).toBeGreaterThanOrEqual(50);
  });

  it('has exactly 80 event templates', () => {
    expect(ALL_EVENT_TEMPLATES.length).toBe(SPEED.EVENT_TEMPLATE_COUNT);
  });

  it('all event template IDs are unique', () => {
    const ids = ALL_EVENT_TEMPLATES.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all event templates have required fields: id, category, baseWeight, choices', () => {
    for (const t of ALL_EVENT_TEMPLATES) {
      expect(t.id, `${t.id}: missing id`).toBeTruthy();
      expect(t.category, `${t.id}: missing category`).toBeTruthy();
      expect(typeof t.baseWeight, `${t.id}: baseWeight must be number`).toBe('number');
      expect(t.choices.length, `${t.id}: must have at least 2 choices`).toBeGreaterThanOrEqual(2);
    }
  });

  it('all event categories are valid', () => {
    const validSet = new Set(VALID_EVENT_CATEGORIES);
    for (const t of ALL_EVENT_TEMPLATES) {
      expect(
        validSet.has(t.category),
        `${t.id}: invalid category '${t.category}'`,
      ).toBe(true);
    }
  });

  it('has 8 valid event categories', () => {
    expect(VALID_EVENT_CATEGORIES.length).toBe(SPEED.EVENT_CATEGORY_COUNT);
  });

  it('has exactly 10 events per category', () => {
    for (const cat of VALID_EVENT_CATEGORIES) {
      const count = ALL_EVENT_TEMPLATES.filter((t) => t.category === cat).length;
      expect(count, `Category '${cat}' has ${count} events, expected ${SPEED.EVENTS_PER_CATEGORY}`).toBe(
        SPEED.EVENTS_PER_CATEGORY,
      );
    }
  });

  it('all event IDs follow EVT_NNN format', () => {
    const pattern = /^EVT_\d{3}$/;
    for (const t of ALL_EVENT_TEMPLATES) {
      expect(pattern.test(t.id), `${t.id}: ID must match EVT_NNN format`).toBe(true);
    }
  });

  it('event IDs are sequentially numbered EVT_001 through EVT_080', () => {
    const ids = ALL_EVENT_TEMPLATES.map((t) => t.id).sort();
    expect(ids[0]).toBe('EVT_001');
    expect(ids[ids.length - 1]).toBe('EVT_080');
  });

  it('all event templates have auto-resolve outcome', () => {
    for (const t of ALL_EVENT_TEMPLATES) {
      expect(t.autoResolve, `${t.id}: missing autoResolve`).toBeDefined();
      expect(t.autoResolve.narrativeText, `${t.id}: autoResolve missing narrativeText`).toBeTruthy();
    }
  });

  it('all event choice outcomes have narrative text', () => {
    for (const t of ALL_EVENT_TEMPLATES) {
      for (const choice of t.choices) {
        expect(
          choice.outcome.narrativeText,
          `${t.id} choice '${choice.label}': missing narrativeText`,
        ).toBeTruthy();
      }
    }
  });

  it('event era ranges are valid (1-12, start <= end)', () => {
    for (const t of ALL_EVENT_TEMPLATES) {
      const [start, end] = t.eraRange;
      expect(start, `${t.id}: eraRange start must be >= 1`).toBeGreaterThanOrEqual(1);
      expect(end, `${t.id}: eraRange end must be <= 12`).toBeLessThanOrEqual(12);
      expect(start, `${t.id}: eraRange start must be <= end`).toBeLessThanOrEqual(end);
    }
  });

  it('alien events are only in eras 7-12', () => {
    const alienEvents = ALL_EVENT_TEMPLATES.filter((t) => t.category === 'alien');
    for (const t of alienEvents) {
      expect(
        t.eraRange[0],
        `${t.id}: alien events must start at era 7 or later`,
      ).toBeGreaterThanOrEqual(7);
    }
  });

  it('EVT_003, EVT_024, EVT_035, EVT_055 are marked alienCaused', () => {
    const alienCausedIds = ['EVT_003', 'EVT_024', 'EVT_035', 'EVT_055'];
    for (const id of alienCausedIds) {
      const t = ALL_EVENT_TEMPLATES.find((e) => e.id === id);
      expect(t, `${id}: not found`).toBeDefined();
      expect(t?.alienCaused, `${id}: must be marked alienCaused`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Rival religion template tests
// ---------------------------------------------------------------------------

describe('Rival religion templates', () => {
  it('has exactly 10 pre-made rival religions', () => {
    expect(PREMADE_RIVAL_RELIGIONS.length).toBe(WORLD_GEN.RIVAL_RELIGIONS_PREMADE_POOL);
  });

  it('all religion template IDs are unique', () => {
    const ids = PREMADE_RIVAL_RELIGIONS.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every religion has exactly 10 commandments', () => {
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      expect(
        r.commandments.length,
        `${r.id}: must have 10 commandments, has ${r.commandments.length}`,
      ).toBe(10);
    }
  });

  it('every religion has exactly 3 hidden rules', () => {
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      expect(
        r.hiddenRules.length,
        `${r.id}: must have 3 hidden rules, has ${r.hiddenRules.length}`,
      ).toBe(WORLD_GEN.HIDDEN_RULES_PER_RELIGION);
    }
  });

  it('every commandment ID referenced in religion templates exists in ALL_COMMANDMENTS', () => {
    const allIds = new Set(ALL_COMMANDMENTS.map((c) => c.id));
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      for (const cmdId of r.commandments) {
        expect(
          allIds.has(cmdId),
          `${r.id}: commandment '${cmdId}' not found in ALL_COMMANDMENTS`,
        ).toBe(true);
      }
    }
  });

  it('all religion templates have valid personality values', () => {
    const validPersonalities = new Set([
      'peaceful', 'expansionist', 'scholarly', 'militant',
      'apocalyptic', 'isolationist', 'syncretic', 'mercantile',
    ]);
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      expect(
        validPersonalities.has(r.personality),
        `${r.id}: invalid personality '${r.personality}'`,
      ).toBe(true);
    }
  });

  it('every religion has name, color, symbol, and flavorText', () => {
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      expect(r.name, `${r.id}: missing name`).toBeTruthy();
      expect(r.color, `${r.id}: missing color`).toBeTruthy();
      expect(r.symbol, `${r.id}: missing symbol`).toBeTruthy();
      expect(r.flavorText, `${r.id}: missing flavorText`).toBeTruthy();
    }
  });

  it('hidden rule IDs within each religion are unique', () => {
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      const ruleIds = r.hiddenRules.map((rule) => rule.id);
      const unique = new Set(ruleIds);
      expect(unique.size, `${r.id}: duplicate hidden rule IDs`).toBe(ruleIds.length);
    }
  });

  it('all hidden rule IDs are globally unique across all religions', () => {
    const allRuleIds: string[] = [];
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      for (const rule of r.hiddenRules) {
        allRuleIds.push(rule.id);
      }
    }
    const unique = new Set(allRuleIds);
    expect(unique.size).toBe(allRuleIds.length);
  });
});

// ---------------------------------------------------------------------------
// Narrative template tests
// ---------------------------------------------------------------------------

describe('Narrative templates', () => {
  it('has era narrative templates for all 12 eras', () => {
    const eraIds = ERAS.map((e) => e.id);
    for (const eraId of eraIds) {
      expect(
        ERA_NARRATIVE_TEMPLATES[eraId],
        `Missing narrative template for era '${eraId}'`,
      ).toBeTruthy();
    }
  });

  it('all era narrative templates are non-empty strings', () => {
    for (const [eraId, template] of Object.entries(ERA_NARRATIVE_TEMPLATES)) {
      expect(typeof template, `${eraId}: template must be string`).toBe('string');
      expect(template.length, `${eraId}: template must not be empty`).toBeGreaterThan(0);
    }
  });

  it('has endgame narratives for all 6 ending types', () => {
    const endingTypes: EndingType[] = [
      'united_front', 'lone_guardian', 'survival', 'extinction',
      'self_destruction', 'ascension',
    ];
    const covered = new Set(ENDGAME_NARRATIVES.map((n) => n.ending));
    for (const et of endingTypes) {
      expect(covered.has(et), `Missing endgame narrative for '${et}'`).toBe(true);
    }
  });

  it('all endgame narratives have title and at least one variant', () => {
    for (const n of ENDGAME_NARRATIVES) {
      expect(n.title, `${n.ending}: missing title`).toBeTruthy();
      const hasVariant = !!(n.winVariant || n.loseVariant);
      expect(hasVariant, `${n.ending}: must have winVariant or loseVariant`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-reference: commandments
// ---------------------------------------------------------------------------

describe('Commandment data cross-references', () => {
  it('BASE_COMMANDMENTS count matches COMMANDMENTS.TOTAL_BASE constant', () => {
    expect(BASE_COMMANDMENTS.length).toBe(COMMANDMENTS.TOTAL_BASE);
  });

  it('UNLOCKABLE_COMMANDMENTS count matches expected 15', () => {
    expect(UNLOCKABLE_COMMANDMENTS.length).toBe(15);
  });

  it('ALL_COMMANDMENTS count matches COMMANDMENTS.TOTAL_WITH_UNLOCKS', () => {
    expect(ALL_COMMANDMENTS.length).toBe(COMMANDMENTS.TOTAL_WITH_UNLOCKS);
  });

  it('commandments referenced in rival religions cover all 7 categories', () => {
    const categorySet = new Set<string>();
    for (const r of PREMADE_RIVAL_RELIGIONS) {
      for (const cmdId of r.commandments) {
        const cmd = ALL_COMMANDMENTS.find((c) => c.id === cmdId);
        if (cmd) categorySet.add(cmd.category);
      }
    }
    const expectedCategories = ['expansion', 'conflict', 'knowledge', 'society', 'divine', 'nature', 'morality'];
    for (const cat of expectedCategories) {
      expect(categorySet.has(cat), `No rival religion uses a '${cat}' commandment`).toBe(true);
    }
  });
});

