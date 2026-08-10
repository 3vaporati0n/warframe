# Melee, Ability Buff, and Arcane Research Slice

**Goal:** Add a category-safe melee path, one Wiki-backed Warframe damage buff, and one Wiki-backed weapon Arcane while preserving the product boundary that untested calculations remain research previews.

**Sources frozen for this slice:**

- Pressure Point rank table: <https://warframe.fandom.com/wiki/Pressure_Point>
- Skana normal attack: <https://wiki.warframe.com/w/Sword>
- Roar faction-damage behavior: <https://warframe.fandom.com/wiki/Faction_Damage_Bonus>
- Primary Merciless rank and stack table: <https://warframe.fandom.com/wiki/Primary_Merciless>
- Additive base-damage formula: <https://warframe.fandom.com/wiki/Calculating_Bonuses>

## Accuracy boundaries

- [x] Store every Pressure Point and Primary Merciless rank as an explicit literal.
- [x] Reject a Mod whose category differs from the selected weapon.
- [x] Keep Primary Merciless in the base-damage additive group.
- [x] Keep Roar in the faction-damage additive group and scale its 50% base value by Ability Strength.
- [x] Disable Primary Merciless for melee weapons.
- [x] Mark both external-effect calculations as unverified until an in-game observation is saved.
- [x] Never expose a research preview as final damage or DPS.

## Interaction and verification

- [x] Switch between Karak primary and Skana melee research fixtures.
- [x] Reset incompatible installed Mods when the weapon changes.
- [x] Filter the Mod library and empty-slot action by weapon category.
- [x] Edit Roar active state and Ability Strength.
- [x] Edit Primary Merciless active state, rank, and 0–12 stacks.
- [x] Show formula operands, direct sources, and multiplier groups.
- [ ] Verify desktop and narrow viewport behavior in a real browser.
- [ ] Run the complete automated check and production build.
- [ ] Record acceptance evidence and publish every commit.

## Commit policy

Commit and push after every cumulative five-file change set. A final documentation-only evidence update may be smaller.
