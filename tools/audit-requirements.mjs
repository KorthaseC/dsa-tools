// Read-only audit of the generated catalogs to surface data-correctness issues that affect the data core
// + validation. Run: node tools/audit-requirements.mjs
// Reports per concern; exit code 1 if any HARD issue (unresolved/self-ref/duplicate/dangling) is found.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const C = resolve(dirname(fileURLToPath(import.meta.url)), '../src/app/character-creator/constants');
const read = (f) => readFileSync(resolve(C, f), 'utf8');
const norm = (s) => String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const exists = (f) => { try { read(f); return true; } catch { return false; } };

const saFiles = readdirSync(C).filter((f) => /^special-ability.*\.const\.ts$/.test(f));
const advFile = 'advantage.const.ts';
const entrySlugs = (f) => [...read(f).matchAll(/^\s{4}name:\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]); // top-level entry slugs
const labels = (f) => (exists(f) ? [...read(f).matchAll(/label:\s*"([^"]+)"/g)].map((m) => norm(m[1])) : []);

const advSet = new Set(entrySlugs(advFile).map(norm));
const saSlugList = saFiles.flatMap(entrySlugs);
const saSet = new Set(saSlugList.map(norm));
const spellSet = new Set([...labels('spell.const.ts'), ...labels('ritual.const.ts')]);
const talentSet = new Set(labels('talent.const.ts'));

// SELECTION_OPTIONS key → Set(option slug), to detect dangling `option` refs.
const selOpt = new Map();
if (exists('selection-options.const.ts')) {
  const so = read('selection-options.const.ts');
  for (const km of so.matchAll(/^ {2}"([^"]+)":\s*\[([\s\S]*?)\n {2}\]/gm)) {
    selOpt.set(km[1], new Set([...km[2].matchAll(/name: "([^"]+)"/g)].map((m) => norm(m[1]))));
  }
}

const SLUG_TYPES = new Set(['advantage', 'disadvantage', 'specialAbility', 'grantedAdvantage', 'grantedDisadvantage']);
const issues = { unresolvedRef: [], selfForbidden: [], danglingSpell: [], danglingTalent: [] };
const narrativeByFile = {};
const dupSlugs = new Map();
for (const n of saSlugList) dupSlugs.set(n, (dupSlugs.get(n) || 0) + 1);

// Walk every entry (name + its requirements line) across advantage + SA files.
for (const f of [advFile, ...saFiles]) {
  const txt = read(f);
  narrativeByFile[f] = (txt.match(/\{ type: "narrative"/g) || []).length;
  for (const e of txt.matchAll(/^\s{4}name:\s*"([^"]+)",[\s\S]*?(?:\n\s{4}requirements:\s*\[(.*?)\],)?\n\s{4}(?:effectText|sources|url|subCategory|tradition|merkmal|selection|speciesRestriction|category|cost|maxLvl|prerequisiteText)/gm)) {
    const own = norm(e[1]);
    const reqLine = e[2] || '';
    for (const rm of reqLine.matchAll(/\{ ([^}]*) \}/g)) {
      const body = rm[1];
      const g = (k) => (body.match(new RegExp(`${k}: "([^"]+)"`)) || [])[1];
      const type = g('type'); const name = g('name'); const forbidden = /forbidden: true/.test(body); const spell = g('spell');
      if (type && SLUG_TYPES.has(type) && name) {
        const n = norm(name);
        if (!(advSet.has(n) || saSet.has(n))) issues.unresolvedRef.push(`${f} ${own}: ${type} "${name}"`);
        if (forbidden && n === own) issues.selfForbidden.push(`${f} ${own}: self-forbidden`);
      }
      if (type === 'spellExtension' && spell && !spellSet.has(norm(spell))) issues.danglingSpell.push(`${f} ${own}: spell "${spell}"`);
    }
  }
}

const hard = issues.unresolvedRef.length + issues.selfForbidden.length + issues.danglingSpell.length;
const dups = [...dupSlugs].filter(([, c]) => c > 1);
console.log('── Requirement / catalog audit ─────────────────────────────');
console.log('Catalog: advantages', advSet.size, '| SA slugs', saSet.size, '| selection sources', selOpt.size);
console.log('\nNarrative requirements remaining (triage):');
for (const [f, n] of Object.entries(narrativeByFile).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${f}`);
console.log('\nHARD issues:');
console.log('  unresolved slug refs:', issues.unresolvedRef.length);
issues.unresolvedRef.slice(0, 20).forEach((x) => console.log('    ' + x));
console.log('  self-forbidden refs:', issues.selfForbidden.length);
issues.selfForbidden.slice(0, 20).forEach((x) => console.log('    ' + x));
console.log('  dangling spellExtension spells:', issues.danglingSpell.length);
issues.danglingSpell.slice(0, 20).forEach((x) => console.log('    ' + x));
console.log('  duplicate SA slugs:', dups.length, dups.slice(0, 10).map(([s, c]) => `${s}×${c}`).join(', '));
process.exit(hard || dups.length ? 1 : 0);
