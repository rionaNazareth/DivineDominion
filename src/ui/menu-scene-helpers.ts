// =============================================================================
// DIVINE DOMINION — Menu Scene Helpers (pure, no side-effects)
// Re-exports from menu-scene.ts that are safe to import in tests.
// =============================================================================

export {
  ARCHETYPES,
  getArchetypeCommandmentPreset,
  buildResultsHeadline,
  SETTINGS_SCHEMA,
  WORLD_GEN_LOADING_TEXTS,
  getWorldGenText,
  loadGodProfile as createEmptyProfileHelper,
  loadEarthHistory,
  saveEarthRecord,
  MAX_EARTH_HISTORY,
  SAFE_TOP_PT,
  SAFE_BOTTOM_PT,
} from './menu-scene.js';
