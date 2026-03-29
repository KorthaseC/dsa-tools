import { Advantage } from './advantage.model';

// ─── Constants ────────────────────────────────────────────────────────────────

export const REGELWIKI_BASE = 'https://dsa.ulisses-regelwiki.de/';

// ─── Source & Reference Types ─────────────────────────────────────────────────

export interface SourceReference {
  book: string;
  page?: number;
}

export interface NamedEntry {
  name: string;
  label: string;
  url?: string;
  sources?: SourceReference[];
}

export type Attribute = 'MU' | 'KL' | 'IN' | 'CH' | 'FF' | 'GE' | 'KO' | 'KK';

export interface MaxAttributeChange {
  attribute: Attribute;
  modifier: number;
  type: 'choice' | 'fixed';
}

// ─── Increase Factor ──────────────────────────────────────────────────────────

export enum IncreaseFactor {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export const INCREASE_FACTOR_COST: Record<IncreaseFactor, number> = {
  [IncreaseFactor.A]: 1,
  [IncreaseFactor.B]: 2,
  [IncreaseFactor.C]: 3,
  [IncreaseFactor.D]: 4,
  [IncreaseFactor.E]: 15,
};

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
  disadvantages: Advantage[];
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
  magic: MagicEntry[];
  equipment: {
    closeCombat: CloseCombatWeapon[];
    rangeCombat: RangedWeapon[];
    armor: Armor[];
    general: EquipmentItem[];
  };
  currency: Currency;
  notes: string;
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
  initiative: number;
  fatePoints: number;
  fatePointsMax: number;
}

export interface Language {
  label: string;
  lvl?: number;
}

export interface CombatTechnique {
  ktw: number;
}

export interface Skill {
  name: string;
  probe: [Attribute, Attribute, Attribute];
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

export interface RangedWeapon {
  weapon: string;
  combatTechnique: string;
  reload: number;
  damage: string;
  range: string;
}

export interface EquipmentItem {
  name: string;
  quantity: number;
  weight?: number;
}

export interface MagicEntry {
  name: string;
  value: number;
}
