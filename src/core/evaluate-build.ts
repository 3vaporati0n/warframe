import { slotDrain } from "./capacity";
import { getModRule } from "./mod-registry";
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
  let usedCapacity = 0;

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

  const isLegal = !issues.some(
    (issue) => issue.code !== "UNVERIFIED_EFFECT",
  );

  return {
    capacity: { used: usedCapacity, limit: input.capacityLimit },
    isLegal,
    isComplete: issues.length === 0,
    issues,
    trace,
  };
}
