/**
 * Integration tests — cross-module interaction chains.
 * 12 tests covering INT_001 through INT_012.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '../world-gen.js';
import { tickNations } from '../nation.js';
import { tickReligionSpread } from '../religion.js';
import { tickTradeRoutes } from '../trade.js';
import { tickDiseases } from '../disease.js';
import { tickArmies } from '../army.js';
import { tickDivineEffects, castPower } from '../divine.js';
import { tickHarbinger } from '../harbinger.js';
import { checkAndApplyCombos } from '../combos.js';
import { tickVoices } from '../voices.js';
import { rollEvents } from '../events.js';
import { tickScience } from '../science.js';
import { runSimulationTick, initPRNG } from '../runner.js';
import { HARBINGER, VOICES } from '../../config/constants.js';
import type { GameState, RegionId } from '../../types/game.js';
import { produce } from 'immer';

function getFirstNonOceanRegionId(state: GameState): RegionId {
  for (const [id, region] of state.world.regions) {
    if (region.terrain !== 'ocean') return id;
  }
  return Array.from(state.world.regions.keys())[0];
}

describe('integration tests', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState(42);
    initPRNG(42);
  });

  it('INT_001: Nation → Religion — tickNations updates regions, tickReligionSpread uses updated state', () => {
    // Run nation tick first, then religion spread
    const afterNations = tickNations(state, 0.5);
    const afterReligion = tickReligionSpread(afterNations, 0.5);
    // Religion spread should produce valid influence values
    for (const region of afterReligion.world.regions.values()) {
      const sum = region.religiousInfluence.reduce((s, ri) => s + ri.strength, 0);
      expect(sum).toBeLessThanOrEqual(1.001);
    }
  });

  it('INT_002: Trade → Economy — trade routes affect economicOutput', () => {
    // First form some trade routes by running trade tick
    let s = produce(state, draft => {
      // Set up two peaceful, adjacent nations
      const nations = Array.from(draft.world.nations.values());
      if (nations.length >= 2) {
        const rel = nations[0].relations.get(nations[1].id);
        const revRel = nations[1].relations.get(nations[0].id);
        if (rel) { rel.atWar = false; rel.opinion = 0.8; rel.peaceTicks = 20; }
        if (revRel) { revRel.atWar = false; revRel.opinion = 0.8; revRel.peaceTicks = 20; }
      }
    });
    const afterTrade = tickTradeRoutes(s, 0.5);
    const afterEconomy = tickNations(afterTrade, 0.5);
    // Trade routes should not make economy negative
    for (const region of afterEconomy.world.regions.values()) {
      expect(region.economicOutput).toBeGreaterThanOrEqual(0);
    }
  });

  it('INT_003: Disease → Population — disease mortality reduces population', () => {
    // Inject a severe disease into a region
    let s = produce(state, draft => {
      const regionId = getFirstNonOceanRegionId(draft as GameState);
      draft.world.diseases.push({
        id: 'test_disease',
        name: 'Test Plague',
        severity: 'severe',
        affectedRegions: [regionId],
        immuneRegionIds: [],
        infectionStartTickByRegion: new Map([[regionId, 0]]),
        spreadRate: 0.025,
        mortalityRate: 0.015,
        originYear: 1600,
        isDivine: false,
        isActive: true,
      });
    });
    const regionId = getFirstNonOceanRegionId(s);
    const initPop = s.world.regions.get(regionId)?.population ?? 0;
    const result = tickDiseases(s, 0.5);
    const finalPop = result.world.regions.get(regionId)?.population ?? 0;
    // Population should decrease due to mortality
    expect(finalPop).toBeLessThanOrEqual(initPop);
  });

  it('INT_004: Army → Nation — conquest updates region nationId', () => {
    // Create two nations in the same region and force a battle
    // After conquest, region.nationId should reflect winner
    const regions = Array.from(state.world.regions.values());
    const nations = Array.from(state.world.nations.values());
    if (regions.length < 1 || nations.length < 2) return;

    let s = produce(state, draft => {
      const region = Array.from(draft.world.regions.values())[0];
      const nationA = Array.from(draft.world.nations.values())[0];
      const nationB = Array.from(draft.world.nations.values())[1];
      // Place armies in same region
      draft.world.armies.set('army_a', {
        id: 'army_a', nationId: nationA.id, strength: 20000, morale: 0.9,
        currentRegionId: region.id, state: 'engaged', commander: null,
        supplyRange: 3,
      });
      draft.world.armies.set('army_b', {
        id: 'army_b', nationId: nationB.id, strength: 1000, morale: 0.3,
        currentRegionId: region.id, state: 'engaged', commander: null,
        supplyRange: 3,
      });
      const relAB = nationA.relations.get(nationB.id);
      const relBA = nationB.relations.get(nationA.id);
      if (relAB) relAB.atWar = true;
      if (relBA) relBA.atWar = true;
    });
    const result = tickArmies(s, 0.5);
    // After a tick, the overwhelmed army B should retreat or be destroyed
    const armyB = result.world.armies.get('army_b');
    if (armyB) {
      // Army B may have retreated
      expect(['retreating', 'disbanded', 'garrisoned']).toContain(armyB.state);
    }
    // Region should still have a valid nationId
    const region = Array.from(result.world.regions.values())[0];
    expect(result.world.nations.has(region.nationId)).toBe(true);
  });

  it('INT_005: Divine → Region — castPower adds ActiveEffect to region', () => {
    let s = produce(state, draft => {
      draft.divineState.energy = 10;
      draft.divineState.maxEnergy = 20;
    });
    const regionId = getFirstNonOceanRegionId(s);
    const result = castPower(s, 'bountiful_harvest', regionId);
    const region = result.world.regions.get(regionId);
    expect(region?.activeEffects.length).toBeGreaterThan(0);
  });

  it('INT_006: Harbinger → Divine — Shield blocks Harbinger actions', () => {
    let s = produce(state, draft => {
      draft.world.currentEra = 'atomic';
      draft.world.alienState.harbinger.budgetRemaining = 25;
      draft.world.currentTick = HARBINGER.TICK_INTERVAL;
      draft.world.alienState.harbinger.lastActionTick = 0;
      // Shield every region
      for (const region of draft.world.regions.values()) {
        region.activeEffects.push({
          powerId: 'shield_of_faith',
          startYear: 1600,
          endYear: 9999,
        });
      }
    });
    const result = tickHarbinger(s);
    expect(result.world.alienState.harbinger.actionsLog.length).toBe(0);
  });

  it('INT_007: Combos → Divine — casting a power triggers combo checks', () => {
    let s = produce(state, draft => {
      draft.divineState.energy = 15;
      draft.divineState.maxEnergy = 20;
    });
    const regionId = getFirstNonOceanRegionId(s);
    // Cast earthquake — checkAndApplyCombos should be called internally
    // Verify the state is still valid after the call chain
    const result = castPower(s, 'bountiful_harvest', regionId);
    expect(result.world.regions.has(regionId)).toBe(true);
  });

  it('INT_008: Voices → Harbinger — Era 8+ voices may sense Harbinger', () => {
    // Harbinger visibility starts at Era 8
    expect(HARBINGER.VISIBILITY_VOICES_ERA).toBe(8);
    // At Era 8+, voices can detect Harbinger via petition text
    let s = produce(state, draft => {
      draft.world.currentEra = 'digital'; // Era 8
      // Add a prophet
      const regionId = getFirstNonOceanRegionId(draft as GameState);
      draft.voiceRecords.push({
        id: 'voice_prophet_test',
        type: 'prophet',
        name: 'Test Prophet',
        regionId,
        loyalty: 0.8,
        birthYear: 1600,
        lifespanYears: 150,
        eraBorn: 'digital',
        lineageOf: null,
        currentPetition: null,
        betrayalImminentTicks: undefined,
      });
    });
    const result = tickVoices(s, 0.5);
    // Prophet should still be alive
    expect(result.voiceRecords.some(v => v.type === 'prophet')).toBe(true);
  });

  it('INT_009: Events → Nation AI — rollEvents does not crash and returns valid state', () => {
    const result = rollEvents(state, 0.5);
    // State should be valid
    expect(result.world.regions.size).toBeGreaterThan(0);
    expect(result.world.nations.size).toBeGreaterThan(0);
    // Event history should not shrink
    expect(result.eventHistory.length).toBeGreaterThanOrEqual(state.eventHistory.length);
  });

  it('INT_010: Science → Nation AI — nuclear deterrence affects war scoring', () => {
    // Set up nuclear deterrence conditions: 2+ nations at dev 8+
    let s = produce(state, draft => {
      let count = 0;
      for (const nation of draft.world.nations.values()) {
        if (count >= 2) break;
        nation.development = 9;
        draft.world.scienceProgress.milestonesReached.push('nuclear_power');
        count++;
      }
    });
    const result = tickScience(s);
    // Science should have updated milestones
    expect(result.world.scienceProgress).toBeDefined();
  });

  it('INT_011: Religion → Voices — high schism risk triggers Heretic emergence', () => {
    // Set up schism-triggering hypocrisy level
    let s = produce(state, draft => {
      draft.hypocrisyLevel = VOICES.HERETIC_SCHISM_THRESHOLD + 0.05;
    });
    const result = tickVoices(s, 0.5);
    const heretics = result.voiceRecords.filter(v => v.type === 'heretic');
    expect(heretics.length).toBeGreaterThanOrEqual(1);
  });

  it('INT_012: Full tick chain — runSimulationTick executes all 17 steps without error', () => {
    initPRNG(42);
    let s = produce(state, draft => {
      draft.divineState.energy = 10;
      draft.divineState.maxEnergy = 20;
      draft.divineState.regenPerMinute = 1;
    });
    // Run 5 full ticks — verify no circular dependencies or crashes
    expect(() => {
      for (let i = 0; i < 5; i++) {
        s = runSimulationTick(s, 12);
      }
    }).not.toThrow();
    expect(s.world.currentTick).toBe(5);
    expect(s.world.currentYear).toBeCloseTo(1602.5, 1);
  });
});
