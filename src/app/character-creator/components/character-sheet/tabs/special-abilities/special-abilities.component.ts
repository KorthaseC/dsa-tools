import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ALL_SPECIAL_ABILITIES } from '../../../../constants/special-ability.const';
import { SpecialAbilities, SpecialAbilityRef } from '../../../../models/base-creation.model';
import { SpecialAbility } from '../../../../models/special-ability.model';
import { HomebrewEntry, HOMEBREW_SA_BUCKET } from '../../../../models/homebrew.model';
import { SelectionOption } from '../../../../models/advantage.model';
import { selectionOptionsFor } from '../../../../utils/utils';
import { CharacterStateService, specialAbilityCost } from '../../../../services/character-state.service';
import { ActionSelectDirective } from '../../../../directives/action-select.directive';
import { RuleLinkComponent } from '../../../rule-link/rule-link.component';

type BucketKey = keyof SpecialAbilities; // general | combat | magic | karmal

function bucketOf(category: string): BucketKey {
  if (category.startsWith('magic')) return 'magic';
  if (category.startsWith('karmal')) return 'karmal';
  if (category.startsWith('combat') || category === 'command' || category === 'brawling') return 'combat';
  return 'general';
}

const SA_MAP = new Map<string, SpecialAbility>(ALL_SPECIAL_ABILITIES.map((s) => [s.name, s]));
// SAs that carry a free-text region and may be taken multiple times.
const PARAM_SAS = new Set(['ortskenntnis']);

const BUCKET_OPTIONS: Record<BucketKey, { label: string; value: string }[]> = (() => {
  const result: Record<BucketKey, { label: string; value: string }[]> = { general: [], combat: [], magic: [], karmal: [] };
  for (const sa of ALL_SPECIAL_ABILITIES) {
    const cat = sa.category as string;
    if (cat === 'language' || cat === 'script') continue; // languages/scripts have their own editor (Allgemein tab)
    result[bucketOf(sa.category)].push({ label: sa.label, value: sa.name });
  }
  (Object.keys(result) as BucketKey[]).forEach((k) => result[k].sort((a, b) => a.label.localeCompare(b.label, 'de')));
  return result;
})();

@Component({
  selector: 'app-cs-special-abilities',
  imports: [FormsModule, ButtonModule, CheckboxModule, InputNumber, InputTextModule, SelectModule, TooltipModule, ActionSelectDirective, RuleLinkComponent],
  templateUrl: './special-abilities.component.html',
  styleUrl: './special-abilities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecialAbilitiesComponent {
  private state = inject(CharacterStateService);

  private readonly allBuckets: { key: BucketKey; label: string }[] = [
    { key: 'general', label: 'Allgemeine Sonderfertigkeiten' },
    { key: 'combat', label: 'Kampfsonderfertigkeiten' },
    { key: 'magic', label: 'Magische Sonderfertigkeiten' },
    { key: 'karmal', label: 'Karmale Sonderfertigkeiten' },
  ];

  /** Which buckets this instance renders — set per host tab (general→Allgemein, combat→Kampf, …). */
  readonly buckets = input<BucketKey[]>(['general', 'combat', 'magic', 'karmal']);

  // Only the requested buckets; magic/karmal additionally require Zauberer/Geweihter.
  readonly visibleBuckets = computed(() => {
    const allowed = new Set(this.buckets());
    return this.allBuckets.filter(
      (b) => allowed.has(b.key) && (b.key === 'magic' ? this.state.isZauberer() : b.key === 'karmal' ? this.state.isGeweihter() : true)
    );
  });

  readonly addModels = signal<Record<BucketKey, string | null>>({ general: null, combat: null, magic: null, karmal: null });

  readonly cost = specialAbilityCost;

  /** GM cost-adjustment flag (shared with the traits tab). While on, per-row cost becomes an input. */
  readonly costOverrideUnlocked = this.state.costOverrideUnlocked;

  /** SAs that take a free-text region and may be taken several times (e.g. Ortskenntnis). */
  isParam(name: string): boolean {
    return PARAM_SAS.has(name);
  }

  entries(bucket: BucketKey): { ref: SpecialAbilityRef; sa?: SpecialAbility; index: number }[] {
    return this.state.picks().specialAbilities[bucket].map((ref, index) => ({ ref, sa: SA_MAP.get(ref.name), index }));
  }

  bucketCost(bucket: BucketKey): number {
    const catalog = this.state.picks().specialAbilities[bucket].reduce((s, r) => s + specialAbilityCost(r), 0);
    return catalog + this.homebrewFor(bucket).reduce((s, e) => s + this.hbCost(e), 0);
  }

  /** Homebrew SFs that mirror into this bucket (read-only; authored in the Homebrew tab, counted in AP). */
  homebrewFor(bucket: BucketKey): HomebrewEntry[] {
    return (this.state.character()?.homebrew ?? []).filter((e) => HOMEBREW_SA_BUCKET[e.kind] === bucket);
  }

  hbCost(e: HomebrewEntry): number {
    return e.cost * (e.level ?? 1);
  }

  options(bucket: BucketKey): { label: string; value: string }[] {
    // Param SAs (Ortskenntnis) and selection SAs (Lieblingszauber, …) stay available so several can be
    // added (each with its own sub-option); plain SAs are hidden once taken.
    const taken = new Set(
      this.state
        .picks()
        .specialAbilities[bucket].filter((r) => !PARAM_SAS.has(r.name) && !SA_MAP.get(r.name)?.selection)
        .map((r) => r.name)
    );
    return BUCKET_OPTIONS[bucket].filter((o) => !taken.has(o.value));
  }

  isLeveled(sa?: SpecialAbility): boolean {
    return sa?.maxLvl != null && sa.maxLvl > 1;
  }

  /** True if the SA has a sub-selection (Auswahl) with options → render an option dropdown. */
  hasSelection(sa?: SpecialAbility): boolean {
    return !!sa?.selection && selectionOptionsFor(sa).length > 0;
  }

  /** Sub-option list for a selection SA (label + name), e.g. the spells of Lieblingszauber's ZauberArray. */
  selectionOptions(sa?: SpecialAbility): SelectionOption[] {
    return sa ? selectionOptionsFor(sa) : [];
  }

  /** True if the sub-choice is free text: an Ortskenntnis-style param SA, or a selection whose source
   *  has no fixed option list (e.g. OrtArray/RegionArray) — render a text input instead of a dropdown. */
  needsParamText(name: string, sa?: SpecialAbility): boolean {
    return PARAM_SAS.has(name) || (!!sa?.selection && selectionOptionsFor(sa).length === 0);
  }

  add(bucket: BucketKey, name: string | null): void {
    if (name) {
      const sa = SA_MAP.get(name);
      // Free-text-param SAs (Ortskenntnis) and selection SAs (Lieblingszauber, …) get an editable
      // sub-field and may be taken several times; others are added once.
      if (PARAM_SAS.has(name) || !!sa?.selection) {
        this.state.updateSpecialAbilities(bucket, (list) => [...list, { name, param: '' }]);
      } else {
        this.state.updateSpecialAbilities(bucket, (list) => (list.some((r) => r.name === name) ? list : [...list, { name }]));
      }
    }
    this.addModels.update((m) => ({ ...m, [bucket]: null }));
  }

  removeAt(bucket: BucketKey, index: number): void {
    this.state.updateSpecialAbilities(bucket, (list) => list.filter((_, i) => i !== index));
  }

  setLevel(bucket: BucketKey, name: string, lvl: number | null): void {
    this.state.updateSpecialAbilities(bucket, (list) => list.map((r) => (r.name === name ? { ...r, lvl: lvl ?? 1 } : r)));
  }

  setParam(bucket: BucketKey, index: number, param: string): void {
    this.state.updateSpecialAbilities(bucket, (list) => list.map((r, i) => (i === index ? { ...r, param } : r)));
  }

  /** GM cost override (total AP). `null`/empty clears it → back to the catalog cost. */
  setCostOverride(bucket: BucketKey, index: number, value: number | null): void {
    this.state.updateSpecialAbilities(bucket, (list) => list.map((r, i) => (i === index ? { ...r, costOverride: value ?? undefined } : r)));
  }
}
