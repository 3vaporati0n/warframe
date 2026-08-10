import { describe, expect, it } from "vitest";

import {
  getAbilityBuffRule,
  getWeaponArcaneRule,
  PRIMARY_MERCILESS_ID,
  ROAR_ID,
} from "./external-modifier-registry";

describe("external modifier registry", () => {
  it("stores Roar as an ability-strength-scaled faction damage bonus", () => {
    expect(getAbilityBuffRule(ROAR_ID)).toMatchObject({
      abilityId: "roar",
      name: "Roar",
      baseEffectPercent: 50,
      multiplierGroup: "faction-damage-additive",
      dataVerification: "verified",
      calculationVerification: "unverified",
      source: {
        url: "https://warframe.fandom.com/wiki/Faction_Damage_Bonus",
        retrievedAt: "2026-08-10",
      },
    });
  });

  it("stores every Primary Merciless rank and the 12-stack boundary", () => {
    expect(getWeaponArcaneRule(PRIMARY_MERCILESS_ID)).toMatchObject({
      arcaneId: "primary-merciless",
      name: "Primary Merciless",
      category: "primary",
      maxRank: 5,
      maxStacks: 12,
      durationSeconds: 4,
      rankValues: [
        { rank: 0, effectPercentPerStack: 5 },
        { rank: 1, effectPercentPerStack: 10 },
        { rank: 2, effectPercentPerStack: 15 },
        { rank: 3, effectPercentPerStack: 20 },
        { rank: 4, effectPercentPerStack: 25 },
        { rank: 5, effectPercentPerStack: 30 },
      ],
      multiplierGroup: "base-damage-additive",
      dataVerification: "verified",
      calculationVerification: "unverified",
      source: {
        url: "https://warframe.fandom.com/wiki/Primary_Merciless",
        retrievedAt: "2026-08-10",
      },
    });
  });

  it("rejects external modifiers outside the published registry", () => {
    expect(getAbilityBuffRule("invented-ability")).toBeUndefined();
    expect(getWeaponArcaneRule("invented-arcane")).toBeUndefined();
  });
});
