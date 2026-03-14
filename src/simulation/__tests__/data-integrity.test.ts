import { describe, it, expect } from 'vitest';
import { ALL_COMMANDMENTS, BASE_COMMANDMENTS, UNLOCKABLE_COMMANDMENTS } from '../../config/commandments.js';
import { ALL_POWERS } from '../../config/powers.js';
import { ALL_COMBOS } from '../../config/combos.js';
import { COMMANDMENTS, DIVINE_ENERGY, HARBINGER, WHISPERS, COMBOS, VOICES, PETITIONS, POWER_UNLOCK } from '../../config/constants.js';
import { createPRNG } from '../prng.js';

describe('Configuration data integrity', () => {
  it('has the correct number of commandments', () => {
    expect(BASE_COMMANDMENTS.length).toBe(COMMANDMENTS.TOTAL_BASE);
    expect(UNLOCKABLE_COMMANDMENTS.length).toBe(COMMANDMENTS.TOTAL_WITH_UNLOCKS - COMMANDMENTS.TOTAL_BASE);
    expect(ALL_COMMANDMENTS.length).toBe(COMMANDMENTS.TOTAL_WITH_UNLOCKS);
  });

  it('has 12 divine powers (6 blessings + 6 disasters)', () => {
    expect(ALL_POWERS.length).toBe(12);
  });

  it('every tension pair is bidirectional', () => {
    for (const cmd of ALL_COMMANDMENTS) {
      for (const otherId of cmd.tensionsWith) {
        const other = ALL_COMMANDMENTS.find((c) => c.id === otherId);
        expect(other).toBeDefined();
        if (other) {
          expect(other.tensionsWith).toContain(cmd.id);
        }
      }
    }
  });

  it('constants are within expected ranges', () => {
    expect(DIVINE_ENERGY.STARTING).toBeGreaterThanOrEqual(0);
    expect(DIVINE_ENERGY.MAX).toBeGreaterThanOrEqual(DIVINE_ENERGY.STARTING);
    expect(DIVINE_ENERGY.REGEN_PER_REAL_MINUTE).toBeGreaterThan(0);

    expect(WHISPERS.ENERGY_COST).toBe(0);
    expect(WHISPERS.AI_NUDGE_STRENGTH).toBeGreaterThan(0);
    expect(WHISPERS.COMPOUND_MAX_STACKS).toBeGreaterThan(0);

    expect(COMBOS.COUNT_MVP).toBe(ALL_COMBOS.length);

    expect(VOICES.MAX_ALIVE).toBeGreaterThan(0);
    expect(PETITIONS.TIMEOUT_SEC).toBeGreaterThan(0);

    // Harbinger budgets and action costs should be positive
    for (const eraKey of Object.keys(HARBINGER.SIGNAL_STRENGTH)) {
      const v = (HARBINGER.SIGNAL_STRENGTH as Record<string, number>)[eraKey];
      expect(v).toBeGreaterThan(0);
    }
    for (const key of Object.keys(HARBINGER.ACTION_COSTS)) {
      const v = (HARBINGER.ACTION_COSTS as Record<string, number>)[key];
      expect(v).toBeGreaterThan(0);
    }
  });

  it('PRNG is deterministic for repeated createPRNG(42)', () => {
    const seqA: number[] = [];
    const seqB: number[] = [];

    const prng1 = createPRNG(42);
    const prng2 = createPRNG(42);

    prng1.resetForTick(0);
    prng2.resetForTick(0);

    for (let i = 0; i < 10; i += 1) {
      seqA.push(prng1.next());
      seqB.push(prng2.next());
    }

    expect(seqA).toEqual(seqB);
  });

  it('no duplicate IDs in commandments, powers, or combos', () => {
    const checkUniqueIds = (ids: string[]) => {
      const seen = new Set<string>();
      for (const id of ids) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    };

    checkUniqueIds(ALL_COMMANDMENTS.map((c) => c.id));
    checkUniqueIds(ALL_POWERS.map((p) => p.id));
    checkUniqueIds(ALL_COMBOS.map((c) => c.id));
  });

  it('all power IDs referenced in combos exist in ALL_POWERS', () => {
    const powerIds = new Set(ALL_POWERS.map((p) => p.id));
    for (const combo of ALL_COMBOS) {
      for (const powerId of combo.triggerPowers) {
        expect(powerIds.has(powerId)).toBe(true);
      }
    }
  });

  it('power unlock schedule references valid power IDs', () => {
    const powerIds = new Set(ALL_POWERS.map((p) => p.id));
    const eras = Object.values(POWER_UNLOCK) as unknown as string[][];
    for (const list of eras) {
      for (const id of list) {
        expect(powerIds.has(id)).toBe(true);
      }
    }
  });
});

