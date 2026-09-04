// Extracts the embedded DSA5 dataset from the fillable character-sheet PDF and
// regenerates catalog consts. The PDF is "self-calculating" and stores the whole
// ruleset as JavaScript `XxxGetInfo(id, infoId)` functions inside FlateDecode
// streams (per-entry `aDaten[i]` arrays).
//
// This pass: SPELLS & LITURGIES — regenerates spell/ritual/liturgy/ceremony consts as the single
// source of truth, DSA-Aventurien only (Mythos/Myranor/"Schwarze Katze" excluded). Each entry
// carries its detail fields (cost/castTime/range/duration/Ziel), the regelwiki url, the book
// sources, and its extensions (Erweiterungen from ZauberErweiterungGetInfo/LiturgieErweiterungGetInfo
// → name, AP cost, required Fertigkeitswert, and `requires` for successive chains). Wirkung is omitted.
//
// Run:  node tools/extract-pdf-data.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PDF = resolve(ROOT, '423187-Charakterbogen_V2_13_(ausfuellbar_selbstrechnend_ohne_Hintergrund)_korr_V2-1.pdf');
const CONST_DIR = resolve(ROOT, 'src/app/character-creator/constants');

// ── Inflate every FlateDecode stream and concatenate the embedded JS ──────────
function extractJs() {
  const latin = readFileSync(PDF).toString('latin1');
  let js = '';
  const re = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m;
  while ((m = re.exec(latin)) !== null) {
    try {
      js += inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1');
    } catch {
      /* not a zlib stream — skip */
    }
  }
  return js;
}

function functionBody(js, fnName) {
  const start = js.indexOf(`function ${fnName}`);
  if (start < 0) return '';
  const next = js.indexOf('\nfunction ', start + 1);
  return js.slice(start, next < 0 ? js.length : next);
}

function parseValue(token) {
  try {
    return JSON.parse(token);
  } catch {
    // Hand-maintained arrays in the PDF sometimes carry a hole from a trailing comma — TalentGetInfo
    // has three `["", ]` rows in Heilkunde Krankheiten's Gebiete. That is invalid JSON, so the whole
    // field used to degrade to a raw string and the entire list was lost. Close the holes and retry;
    // the emptied entries are dropped later by the per-consumer `g[0]` filter.
    if (token.startsWith('[')) {
      try {
        return JSON.parse(token.replace(/,\s*(?=[,\]])/g, ''));
      } catch {
        /* still not an array — fall through to the string form below */
      }
    }
    return token.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\[rnt]/g, ' ').trim();
  }
}

// The PDF JS is inflated as latin1, so cp1252 punctuation (the "…" ellipsis used by placeholder
// advantages like "Angst vor …", but also en/em dashes and curly quotes used throughout rule text)
// lands as C1 control chars. Map the known ones to their real glyphs; collapse any leftover to "…".
const CP1252 = {
  '\u0082': '‚',
  '\u0084': '„',
  '\u0085': '…',
  '\u0086': '†',
  '\u0087': '‡',
  '\u008b': '‹',
  '\u0091': '‘',
  '\u0092': '’',
  '\u0093': '“',
  '\u0094': '”',
  '\u0095': '•',
  '\u0096': '–',
  '\u0097': '—',
  '\u0099': '™',
  '\u009b': '›',
};
function cleanText(s) {
  return String(s ?? '').replace(/[\u0080-\u009f]/g, (c) => CP1252[c] ?? '…');
}

function parseGetInfo(body) {
  const records = [];
  for (const chunk of body.split('break;')) {
    const fields = {};
    // Capture string, array AND bare-number literals — some columns (e.g. SFKampf BasisKosten
    // `aDaten[3] = 20;`) are numbers; missing them left every combat SA at cost 0.
    const fre = /aDaten\[(\d+)\]\s*=\s*("(?:\\.|[^"\\])*"|\[[\s\S]*?\]|-?\d+(?:\.\d+)?)\s*;/g;
    let fm;
    let any = false;
    while ((fm = fre.exec(chunk)) !== null) {
      fields[Number(fm[1])] = parseValue(fm[2]);
      any = true;
    }
    if (any && fields[1]) records.push(fields);
  }
  return records;
}

const IF = ['A', 'B', 'C', 'D', 'E'];
const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16 }; // used by splitLevel (called from the profession section onward); Zeremonialgegenstand SFs reach level XIII
const slug = (label) =>
  label
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '');

const js = extractJs();

// Per WerkGetInfo, every book is Aventurien except the two Cthulhu/"Schwarze Katze" Mythos titles.
const MYTHOS_BOOKS = new Set(['CtC', 'SPC']); // Cthulhu-Compendium, Sandy Petersens Cthulhu Mythos
// Cthulhu/Dreamlands sub-options leak into otherwise-Aventurien selection lists (e.g. "Wesen/Fluch
// der Traumlande" in WesenArray) when they carry no Mythos-only source. Drop them by label marker.
const MYTHOS_OPTION_RE = /Traumlande|Cthulhu|Tcho-Tcho|Nyarlathotep/i;
const REGELWIKI_BASE = 'https://dsa.ulisses-regelwiki.de/';

// ── Spell/liturgy source & url helpers (shared by spells and liturgies) ───────
// [15]/[4] "Werke" → SourceReference[] { book, page }; Mythos books dropped.
function buildSources(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((s) => typeof s === 'string')
    .map((s) => {
      const mm = String(s).match(/^(\S+)\s+(\d+)/);
      return mm ? { book: mm[1], page: Number(mm[2]) } : { book: String(s).trim() };
    })
    .filter((sr) => sr.book && !MYTHOS_BOOKS.has(sr.book));
}
// [18]/[5] "URL" → absolute regelwiki link.
function buildUrl(arr) {
  const u = Array.isArray(arr) ? arr[0] : arr;
  if (!u) return '';
  const s = String(u).trim();
  return s.startsWith('http') ? s : REGELWIKI_BASE + s;
}

// ── Extensions (ZauberErweiterungGetInfo / LiturgieErweiterungGetInfo) ────────
// Each record: [0]=Name, [1]=parent ID (Z_*/L_*), [2]=FW threshold, [3]=AP cost, [4]=Werke.
// FW/AP are quoted strings for spells but bare numbers for liturgies, so parse line-anchored.
function parseExtensions(body) {
  const records = [];
  for (const chunk of body.split('break;')) {
    const f = {};
    const fre = /aDaten\[(\d+)\]\s*=\s*(.+?);\s*$/gm;
    let fm;
    let any = false;
    while ((fm = fre.exec(chunk)) !== null) {
      f[Number(fm[1])] = parseValue(fm[2]);
      any = true;
    }
    if (any && f[0] !== undefined && f[1] !== undefined) records.push(f);
  }
  return records;
}
// Chain key: strip the leading "Noch"/"Noch viel" escalator and a trailing level digit so that
// e.g. "Größere Reichweite" / "Noch größere Reichweite" and "… 1" / "… 2" share one key.
function extCoreKey(label) {
  let s = String(label).toLowerCase().trim();
  if (/^noch\s+/.test(s)) s = s.replace(/^noch\s+/, '').replace(/^viel\s+/, '');
  s = s.replace(/\s+\d+$/, '');
  return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '');
}
const isEscalated = (label) => /^noch\s/i.test(String(label)) || /\s\d+$/.test(String(label).trim());

// Build parentId → SpellExtension[] (sorted, with `requires` for successive chains).
function buildExtensionMap(fnName) {
  const byParent = new Map();
  for (const r of parseExtensions(functionBody(js, fnName))) {
    const books = (Array.isArray(r[4]) ? r[4] : []).filter((s) => typeof s === 'string').map((s) => s.split(' ')[0]);
    if (books.length && books.every((b) => MYTHOS_BOOKS.has(b))) continue; // drop Mythos-only extensions
    const parent = r[1];
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push({
      label: cleanText(String(r[0])),
      apCost: Number(r[3]) || 0,
      requiredSkillValue: Number(r[2]) || 0,
    });
  }
  for (const list of byParent.values()) {
    // Unique slug per parent, then derive successive `requires` from the core-key chains.
    const used = new Set();
    for (const e of list) {
      let n = slug(e.label) || 'erweiterung';
      while (used.has(n)) n += 'x';
      used.add(n);
      e.name = n;
    }
    const byCore = new Map();
    for (const e of list) {
      const k = extCoreKey(e.label);
      if (!byCore.has(k)) byCore.set(k, []);
      byCore.get(k).push(e);
    }
    for (const group of byCore.values()) {
      if (group.length < 2) continue;
      group.sort((a, b) => a.requiredSkillValue - b.requiredSkillValue);
      for (let i = 1; i < group.length; i++) if (isEscalated(group[i].label)) group[i].requires = [group[i - 1].name];
    }
    list.sort((a, b) => a.requiredSkillValue - b.requiredSkillValue || a.label.localeCompare(b.label, 'de'));
  }
  return byParent;
}
const spellExtMap = buildExtensionMap('ZauberErweiterungGetInfo');
const liturgyExtMap = buildExtensionMap('LiturgieErweiterungGetInfo');

// ── Tradition abbreviation → full name ────────────────────────────────────────
const tradAbbr = new Map();
for (const r of parseGetInfo(functionBody(js, 'TraditionGetInfo'))) {
  if (r[4] && r[0]) tradAbbr.set(r[4], r[0]);
}

// ── Spells (ZauberGetInfo) ────────────────────────────────────────────────────
const records = parseGetInfo(functionBody(js, 'ZauberGetInfo'));
const spells = [];
const rituals = [];
const usedNames = new Set();
let excluded = 0;

for (const r of records) {
  const type = (r[16] || '').toString();
  if (/mythos|myranor/i.test(type)) {
    excluded++;
    continue; // DSA Aventurien only
  }
  const label = r[1];
  let name = slug(label);
  while (usedNames.has(name)) name += 'x';
  usedNames.add(name);

  const sources = Array.isArray(r[15]) ? r[15].flat().filter((s) => typeof s === 'string') : [];
  const traditions = Array.isArray(r[17]) ? r[17].map((a) => tradAbbr.get(a) ?? a) : [];
  const ifac = IF.includes((r[14] || '').toUpperCase()) ? r[14].toUpperCase() : 'A';

  const entry = {
    name,
    label,
    check: [r[2] || 'MU', r[3] || 'MU', r[4] || 'MU'],
    trait: (r[13] || '').toString(),
    traditions,
    increaseFactor: ifac,
    cost: (r[9] || '').toString(),
    castTime: (r[8] || '').toString(),
    range: (r[10] || '').toString(),
    duration: (r[11] || '').toString(),
    target: (r[12] || '').toString(),
    page: sources[0] || '',
    magicType: type,
    url: buildUrl(r[18]),
    sources: buildSources(r[15]),
    extensions: spellExtMap.get(r[0]) || [],
  };
  (/ritual/i.test(type) ? rituals : spells).push(entry);
}

spells.sort((a, b) => a.label.localeCompare(b.label, 'de'));
rituals.sort((a, b) => a.label.localeCompare(b.label, 'de'));

mkdirSync(resolve(ROOT, 'tools/dsa-data'), { recursive: true });
writeFileSync(resolve(ROOT, 'tools/dsa-data/spells.json'), JSON.stringify({ spells, rituals }, null, 2), 'utf8');

// Inline serializer for an extension list (kept compact, one object per line).
function renderExtensions(list) {
  if (!list || !list.length) return '[]';
  const items = list.map((x) => {
    let s = `{ name: ${JSON.stringify(x.name)}, label: ${JSON.stringify(x.label)}, apCost: ${x.apCost}, requiredSkillValue: ${x.requiredSkillValue}`;
    if (x.requires && x.requires.length) s += `, requires: [${x.requires.map((r) => JSON.stringify(r)).join(', ')}]`;
    return `${s} }`;
  });
  return `[\n      ${items.join(',\n      ')},\n    ]`;
}

function renderEntry(e) {
  const lines = [
    '  {',
    `    name: ${JSON.stringify(e.name)},`,
    `    label: ${JSON.stringify(e.label)},`,
    `    check: [${e.check.map((c) => JSON.stringify(c)).join(', ')}] as SpellCheck,`,
    `    trait: ${JSON.stringify(e.trait)},`,
    `    traditions: [${e.traditions.map((t) => JSON.stringify(t)).join(', ')}],`,
    `    increaseFactor: IncreaseFactor.${e.increaseFactor},`,
    `    cost: ${JSON.stringify(e.cost)},`,
    `    castTime: ${JSON.stringify(e.castTime)},`,
    `    range: ${JSON.stringify(e.range)},`,
    `    duration: ${JSON.stringify(e.duration)},`,
    `    target: ${JSON.stringify(e.target)},`,
    `    page: ${JSON.stringify(e.page)},`,
    `    magicType: ${JSON.stringify(e.magicType)},`,
    `    url: ${JSON.stringify(e.url)},`,
    `    sources: ${JSON.stringify(e.sources)},`,
    `    extensions: ${renderExtensions(e.extensions)},`,
    '  },',
  ];
  return lines.join('\n');
}

function renderFile(typeName, constName, list) {
  return (
    `import { ${typeName}, SpellCheck, IncreaseFactor } from '../models/magic.model';\n\n` +
    `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs from the embedded PDF data (ZauberGetInfo). ───\n` +
    `// Do not edit by hand. DSA Aventurien only (Mythos/Myranor excluded). ${list.length} entries.\n\n` +
    `export const ${constName}: ${typeName}[] = [\n` +
    list.map(renderEntry).join('\n') +
    `\n];\n`
  );
}

writeFileSync(resolve(CONST_DIR, 'spell.const.ts'), renderFile('Spell', 'ALL_SPELLS', spells), 'utf8');
writeFileSync(resolve(CONST_DIR, 'ritual.const.ts'), renderFile('Ritual', 'ALL_RITUALS', rituals), 'utf8');

console.log(`Spells: ${spells.length}, Rituals: ${rituals.length}, excluded (Mythos/Myranor): ${excluded}`);
console.log('Wrote spell.const.ts, ritual.const.ts, tools/dsa-data/spells.json');

// ── Liturgies (LiturgieGetInfo) — mirror of spells; [13]=Aspekte instead of Merkmal ──
const litRecords = parseGetInfo(functionBody(js, 'LiturgieGetInfo'));
const liturgies = [];
const ceremonies = [];
const usedLit = new Set();
let litExcluded = 0;
for (const r of litRecords) {
  const type = (r[16] || '').toString();
  if (/mythos|myranor/i.test(type)) {
    litExcluded++;
    continue;
  }
  const label = r[1];
  let name = slug(label);
  while (usedLit.has(name)) name += 'x';
  usedLit.add(name);
  const sources = Array.isArray(r[15]) ? r[15].flat().filter((s) => typeof s === 'string') : [];
  const traditions = Array.isArray(r[17]) ? r[17].map((a) => tradAbbr.get(a) ?? a) : [];
  const ifac = IF.includes((r[14] || '').toUpperCase()) ? r[14].toUpperCase() : 'A';
  const aspect = Array.isArray(r[13]) ? r[13].filter((x) => typeof x === 'string').join(', ') : (r[13] || '').toString();
  const entry = {
    name,
    label,
    check: [r[2] || 'MU', r[3] || 'MU', r[4] || 'MU'],
    traditions,
    increaseFactor: ifac,
    aspect,
    cost: (r[9] || '').toString(),
    castTime: (r[8] || '').toString(),
    range: (r[10] || '').toString(),
    duration: (r[11] || '').toString(),
    target: (r[12] || '').toString(),
    page: sources[0] || '',
    magicType: type,
    url: buildUrl(r[18]),
    sources: buildSources(r[15]),
    extensions: liturgyExtMap.get(r[0]) || [],
  };
  (/zeremonie/i.test(type) ? ceremonies : liturgies).push(entry);
}
liturgies.sort((a, b) => a.label.localeCompare(b.label, 'de'));
ceremonies.sort((a, b) => a.label.localeCompare(b.label, 'de'));
writeFileSync(resolve(ROOT, 'tools/dsa-data/liturgies.json'), JSON.stringify({ liturgies, ceremonies }, null, 2), 'utf8');

function renderLiturgy(e) {
  return [
    '  {',
    `    name: ${JSON.stringify(e.name)},`,
    `    label: ${JSON.stringify(e.label)},`,
    `    check: [${e.check.map((c) => JSON.stringify(c)).join(', ')}] as LiturgyCheck,`,
    `    traditions: [${e.traditions.map((t) => JSON.stringify(t)).join(', ')}],`,
    `    increaseFactor: IncreaseFactor.${e.increaseFactor},`,
    `    aspect: ${JSON.stringify(e.aspect)},`,
    `    cost: ${JSON.stringify(e.cost)},`,
    `    castTime: ${JSON.stringify(e.castTime)},`,
    `    range: ${JSON.stringify(e.range)},`,
    `    duration: ${JSON.stringify(e.duration)},`,
    `    target: ${JSON.stringify(e.target)},`,
    `    page: ${JSON.stringify(e.page)},`,
    `    magicType: ${JSON.stringify(e.magicType)},`,
    `    url: ${JSON.stringify(e.url)},`,
    `    sources: ${JSON.stringify(e.sources)},`,
    `    extensions: ${renderExtensions(e.extensions)},`,
    '  },',
  ].join('\n');
}
function renderLiturgyFile(typeName, constName, list) {
  return (
    `import { ${typeName}, LiturgyCheck, IncreaseFactor } from '../models/divine.model';\n\n` +
    `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (LiturgieGetInfo). Do not edit by hand. ───\n` +
    `// DSA Aventurien only. ${list.length} entries.\n\n` +
    `export const ${constName}: ${typeName}[] = [\n` +
    list.map(renderLiturgy).join('\n') +
    `\n];\n`
  );
}
writeFileSync(resolve(CONST_DIR, 'liturgy.const.ts'), renderLiturgyFile('Liturgy', 'ALL_LITURGIES', liturgies), 'utf8');
writeFileSync(resolve(CONST_DIR, 'ceremony.const.ts'), renderLiturgyFile('Ceremony', 'ALL_CEREMONIES', ceremonies), 'utf8');
console.log(`Liturgies: ${liturgies.length}, Ceremonies: ${ceremonies.length}, excluded: ${litExcluded}`);

// ── Professions (ProfessionGetInfo) ───────────────────────────────────────────
const SPINOFF = new Set(['SPC', 'CtC']); // Cthulhu Mythos / "die schwarze Katze" (extend with Myranor codes if found)
function idLabelMap(fn) {
  const map = new Map();
  for (const r of parseGetInfo(functionBody(js, fn))) if (r[0] && r[1]) map.set(r[0], r[1]);
  return map;
}
function pairs(arr) {
  const out = [];
  if (!Array.isArray(arr)) return out;
  for (let i = 0; i + 1 < arr.length; i += 2) out.push([arr[i], arr[i + 1]]);
  return out;
}
function isDsa(sources) {
  if (!Array.isArray(sources) || !sources.length) return true;
  return sources.some((s) => !SPINOFF.has((s || '').toString().split(' ')[0]));
}

const vt = idLabelMap('VorteilGetInfo');
const nt = idLabelMap('NachteilGetInfo');

const profs = [];
let profExcluded = 0;
for (const r of parseGetInfo(functionBody(js, 'ProfessionGetInfo'))) {
  const books = Array.isArray(r[24]) ? r[24].flat().filter((s) => typeof s === 'string') : [];
  const label = cleanText((r[0] || r[1] || '').toString()); // [0] = gender-neutral "Name divers"
  const subType = cleanText((r[23] || '').toString());
  if (!isDsa(books) || /Mythos|Myranor/i.test(label) || /Mythos|Myranor/i.test(subType)) {
    profExcluded++;
    continue;
  }
  // Special-ability grants per category → { label, param? } (gender-neutral labels, empty params dropped).
  const saGroup = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((e) => {
        const [l, p] = Array.isArray(e) ? e : [e, ''];
        const lbl = cleanText(String(l ?? '')).trim();
        return lbl ? { label: lbl, ...(p ? { param: cleanText(String(p)) } : {}) } : null;
      })
      .filter(Boolean);
  const generalSpecialAbilities = saGroup(r[8]); // SFAllgemein
  const combatSpecialAbilities = saGroup(r[9]); // SFKampf
  const karmalSpecialAbilities = saGroup(r[10]); // SFKarma
  const magicSpecialAbilities = saGroup(r[11]); // SFMagie

  const blessings = (Array.isArray(r[19]) ? r[19] : []).filter((x) => typeof x === 'string').map(cleanText);
  const has21 = Array.isArray(r[21]) && r[21].length > 0; // Zauber
  const apRaw = (r[3] || '').toString();
  // Raw advantage/disadvantage grant tuples — resolved to canonical refs at end of file.
  const advRaw = decSpeciesList(Array.isArray(r[6]) ? r[6] : [], vt);
  const disRaw = decSpeciesList(Array.isArray(r[7]) ? r[7] : [], nt);
  const advLabels = advRaw.map((e) => e.label);
  // Category (big-3): priests grant Geweihte:r / blessings; casters grant spells / a magic tradition.
  const isKarmal = blessings.length > 0 || /Geweihte/i.test(subType) || advLabels.some((a) => /Geweihte/i.test(a)) || karmalSpecialAbilities.length > 0;
  const isMagic = !isKarmal && (has21 || magicSpecialAbilities.length > 0 || advLabels.some((a) => /Zauber/i.test(a)));
  const category = isKarmal ? 'karmal' : isMagic ? 'magic' : 'profane';
  // Tradition = the "Tradition" SA's param in the relevant magic/karmal SA group.
  const tradOf = (group) => (group.find((g) => /^Tradition/i.test(g.label)) || {}).param || '';
  const tradition = isKarmal ? tradOf(karmalSpecialAbilities) : tradOf(magicSpecialAbilities);
  const spells = pairs(r[21]).map(([l, f]) => ({ label: cleanText(String(l)), fw: Number(f) || 0 })); // [21] Zauber
  const liturgies = pairs(r[18]).map(([l, f]) => ({ label: cleanText(String(l)), fw: Number(f) || 0 })); // [18] Liturgie
  const languageGrants = (Array.isArray(r[12]) ? r[12] : []).map((e) => {
    const lbl = cleanText(String(Array.isArray(e) ? e[0] : e));
    const lvlTok = Array.isArray(e) ? String(e[1] || '') : '';
    return { label: lbl, level: ROMAN[lvlTok.trim()] || 0, scriptAllowed: /oder\s+Schrift/i.test(lbl) };
  });
  const scriptGrants = (Array.isArray(r[13]) ? r[13] : []).map((e) => cleanText(String(Array.isArray(e) ? e[0] : e))).filter(Boolean);
  const cantrips = (Array.isArray(r[22]) ? r[22] : []).filter((x) => typeof x === 'string').map(cleanText);

  profs.push({
    name: slug(label),
    label,
    category,
    subType,
    apCost: parseInt(apRaw, 10) || 0,
    apRaw,
    modificationNotes: cleanText((r[4] || '').toString()),
    // AP allowance the profession allocates to languages/scripts ("X AP in Sprachen & Schriften").
    languageScriptAp: Number((cleanText((r[4] || '').toString()).match(/(\d+)\s*AP in Sprachen/i) || [])[1]) || 0,
    attributeRequirements: pairs(r[5]).map(([a, m]) => ({ attribute: String(a), min: Number(m) || 0 })),
    __advRaw: advRaw,
    __disRaw: disRaw,
    generalSpecialAbilities,
    combatSpecialAbilities,
    magicSpecialAbilities,
    karmalSpecialAbilities,
    tradition,
    languageGrants,
    scriptGrants,
    cantrips,
    combatTechniques: pairs(r[14]).map(([l, k]) => ({ label: cleanText(String(l)), ktw: Number(k) || 0 })),
    skills: pairs(r[16]).map(([l, f]) => ({ label: cleanText(String(l)), bonus: Number(f) || 0 })),
    guidingAttribute: (isKarmal ? r[17] : r[20]) ? String(isKarmal ? r[17] : r[20]).trim() : '',
    spells: category === 'karmal' ? [] : spells,
    liturgies: category === 'karmal' ? liturgies : [],
    blessings,
    books,
  });
}
const seenP = new Set();
for (const p of profs) {
  while (seenP.has(p.name)) p.name += 'x';
  seenP.add(p.name);
}
profs.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label, 'de'));
// profession.const.ts / professions.json are written at the END of the file, once the catalog +
// SELECTION_OPTIONS + the species id→slug / param→option translation exist (grants resolved to refs).

// ── Species (SpeziesGetInfo) ──────────────────────────────────────────────────
// Authoritative reference only (NOT a const regen): the 10 Aventurien species in
// species.const.ts are hand-curated with chosen slugs, and the advantage catalog
// is incomplete — so we emit a JSON report and backfill levels into the const by
// hand. Levels are baked into the VT/NT id (e.g. VT27="Dunkelsicht I",
// VT28="Dunkelsicht II"); the second tuple element is a sub-selection qualifier.
// Slots: [9] auto+, [10] auto−, [11] recommended+, [12] recommended−,
//        [13] typical+, [14] typical−, [15] atypical+, [16] atypical−.
// Species records key on numeric/array fields (AP cost, base stats), so the
// shared parseGetInfo (string/array only, validates on field[1]) misses them.
// Dedicated line-based parser: capture every `aDaten[i] = …;` and key on [0].
function parseSpeciesGetInfo(body) {
  const records = [];
  for (const chunk of body.split('break;')) {
    const f = {};
    const fre = /aDaten\[(\d+)\]\s*=\s*(.+);\s*$/gm;
    let fm;
    let any = false;
    while ((fm = fre.exec(chunk)) !== null) {
      try {
        f[Number(fm[1])] = JSON.parse(fm[2]);
      } catch {
        f[Number(fm[1])] = parseValue(fm[2]);
      }
      any = true;
    }
    if (any && f[0]) records.push(f);
  }
  return records;
}
function splitLevel(label) {
  const m = /^(.*?)[\s ]+([IVX]+)$/.exec(label); // [IVX]+ (ROMAN-validated) reaches XII → Reich VIII/IX/X collapse into one concept
  if (m && ROMAN[m[2]]) return { base: m[1].trim(), level: ROMAN[m[2]] };
  // Roman numeral before a trailing qualifier, e.g. "Feenpakt I (Hohe Fee)" → "Feenpakt (Hohe Fee)".
  const mp = /^(.*?)\s+([IVX]+)\s+(\(.+\))$/.exec(label);
  if (mp && ROMAN[mp[2]]) return { base: `${mp[1].trim()} ${mp[3].trim()}`, level: ROMAN[mp[2]] };
  return { base: label, level: null };
}
function decSpeciesList(arr, map) {
  return (Array.isArray(arr) ? arr : []).map((e) => {
    const id = Array.isArray(e) ? e[0] : e;
    const param = Array.isArray(e) ? e[1] || '' : '';
    const label = cleanText(map.get(id) || id);
    const { base, level } = splitLevel(String(label));
    return { vtId: id, label: String(label), base, level, param };
  });
}
const species = [];
for (const r of parseSpeciesGetInfo(functionBody(js, 'SpeziesGetInfo'))) {
  const books = Array.isArray(r[24]) ? r[24].flat().filter((s) => typeof s === 'string') : [];
  species.push({
    code: r[0],
    apCost: r[1],
    sources: books,
    dsa: isDsa(books),
    autoAdvantages: decSpeciesList(r[9], vt),
    autoDisadvantages: decSpeciesList(r[10], nt),
    recommendedAdvantages: decSpeciesList(r[11], vt),
    recommendedDisadvantages: decSpeciesList(r[12], nt),
    typicalAdvantages: decSpeciesList(r[13], vt),
    typicalDisadvantages: decSpeciesList(r[14], nt),
    atypicalAdvantages: decSpeciesList(r[15], vt),
    atypicalDisadvantages: decSpeciesList(r[16], nt),
  });
}
writeFileSync(resolve(ROOT, 'tools/dsa-data/species.json'), JSON.stringify(species, null, 2), 'utf8');
console.log(`Species: ${species.length} (DSA: ${species.filter((s) => s.dsa).length}). Wrote tools/dsa-data/species.json`);

// ── Advantages / Disadvantages (VorteilGetInfo / NachteilGetInfo) ──────────────
// Regenerate advantage.const.ts. Entries are matched to the existing hand-built file
// by their regelwiki URL (encoding-independent) so slugs, costs and the hand-built
// `prerequisite` arrays are preserved; only the label becomes gender-neutral ([1]) and
// `type`/`speciesSpecific`/`selection` are added. Unmatched PDF entries are appended
// as new (prerequisite: []). Levels (separate "X I"/"X II" ids) collapse to one entry.
const ADV_PATH = resolve(CONST_DIR, 'advantage.const.ts');
// Stable snapshot of the hand-built catalog (slugs + curated prerequisites). The generator
// reads THIS (not its own output) so re-runs are idempotent. Edit curated prereqs here.
const ADV_HAND = resolve(ROOT, 'tools/dsa-data/advantage-hand.const.txt');

// German number words → max-count for selection advantages (parsed from the rule text).
const NUMWORD = { ein: 1, eine: 1, einen: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, fuenf: 5 };

// ── Generic selection resolver ────────────────────────────────────────────────
// Every `XxxArray()` lists its options from a data fn; trace it and resolve the
// actual option labels (Mythos sub-options excluded), keyed in SELECTION_OPTIONS.
const WERK_RECORDS = parseGetInfo(functionBody(js, 'WerkGetInfo'));
const ALL_WORKS = new Set(WERK_RECORDS.map((w) => w[0]));

// book.const.ts — abbreviation → full title, so the UI can spell out a source like "AM1 114".
// Only the abbreviation used to be kept (for ALL_WORKS); the titles were parsed and thrown away.
{
  const titles = {};
  for (const w of WERK_RECORDS) if (w[0] && w[1]) titles[w[0]] = String(w[1]).trim();
  const body = Object.entries(titles)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('\n');
  const out =
    `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (WerkGetInfo). ───\n` +
    `// Abbreviation → full German title of the rule book, for resolving source references like\n` +
    `// "AM1 114" into something readable. The PDF's Typ/Opt_ID columns are not needed here.\n\n` +
    `export const BOOK_TITLES: Record<string, string> = {\n${body}\n};\n`;
  writeFileSync(resolve(CONST_DIR, 'book.const.ts'), out, 'utf8');
  console.log(`Books: ${Object.keys(titles).length} titles from WerkGetInfo. Wrote book.const.ts`);
}
const SEL_DATA_FN = { GliederArray: 'GliederInfo', AhnenblutArray: 'AhnenblutInfo', AhnenblutAhnArray: 'AhnenblutAhnInfo', ZauberMerkmalArray: 'MerkmalGetInfo', ArtikelAspektArray: 'AspektGetInfo', SchlechteEigenschaftArray: 'SchlechteEigenschaftGetInfo' };
// Selection sources whose options carry a Steigerungsfaktor (skills) rather than a fixed cost —
// the consuming advantage is SF-priced (cost × SF-index of the chosen option).
const SF_COST_SOURCES = new Set(['GesamtArray', 'TalentArray', 'KampftechnikArray']);
// Single leveled advantages whose call-arg is the level/tier (not an option filter): expose all tiers.
const LEVEL_TIER_SOURCES = new Set(['PrinzipienArray', 'VerpflichtungArray']);
const normFactor = (v) => { const s = String(v ?? '').trim().toUpperCase(); return /^[A-E]$/.test(s) ? s : undefined; };
const isCode = (s) => /^[A-Z][A-Za-z]*\d+$/.test(String(s)); // Tal2, VT27, NT93 …
function selSourceField(f) {
  for (const k of Object.keys(f)) {
    const v = f[k];
    if (Array.isArray(v) && v.length && v.every((x) => typeof x === 'string' && ALL_WORKS.has(x.split(' ')[0]))) return v;
  }
  return null;
}
function selOnlyMythos(f) {
  const s = selSourceField(f);
  return s ? s.every((x) => MYTHOS_BOOKS.has(x.split(' ')[0])) : false;
}
function selLabelOf(f) {
  for (const i of [1, 2, 3, 0]) {
    const v = f[i];
    if (typeof v === 'string' && v.trim() && !isCode(v)) return v.trim();
  }
  return null;
}
function dataFnRecords(getInfoFn) {
  if (!functionBody(js, getInfoFn)) return [];
  return parseAdv(getInfoFn).filter((f) => f[1] !== undefined);
}
// Per data-fn config: which InfoID holds the per-option cost, how the call argument filters the
// list, and whether options carry build-up chains. Field indices are resolved generically from
// each GetInfo's tail `switch(pInfoID)` map (tailInfoMap), so only the InfoID names live here.
const SEL_CFG = {
  // Ahnenblut benefits (Dickes Fell, …): the Regel prose carries "Voraussetzungen: … <Blut> (Typ oder Typ)",
  // gating the benefit to specific ancestor types picked in the AhnenblutAhnArray selection → requiresAncestor.
  AhnenblutInfo: { cost: 'AP', filter: { id: 'Gruppe', op: 'in' }, ancestorRef: 'AhnenblutAhnArray', ancestorRule: 'Regel' },
  AhnenblutAhnInfo: { cost: 'AP', filter: { id: 'Gruppe', op: 'in' } },
  // Schlechte Eigenschaft (Naiv, Neugier, …): the per-trait AP value lives in the "Stufe" field (already
  // signed negative), like Persönlichkeitsschwäche (PersonGetInfo).
  SchlechteEigenschaftGetInfo: { cost: 'Stufe' },
  PaktGetInfo: { filter: { id: 'Typ', op: '==' }, domain: 'Domäne' },
  TitelGetInfo: { cost: 'AP', filter: { id: 'Typ', op: '==' }, requires: 'Regel' },
  StrafeGetInfo: { cost: 'AP', filter: { id: 'Typ', op: '==' }, requires: 'Regel' },
  HassGetInfo: { filter: { id: 'Stufe', op: '==' } },
  KultGetInfo: { filter: { id: 'Max', op: '>=' } },
  PrinzipienGetInfo: { filter: { id: 'Stufe', op: '==' } },
  VerpflichtungGetInfo: { filter: { id: 'Stufe', op: '==' } },
  PatronGetInfo: { filter: { id: 'Gruppe', op: '==' } },
  PersonGetInfo: { cost: 'Stufe' }, // Persönlichkeitsschwäche: "Stufe" field holds the AP delta
  GliederInfo: { cost: 'AP' },
  GliedmassenGetInfo: { cost: 'AP' },
  NaturWaffeGetInfo: { cost: 'AP' },
  WesenGetInfo: { wesen: true }, // label = "Wesen …" (Vorteil) / "Fluch …" (Nachteil)
  // Kontakt: (Name) — KontaktGetInfo has NO AP field. A contact is priced by its own Einfluss (E) and
  // Zuverlässigkeit (Z) as E² + Z², so the flat 2 AP on the advantage is only the generic contact's
  // price (E1/Z1). `derive` runs after the slug is taken from the plain label, so the option name
  // stays `bettler` while the label gains the two values — they are needed at the table, not just here.
  KontaktGetInfo: { derive: kontaktOption },
};

/** Kontakt sub-option: price = E² + Z², with both values kept as data and shown in the label. */
function kontaktOption(opt, rec, map) {
  const e = Number(rec[map['E']]);
  const z = Number(rec[map['Z']]);
  if (!Number.isFinite(e) || !Number.isFinite(z) || e <= 0 || z <= 0) return;
  opt.cost = e * e + z * z;
  opt.influence = e;
  opt.reliability = z;
  opt.label = `${opt.label} - E: ${e}; Z: ${z}`;
}

// InfoID → aDaten index, parsed from the GetInfo's closing `switch(pInfoID)` return map.
const selMapCache = new Map();
function tailInfoMap(dataFn) {
  if (selMapCache.has(dataFn)) return selMapCache.get(dataFn);
  const b = functionBody(js, dataFn);
  const map = {};
  if (b) {
    const tail = b.slice(b.lastIndexOf('break;'));
    for (const mm of tail.matchAll(/case\s+"([^"]+)"\s*:\s*return\s+(?:WerkExtrakt\()?aDaten\[(\d+)\]/g)) if (!(mm[1] in map)) map[mm[1]] = Number(mm[2]);
  }
  selMapCache.set(dataFn, map);
  return map;
}

const selCache = new Map();
function resolveSelectionOptions(arrayFn, param) {
  const cacheKey = selKey(arrayFn, param || null);
  if (selCache.has(cacheKey)) return selCache.get(cacheKey);
  let opts;
  if (arrayFn === 'GesamtArray') {
    // Begabung/Unfähig: every Talent + Zauber + Liturgie name.
    const seen = new Set();
    opts = [];
    for (const fn of ['TalentGetInfo', 'ZauberGetInfo', 'LiturgieGetInfo']) {
      const sfIdx = tailInfoMap(fn)['SF'];
      for (const r of dataFnRecords(fn)) {
        if (selOnlyMythos(r)) continue;
        const l = selLabelOf(r);
        if (!l) continue;
        const name = slug(l);
        if (!name || seen.has(name)) continue;
        seen.add(name);
        const opt = { name, label: l };
        const f = sfIdx != null ? normFactor(r[sfIdx]) : undefined;
        if (f) opt.factor = f;
        opts.push(opt);
      }
    }
  } else if (arrayFn === 'GruppeArray') {
    // Talent-group pick (e.g. "Begabung für Handwerk"): list talents of the group (param before "|"; "alle"=all).
    const grp = String(param || '').split('|')[0].trim();
    const tm = tailInfoMap('TalentGetInfo');
    const nameIdx = tm['Name'] ?? tm['Name divers'] ?? 2;
    const grpIdx = tm['Gruppe'];
    const sfIdx = tm['SF'];
    const seen = new Set();
    opts = [];
    for (const r of dataFnRecords('TalentGetInfo')) {
      if (selOnlyMythos(r)) continue;
      if (grp && grp.toLowerCase() !== 'alle' && grpIdx != null && String(r[grpIdx]) !== grp) continue;
      const l = r[nameIdx];
      if (typeof l !== 'string' || !l.trim() || isCode(l)) continue;
      // The option name is the talent LABEL (not slug): talents are referenced by label everywhere
      // (character.skills[].name, talent requirements), so `selectedTalent` and the SF cost lookup match
      // the chosen param against the skill/label directly. A slug (ö→oe) would never match (label ö→o).
      const name = l.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const opt = { name, label: l.trim() };
      const f = sfIdx != null ? normFactor(r[sfIdx]) : undefined;
      if (f) opt.factor = f;
      opts.push(opt);
    }
  } else {
    const dataFn = SEL_DATA_FN[arrayFn] || arrayFn.replace('Array', 'GetInfo');
    const cfg = SEL_CFG[dataFn] || {};
    const map = tailInfoMap(dataFn);
    const labelIdx = map['Name'] ?? map['Name divers'] ?? 1;
    const sfIdx = map['SF']; // skills/combat techniques expose a Steigerungsfaktor (for SF-priced advantages)
    const costIdx = cfg.cost ? map[cfg.cost] : undefined;
    const filterIdx = cfg.filter ? map[cfg.filter.id] : undefined;
    const domIdx = cfg.domain ? map[cfg.domain] : undefined;
    const reqIdx = cfg.requires ? map[cfg.requires] : undefined;
    const built = [];
    const seen = new Set();
    for (const r of dataFnRecords(dataFn)) {
      if (selOnlyMythos(r)) continue;
      if (cfg.filter && param != null && filterIdx != null) {
        const fv = r[filterIdx];
        const op = cfg.filter.op;
        const ok = op === 'in' ? (Array.isArray(fv) ? fv.includes(param) : String(fv) === param) : op === '>=' ? Number(fv) >= Number(param) : String(fv) === String(param);
        if (!ok) continue;
      }
      let label = cfg.wesen ? (param === 'Nachteil' ? 'Fluch ' : 'Wesen ') + r[1] : r[labelIdx];
      if (!cfg.wesen && domIdx != null && r[domIdx]) label = `${label} (${r[domIdx]})`;
      if (typeof label !== 'string' || !label.trim() || isCode(label)) continue;
      label = label.trim();
      const name = slug(label);
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const opt = { name, label };
      if (costIdx != null) {
        const c = Number(r[costIdx]);
        if (Number.isFinite(c)) opt.cost = c;
      }
      if (sfIdx != null) {
        const f = normFactor(r[sfIdx]);
        if (f) opt.factor = f;
      }
      // Per-source derivation (cost/label from fields that are not a plain AP column). Runs last so
      // `name` is already slugged from the undecorated label and stays stable across regenerations.
      if (cfg.derive) cfg.derive(opt, r, map);
      built.push({ opt, rec: r });
    }
    // Build-up chains: an option's own "Voraussetzung(en):" line may reference a prior option of
    // the same group by its gendered name forms (e.g. Mag:a ← "Adeptus/Adepta maior").
    if (reqIdx != null) {
      for (const b of built) {
        const mm = String(b.rec[reqIdx] || '').match(/Voraussetzung(?:en)?:\s*([^\n]*)/i);
        if (!mm) continue;
        const refKey = labelKey(mm[1].replace(/\//g, ' '));
        const requires = [];
        for (const other of built) {
          if (other === b) continue;
          const forms = [other.rec[1], other.rec[2], other.rec[3]].filter((x) => typeof x === 'string' && x.trim()).map(labelKey).filter((k) => k.length > 4);
          if (forms.some((k) => refKey.includes(k))) requires.push(other.opt.name);
        }
        if (requires.length) b.opt.requires = requires;
      }
    }
    // Cross-selection ancestor gating (Ahnenblut): a benefit option's Regel "Voraussetzungen:" line may
    // require a specific ancestor type from another selection (AhnenblutAhnArray), e.g.
    // "Voraussetzungen: Vorteil Feenblut (Großer Biestinger oder Satyr)". Map the parenthesised type names
    // to that selection's option slugs → requiresAncestor. Exact labelKey match keeps unrelated conditions out.
    if (cfg.ancestorRef && cfg.ancestorRule) {
      const ruleIdx = tailInfoMap(dataFn)[cfg.ancestorRule];
      const ancestors = resolveSelectionOptions(cfg.ancestorRef, param);
      if (ruleIdx != null && ancestors.length) {
        for (const b of built) {
          const vm = String(b.rec[ruleIdx] || '').match(/Voraussetzung(?:en)?:\s*([^\n]*)/i);
          if (!vm) continue;
          const pm = vm[1].match(/\(([^)]*)\)/);
          if (!pm) continue;
          const wanted = new Set(pm[1].split(/\s+oder\s+|\s+und\s+|,\s*/i).map((s) => labelKey(s)).filter((k) => k.length > 2));
          const req = ancestors.filter((a) => wanted.has(labelKey(a.label))).map((a) => a.name);
          if (req.length) b.opt.requiresAncestor = req;
        }
      }
    }
    opts = built.map((b) => b.opt);
  }
  opts = opts.filter((o) => !MYTHOS_OPTION_RE.test(o.label)); // drop Cthulhu/Dreamlands sub-options
  opts.sort((a, b) => a.label.localeCompare(b.label, 'de'));
  selCache.set(cacheKey, opts);
  return opts;
}

// Normalized match key from a label: strip gender suffix, "(*)", roman level/range, fold umlauts.
// Matching uses the male form ([2]) on the PDF side and the hand label, which align.
function labelKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\(\*\)/g, '')
    .replace(/:in|:r|:e\b/g, '')
    .replace(/[……]/g, '')
    .replace(/\s+[ivx]+\s*[-–]\s*[ivx]+/g, '') // roman range "I-II"
    .replace(/\s+[ivx]+$/g, '') // trailing roman "II"
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '');
}

// Parse the existing hand catalog → labelKey → { slug, cost, lvl, maxLvl, prerequisite, speciesRestrictionRaw, sourcesRaw, url, label }.
function parseHandCatalog() {
  const text = readFileSync(ADV_HAND, 'utf8');
  const byLabel = new Map();
  const all = [];
  // Quote-agnostic so the generator is re-runnable on its own (double-quoted) output.
  const blockRe = /\{\s*\n\s*name: ["']([^"']+)["'],[\s\S]*?\n {2}\},/g;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    const block = m[0];
    const slug = m[1];
    const grab = (re) => { const x = block.match(re); return x ? x[1] : null; };
    const prereqRaw = grab(/prerequisite: (\[[\s\S]*?\])/);
    const prerequisite = [];
    if (prereqRaw) {
      const pre = /\{\s*name: ["']([^"']+)["'],\s*required: (true|false)(?:,\s*minLvl: (\d+))?\s*\}/g;
      let pm;
      while ((pm = pre.exec(prereqRaw)) !== null) {
        const p = { name: pm[1], required: pm[2] === 'true' };
        if (pm[3]) p.minLvl = Number(pm[3]);
        prerequisite.push(p);
      }
    }
    const entry = {
      slug,
      label: grab(/label: ["']([^"']*)["']/),
      cost: grab(/cost: (-?\d+)/) != null ? Number(grab(/cost: (-?\d+)/)) : 0,
      lvl: grab(/lvl: (\d+)/) != null ? Number(grab(/lvl: (\d+)/)) : null,
      maxLvl: grab(/maxLvl: (\d+)/) != null ? Number(grab(/maxLvl: (\d+)/)) : null,
      prerequisite,
      speciesRestrictionRaw: grab(/speciesRestriction: (\[[^\]]*\])/),
      sourcesRaw: grab(/sources: (\[[^\]]*\])/),
      url: grab(/url: ["']([^"']*)["']/),
    };
    all.push(entry);
    const k = labelKey(entry.label);
    if (k && !byLabel.has(k)) byLabel.set(k, entry);
  }
  return { byLabel, all };
}

// Parse a Vorteil/Nachteil GetInfo: keep first assignment per index; detect the [5] selection fn.
function parseAdv(fnName) {
  const recs = [];
  for (const ch of functionBody(js, fnName).split('break;')) {
    const f = {};
    // Line-anchored: value runs to the line-ending ';' so rule-text strings containing
    // ';' aren't truncated (which previously bled fields across entries).
    const fre = /aDaten\[(\d+)\]\s*=\s*(.+?);\s*$/gm;
    let fm;
    let any = false;
    while ((fm = fre.exec(ch)) !== null) {
      const idx = Number(fm[1]);
      if (f[idx] !== undefined) continue;
      const raw = fm[2].trim();
      try { f[idx] = JSON.parse(raw); } catch { f[idx] = raw.replace(/^"|"$/g, ''); }
      any = true;
    }
    if (!any || !f[0]) continue;
    const sel = ch.match(/aDaten\[5\] = (\w+Array)\(([^)]*)\)/); // may carry args, e.g. WesenArray("Vorteil")
    f.__selFn = sel ? sel[1] : null;
    f.__selParam = sel ? sel[2].trim().replace(/^["']|["']$/g, '') || null : null; // call arg = type/species/tier filter
    f.__selId = Array.isArray(f[10]) && typeof f[10][1] === 'string' && /ID$/.test(f[10][1]) ? f[10][1] : null;
    recs.push(f);
  }
  return recs;
}

function maxCountFromText(text) {
  const m = String(text || '').match(/(?:bis zu|nicht mehr als|höchstens|maximal)\s+(\w+)/i);
  return m && NUMWORD[m[1].toLowerCase()] ? NUMWORD[m[1].toLowerCase()] : undefined;
}

function costNumber(raw) {
  const s = String(raw ?? '').split('/')[0].trim();
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

function sourcesFromPdf(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((s) => typeof s === 'string')
    .map((s) => {
      const mm = s.match(/^(\S+)\s+(\d+)/);
      return mm ? { book: mm[1], page: Number(mm[2]) } : { book: s };
    });
}

// Group PDF records into concepts by normalized label (collapses level + gender variants).
function buildConcepts(records) {
  const byKey = new Map();
  for (const r of records) {
    const male = String(r[2] || r[1] || '');
    const key = labelKey(splitLevel(male).base) || 'id:' + r[0];
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(r);
  }
  const concepts = [];
  for (const [key, members] of byKey) {
    const levels = members.map((m) => splitLevel(String(m[1])).level).filter((x) => x != null);
    const isLeveled = levels.length > 0;
    // Representative = lowest-level member, so display label/selection come from level I.
    const sorted = members.slice().sort((a, b) => (splitLevel(String(a[1])).level || 0) - (splitLevel(String(b[1])).level || 0));
    const rep = sorted[0];
    const label = cleanText(isLeveled ? splitLevel(String(rep[1])).base : String(rep[1]));
    // Absolute AP per level (Einkommen 0/2/6/20/60/200 is non-linear, so a single per-level cost is wrong).
    const costLevels = isLeveled ? sorted.map((mm) => costNumber(mm[4])) : undefined;
    concepts.push({ key, rep, isLeveled, maxLvl: isLeveled ? Math.max(...levels) : undefined, label, costLevels });
  }
  return concepts;
}

// MYTHOS_BOOKS (Cthulhu / "Schwarze Katze" titles) is defined near the top of this file.
function isDsaAdv(rep) {
  const type = String(rep[8] || '');
  if (type === 'Cthulhu' || type === 'Wahnsinn') return false; // Mythos categories
  if (/Mythos/i.test(String(rep[1] || ''))) return false; // e.g. Mythos-Blut
  const codes = (Array.isArray(rep[7]) ? rep[7] : []).filter((s) => typeof s === 'string').map((s) => s.split(' ')[0]);
  if (!codes.length) return true; // unsourced → keep
  return codes.some((c) => !MYTHOS_BOOKS.has(c)); // drop entries sourced only from Mythos
}

const hand = parseHandCatalog();
const usedSlugs = new Set();
// composite registry key (`fn` or `fn:param`) → { fn, param } for every selection actually referenced.
const usedSelectors = new Map();
const selKey = (fn, param) => (param ? `${fn}:${param}` : fn);
function uniqueSlug(base) {
  let s = base || 'eintrag';
  while (usedSlugs.has(s)) s += 'x';
  usedSlugs.add(s);
  return s;
}

function buildEntries(fnName) {
  const entries = [];
  for (const c of buildConcepts(parseAdv(fnName))) {
    const rep = c.rep;
    if (!isDsaAdv(rep)) continue;
    const handEntry = hand.byLabel.get(c.key);
    const type = rep[8] && rep[8] !== '*' ? rep[8] : undefined;
    const speciesSpecific = rep[8] === '*' || undefined;
    // PDF name variants (divers / male / female) → alias keys so masculine refs like "Schurkenname"
    // resolve to the gender-neutral catalog slug ("schurkinname").
    const forms = [rep[1], rep[2], rep[3]].filter((x) => typeof x === 'string' && x.trim());
    let selection;
    if (rep.__selFn) {
      // Prinzipien/Verpflichtung are single leveled advantages whose tier == the level, not an option
      // filter — expose ALL options (drop the tier param) so any-tier principles/obligations resolve.
      const param = LEVEL_TIER_SOURCES.has(rep.__selFn) ? undefined : rep.__selParam || undefined;
      usedSelectors.set(selKey(rep.__selFn, param), { fn: rep.__selFn, param: param || null });
      selection = { id: rep.__selFn };
      if (param) selection.param = param;
      const mc = maxCountFromText(rep[6]);
      if (mc) selection.maxCount = mc;
    }
    // SF-priced: cost field is an "X/Y" range and the option source carries a Steigerungsfaktor
    // but no fixed per-option cost (Begabung, Unfähig, Herausragende Fertigkeit/Kampftechnik, …).
    // `cost` becomes the per-SF-point value (X); effective cost = X × SF-index of the chosen option.
    const sfBased = typeof rep[4] === 'string' && rep[4].includes('/') && SF_COST_SOURCES.has(rep.__selFn) ? true : undefined;
    if (handEntry) {
      handEntry.__matched = true;
      const slugName = handEntry.slug;
      usedSlugs.add(slugName);
      entries.push({
        name: slugName,
        label: c.label,
        // SF-priced entries must use the per-SF base from the PDF (X in "X/Y"), not the curated flat cost.
        cost: sfBased ? costNumber(rep[4]) : handEntry.cost,
        lvl: handEntry.lvl,
        maxLvl: handEntry.maxLvl,
        costLevels: sfBased ? undefined : c.costLevels,
        prerequisite: handEntry.prerequisite,
        speciesRestrictionRaw: handEntry.speciesRestrictionRaw,
        type,
        speciesSpecific,
        selection,
        costBySteigerungsfaktor: sfBased,
        sourcesRaw: handEntry.sourcesRaw,
        url: handEntry.url,
        __vor: String(rep[6] || ''),
        __forms: forms,
      });
    } else {
      const url = Array.isArray(rep[9]) ? rep[9][0] : rep[9];
      entries.push({
        name: uniqueSlug(slug(c.label)),
        label: c.label,
        cost: costNumber(rep[4]),
        lvl: c.isLeveled ? 1 : null,
        maxLvl: c.maxLvl ?? null,
        costLevels: c.costLevels,
        prerequisite: [],
        type,
        speciesSpecific,
        selection,
        costBySteigerungsfaktor: sfBased,
        sources: sourcesFromPdf(rep[7]),
        url: url ? (String(url).startsWith('http') ? url : 'https://dsa.ulisses-regelwiki.de/' + url) : undefined,
        __vor: String(rep[6] || ''),
        __forms: forms,
      });
    }
  }
  return entries;
}

// Parse the PDF "Voraussetzung(en):" free text (singular AND plural) into structured
// prerequisites, resolving named advantages/disadvantages against a labelKey→slug index.
// The verbatim text is preserved separately so narrative conditions are never lost.
function resolveRefName(raw, idx) {
  let s = String(raw).replace(/\b(?:auf|für|fuer|pro|in|bei|gegen|je)\b.*$/i, '').trim();
  let qual = null;
  const qm = s.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (qm) { s = qm[1].trim(); qual = qm[2].trim(); }
  s = s.replace(/\s+(?:i{1,3}|iv|v)$/i, '').trim();
  const base = idx.get(labelKey(s));
  if (!base) return null;
  return { name: qual ? base + '_' + slug(qual) : base, qualifier: qual || undefined };
}

// Resolve a name that may be an "X oder Y oder Z" list, all sharing the given category/negation.
function pushRefs(out, raw, required, cat, idx) {
  for (const part of String(raw).split(/\s+oder\s+/i)) {
    let p = part.trim();
    if (!p) continue;
    // a sub-part can re-declare its own category, e.g. "… oder Nachteil Lächerlicher Name"
    let inner = p.match(/^(kein(?:e|er|es)?\s+)?(Vorteil|Nachteil|Sonderfertigkeit)\s+(.+)$/i);
    let req = required;
    let kind = cat;
    if (inner) {
      req = !inner[1];
      kind = inner[2].toLowerCase();
      p = inner[3].trim();
    }
    if (/^(zauberer|zauberei)/i.test(p)) { out.push({ name: 'zauberer', required: true }); continue; }
    if (/^geweihte/i.test(p)) { out.push({ name: 'geweihter', required: true }); continue; }
    const r = resolveRefName(p, idx);
    if (!r) continue; // unresolved narrative survives in prerequisiteText
    const prereqKind = kind === 'sonderfertigkeit' ? 'specialAbility' : kind === 'nachteil' ? 'disadvantage' : kind === 'vorteil' ? 'advantage' : undefined;
    out.push({ name: r.name, required: req, ...(prereqKind ? { kind: prereqKind } : {}), ...(r.qualifier ? { qualifier: r.qualifier } : {}) });
  }
}

// Returns { hadMarker, text, prereqs, speciesRestriction }.
function parseVoraussetzungen(text, idx) {
  const out = [];
  const speciesRestriction = [];
  const m = String(text || '').match(/Voraussetzung(?:en)?:\s*([\s\S]*)$/i);
  if (!m) return { hadMarker: false, text: null, prereqs: out, speciesRestriction };
  // Strip a trailing "AP-Wert: N Abenteuerpunkte" cost line that the PDF sometimes concatenates onto the
  // Voraussetzung text (e.g. "Vorteil Zauberer AP-Wert: 10 Abenteuerpunkte") — it's the cost, not a prereq.
  const v = m[1].split('\n')[0].trim().replace(/\s*AP[-\s]?Wert:.*$/i, '').trim();
  if (!v || /^keine?\b/i.test(v)) return { hadMarker: true, text: null, prereqs: out, speciesRestriction };

  let lastNeg = false;
  let lastCat = null; // 'vorteil' | 'nachteil' | 'sonderfertigkeit'
  for (let cl of v.split(/[,;]| sowie /i)) {
    cl = cl.trim();
    if (!cl) continue;
    let mm;
    if ((mm = cl.match(/^kein(?:e|er|es)?\s+(Vorteil|Nachteil|Sonderfertigkeit)\s+(.+)$/i))) {
      lastNeg = true; lastCat = mm[1].toLowerCase();
      pushRefs(out, mm[2], false, lastCat, idx);
    } else if ((mm = cl.match(/^(Vorteil|Nachteil|Sonderfertigkeit)\s+(.+)$/i))) {
      lastNeg = false; lastCat = mm[1].toLowerCase();
      pushRefs(out, mm[2], true, lastCat, idx);
    } else if (/^Zauberer/i.test(cl)) {
      lastNeg = false; lastCat = 'vorteil';
      out.push({ name: 'zauberer', required: true });
    } else if (/^Geweihte/i.test(cl)) {
      lastNeg = false; lastCat = 'vorteil';
      out.push({ name: 'geweihter', required: true });
    } else if ((mm = cl.match(/^Spezies\s+([A-ZÄÖÜ][\wäöüÄÖÜ:\- ]+?)$/)) && !/Kultur|muss|aufweisen/i.test(cl)) {
      const sp = slug(mm[1]);
      if (sp) { out.push({ name: sp, required: true, kind: 'species' }); speciesRestriction.push(sp); }
    } else if (lastCat && /^[A-ZÄÖÜ]/.test(cl)) {
      // bare continuation of the previous "kein Nachteil A, B oder C" list
      pushRefs(out, cl, !lastNeg, lastCat, idx);
    }
    // anything else is narrative → preserved only in the verbatim text
  }
  const seen = new Set();
  const prereqs = out.filter((p) => { const k = p.name + p.required + (p.kind || ''); if (seen.has(k)) return false; seen.add(k); return true; });
  return { hadMarker: true, text: v, prereqs, speciesRestriction };
}

function serPrereq(arr) {
  if (!arr || !arr.length) return '[]';
  return (
    '[' +
    arr
      .map((p) => {
        let s = `{ name: ${JSON.stringify(p.name)}, required: ${p.required}`;
        if (p.minLvl) s += `, minLvl: ${p.minLvl}`;
        if (p.kind) s += `, kind: ${JSON.stringify(p.kind)}`;
        if (p.qualifier) s += `, qualifier: ${JSON.stringify(p.qualifier)}`;
        return s + ' }';
      })
      .join(', ') +
    ']'
  );
}
function serSelection(s) {
  return `{ id: ${JSON.stringify(s.id)}${s.param ? `, param: ${JSON.stringify(s.param)}` : ''}${s.maxCount ? `, maxCount: ${s.maxCount}` : ''} }`;
}
// `costLevels` only earns a place in the const when the effective cost can't be reconstructed from the flat
// `cost` × level: for advantages the app uses cost×level (so a linear table cost[i]=cost·(i+1) is redundant —
// only Einkommen's non-linear 0/2/6/… survives); for SFs the app sums the tiers (so cost×level equals the sum
// only when every tier is equal — Finte 15/20/25 survives, a flat 15/15/15 is redundant). Both require the
// entry to actually be leveled (maxLvl > 1), which also drops a stray table on a flat entry (Lichtempfindlich).
function advCostLevelsNeeded(e) {
  const cl = e.costLevels;
  return e.maxLvl != null && e.maxLvl > 1 && Array.isArray(cl) && cl.length > 0 && !cl.every((c, i) => c === cl[0] * (i + 1));
}
function saCostLevelsNeeded(e) {
  const cl = e.costLevels;
  return e.maxLvl != null && e.maxLvl > 1 && Array.isArray(cl) && cl.length > 0 && !cl.every((c) => c === cl[0]);
}

function serEntry(e) {
  const L = ['  {', `    name: ${JSON.stringify(e.name)},`, `    label: ${JSON.stringify(e.label)},`, `    cost: ${e.cost},`];
  if (e.lvl != null) L.push(`    lvl: ${e.lvl},`);
  if (e.maxLvl != null) L.push(`    maxLvl: ${e.maxLvl},`);
  if (advCostLevelsNeeded(e)) L.push(`    costLevels: ${JSON.stringify(e.costLevels)},`);
  if (e.prerequisiteText) L.push(`    prerequisiteText: ${JSON.stringify(e.prerequisiteText)},`);
  { // drop self-references (own previous level / take-once forbidden self-ref) — see withoutSelfRefs.
    const _rq = withoutSelfRefs(e);
    if (_rq.length) L.push(`    requirements: ${serRequirements(_rq)},`);
  }
  if (e.speciesRestrictionRaw) L.push(`    speciesRestriction: ${e.speciesRestrictionRaw},`);
  if (e.type) L.push(`    type: ${JSON.stringify(e.type)},`);
  if (e.speciesSpecific) L.push(`    speciesSpecific: true,`);
  if (e.costBySteigerungsfaktor) L.push(`    costBySteigerungsfaktor: true,`);
  if (e.freeText) L.push(`    freeText: ${JSON.stringify(e.freeText)},`);
  if (e.selection) L.push(`    selection: ${serSelection(e.selection)},`);
  if (e.sourcesRaw) L.push(`    sources: ${e.sourcesRaw},`);
  else if (e.sources && e.sources.length) L.push(`    sources: ${JSON.stringify(e.sources)},`);
  if (e.url) L.push(`    url: ${JSON.stringify(e.url)},`);
  L.push('  },');
  return L.join('\n');
}

// ── Structured prerequisite parser: prerequisiteText → Requirement[] (+ style grant-lists) ──────
// Classifies each "Voraussetzungen:" fragment into a machine-checkable Requirement. Cross-catalog name
// sets (built from the PDF tables) disambiguate a "<Name> N" token (talent vs combat technique vs spell).
// Fragments it can't understand fall back to type:'narrative' and are collected for the coverage report.
function labelKeySet(fn, nameIdx) {
  const out = new Set();
  for (const r of parseGetInfo(functionBody(js, fn))) { const v = r[nameIdx]; if (typeof v === 'string') out.add(labelKey(cleanText(v))); }
  return out;
}
const REQ_TALENTS = labelKeySet('TalentGetInfo', 2);
const REQ_CTECHS = labelKeySet('KampftechnikGetInfo', 1);
const REQ_SPELLS = labelKeySet('ZauberGetInfo', 1);
const REQ_LITURGIES = labelKeySet('LiturgieGetInfo', 1);
// Cantrip (Zaubertrick) labelKey → slug, read from the hand-curated cantrip.const.ts (no ZaubertrickGetInfo
// in the PDF), so "Zaubertrick <Name>" resolves to a real cantrip slug.
const CANTRIP_BY_LABELKEY = new Map();
for (const cm of readFileSync(resolve(CONST_DIR, 'cantrip.const.ts'), 'utf8').matchAll(/name:\s*"([^"]+)",\s*label:\s*"([^"]+)"/g)) {
  CANTRIP_BY_LABELKEY.set(labelKey(cm[2]), cm[1]);
  CANTRIP_BY_LABELKEY.set(labelKey(cm[1]), cm[1]);
}
const REQ_TRADITIONS = new Set();
for (const r of parseSpeciesGetInfo(functionBody(js, 'TraditionGetInfo'))) { if (typeof r[0] === 'string') REQ_TRADITIONS.add(labelKey(cleanText(r[0]))); }
// Culture labelKey → slug, read from the hand-curated culture.const.ts (the runtime source of truth),
// so "Kultur <Name>" Voraussetzungen resolve to a real culture slug (demonyms like "Thorwaler" too).
const CULTURE_BY_LABELKEY = new Map();
const CULTURE_OPTIONS = []; // { name: slug, label } — for SpzKulArray (Liebesspiele fremder Völker)
{
  const txt = readFileSync(resolve(CONST_DIR, 'culture.const.ts'), 'utf8');
  for (const cm of txt.matchAll(/name:\s*['"]([^'"]+)['"],\s*\n\s*label:\s*['"]([^'"]+)['"]/g)) {
    CULTURE_BY_LABELKEY.set(labelKey(cm[2]), cm[1]);
    CULTURE_BY_LABELKEY.set(labelKey(cm[1]), cm[1]);
    CULTURE_OPTIONS.push({ name: cm[1], label: cm[2] });
  }
}
function resolveCulture(name) {
  const lk = labelKey(name);
  for (const cand of [lk, lk.replace(/(innen|ischen|ische|isch|er|in|n)$/, '')]) {
    if (cand && CULTURE_BY_LABELKEY.has(cand)) return CULTURE_BY_LABELKEY.get(cand);
  }
  // Demonym fallback: "Thorwal" ↔ culture "Thorwaler" (one labelKey is a prefix of the other).
  if (lk.length >= 5) for (const [k, v] of CULTURE_BY_LABELKEY) if (k.length >= 5 && (k.startsWith(lk) || lk.startsWith(k))) return v;
  return null;
}
// Species labelKey → slug (the SpeciesType value, e.g. "Zwerg"→"dwarf", "Mensch"→"human"). The const
// stores `type: SpeciesType.X`, so resolve the enum member→value from species.model.ts first.
const SPECIES_BY_LABELKEY = new Map();
{
  const MODEL_DIR = resolve(ROOT, 'src/app/character-creator/models');
  const modelTxt = readFileSync(resolve(MODEL_DIR, 'species.model.ts'), 'utf8');
  const enumBody = (modelTxt.match(/enum\s+SpeciesType\s*\{([\s\S]*?)\}/) || [])[1] || '';
  const enumVal = new Map();
  for (const em of enumBody.matchAll(/(\w+)\s*=\s*['"]([^'"]+)['"]/g)) enumVal.set(em[1], em[2]);
  const txt = readFileSync(resolve(CONST_DIR, 'species.const.ts'), 'utf8');
  for (const sm of txt.matchAll(/type:\s*SpeciesType\.(\w+),[\s\S]{0,80}?label:\s*['"]([^'"]+)['"]/g)) {
    const slugName = enumVal.get(sm[1]);
    if (slugName) SPECIES_BY_LABELKEY.set(labelKey(sm[2]), slugName);
  }
}
function resolveSpecies(name) {
  const base = labelKey(String(name).split('(')[0]);
  for (const cand of [base, base.replace(/(innen|en|e|s|n)$/, '')]) {
    if (cand && SPECIES_BY_LABELKEY.has(cand)) return SPECIES_BY_LABELKEY.get(cand);
  }
  return null;
}
const ATTR_CODES = new Set(['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK']);
const ATTR_GERMAN = { mut: 'MU', klugheit: 'KL', intuition: 'IN', charisma: 'CH', fingerfertigkeit: 'FF', gewandtheit: 'GE', konstitution: 'KO', koerperkraft: 'KK' };
const ROMAN_RE = /\b(VII|VI|V|IV|III|II|I)\b/;

const narrativeLog = [];
const reqStats = {};
let reqEntriesProcessed = 0;
const tally = (t) => { reqStats[t] = (reqStats[t] || 0) + 1; };
// Every generated special-ability slug — populated once the SA catalogs exist (before the advantage
// re-resolution pass), so classifyFragment can type a resolved bare reference as `specialAbility`.
const SA_SLUG_SET = new Set();
// Slugs whose advantage/SA entry HAS a selection — so a "<Base> <Option>" ref (e.g. "Unfähig Körperbeherrschung",
// "Angst vor Blut") may split into base + option. Populated after advEntries/disEntries are built.
const SELECTABLE = new Set();
// Disadvantage slugs — so a BARE ref (no "Nachteil" prefix, e.g. "kein Eingeschränkter Sinn (Geruch)")
// is typed 'disadvantage' not 'advantage' (the validator unifies the two for `has`, but the displayed
// label resolves via the CatalogIndex by (kind,id), so a wrong kind would show the raw slug). Populated
// after disEntries are built (alongside SELECTABLE).
const DIS_SLUG_SET = new Set();
// Talent typo/variant labelKey → correct talent label (the PDF prose occasionally misspells a talent).
const TALENT_ALIASES = new Map([['malenzeichen', 'Malen & Zeichnen']]);

// Parse the "Erweiterte …sonderfertigkeiten:" / "Stilelemente:" line of a style's Regel → granted labels.
function parseStyleGrants(regel) {
  const m = String(regel || '').match(/(?:Erweiterte\s+[A-Za-zäöüÄÖÜ]+sonderfertigkeiten|Stilelemente)[^:]*:\s*([^\n]+)/i);
  if (!m) return [];
  return m[1].split(/,|;|\bund\b|\bsowie\b/i).map((s) => cleanText(s).trim())
    .filter((s) => s && !/^aus der|^der folgenden|^folgende|^einer der|^eine der/i.test(s));
}

// Curated synonym aliases (labelKey → slug) for references the PDF phrases differently from the catalog label.
const REQ_ALIASES = new Map([
  ['wallgegenschadenszauberei', 'wallgegenschadensmagie'], // "Wall gegen Schadenszauberei" → "… Schadensmagie"
]);
// Resolve a reference label to a catalog slug via `idx`: exact, then with a trailing "(…)" stripped, then a
// singular/plural variant (drop a trailing en/e/n/s), then a curated synonym alias.
function resolveRef(idx, label) {
  const base = String(label).trim();
  // candidates: as-is; trailing "(…)" stripped; trailing " für …" clause stripped ("Anatomie für jede …");
  // genitive-e normalized ("…Zauberstabes" → "…Zauberstabs").
  const cands = [base, base.replace(/\s*\([^)]*\)\s*$/, '').trim(), base.replace(/\s+für\s+.*$/i, '').trim(), base.replace(/es$/i, 's')];
  for (const c of cands) { const k = labelKey(c); if (idx.has(k)) return idx.get(k); }
  for (const c of cands) {
    const k = labelKey(c);
    const stripped = k.replace(/(en|e|n|s)$/, '');
    if (stripped && stripped !== k && idx.has(stripped)) return idx.get(stripped);
    if (REQ_ALIASES.has(k)) return REQ_ALIASES.get(k);
  }
  return undefined;
}

// Curated requirements for fragments whose meaning isn't mechanically derivable from the text. Keyed by the
// normalized fragment; value is the Requirement[] to emit ([] drops the fragment). Multi-entry → OR-group.
const curatedKey = (s) => labelKey(cleanText(String(s)));
const CURATED_REQ = new Map([
  // "Kenntnisse des jeweiligen Zaubers" (Exzellente Entschwörer:in) = one of the Entschwörung rituals.
  [curatedKey('Kenntnisse des jeweiligen Zaubers'), [
    { type: 'spell', name: 'Pentagramma' }, { type: 'spell', name: 'Hexagramma' }, { type: 'spell', name: 'Heptagramma' },
  ]],
  // "Vorteil Erzmagus" / "Erzmaga" (male/female) → the Magischer-Titel advantage with the Erzmag:a option.
  [curatedKey('Vorteil Erzmagus'), [{ type: 'advantage', name: 'magischertitel', option: 'erzmaga' }]],
  [curatedKey('Erzmaga'), []], // female duplicate of the above → drop
  // Fertigkeitsspezialisierung: chosen talent at FW ≥ 6 per specialization (6/12/18). The count multiplier
  // in met() handles the tiers, so the 2nd/3rd "Spezialisierung" fragments collapse away.
  [curatedKey('Fertigkeitswert 6 (erste Spezialisierung)'), [{ type: 'selectedTalent', min: 6 }]],
  [curatedKey('Fertigkeitswert 12 (zweite Spezialisierung)'), []],
  [curatedKey('Fertigkeitswert 18 (dritte Spezialisierung)'), []],
]);

// Curated requirements keyed by ENTRY SLUG — for incompatibilities the PDF "Voraussetzung" text lacks
// entirely, or that the fragment parser can't express (a forbidden disadvantage with a specific
// sub-option, the same-option Begabung/Unfähig exclusion, mutually exclusive Ahnenblut advantages, …).
// Merged (deduped) with any text-derived requirements; `text` fills prerequisiteText when the PDF has none.
// This is the durable home for hand-curated prereqs — edits here survive regeneration.
const CURATED_ENTRY_REQ = new Map([
  ['akoluthin', { text: 'Kein Vorteil Geweihter; Prinzipientreue (Moralkodex einer Kirche) oder Verpflichtungen (gegenüber einer Kirche)', reqs: [
    { type: 'advantage', name: 'geweihter', forbidden: true, text: 'kein Vorteil Geweihter' },
    { type: 'narrative', text: 'Prinzipientreue (Moralkodex einer Kirche) oder Verpflichtungen (gegenüber einer Kirche)' },
  ] }],
  ['altersresistenz', { reqs: [{ type: 'disadvantage', name: 'schnelleAlterung', forbidden: true, text: 'kein Nachteil Schnelle Alterung' }] }],
  ['ausdauernderliebhaberin', { text: 'Kein Nachteil Frigide oder Verfrühter Höhepunkt', reqs: [
    { type: 'disadvantage', name: 'frigide', forbidden: true, text: 'kein Nachteil Frigide' },
    { type: 'disadvantage', name: 'verfruehterhoehepunkt', forbidden: true, text: 'kein Nachteil Verfrühter Höhepunkt' },
  ] }],
  ['begabung', { text: 'Kein Nachteil Unfähig auf dieselbe Auswahl', reqs: [
    { type: 'disadvantage', name: 'unfahig', forbidden: true, sameOption: true, text: 'kein Nachteil Unfähig auf dieselbe Auswahl' },
  ] }],
  ['unfahig', { text: 'Kein Vorteil Begabung auf dieselbe Auswahl', reqs: [
    { type: 'advantage', name: 'begabung', forbidden: true, sameOption: true, text: 'kein Vorteil Begabung auf dieselbe Auswahl' },
  ] }],
  ['drachenblutahn', { text: 'Kein anderer Ahnenblut-Vorteil', reqs: [
    { type: 'advantage', name: 'dschinnenblutahn', forbidden: true, text: 'kein anderer Ahnenblut-Vorteil (Dschinnenblut)' },
    { type: 'advantage', name: 'feenblutahn', forbidden: true, text: 'kein anderer Ahnenblut-Vorteil (Feenblut)' },
  ] }],
  ['dschinnenblutahn', { text: 'Kein anderer Ahnenblut-Vorteil', reqs: [
    { type: 'advantage', name: 'drachenblutahn', forbidden: true, text: 'kein anderer Ahnenblut-Vorteil (Drachenblut)' },
    { type: 'advantage', name: 'feenblutahn', forbidden: true, text: 'kein anderer Ahnenblut-Vorteil (Feenblut)' },
  ] }],
  ['feenblutahn', { text: 'Kein anderer Ahnenblut-Vorteil', reqs: [
    { type: 'advantage', name: 'drachenblutahn', forbidden: true, text: 'kein anderer Ahnenblut-Vorteil (Drachenblut)' },
    { type: 'advantage', name: 'dschinnenblutahn', forbidden: true, text: 'kein anderer Ahnenblut-Vorteil (Dschinnenblut)' },
  ] }],
  ['entfernungssinn', { text: 'Kein Nachteil Blind, Eingeschränkter Sinn (Sicht), Farbenblind oder Verstümmelt (Einäugig)', reqs: [
    { type: 'disadvantage', name: 'blind', forbidden: true, text: 'kein Nachteil Blind' },
    { type: 'disadvantage', name: 'eingeschrankterSinn', option: 'sicht', forbidden: true, text: 'kein Nachteil Eingeschränkter Sinn (Sicht)' },
    { type: 'disadvantage', name: 'farbenblind', forbidden: true, text: 'kein Nachteil Farbenblind' },
    { type: 'disadvantage', name: 'verstuemmelt', option: 'einaeugig', forbidden: true, text: 'kein Nachteil Verstümmelt (Einäugig)' },
  ] }],
  ['erotischestimme', { text: 'Kein Nachteil Stumm oder Unerotische Stimme', reqs: [
    { type: 'disadvantage', name: 'stumm', forbidden: true, text: 'kein Nachteil Stumm' },
    { type: 'disadvantage', name: 'unerotischestimme', forbidden: true, text: 'kein Nachteil Unerotische Stimme' },
  ] }],
  ['flink', { text: 'Kein Nachteil Behäbig, Fettleibig oder Verstümmelt (Einbeinig)', reqs: [
    { type: 'disadvantage', name: 'behabig', forbidden: true, text: 'kein Nachteil Behäbig' },
    { type: 'disadvantage', name: 'fettleibig', forbidden: true, text: 'kein Nachteil Fettleibig' },
    { type: 'disadvantage', name: 'verstuemmelt', option: 'einbeinig', forbidden: true, text: 'kein Nachteil Verstümmelt (Einbeinig)' },
  ] }],
  ['fruchtbar', { text: 'Kein Nachteil Unfruchtbar', reqs: [{ type: 'disadvantage', name: 'unfruchtbar', forbidden: true, text: 'kein Nachteil Unfruchtbar' }] }],
  ['geborenerrednerin', { text: 'Kein Nachteil Stumm', reqs: [{ type: 'disadvantage', name: 'stumm', forbidden: true, text: 'kein Nachteil Stumm' }] }],
  ['giftresistenz', { text: 'Kein Nachteil Giftanfällig', reqs: [{ type: 'disadvantage', name: 'giftanfallig', forbidden: true, text: 'kein Nachteil Giftanfällig' }] }],
  ['gluck', { text: 'Kein Nachteil Pech', reqs: [{ type: 'disadvantage', name: 'pech', forbidden: true, text: 'kein Nachteil Pech' }] }],
  ['gutaussehend', { text: 'Kein Nachteil Hässlich', reqs: [{ type: 'disadvantage', name: 'hasslich', forbidden: true, text: 'kein Nachteil Hässlich' }] }],
  ['gutergeschmack', { text: 'Kein Nachteil Schlechter Geschmack', reqs: [{ type: 'disadvantage', name: 'schlechtergeschmack', forbidden: true, text: 'kein Nachteil Schlechter Geschmack' }] }],
  ['gutesnamensgedaechtnis', { text: 'Kein Nachteil Schlechtes Namensgedächtnis', reqs: [{ type: 'disadvantage', name: 'schlechtesnamensgedaechtnis', forbidden: true, text: 'kein Nachteil Schlechtes Namensgedächtnis' }] }],
  ['herausragendeFertigkeit', { text: 'Kein Nachteil Unfähig in der gleichen Fertigkeit', reqs: [{ type: 'disadvantage', name: 'unfahig', forbidden: true, sameOption: true, text: 'kein Nachteil Unfähig in der gleichen Fertigkeit' }] }],
  // The Blind(bei Sicht)/Taub(bei Gehör) exclusion is enforced structurally by CharacterValidationService's
  // outstandingSenseRule (option-conditional forbidden), so no narrative "manuell prüfen" note is emitted here.
  ['herausragenderSinn', { text: 'Kein Nachteil Eingeschränkter Sinn für den gleichen Sinn', reqs: [
    { type: 'disadvantage', name: 'eingeschrankterSinn', forbidden: true, sameOption: true, text: 'kein Nachteil Eingeschränkter Sinn für den gleichen Sinn' },
  ] }],
  ['hitzeresistenz', { text: 'Kein Nachteil Hitzeempfindlich', reqs: [{ type: 'disadvantage', name: 'hitzeempfindlich', forbidden: true, text: 'kein Nachteil Hitzeempfindlich' }] }],
  ['hoheLebenskraft', { text: 'Kein Nachteil Niedrige Lebenskraft', reqs: [{ type: 'disadvantage', name: 'niedrigeLebenskraft', forbidden: true, text: 'kein Nachteil Niedrige Lebenskraft' }] }],
  ['hoheSeelenkraft', { text: 'Kein Nachteil Niedrige Seelenkraft', reqs: [{ type: 'disadvantage', name: 'niedrigeSeelenkraft', forbidden: true, text: 'kein Nachteil Niedrige Seelenkraft' }] }],
  ['hoheZahigkeit', { text: 'Kein Nachteil Niedrige Zähigkeit', reqs: [{ type: 'disadvantage', name: 'niedrigeZahigkeit', forbidden: true, text: 'kein Nachteil Niedrige Zähigkeit' }] }],

  // ── Proactive sweep: symmetric opposite pairs (advantage ✕ its opposite disadvantage) ──
  ['eisern', { text: 'Kein Nachteil Gläsern', reqs: [{ type: 'disadvantage', name: 'glaesern', forbidden: true, text: 'kein Nachteil Gläsern' }] }],
  ['immunitatGift', { text: 'Kein Nachteil Giftanfällig', reqs: [{ type: 'disadvantage', name: 'giftanfallig', forbidden: true, text: 'kein Nachteil Giftanfällig' }] }],
  ['immunitatKrankheit', { text: 'Kein Nachteil Krankheitsanfällig', reqs: [{ type: 'disadvantage', name: 'krankheitsanfallig', forbidden: true, text: 'kein Nachteil Krankheitsanfällig' }] }],
  ['kalteresistenz', { text: 'Kein Nachteil Kälteempfindlich', reqs: [{ type: 'disadvantage', name: 'kalteempfindlich', forbidden: true, text: 'kein Nachteil Kälteempfindlich' }] }],
  ['krankheitsresistenz', { text: 'Kein Nachteil Krankheitsanfällig', reqs: [{ type: 'disadvantage', name: 'krankheitsanfallig', forbidden: true, text: 'kein Nachteil Krankheitsanfällig' }] }],
  ['potent', { text: 'Kein Nachteil Impotent', reqs: [{ type: 'disadvantage', name: 'impotent', forbidden: true, text: 'kein Nachteil Impotent' }] }],
  ['reich', { text: 'Kein Nachteil Arm', reqs: [{ type: 'disadvantage', name: 'arm', forbidden: true, text: 'kein Nachteil Arm' }] }],
  ['treu', { text: 'Kein Nachteil Untreu', reqs: [{ type: 'disadvantage', name: 'untreu', forbidden: true, text: 'kein Nachteil Untreu' }] }],
  ['verbesserteRegenerationLep', { text: 'Kein Nachteil Schlechte Regeneration (Lebensenergie)', reqs: [{ type: 'disadvantage', name: 'schlechteRegenerationLep', forbidden: true, text: 'kein Nachteil Schlechte Regeneration (Lebensenergie)' }] }],
  ['vorliebesexpraktik', { text: 'Kein Nachteil Abneigung gegen dieselbe Sexpraktik', reqs: [{ type: 'disadvantage', name: 'abneigungsexpraktik', forbidden: true, sameOption: true, text: 'kein Nachteil Abneigung gegen dieselbe Sexpraktik' }] }],
  ['angenehmerGeruch', { text: 'Kein Nachteil Raubtiergeruch, Jagdwildgeruch oder Stechender Orkgeruch', reqs: [
    { type: 'disadvantage', name: 'raubtiergeruch', forbidden: true, text: 'kein Nachteil Raubtiergeruch' },
    { type: 'disadvantage', name: 'jagdwildgeruch', forbidden: true, text: 'kein Nachteil Jagdwildgeruch' },
    { type: 'disadvantage', name: 'stechenderOrkgeruch', forbidden: true, text: 'kein Nachteil Stechender Orkgeruch' },
  ] }],
  ['unscheinbar', { text: 'Kein Nachteil Körperliche Auffälligkeit', reqs: [{ type: 'disadvantage', name: 'koerperlicheauffaelligkeit', forbidden: true, text: 'kein Nachteil Körperliche Auffälligkeit' }] }],
  ['wohlklang', { text: 'Kein Nachteil Sprachfehler oder Stumm', reqs: [
    { type: 'disadvantage', name: 'sprachfehler', forbidden: true, text: 'kein Nachteil Sprachfehler' },
    { type: 'disadvantage', name: 'stumm', forbidden: true, text: 'kein Nachteil Stumm' },
  ] }],
  ['einkommen', { text: 'Kein Nachteil Arm', reqs: [{ type: 'disadvantage', name: 'arm', forbidden: true, text: 'kein Nachteil Arm' }] }],
  ['saumagen', { text: 'Kein Nachteil Unverträglichkeit gegenüber Alkohol', reqs: [{ type: 'disadvantage', name: 'unvertraeglichkeitgegenueberalkohol', forbidden: true, text: 'kein Nachteil Unverträglichkeit gegenüber Alkohol' }] }],

  // ── Blut-Vorteile require the corresponding ancestry (Ahn) advantage (required, not forbidden) ──
  ['drachenblutvorteil', { text: 'Vorteil Drachenblut (Ahn)', reqs: [{ type: 'advantage', name: 'drachenblutahn', text: 'erfordert Drachenblut (Ahn)' }] }],
  ['dschinnenblutvorteil', { text: 'Vorteil Dschinnenblut (Ahn)', reqs: [{ type: 'advantage', name: 'dschinnenblutahn', text: 'erfordert Dschinnenblut (Ahn)' }] }],
  ['feenblutvorteil', { text: 'Vorteil Feenblut (Ahn)', reqs: [{ type: 'advantage', name: 'feenblutahn', text: 'erfordert Feenblut (Ahn)' }] }],
  ['wolfsblutvorteil', { text: 'Vorteil Wolfsblut', reqs: [{ type: 'advantage', name: 'wolfsblut', text: 'erfordert Wolfsblut' }] }],

  // ── Batch 3 ──
  ['koboldfreundin', { text: 'Kein Vorteil Hass auf Kobolde (und Untergruppen); keine Schlechte Eigenschaft Vorurteile gegen Kobolde', reqs: [
    { type: 'narrative', text: 'kein Hass auf Kobolde (und deren Untergruppen); keine Schlechte Eigenschaft Vorurteile gegen Kobolde' },
  ] }],
  ['levthangekuesst', { text: 'Kein Nachteil Frigide, Impotent, Unfruchtbar oder Verstümmelt (Eunuch); Personen mit einer Vagina benötigen Freudenfluss', reqs: [
    { type: 'disadvantage', name: 'frigide', forbidden: true, text: 'kein Nachteil Frigide' },
    { type: 'disadvantage', name: 'impotent', forbidden: true, text: 'kein Nachteil Impotent' },
    { type: 'disadvantage', name: 'unfruchtbar', forbidden: true, text: 'kein Nachteil Unfruchtbar' },
    { type: 'disadvantage', name: 'verstuemmelt', option: 'eunuchi', forbidden: true, text: 'kein Nachteil Verstümmelt (Eunuch I)' },
    { type: 'disadvantage', name: 'verstuemmelt', option: 'eunuchii', forbidden: true, text: 'kein Nachteil Verstümmelt (Eunuch II)' },
    { type: 'narrative', text: 'bei Personen mit einer Vagina wird der Vorteil Freudenfluss benötigt' },
  ] }],
  ['rahjagekuesst', { text: 'Kein Nachteil Frigide oder Impotent', reqs: [
    { type: 'disadvantage', name: 'frigide', forbidden: true, text: 'kein Nachteil Frigide' },
    { type: 'disadvantage', name: 'impotent', forbidden: true, text: 'kein Nachteil Impotent' },
  ] }],
  ['resistenzgegengeschlechtskrankheiten', { text: 'Kein Nachteil Krankheitsanfällig, kein Vorteil Krankheitsresistenz', reqs: [
    { type: 'disadvantage', name: 'krankheitsanfallig', forbidden: true, text: 'kein Nachteil Krankheitsanfällig' },
    { type: 'advantage', name: 'krankheitsresistenz', forbidden: true, text: 'kein Vorteil Krankheitsresistenz' },
  ] }],
  ['richtungssinn', { text: 'Kein Nachteil Unfähig (Orientierung)', reqs: [
    { type: 'disadvantage', name: 'unfahig', option: 'orientierung', forbidden: true, text: 'kein Nachteil Unfähig (Orientierung)' },
  ] }],
  ['sozialeAnpassungsfahigkeit', { text: 'Kein Nachteil Unfähig auf ein Gesellschaftstalent; kein Nachteil Unfrei', reqs: [
    { type: 'disadvantage', name: 'unfrei', forbidden: true, text: 'kein Nachteil Unfrei' },
    { type: 'narrative', text: 'kein Nachteil Unfähig auf ein Gesellschaftstalent' },
  ] }],
  ['tierfreundin', { text: 'Kein Vorteil Hass auf die gewählte Tierart', reqs: [
    { type: 'narrative', text: 'kein Vorteil Hass auf die (gewählte) Tierart' },
  ] }],
  ['vertrauenerweckend', { text: 'Kein Nachteil Unfähig in einem Gesellschaftstalent', reqs: [
    { type: 'narrative', text: 'kein Nachteil Unfähig in einem Gesellschaftstalent' },
  ] }],
  ['zaherHund', { text: 'Kein Nachteil Zerbrechlich', reqs: [
    { type: 'disadvantage', name: 'zerbrechlich', forbidden: true, text: 'kein Nachteil Zerbrechlich' },
  ] }],
  // Disadvantage-sweep gap: the only opposite whose advantage wasn't already carrying the exclusion
  ['schwerZuVerzaubern', { text: 'Kein Nachteil Zauberanfällig', reqs: [
    { type: 'disadvantage', name: 'zauberanfallig', forbidden: true, text: 'kein Nachteil Zauberanfällig' },
  ] }],
]);

// Hand-resolved special-ability requirements (keyed by SA SLUG). Some SA prerequisite texts can't be
// parsed cleanly ("alle genannten Talente", "Unfähig in den genannten Talenten", clarifying clauses
// with no rule value) — established SFs change rarely, so a manual resolution here is durable. Unlike
// CURATED_ENTRY_REQ (which MERGES), this fully REPLACES the parsed requirements + prerequisiteText, so
// the curated list is authoritative (include caster/priest yourself for magic/karmal SAs).
const CURATED_SA_REQ = new Map([
  // Akrobat:in — "genannte Talente" = Gaukeleien + Körperbeherrschung; drop the value-less clarifying clause.
  ['akrobatin', { text: 'Gaukeleien 4, Körperbeherrschung 4; kein Nachteil Behäbig, Blind, Fettleibig, Verstümmelt; kein Nachteil Unfähig (Gaukeleien / Körperbeherrschung)', reqs: [
    { type: 'talent', name: 'Gaukeleien', min: 4, text: 'Gaukeleien 4' },
    { type: 'talent', name: 'Körperbeherrschung', min: 4, text: 'Körperbeherrschung 4' },
    { type: 'disadvantage', name: 'behabig', forbidden: true, text: 'kein Nachteil Behäbig' },
    { type: 'disadvantage', name: 'blind', forbidden: true, text: 'kein Nachteil Blind' },
    { type: 'disadvantage', name: 'fettleibig', forbidden: true, text: 'kein Nachteil Fettleibig' },
    { type: 'disadvantage', name: 'verstuemmelt', forbidden: true, text: 'kein Nachteil Verstümmelt' },
    { type: 'disadvantage', name: 'unfahig', option: 'gaukeleien', forbidden: true, text: 'kein Nachteil Unfähig (Gaukeleien)' },
    { type: 'disadvantage', name: 'unfahig', option: 'koerperbeherrschung', forbidden: true, text: 'kein Nachteil Unfähig (Körperbeherrschung)' },
  ] }],
  // Athlet:in — "genannte Talente" = Körperbeherrschung + Kraftakt (per effect); drop the clarifying clause.
  ['athlet', { text: 'Körperbeherrschung 4, Kraftakt 4; kein Nachteil Behäbig, Fettleibig, Verstümmelt; kein Nachteil Unfähig (Körperbeherrschung / Kraftakt)', reqs: [
    { type: 'talent', name: 'Körperbeherrschung', min: 4, text: 'Körperbeherrschung 4' },
    { type: 'talent', name: 'Kraftakt', min: 4, text: 'Kraftakt 4' },
    { type: 'disadvantage', name: 'behabig', forbidden: true, text: 'kein Nachteil Behäbig' },
    { type: 'disadvantage', name: 'fettleibig', forbidden: true, text: 'kein Nachteil Fettleibig' },
    { type: 'disadvantage', name: 'verstuemmelt', forbidden: true, text: 'kein Nachteil Verstümmelt' },
    { type: 'disadvantage', name: 'unfahig', option: 'koerperbeherrschung', forbidden: true, text: 'kein Nachteil Unfähig (Körperbeherrschung)' },
    { type: 'disadvantage', name: 'unfahig', option: 'kraftakt', forbidden: true, text: 'kein Nachteil Unfähig (Kraftakt)' },
  ] }],
  // Archivar — the parenthesized prereq is just "kein Nachteil Blind".
  ['archivar', { text: 'Kein Nachteil Blind', reqs: [{ type: 'disadvantage', name: 'blind', forbidden: true, text: 'kein Nachteil Blind' }] }],
  // Entfernungen schätzen — kein Nachteil Blind oder Verstümmelt (Einäugig).
  ['entfernungenSchatzen', { text: 'Kein Nachteil Blind oder Verstümmelt (Einäugig)', reqs: [
    { type: 'disadvantage', name: 'blind', forbidden: true, text: 'kein Nachteil Blind' },
    { type: 'disadvantage', name: 'verstuemmelt', option: 'einaeugig', forbidden: true, text: 'kein Nachteil Verstümmelt (Einäugig)' },
  ] }],
  // Iglubau — Wildnisleben 8 + Geländekunde mit gewählter Unterkategorie Eis- und Schneekundig.
  ['iglubau', { text: 'Wildnisleben 8; Sonderfertigkeit Geländekunde (Eis- und Schneekundig)', reqs: [
    { type: 'talent', name: 'Wildnisleben', min: 8, text: 'Wildnisleben 8' },
    { type: 'specialAbility', name: 'gelaendekunde', option: 'eisundschneekundig', text: 'Sonderfertigkeit Geländekunde (Eis- und Schneekundig)' },
  ] }],
  // Heilungsspezialgebiet — per chosen area: Amputieren/Verbrennungen → Heilkunde Wunden 8, Chirurgie →
  // Heilkunde Wunden 12, the rest none. Modelled as option-conditional (ifOption) requirements.
  ['heilungsspezialgebiet', { text: 'Amputieren/Verbrennungen: Heilkunde Wunden 8; Chirurgie: Heilkunde Wunden 12; sonst keine', reqs: [
    { type: 'ifOption', option: 'amputieren', then: { type: 'talent', name: 'Heilkunde Wunden', min: 8 }, text: 'Amputieren: Heilkunde Wunden 8' },
    { type: 'ifOption', option: 'verbrennungen', then: { type: 'talent', name: 'Heilkunde Wunden', min: 8 }, text: 'Verbrennungen: Heilkunde Wunden 8' },
    { type: 'ifOption', option: 'chirurgie', then: { type: 'talent', name: 'Heilkunde Wunden', min: 12 }, text: 'Chirurgie: Heilkunde Wunden 12' },
  ] }],
  // Kampftrinker — the only prereq is: kein Nachteil Unverträglichkeit gegenüber Alkohol (the parsed
  // Musizieren/Überreden reqs were mis-assigned).
  ['kampftrinker', { text: 'Kein Nachteil Unverträglichkeit gegenüber Alkohol', reqs: [
    { type: 'disadvantage', name: 'unvertraeglichkeitgegenueberalkohol', forbidden: true, text: 'kein Nachteil Unverträglichkeit gegenüber Alkohol' },
  ] }],
  // Lehrer — leveled; the only "prereq" is needing the previous level, which sequential leveling already
  // enforces → no structured requirements.
  ['lehrer', { reqs: [] }],
  // Gerüchtekoch (slug geruechtekochender) — the cost-0 "Gerüchtekoch I-III" stub is a duplicate (removed
  // from the hand snapshot). Its Stufe-II/III prereqs refer to its OWN previous levels, so self-reference
  // geruechtekochender (not the removed stub). Also fix the odd generated label.
  ['geruechtekochender', { label: 'Gerüchtekoch', reqs: [
    { type: 'talent', name: 'Gassenwissen', min: 8, atLevel: 1, text: 'Gassenwissen 8' },
    { type: 'talent', name: 'Gassenwissen', min: 12, atLevel: 2, text: 'Gassenwissen 12' },
    { type: 'specialAbility', name: 'geruechtekochender', min: 1, atLevel: 2, text: 'Gerüchtekoch I' },
    { type: 'talent', name: 'Gassenwissen', min: 16, atLevel: 3, text: 'Gassenwissen 16' },
    { type: 'specialAbility', name: 'geruechtekochender', min: 2, atLevel: 3, text: 'Gerüchtekoch II' },
  ] }],
  // Meister der Gifte / Rauschmittel — like Meister der Elixiere (Alchimie 12 + knowledge talents), but
  // only ONE of the knowledge talents at FW 10 (not two). The parsed self/cross SA refs were bogus.
  ['meisterindergifte', { text: 'Alchimie 12; eines der Talente Götter & Kulte / Magiekunde / Sagen & Legenden / Sphärenkunde / Sternkunde auf FW 10', reqs: [
    { type: 'talent', name: 'Alchimie', min: 12, text: 'Alchimie 12' },
    { type: 'talentCount', min: 10, count: 1, names: ['Götter & Kulte', 'Magiekunde', 'Sagen & Legenden', 'Sphärenkunde', 'Sternkunde'], text: 'eines der folgenden Talente mindestens FW 10: Götter & Kulte, Magiekunde, Sagen & Legenden, Sphärenkunde, Sternkunde' },
  ] }],
  ['meisterinderrauschmittel', { text: 'Alchimie 12; eines der Talente Götter & Kulte / Magiekunde / Sagen & Legenden / Sphärenkunde / Sternkunde auf FW 10', reqs: [
    { type: 'talent', name: 'Alchimie', min: 12, text: 'Alchimie 12' },
    { type: 'talentCount', min: 10, count: 1, names: ['Götter & Kulte', 'Magiekunde', 'Sagen & Legenden', 'Sphärenkunde', 'Sternkunde'], text: 'eines der folgenden Talente mindestens FW 10: Götter & Kulte, Magiekunde, Sagen & Legenden, Sphärenkunde, Sternkunde' },
  ] }],
  // Orgienlöwe (I-III) — only Betören per level; the previous level is taken automatically (no self-ref).
  ['orgienloewin', { text: 'Stufe I: Betören 8; Stufe II: Betören 12; Stufe III: Betören 16', reqs: [
    { type: 'talent', name: 'Betören', min: 8, atLevel: 1, text: 'Betören 8' },
    { type: 'talent', name: 'Betören', min: 12, atLevel: 2, text: 'Betören 12' },
    { type: 'talent', name: 'Betören', min: 16, atLevel: 3, text: 'Betören 16' },
  ] }],
  // Orgiastische:r Lustspender:in (I-II) — per-level SA prerequisites.
  ['orgiastischerlustspenderin', { text: 'Stufe I: Lustspender:in, Orgienlöwe:in I, Gruppensex-Veteran:in I; Stufe II: Orgiastische:r Lustspender:in I, Orgienlöwe:in II, Gruppensex-Veteran:in II', reqs: [
    { type: 'specialAbility', name: 'lustspenderin', atLevel: 1, text: 'Sonderfertigkeit Lustspender:in' },
    { type: 'specialAbility', name: 'orgienloewin', min: 1, atLevel: 1, text: 'Orgienlöwe:in I' },
    { type: 'specialAbility', name: 'gruppensexveteranin', min: 1, atLevel: 1, text: 'Gruppensex-Veteran:in I' },
    { type: 'specialAbility', name: 'orgiastischerlustspenderin', min: 1, atLevel: 2, text: 'Orgiastische:r Lustspender:in I' },
    { type: 'specialAbility', name: 'orgienloewin', min: 2, atLevel: 2, text: 'Orgienlöwe:in II' },
    { type: 'specialAbility', name: 'gruppensexveteranin', min: 2, atLevel: 2, text: 'Gruppensex-Veteran:in II' },
  ] }],
  // Ortskenntnis — costs 2 AP per instance (the PDF "AP-Wert: 2" leaked into text, leaving cost 0). The
  // one free Ortskenntnis comes from a culture grant (granted = 0 AP), not from a zero base cost.
  ['ortskenntnis', { cost: 2 }],
  // Schriftstellerei — passende Schrift + passende Sprache III, plus a talent depending on the chosen
  // Fachbereich (per-option via ifOption; Fachpublikationen split per knowledge talent).
  ['schriftstellerei', { text: 'Passende Schrift; passende Sprache III; Talent je nach Fachbereich', reqs: [
    { type: 'script', text: 'passende Schrift' },
    { type: 'language', min: 3, text: 'passende Sprache (Stufe III)' },
    { type: 'ifOption', option: 'liebesroman', then: { type: 'talent', name: 'Betören', min: 4 }, text: 'Liebesroman: Betören 4' },
    { type: 'ifOption', option: 'poesie', then: { type: 'talent', name: 'Etikette', min: 4 }, text: 'Poesie: Etikette 4' },
    { type: 'ifOption', option: 'hetzschriften', then: { type: 'talent', name: 'Bekehren & Überzeugen', min: 4 }, text: 'Hetzschriften: Bekehren & Überzeugen 4' },
    { type: 'ifOption', option: 'kriminialgeschichten', then: { type: 'talent', name: 'Gassenwissen', min: 4 }, text: 'Kriminalgeschichten: Gassenwissen 4' },
    { type: 'ifOption', option: 'maerchen', then: { type: 'talent', name: 'Überreden', min: 4 }, text: 'Märchen: Überreden 4' },
    { type: 'ifOption', option: 'romane', then: { type: 'talent', name: 'Überreden', min: 4 }, text: 'Romane: Überreden 4' },
    { type: 'ifOption', option: 'fachpublikationenbrettgluecksspiel', then: { type: 'talent', name: 'Brett- & Glücksspiel', min: 4 }, text: 'Fachpublikation: Brett- & Glücksspiel 4' },
    { type: 'ifOption', option: 'fachpublikationengeographie', then: { type: 'talent', name: 'Geographie', min: 4 }, text: 'Fachpublikation: Geographie 4' },
    { type: 'ifOption', option: 'fachpublikationengeschichtswissen', then: { type: 'talent', name: 'Geschichtswissen', min: 4 }, text: 'Fachpublikation: Geschichtswissen 4' },
    { type: 'ifOption', option: 'fachpublikationengoetterkulte', then: { type: 'talent', name: 'Götter & Kulte', min: 4 }, text: 'Fachpublikation: Götter & Kulte 4' },
    { type: 'ifOption', option: 'fachpublikationenkriegskunst', then: { type: 'talent', name: 'Kriegskunst', min: 4 }, text: 'Fachpublikation: Kriegskunst 4' },
    { type: 'ifOption', option: 'fachpublikationenmagiekunde', then: { type: 'talent', name: 'Magiekunde', min: 4 }, text: 'Fachpublikation: Magiekunde 4' },
    { type: 'ifOption', option: 'fachpublikationenmechanik', then: { type: 'talent', name: 'Mechanik', min: 4 }, text: 'Fachpublikation: Mechanik 4' },
    { type: 'ifOption', option: 'fachpublikationenrechnen', then: { type: 'talent', name: 'Rechnen', min: 4 }, text: 'Fachpublikation: Rechnen 4' },
    { type: 'ifOption', option: 'fachpublikationenrechtskunde', then: { type: 'talent', name: 'Rechtskunde', min: 4 }, text: 'Fachpublikation: Rechtskunde 4' },
    { type: 'ifOption', option: 'fachpublikationensagenlegenden', then: { type: 'talent', name: 'Sagen & Legenden', min: 4 }, text: 'Fachpublikation: Sagen & Legenden 4' },
    { type: 'ifOption', option: 'fachpublikationensphaerenkunde', then: { type: 'talent', name: 'Sphärenkunde', min: 4 }, text: 'Fachpublikation: Sphärenkunde 4' },
    { type: 'ifOption', option: 'fachpublikationensternkunde', then: { type: 'talent', name: 'Sternkunde', min: 4 }, text: 'Fachpublikation: Sternkunde 4' },
  ] }],
  // Jäger:in — "Fernkampftechnikwert 10" = ANY ranged combat technique at 10 (OR-group of the 7) + talents.
  ['jager', { text: 'Eine Fernkampftechnik auf 10; Fährtensuchen 4, Tierkunde 4, Verbergen 4', reqs: [
    { type: 'combatTechnique', name: 'Armbrüste', min: 10, group: 1, text: 'eine Fernkampftechnik 10' },
    { type: 'combatTechnique', name: 'Blasrohre', min: 10, group: 1, text: 'eine Fernkampftechnik 10' },
    { type: 'combatTechnique', name: 'Bögen', min: 10, group: 1, text: 'eine Fernkampftechnik 10' },
    { type: 'combatTechnique', name: 'Diskusse', min: 10, group: 1, text: 'eine Fernkampftechnik 10' },
    { type: 'combatTechnique', name: 'Feuerspeien', min: 10, group: 1, text: 'eine Fernkampftechnik 10' },
    { type: 'combatTechnique', name: 'Schleudern', min: 10, group: 1, text: 'eine Fernkampftechnik 10' },
    { type: 'combatTechnique', name: 'Wurfwaffen', min: 10, group: 1, text: 'eine Fernkampftechnik 10' },
    { type: 'talent', name: 'Fährtensuchen', min: 4, text: 'Fährtensuchen 4' },
    { type: 'talent', name: 'Tierkunde', min: 4, text: 'Tierkunde 4' },
    { type: 'talent', name: 'Verbergen', min: 4, text: 'Verbergen 4' },
  ] }],
  // Eisenhagel (I-II) — the PDF "Stufe I: …, Stufe II; …" text mis-parsed; fix the per-level requirements
  // (Stufe II self-references Eisenhagel I).
  ['eisenhagel', { text: 'Stufe I: FF 15, Schnellladen (Wurfwaffen); Stufe II: FF 17, Eisenhagel I', reqs: [
    { type: 'attribute', name: 'FF', min: 15, atLevel: 1, text: 'FF 15' },
    { type: 'specialAbility', name: 'schnellladenwurfwaffen', atLevel: 1, text: 'Sonderfertigkeit Schnellladen (Wurfwaffen)' },
    { type: 'attribute', name: 'FF', min: 17, atLevel: 2, text: 'FF 17' },
    { type: 'specialAbility', name: 'eisenhagel', min: 1, atLevel: 2, text: 'Eisenhagel I' },
  ] }],
  // Beeindruckende Vorstellung (Talent) — the chosen talent (VorstellungArray) must be at FW 8; the
  // PDF text "jeweiliges Talent FW 8" was narrative. `selectedTalent` checks the picked option's FW.
  ['beeindruckendevorstellung', { text: 'Gewähltes Talent FW 8', reqs: [{ type: 'selectedTalent', min: 8, text: 'gewähltes Talent (Gaukeleien/Musizieren/Singen/Tanzen) FW 8' }] }],
  // Berufsgeheimnis — prerequisites vary per chosen secret (talent values, other SFs, …); the flat model
  // can't gate per-option, so surface a manual hint (the effect text already explains the Lehrmeister rule).
  ['berufsgeheimnis', { reqs: [{ type: 'narrative', text: 'Voraussetzungen je nach gewähltem Berufsgeheimnis (Lehrmeister + Talent-/SF-Voraussetzungen; siehe Regelwiki)' }] }],
  // Fertigkeitsspezialisierung — cost follows the chosen talent's Steigerungsfaktor (cost 1 × SF-index):
  // a specialization in an SF-C talent costs 3 AP, SF-D 4 AP, etc. The GruppeArray options carry `factor`.
  ['fertigkeitsspezialisierung', { costBySteigerungsfaktor: true }],
]);
// Slugs to drop entirely from the generated SA catalogs (redundant/duplicate PDF concepts).
const CURATED_SA_REMOVE = new Set([
  'giftmelken', // "Gift melken (Tiergruppe)" selection — only Land/Wasser exist, kept as separate SAs
  'talentstil', // "Talentstil: (Stil)" selection — replaced by one SkillStyle SA per style (from TalentstilGetInfo)
]);
// Replace an SA's parsed requirements with the hand-resolved list (if curated). Authoritative override.
function applyCuratedSaReq(e) {
  const c = CURATED_SA_REQ.get(e.name);
  if (!c) return;
  if (c.reqs) e.requirements = c.reqs;
  if (c.text) e.prerequisiteText = c.text;
  if (c.label) e.label = c.label;
  if (c.cost != null) e.cost = c.cost;
  if (c.costBySteigerungsfaktor != null) e.costBySteigerungsfaktor = c.costBySteigerungsfaktor;
}

// Merge curated requirements into text-derived ones, de-duplicating by the identifying fields.
function mergeCuratedReqs(textReqs, curatedReqs) {
  const key = (r) => `${r.type}|${r.name ?? ''}|${r.option ?? ''}|${r.forbidden ? 1 : 0}|${r.sameOption ? 1 : 0}|${r.group ?? ''}`;
  const seen = new Set(textReqs.map(key));
  const merged = [...textReqs];
  for (const r of curatedReqs) if (!seen.has(key(r))) { seen.add(key(r)); merged.push(r); }
  return merged;
}

// Global spell-extension index: extension labelKey → [{ spell slug, ext slug }] across all spells/rituals,
// so "Zaubererweiterung <Ext>" with no "bei <Spell>" resolves when the extension label is unique.
const EXT_BY_LABEL = new Map();
for (const r of parseGetInfo(functionBody(js, 'ZauberGetInfo'))) {
  const spellLabel = r[1];
  const exts = spellExtMap.get(r[0]);
  if (typeof spellLabel !== 'string' || !exts) continue;
  for (const ex of exts) {
    const k = labelKey(ex.label);
    if (!EXT_BY_LABEL.has(k)) EXT_BY_LABEL.set(k, []);
    EXT_BY_LABEL.get(k).push({ spell: slug(spellLabel), ext: ex.name });
  }
}

function classifyFragment(raw, idx, owner) {
  let s = cleanText(raw).trim().replace(/\.$/, '');
  if (!s || /^keine?\b\s*$/i.test(s)) return null;
  let forbidden = false, m;
  if ((m = s.match(/^kein(?:e|er|es)?\s+(.*)$/i))) { forbidden = true; s = m[1].trim(); }
  // Unparseable / unresolvable fragment → keep verbatim as narrative (never fabricate a slug).
  const nf = () => { narrativeLog.push({ owner, text: raw }); return { type: 'narrative', text: raw, forbidden: forbidden || undefined }; };

  // Strip a leading "eventuell " hedge before an SF ref ("eventuell Sonderfertigkeit Daimonidenkonstrukteur").
  s = s.replace(/^eventuell\s+/i, '');
  // Strip a leading tradition code before an SA ref ("Fer Sonderfertigkeit Keulenweihe" → "Sonderfertigkeit …").
  s = s.replace(/^[A-ZÄÖÜ][a-zäöü]{1,3}\s+(?=Sonderfertigkeit\b|SF\b)/, '');
  // Strip a trailing " Aspekt: …" qualifier ("Donnerndes Horn Aspekt: Unendliche Tiefe" → "Donnerndes Horn").
  s = s.replace(/\s+Aspekt:\s+.*$/i, '').trim();
  // "… bisher nicht vorhanden" → the referenced SF must be ABSENT (take-once).
  if (/bisher nicht vorhanden/i.test(s)) { forbidden = true; s = s.replace(/\s*bisher nicht vorhanden\s*$/i, '').trim(); }

  // Explanatory subordinate clause ("da sie über keine Allerweltsnamen verfügen.") → not a requirement.
  if (/^da\s/i.test(s)) return null;
  // Level-chain meta-note ("bei höheren Stufen jeweils die vorherige Stufe", "jeweils Vorstufe der SF") →
  // not a requirement (a level always includes the previous one).
  if (/^bei höheren stufen\b/i.test(s) || /\bvor(?:herige|ige)\s+stufe\b/i.test(s) || /\bvorstufe\b/i.test(s)) return null;
  // "Tradition des Kults" → the char must have any karmal-tradition special ability.
  if (/^Tradition\s+des\s+Kults?\b/i.test(s)) return { type: 'karmalTradition', text: raw };
  // "3 Liturgien und Zeremonien des Aspekts auf 10" → count liturgies/ceremonies of the chosen aspect at FW ≥ M.
  if ((m = s.match(/(\d+)\s+Liturgien?\s+und\s+Zeremonien\s+des\s+Aspekts?\s+auf\s+(\d+)/i))) return { type: 'aspectCount', count: Number(m[1]), min: Number(m[2]), text: raw };
  // "3 Zauber des Merkmals auf 10" → count spells of the chosen Merkmal at FW ≥ M (Merkmalskenntnis).
  if ((m = s.match(/(\d+)\s+Zauber\s+des\s+Merkmals?\s+auf\s+(\d+)/i))) return { type: 'merkmalCount', count: Number(m[1]), min: Number(m[2]), text: raw };
  // "FW des adaptierten Zaubers 10+" → the spell chosen for THIS SA (its selection) must be at FW ≥ N.
  if ((m = s.match(/FW des adaptierten Zaubers\s+(\d+)\+?/i))) return { type: 'selectedSpell', min: Number(m[1]), text: raw };
  // "Zaubertrick <Name>" → the cantrip.
  if ((m = s.match(/^Zaubertrick\s+(.+)$/i))) { const c = CANTRIP_BY_LABELKEY.get(labelKey(m[1].trim())); if (c) return { type: 'cantrip', name: c, forbidden: forbidden || undefined, text: raw }; }
  // "Zaubererweiterung <Ext> [bei <SPELL>]" → the spell extension. With "bei <SPELL>" use that spell; without,
  // resolve via the global extension index when the extension label is unique ("Schlauer Gegenstand" → Animatio).
  if ((m = s.match(/^Zaubererweiterung\s+(.+)$/i))) {
    let rest = m[1].trim(); let spellLabel = null;
    const bei = rest.match(/^(.+?)\s+bei\s+(.+)$/i);
    if (bei) { rest = bei[1].trim(); spellLabel = bei[2].trim(); }
    const extLabel = rest.replace(/\s*\([^)]*\)\s*$/, '').trim(); // drop a trailing "(siehe …)" note
    if (spellLabel && REQ_SPELLS.has(labelKey(spellLabel))) return { type: 'spellExtension', spell: slug(spellLabel), name: slug(extLabel), forbidden: forbidden || undefined, text: raw };
    const hits = EXT_BY_LABEL.get(labelKey(extLabel));
    if (hits && hits.length === 1) return { type: 'spellExtension', spell: hits[0].spell, name: hits[0].ext, forbidden: forbidden || undefined, text: raw };
  }
  if (/^(vorteil\s+|sf\s+|sonderfertigkeit\s+)?zauberer(in|:in|:er:in)?\b/i.test(s)) return { type: 'caster', text: raw };
  if (/^(vorteil\s+)?(geweihte|visionär|prediger)/i.test(s)) return { type: 'priest', text: raw };
  if ((m = s.match(/Leiteigenschaft(?:\s+der\s+Tradition)?\s+(\d+)/i))) return { type: 'leitTradition', min: Number(m[1]), text: raw };
  if ((m = s.match(/^(?:SF\s+|Sonderfertigkeit\s+)?Tradition\s*\(([^)]+)\)/i))) return { type: 'tradition', name: cleanText(m[1]).trim(), forbidden: forbidden || undefined, text: raw };
  // "Zauberertradition kann Sonderfertigkeit <X> wählen" → the special ability X.
  if ((m = s.match(/Sonderfertigkeit\s+(.+?)\s+w(?:ä|ae)hlen/i))) { const sa = idx.get(labelKey(m[1].trim())); if (sa) return { type: 'specialAbility', name: sa, text: raw }; }
  if (/Kampfstil/i.test(s)) return { type: 'style', styleKind: 'combat', text: raw };
  if (/Zauberstil/i.test(s)) return { type: 'style', styleKind: 'magic', text: raw };
  if (/Liturgiestil/i.test(s)) return { type: 'style', styleKind: 'karmal', text: raw };
  if (/Talentstil/i.test(s)) return { type: 'style', styleKind: 'skill', text: raw };
  // "Kultur muss über einen passenden Adel verfügen." → the char's culture must offer that social status.
  if ((m = s.match(/Kultur\s+muss\s+über\s+(?:einen?\s+)?passende[nrs]?\s+(\w+)/i))) return { type: 'cultureSocialStatus', name: cleanText(m[1]).trim(), text: raw };
  // "Spezies muss über einen Biss-Angriff verfügen" → the species must grant that advantage (biss).
  if ((m = s.match(/^Spezies(?:\s+des\s+Zauberers)?\s+muss\s+über\s+(?:einen?\s+)?(.+?)(?:-Angriff)?\s+verf(?:ü|ue)g\w*/i))) {
    const adv = idx.get(labelKey(m[1].trim()));
    return adv ? { type: 'grantedAdvantage', name: adv, text: raw } : nf();
  }
  if ((m = s.match(/^Spezies\s+([A-ZÄÖÜ][\wäöüÄÖÜ:\- ]+)/))) {
    const sp = resolveSpecies(m[1]);
    return sp ? { type: 'species', name: sp, forbidden: forbidden || undefined, text: raw } : nf();
  }
  // Natural-language species exclusion: "Elfen können diesen Vorteil nicht wählen" → species forbidden.
  if ((m = s.match(/^([A-ZÄÖÜ][a-zäöü]+)\s+(?:k(?:ö|oe)nnen|kann)\b[^.]*\bnicht\b[^.]*\bw(?:ä|ae)hlen/i))) {
    const sp = resolveSpecies(m[1]);
    if (sp) return { type: 'species', name: sp, forbidden: true, text: raw };
  }
  // Culture ref: "Kultur <Name>" or "… der Kultur <Name> angehören" → resolved culture slug.
  if (/\bKultur\b/i.test(s) && (m = s.match(/Kultur\s+([A-ZÄÖÜ][\wäöüÄÖÜ\- ]+?)(?:\s+(?:angeh|sein|stammen|entstammen)|[.,(]|$)/i))) {
    const cult = resolveCulture(m[1].trim());
    if (cult) return { type: 'culture', name: cult, forbidden: forbidden || undefined, text: raw };
  }

  // Explicit category ref: Vorteil/Nachteil/Sonderfertigkeit/SF X (+ optional trailing roman level)
  if ((m = s.match(/^(Vorteil|Nachteil|Sonderfertigkeit(?:en)?|SF)\s+(.+)$/i))) {
    const cat = m[1].toLowerCase();
    let name = m[2].trim(); let min;
    const lm = name.match(/\s+(VII|VI|V|IV|III|II|I)$/);
    if (lm) { min = ROMAN[lm[1]]; name = name.slice(0, lm.index).trim(); }
    const type = cat.startsWith('vorteil') ? 'advantage' : cat.startsWith('nachteil') ? 'disadvantage' : 'specialAbility';
    // Option-aware incompatibility: "… auf die gleiche Umgebung" → forbidden only for the same chosen option.
    const gi = name.search(/\s+auf\s+die\s+gleiche\b/i);
    if (gi > 0) { const base = idx.get(labelKey(name.slice(0, gi))); if (base) return { type, name: base, forbidden: true, sameOption: true, text: raw }; }
    // Base + parenthesized option ("Unfähig (Tierkunde)", "Angst vor (Blut)"): if the base (without the
    // "(…)") resolves to a selection-bearing entry, KEEP the parenthesized part as the chosen option.
    // Otherwise resolveRef below would strip the "(…)" and forbid EVERY option of that base (wrong).
    const pm = name.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (pm) { const pbase = resolveRef(idx, pm[1].trim()); if (pbase && SELECTABLE.has(pbase)) return { type, name: pbase, option: slug(pm[2].trim()), forbidden: forbidden || undefined, text: raw }; }
    // Resolve via exact / "(…)"-stripped / singular-plural / synonym alias.
    const resolved = resolveRef(idx, name);
    if (resolved) return { type, name: resolved, min, forbidden: forbidden || undefined, text: raw };
    // Base + bare option ("Unfähig Körperbeherrschung", "Angst vor Blut"): shortest base that resolves to a
    // selection-bearing entry; the remainder is the chosen option.
    const w = name.split(/\s+/);
    for (let k = 1; k < w.length; k++) {
      const b = resolveRef(idx, w.slice(0, k).join(' '));
      if (b && SELECTABLE.has(b)) return { type, name: b, option: slug(w.slice(k).join(' ')), forbidden: forbidden || undefined, text: raw };
    }
    return nf();
  }
  // Pact / leveled bare ref: "Feenpakt Stufe II"
  if ((m = s.match(/^(.+?)\s+Stufe\s+(VII|VI|V|IV|III|II|I)\b/i))) {
    const resolved = idx.get(labelKey(m[1].trim()));
    return resolved ? { type: 'advantage', name: resolved, min: ROMAN[m[2].toUpperCase()], forbidden: forbidden || undefined, text: raw } : nf();
  }
  // "<Name> <N>" → attribute / talent / combat technique / spell / liturgy (allow a trailing +/#/"(…)" note)
  if ((m = s.match(/^(.+?)\s+(\d+)[+#]?(?:\s*\([^)]*\))?$/))) {
    const nm = m[1].trim().replace(/\s+(?:FW|KaP|AsP|LkP)$/i, ''); const val = Number(m[2]); const lk = labelKey(nm);
    if (ATTR_CODES.has(nm.toUpperCase())) return { type: 'attribute', name: nm.toUpperCase(), min: val, text: raw };
    if (ATTR_GERMAN[lk]) return { type: 'attribute', name: ATTR_GERMAN[lk], min: val, text: raw };
    if (/^Kampftechnik\s|^Fernkampftechnikwert|^Kampftechnikwert/i.test(nm)) return { type: 'combatTechnique', name: nm.replace(/^Kampftechnik\s+/i, '').replace(/wert$/i, ''), min: val, text: raw };
    if (REQ_TALENTS.has(lk)) return { type: 'talent', name: nm, min: val, text: raw };
    if (TALENT_ALIASES.has(lk)) return { type: 'talent', name: TALENT_ALIASES.get(lk), min: val, text: raw };
    if (REQ_CTECHS.has(lk)) return { type: 'combatTechnique', name: nm, min: val, text: raw };
    if (/^(?:Zauber|Ritual)\s/i.test(nm) || REQ_SPELLS.has(labelKey(nm.replace(/^(?:Zauber|Ritual)\s+/i, '')))) return { type: 'spell', name: nm.replace(/^(?:Zauber|Ritual)\s+/i, ''), min: val, text: raw };
    if (REQ_LITURGIES.has(lk)) return { type: 'liturgy', name: nm, min: val, text: raw };
  }
  if (/^(Lesen|Schreiben|Schrift\b)/i.test(s)) return { type: 'script', text: raw };
  if (/Sprache/i.test(s) && /Stufe/i.test(s)) { const lm = s.match(/Stufe\s+(VII|VI|V|IV|III|II|I)/i); return { type: 'language', min: lm ? ROMAN[lm[1].toUpperCase()] : undefined, text: raw }; }
  // Bare reference that resolves to a known advantage/SA slug. Strip trailing junk punctuation ("Zibilja)"),
  // then: resolveRef, a "Tradition <X>"(+plural) prefix (bare tradition names → the SA), and a trailing roman
  // numeral → leveled SA ref ("Volumenerweiterung des Zauberstabes V" → min 5).
  // A bare ref's kind: SA > disadvantage > advantage (the evaluator unifies adv/dis for `has`, but the
  // displayed label resolves via the CatalogIndex by (kind,id), so the kind must be right for the label).
  const bareType = (r) => (SA_SLUG_SET.has(r) ? 'specialAbility' : DIS_SLUG_SET.has(r) ? 'disadvantage' : 'advantage');
  // Bare "<Base> (<Option>)" ref WITHOUT a Vorteil/Nachteil prefix ("kein Eingeschränkter Sinn (Geruch)"):
  // if the base resolves to a selection-bearing entry, keep the parenthesized part as the chosen option.
  // Must run before the sClean strip below, which would drop the closing ")" and mangle "(Geruch)".
  {
    const pm = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (pm) { const pb = resolveRef(idx, pm[1].trim()); if (pb && SELECTABLE.has(pb)) return { type: bareType(pb), name: pb, option: slug(pm[2].trim()), forbidden: forbidden || undefined, text: raw }; }
  }
  const sClean = s.replace(/[)\].,;:]+$/, '').trim();
  let ref = resolveRef(idx, sClean);
  if (!ref) ref = idx.get(labelKey('Tradition ' + sClean)) || idx.get(labelKey('Tradition ' + sClean + 's'));
  let rmin;
  if (!ref) { const rm = sClean.match(/^(.+?)\s+(VII|VI|V|IV|III|II|I)$/); if (rm) { const rr = resolveRef(idx, rm[1].trim()); if (rr) { ref = rr; rmin = ROMAN[rm[2].toUpperCase()]; } } }
  if (ref) return { type: bareType(ref), name: ref, min: rmin, forbidden: forbidden || undefined, text: raw };
  // Bare liturgy/ceremony name ("Objektweihe") → liturgy reference (the char must have it).
  if (REQ_LITURGIES.has(labelKey(s))) return { type: 'liturgy', name: s, forbidden: forbidden || undefined, text: raw };
  // Bare spell/ritual name, optionally "Zauber <X>" ("Zauber CHIMAEROFORM") → spell reference.
  { const sp = s.replace(/^Zauber\s+/i, ''); if (REQ_SPELLS.has(labelKey(sp))) return { type: 'spell', name: sp, forbidden: forbidden || undefined, text: raw }; }

  narrativeLog.push({ owner, text: raw });
  return { type: 'narrative', text: raw, forbidden: forbidden || undefined };
}

function parseRequirements(vorText, idx, owner) {
  let text = cleanText(String(vorText || '')).trim();
  if (!text || /^keine?\b/i.test(text)) return [];
  reqEntriesProcessed++;
  const reqs = [];
  // "Spezies[, Kultur] oder Profession muss <X> als automatischen/empfohlenen/typischen Vorteil/Nachteil
  // aufweisen/besitzen" → ONE granted-advantage requirement (the species/culture/profession restriction).
  // Resolve <X> (a self-reference like the bare word "Vorteil"/"Nachteil" → the owning entry).
  const gm = text.match(/(?:Spezies|Kultur|Profession)[^.]*?\bmuss\b\s+(.+?)\s+als\s+(?:einen?\s+)?(?:automatischen?|empfohlenen?|typischen?)(?:\s+(?:oder|und)\s+(?:automatischen?|empfohlenen?|typischen?))?\s+(Vorteil|Nachteil)\b[^.]*?\b(?:aufweisen|besitzen|haben|verf(?:ü|ue)g\w*)/i);
  if (gm) {
    const xRaw = gm[1].trim();
    const xName = /^(vorteil|nachteil)$/i.test(xRaw) ? (idx.get(labelKey(owner)) || slug(owner)) : (idx.get(labelKey(xRaw)) || slug(xRaw));
    const type = /Vorteil/i.test(gm[2]) ? 'grantedAdvantage' : 'grantedDisadvantage';
    reqs.push({ type, name: xName, text: gm[0].trim() });
    tally(type);
    text = (text.slice(0, gm.index) + ' ' + text.slice(gm.index + gm[0].length)).replace(/(^[\s,;]+)|([\s,;]+$)/g, '').trim();
    if (!text) return reqs;
  }
  let groupCtr = 1;
  // ── Multi-fragment whole-text patterns (matched before the comma split that would shatter them) ──
  let m2;
  // "N der folgenden Talente mindestens FW M: A, B, C, …" → one talentCount requirement.
  if ((m2 = text.match(/(\w+)\s+der folgenden Talente(?:\s+mindestens)?\s+FW\s+(\d+)\s*:\s*(.+)$/i))) {
    const count = NUMWORD[m2[1].toLowerCase()] || Number(m2[1]) || 0;
    const names = m2[3].split(',').map((x) => cleanText(x).trim()).filter((x) => REQ_TALENTS.has(labelKey(x)));
    if (count && names.length) { reqs.push({ type: 'talentCount', count, min: Number(m2[2]), names, text: m2[0].trim() }); tally('talentCount'); }
    text = text.slice(0, m2.index).replace(/[\s,;]+$/, '').replace(/\bzus(?:ä|ae)tzlich\b\s*$/i, '').trim();
  }
  // "FW von A und B muss zusammen N ergeben." → talentSum.
  if ((m2 = text.match(/FW von\s+(.+?)\s+und\s+(.+?)\s+muss zusammen\s+(\d+)\s+ergeben/i))) {
    reqs.push({ type: 'talentSum', names: [cleanText(m2[1]).trim(), cleanText(m2[2]).trim()], min: Number(m2[3]), text: m2[0].trim() }); tally('talentSum');
    text = (text.slice(0, m2.index) + ' ' + text.slice(m2.index + m2[0].length)).replace(/(^[\s,;]+)|([\s,;]+$)/g, '').trim();
  }
  // "je nach … Material: A 4, B 4, … oder E 4" → ONE OR-group (any one material talent).
  if ((m2 = text.match(/je nach[^:]*:\s*(.+)$/i))) {
    const g = groupCtr++;
    for (const it of m2[1].split(/,|\boder\b/i).map((x) => cleanText(x).trim()).filter(Boolean)) {
      const r = classifyFragment(it, idx, owner);
      if (r && r.type !== 'narrative') { r.group = g; tally(r.type); reqs.push(r); }
    }
    text = text.slice(0, m2.index).replace(/[\s,;]+$/, '').trim();
  }
  if (!text) return reqs;
  // Per-level groups: "Stufe I: …; Stufe II: …". The PDF delimiters are inconsistent (the marker may be
  // followed by ':' / ',' / ';' / nothing, and segments separated by ';' OR ','), so split on the
  // "Stufe <roman>" markers themselves and take the text between consecutive markers as that level.
  let segments = [{ atLevel: undefined, text }];
  const stufeMarks = [...text.matchAll(/\bStufe\s+(VII|VI|IV|V|III|II|I)\b[\s:;,]*/gi)];
  if (stufeMarks.length >= 2) {
    const segs = [];
    for (let i = 0; i < stufeMarks.length; i++) {
      const mk = stufeMarks[i];
      const start = mk.index + mk[0].length;
      const end = i + 1 < stufeMarks.length ? stufeMarks[i + 1].index : text.length;
      const lvl = ROMAN[mk[1].toUpperCase()];
      if (lvl != null) segs.push({ atLevel: lvl, text: text.slice(start, end).replace(/^[\s:;,]+|[\s:;,]+$/g, '').trim() });
    }
    if (segs.length) segments = segs;
  }
  for (const seg of segments) {
    for (let frag of seg.text.split(/,|;|\bsowie\b/i).map((s) => s.trim()).filter(Boolean)) {
      // A single fragment may still carry its own "(für) Stufe X:" prefix when the whole text had only ONE
      // Stufe marker (so the segment split above didn't fire, e.g. "Leiteigenschaft 13; Stufe II: …"). Strip
      // it and stamp that level on this fragment, so the atLevel isn't lost and self-refs become detectable.
      let fragLevel = seg.atLevel;
      const fm = frag.match(/^(?:f(?:ü|ue)r\s+|ab\s+)?Stufe\s+(VII|VI|IV|V|III|II|I)\b[\s:;,.]*/i);
      if (fm) { fragLevel = ROMAN[fm[1].toUpperCase()]; frag = frag.slice(fm[0].length).trim(); if (!frag) continue; }
      // A gendered "/in", "/innen", "/e" … suffix on a name is not a real alternative — drop it before
      // the "/"-split so "Sonderfertigkeit Nackttänzer/in" stays one ref (no bogus narrative "in").
      const alts = frag.replace(/\s*\/\s*(?:innen|euse|frau|mann|in|es|en|er|e|r|s)\b/gi, '').split(/\boder\b|\s*\/\s*/i).map((s) => s.trim()).filter(Boolean);
      const group = alts.length > 1 ? groupCtr++ : undefined;
      for (const alt of alts) {
        // Curated fragments (irreducibly-specific): emit the mapped Requirement[] ([] drops; multi → OR-group).
        const curated = CURATED_REQ.get(curatedKey(alt));
        if (curated) {
          const g = curated.length > 1 ? groupCtr++ : group;
          for (const cr of curated) { const r = { ...cr, text: cr.text ?? cleanText(alt) }; if (g) r.group = g; if (fragLevel) r.atLevel = fragLevel; tally(r.type); reqs.push(r); }
          continue;
        }
        const r = classifyFragment(alt, idx, owner);
        if (!r) continue;
        if (group) r.group = group;
        if (fragLevel) r.atLevel = fragLevel;
        tally(r.type);
        reqs.push(r);
      }
    }
  }
  return reqs;
}

function serOneReq(r) {
  const p = [`type: ${JSON.stringify(r.type)}`];
  if (r.name != null) p.push(`name: ${JSON.stringify(r.name)}`);
  if (r.min != null) p.push(`min: ${r.min}`);
  if (r.count != null) p.push(`count: ${r.count}`);
  if (r.spell != null) p.push(`spell: ${JSON.stringify(r.spell)}`);
  if (r.option != null) p.push(`option: ${JSON.stringify(r.option)}`);
  if (r.names != null) p.push(`names: ${JSON.stringify(r.names)}`);
  if (r.forbidden) p.push(`forbidden: true`);
  if (r.sameOption) p.push(`sameOption: true`);
  if (r.styleKind) p.push(`styleKind: ${JSON.stringify(r.styleKind)}`);
  if (r.group != null) p.push(`group: ${r.group}`);
  if (r.atLevel != null) p.push(`atLevel: ${r.atLevel}`);
  if (r.then) p.push(`then: ${serOneReq(r.then)}`); // option-conditional (ifOption)
  if (r.text != null) p.push(`text: ${JSON.stringify(r.text)}`);
  return `{ ${p.join(', ')} }`;
}
function serRequirements(reqs) {
  return '[' + reqs.map(serOneReq).join(', ') + ']';
}

// Requirements minus self-references: a leveled entry requiring its OWN previous level ("Finte I" for
// Finte II) is redundant (sequential leveling enforces it); a take-once forbidden self-ref ("… bisher
// nicht vorhanden") isn't a prereq. Covers the resolved form (specialAbility/adv/dis name === self) and
// the narrative form ("Präziser Schuss I") left when the self-ref didn't resolve to a slug.
function withoutSelfRefs(e) {
  const selfSlug = labelKey(e.name);
  const selfCore = labelKey(String(e.label).replace(/\s*[/(:].*$/, ''));
  const romanTail = /\s+(VII|VI|IV|V|III|II|I)$/i;
  return (e.requirements ?? []).filter((r) => {
    if (/^(advantage|disadvantage|specialAbility)$/.test(r.type) && labelKey(r.name || '') === selfSlug) return false;
    if (r.type === 'narrative' && r.text) {
      const core = labelKey(r.text.replace(romanTail, ''));
      if (core && (core === selfSlug || core === selfCore)) return false;
    }
    return true;
  });
}

const advEntries = buildEntries('VorteilGetInfo');
const disEntries = buildEntries('NachteilGetInfo');
// Preserve any hand entry that didn't match a PDF concept (rare).
for (const h of hand.all) {
  if (h.__matched) continue;
  const target = h.cost < 0 ? disEntries : advEntries;
  target.push({ name: h.slug, label: h.label, cost: h.cost, lvl: h.lvl, maxLvl: h.maxLvl, prerequisite: h.prerequisite, speciesRestrictionRaw: h.speciesRestrictionRaw, sourcesRaw: h.sourcesRaw, url: h.url });
}

// Second pass: the PDF "Voraussetzung(en):" text is authoritative — re-parse EVERY entry and
// replace `prerequisite`. Keep the verbatim text for narrative conditions. Entries whose PDF
// text has no marker keep their curated prerequisites (from advantage-hand.const.txt).
const labelToSlug = new Map();
for (const e of [...advEntries, ...disEntries]) if (!labelToSlug.has(labelKey(e.label))) labelToSlug.set(labelKey(e.label), e.name);
for (const e of [...advEntries, ...disEntries]) if (e.selection) SELECTABLE.add(e.name); // bases that take an option
for (const e of disEntries) DIS_SLUG_SET.add(e.name); // for bare-ref disadvantage typing (see DIS_SLUG_SET)
// Gender-form aliases: register the PDF male/female/divers variants so masculine refs resolve too.
for (const e of [...advEntries, ...disEntries]) for (const f of e.__forms ?? []) { const k = labelKey(splitLevel(f).base); if (k && !labelToSlug.has(k)) labelToSlug.set(k, e.name); }
let prereqFilled = 0;
for (const e of [...advEntries, ...disEntries]) {
  if (e.__vor) {
    const parsed = parseVoraussetzungen(e.__vor, labelToSlug);
    if (parsed.hadMarker) {
      e.prerequisite = parsed.prereqs;
      if (parsed.text) e.prerequisiteText = parsed.text;
      if (parsed.prereqs.length) prereqFilled++;
    }
  }
  delete e.__vor;
}
// Structured requirements from the (now authoritative) prerequisiteText, merged with slug-keyed curated
// requirements (incompatibilities the PDF text lacks or the parser can't express).
for (const e of [...advEntries, ...disEntries]) {
  const reqs = parseRequirements(e.prerequisiteText, labelToSlug, e.label);
  const curated = CURATED_ENTRY_REQ.get(e.name);
  const merged = curated ? mergeCuratedReqs(reqs, curated.reqs) : reqs;
  if (merged.length) e.requirements = merged;
  if (curated?.text && !e.prerequisiteText) e.prerequisiteText = curated.text;
}

// Symmetric-exclusion mirror: a "kein Vorteil/Nachteil X" exclusion is inherently mutual, so keep the
// rule on BOTH entries (each carries its correct prerequisites, as the rulebook lists them). The
// validator consolidates the reciprocal pair into a single "schließen sich gegenseitig aus" message at
// runtime. Only PLAIN forbidden advantage/disadvantage refs are mirrored — option-/sameOption-/group-
// scoped exclusions are conditional and stay one-directional.
{
  const byName = new Map([...advEntries, ...disEntries].map((e) => [e.name, e]));
  const isPlainForbidden = (r) => r && r.forbidden === true && !r.option && !r.sameOption && r.group == null && r.min == null && (r.type === 'advantage' || r.type === 'disadvantage');
  const wordOf = (e) => (e.cost < 0 ? 'Nachteil' : 'Vorteil');
  const typeOf = (e) => (e.cost < 0 ? 'disadvantage' : 'advantage');
  let mirrored = 0;
  for (const e of [...advEntries, ...disEntries]) {
    for (const r of e.requirements ?? []) {
      if (!isPlainForbidden(r) || r.name === e.name) continue;
      const target = byName.get(r.name);
      if (!target) continue; // ref points outside the advantage/disadvantage catalog
      target.requirements = target.requirements ?? [];
      const already = target.requirements.some((q) => q.forbidden && q.name === e.name && q.type === typeOf(e) && !q.option && !q.sameOption && q.group == null);
      if (already) continue;
      target.requirements.push({ type: typeOf(e), name: e.name, forbidden: true, text: `kein ${wordOf(e)} ${e.label}` });
      mirrored++;
    }
  }
  console.log(`[extract] mirrored ${mirrored} reciprocal exclusion(s) across advantage/disadvantage entries`);
}

// advantage.const.ts is written near the END of this file (after the SA catalogs build the full SA
// index), so advantage `requirements` can resolve "Sonderfertigkeit X" cross-references to SA slugs.

// selection-options.const.ts is written near the END of this file (after the SA blocks register their own
// `Liste` sub-selections in `usedSelectors`), so the registry covers advantage AND special-ability selections.

// ── Resolved species report (authority for the hand-written species.const.ts) ──────────────────
// Translates each DSA species' eight PDF advantage lists into clean, canonical refs
// `{ name, option?, lvl? }` so the const can reference catalog slugs + SELECTION_OPTIONS option
// slugs directly. The same id→slug + param→option translation feeds culture/profession/SA later.

// labelKey(base label) → canonical catalog slug, from the freshly generated catalogs.
const labelKeyToName = new Map();
for (const e of [...advEntries, ...disEntries]) {
  const k = labelKey(e.label);
  if (k && !labelKeyToName.has(k)) labelKeyToName.set(k, e.name);
}

// PDF option id (talent/spell/liturgy ID, or a selection option's ID/Opt_ID) → canonical option slug.
const pdfIdToOption = new Map();
function indexOptionIds(dataFn) {
  const m = tailInfoMap(dataFn);
  const nameIdx = m['Name'] ?? m['Name divers'] ?? 1;
  for (const r of dataFnRecords(dataFn)) {
    const nm = r[nameIdx];
    if (typeof nm !== 'string' || !nm.trim() || isCode(nm)) continue;
    const optName = slug(nm);
    if (!optName) continue;
    for (const idKey of ['ID', 'Opt_ID', 'Nummer']) {
      const idx = m[idKey];
      if (idx != null && typeof r[idx] === 'string' && r[idx]) if (!pdfIdToOption.has(r[idx])) pdfIdToOption.set(r[idx], optName);
    }
  }
}
{
  const dataFns = new Set(['TalentGetInfo', 'ZauberGetInfo', 'LiturgieGetInfo']); // GesamtArray/TalentArray params (Tal#, …)
  for (const { fn } of usedSelectors.values()) if (fn !== 'GesamtArray') dataFns.add(SEL_DATA_FN[fn] || fn.replace('Array', 'GetInfo'));
  for (const fn of dataFns) if (functionBody(js, fn)) indexOptionIds(fn);
}

function resolveSpeciesRef(e) {
  const name = labelKeyToName.get(labelKey(e.base)) ?? null;
  const option = e.param ? pdfIdToOption.get(e.param) ?? null : null;
  const ref = { name, base: e.base, label: e.label, vtId: e.vtId, param: e.param || undefined };
  if (option) ref.option = option;
  if (e.level) ref.lvl = e.level;
  if (!name || (e.param && !option)) ref.UNRESOLVED = true;
  return ref;
}
// code → German species name (divers form), from IDSpezies' `daten[0] = [plural, m, w, divers]`.
const speciesName = new Map();
{
  const b = functionBody(js, 'IDSpezies');
  const re = /case\s+"(S\d+)"\s*:\s*daten\[0\]\s*=\s*(\[[^\]]*\])/g;
  let mm;
  while ((mm = re.exec(b)) !== null) {
    try { const arr = JSON.parse(mm[2]); if (Array.isArray(arr)) speciesName.set(mm[1], arr[3] || arr[1] || mm[1]); } catch { /* skip */ }
  }
}
const speciesResolved = species
  .filter((s) => s.dsa)
  .map((s) => ({
    code: s.code,
    name: speciesName.get(s.code) ?? s.code,
    apCost: s.apCost,
    autoAdvantages: s.autoAdvantages.map(resolveSpeciesRef),
    autoDisadvantages: s.autoDisadvantages.map(resolveSpeciesRef),
    recommendedAdvantages: s.recommendedAdvantages.map(resolveSpeciesRef),
    recommendedDisadvantages: s.recommendedDisadvantages.map(resolveSpeciesRef),
    typicalAdvantages: s.typicalAdvantages.map(resolveSpeciesRef),
    typicalDisadvantages: s.typicalDisadvantages.map(resolveSpeciesRef),
    atypicalAdvantages: s.atypicalAdvantages.map(resolveSpeciesRef),
    atypicalDisadvantages: s.atypicalDisadvantages.map(resolveSpeciesRef),
  }));
writeFileSync(resolve(ROOT, 'tools/dsa-data/species-resolved.json'), JSON.stringify(speciesResolved, null, 2), 'utf8');
const unresolved = speciesResolved.flatMap((s) => Object.values(s).filter(Array.isArray).flat()).filter((r) => r && r.UNRESOLVED);
console.log(`Species resolved: ${speciesResolved.length} DSA species, ${pdfIdToOption.size} option ids; unresolved refs: ${unresolved.length}. Wrote species-resolved.json`);
if (unresolved.length) console.log('  unresolved sample:', [...new Set(unresolved.map((r) => `${r.label}${r.param ? ` [${r.param}]` : ''}`))].slice(0, 25).join(' | '));

// ── Profession grants → canonical refs + write profession.const.ts (deferred from above) ───────
// Each granted advantage/disadvantage tuple resolves to { name, label, option?, lvl? } — `label`
// for display, the rest for application/validation. Reuses the species id→slug / param→option table.
// Resolve a grant tuple → { name, label, option?, lvl? }; drop grants whose base isn't in the
// catalog (e.g. Mythos/Tcho-Tcho advantages excluded upstream).
function toProfRef(e) {
  const r = resolveSpeciesRef(e);
  if (!r.name) return null;
  const ref = { name: r.name, label: cleanText(r.label) };
  if (r.option) ref.option = r.option;
  if (r.lvl) ref.lvl = r.lvl;
  return ref;
}
let profGrantsDropped = 0;
for (const p of profs) {
  const advAll = (p.__advRaw || []).map(toProfRef);
  const disAll = (p.__disRaw || []).map(toProfRef);
  profGrantsDropped += advAll.filter((r) => !r).length + disAll.filter((r) => !r).length;
  p.advantages = advAll.filter(Boolean);
  p.disadvantages = disAll.filter(Boolean);
  delete p.__advRaw;
  delete p.__disRaw;
}
writeFileSync(resolve(ROOT, 'tools/dsa-data/professions.json'), JSON.stringify(profs, null, 2), 'utf8');
writeFileSync(
  resolve(CONST_DIR, 'profession.const.ts'),
  `import { Profession } from '../models/profession.model';\n\n` +
    `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (ProfessionGetInfo). Do not edit by hand. ───\n` +
    `// DSA Aventurien only. ${profs.length} professions. Granted advantages/disadvantages are canonical\n` +
    `// { name, label, option?, lvl? } refs; other package items stored by label.\n\n` +
    `export const ALL_PROFESSIONS: Profession[] = ${JSON.stringify(profs, null, 2)};\n`,
  'utf8'
);
const profCounts = profs.reduce((a, p) => ((a[p.category] = (a[p.category] || 0) + 1), a), {});
console.log(`Professions: ${profs.length} (${JSON.stringify(profCounts)}), excluded: ${profExcluded}, grants dropped (non-catalog): ${profGrantsDropped}. Wrote profession.const.ts`);

// ── Equipment catalog (Besitz / weapons / armor / shields) ─────────────────────
// Selectable items for the Besitz tab. Each entry carries a top-level `category` (for the item-list
// filter) plus type-specific stats; weapons/armor/shields are later mapped into the editable table
// rows via the model mappers. Mythos / "Schwarze Katze" (CtC/SPC) entries are dropped.

// Like parseGetInfo, but keyed on field[0] (Name) — Besitz' field[1] (Anzahl) is often "".
function parseCatalog(fnName) {
  const records = [];
  for (const chunk of functionBody(js, fnName).split('break;')) {
    const f = {};
    const fre = /aDaten\[(\d+)\]\s*=\s*("(?:\\.|[^"\\])*"|\[[\s\S]*?\]);/g;
    let fm;
    let any = false;
    while ((fm = fre.exec(chunk)) !== null) {
      f[Number(fm[1])] = parseValue(fm[2]);
      any = true;
    }
    if (any && f[0]) records.push(f);
  }
  return records;
}

const decNum = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : 0; }; // "0,5" → 0.5
const intNum = (v) => { const n = parseInt(String(v ?? '').replace(/[^0-9\-]/g, ''), 10); return Number.isFinite(n) ? n : 0; }; // "+2" → 2, "-1" → -1
const firstOf = (v) => cleanText(String(Array.isArray(v) ? v[0] ?? '' : v ?? '')).trim(); // Typ arrays → "allgemein"
const works = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? [v] : []).filter((s) => typeof s === 'string'); // Werke codes
const RW_ENUM = { kurz: 'Reichweite.Kurz', mittel: 'Reichweite.Mittel', lang: 'Reichweite.Lang' };

// Compact object serializer: pairs = [key, rawExpr]; entries with null/'' value are dropped.
function serObj(pairs) {
  return '  { ' + pairs.filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v}`).join(', ') + ' },';
}
function dedupeSlugs(list) {
  const used = new Set();
  for (const e of list) {
    let n = slug(e.label) || 'eintrag';
    while (used.has(n)) n += 'x';
    used.add(n);
    e.name = n;
  }
}
function writeCatalog(file, importLine, header, constName, typeName, objs) {
  writeFileSync(
    resolve(CONST_DIR, file),
    `${importLine}\n\n// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs. Do not edit by hand. ───\n` +
      `// ${header} DSA Aventurien only (Mythos/Schwarze Katze excluded). ${objs.length} entries.\n\n` +
      `export const ${constName}: ${typeName}[] = [\n${objs.join('\n')}\n];\n`,
    'utf8',
  );
}

// General items (BesitzGetInfo): Name 0, Anzahl 1, Gewicht 2, Struktur 3, Wert 4, Typ 6, Werke 7, URL 10.
const items = [];
for (const r of parseCatalog('BesitzGetInfo')) {
  if (!isDsa(works(r[7]))) continue;
  items.push({ label: cleanText(String(r[0])), r });
}
dedupeSlugs(items);
items.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const itemObjs = items.map(({ name, label, r }) => {
  const qty = intNum(r[1]);
  const struct = decNum(r[3]);
  const url = buildUrl(r[10]);
  const sources = buildSources(works(r[7]));
  return serObj([
    ['name', JSON.stringify(name)],
    ['label', JSON.stringify(label)],
    ['category', 'ItemCategory.Item'],
    ['type', JSON.stringify(cleanText(String(r[6] || '')))],
    ['weight', decNum(r[2])],
    ['price', decNum(r[4])],
    ['structure', struct > 0 ? struct : null],
    ['defaultQuantity', qty > 0 ? qty : null],
    ['url', url ? JSON.stringify(url) : null],
    ['sources', sources.length ? JSON.stringify(sources) : null],
  ]);
});
writeCatalog('item.const.ts', `import { Item, ItemCategory } from '../models/item.model';`, 'General Besitz items (BesitzGetInfo).', 'ALL_ITEMS', 'Item', itemObjs);

// ── Komplettpakete → contained items (from BesitzAuswahl's switch) ──────────────────────────────
// The self-calculating sheet fills the inventory when a Komplettpaket is picked: each `case "X":` sets
// a primary item (sName/sAnzahl/sOrt) and pushes the rest via `aZusatz.push([Name, Anzahl, Ort])`.
// Extract that so picking a package in the Besitz tab expands into its individual item rows.
{
  const auswahl = functionBody(js, 'BesitzAuswahl');
  const packages = {};
  const caseRe = /case\s+"([^"]+)"\s*:([\s\S]*?)(?=case\s+"|default\s*:|\n\s*\}\s*$)/g;
  let cm;
  while ((cm = caseRe.exec(auswahl)) !== null) {
    const block = cm[2];
    if (!/aZusatz\.push/.test(block)) continue; // only cases that expand into multiple items = packages
    const contents = [];
    const add = (nm, qty, ort) => {
      const name = cleanText(String(nm || '')).trim();
      if (!name) return;
      const where = cleanText(String(ort || '')).trim();
      contents.push({ name, quantity: intNum(qty) || 1, ...(where ? { carriedWhere: where } : {}) });
    };
    add((block.match(/sName\s*=\s*"([^"]*)"/) || [])[1], (block.match(/sAnzahl\s*=\s*"([^"]*)"/) || [])[1], (block.match(/sOrt\s*=\s*"([^"]*)"/) || [])[1]);
    for (const zm of block.matchAll(/aZusatz\.push\(\[([^\]]*)\]\)/g)) {
      const parts = [...zm[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) => x[1]);
      add(parts[0], parts[1], parts[2]);
    }
    if (contents.length) packages[slug(cleanText(cm[1]))] = contents;
  }
  const pkgBody = Object.keys(packages).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(packages[k])},`).join('\n');
  const pkgOut =
    `import { PackageItem } from '../models/item.model';\n\n` +
    `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (BesitzAuswahl). Do not edit by hand. ───\n` +
    `// Komplettpaket slug → contained items. Picking a package in the Besitz tab expands into these rows.\n\n` +
    `export const ITEM_PACKAGES: Record<string, PackageItem[]> = {\n${pkgBody}\n};\n`;
  writeFileSync(resolve(CONST_DIR, 'item-package.const.ts'), pkgOut, 'utf8');
  console.log(`Item packages → ${Object.keys(packages).length}. Wrote item-package.const.ts`);
}

// Melee weapons (NahkampfWaffeGetInfo).
const melee = [];
for (const r of parseCatalog('NahkampfWaffeGetInfo')) {
  if (!isDsa(works(r[18]))) continue;
  melee.push({ label: cleanText(String(r[0])), r });
}
dedupeSlugs(melee);
melee.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const meleeObjs = melee.map(({ name, label, r }) => {
  const damage = `${String(r[3] || '')}${String(r[4] || '')}`;
  const length = decNum(r[11]);
  const price = decNum(r[14]);
  const note = cleanText(String(r[16] || '')).trim();
  const sources = buildSources(works(r[18]));
  return serObj([
    ['name', JSON.stringify(name)],
    ['label', JSON.stringify(label)],
    ['category', 'ItemCategory.MeleeWeapon'],
    ['combatTechnique', JSON.stringify(cleanText(String(r[2] || '')))],
    ['damage', JSON.stringify(damage)],
    ['primaryAttribute', JSON.stringify(String(r[5] || ''))],
    ['threshold', intNum(r[6])],
    ['atMod', intNum(r[7])],
    ['paMod', intNum(r[8])],
    ['range', RW_ENUM[String(r[9] || '').toLowerCase().trim()] || 'null'],
    ['length', length > 0 ? length : null],
    ['bf', intNum(r[15])],
    ['weight', decNum(r[10])],
    ['price', price > 0 ? price : null],
    ['availability', firstOf(r[1]) ? JSON.stringify(firstOf(r[1])) : null],
    ['note', note ? JSON.stringify(note) : null],
    ['sources', sources.length ? JSON.stringify(sources) : null],
  ]);
});
writeCatalog(
  'melee-weapon.const.ts',
  `import { MeleeWeaponItem, Reichweite } from '../models/melee-weapon.model';\nimport { ItemCategory } from '../models/item.model';`,
  'Melee weapons (NahkampfWaffeGetInfo).',
  'ALL_MELEE_WEAPONS',
  'MeleeWeaponItem',
  meleeObjs,
);

// Ranged weapons (FernkampfWaffeGetInfo): Reichweite 5 = "nah/mittel/fern".
const ranged = [];
for (const r of parseCatalog('FernkampfWaffeGetInfo')) {
  if (!isDsa(works(r[23]))) continue;
  ranged.push({ label: cleanText(String(r[0])), r });
}
dedupeSlugs(ranged);
ranged.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const rangedObjs = ranged.map(({ name, label, r }) => {
  const [rc, rm, rf] = String(r[5] || '').split('/').map((x) => (x.trim() ? intNum(x) : null));
  const length = decNum(r[8]);
  const price = decNum(r[10]);
  const note = cleanText(String(r[12] || '')).trim();
  const sources = buildSources(works(r[23]));
  return serObj([
    ['name', JSON.stringify(name)],
    ['label', JSON.stringify(label)],
    ['category', 'ItemCategory.RangedWeapon'],
    ['combatTechnique', JSON.stringify(cleanText(String(r[2] || '')))],
    ['damage', JSON.stringify(String(r[3] || ''))],
    ['reloadTime', JSON.stringify(String(r[4] || ''))],
    ['rangeClose', rc ?? 'null'],
    ['rangeMedium', rm ?? 'null'],
    ['rangeFar', rf ?? 'null'],
    ['ammunition', JSON.stringify(cleanText(String(r[6] || '')))],
    ['length', length > 0 ? length : null],
    ['bf', intNum(r[11])],
    ['weight', decNum(r[7])],
    ['price', price > 0 ? price : null],
    ['availability', firstOf(r[1]) ? JSON.stringify(firstOf(r[1])) : null],
    ['note', note ? JSON.stringify(note) : null],
    ['sources', sources.length ? JSON.stringify(sources) : null],
  ]);
});
writeCatalog(
  'ranged-weapon.const.ts',
  `import { RangedWeaponItem } from '../models/ranged-weapon.model';\nimport { ItemCategory } from '../models/item.model';`,
  'Ranged weapons (FernkampfWaffeGetInfo).',
  'ALL_RANGED_WEAPONS',
  'RangedWeaponItem',
  rangedObjs,
);

// Armor (RuestungGetInfo).
const armor = [];
for (const r of parseCatalog('RuestungGetInfo')) {
  if (!isDsa(works(r[11]))) continue;
  armor.push({ label: cleanText(String(r[0])), r });
}
dedupeSlugs(armor);
armor.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const armorObjs = armor.map(({ name, label, r }) => {
  const area = cleanText(String(r[2] || '')).trim();
  const price = decNum(r[7]);
  const note = cleanText(String(r[9] || '')).trim();
  const sources = buildSources(works(r[11]));
  return serObj([
    ['name', JSON.stringify(name)],
    ['label', JSON.stringify(label)],
    ['category', 'ItemCategory.Armor'],
    ['rs', intNum(r[3])],
    ['be', intNum(r[4])],
    ['structure', intNum(r[8])],
    ['area', area ? JSON.stringify(area) : null],
    ['weight', decNum(r[6])],
    ['price', price > 0 ? price : null],
    ['availability', firstOf(r[1]) ? JSON.stringify(firstOf(r[1])) : null],
    ['note', note ? JSON.stringify(note) : null],
    ['sources', sources.length ? JSON.stringify(sources) : null],
  ]);
});
writeCatalog(
  'armor.const.ts',
  `import { ArmorItem } from '../models/armor-row.model';\nimport { ItemCategory } from '../models/item.model';`,
  'Armor (RuestungGetInfo).',
  'ALL_ARMOR',
  'ArmorItem',
  armorObjs,
);

// Shields & parrying weapons (SchildGetInfo): Mod 4 = "AT/PA" e.g. "0/+2".
const shields = [];
for (const r of parseCatalog('SchildGetInfo')) {
  if (!isDsa(works(r[11]))) continue;
  shields.push({ label: cleanText(String(r[0])), r });
}
dedupeSlugs(shields);
shields.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const shieldObjs = shields.map(({ name, label, r }) => {
  const [atMod, paMod] = String(r[4] || '').split('/');
  const note = cleanText(String(r[9] || '')).trim();
  const sources = buildSources(works(r[11]));
  return serObj([
    ['name', JSON.stringify(name)],
    ['label', JSON.stringify(label)],
    ['category', 'ItemCategory.Shield'],
    ['structure', intNum(r[2])],
    ['size', JSON.stringify(cleanText(String(r[3] || '')))],
    ['atMod', intNum(atMod)],
    ['paMod', intNum(paMod)],
    ['bf', intNum(r[8])],
    ['weight', decNum(r[5])],
    ['availability', firstOf(r[1]) ? JSON.stringify(firstOf(r[1])) : null],
    ['note', note ? JSON.stringify(note) : null],
    ['sources', sources.length ? JSON.stringify(sources) : null],
  ]);
});
writeCatalog(
  'shield.const.ts',
  `import { ShieldItem } from '../models/shield-row.model';\nimport { ItemCategory } from '../models/item.model';`,
  'Shields & parrying weapons (SchildGetInfo).',
  'ALL_SHIELDS',
  'ShieldItem',
  shieldObjs,
);

console.log(
  `Equipment catalog → items: ${itemObjs.length}, melee: ${meleeObjs.length}, ranged: ${rangedObjs.length}, ` +
    `armor: ${armorObjs.length}, shields: ${shieldObjs.length}. Wrote item/melee-weapon/ranged-weapon/armor/shield const.ts`,
);

// ── General / combat / karmal special abilities (SFAllg / SFKampf / SFKarm) ────
// Fully regenerates special-ability-profane.const.ts and special-ability-karmal.const.ts from the
// PDF (cost, subcategory, effect + prerequisite text, structured prerequisites). Existing curated
// slugs are preserved via tools/dsa-data/sa-hand-snapshot.json (built by build-sa-hand-snapshot.mjs)
// so species/culture/profession/SA references and data-integrity.spec.ts keep resolving. Hand entries
// with NO SF source (languages, scripts, karmal traditions, …) are carried forward verbatim ("orphans").
// Routing is by `category` (the app filters ALL_SPECIAL_ABILITIES on it), not by file.

const SA_SNAPSHOT = resolve(ROOT, 'tools/dsa-data/sa-hand-snapshot.json');
const handSAList = JSON.parse(readFileSync(SA_SNAPSHOT, 'utf8'));
const handSlugByLabelKey = new Map();
for (const h of handSAList) if (!handSlugByLabelKey.has(h.labelKey)) handSlugByLabelKey.set(h.labelKey, h.name);

// Cost may be a tier string ("15/45") → take the first integer.
const firstCost = (s) => { const m = String(s ?? '').match(/-?\d+/); return m ? Number(m[0]) : 0; };

// Split a "Regel:" string into the effect prose (before "Voraussetzungen:"/"Kampftechniken:") and
// the granted combat techniques (the "Kampftechniken: …" line, if any).
function parseRegel(regel) {
  let t = cleanText(String(regel || '')).replace(/^\s*Regel:\s*/i, '');
  const a = t.search(/\n\s*Voraussetzung(?:en)?:/i);
  const b = t.search(/\n\s*Kampftechniken:/i);
  const cuts = [a, b].filter((x) => x >= 0);
  const effect = (cuts.length ? t.slice(0, Math.min(...cuts)) : t).trim();
  const ctm = String(regel || '').match(/Kampftechniken:\s*([^\n]+)/i);
  const combatTechniques = ctm ? cleanText(ctm[1]).split(/[,;]/).map((x) => x.trim()).filter(Boolean) : [];
  return { effect, combatTechniques };
}

const MYTHOS_SA_TYP = new Set(['Cthulhu']); // belt-and-braces; book filter also drops these
function sfAllgCategory(typ, subtyp) {
  const sub = (Array.isArray(subtyp) ? subtyp : [subtyp]).join('|');
  switch (typ) {
    case 'allgemein': return /erweitert/i.test(sub) ? 'SkillExtended' : 'General';
    case 'SchiP': return 'FatePoint';          // Schicksalspunkte-Sonderfertigkeiten
    case 'Hypnose': return 'General';
    case 'Pakt': return 'MagicPact';
    case 'Vampir': return 'MagicVampiric';
    case 'Lykanthrop': return 'MagicLycanthropic';
    case 'Sikaryan': return 'MagicSikaryanRaub';
    default: return null;
  }
}
function sfKampfCategory(typ, subtyp) {
  const sub = String(Array.isArray(subtyp) ? subtyp.join('|') : (subtyp ?? ''));
  switch (typ) {
    case 'allgemein': return /erweitert/i.test(sub) ? 'CombatStyleExtended' : 'Combat';
    case 'Stil': return 'CombatStyle';
    case 'Befehl': return 'Command';
    case 'Prügeln': return 'Brawling';
    default: return 'Combat';
  }
}
function sfKarmCategory(typ) {
  switch (typ) {
    case 'allgemein': return 'KarmalGeneral';
    case 'Predigt': return 'KarmalSermon';
    case 'Vision': return 'KarmalVision';
    case 'Zeremonialgegenstand': return 'KarmalCeremonialObject';
    default: return 'KarmalGeneral';
  }
}

// Capture each SA's "Liste" sub-selection: `if (sInfoID == "Liste") aDaten[<liste>] = XxxArray(args)`.
// → Map labelKey(Name) → { fn, param } (like advantages' aDaten[5] selector). parseGetInfo drops these
// function-call fields, so scan the raw case blocks. (Fn names may contain umlauts: Prägung/Dämon/…)
function buildSelectorMap(fnName, listeIdx) {
  const map = new Map();
  const callRe = new RegExp('aDaten\\[' + listeIdx + '\\]\\s*=\\s*([A-Za-zÄÖÜäöü]+)\\(([^)]*)\\)');
  for (const chunk of functionBody(js, fnName).split('break;')) {
    const nm = chunk.match(/aDaten\[0\]\s*=\s*"((?:\\.|[^"\\])*)"/);
    const sel = chunk.match(callRe);
    if (!nm || !sel) continue;
    const param = sel[2].replace(/["']/g, '').trim() || null; // e.g. "Zauber|Ritual", "Animisten", or null
    const k = labelKey(cleanText(nm[1]));
    if (k && !map.has(k)) map.set(k, { fn: sel[1], param });
  }
  return map;
}

// Parse + DSA-filter + level-collapse one SF function into concepts (carrying the field map `m`).
function buildSAConcepts(fnName, m, categoryFn) {
  const selectors = m.liste != null ? buildSelectorMap(fnName, m.liste) : null;
  const raw = [];
  for (const r of parseGetInfo(functionBody(js, fnName))) {
    const books = Array.isArray(r[m.books]) ? r[m.books].flat().filter((s) => typeof s === 'string') : [];
    if (!isDsa(books)) continue;
    const typ = String(r[m.typ] ?? '');
    if (MYTHOS_SA_TYP.has(typ)) continue;
    const label = cleanText(String(r[0] ?? ''));
    if (!label) continue;
    const cat = categoryFn(typ, r[m.subtyp], r);
    if (!cat) continue;
    raw.push({ label, cat, r, m });
  }
  const byKey = new Map();
  for (const rec of raw) {
    const { base, level } = splitLevel(rec.label);
    const key = `${rec.cat}|${labelKey(base)}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push({ ...rec, base: cleanText(base), level });
  }
  const concepts = [];
  for (const members of byKey.values()) {
    const levels = members.map((x) => x.level).filter((x) => x != null);
    const leveled = levels.length > 0;
    const sorted = members.slice().sort((a, b) => (a.level || 0) - (b.level || 0));
    const rep = sorted[0];
    // PDF name variants (divers/male/female) → gender aliases so gendered refs ("Segen der Waldläuferin")
    // resolve to the gender-neutral catalog slug.
    const forms = [rep.r[0], rep.r[1], rep.r[2]].filter((x) => typeof x === 'string' && x.trim());
    const selection = selectors ? selectors.get(labelKey(cleanText(String(rep.r[0])))) : undefined;
    // Per-tier AP (Finte 15/20/25). Tiers are bought cumulatively, so the app sums costLevels[0..lvl-1].
    const costLevels = leveled ? sorted.map((x) => firstCost(x.r[m.cost])) : undefined;
    concepts.push({ label: leveled ? rep.base : rep.label, cat: rep.cat, r: rep.r, m: rep.m, maxLvl: leveled ? Math.max(...levels) : undefined, costLevels, __forms: forms, __sel: selection });
  }
  return concepts;
}

const genConcepts = [
  ...buildSAConcepts('SFAllgGetInfo', { books: 9, typ: 6, subtyp: 7, cost: 3, regel: 5, url: 10, liste: 4 }, sfAllgCategory),
  ...buildSAConcepts('SFKampfGetInfo', { books: 8, typ: 5, subtyp: 6, cost: 3, regel: 4, url: 9 }, sfKampfCategory),
  ...buildSAConcepts('SFKarmGetInfo', { books: 12, typ: 6, subtyp: 7, cost: 3, regel: 5, url: 14, tradition: 11, liste: 4 }, sfKarmCategory),
];

// Hand entries the PDF did NOT reproduce (languages, scripts, karmal traditions, …) → keep verbatim.
const generatedLabelKeys = new Set(genConcepts.map((e) => labelKey(e.label)));
// labelKey → set of generated SA categories, for category-aware orphan dedup.
const generatedCatsByLabel = new Map();
for (const e of genConcepts) {
  const k = labelKey(e.label);
  if (!generatedCatsByLabel.has(k)) generatedCatsByLabel.set(k, new Set());
  generatedCatsByLabel.get(k).add(e.cat);
}
// Gender-folded label key ("Masseur" ≡ "Masseur:in", "Guter Gardist" ≡ "Guter Gardist:in") → categories,
// so old masculine-form hand stubs are recognized as duplicates of the gender-neutral generated SAs.
const saFold = (label) => String(label || '').replace(/\s*\([^)]*\)\s*$/, '').toLowerCase()
  .replace(/[:\/](?:innen|in|r|e|s)\b/g, '').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const generatedFoldedCats = new Map();
for (const e of genConcepts) { const k = saFold(e.label); if (k && !generatedFoldedCats.has(k)) generatedFoldedCats.set(k, new Set()); if (k) generatedFoldedCats.get(k).add(e.cat); }
// Drop an orphan only if it's a real duplicate of a generated SA: exact label match, OR — with a trailing
// "(…)" disambiguator stripped — a match to a generated SA OF THE SAME CATEGORY (e.g. snapshot
// "Fertigkeitsspezialisierung (Talente)" ≡ generated "Fertigkeitsspezialisierung", both General). The
// category check is essential: karmal "Tradition (X)" (KarmalTradition) must NOT be dropped by the
// generic "Tradition" placeholder (KarmalGeneral/MagicGeneral).
const saOrphans = handSAList
  .filter((h) => {
    if (generatedLabelKeys.has(h.labelKey)) return false;
    const strippedCats = generatedCatsByLabel.get(labelKey(String(h.label || '').replace(/\s*\([^)]*\)\s*$/, '')));
    if (strippedCats && strippedCats.has(h.category)) return false;
    // Gender-fold match of the same category → duplicate of a gender-neutral generated SA (e.g.
    // stub "Masseur"/"Niederhöllischer Schmied" ≡ generated "Masseur:in"/"Niederhöllischer Schmied:in").
    const foldedCats = generatedFoldedCats.get(saFold(h.label));
    return !(foldedCats && foldedCats.has(h.category));
  })
  .map((h) => ({ ...h, cat: h.category }));
// requirements for orphans are parsed once idxSA exists (below).

// Karmal tradition costs from KircheGetInfo (the church/cult table). The KarmalTradition SAs were
// restored from the hand snapshot as free 0-AP stubs (see the tradition-dedup incident); the PDF's
// KircheGetInfo carries the authoritative AP cost per church ([2]) — the karmal analogue of
// TraditionGetInfo[5] for magic traditions. Inject it by matching the "Tradition (X)" label to the
// church name (slug-folded, so "Chr'Ssir'Ssr-Kult" ≡ "ChrSsirSsr-Kult").
const kircheCostByName = new Map();
for (const r of parseSpeciesGetInfo(functionBody(js, 'KircheGetInfo'))) {
  const name = cleanText(String(r[0] || ''));
  if (!name || name.toLowerCase().startsWith('allgemein')) continue;
  const cost = Number(r[2]);
  if (Number.isFinite(cost) && cost > 0) kircheCostByName.set(slug(name), cost);
}
// Hand-snapshot church names that diverge from the PDF's KircheGetInfo spelling (typo, possessive,
// Kirche↔Kult, or the deity's short name ↔ its "…schamanen" tradition). Map the label's church slug to
// the KircheGetInfo church slug for the cost lookup ONLY — the snapshot names/slugs stay (they're
// reference-bearing: other karmal SAs and profession grants point at them). "Radscha-Kult" has no
// KircheGetInfo entry at all (no PDF cost source) → stays a free stub.
const KIRCHE_COST_ALIAS = {
  rondrageweihte: 'rondrakirche', hesindkirche: 'hesindekirche', ifirnskirche: 'ifirnkirche',
  graveshkirche: 'graveshkult', marbokirche: 'marbokult', tahaya: 'tahayaschamanen',
  tairachkult: 'tairachschamanen', gjalskerlaendertierkrieger: 'gjalskerschamanen',
};
let kircheCostFilled = 0;
const kircheUnmatched = [];
for (const o of saOrphans) {
  if (o.cat !== 'KarmalTradition' || o.cost > 0) continue;
  const mm = String(o.label).match(/^Tradition\s*\(([^)]+)\)/);
  if (!mm) continue;
  const key = slug(cleanText(mm[1].trim()));
  const cost = kircheCostByName.get(KIRCHE_COST_ALIAS[key] || key);
  if (cost != null) { o.cost = cost; kircheCostFilled++; } else kircheUnmatched.push(o.label);
}
console.log(`Karmal tradition costs from KircheGetInfo: ${kircheCostFilled} filled${kircheUnmatched.length ? `, unmatched: ${JSON.stringify(kircheUnmatched)}` : ''}`);

// `usedSASlugs` is the ONE global SA slug namespace, shared with the magic block below so every SA
// (profane/combat/karmal/magic/orphan) ends up unique. Reserve orphan slugs first (existing,
// referenced slugs), then preserve the curated hand slug for matched concepts (pass 1, never
// suffixed — hand slugs are unique), then mint fresh unique slugs for the rest (pass 2).
const usedSASlugs = new Set(saOrphans.map((h) => h.name));
// Selection SAs (own a `Liste` sub-selector): record `selection`, register it for SELECTION_OPTIONS, and mint
// a clean slug from the label WITHOUT the generic "(…)" param ("Adaption (Zauber)" → adaption). Done first so
// the param-baked hand-snapshot slug doesn't get re-imposed below.
for (const e of genConcepts) {
  if (!e.__sel) continue;
  e.selection = { id: e.__sel.fn, param: e.__sel.param || undefined, maxCount: maxCountFromText(String(e.r[e.m.regel] || '')) || undefined };
  usedSelectors.set(selKey(e.__sel.fn, e.__sel.param || null), { fn: e.__sel.fn, param: e.__sel.param || null });
  let n = slug(String(e.label).replace(/\s*\([^)]*\)\s*$/, '').trim()) || 'sonderfertigkeit';
  while (usedSASlugs.has(n)) n += 'x';
  usedSASlugs.add(n);
  e.name = n;
}
for (const e of genConcepts) {
  if (e.name) continue;
  const want = handSlugByLabelKey.get(labelKey(e.label));
  if (want && !usedSASlugs.has(want)) { e.name = want; usedSASlugs.add(want); }
}
for (const e of genConcepts) {
  if (e.name) continue;
  let n = slug(e.label) || 'sonderfertigkeit';
  while (usedSASlugs.has(n)) n += 'x';
  usedSASlugs.add(n);
  e.name = n;
}

// Curated corrections for SAs the PDF mislabels (rename slug + label before any index/reference resolves).
const SA_RENAME = {
  durchdringenderstahl: { name: 'durchdringenderschlag', label: 'Durchdringender Schlag' },
  // Extraction artifact: cp1252 soft-hyphen mangled "Tulamidischer Balayan-Stil" → fix slug + label.
  tulamidischrbalayanstil: { name: 'tulamidischerbalayanstil', label: 'Tulamidischer Balayan-Stil' },
};
for (const e of genConcepts) {
  const fix = SA_RENAME[e.name];
  if (fix) { usedSASlugs.delete(e.name); e.name = fix.name; e.label = fix.label; usedSASlugs.add(fix.name); }
}

// Shared prerequisite index + valid-ref set across advantages/disadvantages + every non-magic SA.
// (The magic block extends these with magic SAs further down.)
const idxSA = new Map();
for (const a of [...advEntries, ...disEntries]) if (a.label && !idxSA.has(labelKey(a.label))) idxSA.set(labelKey(a.label), a.name);
for (const a of [...advEntries, ...disEntries]) for (const f of a.__forms ?? []) { const k = labelKey(splitLevel(f).base); if (k && !idxSA.has(k)) idxSA.set(k, a.name); }
for (const e of genConcepts) if (!idxSA.has(labelKey(e.label))) idxSA.set(labelKey(e.label), e.name);
for (const h of saOrphans) if (h.label && !idxSA.has(labelKey(h.label))) idxSA.set(labelKey(h.label), h.name);
// SA gender-form aliases: register each SA's PDF male/female/divers variants so gendered/short refs in the
// "Voraussetzungen:" prose ("Segen der Waldläuferin", "Weg des Stabträgers") resolve to the catalog slug.
for (const e of genConcepts) for (const f of e.__forms ?? []) { const k = labelKey(splitLevel(f).base); if (k && !idxSA.has(k)) idxSA.set(k, e.name); }
// Catalog "(…)"-suffix aliases: a label like "Forschungsgebiet (Talent)" also answers to "Forschungsgebiet"
// (so refs that omit the disambiguator resolve — Wissensdurst, Expertenwissen, …).
for (const e of [...genConcepts, ...saOrphans]) {
  const k = labelKey(String(e.label).replace(/\s*\([^)]*\)\s*$/, ''));
  if (k && !idxSA.has(k)) idxSA.set(k, e.name);
}
const normRef = (s) => String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
const validRef = new Set(
  [...[...advEntries, ...disEntries].map((a) => a.name), ...genConcepts.map((e) => e.name), ...saOrphans.map((h) => h.name)].map(normRef),
);

// Populate SA_SLUG_SET now (before requirement parsing) so bare-ref resolution types SA refs correctly.
for (const e of [...genConcepts, ...saOrphans]) if (e.name) SA_SLUG_SET.add(e.name);

// Populate each generated concept (cost, prereqs, effect/prereq text, subcategory, tradition, …).
for (const e of genConcepts) {
  const m = e.m;
  const regel = String(e.r[m.regel] || '');
  const v = parseVoraussetzungen(regel, idxSA);
  const prereq = v.prereqs.filter((p) => p.kind === 'species' || validRef.has(normRef(p.name)));
  if (e.cat.startsWith('Karmal') && !prereq.some((p) => p.name === 'geweihter')) prereq.unshift({ name: 'geweihter', required: true });
  if (/^Magic/.test(e.cat) && !prereq.some((p) => p.name === 'zauberer')) prereq.unshift({ name: 'zauberer', required: true });
  e.prerequisite = prereq;
  if (v.text) {
    e.prerequisiteText = v.text;
    const ar = parseAttrReqs(v.text);
    if (ar.length) e.attributeRequirement = ar;
  }
  if (v.speciesRestriction && v.speciesRestriction.length) e.speciesRestriction = v.speciesRestriction;
  const { effect, combatTechniques } = parseRegel(regel);
  if (effect) e.effectText = effect;
  if (combatTechniques.length) e.combatTechniques = combatTechniques;
  if (e.cat === 'CombatStyle') { const sg = parseStyleGrants(regel); if (sg.length) e.styleGrants = sg; }
  const reqs = parseRequirements(v.text, idxSA, e.label);
  if (/^Magic/.test(e.cat) && !reqs.some((r) => r.type === 'caster')) reqs.unshift({ type: 'caster', text: 'Zauberer' });
  if (e.cat.startsWith('Karmal') && !reqs.some((r) => r.type === 'priest')) reqs.unshift({ type: 'priest', text: 'Geweihter' });
  if (reqs.length) e.requirements = reqs;
  e.cost = firstCost(e.r[m.cost]);
  const sub = (Array.isArray(e.r[m.subtyp]) ? e.r[m.subtyp] : [e.r[m.subtyp]]).filter(Boolean).map((s) => cleanText(String(s))).join(', ');
  if (sub && !/^(erweitert|allgemein)$/i.test(sub)) e.subCategory = sub;
  if (m.tradition != null) {
    const tr = (Array.isArray(e.r[m.tradition]) ? e.r[m.tradition] : [e.r[m.tradition]]).filter(Boolean).map((s) => cleanText(String(s)));
    if (tr.length) e.tradition = tr;
  }
  e.sources = buildSources(Array.isArray(e.r[m.books]) ? e.r[m.books].flat().filter((s) => typeof s === 'string') : []);
  e.url = buildUrl(e.r[m.url]);
  applyCuratedSaReq(e); // last, so curated cost/label/reqs win over the PDF-derived values above
}

// Structured requirements for the carried-over hand orphans (languages/scripts/karmal traditions).
for (const h of saOrphans) {
  const reqs = parseRequirements(h.prerequisiteText, idxSA, h.label);
  if (/^Magic/.test(h.cat) && !reqs.some((r) => r.type === 'caster')) reqs.unshift({ type: 'caster', text: 'Zauberer' });
  if (String(h.cat).startsWith('Karmal') && !reqs.some((r) => r.type === 'priest')) reqs.unshift({ type: 'priest', text: 'Geweihter' });
  if (reqs.length) h.requirements = reqs;
  applyCuratedSaReq(h);
}

// ── Magic spell styles (ZauberstilGetInfo) + liturgy styles (LiturgiestilGetInfo) — previously un-imported ──
// They are style SAs (MagicSpellStyle / KarmalLiturgyStyle); their `styleGrants` (the "Erweiterte …
// sonderfertigkeiten:" line) lets extended SFs cross-match "passende(r) Zauber-/Liturgiestil".
function buildStyleCatalog(fn, F, cat, baseReq) {
  const out = [];
  for (const r of parseSpeciesGetInfo(functionBody(js, fn))) {
    const label = cleanText(String(r[F.name] || '')).trim();
    const books = Array.isArray(r[F.books]) ? r[F.books].flat().filter((s) => typeof s === 'string') : [];
    // Skip Mythos + un-evaluated template rows whose label still carries the PDF's JS placeholder
    // (e.g. `Weg der:s Gelehrten (" + sTalent + ")`); the concrete per-talent variants are their own rows.
    if (!label || !isDsa(books) || /Mythos/i.test(label) || /sTalent|"\s*\+/.test(label)) continue;
    const regel = String(r[F.regel] || '');
    const v = parseVoraussetzungen(regel, idxSA);
    const reqs = parseRequirements(v.text, idxSA, label);
    if (baseReq && !reqs.some((x) => x.type === baseReq)) reqs.unshift({ type: baseReq, text: baseReq === 'caster' ? 'Zauberer' : 'Geweihter' });
    const grants = parseStyleGrants(regel);
    const trad = F.gruppe != null && r[F.gruppe] ? cleanText(String(r[F.gruppe])).trim() : '';
    const e = {
      label, cat,
      cost: Number(r[F.ap]) || 0,
      prerequisite: baseReq ? [{ name: baseReq === 'priest' ? 'geweihter' : 'zauberer', required: true }] : [],
      sources: buildSources(books),
      url: buildUrl(r[F.url]),
    };
    if (reqs.length) e.requirements = reqs;
    if (grants.length) e.styleGrants = grants;
    if (trad && trad !== 'allgemein') e.tradition = [trad];
    // Gender name variants (male/female) — kept so profession grants that use a gendered style name
    // ("Weg des Adligen") resolve to the gender-neutral catalog label ("Weg der:s Adligen").
    if (F.male != null || F.female != null) {
      const forms = [r[F.male], r[F.female]].filter((x) => typeof x === 'string' && x.trim()).map((s) => cleanText(String(s)).trim());
      const uniq = forms.filter((s, i) => s && s !== label && forms.indexOf(s) === i);
      if (uniq.length) e.formLabels = uniq;
    }
    const { effect } = parseRegel(regel);
    if (effect) e.effectText = effect;
    out.push(e);
  }
  return out;
}
const zauberstilSAs = buildStyleCatalog('ZauberstilGetInfo', { name: 0, ap: 6, gruppe: 7, regel: 8, books: 9, url: 10 }, 'MagicSpellStyle', 'caster');
const styleSAs = buildStyleCatalog('LiturgiestilGetInfo', { name: 0, ap: 7, gruppe: 6, regel: 8, books: 9, url: 10 }, 'KarmalLiturgyStyle', 'priest');
// Talentstil-Sonderfertigkeiten (SkillStyle): one SA per style, each with its own AP cost, prerequisites
// ("Voraussetzungen:" in the Regel), styleGrants ("Erweiterte Talentsonderfertigkeiten:") and detail URL.
// Replaces the single `talentstil` selection SA (removed via CURATED_SA_REMOVE). No caster/priest base req.
styleSAs.push(...buildStyleCatalog('TalentstilGetInfo', { name: 0, male: 2, female: 4, ap: 6, regel: 7, books: 8, url: 9 }, 'SkillStyle', null));
// Slug the karmal liturgy styles now (shared namespace) — they flow through emitSAFile below; the
// Zauberstile are slugged with the rest of the magic SAs in the magic block.
for (const e of styleSAs) {
  let n = slug(e.label) || 'liturgiestil';
  while (usedSASlugs.has(n)) n += 'x';
  usedSASlugs.add(n);
  e.name = n;
  if (!idxSA.has(labelKey(e.label))) idxSA.set(labelKey(e.label), e.name);
}

// Emit the two files. Groups are by category; a group whose category has no entries is skipped.
const PROFANE_GROUPS = [
  ['GENERAL_SPECIAL_ABILITIES', 'General'],
  ['SKILL_STYLE_SPECIAL_ABILITIES', 'SkillStyle'],
  ['SKILL_EXTENDED_SPECIAL_ABILITIES', 'SkillExtended'],
  ['FATE_POINT_SPECIAL_ABILITIES', 'FatePoint'],
  ['COMBAT_SPECIAL_ABILITIES', 'Combat'],
  ['COMBAT_STYLE_SPECIAL_ABILITIES', 'CombatStyle'],
  ['COMBAT_STYLE_EXTENDED_SPECIAL_ABILITIES', 'CombatStyleExtended'],
  ['COMMAND_SPECIAL_ABILITIES', 'Command'],
  ['BRAWLING_SPECIAL_ABILITIES', 'Brawling'],
  ['PACT_SPECIAL_ABILITIES', 'MagicPact'],
  ['VAMPIRIC_SPECIAL_ABILITIES', 'MagicVampiric'],
  ['LYCANTHROPIC_SPECIAL_ABILITIES', 'MagicLycanthropic'],
  ['SIKARYAN_SPECIAL_ABILITIES', 'MagicSikaryanRaub'],
  ['LANGUAGE_SPECIAL_ABILITIES', 'Language'],
  ['SCRIPT_SPECIAL_ABILITIES', 'Script'],
];
const KARMAL_GROUPS = [
  ['KARMAL_GENERAL_SPECIAL_ABILITIES', 'KarmalGeneral'],
  ['KARMAL_TRADITION_SPECIAL_ABILITIES', 'KarmalTradition'],
  ['KARMAL_LITURGY_STYLE_SPECIAL_ABILITIES', 'KarmalLiturgyStyle'],
  ['KARMAL_LITURGY_STYLE_EXTENDED_SPECIAL_ABILITIES', 'KarmalLiturgyStyleExtended'],
  ['KARMAL_SERMON_SPECIAL_ABILITIES', 'KarmalSermon'],
  ['KARMAL_VISION_SPECIAL_ABILITIES', 'KarmalVision'],
  ['KARMAL_CEREMONIAL_OBJECT_SPECIAL_ABILITIES', 'KarmalCeremonialObject'],
];

function emitSAFile(groups, source, fnDesc, aggregateName) {
  const pool = [...genConcepts, ...saOrphans, ...styleSAs].filter((e) => !CURATED_SA_REMOVE.has(e.name) && groups.some(([, cat]) => cat === e.cat));
  const used = groups.map(([constName, cat]) => {
    const list = pool.filter((e) => e.cat === cat).sort((a, b) => a.label.localeCompare(b.label, 'de'));
    return { constName, cat, list };
  }).filter((g) => g.list.length);
  const out =
    `import { SpecialAbility, SpecialAbilityCategory } from '../models/special-ability.model';\n\n` +
    `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (${fnDesc}). Do not edit by hand. ───\n` +
    `// DSA Aventurien only (Mythos/Schwarze Katze excluded). Leveled SAs collapsed (maxLvl). Cost, subcategory,\n` +
    `// effect text and prerequisites parsed from the PDF "Regel:"/"Voraussetzungen:" prose. Entries with no PDF\n` +
    `// source (languages, scripts, karmal traditions, …) are carried over verbatim from the hand snapshot.\n\n` +
    used.map((g) => `export const ${g.constName}: SpecialAbility[] = [\n${g.list.map(serSA).join('\n')}\n];\n`).join('\n') +
    `\nexport const ${aggregateName}: SpecialAbility[] = [\n` +
    used.map((g) => `  ...${g.constName},`).join('\n') +
    `\n];\n`;
  writeFileSync(resolve(CONST_DIR, source), out, 'utf8');
  const counts = Object.fromEntries(used.map((g) => [g.cat, g.list.length]));
  console.log(`${fnDesc} → ${source}: ${JSON.stringify(counts)}, total ${used.reduce((s, g) => s + g.list.length, 0)}`);
}

emitSAFile(PROFANE_GROUPS, 'special-ability-profane.const.ts', 'SFAllgGetInfo + SFKampfGetInfo', 'ALL_PROFANE_SPECIAL_ABILITIES');
emitSAFile(KARMAL_GROUPS, 'special-ability-karmal.const.ts', 'SFKarmGetInfo', 'ALL_KARMAL_SPECIAL_ABILITIES');

// ── Magic special abilities (SFMagGetInfo) + tradition SAs (TraditionGetInfo) ───
// Fully regenerates special-ability-magic.const.ts. Category from Typ[6]/Subtyp[7]; leveled labels
// (".. I/II/..") collapse to one entry with maxLvl; prerequisites parsed from the Regel[5]
// "Voraussetzungen:" text (every magic SA gets the Zauberer/"magic" prereq); concrete attribute
// minima (e.g. "KL 15") recovered into attributeRequirement; Mythos/Schwarze Katze (CtC/SPC) dropped.

// Concrete attribute minima from the Voraussetzungen prose → AttributeRequirement[].
function parseAttrReqs(text) {
  const out = [];
  const seen = new Set();
  const re = /\b(MU|KL|IN|CH|FF|GE|KO|KK)\s+(\d+)\b/g;
  let m;
  while ((m = re.exec(String(text || ''))) !== null) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ attribute: m[1], minValue: Number(m[2]) });
  }
  return out;
}

// SFMag enum member per Typ/Subtyp.
function sfMagCategory(typ, subtypArr) {
  const sub = (Array.isArray(subtypArr) ? subtypArr : [subtypArr]).join('|');
  if (typ === 'Artefakt') return 'MagicTraditionArtifact';
  if (typ === 'Zauberzeichen') return 'MagicSign';
  if (/erweiterte Fertigkeiten/i.test(sub)) return 'MagicSpellExtended';
  return 'MagicGeneral';
}

// Parse + filter + categorize SFMag records into level-collapsed concepts.
const sfMagSelectors = buildSelectorMap('SFMagGetInfo', 4); // Liste sub-selection (ZauberArray, MerkmalArray, …)
const sfRaw = [];
for (const r of parseGetInfo(functionBody(js, 'SFMagGetInfo'))) {
  const books = Array.isArray(r[13]) ? r[13].filter((s) => typeof s === 'string') : [];
  if (!isDsa(books)) continue; // drop Mythos-only entries
  sfRaw.push({ label: cleanText(String(r[0])), cat: sfMagCategory(String(r[6] || ''), r[7]), r });
}
// Collapse leveled entries (same category + base label) → one concept carrying level-I's record.
const sfByKey = new Map();
for (const rec of sfRaw) {
  const { base, level } = splitLevel(rec.label);
  const key = `${rec.cat}|${labelKey(base)}`;
  if (!sfByKey.has(key)) sfByKey.set(key, []);
  sfByKey.get(key).push({ ...rec, base: cleanText(base), level });
}
const sfConcepts = [];
for (const members of sfByKey.values()) {
  const levels = members.map((m) => m.level).filter((x) => x != null);
  const leveled = levels.length > 0;
  const rep = members.slice().sort((a, b) => (a.level || 0) - (b.level || 0))[0];
  // PDF name variants (divers/male/female) → gender aliases ("Bannschwert des Magus" → "… der:s Maga:us").
  const forms = [rep.r[0], rep.r[1], rep.r[2]].filter((x) => typeof x === 'string' && x.trim());
  const __sel = sfMagSelectors.get(labelKey(cleanText(String(rep.r[0]))));
  sfConcepts.push({ label: leveled ? rep.base : rep.label, cat: rep.cat, r: rep.r, maxLvl: leveled ? Math.max(...levels) : undefined, __forms: forms, __sel });
}

// Tradition SAs from TraditionGetInfo (numeric fields → line-based parser).
const tradEntries = [];
for (const r of parseSpeciesGetInfo(functionBody(js, 'TraditionGetInfo'))) {
  const code = String(r[0] || '');
  if (!code || code.toLowerCase() === 'allgemein' || !(Number(r[5]) > 0)) continue;
  const books = Array.isArray(r[9]) ? r[9].filter((s) => typeof s === 'string') : [];
  if (!isDsa(books)) continue;
  const name = cleanText(code);
  tradEntries.push({
    label: `Tradition (${name})`,
    cat: 'MagicTradition',
    cost: Number(r[5]) || 0,
    prerequisite: [{ name: 'zauberer', required: true }],
    tradition: [name],
    sources: buildSources(books),
    url: buildUrl(r[10]),
  });
}

// Assign unique slugs across every magic SA, then build the labelKey→slug index (advantages +
// disadvantages + these SAs) so "Sonderfertigkeit X" / internal chains resolve in parseVoraussetzungen.
const magicSA = [...sfConcepts, ...tradEntries, ...zauberstilSAs];
for (const e of magicSA) {
  // Selection SAs: record `selection`, register it, and slug from the label without the generic "(…)" param.
  if (e.__sel) {
    e.selection = { id: e.__sel.fn, param: e.__sel.param || undefined, maxCount: maxCountFromText(String(e.r?.[5] || '')) || undefined };
    usedSelectors.set(selKey(e.__sel.fn, e.__sel.param || null), { fn: e.__sel.fn, param: e.__sel.param || null });
  }
  let n = slug(String(e.label).replace(e.__sel ? /\s*\([^)]*\)\s*$/ : /(?!)/, '').trim()) || 'sonderfertigkeit';
  while (usedSASlugs.has(n)) n += 'x'; // shared global SA namespace (non-magic reserved first)
  usedSASlugs.add(n);
  e.name = n;
}
// Extend the shared prerequisite index + valid-ref set (built with the non-magic SAs above) with the
// magic SAs, so "Sonderfertigkeit X" chains across all four SA domains resolve. Refs that still don't
// resolve are dropped — the verbatim condition stays in prerequisiteText.
for (const e of magicSA) if (!idxSA.has(labelKey(e.label))) idxSA.set(labelKey(e.label), e.name);
// Gender-form + "(…)"-suffix aliases for magic SAs (as done for the non-magic SAs above), so gendered/short
// refs resolve: "Bannschwert des Magus" → "Bannschwert der:s Maga:us", "Bindung der Magierkugel" → "… (aktivieren)".
for (const e of magicSA) for (const f of e.__forms ?? []) { const k = labelKey(splitLevel(f).base); if (k && !idxSA.has(k)) idxSA.set(k, e.name); }
for (const e of magicSA) { const k = labelKey(String(e.label).replace(/\s*\([^)]*\)\s*$/, '')); if (k && !idxSA.has(k)) idxSA.set(k, e.name); }
for (const e of magicSA) validRef.add(normRef(e.name));
// Extend SA_SLUG_SET with magic + style SAs before parsing magic-SA requirements (correct bare-ref typing).
for (const e of [...magicSA, ...styleSAs]) if (e.name) SA_SLUG_SET.add(e.name);

// Build prerequisites / attribute requirements / narrative text for each SFMag concept.
for (const e of sfConcepts) {
  const regel = String(e.r[5] || '');
  const v = parseVoraussetzungen(regel, idxSA);
  const prereq = v.prereqs.filter((p) => p.kind === 'species' || validRef.has(normRef(p.name)));
  if (!prereq.some((p) => p.name === 'zauberer')) prereq.unshift({ name: 'zauberer', required: true });
  e.prerequisite = prereq;
  if (v.text) {
    e.prerequisiteText = v.text;
    const ar = parseAttrReqs(v.text);
    if (ar.length) e.attributeRequirement = ar;
  }
  if (v.speciesRestriction && v.speciesRestriction.length) e.speciesRestriction = v.speciesRestriction;
  const reqs = parseRequirements(v.text, idxSA, e.label);
  if (!reqs.some((r) => r.type === 'caster')) reqs.unshift({ type: 'caster', text: 'Zauberer' });
  if (reqs.length) e.requirements = reqs;
  // BasisKosten[3]: plain "25" → flat cost; "X/Y" (Lieblingszauber "3/12", Adaption "5/20", Bindung
  // "8/40") → the cost VARIES by the chosen option's Steigerungsfaktor (A/B/C/… = X, 2X, 3X, …), so store
  // the per-point base X (firstCost) + the costBySteigerungsfaktor flag (effective cost = X × SF-index of
  // the picked option, computed in specialAbilityCost). "10 (2 pAsP)" / "3+" → firstCost takes the AP part.
  // Set BEFORE applyCuratedSaReq so a curated `cost` still wins.
  {
    const bk = String(e.r[3] ?? '').trim();
    e.cost = firstCost(bk);
    if (/^\d+\s*\/\s*\d+/.test(bk)) e.costBySteigerungsfaktor = true;
    // Tradition-artifact binding "10 (2 pAsP)": the "(N pAsP)" is a PERMANENT AsP loss when the artifact
    // is activated — capture it so the derived-stats engine can lower max AsP (and count the buy-back AP).
    const pasp = bk.match(/(\d+)\s*pAsP/i);
    if (pasp) e.permanentAspCost = Number(pasp[1]);
  }
  applyCuratedSaReq(e);
  const sub = (Array.isArray(e.r[7]) ? e.r[7] : [e.r[7]]).filter(Boolean).map((s) => cleanText(String(s))).join(', ');
  if (sub) e.subCategory = sub;
  const grp = (Array.isArray(e.r[8]) ? e.r[8] : [e.r[8]]).filter(Boolean).map((s) => cleanText(String(s)));
  if (grp.length && !(grp.length === 1 && grp[0] === 'allgemein')) e.tradition = grp;
  const merk = cleanText(String(e.r[9] || '')).trim();
  if (merk) e.merkmal = merk;
  e.sources = buildSources(Array.isArray(e.r[13]) ? e.r[13].filter((s) => typeof s === 'string') : []);
  e.url = buildUrl(e.r[15]);
}

/**
 * Free-text detail label of a selection SA, or null. The PDF encodes it in the part of the selection
 * argument AFTER the pipe, introduced by a colon: "alle|: Gebiet" = choose from `alle`, then name a
 * "Gebiet". Deliberately narrow:
 *   - the colon is required, so the filter argument "Zauber|Ritual" (= spells OR rituals) is skipped;
 *   - a comma is rejected, because "Wissen|: Gebiet 1, Gebiet 2" (Fachwissen) wants TWO detail
 *     fields and the runtime carries only one — better none than a half-applied field.
 * DSA labels contain German letters and spaces, hence the explicit character class.
 */
// The PDF abbreviates inside the selection argument; spell the field out for the UI label.
const FREE_TEXT_LABEL = { Gebiet: 'Anwendungsgebiet' };
function saFreeText(selection) {
  const m = String(selection?.param ?? '').match(/\|\s*:\s*([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß ]*)$/);
  if (!m) return null;
  const raw = m[1].trim();
  return FREE_TEXT_LABEL[raw] ?? raw;
}

function serSA(e) {
  const L = ['  {', `    name: ${JSON.stringify(e.name)},`, `    label: ${JSON.stringify(e.label)},`, `    cost: ${e.cost},`, `    category: SpecialAbilityCategory.${e.cat},`];
  if (e.costBySteigerungsfaktor) L.push(`    costBySteigerungsfaktor: true,`); // cost = cost × SF-index of the chosen option
  if (e.permanentAspCost) L.push(`    permanentAspCost: ${e.permanentAspCost},`); // permanent AsP lost when this artifact binding is activated
  if (e.lvl != null) L.push(`    lvl: ${e.lvl},`);
  if (e.maxLvl != null) L.push(`    maxLvl: ${e.maxLvl},`);
  if (saCostLevelsNeeded(e)) L.push(`    costLevels: ${JSON.stringify(e.costLevels)},`);
  if (e.prerequisiteText) L.push(`    prerequisiteText: ${JSON.stringify(e.prerequisiteText)},`);
  { // drop self-references (own previous level / take-once forbidden self-ref) — see withoutSelfRefs.
    const _rq = withoutSelfRefs(e);
    if (_rq.length) L.push(`    requirements: ${serRequirements(_rq)},`);
  }
  if (e.effectText) L.push(`    effectText: ${JSON.stringify(e.effectText)},`);
  if (e.styleGrants && e.styleGrants.length) L.push(`    styleGrants: ${JSON.stringify(e.styleGrants)},`);
  if (e.formLabels && e.formLabels.length) L.push(`    formLabels: ${JSON.stringify(e.formLabels)},`);
  if (e.combatTechniques && e.combatTechniques.length) L.push(`    combatTechniques: ${JSON.stringify(e.combatTechniques)},`);
  if (e.subCategory) L.push(`    subCategory: ${JSON.stringify(e.subCategory)},`);
  if (e.tradition && e.tradition.length) L.push(`    tradition: ${JSON.stringify(e.tradition)},`);
  if (e.merkmal) L.push(`    merkmal: ${JSON.stringify(e.merkmal)},`);
  { // A selection param "…|: <Label>" means: pick from the list AND name a detail inside it
    // (Fertigkeitsspezialisierung → "alle|: Gebiet" = a talent plus its Anwendungsgebiet).
    const ft = saFreeText(e.selection);
    if (ft) L.push(`    freeText: ${JSON.stringify(ft)},`);
  }
  if (e.selection) L.push(`    selection: ${serSelection(e.selection)},`);
  if (e.speciesRestriction && e.speciesRestriction.length) L.push(`    speciesRestriction: ${JSON.stringify(e.speciesRestriction)},`);
  if (e.sources && e.sources.length) L.push(`    sources: ${JSON.stringify(e.sources)},`);
  if (e.url) L.push(`    url: ${JSON.stringify(e.url)},`);
  L.push('  },');
  return L.join('\n');
}

const sfByCat = (cat) => magicSA.filter((e) => e.cat === cat && !CURATED_SA_REMOVE.has(e.name)).sort((a, b) => a.label.localeCompare(b.label, 'de'));
const SA_GROUPS = [
  ['MAGIC_GENERAL_SPECIAL_ABILITIES', 'MagicGeneral'],
  ['MAGIC_SPELL_STYLE_SPECIAL_ABILITIES', 'MagicSpellStyle'],
  ['MAGIC_SPELL_EXTENDED_SPECIAL_ABILITIES', 'MagicSpellExtended'],
  ['MAGIC_TRADITION_ARTIFACT_SPECIAL_ABILITIES', 'MagicTraditionArtifact'],
  ['MAGIC_SIGN_SPECIAL_ABILITIES', 'MagicSign'],
  ['MAGIC_TRADITION_SPECIAL_ABILITIES', 'MagicTradition'],
];
// Canonicalize magic styleGrants to the granted SFs' gender-neutral labels so the runtime style-validation
// matches. The PDF "Erweiterte Zaubersonderfertigkeiten:" line lists MASCULINE forms ("Brillanter
// Telekinetiker"), but the extended SFs are labelled gender-neutral ("Brillante:r Telekinetiker:in") →
// normName never matched and the `style` requirement false-flagged. Resolve each grant via idxSA (which
// indexes gender form-labels) → slug → the SF's canonical label; non-SF grants that don't resolve stay as-is.
{
  const labelBySlug = new Map();
  for (const e of [...genConcepts, ...saOrphans, ...styleSAs, ...magicSA]) if (e.name && e.label && !labelBySlug.has(e.name)) labelBySlug.set(e.name, e.label);
  for (const e of magicSA) {
    if (!e.styleGrants) continue;
    const seen = new Set();
    e.styleGrants = e.styleGrants.map((g) => { const slug = idxSA.get(labelKey(g)); return (slug && labelBySlug.get(slug)) || g; }).filter((g) => !seen.has(g) && seen.add(g));
  }
}

const saCounts = {};
const saOut =
  `import { SpecialAbility, SpecialAbilityCategory } from '../models/special-ability.model';\n\n` +
  `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (SFMagGetInfo + TraditionGetInfo). Do not edit by hand. ───\n` +
  `// DSA Aventurien only (Mythos/Schwarze Katze excluded). Leveled SAs collapsed (maxLvl). Prerequisites and\n` +
  `// attribute minima parsed from the PDF "Voraussetzungen:" text; verbatim text kept in prerequisiteText.\n\n` +
  SA_GROUPS.map(([constName, cat]) => {
    const list = sfByCat(cat);
    saCounts[cat] = list.length;
    return `export const ${constName}: SpecialAbility[] = [\n${list.map(serSA).join('\n')}\n];\n`;
  }).join('\n') +
  `\nexport const ALL_MAGIC_SPECIAL_ABILITIES: SpecialAbility[] = [\n` +
  SA_GROUPS.map(([constName]) => `  ...${constName},`).join('\n') +
  `\n];\n`;
writeFileSync(resolve(CONST_DIR, 'special-ability-magic.const.ts'), saOut, 'utf8');
console.log(`Magic SAs → ${JSON.stringify(saCounts)}, total ${magicSA.length}. Wrote special-ability-magic.const.ts`);

// ── Advantages: re-resolve narrative requirements with the full SA index, then write the file ─────
// Advantage requirements were first parsed before the SA catalogs existed, so "Sonderfertigkeit X"
// references to special abilities (e.g. "Tradition (Intuitive Zauberer)") fell back to narrative.
// Now that idxSA knows every SA slug, re-classify the leftover narrative fragments.
for (const e of [...genConcepts, ...saOrphans, ...styleSAs, ...magicSA]) if (e.name) SA_SLUG_SET.add(e.name);
let advReqsResolved = 0;
for (const e of [...advEntries, ...disEntries]) {
  if (!e.requirements) continue;
  e.requirements = e.requirements.map((r) => {
    if (r.type !== 'narrative' || !r.text) return r;
    const re = classifyFragment(r.text, idxSA, e.label);
    if (re && re.type !== 'narrative') {
      if (r.group != null) re.group = r.group;
      if (r.atLevel != null) re.atLevel = r.atLevel;
      advReqsResolved++;
      return re;
    }
    return r;
  });
}
// Sense advantage/disadvantage: cost varies PER SENSE, and oppositely (Herausragend +12/+12/+6/+2,
// Eingeschränkt −15/−10/−6/−2), so they can't share one costed option list. Point each at its own
// param'd SinnArray key; the costed option lists are curated in SELECTION_OPTIONS below.
for (const e of [...advEntries, ...disEntries]) {
  if (e.selection?.id === 'SinnArray') e.selection = { ...e.selection, param: e.name === 'eingeschrankterSinn' ? 'eingeschrankt' : 'herausragend' };
}
// "Kontakt: (Name)" — the trailing "(Name)" is a free-text FIELD the player fills in, not part of the
// entry's name. Strip it from the display label and flag the entry so the UI offers an input. Runs
// here, AFTER slugs are minted, so the established `kontaktname` slug stays valid for saved characters.
for (const e of [...advEntries, ...disEntries]) {
  const m = String(e.label || '').match(/^(.*?):\s*\((Name)\)\s*$/i);
  if (m) {
    e.label = m[1].trim();
    e.freeText = m[2];
  }
}

const advOut =
  `import { Advantage } from '../models/advantage.model';\n\n` +
  `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (VorteilGetInfo/NachteilGetInfo). ───\n` +
  `// Gender-neutral labels; levels collapsed; DSA-Aventurien only (Mythos excluded).\n` +
  `// Slugs/costs come from the curated snapshot tools/dsa-data/advantage-hand.const.txt (matched by\n` +
  `// normalized label); prerequisites are re-derived authoritatively from the PDF "Voraussetzung(en):"\n` +
  `// text (verbatim kept in prerequisiteText). Selections carry the call argument as \`param\`.\n\n` +
  `export const ADVANTAGE: Advantage[] = [\n${advEntries.map(serEntry).join('\n')}\n];\n\n` +
  `export const DISADVANTAGE: Advantage[] = [\n${disEntries.map(serEntry).join('\n')}\n];\n`;
writeFileSync(ADV_PATH, advOut, 'utf8');
const unmatched = hand.all.filter((h) => !h.__matched).length;
console.log(`Advantages: ${advEntries.length}, Disadvantages: ${disEntries.length} (unmatched hand kept: ${unmatched}, prereqs parsed: ${prereqFilled}, SA-refs re-resolved: ${advReqsResolved}). Wrote advantage.const.ts`);

// ── Shared selection-options registry (advantage AND special-ability selections, fully resolved) ──
// Keyed by the composite `fn` or `fn:param`, matching `param ? `${id}:${param}` : id`. Built here (after the
// SA blocks have registered their `Liste` sub-selectors in `usedSelectors`) so it covers both domains.
const SELECTION_OPTIONS = {};
let optTotal = 0;
for (const key of [...usedSelectors.keys()].sort()) {
  const { fn, param } = usedSelectors.get(key);
  const opts = resolveSelectionOptions(fn, param);
  if (opts.length) { SELECTION_OPTIONS[key] = opts; optTotal += opts.length; }
}
// Per-sense costed option lists for the two sense abilities (the PDF AP-Wert lists them per sense; the
// shared uncosted SinnArray can't, and the two need OPPOSITE costs). `optionCost` reads `option.cost`.
SELECTION_OPTIONS['SinnArray:herausragend'] = [
  { name: 'sicht', label: 'Sicht', cost: 12 },
  { name: 'gehoer', label: 'Gehör', cost: 12 },
  { name: 'geruch', label: 'Geruch', cost: 6 },
  { name: 'geschmack', label: 'Geschmack', cost: 6 },
  { name: 'geruchgeschmack', label: 'Geruch & Geschmack', cost: 6 },
  { name: 'tastsinn', label: 'Tastsinn', cost: 2 },
];
SELECTION_OPTIONS['SinnArray:eingeschrankt'] = [
  { name: 'sicht', label: 'Sicht', cost: -15 },
  { name: 'gehoer', label: 'Gehör', cost: -10 },
  { name: 'geruch', label: 'Geruch', cost: -6 },
  { name: 'geschmack', label: 'Geschmack', cost: -6 },
  { name: 'geruchgeschmack', label: 'Geruch & Geschmack', cost: -6 },
  { name: 'tastsinn', label: 'Tastsinn', cost: -2 },
];

// Curated option lists the PDF selection functions don't expose. VorstellungArray (Beeindruckende
// Vorstellung) is a fixed set of four performance talents; option `name` = talent slug so the
// `selectedTalent` prereq can match the chosen talent's FW.
if (!SELECTION_OPTIONS['VorstellungArray']?.length) {
  SELECTION_OPTIONS['VorstellungArray'] = [
    { name: 'gaukeleien', label: 'Gaukeleien' },
    { name: 'musizieren', label: 'Musizieren' },
    { name: 'singen', label: 'Singen' },
    { name: 'tanzen', label: 'Tanzen' },
  ];
  optTotal += 4;
}
// SpeziesArray (Anatomie (Spezies)) — the PDF selection fn exposes only codes (S36…), so use the
// hand-curated Aventurien species labels (mirrors species.const.ts).
if (!SELECTION_OPTIONS['SpeziesArray']?.length) {
  SELECTION_OPTIONS['SpeziesArray'] = ['Mensch', 'Elf', 'Halbelf', 'Zwerg', 'Achaz', 'Goblin', 'Halbork', 'Holberker', 'Ork', 'Nachtalb'].map((l) => ({ name: slug(l), label: l }));
  optTotal += SELECTION_OPTIONS['SpeziesArray'].length;
}
// SpzKulArray (Liebesspiele fremder Völker — Spezies/Kultur): the finite species + culture catalog.
if (!SELECTION_OPTIONS['SpzKulArray']?.length) {
  const seen = new Set();
  SELECTION_OPTIONS['SpzKulArray'] = [...(SELECTION_OPTIONS['SpeziesArray'] || []), ...CULTURE_OPTIONS].filter((o) => o.name && !seen.has(o.name) && seen.add(o.name));
  optTotal += SELECTION_OPTIONS['SpzKulArray'].length;
}
writeFileSync(resolve(ROOT, 'tools/dsa-data/selection-options.json'), JSON.stringify(SELECTION_OPTIONS, null, 2), 'utf8');
const selOut =
  `import { SelectionOption } from '../models/advantage.model';\n\n` +
  `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs. Fully-resolved sub-option lists for every\n` +
  `// advantage/disadvantage AND special-ability selection, keyed by the composite \`id\` or \`id:param\`.\n` +
  `// Per-option cost/requires populated where present; Mythos (CtC/SPC) sub-options excluded.\n` +
  `// Look up via \`sel.param ? \\\`\${sel.id}:\${sel.param}\\\` : sel.id\`. ───\n\n` +
  `export const SELECTION_OPTIONS: Record<string, SelectionOption[]> = ${JSON.stringify(SELECTION_OPTIONS, null, 2)};\n`;
writeFileSync(resolve(CONST_DIR, 'selection-options.const.ts'), selOut, 'utf8');
console.log(`Selection registry: ${Object.keys(SELECTION_OPTIONS).length} sources, ${optTotal} options. Wrote selection-options.const.ts`);

// ── Derived-stat & energy modifiers + energy base (the PDF's *Modifikator / Grundwert formulas) ──
// The fillable sheet computes every derived value precisely. We mirror the AUTHORITATIVE modifier values
// here as a data-driven table the runtime engine consumes (no hardcoded advantage names in the app).
// Each `XxxModifikator` is a `switch` over the character's advantage/SF names → an inc/dec on a counter.
// Leveled ladders ("… I".."… VII" → +1..+7) become perLevel; single/fall-through cases become flat.
// Energy base (AEGrundwert/KEGrundwert): caster base = 20 + round(Faktor × Leiteigenschaft); Faktor per
// tradition from TraditionGetInfo[8].

// slug lookup = advantages/disadvantages + every SA (so SA-based AW/INI bonuses resolve too).
const modSlugByLabelKey = new Map();
for (const a of [...advEntries, ...disEntries]) if (a.label && !modSlugByLabelKey.has(labelKey(a.label))) modSlugByLabelKey.set(labelKey(a.label), a.name);
for (const e of [...genConcepts, ...magicSA, ...saOrphans]) if (e.label && !modSlugByLabelKey.has(labelKey(e.label))) modSlugByLabelKey.set(labelKey(e.label), e.name);

const ROMAN_SUFFIX = /\s+(vii|vi|v|iv|iii|ii|i)$/;
const romanLvl = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };

const deltaOf = (seg) => {
  let mm;
  if ((mm = seg.match(/\b\w+\s*\+=\s*(\d+)/))) return Number(mm[1]);
  if ((mm = seg.match(/\b\w+\s*-=\s*(\d+)/))) return -Number(mm[1]);
  if (/\b\w+\+\+/.test(seg)) return 1;
  if (/\b\w+--/.test(seg)) return -1;
  return null;
};
const isPlaceholderMod = (name) => /\(stil\)|talentstil|: \(/.test(name);
// One Wundschwelle string ("glÃ¤sern") is UTF-8-in-latin1 mojibake; repair the umlaut sequences.
const demojibake = (s) => String(s).replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü');

// Parse a `XxxModifikator`/`Wundschwelle` body → [{ name, delta }]. Handles both `switch/case` ladders
// (with C-style fall-through) and `if (x == "name") { … += N }` style (used by Wundschwelle).
function parseStatModFn(fnName) {
  const body = functionBody(js, fnName);
  const caseRe = /case\s*\(?\s*"([^"]+)"\s*\)?\s*:/g;
  const positions = [];
  let m;
  while ((m = caseRe.exec(body)) !== null) positions.push({ name: cleanText(demojibake(m[1])).toLowerCase(), start: caseRe.lastIndex });
  const raw = positions.map((p, i) => {
    const seg = (body.slice(p.start, i + 1 < positions.length ? positions[i + 1].start : p.start + 400)).split(/break\s*;/)[0];
    return { name: p.name, delta: deltaOf(seg) };
  });
  // resolve fall-through: a case with no body inherits the next case's delta
  for (let i = raw.length - 1; i >= 0; i--) if (raw[i].delta == null) raw[i].delta = raw[i + 1] ? raw[i + 1].delta : null;
  // if-based comparisons: `… == "name" …{ counter += N }`
  const seen = new Set(raw.map((r) => r.name));
  const ifRe = /==\s*"([^"]+)"[\s\S]{0,120}?(?:\b\w+\s*[+\-]=\s*\d+|\b\w+\+\+|\b\w+--)/g;
  let mm;
  while ((mm = ifRe.exec(body)) !== null) {
    const name = cleanText(demojibake(mm[1])).toLowerCase();
    if (seen.has(name)) continue;
    const delta = deltaOf(mm[0]);
    if (delta != null) { raw.push({ name, delta }); seen.add(name); }
  }
  return raw.filter((r) => r.delta != null && !isPlaceholderMod(r.name));
}

const STAT_MOD_FNS = [
  ['LEModifikator', 'lifePoints'], ['AEModifikator', 'astralPoints'], ['KEModifikator', 'karmaPoints'],
  ['SKModifikator', 'spirit'], ['ZKModifikator', 'toughness'], ['AWModifikator', 'dodge'],
  ['INIModifikator', 'initiative'], ['GSModifikator', 'movement'], ['Wundschwelle', 'woundThreshold'],
  ['SchiPModifikator', 'fatePoints'],
];

// base slug → { stat → { perLevel? | flat? } }
const modBySlug = new Map();
let modUnresolved = 0;
for (const [fn, stat] of STAT_MOD_FNS) {
  // group parsed cases by resolved advantage/SA slug
  const groups = new Map();
  for (const { name, delta } of parseStatModFn(fn)) {
    const rm = name.match(ROMAN_SUFFIX);
    const base = rm ? name.replace(ROMAN_SUFFIX, '').trim() : name;
    const slugName = modSlugByLabelKey.get(labelKey(base));
    if (!slugName) { modUnresolved++; continue; }
    if (!groups.has(slugName)) groups.set(slugName, []);
    groups.get(slugName).push({ level: rm ? romanLvl[rm[1]] : null, delta });
  }
  for (const [slugName, entries] of groups) {
    const leveled = entries.filter((e) => e.level != null);
    let mod;
    if (leveled.length >= 2 && leveled.every((e) => Math.abs(e.delta) === e.level)) {
      mod = { stat, perLevel: Math.sign(leveled[0].delta) }; // delta scales with the advantage's level
    } else {
      mod = { stat, flat: entries[0].delta };
    }
    if (!modBySlug.has(slugName)) modBySlug.set(slugName, []);
    // keep one entry per (slug,stat)
    if (!modBySlug.get(slugName).some((x) => x.stat === stat)) modBySlug.get(slugName).push(mod);
  }
}

// Energy base: per-tradition Faktor (caster type) + Leiteigenschaft, from TraditionGetInfo.
const traditionFactor = {};
for (const r of parseSpeciesGetInfo(functionBody(js, 'TraditionGetInfo'))) {
  const name = cleanText(String(r[0] || '')).trim();
  if (!name || name.toLowerCase() === 'allgemein') continue;
  const factor = Number(r[8]);
  const leit = cleanText(String(r[7] || '')).trim();
  if (Number.isFinite(factor) && factor > 0) traditionFactor[name] = leit ? { factor, leit } : { factor };
}

const serMod = (arr) => '[' + arr.map((m) => `{ stat: ${JSON.stringify(m.stat)}${m.perLevel != null ? `, perLevel: ${m.perLevel}` : ''}${m.flat != null ? `, flat: ${m.flat}` : ''} }`).join(', ') + ']';
const modEntries = [...modBySlug.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const smOut =
  `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (PDF *Modifikator / *Grundwert formulas). Do not edit by hand. ───\n` +
  `// Maps an advantage/special-ability slug → its effect on derived stats. perLevel scales with the entry's level\n` +
  `// (e.g. Hohe Lebenskraft III → +3); flat applies once. Energy base = 20 + round(factor × Leiteigenschaft).\n\n` +
  `export type DerivedStatKey =\n  | 'lifePoints' | 'astralPoints' | 'karmaPoints' | 'spirit' | 'toughness'\n  | 'dodge' | 'initiative' | 'movement' | 'woundThreshold' | 'fatePoints';\n\n` +
  `export interface StatModifier { stat: DerivedStatKey; perLevel?: number; flat?: number; }\n\n` +
  `export const STAT_MODIFIERS: Record<string, StatModifier[]> = {\n` +
  modEntries.map(([k, v]) => `  ${JSON.stringify(k)}: ${serMod(v)},`).join('\n') +
  `\n};\n\n` +
  `/** Caster energy base = CASTER_ENERGY_BASE + round(factor × Leiteigenschaft). Factor per tradition (default 1). */\n` +
  `export const CASTER_ENERGY_BASE = 20;\n\n` +
  `export const TRADITION_ENERGY_FACTOR: Record<string, { factor: number; leit?: string }> = ${JSON.stringify(traditionFactor, null, 2)
    .replace(/"([A-Za-z][\w]*)":/g, '$1:')};\n`;
writeFileSync(resolve(CONST_DIR, 'stat-modifiers.const.ts'), smOut, 'utf8');
console.log(`Stat modifiers → ${modEntries.length} slugs (unresolved cases: ${modUnresolved}), ${Object.keys(traditionFactor).length} tradition factors. Wrote stat-modifiers.const.ts`);

// ── Data catalogs from the PDF (talents, combat techniques, cantrips, blessings, talent styles) ──
// Mirror the catalog the app hand-maintained, but PDF-authoritative + richer (talent Anwendungsgebiete,
// combat-technique Leiteigenschaft). Existing name/slug preserved via catalog-hand-snapshot.json so
// skills / profession grants / TALENT_FACTOR / CT_FACTOR / save data / data-integrity.spec.ts resolve.
const CATALOG_SNAPSHOT = JSON.parse(readFileSync(resolve(ROOT, 'tools/dsa-data/catalog-hand-snapshot.json'), 'utf8'));
const preservedName = (group, label, fallback) => CATALOG_SNAPSHOT[group]?.[labelKey(label)] ?? fallback;
const GEN_BANNER = (src) => `// ─── AUTO-GENERATED by tools/extract-pdf-data.mjs (${src}). Do not edit by hand. ───\n// DSA Aventurien only (Mythos/Schwarze Katze excluded). Existing names/slugs preserved from the hand snapshot.\n\n`;

// ---- Talents (TalentGetInfo) ----
const TALENT_CAT = { 'Körper': 'Physical', 'Gesellschaft': 'Social', 'Natur': 'Nature', 'Wissen': 'Knowledge', 'Handwerk': 'Crafts' };
const talents = [];
for (const r of parseGetInfo(functionBody(js, 'TalentGetInfo'))) {
  const books = Array.isArray(r[8]) ? r[8].flat().filter((s) => typeof s === 'string') : [];
  if (!isDsa(books)) continue;
  const label = cleanText(String(r[2] || '')).trim();
  const cat = TALENT_CAT[cleanText(String(r[7] || '')).trim()];
  if (!label || !cat || /Mythos/i.test(label)) continue;
  const check = [r[3], r[4], r[5]].map((x) => String(x || '').trim());
  if (check.some((c) => !/^(MU|KL|IN|CH|FF|GE|KO|KK)$/.test(c))) continue;
  const sf = String(r[6] || '').trim().toUpperCase();
  const areas = (Array.isArray(r[10]) ? r[10] : []).filter((g) => Array.isArray(g) && g[0]).map((g) => ({ name: cleanText(String(g[0])).trim(), level: Number(g[1]) || 0 }));
  talents.push({ name: preservedName('talents', label, label), label, check, cat, sf: /^[A-D]$/.test(sf) ? sf : 'B', areas, url: buildUrl(r[11]) });
}
const TAL_GROUPS = [['PHYSICAL_TALENTS', 'Physical'], ['SOCIAL_TALENTS', 'Social'], ['NATURE_TALENTS', 'Nature'], ['KNOWLEDGE_TALENTS', 'Knowledge'], ['CRAFT_TALENTS', 'Crafts']];
const serTalent = (t) => {
  const L = [`  { name: ${JSON.stringify(t.name)}, label: ${JSON.stringify(t.label)}, check: ${JSON.stringify(t.check)}, increaseFactor: IncreaseFactor.${t.sf}, category: TalentCategory.${t.cat}`];
  if (t.areas.length) L.push(`applicationAreas: ${JSON.stringify(t.areas)}`);
  if (t.url) L.push(`url: ${JSON.stringify(t.url)}`);
  return L.join(', ') + ' },';
};
const talOut =
  `import { IncreaseFactor } from '../models/base-creation.model';\n` +
  `import { TalentDefinition, TalentCategory } from '../models/talent.model';\n\n` + GEN_BANNER('TalentGetInfo') +
  TAL_GROUPS.map(([cn, cat]) => `export const ${cn}: TalentDefinition[] = [\n${talents.filter((t) => t.cat === cat).map(serTalent).join('\n')}\n];\n`).join('\n') +
  `\nexport const ALL_TALENTS: TalentDefinition[] = [\n${TAL_GROUPS.map(([cn]) => `  ...${cn},`).join('\n')}\n];\n`;
writeFileSync(resolve(CONST_DIR, 'talent.const.ts'), talOut, 'utf8');

// ---- Combat techniques (KampftechnikGetInfo) ----
const cts = [];
for (const r of parseGetInfo(functionBody(js, 'KampftechnikGetInfo'))) {
  const books = Array.isArray(r[7]) ? r[7].flat().filter((s) => typeof s === 'string') : [];
  if (!isDsa(books)) continue;
  const label = cleanText(String(r[1] || '')).trim();
  if (!label || /Mythos/i.test(label)) continue;
  const typ = String(r[6] || '').trim();
  const sf = String(r[5] || '').trim().toUpperCase();
  const ranged = typ === 'Fern';
  let primary;
  if (ranged) primary = String(r[2] || '').trim();
  else { const pa1 = String(r[3] || '').trim(); const pa2 = String(r[4] || '').trim(); primary = pa2 && pa2 !== pa1 ? [pa1, pa2] : pa1; }
  const attrs = Array.isArray(primary) ? primary : [primary];
  if (attrs.some((c) => !/^(MU|KL|IN|CH|FF|GE|KO|KK)$/.test(c))) continue;
  cts.push({ name: preservedName('combatTechniques', label, label), label, primary, sf: /^[A-E]$/.test(sf) ? sf : 'B', ranged, url: buildUrl(r[8]) });
}
const serCt = (c) => `  { name: ${JSON.stringify(c.name)}, label: ${JSON.stringify(c.label)}, primaryAttribute: ${JSON.stringify(c.primary)}, increaseFactor: IncreaseFactor.${c.sf}, hasParry: ${!c.ranged} },`;
const ctHeader = `import { IncreaseFactor } from '../models/base-creation.model';\nimport { CombatTechniqueDefinition } from '../models/combat-technique.model';\n\n`;
writeFileSync(resolve(CONST_DIR, 'combat-technique-melee.const.ts'),
  ctHeader + GEN_BANNER('KampftechnikGetInfo (Nahkampf)') + `export const MELEE_COMBAT_TECHNIQUES: CombatTechniqueDefinition[] = [\n${cts.filter((c) => !c.ranged).map(serCt).join('\n')}\n];\n`, 'utf8');
writeFileSync(resolve(CONST_DIR, 'combat-technique-ranged.const.ts'),
  ctHeader + GEN_BANNER('KampftechnikGetInfo (Fernkampf)') + `export const RANGED_COMBAT_TECHNIQUES: CombatTechniqueDefinition[] = [\n${cts.filter((c) => c.ranged).map(serCt).join('\n')}\n];\n`, 'utf8');

// ---- Cantrips / Zaubertricks (TrickGetInfo) ----
const TRAIT_MEMBER = { 'Antimagie': 'Antimagie', 'Dämonisch': 'Daemonisch', 'Einfluss': 'Einfluss', 'Elementar': 'Elementar', 'Heilung': 'Heilung', 'Hellsicht': 'Hellsicht', 'Illusion': 'Illusion', 'Objekt': 'Objekt', 'Sphären': 'Sphaeren', 'Telekinese': 'Telekinese', 'Temporal': 'Temporal', 'Verwandlung': 'Verwandlung' };
const cantrips = [];
const usedCantrip = new Set();
for (const r of parseGetInfo(functionBody(js, 'TrickGetInfo'))) {
  const books = Array.isArray(r[7]) ? r[7].flat().filter((s) => typeof s === 'string') : [];
  if (!isDsa(books)) continue;
  const label = cleanText(String(r[0] || '')).trim();
  const traitMember = TRAIT_MEMBER[cleanText(String(r[4] || '')).trim()];
  if (!label || !traitMember || /Mythos/i.test(label)) continue;
  let name = preservedName('cantrips', label, slug(label));
  while (usedCantrip.has(name)) name += 'x';
  usedCantrip.add(name);
  const traditions = (Array.isArray(r[5]) ? r[5] : []).filter((s) => typeof s === 'string').map((s) => cleanText(s).trim());
  cantrips.push({ name, label, traitMember, traditions, url: buildUrl(r[8]) });
}
cantrips.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const cantripOut =
  `import { Cantrip, SpellTrait } from '../models/magic.model';\n\n` + GEN_BANNER('TrickGetInfo') +
  `export const ALL_CANTRIPS: Cantrip[] = [\n` +
  cantrips.map((c) => `  { name: ${JSON.stringify(c.name)}, label: ${JSON.stringify(c.label)}, trait: SpellTrait.${c.traitMember}, traditions: ${JSON.stringify(c.traditions)}${c.url ? `, url: ${JSON.stringify(c.url)}` : ''} },`).join('\n') +
  `\n];\n`;
writeFileSync(resolve(CONST_DIR, 'cantrip.const.ts'), cantripOut, 'utf8');

// ---- Blessings / Segnungen (SegnungGetInfo) ----
const blessings = [];
const usedBless = new Set();
for (const r of parseGetInfo(functionBody(js, 'SegnungGetInfo'))) {
  const books = Array.isArray(r[6]) ? r[6].flat().filter((s) => typeof s === 'string') : [];
  if (!isDsa(books)) continue;
  const label = cleanText(String(r[0] || '')).trim();
  if (!label || /Mythos/i.test(label)) continue;
  let name = preservedName('blessings', label, slug(label));
  while (usedBless.has(name)) name += 'x';
  usedBless.add(name);
  const traditions = (Array.isArray(r[4]) ? r[4] : []).filter((s) => typeof s === 'string').map((s) => cleanText(s).trim());
  blessings.push({ name, label, traditions, url: buildUrl(r[7]) });
}
blessings.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const blessOut =
  `import { Blessing } from '../models/divine.model';\n\n` + GEN_BANNER('SegnungGetInfo') +
  `export const ALL_BLESSINGS: Blessing[] = [\n` +
  blessings.map((b) => `  { name: ${JSON.stringify(b.name)}, label: ${JSON.stringify(b.label)}, aspect: 'Allgemein', traditions: ${JSON.stringify(b.traditions)}${b.url ? `, url: ${JSON.stringify(b.url)}` : ''} },`).join('\n') +
  `\n];\n`;
writeFileSync(resolve(CONST_DIR, 'blessing.const.ts'), blessOut, 'utf8');

// ---- Talent styles (TalentstilGetInfo) — NEW ----
const talentStyles = [];
const usedStyle = new Set();
for (const r of parseSpeciesGetInfo(functionBody(js, 'TalentstilGetInfo'))) {
  const label = cleanText(String(r[0] || r[2] || '')).trim();
  const books = Array.isArray(r[8]) ? r[8].flat().filter((s) => typeof s === 'string') : [];
  if (!label || !isDsa(books) || /Mythos/i.test(label)) continue;
  let name = slug(label) || 'talentstil';
  while (usedStyle.has(name)) name += 'x';
  usedStyle.add(name);
  const regel = String(r[7] || '');
  const rule = cleanText(regel).replace(/^\s*Regel:\s*/i, '').replace(/\n[\s\S]*$/, '').trim();
  const styleGrants = parseStyleGrants(regel);
  talentStyles.push({ name, label, cost: Number(r[6]) || 0, rule, styleGrants, sources: buildSources(books), url: buildUrl(r[9]) });
}
talentStyles.sort((a, b) => a.label.localeCompare(b.label, 'de'));
const styleOut =
  `import { TalentStyle } from '../models/talent-style.model';\n\n` + GEN_BANNER('TalentstilGetInfo') +
  `export const ALL_TALENT_STYLES: TalentStyle[] = [\n` +
  talentStyles.map((s) => {
    const L = [`    name: ${JSON.stringify(s.name)}`, `label: ${JSON.stringify(s.label)}`, `cost: ${s.cost}`];
    if (s.rule) L.push(`rule: ${JSON.stringify(s.rule)}`);
    if (s.styleGrants.length) L.push(`styleGrants: ${JSON.stringify(s.styleGrants)}`);
    if (s.sources.length) L.push(`sources: ${JSON.stringify(s.sources)}`);
    if (s.url) L.push(`url: ${JSON.stringify(s.url)}`);
    return `  {\n    ${L.join(',\n    ')},\n  },`;
  }).join('\n') +
  `\n];\n`;
writeFileSync(resolve(CONST_DIR, 'talent-style.const.ts'), styleOut, 'utf8');

console.log(`Data catalogs → talents ${talents.length}, combat techniques ${cts.length}, cantrips ${cantrips.length}, blessings ${blessings.length}, talent styles ${talentStyles.length}.`);

// ── Prerequisite parser coverage report (strict) ─────────────────────────────────────────────────
const totalReqs = Object.values(reqStats).reduce((a, b) => a + b, 0);
const narrCount = reqStats['narrative'] || 0;
const structured = totalReqs - narrCount;
console.log('\n══════════ PREREQUISITE PARSER COVERAGE ══════════');
console.log(`Entries with prerequisites processed: ${reqEntriesProcessed}`);
console.log(`Fragments classified: ${totalReqs}  (structured: ${structured}, narrative: ${narrCount}` +
  `, ${totalReqs ? Math.round((structured / totalReqs) * 100) : 0}% structured)`);
console.log('Per type:');
for (const [t, c] of Object.entries(reqStats).sort((a, b) => b[1] - a[1])) console.log(`   ${String(c).padStart(5)}  ${t}`);
// Complete, de-duplicated list of every fragment that fell back to narrative.
const narrByText = new Map();
for (const { owner, text } of narrativeLog) {
  if (!narrByText.has(text)) narrByText.set(text, new Set());
  narrByText.get(text).add(owner);
}
const narrSorted = [...narrByText.entries()].sort((a, b) => a[0].localeCompare(b[0], 'de'));
const narrReport =
  `PREREQUISITE PARSER — NARRATIVE FALLBACKS (${narrByText.size} distinct of ${narrativeLog.length} total)\n` +
  `Each line: «verbatim fragment»  ⟵ owning entry/entries\n` +
  `Review these to extend the grammar (classifyFragment in tools/extract-pdf-data.mjs).\n\n` +
  narrSorted.map(([text, owners]) => `«${text}»  ⟵  ${[...owners].slice(0, 5).join('; ')}${owners.size > 5 ? ` (+${owners.size - 5} more)` : ''}`).join('\n') + '\n';
writeFileSync(resolve(ROOT, 'tools/dsa-data/prereq-narrative.txt'), narrReport, 'utf8');
console.log(`\nNarrative fallbacks: ${narrByText.size} distinct (${narrativeLog.length} total) → tools/dsa-data/prereq-narrative.txt`);
console.log('Top narrative fragments:');
for (const [text, owners] of narrSorted.slice(0, 25)) console.log(`   «${text.slice(0, 90)}»  (${owners.size}×)`);
console.log('══════════════════════════════════════════════════');
