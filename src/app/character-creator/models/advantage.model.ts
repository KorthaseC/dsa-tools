import { NamedEntry, SourceReference } from './base-creation.model';
import { Requirement } from './requirement.model';

/** One pickable sub-type of a selection advantage (e.g. a specific Persönlichkeitsschwäche). */
export interface SelectionOption {
  name: string;
  label: string;
  cost?: number; // per-option AP cost, when it differs between options
  /** Steigerungsfaktor (A–E) of the underlying skill, for SF-priced advantages (Begabung, Unfähig, …). */
  factor?: string;
  /** Other option names that must be picked first (build-up chains, e.g. magical ranks). */
  requires?: string[];
  /** Ancestral-blood gating: this option is only available if the character's matching Ahnenblut (Ahn)
   *  advantage has one of these ancestor-type option slugs chosen (e.g. Dickes Fell → grosserbiestinger/satyr). */
  requiresAncestor?: string[];
  /** Species slugs this option is restricted to, when applicable. */
  speciesRestriction?: string[];
}

/** Sub-category selection on an advantage. The lookup key into SELECTION_OPTIONS
 *  (selection-options.const.ts) is `param ? `${id}:${param}` : id`. */
export interface AdvantageSelection {
  id: string; // selection source, e.g. 'PaktArray', 'WesenArray', 'PersonArray'
  /** The PDF selection-call argument that types/filters the option list,
   *  e.g. 'Magischer Rang' for TitelArray, 'Drachen' for AhnenblutArray. */
  param?: string;
  maxCount?: number; // how many sub-types may be picked (e.g. 2 Persönlichkeitsschwächen)
}

export interface Advantage extends NamedEntry {
  cost: number;
  lvl?: number;
  maxLvl?: number;
  /** Absolute AP for each level (from the PDF, `costLevels[i]` = level i+1). Present ⇔ leveled with a
   *  per-level table; the chosen level's cost is `costLevels[lvl-1]` (handles non-linear Einkommen). */
  costLevels?: number[];
  mandatory?: boolean;
  /** Character-local total-AP override (GM ruling). When set, replaces the computed cost. */
  costOverride?: number;
  /** Verbatim "Voraussetzung(en):" rule text from the PDF, for display (narrative conditions). */
  prerequisiteText?: string;
  /** Structured, machine-checkable prerequisites (parsed at build time from prerequisiteText). */
  requirements?: Requirement[];
  speciesRestriction?: string[];
  type?: string; // PDF category: 'Profan' | 'Magisch' | 'Karmal'
  speciesSpecific?: boolean; // PDF marked it '*' (only via species/culture/profession)
  selection?: AdvantageSelection;
  /** `cost` is per Steigerungsfaktor-point: effective cost = cost × SF-index of the chosen option
   *  (Begabung, Unfähig, Herausragende Fertigkeit/Kampftechnik, Waffenbegabung). */
  costBySteigerungsfaktor?: boolean;
}
