import { describe, expect, it } from "vitest";

import { evaluateBuild } from "./evaluate-build";
import {
  PRIMARY_MERCILESS_ID,
  ROAR_ID,
} from "./external-modifier-registry";
import {
  KARAK_RESEARCH_ID,
  SKANA_RESEARCH_ID,
} from "./weapon-registry";

const serrationSource = {
  label: "WARFRAME Wiki — Serration revision 2699779",
  url: "https://wiki.warframe.com/w/Serration?oldid=2699779",
  retrievedAt: "2026-08-10",
  revisionId: "2699779",
} as const;

const polaritySource = {
  label: "WARFRAME Wiki — Polarity revision 2793391",
  url: "https://wiki.warframe.com/w/Polarity?oldid=2793391",
  retrievedAt: "2026-08-10",
  revisionId: "2793391",
} as const;

describe("evaluateBuild", () => {
  it("accepts an empty capacity-only build", () => {
    expect(evaluateBuild({ capacityLimit: 30, slots: [] })).toEqual({
      capacity: { used: 0, limit: 30 },
      isLegal: true,
      isComplete: true,
      issues: [],
      trace: [],
    });
  });

  it("evaluates Serration rank 8 in a matching Madurai slot from one trace", () => {
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

    expect(evaluation.capacity).toEqual({ used: 6, limit: 30 });
    expect(evaluation.isLegal).toBe(true);
    expect(evaluation.isComplete).toBe(false);
    expect(evaluation.issues).toContainEqual({
      code: "UNVERIFIED_EFFECT",
      message: "Serration 的伤害效果尚未通过游戏测试，因此未计入最终伤害。",
      slotIndex: 0,
      modId: "serration",
    });
    expect(evaluation.trace).toContainEqual({
      id: "capacity-slot-0-serration",
      stage: "capacity",
      expression: "ceil((4 + 8) / 2) = 6",
      result: 6,
      operands: [
        {
          label: "Rank 0 容量",
          value: 4,
          source: "mod",
          sourceRef: serrationSource,
        },
        {
          label: "当前等级",
          value: 8,
          source: "rank",
          sourceRef: serrationSource,
        },
        {
          label: "匹配极性倍率",
          value: 0.5,
          source: "slot",
          sourceRef: polaritySource,
        },
      ],
      source: polaritySource,
      verification: "verified",
    });
  });

  it("uses nearest-integer mismatch rounding in the executed trace", () => {
    const evaluation = evaluateBuild({
      capacityLimit: 30,
      slots: [
        {
          index: 0,
          polarity: "vazarin",
          installedMod: { modId: "serration", rank: 9 },
        },
      ],
    });

    expect(evaluation.capacity.used).toBe(16);
    expect(evaluation.trace[0]).toMatchObject({
      expression: "round((4 + 9) × 1.25) = 16",
      result: 16,
      operands: [
        {
          label: "Rank 0 容量",
          value: 4,
          source: "mod",
          sourceRef: serrationSource,
        },
        {
          label: "当前等级",
          value: 9,
          source: "rank",
          sourceRef: serrationSource,
        },
        {
          label: "错配极性倍率",
          value: 1.25,
          source: "slot",
          sourceRef: polaritySource,
        },
      ],
    });
  });

  it("marks unknown Mods and invalid ranks as illegal without charging capacity", () => {
    const unknown = evaluateBuild({
      capacityLimit: 30,
      slots: [
        {
          index: 0,
          polarity: "none",
          installedMod: { modId: "invented-mod", rank: 0 },
        },
      ],
    });
    const invalidRank = evaluateBuild({
      capacityLimit: 30,
      slots: [
        {
          index: 0,
          polarity: "madurai",
          installedMod: { modId: "serration", rank: 11 },
        },
      ],
    });

    expect(unknown).toMatchObject({
      capacity: { used: 0, limit: 30 },
      isLegal: false,
      issues: [
        {
          code: "UNKNOWN_MOD",
          slotIndex: 0,
          modId: "invented-mod",
        },
      ],
    });
    expect(invalidRank).toMatchObject({
      capacity: { used: 0, limit: 30 },
      isLegal: false,
      issues: [
        { code: "INVALID_RANK", slotIndex: 0, modId: "serration" },
      ],
    });
  });

  it("rejects duplicate Mods and excludes the duplicate slot from capacity", () => {
    const evaluation = evaluateBuild({
      capacityLimit: 30,
      slots: [
        {
          index: 0,
          polarity: "madurai",
          installedMod: { modId: "serration", rank: 8 },
        },
        {
          index: 1,
          polarity: "none",
          installedMod: { modId: "serration", rank: 10 },
        },
      ],
    });

    expect(evaluation.capacity.used).toBe(6);
    expect(evaluation.isLegal).toBe(false);
    expect(evaluation.issues).toContainEqual({
      code: "DUPLICATE_MOD",
      message: "Serration 不能重复安装。",
      slotIndex: 1,
      modId: "serration",
    });
  });

  it("reports capacity overflow as an illegal preview", () => {
    const evaluation = evaluateBuild({
      capacityLimit: 6,
      slots: [
        {
          index: 0,
          polarity: "madurai",
          installedMod: { modId: "serration", rank: 10 },
        },
      ],
    });

    expect(evaluation.capacity).toEqual({ used: 7, limit: 6 });
    expect(evaluation.isLegal).toBe(false);
    expect(evaluation.issues).toContainEqual({
      code: "OVER_CAPACITY",
      message: "已使用容量 7 超过上限 6。",
    });
  });

  it("executes the Wiki base-damage formula only as an unverified research preview", () => {
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

    expect(evaluation.researchPreview).toEqual({
      weaponName: "Karak（Wiki 示例）",
      baseDamage: 29,
      moddedBaseDamage: 68.15,
      verification: "unverified",
    });
    expect(evaluation.isComplete).toBe(false);
    expect(evaluation.trace).toContainEqual(
      expect.objectContaining({
        id: "base-damage-research-karak-wiki-research",
        stage: "base-damage",
        multiplierGroup: "base-damage-additive",
        expression: "29 × (1 + 1.35) = 68.15",
        result: 68.15,
        verification: "unverified",
      }),
    );
  });

  it("rejects an unknown weapon without inventing a damage preview", () => {
    const evaluation = evaluateBuild({
      weaponId: "invented-weapon",
      capacityLimit: 30,
      slots: [],
    });

    expect(evaluation.isLegal).toBe(false);
    expect(evaluation.isComplete).toBe(false);
    expect(evaluation.researchPreview).toBeUndefined();
    expect(evaluation.issues).toContainEqual({
      code: "UNKNOWN_WEAPON",
      message: "未知武器：invented-weapon。",
    });
  });

  it("keeps an unverified weapon fixture incomplete even without Mods", () => {
    const evaluation = evaluateBuild({
      weaponId: KARAK_RESEARCH_ID,
      capacityLimit: 30,
      slots: [],
    });

    expect(evaluation.isLegal).toBe(true);
    expect(evaluation.isComplete).toBe(false);
    expect(evaluation.issues).toContainEqual({
      code: "UNVERIFIED_WEAPON_DATA",
      message: "Karak（Wiki 示例）的基础数据尚未通过结构化快照与游戏实测双重验证。",
    });
  });

  it("evaluates Pressure Point on the Skana melee research fixture", () => {
    const evaluation = evaluateBuild({
      weaponId: SKANA_RESEARCH_ID,
      capacityLimit: 30,
      slots: [
        {
          index: 0,
          polarity: "madurai",
          installedMod: { modId: "pressure-point", rank: 5 },
        },
      ],
    });

    expect(evaluation.capacity.used).toBe(5);
    expect(evaluation.researchPreview).toMatchObject({
      weaponName: "Skana（Wiki 研究样本）",
      baseDamage: 120,
      moddedBaseDamage: 264,
    });
    expect(evaluation.trace).toContainEqual(
      expect.objectContaining({
        multiplierGroup: "base-damage-additive",
        expression: "120 × (1 + 1.2) = 264",
      }),
    );
  });

  it("keeps a primary Mod out of a melee build", () => {
    const evaluation = evaluateBuild({
      weaponId: SKANA_RESEARCH_ID,
      capacityLimit: 30,
      slots: [
        {
          index: 0,
          polarity: "madurai",
          installedMod: { modId: "serration", rank: 8 },
        },
      ],
    });

    expect(evaluation.capacity.used).toBe(0);
    expect(evaluation.isLegal).toBe(false);
    expect(evaluation.issues).toContainEqual({
      code: "INCOMPATIBLE_MOD",
      message: "Serration 不能安装在 melee 武器上。",
      slotIndex: 0,
      modId: "serration",
    });
  });

  it("shows Merciless in base damage and Roar in a separate faction multiplier", () => {
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

    expect(evaluation.researchPreview).toMatchObject({
      moddedBaseDamage: 172.55,
      damageAfterFaction: 284.7075,
    });
    expect(evaluation.trace).toContainEqual(
      expect.objectContaining({
        stage: "base-damage",
        multiplierGroup: "base-damage-additive",
        expression: "29 × (1 + 1.35 + 3.6) = 172.55",
      }),
    );
    expect(evaluation.trace).toContainEqual(
      expect.objectContaining({
        stage: "faction-damage",
        multiplierGroup: "faction-damage-additive",
        expression: "172.55 × (1 + 0.65) = 284.7075",
      }),
    );
  });

  it("rejects an impossible Merciless state without applying it", () => {
    const evaluation = evaluateBuild({
      weaponId: KARAK_RESEARCH_ID,
      capacityLimit: 30,
      slots: [],
      weaponArcanes: [
        {
          arcaneId: PRIMARY_MERCILESS_ID,
          rank: 5,
          stacks: 13,
          active: true,
        },
      ],
    });

    expect(evaluation.isLegal).toBe(false);
    expect(evaluation.researchPreview?.moddedBaseDamage).toBe(29);
    expect(evaluation.issues).toContainEqual({
      code: "INVALID_ARCANE_STACKS",
      message: "Primary Merciless 的层数必须是 0–12 的整数。",
    });
  });
});
