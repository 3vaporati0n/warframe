import type {
  VerificationState,
  WeaponCategory,
  WikiSourceRef,
} from "./model";

export const ROAR_ID = "roar";
export const PRIMARY_MERCILESS_ID = "primary-merciless";

export interface AbilityBuffRule {
  readonly abilityId: string;
  readonly name: string;
  readonly baseEffectPercent: number;
  readonly multiplierGroup: "faction-damage-additive";
  readonly dataVerification: VerificationState;
  readonly calculationVerification: VerificationState;
  readonly source: WikiSourceRef;
}

export interface WeaponArcaneRankValue {
  readonly rank: number;
  readonly effectPercentPerStack: number;
}

export interface WeaponArcaneRule {
  readonly arcaneId: string;
  readonly name: string;
  readonly category: WeaponCategory;
  readonly maxRank: number;
  readonly maxStacks: number;
  readonly durationSeconds: number;
  readonly rankValues: readonly WeaponArcaneRankValue[];
  readonly multiplierGroup: "base-damage-additive";
  readonly dataVerification: VerificationState;
  readonly calculationVerification: VerificationState;
  readonly source: WikiSourceRef;
}

const roar: AbilityBuffRule = Object.freeze({
  abilityId: ROAR_ID,
  name: "Roar",
  baseEffectPercent: 50,
  multiplierGroup: "faction-damage-additive",
  dataVerification: "verified",
  calculationVerification: "unverified",
  source: Object.freeze({
    label: "WARFRAME Wiki Fandom archive — Faction Damage Bonus / Roar",
    url: "https://warframe.fandom.com/wiki/Faction_Damage_Bonus",
    retrievedAt: "2026-08-10",
  }),
});

const primaryMerciless: WeaponArcaneRule = Object.freeze({
  arcaneId: PRIMARY_MERCILESS_ID,
  name: "Primary Merciless",
  category: "primary",
  maxRank: 5,
  maxStacks: 12,
  durationSeconds: 4,
  rankValues: Object.freeze([
    Object.freeze({ rank: 0, effectPercentPerStack: 5 }),
    Object.freeze({ rank: 1, effectPercentPerStack: 10 }),
    Object.freeze({ rank: 2, effectPercentPerStack: 15 }),
    Object.freeze({ rank: 3, effectPercentPerStack: 20 }),
    Object.freeze({ rank: 4, effectPercentPerStack: 25 }),
    Object.freeze({ rank: 5, effectPercentPerStack: 30 }),
  ]),
  multiplierGroup: "base-damage-additive",
  dataVerification: "verified",
  calculationVerification: "unverified",
  source: Object.freeze({
    label: "WARFRAME Wiki Fandom archive — Primary Merciless",
    url: "https://warframe.fandom.com/wiki/Primary_Merciless",
    retrievedAt: "2026-08-10",
  }),
});

const abilityRegistry: ReadonlyMap<string, AbilityBuffRule> = new Map([
  [roar.abilityId, roar],
]);

const arcaneRegistry: ReadonlyMap<string, WeaponArcaneRule> = new Map([
  [primaryMerciless.arcaneId, primaryMerciless],
]);

export function getAbilityBuffRule(
  abilityId: string,
): AbilityBuffRule | undefined {
  return abilityRegistry.get(abilityId);
}

export function getWeaponArcaneRule(
  arcaneId: string,
): WeaponArcaneRule | undefined {
  return arcaneRegistry.get(arcaneId);
}
