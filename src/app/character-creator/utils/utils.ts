import { IncreaseFactor, INCREASE_FACTOR_COST } from '../models/base-creation.model';
import { Advantage } from '../models/advantage.model';
import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';

/**
 * Resolves an advantage name to a full Advantage object from the catalog.
 * Handles parameterized names: 'begabung_singen' resolves to the 'begabung' template
 * with the qualifier appended to the label.
 */
export function resolveAdvantageByName(name: string, catalog: Advantage[], options?: { mandatory?: boolean; lvl?: number }): Advantage | null {
  const exact = catalog.find((a) => a.name === name);
  if (exact) {
    return {
      ...exact,
      ...(options?.mandatory != null ? { mandatory: options.mandatory } : {}),
      ...(options?.lvl != null ? { lvl: options.lvl } : {}),
    };
  }

  // Parameterized: extract base name before first underscore
  const underscoreIdx = name.indexOf('_');
  if (underscoreIdx > 0) {
    const baseName = name.substring(0, underscoreIdx);
    const qualifier = name.substring(underscoreIdx + 1);
    const template = catalog.find((a) => a.name === baseName);
    if (template) {
      const capitalizedQualifier = qualifier.charAt(0).toUpperCase() + qualifier.slice(1);
      return {
        ...template,
        name, // keep the full parameterized name
        label: `${template.label.replace(/ I+[-–].*$/, '')} (${capitalizedQualifier})`,
        ...(options?.mandatory != null ? { mandatory: options.mandatory } : {}),
        ...(options?.lvl != null ? { lvl: options.lvl } : {}),
      };
    }
  }
  return null;
}

/**
 * Extracts the base name from a parameterized advantage name.
 * e.g. 'begabung_singen' → 'begabung', 'zauberer' → 'zauberer'
 */
export function getAdvantageBaseName(name: string): string {
  const idx = name.indexOf('_');
  return idx > 0 ? name.substring(0, idx) : name;
}

/**
 * Extracts the qualifier from a parameterized advantage name.
 * e.g. 'begabung_singen' → 'singen', 'zauberer' → undefined
 */
export function getAdvantageQualifier(name: string): string | undefined {
  const idx = name.indexOf('_');
  return idx > 0 ? name.substring(idx + 1) : undefined;
}

/**
 * Checks if two advantage names conflict based on prerequisite rules.
 * Handles parameterized matching: 'begabung_singen' conflicts with 'unfahig_singen'
 * (same qualifier, base names in each other's prerequisite list).
 */
export function checkPrerequisiteConflict(advName: string, prereqName: string, allSelected: string[]): boolean {
  // Direct match
  if (allSelected.includes(prereqName)) return true;

  // Parameterized match: check if any selected advantage has the same qualifier
  // and its base name matches the prereq
  const advQualifier = getAdvantageQualifier(advName);
  if (advQualifier) {
    const qualifiedPrereq = `${prereqName}_${advQualifier}`;
    if (allSelected.includes(qualifiedPrereq)) return true;
  }

  return false;
}

export function totalTalentCost(value: number, factor: IncreaseFactor, needActivation = false, isAttribute = false): number {
  if (value < 0 || (value === 0 && !needActivation)) return 0;

  const base = INCREASE_FACTOR_COST[factor];
  let cost = 0;

  for (let i = 1; i <= value; i++) {
    if (isAttribute && i <= 8) continue;

    if (factor === IncreaseFactor.E) {
      if (isAttribute || needActivation) {
        if (i <= 14) {
          cost += 15;
        } else {
          cost += 15 * (i - 13); // 15→30→45...
        }
      }
    } else {
      if (i <= 12) {
        cost += base;
      } else {
        cost += base * (i - 11); // from 13: increasing
      }
    }
  }

  // only for magic or liturgy
  if (needActivation && factor !== IncreaseFactor.E) {
    cost += base;
  }

  return cost;
}
