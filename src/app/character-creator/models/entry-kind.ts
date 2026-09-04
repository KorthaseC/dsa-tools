// The identity layer for the whole catalog. Every catalog entry is uniquely addressed by a
// (kind, id) pair, where `id` is the entry's stable slug (today the `name` field). Cross-kind
// references — prerequisites, selection options, species/culture/profession grants — carry an
// EntryRef instead of a bare German label, so resolution and validation are purely id-based.

export type EntryKind =
  | 'advantage'
  | 'disadvantage'
  | 'specialAbility'
  | 'talent'
  | 'combatTechnique'
  | 'spell'
  | 'ritual'
  | 'cantrip'
  | 'liturgy'
  | 'ceremony'
  | 'blessing'
  | 'species'
  | 'culture'
  | 'profession'
  | 'language'
  | 'script'
  | 'tradition';

/** A typed reference to one catalog entry, e.g. `{ kind: 'talent', id: 'sinnesschaerfe' }`. */
export interface EntryRef {
  kind: EntryKind;
  id: string;
}

/** Stable string key for a reference, used as the CatalogIndex map key: `"talent:sinnesschaerfe"`. */
export function entryRefKey(kind: EntryKind, id: string): string {
  return `${kind}:${id}`;
}

export function refKey(ref: EntryRef): string {
  return entryRefKey(ref.kind, ref.id);
}
