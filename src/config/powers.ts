import type { DivinePower, PowerId } from '../types/game.js';
import { BLESSINGS, DISASTERS } from './constants.js';

const BLESSING_DEFS: DivinePower[] = [
  {
    id: 'bountiful_harvest',
    name: 'Bountiful Harvest',
    type: 'blessing',
    cost: BLESSINGS.BOUNTIFUL_HARVEST.cost,
    cooldownMinutes: BLESSINGS.BOUNTIFUL_HARVEST.cooldownMinutes,
    durationGameYears: BLESSINGS.BOUNTIFUL_HARVEST.durationYears,
    description: 'Boosts food, happiness, and population growth in the target region.',
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    type: 'blessing',
    cost: BLESSINGS.INSPIRATION.cost,
    cooldownMinutes: BLESSINGS.INSPIRATION.cooldownMinutes,
    durationGameYears: BLESSINGS.INSPIRATION.durationYears,
    description: 'Greatly increases research output and development growth in the region.',
  },
  {
    id: 'miracle',
    name: 'Miracle',
    type: 'blessing',
    cost: BLESSINGS.MIRACLE.cost,
    cooldownMinutes: BLESSINGS.MIRACLE.cooldownMinutes,
    durationGameYears: BLESSINGS.MIRACLE.durationYears,
    description: 'Triggers a dramatic surge in faith and mass conversion to your religion.',
  },
  {
    id: 'prophet',
    name: 'Prophet',
    type: 'blessing',
    cost: BLESSINGS.PROPHET.cost,
    cooldownMinutes: BLESSINGS.PROPHET.cooldownMinutes,
    durationGameYears: BLESSINGS.PROPHET.durationYears,
    description: 'Creates a powerful Follower Voice who spreads your faith over time.',
  },
  {
    id: 'shield_of_faith',
    name: 'Shield of Faith',
    type: 'blessing',
    cost: BLESSINGS.SHIELD_OF_FAITH.cost,
    cooldownMinutes: BLESSINGS.SHIELD_OF_FAITH.cooldownMinutes,
    durationGameYears: BLESSINGS.SHIELD_OF_FAITH.durationYears,
    description: 'Greatly increases defense for the region and blocks Harbinger actions.',
  },
  {
    id: 'golden_age',
    name: 'Golden Age',
    type: 'blessing',
    cost: BLESSINGS.GOLDEN_AGE.cost,
    cooldownMinutes: BLESSINGS.GOLDEN_AGE.cooldownMinutes,
    durationGameYears: BLESSINGS.GOLDEN_AGE.durationYears,
    description: 'Massively boosts economy, research, happiness, and defense for a period.',
  },
];

const DISASTER_DEFS: DivinePower[] = [
  {
    id: 'earthquake',
    name: 'Earthquake',
    type: 'disaster',
    cost: DISASTERS.EARTHQUAKE.cost,
    cooldownMinutes: DISASTERS.EARTHQUAKE.cooldownMinutes,
    durationGameYears: DISASTERS.EARTHQUAKE.durationYears,
    description: 'Devastates infrastructure and development in the target region.',
  },
  {
    id: 'great_flood',
    name: 'Great Flood',
    type: 'disaster',
    cost: DISASTERS.GREAT_FLOOD.cost,
    cooldownMinutes: DISASTERS.GREAT_FLOOD.cooldownMinutes,
    durationGameYears: DISASTERS.GREAT_FLOOD.durationYears,
    description: 'Damages cities, reduces population, and disrupts trade in the region.',
  },
  {
    id: 'plague',
    name: 'Plague',
    type: 'disaster',
    cost: DISASTERS.PLAGUE.cost,
    cooldownMinutes: DISASTERS.PLAGUE.cooldownMinutes,
    durationGameYears: DISASTERS.PLAGUE.durationYears,
    description: 'Introduces a powerful disease that can spread beyond the target region.',
  },
  {
    id: 'great_storm',
    name: 'Great Storm',
    type: 'disaster',
    cost: DISASTERS.GREAT_STORM.cost,
    cooldownMinutes: DISASTERS.GREAT_STORM.cooldownMinutes,
    durationGameYears: DISASTERS.GREAT_STORM.durationYears,
    description: 'Disrupts trade routes and hampers army movement in and around the region.',
  },
  {
    id: 'famine',
    name: 'Famine',
    type: 'disaster',
    cost: DISASTERS.FAMINE.cost,
    cooldownMinutes: DISASTERS.FAMINE.cooldownMinutes,
    durationGameYears: DISASTERS.FAMINE.durationYears,
    description: 'Cripples food production, causing unrest, population loss, and military strain.',
  },
  {
    id: 'wildfire',
    name: 'Wildfire',
    type: 'disaster',
    cost: DISASTERS.WILDFIRE.cost,
    cooldownMinutes: DISASTERS.WILDFIRE.cooldownMinutes,
    durationGameYears: DISASTERS.WILDFIRE.durationYears,
    description: 'Burns forests and cities; at higher Dev it can trigger a rebirth combo.',
  },
];

export const ALL_POWERS: DivinePower[] = [...BLESSING_DEFS, ...DISASTER_DEFS];

const powerById = new Map<PowerId, DivinePower>();
for (const power of ALL_POWERS) {
  powerById.set(power.id, power);
}

export function getPowerById(id: PowerId): DivinePower | undefined {
  return powerById.get(id);
}

