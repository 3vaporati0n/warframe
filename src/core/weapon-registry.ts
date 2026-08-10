import type { WeaponRule } from "./model";

export const KARAK_RESEARCH_ID = "karak-wiki-research";

const karakResearchFixture: WeaponRule = Object.freeze({
  weaponId: KARAK_RESEARCH_ID,
  name: "Karak（Wiki 示例）",
  category: "primary",
  baseDamage: 29,
  dataVerification: "unverified",
  source: Object.freeze({
    label: "WARFRAME Wiki Fandom archive — Calculating Bonuses example",
    url: "https://warframe.fandom.com/wiki/Calculating_Bonuses",
    retrievedAt: "2026-08-10",
  }),
});

const weaponRegistry: ReadonlyMap<string, WeaponRule> = new Map([
  [karakResearchFixture.weaponId, karakResearchFixture],
]);

export function getWeaponRule(weaponId: string): WeaponRule | undefined {
  return weaponRegistry.get(weaponId);
}
