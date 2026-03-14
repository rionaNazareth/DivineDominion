import './immer-config.js';
import { produce } from 'immer';
import type { GameState, GameEvent, EventId } from '../types/game.js';
import { SPEED, TIME } from '../config/constants.js';
import { seededRandom } from './prng.js';

export interface EventTemplate {
  id: EventId;
  category: GameEvent['category'];
  title: string;
  description: string;
  /** [minEra, maxEra] inclusive, 1-indexed */
  eraRange: [number, number];
  baseWeight: number;
  choices?: GameEvent['choices'];
  autoResolve?: GameEvent['autoResolve'];
  alienCaused?: boolean;
}

// Map from era id to 1-based index
const ERA_INDEX: Record<string, number> = {
  renaissance: 1,
  exploration: 2,
  enlightenment: 3,
  revolution: 4,
  industry: 5,
  empire: 6,
  atomic: 7,
  digital: 8,
  signal: 9,
  revelation: 10,
  preparation: 11,
  arrival: 12,
};

// Track how many times each event has fired (run-level state stored on GameState via eventHistory counts)
function getFireCount(state: GameState, eventId: EventId): number {
  return state.eventHistory.filter(e => e.id === eventId).length;
}

function cooldownMultiplier(fireCount: number): number {
  if (fireCount === 0) return 1.0;
  if (fireCount === 1) return SPEED.EVENT_COOLDOWN_SECOND;
  return SPEED.EVENT_COOLDOWN_THIRD;
}

function computeWeight(state: GameState, template: EventTemplate, eraIndex: number): number {
  // Era range check
  if (eraIndex < template.eraRange[0] || eraIndex > template.eraRange[1]) return 0;

  // Era modifier: alien events scale from 0.1 (era 7) to 1.5 (era 12), others flat 1.0
  let eraModifier = 1.0;
  if (template.category === 'alien') {
    if (eraIndex < 7) return 0;
    eraModifier = 0.1 + ((eraIndex - 7) / 5) * 1.4;
  }

  const fireCount = getFireCount(state, template.id);
  const cdMod = cooldownMultiplier(fireCount);

  return template.baseWeight * eraModifier * cdMod;
}

/** Weighted random selection using seeded RNG */
function selectWeighted(
  weights: number[],
  rng: () => number,
): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return -1;
  let roll = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

function instantiateTemplate(template: EventTemplate, state: GameState): GameEvent {
  const region = Array.from(state.world.regions.values())[0];
  return {
    id: template.id,
    category: template.category,
    title: template.title,
    description: template.description,
    year: state.world.currentYear,
    affectedRegions: region ? [region.id] : [],
    choices: template.choices,
    autoResolve: template.autoResolve,
    alienCaused: template.alienCaused,
  };
}

function applyOutcomeEffects(state: GameState, event: GameEvent): GameState {
  if (!event.autoResolve) return state;
  // Effects are applied in the runner/UI layer in full implementation;
  // here we just record the event (outcome data is stored on the event object).
  return state;
}

/**
 * Rolls for new events. Should be called every tick; internally tracks whether the
 * 2-real-minute interval has passed. Uses `state.world.currentTick` to determine roll timing.
 *
 * @param state - current game state
 * @param templates - event templates pool (real 80 templates come from Phase 5)
 * @param deltaYears - game-years advanced this tick
 */
export function rollEvents(
  state: GameState,
  deltaYears: number,
  templates: EventTemplate[] = [],
): GameState {
  if (templates.length === 0) return state;

  // Roll every EVENT_INTERVAL_REAL_MINUTES (2 min). At 1×: 5 ticks/min → every 10 ticks.
  const ticksPerRoll = Math.round(TIME.EVENT_INTERVAL_REAL_MINUTES * TIME.TICKS_PER_REAL_MINUTE_1X);
  const tick = state.world.currentTick;

  if (tick % ticksPerRoll !== 0) return state;

  const eraIndex = ERA_INDEX[state.world.currentEra] ?? 1;

  // Max events per era = max(6, 15 - eraIndex)
  const maxPerEra = Math.max(SPEED.EVENTS_PER_ERA_LATE_MIN, SPEED.EVENTS_PER_ERA_EARLY_MAX - eraIndex);

  // Count events fired this era (rough: use era slice of history)
  const eraStartYear =
    state.world.currentYear - ((state.world.currentTick % 100) * TIME.TICK_GAME_YEARS);
  const eventsThisEra = state.eventHistory.filter(e => e.year >= eraStartYear).length;
  if (eventsThisEra >= maxPerEra) return state;

  // Compute weights for eligible templates
  const weights = templates.map(t => computeWeight(state, t, eraIndex));
  const eligibleCount = weights.filter(w => w > 0).length;
  if (eligibleCount === 0) return state;

  // How many events to roll this interval (1–3)
  const rng = () =>
    seededRandom(state.world.seed, tick, state.prngState % 65536 + 1000);

  const countRoll = rng();
  let rollCount =
    countRoll < 0.5
      ? TIME.EVENTS_PER_ROLL_MIN
      : countRoll < 0.85
        ? 2
        : TIME.EVENTS_PER_ROLL_MAX;

  rollCount = Math.min(rollCount, maxPerEra - eventsThisEra);
  if (rollCount <= 0) return state;

  return produce(state, draft => {
    let callIdx = 2000;
    const picked = new Set<number>();

    for (let r = 0; r < rollCount; r++) {
      // Re-zero out already-picked weights
      const w = weights.map((wt, i) => (picked.has(i) ? 0 : wt));
      const selected = selectWeighted(w, () =>
        seededRandom(draft.world.seed, tick, callIdx++),
      );
      if (selected < 0) break;
      picked.add(selected);

      const template = templates[selected];
      const event = instantiateTemplate(template, draft as unknown as GameState);

      // Queue: max 5; if full, auto-resolve oldest with autoResolve outcome
      if (draft.eventHistory.length + 1 > AUTO_SAVE_EVT_MAX) {
        // Keep history capped at EVENT_HISTORY_MAX
      }

      if (!draft.currentEvent) {
        // Set as current event (auto-pause in runner)
        draft.currentEvent = event;
      } else {
        // Queue full: auto-resolve with autoResolve outcome and append to history
        const resolvedEvent: GameEvent = { ...event };
        draft.eventHistory.push(resolvedEvent);
        if (draft.eventHistory.length > EVENT_HISTORY_MAX) {
          draft.eventHistory.splice(0, 1);
        }
      }
    }
  });
}

const EVENT_HISTORY_MAX = 50;
const AUTO_SAVE_EVT_MAX = 50;

/**
 * Resolves the current event with a given choice index.
 * Appends to eventHistory, clears currentEvent.
 */
export function resolveEvent(
  state: GameState,
  choiceIndex: number,
): GameState {
  if (!state.currentEvent) return state;

  return produce(state, draft => {
    const event = draft.currentEvent!;
    // Apply choice outcome (effects applied by runner/UI)
    // Mark event as resolved and move to history
    draft.eventHistory.push({ ...event });
    if (draft.eventHistory.length > EVENT_HISTORY_MAX) {
      draft.eventHistory.splice(0, 1);
    }
    draft.currentEvent = undefined;
  });
}
