import { IncreaseFactor, NamedEntry, SourceReference } from './base-creation.model';

export { IncreaseFactor };

export type SpellCheck = [string, string, string];

export enum SpellTrait {
  Antimagie = 'Antimagie',
  Daemonisch = 'Dämonisch',
  Einfluss = 'Einfluss',
  Elementar = 'Elementar',
  Heilung = 'Heilung',
  Hellsicht = 'Hellsicht',
  Illusion = 'Illusion',
  Objekt = 'Objekt',
  Sphaeren = 'Sphären',
  Telekinese = 'Telekinese',
  Temporal = 'Temporal',
  Verwandlung = 'Verwandlung',
}

// An optional spell/ritual/liturgy/ceremony extension (Erweiterung). The character must reach
// `requiredSkillValue` (Fertigkeitswert) and have learned every extension in `requires` first
// (successive chains, e.g. "Noch größere Reichweite" requires "Größere Reichweite").
export interface SpellExtension {
  name: string; // slug, unique within the parent entry
  label: string; // display name, e.g. "Größere Reichweite"
  apCost: number; // AP cost to learn
  requiredSkillValue: number; // minimum Fertigkeitswert (FW) needed to unlock
  requires?: string[]; // names of extensions that must be learned first
}

export interface BaseSpellEntry extends NamedEntry {
  check: SpellCheck;
  trait: string; // Merkmal(e) — raw catalog value (may list several); SpellTrait enum lists the canonical ones
  traditions: string[];
  increaseFactor: IncreaseFactor;
  // ── Detail fields (from the embedded PDF data) ──
  cost?: string; // Kosten (AsP)
  castTime?: string; // Zauberdauer
  range?: string; // Reichweite
  duration?: string; // Wirkungsdauer
  target?: string; // Ziel
  page?: string; // Seite (erste Quelle)
  magicType?: string; // PDF-Typus: Zauber, Ritual, Animistenkraft, Zaubertanz, …
  extensions?: SpellExtension[]; // Zaubererweiterungen
}

// True if `ext` may be learned at the given Fertigkeitswert with the given already-learned
// extension names. Checks both the FW threshold and any successive prerequisites (`requires`).
export function canLearnExtension(ext: SpellExtension, fw: number, learned: ReadonlySet<string> | readonly string[]): boolean {
  const have = Array.isArray(learned) ? new Set(learned) : (learned as ReadonlySet<string>);
  if (fw < ext.requiredSkillValue) return false;
  return (ext.requires ?? []).every((r) => have.has(r));
}

export interface Spell extends BaseSpellEntry {}

export interface Ritual extends BaseSpellEntry {}

export interface Cantrip extends NamedEntry {
  trait: SpellTrait;
  traditions: string[];
}
