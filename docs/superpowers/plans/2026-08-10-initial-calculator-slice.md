# Warframe Calculator Initial Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a locally runnable Next.js calculator slice that renders a horizontal Warframe-style Serration card, supports ranks 0–10, places it into a 4×2 slot grid, applies polarity capacity rules, and exposes the exact verified calculation steps without claiming unsupported damage results.

**Architecture:** The App Router UI consumes a framework-independent TypeScript calculation core under `src/core`. Wiki-derived records live in a source-aware registry and are never inferred at runtime. React owns editor state only; all rank, capacity, legality, and formula trace results come from pure core functions shared with future server code.

**Tech Stack:** Node.js 22, Next.js 16.3.0, React 19.2.8, TypeScript 5.9.3, Vitest 4.1.10, Testing Library 16.3.2, jsdom 29.1.1, CSS Modules/global CSS, npm.

## Global Constraints

- Accuracy boundary: a result is `verified` only when structured data, a Wiki formula/source, at least one game observation, and an automated regression case are all present.
- Unsupported or unverified effects never silently contribute zero or an estimated value; they mark the result incomplete and identify the missing evidence.
- The calculation core imports neither React, Next.js, database code, nor browser-only APIs.
- Formula trace data drives both execution and display; explanatory text may not duplicate a separate calculation implementation.
- The initial card uses a neutral graphic surface until the exact Serration card image mapping and reuse rights are verified.
- Every product behavior follows RED → GREEN → REFACTOR. Configuration and package-lock generation are the only non-behavioral setup operations.
- After every five successful file create/edit operations: run the relevant focused test and every quality check currently available, commit with an intentional message, and push `agent/initial-mvp` to GitHub. Once the test harness exists, every later batch runs `npm run check`.
- The fifth file operation in a batch must end at a green boundary; order edits so no commit records an intentionally failing RED state.
- Node.js floor is `>=20.9.0`, matching Next.js 16 requirements; the repository records Node 22 through `.nvmrc`.

---

## File Map

- `package.json`: scripts, runtime dependencies, test and lint dependencies.
- `package-lock.json`: npm-resolved dependency graph.
- `.nvmrc`: Node 22 developer runtime selection.
- `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`: framework and quality configuration.
- `src/test/setup.ts`: Testing Library DOM matchers and global test cleanup.
- `src/core/model.ts`: immutable domain types for polarity, ranks, Mod records, slots, verification, and trace steps.
- `src/core/capacity.ts`: rank drain and polarity-adjusted capacity calculation.
- `src/core/capacity.test.ts`: hand-derived capacity boundary and rank cases.
- `src/core/mod-registry.ts`: source-aware initial Serration record and retrieval functions.
- `src/core/mod-registry.test.ts`: rank table, source status, and unsupported-data behavior.
- `src/core/evaluate-build.ts`: build validation and structured formula trace.
- `src/core/evaluate-build.test.ts`: empty, legal, mismatched-polarity, and incomplete build cases.
- `src/features/calculator/mod-card.tsx`: horizontal card with rank control and capacity/effect labels.
- `src/features/calculator/mod-card.test.tsx`: accessible card rendering and rank-change behavior.
- `src/features/calculator/slot-grid.tsx`: eight-slot editor and installed-card placement.
- `src/features/calculator/slot-grid.test.tsx`: slot labels, placement, replacement prevention, and rank propagation.
- `src/features/calculator/formula-panel.tsx`: executed groups, operands, source, and verification state.
- `src/features/calculator/formula-panel.test.tsx`: complete versus incomplete trace presentation.
- `src/features/calculator/calculator.tsx`: client editor state joining registry, slots, evaluation, and panels.
- `src/features/calculator/calculator.test.tsx`: user-visible vertical slice integration test.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`: runnable page shell and responsive game-like presentation.
- `README.md`: setup, verification commands, current supported scope, data accuracy boundary, and source links.

---

### Task 1: Reproducible Next.js and Test Harness

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.nvmrc`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Interfaces:**
- Consumes: Node.js `>=20.9.0` and npm.
- Produces: `npm run dev`, `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run check`.

- [ ] **Step 1: Create package metadata with pinned direct dependencies**

```json
{
  "name": "warframe-damage-calculator",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=20.9.0" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "check": "npm run test && npm run typecheck && npm run lint"
  },
  "dependencies": {
    "next": "16.3.0",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "7.0.1",
    "@testing-library/react": "16.3.2",
    "@types/node": "26.2.0",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "eslint": "9.39.5",
    "eslint-config-next": "16.3.0",
    "jsdom": "29.1.1",
    "typescript": "5.9.3",
    "vitest": "4.1.10"
  }
}
```

- [ ] **Step 2: Install dependencies and preserve `package-lock.json`**

Run: `npm install`

Expected: exit 0 and a lockfile with lockfile version 3.

- [ ] **Step 3: Add strict TypeScript, Next.js, ESLint, and Vitest configuration**

Configure `@/*` to resolve to `src/*`, use `jsdom`, load `src/test/setup.ts`, and include `src/**/*.test.ts?(x)`.

- [ ] **Step 4: Verify the empty harness**

Run: `npm run typecheck && npm run lint`

Expected: exit 0; Vitest may report no test files until Task 2.

### Task 2: Capacity and Polarity Core

**Files:**
- Create: `src/core/model.ts`
- Create: `src/core/capacity.test.ts`
- Create: `src/core/capacity.ts`

**Interfaces:**
- Produces: `type Polarity = "madurai" | "vazarin" | "naramon" | "zenurik" | "unairu" | "penjaga" | "umbra" | "none"`.
- Produces: `rankDrain(baseDrain: number, rank: number): number`.
- Produces: `slotDrain(rawDrain: number, modPolarity: Polarity, slotPolarity: Polarity): number`.
- Contract: matching non-`none` polarity returns `ceil(rawDrain / 2)`; mismatched non-`none` polarity returns `ceil(rawDrain * 1.25)`; an unpolarized slot returns raw drain.

- [ ] **Step 1: Write failing literal capacity tests**

```ts
expect(rankDrain(4, 8)).toBe(12);
expect(slotDrain(12, "madurai", "madurai")).toBe(6);
expect(slotDrain(13, "madurai", "madurai")).toBe(7);
expect(slotDrain(12, "madurai", "vazarin")).toBe(15);
expect(slotDrain(12, "madurai", "none")).toBe(12);
```

The mutation caught is replacing ceiling with floor, ignoring rank, or treating a mismatch as neutral.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/core/capacity.test.ts`

Expected: FAIL because `capacity.ts` does not exist.

- [ ] **Step 3: Implement minimal validated arithmetic**

Reject negative/non-integer drain and rank with a typed `RangeError`; implement only the three slot states in the interface.

- [ ] **Step 4: Run GREEN and regression check**

Run: `npm test -- src/core/capacity.test.ts && npm run typecheck`

Expected: all capacity cases pass and TypeScript exits 0.

### Task 3: Source-Aware Serration Registry

**Files:**
- Create: `src/core/mod-registry.test.ts`
- Create: `src/core/mod-registry.ts`

**Interfaces:**
- Consumes: `ModCardRule`, `RankValue`, and `VerificationState` from `model.ts`.
- Produces: `getModRule(modId: string): ModCardRule | undefined`.
- Produces: `SERRATION_ID = "serration"`.
- Serration rank effects are explicit literals `15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165`; raw drains are `4..14`.
- Source fields include the Wiki Mod data URL, Serration page URL, snapshot retrieval date, and evidence flags. Until a saved game observation fixture exists, damage contribution state is `unverified`; rank/drain/polarity data may be `verified` independently.

- [ ] **Step 1: Write failing registry tests**

Assert rank 0, rank 8, and rank 10 literals; Madurai polarity; max rank 10; rank 8 raw drain 12; and absence for an unknown ID.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/core/mod-registry.test.ts`

Expected: FAIL because the registry module is absent.

- [ ] **Step 3: Add the minimum immutable record and lookup**

Freeze the exported record and each rank entry. Do not synthesize rank values from maximum rank.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/core/mod-registry.test.ts`

Expected: registry tests pass.

### Task 4: Build Evaluation and Trace

**Files:**
- Create: `src/core/evaluate-build.test.ts`
- Create: `src/core/evaluate-build.ts`

**Interfaces:**
- Consumes: `BuildInput`, `InstalledMod`, `FormulaTrace`, and `BuildEvaluation` from `model.ts`.
- Produces: `evaluateBuild(input: BuildInput): BuildEvaluation`.
- Output includes `capacity.used`, `capacity.limit`, `isLegal`, `isComplete`, `issues`, and ordered `trace` entries.
- Serration rank/capacity can execute while Serration damage remains excluded and emits issue code `UNVERIFIED_EFFECT`.

- [ ] **Step 1: Write failing evaluator tests**

Use hand-derived fixtures for empty slots, Serration R8 in matching Madurai (`used = 6`), mismatch (`used = 15`), over-capacity, duplicate Mod IDs, and an incomplete damage result.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/core/evaluate-build.test.ts`

Expected: FAIL because `evaluateBuild` is absent.

- [ ] **Step 3: Implement validation before calculation**

Reject duplicate IDs and illegal ranks, preserve slot order, calculate capacity, and append trace operands from the same values the evaluator used.

- [ ] **Step 4: Run GREEN and all core tests**

Run: `npm test -- src/core`

Expected: every core test passes.

### Task 5: Horizontal Mod Card

**Files:**
- Create: `src/features/calculator/mod-card.test.tsx`
- Create: `src/features/calculator/mod-card.tsx`

**Interfaces:**
- Props: `{ rule: ModCardRule; rank: number; slotPolarity: Polarity; onRankChange(rank: number): void }`.
- Accessible output: article named for the Mod, rank slider labelled `等级`, effect text, raw capacity, adjusted capacity, polarity, and verification badge.

- [ ] **Step 1: Write failing component tests**

Render Serration R8 in a matching slot and assert `+135% 基础伤害`, `12 → 6`, `8 / 10`, and `未完成验证`. Change the slider to rank 10 and assert callback `10`.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/calculator/mod-card.test.tsx`

Expected: FAIL because the component is absent.

- [ ] **Step 3: Implement the horizontal semantic card**

Use a neutral decorative panel with no incorrect external image. Capacity values must call `rankDrain` and `slotDrain`.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/features/calculator/mod-card.test.tsx`

Expected: card tests pass.

### Task 6: Eight-Slot Grid and Rank Propagation

**Files:**
- Create: `src/features/calculator/slot-grid.test.tsx`
- Create: `src/features/calculator/slot-grid.tsx`

**Interfaces:**
- Props: `{ slots: readonly BuildSlot[]; onInstall(slotIndex: number, modId: string): void; onRankChange(slotIndex: number, rank: number): void }`.
- Initial interaction supports click-to-install as an accessible fallback; pointer drag-and-drop is added only after this behavior is stable.

- [ ] **Step 1: Write failing grid tests**

Assert eight labelled slots, an empty-state install button, one installed Serration card, disabled install into an occupied slot, and rank callback with the correct slot index.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/calculator/slot-grid.test.tsx`

Expected: FAIL because the grid is absent.

- [ ] **Step 3: Implement the minimal grid**

Render slots in index order and reuse `ModCard`; never duplicate capacity logic in the grid.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/features/calculator/slot-grid.test.tsx`

Expected: grid tests pass.

### Task 7: Formula and Verification Panel

**Files:**
- Create: `src/features/calculator/formula-panel.test.tsx`
- Create: `src/features/calculator/formula-panel.tsx`

**Interfaces:**
- Props: `{ evaluation: BuildEvaluation }`.
- Shows capacity trace `ceil((4 + 8) / 2) = 6`, stage, operands, source link, and issue `伤害效果尚未通过游戏测试，因此未计入最终伤害`.

- [ ] **Step 1: Write failing panel tests**

Assert exact numeric trace values, semantic incomplete status, issue text, and a link to the corresponding Wiki source.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/calculator/formula-panel.test.tsx`

Expected: FAIL because the panel is absent.

- [ ] **Step 3: Render structured trace data**

Generate presentation from `evaluation.trace`; do not recalculate or parse formula strings in React.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/features/calculator/formula-panel.test.tsx`

Expected: panel tests pass.

### Task 8: Runnable Calculator Vertical Slice

**Files:**
- Create: `src/features/calculator/calculator.test.tsx`
- Create: `src/features/calculator/calculator.tsx`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

**Interfaces:**
- `Calculator` owns the eight slots, installs Serration at rank 8, changes rank, and reevaluates synchronously.
- `/` renders the calculator with a wide desktop layout and a single-column small-screen fallback.

- [ ] **Step 1: Write failing vertical-slice test**

Install Serration into slot 1, verify `容量 6 / 30`, change to rank 10, verify `容量 7 / 30`, and retain the incomplete damage warning.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/features/calculator/calculator.test.tsx`

Expected: FAIL because `Calculator` is absent.

- [ ] **Step 3: Implement calculator state and page shell**

Use a client component only at the calculator boundary. Keep `layout.tsx` and `page.tsx` as server components.

- [ ] **Step 4: Add responsive visual hierarchy**

Use a dark blue/bronze palette, horizontal cards, visible focus states, 4×2 desktop slots, and no image that purports to be the exact in-game Serration art.

- [ ] **Step 5: Run GREEN, build, and lint**

Run: `npm run check && npm run build`

Expected: tests, typecheck, lint, and production build all exit 0.

### Task 9: Documentation and Browser Acceptance

**Files:**
- Create: `README.md`
- Modify: `docs/superpowers/plans/2026-08-10-initial-calculator-slice.md`

**Interfaces:**
- README documents commands, supported slice, explicit unsupported scope, and primary source URLs.
- Browser acceptance verifies the page at desktop and narrow widths without changing formula expectations.

- [ ] **Step 1: Document reproducible setup and the accuracy boundary**

Include `npm ci`, `npm run dev`, `npm run check`, and `npm run build`. State that damage output is intentionally incomplete until a saved game observation validates Serration's damage rule.

- [ ] **Step 2: Start the app and inspect the real page**

Run: `npm run dev`

Inspect `/` at approximately 1440×900 and 390×844. Verify no overflow hides card controls, keyboard focus is visible, and eight slots remain discoverable.

- [ ] **Step 3: Correct only observed defects and rerun affected tests**

For every behavior defect, add or adjust a failing test first. For purely visual CSS corrections, record the observed viewport symptom in the commit message and rerun the component suite plus build.

- [ ] **Step 4: Final verification**

Run: `npm run check && npm run build && git diff --check && git status -sb`

Expected: all checks exit 0; branch tracks `origin/agent/initial-mvp`; no uncommitted project files remain after the fifth-change commit.

## Acceptance Matrix

| Criterion | Validation | Initial status |
|---|---|---|
| Next.js application starts and builds | `npm run build`, browser load | unverified |
| Capacity and polarity arithmetic is correct | literal Vitest cases including R8 `12 → 6` | unverified |
| Rank 0–10 values are explicit | registry tests for boundaries and R8 | unverified |
| Unsupported damage is not presented as accurate | evaluator and UI tests | unverified |
| Horizontal card and 4×2 grid are usable | Testing Library plus browser inspection | unverified |
| Formula display uses executed trace | evaluator/panel integration assertions | unverified |
| Every five file changes are committed and pushed | change ledger plus `git log`/remote branch | unverified |
