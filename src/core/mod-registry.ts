import type { ModCardRule, RankValue } from "./model";

export const SERRATION_ID = "serration";
export const PRESSURE_POINT_ID = "pressure-point";

const serrationRankValues: readonly RankValue[] = Object.freeze([
  Object.freeze({ rank: 0, effectPercent: 15, rawDrain: 4 }),
  Object.freeze({ rank: 1, effectPercent: 30, rawDrain: 5 }),
  Object.freeze({ rank: 2, effectPercent: 45, rawDrain: 6 }),
  Object.freeze({ rank: 3, effectPercent: 60, rawDrain: 7 }),
  Object.freeze({ rank: 4, effectPercent: 75, rawDrain: 8 }),
  Object.freeze({ rank: 5, effectPercent: 90, rawDrain: 9 }),
  Object.freeze({ rank: 6, effectPercent: 105, rawDrain: 10 }),
  Object.freeze({ rank: 7, effectPercent: 120, rawDrain: 11 }),
  Object.freeze({ rank: 8, effectPercent: 135, rawDrain: 12 }),
  Object.freeze({ rank: 9, effectPercent: 150, rawDrain: 13 }),
  Object.freeze({ rank: 10, effectPercent: 165, rawDrain: 14 }),
]);

const serration: ModCardRule = Object.freeze({
  modId: SERRATION_ID,
  name: "Serration",
  category: "primary",
  rarity: "uncommon",
  polarity: "madurai",
  maxRank: 10,
  rankValues: serrationRankValues,
  effects: Object.freeze([
    Object.freeze({
      id: "serration-base-damage",
      kind: "base-damage",
      stage: "base-damage",
      multiplierGroup: "base-damage-additive",
      verification: "unverified",
    }),
  ]),
  sources: Object.freeze([
    Object.freeze({
      label: "WARFRAME Wiki — Serration revision 2699779",
      url: "https://wiki.warframe.com/w/Serration?oldid=2699779",
      retrievedAt: "2026-08-10",
      revisionId: "2699779",
    }),
    Object.freeze({
      label: "WARFRAME Wiki — Module:Mods/data",
      url: "https://wiki.warframe.com/w/Module%3AMods/data",
      retrievedAt: "2026-08-10",
    }),
  ]),
  dataVerification: "verified",
});

const pressurePointRankValues: readonly RankValue[] = Object.freeze([
  Object.freeze({ rank: 0, effectPercent: 20, rawDrain: 4 }),
  Object.freeze({ rank: 1, effectPercent: 40, rawDrain: 5 }),
  Object.freeze({ rank: 2, effectPercent: 60, rawDrain: 6 }),
  Object.freeze({ rank: 3, effectPercent: 80, rawDrain: 7 }),
  Object.freeze({ rank: 4, effectPercent: 100, rawDrain: 8 }),
  Object.freeze({ rank: 5, effectPercent: 120, rawDrain: 9 }),
]);

const pressurePoint: ModCardRule = Object.freeze({
  modId: PRESSURE_POINT_ID,
  name: "Pressure Point",
  category: "melee",
  rarity: "common",
  polarity: "madurai",
  maxRank: 5,
  rankValues: pressurePointRankValues,
  effects: Object.freeze([
    Object.freeze({
      id: "pressure-point-base-damage",
      kind: "base-damage",
      stage: "base-damage",
      multiplierGroup: "base-damage-additive",
      verification: "unverified",
    }),
  ]),
  sources: Object.freeze([
    Object.freeze({
      label: "WARFRAME Wiki Fandom archive — Pressure Point",
      url: "https://warframe.fandom.com/wiki/Pressure_Point",
      retrievedAt: "2026-08-10",
    }),
    Object.freeze({
      label: "WARFRAME Wiki — Module:Mods/data",
      url: "https://wiki.warframe.com/w/Module%3AMods/data",
      retrievedAt: "2026-08-10",
    }),
  ]),
  dataVerification: "verified",
});

const modRegistry: ReadonlyMap<string, ModCardRule> = new Map([
  [serration.modId, serration],
  [pressurePoint.modId, pressurePoint],
]);

export function getModRule(modId: string): ModCardRule | undefined {
  return modRegistry.get(modId);
}

export function listModRules(): readonly ModCardRule[] {
  return Object.freeze(Array.from(modRegistry.values()));
}
