// =============================================================================
// DIVINE DOMINION — Era Transition Renderer (Task 2.7)
// Palette morphing over 3000ms, era name toast, icon evolution.
// art-spec.md §9, §5 (city icon progression)
// =============================================================================

import Phaser from 'phaser';
import type { EraId } from '../types/game.js';
import { ERA_COLORS } from './palettes.js';
import { eraIndex, eraName, ERA_ORDER } from './era-utils.js';

export { eraIndex, eraName };

// EraTransition — Phaser 3 Scene
// ---------------------------------------------------------------------------

export interface EraTransitionConfig {
  scene: Phaser.Scene;
}

export class EraTransitionController {
  private scene: Phaser.Scene;
  private toastText?: Phaser.GameObjects.Text;
  private eraLabelText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Trigger full era transition:
   * 1. Palette morph (3000ms, Sine.InOut) — handled by MapRenderer
   * 2. Toast (500ms in, 1500ms hold, 500ms out — total 2500ms)
   * 3. Emit 'eraTransition' event for MapRenderer to swap terrain tints
   */
  triggerTransition(newEra: EraId) {
    const colors = ERA_COLORS[newEra];
    const idx    = eraIndex(newEra);

    // Tween the scene's background color toward the new era's secondary color
    const fromColor = Phaser.Display.Color.HexStringToColor(ERA_COLORS[ERA_ORDER[Math.max(0, idx - 1)]].secondary);
    const toColor   = Phaser.Display.Color.HexStringToColor(colors.secondary);

    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 3000,
      ease: 'Sine.InOut',
      onUpdate: (tween) => {
        const t = tween.getValue() / 100;
        const r = Math.round(fromColor.red   + (toColor.red   - fromColor.red)   * t);
        const g = Math.round(fromColor.green + (toColor.green - fromColor.green) * t);
        const b = Math.round(fromColor.blue  + (toColor.blue  - fromColor.blue)  * t);
        this.scene.cameras.main.setBackgroundColor({ r, g, b });
      },
    });

    // Show toast at t=500ms (after morph begins)
    this.scene.time.delayedCall(500, () => {
      this._showEraToast(newEra);
    });
  }

  /** Minimal in-scene era label (replaces Phaser.DOM for simplicity). */
  private _showEraToast(eraId: EraId) {
    if (this.toastText) {
      this.toastText.destroy();
      this.toastText = undefined;
    }

    const { width, height } = this.scene.cameras.main;
    const name = eraName(eraId);
    const idx  = eraIndex(eraId) + 1;

    this.toastText = this.scene.add.text(width / 2, height / 2, `Era ${idx}: ${name}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '28px',
      fontStyle: '800',
      color: '#c9a84c',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.toastText.setOrigin(0.5, 0.5);
    this.toastText.setAlpha(0);
    this.toastText.setDepth(1000);

    // 500ms fade in
    this.scene.tweens.add({
      targets: this.toastText,
      alpha: 1,
      duration: 500,
      ease: 'Power2.In',
      onComplete: () => {
        // 1500ms hold, then 500ms fade out
        this.scene.time.delayedCall(1500, () => {
          this.scene.tweens.add({
            targets: this.toastText,
            alpha: 0,
            duration: 500,
            ease: 'Power2.Out',
            onComplete: () => {
              this.toastText?.destroy();
              this.toastText = undefined;
            },
          });
        });
      },
    });
  }

  /** Update era label in HUD (called by game controller). */
  setEraLabel(text: Phaser.GameObjects.Text, eraId: EraId) {
    text.setText(eraName(eraId));
  }
}
