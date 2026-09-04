import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { ALL_SPECIES } from '../constants/species.const';
import { Advantage } from '../models/advantage.model';
import { SpecialAbilities } from '../models/base-creation.model';
import { ChosenEntry } from '../models/chosen-entry.model';
import { SpeciesAdvantageRef } from '../models/species.model';
import { getAdvantageBaseName, resolveAdvantageByName } from '../utils/utils';
import { fromChosenEntries } from './save-entries';

// Selector layer over the canonical ChosenEntry[]: derives the rich runtime pick views
// (resolved advantages/disadvantages + special-ability buckets) from the catalog. This is the
// single read path the validation engine, components and homebrew will share, so all consumers
// reference the one core. resolveAdvantageByName reconstructs cost/label/option/requirements from
// the (slug) name + level, so the derivation is lossless.

export interface ResolvedPicks {
  advantages: Advantage[];
  disadvantages: Advantage[];
  specialAbilities: SpecialAbilities;
}

function resolveRefs(
  refs: readonly { name: string; lvl?: number; mandatory?: boolean; costOverride?: number; text?: string }[],
  catalog: Advantage[]
): Advantage[] {
  return refs.map((ref) => {
    const resolved =
      resolveAdvantageByName(ref.name, catalog, { lvl: ref.lvl, ...(ref.mandatory ? { mandatory: true } : {}) }) ??
      ({ name: ref.name, label: ref.name, cost: 0, ...(ref.lvl != null ? { lvl: ref.lvl } : {}), ...(ref.mandatory ? { mandatory: true } : {}) } as Advantage);
    const costed = ref.costOverride != null ? { ...resolved, costOverride: ref.costOverride } : resolved;
    return ref.text ? { ...costed, text: ref.text } : costed;
  });
}

/** Resolve the canonical entries into the rich runtime pick views (SA bucket from catalog category). */
export function resolvePicks(entries: readonly ChosenEntry[] | undefined): ResolvedPicks {
  const picks = fromChosenEntries(entries);
  return {
    advantages: resolveRefs(picks.advantages, ADVANTAGE),
    disadvantages: resolveRefs(picks.disadvantages, DISADVANTAGE),
    specialAbilities: picks.specialAbilities,
  };
}

const autoRefName = (ref: SpeciesAdvantageRef): string => (typeof ref === 'string' ? ref : ref.option ? `${ref.name}_${ref.option}` : ref.name);

/** The advantage/disadvantage names a species grants automatically (free). */
function speciesAutoNames(speciesType: string | undefined): { adv: Set<string>; dis: Set<string> } {
  const sp = ALL_SPECIES.find((s) => s.type === speciesType);
  return {
    adv: new Set((sp?.autoAdvantages ?? []).map(autoRefName)),
    dis: new Set((sp?.autoDisadvantages ?? []).map(autoRefName)),
  };
}

/**
 * DSA5: a culture grants ONE free Ortskenntnis. The wizard bakes this as a `granted` entry (via
 * applyCulture); the empty-sheet base-edit deliberately does NOT cascade grants, so mark the first
 * bought Ortskenntnis as granted here when the character has a culture and none is already granted-free.
 * Derived (never baked) so removing the culture re-costs it. Exactly one is freed — further ones stay paid.
 */
function markFreeOrtskenntnis(sas: SpecialAbilities, hasCulture: boolean): SpecialAbilities {
  if (!hasCulture) return sas;
  const general = sas.general;
  if (general.some((r) => r.name === 'ortskenntnis' && r.granted)) return sas; // already free
  const idx = general.findIndex((r) => r.name === 'ortskenntnis');
  if (idx < 0) return sas;
  return { ...sas, general: general.map((r, i) => (i === idx ? { ...r, granted: true } : r)) };
}

/**
 * Like resolvePicks, but marks advantages/disadvantages the character's CURRENT species auto-grants as
 * mandatory (free, 0 AP) and the culture's first Ortskenntnis as granted. The freeness is *derived* —
 * never written into the stored entries — so changing the species/culture re-costs them automatically.
 * Read/budget/validation paths use this; the write path (state mutators → toChosenEntries) keeps using
 * the raw resolvePicks so nothing gets baked in.
 */
export function resolvePicksForCharacter(
  character: { species?: string; culture?: string; entries?: readonly ChosenEntry[] } | null | undefined
): ResolvedPicks {
  const picks = resolvePicks(character?.entries);
  const auto = speciesAutoNames(character?.species);
  const markFree = (a: Advantage, set: Set<string>): Advantage =>
    !a.mandatory && (set.has(a.name) || set.has(getAdvantageBaseName(a.name))) ? { ...a, mandatory: true } : a;
  return {
    advantages: picks.advantages.map((a) => markFree(a, auto.adv)),
    disadvantages: picks.disadvantages.map((a) => markFree(a, auto.dis)),
    specialAbilities: markFreeOrtskenntnis(picks.specialAbilities, !!character?.culture?.trim()),
  };
}
