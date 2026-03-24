import { IncreaseFactor, NamedEntry, SourceReference } from './base-creation.model';

export { IncreaseFactor };

export type SpellCheck = [string, string, string];

export enum SpellTrait {
  Antimagie = 'Antimagie',
  Daemonisch = 'Dämonisch',
  Einfluss = 'Einfluss',
  Elementar = 'Elementar',
  Heilung = 'Heilung',
  Hellsicht = 'Hellsicht',
  Illusion = 'Illusion',
  Objekt = 'Objekt',
  Sphaeren = 'Sphären',
  Telekinese = 'Telekinese',
  Temporal = 'Temporal',
  Verwandlung = 'Verwandlung',
}

export interface BaseSpellEntry extends NamedEntry {
  check: SpellCheck;
  trait: SpellTrait;
  traditions: string[];
  increaseFactor: IncreaseFactor;
}

export interface Spell extends BaseSpellEntry {}

export interface Ritual extends BaseSpellEntry {}

export interface Cantrip extends NamedEntry {
  trait: SpellTrait;
  traditions: string[];
}
