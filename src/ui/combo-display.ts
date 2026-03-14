// =============================================================================
// DIVINE DOMINION — Combo "Divine Chain" Toast (Task 3.13)
// Builds combo toast data with discovery text and chain icon hints.
// =============================================================================

import type { PowerComboId } from '../types/game.js';
import type { ToastStyle, ToastNotification } from './event-notifications.js';
import { UI } from '../config/constants.js';

// ---------------------------------------------------------------------------
// Combo discovery text (from 06-divine-powers.md Stage 5)
// ---------------------------------------------------------------------------

export const COMBO_DISCOVERY_TEXT: Record<PowerComboId, string> = {
  quake_scatter:    'The earth opens. The army scatters. Sometimes geography is the best general.',
  storm_fleet:      'The storm finds the fleet. Wood splinters. Trade routes drown. Nature and divinity agree on something.',
  flood_famine:     'Flood meets famine. The devastation compounds. This is what "adding insult to injury" looks like on a divine scale.',
  plague_trade:     'Disease finds the trade routes. It spreads along golden lines, turning prosperity into a highway for suffering.',
  harvest_golden:   'The harvest triggers something greater. A mini golden age blooms — free of charge. Even gods appreciate a buy-one-get-one.',
  inspire_prophet:  'Inspiration finds the Prophet. Their words catch fire. Conversion doubles. Your voice, amplified through theirs.',
  shield_miracle:   'Shield meets Miracle. A Divine Fortress forms — defense and conversion intertwined. Faith becomes a wall.',
  wildfire_rebirth: 'The fire destroys. The ashes grow. The region rebuilds stronger than before. Creative destruction — divinely authored.',
  divine_purge:     'Shield and Miracle combine against alien corruption. The darkness burns away. The region is immunized. Take that, Harbinger.',
};

export const COMBO_NAMES: Record<PowerComboId, string> = {
  quake_scatter:    'Divine Chain: Quake Scatter',
  storm_fleet:      'Divine Chain: Storm Fleet',
  flood_famine:     'Divine Chain: Flood Famine',
  plague_trade:     'Divine Chain: Plague Trade',
  harvest_golden:   'Divine Chain: Harvest Golden Age',
  inspire_prophet:  'Divine Chain: Inspire Prophet',
  shield_miracle:   'Divine Chain: Divine Fortress',
  wildfire_rebirth: 'Divine Chain: Wildfire Rebirth',
  divine_purge:     'Divine Chain: Divine Purge',
};

// ---------------------------------------------------------------------------
// Combo toast data
// ---------------------------------------------------------------------------

export interface ComboToastData {
  comboId: PowerComboId;
  comboName: string;
  discoveryText: string;
  isFirstDiscovery: boolean;
  toast: ToastNotification;
}

export function buildComboToastData(
  comboId: PowerComboId,
  isFirstDiscovery: boolean,
): ComboToastData {
  const comboName = COMBO_NAMES[comboId];
  const discoveryText = COMBO_DISCOVERY_TEXT[comboId];

  const toast: ToastNotification = {
    id: `toast_combo_${comboId}_${Date.now()}`,
    style: 'combo' as ToastStyle,
    title: comboName,
    subtitle: discoveryText,
    autoDismissMs: UI.COMBO_TOAST_DURATION_MS,
  };

  return { comboId, comboName, discoveryText, isFirstDiscovery, toast };
}

// ---------------------------------------------------------------------------
// First-ever combo tooltip
// ---------------------------------------------------------------------------

export const FIRST_COMBO_TOOLTIP_TEXT =
  'Your divine powers interact with the world in unexpected ways. Experiment.';

// ---------------------------------------------------------------------------
// Whisper feedback text (from 06-divine-powers.md §Whisper Feedback Text)
// ---------------------------------------------------------------------------

export type WhisperOutcome = 'success' | 'partial' | 'resisted';

export interface WhisperFeedbackText {
  success: string;
  partial: string;
  resisted: string;
}

export const WHISPER_FEEDBACK: Record<string, WhisperFeedbackText> = {
  war: {
    success:  'Aggression stirs. Swords are drawn.',
    partial:  'Tensions rise, but cooler heads hold — for now.',
    resisted: 'Your whisper falls on deaf ears. They choose peace. Annoying.',
  },
  war_targeted: {
    success:  'Eyes turn toward {target}. Old grudges sharpen.',
    partial:  'They consider {target}, but not today.',
    resisted: 'They refuse to see {target} as an enemy. Stubborn.',
  },
  peace: {
    success:  'Calm descends. Weapons are sheathed.',
    partial:  'The urge for peace flickers, then fades.',
    resisted: 'They want blood too much. Your peace bounces off.',
  },
  peace_targeted: {
    success:  'An olive branch extends toward {target}.',
    partial:  'A moment of hesitation. The swords lower — briefly.',
    resisted: 'The hatred runs too deep. Not even a god can force forgiveness.',
  },
  science: {
    success:  'Curiosity ignites. Scholars lean forward.',
    partial:  'A brief spark of inspiration. Nothing lasting.',
    resisted: "They'd rather pray than think. Your nudge goes nowhere.",
  },
  faith: {
    success:  'Devotion swells. Prayers grow louder.',
    partial:  'A flicker of fervor. It may catch.',
    resisted: "Faith doesn't come on command. Even yours.",
  },
};

export function getWhisperFeedbackText(
  whisperType: string,
  targeted: boolean,
  outcome: WhisperOutcome,
  targetNationName?: string,
): string {
  const key = targeted && (whisperType === 'war' || whisperType === 'peace')
    ? `${whisperType}_targeted`
    : whisperType;

  const texts = WHISPER_FEEDBACK[key] ?? WHISPER_FEEDBACK[whisperType];
  if (!texts) return '';

  let text = texts[outcome];
  if (targetNationName) {
    text = text.replace('{target}', targetNationName);
  }
  return text;
}
