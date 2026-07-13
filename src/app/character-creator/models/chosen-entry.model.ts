import { EntryKind } from './entry-kind';

// One uniform shape for everything the character has *picked* (advantage, disadvantage, special
// ability, …). Carries level AND sub-options in the same place — the "Eintrag mit Level UND
// Subkategorie" case that was previously split across Advantage.lvl, SpecialAbilityRef.lvl/.param
// and the separate selection objects. Picks are stored as a flat ChosenEntry[]; the per-kind lists
// the UI shows are derived selectors over it (filter by `kind`).

/** A resolved sub-choice: the option's stable slug for the selection scope `key`. */
export interface ChosenOption {
  key: string; // matches SelectionDef.key on the catalog entry
  id: string; // option slug (a SELECTION_OPTIONS entry's `name`), not a display label
}

export interface ChosenEntry {
  kind: EntryKind;
  id: string;
  level?: number; // for leveled entries (1 when omitted)
  options?: ChosenOption[]; // one per SelectionDef the entry defines
  granted?: boolean; // granted for free by species/culture/profession → 0 AP
  /** Character-local cost adjustment: the TOTAL AP for this pick, replacing the catalog cost entirely.
   *  GM ruling, character-specific. `granted` (0 AP) still wins over an override. */
  costOverride?: number;
  note?: string; // narrative context / GM ruling
}
