import { ExperienceLevelId } from '../models/experience-level.model';
import { SpeciesType } from '../models/species.model';
import { CharacterSaveData, createDefaultSaveData } from '../models/character-save.model';
import { createEmptyMagicRow } from '../models/magic-row.model';
import { createEmptyMeleeWeaponRow } from '../models/melee-weapon.model';
import { createEmptyShieldRow } from '../models/shield-row.model';
import { CharacterResolverService } from './character-resolver.service';
import { resolvePicks } from '../catalog/character-entries';

function sampleSaveData(): CharacterSaveData {
  const base = createDefaultSaveData();
  const spell = createEmptyMagicRow();
  spell.spellName = 'Fulminictus';
  spell.fw = 6;
  const melee = createEmptyMeleeWeaponRow();
  melee.weapon = 'Langschwert';
  melee.combatTechnique = 'Schwerter';
  melee.damage = '1W6+4';
  const shield = createEmptyShieldRow();
  shield.name = 'Holzschild';

  return {
    ...base,
    bio: { name: 'Alaric', family: 'von Gareth', age: '27', hairColor: 'braun' },
    experienceLevelId: ExperienceLevelId.Experienced,
    speciesType: SpeciesType.Human,
    profession: 'krieger',
    attributeChoices: [{ attribute: 'MU', modifier: 1 }],
    attributes: { MU: 13, KL: 11, IN: 12, CH: 10, FF: 11, GE: 13, KO: 14, KK: 15 },
    energies: {
      lifePoints: { bought: 2, current: 30, permanentLost: 0 },
      astralPoints: { bought: 0, current: 0, permanentLost: 0 },
      karmaPoints: { bought: 0, current: 0, permanentLost: 0 },
      fatePoints: { bought: 0, current: 3, permanentLost: 0 },
    },
    entries: [
      { kind: 'advantage', id: 'zauberer' },
      { kind: 'disadvantage', id: 'arm', level: 1 },
      { kind: 'specialAbility', id: 'ortskenntnis' }, // general (by catalog category)
      { kind: 'specialAbility', id: 'wuchtschlag' }, // combat (by catalog category)
    ],
    languages: [{ name: 'Garethi', lvl: 4 }],
    scripts: [{ name: 'Kusliker Zeichen' }],
    combatTechniques: { Schwerter: { ktw: 10 } },
    skills: {
      ...base.skills,
      physical: [{ name: 'Klettern', fw: 4, routine: '+/-0' }],
    },
    spells: [spell],
    cantrips: ['Bann des Eisens'],
    magicTradition: 'Gildenmagier',
    magicGuidingAttribute: 'KL',
    liturgies: [],
    blessings: [],
    homebrew: [
      { id: 'hb1', kind: 'specialAbility', label: 'Eigene SF', cost: 5, probe: 'MU/KL/IN', effectText: 'Tut etwas.' },
      { id: 'hb2', kind: 'advantage', label: 'Gestufter Vorteil', cost: 4, level: 3 },
    ],
    equipment: {
      ...base.equipment,
      closeCombat: [melee],
      shields: [shield],
    },
    currency: { ducats: 10, silverthalers: 5, haler: 0, kreutzer: 0, gems: 'Smaragd' },
    notes: 'Testheld',
  };
}

describe('CharacterResolverService round-trip', () => {
  const resolver = new CharacterResolverService();

  it('resolve(toSaveData(resolve(s))) yields an identical Character', () => {
    const c1 = resolver.resolve(sampleSaveData());
    const c2 = resolver.resolve(resolver.toSaveData(c1));
    expect(c2).toEqual(c1);
  });

  it('preserves stored pool current values through a round-trip', () => {
    const c1 = resolver.resolve(sampleSaveData());
    const s2 = resolver.toSaveData(c1);
    expect(s2.energies.lifePoints.current).toBe(c1.derived.lifePoints.current);
    expect(s2.energies.lifePoints.bought).toBe(2);
  });

  it('computes derived stats from base attributes (KaP/WS present)', () => {
    const c1 = resolver.resolve(sampleSaveData());
    // WS = round(KO/2) = round(14/2) = 7
    expect(c1.derived.woundThreshold.base).toBe(7);
    // Zauberer present, Gildenmagier + KL 11 → AsP base = 20 + Leiteigenschaft (KL) = 31
    expect(c1.derived.astralPoints.base).toBe(31);
    // KaP base 0 (no Geweihter)
    expect(c1.derived.karmaPoints.base).toBe(0);
  });

  it('preserves character-embedded homebrew through a round-trip and counts it in the AP budget', () => {
    const c1 = resolver.resolve(sampleSaveData());
    expect(c1.homebrew.map((h) => h.id)).toEqual(['hb1', 'hb2']);
    expect(c1.homebrew.find((h) => h.id === 'hb1')?.effectText).toBe('Tut etwas.');
    // round-trips back into the save unchanged
    expect(resolver.toSaveData(c1).homebrew).toEqual(sampleSaveData().homebrew);
    // homebrew adds to spent AP: hb1 (5 × 1) + hb2 (4 × 3, leveled) = 17
    const withoutHomebrew = resolver.resolve({ ...sampleSaveData(), homebrew: [] });
    expect(c1.ap.spent - withoutHomebrew.ap.spent).toBe(17);
  });

  it('maps the unified v3 entries[] back to advantages / disadvantages / SA buckets (via resolvePicks)', () => {
    const picks = resolvePicks(resolver.resolve(sampleSaveData()).entries);
    expect(picks.advantages.map((a) => a.name)).toContain('zauberer');
    expect(picks.disadvantages.map((a) => a.name)).toContain('arm');
    // SA bucket is re-derived from the catalog category (not stored in the entry).
    expect(picks.specialAbilities.general.some((s) => s.name === 'ortskenntnis')).toBe(true);
    expect(picks.specialAbilities.combat.some((s) => s.name === 'wuchtschlag')).toBe(true);
  });
});
