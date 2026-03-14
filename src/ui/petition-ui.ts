// =============================================================================
// DIVINE DOMINION — Petition UI in Bottom Sheet (Task 3.14)
// Builds petition display data for fulfill/deny buttons.
// =============================================================================

import type { FollowerVoice, Petition, GameState, PowerId, RegionId } from '../types/game.js';
import { PETITIONS, VOICES } from '../config/constants.js';

// ---------------------------------------------------------------------------
// Petition display data
// ---------------------------------------------------------------------------

export interface PetitionFulfillAction {
  powerId: PowerId;
  targetRegionId: RegionId;
  displayText: string;  // e.g. "Cast Harvest on Eastern Plains (⚡2)"
}

export interface PetitionUIData {
  voiceId: string;
  voiceName: string;
  voiceType: string;
  requestText: string;
  /** Null when petition can't be mapped to a specific power (e.g. heretic). */
  fulfillAction: PetitionFulfillAction | null;
  denyConsequence: string;
  expiryTimeMs: number;
  /** Remaining seconds before auto-deny */
  remainingSec: number;
  isExpired: boolean;
  isHeretic: boolean;
  heretikOptions?: HereticPetitionOptions;
}

export interface HereticPetitionOptions {
  suppressText: string;
  suppressConsequence: string;
  tolerateText: string;
  tolerateConsequence: string;
}

export function buildPetitionUI(
  voice: FollowerVoice,
  petition: Petition,
  nowSec: number,
): PetitionUIData {
  const remainingSec = Math.max(0, petition.expiryTime - nowSec);
  const isExpired = remainingSec <= 0;
  const isHeretic = voice.type === 'heretic';

  const fulfillAction = isHeretic ? null : buildFulfillAction(voice, petition);
  const denyConsequence = `−${VOICES.LOYALTY_LOSS_DENY} loyalty`;

  const heretikOptions: HereticPetitionOptions | undefined = isHeretic ? {
    suppressText: 'Suppress',
    suppressConsequence: 'Heretic disappears. −faith in region. +schism risk.',
    tolerateText: 'Tolerate',
    tolerateConsequence: 'Heretic stays. Schism risk grows slowly each era.',
  } : undefined;

  return {
    voiceId: voice.id,
    voiceName: voice.name,
    voiceType: voice.type,
    requestText: petition.requestText,
    fulfillAction,
    denyConsequence,
    expiryTimeMs: petition.expiryTime * 1000,
    remainingSec,
    isExpired,
    isHeretic,
    heretikOptions,
  };
}

/** Maps a petition type to the fulfill action shown to the player. */
function buildFulfillAction(
  voice: FollowerVoice,
  petition: Petition,
): PetitionFulfillAction | null {
  // Map petition type strings to power IDs
  const TYPE_TO_POWER: Record<string, PowerId> = {
    bless_region:        'bountiful_harvest',
    cast_miracle:        'miracle',
    protect_region:      'shield_of_faith',
    harbinger_purge:     'shield_of_faith',  // requires shield+miracle combo
    smite_enemy:         'earthquake',
    shield_nation:       'shield_of_faith',
    bless_armies:        'shield_of_faith',
    aid_in_battle:       'great_storm',
    strike_supply_line:  'earthquake',
    inspire_troops:      'inspiration',
    inspire_academy:     'inspiration',
    protect_scholars:    'shield_of_faith',
  };

  const petType = petition.type.toLowerCase().replace(/\s+/g, '_');
  const powerId = TYPE_TO_POWER[petType];

  if (!powerId) return null;

  return {
    powerId,
    targetRegionId: voice.regionId,
    displayText: `Cast for ${voice.name}'s region`,
  };
}

// ---------------------------------------------------------------------------
// Petition counter for HUD
// ---------------------------------------------------------------------------

export interface PetitionCounterState {
  count: number;
  hasHeretic: boolean;
  isVisible: boolean;
  ariaLabel: string;
}

export function buildPetitionCounterState(state: GameState): PetitionCounterState {
  const count = state.voiceRecords.filter(v => v.currentPetition !== null).length;
  const hasHeretic = state.voiceRecords.some(
    v => v.type === 'heretic' && v.currentPetition !== null,
  );
  const isVisible = count > 0;
  const ariaLabel = count === 0
    ? ''
    : `${count} prayer${count !== 1 ? 's' : ''} pending. Tap to view.`;

  return { count, hasHeretic, isVisible, ariaLabel };
}

// ---------------------------------------------------------------------------
// Auto-deny logic helper
// ---------------------------------------------------------------------------

/** Returns true if a petition has exceeded its timeout. */
export function isPetitionExpired(petition: Petition, nowSec: number): boolean {
  return nowSec >= petition.expiryTime;
}

/** Reduced loyalty loss for auto-expired petitions. */
export function getAutoDenyLoyaltyLoss(): number {
  return VOICES.LOYALTY_LOSS_AUTO_DENY;
}
