import { Attribute } from './base-creation.model';

export enum Reichweite {
  Kurz = 'kurz',
  Mittel = 'mittel',
  Lang = 'lang',
}

export enum Belastungsstufe {
  None = '-',
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
}

export interface MeleeWeaponRow {
  id: string;
  weapon: string;
  combatTechnique: string;
  schadensbonus: number;
  tp: string;
  atMod: number;
  paMod: number;
  reichweite: Reichweite | null;
  bf: number;
  bs: Belastungsstufe;
  gewicht: number;
}

let rowCounter = 0;

export function createEmptyMeleeWeaponRow(): MeleeWeaponRow {
  return {
    id: `mw-${++rowCounter}-${Date.now()}`,
    weapon: '',
    combatTechnique: '',
    schadensbonus: 0,
    tp: '',
    atMod: 0,
    paMod: 0,
    reichweite: null,
    bf: 0,
    bs: Belastungsstufe.None,
    gewicht: 0,
  };
}
