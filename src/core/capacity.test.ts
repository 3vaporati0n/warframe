import { describe, expect, it } from "vitest";

import { rankDrain, slotDrain } from "./capacity";

describe("rankDrain", () => {
  it("adds the selected rank to the rank-zero drain", () => {
    expect(rankDrain(4, 0)).toBe(4);
    expect(rankDrain(4, 8)).toBe(12);
    expect(rankDrain(4, 10)).toBe(14);
  });

  it.each([
    ["negative base drain", -1, 0],
    ["fractional base drain", 4.5, 0],
    ["negative rank", 4, -1],
    ["fractional rank", 4, 1.5],
  ])("rejects %s", (_label, baseDrain, rank) => {
    expect(() => rankDrain(baseDrain, rank)).toThrow(RangeError);
  });
});

describe("slotDrain", () => {
  it("halves matching polarities and rounds upward", () => {
    expect(slotDrain(12, "madurai", "madurai")).toBe(6);
    expect(slotDrain(13, "madurai", "madurai")).toBe(7);
  });

  it("adds 25 percent for different polarities and rounds to the nearest integer", () => {
    expect(slotDrain(12, "madurai", "vazarin")).toBe(15);
    expect(slotDrain(13, "madurai", "vazarin")).toBe(16);
  });

  it("leaves drain unchanged when either side is unpolarized", () => {
    expect(slotDrain(12, "madurai", "none")).toBe(12);
    expect(slotDrain(12, "none", "madurai")).toBe(12);
  });

  it.each([-1, 1.5])("rejects invalid raw drain %s", (rawDrain) => {
    expect(() => slotDrain(rawDrain, "madurai", "madurai")).toThrow(
      RangeError,
    );
  });
});
