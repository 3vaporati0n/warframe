import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Calculator } from "./calculator";

describe("Calculator", () => {
  it("keeps click editing, capacity, and the Wiki research formula synchronized", () => {
    render(<Calculator />);

    expect(screen.getByText("容量 0 / 30")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "安装 Serration 到首个空槽" }),
    );

    const firstSlot = screen.getByRole("listitem", { name: "槽位 1" });
    expect(screen.getByText("容量 6 / 30")).toBeVisible();
    expect(screen.getByText("ceil((4 + 8) / 2) = 6")).toBeVisible();
    expect(screen.getByText("29 × (1 + 1.35) = 68.15")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("结果不完整");
    expect(
      screen.getByRole("alert", {
        name: "Serration 的伤害效果尚未通过游戏测试，因此未计入最终伤害。",
      }),
    ).toBeVisible();

    fireEvent.change(within(firstSlot).getByRole("slider", { name: "等级" }), {
      target: { value: "10" },
    });

    expect(screen.getByText("容量 7 / 30")).toBeVisible();
    expect(screen.getByText("ceil((4 + 10) / 2) = 7")).toBeVisible();
    expect(screen.getByText("29 × (1 + 1.65) = 76.85")).toBeVisible();

    fireEvent.change(
      within(firstSlot).getByRole("combobox", { name: "槽位 1 极性" }),
      { target: { value: "none" } },
    );
    expect(screen.getByText("容量 14 / 30")).toBeVisible();

    fireEvent.click(
      within(firstSlot).getByRole("button", {
        name: "将 Serration 移到槽位 2",
      }),
    );
    const secondSlot = screen.getByRole("listitem", { name: "槽位 2" });
    expect(
      within(secondSlot).getByRole("article", { name: "Serration Mod" }),
    ).toBeVisible();

    fireEvent.click(
      within(secondSlot).getByRole("button", { name: "移除 Serration" }),
    );
    expect(screen.getByText("容量 0 / 30")).toBeVisible();
    expect(screen.getByText("29 × (1 + 0) = 29")).toBeVisible();
  });
});
