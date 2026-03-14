// =============================================================================
// DIVINE DOMINION — Game HUD (Task 3.3)
// Pure data/logic for the minimal top-bar HUD.
// DOM rendering attaches to a fixed-position overlay element.
// =============================================================================

import type { GameState } from '../types/game.js';
import { ERAS } from '../config/constants.js';
import { eraName } from '../renderer/era-utils.js';

// ---------------------------------------------------------------------------
// HUD snapshot — derived from GameState, passed to renderer
// ---------------------------------------------------------------------------

export interface HudSnapshot {
  year: number;
  eraDisplayName: string;
  energy: number;
  maxEnergy: number;
  speedMultiplier: 1 | 2 | 4;
  isPaused: boolean;
  prayerCount: number;           // pending petitions
  hasHereticPetition: boolean;   // red pulse if true
  overlayActive: boolean;
  leftHandMode: boolean;
  fontScaling: number;
  highContrast: boolean;
}

export function buildHudSnapshot(
  state: GameState,
  isPaused: boolean,
  leftHandMode: boolean,
  fontScaling: number,
  highContrast: boolean,
): HudSnapshot {
  const year = state.world.currentYear;
  const era = getEraForYear(year);
  const prayerCount = state.voiceRecords.filter(v => v.currentPetition !== null).length;
  const hasHereticPetition = state.voiceRecords.some(
    v => v.type === 'heretic' && v.currentPetition !== null,
  );

  return {
    year,
    eraDisplayName: era ? eraName(era.id) : '',
    energy: state.divineState.energy,
    maxEnergy: state.divineState.maxEnergy,
    speedMultiplier: state.speedMultiplier,
    isPaused,
    prayerCount,
    hasHereticPetition,
    overlayActive: state.divineOverlayActive,
    leftHandMode,
    fontScaling,
    highContrast,
  };
}

function getEraForYear(year: number): (typeof ERAS)[number] | undefined {
  return ERAS.find(e => year >= e.startYear && year < e.endYear) ?? ERAS[ERAS.length - 1];
}

// ---------------------------------------------------------------------------
// HUD visibility rules
// ---------------------------------------------------------------------------

export type HudVisibilityState = 'full' | 'dimmed' | 'hidden';

export function getHudVisibility(state: GameState): HudVisibilityState {
  if (state.phase === 'era_transition') return 'hidden';
  if (state.phase === 'event_choice') return 'dimmed';
  return 'full';
}

// ---------------------------------------------------------------------------
// Speed control helpers
// ---------------------------------------------------------------------------

export type SpeedOption = 1 | 2 | 4;

export function cycleSpeed(current: SpeedOption): SpeedOption {
  const cycle: SpeedOption[] = [1, 2, 4];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}

export function speedLabel(speed: SpeedOption): string {
  return `${speed}×`;
}

// ---------------------------------------------------------------------------
// Energy display
// ---------------------------------------------------------------------------

export interface EnergyTooltip {
  current: number;
  max: number;
  regenPerMinute: number;
  minutesToFull: number;
}

export function buildEnergyTooltip(state: GameState): EnergyTooltip {
  const { energy, maxEnergy, regenPerMinute } = state.divineState;
  const remaining = maxEnergy - energy;
  const minutesToFull = regenPerMinute > 0 ? remaining / regenPerMinute : Infinity;
  return { current: energy, max: maxEnergy, regenPerMinute, minutesToFull };
}

// ---------------------------------------------------------------------------
// Prayer counter helpers
// ---------------------------------------------------------------------------

export function getPrayerCountLabel(count: number): string {
  if (count === 0) return '';
  return String(count);
}

export function getNearestPetitionRegionId(state: GameState): string | null {
  const withPetition = state.voiceRecords.filter(v => v.currentPetition !== null);
  if (withPetition.length === 0) return null;
  // Return the first one — camera pan logic handled in GameScene
  return withPetition[0].regionId;
}

// ---------------------------------------------------------------------------
// Screen reader labels (WCAG AA)
// ---------------------------------------------------------------------------

export function getFabAriaLabel(): string {
  return 'Divine powers. Tap to open.';
}

export function getEnergyAriaLabel(energy: number, max: number): string {
  return `Divine energy: ${energy} of ${max}.`;
}

export function getPrayerAriaLabel(count: number): string {
  if (count === 0) return '';
  return `${count} prayer${count !== 1 ? 's' : ''} pending. Tap to view.`;
}

export function getSpeedAriaLabel(speed: SpeedOption): string {
  return `Simulation speed: ${speed} times.`;
}
