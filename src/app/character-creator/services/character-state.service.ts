import { computed, Injectable, signal } from '@angular/core';
import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { ALL_CEREMONIES } from '../constants/ceremony.const';
import { ALL_CULTURES, DEFAULT_SOCIAL_STATUS } from '../constants/culture.const';
import { ALL_LITURGIES } from '../constants/liturgy.const';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { ALL_RITUALS } from '../constants/ritual.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { ALL_SPECIES } from '../constants/species.const';
import { ALL_SPELLS } from '../constants/spell.const';
import { ALL_TALENTS } from '../constants/talent.const';
import { ApBudget, Attribute, Attributes, Bio, Character, Currency, DerivedStats, DerivedValue, Equipment, LanguageRef, PoolValue, ScriptRef, SkillGroups, SpecialAbilities, SpecialAbilityRef, createEmptyCharacter } from '../models/base-creation.model';
import { Culture } from '../models/culture.model';
import { ExperienceLevel } from '../models/experience-level.model';
import { createEmptyMagicRow, MagicRow } from '../models/magic-row.model';
import { Profession, ProfessionAdvantageRef, ProfessionGrant } from '../models/profession.model';
import { Advantage } from '../models/advantage.model';
import { Species, SpeciesType } from '../models/species.model';
import { ATTR_KEY, recomputeDerivedStats } from '../utils/derived-stats.util';
import { getAdvantageBaseName, resolveAdvantageByName, selectionOptionsFor } from '../utils/utils';
import { computeSpentAp } from '../utils/ap-budget.util';
import { bucketForSACategory, toChosenEntries } from '../catalog/save-entries';
import { resolvePicks, resolvePicksForCharacter } from '../catalog/character-entries';
import { resolveSAGrant } from '../catalog/sa-grants';
import { HomebrewEntry } from '../models/homebrew.model';
import { EXPERIENCE_LEVELS } from '../constants/experience-levels.const';
import { createDefaultSaveData } from '../models/character-save.model';
import { CharacterResolverService } from './character-resolver.service';

// DI-free resolver instance for draft (de)serialization — reused so the state service needs no injection
// context (unit tests `new` it directly). toSaveData/resolve are pure functions of their input.
const RESOLVER = new CharacterResolverService();

// Re-exported so existing consumers (profession-step, special-abilities, languages-scripts) keep importing it from here.
export { specialAbilityCost } from '../utils/ap-budget.util';

// Structural shape covering spell/ritual and liturgy/ceremony catalog entries.
interface MagicCatalogEntry {
  name: string;
  check: [string, string, string];
  increaseFactor: string;
  trait?: string;
  aspect?: string;
  cost?: string;
  castTime?: string;
  range?: string;
  duration?: string;
  effect?: string;
  page?: string;
}

const TALENT_CATEGORY = new Map<string, keyof SkillGroups>(ALL_TALENTS.map((t) => [t.name, t.category as keyof SkillGroups]));

// Label→name lookups for resolving PDF-extracted profession package references.

// Base German language name → language-SA name, for the culture's free mother tongue.
const normLang = (s: string) => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const LANG_BY_BASE = new Map<string, string>(
  ALL_SPECIAL_ABILITIES.filter((s) => (s.category as string) === 'language').map((s) => [normLang(s.label.replace(/^Sprache:\s*/i, '')), s.name])
);
/** The culture's mother-tongue SA name (its first listed language), or null when undetermined. */
function cultureMotherTongue(culture: Culture): string | null {
  const first = (culture.language || '').split(/ oder | und |[,/]/i)[0].replace(/\s*\(.*?\)/g, '').trim();
  return LANG_BY_BASE.get(normLang(first)) ?? null;
}
const SPELL_BY_LABEL = new Map(ALL_SPELLS.map((s) => [s.label.toLowerCase(), s]));
const RITUAL_BY_LABEL = new Map(ALL_RITUALS.map((s) => [s.label.toLowerCase(), s]));
const LITURGY_BY_LABEL = new Map(ALL_LITURGIES.map((s) => [s.label.toLowerCase(), s]));
const CEREMONY_BY_LABEL = new Map(ALL_CEREMONIES.map((s) => [s.label.toLowerCase(), s]));

// SA slug → bucket (general/combat/magic/karmal), used to drop orphaned magic/karmal SAs on removal.
const SA_BUCKET = new Map<string, keyof SpecialAbilities>(ALL_SPECIAL_ABILITIES.map((s) => [s.name, bucketForSACategory(s.category)]));

// SA slug → catalog entry, to look up a granted SF's selection options when mapping a grant param.
const SA_BY_NAME = new Map(ALL_SPECIAL_ABILITIES.map((s) => [s.name, s]));
const normOpt = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
/**
 * Map a profession SF grant's param (a human label, often with a "…: Gebiet" area placeholder, e.g.
 * "Etikette: Gebiet") to the SF's SELECTION option value (the option `name`, e.g. "Etikette") so the
 * sub-option dropdown actually shows it. The dropdown binds `ref.param` against `optionValue="name"`, so a
 * raw label-with-placeholder never matched. Falls back to the original param when nothing resolves (free-text selections).
 */
function grantParamToOption(saName: string, param: string): string {
  const sa = SA_BY_NAME.get(saName);
  const opts = sa ? selectionOptionsFor(sa) : [];
  if (!opts.length) return param;
  const core = param.split(':')[0].trim(); // "Etikette: Gebiet" → "Etikette"
  const hit =
    opts.find((o) => normOpt(o.name) === normOpt(core) || normOpt(o.label) === normOpt(core)) ??
    opts.find((o) => normOpt(o.name) === normOpt(param) || normOpt(o.label) === normOpt(param));
  return hit ? hit.name : param;
}

/** Whether a character holds an advantage with the given base slug (e.g. 'zauberer'). */
const hasAdv = (c: Character, base: string): boolean => c.entries.some((e) => e.kind === 'advantage' && getAdvantageBaseName(e.id) === base);

@Injectable({ providedIn: 'root' })
export class CharacterStateService {
  public character = signal<Character | null>(createEmptyCharacter());
  public experienceLevel = signal<ExperienceLevel | null>(null);
  public selectedSpecies = signal<Species | null>(null);

  public autoAdvDeselectable = signal(false);
  public recommendedAdvDeselectable = signal(false);

  // Atypical (untypische) entries are out-of-genre picks needing GM approval — locked by default.
  public atypicalAdvUnlocked = signal(false);
  public atypicalDisadvUnlocked = signal(false);

  // GM cost adjustment: when unlocked, advantage/disadvantage/SA cost fields become editable
  // (writes ChosenEntry.costOverride). Shared across the traits + special-abilities tabs; UI-only, not saved.
  public costOverrideUnlocked = signal(false);

  // Tradition fields (Leiteigenschaft / Merkmal(Aspekt) / Tradition) are normally set automatically from the
  // profession — locked by default; this unlocks the magic + liturgy dropdowns for manual edits. UI-only, not saved.
  public traditionFieldsUnlocked = signal(false);

  // ─── Draft persistence (sessionStorage) ──────────────────────────────────────
  // Opt-in via enablePersistence() (called once at app startup), so unit tests that `new` this service
  // never touch storage or cross-contaminate. When on, every commit auto-saves the working character;
  // sessionStorage survives a reload (e.g. after a render glitch), clears on tab close, and is per-tab
  // (no cross-tab clobber). Client-only — no server. Reuses the canonical save serialization.
  private static readonly DRAFT_KEY = 'dsa-cc-draft';
  private persistEnabled = false;
  private draftTimer: ReturnType<typeof setTimeout> | null = null;

  /** Called once at app startup: restore the last draft, then auto-save on every mutation. */
  enablePersistence(): void {
    if (this.persistEnabled) return;
    this.persistEnabled = true;
    this.restoreDraft();
  }

  readonly species = computed(() => this.selectedSpecies());

  /** Live AP budget (total / spent / available). Total = the character's `maxAp` (the single budget
   *  source, editable in the overview; an experience level initializes it), spent = computeSpentAp. */
  public ap = computed<ApBudget>(() => {
    const c = this.character();
    if (!c) return { total: 0, spent: 0, available: 0 };
    const total = c.maxAp || (this.experienceLevel()?.ap ?? 0);
    const spent = computeSpentAp(c);
    return { total, spent, available: total - spent };
  });

  /** Resolved pick views (advantages/disadvantages + SA buckets) from the canonical `entries` core.
   *  The single read path for components — replaces the former character.advantages/specialAbilities fields. */
  readonly picks = computed(() => resolvePicksForCharacter(this.character()));

  /** Whether the character has the Zauberer / Geweihter base advantage (gates magic/karmal UI). */
  readonly isZauberer = computed(() => this.hasAdvantage('zauberer'));
  readonly isGeweihter = computed(() => this.hasAdvantage('geweihter'));

  private hasAdvantage(base: string): boolean {
    const c = this.character();
    return !!c && c.entries.some((e) => e.kind === 'advantage' && getAdvantageBaseName(e.id) === base);
  }

  isCurrentStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.experienceLevel() !== null;
      case 1:
        return this.selectedSpecies() !== null;
      // später mehr cases
      default:
        return false;
    }
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  /**
   * The single mutation choke-point: applies `fn`, enforces the caster/priest data invariant, and ALWAYS
   * recomputes derived stats afterwards, so base/bonus/max can never drift (recompute preserves the user
   * inputs bought/current/permanentLost). Every mutator routes through here; no-op when no character is set.
   */
  private commit(fn: (c: Character) => Character): void {
    this.character.update((c) => {
      if (!c) return c;
      let next = fn(c);
      // Removing Zauberer/Geweihter clears the now-orphaned magic/karmal data, so there is never a
      // hidden entry that costs AP but can't be seen or removed (the tabs are gated by the advantage).
      if (hasAdv(c, 'zauberer') && !hasAdv(next, 'zauberer')) next = this.clearMagic(next);
      if (hasAdv(c, 'geweihter') && !hasAdv(next, 'geweihter')) next = this.clearKarmal(next);
      return { ...next, derived: recomputeDerivedStats(next, this.speciesFor(next)) };
    });
    if (this.persistEnabled) this.scheduleDraftSave(this.character());
  }

  /** Drop all magic data (spells, cantrips, magic tradition + magic SAs) — used when Zauberer is removed. */
  private clearMagic(c: Character): Character {
    return {
      ...c,
      spells: [],
      cantrips: [],
      magicTradition: undefined,
      magicGuidingAttribute: undefined,
      entries: c.entries.filter((e) => !(e.kind === 'specialAbility' && SA_BUCKET.get(e.id) === 'magic')),
    };
  }

  /** Drop all karmal data (liturgies, blessings, karmal tradition + karmal SAs) — used when Geweihter is removed. */
  private clearKarmal(c: Character): Character {
    return {
      ...c,
      liturgies: [],
      blessings: [],
      karmalTradition: undefined,
      karmalGuidingAttribute: undefined,
      entries: c.entries.filter((e) => !(e.kind === 'specialAbility' && SA_BUCKET.get(e.id) === 'karmal')),
    };
  }

  /** Shallow-merges a partial patch into the current character. */
  patchCharacter(patch: Partial<Character>): void {
    this.commit((c) => ({ ...c, ...patch }));
  }

  /** Updates one equipment list (closeCombat/rangeCombat/armor/shields/general) immutably. */
  updateEquipmentList<K extends keyof Equipment>(key: K, updater: (list: Equipment[K]) => Equipment[K]): void {
    this.commit((c) => ({ ...c, equipment: { ...c.equipment, [key]: updater(c.equipment[key]) } }));
  }

  /** Replaces the spell list (Zauber & Rituale). */
  updateSpells(updater: (rows: MagicRow[]) => MagicRow[]): void {
    this.commit((c) => ({ ...c, spells: updater(c.spells) }));
  }

  /** Replaces the liturgy list (Liturgien & Zeremonien). */
  updateLiturgies(updater: (rows: MagicRow[]) => MagicRow[]): void {
    this.commit((c) => ({ ...c, liturgies: updater(c.liturgies) }));
  }

  /** Replaces the cantrip list (Zaubertricks). */
  updateCantrips(updater: (list: string[]) => string[]): void {
    this.commit((c) => ({ ...c, cantrips: updater(c.cantrips) }));
  }

  /** Merges a partial currency (Geldbeutel) patch. */
  updateCurrency(patch: Partial<Currency>): void {
    this.commit((c) => ({ ...c, currency: { ...c.currency, ...patch } }));
  }

  /** Replaces the blessing list (Segnungen). */
  updateBlessings(updater: (list: string[]) => string[]): void {
    this.commit((c) => ({ ...c, blessings: updater(c.blessings) }));
  }

  /** Updates the character-specific homebrew entries (display + AP only). */
  updateHomebrew(updater: (list: HomebrewEntry[]) => HomebrewEntry[]): void {
    this.commit((c) => ({ ...c, homebrew: updater(c.homebrew) }));
  }

  /** Sets the experience level: the signal AND the character's `experienceLevel` id + `maxAp` (so caps/AP/validation resolve during the wizard, not just after import). */
  setExperienceLevel(level: ExperienceLevel): void {
    this.experienceLevel.set(level);
    this.commit((c) => ({ ...c, experienceLevel: level.id, maxAp: level.ap }));
  }

  /** Sets the total AP budget directly (`maxAp`) — e.g. free creation without an experience level, or a
   *  GM adjustment. `maxAp` is the single budget source read by the `ap` computed and the ap-budget rule. */
  setTotalAp(total: number | null): void {
    this.commit((c) => ({ ...c, maxAp: Math.max(0, total ?? 0) }));
  }

  /** Toggle the DSA5 80-AP disadvantage cap (on = only 80 AP counted; off = full disadvantage value). */
  setCapDisadvantageAp(cap: boolean): void {
    this.commit((c) => ({ ...c, capDisadvantageAp: cap }));
  }

  /** Merges a partial bio patch. */
  updateBio(patch: Partial<Bio>): void {
    this.commit((c) => ({ ...c, bio: { ...c.bio, ...patch } }));
  }

  /** Updates the advantages list immutably (writes the canonical `entries`); recomputes derived. */
  updateAdvantages(updater: (list: Advantage[]) => Advantage[]): void {
    this.commit((c) => {
      const cur = resolvePicks(c.entries);
      return { ...c, entries: toChosenEntries(updater(cur.advantages), cur.disadvantages, cur.specialAbilities) };
    });
  }

  /** Updates the disadvantages list immutably (writes the canonical `entries`); recomputes derived. */
  updateDisadvantages(updater: (list: Advantage[]) => Advantage[]): void {
    this.commit((c) => {
      const cur = resolvePicks(c.entries);
      return { ...c, entries: toChosenEntries(cur.advantages, updater(cur.disadvantages), cur.specialAbilities) };
    });
  }

  /** Updates one special-ability bucket (general/combat/magic/karmal); writes the canonical `entries`. */
  updateSpecialAbilities(bucket: keyof SpecialAbilities, updater: (list: SpecialAbilityRef[]) => SpecialAbilityRef[]): void {
    this.commit((c) => {
      const cur = resolvePicks(c.entries);
      const sa = { ...cur.specialAbilities, [bucket]: updater(cur.specialAbilities[bucket]) };
      return { ...c, entries: toChosenEntries(cur.advantages, cur.disadvantages, sa) };
    });
  }

  /** Updates the languages list (Sprachen). */
  updateLanguages(updater: (list: LanguageRef[]) => LanguageRef[]): void {
    this.commit((c) => ({ ...c, languages: updater(c.languages) }));
  }

  /** Updates the scripts list (Schriften). */
  updateScripts(updater: (list: ScriptRef[]) => ScriptRef[]): void {
    this.commit((c) => ({ ...c, scripts: updater(c.scripts) }));
  }

  /** Sets the species (canonical type or custom string), its AP cost, and recomputes derived (base stats change). */
  setSpecies(species: string): void {
    this.commit((c) => {
      const sp = ALL_SPECIES.find((s) => s.type === species);
      return { ...c, species, speciesCost: sp?.apCost ?? 0 };
    });
  }

  /** Sets the culture (canonical name or custom string) and its AP cost. */
  setCulture(culture: string): void {
    const cost = ALL_CULTURES.find((c) => c.name === culture)?.apCost ?? 0;
    this.commit((c) => ({ ...c, culture, cultureCost: cost }));
  }

  /**
   * Wizard 5c: applies a culture package — sets culture + cost, **resets skills to the culture
   * baseline** (FW bonuses by talent category) and defaults social status. Idempotent on re-apply;
   * profession skills layer on after (consistent with reset-downstream).
   */
  applyCulture(culture: Culture, useCulturePackage = true): void {
    this.commit((c) => {
      // Skills = culture package (+ the CURRENT profession's skills, so changing culture after a profession
      // was chosen doesn't drop the profession's talent bonuses). Sum on collision — same as applyProfession.
      const skills: SkillGroups = { physical: [], social: [], nature: [], knowledge: [], crafts: [] };
      const addSkill = (label: string, fw: number) => {
        const cat = TALENT_CATEGORY.get(label);
        if (!cat) return;
        const existing = skills[cat].find((s) => s.name === label);
        if (existing) existing.fw += fw;
        else skills[cat].push({ name: label, fw });
      };
      if (useCulturePackage) culture.culturePackage.forEach((s) => addSkill(s.skill, s.bonus));
      const profession = c.profession ? ALL_PROFESSIONS.find((p) => p.name === c.profession) : undefined;
      profession?.skills.forEach((s) => addSkill(s.label, s.bonus));
      // Free mother tongue (level 3) from the culture's first language; replace any prior one.
      const motherSa = cultureMotherTongue(culture);
      const languages: LanguageRef[] = [...c.languages.filter((l) => !l.mother), ...(motherSa ? [{ name: motherSa, lvl: 3, mother: true }] : [])];
      // Free Ortskenntnis for the home region (keep an existing granted one, else add a blank entry).
      // The town starts empty on purpose: "Heimatort" is the input's placeholder, and seeding it as a
      // real value made every character ship with a home town literally called "Heimatort".
      const cur = resolvePicks(c.entries);
      const general = [...cur.specialAbilities.general];
      if (!general.some((s) => s.name === 'ortskenntnis' && s.granted)) general.push({ name: 'ortskenntnis', param: '', granted: true });
      const sa = { ...cur.specialAbilities, general };
      // Default to "Frei" and keep whatever the player already chose. Taking culture.socialStatus[0]
      // made every culture that lists "Adel" start the hero off as nobility — that list holds the
      // tiers a culture ADDITIONALLY offers, not its default.
      const bio: Bio = { ...c.bio, socialStatus: c.bio.socialStatus || DEFAULT_SOCIAL_STATUS };
      return { ...c, culture: culture.name, cultureCost: culture.apCost, useCulturePackage, skills, languages, entries: toChosenEntries(cur.advantages, cur.disadvantages, sa), bio };
    });
  }

  /** Toggle the culture package; re-applies the active culture (and profession, if chosen, to re-layer skills). */
  setUseCulturePackage(use: boolean): void {
    const culture = ALL_CULTURES.find((cu) => cu.name === this.character()?.culture);
    if (!culture) {
      this.commit((c) => ({ ...c, useCulturePackage: use }));
      return;
    }
    this.applyCulture(culture, use);
    const profession = ALL_PROFESSIONS.find((p) => p.name === this.character()?.profession);
    if (profession) this.applyProfession(profession);
  }

  /** Set the free mother-tongue language (level 3), replacing the previous one. */
  setMotherTongue(name: string | null): void {
    this.updateLanguages((list) => [...list.filter((l) => !l.mother), ...(name ? [{ name, lvl: 3, mother: true }] : [])]);
  }

  /**
   * Replace the culture's free Ortskenntnis home regions with the given town list.
   *
   * Towns are stored exactly as typed. Normalising here would fight the two-way bound input in the
   * culture step: a trimmed value gets written straight back into the field, so a trailing space is
   * swallowed the moment it is typed and multi-word town names become impossible to enter.
   *
   * Blanking every town keeps ONE entry with an empty param instead of dropping the SA — the
   * Ortskenntnis itself is granted by the culture, only the town is user input, so clearing the
   * field must not silently forfeit a free special ability.
   */
  setOrtskenntnisTowns(towns: string[]): void {
    const named = towns.filter((t) => t.trim());
    const kept = named.length === 0 && towns.length > 0 ? [''] : named;
    this.updateSpecialAbilities('general', (list) => [
      ...list.filter((s) => !(s.name === 'ortskenntnis' && s.granted)),
      ...kept.map((t) => ({ name: 'ortskenntnis', param: t, granted: true } as SpecialAbilityRef)),
    ]);
  }

  /**
   * Wizard 5d: applies a profession package. Skills are rebuilt = culture package + profession
   * (idempotent); combat techniques set to the profession's; advantages/SAs/spells/liturgies/
   * blessings added best-effort (resolved by label, deduped). See plan "Known gaps" re: revert.
   */
  applyProfession(profession: Profession): void {
    this.commit((c) => {
      const culture = ALL_CULTURES.find((cu) => cu.name === c.culture);
      // Replace, don't accumulate: strip the PREVIOUSLY applied profession's grants (advantages,
      // disadvantages, SFs, spells, liturgies, cantrips, blessings) before layering the new profession,
      // so switching professions doesn't leave stale entries from the earlier one.
      const oldProf = c.profession ? ALL_PROFESSIONS.find((p) => p.name === c.profession) : undefined;
      const old = oldProf ? this.professionGrantKeys(oldProf) : undefined;

      // skills = culture package + profession skills (sum on collision)
      const skills: SkillGroups = { physical: [], social: [], nature: [], knowledge: [], crafts: [] };
      const addSkill = (label: string, fw: number) => {
        const cat = TALENT_CATEGORY.get(label);
        if (!cat) return;
        const existing = skills[cat].find((s) => s.name === label);
        if (existing) existing.fw += fw;
        else skills[cat].push({ name: label, fw });
      };
      if (c.useCulturePackage) culture?.culturePackage.forEach((s) => addSkill(s.skill, s.bonus));
      profession.skills.forEach((s) => addSkill(s.label, s.bonus));

      const combatTechniques: Record<string, { ktw: number }> = {};
      // Combat-technique grants are increments above the base KTW 6 (e.g. "Dolche 2" → KTW 8).
      profession.combatTechniques.forEach((ct) => (combatTechniques[ct.label] = { ktw: 6 + ct.ktw }));

      // Apply the profession's granted advantages AND disadvantages (mandatory per DSA), with the
      // correct sub-option/level from the canonical refs. (Current picks resolved from the entries core.)
      const cur = resolvePicks(c.entries);
      const advantages = cur.advantages.filter((a) => !old?.advNames.has(a.name));
      const disadvantages = cur.disadvantages.filter((a) => !old?.disNames.has(a.name));
      const applyGrant = (ref: ProfessionAdvantageRef, list: Advantage[], catalog: Advantage[]) => {
        const adv = resolveAdvantageByName(ref.option ? `${ref.name}_${ref.option}` : ref.name, catalog, { lvl: ref.lvl });
        if (adv && !list.some((a) => a.name === adv.name)) list.push(adv);
      };
      for (const ref of profession.advantages) applyGrant(ref, advantages, ADVANTAGE);
      for (const ref of profession.disadvantages) applyGrant(ref, disadvantages, DISADVANTAGE);

      // Apply each granted SA into its bucket (best-effort label→name; parameterized SAs that don't
      // resolve are skipped). Cantrips go to the character's Zaubertricks.
      const specialAbilities = {
        general: cur.specialAbilities.general.filter((s) => !old?.saNames.general.has(s.name)),
        combat: cur.specialAbilities.combat.filter((s) => !old?.saNames.combat.has(s.name)),
        magic: cur.specialAbilities.magic.filter((s) => !old?.saNames.magic.has(s.name)),
        karmal: cur.specialAbilities.karmal.filter((s) => !old?.saNames.karmal.has(s.name)),
      };
      const applySa = (bucketKey: keyof SpecialAbilities, bucket: SpecialAbilityRef[], grants: ProfessionGrant[]) => {
        for (const grant of grants) {
          // Kind-aware resolution (shared with the core audit): specific "Label (Param)" SF first, else
          // bare label / curated alias. A bare placeholder keeps the param as its chosen sub-option.
          const r = resolveSAGrant(bucketKey, grant);
          if (!r || bucket.some((x) => x.name === r.name)) continue;
          bucket.push(r.specific || !grant.param ? { name: r.name } : { name: r.name, param: grantParamToOption(r.name, grant.param) });
        }
      };
      applySa('general', specialAbilities.general, profession.generalSpecialAbilities);
      applySa('combat', specialAbilities.combat, profession.combatSpecialAbilities);
      applySa('magic', specialAbilities.magic, profession.magicSpecialAbilities);
      applySa('karmal', specialAbilities.karmal, profession.karmalSpecialAbilities);
      const cantrips = [...new Set([...c.cantrips.filter((x) => !old?.cantrips.has(x)), ...profession.cantrips])];

      const spells = c.spells.filter((r) => !old?.spellNames.has(r.spellName));
      for (const g of profession.spells) {
        const entry = SPELL_BY_LABEL.get(g.label.toLowerCase()) ?? RITUAL_BY_LABEL.get(g.label.toLowerCase());
        if (entry && !spells.some((r) => r.spellName === entry.name)) spells.push(this.magicRowFrom(entry, g.fw, false));
      }
      const liturgies = c.liturgies.filter((r) => !old?.liturgyNames.has(r.spellName));
      for (const g of profession.liturgies) {
        const entry = LITURGY_BY_LABEL.get(g.label.toLowerCase()) ?? CEREMONY_BY_LABEL.get(g.label.toLowerCase());
        if (entry && !liturgies.some((r) => r.spellName === entry.name)) liturgies.push(this.magicRowFrom(entry, g.fw, true));
      }

      const blessings = [...new Set([...c.blessings.filter((b) => !old?.blessings.has(b)), ...profession.blessings])];
      const isKarmal = profession.category === 'karmal';

      // Raise attributes to the profession's required minima so its granted SFs' attribute prerequisites
      // are met immediately (no spurious errors). Only raises, never lowers; skips non-attribute reqs (AE/…).
      const attributes = { ...c.attributes };
      for (const req of profession.attributeRequirements) {
        const key = ATTR_KEY[req.attribute as Attribute];
        if (key) attributes[key] = Math.max(attributes[key], req.min);
      }

      // Auto buy back the permanent AsP the profession's granted artifact bindings cost — the package
      // covers them (max AsP stays; the pAsP × 2 buy-back AP joins the profession cost). commit()'s
      // recompute caps boughtBack at the actual loss, so switching/re-applying self-corrects.
      const grantedPAsP = profession.magicSpecialAbilities.reduce((s, g) => {
        const r = resolveSAGrant('magic', g);
        return s + (r ? SA_BY_NAME.get(r.name)?.permanentAspCost ?? 0 : 0);
      }, 0);
      const derived = grantedPAsP
        ? { ...c.derived, astralPoints: { ...c.derived.astralPoints, boughtBack: (c.derived.astralPoints.boughtBack ?? 0) + grantedPAsP } }
        : c.derived;

      const next: Character = {
        ...c,
        profession: profession.name,
        professionCost: profession.apCost,
        attributes,
        derived,
        skills,
        combatTechniques,
        entries: toChosenEntries(advantages, disadvantages, specialAbilities),
        cantrips,
        spells,
        liturgies,
        blessings,
        // The profession step is where languages/scripts are chosen; start clean but keep the culture's
        // free mother tongue.
        languages: c.languages.filter((l) => l.mother),
        scripts: [],
        magicTradition: isKarmal ? c.magicTradition : profession.tradition || c.magicTradition,
        karmalTradition: isKarmal ? profession.tradition || c.karmalTradition : c.karmalTradition,
        magicGuidingAttribute: isKarmal ? c.magicGuidingAttribute : profession.guidingAttribute || c.magicGuidingAttribute,
        karmalGuidingAttribute: isKarmal ? profession.guidingAttribute || c.karmalGuidingAttribute : c.karmalGuidingAttribute,
      };
      return next;
    });
  }

  /**
   * The identity keys a profession contributes to each additive bucket, resolved with the SAME logic
   * as applyProfession. Used to REMOVE a previously applied profession's grants when switching, so
   * professions replace rather than accumulate. (Skills/combat techniques/languages are rebuilt from
   * scratch in applyProfession, so they need no diffing here.)
   */
  private professionGrantKeys(profession: Profession) {
    const advNames = new Set<string>();
    for (const ref of profession.advantages) {
      const a = resolveAdvantageByName(ref.option ? `${ref.name}_${ref.option}` : ref.name, ADVANTAGE, { lvl: ref.lvl });
      if (a) advNames.add(a.name);
    }
    const disNames = new Set<string>();
    for (const ref of profession.disadvantages) {
      const a = resolveAdvantageByName(ref.option ? `${ref.name}_${ref.option}` : ref.name, DISADVANTAGE, { lvl: ref.lvl });
      if (a) disNames.add(a.name);
    }
    const saNames: Record<keyof SpecialAbilities, Set<string>> = { general: new Set(), combat: new Set(), magic: new Set(), karmal: new Set() };
    const collect = (bucket: keyof SpecialAbilities, grants: ProfessionGrant[]) => {
      for (const g of grants) {
        const r = resolveSAGrant(bucket, g);
        if (r) saNames[bucket].add(r.name);
      }
    };
    collect('general', profession.generalSpecialAbilities);
    collect('combat', profession.combatSpecialAbilities);
    collect('magic', profession.magicSpecialAbilities);
    collect('karmal', profession.karmalSpecialAbilities);
    const spellNames = new Set<string>();
    for (const g of profession.spells) {
      const e = SPELL_BY_LABEL.get(g.label.toLowerCase()) ?? RITUAL_BY_LABEL.get(g.label.toLowerCase());
      if (e) spellNames.add(e.name);
    }
    const liturgyNames = new Set<string>();
    for (const g of profession.liturgies) {
      const e = LITURGY_BY_LABEL.get(g.label.toLowerCase()) ?? CEREMONY_BY_LABEL.get(g.label.toLowerCase());
      if (e) liturgyNames.add(e.name);
    }
    return { advNames, disNames, saNames, spellNames, liturgyNames, cantrips: new Set(profession.cantrips), blessings: new Set(profession.blessings) };
  }

  private magicRowFrom(entry: MagicCatalogEntry, fw: number, isLiturgy: boolean): MagicRow {
    const row = createEmptyMagicRow();
    row.spellName = entry.name;
    row.probe = [entry.check[0], entry.check[1], entry.check[2]];
    row.fw = fw;
    row.increaseFactor = String(entry.increaseFactor ?? '');
    row.trait = String((isLiturgy ? entry.aspect : entry.trait) ?? '');
    row.cost = entry.cost ?? '';
    row.castTime = entry.castTime ?? '';
    row.range = entry.range ?? '';
    row.duration = entry.duration ?? '';
    row.effect = entry.effect ?? '';
    row.page = entry.page ?? '';
    return row;
  }

  /** Sets the profession (canonical name or custom string) and its AP cost. */
  setProfession(profession: string): void {
    const cost = ALL_PROFESSIONS.find((p) => p.name === profession)?.apCost ?? 0;
    this.commit((c) => ({ ...c, profession, professionCost: cost }));
  }

  /**
   * Sets one user-input field of a derived stat (bonus/bought/current/permanentLost).
   * commit() recomputes so `base`/`max` stay consistent (and preserves bought/current/permanentLost).
   */
  updateDerived<S extends keyof DerivedStats>(stat: S, field: keyof PoolValue | keyof DerivedValue, value: number): void {
    this.commit((c) => {
      const current = c.derived[stat] as unknown as Record<string, number>;
      return { ...c, derived: { ...c.derived, [stat]: { ...current, [field]: value } } };
    });
  }

  /** Sets one base attribute (commit recomputes derived stats live: LeP/WS/AsP/…). */
  setAttribute(key: keyof Attributes, value: number): void {
    this.commit((c) => ({ ...c, attributes: { ...c.attributes, [key]: value } }));
  }

  /** Recomputes derived stats for the current character (e.g. after advantage changes). */
  recomputeDerived(): void {
    this.commit((c) => c);
  }

  private speciesFor(c: Character): Species | undefined {
    return ALL_SPECIES.find((s) => s.type === (c.species as SpeciesType)) ?? this.selectedSpecies() ?? undefined;
  }

  /** Restore the working character from the sessionStorage draft (via the defensive import path), so a
   *  reload keeps the in-progress character. Also re-links the experience-level + species signals by id. */
  private restoreDraft(): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      const raw = sessionStorage.getItem(CharacterStateService.DRAFT_KEY);
      if (!raw) return;
      // Merge over defaults so an older draft missing a newer field still resolves; a truly incompatible
      // draft throws and is caught below (→ fresh start).
      const saveData = { ...createDefaultSaveData(), ...(JSON.parse(raw) as object) };
      const character = RESOLVER.resolve(saveData);
      this.character.set(character);
      this.experienceLevel.set(EXPERIENCE_LEVELS.find((e) => e.id === character.experienceLevel) ?? null);
      this.selectedSpecies.set(ALL_SPECIES.find((s) => s.type === character.species) ?? null);
    } catch {
      /* no/corrupt draft or storage unavailable → start fresh */
    }
  }

  /** Debounced write of the working character to sessionStorage (canonical save serialization). */
  private scheduleDraftSave(c: Character | null): void {
    if (typeof sessionStorage === 'undefined') return;
    if (this.draftTimer) clearTimeout(this.draftTimer);
    this.draftTimer = setTimeout(() => {
      try {
        if (c) sessionStorage.setItem(CharacterStateService.DRAFT_KEY, JSON.stringify(RESOLVER.toSaveData(c)));
        else sessionStorage.removeItem(CharacterStateService.DRAFT_KEY);
      } catch {
        /* storage full/disabled → skip (non-fatal) */
      }
    }, 400);
  }

}
