import { computeRoutine } from './utils';

describe('computeRoutine (DSA5 routine + optional attribute rule)', () => {
  it('returns "-" for FW 0', () => {
    expect(computeRoutine(0, [14, 14, 14])).toBe('-');
  });

  it('maps effective FW to the hardest routinable modifier (all attrs >= 13)', () => {
    expect(computeRoutine(1, [13, 13, 13])).toBe('+3');
    expect(computeRoutine(7, [13, 13, 13])).toBe('+1');
    expect(computeRoutine(11, [13, 13, 13])).toBe('±0'); // rulebook Geron example
    expect(computeRoutine(13, [13, 13, 13])).toBe('-1');
    expect(computeRoutine(16, [13, 13, 13])).toBe('-2');
    expect(computeRoutine(19, [13, 13, 13])).toBe('-3');
  });

  it('optional rule: each attribute point below 13 raises the required FW by 3', () => {
    // rulebook example: two 13s + one 12 (deficit 1) with FW 10 → eff 7 → routine at +1
    expect(computeRoutine(10, [13, 13, 12])).toBe('+1');
    // deficit big enough to push eff < 1 → no routine
    expect(computeRoutine(3, [10, 13, 13])).toBe('-');
  });
});
