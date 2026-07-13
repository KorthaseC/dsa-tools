import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { ADVANTAGE, DISADVANTAGE } from '../../constants/advantage.const';
import { ALL_SPECIES } from '../../constants/species.const';
import { Advantage } from '../../models/advantage.model';
import { Attribute, MaxAttributeChange } from '../../models/base-creation.model';
import { GroupedAdvantages, Species, SpeciesAdvantageRef, SpeciesType } from '../../models/species.model';
import { CharacterStateService } from '../../services/character-state.service';
import { resolveAdvantageByName } from '../../utils/utils';

@Component({
    selector: 'app-species',
    imports: [
        FormsModule,
        ButtonModule,
        CardModule,
        DividerModule,
        TabsModule,
        CheckboxModule,
        RadioButtonModule,
        SelectModule,
        TooltipModule,
        CommonModule
    ],
    templateUrl: './species.component.html',
    styleUrl: './species.component.scss'
})
export class SpeciesComponent {
  private state = inject(CharacterStateService);
  
  readonly speciesList = ALL_SPECIES;
  readonly selectedSpecies = signal<Species | null>(this.state.selectedSpecies());

  /** Toggles the step between the card grid and the selected-species detail (tabs). */
  readonly viewMode = signal<'cards' | 'detail'>(this.state.selectedSpecies() ? 'detail' : 'cards');

  //public selectedFreeChoiceAttribute = signal<Attribute | null>(null);
  public selectedAdditionalFreeChoiceAttribute = signal<Attribute | null>(null);

  //-------Advantages------------
  readonly autoAdvantages = computed(() =>
    this.toAdvantages(this.selectedSpecies()?.autoAdvantages ?? [], ADVANTAGE, true)
  );
  readonly recommendedAdvantages = computed(() =>
    this.toAdvantages(this.selectedSpecies()?.recommendedAdvantages ?? [], ADVANTAGE)
  );
  readonly typicalAdvantages = computed(() =>
    this.toGroupedAdvantages(this.selectedSpecies()?.typicalAdvantages ?? [], ADVANTAGE)
  );
  readonly atypicalAdvantages = computed(() =>
    this.toAdvantages(this.selectedSpecies()?.atypicalAdvantages ?? [], ADVANTAGE)
  );

  //-------Disadvantages------------
  readonly autoDisadvantages = computed(() =>
    this.toAdvantages(this.selectedSpecies()?.autoDisadvantages ?? [], DISADVANTAGE, true)
  );
  readonly recommendedDisadvantages = computed(() =>
    this.toAdvantages(this.selectedSpecies()?.recommendedDisadvantages ?? [], DISADVANTAGE)
  );
  readonly typicalDisadvantages = computed(() =>
    this.toGroupedAdvantages(this.selectedSpecies()?.typicalDisadvantages ?? [], DISADVANTAGE)
  );
  readonly atypicalDisadvantages = computed(() =>
    this.toAdvantages(this.selectedSpecies()?.atypicalDisadvantages ?? [], DISADVANTAGE)
  );

  // Selected picks read from the canonical `entries` (via state.picks) — the character model has no
  // advantages/disadvantages fields. The *Names getters back the checkbox membership (by slug, not object
  // identity); the Advantage[] getters back the level logic.
  get selectedAdvantages(): Advantage[] {
    return this.state.picks().advantages;
  }
  get selectedDisadvantages(): Advantage[] {
    return this.state.picks().disadvantages;
  }
  // computed (not getters): a stable array reference per picks value — a getter would allocate a new
  // array every change-detection pass and, bound to [ngModel], spin CD into an infinite loop (freeze).
  readonly selectedAdvantageNames = computed(() => this.state.picks().advantages.map((a) => a.name));
  readonly selectedDisadvantageNames = computed(() => this.state.picks().disadvantages.map((a) => a.name));

  autoAdvDeselectable = this.state.autoAdvDeselectable;
  recommendedAdvDeselectable = this.state.recommendedAdvDeselectable;

  toggleAutoAdvDeselectable(): void {
    this.autoAdvDeselectable.set(!this.autoAdvDeselectable());
  }

  toggleRecommendedAdvDeselectable(): void {
    this.recommendedAdvDeselectable.set(!this.recommendedAdvDeselectable());
  }

  atypicalAdvUnlocked = this.state.atypicalAdvUnlocked;
  atypicalDisadvUnlocked = this.state.atypicalDisadvUnlocked;

  toggleAtypicalAdvUnlocked(): void {
    this.atypicalAdvUnlocked.set(!this.atypicalAdvUnlocked());
  }

  toggleAtypicalDisadvUnlocked(): void {
    this.atypicalDisadvUnlocked.set(!this.atypicalDisadvUnlocked());
  }

  // Reactive against the character signal (updated by changeAdvantages/changeDisadvantages) so the
  // GM-approval warning toggles live as atypical entries are checked/unchecked.
  readonly hasSelectedAtypicalAdvantage = computed(() => {
    const names = new Set(this.atypicalAdvantages().map((a) => a.name));
    return this.state.picks().advantages.some((a) => names.has(a.name));
  });

  readonly hasSelectedAtypicalDisadvantage = computed(() => {
    const names = new Set(this.atypicalDisadvantages().map((a) => a.name));
    return this.state.picks().disadvantages.some((a) => names.has(a.name));
  });

  //-------Attributes------------
  // Bind the radio to the chosen attribute (a stable string) instead of a freshly-built object each
  // render — otherwise returning to this step loses the visual selection (reference mismatch).
  selectedChoiceAttribute?: Attribute = this.state.character()?.maxAttributeChanges.find((m) => m.type === 'choice')?.attribute;

  selectSpecies(type: SpeciesType) {
    const species = this.speciesList.find(s => s.type === type);
    if (!species) return;

    this.selectedSpecies.set(species);
    this.state.selectedSpecies.set(species);
    this.viewMode.set('detail');

    // Reset all selections so switching species starts clean (re-gates the Eigenschaft choice).
    this.selectedChoiceAttribute = undefined;
    this.chosenLevel = {};

    // Species + cost + the fixed attribute modifications (the choice mod is added via the radio).
    const attributeMods: MaxAttributeChange[] = [];
    species.attributeMods.forEach((attMod) => {
      if (attMod.type === 'fixed') attributeMods.push({ type: attMod.type, attribute: attMod.attribute, modifier: attMod.modifier });
    });
    this.state.patchCharacter({ species: species.type, speciesCost: species.apCost, maxAttributeChanges: attributeMods });

    // Seed the canonical `entries` with the species' auto + recommended picks (freeness stays derived).
    this.writeAdvantages([...this.autoAdvantages(), ...this.recommendedAdvantages()]);
    this.writeDisadvantages([...this.autoDisadvantages(), ...this.recommendedDisadvantages()]);
  }

  /** Persist advantages/disadvantages to the canonical `entries`. The species model's freeness
   *  (`mandatory`) is stripped so it is never baked in — it is re-derived per current species. */
  private writeAdvantages(list: Advantage[]): void {
    this.state.updateAdvantages(() => list.map((a) => this.plain(a)));
  }
  private writeDisadvantages(list: Advantage[]): void {
    this.state.updateDisadvantages(() => list.map((a) => this.plain(a)));
  }
  private plain(a: Advantage): Advantage {
    const { mandatory, ...rest } = a;
    return rest as Advantage;
  }

  isSelected(type: SpeciesType): boolean {
    return this.selectedSpecies()?.type === type;
  }

  /** Return to the card grid to pick a different species (keeps the current selection). */
  backToCards(): void {
    this.viewMode.set('cards');
  }

  changeAdvantages(advantage: Advantage) {
    const has = this.selectedAdvantages.some((a) => a.name === advantage.name);
    const next = has ? this.selectedAdvantages.filter((a) => a.name !== advantage.name) : [...this.selectedAdvantages, advantage];
    this.writeAdvantages(next);
  }

  changeDisadvantages(disadvantage: Advantage) {
    const has = this.selectedDisadvantages.some((a) => a.name === disadvantage.name);
    const next = has ? this.selectedDisadvantages.filter((a) => a.name !== disadvantage.name) : [...this.selectedDisadvantages, disadvantage];
    this.writeDisadvantages(next);
  }

  // ── Typical leveled advantages (level picker) ──────────────────────────────
  // PDF: recommended/auto entries are always level I (the catalog default); typical
  // lists offer a leveled advantage up to its catalog maxLvl. The typical picker
  // must start ABOVE whatever level recommended/auto already pin for the same
  // advantage (e.g. recommended Dunkelsicht I → typical offers only II), and it
  // upgrades the single shared selection instead of adding a duplicate.
  private readonly levelLabels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  chosenLevel: Record<string, number> = {};

  isLeveled(advantage: Advantage): boolean {
    return (advantage.maxLvl ?? 1) > 1;
  }

  private romanOf(n: number): string {
    return this.levelLabels[n - 1] ?? String(n);
  }

  /** Strip a trailing roman range ("I-II") from a catalog label → base name. */
  private baseName(label: string): string {
    return label.replace(/\s+[IVX]+\s*[-–]\s*[IVX]+\s*$/, '').trim();
  }

  /** Auto/recommended entry label: base + the pinned roman level for leveled advantages. */
  fixedLabel(advantage: Advantage): string {
    return this.isLeveled(advantage) ? `${this.baseName(advantage.label)} ${this.romanOf(advantage.lvl ?? 1)}` : advantage.label;
  }

  /** Base label (roman range stripped) for typical leveled entries. */
  baseLabel(advantage: Advantage): string {
    return this.isLeveled(advantage) ? this.baseName(advantage.label) : advantage.label;
  }

  /** A typical leveled entry with exactly one selectable level → render as text, no picker. */
  typicalHasSingleLevel(advantage: Advantage, isDisadvantage = false): boolean {
    return this.typicalLevelOptions(advantage, isDisadvantage).length === 1;
  }

  /** Label for a single-level typical entry: "Base <roman>" (e.g. "Dunkelsicht II"). */
  typicalSingleLabel(advantage: Advantage, isDisadvantage = false): string {
    const opt = this.typicalLevelOptions(advantage, isDisadvantage)[0];
    return opt ? `${this.baseLabel(advantage)} ${opt.label}` : this.baseLabel(advantage);
  }

  /** Level pinned by an auto/recommended entry of this advantage — but only while it is
   *  still selected. If the user removed it (homebrew), the base drops to 0 so the typical
   *  picker re-offers the lower levels. */
  baseLevelFor(name: string, isDisadvantage = false): number {
    const pool = isDisadvantage
      ? [...this.autoDisadvantages(), ...this.recommendedDisadvantages()]
      : [...this.autoAdvantages(), ...this.recommendedAdvantages()];
    const ref = pool.find((a) => a.name === name);
    if (!ref) return 0;
    const stillSelected = (isDisadvantage ? this.selectedDisadvantages : this.selectedAdvantages).some((a) => a.name === name);
    return stillSelected ? ref.lvl ?? 1 : 0;
  }

  /** Levels selectable in the typical picker: above the recommended/auto base, up to the
   *  species-specific cap (the resolved ref's `lvl`), bounded by the catalog `maxLvl`. */
  typicalLevelOptions(advantage: Advantage, isDisadvantage = false): { label: string; value: number }[] {
    const min = this.baseLevelFor(advantage.name, isDisadvantage) + 1;
    const cap = advantage.lvl ?? advantage.maxLvl ?? 1;
    const max = Math.min(cap, advantage.maxLvl ?? cap);
    const out: { label: string; value: number }[] = [];
    for (let lvl = min; lvl <= max; lvl++) out.push({ label: this.romanOf(lvl), value: lvl });
    return out;
  }

  getTypicalLevel(advantage: Advantage, isDisadvantage = false): number {
    return this.chosenLevel[advantage.name] ?? this.baseLevelFor(advantage.name, isDisadvantage) + 1;
  }

  /** A typical leveled advantage is "active" only when selected above its recommended/auto base. */
  isTypicalActive(name: string, isDisadvantage = false): boolean {
    const list = isDisadvantage ? this.selectedDisadvantages : this.selectedAdvantages;
    const entry = list.find((a) => a.name === name);
    return !!entry && (entry.lvl ?? 1) > this.baseLevelFor(name, isDisadvantage);
  }

  /** Toggle the typical upgrade: raise the shared entry to the chosen level, or revert to base. */
  toggleTypical(advantage: Advantage, isDisadvantage = false): void {
    const name = advantage.name;
    const base = this.baseLevelFor(name, isDisadvantage);
    const list = isDisadvantage ? this.selectedDisadvantages : this.selectedAdvantages;
    const idx = list.findIndex((a) => a.name === name);
    let next: Advantage[];
    if (this.isTypicalActive(name, isDisadvantage)) {
      // Revert: drop to the recommended/auto base level, or remove entirely if it was typical-only.
      next = base > 0 ? list.map((a) => (a.name === name ? { ...a, lvl: base } : a)) : list.filter((a) => a.name !== name);
    } else {
      const lvl = this.getTypicalLevel(advantage, isDisadvantage);
      next = idx > -1 ? list.map((a) => (a.name === name ? { ...a, lvl } : a)) : [...list, { ...advantage, lvl }];
    }
    if (isDisadvantage) this.writeDisadvantages(next);
    else this.writeAdvantages(next);
  }

  /** Change the chosen typical level; if the entry is currently upgraded, re-apply it. */
  setTypicalLevel(advantage: Advantage, lvl: number, isDisadvantage = false): void {
    this.chosenLevel[advantage.name] = lvl;
    if (!this.isTypicalActive(advantage.name, isDisadvantage)) return;
    const list = isDisadvantage ? this.selectedDisadvantages : this.selectedAdvantages;
    const next = list.map((a) => (a.name === advantage.name ? { ...a, lvl } : a));
    if (isDisadvantage) this.writeDisadvantages(next);
    else this.writeAdvantages(next);
  }

  /** True when the species requires an Eigenschaft choice that hasn't been made yet. */
  needsAttributeChoice(): boolean {
    const species = this.selectedSpecies();
    if (!species) return false;
    return species.attributeMods.some((m) => m.type === 'choice') && !this.selectedChoiceAttribute;
  }

  onChoiceAttributeChange(modifier: number): void {
    // Keep the fixed mods, drop any previous choice, then add the freshly picked one.
    const fixed = this.state.character().maxAttributeChanges.filter((m) => m.type === 'fixed');
    const attributeMods: MaxAttributeChange[] = [
      ...fixed,
      { type: 'choice', attribute: this.selectedChoiceAttribute, modifier },
    ];
    this.state.character.update((c) => ({ ...c, maxAttributeChanges: attributeMods }));
  }

  private resolveRef(ref: SpeciesAdvantageRef, catalog: Advantage[], mandatory?: boolean): Advantage | null {
    if (typeof ref === 'string') return resolveAdvantageByName(ref, catalog, { mandatory });
    // Compose the canonical instance name from the base + sub-option (e.g. herausragenderSinn + gehoer).
    const name = ref.option ? `${ref.name}_${ref.option}` : ref.name;
    return resolveAdvantageByName(name, catalog, { mandatory, lvl: ref.lvl });
  }

  private toAdvantages(refs: SpeciesAdvantageRef[], catalog: Advantage[], mandatory?: boolean): Advantage[] {
    return refs.map((ref) => this.resolveRef(ref, catalog, mandatory)).filter(Boolean) as Advantage[];
  }

  private toGroupedAdvantages(grouped: GroupedAdvantages[], catalog: Advantage[]): { group?: string; advantages: Advantage[] }[] {
    return grouped.map((entry) => ({
      group: entry.group,
      advantages: entry.advantages.map((ref) => this.resolveRef(ref, catalog)).filter(Boolean) as Advantage[],
    }));
  }
}
