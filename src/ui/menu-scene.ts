// =============================================================================
// DIVINE DOMINION — Menu Scene (Task 3.1)
// Phaser Scene for the main menu, pause menu, earth history, results, settings.
// All state mutations use the DOM-overlay pattern for panels.
// =============================================================================

import { loadSettings, patchSettings, GameSettings } from './settings-store.js';
import type { GodProfile, EndingType } from '../types/game.js';
import { UI } from '../config/constants.js';

// ---------------------------------------------------------------------------
// God profile (meta-progression) — persisted to localStorage
// ---------------------------------------------------------------------------

const PROFILE_KEY = 'divine_dominion_profile';

export function loadGodProfile(): GodProfile {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(PROFILE_KEY) : null;
    if (!raw) return createEmptyProfile();
    return { ...createEmptyProfile(), ...JSON.parse(raw) };
  } catch {
    return createEmptyProfile();
  }
}

export function saveGodProfile(profile: GodProfile): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  } catch {
    // no-op
  }
}

function createEmptyProfile(): GodProfile {
  return {
    totalEarths: 0,
    earthsWon: 0,
    earthsLost: 0,
    totalInterventions: 0,
    totalBlessings: 0,
    totalDisasters: 0,
    favoritePower: null,
    mostUsedCommandments: [],
    unlockedCommandments: [],
    endingsAchieved: [],
    titles: [],
  };
}

export function hasSavedGame(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('divine_dominion_save') !== null;
  } catch {
    return false;
  }
}

export function getSaveMetadata(): { eraName: string; year: number } | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('divine_dominion_save_meta');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Earth History (max 50 Earths)
// ---------------------------------------------------------------------------

export interface EarthRecord {
  earthNumber: number;
  outcome: 'win' | 'lose' | 'ascension';
  commandmentCategories: string[]; // 10 category color keys
  era: string;
  year: number;
  followers: number;
  interventions: number;
  timePlayed: number; // seconds
  // internal detail
  commandmentNames?: string[];
  endingNarrative?: string;
}

const EARTH_HISTORY_KEY = 'divine_dominion_earth_history';
export const MAX_EARTH_HISTORY = 50;

export function loadEarthHistory(): EarthRecord[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(EARTH_HISTORY_KEY) : null;
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEarthRecord(record: EarthRecord): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const history = loadEarthHistory();
    history.unshift(record);
    if (history.length > MAX_EARTH_HISTORY) {
      history.length = MAX_EARTH_HISTORY;
    }
    localStorage.setItem(EARTH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // no-op
  }
}

// ---------------------------------------------------------------------------
// Main Menu state machine
// ---------------------------------------------------------------------------

export type MenuScreen =
  | 'main'
  | 'archetype'
  | 'commandment_selection'
  | 'commandment_review'
  | 'world_gen'
  | 'pause'
  | 'settings'
  | 'earth_history'
  | 'earth_detail'
  | 'results'
  | 'store';

export interface MenuState {
  currentScreen: MenuScreen;
  isFirstEarth: boolean;
  pendingSave: boolean;
  selectedArchetype: ArchetypeId | null;
  detailEarthIndex: number | null;
  resultsData: ResultsData | null;
}

export type ArchetypeId = 'shepherd' | 'judge' | 'conqueror';

export interface ArchetypeDefinition {
  id: ArchetypeId;
  name: string;
  tagline: string;
  philosophy: string;
  sampleCommandments: [string, string, string];
  colorTone: 'warm' | 'steel' | 'crimson';
}

export const ARCHETYPES: ArchetypeDefinition[] = [
  {
    id: 'shepherd',
    name: 'The Shepherd',
    tagline: 'Guide through compassion.',
    philosophy: 'Your flock looks to you for warmth. Lead them gently and they will follow.',
    sampleCommandments: ['Bountiful Harvest', 'Protect the Meek', 'Heal the Sick'],
    colorTone: 'warm',
  },
  {
    id: 'judge',
    name: 'The Judge',
    tagline: 'Rule through order.',
    philosophy: 'Law is the foundation of civilization. Without it, chaos reigns.',
    sampleCommandments: ['Divine Law', 'Trial by Faith', 'Order Above All'],
    colorTone: 'steel',
  },
  {
    id: 'conqueror',
    name: 'The Conqueror',
    tagline: 'Expand through strength.',
    philosophy: 'The faithful spread through righteous conquest. The world bends to the strong.',
    sampleCommandments: ['Holy War Doctrine', 'Strength of Arms', 'Expand the Faith'],
    colorTone: 'crimson',
  },
];

export function getArchetypeCommandmentPreset(id: ArchetypeId): string[] {
  switch (id) {
    case 'shepherd':
      return ['bountiful_harvest', 'holy_sanctuary', 'healing_rites', 'peaceful_expansion',
              'communal_sharing', 'protect_the_weak', 'wisdom_teachings', 'pilgrim_roads',
              'divine_mercy', 'charity_mandate'];
    case 'judge':
      return ['divine_law', 'strict_hierarchy', 'trial_by_faith', 'sacred_texts',
              'order_above_all', 'cleanse_the_heretic', 'divine_authority', 'legal_reform',
              'covenant_of_order', 'iron_discipline'];
    case 'conqueror':
      return ['holy_war_doctrine', 'conquest_justified', 'strength_of_arms', 'expand_the_faith',
              'warrior_monks', 'righteous_wrath', 'divine_mandate', 'territorial_claim',
              'crusading_spirit', 'victory_prayer'];
  }
}

// ---------------------------------------------------------------------------
// Results data
// ---------------------------------------------------------------------------

export interface ResultsData {
  outcome: 'win' | 'lose' | 'ascension';
  headline: string;
  subheadline: string;
  stats: {
    followers: number;
    interventions: number;
    wars: number;
    erasSurvived: number;
    scienceLevel: number;
    timePlayed: number; // seconds
  };
  commandmentNames: string[];
  titleEarned?: string;
  endingType: EndingType;
}

export function buildResultsHeadline(outcome: ResultsData['outcome']): { headline: string; subheadline: string } {
  switch (outcome) {
    case 'win':
      return {
        headline: 'Humanity Saved.',
        subheadline: 'The Defense Grid held. Your faith endures across the stars.',
      };
    case 'lose':
      return {
        headline: 'Humanity Fell.',
        subheadline: 'The skies burned. But you remember. Another Earth awaits.',
      };
    case 'ascension':
      return {
        headline: 'Ascension.',
        subheadline: 'Peace reigns. Knowledge illuminates. Faith binds all. You have transcended.',
      };
  }
}

// ---------------------------------------------------------------------------
// Settings panel — pure data helpers (rendering is HTML/DOM)
// ---------------------------------------------------------------------------

export interface SettingsSection {
  group: string;
  settings: SettingRow[];
}

export type SettingRow =
  | { type: 'toggle'; key: keyof GameSettings; label: string; dependsOn?: keyof GameSettings }
  | { type: 'slider'; key: keyof GameSettings; label: string; min: number; max: number; step: number; unit?: string }
  | { type: 'segmented'; key: keyof GameSettings; label: string; options: Array<{ value: string | number; label: string }> }
  | { type: 'picker'; key: keyof GameSettings; label: string; options: Array<{ value: string; label: string }> }
  | { type: 'button'; label: string; action: 'restore_purchases' }
  | { type: 'link'; label: string; href: string }
  | { type: 'label'; label: string; value: string };

export const SETTINGS_SCHEMA: SettingsSection[] = [
  {
    group: 'Audio',
    settings: [
      { type: 'toggle', key: 'sfxEnabled', label: 'Sound effects' },
      { type: 'slider', key: 'sfxVolume', label: 'SFX volume', min: 0, max: 100, step: 5, unit: '%', dependsOn: 'sfxEnabled' },
    ],
  },
  {
    group: 'Feel',
    settings: [
      { type: 'toggle', key: 'hapticsEnabled', label: 'Haptics' },
      { type: 'toggle', key: 'reducedMotion', label: 'Reduced motion' },
    ],
  },
  {
    group: 'Controls',
    settings: [
      { type: 'toggle', key: 'leftHandMode', label: 'Left-hand mode' },
      { type: 'segmented', key: 'speedDefault', label: 'Speed default', options: [
        { value: 1, label: '1×' }, { value: 2, label: '2×' }, { value: 4, label: '4×' },
      ]},
    ],
  },
  {
    group: 'Display',
    settings: [
      { type: 'slider', key: 'fontScaling', label: 'Font scaling', min: 0.8, max: 1.4, step: 0.1, unit: '%' },
      { type: 'toggle', key: 'highContrast', label: 'High contrast' },
      { type: 'picker', key: 'colorblindMode', label: 'Colorblind mode', options: [
        { value: 'off', label: 'Off' },
        { value: 'deuteranopia', label: 'Deuteranopia' },
        { value: 'protanopia', label: 'Protanopia' },
        { value: 'tritanopia', label: 'Tritanopia' },
      ]},
    ],
  },
  {
    group: 'Tutorial',
    settings: [
      { type: 'toggle', key: 'showTutorialTips', label: 'Show tutorial tips' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Pause menu helpers
// ---------------------------------------------------------------------------

export type PauseMenuAction = 'resume' | 'this_earth' | 'settings' | 'exit_to_menu';

export interface PauseMenuConfig {
  onAction: (action: PauseMenuAction) => void;
  confirmExit: () => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// World generation loading text cycle
// ---------------------------------------------------------------------------

export const WORLD_GEN_LOADING_TEXTS: string[] = [
  'Forming continents...',
  'Nations arise...',
  'Faiths take root...',
  'Your followers gather.',
];

export function getWorldGenText(phase: number): string {
  return WORLD_GEN_LOADING_TEXTS[Math.min(phase, WORLD_GEN_LOADING_TEXTS.length - 1)];
}

// ---------------------------------------------------------------------------
// Safe area constants (re-exported for DOM usage)
// ---------------------------------------------------------------------------

export const SAFE_TOP_PT = UI.TOP_SAFE_AREA_PT;
export const SAFE_BOTTOM_PT = UI.BOTTOM_SAFE_AREA_PT;
