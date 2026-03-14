// =============================================================================
// DIVINE DOMINION — Sharing System
// Commandment card generation, Earth history text, Web Share API.
// Spec: docs/implementation/phase-6.md §6.2
// =============================================================================

import type { GameState, CommandmentCard, EndingType } from '../types/game.js';
import { ALL_COMMANDMENTS } from '../config/commandments.js';

// -----------------------------------------------------------------------------
// Commandment Card
// -----------------------------------------------------------------------------

/**
 * Builds a CommandmentCard data object from the current game state.
 * This is a pure data structure — rendering is done by the UI layer.
 */
export function buildCommandmentCard(
  state: GameState,
  earthNumber: number,
  religionName: string,
  ending: EndingType,
  endingNarrative: string,
): CommandmentCard {
  const commandmentNames = state.selectedCommandments
    .map(id => {
      const cmd = ALL_COMMANDMENTS.find(c => c.id === id);
      return cmd?.name ?? id;
    });

  let totalInfluence = 0;
  let playerInfluence = 0;
  for (const region of state.world.regions.values()) {
    for (const ri of region.religiousInfluence) {
      totalInfluence += ri.strength;
      if (ri.religionId === state.playerReligionId) {
        playerInfluence += ri.strength;
      }
    }
  }
  const worldInfluencePercent = totalInfluence > 0
    ? Math.round((playerInfluence / totalInfluence) * 100)
    : 0;

  return {
    earthNumber,
    religionName,
    commandments: commandmentNames,
    ending,
    endingNarrative,
    stats: {
      worldInfluencePercent,
      totalInterventions: state.divineState.totalInterventions,
      disastersUsed: state.divineState.disastersUsed,
      scienceLevel: state.world.scienceProgress.milestonesReached.length,
    },
  };
}

// -----------------------------------------------------------------------------
// Earth History Text
// -----------------------------------------------------------------------------

/**
 * Generates a shareable multi-line text summary of the Earth's history.
 */
export function buildEarthHistoryText(
  card: CommandmentCard,
): string {
  const endingLabels: Record<EndingType, string> = {
    united_front: 'United Front — Earth Defended',
    lone_guardian: 'Lone Guardian — One Nation Stood',
    survival: 'Survival — Against All Odds',
    extinction: 'Extinction — The Aliens Won',
    self_destruction: 'Self-Destruction — Humanity Fell',
    ascension: 'Ascension — Beyond the Stars',
  };

  const lines: string[] = [
    `⚡ DIVINE DOMINION — Earth #${card.earthNumber}`,
    `🌍 Religion: ${card.religionName}`,
    `🏛️ Ending: ${endingLabels[card.ending]}`,
    ``,
    `📜 The Ten Commandments:`,
    ...card.commandments.map((c, i) => `  ${i + 1}. ${c}`),
    ``,
    `📊 Statistics:`,
    `  • World Influence: ${card.stats.worldInfluencePercent}%`,
    `  • Interventions: ${card.stats.totalInterventions}`,
    `  • Disasters Used: ${card.stats.disastersUsed}`,
    `  • Science Level: ${card.stats.scienceLevel}/11`,
    ``,
    `"${card.endingNarrative}"`,
    ``,
    `Play at: https://divine-dominion.app`,
  ];

  return lines.join('\n');
}

// -----------------------------------------------------------------------------
// Web Share API
// -----------------------------------------------------------------------------

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
}

/**
 * Shares content using the Web Share API (mobile) or falls back to clipboard copy.
 * Returns true if the share succeeded.
 */
export async function shareContent(payload: SharePayload): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url ?? 'https://divine-dominion.app',
      });
      return true;
    } catch (err) {
      // User cancelled or share failed — fall through to clipboard
      if ((err as Error).name === 'AbortError') return false;
    }
  }

  // Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(payload.text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Checks if the Web Share API is available on this device.
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Builds and shares an Earth history card.
 * Returns true if sharing succeeded.
 */
export async function shareEarthHistory(
  state: GameState,
  earthNumber: number,
  religionName: string,
  ending: EndingType,
  endingNarrative: string,
): Promise<boolean> {
  const card = buildCommandmentCard(state, earthNumber, religionName, ending, endingNarrative);
  const text = buildEarthHistoryText(card);

  return shareContent({
    title: `Divine Dominion — Earth #${earthNumber}`,
    text,
    url: 'https://divine-dominion.app',
  });
}
