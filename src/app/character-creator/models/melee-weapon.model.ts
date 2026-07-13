import { CatalogEntry, ItemCategory } from './item.model';

// Reichweite / Belastungsstufe are untranslatable DSA domain enums — kept German per
// the project convention (code English, but DSA data-terms stay German).
export enum Reichweite {
  Kurz = 'kurz',
  Mittel = 'mittel',
  Lang = 'lang',
}

export enum Belastungsstufe {
  None = '-',
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
}

export interface MeleeWeaponRow {
  id: string;
  weapon: string;
  combatTechnique: string;
  damageBonus: number; // Schadensbonus
  damage: string; // TP (Trefferpunkte), e.g. "1W6+4"
  atMod: number; // AT-Modifikator
  paMod: number; // PA-Modifikator
  range: Reichweite | null;
  bf: number; // Bruchfaktor
  bs: Belastungsstufe; // Belastungsstufe
  weight: number; // Gewicht (Stein)
}

let rowCounter = 0;

export function createEmptyMeleeWeaponRow(): MeleeWeaponRow {
  return {
    id: `mw-${++rowCounter}-${Date.now()}`,
    weapon: '',
    combatTechnique: '',
    damageBonus: 0,
    damage: '',
    atMod: 0,
    paMod: 0,
    range: null,
    bf: 0,
    bs: Belastungsstufe.None,
    weight: 0,
  };
}

// ─── Catalog (NahkampfWaffeGetInfo) ─────────────────────────────────────────────
// Read-only template a user can pick; mapped into a fresh MeleeWeaponRow on selection.
export interface MeleeWeaponItem extends CatalogEntry {
  category: ItemCategory.MeleeWeapon;
  combatTechnique: string; // Technik[2] — also the sub-filter ("Dolche", "Schwerter", …)
  damage: string; // Grundschaden + Bonus, e.g. "1W6+2"
  primaryAttribute: string; // Leit[5], e.g. "GE"
  threshold: number; // Schwelle[6] — Leiteigenschafts-Schwellenwert
  atMod: number; // AT[7]
  paMod: number; // PA[8]
  range: Reichweite | null; // RW[9]
  length?: number; // Länge[11] (Halbschritt)
  bf: number; // BF[15] — Bruchfaktor
}

export function meleeWeaponItemToRow(item: MeleeWeaponItem): MeleeWeaponRow {
  return {
    ...createEmptyMeleeWeaponRow(),
    weapon: item.label,
    combatTechnique: item.combatTechnique,
    damage: item.damage,
    atMod: item.atMod,
    paMod: item.paMod,
    range: item.range,
    bf: item.bf,
    weight: item.weight,
  };
}
