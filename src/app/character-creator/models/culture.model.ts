import { NamedEntry, SourceReference } from './base-creation.model';

export interface CultureSkillBonus {
  skill: string;
  bonus: number;
}

export interface Culture extends NamedEntry {
  apCost: number;
  language: string;
  script: string;
  socialStatus: string[];
  culturePackage: CultureSkillBonus[];
  speciesRestriction: string[];
  typicalAdvantages: string[];
  typicalDisadvantages: string[];
  atypicalAdvantages: string[];
  atypicalDisadvantages: string[];
}
