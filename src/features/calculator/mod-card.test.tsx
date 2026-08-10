import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getModRule, SERRATION_ID } from "@/core/mod-registry";

import { ModCard } from "./mod-card";

describe("ModCard", () => {
  it("renders Serration rank 8 as a horizontal, source-aware card", () => {
    const rule = getModRule(SERRATION_ID);
    if (!rule) {
      throw new Error("Serration fixture is missing");
    }

    render(
      <ModCard
        rule={rule}
        rank={8}
        slotPolarity="madurai"
        onRankChange={() => undefined}
      />,
    );

    expect(screen.getByRole("article", { name: "Serration Mod" })).toBeVisible();
    expect(screen.getByText("伤害效果：+135% 基础伤害")).toBeVisible();
    expect(screen.getByText("容量 12 → 6")).toBeVisible();
    expect(screen.getByText("等级 8 / 10")).toBeVisible();
    expect(screen.getByText("伤害未验证")).toBeVisible();
    expect(screen.getByText("中性图片占位")).toBeVisible();
  });

  it("reports the next selected rank without changing calculation data itself", () => {
    const rule = getModRule(SERRATION_ID);
    const onRankChange = vi.fn();
    if (!rule) {
      throw new Error("Serration fixture is missing");
    }

    render(
      <ModCard
        rule={rule}
        rank={8}
        slotPolarity="madurai"
        onRankChange={onRankChange}
      />,
    );

    fireEvent.change(screen.getByRole("slider", { name: "等级" }), {
      target: { value: "10" },
    });

    expect(onRankChange).toHaveBeenCalledOnce();
    expect(onRankChange).toHaveBeenCalledWith(10);
  });
});
