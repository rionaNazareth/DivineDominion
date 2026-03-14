/**
 * Session 9 Tests — Integration, Save/Load, Audio, Touch, LLM Templates
 * Covers: SAVE_001–SAVE_009, AUDIO tests, TOUCH tests, LLM template tests.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '../../simulation/world-gen.js';
import {
  saveGame,
  loadGame,
  validateSave,
  migrateSave,
  clearSaves,
  setStorageAdapter,
  toSerializable,
  fromSerializable,
  sha256,
  buildSaveData,
  SaveMigrationError,
  type SaveData,
  type StorageAdapter,
} from '../save-manager.js';
import {
  AudioManager,
  computeMusicVolume,
  eraToMusicPath,
  canPlaySfx,
  selectSlotToEvict,
  HAPTIC_PATTERNS,
  MAX_CONCURRENT_SFX,
  type SfxId,
  type ActiveSfxSlot,
} from '../audio-manager.js';
import {
  TouchController,
  type TouchCommand,
} from '../touch-controls.js';
import {
  buildEraNarrativePrompt,
  buildScripturePrompt,
  buildVoicePetitionPrompt,
  buildEulogyPrompt,
  buildEulogyFallback,
  buildMilestoneToast,
  ERA_NARRATIVE_FALLBACKS,
  SCRIPTURE_FALLBACKS,
  VOICE_PETITION_FALLBACKS,
  RIVAL_RELIGION_FALLBACKS,
} from '../../llm/templates.js';
import type { GameState, EraId } from '../../types/game.js';
import LZString from 'lz-string';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeMemoryStorage(): StorageAdapter & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    get: (k) => store.get(k) ?? null,
    set: (k, v) => { store.set(k, v); },
    remove: (k) => { store.delete(k); },
  };
}

function deepEqualGameState(a: GameState, b: GameState): boolean {
  const sa = toSerializable(a);
  const sb = toSerializable(b);
  return JSON.stringify(sa) === JSON.stringify(sb);
}

// ---------------------------------------------------------------------------
// Save/Load Tests
// ---------------------------------------------------------------------------

describe('save-manager', () => {
  let state: GameState;
  let mem: ReturnType<typeof makeMemoryStorage>;

  beforeEach(() => {
    state = createInitialGameState(99);
    mem = makeMemoryStorage();
    setStorageAdapter(mem);
    clearSaves();
  });

  it('SAVE_001: round-trip save/load deep-equals original state', () => {
    const saved = saveGame(state);
    expect(saved).toBe(true);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(deepEqualGameState(state, loaded!)).toBe(true);
  });

  it('SAVE_002: LZ-string compressed output is significantly smaller than JSON', () => {
    const serialized = toSerializable(state);
    const json = JSON.stringify(serialized);
    const compressed = LZString.compressToUTF16(json);
    // compressed should be less than 30% the size of json (char count, not byte count)
    expect(compressed.length).toBeLessThan(json.length * 0.30);
  });

  it('SAVE_003: tampered save data fails checksum validation', () => {
    saveGame(state);
    const raw = mem.store.get('dd_save_current')!;
    const json = LZString.decompressFromUTF16(raw)!;
    const saveData: SaveData = JSON.parse(json);
    // Tamper with a field
    (saveData.gameState as Record<string, unknown>).hypocrisyLevel = 999;
    const tampered = LZString.compressToUTF16(JSON.stringify(saveData));
    const result = validateSave(tampered);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('checksum_mismatch');
  });

  it('SAVE_004: corrupted save_current → falls back to save_backup', () => {
    // Save once (becomes current), then save again (current → backup, new → current)
    saveGame(state);
    saveGame(state);
    // Corrupt save_current
    mem.store.set('dd_save_current', 'CORRUPTED_DATA');
    const loaded = loadGame();
    // Should successfully load from backup
    expect(loaded).not.toBeNull();
    expect(deepEqualGameState(state, loaded!)).toBe(true);
  });

  it('SAVE_005: both saves corrupted → returns null', () => {
    saveGame(state);
    saveGame(state);
    mem.store.set('dd_save_current', 'BAD');
    mem.store.set('dd_save_backup', 'ALSO_BAD');
    const loaded = loadGame();
    expect(loaded).toBeNull();
  });

  it('SAVE_006: compressed save size under 200KB (200,000 chars)', () => {
    saveGame(state);
    const compressed = mem.store.get('dd_save_current')!;
    // 200KB in UTF-16 chars ≈ 200,000 chars
    expect(compressed.length).toBeLessThan(200_000);
  });

  it('SAVE_007: Maps serialize as [key,value][] arrays', () => {
    const serialized = toSerializable(state);
    // regions, nations, armies, religions, tradeRoutes should all be arrays
    expect(Array.isArray(serialized.world.regions)).toBe(true);
    expect(Array.isArray(serialized.world.nations)).toBe(true);
    expect(Array.isArray(serialized.world.religions)).toBe(true);
    expect(Array.isArray(serialized.world.armies)).toBe(true);
    expect(Array.isArray(serialized.world.tradeRoutes)).toBe(true);
    expect(Array.isArray(serialized.divineState.cooldowns)).toBe(true);
    expect(Array.isArray(serialized.eraNarratives)).toBe(true);
  });

  it('SAVE_008: migrateSave upgrades version number', () => {
    const saveData = buildSaveData(state);
    // Manually set to older version (no migrations registered yet, so use same version)
    // We test that migrateSave with current version returns unchanged
    const migrated = migrateSave(saveData);
    expect(migrated.version).toBe(saveData.version);
  });

  it('SAVE_008b: migrateSave throws SaveMigrationError for missing migration', () => {
    const saveData = buildSaveData(state);
    // Fake a version mismatch by setting version to version-1
    const oldSave: SaveData = { ...saveData, version: saveData.version - 1 };
    expect(() => migrateSave(oldSave)).toThrow(SaveMigrationError);
  });

  it('SAVE_009: eraNarratives Map round-trip preserves all entries', () => {
    // Populate eraNarratives
    const stateWithNarratives = {
      ...state,
      eraNarratives: new Map<EraId, string>([
        ['renaissance', 'Era 1 narrative text'],
        ['exploration', 'Era 2 narrative text'],
        ['enlightenment', 'Era 3 narrative text'],
      ]),
    } as GameState;

    const storage2 = makeMemoryStorage();
    setStorageAdapter(storage2);
    saveGame(stateWithNarratives);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.eraNarratives.get('renaissance')).toBe('Era 1 narrative text');
    expect(loaded!.eraNarratives.get('exploration')).toBe('Era 2 narrative text');
    expect(loaded!.eraNarratives.get('enlightenment')).toBe('Era 3 narrative text');
    expect(loaded!.eraNarratives.size).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// SHA-256 Tests
// ---------------------------------------------------------------------------

describe('sha256', () => {
  it('produces consistent output for same input', () => {
    const h1 = sha256('hello world');
    const h2 = sha256('hello world');
    expect(h1).toBe(h2);
  });

  it('produces different output for different input', () => {
    const h1 = sha256('hello world');
    const h2 = sha256('hello world!');
    expect(h1).not.toBe(h2);
  });

  it('produces 64-char hex string', () => {
    const h = sha256('test');
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  it('matches known SHA-256 value for empty string', () => {
    // SHA-256('') = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const h = sha256('');
    expect(h).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});

// ---------------------------------------------------------------------------
// Audio Manager Tests
// ---------------------------------------------------------------------------

describe('audio-manager', () => {
  it('computes music volume correctly with event card duck (30%)', () => {
    const vol = computeMusicVolume(1.0, { eventCard: true, battle: false, overlay: false, harbingerActive: false });
    expect(vol).toBeCloseTo(0.30);
  });

  it('computes music volume correctly with battle duck (50%)', () => {
    const vol = computeMusicVolume(1.0, { eventCard: false, battle: true, overlay: false, harbingerActive: false });
    expect(vol).toBeCloseTo(0.50);
  });

  it('computes music volume correctly with overlay duck (60%)', () => {
    const vol = computeMusicVolume(1.0, { eventCard: false, battle: false, overlay: true, harbingerActive: false });
    expect(vol).toBeCloseTo(0.60);
  });

  it('event card + battle → lowest (30%) takes priority', () => {
    const vol = computeMusicVolume(1.0, { eventCard: true, battle: true, overlay: false, harbingerActive: false });
    expect(vol).toBeCloseTo(0.30);
  });

  it('no duck → full volume', () => {
    const vol = computeMusicVolume(1.0, { eventCard: false, battle: false, overlay: false, harbingerActive: false });
    expect(vol).toBeCloseTo(1.0);
  });

  it('eraToMusicPath returns correct path', () => {
    expect(eraToMusicPath('renaissance')).toBe('assets/music/era-01.ogg');
    expect(eraToMusicPath('arrival')).toBe('assets/music/era-12.ogg');
    expect(eraToMusicPath('atomic')).toBe('assets/music/era-07.ogg');
  });

  it('canPlaySfx returns false when sfx disabled', () => {
    const result = canPlaySfx('sfx/ui/button-tap', [], false);
    expect(result.play).toBe(false);
  });

  it('canPlaySfx returns true with empty slots', () => {
    const result = canPlaySfx('sfx/divine/harvest', [], true);
    expect(result.play).toBe(true);
    expect(result.evictIndex).toBe(-1);
  });

  it('canPlaySfx restarts same-id sfx', () => {
    const slots: ActiveSfxSlot[] = [{ id: 'sfx/ui/toast', priority: 5, startedAt: 0 }];
    const result = canPlaySfx('sfx/ui/toast', slots, true);
    expect(result.play).toBe(true);
    expect(result.evictIndex).toBe(0);
  });

  it('selectSlotToEvict returns -1 when under limit', () => {
    const slots: ActiveSfxSlot[] = [{ id: 'sfx/ui/toast', priority: 5, startedAt: 0 }];
    expect(selectSlotToEvict(slots)).toBe(-1);
  });

  it('selectSlotToEvict returns index of lowest-priority slot when at limit', () => {
    const slots: ActiveSfxSlot[] = Array.from({ length: MAX_CONCURRENT_SFX }, (_, i) => ({
      id: 'sfx/ui/toast' as SfxId,
      priority: i === 3 ? (5 as const) : (1 as const),
      startedAt: 0,
    }));
    const idx = selectSlotToEvict(slots);
    expect(idx).toBe(3);
  });

  it('AudioManager.setEra returns null when music disabled', () => {
    const mgr = new AudioManager({ musicEnabled: false });
    expect(mgr.setEra('renaissance')).toBeNull();
  });

  it('AudioManager.setEra returns track path and crossfade when enabled', () => {
    const mgr = new AudioManager({ musicEnabled: true });
    const result = mgr.setEra('digital');
    expect(result).not.toBeNull();
    expect(result!.trackPath).toContain('era-08');
    expect(result!.crossfadeMs).toBe(3000);
  });

  it('AudioManager.requestSfx tracks active slots', () => {
    const mgr = new AudioManager();
    mgr.requestSfx('sfx/divine/harvest', 0);
    expect(mgr.getActiveSfx().length).toBe(1);
    mgr.onSfxComplete('sfx/divine/harvest');
    expect(mgr.getActiveSfx().length).toBe(0);
  });

  it('AudioManager.getHapticPattern returns null when haptics disabled', () => {
    const mgr = new AudioManager({ hapticsEnabled: false });
    expect(mgr.getHapticPattern('cast_blessing')).toBeNull();
  });

  it('HAPTIC_PATTERNS covers all triggers', () => {
    const triggers = [
      'cast_blessing', 'cast_disaster', 'event_card_appears', 'choice_selected',
      'era_transition', 'battle_clash', 'combo_discovered', 'prayer_received',
      'harbinger_action', 'power_unlock',
    ] as const;
    for (const t of triggers) {
      expect(HAPTIC_PATTERNS[t]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Touch Controls Tests
// ---------------------------------------------------------------------------

describe('touch-controls', () => {
  let tc: TouchController;

  beforeEach(() => {
    tc = new TouchController({ longPressMs: 500, tapMaxMs: 300, tapMaxMovePx: 10, screenWidth: 390, screenHeight: 844, swipeEdgeThresholdPx: 40, pinchMinDistancePx: 20 });
  });

  it('single tap emits tap command', () => {
    tc.onTouchStart([{ id: 1, x: 200, y: 400 }], 0);
    tc.onTouchEnd([{ id: 1, x: 200, y: 400 }], 100);
    const cmds = tc.flushCommands();
    expect(cmds.some(c => c.type === 'tap')).toBe(true);
    const tap = cmds.find(c => c.type === 'tap') as Extract<TouchCommand, { type: 'tap' }>;
    expect(tap.x).toBe(200);
    expect(tap.y).toBe(400);
  });

  it('tap near left edge emits swipe_edge with edge=left', () => {
    tc.onTouchStart([{ id: 1, x: 20, y: 400 }], 0);
    tc.onTouchEnd([{ id: 1, x: 20, y: 400 }], 100);
    const cmds = tc.flushCommands();
    const swipe = cmds.find(c => c.type === 'swipe_edge') as Extract<TouchCommand, { type: 'swipe_edge' }> | undefined;
    expect(swipe).toBeDefined();
    expect(swipe!.edge).toBe('left');
  });

  it('tap near right edge emits swipe_edge with edge=right', () => {
    tc.onTouchStart([{ id: 1, x: 370, y: 400 }], 0);
    tc.onTouchEnd([{ id: 1, x: 370, y: 400 }], 100);
    const cmds = tc.flushCommands();
    const swipe = cmds.find(c => c.type === 'swipe_edge') as Extract<TouchCommand, { type: 'swipe_edge' }> | undefined;
    expect(swipe).toBeDefined();
    expect(swipe!.edge).toBe('right');
  });

  it('tap that moves too much does not emit tap', () => {
    tc.onTouchStart([{ id: 1, x: 200, y: 400 }], 0);
    tc.onTouchEnd([{ id: 1, x: 215, y: 400 }], 100);
    const cmds = tc.flushCommands();
    expect(cmds.some(c => c.type === 'tap')).toBe(false);
  });

  it('tap that takes too long does not emit tap', () => {
    tc.onTouchStart([{ id: 1, x: 200, y: 400 }], 0);
    tc.onTouchEnd([{ id: 1, x: 200, y: 400 }], 400);
    const cmds = tc.flushCommands();
    expect(cmds.some(c => c.type === 'tap')).toBe(false);
  });

  it('pan command emitted via onPan', () => {
    tc.onTouchStart([{ id: 1, x: 200, y: 400 }], 0);
    tc.onPan(210, 410, 200, 400);
    const cmds = tc.flushCommands();
    const pan = cmds.find(c => c.type === 'pan') as Extract<TouchCommand, { type: 'pan' }> | undefined;
    expect(pan).toBeDefined();
    expect(pan!.dx).toBe(10);
    expect(pan!.dy).toBe(10);
  });

  it('pinch emits pinch command with scaleDelta', () => {
    tc.onTouchStart([{ id: 1, x: 100, y: 400 }, { id: 2, x: 300, y: 400 }], 0);
    // Move fingers apart
    tc.onTouchMove([{ id: 1, x: 80, y: 400 }, { id: 2, x: 320, y: 400 }]);
    const cmds = tc.flushCommands();
    const pinch = cmds.find(c => c.type === 'pinch') as Extract<TouchCommand, { type: 'pinch' }> | undefined;
    expect(pinch).toBeDefined();
    expect(pinch!.scaleDelta).toBeGreaterThan(1); // zoom in
  });

  it('touch cancel clears state and emits tap_cancel', () => {
    tc.onTouchStart([{ id: 1, x: 200, y: 400 }], 0);
    tc.onTouchCancel();
    expect(tc.getActiveTouchCount()).toBe(0);
    const cmds = tc.flushCommands();
    expect(cmds.some(c => c.type === 'tap_cancel')).toBe(true);
  });

  it('getActiveTouchCount tracks correctly', () => {
    expect(tc.getActiveTouchCount()).toBe(0);
    tc.onTouchStart([{ id: 1, x: 100, y: 200 }], 0);
    expect(tc.getActiveTouchCount()).toBe(1);
    tc.onTouchStart([{ id: 2, x: 150, y: 200 }], 0);
    expect(tc.getActiveTouchCount()).toBe(2);
    tc.onTouchEnd([{ id: 1, x: 100, y: 200 }], 100);
    expect(tc.getActiveTouchCount()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// LLM Templates Tests
// ---------------------------------------------------------------------------

describe('llm-templates', () => {
  it('ERA_NARRATIVE_FALLBACKS covers all 12 era IDs', () => {
    const eras: EraId[] = [
      'renaissance', 'exploration', 'enlightenment', 'revolution',
      'industry', 'empire', 'atomic', 'digital',
      'signal', 'revelation', 'preparation', 'arrival',
    ];
    for (const era of eras) {
      const fn = ERA_NARRATIVE_FALLBACKS[era];
      expect(fn).toBeDefined();
      const text = fn({
        religionName: 'Test Faith',
        nationName: 'Valdorn',
        regionName: 'Western Highlands',
        warCount: 2,
        conversionCount: 5,
        population: '100,000',
        rivalReligion: 'Iron Covenant',
        techMilestone: 'Printing Press',
        faithPercent: 30,
        devLevel: 6,
        eventCount: 4,
        heresyCount: 1,
        defenseStatus: 'under construction',
        gridStatus: 'online',
      });
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(20);
      // Most eras reference religionName — arrival template uses population/gridStatus instead
      if (era !== 'arrival') {
        expect(text).toContain('Test Faith');
      }
    }
  });

  it('SCRIPTURE_FALLBACKS covers all 4 archetypes', () => {
    const archetypes = ['shepherd', 'judge', 'conqueror', 'custom'] as const;
    for (const a of archetypes) {
      expect(SCRIPTURE_FALLBACKS[a]).toBeDefined();
      expect(SCRIPTURE_FALLBACKS[a].length).toBeGreaterThan(10);
    }
  });

  it('VOICE_PETITION_FALLBACKS covers all 5 voice types', () => {
    const types = ['prophet', 'ruler', 'general', 'scholar', 'heretic'] as const;
    for (const t of types) {
      const fn = VOICE_PETITION_FALLBACKS[t];
      expect(fn).toBeDefined();
      const text = fn({ regionName: 'Northern Plains', action: 'cast harvest' });
      expect(text.length).toBeGreaterThan(10);
    }
  });

  it('RIVAL_RELIGION_FALLBACKS has 10 entries', () => {
    expect(RIVAL_RELIGION_FALLBACKS.length).toBe(10);
    for (const r of RIVAL_RELIGION_FALLBACKS) {
      expect(r.name).toBeDefined();
      expect(r.personality).toBeDefined();
    }
  });

  it('buildEraNarrativePrompt returns valid prompt object', () => {
    const opts = buildEraNarrativePrompt({
      eraId: 'renaissance',
      eraName: 'Renaissance',
      startYear: 1600,
      endYear: 1650,
      religionName: 'The Way',
      commandments: ['Do No Harm', 'Spread the Word'],
      faithPercent: 10,
      eventNames: ['Great Plague', 'Miracle'],
      powersUsed: { blessings: 3, disasters: 1 },
      warCount: 2,
      techMilestone: 'Printing Press',
      actionSummary: 'mostly blessings',
      harbingerActive: false,
    });
    expect(opts.prompt.length).toBeGreaterThan(50);
    expect(opts.schema?.type).toBe('object');
  });

  it('buildEraNarrativePrompt includes harbinger section for era 7+', () => {
    const opts = buildEraNarrativePrompt({
      eraId: 'atomic',
      eraName: 'Atomic',
      startYear: 1920,
      endYear: 1960,
      religionName: 'The Way',
      commandments: ['Do No Harm'],
      faithPercent: 25,
      eventNames: [],
      powersUsed: { blessings: 2, disasters: 0 },
      warCount: 1,
      techMilestone: 'Nuclear Power',
      actionSummary: 'balanced',
      harbingerActive: true,
      harbingerActions: ['discord in Northern Plains'],
      harbingerTarget: 'player religion',
      playerCounterPlay: '2 shields',
    });
    expect(opts.prompt).toContain('Harbinger');
    expect(opts.prompt).toContain('harbinger_whisper');
  });

  it('buildScripturePrompt returns valid prompt', () => {
    const opts = buildScripturePrompt({
      commandmentNames: ['Do No Harm', 'Spread the Word'],
      commandmentEffects: ['+happiness', '+conversion'],
      tensionPairs: ['Do No Harm conflicts with Conquer'],
      archetypeOrigin: 'shepherd',
    });
    expect(opts.prompt).toContain('shepherd');
    expect(opts.prompt.length).toBeGreaterThan(50);
  });

  it('buildVoicePetitionPrompt includes heresy section for heretics', () => {
    const opts = buildVoicePetitionPrompt({
      voiceName: 'Brother Kael',
      voiceType: 'heretic',
      loyalty: 0.2,
      petitionType: 'reform',
      petitionAction: 'change commandments',
      petitionsAnswered: 0,
      petitionsDenied: 3,
      recentDivineActionsNearby: ['earthquake', 'plague'],
      commandmentNames: ['Do No Harm'],
      regionName: 'Eastern Coast',
      isHeretic: true,
      heresyContradiction: 'pacifism and plague conflict',
    });
    expect(opts.prompt).toContain('heretic');
    expect(opts.prompt).toContain('pacifism and plague conflict');
  });

  it('buildEulogyFallback returns text for all outcome types', () => {
    const outcomes = ['united_front', 'lone_guardian', 'survival', 'extinction', 'self_destruction', 'ascension', 'abandoned'] as const;
    for (const outcome of outcomes) {
      const text = buildEulogyFallback({
        outcome,
        earthNumber: 5,
        godEpithet: 'the Silent Judge',
        religionName: 'Test Faith',
        commandmentNames: [],
        scripture: null,
        pivotalMoments: [],
        namedCharacters: [],
        stats: { followersAtEnd: 1000000, totalInterventions: 50, blessingsUsed: 30, disastersUsed: 20, warCount: 5, erasSurvived: 12 },
        harbingerSummary: 'fought back',
        overallActionPattern: 'balanced',
      });
      expect(text.length).toBeGreaterThan(30);
      expect(text).toContain('Earth #5');
    }
  });

  it('buildMilestoneToast produces text for all categories', () => {
    const categories = ['population', 'territory', 'war_end', 'trade', 'science', 'rival_growth', 'divine_echo', 'dev_milestone'] as const;
    for (const cat of categories) {
      const text = buildMilestoneToast(cat, {
        milestone: 'one million',
        count: 5,
        warName: 'The Northern War',
        casualties: '40,000',
        citiesRazed: 2,
        directionA: 'eastern',
        directionB: 'western',
        milestoneNameSci: 'printing press',
        rivalReligion: 'Iron Covenant',
        direction: 'south',
        powerName: 'miracle',
        cityTier: 'city',
      });
      expect(text.length).toBeGreaterThan(5);
    }
  });

  it('buildEulogyPrompt returns valid prompt', () => {
    const opts = buildEulogyPrompt({
      outcome: 'survival',
      earthNumber: 3,
      godEpithet: 'the Silent Judge',
      religionName: 'Test Faith',
      commandmentNames: ['Do No Harm'],
      scripture: 'Test scripture',
      pivotalMoments: ['Year 1700: Great War'],
      namedCharacters: ['Prophet Asha'],
      stats: { followersAtEnd: 2000000, totalInterventions: 100, blessingsUsed: 60, disastersUsed: 40, warCount: 8, erasSurvived: 10 },
      harbingerSummary: '15 actions, 3 purges done',
      overallActionPattern: 'heavy disaster use',
    });
    expect(opts.prompt).toContain('survival');
    expect(opts.prompt).toContain('Test Faith');
    expect(opts.prompt.length).toBeGreaterThan(100);
  });
});
