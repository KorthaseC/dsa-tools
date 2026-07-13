import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { ALL_TALENTS } from '../constants/talent.const';
import { ALL_COMBAT_TECHNIQUES } from '../constants/combat-technique.const';
import { ALL_SPELLS } from '../constants/spell.const';
import { ALL_RITUALS } from '../constants/ritual.const';
import { ALL_CANTRIPS } from '../constants/cantrip.const';
import { ALL_LITURGIES } from '../constants/liturgy.const';
import { ALL_CEREMONIES } from '../constants/ceremony.const';
import { ALL_BLESSINGS } from '../constants/blessing.const';
import { ALL_SPECIES } from '../constants/species.const';
import { ALL_CULTURES } from '../constants/culture.const';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { SpecialAbilityCategory } from '../models/special-ability.model';
import { EntryKind, EntryRef, entryRefKey, refKey } from '../models/entry-kind';

// The single (kind, id) → entry resolution layer over all catalogs. This is the identity backbone
// of the id-based architecture: prerequisites, selections and grants resolve through here instead
// of matching German labels. Built once at module load from the committed const files.

export interface IndexedEntry {
  kind: EntryKind;
  id: string; // the entry's stable slug (its `name`)
  label: string; // display label
  raw: unknown; // the original catalog object (Advantage | SpecialAbility | Spell | …)
}

/** Minimal identity shape every indexed catalog object satisfies today. */
interface IdentityLike {
  name: string;
  label: string;
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');

const byKey = new Map<string, IndexedEntry>();
const byKind = new Map<EntryKind, IndexedEntry[]>();
const idByNormalizedLabel = new Map<string, string>(); // `${kind}:${normLabel}` → id
const duplicateKeys: string[] = [];

function register(kind: EntryKind, items: readonly IdentityLike[]): void {
  const list = byKind.get(kind) ?? [];
  for (const item of items) {
    const entry: IndexedEntry = { kind, id: item.name, label: item.label, raw: item };
    const key = entryRefKey(kind, item.name);
    if (byKey.has(key)) duplicateKeys.push(key);
    byKey.set(key, entry);
    list.push(entry);
    idByNormalizedLabel.set(`${kind}:${norm(item.label)}`, item.name);
  }
  byKind.set(kind, list);
}

register('advantage', ADVANTAGE as IdentityLike[]);
register('disadvantage', DISADVANTAGE as IdentityLike[]);
register('specialAbility', ALL_SPECIAL_ABILITIES as IdentityLike[]);
register('talent', ALL_TALENTS as IdentityLike[]);
register('combatTechnique', ALL_COMBAT_TECHNIQUES as IdentityLike[]);
register('spell', ALL_SPELLS as IdentityLike[]);
register('ritual', ALL_RITUALS as IdentityLike[]);
register('cantrip', ALL_CANTRIPS as IdentityLike[]);
register('liturgy', ALL_LITURGIES as IdentityLike[]);
register('ceremony', ALL_CEREMONIES as IdentityLike[]);
register('blessing', ALL_BLESSINGS as IdentityLike[]);
register('species', ALL_SPECIES as IdentityLike[]);
register('culture', ALL_CULTURES as IdentityLike[]);
register('profession', ALL_PROFESSIONS as IdentityLike[]);

// language / script / tradition are special-ability subsets, addressed under their own kind so a
// requirement can say `{ kind: 'tradition', id }` without caring that it lives in the SA catalog.
const saByCategory = (cats: SpecialAbilityCategory[]): IdentityLike[] =>
  (ALL_SPECIAL_ABILITIES as (IdentityLike & { category: SpecialAbilityCategory })[]).filter((sa) => cats.includes(sa.category));

register('language', saByCategory([SpecialAbilityCategory.Language]));
register('script', saByCategory([SpecialAbilityCategory.Script]));
register('tradition', saByCategory([SpecialAbilityCategory.MagicTradition, SpecialAbilityCategory.KarmalTradition]));

export const CATALOG_INDEX: ReadonlyMap<string, IndexedEntry> = byKey;

/** Slugs that collided within their kind (should be empty — asserted by data-integrity.spec). */
export const CATALOG_DUPLICATE_KEYS: readonly string[] = duplicateKeys;

export function hasEntry(ref: EntryRef): boolean {
  return byKey.has(refKey(ref));
}

export function getEntry(ref: EntryRef): IndexedEntry | undefined {
  return byKey.get(refKey(ref));
}

export function entriesOfKind(kind: EntryKind): readonly IndexedEntry[] {
  return byKind.get(kind) ?? [];
}

/** Best-effort label → id resolution within a kind (for migration / display fallbacks). */
export function idFromLabel(kind: EntryKind, label: string): string | undefined {
  return idByNormalizedLabel.get(`${kind}:${norm(label)}`);
}
