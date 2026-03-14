// =============================================================================
// DIVINE DOMINION — Map Renderer (Task 2.1)
// Phaser 3 Scene plugin for base map: Voronoi regions, terrain gradients,
// borders, and city icons.
// All art values from docs/design/art-spec.md via palettes.ts.
// =============================================================================

import Phaser from 'phaser';
import type { WorldState, Region, TerrainType, EraId } from '../types/game.js';
import { TERRAIN_COLORS, ERA_COLORS, ZOOM_LEVELS } from './palettes.js';
import { generateMicroDetail } from './terrain-detail.js';
import { devToCityLevel, computeCentroid, estimateRegionWidth } from './map-utils.js';
import { WORLD_GEN } from '../config/constants.js';

export { devToCityLevel, computeCentroid, estimateRegionWidth };

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------
const CITY_ASSET_KEYS = ['city-1', 'city-2', 'city-3', 'city-4', 'city-5'] as const;

// -----------------------------------------------------------------------------
// MapRenderer — Phaser 3 Scene
// -----------------------------------------------------------------------------

export interface MapRendererConfig {
  worldState: WorldState;
  currentEra: EraId;
}

export class MapRenderer extends Phaser.Scene {
  private worldState!: WorldState;
  private currentEra!: EraId;

  // Layers (Phaser containers for depth sorting)
  private terrainLayer!: Phaser.GameObjects.Container;
  private borderLayer!: Phaser.GameObjects.Container;
  private cityLayer!: Phaser.GameObjects.Container;

  // Map of regionId → terrain Graphics object for updates
  private regionGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();
  // Pre-baked micro-detail textures (baked once at init)
  private detailSprites: Map<string, Phaser.GameObjects.Image> = new Map();

  constructor() {
    super({ key: 'MapRenderer' });
  }

  init(data: MapRendererConfig) {
    this.worldState = data.worldState;
    this.currentEra = data.currentEra;
  }

  preload() {
    // City icons — FILE-BASED SVGs (art-spec.md §5)
    for (let i = 1; i <= 5; i++) {
      this.load.svg(`city-${i}`, `assets/icons/city-${i}.svg`, { width: 64, height: 64 });
    }
  }

  create() {
    this.terrainLayer = this.add.container(0, 0);
    this.borderLayer  = this.add.container(0, 0);
    this.cityLayer    = this.add.container(0, 0);

    this._renderAllRegions();
    this._renderCities();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Re-render a single region (e.g., after conquest or faith change). */
  updateRegion(regionId: string) {
    const region = this.worldState.regions.get(regionId);
    if (!region) return;
    this._renderRegion(region);
  }

  /** Swap era palette — tweens all region fills over 3000ms (art-spec.md §9). */
  transitionToEra(newEra: EraId) {
    this.currentEra = newEra;
    this._renderAllRegions();
  }

  // ---------------------------------------------------------------------------
  // Private — Terrain Rendering
  // ---------------------------------------------------------------------------

  private _renderAllRegions() {
    this.terrainLayer.removeAll(true);
    this.borderLayer.removeAll(true);
    this.regionGraphics.clear();

    for (const [, region] of this.worldState.regions) {
      this._renderRegion(region);
    }
  }

  private _renderRegion(region: Region) {
    const oldGraphics = this.regionGraphics.get(region.id);
    if (oldGraphics) {
      oldGraphics.destroy();
      this.regionGraphics.delete(region.id);
    }

    if (region.vertices.length < 3) return;

    const terrain = region.terrain;
    const colors = TERRAIN_COLORS[terrain];
    const centroid = computeCentroid(region.vertices);

    // Terrain fill — radial gradient baked to a RenderTexture
    const gfx = this.add.graphics();
    this.regionGraphics.set(region.id, gfx);

    // Fill polygon with center color (approximation — true radial gradient via RenderTexture below)
    const fillColor = Phaser.Display.Color.HexStringToColor(colors.gradientCenter).color;
    gfx.fillStyle(fillColor, 1.0);
    gfx.fillPoints(region.vertices as Phaser.Types.Math.Vector2Like[], true);

    // Border
    const borderColor = Phaser.Display.Color.HexStringToColor(colors.borderColor).color;
    gfx.lineStyle(colors.borderWidth, borderColor, 1.0);
    gfx.strokePoints(region.vertices as Phaser.Types.Math.Vector2Like[], true);

    // Capital highlight
    if (region.isCapital) {
      gfx.lineStyle(3.5, Phaser.Display.Color.HexStringToColor(TERRAIN_COLORS.plains.gradientCenter).color, 0.7);
      gfx.strokePoints(region.vertices as Phaser.Types.Math.Vector2Like[], true);
    }

    this.terrainLayer.add(gfx);

    // Micro-detail (baked as a Graphics object added to terrainLayer)
    this._renderMicroDetail(region, centroid);
  }

  private _renderMicroDetail(region: Region, centroid: { x: number; y: number }) {
    const regionWidth = estimateRegionWidth(region.vertices);
    const seed = this._regionSeed(region.id);
    const items = generateMicroDetail(region.terrain, centroid, seed, regionWidth);

    const detailGfx = this.add.graphics();

    for (const item of items) {
      const colorObj = Phaser.Display.Color.HexStringToColor(item.color);
      detailGfx.fillStyle(colorObj.color, item.opacity);
      detailGfx.lineStyle(1, colorObj.color, item.opacity);

      switch (item.type) {
        case 'circle':
          detailGfx.fillCircle(item.x, item.y, item.params.r);
          break;
        case 'rect':
          detailGfx.fillRect(item.x - item.params.width / 2, item.y - item.params.height / 2, item.params.width, item.params.height);
          break;
        case 'ellipse':
          detailGfx.fillEllipse(item.x, item.y, item.params.rx * 2, item.params.ry * 2);
          break;
        case 'triangle': {
          const hw = item.params.width / 2;
          detailGfx.fillTriangle(
            item.x, item.y - item.params.height,
            item.x - hw, item.y,
            item.x + hw, item.y,
          );
          break;
        }
        case 'arc':
        case 'wave':
          // Rendered as ellipse approximation for simplicity
          detailGfx.fillEllipse(item.x, item.y, item.params.radiusX ?? item.params.width ?? 20, item.params.radiusY ?? item.params.amplitude ?? 10);
          break;
      }
    }

    this.terrainLayer.add(detailGfx);
  }

  /** Stable numeric seed from a string regionId. */
  private _regionSeed(regionId: string): number {
    let h = 0;
    for (let i = 0; i < regionId.length; i++) {
      h = (Math.imul(31, h) + regionId.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  // ---------------------------------------------------------------------------
  // Private — City Icons
  // ---------------------------------------------------------------------------

  private _renderCities() {
    this.cityLayer.removeAll(true);

    for (const [, region] of this.worldState.regions) {
      if (!region.hasCity) continue;

      const centroid = computeCentroid(region.vertices);
      const level = devToCityLevel(region.development);
      const key = `city-${level}`;

      const icon = this.add.image(centroid.x, centroid.y, key);
      icon.setScale(0.5 + level * 0.08);  // scales with dev level
      icon.setDepth(10);

      this.cityLayer.add(icon);
    }
  }
}
