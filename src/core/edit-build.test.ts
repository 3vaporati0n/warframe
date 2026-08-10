import { describe, expect, it } from "vitest";

import type { BuildSlot } from "./model";
import { SERRATION_ID } from "./mod-registry";
import {
  installMod,
  moveMod,
  removeMod,
  setModRank,
  setSlotPolarity,
} from "./edit-build";

function emptySlots(): readonly BuildSlot[] {
  return Array.from({ length: 4 }, (_, index) => ({
    index,
    polarity: index === 0 ? "madurai" : "none",
  }));
}

describe("immutable arsenal editing", () => {
  it("installs a known Mod at the requested valid rank", () => {
    const before = emptySlots();
    const after = installMod(before, 2, SERRATION_ID, 8);

    expect(after).not.toBe(before);
    expect(after[2]?.installedMod).toEqual({ modId: SERRATION_ID, rank: 8 });
    expect(before[2]?.installedMod).toBeUndefined();
  });

  it("moves installed contents while preserving slot identity and polarity", () => {
    const installed = installMod(emptySlots(), 0, SERRATION_ID, 8);
    const moved = moveMod(installed, 0, 3);

    expect(moved[0]).toEqual({ index: 0, polarity: "madurai" });
    expect(moved[3]).toEqual({
      index: 3,
      polarity: "none",
      installedMod: { modId: SERRATION_ID, rank: 8 },
    });
  });

  it("swaps installed contents when the target is occupied", () => {
    const twoInstalled: readonly BuildSlot[] = [
      {
        index: 0,
        polarity: "madurai",
        installedMod: { modId: SERRATION_ID, rank: 8 },
      },
      {
        index: 1,
        polarity: "none",
        installedMod: { modId: "future-mod", rank: 0 },
      },
    ];

    const swapped = moveMod(twoInstalled, 0, 1);

    expect(swapped[0]?.installedMod?.modId).toBe("future-mod");
    expect(swapped[1]?.installedMod?.modId).toBe(SERRATION_ID);
  });

  it("removes a Mod without changing the slot polarity", () => {
    const installed = installMod(emptySlots(), 0, SERRATION_ID, 8);

    expect(removeMod(installed, 0)[0]).toEqual({
      index: 0,
      polarity: "madurai",
    });
  });

  it("changes the selected rank and slot polarity independently", () => {
    const installed = installMod(emptySlots(), 0, SERRATION_ID, 8);
    const ranked = setModRank(installed, 0, 10);
    const polarized = setSlotPolarity(ranked, 1, "vazarin");

    expect(ranked[0]?.installedMod?.rank).toBe(10);
    expect(polarized[1]?.polarity).toBe("vazarin");
  });

  it.each([
    ["unknown Mod", () => installMod(emptySlots(), 0, "invented-mod", 0)],
    ["invalid rank", () => installMod(emptySlots(), 0, SERRATION_ID, 11)],
    ["invalid slot", () => installMod(emptySlots(), 99, SERRATION_ID, 8)],
  ])("preserves the prior state for an %s", (_label, operation) => {
    const before = emptySlots();
    expect(operation()).toEqual(before);
  });

  it("rejects duplicate installation and returns the same array", () => {
    const installed = installMod(emptySlots(), 0, SERRATION_ID, 8);

    expect(installMod(installed, 2, SERRATION_ID, 8)).toBe(installed);
  });

  it("returns the same array for no-op or invalid mutations", () => {
    const before = emptySlots();

    expect(moveMod(before, 0, 0)).toBe(before);
    expect(moveMod(before, -1, 2)).toBe(before);
    expect(removeMod(before, 0)).toBe(before);
    expect(setModRank(before, 0, 8)).toBe(before);
    expect(setSlotPolarity(before, 0, "madurai")).toBe(before);
  });
});
