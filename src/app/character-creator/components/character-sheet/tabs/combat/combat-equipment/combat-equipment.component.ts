import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

import { MELEE_COMBAT_TECHNIQUES } from '../../../../../constants/combat-technique-melee.const';
import { RANGED_COMBAT_TECHNIQUES } from '../../../../../constants/combat-technique-ranged.const';
import { ALL_MELEE_WEAPONS } from '../../../../../constants/melee-weapon.const';
import { ALL_RANGED_WEAPONS } from '../../../../../constants/ranged-weapon.const';
import { ALL_ARMOR } from '../../../../../constants/armor.const';
import { ALL_SHIELDS } from '../../../../../constants/shield.const';
import { Attribute, Attributes, EquipmentItem } from '../../../../../models/base-creation.model';
import { CombatTechniqueDefinition } from '../../../../../models/combat-technique.model';
import { Belastungsstufe, createEmptyMeleeWeaponRow, meleeWeaponItemToRow, MeleeWeaponRow, Reichweite } from '../../../../../models/melee-weapon.model';
import { createEmptyRangedWeaponRow, rangedWeaponItemToRow, RangedWeaponRow } from '../../../../../models/ranged-weapon.model';
import { armorItemToRow, ArmorRow, createEmptyArmorRow } from '../../../../../models/armor-row.model';
import { createEmptyShieldRow, shieldItemToRow, ShieldRow } from '../../../../../models/shield-row.model';
import { CharacterStateService } from '../../../../../services/character-state.service';
import { DiceRollService } from '../../../../../../shared/dice-roll.service';

// Weapon/armor/shield catalogs by label (for the searchable weapon dropdowns). Labels are unique enough
// to resolve a pick; picking maps the catalog entry onto the row via the model's *ItemToRow helper.
const MELEE_BY_LABEL = new Map(ALL_MELEE_WEAPONS.map((w) => [w.label, w]));
const RANGED_BY_LABEL = new Map(ALL_RANGED_WEAPONS.map((w) => [w.label, w]));
const ARMOR_BY_LABEL = new Map(ALL_ARMOR.map((a) => [a.label, a]));
const SHIELD_BY_LABEL = new Map(ALL_SHIELDS.map((s) => [s.label, s]));
const byDe = (a: string, b: string) => a.localeCompare(b, 'de');
const MELEE_LABELS = [...MELEE_BY_LABEL.keys()].sort(byDe);
const RANGED_LABELS = [...RANGED_BY_LABEL.keys()].sort(byDe);
const ARMOR_LABELS = [...ARMOR_BY_LABEL.keys()].sort(byDe);
const SHIELD_LABELS = [...SHIELD_BY_LABEL.keys()].sort(byDe);
const filterLabels = (labels: string[], query: string): string[] => {
  const q = (query ?? '').toLowerCase();
  return (q ? labels.filter((l) => l.toLowerCase().includes(q)) : labels).slice(0, 50);
};
/** p-autocomplete onSelect event value → the picked label (string suggestions). */
const acLabel = (e: { value: unknown }): string => (typeof e.value === 'string' ? e.value : ((e.value as { label?: string })?.label ?? ''));

const ATTR_KEY: Record<Attribute, keyof Attributes> = {
  MU: 'courage',
  KL: 'sagacity',
  IN: 'intuition',
  CH: 'charisma',
  FF: 'dexterity',
  GE: 'agility',
  KO: 'constitution',
  KK: 'strength',
};

@Component({
  selector: 'app-cs-combat-equipment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AccordionModule, ButtonModule, ConfirmPopupModule, InputNumber, InputTextModule, SelectModule, AutoCompleteModule, TableModule, TooltipModule],
  templateUrl: './combat-equipment.component.html',
  styleUrl: './combat-equipment.component.scss',
})
export class CombatEquipmentComponent {
  private state = inject(CharacterStateService);
  private diceService = inject(DiceRollService);
  private confirmationService = inject(ConfirmationService);

  readonly character = this.state.character;

  private readonly LS_KEY = 'dsa-combat-equipment-open-panels';

  readonly openPanels = signal<string[]>(
    (() => {
      try {
        const saved = localStorage.getItem('dsa-combat-equipment-open-panels');
        return saved ? (JSON.parse(saved) as string[]) : ['nahkampfwaffen'];
      } catch {
        return ['nahkampfwaffen'];
      }
    })()
  );

  readonly trackById = (_index: number, row: { id: string }) => row.id;

  onExpandedRowsChange(value: { [id: string]: boolean }): void {
    this.expandedRows.set(value);
  }

  onPanelsChange(val: string | number | (string | number)[]): void {
    const panels = (Array.isArray(val) ? val : [val]).map(String);
    this.openPanels.set(panels);
    localStorage.setItem(this.LS_KEY, JSON.stringify(panels));
  }

  // ─── Dropdown options ───────────────────────────────────────────────────────

  readonly combatTechniqueOptions = MELEE_COMBAT_TECHNIQUES.map((ct) => ({
    label: ct.label,
    value: ct.name,
  }));

  readonly rangedCombatTechniqueOptions = RANGED_COMBAT_TECHNIQUES.map((ct) => ({
    label: ct.label,
    value: ct.name,
  }));

  readonly reichweiteOptions = Object.values(Reichweite).map((v) => ({ label: v, value: v }));

  readonly bsOptions = Object.values(Belastungsstufe).map((v) => ({ label: v, value: v }));

  // ─── Weapon/armor/shield catalog pickers (searchable, free text still allowed) ────────────────
  // Each name field is a p-autocomplete: type freely OR pick a catalog entry. On pick, the whole row is
  // set from the catalog (fields + combat technique) while keeping its id; free text just sets the name.
  readonly meleeSuggestions = signal<string[]>([]);
  readonly rangedSuggestions = signal<string[]>([]);
  readonly armorSuggestions = signal<string[]>([]);
  readonly shieldSuggestions = signal<string[]>([]);

  filterMeleeWeapons(e: { query: string }): void {
    this.meleeSuggestions.set(filterLabels(MELEE_LABELS, e.query));
  }
  filterRangedWeapons(e: { query: string }): void {
    this.rangedSuggestions.set(filterLabels(RANGED_LABELS, e.query));
  }
  filterArmor(e: { query: string }): void {
    this.armorSuggestions.set(filterLabels(ARMOR_LABELS, e.query));
  }
  filterShields(e: { query: string }): void {
    this.shieldSuggestions.set(filterLabels(SHIELD_LABELS, e.query));
  }

  onMeleeWeaponSelect(id: string, e: { value: unknown }): void {
    const item = MELEE_BY_LABEL.get(acLabel(e));
    if (item) this.state.updateEquipmentList('closeCombat', (rows) => rows.map((r) => (r.id === id ? { ...meleeWeaponItemToRow(item), id } : r)));
  }
  onRangedWeaponSelect(id: string, e: { value: unknown }): void {
    const item = RANGED_BY_LABEL.get(acLabel(e));
    if (item) this.state.updateEquipmentList('rangeCombat', (rows) => rows.map((r) => (r.id === id ? { ...rangedWeaponItemToRow(item), id } : r)));
  }
  onArmorSelect(id: string, e: { value: unknown }): void {
    const item = ARMOR_BY_LABEL.get(acLabel(e));
    if (item) this.state.updateEquipmentList('armor', (rows) => rows.map((r) => (r.id === id ? { ...armorItemToRow(item), id } : r)));
  }
  onShieldSelect(id: string, e: { value: unknown }): void {
    const item = SHIELD_BY_LABEL.get(acLabel(e));
    if (item) this.state.updateEquipmentList('shields', (rows) => rows.map((r) => (r.id === id ? { ...shieldItemToRow(item), id } : r)));
  }

  // ─── Transfer weapons/armor/shields into the general equipment list (Besitz) ──────────────────
  // Behind a confirm popup so it can't be hit by accident. Dedupes by exact name (a row already in the
  // equipment list is skipped) — a tiny name change counts as a new item on purpose; anything wrong is
  // removed by hand in Besitz. Weapon rows carry no price, so the value is resolved from the catalog by
  // label where the name still matches (else left blank).
  transferToEquipment(bucket: 'closeCombat' | 'rangeCombat' | 'armor' | 'shields', event: Event): void {
    const count = this.transferableRows(bucket).length;
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: count ? `${count} in die Ausrüstung übertragen?` : 'Alle Einträge sind bereits in der Ausrüstung.',
      acceptLabel: 'Übertragen',
      rejectLabel: 'Abbrechen',
      accept: () => {
        const toAdd = this.transferableRows(bucket);
        if (toAdd.length) this.state.updateEquipmentList('general', (list) => [...list, ...toAdd]);
      },
    });
  }

  /** The rows of `bucket` not yet present (by name) in the general equipment list, as EquipmentItems. */
  private transferableRows(bucket: 'closeCombat' | 'rangeCombat' | 'armor' | 'shields'): EquipmentItem[] {
    const c = this.state.character();
    if (!c) return [];
    const existing = new Set((c.equipment.general ?? []).map((i) => (i.name ?? '').trim().toLowerCase()));
    const isWeapon = bucket === 'closeCombat' || bucket === 'rangeCombat';
    const priceMap = { closeCombat: MELEE_BY_LABEL, rangeCombat: RANGED_BY_LABEL, armor: ARMOR_BY_LABEL, shields: SHIELD_BY_LABEL }[bucket];
    const out: EquipmentItem[] = [];
    for (const r of c.equipment[bucket] as Array<{ weapon?: string; name?: string; weight?: number }>) {
      const name = ((isWeapon ? r.weapon : r.name) ?? '').trim();
      const key = name.toLowerCase();
      if (!name || existing.has(key)) continue;
      existing.add(key);
      const price = priceMap.get(name)?.price;
      out.push({ name, quantity: 1, ...(price != null ? { value: price } : {}), ...(r.weight != null ? { weight: r.weight } : {}) });
    }
    return out;
  }

  // ─── Combat technique lookup ────────────────────────────────────────────────

  private readonly techniqueMap = new Map<string, CombatTechniqueDefinition>(MELEE_COMBAT_TECHNIQUES.map((ct) => [ct.name, ct]));

  private readonly rangedTechniqueMap = new Map<string, CombatTechniqueDefinition>(RANGED_COMBAT_TECHNIQUES.map((ct) => [ct.name, ct]));

  // ─── Melee weapon rows ──────────────────────────────────────────────────────

  readonly meleeWeapons = computed<MeleeWeaponRow[]>(() => this.character()?.equipment.closeCombat ?? []);
  readonly expandedRows = signal<{ [id: string]: boolean }>({});

  readonly meleeWeaponRows = computed(() => {
    const weapons = this.meleeWeapons();
    const character = this.character();
    const attrs = character?.attributes;
    const mu = attrs?.courage ?? 8;

    return weapons.map((w) => {
      const technique = this.techniqueMap.get(w.combatTechnique);
      const leiteigenschaft = technique
        ? ((Array.isArray(technique.primaryAttribute) ? technique.primaryAttribute : [technique.primaryAttribute]) as Attribute[])
        : [];

      const ktw = technique && character?.combatTechniques[technique.name]?.ktw ? character.combatTechniques[technique.name].ktw : 6;

      const maxPrimaryAttr = technique && attrs ? Math.max(...leiteigenschaft.map((a) => attrs[ATTR_KEY[a]] as number)) : 8;

      const baseAt = ktw + Math.floor(Math.max(0, mu - 8) / 3);
      const basePa = Math.ceil(ktw / 2) + Math.floor(Math.max(0, maxPrimaryAttr - 8) / 3);

      return {
        ...w,
        leiteigenschaft,
        at: baseAt + w.atMod,
        pa: basePa + w.paMod,
      };
    });
  });

  // ─── Row management ─────────────────────────────────────────────────────────

  addMeleeWeapon(): void {
    const newRow = createEmptyMeleeWeaponRow();
    this.state.updateEquipmentList('closeCombat', (rows) => [...rows, newRow]);
    this.expandedRows.update((rows) => ({ ...rows, [newRow.id]: true }));
  }

  removeMeleeWeapon(id: string): void {
    this.state.updateEquipmentList('closeCombat', (rows) => rows.filter((r) => r.id !== id));
    this.expandedRows.update(({ [id]: _, ...rest }) => rest);
  }

  confirmDelete(id: string, event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Waffe entfernen?',
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => this.removeMeleeWeapon(id),
    });
  }

  // ─── Row reorder ────────────────────────────────────────────────────────────

  moveRowUp(index: number): void {
    if (index === 0) return;
    this.state.updateEquipmentList('closeCombat', (list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moveRowDown(index: number): void {
    this.state.updateEquipmentList('closeCombat', (list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  onRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    this.state.updateEquipmentList('closeCombat', (list) => {
      const reordered = [...list];
      const [moved] = reordered.splice(event.dragIndex!, 1);
      reordered.splice(event.dropIndex!, 0, moved);
      return reordered;
    });
  }

  // ─── Touch reorder (mobile fallback) ──────────────────────────────────────

  startTouchDrag(index: number, event: TouchEvent): void {
    event.preventDefault();
    const table = (event.target as HTMLElement).closest('.p-datatable-tbody') as HTMLElement;
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    rows[index]?.classList.add('c-row-dragging');

    const onMove = (e: TouchEvent) => {
      const clientY = e.touches[0].clientY;
      rows.forEach((r, i) => {
        const rect = r.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom && i !== index) {
          r.classList.add('c-row-drop-target');
        } else {
          r.classList.remove('c-row-drop-target');
        }
      });
    };

    const onEnd = (e: TouchEvent) => {
      const clientY = e.changedTouches[0].clientY;
      let dropIndex: number | null = null;
      rows.forEach((r, i) => {
        r.classList.remove('c-row-dragging', 'c-row-drop-target');
        const rect = r.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) dropIndex = i;
      });

      if (dropIndex != null && dropIndex !== index) {
        this.state.updateEquipmentList('closeCombat', (list) => {
          const reordered = [...list];
          const [moved] = reordered.splice(index, 1);
          reordered.splice(dropIndex!, 0, moved);
          return reordered;
        });
      }

      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  // ─── Field updates (blur-commit pattern) ────────────────────────────────────

  updateMeleeField<K extends keyof MeleeWeaponRow>(id: string, field: K, value: MeleeWeaponRow[K]): void {
    this.state.updateEquipmentList('closeCombat', (rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  // ─── Ranged weapon rows ─────────────────────────────────────────────────────

  readonly rangedWeapons = computed<RangedWeaponRow[]>(() => this.character()?.equipment.rangeCombat ?? []);
  readonly rangedExpandedRows = signal<{ [id: string]: boolean }>({});

  readonly rangedWeaponRows = computed(() => {
    const weapons = this.rangedWeapons();
    const character = this.character();
    const attrs = character?.attributes;
    const ff = attrs?.dexterity ?? 8;

    return weapons.map((w) => {
      const technique = this.rangedTechniqueMap.get(w.combatTechnique);
      const ktw = technique && character?.combatTechniques[technique.name]?.ktw ? character.combatTechniques[technique.name].ktw : 6;
      const fk = technique ? ktw + Math.floor(Math.max(0, ff - 8) / 3) + w.fkMod : null;

      return { ...w, fk };
    });
  });

  onRangedExpandedRowsChange(value: { [id: string]: boolean }): void {
    this.rangedExpandedRows.set(value);
  }

  addRangedWeapon(): void {
    const newRow = createEmptyRangedWeaponRow();
    this.state.updateEquipmentList('rangeCombat', (rows) => [...rows, newRow]);
    this.rangedExpandedRows.update((rows) => ({ ...rows, [newRow.id]: true }));
  }

  removeRangedWeapon(id: string): void {
    this.state.updateEquipmentList('rangeCombat', (rows) => rows.filter((r) => r.id !== id));
    this.rangedExpandedRows.update(({ [id]: _, ...rest }) => rest);
  }

  confirmDeleteRanged(id: string, event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Waffe entfernen?',
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => this.removeRangedWeapon(id),
    });
  }

  moveRangedRowUp(index: number): void {
    if (index === 0) return;
    this.state.updateEquipmentList('rangeCombat', (list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moveRangedRowDown(index: number): void {
    this.state.updateEquipmentList('rangeCombat', (list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  onRangedRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    this.state.updateEquipmentList('rangeCombat', (list) => {
      const reordered = [...list];
      const [moved] = reordered.splice(event.dragIndex!, 1);
      reordered.splice(event.dropIndex!, 0, moved);
      return reordered;
    });
  }

  updateRangedField<K extends keyof RangedWeaponRow>(id: string, field: K, value: RangedWeaponRow[K]): void {
    this.state.updateEquipmentList('rangeCombat', (rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  // ─── Armor rows ─────────────────────────────────────────────────────────────

  readonly armorRows = computed<ArmorRow[]>(() => this.character()?.equipment.armor ?? []);
  readonly armorExpandedRows = signal<{ [id: string]: boolean }>({});

  onArmorExpandedRowsChange(value: { [id: string]: boolean }): void {
    this.armorExpandedRows.set(value);
  }

  addArmorRow(): void {
    const newRow = createEmptyArmorRow();
    this.state.updateEquipmentList('armor', (rows) => [...rows, newRow]);
    this.armorExpandedRows.update((rows) => ({ ...rows, [newRow.id]: true }));
  }

  removeArmorRow(id: string): void {
    this.state.updateEquipmentList('armor', (rows) => rows.filter((r) => r.id !== id));
    this.armorExpandedRows.update(({ [id]: _, ...rest }) => rest);
  }

  confirmDeleteArmor(id: string, event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Rüstung entfernen?',
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => this.removeArmorRow(id),
    });
  }

  moveArmorRowUp(index: number): void {
    if (index === 0) return;
    this.state.updateEquipmentList('armor', (list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moveArmorRowDown(index: number): void {
    this.state.updateEquipmentList('armor', (list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  onArmorRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    this.state.updateEquipmentList('armor', (list) => {
      const reordered = [...list];
      const [moved] = reordered.splice(event.dragIndex!, 1);
      reordered.splice(event.dropIndex!, 0, moved);
      return reordered;
    });
  }

  updateArmorField<K extends keyof ArmorRow>(id: string, field: K, value: ArmorRow[K]): void {
    this.state.updateEquipmentList('armor', (rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  // ─── Shield rows ─────────────────────────────────────────────────────────────

  readonly shieldRows = computed<ShieldRow[]>(() => this.character()?.equipment.shields ?? []);
  readonly shieldExpandedRows = signal<{ [id: string]: boolean }>({});

  onShieldExpandedRowsChange(value: { [id: string]: boolean }): void {
    this.shieldExpandedRows.set(value);
  }

  addShieldRow(): void {
    const newRow = createEmptyShieldRow();
    this.state.updateEquipmentList('shields', (rows) => [...rows, newRow]);
    this.shieldExpandedRows.update((rows) => ({ ...rows, [newRow.id]: true }));
  }

  removeShieldRow(id: string): void {
    this.state.updateEquipmentList('shields', (rows) => rows.filter((r) => r.id !== id));
    this.shieldExpandedRows.update(({ [id]: _, ...rest }) => rest);
  }

  confirmDeleteShield(id: string, event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Schild entfernen?',
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => this.removeShieldRow(id),
    });
  }

  moveShieldRowUp(index: number): void {
    if (index === 0) return;
    this.state.updateEquipmentList('shields', (list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moveShieldRowDown(index: number): void {
    this.state.updateEquipmentList('shields', (list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  onShieldRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    this.state.updateEquipmentList('shields', (list) => {
      const reordered = [...list];
      const [moved] = reordered.splice(event.dragIndex!, 1);
      reordered.splice(event.dropIndex!, 0, moved);
      return reordered;
    });
  }

  updateShieldField<K extends keyof ShieldRow>(id: string, field: K, value: ShieldRow[K]): void {
    this.state.updateEquipmentList('shields', (rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  // ─── Dice rolls ─────────────────────────────────────────────────────────────

  rollAt(): void {
    this.diceService.roll('1d20', '#e57373');
  }

  rollPa(): void {
    this.diceService.roll('1d20', '#81c784');
  }

  rollFk(): void {
    this.diceService.roll('1d20', '#64b5f6');
  }
}
