# Initial Calculator Slice Acceptance Record

Date: 2026-08-10
Branch: `agent/initial-mvp`

## Automated evidence

```bash
npm run check
npm run build
```

Latest final result:

- Vitest: 7 test files, 27 tests passed.
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
