import { NamedEntry, SourceReference } from './base-creation.model';

export interface CultureSkillBonus {
  skill: string;
  bonus: number;
}

/**
 * A culture advantage/disadvantage recommendation.
 * - A plain string is the canonical catalog `name` (simple, no sub-option).
 * - The object form carries `option` (a canonical SELECTION_OPTIONS slug) when the recommendation
 *   pins a single specific sub-option, or `label` to preserve the descriptive German text when the
 *   recommendation is a category ("Begabung in Gesellschaftstalenten") or a choice among several
 *   options ("Persönlichkeitsschwächen (Arroganz, Eitelkeit)") — the player then picks the option.
 */
export type CultureAdvantageRef = string | { name: string; option?: string; label?: string };

export interface Culture extends NamedEntry {
  apCost: number;
  language: string;
  script: string;
  socialStatus: string[];
  culturePackage: CultureSkillBonus[];
  speciesRestriction: string[];
  typicalAdvantages: CultureAdvantageRef[];
  typicalDisadvantages: CultureAdvantageRef[];
  atypicalAdvantages: CultureAdvantageRef[];
  atypicalDisadvantages: CultureAdvantageRef[];
}
