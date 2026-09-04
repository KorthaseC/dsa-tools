import { Attribute } from '../models/base-creation.model';
import { EntryRef } from '../models/entry-kind';
import { Prerequisite } from '../models/prerequisite.model';

// The generic, pure prerequisite evaluator. Walks the id-based Prerequisite AST against an
// EvalContext (all character lookups, built once per character) and returns pass / fail / manual.
// "manual" = a narrative condition that can't be machine-checked → surfaced to the user, never a
// hard error. The evaluator never touches the catalog directly: every lookup goes through ctx, so
// it is trivially unit-testable with a mock context.

export type EvalStatus = 'pass' | 'fail' | 'manual';

export interface EvalResult {
  status: EvalStatus;
  /** Human-readable reasons for a fail (unmet conditions) or manual (narrative texts). */
  reasons: string[];
}

/** The owning entry's own state that some conditions are relative to. */
export interface PrereqOwner {
  label: string;
  level: number;
  param?: string; // the chosen aspect / Merkmal / spell (SpecialAbilityRef.param today)
  options?: { key: string; id: string }[]; // chosen sub-options, for ifOption
  /** Which repeat of the same pick this is (1-based), when an entry may be taken several times for
   *  the same target and the threshold rises with each one: the Nth Fertigkeitsspezialisierung in a
   *  talent needs FW ≥ 6 × N. Absent ⇒ treated as the first. */
  ordinal?: number;
}

/** All character-side lookups the evaluator needs; built once per character (see build-eval-context). */
export interface EvalContext {
  attr(attr: Attribute): number;
  value(ref: EntryRef): number; // talent FW / KTW / spell·liturgy FW / advantage·SA level
  has(ref: EntryRef, opts?: { option?: string; sameOption?: boolean; owner?: PrereqOwner }): boolean;
  granted(ref: EntryRef): boolean;
  readonly caster: boolean;
  readonly priest: boolean;
  tradition(name?: string): boolean;
  readonly karmalTradition: boolean;
  readonly leitTradition: number;
  species(ids: string[]): boolean;
  culture(ids: string[]): boolean;
  cultureSocialStatus(status: string): boolean;
  language(min?: number): boolean;
  readonly script: boolean;
  style(kind: 'combat' | 'magic' | 'karmal' | 'skill', ownerLabel: string): boolean;
  aspectCount(count: number, min: number, ownerParam?: string): boolean;
  merkmalCount(count: number, min: number, ownerParam?: string): boolean;
  selectedSpell(min: number, ownerParam?: string): boolean;
  selectedTalent(min: number, ownerParam?: string): boolean;
  spellExtension(spell: string, ext: string): boolean;
  /** Display label for a ref, for building readable reasons. */
  label(ref: EntryRef): string;
}

const PASS: EvalResult = { status: 'pass', reasons: [] };
const ok = (b: boolean, reason: string): EvalResult => (b ? PASS : { status: 'fail', reasons: [reason] });

const STYLE_WORD: Record<string, string> = { combat: 'passender Kampfstil', magic: 'passender Zauberstil', karmal: 'passender Liturgiestil', skill: 'passender Talentstil' };

export function evaluate(expr: Prerequisite, ctx: EvalContext, owner: PrereqOwner): EvalResult {
  switch (expr.op) {
    case 'and':
      return combineAnd(expr.all.map((c) => evaluate(c, ctx, owner)));
    case 'or':
      return combineOr(expr.any.map((c) => evaluate(c, ctx, owner)), 'eines von');
    case 'nOf':
      return combineNOf(expr.any.map((c) => evaluate(c, ctx, owner)), expr.n);
    case 'not': {
      const r = evaluate(expr.child, ctx, owner);
      if (r.status === 'manual') return r;
      return r.status === 'pass' ? { status: 'fail', reasons: [`nicht: ${describe(expr.child, ctx)}`] } : PASS;
    }
    case 'atLevel':
      return owner.level < expr.level ? PASS : evaluate(expr.then, ctx, owner);
    case 'ifOption': {
      const picked = (owner.options ?? []).some((o) => o.key === expr.key && o.id === expr.option);
      return picked ? evaluate(expr.then, ctx, owner) : PASS;
    }

    case 'attr':
      return ok(ctx.attr(expr.attr) >= expr.min, `${expr.attr} ${expr.min}`);
    case 'value':
      return ok(ctx.value(expr.ref) >= expr.min, `${ctx.label(expr.ref)} ${expr.min}`);
    case 'valueSum':
      return ok(expr.refs.reduce((s, r) => s + ctx.value(r), 0) >= expr.min, `${expr.refs.map((r) => ctx.label(r)).join(' + ')} ${expr.min}`);

    case 'has':
      return ok(ctx.has(expr.ref, { option: expr.option, sameOption: expr.sameOption, owner }), `${ctx.label(expr.ref)}${expr.option ? ` (${expr.option})` : ''}`);
    case 'granted':
      return ok(ctx.granted(expr.ref), `Spezies/Kultur/Profession mit ${ctx.label(expr.ref)}`);
    case 'caster':
      return ok(ctx.caster, 'Vorteil Zauberer');
    case 'priest':
      return ok(ctx.priest, 'Vorteil Geweihter');
    case 'tradition':
      return ok(ctx.tradition(expr.name), expr.name ? `Tradition „${expr.name}"` : 'eine Tradition');
    case 'karmalTradition':
      return ok(ctx.karmalTradition, 'Tradition eines Kults');
    case 'leitTradition':
      return ok(ctx.leitTradition >= expr.min, `Leiteigenschaft der Tradition ${expr.min}`);
    case 'species':
      return ok(ctx.species(expr.ids), `Spezies ${expr.ids.join('/')}`);
    case 'culture':
      return ok(ctx.culture(expr.ids), `Kultur ${expr.ids.join('/')}`);
    case 'cultureSocialStatus':
      return ok(ctx.cultureSocialStatus(expr.status), `Kultur mit Sozialstatus „${expr.status}"`);
    case 'language':
      return ok(ctx.language(expr.min), expr.min != null ? `Sprache (Stufe ${expr.min})` : 'Sprache');
    case 'script':
      return ok(ctx.script, 'Schrift');
    case 'style':
      return ok(ctx.style(expr.styleKind, owner.label), STYLE_WORD[expr.styleKind]);

    case 'aspectCount':
      return ctx.aspectCount(expr.count, expr.min, owner.param) ? PASS : { status: 'fail', reasons: [`${expr.count} Liturgien/Zeremonien des Aspekts auf ${expr.min}`] };
    case 'merkmalCount':
      return ctx.merkmalCount(expr.count, expr.min, owner.param) ? PASS : { status: 'fail', reasons: [`${expr.count} Zauber des Merkmals auf ${expr.min}`] };
    case 'selectedSpell':
      return ctx.selectedSpell(expr.min, owner.param) ? PASS : { status: 'fail', reasons: [`gewählter Zauber auf FW ${expr.min}`] };
    case 'selectedTalent': {
      // DSA5: the Nth specialization in the SAME talent needs FW ≥ min × N (6 / 12 / 18). Scaling
      // happens HERE, where the owner's ordinal and the message live together — so the reason always
      // states the threshold that was actually applied.
      const need = expr.min * (owner.ordinal ?? 1);
      return ok(ctx.selectedTalent(need, owner.param), `Fertigkeitswert ${need}`);
    }
    case 'spellExtension':
      return ok(ctx.spellExtension(expr.spell, expr.ext), `Zaubererweiterung „${expr.ext}"`);

    case 'narrative':
      return { status: 'manual', reasons: [expr.text] };
  }
}

// ── Status combinators ──────────────────────────────────────────────────────────
function combineAnd(results: EvalResult[]): EvalResult {
  const fails = results.filter((r) => r.status === 'fail').flatMap((r) => r.reasons);
  if (fails.length) return { status: 'fail', reasons: fails };
  const manual = results.filter((r) => r.status === 'manual').flatMap((r) => r.reasons);
  return manual.length ? { status: 'manual', reasons: manual } : PASS;
}

function combineOr(results: EvalResult[], lead: string): EvalResult {
  if (results.some((r) => r.status === 'pass')) return PASS;
  const manual = results.filter((r) => r.status === 'manual').flatMap((r) => r.reasons);
  if (manual.length) return { status: 'manual', reasons: manual };
  return { status: 'fail', reasons: [`${lead}: ${results.flatMap((r) => r.reasons).join(' / ')}`] };
}

function combineNOf(results: EvalResult[], n: number): EvalResult {
  const pass = results.filter((r) => r.status === 'pass').length;
  if (pass >= n) return PASS;
  const manual = results.filter((r) => r.status === 'manual').length;
  if (pass + manual >= n) return { status: 'manual', reasons: results.filter((r) => r.status === 'manual').flatMap((r) => r.reasons) };
  return { status: 'fail', reasons: [`${n} von: ${results.flatMap((r) => r.reasons).join(' / ')}`] };
}

/** Compact label for a node, used inside not()/reasons. */
function describe(node: Prerequisite, ctx: EvalContext): string {
  switch (node.op) {
    case 'has':
      return ctx.label(node.ref);
    case 'value':
      return `${ctx.label(node.ref)} ${node.min}`;
    case 'attr':
      return `${node.attr} ${node.min}`;
    case 'species':
      return `Spezies ${node.ids.join('/')}`;
    case 'culture':
      return `Kultur ${node.ids.join('/')}`;
    case 'tradition':
      return node.name ? `Tradition „${node.name}"` : 'eine Tradition';
    case 'narrative':
      return node.text;
    default:
      return node.op;
  }
}
