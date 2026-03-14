// =============================================================================
// DIVINE DOMINION — Renderer Public API
// =============================================================================

// Phaser Scenes
export { createPhaserGame, GameScene }    from './game-scene.js';
export { MapRenderer }                    from './map-renderer.js';
export { ReligionOverlay }                from './religion-overlay.js';
export { ArmyRenderer }                   from './army-renderer.js';
export { TradeRenderer }                  from './trade-renderer.js';
export { DiseaseOverlay }                 from './disease-overlay.js';
export { VfxRenderer }                    from './vfx-renderer.js';
export { EraTransitionController }        from './era-transition.js';
export { CameraController }               from './camera-controller.js';

// Pure helpers (no Phaser — importable in Node/tests)
export { devToCityLevel, computeCentroid, estimateRegionWidth } from './map-utils.js';
export { getDominantReligion, hasMajority, hasStronghold, computeContestArcSegments } from './religion-overlay-utils.js';
export { formatTroopCount } from './army-utils.js';
export { volumeToLineWidth, tradeRouteColor } from './trade-utils.js';
export { getDiseaseAlpha } from './disease-utils.js';
export { eraIndex, eraName } from './era-utils.js';
export { clampZoom, getZoomTier } from './camera-utils.js';
export { generateMicroDetail } from './terrain-detail.js';
export * from './palettes.js';
