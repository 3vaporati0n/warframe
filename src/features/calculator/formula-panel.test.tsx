import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { evaluateBuild } from "@/core/evaluate-build";

import { FormulaPanel } from "./formula-panel";

describe("FormulaPanel", () => {
  it("renders executed operands, formula sources, and incomplete status", () => {
    const evaluation = evaluateBuild({
      capacityLimit: 30,
      slots: [
        {
          index: 0,
          polarity: "madurai",
          installedMod: { modId: "serration", rank: 8 },
        },
      ],
    });

    render(<FormulaPanel evaluation={evaluation} />);

    expect(screen.getByRole("heading", { name: "计算公式" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("结果不完整");
    expect(screen.getByText("ceil((4 + 8) / 2) = 6")).toBeVisible();
    expect(screen.getByText("容量乘区")).toBeVisible();
    expect(
      screen.getByRole("alert", {
        name: "Serration 的伤害效果尚未通过游戏测试，因此未计入最终伤害。",
      }),
    ).toBeVisible();

    const trace = screen.getByRole("article", {
      name: "槽位 1 Serration 容量公式",
    });
    expect(within(trace).getByText("Rank 0 容量：4")).toBeVisible();
    expect(within(trace).getByText("当前等级：8")).toBeVisible();
    expect(within(trace).getByText("匹配极性倍率：0.5")).toBeVisible();
    expect(
      within(trace).getByRole("link", { name: "Polarity revision 2793391" }),
    ).toHaveAttribute(
      "href",
      "https://wiki.warframe.com/w/Polarity?oldid=2793391",
    );
    expect(
      within(trace).getAllByRole("link", { name: "Serration revision 2699779" }),
    ).toHaveLength(2);
  });

  it("labels an issue-free capacity evaluation as complete", () => {
    render(
      <FormulaPanel
        evaluation={evaluateBuild({ capacityLimit: 30, slots: [] })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("当前容量结果完整");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
