import { NamedEntry, SourceReference } from './base-creation.model';
import { Requirement } from './requirement.model';
import { AdvantageSelection } from './advantage.model';

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
  /** When true, `cost` is the per-Steigerungsfaktor-point value: effective cost = cost × SF-index (A=1…E=5)
   *  of the chosen selection option (e.g. Lieblingszauber "3/12" → 3 × the picked spell's improvement factor). */
  costBySteigerungsfaktor?: boolean;
  /** Permanent AsP lost when a tradition-artifact binding is activated (from the PDF "(N pAsP)"); the
   *  derived-stats engine adds it to the AsP permanent loss, and buying it back costs 2 AP per point. */
  permanentAspCost?: number;
  category: SpecialAbilityCategory;
  lvl?: number;
  maxLvl?: number;
  /** AP for each tier (from the PDF, `costLevels[i]` = tier i+1). Present ⇔ leveled combat/other SF whose
   *  tiers are bought cumulatively (Finte 15/20/25); effective cost = sum of `costLevels[0..lvl-1]`. */
  costLevels?: number[];
  /** Verbatim "Voraussetzungen:" rule text from the PDF (narrative conditions, e.g. "Leiteigenschaft der Tradition 13"). */
  prerequisiteText?: string;
  /** Structured, machine-checkable prerequisites (parsed at build time from prerequisiteText). */
  requirements?: Requirement[];
  /** Verbatim effect/rule text from the PDF "Regel:" prose (the part before "Voraussetzungen:"), for display. */
  effectText?: string;
  /** For style SFs: labels of the extended abilities this style grants (cross-match for "passende(r) …stil"). */
  styleGrants?: string[];
  /** Gender name variants (male/female) — lets a gendered profession grant resolve to this gender-neutral label. */
  formLabels?: string[];
  combatTechniques?: string[];
  speciesRestriction?: string[];
  /** Subtyp — artifact kind ("Zauberstab"), skill class ("allgemeine Fertigkeiten"), or sign type. */
  subCategory?: string;
  /** Gruppe — restricting tradition(s); omitted when unrestricted ("allgemein"). */
  tradition?: string[];
  /** Sub-selection (pick a specific spell/talent/element/…); the chosen value is stored in SpecialAbilityRef.param.
   *  Lookup key into SELECTION_OPTIONS is `param ? `${id}:${param}` : id`. */
  selection?: AdvantageSelection;
  /** This entry takes a SECOND, free-text detail beyond `selection`, and this is the field's German
   *  label ("Anwendungsgebiet" for Fertigkeitsspezialisierung). Same meaning as Advantage.freeText.
   *  Derived from a `"…|: <Label>"` selection param in the PDF. The value lives in
   *  SpecialAbilityRef.area and is purely descriptive — it never affects cost or prerequisites. */
  freeText?: string;
  /** Merkmal (trait), when present. */
  merkmal?: string;
}
