import './immer-config.js';
import { produce } from 'immer';

import { NATION_AI } from '../config/constants.js';
import type {
  GameState,
  WorldState,
  NationId,
  Nation,
  RegionId,
} from '../types/game.js';

import { NUCLEAR } from '../config/constants.js';

const NUCLEAR_DETERRENCE_MOD = NUCLEAR.DETERRENCE_MOD;

function getWorld(state: GameState): WorldState {
  return state.world;
}

function isNationAtWar(nation: Nation): boolean {
  for (const rel of nation.relations.values()) {
    if (rel.atWar) return true;
  }
  return false;
}

function getNeighborNationIds(world: WorldState, nationId: NationId): NationId[] {
  const nation = world.nations.get(nationId);
  if (!nation) return [];
  const ourRegions = new Set(nation.regionIds);
  const neighbors = new Set<NationId>();
  for (const rid of nation.regionIds) {
    const region = world.regions.get(rid);
    if (!region) continue;
    for (const adjId of region.adjacentRegionIds) {
      const adj = world.regions.get(adjId);
      if (!adj || ourRegions.has(adjId)) continue;
      neighbors.add(adj.nationId);
    }
  }
  return Array.from(neighbors).sort();
}

function countSharedBorders(
  world: WorldState,
  nationA: NationId,
  nationB: NationId,
): number {
  const regionsA = new Set(
    world.nations.get(nationA)?.regionIds ?? [],
  );
  let count = 0;
  for (const rid of regionsA) {
    const region = world.regions.get(rid);
    if (!region) continue;
    for (const adjId of region.adjacentRegionIds) {
      const adj = world.regions.get(adjId);
      if (adj?.nationId === nationB) count++;
    }
  }
  return count;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getPersonalityWeight(
  personality: Nation['aiPersonality'],
  action: 'declare_war' | 'sue_peace' | 'form_alliance' | 'form_trade',
): number {
  const w = NATION_AI.PERSONALITY_WEIGHTS[personality];
  return w?.[action] ?? 1.0;
}

/**
 * Nation AI tick: war declaration, sue for peace, (alliance/trade stubs).
 * One major action per nation per tick. Uses WAR_DECLARATION_THRESHOLD 0.60.
 */
export function tickNationAI(
  state: GameState,
  deltaYears: number,
): GameState {
  return produce(state, (draft) => {
    const world = draft.world;
    const nationIds = Array.from(world.nations.keys()).sort();

    for (const nationId of nationIds) {
      const nation = world.nations.get(nationId);
      if (!nation) continue;

      const atWar = isNationAtWar(nation);
      const enemies: NationId[] = atWar
        ? Array.from(nation.relations.entries())
            .filter(([, r]) => r.atWar)
            .map(([id]) => id)
            .sort()
        : [];
      const neighbors = getNeighborNationIds(world, nationId);

      let bestAction: 'war' | 'peace' | null = null;
      let bestScore = -1;
      let bestTarget: NationId | null = null;

      if (atWar && enemies.length > 0) {
        for (const targetId of enemies) {
          const rel = nation.relations.get(targetId);
          if (!rel?.atWar) continue;
          const warWeariness = nation.warWeariness ?? 0;
          const lostRegions = rel.lostTerritory ?? false;
          const ticksAtWar = world.currentTick - (rel.warStartTick ?? world.currentTick);
          const stability = nation.stability ?? 0.7;
          const isLosing = lostRegions ? 1.0 : 0.0;
          const warDuration = Math.min(ticksAtWar / 100, 1.0);
          const lowStability = 1.0 - stability;
          const raw =
            warWeariness * 0.4 + isLosing * 0.3 + warDuration * 0.2 + lowStability * 0.1;
          const whisperPeaceNudge = (nation.aiWeights?.peace ?? 0) > 0
            ? nation.aiWeights.peace * 0.3
            : 0;
          const peaceScore =
            getPersonalityWeight(nation.aiPersonality, 'sue_peace') * raw +
            whisperPeaceNudge;
          if (
            peaceScore > NATION_AI.PEACE_THRESHOLD &&
            peaceScore > bestScore
          ) {
            bestScore = peaceScore;
            bestAction = 'peace';
            bestTarget = targetId;
          }
        }
      }

      if (!atWar && bestAction === null) {
        for (const targetId of neighbors) {
          const rel = nation.relations.get(targetId);
          if (rel?.atWar) continue;

          const targetNation = world.nations.get(targetId);
          if (!targetNation) continue;

          const opinion = rel?.opinion ?? 0;
          const sharedBorders = countSharedBorders(world, nationId, targetId);
          const sameReligion =
            nation.dominantReligionId === targetNation.dominantReligionId;
          const targetAtWar = isNationAtWar(targetNation);
          const warWeariness = nation.warWeariness ?? 0;

          const militaryAdv = clamp(
            nation.militaryStrength / Math.max(targetNation.militaryStrength, 1) - 1,
            0,
            1,
          );
          const negOpinion = clamp(-opinion, 0, 1);
          const borderDispute = clamp(sharedBorders / 3, 0, 1);
          const religionDiff = sameReligion ? 0.0 : 1.0;
          const opportunity = targetAtWar ? 1.0 : 0.0;

          let rawScore =
            militaryAdv * NATION_AI.WAR_SCORE_MILITARY_WEIGHT +
            negOpinion * NATION_AI.WAR_SCORE_OPINION_WEIGHT +
            borderDispute * NATION_AI.WAR_SCORE_BORDER_WEIGHT +
            religionDiff * NATION_AI.WAR_SCORE_RELIGION_WEIGHT +
            opportunity * NATION_AI.WAR_SCORE_OPPORTUNITY_WEIGHT;

          const whisperWarNudge = (nation.aiWeights?.war ?? 0) > 0
            ? nation.aiWeights.war * 0.3
            : 0;
          let warScore =
            getPersonalityWeight(nation.aiPersonality, 'declare_war') * rawScore -
            warWeariness +
            whisperWarNudge;

          if (
            nation.development >= NUCLEAR.DEV_THRESHOLD &&
            targetNation.development >= NUCLEAR.DEV_THRESHOLD
          ) {
            warScore *= NUCLEAR_DETERRENCE_MOD;
          }

          if (
            warScore > NATION_AI.WAR_DECLARATION_THRESHOLD &&
            warScore > bestScore
          ) {
            bestScore = warScore;
            bestAction = 'war';
            bestTarget = targetId;
          }
        }
      }

      if (bestAction === 'peace' && bestTarget) {
        const relA = nation.relations.get(bestTarget);
        const relB = world.nations.get(bestTarget)?.relations.get(nationId);
        if (relA) {
          relA.atWar = false;
          relA.peaceTicks = 0;
        }
        if (relB) {
          relB.atWar = false;
          relB.peaceTicks = 0;
        }
      } else if (bestAction === 'war' && bestTarget) {
        const relA = nation.relations.get(bestTarget);
        const relB = world.nations.get(bestTarget)?.relations.get(nationId);
        if (relA) {
          relA.atWar = true;
          relA.warStartTick = world.currentTick;
        }
        if (relB) {
          relB.atWar = true;
          relB.warStartTick = world.currentTick;
        }
      }
    }
  });
}
