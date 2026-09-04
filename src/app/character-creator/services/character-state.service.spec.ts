import { CharacterStateService } from './character-state.service';
import { Attribute, createEmptyCharacter } from '../models/base-creation.model';
import { Advantage } from '../models/advantage.model';
import { createEmptyMagicRow } from '../models/magic-row.model';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { ALL_CULTURES } from '../constants/culture.const';
import { ATTR_KEY } from '../utils/derived-stats.util';

describe('CharacterStateService — canonical entries sync', () => {
  function service(): CharacterStateService {
    const svc = new CharacterStateService();
    svc.character.set(createEmptyCharacter());
    return svc;
  }

  it('projects advantage changes into the canonical entries list', () => {
    const svc = service();
    svc.updateAdvantages(() => [{ name: 'zauberer', label: 'Zauberer', cost: 25 } as Advantage]);
    expect(svc.character()!.entries).toEqual([{ kind: 'advantage', id: 'zauberer' }]);
  });

  it('projects special-ability changes (with param + granted) into entries', () => {
    const svc = service();
    svc.updateSpecialAbilities('general', () => [{ name: 'ortskenntnis', param: 'Gareth', granted: true }]);
    expect(svc.character()!.entries).toEqual([{ kind: 'specialAbility', id: 'ortskenntnis', options: [{ key: 'param', id: 'Gareth' }], granted: true }]);
  });

  it('keeps entries in sync across advantages and SAs together', () => {
    const svc = service();
    svc.updateAdvantages(() => [{ name: 'zauberer', label: 'Zauberer', cost: 25 } as Advantage]);
    svc.updateDisadvantages(() => [{ name: 'arm', label: 'Arm', cost: -10, lvl: 1 } as Advantage]);
    const kinds = svc.character()!.entries.map((e) => e.kind);
    expect(kinds).toEqual(['advantage', 'disadvantage']);
  });
});

describe('CharacterStateService — free Ortskenntnis town round-trips through the input', () => {
  const svc = () => {
    const s = new CharacterStateService();
    s.character.set(createEmptyCharacter());
    return s;
  };
  const granted = (s: CharacterStateService) => s.picks().specialAbilities.general.find((x) => x.name === 'ortskenntnis' && x.granted);
  // What the culture step's two-way bound getter reads. A blank param is dropped on the way into the
  // canonical entries, so it comes back as undefined — both mean "no town yet".
  const town = (s: CharacterStateService) => granted(s)?.param ?? '';

  it('keeps the granted SA when the town is cleared, and the field stays empty', () => {
    const s = svc();
    s.setOrtskenntnisTowns(['Gareth']);
    s.setOrtskenntnisTowns(['']); // user deleted the last character
    // Dropping the entry here is what made the culture step fall back to its "Heimatort" hint and
    // write it back into the field — and it silently forfeited the culture's free Ortskenntnis.
    expect(granted(s)).toBeTruthy();
    expect(town(s)).toBe('');
  });

  it('stores the town exactly as typed so a trailing space is not swallowed mid-word', () => {
    const s = svc();
    s.setOrtskenntnisTowns(['Neue ']); // mid-typing "Neue Stadt"
    expect(town(s)).toBe('Neue '); // trimming here would write "Neue" back into the input
  });

  it('seeds a blank town on applyCulture instead of the "Heimatort" placeholder text', () => {
    const andergaster = ALL_CULTURES.find((c) => c.name === 'andergaster');
    expect(andergaster).toBeTruthy();

    const s = svc();
    s.applyCulture(andergaster!);
    expect(granted(s)).toBeTruthy();
    expect(town(s)).toBe('');
  });

  it('does not overwrite a town the player already entered when the culture is re-applied', () => {
    const andergaster = ALL_CULTURES.find((c) => c.name === 'andergaster');
    const aranier = ALL_CULTURES.find((c) => c.name === 'aranier');
    expect(andergaster && aranier).toBeTruthy();

    const s = svc();
    s.applyCulture(andergaster!);
    s.setOrtskenntnisTowns(['Havena']);
    s.applyCulture(aranier!);
    expect(town(s)).toBe('Havena');
  });
});

describe('CharacterStateService — social status defaults to "Frei", never to the culture list', () => {
  const svc = () => {
    const s = new CharacterStateService();
    s.character.set(createEmptyCharacter());
    return s;
  };

  it('does not make the hero nobility just because the culture offers "Adel"', () => {
    // culture.socialStatus lists the tiers a culture ADDITIONALLY offers; andergaster has Adel+Unfrei.
    const andergaster = ALL_CULTURES.find((c) => c.name === 'andergaster');
    expect(andergaster!.socialStatus).toContain('Adel');

    const s = svc();
    s.applyCulture(andergaster!);
    expect(s.character()!.bio.socialStatus).toBe('Frei'); // was 'Adel' (culture.socialStatus[0])
  });

  it('keeps a status the player picked when the culture changes', () => {
    const andergaster = ALL_CULTURES.find((c) => c.name === 'andergaster');
    const aranier = ALL_CULTURES.find((c) => c.name === 'aranier');
    expect(andergaster && aranier).toBeTruthy();

    const s = svc();
    s.applyCulture(andergaster!);
    s.updateBio({ socialStatus: 'Adel' });
    s.applyCulture(aranier!);
    expect(s.character()!.bio.socialStatus).toBe('Adel');
  });

  it('defaults cultures that list no extra tier to "Frei" as well', () => {
    const plain = ALL_CULTURES.find((c) => c.socialStatus.length === 0);
    expect(plain).toBeTruthy(); // 15 of the 45 cultures list nothing — they were left blank before

    const s = svc();
    s.applyCulture(plain!);
    expect(s.character()!.bio.socialStatus).toBe('Frei');
  });
});

describe('CharacterStateService — profession SA grants (kind-aware resolution)', () => {
  it('resolves a magic "Tradition (Gildenmagier)" grant to the magic SF, not the karmal placeholder', () => {
    const svc = new CharacterStateService();
    svc.character.set(createEmptyCharacter());
    const prof = ALL_PROFESSIONS.find((p) => p.name === 'gildenlosermagierinolporthallederwindekapermagierin');
    expect(prof).toBeTruthy();

    svc.applyProfession(prof!);
    const sa = svc.picks().specialAbilities;
    // The grant { label:'Tradition', param:'Gildenmagier' } resolves to the specific MAGIC tradition SF …
    expect(sa.magic.some((r) => r.name === 'traditiongildenmagier')).toBe(true);
    // … and the karmal "Tradition" placeholder (name 'tradition', requires Geweihter) is nowhere.
    const all = [...sa.general, ...sa.combat, ...sa.magic, ...sa.karmal];
    expect(all.some((r) => r.name === 'tradition')).toBe(false);
  });

  it('resolves a karmal "Tradition (Boronkirche)" grant to the karmal SF in the karmal bucket', () => {
    const svc = new CharacterStateService();
    svc.character.set(createEmptyCharacter());
    const prof = ALL_PROFESSIONS.find((p) => p.name === 'borongeweihter');
    expect(prof).toBeTruthy();

    svc.applyProfession(prof!);
    const sa = svc.picks().specialAbilities;
    // Karmal grant { label:'Tradition', param:'Boronkirche' } → specific karmal tradition SF (KarmalTradition) …
    expect(sa.karmal.some((r) => r.name === 'traditionBoronkirche')).toBe(true);
    // … in the karmal bucket, NOT mis-bucketed into magic.
    expect(sa.magic.some((r) => r.name === 'traditionBoronkirche')).toBe(false);
  });
});

describe('CharacterStateService — applyProfession replaces (no accumulation) + attribute minima', () => {
  const svc = () => {
    const s = new CharacterStateService();
    s.character.set(createEmptyCharacter());
    return s;
  };
  const allSaNames = (s: CharacterStateService): string[] => {
    const sa = s.picks().specialAbilities;
    return [...sa.general, ...sa.combat, ...sa.magic, ...sa.karmal].map((r) => r.name);
  };

  it('switching professions REMOVES the previous profession\'s grants (was: accumulated all of them)', () => {
    const boron = ALL_PROFESSIONS.find((p) => p.name === 'borongeweihter');
    const magier = ALL_PROFESSIONS.find((p) => p.name === 'gildenlosermagierinolporthallederwindekapermagierin');
    expect(boron && magier).toBeTruthy();

    const s = svc();
    s.applyProfession(boron!);
    expect(allSaNames(s)).toContain('traditionBoronkirche'); // sanity: first profession's grant applied

    s.applyProfession(magier!);
    expect(allSaNames(s)).toContain('traditiongildenmagier'); // new profession's grant present …
    expect(allSaNames(s)).not.toContain('traditionBoronkirche'); // … and the previous one is gone (no pile-up)
  });

  it('maps a Fertigkeitsspezialisierung grant param ("Etikette: Gebiet") to the selection option name (talent label)', () => {
    const prof = ALL_PROFESSIONS.find((p) => p.name === 'adligerderminiwatu');
    expect(prof).toBeTruthy();

    const s = svc();
    s.applyProfession(prof!);
    const spez = s.picks().specialAbilities.general.find((r) => r.name === 'fertigkeitsspezialisierung');
    expect(spez).toBeTruthy();
    // The raw grant param is "Etikette: Gebiet"; GruppeArray options use the talent LABEL as their `name`
    // (so `selectedTalent` and the SF-factor cost lookup match the chosen param), so it maps to "Etikette".
    expect(spez!.param).toBe('Etikette');
  });

  it('raises attributes to the profession\'s required minima (so granted SF prereqs are met)', () => {
    const CODES = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'];
    const prof = ALL_PROFESSIONS.find((p) => p.attributeRequirements.some((r) => CODES.includes(r.attribute)));
    expect(prof).toBeTruthy();

    const s = svc(); // fresh character → all attributes at the 8 default
    s.applyProfession(prof!);
    const attrs = s.character()!.attributes;
    for (const req of prof!.attributeRequirements) {
      const key = ATTR_KEY[req.attribute as Attribute];
      if (key) expect(attrs[key]).toBeGreaterThanOrEqual(req.min);
    }
  });
});

describe('CharacterStateService — culture/profession switching keeps data consistent', () => {
  const svc = () => {
    const s = new CharacterStateService();
    s.character.set(createEmptyCharacter());
    return s;
  };
  const skillNames = (s: CharacterStateService): string[] => Object.values(s.character()!.skills).flat().map((x) => x.name);

  it('changing culture AFTER a profession keeps the profession skills (culture skills are re-layered, not replaced)', () => {
    const andergaster = ALL_CULTURES.find((c) => c.name === 'andergaster');
    const aranier = ALL_CULTURES.find((c) => c.name === 'aranier');
    const akrobat = ALL_PROFESSIONS.find((p) => p.name === 'akrobatin'); // profane, grants Gaukeleien +7
    expect(andergaster && aranier && akrobat).toBeTruthy();

    const s = svc();
    s.applyCulture(andergaster!);
    s.applyProfession(akrobat!);
    expect(skillNames(s)).toContain('Gaukeleien'); // sanity: profession skill applied

    s.applyCulture(aranier!); // switch culture
    expect(skillNames(s)).toContain('Gaukeleien'); // profession skill STILL there (was dropped before the fix)
    expect(skillNames(s)).not.toContain('Holzbearbeitung'); // and the OLD culture's package skill is gone
  });

  it('switching from a magic profession to a profane one clears the orphaned magic data', () => {
    const magier = ALL_PROFESSIONS.find((p) => p.name === 'gildenlosermagierinolporthallederwindekapermagierin');
    const akrobat = ALL_PROFESSIONS.find((p) => p.name === 'akrobatin');
    expect(magier && akrobat).toBeTruthy();

    const s = svc();
    s.applyProfession(magier!);
    expect(s.isZauberer()).toBe(true); // magic profession grants the Zauberer advantage
    expect(s.character()!.magicTradition).toBeTruthy(); // + a magic tradition
    expect(s.character()!.spells.length).toBeGreaterThan(0); // + starting spells

    s.applyProfession(akrobat!); // → profane
    expect(s.isZauberer()).toBe(false); // Zauberer grant removed …
    expect(s.character()!.magicTradition).toBeUndefined(); // … so commit() cleared the orphaned magic data
    expect(s.character()!.spells).toEqual([]);
    expect(s.picks().specialAbilities.magic.length).toBe(0);
  });
});

describe('CharacterStateService — commit() recompute invariant (K2)', () => {
  function service(): CharacterStateService {
    const svc = new CharacterStateService();
    svc.character.set(createEmptyCharacter());
    return svc;
  }

  it('updateSpecialAbilities recomputes derived stats (the former drift: it skipped recompute)', () => {
    const svc = service();
    svc.setAttribute('constitution', 12); // LeP base = 0 + 2×KO = 24
    const correctLp = svc.character()!.derived.lifePoints.base;
    expect(correctLp).toBe(24);

    // Simulate a stale/drifted derived value, then run an SA mutation that previously did NOT recompute.
    svc.character.update((c) => (c ? { ...c, derived: { ...c.derived, lifePoints: { ...c.derived.lifePoints, base: -1 } } } : c));
    svc.updateSpecialAbilities('general', (list) => list); // no-op pick change — must still recompute

    expect(svc.character()!.derived.lifePoints.base).toBe(correctLp);
  });

  it('an unrelated mutator (updateBio) also heals drift, proving every mutation routes through commit()', () => {
    const svc = service();
    svc.setAttribute('constitution', 11); // LeP base = 22
    const correctLp = svc.character()!.derived.lifePoints.base;

    svc.character.update((c) => (c ? { ...c, derived: { ...c.derived, lifePoints: { ...c.derived.lifePoints, base: 999 } } } : c));
    svc.updateBio({ name: 'Healed' });

    expect(svc.character()!.derived.lifePoints.base).toBe(correctLp);
    expect(svc.character()!.bio.name).toBe('Healed');
  });

  it('permanentLost lowers max; boughtBack restores it; Zukauf raises it independently', () => {
    const svc = service();
    svc.setAttribute('constitution', 12); // LeP base 24, max 24
    const before = svc.character()!.derived.lifePoints.max;
    expect(before).toBe(24);

    svc.updateDerived('lifePoints', 'permanentLost', 3);
    expect(svc.character()!.derived.lifePoints.max).toBe(before - 3); // 21

    svc.updateDerived('lifePoints', 'boughtBack', 3); // buy back the lost points → restored
    expect(svc.character()!.derived.lifePoints.max).toBe(before); // 24

    svc.updateDerived('lifePoints', 'bought', 2); // Zukauf stacks on top
    expect(svc.character()!.derived.lifePoints.max).toBe(before + 2); // 26
  });

  it('boughtBack is capped at permanentLost (no over-restore)', () => {
    const svc = service();
    svc.setAttribute('constitution', 12); // max 24
    const before = svc.character()!.derived.lifePoints.max;

    svc.updateDerived('lifePoints', 'permanentLost', 2);
    svc.updateDerived('lifePoints', 'boughtBack', 5); // more than lost → clamped to 2
    expect(svc.character()!.derived.lifePoints.max).toBe(before); // restored, never above
  });

  it('clears orphaned magic data (spells/cantrips/tradition) when Zauberer is removed', () => {
    const svc = service();
    svc.updateAdvantages(() => [{ name: 'zauberer', label: 'Zauberer', cost: 25 } as Advantage]);
    svc.updateSpells(() => [{ ...createEmptyMagicRow(), spellName: 'Fulminictus', fw: 6 }]);
    svc.updateCantrips(() => ['Bann des Eisens']);
    svc.patchCharacter({ magicTradition: 'Gildenmagier', magicGuidingAttribute: 'KL' });
    expect(svc.character()!.spells.length).toBe(1); // sanity: data present while a caster

    svc.updateAdvantages((list) => list.filter((a) => a.name !== 'zauberer')); // remove Zauberer

    const c = svc.character()!;
    expect(c.spells).toEqual([]);
    expect(c.cantrips).toEqual([]);
    expect(c.magicTradition).toBeUndefined();
    expect(c.magicGuidingAttribute).toBeUndefined();
  });
});
