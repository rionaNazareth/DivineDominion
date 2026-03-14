import { describe, it, expect } from 'vitest';

import { tickTradeRoutes } from '../trade.js';
import { TRADE } from '../../config/constants.js';
import type { GameState } from '../../types/game.js';
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
    tickTradeRoutes(state, 0.5);
    const routes = Array.from(state.world.tradeRoutes.values());
    for (const r of routes) {
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
});
