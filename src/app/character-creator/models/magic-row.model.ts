export interface MagicExtension {
  id: string;
  name: string; // catalog extension slug (SpellExtension.name); falls back to free text for legacy rows
}

// Shared row shape for Zauber/Rituale and Liturgien/Zeremonien.
// For liturgies the `trait` field holds the Aspekt instead of the Merkmal.
export interface MagicRow {
  id: string;
  spellName: string;
  probe: [string, string, string];
  fw: number; // Fertigkeitswert
  cost: string; // Kosten (AsP/KaP)
  castTime: string; // Zauberdauer / Liturgiedauer
  range: string; // Reichweite
  duration: string; // Wirkungsdauer
  target: string; // Zielkategorie (Ziel)
  trait: string; // Merkmal (Zauber) / Aspekt (Liturgie)
  increaseFactor: string; // Steigerungsfaktor (SF)
  effect: string; // Wirkung
  page: string; // Seite
  extensions: MagicExtension[]; // Erweiterungen
}

let rowCounter = 0;

export function createEmptyMagicRow(): MagicRow {
  return {
    id: `mr-${++rowCounter}-${Date.now()}`,
    spellName: '',
    probe: ['', '', ''],
    fw: 0,
    cost: '',
    castTime: '',
    range: '',
    duration: '',
    target: '',
    trait: '',
    increaseFactor: '',
    effect: '',
    page: '',
    extensions: [],
  };
}

let extCounter = 0;

export function createExtension(name: string): MagicExtension {
  return {
    id: `ext-${++extCounter}-${Date.now()}`,
    name,
  };
}
