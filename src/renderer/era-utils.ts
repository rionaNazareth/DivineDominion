// =============================================================================
// DIVINE DOMINION — Era Transition Pure Helpers (no Phaser dependency)
// =============================================================================

import type { EraId } from '../types/game.js';

export const ERA_ORDER: EraId[] = [
  'renaissance', 'exploration', 'enlightenment', 'revolution',
  'industry', 'empire', 'atomic', 'digital',
  'signal', 'revelation', 'preparation', 'arrival',
];

export function eraIndex(eraId: EraId): number {
  return ERA_ORDER.indexOf(eraId);
}

export function eraName(eraId: EraId): string {
  const nameMap: Record<EraId, string> = {
    renaissance:   'Renaissance',
    exploration:   'Age of Exploration',
    enlightenment: 'Enlightenment',
    revolution:    'Revolution',
    industry:      'Industrial Age',
    empire:        'Age of Empire',
    atomic:        'Atomic Age',
    digital:       'Digital Age',
    signal:        'Signal Age',
    revelation:    'Revelation',
    preparation:   'Preparation',
    arrival:       'Arrival',
  };
  return nameMap[eraId] ?? eraId;
}
