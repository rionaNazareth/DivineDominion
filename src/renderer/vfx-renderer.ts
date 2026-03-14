// =============================================================================
// DIVINE DOMINION — Divine Power VFX Renderer (Task 2.6)
// All 12 divine powers, whispers, combos, harbinger VFX.
// art-spec.md §7 (all sub-sections), §8
// Performance: max 6 emitters, 300 total particles (art-spec.md §11e)
// =============================================================================

import Phaser from 'phaser';
import type { WorldState } from '../types/game.js';
import { POWER_VFX, WHISPER_VFX, HARBINGER_VFX, COLORS } from './palettes.js';
import { computeCentroid } from './map-utils.js';

// Particle budget (art-spec.md §11e)
const MAX_EMITTERS   = 6;
const MAX_PARTICLES  = 300;

// Internal emitter slot
interface EmitterSlot {
  id: string;
  gfx: Phaser.GameObjects.Graphics;
  startedAt: number;
  durationMs: number;
}

// VfxRenderer — Phaser 3 Scene
// ---------------------------------------------------------------------------

export interface VfxRendererConfig {
  worldState: WorldState;
}

export class VfxRenderer extends Phaser.Scene {
  private worldState!: WorldState;
  private vfxLayer!: Phaser.GameObjects.Container;
  private activeEmitters: EmitterSlot[] = [];

  constructor() {
    super({ key: 'VfxRenderer' });
  }

  init(data: VfxRendererConfig) {
    this.worldState = data.worldState;
  }

  create() {
    this.vfxLayer = this.add.container(0, 0);
  }

  // ---------------------------------------------------------------------------
  // Public API — Divine Powers
  // ---------------------------------------------------------------------------

  /** Play VFX for a divine power cast on a region. */
  playPowerVfx(powerId: string, regionId: string) {
    const params = POWER_VFX[powerId];
    if (!params) return;
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const centroid = computeCentroid(region.vertices);
    const regionWidth = this._estimateRadius(region.vertices);

    this._ensureSlotAvailable(powerId);
    this._spawnPowerEffect(powerId, centroid.x, centroid.y, regionWidth, params);
  }

  /** Play whisper VFX (ring expand from region center). */
  playWhisperVfx(whisperType: 'war' | 'peace' | 'science' | 'faith', regionId: string) {
    const params = WHISPER_VFX[whisperType];
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const { x, y } = computeCentroid(region.vertices);
    this._spawnRingEffect(x, y, params.color, params.durationMs, 30, 50);
  }

  /** Play targeted whisper — arrow trail from source to target region. */
  playTargetedWhisperVfx(whisperType: 'war' | 'peace', fromRegionId: string, toRegionId: string) {
    const params = WHISPER_VFX[whisperType];
    const fromRegion = this.worldState.regions.get(fromRegionId);
    const toRegion   = this.worldState.regions.get(toRegionId);
    if (!fromRegion || !toRegion) return;
    const from = computeCentroid(fromRegion.vertices);
    const to   = computeCentroid(toRegion.vertices);
    this._spawnArrowTrail(from, to, params.color, 400);
  }

  /** Play combo chain toast (art-spec.md §7d). */
  playComboVfx(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const { x, y } = computeCentroid(region.vertices);
    const radius = this._estimateRadius(region.vertices);
    // Flash in gold then ripple outward
    this._spawnFlash(x, y, radius, COLORS.PRIMARY, 800);
    this._spawnRingEffect(x, y, COLORS.PURPLE, 800, radius, radius * 2);
  }

  // ---------------------------------------------------------------------------
  // Harbinger VFX (art-spec.md §8)
  // ---------------------------------------------------------------------------

  playCorruptionVfx(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const { x, y } = computeCentroid(region.vertices);
    const radius = this._estimateRadius(region.vertices);
    const vfx = HARBINGER_VFX.corruption;
    const gfx = this._createGfx();

    // Spreading dark purple stain
    gfx.fillStyle(Phaser.Display.Color.HexStringToColor(vfx.color2).color, vfx.opacity.min);
    gfx.fillCircle(x, y, 5);

    this.tweens.add({
      targets: gfx,
      scaleX: radius / 5, scaleY: radius / 5,
      alpha: vfx.opacity.max,
      duration: vfx.durationMs,
      ease: 'Power2.Out',
    });
    // Stays until purged — caller must destroy via playPurgeFx
  }

  playVeilVfx(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const vfx = HARBINGER_VFX.veil;
    const gfx = this._createGfx();
    const colorVal = Phaser.Display.Color.HexStringToColor(vfx.color).color;

    // Continuous shimmer loop on the polygon
    gfx.lineStyle(2, colorVal, vfx.opacity.min);
    gfx.strokePoints(region.vertices as Phaser.Types.Math.Vector2Like[], true);

    this.tweens.add({
      targets: gfx,
      alpha: { from: vfx.opacity.min, to: vfx.opacity.max },
      duration: vfx.durationMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  playDiscordVfx(fromRegionId: string, toRegionId: string) {
    const fromRegion = this.worldState.regions.get(fromRegionId);
    const toRegion   = this.worldState.regions.get(toRegionId);
    if (!fromRegion || !toRegion) return;
    const from = computeCentroid(fromRegion.vertices);
    const to   = computeCentroid(toRegion.vertices);
    const vfx = HARBINGER_VFX.discord;
    this._spawnArrowTrail(from, to, vfx.color, vfx.durationMs + vfx.holdMs + vfx.fadeMs);
  }

  playSeverVfx(routeFromId: string, routeToId: string) {
    const fromRegion = this.worldState.regions.get(routeFromId);
    const toRegion   = this.worldState.regions.get(routeToId);
    if (!fromRegion || !toRegion) return;
    const from = computeCentroid(fromRegion.vertices);
    const to   = computeCentroid(toRegion.vertices);
    const mid  = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    const vfx  = HARBINGER_VFX.sever;

    // Purple cut line
    const gfx = this._createGfx();
    gfx.lineStyle(3, Phaser.Display.Color.HexStringToColor(vfx.color).color, 0.7);
    gfx.lineBetween(from.x, from.y, to.x, to.y);

    // White flash at midpoint
    const flash = this._createGfx();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(mid.x, mid.y, 6);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: vfx.flashMs,
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: vfx.cutMs + vfx.flashMs,
      onComplete: () => gfx.destroy(),
    });
  }

  playFalseMiracleVfx(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const { x, y } = computeCentroid(region.vertices);
    const radius = this._estimateRadius(region.vertices);
    const vfx = HARBINGER_VFX.false_miracle;
    this._spawnRingEffect(x, y, vfx.color, vfx.expandMs, radius * 0.5, radius * 1.2, vfx.opacity);
  }

  playPurgeFx(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const { x, y } = computeCentroid(region.vertices);
    const radius = this._estimateRadius(region.vertices);
    const vfx = HARBINGER_VFX.divine_purge;
    this._spawnFlash(x, y, radius * 1.5, COLORS.PRIMARY, vfx.expandMs + vfx.fadeMs);
    this._spawnRingEffect(x, y, '#ffffff', vfx.expandMs, 10, radius * 1.3, 0.8);
  }

  // ---------------------------------------------------------------------------
  // Private — Shared VFX Primitives
  // ---------------------------------------------------------------------------

  private _spawnPowerEffect(
    powerId: string,
    x: number,
    y: number,
    radius: number,
    params: (typeof POWER_VFX)[string],
  ) {
    const gfx = this._createGfx();
    const colorVal  = Phaser.Display.Color.HexStringToColor(params.particleColor).color;
    const color2Val = params.particleColor2
      ? Phaser.Display.Color.HexStringToColor(params.particleColor2).color
      : colorVal;

    switch (powerId) {
      case 'bountiful_harvest':
        this._spawnWaveParticles(gfx, x, y, radius, colorVal, params.durationMs);
        break;
      case 'inspiration':
        this._spawnSparkles(gfx, x, y, radius, colorVal, params.durationMs);
        break;
      case 'miracle':
      case 'golden_age':
        this._spawnRadialBurst(gfx, x, y, radius, colorVal, color2Val, params.durationMs);
        if (params.shakeAmplitudePx) {
          this.cameras.main.shake(300, params.shakeAmplitudePx / 1000);
        }
        break;
      case 'prophet':
        this._spawnRingEffect(x, y, params.particleColor, params.durationMs, 10, radius * 1.4);
        break;
      case 'shield_of_faith': {
        gfx.lineStyle(2, colorVal, 0.5);
        gfx.strokeCircle(x, y, radius);
        this.tweens.add({
          targets: gfx,
          alpha: { from: 0, to: 0.5 },
          duration: 800,
          onComplete: () => {
            // Held for blessing duration — do not destroy immediately
          },
        });
        break;
      }
      case 'earthquake':
      case 'great_storm':
      case 'wildfire':
        this._spawnFlash(x, y, radius, params.particleColor, params.durationMs);
        if (params.shakeAmplitudePx) {
          this.cameras.main.shake(params.durationMs * 0.4, params.shakeAmplitudePx / 1000);
        }
        break;
      case 'great_flood':
      case 'plague':
      case 'famine':
        this._spawnFlash(x, y, radius, params.particleColor, params.durationMs);
        break;
      default:
        this._spawnFlash(x, y, radius, params.particleColor, params.durationMs);
        break;
    }

    this._trackEmitter(powerId, gfx, params.durationMs);
  }

  private _spawnFlash(x: number, y: number, radius: number, hexColor: string, durationMs: number) {
    const gfx = this._createGfx();
    const colorVal = Phaser.Display.Color.HexStringToColor(hexColor).color;
    gfx.fillStyle(colorVal, 0.6);
    gfx.fillCircle(x, y, radius);

    this.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: durationMs,
      ease: 'Power2.Out',
      onComplete: () => gfx.destroy(),
    });
  }

  private _spawnRadialBurst(
    gfx: Phaser.GameObjects.Graphics,
    x: number, y: number, radius: number,
    colorVal: number, color2Val: number,
    durationMs: number,
  ) {
    // Draw expanding rings
    for (let i = 0; i < 3; i++) {
      const r = (radius / 3) * (i + 1);
      gfx.lineStyle(3 - i, i % 2 === 0 ? colorVal : color2Val, 0.8 - i * 0.2);
      gfx.strokeCircle(x, y, r);
    }

    this.tweens.add({
      targets: gfx,
      scaleX: 2.0, scaleY: 2.0,
      alpha: 0,
      duration: durationMs,
      ease: 'Power2.Out',
      onComplete: () => gfx.destroy(),
    });
  }

  private _spawnSparkles(
    gfx: Phaser.GameObjects.Graphics,
    x: number, y: number, radius: number,
    colorVal: number, durationMs: number,
  ) {
    const count = Math.min(20, Math.floor(MAX_PARTICLES / (this.activeEmitters.length + 1)));
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      gfx.fillStyle(colorVal, 0.7 + Math.random() * 0.3);
      gfx.fillCircle(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 2);
    }
    this.tweens.add({
      targets: gfx,
      alpha: 0, scaleX: 1.5, scaleY: 1.5,
      duration: durationMs,
      ease: 'Power2.Out',
      onComplete: () => gfx.destroy(),
    });
  }

  private _spawnWaveParticles(
    gfx: Phaser.GameObjects.Graphics,
    x: number, y: number, radius: number,
    colorVal: number, durationMs: number,
  ) {
    // Concentric wave rings expanding outward
    for (let i = 0; i < 3; i++) {
      gfx.lineStyle(2, colorVal, 0.5 - i * 0.1);
      gfx.strokeCircle(x, y, radius * (0.4 + i * 0.3));
    }
    this.tweens.add({
      targets: gfx,
      scaleX: 1.8, scaleY: 1.8,
      alpha: 0,
      duration: durationMs,
      ease: 'Sine.Out',
      onComplete: () => gfx.destroy(),
    });
  }

  private _spawnRingEffect(
    x: number, y: number,
    hexColor: string,
    durationMs: number,
    startRadius: number,
    endRadius: number,
    maxOpacity = 0.6,
  ) {
    const gfx = this._createGfx();
    const colorVal = Phaser.Display.Color.HexStringToColor(hexColor).color;
    gfx.lineStyle(2, colorVal, maxOpacity);
    gfx.strokeCircle(x, y, startRadius);

    const scale = endRadius / startRadius;
    this.tweens.add({
      targets: gfx,
      scaleX: scale, scaleY: scale,
      alpha: 0,
      duration: durationMs,
      ease: 'Power2.Out',
      onComplete: () => gfx.destroy(),
    });
  }

  private _spawnArrowTrail(
    from: { x: number; y: number },
    to: { x: number; y: number },
    hexColor: string,
    durationMs: number,
  ) {
    const gfx = this._createGfx();
    const colorVal = Phaser.Display.Color.HexStringToColor(hexColor).color;
    gfx.lineStyle(2, colorVal, 0.6);
    gfx.lineBetween(from.x, from.y, to.x, to.y);

    // Arrow tip
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLen = 8;
    gfx.lineBetween(
      to.x, to.y,
      to.x - Math.cos(angle - 0.4) * arrowLen,
      to.y - Math.sin(angle - 0.4) * arrowLen,
    );
    gfx.lineBetween(
      to.x, to.y,
      to.x - Math.cos(angle + 0.4) * arrowLen,
      to.y - Math.sin(angle + 0.4) * arrowLen,
    );

    this.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: durationMs,
      ease: 'Power2.In',
      onComplete: () => gfx.destroy(),
    });
  }

  // ---------------------------------------------------------------------------
  // Emitter budget management (art-spec.md §11a)
  // ---------------------------------------------------------------------------

  private _ensureSlotAvailable(id: string) {
    // Remove same power if already playing (truncate with 200ms fast fade)
    const existing = this.activeEmitters.find(e => e.id === id);
    if (existing) {
      this.tweens.add({ targets: existing.gfx, alpha: 0, duration: 200, onComplete: () => existing.gfx.destroy() });
      this.activeEmitters = this.activeEmitters.filter(e => e !== existing);
    }

    // Evict oldest if over budget
    if (this.activeEmitters.length >= MAX_EMITTERS) {
      const oldest = this.activeEmitters.shift()!;
      this.tweens.add({ targets: oldest.gfx, alpha: 0, duration: 200, onComplete: () => oldest.gfx.destroy() });
    }
  }

  private _trackEmitter(id: string, gfx: Phaser.GameObjects.Graphics, durationMs: number) {
    const slot: EmitterSlot = { id, gfx, startedAt: this.time.now, durationMs };
    this.activeEmitters.push(slot);
    this.time.delayedCall(durationMs, () => {
      this.activeEmitters = this.activeEmitters.filter(e => e !== slot);
    });
  }

  private _createGfx(): Phaser.GameObjects.Graphics {
    const gfx = this.add.graphics();
    this.vfxLayer.add(gfx);
    return gfx;
  }

  private _estimateRadius(vertices: { x: number; y: number }[]): number {
    if (vertices.length === 0) return 30;
    const centroid = computeCentroid(vertices);
    const radii = vertices.map(v => Math.hypot(v.x - centroid.x, v.y - centroid.y));
    return radii.reduce((s, r) => s + r, 0) / radii.length;
  }
}
