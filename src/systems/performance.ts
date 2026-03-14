// =============================================================================
// DIVINE DOMINION — Performance Optimization System
// FPS monitoring, quality tier detection, tick budget enforcement, culling.
// Spec: docs/implementation/phase-6.md §6.4
// Spec: docs/design/test-spec.md §4 Performance Budget, §12 Device Testing Matrix
// =============================================================================

// -----------------------------------------------------------------------------
// Quality Tier
// -----------------------------------------------------------------------------

export type QualityTier = 'normal' | 'low';

export interface QualitySettings {
  tier: QualityTier;
  maxParticleEmitters: number;
  maxParticlesPerEmitter: number;
  terrainDetail: 'textured' | 'flat';
  clouds: boolean;
  vegetationSway: boolean;
  cityGlow: 'animated' | 'static';
  tradeRouteParticles: 'flowing' | 'static';
  screenShake: boolean;
  ambientMapLife: 'full' | 'minimal';
  divineVfxDurationMultiplier: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualitySettings> = {
  normal: {
    tier: 'normal',
    maxParticleEmitters: 6,
    maxParticlesPerEmitter: 50,
    terrainDetail: 'textured',
    clouds: true,
    vegetationSway: true,
    cityGlow: 'animated',
    tradeRouteParticles: 'flowing',
    screenShake: true,
    ambientMapLife: 'full',
    divineVfxDurationMultiplier: 1.0,
  },
  low: {
    tier: 'low',
    maxParticleEmitters: 3,
    maxParticlesPerEmitter: 25,
    terrainDetail: 'flat',
    clouds: false,
    vegetationSway: false,
    cityGlow: 'static',
    tradeRouteParticles: 'static',
    screenShake: false,
    ambientMapLife: 'minimal',
    divineVfxDurationMultiplier: 0.5,
  },
};

// -----------------------------------------------------------------------------
// FPS Monitor
// -----------------------------------------------------------------------------

export interface FPSMonitor {
  /** Record a frame timestamp (performance.now() value). */
  recordFrame(nowMs: number): void;
  /** Returns current FPS averaged over the last second. */
  getCurrentFPS(): number;
  /** Returns samples array (one per second of measurement). */
  getSamples(): number[];
  /** Resets all samples. */
  reset(): void;
}

/**
 * Creates an FPS monitor that samples once per second for quality tier detection.
 * Spec: §4 Detection Logic
 */
export function createFPSMonitor(): FPSMonitor {
  const samples: number[] = [];
  let frameCount = 0;
  let lastSampleTime = -1;
  let currentFPS = 60;

  return {
    recordFrame(nowMs: number): void {
      if (lastSampleTime < 0) {
        lastSampleTime = nowMs;
        frameCount = 0;
        return;
      }

      frameCount++;
      const elapsed = nowMs - lastSampleTime;

      // Sample every ~1000ms
      if (elapsed >= 1000) {
        currentFPS = Math.round(frameCount / (elapsed / 1000));
        samples.push(currentFPS);
        frameCount = 0;
        lastSampleTime = nowMs;
      }
    },

    getCurrentFPS(): number {
      return currentFPS;
    },

    getSamples(): number[] {
      return [...samples];
    },

    reset(): void {
      samples.length = 0;
      frameCount = 0;
      lastSampleTime = -1;
      currentFPS = 60;
    },
  };
}

// -----------------------------------------------------------------------------
// Quality Tier Detection
// -----------------------------------------------------------------------------

/**
 * Determines the quality tier based on FPS samples.
 * Spec: §4 Detection Logic and §12 LOW-QUALITY Tier Detection
 *
 * Triggered when:
 *   - avgFPS < 35 across 30 samples, OR
 *   - 5+ samples below 30 fps
 */
export function detectQualityTier(samples: number[]): QualityTier {
  if (samples.length === 0) return 'normal';

  const avgFPS = samples.reduce((a, b) => a + b, 0) / samples.length;
  const lowCount = samples.filter(s => s < 30).length;

  if (lowCount >= 5) return 'low';
  if (avgFPS < 35) return 'low';
  return 'normal';
}

// -----------------------------------------------------------------------------
// Tick Budget Monitor
// -----------------------------------------------------------------------------

export interface TickBudgetMonitor {
  /** Mark the start of a simulation tick. */
  startTick(): void;
  /** Mark the end of a simulation tick. Returns elapsed ms. */
  endTick(): number;
  /** Returns the last tick duration in ms. */
  getLastTickMs(): number;
  /** Returns average tick duration over recent ticks. */
  getAverageTickMs(): number;
  /** Returns true if the last tick exceeded the target budget. */
  isOverBudget(): boolean;
}

/** Max tick time before a warning (12ms target, 16ms max — one frame at 60fps). */
const TICK_BUDGET_TARGET_MS = 12;
const TICK_BUDGET_MAX_MS = 16;
const BUDGET_HISTORY_SIZE = 60;

/**
 * Creates a tick budget monitor.
 * Spec: §4 Performance Budget — max tick time 12ms target, 16ms max.
 */
export function createTickBudgetMonitor(): TickBudgetMonitor {
  const history: number[] = [];
  let lastTickStart = 0;
  let lastTickMs = 0;

  return {
    startTick(): void {
      lastTickStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
    },

    endTick(): number {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      lastTickMs = now - lastTickStart;
      history.push(lastTickMs);
      if (history.length > BUDGET_HISTORY_SIZE) history.shift();
      return lastTickMs;
    },

    getLastTickMs(): number {
      return lastTickMs;
    },

    getAverageTickMs(): number {
      if (history.length === 0) return 0;
      return history.reduce((a, b) => a + b, 0) / history.length;
    },

    isOverBudget(): boolean {
      return lastTickMs > TICK_BUDGET_MAX_MS;
    },
  };
}

// -----------------------------------------------------------------------------
// Army Culling (off-screen)
// -----------------------------------------------------------------------------

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorldPosition {
  x: number;
  y: number;
}

/**
 * Returns true if the given world position is visible in the viewport.
 * Used to cull off-screen army rendering.
 * Spec: §4 — max 20 armies on screen; beyond 20 cull off-screen.
 */
export function isInViewport(position: WorldPosition, viewport: Viewport, margin = 64): boolean {
  return (
    position.x >= viewport.x - margin &&
    position.x <= viewport.x + viewport.width + margin &&
    position.y >= viewport.y - margin &&
    position.y <= viewport.y + viewport.height + margin
  );
}

/**
 * Filters a list of army IDs + positions to those visible in the viewport.
 * Caps at MAX_ARMIES_ON_SCREEN if more would be visible.
 */
const MAX_ARMIES_ON_SCREEN = 20;

export function cullArmies<T extends { position: WorldPosition; id: string }>(
  armies: T[],
  viewport: Viewport,
): T[] {
  const visible = armies.filter(a => isInViewport(a.position, viewport));
  if (visible.length <= MAX_ARMIES_ON_SCREEN) return visible;
  // Keep the MAX_ARMIES_ON_SCREEN closest to viewport center
  const cx = viewport.x + viewport.width / 2;
  const cy = viewport.y + viewport.height / 2;
  return visible
    .map(a => ({
      army: a,
      dist: Math.hypot(a.position.x - cx, a.position.y - cy),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, MAX_ARMIES_ON_SCREEN)
    .map(({ army }) => army);
}

// -----------------------------------------------------------------------------
// Performance Manager (state object)
// -----------------------------------------------------------------------------

export interface PerformanceManager {
  fpsMonitor: FPSMonitor;
  tickBudget: TickBudgetMonitor;
  qualityTier: QualityTier;
  settings: QualitySettings;
  /** Manually override quality tier. */
  setQualityTier(tier: QualityTier): void;
  /** Update quality tier from FPS samples (auto-detect). */
  autoDetectQuality(): void;
}

/**
 * Creates the performance manager singleton.
 */
export function createPerformanceManager(
  initialTier: QualityTier = 'normal',
): PerformanceManager {
  const fpsMonitor = createFPSMonitor();
  const tickBudget = createTickBudgetMonitor();
  let qualityTier: QualityTier = initialTier;
  let settings: QualitySettings = QUALITY_PRESETS[initialTier];

  const manager: PerformanceManager = {
    get fpsMonitor() { return fpsMonitor; },
    get tickBudget() { return tickBudget; },
    get qualityTier() { return qualityTier; },
    get settings() { return settings; },

    setQualityTier(tier: QualityTier): void {
      qualityTier = tier;
      settings = QUALITY_PRESETS[tier];
    },

    autoDetectQuality(): void {
      const samples = fpsMonitor.getSamples();
      const detected = detectQualityTier(samples);
      if (detected !== qualityTier) {
        qualityTier = detected;
        settings = QUALITY_PRESETS[detected];
      }
    },
  };

  return manager;
}
