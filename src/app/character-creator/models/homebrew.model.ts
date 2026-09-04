// A character-specific homebrew entry. Either a non-existent SF/advantage the GM allows, or a noted
// adjustment to an existing one (changed probe / cost / effect). Stored embedded in the character save
// (no library, no server), so a loaded/imported character always displays its homebrew correctly.
// v1: free-form display + AP cost only — homebrew never feeds the catalog/validation, so it can't
// produce false validation errors.

export type HomebrewKind =
  | 'advantage'
  | 'disadvantage'
  | 'specialAbility' // general SF (Allgemein)
  | 'combatSpecialAbility' // Kampf
  | 'magicSpecialAbility' // Magie
  | 'karmalSpecialAbility' // Liturgien
  | 'other';

/** SF homebrew kinds → the SF bucket they mirror into (matches the special-abilities BucketKey). */
export const HOMEBREW_SA_BUCKET: Partial<Record<HomebrewKind, 'general' | 'combat' | 'magic' | 'karmal'>> = {
  specialAbility: 'general',
  combatSpecialAbility: 'combat',
  magicSpecialAbility: 'magic',
  karmalSpecialAbility: 'karmal',
};

export interface HomebrewEntry {
  id: string; // character-local id (uuid)
  kind: HomebrewKind;
  label: string;
  cost: number; // AP (negative for a disadvantage); counted in the budget. Per level when `level` is set.
  level?: number; // for leveled entries
  probe?: string; // "auf was gewürfelt wird" — free text, e.g. "MU/KL/IN"
  effectText?: string; // effect / rule description
  prerequisiteText?: string; // free-text prerequisites (display only)
  note?: string; // context, e.g. "Hausregel-Anpassung von Wuchtschlag"
}

/** Total AP from homebrew entries (cost × level for leveled ones). */
export function homebrewApCost(entries: readonly HomebrewEntry[]): number {
  return entries.reduce((sum, e) => sum + e.cost * (e.level ?? 1), 0);
}

/** Total AP from homebrew entries of one kind (cost × level). Used to fold homebrew advantages /
 *  disadvantages into the same 80-AP caps and −80 spend clamp as their catalog counterparts. */
export function homebrewApCostOfKind(entries: readonly HomebrewEntry[], kind: HomebrewKind): number {
  return homebrewApCost(entries.filter((e) => e.kind === kind));
}
