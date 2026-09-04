import { buildPrerequisite, prerequisiteConfidenceOf } from './build-prerequisite';
import { Requirement } from '../models/requirement.model';
import { ALL_TALENTS } from '../constants/talent.const';

describe('buildPrerequisite (Requirement[] → id-based AST)', () => {
  // A real talent so label→slug resolution through the CatalogIndex is exercised.
  const talent = ALL_TALENTS[0];

  it('maps an attribute threshold', () => {
    expect(buildPrerequisite([{ type: 'attribute', name: 'GE', min: 15 }])).toEqual({ op: 'attr', attr: 'GE', min: 15 });
  });

  it('resolves a talent label to a value node with an EntryRef slug', () => {
    const ast = buildPrerequisite([{ type: 'talent', name: talent.label, min: 8 }]);
    expect(ast).toEqual({ op: 'value', ref: { kind: 'talent', id: talent.name }, min: 8 });
  });

  it('falls back to narrative when a value label does not resolve (never a false positive)', () => {
    const ast = buildPrerequisite([{ type: 'talent', name: '___not a talent___', min: 8, text: 'orig' }]);
    expect(ast).toEqual({ op: 'narrative', text: 'orig' });
  });

  it('wraps a forbidden reference in not()', () => {
    expect(buildPrerequisite([{ type: 'disadvantage', name: 'blind', forbidden: true }])).toEqual({
      op: 'not',
      child: { op: 'has', ref: { kind: 'disadvantage', id: 'blind' } },
    });
  });

  it('combines a shared group into an or()', () => {
    const reqs: Requirement[] = [
      { type: 'advantage', name: 'a', group: 1 },
      { type: 'advantage', name: 'b', group: 1 },
    ];
    expect(buildPrerequisite(reqs)).toEqual({
      op: 'or',
      any: [
        { op: 'has', ref: { kind: 'advantage', id: 'a' } },
        { op: 'has', ref: { kind: 'advantage', id: 'b' } },
      ],
    });
  });

  it('combines multiple ungrouped requirements into an and()', () => {
    const ast = buildPrerequisite([
      { type: 'attribute', name: 'KL', min: 13 },
      { type: 'caster' },
    ]);
    expect(ast).toEqual({ op: 'and', all: [{ op: 'attr', attr: 'KL', min: 13 }, { op: 'caster' }] });
  });

  it('maps talentCount to nOf', () => {
    const ast = buildPrerequisite([{ type: 'talentCount', count: 2, min: 10, names: [talent.label, '___nope___'] }]);
    expect(ast).toEqual({
      op: 'nOf',
      n: 2,
      any: [
        { op: 'value', ref: { kind: 'talent', id: talent.name }, min: 10 },
        { op: 'narrative', text: '___nope___' },
      ],
    });
  });

  it('gates a per-level requirement with atLevel', () => {
    expect(buildPrerequisite([{ type: 'attribute', name: 'GE', min: 17, atLevel: 3 }])).toEqual({
      op: 'atLevel',
      level: 3,
      then: { op: 'attr', attr: 'GE', min: 17 },
    });
  });

  it('returns undefined for no requirements', () => {
    expect(buildPrerequisite([])).toBeUndefined();
    expect(buildPrerequisite(undefined)).toBeUndefined();
  });

  describe('confidence', () => {
    it('structured when every leaf resolves', () => {
      expect(prerequisiteConfidenceOf([{ type: 'attribute', name: 'GE', min: 15 }])).toBe('structured');
    });
    it('narrative when every leaf is narrative', () => {
      expect(prerequisiteConfidenceOf([{ type: 'narrative', text: 'x' }])).toBe('narrative');
    });
    it('partial when some leaves are narrative', () => {
      const reqs: Requirement[] = [{ type: 'attribute', name: 'GE', min: 15 }, { type: 'narrative', text: 'x' }];
      expect(prerequisiteConfidenceOf(reqs)).toBe('partial');
    });
  });
});
