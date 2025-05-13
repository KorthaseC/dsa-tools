import { Species, SpeciesType } from "../models/species.model";

export const ALL_SPECIES: Species[] = [
  {
    type: SpeciesType.Human,
    displayName: 'Mensch',
    image: 'spezies_mensch',
    apCost: 0,
    baseStats: { le: 5, sk: -4, zk: -5, gs: 8 },
    attributeMods: [
      { type: 'choice', selectionOptions: ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'], modifier: 1 }
    ],
    autoAdvantages: [],
    autoDisadvantages: [],
    recommendedAdvantages: [],
    recommendedDisadvantages: [],
    typicalAdvantages: [{ group:'Nivesen', advantages: ['entfernungssinn'] }],
    typicalDisadvantages: [{ advantages: [] }],
  },
  {
    type: SpeciesType.Elf,
    displayName: 'Elf',
    image: 'spezies_elf',
    apCost: 18,
    baseStats: { le: 2, sk: -4, zk: -6, gs: 8 },
    attributeMods: [
      { type: 'fixed', attribute: 'IN', modifier: 1 },
      { type: 'fixed', attribute: 'GE', modifier: 1 },
      { type: 'choice', selectionOptions: ['KO', 'KK'], modifier: -2 } 
    ],
    autoAdvantages: ['zauberer', 'zweistimmigerGesang'],
    autoDisadvantages: [],
    recommendedAdvantages: ['altersresistenz', 'dunkelsicht', 'nichtschlafer'],
    recommendedDisadvantages: [],
    typicalAdvantages: [{ advantages: ['begabung_singen'] }],
    typicalDisadvantages: [{ advantages: [] }],
  }
];
