// =============================================================================
// DIVINE DOMINION — Headless Monte Carlo Runner
// Runs 1000 games headlessly and writes per-run JSON to playtest-results/.
// Spec: docs/design/test-spec.md §9, §14g
// =============================================================================

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createPRNG } from '../simulation/prng.js';
import { ALL_COMMANDMENTS } from '../config/commandments.js';
import { TIME, ERAS } from '../config/constants.js';
import type { CommandmentId } from '../types/game.js';
import { runGame, type RunConfig, type RunResult } from './run-one-game.js';
import { writeRunResult } from './metrics-collector.js';
import scenarios from '../../docs/design/monte-carlo-scenarios.json' assert { type: 'json' };
import profilesData from './profiles.json' assert { type: 'json' };

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const METRICS_SAMPLE_INTERVAL = 10;

// Archetype commandment presets (10 commandments each)
const ARCHETYPE_COMMANDMENTS: Record<string, CommandmentId[]> = {
  shepherd: [
    'convert_by_example', 'turn_other_cheek', 'share_all_wealth',
    'teach_every_child', 'harmony_with_seasons', 'all_life_sacred',
    'diplomatic_union', 'charity_above_all', 'god_is_silent', 'forgive_and_redeem',
  ],
  judge: [
    'justice_absolute', 'discipline_above_all', 'righteous_defense',
    'sacred_knowledge', 'build_great_works', 'honor_elders',
    'fear_gods_wrath', 'reward_the_strong', 'seek_truth', 'convert_by_example',
  ],
  conqueror: [
    'smite_the_wicked', 'holy_conquest', 'conquer_and_enlighten',
    'fear_gods_wrath', 'dominion_over_nature', 'reward_the_strong',
    'discipline_above_all', 'preach_to_all_lands', 'ends_justify_means', 'sacrifices_please_god',
  ],
};

// Valid commandment IDs (for random selection)
const ALL_COMMANDMENT_IDS = ALL_COMMANDMENTS.map(c => c.id);

// All 3 archetypes
const ARCHETYPES = ['shepherd', 'judge', 'conqueror'] as const;
type Archetype = typeof ARCHETYPES[number];

// All 7 strategy profile IDs
const ALL_STRATEGY_IDS = ['aggressive', 'passive', 'hybrid', 'random', 'optimal', 'degenerate', 'no_input'];
const ACTIVE_STRATEGY_IDS = ALL_STRATEGY_IDS.filter(s => s !== 'no_input');

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function randInt(prng: ReturnType<typeof createPRNG>, min: number, max: number): number {
  return min + Math.floor(prng.next() * (max - min + 1));
}

function randomCommandments(prng: ReturnType<typeof createPRNG>): CommandmentId[] {
  const shuffled = [...ALL_COMMANDMENT_IDS].sort(() => prng.next() - 0.5);
  return shuffled.slice(0, 10) as CommandmentId[];
}

function randomArchetype(prng: ReturnType<typeof createPRNG>): Archetype {
  return ARCHETYPES[randInt(prng, 0, ARCHETYPES.length - 1)];
}

function randomStrategy(prng: ReturnType<typeof createPRNG>, includeNoInput: boolean): string {
  const pool = includeNoInput ? ALL_STRATEGY_IDS : ACTIVE_STRATEGY_IDS;
  return pool[randInt(prng, 0, pool.length - 1)];
}

// -----------------------------------------------------------------------------
// Build run configurations
// -----------------------------------------------------------------------------

function buildRunConfigs(): RunConfig[] {
  const configs: RunConfig[] = [];
  const metaPrng = createPRNG(0xC0FFEE);

  // 1. 20 curated scenarios (from JSON)
  for (const s of scenarios.scenarios) {
    configs.push({
      seed: s.seed,
      archetype: s.archetype,
      commandments: s.commandments as CommandmentId[],
      strategy: s.strategy,
    });
  }

  // 2. 54 specific: 3 seeds × 3 archetypes × 6 strategies (excludes no_input)
  const specificSeeds = [42, 7777, 314159];
  for (const seed of specificSeeds) {
    for (const archetype of ARCHETYPES) {
      for (const strategy of ACTIVE_STRATEGY_IDS) {
        configs.push({
          seed,
          archetype,
          commandments: ARCHETYPE_COMMANDMENTS[archetype] as CommandmentId[],
          strategy,
        });
      }
    }
  }

  // 3. 926 randomized
  while (configs.length < 1000) {
    const seed = randInt(metaPrng, 1, 999999);
    const archetype = randomArchetype(metaPrng);
    const strategy = randomStrategy(metaPrng, true);
    const commandments = randomCommandments(metaPrng);
    configs.push({ seed, archetype, commandments, strategy });
  }

  return configs.slice(0, 1000);
}

// -----------------------------------------------------------------------------
// Validate curated scenario pass (smoke test)
// -----------------------------------------------------------------------------

function validateCuratedScenario(
  result: RunResult,
  scenario: typeof scenarios.scenarios[number],
): { passed: boolean; reason?: string } {
  // We only check 'expected_win_rate' over single runs by checking the outcome.
  // In a single run, we just check the result is within the plausible range.
  // Full win rate validation requires running each curated seed multiple times —
  // here we run each exactly once and check structural validity (no crash, no NaN).
  const pop = result.summary.finalPopulation;
  if (isNaN(pop) || pop < 0) {
    return { passed: false, reason: `Invalid population: ${pop}` };
  }
  if (isNaN(result.summary.finalScienceLevel)) {
    return { passed: false, reason: 'NaN science level' };
  }
  if (!isFinite(result.finalYear)) {
    return { passed: false, reason: 'Non-finite final year' };
  }
  return { passed: true };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function runWorkerBatch(
  workerPath: string,
  inputPath: string,
  outputPath: string,
): Promise<void> {
  const tsxCli = path.resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, workerPath, inputPath, outputPath], {
      stdio: ['ignore', 'pipe', 'inherit'],
      cwd: process.cwd(),
    });
    child.on('error', reject);
    child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`Worker exited ${code}`))));
  });
}

async function main(): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputDir = path.resolve(__dirname, '../../playtest-results');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const configs = buildRunConfigs();
  const concurrency = Math.min(
    8,
    Math.max(1, parseInt(process.env.PLAYTEST_CONCURRENCY ?? String(os.cpus().length), 10) || os.cpus().length),
  );
  const numParallel = configs.length - 20;
  console.log(
    `Running ${configs.length} games (first 20 curated serial, then ${numParallel} in parallel with ${concurrency} workers)...`,
  );

  const resultsByIndex: Map<number, { config: RunConfig; result?: RunResult; error?: string }> = new Map();
  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  // 1. Run first 20 curated scenarios serially and validate
  const curatedCount = Math.min(20, configs.length);
  for (let i = 0; i < curatedCount; i++) {
    const config = configs[i];
    let result: RunResult;
    try {
      result = runGame(config);
    } catch (err) {
      console.error(`Run ${i} (seed=${config.seed}, ${config.strategy}) CRASHED:`, err);
      failed++;
      resultsByIndex.set(i, { config, error: String(err) });
      continue;
    }
    const scenario = scenarios.scenarios[i];
    const validation = validateCuratedScenario(result, scenario);
    if (!validation.passed) {
      console.error(`CURATED SCENARIO FAILED [${scenario.id}]: ${validation.reason}`);
      console.error('Aborting full run. Fix the issue and re-run.');
      process.exit(1);
    }
    resultsByIndex.set(i, { config, result });
    passed++;
    writeRunResult(result, outputDir);
    if ((i + 1) % 5 === 0 || i + 1 === curatedCount) {
      console.log(`  Curated ${i + 1}/${curatedCount} done`);
    }
  }
  if (curatedCount > 0) {
    console.log(`  Curated phase: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  }

  if (configs.length <= 20) {
    console.log(`\nComplete: ${passed} passed, ${failed} failed (${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
    console.log(`Results written to ${outputDir}/`);
    console.log('\nNext: run `npm run playtest:analyze` to check §14d criteria (win rates, pacing, etc.).');
    fs.writeFileSync(
      path.join(outputDir, '_summary.json'),
      JSON.stringify({ totalRuns: configs.length, passed, failed, timestamp: new Date().toISOString() }, null, 2),
    );
    return;
  }

  // 2. Partition remaining configs into concurrency chunks
  const rest = configs.slice(20);
  const chunkSize = Math.ceil(rest.length / concurrency);
  const chunks: { configs: RunConfig[]; startIndex: number }[] = [];
  for (let s = 0; s < rest.length; s += chunkSize) {
    chunks.push({ configs: rest.slice(s, s + chunkSize), startIndex: 20 + s });
  }

  // 3. Run worker for each chunk (log progress as each chunk completes)
  const workerPath = path.resolve(__dirname, 'playtest-worker.ts');
  const tmpDir = path.join(outputDir, '.tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let completedGames = 0;
  await Promise.all(
    chunks.map(async (chunk, wi) => {
      const inputPath = path.join(tmpDir, `in-${wi}.json`);
      const outputPath = path.join(tmpDir, `out-${wi}.json`);
      fs.writeFileSync(inputPath, JSON.stringify(chunk), 'utf8');
      await runWorkerBatch(workerPath, inputPath, outputPath);
      const items: { index: number; config: RunConfig; result?: RunResult; error?: string }[] = JSON.parse(
        fs.readFileSync(outputPath, 'utf8'),
      );
      for (const item of items) {
        resultsByIndex.set(item.index, { config: item.config, result: item.result, error: item.error });
      }
      completedGames += chunk.configs.length;
      console.log(`  Workers: ${completedGames}/${numParallel} games (${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      } catch {
        /* ignore */
      }
    }),
  );

  // 4. Write per-run JSON and count passed/failed
  passed = 0;
  failed = 0;
  for (let i = 0; i < configs.length; i++) {
    const entry = resultsByIndex.get(i);
    if (!entry) continue;
    if (entry.error) {
      failed++;
      if (i >= 20) {
        console.error(`Run ${i} (seed=${entry.config.seed}, ${entry.config.strategy}) CRASHED: ${entry.error}`);
      }
      continue;
    }
    passed++;
    writeRunResult(entry.result!, outputDir);
  }

  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nComplete: ${passed} passed, ${failed} failed (${totalSec}s total)`);
  console.log(`Results written to ${outputDir}/`);
  console.log('\nNext: run `npm run playtest:analyze` to check §14d criteria (win rates, pacing, etc.).');
  console.log('  Failed criteria and which constants to tweak: docs/design/test-spec.md §14e (Fix Playbook).');
  fs.writeFileSync(
    path.join(outputDir, '_summary.json'),
    JSON.stringify(
      { totalRuns: configs.length, passed, failed, durationSeconds: parseFloat(totalSec), timestamp: new Date().toISOString() },
      null,
      2,
    ),
  );
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
