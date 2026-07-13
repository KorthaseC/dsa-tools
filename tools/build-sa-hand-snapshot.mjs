// ─── Phase A (one-time): freeze the PRISTINE hand-maintained special-ability catalogs ───
// Captures every current profane/karmal SA as a full object (with its `category` as the enum
// MEMBER NAME, e.g. "Language") plus its labelKey, so the generator can:
//   • preserve the existing slug for any SA it regenerates from the PDF (stable references), and
//   • carry forward verbatim any hand entry that has NO PDF/SF source (languages, scripts,
//     karmal traditions, …) so nothing is lost and the data-integrity guard keeps passing.
// Run ONCE against the pristine files, then commit tools/dsa-data/sa-hand-snapshot.json.
// Re-running after the files are generated is still safe (orphans are re-emitted into them).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONST_DIR = resolve(ROOT, 'src/app/character-creator/constants');
const OUT = resolve(ROOT, 'tools/dsa-data/sa-hand-snapshot.json');

// Evaluate a *.const.ts SA file as plain data: strip the import, turn `export const` into `var`,
// drop the `: SpecialAbility[]` annotations, and render `SpecialAbilityCategory.X` as the string "X".
function loadHandFile(file, aggregate) {
  let src = readFileSync(resolve(CONST_DIR, file), 'utf8')
    .replace(/^import[^\n]*\n/m, '')
    .replace(/export const /g, 'var ')
    .replace(/:\s*SpecialAbility\[\]/g, '')
    .replace(/SpecialAbilityCategory\.(\w+)/g, '"$1"');
  src += `\n;return ${aggregate};`;
  // eslint-disable-next-line no-new-func
  return new Function(src)();
}

const labelKey = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\(\*\)/g, '')
    .replace(/:in|:r|:e\b/g, '')
    .replace(/[……]/g, '')
    .replace(/\s+[ivx]+\s*[-–]\s*[ivx]+/g, '')
    .replace(/\s+[ivx]+$/g, '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '');

const profane = loadHandFile('special-ability-profane.const.ts', 'ALL_PROFANE_SPECIAL_ABILITIES');
const karmal = loadHandFile('special-ability-karmal.const.ts', 'ALL_KARMAL_SPECIAL_ABILITIES');

const all = [...profane, ...karmal].map((e) => ({ ...e, labelKey: labelKey(e.label) }));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(all, null, 2), 'utf8');
console.log(`Snapshot: profane ${profane.length} + karmal ${karmal.length} = ${all.length} hand SAs → ${OUT}`);
// Quick sanity: how many distinct categories, and the language/script counts that MUST survive.
const byCat = {};
for (const e of all) byCat[e.category] = (byCat[e.category] || 0) + 1;
console.log('Categories:', JSON.stringify(byCat));
