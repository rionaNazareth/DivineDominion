// =============================================================================
// DIVINE DOMINION — UI Module Tests (Phase 3, Sessions 7 + 8)
// Tests: 3.1 Menu · 3.2 Commandment Select · 3.3 HUD · 3.4 FAB
//        3.5 Event Notifications · 3.6 Bottom Sheet · 3.7 Divine Overlay · 3.8 Era Screen
//        3.9 Dual-Arc FAB · 3.10 Whispers · 3.11 Prayer Counter · 3.12 Voices
//        3.13 Combo Toast · 3.14 Petition UI · 3.15 Harbinger Overlay
// All tests are pure-logic (no DOM, no Phaser).
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';

// --- Settings store ---
import {
  DEFAULT_SETTINGS, loadSettings, patchSettings,
  DEFAULT_TUTORIAL, loadTutorialState,
} from '../settings-store.js';

// --- Menu scene ---
import {
  createEmptyProfileHelper,
  loadEarthHistory, saveEarthRecord, MAX_EARTH_HISTORY,
  ARCHETYPES, getArchetypeCommandmentPreset,
  buildResultsHeadline, getWorldGenText, WORLD_GEN_LOADING_TEXTS,
  SETTINGS_SCHEMA,
} from '../menu-scene-helpers.js';

// --- Commandment selection ---
import {
  createSelectionState, createReviewState,
  COMMANDMENT_PICK_TARGET,
  canSelect, toggleSelect, startSwap, isConfirmEnabled,
  detectTensionPairs, hasTensionWith,
  filterCommandments, groupByCategory,
  CATEGORY_COLORS, buildPopoverData,
} from '../commandment-select.js';

// --- HUD ---
import {
  buildHudSnapshot, getHudVisibility, cycleSpeed,
  speedLabel, getPrayerCountLabel, getSpeedAriaLabel,
  getEnergyAriaLabel, getFabAriaLabel,
} from '../hud.js';

// --- FAB ---
import {
  getUnlockedPowerIds, getUnlockedPowers, selectContextPowers,
  computeArcLayout, createFabMenuState,
  fabOpen, fabOpenComplete, fabClose, fabCloseComplete,
  fabSelectPower, fabCancelTargeting, isOpen,
  FABMenu, getTargetingBannerText,
} from '../fab-menu.js';

// --- Event notifications ---
import {
  buildEventToast, buildMilestoneToast, buildComboToast,
  createEventQueueState, enqueueEvent, resolveCurrentEvent, getQueueBadgeCount,
  buildEventCardChoices, EVENT_QUEUE_MAX,
  createSessionTracker, checkSessionMilestone,
} from '../event-notifications.js';

// --- Bottom sheet ---
import {
  createBottomSheetState, sheetOpenRegion, sheetSetSnap, sheetDismiss, isExpanded,
  buildWhisperButtons, BottomSheet, SHEET_SNAP_HEIGHTS,
} from '../bottom-sheet.js';

// --- Divine overlay ---
import {
  OVERLAY_LAYERS, createOverlayState, toggleOverlay, setOverlayLayer,
  unlockOverlayLayer, buildLayerPickerButtons,
  OVERLAY_REGION_DIM_OPACITY,
} from '../divine-overlay.js';

// --- Era screen ---
import {
  formatFollowers, getEraYearRange,
  ERA_SCREEN_BACKGROUNDS, ERA_MORPH_DURATION_MS, ERA_CARD_ENTRY_MS,
} from '../era-screen.js';

// --- Session 8 imports ---
import {
  getComboEligiblePowerIds, computeDualArcLayout,
  DualArcFABMenu, buildPowerUnlockToastText, shouldShowExpander,
} from '../fab-menu.js';

import {
  VOICE_TYPE_COLORS, buildVoiceIcon, buildVoiceProfile, getLoyaltyColor,
  getPrimaryPetitioningVoice, buildVoiceEmergenceToastText,
  buildVoiceDeathToastText, buildVoiceBetrayalToastText,
} from '../voice-profiles.js';

import {
  COMBO_DISCOVERY_TEXT, COMBO_NAMES, buildComboToastData,
  FIRST_COMBO_TOOLTIP_TEXT, getWhisperFeedbackText,
} from '../combo-display.js';

import {
  buildPetitionUI, buildPetitionCounterState,
  isPetitionExpired, getAutoDenyLoyaltyLoss,
} from '../petition-ui.js';

import {
  buildAnomalyOverlayData, isAnomalyLayerUnlocked,
  buildHarbingerVFXData, HARBINGER_VFX_COLORS,
} from '../divine-overlay.js';

// --- Test fixtures ---
import type { Commandment, CommandmentCategory, GameState, Region, Nation, DivinePower, GameEvent, EraId, FollowerVoice, Petition } from '../../types/game.js';
import { ERAS, VOICES } from '../../config/constants.js';

function makeCommandment(id: string, category: CommandmentCategory, tensionsWith: string[] = []): Commandment {
  return {
    id,
    category,
    name: id.replace(/_/g, ' '),
    flavorText: 'Test flavor.',
    effects: {},
    tensionsWith,
  };
}

function makeMinimalGameState(): GameState {
  return {
    phase: 'playing',
    world: {
      seed: 1,
      currentYear: 1650,
      currentTick: 5,
      regions: new Map(),
      nations: new Map(),
      religions: new Map(),
      armies: new Map(),
      tradeRoutes: new Map(),
      diseases: [],
      scienceProgress: { currentLevel: 0, milestonesReached: [], globalResearchOutput: 0 },
      alienState: {
        arrivalYear: 2200,
        signalDetectedYear: 2050,
        confirmedYear: 2100,
        revealedToPlayer: false,
        fleetStrength: 0,
        defenseGridStrength: 0,
        harbinger: {
          budgetRemaining: 10,
          lastActionTick: 0,
          corruptedRegionIds: [],
          veiledRegionIds: [],
          immuneRegionIds: [],
          playerStrategyAssessment: 'balanced',
          actionsLog: [],
        },
      },
      currentEra: 'exploration',
    },
    divineState: {
      energy: 10,
      maxEnergy: 20,
      regenPerMinute: 1,
      cooldowns: new Map(),
      totalInterventions: 3,
      blessingsUsed: 2,
      disastersUsed: 1,
      hypocrisyEvents: 0,
      lastDisasterYear: 0,
      lastMiracleYear: 0,
    },
    whisperState: {
      lastWhisperTime: 0,
      lastWhisperRegionId: null,
      lastWhisperType: null,
      regionCooldowns: new Map(),
      compoundStacksByNation: new Map(),
    },
    comboWindowState: {
      lastShieldCastByRegion: new Map(),
      lastMiracleCastByRegion: new Map(),
    },
    playerReligionId: 'player_faith',
    selectedCommandments: [],
    eventHistory: [],
    eraNarratives: new Map(),
    pivotalMoments: [],
    speedMultiplier: 1,
    realTimeElapsed: 0,
    divineOverlayActive: false,
    voiceRecords: [],
    hypocrisyLevel: 0,
    prngState: 42,
  };
}

function makePowers(): DivinePower[] {
  return [
    { id: 'bountiful_harvest', name: 'Bountiful Harvest', type: 'blessing', cost: 2, cooldownMinutes: 2, durationGameYears: 10, description: '' },
    { id: 'great_storm',       name: 'Great Storm',       type: 'disaster', cost: 2, cooldownMinutes: 3, durationGameYears: 5,  description: '' },
    { id: 'inspiration',       name: 'Inspiration',       type: 'blessing', cost: 3, cooldownMinutes: 4, durationGameYears: 15, description: '' },
    { id: 'great_flood',       name: 'Great Flood',       type: 'disaster', cost: 3, cooldownMinutes: 5, durationGameYears: 5,  description: '' },
    { id: 'shield_of_faith',   name: 'Shield of Faith',   type: 'blessing', cost: 3, cooldownMinutes: 4, durationGameYears: 10, description: '' },
    { id: 'miracle',           name: 'Miracle',           type: 'blessing', cost: 4, cooldownMinutes: 6, durationGameYears: null, description: '' },
  ];
}

function makeEvent(id: string, category: GameEvent['category'] = 'political', withChoice = false): GameEvent {
  return {
    id,
    category,
    title: `Event ${id}`,
    description: `Description for ${id}`,
    year: 1650,
    affectedRegions: [],
    choices: withChoice ? [{ label: 'Option A', description: 'Do this', outcome: { effects: {}, narrativeText: 'Done.' } }] : undefined,
  };
}

// =============================================================================
// UI-001 to UI-010 — Settings Store
// =============================================================================

describe('UI-001 DEFAULT_SETTINGS has all required fields', () => {
  it('all fields present with correct defaults', () => {
    expect(DEFAULT_SETTINGS.sfxEnabled).toBe(true);
    expect(DEFAULT_SETTINGS.sfxVolume).toBe(80);
    expect(DEFAULT_SETTINGS.reducedMotion).toBe(false);
    expect(DEFAULT_SETTINGS.leftHandMode).toBe(false);
    expect(DEFAULT_SETTINGS.speedDefault).toBe(1);
    expect(DEFAULT_SETTINGS.fontScaling).toBe(1.0);
    expect(DEFAULT_SETTINGS.colorblindMode).toBe('off');
    expect(DEFAULT_SETTINGS.showTutorialTips).toBe(true);
  });
});

describe('UI-002 loadSettings returns defaults in test env (no localStorage)', () => {
  it('returns DEFAULT_SETTINGS structure', () => {
    const settings = loadSettings();
    expect(settings.sfxEnabled).toBe(true);
    expect(settings.speedDefault).toBe(1);
  });
});

describe('UI-003 DEFAULT_TUTORIAL initial state', () => {
  it('has no completed tooltips', () => {
    const t = DEFAULT_TUTORIAL;
    expect(t.phase1Skipped).toBe(false);
    expect(t.completedTooltips).toHaveLength(0);
  });
});

// =============================================================================
// UI-004 to UI-008 — Menu Scene
// =============================================================================

describe('UI-004 ARCHETYPES has 3 entries', () => {
  it('shepherd, judge, conqueror', () => {
    expect(ARCHETYPES).toHaveLength(3);
    const ids = ARCHETYPES.map(a => a.id);
    expect(ids).toContain('shepherd');
    expect(ids).toContain('judge');
    expect(ids).toContain('conqueror');
  });
});

describe('UI-005 getArchetypeCommandmentPreset returns 10 commandments', () => {
  it('10 commandments per archetype', () => {
    expect(getArchetypeCommandmentPreset('shepherd')).toHaveLength(10);
    expect(getArchetypeCommandmentPreset('judge')).toHaveLength(10);
    expect(getArchetypeCommandmentPreset('conqueror')).toHaveLength(10);
  });
});

describe('UI-006 buildResultsHeadline covers all outcomes', () => {
  it('win', () => {
    const r = buildResultsHeadline('win');
    expect(r.headline).toBe('Humanity Saved.');
    expect(r.subheadline).toBeTruthy();
  });
  it('lose', () => {
    const r = buildResultsHeadline('lose');
    expect(r.headline).toBe('Humanity Fell.');
  });
  it('ascension', () => {
    const r = buildResultsHeadline('ascension');
    expect(r.headline).toBe('Ascension.');
  });
});

describe('UI-007 WORLD_GEN_LOADING_TEXTS progression', () => {
  it('has 4 texts', () => {
    expect(WORLD_GEN_LOADING_TEXTS).toHaveLength(4);
  });
  it('getWorldGenText clamps to last', () => {
    expect(getWorldGenText(99)).toBe(WORLD_GEN_LOADING_TEXTS[3]);
  });
  it('getWorldGenText phase 0', () => {
    expect(getWorldGenText(0)).toBe(WORLD_GEN_LOADING_TEXTS[0]);
  });
});

describe('UI-008 SETTINGS_SCHEMA covers all groups', () => {
  it('has Audio, Feel, Controls, Display, Tutorial', () => {
    const groups = SETTINGS_SCHEMA.map(s => s.group);
    expect(groups).toContain('Audio');
    expect(groups).toContain('Feel');
    expect(groups).toContain('Controls');
    expect(groups).toContain('Display');
    expect(groups).toContain('Tutorial');
  });
});

// =============================================================================
// UI-009 to UI-020 — Commandment Selection
// =============================================================================

describe('UI-009 createSelectionState initial values', () => {
  it('empty selection, grid mode, all category', () => {
    const s = createSelectionState(false);
    expect(s.mode).toBe('grid');
    expect(s.activeCategory).toBe('all');
    expect(s.selectedIds.size).toBe(0);
    expect(s.isFirstEarth).toBe(false);
  });
});

describe('UI-010 COMMANDMENT_PICK_TARGET is 10', () => {
  it('equals 10', () => {
    expect(COMMANDMENT_PICK_TARGET).toBe(10);
  });
});

describe('UI-011 toggleSelect adds and removes', () => {
  it('selects a commandment', () => {
    const s = createSelectionState(false);
    const next = toggleSelect(s, 'cmd_a');
    expect(next.selectedIds.has('cmd_a')).toBe(true);
  });
  it('deselects on second toggle', () => {
    let s = createSelectionState(false);
    s = toggleSelect(s, 'cmd_a');
    s = toggleSelect(s, 'cmd_a');
    expect(s.selectedIds.has('cmd_a')).toBe(false);
  });
  it('does not exceed cap of 10', () => {
    let s = createSelectionState(false);
    for (let i = 0; i < 11; i++) {
      s = toggleSelect(s, `cmd_${i}`);
    }
    expect(s.selectedIds.size).toBe(10);
  });
});

describe('UI-012 canSelect returns false when at cap', () => {
  it('returns true below cap', () => {
    const s = createSelectionState(false);
    expect(canSelect(s, 'cmd_a')).toBe(true);
  });
  it('returns false when at cap', () => {
    let s = createSelectionState(false);
    for (let i = 0; i < 10; i++) s = toggleSelect(s, `cmd_${i}`);
    expect(canSelect(s, 'cmd_extra')).toBe(false);
  });
});

describe('UI-013 isConfirmEnabled only when 10 selected', () => {
  it('false at 9', () => {
    let s = createSelectionState(false);
    for (let i = 0; i < 9; i++) s = toggleSelect(s, `cmd_${i}`);
    expect(isConfirmEnabled(s)).toBe(false);
  });
  it('true at 10', () => {
    let s = createSelectionState(false);
    for (let i = 0; i < 10; i++) s = toggleSelect(s, `cmd_${i}`);
    expect(isConfirmEnabled(s)).toBe(true);
  });
});

describe('UI-014 detectTensionPairs', () => {
  it('finds 1 tension pair', () => {
    const cmds = [
      makeCommandment('a', 'expansion', ['b']),
      makeCommandment('b', 'conflict', ['a']),
      makeCommandment('c', 'knowledge'),
    ];
    const pairs = detectTensionPairs(['a', 'b', 'c'], cmds);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toContain('a');
    expect(pairs[0]).toContain('b');
  });
  it('no tensions if only one side selected', () => {
    const cmds = [
      makeCommandment('a', 'expansion', ['b']),
      makeCommandment('b', 'conflict', ['a']),
    ];
    const pairs = detectTensionPairs(['a'], cmds);
    expect(pairs).toHaveLength(0);
  });
});

describe('UI-015 CATEGORY_COLORS covers all 7 categories', () => {
  it('all categories have hex color', () => {
    const categories: CommandmentCategory[] = ['expansion', 'conflict', 'knowledge', 'society', 'divine', 'nature', 'morality'];
    for (const cat of categories) {
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('UI-016 filterCommandments by category', () => {
  it('filters to matching category', () => {
    const cmds = [
      makeCommandment('a', 'expansion'),
      makeCommandment('b', 'conflict'),
      makeCommandment('c', 'expansion'),
    ];
    const result = filterCommandments(cmds, {
      category: 'expansion', searchQuery: '', showTensionsOnly: false,
      selectedIds: [], swappingId: null, isFirstEarth: false,
    });
    expect(result.map(c => c.id)).toEqual(['a', 'c']);
  });
});

describe('UI-017 filterCommandments search query', () => {
  it('matches name', () => {
    const cmds = [makeCommandment('holy_war', 'conflict'), makeCommandment('peaceful_expansion', 'expansion')];
    const result = filterCommandments(cmds, {
      category: 'all', searchQuery: 'peaceful', showTensionsOnly: false,
      selectedIds: [], swappingId: null, isFirstEarth: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('peaceful_expansion');
  });
});

// =============================================================================
// UI-018 to UI-025 — HUD
// =============================================================================

describe('UI-018 buildHudSnapshot basic fields', () => {
  it('captures year and energy', () => {
    const state = makeMinimalGameState();
    const snap = buildHudSnapshot(state, false, false, 1.0, false);
    expect(snap.year).toBe(1650);
    expect(snap.energy).toBe(10);
    expect(snap.maxEnergy).toBe(20);
    expect(snap.speedMultiplier).toBe(1);
    expect(snap.isPaused).toBe(false);
  });
});

describe('UI-019 cycleSpeed wraps around', () => {
  it('1 → 2 → 4 → 1', () => {
    expect(cycleSpeed(1)).toBe(2);
    expect(cycleSpeed(2)).toBe(4);
    expect(cycleSpeed(4)).toBe(1);
  });
});

describe('UI-020 speedLabel', () => {
  it('returns N× format', () => {
    expect(speedLabel(1)).toBe('1×');
    expect(speedLabel(4)).toBe('4×');
  });
});

describe('UI-021 getPrayerCountLabel', () => {
  it('empty when 0', () => {
    expect(getPrayerCountLabel(0)).toBe('');
  });
  it('returns count string', () => {
    expect(getPrayerCountLabel(3)).toBe('3');
  });
});

describe('UI-022 ARIA labels', () => {
  it('getFabAriaLabel contains "Divine powers"', () => {
    expect(getFabAriaLabel()).toContain('Divine powers');
  });
  it('getEnergyAriaLabel includes values', () => {
    expect(getEnergyAriaLabel(10, 20)).toContain('10');
    expect(getEnergyAriaLabel(10, 20)).toContain('20');
  });
  it('getSpeedAriaLabel includes speed', () => {
    expect(getSpeedAriaLabel(2)).toContain('2');
  });
});

describe('UI-023 getHudVisibility by phase', () => {
  it('playing = full', () => {
    const s = makeMinimalGameState();
    expect(getHudVisibility(s)).toBe('full');
  });
  it('era_transition = hidden', () => {
    const s = { ...makeMinimalGameState(), phase: 'era_transition' as const };
    expect(getHudVisibility(s)).toBe('hidden');
  });
  it('event_choice = dimmed', () => {
    const s = { ...makeMinimalGameState(), phase: 'event_choice' as const };
    expect(getHudVisibility(s)).toBe('dimmed');
  });
});

// =============================================================================
// UI-024 to UI-035 — FAB
// =============================================================================

describe('UI-024 getUnlockedPowerIds by era', () => {
  it('renaissance unlocks 2 powers', () => {
    const ids = getUnlockedPowerIds('renaissance');
    expect(ids).toHaveLength(2);
    expect(ids).toContain('bountiful_harvest');
    expect(ids).toContain('great_storm');
  });
  it('empire unlocks 12 powers', () => {
    const ids = getUnlockedPowerIds('empire');
    expect(ids).toHaveLength(12);
  });
  it('later eras include all previous powers', () => {
    const empireIds = getUnlockedPowerIds('empire');
    expect(empireIds).toContain('bountiful_harvest');
    expect(empireIds).toContain('great_storm');
    expect(empireIds).toContain('inspiration');
    expect(empireIds).toContain('golden_age');
    expect(empireIds).toContain('earthquake');
  });
});

describe('UI-025 getUnlockedPowers filters by era', () => {
  it('renaissance returns 2 matching DivinePower objects', () => {
    const powers = makePowers();
    const result = getUnlockedPowers(powers, 'renaissance');
    expect(result).toHaveLength(2);
  });
});

describe('UI-026 selectContextPowers always includes cheapest blessing + disaster', () => {
  it('has cheapest_blessing and cheapest_disaster slots', () => {
    const state = makeMinimalGameState();
    const powers = getUnlockedPowers(makePowers(), 'exploration');
    const slots = selectContextPowers(state, powers);
    const reasons = slots.map(s => s.reason);
    expect(reasons).toContain('cheapest_blessing');
    expect(reasons).toContain('cheapest_disaster');
  });
});

describe('UI-027 computeArcLayout geometry', () => {
  it('blessing buttons have negative y (upward)', () => {
    const state = makeMinimalGameState();
    const powers = getUnlockedPowers(makePowers(), 'exploration');
    const slots = selectContextPowers(state, powers);
    const layout = computeArcLayout(slots, state, false, false);
    for (const btn of layout.blessingButtons) {
      expect(btn.y).toBeLessThan(0);
    }
  });
  it('disaster buttons have negative y (upward)', () => {
    const state = makeMinimalGameState();
    const powers = getUnlockedPowers(makePowers(), 'exploration');
    const slots = selectContextPowers(state, powers);
    const layout = computeArcLayout(slots, state, false, false);
    for (const btn of layout.disasterButtons) {
      expect(btn.y).toBeLessThan(0);
    }
  });
  it('eye at (0, -130)', () => {
    const state = makeMinimalGameState();
    const slots = selectContextPowers(state, []);
    const layout = computeArcLayout(slots, state, false, false);
    expect(layout.eyePosition.x).toBe(0);
    expect(layout.eyePosition.y).toBe(-130);
  });
});

describe('UI-028 FAB state machine transitions', () => {
  it('open → opening → open', () => {
    let s = createFabMenuState();
    expect(s.state).toBe('closed');
    s = fabOpen(s);
    expect(s.state).toBe('opening');
    s = fabOpenComplete(s);
    expect(s.state).toBe('open');
    expect(isOpen(s)).toBe(true);
  });
  it('close → closing → closed', () => {
    let s = createFabMenuState();
    s = fabOpen(s); s = fabOpenComplete(s);
    s = fabClose(s);
    expect(s.state).toBe('closing');
    s = fabCloseComplete(s);
    expect(s.state).toBe('closed');
    expect(isOpen(s)).toBe(false);
  });
  it('select power → targeting', () => {
    let s = createFabMenuState();
    s = fabOpen(s); s = fabOpenComplete(s);
    s = fabSelectPower(s, 'bountiful_harvest');
    expect(s.state).toBe('targeting');
    expect(s.targetingPowerId).toBe('bountiful_harvest');
  });
  it('cancel targeting → closed', () => {
    let s = createFabMenuState();
    s = fabOpen(s); s = fabOpenComplete(s);
    s = fabSelectPower(s, 'bountiful_harvest');
    s = fabCancelTargeting(s);
    expect(s.state).toBe('closed');
    expect(s.targetingPowerId).toBeNull();
  });
});

describe('UI-029 FABMenu class open/close/isOpen', () => {
  it('opens and closes', () => {
    const fab = new FABMenu({ powers: [], onPowerSelect: () => {} });
    expect(fab.isOpen()).toBe(false);
    fab.open();
    expect(fab.getState().state).toBe('opening');
    fab.close();
    expect(fab.getState().state).toBe('closing');
  });
});

describe('UI-030 getTargetingBannerText', () => {
  it('includes power name', () => {
    const power: DivinePower = {
      id: 'bountiful_harvest', name: 'Bountiful Harvest',
      type: 'blessing', cost: 2, cooldownMinutes: 2, durationGameYears: 10, description: '',
    };
    const text = getTargetingBannerText(power);
    expect(text).toContain('Bountiful Harvest');
    expect(text).toContain('tap a region');
  });
});

// =============================================================================
// UI-031 to UI-042 — Event Notifications
// =============================================================================

describe('UI-031 buildEventToast for choice event', () => {
  it('style is event_choice, autoDismissMs is null', () => {
    const event = makeEvent('evt_1', 'political', true);
    const toast = buildEventToast(event, 1);
    expect(toast.style).toBe('event_choice');
    expect(toast.autoDismissMs).toBeNull();
    expect(toast.eventId).toBe('evt_1');
  });
});

describe('UI-032 buildEventToast for informational event', () => {
  it('style is informational, auto-dismisses in 5s', () => {
    const event = makeEvent('evt_2', 'cultural', false);
    const toast = buildEventToast(event, 1);
    expect(toast.style).toBe('informational');
    expect(toast.autoDismissMs).toBe(5000);
  });
});

describe('UI-033 buildMilestoneToast', () => {
  it('auto-dismisses in 4s', () => {
    const t = buildMilestoneToast('1M followers!');
    expect(t.style).toBe('milestone');
    expect(t.autoDismissMs).toBe(4000);
  });
});

describe('UI-034 buildComboToast', () => {
  it('auto-dismisses in 5s, has combo style', () => {
    const t = buildComboToast('Quake Scatter', 'Army dispersed!');
    expect(t.style).toBe('combo');
    expect(t.autoDismissMs).toBe(5000);
  });
});

describe('UI-035 EVENT_QUEUE_MAX is 5', () => {
  it('equals 5', () => {
    expect(EVENT_QUEUE_MAX).toBe(5);
  });
});

describe('UI-036 enqueueEvent', () => {
  it('first event becomes currentEvent immediately', () => {
    let q = createEventQueueState();
    q = enqueueEvent(q, makeEvent('e1'));
    expect(q.currentEvent?.id).toBe('e1');
    expect(q.pending).toHaveLength(0);
  });
  it('second event goes to pending', () => {
    let q = createEventQueueState();
    q = enqueueEvent(q, makeEvent('e1'));
    q = enqueueEvent(q, makeEvent('e2'));
    expect(q.currentEvent?.id).toBe('e1');
    expect(q.pending).toHaveLength(1);
  });
  it('auto-resolves excess when queue full', () => {
    let q = createEventQueueState();
    for (let i = 0; i < 6; i++) q = enqueueEvent(q, makeEvent(`e${i}`));
    expect(q.autoResolvedCount).toBeGreaterThan(0);
  });
});

describe('UI-037 resolveCurrentEvent advances queue', () => {
  it('next pending becomes current', () => {
    let q = createEventQueueState();
    q = enqueueEvent(q, makeEvent('e1'));
    q = enqueueEvent(q, makeEvent('e2'));
    q = resolveCurrentEvent(q, 0);
    expect(q.currentEvent?.id).toBe('e2');
    expect(q.pending).toHaveLength(0);
  });
});

describe('UI-038 getQueueBadgeCount', () => {
  it('0 when empty', () => {
    const q = createEventQueueState();
    expect(getQueueBadgeCount(q)).toBe(0);
  });
  it('counts current + pending', () => {
    let q = createEventQueueState();
    q = enqueueEvent(q, makeEvent('e1'));
    q = enqueueEvent(q, makeEvent('e2'));
    q = enqueueEvent(q, makeEvent('e3'));
    expect(getQueueBadgeCount(q)).toBe(3);
  });
});

describe('UI-039 buildEventCardChoices always appends Stay Silent', () => {
  it('has n+1 choices (Stay Silent added)', () => {
    const event = makeEvent('e1', 'political', true);
    const choices = buildEventCardChoices(event);
    expect(choices).toHaveLength(2); // 1 real + 1 Stay Silent
    expect(choices[choices.length - 1].label).toBe('Stay Silent');
  });
  it('Stay Silent always present even with 0 event choices', () => {
    const event = makeEvent('e_no_choice', 'cultural', false);
    const choices = buildEventCardChoices(event);
    expect(choices).toHaveLength(1);
    expect(choices[0].label).toBe('Stay Silent');
  });
});

describe('UI-040 priority ordering — conflict before political', () => {
  it('military event sorts before political in pending', () => {
    let q = createEventQueueState();
    q = enqueueEvent(q, makeEvent('political_1', 'political'));
    q = enqueueEvent(q, makeEvent('political_2', 'political'));
    q = enqueueEvent(q, makeEvent('military_1', 'military'));
    // First event is already current; military_1 should be first in pending
    expect(q.pending[0].id).toBe('military_1');
  });
});

// =============================================================================
// UI-041 to UI-050 — Bottom Sheet
// =============================================================================

describe('UI-041 createBottomSheetState', () => {
  it('starts hidden', () => {
    const s = createBottomSheetState();
    expect(s.snap).toBe('hidden');
    expect(s.regionId).toBeNull();
  });
});

describe('UI-042 sheetOpenRegion sets snap to peek', () => {
  it('opens at peek', () => {
    const s = sheetOpenRegion(createBottomSheetState(), 'region_1');
    expect(s.snap).toBe('peek');
    expect(s.regionId).toBe('region_1');
    expect(s.isAnimating).toBe(true);
  });
  it('same region keeps current snap', () => {
    let s = sheetOpenRegion(createBottomSheetState(), 'region_1');
    s = sheetSetSnap(s, 'half');
    s = { ...s, isAnimating: false };
    s = sheetOpenRegion(s, 'region_1');
    expect(s.snap).toBe('half');
  });
});

describe('UI-043 sheetSetSnap transitions', () => {
  it('peek → half → full', () => {
    let s = sheetOpenRegion(createBottomSheetState(), 'region_1');
    s = sheetSetSnap(s, 'half');
    expect(s.snap).toBe('half');
    expect(isExpanded(s)).toBe(true);
    s = sheetSetSnap(s, 'full');
    expect(s.snap).toBe('full');
    expect(isExpanded(s)).toBe(true);
  });
});

describe('UI-044 sheetDismiss', () => {
  it('resets to hidden, clears regionId', () => {
    let s = sheetOpenRegion(createBottomSheetState(), 'region_1');
    s = sheetDismiss(s);
    expect(s.snap).toBe('hidden');
    expect(s.regionId).toBeNull();
  });
});

describe('UI-045 SHEET_SNAP_HEIGHTS', () => {
  it('peek is 120, half is 50%, full is 85%', () => {
    expect(SHEET_SNAP_HEIGHTS.peek).toBe(120);
    expect(SHEET_SNAP_HEIGHTS.half).toBe('50%');
    expect(SHEET_SNAP_HEIGHTS.full).toBe('85%');
  });
});

describe('UI-046 buildWhisperButtons', () => {
  it('returns 4 buttons', () => {
    const buttons = buildWhisperButtons(new Map(), 'region_1', 0);
    expect(buttons).toHaveLength(4);
    const types = buttons.map(b => b.type);
    expect(types).toContain('war');
    expect(types).toContain('peace');
    expect(types).toContain('science');
    expect(types).toContain('faith');
  });
  it('marks cooldown correctly', () => {
    const cooldowns = new Map([['region_1:war', 100]]); // expires at t=100
    const buttons = buildWhisperButtons(cooldowns, 'region_1', 50); // now=50
    const warBtn = buttons.find(b => b.type === 'war')!;
    expect(warBtn.isOnCooldown).toBe(true);
    expect(warBtn.cooldownRemainingMs).toBe(50_000);
  });
});

describe('UI-047 BottomSheet class expand/collapse', () => {
  it('expand sets full snap', () => {
    const sheet = new BottomSheet({
      region: {} as Region,
      nation: {} as Nation,
      onClose: () => {},
    });
    sheet.expand();
    expect(sheet.getState().snap).toBe('full');
    expect(sheet.isExpanded()).toBe(true);
  });
  it('collapse returns to peek', () => {
    const sheet = new BottomSheet({
      region: {} as Region,
      nation: {} as Nation,
      onClose: () => {},
    });
    sheet.expand();
    sheet.collapse();
    expect(sheet.getState().snap).toBe('peek');
  });
});

// =============================================================================
// UI-048 to UI-057 — Divine Overlay
// =============================================================================

describe('UI-048 createOverlayState', () => {
  it('inactive, religion layer, only religion unlocked', () => {
    const s = createOverlayState();
    expect(s.active).toBe(false);
    expect(s.activeLayer).toBe('religion');
    expect(s.unlockedLayers.has('religion')).toBe(true);
    expect(s.unlockedLayers.has('military')).toBe(false);
  });
});

describe('UI-049 toggleOverlay', () => {
  it('flips active state', () => {
    let s = createOverlayState();
    s = toggleOverlay(s);
    expect(s.active).toBe(true);
    s = toggleOverlay(s);
    expect(s.active).toBe(false);
  });
});

describe('UI-050 setOverlayLayer', () => {
  it('does not change to locked layer', () => {
    let s = createOverlayState();
    s = setOverlayLayer(s, 'military');
    expect(s.activeLayer).toBe('religion'); // military not unlocked yet
  });
  it('changes to unlocked layer', () => {
    let s = createOverlayState();
    s = unlockOverlayLayer(s, 'military');
    s = setOverlayLayer(s, 'military');
    expect(s.activeLayer).toBe('military');
  });
});

describe('UI-051 OVERLAY_LAYERS has 4 layers', () => {
  it('religion, military, trade, science', () => {
    expect(OVERLAY_LAYERS).toHaveLength(4);
    const ids = OVERLAY_LAYERS.map(l => l.id);
    expect(ids).toContain('religion');
    expect(ids).toContain('military');
    expect(ids).toContain('trade');
    expect(ids).toContain('science');
  });
});

describe('UI-052 buildLayerPickerButtons', () => {
  it('shows correct active and unlocked states', () => {
    let s = createOverlayState();
    s = unlockOverlayLayer(s, 'military');
    const buttons = buildLayerPickerButtons(s);
    const religion = buttons.find(b => b.layer === 'religion')!;
    const military = buttons.find(b => b.layer === 'military')!;
    const trade = buttons.find(b => b.layer === 'trade')!;
    expect(religion.isActive).toBe(true);
    expect(religion.isUnlocked).toBe(true);
    expect(military.isUnlocked).toBe(true);
    expect(military.isActive).toBe(false);
    expect(trade.isUnlocked).toBe(false);
  });
});

describe('UI-053 OVERLAY_REGION_DIM_OPACITY', () => {
  it('is 0.15', () => {
    expect(OVERLAY_REGION_DIM_OPACITY).toBe(0.15);
  });
});

// =============================================================================
// UI-054 to UI-060 — Era Screen
// =============================================================================

describe('UI-054 formatFollowers', () => {
  it('1M+ format', () => {
    expect(formatFollowers(1_500_000)).toContain('M');
  });
  it('1K+ format', () => {
    expect(formatFollowers(5_000)).toContain('K');
  });
  it('small numbers as-is', () => {
    expect(formatFollowers(500)).toBe('500');
  });
});

describe('UI-055 getEraYearRange', () => {
  it('renaissance is 1600–1650', () => {
    expect(getEraYearRange('renaissance')).toBe('1600–1650');
  });
  it('arrival includes end year', () => {
    const range = getEraYearRange('arrival');
    expect(range).toContain('2150');
    expect(range).toContain('2200');
  });
});

describe('UI-056 ERA_SCREEN_BACKGROUNDS covers all 12 eras', () => {
  it('all eras have background hex', () => {
    for (const era of ERAS) {
      const bg = ERA_SCREEN_BACKGROUNDS[era.id as EraId];
      expect(bg).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('UI-057 ERA timing constants', () => {
  it('morph is 3000ms', () => {
    expect(ERA_MORPH_DURATION_MS).toBe(3000);
  });
  it('card entry is 500ms', () => {
    expect(ERA_CARD_ENTRY_MS).toBe(500);
  });
});

describe('UI-058 session milestone tracker', () => {
  it('no toast before cooldown expires', () => {
    const tracker = createSessionTracker(0);
    const { toast } = checkSessionMilestone(tracker, 1000); // 1 second later
    expect(toast).toBeNull();
  });
  it('returns toast when threshold met and cooldown passed', () => {
    let tracker = createSessionTracker(0);
    tracker = { ...tracker, eventsResolved: 3, lastMilestoneMs: 0 };
    const { toast } = checkSessionMilestone(tracker, 3 * 60 * 1000); // 3 minutes later
    expect(toast).not.toBeNull();
    expect(toast!.style).toBe('session_milestone');
  });
});

// =============================================================================
// Session 8 Tests — UI-059 to UI-100
// =============================================================================

// ---------------------------------------------------------------------------
// Helpers for Session 8 tests
// ---------------------------------------------------------------------------

function makeVoice(
  id: string,
  type: FollowerVoice['type'],
  regionId = 'region_1',
  loyalty = 0.7,
  petition: Petition | null = null,
): FollowerVoice {
  return {
    id,
    type,
    name: `Voice ${id}`,
    regionId,
    loyalty,
    birthYear: 1600,
    lifespanYears: 150,
    eraBorn: 'renaissance',
    lineageOf: null,
    currentPetition: petition,
  };
}

function makePetition(voiceId: string, type = 'bless_region', expiryTime = 9999): Petition {
  return {
    voiceId,
    type,
    requestText: `Please help ${voiceId}.`,
    expiryTime,
  };
}

function makeArmyInRegion(state: GameState, regionId: string): GameState {
  const army = {
    id: 'army_1',
    nationId: 'nation_1',
    strength: 5000,
    morale: 0.8,
    currentRegionId: regionId,
    state: 'garrisoned' as const,
    commander: null,
    supplyRange: 3,
  };
  const armies = new Map(state.world.armies);
  armies.set('army_1', army);
  return { ...state, world: { ...state.world, armies } };
}

function makeTradeRoute(state: GameState): GameState {
  const route = {
    id: 'route_1',
    regionA: 'region_1',
    regionB: 'region_2',
    distance: 2,
    volume: 0.8,
    isActive: true,
  };
  const tradeRoutes = new Map(state.world.tradeRoutes);
  tradeRoutes.set('route_1', route);
  return { ...state, world: { ...state.world, tradeRoutes } };
}

function makeRegionWithDev(state: GameState, regionId: string, dev: number): GameState {
  const region: Region = {
    id: regionId,
    nationId: 'nation_1',
    position: { x: 0, y: 0 },
    vertices: [],
    terrain: 'plains',
    population: 10000,
    development: dev,
    happiness: 0.7,
    economicOutput: 100,
    faithStrength: 0.5,
    religiousInfluence: [],
    dominantReligion: 'player_faith',
    hasCity: true,
    cityLevel: 1,
    adjacentRegionIds: [],
    activeEffects: [],
    isQuarantined: false,
    isCapital: false,
  };
  const regions = new Map(state.world.regions);
  regions.set(regionId, region);
  return { ...state, world: { ...state.world, regions } };
}

// =============================================================================
// UI-059 to UI-065 — Task 3.9 FAB Dual-Arc UI
// =============================================================================

describe('UI-059 getComboEligiblePowerIds — empty world', () => {
  it('returns empty set when world has no armies/routes/dev', () => {
    const state = makeMinimalGameState();
    const eligible = getComboEligiblePowerIds(state);
    // Without armies, routes, or high-dev regions, only whisper-related combos can fire
    // In empty state: shield_miracle window is empty, no voices, no corruption
    expect(eligible.size).toBe(0);
  });
});

describe('UI-060 getComboEligiblePowerIds — army in region enables quake_scatter', () => {
  it('earthquake becomes eligible when an army is present', () => {
    let state = makeMinimalGameState();
    state = makeArmyInRegion(state, 'region_1');
    const eligible = getComboEligiblePowerIds(state);
    expect(eligible.has('earthquake')).toBe(true);
  });
});

describe('UI-061 getComboEligiblePowerIds — trade route enables storm_fleet and plague_trade', () => {
  it('great_storm and plague both eligible with active route', () => {
    let state = makeMinimalGameState();
    state = makeTradeRoute(state);
    const eligible = getComboEligiblePowerIds(state);
    expect(eligible.has('great_storm')).toBe(true);
    expect(eligible.has('plague')).toBe(true);
  });
});

describe('UI-062 getComboEligiblePowerIds — dev 6+ enables harvest_golden', () => {
  it('bountiful_harvest becomes eligible at dev 6+', () => {
    let state = makeMinimalGameState();
    state = makeRegionWithDev(state, 'region_1', 6);
    const eligible = getComboEligiblePowerIds(state);
    expect(eligible.has('bountiful_harvest')).toBe(true);
  });
  it('bountiful_harvest NOT eligible at dev 5', () => {
    let state = makeMinimalGameState();
    state = makeRegionWithDev(state, 'region_1', 5);
    const eligible = getComboEligiblePowerIds(state);
    expect(eligible.has('bountiful_harvest')).toBe(false);
  });
});

describe('UI-063 getComboEligiblePowerIds — prophet voice enables inspire_prophet', () => {
  it('inspiration eligible when prophet voice exists', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [makeVoice('v1', 'prophet', 'region_1')],
    };
    const eligible = getComboEligiblePowerIds(state);
    expect(eligible.has('inspiration')).toBe(true);
  });
});

describe('UI-064 computeDualArcLayout — combo hints populated', () => {
  it('blessing buttons have hasComboHint=true when combo eligible', () => {
    let state = makeMinimalGameState();
    state = makeArmyInRegion(state, 'region_1');
    // Add earthquake to powers
    const earthquake: DivinePower = {
      id: 'earthquake', name: 'Earthquake', type: 'disaster',
      cost: 4, cooldownMinutes: 6, durationGameYears: null, description: '',
    };
    const slots = [{ power: earthquake, reason: 'cheapest_disaster' as const }];
    const layout = computeDualArcLayout(slots, state, false, false);
    const eqBtn = layout.disasterButtons.find(b => b.power.id === 'earthquake');
    expect(eqBtn?.hasComboHint).toBe(true);
  });
});

describe('UI-065 DualArcFABMenu.setDualArcLayout', () => {
  it('starts with dual arc disabled, can enable', () => {
    const fab = new DualArcFABMenu({
      powers: [],
      onPowerSelect: () => {},
    });
    expect(fab.isDualArcEnabled()).toBe(false);
    fab.setDualArcLayout(true);
    expect(fab.isDualArcEnabled()).toBe(true);
    fab.setDualArcLayout(false);
    expect(fab.isDualArcEnabled()).toBe(false);
  });
  it('tracks newly unlocked power', () => {
    const fab = new DualArcFABMenu({ powers: [], onPowerSelect: () => {} });
    fab.setNewlyUnlocked('miracle');
    expect(fab.getNewlyUnlockedPowerId()).toBe('miracle');
    fab.setNewlyUnlocked(null);
    expect(fab.getNewlyUnlockedPowerId()).toBeNull();
  });
});

describe('UI-066 buildPowerUnlockToastText', () => {
  it('includes power name in toast text', () => {
    const power: DivinePower = {
      id: 'miracle', name: 'Miracle', type: 'blessing',
      cost: 4, cooldownMinutes: 6, durationGameYears: null, description: '',
    };
    const text = buildPowerUnlockToastText(power);
    expect(text).toContain('Miracle');
  });
});

describe('UI-067 shouldShowExpander', () => {
  it('false when < 5 powers', () => {
    const powers: DivinePower[] = Array.from({ length: 4 }, (_, i) => ({
      id: `p${i}`, name: `Power ${i}`, type: 'blessing' as const,
      cost: 2, cooldownMinutes: 2, durationGameYears: 10, description: '',
    }));
    expect(shouldShowExpander(powers)).toBe(false);
  });
  it('true when 5+ powers', () => {
    const powers: DivinePower[] = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`, name: `Power ${i}`, type: 'blessing' as const,
      cost: 2, cooldownMinutes: 2, durationGameYears: 10, description: '',
    }));
    expect(shouldShowExpander(powers)).toBe(true);
  });
});

// =============================================================================
// UI-068 to UI-073 — Task 3.12 Voice Map Icons + Character Profiles
// =============================================================================

describe('UI-068 VOICE_TYPE_COLORS has all 5 voice types', () => {
  it('all types have a color', () => {
    expect(VOICE_TYPE_COLORS.prophet).toBeTruthy();
    expect(VOICE_TYPE_COLORS.ruler).toBeTruthy();
    expect(VOICE_TYPE_COLORS.general).toBeTruthy();
    expect(VOICE_TYPE_COLORS.scholar).toBeTruthy();
    expect(VOICE_TYPE_COLORS.heretic).toBeTruthy();
  });
});

describe('UI-069 buildVoiceIcon', () => {
  it('correctly maps type to ring color', () => {
    const voice = makeVoice('v1', 'prophet');
    const icon = buildVoiceIcon(voice);
    expect(icon.ringColor).toBe(VOICE_TYPE_COLORS.prophet);
    expect(icon.voiceId).toBe('v1');
    expect(icon.hasPetition).toBe(false);
  });
  it('marks hasPetition when petition active', () => {
    const petition = makePetition('v1');
    const voice = makeVoice('v1', 'general', 'region_1', 0.7, petition);
    const icon = buildVoiceIcon(voice);
    expect(icon.hasPetition).toBe(true);
    expect(icon.ariaLabel).toContain('Has petition');
  });
});

describe('UI-070 buildVoiceProfile', () => {
  it('builds correct active years', () => {
    const voice = makeVoice('v1', 'ruler');
    const profile = buildVoiceProfile(voice, 1700, [voice]);
    expect(profile.activeYears).toBe(100); // 1700 - 1600
    expect(profile.typeLabel).toBe('Ruler');
    expect(profile.isLowLoyalty).toBe(false); // loyalty 0.7 > threshold 0.3
  });
  it('marks isLowLoyalty below betrayal threshold', () => {
    const voice = makeVoice('v1', 'prophet', 'region_1', 0.2);
    const profile = buildVoiceProfile(voice, 1700, [voice]);
    expect(profile.isLowLoyalty).toBe(true);
  });
});

describe('UI-071 getLoyaltyColor', () => {
  it('green for high loyalty', () => {
    expect(getLoyaltyColor(0.8)).toContain('#5c');
  });
  it('yellow for medium loyalty', () => {
    expect(getLoyaltyColor(0.5)).toContain('#f0');
  });
  it('red for low loyalty', () => {
    expect(getLoyaltyColor(0.2)).toContain('#d9');
  });
});

describe('UI-072 getPrimaryPetitioningVoice', () => {
  it('returns null when no petitions', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [makeVoice('v1', 'prophet')],
    };
    expect(getPrimaryPetitioningVoice(state)).toBeNull();
  });
  it('prefers heretic petition', () => {
    const p = makePetition('v_heretic');
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [
        makeVoice('v1', 'prophet', 'r1', 0.7, makePetition('v1')),
        makeVoice('v_heretic', 'heretic', 'r2', 0.2, p),
      ],
    };
    const primary = getPrimaryPetitioningVoice(state);
    expect(primary?.type).toBe('heretic');
  });
});

describe('UI-073 voice notification texts', () => {
  it('emergence toast mentions name', () => {
    const voice = makeVoice('v1', 'prophet');
    const text = buildVoiceEmergenceToastText(voice);
    expect(text).toContain('Voice v1');
    expect(text).toContain('Prophet');
  });
  it('death toast distinguishes war vs natural', () => {
    const voice = makeVoice('v1', 'general');
    expect(buildVoiceDeathToastText(voice, true)).toContain('fell in battle');
    expect(buildVoiceDeathToastText(voice, false)).toContain('passed');
  });
  it('betrayal toast mentions turning against', () => {
    const voice = makeVoice('v1', 'prophet');
    const text = buildVoiceBetrayalToastText(voice);
    expect(text).toContain('turned against');
  });
});

// =============================================================================
// UI-074 to UI-079 — Task 3.13 Combo Divine Chain Toast
// =============================================================================

describe('UI-074 COMBO_DISCOVERY_TEXT has all 9 combos', () => {
  it('all 9 combos have discovery text', () => {
    const ids = Object.keys(COMBO_DISCOVERY_TEXT);
    expect(ids).toHaveLength(9);
    expect(COMBO_DISCOVERY_TEXT.quake_scatter).toBeTruthy();
    expect(COMBO_DISCOVERY_TEXT.divine_purge).toBeTruthy();
  });
});

describe('UI-075 COMBO_NAMES has all 9 combos', () => {
  it('all 9 combos have a display name', () => {
    const names = Object.values(COMBO_NAMES);
    expect(names).toHaveLength(9);
    expect(names.every(n => n.startsWith('Divine Chain'))).toBe(true);
  });
});

describe('UI-076 buildComboToastData', () => {
  it('returns correct toast style and auto-dismiss', () => {
    const data = buildComboToastData('quake_scatter', true);
    expect(data.toast.style).toBe('combo');
    expect(data.toast.autoDismissMs).toBe(5000);
    expect(data.isFirstDiscovery).toBe(true);
    expect(data.comboName).toContain('Quake Scatter');
  });
  it('includes discovery text in subtitle', () => {
    const data = buildComboToastData('divine_purge', false);
    expect(data.toast.subtitle).toContain('corruption');
  });
});

describe('UI-077 FIRST_COMBO_TOOLTIP_TEXT is defined', () => {
  it('tooltip text is a non-empty string', () => {
    expect(typeof FIRST_COMBO_TOOLTIP_TEXT).toBe('string');
    expect(FIRST_COMBO_TOOLTIP_TEXT.length).toBeGreaterThan(10);
  });
});

describe('UI-078 getWhisperFeedbackText — untargeted', () => {
  it('returns success text for war whisper', () => {
    const text = getWhisperFeedbackText('war', false, 'success');
    expect(text).toContain('Aggression stirs');
  });
  it('returns resisted text for faith whisper', () => {
    const text = getWhisperFeedbackText('faith', false, 'resisted');
    expect(text).toContain("Faith doesn't come");
  });
});

describe('UI-079 getWhisperFeedbackText — targeted war/peace', () => {
  it('inserts target nation name', () => {
    const text = getWhisperFeedbackText('war', true, 'success', 'Valdorn');
    expect(text).toContain('Valdorn');
  });
  it('targeted peace success mentions olive branch', () => {
    const text = getWhisperFeedbackText('peace', true, 'success', 'Kavari');
    expect(text).toContain('olive branch');
    expect(text).toContain('Kavari');
  });
});

// =============================================================================
// UI-080 to UI-086 — Task 3.14 Petition UI in Bottom Sheet
// =============================================================================

describe('UI-080 buildPetitionUI — basic petition', () => {
  it('builds correct petition data for prophet', () => {
    const petition = makePetition('v1', 'bless_region', 10000);
    const voice = makeVoice('v1', 'prophet', 'region_1', 0.7, petition);
    const data = buildPetitionUI(voice, petition, 5000);
    expect(data.voiceId).toBe('v1');
    expect(data.voiceType).toBe('prophet');
    expect(data.remainingSec).toBe(5000);
    expect(data.isExpired).toBe(false);
    expect(data.isHeretic).toBe(false);
    expect(data.fulfillAction).not.toBeNull();
    expect(data.fulfillAction?.powerId).toBe('bountiful_harvest');
  });
});

describe('UI-081 buildPetitionUI — expired petition', () => {
  it('isExpired true when nowSec >= expiryTime', () => {
    const petition = makePetition('v1', 'bless_region', 5000);
    const voice = makeVoice('v1', 'prophet', 'region_1', 0.7, petition);
    const data = buildPetitionUI(voice, petition, 6000);
    expect(data.isExpired).toBe(true);
    expect(data.remainingSec).toBe(0);
  });
});

describe('UI-082 buildPetitionUI — heretic petition', () => {
  it('heretic petition has no fulfillAction but has heretikOptions', () => {
    const petition = makePetition('v_heretic', 'reform_commandment', 9999);
    const voice = makeVoice('v_heretic', 'heretic', 'region_1', 0.2, petition);
    const data = buildPetitionUI(voice, petition, 0);
    expect(data.isHeretic).toBe(true);
    expect(data.fulfillAction).toBeNull();
    expect(data.heretikOptions).toBeDefined();
    expect(data.heretikOptions!.suppressText).toBe('Suppress');
    expect(data.heretikOptions!.tolerateText).toBe('Tolerate');
  });
});

describe('UI-083 buildPetitionCounterState', () => {
  it('hidden when no petitions', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [makeVoice('v1', 'prophet')],
    };
    const counter = buildPetitionCounterState(state);
    expect(counter.isVisible).toBe(false);
    expect(counter.count).toBe(0);
  });
  it('visible with count when petitions pending', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [
        makeVoice('v1', 'prophet', 'r1', 0.7, makePetition('v1')),
        makeVoice('v2', 'ruler', 'r2', 0.7, makePetition('v2')),
      ],
    };
    const counter = buildPetitionCounterState(state);
    expect(counter.isVisible).toBe(true);
    expect(counter.count).toBe(2);
    expect(counter.hasHeretic).toBe(false);
  });
  it('hasHeretic true when heretic has petition', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [
        makeVoice('v1', 'heretic', 'r1', 0.2, makePetition('v1')),
      ],
    };
    const counter = buildPetitionCounterState(state);
    expect(counter.hasHeretic).toBe(true);
  });
});

describe('UI-084 isPetitionExpired', () => {
  it('false before expiry', () => {
    const p = makePetition('v1', 'bless_region', 100);
    expect(isPetitionExpired(p, 50)).toBe(false);
  });
  it('true at or after expiry', () => {
    const p = makePetition('v1', 'bless_region', 100);
    expect(isPetitionExpired(p, 100)).toBe(true);
    expect(isPetitionExpired(p, 200)).toBe(true);
  });
});

describe('UI-085 getAutoDenyLoyaltyLoss', () => {
  it('matches VOICES.LOYALTY_LOSS_AUTO_DENY constant', () => {
    expect(getAutoDenyLoyaltyLoss()).toBe(VOICES.LOYALTY_LOSS_AUTO_DENY);
  });
});

describe('UI-086 buildPetitionUI — general petition maps to correct power', () => {
  it('aid_in_battle maps to great_storm', () => {
    const petition = makePetition('v1', 'aid_in_battle', 9999);
    const voice = makeVoice('v1', 'general', 'region_1', 0.7, petition);
    const data = buildPetitionUI(voice, petition, 0);
    expect(data.fulfillAction?.powerId).toBe('great_storm');
  });
});

// =============================================================================
// UI-087 to UI-095 — Task 3.15 Harbinger Overlay + Indicators
// =============================================================================

describe('UI-087 buildAnomalyOverlayData — empty state', () => {
  it('returns empty array when no corrupted/veiled regions', () => {
    const state = makeMinimalGameState();
    const data = buildAnomalyOverlayData(state);
    expect(data).toHaveLength(0);
  });
});

describe('UI-088 buildAnomalyOverlayData — corrupted region', () => {
  it('includes corrupted region with moderate intensity', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: {
        ...makeMinimalGameState().world,
        alienState: {
          ...makeMinimalGameState().world.alienState,
          harbinger: {
            ...makeMinimalGameState().world.alienState.harbinger,
            corruptedRegionIds: ['region_corrupted'],
          },
        },
      },
    };
    const data = buildAnomalyOverlayData(state);
    expect(data).toHaveLength(1);
    expect(data[0].regionId).toBe('region_corrupted');
    expect(data[0].isCorrupted).toBe(true);
    expect(data[0].intensity).toBe('moderate');
    expect(data[0].showDataUnreliable).toBe(false);
  });
});

describe('UI-089 buildAnomalyOverlayData — veiled region', () => {
  it('showDataUnreliable is true for veiled regions', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: {
        ...makeMinimalGameState().world,
        alienState: {
          ...makeMinimalGameState().world.alienState,
          harbinger: {
            ...makeMinimalGameState().world.alienState.harbinger,
            veiledRegionIds: ['region_veiled'],
          },
        },
      },
    };
    const data = buildAnomalyOverlayData(state);
    expect(data).toHaveLength(1);
    expect(data[0].isVeiled).toBe(true);
    expect(data[0].showDataUnreliable).toBe(true);
  });
});

describe('UI-090 buildAnomalyOverlayData — corrupted + veiled = heavy', () => {
  it('intensity is heavy when both corrupted and veiled', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: {
        ...makeMinimalGameState().world,
        alienState: {
          ...makeMinimalGameState().world.alienState,
          harbinger: {
            ...makeMinimalGameState().world.alienState.harbinger,
            corruptedRegionIds: ['region_x'],
            veiledRegionIds: ['region_x'],
          },
        },
      },
    };
    const data = buildAnomalyOverlayData(state);
    const r = data.find(d => d.regionId === 'region_x');
    expect(r?.intensity).toBe('heavy');
    expect(r?.isCorrupted).toBe(true);
    expect(r?.isVeiled).toBe(true);
  });
});

describe('UI-091 isAnomalyLayerUnlocked', () => {
  it('false in early eras (e.g. revelation = era 10, index 9)', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: { ...makeMinimalGameState().world, currentEra: 'revelation' },
    };
    // revelation is index 9, VISIBILITY_OVERLAY_ERA = 10, so threshold = 10-1 = 9
    // eraIndex('revelation') = 9 >= 9 → true
    expect(isAnomalyLayerUnlocked(state)).toBe(true);
  });
  it('false in digital era (index 7)', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: { ...makeMinimalGameState().world, currentEra: 'digital' },
    };
    expect(isAnomalyLayerUnlocked(state)).toBe(false);
  });
});

describe('UI-092 buildHarbingerVFXData — empty before Era 10', () => {
  it('returns empty array before overlay era', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: { ...makeMinimalGameState().world, currentEra: 'industry' },
    };
    const vfx = buildHarbingerVFXData(state);
    expect(vfx).toHaveLength(0);
  });
});

describe('UI-093 buildHarbingerVFXData — VFX in Era 10+', () => {
  it('generates corruption_shimmer for corrupted regions', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: {
        ...makeMinimalGameState().world,
        currentEra: 'revelation',
        alienState: {
          ...makeMinimalGameState().world.alienState,
          harbinger: {
            ...makeMinimalGameState().world.alienState.harbinger,
            corruptedRegionIds: ['r_corrupt'],
          },
        },
      },
    };
    const vfx = buildHarbingerVFXData(state);
    const shimmer = vfx.find(v => v.type === 'corruption_shimmer');
    expect(shimmer).toBeDefined();
    expect(shimmer!.regionId).toBe('r_corrupt');
    expect(shimmer!.isVisible).toBe(true);
  });
  it('generates veil_shimmer for veiled regions', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: {
        ...makeMinimalGameState().world,
        currentEra: 'revelation',
        alienState: {
          ...makeMinimalGameState().world.alienState,
          harbinger: {
            ...makeMinimalGameState().world.alienState.harbinger,
            veiledRegionIds: ['r_veiled'],
          },
        },
      },
    };
    const vfx = buildHarbingerVFXData(state);
    const veil = vfx.find(v => v.type === 'veil_shimmer');
    expect(veil).toBeDefined();
    expect(veil!.regionId).toBe('r_veiled');
  });
});

describe('UI-094 HARBINGER_VFX_COLORS has all VFX types', () => {
  it('all 5 VFX types have colors', () => {
    expect(HARBINGER_VFX_COLORS.corruption_shimmer).toBeTruthy();
    expect(HARBINGER_VFX_COLORS.veil_shimmer).toBeTruthy();
    expect(HARBINGER_VFX_COLORS.sabotage_trail).toBeTruthy();
    expect(HARBINGER_VFX_COLORS.purge_effect).toBeTruthy();
    expect(HARBINGER_VFX_COLORS.discord_whisper).toBeTruthy();
  });
});

// =============================================================================
// UI-095 to UI-100 — Integration / Cross-Module
// =============================================================================

describe('UI-095 DualArcFABMenu.computeLayout with combo hints', () => {
  it('returns ArcLayout with blessing and disaster arrays', () => {
    const fab = new DualArcFABMenu({ powers: [], onPowerSelect: () => {} });
    fab.setDualArcLayout(true);
    const state = makeMinimalGameState();
    const harvest: DivinePower = {
      id: 'bountiful_harvest', name: 'Bountiful Harvest', type: 'blessing',
      cost: 2, cooldownMinutes: 2, durationGameYears: 10, description: '',
    };
    const layout = fab.computeLayout(
      [{ power: harvest, reason: 'cheapest_blessing' }],
      state, false, false,
    );
    expect(layout.blessingButtons).toHaveLength(1);
    expect(layout.disasterButtons).toHaveLength(0);
    expect(layout.eyePosition).toEqual({ x: 0, y: -130 });
  });
});

describe('UI-096 buildVoiceProfile lineage description', () => {
  it('includes lineage description when predecessor exists', () => {
    const ancestor = makeVoice('v_ancestor', 'prophet', 'r1');
    ancestor.id = 'v_ancestor';
    const descendant = makeVoice('v_descendant', 'prophet', 'r1');
    descendant.lineageOf = 'v_ancestor';
    const profile = buildVoiceProfile(descendant, 1700, [ancestor, descendant]);
    expect(profile.lineageDescription).toContain('Lineage of');
    expect(profile.lineageDescription).toContain('Voice v_ancestor');
  });
  it('null lineage when no predecessor', () => {
    const voice = makeVoice('v1', 'prophet');
    const profile = buildVoiceProfile(voice, 1700, [voice]);
    expect(profile.lineageDescription).toBeNull();
  });
});

describe('UI-097 buildPetitionUI — shield_of_faith for protect petitions', () => {
  it('protect_region maps to shield_of_faith', () => {
    const petition = makePetition('v1', 'protect_region', 9999);
    const voice = makeVoice('v1', 'prophet', 'r1', 0.7, petition);
    const data = buildPetitionUI(voice, petition, 0);
    expect(data.fulfillAction?.powerId).toBe('shield_of_faith');
  });
});

describe('UI-098 combo toast for all 9 combos', () => {
  it('all 9 combos build valid toasts', () => {
    const ids = Object.keys(COMBO_NAMES) as Array<keyof typeof COMBO_NAMES>;
    for (const id of ids) {
      const data = buildComboToastData(id, false);
      expect(data.toast.id).toBeTruthy();
      expect(data.toast.style).toBe('combo');
      expect(data.discoveryText).toBeTruthy();
    }
  });
});

describe('UI-099 getComboEligiblePowerIds — corrupted region enables divine_purge powers', () => {
  it('shield_of_faith and miracle eligible when corruption present', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      world: {
        ...makeMinimalGameState().world,
        alienState: {
          ...makeMinimalGameState().world.alienState,
          harbinger: {
            ...makeMinimalGameState().world.alienState.harbinger,
            corruptedRegionIds: ['r_corrupt'],
          },
        },
      },
    };
    const eligible = getComboEligiblePowerIds(state);
    expect(eligible.has('shield_of_faith')).toBe(true);
    expect(eligible.has('miracle')).toBe(true);
  });
});

describe('UI-100 buildPetitionCounterState ARIA label', () => {
  it('singular "prayer" for count=1', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [makeVoice('v1', 'prophet', 'r1', 0.7, makePetition('v1'))],
    };
    const counter = buildPetitionCounterState(state);
    expect(counter.ariaLabel).toContain('1 prayer');
    expect(counter.ariaLabel).not.toContain('1 prayers');
  });
  it('plural "prayers" for count=2', () => {
    const state: GameState = {
      ...makeMinimalGameState(),
      voiceRecords: [
        makeVoice('v1', 'prophet', 'r1', 0.7, makePetition('v1')),
        makeVoice('v2', 'ruler', 'r2', 0.7, makePetition('v2')),
      ],
    };
    const counter = buildPetitionCounterState(state);
    expect(counter.ariaLabel).toContain('2 prayers');
  });
});
