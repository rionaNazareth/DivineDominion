// =============================================================================
// DIVINE DOMINION — Metrics Collector
// Collects per-tick metrics and assembles a RunResult for writing to disk.
// Spec: docs/design/test-spec.md §14c
// =============================================================================

import * as fs from 'fs';
import * as path from 'path';
import type {
  GameState,
  TickMetrics,
  RunResult,
  RunSummary,
  PlayerAction,
  CommandmentId,
  EndingType,
} from '../types/game.js';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Sample a TickMetrics snapshot every N ticks to save space. */
export const METRICS_SAMPLE_INTERVAL = 10;

// -----------------------------------------------------------------------------
// Snapshot helpers
// -----------------------------------------------------------------------------

function snapPopulations(state: GameState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [nid, nation] of state.world.nations) {
    let pop = 0;
    for (const rid of nation.regionIds) {
      const region = state.world.regions.get(rid);
      if (region) pop += region.population;
    }
    out[nid] = pop;
  }
  return out;
}

function snapReligionShares(state: GameState): Record<string, number> {
  const totals: Record<string, number> = {};
  let grand = 0;
  for (const region of state.world.regions.values()) {
    for (const ri of region.religiousInfluence) {
      totals[ri.religionId] = (totals[ri.religionId] ?? 0) + ri.strength;
      grand += ri.strength;
    }
  }
  if (grand === 0) return totals;
  const out: Record<string, number> = {};
  for (const [rid, v] of Object.entries(totals)) out[rid] = v / grand;
  return out;
}

function countActiveWars(state: GameState): number {
  const seen = new Set<string>();
  let count = 0;
  for (const nation of state.world.nations.values()) {
    for (const [otherId, rel] of nation.relations) {
      if (rel.atWar) {
        const key = [nation.id, otherId].sort().join(':');
        if (!seen.has(key)) { seen.add(key); count++; }
      }
    }
  }
  return count;
}

// -----------------------------------------------------------------------------
// MetricsCollector class
// -----------------------------------------------------------------------------

/**
 * Stateful collector. Call `onTick()` after every simulation tick.
 * Call `buildRunResult()` at game end to get the final RunResult.
 */
export class MetricsCollector {
  private readonly seed: number;
  private readonly strategy: string;
  private readonly archetype: string;
  private readonly commandments: CommandmentId[];
  private readonly sampleInterval: number;

  private readonly tickMetrics: TickMetrics[] = [];
  private readonly pendingActions: PlayerAction[] = [];

  // Aggregate accumulators
  private warCount = 0;
  private peakHypocrisy = 0;
  private defenseGridYear: number | null = null;
  private religionsSurvivingYear2000 = 0;
  private readonly eventsPerEra: number[] = new Array(12).fill(0);
  private lastActionTick = 0;
  private maxGapBetweenActions = 0;
  private totalInterventions = 0;
  private harbingerActionsReceived = 0;
  private lastWarCount = 0;
  private totalBattles = 0;
  private prevEventCount = 0;

  private readonly eraToIndex: Record<string, number> = {
    renaissance: 0, exploration: 1, enlightenment: 2, revolution: 3,
    industry: 4, empire: 5, atomic: 6, digital: 7,
    signal: 8, revelation: 9, preparation: 10, arrival: 11,
  };

  constructor(opts: {
    seed: number;
    strategy: string;
    archetype: string;
    commandments: CommandmentId[];
    sampleInterval?: number;
  }) {
    this.seed = opts.seed;
    this.strategy = opts.strategy;
    this.archetype = opts.archetype;
    this.commandments = opts.commandments;
    this.sampleInterval = opts.sampleInterval ?? METRICS_SAMPLE_INTERVAL;
  }

  /** Record an action taken this tick (before calling onTick). */
  recordAction(tick: number, action: PlayerAction): void {
    if (action.type !== 'wait') {
      this.pendingActions.push(action);
      const gap = tick - this.lastActionTick;
      if (gap > this.maxGapBetweenActions) this.maxGapBetweenActions = gap;
      this.lastActionTick = tick;
      this.totalInterventions++;
    }
  }

  /** Call after each runSimulationTick() call. */
  onTick(tick: number, state: GameState): void {
    // Update aggregates
    const currentWars = countActiveWars(state);
    if (currentWars > this.lastWarCount) {
      this.warCount += currentWars - this.lastWarCount;
    }
    this.lastWarCount = currentWars;

    this.totalBattles = state.world.armies.size;

    if (state.hypocrisyLevel > this.peakHypocrisy) {
      this.peakHypocrisy = state.hypocrisyLevel;
    }

    if (state.world.alienState?.harbinger) {
      this.harbingerActionsReceived = state.world.alienState.harbinger.actionsLog.length;
    }

    if (
      this.defenseGridYear === null &&
      state.world.scienceProgress.milestonesReached.includes('defense_grid')
    ) {
      this.defenseGridYear = state.world.currentYear;
    }

    if (Math.abs(state.world.currentYear - 2000) < 0.5) {
      let count = 0;
      for (const religion of state.world.religions.values()) {
        let total = 0;
        for (const region of state.world.regions.values()) {
          const ri = region.religiousInfluence.find(r => r.religionId === religion.id);
          if (ri) total += ri.strength;
        }
        if (total > 0) count++;
      }
      this.religionsSurvivingYear2000 = count;
    }

    const eraIdx = this.eraToIndex[state.world.currentEra] ?? 0;
    const newEventCount = state.eventHistory.length;
    const diff = newEventCount - this.prevEventCount;
    if (diff > 0) {
      this.eventsPerEra[eraIdx] = (this.eventsPerEra[eraIdx] ?? 0) + diff;
    }
    this.prevEventCount = newEventCount;

    // Sample per-tick snapshot
    if (tick % this.sampleInterval === 0) {
      const snapshot: TickMetrics = {
        tick,
        gameYear: state.world.currentYear,
        era: state.world.currentEra,
        populations: snapPopulations(state),
        religionShares: snapReligionShares(state),
        warCount: currentWars,
        activeTradeRoutes: Array.from(state.world.tradeRoutes.values()).filter(r => r.isActive).length,
        scienceLevel: state.world.scienceProgress.milestonesReached.length,
        eventsFired: newEventCount,
        playerActions: [...this.pendingActions],
        divineEnergy: state.divineState.energy,
        hypocrisyLevel: state.hypocrisyLevel,
        harbingerBudget: state.world.alienState?.harbinger?.budgetRemaining ?? 0,
        voicesAlive: state.voiceRecords.length,
      };
      this.tickMetrics.push(snapshot);
    }

    // Clear pending actions buffer after snapshot (or always — they belong to this tick window)
    this.pendingActions.length = 0;
  }

  /** Assemble the final RunResult at game end. */
  buildRunResult(opts: {
    outcome: 'win' | 'loss';
    endingType: EndingType;
    finalYear: number;
    totalTicks: number;
    state: GameState;
  }): RunResult {
    const { outcome, endingType, finalYear, totalTicks, state } = opts;

    let finalPopulation = 0;
    for (const region of state.world.regions.values()) finalPopulation += region.population;

    const effects = state.effectiveCommandmentEffects ?? {};
    const positiveKeys = Object.values(effects).filter(v => typeof v === 'number' && (v as number) > 0).length;
    const totalKeys = Object.values(effects).filter(v => typeof v === 'number').length;
    const commandmentSynergyScore = totalKeys > 0 ? positiveKeys / totalKeys : 0;

    const summary: RunSummary = {
      finalPopulation,
      finalScienceLevel: state.world.scienceProgress.milestonesReached.length,
      warCount: this.warCount,
      totalBattles: this.totalBattles,
      religionsSurvivingYear2000: this.religionsSurvivingYear2000,
      eventsPerEra: [...this.eventsPerEra],
      maxGapBetweenPlayerActions: this.maxGapBetweenActions,
      peakHypocrisyLevel: this.peakHypocrisy,
      harbingerActionsReceived: this.harbingerActionsReceived,
      totalDivineInterventions: this.totalInterventions,
      commandmentSynergyScore,
    };

    return {
      seed: this.seed,
      strategy: this.strategy,
      archetype: this.archetype,
      commandments: this.commandments,
      outcome,
      endingType,
      defenseGridYear: this.defenseGridYear,
      finalYear,
      totalTicks,
      metrics: this.tickMetrics,
      summary,
    };
  }
}

// -----------------------------------------------------------------------------
// Schema validation
// -----------------------------------------------------------------------------

/** Validate a RunResult against the §14c schema. Throws on violation. */
export function validateRunResult(result: RunResult): void {
  if (typeof result.seed !== 'number') throw new Error('RunResult.seed must be a number');
  if (typeof result.strategy !== 'string') throw new Error('RunResult.strategy must be a string');
  if (typeof result.archetype !== 'string') throw new Error('RunResult.archetype must be a string');
  if (!Array.isArray(result.commandments)) throw new Error('RunResult.commandments must be an array');
  if (result.outcome !== 'win' && result.outcome !== 'loss') throw new Error('RunResult.outcome must be win|loss');
  if (typeof result.endingType !== 'string') throw new Error('RunResult.endingType must be a string');
  if (typeof result.finalYear !== 'number') throw new Error('RunResult.finalYear must be a number');
  if (typeof result.totalTicks !== 'number') throw new Error('RunResult.totalTicks must be a number');
  if (!Array.isArray(result.metrics)) throw new Error('RunResult.metrics must be an array');
  if (!result.summary || typeof result.summary !== 'object') throw new Error('RunResult.summary must be an object');

  const { summary } = result;
  if (typeof summary.finalPopulation !== 'number' || isNaN(summary.finalPopulation)) {
    throw new Error('RunSummary.finalPopulation must be a finite number');
  }
  if (typeof summary.finalScienceLevel !== 'number') throw new Error('RunSummary.finalScienceLevel must be a number');
  if (!Array.isArray(summary.eventsPerEra) || summary.eventsPerEra.length !== 12) {
    throw new Error('RunSummary.eventsPerEra must be an array of 12 numbers');
  }
}

// -----------------------------------------------------------------------------
// File I/O helpers
// -----------------------------------------------------------------------------

/** Write a validated RunResult to disk. Throws if validation fails. */
export function writeRunResult(result: RunResult, outputDir: string): void {
  validateRunResult(result);
  const filename = `${result.seed}-${result.strategy}-${result.archetype}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf8');
}

/** Read and validate a RunResult from disk. Returns null if invalid. */
export function readRunResult(filepath: string): RunResult | null {
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    const result = JSON.parse(raw) as RunResult;
    validateRunResult(result);
    return result;
  } catch {
    return null;
  }
}
