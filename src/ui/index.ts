// =============================================================================
// DIVINE DOMINION — UI Public API (Phase 3, Session 7)
// =============================================================================

// Settings / persistence
export * from './settings-store.js';

// Task 3.1 — Menu Scene
export {
  loadGodProfile, saveGodProfile, hasSavedGame, getSaveMetadata,
  loadEarthHistory, saveEarthRecord, MAX_EARTH_HISTORY,
  ARCHETYPES, getArchetypeCommandmentPreset,
  buildResultsHeadline,
  SETTINGS_SCHEMA,
  WORLD_GEN_LOADING_TEXTS, getWorldGenText,
  SAFE_TOP_PT, SAFE_BOTTOM_PT,
} from './menu-scene.js';
export type {
  EarthRecord, MenuState, MenuScreen, ArchetypeId, ArchetypeDefinition,
  ResultsData, SettingsSection, SettingRow, PauseMenuAction, PauseMenuConfig,
} from './menu-scene.js';

// Task 3.2 — Commandment Selection
export {
  createSelectionState, createReviewState,
  COMMANDMENT_PICK_TARGET,
  canSelect, toggleSelect, startSwap, isConfirmEnabled,
  detectTensionPairs, hasTensionWith,
  filterCommandments, groupByCategory,
  CATEGORY_COLORS, buildPopoverData,
} from './commandment-select.js';
export type {
  CommandmentSelectionState, CommandmentFilter, CommandmentPopoverData,
} from './commandment-select.js';

// Task 3.3 — HUD
export {
  buildHudSnapshot, getHudVisibility, cycleSpeed, speedLabel,
  buildEnergyTooltip,
  getPrayerCountLabel, getNearestPetitionRegionId,
  getFabAriaLabel, getEnergyAriaLabel, getPrayerAriaLabel, getSpeedAriaLabel,
} from './hud.js';
export type { HudSnapshot, HudVisibilityState, EnergyTooltip, SpeedOption } from './hud.js';

// Task 3.4 — FAB
export {
  getUnlockedPowerIds, getUnlockedPowers, selectContextPowers,
  computeArcLayout,
  createFabMenuState, fabOpen, fabOpenComplete, fabClose, fabCloseComplete,
  fabSelectPower, fabCancelTargeting, fabCastComplete, isOpen,
  getTargetingBannerText, powerHapticType,
  FABMenu,
} from './fab-menu.js';
export type {
  FABConfig, ContextSlot, ArcButton, ArcLayout, FabState, FabMenuState,
} from './fab-menu.js';

// Task 3.5 — Event Notifications
export {
  buildEventToast, buildMilestoneToast, buildComboToast,
  createEventQueueState, enqueueEvent, resolveCurrentEvent, getQueueBadgeCount,
  buildEventCardChoices,
  createSessionTracker, checkSessionMilestone,
  EVENT_QUEUE_MAX,
} from './event-notifications.js';
export type {
  ToastStyle, ToastNotification, EventQueueState, EventCardData,
  EventChoiceDisplay, FollowerStakes, SessionMilestoneTracker,
} from './event-notifications.js';

// Task 3.6 — Bottom Sheet
export {
  createBottomSheetState, sheetOpenRegion, sheetAnimationComplete,
  sheetSetSnap, sheetDismiss, isExpanded,
  buildRegionSummary, buildNationDetail, buildWhisperButtons,
  SHEET_SNAP_HEIGHTS,
  BottomSheet,
} from './bottom-sheet.js';
export type {
  SheetSnap, BottomSheetState, RegionSummary, NationDetail,
  WhisperButton, WhisperButtonType, BottomSheetConfig,
} from './bottom-sheet.js';

// Task 3.7 — Divine Overlay
export {
  OVERLAY_LAYERS,
  createOverlayState, toggleOverlay, setOverlayLayer, unlockOverlayLayer,
  computeUnlockedLayers, buildLayerPickerButtons,
  shouldShowHarbingerOverlay, shouldShowVeiledWarning, shouldShowAlienSignal,
  hasDiseaseVectors,
  OVERLAY_REGION_DIM_OPACITY, OVERLAY_FAB_RING_COLOR,
} from './divine-overlay.js';
export type {
  OverlayLayer, OverlayLayerDefinition, DivineOverlayState, LayerPickerButton,
} from './divine-overlay.js';

// Task 3.8 — Era Screen
export {
  buildEraScreenData, formatFollowers, getEraYearRange,
  ERA_SCREEN_BACKGROUNDS, ERA_MORPH_DURATION_MS,
  ERA_CARD_ENTRY_MS, ERA_CARD_HOLD_MS, ERA_CARD_EXIT_MS,
} from './era-screen.js';
export type { EraScreenData, EraStatsSnapshot } from './era-screen.js';
