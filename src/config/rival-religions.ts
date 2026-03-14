// =============================================================================
// DIVINE DOMINION — Pre-Made Rival Religion Templates (10 total)
// =============================================================================
// Source of truth: docs/design/05b-religions-premade.md
// Types: src/types/game.ts (Religion, ReligionPersonality, HiddenDivineRule)
// WORLD_GEN.RIVAL_RELIGIONS_PREMADE_POOL = 10 (src/config/constants.ts)
// =============================================================================

import type {
  Religion,
  ReligionPersonality,
  HiddenDivineRule,
  CommandmentId,
} from '../types/game.js';

// ---------------------------------------------------------------------------
// Template type (adds flavor text on top of runtime Religion shape)
// ---------------------------------------------------------------------------

export interface RivalReligionTemplate {
  id: string;
  name: string;
  color: string;
  symbol: string;
  personality: ReligionPersonality;
  commandments: CommandmentId[];
  hiddenRules: HiddenDivineRule[];
  flavorText: string;
}

function makeRule(
  id: string,
  conditionType: HiddenDivineRule['condition']['type'],
  conditionThreshold: number,
  effectType: HiddenDivineRule['effect']['type'],
  effectMagnitude: number,
  durationTicks: number,
): HiddenDivineRule {
  return {
    id,
    condition: { type: conditionType, threshold: conditionThreshold },
    effect: { type: effectType, magnitude: effectMagnitude, durationTicks },
    cooldownTicks: 50,
    lastTriggeredTick: -999,
  };
}

// ---------------------------------------------------------------------------
// The 10 pre-made religions
// ---------------------------------------------------------------------------

export const PREMADE_RIVAL_RELIGIONS: RivalReligionTemplate[] = [
  // 1. Order of the Flame — militant
  {
    id: 'order_of_the_flame',
    name: 'Order of the Flame',
    color: '#DC143C',
    symbol: 'sword_fire',
    personality: 'militant',
    commandments: [
      'smite_the_wicked', 'holy_conquest', 'fear_gods_wrath', 'dominion_over_nature',
      'reward_the_strong', 'discipline_above_all', 'sacred_borders', 'sacrifices_please_god',
      'justice_absolute', 'righteous_defense',
    ],
    hiddenRules: [
      makeRule('flame_war_boost', 'at_war', 1, 'military_boost', 0.15, 20),
      makeRule('flame_faith_disaster', 'faith_above', 0.7, 'disaster_on_enemy', 0.08, 20),
      makeRule('flame_pop_faith', 'population_above', 150_000, 'faith_boost', 0.02, 20),
    ],
    flavorText: 'The Flame does not ask. The Flame takes, purifies, and ascends. We are the sword of a god who does not forgive.',
  },

  // 2. Children of the Harvest — peaceful
  {
    id: 'children_of_the_harvest',
    name: 'Children of the Harvest',
    color: '#8FBC8F',
    symbol: 'wheat_crescent',
    personality: 'peaceful',
    commandments: [
      'turn_other_cheek', 'share_all_wealth', 'celebrate_life', 'earth_is_sacred',
      'harmony_with_seasons', 'all_life_sacred', 'teach_every_child', 'charity_above_all',
      'convert_by_example', 'diplomatic_union',
    ],
    hiddenRules: [
      makeRule('harvest_peace_pop', 'at_peace_ticks', 50, 'population_boost', 0.02, 20),
      makeRule('harvest_faith_happiness', 'faith_above', 0.6, 'happiness_boost', 0.05, 20),
      makeRule('harvest_dev_economy', 'development_above', 5, 'economy_boost', 0.08, 20),
    ],
    flavorText: 'Our god speaks in the growing of grain and the laughter of children. There is no sermon louder than a shared meal.',
  },

  // 3. Watchers of the Deep — scholarly
  {
    id: 'watchers_of_the_deep',
    name: 'Watchers of the Deep',
    color: '#191970',
    symbol: 'eye_spiral',
    personality: 'scholarly',
    commandments: [
      'seek_truth', 'teach_every_child', 'learn_from_all', 'sacred_knowledge',
      'build_great_works', 'convert_by_example', 'god_is_silent', 'diplomatic_union',
      'honor_elders', 'forgive_and_redeem',
    ],
    hiddenRules: [
      makeRule('watchers_dev_economy', 'development_above', 5, 'economy_boost', 0.10, 20),
      makeRule('watchers_trade_dev', 'trade_routes_above', 2, 'development_boost', 0.03, 20),
      makeRule('watchers_era_faith', 'era_reached', 5, 'faith_boost', 0.02, 20),
    ],
    flavorText: 'God is in the equation. God is in the star chart. God is in the footnote you almost missed. Look deeper.',
  },

  // 4. Cult of Endings — apocalyptic
  {
    id: 'cult_of_endings',
    name: 'Cult of Endings',
    color: '#4A4A4A',
    symbol: 'cracked_sun',
    personality: 'apocalyptic',
    commandments: [
      'fear_gods_wrath', 'smite_the_wicked', 'ends_justify_means', 'sacrifices_please_god',
      'dominion_over_nature', 'signs_and_wonders', 'holy_conquest', 'discipline_above_all',
      'forbidden_knowledge', 'sacred_borders',
    ],
    hiddenRules: [
      makeRule('endings_era_disaster', 'era_reached', 8, 'disaster_on_enemy', 0.10, 20),
      makeRule('endings_army_military', 'army_strength_above', 15_000, 'military_boost', 0.12, 20),
      makeRule('endings_low_pop_faith', 'population_below', 50_000, 'faith_boost', 0.03, 20),
    ],
    flavorText: 'All things end. We are not afraid of the ending. We are the ending.',
  },

  // 5. Seekers of Unity — syncretic
  {
    id: 'seekers_of_unity',
    name: 'Seekers of Unity',
    color: '#FFBF00',
    symbol: 'five_rivers',
    personality: 'syncretic',
    commandments: [
      'welcome_all', 'learn_from_all', 'diplomatic_union', 'forgive_and_redeem',
      'celebrate_life', 'share_all_wealth', 'convert_by_example', 'teach_every_child',
      'charity_above_all', 'harmony_with_seasons',
    ],
    hiddenRules: [
      makeRule('unity_faith_happiness', 'faith_above', 0.7, 'happiness_boost', 0.05, 20),
      makeRule('unity_trade_faith', 'trade_routes_above', 3, 'faith_boost', 0.02, 20),
      makeRule('unity_peace_dev', 'at_peace_ticks', 40, 'development_boost', 0.03, 20),
    ],
    flavorText: 'Every god is a face of the same truth. Every faith, a road to the same mountain. We walk all roads.',
  },

  // 6. The Silent Fortress — isolationist
  {
    id: 'the_silent_fortress',
    name: 'The Silent Fortress',
    color: '#708090',
    symbol: 'walled_tower',
    personality: 'isolationist',
    commandments: [
      'sacred_borders', 'forbidden_knowledge', 'righteous_defense', 'honor_elders',
      'discipline_above_all', 'god_is_silent', 'sacred_knowledge', 'earth_is_sacred',
      'justice_absolute', 'help_themselves',
    ],
    hiddenRules: [
      makeRule('fortress_small_faith', 'region_count_below', 4, 'faith_boost', 0.03, 20),
      makeRule('fortress_peace_dev', 'at_peace_ticks', 60, 'development_boost', 0.04, 20),
      makeRule('fortress_pop_shield', 'population_above', 100_000, 'natural_disaster_shield', 1, 20),
    ],
    flavorText: 'We need nothing from beyond our walls. Our god is the stone beneath us and the silence above.',
  },

  // 7. Golden Covenant — mercantile
  {
    id: 'golden_covenant',
    name: 'Golden Covenant',
    color: '#DAA520',
    symbol: 'balanced_scale',
    personality: 'mercantile',
    commandments: [
      'reward_the_strong', 'wander_and_explore', 'build_great_works', 'learn_from_all',
      'convert_by_example', 'diplomatic_union', 'welcome_all', 'help_themselves',
      'dominion_over_nature', 'celebrate_life',
    ],
    hiddenRules: [
      makeRule('covenant_trade_economy', 'trade_routes_above', 3, 'economy_boost', 0.12, 20),
      makeRule('covenant_dev_pop', 'development_above', 6, 'population_boost', 0.02, 20),
      makeRule('covenant_peace_faith', 'at_peace_ticks', 30, 'faith_boost', 0.02, 20),
    ],
    flavorText: 'God loves a profit. Every trade route is a prayer line. Every coin exchanged is communion.',
  },

  // 8. The Wandering Path — expansionist
  {
    id: 'the_wandering_path',
    name: 'The Wandering Path',
    color: '#008080',
    symbol: 'compass_eye',
    personality: 'expansionist',
    commandments: [
      'preach_to_all_lands', 'welcome_all', 'wander_and_explore', 'convert_by_example',
      'teach_every_child', 'celebrate_life', 'signs_and_wonders', 'conquer_and_enlighten',
      'build_great_works', 'learn_from_all',
    ],
    hiddenRules: [
      makeRule('wandering_region_faith', 'region_count_above', 6, 'faith_boost', 0.03, 20),
      makeRule('wandering_pop_military', 'population_above', 200_000, 'military_boost', 0.10, 20),
      makeRule('wandering_trade_dev', 'trade_routes_above', 2, 'development_boost', 0.02, 20),
    ],
    flavorText: 'To stay is to stagnate. To move is to pray. Our god walks ahead of us — always just beyond the next horizon.',
  },

  // 9. Keepers of the Veil — peaceful (mystical variant)
  {
    id: 'keepers_of_the_veil',
    name: 'Keepers of the Veil',
    color: '#6A0DAD',
    symbol: 'half_closed_eye',
    personality: 'peaceful',
    commandments: [
      'god_is_silent', 'sacred_knowledge', 'harmony_with_seasons', 'earth_is_sacred',
      'honor_elders', 'turn_other_cheek', 'convert_by_example', 'forgive_and_redeem',
      'teach_every_child', 'all_life_sacred',
    ],
    hiddenRules: [
      makeRule('veil_peace_happiness', 'at_peace_ticks', 40, 'happiness_boost', 0.06, 20),
      makeRule('veil_dev_faith', 'development_above', 7, 'faith_boost', 0.03, 20),
      makeRule('veil_high_faith_shield', 'faith_above', 0.8, 'natural_disaster_shield', 1, 20),
    ],
    flavorText: 'The truth is a veil. We do not tear it — we learn to see through it. Patience is prayer. Stillness is worship.',
  },

  // 10. The Iron Dawn — militant (revolutionary variant)
  {
    id: 'the_iron_dawn',
    name: 'The Iron Dawn',
    color: '#B22222',
    symbol: 'rising_fist',
    personality: 'militant',
    commandments: [
      'smite_the_wicked', 'conquer_and_enlighten', 'share_all_wealth', 'ends_justify_means',
      'discipline_above_all', 'preach_to_all_lands', 'teach_every_child', 'signs_and_wonders',
      'sacrifices_please_god', 'seek_truth',
    ],
    hiddenRules: [
      makeRule('dawn_war_faith', 'at_war', 1, 'faith_boost', 0.03, 20),
      makeRule('dawn_pop_military', 'population_above', 100_000, 'military_boost', 0.12, 20),
      makeRule('dawn_era_economy', 'era_reached', 4, 'economy_boost', 0.06, 20),
    ],
    flavorText: 'God did not make us free. God made us capable of taking freedom. The chains break when the faithful rise.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function toReligion(template: RivalReligionTemplate): Religion {
  return {
    id: template.id,
    name: template.name,
    color: template.color,
    symbol: template.symbol,
    commandments: template.commandments,
    isPlayerReligion: false,
    personality: template.personality,
    hiddenRules: template.hiddenRules,
  };
}

export function getPremadeReligionById(id: string): RivalReligionTemplate | undefined {
  return PREMADE_RIVAL_RELIGIONS.find((r) => r.id === id);
}

// Type alias for external use
export type { Religion };
