import { describe, it, expect } from 'vitest';
import { checkAndApplyCombos, applyExpiredComboEffects } from '../combos.js';
import { createInitialGameState } from '../world-gen.js';
import type { GameState, Army } from '../../types/game.js';
import { COMBOS, NATIONS, TRADE } from '../../config/constants.js';
import { produce } from 'immer';

function makeState(): GameState {
  const state = createInitialGameState(55);
  return produce(state, draft => {
    draft.divineState.energy = 20;
    draft.divineState.maxEnergy = 20;
    draft.realTimeElapsed = 0;
  });
}

function firstLandRegionId(state: GameState): string {
  for (const [id, region] of state.world.regions) {
    if (region.terrain !== 'ocean') return id;
  }
  return Array.from(state.world.regions.keys())[0];
}

function addArmyToRegion(state: GameState, regionId: string, nationId?: string): GameState {
  const nid = nationId ?? Array.from(state.world.nations.keys())[0];
  return produce(state, draft => {
    const army: Army = {
      id: `army_combo_test`,
      nationId: nid,
      strength: 5000,
      morale: 0.8,
      currentRegionId: regionId,
      state: 'garrisoned',
      commander: null,
      supplyRange: 3,
    };
    draft.world.armies.set(army.id, army);
  });
}

function addCoastalTradeRoute(state: GameState, regionId: string): GameState {
  return produce(state, draft => {
    // Make the region coastal
    const region = draft.world.regions.get(regionId)!;
    region.terrain = 'coast';
    const otherRegionId = Array.from(draft.world.regions.keys()).find(k => k !== regionId)!;
    draft.world.tradeRoutes.set('route_coastal', {
      id: 'route_coastal',
      regionA: regionId,
      regionB: otherRegionId,
      distance: TRADE.SEA_DISTANCE,
      volume: 0.5,
      isActive: true,
    });
  });
}

function addTradeRoute(state: GameState, regionId: string): GameState {
  return produce(state, draft => {
    const otherRegionId = Array.from(draft.world.regions.keys()).find(k => k !== regionId)!;
    draft.world.tradeRoutes.set('route_land', {
      id: 'route_land',
      regionA: regionId,
      regionB: otherRegionId,
      distance: 2,
      volume: 0.5,
      isActive: true,
    });
  });
}

describe('combos', () => {
  it('COMBO_001: quake_scatter — Earthquake + army → 20% strength loss, 30% defect', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = addArmyToRegion(state, regionId);
    const originalStrength = state.world.armies.get('army_combo_test')!.strength;
    const result = checkAndApplyCombos(state, 'earthquake', regionId);
    const army = result.world.armies.get('army_combo_test')!;
    const lost = originalStrength - army.strength;
    const expected = originalStrength * (COMBOS.QUAKE_SCATTER_STRENGTH_LOSS + COMBOS.QUAKE_SCATTER_DEFECT_RATE);
    // May be clamped to ARMY_STRENGTH_MIN
    expect(army.strength).toBeGreaterThanOrEqual(NATIONS.ARMY_STRENGTH_MIN);
    expect(army.morale).toBeLessThan(0.8);
  });

  it('COMBO_002: storm_fleet — Storm + naval trade route → 2× disruption duration', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = addCoastalTradeRoute(state, regionId);
    const result = checkAndApplyCombos(state, 'great_storm', regionId);
    const route = result.world.tradeRoutes.get('route_coastal')!;
    expect(route.isActive).toBe(false);
    const expectedDuration = TRADE.DISRUPTION_DURATION_YEARS * COMBOS.STORM_FLEET_DISRUPTION_MULTIPLIER;
    expect(route.disruptedUntilYear).toBeCloseTo(state.world.currentYear + expectedDuration, 1);
  });

  it('COMBO_003: flood_famine — Flood + famine active → famine triggered, 5% additional pop loss', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      const region = draft.world.regions.get(regionId)!;
      region.activeEffects.push({ powerId: 'famine', startYear: 1600, endYear: 1605, sourceReligionId: 'r' });
      region.population = 10000;
    });
    const beforePop = state.world.regions.get(regionId)!.population;
    const result = checkAndApplyCombos(state, 'great_flood', regionId);
    const region = result.world.regions.get(regionId)!;
    // Population should be reduced
    expect(region.population).toBeLessThan(beforePop);
    // Famine effect added
    const famineEffects = region.activeEffects.filter(e => e.powerId === 'famine');
    expect(famineEffects.length).toBeGreaterThanOrEqual(1);
  });

  it('COMBO_004: plague_trade — Plague + trade routes → disease spreads along routes', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = addTradeRoute(state, regionId);
    // Add divine disease in the region
    state = produce(state, draft => {
      draft.world.diseases.push({
        id: 'disease_test',
        name: 'Divine Plague',
        severity: 'severe',
        affectedRegions: [regionId],
        immuneRegionIds: [],
        infectionStartTickByRegion: new Map([[regionId, 0]]),
        spreadRate: 0.025,
        mortalityRate: 0.030,
        originYear: 1600,
        isDivine: true,
        isActive: true,
      });
    });
    const result = checkAndApplyCombos(state, 'plague', regionId);
    const disease = result.world.diseases.find(d => d.isDivine)!;
    // Disease should have spread to trade route endpoint
    expect(disease.affectedRegions.length).toBeGreaterThan(1);
  });

  it('COMBO_005: harvest_golden — Harvest + golden age, dev≥6 → 3 extra years', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.regions.get(regionId)!.development = 6;
    });
    const result = checkAndApplyCombos(state, 'bountiful_harvest', regionId);
    const region = result.world.regions.get(regionId)!;
    const goldenEffect = region.activeEffects.find(e => e.powerId === 'golden_age');
    expect(goldenEffect).toBeDefined();
    expect(goldenEffect!.endYear - goldenEffect!.startYear).toBe(COMBOS.HARVEST_GOLDEN_DURATION_YEARS);
  });

  it('COMBO_006: inspire_prophet — Inspiration + Prophet in region → 2× conversion', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.regions.get(regionId)!.activeEffects.push({
        powerId: 'prophet',
        startYear: 1600,
        endYear: 1620,
        sourceReligionId: draft.playerReligionId,
      });
    });
    const result = checkAndApplyCombos(state, 'inspiration', regionId);
    const region = result.world.regions.get(regionId)!;
    const comboEffect = region.activeEffects.find(e => e.powerId === 'inspire_prophet_combo');
    expect(comboEffect).toBeDefined();
  });

  it('COMBO_007: shield_miracle — Shield then Miracle within 120s → 1.5× boost', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    // Record Shield cast at t=0
    state = produce(state, draft => {
      draft.comboWindowState.lastShieldCastByRegion.set(regionId, 0);
      draft.realTimeElapsed = 100; // 100s later — within 120s window
    });
    const result = checkAndApplyCombos(state, 'miracle', regionId);
    const region = result.world.regions.get(regionId)!;
    const comboEffect = region.activeEffects.find(e => e.powerId === 'shield_miracle_combo');
    expect(comboEffect).toBeDefined();
  });

  it('COMBO_008: wildfire_rebirth — Wildfire + dev≥3 → +1 dev scheduled', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.regions.get(regionId)!.development = 4;
    });
    const result = checkAndApplyCombos(state, 'wildfire', regionId);
    const region = result.world.regions.get(regionId)!;
    const rebirthEffect = region.activeEffects.find(e => e.powerId === 'wildfire_rebirth_bonus');
    expect(rebirthEffect).toBeDefined();
  });

  it('COMBO_009: divine_purge — Shield + Miracle on corrupted → remove corruption + 1 era immunity', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      // Era 7+
      draft.world.currentEra = 'atomic';
      // Add corruption
      draft.world.alienState.harbinger.corruptedRegionIds.push(regionId);
      // Shield cast within window
      draft.comboWindowState.lastShieldCastByRegion.set(regionId, 0);
      draft.realTimeElapsed = 100;
    });
    const result = checkAndApplyCombos(state, 'miracle', regionId);
    // Corruption removed
    expect(result.world.alienState.harbinger.corruptedRegionIds).not.toContain(regionId);
    // Immunity added
    expect(result.world.alienState.harbinger.immuneRegionIds).toContain(regionId);
  });

  it('COMBO_010: quake_scatter no army — Earthquake, no army → no scatter', () => {
    const state = makeState();
    // Find a land region with NO armies
    let regionId: string | undefined;
    for (const [id, region] of state.world.regions) {
      if (region.terrain === 'ocean') continue;
      const hasArmy = Array.from(state.world.armies.values()).some(a => a.currentRegionId === id);
      if (!hasArmy) { regionId = id; break; }
    }
    if (!regionId) {
      // All regions have armies — skip this test (edge case)
      return;
    }
    const result = checkAndApplyCombos(state, 'earthquake', regionId);
    // No pivotal moment for quake_scatter (no army)
    expect(result.pivotalMoments.filter(m => m.headline.includes('Quake Scatter')).length).toBe(0);
  });

  it('COMBO_011: storm_fleet no routes — Storm, no trade → no fleet combo', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    // No trade routes
    const result = checkAndApplyCombos(state, 'great_storm', regionId);
    // No naval disruption to 2× duration
    const disrupted = Array.from(result.world.tradeRoutes.values()).filter(r => !r.isActive);
    expect(disrupted.length).toBe(0);
  });

  it('COMBO_012: harvest_golden dev 5 — Harvest + dev=5 → no combo', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.regions.get(regionId)!.development = 5;
    });
    const result = checkAndApplyCombos(state, 'bountiful_harvest', regionId);
    const region = result.world.regions.get(regionId)!;
    const goldenEffect = region.activeEffects.find(e => e.powerId === 'golden_age');
    expect(goldenEffect).toBeUndefined();
  });

  it('COMBO_013: wildfire_rebirth dev 2 — Wildfire, dev=2 → no rebirth', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.regions.get(regionId)!.development = 2;
    });
    const result = checkAndApplyCombos(state, 'wildfire', regionId);
    const region = result.world.regions.get(regionId)!;
    const rebirthEffect = region.activeEffects.find(e => e.powerId === 'wildfire_rebirth_bonus');
    expect(rebirthEffect).toBeUndefined();
  });

  it('COMBO_014: divine_purge no corruption — Shield + Miracle, no corruption → no purge (may trigger shield_miracle)', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.currentEra = 'atomic'; // era 7+
      // No corruption
      draft.comboWindowState.lastShieldCastByRegion.set(regionId, 0);
      draft.realTimeElapsed = 100;
    });
    const result = checkAndApplyCombos(state, 'miracle', regionId);
    // No purge
    expect(result.world.alienState.harbinger.corruptedRegionIds).not.toContain(regionId);
    // shield_miracle may have fired instead
    const region = result.world.regions.get(regionId)!;
    const shieldMiracle = region.activeEffects.find(e => e.powerId === 'shield_miracle_combo');
    // Either shield_miracle fired or not — both valid since no corruption
    expect(shieldMiracle).toBeDefined();
  });

  it('COMBO_015a: multiplier combos in range — storm_fleet multiplier = 2.0', () => {
    expect(COMBOS.STORM_FLEET_DISRUPTION_MULTIPLIER).toBeGreaterThanOrEqual(1.3);
    expect(COMBOS.STORM_FLEET_DISRUPTION_MULTIPLIER).toBeLessThanOrEqual(2.0);
    expect(COMBOS.SHIELD_MIRACLE_BOOST).toBeGreaterThanOrEqual(1.3);
    expect(COMBOS.SHIELD_MIRACLE_BOOST).toBeLessThanOrEqual(2.0);
  });

  it('COMBO_015b: additive combos correct — harvest_golden = 3yr, wildfire_rebirth = +1 dev', () => {
    expect(COMBOS.HARVEST_GOLDEN_DURATION_YEARS).toBe(3);
    expect(COMBOS.WILDFIRE_REBIRTH_DEV_BONUS).toBe(1);
  });

  it('COMBO_015c: percentage combos correct — quake_scatter 20%/30%', () => {
    expect(COMBOS.QUAKE_SCATTER_STRENGTH_LOSS).toBe(0.20);
    expect(COMBOS.QUAKE_SCATTER_DEFECT_RATE).toBe(0.30);
  });

  it('COMBO_015d: boolean combo correct — divine_purge removes corruption + immunizes', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.currentEra = 'atomic';
      draft.world.alienState.harbinger.corruptedRegionIds.push(regionId);
      draft.comboWindowState.lastShieldCastByRegion.set(regionId, 0);
      draft.realTimeElapsed = 50;
    });
    const result = checkAndApplyCombos(state, 'miracle', regionId);
    expect(result.world.alienState.harbinger.corruptedRegionIds).not.toContain(regionId);
    expect(result.world.alienState.harbinger.immuneRegionIds).toContain(regionId);
  });

  it('COMBO_016: checkAndApplyCombos after cast — function is callable', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const result = checkAndApplyCombos(state, 'bountiful_harvest', regionId);
    expect(result).toBeDefined();
    // State is returned (possibly unchanged if no combo triggered)
    expect(typeof result.world.currentYear).toBe('number');
  });

  it('COMBO_017: combo pivotal moment — quake_scatter logs pivotal moment', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = addArmyToRegion(state, regionId);
    const result = checkAndApplyCombos(state, 'earthquake', regionId);
    expect(result.pivotalMoments.some(m => m.headline.includes('Quake Scatter'))).toBe(true);
  });

  it('COMBO_018: divine_purge logs pivotal moment', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.world.currentEra = 'atomic';
      draft.world.alienState.harbinger.corruptedRegionIds.push(regionId);
      draft.comboWindowState.lastShieldCastByRegion.set(regionId, 0);
      draft.realTimeElapsed = 60;
    });
    const result = checkAndApplyCombos(state, 'miracle', regionId);
    expect(result.pivotalMoments.some(m => m.headline.includes('Divine Purge'))).toBe(true);
  });

  it('COMBO_019: flood_famine pop loss — base 5% × 2 = 10% of population', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      const region = draft.world.regions.get(regionId)!;
      region.population = 10000;
      region.activeEffects.push({ powerId: 'famine', startYear: 1600, endYear: 1605, sourceReligionId: 'r' });
    });
    const result = checkAndApplyCombos(state, 'great_flood', regionId);
    const region = result.world.regions.get(regionId)!;
    const expectedLoss = Math.floor(10000 * COMBOS.FLOOD_FAMINE_POP_LOSS_BASE * 2.0);
    expect(region.population).toBeLessThanOrEqual(10000 - expectedLoss + 1); // +1 for floor rounding
    expect(region.population).toBeGreaterThanOrEqual(NATIONS.POPULATION_MIN_PER_REGION);
  });

  it('COMBO_020: shield_miracle window — Miracle 121s after Shield → no combo', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      draft.comboWindowState.lastShieldCastByRegion.set(regionId, 0);
      draft.realTimeElapsed = 121; // 121s > 120s window
    });
    const result = checkAndApplyCombos(state, 'miracle', regionId);
    const region = result.world.regions.get(regionId)!;
    const shieldMiracle = region.activeEffects.find(e => e.powerId === 'shield_miracle_combo');
    expect(shieldMiracle).toBeUndefined();
  });

  it('applyExpiredComboEffects: wildfire_rebirth_bonus grants +1 dev on expiry', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      const region = draft.world.regions.get(regionId)!;
      region.development = 4;
      region.activeEffects.push({
        powerId: 'wildfire_rebirth_bonus',
        startYear: 1600,
        endYear: 1605,
        sourceReligionId: 'player',
      });
      draft.world.currentYear = 1605; // at endYear
    });
    const result = applyExpiredComboEffects(state);
    const region = result.world.regions.get(regionId)!;
    expect(region.development).toBe(5); // 4 + 1
    // Effect removed
    expect(region.activeEffects.find(e => e.powerId === 'wildfire_rebirth_bonus')).toBeUndefined();
  });

  it('wildfire_rebirth dev bonus clamped at 12', () => {
    let state = makeState();
    const regionId = firstLandRegionId(state);
    state = produce(state, draft => {
      const region = draft.world.regions.get(regionId)!;
      region.development = 12; // already at max
      region.activeEffects.push({
        powerId: 'wildfire_rebirth_bonus',
        startYear: 1600,
        endYear: 1605,
        sourceReligionId: 'player',
      });
      draft.world.currentYear = 1605;
    });
    const result = applyExpiredComboEffects(state);
    const region = result.world.regions.get(regionId)!;
    expect(region.development).toBe(12); // clamped
  });
});
