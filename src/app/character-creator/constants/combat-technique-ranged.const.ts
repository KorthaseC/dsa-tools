import { IncreaseFactor } from '../models/base-creation.model';
import { CombatTechniqueDefinition } from '../models/combat-technique.model';

// ─── Fernkampftechniken (Ranged Combat Techniques) ───────────────────────────
// Source: DSA 5 Regelwerk (Core Rules)

export const RANGED_COMBAT_TECHNIQUES: CombatTechniqueDefinition[] = [
  { name: 'Armbrüste', label: 'Armbrüste', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Blasrohre', label: 'Blasrohre', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Bögen', label: 'Bögen', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.C, hasParry: false },
  { name: 'Diskusse', label: 'Diskusse', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.C, hasParry: false },
  { name: 'Feuerspeien', label: 'Feuerspeien', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Schleudern', label: 'Schleudern', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Wurfwaffen', label: 'Wurfwaffen', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
];
