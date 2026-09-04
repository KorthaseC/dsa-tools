import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { MagicComponent } from './magic.component';
import { CharacterStateService } from '../../../../services/character-state.service';
import { createEmptyCharacter } from '../../../../models/base-creation.model';
import { createEmptyMagicRow } from '../../../../models/magic-row.model';

// The magic component drives BOTH spells and liturgies (via the `mode` input), so a spell-mode reorder
// test also guards the liturgy path.
describe('MagicComponent — spell/liturgy reorder', () => {
  let component: MagicComponent;
  let state: CharacterStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MagicComponent], providers: [ConfirmationService] }).compileComponents();
    state = TestBed.inject(CharacterStateService);
    const c = createEmptyCharacter();
    c.spells = ['A', 'B', 'C'].map((n) => ({ ...createEmptyMagicRow(), spellName: n }));
    state.character.set(c);
    const fixture = TestBed.createComponent(MagicComponent);
    fixture.componentRef.setInput('mode', 'spell');
    component = fixture.componentInstance;
  });

  const names = () => state.character()!.spells.map((r) => r.spellName);

  it('drag reorder applies the move exactly once (regression: live-array binding double-applied it)', () => {
    // Reproduce the p-table: it reorders the BOUND array in place (ObjectUtils.reorderArray) and THEN
    // emits onRowReorder. magicRows() must be a copy so this in-place mutation must NOT touch the state.
    const bound = component.magicRows();
    const [moved] = bound.splice(2, 1); // PrimeNG's in-place reorder of the bound array (2 → 0)
    bound.splice(0, 0, moved);
    component.onRowReorder({ dragIndex: 2, dropIndex: 0 });
    expect(names()).toEqual(['C', 'A', 'B']); // single apply; the buggy live binding gave ['B','C','A']
  });

  it('moveRowDown / moveRowUp swap adjacent rows (touch reorder)', () => {
    component.moveRowDown(0);
    expect(names()).toEqual(['B', 'A', 'C']);
    component.moveRowUp(2);
    expect(names()).toEqual(['B', 'C', 'A']);
  });
});
