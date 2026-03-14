// =============================================================================
// DIVINE DOMINION — Divine Overlay UI (Task 3.7)
// Layer picker, overlay state machine, visibility rules.
// =============================================================================

import type { GameState, EraId } from '../types/game.js';
import { HARBINGER } from '../config/constants.js';
import { eraIndex } from '../renderer/era-utils.js';

// ---------------------------------------------------------------------------
// Overlay layer definitions
// ---------------------------------------------------------------------------

export type OverlayLayer = 'religion' | 'military' | 'trade' | 'science';

export interface OverlayLayerDefinition {
  id: OverlayLayer;
  label: string;
  unlockCondition: 'always' | 'after_first_war' | 'after_first_trade' | 'after_first_science';
}

export const OVERLAY_LAYERS: OverlayLayerDefinition[] = [
  { id: 'religion', label: 'Religion',  unlockCondition: 'always' },
  { id: 'military', label: 'Military',  unlockCondition: 'after_first_war' },
  { id: 'trade',    label: 'Trade',     unlockCondition: 'after_first_trade' },
  { id: 'science',  label: 'Science',   unlockCondition: 'after_first_science' },
];

// ---------------------------------------------------------------------------
// Overlay state
// ---------------------------------------------------------------------------

export interface DivineOverlayState {
  active: boolean;
  activeLayer: OverlayLayer;
  unlockedLayers: Set<OverlayLayer>;
}

export function createOverlayState(): DivineOverlayState {
  return {
    active: false,
    activeLayer: 'religion',
    unlockedLayers: new Set(['religion']),
  };
}

export function toggleOverlay(state: DivineOverlayState): DivineOverlayState {
  return { ...state, active: !state.active };
}

export function setOverlayLayer(state: DivineOverlayState, layer: OverlayLayer): DivineOverlayState {
  if (!state.unlockedLayers.has(layer)) return state;
  return { ...state, activeLayer: layer };
}

export function unlockOverlayLayer(
  state: DivineOverlayState,
  layer: OverlayLayer,
): DivineOverlayState {
  const next = new Set(state.unlockedLayers);
  next.add(layer);
  return { ...state, unlockedLayers: next };
}

// ---------------------------------------------------------------------------
// Layer unlock detection from GameState
// ---------------------------------------------------------------------------

export function computeUnlockedLayers(state: GameState): Set<OverlayLayer> {
  const unlocked = new Set<OverlayLayer>(['religion']);

  // Military: after any war has ever been declared
  const anyWar = state.eventHistory.some(e => e.category === 'military');
  if (anyWar) unlocked.add('military');

  // Trade: after any trade route exists
  if (state.world.tradeRoutes.size > 0) unlocked.add('trade');

  // Science: after first milestone
  if (state.world.scienceProgress.milestonesReached.length > 0) unlocked.add('science');

  return unlocked;
}

// ---------------------------------------------------------------------------
// Layer picker layout
// ---------------------------------------------------------------------------

export interface LayerPickerButton {
  layer: OverlayLayer;
  label: string;
  isActive: boolean;
  isUnlocked: boolean;
}

export function buildLayerPickerButtons(
  state: DivineOverlayState,
): LayerPickerButton[] {
  return OVERLAY_LAYERS.map(def => ({
    layer: def.id,
    label: def.label,
    isActive: state.activeLayer === def.id,
    isUnlocked: state.unlockedLayers.has(def.id),
  }));
}

// ---------------------------------------------------------------------------
// Overlay visual priority rules
// ---------------------------------------------------------------------------

/** When overlay is active: map regions dim to 15% opacity. */
export const OVERLAY_REGION_DIM_OPACITY = 0.15;

/** FAB purple ring color when overlay is active. */
export const OVERLAY_FAB_RING_COLOR = '#9060c0';

// ---------------------------------------------------------------------------
// Harbinger overlay indicators (late game, Era 10+)
// ---------------------------------------------------------------------------

export function shouldShowHarbingerOverlay(currentEra: EraId): boolean {
  return eraIndex(currentEra) >= HARBINGER.VISIBILITY_OVERLAY_ERA - 1;
}

export function shouldShowVeiledWarning(currentEra: EraId): boolean {
  return eraIndex(currentEra) >= HARBINGER.VISIBILITY_VOICES_ERA - 1;
}

// ---------------------------------------------------------------------------
// Alien signal indicator (Era 9+)
// ---------------------------------------------------------------------------

export function shouldShowAlienSignal(state: GameState): boolean {
  return state.world.alienState.revealedToPlayer;
}

// ---------------------------------------------------------------------------
// Disease vector overlay (always visible when overlay active + disease exists)
// ---------------------------------------------------------------------------

export function hasDiseaseVectors(state: GameState): boolean {
  return state.world.diseases.some(d => d.isActive);
}
