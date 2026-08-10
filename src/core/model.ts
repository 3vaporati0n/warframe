export type Polarity =
  | "madurai"
  | "vazarin"
  | "naramon"
  | "zenurik"
  | "unairu"
  | "penjaga"
  | "umbra"
  | "none";

export type VerificationState = "verified" | "unverified" | "unsupported";
export type WeaponCategory = "primary" | "melee";

export interface WikiSourceRef {
  readonly label: string;
  readonly url: string;
  readonly retrievedAt: string;
  readonly revisionId?: string;
}

export interface RankValue {
  readonly rank: number;
  readonly effectPercent: number;
  readonly rawDrain: number;
}

export interface EffectRule {
  readonly id: string;
  readonly kind: "base-damage";
  readonly stage: "base-damage";
  readonly multiplierGroup: "base-damage-additive";
  readonly verification: VerificationState;
}

export interface ModCardRule {
  readonly modId: string;
  readonly name: string;
  readonly category: WeaponCategory;
  readonly rarity: "common" | "uncommon" | "rare" | "legendary";
  readonly polarity: Polarity;
  readonly maxRank: number;
  readonly rankValues: readonly RankValue[];
  readonly effects: readonly EffectRule[];
  readonly sources: readonly WikiSourceRef[];
  readonly dataVerification: VerificationState;
}

export interface WeaponRule {
  readonly weaponId: string;
  readonly name: string;
  readonly category: WeaponCategory;
  readonly baseDamage: number;
  readonly damageTypes?: Readonly<{
    impact: number;
    puncture: number;
    slash: number;
  }>;
  readonly dataVerification: VerificationState;
  readonly source: WikiSourceRef;
}

export interface InstalledMod {
  readonly modId: string;
  readonly rank: number;
}

export interface BuildSlot {
  readonly index: number;
  readonly polarity: Polarity;
  readonly installedMod?: InstalledMod;
}

export interface BuildInput {
  readonly weaponId?: string;
  readonly capacityLimit: number;
  readonly slots: readonly BuildSlot[];
  readonly abilityBuffs?: readonly AbilityBuffInput[];
  readonly weaponArcanes?: readonly WeaponArcaneInput[];
}

export interface AbilityBuffInput {
  readonly abilityId: string;
  readonly abilityStrengthPercent: number;
  readonly active: boolean;
}

export interface WeaponArcaneInput {
  readonly arcaneId: string;
  readonly rank: number;
  readonly stacks: number;
  readonly active: boolean;
}

export interface FormulaOperand {
  readonly label: string;
  readonly value: number;
  readonly source:
    | "weapon"
    | "mod"
    | "rank"
    | "slot"
    | "system"
    | "ability"
    | "arcane";
  readonly sourceRef?: WikiSourceRef;
}

export interface FormulaTrace {
  readonly id: string;
  readonly stage: "capacity" | "base-damage" | "faction-damage";
  readonly multiplierGroup?:
    | "capacity"
    | "base-damage-additive"
    | "faction-damage-additive";
  readonly expression: string;
  readonly result: number;
  readonly operands: readonly FormulaOperand[];
  readonly source?: WikiSourceRef;
  readonly verification: VerificationState;
}

export interface BuildIssue {
  readonly code:
    | "UNKNOWN_WEAPON"
    | "UNVERIFIED_WEAPON_DATA"
    | "UNKNOWN_MOD"
    | "INVALID_RANK"
    | "DUPLICATE_MOD"
    | "INCOMPATIBLE_MOD"
    | "OVER_CAPACITY"
    | "UNVERIFIED_EFFECT"
    | "UNKNOWN_ABILITY"
    | "INVALID_ABILITY_STRENGTH"
    | "UNKNOWN_ARCANE"
    | "INVALID_ARCANE_RANK"
    | "INVALID_ARCANE_STACKS"
    | "INCOMPATIBLE_ARCANE"
    | "UNVERIFIED_EXTERNAL_EFFECT";
  readonly message: string;
  readonly slotIndex?: number;
  readonly modId?: string;
}

export interface DamageResearchPreview {
  readonly weaponName: string;
  readonly baseDamage: number;
  readonly moddedBaseDamage: number;
  readonly damageAfterFaction?: number;
  readonly verification: "unverified";
}

export interface BuildEvaluation {
  readonly capacity: {
    readonly used: number;
    readonly limit: number;
  };
  readonly isLegal: boolean;
  readonly isComplete: boolean;
  readonly issues: readonly BuildIssue[];
  readonly trace: readonly FormulaTrace[];
  readonly researchPreview?: DamageResearchPreview;
}
