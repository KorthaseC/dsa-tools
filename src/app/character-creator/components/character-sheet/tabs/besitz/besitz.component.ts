import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { ALL_ITEMS } from '../../../../constants/item.const';
import { ITEM_PACKAGES } from '../../../../constants/item-package.const';
import { ALL_MELEE_WEAPONS } from '../../../../constants/melee-weapon.const';
import { ALL_RANGED_WEAPONS } from '../../../../constants/ranged-weapon.const';
import { ALL_ARMOR } from '../../../../constants/armor.const';
import { ALL_SHIELDS } from '../../../../constants/shield.const';
import { ActionSelectDirective } from '../../../../directives/action-select.directive';
import { Currency, EquipmentItem } from '../../../../models/base-creation.model';
import { CharacterStateService } from '../../../../services/character-state.service';

interface CatalogRow {
  key: string;
  label: string;
  type: string;
  weight: number;
  price: number;
  defaultQuantity?: number;
}

// Unified equipment catalog: general items PLUS weapons / armor / shields, so all can be picked into the
// equipment list (as a plain Name/Anzahl/Wert/Gewicht row). Weapons/armor/shields get a synthetic `type`
// for the filter and a prefixed key so their slugs never collide with item slugs — and package expansion,
// which is keyed by the (unprefixed) item slug, keeps working.
const CATALOG: CatalogRow[] = [
  ...ALL_ITEMS.map((i) => ({ key: i.name, label: i.label, type: i.type, weight: i.weight ?? 0, price: i.price ?? 0, defaultQuantity: i.defaultQuantity })),
  ...ALL_MELEE_WEAPONS.map((w) => ({ key: `w:${w.name}`, label: w.label, type: 'Nahkampfwaffe', weight: w.weight ?? 0, price: w.price ?? 0 })),
  ...ALL_RANGED_WEAPONS.map((w) => ({ key: `r:${w.name}`, label: w.label, type: 'Fernkampfwaffe', weight: w.weight ?? 0, price: w.price ?? 0 })),
  ...ALL_ARMOR.map((a) => ({ key: `a:${a.name}`, label: a.label, type: 'Rüstung', weight: a.weight ?? 0, price: a.price ?? 0 })),
  ...ALL_SHIELDS.map((s) => ({ key: `s:${s.name}`, label: s.label, type: 'Schild', weight: s.weight ?? 0, price: s.price ?? 0 })),
];
const CATALOG_BY_KEY = new Map(CATALOG.map((r) => [r.key, r]));
const ITEM_BY_LABEL = new Map(ALL_ITEMS.map((i) => [i.label.toLowerCase(), i])); // resolve package contents (by label)
const CATALOG_TYPES = [...new Set(CATALOG.flatMap((r) => r.type.split(',').map((t) => t.trim()).filter(Boolean)))]
  .sort((a, b) => a.localeCompare(b, 'de'))
  .map((t) => ({ label: t, value: t }));

@Component({
  selector: 'app-cs-besitz',
  imports: [FormsModule, DecimalPipe, ButtonModule, InputNumber, InputTextModule, SelectModule, TableModule, TextareaModule, TooltipModule, ActionSelectDirective],
  templateUrl: './besitz.component.html',
  styleUrl: './besitz.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BesitzComponent {
  private state = inject(CharacterStateService);

  // Return a COPY, not the live `equipment.general` reference: p-table's row reorder mutates the bound
  // array IN PLACE (ObjectUtils.reorderArray) before emitting (onRowReorder), so binding the live array
  // would double-apply the move (PrimeNG's in-place reorder + our onRowReorder handler) → item lands in
  // the wrong slot. PrimeNG now mutates a throwaway copy; onRowReorder is the single source of the move.
  readonly items = computed<EquipmentItem[]>(() => [...(this.state.character()?.equipment.general ?? [])]);
  readonly currency = computed<Currency>(() => this.state.character()?.currency ?? { ducats: 0, silverthalers: 0, haler: 0, kreutzer: 0 });

  /** Tragkraft = KK × 2 (in Stein). */
  readonly carryingCapacity = computed(() => (this.state.character()?.attributes.strength ?? 0) * 2);

  readonly totalWeight = computed(() => this.items().reduce((sum, it) => sum + (it.weight ?? 0) * (it.quantity ?? 1), 0));
  readonly totalValue = computed(() => this.items().reduce((sum, it) => sum + (it.value ?? 0) * (it.quantity ?? 1), 0));

  readonly currencyFields: { key: keyof Currency; label: string }[] = [
    { key: 'ducats', label: 'Dukaten' },
    { key: 'silverthalers', label: 'Silbertaler' },
    { key: 'haler', label: 'Heller' },
    { key: 'kreutzer', label: 'Kreuzer' },
  ];

  // ── Catalog picker (search dropdown + type filter) ──────────────────────────────
  readonly itemTypes = CATALOG_TYPES;
  readonly typeFilter = signal<string | null>(null);
  readonly addFromCatalogModel = signal<string | null>(null);

  /** Catalog options, narrowed by the selected type; value = catalog key, label + price for display. */
  readonly catalogOptions = computed(() => {
    const ty = this.typeFilter();
    const list = ty ? CATALOG.filter((r) => r.type.split(',').some((t) => t.trim() === ty)) : CATALOG;
    return list.map((r) => ({ label: r.label, value: r.key, price: r.price }));
  });

  addItem(): void {
    this.state.updateEquipmentList('general', (list) => [...list, { name: '', quantity: 1 }]);
  }

  /**
   * Append a catalog pick as pre-filled row(s). A Komplettpaket expands into ALL its contained items
   * (weight/value resolved from the catalog by label where available, plus "Wo getragen" from the PDF);
   * any other catalog entry — general item, weapon, armor or shield — adds one Name/Anzahl/Wert/Gewicht
   * row. Free-text rows stay possible via the manual "Gegenstand hinzufügen".
   */
  addFromCatalog(key: string | null): void {
    this.addFromCatalogModel.set(null);
    if (!key) return;
    const pkg = ITEM_PACKAGES[key];
    if (pkg) {
      const rows: EquipmentItem[] = pkg.map((pc) => {
        const cat = ITEM_BY_LABEL.get(pc.name.toLowerCase());
        return { name: pc.name, quantity: pc.quantity, value: cat?.price ?? 0, weight: cat?.weight ?? 0, ...(pc.carriedWhere ? { carriedWhere: pc.carriedWhere } : {}) };
      });
      this.state.updateEquipmentList('general', (list) => [...list, ...rows]);
      return;
    }
    const row = CATALOG_BY_KEY.get(key);
    if (!row) return;
    this.state.updateEquipmentList('general', (list) => [
      ...list,
      { name: row.label, quantity: row.defaultQuantity ?? 1, value: row.price, weight: row.weight },
    ]);
  }

  removeItem(index: number): void {
    this.state.updateEquipmentList('general', (list) => list.filter((_, i) => i !== index));
  }

  updateItem<K extends keyof EquipmentItem>(index: number, field: K, value: EquipmentItem[K]): void {
    this.state.updateEquipmentList('general', (list) => list.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  updateCoin(key: keyof Currency, value: number | null): void {
    this.state.updateCurrency({ [key]: value ?? 0 });
  }

  updateCurrencyText(key: keyof Currency, value: string): void {
    this.state.updateCurrency({ [key]: value });
  }

  // Track rows by INDEX: updateItem replaces the row object on every keystroke, and without a stable
  // trackBy the p-table recreates that row's DOM → the number input loses focus mid-typing. Index
  // tracking keeps the DOM row per position (items have no stable id); reorder re-binds each position.
  readonly trackByIndex = (index: number): number => index;

  // ─── Row reorder (desktop drag via pReorderableRow, mobile via the touch buttons) ───────────────
  moveItemUp(index: number): void {
    if (index === 0) return;
    this.state.updateEquipmentList('general', (list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moveItemDown(index: number): void {
    this.state.updateEquipmentList('general', (list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  onRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    this.state.updateEquipmentList('general', (list) => {
      const r = [...list];
      const [moved] = r.splice(event.dragIndex!, 1);
      r.splice(event.dropIndex!, 0, moved);
      return r;
    });
  }
}
