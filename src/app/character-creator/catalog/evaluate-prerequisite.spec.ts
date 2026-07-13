import { EvalContext, PrereqOwner, evaluate } from './evaluate-prerequisite';
import { Prerequisite } from '../models/prerequisite.model';
import { EntryRef } from '../models/entry-kind';

function mockCtx(overrides: Partial<EvalContext> = {}): EvalContext {
  return {
    attr: () => 0,
    value: () => 0,
    has: () => false,
    granted: () => false,
    caster: false,
    priest: false,
    tradition: () => false,
    karmalTradition: false,
    leitTradition: 0,
    species: () => false,
    culture: () => false,
    cultureSocialStatus: () => false,
    language: () => false,
    script: false,
    style: () => false,
    aspectCount: () => false,
    merkmalCount: () => false,
    selectedSpell: () => false,
    selectedTalent: () => false,
    spellExtension: () => false,
    label: (ref: EntryRef) => ref.id,
    ...overrides,
  };
}

const owner: PrereqOwner = { label: 'X', level: 1 };
const byId = (m: Record<string, number>) => (ref: EntryRef) => m[ref.id] ?? 0;

describe('evaluate (id-based prerequisite engine)', () => {
  it('attr threshold passes/fails', () => {
    const ast: Prerequisite = { op: 'attr', attr: 'GE', min: 15 };
    expect(evaluate(ast, mockCtx({ attr: () => 15 }), owner).status).toBe('pass');
    expect(evaluate(ast, mockCtx({ attr: () => 14 }), owner).status).toBe('fail');
  });

  it('Herausragender Sinn (Sicht) + Blind → fail (not + has)', () => {
    const ast: Prerequisite = { op: 'not', child: { op: 'has', ref: { kind: 'disadvantage', id: 'blind' } } };
    expect(evaluate(ast, mockCtx({ has: (r) => r.id === 'blind' }), owner).status).toBe('fail');
    expect(evaluate(ast, mockCtx({ has: () => false }), owner).status).toBe('pass');
  });

  it('Finte level chain gates via atLevel', () => {
    const finteL2: Prerequisite = {
      op: 'atLevel',
      level: 2,
      then: { op: 'and', all: [
        { op: 'attr', attr: 'GE', min: 15 },
        { op: 'value', ref: { kind: 'specialAbility', id: 'finte' }, min: 1 },
      ] },
    };
    // level 1 → not yet applicable → pass
    expect(evaluate(finteL2, mockCtx({ attr: () => 13, value: () => 0 }), { label: 'Finte', level: 1 }).status).toBe('pass');
    // level 2 with GE 13 → fail
    expect(evaluate(finteL2, mockCtx({ attr: () => 13, value: () => 1 }), { label: 'Finte', level: 2 }).status).toBe('fail');
    // level 2 with GE 15 and Finte I → pass
    expect(evaluate(finteL2, mockCtx({ attr: () => 15, value: () => 1 }), { label: 'Finte', level: 2 }).status).toBe('pass');
  });

  it('Meister der Rauschmittel: and[value, value, nOf]', () => {
    const ast: Prerequisite = { op: 'and', all: [
      { op: 'value', ref: { kind: 'talent', id: 'alchimie' }, min: 12 },
      { op: 'value', ref: { kind: 'talent', id: 'heilkundegift' }, min: 10 },
      { op: 'nOf', n: 1, any: [
        { op: 'value', ref: { kind: 'talent', id: 'goetterkulte' }, min: 10 },
        { op: 'value', ref: { kind: 'talent', id: 'magiekunde' }, min: 10 },
      ] },
    ] };
    expect(evaluate(ast, mockCtx({ value: byId({ alchimie: 12, heilkundegift: 10, magiekunde: 10 }) }), owner).status).toBe('pass');
    expect(evaluate(ast, mockCtx({ value: byId({ alchimie: 12, heilkundegift: 10 }) }), owner).status).toBe('fail'); // nOf unmet
    expect(evaluate(ast, mockCtx({ value: byId({ alchimie: 11, heilkundegift: 10, magiekunde: 10 }) }), owner).status).toBe('fail'); // alchimie short
  });

  it('or() passes when any branch passes', () => {
    const ast: Prerequisite = { op: 'or', any: [
      { op: 'has', ref: { kind: 'advantage', id: 'a' } },
      { op: 'has', ref: { kind: 'advantage', id: 'b' } },
    ] };
    expect(evaluate(ast, mockCtx({ has: (r) => r.id === 'b' }), owner).status).toBe('pass');
    expect(evaluate(ast, mockCtx({ has: () => false }), owner).status).toBe('fail');
  });

  it('ifOption only applies when the owner picked the option', () => {
    const ast: Prerequisite = { op: 'ifOption', key: 'sense', option: 'sicht', then: { op: 'not', child: { op: 'has', ref: { kind: 'disadvantage', id: 'blind' } } } };
    const hasBlind = mockCtx({ has: (r) => r.id === 'blind' });
    expect(evaluate(ast, hasBlind, { label: 'X', level: 1, options: [{ key: 'sense', id: 'gehoer' }] }).status).toBe('pass'); // not Sicht → n/a
    expect(evaluate(ast, hasBlind, { label: 'X', level: 1, options: [{ key: 'sense', id: 'sicht' }] }).status).toBe('fail'); // Sicht + Blind
  });

  it('narrative → manual; and(pass, narrative) → manual', () => {
    expect(evaluate({ op: 'narrative', text: 'GM ruling' }, mockCtx(), owner)).toEqual({ status: 'manual', reasons: ['GM ruling'] });
    const ast: Prerequisite = { op: 'and', all: [{ op: 'caster' }, { op: 'narrative', text: 'note' }] };
    expect(evaluate(ast, mockCtx({ caster: true }), owner).status).toBe('manual');
  });

  it('and() fails (not manual) when a hard condition is unmet even if another is narrative', () => {
    const ast: Prerequisite = { op: 'and', all: [{ op: 'caster' }, { op: 'narrative', text: 'note' }] };
    expect(evaluate(ast, mockCtx({ caster: false }), owner).status).toBe('fail');
  });
});
