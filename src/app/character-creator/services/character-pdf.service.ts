import { inject, Injectable } from '@angular/core';
import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFImage, PDFName, PDFNull, PDFNumber, PDFRawStream, PDFStream, StandardFonts, decodePDFRawStream } from 'pdf-lib';
import { Character } from '../models/base-creation.model';
import { HOMEBREW_SA_BUCKET } from '../models/homebrew.model';
import { CharacterResolverService } from './character-resolver.service';
import { resolvePicksForCharacter } from '../catalog/character-entries';
import { specialAbilityCost } from '../utils/ap-budget.util';
import { advantageCost, labelWithFreeText, totalTalentCost, computeRoutine } from '../utils/utils';
import { ATTR_KEY } from '../utils/derived-stats.util';
import { SheetWriter, roman, Bookmark } from '../utils/pdf-layout.util';
import { ALL_SPECIES } from '../constants/species.const';
import { ALL_CULTURES } from '../constants/culture.const';
import { ALL_PROFESSIONS } from '../constants/profession.const';
import { EXPERIENCE_LEVELS } from '../constants/experience-levels.const';
import { ALL_SPECIAL_ABILITIES } from '../constants/special-ability.const';
import { ALL_TALENTS } from '../constants/talent.const';
import { MELEE_COMBAT_TECHNIQUES } from '../constants/combat-technique-melee.const';
import { RANGED_COMBAT_TECHNIQUES } from '../constants/combat-technique-ranged.const';
import { ALL_SPELLS } from '../constants/spell.const';
import { ALL_RITUALS } from '../constants/ritual.const';
import { ALL_LITURGIES } from '../constants/liturgy.const';
import { ALL_CEREMONIES } from '../constants/ceremony.const';
import { ALL_CANTRIPS } from '../constants/cantrip.const';
import { ALL_BLESSINGS } from '../constants/blessing.const';
import { TalentCategory } from '../models/talent.model';
import { CombatTechniqueDefinition } from '../models/combat-technique.model';
import { ATTR_COLORS } from '../constants/attribute-colors.const';

const ATTR_ORDER: Array<keyof typeof ATTR_KEY> = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'];
const TALENT_GROUPS: Array<[string, TalentCategory]> = [
  ['Körpertalente', TalentCategory.Physical],
  ['Gesellschaftstalente', TalentCategory.Social],
  ['Naturtalente', TalentCategory.Nature],
  ['Wissenstalente', TalentCategory.Knowledge],
  ['Handwerkstalente', TalentCategory.Crafts],
];

const SA_LABEL = new Map(ALL_SPECIAL_ABILITIES.map((s) => [s.name, s.label]));
const CANTRIP_LABEL = new Map(ALL_CANTRIPS.map((c) => [c.name, c.label]));
const BLESSING_LABEL = new Map(ALL_BLESSINGS.map((b) => [b.name, b.label]));
const SPELL_LABEL = new Map([...ALL_SPELLS, ...ALL_RITUALS].map((s) => [s.name, s.label]));
const LITURGY_LABEL = new Map([...ALL_LITURGIES, ...ALL_CEREMONIES].map((s) => [s.name, s.label]));
// name → full catalog entry (carries `extensions`) for resolving chosen extension labels on the sheet.
const SPELL_MAP = new Map<string, any>([...ALL_SPELLS, ...ALL_RITUALS].map((s) => [s.name, s]));
const LITURGY_MAP = new Map<string, any>([...ALL_LITURGIES, ...ALL_CEREMONIES].map((s) => [s.name, s]));
const LANG_LABEL = new Map(ALL_SPECIAL_ABILITIES.filter((s) => (s.category as string) === 'language').map((s) => [s.name, s.label]));
const SCRIPT_LABEL = new Map(ALL_SPECIAL_ABILITIES.filter((s) => (s.category as string) === 'script').map((s) => [s.name, s.label]));
const MELEE_CT = new Map(MELEE_COMBAT_TECHNIQUES.map((ct) => [ct.name, ct]));
const RANGED_CT = new Map(RANGED_COMBAT_TECHNIQUES.map((ct) => [ct.name, ct]));
const COMBAT_ROW_H = 13; // dense rows so the whole Kampf page fits on one sheet

const ATTACHMENT_NAME = 'character.json';
const n = (v: unknown): string => (v == null || v === '' ? '' : String(v));

/**
 * Builds a printable, structured DSA character sheet (one page per area, clean white ruled form with
 * blank rows for hand-filling) and embeds the canonical save-JSON as a file attachment so the same PDF
 * re-imports. Magie/Liturgien pages are only added for casters/priests. Client-side (pdf-lib).
 */
@Injectable({ providedIn: 'root' })
export class CharacterPdfService {
  private resolver = inject(CharacterResolverService);

  private jsonFor(character: Character): string {
    return JSON.stringify(this.resolver.toSaveData(character), null, 2);
  }

  /** Parchment background texture; served from assets. Missing/unavailable → undefined (flat-fill fallback). */
  private static readonly BG_ASSET = 'assets/other/parchment.jpg';

  /**
   * Loads the parchment texture, downscales + re-encodes it to a small JPEG (a subtle background needs no
   * high DPI), and embeds it once. Keeps the file small regardless of the source resolution. Any failure
   * (missing asset, no canvas, non-browser) → undefined, and the sheet falls back to the flat parchment tint.
   */
  private async loadBackgroundImage(doc: PDFDocument): Promise<PDFImage | undefined> {
    try {
      if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return undefined;
      const res = await fetch(new URL(CharacterPdfService.BG_ASSET, document.baseURI).href);
      if (!res.ok) return undefined;
      const bmp = await createImageBitmap(await res.blob());
      // A4 portrait ratio; modest resolution — the texture is subtle, so this stays ~40–80 KB.
      const targetW = 800;
      const targetH = Math.round(targetW * (841.89 / 595.28));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const cx = canvas.getContext('2d');
      if (!cx) return undefined;
      // Cover: scale to fill, center-crop (avoids stretching a landscape texture onto a portrait page).
      const scale = Math.max(targetW / bmp.width, targetH / bmp.height);
      const dw = bmp.width * scale;
      const dh = bmp.height * scale;
      cx.drawImage(bmp, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
      bmp.close?.();
      const b64 = canvas.toDataURL('image/jpeg', 0.68).split(',')[1];
      const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
      return await doc.embedJpg(bytes);
    } catch {
      return undefined;
    }
  }

  async buildPdf(character: Character, opts: { whiteBackground?: boolean } = {}): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);

    doc.setTitle(character.bio.name?.trim() || 'Heldendokument');
    doc.setSubject('DSA5 Heldendokument');
    doc.setKeywords(['DSA', 'DSA5', 'character', 'Heldendokument']);
    doc.setProducer('dsa-tools');

    const picks = resolvePicksForCharacter(character);
    const hasMagic =
      character.derived.astralPoints.max > 0 || (character.spells?.length ?? 0) > 0 || (character.cantrips?.length ?? 0) > 0 || picks.specialAbilities.magic.length > 0;
    const hasKarmal =
      character.derived.karmaPoints.max > 0 || (character.liturgies?.length ?? 0) > 0 || (character.blessings?.length ?? 0) > 0 || picks.specialAbilities.karmal.length > 0;

    const bgImage = opts.whiteBackground ? undefined : await this.loadBackgroundImage(doc);
    const w = new SheetWriter(doc, font, bold, !opts.whiteBackground, bgImage);
    this.pagePersonal(w, character, picks);
    w.newPage();
    this.pageSkills(w, character);
    w.newPage();
    this.pageCombat(w, character, picks);
    w.newPage();
    this.pagePossessions(w, character);
    if (hasMagic) {
      w.newPage();
      this.pageMagic(w, character, picks);
    }
    if (hasKarmal) {
      w.newPage();
      this.pageKarmal(w, character, picks);
    }
    if (character.homebrew.length > 0) {
      w.newPage();
      this.pageHomebrew(w, character);
    }

    // PDF outline (bookmarks) from the headings collected while drawing → jump to Vorteile/Kampf/… quickly.
    buildOutline(doc, w.bookmarks);

    const jsonBytes = new TextEncoder().encode(this.jsonFor(character));
    await doc.attach(jsonBytes, ATTACHMENT_NAME, {
      mimeType: 'application/json',
      description: 'DSA character data (re-importable)',
      creationDate: new Date(),
      modificationDate: new Date(),
    });

    return doc.save();
  }

  async download(character: Character, opts: { whiteBackground?: boolean; filename?: string } = {}): Promise<void> {
    const bytes = await this.buildPdf(character, opts);
    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = opts.filename ?? `${this.safeName(character)}${opts.whiteBackground ? '-druck' : ''}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async extractCharacterJson(bytes: Uint8Array): Promise<unknown | null> {
    let doc: PDFDocument;
    try {
      doc = await PDFDocument.load(bytes, { throwOnInvalidObject: false });
    } catch {
      return null;
    }
    for (const stream of embeddedFileStreams(doc)) {
      try {
        const parsed = JSON.parse(new TextDecoder('utf-8').decode(decodePDFRawStream(stream).decode()));
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        /* keep looking */
      }
    }
    return null;
  }

  // ── Page 1: Persönliche Daten ────────────────────────────────────────────────────────
  // Top: title + attribute boxes. Then bio (left ~60%) | AP+Erfahrungsgrad (right). Then a 70:30 body:
  // left = Vor-/Nachteile/allg. SF (each header shows the category's total AP), right = Energien +
  // abgeleitete Werte, with Schicksalspunkte pinned to the bottom of the column.
  private pagePersonal(w: SheetWriter, c: Character, picks: ReturnType<typeof resolvePicksForCharacter>): void {
    const a = c.attributes;
    w.pageTitleAndAttributes(
      'Heldendokument',
      'Persönliche Daten',
      ATTR_ORDER.map((code) => [code, String(a[ATTR_KEY[code]]), ATTR_COLORS[code]] as [string, string, string]),
    );

    const exp = EXPERIENCE_LEVELS.find((e) => e.id === c.experienceLevel);
    const bio = c.bio;
    w.twoColumnBody(
      () => {
        w.formGrid(
          [
            ['Name', n(bio.name)],
            ['Familie', n(bio.family)],
            ['Geburtsort', n(bio.birthplace)],
            ['Geburtsdatum', n(bio.birthday)],
          ],
          2,
        );
        // Spezies | Alter · Geschlecht  and  Kultur | Größe · Gewicht (left half wide, right half split).
        w.formRow([['Spezies', labelOf(ALL_SPECIES, c.species, 'type')], ['Alter', n(bio.age)], ['Geschlecht', n(bio.gender)]], [0.5, 0.25, 0.25]);
        w.formRow([['Kultur', labelOf(ALL_CULTURES, c.culture, 'name')], ['Größe', n(bio.height)], ['Gewicht', n(bio.weight)]], [0.5, 0.25, 0.25]);
        w.formGrid(
          [
            ['Profession', labelOf(ALL_PROFESSIONS, c.profession, 'name')],
            ['Titel', n(bio.title)],
            ['Haarfarbe', n(bio.hairColor)],
            ['Augenfarbe', n(bio.eyeColor)],
          ],
          2,
        );
        w.formGrid([['Charakteristika', n(bio.characteristics)], ['Sonstiges', n(bio.misc)]], 1);
      },
      () =>
        w.formGrid(
          [
            ['Erfahrungsgrad', (exp as any)?.label ?? (exp as any)?.name ?? n(c.experienceLevel)],
            ['Sozialstatus', n(bio.socialStatus)],
            ['AP gesamt', String(c.ap.total)],
            ['AP ausgegeben', String(c.ap.spent)],
            ['AP verfügbar', String(c.ap.available)],
          ],
          1,
        ),
      0.6,
    );

    w.spacer(10);
    w.twoColumnBody(() => this.traitsColumn(w, c, picks), () => this.energiesColumn(w, c), 0.66);
  }

  /** Left column of page 1: Vorteile / Nachteile / Allgemeine SF, each with the category's total AP. */
  private traitsColumn(w: SheetWriter, c: Character, picks: ReturnType<typeof resolvePicksForCharacter>): void {
    // Homebrew adv/dis count toward the same totals/caps as catalog picks and must appear on the sheet;
    // SF/other homebrew is listed under Allgemeine Sonderfertigkeiten. Marked "(HB)" so they're distinguishable.
    const hbList = c.homebrew ?? [];
    const hbAp = (e: { cost: number; level?: number }) => e.cost * (e.level ?? 1);
    const hbItem = (e: { label: string; cost: number; level?: number }) => ({ name: `${e.label || 'Homebrew'} (HB)`, level: e.level ? roman(e.level) : '', right: String(hbAp(e)) });
    const hbAdv = hbList.filter((e) => e.kind === 'advantage');
    const hbDis = hbList.filter((e) => e.kind === 'disadvantage');
    const hbSF = hbList.filter((e) => e.kind === 'specialAbility' || e.kind === 'other');

    const advTotal = picks.advantages.reduce((s, x) => s + (x.mandatory ? 0 : advantageCost(x)), 0) + hbAdv.reduce((s, e) => s + hbAp(e), 0);
    const disRaw = picks.disadvantages.reduce((s, x) => s + (x.mandatory ? 0 : advantageCost(x)), 0) + hbDis.reduce((s, e) => s + hbAp(e), 0);
    const genTotal = picks.specialAbilities.general.reduce((s, r) => s + specialAbilityCost(r as any), 0) + hbSF.reduce((s, e) => s + hbAp(e), 0);

    // Nachteile: DSA caps the AP gain at -80. Show whether the full value or the capped -80 is counted.
    const capped = c.capDisadvantageAp ?? true;
    const disRight = disRaw < -80 ? (capped ? `-80 AP (von ${disRaw})` : `${disRaw} AP (ungecappt)`) : `${disRaw} AP`;

    // Per-item AP; auto/mandatory (species-granted, free) shown in parentheses. Name + level are kept
    // separate so flowEntries can truncate the name but always keep the level.
    const advAp = (x: { mandatory?: boolean } & Parameters<typeof advantageCost>[0]) => (x.mandatory ? `(${advantageCost(x)})` : String(advantageCost(x)));
    // The printed sheet has no input boxes, so a free-text detail (Kontakt's name) is woven into the
    // label here — the editor leaves it out because the row shows it in its own field.
    const advItem = (x: { label?: string; name: string; lvl?: number; mandatory?: boolean; text?: string }) => ({
      name: labelWithFreeText(x.label ?? x.name, x.text),
      level: x.lvl ? roman(x.lvl) : '',
      right: advAp(x as any),
    });

    const sections = [
      { title: 'Vorteile', right: `${advTotal} AP`, items: [...picks.advantages.map(advItem), ...hbAdv.map(hbItem)], minBlank: 3 },
      { title: 'Nachteile', right: disRight, items: [...picks.disadvantages.map(advItem), ...hbDis.map(hbItem)], minBlank: 3 },
      { title: 'Allgemeine Sonderfertigkeiten', right: `${genTotal} AP`, items: [...saEntries(picks.specialAbilities.general), ...hbSF.map(hbItem)], minBlank: 5 },
    ];

    // Fit all three sections into the column: split the remaining height proportionally to each section's
    // size (so busy sections get more room), then let flowEntries pick columns / spacing to fit its slice.
    const HEADER_H = 26;
    const body = Math.max(0, w.availableHeight - sections.length * HEADER_H - 6);
    const weight = sections.reduce((s, x) => s + x.items.length + 2, 0);
    for (const s of sections) {
      w.section(s.title, s.right);
      w.flowEntries(s.items, Math.max(28, (body * (s.items.length + 2)) / weight), { minBlank: s.minBlank, maxCols: 3 });
    }
  }

  /** Right column of page 1: energies + derived values as box grids, Schicksalspunkte pinned to bottom. */
  private energiesColumn(w: SheetWriter, c: Character): void {
    const d = c.derived;
    const energyRow = (label: string, p: typeof d.lifePoints): [string, string[]] => [
      label,
      [String(p.base), String(p.bonus), String(p.bought), String((p.permanentLost ?? 0) + ((p as any).autoLost ?? 0)), String(p.boughtBack ?? 0), String(p.max)],
    ];
    const energyRows: Array<[string, string[]]> = [energyRow('LeP', d.lifePoints)];
    if (d.astralPoints.max > 0) energyRows.push(energyRow('AsP', d.astralPoints));
    if (d.karmaPoints.max > 0) energyRows.push(energyRow('KaP', d.karmaPoints));

    w.section('Energien');
    w.boxGrid(['Wert', 'Bon.', 'Zuk.', 'Verl.', 'Rück.', 'Max'], energyRows, 30);

    w.section('Abgeleitete Werte');
    w.boxGrid(
      ['Grund', 'Bonus', 'Max'],
      [
        ['SK', [String(d.spirit.base), String(d.spirit.bonus), String(d.spirit.max)]],
        ['ZK', [String(d.toughness.base), String(d.toughness.bonus), String(d.toughness.max)]],
        ['AW', [String(d.dodge.base), String(d.dodge.bonus), String(d.dodge.max)]],
        ['INI', [String(d.initiative.base), String(d.initiative.bonus), String(d.initiative.max)]],
        ['GS', [String(d.movement.base), String(d.movement.bonus), String(d.movement.max)]],
        ['WS', [String(d.woundThreshold.base), String(d.woundThreshold.bonus), String(d.woundThreshold.max)]],
      ],
      34,
    );

    w.pushToBottom(72);
    w.section('Schicksalspunkte');
    w.miniBoxes([
      ['Wert', String(d.fatePoints.base)],
      ['Bonus', String(d.fatePoints.bonus)],
      ['Max', String(d.fatePoints.max)],
      ['Aktuell', String(d.fatePoints.current)],
    ]);
  }

  // ── Page 3: Fertigkeiten (all talents, two columns) ──────────────────────────────────
  private pageSkills(w: SheetWriter, c: Character): void {
    w.pageHeading('Heldendokument', 'Fertigkeiten');
    const fw = new Map<string, number>();
    for (const key of Object.keys(c.skills) as Array<keyof Character['skills']>) for (const s of c.skills[key] ?? []) fw.set(s.name, s.fw);
    const attrs = c.attributes;
    const talentAp = (t: (typeof ALL_TALENTS)[number]) => totalTalentCost(fw.get(t.name) ?? 0, t.increaseFactor);
    const routineOf = (t: (typeof ALL_TALENTS)[number]) => computeRoutine(fw.get(t.name) ?? 0, t.check.map((code) => attrs[ATTR_KEY[code as keyof typeof ATTR_KEY]]));

    const group = (cat: TalentCategory): void => {
      const [title] = TALENT_GROUPS.find(([, ca]) => ca === cat)!;
      const talents = ALL_TALENTS.filter((t) => t.category === cat);
      const catTotal = talents.reduce((s, t) => s + talentAp(t), 0);
      w.subtitle(title, `${catTotal} AP`);
      w.table(
        [
          { header: 'Talent', width: w.contentW * 0.44 },
          { header: 'Probe', width: w.contentW * 0.26, align: 'center' },
          { header: 'Sf.', width: w.contentW * 0.1, align: 'center' },
          { header: 'FW', width: w.contentW * 0.1, align: 'center' },
          { header: 'R', width: w.contentW * 0.1, align: 'center' },
        ],
        talents.map((t) => [t.label, t.check.join('/'), String(t.increaseFactor), String(fw.get(t.name) ?? 0), routineOf(t)]),
      );
    };
    w.twoColumns(
      () => {
        group(TalentCategory.Physical);
        group(TalentCategory.Social);
        group(TalentCategory.Nature);
      },
      () => {
        group(TalentCategory.Knowledge);
        group(TalentCategory.Crafts);
      },
    );

    // Sprachen (wide, ~2/3) | Schriften (~1/3) — boxes like Vorteile: total + per-item AP + blank rows.
    const langCost = (l: { name: string; lvl: number; mother?: boolean }) => specialAbilityCost({ ...l, mother: false } as any);
    const langTotal = c.languages.reduce((s, l) => s + (l.mother ? 0 : langCost(l)), 0);
    const scriptTotal = c.scripts.reduce((s, sc) => s + specialAbilityCost(sc as any), 0);
    w.twoColumns(
      () => {
        w.section('Sprachen', `${langTotal} AP`);
        w.entryLines(
          c.languages.map((l) => [`${LANG_LABEL.get(l.name) ?? l.name} ${roman(l.lvl)}${l.mother ? ' (Mutter)' : ''}`, l.mother ? `(${langCost(l)})` : String(langCost(l))]),
          3,
        );
      },
      () => {
        w.section('Schriften', `${scriptTotal} AP`);
        w.entryLines(c.scripts.map((sc) => [SCRIPT_LABEL.get(sc.name) ?? sc.name, String(specialAbilityCost(sc as any))]), 3);
      },
    );
  }

  // ── Page 4: Kampf ────────────────────────────────────────────────────────────────────
  /** flowEntries items for the homebrew SFs that mirror into one SF bucket (marked "(HB)"). */
  private hbSaItems(c: Character, bucket: 'general' | 'combat' | 'magic' | 'karmal'): Array<{ name: string; level?: string; right: string }> {
    return (c.homebrew ?? [])
      .filter((e) => HOMEBREW_SA_BUCKET[e.kind] === bucket)
      .map((e) => ({ name: `${e.label || 'Homebrew'} (HB)`, level: e.level ? roman(e.level) : '', right: String(e.cost * (e.level ?? 1)) }));
  }

  private pageCombat(w: SheetWriter, c: Character, picks: ReturnType<typeof resolvePicksForCharacter>): void {
    const d = c.derived;
    // Corner boxes (like the attribute boxes) with the combat-relevant derived values.
    w.pageTitleAndAttributes('Heldendokument', 'Kampf', [
      ['AW', String(d.dodge.max), '#7a5a2e'],
      ['INI', String(d.initiative.max), '#7a5a2e'],
      ['SK', String(d.spirit.max), '#7a5a2e'],
      ['ZK', String(d.toughness.max), '#7a5a2e'],
      ['WS', String(d.woundThreshold.max), '#7a5a2e'],
      ['GS', String(d.movement.max), '#7a5a2e'],
    ]);

    const attrs = c.attributes;
    const mu = attrs.courage;
    const ff = attrs.dexterity;
    const ktwOf = (name: string) => c.combatTechniques[name]?.ktw ?? 6;
    const leitOf = (def: CombatTechniqueDefinition) => (Array.isArray(def.primaryAttribute) ? def.primaryAttribute : [def.primaryAttribute]);

    // Kampftechniken (left, ≤50% width) | Lebensenergie (right).
    w.twoColumns(
      () => {
        const meleeTech = MELEE_COMBAT_TECHNIQUES.map((def) => {
          const ktw = ktwOf(def.name);
          const maxPrim = Math.max(...leitOf(def).map((a) => attrs[ATTR_KEY[a]]));
          const at = ktw + Math.floor(Math.max(0, mu - 8) / 3);
          const pa = def.hasParry ? String(Math.ceil(ktw / 2) + Math.floor(Math.max(0, maxPrim - 8) / 3)) : 'X';
          return [def.label, leitOf(def).join('/'), String(def.increaseFactor), String(ktw), String(at), pa];
        });
        const rangedTech = RANGED_COMBAT_TECHNIQUES.map((def) => {
          const ktw = ktwOf(def.name);
          return [def.label, leitOf(def).join('/'), String(def.increaseFactor), String(ktw), String(ktw + Math.floor(Math.max(0, ff - 8) / 3)), 'X'];
        });
        w.section('Kampftechniken');
        w.table(
          [
            { header: 'Technik', width: w.contentW * 0.36 },
            { header: 'Leit', width: w.contentW * 0.18, align: 'center' },
            { header: 'Sf.', width: w.contentW * 0.1, align: 'center' },
            { header: 'Ktw', width: w.contentW * 0.12, align: 'center' },
            { header: 'AT/FK', width: w.contentW * 0.12, align: 'center' },
            { header: 'PA', width: w.contentW * 0.12, align: 'center' },
          ],
          [...meleeTech, ...rangedTech],
          { rowH: COMBAT_ROW_H },
        );
      },
      () => w.lifeEnergy(d.lifePoints.max),
    );

    // Nahkampfwaffen — computed AT/PA (final) per weapon; max 4 rows (pad blanks up to 4).
    w.section('Nahkampfwaffen');
    w.table(
      [
        { header: 'Waffe', width: w.contentW * 0.2 },
        { header: 'Kampftechnik', width: w.contentW * 0.15 },
        { header: 'Schadensb.', width: w.contentW * 0.1, align: 'center' },
        { header: 'TP', width: w.contentW * 0.12, align: 'center' },
        { header: 'AT/PA-Mod', width: w.contentW * 0.1, align: 'center' },
        { header: 'RW', width: w.contentW * 0.09, align: 'center' },
        { header: 'AT', width: w.contentW * 0.06, align: 'center' },
        { header: 'PA', width: w.contentW * 0.06, align: 'center' },
        { header: 'Gew.', width: w.contentW * 0.12, align: 'right' },
      ],
      (c.equipment.closeCombat as any[]).map((r) => {
        const tech = MELEE_CT.get(r.combatTechnique);
        const leit = tech ? leitOf(tech) : [];
        const ktw = tech && c.combatTechniques[tech.name]?.ktw ? c.combatTechniques[tech.name].ktw : 6;
        const maxPrim = leit.length ? Math.max(...leit.map((a) => attrs[ATTR_KEY[a]])) : 8;
        const at = ktw + Math.floor(Math.max(0, mu - 8) / 3) + (r.atMod ?? 0);
        const pa = tech?.hasParry ? Math.ceil(ktw / 2) + Math.floor(Math.max(0, maxPrim - 8) / 3) + (r.paMod ?? 0) : null;
        return [n(r.weapon), tech?.label ?? n(r.combatTechnique), leit.join('/'), n(r.damage), `${r.atMod ?? 0}/${r.paMod ?? 0}`, n(r.range), r.combatTechnique ? String(at) : '', pa != null ? String(pa) : 'X', n(r.weight)];
      }),
      { minRows: 4, rowH: COMBAT_ROW_H },
    );

    // Fernkampfwaffen — computed FK (final); max 4 rows.
    w.section('Fernkampfwaffen');
    w.table(
      [
        { header: 'Waffe', width: w.contentW * 0.2 },
        { header: 'Kampftechnik', width: w.contentW * 0.15 },
        { header: 'Ladezeit', width: w.contentW * 0.1, align: 'center' },
        { header: 'TP', width: w.contentW * 0.12, align: 'center' },
        { header: 'RW (n/m/f)', width: w.contentW * 0.16, align: 'center' },
        { header: 'FK', width: w.contentW * 0.07, align: 'center' },
        { header: 'Munition', width: w.contentW * 0.1 },
        { header: 'Gew.', width: w.contentW * 0.1, align: 'right' },
      ],
      (c.equipment.rangeCombat as any[]).map((r) => {
        const tech = RANGED_CT.get(r.combatTechnique);
        const ktw = tech && c.combatTechniques[tech.name]?.ktw ? c.combatTechniques[tech.name].ktw : 6;
        const fk = ktw + Math.floor(Math.max(0, ff - 8) / 3) + (r.fkMod ?? 0);
        return [n(r.weapon), tech?.label ?? n(r.combatTechnique), n(r.reloadTimeDefault), n(r.damage), [r.rangeClose, r.rangeMedium, r.rangeFar].filter((x) => x != null).join('/'), r.combatTechnique ? String(fk) : '', n(r.ammunition), n(r.weight)];
      }),
      { minRows: 4, rowH: COMBAT_ROW_H },
    );

    // Rüstungen | Schild-Parierwaffe side by side (50/50).
    w.twoColumns(
      () => {
        w.section('Rüstungen');
        w.table(
          [
            { header: 'Rüstung', width: w.contentW * 0.4 },
            { header: 'RS', width: w.contentW * 0.12, align: 'center' },
            { header: 'BE', width: w.contentW * 0.12, align: 'center' },
            { header: 'Abz. GS/INI', width: w.contentW * 0.2, align: 'center' },
            { header: 'Gew.', width: w.contentW * 0.16, align: 'right' },
          ],
          (c.equipment.armor as any[]).map((r) => [n(r.name), n(r.rs), n(r.be), `${r.penaltyMovement ?? 0}/${r.penaltyInitiative ?? 0}`, n(r.weight)]),
          { minRows: 3, rowH: COMBAT_ROW_H },
        );
      },
      () => {
        w.section('Schild / Parierwaffe');
        w.table(
          [
            { header: 'Schild / Parierwaffe', width: w.contentW * 0.44 },
            { header: 'Strukt.', width: w.contentW * 0.16, align: 'center' },
            { header: 'AT/PA-Mod', width: w.contentW * 0.24, align: 'center' },
            { header: 'Gew.', width: w.contentW * 0.16, align: 'right' },
          ],
          (c.equipment.shields as any[]).map((r) => [n(r.name), n(r.st), `${r.atMod ?? 0}/${r.paMod ?? 0}`, n(r.weight)]),
          { minRows: 3, rowH: COMBAT_ROW_H },
        );
      },
    );

    // Kampfsonderfertigkeiten in 2 columns (more entries per vertical space); names truncate, AP kept.
    w.section('Kampfsonderfertigkeiten');
    w.flowEntries([...saEntries(picks.specialAbilities.combat), ...this.hbSaItems(c, 'combat')], w.availableHeight, { minCols: 2, maxCols: 2, minBlank: 4 });
  }

  // ── Page 5: Besitz ───────────────────────────────────────────────────────────────────
  // Ausrüstung (80%, fills the whole page with rows) | Geldbeutel (20%) + Tragkraft/Gesamtgewicht bottom.
  private pagePossessions(w: SheetWriter, c: Character): void {
    w.pageHeading('Heldendokument', 'Besitz');
    const items = c.equipment.general ?? [];
    const totalWeight = items.reduce((s, i) => s + (i.weight ?? 0) * (i.quantity ?? 1), 0);
    const cur = c.currency;

    w.twoColumnBody(
      () => {
        // Fill the whole column height with rows (data + blanks up to what fits the page).
        const fitRows = Math.max(12, Math.floor((w.availableHeight - 36) / 15) - 1);
        w.section('Ausrüstung');
        w.table(
          [
            { header: 'Gegenstand', width: w.contentW * 0.44 },
            { header: 'Anzahl', width: w.contentW * 0.12, align: 'center' },
            { header: 'Wert (S)', width: w.contentW * 0.14, align: 'right' },
            { header: 'Gewicht', width: w.contentW * 0.12, align: 'right' },
            { header: 'Wo getragen', width: w.contentW * 0.18 },
          ],
          items.map((i) => [n(i.name), String(i.quantity ?? 1), n(i.value), n(i.weight), n(i.carriedWhere)]),
          { minRows: fitRows },
        );
      },
      () => {
        w.section('Geldbeutel');
        w.fieldBox('Dukaten', String(cur.ducats), 18);
        w.fieldBox('Silbertaler', String(cur.silverthalers), 18);
        w.fieldBox('Heller', String(cur.haler), 18);
        w.fieldBox('Kreuzer', String(cur.kreutzer), 18);
        w.fieldBox('Edelsteine', n(cur.gems), 46);
        w.fieldBox('Schmuck', n(cur.jewelry), 46);
        w.fieldBox('Sonstiges', n(cur.misc), 46);
        // Tragkraft + Gesamtgewicht pinned to the bottom of the column.
        w.pushToBottom(78);
        w.fieldBox('Tragkraft', `${c.attributes.strength * 2} Stein`, 20, 52);
        w.fieldBox('Gewicht', totalWeight ? `${totalWeight.toFixed(2)} Stein` : '', 20, 52);
      },
      0.8,
    );
  }

  // ── Pages 6/7: Zauber & Rituale (casters) / Liturgien & Zeremonien (priests) — near-identical ──
  private pageMagic(w: SheetWriter, c: Character, picks: ReturnType<typeof resolvePicksForCharacter>): void {
    this.magicPage(w, c, {
      title: 'Zauber & Rituale', nameHeader: 'Zauber / Ritual', traitHeader: 'Merkmal', poolLabel: 'AsP Max.', poolMax: c.derived.astralPoints.max,
      rows: c.spells, labels: SPELL_LABEL, extMap: SPELL_MAP, guiding: c.magicGuidingAttribute, tradition: c.magicTradition,
      tricksTitle: 'Zaubertricks', tricks: (c.cantrips ?? []).map((id) => CANTRIP_LABEL.get(id) ?? id),
      saTitle: 'Magische Sonderfertigkeiten', sa: picks.specialAbilities.magic, saBucket: 'magic',
    });
  }

  private pageKarmal(w: SheetWriter, c: Character, picks: ReturnType<typeof resolvePicksForCharacter>): void {
    this.magicPage(w, c, {
      title: 'Liturgien & Zeremonien', nameHeader: 'Liturgie / Zeremonie', traitHeader: 'Aspekt', poolLabel: 'KaP Max.', poolMax: c.derived.karmaPoints.max,
      rows: c.liturgies, labels: LITURGY_LABEL, extMap: LITURGY_MAP, guiding: c.karmalGuidingAttribute, tradition: c.karmalTradition,
      tricksTitle: 'Segnungen', tricks: (c.blessings ?? []).map((id) => BLESSING_LABEL.get(id) ?? id),
      saTitle: 'Klerikale Sonderfertigkeiten', sa: picks.specialAbilities.karmal, saBucket: 'karmal',
    });
  }

  /** Shared magic/liturgy page: attributes + Max/Aktuell pool + spell table (with extension sub-rows) +
   * Zaubertricks/Segnungen | Leiteigenschaft/Merkmal/Tradition boxes + the 2-column SF list. */
  private magicPage(
    w: SheetWriter,
    c: Character,
    o: {
      title: string;
      nameHeader: string;
      traitHeader: string;
      poolLabel: string;
      poolMax: number;
      rows: any[] | undefined;
      labels: Map<string, string>;
      extMap: Map<string, any>;
      guiding?: string;
      tradition?: string;
      tricksTitle: string;
      tricks: string[];
      saTitle: string;
      sa: Array<{ name: string; param?: string; granted?: boolean }>;
      saBucket: 'magic' | 'karmal';
    },
  ): void {
    const a = c.attributes;
    w.pageTitleAndAttributes('Heldendokument', o.title, ATTR_ORDER.map((code) => [code, String(a[ATTR_KEY[code]]), ATTR_COLORS[code]] as [string, string, string]));
    w.maxCurrentRow(o.poolLabel, o.poolMax);

    const cw = w.contentW;
    w.section(o.title);
    w.magicTable(
      [
        { header: o.nameHeader, width: cw * 0.2 },
        { header: 'Probe', width: cw * 0.12, align: 'center' },
        { header: 'FW', width: cw * 0.06, align: 'center' },
        { header: 'Kosten', width: cw * 0.1, align: 'center' },
        { header: 'Dauer', width: cw * 0.12, align: 'center' },
        { header: 'RW', width: cw * 0.1, align: 'center' },
        { header: 'W-Dauer', width: cw * 0.12, align: 'center' },
        { header: o.traitHeader, width: cw * 0.13 },
        { header: 'Sf.', width: cw * 0.05, align: 'center' },
      ],
      (o.rows ?? []).map((r) => ({
        cells: [o.labels.get(r.spellName) ?? n(r.spellName), (r.probe ?? []).join('/'), n(r.fw), n(r.cost), n(r.castTime), n(r.range), n(r.duration), n(r.trait), n(r.increaseFactor)],
        ext: (r.extensions ?? []).map((e: any) => extLabel(o.extMap, r.spellName, e.name)).join('; '),
      })),
      { minRows: Math.max((o.rows?.length ?? 0) + 1, 8) },
    );

    w.twoColumns(
      () => {
        w.section(o.tricksTitle);
        // 2 columns × 6 rows (12 slots) — Segnungen are almost always all 12; blanks fill the rest.
        const trickItems = o.tricks.map((t) => ({ name: t }));
        w.flowEntries(trickItems, 6 * 15, { minCols: 2, maxCols: 2, minBlank: Math.max(0, 12 - trickItems.length) });
      },
      () => {
        w.fieldBox('Leiteigenschaft', n(o.guiding), 20, 62);
        w.fieldBox(o.traitHeader, '', 20, 62);
        w.fieldBox('Tradition', n(o.tradition), 54, 62);
      },
    );

    w.section(o.saTitle);
    w.flowEntries([...saEntries(o.sa), ...this.hbSaItems(c, o.saBucket)], w.availableHeight, { minCols: 2, maxCols: 2, minBlank: 3 });
  }

  // ── Last page: Homebrew ───────────────────────────────────────────────────────────────
  // All homebrew entries as boxes in 2–3 columns (only rendered when the character has homebrew).
  private pageHomebrew(w: SheetWriter, c: Character): void {
    w.pageHeading('Homebrew', 'Eigene Einträge');
    const KIND: Record<string, string> = {
      advantage: 'Vorteil',
      disadvantage: 'Nachteil',
      specialAbility: 'Sonderfertigkeit',
      combatSpecialAbility: 'Kampf-SF',
      magicSpecialAbility: 'Magische SF',
      karmalSpecialAbility: 'Karmale SF',
      other: 'Sonstiges',
    };
    const items = c.homebrew.map((e) => {
      const ap = e.cost * (e.level ?? 1);
      const fields: Array<[string, string]> = [];
      if (e.level) fields.push(['Stufe', String(e.level)]);
      if (e.probe) fields.push(['Probe', e.probe]);
      if (e.effectText) fields.push(['Effekt', e.effectText]);
      if (e.prerequisiteText) fields.push(['Voraussetzungen', e.prerequisiteText]);
      if (e.note) fields.push(['Notiz', e.note]);
      return { title: e.label || 'Homebrew', right: `${KIND[e.kind] ?? 'Sonstiges'} · ${ap} AP`, fields };
    });
    w.boxColumns(items, c.homebrew.length >= 5 ? 3 : 2);
  }

  private safeName(character: Character): string {
    return (character.bio.name?.trim() || 'held').replace(/[^\p{L}\p{N}_-]+/gu, '_').toLowerCase();
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────────────

function labelOf(list: ReadonlyArray<any>, key: string | undefined, idField: string): string {
  if (!key) return '';
  return list.find((e) => e[idField] === key)?.label ?? key;
}

/** Resolve a chosen spell/liturgy extension's display label ("Label (X AP)") from the catalog. */
function extLabel(map: Map<string, any>, spellName: string, extName: string): string {
  const e = map.get(spellName)?.extensions?.find((x: any) => x.name === extName);
  return e ? `${e.label} (${e.apCost} AP)` : extName;
}

/** `{name,right}` for the page-1/SF flow lists; granted SAs show their nominal cost in parentheses (auto/free). */
function saEntries(refs: Array<{ name: string; param?: string; granted?: boolean; lvl?: number }>): Array<{ name: string; level?: string; right: string }> {
  return refs.map((r) => {
    const nominal = specialAbilityCost({ ...r, granted: false } as any);
    return { name: saName(r), level: '', right: r.granted ? `(${nominal})` : String(nominal) };
  });
}

function saName(r: { name: string; param?: string }): string {
  const label = SA_LABEL.get(r.name) ?? r.name;
  return r.param ? `${label} (${r.param})` : label;
}

/** Collects every embedded-file stream from a PDF's `catalog → Names → EmbeddedFiles` name tree. */
function embeddedFileStreams(doc: PDFDocument): PDFRawStream[] {
  const out: PDFRawStream[] = [];
  const namesDict = doc.catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
  const efTree = namesDict?.lookupMaybe(PDFName.of('EmbeddedFiles'), PDFDict);
  if (!efTree) return out;

  const visit = (node: PDFDict): void => {
    const kids = node.lookupMaybe(PDFName.of('Kids'), PDFArray);
    if (kids) {
      for (let i = 0; i < kids.size(); i++) {
        const kid = kids.lookupMaybe(i, PDFDict);
        if (kid) visit(kid);
      }
      return;
    }
    const names = node.lookupMaybe(PDFName.of('Names'), PDFArray);
    if (!names) return;
    for (let i = 1; i < names.size(); i += 2) {
      const filespec = names.lookupMaybe(i, PDFDict);
      const ef = filespec?.lookupMaybe(PDFName.of('EF'), PDFDict);
      const stream = ef?.lookupMaybe(PDFName.of('F'), PDFStream) ?? ef?.lookupMaybe(PDFName.of('UF'), PDFStream);
      if (stream instanceof PDFRawStream) out.push(stream);
    }
  };
  visit(efTree);
  return out;
}

/**
 * Builds a PDF outline (bookmarks) from the collected heading anchors, so readers show a navigation tree
 * (Persönliche Daten → Vorteile/Nachteile/…, Kampf → Nahkampfwaffen/…, Magie → …, Homebrew). Level-0
 * anchors are top-level items; level-1 anchors nest under the preceding level-0. Titles are UTF-16 (umlauts).
 */
function buildOutline(doc: PDFDocument, bookmarks: readonly Bookmark[]): void {
  if (!bookmarks.length) return;
  const ctx = doc.context;

  interface Node {
    bm: Bookmark;
    children: Node[];
  }
  const roots: Node[] = [];
  for (const bm of bookmarks) {
    if (bm.level === 0 || roots.length === 0) roots.push({ bm, children: [] });
    else roots[roots.length - 1].children.push({ bm, children: [] });
  }

  const dest = (bm: Bookmark): PDFArray => {
    const arr = PDFArray.withContext(ctx);
    arr.push(bm.page.ref); // indirect ref to the page
    arr.push(PDFName.of('XYZ'));
    arr.push(PDFNull); // left (keep current)
    arr.push(PDFNumber.of(bm.top)); // top
    arr.push(PDFNull); // zoom (keep current)
    return arr;
  };

  const outlinesRef = ctx.nextRef();
  const rootRefs = roots.map(() => ctx.nextRef());
  const childRefs = roots.map((r) => r.children.map(() => ctx.nextRef()));

  roots.forEach((root, ri) => {
    const kids = childRefs[ri];
    const d = ctx.obj({}) as PDFDict;
    d.set(PDFName.of('Title'), PDFHexString.fromText(root.bm.title));
    d.set(PDFName.of('Parent'), outlinesRef);
    d.set(PDFName.of('Dest'), dest(root.bm));
    if (ri > 0) d.set(PDFName.of('Prev'), rootRefs[ri - 1]);
    if (ri < roots.length - 1) d.set(PDFName.of('Next'), rootRefs[ri + 1]);
    if (kids.length) {
      d.set(PDFName.of('First'), kids[0]);
      d.set(PDFName.of('Last'), kids[kids.length - 1]);
      d.set(PDFName.of('Count'), PDFNumber.of(kids.length)); // positive → shown open
    }
    ctx.assign(rootRefs[ri], d);

    root.children.forEach((child, ci) => {
      const cd = ctx.obj({}) as PDFDict;
      cd.set(PDFName.of('Title'), PDFHexString.fromText(child.bm.title));
      cd.set(PDFName.of('Parent'), rootRefs[ri]);
      cd.set(PDFName.of('Dest'), dest(child.bm));
      if (ci > 0) cd.set(PDFName.of('Prev'), kids[ci - 1]);
      if (ci < kids.length - 1) cd.set(PDFName.of('Next'), kids[ci + 1]);
      ctx.assign(kids[ci], cd);
    });
  });

  const total = roots.reduce((s, r) => s + 1 + r.children.length, 0);
  const outlines = ctx.obj({}) as PDFDict;
  outlines.set(PDFName.of('Type'), PDFName.of('Outlines'));
  outlines.set(PDFName.of('First'), rootRefs[0]);
  outlines.set(PDFName.of('Last'), rootRefs[rootRefs.length - 1]);
  outlines.set(PDFName.of('Count'), PDFNumber.of(total));
  ctx.assign(outlinesRef, outlines);

  doc.catalog.set(PDFName.of('Outlines'), outlinesRef);
  doc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines')); // open the bookmarks pane
}
