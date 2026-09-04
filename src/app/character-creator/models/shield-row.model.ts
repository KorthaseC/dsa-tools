import { Belastungsstufe } from './melee-weapon.model';
import { CatalogEntry, ItemCategory } from './item.model';

export interface ShieldRow {
  id: string;
  name: string;
  st: number; // Strukturpunkte
  bf: number; // Bruchfaktor
  bs: Belastungsstufe; // Belastungsstufe
  atMod: number; // AT-Modifikator
  paMod: number; // PA-Modifikator
  weight: number; // Gewicht (Stein)
}

let rowCounter = 0;

export function createEmptyShieldRow(): ShieldRow {
  return {
    id: `sh-${++rowCounter}-${Date.now()}`,
    name: '',
    st: 0,
    bf: 0,
    bs: Belastungsstufe.None,
    atMod: 0,
    paMod: 0,
    weight: 0,
  };
}

// ─── Catalog (SchildGetInfo) ────────────────────────────────────────────────────
// Read-only template a user can pick; mapped into a fresh ShieldRow on selection.
export interface ShieldItem extends CatalogEntry {
  category: ItemCategory.Shield;
  structure: number; // Struktur[2] — Strukturpunkte
  size: string; // Größe[3] — "klein" | "mittel" | "groß"
  atMod: number; // Mod[4] before "/", e.g. "0/+2" → 0
  paMod: number; // Mod[4] after "/", e.g. "0/+2" → 2
  bf: number; // BF[8]
}

export function shieldItemToRow(item: ShieldItem): ShieldRow {
  return {
    ...createEmptyShieldRow(),
    name: item.label,
    st: item.structure,
    bf: item.bf,
    atMod: item.atMod,
    paMod: item.paMod,
    weight: item.weight,
  };
}
