import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { CharacterStateService } from '../../../../services/character-state.service';
import { DiceRollService } from '../../../../../shared/dice-roll.service';
import { Attributes } from '../../../../models/base-creation.model';
import { ATTR_COLORS } from '../../../../constants/attribute-colors.const';

@Component({
  selector: 'app-cs-attributes',
  imports: [FormsModule, InputNumber, TooltipModule],
  templateUrl: './attributes.component.html',
  styleUrl: './attributes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributesComponent {
  private state = inject(CharacterStateService);
  private diceService = inject(DiceRollService);
  character = this.state.character;

  readonly attrDefs: { label: string; key: keyof Attributes; color: string }[] = [
    { label: 'MU', key: 'courage', color: ATTR_COLORS.MU },
    { label: 'KL', key: 'sagacity', color: ATTR_COLORS.KL },
    { label: 'IN', key: 'intuition', color: ATTR_COLORS.IN },
    { label: 'CH', key: 'charisma', color: ATTR_COLORS.CH },
    { label: 'FF', key: 'dexterity', color: ATTR_COLORS.FF },
    { label: 'GE', key: 'agility', color: ATTR_COLORS.GE },
    { label: 'KO', key: 'constitution', color: ATTR_COLORS.KO },
    { label: 'KK', key: 'strength', color: ATTR_COLORS.KK },
  ];

  readonly attributes = computed(() => {
    const attrs = this.character()?.attributes;
    if (!attrs) return [];
    return this.attrDefs.map((a) => ({ ...a, value: attrs[a.key] as number }));
  });

  rollAttribute(color: string): void {
    this.diceService.roll('1d20', color);
  }

  updateAttribute(key: keyof Attributes, value: number | null): void {
    if (value === null) return;
    this.character.update((c) => (c ? { ...c, attributes: { ...c.attributes, [key]: value } } : c));
  }
}
