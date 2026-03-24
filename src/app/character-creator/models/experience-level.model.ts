export enum ExperienceLevelId {
  Inexperienced = 'inexperienced',
  Average = 'average',
  Experienced = 'experienced',
  Competent = 'competent',
  Masterful = 'masterful',
  Brilliant = 'brilliant',
  Legendary = 'legendary',
}

export interface ExperienceLevel {
  id: ExperienceLevelId;
  label: string;
  ap: number;
  maxAttribute: number;
  maxTalent: number;
  maxCombatTechnique: number;
  maxAttributePoints: number;
  maxSpells: number;
  maxForeignSpells: number;
}
