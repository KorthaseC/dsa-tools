import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ADVANTAGE, DISADVANTAGE } from '../../constants/advantage.const';
import { ALL_CULTURES, DEFAULT_SOCIAL_STATUS, SOCIAL_STATUS_ORDER } from '../../constants/culture.const';
import { ALL_SPECIAL_ABILITIES } from '../../constants/special-ability.const';
import { ALL_SPECIES } from '../../constants/species.const';
import { Advantage } from '../../models/advantage.model';
import { Culture, CultureAdvantageRef } from '../../models/culture.model';
import { CharacterStateService } from '../../services/character-state.service';
import {
  advantageCost,
  appendAdvantageInstance,
  applyAdvantageOption,
  getAdvantageBaseName,
  getAdvantageQualifier,
  optionCost,
  resolveAdvantageByName,
  selectionCostRange,
  selectionOptionsFor,
} from '../../utils/utils';

const LANG_OPTIONS = ALL_SPECIAL_ABILITIES.filter((s) => (s.category as string) === 'language')
  .map((s) => ({ label: s.label, value: s.name }))
  .sort((a, b) => a.label.localeCompare(b.label, 'de'));

/** How a recommended culture trait is rendered. */
type RecoKind = 'plain' | 'selection' | 'leveled';

interface Recommendation {
  label: string; // display text (descriptive German label for categories/choices, else the resolved label)
  resolved: Advantage | null; // catalog instance (with option/cost) when togglable; null = guidance-only
  isDisadvantage: boolean;
  kind: RecoKind;
}

interface CultureGroup {
  label: string;
  hint?: string;
  items: Culture[];
}

/** A pickable sub-option rendered in a selection row's category select. */
interface SubOption {
  label: string;
  value: string;
  costLabel: string;
  disabled: boolean;
}

@Component({
  selector: 'app-culture-step',
  imports: [NgTemplateOutlet, FormsModule, ButtonModule, CheckboxModule, InputNumber, InputTextModule, SelectModule, TooltipModule],
  templateUrl: './culture-step.component.html',
  styleUrl: './culture-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CultureStepComponent {
  private state = inject(CharacterStateService);

  readonly filter = signal('');

  private readonly speciesType = computed(() => this.state.character()?.species ?? '');
  readonly speciesLabel = computed(() => ALL_SPECIES.find((s) => s.type === this.speciesType())?.label ?? 'deine Spezies');

  /** Cultures of the species first, then all others — both filtered by the search term. */
  readonly groups = computed<CultureGroup[]>(() => {
    const species = this.speciesType();
    const q = this.filter().toLowerCase().trim();
    const matched = q ? ALL_CULTURES.filter((c) => c.label.toLowerCase().includes(q)) : ALL_CULTURES;
    const typical = matched.filter((c) => c.speciesRestriction.includes(species));
    const others = matched.filter((c) => !c.speciesRestriction.includes(species));
    const groups: CultureGroup[] = [];
    if (typical.length) groups.push({ label: `Typisch für ${this.speciesLabel()}`, items: typical });
    if (others.length) groups.push({ label: 'Weitere Kulturen', hint: 'Nur mit Spielleiter-Absprache.', items: others });
    return groups;
  });

  readonly selected = computed<Culture | undefined>(() => {
    const name = this.state.character()?.culture;
    return name ? ALL_CULTURES.find((c) => c.name === name) : undefined;
  });

  /** True when the selected culture is not typical for the chosen species. */
  readonly isAtypicalCulture = computed(() => {
    const c = this.selected();
    return !!c && !c.speciesRestriction.includes(this.speciesType());
  });

  readonly typicalAdvantages = computed(() => this.recommend(this.selected()?.typicalAdvantages, false));
  readonly typicalDisadvantages = computed(() => this.recommend(this.selected()?.typicalDisadvantages, true));
  readonly atypicalAdvantages = computed(() => this.recommend(this.selected()?.atypicalAdvantages, false));
  readonly atypicalDisadvantages = computed(() => this.recommend(this.selected()?.atypicalDisadvantages, true));

  // Live character trait lists, so selection/level rows re-render as the user edits them.
  private readonly advantages = computed<Advantage[]>(() => this.state.picks().advantages);
  private readonly disadvantages = computed<Advantage[]>(() => this.state.picks().disadvantages);

  /**
   * Social-status options, ordered "Frei" → what the culture actually has → the rest.
   *
   * A culture's `socialStatus` lists only the tiers that occur there BESIDES the implicit
   * DEFAULT_SOCIAL_STATUS. Labelling that list "Typisch" and filing Frei under "Weitere" inverted
   * the meaning: it read as if a culture without nobility made "Adel" the expected choice and
   * "Frei" the exception. The last group stays selectable on purpose — a hero may come from a tier
   * their culture does not really represent, that is a call for the group, not for the tool.
   */
  readonly socialStatusGroups = computed(() => {
    const c = this.selected();
    if (!c) return [];
    const opt = (s: string) => ({ label: s, value: s });
    const others = SOCIAL_STATUS_ORDER.filter((s) => s !== DEFAULT_SOCIAL_STATUS);
    const present = others.filter((s) => c.socialStatus.includes(s));
    const absent = others.filter((s) => !c.socialStatus.includes(s));
    const groups = [{ label: 'Standard', items: [opt(DEFAULT_SOCIAL_STATUS)] }];
    if (present.length) groups.push({ label: `Kommt bei ${c.label} vor`, items: present.map(opt) });
    if (absent.length) groups.push({ label: `Bei ${c.label} unüblich`, items: absent.map(opt) });
    return groups;
  });

  isSelected(c: Culture): boolean {
    return this.state.character()?.culture === c.name;
  }

  select(c: Culture): void {
    if (c.name === this.state.character()?.culture) return;
    // Drop the previous culture's picked recommendations so a new culture starts clean.
    this.clearCultureTraits(this.selected());
    this.state.applyCulture(c);
  }

  /** Removes the non-mandatory traits that were offered by the (previous) culture's recommendations. */
  private clearCultureTraits(prev: Culture | undefined): void {
    if (!prev) return;
    const advBases = this.refBases([...prev.typicalAdvantages, ...prev.atypicalAdvantages]);
    const disBases = this.refBases([...prev.typicalDisadvantages, ...prev.atypicalDisadvantages]);
    if (advBases.size) this.state.updateAdvantages((list) => list.filter((a) => a.mandatory || !advBases.has(getAdvantageBaseName(a.name))));
    if (disBases.size) this.state.updateDisadvantages((list) => list.filter((a) => a.mandatory || !disBases.has(getAdvantageBaseName(a.name))));
  }

  private refBases(refs: CultureAdvantageRef[]): Set<string> {
    return new Set(refs.map((ref) => (typeof ref === 'string' ? ref : ref.name)));
  }

  get socialStatus(): string {
    return this.state.character()?.bio.socialStatus ?? '';
  }
  set socialStatus(value: string) {
    this.state.updateBio({ socialStatus: value });
  }

  // ── Culture package toggle ──────────────────────────────────────────────────────
  get useCulturePackage(): boolean {
    return this.state.character()?.useCulturePackage ?? true;
  }
  set useCulturePackage(value: boolean) {
    this.state.setUseCulturePackage(value);
  }

  // ── Mother tongue (free, level 3) ───────────────────────────────────────────────
  readonly languageOptions = LANG_OPTIONS;
  get motherTongue(): string | null {
    return this.state.character()?.languages.find((l) => l.mother)?.name ?? null;
  }
  set motherTongue(name: string | null) {
    this.state.setMotherTongue(name);
  }

  // ── Ortskenntnis (single free home region; further ones are bought in the SF tab) ──
  // Falls back to '' — never to the "Heimatort" hint. Substituting the hint here made the getter
  // disagree with the empty input, so deleting the last character wrote the hint straight back in.
  get ortskenntnisTown(): string {
    return this.state.picks().specialAbilities.general.find((s) => s.name === 'ortskenntnis' && s.granted)?.param ?? '';
  }
  set ortskenntnisTown(town: string) {
    this.state.setOrtskenntnisTowns([town]);
  }

  // ── Plain recommendation checkboxes ────────────────────────────────────────────
  isRecoSelected(r: Recommendation): boolean {
    if (!r.resolved) return false;
    return this.listOf(r.isDisadvantage).some((a) => a.name === r.resolved!.name);
  }

  toggleReco(r: Recommendation): void {
    const adv = r.resolved;
    if (!adv) return;
    const update = (list: Advantage[]) => (list.some((a) => a.name === adv.name) ? list.filter((a) => a.name !== adv.name) : [...list, adv]);
    if (r.isDisadvantage) this.state.updateDisadvantages(update);
    else this.state.updateAdvantages(update);
  }

  // ── Leveled recommendation: a checkbox that, when on, carries a level ───────────
  setRecoLevel(r: Recommendation, lvl: number | null): void {
    if (!r.resolved) return;
    const name = r.resolved.name;
    this.mutate(r.isDisadvantage, (list) => list.map((a) => (a.name === name ? { ...a, lvl: lvl ?? 1 } : a)));
  }

  recoLevel(r: Recommendation): number {
    if (!r.resolved) return 1;
    return this.listOf(r.isDisadvantage).find((a) => a.name === r.resolved!.name)?.lvl ?? r.resolved.lvl ?? 1;
  }

  /** Cost for a plain/leveled recommendation: the live instance (level applied) if selected, else the base. */
  recoCostLabel(r: Recommendation): string {
    if (!r.resolved) return '';
    const live = this.listOf(r.isDisadvantage).find((a) => a.name === r.resolved!.name);
    return this.rowCostLabel(live ?? r.resolved);
  }

  // ── Selection recommendations (pick a specific option, multiple up to maxCount) ──
  /** Chosen instances of a selection base in the live character list. */
  instancesFor(r: Recommendation): Advantage[] {
    if (!r.resolved) return [];
    const base = r.resolved.name;
    return this.listOf(r.isDisadvantage).filter((a) => getAdvantageBaseName(a.name) === base);
  }

  currentOption(adv: Advantage): string | null {
    return getAdvantageQualifier(adv.name) ?? null;
  }

  /** Sub-option list for a selection row, with per-option cost and build-up gating. */
  subOptions(r: Recommendation, adv: Advantage): SubOption[] {
    const max = adv.selection?.maxCount ?? 1;
    const base = getAdvantageBaseName(adv.name);
    const chosen = new Set(
      this.instancesFor(r)
        .map((a) => getAdvantageQualifier(a.name))
        .filter((q): q is string => q != null)
    );
    return selectionOptionsFor(adv).map((o) => {
      const unmet = max > 1 && (o.requires?.some((req) => !chosen.has(req)) ?? false);
      return { label: o.label, value: o.name, costLabel: `${optionCost(adv, o)} AP`, disabled: unmet };
    });
  }

  /** Cost per instance: resolved cost, or the option range while unset. */
  rowCostLabel(adv: Advantage): string {
    if (adv.selection && this.currentOption(adv) == null) {
      const { min, max } = selectionCostRange(adv);
      return min === max ? `${min} AP` : `${min}–${max} AP`;
    }
    return `${advantageCost(adv)} AP`;
  }

  /** True while another instance of this selection base may still be added. */
  canAddMore(r: Recommendation): boolean {
    if (!r.resolved?.selection) return false;
    const insts = this.instancesFor(r);
    const max = r.resolved.selection.maxCount ?? 1;
    return insts.length < max && !insts.some((a) => this.currentOption(a) == null);
  }

  addInstance(r: Recommendation): void {
    if (!r.resolved) return;
    const base = r.resolved.name;
    const catalog = r.isDisadvantage ? DISADVANTAGE : ADVANTAGE;
    this.mutate(r.isDisadvantage, (list) => appendAdvantageInstance(base, catalog, list));
  }

  setOption(r: Recommendation, currentName: string, optionName: string | null): void {
    const catalog = r.isDisadvantage ? DISADVANTAGE : ADVANTAGE;
    this.mutate(r.isDisadvantage, (list) => applyAdvantageOption(currentName, optionName, catalog, list));
  }

  setInstanceLevel(r: Recommendation, name: string, lvl: number | null): void {
    this.mutate(r.isDisadvantage, (list) => list.map((a) => (a.name === name ? { ...a, lvl: lvl ?? 1 } : a)));
  }

  removeInstance(r: Recommendation, name: string): void {
    this.mutate(r.isDisadvantage, (list) => list.filter((a) => a.name !== name));
  }

  isLeveled(adv: Advantage): boolean {
    return adv.maxLvl != null && adv.maxLvl > 1;
  }

  // ── Internals ──────────────────────────────────────────────────────────────────
  private listOf(isDisadvantage: boolean): Advantage[] {
    return isDisadvantage ? this.disadvantages() : this.advantages();
  }

  private mutate(isDisadvantage: boolean, updater: (list: Advantage[]) => Advantage[]): void {
    if (isDisadvantage) this.state.updateDisadvantages(updater);
    else this.state.updateAdvantages(updater);
  }

  /** Resolves culture refs to display text + a togglable catalog instance (when not category-only). */
  private recommend(refs: CultureAdvantageRef[] | undefined, isDisadvantage: boolean): Recommendation[] {
    const catalog = isDisadvantage ? DISADVANTAGE : ADVANTAGE;
    return (refs ?? []).map((ref) => {
      const name = typeof ref === 'string' ? ref : ref.option ? `${ref.name}_${ref.option}` : ref.name;
      const resolved = resolveAdvantageByName(name, catalog);
      const label = (typeof ref === 'object' && ref.label) || resolved?.label || name;
      return { label, resolved, isDisadvantage, kind: this.classify(resolved) };
    });
  }

  /** A selection ref with no pinned option lets the player pick; a leveled one gets a level picker. */
  private classify(resolved: Advantage | null): RecoKind {
    if (!resolved) return 'plain';
    if (resolved.selection && getAdvantageQualifier(resolved.name) == null) return 'selection';
    if (this.isLeveled(resolved)) return 'leveled';
    return 'plain';
  }
}
