// =============================================================================
// DIVINE DOMINION — Analytics System
// PostHog-compatible event tracking. Privacy-compliant, opt-in only.
// Spec: docs/implementation/phase-6.md §6.3
// =============================================================================

import type { CommandmentId, EndingType, PowerId } from '../types/game.js';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
}

export interface AnalyticsConfig {
  apiKey: string;
  host?: string;
  enabled: boolean;
}

// In-memory queue for events when analytics not yet initialized
let _eventQueue: AnalyticsEvent[] = [];
let _config: AnalyticsConfig | null = null;
let _optedIn = false;

// PostHog-compatible minimal client (no external dependency required)
// Full PostHog SDK is loaded lazily via the app bootstrap if opted in.

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

/**
 * Initializes analytics. Must be called after user opt-in.
 * Until initialized, events are queued but not sent.
 */
export function initAnalytics(config: AnalyticsConfig): void {
  _config = config;
  if (config.enabled) {
    _optedIn = true;
    flushQueue();
  }
}

/**
 * User opts in to analytics. Enables event tracking and flushes the queue.
 */
export function optInToAnalytics(): void {
  _optedIn = true;
  if (_config) flushQueue();
}

/**
 * User opts out of analytics. Disables event tracking.
 */
export function optOutOfAnalytics(): void {
  _optedIn = false;
  _eventQueue = [];
}

export function isAnalyticsEnabled(): boolean {
  return _optedIn;
}

// -----------------------------------------------------------------------------
// Core event capture
// -----------------------------------------------------------------------------

/**
 * Captures an analytics event. If opted in and initialized, sends immediately.
 * Otherwise, queues for later (up to SESSION_QUEUE_MAX events).
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  const analyticsEvent: AnalyticsEvent = { event, properties };

  if (_optedIn && _config?.enabled) {
    sendEvent(analyticsEvent);
  } else {
    // Queue up to 100 events; drop oldest beyond that
    _eventQueue.push(analyticsEvent);
    if (_eventQueue.length > 100) _eventQueue.shift();
  }
}

function flushQueue(): void {
  const queue = [..._eventQueue];
  _eventQueue = [];
  for (const event of queue) {
    sendEvent(event);
  }
}

function sendEvent(event: AnalyticsEvent): void {
  if (!_config?.enabled || !_optedIn) return;

  const host = _config.host ?? 'https://app.posthog.com';
  const payload = {
    api_key: _config.apiKey,
    event: event.event,
    properties: {
      ...(event.properties ?? {}),
      $lib: 'divine-dominion',
      $lib_version: '0.1.0',
    },
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget — we never block gameplay for analytics
  if (typeof fetch !== 'undefined') {
    fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently drop on failure — analytics should never affect gameplay
    });
  }
}

// -----------------------------------------------------------------------------
// Typed event helpers
// -----------------------------------------------------------------------------

/** Tracks when a commandment selection is finalized. */
export function trackCommandmentSelected(commandments: CommandmentId[], archetype: string): void {
  capture('commandment_selection_finalized', {
    commandments,
    archetype,
    commandment_count: commandments.length,
  });
}

/** Tracks commandment popularity (one event per commandment selected). */
export function trackCommandmentPopularity(commandmentId: CommandmentId): void {
  capture('commandment_selected', { commandment_id: commandmentId });
}

/** Tracks when a divine power is cast. */
export function trackPowerCast(powerId: PowerId, era: string): void {
  capture('power_cast', { power_id: powerId, era });
}

/** Tracks win/loss outcome with key stats. */
export function trackGameOutcome(
  outcome: 'win' | 'loss',
  endingType: EndingType,
  earthNumber: number,
  sessionLengthSeconds: number,
  scienceLevel: number,
  totalInterventions: number,
): void {
  capture('game_ended', {
    outcome,
    ending_type: endingType,
    earth_number: earthNumber,
    session_length_seconds: sessionLengthSeconds,
    science_level: scienceLevel,
    total_interventions: totalInterventions,
  });
}

/** Tracks era transitions for pacing analytics. */
export function trackEraReached(eraId: string, realTimeSeconds: number): void {
  capture('era_reached', { era_id: eraId, real_time_seconds: realTimeSeconds });
}

/** Tracks divine power usage distribution. */
export function trackPowerUsage(
  powerId: PowerId,
  blessings: number,
  disasters: number,
): void {
  capture('power_usage', {
    power_id: powerId,
    total_blessings: blessings,
    total_disasters: disasters,
  });
}

/** Tracks session length for engagement analytics. */
export function trackSessionLength(seconds: number, ticks: number): void {
  capture('session_length', { seconds, ticks });
}

/** Tracks sharing events. */
export function trackShareAction(method: 'native' | 'clipboard' | 'cancelled'): void {
  capture('share_action', { method });
}
