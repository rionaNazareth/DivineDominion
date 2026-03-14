#!/usr/bin/env bash
# =============================================================================
# DIVINE DOMINION — Cross-Stage Consistency Audit
# =============================================================================
# Run after every pipeline stage to catch cross-file value drift.
# Usage: bash scripts/audit-consistency.sh
# Exit code: 0 = all passed, 1 = mismatches found
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONSTANTS_MD="$ROOT/docs/design/constants.md"
CONSTANTS_TS="$ROOT/src/config/constants.ts"
GAME_TS="$ROOT/src/types/game.ts"
ERAS_MD="$ROOT/docs/design/07-eras-and-endgame.md"
COMMANDMENTS_MD="$ROOT/docs/design/03-commandments.md"
RELIGIONS_MD="$ROOT/docs/design/05-religions.md"
POWERS_MD="$ROOT/docs/design/06-divine-powers.md"

FAIL=0
PASS=0
TOTAL=0

check() {
  local desc="$1"
  local result="$2"
  TOTAL=$((TOTAL + 1))
  if [ "$result" = "0" ]; then
    echo "  PASS: $desc"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $desc"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== DIVINE DOMINION Consistency Audit ==="
echo ""

# ---- Check 1: constants.md and constants.ts both exist ----
echo "--- File existence ---"
[ -f "$CONSTANTS_MD" ]; check "constants.md exists" $?
[ -f "$CONSTANTS_TS" ]; check "constants.ts exists" $?
[ -f "$GAME_TS" ]; check "game.ts exists" $?

# ---- Check 2: Key constant values match between .md and .ts ----
echo ""
echo "--- Constant value sync (constants.md vs constants.ts) ---"

check_value() {
  local name="$1"
  local md_val="$2"
  local ts_val="$3"
  if [ "$md_val" = "$ts_val" ]; then
    check "$name: md=$md_val ts=$ts_val" 0
  else
    check "$name: md=$md_val ts=$ts_val — MISMATCH" 1
  fi
}

# Divine Energy
md_start=$(grep -o 'STARTING_ENERGY | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_start=$(grep 'STARTING:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "MISSING")
check_value "DIVINE_ENERGY.STARTING" "$md_start" "$ts_start"

md_max=$(grep -o 'MAX_ENERGY | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_max=$(sed -n '/DIVINE_ENERGY/,/} as const/p' "$CONSTANTS_TS" 2>/dev/null | grep 'MAX:' | grep -o '[0-9]*' | head -1 || echo "MISSING")
check_value "DIVINE_ENERGY.MAX" "$md_max" "$ts_max"

# Era count
md_eras=$(grep -o 'ERA_COUNT | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_eras=$(grep 'ERA_COUNT:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "TIME.ERA_COUNT" "$md_eras" "$ts_eras"

# Nations
md_nmin=$(grep -o 'NATIONS_MIN | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_nmin=$(grep 'NATIONS_MIN:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "WORLD_GEN.NATIONS_MIN" "$md_nmin" "$ts_nmin"

md_nmax=$(grep -o 'NATIONS_MAX | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_nmax=$(grep 'NATIONS_MAX:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "WORLD_GEN.NATIONS_MAX" "$md_nmax" "$ts_nmax"

# Rival religions
md_rmin=$(grep -o 'RIVAL_RELIGIONS_MIN | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_rmin=$(grep 'RIVAL_RELIGIONS_MIN:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "WORLD_GEN.RIVAL_RELIGIONS_MIN" "$md_rmin" "$ts_rmin"

md_rmax=$(grep -o 'RIVAL_RELIGIONS_MAX | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_rmax=$(grep 'RIVAL_RELIGIONS_MAX:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "WORLD_GEN.RIVAL_RELIGIONS_MAX" "$md_rmax" "$ts_rmax"

# Commandments
md_cbase=$(grep -o 'TOTAL_BASE | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_cbase=$(grep 'TOTAL_BASE:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "COMMANDMENTS.TOTAL_BASE" "$md_cbase" "$ts_cbase"

md_ctotal=$(grep -o 'TOTAL_WITH_UNLOCKS | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_ctotal=$(grep 'TOTAL_WITH_UNLOCKS:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "COMMANDMENTS.TOTAL_WITH_UNLOCKS" "$md_ctotal" "$ts_ctotal"

# Win conditions
md_dgn=$(grep -o 'DEFENSE_GRID_NATIONS_REQUIRED | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_dgn=$(grep 'DEFENSE_GRID_NATIONS_REQUIRED:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "WIN.DEFENSE_GRID_NATIONS" "$md_dgn" "$ts_dgn"

md_alien=$(grep -o 'ALIEN_ARRIVAL_YEAR | [0-9]*' "$CONSTANTS_MD" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
ts_alien=$(grep 'ALIEN_ARRIVAL_YEAR:' "$CONSTANTS_TS" 2>/dev/null | grep -o '[0-9]*' || echo "MISSING")
check_value "WIN.ALIEN_ARRIVAL_YEAR" "$md_alien" "$ts_alien"

# ---- Check 3: Science milestone count matches ----
echo ""
echo "--- Science milestone sync ---"

md_milestones=$(sed -n '/## SCIENCE MILESTONES/,/^---$/p' "$CONSTANTS_MD" 2>/dev/null | grep -c '| [0-9]* |' || echo "0")
ts_milestones=$(grep -c "id: '" "$CONSTANTS_TS" 2>/dev/null | head -1 || echo "0")
# constants.ts has milestones + eras with id fields; filter to SCIENCE_MILESTONES section
ts_milestones=$(sed -n '/SCIENCE_MILESTONES/,/\] as const/p' "$CONSTANTS_TS" 2>/dev/null | grep -c "id:" || echo "0")
check_value "Science milestone count" "$md_milestones" "$ts_milestones"

# ---- Check 4: Blessing/disaster count matches ----
echo ""
echo "--- Power count sync ---"

md_blessings=$(sed -n '/## BLESSINGS/,/## /p' "$CONSTANTS_MD" 2>/dev/null | grep -c '| .* | [0-9]' || echo "0")
ts_blessings=$(sed -n '/BLESSINGS/,/} as const/p' "$CONSTANTS_TS" 2>/dev/null | grep -c 'cost:' || echo "0")
check_value "Blessing count" "$md_blessings" "$ts_blessings"

md_disasters=$(sed -n '/## DISASTERS/,/## /p' "$CONSTANTS_MD" 2>/dev/null | grep -c '| .* | [0-9]' || echo "0")
ts_disasters=$(sed -n '/DISASTERS/,/} as const/p' "$CONSTANTS_TS" 2>/dev/null | grep -c 'cost:' || echo "0")
check_value "Disaster count" "$md_disasters" "$ts_disasters"

# ---- Check 5: Era count in constants.ts ----
echo ""
echo "--- Era sync ---"

ts_era_entries=$(sed -n '/^export const ERAS/,/\] as const/p' "$CONSTANTS_TS" 2>/dev/null | grep -c "id:" || echo "0")
check_value "Era entries in constants.ts" "$ts_era_entries" "$ts_eras"

# ---- Summary ----
echo ""
echo "=== AUDIT SUMMARY ==="
echo "Total checks: $TOTAL"
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "STATUS: FAIL — $FAIL mismatches found. Fix before committing."
  exit 1
else
  echo "STATUS: PASS — all checks passed."
  exit 0
fi
