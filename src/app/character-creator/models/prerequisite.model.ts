import { Attribute } from './base-creation.model';
import { EntryRef } from './entry-kind';

// Voraussetzungen as an explicit, id-referencing expression tree (AST). Replaces the flat
// Requirement[] whose `group`/`atLevel`/`sameOption`/`forbidden` flags overloaded one row with
// implicit nested logic. The two real wins over the flat list:
//   1. logical structure is explicit & nestable — and/or/not/nOf/atLevel/ifOption nodes
//      instead of a `group` id + per-row flags;
//   2. every reference to another catalog entry is an EntryRef (kind + slug), never a German
//      label, so evaluation is purely id-based and i18n-safe.
// Domain-specific DSA conditions (tradition, aspect/Merkmal counts, social status, styles, …)
// stay as typed leaves — DSA simply has many condition kinds — but they compose through the
// clean combinators above.
//
// Built at runtime from the generated Requirement[] by catalog/build-prerequisite.ts.

export type Prerequisite =
  // ── Logical combinators ──────────────────────────────────────────────────────
  | { op: 'and'; all: Prerequisite[] }
  | { op: 'or'; any: Prerequisite[] }
  | { op: 'not'; child: Prerequisite }
  | { op: 'nOf'; n: number; any: Prerequisite[] } // "N der folgenden"
  | { op: 'atLevel'; level: number; then: Prerequisite } // only applies once the owner reaches `level`
  | { op: 'ifOption'; key: string; option: string; then: Prerequisite } // only when the owner picked `option`

  // ── Value thresholds (ref + minimum) ───────────────────────────────────────────
  | { op: 'attr'; attr: Attribute; min: number } // GE ≥ 15
  | { op: 'value'; ref: EntryRef; min: number } // talent FW / KTW / spell·liturgy FW / advantage·SA level ≥ min
  | { op: 'valueSum'; refs: EntryRef[]; min: number } // summed value of the refs ≥ min

  // ── Presence ─────────────────────────────────────────────────────────────────
  | { op: 'has'; ref: EntryRef; option?: string; sameOption?: boolean } // entry present; sameOption = with the owner's chosen option
  | { op: 'granted'; ref: EntryRef } // available only if the char's species/culture/profession grants this entry
  | { op: 'caster' } // Vorteil Zauberer
  | { op: 'priest' } // Vorteil Geweihter
  | { op: 'tradition'; name?: string } // any tradition (or the named one), incl. "Tradition (…)" SF
  | { op: 'karmalTradition' } // has any karmal tradition SA
  | { op: 'leitTradition'; min: number } // Leiteigenschaft of the active tradition ≥ min
  | { op: 'species'; ids: string[] }
  | { op: 'culture'; ids: string[] }
  | { op: 'cultureSocialStatus'; status: string } // the char's culture must offer this social-status tier
  | { op: 'language'; min?: number }
  | { op: 'script' }
  | { op: 'style'; styleKind: 'combat' | 'magic' | 'karmal' | 'skill' } // a matching style SF must grant the owner

  // ── Owner-relative counts (depend on the owner's chosen aspect / Merkmal / spell) ──
  | { op: 'aspectCount'; count: number; min: number } // `count` liturgies/ceremonies of the owner's aspect at FW ≥ min
  | { op: 'merkmalCount'; count: number; min: number } // `count` spells of the owner's Merkmal at FW ≥ min
  | { op: 'selectedSpell'; min: number } // the spell the owner adapted must be at FW ≥ min
  | { op: 'selectedTalent'; min: number } // the owner's chosen talent at FW ≥ min × (specializations in that talent)
  | { op: 'spellExtension'; spell: string; ext: string } // a specific spell extension is learned

  // ── Not machine-checkable ──────────────────────────────────────────────────────
  | { op: 'narrative'; text: string };

/** How reliable the structured AST is for an entry, carried alongside the verbatim text. */
export type PrerequisiteConfidence = 'structured' | 'partial' | 'narrative';
