import { SpecialAbility } from '../models/special-ability.model';
import { ALL_PROFANE_SPECIAL_ABILITIES } from './special-ability-profane.const';
import { ALL_MAGIC_SPECIAL_ABILITIES } from './special-ability-magic.const';
import { ALL_KARMAL_SPECIAL_ABILITIES } from './special-ability-karmal.const';

// ─── Master list of all Sonderfertigkeiten ────────────────────────────────────
// Excludes Tierische Sonderfertigkeiten (animal SF) per design decision.
export const ALL_SPECIAL_ABILITIES: SpecialAbility[] = [...ALL_PROFANE_SPECIAL_ABILITIES, ...ALL_MAGIC_SPECIAL_ABILITIES, ...ALL_KARMAL_SPECIAL_ABILITIES];
