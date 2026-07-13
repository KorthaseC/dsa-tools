import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ALL_CANTRIPS } from '../../../../constants/cantrip.const';
import { CharacterStateService } from '../../../../services/character-state.service';
import { MagicComponent } from '../magic/magic.component';
import { NameListComponent, NameOption } from '../name-list/name-list.component';
import { SpecialAbilitiesComponent } from '../special-abilities/special-abilities.component';
import { TraditionFieldsComponent } from '../tradition-fields/tradition-fields.component';

@Component({
  selector: 'app-cs-magic-tab',
  imports: [AccordionModule, MagicComponent, NameListComponent, SpecialAbilitiesComponent, TraditionFieldsComponent],
  templateUrl: './magic-tab.component.html',
  styleUrl: './magic-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MagicTabComponent {
  private state = inject(CharacterStateService);

  readonly cantripOptions: NameOption[] = ALL_CANTRIPS.map((c) => ({ label: c.label, value: c.name })).sort((a, b) =>
    a.label.localeCompare(b.label, 'de')
  );

  readonly cantrips = computed(() => this.state.character()?.cantrips ?? []);

  addCantrip(name: string): void {
    this.state.updateCantrips((list) => (list.includes(name) ? list : [...list, name]));
  }

  removeCantrip(name: string): void {
    this.state.updateCantrips((list) => list.filter((c) => c !== name));
  }

  /** Open state of the magic special-abilities accordion (default open). */
  readonly saPanel = signal<string[]>(['sa']);
  onSaPanel(v: string | number | (string | number)[]): void {
    this.saPanel.set((Array.isArray(v) ? v : [v]).map(String));
  }
}
