import { Belastungsstufe } from './melee-weapon.model';
import { CatalogEntry, ItemCategory } from './item.model';

export interface ArmorRow {
  id: string;
  name: string;
  st: number; // Strukturpunkte
  ve: Belastungsstufe; // Verschleißstufe
  rs: number; // Rüstungsschutz
  be: number; // Behinderung
  penaltyMovement: number; // zusätzliche Abzüge GS
  penaltyInitiative: number; // zusätzliche Abzüge INI
  weight: number; // Gewicht (Stein)
}

let rowCounter = 0;

export function createEmptyArmorRow(): ArmorRow {
  return {
    id: `ar-${++rowCounter}-${Date.now()}`,
    name: '',
    st: 0,
    ve: Belastungsstufe.None,
    rs: 0,
    be: 0,
    penaltyMovement: 0,
    penaltyInitiative: 0,
    weight: 0,
  };
}

// ─── Catalog (RuestungGetInfo) ──────────────────────────────────────────────────
// Read-only template a user can pick; mapped into a fresh ArmorRow on selection.
// User-only fields (ve / penaltyMovement / penaltyInitiative) keep their empty defaults.
export interface ArmorItem extends CatalogEntry {
  category: ItemCategory.Armor;
  rs: number; // RS[3] — Rüstungsschutz
  be: number; // BE[4] — Behinderung
  structure: number; // Stabilität[8] — Strukturpunkte
  area?: string; // Bereich[2] — body zone (usually empty for full armor)
}

export function armorItemToRow(item: ArmorItem): ArmorRow {
  return {
    ...createEmptyArmorRow(),
    name: item.label,
    st: item.structure,
    rs: item.rs,
    be: item.be,
    weight: item.weight,
  };
}
