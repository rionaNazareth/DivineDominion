// =============================================================================
// DIVINE DOMINION — Camera Controller (Task 2.8)
// Pan (drag), pinch-zoom (mobile), scroll wheel (desktop), bounds, inertia.
// art-spec.md §UI Zoom-Level Depth, palettes.ts CAMERA constants
// =============================================================================

import Phaser from 'phaser';
import { CAMERA, ZOOM_LEVELS } from './palettes.js';
import { WORLD_GEN } from '../config/constants.js';
import { clampZoom, getZoomTier, type ZoomTier } from './camera-utils.js';

export { clampZoom, getZoomTier };
export type { ZoomTier };

// CameraController — attaches to a Phaser 3 Scene
// ---------------------------------------------------------------------------

export class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;

  // Panning state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private camStartX  = 0;
  private camStartY  = 0;
  private velX = 0;
  private velY = 0;

  // Pinch state
  private pinchStartDist  = 0;
  private pinchStartZoom  = 1;
  private activePointers: Phaser.Input.Pointer[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene  = scene;
    this.camera = scene.cameras.main;

    this._setupBounds();
    this._setupPointerEvents();
    this._setupMouseWheel();

    // Initial zoom
    this.camera.setZoom(CAMERA.ZOOM_DEFAULT);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Smooth pan to a world position. */
  panTo(worldX: number, worldY: number) {
    this.scene.tweens.add({
      targets: this.camera,
      scrollX: worldX - this.camera.width  / 2 / this.camera.zoom,
      scrollY: worldY - this.camera.height / 2 / this.camera.zoom,
      duration: CAMERA.TWEEN_DURATION_MS,
      ease: 'Cubic.Out',
    });
  }

  /** Smooth zoom to a value. */
  zoomTo(targetZoom: number) {
    const clamped = clampZoom(targetZoom);
    this.scene.tweens.add({
      targets: this.camera,
      zoom: clamped,
      duration: CAMERA.TWEEN_DURATION_MS,
      ease: 'Cubic.Out',
    });
  }

  get currentZoom(): number { return this.camera.zoom; }
  get zoomTier(): ZoomTier  { return getZoomTier(this.camera.zoom); }

  /** Called each frame from Scene.update() for inertia. */
  update() {
    if (!this.isDragging) {
      // Apply inertia
      if (Math.abs(this.velX) > 0.01 || Math.abs(this.velY) > 0.01) {
        this.camera.scrollX += this.velX;
        this.camera.scrollY += this.velY;
        this.velX *= CAMERA.PAN_INERTIA;
        this.velY *= CAMERA.PAN_INERTIA;
        this._clampCamera();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Private — Setup
  // ---------------------------------------------------------------------------

  private _setupBounds() {
    const padX = WORLD_GEN.CANVAS_WIDTH  * 0.1;
    const padY = WORLD_GEN.CANVAS_HEIGHT * 0.1;
    this.camera.setBounds(
      -padX,
      -padY,
      WORLD_GEN.CANVAS_WIDTH  + padX * 2,
      WORLD_GEN.CANVAS_HEIGHT + padY * 2,
    );
  }

  private _setupPointerEvents() {
    const input = this.scene.input;

    input.on(Phaser.Input.Events.POINTER_DOWN, (ptr: Phaser.Input.Pointer) => {
      this.activePointers.push(ptr);
      if (this.activePointers.length === 1) {
        this._startDrag(ptr);
      } else if (this.activePointers.length === 2) {
        this.isDragging = false;
        this._startPinch();
      }
    });

    input.on(Phaser.Input.Events.POINTER_MOVE, (ptr: Phaser.Input.Pointer) => {
      if (this.activePointers.length === 1 && this.isDragging) {
        this._updateDrag(ptr);
      } else if (this.activePointers.length === 2) {
        this._updatePinch();
      }
    });

    input.on(Phaser.Input.Events.POINTER_UP, (ptr: Phaser.Input.Pointer) => {
      this.activePointers = this.activePointers.filter(p => p.id !== ptr.id);
      if (this.activePointers.length === 0) {
        this.isDragging = false;
      }
    });
  }

  private _setupMouseWheel() {
    this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL,
      (_ptr: Phaser.Input.Pointer, _gameObjects: unknown[], _dx: number, dy: number) => {
        const delta = -dy * CAMERA.ZOOM_WHEEL_FACTOR;
        const newZoom = clampZoom(this.camera.zoom + delta);
        this.camera.setZoom(newZoom);
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Private — Drag
  // ---------------------------------------------------------------------------

  private _startDrag(ptr: Phaser.Input.Pointer) {
    this.isDragging = true;
    this.dragStartX = ptr.x;
    this.dragStartY = ptr.y;
    this.camStartX  = this.camera.scrollX;
    this.camStartY  = this.camera.scrollY;
    this.velX = 0;
    this.velY = 0;
  }

  private _updateDrag(ptr: Phaser.Input.Pointer) {
    const dx = (ptr.x - this.dragStartX) / this.camera.zoom;
    const dy = (ptr.y - this.dragStartY) / this.camera.zoom;

    const prevX = this.camera.scrollX;
    const prevY = this.camera.scrollY;

    this.camera.scrollX = this.camStartX - dx;
    this.camera.scrollY = this.camStartY - dy;
    this._clampCamera();

    // Track velocity for inertia
    this.velX = this.camera.scrollX - prevX;
    this.velY = this.camera.scrollY - prevY;
  }

  // ---------------------------------------------------------------------------
  // Private — Pinch zoom (mobile)
  // ---------------------------------------------------------------------------

  private _startPinch() {
    const [p0, p1] = this.activePointers;
    this.pinchStartDist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    this.pinchStartZoom = this.camera.zoom;
  }

  private _updatePinch() {
    if (this.activePointers.length < 2) return;
    const [p0, p1] = this.activePointers;
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    if (this.pinchStartDist === 0) return;
    const ratio   = dist / this.pinchStartDist;
    const newZoom = clampZoom(this.pinchStartZoom * ratio);
    this.camera.setZoom(newZoom);
  }

  // ---------------------------------------------------------------------------
  // Private — Helpers
  // ---------------------------------------------------------------------------

  private _clampCamera() {
    const bounds = this.camera.getBounds();
    if (!bounds) return;
    this.camera.scrollX = Math.max(bounds.x, Math.min(bounds.right  - this.camera.width  / this.camera.zoom, this.camera.scrollX));
    this.camera.scrollY = Math.max(bounds.y, Math.min(bounds.bottom - this.camera.height / this.camera.zoom, this.camera.scrollY));
  }
}
