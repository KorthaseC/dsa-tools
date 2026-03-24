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
}
