"use client";

import { slotDrain } from "@/core/capacity";
import type { ModCardRule, Polarity } from "@/core/model";

interface ModCardProps {
  readonly rule: ModCardRule;
  readonly rank: number;
  readonly slotPolarity: Polarity;
  readonly onRankChange: (rank: number) => void;
}

export function ModCard({
  rule,
  rank,
  slotPolarity,
  onRankChange,
}: ModCardProps) {
  const rankValue = rule.rankValues.find((candidate) => candidate.rank === rank);
  if (!rankValue) {
    throw new RangeError(`${rule.name} does not support rank ${rank}`);
  }

  const adjustedDrain = slotDrain(
    rankValue.rawDrain,
    rule.polarity,
    slotPolarity,
  );
  const damageVerification = rule.effects.some(
    (effect) => effect.verification !== "verified",
  )
    ? "伤害未验证"
    : "伤害已验证";

  return (
    <article aria-label={`${rule.name} Mod`}>
      <div aria-hidden="true">中性图片占位</div>
      <div>
        <header>
          <p>{rule.rarity.toUpperCase()}</p>
          <h3>{rule.name}</h3>
          <span>{damageVerification}</span>
        </header>
        <p>伤害效果：+{rankValue.effectPercent}% 基础伤害</p>
        <p>
          容量 {rankValue.rawDrain} → {adjustedDrain}
        </p>
        <p>
          等级 {rank} / {rule.maxRank}
        </p>
        <label htmlFor={`${rule.modId}-rank`}>等级</label>
        <input
          id={`${rule.modId}-rank`}
          type="range"
          min={0}
          max={rule.maxRank}
          step={1}
          value={rank}
          onChange={(event) => onRankChange(Number(event.currentTarget.value))}
        />
        <a href={rule.sources[0]?.url} target="_blank" rel="noreferrer">
          Wiki 来源
        </a>
      </div>
    </article>
  );
}
