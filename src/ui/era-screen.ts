// =============================================================================
// DIVINE DOMINION — Era Transition Screen (Task 3.8)
// Narrative summary card shown between eras.
// =============================================================================

import type { GameState, EraId } from '../types/game.js';
import { ERAS } from '../config/constants.js';
import { eraName } from '../renderer/era-utils.js';

// ---------------------------------------------------------------------------
// Era screen data
// ---------------------------------------------------------------------------

export interface EraScreenData {
  eraId: EraId;
  eraDisplayName: string;
  year: number;
  narrativeSummary: string;
  prophecyQuote: string;
  statsSnapshot: EraStatsSnapshot;
  continueLabel: string;
}

export interface EraStatsSnapshot {
  totalFollowers: number;
  regionsWithFaith: number;
  totalWars: number;
  scienceMilestones: number;
  divineInterventions: number;
}

// Default prophecy quotes per era (fallback when LLM not available)
const ERA_PROPHECY_QUOTES: Record<EraId, string> = {
  renaissance:  '"The age of discovery begins. A god must be swift."',
  exploration:  '"The world grows wider. Faith must grow with it."',
  enlightenment: '"Reason challenges faith. Not an enemy — an ally."',
  revolution:   '"Old orders break. New ones are forged in blood and belief."',
  industry:     '"The machines rise. But machines cannot pray."',
  empire:       '"The world is mapped. Every corner is a battlefield."',
  atomic:       '"Fire that splits the atom. The gods watch carefully."',
  digital:      '"Information flows like faith — boundless and invisible."',
  signal:       '"Something is out there. It has been watching for some time."',
  revelation:   '"The signal becomes a voice. What does it say?"',
  preparation:  '"Every era leads to this. What have your followers built?"',
  arrival:      '"The fleet enters the system. There is no more time."',
};

export function buildEraScreenData(state: GameState, nextEraId: EraId): EraScreenData {
  const era = ERAS.find(e => e.id === nextEraId);
  const narrativeSummary = state.eraNarratives.get(nextEraId)
    ?? `The ${eraName(nextEraId)} era has arrived. The world continues to change.`;

  // Compute snapshot from current world state
  let totalFollowers = 0;
  let regionsWithFaith = 0;
  for (const region of state.world.regions.values()) {
    if (region.dominantReligion === state.playerReligionId) {
      totalFollowers += region.population;
      regionsWithFaith++;
    }
  }

  const totalWars = state.eventHistory.filter(e => e.category === 'military').length;
  const scienceMilestones = state.world.scienceProgress.milestonesReached.length;

  return {
    eraId: nextEraId,
    eraDisplayName: eraName(nextEraId),
    year: era?.startYear ?? state.world.currentYear,
    narrativeSummary,
    prophecyQuote: ERA_PROPHECY_QUOTES[nextEraId],
    statsSnapshot: {
      totalFollowers,
      regionsWithFaith,
      totalWars,
      scienceMilestones,
      divineInterventions: state.divineState.totalInterventions,
    },
    continueLabel: 'Continue',
  };
}

// ---------------------------------------------------------------------------
// Era transition timing constants
// ---------------------------------------------------------------------------

/** Total transition animation: 3000ms palette morph (in EraTransitionController) */
export const ERA_MORPH_DURATION_MS = 3000;

/** Card entry: 500ms fade in */
export const ERA_CARD_ENTRY_MS = 500;

/** Card hold: 1500ms */
export const ERA_CARD_HOLD_MS = 1500;

/** Card exit: 500ms fade out */
export const ERA_CARD_EXIT_MS = 500;

// ---------------------------------------------------------------------------
// Era summary display helpers
// ---------------------------------------------------------------------------

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function getEraYearRange(eraId: EraId): string {
  const era = ERAS.find(e => e.id === eraId);
  if (!era) return '';
  return `${era.startYear}–${era.endYear}`;
}

// ---------------------------------------------------------------------------
// Era-adaptive background color (used by era screen + map transition)
// ---------------------------------------------------------------------------

export const ERA_SCREEN_BACKGROUNDS: Record<EraId, string> = {
  renaissance:   '#3d2e1a',
  exploration:   '#4a3518',
  enlightenment: '#3d2a0e',
  revolution:    '#3d2006',
  industry:      '#2a2a2a',
  empire:        '#1e1e2e',
  atomic:        '#181828',
  digital:       '#121238',
  signal:        '#0e1430',
  revelation:    '#0c1028',
  preparation:   '#0a0c20',
  arrival:       '#080a18',
};
