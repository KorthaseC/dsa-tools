import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { SpecialAbilities, SpecialAbilityRef } from '../models/base-creation.model';
import { ChosenEntry } from '../models/chosen-entry.model';
import { SpecialAbilityCategory } from '../models/special-ability.model';

// Bridge between the runtime Character's split pick fields (advantages / disadvantages /
// specialAbilities buckets) and the unified ChosenEntry[] of the v3 save format. The SA bucket is
// NOT stored in a ChosenEntry — it is derived from the catalog category — so the persisted form
// carries no redundant grouping. Round-trip is lossless because bucketing is a deterministic
// function of the (unchanging) catalog category.

const SA_CATEGORY = new Map<string, SpecialAbilityCategory>(ALL_SPECIAL_ABILITIES.map((s) => [s.name, s.category]));
const COMBAT_CATEGORIES = new Set<string>([
  SpecialAbilityCategory.Combat,
  SpecialAbilityCategory.CombatStyle,
  SpecialAbilityCategory.CombatStyleExtended,
  SpecialAbilityCategory.Command,
  SpecialAbilityCategory.Brawling,
]);

/** The bucket a special ability belongs to, derived from its catalog category (general by default). */
export function bucketForSACategory(category?: SpecialAbilityCategory): keyof SpecialAbilities {
  if (!category) return 'general';
  if (category.startsWith('magic')) return 'magic';
  if (category.startsWith('karmal')) return 'karmal';
  if (COMBAT_CATEGORIES.has(category)) return 'combat';
  return 'general';
}

interface NameLvl {
  name: string;
  lvl?: number;
  mandatory?: boolean; // free/auto-granted advantage (0 AP) — persisted via ChosenEntry.granted
  costOverride?: number; // character-local total-AP override (GM ruling)
}

/** Flatten the split pick fields into one ordered ChosenEntry[] (the v3 canonical pick list). */
export function toChosenEntries(advantages: readonly NameLvl[], disadvantages: readonly NameLvl[], sa: SpecialAbilities): ChosenEntry[] {
  const entries: ChosenEntry[] = [];
  for (const a of advantages) entries.push({ kind: 'advantage', id: a.name, ...(a.lvl != null ? { level: a.lvl } : {}), ...(a.mandatory ? { granted: true } : {}), ...(a.costOverride != null ? { costOverride: a.costOverride } : {}) });
  for (const a of disadvantages) entries.push({ kind: 'disadvantage', id: a.name, ...(a.lvl != null ? { level: a.lvl } : {}), ...(a.mandatory ? { granted: true } : {}), ...(a.costOverride != null ? { costOverride: a.costOverride } : {}) });
  for (const bucket of ['general', 'combat', 'magic', 'karmal'] as const) {
    for (const r of sa[bucket]) {
      entries.push({
        kind: 'specialAbility',
        id: r.name,
        ...(r.lvl != null ? { level: r.lvl } : {}),
        ...(r.param ? { options: [{ key: 'param', id: r.param }] } : {}),
        ...(r.granted ? { granted: true } : {}),
        ...(r.costOverride != null ? { costOverride: r.costOverride } : {}),
      });
    }
  }
  return entries;
}

export interface CharacterPicks {
  advantages: NameLvl[];
  disadvantages: NameLvl[];
  specialAbilities: SpecialAbilities;
}

/** Rebuild the split pick fields from a ChosenEntry[] (SA bucket re-derived from catalog category). */
export function fromChosenEntries(entries: readonly ChosenEntry[] | undefined): CharacterPicks {
  const advantages: NameLvl[] = [];
  const disadvantages: NameLvl[] = [];
  const specialAbilities: SpecialAbilities = { general: [], combat: [], magic: [], karmal: [] };
  for (const e of entries ?? []) {
    const override = e.costOverride != null ? { costOverride: e.costOverride } : {};
    if (e.kind === 'advantage') advantages.push({ name: e.id, ...(e.level != null ? { lvl: e.level } : {}), ...(e.granted ? { mandatory: true } : {}), ...override });
    else if (e.kind === 'disadvantage') disadvantages.push({ name: e.id, ...(e.level != null ? { lvl: e.level } : {}), ...(e.granted ? { mandatory: true } : {}), ...override });
    else if (e.kind === 'specialAbility') {
      const param = e.options?.find((o) => o.key === 'param')?.id;
      const ref: SpecialAbilityRef = { name: e.id, ...(e.level != null ? { lvl: e.level } : {}), ...(param ? { param } : {}), ...(e.granted ? { granted: true } : {}), ...override };
      specialAbilities[bucketForSACategory(SA_CATEGORY.get(e.id))].push(ref);
    }
  }
  return { advantages, disadvantages, specialAbilities };
}
