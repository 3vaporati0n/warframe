# Arsenal Interaction Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the initial Serration capacity slice into an accessible, game-like primary-weapon Mod workspace with a Mod library, drag/drop and click controls, reordering, removal, rank editing, slot-polarity editing, and an explicitly unverified Wiki-formula research preview.

**Architecture:** Keep all build mutations in pure TypeScript functions so pointer, keyboard, and click interactions share identical rules. React components emit intent only; `Calculator` owns the build state and executes `evaluateBuild`. Damage-formula traces may execute for research visibility, but no unverified value enters a final damage result.

**Tech Stack:** Next.js 16.3.0 App Router, React 19.2.8, TypeScript 5.9.3, native HTML drag-and-drop, CSS Modules, Vitest 4.1.10, Testing Library.

## Global Constraints

- Accuracy is the product boundary: unsupported or unverified mechanics remain excluded from final damage.
- Every formula trace identifies its multiplier group, verification state, and direct source URL.
- Mod cards remain horizontal; unknown or unverified art uses a neutral placeholder rather than an incorrect image.
- Every drag action has an equivalent button/keyboard path.
- Build mutations are immutable and reject duplicate installs without corrupting the previous state.
- Every production behavior follows RED → GREEN → regression verification.
- Commit and push after each cumulative group of five changed files; a final smaller documentation-only batch is allowed.

---

### Task 1: Pure Build Editing Rules

**Files:**
- Create: `src/core/edit-build.test.ts`
- Create: `src/core/edit-build.ts`
- Modify: `src/core/mod-registry.test.ts`
- Modify: `src/core/mod-registry.ts`
- Modify: `docs/superpowers/plans/2026-08-10-arsenal-interaction-slice.md`

**Interfaces:**
- Consumes: `BuildSlot`, `InstalledMod`, `Polarity`, and `getModRule(modId)`.
- Produces: `installMod(slots, slotIndex, modId, rank?)`, `moveMod(slots, fromIndex, toIndex)`, `removeMod(slots, slotIndex)`, `setModRank(slots, slotIndex, rank)`, `setSlotPolarity(slots, slotIndex, polarity)`, and `listModRules()`.

- [x] **Step 1: Write failing immutable-editor tests**

```ts
expect(installMod(emptySlots, 2, SERRATION_ID, 8)[2].installedMod)
  .toEqual({ modId: SERRATION_ID, rank: 8 });
expect(moveMod(installedSlots, 0, 3)[3].installedMod?.modId)
  .toBe(SERRATION_ID);
expect(removeMod(installedSlots, 0)[0].installedMod).toBeUndefined();
expect(setModRank(installedSlots, 0, 10)[0].installedMod?.rank).toBe(10);
expect(setSlotPolarity(emptySlots, 1, "madurai")[1].polarity).toBe("madurai");
expect(installMod(installedSlots, 2, SERRATION_ID, 8)).toBe(installedSlots);
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/core/edit-build.test.ts`
Expected: FAIL because `edit-build.ts` and its exports do not exist.

- [x] **Step 3: Implement the minimal pure functions**

Each function returns the original array for invalid indices, unknown Mods, invalid ranks, occupied install targets, or duplicate Mod IDs. `moveMod` swaps installed contents while preserving slot indices and polarities.

- [x] **Step 4: Expose the read-only Mod registry list**

Add `listModRules(): readonly ModCardRule[]`, returning a frozen copy in registry insertion order. Extend the registry test to assert the returned list contains Serration exactly once and cannot mutate registry state.

- [x] **Step 5: Run GREEN and the core regression suite**

Run: `npm test -- src/core/edit-build.test.ts src/core/mod-registry.test.ts src/core/evaluate-build.test.ts`
Expected: all selected tests pass.

- [ ] **Step 6: Commit and push five changed files**

```bash
git add docs/superpowers/plans/2026-08-10-arsenal-interaction-slice.md src/core/edit-build.test.ts src/core/edit-build.ts src/core/mod-registry.test.ts src/core/mod-registry.ts
git commit -m "feat: add immutable arsenal editing rules"
git push
```

### Task 2: Wiki Formula Research Preview

**Files:**
- Create: `src/core/weapon-registry.test.ts`
- Create: `src/core/weapon-registry.ts`
- Modify: `src/core/model.ts`
- Modify: `src/core/evaluate-build.test.ts`
- Modify: `src/core/evaluate-build.ts`

**Interfaces:**
- Produces: `WeaponRule`, `getWeaponRule(id)`, `KARAK_RESEARCH_ID`, `BuildInput.weaponId`, `BuildEvaluation.researchPreview`.
- `researchPreview` contains `weaponName`, `baseDamage`, `moddedBaseDamage`, and `verification: "unverified"`; it is never a final-damage field.

- [x] **Step 1: Write failing weapon-registry tests**

```ts
expect(getWeaponRule(KARAK_RESEARCH_ID)).toMatchObject({
  name: "Karak（Wiki 示例）",
  baseDamage: 29,
  dataVerification: "unverified",
});
```

The source is the Wiki worked example in `Calculating Bonuses`; the fixture remains unverified because a current structured-data snapshot and saved in-game observation are not both present.

- [x] **Step 2: Run weapon RED**

Run: `npm test -- src/core/weapon-registry.test.ts`
Expected: FAIL because the registry does not exist.

- [x] **Step 3: Implement the minimal frozen weapon fixture and model types**

Add the weapon source URL and retrieval date. Add `weaponId?: string` to `BuildInput`; absence preserves existing capacity-only behavior.

- [x] **Step 4: Write failing evaluator research-preview tests**

```ts
const result = evaluateBuild({
  weaponId: KARAK_RESEARCH_ID,
  capacityLimit: 30,
  slots: [serrationAtRank8],
});
expect(result.researchPreview?.moddedBaseDamage).toBeCloseTo(68.15);
expect(result.researchPreview?.verification).toBe("unverified");
expect(result.isComplete).toBe(false);
expect(result.trace).toContainEqual(expect.objectContaining({
  stage: "base-damage",
  expression: "29 × (1 + 1.35) = 68.15",
  verification: "unverified",
}));
```

- [x] **Step 5: Run evaluator RED**

Run: `npm test -- src/core/evaluate-build.test.ts`
Expected: FAIL because no research preview or base-damage trace is produced.

- [x] **Step 6: Execute only the Wiki formula as an unverified trace**

Sum applicable base-damage bonuses, calculate `baseDamage × (1 + Σ bonuses)`, preserve `UNVERIFIED_EFFECT`, and never set `isComplete` true. Unknown weapon IDs add `UNKNOWN_WEAPON` and do not calculate.

- [x] **Step 7: Run GREEN and commit the second five-file batch**

Run: `npm test -- src/core/weapon-registry.test.ts src/core/evaluate-build.test.ts`
Expected: all selected tests pass.

```bash
git add src/core/weapon-registry.test.ts src/core/weapon-registry.ts src/core/model.ts src/core/evaluate-build.test.ts src/core/evaluate-build.ts
git commit -m "feat: trace unverified primary damage research"
git push
```

### Task 3: Mod Library and Drop Targets

**Files:**
- Create: `src/features/calculator/mod-library.test.tsx`
- Create: `src/features/calculator/mod-library.tsx`
- Create: `src/features/calculator/mod-library.module.css`
- Modify: `src/features/calculator/slot-grid.test.tsx`
- Modify: `src/features/calculator/slot-grid.tsx`

**Interfaces:**
- `ModLibrary` consumes `readonly ModCardRule[]` and emits `onInstall(modId)`; each library item sets `draggable`, writes MIME type `application/x-warframe-mod`, and exposes a click button.
- `SlotGrid` emits `onDropMod(slotIndex, modId)`, `onMoveMod(fromIndex, toIndex)`, `onRemove(slotIndex)`, `onRankChange(slotIndex, rank)`, and `onPolarityChange(slotIndex, polarity)`.

- [x] **Step 1: Write ModLibrary RED tests**

Assert Serration is visible with rarity, polarity, max rank, verification badge, neutral-art label, an install button, and a draggable wrapper whose drag start writes the custom MIME payload.

- [x] **Step 2: Run ModLibrary RED**

Run: `npm test -- src/features/calculator/mod-library.test.tsx`
Expected: FAIL because the component does not exist.

- [x] **Step 3: Implement the horizontal library item and accessible click path**

Do not add remote art yet. Render a neutral art block with `图片待验证` and preserve full text when art is unavailable.

- [x] **Step 4: Write SlotGrid RED tests**

Test a custom-MIME library drop, an installed-card slot move using `text/x-warframe-slot-index`, the remove button, rank callback, and a polarity `<select>` change. Assert an occupied target delegates to `onMoveMod` only for slot payloads.

- [x] **Step 5: Run SlotGrid RED**

Run: `npm test -- src/features/calculator/slot-grid.test.tsx`
Expected: FAIL because the new callbacks and drop behavior do not exist.

- [x] **Step 6: Implement native drop targets and all equivalent controls**

Use `preventDefault()` only for recognized drag types. Keep buttons and labeled selects usable without dragging. Render the installed card wrapper as draggable but keep its rank slider interactive.

- [x] **Step 7: Run GREEN and commit the third five-file batch**

Run: `npm test -- src/features/calculator/mod-library.test.tsx src/features/calculator/slot-grid.test.tsx`
Expected: both component suites pass.

```bash
git add src/features/calculator/mod-library.test.tsx src/features/calculator/mod-library.tsx src/features/calculator/mod-library.module.css src/features/calculator/slot-grid.test.tsx src/features/calculator/slot-grid.tsx
git commit -m "feat: add draggable mod library and editable slots"
git push
```

### Task 4: Calculator Integration and Formula Presentation

**Files:**
- Modify: `src/features/calculator/calculator.test.tsx`
- Modify: `src/features/calculator/calculator.tsx`
- Modify: `src/features/calculator/calculator.module.css`
- Modify: `src/features/calculator/formula-panel.test.tsx`
- Modify: `src/features/calculator/formula-panel.tsx`

**Interfaces:**
- `Calculator` owns immutable slots, selects the Karak research fixture, calls the pure editor functions, and renders `ModLibrary`, `SlotGrid`, and `FormulaPanel` from one evaluation.
- `FormulaPanel` labels `researchPreview` as `研究预览（不计入正式伤害）` and displays multiplier group `基础伤害加算区` plus unverified source state.

- [x] **Step 1: Write the failing end-to-end component test**

Install Serration from the library into slot 1, change R8→R10, change slot polarity Madurai→none, move to slot 2, then remove. Assert capacity changes `6→7→14`, the formula changes `68.15→76.85`, the research warning remains, and capacity returns to zero after removal.

- [x] **Step 2: Run Calculator RED**

Run: `npm test -- src/features/calculator/calculator.test.tsx`
Expected: FAIL because the library and editor integration are absent.

- [x] **Step 3: Integrate the pure editor functions and responsive layout**

Keep `Calculator` as the only state owner. Library click installs into the first empty slot; drop installs into the chosen slot. Invalid operations leave state unchanged and retain the existing visible build.

- [x] **Step 4: Write FormulaPanel RED tests**

Assert the panel shows `29 × (1 + 1.35) = 68.15`, `基础伤害加算区`, `未通过游戏实测`, the Wiki source link, and no label claiming final damage or accurate DPS.

- [x] **Step 5: Run FormulaPanel RED**

Run: `npm test -- src/features/calculator/formula-panel.test.tsx`
Expected: FAIL because research-preview copy and multiplier-group labels are absent.

- [x] **Step 6: Render the executed research trace without promoting it**

Use the evaluator output directly; do not reproduce the arithmetic in React. Style the library below the workspace and keep the 4×2 desktop grid / one-column narrow layout.

- [x] **Step 7: Run GREEN and commit the integration/formula batches**

Run: `npm test -- src/features/calculator/calculator.test.tsx src/features/calculator/formula-panel.test.tsx src/features/calculator/slot-grid.test.tsx`
Expected: all three suites pass.

```bash
git add src/features/calculator/calculator.test.tsx src/features/calculator/calculator.tsx src/features/calculator/calculator.module.css src/features/calculator/slot-grid.test.tsx src/features/calculator/slot-grid.tsx
git commit -m "feat: integrate interactive arsenal research preview"
git add src/features/calculator/formula-panel.test.tsx src/features/calculator/formula-panel.tsx src/features/calculator/formula-panel.module.css README.md docs/superpowers/plans/2026-08-10-arsenal-interaction-slice.md
git commit -m "feat: label unverified damage research preview"
git push
```

### Task 5: Regression, Browser Acceptance, and Evidence

**Files:**
- Modify: `README.md`
- Modify: `docs/validation/2026-08-10-initial-slice-acceptance.md`
- Modify: `docs/superpowers/plans/2026-08-10-arsenal-interaction-slice.md`

**Interfaces:**
- README distinguishes verified capacity from unverified damage research.
- Acceptance evidence records reproducible automated and browser checks.

- [ ] **Step 1: Run the complete automated gate**

Run: `npm run check && npm run build && git diff --check`
Expected: all tests, typecheck, lint, build, and whitespace checks exit 0.

- [ ] **Step 2: Run browser acceptance**

At 1440×900 and 390×844, install by click, edit rank and polarity, move/remove by buttons, then perform one real library-to-slot drag and one slot-to-slot drag. Confirm there is no hidden horizontal overflow, browser console warning/error, or copy that presents research preview as final damage.

- [ ] **Step 3: Record evidence and update documentation**

Document exact observed capacity/formula transitions and the image-policy boundary. Check every completed plan step and update the acceptance matrix with real evidence only.

- [ ] **Step 4: Commit and push the final documentation batch**

```bash
git add README.md docs/validation/2026-08-10-initial-slice-acceptance.md docs/superpowers/plans/2026-08-10-arsenal-interaction-slice.md
git commit -m "docs: record arsenal interaction acceptance"
git push
```

- [ ] **Step 5: Verify remote parity**

Run: `git status -sb && git rev-parse HEAD && git rev-parse @{upstream}`
Expected: clean tracked branch and identical local/upstream SHAs.

## Acceptance Matrix

| Criterion | Validation | Status |
|---|---|---|
| Library supports click and drag installation | Testing Library + browser drag | unverified |
| Installed Mods can move and be removed | pure editor + component + browser tests | unverified |
| Rank and slot polarity stay synchronized with capacity | core/component assertions | unverified |
| Wiki damage formula is visible but never final | evaluator/panel assertions | unverified |
| Duplicate/invalid edits preserve prior state | pure editor boundary tests | unverified |
| Horizontal cards remain usable at desktop and narrow widths | browser acceptance | unverified |
| Each five-file batch is committed and pushed | git log + upstream parity | unverified |

## Self-Review

- Spec coverage: this plan covers the primary-weapon interaction slice, source-visible formula preview, and accessibility fallback. Melee, multiple Mods, verified art, abilities, arcanes, targets, accounts, and public sharing remain later independent plans.
- Placeholder scan: no implementation placeholder or undefined task reference remains.
- Type consistency: all editor callback names, drag MIME types, model fields, and evaluation fields are defined before their UI consumers.
