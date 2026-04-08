import { Attribute } from './base-creation.model';

export interface CharacterSaveData {
  version: number;
  name: string;
  experienceLevelId: string;
  speciesType: string;
  culture: string;
  profession: string;
  attributeChoices: AttributeChoiceRef[];
  attributes: Record<Attribute, number>;
  derivedStats: DerivedStatRefs;
  advantages: AdvantageRef[];
  disadvantages: AdvantageRef[];
  specialAbilities: SpecialAbilityRefs;
  languages: LanguageRef[];
  combatTechniques: Record<string, CombatTechniqueRef>;
  skills: SkillGroupRefs;
  magic: MagicEntryRef[];
  equipment: EquipmentRefs;
  currency: CurrencyRef;
  notes: string;
}

export interface AttributeChoiceRef {
  attribute: Attribute;
  modifier: number;
}

export interface DerivedStatRefs {
  lifePoints: number;
  astralPoints: number;
  fatePoints: number;
}

export interface AdvantageRef {
  name: string;
  lvl?: number;
}

export interface LanguageRef {
  name: string;
  lvl: number;
}

export interface CombatTechniqueRef {
  ktw: number;
}

export interface SkillRef {
  name: string;
  value: number;
}

export interface SkillGroupRefs {
  physical: SkillRef[];
  social: SkillRef[];
  nature: SkillRef[];
  knowledge: SkillRef[];
  crafts: SkillRef[];
}

export interface SpecialAbilityRefs {
  combat: string[];
  general: string[];
  magic: string[];
}

export interface CloseCombatWeaponRef {
  weapon: string;
  group: string;
  at: number;
  pa: number;
  dp: string;
  combatTechnique?: string;
  schadensbonus?: number;
  tp?: string;
  atMod?: number;
  paMod?: number;
  reichweite?: string;
  bf?: number;
  bs?: string;
  gewicht?: number;
}

export interface ArmorRef {
  label: string;
  protection: number;
  burden: number;
}

export interface EquipmentRefs {
  closeCombat: CloseCombatWeaponRef[];
  rangeCombat: RangedWeaponRef[];
  armor: ArmorRef[];
  general: EquipmentItemRef[];
}

export interface CurrencyRef {
  ducats: number;
  silverthalers: number;
  haler: number;
  kreutzer: number;
}

export interface MagicEntryRef {
  name: string;
  value: number;
}

export interface RangedWeaponRef {
  weapon: string;
  combatTechnique: string;
  reload: number;
  damage: string;
  range: string;
}

export interface EquipmentItemRef {
  name: string;
  quantity: number;
  weight?: number;
}

export function createDefaultSaveData(): CharacterSaveData {
  return {
    version: 1,
    name: '',
    experienceLevelId: '',
    speciesType: '',
    culture: '',
    profession: '',
    attributeChoices: [],
    attributes: { MU: 8, KL: 8, IN: 8, CH: 8, FF: 8, GE: 8, KO: 8, KK: 8 },
    derivedStats: { lifePoints: 0, astralPoints: 0, fatePoints: 0 },
    advantages: [],
    disadvantages: [],
    specialAbilities: { combat: [], general: [], magic: [] },
    languages: [],
    combatTechniques: {},
    skills: { physical: [], social: [], nature: [], knowledge: [], crafts: [] },
    magic: [],
    equipment: { closeCombat: [], rangeCombat: [], armor: [], general: [] },
    currency: { ducats: 0, silverthalers: 0, haler: 0, kreutzer: 0 },
    notes: '',
  };
}
