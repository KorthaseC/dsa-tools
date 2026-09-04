import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { SpecialAbilityCategory } from '../models/special-ability.model';
import { ProfessionGrant } from '../models/profession.model';
import { resolveSAGrant, normSALabel, SABucket } from './sa-grants';
import { selectionOptionsFor } from '../utils/utils';

// Core-data audit: proves the catalog is correctly wired for the id-based core across ALL data, so
// gaps are caught here rather than by clicking through the app. Uses the SAME grant resolver
// (catalog/sa-grants) as CharacterStateService.applyProfession.

const resolveGrant = (bucket: SABucket, grant: ProfessionGrant): string | undefined => resolveSAGrant(bucket, grant)?.name;

describe('core-data audit: traditions', () => {
  it('magic AND karmal tradition categories are populated (regression: orphan dedup must not nuke them)', () => {
    expect(ALL_SPECIAL_ABILITIES.filter((s) => s.category === SpecialAbilityCategory.MagicTradition).length).toBeGreaterThan(0);
    expect(ALL_SPECIAL_ABILITIES.filter((s) => s.category === SpecialAbilityCategory.KarmalTradition).length).toBeGreaterThan(0);
  });

  it('every magic/karmal profession resolves its "Tradition" grant to a SF of the matching kind', () => {
    const offenders: string[] = [];
    for (const p of ALL_PROFESSIONS) {
      const bucket: SABucket = p.category === 'karmal' ? 'karmal' : 'magic';
      const grants = bucket === 'karmal' ? p.karmalSpecialAbilities : p.magicSpecialAbilities;
      for (const g of grants) {
        if (normSALabel(g.label) !== 'tradition') continue; // only the tradition grant
        if (!resolveGrant(bucket, g)) offenders.push(`${p.name}: ${bucket} "Tradition (${g.param ?? ''})"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('core-data audit: selections', () => {
  // Selection sources with no fixed option list. Verified: their PDF option lists live in form-field
  // `/Opt[…]` widget arrays (or are free text like OrtArray), NOT in `aDaten[]` GetInfo records, so the
  // generator can't resolve them via the normal path — the SF UI renders a free-text input instead.
  // Any NEW empty selection outside this allowlist fails the audit (regression guard).
  const KNOWN_EMPTY_SELECTION_SOURCES = new Set([
    'OrtArray', 'RegionArray', 'FuchsArray', 'DialektArray', 'TierArtArray', 'GliederArray',
    // SpeziesArray (Anatomie) + VorstellungArray (Beeindruckende Vorstellung) are curated-filled in the generator.
  ]);

  it('every catalog selection resolves to options (except documented free-text/backlog sources)', () => {
    const empties = [...ADVANTAGE, ...DISADVANTAGE, ...ALL_SPECIAL_ABILITIES].filter((e) => e.selection && selectionOptionsFor(e).length === 0);
    const offenders = empties.filter((e) => !KNOWN_EMPTY_SELECTION_SOURCES.has(e.selection!.id)).map((e) => `${e.name} → ${e.selection!.id}`);
    // eslint-disable-next-line no-console
    console.log(`[core-audit] empty selections: ${empties.length} (allowlisted sources: ${KNOWN_EMPTY_SELECTION_SOURCES.size}); non-allowlisted offenders:`, offenders);
    expect(offenders).toEqual([]);
  });

  // Parser-regression guards (fragment splitting + Voraussetzung cleanup).
  it('no requirement is a bogus gendered-suffix narrative (e.g. "in" split off from "X/in")', () => {
    const GENDER_SUFFIX = new Set(['in', 'innen', 'e', 'r', 's', 'es', 'en', 'euse', 'frau', 'mann']);
    const offenders = [...ADVANTAGE, ...DISADVANTAGE, ...ALL_SPECIAL_ABILITIES].flatMap((e) =>
      (e.requirements ?? [])
        .filter((r) => r.type === 'narrative' && GENDER_SUFFIX.has((r.text ?? '').trim().toLowerCase()))
        .map((r) => `${e.name}: "${r.text}"`)
    );
    expect(offenders).toEqual([]);
  });

  it('caster/priest requirement texts carry no leaked AP-cost line', () => {
    const offenders = [...ADVANTAGE, ...DISADVANTAGE, ...ALL_SPECIAL_ABILITIES].flatMap((e) =>
      (e.requirements ?? [])
        .filter((r) => (r.type === 'caster' || r.type === 'priest') && /AP-Wert|Abenteuerpunkte/i.test(r.text ?? ''))
        .map((r) => `${e.name}: "${r.text}"`)
    );
    expect(offenders).toEqual([]);
  });
});

describe('core-data audit: profession SA-grant coverage', () => {
  it('every profession SA grant resolves to a SF of its kind', () => {
    const buckets: [SABucket, (p: (typeof ALL_PROFESSIONS)[number]) => ProfessionGrant[]][] = [
      ['general', (p) => p.generalSpecialAbilities],
      ['combat', (p) => p.combatSpecialAbilities],
      ['magic', (p) => p.magicSpecialAbilities],
      ['karmal', (p) => p.karmalSpecialAbilities],
    ];
    const offenders = new Set<string>();
    let total = 0;
    for (const p of ALL_PROFESSIONS) {
      for (const [bucket, pick] of buckets) {
        for (const g of pick(p)) {
          total++;
          if (!resolveGrant(bucket, g)) offenders.add(`${bucket} "${g.label}${g.param ? ' (' + g.param + ')' : ''}"`);
        }
      }
    }
    // eslint-disable-next-line no-console
    console.log(`[core-audit] profession SA grants: ${total} total; unresolved:`, [...offenders].sort());
    expect([...offenders]).toEqual([]);
  });
});
