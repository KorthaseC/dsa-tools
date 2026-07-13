import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { CharacterStateService } from '../../services/character-state.service';
import { CharacterValidationService } from '../../services/character-validation.service';

/**
 * Sticky validation bar shared by the character wizard and the tab-based character sheet.
 * Reads the current character (CharacterStateService) and the rule results
 * (CharacterValidationService) directly — both are root singletons — so it needs no inputs.
 * Collapsed by default; the badge counts are the visible hint.
 */
@Component({
  selector: 'app-validation-bar',
  imports: [MessageModule],
  templateUrl: './validation-bar.component.html',
  styleUrl: './validation-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationBarComponent {
  private state = inject(CharacterStateService);
  private validation = inject(CharacterValidationService);

  readonly validationResults = computed(() => {
    const c = this.state.character();
    return c ? this.validation.validate(c) : [];
  });
  readonly errors = computed(() => this.validationResults().filter((r) => r.severity === 'error'));
  readonly warnings = computed(() => this.validationResults().filter((r) => r.severity === 'warning'));
  // Info hints (e.g. narrative prerequisites like Basiliskentöter:in — "manuell prüfen").
  readonly infos = computed(() => this.validationResults().filter((r) => r.severity === 'info'));
  readonly hintCount = computed(() => this.warnings().length + this.infos().length);

  readonly validationPanelOpen = signal(false);
  toggleValidationPanel(): void {
    this.validationPanelOpen.update((v) => !v);
  }
}
