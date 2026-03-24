import { inject, Injectable } from '@angular/core';
import { Character } from '../models/base-creation.model';
import { CharacterSaveData, createDefaultSaveData } from '../models/character-save.model';
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
      name: this.extractString(data, 'name', defaults.name, warnings),
      experienceLevelId: this.extractString(data, 'experienceLevelId', defaults.experienceLevelId, warnings),
      speciesType: this.extractString(data, 'speciesType', defaults.speciesType, warnings),
      culture: this.extractString(data, 'culture', defaults.culture, warnings),
      profession: this.extractString(data, 'profession', defaults.profession, warnings),
      attributeChoices: this.extractArray(data, 'attributeChoices', defaults.attributeChoices, warnings),
      attributes: this.extractAttributes(data, defaults.attributes, warnings),
      derivedStats: this.extractDerivedStats(data, defaults.derivedStats, warnings),
      advantages: this.extractArray(data, 'advantages', defaults.advantages, warnings),
      disadvantages: this.extractArray(data, 'disadvantages', defaults.disadvantages, warnings),
      specialAbilities: this.extractSpecialAbilities(data, defaults.specialAbilities, warnings),
      languages: this.extractArray(data, 'languages', defaults.languages, warnings),
      combatTechniques: this.extractObject(data, 'combatTechniques', defaults.combatTechniques, warnings),
      skills: this.extractSkills(data, defaults.skills, warnings),
      magic: this.extractArray(data, 'magic', defaults.magic, warnings),
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

  private extractAttributes(
    data: Record<string, unknown>,
    fallback: Record<string, number>,
    warnings: string[]
  ): any {
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

  private extractDerivedStats(data: Record<string, unknown>, fallback: any, warnings: string[]): any {
    const ds = data['derivedStats'];
    if (!ds || typeof ds !== 'object' || Array.isArray(ds)) return { ...fallback };
    const obj = ds as Record<string, unknown>;
    return {
      lifePoints: typeof obj['lifePoints'] === 'number' ? obj['lifePoints'] : fallback.lifePoints,
      astralPoints: typeof obj['astralPoints'] === 'number' ? obj['astralPoints'] : fallback.astralPoints,
      fatePoints: typeof obj['fatePoints'] === 'number' ? obj['fatePoints'] : fallback.fatePoints,
    };
  }

  private extractSpecialAbilities(data: Record<string, unknown>, fallback: any, warnings: string[]): any {
    const sa = data['specialAbilities'];
    if (!sa || typeof sa !== 'object' || Array.isArray(sa)) return { ...fallback };
    const obj = sa as Record<string, unknown>;
    return {
      combat: Array.isArray(obj['combat']) ? obj['combat'] : fallback.combat,
      general: Array.isArray(obj['general']) ? obj['general'] : fallback.general,
      magic: Array.isArray(obj['magic']) ? obj['magic'] : fallback.magic,
    };
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
    };
  }
}
