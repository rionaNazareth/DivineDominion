// =============================================================================
// DIVINE DOMINION — Religion Overlay Renderer (Task 2.2)
// Watercolor-blended religion influence per region. Toggle on/off.
// Dominant religion = full radial glow; contested = split border segments.
// art-spec.md §4, §11b, §11c
// =============================================================================

import Phaser from 'phaser';
import type { WorldState, Region, ReligionInfluence } from '../types/game.js';
import { getReligionColor } from './palettes.js';
import { computeCentroid } from './map-utils.js';
import {
  getDominantReligion, hasMajority, hasStronghold,
  computeContestArcSegments, type ArcSegment,
} from './religion-overlay-utils.js';

export { getDominantReligion, hasMajority, hasStronghold, computeContestArcSegments };
export type { ArcSegment };

// -----------------------------------------------------------------------------
// ReligionOverlay — Phaser 3 Scene
// -----------------------------------------------------------------------------

export interface ReligionOverlayConfig {
  worldState: WorldState;
  playerReligionId: string;
}

export class ReligionOverlay extends Phaser.Scene {
  private worldState!: WorldState;
  private playerReligionId!: string;
  private overlayLayer!: Phaser.GameObjects.Container;
  private legendLayer!: Phaser.GameObjects.Container;
  private _visible = false;

  constructor() {
    super({ key: 'ReligionOverlay' });
  }

  init(data: ReligionOverlayConfig) {
    this.worldState = data.worldState;
    this.playerReligionId = data.playerReligionId;
  }

  create() {
    this.overlayLayer = this.add.container(0, 0);
    this.legendLayer  = this.add.container(0, 0);
    this.overlayLayer.setVisible(false);
    this.legendLayer.setVisible(false);
    this._renderAll();
    this._renderLegend();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  toggle() {
    this._visible = !this._visible;
    this.overlayLayer.setVisible(this._visible);
    this.legendLayer.setVisible(this._visible);
  }

  get isVisible() { return this._visible; }

  /** Called each tick when player religion spreads to a new region — triggers wave-front. */
  playWaveFront(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    const centroid = computeCentroid(region.vertices);
    this._spawnWaveFront(centroid.x, centroid.y);
  }

  /** Force a full re-render (e.g., after conquest or religion update). */
  refresh() {
    this._renderAll();
    this._renderLegend();
  }

  // ---------------------------------------------------------------------------
  // Private — Overlay Rendering
  // ---------------------------------------------------------------------------

  private _renderAll() {
    this.overlayLayer.removeAll(true);
    for (const [, region] of this.worldState.regions) {
      this._renderRegionOverlay(region);
    }
  }

  private _renderRegionOverlay(region: Region) {
    const influences = region.religiousInfluence;
    if (influences.length === 0) return;

    const centroid = computeCentroid(region.vertices);
    const isContested = !hasMajority(influences);

    if (!isContested) {
      // Full radial glow in dominant religion color
      const dom = getDominantReligion(influences)!;
      const { hex, overlayOpacity } = getReligionColor(dom.religionId);
      this._drawRadialGlow(centroid, region.vertices, hex, overlayOpacity, dom.religionId === this.playerReligionId);
    } else {
      // Contested — split arc border segments
      const segments = computeContestArcSegments(influences);
      this._drawContestBorder(centroid, region.vertices, segments);
    }
  }

  private _drawRadialGlow(
    centroid: { x: number; y: number },
    vertices: { x: number; y: number }[],
    hexColor: string,
    maxOpacity: number,
    isPlayer: boolean,
  ) {
    const gfx = this.add.graphics();
    const colorVal = Phaser.Display.Color.HexStringToColor(hexColor).color;

    // Clip region polygon as fill mask
    gfx.fillStyle(colorVal, maxOpacity * 0.85);
    gfx.fillPoints(vertices as Phaser.Types.Math.Vector2Like[], true);

    if (isPlayer) {
      // Subtle pulse overlay — tween alpha between 0.3 and 0.5 (art-spec.md §11b)
      this.tweens.add({
        targets: gfx,
        alpha: { from: 0.6, to: 1.0 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    this.overlayLayer.add(gfx);
  }

  private _drawContestBorder(
    centroid: { x: number; y: number },
    vertices: { x: number; y: number }[],
    segments: ArcSegment[],
  ) {
    if (segments.length === 0) return;
    const gfx = this.add.graphics();

    // Estimate radius as average distance from centroid to vertices
    const radii = vertices.map(v => Math.hypot(v.x - centroid.x, v.y - centroid.y));
    const radius = radii.reduce((s, r) => s + r, 0) / radii.length;

    for (const seg of segments) {
      const color = Phaser.Display.Color.HexStringToColor(seg.color).color;
      gfx.lineStyle(4, color, seg.opacity);
      const startRad = Phaser.Math.DegToRad(seg.startAngleDeg - 90);
      const endRad   = Phaser.Math.DegToRad(seg.startAngleDeg + seg.sweepDeg - 90);
      gfx.beginPath();
      gfx.arc(centroid.x, centroid.y, radius, startRad, endRad, false);
      gfx.strokePath();
    }

    this.overlayLayer.add(gfx);
  }

  // ---------------------------------------------------------------------------
  // Wave-Front Animation (art-spec.md §11c)
  // ---------------------------------------------------------------------------

  private _spawnWaveFront(x: number, y: number) {
    const gfx = this.add.graphics();
    const { hex } = getReligionColor(this.playerReligionId);
    const colorVal = Phaser.Display.Color.HexStringToColor(hex).color;

    gfx.lineStyle(2, colorVal, 0.6);
    gfx.strokeCircle(x, y, 5);
    this.overlayLayer.add(gfx);

    // Expand to ~50px radius and fade out over 800ms (art-spec.md §11c)
    this.tweens.add({
      targets: gfx,
      scaleX: 10,
      scaleY: 10,
      alpha: 0,
      duration: 800,
      ease: 'Power2.Out',
      onComplete: () => { gfx.destroy(); },
    });
  }

  // ---------------------------------------------------------------------------
  // Legend (shown when overlay is active)
  // ---------------------------------------------------------------------------

  private _renderLegend() {
    this.legendLayer.removeAll(true);

    const religions = Array.from(this.worldState.religions.values());
    const x = 16;
    let y = 80;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0820, 0.85);
    bg.fillRoundedRect(x - 8, y - 8, 160, religions.length * 22 + 16, 8);
    this.legendLayer.add(bg);

    for (const rel of religions) {
      const { hex } = getReligionColor(rel.id);
      const dot = this.add.graphics();
      dot.fillStyle(Phaser.Display.Color.HexStringToColor(hex).color, 1.0);
      dot.fillCircle(x + 6, y + 6, 6);
      this.legendLayer.add(dot);

      const label = this.add.text(x + 20, y, rel.name.slice(0, 16), {
        fontFamily: '"Source Serif 4", serif',
        fontSize: '12px',
        color: '#d8d0c0',
      });
      this.legendLayer.add(label);

      y += 22;
    }
  }
}
