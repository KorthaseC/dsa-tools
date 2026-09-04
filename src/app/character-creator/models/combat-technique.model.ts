import { Attribute, IncreaseFactor, NamedEntry } from './base-creation.model';

export interface CombatTechniqueDefinition extends NamedEntry {
  primaryAttribute: Attribute | [Attribute, Attribute];
  increaseFactor: IncreaseFactor;
  hasParry: boolean;
}
