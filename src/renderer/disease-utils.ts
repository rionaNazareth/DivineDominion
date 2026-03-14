// =============================================================================
// DIVINE DOMINION — Disease Overlay Pure Helpers (no Phaser dependency)
// =============================================================================

import type { Disease } from '../types/game.js';

const DISEASE_ALPHA = {
  outbreak:  0.35,
  spreading: 0.45,
  pandemic:  0.60,
};

export function getDiseaseAlpha(disease: Disease, regionId: string): number {
  if (!disease.affectedRegions.includes(regionId)) return 0;
  switch (disease.severity) {
    case 'mild':     return DISEASE_ALPHA.outbreak;
    case 'moderate': return DISEASE_ALPHA.spreading;
    case 'severe':   return DISEASE_ALPHA.spreading * 1.2;
    case 'pandemic': return DISEASE_ALPHA.pandemic;
  }
}
