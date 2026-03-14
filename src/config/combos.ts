import type { PowerCombo, PowerComboId } from '../types/game.js';

export const ALL_COMBOS: PowerCombo[] = [
  {
    id: 'quake_scatter',
    name: 'Quake Scatter',
    triggerPowers: ['earthquake'],
    condition: 'Earthquake cast on a region containing armies.',
    effect: 'Armies in the region lose strength and partially defect to nearby nations.',
  },
  {
    id: 'storm_fleet',
    name: 'Storm Fleet',
    triggerPowers: ['great_storm'],
    condition: 'Great Storm cast on a region with at least one naval trade route.',
    effect: 'Naval trade routes are disrupted for twice the normal duration.',
  },
  {
    id: 'flood_famine',
    name: 'Flood Famine',
    triggerPowers: ['great_flood', 'famine'],
    condition: 'Great Flood cast on a region already experiencing low food or famine.',
    effect: 'Automatically triggers Famine and doubles population loss from the Flood.',
  },
  {
    id: 'plague_trade',
    name: 'Plague Trade',
    triggerPowers: ['plague'],
    condition: 'Plague cast on a region with active trade routes.',
    effect: 'Disease spreads along all connected trade routes to linked regions.',
  },
  {
    id: 'harvest_golden',
    name: 'Harvest Golden',
    triggerPowers: ['bountiful_harvest', 'golden_age'],
    condition: 'Bountiful Harvest cast on a region with Development 6 or higher.',
    effect: 'Triggers a free mini Golden Age effect for three game-years.',
  },
  {
    id: 'inspire_prophet',
    name: 'Inspire Prophet',
    triggerPowers: ['inspiration', 'prophet'],
    condition: 'Inspiration cast on a region currently hosting a Prophet.',
    effect: 'Doubles the Prophet’s conversion effectiveness for one tick.',
  },
  {
    id: 'shield_miracle',
    name: 'Shield Fortress',
    triggerPowers: ['shield_of_faith', 'miracle'],
    condition: 'Shield of Faith followed by Miracle on the same region within 120 seconds.',
    effect: 'Creates a Divine Fortress: 1.5× defense and conversion in the region.',
  },
  {
    id: 'wildfire_rebirth',
    name: 'Wildfire Rebirth',
    triggerPowers: ['wildfire'],
    condition: 'Wildfire cast on a region with Development 3 or higher.',
    effect: 'After destruction, the region rebuilds with +1 Development.',
  },
  {
    id: 'divine_purge',
    name: 'Divine Purge',
    triggerPowers: ['shield_of_faith', 'miracle'],
    condition: 'Shield of Faith and Miracle chained on a Harbinger-corrupted region.',
    effect: 'Removes Harbinger corruption and grants immunity to it for one era.',
  },
];

const comboById = new Map<PowerComboId, PowerCombo>();
for (const combo of ALL_COMBOS) {
  comboById.set(combo.id, combo);
}

export function getComboById(id: PowerComboId): PowerCombo | undefined {
  return comboById.get(id);
}

