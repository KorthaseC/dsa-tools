import { Belastungsstufe } from './melee-weapon.model';
import { CatalogEntry, ItemCategory } from './item.model';

export interface RangedWeaponRow {
  id: string;
  weapon: string;
  combatTechnique: string;
  ammunition: string; // Munition
  reloadTimeDefault: number; // Ladezeiten (Standard)
  reloadTimeCurrent: number; // Ladezeiten (aktuell)
  damage: string; // TP (Trefferpunkte)
  rangeClose: number | null; // Reichweite nah
  rangeMedium: number | null; // Reichweite mittel
  rangeFar: number | null; // Reichweite fern
  bf: number; // Bruchfaktor
  bs: Belastungsstufe; // Belastungsstufe
  fkMod: number; // Fernkampf-Modifikator
  weight: number; // Gewicht (Stein)
}

let rowCounter = 0;

export function createEmptyRangedWeaponRow(): RangedWeaponRow {
  return {
    id: `rw-${++rowCounter}-${Date.now()}`,
    weapon: '',
    combatTechnique: '',
    ammunition: '',
    reloadTimeDefault: 0,
    reloadTimeCurrent: 0,
    damage: '',
    rangeClose: null,
    rangeMedium: null,
    rangeFar: null,
    bf: 0,
    bs: Belastungsstufe.None,
    fkMod: 0,
    weight: 0,
  };
}

// ─── Catalog (FernkampfWaffeGetInfo) ────────────────────────────────────────────
// Read-only template a user can pick; mapped into a fresh RangedWeaponRow on selection.
export interface RangedWeaponItem extends CatalogEntry {
  category: ItemCategory.RangedWeapon;
  combatTechnique: string; // Technik[2] — also the sub-filter ("Bögen", "Armbrüste", …)
  damage: string; // Schaden[3], e.g. "1W6+4"
  reloadTime: string; // Lade[4] — Ladezeit, e.g. "2 Akt"
  rangeClose: number | null; // Reichweite[5] split on "/"
  rangeMedium: number | null;
  rangeFar: number | null;
  ammunition: string; // Munition[6]
  length?: number; // Länge[8]
  bf: number; // BF[11]
}

export function rangedWeaponItemToRow(item: RangedWeaponItem): RangedWeaponRow {
  const reload = parseInt(item.reloadTime, 10) || 0;
  return {
    ...createEmptyRangedWeaponRow(),
    weapon: item.label,
    combatTechnique: item.combatTechnique,
    ammunition: item.ammunition,
    reloadTimeDefault: reload,
    reloadTimeCurrent: reload,
    damage: item.damage,
    rangeClose: item.rangeClose,
    rangeMedium: item.rangeMedium,
    rangeFar: item.rangeFar,
    bf: item.bf,
    weight: item.weight,
  };
}
