import { IncreaseFactor, INCREASE_FACTOR_COST } from '../models/base-creation.model';
import { Advantage, AdvantageSelection, SelectionOption } from '../models/advantage.model';
import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { SELECTION_OPTIONS } from '../constants/selection-options.const';

/** Registry key for a selection's option list: `param ? `${id}:${param}` : id`. */
export function selectionKey(sel: AdvantageSelection): string {
  return sel.param ? `${sel.id}:${sel.param}` : sel.id;
}

/** Fully-resolved sub-option list for a selection advantage or special ability (empty when none). */
export function selectionOptionsFor(entry: { selection?: AdvantageSelection }): SelectionOption[] {
  return entry.selection ? SELECTION_OPTIONS[selectionKey(entry.selection)] ?? [] : [];
}

export const SF_INDEX: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };

/**
 * Effective AP cost of a single sub-option. For SF-priced advantages (Begabung, Unfähig, …) the
 * advantage `cost` is per Steigerungsfaktor-point, so multiply by the option's SF-index; otherwise
 * use the option's own cost, falling back to the advantage's flat cost.
 */
export function optionCost(adv: Advantage, option: SelectionOption): number {
  if (adv.costBySteigerungsfaktor && option.factor) return adv.cost * (SF_INDEX[option.factor] ?? 1);
  return option.cost ?? adv.cost;
}

/**
 * AP cost span across a selection advantage's options, so the add-dropdown can show a range.
 */
export function selectionCostRange(adv: Advantage): { min: number; max: number } {
  const opts = selectionOptionsFor(adv);
  const costs = opts.map((o) => optionCost(adv, o));
  if (!costs.length) return { min: adv.cost, max: adv.cost };
  return { min: Math.min(...costs), max: Math.max(...costs) };
}

/**
 * Resolves an advantage name to a full Advantage object from the catalog.
 * Handles parameterized names: 'begabung_singen' resolves to the 'begabung' template
 * with the qualifier appended to the label. For selection advantages, the qualifier is
 * matched against the option list so the instance carries the option's label and cost.
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
      // Prefer the matching selection option (canonical label + effective cost) over the raw qualifier.
      const option = selectionOptionsFor(template).find((o) => o.name === qualifier);
      const qualifierLabel = option?.label ?? qualifier.charAt(0).toUpperCase() + qualifier.slice(1);
      return {
        ...template,
        name, // keep the full parameterized name
        label: `${template.label.replace(/ I+[-–].*$/, '')} (${qualifierLabel})`,
        ...(option ? { cost: optionCost(template, option) } : {}),
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
 * Appends a new advantage/disadvantage instance to a list, respecting selection rules:
 * a selection base may appear up to its `maxCount`, and a new (unset) instance is only added
 * while no existing instance of the same base is still without a chosen option. Non-selection
 * entries are added once. Returns the original list unchanged when the add is not allowed.
 */
export function appendAdvantageInstance(name: string, catalog: Advantage[], list: Advantage[]): Advantage[] {
  const resolved = resolveAdvantageByName(name, catalog);
  if (!resolved) return list;
  if (resolved.selection) {
    const insts = list.filter((a) => getAdvantageBaseName(a.name) === resolved.name);
    const max = resolved.selection.maxCount ?? 1;
    // Only the count is capped — several unset instances may coexist (each gets its own sub-option),
    // so a second Schlechte Eigenschaft can be added directly without filling the first.
    if (insts.length >= max) return list;
    return [...list, resolved];
  }
  return list.some((a) => a.name === resolved.name) ? list : [...list, resolved];
}

/**
 * Re-keys a selection instance to its chosen option (`base_option`), or back to the bare base when
 * cleared. No-op if the target name is already taken. Preserves the instance level and mandatory flag.
 */
export function applyAdvantageOption(currentName: string, optionName: string | null, catalog: Advantage[], list: Advantage[]): Advantage[] {
  const base = getAdvantageBaseName(currentName);
  const newName = optionName ? `${base}_${optionName}` : base;
  if (newName !== currentName && list.some((a) => a.name === newName)) return list; // already taken
  return list.map((a) => {
    if (a.name !== currentName) return a;
    const resolved = resolveAdvantageByName(newName, catalog, { lvl: a.lvl });
    return resolved ? { ...resolved, ...(a.mandatory ? { mandatory: true } : {}) } : a;
  });
}

/**
 * Re-keys the instance at `index` to its chosen option (`base_option`), or back to the bare base when
 * cleared. Index-based so several UNSET instances of the same base (e.g. two Schlechte Eigenschaften)
 * are unambiguous. No-op if the option is already taken by another instance of the same base.
 */
export function applyAdvantageOptionAt(index: number, optionName: string | null, catalog: Advantage[], list: Advantage[]): Advantage[] {
  const cur = list[index];
  if (!cur) return list;
  const base = getAdvantageBaseName(cur.name);
  const newName = optionName ? `${base}_${optionName}` : base;
  if (optionName && list.some((a, i) => i !== index && a.name === newName)) return list; // already taken
  return list.map((a, i) => {
    if (i !== index) return a;
    const resolved = resolveAdvantageByName(newName, catalog, { lvl: a.lvl });
    return resolved ? { ...resolved, ...(a.mandatory ? { mandatory: true } : {}) } : a;
  });
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

/**
 * Effective AP cost of a selected advantage/disadvantage.
 * For leveled entries (maxLvl > 1) the catalog `cost` is per level, so multiply by the
 * chosen level. Disadvantage costs are negative; the same multiplication applies.
 */
export function advantageCost(adv: Advantage): number {
  if (adv.costOverride != null) return adv.costOverride; // character-local total-AP override (GM ruling)
  const leveled = adv.maxLvl != null && adv.maxLvl > 1;
  if (!leveled) return adv.cost;
  const lvl = adv.lvl ?? 1;
  // A leveled advantage picks ONE level; the PDF lists the absolute AP per level (non-linear for
  // Einkommen: 0/2/6/20/60/200). Use that table when present, else the linear per-level cost.
  if (adv.costLevels?.length) return adv.costLevels[Math.max(1, Math.min(lvl, adv.costLevels.length)) - 1] ?? adv.cost * lvl;
  return adv.cost * lvl;
}

// ── Advantage/disadvantage label → catalog ref ─────────────────────────────────
// Culture & profession data reference advantages by German *label* (often parameterized:
// "Begabung in Naturtalenten", "Persönlichkeitsschwächen (Vorurteile)"). This resolves a
// label to a catalog entry, best-effort (parameterized base + plural→singular).
export interface ResolvedAdvantageRef {
  name: string;
  label: string;
  qualifier?: string;
  isDisadvantage: boolean;
}

function normalizeAdvantageLabel(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ') // drop parenthetical qualifier
    .replace(/\b[ivx]+(?:-[ivx]+)?\b/g, ' ') // roman level (I, I-III, I-VII, I-X)
    .replace(/[*.…]/g, ' ') // *, ., ellipsis
    .replace(/\s+/g, ' ')
    .trim();
}

let advantageLabelIndex: Map<string, { name: string; isDisadvantage: boolean }> | null = null;
function getAdvantageLabelIndex(): Map<string, { name: string; isDisadvantage: boolean }> {
  if (advantageLabelIndex) return advantageLabelIndex;
  const index = new Map<string, { name: string; isDisadvantage: boolean }>();
  for (const a of ADVANTAGE) index.set(normalizeAdvantageLabel(a.label), { name: a.name, isDisadvantage: false });
  for (const a of DISADVANTAGE) {
    const key = normalizeAdvantageLabel(a.label);
    if (!index.has(key)) index.set(key, { name: a.name, isDisadvantage: true });
  }
  advantageLabelIndex = index;
  return index;
}

export function resolveAdvantageRefByLabel(label: string): ResolvedAdvantageRef | null {
  const index = getAdvantageLabelIndex();
  let base = label;
  let qualifier: string | undefined;
  const paren = label.match(/\((.*)\)/);
  if (paren) {
    qualifier = paren[1].trim();
    base = label.replace(/\(.*\)/, '').trim();
  } else {
    const inIdx = label.toLowerCase().indexOf(' in ');
    if (inIdx > 0) {
      qualifier = label.slice(inIdx + 4).trim();
      base = label.slice(0, inIdx).trim();
    }
  }
  const n = normalizeAdvantageLabel(base);
  const keys = [n];
  if (n.endsWith('en')) keys.push(n.slice(0, -2));
  if (n.endsWith('n')) keys.push(n.slice(0, -1));
  if (n.endsWith('e')) keys.push(n.slice(0, -1));
  for (const k of keys) {
    const hit = index.get(k);
    if (hit) return { name: hit.name, label, qualifier, isDisadvantage: hit.isDisadvantage };
  }
  return null;
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

// Routine: minimum FW per probe-modifier threshold (DSA5). eff FW ≥ minFW ⇒ routine at that modifier.
const ROUTINE_TABLE: Array<[number, number]> = [
  [19, -3],
  [16, -2],
  [13, -1],
  [10, 0],
  [7, 1],
  [4, 2],
  [1, 3],
];

/**
 * Routine value for a talent check (DSA5 + optional attribute rule). The hero needs ≥13 in each check
 * attribute; under the optional rule, each point below 13 (summed) raises the required FW by 3. Returns
 * the HARDEST probe modifier at which a routine check is still possible (e.g. "±0", "-1", "+2"), or "-"
 * if no routine is possible. Shared by the talents slice and the PDF sheet.
 */
export function computeRoutine(fw: number, attrValues: number[]): string {
  if (fw <= 0) return '-';
  const deficit = attrValues.reduce((sum, a) => sum + Math.max(0, 13 - a), 0);
  const eff = fw - 3 * deficit;
  if (eff < 1) return '-';
  const mod = ROUTINE_TABLE.find(([minFw]) => eff >= minFw)![1];
  return mod === 0 ? '±0' : mod > 0 ? `+${mod}` : `${mod}`;
}
