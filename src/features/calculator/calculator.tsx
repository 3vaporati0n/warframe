"use client";

import { useMemo, useState } from "react";

import { evaluateBuild } from "@/core/evaluate-build";
import type { BuildSlot } from "@/core/model";

import { FormulaPanel } from "./formula-panel";
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
    () => evaluateBuild({ capacityLimit: CAPACITY_LIMIT, slots }),
    [slots],
  );

  function installMod(slotIndex: number, modId: string): void {
    setSlots((current) =>
      current.map((slot) =>
        slot.index === slotIndex && !slot.installedMod
          ? { ...slot, installedMod: { modId, rank: 8 } }
          : slot,
      ),
    );
  }

  function changeRank(slotIndex: number, rank: number): void {
    setSlots((current) =>
      current.map((slot) =>
        slot.index === slotIndex && slot.installedMod
          ? {
              ...slot,
              installedMod: { ...slot.installedMod, rank },
            }
          : slot,
      ),
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>ARSENAL LAB / VERIFIED RULES ONLY</p>
          <h1 className={styles.title}>Warframe 配装实验台</h1>
          <p className={styles.subtitle}>主武器 · 容量与极性纵向切片</p>
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
            onRankChange={changeRank}
          />
        </div>
        <FormulaPanel evaluation={evaluation} />
      </div>
    </main>
  );
}
