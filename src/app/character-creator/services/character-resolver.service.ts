import { Injectable } from '@angular/core';
import { ALL_CULTURES } from '../constants/culture.const';
import { EXPERIENCE_LEVELS } from '../constants/experience-levels.const';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { ALL_SPECIES } from '../constants/species.const';
import {
  Attributes,
  Character,
  DerivedStats,
  MaxAttributeChange,
  SkillEntry,
  SkillGroups,
  createEmptyDerivedStats,
} from '../models/base-creation.model';
import { CharacterSaveData, CHARACTER_SAVE_VERSION, EnergyInputs, PoolInput } from '../models/character-save.model';
import { Species, SpeciesType } from '../models/species.model';
import { recomputeDerivedStats } from '../utils/derived-stats.util';
import { computeSpentAp } from '../utils/ap-budget.util';

@Injectable({ providedIn: 'root' })
export class CharacterResolverService {
  resolve(saveData: CharacterSaveData): Character {
    const experienceLevel = EXPERIENCE_LEVELS.find((e) => e.id === saveData.experienceLevelId);
    const species = ALL_SPECIES.find((s) => s.type === (saveData.speciesType as SpeciesType));
    const culture = ALL_CULTURES.find((c) => c.name === saveData.culture);
    const profession = ALL_PROFESSIONS.find((p) => p.name === saveData.profession);

    const maxAttributeChanges = this.buildMaxAttributeChanges(saveData, species);

    const character: Character = {
      bio: { ...saveData.bio },
      experienceLevel: saveData.experienceLevelId,
      maxAp: experienceLevel?.ap ?? 0,
      ap: { total: 0, spent: 0, available: 0 },
      species: saveData.speciesType,
      speciesCost: species?.apCost ?? 0,
      culture: saveData.culture,
      cultureCost: culture?.apCost ?? 0,
      useCulturePackage: saveData.useCulturePackage ?? true,
      capDisadvantageAp: saveData.capDisadvantageAp ?? true,
      profession: saveData.profession,
      professionCost: profession?.apCost ?? 0,
      maxAttributeChanges,
      attributes: this.buildAttributes(saveData),
      derived: this.seedDerived(saveData.energies),
      entries: [...(saveData.entries ?? [])],
      homebrew: [...(saveData.homebrew ?? [])],
      languages: saveData.languages.map((l) => ({ ...l })),
      scripts: saveData.scripts.map((s) => ({ name: s.name })),
      combatTechniques: { ...saveData.combatTechniques },
      skills: this.mapSkillGroups(saveData.skills),
      spells: saveData.spells,
      cantrips: [...saveData.cantrips],
      magicTradition: saveData.magicTradition,
      magicGuidingAttribute: saveData.magicGuidingAttribute,
      magicTrait: saveData.magicTrait,
      liturgies: saveData.liturgies,
      blessings: [...saveData.blessings],
      karmalTradition: saveData.karmalTradition,
      karmalGuidingAttribute: saveData.karmalGuidingAttribute,
      karmalAspect: saveData.karmalAspect,
      equipment: {
        closeCombat: saveData.equipment.closeCombat,
        rangeCombat: saveData.equipment.rangeCombat,
        armor: saveData.equipment.armor,
        shields: saveData.equipment.shields,
        general: saveData.equipment.general,
      },
      currency: { ...saveData.currency },
      notes: saveData.notes,
    };

    character.derived = recomputeDerivedStats(character, species);
    character.ap = this.computeApBudget(character, experienceLevel?.ap ?? 0);
    return character;
  }

  toSaveData(character: Character): CharacterSaveData {
    return {
      version: CHARACTER_SAVE_VERSION,
      bio: { ...character.bio },
      experienceLevelId: character.experienceLevel,
      speciesType: character.species,
      culture: character.culture,
      useCulturePackage: character.useCulturePackage,
      capDisadvantageAp: character.capDisadvantageAp,
      profession: character.profession,
      attributeChoices: character.maxAttributeChanges
        .filter((m) => m.type === 'choice')
        .map((m) => ({ attribute: m.attribute, modifier: m.modifier })),
      attributes: {
        MU: character.attributes.courage,
        KL: character.attributes.sagacity,
        IN: character.attributes.intuition,
        CH: character.attributes.charisma,
        FF: character.attributes.dexterity,
        GE: character.attributes.agility,
        KO: character.attributes.constitution,
        KK: character.attributes.strength,
      },
      energies: {
        lifePoints: this.toPoolInput(character.derived.lifePoints),
        astralPoints: this.toPoolInput(character.derived.astralPoints),
        karmaPoints: this.toPoolInput(character.derived.karmaPoints),
        fatePoints: this.toPoolInput(character.derived.fatePoints),
      },
      entries: [...character.entries],
      homebrew: [...character.homebrew],
      languages: character.languages.map((l) => ({ ...l })),
      scripts: character.scripts.map((s) => ({ name: s.name })),
      combatTechniques: { ...character.combatTechniques },
      skills: {
        physical: character.skills.physical.map(this.toSkillRef),
        social: character.skills.social.map(this.toSkillRef),
        nature: character.skills.nature.map(this.toSkillRef),
        knowledge: character.skills.knowledge.map(this.toSkillRef),
        crafts: character.skills.crafts.map(this.toSkillRef),
      },
      spells: character.spells,
      cantrips: [...character.cantrips],
      magicTradition: character.magicTradition,
      magicGuidingAttribute: character.magicGuidingAttribute,
      magicTrait: character.magicTrait,
      liturgies: character.liturgies,
      blessings: [...character.blessings],
      karmalTradition: character.karmalTradition,
      karmalGuidingAttribute: character.karmalGuidingAttribute,
      karmalAspect: character.karmalAspect,
      equipment: {
        closeCombat: character.equipment.closeCombat,
        rangeCombat: character.equipment.rangeCombat,
        armor: character.equipment.armor,
        shields: character.equipment.shields,
        general: character.equipment.general,
      },
      currency: { ...character.currency },
      notes: character.notes,
    };
  }

  private buildMaxAttributeChanges(saveData: CharacterSaveData, species?: Species): MaxAttributeChange[] {
    const changes: MaxAttributeChange[] = [];

    if (species) {
      for (const mod of species.attributeMods) {
        if (mod.type === 'fixed' && mod.attribute && mod.modifier != null) {
          changes.push({ type: 'fixed', attribute: mod.attribute, modifier: mod.modifier });
        }
      }
    }

    for (const choice of saveData.attributeChoices) {
      changes.push({ type: 'choice', attribute: choice.attribute, modifier: choice.modifier });
    }

    return changes;
  }

  private buildAttributes(saveData: CharacterSaveData): Attributes {
    const a = saveData.attributes;
    return {
      courage: a.MU,
      sagacity: a.KL,
      intuition: a.IN,
      charisma: a.CH,
      dexterity: a.FF,
      agility: a.GE,
      constitution: a.KO,
      strength: a.KK,
    };
  }

  private seedDerived(energies: EnergyInputs): DerivedStats {
    const d = createEmptyDerivedStats();
    this.applyPoolInput(d.lifePoints, energies.lifePoints);
    this.applyPoolInput(d.astralPoints, energies.astralPoints);
    this.applyPoolInput(d.karmaPoints, energies.karmaPoints);
    this.applyPoolInput(d.fatePoints, energies.fatePoints);
    return d;
  }

  private applyPoolInput(pool: { bought: number; current: number; permanentLost?: number; boughtBack?: number }, input: PoolInput): void {
    pool.bought = input.bought;
    pool.current = input.current;
    pool.permanentLost = input.permanentLost;
    pool.boughtBack = input.boughtBack ?? 0;
  }

  private toPoolInput(pool: { bought: number; current: number; permanentLost?: number; boughtBack?: number }): PoolInput {
    return { bought: pool.bought, current: pool.current, permanentLost: pool.permanentLost ?? 0, boughtBack: pool.boughtBack ?? 0 };
  }

  private mapSkillGroups(skills: CharacterSaveData['skills']): SkillGroups {
    const map = (list: { name: string; fw: number; routine?: string }[]): SkillEntry[] =>
      list.map((s) => ({ name: s.name, fw: s.fw, ...(s.routine != null ? { routine: s.routine } : {}) }));
    return {
      physical: map(skills.physical),
      social: map(skills.social),
      nature: map(skills.nature),
      knowledge: map(skills.knowledge),
      crafts: map(skills.crafts),
    };
  }

  private toSkillRef(s: SkillEntry): { name: string; fw: number; routine?: string } {
    return { name: s.name, fw: s.fw, ...(s.routine != null ? { routine: s.routine } : {}) };
  }

  private computeApBudget(character: Character, total: number): Character['ap'] {
    const spent = computeSpentAp(character);
    return { total, spent, available: total - spent };
  }
}
