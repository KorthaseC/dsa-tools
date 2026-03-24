import { Injectable } from '@angular/core';
import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { ALL_CULTURES } from '../constants/culture.const';
import { EXPERIENCE_LEVELS } from '../constants/experience-levels.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { ALL_SPECIES } from '../constants/species.const';
import { Character } from '../models/base-creation.model';
import { SpecialAbilityCategory } from '../models/special-ability.model';
import { ValidationContext, ValidationResult, ValidationRule } from '../models/validation.model';
import { checkPrerequisiteConflict, getAdvantageBaseName } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class CharacterValidationService {
  private readonly rules: ValidationRule[] = [
    this.prerequisiteConflictRule(),
    this.prerequisiteRequiredRule(),
    this.levelChainRule(),
    this.speciesRestrictionRule(),
    this.attributeRequirementRule(),
    this.apBudgetRule(),
    this.attributeMaxRule(),
    this.unknownAdvantageRule(),
    this.autoAdvantageRule(),
    this.advantageLevelMaxRule(),
    this.duplicateAdvantageRule(),
    this.advantageApCapRule(),
    this.disadvantageApCapRule(),
    this.cultureSpeciesRestrictionRule(),
    this.specialAbilityPrerequisiteRule(),
  ];

  validate(character: Character): ValidationResult[] {
    const context = this.buildContext();
    return this.rules.flatMap((rule) => rule.check(character, context));
  }

  private buildContext(): ValidationContext {
    return {
      allAdvantages: ADVANTAGE,
      allDisadvantages: DISADVANTAGE,
      allSpecies: ALL_SPECIES,
      allCultures: ALL_CULTURES,
      allSpecialAbilities: ALL_SPECIAL_ABILITIES,
      experienceLevels: EXPERIENCE_LEVELS,
    };
  }

  /** Checks that no selected advantage/disadvantage conflicts with another (required: false). */
  private prerequisiteConflictRule(): ValidationRule {
    return {
      id: 'prerequisite-conflict',
      check(character: Character, _ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const all = [...character.advantages, ...(character.disadvantages ?? [])];
        const allNames = all.map((a) => a.name);

        for (const adv of all) {
          for (const prereq of adv.prerequisite) {
            if (!prereq.required && checkPrerequisiteConflict(adv.name, prereq.name, allNames)) {
              const conflicting = all.find((a) => a.name === prereq.name) ?? all.find((a) => getAdvantageBaseName(a.name) === prereq.name);
              results.push({
                ruleId: 'prerequisite-conflict',
                severity: 'error',
                category: 'conflict',
                message: `„${adv.label}" ist nicht kompatibel mit „${conflicting?.label ?? prereq.name}"`,
                source: adv.name,
              });
            }
          }
        }
        return results;
      },
    };
  }

  /** Checks that all positive prerequisites (required: true) are present. */
  private prerequisiteRequiredRule(): ValidationRule {
    return {
      id: 'prerequisite-required',
      check(character: Character): ValidationResult[] {
        const results: ValidationResult[] = [];
        const all = [...character.advantages, ...(character.disadvantages ?? [])];
        const allNames = all.map((a) => a.name);
        const allBaseNames = new Set(allNames.map((n) => getAdvantageBaseName(n)));

        for (const adv of all) {
          for (const prereq of adv.prerequisite) {
            if (prereq.required && !allNames.includes(prereq.name) && !allBaseNames.has(prereq.name)) {
              results.push({
                ruleId: 'prerequisite-required',
                severity: 'error',
                category: 'prerequisite',
                message: `„${adv.label}" benötigt die Voraussetzung „${prereq.name}"`,
                source: adv.name,
              });
            }
          }
        }
        return results;
      },
    };
  }

  /** Validates level-based prerequisites (minLvl on prerequisites). */
  private levelChainRule(): ValidationRule {
    return {
      id: 'level-chain',
      check(character: Character): ValidationResult[] {
        const results: ValidationResult[] = [];
        const all = [...character.advantages, ...(character.disadvantages ?? [])];

        for (const adv of all) {
          for (const prereq of adv.prerequisite) {
            if (prereq.minLvl != null) {
              const hasPrereqAtLevel = all.some((a) => a.name === prereq.name && (a.lvl ?? 1) >= prereq.minLvl!);
              if (!hasPrereqAtLevel) {
                results.push({
                  ruleId: 'level-chain',
                  severity: 'error',
                  category: 'level',
                  message: `„${adv.label}" benötigt „${prereq.name}" auf Stufe ${prereq.minLvl}`,
                  source: adv.name,
                });
              }
            }
          }
        }
        return results;
      },
    };
  }

  /** Checks species restrictions on advantages. */
  private speciesRestrictionRule(): ValidationRule {
    return {
      id: 'species-restriction',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const allCatalog = [...ctx.allAdvantages, ...ctx.allDisadvantages];

        for (const adv of [...character.advantages, ...(character.disadvantages ?? [])]) {
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

  /** Checks minimum attribute values required by advantages. */
  private attributeRequirementRule(): ValidationRule {
    return {
      id: 'attribute-requirement',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const allCatalog = [...ctx.allAdvantages, ...ctx.allDisadvantages];
        const attrMap: Record<string, number> = {
          MU: character.attributes.courage,
          KL: character.attributes.sagacity,
          IN: character.attributes.intuition,
          CH: character.attributes.charisma,
          FF: character.attributes.dexterity,
          GE: character.attributes.agility,
          KO: character.attributes.constitution,
          KK: character.attributes.strength,
        };

        for (const adv of [...character.advantages, ...(character.disadvantages ?? [])]) {
          const catalogEntry = allCatalog.find((a) => a.name === adv.name) ?? allCatalog.find((a) => a.name === getAdvantageBaseName(adv.name));
          if (catalogEntry?.attributeRequirement) {
            for (const req of catalogEntry.attributeRequirement) {
              const currentValue = attrMap[req.attribute] ?? 0;
              if (currentValue < req.minValue) {
                results.push({
                  ruleId: 'attribute-requirement',
                  severity: 'error',
                  category: 'attribute',
                  message: `„${adv.label}" benötigt ${req.attribute} \u2265 ${req.minValue} (aktuell: ${currentValue})`,
                  source: adv.name,
                });
              }
            }
          }
        }
        return results;
      },
    };
  }

  /** Checks if total AP spent exceeds the experience level budget. */
  private apBudgetRule(): ValidationRule {
    return {
      id: 'ap-budget',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const experienceLevel = ctx.experienceLevels.find((e) => e.id === character.experienceLevel);
        if (!experienceLevel) return [];

        const advCost = character.advantages.reduce((sum, a) => sum + (a.mandatory ? 0 : a.cost), 0);
        const disCost = (character.disadvantages ?? []).reduce((sum, a) => sum + (a.mandatory ? 0 : a.cost), 0);
        const totalSpent = advCost + disCost + (character.speciesCost ?? 0);

        if (totalSpent > experienceLevel.ap) {
          return [
            {
              ruleId: 'ap-budget',
              severity: 'error',
              category: 'budget',
              message: `AP-Budget \u00fcberschritten: ${totalSpent} / ${experienceLevel.ap} AP`,
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

  /** Flags advantages/disadvantages not found in the known catalog. */
  private unknownAdvantageRule(): ValidationRule {
    return {
      id: 'unknown-advantage',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const knownNames = new Set([...ctx.allAdvantages.map((a) => a.name), ...ctx.allDisadvantages.map((a) => a.name)]);

        for (const adv of [...character.advantages, ...(character.disadvantages ?? [])]) {
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

        const selectedNames = new Set([...character.advantages.map((a) => a.name), ...(character.disadvantages ?? []).map((a) => a.name)]);

        for (const autoAdv of species.autoAdvantages) {
          if (!selectedNames.has(autoAdv) && !selectedNames.has(getAdvantageBaseName(autoAdv))) {
            results.push({
              ruleId: 'auto-advantage',
              severity: 'warning',
              category: 'species',
              message: `Automatischer Vorteil „${autoAdv}" der Spezies „${species.label}" fehlt`,
              source: autoAdv,
            });
          }
        }

        for (const autoDis of species.autoDisadvantages) {
          if (!selectedNames.has(autoDis) && !selectedNames.has(getAdvantageBaseName(autoDis))) {
            results.push({
              ruleId: 'auto-advantage',
              severity: 'warning',
              category: 'species',
              message: `Automatischer Nachteil „${autoDis}" der Spezies „${species.label}" fehlt`,
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

        for (const adv of [...character.advantages, ...(character.disadvantages ?? [])]) {
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

  /** Detects duplicate advantages (same name appearing multiple times). */
  private duplicateAdvantageRule(): ValidationRule {
    return {
      id: 'duplicate-advantage',
      check(character: Character): ValidationResult[] {
        const results: ValidationResult[] = [];
        const seen = new Set<string>();

        for (const adv of [...character.advantages, ...(character.disadvantages ?? [])]) {
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

  /** Checks that total advantage AP cost does not exceed the 80 AP cap. */
  private advantageApCapRule(): ValidationRule {
    return {
      id: 'advantage-ap-cap',
      check(character: Character): ValidationResult[] {
        const totalAdvCost = character.advantages.filter((a) => !a.mandatory).reduce((sum, a) => sum + a.cost, 0);

        if (totalAdvCost > 80) {
          return [
            {
              ruleId: 'advantage-ap-cap',
              severity: 'error',
              category: 'budget',
              message: `Vorteile kosten insgesamt ${totalAdvCost} AP – maximal 80 AP erlaubt`,
              source: 'advantage-cap',
            },
          ];
        }
        return [];
      },
    };
  }

  /** Checks that total disadvantage AP gain does not exceed the 80 AP cap. */
  private disadvantageApCapRule(): ValidationRule {
    return {
      id: 'disadvantage-ap-cap',
      check(character: Character): ValidationResult[] {
        const totalDisCost = (character.disadvantages ?? []).filter((a) => !a.mandatory).reduce((sum, a) => sum + a.cost, 0);

        if (totalDisCost < -80) {
          return [
            {
              ruleId: 'disadvantage-ap-cap',
              severity: 'error',
              category: 'budget',
              message: `Nachteile bringen insgesamt ${Math.abs(totalDisCost)} AP – maximal 80 AP erlaubt`,
              source: 'disadvantage-cap',
            },
          ];
        }
        return [];
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

  /** Checks that magic/karmal special abilities have the required base advantage. */
  private specialAbilityPrerequisiteRule(): ValidationRule {
    return {
      id: 'special-ability-prerequisite',
      check(character: Character, ctx: ValidationContext): ValidationResult[] {
        const results: ValidationResult[] = [];
        const advantageNames = new Set([...character.advantages.map((a) => a.name), ...character.advantages.map((a) => getAdvantageBaseName(a.name))]);

        const allSaNames = [...character.specialAbilities.combat, ...character.specialAbilities.general, ...character.specialAbilities.magic];

        for (const saName of allSaNames) {
          const sa = ctx.allSpecialAbilities.find((s) => s.name === saName);
          if (!sa) continue;

          const isMagic = sa.category.startsWith('magic');
          const isKarmal = sa.category.startsWith('karmal');

          if (isMagic && !advantageNames.has('zauberer')) {
            results.push({
              ruleId: 'special-ability-prerequisite',
              severity: 'error',
              category: 'prerequisite',
              message: `Magische Sonderfertigkeit „${sa.label}" benötigt den Vorteil „Zauberer"`,
              source: saName,
            });
          }

          if (isKarmal && !advantageNames.has('geweihter')) {
            results.push({
              ruleId: 'special-ability-prerequisite',
              severity: 'error',
              category: 'prerequisite',
              message: `Karmale Sonderfertigkeit „${sa.label}" benötigt den Vorteil „Geweihter"`,
              source: saName,
            });
          }

          // Check SA-specific prerequisites
          for (const prereq of sa.prerequisite) {
            if (prereq.required && !advantageNames.has(prereq.name)) {
              results.push({
                ruleId: 'special-ability-prerequisite',
                severity: 'error',
                category: 'prerequisite',
                message: `Sonderfertigkeit „${sa.label}" benötigt die Voraussetzung „${prereq.name}"`,
                source: saName,
              });
            }
          }
        }

        return results;
      },
    };
  }
}
