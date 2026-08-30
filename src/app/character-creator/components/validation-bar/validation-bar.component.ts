import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { CharacterStateService } from '../../services/character-state.service';
import { CharacterValidationService } from '../../services/character-validation.service';
import { SettingsService } from '../../services/settings.service';

/**
 * Sticky validation bar shared by the character wizard and the tab-based character sheet.
 * Reads the current character (CharacterStateService) and the rule results
 * (CharacterValidationService) directly — both are root singletons — so it needs no inputs.
 * Collapsed by default; the badge counts are the visible hint.
 */
@Component({
  selector: 'app-validation-bar',
  imports: [FormsModule, CheckboxModule, MessageModule],
  templateUrl: './validation-bar.component.html',
  styleUrl: './validation-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationBarComponent {
  private state = inject(CharacterStateService);
  private validation = inject(CharacterValidationService);
  private settings = inject(SettingsService);

  /**
   * Whether the manual-hint filter may be used here. Only the finished sheet passes true: during
   * creation those hints are the point (they tell you what still needs a GM ruling), so the wizard
   * always shows them.
   */
  readonly allowHidingHints = input(false);

  readonly validationResults = computed(() => {
    const c = this.state.character();
    return c ? this.validation.validate(c) : [];
  });
  readonly errors = computed(() => this.validationResults().filter((r) => r.severity === 'error'));
  readonly warnings = computed(() => this.validationResults().filter((r) => r.severity === 'warning'));
  // Info hints (e.g. narrative prerequisites like Basiliskentöter:in — "manuell prüfen"). Today the
  // requirement rule's `manual` branch is their only source, so info === "check this by hand".
  readonly infos = computed(() => this.validationResults().filter((r) => r.severity === 'info'));

  /** The filter's state, but only where it is offered — the wizard ignores a value set on the sheet. */
  readonly hintsHidden = computed(() => this.allowHidingHints() && this.settings.hideManualHints());
  readonly visibleInfos = computed(() => (this.hintsHidden() ? [] : this.infos()));
  /** How many hints the filter is currently swallowing; drives the "… ausgeblendet" note. */
  readonly hiddenHintCount = computed(() => (this.hintsHidden() ? this.infos().length : 0));
  readonly hintCount = computed(() => this.warnings().length + this.visibleInfos().length);

  /** The panel must stay reachable while hints are hidden — otherwise the way back is gone. */
  readonly hasPanelContent = computed(() => !!(this.errors().length || this.hintCount() || this.hiddenHintCount()));

  setHideHints(value: boolean): void {
    this.settings.setHideManualHints(value);
  }

  readonly validationPanelOpen = signal(false);
  toggleValidationPanel(): void {
    this.validationPanelOpen.update((v) => !v);
  }
}
