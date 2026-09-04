import { ADVANTAGE, DISADVANTAGE } from './advantage.const';
import { ALL_SPECIES } from './species.const';
import { ALL_CULTURES } from './culture.const';
import { ALL_PROFESSIONS } from './profession.const';
import { ALL_SPECIAL_ABILITIES } from './special-ability.const';
import { Advantage, SelectionOption } from '../models/advantage.model';
import { SpeciesAdvantageRef } from '../models/species.model';
import { CultureAdvantageRef } from '../models/culture.model';
import { ProfessionAdvantageRef } from '../models/profession.model';
import { selectionOptionsFor } from '../utils/utils';
import { CATALOG_DUPLICATE_KEYS, entriesOfKind } from '../catalog/catalog-index';
import { EntryKind } from '../models/entry-kind';

/**
 * Guards that downstream data (species now; culture/profession/SA as they migrate) only references
 * advantages that exist in the catalog, and that every sub-option is a canonical SELECTION_OPTIONS
 * slug. Catches casing/umlaut drift and stale base names before they reach validation/UI.
 */
describe('data integrity: advantage references', () => {
  const advByName = new Map<string, Advantage>([...ADVANTAGE, ...DISADVANTAGE].map((a) => [a.name, a]));

  function checkRef(ref: SpeciesAdvantageRef | CultureAdvantageRef | ProfessionAdvantageRef, isDisadvantage: boolean): string | null {
    const name = typeof ref === 'string' ? ref : ref.name;
    const option = typeof ref === 'string' ? undefined : ref.option;
    const catalog = isDisadvantage ? DISADVANTAGE : ADVANTAGE;
    const base = catalog.find((a) => a.name === name) ?? advByName.get(name);
    if (!base) return `unknown ${isDisadvantage ? 'disadvantage' : 'advantage'} "${name}"`;
    if (option != null) {
      const opts: SelectionOption[] = selectionOptionsFor(base);
      if (!opts.some((o) => o.name === option)) return `"${name}" has no sub-option "${option}"`;
    }
    return null;
  }

  describe('species', () => {
    for (const species of ALL_SPECIES) {
      const advLists: SpeciesAdvantageRef[] = [
        ...species.autoAdvantages,
        ...species.recommendedAdvantages,
        ...species.atypicalAdvantages,
        ...species.typicalAdvantages.flatMap((g) => g.advantages),
      ];
      const disLists: SpeciesAdvantageRef[] = [
        ...species.autoDisadvantages,
        ...species.recommendedDisadvantages,
        ...species.atypicalDisadvantages,
        ...species.typicalDisadvantages.flatMap((g) => g.advantages),
      ];

      it(`${species.label}: all advantage refs resolve`, () => {
        const errors = advLists.map((r) => checkRef(r, false)).filter(Boolean);
        expect(errors).toEqual([]);
      });

      it(`${species.label}: all disadvantage refs resolve`, () => {
        const errors = disLists.map((r) => checkRef(r, true)).filter(Boolean);
        expect(errors).toEqual([]);
      });
    }
  });

  describe('culture', () => {
    for (const culture of ALL_CULTURES) {
      const advLists: CultureAdvantageRef[] = [...culture.typicalAdvantages, ...culture.atypicalAdvantages];
      const disLists: CultureAdvantageRef[] = [...culture.typicalDisadvantages, ...culture.atypicalDisadvantages];

      it(`${culture.label}: all advantage refs resolve`, () => {
        const errors = advLists.map((r) => checkRef(r, false)).filter(Boolean);
        expect(errors).toEqual([]);
      });

      it(`${culture.label}: all disadvantage refs resolve`, () => {
        const errors = disLists.map((r) => checkRef(r, true)).filter(Boolean);
        expect(errors).toEqual([]);
      });
    }
  });

  describe('profession', () => {
    // 943 professions × 2 sides → aggregate into one assertion per side (each error tagged with the profession).
    const tag = (label: string, err: string | null) => (err ? `${label}: ${err}` : null);

    it('all granted advantage refs resolve', () => {
      const errors = ALL_PROFESSIONS.flatMap((p) =>
        p.advantages.map((r: ProfessionAdvantageRef) => tag(p.name, checkRef(r, false)))
      ).filter(Boolean);
      expect(errors).toEqual([]);
    });

    it('all granted disadvantage refs resolve', () => {
      const errors = ALL_PROFESSIONS.flatMap((p) =>
        p.disadvantages.map((r: ProfessionAdvantageRef) => tag(p.name, checkRef(r, true)))
      ).filter(Boolean);
      expect(errors).toEqual([]);
    });
  });

  describe('special abilities', () => {
    // The structured `requirements` are the single prerequisite model. Catalog-referencing types must
    // resolve: advantage/disadvantage/grantedAdvantage/grantedDisadvantage → an advantage slug;
    // specialAbility → an SA slug. (narrative/attribute/talent/… reference no slug and are skipped.)
    const norm = (s: string) => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
    const advCatalog = new Set([...ADVANTAGE, ...DISADVANTAGE].map((a) => norm(a.name)));
    const saCatalog = new Set(ALL_SPECIAL_ABILITIES.map((s) => norm(s.name)));
    const slugTypes = new Set(['advantage', 'disadvantage', 'specialAbility', 'grantedAdvantage', 'grantedDisadvantage']);

    it('all structured requirement refs resolve to a known advantage or special ability', () => {
      const errors = ALL_SPECIAL_ABILITIES.flatMap((sa) =>
        (sa.requirements ?? [])
          .filter((r) => r.name && slugTypes.has(r.type))
          .map((r) => {
            const n = norm(r.name!);
            return advCatalog.has(n) || saCatalog.has(n) ? null : `${sa.name}: unknown ${r.type} "${r.name}"`;
          })
      ).filter(Boolean);
      expect(errors).toEqual([]);
    });
  });
});

/**
 * Guards for the (kind, id) CatalogIndex — the id-based resolution layer. Every reference in the
 * id-based architecture resolves through this index, so its internal consistency is foundational:
 * slugs must be unique within a kind, and the core catalogs must actually be wired in.
 */
describe('data integrity: catalog index', () => {
  it('has no duplicate slugs within a kind', () => {
    expect(CATALOG_DUPLICATE_KEYS).toEqual([]);
  });

  // Catalogs that must never be empty (a regressed import/re-export would surface here).
  const populatedKinds: EntryKind[] = [
    'advantage',
    'disadvantage',
    'specialAbility',
    'talent',
    'combatTechnique',
    'spell',
    'ritual',
    'cantrip',
    'liturgy',
    'ceremony',
    'blessing',
    'species',
    'culture',
    'profession',
  ];

  for (const kind of populatedKinds) {
    it(`indexes at least one ${kind}`, () => {
      expect(entriesOfKind(kind).length).toBeGreaterThan(0);
    });
  }
});
