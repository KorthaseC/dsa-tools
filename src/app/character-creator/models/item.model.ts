import { NamedEntry } from './base-creation.model';

// Top-level kind of a catalog entry — drives the (future) item-list filter in the Besitz tab.
export enum ItemCategory {
  Item = 'item',
  MeleeWeapon = 'meleeWeapon',
  RangedWeapon = 'rangedWeapon',
  Armor = 'armor',
  Shield = 'shield',
}

// Shared base for every selectable catalog entry. Extends NamedEntry (name slug / label / url /
// sources); German labels are kept verbatim per the project convention (no i18n for game data).
export interface CatalogEntry extends NamedEntry {
  category: ItemCategory;
  weight: number; // Gewicht (Stein)
  price?: number; // Preis / Wert (Silbertaler)
  availability?: string; // Typ / Typus: "allgemein" | "einzigartig" | …
  note?: string; // short rule note (VN / Anmerkung)
}

// General Besitz item (BesitzGetInfo) — books, tools, alchemy products, …
export interface Item extends CatalogEntry {
  category: ItemCategory.Item;
  type: string; // Typ[6] — sub-category for finer filtering ("Fachliteratur", "Genussmittel", …)
  defaultQuantity?: number; // Anzahl[1]
  structure?: number; // Struktur[3]
}

// One item contained in a Komplettpaket (from BesitzAuswahl). Picking the package expands into these
// rows; `name` is a catalog label (resolved against ALL_ITEMS for weight/value where it exists).
export interface PackageItem {
  name: string;
  quantity: number;
  carriedWhere?: string; // "Wo getragen" (e.g. "Lederrucksack")
}
