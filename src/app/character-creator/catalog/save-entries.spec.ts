import { bucketForSACategory, fromChosenEntries, toChosenEntries } from './save-entries';
import { SpecialAbilities } from '../models/base-creation.model';
import { SpecialAbilityCategory } from '../models/special-ability.model';

describe('save-entries (split pick fields ↔ unified ChosenEntry[])', () => {
  it('derives the SA bucket from the catalog category', () => {
    expect(bucketForSACategory(SpecialAbilityCategory.Combat)).toBe('combat');
    expect(bucketForSACategory(SpecialAbilityCategory.CombatStyle)).toBe('combat');
    expect(bucketForSACategory(SpecialAbilityCategory.Command)).toBe('combat');
    expect(bucketForSACategory(SpecialAbilityCategory.MagicTradition)).toBe('magic');
    expect(bucketForSACategory(SpecialAbilityCategory.MagicPact)).toBe('magic');
    expect(bucketForSACategory(SpecialAbilityCategory.KarmalTradition)).toBe('karmal');
    expect(bucketForSACategory(SpecialAbilityCategory.KarmalSermon)).toBe('karmal');
    expect(bucketForSACategory(SpecialAbilityCategory.General)).toBe('general');
    expect(bucketForSACategory(SpecialAbilityCategory.Language)).toBe('general');
    expect(bucketForSACategory(undefined)).toBe('general');
  });

  it('flattens advantages/disadvantages/SAs into one ordered entry list', () => {
    const sa: SpecialAbilities = {
      general: [{ name: 'ortskenntnis', param: 'Gareth', granted: true }],
      combat: [{ name: 'wuchtschlag', lvl: 2 }],
      magic: [],
      karmal: [],
    };
    const entries = toChosenEntries([{ name: 'zauberer' }], [{ name: 'arm', lvl: 1 }], sa);
    expect(entries).toEqual([
      { kind: 'advantage', id: 'zauberer' },
      { kind: 'disadvantage', id: 'arm', level: 1 },
      { kind: 'specialAbility', id: 'ortskenntnis', options: [{ key: 'param', id: 'Gareth' }], granted: true },
      { kind: 'specialAbility', id: 'wuchtschlag', level: 2 },
    ]);
  });

  it('round-trips losslessly (free-text param + granted + level preserved)', () => {
    const sa: SpecialAbilities = {
      general: [{ name: 'ortskenntnis', param: 'Gareth-Südquartier', granted: true }],
      combat: [{ name: 'wuchtschlag', lvl: 2 }],
      magic: [],
      karmal: [],
    };
    const advantages = [{ name: 'zauberer' }, { name: 'herausragendersinn_sicht', lvl: 1 }];
    const disadvantages = [{ name: 'arm', lvl: 1 }];

    const back = fromChosenEntries(toChosenEntries(advantages, disadvantages, sa));

    expect(back.advantages).toEqual(advantages);
    expect(back.disadvantages).toEqual(disadvantages);
    // ortskenntnis (general) and wuchtschlag (combat) land in their category buckets, refs intact.
    expect(back.specialAbilities.general).toEqual([{ name: 'ortskenntnis', param: 'Gareth-Südquartier', granted: true }]);
    expect(back.specialAbilities.combat).toEqual([{ name: 'wuchtschlag', lvl: 2 }]);
  });

  it('preserves a mandatory advantage via granted (free/auto-granted picks survive the round-trip)', () => {
    const empty: SpecialAbilities = { general: [], combat: [], magic: [], karmal: [] };
    const entries = toChosenEntries([{ name: 'zauberer', mandatory: true }], [], empty);
    expect(entries).toEqual([{ kind: 'advantage', id: 'zauberer', granted: true }]);
    expect(fromChosenEntries(entries).advantages).toEqual([{ name: 'zauberer', mandatory: true }]);
  });

  it('treats empty/undefined entries as no picks', () => {
    expect(fromChosenEntries(undefined)).toEqual({ advantages: [], disadvantages: [], specialAbilities: { general: [], combat: [], magic: [], karmal: [] } });
  });
});
