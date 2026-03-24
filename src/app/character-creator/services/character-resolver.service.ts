import { Injectable } from '@angular/core';
import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { EXPERIENCE_LEVELS } from '../constants/experience-levels.const';
import { ALL_SPECIES } from '../constants/species.const';
import { ALL_TALENTS } from '../constants/talent.const';
import { Advantage } from '../models/advantage.model';
import { Attribute, Attributes, Character, MaxAttributeChange } from '../models/base-creation.model';
import { AdvantageRef, CharacterSaveData } from '../models/character-save.model';
import { Species, SpeciesType } from '../models/species.model';
import { resolveAdvantageByName } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class CharacterResolverService {
  resolve(saveData: CharacterSaveData): Character {
    const experienceLevel = EXPERIENCE_LEVELS.find((e) => e.id === saveData.experienceLevelId);
    const species = ALL_SPECIES.find((s) => s.type === (saveData.speciesType as SpeciesType));

    const advantages = this.resolveAdvantageRefs(saveData.advantages, ADVANTAGE);
    const disadvantages = this.resolveAdvantageRefs(saveData.disadvantages, DISADVANTAGE);
    const maxAttributeChanges = this.buildMaxAttributeChanges(saveData, species);
    const attributes = this.buildAttributes(saveData, species);

    return {
      name: saveData.name,
      experienceLevel: saveData.experienceLevelId,
      maxAp: experienceLevel?.ap ?? 0,
      species: saveData.speciesType,
      speciesCost: species?.apCost ?? 0,
      maxAttributeChanges,
      culture: saveData.culture,
      profession: saveData.profession,
      attributes,
      advantages,
      disadvantages,
      specialAbilities: { ...saveData.specialAbilities },
      languages: saveData.languages.map((l) => ({ label: l.name, lvl: l.lvl })),
      combatTechniques: { ...saveData.combatTechniques },
      skills: {
        physical: saveData.skills.physical.map((s) => ({ name: s.name, probe: this.lookupProbe(s.name), value: s.value })),
        social: saveData.skills.social.map((s) => ({ name: s.name, probe: this.lookupProbe(s.name), value: s.value })),
        nature: saveData.skills.nature.map((s) => ({ name: s.name, probe: this.lookupProbe(s.name), value: s.value })),
        knowledge: saveData.skills.knowledge.map((s) => ({ name: s.name, probe: this.lookupProbe(s.name), value: s.value })),
        crafts: saveData.skills.crafts.map((s) => ({ name: s.name, probe: this.lookupProbe(s.name), value: s.value })),
      },
      magic: saveData.magic,
      equipment: {
        closeCombat: saveData.equipment.closeCombat,
        rangeCombat: saveData.equipment.rangeCombat,
        armor: saveData.equipment.armor,
        general: saveData.equipment.general,
      },
      currency: { ...saveData.currency },
      notes: saveData.notes,
    };
  }

  toSaveData(character: Character): CharacterSaveData {
    return {
      version: 1,
      name: character.name,
      experienceLevelId: character.experienceLevel,
      speciesType: character.species,
      culture: character.culture,
      profession: character.profession,
      attributeChoices: character.maxAttributeChanges.filter((m) => m.type === 'choice').map((m) => ({ attribute: m.attribute, modifier: m.modifier })),
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
      derivedStats: {
        lifePoints: 0,
        astralPoints: character.attributes.astralPoints,
        fatePoints: character.attributes.fatePoints,
      },
      advantages: character.advantages.map((a) => ({
        name: a.name,
        ...(a.lvl != null ? { lvl: a.lvl } : {}),
      })),
      disadvantages: character.disadvantages.map((a) => ({
        name: a.name,
        ...(a.lvl != null ? { lvl: a.lvl } : {}),
      })),
      specialAbilities: { ...character.specialAbilities },
      languages: character.languages.map((l) => ({ name: l.label, lvl: l.lvl ?? 0 })),
      combatTechniques: { ...character.combatTechniques },
      skills: {
        physical: character.skills.physical.map((s) => ({ name: s.name, value: s.value })),
        social: character.skills.social.map((s) => ({ name: s.name, value: s.value })),
        nature: character.skills.nature.map((s) => ({ name: s.name, value: s.value })),
        knowledge: character.skills.knowledge.map((s) => ({ name: s.name, value: s.value })),
        crafts: character.skills.crafts.map((s) => ({ name: s.name, value: s.value })),
      },
      magic: character.magic,
      equipment: {
        closeCombat: character.equipment.closeCombat,
        rangeCombat: character.equipment.rangeCombat,
        armor: character.equipment.armor,
        general: character.equipment.general,
      },
      currency: { ...character.currency },
      notes: character.notes,
    };
  }

  private resolveAdvantageRefs(refs: AdvantageRef[], catalog: Advantage[]): Advantage[] {
    return refs.map((ref) => {
      const resolved = resolveAdvantageByName(ref.name, catalog, { lvl: ref.lvl });
      if (!resolved) {
        return { name: ref.name, label: ref.name, cost: 0, prerequisite: [], lvl: ref.lvl };
      }
      return resolved;
    });
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

  private buildAttributes(saveData: CharacterSaveData, species?: Species): Attributes {
    const a = saveData.attributes;
    const bs = species?.baseStats ?? { le: 0, sk: 0, zk: 0, gs: 0 };

    return {
      courage: a.MU,
      sagacity: a.KL,
      intuition: a.IN,
      charisma: a.CH,
      dexterity: a.FF,
      agility: a.GE,
      constitution: a.KO,
      strength: a.KK,
      lifePoints: bs.le + 2 * a.KO + saveData.derivedStats.lifePoints,
      lifePointsMax: bs.le + 2 * a.KO + saveData.derivedStats.lifePoints,
      astralPoints: saveData.derivedStats.astralPoints,
      astralPointsMax: saveData.derivedStats.astralPoints,
      spirit: Math.round((a.MU + a.KL + a.IN) / 6) + bs.sk,
      toughness: Math.round((a.KO + a.KO + a.KK) / 6) + bs.zk,
      dodge: Math.round(a.GE / 2),
      movement: bs.gs,
      initiative: Math.round((a.MU + a.GE) / 2),
      fatePoints: saveData.derivedStats.fatePoints,
      fatePointsMax: saveData.derivedStats.fatePoints,
    };
  }

  private lookupProbe(talentName: string): [Attribute, Attribute, Attribute] {
    const talent = ALL_TALENTS.find((t) => t.name === talentName);
    return talent?.check ?? ['MU', 'MU', 'MU'];
  }
}
