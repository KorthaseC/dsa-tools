import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { MELEE_COMBAT_TECHNIQUES } from '../../../../../constants/combat-technique-melee.const';
import { RANGED_COMBAT_TECHNIQUES } from '../../../../../constants/combat-technique-ranged.const';
import { Attribute, Attributes, IncreaseFactor } from '../../../../../models/base-creation.model';
import { CharacterStateService } from '../../../../../services/character-state.service';
import { DiceRollService } from '../../../../../../shared/dice-roll.service';

// Maps the short attribute abbreviation to the key in the Attributes interface
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
  selector: 'app-cs-combat-techniques',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AccordionModule, InputNumber, InputTextModule, MultiSelectModule, SelectModule, TableModule, TooltipModule],
  templateUrl: './combat-techniques.component.html',
  styleUrl: './combat-techniques.component.scss',
})
export class CombatTechniquesComponent {
  private state = inject(CharacterStateService);
  private diceService = inject(DiceRollService);

  readonly character = this.state.character;

  private readonly LS_KEY = 'dsa-combat-techniques-open-panels';

  readonly openPanels = signal<string[]>(
    (() => {
      try {
        const saved = localStorage.getItem('dsa-combat-techniques-open-panels');
        return saved ? (JSON.parse(saved) as string[]) : ['melee', 'ranged'];
      } catch {
        return ['melee', 'ranged'];
      }
    })()
  );

  onPanelsChange(val: string | number | string[] | number[]): void {
    const panels = (Array.isArray(val) ? val : [val]).map(String);
    this.openPanels.set(panels);
    localStorage.setItem(this.LS_KEY, JSON.stringify(panels));
  }

  readonly increaseFactorOptions = Object.values(IncreaseFactor);
  readonly attributeOptions = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'];

  /**
   * AT/PA are pre-computed here inside the signal so the template reads plain
   * row.at / row.pa — no method calls on every change-detection cycle.
   */
  readonly meleeRows = computed(() => {
    const character = this.character();
    const attrs = character?.attributes;
    // AT is always modified by MU (Courage), regardless of the technique's primary attribute
    const mu = attrs?.courage ?? 8;
    return MELEE_COMBAT_TECHNIQUES.map((def) => {
      const ktw = character?.combatTechniques[def.name]?.ktw ?? 6;
      const attrModel = (Array.isArray(def.primaryAttribute) ? def.primaryAttribute : [def.primaryAttribute]) as Attribute[];
      // PA modifier: highest primary attribute of the technique above 8, per 3 full points
      const maxPrimaryAttr = attrs ? Math.max(...attrModel.map((a) => attrs[ATTR_KEY[a]] as number)) : 8;
      return {
        def,
        attrModel,
        ktw,
        // AT = full KTW + floor((MU - 8) / 3)
        at: ktw + Math.floor(Math.max(0, mu - 8) / 3),
        // PA = ceil(KTW / 2) + floor((primaryAttr - 8) / 3)
        pa: Math.ceil(ktw / 2) + Math.floor(Math.max(0, maxPrimaryAttr - 8) / 3),
      };
    });
  });

  readonly rangedRows = computed(() => {
    const character = this.character();
    const attrs = character?.attributes;
    // FK is always modified by FF (Fingerfertigkeit / dexterity)
    const ff = attrs?.dexterity ?? 8;
    return RANGED_COMBAT_TECHNIQUES.map((def) => {
      const ktw = character?.combatTechniques[def.name]?.ktw ?? 6;
      const attrModel = (Array.isArray(def.primaryAttribute) ? def.primaryAttribute : [def.primaryAttribute]) as Attribute[];
      return {
        def,
        attrModel,
        ktw,
        // FK = full KTW + floor((FF - 8) / 3)
        fk: ktw + Math.floor(Math.max(0, ff - 8) / 3),
      };
    });
  });

  /** Pending uncommitted KTW value (blur-commit pattern, same as talents) */
  readonly pendingKtw: Record<string, number> = {};

  setPendingKtw(name: string, value: number | null): void {
    if (value !== null) {
      this.pendingKtw[name] = value;
    }
  }

  commitKtw(name: string): void {
    if (name in this.pendingKtw) {
      const value = this.pendingKtw[name];
      delete this.pendingKtw[name];
      this.updateKtw(name, value);
    }
  }

  private updateKtw(name: string, ktw: number): void {
    this.character.update((c) => {
      if (!c) return c;
      return {
        ...c,
        combatTechniques: {
          ...c.combatTechniques,
          [name]: { ktw },
        },
      };
    });
  }

  rollAt(): void {
    this.diceService.roll('1d20', '#e57373');
  }

  rollPa(): void {
    this.diceService.roll('1d20', '#81c784');
  }
}
