// =============================================================================
// DIVINE DOMINION — GameScene (Main Phaser Scene)
// Wires together all renderer modules. Entry point for map rendering.
// =============================================================================

import Phaser from 'phaser';
import type { GameState, WorldState, EraId } from '../types/game.js';
import { MapRenderer }        from './map-renderer.js';
import { ReligionOverlay }    from './religion-overlay.js';
import { ArmyRenderer }       from './army-renderer.js';
import { TradeRenderer }      from './trade-renderer.js';
import { DiseaseOverlay }     from './disease-overlay.js';
import { VfxRenderer }        from './vfx-renderer.js';
import { EraTransitionController } from './era-transition.js';
import { CameraController }   from './camera-controller.js';
import { ERA_COLORS, COLORS } from './palettes.js';
import { WORLD_GEN } from '../config/constants.js';
import { computeCentroid } from './map-utils.js';

export interface GameSceneConfig {
  gameState: GameState;
  onRegionTap?: (regionId: string) => void;
}

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private onRegionTap?: (regionId: string) => void;

  // Sub-renderers
  private mapRenderer!: MapRenderer;
  private religionOverlay!: ReligionOverlay;
  private armyRenderer!: ArmyRenderer;
  private tradeRenderer!: TradeRenderer;
  private diseaseOverlay!: DiseaseOverlay;
  private vfxRenderer!: VfxRenderer;

  // Controllers
  private eraController!: EraTransitionController;
  private cameraController!: CameraController;

  private lastEra: EraId = 'renaissance';

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneConfig) {
    this.gameState  = data.gameState;
    this.onRegionTap = data.onRegionTap;
  }

  preload() {
    // City icons
    for (let i = 1; i <= 5; i++) {
      this.load.svg(`city-${i}`, `assets/icons/city-${i}.svg`, { width: 64, height: 64 });
    }
    // Religion symbols
    const religionIds = ['player', 'flame', 'harvest', 'deep', 'endings', 'unity', 'fortress', 'covenant', 'wandering', 'veil', 'iron'];
    for (const id of religionIds) {
      this.load.svg(`religion-${id}`, `assets/icons/religion-${id}.svg`, { width: 32, height: 32 });
    }
  }

  create() {
    const world = this.gameState.world;

    // Set initial background from era
    const eraBg = ERA_COLORS[world.currentEra].secondary;
    this.cameras.main.setBackgroundColor(eraBg);

    // Camera
    this.cameraController = new CameraController(this);

    // Sub-scenes: launch in render order (back to front)
    this.scene.launch('MapRenderer',     { worldState: world, currentEra: world.currentEra });
    this.scene.launch('TradeRenderer',   { worldState: world });
    this.scene.launch('DiseaseOverlay',  { worldState: world });
    this.scene.launch('ReligionOverlay', { worldState: world, playerReligionId: this.gameState.playerReligionId });
    this.scene.launch('ArmyRenderer',    { worldState: world });
    this.scene.launch('VfxRenderer',     { worldState: world });

    // Store refs
    this.mapRenderer     = this.scene.get('MapRenderer')     as MapRenderer;
    this.religionOverlay = this.scene.get('ReligionOverlay') as ReligionOverlay;
    this.armyRenderer    = this.scene.get('ArmyRenderer')    as ArmyRenderer;
    this.tradeRenderer   = this.scene.get('TradeRenderer')   as TradeRenderer;
    this.diseaseOverlay  = this.scene.get('DiseaseOverlay')  as DiseaseOverlay;
    this.vfxRenderer     = this.scene.get('VfxRenderer')     as VfxRenderer;

    // Era transition controller
    this.eraController = new EraTransitionController(this);
    this.lastEra = world.currentEra;

    // Region tap detection
    this._setupRegionTap();
  }

  update() {
    this.cameraController.update();
  }

  // ---------------------------------------------------------------------------
  // Public API — called by game loop / UI layer
  // ---------------------------------------------------------------------------

  /** Full world state update (called each simulation tick). */
  onTick(newGameState: GameState) {
    this.gameState = newGameState;
    const world = newGameState.world;

    // Check era transition
    if (world.currentEra !== this.lastEra) {
      this.eraController.triggerTransition(world.currentEra);
      this.mapRenderer.transitionToEra(world.currentEra);
      this.lastEra = world.currentEra;
    }

    this.armyRenderer.refresh(world);
    this.tradeRenderer.refresh(world);
    this.diseaseOverlay.refresh(world);
  }

  /** Cast a divine power — play VFX. */
  onPowerCast(powerId: string, regionId: string) {
    this.vfxRenderer.playPowerVfx(powerId, regionId);
  }

  /** Player cast whisper. */
  onWhisperCast(whisperType: 'war' | 'peace' | 'science' | 'faith', regionId: string, targetRegionId?: string) {
    if ((whisperType === 'war' || whisperType === 'peace') && targetRegionId) {
      this.vfxRenderer.playTargetedWhisperVfx(whisperType, regionId, targetRegionId);
    } else {
      this.vfxRenderer.playWhisperVfx(whisperType, regionId);
    }
  }

  /** Toggle religion overlay. */
  toggleReligionOverlay() {
    this.religionOverlay.toggle();
  }

  get religionOverlayVisible() {
    return this.religionOverlay.isVisible;
  }

  /** Zoom camera to a region. */
  focusRegion(regionId: string) {
    const region = this.gameState.world.regions.get(regionId);
    if (!region || region.vertices.length === 0) return;
    const cx = region.vertices.reduce((s, v) => s + v.x, 0) / region.vertices.length;
    const cy = region.vertices.reduce((s, v) => s + v.y, 0) / region.vertices.length;
    this.cameraController.panTo(cx, cy);
    this.cameraController.zoomTo(1.2);
  }

  // ---------------------------------------------------------------------------
  // Private — Region tap
  // ---------------------------------------------------------------------------

  private _setupRegionTap() {
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (ptr: Phaser.Input.Pointer) => {
      if (!this.onRegionTap) return;
      // Only handle single-finger taps (not pinch start)
      if (ptr.wasTouch && this.input.pointer2.isDown) return;
      const worldPt = this.cameras.main.getWorldPoint(ptr.x, ptr.y);
      const regionId = this._hitTestRegion(worldPt.x, worldPt.y);
      if (regionId) {
        this.onRegionTap(regionId);
      }
    });
  }

  /** Point-in-polygon test for all regions. Returns first match. */
  private _hitTestRegion(wx: number, wy: number): string | null {
    for (const [id, region] of this.gameState.world.regions) {
      if (region.terrain === 'ocean') continue;
      if (this._pointInPolygon(wx, wy, region.vertices)) {
        return id;
      }
    }
    return null;
  }

  private _pointInPolygon(px: number, py: number, vertices: { x: number; y: number }[]): boolean {
    let inside = false;
    const n = vertices.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;
      const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
}

// ---------------------------------------------------------------------------
// Phaser Game Factory
// ---------------------------------------------------------------------------

export interface DivineDominionRendererConfig {
  parent: HTMLElement | string;
  gameState: GameState;
  onRegionTap?: (regionId: string) => void;
  width?: number;
  height?: number;
}

export function createPhaserGame(config: DivineDominionRendererConfig): Phaser.Game {
  const scenes = [
    GameScene,
    MapRenderer,
    ReligionOverlay,
    ArmyRenderer,
    TradeRenderer,
    DiseaseOverlay,
    VfxRenderer,
  ];

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: config.parent,
    width:  config.width  ?? WORLD_GEN.CANVAS_WIDTH,
    height: config.height ?? WORLD_GEN.CANVAS_HEIGHT,
    backgroundColor: ERA_COLORS['renaissance'].secondary,
    antialias: true,
    scene: scenes,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    callbacks: {
      preBoot: (game) => {
        // Pass initial data to GameScene
        game.registry.set('initialGameState', config.gameState);
        game.registry.set('onRegionTap', config.onRegionTap);
      },
    },
  });
}
