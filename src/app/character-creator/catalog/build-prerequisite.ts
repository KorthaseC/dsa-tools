import { Attribute } from '../models/base-creation.model';
import { EntryKind, EntryRef } from '../models/entry-kind';
import { Prerequisite, PrerequisiteConfidence } from '../models/prerequisite.model';
import { Requirement } from '../models/requirement.model';
import { idFromLabel } from './catalog-index';

// Converts the generated, flat Requirement[] (the PDF parser's output) into the id-based
// Prerequisite AST. This is the "Parser umgelenkt, statt neu erfunden" step done at runtime:
// it changes representation only — it never invents rules. Catalog references that the flat model
// stored as German labels (talent/combatTechnique/spell/liturgy) are resolved to slugs through the
// CatalogIndex; anything that can't be resolved becomes a `narrative` node (honest, never a false
// positive). The owning entry's confidence is derived from how much stayed narrative.

const VALUE_KINDS: Partial<Record<Requirement['type'], EntryKind[]>> = {
  talent: ['talent'],
  combatTechnique: ['combatTechnique'],
  spell: ['spell', 'ritual'],
  liturgy: ['liturgy', 'ceremony'],
};

function resolveByLabel(label: string, kinds: EntryKind[]): EntryRef | undefined {
  for (const kind of kinds) {
    const id = idFromLabel(kind, label);
    if (id) return { kind, id };
  }
  return undefined;
}

const narrative = (req: Requirement): Prerequisite => ({ op: 'narrative', text: req.text ?? req.name ?? '' });

// The bare condition for one Requirement (before applying `forbidden`/`atLevel`/`group`).
function leafNode(req: Requirement): Prerequisite | null {
  switch (req.type) {
    case 'attribute':
      return req.name != null && req.min != null ? { op: 'attr', attr: req.name as Attribute, min: req.min } : null;

    case 'talent':
    case 'combatTechnique':
    case 'spell':
    case 'liturgy': {
      if (req.name == null) return null;
      const ref = resolveByLabel(req.name, VALUE_KINDS[req.type]!);
      return ref ? { op: 'value', ref, min: req.min ?? 0 } : narrative(req);
    }

    case 'talentCount': {
      const any = (req.names ?? []).map((label) => {
        const ref = resolveByLabel(label, ['talent']);
        return ref ? ({ op: 'value', ref, min: req.min ?? 0 } as Prerequisite) : ({ op: 'narrative', text: label } as Prerequisite);
      });
      return any.length ? { op: 'nOf', n: req.count ?? 1, any } : null;
    }
    case 'talentSum': {
      const refs = (req.names ?? []).map((label) => resolveByLabel(label, ['talent']));
      return refs.every((r) => r) ? { op: 'valueSum', refs: refs as EntryRef[], min: req.min ?? 0 } : narrative(req);
    }

    case 'advantage':
    case 'disadvantage':
    case 'specialAbility': {
      if (req.name == null) return null;
      const kind: EntryKind = req.type;
      const ref: EntryRef = { kind, id: req.name };
      if (req.min != null) return { op: 'value', ref, min: req.min };
      return {
        op: 'has',
        ref,
        ...(req.option != null ? { option: req.option } : {}),
        ...(req.sameOption ? { sameOption: true } : {}),
      };
    }
    case 'cantrip':
      return req.name != null ? { op: 'has', ref: { kind: 'cantrip', id: req.name } } : null;

    case 'grantedAdvantage':
      return req.name != null ? { op: 'granted', ref: { kind: 'advantage', id: req.name } } : null;
    case 'grantedDisadvantage':
      return req.name != null ? { op: 'granted', ref: { kind: 'disadvantage', id: req.name } } : null;

    case 'spellExtension':
      return req.spell != null && req.name != null ? { op: 'spellExtension', spell: req.spell, ext: req.name } : null;

    case 'caster':
      return { op: 'caster' };
    case 'priest':
      return { op: 'priest' };
    case 'tradition':
      return { op: 'tradition', name: req.name };
    case 'karmalTradition':
      return { op: 'karmalTradition' };
    case 'leitTradition':
      return { op: 'leitTradition', min: req.min ?? 0 };
    case 'species':
      return req.name != null ? { op: 'species', ids: [req.name] } : null;
    case 'culture':
      return req.name != null ? { op: 'culture', ids: [req.name] } : null;
    case 'cultureSocialStatus':
      return req.name != null ? { op: 'cultureSocialStatus', status: req.name } : null;
    case 'language':
      return { op: 'language', min: req.min };
    case 'script':
      return { op: 'script' };
    case 'style':
      return req.styleKind ? { op: 'style', styleKind: req.styleKind } : null;

    case 'aspectCount':
      return { op: 'aspectCount', count: req.count ?? 1, min: req.min ?? 0 };
    case 'merkmalCount':
      return { op: 'merkmalCount', count: req.count ?? 1, min: req.min ?? 0 };
    case 'selectedSpell':
      return { op: 'selectedSpell', min: req.min ?? 0 };
    case 'selectedTalent':
      return { op: 'selectedTalent', min: req.min ?? 0 };

    case 'ifOption': {
      // Option-conditional: applies `then` only when the owner's chosen sub-option matches. The owner's
      // chosen option is exposed under key 'option' (see requirementRule's PrereqOwner construction).
      if (req.option == null || !req.then) return null;
      const then = reqToNode(req.then);
      return then ? { op: 'ifOption', key: 'option', option: req.option, then } : null;
    }

    case 'narrative':
      return narrative(req);
  }
  return narrative(req);
}

function reqToNode(req: Requirement): Prerequisite | null {
  let node = leafNode(req);
  if (!node) return null;
  if (req.forbidden) node = { op: 'not', child: node };
  if (req.atLevel) node = { op: 'atLevel', level: req.atLevel, then: node };
  return node;
}

/** Convert a generated Requirement[] into the id-based Prerequisite AST (undefined = no prereqs). */
export function buildPrerequisite(reqs: readonly Requirement[] | undefined): Prerequisite | undefined {
  if (!reqs?.length) return undefined;
  const groups = new Map<number, Prerequisite[]>();
  const members: Prerequisite[] = [];
  for (const req of reqs) {
    const node = reqToNode(req);
    if (!node) continue;
    if (req.group != null) {
      const arr = groups.get(req.group) ?? [];
      arr.push(node);
      groups.set(req.group, arr);
    } else {
      members.push(node);
    }
  }
  for (const arr of groups.values()) members.push(arr.length > 1 ? { op: 'or', any: arr } : arr[0]);
  if (!members.length) return undefined;
  return members.length === 1 ? members[0] : { op: 'and', all: members };
}

// ── Confidence ────────────────────────────────────────────────────────────────
// Walk the produced AST counting leaves vs. narrative leaves: all structured → 'structured',
// all narrative → 'narrative', mixed → 'partial'.
function countLeaves(node: Prerequisite, acc: { total: number; narrative: number }): void {
  switch (node.op) {
    case 'and':
      node.all.forEach((c) => countLeaves(c, acc));
      return;
    case 'or':
    case 'nOf':
      node.any.forEach((c) => countLeaves(c, acc));
      return;
    case 'not':
      return countLeaves(node.child, acc);
    case 'atLevel':
    case 'ifOption':
      return countLeaves(node.then, acc);
    case 'narrative':
      acc.total++;
      acc.narrative++;
      return;
    default:
      acc.total++;
  }
}

export function prerequisiteConfidenceOf(reqs: readonly Requirement[] | undefined): PrerequisiteConfidence {
  const ast = buildPrerequisite(reqs);
  if (!ast) return 'structured';
  const acc = { total: 0, narrative: 0 };
  countLeaves(ast, acc);
  if (acc.narrative === 0) return 'structured';
  if (acc.narrative === acc.total) return 'narrative';
  return 'partial';
}
