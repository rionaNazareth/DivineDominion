import './immer-config.js';
import { produce } from 'immer';
import type { GameState, ScienceMilestoneId } from '../types/game.js';
import {
  SCIENCE_MILESTONES,
  GLOBAL_SCIENCE,
  NUCLEAR,
  DEFENSE_GRID,
  WIN_CONDITIONS,
} from '../config/constants.js';

// Defense grid construction progress stored externally; we track via scienceProgress.milestonesReached
// and a helper field on WorldState.currentTick

function getEraIndex(eraId: string): number {
  const ERA_INDEX: Record<string, number> = {
    renaissance: 1, exploration: 2, enlightenment: 3, revolution: 4,
    industry: 5, empire: 6, atomic: 7, digital: 8,
    signal: 9, revelation: 10, preparation: 11, arrival: 12,
  };
  return ERA_INDEX[eraId] ?? 1;
}

/** Returns average development for a nation (pop-weighted, using regionIds). */
function nationAvgDev(state: GameState, nationId: string): number {
  const nation = state.world.nations.get(nationId);
  if (!nation) return 0;
  let totalPop = 0;
  let weightedDev = 0;
  for (const rid of nation.regionIds) {
    const region = state.world.regions.get(rid);
    if (!region) continue;
    totalPop += region.population;
    weightedDev += region.development * region.population;
  }
  return totalPop > 0 ? weightedDev / totalPop : nation.development;
}

/** Returns true if the two nations have at least one alliance relation. */
function nationsCooperating(state: GameState, idA: string, idB: string): boolean {
  const nationA = state.world.nations.get(idA);
  if (!nationA) return false;
  const rel = nationA.relations.get(idB);
  return !!(rel?.alliance || rel?.tradeAgreement);
}

/** Checks whether a milestone's special condition is met (peace, alliance, etc.) */
function checkSpecialCondition(
  state: GameState,
  milestoneId: ScienceMilestoneId,
): boolean {
  const allNations = Array.from(state.world.nations.values());

  if (milestoneId === 'internet') {
    // 3+ nations Dev 9, at peace (no active wars)
    const qnations = allNations.filter(n => n.development >= 9);
    if (qnations.length < 3) return false;
    // Check all pairs at peace
    for (const n of qnations) {
      for (const [, rel] of n.relations) {
        if (rel.atWar) return false;
      }
    }
    return true;
  }

  if (milestoneId === 'space_programs') {
    // 2 nations Dev 10, cooperating (alliance or trade)
    const qnations = allNations.filter(n => n.development >= 10);
    if (qnations.length < 2) return false;
    for (let i = 0; i < qnations.length; i++) {
      for (let j = i + 1; j < qnations.length; j++) {
        if (nationsCooperating(state, qnations[i].id, qnations[j].id)) return true;
      }
    }
    return false;
  }

  if (milestoneId === 'planetary_defense') {
    // Condition A: 5 nations Dev 10+ with alliance
    const qnations = allNations.filter(n => n.development >= WIN_CONDITIONS.DEFENSE_GRID_DEV_LEVEL);
    const cooperating = qnations.filter(n => {
      for (const [, rel] of n.relations) {
        if (rel.alliance) return true;
      }
      return false;
    });
    if (cooperating.length >= WIN_CONDITIONS.DEFENSE_GRID_NATIONS_REQUIRED) return true;
    // Condition B: 1 superpower Dev 12
    const superpower = allNations.filter(n => n.development >= WIN_CONDITIONS.SUPERPOWER_DEV_LEVEL);
    return superpower.length >= 1;
  }

  return true; // No special condition for other milestones
}

/** Compute global science speed modifier for the world state. */
export function computeGlobalScienceMod(state: GameState): number {
  const allNations = Array.from(state.world.nations.values());
  const totalNations = allNations.length;
  if (totalNations === 0) return 1.0;

  // Count wars (each war involves 2 nations)
  let warCount = 0;
  for (const nation of allNations) {
    for (const [, rel] of nation.relations) {
      if (rel.atWar) warCount++;
    }
  }
  warCount = Math.floor(warCount / 2); // Each war counted from both sides
  const warPressure = warCount / Math.max(1, totalNations);

  // Trade bonus
  const activeRoutes = Array.from(state.world.tradeRoutes.values()).filter(r => r.isActive).length;
  const tradePressure = Math.min(1.0, activeRoutes / GLOBAL_SCIENCE.TRADE_NORMALIZER);

  let globalMod = 1.0;
  globalMod -= warPressure * GLOBAL_SCIENCE.WAR_PENALTY;
  globalMod += tradePressure * GLOBAL_SCIENCE.TRADE_BONUS;

  return Math.max(GLOBAL_SCIENCE.MOD_MIN, Math.min(GLOBAL_SCIENCE.MOD_MAX, globalMod));
}

/** Compute global research output (sum of nation dev * pop, normalized). */
function computeGlobalResearchOutput(state: GameState): number {
  let total = 0;
  for (const nation of state.world.nations.values()) {
    total += nation.development * nation.economicOutput;
  }
  return total;
}

// Internal: track defense grid construction start tick. 
// We store it as a synthetic "milestone" index; need a side-channel.
// Strategy: store in a module-level Map keyed by seed (reset between games).
// Since this is a pure simulation, we use a tick-based check.
const gridConstructionStartTick = new Map<number, number>();

/**
 * tickScience — checks science milestones and updates scienceProgress.
 * Also handles defense grid construction timing.
 */
export function tickScience(state: GameState): GameState {
  return produce(state, draft => {
    const allNations = Array.from(draft.world.nations.values());
    const reached = draft.world.scienceProgress.milestonesReached;

    // Check each milestone in order
    for (const milestone of SCIENCE_MILESTONES) {
      if (reached.includes(milestone.id as ScienceMilestoneId)) continue;

      // Check previous milestone reached (in-order requirement)
      const milestoneIdx = SCIENCE_MILESTONES.indexOf(milestone);
      if (milestoneIdx > 0) {
        const prevId = SCIENCE_MILESTONES[milestoneIdx - 1].id as ScienceMilestoneId;
        if (!reached.includes(prevId)) continue;
      }

      // Special conditions (checked before nationsRequired for milestones that can bypass it)
      const specialMet = checkSpecialCondition(
        draft as unknown as GameState,
        milestone.id as ScienceMilestoneId,
      );
      if (!specialMet) continue;

      // Count nations meeting dev requirement
      // planetary_defense can unlock via superpower alone (specialMet covers it)
      if (milestone.id !== 'planetary_defense') {
        const qualifying = allNations.filter(n => n.development >= milestone.devRequired);
        if (qualifying.length < milestone.nationsRequired) continue;
      }

      // Milestone reached
      reached.push(milestone.id as ScienceMilestoneId);
      draft.world.scienceProgress.currentLevel = reached.length;
    }

    // Defense grid construction
    if (
      reached.includes('planetary_defense') &&
      !reached.includes('defense_grid')
    ) {
      const seed = draft.world.seed;
      const tick = draft.world.currentTick;

      if (!gridConstructionStartTick.has(seed)) {
        gridConstructionStartTick.set(seed, tick);
      }

      const startTick = gridConstructionStartTick.get(seed)!;
      if (tick - startTick >= DEFENSE_GRID.CONSTRUCTION_TICKS) {
        reached.push('defense_grid');
        draft.world.scienceProgress.currentLevel = reached.length;
      }

      // Update defense grid strength in alien state
      const progress = Math.min(
        1.0,
        (tick - startTick) / DEFENSE_GRID.CONSTRUCTION_TICKS,
      );
      draft.world.alienState.defenseGridStrength = progress;
    }

    // Nuclear deterrence modifier: applied via nation AI decision weights
    // (checked per-nation-pair in nation-ai.ts; here we just ensure the milestone exists)

    // Update global research output
    draft.world.scienceProgress.globalResearchOutput = computeGlobalResearchOutput(
      draft as unknown as GameState,
    );
  });
}

/** Resets defense grid construction tracking for a given seed (call at game start). */
export function resetGridTracker(seed: number): void {
  gridConstructionStartTick.delete(seed);
}

/** Check if nuclear deterrence applies between two nations. */
export function checkNuclearDeterrence(state: GameState, nationIdA: string, nationIdB: string): number {
  const a = state.world.nations.get(nationIdA);
  const b = state.world.nations.get(nationIdB);
  if (!a || !b) return 1.0;
  if (a.development >= NUCLEAR.DEV_THRESHOLD && b.development >= NUCLEAR.DEV_THRESHOLD) {
    return NUCLEAR.DETERRENCE_MOD;
  }
  return 1.0;
}
