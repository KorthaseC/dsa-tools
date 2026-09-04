import { ExperienceLevel, ExperienceLevelId } from "../models/experience-level.model";

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  {
    id: ExperienceLevelId.Inexperienced,
    label: 'Unerfahren',
    ap: 900,
    maxAttribute: 12,
    maxTalent: 10,
    maxCombatTechnique: 8,
    maxAttributePoints: 95,
    maxSpells: 8,
    maxForeignSpells: 0
  },
  {
    id: ExperienceLevelId.Average,
    label: 'Durchschnittlich',
    ap: 1000,
    maxAttribute: 13,
    maxTalent: 10,
    maxCombatTechnique: 10,
    maxAttributePoints: 98,
    maxSpells: 10,
    maxForeignSpells: 1
  },
  {
    id: ExperienceLevelId.Experienced,
    label: 'Erfahren',
    ap: 1100,
    maxAttribute: 14,
    maxTalent: 10,
    maxCombatTechnique: 12,
    maxAttributePoints: 100,
    maxSpells: 12,
    maxForeignSpells: 2
  },
  {
    id: ExperienceLevelId.Competent,
    label: 'Kompetent',
    ap: 1200,
    maxAttribute: 15,
    maxTalent: 13,
    maxCombatTechnique: 14,
    maxAttributePoints: 102,
    maxSpells: 14,
    maxForeignSpells: 3
  },
  {
    id: ExperienceLevelId.Masterful,
    label: 'Meisterlich',
    ap: 1400,
    maxAttribute: 16,
    maxTalent: 16,
    maxCombatTechnique: 16,
    maxAttributePoints: 105,
    maxSpells: 16,
    maxForeignSpells: 4
  },
  {
    id: ExperienceLevelId.Brilliant,
    label: 'Brillant',
    ap: 1700,
    maxAttribute: 17,
    maxTalent: 19,
    maxCombatTechnique: 18,
    maxAttributePoints: 109,
    maxSpells: 18,
    maxForeignSpells: 5
  },
  {
    id: ExperienceLevelId.Legendary,
    label: 'Legendär',
    ap: 2100,
    maxAttribute: 18,
    maxTalent: 20,
    maxCombatTechnique: 20,
    maxAttributePoints: 114,
    maxSpells: 20,
    maxForeignSpells: 6
  }
];