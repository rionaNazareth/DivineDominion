// =============================================================================
// DIVINE DOMINION — Fix Playbook
// Automated constant-tweak suggestions for failing §14d criteria.
// Spec: docs/design/test-spec.md §14e
// =============================================================================
//
// Rules:
//   - Always adjust constants first
//   - Only adjust formulas if 3 constant tweaks don't fix it
//   - Never change architecture — escalate to human
//   - Max 1 constant change per fix iteration
//   - After each fix, re-run ALL criteria
//
// Usage:
//   tsx src/playtest/fix-playbook.ts [analysisJsonPath]
//   Reads _analysis.json from playtest-results/ (or the provided path),
//   prints the first suggested fix for the first failing criterion.
// =============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CriterionResult {
  id: string;
  metric: string;
  passMin: number | null;
  passMax: number | null;
  actual: number;
  passed: boolean;
  details: string;
}

interface AnalysisJson {
  timestamp: string;
  totalRuns: number;
  passed: number;
  failed: number;
  criteria: CriterionResult[];
}

interface Fix {
  criterionId: string;
  direction: 'too_low' | 'too_high';
  actual: number;
  passMin: number | null;
  passMax: number | null;
  constantPath: string;
  currentValue: string;
  suggestedChange: string;
  stepSize: string;
  rationale: string;
}

// -----------------------------------------------------------------------------
// Fix table (§14e)
// Each entry maps a criterion ID + direction to a fix suggestion.
// -----------------------------------------------------------------------------

function buildFix(criterion: CriterionResult): Fix | null {
  const { id, actual, passMin, passMax } = criterion;
  const tooLow = passMin !== null && actual < passMin;
  const tooHigh = passMax !== null && actual > passMax;
  const direction: 'too_low' | 'too_high' = tooLow ? 'too_low' : 'too_high';

  switch (id) {
    case 'WIN_RATE_PEACE':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'BLESSINGS.*.durationYears',
        currentValue: 'see src/config/constants.ts',
        suggestedChange: 'Increase all BLESSINGS.*.durationYears by +2',
        stepSize: '±2',
        rationale: 'Longer blessings give passive players more staying power → higher win rate.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'BLESSINGS.*.durationYears',
        currentValue: 'see src/config/constants.ts',
        suggestedChange: 'Decrease all BLESSINGS.*.durationYears by -2',
        stepSize: '±2',
        rationale: 'Shorter blessings reduce passive advantage.',
      } : null;

    case 'WIN_RATE_WAR':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'DISASTERS.*.cost',
        currentValue: 'see src/config/constants.ts',
        suggestedChange: 'Decrease all DISASTERS.*.cost by -1 (makes disasters cheaper → more aggressive wins)',
        stepSize: '∓1',
        rationale: 'Cheaper disasters let aggressive players deploy them more → higher war win rate.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'DISASTERS.*.cost',
        currentValue: 'see src/config/constants.ts',
        suggestedChange: 'Increase all DISASTERS.*.cost by +1 (makes disasters more expensive)',
        stepSize: '∓1',
        rationale: 'Pricier disasters limit aggressive players.',
      } : null;

    case 'WIN_RATE_HYBRID':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'WHISPERS.AI_NUDGE_STRENGTH',
        currentValue: '0.15',
        suggestedChange: 'Increase WHISPERS.AI_NUDGE_STRENGTH by +0.02',
        stepSize: '±0.02',
        rationale: 'Stronger whisper nudges help hybrid strategies influence AI nations more effectively.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'WHISPERS.AI_NUDGE_STRENGTH',
        currentValue: '0.15',
        suggestedChange: 'Decrease WHISPERS.AI_NUDGE_STRENGTH by -0.02',
        stepSize: '±0.02',
        rationale: 'Weaker whisper nudges reduce hybrid dominance.',
      } : null;

    case 'WIN_RATE_RANDOM':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'NATIONS.POPULATION_GROWTH_BASE',
        currentValue: '0.005',
        suggestedChange: 'Increase NATIONS.POPULATION_GROWTH_BASE by +0.001',
        stepSize: '±0.001',
        rationale: 'Higher base pop growth gives random strategies a floor of economic strength.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'NATIONS.POPULATION_GROWTH_BASE',
        currentValue: '0.005',
        suggestedChange: 'Decrease NATIONS.POPULATION_GROWTH_BASE by -0.001',
        stepSize: '±0.001',
        rationale: 'Lower base growth reduces random strategy windfalls.',
      } : null;

    case 'WIN_RATE_OPTIMAL':
      return tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'COMBOS.MODIFIER_MIN or COMBOS.MODIFIER_MAX',
        currentValue: 'MODIFIER_MIN=1.3, MODIFIER_MAX=2.0',
        suggestedChange: 'Reduce the strongest combo modifier (COMBOS.MODIFIER_MAX) by -0.1',
        stepSize: '-0.1',
        rationale: 'Cap the strongest combo to prevent optimal play from dominating too heavily.',
      } : null; // tooLow is n/a for this criterion (ceiling only)

    case 'WIN_RATE_NO_INPUT':
      return tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'NATIONS.POPULATION_GROWTH_BASE',
        currentValue: '0.005',
        suggestedChange: 'Decrease NATIONS.POPULATION_GROWTH_BASE by -0.001 (or reduce auto-resolve neutral outcome values in events.ts)',
        stepSize: '-0.001',
        rationale: 'Passive pop growth should not carry no_input players to victory.',
      } : null;

    case 'WIN_ARCHETYPE':
      return tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'CommandmentEffects (config/commandments.ts)',
        currentValue: 'varies per commandment',
        suggestedChange: 'Buff weaker archetype CommandmentEffects values by +0.05 OR nerf dominant archetype by -0.05',
        stepSize: '±0.05',
        rationale: 'Even out archetype win rates by adjusting per-commandment effect magnitudes.',
      } : null;

    case 'PACING_DEADZONE':
      return tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'SPEED.EVENTS_PER_ERA_LATE_MIN',
        currentValue: '6',
        suggestedChange: 'Increase SPEED.EVENTS_PER_ERA_LATE_MIN by +1',
        stepSize: '+1',
        rationale: 'More late-era events reduce the maximum gap between player interactions.',
      } : null;

    case 'PACING_DENSITY':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'SPEED.EVENTS_PER_ERA_LATE_MIN',
        currentValue: '6',
        suggestedChange: 'Increase SPEED.EVENTS_PER_ERA_LATE_MIN by +1 to add more late-era events',
        stepSize: '+1',
        rationale: 'More late events shift the early/late ratio upward.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'SPEED.EVENTS_PER_ERA_EARLY_MAX',
        currentValue: '15',
        suggestedChange: 'Decrease SPEED.EVENTS_PER_ERA_EARLY_MAX by -1 to reduce early event crowding',
        stepSize: '±1',
        rationale: 'Fewer early events reduce the early/late ratio.',
      } : null;

    case 'SCIENCE_PACE':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'DEVELOPMENT.GROWTH_BASE_PER_TICK',
        currentValue: '0.003',
        suggestedChange: 'Increase DEVELOPMENT.GROWTH_BASE_PER_TICK by +0.0005',
        stepSize: '±0.0005',
        rationale: 'Faster development growth means more nations reach the dev level required for defense_grid.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'DEVELOPMENT.GROWTH_BASE_PER_TICK',
        currentValue: '0.003',
        suggestedChange: 'Decrease DEVELOPMENT.GROWTH_BASE_PER_TICK by -0.0005',
        stepSize: '±0.0005',
        rationale: 'Slower dev growth delays defense grid completion.',
      } : null;

    case 'NO_DEGENERATE':
      return tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'COMMANDMENT_STACKING.MODIFIER_CAP_POSITIVE',
        currentValue: '0.75',
        suggestedChange: 'Decrease COMMANDMENT_STACKING.MODIFIER_CAP_POSITIVE by -0.05',
        stepSize: '-0.05',
        rationale: 'Tighter stacking cap prevents degenerate science-rush strategies from snowballing.',
      } : null;

    case 'RELIGION_DIVERSITY':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'RELIGION.DOMINANCE_INERTIA',
        currentValue: '0.60',
        suggestedChange: 'Increase RELIGION.DOMINANCE_INERTIA by +0.05',
        stepSize: '±0.05',
        rationale: 'Higher inertia means dominant religions are harder to displace, preserving diversity.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'RELIGION.DOMINANCE_INERTIA',
        currentValue: '0.60',
        suggestedChange: 'Decrease RELIGION.DOMINANCE_INERTIA by -0.05',
        stepSize: '±0.05',
        rationale: 'Lower inertia allows faster religious displacement.',
      } : null;

    case 'EVENT_IMPACT':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'Event outcome values in src/config/events.ts',
        currentValue: 'varies',
        suggestedChange: 'Increase event outcome magnitudes by +0.02 across all event effects',
        stepSize: '±0.02',
        rationale: 'Larger event effects produce more visible population/dev changes per event choice.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'Event outcome values in src/config/events.ts',
        currentValue: 'varies',
        suggestedChange: 'Decrease event outcome magnitudes by -0.02',
        stepSize: '±0.02',
        rationale: 'Smaller event effects reduce extreme impact swings.',
      } : null;

    case 'COMPLETION':
    case 'POP_BOUNDS':
    case 'DEV_BOUNDS':
      return {
        criterionId: id, direction: 'too_high', actual, passMin, passMax,
        constantPath: 'Code bug — not a constant',
        currentValue: 'n/a',
        suggestedChange: `Fix the crash/NaN/bounds bug in simulation code. actual=${actual} (expected 0).`,
        stepSize: 'n/a',
        rationale: 'This is an invariant violation (code bug). Debug and fix the specific formula or clamp.',
      };

    case 'HARBINGER_BALANCE':
      return tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'HARBINGER.ACTION_COSTS.*',
        currentValue: 'DISCORD=2, CORRUPTION=3, FALSE_MIRACLE=4, PLAGUE_SEED=3, SEVER=2, VEIL=4',
        suggestedChange: 'Increase all HARBINGER.ACTION_COSTS by +1 (reduces harbinger action frequency)',
        stepSize: '±1',
        rationale: 'Pricier harbinger actions mean fewer interventions, reducing % runs where harbinger dominates.',
      } : null;

    case 'VOICE_ENGAGEMENT':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'PETITIONS.COOLDOWN_SEC',
        currentValue: '60',
        suggestedChange: 'Decrease PETITIONS.COOLDOWN_SEC by -10',
        stepSize: '±10',
        rationale: 'More frequent petition offers give players more opportunities to engage.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'PETITIONS.COOLDOWN_SEC',
        currentValue: '60',
        suggestedChange: 'Increase PETITIONS.COOLDOWN_SEC by +10',
        stepSize: '±10',
        rationale: 'Less frequent petitions reduce over-engagement.',
      } : null;

    case 'SCHISM_RATE':
      return tooLow ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'HYPOCRISY.SCHISM_BASE_RISK_PER_TICK',
        currentValue: '0.001',
        suggestedChange: 'Increase HYPOCRISY.SCHISM_BASE_RISK_PER_TICK by +0.0005',
        stepSize: '±0.0005',
        rationale: 'Higher base schism risk means more schisms occur across runs.',
      } : tooHigh ? {
        criterionId: id, direction, actual, passMin, passMax,
        constantPath: 'HYPOCRISY.SCHISM_BASE_RISK_PER_TICK',
        currentValue: '0.001',
        suggestedChange: 'Decrease HYPOCRISY.SCHISM_BASE_RISK_PER_TICK by -0.0005',
        stepSize: '±0.0005',
        rationale: 'Lower base schism risk reduces over-fragmentation.',
      } : null;

    default:
      return null;
  }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function printFix(fix: Fix): void {
  console.log('\n' + '='.repeat(70));
  console.log(`FIX SUGGESTION — ${fix.criterionId}`);
  console.log('='.repeat(70));
  console.log(`  Status:    ${fix.direction === 'too_low' ? 'BELOW minimum' : 'ABOVE maximum'}`);
  console.log(`  Actual:    ${fix.actual.toFixed(3)}`);
  console.log(`  Range:     [${fix.passMin ?? '-∞'}, ${fix.passMax ?? '+∞'}]`);
  console.log(`  Constant:  ${fix.constantPath}`);
  console.log(`  Change:    ${fix.suggestedChange}`);
  console.log(`  Step size: ${fix.stepSize}`);
  console.log(`  Why:       ${fix.rationale}`);
  console.log('='.repeat(70));
  console.log('\nAfter applying this fix: re-run npm run playtest:headless && npm run playtest:analyze');
  console.log('Check ALL criteria again. Only change 1 constant per iteration.');
}

async function main(): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const analysisPath = process.argv[2] ??
    path.resolve(__dirname, '../../playtest-results/_analysis.json');

  if (!fs.existsSync(analysisPath)) {
    console.error(`Analysis file not found: ${analysisPath}`);
    console.error('Run `npm run playtest:analyze` first to generate _analysis.json.');
    process.exit(1);
  }

  const raw = fs.readFileSync(analysisPath, 'utf8');
  let analysis: AnalysisJson;
  try {
    analysis = JSON.parse(raw) as AnalysisJson;
  } catch (err) {
    console.error('Failed to parse analysis JSON:', err);
    process.exit(1);
  }

  const failing = analysis.criteria.filter(c => !c.passed);

  if (failing.length === 0) {
    console.log('\n✓ All §14d criteria PASS. No fixes needed.');
    console.log(`Total runs analyzed: ${analysis.totalRuns}`);
    console.log(`Criteria: ${analysis.passed}/${analysis.criteria.length} passed`);
    return;
  }

  console.log(`\n${failing.length} criterion/criteria failing:`);
  for (const c of failing) {
    const range = `[${c.passMin ?? '-∞'}, ${c.passMax ?? '+∞'}]`;
    const dir = (c.passMin !== null && c.actual < c.passMin) ? 'TOO LOW' : 'TOO HIGH';
    console.log(`  ✗ ${c.id.padEnd(22)} actual=${c.actual.toFixed(3)} ${dir} (range ${range})`);
  }

  // Apply rule: max 1 constant change per iteration — suggest fix for first failing criterion only
  const first = failing[0];
  const fix = buildFix(first);

  if (!fix) {
    console.log(`\nNo automated fix defined for criterion: ${first.id}`);
    console.log('This criterion requires manual investigation or is a code bug.');
    process.exit(1);
  }

  printFix(fix);

  // Write suggested fix to JSON for tooling
  const fixPath = path.resolve(path.dirname(analysisPath), '_suggested-fix.json');
  fs.writeFileSync(fixPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    failingCount: failing.length,
    suggestedFix: fix,
    allFailing: failing.map(c => c.id),
  }, null, 2));
  console.log(`\nSuggested fix written to: ${fixPath}`);

  process.exit(failing.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
