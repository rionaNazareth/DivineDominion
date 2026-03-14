import './immer-config.js';
import { produce } from 'immer';

import { COMMANDMENT_STACKING, HYPOCRISY, RELIGION } from '../config/constants.js';
import type {
  CommandmentEffects,
  GameState,
  Region,
  RegionId,
  ReligionId,
  ReligionInfluence,
  WorldState,
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
 * Compute the total schism risk (tension) from selected commandments.
 * Sum of all schismRisk values from effectiveCommandmentEffects.
 * Tension pairs each contribute their schismRisk modifier.
 */
function computeTotalTension(cmdEffects: CommandmentEffects | null): number {
  if (!cmdEffects) return 0;
  return cmdEffects.schismRisk ?? 0;
}

/**
 * Schism check formula (D3.3): per tick, per region where player religion is dominant.
 * Returns true if a schism fires in this region.
 */
function checkSchism(
  region: Region,
  totalTension: number,
  hypocrisyLevel: number,
  prng: () => number,
): boolean {
  if (totalTension <= 0) return false;

  const happiness = region.happiness;
  let schismProb = totalTension * HYPOCRISY.SCHISM_BASE_RISK_PER_TICK * (1 - happiness) * (1 + hypocrisyLevel);

  if (totalTension >= HYPOCRISY.SCHISM_THRESHOLD) {
    schismProb *= 2.0;
  }

  return prng() < schismProb;
}

/**
 * Heat-diffusion religion spread. Uses frozen snapshot per tick; updates
 * religiousInfluence and dominantReligion per region.
 *
 * D3.2: Missionary conversion (Prophet blessing) — one-sided, +MISSIONARY_CONVERSION_RATE/tick per adj region.
 * D3.3: Schism check — per region where player religion is dominant; fires new religion.
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

    const cmdEffects = draft.effectiveCommandmentEffects ?? null;
    const cmdSpreadMod = cmdEffects?.missionaryEffectiveness ?? 0;
    const cmdMissionaryMod = cmdEffects?.missionaryEffectiveness ?? 0;

    const playerReligionId = draft.playerReligionId;
    const hypocrisyLevel = draft.hypocrisyLevel;
    const totalTension = computeTotalTension(cmdEffects);

    // Snapshot: region -> religion -> strength (frozen at tick start per D3.2)
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

    // D3.2 Heat diffusion: bidirectional flow between adjacent regions
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
          if (r === dom && domStr >= RELIGION.CONVERSION_DOMINANT_THRESHOLD) {
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

    // D3.2 Missionary conversion: Prophet blessing in a region → one-sided spread to neighbors
    for (const regionId of regionIds) {
      const region = world.regions.get(regionId);
      if (!region || region.terrain === 'ocean') continue;

      const hasProphet = region.activeEffects.some((e) => e.powerId === 'prophet');
      if (!hasProphet) continue;

      // Find the religion with the highest influence in this region (the missionary's religion)
      const snapSrc = snapshot.get(regionId)!;
      let missionaryReligion: ReligionId | null = null;
      let maxStr = 0;
      for (const [rid, str] of snapSrc.entries()) {
        if (rid === UNAFFILIATED_ID) continue;
        if (str > maxStr) {
          maxStr = str;
          missionaryReligion = rid;
        }
      }
      if (!missionaryReligion) continue;

      const missionaryRate = RELIGION.MISSIONARY_CONVERSION_RATE *
        (1 + clamp(cmdMissionaryMod, -0.50, 0.75));

      for (const adjId of region.adjacentRegionIds) {
        const adjRegion = world.regions.get(adjId);
        if (!adjRegion || adjRegion.terrain === 'ocean') continue;

        const terrainResist = getTerrainResistance(adjRegion.terrain);
        const conversionFlow = missionaryRate * (1 - terrainResist);

        const adjDelta = delta.get(adjId)!;
        const prev = adjDelta.get(missionaryReligion) ?? 0;
        adjDelta.set(missionaryReligion, prev + conversionFlow);
        // Source region NOT reduced (one-sided per D3.2)
      }
    }

    // Apply deltas and normalize
    const schismRegions: RegionId[] = [];

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

      // D3.3 Collect regions eligible for schism check (player religion dominant)
      if (dominant === playerReligionId) {
        schismRegions.push(rid);
      }
    }

    // D3.3 Schism check: per eligible region
    if (schismRegions.length > 0 && totalTension > 0) {
      let callIndex = draft.prngState;
      for (const rid of schismRegions) {
        const region = world.regions.get(rid);
        if (!region) continue;
        const prng = () => seededRandom(world.seed, world.currentTick, callIndex++);

        if (checkSchism(region, totalTension, hypocrisyLevel, prng)) {
          // Create a schism religion: split off some influence from the player religion
          const schismId = `schism_${world.currentTick}_${rid}` as ReligionId;
          const playerInfluenceEntry = region.religiousInfluence.find(
            (ri) => ri.religionId === playerReligionId,
          );
          if (playerInfluenceEntry && playerInfluenceEntry.strength > 0.1) {
            const splitAmount = playerInfluenceEntry.strength * 0.3;
            playerInfluenceEntry.strength -= splitAmount;

            region.religiousInfluence.push({
              religionId: schismId,
              strength: splitAmount,
            });

            // Register schism religion in world
            world.religions.set(schismId, {
              id: schismId,
              name: `Schism of ${world.religions.get(playerReligionId)?.name ?? 'Unknown'}`,
              color: '#888888',
              symbol: '⚡',
              commandments: [],
              isPlayerReligion: false,
            });
          }
        }
        draft.prngState = callIndex;
      }
    }
  });
}
