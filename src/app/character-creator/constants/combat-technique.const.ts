import { IncreaseFactor } from '../models/base-creation.model';
import { CombatTechniqueDefinition } from '../models/combat-technique.model';

// ─── Kampftechniken (Combat Techniques) ──────────────────────────────────────
// Source: DSA 5 Regelwerk (Core Rules)
// Total: 19 combat techniques

export const ALL_COMBAT_TECHNIQUES: CombatTechniqueDefinition[] = [
  // ── Nahkampf (Melee) ──
  { name: 'Dolche', label: 'Dolche', primaryAttribute: 'GE', increaseFactor: IncreaseFactor.B, hasParry: true },
  { name: 'Fechtwaffen', label: 'Fechtwaffen', primaryAttribute: 'GE', increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Hiebwaffen', label: 'Hiebwaffen', primaryAttribute: 'KK', increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Kettenwaffen', label: 'Kettenwaffen', primaryAttribute: 'KK', increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Lanzen', label: 'Lanzen', primaryAttribute: 'KK', increaseFactor: IncreaseFactor.B, hasParry: true },
  { name: 'Raufen', label: 'Raufen', primaryAttribute: ['GE', 'KK'], increaseFactor: IncreaseFactor.B, hasParry: true },
  { name: 'Schilde', label: 'Schilde', primaryAttribute: 'KK', increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Schwerter', label: 'Schwerter', primaryAttribute: ['GE', 'KK'], increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Stangenwaffen', label: 'Stangenwaffen', primaryAttribute: ['GE', 'KK'], increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Zweihandhiebwaffen', label: 'Zweihandhiebwaffen', primaryAttribute: 'KK', increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Zweihandschwerter', label: 'Zweihandschwerter', primaryAttribute: 'KK', increaseFactor: IncreaseFactor.C, hasParry: true },

  // ── Sondernahkampf (Special Melee) ──
  { name: 'Fächer', label: 'Fächer', primaryAttribute: 'GE', increaseFactor: IncreaseFactor.C, hasParry: true },
  { name: 'Peitschen', label: 'Peitschen', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: true },

  // ── Fernkampf (Ranged) ──
  { name: 'Armbrüste', label: 'Armbrüste', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Blasrohre', label: 'Blasrohre', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Bögen', label: 'Bögen', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.C, hasParry: false },
  { name: 'Diskusse', label: 'Diskusse', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.C, hasParry: false },
  { name: 'Feuerspeien', label: 'Feuerspeien', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Schleudern', label: 'Schleudern', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
  { name: 'Spießwaffen', label: 'Spießwaffen', primaryAttribute: 'KK', increaseFactor: IncreaseFactor.B, hasParry: true },
  { name: 'Wurfwaffen', label: 'Wurfwaffen', primaryAttribute: 'FF', increaseFactor: IncreaseFactor.B, hasParry: false },
];
