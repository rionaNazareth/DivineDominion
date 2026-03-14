import { describe, it, expect, beforeEach } from 'vitest';
import {
  tickScience,
  computeGlobalScienceMod,
  checkNuclearDeterrence,
  resetGridTracker,
} from '../science.js';
import { createInitialGameState } from '../world-gen.js';
import type { GameState, Nation, ScienceMilestoneId } from '../../types/game.js';
import { GLOBAL_SCIENCE, NUCLEAR, SCIENCE_MILESTONES } from '../../config/constants.js';
import { produce } from 'immer';

function makeState(): GameState {
  const state = createInitialGameState(99);
  return state;
}

/** Set nation development on all its regions. */
function setNationDev(state: GameState, nationId: string, dev: number): GameState {
  return produce(state, draft => {
    const nation = draft.world.nations.get(nationId);
    if (!nation) return;
    nation.development = dev;
    for (const rid of nation.regionIds) {
      const region = draft.world.regions.get(rid);
      if (region) region.development = dev;
    }
  });
}

/** Add a milestone to scienceProgress as already reached (to satisfy ordering). */
function withMilestones(state: GameState, ...ids: ScienceMilestoneId[]): GameState {
  return produce(state, draft => {
    for (const id of ids) {
      if (!draft.world.scienceProgress.milestonesReached.includes(id)) {
        draft.world.scienceProgress.milestonesReached.push(id);
      }
    }
    draft.world.scienceProgress.currentLevel = draft.world.scienceProgress.milestonesReached.length;
  });
}

describe('science', () => {
  beforeEach(() => {
    // Reset grid tracker between tests
    resetGridTracker(99);
    resetGridTracker(makeState().world.seed);
  });

  it('SCI_001: milestone printing_press — 1 nation Dev 3 → reached', () => {
    let state = makeState();
    // Set first nation to dev 3
    const nationId = Array.from(state.world.nations.keys())[0];
    state = setNationDev(state, nationId, 3);
    const result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).toContain('printing_press');
  });

  it('SCI_002: milestone scientific_method — 3 nations Dev 4 → reached', () => {
    let state = makeState();
    state = withMilestones(state, 'printing_press');
    const nationIds = Array.from(state.world.nations.keys()).slice(0, 3);
    for (const nid of nationIds) {
      state = setNationDev(state, nid, 4);
    }
    const result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).toContain('scientific_method');
  });

  it('SCI_003: milestone industrialization — 5 nations Dev 5 → reached', () => {
    let state = makeState();
    state = withMilestones(state, 'printing_press', 'scientific_method');
    const nationIds = Array.from(state.world.nations.keys()).slice(0, 5);
    for (const nid of nationIds) {
      state = setNationDev(state, nid, 5);
    }
    const result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).toContain('industrialization');
  });

  it('SCI_004: milestone internet — 3 nations Dev 9, at peace → reached', () => {
    let state = makeState();
    const prevMilestones: ScienceMilestoneId[] = [
      'printing_press', 'scientific_method', 'industrialization',
      'electricity', 'flight', 'nuclear_power', 'computing',
    ];
    state = withMilestones(state, ...prevMilestones);
    const nationIds = Array.from(state.world.nations.keys()).slice(0, 3);
    for (const nid of nationIds) {
      state = setNationDev(state, nid, 9);
    }
    // Ensure no wars
    state = produce(state, draft => {
      for (const nation of draft.world.nations.values()) {
        for (const [, rel] of nation.relations) {
          rel.atWar = false;
        }
      }
    });
    const result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).toContain('internet');
  });

  it('SCI_005: milestone space_programs — 2 nations Dev 10, cooperating → reached', () => {
    let state = makeState();
    const prevMilestones: ScienceMilestoneId[] = [
      'printing_press', 'scientific_method', 'industrialization',
      'electricity', 'flight', 'nuclear_power', 'computing', 'internet',
    ];
    state = withMilestones(state, ...prevMilestones);
    const nationIds = Array.from(state.world.nations.keys()).slice(0, 2);
    for (const nid of nationIds) {
      state = setNationDev(state, nid, 10);
    }
    // Make them cooperating (alliance)
    state = produce(state, draft => {
      const [idA, idB] = nationIds;
      const nA = draft.world.nations.get(idA);
      const nB = draft.world.nations.get(idB);
      if (nA && nB) {
        const relA = nA.relations.get(idB);
        if (relA) relA.alliance = true;
        const relB = nB.relations.get(idA);
        if (relB) relB.alliance = true;
      }
    });
    const result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).toContain('space_programs');
  });

  it('SCI_006: milestone planetary_defense — 1 superpower Dev 12 → reached', () => {
    let state = makeState();
    const prevMilestones: ScienceMilestoneId[] = [
      'printing_press', 'scientific_method', 'industrialization',
      'electricity', 'flight', 'nuclear_power', 'computing', 'internet', 'space_programs',
    ];
    state = withMilestones(state, ...prevMilestones);
    const nationId = Array.from(state.world.nations.keys())[0];
    state = setNationDev(state, nationId, 12);
    const result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).toContain('planetary_defense');
  });

  it('SCI_007: defense grid construction — takes 100 ticks after planetary_defense', () => {
    let state = makeState();
    const prevMilestones: ScienceMilestoneId[] = [
      'printing_press', 'scientific_method', 'industrialization',
      'electricity', 'flight', 'nuclear_power', 'computing', 'internet', 'space_programs', 'planetary_defense',
    ];
    state = withMilestones(state, ...prevMilestones);
    resetGridTracker(state.world.seed);

    // At tick 0, grid not done
    state = produce(state, draft => { draft.world.currentTick = 0; });
    let result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).not.toContain('defense_grid');

    // At tick 100, grid complete
    state = produce(state, draft => { draft.world.currentTick = 100; });
    result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).toContain('defense_grid');
  });

  it('SCI_008: nuclear deterrence — both Dev 8+ → 0.50× war modifier', () => {
    const state = makeState();
    const [idA, idB] = Array.from(state.world.nations.keys());
    let s = setNationDev(state, idA, 8);
    s = setNationDev(s, idB, 8);
    const mod = checkNuclearDeterrence(s, idA, idB);
    expect(mod).toBe(NUCLEAR.DETERRENCE_MOD);
  });

  it('SCI_009: global science war penalty — at war → mod ×0.3 reduction', () => {
    let state = makeState();
    // Put all nations at war
    state = produce(state, draft => {
      for (const nation of draft.world.nations.values()) {
        for (const [, rel] of nation.relations) {
          rel.atWar = true;
        }
      }
    });
    const mod = computeGlobalScienceMod(state);
    expect(mod).toBeLessThan(1.0);
    expect(mod).toBeGreaterThanOrEqual(GLOBAL_SCIENCE.MOD_MIN);
  });

  it('SCI_010: global science trade bonus — active routes → mod increases', () => {
    const baseState = makeState();
    const modWithNoRoutes = computeGlobalScienceMod(baseState);

    // Add trade routes
    const stateWithRoutes = produce(baseState, draft => {
      for (let i = 0; i < 10; i++) {
        draft.world.tradeRoutes.set(`tr_${i}`, {
          id: `tr_${i}`,
          regionA: 'r1',
          regionB: 'r2',
          distance: 2,
          volume: 0.5,
          isActive: true,
        });
      }
    });
    const modWithRoutes = computeGlobalScienceMod(stateWithRoutes);
    expect(modWithRoutes).toBeGreaterThanOrEqual(modWithNoRoutes);
    expect(modWithRoutes).toBeGreaterThan(0);
  });

  it('SCI_011: milestones in order — printing_press before scientific_method', () => {
    let state = makeState();
    // No prior milestones — even if 3 nations at Dev 4, scientific_method requires printing_press first
    const nationIds = Array.from(state.world.nations.keys()).slice(0, 3);
    for (const nid of nationIds) {
      state = setNationDev(state, nid, 4);
    }
    // Also set 1 nation to dev 3 (for printing_press) — same nations
    const result = tickScience(state);
    // Check ordering: printing_press must appear before scientific_method
    const reached = result.world.scienceProgress.milestonesReached;
    if (reached.includes('scientific_method')) {
      const ppIdx = reached.indexOf('printing_press');
      const smIdx = reached.indexOf('scientific_method');
      expect(ppIdx).toBeLessThan(smIdx);
    }
  });

  it('SCI_012: currentLevel update — increments when milestone reached', () => {
    let state = makeState();
    const nationId = Array.from(state.world.nations.keys())[0];
    state = setNationDev(state, nationId, 3);
    const before = state.world.scienceProgress.currentLevel;
    const result = tickScience(state);
    expect(result.world.scienceProgress.currentLevel).toBeGreaterThanOrEqual(before);
    if (result.world.scienceProgress.milestonesReached.includes('printing_press')) {
      expect(result.world.scienceProgress.currentLevel).toBeGreaterThan(before);
    }
  });

  it('SCI_013: special condition peace for internet — requires no wars', () => {
    let state = makeState();
    const prevMilestones: ScienceMilestoneId[] = [
      'printing_press', 'scientific_method', 'industrialization',
      'electricity', 'flight', 'nuclear_power', 'computing',
    ];
    state = withMilestones(state, ...prevMilestones);
    const nationIds = Array.from(state.world.nations.keys()).slice(0, 3);
    for (const nid of nationIds) {
      state = setNationDev(state, nid, 9);
    }
    // Set all nations at war
    state = produce(state, draft => {
      for (const nation of draft.world.nations.values()) {
        for (const [, rel] of nation.relations) {
          rel.atWar = true;
        }
      }
    });
    const result = tickScience(state);
    // Internet should NOT be reached while at war
    expect(result.world.scienceProgress.milestonesReached).not.toContain('internet');
  });

  it('SCI_014: special condition alliance for space — requires cooperation', () => {
    let state = makeState();
    const prevMilestones: ScienceMilestoneId[] = [
      'printing_press', 'scientific_method', 'industrialization',
      'electricity', 'flight', 'nuclear_power', 'computing', 'internet',
    ];
    state = withMilestones(state, ...prevMilestones);
    const nationIds = Array.from(state.world.nations.keys()).slice(0, 2);
    for (const nid of nationIds) {
      state = setNationDev(state, nid, 10);
    }
    // No alliance between them
    state = produce(state, draft => {
      for (const nation of draft.world.nations.values()) {
        for (const [, rel] of nation.relations) {
          rel.alliance = false;
          rel.tradeAgreement = false;
        }
      }
    });
    const result = tickScience(state);
    expect(result.world.scienceProgress.milestonesReached).not.toContain('space_programs');
  });

  it('SCI_015: global research output — computed from nation state', () => {
    const state = makeState();
    const result = tickScience(state);
    expect(result.world.scienceProgress.globalResearchOutput).toBeGreaterThanOrEqual(0);
  });
});
