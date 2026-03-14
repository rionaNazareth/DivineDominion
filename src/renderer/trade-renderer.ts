// =============================================================================
// DIVINE DOMINION — Trade Route Renderer (Task 2.4)
// Golden lines between cities, thickness by volume, disruption effects.
// art-spec.md §UI Living Map — Trade Routes
// =============================================================================

import Phaser from 'phaser';
import type { WorldState, TradeRoute } from '../types/game.js';
import { COLORS } from './palettes.js';
import { computeCentroid } from './map-utils.js';
import { volumeToLineWidth, tradeRouteColor } from './trade-utils.js';

export { volumeToLineWidth, tradeRouteColor };

// TradeRenderer — Phaser 3 Scene
// ---------------------------------------------------------------------------

export interface TradeRendererConfig {
  worldState: WorldState;
}

export class TradeRenderer extends Phaser.Scene {
  private worldState!: WorldState;
  private tradeLayer!: Phaser.GameObjects.Container;
  private particleLayer!: Phaser.GameObjects.Container;

  // Active particle emitters by routeId
  private particles: Map<string, Phaser.GameObjects.Graphics[]> = new Map();

  constructor() {
    super({ key: 'TradeRenderer' });
  }

  init(data: TradeRendererConfig) {
    this.worldState = data.worldState;
  }

  create() {
    this.tradeLayer   = this.add.container(0, 0);
    this.particleLayer = this.add.container(0, 0);
    this._renderAll();
  }

  // Public API
  // ---------------------------------------------------------------------------

  refresh(newWorldState: WorldState) {
    this.worldState = newWorldState;
    this._renderAll();
  }

  /** Play new trade route draw animation. */
  animateNewRoute(routeId: string) {
    const route = this.worldState.tradeRoutes.get(routeId);
    if (!route) return;
    const from = this._regionCenter(route.regionA);
    const to   = this._regionCenter(route.regionB);
    if (!from || !to) return;

    const gfx = this.add.graphics();
    this.tradeLayer.add(gfx);

    // Animate line drawing from start to end
    let progress = 0;
    const colorVal = Phaser.Display.Color.HexStringToColor(COLORS.PRIMARY).color;

    this.time.addEvent({
      delay: 16,
      repeat: 30,
      callback: () => {
        progress = Math.min(progress + 0.033, 1);
        gfx.clear();
        gfx.lineStyle(volumeToLineWidth(route.volume), colorVal, 0.7 * progress);
        gfx.lineBetween(from.x, from.y, from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress);
      },
    });
  }

  // Private
  // ---------------------------------------------------------------------------

  private _renderAll() {
    this.tradeLayer.removeAll(true);
    this._stopAllParticles();

    for (const [, route] of this.worldState.tradeRoutes) {
      this._renderRoute(route);
    }
    this._startParticles();
  }

  private _renderRoute(route: TradeRoute) {
    const from = this._regionCenter(route.regionA);
    const to   = this._regionCenter(route.regionB);
    if (!from || !to) return;

    const { hex, alpha, dashed } = tradeRouteColor(route);
    const colorVal = Phaser.Display.Color.HexStringToColor(hex).color;
    const lineWidth = volumeToLineWidth(route.volume);

    const gfx = this.add.graphics();

    if (dashed) {
      this._drawDashedLine(gfx, from, to, lineWidth, colorVal, alpha);
    } else {
      gfx.lineStyle(lineWidth, colorVal, alpha);
      gfx.lineBetween(from.x, from.y, to.x, to.y);
    }

    this.tradeLayer.add(gfx);
  }

  private _drawDashedLine(
    gfx: Phaser.GameObjects.Graphics,
    from: { x: number; y: number },
    to: { x: number; y: number },
    lineWidth: number,
    color: number,
    alpha: number,
  ) {
    gfx.lineStyle(lineWidth, color, alpha);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.floor(dist / 10);
    for (let i = 0; i < steps; i += 2) {
      const t0 = i / steps;
      const t1 = Math.min((i + 1) / steps, 1);
      gfx.lineBetween(
        from.x + dx * t0, from.y + dy * t0,
        from.x + dx * t1, from.y + dy * t1,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Trade particles (art-spec.md §UI Ambient Map Life — Trade Particles)
  // ---------------------------------------------------------------------------

  private _startParticles() {
    for (const [routeId, route] of this.worldState.tradeRoutes) {
      if (!route.isActive) continue;
      const from = this._regionCenter(route.regionA);
      const to   = this._regionCenter(route.regionB);
      if (!from || !to) continue;
      this._spawnParticleStream(routeId, from, to);
    }
  }

  private _stopAllParticles() {
    for (const [, dots] of this.particles) {
      for (const d of dots) d.destroy();
    }
    this.particles.clear();
    this.particleLayer.removeAll(true);
  }

  private _spawnParticleStream(routeId: string, from: { x: number; y: number }, to: { x: number; y: number }) {
    const dots: Phaser.GameObjects.Graphics[] = [];
    const dotCount = 3;
    const colorVal = Phaser.Display.Color.HexStringToColor(COLORS.PRIMARY).color;

    for (let i = 0; i < dotCount; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(colorVal, 0.85);
      dot.fillCircle(0, 0, 2);
      this.particleLayer.add(dot);
      dots.push(dot);

      // Stagger start offset
      const startOffset = i / dotCount;
      this._animateParticleDot(dot, from, to, startOffset);
    }

    this.particles.set(routeId, dots);
  }

  private _animateParticleDot(
    dot: Phaser.GameObjects.Graphics,
    from: { x: number; y: number },
    to: { x: number; y: number },
    startOffset: number,
  ) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const duration = 3000 + Math.random() * 1000;
    const delay = startOffset * duration;

    dot.setPosition(from.x + dx * startOffset, from.y + dy * startOffset);

    this.tweens.add({
      targets: dot,
      x: to.x,
      y: to.y,
      duration,
      delay,
      ease: 'Linear',
      repeat: -1,
      onRepeat: () => {
        dot.setPosition(from.x, from.y);
      },
    });
  }

  private _regionCenter(regionId: string): { x: number; y: number } | null {
    const region = this.worldState.regions.get(regionId);
    if (!region || region.vertices.length === 0) return null;
    return computeCentroid(region.vertices);
  }
}
