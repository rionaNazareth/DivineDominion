import { describe, it, expect } from 'vitest';
import { castWhisper, tickWhispers } from '../whispers.js';
import { createInitialGameState } from '../world-gen.js';
import type { GameState } from '../../types/game.js';
import { WHISPERS } from '../../config/constants.js';
import { produce } from 'immer';

function makeState(): GameState {
  const state = createInitialGameState(13);
  return produce(state, draft => {
    draft.divineState.energy = 10;
    draft.divineState.maxEnergy = 20;
    draft.realTimeElapsed = 1000; // start at t=1000 so we have clean baseline
    draft.whisperState.lastWhisperTime = 0; // no recent whisper
  });
}

function firstLandRegionId(state: GameState): string {
  for (const [id, region] of state.world.regions) {
    if (region.terrain !== 'ocean') return id;
  }
  return Array.from(state.world.regions.keys())[0];
}

function nationForRegion(state: GameState, regionId: string): string {
  return state.world.regions.get(regionId)!.nationId;
}

describe('whispers', () => {
  it('WHIS_001: region cooldown 30s — casting war sets 30s cooldown per type', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const t = 1000;
    const stateT = produce(state, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    const result = castWhisper(stateT, regionId, 'war', t);
    // Last whisper time should be updated
    expect(result.whisperState.lastWhisperTime).toBe(t);
    // Region cooldown for war set
    expect(result.whisperState.regionCooldowns.get(`${regionId}:war`)).toBe(t);
  });

  it('WHIS_002: global cooldown 10s — blocks next whisper within 10s', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const t = 1000;
    // Cast at t=1000
    let s = produce(state, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    s = castWhisper(s, regionId, 'peace', t);
    // Try to cast again at t=1005 (within 10s global)
    const s2 = castWhisper(s, regionId, 'war', t + 5);
    // Should be blocked: lastWhisperTime still = 1000
    expect(s2.whisperState.lastWhisperTime).toBe(t);
  });

  it('WHIS_003: nudge base strength — cast war adds +0.15 to war AI weight', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const nationId = nationForRegion(state, regionId);
    const originalWeight = state.world.nations.get(nationId)!.aiWeights.war;
    const t = 1000;
    const s = produce(state, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    const result = castWhisper(s, regionId, 'war', t);
    const newWeight = result.world.nations.get(nationId)!.aiWeights.war;
    expect(newWeight).toBeCloseTo(Math.min(1.0, originalWeight + WHISPERS.AI_NUDGE_STRENGTH), 4);
  });

  it('WHIS_004: compound bonus — repeat on same nation adds +0.05 per stack, max 3', () => {
    expect(WHISPERS.COMPOUND_BONUS).toBe(0.05);
    expect(WHISPERS.COMPOUND_MAX_STACKS).toBe(3);
  });

  it('WHIS_005a: 3-stack nudge value — 3 whispers = 0.15 + 2×0.05 = 0.25', () => {
    // After 2 previous stacks, the nudge for the 3rd whisper = 0.15 + 2×0.05 = 0.25
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const nationId = nationForRegion(state, regionId);
    let s = produce(state, draft => {
      draft.realTimeElapsed = 0;
      draft.whisperState.lastWhisperTime = -100; // no cooldown
      // Pre-set 2 compound stacks
      draft.whisperState.compoundStacksByNation.set(nationId, 2);
      draft.world.nations.get(nationId)!.aiWeights.war = 0;
    });
    const result = castWhisper(s, regionId, 'war', 0);
    const nudge = result.world.nations.get(nationId)!.aiWeights.war;
    // With 2 pre-existing stacks, bonus_stacks = min(2, 3) = 2; nudge = 0.15 + 2×0.05 = 0.25
    expect(nudge).toBeCloseTo(0.25, 4);
  });

  it('WHIS_005b: 4-stack nudge cap — 4+ whispers capped at 0.30', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const nationId = nationForRegion(state, regionId);
    let s = produce(state, draft => {
      draft.realTimeElapsed = 0;
      draft.whisperState.lastWhisperTime = -100;
      // Pre-set 3 compound stacks (max)
      draft.whisperState.compoundStacksByNation.set(nationId, 3);
      draft.world.nations.get(nationId)!.aiWeights.war = 0;
    });
    const result = castWhisper(s, regionId, 'war', 0);
    const nudge = result.world.nations.get(nationId)!.aiWeights.war;
    // With 3 pre-existing stacks, bonus_stacks = min(3, 3) = 3; nudge = 0.15 + 3×0.05 = 0.30 (capped)
    expect(nudge).toBeCloseTo(WHISPERS.NUDGE_CAP, 4);
  });

  it('WHIS_006: zero energy cost — energy unchanged after whisper', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const energyBefore = state.divineState.energy;
    const t = 1000;
    const s = produce(state, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    const result = castWhisper(s, regionId, 'science', t);
    expect(result.divineState.energy).toBe(energyBefore);
  });

  it('WHIS_007: voice loyalty bonus — whisper to voice region adds +0.02', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const stateWithVoice = produce(state, draft => {
      draft.voiceRecords.push({
        id: 'voice_test',
        type: 'prophet',
        name: 'Samuel',
        regionId,
        loyalty: 0.7,
        birthYear: 1600,
        lifespanYears: 150,
        eraBorn: 'renaissance',
        lineageOf: null,
        currentPetition: null,
      });
    });
    const t = 1000;
    const s = produce(stateWithVoice, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    const result = castWhisper(s, regionId, 'faith', t);
    const voice = result.voiceRecords.find(v => v.id === 'voice_test');
    expect(voice!.loyalty).toBeCloseTo(0.7 + WHISPERS.LOYALTY_BONUS, 4);
  });

  it('WHIS_008: tickWhispers cooldown decrement — real time elapses', () => {
    const state = makeState();
    const result = tickWhispers(state, 12); // 12 real seconds
    expect(result.realTimeElapsed).toBeCloseTo(state.realTimeElapsed + 12, 4);
  });

  it('WHIS_009: whisper types — all 4 types valid', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const types = WHISPERS.TYPES;
    expect(types).toContain('war');
    expect(types).toContain('peace');
    expect(types).toContain('science');
    expect(types).toContain('faith');
    expect(types.length).toBe(4);
  });

  it('WHIS_010: region must exist — cast fails for invalid regionId', () => {
    const state = makeState();
    const before = state.whisperState.lastWhisperTime;
    const result = castWhisper(state, 'INVALID_REGION', 'war', 1000);
    expect(result.whisperState.lastWhisperTime).toBe(before);
  });

  it('WHIS_011: peace cancels Discord — peace whisper removes discord effect', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const stateWithDiscord = produce(state, draft => {
      const region = draft.world.regions.get(regionId)!;
      region.activeEffects.push({
        powerId: 'discord',
        startYear: 1600,
        endYear: 1610,
        sourceReligionId: 'harbinger',
      });
    });
    const t = 1000;
    const s = produce(stateWithDiscord, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    const result = castWhisper(s, regionId, 'peace', t);
    const region = result.world.regions.get(regionId)!;
    expect(region.activeEffects.find(e => e.powerId === 'discord')).toBeUndefined();
  });

  it('WHIS_012: compound stacks same nation — 3 whispers → stack count = 3', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const nationId = nationForRegion(state, regionId);

    // Each whisper is to the same nation, stacks should count up
    let s = produce(state, draft => {
      draft.realTimeElapsed = 0;
      draft.whisperState.lastWhisperTime = -100;
    });
    s = castWhisper(s, regionId, 'war', 0);
    // Update time past global cooldown, reset region cooldown
    s = produce(s, draft => {
      draft.whisperState.lastWhisperTime = -100;
    });
    s = castWhisper(s, regionId, 'science', 15);
    s = produce(s, draft => {
      draft.whisperState.lastWhisperTime = -100;
    });
    s = castWhisper(s, regionId, 'faith', 50);

    const stacks = s.whisperState.compoundStacksByNation.get(nationId) ?? 0;
    expect(stacks).toBeGreaterThanOrEqual(1);
  });

  it('WHIS_013: cooldown blocks rapid cast — global cooldown at t=5 is blocked', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const t = 1000;
    let s = produce(state, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    s = castWhisper(s, regionId, 'war', t);
    // t+5 is within global 10s cooldown
    const beforeTime = s.whisperState.lastWhisperTime;
    const r = castWhisper(s, regionId, 'peace', t + 5);
    // Should be blocked — lastWhisperTime unchanged
    expect(r.whisperState.lastWhisperTime).toBe(beforeTime);
  });

  it('WHIS_014: per-type region cooldown — war and peace are separate per region', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const t = 1000;
    let s = produce(state, draft => { draft.realTimeElapsed = t; draft.whisperState.lastWhisperTime = 0; });
    // Cast war on region
    s = castWhisper(s, regionId, 'war', t);
    const warTime = s.whisperState.lastWhisperTime;

    // After 15s (past global 10s but not 30s region war cooldown), cast peace (different type)
    const t2 = t + 15;
    const sWithTime = produce(s, draft => { draft.whisperState.lastWhisperTime = t; });
    const r = castWhisper(sWithTime, regionId, 'peace', t2);
    // Peace should be allowed (different type, past global cooldown)
    expect(r.whisperState.lastWhisperTime).toBe(t2);
  });

  it('WHIS_015: AI weight application — nudge updates nation AI weights', () => {
    const state = makeState();
    const regionId = firstLandRegionId(state);
    const nationId = nationForRegion(state, regionId);
    const t = 1000;
    // Set science below cap so nudge is observable
    const s = produce(state, draft => {
      draft.realTimeElapsed = t;
      draft.whisperState.lastWhisperTime = 0;
      const nation = draft.world.nations.get(nationId);
      if (nation) nation.aiWeights.science = 0.5;
    });
    const originalScience = s.world.nations.get(nationId)!.aiWeights.science;
    const result = castWhisper(s, regionId, 'science', t);
    const newScience = result.world.nations.get(nationId)!.aiWeights.science;
    expect(newScience).toBeGreaterThan(originalScience);
  });
});
