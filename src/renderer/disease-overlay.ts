// =============================================================================
// DIVINE DOMINION — Disease Overlay Renderer (Task 2.5)
// Green tinting on affected regions, spreading tendrils, pandemic pulse.
// art-spec.md §UI Living Map — Disease
// =============================================================================

import Phaser from 'phaser';
import type { WorldState, Disease } from '../types/game.js';
import { computeCentroid } from './map-utils.js';
import { getDiseaseAlpha } from './disease-utils.js';

export { getDiseaseAlpha };

// Disease visual constants
const DISEASE_TINT     = 0x6a8a3a;  // sickly green

// DiseaseOverlay — Phaser 3 Scene
// ---------------------------------------------------------------------------

export interface DiseaseOverlayConfig {
  worldState: WorldState;
}

export class DiseaseOverlay extends Phaser.Scene {
  private worldState!: WorldState;
  private overlayLayer!: Phaser.GameObjects.Container;
  private tendrilLayer!: Phaser.GameObjects.Container;

  // Pandemic pulse tweens
  private pulseTweens: Phaser.Tweens.Tween[] = [];

  constructor() {
    super({ key: 'DiseaseOverlay' });
  }

  init(data: DiseaseOverlayConfig) {
    this.worldState = data.worldState;
  }

  create() {
    this.overlayLayer = this.add.container(0, 0);
    this.tendrilLayer = this.add.container(0, 0);
    this._renderAll();
  }

  // Public API
  // ---------------------------------------------------------------------------

  refresh(newWorldState: WorldState) {
    this.worldState = newWorldState;
    this._stopAllPulses();
    this._renderAll();
  }

  /** Animate disease spreading into a new region (tendril effect). */
  animateSpread(fromRegionId: string, toRegionId: string) {
    const fromRegion = this.worldState.regions.get(fromRegionId);
    const toRegion   = this.worldState.regions.get(toRegionId);
    if (!fromRegion || !toRegion) return;

    const from = computeCentroid(fromRegion.vertices);
    const to   = computeCentroid(toRegion.vertices);
    this._drawTendril(from, to);
  }

  // Private
  // ---------------------------------------------------------------------------

  private _renderAll() {
    this.overlayLayer.removeAll(true);
    this.tendrilLayer.removeAll(true);

    const diseases = this.worldState.diseases.filter(d => d.isActive);
    if (diseases.length === 0) return;

    // Tint affected regions
    for (const disease of diseases) {
      for (const regionId of disease.affectedRegions) {
        const region = this.worldState.regions.get(regionId);
        if (!region) continue;

        const alpha = getDiseaseAlpha(disease, regionId);
        const gfx = this.add.graphics();
        gfx.fillStyle(DISEASE_TINT, alpha);
        gfx.fillPoints(region.vertices as Phaser.Types.Math.Vector2Like[], true);

        // Quarantine dashed border
        if (region.isQuarantined) {
          this._drawQuarantineBorder(gfx, region.vertices);
        }

        this.overlayLayer.add(gfx);

        // Pandemic pulse
        if (disease.severity === 'pandemic') {
          this._addPandemiPulse(gfx);
        }
      }
    }
  }

  private _drawQuarantineBorder(gfx: Phaser.GameObjects.Graphics, vertices: { x: number; y: number }[]) {
    // Dashed border using segmented draws
    const dashLen = 6;
    const gapLen  = 4;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % n];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const segLen = Math.hypot(dx, dy);
      const totalDash = dashLen + gapLen;
      const dashCount = Math.floor(segLen / totalDash);

      gfx.lineStyle(2, DISEASE_TINT, 0.8);
      for (let d = 0; d < dashCount; d++) {
        const t0 = (d * totalDash) / segLen;
        const t1 = Math.min((d * totalDash + dashLen) / segLen, 1);
        gfx.lineBetween(
          a.x + dx * t0, a.y + dy * t0,
          a.x + dx * t1, a.y + dy * t1,
        );
      }
    }
  }

  private _addPandemiPulse(gfx: Phaser.GameObjects.Graphics) {
    // Pulse alpha between outbreak and pandemic levels
    const tween = this.tweens.add({
      targets: gfx,
      alpha: { from: 0.4, to: 0.75 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    this.pulseTweens.push(tween);
  }

  // Spreading tendrils (art-spec.md)
  private _drawTendril(from: { x: number; y: number }, to: { x: number; y: number }) {
    const gfx = this.add.graphics();
    gfx.lineStyle(2, DISEASE_TINT, 0.6);
    this.tendrilLayer.add(gfx);

    // Animate tendril growing from source to target
    let progress = 0;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    this.time.addEvent({
      delay: 20,
      repeat: 40,
      callback: () => {
        progress = Math.min(progress + 0.025, 1);
        gfx.clear();
        gfx.lineStyle(2, DISEASE_TINT, 0.6 * (1 - progress * 0.5));
        gfx.lineBetween(from.x, from.y, from.x + dx * progress, from.y + dy * progress);
        if (progress >= 1) {
          // Fade out after full draw
          this.tweens.add({ targets: gfx, alpha: 0, duration: 800, onComplete: () => gfx.destroy() });
        }
      },
    });
  }

  private _stopAllPulses() {
    for (const t of this.pulseTweens) t.stop();
    this.pulseTweens = [];
  }
}
