import './immer-config.js';
import { produce } from 'immer';
import type { GameState, PowerId, RegionId, PivotalMoment } from '../types/game.js';
import {
  COMBOS,
  TRADE,
  NATIONS,
  AUTO_SAVE,
  ERAS,
} from '../config/constants.js';

/** Era duration in game-years for the era at the given index (1-based). */
function eraDurationYears(eraIndex: number): number {
  const era = ERAS[eraIndex - 1];
  if (!era) return 50;
  return era.endYear - era.startYear;
}

const ERA_INDEX: Record<string, number> = {
  renaissance: 1, exploration: 2, enlightenment: 3, revolution: 4,
  industry: 5, empire: 6, atomic: 7, digital: 8,
  signal: 9, revelation: 10, preparation: 11, arrival: 12,
};

function currentEraIndex(state: GameState): number {
  return ERA_INDEX[state.world.currentEra] ?? 1;
}

/** Helper: check if a naval trade route exists in a region.
 * Naval = BFS path between endpoints includes coast or ocean. */
function hasNavalRouteInRegion(state: GameState, regionId: RegionId): boolean {
  for (const route of state.world.tradeRoutes.values()) {
    if (!route.isActive) continue;
    if (route.regionA !== regionId && route.regionB !== regionId) continue;
    // Check if either endpoint is coast/ocean, or route uses sea distance
    const regionA = state.world.regions.get(route.regionA);
    const regionB = state.world.regions.get(route.regionB);
    if (!regionA || !regionB) continue;
    if (
      regionA.terrain === 'coast' || regionA.terrain === 'ocean' ||
      regionB.terrain === 'coast' || regionB.terrain === 'ocean' ||
      route.distance >= TRADE.SEA_DISTANCE
    ) {
      return true;
    }
  }
  return false;
}

/** Helper: check if a region has low food (active famine or low economy per capita). */
function regionHasLowFood(state: GameState, regionId: RegionId): boolean {
  const region = state.world.regions.get(regionId);
  if (!region) return false;

  // Check for active famine effect
  const hasFamineEffect = region.activeEffects.some(e => e.powerId === 'famine');
  if (hasFamineEffect) return true;

  // Check economy per capita below threshold (simplified: economy / pop < 0.005)
  const nation = state.world.nations.get(region.nationId);
  if (!nation) return false;
  const economyPerCap = region.population > 0 ? region.economicOutput / region.population : 0;
  return economyPerCap < 0.005; // FOOD_STABILITY_THRESHOLD approximation
}

/** Helper: get active trade routes connected to a region. */
function getActiveTradeRoutes(state: GameState, regionId: RegionId) {
  return Array.from(state.world.tradeRoutes.values()).filter(
    r => r.isActive && (r.regionA === regionId || r.regionB === regionId),
  );
}

/** Helper: get armies in a region. */
function getArmiesInRegion(state: GameState, regionId: RegionId) {
  return Array.from(state.world.armies.values()).filter(
    a => a.currentRegionId === regionId && a.state !== 'disbanded',
  );
}

/** Check if a Prophet (blessing entity) is active in the region. */
function prophetActiveInRegion(state: GameState, regionId: RegionId): boolean {
  const region = state.world.regions.get(regionId);
  if (!region) return false;
  return region.activeEffects.some(e => e.powerId === 'prophet');
}

/** Check if the region has Harbinger corruption. */
function regionIsCorrupted(state: GameState, regionId: RegionId): boolean {
  return state.world.alienState.harbinger.corruptedRegionIds.includes(regionId);
}

/** Log a pivotal moment for combo discovery. */
function logPivotalMoment(draft: GameState, comboName: string): void {
  const moment: PivotalMoment = {
    year: draft.world.currentYear,
    type: 'miracle',
    headline: `Divine Chain: ${comboName}`,
  };
  draft.pivotalMoments.push(moment);
  if (draft.pivotalMoments.length > AUTO_SAVE.PIVOTAL_MOMENTS_MAX) {
    // Drop oldest non-outcome entry
    const idx = draft.pivotalMoments.findIndex(m => m.type !== 'outcome');
    if (idx >= 0) draft.pivotalMoments.splice(idx, 1);
  }
}

/**
 * Checks and applies power combos after a power is cast.
 * Called from castPower in divine.ts.
 *
 * @param state - game state after the power was cast
 * @param powerId - the power just cast
 * @param regionId - target region
 */
export function checkAndApplyCombos(
  state: GameState,
  powerId: PowerId,
  regionId: RegionId,
): GameState {
  if (!state.world.regions.has(regionId)) return state;

  let result = state;

  // quake_scatter: Earthquake + army in region
  if (powerId === 'earthquake') {
    const armies = getArmiesInRegion(result, regionId);
    if (armies.length > 0) {
      result = produce(result, draft => {
        for (const army of draft.world.armies.values()) {
          if (army.currentRegionId !== regionId || army.state === 'disbanded') continue;
          const strengthLost = Math.floor(army.strength * COMBOS.QUAKE_SCATTER_STRENGTH_LOSS);
          const defectCount = Math.floor(army.strength * COMBOS.QUAKE_SCATTER_DEFECT_RATE);
          army.strength = Math.max(NATIONS.ARMY_STRENGTH_MIN, army.strength - strengthLost - defectCount);
          army.morale = Math.max(0.10, army.morale - 0.15);
        }
        logPivotalMoment(draft as unknown as GameState, 'Quake Scatter');
      });
    }
  }

  // storm_fleet: Great Storm + naval trade route in region
  if (powerId === 'great_storm') {
    if (hasNavalRouteInRegion(result, regionId)) {
      result = produce(result, draft => {
        for (const route of draft.world.tradeRoutes.values()) {
          if (!route.isActive) continue;
          if (route.regionA !== regionId && route.regionB !== regionId) continue;
          const regionA = draft.world.regions.get(route.regionA);
          const regionB = draft.world.regions.get(route.regionB);
          if (!regionA || !regionB) continue;
          const isNaval =
            regionA.terrain === 'coast' || regionA.terrain === 'ocean' ||
            regionB.terrain === 'coast' || regionB.terrain === 'ocean' ||
            route.distance >= TRADE.SEA_DISTANCE;
          const duration = isNaval
            ? TRADE.DISRUPTION_DURATION_YEARS * COMBOS.STORM_FLEET_DISRUPTION_MULTIPLIER
            : TRADE.DISRUPTION_DURATION_YEARS;
          route.isActive = false;
          route.disruptedUntilYear = draft.world.currentYear + duration;
        }
        logPivotalMoment(draft as unknown as GameState, 'Storm Fleet');
      });
    } else {
      // Just disrupt non-naval routes at base duration
      result = produce(result, draft => {
        for (const route of draft.world.tradeRoutes.values()) {
          if (!route.isActive) continue;
          if (route.regionA !== regionId && route.regionB !== regionId) continue;
          route.isActive = false;
          route.disruptedUntilYear = draft.world.currentYear + TRADE.DISRUPTION_DURATION_YEARS;
        }
      });
    }
  }

  // flood_famine: Great Flood + low food
  if (powerId === 'great_flood') {
    if (regionHasLowFood(result, regionId)) {
      result = produce(result, draft => {
        const region = draft.world.regions.get(regionId)!;
        // Auto-trigger Famine effect
        region.activeEffects.push({
          powerId: 'famine',
          startYear: draft.world.currentYear,
          endYear: draft.world.currentYear + 5,
          sourceReligionId: draft.playerReligionId,
        });
        // Double pop loss: base 5% × 2
        const popLoss = Math.floor(region.population * (COMBOS.FLOOD_FAMINE_POP_LOSS_BASE * 2.0));
        region.population = Math.max(NATIONS.POPULATION_MIN_PER_REGION, region.population - popLoss);
        logPivotalMoment(draft as unknown as GameState, 'Flood Famine');
      });
    }
  }

  // plague_trade: Plague + active trade routes
  if (powerId === 'plague') {
    const routes = getActiveTradeRoutes(result, regionId);
    if (routes.length > 0) {
      result = produce(result, draft => {
        // Find the divine disease just created (most recently added, isDivine=true)
        const disease = draft.world.diseases.find(d => d.isDivine && d.affectedRegions.includes(regionId));
        if (disease) {
          for (const route of routes) {
            const otherEnd = route.regionA === regionId ? route.regionB : route.regionA;
            if (!disease.affectedRegions.includes(otherEnd)) {
              disease.affectedRegions.push(otherEnd);
              disease.infectionStartTickByRegion.set(otherEnd, draft.world.currentTick);
            }
          }
        }
        logPivotalMoment(draft as unknown as GameState, 'Plague Trade');
      });
    }
  }

  // harvest_golden: Bountiful Harvest + dev ≥ 6
  if (powerId === 'bountiful_harvest') {
    const region = result.world.regions.get(regionId);
    if (region && region.development >= COMBOS.HARVEST_GOLDEN_MIN_DEV) {
      result = produce(result, draft => {
        const r = draft.world.regions.get(regionId)!;
        r.activeEffects.push({
          powerId: 'golden_age',
          startYear: draft.world.currentYear,
          endYear: draft.world.currentYear + COMBOS.HARVEST_GOLDEN_DURATION_YEARS,
          sourceReligionId: draft.playerReligionId,
        });
        logPivotalMoment(draft as unknown as GameState, 'Harvest Golden');
      });
    }
  }

  // inspire_prophet: Inspiration + Prophet in region
  if (powerId === 'inspiration') {
    if (prophetActiveInRegion(result, regionId)) {
      result = produce(result, draft => {
        // Double prophet conversion: mark with a combo effect
        const r = draft.world.regions.get(regionId)!;
        r.activeEffects.push({
          powerId: 'inspire_prophet_combo',
          startYear: draft.world.currentYear,
          endYear: draft.world.currentYear + 1, // 1 era-tick = ~1 game-year
          sourceReligionId: draft.playerReligionId,
        });
        logPivotalMoment(draft as unknown as GameState, 'Inspire Prophet');
      });
    }
  }

  // shield_miracle and divine_purge: triggered when Miracle is cast
  if (powerId === 'miracle') {
    const shieldCastTime = result.comboWindowState.lastShieldCastByRegion.get(regionId);
    const currentTime = result.realTimeElapsed;

    if (
      shieldCastTime !== undefined &&
      currentTime - shieldCastTime <= COMBOS.SHIELD_MIRACLE_WINDOW_SEC
    ) {
      const corrupted = regionIsCorrupted(result, regionId);
      const eraIdx = currentEraIndex(result);

      if (corrupted && eraIdx >= 7) {
        // divine_purge: remove corruption + immunize for 1 era
        result = produce(result, draft => {
          // Remove corruption
          const harbinger = draft.world.alienState.harbinger;
          harbinger.corruptedRegionIds = harbinger.corruptedRegionIds.filter(r => r !== regionId);
          harbinger.veiledRegionIds = harbinger.veiledRegionIds.filter(r => r !== regionId);
          // Immunize for 1 era
          if (!harbinger.immuneRegionIds.includes(regionId)) {
            harbinger.immuneRegionIds.push(regionId);
          }
          // Add immunity active effect
          const eraDur = eraDurationYears(eraIdx);
          const r = draft.world.regions.get(regionId)!;
          r.activeEffects.push({
            powerId: 'divine_purge_immunity',
            startYear: draft.world.currentYear,
            endYear: draft.world.currentYear + eraDur,
            sourceReligionId: draft.playerReligionId,
          });
          logPivotalMoment(draft as unknown as GameState, 'Divine Purge');
        });
      } else {
        // shield_miracle: Divine Fortress (1.5× defense and conversion)
        result = produce(result, draft => {
          const r = draft.world.regions.get(regionId)!;
          r.activeEffects.push({
            powerId: 'shield_miracle_combo',
            startYear: draft.world.currentYear,
            endYear: draft.world.currentYear + 10, // Shield duration
            sourceReligionId: draft.playerReligionId,
          });
          logPivotalMoment(draft as unknown as GameState, 'Shield Miracle');
        });
      }
    }

    // Record this Miracle cast time for future combo window checks
    result = produce(result, draft => {
      draft.comboWindowState.lastMiracleCastByRegion.set(regionId, result.realTimeElapsed);
    });
  }

  // Track Shield casts for shield_miracle window
  if (powerId === 'shield_of_faith') {
    result = produce(result, draft => {
      draft.comboWindowState.lastShieldCastByRegion.set(regionId, result.realTimeElapsed);
    });
  }

  // wildfire_rebirth: Wildfire + dev ≥ 3
  if (powerId === 'wildfire') {
    const region = result.world.regions.get(regionId);
    if (region && region.development >= COMBOS.WILDFIRE_REBIRTH_MIN_DEV) {
      result = produce(result, draft => {
        // Schedule dev bonus when wildfire expires (+5 game years)
        const r = draft.world.regions.get(regionId)!;
        r.activeEffects.push({
          powerId: 'wildfire_rebirth_bonus',
          startYear: draft.world.currentYear + 5,
          endYear: draft.world.currentYear + 5,
          sourceReligionId: draft.playerReligionId,
        });
        logPivotalMoment(draft as unknown as GameState, 'Wildfire Rebirth');
      });
    }
  }

  return result;
}

/**
 * Applies wildfire_rebirth_bonus dev gain when the effect triggers (endYear reached).
 * Called from tickDivineEffects when expiring effects are processed.
 */
export function applyExpiredComboEffects(state: GameState): GameState {
  const currentYear = state.world.currentYear;
  const needsRebirth = Array.from(state.world.regions.entries()).filter(([, region]) =>
    region.activeEffects.some(
      e => e.powerId === 'wildfire_rebirth_bonus' && e.endYear <= currentYear,
    ),
  );

  if (needsRebirth.length === 0) return state;

  return produce(state, draft => {
    for (const [regionId, region] of needsRebirth) {
      const draftRegion = draft.world.regions.get(regionId)!;
      draftRegion.development = Math.min(12, draftRegion.development + COMBOS.WILDFIRE_REBIRTH_DEV_BONUS);
      // Remove the processed bonus effect
      draftRegion.activeEffects = draftRegion.activeEffects.filter(
        e => e.powerId !== 'wildfire_rebirth_bonus',
      );
    }
  });
}
