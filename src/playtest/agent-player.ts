// =============================================================================
// DIVINE DOMINION — Agent Player
// Pure-function strategy agent. No LLM, no creative judgment.
// Decision logic is a lookup table based on StrategyProfile.
// Spec: docs/design/test-spec.md §14a
// =============================================================================

import type {
  GameState,
  RegionId,
  PowerId,
  VoiceId,
  WhisperType,
  PlayerAction,
  StrategyProfile,
} from '../types/game.js';
import { BLESSINGS, DISASTERS, DIVINE_ENERGY } from '../config/constants.js';
import { isPowerUnlocked } from '../simulation/divine.js';
import { createPRNG } from '../simulation/prng.js';

// Re-export so callers that import from this file don't need to change.
export type { PlayerAction, StrategyProfile } from '../types/game.js';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const BLESSING_IDS: PowerId[] = [
  'bountiful_harvest', 'inspiration', 'miracle',
  'prophet', 'shield_of_faith', 'golden_age',
];
const DISASTER_IDS: PowerId[] = [
  'great_storm', 'great_flood', 'plague', 'famine', 'wildfire', 'earthquake',
];
const WHISPER_TYPES: WhisperType[] = ['war', 'peace', 'science', 'faith'];

function getRegions(state: GameState): RegionId[] {
  return Array.from(state.world.regions.keys());
}

function getPlayerRegions(state: GameState): RegionId[] {
  const regions: RegionId[] = [];
  for (const [rid, region] of state.world.regions) {
    const dominant = region.dominantReligion;
    if (dominant === state.playerReligionId) regions.push(rid);
  }
  return regions.length > 0 ? regions : getRegions(state);
}

function getRivalRegions(state: GameState): RegionId[] {
  const regions: RegionId[] = [];
  for (const [rid, region] of state.world.regions) {
    const dominant = region.dominantReligion;
    if (dominant && dominant !== state.playerReligionId) regions.push(rid);
  }
  return regions.length > 0 ? regions : getRegions(state);
}

function randInt(prng: ReturnType<typeof createPRNG>, min: number, max: number): number {
  return min + Math.floor(prng.next() * (max - min + 1));
}

function getRegionByHighestDev(state: GameState, regionIds: RegionId[]): RegionId | null {
  let best: RegionId | null = null;
  let bestDev = -1;
  for (const rid of regionIds) {
    const r = state.world.regions.get(rid);
    if (r && r.development > bestDev) { bestDev = r.development; best = rid; }
  }
  return best;
}

function getRegionByLowestDev(state: GameState, regionIds: RegionId[]): RegionId | null {
  let best: RegionId | null = null;
  let bestDev = Infinity;
  for (const rid of regionIds) {
    const r = state.world.regions.get(rid);
    if (r && r.development < bestDev) { bestDev = r.development; best = rid; }
  }
  return best;
}

function getRegionByHighestFaith(state: GameState): RegionId | null {
  let best: RegionId | null = null;
  let bestFaith = -1;
  for (const [rid, region] of state.world.regions) {
    const influence = region.religiousInfluence.find(
      ri => ri.religionId === state.playerReligionId,
    );
    const faith = influence?.strength ?? 0;
    if (faith > bestFaith) { bestFaith = faith; best = rid; }
  }
  return best;
}

function selectTarget(
  state: GameState,
  selection: string,
  prng: ReturnType<typeof createPRNG>,
): RegionId | null {
  const allRegions = getRegions(state);
  if (allRegions.length === 0) return null;

  switch (selection) {
    case 'military': {
      // prefer regions with active wars (nations at war)
      const atWar: RegionId[] = [];
      for (const [rid, region] of state.world.regions) {
        const nation = state.world.nations.get(region.nationId);
        if (nation) {
          for (const [, rel] of nation.relations) {
            if (rel.atWar) { atWar.push(rid); break; }
          }
        }
      }
      if (atWar.length > 0) return atWar[randInt(prng, 0, atWar.length - 1)];
      return allRegions[randInt(prng, 0, allRegions.length - 1)];
    }
    case 'highest_faith':
      return getRegionByHighestFaith(state) ?? allRegions[0];
    case 'weakest_player_region': {
      const playerRegions = getPlayerRegions(state);
      return getRegionByLowestDev(state, playerRegions) ?? allRegions[0];
    }
    case 'lowest_dev_player': {
      const playerRegions = getPlayerRegions(state);
      return getRegionByLowestDev(state, playerRegions) ?? allRegions[0];
    }
    case 'highest_dev_player': {
      const playerRegions = getPlayerRegions(state);
      return getRegionByHighestDev(state, playerRegions) ?? allRegions[0];
    }
    case 'rival_strongest': {
      const rivalRegions = getRivalRegions(state);
      return getRegionByHighestDev(state, rivalRegions) ?? allRegions[0];
    }
    case 'rival_at_war': {
      const rivalRegions = getRivalRegions(state);
      const atWar = rivalRegions.filter(rid => {
        const region = state.world.regions.get(rid);
        if (!region) return false;
        const nation = state.world.nations.get(region.nationId);
        if (!nation) return false;
        for (const [, rel] of nation.relations) { if (rel.atWar) return true; }
        return false;
      });
      if (atWar.length > 0) return atWar[randInt(prng, 0, atWar.length - 1)];
      if (rivalRegions.length > 0) return rivalRegions[randInt(prng, 0, rivalRegions.length - 1)];
      return allRegions[randInt(prng, 0, allRegions.length - 1)];
    }
    case 'highest_dev_rival': {
      const rivalRegions = getRivalRegions(state);
      return getRegionByHighestDev(state, rivalRegions) ?? allRegions[0];
    }
    case 'random':
      return allRegions[randInt(prng, 0, allRegions.length - 1)];
    default:
      return allRegions[0];
  }
}

function canAffordPower(state: GameState, powerId: PowerId): boolean {
  const allPowers: Record<string, { cost: number }> = {
    bountiful_harvest: BLESSINGS.BOUNTIFUL_HARVEST,
    inspiration: BLESSINGS.INSPIRATION,
    miracle: BLESSINGS.MIRACLE,
    prophet: BLESSINGS.PROPHET,
    shield_of_faith: BLESSINGS.SHIELD_OF_FAITH,
    golden_age: BLESSINGS.GOLDEN_AGE,
    great_storm: DISASTERS.GREAT_STORM,
    great_flood: DISASTERS.GREAT_FLOOD,
    plague: DISASTERS.PLAGUE,
    famine: DISASTERS.FAMINE,
    wildfire: DISASTERS.WILDFIRE,
    earthquake: DISASTERS.EARTHQUAKE,
  };
  const power = allPowers[powerId];
  if (!power) return false;
  return state.divineState.energy >= power.cost;
}

function isOnCooldown(state: GameState, powerId: PowerId, realTimeSec: number): boolean {
  const cd = state.divineState.cooldowns.get(powerId);
  if (!cd) return false;
  return realTimeSec < cd;
}

function selectPower(
  state: GameState,
  profile: StrategyProfile,
  prng: ReturnType<typeof createPRNG>,
): { powerId: PowerId; regionId: RegionId } | null {
  if (profile.castFrequency === 'never') return null;
  if (profile.powerPolicy.targetSelection === 'none') return null;

  const energyThreshold = DIVINE_ENERGY.MAX * 0.5;
  if (
    profile.castFrequency === 'energy_above_threshold' &&
    state.divineState.energy < energyThreshold
  ) return null;

  const realTimeSec = state.realTimeElapsed;
  const candidatePowers = profile.powerPolicy.preferDisasters
    ? [...DISASTER_IDS, ...BLESSING_IDS]
    : [...BLESSING_IDS, ...DISASTER_IDS];

  // Random profile shuffles
  if (profile.id === 'random') {
    const shuffled = [...candidatePowers].sort(() => prng.next() - 0.5);
    for (const powerId of shuffled) {
      if (
        isPowerUnlocked(state, powerId) &&
        canAffordPower(state, powerId) &&
        !isOnCooldown(state, powerId, realTimeSec)
      ) {
        const target = selectTarget(state, 'random', prng);
        if (target) return { powerId, regionId: target };
      }
    }
    return null;
  }

  for (const powerId of candidatePowers) {
    if (
      isPowerUnlocked(state, powerId) &&
      canAffordPower(state, powerId) &&
      !isOnCooldown(state, powerId, realTimeSec)
    ) {
      // Rival targeting: apply disasters to rival regions, blessings to player regions
      const isDisaster = DISASTER_IDS.includes(powerId);
      const targetSelection = isDisaster
        ? (profile.powerPolicy.rivalTargeting !== 'never' ? profile.powerPolicy.rivalTargeting : 'skip')
        : profile.powerPolicy.targetSelection;

      if (targetSelection === 'skip') continue;

      const target = selectTarget(state, targetSelection, prng);
      if (target) return { powerId, regionId: target };
    }
  }
  return null;
}

function selectWhisper(
  state: GameState,
  profile: StrategyProfile,
  prng: ReturnType<typeof createPRNG>,
): { regionId: RegionId; whisperType: WhisperType } | null {
  if (profile.whisperPolicy.frequency === 0) return null;
  if (prng.next() > profile.whisperPolicy.frequency) return null;

  const types = profile.whisperPolicy.types;
  if (types.length === 0) return null;

  let chosenType: WhisperType;
  if (types[0] === 'random') {
    chosenType = WHISPER_TYPES[randInt(prng, 0, WHISPER_TYPES.length - 1)];
  } else {
    chosenType = (types[randInt(prng, 0, types.length - 1)] as WhisperType) ?? 'science';
  }

  const allRegions = getRegions(state);
  if (allRegions.length === 0) return null;
  const regionId = allRegions[randInt(prng, 0, allRegions.length - 1)];
  return { regionId, whisperType: chosenType };
}

// -----------------------------------------------------------------------------
// Main decision function
// -----------------------------------------------------------------------------

/**
 * Pure function — decides the next action for the agent player.
 * Uses a seeded PRNG sub-instance derived from the game tick for determinism.
 */
export function decideAction(
  state: GameState,
  profile: StrategyProfile,
  prng: ReturnType<typeof createPRNG>,
): PlayerAction {
  // no_input: always wait
  if (profile.id === 'no_input') return { type: 'wait' };

  // Priority 1: Handle pending event choice
  if (state.currentEvent) {
    const event = state.currentEvent;
    if (event.choices && event.choices.length > 0) {
      const bias = profile.eventBias[event.category as string] ?? 0.5;
      const choiceIndex = prng.next() < bias ? 0 : event.choices.length - 1;
      return { type: 'event_choice', eventId: event.id, choiceIndex };
    }
    // Auto-resolve (no choices)
    return { type: 'wait' };
  }

  // Priority 2: Handle voice petitions
  const pendingVoices = state.voiceRecords.filter(v => v.currentPetition);
  if (pendingVoices.length > 0) {
    const voice = pendingVoices[0];
    const petition = voice.currentPetition!;
    const petitionType = petition.type ?? 'general';
    if (profile.petitionPolicy.fulfill.includes(petitionType)) {
      return { type: 'fulfill_petition', voiceId: voice.id };
    }
    if (profile.petitionPolicy.deny.includes(petitionType)) {
      return { type: 'deny_petition', voiceId: voice.id };
    }
    // Default: fulfill if loyalty is high
    if (voice.loyalty > 0.5) return { type: 'fulfill_petition', voiceId: voice.id };
    return { type: 'deny_petition', voiceId: voice.id };
  }

  // Priority 3: Cast divine power
  const powerDecision = selectPower(state, profile, prng);
  if (powerDecision) {
    return { type: 'cast_power', ...powerDecision };
  }

  // Priority 4: Cast whisper
  const whisperDecision = selectWhisper(state, profile, prng);
  if (whisperDecision) {
    return { type: 'cast_whisper', ...whisperDecision };
  }

  return { type: 'wait' };
}
