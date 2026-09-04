import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { SpecialAbilities } from '../models/base-creation.model';
import { ProfessionGrant } from '../models/profession.model';
import { bucketForSACategory } from './save-entries';

// Single source of truth for resolving a profession's special-ability grant to a catalog SF.
// Used by CharacterStateService.applyProfession AND the core-data audit, so resolution can't drift.

export type SABucket = keyof SpecialAbilities;

// Normalize a label for matching profession grants ↔ catalog SFs: drop gender markers (":in"/":r"/":e",
// so "Analytiker:in" ≡ grant "Analytiker"), drop a standalone roman level, collapse whitespace.
export const normSALabel = (s: string) => s.toLowerCase().replace(/:in|:r|:e\b/g, '').replace(/\b[ivx]+\b/g, '').replace(/\s+/g, ' ').trim();

// Per-bucket label→slug index. Keying by bucket (kind) prevents the "Tradition" collision — a magic
// grant must only match a magic SF, not the karmal "Tradition".
const SA_BY_BUCKET: Record<SABucket, Map<string, string>> = { general: new Map(), combat: new Map(), magic: new Map(), karmal: new Map() };
for (const s of ALL_SPECIAL_ABILITIES) {
  const map = SA_BY_BUCKET[bucketForSACategory(s.category)];
  // Index the gender-neutral label plus any gender variants (formLabels), so a gendered grant
  // ("Weg des Adligen") resolves to the gender-neutral catalog entry ("Weg der:s Adligen").
  for (const lbl of [s.label, ...(s.formLabels ?? [])]) {
    const key = normSALabel(lbl);
    if (key && !map.has(key)) map.set(key, s.name);
  }
}

// Curated grant→SF aliases for label-form mismatches the normalizer can't bridge: German gender/article
// contractions (grant "Bannschwert des Adepten" ↔ catalog "Bannschwert der:s Adept:in"; "Magischer
// Meisterschmied" ↔ "Magische:r Meisterschmied:in") and a selection-placeholder base ("Rudelerschaffung"
// ↔ "Rudelerschaffung (Typ)"). Keyed by normSALabel(grant.label) → SF slug.
const GRANT_ALIASES = new Map<string, string>([
  ['bannschwert des adepten', 'bannschwertdersadeptin'],
  ['hammer des adepten', 'hammerdersadeptin'],
  ['seil des adepten', 'seildersadeptin'],
  ['magischer meisterschmied', 'magischermeisterschmiedin'],
  ['rudelerschaffung', 'rudelerschaffung'],
]);

export interface ResolvedSAGrant {
  name: string;
  /** True when resolved to the specific "Label (Param)" SF — the param IS baked in, so the pick needs no separate param. */
  specific: boolean;
}

/** Resolve a profession SF grant to a catalog SF slug WITHIN its kind (bucket). Tries the specific
 *  "Label (Param)" SF first, then the bare label, then a curated alias. Returns undefined if unknown. */
export function resolveSAGrant(bucket: SABucket, grant: ProfessionGrant): ResolvedSAGrant | undefined {
  const idx = SA_BY_BUCKET[bucket];
  // "Talentstil: (Stil)" (and similarly "Zauberstil"/"Kampfstil"/"Liturgiestil") grants name the concrete
  // style in the PARAM, which is now its own style SF — resolve the param directly (gender variants indexed).
  if (grant.param && /^(talent|zauber|kampf|liturgie)stil\b/.test(normSALabel(grant.label))) {
    const style = idx.get(normSALabel(grant.param));
    if (style) return { name: style, specific: true };
  }
  const combined = grant.param ? idx.get(normSALabel(`${grant.label} (${grant.param})`)) : undefined;
  if (combined) return { name: combined, specific: true };
  const bare = idx.get(normSALabel(grant.label)) ?? GRANT_ALIASES.get(normSALabel(grant.label));
  return bare ? { name: bare, specific: false } : undefined;
}
