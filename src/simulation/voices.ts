import './immer-config.js';
import { produce } from 'immer';
import type {
  GameState,
  FollowerVoice,
  VoiceType,
  VoiceId,
  RegionId,
  EraId,
  Petition,
} from '../types/game.js';
import {
  VOICES,
  PETITIONS,
  WHISPERS,
} from '../config/constants.js';
import { seededRandom } from './prng.js';

const ERA_INDEX: Record<string, number> = {
  renaissance: 1, exploration: 2, enlightenment: 3, revolution: 4,
  industry: 5, empire: 6, atomic: 7, digital: 8,
  signal: 9, revelation: 10, preparation: 11, arrival: 12,
};

// Name pools per era range
const NAME_POOLS: Record<string, { male: string[]; female: string[] }> = {
  early: {
    male: ['Marcus', 'Aldric', 'Tobias', 'Henrik', 'Valerian', 'Silas'],
    female: ['Ava', 'Elara', 'Margaux', 'Solenne', 'Isadora', 'Cressida'],
  },
  mid: {
    male: ['Edmund', 'Pascal', 'Dmitri', 'Albert', 'Theodore', 'Wellington'],
    female: ['Emilia', 'Charlotte', 'Josephine', 'Katarina', 'Victoria', 'Ada'],
  },
  late: {
    male: ['James', 'Nikolai', 'Kenji', 'Ravi', 'Kai', 'Soren'],
    female: ['Elena', 'Mei', 'Amara', 'Ingrid', 'Lena', 'Nova'],
  },
};

function getNamePool(eraIndex: number): { male: string[]; female: string[] } {
  if (eraIndex <= 4) return NAME_POOLS.early;
  if (eraIndex <= 8) return NAME_POOLS.mid;
  return NAME_POOLS.late;
}

function generateVoiceName(
  rng: () => number,
  eraIndex: number,
  regionName: string,
  lineageOf: VoiceId | null,
  ancestorName?: string,
): string {
  const pool = getNamePool(eraIndex);
  const isMale = rng() < 0.5;
  const names = isMale ? pool.male : pool.female;
  const first = names[Math.floor(rng() * names.length)];
  const base = `${first} of ${regionName}`;
  if (lineageOf && ancestorName) {
    return `${first} II, descendant of ${ancestorName}`;
  }
  return base;
}

/** Get the dominant player-religion influence for a nation. */
function playerReligionInfluenceInNation(state: GameState, nationId: string): number {
  const nation = state.world.nations.get(nationId);
  if (!nation) return 0;
  let total = 0;
  let count = 0;
  for (const regionId of nation.regionIds) {
    const region = state.world.regions.get(regionId);
    if (!region) continue;
    const inf = region.religiousInfluence.find(
      ri => ri.religionId === state.playerReligionId,
    );
    total += inf?.strength ?? 0;
    count++;
  }
  return count > 0 ? total / count : 0;
}

/** Count voices by type among living voices. */
function countByType(voices: FollowerVoice[], type: VoiceType): number {
  return voices.filter(v => v.type === type).length;
}

/** Count currently pending petitions. */
function pendingPetitionCount(voices: FollowerVoice[]): number {
  return voices.filter(v => v.currentPetition !== null).length;
}

/** Generate a petition text for a given voice type. */
function generatePetitionText(type: VoiceType, regionName: string): string {
  switch (type) {
    case 'prophet':
      return `Lord, the people of ${regionName} thirst for your light. Bless their harvest.`;
    case 'ruler':
      return `Our nation needs divine protection. Shield us, Lord.`;
    case 'general':
      return `Lord, we are outnumbered. A blessing would turn the tide.`;
    case 'scholar':
      return `The scholars of ${regionName} are on the verge of a breakthrough. A touch of inspiration.`;
    case 'heretic':
      return `Your commandments fail your people, god. Reform or be abandoned.`;
    default:
      return `Lord, hear my prayer.`;
  }
}

/** Spawn a new voice and add it to the list. Returns the list (may retire oldest). */
function spawnVoice(
  voices: FollowerVoice[],
  type: VoiceType,
  regionId: RegionId,
  rng: () => number,
  currentYear: number,
  currentEra: EraId,
  regionName: string,
  lineageOf: VoiceId | null = null,
  ancestorName?: string,
): FollowerVoice[] {
  const result = [...voices];
  // If at max cap (5), retire oldest non-petitioning voice
  if (result.length >= VOICES.MAX_ALIVE) {
    const retireIdx = result.findIndex(v => v.currentPetition === null);
    if (retireIdx >= 0) {
      result.splice(retireIdx, 1);
    } else {
      // All are petitioning — retire oldest (index 0)
      result.splice(0, 1);
    }
  }

  const eraIndex = ERA_INDEX[currentEra] ?? 1;
  const lifespanYears = Math.floor(
    VOICES.LIFESPAN_YEARS_MIN +
      rng() * (VOICES.LIFESPAN_YEARS_MAX - VOICES.LIFESPAN_YEARS_MIN),
  );
  const id: VoiceId = `voice_${type}_${currentYear.toFixed(0)}_${Math.floor(rng() * 10000)}`;
  const name = generateVoiceName(rng, eraIndex, regionName, lineageOf, ancestorName);

  const voice: FollowerVoice = {
    id,
    type,
    name,
    regionId,
    loyalty: lineageOf ? VOICES.LINEAGE_STARTING_LOYALTY : VOICES.STARTING_LOYALTY,
    birthYear: currentYear,
    lifespanYears,
    eraBorn: currentEra,
    lineageOf,
    currentPetition: null,
    betrayalImminentTicks: undefined,
  };
  result.push(voice);
  return result;
}

/**
 * Handles all follower voice logic per tick:
 * - Emergence checks (ruler, general, scholar, heretic)
 * - Aging and natural death
 * - Loyalty decay
 * - Petition expiry (auto-deny)
 * - Petition generation
 * - Lineage scheduling
 */
export function tickVoices(state: GameState, deltaYears: number): GameState {
  return produce(state, draft => {
    const tick = draft.world.currentTick;
    const currentYear = draft.world.currentYear;
    const worldSeed = draft.world.seed;
    let callIndex = tick * 1000; // offset so voice calls don't collide with other modules
    const rng = () => seededRandom(worldSeed, tick, callIndex++);

    // --- Emergence checks ---
    const voices = draft.voiceRecords as FollowerVoice[];
    const prophetCount = countByType(voices, 'prophet');
    const rulerCount = countByType(voices, 'ruler');
    const generalCount = countByType(voices, 'general');
    const scholarCount = countByType(voices, 'scholar');
    const hereticCount = countByType(voices, 'heretic');

    // Ruler: nation with >60% player religion, max 2 alive
    if (rulerCount < 2) {
      for (const nation of draft.world.nations.values()) {
        if (nation.isPlayerNation) continue;
        const inf = playerReligionInfluenceInNation(state, nation.id);
        if (inf >= VOICES.RULER_FAITH_THRESHOLD) {
          // One Ruler per nation — check none already from this nation
          const alreadyHas = voices.some(
            v => v.type === 'ruler' && v.regionId === nation.regionIds[0],
          );
          if (!alreadyHas) {
            const capitalRegionId = nation.regionIds[0] as RegionId;
            const regionName = capitalRegionId;
            const newVoices = spawnVoice(
              voices,
              'ruler',
              capitalRegionId,
              rng,
              currentYear,
              draft.world.currentEra,
              regionName,
            );
            draft.voiceRecords = newVoices;
            break; // one per tick
          }
        }
      }
    }

    // General: nation at war with >60% player religion, one per active war
    if (generalCount < 3) {
      for (const nation of draft.world.nations.values()) {
        const inf = playerReligionInfluenceInNation(state, nation.id);
        if (inf < VOICES.RULER_FAITH_THRESHOLD) continue;
        let atWar = false;
        for (const rel of nation.relations.values()) {
          if (rel.atWar) { atWar = true; break; }
        }
        if (!atWar) continue;
        const alreadyHas = (draft.voiceRecords as FollowerVoice[]).some(
          v => v.type === 'general' && v.regionId === nation.regionIds[0],
        );
        if (!alreadyHas) {
          const capitalRegionId = nation.regionIds[0] as RegionId;
          const newVoices = spawnVoice(
            draft.voiceRecords as FollowerVoice[],
            'general',
            capitalRegionId,
            rng,
            currentYear,
            draft.world.currentEra,
            capitalRegionId,
          );
          draft.voiceRecords = newVoices;
          break;
        }
      }
    }

    // Scholar: city reaches Dev 6+ in player-religion region, max 1
    if (scholarCount < 1) {
      for (const region of draft.world.regions.values()) {
        if (region.development < VOICES.SCHOLAR_DEV_THRESHOLD) continue;
        if (region.dominantReligion !== state.playerReligionId) continue;
        const alreadyHas = (draft.voiceRecords as FollowerVoice[]).some(
          v => v.type === 'scholar' && v.regionId === region.id,
        );
        if (!alreadyHas) {
          const newVoices = spawnVoice(
            draft.voiceRecords as FollowerVoice[],
            'scholar',
            region.id as RegionId,
            rng,
            currentYear,
            draft.world.currentEra,
            region.id,
          );
          draft.voiceRecords = newVoices;
          break;
        }
      }
    }

    // Heretic: schism risk > 40% (approximated by hypocrisy) OR prophet ignored >50 years
    if (hereticCount < 1) {
      const schismRisk = draft.hypocrisyLevel; // used as schism proxy
      const prophetIgnored = prophetCount === 0 && currentYear > 1650; // simple check
      if (
        schismRisk >= VOICES.HERETIC_SCHISM_THRESHOLD ||
        (prophetIgnored && currentYear - 1600 >= VOICES.PROPHET_IGNORE_YEARS)
      ) {
        const firstRegion = Array.from(draft.world.regions.keys())[0] as RegionId;
        const newVoices = spawnVoice(
          draft.voiceRecords as FollowerVoice[],
          'heretic',
          firstRegion,
          rng,
          currentYear,
          draft.world.currentEra,
          firstRegion,
        );
        draft.voiceRecords = newVoices;
      }
    }

    // --- Aging, Death, Petition expiry, Loyalty decay ---
    const toRemove: VoiceId[] = [];
    const lineageQueue: Array<{
      voice: FollowerVoice;
      deathYear: number;
      reason: 'natural' | 'war';
    }> = [];

    for (const voice of draft.voiceRecords as FollowerVoice[]) {
      // Loyalty decay: −0.01 per 100 ticks
      voice.loyalty = Math.max(0, voice.loyalty - VOICES.LOYALTY_DECAY_PER_100_TICKS / 100);

      // Petition expiry (auto-deny)
      if (voice.currentPetition != null) {
        const now = state.realTimeElapsed;
        if (now >= voice.currentPetition.expiryTime) {
          voice.loyalty = Math.max(0, voice.loyalty - VOICES.LOYALTY_LOSS_AUTO_DENY);
          voice.currentPetition = null;
        }
      }

      // Natural death: age >= lifespan
      const age = currentYear - voice.birthYear;
      if (age >= voice.lifespanYears) {
        toRemove.push(voice.id);
        lineageQueue.push({ voice: { ...voice }, deathYear: currentYear, reason: 'natural' });
        continue;
      }

      // Killed in war: region conquered (region's nation changed)
      const region = draft.world.regions.get(voice.regionId);
      if (region) {
        const regionNation = region.nationId;
        const playerNations = Array.from(draft.world.nations.values()).filter(
          n => n.regionIds.includes(voice.regionId),
        );
        // Check if the region's dominant religion changed drastically (proxy for conquest)
        // Actually: check if ANY army is conquering this region (war state + region ownership change)
        // For simplicity, check if region changed nation since voice birth by looking at nation state
        // We use: if region is now under a nation hostile to player religion
        if (region.dominantReligion !== state.playerReligionId) {
          // Check if region was just conquered by looking at opinions
          const nationForRegion = draft.world.nations.get(regionNation);
          if (nationForRegion) {
            let atWarWithPlayerNation = false;
            for (const [_otherId, rel] of nationForRegion.relations) {
              const otherNation = draft.world.nations.get(_otherId);
              if (otherNation && otherNation.isPlayerNation && rel.atWar) {
                atWarWithPlayerNation = true;
                break;
              }
            }
            if (atWarWithPlayerNation) {
              toRemove.push(voice.id);
              lineageQueue.push({ voice: { ...voice }, deathYear: currentYear, reason: 'war' });
              continue;
            }
          }
        }
      }

      // Betrayal: loyalty < threshold
      if (voice.loyalty < VOICES.BETRAYAL_THRESHOLD) {
        if (voice.loyalty <= 0) {
          // Grace period logic
          if (voice.betrayalImminentTicks === undefined) {
            voice.betrayalImminentTicks = 0;
          }
          voice.betrayalImminentTicks++;
          if (voice.betrayalImminentTicks >= VOICES.BETRAYAL_GRACE_TICKS) {
            toRemove.push(voice.id);
            // No lineage for betrayal
            continue;
          }
        } else {
          voice.betrayalImminentTicks = undefined;
          // Probabilistic betrayal
          if (rng() < VOICES.BETRAYAL_PROB_PER_TICK) {
            toRemove.push(voice.id);
            continue;
          }
        }
      } else {
        voice.betrayalImminentTicks = undefined;
      }

      // Petition generation
      const pendingCount = (draft.voiceRecords as FollowerVoice[]).filter(
        v => v.currentPetition !== null,
      ).length;
      if (voice.currentPetition === null && pendingCount < PETITIONS.MAX_PENDING) {
        const lastPetitionTime = state.realTimeElapsed; // approximate with elapsed
        // Use tick-based cadence: roughly every 300 ticks (60 real-seconds at 1×)
        if (tick % 5 === 0 && rng() < 0.1) {
          const regionName = voice.regionId;
          const petitionText = generatePetitionText(voice.type, regionName);
          const petition: Petition = {
            voiceId: voice.id,
            type: voice.type,
            requestText: petitionText,
            expiryTime: state.realTimeElapsed + PETITIONS.TIMEOUT_SEC,
          };
          voice.currentPetition = petition;
        }
      }
    }

    // Remove dead voices
    draft.voiceRecords = (draft.voiceRecords as FollowerVoice[]).filter(
      v => !toRemove.includes(v.id),
    );

    // Process lineage queue
    for (const { voice, deathYear, reason } of lineageQueue) {
      if (reason === 'natural') {
        const roll = rng();
        if (roll < VOICES.LINEAGE_CHANCE) {
          const delayYears =
            VOICES.LINEAGE_DELAY_YEARS_MIN +
            Math.floor(
              rng() * (VOICES.LINEAGE_DELAY_YEARS_MAX - VOICES.LINEAGE_DELAY_YEARS_MIN),
            );
          const spawnYear = deathYear + delayYears;
          if (currentYear >= spawnYear) {
            const newVoices = spawnVoice(
              draft.voiceRecords as FollowerVoice[],
              voice.type,
              voice.regionId,
              rng,
              currentYear,
              draft.world.currentEra,
              voice.regionId,
              voice.id,
              voice.name,
            );
            draft.voiceRecords = newVoices;
          }
        }
      }
    }
  });
}

/**
 * Marks a voice's petition as fulfilled.
 * +0.10 loyalty, petition cleared.
 */
export function fulfillPetition(state: GameState, voiceId: VoiceId): GameState {
  return produce(state, draft => {
    const voice = (draft.voiceRecords as FollowerVoice[]).find(v => v.id === voiceId);
    if (!voice || !voice.currentPetition) return;
    voice.loyalty = Math.min(1, voice.loyalty + VOICES.LOYALTY_GAIN_FULFILL);
    voice.currentPetition = null;
  });
}

/**
 * Marks a voice's petition as denied.
 * −0.15 loyalty, petition cleared.
 */
export function denyPetition(state: GameState, voiceId: VoiceId): GameState {
  return produce(state, draft => {
    const voice = (draft.voiceRecords as FollowerVoice[]).find(v => v.id === voiceId);
    if (!voice || !voice.currentPetition) return;
    voice.loyalty = Math.max(0, voice.loyalty - VOICES.LOYALTY_LOSS_DENY);
    voice.currentPetition = null;
  });
}
