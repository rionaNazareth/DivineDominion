import { Delaunay } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

import {
  WORLD_GEN,
  TERRAIN_GEN,
  NATIONS,
  HAPPINESS,
  TIME,
  RELIGION as RELIGION_CONST,
  DISEASE as DISEASE_CONST,
  TRADE,
  HARBINGER,
  ERAS,
  WIN_CONDITIONS,
} from '../config/constants.js';
import {
  Army,
  ArmyState,
  CommanderTrait,
  DiplomaticRelation,
  GameState,
  Nation,
  NationAIPersonality,
  Region,
  Religion,
  ReligionId,
  ReligionInfluence,
  ReligionPersonality,
  TerrainType,
  TradeRoute,
  WorldState,
  HarbingerState,
  ScienceProgress,
  AlienState,
  EraId,
  RegionId,
  NationId,
  ArmyId,
  TradeRouteId,
  Disease,
} from '../types/game.js';
import { mulberry32 } from './prng.js';

interface Point {
  x: number;
  y: number;
  regionId: RegionId;
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function choice<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function createPoissonPoints(rng: () => number, targetCount: number): Point[] {
  const points: Point[] = [];
  const minDist = WORLD_GEN.POISSON_MIN_DISTANCE;
  const width = WORLD_GEN.CANVAS_WIDTH;
  const height = WORLD_GEN.CANVAS_HEIGHT;

  let attempts = 0;
  const maxAttempts = targetCount * 50;

  while (points.length < targetCount && attempts < maxAttempts) {
    attempts += 1;
    const x = rng() * width;
    const y = rng() * height;

    let ok = true;
    for (const p of points) {
      const dx = p.x - x;
      const dy = p.y - y;
      if (Math.hypot(dx, dy) < minDist) {
        ok = false;
        break;
      }
    }

    if (ok) {
      points.push({
        x,
        y,
        regionId: `region_${points.length}` as RegionId,
      });
    }
  }

  // If we undershoot, just fill with random points (still reasonably spaced).
  while (points.length < targetCount) {
    const x = rng() * width;
    const y = rng() * height;
    points.push({
      x,
      y,
      regionId: `region_${points.length}` as RegionId,
    });
  }

  return points;
}

function buildTerrain(
  points: Point[],
  rngSeed: number,
): {
  regionsById: Map<RegionId, Region>;
  adjacencyById: Map<RegionId, RegionId[]>;
} {
  const width = WORLD_GEN.CANVAS_WIDTH;
  const height = WORLD_GEN.CANVAS_HEIGHT;

  const delaunay = Delaunay.from(
    points,
    (p: Point) => p.x,
    (p: Point) => p.y,
  );
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  const noiseRng1 = mulberry32((rngSeed ^ 0x9e3779b9) >>> 0);
  const noiseRng2 = mulberry32((rngSeed + 0x85ebca6b) >>> 0);
  const elevationNoise = createNoise2D(noiseRng1);
  const moistureNoise = createNoise2D(noiseRng2);

  const regionsById = new Map<RegionId, Region>();
  const adjacencyById = new Map<RegionId, RegionId[]>();

  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.hypot(centerX, centerY);

  const elevationScale = TERRAIN_GEN.NOISE_SCALE;

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    const polygon = voronoi.cellPolygon(i) as [number, number][];

    const vertices = polygon.map(([x, y]) => ({ x, y }));

    const centroidX =
      polygon.reduce((sum, [x]) => sum + x, 0) / polygon.length;
    const centroidY =
      polygon.reduce((sum, [, y]) => sum + y, 0) / polygon.length;

    const dx = centroidX - centerX;
    const dy = centroidY - centerY;
    const distanceRatio = Math.min(Math.hypot(dx, dy) / maxDist, 1);

    // Base elevation/moisture in [0, 1]
    const eRaw = elevationNoise(
      centroidX * elevationScale,
      centroidY * elevationScale,
    );
    const mRaw = moistureNoise(
      (centroidX + 1000) * elevationScale,
      (centroidY - 1000) * elevationScale,
    );
    const elevation = (eRaw + 1) / 2;
    const moisture = (mRaw + 1) / 2;

    // Water mask with distance bias (matches design doc spirit).
    const adjusted = elevation - 0.3 * distanceRatio;
    const isOcean = adjusted < WORLD_GEN.WATER_RATIO;

    let terrain: TerrainType;
    if (isOcean) {
      terrain = 'ocean';
    } else if (elevation > TERRAIN_GEN.ELEVATION_MOUNTAIN) {
      terrain = 'mountain';
    } else if (
      elevation > TERRAIN_GEN.ELEVATION_TUNDRA &&
      moisture < TERRAIN_GEN.MOISTURE_TUNDRA
    ) {
      terrain = 'tundra';
    } else if (elevation > TERRAIN_GEN.ELEVATION_HILLS) {
      terrain = 'hills';
    } else if (moisture < TERRAIN_GEN.MOISTURE_DESERT) {
      terrain = 'desert';
    } else if (moisture > TERRAIN_GEN.MOISTURE_FOREST) {
      terrain = 'forest';
    } else {
      terrain = 'plains';
    }

    const neighbors: RegionId[] = [];
    for (const neighborIndex of delaunay.neighbors(i)) {
      const neighborPoint = points[neighborIndex];
      neighbors.push(neighborPoint.regionId);
    }

    adjacencyById.set(point.regionId, neighbors);

    const region: Region = {
      id: point.regionId,
      nationId: '' as NationId, // filled later
      position: { x: centroidX, y: centroidY },
      vertices,
      terrain,
      population: 0,
      development: 0,
      happiness: HAPPINESS.BASE,
      economicOutput: 0,
      faithStrength: 0.5,
      religiousInfluence: [],
      dominantReligion: '' as ReligionId,
      hasCity: false,
      cityLevel: 0,
      adjacentRegionIds: neighbors,
      activeEffects: [],
      isQuarantined: false,
      isCapital: false,
    };

    regionsById.set(point.regionId, region);
  }

  // Coast detection: any land region adjacent to ocean becomes coast.
  for (const region of regionsById.values()) {
    if (region.terrain === 'ocean') continue;
    const neighbors = adjacencyById.get(region.id) ?? [];
    const hasOceanNeighbor = neighbors.some(
      (nId) => regionsById.get(nId)?.terrain === 'ocean',
    );
    if (hasOceanNeighbor && region.terrain === 'plains') {
      region.terrain = 'coast';
    }
  }

  return { regionsById, adjacencyById };
}

function createReligions(
  rng: () => number,
  nationIds: NationId[],
  playerNationId: NationId,
): Map<ReligionId, Religion> {
  const religions = new Map<ReligionId, Religion>();

  const playerReligionId = 'religion_player' as ReligionId;
  religions.set(playerReligionId, {
    id: playerReligionId,
    name: 'Player Faith',
    color: '#c9a84c',
    symbol: '★',
    commandments: [],
    isPlayerReligion: true,
    personality: 'balanced' as ReligionPersonality,
    hiddenRules: [],
  });

  const nonPlayerNationCount = nationIds.filter((id) => id !== playerNationId).length;
  const rolledRivals = randomInt(
    rng,
    WORLD_GEN.RIVAL_RELIGIONS_MIN,
    WORLD_GEN.RIVAL_RELIGIONS_MAX,
  );
  const rivalCount = Math.min(rolledRivals, nonPlayerNationCount || rolledRivals);

  for (let i = 0; i < rivalCount; i += 1) {
    const id = `religion_rival_${i}` as ReligionId;
    religions.set(id, {
      id,
      name: `Rival Religion ${i + 1}`,
      color: `hsl(${Math.floor((360 * i) / Math.max(1, rivalCount))}, 60%, 55%)`,
      symbol: '✦',
      commandments: [],
      isPlayerReligion: false,
      personality: 'balanced' as ReligionPersonality,
      hiddenRules: [],
    });
  }

  return religions;
}

function distributeReligionsToNations(
  rng: () => number,
  nations: Nation[],
  religions: Map<ReligionId, Religion>,
  playerNationId: NationId,
): void {
  const playerReligionId = 'religion_player' as ReligionId;
  const rivalReligionIds = Array.from(religions.keys()).filter(
    (id) => id !== playerReligionId,
  );

  const nonPlayerNations = nations.filter((n) => n.id !== playerNationId);

  // Assign 1 rival religion per non-player nation (cycling if needed).
  for (let i = 0; i < nonPlayerNations.length; i += 1) {
    const nation = nonPlayerNations[i];
    if (rivalReligionIds.length === 0) {
      nation.dominantReligionId = playerReligionId;
      continue;
    }
    const rid = rivalReligionIds[i % rivalReligionIds.length];
    nation.dominantReligionId = rid;
  }

  // Player nation gets player religion.
  const playerNation = nations.find((n) => n.id === playerNationId);
  if (playerNation) {
    playerNation.dominantReligionId = playerReligionId;
  }
}

function assignPopulationAndDevelopment(
  rng: () => number,
  regionsById: Map<RegionId, Region>,
  nations: Nation[],
): void {
  const popMin = NATIONS.STARTING_POPULATION_MIN;
  const popMax = NATIONS.STARTING_POPULATION_MAX;
  const devMin = WORLD_GEN.STARTING_DEV_MIN;
  const devMax = WORLD_GEN.STARTING_DEV_MAX;

  const popBias = TERRAIN_GEN.POP_BIAS as Record<string, number>;
  const devBias = TERRAIN_GEN.DEV_BIAS as Record<string, number>;

  const capitalRegionIds = new Set<string>();
  for (const nation of nations) {
    if (nation.regionIds.length > 0) {
      capitalRegionIds.add(nation.regionIds[0]);
    }
  }

  for (const region of regionsById.values()) {
    if (region.terrain === 'ocean') {
      region.population = 0;
      region.development = 0;
      continue;
    }

    const terrainKey = region.terrain;
    const pBias = popBias[terrainKey] ?? 1;
    const dBias = devBias[terrainKey] ?? 1;

    const basePopRange = popMax - popMin;
    let population =
      Math.floor(rng() * basePopRange * pBias) + popMin;
    if (population < NATIONS.POPULATION_MIN_PER_REGION) {
      population = NATIONS.POPULATION_MIN_PER_REGION;
    }

    const baseDevRange = devMax - devMin + 1;
    let development =
      Math.floor(rng() * baseDevRange * dBias) + devMin;
    if (development < 1) development = 1;
    if (development > 3) development = 3;

    if (capitalRegionIds.has(region.id)) {
      population = Math.floor(population * 1.5);
      development = Math.min(development + 1, 4);
      region.hasCity = true;
      region.cityLevel = 2 + randomInt(rng, 0, 1);
      region.isCapital = true;
    }

    region.population = population;
    region.development = development;
  }

  // Extra city per large nation (non-capital, highest population).
  for (const nation of nations) {
    if (nation.regionIds.length <= 4) continue;
    let bestRegion: Region | undefined;
    for (const regionId of nation.regionIds) {
      const region = regionsById.get(regionId);
      if (!region || region.isCapital) continue;
      if (!bestRegion || region.population > bestRegion.population) {
        bestRegion = region;
      }
    }
    if (bestRegion && !bestRegion.hasCity) {
      bestRegion.hasCity = true;
      bestRegion.cityLevel = 1;
    }
  }
}

function buildNations(
  rng: () => number,
  regionsById: Map<RegionId, Region>,
  adjacencyById: Map<RegionId, RegionId[]>,
  nationCount: number,
): Nation[] {
  const landRegions = Array.from(regionsById.values()).filter(
    (r) => r.terrain !== 'ocean',
  );

  const candidateCapitals = landRegions.filter(
    (r) => r.terrain === 'plains' || r.terrain === 'coast',
  );
  const capitalChoices = candidateCapitals.length > 0 ? candidateCapitals : landRegions;

  const usedCapitals = new Set<RegionId>();
  const capitalRegionIds: RegionId[] = [];

  const personalities: NationAIPersonality[] = [
    'aggressive',
    'defensive',
    'expansionist',
    'isolationist',
    'balanced',
  ];

  const pickInitialCapital = () => {
    const region = choice(rng, capitalChoices);
    usedCapitals.add(region.id);
    capitalRegionIds.push(region.id);
  };

  const computeDistancesFromCapitals = (): Map<RegionId, number> => {
    const dist = new Map<RegionId, number>();
    const queue: RegionId[] = [];
    for (const capId of capitalRegionIds) {
      dist.set(capId, 0);
      queue.push(capId);
    }
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = dist.get(current)!;
      const neighbors = adjacencyById.get(current) ?? [];
      for (const nId of neighbors) {
        const nRegion = regionsById.get(nId);
        if (!nRegion || nRegion.terrain === 'ocean') continue;
        if (!dist.has(nId)) {
          dist.set(nId, currentDist + 1);
          queue.push(nId);
        }
      }
    }
    return dist;
  };

  if (nationCount <= 0 || landRegions.length === 0) {
    return [];
  }

  pickInitialCapital();

  while (capitalRegionIds.length < nationCount) {
    const distances = computeDistancesFromCapitals();
    let bestRegion: Region | undefined;
    let bestDistance = -1;
    for (const region of capitalChoices) {
      if (usedCapitals.has(region.id)) continue;
      const d = distances.get(region.id) ?? 0;
      if (d >= WORLD_GEN.CAPITAL_MIN_DISTANCE && d > bestDistance) {
        bestDistance = d;
        bestRegion = region;
      }
    }
    if (!bestRegion) {
      // Fallback: pick any unused land region farthest from existing capitals.
      for (const region of landRegions) {
        if (usedCapitals.has(region.id)) continue;
        const d = distances.get(region.id) ?? 0;
        if (d > bestDistance) {
          bestDistance = d;
          bestRegion = region;
        }
      }
    }
    if (!bestRegion) break;
    usedCapitals.add(bestRegion.id);
    capitalRegionIds.push(bestRegion.id);
  }

  const nations: Nation[] = [];
  const nationByRegion = new Map<RegionId, NationId>();

  for (let i = 0; i < capitalRegionIds.length; i += 1) {
    const id = `nation_${i}` as NationId;
    nationByRegion.set(capitalRegionIds[i], id);
    const nation: Nation = {
      id,
      name: `Nation ${i + 1}`,
      color: `hsl(${Math.floor((360 * i) / Math.max(1, capitalRegionIds.length))}, 50%, 55%)`,
      regionIds: [capitalRegionIds[i]],
      government: 'monarchy',
      development: 0,
      militaryStrength: 0,
      economicOutput: 0,
      relations: new Map<NationId, DiplomaticRelation>(),
      dominantReligionId: '' as ReligionId,
      isPlayerNation: false,
      aiPersonality: choice(rng, personalities),
      aiWeights: { war: 1, peace: 1, science: 1, faith: 1 },
      stability: 0.7,
      warWeariness: 0,
    };
    nations.push(nation);
  }

  // Simple round-robin assignment of remaining land regions to nations.
  const remainingRegions = landRegions
    .map((r) => r.id)
    .filter((id) => !capitalRegionIds.includes(id));
  for (let i = 0; i < remainingRegions.length; i += 1) {
    const regionId = remainingRegions[i];
    const nationIndex = i % nations.length;
    const nation = nations[nationIndex];
    nation.regionIds.push(regionId);
    nationByRegion.set(regionId, nation.id);
  }

  // Back-fill region.nationId.
  for (const [regionId, nationId] of nationByRegion.entries()) {
    const region = regionsById.get(regionId);
    if (region) {
      region.nationId = nationId;
    }
  }

  return nations;
}

function createArmies(
  rng: () => number,
  nations: Nation[],
  regionsById: Map<RegionId, Region>,
): Map<ArmyId, Army> {
  const armies = new Map<ArmyId, Army>();

  for (let i = 0; i < nations.length; i += 1) {
    const nation = nations[i];
    if (nation.regionIds.length === 0) continue;
    const capitalRegionId = nation.regionIds[0];
    const strength = randomInt(
      rng,
      WORLD_GEN.STARTING_ARMY_STRENGTH_MIN,
      WORLD_GEN.STARTING_ARMY_STRENGTH_MAX,
    );

    const commanderChance = rng();
    const commander =
      commanderChance < 0.5
        ? {
            name: `Commander ${i + 1}`,
            trait: choice(rng, [
              'aggressive',
              'cautious',
              'brilliant',
              'reckless',
            ]) as CommanderTrait,
          }
        : null;

    const armyId = `army_${i}` as ArmyId;
    const army: Army = {
      id: armyId,
      nationId: nation.id,
      strength,
      morale: 0.8,
      currentRegionId: capitalRegionId,
      targetRegionId: undefined,
      path: undefined,
      state: 'garrisoned' as ArmyState,
      commander,
      supplyRange: NATIONS.SUPPLY_RANGE_BASE,
    };

    armies.set(armyId, army);
  }

  return armies;
}

function initDiplomacy(nations: Nation[]): void {
  for (const nation of nations) {
    for (const other of nations) {
      if (nation.id === other.id) continue;
      const relation: DiplomaticRelation = {
        nationId: other.id,
        opinion: 0,
        atWar: false,
        tradeAgreement: false,
        alliance: false,
        peaceTicks: 0,
      };
      nation.relations.set(other.id, relation);
    }
  }
}

function assignReligiousInfluence(
  rng: () => number,
  regionsById: Map<RegionId, Region>,
  nations: Nation[],
  religions: Map<ReligionId, Religion>,
  playerNationId: NationId,
): void {
  const playerReligionId = 'religion_player' as ReligionId;

  // First, assign nation-dominant religion to all *non-player* nations.
  for (const nation of nations) {
    if (nation.id === playerNationId) continue;
    const domReligion = nation.dominantReligionId || playerReligionId;
    for (const regionId of nation.regionIds) {
      const region = regionsById.get(regionId);
      if (!region) continue;
      const influence: ReligionInfluence[] = [
        { religionId: domReligion, strength: 0.6 },
      ];
      region.religiousInfluence = influence;
      region.dominantReligion = domReligion;
      region.faithStrength = 0.6;
    }
  }

  // Player starting regions: capital + 1–2 adjacent regions at higher influence.
  const playerNation = nations.find((n) => n.id === playerNationId);
  if (!playerNation || playerNation.regionIds.length === 0) return;

  const playerCapitalId = playerNation.regionIds[0];
  const playerCapital = regionsById.get(playerCapitalId);
  if (!playerCapital) return;

  const playerRegions: Region[] = [playerCapital];
  const candidateIds = playerNation.regionIds.filter(
    (id) => id !== playerCapitalId,
  );

  // We want a total of 2–3 starting regions for the player religion.
  const maxExtra = Math.min(
    WORLD_GEN.PLAYER_STARTING_REGIONS_MAX - 1,
    candidateIds.length,
  );
  const minExtra = Math.min(
    WORLD_GEN.PLAYER_STARTING_REGIONS_MIN - 1,
    maxExtra,
  );

  if (maxExtra > 0) {
    const extraCount =
      maxExtra === minExtra
        ? maxExtra
        : randomInt(rng, minExtra, maxExtra);

    const mutableCandidates = [...candidateIds];
    for (let i = 0; i < extraCount && mutableCandidates.length > 0; i += 1) {
      const idx = Math.floor(rng() * mutableCandidates.length);
      const [pickedId] = mutableCandidates.splice(idx, 1);
      const picked = pickedId ? regionsById.get(pickedId) : undefined;
      if (picked) playerRegions.push(picked);
    }
  }

  const playerRegionIds = new Set(playerRegions.map((r) => r.id));
  const rivalIds = Array.from(religions.keys()).filter(
    (id) => id !== playerReligionId,
  );
  const fallbackReligionId = (rivalIds[0] ?? playerReligionId) as ReligionId;

  // Assign player religion to selected regions, rival (or fallback) to the rest
  // of the player nation. This keeps the count of dominant player regions in [2, 3].
  for (const regionId of playerNation.regionIds) {
    const region = regionsById.get(regionId);
    if (!region) continue;
    if (playerRegionIds.has(region.id)) {
      region.religiousInfluence = [
        { religionId: playerReligionId, strength: 0.7 },
      ];
      region.dominantReligion = playerReligionId;
      region.faithStrength = 0.7;
    } else {
      region.religiousInfluence = [
        { religionId: fallbackReligionId, strength: 0.6 },
      ];
      region.dominantReligion = fallbackReligionId;
      region.faithStrength = 0.6;
    }
  }
}

function computeNationDerivedStats(
  regionsById: Map<RegionId, Region>,
  nations: Nation[],
  armies: Map<ArmyId, Army>,
): void {
  for (const nation of nations) {
    let totalPop = 0;
    let weightedDev = 0;
    let totalEconomicOutput = 0;

    for (const regionId of nation.regionIds) {
      const region = regionsById.get(regionId);
      if (!region) continue;
      totalPop += region.population;
      weightedDev += region.population * region.development;
      totalEconomicOutput += region.economicOutput;
    }

    nation.development =
      totalPop > 0 ? weightedDev / totalPop : 0;
    nation.economicOutput = totalEconomicOutput;

    let totalStrength = 0;
    for (const army of armies.values()) {
      if (army.nationId === nation.id) {
        totalStrength += army.strength;
      }
    }
    nation.militaryStrength = totalStrength;
  }
}

function createScienceProgress(): ScienceProgress {
  return {
    currentLevel: 0,
    milestonesReached: [],
    globalResearchOutput: 0,
  };
}

function createHarbingerState(): HarbingerState {
  return {
    budgetRemaining: 0,
    lastActionTick: 0,
    corruptedRegionIds: [],
    veiledRegionIds: [],
    immuneRegionIds: [],
    playerStrategyAssessment: 'balanced',
    actionsLog: [],
  };
}

function createAlienState(): AlienState {
  return {
    arrivalYear: WIN_CONDITIONS.ALIEN_ARRIVAL_YEAR,
    signalDetectedYear: 0,
    confirmedYear: 0,
    revealedToPlayer: false,
    fleetStrength: 0,
    defenseGridStrength: 0,
    harbinger: createHarbingerState(),
  };
}

export function generateWorld(seed: number): WorldState {
  const rng = mulberry32(seed >>> 0);

  const regionCount = randomInt(
    rng,
    WORLD_GEN.REGIONS_MIN,
    WORLD_GEN.REGIONS_MAX,
  );
  const nationCount = randomInt(
    rng,
    WORLD_GEN.NATIONS_MIN,
    WORLD_GEN.NATIONS_MAX,
  );

  const points = createPoissonPoints(rng, regionCount);

  const { regionsById, adjacencyById } = buildTerrain(points, seed >>> 0);

  const nations = buildNations(rng, regionsById, adjacencyById, nationCount);

  if (nations.length === 0) {
    throw new Error('World generation failed: no nations created');
  }

  const playerNationId = nations[0].id;
  nations[0].isPlayerNation = true;

  assignPopulationAndDevelopment(rng, regionsById, nations);

  initDiplomacy(nations);

  const armies = createArmies(rng, nations, regionsById);

  const religions = createReligions(
    rng,
    nations.map((n) => n.id),
    playerNationId,
  );

  distributeReligionsToNations(rng, nations, religions, playerNationId);
  assignReligiousInfluence(rng, regionsById, nations, religions, playerNationId);

  computeNationDerivedStats(regionsById, nations, armies);

  const tradeRoutes = new Map<TradeRouteId, TradeRoute>();
  const diseases: Disease[] = [];

  const scienceProgress = createScienceProgress();
  const alienState = createAlienState();

  const world: WorldState = {
    seed,
    currentYear: TIME.GAME_START_YEAR,
    currentTick: 0,
    regions: regionsById,
    nations: new Map<NationId, Nation>(
      nations.map((n) => [n.id, n]),
    ),
    religions,
    armies,
    tradeRoutes,
    diseases,
    scienceProgress,
    alienState,
    currentEra: ERAS[0].id as EraId,
  };

  return world;
}

// Convenience helper for building an initial GameState in prototypes/tests.
export function createInitialGameState(seed: number): GameState {
  const world = generateWorld(seed);
  const playerReligionId = 'religion_player' as ReligionId;

  const gameState: GameState = {
    phase: 'playing',
    world,
    divineState: {
      energy: 0,
      maxEnergy: 0,
      regenPerMinute: 0,
      cooldowns: new Map(),
      totalInterventions: 0,
      blessingsUsed: 0,
      disastersUsed: 0,
      hypocrisyEvents: 0,
      lastDisasterYear: 0,
      lastMiracleYear: 0,
    },
    whisperState: {
      lastWhisperTime: 0,
      lastWhisperRegionId: null,
      lastWhisperType: null,
      regionCooldowns: new Map(),
      compoundStacksByNation: new Map(),
    },
    comboWindowState: {
      lastShieldCastByRegion: new Map(),
      lastMiracleCastByRegion: new Map(),
    },
    playerReligionId,
    selectedCommandments: [],
    eventHistory: [],
    currentEvent: undefined,
    eraNarratives: new Map<EraId, string>(),
    pivotalMoments: [],
    speedMultiplier: 1,
    realTimeElapsed: 0,
    divineOverlayActive: false,
    voiceRecords: [],
    hypocrisyLevel: 0,
    prngState: seed >>> 0,
  };

  return gameState;
}

