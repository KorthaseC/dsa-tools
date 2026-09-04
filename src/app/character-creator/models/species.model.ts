import { Attribute, NamedEntry } from './base-creation.model';

export enum SpeciesType {
  Achaz = 'achaz',
  Elf = 'elf',
  Goblin = 'goblin',
  HalfElf = 'halfelf',
  Halforc = 'halforc',
  Holberker = 'holberker',
  Human = 'human',
  Nachtalb = 'nachtalb',
  Orc = 'orc',
  Dwarf = 'dwarf',
}

/**
 * Reference to an advantage/disadvantage in a species list.
 * - A plain string is the simple case: the canonical catalog `name` (no sub-option, no level cap).
 * - The object form adds `option` (a canonical `SELECTION_OPTIONS` slug for selection advantages,
 *   e.g. `{ name: 'herausragenderSinn', option: 'gehoer' }`) and/or `lvl` (the species-specific
 *   level cap for leveled entries — e.g. Elf typical Dunkelsicht caps at II, Halbelf only at I).
 */
export type SpeciesAdvantageRef = string | { name: string; option?: string; lvl?: number };

export interface Species extends NamedEntry {
  type: SpeciesType;
  image: string;
  apCost: number;
  baseStats: SpeciesBaseStats;
  attributeMods: SpeciesAttributeModification[];
  autoAdvantages: SpeciesAdvantageRef[];
  autoDisadvantages: SpeciesAdvantageRef[];
  recommendedAdvantages: SpeciesAdvantageRef[];
  recommendedDisadvantages: SpeciesAdvantageRef[];
  typicalAdvantages: GroupedAdvantages[];
  typicalDisadvantages: GroupedAdvantages[];
  atypicalAdvantages: SpeciesAdvantageRef[];
  atypicalDisadvantages: SpeciesAdvantageRef[];
}

export interface SpeciesBaseStats {
  le: number; // Lebenspunkte
  sk: number; // Seelenkraft
  zk: number; // Zähigkeit
  gs: number; // Geschwindigkeit
}

export interface SpeciesAttributeModification {
  type: 'choice' | 'fixed';
  attribute?: Attribute; // Only set if type is 'fixed'
  modifier?: number;
  selectionOptions?: Attribute[]; // Only set if type is 'choice'
}

export interface GroupedAdvantages {
  group?: string;
  advantages: SpeciesAdvantageRef[];
}
