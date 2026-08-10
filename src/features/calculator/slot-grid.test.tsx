import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BuildSlot } from "@/core/model";

import { SLOT_DRAG_TYPE, SlotGrid } from "./slot-grid";
import { MOD_DRAG_TYPE } from "./mod-library";

function emptySlots(): readonly BuildSlot[] {
  return Array.from({ length: 8 }, (_, index) => ({
    index,
    polarity: index === 0 ? "madurai" : "none",
  }));
}

describe("SlotGrid", () => {
  it("renders eight ordered slots and installs Serration into an empty slot", () => {
    const onInstall = vi.fn();

    render(
      <SlotGrid
        slots={emptySlots()}
        onInstall={onInstall}
        onRankChange={() => undefined}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    const firstSlot = screen.getByRole("listitem", { name: "槽位 1" });
    fireEvent.click(
      within(firstSlot).getByRole("button", {
        name: "安装 Serration 到槽位 1",
      }),
    );

    expect(onInstall).toHaveBeenCalledOnce();
    expect(onInstall).toHaveBeenCalledWith(0, "serration");
  });

  it("renders an installed card, prevents replacement, and propagates its rank", () => {
    const onInstall = vi.fn();
    const onRankChange = vi.fn();
    const slots = emptySlots().map((slot) =>
      slot.index === 0
        ? {
            ...slot,
            installedMod: { modId: "serration", rank: 8 },
          }
        : slot,
    );

    render(
      <SlotGrid
        slots={slots}
        onInstall={onInstall}
        onRankChange={onRankChange}
      />,
    );

    const firstSlot = screen.getByRole("listitem", { name: "槽位 1" });
    expect(
      within(firstSlot).getByRole("article", { name: "Serration Mod" }),
    ).toBeVisible();
    expect(
      within(firstSlot).queryByRole("button", {
        name: "安装 Serration 到槽位 1",
      }),
    ).not.toBeInTheDocument();

    fireEvent.change(within(firstSlot).getByRole("slider", { name: "等级" }), {
      target: { value: "10" },
    });

    expect(onInstall).not.toHaveBeenCalled();
    expect(onRankChange).toHaveBeenCalledOnce();
    expect(onRankChange).toHaveBeenCalledWith(0, 10);
  });

  it("accepts a recognized Mod-library drop on an empty slot", () => {
    const onDropMod = vi.fn();
    const dataTransfer = {
      types: [MOD_DRAG_TYPE],
      getData: vi.fn((type: string) =>
        type === MOD_DRAG_TYPE ? "serration" : "",
      ),
      dropEffect: "none",
    };

    render(
      <SlotGrid
        slots={emptySlots()}
        onInstall={() => undefined}
        onRankChange={() => undefined}
        onDropMod={onDropMod}
      />,
    );

    const secondSlot = screen.getByRole("listitem", { name: "槽位 2" });
    fireEvent.dragOver(secondSlot, { dataTransfer });
    fireEvent.drop(secondSlot, { dataTransfer });

    expect(onDropMod).toHaveBeenCalledOnce();
    expect(onDropMod).toHaveBeenCalledWith(1, "serration");
  });

  it("writes an installed slot payload and delegates a slot-to-slot move", () => {
    const setData = vi.fn();
    const onMoveMod = vi.fn();
    const slots = emptySlots().map((slot) =>
      slot.index === 0
        ? {
            ...slot,
            installedMod: { modId: "serration", rank: 8 },
          }
        : slot,
    );

    render(
      <SlotGrid
        slots={slots}
        onInstall={() => undefined}
        onRankChange={() => undefined}
        onMoveMod={onMoveMod}
      />,
    );

    fireEvent.dragStart(
      screen.getByLabelText("拖动 Serration（槽位 1）"),
      { dataTransfer: { effectAllowed: "none", setData } },
    );
    expect(setData).toHaveBeenCalledWith(SLOT_DRAG_TYPE, "0");

    const secondSlot = screen.getByRole("listitem", { name: "槽位 2" });
    fireEvent.drop(secondSlot, {
      dataTransfer: {
        types: [SLOT_DRAG_TYPE],
        getData: (type: string) => (type === SLOT_DRAG_TYPE ? "0" : ""),
      },
    });

    expect(onMoveMod).toHaveBeenCalledOnce();
    expect(onMoveMod).toHaveBeenCalledWith(0, 1);
  });

  it("exposes removal and slot-polarity editing without requiring drag", () => {
    const onRemove = vi.fn();
    const onPolarityChange = vi.fn();
    const slots = emptySlots().map((slot) =>
      slot.index === 0
        ? {
            ...slot,
            installedMod: { modId: "serration", rank: 8 },
          }
        : slot,
    );

    render(
      <SlotGrid
        slots={slots}
        onInstall={() => undefined}
        onRankChange={() => undefined}
        onRemove={onRemove}
        onPolarityChange={onPolarityChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "移除 Serration" }));
    fireEvent.change(screen.getByRole("combobox", { name: "槽位 1 极性" }), {
      target: { value: "none" },
    });

    expect(onRemove).toHaveBeenCalledWith(0);
    expect(onPolarityChange).toHaveBeenCalledWith(0, "none");
  });

  it("provides a button equivalent for moving an installed Mod", () => {
    const onMoveMod = vi.fn();
    const slots = emptySlots().map((slot) =>
      slot.index === 0
        ? {
            ...slot,
            installedMod: { modId: "serration", rank: 8 },
          }
        : slot,
    );

    render(
      <SlotGrid
        slots={slots}
        onInstall={() => undefined}
        onRankChange={() => undefined}
        onMoveMod={onMoveMod}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "将 Serration 移到槽位 2" }),
    );

    expect(onMoveMod).toHaveBeenCalledOnce();
    expect(onMoveMod).toHaveBeenCalledWith(0, 1);
  });
});
