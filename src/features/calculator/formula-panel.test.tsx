import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { evaluateBuild } from "@/core/evaluate-build";
import {
  PRIMARY_MERCILESS_ID,
  ROAR_ID,
} from "@/core/external-modifier-registry";
import { KARAK_RESEARCH_ID } from "@/core/weapon-registry";

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

  it("labels the executed damage formula as research instead of final damage", () => {
    const evaluation = evaluateBuild({
      weaponId: KARAK_RESEARCH_ID,
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

    const preview = screen.getByRole("region", {
      name: "研究预览（不计入正式伤害）",
    });
    expect(within(preview).getByText("Karak（Wiki 示例）")).toBeVisible();
    expect(within(preview).getByText("基础伤害 29")).toBeVisible();
    expect(within(preview).getByText("Mod 后预览 68.15")).toBeVisible();

    const damageTrace = screen.getByRole("article", {
      name: "Karak Wiki 研究基础伤害公式",
    });
    expect(
      within(damageTrace).getByText("29 × (1 + 1.35) = 68.15"),
    ).toBeVisible();
    expect(within(damageTrace).getByText("基础伤害加算区")).toBeVisible();
    expect(within(damageTrace).getByText("未通过游戏实测")).toBeVisible();
    expect(
      within(damageTrace).getByRole("link", { name: "公式来源" }),
    ).toHaveAttribute(
      "href",
      "https://warframe.fandom.com/wiki/Damage/Calculation",
    );
    expect(screen.queryByText("最终伤害")).not.toBeInTheDocument();
    expect(screen.queryByText("准确 DPS")).not.toBeInTheDocument();
  });

  it("renders external effects in their separate multiplier groups", () => {
    const evaluation = evaluateBuild({
      weaponId: KARAK_RESEARCH_ID,
      capacityLimit: 30,
      slots: [],
      weaponArcanes: [
        {
          arcaneId: PRIMARY_MERCILESS_ID,
          rank: 5,
          stacks: 12,
          active: true,
        },
      ],
      abilityBuffs: [
        {
          abilityId: ROAR_ID,
          abilityStrengthPercent: 130,
          active: true,
        },
      ],
    });

    render(<FormulaPanel evaluation={evaluation} />);

    const preview = screen.getByRole("region", {
      name: "研究预览（不计入正式伤害）",
    });
    expect(within(preview).getByText("派系乘区后预览 220.11")).toBeVisible();

    const factionTrace = screen.getByRole("article", {
      name: "Karak Wiki 研究派系伤害公式",
    });
    expect(within(factionTrace).getByText("派系伤害加算区")).toBeVisible();
    expect(
      within(factionTrace).getByText("133.4 × (1 + 0.65) = 220.11"),
    ).toBeVisible();
    expect(within(factionTrace).getByText(/Roar @ 130% 强度：0.65/)).toBeVisible();
  });
});
