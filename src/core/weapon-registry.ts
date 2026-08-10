import type { WeaponRule } from "./model";

export const KARAK_RESEARCH_ID = "karak-wiki-research";
export const SKANA_RESEARCH_ID = "skana-wiki-research";

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

const skanaResearchFixture: WeaponRule = Object.freeze({
  weaponId: SKANA_RESEARCH_ID,
  name: "Skana（Wiki 研究样本）",
  category: "melee",
  baseDamage: 120,
  damageTypes: Object.freeze({
    impact: 18,
    puncture: 18,
    slash: 84,
  }),
  dataVerification: "unverified",
  source: Object.freeze({
    label: "WARFRAME Wiki — Sword weapon table",
    url: "https://wiki.warframe.com/w/Sword",
    retrievedAt: "2026-08-10",
  }),
});

const weaponRegistry: ReadonlyMap<string, WeaponRule> = new Map([
  [karakResearchFixture.weaponId, karakResearchFixture],
  [skanaResearchFixture.weaponId, skanaResearchFixture],
]);

export function getWeaponRule(weaponId: string): WeaponRule | undefined {
  return weaponRegistry.get(weaponId);
}

export function listWeaponRules(): readonly WeaponRule[] {
  return Object.freeze(Array.from(weaponRegistry.values()));
}
