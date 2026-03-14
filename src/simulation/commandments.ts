import './immer-config.js';
import { produce } from 'immer';

import { COMMANDMENT_STACKING } from '../config/constants.js';
import { BASE_COMMANDMENTS } from '../config/commandments.js';
import type {
  CommandmentEffects,
  CommandmentId,
  GameState,
  Commandment,
} from '../types/game.js';

const NUMERIC_KEYS: (keyof CommandmentEffects)[] = [
  'missionaryEffectiveness',
  'conversionRate',
  'schismRisk',
  'defenseBonus',
  'attackBonus',
  'diplomacyBonus',
  'militaryMorale',
  'militaryStrength',
  'researchSpeed',
  'economicOutput',
  'happiness',
  'stability',
  'populationGrowth',
  'productivityBonus',
  'constructionSpeed',
  'explorationSpeed',
  'tradeBonus',
  'disasterResistance',
  'industrialOutput',
  'divineEnergyCostMod',
  'divineEnergyRegenMod',
  'miracleEffectiveness',
  'integrationSpeed',
  'conversionRetention',
  'faithDecayPerTick',
];

const BOOLEAN_KEYS: (keyof CommandmentEffects)[] = [
  'canDeclareWar',
  'canUsePlague',
  'canUseFamine',
  'passiveSpread',
  'autoConvertOnConquest',
  'holyWarEnabled',
  'hypocrisyDisabled',
];

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Aggregates effects from selected commandments. Numeric fields are summed and
 * clamped to [MODIFIER_CAP_NEGATIVE, MODIFIER_CAP_POSITIVE]. Boolean fields
 * are ANDed (any false => false).
 */
export function getEffectiveCommandmentEffects(
  selectedIds: CommandmentId[],
  baseCommandments: Commandment[],
): CommandmentEffects {
  const byId = new Map<CommandmentId, Commandment>(
    baseCommandments.map((c) => [c.id, c]),
  );
  const aggregate: CommandmentEffects = {};

  for (const key of BOOLEAN_KEYS) {
    (aggregate as Record<string, boolean>)[key] = true;
  }

  for (const id of selectedIds) {
    const cmd = byId.get(id);
    if (!cmd?.effects) continue;
    const e = cmd.effects;
    for (const key of NUMERIC_KEYS) {
      const v = e[key];
      if (typeof v === 'number') {
        const prev = (aggregate[key] as number) ?? 0;
        (aggregate as Record<string, number>)[key] = prev + v;
      }
    }
    for (const key of BOOLEAN_KEYS) {
      const v = e[key];
      if (v === false) (aggregate as Record<string, boolean>)[key] = false;
    }
  }

  for (const key of NUMERIC_KEYS) {
    const v = (aggregate as Record<string, number>)[key];
    if (typeof v === 'number') {
      (aggregate as Record<string, number>)[key] = clamp(
        v,
        COMMANDMENT_STACKING.MODIFIER_CAP_NEGATIVE,
        COMMANDMENT_STACKING.MODIFIER_CAP_POSITIVE,
      );
    }
  }

  return aggregate;
}

/**
 * Computes effective commandment effects from state.selectedCommandments
 * and sets state.effectiveCommandmentEffects. Other systems (nation, religion, etc.)
 * use this cached aggregate for regions where player religion is dominant.
 */
export function applyCommandmentEffects(state: GameState): GameState {
  return produce(state, (draft) => {
    draft.effectiveCommandmentEffects = getEffectiveCommandmentEffects(
      draft.selectedCommandments,
      BASE_COMMANDMENTS,
    );
  });
}
