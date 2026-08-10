"use client";

import { getModRule, SERRATION_ID } from "@/core/mod-registry";
import type { BuildSlot, Polarity } from "@/core/model";

import { ModCard } from "./mod-card";
import { MOD_DRAG_TYPE } from "./mod-library";

export const SLOT_DRAG_TYPE = "text/x-warframe-slot-index";

const polarityOptions: ReadonlyArray<{
  value: Polarity;
  label: string;
}> = [
  { value: "none", label: "无极性" },
  { value: "madurai", label: "Madurai" },
  { value: "vazarin", label: "Vazarin" },
  { value: "naramon", label: "Naramon" },
  { value: "zenurik", label: "Zenurik" },
  { value: "unairu", label: "Unairu" },
  { value: "penjaga", label: "Penjaga" },
  { value: "umbra", label: "Umbra" },
];

interface SlotGridProps {
  readonly slots: readonly BuildSlot[];
  readonly suggestedModId?: string;
  readonly onInstall: (slotIndex: number, modId: string) => void;
  readonly onRankChange: (slotIndex: number, rank: number) => void;
  readonly onDropMod?: (slotIndex: number, modId: string) => void;
  readonly onMoveMod?: (fromIndex: number, toIndex: number) => void;
  readonly onRemove?: (slotIndex: number) => void;
  readonly onPolarityChange?: (
    slotIndex: number,
    polarity: Polarity,
  ) => void;
}

export function SlotGrid({
  slots,
  suggestedModId = SERRATION_ID,
  onInstall,
  onRankChange,
  onDropMod,
  onMoveMod,
  onRemove,
  onPolarityChange,
}: SlotGridProps) {
  const suggestedRule = getModRule(suggestedModId);
  function recognizedDragType(types: readonly string[]): boolean {
    return types.includes(MOD_DRAG_TYPE) || types.includes(SLOT_DRAG_TYPE);
  }

  return (
    <section aria-labelledby="mod-slots-heading">
      <h2 id="mod-slots-heading">Mod 槽位</h2>
      <ol aria-label="8 个普通 Mod 槽位">
        {slots.map((slot, position) => {
          const installed = slot.installedMod;
          const rule = installed ? getModRule(installed.modId) : undefined;
          const previousSlot = slots[position - 1];
          const nextSlot = slots[position + 1];

          return (
            <li
              key={slot.index}
              aria-label={`槽位 ${slot.index + 1}`}
              onDragOver={(event) => {
                if (recognizedDragType(Array.from(event.dataTransfer.types))) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = installed ? "move" : "copy";
                }
              }}
              onDrop={(event) => {
                const types = Array.from(event.dataTransfer.types);
                if (types.includes(SLOT_DRAG_TYPE)) {
                  event.preventDefault();
                  const fromIndex = Number(
                    event.dataTransfer.getData(SLOT_DRAG_TYPE),
                  );
                  if (Number.isInteger(fromIndex)) {
                    onMoveMod?.(fromIndex, slot.index);
                  }
                  return;
                }

                if (!installed && types.includes(MOD_DRAG_TYPE)) {
                  event.preventDefault();
                  const modId = event.dataTransfer.getData(MOD_DRAG_TYPE);
                  if (modId) {
                    (onDropMod ?? onInstall)(slot.index, modId);
                  }
                }
              }}
            >
              <div data-slot-controls="true">
                <label htmlFor={`slot-${slot.index}-polarity`}>
                  槽位 {slot.index + 1} 极性
                </label>
                <select
                  id={`slot-${slot.index}-polarity`}
                  value={slot.polarity}
                  onChange={(event) =>
                    onPolarityChange?.(
                      slot.index,
                      event.currentTarget.value as Polarity,
                    )
                  }
                >
                  {polarityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {installed ? (
                rule ? (
                  <>
                    <div
                      draggable
                      aria-label={`拖动 ${rule.name}（槽位 ${slot.index + 1}）`}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(
                          SLOT_DRAG_TYPE,
                          String(slot.index),
                        );
                      }}
                    >
                      <ModCard
                        rule={rule}
                        rank={installed.rank}
                        slotPolarity={slot.polarity}
                        onRankChange={(rank) => onRankChange(slot.index, rank)}
                      />
                    </div>
                    <div data-card-actions="true">
                      {previousSlot ? (
                        <button
                          type="button"
                          onClick={() =>
                            onMoveMod?.(slot.index, previousSlot.index)
                          }
                          aria-label={`将 ${rule.name} 移到槽位 ${previousSlot.index + 1}`}
                        >
                          ←
                        </button>
                      ) : null}
                      {nextSlot ? (
                        <button
                          type="button"
                          onClick={() =>
                            onMoveMod?.(slot.index, nextSlot.index)
                          }
                          aria-label={`将 ${rule.name} 移到槽位 ${nextSlot.index + 1}`}
                        >
                          →
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onRemove?.(slot.index)}
                        aria-label={`移除 ${rule.name}`}
                      >
                        移除
                      </button>
                    </div>
                  </>
                ) : (
                  <p role="alert">未知 Mod：{installed.modId}</p>
                )
              ) : (
                <button
                  type="button"
                  data-empty-slot="true"
                  onClick={() => onInstall(slot.index, suggestedModId)}
                >
                  安装 {suggestedRule?.name ?? suggestedModId} 到槽位{" "}
                  {slot.index + 1}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
