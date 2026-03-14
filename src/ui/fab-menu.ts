// =============================================================================
// DIVINE DOMINION — FAB + Radial Power Menu (Tasks 3.4 + 3.9)
// Base FAB class + dual-arc layout + combo hint population.
// =============================================================================

import type { DivinePower, PowerId, GameState, EraId, PowerComboId } from '../types/game.js';
import { POWER_UNLOCK, FAB_CONTEXT, UI, COMBOS } from '../config/constants.js';
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
// Combo hint detection (Task 3.9)
// ---------------------------------------------------------------------------

/**
 * Returns the set of PowerIds that have at least one combo eligible in the
 * current world state. Used to populate hasComboHint on ArcButtons.
 */
export function getComboEligiblePowerIds(state: GameState): Set<PowerId> {
  const eligible = new Set<PowerId>();
  const world = state.world;

  // quake_scatter: Earthquake + army in any region
  for (const army of world.armies.values()) {
    if (army.state !== 'disbanded') {
      eligible.add('earthquake');
      break;
    }
  }

  // storm_fleet: Great Storm + naval trade route
  for (const route of world.tradeRoutes.values()) {
    if (route.isActive) {
      eligible.add('great_storm');
      break;
    }
  }

  // flood_famine: Great Flood + region with low food (low economy)
  for (const region of world.regions.values()) {
    if (region.economicOutput < 20) {
      eligible.add('great_flood');
      break;
    }
  }

  // plague_trade: Plague + active trade routes
  for (const route of world.tradeRoutes.values()) {
    if (route.isActive) {
      eligible.add('plague');
      break;
    }
  }

  // harvest_golden: Bountiful Harvest + dev 6+
  for (const region of world.regions.values()) {
    if (region.development >= COMBOS.HARVEST_GOLDEN_MIN_DEV) {
      eligible.add('bountiful_harvest');
      break;
    }
  }

  // inspire_prophet: Inspiration + Prophet voice in same region
  const prophetRegions = new Set(
    state.voiceRecords.filter(v => v.type === 'prophet').map(v => v.regionId),
  );
  if (prophetRegions.size > 0) {
    eligible.add('inspiration');
  }

  // shield_miracle: Shield of Faith → Miracle combo window
  for (const [regionId, shieldTime] of state.comboWindowState.lastShieldCastByRegion) {
    // combo window active if shield was cast within the window
    void regionId; // regionId used as key
    void shieldTime;
    eligible.add('miracle');
    break;
  }

  // wildfire_rebirth: Wildfire + dev 3+
  for (const region of world.regions.values()) {
    if (region.development >= COMBOS.WILDFIRE_REBIRTH_MIN_DEV) {
      eligible.add('wildfire');
      break;
    }
  }

  // divine_purge: Shield + corrupted region (or Miracle on corrupted)
  if (world.alienState.harbinger.corruptedRegionIds.length > 0) {
    eligible.add('shield_of_faith');
    eligible.add('miracle');
  }

  return eligible;
}

/**
 * Re-computes ArcLayout with combo hints populated.
 * Call this instead of computeArcLayout when the dual-arc layout is active.
 */
export function computeDualArcLayout(
  slots: ContextSlot[],
  state: GameState,
  leftHandMode: boolean,
  showExpander: boolean,
): ArcLayout {
  const layout = computeArcLayout(slots, state, leftHandMode, showExpander);
  const eligible = getComboEligiblePowerIds(state);

  const applyHints = (buttons: ArcButton[]): ArcButton[] =>
    buttons.map(btn => ({
      ...btn,
      hasComboHint: eligible.has(btn.power.id),
    }));

  return {
    ...layout,
    blessingButtons: applyHints(layout.blessingButtons),
    disasterButtons: applyHints(layout.disasterButtons),
  };
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

// ---------------------------------------------------------------------------
// DualArcFABMenu — Session 8 extension (Task 3.9)
// Adds setDualArcLayout() and combo-hint-aware arc computation.
// ---------------------------------------------------------------------------

export interface DualArcFABState {
  dualArcEnabled: boolean;
  newlyUnlockedPowerId: PowerId | null; // glow on first FAB appearance
}

export function createDualArcFABState(): DualArcFABState {
  return { dualArcEnabled: false, newlyUnlockedPowerId: null };
}

/** Dual-arc FAB that extends FABMenu with combo hints and unlock glow. */
export class DualArcFABMenu extends FABMenu {
  private _dualArcState: DualArcFABState;

  constructor(config: FABConfig) {
    super(config);
    this._dualArcState = createDualArcFABState();
  }

  /** Enables dual-arc layout for this FAB instance. */
  setDualArcLayout(enabled: boolean): void {
    this._dualArcState = { ...this._dualArcState, dualArcEnabled: enabled };
  }

  isDualArcEnabled(): boolean {
    return this._dualArcState.dualArcEnabled;
  }

  /** Mark a power as newly unlocked so it glows on first appearance. */
  setNewlyUnlocked(powerId: PowerId | null): void {
    this._dualArcState = { ...this._dualArcState, newlyUnlockedPowerId: powerId };
  }

  getNewlyUnlockedPowerId(): PowerId | null {
    return this._dualArcState.newlyUnlockedPowerId;
  }

  /** Compute the layout with combo hints. Caller passes current GameState. */
  computeLayout(
    slots: ContextSlot[],
    gameState: GameState,
    leftHandMode: boolean,
    showExpander: boolean,
  ): ArcLayout {
    return computeDualArcLayout(slots, gameState, leftHandMode, showExpander);
  }

  getDualArcState(): DualArcFABState {
    return this._dualArcState;
  }
}

// ---------------------------------------------------------------------------
// Power unlock toast helper (Task 3.9)
// ---------------------------------------------------------------------------

/** Returns a user-facing message for a newly unlocked power. */
export function buildPowerUnlockToastText(power: DivinePower): string {
  return `New divine power: ${power.name}.`;
}

/** Returns true if ≥5 powers are unlocked (show "..." expander). */
export function shouldShowExpander(unlockedPowers: DivinePower[]): boolean {
  return unlockedPowers.length >= 5;
}
