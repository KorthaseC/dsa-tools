import { ExperienceLevelId } from '../models/experience-level.model';
import { SpeciesType } from '../models/species.model';
import { CharacterSaveData, createDefaultSaveData } from '../models/character-save.model';
import { CharacterResolverService } from '../services/character-resolver.service';
import { CharacterStateService } from '../services/character-state.service';
import { CharacterValidationService } from '../services/character-validation.service';
import { EXPERIENCE_LEVELS } from '../constants/experience-levels.const';
import { resolvePicksForCharacter } from '../catalog/character-entries';
import { createEmptyCharacter } from '../models/base-creation.model';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { ADVANTAGE, DISADVANTAGE } from '../constants/advantage.const';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { computeSpentAp, specialAbilityCost } from './ap-budget.util';
import { recomputeDerivedStats } from './derived-stats.util';
import { SF_INDEX, resolveAdvantageByName, selectionOptionsFor } from './utils';

function saveData(overrides: Partial<CharacterSaveData> = {}): CharacterSaveData {
  return {
    ...createDefaultSaveData(),
    experienceLevelId: ExperienceLevelId.Experienced,
    speciesType: SpeciesType.Human,
    attributes: { MU: 12, KL: 11, IN: 10, CH: 9, FF: 11, GE: 12, KO: 13, KK: 12 },
    entries: [
      { kind: 'advantage', id: 'zauberer' },
      { kind: 'disadvantage', id: 'arm', level: 1 },
      { kind: 'specialAbility', id: 'ortskenntnis' },
    ],
    homebrew: [{ id: 'h', kind: 'specialAbility', label: 'Hausregel-SF', cost: 7 }],
    ...overrides,
  };
}

describe('computeSpentAp — single source of truth for spent AP', () => {
  const resolver = new CharacterResolverService();

  it('the resolved budget AND the live State budget both equal computeSpentAp', () => {
    const char = resolver.resolve(saveData());
    const expected = computeSpentAp(char);

    // CharacterResolverService.computeApBudget
    expect(char.ap.spent).toBe(expected);

    // CharacterStateService.ap
    const state = new CharacterStateService();
    state.character.set(char);
    state.experienceLevel.set(EXPERIENCE_LEVELS.find((e) => e.id === ExperienceLevelId.Experienced)!);
    expect(state.ap().spent).toBe(expected);
  });

  it('the validation ap-budget rule reports the computeSpentAp figure when over budget', () => {
    const over = resolver.resolve(saveData({ homebrew: [{ id: 'big', kind: 'other', label: 'Zu teuer', cost: 999_999 }] }));
    const validation = new CharacterValidationService();
    const errs = validation.validate(over).filter((r) => r.ruleId === 'ap-budget');
    expect(errs.length).toBe(1);
    expect(errs[0].message).toContain(`${computeSpentAp(over)} /`);
  });

  it('counts homebrew in the spent figure (the one place all consumers read)', () => {
    const withHb = computeSpentAp(resolver.resolve(saveData()));
    const withoutHb = computeSpentAp(resolver.resolve(saveData({ homebrew: [] })));
    expect(withHb - withoutHb).toBe(7); // the 7-AP homebrew SF
  });
});

describe('costOverride — character-local cost adjustment (K1)', () => {
  const resolver = new CharacterResolverService();

  it('uses the override as the total AP for an advantage', () => {
    // Same advantage + same everything; only the override differs → the spend delta equals the override delta.
    const hi = computeSpentAp(resolver.resolve(saveData({ homebrew: [], entries: [{ kind: 'advantage', id: 'zauberer', costOverride: 100 }] })));
    const lo = computeSpentAp(resolver.resolve(saveData({ homebrew: [], entries: [{ kind: 'advantage', id: 'zauberer', costOverride: 40 }] })));
    expect(hi - lo).toBe(60);
  });

  it('lets `granted` win over an override (granted picks stay free)', () => {
    const granted = computeSpentAp(resolver.resolve(saveData({ homebrew: [], entries: [{ kind: 'specialAbility', id: 'ortskenntnis', costOverride: 999, granted: true }] })));
    const none = computeSpentAp(resolver.resolve(saveData({ homebrew: [], entries: [] })));
    expect(granted).toBe(none); // granted SA costs 0; the override is ignored
  });

  it('round-trips costOverride through resolve → toSaveData for advantages and SAs', () => {
    const c = resolver.resolve(
      saveData({
        homebrew: [],
        entries: [
          { kind: 'advantage', id: 'zauberer', costOverride: 7 },
          { kind: 'specialAbility', id: 'ortskenntnis', costOverride: 9 },
        ],
      }),
    );
    const back = resolver.toSaveData(c).entries;
    expect(back).toContain(jasmine.objectContaining({ kind: 'advantage', id: 'zauberer', costOverride: 7 }));
    expect(back).toContain(jasmine.objectContaining({ kind: 'specialAbility', id: 'ortskenntnis', costOverride: 9 }));
  });
});

describe('editable total AP — maxAp is the single budget source', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();

  it('ap-budget rule reads maxAp: no budget at 0, error when spent exceeds it', () => {
    const char = resolver.resolve(saveData({ homebrew: [] }));
    const spent = computeSpentAp(char);
    expect(spent).toBeGreaterThan(1);

    // no budget set → nothing to check
    expect(validation.validate({ ...char, maxAp: 0 }).some((r) => r.ruleId === 'ap-budget')).toBe(false);
    // budget below spent → error reporting "spent / maxAp"
    const errs = validation.validate({ ...char, maxAp: spent - 1 }).filter((r) => r.ruleId === 'ap-budget');
    expect(errs.length).toBe(1);
    expect(errs[0].message).toContain(`${spent} / ${spent - 1}`);
    // ample budget → no error
    expect(validation.validate({ ...char, maxAp: spent + 100 }).some((r) => r.ruleId === 'ap-budget')).toBe(false);
  });

  it('setTotalAp drives the live budget total', () => {
    const state = new CharacterStateService();
    state.character.set(resolver.resolve(saveData({ homebrew: [] })));
    state.setTotalAp(1234);
    expect(state.ap().total).toBe(1234);
  });
});

describe('species auto-advantages are free (derived from the current species)', () => {
  const resolver = new CharacterResolverService();
  const elf = (entries: CharacterSaveData['entries']) => resolver.resolve(saveData({ speciesType: SpeciesType.Elf, entries, homebrew: [] }));
  const human = (entries: CharacterSaveData['entries']) => resolver.resolve(saveData({ speciesType: SpeciesType.Human, entries, homebrew: [] }));

  // Elf auto-grants 'zauberer'; Human does not.
  it('costs 0 for the granting species and is charged for a species that does not grant it', () => {
    const elfDelta = computeSpentAp(elf([{ kind: 'advantage', id: 'zauberer' }])) - computeSpentAp(elf([]));
    const humanDelta = computeSpentAp(human([{ kind: 'advantage', id: 'zauberer' }])) - computeSpentAp(human([]));
    expect(elfDelta).toBe(0); // free for the Elf (species auto-advantage)
    expect(humanDelta).toBeGreaterThan(0); // charged for the Human
  });

  it('marks the pick mandatory only while the granting species is selected', () => {
    expect(resolvePicksForCharacter(elf([{ kind: 'advantage', id: 'zauberer' }])).advantages.find((a) => a.name === 'zauberer')?.mandatory).toBe(true);
    expect(resolvePicksForCharacter(human([{ kind: 'advantage', id: 'zauberer' }])).advantages.find((a) => a.name === 'zauberer')?.mandatory).toBeFalsy();
  });
});

describe('culture grants one free Ortskenntnis (derived; empty-sheet base-edit does not cascade)', () => {
  const resolver = new CharacterResolverService();
  const orts = (entries: CharacterSaveData['entries'], culture = '') => resolver.resolve(saveData({ entries, homebrew: [], culture }));
  const one: CharacterSaveData['entries'] = [{ kind: 'specialAbility', id: 'ortskenntnis', options: [{ key: 'param', id: 'Gareth' }] }];

  it('waives the first Ortskenntnis when a culture is set; charges it without a culture', () => {
    const withCulture = computeSpentAp(orts(one, 'Gareth')) - computeSpentAp(orts([], 'Gareth'));
    const noCulture = computeSpentAp(orts(one)) - computeSpentAp(orts([]));
    expect(withCulture).toBe(0); // free via the culture entitlement
    expect(noCulture).toBeGreaterThan(0); // charged without a culture
  });

  it('frees only ONE Ortskenntnis — a second is still charged', () => {
    const two: CharacterSaveData['entries'] = [...one, { kind: 'specialAbility', id: 'ortskenntnis', options: [{ key: 'param', id: 'Punin' }] }];
    expect(computeSpentAp(orts(two, 'Gareth')) - computeSpentAp(orts(one, 'Gareth'))).toBeGreaterThan(0);
  });

  it('marks it granted in the resolved picks only while a culture is set', () => {
    const grantedOrts = (c: ReturnType<typeof orts>) => resolvePicksForCharacter(c).specialAbilities.general.some((s) => s.name === 'ortskenntnis' && s.granted);
    expect(grantedOrts(orts(one, 'Gareth'))).toBe(true);
    expect(grantedOrts(orts(one))).toBe(false);
  });
});

describe('Schlechte Eigenschaft — per-option AP value (Issue 3)', () => {
  const resolver = new CharacterResolverService();
  const spent = (id: string) => computeSpentAp(resolver.resolve(saveData({ homebrew: [], entries: [{ kind: 'disadvantage', id }] })));

  it('differentiates per-trait values (Naiv −10 grants more AP than Neugier −5)', () => {
    // Both are disadvantages (negative cost); Naiv reduces spent AP by 5 more than Neugier.
    expect(spent('schlechteEigenschaft_neugier') - spent('schlechteEigenschaft_naiv')).toBe(5);
  });
});

describe('cantrips (Zaubertricks) and blessings (Segnungen) each cost 1 AP', () => {
  it('adds 1 AP per cantrip and per blessing to the spent total', () => {
    const base = createEmptyCharacter();
    const before = computeSpentAp(base);
    expect(computeSpentAp({ ...base, cantrips: ['Bann des Eisens', 'Fingerzeig'] })).toBe(before + 2);
    expect(computeSpentAp({ ...base, blessings: ['Segnung A', 'Segnung B', 'Segnung C'] })).toBe(before + 3);
    expect(computeSpentAp({ ...base, cantrips: ['X'], blessings: ['Y', 'Z'] })).toBe(before + 3);
  });
});

describe('specialAbilityCost — Steigerungsfaktor-priced SFs (Lieblingszauber & co.)', () => {
  it('effective cost = base × the chosen option\'s SF-index; base (×1) when no option is chosen', () => {
    const sa = ALL_SPECIAL_ABILITIES.find((s) => s.costBySteigerungsfaktor && s.selection);
    expect(sa).toBeTruthy();
    const opt = selectionOptionsFor(sa!).find((o) => o.factor);
    expect(opt).toBeTruthy();

    expect(specialAbilityCost({ name: sa!.name, param: opt!.name })).toBe(sa!.cost * SF_INDEX[opt!.factor!]);
    expect(specialAbilityCost({ name: sa!.name })).toBe(sa!.cost); // no option yet → base
  });
});

describe('disadvantage 80-AP cap (capDisadvantageAp toggle)', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();

  // Pick plain (non-leveled, non-selection) disadvantages whose costs sum beyond −80.
  function overCapEntries(): { entries: CharacterSaveData['entries']; sum: number } {
    const picks: string[] = [];
    let sum = 0;
    for (const d of DISADVANTAGE) {
      if (d.cost < 0 && !d.selection && (d.maxLvl == null || d.maxLvl <= 1)) {
        picks.push(d.name);
        sum += d.cost;
        if (sum <= -110) break;
      }
    }
    return { entries: picks.map((id) => ({ kind: 'disadvantage' as const, id })), sum };
  }

  it('caps the credited disadvantage AP at 80 when on; credits the full value when off', () => {
    const { entries, sum } = overCapEntries();
    expect(sum).toBeLessThan(-80);
    const capped = computeSpentAp(resolver.resolve(saveData({ homebrew: [], entries, capDisadvantageAp: true })));
    const full = computeSpentAp(resolver.resolve(saveData({ homebrew: [], entries, capDisadvantageAp: false })));
    // capped credits only 80; full credits |sum| → capped spends MORE by exactly the excess.
    expect(capped - full).toBe(Math.abs(sum) - 80);
  });

  it('warns (not errors) when over the cap, with wording that reflects the toggle', () => {
    const { entries } = overCapEntries();
    const cappedMsg = validation.validate(resolver.resolve(saveData({ homebrew: [], entries, capDisadvantageAp: true }))).find((r) => r.ruleId === 'disadvantage-ap-cap');
    const fullMsg = validation.validate(resolver.resolve(saveData({ homebrew: [], entries, capDisadvantageAp: false }))).find((r) => r.ruleId === 'disadvantage-ap-cap');
    expect(cappedMsg?.severity).toBe('warning');
    expect(cappedMsg?.message).toContain('nur 80 AP');
    expect(fullMsg?.severity).toBe('warning');
    expect(fullMsg?.message).toContain('volle Wert');
  });
});

describe('homebrew advantages/disadvantages fold into the adv/dis caps', () => {
  it('caps a homebrew disadvantage at −80 (with the toggle on) like catalog disadvantages', () => {
    const base = createEmptyCharacter();
    const capped = { ...base, capDisadvantageAp: true, homebrew: [{ id: 'd', kind: 'disadvantage' as const, label: 'HB', cost: -100 }] };
    const uncapped = { ...capped, capDisadvantageAp: false };
    // capped credits only 80 of the 100 → it spends 20 MORE than uncapped (which credits the full 100).
    expect(computeSpentAp(capped) - computeSpentAp(uncapped)).toBe(20);
  });

  it('a homebrew advantage still counts at full AP toward the spent total', () => {
    const base = createEmptyCharacter();
    const withHb = { ...base, homebrew: [{ id: 'a', kind: 'advantage' as const, label: 'HB', cost: 30 }] };
    expect(computeSpentAp(withHb) - computeSpentAp(base)).toBe(30);
  });

  it('homebrew special-ability kinds count at full AP (no cap; not folded into the −80 clamp)', () => {
    const base = createEmptyCharacter();
    const combat = { ...base, homebrew: [{ id: 's', kind: 'combatSpecialAbility' as const, label: 'HB-SF', cost: 20 }] };
    expect(computeSpentAp(combat) - computeSpentAp(base)).toBe(20);
  });
});

describe('per-sense cost — Eingeschränkter / Herausragender Sinn', () => {
  it('each sense instance resolves to its own AP value (not the flat base)', () => {
    expect(resolveAdvantageByName('eingeschrankterSinn_sicht', DISADVANTAGE)?.cost).toBe(-15);
    expect(resolveAdvantageByName('eingeschrankterSinn_gehoer', DISADVANTAGE)?.cost).toBe(-10);
    expect(resolveAdvantageByName('eingeschrankterSinn_geruchgeschmack', DISADVANTAGE)?.cost).toBe(-6);
    expect(resolveAdvantageByName('eingeschrankterSinn_tastsinn', DISADVANTAGE)?.cost).toBe(-2);
    expect(resolveAdvantageByName('herausragenderSinn_sicht', ADVANTAGE)?.cost).toBe(12);
    expect(resolveAdvantageByName('herausragenderSinn_tastsinn', ADVANTAGE)?.cost).toBe(2);
  });
});

describe('tradition-artifact binding — permanent AsP loss + buy-back AP', () => {
  const resolver = new CharacterResolverService();

  it('buying back AsP/KaP costs 2 AP per point', () => {
    const base = createEmptyCharacter();
    const before = computeSpentAp(base);
    const c = { ...base, derived: { ...base.derived, astralPoints: { ...base.derived.astralPoints, boughtBack: 3 }, karmaPoints: { ...base.derived.karmaPoints, boughtBack: 2 } } };
    expect(computeSpentAp(c)).toBe(before + (3 + 2) * 2);
  });

  it('an activated artifact binding lowers max AsP by its pAsP (additive loss)', () => {
    const caster = { ...createEmptyCharacter(), entries: [{ kind: 'advantage' as const, id: 'zauberer' }], magicTradition: 'Gildenmagier', magicGuidingAttribute: 'KL' };
    caster.attributes = { ...caster.attributes, sagacity: 14 };
    const noBind = recomputeDerivedStats(caster);
    const withBind = recomputeDerivedStats({ ...caster, entries: [...caster.entries, { kind: 'specialAbility', id: 'bindungderwaffeaktivieren' }] });
    expect(noBind.astralPoints.max - withBind.astralPoints.max).toBe(2);
  });

  it('a profession granting a binding auto-buys-back its pAsP (max AsP unchanged; buy-back AP counted)', () => {
    const state = new CharacterStateService();
    state.character.set(resolver.resolve(saveData({ homebrew: [], entries: [] })));
    state.applyProfession(ALL_PROFESSIONS.find((p) => p.name === 'artefaktmagierin')!);
    const asp = state.character()!.derived.astralPoints;
    expect(asp.boughtBack).toBeGreaterThan(0); // the binding's pAsP was bought back by the package
    expect(asp.max).toBe(asp.base + asp.bonus + asp.bought); // net loss 0 → max unchanged
  });
});
