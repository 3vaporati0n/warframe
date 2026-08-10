import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Calculator } from "./calculator";

describe("Calculator", () => {
  it("installs Serration and immediately reevaluates rank and capacity", () => {
    render(<Calculator />);

    expect(screen.getByText("容量 0 / 30")).toBeVisible();
    const firstSlot = screen.getByRole("listitem", { name: "槽位 1" });
    fireEvent.click(
      within(firstSlot).getByRole("button", {
        name: "安装 Serration 到槽位 1",
      }),
    );

    expect(screen.getByText("容量 6 / 30")).toBeVisible();
    expect(screen.getByText("ceil((4 + 8) / 2) = 6")).toBeVisible();
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
  });
});
