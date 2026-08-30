import { Injectable } from '@angular/core';
import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { ALL_CULTURES } from '../constants/culture.const';
import { EXPERIENCE_LEVELS } from '../constants/experience-levels.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { ALL_SPECIES } from '../constants/species.const';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { ALL_TALENTS } from '../constants/talent.const';
import { Character } from '../models/base-creation.model';
import { Advantage } from '../models/advantage.model';
import { SpecialAbilityCategory } from '../models/special-ability.model';
import { SpeciesAdvantageRef } from '../models/species.model';
import { ValidationContext, ValidationResult, ValidationRule } from '../models/validation.model';
import { advantageCost, getAdvantageBaseName, getAdvantageQualifier, normName, resolveAdvantageByName, selectionOptionsFor } from '../utils/utils';
import { homebrewApCostOfKind } from '../models/homebrew.model';
import { ALL_SPELLS } from '../constants/spell.const';
import { ALL_RITUALS } from '../constants/ritual.const';
import { ALL_LITURGIES } from '../constants/liturgy.const';
import { ALL_CEREMONIES } from '../constants/ceremony.const';
import { canLearnExtension, SpellExtension } from '../models/magic.model';
import { Requirement } from '../models/requirement.model';
import { EntryRef } from '../models/entry-kind';
import { buildPrerequisite } from '../catalog/build-prerequisite';
import { evaluate, EvalContext, PrereqOwner } from '../catalog/evaluate-prerequisite';
import { getEntry, idFromLabel } from '../catalog/catalog-index';
import { resolvePicksForCharacter } from '../catalog/character-entries';
import { computeSpentAp } from '../utils/ap-budget.util';

const TALENT_NAMES = new Set(ALL_TALENTS.map((t) => normName(t.name)));
/** Human-readable label for an advantage/disadvantage slug (handles `base_option` → "Base (Option)"). */
const ADV_DIS_CATALOG = [...ADVANTAGE, ...DISADVANTAGE];
const advDisLabel = (name: string): string => resolveAdvantageByName(name, ADV_DIS_CATALOG)?.label ?? name;

// Reverse index for `grantedAdvantage`/`grantedDisadvantage` requirements: which species / cultures /
// professions GRANT a given advantage/disadvantage (auto + recommended + typical). A char may take a
// grant-gated entry iff their species OR culture OR profession grants it. Built once at module load
// from the shipped consts (single source of truth) — not baked onto each advantage.
interface GrantSets { species: Set<string>; cultures: Set<string>; professions: Set<string>; }
const refName = (r: SpeciesAdvantageRef | string | { name: string }): string => (typeof r === 'string' ? r : r.name);
function buildGrantIndex(pick: 'adv' | 'dis'): Map<string, GrantSets> {
  const idx = new Map<string, GrantSets>();
  const add = (name: string, bucket: keyof GrantSets, owner: string) => {
    const n = normName(name);
    if (!n) return;
    let g = idx.get(n);
    if (!g) { g = { species: new Set(), cultures: new Set(), professions: new Set() }; idx.set(n, g); }
    g[bucket].add(normName(owner));
  };
  for (const sp of ALL_SPECIES) {
    const lists = pick === 'adv'
      ? [...sp.autoAdvantages, ...sp.recommendedAdvantages, ...sp.typicalAdvantages.flatMap((g) => g.advantages)]
      : [...sp.autoDisadvantages, ...sp.recommendedDisadvantages, ...sp.typicalDisadvantages.flatMap((g) => g.advantages)];
    for (const r of lists) add(refName(r), 'species', sp.name);
  }
  for (const c of ALL_CULTURES) {
    for (const r of pick === 'adv' ? c.typicalAdvantages : c.typicalDisadvantages) add(refName(r), 'cultures', c.name);
  }
  for (const p of ALL_PROFESSIONS) {
    for (const r of pick === 'adv' ? p.advantages : p.disadvantages) add(refName(r), 'professions', p.name);
  }
  return idx;
}
const GRANTED_ADVANTAGE_INDEX = buildGrantIndex('adv');
const GRANTED_DISADVANTAGE_INDEX = buildGrantIndex('dis');

// culture slug → social-status tiers it offers (for `cultureSocialStatus` requirements, e.g. "Adel").
const EMPTY_STATUS: ReadonlySet<string> = new Set();
const CULTURE_SOCIAL_STATUS = new Map<string, Set<string>>(
  ALL_CULTURES.map((c) => [normName(c.name), new Set((c.socialStatus ?? []).map(normName))]),
);

// liturgy/ceremony label (normalized) → its aspect tiers (the `aspect` field is comma-joined),
// for `aspectCount` requirements (e.g. Aspektkenntnis: 3 liturgies/ceremonies of the aspect at FW ≥ 10).
const ASPECT_BY_LITURGY = new Map<string, string[]>(
  [...ALL_LITURGIES, ...ALL_CEREMONIES].map((l) => [normName(l.label), (l.aspect ?? '').split(',').map((a) => normName(a)).filter(Boolean)]),
);
// spell label (normalized) → its Merkmal(e) (the `trait` field is comma-joined), for `merkmalCount`
// requirements (e.g. Merkmalskenntnis: 3 spells of the Merkmal at FW ≥ 10).
const MERKMAL_BY_SPELL = new Map<string, string[]>(
  ALL_SPELLS.map((s) => [normName(s.label), (s.trait ?? '').split(',').map((t) => normName(t)).filter(Boolean)]),
);
// spell/ritual/liturgy/ceremony name AND label (normalized) → the catalog entry, so a row can be
// resolved back to its Erweiterungen. Both keys are indexed because rows store the catalog `name`
// while imported/legacy rows may carry the label.
const EXTENDABLE_BY_NAME = new Map<string, { label: string; extensions?: SpellExtension[] }>();
for (const e of [...ALL_SPELLS, ...ALL_RITUALS, ...ALL_LITURGIES, ...ALL_CEREMONIES]) {
  if (!e.extensions?.length) continue;
  EXTENDABLE_BY_NAME.set(normName(e.name), e);
  EXTENDABLE_BY_NAME.set(normName(e.label), e);
}

// spell/ritual name+label (normalized) → the traditions that know it natively, for the `maxForeignSpells`
// creation cap (a Fremdzauber is one whose traditions don't include the caster's own tradition).
// ALL_SPELL_TRADITIONS is the full tradition vocabulary — the rule only fires for a tradition it knows,
// so an unrecognized tradition name never produces false "foreign" errors.
const SPELL_TRADITIONS = new Map<string, string[]>();
const ALL_SPELL_TRADITIONS = new Set<string>();
for (const s of [...ALL_SPELLS, ...ALL_RITUALS]) {
  const trads = (s.traditions ?? []).map(normName);
  SPELL_TRADITIONS.set(normName(s.name), trads);
  SPELL_TRADITIONS.set(normName(s.label), trads);
  for (const t of trads) ALL_SPELL_TRADITIONS.add(t);
}

@Injectable({ providedIn: 'root' })
export class CharacterValidationService {
  private readonly rules: ValidationRule[] = [
    // One generic cross-catalog evaluator replaces prerequisite-conflict/-required, level-chain,
    // attribute-requirement and special-ability-prerequisite (they all derived from the same prose).
    this.requirementRule(),
    this.speciesRestrictionRule(),
    this.apBudgetRule(),
    this.attributeMaxRule(),
    this.attributePointsRule(),
    this.talentMaxRule(),
    this.combatTechniqueMaxRule(),
    this.spellLiturgyMaxRule(),
    this.spellExtensionRule(),
    this.foreignSpellRule(),
    this.unknownAdvantageRule(),
    this.autoAdvantageRule(),
    this.recommendedSelectionRule(),
    this.advantageLevelMaxRule(),
    this.duplicateAdvantageRule(),
    this.advantageApCapRule(),
    this.disadvantageApCapRule(),
    this.cultureSpeciesRestrictionRule(),
    this.selectionMaxCountRule(),
    this.atypicalSelectionRule(),
    this.ancestralBloodOptionRule(),
    this.outstandingSenseRule(),
  ];

  validate(character: Character): ValidationResult[] {
    const context = this.buildContext(character);
    return this.rules.flatMap((rule) => rule.check(character, context));
  }

  private buildContext(character: Character): ValidationContext {
    return {
      allAdvantages: ADVANTAGE,
      allDisadvantages: DISADVANTAGE,
      allSpecies: ALL_SPECIES,
      allCultures: ALL_CULTURES,
      allSpecialAbilities: ALL_SPECIAL_ABILITIES,
      experienceLevels: EXPERIENCE_LEVELS,
      // Resolve picks from the canonical `entries` core once per validation run; species-auto
      // advantages/disadvantages are marked free (mandatory) for the character's current species.
      picks: resolvePicksForCharacter(character),
    };
  }

  /** Checks species restrictions on advantages. */
  private speciesRestrictionRule(): ValidationRule {
    return {
      id: 'species-restriction',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const allCatalog = [...ctx.allAdvantages, ...ctx.allDisadvantages];

        for (const adv of [...ctx.picks.advantages, ...ctx.picks.disadvantages]) {
          const catalogEntry = allCatalog.find((a) => a.name === adv.name) ?? allCatalog.find((a) => a.name === getAdvantageBaseName(adv.name));
          if (catalogEntry?.speciesRestriction?.length && !catalogEntry.speciesRestriction.includes(character.species)) {
            results.push({
              ruleId: 'species-restriction',
              severity: 'error',
              category: 'species',
              message: `„${adv.label}" ist für die Spezies „${character.species}" nicht verfügbar`,
              source: adv.name,
            });
          }
        }
        return results;
      },
    };
  }

  /** Checks if total AP spent exceeds the budget. Total = the character's `maxAp` (single source,
   *  editable in the overview; an experience level initializes it). No budget set → nothing to check. */
  private apBudgetRule(): ValidationRule {
    return {
      id: 'ap-budget',
      check(character: Character): ValidationResult[] {
        const total = character.maxAp ?? 0;
        if (total <= 0) return [];

        // spent from the single computeSpentAp source — same figure as the live budget bar.
        const totalSpent = computeSpentAp(character);

        if (totalSpent > total) {
          return [
            {
              ruleId: 'ap-budget',
              severity: 'error',
              category: 'budget',
              message: `AP-Budget \u00fcberschritten: ${totalSpent} / ${total} AP`,
              source: 'budget',
            },
          ];
        }
        return [];
      },
    };
  }

  /** Checks that no attribute exceeds the experience level maximum (including species bonuses). */
  private attributeMaxRule(): ValidationRule {
    return {
      id: 'attribute-max',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const experienceLevel = ctx.experienceLevels.find((e) => e.id === character.experienceLevel);
        if (!experienceLevel) return [];

        const attrs: [string, number][] = [
          ['MU', character.attributes.courage],
          ['KL', character.attributes.sagacity],
          ['IN', character.attributes.intuition],
          ['CH', character.attributes.charisma],
          ['FF', character.attributes.dexterity],
          ['GE', character.attributes.agility],
          ['KO', character.attributes.constitution],
          ['KK', character.attributes.strength],
        ];

        const bonuses = new Map<string, number>();
        for (const change of character.maxAttributeChanges) {
          const current = bonuses.get(change.attribute) ?? 0;
          bonuses.set(change.attribute, current + change.modifier);
        }

        for (const [attr, value] of attrs) {
          const bonus = bonuses.get(attr) ?? 0;
          const maxAllowed = experienceLevel.maxAttribute + bonus;
          if (value > maxAllowed) {
            results.push({
              ruleId: 'attribute-max',
              severity: 'error',
              category: 'attribute',
              message: `${attr} (${value}) \u00fcberschreitet das Maximum von ${maxAllowed} f\u00fcr ${experienceLevel.label}`,
              source: attr,
            });
          }
        }
        return results;
      },
    };
  }

  /** Checks that the sum of the 8 base attributes does not exceed the experience level's point cap. */
  private attributePointsRule(): ValidationRule {
    return {
      id: 'attribute-points',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const experienceLevel = ctx.experienceLevels.find((e) => e.id === character.experienceLevel);
        if (!experienceLevel) return [];
        const a = character.attributes;
        const sum = a.courage + a.sagacity + a.intuition + a.charisma + a.dexterity + a.agility + a.constitution + a.strength;
        if (sum > experienceLevel.maxAttributePoints) {
          return [
            {
              ruleId: 'attribute-points',
              severity: 'error',
              category: 'attribute',
              message: `Eigenschaftssumme ${sum} überschreitet das Maximum von ${experienceLevel.maxAttributePoints} für ${experienceLevel.label}`,
              source: 'attribute-points',
            },
          ];
        }
        return [];
      },
    };
  }

  /** Checks that no talent (skill) FW exceeds the experience level maximum (creation cap). */
  private talentMaxRule(): ValidationRule {
    return {
      id: 'talent-max',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const experienceLevel = ctx.experienceLevels.find((e) => e.id === character.experienceLevel);
        if (!experienceLevel) return [];
        const results: ValidationResult[] = [];
        for (const group of Object.values(character.skills)) {
          for (const s of group) {
            if (s.fw > experienceLevel.maxTalent) {
              results.push({
                ruleId: 'talent-max',
                severity: 'error',
                category: 'skill',
                message: `Talent „${s.name}" (FW ${s.fw}) überschreitet das Maximum von ${experienceLevel.maxTalent} für ${experienceLevel.label}`,
                source: s.name,
              });
            }
          }
        }
        return results;
      },
    };
  }

  /** Checks that no combat technique (KTW) exceeds the experience level maximum (creation cap). */
  private combatTechniqueMaxRule(): ValidationRule {
    return {
      id: 'combat-technique-max',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const experienceLevel = ctx.experienceLevels.find((e) => e.id === character.experienceLevel);
        if (!experienceLevel) return [];
        const results: ValidationResult[] = [];
        for (const [name, ct] of Object.entries(character.combatTechniques ?? {})) {
          if (ct.ktw > experienceLevel.maxCombatTechnique) {
            results.push({
              ruleId: 'combat-technique-max',
              severity: 'error',
              category: 'combat',
              message: `Kampftechnik „${name}" (KTW ${ct.ktw}) überschreitet das Maximum von ${experienceLevel.maxCombatTechnique} für ${experienceLevel.label}`,
              source: name,
            });
          }
        }
        return results;
      },
    };
  }

  /** Warns (optional, GM hint) when a species' RECOMMENDED advantages/disadvantages are not chosen —
   *  the counterpart to autoAdvantageRule (which covers the mandatory automatic ones). */
  private recommendedSelectionRule(): ValidationRule {
    const refName = (ref: SpeciesAdvantageRef): string =>
      typeof ref === 'string' ? ref : ref.option ? `${ref.name}_${ref.option}` : ref.name;
    return {
      id: 'recommended-selection',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const species = ctx.allSpecies.find((s) => s.type === character.species);
        if (!species) return [];
        const selected = new Set([...ctx.picks.advantages.map((a) => a.name), ...ctx.picks.disadvantages.map((a) => a.name)]);
        const results: ValidationResult[] = [];
        const check = (refs: readonly SpeciesAdvantageRef[], word: string) => {
          for (const ref of refs) {
            const name = refName(ref);
            if (!selected.has(name) && !selected.has(getAdvantageBaseName(name))) {
              results.push({
                ruleId: 'recommended-selection',
                severity: 'warning',
                category: 'species',
                message: `Empfohlener ${word} „${advDisLabel(name)}" der Spezies „${species.label}" nicht gewählt (optional)`,
                source: name,
              });
            }
          }
        };
        check(species.recommendedAdvantages, 'Vorteil');
        check(species.recommendedDisadvantages, 'Nachteil');
        return results;
      },
    };
  }

  /** Checks spell/liturgy creation caps: each FW ≤ maxTalent, and the count of spells resp. liturgies
   *  ≤ maxSpells. (maxForeignSpells is not checked yet — needs per-spell tradition data.) */
  /**
   * Zauber-/Liturgie-Erweiterungen: each one needs its parent at `requiredSkillValue`, and successive
   * extensions need their predecessor. Nothing checked this — the add-dropdown offers every extension
   * of the entry regardless of FW (its own comment even says "validated later via a message"), and
   * lowering the FW afterwards left an unearned extension sitting on the row.
   *
   * `canLearnExtension` is the shared definition of "may be learned"; it decides, and this rule only
   * works out WHICH half failed so the message can say so.
   */
  private spellExtensionRule(): ValidationRule {
    return {
      id: 'spell-extension',
      check(character: Character): ValidationResult[] {
        const results: ValidationResult[] = [];
        const check = (rows: { spellName: string; fw: number; extensions?: { name: string }[] }[], word: string) => {
          for (const row of rows) {
            if (!row.extensions?.length) continue;
            const entry = EXTENDABLE_BY_NAME.get(normName(row.spellName));
            if (!entry?.extensions?.length) continue;
            const catalog = entry.extensions;
            const resolve = (n: string) => catalog.find((x) => normName(x.name) === normName(n));
            // Canonical slugs of what is actually learned, so `requires` (which holds slugs) matches.
            // Unresolvable picks are legacy/free-text rows — left alone rather than reported as wrong.
            const learned = new Set(row.extensions.map((e) => resolve(e.name)?.name).filter((n): n is string => !!n));

            for (const chosen of row.extensions) {
              const ext = resolve(chosen.name);
              if (!ext || canLearnExtension(ext, row.fw, learned)) continue;
              const missing = (ext.requires ?? []).filter((r) => !learned.has(r)).map((r) => resolve(r)?.label ?? r);
              const reason =
                row.fw < ext.requiredSkillValue
                  ? `benötigt FW ${ext.requiredSkillValue} (aktuell ${row.fw})`
                  : `setzt ${missing.map((m) => `„${m}"`).join(' und ')} voraus`;
              results.push({
                ruleId: 'spell-extension',
                severity: 'error',
                category: 'magic',
                message: `${word} „${ext.label}" von „${entry.label}" ${reason}`,
                source: row.spellName,
              });
            }
          }
        };
        check(character.spells ?? [], 'Zaubererweiterung');
        check(character.liturgies ?? [], 'Liturgieerweiterung');
        return results;
      },
    };
  }

  private spellLiturgyMaxRule(): ValidationRule {
    return {
      id: 'spell-liturgy-max',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const experienceLevel = ctx.experienceLevels.find((e) => e.id === character.experienceLevel);
        if (!experienceLevel) return [];
        const results: ValidationResult[] = [];
        const checkFw = (rows: { spellName: string; fw: number }[], word: string) => {
          for (const r of rows) {
            if (r.fw > experienceLevel.maxTalent) {
              results.push({
                ruleId: 'spell-liturgy-max',
                severity: 'error',
                category: 'magic',
                message: `${word} „${r.spellName}" (FW ${r.fw}) überschreitet das Maximum von ${experienceLevel.maxTalent} für ${experienceLevel.label}`,
                source: r.spellName,
              });
            }
          }
        };
        checkFw(character.spells ?? [], 'Zauber');
        checkFw(character.liturgies ?? [], 'Liturgie');

        const checkCount = (rows: unknown[], word: string, source: string) => {
          if (rows.length > experienceLevel.maxSpells) {
            results.push({
              ruleId: 'spell-liturgy-max',
              severity: 'error',
              category: 'magic',
              message: `${rows.length} ${word} – maximal ${experienceLevel.maxSpells} für ${experienceLevel.label}`,
              source,
            });
          }
        };
        checkCount(character.spells ?? [], 'Zauber/Rituale', 'spell-count');
        checkCount(character.liturgies ?? [], 'Liturgien/Zeremonien', 'liturgy-count');
        return results;
      },
    };
  }

  /** Checks the maxForeignSpells creation cap: spells/rituals whose traditions don't include the
   *  caster's own tradition are Fremdzauber. Only enforced when the caster's tradition is a known
   *  spell tradition (else classification is impossible → no false positives). */
  private foreignSpellRule(): ValidationRule {
    return {
      id: 'foreign-spell-max',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const experienceLevel = ctx.experienceLevels.find((e) => e.id === character.experienceLevel);
        if (!experienceLevel) return [];
        const ownTradition = normName(character.magicTradition ?? '');
        if (!ownTradition || !ALL_SPELL_TRADITIONS.has(ownTradition)) return [];

        const foreign: string[] = [];
        for (const row of character.spells ?? []) {
          const trads = SPELL_TRADITIONS.get(normName(row.spellName));
          if (!trads) continue; // unknown spell → don't guess its tradition
          if (!trads.includes(ownTradition)) foreign.push(row.spellName);
        }
        if (foreign.length > experienceLevel.maxForeignSpells) {
          return [
            {
              ruleId: 'foreign-spell-max',
              severity: 'error',
              category: 'magic',
              message: `${foreign.length} Fremdzauber (fremde Tradition) – maximal ${experienceLevel.maxForeignSpells} für ${experienceLevel.label}`,
              source: 'foreign-spells',
              details: foreign.join(', '),
            },
          ];
        }
        return [];
      },
    };
  }

  /** Flags advantages/disadvantages not found in the known catalog. */
  private unknownAdvantageRule(): ValidationRule {
    return {
      id: 'unknown-advantage',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const knownNames = new Set([...ctx.allAdvantages.map((a) => a.name), ...ctx.allDisadvantages.map((a) => a.name)]);

        for (const adv of [...ctx.picks.advantages, ...ctx.picks.disadvantages]) {
          if (!knownNames.has(adv.name) && !knownNames.has(getAdvantageBaseName(adv.name))) {
            results.push({
              ruleId: 'unknown-advantage',
              severity: 'warning',
              category: 'general',
              message: `„${adv.label}" ist nicht im Regelkatalog vorhanden`,
              source: adv.name,
            });
          }
        }
        return results;
      },
    };
  }

  /** Ensures species auto-advantages/disadvantages are present and marked mandatory. */
  private autoAdvantageRule(): ValidationRule {
    return {
      id: 'auto-advantage',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const species = ctx.allSpecies.find((s) => s.type === character.species);
        if (!species) return [];

        const selectedNames = new Set([...ctx.picks.advantages.map((a) => a.name), ...ctx.picks.disadvantages.map((a) => a.name)]);

        for (const autoAdvRef of species.autoAdvantages) {
          const autoAdv = typeof autoAdvRef === 'string' ? autoAdvRef : autoAdvRef.option ? `${autoAdvRef.name}_${autoAdvRef.option}` : autoAdvRef.name;
          if (!selectedNames.has(autoAdv) && !selectedNames.has(getAdvantageBaseName(autoAdv))) {
            results.push({
              ruleId: 'auto-advantage',
              severity: 'warning',
              category: 'species',
              message: `Automatischer Vorteil „${advDisLabel(autoAdv)}" der Spezies „${species.label}" fehlt`,
              source: autoAdv,
            });
          }
        }

        for (const autoDisRef of species.autoDisadvantages) {
          const autoDis = typeof autoDisRef === 'string' ? autoDisRef : autoDisRef.option ? `${autoDisRef.name}_${autoDisRef.option}` : autoDisRef.name;
          if (!selectedNames.has(autoDis) && !selectedNames.has(getAdvantageBaseName(autoDis))) {
            results.push({
              ruleId: 'auto-advantage',
              severity: 'warning',
              category: 'species',
              message: `Automatischer Nachteil „${advDisLabel(autoDis)}" der Spezies „${species.label}" fehlt`,
              source: autoDis,
            });
          }
        }

        return results;
      },
    };
  }

  /** Validates that no advantage level exceeds its maximum. */
  private advantageLevelMaxRule(): ValidationRule {
    return {
      id: 'advantage-level-max',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const allCatalog = [...ctx.allAdvantages, ...ctx.allDisadvantages];

        for (const adv of [...ctx.picks.advantages, ...ctx.picks.disadvantages]) {
          if (adv.lvl == null) continue;

          const catalogEntry = allCatalog.find((a) => a.name === adv.name) ?? allCatalog.find((a) => a.name === getAdvantageBaseName(adv.name));
          if (catalogEntry?.maxLvl != null && adv.lvl > catalogEntry.maxLvl) {
            results.push({
              ruleId: 'advantage-level-max',
              severity: 'error',
              category: 'level',
              message: `„${adv.label}" Stufe ${adv.lvl} überschreitet das Maximum von ${catalogEntry.maxLvl}`,
              source: adv.name,
            });
          }
        }
        return results;
      },
    };
  }

  /** Selection advantages may only be picked up to `selection.maxCount` times
   *  (e.g. 2 Persönlichkeitsschwächen, 3 Begabungen). Sub-type instances are stored as
   *  `base_qualifier`, so we count by base name. */
  private selectionMaxCountRule(): ValidationRule {
    return {
      id: 'selection-max-count',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const catalog = [...ctx.allAdvantages, ...ctx.allDisadvantages];
        const counts = new Map<string, number>();
        for (const a of [...ctx.picks.advantages, ...ctx.picks.disadvantages]) {
          const base = getAdvantageBaseName(a.name);
          counts.set(base, (counts.get(base) ?? 0) + 1);
        }
        for (const [base, count] of counts) {
          const entry = catalog.find((c) => c.name === base);
          const max = entry?.selection?.maxCount;
          if (max != null && count > max) {
            results.push({
              ruleId: 'selection-max-count',
              severity: 'error',
              category: 'selection',
              message: `Höchstens ${max}× „${entry!.label}" erlaubt (aktuell ${count})`,
              source: base,
            });
          }
        }
        return results;
      },
    };
  }

  /** Detects duplicate advantages (same name appearing multiple times). */
  private duplicateAdvantageRule(): ValidationRule {
    return {
      id: 'duplicate-advantage',
      check(_character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const seen = new Set<string>();

        for (const adv of [...ctx.picks.advantages, ...ctx.picks.disadvantages]) {
          if (seen.has(adv.name)) {
            results.push({
              ruleId: 'duplicate-advantage',
              severity: 'error',
              category: 'duplicate',
              message: `„${adv.label}" ist mehrfach vorhanden`,
              source: adv.name,
            });
          }
          seen.add(adv.name);
        }
        return results;
      },
    };
  }

  /** Checks that total advantage AP cost does not exceed the 80 AP cap. Includes homebrew advantages
   *  (they count toward the same maximum) and uses advantageCost so leveled advantages count fully. */
  private advantageApCapRule(): ValidationRule {
    return {
      id: 'advantage-ap-cap',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const catalogCost = ctx.picks.advantages.filter((a) => !a.mandatory).reduce((sum, a) => sum + advantageCost(a), 0);
        const hbCost = homebrewApCostOfKind(character.homebrew, 'advantage');
        const total = catalogCost + hbCost;

        if (total > 80) {
          return [
            {
              ruleId: 'advantage-ap-cap',
              severity: 'error',
              category: 'budget',
              message: hbCost > 0
                ? `Vorteile kosten insgesamt ${total} AP (inkl. ${hbCost} AP Homebrew) – maximal 80 AP erlaubt`
                : `Vorteile kosten insgesamt ${total} AP – maximal 80 AP erlaubt`,
              source: 'advantage-cap',
            },
          ];
        }
        return [];
      },
    };
  }

  /**
   * Hint (not a hard error) when disadvantages would grant more than the 80-AP cap. The `capDisadvantageAp`
   * toggle decides what actually counts in the budget; this rule makes the situation clear:
   *  - capped on  → only 80 AP are credited (excess disadvantages give nothing);
   *  - capped off → the FULL value is credited (the RAW 80 limit is deliberately disabled).
   */
  private disadvantageApCapRule(): ValidationRule {
    return {
      id: 'disadvantage-ap-cap',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        // Use advantageCost (applies the level multiplier), not the raw per-level `a.cost` — otherwise a
        // leveled disadvantage (e.g. Verpflichtungen II) is under-counted and the cap warning never fires.
        // This must match computeSpentAp's disadvantage sum so the warning and the budget agree — which now
        // also folds in homebrew disadvantages (they count toward the same −80 maximum).
        const totalDisCost =
          ctx.picks.disadvantages.filter((a) => !a.mandatory).reduce((sum, a) => sum + advantageCost(a), 0) +
          homebrewApCostOfKind(character.homebrew, 'disadvantage');
        if (totalDisCost >= -80) return [];

        const chosen = Math.abs(totalDisCost);
        const capped = character.capDisadvantageAp ?? true;
        return [
          {
            ruleId: 'disadvantage-ap-cap',
            severity: 'warning',
            category: 'budget',
            message: capped
              ? `Nachteilsgrenze überschritten: ${chosen} AP an Nachteilen gewählt – es werden nur 80 AP angerechnet, der Rest bringt keine AP.`
              : `Nachteilsgrenze überschritten: ${chosen} AP an Nachteilen gewählt – der volle Wert wird angerechnet (Begrenzung auf 80 AP ist deaktiviert).`,
            source: 'disadvantage-cap',
          },
        ];
      },
    };
  }

  /** Validates that the selected culture is allowed for the character's species. */
  private cultureSpeciesRestrictionRule(): ValidationRule {
    return {
      id: 'culture-species-restriction',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        if (!character.culture) return [];

        const culture = ctx.allCultures.find((c) => c.name === character.culture);
        if (!culture) {
          return [
            {
              ruleId: 'culture-species-restriction',
              severity: 'warning',
              category: 'culture',
              message: `Kultur „${character.culture}" ist nicht im Katalog vorhanden`,
              source: character.culture,
            },
          ];
        }

        if (culture.speciesRestriction.length > 0 && !culture.speciesRestriction.includes(character.species)) {
          return [
            {
              ruleId: 'culture-species-restriction',
              severity: 'error',
              category: 'culture',
              message: `Kultur „${culture.label}" ist für die Spezies „${character.species}" nicht verfügbar (erlaubt: ${culture.speciesRestriction.join(', ')})`,
              source: character.culture,
            },
          ];
        }

        return [];
      },
    };
  }

  /** Flags selected atypical (untypische) advantages/disadvantages — out-of-genre picks that are
   *  only allowed with the GM's approval. Surfaced as a warning, not an error. */
  private atypicalSelectionRule(): ValidationRule {
    const refName = (ref: SpeciesAdvantageRef): string =>
      typeof ref === 'string' ? ref : ref.option ? `${ref.name}_${ref.option}` : ref.name;
    return {
      id: 'atypical-selection',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const species = ctx.allSpecies.find((s) => s.type === character.species);
        if (!species) return [];

        const atypicalAdvNames = new Set(species.atypicalAdvantages.map(refName));
        const atypicalDisNames = new Set(species.atypicalDisadvantages.map(refName));
        const results: ValidationResult[] = [];

        for (const adv of ctx.picks.advantages) {
          if (atypicalAdvNames.has(adv.name) || atypicalAdvNames.has(getAdvantageBaseName(adv.name))) {
            results.push({
              ruleId: 'atypical-selection',
              severity: 'warning',
              category: 'species',
              message: `Untypischer Vorteil „${adv.label}" gewählt – bitte mit dem Spielleiter abstimmen`,
              source: adv.name,
            });
          }
        }

        for (const dis of ctx.picks.disadvantages) {
          if (atypicalDisNames.has(dis.name) || atypicalDisNames.has(getAdvantageBaseName(dis.name))) {
            results.push({
              ruleId: 'atypical-selection',
              severity: 'warning',
              category: 'species',
              message: `Untypischer Nachteil „${dis.label}" gewählt – bitte mit dem Spielleiter abstimmen`,
              source: dis.name,
            });
          }
        }

        return results;
      },
    };
  }

  /** herausragenderSinn: the chosen sense forbids the matching total-loss disadvantage — Sicht → kein
   *  Blind, Gehör → kein Taub. (Was only a narrative note; now checked against the picked disadvantages.) */
  private outstandingSenseRule(): ValidationRule {
    const FORBID: Record<string, string> = { sicht: 'blind', gehoer: 'taub' };
    const label: Record<string, string> = { blind: 'Blind', taub: 'Taub' };
    return {
      id: 'outstanding-sense',
      check(_character: Character, ctx: ValidationContext): ValidationResult[] {
        const disBases = new Set(ctx.picks.disadvantages.map((d) => getAdvantageBaseName(d.name)));
        const results: ValidationResult[] = [];
        for (const a of ctx.picks.advantages) {
          if (getAdvantageBaseName(a.name) !== 'herausragenderSinn') continue;
          const forbidden = FORBID[getAdvantageQualifier(a.name) ?? ''];
          if (forbidden && disBases.has(forbidden)) {
            results.push({
              ruleId: 'outstanding-sense',
              severity: 'error',
              category: 'prerequisite',
              message: `„${a.label}" ist mit dem Nachteil „${label[forbidden]}" nicht möglich`,
              source: a.name,
            });
          }
        }
        return results;
      },
    };
  }

  /** Generic cross-catalog prerequisite evaluator. For every selected advantage/disadvantage and
   *  special ability it builds the id-based Prerequisite AST (build-prerequisite) and runs the pure
   *  evaluator (evaluate-prerequisite) against an EvalContext over the character's full state. A `fail`
   *  becomes an error; a `manual` (narrative) condition surfaces as info, never a hard error. */
  private requirementRule(): ValidationRule {
    const saCatalog = new Map(ALL_SPECIAL_ABILITIES.map((s) => [s.name, s]));
    return {
      id: 'requirement',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const picks = ctx.picks; // advantages/disadvantages/SAs resolved from the canonical entries core
        const attr: Record<string, number> = {
          MU: character.attributes.courage, KL: character.attributes.sagacity, IN: character.attributes.intuition, CH: character.attributes.charisma,
          FF: character.attributes.dexterity, GE: character.attributes.agility, KO: character.attributes.constitution, KK: character.attributes.strength,
        };
        // Value maps keyed by the NORMALIZED catalog slug (AST refs are slugs; the character stores
        // talents/CTs/spells/liturgies by label, so resolve label→slug via the CatalogIndex). The keys
        // must be normName'd because value() looks them up via normName(ref.id) — talent/CT/spell/liturgy
        // slugs are the German labels (capitals/spaces/umlauts), so an un-normalized key never matches.
        const talentValue = new Map<string, number>();
        for (const g of Object.values(character.skills)) for (const t of g) { const id = idFromLabel('talent', t.name); if (id) talentValue.set(normName(id), t.fw); }
        const ctValue = new Map<string, number>();
        for (const [n, ct] of Object.entries(character.combatTechniques ?? {})) { const id = idFromLabel('combatTechnique', n); if (id) ctValue.set(normName(id), ct.ktw); }
        const spellSlug = (label: string) => idFromLabel('spell', label) ?? idFromLabel('ritual', label);
        const liturgySlug = (label: string) => idFromLabel('liturgy', label) ?? idFromLabel('ceremony', label);
        const spellValue = new Map<string, number>(); for (const r of character.spells ?? []) { const id = spellSlug(r.spellName); if (id) spellValue.set(normName(id), r.fw); }
        const liturgyValue = new Map<string, number>(); for (const r of character.liturgies ?? []) { const id = liturgySlug(r.spellName); if (id) liturgyValue.set(normName(id), r.fw); }
        const advAll = [...picks.advantages, ...picks.disadvantages];
        const advHave = new Set<string>(); const advLevel = new Map<string, number>();
        for (const a of advAll) { advHave.add(normName(a.name)); advHave.add(normName(getAdvantageBaseName(a.name))); advLevel.set(normName(getAdvantageBaseName(a.name)), a.lvl ?? 1); }
        const saRefs = [...picks.specialAbilities.general, ...picks.specialAbilities.combat, ...picks.specialAbilities.magic, ...picks.specialAbilities.karmal];
        const saHave = new Set(saRefs.map((r) => normName(r.name)));
        const saLevel = new Map(saRefs.map((r) => [normName(r.name), r.lvl ?? 1]));
        const cantripHave = new Set<string>(); for (const c of character.cantrips ?? []) cantripHave.add(idFromLabel('cantrip', c) ?? normName(c));
        const leit = Math.max(character.magicGuidingAttribute ? attr[character.magicGuidingAttribute] ?? 0 : 0, character.karmalGuidingAttribute ? attr[character.karmalGuidingAttribute] ?? 0 : 0);
        const styleGrants: Record<string, Set<string>> = { combat: new Set(), magic: new Set(), karmal: new Set(), skill: new Set() };
        for (const r of saRefs) {
          const sa = saCatalog.get(r.name); if (!sa?.styleGrants) continue;
          const kind = sa.category === SpecialAbilityCategory.CombatStyle ? 'combat'
            : sa.category === SpecialAbilityCategory.MagicSpellStyle ? 'magic'
              : sa.category === SpecialAbilityCategory.KarmalLiturgyStyle ? 'karmal'
                : sa.category === SpecialAbilityCategory.SkillStyle ? 'skill' : null;
          if (kind) for (const g of sa.styleGrants) styleGrants[kind].add(normName(g));
        }

        const value = (ref: EntryRef): number => {
          const id = normName(ref.id);
          switch (ref.kind) {
            case 'talent': return talentValue.get(id) ?? 0;
            case 'combatTechnique': return ctValue.get(id) ?? 0;
            case 'spell': case 'ritual': return spellValue.get(id) ?? 0;
            case 'liturgy': case 'ceremony': return liturgyValue.get(id) ?? 0;
            case 'advantage': case 'disadvantage': return advLevel.get(id) ?? (advHave.has(id) ? 1 : 0);
            case 'specialAbility': return saLevel.get(id) ?? (saHave.has(id) ? 1 : 0);
            default: return 0;
          }
        };

        const evalCtx: EvalContext = {
          attr: (a) => attr[a] ?? 0,
          value,
          has: (ref, opts) => {
            const id = normName(ref.id);
            if (opts?.sameOption) {
              const ownerOpt = normName(opts.owner?.options?.[0]?.id ?? '');
              return advAll.some((a) => normName(getAdvantageBaseName(a.name)) === id && normName(getAdvantageQualifier(a.name) ?? '') === ownerOpt);
            }
            if (opts?.option) {
              const o = normName(opts.option);
              // A special ability with a specific chosen sub-option (e.g. Geländekunde (Eis- und Schneekundig))
              // is matched against the SA refs by name + param; advantages/disadvantages by base + qualifier.
              if (ref.kind === 'specialAbility') return saRefs.some((r) => normName(r.name) === id && normName(r.param ?? '') === o);
              return advAll.some((a) => normName(getAdvantageBaseName(a.name)) === id && normName(getAdvantageQualifier(a.name) ?? '') === o);
            }
            if (ref.kind === 'specialAbility') return saHave.has(id);
            if (ref.kind === 'cantrip') return cantripHave.has(id);
            return advHave.has(id);
          },
          granted: (ref) => {
            const g = (ref.kind === 'disadvantage' ? GRANTED_DISADVANTAGE_INDEX : GRANTED_ADVANTAGE_INDEX).get(normName(ref.id));
            return !!g && (g.species.has(normName(character.species)) || g.cultures.has(normName(character.culture)) || g.professions.has(normName(character.profession)));
          },
          caster: advHave.has(normName('zauberer')),
          priest: advHave.has(normName('geweihter')),
          tradition: (name) => {
            if (!name) return !!character.magicTradition || !!character.karmalTradition || saRefs.some((ref) => saCatalog.get(ref.name)?.category === SpecialAbilityCategory.MagicTradition || saCatalog.get(ref.name)?.category === SpecialAbilityCategory.KarmalTradition);
            const nn = normName(name);
            return normName(character.magicTradition ?? '') === nn || normName(character.karmalTradition ?? '') === nn || saHave.has(normName(`Tradition (${name})`));
          },
          karmalTradition: saRefs.some((ref) => saCatalog.get(ref.name)?.category === SpecialAbilityCategory.KarmalTradition),
          leitTradition: leit,
          species: (ids) => ids.some((s) => normName(s) === normName(character.species)),
          culture: (ids) => ids.some((c) => normName(c) === normName(character.culture)),
          cultureSocialStatus: (status) => (CULTURE_SOCIAL_STATUS.get(normName(character.culture)) ?? EMPTY_STATUS).has(normName(status)),
          language: (min) => (character.languages ?? []).some((l) => l.lvl >= (min ?? 1)),
          script: (character.scripts ?? []).length > 0,
          style: (kind, ownerLabel) => (kind === 'skill' ? true : styleGrants[kind].has(normName(ownerLabel))),
          aspectCount: (count, min, ownerParam) => {
            if (!ownerParam) return true; // chosen aspect not set yet → indeterminate
            const aspect = normName(ownerParam);
            return (character.liturgies ?? []).filter((row) => (row.fw ?? 0) >= min && (ASPECT_BY_LITURGY.get(normName(row.spellName)) ?? []).includes(aspect)).length >= count;
          },
          merkmalCount: (count, min, ownerParam) => {
            if (!ownerParam) return true; // chosen Merkmal not set yet → indeterminate
            const merkmal = normName(ownerParam);
            return (character.spells ?? []).filter((row) => (row.fw ?? 0) >= min && (MERKMAL_BY_SPELL.get(normName(row.spellName)) ?? []).includes(merkmal)).length >= count;
          },
          selectedSpell: (min, ownerParam) => {
            if (!ownerParam) return true;
            const p = normName(ownerParam);
            return (character.spells ?? []).some((row) => normName(row.spellName) === p && (row.fw ?? 0) >= min);
          },
          // `min` already carries the per-specialization scaling (6/12/18) — the evaluator applies the
          // owner's ordinal, so every instance is checked against ITS own threshold instead of all of
          // them against the highest one (which reported the same error once per specialization).
          selectedTalent: (min, ownerParam) => {
            if (!ownerParam) return true; // chosen talent not set yet → indeterminate
            const t = normName(String(ownerParam).split(':')[0]);
            const fw = Object.values(character.skills).flat().reduce((mx, s) => (normName(s.name) === t ? Math.max(mx, s.fw) : mx), 0);
            return fw >= min;
          },
          spellExtension: (spell, ext) => {
            const sp = normName(spell); const ex = normName(ext);
            return (character.spells ?? []).some((row) => (spellSlug(row.spellName) ?? normName(row.spellName)) === sp && (row.extensions ?? []).some((x) => normName(x.name) === ex));
          },
          label: (ref) => getEntry(ref)?.label ?? ref.id,
        };

        const optsFromName = (name: string): PrereqOwner['options'] => {
          const q = getAdvantageQualifier(name);
          return q ? [{ key: 'option', id: normName(q) }] : [];
        };

        // Number the specializations per talent in pick order: the 1st needs FW 6, the 2nd 12, the
        // 3rd 18. Counted across every SA whose requirement is `selectedTalent`, since the DSA limit
        // ("max. three specializations in one talent") is per TALENT, not per special ability.
        const specializationOrdinal = new Map<(typeof saRefs)[number], number>();
        const specializationsSoFar = new Map<string, number>();
        for (const r of saRefs) {
          if (!saCatalog.get(r.name)?.requirements?.some((q) => q.type === 'selectedTalent')) continue;
          const talent = normName(String(r.param ?? '').split(':')[0]);
          const n = (specializationsSoFar.get(talent) ?? 0) + 1;
          specializationsSoFar.set(talent, n);
          specializationOrdinal.set(r, n);
        }
        const owners: { reqs?: readonly Requirement[]; source: string; word: string; owner: PrereqOwner }[] = [
          ...picks.advantages.map((a) => ({ reqs: a.requirements, source: a.name, word: 'Vorteil', owner: { label: a.label, level: a.lvl ?? 1, options: optsFromName(a.name) } })),
          ...picks.disadvantages.map((a) => ({ reqs: a.requirements, source: a.name, word: 'Nachteil', owner: { label: a.label, level: a.lvl ?? 1, options: optsFromName(a.name) } })),
          ...saRefs.map((r) => {
            const sa = saCatalog.get(r.name);
            // Name the chosen sub-option in the label: several Fertigkeitsspezialisierungen sit in the
            // list under the same name, so "benötigt …" has to say WHICH talent is the problem.
            const base = sa?.label ?? r.name;
            const detail = [r.param, r.area].filter((s) => s?.trim()).join(': '); // "Etikette: Benehmen"
            return {
              reqs: sa?.requirements,
              source: r.name,
              word: 'Sonderfertigkeit',
              owner: {
                label: detail ? `${base} (${detail})` : base,
                level: r.lvl ?? 1,
                param: r.param,
                options: r.param ? [{ key: 'option', id: normName(r.param) }] : [],
                ordinal: specializationOrdinal.get(r),
              },
            };
          }),
        ];

        // ── Mutual-exclusion consolidation ──────────────────────────────────────────
        // A "kein Vorteil/Nachteil X" rule lives on BOTH entries (symmetric data). When two present
        // picks forbid each other, surface ONE "schließen sich gegenseitig aus" message instead of
        // two, and drop the reciprocal forbidden reason from each owner so it isn't double-reported.
        // Only PLAIN forbidden refs count (option-/sameOption-/group-scoped exclusions are conditional
        // and stay per-owner).
        type Owner = (typeof owners)[number];
        const ownerByKey = new Map<string, Owner>();
        for (const o of owners) ownerByKey.set(normName(o.source), o);
        const isPlainForbidden = (r: Requirement) =>
          !!r.forbidden && !r.option && !r.sameOption && r.group == null && r.min == null &&
          (r.type === 'advantage' || r.type === 'disadvantage' || r.type === 'specialAbility');
        const suppress = new Map<string, Set<string>>(); // ownerKey → partner keys folded into a pair message
        const mutualPairs = new Map<string, { a: Owner; b: Owner }>();
        for (const o of owners) {
          const oKey = normName(o.source);
          for (const r of o.reqs ?? []) {
            if (!isPlainForbidden(r)) continue;
            const tKey = normName(r.name);
            const partner = ownerByKey.get(tKey);
            if (!partner) continue; // forbidden target not among the current picks → not a live conflict
            const reciprocal = (partner.reqs ?? []).some((q) => isPlainForbidden(q) && normName(q.name) === oKey);
            if (!reciprocal) continue;
            const [k1, k2] = [oKey, tKey].sort();
            if (!mutualPairs.has(`${k1} ${k2}`)) {
              const a = k1 === oKey ? o : partner;
              const b = k1 === oKey ? partner : o;
              mutualPairs.set(`${k1} ${k2}`, { a, b });
            }
            (suppress.get(oKey) ?? suppress.set(oKey, new Set()).get(oKey)!).add(tKey);
          }
        }
        for (const { a, b } of mutualPairs.values()) {
          results.push({ ruleId: 'requirement', severity: 'error', category: 'prerequisite', message: `„${a.owner.label}" und „${b.owner.label}" schließen sich gegenseitig aus`, source: a.source });
        }

        for (const o of owners) {
          const sup = suppress.get(normName(o.source));
          const reqs = sup ? o.reqs?.filter((r) => !(isPlainForbidden(r) && sup.has(normName(r.name)))) : o.reqs;
          const ast = buildPrerequisite(reqs);
          if (!ast) continue;
          const res = evaluate(ast, evalCtx, o.owner);
          if (res.status === 'fail') {
            results.push({ ruleId: 'requirement', severity: 'error', category: 'prerequisite', message: `„${o.owner.label}" (${o.word}) benötigt: ${res.reasons.join(', ')}`, source: o.source });
          } else if (res.status === 'manual') {
            results.push({ ruleId: 'requirement', severity: 'info', category: 'prerequisite', message: `„${o.owner.label}": Bedingung manuell prüfen – ${res.reasons.join('; ')}`, source: o.source });
          }
        }
        return results;
      },
    };
  }

  /** Ahnenblut gating: an ancestral-blood BENEFIT option (e.g. Dickes Fell) is only allowed if the
   *  character's matching Ahnenblut-(Ahn) advantage of the SAME blood group has one of the required
   *  ancestor types chosen. Data: SelectionOption.requiresAncestor (generated from the benefit's Regel
   *  "Voraussetzungen:" line), keyed to the ancestor selection (AhnenblutAhnArray) via shared selection.param.
   *  When no ancestor type is chosen at all, the generic requirementRule ("benötigt Feenblut (Ahn)") applies. */
  private ancestralBloodOptionRule(): ValidationRule {
    const catalog = ADVANTAGE;
    // blood group (selection.param, e.g. "Feen") → the Ahnenblut-(Ahn) base advantage that picks the type.
    const ancestorBaseByGroup = new Map<string, Advantage>();
    for (const a of catalog) if (a.selection?.id === 'AhnenblutAhnArray' && a.selection.param) ancestorBaseByGroup.set(a.selection.param, a);
    const baseOf = (name: string): Advantage | undefined => catalog.find((c) => c.name === getAdvantageBaseName(name));
    return {
      id: 'ancestral-blood-option',
      check(_character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        // group → the ancestor-type slug the character actually picked (from the AhnenblutAhnArray advantage).
        const chosenAncestor = new Map<string, string>();
        for (const a of ctx.picks.advantages) {
          const base = baseOf(a.name);
          if (base?.selection?.id === 'AhnenblutAhnArray' && base.selection.param) {
            const q = getAdvantageQualifier(a.name);
            if (q) chosenAncestor.set(base.selection.param, q);
          }
        }
        for (const a of ctx.picks.advantages) {
          const base = baseOf(a.name);
          if (base?.selection?.id !== 'AhnenblutArray' || !base.selection.param) continue;
          const q = getAdvantageQualifier(a.name);
          if (!q) continue;
          const opt = selectionOptionsFor(base).find((o) => o.name === q);
          const req = opt?.requiresAncestor;
          if (!req?.length) continue;
          const group = base.selection.param;
          const chosen = chosenAncestor.get(group);
          if (!chosen || req.includes(chosen)) continue; // no type yet (generic rule covers it) or satisfied
          const ancBase = ancestorBaseByGroup.get(group);
          const allowed = req.map((r) => (ancBase ? selectionOptionsFor(ancBase).find((o) => o.name === r)?.label : undefined) ?? r);
          const bloodLabel = (ancBase?.label ?? 'Ahnenblut').replace(/\s*\(Ahn\)\s*$/, '');
          results.push({
            ruleId: 'ancestral-blood-option',
            severity: 'error',
            category: 'prerequisite',
            message: `„${opt?.label ?? q}" ist nur mit ${bloodLabel} (${allowed.join(' oder ')}) wählbar`,
            source: a.name,
          });
        }
        return results;
      },
    };
  }
}
