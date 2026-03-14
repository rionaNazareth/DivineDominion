import './immer-config.js';
import { produce } from 'immer';
import type { GameState, WhisperType, RegionId } from '../types/game.js';
import { WHISPERS } from '../config/constants.js';

/** Key used for per-region-per-type cooldown map: `${regionId}:${whisperType}` */
function cooldownKey(regionId: RegionId, type: WhisperType): string {
  return `${regionId}:${type}`;
}

/**
 * Checks whether a whisper is currently blocked by cooldowns.
 * globalCooldown: 10s between ANY whisper
 * regionCooldown: 30s per-region per-type
 */
function isCooledDown(
  state: GameState,
  regionId: RegionId,
  whisperType: WhisperType,
  currentTimeSec: number,
): boolean {
  // Global cooldown
  if (currentTimeSec - state.whisperState.lastWhisperTime < WHISPERS.GLOBAL_COOLDOWN_SEC) {
    return false; // blocked
  }
  // Per-region per-type cooldown
  const key = cooldownKey(regionId, whisperType);
  const lastUsed = state.whisperState.regionCooldowns.get(key);
  if (lastUsed !== undefined && currentTimeSec - lastUsed < WHISPERS.REGION_COOLDOWN_SEC) {
    return false; // blocked
  }
  return true; // allowed
}

/**
 * Applies a Divine Whisper to a region.
 * Cost: 0 energy.
 * Checks cooldowns, applies AI nudge with compound bonus, updates voice loyalty.
 *
 * @param state - current game state
 * @param regionId - target region
 * @param whisperType - 'war' | 'peace' | 'science' | 'faith'
 * @param currentTimeSec - current real time in seconds (state.realTimeElapsed)
 */
export function castWhisper(
  state: GameState,
  regionId: RegionId,
  whisperType: WhisperType,
  currentTimeSec?: number,
): GameState {
  if (!state.world.regions.has(regionId)) return state;

  const timeSec = currentTimeSec ?? state.realTimeElapsed;

  if (!isCooledDown(state, regionId, whisperType, timeSec)) return state;

  return produce(state, draft => {
    const region = draft.world.regions.get(regionId)!;
    const nationId = region.nationId;

    // Determine AI nudge (with compound bonus)
    const stacks = draft.whisperState.compoundStacksByNation.get(nationId) ?? 0;
    const bonusStacks = Math.min(stacks, WHISPERS.COMPOUND_MAX_STACKS);
    const nudge = Math.min(
      WHISPERS.AI_NUDGE_STRENGTH + bonusStacks * WHISPERS.COMPOUND_BONUS,
      WHISPERS.NUDGE_CAP,
    );

    // Increment compound stacks for this nation
    draft.whisperState.compoundStacksByNation.set(nationId, stacks + 1);

    // Update nation AI weights
    const nation = draft.world.nations.get(nationId);
    if (nation) {
      switch (whisperType) {
        case 'war':
          nation.aiWeights.war = Math.min(1.0, nation.aiWeights.war + nudge);
          break;
        case 'peace':
          nation.aiWeights.peace = Math.min(1.0, nation.aiWeights.peace + nudge);
          break;
        case 'science':
          nation.aiWeights.science = Math.min(1.0, nation.aiWeights.science + nudge);
          break;
        case 'faith':
          nation.aiWeights.faith = Math.min(1.0, nation.aiWeights.faith + nudge);
          break;
      }
    }

    // Loyalty bonus: +0.02 to voice in this region
    for (const voice of draft.voiceRecords) {
      if (voice.regionId === regionId) {
        voice.loyalty = Math.min(1.0, voice.loyalty + WHISPERS.LOYALTY_BONUS);
      }
    }

    // Peace whisper: cancel Harbinger Discord effects in region (WHIS_011)
    if (whisperType === 'peace') {
      // Remove any discord-related active effects from the harbinger
      const regionData = draft.world.regions.get(regionId);
      if (regionData) {
        regionData.activeEffects = regionData.activeEffects.filter(
          e => e.powerId !== 'discord',
        );
      }
    }

    // Update cooldowns
    const key = cooldownKey(regionId, whisperType);
    draft.whisperState.regionCooldowns.set(key, timeSec);
    draft.whisperState.lastWhisperTime = timeSec;
    draft.whisperState.lastWhisperRegionId = regionId;
    draft.whisperState.lastWhisperType = whisperType;

    // Append whisper to divine state record
    draft.divineState.totalInterventions++;
  });
}

/**
 * Decrements whisper cooldowns using real-time (not game-time).
 * Called by the runner with deltaRealSeconds.
 */
export function tickWhispers(state: GameState, deltaRealSeconds: number): GameState {
  return produce(state, draft => {
    // Update realTimeElapsed — compound stacks expire after 1 tick (reset each tick)
    // (Stacks are nudges that apply to the next AI decision; they naturally expire
    // because AI reads weights at decision time. Reset stacks each tick.)
    draft.whisperState.compoundStacksByNation.clear();

    // Decrement region cooldowns
    for (const [key, lastUsed] of Array.from(draft.whisperState.regionCooldowns.entries())) {
      // Cooldowns are stored as absolute timestamps; we update realTimeElapsed externally.
      // No deletion here — checked against current time in castWhisper.
      // (no-op: cooldowns are absolute, not relative)
    }

    // Advance real time elapsed
    draft.realTimeElapsed += deltaRealSeconds;
  });
}
