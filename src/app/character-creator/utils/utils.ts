import { IncreaseFactor } from "../models/base-creation.model";

export function totalTalentCost(
  value: number,
  factor: keyof typeof IncreaseFactor,
  needActivation = false,
  isAttribute = false
): number {
  if (value < 0 || value === 0 && !needActivation) return 0;

  const base = IncreaseFactor[factor];
  let cost = 0;

  for (let i = 1; i <= value; i++) {
    if (isAttribute && i <= 8) continue;

    if (factor === 'E') {
      if (isAttribute || needActivation) {
        if (i <= 14) {
          cost += 15;
        } else {
          cost += 15 * (i - 13); // 15→30→45...
        }
      }
    } else {
      if (i <= 12) {
        cost += base;
      } else {
        cost += base * (i - 11); // from 13: increasing
      }
    }
  }

  // only for magic or liturgy
  if (needActivation && factor !== 'E') {
    cost += base;
  }

  return cost;
}
