// =============================================================================
// DIVINE DOMINION — FAB + Radial Power Menu (Task 3.4)
// Base FAB class (Phaser GameObjects.Container) + pure context logic.
// Session 8 extends this via createPowerSlot override + setDualArcLayout().
// =============================================================================

import type { DivinePower, PowerId, GameState, EraId } from '../types/game.js';
import { POWER_UNLOCK, FAB_CONTEXT, UI } from '../config/constants.js';
import { eraIndex } from '../renderer/era-utils.js';

// ---------------------------------------------------------------------------
// FAB configuration (injected by GameScene)
// ---------------------------------------------------------------------------

export interface FABConfig {
  powers: DivinePower[];
  onPowerSelect: (id: PowerId) => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Power unlock — which powers are available given current era
// ---------------------------------------------------------------------------

export function getUnlockedPowerIds(currentEra: EraId): PowerId[] {
  const idx = eraIndex(currentEra);
  const result: PowerId[] = [];
  if (idx >= 0) result.push(...POWER_UNLOCK.ERA_1);
  if (idx >= 1) result.push(...POWER_UNLOCK.ERA_2);
  if (idx >= 2) result.push(...POWER_UNLOCK.ERA_3);
  if (idx >= 3) result.push(...POWER_UNLOCK.ERA_4);
  if (idx >= 4) result.push(...POWER_UNLOCK.ERA_5);
  if (idx >= 5) result.push(...POWER_UNLOCK.ERA_6);
  return result;
}

export function getUnlockedPowers(allPowers: DivinePower[], currentEra: EraId): DivinePower[] {
  const unlocked = new Set(getUnlockedPowerIds(currentEra));
  return allPowers.filter(p => unlocked.has(p.id));
}

// ---------------------------------------------------------------------------
// Smart context selection — which powers to show in the arc
// ---------------------------------------------------------------------------

export interface ContextSlot {
  power: DivinePower;
  reason: 'cheapest_blessing' | 'cheapest_disaster' | 'context_war' | 'context_science'
        | 'context_faith' | 'combo_eligible' | 'extra';
}

export function selectContextPowers(
  state: GameState,
  unlockedPowers: DivinePower[],
): ContextSlot[] {
  const slots: ContextSlot[] = [];
  const blessings = unlockedPowers.filter(p => p.type === 'blessing');
  const disasters = unlockedPowers.filter(p => p.type === 'disaster');

  const cheapestBlessing = blessings.slice().sort((a, b) => a.cost - b.cost)[0];
  const cheapestDisaster = disasters.slice().sort((a, b) => a.cost - b.cost)[0];
  const used = new Set<PowerId>();

  if (cheapestBlessing) {
    slots.push({ power: cheapestBlessing, reason: 'cheapest_blessing' });
    used.add(cheapestBlessing.id);
  }
  if (cheapestDisaster) {
    slots.push({ power: cheapestDisaster, reason: 'cheapest_disaster' });
    used.add(cheapestDisaster.id);
  }

  if (slots.length < FAB_CONTEXT.MAX_CONTEXT_SLOTS) {
    const contextPower = pickContextPower(state, unlockedPowers, used);
    if (contextPower) {
      slots.push(contextPower);
      used.add(contextPower.power.id);
    }
  }

  return slots;
}

function pickContextPower(
  state: GameState,
  powers: DivinePower[],
  exclude: Set<PowerId>,
): ContextSlot | null {
  const available = powers.filter(p => !exclude.has(p.id));
  if (available.length === 0) return null;

  // Check for active wars → prefer Shield of Faith (blessing) or Great Storm (disaster)
  const anyAtWar = hasActiveWar(state);
  if (anyAtWar) {
    const shield = available.find(p => p.id === 'shield_of_faith');
    if (shield) return { power: shield, reason: 'context_war' };
    const storm = available.find(p => p.id === 'great_storm');
    if (storm) return { power: storm, reason: 'context_war' };
  }

  // Science opportunity → Inspiration
  const inspiration = available.find(p => p.id === 'inspiration');
  if (inspiration) return { power: inspiration, reason: 'context_science' };

  // Low faith → Miracle
  const miracle = available.find(p => p.id === 'miracle');
  if (miracle) return { power: miracle, reason: 'context_faith' };

  return null;
}

function hasActiveWar(state: GameState): boolean {
  for (const nation of state.world.nations.values()) {
    for (const rel of nation.relations.values()) {
      if (rel.atWar) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Arc geometry helpers
// ---------------------------------------------------------------------------

export interface ArcButton {
  power: DivinePower;
  slot: ContextSlot;
  angleDeg: number; // from center of FAB
  x: number;        // pixel offset from FAB center
  y: number;
  isOnCooldown: boolean;
  cooldownRemaining: number; // seconds
  hasInsufficientEnergy: boolean;
  hasComboHint: boolean;
}

export interface ArcLayout {
  blessingButtons: ArcButton[];
  disasterButtons: ArcButton[];
  eyePosition: { x: number; y: number };
  showExpander: boolean;
}

const ARC_RADIUS_PT = 130;
/** Blessings span 60°–150° (upper-left). Apex = 90° (straight up). Disasters span 30°–120° (upper-right).
 *  Phaser canvas: y increases downward, so "up" = negative y offset = angle measured from positive x, CCW.
 *  We use standard math angles: 90° = up.
 */

export function computeArcLayout(
  slots: ContextSlot[],
  state: GameState,
  leftHandMode: boolean,
  showExpander: boolean,
): ArcLayout {
  const blessingSlots = slots.filter(s => s.power.type === 'blessing');
  const disasterSlots = slots.filter(s => s.power.type === 'disaster');

  const blessingButtons = layoutArc(blessingSlots, state, leftHandMode, 'blessing');
  const disasterButtons = layoutArc(disasterSlots, state, leftHandMode, 'disaster');

  // Eye at 90° (12 o'clock) = (0, -ARC_RADIUS_PT)
  const eyePosition = { x: 0, y: -ARC_RADIUS_PT };

  return { blessingButtons, disasterButtons, eyePosition, showExpander };
}

function layoutArc(
  slots: ContextSlot[],
  state: GameState,
  leftHandMode: boolean,
  type: 'blessing' | 'disaster',
): ArcButton[] {
  if (slots.length === 0) return [];

  // Blessings: upper-left quadrant (angles 90°–150° from right). In standard coords: 120°–150°.
  // Disasters: upper-right quadrant. In standard coords: 30°–60°.
  // (Eye sits at 90°.)
  // For simplicity: blessings spread from 105° to 165°, disasters from 15° to 75°.
  let startAngle: number;
  let endAngle: number;
  if (type === 'blessing') {
    startAngle = leftHandMode ? 15 : 105;
    endAngle   = leftHandMode ? 75 : 165;
  } else {
    startAngle = leftHandMode ? 105 : 15;
    endAngle   = leftHandMode ? 165 : 75;
  }

  const step = slots.length <= 1 ? 0 : (endAngle - startAngle) / (slots.length - 1);

  return slots.map((slot, i) => {
    const angleDeg = startAngle + i * step;
    const rad = (angleDeg * Math.PI) / 180;
    const x = ARC_RADIUS_PT * Math.cos(rad);
    const y = -ARC_RADIUS_PT * Math.sin(rad); // negative = up in screen coords

    const cooldownRemaining = state.divineState.cooldowns.get(slot.power.id) ?? 0;
    const isOnCooldown = cooldownRemaining > 0;
    const hasInsufficientEnergy = state.divineState.energy < slot.power.cost;
    const hasComboHint = false; // Session 8 populates this

    return {
      power: slot.power,
      slot,
      angleDeg,
      x,
      y,
      isOnCooldown,
      cooldownRemaining,
      hasInsufficientEnergy,
      hasComboHint,
    };
  });
}

// ---------------------------------------------------------------------------
// FAB state machine
// ---------------------------------------------------------------------------

export type FabState = 'closed' | 'opening' | 'open' | 'closing' | 'targeting';

export interface FabMenuState {
  state: FabState;
  overlayActive: boolean;
  targetingPowerId: PowerId | null;
}

export function createFabMenuState(): FabMenuState {
  return { state: 'closed', overlayActive: false, targetingPowerId: null };
}

export function fabOpen(s: FabMenuState): FabMenuState {
  if (s.state === 'closed') return { ...s, state: 'opening' };
  return s;
}

export function fabOpenComplete(s: FabMenuState): FabMenuState {
  if (s.state === 'opening') return { ...s, state: 'open' };
  return s;
}

export function fabClose(s: FabMenuState): FabMenuState {
  if (s.state === 'open' || s.state === 'opening') return { ...s, state: 'closing' };
  return s;
}

export function fabCloseComplete(s: FabMenuState): FabMenuState {
  if (s.state === 'closing') return { ...s, state: 'closed' };
  return s;
}

export function fabSelectPower(s: FabMenuState, powerId: PowerId): FabMenuState {
  return { ...s, state: 'targeting', targetingPowerId: powerId };
}

export function fabCancelTargeting(s: FabMenuState): FabMenuState {
  return { ...s, state: 'closed', targetingPowerId: null };
}

export function fabCastComplete(s: FabMenuState): FabMenuState {
  return { ...s, state: 'closed', targetingPowerId: null };
}

export function isOpen(s: FabMenuState): boolean {
  return s.state === 'open' || s.state === 'opening';
}

// ---------------------------------------------------------------------------
// Targeting mode helpers
// ---------------------------------------------------------------------------

export function getTargetingBannerText(power: DivinePower): string {
  return `${power.name} — tap a region to cast`;
}

export function powerHapticType(power: DivinePower): 'light' | 'medium' | 'heavy' | 'error' {
  if (power.type === 'disaster') return 'heavy';
  return 'medium';
}

// ---------------------------------------------------------------------------
// FABMenu class stub (Phaser-dependent — not instantiated in tests)
// ---------------------------------------------------------------------------

/**
 * FABMenu extends Phaser.GameObjects.Container.
 * Session 7: base single-arc layout with blessing and disaster buttons.
 * Session 8: override createPowerSlot() and call setDualArcLayout() for dual-arc.
 *
 * Not imported in Node test environment — Phaser requires WebGL.
 * All logic lives in the pure helpers above; this class is a thin wrapper.
 */
export class FABMenu {
  protected config: FABConfig;
  protected _state: FabMenuState;

  constructor(config: FABConfig) {
    this.config = config;
    this._state = createFabMenuState();
  }

  open(): void {
    this._state = fabOpen(this._state);
  }

  close(): void {
    this._state = fabClose(this._state);
  }

  isOpen(): boolean {
    return isOpen(this._state);
  }

  /** Override in Session 8 to customize per-slot rendering. */
  createPowerSlot(_power: DivinePower): object {
    return {};
  }

  getState(): FabMenuState {
    return this._state;
  }
}
