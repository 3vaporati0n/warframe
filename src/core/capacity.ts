import type { Polarity } from "./model";

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative integer`);
  }
}

export function rankDrain(baseDrain: number, rank: number): number {
  assertNonNegativeInteger(baseDrain, "baseDrain");
  assertNonNegativeInteger(rank, "rank");

  return baseDrain + rank;
}

export function slotDrain(
  rawDrain: number,
  modPolarity: Polarity,
  slotPolarity: Polarity,
): number {
  assertNonNegativeInteger(rawDrain, "rawDrain");

  if (modPolarity === "none" || slotPolarity === "none") {
    return rawDrain;
  }

  if (modPolarity === slotPolarity) {
    return Math.ceil(rawDrain / 2);
  }

  return Math.round(rawDrain * 1.25);
}
