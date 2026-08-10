import { slotDrain } from "./capacity";
import {
  getAbilityBuffRule,
  getWeaponArcaneRule,
} from "./external-modifier-registry";
import { getModRule } from "./mod-registry";
import { getWeaponRule } from "./weapon-registry";
import type {
  BuildEvaluation,
  BuildInput,
  BuildIssue,
  BuildSlot,
  FormulaTrace,
  ModCardRule,
  RankValue,
  WikiSourceRef,
} from "./model";

const damageCalculationSource: WikiSourceRef = Object.freeze({
  label: "WARFRAME Wiki Fandom archive — Damage/Calculation",
  url: "https://warframe.fandom.com/wiki/Damage/Calculation",
  retrievedAt: "2026-08-10",
});

const polaritySource: WikiSourceRef = Object.freeze({
  label: "WARFRAME Wiki — Polarity revision 2793391",
  url: "https://wiki.warframe.com/w/Polarity?oldid=2793391",
  retrievedAt: "2026-08-10",
  revisionId: "2793391",
});

function capacityTrace(
  slot: BuildSlot,
  rule: ModCardRule,
  rankValue: RankValue,
  adjustedDrain: number,
): FormulaTrace {
  const baseDrain = rule.rankValues[0]?.rawDrain ?? rankValue.rawDrain;
  const modSource = rule.sources[0];
  const neutral = rule.polarity === "none" || slot.polarity === "none";
  const matching = !neutral && rule.polarity === slot.polarity;
  const expression = matching
    ? `ceil((${baseDrain} + ${rankValue.rank}) / 2) = ${adjustedDrain}`
    : neutral
      ? `${baseDrain} + ${rankValue.rank} = ${adjustedDrain}`
      : `round((${baseDrain} + ${rankValue.rank}) × 1.25) = ${adjustedDrain}`;
  const polarityLabel = matching
    ? "匹配极性倍率"
    : neutral
      ? "无极性倍率"
      : "错配极性倍率";
  const polarityMultiplier = matching ? 0.5 : neutral ? 1 : 1.25;

  return {
    id: `capacity-slot-${slot.index}-${rule.modId}`,
    stage: "capacity",
    expression,
    result: adjustedDrain,
    operands: [
      {
        label: "Rank 0 容量",
        value: baseDrain,
        source: "mod",
        sourceRef: modSource,
      },
      {
        label: "当前等级",
        value: rankValue.rank,
        source: "rank",
        sourceRef: modSource,
      },
      {
        label: polarityLabel,
        value: polarityMultiplier,
        source: "slot",
        sourceRef: polaritySource,
      },
    ],
    source: polaritySource,
    verification: "verified",
  };
}

export function evaluateBuild(input: BuildInput): BuildEvaluation {
  const issues: BuildIssue[] = [];
  const trace: FormulaTrace[] = [];
  const seenModIds = new Set<string>();
  const baseDamageContributions: Array<{
    label: string;
    effectMultiplier: number;
    source: "rank" | "arcane";
    sourceRef: WikiSourceRef;
  }> = [];
  const factionDamageContributions: Array<{
    label: string;
    effectMultiplier: number;
    sourceRef: WikiSourceRef;
  }> = [];
  let usedCapacity = 0;
  const weapon = input.weaponId ? getWeaponRule(input.weaponId) : undefined;

  if (input.weaponId && !weapon) {
    issues.push({
      code: "UNKNOWN_WEAPON",
      message: `未知武器：${input.weaponId}。`,
    });
  }

  for (const slot of input.slots) {
    if (!slot.installedMod) {
      continue;
    }

    const rule = getModRule(slot.installedMod.modId);
    if (!rule) {
      issues.push({
        code: "UNKNOWN_MOD",
        message: `未知 Mod：${slot.installedMod.modId}。`,
        slotIndex: slot.index,
        modId: slot.installedMod.modId,
      });
      continue;
    }

    if (seenModIds.has(rule.modId)) {
      issues.push({
        code: "DUPLICATE_MOD",
        message: `${rule.name} 不能重复安装。`,
        slotIndex: slot.index,
        modId: rule.modId,
      });
      continue;
    }

    if (weapon && rule.category !== weapon.category) {
      issues.push({
        code: "INCOMPATIBLE_MOD",
        message: `${rule.name} 不能安装在 ${weapon.category} 武器上。`,
        slotIndex: slot.index,
        modId: rule.modId,
      });
      continue;
    }

    const rankValue = rule.rankValues.find(
      (candidate) => candidate.rank === slot.installedMod?.rank,
    );
    if (!rankValue) {
      issues.push({
        code: "INVALID_RANK",
        message: `${rule.name} 不支持等级 ${slot.installedMod.rank}。`,
        slotIndex: slot.index,
        modId: rule.modId,
      });
      continue;
    }

    seenModIds.add(rule.modId);
    const adjustedDrain = slotDrain(
      rankValue.rawDrain,
      rule.polarity,
      slot.polarity,
    );
    usedCapacity += adjustedDrain;
    trace.push(capacityTrace(slot, rule, rankValue, adjustedDrain));

    if (rule.effects.some((effect) => effect.kind === "base-damage")) {
      baseDamageContributions.push({
        label: `${rule.name} R${rankValue.rank}`,
        effectMultiplier: rankValue.effectPercent / 100,
        source: "rank",
        sourceRef: rule.sources[0] as WikiSourceRef,
      });
    }

    if (rule.effects.some((effect) => effect.verification !== "verified")) {
      issues.push({
        code: "UNVERIFIED_EFFECT",
        message: `${rule.name} 的伤害效果尚未通过游戏测试，因此未计入最终伤害。`,
        slotIndex: slot.index,
        modId: rule.modId,
      });
    }
  }

  if (usedCapacity > input.capacityLimit) {
    issues.push({
      code: "OVER_CAPACITY",
      message: `已使用容量 ${usedCapacity} 超过上限 ${input.capacityLimit}。`,
    });
  }

  for (const inputArcane of input.weaponArcanes ?? []) {
    if (!inputArcane.active) {
      continue;
    }

    const rule = getWeaponArcaneRule(inputArcane.arcaneId);
    if (!rule) {
      issues.push({
        code: "UNKNOWN_ARCANE",
        message: `未知武器赋能：${inputArcane.arcaneId}。`,
      });
      continue;
    }

    const rankValue = rule.rankValues.find(
      (candidate) => candidate.rank === inputArcane.rank,
    );
    if (!rankValue) {
      issues.push({
        code: "INVALID_ARCANE_RANK",
        message: `${rule.name} 不支持等级 ${inputArcane.rank}。`,
      });
      continue;
    }

    if (
      !Number.isInteger(inputArcane.stacks) ||
      inputArcane.stacks < 0 ||
      inputArcane.stacks > rule.maxStacks
    ) {
      issues.push({
        code: "INVALID_ARCANE_STACKS",
        message: `${rule.name} 的层数必须是 0–${rule.maxStacks} 的整数。`,
      });
      continue;
    }

    if (weapon && rule.category !== weapon.category) {
      issues.push({
        code: "INCOMPATIBLE_ARCANE",
        message: `${rule.name} 不能用于 ${weapon.category} 武器。`,
      });
      continue;
    }

    baseDamageContributions.push({
      label: `${rule.name} R${inputArcane.rank} × ${inputArcane.stacks} 层`,
      effectMultiplier:
        (rankValue.effectPercentPerStack * inputArcane.stacks) / 100,
      source: "arcane",
      sourceRef: rule.source,
    });
    if (rule.calculationVerification !== "verified") {
      issues.push({
        code: "UNVERIFIED_EXTERNAL_EFFECT",
        message: `${rule.name} 的乘区位置尚未通过游戏实测，因此仅计入研究预览。`,
      });
    }
  }

  for (const inputAbility of input.abilityBuffs ?? []) {
    if (!inputAbility.active) {
      continue;
    }

    const rule = getAbilityBuffRule(inputAbility.abilityId);
    if (!rule) {
      issues.push({
        code: "UNKNOWN_ABILITY",
        message: `未知战甲增伤技能：${inputAbility.abilityId}。`,
      });
      continue;
    }

    if (
      !Number.isFinite(inputAbility.abilityStrengthPercent) ||
      inputAbility.abilityStrengthPercent < 0
    ) {
      issues.push({
        code: "INVALID_ABILITY_STRENGTH",
        message: `${rule.name} 的技能强度必须是非负数。`,
      });
      continue;
    }

    factionDamageContributions.push({
      label: `${rule.name} @ ${inputAbility.abilityStrengthPercent}% 强度`,
      effectMultiplier:
        (rule.baseEffectPercent / 100) *
        (inputAbility.abilityStrengthPercent / 100),
      sourceRef: rule.source,
    });
    if (rule.calculationVerification !== "verified") {
      issues.push({
        code: "UNVERIFIED_EXTERNAL_EFFECT",
        message: `${rule.name} 的乘区位置尚未通过游戏实测，因此仅计入研究预览。`,
      });
    }
  }

  let researchPreview: BuildEvaluation["researchPreview"];
  if (weapon) {
      if (weapon.dataVerification !== "verified") {
        issues.push({
          code: "UNVERIFIED_WEAPON_DATA",
          message: `${weapon.name}的基础数据尚未通过结构化快照与游戏实测双重验证。`,
        });
      }

      const bonusMultiplier = baseDamageContributions.reduce(
        (total, contribution) => total + contribution.effectMultiplier,
        0,
      );
      const moddedBaseDamage = Number(
        (weapon.baseDamage * (1 + bonusMultiplier)).toFixed(6),
      );
      const bonusText = baseDamageContributions.length
        ? baseDamageContributions
            .map((contribution) => String(contribution.effectMultiplier))
            .join(" + ")
        : "0";
      const resultText = String(moddedBaseDamage);
      const factionMultiplier = factionDamageContributions.reduce(
        (total, contribution) => total + contribution.effectMultiplier,
        0,
      );
      const damageAfterFaction = Number(
        (moddedBaseDamage * (1 + factionMultiplier)).toFixed(6),
      );

      researchPreview = {
        weaponName: weapon.name,
        baseDamage: weapon.baseDamage,
        moddedBaseDamage,
        ...(factionDamageContributions.length > 0
          ? { damageAfterFaction }
          : {}),
        verification: "unverified",
      };
      trace.push({
        id: `base-damage-research-${weapon.weaponId}`,
        stage: "base-damage",
        multiplierGroup: "base-damage-additive",
        expression: `${weapon.baseDamage} × (1 + ${bonusText}) = ${resultText}`,
        result: moddedBaseDamage,
        operands: [
          {
            label: "武器基础伤害",
            value: weapon.baseDamage,
            source: "weapon",
            sourceRef: weapon.source,
          },
          ...baseDamageContributions.map((contribution) => ({
            label: contribution.label,
            value: contribution.effectMultiplier,
            source: contribution.source,
            sourceRef: contribution.sourceRef,
          })),
        ],
        source: damageCalculationSource,
        verification: "unverified",
      });

      if (factionDamageContributions.length > 0) {
        const factionText = factionDamageContributions
          .map((contribution) => String(contribution.effectMultiplier))
          .join(" + ");
        trace.push({
          id: `faction-damage-research-${weapon.weaponId}`,
          stage: "faction-damage",
          multiplierGroup: "faction-damage-additive",
          expression: `${moddedBaseDamage} × (1 + ${factionText}) = ${damageAfterFaction}`,
          result: damageAfterFaction,
          operands: [
            {
              label: "基础伤害加算区结果",
              value: moddedBaseDamage,
              source: "system",
              sourceRef: damageCalculationSource,
            },
            ...factionDamageContributions.map((contribution) => ({
              label: contribution.label,
              value: contribution.effectMultiplier,
              source: "ability" as const,
              sourceRef: contribution.sourceRef,
            })),
          ],
          source: factionDamageContributions[0]?.sourceRef,
          verification: "unverified",
        });
      }
  }

  const isLegal = !issues.some(
    (issue) =>
      issue.code !== "UNVERIFIED_EFFECT" &&
      issue.code !== "UNVERIFIED_WEAPON_DATA" &&
      issue.code !== "UNVERIFIED_EXTERNAL_EFFECT",
  );

  return {
    capacity: { used: usedCapacity, limit: input.capacityLimit },
    isLegal,
    isComplete: issues.length === 0,
    issues,
    trace,
    ...(researchPreview ? { researchPreview } : {}),
  };
}
