import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabsModule } from 'primeng/tabs';
import { ADVANTAGE } from '../../constants/advantage.const';
import { ALL_SPECIES } from '../../constants/species.const';
import { Advantage } from '../../models/advantage.model';
import { Attribute, MaxAttributeChange } from '../../models/base-creation.model';
import { Species, SpeciesType } from '../../models/species.model';
import { CharacterStateService } from '../../services/character-state.service';

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
    this.toAdvantages(this.selectedSpecies()?.autoAdvantages ?? [], true)
  );
  readonly recommendedAdvantages = computed(() =>
    this.toAdvantages(this.selectedSpecies()?.recommendedAdvantages ?? [])
  );
  readonly typicalAdvantages = computed(() =>
    this.toGroupedAdvantages(this.selectedSpecies()?.typicalAdvantages ?? [])
  );

  selectedAdvantages: Advantage[] = this.state.character()?.advantages ?? [];

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
    const attributeMods: MaxAttributeChange[] = [];
    species.attributeMods.forEach((attMod => {
      if(attMod.type === 'fixed') {
        attributeMods.push({type: attMod.type, attribute: attMod.attribute, modifier: attMod.modifier})
      }
    }))

    this.state.character.update(c => ({...c, species: this.selectedSpecies().type, speciesCost: this.selectedSpecies().apCost, maxAttributeChanges: attributeMods, advantages: this.selectedAdvantages}))
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

  onChoiceAttributeChange(): void {
    let attributeMods: MaxAttributeChange[] = [];
    if( this.state.character().maxAttributeChanges.some(attMod => attMod.type === 'fixed')) {
      attributeMods = this.state.character().maxAttributeChanges;
    }
    console.log(this.selectedMaxAttributeChanges)
    attributeMods.push(this.selectedMaxAttributeChanges)
    this.state.character.update(c => ({...c, maxAttributeChanges: attributeMods}))
  }

  private toAdvantages(names: string[], mandatory?: boolean): Advantage[] {
    return names.map(name => {
        const base = ADVANTAGE.find(a => a.name === name);
        return base ? { ...base, mandatory } : null;
      })
  }

  private toGroupedAdvantages(grouped: { group?: string; advantages: string[] }[]): { group?: string; advantages: Advantage[] }[] {
    return grouped.map(entry => ({
      group: entry.group,
      advantages: entry.advantages
        .map(name => ADVANTAGE.find(a => a.name === name))
        .filter(Boolean) as Advantage[],
    }));
  }
}
