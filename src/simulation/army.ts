import './immer-config.js';
import { produce } from 'immer';

import {
  ARMY_MOVEMENT,
  BATTLE,
  COMMANDER_MERGE_RANK,
  NATIONS,
  SIEGE,
  SUPPLY,
  TIME,
  ERAS,
} from '../config/constants.js';
import type {
  Army,
  ArmyId,
  BattleResult,
  GameState,
  Nation,
  NationId,
  Region,
  RegionId,
  ReligionId,
  WorldState,
} from '../types/game.js';
import { seededRandom } from './prng.js';

function getWorld(state: GameState): WorldState {
  return state.world;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

const ERA_INDEX_LOOKUP: Record<string, number> = {};
ERAS.forEach((era, index) => {
  ERA_INDEX_LOOKUP[era.id] = index + 1;
});

function movementTicksForTerrain(
  terrain: Region['terrain'],
  currentEra: string,
): number {
  if (terrain === 'ocean') {
    return Infinity;
  }
  const base = ARMY_MOVEMENT.TICKS_BY_TERRAIN[terrain] ?? 2;
  const eraIndex = ERA_INDEX_LOOKUP[currentEra] ?? 1;
  const eraMod =
    1 - (eraIndex - 1) * ARMY_MOVEMENT.ERA_SPEED_BONUS_PER_ERA;
  const ticks = Math.floor(base * eraMod);
  return Math.max(1, ticks);
}

function isNationAtWar(nation: Nation): boolean {
  for (const rel of nation.relations.values()) {
    if (rel.atWar) return true;
  }
  return false;
}

function areNationsAtWar(
  world: WorldState,
  a: NationId,
  b: NationId,
): boolean {
  if (a === b) return false;
  const na = world.nations.get(a);
  const nb = world.nations.get(b);
  if (!na || !nb) return false;
  const relA = na.relations.get(b);
  const relB = nb.relations.get(a);
  return Boolean(relA?.atWar || relB?.atWar);
}

function bfsDistanceToFriendly(
  world: WorldState,
  startRegionId: RegionId,
  nationId: NationId,
): number | null {
  const start = world.regions.get(startRegionId);
  if (!start) return null;
  const queue: { id: RegionId; dist: number }[] = [
    { id: startRegionId, dist: 0 },
  ];
  const visited = new Set<RegionId>([startRegionId]);
  while (queue.length > 0) {
    const { id, dist } = queue.shift()!;
    const region = world.regions.get(id);
    if (!region) continue;
    if (region.nationId === nationId) {
      return dist;
    }
    for (const adjId of region.adjacentRegionIds) {
      if (visited.has(adjId)) continue;
      visited.add(adjId);
      const adj = world.regions.get(adjId);
      if (!adj || adj.terrain === 'ocean') continue;
      queue.push({ id: adjId, dist: dist + 1 });
    }
  }
  return null;
}

function computeSupplyFactor(world: WorldState, army: Army): number {
  const dist = bfsDistanceToFriendly(
    world,
    army.currentRegionId,
    army.nationId,
  );
  if (dist == null) {
    return 0.3;
  }
  const baseRange = NATIONS.SUPPLY_RANGE_BASE;
  if (dist <= baseRange) return 1.0;
  const overshoot = dist - baseRange;
  const factor = 1 - overshoot * 0.15;
  return clamp(factor, 0.3, 1.0);
}

function applySupplyAttrition(army: Army, supplyFactor: number): void {
  if (supplyFactor >= 1.0) return;

  const shortfall = 1 - supplyFactor;
  const moraleDecay =
    shortfall * SUPPLY.MORALE_DECAY_PER_SHORTFALL;
  const strengthDecayRate =
    shortfall * SUPPLY.STRENGTH_DECAY_PER_SHORTFALL;

  const newMorale = Math.max(
    0.1,
    army.morale - moraleDecay,
  );
  const strengthLost = Math.max(
    0,
    Math.floor(army.strength * strengthDecayRate),
  );
  const newStrength = Math.max(
    NATIONS.ARMY_STRENGTH_MIN,
    army.strength - strengthLost,
  );

  army.morale = clamp(newMorale, 0, 1);
  army.strength = newStrength;
}

function computeDivineModifiers(
  region: Region,
  attackerNationId: NationId,
  defenderNationId: NationId,
  world: WorldState,
  playerReligionId: string,
): { divineA: number; divineD: number } {
  let divineA = 1.0;
  let divineD = 1.0;

  // Additive modifiers first (Shield, Miracle)
  const hasShield = region.activeEffects.some(
    (e) => e.powerId === 'shield_of_faith',
  );
  if (hasShield) {
    divineD += 0.5;
  }

  const hasMiracle = region.activeEffects.some(
    (e) => e.powerId === 'miracle',
  );
  if (hasMiracle) {
    const attackerNation = world.nations.get(attackerNationId);
    const defenderNation = world.nations.get(defenderNationId);
    const regionReligionId = region.dominantReligion;
    const attackerAligned =
      attackerNation &&
      attackerNation.dominantReligionId === playerReligionId &&
      regionReligionId === playerReligionId;
    const defenderAligned =
      defenderNation &&
      defenderNation.dominantReligionId === playerReligionId &&
      regionReligionId === playerReligionId;
    if (attackerAligned) divineA += 0.3;
    if (defenderAligned) divineD += 0.3;
  }

  // Multiplicative modifiers (Earthquake / Great Storm) applied after additives
  const hasChaos = region.activeEffects.some(
    (e) =>
      e.powerId === 'earthquake' || e.powerId === 'great_storm',
  );
  if (hasChaos) {
    divineA *= 0.8;
    divineD *= 0.8;
  }

  divineA = clamp(divineA, 0.5, 2.0);
  divineD = clamp(divineD, 0.5, 2.0);
  return { divineA, divineD };
}

function computeFaithModifiers(
  state: GameState,
  region: Region,
  defenderNation: Nation,
  attackerNation: Nation,
): { faithA: number; faithD: number } {
  let faithA = 1.0;
  let faithD = 1.0;

  const defenderRelId = defenderNation.dominantReligionId;
  const influenceEntry = region.religiousInfluence.find(
    (ri) => ri.religionId === defenderRelId,
  );
  const defenderInfluence = influenceEntry?.strength ?? 0;

  const attackerHasHolyWar =
    state.effectiveCommandmentEffects?.holyWarEnabled ??
    false;
  const defenderHasRighteousDefense =
    (state.effectiveCommandmentEffects?.defenseBonus ?? 0) > 0;

  if (
    attackerHasHolyWar &&
    attackerNation.dominantReligionId !== defenderRelId
  ) {
    faithA += BATTLE.FAITH_HOLY_WAR_BONUS;
  }

  if (
    defenderInfluence >= BATTLE.FAITH_STRONGHOLD_THRESHOLD
  ) {
    faithD += BATTLE.FAITH_DEFEND_BONUS;
  }

  if (defenderHasRighteousDefense) {
    faithD += BATTLE.FAITH_RIGHTEOUS_BONUS;
  }

  return { faithA, faithD };
}

function commanderAttackMod(army: Army): number {
  if (!army.commander) return 1.0;
  return (
    BATTLE.COMMANDER_ATTACK_MODS[army.commander.trait] ?? 1.0
  );
}

function commanderDefendMod(army: Army): number {
  if (!army.commander) return 1.0;
  return (
    BATTLE.COMMANDER_DEFEND_MODS[army.commander.trait] ?? 1.0
  );
}

function techModifiers(
  attackerNation: Nation,
  defenderNation: Nation,
): { techA: number; techD: number } {
  const devA = attackerNation.development;
  const devD = defenderNation.development;
  const gapA = Math.max(0, devA - devD);
  const gapD = Math.max(0, devD - devA);
  const techA =
    1.0 + gapA * BATTLE.TECH_ADVANTAGE_PER_DEV;
  const techD =
    1.0 + gapD * BATTLE.TECH_ADVANTAGE_PER_DEV;
  return { techA, techD };
}

function removeArmy(world: WorldState, armyId: ArmyId): void {
  world.armies.delete(armyId);
}

function findRetreatTarget(
  world: WorldState,
  fromRegionId: RegionId,
  nationId: NationId,
): RegionId | null {
  return bfsDistanceToFriendly(world, fromRegionId, nationId) !=
    null
    ? (() => {
        const queue: { id: RegionId }[] = [{ id: fromRegionId }];
        const visited = new Set<RegionId>([fromRegionId]);
        while (queue.length > 0) {
          const { id } = queue.shift()!;
          const region = world.regions.get(id);
          if (!region) continue;
          if (region.nationId === nationId) return id;
          for (const adjId of region.adjacentRegionIds) {
            if (visited.has(adjId)) continue;
            visited.add(adjId);
            const adj = world.regions.get(adjId);
            if (!adj || adj.terrain === 'ocean') continue;
            queue.push({ id: adjId });
          }
        }
        return null;
      })()
    : null;
}

const CONQUEST_RELIGION_BONUS = BATTLE.CONQUEST_RELIGION_BONUS;

/** Apply conquest: transfer region to winner, update nation.regionIds, lostTerritory, and +0.2 winner religion influence. */
function applyConquest(
  world: WorldState,
  regionId: RegionId,
  winnerNationId: NationId,
): void {
  const region = world.regions.get(regionId);
  const winnerNation = world.nations.get(winnerNationId);
  if (!region || !winnerNation) return;
  const loserNationId = region.nationId;
  if (loserNationId === winnerNationId) return;
  const loserNation = world.nations.get(loserNationId);
  if (!loserNation) return;

  region.nationId = winnerNationId;
  if (!winnerNation.regionIds.includes(regionId)) {
    winnerNation.regionIds.push(regionId);
  }
  loserNation.regionIds = loserNation.regionIds.filter((id) => id !== regionId);
  const loserRel = loserNation.relations.get(winnerNationId);
  if (loserRel) {
    loserRel.lostTerritory = true;
  }
  const winnerRel = winnerNation.relations.get(loserNationId);
  if (winnerRel) {
    winnerRel.lostTerritory = false;
  }

  const winnerReligionId = winnerNation.dominantReligionId as ReligionId;
  const influenceEntry = region.religiousInfluence.find(
    (ri) => ri.religionId === winnerReligionId,
  );
  if (influenceEntry) {
    influenceEntry.strength = clamp(
      influenceEntry.strength + CONQUEST_RELIGION_BONUS,
      0,
      1,
    );
  } else {
    region.religiousInfluence.push({
      religionId: winnerReligionId,
      strength: clamp(CONQUEST_RELIGION_BONUS, 0, 1),
    });
  }
  let total = 0;
  for (const ri of region.religiousInfluence) {
    total += ri.strength;
  }
  if (total > 1) {
    for (const ri of region.religiousInfluence) {
      ri.strength = ri.strength / total;
    }
  }
  let dominant: ReligionId | null = null;
  let maxStr = 0;
  for (const ri of region.religiousInfluence) {
    if (ri.strength > maxStr) {
      maxStr = ri.strength;
      dominant = ri.religionId;
    }
  }
  if (dominant != null) {
    region.dominantReligion = dominant;
  }

  // Nation elimination: if loser has 0 regions, remove them
  if (loserNation.regionIds.length === 0) {
    eliminateNation(world, loserNation.id);
  }
}

function eliminateNation(world: WorldState, nationId: NationId): void {
  // Disband all armies belonging to this nation
  const armyIds = Array.from(world.armies.keys());
  for (const aid of armyIds) {
    const army = world.armies.get(aid);
    if (army && army.nationId === nationId) {
      world.armies.delete(aid);
    }
  }

  // Dissolve trade routes touching this nation's (now-lost) regions
  for (const route of world.tradeRoutes.values()) {
    const regA = world.regions.get(route.regionA);
    const regB = world.regions.get(route.regionB);
    if (regA?.nationId === nationId || regB?.nationId === nationId) {
      route.isActive = false;
    }
  }

  // Remove diplomatic relations referencing this nation
  for (const nation of world.nations.values()) {
    nation.relations.delete(nationId);
  }

  world.nations.delete(nationId);
}

/** Deliverable 7.3: compute ticks to capture and per-tick attrition for a siege. */
function computeSiegeTicksToCapture(
  region: Region,
  attackerStrength: number,
  attackerNationDev: number,
  worldSeed: number,
  tick: number,
  callIndex: number,
): number {
  const fortLevel = region.cityLevel;
  if (fortLevel === 0) return 0;
  const baseTicks =
    20 + fortLevel * SIEGE.TICKS_PER_FORT_LEVEL;
  const devFactor =
    1.0 + (region.development - 1) * SIEGE.DEV_EXTEND_FACTOR;
  let strengthFactor =
    SIEGE.STRENGTH_BASE / Math.max(500, attackerStrength);
  strengthFactor = clamp(
    strengthFactor,
    SIEGE.STRENGTH_FACTOR_MIN,
    SIEGE.STRENGTH_FACTOR_MAX,
  );
  let siegeTicks = baseTicks * devFactor * strengthFactor;
  if (attackerNationDev >= 6) {
    siegeTicks *= SIEGE.EQUIPMENT_MULTIPLIER;
  }
  const variance =
    (seededRandom(worldSeed, tick, callIndex) * 2 - 1) *
    SIEGE.VARIANCE_RANGE;
  return Math.max(1, Math.floor(siegeTicks * (1 + variance)));
}

/** Deliverable 7.3: siege attrition per tick. */
function siegeAttritionPerTick(
  region: Region,
  attackerStrength: number,
): number {
  const fortLevel = region.cityLevel;
  const rate =
    SIEGE.ATTRITION_BASE *
    (1 + fortLevel * SIEGE.ATTRITION_FORT_BONUS);
  return Math.max(1, Math.floor(attackerStrength * rate));
}

/** True if there is at least one army in this region belonging to the region owner. */
function hasDefenderInRegion(
  world: WorldState,
  regionId: RegionId,
  regionOwnerNationId: NationId,
): boolean {
  for (const army of world.armies.values()) {
    if (
      army.currentRegionId === regionId &&
      army.nationId === regionOwnerNationId
    ) {
      return true;
    }
  }
  return false;
}

export function resolveBattle(
  state: GameState,
  attackerArmyId: ArmyId,
  defenderArmyId: ArmyId,
  regionId: RegionId,
): GameState {
  return produce(state, (draft) => {
    const world = draft.world;
    const region = world.regions.get(regionId);
    const attacker = world.armies.get(attackerArmyId);
    const defender = world.armies.get(defenderArmyId);
    if (!region || !attacker || !defender) {
      return;
    }

    const attackerNation = world.nations.get(attacker.nationId);
    const defenderNation = world.nations.get(defender.nationId);
    if (!attackerNation || !defenderNation) {
      return;
    }

    const supplyFactor = computeSupplyFactor(world, attacker);
    const { divineA, divineD } = computeDivineModifiers(
      region,
      attacker.nationId,
      defender.nationId,
      world,
      draft.playerReligionId,
    );
    const { faithA, faithD } = computeFaithModifiers(
      draft,
      region,
      defenderNation,
      attackerNation,
    );
    const { techA, techD } = techModifiers(
      attackerNation,
      defenderNation,
    );

    const terrainAtk =
      BATTLE.TERRAIN_ATTACK_MODS[region.terrain] ?? 1.0;
    const terrainDef =
      BATTLE.TERRAIN_DEFEND_MODS[region.terrain] ?? 1.0;
    const cmdAtk = commanderAttackMod(attacker);
    const cmdDef = commanderDefendMod(defender);
    const fortMod =
      1.0 + region.cityLevel * BATTLE.FORT_BONUS_PER_LEVEL;

    const moraleTermA =
      BATTLE.MORALE_WEIGHT +
      (1 - BATTLE.MORALE_WEIGHT) * attacker.morale;
    const moraleTermD =
      BATTLE.MORALE_WEIGHT +
      (1 - BATTLE.MORALE_WEIGHT) * defender.morale;

    const effA =
      attacker.strength *
      moraleTermA *
      terrainAtk *
      cmdAtk *
      supplyFactor *
      divineA *
      techA *
      faithA;
    const effD =
      defender.strength *
      moraleTermD *
      terrainDef *
      cmdDef *
      fortMod *
      divineD *
      techD *
      faithD;

    if (effD < 1.0) {
      // Auto-win for attacker: defender destroyed, retreats if possible.
      const casualtiesD = defender.strength;
      defender.strength = 0;
      removeArmy(world, defender.id);
      attacker.morale = clamp(
        attacker.morale + BATTLE.WINNER_MORALE_CHANGE,
        0,
        1,
      );
      if (region.nationId === defenderNation.id) {
        applyConquest(world, regionId, attacker.nationId);
      }
      draft.prngState = (draft.prngState ?? 0) + 1;
      return;
    }

    const seed = world.seed;
    const tick = world.currentTick;
    let callIndex = draft.prngState ?? 0;
    const rng = () => {
      const v = seededRandom(seed, tick, callIndex);
      callIndex += 1;
      return v;
    };

    const ratio = effA / effD;
    const varianceRaw =
      rng() * 2 * BATTLE.VARIANCE_RANGE - BATTLE.VARIANCE_RANGE;
    const adjRatio = ratio * (1 + varianceRaw);

    const lossRateA =
      BATTLE.BASE_CASUALTY_RATE *
      clamp(
        1 / adjRatio,
        BATTLE.CASUALTY_CLAMP_MIN,
        BATTLE.CASUALTY_CLAMP_MAX,
      );
    const lossRateD =
      BATTLE.BASE_CASUALTY_RATE *
      clamp(
        adjRatio,
        BATTLE.CASUALTY_CLAMP_MIN,
        BATTLE.CASUALTY_CLAMP_MAX,
      );

    const casualtiesA = Math.max(
      1,
      Math.floor(attacker.strength * lossRateA),
    );
    const casualtiesD = Math.max(
      1,
      Math.floor(defender.strength * lossRateD),
    );

    const winner =
      adjRatio >= 1.0 ? 'attacker' : 'defender';
    const loser = winner === 'attacker' ? 'defender' : 'attacker';

    attacker.strength = Math.max(
      0,
      attacker.strength - casualtiesA,
    );
    defender.strength = Math.max(
      0,
      defender.strength - casualtiesD,
    );

    if (winner === 'attacker') {
      attacker.morale = clamp(
        attacker.morale + BATTLE.WINNER_MORALE_CHANGE,
        0,
        1,
      );
      defender.morale = clamp(
        defender.morale + BATTLE.LOSER_MORALE_CHANGE,
        0,
        1,
      );
    } else {
      defender.morale = clamp(
        defender.morale + BATTLE.WINNER_MORALE_CHANGE,
        0,
        1,
      );
      attacker.morale = clamp(
        attacker.morale + BATTLE.LOSER_MORALE_CHANGE,
        0,
        1,
      );
    }

    const attackerRemaining = attacker.strength;
    const defenderRemaining = defender.strength;
    const attackerOriginal =
      attacker.strength + casualtiesA;
    const defenderOriginal =
      defender.strength + casualtiesD;

    const loserRemaining =
      loser === 'attacker'
        ? attackerRemaining
        : defenderRemaining;
    const loserOriginal =
      loser === 'attacker'
        ? attackerOriginal
        : defenderOriginal;
    const loserMorale =
      loser === 'attacker'
        ? attacker.morale
        : defender.morale;

    const strengthRetreat =
      loserRemaining <
      BATTLE.RETREAT_STRENGTH_THRESHOLD * loserOriginal;
    const moraleRetreat =
      loserMorale < BATTLE.RETREAT_MORALE_THRESHOLD;
    const shouldRetreat = strengthRetreat || moraleRetreat;

    if (shouldRetreat) {
      const loserArmy = loser === 'attacker' ? attacker : defender;
      const target = findRetreatTarget(
        world,
        regionId,
        loserArmy.nationId,
      );
      if (target) {
        loserArmy.currentRegionId = target;
        loserArmy.state = 'retreating';
        loserArmy.path = [];
      } else {
        // No retreat possible: army destroyed.
        removeArmy(world, loserArmy.id);
      }
    }

    if (attackerRemaining < NATIONS.ARMY_STRENGTH_MIN) {
      removeArmy(world, attacker.id);
    }
    if (defenderRemaining < NATIONS.ARMY_STRENGTH_MIN) {
      removeArmy(world, defender.id);
    }

    if (
      winner === 'attacker' &&
      region.nationId === defenderNation.id
    ) {
      applyConquest(world, regionId, attacker.nationId);
    }

    draft.prngState = callIndex;

    const battles: BattleResult[] = [];
    const result: BattleResult = {
      attackerArmyId,
      defenderArmyId,
      regionId,
      attackerLosses: casualtiesA,
      defenderLosses: casualtiesD,
      winner,
      divineIntervention: false,
      attackerMoraleChange:
        winner === 'attacker'
          ? BATTLE.WINNER_MORALE_CHANGE
          : BATTLE.LOSER_MORALE_CHANGE,
      defenderMoraleChange:
        winner === 'defender'
          ? BATTLE.WINNER_MORALE_CHANGE
          : BATTLE.LOSER_MORALE_CHANGE,
      retreated: shouldRetreat,
    };
    battles.push(result);
    // The SimulationTick.battlesResolved list is assembled in the runner;
    // we expose BattleResult for future integration but do not store it here.
    void battles;
  });
}

function advanceArmyAlongPath(
  army: Army,
  world: WorldState,
  deltaYears: number,
): void {
  if (!army.path || army.path.length === 0) return;

  if (army.movementTicksRemaining == null || army.movementTicksRemaining <= 0) {
    const nextId = army.path[0];
    const nextRegion = world.regions.get(nextId);
    if (!nextRegion || nextRegion.terrain === 'ocean') {
      army.path = [];
      army.state = 'garrisoned';
      army.movementTicksRemaining = undefined;
      return;
    }
    const ticksToCross = movementTicksForTerrain(
      nextRegion.terrain,
      world.currentEra,
    );
    army.movementTicksRemaining = ticksToCross;
  }

  const ticksThisStep =
    deltaYears > 0 ? deltaYears / TIME.TICK_GAME_YEARS : 1;
  army.movementTicksRemaining -= ticksThisStep;

  if (army.movementTicksRemaining != null && army.movementTicksRemaining <= 0) {
    const nextId = army.path![0];
    const nextRegion = world.regions.get(nextId);
    if (!nextRegion || nextRegion.terrain === 'ocean') {
      army.path = [];
      army.state = 'garrisoned';
      army.movementTicksRemaining = undefined;
      return;
    }
    army.currentRegionId = nextId;
    army.path = army.path!.slice(1);
    army.movementTicksRemaining = undefined;
    if (!army.path || army.path.length === 0) {
      army.state = 'garrisoned';
    }
  }
}

export function tickArmies(
  state: GameState,
  deltaYears: number,
): GameState {
  const moved = produce(state, (draft) => {
    const world = getWorld(draft);
    const armyIds = Array.from(world.armies.keys()).sort();

    for (let i = 0; i < armyIds.length; i++) {
      const id = armyIds[i];
      const army = world.armies.get(id);
      if (!army) continue;
      if (
        army.state === 'marching' ||
        army.state === 'retreating'
      ) {
        advanceArmyAlongPath(army, world, deltaYears);
      }
      const supplyFactor = computeSupplyFactor(world, army);
      applySupplyAttrition(army, supplyFactor);
      army.strength = clamp(
        army.strength,
        NATIONS.ARMY_STRENGTH_MIN,
        NATIONS.ARMY_STRENGTH_MAX,
      );
      army.morale = clamp(army.morale, 0, 1);

      const region = world.regions.get(army.currentRegionId);
      const nation = world.nations.get(army.nationId);
      if (
        region &&
        nation &&
        region.nationId !== army.nationId &&
        region.cityLevel > 0 &&
        !hasDefenderInRegion(
          world,
          army.currentRegionId,
          region.nationId,
        )
      ) {
        if (army.siegeTicksRemaining == null) {
          army.siegeTicksRemaining = computeSiegeTicksToCapture(
            region,
            army.strength,
            nation.development,
            world.seed,
            world.currentTick,
            i,
          );
        }
        const attrition = siegeAttritionPerTick(region, army.strength);
        army.strength = Math.max(0, army.strength - attrition);
        if (army.strength < NATIONS.ARMY_STRENGTH_MIN) {
          const target = findRetreatTarget(
            world,
            army.currentRegionId,
            army.nationId,
          );
          if (target) {
            army.currentRegionId = target;
            army.state = 'retreating';
            army.path = [];
          } else {
            removeArmy(world, army.id);
          }
          army.siegeTicksRemaining = undefined;
        } else {
          army.siegeTicksRemaining = (army.siegeTicksRemaining ?? 1) - 1;
          if (army.siegeTicksRemaining <= 0) {
            applyConquest(world, army.currentRegionId, army.nationId);
            army.siegeTicksRemaining = undefined;
          }
        }
      } else {
        army.siegeTicksRemaining = undefined;
      }
    }
  });

  const world = moved.world;
  const armyIds = Array.from(world.armies.keys()).sort();
  const armiesByRegion = new Map<RegionId, ArmyId[]>();

  for (const id of armyIds) {
    const army = world.armies.get(id);
    if (!army) continue;
    if (!armiesByRegion.has(army.currentRegionId)) {
      armiesByRegion.set(army.currentRegionId, []);
    }
    armiesByRegion.get(army.currentRegionId)!.push(id);
  }

  let nextState = moved;

  for (const [regionId, ids] of armiesByRegion) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const aId = ids[i];
        const dId = ids[j];
        const a = nextState.world.armies.get(aId);
        const d = nextState.world.armies.get(dId);
        if (!a || !d) continue;
        if (
          !areNationsAtWar(
            nextState.world,
            a.nationId,
            d.nationId,
          )
        ) {
          continue;
        }
        nextState = resolveBattle(
          nextState,
          aId,
          dId,
          regionId,
        );
      }
    }
  }

  return nextState;
}

export function mergeArmies(
  state: GameState,
  armyIdA: ArmyId,
  armyIdB: ArmyId,
): GameState {
  return produce(state, (draft) => {
    const world = draft.world;
    const a = world.armies.get(armyIdA);
    const b = world.armies.get(armyIdB);
    if (!a || !b) return;
    if (a.nationId !== b.nationId) return;
    if (a.currentRegionId !== b.currentRegionId) return;

    const totalStrength = a.strength + b.strength;
    const totalMoraleWeighted =
      a.morale * a.strength + b.morale * b.strength;
    a.strength = clamp(
      totalStrength,
      NATIONS.ARMY_STRENGTH_MIN,
      NATIONS.ARMY_STRENGTH_MAX,
    );
    a.morale =
      totalStrength > 0
        ? clamp(totalMoraleWeighted / totalStrength, 0, 1)
        : a.morale;

    const rank = (trait: string | null) =>
      COMMANDER_MERGE_RANK[
        (trait as keyof typeof COMMANDER_MERGE_RANK) ?? 'null'
      ] ?? 0;
    const aTrait = a.commander?.trait ?? (null as any);
    const bTrait = b.commander?.trait ?? (null as any);
    if (rank(bTrait) > rank(aTrait)) {
      a.commander = b.commander;
    }

    world.armies.delete(armyIdB);
  });
}

export function splitArmy(
  state: GameState,
  armyId: ArmyId,
  splitRatio: number,
): GameState {
  return produce(state, (draft) => {
    const world = draft.world;
    const army = world.armies.get(armyId);
    if (!army) return;
    if (splitRatio <= 0 || splitRatio >= 1) return;

    const keepStrength = Math.floor(
      army.strength * splitRatio,
    );
    const splitStrength = army.strength - keepStrength;
    if (
      keepStrength < NATIONS.ARMY_STRENGTH_MIN ||
      splitStrength < NATIONS.ARMY_STRENGTH_MIN
    ) {
      return;
    }

    const newId = `army_${world.armies.size}_${world.currentTick}` as ArmyId;
    const newArmy: Army = {
      id: newId,
      nationId: army.nationId,
      strength: splitStrength,
      morale: army.morale,
      currentRegionId: army.currentRegionId,
      targetRegionId: army.targetRegionId,
      path: army.path ? [...army.path] : [],
      state: army.state,
      commander: null,
      supplyRange: army.supplyRange,
      movementTicksRemaining: army.movementTicksRemaining,
    };

    if (splitRatio < 0.5) {
      newArmy.commander = army.commander;
      army.commander = null;
    } else {
      newArmy.commander = null;
    }

    army.strength = keepStrength;
    world.armies.set(newId, newArmy);
  });
}

