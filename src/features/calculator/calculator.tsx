"use client";

import { useMemo, useState } from "react";

import {
  installMod as installBuildMod,
  moveMod,
  removeMod,
  setModRank,
  setSlotPolarity,
} from "@/core/edit-build";
import { evaluateBuild } from "@/core/evaluate-build";
import {
  PRIMARY_MERCILESS_ID,
  ROAR_ID,
} from "@/core/external-modifier-registry";
import { getModRule, listModRules } from "@/core/mod-registry";
import type { BuildSlot, Polarity } from "@/core/model";
import {
  getWeaponRule,
  KARAK_RESEARCH_ID,
  listWeaponRules,
} from "@/core/weapon-registry";

import { FormulaPanel } from "./formula-panel";
import { LoadoutControls } from "./loadout-controls";
import { ModLibrary } from "./mod-library";
import { SlotGrid } from "./slot-grid";
import styles from "./calculator.module.css";

const CAPACITY_LIMIT = 30;

function initialSlots(): readonly BuildSlot[] {
  return Array.from({ length: 8 }, (_, index) => ({
    index,
    polarity: index === 0 ? "madurai" : "none",
  }));
}

export function Calculator() {
  const [slots, setSlots] = useState<readonly BuildSlot[]>(initialSlots);
  const [weaponId, setWeaponId] = useState(KARAK_RESEARCH_ID);
  const [roarActive, setRoarActive] = useState(false);
  const [abilityStrengthPercent, setAbilityStrengthPercent] = useState(100);
  const [mercilessActive, setMercilessActive] = useState(false);
  const [mercilessRank, setMercilessRank] = useState(5);
  const [mercilessStacks, setMercilessStacks] = useState(0);
  const selectedWeapon = getWeaponRule(weaponId) ??
    getWeaponRule(KARAK_RESEARCH_ID)!;
  const evaluation = useMemo(
    () =>
      evaluateBuild({
        weaponId,
        capacityLimit: CAPACITY_LIMIT,
        slots,
        abilityBuffs: [
          {
            abilityId: ROAR_ID,
            abilityStrengthPercent,
            active: roarActive,
          },
        ],
        weaponArcanes: [
          {
            arcaneId: PRIMARY_MERCILESS_ID,
            rank: mercilessRank,
            stacks: mercilessStacks,
            active: mercilessActive && selectedWeapon.category === "primary",
          },
        ],
      }),
    [
      abilityStrengthPercent,
      mercilessActive,
      mercilessRank,
      mercilessStacks,
      roarActive,
      selectedWeapon.category,
      slots,
      weaponId,
    ],
  );

  function installMod(slotIndex: number, modId: string): void {
    const rule = getModRule(modId);
    if (!rule || rule.category !== selectedWeapon.category) {
      return;
    }

    setSlots((current) =>
      installBuildMod(current, slotIndex, modId, Math.min(8, rule.maxRank)),
    );
  }

  function installFirstEmpty(modId: string): void {
    const rule = getModRule(modId);
    if (!rule || rule.category !== selectedWeapon.category) {
      return;
    }

    setSlots((current) => {
      const firstEmpty = current.find((slot) => !slot.installedMod);
      return firstEmpty
        ? installBuildMod(
            current,
            firstEmpty.index,
            modId,
            Math.min(8, rule.maxRank),
          )
        : current;
    });
  }

  function changeWeapon(nextWeaponId: string): void {
    if (!getWeaponRule(nextWeaponId)) {
      return;
    }

    setWeaponId(nextWeaponId);
    setSlots(initialSlots());
  }

  function changeRank(slotIndex: number, rank: number): void {
    setSlots((current) => setModRank(current, slotIndex, rank));
  }

  function changePolarity(slotIndex: number, polarity: Polarity): void {
    setSlots((current) => setSlotPolarity(current, slotIndex, polarity));
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>ARSENAL LAB / VERIFIED RULES ONLY</p>
          <h1 className={styles.title}>Warframe 配装实验台</h1>
          <p className={styles.subtitle}>
            {selectedWeapon.category === "primary" ? "主武器" : "近战"} ·{" "}
            {selectedWeapon.name} · 非最终伤害
          </p>
        </div>
        <div className={styles.summary} aria-label="当前配装摘要">
          <p>
            容量 {evaluation.capacity.used} / {evaluation.capacity.limit}
          </p>
          <p>{evaluation.isLegal ? "配装合法" : "配装非法"}</p>
          <p>{evaluation.isComplete ? "结果完整" : "结果不完整"}</p>
        </div>
      </header>

      <LoadoutControls
        weapons={listWeaponRules()}
        weaponId={weaponId}
        weaponCategory={selectedWeapon.category}
        roarActive={roarActive}
        abilityStrengthPercent={abilityStrengthPercent}
        mercilessActive={mercilessActive}
        mercilessRank={mercilessRank}
        mercilessStacks={mercilessStacks}
        onWeaponChange={changeWeapon}
        onRoarActiveChange={setRoarActive}
        onAbilityStrengthChange={setAbilityStrengthPercent}
        onMercilessActiveChange={setMercilessActive}
        onMercilessRankChange={setMercilessRank}
        onMercilessStacksChange={setMercilessStacks}
      />

      <div className={styles.workspace}>
        <div className={styles.slotsPanel}>
          <SlotGrid
            slots={slots}
            onInstall={installMod}
            onDropMod={installMod}
            onMoveMod={(fromIndex, toIndex) =>
              setSlots((current) => moveMod(current, fromIndex, toIndex))
            }
            onRemove={(slotIndex) =>
              setSlots((current) => removeMod(current, slotIndex))
            }
            onRankChange={changeRank}
            onPolarityChange={changePolarity}
          />
        </div>
        <FormulaPanel evaluation={evaluation} />
      </div>
      <ModLibrary
        rules={listModRules()}
        category={selectedWeapon.category}
        onInstall={installFirstEmpty}
      />
    </main>
  );
}
