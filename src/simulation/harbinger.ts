import './immer-config.js';
import { produce } from 'immer';
import type {
  GameState,
  RegionId,
  NationId,
  HarbingerActionType,
  HarbingerStrategyAssessment,
  HarbingerActionLog,
} from '../types/game.js';
import { HARBINGER, TRADE } from '../config/constants.js';
import { seededRandom } from './prng.js';

const ERA_INDEX: Record<string, number> = {
  renaissance: 1, exploration: 2, enlightenment: 3, revolution: 4,
  industry: 5, empire: 6, atomic: 7, digital: 8,
  signal: 9, revelation: 10, preparation: 11, arrival: 12,
};

const SIGNAL_STRENGTH_BY_ERA: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
  7: HARBINGER.SIGNAL_STRENGTH.ERA_7,
  8: HARBINGER.SIGNAL_STRENGTH.ERA_8,
  9: HARBINGER.SIGNAL_STRENGTH.ERA_9,
  10: HARBINGER.SIGNAL_STRENGTH.ERA_10,
  11: HARBINGER.SIGNAL_STRENGTH.ERA_11,
  12: HARBINGER.SIGNAL_STRENGTH.ERA_12,
};

const ACTION_COSTS: Record<HarbingerActionType, number> = {
  discord: HARBINGER.ACTION_COSTS.DISCORD,
  corruption: HARBINGER.ACTION_COSTS.CORRUPTION,
  false_miracle: HARBINGER.ACTION_COSTS.FALSE_MIRACLE,
  plague_seed: HARBINGER.ACTION_COSTS.PLAGUE_SEED,
  sever: HARBINGER.ACTION_COSTS.SEVER,
  veil: HARBINGER.ACTION_COSTS.VEIL,
};

/** Returns the signal strength budget for the given era index. */
export function signalStrengthForEra(eraIndex: number): number {
  return SIGNAL_STRENGTH_BY_ERA[eraIndex] ?? 0;
}

/** Get current era index. */
function currentEraIndex(state: GameState): number {
  return ERA_INDEX[state.world.currentEra] ?? 1;
}

/** Effective cost of an action — doubles for Dev 8+ regions (prosperity resistance). */
function effectiveCost(
  action: HarbingerActionType,
  regionDev: number,
): number {
  const base = ACTION_COSTS[action];
  if (regionDev >= HARBINGER.PROSPERITY_RESISTANCE_DEV) {
    return Math.ceil(base / HARBINGER.PROSPERITY_RESISTANCE_FACTOR);
  }
  return base;
}

/** Returns true if a region has an active Shield of Faith effect. */
function regionHasShield(state: GameState, regionId: RegionId): boolean {
  const region = state.world.regions.get(regionId);
  if (!region) return false;
  return region.activeEffects.some(e => e.powerId === 'shield_of_faith');
}

/** Assess player strategy based on world state. */
function assessPlayerStrategy(state: GameState): HarbingerStrategyAssessment {
  const playerNations = Array.from(state.world.nations.values()).filter(n => {
    if (n.isPlayerNation) return true;
    // Nations with >60% player religion influence
    const inf = Array.from(state.world.regions.values())
      .filter(r => n.regionIds.includes(r.id))
      .reduce((sum, r) => {
        const ri = r.religiousInfluence.find(x => x.religionId === state.playerReligionId);
        return sum + (ri?.strength ?? 0);
      }, 0);
    return inf / Math.max(1, n.regionIds.length) > 0.6;
  });

  if (playerNations.length === 0) return 'balanced';

  const avgDev =
    playerNations.reduce((sum, n) => sum + n.development, 0) / playerNations.length;
  const scienceScore = avgDev / 12;

  const totalPop = Array.from(state.world.regions.values()).reduce(
    (sum, r) => sum + r.population,
    0,
  );
  const playerPop = Array.from(state.world.regions.values())
    .filter(r => r.dominantReligion === state.playerReligionId)
    .reduce((sum, r) => sum + r.population, 0);
  const faithScore = totalPop > 0 ? playerPop / totalPop : 0;

  const totalNations = state.world.nations.size;
  let allianceCount = 0;
  for (const n of playerNations) {
    for (const rel of n.relations.values()) {
      if (rel.alliance) allianceCount++;
    }
  }
  const diplomacyScore = allianceCount / Math.max(1, totalNations);

  let atWarCount = 0;
  for (const n of playerNations) {
    for (const rel of n.relations.values()) {
      if (rel.atWar) atWarCount++;
    }
  }
  const militaryScore = atWarCount > 0 ? Math.min(1, atWarCount / 3) : 0;

  // Find dominant strategy
  const scores: Record<string, number> = {
    science_rush: scienceScore,
    faith_expansion: faithScore,
    peace_cooperation: diplomacyScore,
    military_dominance: militaryScore,
  };
  const max = Math.max(...Object.values(scores));
  if (max < 0.2) return 'balanced';
  const top = Object.entries(scores).find(([, v]) => v === max);
  return (top?.[0] as HarbingerStrategyAssessment) ?? 'balanced';
}

/** Compute effective budget via rubber banding. */
function rubberBandBudget(
  state: GameState,
  signalStrength: number,
): number {
  const playerNations = Array.from(state.world.nations.values()).filter(n => {
    if (n.isPlayerNation) return true;
    const avg = n.regionIds
      .map(rid => {
        const r = state.world.regions.get(rid);
        return r?.religiousInfluence.find(ri => ri.religionId === state.playerReligionId)?.strength ?? 0;
      })
      .reduce((a, b) => a + b, 0) / Math.max(1, n.regionIds.length);
    return avg > 0.6;
  });

  const totalPop = Array.from(state.world.regions.values()).reduce(
    (sum, r) => sum + r.population,
    0,
  );
  const playerPop = Array.from(state.world.regions.values())
    .filter(r => r.dominantReligion === state.playerReligionId)
    .reduce((sum, r) => sum + r.population, 0);
  const faithPct = totalPop > 0 ? playerPop / totalPop : 0;

  const avgDev =
    playerNations.length > 0
      ? playerNations.reduce((sum, n) => sum + n.development, 0) / playerNations.length
      : 0;

  let allianceCount = 0;
  for (const n of playerNations) {
    for (const rel of n.relations.values()) {
      if (rel.alliance) allianceCount++;
    }
  }
  const totalNations = state.world.nations.size;

  const playerAdvantage =
    faithPct * 0.4 +
    (avgDev / 12) * 0.3 +
    (allianceCount / Math.max(1, totalNations)) * 0.3;

  let budgetUsage: number;
  if (playerAdvantage > 0.6) {
    budgetUsage = HARBINGER.RUBBER_BAND_HIGH;
  } else if (playerAdvantage < 0.3) {
    budgetUsage = HARBINGER.RUBBER_BAND_LOW;
  } else {
    // lerp between 0.5 and 1.0
    const t = (playerAdvantage - 0.3) / 0.3;
    budgetUsage =
      HARBINGER.RUBBER_BAND_LOW +
      t * (HARBINGER.RUBBER_BAND_HIGH - HARBINGER.RUBBER_BAND_LOW);
  }

  return Math.floor(signalStrength * budgetUsage);
}

/** Select the best target region for an action. */
function selectTargetRegion(
  state: GameState,
  action: HarbingerActionType,
  strategy: HarbingerStrategyAssessment,
  rng: () => number,
): RegionId | null {
  const regions = Array.from(state.world.regions.values()).filter(
    r => r.terrain !== 'ocean' && !regionHasShield(state, r.id),
  );
  if (regions.length === 0) return null;

  // Exclude already corrupted/veiled
  const { corruptedRegionIds, veiledRegionIds } = state.world.alienState.harbinger;

  let candidates = regions.filter(
    r =>
      !corruptedRegionIds.includes(r.id) && !veiledRegionIds.includes(r.id),
  );
  if (candidates.length === 0) candidates = regions;

  // Action-specific targeting
  switch (strategy) {
    case 'science_rush': {
      if (action === 'corruption' || action === 'plague_seed') {
        // Target highest-dev regions
        candidates.sort((a, b) => b.development - a.development);
        return candidates[0]?.id ?? null;
      }
      break;
    }
    case 'faith_expansion': {
      if (action === 'false_miracle') {
        // Target contested regions (player religion strong but not dominant)
        const contested = candidates.filter(r => {
          const inf = r.religiousInfluence.find(
            ri => ri.religionId === state.playerReligionId,
          );
          return inf && inf.strength > 0.4 && inf.strength < 0.7;
        });
        if (contested.length > 0) {
          return contested[Math.floor(rng() * contested.length)].id;
        }
      }
      break;
    }
    case 'peace_cooperation': {
      if (action === 'discord') {
        // Target allied nations' capital regions
        for (const nation of state.world.nations.values()) {
          let allianceCount = 0;
          for (const rel of nation.relations.values()) {
            if (rel.alliance) allianceCount++;
          }
          if (allianceCount >= 2 && nation.regionIds.length > 0) {
            const capitalId = nation.regionIds[0] as RegionId;
            if (!regionHasShield(state, capitalId)) return capitalId;
          }
        }
      }
      break;
    }
    case 'military_dominance': {
      if (action === 'plague_seed' || action === 'sever') {
        // Target regions near wars
        const warRegions = candidates.filter(r => {
          const nation = state.world.nations.get(r.nationId);
          if (!nation) return false;
          for (const rel of nation.relations.values()) {
            if (rel.atWar) return true;
          }
          return false;
        });
        if (warRegions.length > 0) {
          return warRegions[Math.floor(rng() * warRegions.length)].id;
        }
      }
      break;
    }
    default:
      break;
  }

  // Fallback: random region from candidates
  return candidates[Math.floor(rng() * candidates.length)]?.id ?? null;
}

/** Select an action based on strategy. */
function selectAction(
  strategy: HarbingerStrategyAssessment,
  budget: number,
  rng: () => number,
): HarbingerActionType | null {
  // Strategy → preferred actions
  let preferred: HarbingerActionType[];
  switch (strategy) {
    case 'science_rush':
      preferred = ['corruption', 'plague_seed', 'discord', 'sever', 'veil', 'false_miracle'];
      break;
    case 'faith_expansion':
      preferred = ['false_miracle', 'sever', 'discord', 'corruption', 'plague_seed', 'veil'];
      break;
    case 'peace_cooperation':
      preferred = ['discord', 'sever', 'corruption', 'veil', 'plague_seed', 'false_miracle'];
      break;
    case 'military_dominance':
      preferred = ['plague_seed', 'sever', 'discord', 'corruption', 'false_miracle', 'veil'];
      break;
    default:
      preferred = ['discord', 'sever', 'corruption', 'plague_seed', 'false_miracle', 'veil'];
  }

  // Pick first affordable action
  for (const action of preferred) {
    if (ACTION_COSTS[action] <= budget) return action;
  }
  return null;
}

/**
 * Harbinger tick. Dormant Eras 1–6; active Era 7+.
 * Acts every HARBINGER_TICK_INTERVAL ticks.
 * Spends signal strength budget on sabotage actions.
 */
export function tickHarbinger(state: GameState): GameState {
  return produce(state, draft => {
    const eraIndex = currentEraIndex(draft as GameState);
    if (eraIndex < HARBINGER.ACTIVE_ERA_START) return;

    const tick = draft.world.currentTick;
    const { harbinger } = draft.world.alienState;

    // Check tick interval
    if (tick - harbinger.lastActionTick < HARBINGER.TICK_INTERVAL) return;

    const worldSeed = draft.world.seed;
    let callIndex = tick * 2000;
    const rng = () => seededRandom(worldSeed, tick, callIndex++);

    // Refresh budget at era start (when budget would have been 0 from previous era)
    const signalStrength = signalStrengthForEra(eraIndex);
    if (harbinger.budgetRemaining <= 0 && signalStrength > 0) {
      // If budget was exhausted and we're in an active era, refresh for this era
      // (Era transitions in the runner trigger this naturally)
    }

    // Compute rubber-banded effective budget
    const effectiveBudget = rubberBandBudget(draft as GameState, harbinger.budgetRemaining);

    if (effectiveBudget <= 0) {
      harbinger.lastActionTick = tick;
      return;
    }

    // Assess strategy and select action
    const strategy = assessPlayerStrategy(draft as GameState);
    harbinger.playerStrategyAssessment = strategy;

    const action = selectAction(strategy, effectiveBudget, rng);
    if (!action) {
      harbinger.lastActionTick = tick;
      return;
    }

    const targetRegionId = selectTargetRegion(
      draft as GameState,
      action,
      strategy,
      rng,
    );
    if (!targetRegionId) {
      harbinger.lastActionTick = tick;
      return;
    }

    const region = draft.world.regions.get(targetRegionId);
    if (!region) {
      harbinger.lastActionTick = tick;
      return;
    }

    // Shield check
    if (regionHasShield(draft as GameState, targetRegionId)) {
      harbinger.lastActionTick = tick;
      return;
    }

    const cost = effectiveCost(action, region.development);
    if (harbinger.budgetRemaining < cost) {
      harbinger.lastActionTick = tick;
      return;
    }

    // Apply action
    switch (action) {
      case 'discord': {
        // -0.20 diplomatic opinion between two nations for 1 era
        const nations = Array.from(draft.world.nations.values());
        if (nations.length >= 2) {
          const a = nations[Math.floor(rng() * nations.length)];
          const others = nations.filter(n => n.id !== a.id);
          if (others.length > 0) {
            const b = others[Math.floor(rng() * others.length)];
            const relAB = a.relations.get(b.id);
            const relBA = b.relations.get(a.id);
            if (relAB) relAB.opinion = Math.max(-1, relAB.opinion - 0.2);
            if (relBA) relBA.opinion = Math.max(-1, relBA.opinion - 0.2);
          }
        }
        break;
      }
      case 'corruption': {
        // Schedule -1 Dev over 10 game-years (20 ticks); mark as corrupted
        if (region.development > 1) {
          harbinger.corruptedRegionIds.push(targetRegionId);
        }
        break;
      }
      case 'false_miracle': {
        // Rival religion +0.15 influence in target region
        const rivals = region.religiousInfluence.filter(
          ri => ri.religionId !== state.playerReligionId,
        );
        if (rivals.length > 0) {
          const rivalIdx = Math.floor(rng() * rivals.length);
          const ri = region.religiousInfluence.find(
            x => x.religionId === rivals[rivalIdx].religionId,
          );
          if (ri) ri.strength = Math.min(1, ri.strength + 0.15);
          // Normalize
          const total = region.religiousInfluence.reduce((s, x) => s + x.strength, 0);
          if (total > 1) {
            for (const x of region.religiousInfluence) {
              x.strength = x.strength / total;
            }
          }
        }
        break;
      }
      case 'plague_seed': {
        // Introduce moderate disease
        draft.world.diseases.push({
          id: `harbinger_plague_${tick}`,
          name: 'Alien Contagion',
          severity: 'moderate',
          affectedRegions: [targetRegionId],
          immuneRegionIds: [],
          infectionStartTickByRegion: new Map([[targetRegionId, tick]]),
          spreadRate: 0.015,
          mortalityRate: 0.005,
          originYear: draft.world.currentYear,
          isDivine: true,
          isActive: true,
        });
        break;
      }
      case 'sever': {
        // Break a trade route — disrupt for 10 years
        for (const route of draft.world.tradeRoutes.values()) {
          if (route.regionA === targetRegionId || route.regionB === targetRegionId) {
            route.isActive = false;
            route.disruptedUntilYear = draft.world.currentYear + HARBINGER.SEVER_DISRUPTION_YEARS;
            break;
          }
        }
        break;
      }
      case 'veil': {
        // Hide region data for 1 era
        if (!harbinger.veiledRegionIds.includes(targetRegionId)) {
          harbinger.veiledRegionIds.push(targetRegionId);
        }
        break;
      }
    }

    // Log action
    const logEntry: HarbingerActionLog = {
      tick,
      action,
      targetRegionId,
      cost,
    };
    harbinger.actionsLog.push(logEntry);
    harbinger.budgetRemaining -= cost;
    harbinger.lastActionTick = tick;
  });
}

/**
 * Called at era transitions to refresh the Harbinger's budget.
 */
export function refreshHarbingerBudget(state: GameState): GameState {
  return produce(state, draft => {
    const eraIndex = ERA_INDEX[draft.world.currentEra] ?? 1;
    const signalStrength = signalStrengthForEra(eraIndex);
    draft.world.alienState.harbinger.budgetRemaining = signalStrength;
    // Clear veiled regions at era boundary
    const newVeiled: RegionId[] = [];
    draft.world.alienState.harbinger.veiledRegionIds = newVeiled;
  });
}

/**
 * Applies ongoing corruption effects (dev loss rate per tick for corrupted regions).
 */
export function tickCorruption(state: GameState): GameState {
  return produce(state, draft => {
    const { corruptedRegionIds } = draft.world.alienState.harbinger;
    for (const regionId of corruptedRegionIds) {
      const region = draft.world.regions.get(regionId);
      if (region && region.development > 1) {
        region.development = Math.max(1, region.development - HARBINGER.CORRUPTION_DEV_LOSS_RATE);
      }
    }
  });
}
