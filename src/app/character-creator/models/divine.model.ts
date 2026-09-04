import { IncreaseFactor, NamedEntry, SourceReference } from './base-creation.model';
import { SpellExtension } from './magic.model';

export { IncreaseFactor };
export { SpellExtension };

export type LiturgyCheck = [string, string, string];

export interface BaseLiturgyEntry extends NamedEntry {
  check: LiturgyCheck;
  traditions: string[];
  increaseFactor: IncreaseFactor;
  // ── Detail fields (from the embedded PDF data) ──
  aspect?: string; // Aspekt(e) — the liturgy analogue of a spell's Merkmal
  cost?: string; // Kosten (KaP)
  castTime?: string; // Liturgiedauer
  range?: string; // Reichweite
  duration?: string; // Wirkungsdauer
  target?: string; // Ziel
  page?: string; // Seite (erste Quelle)
  magicType?: string; // PDF-Typus: Liturgie / Zeremonie
  extensions?: SpellExtension[]; // Liturgie-/Zeremonieerweiterungen
}

export interface Liturgy extends BaseLiturgyEntry {}

export interface Ceremony extends BaseLiturgyEntry {}

export interface Blessing extends NamedEntry {
  aspect: string;
  traditions: string[];
}
