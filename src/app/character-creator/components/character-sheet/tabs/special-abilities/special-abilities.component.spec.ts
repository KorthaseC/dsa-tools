import { TestBed } from '@angular/core/testing';
import { SpecialAbilitiesComponent } from './special-abilities.component';

describe('SpecialAbilitiesComponent — Anwendungsgebiet suggestions', () => {
  let component: SpecialAbilitiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SpecialAbilitiesComponent] }).compileComponents();
    component = TestBed.createComponent(SpecialAbilitiesComponent).componentInstance;
  });

  const labels = (param?: string) => component.areaOptions({ name: 'fertigkeitsspezialisierung', param }).map((o) => o.label);

  it('offers the application areas of the talent chosen in param', () => {
    expect(labels('Etikette')).toEqual(['Benehmen', 'Klatsch & Tratsch', 'Leichte Unterhaltung', 'Mode', 'Heraldik & Stammbäume', 'Poesie', 'Dienen & Gehorchen']);
  });

  it('tolerates the raw ": Gebiet" suffix a profession grant carries', () => {
    expect(labels('Etikette: Gebiet')).toEqual(labels('Etikette'));
  });

  it('matches the talent regardless of case and umlaut spelling', () => {
    // Talent ids ARE their German labels, so both sides go through normName.
    expect(labels('korperbeherrschung')).toEqual(labels('Körperbeherrschung'));
    expect(labels('korperbeherrschung').length).toBeGreaterThan(0);
  });

  it('returns nothing for an unset or unknown talent (the field stays editable)', () => {
    expect(labels(undefined)).toEqual([]);
    expect(labels('')).toEqual([]);
    expect(labels('Gibtsnicht')).toEqual([]);
  });

  it('offers the backfilled areas of Heilkunde Krankheiten', () => {
    // The generator used to lose this list entirely: the PDF has three `["", ]` rows, which made the
    // whole field parse as a string instead of an array.
    const found = labels('Heilkunde Krankheiten');
    expect(found.length).toBe(46);
    expect(found).toContain('Zorganpocken');
    expect(found.some((l) => !l.trim())).toBe(false); // no nameless leftovers
  });
});
