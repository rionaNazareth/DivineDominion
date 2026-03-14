import type {
  Commandment,
  CommandmentEffects,
  CommandmentId,
  UnlockCondition,
} from '../types/game.js';

function makeCommandment(
  id: CommandmentId,
  category: Commandment['category'],
  name: string,
  flavorText: string,
  effects: CommandmentEffects,
  tensionsWith: CommandmentId[] = [],
  unlockCondition?: UnlockCondition,
): Commandment {
  return { id, category, name, flavorText, effects, tensionsWith, unlockCondition };
}

// Base (always unlocked) commandments — 35 total
export const BASE_COMMANDMENTS: Commandment[] = [
  // EXPANSION (5)
  makeCommandment(
    'preach_to_all_lands',
    'expansion',
    'Preach to All Lands',
    'Go forth and let no ear remain unblessed.',
    { missionaryEffectiveness: 0.25 },
  ),
  makeCommandment(
    'convert_by_example',
    'expansion',
    'Convert by Example',
    'Let your deeds speak where words cannot reach.',
    {
      conversionRetention: 0.2,
      passiveSpread: true,
      conversionRate: -0.15,
    },
  ),
  makeCommandment(
    'holy_conquest',
    'expansion',
    'Holy Conquest',
    'The sword carries the word where the tongue cannot.',
    {
      autoConvertOnConquest: true,
      conversionRetention: -0.1,
      happiness: -0.05,
    },
  ),
  makeCommandment(
    'welcome_all',
    'expansion',
    'Welcome All',
    'Every stranger is a congregation waiting to form.',
    {
      conversionRate: 0.3,
      schismRisk: 0.15,
    },
  ),
  makeCommandment(
    'sacred_borders',
    'expansion',
    'Sacred Borders',
    'What is yours is holy. Defend it.',
    {
      defenseBonus: 0.4,
      canDeclareWar: false,
    },
  ),

  // CONFLICT (5)
  makeCommandment(
    'turn_other_cheek',
    'conflict',
    'Turn the Other Cheek',
    'Suffer the blow, and let the bruise convert the striker.',
    {
      conversionRate: 0.2,
      canDeclareWar: false,
    },
  ),
  makeCommandment(
    'righteous_defense',
    'conflict',
    'Righteous Defense',
    'Strike no first blow. Strike the last.',
    {
      defenseBonus: 0.3,
      canDeclareWar: false,
    },
  ),
  makeCommandment(
    'smite_the_wicked',
    'conflict',
    'Smite the Wicked',
    'There is no peace with the unrighteous.',
    {
      holyWarEnabled: true,
      militaryMorale: 0.2,
      diplomacyBonus: -0.4,
    },
  ),
  makeCommandment(
    'conquer_and_enlighten',
    'conflict',
    'Conquer and Enlighten',
    'Victory is the first step of education.',
    {
      attackBonus: 0.1,
      integrationSpeed: 0.3,
    },
  ),
  makeCommandment(
    'diplomatic_union',
    'conflict',
    'Diplomatic Union',
    'The table is mightier than the sword.',
    {
      diplomacyBonus: 0.3,
      militaryStrength: -0.15,
    },
  ),

  // KNOWLEDGE (5)
  makeCommandment(
    'seek_truth',
    'knowledge',
    'Seek Truth Above All',
    'Question everything. Even this.',
    {
      researchSpeed: 0.3,
      schismRisk: 0.1,
    },
  ),
  makeCommandment(
    'sacred_knowledge',
    'knowledge',
    'Sacred Knowledge',
    'Wisdom is a flame to be guarded, not scattered.',
    {
      researchSpeed: 0.15,
      conversionRate: -0.1,
    },
  ),
  makeCommandment(
    'forbidden_knowledge',
    'knowledge',
    'Forbidden Knowledge',
    'Some doors are sealed for your protection.',
    {
      stability: 0.15,
      schismRisk: -0.1,
      researchSpeed: -0.2,
    },
  ),
  makeCommandment(
    'teach_every_child',
    'knowledge',
    'Teach Every Child',
    'An unschooled child is a prayer unanswered.',
    {
      researchSpeed: 0.2,
      populationGrowth: 0.1,
      militaryStrength: -0.1,
    },
  ),
  makeCommandment(
    'learn_from_all',
    'knowledge',
    'Learn from All',
    'Even the heathen teaches, if you listen.',
    {
      researchSpeed: 0.15,
      tradeBonus: 0.1,
    },
  ),

  // SOCIETY (5)
  makeCommandment(
    'share_all_wealth',
    'society',
    'Share All Wealth',
    'What you hoard, you worship. And there is only one god here.',
    {
      happiness: 0.25,
      economicOutput: -0.1,
    },
  ),
  makeCommandment(
    'reward_the_strong',
    'society',
    'Reward the Strong',
    'Excellence is its own prayer.',
    {
      economicOutput: 0.15,
      happiness: -0.1,
    },
  ),
  makeCommandment(
    'honor_elders',
    'society',
    'Honor the Elders',
    'The old tree\'s roots hold the young forest.',
    {
      stability: 0.2,
      researchSpeed: -0.15,
    },
  ),
  makeCommandment(
    'celebrate_life',
    'society',
    'Celebrate Life',
    'Every birth is a hymn. Every feast, a sermon.',
    {
      populationGrowth: 0.2,
      happiness: 0.1,
      militaryMorale: -0.1,
    },
  ),
  makeCommandment(
    'discipline_above_all',
    'society',
    'Discipline Above All',
    'Order is the architecture of divinity.',
    {
      productivityBonus: 0.2,
      happiness: -0.15,
    },
  ),

  // DIVINE (5)
  makeCommandment(
    'sacrifices_please_god',
    'divine',
    'Sacrifices Please God',
    'Give unto the fire, and the fire gives back.',
    {
      divineEnergyRegenMod: 0.3,
    },
  ),
  makeCommandment(
    'help_themselves',
    'divine',
    'God Helps Those Who Help Themselves',
    'I made you capable. Use it.',
    {
      divineEnergyCostMod: -0.15,
      miracleEffectiveness: -0.1,
    },
  ),
  makeCommandment(
    'signs_and_wonders',
    'divine',
    'Signs and Wonders',
    'Let the sky crack open. Let them remember who I am.',
    {
      miracleEffectiveness: 0.3,
    },
  ),
  makeCommandment(
    'god_is_silent',
    'divine',
    'God is Silent',
    'I speak in harvests, in rain, in the absence of plague. Listen harder.',
    {
      divineEnergyCostMod: -0.2,
      stability: 0.1,
    },
  ),
  makeCommandment(
    'fear_gods_wrath',
    'divine',
    "Fear God's Wrath",
    'I am kind. Do not test how kind.',
    {
      stability: 0.15,
      militaryMorale: 0.1,
    },
  ),

  // NATURE (5)
  makeCommandment(
    'earth_is_sacred',
    'nature',
    'The Earth is Sacred',
    'The dirt beneath your feet is my skin. Tread carefully.',
    {
      disasterResistance: 0.5,
      industrialOutput: -0.1,
    },
  ),
  makeCommandment(
    'dominion_over_nature',
    'nature',
    'Dominion Over Nature',
    'I gave you the world. I did not say to leave it as you found it.',
    {
      economicOutput: 0.15,
      disasterResistance: -0.15,
    },
  ),
  makeCommandment(
    'harmony_with_seasons',
    'nature',
    'Harmony with Seasons',
    'Plant with the rain. Harvest with the sun. Wait with the winter.',
    {
      stability: 0.1,
      divineEnergyCostMod: -0.1,
    },
  ),
  makeCommandment(
    'build_great_works',
    'nature',
    'Build Great Works',
    'Let your towers reach toward me. I enjoy the view.',
    {
      constructionSpeed: 0.2,
      missionaryEffectiveness: 0.1,
    },
  ),
  makeCommandment(
    'wander_and_explore',
    'nature',
    'Wander and Explore',
    'Stay in one place and you worship the ground. Move, and you worship the horizon.',
    {
      explorationSpeed: 0.25,
      tradeBonus: 0.15,
      defenseBonus: -0.15,
    },
  ),

  // MORALITY (5)
  makeCommandment(
    'all_life_sacred',
    'morality',
    'All Life is Sacred',
    'Every heartbeat is a note in my symphony. Silence none.',
    {
      diplomacyBonus: 0.25,
      canUsePlague: false,
      canUseFamine: false,
    },
  ),
  makeCommandment(
    'justice_absolute',
    'morality',
    'Justice is Absolute',
    'The law bends for no one. Not even me.',
    {
      stability: 0.25,
      happiness: -0.1,
    },
  ),
  makeCommandment(
    'forgive_and_redeem',
    'morality',
    'Forgive and Redeem',
    'The enemy of today is the convert of tomorrow.',
    {
      integrationSpeed: 0.3,
      conversionRetention: 0.15,
    },
  ),
  makeCommandment(
    'ends_justify_means',
    'morality',
    'The Ends Justify the Means',
    'History remembers the victors. I remember everything.',
    {
      hypocrisyDisabled: true,
      faithDecayPerTick: 0.001,
    },
  ),
  makeCommandment(
    'charity_above_all',
    'morality',
    'Charity Above All',
    'Give until it hurts. Then give because it hurts.',
    {
      diplomacyBonus: 0.2,
      economicOutput: -0.15,
    },
  ),
];

// Unlockable commandments — 15 total
export const UNLOCKABLE_COMMANDMENTS: Commandment[] = [
  // EXPANSION unlocks (2)
  makeCommandment(
    'hidden_faith',
    'expansion',
    'The Hidden Faith',
    'Faith needs no temple. It thrives in whispers.',
    {
      conversionRate: 0.3,
      missionaryEffectiveness: -0.2,
    },
    [],
    { type: 'win_pure_peace' },
  ),
  makeCommandment(
    'cultural_hegemony',
    'expansion',
    'Cultural Hegemony',
    'Let them sing our songs before they learn our prayers.',
    {
      tradeBonus: 0.25,
      happiness: 0.1,
    },
    [],
    { type: 'survive_past_year', year: 1900 },
  ),

  // CONFLICT unlocks (2)
  makeCommandment(
    'mercenary_blessing',
    'conflict',
    'Mercenary Blessing',
    'Gold buys swords. Swords buy time. Time buys salvation.',
    {
      militaryStrength: 0.2,
      economicOutput: -0.1,
    },
    [],
    { type: 'win' },
  ),
  makeCommandment(
    'asymmetric_warfare',
    'conflict',
    'Asymmetric Warfare',
    'The mountain does not charge. It simply does not move.',
    {
      defenseBonus: 0.3,
      attackBonus: -0.15,
    },
    [],
    { type: 'lose_count', count: 3 },
  ),

  // KNOWLEDGE unlocks (2)
  makeCommandment(
    'steal_the_fire',
    'knowledge',
    'Steal the Fire',
    'Knowledge hoarded is knowledge begging to be taken.',
    {
      researchSpeed: 0.2,
      tradeBonus: 0.1,
      diplomacyBonus: -0.1,
    },
    [],
    { type: 'visit_earths', count: 10 },
  ),
  makeCommandment(
    'dangerous_experiments',
    'knowledge',
    'Dangerous Experiments',
    'God favors the bold. God also favors the fireproof.',
    {
      researchSpeed: 0.4,
      disasterResistance: -0.15,
      faithDecayPerTick: 0.0,
    },
    [],
    { type: 'survive_past_year', year: 1900 },
  ),

  // SOCIETY unlocks (2)
  makeCommandment(
    'caste_system',
    'society',
    'Caste System',
    'Each soul has its station. To question it is to question the divine plan.',
    {
      economicOutput: 0.25,
      stability: 0.15,
      happiness: -0.2,
    },
    [],
    { type: 'win_pure_war' },
  ),
  makeCommandment(
    'nomadic_tradition',
    'society',
    'Nomadic Tradition',
    'The earth is a gift, not a prison. Walk it.',
    {
      explorationSpeed: 0.3,
      tradeBonus: 0.2,
      defenseBonus: -0.25,
      constructionSpeed: -0.15,
    },
    [],
    { type: 'visit_earths', count: 10 },
  ),

  // DIVINE unlocks (3)
  makeCommandment(
    'divine_economy',
    'divine',
    'Divine Economy',
    'Commerce is communion. Every trade route is a prayer line.',
    {
      divineEnergyRegenMod: 0.15,
      tradeBonus: 0.1,
      miracleEffectiveness: -0.15,
    },
    [],
    { type: 'win' },
  ),
  makeCommandment(
    'prophet_lineage',
    'divine',
    'Prophet Lineage',
    'My voice passes from parent to child. The bloodline is the doctrine.',
    { missionaryEffectiveness: 0.15, conversionRetention: 0.10 },
    [],
    { type: 'survive_past_year', year: 1900 },
  ),
  makeCommandment(
    'echoes_of_creation',
    'divine',
    'Echoes of Creation',
    'My touch is not a pin. It is a wave.',
    { miracleEffectiveness: 0.20, divineEnergyRegenMod: 0.10 },
    [],
    { type: 'win' },
  ),

  // NATURE unlocks (2)
  makeCommandment(
    'weather_mastery',
    'nature',
    'Weather Mastery',
    'The storm is my instrument. I choose when it plays.',
    {
      disasterResistance: 0.7,
      divineEnergyRegenMod: -0.15,
    },
    [],
    { type: 'win_pure_peace' },
  ),
  makeCommandment(
    'industrial_zeal',
    'nature',
    'Industrial Zeal',
    'Smoke rises like prayer. Build more chimneys.',
    {
      economicOutput: 0.35,
      researchSpeed: 0.2,
      disasterResistance: -0.25,
    },
    [],
    { type: 'visit_earths', count: 10 },
  ),

  // MORALITY unlocks (2)
  makeCommandment(
    'holy_martyrdom',
    'morality',
    'Holy Martyrdom',
    'The blood of the faithful is the seed of the church.',
    {
      conversionRate: 0.2,
      diplomacyBonus: 0.15,
      populationGrowth: -0.1,
    },
    [],
    { type: 'lose_count', count: 3 },
  ),
  makeCommandment(
    'zealotry',
    'morality',
    'Zealotry',
    'Half-faith is no faith. Burn with it or burn from it.',
    {
      missionaryEffectiveness: 0.4,
      militaryMorale: 0.25,
      diplomacyBonus: -0.3,
      schismRisk: 0.2,
    },
    [],
    { type: 'win_pure_war' },
  ),
];

export const ALL_COMMANDMENTS: Commandment[] = [...BASE_COMMANDMENTS, ...UNLOCKABLE_COMMANDMENTS];

// Tension pairs — ensure bidirectional links
const TENSION_PAIRS: [CommandmentId, CommandmentId][] = [
  // Base pairs
  ['turn_other_cheek', 'smite_the_wicked'],
  ['share_all_wealth', 'reward_the_strong'],
  ['seek_truth', 'sacred_knowledge'],
  ['all_life_sacred', 'ends_justify_means'],
  ['god_is_silent', 'signs_and_wonders'],
  ['earth_is_sacred', 'dominion_over_nature'],
  // Unlockable pairs
  ['hidden_faith', 'preach_to_all_lands'],
  ['mercenary_blessing', 'share_all_wealth'],
  ['steal_the_fire', 'sacred_knowledge'],
  ['caste_system', 'share_all_wealth'],
  ['nomadic_tradition', 'sacred_borders'],
  ['industrial_zeal', 'earth_is_sacred'],
  ['holy_martyrdom', 'all_life_sacred'],
  ['zealotry', 'diplomatic_union'],
];

const commandmentById = new Map<CommandmentId, Commandment>();
for (const cmd of ALL_COMMANDMENTS) {
  commandmentById.set(cmd.id, cmd);
}

for (const [a, b] of TENSION_PAIRS) {
  const ca = commandmentById.get(a);
  const cb = commandmentById.get(b);
  if (ca && !ca.tensionsWith.includes(b)) {
    ca.tensionsWith.push(b);
  }
  if (cb && !cb.tensionsWith.includes(a)) {
    cb.tensionsWith.push(a);
  }
}

export function getCommandmentById(id: CommandmentId): Commandment | undefined {
  return commandmentById.get(id);
}

