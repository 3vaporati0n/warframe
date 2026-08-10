import { describe, expect, it } from "vitest";

import type { ModCardRule } from "./model";
import {
  getModRule,
  listModRules,
  PRESSURE_POINT_ID,
  SERRATION_ID,
} from "./mod-registry";

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

  it("lists each published Mod exactly once without exposing registry mutation", () => {
    const published = listModRules();

    expect(published.map((rule) => rule.modId)).toEqual([
      SERRATION_ID,
      PRESSURE_POINT_ID,
    ]);
    expect(Object.isFrozen(published)).toBe(true);
    expect(() =>
      (published as ModCardRule[]).push(published[0] as ModCardRule),
    ).toThrow(TypeError);
    expect(listModRules()).toHaveLength(2);
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

describe("Pressure Point registry entry", () => {
  it("stores the complete Wiki rank table as explicit literals", () => {
    expect(getModRule(PRESSURE_POINT_ID)).toMatchObject({
      modId: "pressure-point",
      name: "Pressure Point",
      category: "melee",
      polarity: "madurai",
      maxRank: 5,
      rankValues: [
        { rank: 0, effectPercent: 20, rawDrain: 4 },
        { rank: 1, effectPercent: 40, rawDrain: 5 },
        { rank: 2, effectPercent: 60, rawDrain: 6 },
        { rank: 3, effectPercent: 80, rawDrain: 7 },
        { rank: 4, effectPercent: 100, rawDrain: 8 },
        { rank: 5, effectPercent: 120, rawDrain: 9 },
      ],
      dataVerification: "verified",
    });
  });

  it("keeps melee damage in the base-damage additive group with a direct source", () => {
    const rule = getModRule(PRESSURE_POINT_ID);

    expect(rule?.effects).toEqual([
      {
        id: "pressure-point-base-damage",
        kind: "base-damage",
        stage: "base-damage",
        multiplierGroup: "base-damage-additive",
        verification: "unverified",
      },
    ]);
    expect(rule?.sources[0]?.url).toBe(
      "https://warframe.fandom.com/wiki/Pressure_Point",
    );
  });

  it("publishes primary and melee Mods exactly once", () => {
    expect(listModRules().map((rule) => rule.modId)).toEqual([
      SERRATION_ID,
      PRESSURE_POINT_ID,
    ]);
  });
});
