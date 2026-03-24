import { Liturgy } from '../models/divine.model';
import { Ceremony } from '../models/divine.model';
import { Blessing } from '../models/divine.model';
import { ALL_LITURGIES } from './liturgy.const';
import { ALL_CEREMONIES } from './ceremony.const';
import { ALL_BLESSINGS } from './blessing.const';

// ─── Master list of all divine entries ────────────────────────────────────────
// Liturgies (Liturgien): 199, Ceremonies (Zeremonien): 138, Blessings (Segen): 12
export const ALL_DIVINE: (Liturgy | Ceremony | Blessing)[] = [...ALL_LITURGIES, ...ALL_CEREMONIES, ...ALL_BLESSINGS];
