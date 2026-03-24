import { Attribute, NamedEntry, SourceReference } from './base-creation.model';

export interface Prerequisite {
  name: string;
  required: boolean;
  minLvl?: number;
}

export interface AttributeRequirement {
  attribute: Attribute;
  minValue: number;
}

export interface Advantage extends NamedEntry {
  cost: number;
  lvl?: number;
  maxLvl?: number;
  mandatory?: boolean;
  prerequisite: Prerequisite[];
  speciesRestriction?: string[];
  attributeRequirement?: AttributeRequirement[];
}
