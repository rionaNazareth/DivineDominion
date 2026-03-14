// =============================================================================
// DIVINE DOMINION — App Bootstrap
// Wires analytics, performance, and Capacitor plugins at startup.
// Called once from the top-level entry point (main.ts).
// =============================================================================

import { initAnalytics, optInToAnalytics, optOutOfAnalytics } from './analytics.js';
import { createPerformanceManager, type QualityTier } from './performance.js';
import { loadSettings, patchSettings } from '../ui/settings-store.js';

// PostHog API key — injected at build time via Vite env variable.
// Set VITE_POSTHOG_KEY in your .env file.
// Defaults to empty string (analytics disabled) if not set.
const POSTHOG_API_KEY = (
  typeof import.meta !== 'undefined' &&
  // @ts-expect-error — Vite env injection
  import.meta.env?.VITE_POSTHOG_KEY
) || '';

const POSTHOG_HOST = (
  typeof import.meta !== 'undefined' &&
  // @ts-expect-error — Vite env injection
  import.meta.env?.VITE_POSTHOG_HOST
) || 'https://app.posthog.com';

// Module-level performance manager singleton
let _performanceManager: ReturnType<typeof createPerformanceManager> | null = null;

/**
 * Returns the global performance manager (created during bootstrap).
 */
export function getPerformanceManager(): ReturnType<typeof createPerformanceManager> {
  if (!_performanceManager) {
    _performanceManager = createPerformanceManager('normal');
  }
  return _performanceManager;
}

// -----------------------------------------------------------------------------
// Analytics bootstrap
// -----------------------------------------------------------------------------

/**
 * Initializes analytics based on stored opt-in preference.
 * If the user has previously opted in and a PostHog key is configured, starts tracking.
 * If opt-in status is null (never asked), analytics stays silent until the user decides.
 */
export function bootstrapAnalytics(): void {
  const settings = loadSettings();
  const hasKey = POSTHOG_API_KEY.length > 0;

  initAnalytics({
    apiKey: POSTHOG_API_KEY,
    host: POSTHOG_HOST,
    enabled: hasKey && settings.analyticsOptIn === true,
  });

  if (hasKey && settings.analyticsOptIn === true) {
    optInToAnalytics();
  }
}

/**
 * Called when the user explicitly opts in to analytics from the Settings screen.
 */
export function handleAnalyticsOptIn(): void {
  patchSettings({ analyticsOptIn: true });
  optInToAnalytics();
}

/**
 * Called when the user explicitly opts out of analytics from the Settings screen.
 */
export function handleAnalyticsOptOut(): void {
  patchSettings({ analyticsOptIn: false });
  optOutOfAnalytics();
}

// -----------------------------------------------------------------------------
// Performance bootstrap
// -----------------------------------------------------------------------------

/**
 * Initializes the performance manager with the stored quality preference.
 */
export function bootstrapPerformance(): void {
  const settings = loadSettings();
  const pm = createPerformanceManager('normal');

  if (settings.qualityOverride !== 'auto') {
    pm.setQualityTier(settings.qualityOverride as QualityTier);
  }

  _performanceManager = pm;
}

/**
 * Called when the user changes quality override in Settings.
 */
export function handleQualityChange(tier: 'auto' | 'normal' | 'low'): void {
  patchSettings({ qualityOverride: tier });
  const pm = getPerformanceManager();
  if (tier === 'auto') {
    pm.autoDetectQuality();
  } else {
    pm.setQualityTier(tier as QualityTier);
  }
}

// -----------------------------------------------------------------------------
// Full bootstrap entry
// -----------------------------------------------------------------------------

/**
 * Main bootstrap function — called once from the app entry point (main.ts).
 * Order matters: performance before analytics (performance is synchronous and cheap).
 */
export function bootstrap(): void {
  bootstrapPerformance();
  bootstrapAnalytics();
}
