import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ALL_BLESSINGS } from '../../../../constants/blessing.const';
import { CharacterStateService } from '../../../../services/character-state.service';
import { MagicComponent } from '../magic/magic.component';
import { NameListComponent, NameOption } from '../name-list/name-list.component';
import { SpecialAbilitiesComponent } from '../special-abilities/special-abilities.component';
import { TraditionFieldsComponent } from '../tradition-fields/tradition-fields.component';

@Component({
  selector: 'app-cs-liturgy-tab',
  imports: [AccordionModule, MagicComponent, NameListComponent, SpecialAbilitiesComponent, TraditionFieldsComponent],
  templateUrl: './liturgy-tab.component.html',
  styleUrl: './liturgy-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiturgyTabComponent {
  private state = inject(CharacterStateService);

  readonly blessingOptions: NameOption[] = ALL_BLESSINGS.map((b) => ({ label: b.label, value: b.name })).sort((a, b) =>
    a.label.localeCompare(b.label, 'de')
  );

  readonly blessings = computed(() => this.state.character()?.blessings ?? []);

  addBlessing(name: string): void {
    this.state.updateBlessings((list) => (list.includes(name) ? list : [...list, name]));
  }

  removeBlessing(name: string): void {
    this.state.updateBlessings((list) => list.filter((b) => b !== name));
  }

  /** Open state of the karmal special-abilities accordion (default open). */
  readonly saPanel = signal<string[]>(['sa']);
  onSaPanel(v: string | number | (string | number)[]): void {
    this.saPanel.set((Array.isArray(v) ? v : [v]).map(String));
  }
}
