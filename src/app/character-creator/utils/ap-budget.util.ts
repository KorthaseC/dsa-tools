import { ALL_COMBAT_TECHNIQUES } from '../constants/combat-technique.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { ALL_TALENTS } from '../constants/talent.const';
import { resolvePicksForCharacter } from '../catalog/character-entries';
import { Attributes, Character, IncreaseFactor, SkillGroups, SpecialAbilityRef } from '../models/base-creation.model';
import { homebrewApCost, homebrewApCostOfKind } from '../models/homebrew.model';
import { SpecialAbility } from '../models/special-ability.model';
import { SF_INDEX, advantageCost, selectionOptionsFor, totalTalentCost } from './utils';

// Single source of truth for "AP spent". The per-slice cost helpers and computeSpentAp() below are
// the one place spend is computed; CharacterStateService.ap, CharacterResolverService.computeApBudget
// and the validation apBudgetRule all call computeSpentAp so the live budget, the resolved budget and
// the budget rule can never disagree.

// Improvement-factor lookups for costing the character's actual values (talents/combat/spells).
const asFactor = (f: string): IncreaseFactor => (['A', 'B', 'C', 'D', 'E'].includes(f) ? (f as IncreaseFactor) : IncreaseFactor.B);
const TALENT_FACTOR = new Map<string, IncreaseFactor>(ALL_TALENTS.map((t) => [t.name, t.increaseFactor]));
const CT_FACTOR = new Map<string, IncreaseFactor>(ALL_COMBAT_TECHNIQUES.map((ct) => [ct.name, ct.increaseFactor]));
const SPECIAL_ABILITY_MAP = new Map<string, SpecialAbility>(ALL_SPECIAL_ABILITIES.map((s) => [s.name, s]));

/** AP spent on the 8 base attributes (15/pt above 8). */
export function attributeApCost(a: Attributes): number {
  return [a.courage, a.sagacity, a.intuition, a.charisma, a.dexterity, a.agility, a.constitution, a.strength].reduce(
    (sum, v) => sum + totalTalentCost(v, IncreaseFactor.E, false, true),
    0
  );
}

/** Sum of talent (skill) AP from FW 0 to each skill's value. */
export function skillsApCost(skills: SkillGroups): number {
  return Object.values(skills)
    .flat()
    .reduce((sum, s) => sum + totalTalentCost(s.fw, TALENT_FACTOR.get(s.name) ?? IncreaseFactor.B), 0);
}

/** Sum of combat-technique AP from base KTW 6 to each technique's value. */
export function combatTechniqueApCost(cts: Record<string, { ktw: number }>): number {
  return Object.entries(cts).reduce((sum, [name, ct]) => {
    const f = CT_FACTOR.get(name) ?? IncreaseFactor.B;
    return sum + (totalTalentCost(ct.ktw, f) - totalTalentCost(6, f));
  }, 0);
}

/** Sum of spell/liturgy AP (activation + FW), each via its Steigerungsfaktor. */
export function magicRowsApCost(rows: { fw: number; increaseFactor: string }[]): number {
  return rows.reduce((sum, r) => sum + totalTalentCost(r.fw, asFactor(r.increaseFactor), true), 0);
}

/** Effective AP cost of a single special ability / language / script ref. */
export function specialAbilityCost(ref: SpecialAbilityRef & { mother?: boolean }): number {
  if (ref.granted || ref.mother) return 0; // culture-granted SAs / Muttersprache → free (wins over override)
  if (ref.costOverride != null) return ref.costOverride; // character-local total-AP override (GM ruling)
  const sa = SPECIAL_ABILITY_MAP.get(ref.name);
  if (!sa) return 0;
  // SF-priced SFs (Lieblingszauber "3/12", Adaption "5/20", …): `cost` is per-Steigerungsfaktor-point;
  // effective = cost × the chosen option's SF-index (A=1…E=5). Before an option is picked → base (×1).
  if (sa.costBySteigerungsfaktor) {
    const opt = ref.param ? selectionOptionsFor(sa).find((o) => o.name === ref.param) : undefined;
    return sa.cost * (opt?.factor ? SF_INDEX[opt.factor] ?? 1 : 1);
  }
  const leveled = sa.maxLvl != null && sa.maxLvl > 1;
  if (!leveled) return sa.cost;
  const lvl = ref.lvl ?? 1;
  // Tiered SFs (Finte 15/20/25, Wuchtschlag, Präziser Schuss …) are bought per tier and each tier
  // requires the previous, so the total is the SUM of the per-tier costs up to the chosen level.
  if (sa.costLevels?.length) return sa.costLevels.slice(0, Math.max(1, Math.min(lvl, sa.costLevels.length))).reduce((s, c) => s + c, 0);
  return sa.cost * lvl;
}

/** DSA5: every Zaubertrick (cantrip) and every Segnung (blessing) costs a flat 1 AP. */
export const CANTRIP_AP = 1;
export const BLESSING_AP = 1;
/** DSA5: buying back a permanently-lost AsP/KaP point costs 2 AP. */
export const BUYBACK_AP_PER_POINT = 2;

/**
 * Total AP a character has spent across every cost-bearing slice: species + advantages + disadvantages
 * + special abilities + languages/scripts + attributes + talents + combat techniques + spells/liturgies
 * + cantrips + blessings + homebrew. Mandatory/granted picks are free. This is the canonical "spent" figure.
 */
export function computeSpentAp(character: Character): number {
  const picks = resolvePicksForCharacter(character);
  const advCost = picks.advantages.reduce((sum, a) => sum + (a.mandatory ? 0 : advantageCost(a)), 0);
  // Disadvantages GAIN AP (negative cost). DSA5 caps the gain at 80; when `capDisadvantageAp` is on
  // (default), clamp the refund to −80 so excess disadvantages give no further AP. Off → full value.
  // Homebrew disadvantages fold into the SAME clamp as catalog ones (so they can't exceed −80 either).
  const hbDis = homebrewApCostOfKind(character.homebrew, 'disadvantage'); // negative AP
  const disRaw = picks.disadvantages.reduce((sum, a) => sum + (a.mandatory ? 0 : advantageCost(a)), 0) + hbDis;
  const disCost = (character.capDisadvantageAp ?? true) ? Math.max(disRaw, -80) : disRaw;
  const sa = picks.specialAbilities;
  const saCost = [...sa.general, ...sa.combat, ...sa.magic, ...sa.karmal].reduce((sum, r) => sum + specialAbilityCost(r), 0);
  const langCost = character.languages.reduce((sum, l) => sum + specialAbilityCost(l), 0) + character.scripts.reduce((sum, s) => sum + specialAbilityCost(s), 0);
  const attrCost = attributeApCost(character.attributes);
  const skillCost = skillsApCost(character.skills);
  const combatCost = combatTechniqueApCost(character.combatTechniques);
  const spellCost = magicRowsApCost(character.spells) + magicRowsApCost(character.liturgies);
  const cantripCost = character.cantrips.length * CANTRIP_AP;
  const blessingCost = character.blessings.length * BLESSING_AP;
  // Buying back permanently-lost AsP/KaP (e.g. from bound tradition artifacts) costs 2 AP per point.
  const buyBackCost = ((character.derived.astralPoints.boughtBack ?? 0) + (character.derived.karmaPoints.boughtBack ?? 0)) * BUYBACK_AP_PER_POINT;
  // Homebrew advantages + SF + other at full AP (disadvantages already folded into disCost above).
  const homebrewRest = homebrewApCost(character.homebrew) - hbDis;
  return character.speciesCost + advCost + disCost + saCost + langCost + attrCost + skillCost + combatCost + spellCost + cantripCost + blessingCost + buyBackCost + homebrewRest;
}
