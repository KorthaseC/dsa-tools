import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb } from 'pdf-lib';

// A4 portrait, in PDF points. Parchment/gold-brown theme matching the web app (drawn as flat fills, not
// a background IMAGE → still a tiny file). Contrast rule: dark text on the light parchment; light/cream
// text on the dark gold-brown section bars.
const A4: [number, number] = [595.28, 841.89];
const M = 36;

export function hex(h: string): RGB {
  const s = h.replace('#', '');
  const num = parseInt(s.length === 3 ? s.replace(/(.)/g, '$1$1') : s, 16);
  return rgb(((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
}

/** A recorded heading anchor for the PDF outline (bookmarks). `top` is the PDF y of the heading. */
export interface Bookmark {
  title: string;
  level: number; // 0 = page, 1 = section
  page: PDFPage;
  top: number;
}

const PAGE_BG = hex('#f4e8cc'); // parchment
const INK = hex('#3a2a12'); // body text (dark brown)
const HEAD = hex('#5a3a10'); // headings
const MUTED = hex('#6f5732'); // secondary labels
const RULE = hex('#8a6a3e'); // strong rules / box borders
const LINE = hex('#c9b488'); // light ruled row lines
const BAR = hex('#7a5a2e'); // section bar fill (dark gold-brown)
const BAR_TEXT = hex('#f6edd6'); // cream text on the bar
const TH_FILL = hex('#e4d1a0'); // table header fill (light gold)
const ZEBRA = hex('#ece0bd'); // subtle alternating row tint
const BOX_FILL = hex('#fffdf3'); // near-white fillable boxes

export interface Col {
  header: string;
  width: number;
  align?: 'left' | 'right' | 'center';
}

/**
 * Cursor-based PDF form writer with a parchment/gold-brown theme. Draws a clean ruled character sheet
 * split into page-per-section areas; region-aware (two-column layouts), pads tables/lists with blank
 * ruled rows for hand-filling, always renders the same field structure. Text sanitized to WinAnsi.
 */
export class SheetWriter {
  page!: PDFPage;
  y = 0;
  /** Heading anchors collected while drawing, used to build the PDF outline (bookmarks). */
  readonly bookmarks: Bookmark[] = [];
  private colX = M;
  private colW: number;
  private readonly pageW: number;
  private readonly pageH: number;

  constructor(
    readonly doc: PDFDocument,
    readonly font: PDFFont,
    readonly bold: PDFFont,
    private readonly background = true,
    private readonly bgImage?: PDFImage,
  ) {
    const p = doc.addPage(A4);
    this.pageW = p.getWidth();
    this.pageH = p.getHeight();
    this.colW = this.pageW - 2 * M;
    this.page = p;
    this.paintBackground();
    this.y = this.pageH - M;
  }

  /**
   * Paints the background (skipped in white/print mode): the embedded parchment texture stretched over the
   * page if one was provided, otherwise the flat parchment tint. The image is embedded ONCE and merely
   * referenced per page, so it adds only its own (small, pre-compressed) size.
   */
  private paintBackground(): void {
    if (!this.background) return;
    if (this.bgImage) {
      this.page.drawImage(this.bgImage, { x: 0, y: 0, width: this.pageW, height: this.pageH });
    } else {
      this.page.drawRectangle({ x: 0, y: 0, width: this.pageW, height: this.pageH, color: PAGE_BG });
    }
  }

  /** Record a heading anchor at the current cursor for the PDF outline (0 = page, 1 = section). */
  private mark(title: string, level: number): void {
    const t = sanitize(title).trim();
    if (t) this.bookmarks.push({ title: t, level, page: this.page, top: this.y });
  }

  get contentW(): number {
    return this.colW;
  }

  newPage(): void {
    this.page = this.doc.addPage(A4);
    this.paintBackground();
    this.colX = M;
    this.colW = this.pageW - 2 * M;
    this.y = this.pageH - M;
  }

  ensure(h: number): void {
    if (this.y - h < M) this.newPage();
  }

  /** Space left in the current column down to the bottom margin. */
  get availableHeight(): number {
    return this.y - M;
  }

  spacer(h = 6): void {
    this.y -= h;
  }

  private rule(color: RGB = RULE, thickness = 0.5): void {
    this.page.drawLine({ start: { x: this.colX, y: this.y }, end: { x: this.colX + this.colW, y: this.y }, thickness, color });
  }

  // ── Regions / columns ──────────────────────────────────────────────────────────────
  region(x: number, w: number, fn: () => void): void {
    const ox = this.colX;
    const ow = this.colW;
    this.colX = x;
    this.colW = w;
    fn();
    this.colX = ox;
    this.colW = ow;
  }

  twoColumns(leftFn: () => void, rightFn: () => void, gap = 18): void {
    const startY = this.y;
    const half = (this.colW - gap) / 2;
    this.region(this.colX, half, leftFn);
    const leftEnd = this.y;
    this.y = startY;
    this.region(this.colX + half + gap, half, rightFn);
    this.y = Math.min(leftEnd, this.y);
  }

  /** Custom split; RIGHT drawn first (fixed/short), then LEFT (may flow). Cursor ends at LEFT's end. */
  twoColumnBody(leftFn: () => void, rightFn: () => void, leftFraction = 0.5, gap = 18): void {
    const startY = this.y;
    const leftW = (this.colW - gap) * leftFraction;
    const rightW = (this.colW - gap) * (1 - leftFraction);
    const xL = this.colX;
    const xR = this.colX + leftW + gap;
    this.region(xR, rightW, rightFn);
    this.y = startY;
    this.region(xL, leftW, leftFn);
  }

  pushToBottom(reserve: number): void {
    if (this.y > M + reserve) this.y = M + reserve;
  }

  // ── Headings ────────────────────────────────────────────────────────────────────────
  pageHeading(main: string, sub?: string): void {
    this.mark(sub || main, 0);
    this.page.drawText(sanitize(main), { x: this.colX, y: this.y - 18, size: 18, font: this.bold, color: HEAD });
    this.y -= 21;
    if (sub) {
      this.page.drawText(sanitize(sub).toUpperCase(), { x: this.colX, y: this.y - 9, size: 9, font: this.font, color: MUTED });
      this.y -= 13;
    }
    this.rule(RULE, 1.2);
    this.y -= 10;
  }

  /** Page title (left) + 8 attribute boxes on the right, each box border + label in its attribute color. */
  pageTitleAndAttributes(main: string, sub: string, attrs: Array<[string, string, string]>): void {
    const startY = this.y;
    this.mark(sub || main, 0);
    const n = attrs.length;
    const bw = 32;
    const gap = 4;
    const boxH = 20;
    const totalW = n * bw + (n - 1) * gap;
    let x = this.colX + this.colW - totalW;
    for (const [code, val, colorHex] of attrs) {
      const color = hex(colorHex);
      this.page.drawText(sanitize(code), { x: x + 3, y: startY - 8, size: 7, font: this.bold, color });
      this.page.drawRectangle({ x, y: startY - 10 - boxH, width: bw, height: boxH, borderColor: color, borderWidth: 1.2, color: BOX_FILL });
      const vw = this.bold.widthOfTextAtSize(sanitize(val), 12);
      this.page.drawText(sanitize(val), { x: x + (bw - vw) / 2, y: startY - 10 - boxH + 5, size: 12, font: this.bold, color: INK });
      x += bw + gap;
    }
    this.page.drawText(sanitize(main), { x: this.colX, y: startY - 20, size: 20, font: this.bold, color: HEAD });
    if (sub) this.page.drawText(sanitize(sub).toUpperCase(), { x: this.colX, y: startY - 34, size: 9, font: this.font, color: MUTED });
    this.y = startY - 44;
    this.rule(RULE, 1.2);
    this.y -= 10;
  }

  /** Section header as a filled gold-brown bar with cream text; optional right-aligned text (e.g. total AP). */
  section(title: string, right?: string): void {
    this.ensure(28);
    this.mark(title, 1);
    this.y -= 4;
    const barH = 16;
    this.page.drawRectangle({ x: this.colX, y: this.y - barH, width: this.colW, height: barH, color: BAR });
    this.page.drawText(sanitize(title), { x: this.colX + 5, y: this.y - barH + 5, size: 10.5, font: this.bold, color: BAR_TEXT });
    if (right) {
      const rw = this.bold.widthOfTextAtSize(sanitize(right), 9.5);
      this.page.drawText(sanitize(right), { x: this.colX + this.colW - rw - 5, y: this.y - barH + 5, size: 9.5, font: this.bold, color: BAR_TEXT });
    }
    this.y -= barH + 6;
  }

  subtitle(title: string, right?: string): void {
    this.ensure(16);
    this.page.drawText(sanitize(title), { x: this.colX, y: this.y - 10, size: 9.5, font: this.bold, color: HEAD });
    if (right) {
      const rw = this.bold.widthOfTextAtSize(sanitize(right), 8.5);
      this.page.drawText(sanitize(right), { x: this.colX + this.colW - rw, y: this.y - 10, size: 8.5, font: this.bold, color: RULE });
    }
    this.y -= 13;
  }

  boldLine(text: string, size = 9.5): void {
    this.ensure(size + 5);
    this.page.drawText(sanitize(text), { x: this.colX, y: this.y - size, size, font: this.bold, color: HEAD });
    this.y -= size + 5;
  }

  note(text: string, size = 6.5): void {
    this.ensure(size + 3);
    this.page.drawText(sanitize(text), { x: this.colX, y: this.y - size, size, font: this.font, color: MUTED });
    this.y -= size + 3;
  }

  // ── Fields, boxes, grids ─────────────────────────────────────────────────────────────
  formGrid(fields: Array<[string, string]>, cols = 2): void {
    const cw = this.colW / cols;
    const rowH = 19;
    for (let i = 0; i < fields.length; i += cols) {
      this.ensure(rowH);
      fields.slice(i, i + cols).forEach(([label, value], c) => {
        const x = this.colX + c * cw;
        const w = cw - 10;
        const lab = sanitize(label);
        this.page.drawText(lab, { x, y: this.y - 9, size: 8, font: this.bold, color: MUTED });
        const lw = this.bold.widthOfTextAtSize(lab + '  ', 8);
        if (value && w - lw > 4) this.page.drawText(this.fit(value, w - lw, 9), { x: x + lw, y: this.y - 9, size: 9, font: this.font, color: INK });
        this.page.drawLine({ start: { x, y: this.y - 12 }, end: { x: x + w, y: this.y - 12 }, thickness: 0.5, color: LINE });
      });
      this.y -= rowH;
    }
  }

  /** One form row of label+underline fields with custom width fractions (must sum to ~1). */
  formRow(fields: Array<[string, string]>, weights: number[]): void {
    const rowH = 19;
    this.ensure(rowH);
    let x = this.colX;
    fields.forEach(([label, value], i) => {
      const fw = this.colW * weights[i];
      const w = fw - 10;
      const lab = sanitize(label);
      this.page.drawText(lab, { x, y: this.y - 9, size: 8, font: this.bold, color: MUTED });
      const lw = this.bold.widthOfTextAtSize(lab + '  ', 8);
      if (value && w - lw > 4) this.page.drawText(this.fit(value, w - lw, 9), { x: x + lw, y: this.y - 9, size: 9, font: this.font, color: INK });
      this.page.drawLine({ start: { x, y: this.y - 12 }, end: { x: x + w, y: this.y - 12 }, thickness: 0.5, color: LINE });
      x += fw;
    });
    this.y -= rowH;
  }

  keyValues(pairs: Array<[string, string]>, cols = 3): void {
    const cw = this.colW / cols;
    const size = 9;
    const rowH = 15;
    for (let i = 0; i < pairs.length; i += cols) {
      this.ensure(rowH);
      pairs.slice(i, i + cols).forEach(([k, v], c) => {
        const x = this.colX + c * cw;
        const key = sanitize(k + ': ');
        this.page.drawText(key, { x, y: this.y - size, size, font: this.bold, color: MUTED });
        const kw = this.bold.widthOfTextAtSize(key, size);
        this.page.drawText(this.fit(v, cw - kw - 6, size), { x: x + kw, y: this.y - size, size, font: this.font, color: INK });
      });
      this.y -= rowH;
    }
  }

  /** A labeled fillable box (label left, box right filling the column width); box height configurable. */
  fieldBox(label: string, value: string, boxH = 18, labelW = 42): void {
    this.ensure(boxH + 5);
    this.page.drawText(sanitize(label), { x: this.colX, y: this.y - 9, size: 7.5, font: this.bold, color: HEAD });
    const bx = this.colX + labelW;
    const bw = this.colW - labelW;
    this.page.drawRectangle({ x: bx, y: this.y - boxH, width: bw, height: boxH, borderColor: RULE, borderWidth: 0.7, color: BOX_FILL });
    if (value) this.page.drawText(this.fit(value, bw - 6, 8), { x: bx + 4, y: this.y - 11, size: 8, font: this.font, color: INK });
    this.y -= boxH + 5;
  }

  /** A row of small labeled value boxes (tiny label above, value inside). */
  miniBoxes(cells: Array<[string, string]>, boxW = 32, boxH = 16, gap = 5): void {
    this.ensure(boxH + 12);
    let x = this.colX;
    for (const [label, value] of cells) {
      this.page.drawText(sanitize(label), { x, y: this.y - 7, size: 6, font: this.font, color: MUTED });
      this.page.drawRectangle({ x, y: this.y - 8 - boxH, width: boxW, height: boxH, borderColor: RULE, borderWidth: 0.7, color: BOX_FILL });
      const vw = this.bold.widthOfTextAtSize(sanitize(value), 10);
      this.page.drawText(sanitize(value), { x: x + (boxW - vw) / 2, y: this.y - 8 - boxH + 4, size: 10, font: this.bold, color: INK });
      x += boxW + gap;
    }
    this.y -= boxH + 14;
  }

  /** A labeled grid of boxed value cells (row label + one box per column, with a tiny column-header row). */
  boxGrid(colHeaders: string[], rows: Array<[string, string[]]>, labelW = 32, boxH = 15): void {
    const nc = colHeaders.length;
    const gap = 3;
    const boxW = (this.colW - labelW - (nc - 1) * gap) / nc;
    this.ensure((rows.length + 1) * (boxH + 2) + 12);
    // column headers
    let hx = this.colX + labelW;
    for (const h of colHeaders) {
      const tw = this.font.widthOfTextAtSize(sanitize(h), 6);
      this.page.drawText(sanitize(h), { x: hx + Math.max(0, (boxW - tw) / 2), y: this.y - 7, size: 6, font: this.font, color: MUTED });
      hx += boxW + gap;
    }
    this.y -= 10;
    for (const [label, values] of rows) {
      this.page.drawText(sanitize(label), { x: this.colX, y: this.y - boxH + 4, size: 8, font: this.bold, color: HEAD });
      let x = this.colX + labelW;
      for (let i = 0; i < nc; i++) {
        this.page.drawRectangle({ x, y: this.y - boxH, width: boxW, height: boxH, borderColor: RULE, borderWidth: 0.6, color: BOX_FILL });
        const v = values[i] ?? '';
        const vw = this.bold.widthOfTextAtSize(sanitize(v), 8.5);
        this.page.drawText(sanitize(v), { x: x + (boxW - vw) / 2, y: this.y - boxH + 4, size: 8.5, font: this.bold, color: INK });
        x += boxW + gap;
      }
      this.y -= boxH + 2;
    }
    this.y -= 6;
  }

  /**
   * Lebensenergie block (official layout): Max (filled) + a wide blank "Aktuell" box, then the five pain /
   * wound thresholds with their computed LeP values (¾/½/¼ of max, 5, 0). For offline play.
   */
  lifeEnergy(max: number): void {
    this.boldLine('Lebensenergie', 11);
    const boxH = 22;
    const maxW = 40;
    this.page.drawText('Max', { x: this.colX, y: this.y - 7, size: 6.5, font: this.font, color: MUTED });
    this.page.drawRectangle({ x: this.colX, y: this.y - 9 - boxH, width: maxW, height: boxH, borderColor: RULE, borderWidth: 0.8, color: BOX_FILL });
    const mv = this.bold.widthOfTextAtSize(String(max), 13);
    this.page.drawText(String(max), { x: this.colX + (maxW - mv) / 2, y: this.y - 9 - boxH + 7, size: 13, font: this.bold, color: INK });
    const aX = this.colX + maxW + 8;
    this.page.drawText('Aktuell', { x: aX, y: this.y - 7, size: 6.5, font: this.font, color: MUTED });
    this.page.drawRectangle({ x: aX, y: this.y - 9 - boxH, width: this.colW - maxW - 8, height: boxH, borderColor: RULE, borderWidth: 0.8, color: BOX_FILL });
    this.y -= 9 + boxH + 10;

    const thresholds: Array<[number, string]> = [
      [Math.round(max * 0.75), '1/4 verloren (+1 Schmerz)'],
      [Math.round(max * 0.5), '1/2 verloren (+1 Schmerz)'],
      [Math.round(max * 0.25), '3/4 verloren (+1 Schmerz)'],
      [5, '5 oder niedriger (+1 Schmerz)'],
      [0, '0 oder weniger (Held liegt im Sterben)'],
    ];
    const tW = 32;
    const tH = 15;
    for (const [val, text] of thresholds) {
      this.page.drawRectangle({ x: this.colX, y: this.y - tH, width: tW, height: tH, borderColor: RULE, borderWidth: 0.7, color: BOX_FILL });
      const vw = this.bold.widthOfTextAtSize(String(val), 9);
      this.page.drawText(String(val), { x: this.colX + (tW - vw) / 2, y: this.y - tH + 4, size: 9, font: this.bold, color: INK });
      this.page.drawText(sanitize(text), { x: this.colX + tW + 6, y: this.y - tH + 4, size: 7.5, font: this.font, color: INK });
      this.y -= tH + 3;
    }
    this.y -= 6;
  }

  /** "<label> [Max box]  Aktuell [wide box]" row (e.g. AsP/KaP pool). */
  maxCurrentRow(maxLabel: string, maxVal: number): void {
    const boxH = 24;
    const maxW = 48;
    this.page.drawText(sanitize(maxLabel), { x: this.colX, y: this.y - 8, size: 7, font: this.font, color: MUTED });
    this.page.drawRectangle({ x: this.colX, y: this.y - 10 - boxH, width: maxW, height: boxH, borderColor: RULE, borderWidth: 0.8, color: BOX_FILL });
    const mv = this.bold.widthOfTextAtSize(String(maxVal), 14);
    this.page.drawText(String(maxVal), { x: this.colX + (maxW - mv) / 2, y: this.y - 10 - boxH + 8, size: 14, font: this.bold, color: INK });
    const aX = this.colX + maxW + 8;
    this.page.drawText('Aktuell', { x: aX, y: this.y - 8, size: 7, font: this.font, color: MUTED });
    this.page.drawRectangle({ x: aX, y: this.y - 10 - boxH, width: this.colW - maxW - 8, height: boxH, borderColor: RULE, borderWidth: 0.8, color: BOX_FILL });
    this.y -= 10 + boxH + 10;
  }

  /**
   * Spell/liturgy table: each entry is a main row PLUS a thin indented "Erw.:" sub-row where its
   * extensions are listed (or left blank to hand-write). Pads with blank main+sub rows up to `minRows`.
   */
  magicTable(cols: Col[], rows: Array<{ cells: string[]; ext: string }>, opts: { minRows?: number; rowH?: number } = {}): void {
    const rowH = opts.rowH ?? 13;
    const size = Math.min(8, rowH - 5);
    const extH = 11;
    const data = rows.slice();
    while (data.length < (opts.minRows ?? 0)) data.push({ cells: cols.map(() => ''), ext: '' });

    const header = (): void => {
      this.ensure(rowH * 2 + extH);
      this.page.drawRectangle({ x: this.colX, y: this.y - rowH, width: this.colW, height: rowH, color: TH_FILL });
      let x = this.colX + 3;
      const bl = this.y - size - 3;
      for (const col of cols) {
        this.cellAt(col.header, x, col.width - 5, size, this.bold, HEAD, col.align, bl);
        x += col.width;
      }
      this.y -= rowH;
      this.rule(RULE, 0.8);
    };

    header();
    for (const r of data) {
      if (this.y - (rowH + extH) < M) {
        this.newPage();
        header();
      }
      let x = this.colX + 3;
      const bl = this.y - size - 3;
      cols.forEach((col, ci) => {
        this.cellAt(r.cells[ci] ?? '', x, col.width - 5, size, this.font, INK, col.align, bl);
        x += col.width;
      });
      this.y -= rowH;
      const extText = r.ext ? `Erw.: ${r.ext}` : 'Erw.:';
      this.page.drawText(this.fit(extText, this.colW - 16, 7), { x: this.colX + 12, y: this.y - extH + 3.5, size: 7, font: this.font, color: MUTED });
      this.y -= extH;
      this.rule(LINE, 0.4);
    }
    this.y -= 8;
  }

  // ── Tables & lists ───────────────────────────────────────────────────────────────────
  table(cols: Col[], rows: string[][], opts: { minRows?: number; rowH?: number } = {}): void {
    const rowH = opts.rowH ?? 15;
    const size = Math.min(8.5, rowH - 5.5);
    const data = rows.slice();
    while (data.length < (opts.minRows ?? 0)) data.push(cols.map(() => ''));

    const header = (): void => {
      this.ensure(rowH * 2);
      this.page.drawRectangle({ x: this.colX, y: this.y - rowH, width: this.colW, height: rowH, color: TH_FILL });
      let x = this.colX + 3;
      const baseline = this.y - size - 3.5;
      for (const col of cols) {
        this.cellAt(col.header, x, col.width - 5, size, this.bold, HEAD, col.align, baseline);
        x += col.width;
      }
      this.y -= rowH;
      this.rule(RULE, 0.8);
    };

    header();
    data.forEach((r, ri) => {
      if (this.y - rowH < M) {
        this.newPage();
        header();
      }
      if (ri % 2 === 1) this.page.drawRectangle({ x: this.colX, y: this.y - rowH, width: this.colW, height: rowH, color: ZEBRA });
      let x = this.colX + 3;
      const baseline = this.y - size - 3.5;
      cols.forEach((col, ci) => {
        this.cellAt(r[ci] ?? '', x, col.width - 5, size, this.font, INK, col.align, baseline);
        x += col.width;
      });
      this.y -= rowH;
      this.rule(LINE, 0.4);
    });
    this.y -= 8;
  }

  paragraph(text: string, size = 9, indent = 0): void {
    const maxW = this.colW - indent;
    const words = sanitize(text).split(/\s+/).filter(Boolean);
    let line = '';
    const flush = (): void => {
      if (!line) return;
      this.ensure(size + 4);
      this.page.drawText(line, { x: this.colX + indent, y: this.y - size, size, font: this.font, color: INK });
      this.y -= size + 4;
      line = '';
    };
    for (const wd of words) {
      const test = line ? line + ' ' + wd : wd;
      if (this.font.widthOfTextAtSize(test, size) > maxW) {
        flush();
        line = wd;
      } else {
        line = test;
      }
    }
    flush();
  }

  inlineList(label: string, items: string[]): void {
    if (items.length) this.paragraph(label + ': ' + items.join(', '));
  }

  /** Word-wrap `text` to `maxW`, returning the lines (pure — used to measure + draw boxes). */
  private wrapLines(text: string, maxW: number, size: number, font: PDFFont): string[] {
    const words = sanitize(text).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';
    for (const wd of words) {
      const test = line ? line + ' ' + wd : wd;
      if (line && font.widthOfTextAtSize(test, size) > maxW) {
        lines.push(line);
        line = wd;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  /** Renders `items` as bordered boxes across `cols` columns (used for the Homebrew page). Each box has a
   *  bold title (+ optional right-aligned meta) and `[label, value]` detail rows whose values word-wrap.
   *  Boxes flow down each column; assumes they fit the page (homebrew is small). */
  boxColumns(items: Array<{ title: string; right?: string; fields: Array<[string, string]> }>, cols: number): void {
    const gap = 12;
    const cw = (this.colW - gap * (cols - 1)) / cols;
    const startY = this.y;
    const per = Math.ceil(items.length / cols);
    let minY = startY;
    for (let c = 0; c < cols; c++) {
      const slice = items.slice(c * per, (c + 1) * per);
      if (!slice.length) break;
      this.region(this.colX + c * (cw + gap), cw, () => {
        this.y = startY;
        for (const it of slice) this.drawBox(it);
      });
      minY = Math.min(minY, this.y);
    }
    this.y = minY;
  }

  private drawBox(item: { title: string; right?: string; fields: Array<[string, string]> }): void {
    const pad = 6;
    const titleSize = 9.5;
    const valSize = 8;
    const lineH = valSize + 3;
    const innerW = this.colW - pad * 2;
    const lines: string[] = [];
    for (const [label, value] of item.fields) {
      if (!value?.trim()) continue;
      for (const l of this.wrapLines(`${label}: ${value}`, innerW, valSize, this.font)) lines.push(l);
    }
    const boxH = pad + (titleSize + 5) + lines.length * lineH + pad;
    if (this.y - boxH < M) this.newPage();
    const top = this.y;
    this.page.drawRectangle({ x: this.colX, y: top - boxH, width: this.colW, height: boxH, borderColor: RULE, borderWidth: 0.8, color: BOX_FILL });
    const rightW = item.right ? this.bold.widthOfTextAtSize(sanitize(item.right), 7.5) : 0;
    this.page.drawText(this.fit(item.title, innerW - rightW - 6, titleSize, this.bold), { x: this.colX + pad, y: top - pad - titleSize, size: titleSize, font: this.bold, color: HEAD });
    if (item.right) this.page.drawText(sanitize(item.right), { x: this.colX + this.colW - pad - rightW, y: top - pad - titleSize, size: 7.5, font: this.bold, color: MUTED });
    let ty = top - pad - (titleSize + 5);
    for (const l of lines) {
      this.page.drawText(l, { x: this.colX + pad, y: ty - valSize, size: valSize, font: this.font, color: INK });
      ty -= lineH;
    }
    this.y = top - boxH - 8;
  }

  /** Ruled list of `[name, rightText]` rows (name left, value right-aligned), + `extraBlank` empty lines. */
  entryLines(items: Array<[string, string]>, extraBlank = 0): void {
    const rowH = 15;
    const total = items.length + extraBlank;
    for (let i = 0; i < total; i++) {
      if (this.y - rowH < M) this.newPage();
      const it = items[i];
      if (it) {
        const [name, right] = it;
        const rw = right ? this.bold.widthOfTextAtSize(sanitize(right), 8.5) : 0;
        this.page.drawText(this.fit(name, this.colW - rw - 12, 9), { x: this.colX, y: this.y - 10, size: 9, font: this.font, color: INK });
        if (right) this.page.drawText(sanitize(right), { x: this.colX + this.colW - rw, y: this.y - 10, size: 8.5, font: this.bold, color: RULE });
      }
      this.page.drawLine({ start: { x: this.colX, y: this.y - 13 }, end: { x: this.colX + this.colW, y: this.y - 13 }, thickness: 0.4, color: LINE });
      this.y -= rowH;
    }
    this.y -= 4;
  }

  /**
   * Adaptive multi-column ruled list that always fits within `maxHeight`. Uses as few columns as possible
   * (up to `maxCols`); if the entries still don't fit the height even at maxCols, the line spacing shrinks
   * so they always fit. Names are truncated with "…", but the level (suffix) and the right value (AP) are
   * always kept. A few blank ruled lines are added when there's room. Advances the cursor by the block it used.
   */
  flowEntries(items: Array<{ name: string; level?: string; right?: string }>, maxHeight: number, opts: { minBlank?: number; maxCols?: number; minCols?: number } = {}): void {
    const minBlank = opts.minBlank ?? 0;
    const maxCols = Math.max(opts.maxCols ?? 3, opts.minCols ?? 1);
    let lineH = 13;
    const startY = this.y;
    const maxRows = Math.max(1, Math.floor(maxHeight / lineH));

    // Fewest columns (but at least minCols) so items+blanks fit the height; grow to maxCols, then shrink lineH.
    let cols = Math.max(1, opts.minCols ?? 1);
    while (cols < maxCols && items.length + minBlank > cols * maxRows) cols++;
    let rows = Math.ceil((items.length + minBlank) / cols);
    if (rows > maxRows) {
      rows = maxRows;
      if (items.length > cols * rows) {
        rows = Math.ceil(items.length / cols);
        lineH = maxHeight / rows; // shrink spacing so every item fits
      }
    }
    const linesToDraw = Math.min(cols * rows, items.length + minBlank);
    const colGap = 8;
    const colW = (this.colW - (cols - 1) * colGap) / cols;
    const size = Math.min(8.5, lineH - 4.5);

    for (let i = 0; i < linesToDraw; i++) {
      const col = Math.floor(i / rows);
      const r = i % rows;
      const x = this.colX + col * (colW + colGap);
      const top = startY - r * lineH;
      this.page.drawLine({ start: { x, y: top - lineH + 2 }, end: { x: x + colW, y: top - lineH + 2 }, thickness: 0.4, color: LINE });
      const it = items[i];
      if (!it) continue;
      const baseline = top - lineH + 4.5;
      const right = it.right ?? '';
      const rw = right ? this.bold.widthOfTextAtSize(sanitize(right), size - 1) : 0;
      if (right) this.page.drawText(sanitize(right), { x: x + colW - rw, y: baseline, size: size - 1, font: this.bold, color: RULE });
      const lvl = it.level ? ` ${it.level}` : '';
      const lw = lvl ? this.font.widthOfTextAtSize(sanitize(lvl), size) : 0;
      const name = this.fit(it.name, Math.max(6, colW - rw - lw - 6), size);
      this.page.drawText(sanitize(name) + lvl, { x, y: baseline, size, font: this.font, color: INK });
    }
    this.y = startY - rows * lineH - 4;
  }

  /** Ruled list of items, then `extraBlank` empty ruled lines after the last item (hand-fill space). */
  lineItems(items: string[], extraBlank = 0): void {
    const rowH = 15;
    const total = items.length + extraBlank;
    for (let i = 0; i < total; i++) {
      if (this.y - rowH < M) this.newPage();
      const t = items[i];
      if (t) this.page.drawText(this.fit(t, this.colW - 4, 9), { x: this.colX, y: this.y - 10, size: 9, font: this.font, color: INK });
      this.page.drawLine({ start: { x: this.colX, y: this.y - 13 }, end: { x: this.colX + this.colW, y: this.y - 13 }, thickness: 0.4, color: LINE });
      this.y -= rowH;
    }
    this.y -= 4;
  }

  private cellAt(text: string, x: number, w: number, size: number, font: PDFFont, color: RGB, align: Col['align'], baseline: number): void {
    const s = this.fit(text, w, size, font);
    const tw = font.widthOfTextAtSize(s, size);
    const tx = align === 'right' ? x + w - tw : align === 'center' ? x + (w - tw) / 2 : x;
    this.page.drawText(s, { x: tx, y: baseline, size, font, color });
  }

  private fit(text: string, w: number, size: number, font: PDFFont = this.font): string {
    let s = sanitize(text);
    if (font.widthOfTextAtSize(s, size) <= w) return s;
    while (s.length && font.widthOfTextAtSize(s + '...', size) > w) s = s.slice(0, -1);
    return s + '...';
  }
}

/** pdf-lib StandardFonts use WinAnsi; normalize typographic chars and drop anything it can't encode. */
export function sanitize(text: string): string {
  return (text ?? '')
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\t\n\r\x20-\x7E -ÿ€]/g, '');
}

/** 1→I, 2→II … (advantage/disadvantage & language levels). Falls back to the number for >12. */
export function roman(n: number): string {
  const table: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  if (n <= 0 || n > 12) return String(n);
  let out = '';
  let rest = n;
  for (const [v, s] of table) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}
