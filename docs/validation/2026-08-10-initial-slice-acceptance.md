# Initial Calculator Slice Acceptance Record

Date: 2026-08-10
Branch: `agent/initial-mvp`

## Automated evidence

```bash
npm run check
npm run build
```

Latest final result:

- Vitest: 10 test files, 51 tests passed.
- TypeScript: passed with zero errors.
- ESLint: passed with zero warnings or errors.
- Next.js production build: passed; `/` and `/_not-found` were statically generated.

## Browser procedure

1. Start `npm run dev -- --hostname 127.0.0.1`.
2. Open `http://127.0.0.1:3000/` at 1440×900.
3. Confirm the empty 4×2 slot grid and formula panel are visible.
4. Install Serration into slot 1.
5. Confirm the card shows Rank 8, `+135%`, raw drain 12, adjusted drain 6, and unverified damage state.
6. Confirm the summary shows `容量 6 / 30` and the trace shows `ceil((4 + 8) / 2) = 6`.
7. Confirm the trace links operands to Serration revision 2699779 and Polarity revision 2793391.
8. Set the viewport to 390×844 and check for horizontal overflow.
9. Read browser console warnings and errors.

## Browser evidence

| Criterion | Result | Evidence |
|---|---|---|
| Desktop hierarchy | pass | 4×2 grid on the left, formula panel on the right at 1440×900 |
| Installed horizontal card | pass | Serration R8 card rendered horizontally with neutral art placeholder |
| Capacity/formula synchronization | pass | UI showed `6 / 30` and `ceil((4 + 8) / 2) = 6` after installation |
| Accuracy warning | pass | `UNVERIFIED_EFFECT` message remained visible and damage was not reported |
| Narrow layout | pass | 390×844 used one column; `documentWidth === viewportWidth === 390` |
| Browser console | pass | zero warning/error entries |
| Rank event automation | covered by component integration test | Browser-control keyboard injection did not change the range value; Vitest verifies R8→R10, `6→7`, and formula update |

No visual or functional defect requiring a source change was observed in this pass.

## Arsenal interaction iteration

### Automated evidence

```bash
npm run check
npm run build
git diff --check
```

- Pure editor tests cover immutable install, duplicate rejection, move/swap, removal, rank, polarity, and invalid operations.
- Evaluator tests cover the unverified Karak research fixture, unknown weapons, R8 `29 × (1 + 1.35) = 68.15`, and the incomplete-result boundary.
- Component tests dispatch native `dragStart`, `dragOver`, and `drop` events with `application/x-warframe-mod` and `text/x-warframe-slot-index` payloads.
- Calculator integration covers click install, R8→R10, matching→neutral polarity, adjacent button move, removal, and synchronized formula/capacity updates.

### Browser evidence

| Criterion | Result | Evidence |
|---|---|---|
| Empty research state | pass | Karak preview showed `29 × (1 + 0) = 29`, `结果不完整`, and the unverified weapon warning |
| Click installation | pass | Library install changed capacity `0→6` and preview `29→68.15` |
| Polarity editing | pass | Slot 1 Madurai→none changed R8 capacity `6→12` |
| Button reordering | pass | Serration moved from slot 1 to slot 2 while preserving rank and neutral drain |
| Formula provenance | pass | Base-damage group, game-test warning, formula source, weapon operand, and Serration revision were visible |
| Narrow layout | pass | At 390×844, `documentWidth === viewportWidth === 390`; formula and horizontal library card remained readable |
| Drag handler | automated component evidence | Browser controller exposed no drag injection primitive; real DOM drag event handlers passed component tests |

No visual or functional defect requiring a source correction was observed. Remote Git transport timed out temporarily after the fourth local batch, then recovered; all local commits were uploaded without rewriting history.

## Melee, buff, and arcane extension

- Automated gate: 12 test files, 70 tests passed; TypeScript and ESLint passed.
- Production build: Next.js static export succeeded and generated the `/` route.
- Desktop browser: Karak + Serration R8 + Roar at 130% displayed separate base-damage and faction-damage traces.
- Melee browser: switching to Skana reset the primary build, disabled Primary Merciless, filtered the library to Pressure Point, and displayed `120 × (1 + 1.2) = 264`.
- Narrow viewport: at 390×844, `documentWidth`, `bodyWidth`, and `viewportWidth` were all 390 pixels; no horizontal overflow was observed.
- Primary Merciless rank/stack calculation is covered by component and core tests. The browser controller could not synthesize a native range-input value change, so its real-browser pointer path remains a manual acceptance item.
- All damage values remain explicitly labeled as research previews; no final damage or DPS field was introduced.
