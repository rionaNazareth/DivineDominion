// =============================================================================
// DIVINE DOMINION — Voice Map Icons + Character Profiles (Task 3.12)
// Pure data builders for voice icons on the map and bottom sheet profiles.
// =============================================================================

import type { FollowerVoice, VoiceType, VoiceId, RegionId, GameState } from '../types/game.js';
import { UI, VOICES } from '../config/constants.js';

// ---------------------------------------------------------------------------
// Voice type ring colors (per 13-follower-voices.md)
// ---------------------------------------------------------------------------

export const VOICE_TYPE_COLORS: Record<VoiceType, string> = {
  prophet:  '#c9a84c', // gold
  ruler:    '#c0c0c0', // silver
  general:  '#708090', // steel/dark
  scholar:  '#88aacc', // blue
  heretic:  '#c93040', // red
};

export const VOICE_PRAYER_PULSE_COLOR = '#c9a84c'; // golden pulse

// ---------------------------------------------------------------------------
// Voice icon data (for map layer rendering)
// ---------------------------------------------------------------------------

export interface VoiceIconData {
  voiceId: VoiceId;
  regionId: RegionId;
  type: VoiceType;
  ringColor: string;
  hasPetition: boolean;
  /** ARIA label for accessibility */
  ariaLabel: string;
}

export function buildVoiceIcons(state: GameState): VoiceIconData[] {
  return state.voiceRecords
    .filter(v => v.currentPetition !== null || v.loyalty >= 0)
    .map(v => buildVoiceIcon(v));
}

export function buildVoiceIcon(voice: FollowerVoice): VoiceIconData {
  const hasPetition = voice.currentPetition !== null;
  const typeLabel = voice.type.charAt(0).toUpperCase() + voice.type.slice(1);
  return {
    voiceId: voice.id,
    regionId: voice.regionId,
    type: voice.type,
    ringColor: VOICE_TYPE_COLORS[voice.type],
    hasPetition,
    ariaLabel: `${voice.name} (${typeLabel})${hasPetition ? '. Has petition.' : ''}`,
  };
}

// ---------------------------------------------------------------------------
// Voice character profile (shown in bottom sheet)
// ---------------------------------------------------------------------------

export interface VoiceProfileData {
  voiceId: VoiceId;
  name: string;
  type: VoiceType;
  typeLabel: string;
  loyalty: number;           // 0.0–1.0
  loyaltyColor: string;      // green → yellow → red
  isLowLoyalty: boolean;     // below betrayal threshold
  petitionsAnswered: number;
  petitionsDenied: number;
  activeYears: number;       // current game year − birthYear
  lineageDescription: string | null;
  hasPetition: boolean;
}

export function buildVoiceProfile(
  voice: FollowerVoice,
  currentYear: number,
  allVoices: FollowerVoice[],
): VoiceProfileData {
  const activeYears = Math.max(0, currentYear - voice.birthYear);

  // Lineage description
  let lineageDescription: string | null = null;
  if (voice.lineageOf) {
    const ancestor = allVoices.find(v => v.id === voice.lineageOf);
    if (ancestor) {
      lineageDescription = `Lineage of ${ancestor.name}`;
    }
  }

  const typeLabel = voice.type.charAt(0).toUpperCase() + voice.type.slice(1);

  return {
    voiceId: voice.id,
    name: voice.name,
    type: voice.type,
    typeLabel,
    loyalty: voice.loyalty,
    loyaltyColor: getLoyaltyColor(voice.loyalty),
    isLowLoyalty: voice.loyalty < VOICES.BETRAYAL_THRESHOLD,
    petitionsAnswered: 0,  // tracked in session 9 save/load; placeholder for now
    petitionsDenied: 0,
    activeYears,
    lineageDescription,
    hasPetition: voice.currentPetition !== null,
  };
}

/** Returns green→yellow→red gradient hex for loyalty bar. */
export function getLoyaltyColor(loyalty: number): string {
  if (loyalty >= 0.6) return '#5cb85c';  // green
  if (loyalty >= 0.3) return '#f0ad4e';  // yellow
  return '#d9534f';                       // red
}

// ---------------------------------------------------------------------------
// Prayer counter → nearest petitioning voice (Task 3.11 integration)
// ---------------------------------------------------------------------------

/**
 * Returns the voice whose petition should be shown first when the player
 * taps the prayer counter. Prefers heretic petitions (red badge state).
 */
export function getPrimaryPetitioningVoice(state: GameState): FollowerVoice | null {
  const withPetition = state.voiceRecords.filter(v => v.currentPetition !== null);
  if (withPetition.length === 0) return null;
  // Heretics surface first (player needs to decide)
  const heretic = withPetition.find(v => v.type === 'heretic');
  return heretic ?? withPetition[0];
}

// ---------------------------------------------------------------------------
// Voice emergence notification
// ---------------------------------------------------------------------------

export function buildVoiceEmergenceToastText(voice: FollowerVoice): string {
  const typeLabel = voice.type.charAt(0).toUpperCase() + voice.type.slice(1);
  return `A voice rises from your followers. ${voice.name}, ${typeLabel} of the region, seeks your guidance.`;
}

export function buildVoiceDeathToastText(voice: FollowerVoice, killedInWar: boolean): string {
  if (killedInWar) {
    return `${voice.name} fell in battle. Their followers mourn.`;
  }
  if (voice.type === 'prophet') {
    return `The prophet ${voice.name} has passed. Their teachings endure.`;
  }
  return `${voice.name} has passed. Their influence shaped an era.`;
}

export function buildVoiceBetrayalToastText(voice: FollowerVoice): string {
  return `${voice.name} has turned against you. They preach a new faith.`;
}
