import { Advantage } from '../models/advantage.model';

export const ADVANTAGE: Advantage[] = [
  {
    name: 'altersresistenz',
    label: 'Altersresistenz',
    cost: 5,
    prerequisite: [{ name: 'schnelleAlterung', required: false }],
    rulebook: { short: 'KHE 391', long: 'Kodex der Helden 391' },
    url: 'vorteil.html?vorteil=Altersresistenz+%28%2A%29',
  },
  { name: 'begabung_singen', label: 'Begabung (Singen)', cost: 6, prerequisite: [{ name: 'unfahig_singen', required: false }] },
  { name: 'dunkelsicht', label: 'Dunkelsicht', cost: 10, lvl: 1, prerequisite: [{ name: 'nachtblind', required: false }] },
  {
    name: 'entfernungssinn',
    label: 'Entfernungssinn',
    cost: 10,
    prerequisite: [
      { name: 'blind', required: false },
      { name: 'eingeschrankterSinnSicht', required: false },
      { name: 'farbenblind', required: false },
      { name: 'verstummelt_einaugig', required: false },
    ],
  },
  { name: 'nichtschlafer', label: 'Nichtschläfer', cost: 8, prerequisite: [] },
  { name: 'zauberer', label: 'Zauberer', cost: 25, prerequisite: [] },
  { name: 'zweistimmigerGesang', label: 'Zweistimmiger Gesang', cost: 5, prerequisite: [] },
];

export const DISADVANTAGE: Advantage[] = [
  { name: 'sensiblerGeruchssinn', label: 'Sensibler Geruchssinn,', cost: -10, prerequisite: [{ name: 'eingeschrankterSinnGeruch', required: false }] },
  { name: 'unfahig_zechen', label: 'Unfähig (Zechen)', cost: -1, prerequisite: [{ name: 'begabung_zechen', required: false }] },
];
