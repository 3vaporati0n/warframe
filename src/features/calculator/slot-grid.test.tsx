import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BuildSlot } from "@/core/model";

import { SlotGrid } from "./slot-grid";

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
});
