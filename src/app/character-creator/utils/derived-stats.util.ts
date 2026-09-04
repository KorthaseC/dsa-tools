import { Attribute, Attributes, Character, DerivedStats, DerivedValue, PoolValue } from '../models/base-creation.model';
import { Species } from '../models/species.model';
import { getAdvantageBaseName } from './utils';
import { CASTER_ENERGY_BASE, DerivedStatKey, STAT_MODIFIERS, TRADITION_ENERGY_FACTOR } from '../constants/stat-modifiers.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';

// SA slug → permanent AsP lost when its (tradition-artifact) binding is activated.
const SA_PERMANENT_ASP = new Map<string, number>(ALL_SPECIAL_ABILITIES.filter((s) => s.permanentAspCost).map((s) => [s.name, s.permanentAspCost!]));

/** Sum of permanent AsP the character's activated artifact bindings cost — added to the AsP loss. */
function boundPermanentAsp(character: Character): number {
  let sum = 0;
  for (const e of character.entries) if (e.kind === 'specialAbility') sum += SA_PERMANENT_ASP.get(e.id) ?? 0;
  return sum;
}

export const ATTR_KEY: Record<Attribute, keyof Attributes> = {
  MU: 'courage', KL: 'sagacity', IN: 'intuition', CH: 'charisma',
  FF: 'dexterity', GE: 'agility', KO: 'constitution', KK: 'strength',
};

// Single source of truth for DSA5 derived/secondary values. Call this on load AND after
// every edit that touches base attributes, species, advantages/disadvantages or special abilities.
// User inputs (bought / current / permanentLost) on the previous DerivedStats are preserved.
// The "Bonus/Malus" column is now computed from STAT_MODIFIERS (PDF-extracted: Hohe/Niedrige
// Lebens-/Astral-/Karmalkraft, Eisern, Flink, Glück/Pech, …), and caster energy uses the real
// base (20 + round(Faktor × Leiteigenschaft)) instead of a flat 20.
export function recomputeDerivedStats(character: Character, species?: Species): DerivedStats {
  const a: Attributes = character.attributes;
  const base = species?.baseStats ?? { le: 0, sk: 0, zk: 0, gs: 0 };
  const prev = character.derived;

  const hasZauberer = character.entries.some((e) => e.kind === 'advantage' && getAdvantageBaseName(e.id) === 'zauberer');
  const hasGeweihter = character.entries.some((e) => e.kind === 'advantage' && getAdvantageBaseName(e.id) === 'geweihter');
  const mod = statModBonuses(character);

  return {
    // LeP = Grundwert der Spezies + 2 × KO (+ Hohe/Niedrige Lebenskraft)
    lifePoints: pool(base.le + 2 * a.constitution, mod.lifePoints, prev.lifePoints),
    // AsP = 20 + round(Faktor × Leiteigenschaft) (+ Hohe/Niedrige Astralkraft) − gebundene Artefakte — 0 ohne Zauberer
    astralPoints: pool(hasZauberer ? casterEnergyBase(character, 'magic') : 0, mod.astralPoints, prev.astralPoints, boundPermanentAsp(character)),
    // KaP = 20 + round(Faktor × Leiteigenschaft) (+ Hohe/Niedrige Karmalkraft) — 0 ohne Geweihter
    karmaPoints: pool(hasGeweihter ? casterEnergyBase(character, 'karmal') : 0, mod.karmaPoints, prev.karmaPoints),
    // SK = Grundwert der Spezies + (MU + KL + IN) / 6 (+ Hohe/Niedrige Seelenkraft)
    spirit: derived(base.sk + Math.round((a.courage + a.sagacity + a.intuition) / 6), mod.spirit, prev.spirit),
    // ZK = Grundwert der Spezies + (2 × KO + KK) / 6 (+ Hohe/Niedrige Zähigkeit)
    toughness: derived(base.zk + Math.round((a.constitution + a.constitution + a.strength) / 6), mod.toughness, prev.toughness),
    // AW = GE / 2 (+ Verbessertes Ausweichen, …)
    dodge: derived(Math.floor(a.agility / 2), mod.dodge, prev.dodge),
    // INI = (MU + GE) / 2 (+ Kampfreflexe, …)
    initiative: derived(Math.round((a.courage + a.agility) / 2), mod.initiative, prev.initiative),
    // GS = Grundwert der Spezies (+ Flink, − Behäbig)
    movement: derived(base.gs, mod.movement, prev.movement),
    // WS = KO / 2 (+ Eisern, − Gläsern)
    woundThreshold: derived(Math.round(a.constitution / 2), mod.woundThreshold, prev.woundThreshold),
    // Schicksalspunkte: Grundwert 3 (+ Glück, − Pech)
    fatePoints: pool(3, mod.fatePoints, prev.fatePoints),
  };
}

// Sum every STAT_MODIFIERS entry the character holds, scaling perLevel modifiers by the entry's level.
// Keyed by the catalog slug. Reads the canonical `entries` core directly (only name + level needed —
// no catalog resolution).
function statModBonuses(character: Character): Record<DerivedStatKey, number> {
  const acc: Record<DerivedStatKey, number> = {
    lifePoints: 0, astralPoints: 0, karmaPoints: 0, spirit: 0, toughness: 0,
    dodge: 0, initiative: 0, movement: 0, woundThreshold: 0, fatePoints: 0,
  };
  for (const ref of character.entries) {
    const mods = STAT_MODIFIERS[ref.id] ?? STAT_MODIFIERS[getAdvantageBaseName(ref.id)];
    if (!mods) continue;
    for (const m of mods) acc[m.stat] += m.flat ?? (m.perLevel ?? 0) * (ref.level ?? 1);
  }
  return acc;
}

// Caster energy base = 20 + round(Faktor × Leiteigenschaft). Faktor is the tradition's caster-type
// multiplier (Voll = 1, Halb/Viertel = 0.5/0.25); defaults to 1 when the tradition is unknown.
function casterEnergyBase(character: Character, kind: 'magic' | 'karmal'): number {
  const tradition = kind === 'magic' ? character.magicTradition : character.karmalTradition;
  const guiding = (kind === 'magic' ? character.magicGuidingAttribute : character.karmalGuidingAttribute) as Attribute | undefined;
  const info = tradition ? TRADITION_ENERGY_FACTOR[tradition] : undefined;
  const factor = info?.factor ?? 1;
  const leitCode = (guiding ?? (info?.leit as Attribute | undefined)) || undefined;
  const leitVal = leitCode && ATTR_KEY[leitCode] ? character.attributes[ATTR_KEY[leitCode]] : 0;
  return CASTER_ENERGY_BASE + Math.round(factor * leitVal);
}

function pool(baseValue: number, modBonus: number, prev: PoolValue | undefined, extraLost = 0): PoolValue {
  const bonus = modBonus;
  const bought = prev?.bought ?? 0;
  const manualLost = prev?.permanentLost ?? 0;
  // Effective loss = the manual/user permanentLost PLUS auto losses from bound artifacts (extraLost).
  // extraLost is recomputed fresh each pass (never persisted) so it can't double-count; the stored
  // `permanentLost` stays the manual value.
  const totalLost = manualLost + extraLost;
  // Bought-back permanent points restore the loss (capped at what was lost; the normal Zukauf `bought`
  // is a separate, attribute-capped purchase). netLost is the loss still in effect.
  const boughtBack = Math.min(prev?.boughtBack ?? 0, totalLost);
  const netLost = totalLost - boughtBack;
  const max = baseValue + bonus + bought - netLost;
  // Preserve a previously stored "current" (clamped); a fresh pool (current 0) fills to max.
  const current = prev && prev.current > 0 ? Math.min(prev.current, max) : max;
  // autoLost = the program-derived portion of the loss (e.g. bound artifacts) so the UI can show the
  // combined loss (manual + auto) in one field while keeping `permanentLost` editable as the manual part.
  return { base: baseValue, bonus, bought, max, current, permanentLost: manualLost, autoLost: extraLost, boughtBack };
}

function derived(baseValue: number, modBonus: number, prev: DerivedValue | undefined): DerivedValue {
  const bonus = modBonus;
  const bought = prev?.bought ?? 0;
  return { base: baseValue, bonus, bought, max: baseValue + bonus + bought };
}
