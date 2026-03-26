import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { CharacterStateService } from '../../../services/character-state.service';
import { DiceRollService } from '../../../../shared/dice-roll.service';
import { Attributes } from '../../../models/base-creation.model';

@Component({
  selector: 'app-attributes-header',
  imports: [FormsModule, InputNumber, TooltipModule],
  templateUrl: './attributes-header.component.html',
  styleUrl: './attributes-header.component.scss',
})
export class AttributesHeaderComponent {
  private state = inject(CharacterStateService);
  private diceService = inject(DiceRollService);
  character = this.state.character;

  readonly attrDefs: { label: string; key: keyof Attributes; color: string }[] = [
    { label: 'MU', key: 'courage', color: '#e74c3c' },
    { label: 'KL', key: 'sagacity', color: '#9b59b6' },
    { label: 'IN', key: 'intuition', color: '#2ecc71' },
    { label: 'CH', key: 'charisma', color: '#3d3d3d' },
    { label: 'FF', key: 'dexterity', color: '#f1c40f' },
    { label: 'GE', key: 'agility', color: '#3498db' },
    { label: 'KO', key: 'constitution', color: '#95a5a6' },
    { label: 'KK', key: 'strength', color: '#e67e22' },
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
