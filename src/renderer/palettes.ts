// =============================================================================
// DIVINE DOMINION — Renderer Palettes
// Pure data: hex values, gradient stops, and era tints.
// All values sourced from docs/design/art-spec.md — do NOT hardcode elsewhere.
// =============================================================================

import type { TerrainType, EraId } from '../types/game.js';

// -----------------------------------------------------------------------------
// Core UI Colors (art-spec.md §3a)
// -----------------------------------------------------------------------------
export const COLORS = {
  PRIMARY:        '#c9a84c',
  PRIMARY_DARK:   '#8a6a20',
  DANGER:         '#c93040',
  DANGER_LIGHT:   '#cc6666',
  INFO:           '#6a8acc',
  NEUTRAL:        '#b0b0c8',
  TEAL:           '#20aa98',
  PURPLE:         '#6a5acd',
  CYAN:           '#00CED1',
  BG_VOID:        '#06061a',
  BG_SURFACE:     '#0a0820',
  BG_ELEVATED:    '#0c0a24',
  TEXT_PRIMARY:   '#d8d0c0',
  TEXT_SECONDARY: '#8a7a50',
  TEXT_MUTED:     '#5a4a30',
  BORDER_SUBTLE:  'rgba(201,168,76,0.12)',
  BORDER_ACCENT:  'rgba(201,168,76,0.3)',
} as const;

// -----------------------------------------------------------------------------
// Era Background Palette (art-spec.md §3b)
// -----------------------------------------------------------------------------
export interface EraColors {
  primary: string;
  secondary: string;
}

export const ERA_COLORS: Record<EraId, EraColors> = {
  renaissance:   { primary: '#5a4530', secondary: '#3a2a18' },
  exploration:   { primary: '#6a5038', secondary: '#4a3520' },
  enlightenment: { primary: '#7a6548', secondary: '#5a4530' },
  revolution:    { primary: '#8a6a3a', secondary: '#6a4a22' },
  industry:      { primary: '#5a5a5a', secondary: '#3a3a40' },
  empire:        { primary: '#4a4a58', secondary: '#2a2a38' },
  atomic:        { primary: '#3a3a52', secondary: '#1a1a32' },
  digital:       { primary: '#2a2a4a', secondary: '#12122a' },
  signal:        { primary: '#1a2a52', secondary: '#0a1530' },
  revelation:    { primary: '#1a1a42', secondary: '#0a0a25' },
  preparation:   { primary: '#181838', secondary: '#080820' },
  arrival:       { primary: '#12122e', secondary: '#06061a' },
};

// -----------------------------------------------------------------------------
// Terrain Palette (art-spec.md §3c)
// -----------------------------------------------------------------------------
export interface TerrainColors {
  gradientCenter: string;
  gradientEdge: string;
  borderColor: string;
  borderWidth: number;
}

export const TERRAIN_COLORS: Record<TerrainType, TerrainColors> = {
  plains:   { gradientCenter: '#5a9a4a', gradientEdge: '#3a7a2a', borderColor: '#2a6a2a', borderWidth: 2.5 },
  forest:   { gradientCenter: '#2a5a2a', gradientEdge: '#1a4a1a', borderColor: '#1a3a1a', borderWidth: 2.5 },
  desert:   { gradientCenter: '#c9a060', gradientEdge: '#8a7040', borderColor: '#6a5530', borderWidth: 2.5 },
  hills:    { gradientCenter: '#6a7a5a', gradientEdge: '#4a5a3a', borderColor: '#3a4a2a', borderWidth: 2.5 },
  tundra:   { gradientCenter: '#8a9aaa', gradientEdge: '#5a6a7a', borderColor: '#4a5a6a', borderWidth: 2.5 },
  mountain: { gradientCenter: '#5a6878', gradientEdge: '#3a4858', borderColor: '#3a4858', borderWidth: 2.5 },
  coast:    { gradientCenter: '#4a8a68', gradientEdge: '#2a6a4a', borderColor: '#1a5a4a', borderWidth: 2.5 },
  ocean:    { gradientCenter: '#0f1a2a', gradientEdge: '#060812', borderColor: '#060812', borderWidth: 0 },
};

// -----------------------------------------------------------------------------
// Religion Color Palette (art-spec.md §4)
// -----------------------------------------------------------------------------
export interface ReligionColors {
  hex: string;
  overlayOpacity: number;
}

export const RELIGION_COLORS: Record<string, ReligionColors> = {
  player:   { hex: '#c9a84c', overlayOpacity: 0.90 },
  flame:    { hex: '#DC143C', overlayOpacity: 0.50 },
  harvest:  { hex: '#8FBC8F', overlayOpacity: 0.40 },
  deep:     { hex: '#191970', overlayOpacity: 0.50 },
  endings:  { hex: '#4A4A4A', overlayOpacity: 0.45 },
  unity:    { hex: '#FFBF00', overlayOpacity: 0.40 },
  fortress: { hex: '#708090', overlayOpacity: 0.45 },
  covenant: { hex: '#DAA520', overlayOpacity: 0.40 },
  wandering:{ hex: '#008080', overlayOpacity: 0.45 },
  veil:     { hex: '#6A0DAD', overlayOpacity: 0.50 },
  iron:     { hex: '#B22222', overlayOpacity: 0.50 },
};

/** Fallback color for runtime-generated religions not in the preset palette. */
export function getReligionColor(religionId: string): ReligionColors {
  return RELIGION_COLORS[religionId] ?? { hex: '#c9a84c', overlayOpacity: 0.40 };
}

// -----------------------------------------------------------------------------
// Divine Power VFX Parameters (art-spec.md §7)
// -----------------------------------------------------------------------------
export interface VfxParams {
  particleColor: string;
  particleColor2?: string;
  durationMs: number;
  easing: 'ease-out' | 'ease-in' | 'ease-in-out' | 'elastic';
  screenEffect?: 'none' | 'flash' | 'subtle-flash' | 'shake-1px' | 'shake-2px' | 'shake-3px' | 'shake-4px' | 'blue-tint' | 'green-tint' | 'golden-glow' | 'desaturation' | 'orange-flash';
  shakeAmplitudePx?: number;
}

export const POWER_VFX: Record<string, VfxParams> = {
  bountiful_harvest: { particleColor: '#8aaa4a', durationMs: 1200, easing: 'ease-out', screenEffect: 'none' },
  inspiration:       { particleColor: '#88aacc', durationMs: 1000, easing: 'ease-in-out', screenEffect: 'subtle-flash' },
  miracle:           { particleColor: '#c9a84c', particleColor2: '#ffffff', durationMs: 1800, easing: 'elastic', screenEffect: 'shake-1px', shakeAmplitudePx: 1 },
  prophet:           { particleColor: '#c9a84c', durationMs: 1500, easing: 'ease-out', screenEffect: 'none' },
  shield_of_faith:   { particleColor: '#88aacc', durationMs: 800, easing: 'ease-out', screenEffect: 'blue-tint' },
  golden_age:        { particleColor: '#c9a84c', particleColor2: '#8aaa4a', durationMs: 2400, easing: 'ease-in-out', screenEffect: 'shake-2px', shakeAmplitudePx: 2 },
  earthquake:        { particleColor: '#8a7050', durationMs: 1500, easing: 'ease-in', screenEffect: 'shake-4px', shakeAmplitudePx: 4 },
  great_flood:       { particleColor: '#3a6a8a', durationMs: 2000, easing: 'ease-in-out', screenEffect: 'blue-tint' },
  plague:            { particleColor: '#6a8a3a', durationMs: 1200, easing: 'ease-out', screenEffect: 'green-tint' },
  great_storm:       { particleColor: '#5a5a7a', durationMs: 1800, easing: 'ease-in', screenEffect: 'shake-3px', shakeAmplitudePx: 3 },
  famine:            { particleColor: '#8a7040', durationMs: 1000, easing: 'ease-in', screenEffect: 'desaturation' },
  wildfire:          { particleColor: '#cc5522', particleColor2: '#c93040', durationMs: 2000, easing: 'ease-in', screenEffect: 'shake-2px', shakeAmplitudePx: 2 },
};

// -----------------------------------------------------------------------------
// Whisper VFX Parameters (art-spec.md §7c)
// -----------------------------------------------------------------------------
export const WHISPER_VFX = {
  war:     { color: '#c93040', durationMs: 600 },
  peace:   { color: '#6a8acc', durationMs: 600 },
  science: { color: '#b0b0c8', durationMs: 500 },
  faith:   { color: '#c9a84c', durationMs: 500 },
} as const;

// -----------------------------------------------------------------------------
// Harbinger VFX Parameters (art-spec.md §8)
// -----------------------------------------------------------------------------
export const HARBINGER_VFX = {
  corruption:    { color: '#2a0050', color2: '#6a0dad', durationMs: 2000, opacity: { min: 0.3, max: 0.5 } },
  veil:          { color: '#4a2080', durationMs: 2000, opacity: { min: 0.15, max: 0.25 } },
  discord:       { color: '#6a0dad', durationMs: 800, holdMs: 2000, fadeMs: 600, opacity: 0.4 },
  sever:         { color: '#8a20c0', flashColor: '#ffffff', cutMs: 400, flashMs: 200, opacity: 0.7 },
  false_miracle: { color: '#6a0dad', expandMs: 1200, holdMs: 3000, opacity: 0.5 },
  plague_seed:   { color: '#6a8a3a', color2: '#6a0dad', durationMs: 1000, opacity: 0.6 },
  divine_purge:  { color: '#c9a84c', color2: '#ffffff', expandMs: 1500, fadeMs: 500 },
  anomaly:       { color: '#2a0050', cycleDurationMs: 3000, opacity: { min: 0.08, max: 0.15 } },
} as const;

// -----------------------------------------------------------------------------
// Zoom Levels
// -----------------------------------------------------------------------------
export const ZOOM_LEVELS = {
  STRATEGIC: { min: 0.4, max: 0.8, default: 0.6 },
  REGIONAL:  { min: 0.8, max: 1.6, default: 1.0 },
  CLOSEUP:   { min: 1.6, max: 3.0, default: 2.0 },
} as const;

export const CAMERA = {
  ZOOM_MIN: 0.4,
  ZOOM_MAX: 3.0,
  ZOOM_DEFAULT: 0.6,
  PAN_INERTIA: 0.9,       // velocity retention per frame
  ZOOM_WHEEL_FACTOR: 0.001,
  ZOOM_PINCH_SENSITIVITY: 0.01,
  TWEEN_DURATION_MS: 300,
} as const;
