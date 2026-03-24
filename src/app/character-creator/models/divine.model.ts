import { IncreaseFactor, NamedEntry, SourceReference } from './base-creation.model';

export type LiturgyCheck = [string, string, string];

export interface BaseLiturgyEntry extends NamedEntry {
  check: LiturgyCheck;
  traditions: string[];
  increaseFactor: IncreaseFactor;
}

export interface Liturgy extends BaseLiturgyEntry {}

export interface Ceremony extends BaseLiturgyEntry {}

export interface Blessing extends NamedEntry {
  aspect: string;
  traditions: string[];
}
