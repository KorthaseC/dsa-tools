import { BOOK_TITLES } from '../constants/book.const';
import { ALL_SPELLS } from '../constants/spell.const';
import { ALL_RITUALS } from '../constants/ritual.const';
import { ALL_LITURGIES } from '../constants/liturgy.const';
import { ALL_CEREMONIES } from '../constants/ceremony.const';
import { formatBookReference } from './utils';

describe('formatBookReference — spelling out a rule-book source', () => {
  it('expands an abbreviation with a page', () => {
    expect(formatBookReference('AM1 114')).toBe('Aventurische Magie I, Seite 114');
    expect(formatBookReference('RGW 215')).toBe('Regelwerk, Seite 215');
  });

  it('handles abbreviations containing an ampersand', () => {
    expect(formatBookReference('S&H 42')).toBe('Straßenstaub & Halsabschneider, Seite 42');
  });

  it('expands a bare abbreviation without a page', () => {
    expect(formatBookReference('KHE')).toBe('Kodex der Helden');
  });

  it('leaves an already spelled-out title alone (hand-curated entries carry one)', () => {
    expect(formatBookReference('Aventurisches Kompendium')).toBe('Aventurisches Kompendium');
  });

  it('never invents a title for an unknown abbreviation', () => {
    expect(formatBookReference('XYZ 12')).toBe('XYZ 12');
    expect(formatBookReference('KHW')).toBe('KHW'); // referenced by the catalogs, absent from WerkGetInfo
  });

  it('is safe against keys that collide with Object prototype members', () => {
    expect(formatBookReference('constructor')).toBe('constructor');
    expect(formatBookReference('toString 5')).toBe('toString 5');
  });

  it('returns an empty string for nothing', () => {
    expect(formatBookReference('')).toBe('');
    expect(formatBookReference(undefined)).toBe('');
    expect(formatBookReference(null)).toBe('');
    expect(formatBookReference('   ')).toBe('');
  });
});

describe('book catalog — coverage of the references shown in the UI', () => {
  // The magic tab prints `row.page`, which comes from these entries' `page` field ("AM1 114").
  const pageRefs = [...ALL_SPELLS, ...ALL_RITUALS, ...ALL_LITURGIES, ...ALL_CEREMONIES]
    .map((e) => e.page)
    .filter((p): p is string => !!p?.trim());

  it('has titles for every abbreviation the sheet can display', () => {
    const unresolved = [...new Set(pageRefs.filter((p) => formatBookReference(p) === p.trim()))];
    expect(unresolved).toEqual([]);
  });

  it('carries the full WerkGetInfo book list', () => {
    expect(Object.keys(BOOK_TITLES).length).toBe(191);
    expect(Object.values(BOOK_TITLES).every((t) => t.trim().length > 0)).toBe(true);
  });
});
