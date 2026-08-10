import type { BuildSlot, Polarity } from "./model";
import { getModRule } from "./mod-registry";

function slotPosition(
  slots: readonly BuildSlot[],
  slotIndex: number,
): number {
  return slots.findIndex((slot) => slot.index === slotIndex);
}

export function installMod(
  slots: readonly BuildSlot[],
  slotIndex: number,
  modId: string,
  rank?: number,
): readonly BuildSlot[] {
  const position = slotPosition(slots, slotIndex);
  const rule = getModRule(modId);
  const selectedRank = rank ?? rule?.maxRank;

  if (
    position < 0 ||
    !rule ||
    selectedRank === undefined ||
    !rule.rankValues.some((rankValue) => rankValue.rank === selectedRank) ||
    slots[position]?.installedMod ||
    slots.some((slot) => slot.installedMod?.modId === modId)
  ) {
    return slots;
  }

  return slots.map((slot, candidatePosition) =>
    candidatePosition === position
      ? { ...slot, installedMod: { modId, rank: selectedRank } }
      : slot,
  );
}

export function moveMod(
  slots: readonly BuildSlot[],
  fromIndex: number,
  toIndex: number,
): readonly BuildSlot[] {
  const fromPosition = slotPosition(slots, fromIndex);
  const toPosition = slotPosition(slots, toIndex);

  if (
    fromPosition < 0 ||
    toPosition < 0 ||
    fromPosition === toPosition ||
    !slots[fromPosition]?.installedMod
  ) {
    return slots;
  }

  const fromInstalledMod = slots[fromPosition]?.installedMod;
  const toInstalledMod = slots[toPosition]?.installedMod;

  return slots.map((slot, position) => {
    if (position === fromPosition) {
      return toInstalledMod
        ? { ...slot, installedMod: toInstalledMod }
        : { index: slot.index, polarity: slot.polarity };
    }

    if (position === toPosition) {
      return fromInstalledMod
        ? { ...slot, installedMod: fromInstalledMod }
        : slot;
    }

    return slot;
  });
}

export function removeMod(
  slots: readonly BuildSlot[],
  slotIndex: number,
): readonly BuildSlot[] {
  const position = slotPosition(slots, slotIndex);
  const slot = slots[position];

  if (position < 0 || !slot?.installedMod) {
    return slots;
  }

  return slots.map((candidate, candidatePosition) =>
    candidatePosition === position
      ? { index: candidate.index, polarity: candidate.polarity }
      : candidate,
  );
}

export function setModRank(
  slots: readonly BuildSlot[],
  slotIndex: number,
  rank: number,
): readonly BuildSlot[] {
  const position = slotPosition(slots, slotIndex);
  const installedMod = slots[position]?.installedMod;
  const rule = installedMod ? getModRule(installedMod.modId) : undefined;

  if (
    position < 0 ||
    !installedMod ||
    !rule?.rankValues.some((rankValue) => rankValue.rank === rank) ||
    installedMod.rank === rank
  ) {
    return slots;
  }

  return slots.map((slot, candidatePosition) =>
    candidatePosition === position
      ? { ...slot, installedMod: { ...installedMod, rank } }
      : slot,
  );
}

export function setSlotPolarity(
  slots: readonly BuildSlot[],
  slotIndex: number,
  polarity: Polarity,
): readonly BuildSlot[] {
  const position = slotPosition(slots, slotIndex);
  const slot = slots[position];

  if (position < 0 || !slot || slot.polarity === polarity) {
    return slots;
  }

  return slots.map((candidate, candidatePosition) =>
    candidatePosition === position
      ? { ...candidate, polarity }
      : candidate,
  );
}
