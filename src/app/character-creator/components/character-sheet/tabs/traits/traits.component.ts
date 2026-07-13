import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ActionSelectDirective } from '../../../../directives/action-select.directive';
import { RuleLinkComponent } from '../../../rule-link/rule-link.component';
import { ADVANTAGE, DISADVANTAGE } from '../../../../constants/advantage.const';
import { Advantage } from '../../../../models/advantage.model';
import { HomebrewEntry } from '../../../../models/homebrew.model';
import { CharacterStateService } from '../../../../services/character-state.service';
import {
  advantageCost,
  appendAdvantageInstance,
  applyAdvantageOptionAt,
  getAdvantageBaseName,
  getAdvantageQualifier,
  optionCost,
  selectionCostRange,
  selectionOptionsFor,
} from '../../../../utils/utils';

/** A pickable sub-option rendered in a row's category select. */
interface SubOption {
  label: string;
  value: string;
  costLabel: string;
  disabled: boolean;
}

/** An entry in an "add" dropdown, carrying a formatted cost hint. */
interface AddOption {
  label: string;
  value: string;
  cost: string;
}

@Component({
  selector: 'app-cs-traits',
  imports: [FormsModule, ButtonModule, CheckboxModule, InputNumber, SelectModule, TooltipModule, ActionSelectDirective, RuleLinkComponent],
  templateUrl: './traits.component.html',
  styleUrl: './traits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraitsComponent {
  private state = inject(CharacterStateService);

  readonly addAdvModel = signal<string | null>(null);
  readonly addDisModel = signal<string | null>(null);

  readonly advantages = computed<Advantage[]>(() => this.state.picks().advantages);
  readonly disadvantages = computed<Advantage[]>(() => this.state.picks().disadvantages);

  // Homebrew advantages/disadvantages are authored in the Homebrew tab but count toward the SAME 80-AP
  // maximum, so they are mirrored here (read-only, badged) and folded into the section totals.
  readonly homebrewAdvantages = computed<HomebrewEntry[]>(() => (this.state.character()?.homebrew ?? []).filter((e) => e.kind === 'advantage'));
  readonly homebrewDisadvantages = computed<HomebrewEntry[]>(() => (this.state.character()?.homebrew ?? []).filter((e) => e.kind === 'disadvantage'));
  hbCost(e: HomebrewEntry): number {
    return e.cost * (e.level ?? 1);
  }

  readonly advantageOptions = computed(() => this.options(ADVANTAGE, this.advantages()));
  readonly disadvantageOptions = computed(() => this.options(DISADVANTAGE, this.disadvantages()));

  readonly totalAdvCost = computed(
    () => this.advantages().reduce((s, a) => s + (a.mandatory ? 0 : advantageCost(a)), 0) + this.homebrewAdvantages().reduce((s, e) => s + this.hbCost(e), 0)
  );
  readonly totalDisCost = computed(
    () => this.disadvantages().reduce((s, a) => s + (a.mandatory ? 0 : advantageCost(a)), 0) + this.homebrewDisadvantages().reduce((s, e) => s + this.hbCost(e), 0)
  );

  /** DSA5 80-AP disadvantage cap: on → only 80 AP are credited; off → the full disadvantage value counts. */
  readonly capDisadvantageAp = computed(() => this.state.character()?.capDisadvantageAp ?? true);
  setCapDisadvantageAp(cap: boolean): void {
    this.state.setCapDisadvantageAp(cap);
  }

  readonly cost = advantageCost;

  /** GM cost-adjustment flag (shared with the SF tab). While on, per-row cost becomes an input. */
  readonly costOverrideUnlocked = this.state.costOverrideUnlocked;
  toggleCostEdit(): void {
    this.state.costOverrideUnlocked.set(!this.state.costOverrideUnlocked());
  }

  // ─── Row helpers ───────────────────────────────────────────────────────────────

  isLeveled(adv: Advantage): boolean {
    return adv.maxLvl != null && adv.maxLvl > 1;
  }

  isSelection(adv: Advantage): boolean {
    return adv.selection != null;
  }

  /** The currently chosen sub-option name, or null while still unset. */
  currentOption(adv: Advantage): string | null {
    return getAdvantageQualifier(adv.name) ?? null;
  }

  isUnset(adv: Advantage): boolean {
    return this.isSelection(adv) && this.currentOption(adv) == null;
  }

  /** Sub-option list for a selection row, with per-option cost and build-up gating. */
  subOptions(adv: Advantage, list: Advantage[]): SubOption[] {
    const max = adv.selection?.maxCount ?? 1;
    const chosen = this.chosenOptionNames(adv, list);
    const own = this.currentOption(adv);
    return selectionOptionsFor(adv).map((o) => {
      // Build-up chains only make sense when several picks are allowed (maxCount > 1).
      const unmet = max > 1 && (o.requires?.some((r) => !chosen.has(r)) ?? false);
      // An option already chosen by ANOTHER instance of the same base can't be picked again.
      const takenBySibling = max > 1 && o.name !== own && chosen.has(o.name);
      return {
        label: o.label,
        value: o.name,
        costLabel: `${optionCost(adv, o)} AP`,
        disabled: unmet || takenBySibling,
      };
    });
  }

  /** Cost shown per row: the resolved instance cost, or the option range while unset. */
  rowCostLabel(adv: Advantage): string {
    if (this.isUnset(adv)) {
      const { min, max } = selectionCostRange(adv);
      return min === max ? `${min} AP` : `${min}–${max} AP`;
    }
    return `${advantageCost(adv)} AP`;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  addAdvantage(name: string | null): void {
    if (name) this.state.updateAdvantages((list) => appendAdvantageInstance(name, ADVANTAGE, list));
    this.addAdvModel.set(null);
  }

  addDisadvantage(name: string | null): void {
    if (name) this.state.updateDisadvantages((list) => appendAdvantageInstance(name, DISADVANTAGE, list));
    this.addDisModel.set(null);
  }

  // Row write-ops are keyed by INDEX (not name), so several unset instances of the same base — e.g. two
  // Schlechte Eigenschaften — stay unambiguous. Index matches advantages()/disadvantages() order 1:1.
  removeAdvantageAt(index: number): void {
    this.state.updateAdvantages((list) => list.filter((_, i) => i !== index));
  }

  removeDisadvantageAt(index: number): void {
    this.state.updateDisadvantages((list) => list.filter((_, i) => i !== index));
  }

  setAdvantageLevelAt(index: number, lvl: number | null): void {
    this.state.updateAdvantages((list) => list.map((a, i) => (i === index ? { ...a, lvl: lvl ?? 1 } : a)));
  }

  setDisadvantageLevelAt(index: number, lvl: number | null): void {
    this.state.updateDisadvantages((list) => list.map((a, i) => (i === index ? { ...a, lvl: lvl ?? 1 } : a)));
  }

  setAdvantageOptionAt(index: number, optionName: string | null): void {
    this.state.updateAdvantages((list) => applyAdvantageOptionAt(index, optionName, ADVANTAGE, list));
  }

  setDisadvantageOptionAt(index: number, optionName: string | null): void {
    this.state.updateDisadvantages((list) => applyAdvantageOptionAt(index, optionName, DISADVANTAGE, list));
  }

  /** GM cost override (total AP). `null`/empty clears it → back to the catalog cost. */
  setAdvantageCostOverrideAt(index: number, value: number | null): void {
    this.state.updateAdvantages((list) => list.map((a, i) => (i === index ? { ...a, costOverride: value ?? undefined } : a)));
  }

  setDisadvantageCostOverrideAt(index: number, value: number | null): void {
    this.state.updateDisadvantages((list) => list.map((a, i) => (i === index ? { ...a, costOverride: value ?? undefined } : a)));
  }

  // ─── Internals ─────────────────────────────────────────────────────────────────

  /** Selected option names for the same selection base (used for build-up gating). */
  private chosenOptionNames(adv: Advantage, list: Advantage[]): Set<string> {
    const base = getAdvantageBaseName(adv.name);
    return new Set(
      list
        .filter((a) => getAdvantageBaseName(a.name) === base)
        .map((a) => getAdvantageQualifier(a.name))
        .filter((q): q is string => q != null)
    );
  }

  /** Add-dropdown entries: hides taken/maxed bases, annotates each with a cost hint. */
  private options(catalog: Advantage[], selected: Advantage[]): AddOption[] {
    return catalog
      .filter((a) => {
        if (!a.selection) return !selected.some((s) => s.name === a.name);
        const insts = selected.filter((s) => getAdvantageBaseName(s.name) === a.name);
        const max = a.selection.maxCount ?? 1;
        return insts.length < max; // offer up to maxCount; several unset instances may coexist
      })
      .map((a) => ({ label: a.label, value: a.name, cost: this.costLabel(a) }))
      .sort((x, y) => x.label.localeCompare(y.label, 'de'));
  }

  /** Cost hint for the add-dropdown: option range, per-level, or flat. */
  private costLabel(a: Advantage): string {
    if (a.selection && selectionOptionsFor(a).length) {
      const { min, max } = selectionCostRange(a);
      return min === max ? `${min} AP` : `${min}–${max} AP`;
    }
    if (this.isLeveled(a)) return `${a.cost} AP/Stufe`;
    return `${a.cost} AP`;
  }
}
