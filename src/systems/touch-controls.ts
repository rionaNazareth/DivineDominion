// =============================================================================
// DIVINE DOMINION — Mobile Touch Controls
// Pan, pinch, tap, long-press, swipe, two-finger tap.
// Pure logic layer — input events converted to game commands.
// See docs/design/phase-4.md §4.6
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}

export type TouchCommand =
  | { type: 'pan'; dx: number; dy: number }
  | { type: 'pinch'; scaleDelta: number; centerX: number; centerY: number }
  | { type: 'tap'; x: number; y: number }
  | { type: 'long_press'; x: number; y: number }
  | { type: 'swipe_edge'; edge: 'left' | 'right' | 'top' | 'bottom'; x: number; y: number }
  | { type: 'two_finger_tap'; centerX: number; centerY: number }
  | { type: 'tap_cancel' };

export interface TouchConfig {
  longPressMs: number;
  swipeEdgeThresholdPx: number;
  tapMaxMovePx: number;
  tapMaxMs: number;
  pinchMinDistancePx: number;
  screenWidth: number;
  screenHeight: number;
}

export const TOUCH_DEFAULTS: TouchConfig = {
  longPressMs: 500,
  swipeEdgeThresholdPx: 40,
  tapMaxMovePx: 10,
  tapMaxMs: 300,
  pinchMinDistancePx: 20,
  screenWidth: 390,
  screenHeight: 844,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function distance(a: TouchPoint, b: TouchPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: TouchPoint, b: TouchPoint): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function detectSwipeEdge(
  x: number,
  y: number,
  config: TouchConfig,
): 'left' | 'right' | 'top' | 'bottom' | null {
  if (x < config.swipeEdgeThresholdPx) return 'left';
  if (x > config.screenWidth - config.swipeEdgeThresholdPx) return 'right';
  if (y < config.swipeEdgeThresholdPx) return 'top';
  if (y > config.screenHeight - config.swipeEdgeThresholdPx) return 'bottom';
  return null;
}

// ---------------------------------------------------------------------------
// TouchController — pure state machine
// ---------------------------------------------------------------------------

export class TouchController {
  private config: TouchConfig;
  private activeTouches: Map<number, TouchPoint>;
  private longPressTimer: ReturnType<typeof setTimeout> | null;
  private lastPinchDistance: number | null;
  private panLocked: boolean;
  private commands: TouchCommand[];

  constructor(config: Partial<TouchConfig> = {}) {
    this.config = { ...TOUCH_DEFAULTS, ...config };
    this.activeTouches = new Map();
    this.longPressTimer = null;
    this.lastPinchDistance = null;
    this.panLocked = false;
    this.commands = [];
  }

  updateConfig(patch: Partial<TouchConfig>): void {
    this.config = { ...this.config, ...patch };
  }

  // Flush and return all accumulated commands since last flush
  flushCommands(): TouchCommand[] {
    const out = this.commands.slice();
    this.commands = [];
    return out;
  }

  private emit(cmd: TouchCommand): void {
    this.commands.push(cmd);
  }

  // ---------------------------------------------------------------------------
  // Touch events
  // ---------------------------------------------------------------------------

  onTouchStart(touches: Array<{ id: number; x: number; y: number }>, now: number = Date.now()): void {
    for (const t of touches) {
      this.activeTouches.set(t.id, {
        id: t.id,
        x: t.x, y: t.y,
        startX: t.x, startY: t.y,
        startTime: now,
      });
    }

    const count = this.activeTouches.size;

    if (count === 1) {
      const touch = touches[0];
      // Schedule long-press
      this.longPressTimer = setTimeout(() => {
        const current = this.activeTouches.get(touch.id);
        if (current) {
          const moved = Math.hypot(current.x - current.startX, current.y - current.startY);
          if (moved < this.config.tapMaxMovePx) {
            this.emit({ type: 'long_press', x: current.x, y: current.y });
            this.panLocked = true;
          }
        }
      }, this.config.longPressMs);
    } else if (count === 2) {
      // Cancel single-touch long-press if second finger arrives
      this.clearLongPressTimer();
      // Check for two-finger tap start
      const pts = Array.from(this.activeTouches.values());
      this.lastPinchDistance = distance(pts[0], pts[1]);
    }
  }

  onTouchMove(touches: Array<{ id: number; x: number; y: number }>): void {
    for (const t of touches) {
      const existing = this.activeTouches.get(t.id);
      if (existing) {
        this.activeTouches.set(t.id, { ...existing, x: t.x, y: t.y });
      }
    }

    const count = this.activeTouches.size;

    if (count === 1 && !this.panLocked) {
      const touch = touches[0];
      const existing = this.activeTouches.get(touch.id);
      if (!existing) return;

      const moved = Math.hypot(existing.x - existing.startX, existing.y - existing.startY);
      if (moved > this.config.tapMaxMovePx) {
        this.clearLongPressTimer();
      }

      const dx = touch.x - (existing.x - (touch.x - existing.x)); // prev = existing before update = x - (new - prev)
      // Actually compute delta from previous position stored:
      // We need prev pos — store it before update or compute differently.
      // Since we already updated, compute from previous stored value.
      // Re-approach: store prevX/prevY separately, but simpler: we get move as deltas from caller in Phaser.
      // Here we emit pan with the delta directly.
      // This is handled by Phaser integration which provides prevX/prevY.
      // For the pure logic layer, emit placeholder with 0 — actual deltas come from onPan().
    }

    if (count === 2) {
      const pts = Array.from(this.activeTouches.values());
      const newDist = distance(pts[0], pts[1]);
      if (this.lastPinchDistance !== null) {
        const scaleDelta = newDist / this.lastPinchDistance;
        const center = midpoint(pts[0], pts[1]);
        if (Math.abs(newDist - this.lastPinchDistance) > this.config.pinchMinDistancePx * 0.1) {
          this.emit({ type: 'pinch', scaleDelta, centerX: center.x, centerY: center.y });
        }
      }
      this.lastPinchDistance = newDist;
    }
  }

  /**
   * Called by Phaser integration to emit a pan command with accurate deltas.
   * Phaser provides prevX/prevY from its pointer tracking.
   */
  onPan(x: number, y: number, prevX: number, prevY: number): void {
    if (this.panLocked) return;
    if (this.activeTouches.size !== 1) return;
    this.emit({ type: 'pan', dx: x - prevX, dy: y - prevY });
  }

  onTouchEnd(touches: Array<{ id: number; x: number; y: number }>, now: number = Date.now()): void {
    const count = this.activeTouches.size;

    for (const t of touches) {
      const start = this.activeTouches.get(t.id);

      if (count === 1 && start) {
        const elapsed = now - start.startTime;
        const moved = Math.hypot(t.x - start.startX, t.y - start.startY);
        this.clearLongPressTimer();

        if (!this.panLocked && elapsed < this.config.tapMaxMs && moved < this.config.tapMaxMovePx) {
          // Check for edge swipe
          const edge = detectSwipeEdge(t.x, t.y, this.config);
          if (edge) {
            this.emit({ type: 'swipe_edge', edge, x: t.x, y: t.y });
          } else {
            this.emit({ type: 'tap', x: t.x, y: t.y });
          }
        }

        this.panLocked = false;
      }

      if (count === 2 && start) {
        // Two-finger tap: both fingers lifted with minimal movement
        const elapsed = now - start.startTime;
        const moved = Math.hypot(t.x - start.startX, t.y - start.startY);
        if (elapsed < this.config.tapMaxMs && moved < this.config.tapMaxMovePx) {
          const pts = Array.from(this.activeTouches.values());
          if (pts.length === 2) {
            const center = midpoint(pts[0], pts[1]);
            this.emit({ type: 'two_finger_tap', centerX: center.x, centerY: center.y });
          }
        }
        this.lastPinchDistance = null;
      }

      this.activeTouches.delete(t.id);
    }
  }

  onTouchCancel(): void {
    this.clearLongPressTimer();
    this.activeTouches.clear();
    this.lastPinchDistance = null;
    this.panLocked = false;
    this.emit({ type: 'tap_cancel' });
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  // -- State inspection --

  getActiveTouchCount(): number {
    return this.activeTouches.size;
  }

  isLongPressLocked(): boolean {
    return this.panLocked;
  }
}
