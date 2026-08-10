"use client";

import type { WeaponCategory, WeaponRule } from "@/core/model";

import styles from "./loadout-controls.module.css";

interface LoadoutControlsProps {
  readonly weapons: readonly WeaponRule[];
  readonly weaponId: string;
  readonly weaponCategory: WeaponCategory;
  readonly roarActive: boolean;
  readonly abilityStrengthPercent: number;
  readonly mercilessActive: boolean;
  readonly mercilessRank: number;
  readonly mercilessStacks: number;
  readonly onWeaponChange: (weaponId: string) => void;
  readonly onRoarActiveChange: (active: boolean) => void;
  readonly onAbilityStrengthChange: (strength: number) => void;
  readonly onMercilessActiveChange: (active: boolean) => void;
  readonly onMercilessRankChange: (rank: number) => void;
  readonly onMercilessStacksChange: (stacks: number) => void;
}

export function LoadoutControls({
  weapons,
  weaponId,
  weaponCategory,
  roarActive,
  abilityStrengthPercent,
  mercilessActive,
  mercilessRank,
  mercilessStacks,
  onWeaponChange,
  onRoarActiveChange,
  onAbilityStrengthChange,
  onMercilessActiveChange,
  onMercilessRankChange,
  onMercilessStacksChange,
}: LoadoutControlsProps) {
  const primarySelected = weaponCategory === "primary";

  return (
    <section className={styles.panel} aria-labelledby="loadout-controls-heading">
      <header className={styles.heading}>
        <div>
          <p>RESEARCH CONDITIONS</p>
          <h2 id="loadout-controls-heading">研究条件</h2>
        </div>
        <span>均未计入正式伤害</span>
      </header>

      <div className={styles.grid}>
        <fieldset>
          <legend>武器</legend>
          <label htmlFor="weapon-research-sample">武器研究样本</label>
          <select
            id="weapon-research-sample"
            value={weaponId}
            onChange={(event) => onWeaponChange(event.currentTarget.value)}
          >
            {weapons.map((weapon) => (
              <option key={weapon.weaponId} value={weapon.weaponId}>
                {weapon.name}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend>战甲增伤</legend>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={roarActive}
              onChange={(event) =>
                onRoarActiveChange(event.currentTarget.checked)
              }
            />
            启用 Roar
          </label>
          <label htmlFor="ability-strength">技能强度</label>
          <input
            id="ability-strength"
            type="number"
            min="0"
            step="1"
            value={abilityStrengthPercent}
            onChange={(event) =>
              onAbilityStrengthChange(Number(event.currentTarget.value))
            }
          />
          <p>Roar：派系伤害加算区</p>
        </fieldset>

        <fieldset>
          <legend>武器赋能</legend>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={primarySelected && mercilessActive}
              disabled={!primarySelected}
              onChange={(event) =>
                onMercilessActiveChange(event.currentTarget.checked)
              }
            />
            启用 Primary Merciless
          </label>
          {!primarySelected ? <p>仅适用于主武器</p> : null}
          <label htmlFor="merciless-rank">Primary Merciless 等级</label>
          <select
            id="merciless-rank"
            value={mercilessRank}
            disabled={!primarySelected}
            onChange={(event) =>
              onMercilessRankChange(Number(event.currentTarget.value))
            }
          >
            {Array.from({ length: 6 }, (_, rank) => (
              <option key={rank} value={rank}>
                R{rank}
              </option>
            ))}
          </select>
          <label htmlFor="merciless-stacks">
            Primary Merciless 层数：{mercilessStacks}
          </label>
          <input
            id="merciless-stacks"
            type="range"
            min="0"
            max="12"
            step="1"
            value={mercilessStacks}
            disabled={!primarySelected}
            onChange={(event) =>
              onMercilessStacksChange(Number(event.currentTarget.value))
            }
          />
          <p>基础伤害加算区 · 最多 12 层</p>
        </fieldset>
      </div>
    </section>
  );
}
