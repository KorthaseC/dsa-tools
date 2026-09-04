import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ActionSelectDirective } from '../../../../directives/action-select.directive';

export interface NameOption {
  label: string;
  value: string;
}

/**
 * Presentational editor for a flat list of catalog names (e.g. Zaubertricks, Segnungen).
 * Parent wires `selected` + (add)/(remove) to the relevant character list.
 */
@Component({
  selector: 'app-cs-name-list',
  imports: [FormsModule, ButtonModule, SelectModule, TooltipModule, ActionSelectDirective],
  templateUrl: './name-list.component.html',
  styleUrl: './name-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameListComponent {
  readonly title = input<string>('');
  readonly placeholder = input<string>('Hinzufügen …');
  readonly options = input<NameOption[]>([]);
  readonly selected = input<string[]>([]);

  readonly add = output<string>();
  readonly remove = output<string>();

  readonly addModel = signal<string | null>(null);

  private readonly labelMap = computed(() => new Map(this.options().map((o) => [o.value, o.label])));

  readonly selectedItems = computed(() => this.selected().map((name) => ({ name, label: this.labelMap().get(name) ?? name })));

  readonly availableOptions = computed(() => {
    const taken = new Set(this.selected());
    return this.options().filter((o) => !taken.has(o.value));
  });

  onAdd(name: string | null): void {
    if (name) this.add.emit(name);
    this.addModel.set(null);
  }
}
