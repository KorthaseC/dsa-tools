import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { CharacterStateService } from '../../../../services/character-state.service';
import { HomebrewEntry, HomebrewKind, homebrewApCost } from '../../../../models/homebrew.model';

const KIND_OPTIONS: { label: string; value: HomebrewKind }[] = [
  { label: 'Vorteil', value: 'advantage' },
  { label: 'Nachteil', value: 'disadvantage' },
  { label: 'Sonderfertigkeit', value: 'specialAbility' },
  { label: 'Kampfsonderfertigkeit', value: 'combatSpecialAbility' },
  { label: 'Magische Sonderfertigkeit', value: 'magicSpecialAbility' },
  { label: 'Karmale Sonderfertigkeit', value: 'karmalSpecialAbility' },
  { label: 'Sonstiges', value: 'other' },
];

// Character-specific homebrew entries: free-form (name/cost/probe/effect/prereq/note), counted in AP,
// embedded in the save. No catalog/validation integration — display + edit only.
@Component({
  selector: 'app-cs-homebrew',
  imports: [FormsModule, ButtonModule, InputNumber, InputTextModule, SelectModule, TooltipModule],
  templateUrl: './homebrew.component.html',
  styleUrl: './homebrew.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomebrewComponent {
  private state = inject(CharacterStateService);

  readonly entries = computed<HomebrewEntry[]>(() => this.state.character()?.homebrew ?? []);
  readonly totalCost = computed(() => homebrewApCost(this.entries()));
  readonly kindOptions = KIND_OPTIONS;
  readonly trackById = (_i: number, e: HomebrewEntry) => e.id;

  add(): void {
    const id = globalThis.crypto?.randomUUID?.() ?? `hb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.state.updateHomebrew((list) => [...list, { id, kind: 'advantage', label: '', cost: 0 }]);
  }

  remove(id: string): void {
    this.state.updateHomebrew((list) => list.filter((e) => e.id !== id));
  }

  update<K extends keyof HomebrewEntry>(id: string, field: K, value: HomebrewEntry[K]): void {
    this.state.updateHomebrew((list) => list.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }
}
