import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

import { formatBookReference } from '../../../../utils/utils';
import { ALL_SPELLS } from '../../../../constants/spell.const';
import { ALL_RITUALS } from '../../../../constants/ritual.const';
import { ALL_LITURGIES } from '../../../../constants/liturgy.const';
import { ALL_CEREMONIES } from '../../../../constants/ceremony.const';
import { IncreaseFactor, SpellExtension } from '../../../../models/magic.model';
import { createExtension, createEmptyMagicRow, MagicExtension, MagicRow } from '../../../../models/magic-row.model';
import { DiceRollService } from '../../../../../shared/dice-roll.service';
import { ATTR_COLORS } from '../../../../constants/attribute-colors.const';
import { CharacterStateService } from '../../../../services/character-state.service';
import { ActionSelectDirective } from '../../../../directives/action-select.directive';
import { RuleLinkComponent } from '../../../rule-link/rule-link.component';
import { D20RollButtonComponent } from '../../../d20-roll/d20-roll-button.component';

export type MagicMode = 'spell' | 'liturgy';

// Common shape for spell/ritual and liturgy/ceremony catalog entries (union-friendly).
interface CatalogEntry {
  name: string;
  label: string;
  check: [string, string, string];
  increaseFactor: IncreaseFactor;
  trait?: string;
  aspect?: string;
  cost?: string;
  castTime?: string;
  range?: string;
  duration?: string;
  target?: string;
  effect?: string;
  page?: string;
  url?: string;
  extensions?: SpellExtension[];
}

interface MagicLabels {
  name: string;
  selectPlaceholder: string;
  castTime: string;
  trait: string;
  extensions: string;
  addButton: string;
  deleteMessage: string;
}

const SPELL_LABELS: MagicLabels = {
  name: 'Zauber / Ritual',
  selectPlaceholder: 'Zauber wählen …',
  castTime: 'Zauberdauer',
  trait: 'Merkmal',
  extensions: 'Zaubererweiterungen',
  addButton: 'Zauber hinzufügen',
  deleteMessage: 'Zauber entfernen?',
};
const LITURGY_LABELS: MagicLabels = {
  name: 'Liturgie / Zeremonie',
  selectPlaceholder: 'Liturgie wählen …',
  castTime: 'Liturgiedauer',
  trait: 'Aspekt',
  extensions: 'Erweiterungen',
  addButton: 'Liturgie hinzufügen',
  deleteMessage: 'Liturgie entfernen?',
};

@Component({
  selector: 'app-cs-magic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonModule, ConfirmPopupModule, InputNumber, InputTextModule, SelectModule, TableModule, TooltipModule, ActionSelectDirective, RuleLinkComponent, D20RollButtonComponent],
  templateUrl: './magic.component.html',
  styleUrl: './magic.component.scss',
})
export class MagicComponent {
  private diceService = inject(DiceRollService);
  private confirmationService = inject(ConfirmationService);
  private state = inject(CharacterStateService);

  /** 'spell' → Zauber & Rituale (character.spells); 'liturgy' → Liturgien & Zeremonien (character.liturgies). */
  readonly mode = input<MagicMode>('spell');

  readonly labels = computed<MagicLabels>(() => (this.mode() === 'liturgy' ? LITURGY_LABELS : SPELL_LABELS));

  readonly magicRows = computed<MagicRow[]>(() => {
    const c = this.state.character();
    // Return a COPY: the p-table reorders the bound array IN PLACE before emitting (onRowReorder), so
    // binding the live state array would double-apply the move (PrimeNG + our onRowReorder) → the row
    // lands in the wrong slot. Same fix as the Besitz tab. Covers spells AND liturgies (shared mode).
    return [...((this.mode() === 'liturgy' ? c?.liturgies : c?.spells) ?? [])];
  });
  readonly expandedRows = signal<{ [id: string]: boolean }>({});

  readonly trackById = (_index: number, row: { id: string }) => row.id;

  // ─── Dropdown options ───────────────────────────────────────────────────────

  private readonly allEntries = computed<CatalogEntry[]>(() => {
    const list: CatalogEntry[] = this.mode() === 'liturgy' ? [...ALL_LITURGIES, ...ALL_CEREMONIES] : [...ALL_SPELLS, ...ALL_RITUALS];
    return list.sort((a, b) => a.label.localeCompare(b.label, 'de'));
  });

  readonly spellOptions = computed(() => this.allEntries().map((s) => ({ label: s.label, value: s.name })));

  readonly attributeOptions = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'];
  readonly increaseFactorOptions = Object.values(IncreaseFactor);

  private readonly spellMap = computed(() => new Map<string, CatalogEntry>(this.allEntries().map((s) => [s.name, s])));

  /** Regelwiki URL of the row's catalog entry (for the external rule link), if any. */
  ruleUrl(row: MagicRow): string | undefined {
    return this.spellMap().get(row.spellName)?.url;
  }

  // ─── List dispatch (spells vs liturgies) ─────────────────────────────────────

  private updateList(updater: (rows: MagicRow[]) => MagicRow[]): void {
    if (this.mode() === 'liturgy') this.state.updateLiturgies(updater);
    else this.state.updateSpells(updater);
  }

  // ─── Row management ─────────────────────────────────────────────────────────

  addRow(): void {
    const newRow = createEmptyMagicRow();
    this.updateList((rows) => [...rows, newRow]);
    this.expandedRows.update((rows) => ({ ...rows, [newRow.id]: true }));
  }

  removeRow(id: string): void {
    this.updateList((rows) => rows.filter((r) => r.id !== id));
    this.expandedRows.update(({ [id]: _, ...rest }) => rest);
  }

  confirmDelete(id: string, event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: this.labels().deleteMessage,
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => this.removeRow(id),
    });
  }

  // ─── Row reorder ────────────────────────────────────────────────────────────

  moveRowUp(index: number): void {
    if (index === 0) return;
    this.updateList((list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moveRowDown(index: number): void {
    this.updateList((list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  onRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    this.updateList((list) => {
      const reordered = [...list];
      const [moved] = reordered.splice(event.dragIndex!, 1);
      reordered.splice(event.dropIndex!, 0, moved);
      return reordered;
    });
  }

  onExpandedRowsChange(value: { [id: string]: boolean }): void {
    this.expandedRows.set(value);
  }

  // ─── Field updates ─────────────────────────────────────────────────────────

  updateField<K extends keyof MagicRow>(id: string, field: K, value: MagicRow[K]): void {
    this.updateList((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  onSpellSelect(rowId: string, spellName: string): void {
    const entry = this.spellMap().get(spellName);
    if (!entry) return;
    // In liturgy mode the "trait" column shows the Aspekt; in spell mode the Merkmal.
    const trait = this.mode() === 'liturgy' ? ((entry as { aspect?: string }).aspect ?? '') : ((entry as { trait?: string }).trait ?? '');
    // Detail fields (Kosten/Reichweite/…) live on the catalog entry itself (single source).
    const d = entry as Partial<{ cost: string; castTime: string; range: string; duration: string; target: string; effect: string; page: string }>;

    this.updateList((rows) =>
      rows.map((r) =>
        r.id === rowId
          ? {
              ...r,
              spellName,
              probe: [...(entry.check as [string, string, string])],
              trait,
              increaseFactor: entry.increaseFactor,
              cost: d.cost ?? '',
              castTime: d.castTime ?? '',
              range: d.range ?? '',
              duration: d.duration ?? '',
              target: d.target ?? '',
              effect: d.effect ?? '',
              page: d.page ?? '',
              extensions: [], // previous spell's extensions no longer apply
            }
          : r
      )
    );
  }

  // ─── Extensions ────────────────────────────────────────────────────────────

  /** Catalog extensions (Erweiterungen) defined for the row's selected spell/liturgy. */
  catalogExtensions(row: MagicRow): SpellExtension[] {
    return this.spellMap().get(row.spellName)?.extensions ?? [];
  }

  /**
   * Tooltip for the "Seite / Regelwerk" field: the book's full title. Empty when nothing can be
   * added — an unresolvable reference would otherwise produce a tooltip repeating the field itself.
   */
  bookTooltip(page: string | undefined): string {
    const resolved = formatBookReference(page);
    return resolved === (page ?? '').trim() ? '' : resolved;
  }

  /** Display label for an extension: name with its required FW and AP cost, e.g. "Größere Reichweite (FW 8, 2 AP)". */
  private formatExt(ext: SpellExtension): string {
    return `${ext.label} (FW ${ext.requiredSkillValue}, ${ext.apCost} AP)`;
  }

  /** Options for the "add extension" dropdown: every catalog extension not yet chosen (FW is validated later via a message). */
  extOptions(row: MagicRow): { label: string; value: string }[] {
    const chosen = new Set(row.extensions.map((e) => e.name));
    return this.catalogExtensions(row)
      .filter((ext) => !chosen.has(ext.name))
      .map((ext) => ({ label: this.formatExt(ext), value: ext.name }));
  }

  /** Label for an already-chosen extension (falls back to the raw stored name for legacy rows). */
  extLabel(row: MagicRow, name: string): string {
    const ext = this.catalogExtensions(row).find((e) => e.name === name);
    return ext ? this.formatExt(ext) : name;
  }

  addExtensionByName(rowId: string, name: string | null): void {
    if (!name) return;
    this.updateList((rows) =>
      rows.map((r) => (r.id === rowId && !r.extensions.some((e) => e.name === name) ? { ...r, extensions: [...r.extensions, createExtension(name)] } : r))
    );
  }

  removeExtension(rowId: string, extId: string): void {
    this.updateList((rows) => rows.map((r) => (r.id === rowId ? { ...r, extensions: r.extensions.filter((e) => e.id !== extId) } : r)));
  }

  getExtensions(row: MagicRow): MagicExtension[] {
    return row.extensions;
  }

  // ─── Dice roll ─────────────────────────────────────────────────────────────

  rollCheck(probe: [string, string, string]): void {
    const [a, b, c] = probe;
    this.diceService.roll('1d20', ATTR_COLORS[a as keyof typeof ATTR_COLORS] ?? '#ffffff');
    this.diceService.add('1d20', ATTR_COLORS[b as keyof typeof ATTR_COLORS] ?? '#ffffff');
    this.diceService.add('1d20', ATTR_COLORS[c as keyof typeof ATTR_COLORS] ?? '#ffffff');
  }
}
