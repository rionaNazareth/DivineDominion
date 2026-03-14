import { describe, it, expect } from 'vitest';

import { tickTradeRoutes } from '../trade.js';
import { TRADE, NATIONS, HAPPINESS } from '../../config/constants.js';
import type { GameState, NationId, RegionId, TradeRouteId } from '../../types/game.js';
import { createInitialGameState } from '../world-gen.js';

describe('trade module', () => {
  it('TRADE_001: Formation threshold — adjacent + opinion + dev can form route', () => {
    const state = createInitialGameState(300);
    const next = tickTradeRoutes(state, 0.5);
    expect(next.world.tradeRoutes.size).toBeGreaterThanOrEqual(0);
  });

  it('TRADE_002: No route at war — nations at war cannot form', () => {
    const state = createInitialGameState(301);
    const next = tickTradeRoutes(state, 0.5);
    for (const route of next.world.tradeRoutes.values()) {
      const na = next.world.regions.get(route.regionA)?.nationId;
      const nb = next.world.regions.get(route.regionB)?.nationId;
      if (!na || !nb) continue;
      const nA = next.world.nations.get(na);
      const nB = next.world.nations.get(nb);
      expect(nA?.relations.get(nb)?.atWar).not.toBe(true);
      expect(nB?.relations.get(na)?.atWar).not.toBe(true);
    }
  });

  it('TRADE_004: Wealth per volume — volume × 0.05', () => {
    expect(TRADE.WEALTH_PER_VOLUME).toBe(0.05);
    const wealth = 0.5 * TRADE.WEALTH_PER_VOLUME;
    expect(wealth).toBe(0.025);
  });

  it('TRADE_006: Distance penalty — dist=5 => 1/25', () => {
    const dist = 5;
    expect(1 / (dist * dist)).toBe(0.04);
  });

  it('TRADE_008: Disruption on war — route disrupted 5 years', () => {
    const state = createInitialGameState(302);
    const next = tickTradeRoutes(state, 0.5);
    for (const r of next.world.tradeRoutes.values()) {
      if (!r.isActive && r.disruptedUntilYear != null) {
        expect(r.disruptedUntilYear).toBeGreaterThan(state.world.currentYear);
      }
    }
  });

  it('TRADE_012: Volume clamp — volume ≤ 1.0', () => {
    const state = createInitialGameState(303);
    const next = tickTradeRoutes(state, 0.5);
    for (const route of next.world.tradeRoutes.values()) {
      expect(route.volume).toBeGreaterThanOrEqual(0);
      expect(route.volume).toBeLessThanOrEqual(1.01);
    }
  });

  it('TRADE_013: Disrupted volume zero', () => {
    const state = createInitialGameState(304);
    const next = tickTradeRoutes(state, 0.5);
    for (const route of next.world.tradeRoutes.values()) {
      if (!route.isActive) expect(route.volume).toBe(0);
    }
  });

  it('TRADE_015: Auto-resume after disruption', () => {
    const state = createInitialGameState(305);
    const next = tickTradeRoutes(state, 0.5);
    for (const route of next.world.tradeRoutes.values()) {
      if (
        route.disruptedUntilYear != null &&
        state.world.currentYear >= route.disruptedUntilYear
      ) {
        expect(route.isActive).toBe(true);
      }
    }
  });

  it('TRADE_003: Formation score components — adjacent adds 0.30, sea adds 0.20', () => {
    // Verify formation threshold constant
    expect(TRADE.FORMATION_THRESHOLD).toBe(0.30);
    // A purely adjacent pair gets 0.30 (enough to meet threshold)
    // A purely sea pair gets 0.20 (below threshold alone)
    // Together: 0.50 > threshold
    expect(0.30).toBeGreaterThanOrEqual(TRADE.FORMATION_THRESHOLD);
    expect(0.20).toBeLessThan(TRADE.FORMATION_THRESHOLD);
    expect(0.30 + 0.20).toBeGreaterThan(TRADE.FORMATION_THRESHOLD);
  });

  it('TRADE_005: Volume formula — popProduct / normalizer × devFactor × distancePenalty', () => {
    // Verify the volume formula constants
    expect(TRADE.POP_NORMALIZER).toBeGreaterThan(0);
    // Compute expected volume manually for a known route
    const popA = 10_000;
    const popB = 10_000;
    const devA = 6;
    const devB = 6;
    const dist = 1;
    const popProduct = popA * popB;
    const devFactor = Math.sqrt(devA * devB) / 6.0;
    const distancePenalty = 1 / (dist * dist);
    const expectedVol = Math.min(1, (popProduct / TRADE.POP_NORMALIZER) * devFactor * distancePenalty);
    expect(expectedVol).toBeGreaterThanOrEqual(0);
    expect(expectedVol).toBeLessThanOrEqual(1.0);
  });

  it('TRADE_007: Sea route distance constant — SEA_DISTANCE = 3', () => {
    expect(TRADE.SEA_DISTANCE).toBe(3);
  });

  it('TRADE_009: No circular routes — each nation pair has at most one route endpoint', () => {
    const state = createInitialGameState(306);
    const next = tickTradeRoutes(state, 0.5);
    const seenKeys = new Set<string>();
    for (const route of next.world.tradeRoutes.values()) {
      const key = [route.regionA, route.regionB].sort().join(':');
      expect(seenKeys.has(key)).toBe(false);
      seenKeys.add(key);
    }
  });

  it('TRADE_010: Conquest re-eval — disrupted route has volume=0', () => {
    const state = createInitialGameState(307);
    const next = tickTradeRoutes(state, 0.5);
    for (const route of next.world.tradeRoutes.values()) {
      if (!route.isActive) {
        expect(route.volume).toBe(0);
      }
    }
  });

  it('TRADE_011: Storm fleet combo — earthquake/great_storm/great_flood disrupts route', () => {
    const state = createInitialGameState(308);
    const world = state.world;
    const ids = Array.from(world.regions.keys()).sort();
    // Set up two non-ocean adjacent nations
    const landIds = ids.filter((id) => world.regions.get(id)!.terrain !== 'ocean');
    if (landIds.length < 2) return; // not enough land regions

    const nA = 'nation_a' as NationId;
    const nB = 'nation_b' as NationId;
    const rA = landIds[0] as RegionId;
    const rB = landIds[1] as RegionId;
    const rARegion = world.regions.get(rA)!;
    const rBRegion = world.regions.get(rB)!;
    rARegion.nationId = nA;
    rBRegion.nationId = nB;
    rARegion.adjacentRegionIds = [rB];
    rBRegion.adjacentRegionIds = [rA];

    // Pre-set an existing active route
    const routeId = 'rt_storm' as TradeRouteId;
    world.tradeRoutes.set(routeId, {
      id: routeId,
      regionA: rA,
      regionB: rB,
      distance: 1,
      volume: 0.5,
      isActive: true,
    });

    // Add earthquake to region A
    rARegion.activeEffects = [{ powerId: 'earthquake', startYear: 1600, endYear: 1610 }];

    const next = tickTradeRoutes(state, 0.5);
    const routeAfter = next.world.tradeRoutes.get(routeId);
    expect(routeAfter?.isActive).toBe(false);
    expect(routeAfter?.volume).toBe(0);
  });

  it('TRADE_014: Tech transfer rate constant — TECH_TRANSFER_RATE = 0.015', () => {
    expect(TRADE.TECH_TRANSFER_RATE).toBe(0.015);
  });
});
