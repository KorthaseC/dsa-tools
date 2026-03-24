import { Advantage } from './advantage.model';
import { Character } from './base-creation.model';
import { Culture } from './culture.model';
import { ExperienceLevel } from './experience-level.model';
import { SpecialAbility } from './special-ability.model';
import { Species } from './species.model';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationCategory = 'prerequisite' | 'conflict' | 'level' | 'species' | 'budget' | 'attribute' | 'culture' | 'duplicate' | 'general';

export interface ValidationResult {
  ruleId: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  message: string;
  source?: string;
  details?: string;
}

export interface ValidationContext {
  allAdvantages: Advantage[];
  allDisadvantages: Advantage[];
  allSpecies: Species[];
  allCultures: Culture[];
  allSpecialAbilities: SpecialAbility[];
  experienceLevels: ExperienceLevel[];
}

export interface ValidationRule {
  id: string;
  check(character: Character, context: ValidationContext): ValidationResult[];
}
