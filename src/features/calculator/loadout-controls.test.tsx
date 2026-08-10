import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { listWeaponRules, SKANA_RESEARCH_ID } from "@/core/weapon-registry";

import { LoadoutControls } from "./loadout-controls";

describe("LoadoutControls", () => {
  it("emits weapon, Roar, strength, Merciless rank, and stack edits", () => {
    const onWeaponChange = vi.fn();
    const onRoarActiveChange = vi.fn();
    const onAbilityStrengthChange = vi.fn();
    const onMercilessActiveChange = vi.fn();
    const onMercilessRankChange = vi.fn();
    const onMercilessStacksChange = vi.fn();

    render(
      <LoadoutControls
        weapons={listWeaponRules()}
        weaponId="karak-wiki-research"
        weaponCategory="primary"
        roarActive={false}
        abilityStrengthPercent={100}
        mercilessActive={false}
        mercilessRank={5}
        mercilessStacks={0}
        onWeaponChange={onWeaponChange}
        onRoarActiveChange={onRoarActiveChange}
        onAbilityStrengthChange={onAbilityStrengthChange}
        onMercilessActiveChange={onMercilessActiveChange}
        onMercilessRankChange={onMercilessRankChange}
        onMercilessStacksChange={onMercilessStacksChange}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "武器研究样本" }), {
      target: { value: SKANA_RESEARCH_ID },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "启用 Roar" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "技能强度" }), {
      target: { value: "130" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "启用 Primary Merciless" }),
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Primary Merciless 等级" }),
      { target: { value: "4" } },
    );
    fireEvent.change(
      screen.getByRole("slider", { name: /Primary Merciless 层数/ }),
      { target: { value: "12" } },
    );

    expect(onWeaponChange).toHaveBeenCalledWith(SKANA_RESEARCH_ID);
    expect(onRoarActiveChange).toHaveBeenCalledWith(true);
    expect(onAbilityStrengthChange).toHaveBeenCalledWith(130);
    expect(onMercilessActiveChange).toHaveBeenCalledWith(true);
    expect(onMercilessRankChange).toHaveBeenCalledWith(4);
    expect(onMercilessStacksChange).toHaveBeenCalledWith(12);
  });

  it("disables the primary-only arcane controls for a melee weapon", () => {
    render(
      <LoadoutControls
        weapons={listWeaponRules()}
        weaponId={SKANA_RESEARCH_ID}
        weaponCategory="melee"
        roarActive
        abilityStrengthPercent={130}
        mercilessActive={false}
        mercilessRank={5}
        mercilessStacks={12}
        onWeaponChange={() => undefined}
        onRoarActiveChange={() => undefined}
        onAbilityStrengthChange={() => undefined}
        onMercilessActiveChange={() => undefined}
        onMercilessRankChange={() => undefined}
        onMercilessStacksChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "启用 Primary Merciless" }),
    ).toBeDisabled();
    expect(screen.getByText("仅适用于主武器")).toBeVisible();
  });
});
