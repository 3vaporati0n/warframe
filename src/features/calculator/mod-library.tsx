"use client";

import type { ModCardRule, WeaponCategory } from "@/core/model";

import styles from "./mod-library.module.css";

export const MOD_DRAG_TYPE = "application/x-warframe-mod";

interface ModLibraryProps {
  readonly rules: readonly ModCardRule[];
  readonly category?: WeaponCategory;
  readonly onInstall: (modId: string) => void;
}

export function ModLibrary({ rules, category, onInstall }: ModLibraryProps) {
  const visibleRules = category
    ? rules.filter((rule) => rule.category === category)
    : rules;

  return (
    <section className={styles.library} aria-labelledby="mod-library-heading">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>VERIFIED CARD DATA</p>
          <h2 id="mod-library-heading">Mod 库</h2>
        </div>
        <p className={styles.hint}>拖入槽位，或使用安装按钮</p>
      </header>

      <div className={styles.list}>
        {visibleRules.map((rule) => {
          const maxRankValue = rule.rankValues.find(
            (rankValue) => rankValue.rank === rule.maxRank,
          );
          const damageVerified = rule.effects.every(
            (effect) => effect.verification === "verified",
          );

          return (
            <article
              key={rule.modId}
              className={styles.card}
              aria-label={`${rule.name} 库存 Mod`}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData(MOD_DRAG_TYPE, rule.modId);
              }}
            >
              <div className={styles.art} aria-hidden="true">
                <span>图片待验证</span>
              </div>
              <div className={styles.body}>
                <p className={styles.meta}>
                  {rule.rarity.toUpperCase()} · {rule.polarity.toUpperCase()}
                </p>
                <h3>{rule.name}</h3>
                <p className={styles.effect}>
                  +{maxRankValue?.effectPercent ?? 0}% 基础伤害
                </p>
                <p className={styles.status}>
                  最高等级 {rule.maxRank} ·
                  {damageVerified ? " 伤害已验证" : " 伤害未验证"}
                </p>
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => onInstall(rule.modId)}
                    aria-label={`安装 ${rule.name} 到首个空槽`}
                  >
                    安装
                  </button>
                  <a
                    href={rule.sources[0]?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Wiki 来源
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
