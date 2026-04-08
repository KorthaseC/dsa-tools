import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

import { MELEE_COMBAT_TECHNIQUES } from '../../../../../constants/combat-technique-melee.const';
import { Attribute, Attributes } from '../../../../../models/base-creation.model';
import { CombatTechniqueDefinition } from '../../../../../models/combat-technique.model';
import { Belastungsstufe, createEmptyMeleeWeaponRow, MeleeWeaponRow, Reichweite } from '../../../../../models/melee-weapon.model';
import { CharacterStateService } from '../../../../../services/character-state.service';
import { DiceRollService } from '../../../../../../shared/dice-roll.service';

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
  imports: [FormsModule, AccordionModule, ButtonModule, ConfirmPopupModule, InputNumber, InputTextModule, SelectModule, TableModule, TooltipModule],
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

  onPanelsChange(val: string | number | string[] | number[]): void {
    const panels = (Array.isArray(val) ? val : [val]).map(String);
    this.openPanels.set(panels);
    localStorage.setItem(this.LS_KEY, JSON.stringify(panels));
  }

  // ─── Dropdown options ───────────────────────────────────────────────────────

  readonly combatTechniqueOptions = MELEE_COMBAT_TECHNIQUES.map((ct) => ({
    label: ct.label,
    value: ct.name,
  }));

  readonly reichweiteOptions = Object.values(Reichweite).map((v) => ({ label: v, value: v }));

  readonly bsOptions = Object.values(Belastungsstufe).map((v) => ({ label: v, value: v }));

  // ─── Combat technique lookup ────────────────────────────────────────────────

  private readonly techniqueMap = new Map<string, CombatTechniqueDefinition>(MELEE_COMBAT_TECHNIQUES.map((ct) => [ct.name, ct]));

  // ─── Melee weapon rows ──────────────────────────────────────────────────────

  readonly meleeWeapons = signal<MeleeWeaponRow[]>([createEmptyMeleeWeaponRow(), createEmptyMeleeWeaponRow(), createEmptyMeleeWeaponRow()]);

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
    this.meleeWeapons.update((rows) => [...rows, createEmptyMeleeWeaponRow()]);
  }

  removeMeleeWeapon(id: string): void {
    this.meleeWeapons.update((rows) => rows.filter((r) => r.id !== id));
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
    this.meleeWeapons.update((list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moveRowDown(index: number): void {
    this.meleeWeapons.update((list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  onRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    this.meleeWeapons.update((list) => {
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
        this.meleeWeapons.update((list) => {
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
    this.meleeWeapons.update((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  // ─── Dice rolls ─────────────────────────────────────────────────────────────

  rollAt(): void {
    this.diceService.roll('1d20', '#e57373');
  }

  rollPa(): void {
    this.diceService.roll('1d20', '#81c784');
  }
}
