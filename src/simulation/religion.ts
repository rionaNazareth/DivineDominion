import './immer-config.js';
import { produce } from 'immer';

import { RELIGION, COMMANDMENT_STACKING } from '../config/constants.js';
import type {
  GameState,
  RegionId,
  ReligionId,
  WorldState,
  Region,
  ReligionInfluence,
} from '../types/game.js';
import { seededRandom } from './prng.js';

const UNAFFILIATED_ID = 'UNAFFILIATED' as ReligionId;

type InfluenceMap = Map<ReligionId, number>;

function getWorld(state: GameState): WorldState {
  return state.world;
}

function influenceFromRegion(region: Region): InfluenceMap {
  const map = new Map<ReligionId, number>() as InfluenceMap;
  for (const { religionId, strength } of region.religiousInfluence) {
    if (strength > 0) map.set(religionId, strength);
  }
  return map;
}

function influenceToArray(map: InfluenceMap): ReligionInfluence[] {
  const out: ReligionInfluence[] = [];
  for (const [religionId, strength] of map.entries()) {
    if (strength > 0) out.push({ religionId, strength });
  }
  return out;
}

function getTerrainResistance(terrain: Region['terrain']): number {
  return RELIGION.TERRAIN_RESISTANCE[terrain] ?? 1;
}

function hasTradeRoute(world: WorldState, a: RegionId, b: RegionId): boolean {
  for (const route of world.tradeRoutes.values()) {
    if (!route.isActive) continue;
    const match =
      (route.regionA === a && route.regionB === b) ||
      (route.regionA === b && route.regionB === a);
    if (match) return true;
  }
  return false;
}

function getDominantReligion(snap: InfluenceMap): ReligionId | null {
  let maxStr = 0;
  let dominant: ReligionId | null = null;
  for (const [rid, str] of snap.entries()) {
    if (rid === UNAFFILIATED_ID) continue;
    if (str > maxStr) {
      maxStr = str;
      dominant = rid;
    }
  }
  return dominant;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Heat-diffusion religion spread. Uses frozen snapshot per tick; updates
 * religiousInfluence and dominantReligion per region.
 */
export function tickReligionSpread(
  state: GameState,
  deltaYears: number,
): GameState {
  return produce(state, (draft) => {
    const world = getWorld(draft);
    const regionIds = Array.from(world.regions.keys()).sort();
    const religionIds = Array.from(world.religions.keys());
    religionIds.push(UNAFFILIATED_ID);

    // Snapshot: region -> religion -> strength
    const snapshot = new Map<RegionId, InfluenceMap>();
    for (const rid of regionIds) {
      const region = world.regions.get(rid);
      if (!region) continue;
      snapshot.set(rid, influenceFromRegion(region));
    }

    // Deltas: same shape
    const delta = new Map<RegionId, InfluenceMap>();
    for (const rid of regionIds) {
      delta.set(rid, new Map() as InfluenceMap);
    }

    const cmdSpreadMod = 0; // Phase 1c can inject player commandment passiveSpread

    for (let i = 0; i < regionIds.length; i++) {
      const aId = regionIds[i];
      const regionA = world.regions.get(aId);
      if (!regionA || regionA.terrain === 'ocean') continue;

      const snapA = snapshot.get(aId)!;
      const deltaA = delta.get(aId)!;

      for (const adjId of regionA.adjacentRegionIds) {
        if (adjId <= aId) continue;
        const regionB = world.regions.get(adjId);
        if (!regionB || regionB.terrain === 'ocean') continue;

        const snapB = snapshot.get(adjId)!;
        const deltaB = delta.get(adjId)!;
        const terrainResist = getTerrainResistance(regionB.terrain);
        const hasTrade = hasTradeRoute(world, aId, adjId);

        for (const r of religionIds) {
          const strA = snapA.get(r) ?? 0;
          const strB = snapB.get(r) ?? 0;
          if (strA === 0 && strB === 0) continue;

          const gradient = strA - strB;
          let effectiveGradient = gradient;

          const losingId = gradient > 0 ? aId : adjId;
          const losingSnap = losingId === aId ? snapA : snapB;
          const dom = getDominantReligion(losingSnap);
          const domStr = dom ? losingSnap.get(dom) ?? 0 : 0;
          if (
            r === dom &&
            domStr >= RELIGION.CONVERSION_DOMINANT_THRESHOLD
          ) {
            effectiveGradient *= RELIGION.DOMINANCE_INERTIA;
          }

          let flow =
            RELIGION.SPREAD_DIFFUSION_RATE *
            effectiveGradient *
            (1 - terrainResist);

          if (hasTrade && effectiveGradient !== 0) {
            const sign = effectiveGradient > 0 ? 1 : -1;
            flow +=
              RELIGION.TRADE_ROUTE_SPREAD_BONUS *
              sign *
              (1 - terrainResist);
          }

          flow *= 1 + clamp(cmdSpreadMod, COMMANDMENT_STACKING.MODIFIER_CAP_NEGATIVE, COMMANDMENT_STACKING.MODIFIER_CAP_POSITIVE);

          const prevA = deltaA.get(r) ?? 0;
          const prevB = deltaB.get(r) ?? 0;
          deltaA.set(r, prevA - flow);
          deltaB.set(r, prevB + flow);
        }
      }
    }

    // Apply deltas and normalize
    for (const rid of regionIds) {
      const region = world.regions.get(rid);
      if (!region || region.terrain === 'ocean') continue;

      const snap = snapshot.get(rid)!;
      const d = delta.get(rid)!;
      const next = new Map() as InfluenceMap;

      for (const r of religionIds) {
        const v = (snap.get(r) ?? 0) + (d.get(r) ?? 0);
        if (v > 0) next.set(r, v);
      }

      // Clamp to non-negative (already by only setting v>0)
      let total = 0;
      for (const v of next.values()) total += v;

      if (total > 1) {
        for (const r of next.keys()) {
          next.set(r, next.get(r)! / total);
        }
        total = 1;
      }
      if (total < 0.01) {
        next.set(UNAFFILIATED_ID, 1 - total);
      }

      const arr = influenceToArray(next);
      region.religiousInfluence = arr.length > 0 ? arr : [{ religionId: UNAFFILIATED_ID, strength: 1 }];

      let dominant: ReligionId | null = null;
      let maxStr = 0;
      for (const [r, str] of next.entries()) {
        if (r === UNAFFILIATED_ID) continue;
        if (str > maxStr && str >= RELIGION.CONVERSION_DOMINANT_THRESHOLD) {
          maxStr = str;
          dominant = r;
        }
      }
      region.dominantReligion = dominant ?? ('' as ReligionId);
      const faithSum = arr.reduce((s, x) => s + x.strength, 0);
      region.faithStrength = faithSum;
    }
  });
}
