// =============================================================================
// DIVINE DOMINION — Audio System
// State machine for music transitions, SFX priority, mute settings.
// See docs/design/sound-spec.md
// =============================================================================

import type { EraId } from '../types/game.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SfxId =
  // Divine powers
  | 'sfx/divine/harvest'
  | 'sfx/divine/inspiration'
  | 'sfx/divine/miracle'
  | 'sfx/divine/prophet'
  | 'sfx/divine/shield'
  | 'sfx/divine/golden-age'
  | 'sfx/divine/earthquake'
  | 'sfx/divine/flood'
  | 'sfx/divine/plague'
  | 'sfx/divine/storm'
  | 'sfx/divine/famine'
  | 'sfx/divine/wildfire'
  // Divine interactions
  | 'sfx/divine/whisper-cast'
  | 'sfx/divine/combo-trigger'
  | 'sfx/divine/voice-emerge'
  | 'sfx/divine/voice-death'
  | 'sfx/divine/petition'
  | 'sfx/divine/heretic'
  // UI
  | 'sfx/ui/event-notify'
  | 'sfx/ui/choice-confirm'
  | 'sfx/ui/outcome-reveal'
  | 'sfx/ui/button-tap'
  | 'sfx/ui/menu-open'
  | 'sfx/ui/menu-close'
  | 'sfx/ui/fab-open'
  | 'sfx/ui/fab-close'
  | 'sfx/ui/toast'
  | 'sfx/ui/region-tap'
  | 'sfx/ui/overlay-toggle'
  | 'sfx/ui/pause'
  | 'sfx/ui/unpause'
  | 'sfx/ui/power-unlock'
  // Battle
  | 'sfx/battle/clash'
  | 'sfx/battle/victory'
  | 'sfx/battle/defeat'
  | 'sfx/battle/war-declared'
  // Narrative
  | 'sfx/narrative/era-transition'
  | 'sfx/narrative/game-won'
  | 'sfx/narrative/game-lost'
  // Harbinger
  | 'sfx/harbinger/presence'
  | 'sfx/harbinger/corruption'
  | 'sfx/harbinger/purge'
  | 'sfx/harbinger/signal'
  // Alien reveal
  | 'sfx/alien/reveal-1'
  | 'sfx/alien/reveal-2'
  | 'sfx/alien/reveal-3'
  | 'sfx/alien/reveal-4'
  | 'sfx/alien/reveal-5';

export type SfxPriority = 1 | 2 | 3 | 4 | 5;

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hapticsEnabled: boolean;
  musicVolume: number; // 0.0 – 1.0
  sfxVolume: number;   // 0.0 – 1.0
}

export interface MusicDuckState {
  eventCard: boolean;
  battle: boolean;
  overlay: boolean;
  harbingerActive: boolean;
}

export const AUDIO_DEFAULTS: AudioSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  hapticsEnabled: true,
  musicVolume: 1.0,
  sfxVolume: 1.0,
};

// ---------------------------------------------------------------------------
// SFX priority table
// ---------------------------------------------------------------------------

/** Higher number = higher priority. Matches sound-spec.md §4c. */
export const SFX_PRIORITY: Partial<Record<SfxId, SfxPriority>> = {
  // Priority 1 — Divine power cast (always plays)
  'sfx/divine/harvest': 1,
  'sfx/divine/inspiration': 1,
  'sfx/divine/miracle': 1,
  'sfx/divine/prophet': 1,
  'sfx/divine/shield': 1,
  'sfx/divine/golden-age': 1,
  'sfx/divine/earthquake': 1,
  'sfx/divine/flood': 1,
  'sfx/divine/plague': 1,
  'sfx/divine/storm': 1,
  'sfx/divine/famine': 1,
  'sfx/divine/wildfire': 1,
  // Priority 2 — Event notification
  'sfx/ui/event-notify': 2,
  // Priority 3 — Battle sounds
  'sfx/battle/clash': 3,
  'sfx/battle/victory': 3,
  'sfx/battle/defeat': 3,
  'sfx/battle/war-declared': 3,
  // Priority 4 — UI sounds
  'sfx/ui/choice-confirm': 4,
  'sfx/ui/outcome-reveal': 4,
  'sfx/ui/button-tap': 4,
  'sfx/ui/menu-open': 4,
  'sfx/ui/menu-close': 4,
  'sfx/ui/fab-open': 4,
  'sfx/ui/fab-close': 4,
  'sfx/ui/region-tap': 4,
  'sfx/ui/overlay-toggle': 4,
  'sfx/ui/pause': 4,
  'sfx/ui/unpause': 4,
  'sfx/ui/power-unlock': 4,
  // Priority 5 — Ambient/toast (lowest)
  'sfx/ui/toast': 5,
};

function getSfxPriority(id: SfxId): SfxPriority {
  return SFX_PRIORITY[id] ?? 4;
}

// ---------------------------------------------------------------------------
// Era → music track mapping
// ---------------------------------------------------------------------------

const ERA_TRACK_ORDER: EraId[] = [
  'renaissance', 'exploration', 'enlightenment', 'revolution',
  'industry', 'empire', 'atomic', 'digital',
  'signal', 'revelation', 'preparation', 'arrival',
];

export function eraToMusicPath(eraId: EraId, format: 'ogg' | 'mp3' = 'ogg'): string {
  const idx = ERA_TRACK_ORDER.indexOf(eraId);
  const num = (idx + 1).toString().padStart(2, '0');
  return `assets/music/era-${num}.${format}`;
}

// ---------------------------------------------------------------------------
// Music volume computation
// ---------------------------------------------------------------------------

/** Crossfade duration in ms per sound-spec §4a. */
export const CROSSFADE_MS = {
  ERA_TRANSITION: 3000,
  EVENT_DUCK: 500,
  EVENT_RESTORE: 800,
  BATTLE_DUCK: 400,
  BATTLE_RESTORE: 1000,
  OVERLAY_DUCK: 300,
} as const;

/**
 * Compute the effective music volume given current duck state.
 * Matches the layering rules in sound-spec §4a.
 */
export function computeMusicVolume(
  baseVolume: number,
  duck: MusicDuckState,
): number {
  // Event card takes priority — lowest duck (30%)
  if (duck.eventCard && duck.battle) return baseVolume * 0.30;
  if (duck.eventCard) return baseVolume * 0.30;
  if (duck.battle) return baseVolume * 0.50;
  if (duck.overlay) return baseVolume * 0.60;
  return baseVolume;
}

/**
 * Harbinger hum volume (Eras 7+). Runs continuously at 15% of base.
 */
export function harbingerHumVolume(baseVolume: number): number {
  return baseVolume * 0.15;
}

// ---------------------------------------------------------------------------
// Concurrent SFX limit
// ---------------------------------------------------------------------------

export const MAX_CONCURRENT_SFX = 10;

export interface ActiveSfxSlot {
  id: SfxId;
  priority: SfxPriority;
  startedAt: number; // ms timestamp
}

/**
 * Determine which SFX slot to steal (lowest priority) when at the limit.
 * Returns the index to evict, or -1 if no eviction needed.
 */
export function selectSlotToEvict(slots: ActiveSfxSlot[]): number {
  if (slots.length < MAX_CONCURRENT_SFX) return -1;
  let worstIdx = 0;
  let worstPriority: SfxPriority = 1;
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].priority > worstPriority) {
      worstPriority = slots[i].priority;
      worstIdx = i;
    }
  }
  return worstIdx;
}

/**
 * Determine if a new SFX should play given current slots and priority rules.
 * Returns { play: boolean; evictIndex: number } — evictIndex=-1 if no eviction.
 */
export function canPlaySfx(
  newId: SfxId,
  slots: ActiveSfxSlot[],
  sfxEnabled: boolean,
): { play: boolean; evictIndex: number } {
  if (!sfxEnabled) return { play: false, evictIndex: -1 };

  // Same-ID restart: if same SFX already playing, restart it (evict that slot)
  const sameIdx = slots.findIndex(s => s.id === newId);
  if (sameIdx !== -1) return { play: true, evictIndex: sameIdx };

  if (slots.length < MAX_CONCURRENT_SFX) return { play: true, evictIndex: -1 };

  // Steal lowest-priority slot
  const evictIdx = selectSlotToEvict(slots);
  const newPriority = getSfxPriority(newId);

  // If new sound has lower priority than all active, skip it
  if (evictIdx !== -1 && slots[evictIdx].priority < newPriority) {
    return { play: false, evictIndex: -1 };
  }

  return { play: true, evictIndex: evictIdx };
}

// ---------------------------------------------------------------------------
// Haptic patterns (spec table, §5)
// ---------------------------------------------------------------------------

export type HapticPattern =
  | 'single_medium'
  | 'double_heavy'
  | 'single_light'
  | 'three_ascending'
  | 'double_heavy_battle'
  | 'combo_rumble'
  | 'single_light_prayer'
  | 'harbinger_rumble'
  | 'power_unlock';

export type HapticTrigger =
  | 'cast_blessing'
  | 'cast_disaster'
  | 'event_card_appears'
  | 'choice_selected'
  | 'era_transition'
  | 'battle_clash'
  | 'combo_discovered'
  | 'prayer_received'
  | 'harbinger_action'
  | 'power_unlock';

export const HAPTIC_PATTERNS: Record<HapticTrigger, HapticPattern> = {
  cast_blessing: 'single_medium',
  cast_disaster: 'double_heavy',
  event_card_appears: 'single_light',
  choice_selected: 'single_medium',
  era_transition: 'three_ascending',
  battle_clash: 'double_heavy_battle',
  combo_discovered: 'combo_rumble',
  prayer_received: 'single_light_prayer',
  harbinger_action: 'harbinger_rumble',
  power_unlock: 'power_unlock',
};

// ---------------------------------------------------------------------------
// AudioManager class
// Pure logic layer — no DOM/Phaser deps. Phaser wires actual playback.
// ---------------------------------------------------------------------------

export class AudioManager {
  private settings: AudioSettings;
  private duckState: MusicDuckState;
  private activeSfx: ActiveSfxSlot[];
  private currentEra: EraId | null;

  constructor(settings: Partial<AudioSettings> = {}) {
    this.settings = { ...AUDIO_DEFAULTS, ...settings };
    this.duckState = { eventCard: false, battle: false, overlay: false, harbingerActive: false };
    this.activeSfx = [];
    this.currentEra = null;
  }

  // -- Settings --

  updateSettings(patch: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...patch };
  }

  getSettings(): Readonly<AudioSettings> {
    return this.settings;
  }

  // -- Music --

  setEra(eraId: EraId): { trackPath: string; crossfadeMs: number } | null {
    if (!this.settings.musicEnabled) return null;
    this.currentEra = eraId;
    return {
      trackPath: eraToMusicPath(eraId),
      crossfadeMs: CROSSFADE_MS.ERA_TRANSITION,
    };
  }

  setDuckState(patch: Partial<MusicDuckState>): number {
    this.duckState = { ...this.duckState, ...patch };
    return computeMusicVolume(this.settings.musicVolume, this.duckState);
  }

  getCurrentMusicVolume(): number {
    return computeMusicVolume(this.settings.musicVolume, this.duckState);
  }

  getCurrentEra(): EraId | null {
    return this.currentEra;
  }

  // -- SFX --

  requestSfx(id: SfxId, now: number = Date.now()): { play: boolean; evictId: SfxId | null } {
    const { play, evictIndex } = canPlaySfx(id, this.activeSfx, this.settings.sfxEnabled);
    if (!play) return { play: false, evictId: null };

    let evictId: SfxId | null = null;
    if (evictIndex !== -1) {
      evictId = this.activeSfx[evictIndex].id;
      this.activeSfx.splice(evictIndex, 1);
    }

    this.activeSfx.push({ id, priority: getSfxPriority(id), startedAt: now });
    return { play: true, evictId };
  }

  onSfxComplete(id: SfxId): void {
    const idx = this.activeSfx.findIndex(s => s.id === id);
    if (idx !== -1) this.activeSfx.splice(idx, 1);
  }

  getActiveSfx(): Readonly<ActiveSfxSlot[]> {
    return this.activeSfx;
  }

  // -- Haptics --

  getHapticPattern(trigger: HapticTrigger): HapticPattern | null {
    if (!this.settings.hapticsEnabled) return null;
    return HAPTIC_PATTERNS[trigger];
  }

  // -- App lifecycle --

  onBackground(): void {
    // Pause music — actual pause handled by Phaser scene
    this.duckState = { ...this.duckState };
  }

  onForeground(): void {
    // Resume music
  }
}
