import { TestBed } from '@angular/core/testing';
import { BesitzComponent } from './besitz.component';
import { CharacterStateService } from '../../../../services/character-state.service';
import { createEmptyCharacter } from '../../../../models/base-creation.model';
import { ALL_ITEMS } from '../../../../constants/item.const';
import { ITEM_PACKAGES } from '../../../../constants/item-package.const';

describe('BesitzComponent — equipment reorder', () => {
  let component: BesitzComponent;
  let state: CharacterStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BesitzComponent] }).compileComponents();
    state = TestBed.inject(CharacterStateService);
    const c = createEmptyCharacter();
    c.equipment.general = [
      { name: 'A', quantity: 1 },
      { name: 'B', quantity: 1 },
      { name: 'C', quantity: 1 },
    ];
    state.character.set(c);
    const fixture = TestBed.createComponent(BesitzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const names = () => state.character()!.equipment.general.map((i) => i.name);

  it('drag reorder applies the move exactly once (regression: binding the live array double-applied it)', () => {
    // Reproduce p-table: it mutates the BOUND array in place (ObjectUtils.reorderArray) and THEN emits
    // onRowReorder. `items()` must be a copy, so this in-place mutation must NOT touch the state array.
    const bound = component.items();
    const [moved] = bound.splice(2, 1); // PrimeNG's in-place reorder of the bound array (2 → 0)
    bound.splice(0, 0, moved);
    component.onRowReorder({ dragIndex: 2, dropIndex: 0 });
    expect(names()).toEqual(['C', 'A', 'B']); // single apply; the buggy live-array binding gave ['B','C','A']
  });

  it('moveItemDown / moveItemUp swap adjacent items (touch reorder)', () => {
    component.moveItemDown(0);
    expect(names()).toEqual(['B', 'A', 'C']);
    component.moveItemUp(2);
    expect(names()).toEqual(['B', 'C', 'A']);
  });

  it('move buttons are no-ops at the ends', () => {
    component.moveItemUp(0);
    component.moveItemDown(2);
    expect(names()).toEqual(['A', 'B', 'C']);
  });

  it('addFromCatalog appends a row pre-filled from the catalog item (name / value / weight)', () => {
    const cat = ALL_ITEMS[0];
    component.addFromCatalog(cat.name);
    const last = state.character()!.equipment.general.at(-1)!;
    expect(last.name).toBe(cat.label);
    expect(last.value).toBe(cat.price ?? 0);
    expect(last.weight).toBe(cat.weight ?? 0);
  });

  it('addFromCatalog ignores an unknown slug (free-text rows are unaffected)', () => {
    component.addFromCatalog('___not-a-real-item___');
    expect(names()).toEqual(['A', 'B', 'C']);
  });

  it('addFromCatalog expands a Komplettpaket into all its contained items (name / quantity / carriedWhere)', () => {
    const [pkgSlug, contents] = Object.entries(ITEM_PACKAGES)[0];
    const before = state.character()!.equipment.general.length;

    component.addFromCatalog(pkgSlug);
    const general = state.character()!.equipment.general;
    const added = general.slice(before);

    expect(added.length).toBe(contents.length); // one row per contained item, not a single "package" row
    expect(added.map((r) => r.name)).toEqual(contents.map((c) => c.name));
    expect(added.map((r) => r.quantity)).toEqual(contents.map((c) => c.quantity));
    expect(added[0].carriedWhere).toBe(contents[0].carriedWhere); // "Wo getragen" carried over from the PDF
  });
});
