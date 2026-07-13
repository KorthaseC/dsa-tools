import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputNumber } from 'primeng/inputnumber';
import { CharacterStateService } from '../../../../services/character-state.service';
import { BioComponent } from './bio/bio.component';
import { DerivedPanelComponent } from './derived-panel/derived-panel.component';
import { LanguagesScriptsComponent } from './languages-scripts/languages-scripts.component';
import { OriginComponent } from './origin/origin.component';
import { SpecialAbilitiesComponent } from '../special-abilities/special-abilities.component';

@Component({
  selector: 'app-cs-overview',
  imports: [FormsModule, AccordionModule, InputNumber, OriginComponent, BioComponent, LanguagesScriptsComponent, DerivedPanelComponent, SpecialAbilitiesComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  private state = inject(CharacterStateService);
  readonly ap = this.state.ap;

  /** Which overview accordion panels are open (multi-open); all expanded by default. */
  readonly openPanels = signal<string[]>(['perso', 'grundwerte', 'sprachen', 'sf']);
  onPanelsChange(value: string | number | (string | number)[]): void {
    this.openPanels.set((Array.isArray(value) ? value : [value]).map(String));
  }

  /** Sets the total AP budget directly (free creation / GM adjustment). */
  setTotalAp(total: number | null): void {
    this.state.setTotalAp(total);
  }
}
