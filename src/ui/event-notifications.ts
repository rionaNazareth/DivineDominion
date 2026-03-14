// =============================================================================
// DIVINE DOMINION — Event Notification System (Task 3.5)
// Toast notifications, event cards, event queue, milestone toasts.
// =============================================================================

import type { GameEvent, EventChoice } from '../types/game.js';
import { UI } from '../config/constants.js';

// ---------------------------------------------------------------------------
// Toast types
// ---------------------------------------------------------------------------

export type ToastStyle = 'event_choice' | 'informational' | 'milestone' | 'session_milestone' | 'combo';

export interface ToastNotification {
  id: string;
  style: ToastStyle;
  title: string;
  subtitle?: string;
  autoDismissMs: number | null; // null = never auto-dismiss
  /** If set, tapping opens the event card */
  eventId?: string;
  queueCount?: number; // badge showing "2 events need attention"
}

export function buildEventToast(event: GameEvent, queueCount: number): ToastNotification {
  const isChoice = event.choices && event.choices.length > 0;
  return {
    id: `toast_event_${event.id}`,
    style: isChoice ? 'event_choice' : 'informational',
    title: event.title,
    subtitle: event.description.slice(0, 80),
    autoDismissMs: isChoice ? null : UI.TOAST_INFORMATIONAL_DURATION_MS,
    eventId: event.id,
    queueCount: queueCount > 1 ? queueCount : undefined,
  };
}

export function buildMilestoneToast(text: string): ToastNotification {
  return {
    id: `toast_milestone_${Date.now()}`,
    style: 'milestone',
    title: text,
    autoDismissMs: UI.TOAST_MILESTONE_DURATION_MS,
  };
}

export function buildComboToast(comboName: string, outcomeText: string): ToastNotification {
  return {
    id: `toast_combo_${Date.now()}`,
    style: 'combo',
    title: comboName,
    subtitle: outcomeText,
    autoDismissMs: UI.COMBO_TOAST_DURATION_MS,
  };
}

// ---------------------------------------------------------------------------
// Event queue (priority order)
// ---------------------------------------------------------------------------

export type EventPriority = 'conflict' | 'alien' | 'religious' | 'political' | 'other';

const PRIORITY_ORDER: EventPriority[] = ['conflict', 'alien', 'religious', 'political', 'other'];

function getEventPriority(event: GameEvent): EventPriority {
  if (event.alienCaused) return 'alien';
  switch (event.category) {
    case 'military':  return 'conflict';
    case 'alien':     return 'alien';
    case 'religious': return 'religious';
    case 'political': return 'political';
    default:          return 'other';
  }
}

export const EVENT_QUEUE_MAX = UI.EVENT_QUEUE_MAX;

export interface EventQueueState {
  pending: GameEvent[];
  currentEvent: GameEvent | null;
  autoResolvedCount: number;
}

export function createEventQueueState(): EventQueueState {
  return { pending: [], currentEvent: null, autoResolvedCount: 0 };
}

export function enqueueEvent(
  state: EventQueueState,
  event: GameEvent,
): EventQueueState {
  if (state.currentEvent === null) {
    return { ...state, currentEvent: event };
  }

  if (state.pending.length < EVENT_QUEUE_MAX - 1) {
    const pending = [...state.pending, event].sort((a, b) => {
      const pa = PRIORITY_ORDER.indexOf(getEventPriority(a));
      const pb = PRIORITY_ORDER.indexOf(getEventPriority(b));
      return pa - pb;
    });
    return { ...state, pending };
  }

  // Queue is full — auto-resolve excess with "Stay Silent"
  return { ...state, autoResolvedCount: state.autoResolvedCount + 1 };
}

export function resolveCurrentEvent(
  state: EventQueueState,
  _choiceIndex: number, // -1 = Stay Silent
): EventQueueState {
  if (state.pending.length === 0) {
    return { ...state, currentEvent: null };
  }
  const [next, ...rest] = state.pending;
  return { ...state, currentEvent: next, pending: rest };
}

export function getQueueBadgeCount(state: EventQueueState): number {
  if (state.currentEvent === null) return 0;
  return state.pending.length + 1;
}

// ---------------------------------------------------------------------------
// Event card data model
// ---------------------------------------------------------------------------

export interface FollowerStakes {
  nationAName: string;
  nationAFollowers: number;
  nationARole: string;
  nationBName?: string;
  nationBFollowers?: number;
  nationBRole?: string;
}

export interface EventCardData {
  event: GameEvent;
  scopeBadge: string;         // e.g. "Kingdom of Valdorn"
  followerStakes?: FollowerStakes;
  affectedRegionIds: string[];
  isOffScreen: boolean;        // whether affected regions are off-screen
  choices: EventChoiceDisplay[];
}

export interface EventChoiceDisplay {
  choice: EventChoice;
  index: number;
  label: string;
  consequencePreview: string;
}

export function buildEventCardChoices(event: GameEvent): EventChoiceDisplay[] {
  const choices: EventChoiceDisplay[] = (event.choices ?? []).map((choice, i) => ({
    choice,
    index: i,
    label: choice.label,
    consequencePreview: choice.description,
  }));

  // Always append Stay Silent
  choices.push({
    choice: {
      label: 'Stay Silent',
      description: 'Do not intervene. The outcome unfolds without divine guidance.',
      outcome: { effects: {}, narrativeText: 'The divine remains silent.' },
    },
    index: -1,
    label: 'Stay Silent',
    consequencePreview: 'No divine intervention.',
  });

  return choices;
}

// ---------------------------------------------------------------------------
// Session milestone tracker
// ---------------------------------------------------------------------------

export interface SessionMilestoneTracker {
  eventsResolved: number;
  divineActs: number;
  whispersCast: number;
  eraTransitions: number;
  sessionStartMs: number;
  lastMilestoneMs: number;
}

export function createSessionTracker(nowMs: number): SessionMilestoneTracker {
  return {
    eventsResolved: 0,
    divineActs: 0,
    whispersCast: 0,
    eraTransitions: 0,
    sessionStartMs: nowMs,
    lastMilestoneMs: nowMs,
  };
}

const SESSION_MILESTONE_COOLDOWN_MS = 2 * 60 * 1000; // 2 real-minutes

export function checkSessionMilestone(
  tracker: SessionMilestoneTracker,
  nowMs: number,
): { toast: ToastNotification | null; tracker: SessionMilestoneTracker } {
  if (nowMs - tracker.lastMilestoneMs < SESSION_MILESTONE_COOLDOWN_MS) {
    return { toast: null, tracker };
  }

  let text: string | null = null;

  if (tracker.eventsResolved === 3) text = '3 prayers answered this session.';
  else if (tracker.eventsResolved === 5) text = '5 prayers answered. Your faithful feel your presence.';
  else if (tracker.divineActs === 3) text = '3 divine acts. The world bends to your will.';
  else if (tracker.whispersCast === 1) text = 'Your first whisper. Small nudges shape worlds.';
  else if (tracker.eraTransitions >= 1) text = 'A new era begins under your watch.';
  else if ((nowMs - tracker.sessionStartMs) >= 10 * 60 * 1000) text = '10 minutes of divine guidance. Your mark is left.';

  if (!text) return { toast: null, tracker };

  return {
    toast: {
      id: `session_milestone_${nowMs}`,
      style: 'session_milestone',
      title: text,
      autoDismissMs: 3000,
    },
    tracker: { ...tracker, lastMilestoneMs: nowMs },
  };
}
