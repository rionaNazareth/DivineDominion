import { describe, it, expect } from 'vitest';

import {
  getEffectiveCommandmentEffects,
  applyCommandmentEffects,
} from '../commandments.js';
import { BASE_COMMANDMENTS } from '../../config/commandments.js';
import { COMMANDMENT_STACKING } from '../../config/constants.js';
import type { GameState, CommandmentId } from '../../types/game.js';
import { createInitialGameState } from '../world-gen.js';

describe('commandments module', () => {
  it('CMD_001: Empty selection returns default aggregate', () => {
    const effects = getEffectiveCommandmentEffects([], BASE_COMMANDMENTS);
    expect(effects.defenseBonus).toBeUndefined();
    expect(effects.canDeclareWar).toBe(true);
  });

  it('CMD_002: Single commandment applies its effects', () => {
    const effects = getEffectiveCommandmentEffects(
      ['preach_to_all_lands' as CommandmentId],
      BASE_COMMANDMENTS,
    );
    expect(effects.missionaryEffectiveness).toBe(0.25);
  });

  it('CMD_003: Numeric effects sum from multiple commandments', () => {
    const effects = getEffectiveCommandmentEffects(
      [
        'preach_to_all_lands',
        'welcome_all',
      ] as CommandmentId[],
      BASE_COMMANDMENTS,
    );
    expect(effects.missionaryEffectiveness).toBe(0.25);
    expect(effects.conversionRate).toBe(0.3);
    expect(effects.schismRisk).toBe(0.15);
  });

  it('CMD_004: Numeric aggregate clamped to MODIFIER_CAP_POSITIVE', () => {
    const ids = [
      'sacred_borders',
      'righteous_defense',
    ] as CommandmentId[];
    const effects = getEffectiveCommandmentEffects(ids, BASE_COMMANDMENTS);
    expect(effects.defenseBonus).toBeLessThanOrEqual(COMMANDMENT_STACKING.MODIFIER_CAP_POSITIVE);
    expect(effects.defenseBonus).toBe(0.4 + 0.3);
  });

  it('CMD_005: Numeric aggregate clamped to MODIFIER_CAP_NEGATIVE', () => {
    const effects = getEffectiveCommandmentEffects(
      ['convert_by_example', 'holy_conquest'] as CommandmentId[],
      BASE_COMMANDMENTS,
    );
    expect(effects.conversionRetention).toBeGreaterThanOrEqual(
      COMMANDMENT_STACKING.MODIFIER_CAP_NEGATIVE,
    );
  });

  it('CMD_006: Boolean AND — any false => false', () => {
    const effects = getEffectiveCommandmentEffects(
      ['sacred_borders', 'turn_other_cheek'] as CommandmentId[],
      BASE_COMMANDMENTS,
    );
    expect(effects.canDeclareWar).toBe(false);
  });

  it('CMD_007: applyCommandmentEffects sets effectiveCommandmentEffects on state', () => {
    const state = createInitialGameState(1);
    state.selectedCommandments = ['preach_to_all_lands'] as CommandmentId[];
    const next = applyCommandmentEffects(state);
    expect(next.effectiveCommandmentEffects).toBeDefined();
    expect(next.effectiveCommandmentEffects!.missionaryEffectiveness).toBe(0.25);
  });

  it('CMD_008: Unknown commandment id skipped', () => {
    const effects = getEffectiveCommandmentEffects(
      ['preach_to_all_lands', 'nonexistent_cmd' as CommandmentId],
      BASE_COMMANDMENTS,
    );
    expect(effects.missionaryEffectiveness).toBe(0.25);
  });

  it('CMD_009: passiveSpread true when any selected has it', () => {
    const effects = getEffectiveCommandmentEffects(
      ['convert_by_example'] as CommandmentId[],
      BASE_COMMANDMENTS,
    );
    expect(effects.passiveSpread).toBe(true);
  });

  it('CMD_010: holyWarEnabled from smite_the_wicked', () => {
    const effects = getEffectiveCommandmentEffects(
      ['smite_the_wicked'] as CommandmentId[],
      BASE_COMMANDMENTS,
    );
    expect(effects.holyWarEnabled).toBe(true);
    expect(effects.militaryMorale).toBe(0.2);
    expect(effects.diplomacyBonus).toBe(-0.4);
  });
});
