"use client";

import { slotDrain } from "@/core/capacity";
import type { ModCardRule, Polarity } from "@/core/model";

import styles from "./mod-card.module.css";

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
    <article className={styles.card} aria-label={`${rule.name} Mod`}>
      <div className={styles.art} aria-hidden="true">
        <span className={styles.artGlyph}>中性图片占位</span>
      </div>
      <div className={styles.body}>
        <header className={styles.header}>
          <p className={styles.rarity}>{rule.rarity.toUpperCase()}</p>
          <h3 className={styles.title}>{rule.name}</h3>
          <span className={styles.status}>{damageVerification}</span>
        </header>
        <p className={styles.effect}>
          伤害效果：+{rankValue.effectPercent}% 基础伤害
        </p>
        <p className={styles.capacity}>
          容量 {rankValue.rawDrain} → {adjustedDrain}
        </p>
        <p className={styles.rankText}>
          等级 {rank} / {rule.maxRank}
        </p>
        <label className={styles.rankControl} htmlFor={`${rule.modId}-rank`}>
          <span>等级</span>
          <input
            id={`${rule.modId}-rank`}
            type="range"
            min={0}
            max={rule.maxRank}
            step={1}
            value={rank}
            onChange={(event) => onRankChange(Number(event.currentTarget.value))}
          />
        </label>
        <a
          className={styles.source}
          href={rule.sources[0]?.url}
          target="_blank"
          rel="noreferrer"
        >
          Wiki 来源
        </a>
      </div>
    </article>
  );
}
