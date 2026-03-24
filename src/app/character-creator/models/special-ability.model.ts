import { NamedEntry, SourceReference } from './base-creation.model';
import { Prerequisite, AttributeRequirement } from './advantage.model';

export enum SpecialAbilityCategory {
  General = 'general',
  Combat = 'combat',
  CombatStyle = 'combatStyle',
  CombatStyleExtended = 'combatStyleExtended',
  Command = 'command',
  FatePoint = 'fatePoint',
  Brawling = 'brawling',
  SkillStyle = 'skillStyle',
  SkillExtended = 'skillExtended',
  Language = 'language',
  Script = 'script',
  MagicGeneral = 'magicGeneral',
  MagicTradition = 'magicTradition',
  MagicSpellExtended = 'magicSpellExtended',
  MagicSpellStyle = 'magicSpellStyle',
  MagicSign = 'magicSign',
  MagicHomunculus = 'magicHomunculus',
  MagicTraditionArtifact = 'magicTraditionArtifact',
  MagicPact = 'magicPact',
  MagicLycanthropic = 'magicLycanthropic',
  MagicVampiric = 'magicVampiric',
  MagicSikaryanRaub = 'magicSikaryanRaub',
  KarmalGeneral = 'karmalGeneral',
  KarmalTradition = 'karmalTradition',
  KarmalLiturgyStyle = 'karmalLiturgyStyle',
  KarmalLiturgyStyleExtended = 'karmalLiturgyStyleExtended',
  KarmalSermon = 'karmalSermon',
  KarmalVision = 'karmalVision',
  KarmalCeremonialObject = 'karmalCeremonialObject',
}

export interface SpecialAbility extends NamedEntry {
  cost: number;
  category: SpecialAbilityCategory;
  lvl?: number;
  maxLvl?: number;
  prerequisite: Prerequisite[];
  attributeRequirement?: AttributeRequirement[];
  combatTechniques?: string[];
  speciesRestriction?: string[];
}
