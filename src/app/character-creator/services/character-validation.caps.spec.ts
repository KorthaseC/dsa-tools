import { ExperienceLevelId } from '../models/experience-level.model';
import { SpeciesType } from '../models/species.model';
import { CharacterSaveData, createDefaultSaveData } from '../models/character-save.model';
import { createEmptyMagicRow, MagicRow } from '../models/magic-row.model';
import { ALL_SPECIES } from '../constants/species.const';
import { ADVANTAGE } from '../constants/advantage.const';
import { CharacterResolverService } from './character-resolver.service';
import { CharacterValidationService } from './character-validation.service';

// Experienced (Erfahren): maxAttribute 14, maxTalent 10, maxCombatTechnique 12, maxAttributePoints 100, maxSpells 12.
function spell(name: string, fw: number): MagicRow {
  const row = createEmptyMagicRow();
  row.spellName = name;
  row.fw = fw;
  return row;
}

function saveData(overrides: Partial<CharacterSaveData> = {}): CharacterSaveData {
  return {
    ...createDefaultSaveData(),
    experienceLevelId: ExperienceLevelId.Experienced,
    speciesType: SpeciesType.Human,
    attributes: { MU: 10, KL: 10, IN: 10, CH: 8, FF: 8, GE: 8, KO: 8, KK: 8 }, // sum 70 ≤ 100
    ...overrides,
  };
}

describe('CharacterValidationService — creation caps (K3)', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();
  const errs = (sd: CharacterSaveData, ruleId: string) =>
    validation.validate(resolver.resolve(sd)).filter((r) => r.ruleId === ruleId);

  it('flags a talent FW above maxTalent', () => {
    const sd = saveData({ skills: { ...createDefaultSaveData().skills, physical: [{ name: 'Klettern', fw: 15 }] } });
    const found = errs(sd, 'talent-max');
    expect(found.length).toBe(1);
    expect(found[0].message).toContain('Klettern');
  });

  it('flags a combat technique KTW above maxCombatTechnique', () => {
    const sd = saveData({ combatTechniques: { Schwerter: { ktw: 14 } } });
    const found = errs(sd, 'combat-technique-max');
    expect(found.length).toBe(1);
    expect(found[0].message).toContain('Schwerter');
  });

  it('flags a spell FW above maxTalent', () => {
    const sd = saveData({ spells: [spell('Fulminictus', 15)] });
    const found = errs(sd, 'spell-liturgy-max');
    expect(found.some((e) => e.message.includes('Fulminictus'))).toBe(true);
  });

  it('flags an attribute sum above maxAttributePoints', () => {
    // all 8 at 13 → sum 104 (> 100), each ≤ maxAttribute 14 so the per-attribute rule stays quiet
    const sd = saveData({ attributes: { MU: 13, KL: 13, IN: 13, CH: 13, FF: 13, GE: 13, KO: 13, KK: 13 } });
    expect(errs(sd, 'attribute-points').length).toBe(1);
    expect(errs(sd, 'attribute-max').length).toBe(0);
  });

  it('flags a spell count above maxSpells', () => {
    const spells = Array.from({ length: 13 }, (_, i) => spell(`Z${i}`, 4)); // 13 > maxSpells 12, each FW ok
    const found = errs(saveData({ spells }), 'spell-liturgy-max');
    expect(found.some((e) => e.source === 'spell-count')).toBe(true);
  });

  it('reports no cap violations for a within-limits character', () => {
    const sd = saveData({
      skills: { ...createDefaultSaveData().skills, physical: [{ name: 'Klettern', fw: 10 }] },
      combatTechniques: { Schwerter: { ktw: 12 } },
      spells: [spell('Fulminictus', 10)],
    });
    const capRules = ['attribute-points', 'talent-max', 'combat-technique-max', 'spell-liturgy-max'];
    const found = validation.validate(resolver.resolve(sd)).filter((r) => capRules.includes(r.ruleId));
    expect(found).toEqual([]);
  });

  // Regression: the cap rule summed the raw per-level `a.cost`, ignoring the level multiplier, so a
  // character over 80 only via LEVELED disadvantages (e.g. Verpflichtungen III) never got the warning.
  // Here level multipliers give -84 total; the un-multiplied base sum is only -48 (would stay silent).
  const overCapDisadvantages = [
    { kind: 'disadvantage' as const, id: 'verpflichtungen_orden', level: 3 }, // -10 × 3 = -30
    { kind: 'disadvantage' as const, id: 'angstVor_hoehe', level: 3 }, //        -8 × 3 = -24
    { kind: 'disadvantage' as const, id: 'lastigeMindergeister' }, //           -20
    { kind: 'disadvantage' as const, id: 'sensiblerGeruchssinn' }, //           -10
  ];

  it('fires the cap warning when LEVELED disadvantages push the total past 80 (level multiplier)', () => {
    const found = errs(saveData({ entries: overCapDisadvantages }), 'disadvantage-ap-cap');
    expect(found.length).toBe(1);
    expect(found[0].severity).toBe('warning');
    expect(found[0].message).toContain('84'); // -84 counted (with level multipliers), not -48
  });

  it('cap warning message reflects the capDisadvantageAp toggle', () => {
    const capped = errs(saveData({ capDisadvantageAp: true, entries: overCapDisadvantages }), 'disadvantage-ap-cap');
    expect(capped[0].message).toContain('nur 80 AP');
    const uncapped = errs(saveData({ capDisadvantageAp: false, entries: overCapDisadvantages }), 'disadvantage-ap-cap');
    expect(uncapped[0].message).toContain('deaktiviert');
  });
});

describe('CharacterValidationService — foreign spells (maxForeignSpells)', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();
  const foreignErrs = (sd: CharacterSaveData) =>
    validation.validate(resolver.resolve(sd)).filter((r) => r.ruleId === 'foreign-spell-max');

  // Inexperienced: maxForeignSpells 0. Ablativum ∈ {Gildenmagier}; Adlerauge ∉ {Gildenmagier}.
  it('flags a spell from a foreign tradition beyond the cap', () => {
    const sd = saveData({ experienceLevelId: ExperienceLevelId.Inexperienced, magicTradition: 'Gildenmagier', spells: [spell('Adlerauge', 4)] });
    expect(foreignErrs(sd).length).toBe(1);
  });

  it('does not flag an own-tradition spell', () => {
    const sd = saveData({ experienceLevelId: ExperienceLevelId.Inexperienced, magicTradition: 'Gildenmagier', spells: [spell('Ablativum', 4)] });
    expect(foreignErrs(sd)).toEqual([]);
  });

  it('stays silent when the caster tradition is unknown (no false positives)', () => {
    const sd = saveData({ experienceLevelId: ExperienceLevelId.Inexperienced, magicTradition: 'FreiErfundeneTradition', spells: [spell('Adlerauge', 4)] });
    expect(foreignErrs(sd)).toEqual([]);
  });
});

describe('CharacterValidationService — recommended species picks (hint)', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();

  it('warns for a not-chosen recommended advantage and clears it once chosen', () => {
    const species = ALL_SPECIES.find((s) => s.recommendedAdvantages.length > 0);
    expect(species).toBeTruthy();
    const ref = species!.recommendedAdvantages[0];
    const name = typeof ref === 'string' ? ref : ref.option ? `${ref.name}_${ref.option}` : ref.name;

    const without = resolver.resolve(saveData({ speciesType: species!.type, entries: [], homebrew: [] }));
    const recs = validation.validate(without).filter((r) => r.ruleId === 'recommended-selection');
    expect(recs.some((r) => r.source === name)).toBe(true);

    const withIt = resolver.resolve(saveData({ speciesType: species!.type, entries: [{ kind: 'advantage', id: name }], homebrew: [] }));
    const recs2 = validation.validate(withIt).filter((r) => r.ruleId === 'recommended-selection');
    expect(recs2.some((r) => r.source === name)).toBe(false);
  });
});

describe('CharacterValidationService — advantage incompatibility prerequisites', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();
  const reqErrs = (entries: CharacterSaveData['entries'], source: string) =>
    validation
      .validate(resolver.resolve(saveData({ entries, homebrew: [] })))
      .filter((r) => r.ruleId === 'requirement' && r.severity === 'error' && r.source === source);
  // All requirement errors regardless of source — for symmetric mutual-exclusion pairs, which are now
  // consolidated into a single "schließen sich gegenseitig aus" message (no per-owner source).
  const allReqErrs = (entries: CharacterSaveData['entries']) =>
    validation
      .validate(resolver.resolve(saveData({ entries, homebrew: [] })))
      .filter((r) => r.ruleId === 'requirement' && r.severity === 'error');
  // Only the consolidated mutual-exclusion messages (tolerant of the entries' own, unrelated prereqs).
  const mutualErrs = (entries: CharacterSaveData['entries']) =>
    allReqErrs(entries).filter((r) => r.message.includes('schließen sich gegenseitig aus'));

  it('flink and the disadvantage Behäbig are reported as one mutual-exclusion message', () => {
    const errs = mutualErrs([{ kind: 'advantage', id: 'flink' }, { kind: 'disadvantage', id: 'behabig' }]);
    expect(errs.length).toBe(1);
    expect(errs[0].message).toContain('Flink');
    expect(errs[0].message).toContain('Behäbig');
    expect(mutualErrs([{ kind: 'advantage', id: 'flink' }]).length).toBe(0);
  });

  it('entfernungssinn is blocked only by Eingeschränkter Sinn (Sicht), not another sense', () => {
    expect(reqErrs([{ kind: 'advantage', id: 'entfernungssinn' }, { kind: 'disadvantage', id: 'eingeschrankterSinn_sicht' }], 'entfernungssinn').length).toBe(1);
    expect(reqErrs([{ kind: 'advantage', id: 'entfernungssinn' }, { kind: 'disadvantage', id: 'eingeschrankterSinn_gehoer' }], 'entfernungssinn').length).toBe(0);
  });

  it('Begabung and Unfähig conflict only on the SAME sub-selection', () => {
    expect(reqErrs([{ kind: 'advantage', id: 'begabung_klettern' }, { kind: 'disadvantage', id: 'unfahig_klettern' }], 'begabung_klettern').length).toBe(1);
    expect(reqErrs([{ kind: 'advantage', id: 'begabung_klettern' }, { kind: 'disadvantage', id: 'unfahig_schwimmen' }], 'begabung_klettern').length).toBe(0);
  });

  it('Ahnenblut advantages are mutually exclusive (one consolidated message)', () => {
    expect(mutualErrs([{ kind: 'advantage', id: 'drachenblutahn' }, { kind: 'advantage', id: 'feenblutahn' }]).length).toBe(1);
    expect(mutualErrs([{ kind: 'advantage', id: 'drachenblutahn' }]).length).toBe(0);
  });

  it('plain "kein Nachteil X" exclusions fire for the whole batch (and only when the disadvantage is present)', () => {
    const pairs: [string, string][] = [
      ['giftresistenz', 'giftanfallig'],
      ['gluck', 'pech'],
      ['gutaussehend', 'hasslich'],
      ['gutergeschmack', 'schlechtergeschmack'],
      ['gutesnamensgedaechtnis', 'schlechtesnamensgedaechtnis'],
      ['hitzeresistenz', 'hitzeempfindlich'],
      ['hoheLebenskraft', 'niedrigeLebenskraft'],
      ['hoheSeelenkraft', 'niedrigeSeelenkraft'],
      ['hoheZahigkeit', 'niedrigeZahigkeit'],
      // proactive sweep additions
      ['eisern', 'glaesern'],
      ['immunitatGift', 'giftanfallig'],
      ['immunitatKrankheit', 'krankheitsanfallig'],
      ['kalteresistenz', 'kalteempfindlich'],
      ['krankheitsresistenz', 'krankheitsanfallig'],
      ['potent', 'impotent'],
      ['reich', 'arm'],
      ['treu', 'untreu'],
      ['verbesserteRegenerationLep', 'schlechteRegenerationLep'],
      ['einkommen', 'arm'],
      ['unscheinbar', 'koerperlicheauffaelligkeit'],
      ['angenehmerGeruch', 'raubtiergeruch'],
      ['wohlklang', 'sprachfehler'],
      ['zaherHund', 'zerbrechlich'],
      ['rahjagekuesst', 'frigide'],
      ['levthangekuesst', 'impotent'],
    ];
    for (const [adv, dis] of pairs) {
      expect(mutualErrs([{ kind: 'advantage', id: adv }, { kind: 'disadvantage', id: dis }]).length).withContext(`${adv} + ${dis}`).toBe(1);
      expect(mutualErrs([{ kind: 'advantage', id: adv }]).length).withContext(`${adv} alone`).toBe(0);
    }
  });

  it('herausragenderSinn conflicts with Eingeschränkter Sinn only on the same sense', () => {
    expect(reqErrs([{ kind: 'advantage', id: 'herausragenderSinn_sicht' }, { kind: 'disadvantage', id: 'eingeschrankterSinn_sicht' }], 'herausragenderSinn_sicht').length).toBe(1);
    expect(reqErrs([{ kind: 'advantage', id: 'herausragenderSinn_sicht' }, { kind: 'disadvantage', id: 'eingeschrankterSinn_gehoer' }], 'herausragenderSinn_sicht').length).toBe(0);
  });

  it('a Blut-Vorteil requires its ancestry (Ahn) advantage', () => {
    expect(reqErrs([{ kind: 'advantage', id: 'drachenblutvorteil' }], 'drachenblutvorteil').length).toBe(1); // ancestry missing
    expect(reqErrs([{ kind: 'advantage', id: 'drachenblutvorteil' }, { kind: 'advantage', id: 'drachenblutahn' }], 'drachenblutvorteil').length).toBe(0); // ancestry present
  });

  it('richtungssinn conflicts only with Unfähig (Orientierung), not another Unfähig talent', () => {
    expect(reqErrs([{ kind: 'advantage', id: 'richtungssinn' }, { kind: 'disadvantage', id: 'unfahig_orientierung' }], 'richtungssinn').length).toBe(1);
    expect(reqErrs([{ kind: 'advantage', id: 'richtungssinn' }, { kind: 'disadvantage', id: 'unfahig_klettern' }], 'richtungssinn').length).toBe(0);
  });

  it('resistenzgegengeschlechtskrankheiten and Krankheitsresistenz are mutually exclusive (consolidated)', () => {
    expect(mutualErrs([{ kind: 'advantage', id: 'resistenzgegengeschlechtskrankheiten' }, { kind: 'advantage', id: 'krankheitsresistenz' }]).length).toBe(1);
  });

  it('a mutual exclusion is reported once, not twice (no per-owner duplicate)', () => {
    const errs = allReqErrs([{ kind: 'advantage', id: 'gluck' }, { kind: 'disadvantage', id: 'pech' }]);
    expect(errs.length).toBe(1);
    expect(errs[0].message).toBe('„Glück" und „Pech" schließen sich gegenseitig aus');
  });

  it('schwerZuVerzaubern carries the curated exclusion of Zauberanfällig', () => {
    // schwerZuVerzaubern also has a grantedAdvantage prereq, so the per-owner requirement error can't
    // be isolated via reqErrs — assert the curated exclusion is present in the catalog data instead.
    const entry = ADVANTAGE.find((a) => a.name === 'schwerZuVerzaubern');
    expect(entry?.requirements?.some((r) => r.name === 'zauberanfallig' && r.forbidden)).toBe(true);
  });
});

describe('CharacterValidationService — species hint labels', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();

  it('auto/recommended species hints use display labels, not raw slugs', () => {
    const c = resolver.resolve(saveData({ speciesType: SpeciesType.Elf, entries: [], homebrew: [] }));
    const msgs = validation.validate(c).filter((r) => r.category === 'species').map((r) => r.message);
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs.some((m) => m.includes('Zauberer:in'))).toBe(true); // slug 'zauberer' → label "Zauberer:in"
    expect(msgs.some((m) => /„[a-zäöü]/.test(m))).toBe(false); // no quoted term starting lowercase (a slug)
    expect(msgs.some((m) => /„[^"]*_[^"]*"/.test(m))).toBe(false); // no base_option slug (e.g. unfahig_zechen)
  });
});

describe('CharacterValidationService — narrative prerequisites', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();

  it('surfaces a narrative advantage prerequisite (Basiliskentöter:in) as an info hint', () => {
    const c = resolver.resolve(saveData({ entries: [{ kind: 'advantage', id: 'basiliskentoeterin' }], homebrew: [] }));
    const infos = validation.validate(c).filter((r) => r.ruleId === 'requirement' && r.severity === 'info' && r.source === 'basiliskentoeterin');
    expect(infos.length).toBe(1);
  });
});

describe('CharacterValidationService — special-ability talent & Unfähig-subcategory prerequisites', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();
  const withSkills = (skills: Partial<CharacterSaveData['skills']>) => ({ ...createDefaultSaveData().skills, ...skills });
  // Requirement errors sourced on one entry (SA slug), for a fully-built save (skills + entries).
  const saReqErrs = (sd: CharacterSaveData, source: string) =>
    validation.validate(resolver.resolve(sd)).filter((r) => r.ruleId === 'requirement' && r.severity === 'error' && r.source === source);

  it('a talent-value requirement is checked against the actual talent FW (regression: value map key normalization)', () => {
    // abschleppspezialistin requires Betören 4.
    const withTalent = saveData({ skills: withSkills({ social: [{ name: 'Betören', fw: 4 }] }), entries: [{ kind: 'specialAbility', id: 'abschleppspezialistin' }], homebrew: [] });
    expect(saReqErrs(withTalent, 'abschleppspezialistin').length).toBe(0);
    const withoutTalent = saveData({ entries: [{ kind: 'specialAbility', id: 'abschleppspezialistin' }], homebrew: [] });
    expect(saReqErrs(withoutTalent, 'abschleppspezialistin').length).toBe(1);
  });

  it('a "kein Nachteil Unfähig (Talent)" exclusion is scoped to that talent only (regression: parenthesized option lost)', () => {
    // abrichter requires Tierkunde 8 and forbids Unfähig (Tierkunde).
    const base = { skills: withSkills({ nature: [{ name: 'Tierkunde', fw: 8 }] }), homebrew: [] };
    // talent satisfied, no Unfähig → no error
    expect(saReqErrs(saveData({ ...base, entries: [{ kind: 'specialAbility', id: 'abrichter' }] }), 'abrichter').length).toBe(0);
    // Unfähig (Tierkunde) → blocked
    expect(saReqErrs(saveData({ ...base, entries: [{ kind: 'specialAbility', id: 'abrichter' }, { kind: 'disadvantage', id: 'unfahig_tierkunde' }] }), 'abrichter').length).toBe(1);
    // Unfähig (Klettern) → different talent → NOT blocked
    expect(saReqErrs(saveData({ ...base, entries: [{ kind: 'specialAbility', id: 'abrichter' }, { kind: 'disadvantage', id: 'unfahig_klettern' }] }), 'abrichter').length).toBe(0);
  });

  it('a hand-curated SA (Akrobat:in) resolves "genannte Talente" to the named talents + per-talent Unfähig', () => {
    // akrobatin (CURATED_SA_REQ): Gaukeleien 4 + Körperbeherrschung 4, forbids Unfähig (Gaukeleien/Körperbeherrschung).
    const skills = withSkills({ physical: [{ name: 'Gaukeleien', fw: 4 }, { name: 'Körperbeherrschung', fw: 4 }] });
    expect(saReqErrs(saveData({ skills, entries: [{ kind: 'specialAbility', id: 'akrobatin' }], homebrew: [] }), 'akrobatin').length).toBe(0);
    // Unfähig (Gaukeleien) → blocked; a talent below 4 → blocked
    expect(saReqErrs(saveData({ skills, entries: [{ kind: 'specialAbility', id: 'akrobatin' }, { kind: 'disadvantage', id: 'unfahig_gaukeleien' }], homebrew: [] }), 'akrobatin').length).toBe(1);
    const lowSkill = withSkills({ physical: [{ name: 'Gaukeleien', fw: 4 }, { name: 'Körperbeherrschung', fw: 2 }] });
    expect(saReqErrs(saveData({ skills: lowSkill, entries: [{ kind: 'specialAbility', id: 'akrobatin' }], homebrew: [] }), 'akrobatin').length).toBe(1);
  });

  it('a special-ability prerequisite scoped to a chosen sub-option validates against the SA param (Iglubau)', () => {
    const skills = withSkills({ nature: [{ name: 'Wildnisleben', fw: 8 }] });
    const glk = (opt: string) => ({ kind: 'specialAbility' as const, id: 'gelaendekunde', options: [{ key: 'param', id: opt }] });
    // Geländekunde with the WRONG sub-option → Iglubau blocked
    expect(saReqErrs(saveData({ skills, entries: [{ kind: 'specialAbility', id: 'iglubau' }, glk('waldkundig')], homebrew: [] }), 'iglubau').length).toBe(1);
    // matching sub-option (Eis- und Schneekundig) → clean
    expect(saReqErrs(saveData({ skills, entries: [{ kind: 'specialAbility', id: 'iglubau' }, glk('eisundschneekundig')], homebrew: [] }), 'iglubau').length).toBe(0);
  });

  it('an ifOption prerequisite applies only to the matching chosen option (Heilungsspezialgebiet)', () => {
    const withHkw = (fw: number) => withSkills({ nature: [{ name: 'Heilkunde Wunden', fw }] });
    const hs = (opt: string) => ({ kind: 'specialAbility' as const, id: 'heilungsspezialgebiet', options: [{ key: 'param', id: opt }] });
    // Chirurgie needs Heilkunde Wunden 12: at 8 → blocked, at 12 → clean
    expect(saReqErrs(saveData({ skills: withHkw(8), entries: [hs('chirurgie')], homebrew: [] }), 'heilungsspezialgebiet').length).toBe(1);
    expect(saReqErrs(saveData({ skills: withHkw(12), entries: [hs('chirurgie')], homebrew: [] }), 'heilungsspezialgebiet').length).toBe(0);
    // Amputieren needs only 8 → clean at 8
    expect(saReqErrs(saveData({ skills: withHkw(8), entries: [hs('amputieren')], homebrew: [] }), 'heilungsspezialgebiet').length).toBe(0);
    // Zahnbehandlung has no prerequisite → clean even without the talent
    expect(saReqErrs(saveData({ skills: withSkills({}), entries: [hs('zahnbehandlung')], homebrew: [] }), 'heilungsspezialgebiet').length).toBe(0);
  });
});

describe('CharacterValidationService — homebrew counts toward the adv/dis caps', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();
  const errs = (sd: CharacterSaveData, ruleId: string) => validation.validate(resolver.resolve(sd)).filter((r) => r.ruleId === ruleId);

  it('counts a homebrew advantage toward the 80-AP advantage cap', () => {
    const found = errs(saveData({ homebrew: [{ id: 'a', kind: 'advantage', label: 'HB-Vorteil', cost: 90 }] }), 'advantage-ap-cap');
    expect(found.length).toBe(1);
    expect(found[0].message).toContain('Homebrew');
  });

  it('counts a homebrew disadvantage toward the −80 disadvantage cap warning', () => {
    const found = errs(saveData({ homebrew: [{ id: 'd', kind: 'disadvantage', label: 'HB-Nachteil', cost: -90 }] }), 'disadvantage-ap-cap');
    expect(found.length).toBe(1);
    expect(found[0].severity).toBe('warning');
  });
});

describe('CharacterValidationService — Ahnenblut option gating (Issue 1)', () => {
  const resolver = new CharacterResolverService();
  const validation = new CharacterValidationService();
  // Dickes Fell (Feenblut benefit) requires the ancestor type Großer Biestinger OR Satyr.
  const bloodErrs = (ancestor: string) =>
    validation
      .validate(resolver.resolve(saveData({ entries: [{ kind: 'advantage', id: `feenblutahn_${ancestor}` }, { kind: 'advantage', id: 'feenblutvorteil_dickesfell' }] })))
      .filter((r) => r.ruleId === 'ancestral-blood-option');

  it('flags a benefit whose chosen ancestor type is not allowed', () => {
    const found = bloodErrs('dryade'); // Dryade does not grant Dickes Fell
    expect(found.length).toBe(1);
    expect(found[0].message).toContain('Dickes Fell');
  });

  it('accepts the benefit when a required ancestor type is chosen', () => {
    expect(bloodErrs('grosserbiestinger').length).toBe(0);
    expect(bloodErrs('satyr').length).toBe(0);
  });
});
