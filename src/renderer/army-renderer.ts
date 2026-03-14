// =============================================================================
// DIVINE DOMINION — Army Renderer (Task 2.3)
// Banner tokens, marching paths, battle animations.
// art-spec.md §6 (Army Banner Spec), §UI Living Map — Armies
// =============================================================================

import Phaser from 'phaser';
import type { WorldState, Army, ArmyState } from '../types/game.js';
import { COLORS } from './palettes.js';
import { computeCentroid } from './map-utils.js';
import { formatTroopCount } from './army-utils.js';

export { formatTroopCount };

// -----------------------------------------------------------------------------
// Banner Spec (art-spec.md §6)
// -----------------------------------------------------------------------------
const BANNER_W = 22;
const BANNER_H = 16;
const BANNER_NOTCH = 5;       // V-notch depth at bottom
const BANNER_TWEEN_MS = 400;  // movement tween per tile

// -----------------------------------------------------------------------------
// ArmyRenderer — Phaser 3 Scene
// -----------------------------------------------------------------------------

export interface ArmyRendererConfig {
  worldState: WorldState;
}

export class ArmyRenderer extends Phaser.Scene {
  private worldState!: WorldState;
  private armyLayer!: Phaser.GameObjects.Container;
  private pathLayer!: Phaser.GameObjects.Container;

  // Map of armyId → { banner, label }
  private banners: Map<string, { gfx: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text }> = new Map();

  constructor() {
    super({ key: 'ArmyRenderer' });
  }

  init(data: ArmyRendererConfig) {
    this.worldState = data.worldState;
  }

  create() {
    this.pathLayer  = this.add.container(0, 0);
    this.armyLayer  = this.add.container(0, 0);
    this._renderAll();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Full re-render. Call when world state changes (tick update). */
  refresh(newWorldState: WorldState) {
    this.worldState = newWorldState;
    this._renderAll();
  }

  /** Animate an army moving from one region to another. */
  animateMove(armyId: string, fromRegionId: string, toRegionId: string) {
    const fromRegion = this.worldState.regions.get(fromRegionId);
    const toRegion   = this.worldState.regions.get(toRegionId);
    const banner     = this.banners.get(armyId);
    if (!fromRegion || !toRegion || !banner) return;

    const from = computeCentroid(fromRegion.vertices);
    const to   = computeCentroid(toRegion.vertices);

    this._drawPath(from, to);

    this.tweens.add({
      targets: [banner.gfx, banner.label],
      x: to.x,
      y: to.y,
      duration: BANNER_TWEEN_MS,
      ease: 'Cubic.InOut',
    });
  }

  /** Play battle clash animation at a region. */
  animateBattle(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const centroid = computeCentroid(region.vertices);
    this._playBattleEffect(centroid.x, centroid.y);
  }

  /** Play retreat animation for an army. */
  animateRetreat(armyId: string, toRegionId: string) {
    const toRegion = this.worldState.regions.get(toRegionId);
    const banner   = this.banners.get(armyId);
    if (!toRegion || !banner) return;

    const to = computeCentroid(toRegion.vertices);

    // Semi-transparent red trail
    banner.gfx.setAlpha(0.4);
    this.tweens.add({
      targets: [banner.gfx, banner.label],
      x: to.x,
      y: to.y,
      duration: BANNER_TWEEN_MS * 0.7,
      ease: 'Cubic.Out',
      onComplete: () => {
        banner.gfx.setAlpha(1.0);
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Private — Banner Rendering
  // ---------------------------------------------------------------------------

  private _renderAll() {
    this.armyLayer.removeAll(true);
    this.pathLayer.removeAll(true);
    this.banners.clear();

    for (const [, army] of this.worldState.armies) {
      if (army.state === 'disbanded') continue;
      this._renderBanner(army);
    }
  }

  private _renderBanner(army: Army) {
    const region = this.worldState.regions.get(army.currentRegionId);
    if (!region) return;

    const nation = this.worldState.nations.get(army.nationId);
    const nationColor = nation?.color ?? '#c9a84c';
    const colorVal = Phaser.Display.Color.HexStringToColor(nationColor).color;

    const centroid = computeCentroid(region.vertices);
    const x = centroid.x;
    const y = centroid.y;

    const gfx = this.add.graphics();

    // Pennant shape: flat top, V-notch at bottom
    const hw = BANNER_W / 2;
    gfx.fillStyle(colorVal, 0.9);
    gfx.fillPoints([
      { x: x - hw, y: y - BANNER_H },
      { x: x + hw, y: y - BANNER_H },
      { x: x + hw, y: y },
      { x,         y: y + BANNER_NOTCH },
      { x: x - hw, y: y },
    ] as Phaser.Types.Math.Vector2Like[], true);

    // Lighter stroke
    const lighterColor = Phaser.Display.Color.HexStringToColor(nationColor);
    lighterColor.lighten(30);
    gfx.lineStyle(0.5, lighterColor.color, 0.9);
    gfx.strokePoints([
      { x: x - hw, y: y - BANNER_H },
      { x: x + hw, y: y - BANNER_H },
      { x: x + hw, y: y },
      { x,         y: y + BANNER_NOTCH },
      { x: x - hw, y: y },
    ] as Phaser.Types.Math.Vector2Like[], true);

    // Battle indicator icon (crossed swords)
    if (army.state === 'engaged' || army.state === 'sieging') {
      gfx.lineStyle(1.5, 0xffffff, 0.9);
      gfx.lineBetween(x - 5, y - BANNER_H + 2, x + 5, y - BANNER_H + 8);
      gfx.lineBetween(x + 5, y - BANNER_H + 2, x - 5, y - BANNER_H + 8);
    }

    // Troop count label
    const label = this.add.text(x, y - BANNER_H + 5, formatTroopCount(army.strength), {
      fontFamily: '"Source Serif 4", serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    label.setOrigin(0.5, 0.5);

    this.armyLayer.add(gfx);
    this.armyLayer.add(label);
    this.banners.set(army.id, { gfx, label });

    // Retreating appearance
    if (army.state === 'retreating') {
      gfx.setAlpha(0.5);
      gfx.setTint(Phaser.Display.Color.HexStringToColor(COLORS.DANGER).color);
    }
  }

  // ---------------------------------------------------------------------------
  // Private — Marching Path
  // ---------------------------------------------------------------------------

  private _drawPath(from: { x: number; y: number }, to: { x: number; y: number }) {
    const gfx = this.add.graphics();
    gfx.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(COLORS.PRIMARY).color, 0.5);

    // Dashed line approximation (draw short segments)
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.floor(dist / 8);

    for (let i = 0; i < steps; i += 2) {
      const t0 = i / steps;
      const t1 = Math.min((i + 1) / steps, 1);
      gfx.lineBetween(
        from.x + dx * t0, from.y + dy * t0,
        from.x + dx * t1, from.y + dy * t1,
      );
    }

    this.pathLayer.add(gfx);

    // Fade out path after tween completes
    this.time.delayedCall(BANNER_TWEEN_MS + 200, () => {
      this.tweens.add({ targets: gfx, alpha: 0, duration: 400, onComplete: () => gfx.destroy() });
    });
  }

  // ---------------------------------------------------------------------------
  // Private — Battle VFX
  // ---------------------------------------------------------------------------

  private _playBattleEffect(x: number, y: number) {
    const gfx = this.add.graphics();
    this.armyLayer.add(gfx);

    // Spark particles (crossed swords sparkle effect)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = 8 + Math.random() * 6;
      gfx.fillStyle(0xffffff, 0.9);
      gfx.fillCircle(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 1.5);
    }

    // Screen shake 200ms, 2px (via Camera2D)
    this.cameras.main.shake(200, 0.002);

    this.tweens.add({
      targets: gfx,
      scaleX: 1.5, scaleY: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Power2.Out',
      onComplete: () => gfx.destroy(),
    });
  }
}
