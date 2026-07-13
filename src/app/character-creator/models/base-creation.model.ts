import { ChosenEntry } from './chosen-entry.model';
import { HomebrewEntry } from './homebrew.model';
import { MeleeWeaponRow } from './melee-weapon.model';
import { RangedWeaponRow } from './ranged-weapon.model';
import { ArmorRow } from './armor-row.model';
import { ShieldRow } from './shield-row.model';
import { MagicRow } from './magic-row.model';

// ─── Constants ────────────────────────────────────────────────────────────────

export const REGELWIKI_BASE = 'https://dsa.ulisses-regelwiki.de/';

// ─── Source & Reference Types ─────────────────────────────────────────────────

export interface SourceReference {
  book: string;
  page?: number;
}

export interface NamedEntry {
  name: string;
  label: string;
  url?: string;
  sources?: SourceReference[];
}

export type Attribute = 'MU' | 'KL' | 'IN' | 'CH' | 'FF' | 'GE' | 'KO' | 'KK';

export interface MaxAttributeChange {
  attribute: Attribute;
  modifier: number;
  type: 'choice' | 'fixed';
}

// ─── Increase Factor ──────────────────────────────────────────────────────────

export enum IncreaseFactor {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export const INCREASE_FACTOR_COST: Record<IncreaseFactor, number> = {
  [IncreaseFactor.A]: 1,
  [IncreaseFactor.B]: 2,
  [IncreaseFactor.C]: 3,
  [IncreaseFactor.D]: 4,
  [IncreaseFactor.E]: 15,
};

// ─── Character ────────────────────────────────────────────────────────────────

export interface Character {
  bio: Bio;
  experienceLevel: string;
  maxAp: number; // = ExperienceLevel.ap (budget)
  ap: ApBudget;
  species: string;
  speciesCost: number;
  culture: string;
  cultureCost: number;
  useCulturePackage: boolean; // whether the culture's talent package is applied
  capDisadvantageAp: boolean; // DSA5: cap the AP GAINED from disadvantages at 80 (excess gives nothing). Off = full value (house rule).
  profession: string;
  professionCost: number;
  maxAttributeChanges: MaxAttributeChange[];
  attributes: Attributes; // 8 base attributes only
  derived: DerivedStats; // computed energies & secondary values
  /** Canonical unified pick list: advantages + disadvantages + special abilities. Resolve to rich
   *  views via resolvePicks(entries) (catalog/character-entries) / CharacterStateService.picks(). */
  entries: ChosenEntry[];
  /** Character-specific homebrew entries (display + AP only; embedded in the save, no catalog/validation). */
  homebrew: HomebrewEntry[];
  languages: LanguageRef[];
  scripts: ScriptRef[];
  combatTechniques: Record<string, CombatTechnique>;
  skills: SkillGroups;
  spells: MagicRow[];
  cantrips: string[];
  magicTradition?: string;
  magicGuidingAttribute?: string;
  magicTrait?: string; // Merkmal (usually set automatically; manually editable when unlocked)
  liturgies: MagicRow[];
  blessings: string[];
  karmalTradition?: string;
  karmalGuidingAttribute?: string;
  karmalAspect?: string; // Aspekt (usually set automatically; manually editable when unlocked)
  equipment: Equipment;
  currency: Currency;
  notes: string;
}

export interface Bio {
  name: string;
  family?: string;
  birthday?: string;
  birthplace?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  title?: string;
  socialStatus?: string;
  characteristics?: string;
  misc?: string;
}

export interface ApBudget {
  total: number; // AP gesamt
  spent: number; // AP ausgegeben
  available: number; // AP verfügbar
}

export interface Attributes {
  courage: number; // MU
  sagacity: number; // KL
  intuition: number; // IN
  charisma: number; // CH
  dexterity: number; // FF
  agility: number; // GE
  constitution: number; // KO
  strength: number; // KK
}

// One column-rich value as it appears on the sheet (Wert/Bonus/Zukauf/Max).
export interface DerivedValue {
  base: number; // Grundwert
  bonus: number; // Bonus/Malus
  bought: number; // Zukauf
  max: number; // Max
}

// A point pool (LeP/AsP/KaP/Schicksalspunkte) additionally tracks current & permanent loss.
export interface PoolValue extends DerivedValue {
  current: number; // Aktuell
  permanentLost?: number; // perm. verloren / eingesetzt (manuelle Eingabe)
  autoLost?: number; // perm. Verlust, den das Programm ableitet (z. B. gebundene Traditionsartefakte) — nicht editierbar
  boughtBack?: number; // zurückgekaufte perm. verlorene Punkte (unbegrenzt, anders als der Zukauf)
}

export interface DerivedStats {
  lifePoints: PoolValue; // LeP
  astralPoints: PoolValue; // AsP
  karmaPoints: PoolValue; // KaP
  spirit: DerivedValue; // SK (Seelenkraft)
  toughness: DerivedValue; // ZK (Zähigkeit)
  dodge: DerivedValue; // AW (Ausweichen)
  initiative: DerivedValue; // INI
  movement: DerivedValue; // GS (Geschwindigkeit)
  woundThreshold: DerivedValue; // WS (Wundschwelle)
  fatePoints: PoolValue; // Schicksalspunkte
}

export interface SpecialAbilityRef {
  name: string;
  lvl?: number;
  param?: string; // free-text qualifier, e.g. the Ortskenntnis home region
  granted?: boolean; // granted for free (e.g. by culture) → 0 AP
  costOverride?: number; // character-local total-AP override (GM ruling); `granted` still wins
}

export interface SpecialAbilities {
  general: SpecialAbilityRef[];
  combat: SpecialAbilityRef[];
  magic: SpecialAbilityRef[];
  karmal: SpecialAbilityRef[];
}

export interface LanguageRef {
  name: string;
  lvl: number;
  mother?: boolean; // Muttersprache (culture mother tongue) → free, level 3
}

export interface ScriptRef {
  name: string;
}

export interface CombatTechnique {
  ktw: number; // Kampftechnikwert
}

export interface SkillEntry {
  name: string;
  fw: number; // Fertigkeitswert
  routine?: string; // gewählte Routineprobe
}

export interface SkillGroups {
  physical: SkillEntry[];
  social: SkillEntry[];
  nature: SkillEntry[];
  knowledge: SkillEntry[];
  crafts: SkillEntry[];
}

export interface EquipmentItem {
  name: string;
  quantity: number;
  value?: number; // Wert (Silbertaler)
  weight?: number; // Gewicht (Stein)
  carriedWhere?: string; // Wo getragen
}

export interface Equipment {
  closeCombat: MeleeWeaponRow[];
  rangeCombat: RangedWeaponRow[];
  armor: ArmorRow[];
  shields: ShieldRow[];
  general: EquipmentItem[];
}

export interface Currency {
  ducats: number;
  silverthalers: number;
  haler: number;
  kreutzer: number;
  gems?: string; // Edelsteine
  jewelry?: string; // Schmuck
  misc?: string; // Sonstiges
}

// ─── Factories ────────────────────────────────────────────────────────────────

export function createEmptyDerivedValue(): DerivedValue {
  return { base: 0, bonus: 0, bought: 0, max: 0 };
}

export function createEmptyPoolValue(): PoolValue {
  return { base: 0, bonus: 0, bought: 0, max: 0, current: 0, permanentLost: 0 };
}

export function createEmptyDerivedStats(): DerivedStats {
  return {
    lifePoints: createEmptyPoolValue(),
    astralPoints: createEmptyPoolValue(),
    karmaPoints: createEmptyPoolValue(),
    spirit: createEmptyDerivedValue(),
    toughness: createEmptyDerivedValue(),
    dodge: createEmptyDerivedValue(),
    initiative: createEmptyDerivedValue(),
    movement: createEmptyDerivedValue(),
    woundThreshold: createEmptyDerivedValue(),
    fatePoints: createEmptyPoolValue(),
  };
}

export function createEmptyCharacter(): Character {
  return {
    bio: { name: '' },
    experienceLevel: '',
    maxAp: 0,
    ap: { total: 0, spent: 0, available: 0 },
    species: '',
    speciesCost: 0,
    culture: '',
    cultureCost: 0,
    useCulturePackage: true,
    capDisadvantageAp: true,
    profession: '',
    professionCost: 0,
    maxAttributeChanges: [],
    attributes: {
      courage: 8,
      sagacity: 8,
      intuition: 8,
      charisma: 8,
      dexterity: 8,
      agility: 8,
      constitution: 8,
      strength: 8,
    },
    derived: createEmptyDerivedStats(),
    entries: [],
    homebrew: [],
    languages: [],
    scripts: [],
    combatTechniques: {},
    skills: { physical: [], social: [], nature: [], knowledge: [], crafts: [] },
    spells: [],
    cantrips: [],
    liturgies: [],
    blessings: [],
    equipment: { closeCombat: [], rangeCombat: [], armor: [], shields: [], general: [] },
    currency: { ducats: 0, silverthalers: 0, haler: 0, kreutzer: 0 },
    notes: '',
  };
}
