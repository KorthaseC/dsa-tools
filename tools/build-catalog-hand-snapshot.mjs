// ─── One-time: freeze PRISTINE name/slug → labelKey for the hand catalogs the PDF will regenerate ───
// (talents, combat techniques, cantrips, blessings). Lets the generator reuse the exact existing
// name/slug for any entry whose label matches, so skills / profession grants / TALENT_FACTOR /
// CT_FACTOR / save data / data-integrity.spec.ts keep resolving. Run ONCE on pristine files; commit
// tools/dsa-data/catalog-hand-snapshot.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONST_DIR = resolve(ROOT, 'src/app/character-creator/constants');
const OUT = resolve(ROOT, 'tools/dsa-data/catalog-hand-snapshot.json');

function load(files, aggregate) {
  let src = (Array.isArray(files) ? files : [files])
    .map((f) => readFileSync(resolve(CONST_DIR, f), 'utf8'))
    .join('\n')
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export\s*\{[^}]*\}\s*from[^\n]*\n/gm, '')
    .replace(/export const /g, 'var ')
    .replace(/:\s*[A-Za-z_][\w]*\[\]/g, '')
    .replace(/\b(IncreaseFactor|TalentCategory|SpellTrait)\.(\w+)/g, '"$2"');
  src += `\n;return ${aggregate};`;
  return new Function(src)();
}
const labelKey = (s) =>
  String(s || '').toLowerCase()
    .replace(/\(\*\)/g, '').replace(/:in|:r|:e\b/g, '').replace(/[……]/g, '')
    .replace(/\s+[ivx]+\s*[-–]\s*[ivx]+/g, '').replace(/\s+[ivx]+$/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '');

const catalogs = {
  talents: load('talent.const.ts', 'ALL_TALENTS'),
  combatTechniques: load(['combat-technique-melee.const.ts', 'combat-technique-ranged.const.ts'], '[...MELEE_COMBAT_TECHNIQUES, ...RANGED_COMBAT_TECHNIQUES]'),
  cantrips: load('cantrip.const.ts', 'ALL_CANTRIPS'),
  blessings: load('blessing.const.ts', 'ALL_BLESSINGS'),
};
const out = {};
for (const [k, list] of Object.entries(catalogs)) {
  out[k] = {};
  for (const e of list) { const lk = labelKey(e.label); if (lk && !out[k][lk]) out[k][lk] = e.name; }
  console.log(`${k}: ${list.length} entries`);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
console.log(`Wrote ${OUT}`);
