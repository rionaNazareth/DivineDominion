// =============================================================================
// DIVINE DOMINION — Forked worker: runs a batch of games, reads/writes JSON files.
// Invoked by headless-runner with: tsx playtest-worker.ts <input.json> <output.json>
// =============================================================================

import * as fs from 'fs';
import { runGame, type RunConfig, type RunResult } from './run-one-game.js';

interface WorkerInput {
  configs: RunConfig[];
  startIndex: number;
}

interface WorkerOutputItem {
  index: number;
  config: RunConfig;
  result?: RunResult;
  error?: string;
}

function main(): void {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    process.stderr.write('Usage: tsx playtest-worker.ts <input.json> <output.json>\n');
    process.exit(1);
  }

  const input: WorkerInput = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const { configs, startIndex } = input;
  const results: WorkerOutputItem[] = [];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const index = startIndex + i;
    try {
      const result = runGame(config);
      results.push({ index, config, result });
    } catch (err) {
      results.push({ index, config, error: err instanceof Error ? err.message : String(err) });
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(results), 'utf8');
}

main();
