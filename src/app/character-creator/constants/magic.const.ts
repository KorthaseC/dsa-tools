import { Spell } from '../models/magic.model';
import { Ritual } from '../models/magic.model';
import { Cantrip } from '../models/magic.model';
import { ALL_SPELLS } from './spell.const';
import { ALL_RITUALS } from './ritual.const';
import { ALL_CANTRIPS } from './cantrip.const';

// ─── Master list of all magic entries ─────────────────────────────────────────
// Spells (Zaubersprüche): 263, Rituals (Rituale): 74, Cantrips (Zaubertricks): 113
export const ALL_MAGIC: (Spell | Ritual | Cantrip)[] = [...ALL_SPELLS, ...ALL_RITUALS, ...ALL_CANTRIPS];
