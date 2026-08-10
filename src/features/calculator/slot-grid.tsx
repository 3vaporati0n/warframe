"use client";

import { getModRule, SERRATION_ID } from "@/core/mod-registry";
import type { BuildSlot } from "@/core/model";

import { ModCard } from "./mod-card";

interface SlotGridProps {
  readonly slots: readonly BuildSlot[];
  readonly onInstall: (slotIndex: number, modId: string) => void;
  readonly onRankChange: (slotIndex: number, rank: number) => void;
}

export function SlotGrid({
  slots,
  onInstall,
  onRankChange,
}: SlotGridProps) {
  return (
    <section aria-labelledby="mod-slots-heading">
      <h2 id="mod-slots-heading">Mod 槽位</h2>
      <ol aria-label="8 个普通 Mod 槽位">
        {slots.map((slot) => {
          const installed = slot.installedMod;
          const rule = installed ? getModRule(installed.modId) : undefined;

          return (
            <li key={slot.index} aria-label={`槽位 ${slot.index + 1}`}>
              {installed ? (
                rule ? (
                  <ModCard
                    rule={rule}
                    rank={installed.rank}
                    slotPolarity={slot.polarity}
                    onRankChange={(rank) => onRankChange(slot.index, rank)}
                  />
                ) : (
                  <p role="alert">未知 Mod：{installed.modId}</p>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => onInstall(slot.index, SERRATION_ID)}
                >
                  安装 Serration 到槽位 {slot.index + 1}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
