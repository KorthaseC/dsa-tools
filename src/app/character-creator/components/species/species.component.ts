import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabsModule } from 'primeng/tabs';
import { ADVANTAGE, DISADVANTAGE } from '../../constants/advantage.const';
import { ALL_SPECIES } from '../../constants/species.const';
import { Advantage } from '../../models/advantage.model';
import { Attribute, MaxAttributeChange } from '../../models/base-creation.model';
import { Species, SpeciesType } from '../../models/species.model';
import { CharacterStateService } from '../../services/character-state.service';
import { resolveAdvantageByName } from '../../utils/utils';

@Component({
    selector: 'app-species',
    imports: [
        FormsModule,
        
        CardModule,
        DividerModule,
        TabsModule,
        CheckboxModule,
        RadioButtonModule,
        PanelModule,
        CommonModule
    ],
    templateUrl: './species.component.html',
    styleUrl: './species.component.scss'
})
export class SpeciesComponent {
  private state = inject(CharacterStateService);
  
  readonly speciesList = ALL_SPECIES;
  readonly selectedSpecies = signal<Species | null>(this.state.selectedSpecies());

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

  selectedAdvantages: Advantage[] = this.state.character()?.advantages ?? [];
  selectedDisadvantages: Advantage[] = this.state.character()?.disadvantages ?? [];

  autoAdvDeselectable = this.state.autoAdvDeselectable;
  recommendedAdvDeselectable = this.state.recommendedAdvDeselectable;

  get autoAdvDeselectableModel() {
    return this.autoAdvDeselectable();
  }
  set autoAdvDeselectableModel(value: boolean) {
    this.autoAdvDeselectable.set(value);
  }

  get recommendedAdvDeselectableModel() {
    return this.recommendedAdvDeselectable();
  }
  set recommendedAdvDeselectableModel(value: boolean) {
    this.recommendedAdvDeselectable.set(value);
  }

  //-------Attributes------------
  selectedMaxAttributeChanges: MaxAttributeChange = this.state.character()?.maxAttributeChanges.find(maxAttMod => maxAttMod.type === 'choice');

  selectSpecies(type: SpeciesType) {
    const species = this.speciesList.find(s => s.type === type);
    if (!species) return;

    this.selectedSpecies.set(species);
    this.state.selectedSpecies.set(species);

    this.selectedAdvantages = [...this.autoAdvantages(), ...this.recommendedAdvantages()];
    this.selectedDisadvantages = [...this.autoDisadvantages(), ...this.recommendedDisadvantages()];
    const attributeMods: MaxAttributeChange[] = [];
    species.attributeMods.forEach((attMod => {
      if(attMod.type === 'fixed') {
        attributeMods.push({type: attMod.type, attribute: attMod.attribute, modifier: attMod.modifier})
      }
    }))

    this.state.character.update(c => ({...c, species: this.selectedSpecies().type, speciesCost: this.selectedSpecies().apCost, maxAttributeChanges: attributeMods, advantages: this.selectedAdvantages, disadvantages: this.selectedDisadvantages}))
  }

  isSelected(type: SpeciesType): boolean {
    return this.selectedSpecies()?.type === type;
  }

  changeAdvantages(advantage: Advantage) {
    const index = this.selectedAdvantages.findIndex(a => a === advantage);
    if (index > -1) {
      this.selectedAdvantages = this.selectedAdvantages.filter(a => a !== advantage);
    } else {
      this.selectedAdvantages = [...this.selectedAdvantages, advantage];
    }
    this.state.character.update(c => ({...c, advantages: this.selectedAdvantages}))
  }

  changeDisadvantages(disadvantage: Advantage) {
    const index = this.selectedDisadvantages.findIndex(a => a === disadvantage);
    if (index > -1) {
      this.selectedDisadvantages = this.selectedDisadvantages.filter(a => a !== disadvantage);
    } else {
      this.selectedDisadvantages = [...this.selectedDisadvantages, disadvantage];
    }
    this.state.character.update(c => ({...c, disadvantages: this.selectedDisadvantages}))
  }

  onChoiceAttributeChange(): void {
    let attributeMods: MaxAttributeChange[] = [];
    if( this.state.character().maxAttributeChanges.some(attMod => attMod.type === 'fixed')) {
      attributeMods = this.state.character().maxAttributeChanges;
    }
    attributeMods.push(this.selectedMaxAttributeChanges)
    this.state.character.update(c => ({...c, maxAttributeChanges: attributeMods}))
  }

  private toAdvantages(names: string[], catalog: Advantage[], mandatory?: boolean): Advantage[] {
    return names.map(name => resolveAdvantageByName(name, catalog, { mandatory }))
      .filter(Boolean) as Advantage[];
  }

  private toGroupedAdvantages(grouped: { group?: string; advantages: string[] }[], catalog: Advantage[]): { group?: string; advantages: Advantage[] }[] {
    return grouped.map(entry => ({
      group: entry.group,
      advantages: entry.advantages
        .map(name => resolveAdvantageByName(name, catalog))
        .filter(Boolean) as Advantage[],
    }));
  }
}
