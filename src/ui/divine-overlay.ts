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

// ---------------------------------------------------------------------------
// Harbinger Anomaly overlay layer (Task 3.15, Era 10+)
// ---------------------------------------------------------------------------

export type AnomalyIntensity = 'subtle' | 'moderate' | 'heavy';

export interface AnomalyRegionData {
  regionId: string;
  isCorrupted: boolean;
  isVeiled: boolean;
  isImmune: boolean;
  intensity: AnomalyIntensity;
  /** Shows "⚠ Data unreliable" indicator when veiled */
  showDataUnreliable: boolean;
}

/**
 * Builds anomaly overlay data for all regions affected by the Harbinger.
 * Derives region list from harbinger tracking data (not from regions Map).
 * Only relevant when Era 10+ (shouldShowHarbingerOverlay returns true).
 */
export function buildAnomalyOverlayData(state: GameState): AnomalyRegionData[] {
  const harbinger = state.world.alienState.harbinger;

  // Collect all region IDs that have any Harbinger state
  const allIds = new Set<string>([
    ...harbinger.corruptedRegionIds,
    ...harbinger.veiledRegionIds,
    ...harbinger.immuneRegionIds,
  ]);

  if (allIds.size === 0) return [];

  const corrupted = new Set(harbinger.corruptedRegionIds);
  const veiled = new Set(harbinger.veiledRegionIds);
  const immune = new Set(harbinger.immuneRegionIds);

  return Array.from(allIds).map(regionId => {
    const isCorrupted = corrupted.has(regionId);
    const isVeiled = veiled.has(regionId);
    const isImmune = immune.has(regionId);

    let intensity: AnomalyIntensity = 'subtle';
    if (isCorrupted && isVeiled) intensity = 'heavy';
    else if (isCorrupted) intensity = 'moderate';

    return {
      regionId,
      isCorrupted,
      isVeiled,
      isImmune,
      intensity,
      showDataUnreliable: isVeiled,
    };
  });
}

/** Returns whether the anomaly overlay layer is currently unlocked. */
export function isAnomalyLayerUnlocked(state: GameState): boolean {
  return eraIndex(state.world.currentEra) >= HARBINGER.VISIBILITY_OVERLAY_ERA - 1;
}

// ---------------------------------------------------------------------------
// Harbinger VFX data (late game — Eras 11-12)
// ---------------------------------------------------------------------------

export type HarbingerVFXType =
  | 'corruption_shimmer'  // dark-purple shimmer on corrupted regions
  | 'veil_shimmer'        // translucent shimmer indicating veiled state
  | 'sabotage_trail'      // purple trail showing recent sabotage path
  | 'purge_effect'        // bright flash when Divine Purge removes corruption
  | 'discord_whisper';    // subtle purple whisper effect

export interface HarbingerVFXData {
  type: HarbingerVFXType;
  regionId: string;
  color: string;
  opacity: number;
  isVisible: boolean;
}

export const HARBINGER_VFX_COLORS: Record<HarbingerVFXType, string> = {
  corruption_shimmer: '#4a1a6a', // dark purple
  veil_shimmer:       '#7a4a9a', // medium purple, translucent
  sabotage_trail:     '#9060c0', // purple trail
  purge_effect:       '#ffffff', // white flash → fades
  discord_whisper:    '#6030a0', // subtle purple whisper
};

/**
 * Builds VFX data for visible harbinger effects.
 * Full visibility starts Era 11 (eraIndex >= 10).
 */
export function buildHarbingerVFXData(state: GameState): HarbingerVFXData[] {
  const harbinger = state.world.alienState.harbinger;
  const eraIdx = eraIndex(state.world.currentEra);
  const fullVisibility = eraIdx >= 10; // Era 11+ (0-indexed: era 11 = index 10)
  const overlayEra = eraIdx >= HARBINGER.VISIBILITY_OVERLAY_ERA - 1;

  if (!overlayEra) return [];

  const vfxList: HarbingerVFXData[] = [];

  for (const regionId of harbinger.corruptedRegionIds) {
    vfxList.push({
      type: 'corruption_shimmer',
      regionId,
      color: HARBINGER_VFX_COLORS.corruption_shimmer,
      opacity: fullVisibility ? 0.6 : 0.3,
      isVisible: true,
    });
  }

  for (const regionId of harbinger.veiledRegionIds) {
    vfxList.push({
      type: 'veil_shimmer',
      regionId,
      color: HARBINGER_VFX_COLORS.veil_shimmer,
      opacity: 0.4,
      isVisible: true,
    });
  }

  return vfxList;
}
