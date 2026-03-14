// =============================================================================
// DIVINE DOMINION — Region Info Bottom Sheet (Task 3.6)
// DOM overlay, not Phaser. Designed for Session 8 extension.
// =============================================================================

import type { Region, Nation, RegionId } from '../types/game.js';
import { UI } from '../config/constants.js';

// ---------------------------------------------------------------------------
// Snap points
// ---------------------------------------------------------------------------

export type SheetSnap = 'hidden' | 'peek' | 'half' | 'full';

export const SHEET_SNAP_HEIGHTS: Record<SheetSnap, number | string> = {
  hidden: 0,
  peek:   UI.BOTTOM_SHEET_PEEK_PT,
  half:   '50%',
  full:   '85%',
};

// ---------------------------------------------------------------------------
// Bottom sheet state
// ---------------------------------------------------------------------------

export interface BottomSheetState {
  snap: SheetSnap;
  regionId: RegionId | null;
  isAnimating: boolean;
}

export function createBottomSheetState(): BottomSheetState {
  return { snap: 'hidden', regionId: null, isAnimating: false };
}

export function sheetOpenRegion(
  state: BottomSheetState,
  regionId: RegionId,
): BottomSheetState {
  if (state.regionId === regionId && state.snap !== 'hidden') {
    // Already showing this region — keep current snap
    return state;
  }
  return { snap: 'peek', regionId, isAnimating: true };
}

export function sheetAnimationComplete(state: BottomSheetState): BottomSheetState {
  return { ...state, isAnimating: false };
}

export function sheetSetSnap(state: BottomSheetState, snap: SheetSnap): BottomSheetState {
  return { ...state, snap, isAnimating: true };
}

export function sheetDismiss(state: BottomSheetState): BottomSheetState {
  return { snap: 'hidden', regionId: null, isAnimating: true };
}

export function isExpanded(state: BottomSheetState): boolean {
  return state.snap === 'half' || state.snap === 'full';
}

// ---------------------------------------------------------------------------
// Region content builder
// ---------------------------------------------------------------------------

export interface RegionSummary {
  regionId: RegionId;
  regionName: string;
  population: number;
  faithPercent: number;
  devLevel: number;
  religionName: string;
  religionColor: string;
  nationName: string;
  government: string;
  militaryStrength: number;
  hasDisease: boolean;
  isQuarantined: boolean;
  tradeRouteCount: number;
  armyPresent: boolean;
}

export function buildRegionSummary(
  region: Region,
  nation: Nation,
  religionName: string,
  religionColor: string,
  tradeRouteCount: number,
  armyPresent: boolean,
): RegionSummary {
  return {
    regionId: region.id,
    regionName: region.id, // display name equals id until name generation is wired in
    population: region.population,
    faithPercent: Math.round(region.faithStrength * 100),
    devLevel: region.development,
    religionName,
    religionColor,
    nationName: nation.name,
    government: nation.government,
    militaryStrength: nation.militaryStrength,
    hasDisease: region.activeEffects.some(e => e.powerId === 'plague'),
    isQuarantined: region.isQuarantined,
    tradeRouteCount,
    armyPresent,
  };
}

// ---------------------------------------------------------------------------
// Nation detail builder
// ---------------------------------------------------------------------------

export interface NationDetail {
  nationId: string;
  name: string;
  government: string;
  development: number;
  stability: number;
  atWarWith: string[];
  alliedWith: string[];
  tradePartners: string[];
}

export function buildNationDetail(nation: Nation): NationDetail {
  const atWarWith: string[] = [];
  const alliedWith: string[] = [];
  const tradePartners: string[] = [];

  for (const [id, rel] of nation.relations) {
    if (rel.atWar) atWarWith.push(id);
    else if (rel.alliance) alliedWith.push(id);
    else if (rel.tradeAgreement) tradePartners.push(id);
  }

  return {
    nationId: nation.id,
    name: nation.name,
    government: nation.government,
    development: nation.development,
    stability: nation.stability,
    atWarWith,
    alliedWith,
    tradePartners,
  };
}

// ---------------------------------------------------------------------------
// BottomSheet class (DOM-based — not Phaser)
// Extension points for Session 8: actionButtonsContainer, extraPanelContainer.
// ---------------------------------------------------------------------------

export interface BottomSheetConfig {
  region: Region;
  nation: Nation;
  onClose: () => void;
  onRegionChange?: (regionId: RegionId) => void;
}

export class BottomSheet {
  protected config: BottomSheetConfig;
  protected _state: BottomSheetState;

  /** Session 8 populates with whisper buttons */
  readonly actionButtonsContainer: object = {};
  /** Session 8 populates with petition UI */
  readonly extraPanelContainer: object = {};

  constructor(config: BottomSheetConfig) {
    this.config = config;
    this._state = sheetOpenRegion(createBottomSheetState(), config.region.id);
  }

  expand(): void {
    this._state = sheetSetSnap(this._state, 'full');
  }

  collapse(): void {
    this._state = sheetSetSnap(this._state, 'peek');
  }

  isExpanded(): boolean {
    return isExpanded(this._state);
  }

  setRegion(region: Region, nation: Nation): void {
    this.config = { ...this.config, region, nation };
    this._state = sheetOpenRegion(this._state, region.id);
    if (this.config.onRegionChange) {
      this.config.onRegionChange(region.id);
    }
  }

  getState(): BottomSheetState {
    return this._state;
  }
}

// ---------------------------------------------------------------------------
// Whisper button layout (populated by Session 8, defined here for extension)
// ---------------------------------------------------------------------------

export type WhisperButtonType = 'war' | 'peace' | 'science' | 'faith';

export interface WhisperButton {
  type: WhisperButtonType;
  icon: string;  // e.g. 'sword', 'dove', 'flask', 'prayer_hands'
  label: string;
  color: string;
  isOnCooldown: boolean;
  cooldownRemainingMs: number;
}

export function buildWhisperButtons(
  cooldowns: Map<string, number>,
  regionId: RegionId,
  nowSec: number,
): WhisperButton[] {
  return [
    { type: 'war',     icon: 'sword',         label: 'War',     color: '#c93040' },
    { type: 'peace',   icon: 'dove',          label: 'Peace',   color: '#88aacc' },
    { type: 'science', icon: 'flask',         label: 'Science', color: '#ffffff' },
    { type: 'faith',   icon: 'prayer_hands',  label: 'Faith',   color: '#c9a84c' },
  ].map(btn => {
    const key = `${regionId}:${btn.type}`;
    const expiresAt = cooldowns.get(key) ?? 0;
    const remaining = Math.max(0, expiresAt - nowSec);
    return {
      ...btn,
      isOnCooldown: remaining > 0,
      cooldownRemainingMs: remaining * 1000,
    };
  });
}
