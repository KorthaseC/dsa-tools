import { Attribute, IncreaseFactor, NamedEntry } from './base-creation.model';

export type TalentCheck = [Attribute, Attribute, Attribute];

export enum TalentCategory {
  Physical = 'physical',
  Social = 'social',
  Nature = 'nature',
  Knowledge = 'knowledge',
  Crafts = 'crafts',
}

export interface TalentDefinition extends NamedEntry {
  check: TalentCheck;
  increaseFactor: IncreaseFactor;
  category: TalentCategory;
  be?: boolean; // Belastung relevant (BE-Spalte: ja/nein/evtl → true/false/undefined)
  page?: number; // Seite im Regelwerk
  /** Anwendungsgebiete / Einsatzmöglichkeiten (PDF "Gebiete"); level is the printed ordering hint. */
  applicationAreas?: { name: string; level: number }[];
}
