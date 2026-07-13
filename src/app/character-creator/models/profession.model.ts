import { NamedEntry } from './base-creation.model';

export type ProfessionCategory = 'profane' | 'magic' | 'karmal';

export interface ProfessionSkillBonus {
  label: string; // talent label (our talents are keyed by German label → resolves directly)
  bonus: number;
}

export interface ProfessionCombatTechniqueBonus {
  label: string; // combat-technique label
  ktw: number;
}

export interface ProfessionMagicGrant {
  label: string; // spell/liturgy label
  fw: number;
}

/** A granted special ability; `param` qualifies parameterized SAs (e.g. Tradition → "Druide"). */
export interface ProfessionGrant {
  label: string;
  param?: string;
}

/** A granted language slot. `level` is the Fertigkeitswert tier; `scriptAllowed` = "… (oder Schrift)". */
export interface ProfessionLanguageGrant {
  label: string;
  level: number;
  scriptAllowed: boolean;
}

/**
 * A granted advantage/disadvantage. `label` is the display text (e.g. "Prinzipientreue I");
 * `name`/`option`/`lvl` are canonical (catalog name, SELECTION_OPTIONS slug, level) for application/validation.
 */
export interface ProfessionAdvantageRef {
  name: string;
  label: string;
  option?: string;
  lvl?: number;
}

export interface ProfessionAttributeRequirement {
  attribute: string; // usually an Attribute, but the PDF also lists energies (e.g. AE)
  min: number;
}

// A DSA5 profession (Schritt 6a/6b). Sub-package items are stored by **label** (faithful to the
// PDF); the wizard resolves labels → catalog `name` keys when applying the package.
export interface Profession extends NamedEntry {
  category: ProfessionCategory; // big-3: profane | magic | karmal
  subType: string; // precise PDF "Typ", gender-neutral (e.g. "Magier:in (Graue Gilde)")
  apCost: number; // first integer of the raw cost
  apRaw: string; // raw cost token (e.g. "216+225") — display label
  modificationNotes?: string;
  attributeRequirements: ProfessionAttributeRequirement[];
  advantages: ProfessionAdvantageRef[];
  disadvantages: ProfessionAdvantageRef[];
  generalSpecialAbilities: ProfessionGrant[]; // SFAllgemein (incl. Fertigkeitsspezialisierung)
  combatSpecialAbilities: ProfessionGrant[]; // SFKampf, e.g. "Wuchtschlag I"
  magicSpecialAbilities: ProfessionGrant[]; // SFMagie, incl. Tradition (param)
  karmalSpecialAbilities: ProfessionGrant[]; // SFKarma
  tradition?: string; // e.g. "Praioskirche"
  languageGrants: ProfessionLanguageGrant[]; // e.g. "Sprache 1 (oder Schrift)" at level III
  languageScriptAp: number; // AP allowance for languages/scripts ("X AP in Sprachen & Schriften")
  scriptGrants: string[];
  cantrips: string[]; // Zaubertricks
  combatTechniques: ProfessionCombatTechniqueBonus[];
  skills: ProfessionSkillBonus[];
  guidingAttribute?: string; // Leiteigenschaft (magic [20] / karmal [17])
  spells: ProfessionMagicGrant[]; // magic professions
  liturgies: ProfessionMagicGrant[]; // karmal professions
  blessings: string[];
  speciesRestriction?: string;
  books: string[]; // source-book codes (NamedEntry.sources is the structured form; this is the raw PDF list)
}
