// ─── Kampftechniken (Combat Techniques) ──────────────────────────────────────
// Re-exported from split files for backward compatibility.
// Use the specific imports for new code.

export { MELEE_COMBAT_TECHNIQUES } from './combat-technique-melee.const';
export { RANGED_COMBAT_TECHNIQUES } from './combat-technique-ranged.const';

import { MELEE_COMBAT_TECHNIQUES } from './combat-technique-melee.const';
import { RANGED_COMBAT_TECHNIQUES } from './combat-technique-ranged.const';

export const ALL_COMBAT_TECHNIQUES = [...MELEE_COMBAT_TECHNIQUES, ...RANGED_COMBAT_TECHNIQUES];
