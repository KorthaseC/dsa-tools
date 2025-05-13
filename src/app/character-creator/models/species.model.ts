import { Attribute } from "./base-creation.model";

export enum SpeciesType {
  Achaz = 'achaz',
  Elf = 'elf',
  Goblin = 'goblin',
  HalfElf = 'halfelf',
  Halforc = 'halforc',
  Holberker = 'holberker',
  Human = 'human',
  Orc = 'orc',
  Dwarf = 'dwarf'
}

export interface Species {
  type: SpeciesType;
  displayName: string;
  image: string;
  apCost: number;
  baseStats: SpeciesBaseStats;
  attributeMods: SpeciesAttributeModification[];
  autoAdvantages: string[];
  autoDisadvantages: string[];
  recommendedAdvantages: string[];
  recommendedDisadvantages: string[];
  typicalAdvantages: GroupedAdvantages[];
  typicalDisadvantages: GroupedAdvantages[];
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
  advantages: string[]
}