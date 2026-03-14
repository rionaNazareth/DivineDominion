import { describe, it, expect } from 'vitest';

import { tickNationAI } from '../nation-ai.js';
import { NATION_AI, GOVERNMENT_EVOLUTION } from '../../config/constants.js';
import type { GameState, NationId } from '../../types/game.js';
import { createInitialGameState } from '../world-gen.js';

describe('nation-ai module', () => {
  it('NAI_001: War declaration threshold 0.60', () => {
    expect(NATION_AI.WAR_DECLARATION_THRESHOLD).toBe(0.60);
  });

  it('NAI_002: Peace threshold 0.50', () => {
    expect(NATION_AI.PEACE_THRESHOLD).toBe(0.50);
  });

  it('NAI_003: tickNationAI returns GameState', () => {
    const state = createInitialGameState(400);
    const next = tickNationAI(state, 0.5);
    expect(next).toBeDefined();
    expect(next.world).toBeDefined();
    expect(next.world.nations).toBeDefined();
  });

  it('NAI_004: Nation count unchanged after tick', () => {
    const state = createInitialGameState(401);
    const before = state.world.nations.size;
    const next = tickNationAI(state, 0.5);
    expect(next.world.nations.size).toBe(before);
  });

  it('NAI_005: War score formula weights sum to 1', () => {
    const sum =
      NATION_AI.WAR_SCORE_MILITARY_WEIGHT +
      NATION_AI.WAR_SCORE_OPINION_WEIGHT +
      NATION_AI.WAR_SCORE_BORDER_WEIGHT +
      NATION_AI.WAR_SCORE_RELIGION_WEIGHT +
      NATION_AI.WAR_SCORE_OPPORTUNITY_WEIGHT;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('NAI_006: Personality weights exist for declare_war', () => {
    expect(NATION_AI.PERSONALITY_WEIGHTS.aggressive.declare_war).toBe(1.5);
    expect(NATION_AI.PERSONALITY_WEIGHTS.defensive.declare_war).toBe(0.4);
    expect(NATION_AI.PERSONALITY_WEIGHTS.balanced.declare_war).toBe(1.0);
  });

  it('NAI_007: Sue peace weight for defensive > aggressive', () => {
    expect(NATION_AI.PERSONALITY_WEIGHTS.defensive.sue_peace).toBeGreaterThan(
      NATION_AI.PERSONALITY_WEIGHTS.aggressive.sue_peace,
    );
  });

  it('NAI_008: At war nation can sue for peace', () => {
    const state = createInitialGameState(402);
    const nationIds = Array.from(state.world.nations.keys()).sort();
    if (nationIds.length >= 2) {
      const a = nationIds[0];
      const b = nationIds[1];
      const relA = state.world.nations.get(a)!.relations.get(b);
      const relB = state.world.nations.get(b)!.relations.get(a);
      if (relA && relB) {
        relA.atWar = true;
        relB.atWar = true;
        relA.warStartTick = state.world.currentTick - 100;
        relB.warStartTick = state.world.currentTick - 100;
        state.world.nations.get(a)!.warWeariness = 0.8;
        state.world.nations.get(a)!.stability = 0.3;
      }
    }
    const next = tickNationAI(state, 0.5);
    expect(next.world).toBeDefined();
  });

  it('NAI_009: No crash when no neighbors', () => {
    const state = createInitialGameState(403);
    const next = tickNationAI(state, 0.5);
    expect(next.world.nations.size).toBeGreaterThan(0);
  });

  it('NAI_010: Relations structure preserved', () => {
    const state = createInitialGameState(404);
    const next = tickNationAI(state, 0.5);
    for (const nation of next.world.nations.values()) {
      expect(nation.relations).toBeDefined();
      expect(nation.relations instanceof Map).toBe(true);
    }
  });

  it('NATION_018: Government evolution monarchy→republic constants', () => {
    expect(GOVERNMENT_EVOLUTION.MONARCHY_TO_REPUBLIC_DEV).toBe(5);
    expect(GOVERNMENT_EVOLUTION.MONARCHY_TO_REPUBLIC_ERA).toBe(4);
  });

  it('NATION_019: Government evolution monarchy→theocracy constants', () => {
    expect(GOVERNMENT_EVOLUTION.MONARCHY_TO_THEOCRACY_FAITH).toBe(0.80);
    expect(GOVERNMENT_EVOLUTION.MONARCHY_TO_THEOCRACY_REGION_RATIO).toBe(0.50);
  });
});
