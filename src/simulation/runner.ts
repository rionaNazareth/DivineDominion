import './immer-config.js';
import { produce } from 'immer';
import type { GameState, EraId } from '../types/game.js';
import { TIME, ERAS, AUTO_SAVE } from '../config/constants.js';
import { tickDivineEffects } from './divine.js';
import { tickDiseases } from './disease.js';
import { tickNations } from './nation.js';
import { tickTradeRoutes } from './trade.js';
import { tickReligionSpread } from './religion.js';
import { tickArmies } from './army.js';
import { tickScience } from './science.js';
import { tickNationAI } from './nation-ai.js';
import { tickHarbinger, tickCorruption, refreshHarbingerBudget } from './harbinger.js';
import { tickVoices } from './voices.js';
import { rollEvents } from './events.js';
import { tickWhispers } from './whispers.js';
import { createPRNG } from './prng.js';

// Module-level PRNG instance — shared across the simulation, deterministic per-seed.
let _prng = createPRNG(0);

/** Replaces the PRNG instance. Called at game init with the world seed. */
export function initPRNG(worldSeed: number): void {
  _prng = createPRNG(worldSeed);
}

/** Returns the current PRNG instance for use by simulation sub-modules that need it. */
export function getPRNG() {
  return _prng;
}

const ERA_INDEX: Record<string, number> = {
  renaissance: 1, exploration: 2, enlightenment: 3, revolution: 4,
  industry: 5, empire: 6, atomic: 7, digital: 8,
  signal: 9, revelation: 10, preparation: 11, arrival: 12,
};

const ERA_ORDER: EraId[] = [
  'renaissance', 'exploration', 'enlightenment', 'revolution',
  'industry', 'empire', 'atomic', 'digital',
  'signal', 'revelation', 'preparation', 'arrival',
];

/** Determines the era for a given year. */
function eraForYear(year: number): EraId {
  for (let i = ERAS.length - 1; i >= 0; i--) {
    if (year >= ERAS[i].startYear) {
      return ERAS[i].id as EraId;
    }
  }
  return 'renaissance';
}

/**
 * Orchestrates the full 17-step simulation pipeline.
 * Converts deltaRealSeconds → deltaGameYears using the speed multiplier.
 * Returns the updated GameState.
 */
export function runSimulationTick(
  state: GameState,
  deltaRealSeconds: number,
): GameState {
  // Reset PRNG call index at start of each tick (determinism)
  _prng.resetForTick(state.world.currentTick + 1);

  const deltaGameYears = TIME.TICK_GAME_YEARS; // Always 0.5 game-years per tick

  // --- PHASE 1: TIME ---
  // Step 1: Advance time
  let s = produce(state, draft => {
    draft.world.currentYear += deltaGameYears;
    draft.world.currentTick += 1;
    // Update era
    const newEra = eraForYear(draft.world.currentYear);
    draft.world.currentEra = newEra;
  });

  // Step 2: Effect management (expire effects, apply ongoing modifiers)
  s = tickDivineEffects(s, deltaRealSeconds);

  // --- PHASE 2: NATURAL SYSTEMS ---
  // Step 3: Disease tick
  s = tickDiseases(s, deltaGameYears);

  // Steps 4, 5, 7, 9: Happiness, Population, Economy, Development (all in tickNations)
  // Step 6: Trade routes
  s = tickTradeRoutes(s, deltaGameYears);

  // Step 4+5+7+9 via tickNations (uses last tick's economy stored in region)
  s = tickNations(s, deltaGameYears);

  // Step 8: Religion spread
  s = tickReligionSpread(s, deltaGameYears);

  // --- PHASE 3: MILITARY ---
  // Step 10+11: Army tick + Battle resolution
  s = tickArmies(s, deltaGameYears);

  // --- PHASE 4: PROGRESSION ---
  // Step 12: Science milestone
  s = tickScience(s);

  // Step 13: Nation AI decisions
  s = tickNationAI(s);

  // --- PHASE 5: CHARACTERS & EVENTS ---
  // Refresh Harbinger budget on era transitions
  const prevEra = state.world.currentEra;
  const newEra = s.world.currentEra;
  if (prevEra !== newEra) {
    s = refreshHarbingerBudget(s);
  }

  // Step 14: Harbinger tick (Era 7+)
  s = tickHarbinger(s);

  // Step 14b: Corruption tick — ongoing dev loss for corrupted regions
  s = tickCorruption(s);

  // Step 15: Follower Voice tick
  s = tickVoices(s, deltaGameYears);

  // Step 16: Event generation (no-op until Phase 5 provides event templates)
  s = rollEvents(s, deltaGameYears);

  // --- PHASE 6: HOUSEKEEPING ---
  // Step 17: Whisper cooldowns (uses real-time, not game-time)
  // tickWhispers also advances realTimeElapsed
  s = tickWhispers(s, deltaRealSeconds);

  return s;
}
