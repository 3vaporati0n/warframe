import { describe, expect, it } from "vitest";

import { getModRule, SERRATION_ID } from "./mod-registry";

describe("Serration registry entry", () => {
  it("stores every Wiki rank value as an explicit literal", () => {
    const rule = getModRule(SERRATION_ID);

    expect(rule?.rankValues).toEqual([
      { rank: 0, effectPercent: 15, rawDrain: 4 },
      { rank: 1, effectPercent: 30, rawDrain: 5 },
      { rank: 2, effectPercent: 45, rawDrain: 6 },
      { rank: 3, effectPercent: 60, rawDrain: 7 },
      { rank: 4, effectPercent: 75, rawDrain: 8 },
      { rank: 5, effectPercent: 90, rawDrain: 9 },
      { rank: 6, effectPercent: 105, rawDrain: 10 },
      { rank: 7, effectPercent: 120, rawDrain: 11 },
      { rank: 8, effectPercent: 135, rawDrain: 12 },
      { rank: 9, effectPercent: 150, rawDrain: 13 },
      { rank: 10, effectPercent: 165, rawDrain: 14 },
    ]);
  });

  it("exposes the verified card identity without promoting damage verification", () => {
    const rule = getModRule(SERRATION_ID);

    expect(rule).toMatchObject({
      modId: "serration",
      name: "Serration",
      category: "primary",
      rarity: "uncommon",
      polarity: "madurai",
      maxRank: 10,
      dataVerification: "verified",
    });
    expect(rule?.effects).toEqual([
      {
        id: "serration-base-damage",
        kind: "base-damage",
        stage: "base-damage",
        multiplierGroup: "base-damage-additive",
        verification: "unverified",
      },
    ]);
  });

  it("returns undefined for a Mod outside the published registry", () => {
    expect(getModRule("invented-mod")).toBeUndefined();
  });

  it("keeps the published rank table immutable and tied to a permanent Wiki revision", () => {
    const rule = getModRule(SERRATION_ID);

    expect(rule?.sources[0]).toMatchObject({
      revisionId: "2699779",
      url: "https://wiki.warframe.com/w/Serration?oldid=2699779",
    });
    expect(() =>
      Object.assign(rule?.rankValues[8] ?? {}, { rawDrain: 99 }),
    ).toThrow(TypeError);
    expect(rule?.rankValues[8]?.rawDrain).toBe(12);
  });
});
