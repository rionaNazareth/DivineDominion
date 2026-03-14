// =============================================================================
// DIVINE DOMINION — Settings Store
// Persists to localStorage. Shared by all UI modules.
// =============================================================================

export interface GameSettings {
  sfxEnabled: boolean;
  sfxVolume: number;        // 0–100
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  leftHandMode: boolean;
  speedDefault: 1 | 2 | 4;
  fontScaling: number;      // 0.8–1.4
  highContrast: boolean;
  colorblindMode: 'off' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  showTutorialTips: boolean;
  analyticsOptIn: boolean | null; // null = not yet asked
  qualityOverride: 'auto' | 'normal' | 'low';
}

const STORAGE_KEY = 'divine_dominion_settings';

export const DEFAULT_SETTINGS: Readonly<GameSettings> = {
  sfxEnabled: true,
  sfxVolume: 80,
  hapticsEnabled: true,
  reducedMotion: false,
  leftHandMode: false,
  speedDefault: 1,
  fontScaling: 1.0,
  highContrast: false,
  colorblindMode: 'off',
  showTutorialTips: true,
  analyticsOptIn: null,
  qualityOverride: 'auto',
};

export function loadSettings(): GameSettings {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: GameSettings): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    }
  } catch {
    // storage unavailable — no-op
  }
}

export function patchSettings(patch: Partial<GameSettings>): GameSettings {
  const current = loadSettings();
  const next: GameSettings = { ...current, ...patch };
  saveSettings(next);
  return next;
}

// Tutorial state — persisted per device, not per Earth
const TUTORIAL_KEY = 'divine_dominion_tutorial';

export interface TutorialState {
  phase1Skipped: boolean;
  completedTooltips: number[]; // tooltip IDs 1–10
}

export const DEFAULT_TUTORIAL: Readonly<TutorialState> = {
  phase1Skipped: false,
  completedTooltips: [],
};

export function loadTutorialState(): TutorialState {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(TUTORIAL_KEY) : null;
    if (!raw) return { ...DEFAULT_TUTORIAL };
    return { ...DEFAULT_TUTORIAL, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_TUTORIAL };
  }
}

export function markTutorialTooltip(id: number): void {
  const state = loadTutorialState();
  if (!state.completedTooltips.includes(id)) {
    state.completedTooltips.push(id);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TUTORIAL_KEY, JSON.stringify(state));
      }
    } catch {
      // no-op
    }
  }
}

export function resetTutorialTooltips(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TUTORIAL_KEY, JSON.stringify({ ...DEFAULT_TUTORIAL }));
    }
  } catch {
    // no-op
  }
}

export function isTutorialTooltipSeen(id: number): boolean {
  const state = loadTutorialState();
  return state.completedTooltips.includes(id);
}
