import { resolvePicks } from './character-entries';
import { ChosenEntry } from '../models/chosen-entry.model';

describe('resolvePicks (canonical entries → resolved runtime views)', () => {
  it('resolves an advantage entry against the catalog (cost/label reconstructed)', () => {
    const entries: ChosenEntry[] = [{ kind: 'advantage', id: 'zauberer' }];
    const picks = resolvePicks(entries);
    expect(picks.advantages.length).toBe(1);
    expect(picks.advantages[0].name).toBe('zauberer');
    expect(picks.advantages[0].label).toBeTruthy();
  });

  it('buckets a special-ability entry by its catalog category', () => {
    const picks = resolvePicks([{ kind: 'specialAbility', id: 'wuchtschlag' }]);
    expect(picks.specialAbilities.combat.some((s) => s.name === 'wuchtschlag')).toBe(true);
  });

  it('keeps a granted advantage mandatory (0 AP)', () => {
    const picks = resolvePicks([{ kind: 'advantage', id: 'zauberer', granted: true }]);
    expect(picks.advantages[0].mandatory).toBe(true);
  });

  it('falls back to a minimal entry for an unknown advantage (never throws / loses it)', () => {
    const picks = resolvePicks([{ kind: 'advantage', id: 'totallyunknownxyz', level: 2 }]);
    expect(picks.advantages[0]).toEqual(jasmine.objectContaining({ name: 'totallyunknownxyz', cost: 0, lvl: 2 }));
  });
});
