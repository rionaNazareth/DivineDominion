import './immer-config.js';
import { produce } from 'immer';
import type {
  GameState,
  PowerId,
  RegionId,
  ActiveEffect,
  CommandmentEffects,
} from '../types/game.js';
import {
  DIVINE_ENERGY,
  HYPOCRISY,
  POWER_UNLOCK,
  TIME,
} from '../config/constants.js';
import { getPowerById } from '../config/powers.js';

// Power unlock era mapping: powerId → minimum era index (1-based)
const POWER_UNLOCK_ERAS: Record<string, number> = {
  bountiful_harvest: 1,
  great_storm: 1,
  inspiration: 2,
  great_flood: 2,
  shield_of_faith: 3,
  plague: 3,
  miracle: 4,
  famine: 4,
  prophet: 5,
  wildfire: 5,
  golden_age: 6,
  earthquake: 6,
};

const ERA_INDEX: Record<string, number> = {
  renaissance: 1, exploration: 2, enlightenment: 3, revolution: 4,
  industry: 5, empire: 6, atomic: 7, digital: 8,
  signal: 9, revelation: 10, preparation: 11, arrival: 12,
};

/** Returns the current era index (1-12). */
function currentEraIndex(state: GameState): number {
  return ERA_INDEX[state.world.currentEra] ?? 1;
}

/** Checks if a power is unlocked for the current era. */
export function isPowerUnlocked(state: GameState, powerId: PowerId): boolean {
  const requiredEra = POWER_UNLOCK_ERAS[powerId] ?? 1;
  return currentEraIndex(state) >= requiredEra;
}

// Hypocrisy trigger table: powerId → [commandmentId, severity][]
type HypocrisySeverity = 'mild' | 'moderate' | 'severe';
const HYPOCRISY_TRIGGERS: Record<string, Array<[string, HypocrisySeverity]>> = {
  plague: [
    ['all_life_sacred', 'severe'],
    ['turn_the_other_cheek', 'moderate'],
  ],
  famine: [
    ['all_life_sacred', 'severe'],
    ['turn_the_other_cheek', 'moderate'],
  ],
  earthquake: [
    ['earth_is_sacred', 'severe'],
    ['turn_the_other_cheek', 'moderate'],
  ],
  great_flood: [
    ['turn_the_other_cheek', 'moderate'],
    ['earth_is_sacred', 'moderate'],
  ],
  great_storm: [
    ['turn_the_other_cheek', 'moderate'],
  ],
  wildfire: [
    ['turn_the_other_cheek', 'moderate'],
    ['earth_is_sacred', 'moderate'],
  ],
  miracle: [
    ['god_is_silent', 'mild'],
  ],
};

function hypocrisyGain(severity: HypocrisySeverity): number {
  switch (severity) {
    case 'mild': return HYPOCRISY.VIOLATION_GAIN_MILD;
    case 'moderate': return HYPOCRISY.VIOLATION_GAIN_MODERATE;
    case 'severe': return HYPOCRISY.VIOLATION_GAIN_SEVERE;
  }
}

/**
 * Checks if a power cast violates commandments and accumulates hypocrisy.
 * Returns updated GameState.
 */
export function checkHypocrisy(state: GameState, powerId: PowerId): GameState {
  const effects = state.effectiveCommandmentEffects;
  // If hypocrisy is disabled by commandment, skip
  if (effects?.hypocrisyDisabled) return state;

  const triggers = HYPOCRISY_TRIGGERS[powerId] ?? [];
  let maxSeverity: HypocrisySeverity | null = null;

  for (const [cmdId, severity] of triggers) {
    if (state.selectedCommandments.includes(cmdId)) {
      if (maxSeverity === null) {
        maxSeverity = severity;
      } else {
        // Take worst severity
        const rank: Record<HypocrisySeverity, number> = { mild: 1, moderate: 2, severe: 3 };
        if (rank[severity] > rank[maxSeverity]) maxSeverity = severity;
      }
    }
  }

  if (maxSeverity === null) return state;

  const gain = hypocrisyGain(maxSeverity);
  return produce(state, draft => {
    draft.hypocrisyLevel = Math.min(1.0, draft.hypocrisyLevel + gain);
    draft.divineState.hypocrisyEvents++;
  });
}

/**
 * Casts a divine power on a region.
 * Checks energy, cooldown, region existence, and power unlock.
 * Applies ActiveEffect, deducts energy, sets cooldown.
 * Calls checkHypocrisy and (via caller) checkAndApplyCombos.
 */
export function castPower(state: GameState, powerId: PowerId, regionId: RegionId): GameState {
  const power = getPowerById(powerId);
  if (!power) return state; // invalid powerId

  if (!state.world.regions.has(regionId)) return state; // invalid regionId

  if (!isPowerUnlocked(state, powerId)) return state; // not yet unlocked

  if (state.divineState.energy < power.cost) return state; // insufficient energy

  // Check cooldown (in real seconds: cooldownMinutes × 60)
  const cooldownSec = power.cooldownMinutes * 60;
  const remaining = state.divineState.cooldowns.get(powerId) ?? 0;
  if (remaining > 0) return state; // on cooldown

  const result = produce(state, draft => {
    const region = draft.world.regions.get(regionId)!;

    // Deduct energy
    draft.divineState.energy = Math.max(0, draft.divineState.energy - power.cost);
    draft.divineState.totalInterventions++;

    if (power.type === 'blessing') {
      draft.divineState.blessingsUsed++;
    } else {
      draft.divineState.disastersUsed++;
      draft.divineState.lastDisasterYear = draft.world.currentYear;
    }

    if (powerId === 'miracle') {
      draft.divineState.lastMiracleYear = draft.world.currentYear;
    }

    // Set cooldown (seconds)
    draft.divineState.cooldowns.set(powerId, cooldownSec);

    // Compute endYear
    const durationYears = power.durationGameYears ?? 0;
    const endYear = draft.world.currentYear + durationYears;

    // Add ActiveEffect to region
    const effect: ActiveEffect = {
      powerId,
      startYear: draft.world.currentYear,
      endYear,
      sourceReligionId: draft.playerReligionId,
    };
    region.activeEffects.push(effect);

    // Instant power effects applied immediately
    applyInstantEffect(draft as unknown as GameState, powerId, regionId);
  });

  // Check hypocrisy after cast
  return checkHypocrisy(result, powerId);
}

/** Applies immediate/instant effects for powers (non-duration effects). */
function applyInstantEffect(state: GameState, powerId: PowerId, regionId: RegionId): void {
  // Note: we operate on the draft inside produce, cast as GameState for type compat
  const draft = state as GameState;
  const region = draft.world.regions.get(regionId);
  if (!region) return;

  switch (powerId) {
    case 'miracle': {
      // Mass conversion: +0.40 influence to player religion
      const playerRel = region.religiousInfluence.find(
        r => r.religionId === draft.playerReligionId,
      );
      if (playerRel) {
        playerRel.strength = Math.min(1.0, playerRel.strength + 0.40);
      } else {
        region.religiousInfluence.push({
          religionId: draft.playerReligionId,
          strength: 0.40,
        });
      }
      // Normalize
      const total = region.religiousInfluence.reduce((s, r) => s + r.strength, 0);
      if (total > 1.0) {
        for (const r of region.religiousInfluence) {
          r.strength /= total;
        }
      }
      break;
    }

    case 'earthquake': {
      // -10% development, -1 city level
      region.development = Math.max(1, Math.floor(region.development * 0.9));
      if (region.cityLevel > 0) region.cityLevel--;
      break;
    }

    case 'wildfire': {
      // -1 city level
      if (region.cityLevel > 0) region.cityLevel--;
      break;
    }

    default:
      break;
  }
}

/**
 * Ticks divine effects each game tick:
 * - Regenerates energy (real-time based)
 * - Decrements cooldowns (real-time based via deltaRealSeconds)
 * - Expires ActiveEffects past endYear
 * - Applies hypocrisy decay
 * - Applies ongoing hypocrisy penalties to regions
 */
export function tickDivineEffects(state: GameState, deltaRealSeconds: number): GameState {
  return produce(state, draft => {
    // Energy regen: REGEN_PER_REAL_MINUTE per real minute
    const energyGain = (deltaRealSeconds / 60) * DIVINE_ENERGY.REGEN_PER_REAL_MINUTE;
    draft.divineState.energy = Math.min(
      draft.divineState.maxEnergy || DIVINE_ENERGY.MAX,
      draft.divineState.energy + energyGain,
    );

    // Decrement cooldowns (real seconds)
    for (const [powerId, remaining] of Array.from(draft.divineState.cooldowns.entries())) {
      const newRemaining = remaining - deltaRealSeconds;
      if (newRemaining <= 0) {
        draft.divineState.cooldowns.delete(powerId);
      } else {
        draft.divineState.cooldowns.set(powerId, newRemaining);
      }
    }

    // Expire ActiveEffects
    const currentYear = draft.world.currentYear;
    for (const region of draft.world.regions.values()) {
      region.activeEffects = region.activeEffects.filter(e => e.endYear > currentYear || e.endYear === e.startYear);
    }

    // Hypocrisy decay
    draft.hypocrisyLevel = Math.max(0, draft.hypocrisyLevel - HYPOCRISY.DECAY_RATE);

    // Apply hypocrisy penalties to faith in player-religion regions
    applyHypocrisyPenalties(draft as unknown as GameState);
  });
}

function applyHypocrisyPenalties(state: GameState): void {
  const hyp = state.hypocrisyLevel;
  if (hyp < 0.20) return;

  let faithLossRate: number;
  if (hyp >= 0.70) {
    faithLossRate = HYPOCRISY.FAITH_LOSS_PER_TICK_SEVERE;
  } else if (hyp >= 0.40) {
    faithLossRate = HYPOCRISY.FAITH_LOSS_PER_TICK_MODERATE;
  } else {
    faithLossRate = HYPOCRISY.FAITH_LOSS_PER_TICK_MILD;
  }

  for (const region of state.world.regions.values()) {
    if (region.dominantReligion !== state.playerReligionId) continue;
    const playerInf = region.religiousInfluence.find(r => r.religionId === state.playerReligionId);
    if (!playerInf) continue;
    playerInf.strength = Math.max(0, playerInf.strength - playerInf.strength * faithLossRate);
    region.faithStrength = Math.max(0, region.faithStrength - region.faithStrength * faithLossRate);
  }
}
