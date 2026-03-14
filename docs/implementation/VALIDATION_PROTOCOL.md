# Validation Protocol — Simulation Layer Audit

Follow this protocol exactly. This session produces NO code — only a structured report.

---

## Prerequisites

- Sessions 1–5 complete (Phase 0 through Phase 1d).
- All simulation modules exist in `src/simulation/`.
- `npm test` passes.

---

## Checks — Execute Each in Order

### Check A — Constants Integrity

Read `docs/design/constants.md` and `src/config/constants.ts` side by side.

- Every named constant in `constants.md` exists in `constants.ts`
- Every value matches exactly

### Check B — Formula Compliance

For each Deliverable D1–D17 in `docs/design/formulas.md`:

- Find the corresponding module in `src/simulation/`
- Verify each formula step is implemented
- Check coefficient values use constants (not hardcoded)

### Check C — Tick Order

Read `docs/design/formulas.md` Deliverable 1 "Simulation Tick Order" (17 steps).

- Open `src/simulation/runner.ts`
- Verify call sequence matches D1 exactly

### Check D — PRNG Compliance

- Run: `grep -r "Math.random" src/simulation/` — must return 0 results
- Verify mulberry32 in `src/simulation/prng.ts` matches formulas.md "Seeded PRNG Specification"
- Verify entity processing uses sorted IDs

### Check E — Test Coverage

Read `docs/design/test-spec.md` §7.

- For each module: count test IDs in spec vs test cases in code
- Flag any missing test ID

### Check F — Invariant Enforcement

Read `docs/design/test-spec.md` §8 (26 invariants).

- Verify each is enforced in code or tests
- Flag any unenforced invariant

### Check G — API Contract Compliance

Read `docs/design/test-spec.md` §6.

- Verify each exported function signature matches §6
- Flag any mismatch

---

## Output

```
## Validation Report — Simulation Layer Audit

### Summary
- Checks passed: X / 7
- Critical issues: N
- Warnings: M

### Check A — Constants Integrity
- Status: PASS/FAIL
- Issues: [list with file:line, or "none"]

### Check B — Formula Compliance
- Status: PASS/FAIL
- Issues: [list, or "none"]

### Check C — Tick Order
- Status: PASS/FAIL
- Issues: [list, or "none"]

### Check D — PRNG Compliance
- Status: PASS/FAIL
- Issues: [list, or "none"]

### Check E — Test Coverage
- Status: PASS/FAIL
- Missing test IDs: [list, or "none"]

### Check F — Invariant Enforcement
- Status: PASS/FAIL
- Unenforced: [list, or "none"]

### Check G — API Contract Compliance
- Status: PASS/FAIL
- Mismatches: [list, or "none"]

### Fix List
1. [specific fix with file path]
2. ...
```

If all 7 pass: "Simulation layer validated. No fixes needed."

---

## After Validation Passes

When all 7 checks pass (or all fixes have been applied and verified), create the gate file:

Write `docs/session/VALIDATION_V1_COMPLETE.md`:

```markdown
# Validation V1 — Complete

- Date: [today's date]
- Checks passed: 7 / 7
- Fixes applied: [count, or "none needed"]
- Validated by: [model name on work laptop]

The simulation layer has been audited against design specs.
Session 6 may proceed.
```

Commit this file and push. The implementing agent on the personal laptop checks for this file before starting Session 6.
