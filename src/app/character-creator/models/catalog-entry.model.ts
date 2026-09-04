import { SourceReference } from './base-creation.model';
import { EntryKind } from './entry-kind';
import { Prerequisite, PrerequisiteConfidence } from './prerequisite.model';

// The shared identity / cost / prerequisite contract for every *pickable* catalog kind
// (advantages, disadvantages, special abilities, …). Domain-rich catalogs (spells, talents,
// weapons) keep their own extra fields but conform to this contract for identity & rules.
// This is the single shape the generic validation engine and a future homebrew editor reason about.

/** Gendered display names. Only `default` is required; the others override per grammatical gender. */
export interface GenderedName {
  default: string;
  masc?: string;
  fem?: string;
}

export type CostModel =
  | { kind: 'flat'; ap: number }
  | { kind: 'perLevel'; ap: number[] } // ap[i] = AP to reach level i+1 (not cumulative)
  | { kind: 'byFactor'; apPerFactorPoint: number }; // Begabung/Unfähig: ap × Steigerungsfaktor-index of the chosen option

/** One level of a leveled entry. `prerequisites` here gate reaching this level (was `atLevel`). */
export interface LevelDef {
  level: number;
  prerequisites?: Prerequisite;
}

/** One independent sub-choice on an entry. The character stores one ChosenOption per SelectionDef. */
export interface SelectionDef {
  /** Stable scope key for conflict logic & ChosenOption pairing, e.g. 'sense', 'element'. */
  key: string;
  /** Lookup key into SELECTION_OPTIONS (selection-options.const.ts): `id` or `id:param`. */
  optionsSource: string;
  /** How many options must / may be picked (was AdvantageSelection.maxCount). */
  min: number;
  max: number;
  /** Each option may be taken at most once across the whole character. */
  uniquePerCharacter?: boolean;
}

export interface CatalogEntry {
  id: string; // stable slug, unique within `kind`
  kind: EntryKind;
  names: GenderedName; // display only
  cost: CostModel;
  levels?: LevelDef[]; // present ⇔ the entry is leveled
  selections?: SelectionDef[]; // 0..n independent sub-choices
  prerequisites?: Prerequisite; // id-based AST
  prerequisiteText?: string; // verbatim "Voraussetzungen:" prose (display + audit)
  prerequisiteConfidence?: PrerequisiteConfidence;
  sources?: SourceReference[];
  tags?: string[];
  isHomebrew?: boolean;
}
