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
import { listModRules } from "@/core/mod-registry";
import type { BuildSlot, Polarity } from "@/core/model";
import { KARAK_RESEARCH_ID } from "@/core/weapon-registry";

import { FormulaPanel } from "./formula-panel";
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
  const evaluation = useMemo(
    () =>
      evaluateBuild({
        weaponId: KARAK_RESEARCH_ID,
        capacityLimit: CAPACITY_LIMIT,
        slots,
      }),
    [slots],
  );

  function installMod(slotIndex: number, modId: string): void {
    setSlots((current) => installBuildMod(current, slotIndex, modId, 8));
  }

  function installFirstEmpty(modId: string): void {
    setSlots((current) => {
      const firstEmpty = current.find((slot) => !slot.installedMod);
      return firstEmpty
        ? installBuildMod(current, firstEmpty.index, modId, 8)
        : current;
    });
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
            主武器 · Karak Wiki 研究样本 · 非最终伤害
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
      <ModLibrary rules={listModRules()} onInstall={installFirstEmpty} />
    </main>
  );
}
