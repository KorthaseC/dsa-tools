import { Advantage } from './advantage.model';

export interface WithSource {
  sourceShort: string;
  sourceLong: string;
}

export interface WithApCost {
  apCost: number;
}

export interface BaseCreationEntry extends WithSource, WithApCost {
  id: string;
  name: string;
  description?: string;
  isCustom?: boolean;
}

export interface Rulebook {
  short: string;
  long: string;
}

export type Attribute = 'MU' | 'KL' | 'IN' | 'CH' | 'FF' | 'GE' | 'KO' | 'KK';

export interface MaxAttributeChange {
  attribute: Attribute;
  modifier: number;
  type: 'choice' | 'fixed';
}

export enum IncreaseFactor {
  A = 1,
  B = 2,
  C = 3,
  D = 4,
  E = 15,
}

export interface Character {
  name: string;
  experienceLevel: string;
  maxAp: number;
  species: string;
  speciesCost: number;
  maxAttributeChanges: MaxAttributeChange[];
  culture: string;
  profession: string;
  attributes: Attributes;
  advantages: Advantage[];
  disadvantages: string[];
  specialAbilities: {
    combat: string[];
    general: string[];
    magic: string[];
  };
  languages: Language[];
  combatTechniques: Record<string, CombatTechnique>;
  skills: {
    physical: Skill[];
    social: Skill[];
    nature: Skill[];
    knowledge: Skill[];
    crafts: Skill[];
  };
  magic: any[]; // Kann später spezifiziert werden, falls nötig
  equipment: {
    closeCombat: CloseCombatWeapon[];
    rangeCombat: any[]; // Kann bei Bedarf typisiert werden
    armor: Armor[];
    generell: any[]; // Kann bei Bedarf typisiert werden
  };
  currency: Currency;
  notes: string;
  accessList: any[];
}

export interface Attributes {
  courage: number;
  sagacity: number;
  intuition: number;
  charisma: number;
  dexterity: number;
  agility: number;
  constitution: number;
  strength: number;
  lifePoints: number;
  lifePointsMax: number;
  astralPoints: number;
  astralPointsMax: number;
  spirit: number;
  toughness: number;
  dodge: number;
  movement: number;
  initiative: string;
  fatePoints: number;
  fatePointsMax: number;
}

export interface Language {
  label: string;
  lvl?: number;
}

export interface CombatTechnique {
  at: number;
  pa?: number;
}

export interface Skill {
  name: string;
  probe: [string, string, string];
  value: number;
}

export interface CloseCombatWeapon {
  weapon: string;
  group: string;
  at: number;
  pa: number;
  dp: string;
}

export interface Armor {
  label: string;
  protection: number;
  burden: number;
}

export interface Currency {
  ducats: number;
  silverthalers: number;
  haler: number;
  kreutzer: number;
}
