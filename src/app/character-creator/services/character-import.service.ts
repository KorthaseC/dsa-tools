import { inject, Injectable } from '@angular/core';
import { Bio, SpecialAbilities, SpecialAbilityRef } from '../models/base-creation.model';
import { CharacterSaveData, createDefaultSaveData, EnergyInputs, PoolInput } from '../models/character-save.model';
import { ChosenEntry } from '../models/chosen-entry.model';
import { Character } from '../models/base-creation.model';
import { toChosenEntries } from '../catalog/save-entries';
import { ValidationResult } from '../models/validation.model';
import { CharacterResolverService } from './character-resolver.service';
import { CharacterValidationService } from './character-validation.service';

export interface ImportResult {
  character: Character;
  saveData: CharacterSaveData;
  validationResults: ValidationResult[];
  parseWarnings: string[];
}

@Injectable({ providedIn: 'root' })
export class CharacterImportService {
  private resolver = inject(CharacterResolverService);
  private validator = inject(CharacterValidationService);

  importFromJson(json: unknown): ImportResult {
    const { saveData, parseWarnings } = this.parseSaveData(json);
    const character = this.resolver.resolve(saveData);
    const validationResults = this.validator.validate(character);
    return { character, saveData, validationResults, parseWarnings };
  }

  private parseSaveData(json: unknown): { saveData: CharacterSaveData; parseWarnings: string[] } {
    const warnings: string[] = [];
    const defaults = createDefaultSaveData();

    if (!json || typeof json !== 'object') {
      warnings.push('Ungültiges JSON-Format: kein Objekt');
      return { saveData: defaults, parseWarnings: warnings };
    }

    const data = json as Record<string, unknown>;

    const saveData: CharacterSaveData = {
      version: this.extractNumber(data, 'version', defaults.version, warnings),
      bio: this.extractBio(data, defaults.bio, warnings),
      experienceLevelId: this.extractString(data, 'experienceLevelId', defaults.experienceLevelId, warnings),
      speciesType: this.extractString(data, 'speciesType', defaults.speciesType, warnings),
      culture: this.extractString(data, 'culture', defaults.culture, warnings),
      useCulturePackage: typeof data['useCulturePackage'] === 'boolean' ? (data['useCulturePackage'] as boolean) : defaults.useCulturePackage,
      profession: this.extractString(data, 'profession', defaults.profession, warnings),
      attributeChoices: this.extractArray(data, 'attributeChoices', defaults.attributeChoices, warnings),
      attributes: this.extractAttributes(data, defaults.attributes, warnings),
      energies: this.extractEnergies(data, defaults.energies, warnings),
      entries: this.extractEntries(data, warnings),
      homebrew: this.extractArray(data, 'homebrew', defaults.homebrew, warnings),
      languages: this.extractArray(data, 'languages', defaults.languages, warnings),
      scripts: this.extractArray(data, 'scripts', defaults.scripts, warnings),
      combatTechniques: this.extractObject(data, 'combatTechniques', defaults.combatTechniques, warnings),
      skills: this.extractSkills(data, defaults.skills, warnings),
      spells: this.extractArray(data, 'spells', defaults.spells, warnings),
      cantrips: this.extractArray(data, 'cantrips', defaults.cantrips, warnings),
      magicTradition: this.extractOptionalString(data, 'magicTradition'),
      magicGuidingAttribute: this.extractOptionalString(data, 'magicGuidingAttribute'),
      magicTrait: this.extractOptionalString(data, 'magicTrait'),
      liturgies: this.extractArray(data, 'liturgies', defaults.liturgies, warnings),
      blessings: this.extractArray(data, 'blessings', defaults.blessings, warnings),
      karmalTradition: this.extractOptionalString(data, 'karmalTradition'),
      karmalGuidingAttribute: this.extractOptionalString(data, 'karmalGuidingAttribute'),
      karmalAspect: this.extractOptionalString(data, 'karmalAspect'),
      equipment: this.extractEquipment(data, defaults.equipment, warnings),
      currency: this.extractCurrency(data, defaults.currency, warnings),
      notes: this.extractString(data, 'notes', defaults.notes, warnings),
    };

    return { saveData, parseWarnings: warnings };
  }

  private extractString(data: Record<string, unknown>, key: string, fallback: string, warnings: string[]): string {
    if (key in data && typeof data[key] === 'string') return data[key] as string;
    if (key in data) warnings.push(`Feld „${key}" hat einen ungültigen Typ, Standard wird verwendet.`);
    return fallback;
  }

  private extractOptionalString(data: Record<string, unknown>, key: string): string | undefined {
    return key in data && typeof data[key] === 'string' ? (data[key] as string) : undefined;
  }

  private extractNumber(data: Record<string, unknown>, key: string, fallback: number, warnings: string[]): number {
    if (key in data && typeof data[key] === 'number') return data[key] as number;
    if (key in data) warnings.push(`Feld „${key}" hat einen ungültigen Typ, Standard wird verwendet.`);
    return fallback;
  }

  private extractArray(data: Record<string, unknown>, key: string, fallback: unknown[], warnings: string[]): any[] {
    if (key in data && Array.isArray(data[key])) return data[key] as any[];
    if (key in data) warnings.push(`Feld „${key}" ist kein Array, Standard wird verwendet.`);
    return fallback as any[];
  }

  private extractObject(data: Record<string, unknown>, key: string, fallback: unknown, warnings: string[]): any {
    if (key in data && typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
      return data[key];
    }
    if (key in data) warnings.push(`Feld „${key}" hat einen ungültigen Typ, Standard wird verwendet.`);
    return fallback;
  }

  private extractBio(data: Record<string, unknown>, fallback: Bio, warnings: string[]): Bio {
    const raw = data['bio'];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      // Back-compat with a former top-level `name` field.
      if (typeof data['name'] === 'string') return { ...fallback, name: data['name'] as string };
      if ('bio' in data) warnings.push('Feld „bio" hat einen ungültigen Typ.');
      return { ...fallback };
    }
    return { ...fallback, ...(raw as Partial<Bio>) };
  }

  private extractAttributes(data: Record<string, unknown>, fallback: Record<string, number>, warnings: string[]): any {
    const rawAttrs = data['attributes'];
    if (!rawAttrs || typeof rawAttrs !== 'object' || Array.isArray(rawAttrs)) {
      if ('attributes' in data) warnings.push('Feld „attributes" hat einen ungültigen Typ.');
      return { ...fallback };
    }
    const attrs = rawAttrs as Record<string, unknown>;
    const result = { ...fallback };
    for (const key of ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK']) {
      if (key in attrs && typeof attrs[key] === 'number') {
        result[key] = attrs[key] as number;
      }
    }
    return result;
  }

  private extractEnergies(data: Record<string, unknown>, fallback: EnergyInputs, warnings: string[]): EnergyInputs {
    const raw = data['energies'];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...fallback };
    const obj = raw as Record<string, unknown>;
    return {
      lifePoints: this.extractPoolInput(obj['lifePoints'], fallback.lifePoints),
      astralPoints: this.extractPoolInput(obj['astralPoints'], fallback.astralPoints),
      karmaPoints: this.extractPoolInput(obj['karmaPoints'], fallback.karmaPoints),
      fatePoints: this.extractPoolInput(obj['fatePoints'], fallback.fatePoints),
    };
  }

  private extractPoolInput(raw: unknown, fallback: PoolInput): PoolInput {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...fallback };
    const o = raw as Record<string, unknown>;
    return {
      bought: typeof o['bought'] === 'number' ? (o['bought'] as number) : fallback.bought,
      current: typeof o['current'] === 'number' ? (o['current'] as number) : fallback.current,
      permanentLost: typeof o['permanentLost'] === 'number' ? (o['permanentLost'] as number) : fallback.permanentLost,
      // boughtBack was dropped here before, so an imported character silently lost its bought-back
      // permanent AsP/KaP (max energy came out too low). The export always writes it via toPoolInput.
      boughtBack: typeof o['boughtBack'] === 'number' ? (o['boughtBack'] as number) : fallback.boughtBack,
    };
  }

  /** v3: read the unified `entries` list; v2 fallback: migrate advantages/disadvantages/specialAbilities. */
  private extractEntries(data: Record<string, unknown>, warnings: string[]): ChosenEntry[] {
    if (Array.isArray(data['entries'])) return data['entries'] as ChosenEntry[];

    const arr = (v: unknown) => (Array.isArray(v) ? v : []);
    const adv = arr(data['advantages']) as { name: string; lvl?: number }[];
    const dis = arr(data['disadvantages']) as { name: string; lvl?: number }[];
    const saRaw = data['specialAbilities'];
    const saObj = saRaw && typeof saRaw === 'object' && !Array.isArray(saRaw) ? (saRaw as Record<string, unknown>) : {};
    const sa: SpecialAbilities = {
      general: arr(saObj['general']) as SpecialAbilityRef[],
      combat: arr(saObj['combat']) as SpecialAbilityRef[],
      magic: arr(saObj['magic']) as SpecialAbilityRef[],
      karmal: arr(saObj['karmal']) as SpecialAbilityRef[],
    };
    if (adv.length || dis.length || sa.general.length || sa.combat.length || sa.magic.length || sa.karmal.length) {
      warnings.push('Altes Speicherformat (v2) erkannt – Vor-/Nachteile und Sonderfertigkeiten wurden migriert.');
    }
    return toChosenEntries(adv, dis, sa);
  }

  private extractSkills(data: Record<string, unknown>, fallback: any, warnings: string[]): any {
    const sk = data['skills'];
    if (!sk || typeof sk !== 'object' || Array.isArray(sk)) return { ...fallback };
    const obj = sk as Record<string, unknown>;
    return {
      physical: Array.isArray(obj['physical']) ? obj['physical'] : fallback.physical,
      social: Array.isArray(obj['social']) ? obj['social'] : fallback.social,
      nature: Array.isArray(obj['nature']) ? obj['nature'] : fallback.nature,
      knowledge: Array.isArray(obj['knowledge']) ? obj['knowledge'] : fallback.knowledge,
      crafts: Array.isArray(obj['crafts']) ? obj['crafts'] : fallback.crafts,
    };
  }

  private extractEquipment(data: Record<string, unknown>, fallback: any, warnings: string[]): any {
    const eq = data['equipment'];
    if (!eq || typeof eq !== 'object' || Array.isArray(eq)) return { ...fallback };
    const obj = eq as Record<string, unknown>;
    return {
      closeCombat: Array.isArray(obj['closeCombat']) ? obj['closeCombat'] : fallback.closeCombat,
      rangeCombat: Array.isArray(obj['rangeCombat']) ? obj['rangeCombat'] : fallback.rangeCombat,
      armor: Array.isArray(obj['armor']) ? obj['armor'] : fallback.armor,
      shields: Array.isArray(obj['shields']) ? obj['shields'] : fallback.shields,
      general: Array.isArray(obj['general']) ? obj['general'] : fallback.general,
    };
  }

  private extractCurrency(data: Record<string, unknown>, fallback: any, warnings: string[]): any {
    const cur = data['currency'];
    if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return { ...fallback };
    const obj = cur as Record<string, unknown>;
    return {
      ducats: typeof obj['ducats'] === 'number' ? obj['ducats'] : fallback.ducats,
      silverthalers: typeof obj['silverthalers'] === 'number' ? obj['silverthalers'] : fallback.silverthalers,
      haler: typeof obj['haler'] === 'number' ? obj['haler'] : fallback.haler,
      kreutzer: typeof obj['kreutzer'] === 'number' ? obj['kreutzer'] : fallback.kreutzer,
      ...(typeof obj['gems'] === 'string' ? { gems: obj['gems'] } : {}),
      ...(typeof obj['jewelry'] === 'string' ? { jewelry: obj['jewelry'] } : {}),
      ...(typeof obj['misc'] === 'string' ? { misc: obj['misc'] } : {}),
    };
  }
}
