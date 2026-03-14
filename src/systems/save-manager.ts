// =============================================================================
// DIVINE DOMINION — Save/Load System
// localStorage + IndexedDB-ready. LZ-string compression. SHA-256 checksum.
// See docs/design/test-spec.md §3 and §13.
// =============================================================================

import LZString from 'lz-string';
import { AUTO_SAVE } from '../config/constants.js';
import type {
  GameState,
  GamePhase,
  WorldState,
  DivineState,
  EraId,
  GameEvent,
  PivotalMoment,
  FollowerVoice,
  RegionId,
  NationId,
  ArmyId,
  TradeRouteId,
  ReligionId,
  PowerId,
  WhisperState,
  ComboWindowState,
  CommandmentId,
} from '../types/game.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Storage keys — prefixed to avoid collision with other apps. */
export const STORAGE_KEYS = {
  CURRENT: 'dd_save_current',
  BACKUP: 'dd_save_backup',
  GOD_PROFILE: 'dd_god_profile',
} as const;

export interface SaveData {
  version: number;
  checksum: string;
  timestamp: number;
  gameState: SerializedGameState;
}

interface SerializedGameState {
  phase: GamePhase;
  world: SerializedWorldState;
  divineState: SerializedDivineState;
  whisperState: SerializedWhisperState;
  comboWindowState: SerializedComboWindowState;
  playerReligionId: string;
  selectedCommandments: string[];
  effectiveCommandmentEffects?: unknown;
  eventHistory: GameEvent[];
  currentEvent?: GameEvent;
  eraNarratives: [string, string][];
  pivotalMoments: PivotalMoment[];
  speedMultiplier: number;
  realTimeElapsed: number;
  divineOverlayActive: boolean;
  voiceRecords: FollowerVoice[];
  hypocrisyLevel: number;
  prngState: number;
}

interface SerializedWorldState {
  seed: number;
  currentYear: number;
  currentTick: number;
  regions: [RegionId, unknown][];
  nations: [NationId, unknown][];
  religions: [ReligionId, unknown][];
  armies: [ArmyId, unknown][];
  tradeRoutes: [TradeRouteId, unknown][];
  diseases: unknown[];
  scienceProgress: unknown;
  alienState: unknown;
  currentEra: EraId;
}

interface SerializedDivineState {
  energy: number;
  maxEnergy: number;
  regenPerMinute: number;
  cooldowns: [PowerId, number][];
  totalInterventions: number;
  blessingsUsed: number;
  disastersUsed: number;
  hypocrisyEvents: number;
  lastDisasterYear: number;
  lastMiracleYear: number;
}

interface SerializedWhisperState {
  lastWhisperTime: number;
  lastWhisperRegionId: RegionId | null;
  lastWhisperType: string | null;
  regionCooldowns: [string, number][];
  compoundStacksByNation: [NationId, number][];
}

interface SerializedComboWindowState {
  lastShieldCastByRegion: [RegionId, number][];
  lastMiracleCastByRegion: [RegionId, number][];
}

export class SaveMigrationError extends Error {
  constructor(public fromVersion: number, public toVersion: number) {
    super(`No migration registered for v${fromVersion} → v${toVersion}`);
    this.name = 'SaveMigrationError';
  }
}

// ---------------------------------------------------------------------------
// Migrations registry
// ---------------------------------------------------------------------------

type MigrationRegistry = Record<number, (saveData: SaveData) => SaveData>;

const MIGRATIONS: MigrationRegistry = {
  // Example for future use:
  // 2: (save) => {
  //   save.gameState.world.alienState.harbinger.immuneRegionIds ??= [];
  //   save.gameState.voiceRecords ??= [];
  //   return save;
  // },
};

// ---------------------------------------------------------------------------
// SHA-256 (pure JS, no SubtleCrypto — must work synchronously in test env)
// ---------------------------------------------------------------------------

/**
 * Simple synchronous SHA-256 implementation.
 * We use a custom implementation to stay synchronous (no SubtleCrypto await).
 */
function sha256(message: string): string {
  // Convert string to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // SHA-256 constants
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  // Pad message
  const bytelen = data.length;
  const bitlen = bytelen * 8;
  const padded = new Uint8Array(((bytelen + 9 + 63) & ~63));
  padded.set(data);
  padded[bytelen] = 0x80;
  // Write 64-bit big-endian bit length at end
  for (let i = 0; i < 8; i++) {
    padded[padded.length - 8 + i] = (bitlen / (2 ** ((7 - i) * 8))) & 0xff;
  }

  // Process each 512-bit block
  const view = new DataView(padded.buffer);
  for (let block = 0; block < padded.length; block += 64) {
    const W = new Array<number>(64);
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(block + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return H.map(v => v.toString(16).padStart(8, '0')).join('');
}

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

// ---------------------------------------------------------------------------
// Serialization helpers — Maps → [K, V][] and back
// ---------------------------------------------------------------------------

function serializeMap<K, V>(map: Map<K, V>): [K, V][] {
  return Array.from(map.entries());
}

function deserializeMap<K, V>(entries: [K, V][]): Map<K, V> {
  return new Map(entries);
}

function toSerializable(state: GameState): SerializedGameState {
  const world = state.world;

  // Serialize Nation relations (nested Map)
  const nations = Array.from(world.nations.entries()).map(([id, nation]) => [
    id,
    {
      ...nation,
      relations: serializeMap(nation.relations),
    },
  ]) as [NationId, unknown][];

  // Serialize Disease infectionStartTickByRegion (Map)
  const diseases = world.diseases.map(d => ({
    ...d,
    infectionStartTickByRegion: serializeMap(d.infectionStartTickByRegion),
  }));

  const serializedWorld: SerializedWorldState = {
    seed: world.seed,
    currentYear: world.currentYear,
    currentTick: world.currentTick,
    regions: serializeMap(world.regions) as [RegionId, unknown][],
    nations,
    religions: serializeMap(world.religions) as [ReligionId, unknown][],
    armies: serializeMap(world.armies) as [ArmyId, unknown][],
    tradeRoutes: serializeMap(world.tradeRoutes) as [TradeRouteId, unknown][],
    diseases,
    scienceProgress: world.scienceProgress,
    alienState: world.alienState,
    currentEra: world.currentEra,
  };

  const serializedDivineState: SerializedDivineState = {
    ...state.divineState,
    cooldowns: serializeMap(state.divineState.cooldowns),
  };

  const serializedWhisperState: SerializedWhisperState = {
    lastWhisperTime: state.whisperState.lastWhisperTime,
    lastWhisperRegionId: state.whisperState.lastWhisperRegionId,
    lastWhisperType: state.whisperState.lastWhisperType,
    regionCooldowns: serializeMap(state.whisperState.regionCooldowns),
    compoundStacksByNation: serializeMap(state.whisperState.compoundStacksByNation),
  };

  const serializedComboState: SerializedComboWindowState = {
    lastShieldCastByRegion: serializeMap(state.comboWindowState.lastShieldCastByRegion),
    lastMiracleCastByRegion: serializeMap(state.comboWindowState.lastMiracleCastByRegion),
  };

  return {
    phase: state.phase,
    world: serializedWorld,
    divineState: serializedDivineState,
    whisperState: serializedWhisperState,
    comboWindowState: serializedComboState,
    playerReligionId: state.playerReligionId,
    selectedCommandments: state.selectedCommandments,
    effectiveCommandmentEffects: state.effectiveCommandmentEffects,
    eventHistory: state.eventHistory.slice(-AUTO_SAVE.EVENT_HISTORY_MAX),
    currentEvent: state.currentEvent,
    eraNarratives: serializeMap(state.eraNarratives),
    pivotalMoments: state.pivotalMoments.slice(-AUTO_SAVE.PIVOTAL_MOMENTS_MAX),
    speedMultiplier: state.speedMultiplier,
    realTimeElapsed: state.realTimeElapsed,
    divineOverlayActive: state.divineOverlayActive,
    voiceRecords: state.voiceRecords.slice(-AUTO_SAVE.VOICE_RECORDS_MAX),
    hypocrisyLevel: state.hypocrisyLevel,
    prngState: state.prngState,
  };
}

function fromSerializable(s: SerializedGameState): GameState {
  const sw = s.world;

  const nations = deserializeMap(
    (sw.nations as [NationId, Record<string, unknown>][]).map(([id, nation]) => [
      id,
      { ...nation, relations: deserializeMap(nation.relations as [NationId, unknown][]) },
    ]),
  );

  const diseases = (sw.diseases as Array<Record<string, unknown>>).map(d => ({
    ...d,
    infectionStartTickByRegion: deserializeMap(
      d.infectionStartTickByRegion as [RegionId, number][],
    ),
  }));

  const world: WorldState = {
    seed: sw.seed,
    currentYear: sw.currentYear,
    currentTick: sw.currentTick,
    regions: deserializeMap(sw.regions as [RegionId, unknown][]) as WorldState['regions'],
    nations: nations as WorldState['nations'],
    religions: deserializeMap(sw.religions as [ReligionId, unknown][]) as WorldState['religions'],
    armies: deserializeMap(sw.armies as [ArmyId, unknown][]) as WorldState['armies'],
    tradeRoutes: deserializeMap(sw.tradeRoutes as [TradeRouteId, unknown][]) as WorldState['tradeRoutes'],
    diseases: diseases as WorldState['diseases'],
    scienceProgress: sw.scienceProgress as WorldState['scienceProgress'],
    alienState: sw.alienState as WorldState['alienState'],
    currentEra: sw.currentEra,
  };

  const divineState: DivineState = {
    ...s.divineState,
    cooldowns: deserializeMap(s.divineState.cooldowns) as Map<PowerId, number>,
  };

  const whisperState: WhisperState = {
    lastWhisperTime: s.whisperState.lastWhisperTime,
    lastWhisperRegionId: s.whisperState.lastWhisperRegionId,
    lastWhisperType: s.whisperState.lastWhisperType as WhisperState['lastWhisperType'],
    regionCooldowns: deserializeMap(s.whisperState.regionCooldowns),
    compoundStacksByNation: deserializeMap(s.whisperState.compoundStacksByNation),
  };

  const comboWindowState: ComboWindowState = {
    lastShieldCastByRegion: deserializeMap(s.comboWindowState.lastShieldCastByRegion),
    lastMiracleCastByRegion: deserializeMap(s.comboWindowState.lastMiracleCastByRegion),
  };

  return {
    phase: s.phase,
    world,
    divineState,
    whisperState,
    comboWindowState,
    playerReligionId: s.playerReligionId as ReligionId,
    selectedCommandments: s.selectedCommandments as CommandmentId[],
    effectiveCommandmentEffects: s.effectiveCommandmentEffects as GameState['effectiveCommandmentEffects'],
    eventHistory: s.eventHistory,
    currentEvent: s.currentEvent,
    eraNarratives: deserializeMap(s.eraNarratives) as Map<EraId, string>,
    pivotalMoments: s.pivotalMoments,
    speedMultiplier: s.speedMultiplier as GameState['speedMultiplier'],
    realTimeElapsed: s.realTimeElapsed,
    divineOverlayActive: s.divineOverlayActive,
    voiceRecords: s.voiceRecords,
    hypocrisyLevel: s.hypocrisyLevel,
    prngState: s.prngState,
  };
}

// ---------------------------------------------------------------------------
// Storage adapter (injectable for testing)
// ---------------------------------------------------------------------------

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

let _storage: StorageAdapter = {
  get: (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null),
  set: (k, v) => { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); },
  remove: (k) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(k); },
};

/** Override storage adapter (useful for tests and Node env). */
export function setStorageAdapter(adapter: StorageAdapter): void {
  _storage = adapter;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a compressed save string.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateSave(compressed: string): { valid: boolean; error?: string } {
  // Step 1: Decompress
  let json: string | null;
  try {
    json = LZString.decompressFromUTF16(compressed);
  } catch {
    return { valid: false, error: 'decompression_failed' };
  }
  if (!json) return { valid: false, error: 'decompression_failed' };

  // Step 2: Parse JSON
  let saveData: SaveData;
  try {
    saveData = JSON.parse(json) as SaveData;
  } catch {
    return { valid: false, error: 'json_parse_failed' };
  }

  // Step 3: Version check
  if (typeof saveData.version !== 'number' || saveData.version < 1)
    return { valid: false, error: 'invalid_version' };
  if (saveData.version > AUTO_SAVE.VERSION)
    return { valid: false, error: 'future_version' };

  // Step 4: Checksum verification
  const recomputed = sha256(JSON.stringify(saveData.gameState));
  if (recomputed !== saveData.checksum)
    return { valid: false, error: 'checksum_mismatch' };

  // Step 5: Schema validation
  const gs = saveData.gameState;
  if (!gs.world || !gs.divineState || !gs.playerReligionId || !gs.prngState)
    return { valid: false, error: 'missing_critical_fields' };

  // Step 6: Range checks
  if (gs.world.currentYear < 1600 || gs.world.currentYear > 2200)
    return { valid: false, error: 'year_out_of_range' };
  if (gs.world.currentTick < 0 || gs.world.currentTick > 1200)
    return { valid: false, error: 'tick_out_of_range' };

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/** Migrate save data to current version. Throws SaveMigrationError if missing. */
export function migrateSave(saveData: SaveData): SaveData {
  let current = { ...saveData };
  while (current.version < AUTO_SAVE.VERSION) {
    const next = current.version + 1;
    const migrator = MIGRATIONS[next];
    if (!migrator) throw new SaveMigrationError(current.version, next);
    current = migrator(current);
    current.version = next;
    current.checksum = sha256(JSON.stringify(current.gameState));
  }
  return current;
}

// ---------------------------------------------------------------------------
// Core save/load
// ---------------------------------------------------------------------------

function buildSaveData(state: GameState): SaveData {
  const serialized = toSerializable(state);
  const json = JSON.stringify(serialized);
  const checksum = sha256(json);
  return {
    version: AUTO_SAVE.VERSION,
    checksum,
    timestamp: Date.now(),
    gameState: serialized,
  };
}

/**
 * Save current game state to localStorage.
 * Returns true if successful. Uses slot rotation: backup ← current ← new.
 */
export function saveGame(state: GameState): boolean {
  try {
    const saveData = buildSaveData(state);
    const json = JSON.stringify(saveData);
    const compressed = LZString.compressToUTF16(json);

    // Rotate: copy current → backup
    const existing = _storage.get(STORAGE_KEYS.CURRENT);
    if (existing) {
      _storage.set(STORAGE_KEYS.BACKUP, existing);
    }

    // Write new save to current
    _storage.set(STORAGE_KEYS.CURRENT, compressed);

    // Verify the write
    const verification = _storage.get(STORAGE_KEYS.CURRENT);
    if (!verification) return false;
    const check = validateSave(verification);
    if (!check.valid) {
      // Restore backup if verification fails
      if (existing) _storage.set(STORAGE_KEYS.CURRENT, existing);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Load saved game. Returns GameState or null on failure/corruption.
 * Follows the recovery strategy from docs/design/test-spec.md §13.
 */
export function loadGame(): GameState | null {
  // Attempt 1: load save_current
  const current = _storage.get(STORAGE_KEYS.CURRENT);
  if (current) {
    const result = tryDeserialize(current);
    if (result) return result;
  }

  // Attempt 2: fallback to backup
  const backup = _storage.get(STORAGE_KEYS.BACKUP);
  if (backup) {
    const result = tryDeserialize(backup);
    if (result) return result;
  }

  return null;
}

function tryDeserialize(compressed: string): GameState | null {
  try {
    const json = LZString.decompressFromUTF16(compressed);
    if (!json) return null;
    const saveData = JSON.parse(json) as SaveData;

    // Migrate if needed
    const migrated = migrateSave(saveData);

    // Verify checksum post-migration
    const recomputed = sha256(JSON.stringify(migrated.gameState));
    if (recomputed !== migrated.checksum) return null;

    return fromSerializable(migrated.gameState);
  } catch {
    return null;
  }
}

/** Delete all save data. Call when user chooses "New Earth" after corruption. */
export function clearSaves(): void {
  _storage.remove(STORAGE_KEYS.CURRENT);
  _storage.remove(STORAGE_KEYS.BACKUP);
}

// ---------------------------------------------------------------------------
// Auto-save scheduler state
// ---------------------------------------------------------------------------

let _lastAutoSaveTick = -1;

/**
 * Check if an auto-save should fire this tick.
 * Returns true if save was needed and attempted.
 */
export function tickAutoSave(state: GameState): boolean {
  const tick = state.world.currentTick;
  if (tick - _lastAutoSaveTick < AUTO_SAVE.MIN_TICKS_BETWEEN) return false;
  if (tick % AUTO_SAVE.TICK_INTERVAL !== 0) return false;

  const success = saveGame(state);
  if (success) _lastAutoSaveTick = tick;
  return success;
}

// ---------------------------------------------------------------------------
// Exports for testing (serialization internals)
// ---------------------------------------------------------------------------
export { toSerializable, fromSerializable, sha256, buildSaveData };
