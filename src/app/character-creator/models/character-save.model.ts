import { Attribute, Bio, EquipmentItem, LanguageRef, ScriptRef, SpecialAbilityRef } from './base-creation.model';
import { ChosenEntry } from './chosen-entry.model';
import { HomebrewEntry } from './homebrew.model';
import { MeleeWeaponRow } from './melee-weapon.model';
import { RangedWeaponRow } from './ranged-weapon.model';
import { ArmorRow } from './armor-row.model';
import { ShieldRow } from './shield-row.model';
import { MagicRow } from './magic-row.model';

// Portable, version-stamped save/export format. Stores references + raw user inputs only;
// the resolver re-hydrates the full runtime Character (catalog objects + computed derived stats).
// v3: advantages/disadvantages/specialAbilities unified into one `entries: ChosenEntry[]` pick list
// (v2 is migrated on import — see CharacterImportService.parseSaveData).
export const CHARACTER_SAVE_VERSION = 3;

export interface CharacterSaveData {
  version: number;
  bio: Bio;
  experienceLevelId: string;
  speciesType: string;
  culture: string;
  useCulturePackage: boolean;
  capDisadvantageAp?: boolean; // optional for back-compat; defaults to true (RAW 80-AP disadvantage cap)
  profession: string;
  attributeChoices: AttributeChoiceRef[];
  attributes: Record<Attribute, number>;
  energies: EnergyInputs; // user inputs only — base/bonus/max are recomputed
  entries: ChosenEntry[]; // unified pick list: advantages + disadvantages + special abilities
  homebrew: HomebrewEntry[]; // character-specific homebrew entries (embedded so they always render on load)
  languages: LanguageRef[];
  scripts: ScriptRef[];
  combatTechniques: Record<string, CombatTechniqueRef>;
  skills: SkillGroupRefs;
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
  equipment: EquipmentRefs;
  currency: CurrencyRef;
  notes: string;
}

export interface AttributeChoiceRef {
  attribute: Attribute;
  modifier: number;
}

export interface PoolInput {
  bought: number;
  current: number;
  permanentLost: number;
  boughtBack?: number; // zurückgekaufte perm. verlorene Punkte (additiv; alte Saves haben es nicht)
}

export interface EnergyInputs {
  lifePoints: PoolInput;
  astralPoints: PoolInput;
  karmaPoints: PoolInput;
  fatePoints: PoolInput;
}

export interface AdvantageRef {
  name: string;
  lvl?: number;
}

export interface SpecialAbilityGroups {
  general: SpecialAbilityRef[];
  combat: SpecialAbilityRef[];
  magic: SpecialAbilityRef[];
  karmal: SpecialAbilityRef[];
}

export interface CombatTechniqueRef {
  ktw: number;
}

export interface SkillRef {
  name: string;
  fw: number;
  routine?: string;
}

export interface SkillGroupRefs {
  physical: SkillRef[];
  social: SkillRef[];
  nature: SkillRef[];
  knowledge: SkillRef[];
  crafts: SkillRef[];
}

export interface EquipmentRefs {
  closeCombat: MeleeWeaponRow[];
  rangeCombat: RangedWeaponRow[];
  armor: ArmorRow[];
  shields: ShieldRow[];
  general: EquipmentItem[];
}

export interface CurrencyRef {
  ducats: number;
  silverthalers: number;
  haler: number;
  kreutzer: number;
  gems?: string;
  jewelry?: string;
  misc?: string;
}

function emptyPoolInput(): PoolInput {
  return { bought: 0, current: 0, permanentLost: 0, boughtBack: 0 };
}

export function createDefaultSaveData(): CharacterSaveData {
  return {
    version: CHARACTER_SAVE_VERSION,
    bio: { name: '' },
    experienceLevelId: '',
    speciesType: '',
    culture: '',
    useCulturePackage: true,
    capDisadvantageAp: true,
    profession: '',
    attributeChoices: [],
    attributes: { MU: 8, KL: 8, IN: 8, CH: 8, FF: 8, GE: 8, KO: 8, KK: 8 },
    energies: {
      lifePoints: emptyPoolInput(),
      astralPoints: emptyPoolInput(),
      karmaPoints: emptyPoolInput(),
      fatePoints: emptyPoolInput(),
    },
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
