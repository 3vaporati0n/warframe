import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { listModRules } from "@/core/mod-registry";

import { MOD_DRAG_TYPE, ModLibrary } from "./mod-library";

describe("ModLibrary", () => {
  it("shows a source-aware horizontal Mod entry with a click install path", () => {
    const onInstall = vi.fn();

    render(<ModLibrary rules={listModRules()} onInstall={onInstall} />);

    expect(screen.getByRole("heading", { name: "Mod 库" })).toBeVisible();
    expect(
      screen.getByRole("article", { name: "Serration 库存 Mod" }),
    ).toHaveAttribute("draggable", "true");
    expect(screen.getByText("UNCOMMON · MADURAI")).toBeVisible();
    expect(screen.getByText("最高等级 10 · 伤害未验证")).toBeVisible();
    expect(screen.getByText("图片待验证")).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "安装 Serration 到首个空槽" }),
    );

    expect(onInstall).toHaveBeenCalledOnce();
    expect(onInstall).toHaveBeenCalledWith("serration");
  });

  it("writes the Mod ID to the dedicated drag payload", () => {
    const setData = vi.fn();

    render(
      <ModLibrary rules={listModRules()} onInstall={() => undefined} />,
    );

    fireEvent.dragStart(
      screen.getByRole("article", { name: "Serration 库存 Mod" }),
      { dataTransfer: { effectAllowed: "none", setData } },
    );

    expect(setData).toHaveBeenCalledWith(MOD_DRAG_TYPE, "serration");
  });
});
