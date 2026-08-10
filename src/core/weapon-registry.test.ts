import { describe, expect, it } from "vitest";

import {
  getWeaponRule,
  KARAK_RESEARCH_ID,
} from "./weapon-registry";

describe("primary weapon research registry", () => {
  it("preserves the literal Karak value from the Wiki worked example", () => {
    expect(getWeaponRule(KARAK_RESEARCH_ID)).toMatchObject({
      weaponId: "karak-wiki-research",
      name: "Karak（Wiki 示例）",
      category: "primary",
      baseDamage: 29,
      dataVerification: "unverified",
      source: {
        label: "WARFRAME Wiki Fandom archive — Calculating Bonuses example",
        url: "https://warframe.fandom.com/wiki/Calculating_Bonuses",
        retrievedAt: "2026-08-10",
      },
    });
  });

  it("does not invent weapons outside the research registry", () => {
    expect(getWeaponRule("invented-weapon")).toBeUndefined();
  });

  it("keeps the published research fixture immutable", () => {
    const weapon = getWeaponRule(KARAK_RESEARCH_ID);

    expect(() => Object.assign(weapon ?? {}, { baseDamage: 999 })).toThrow(
      TypeError,
    );
    expect(getWeaponRule(KARAK_RESEARCH_ID)?.baseDamage).toBe(29);
  });
});
