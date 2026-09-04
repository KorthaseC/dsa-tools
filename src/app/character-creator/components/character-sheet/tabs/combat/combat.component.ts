import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CombatEquipmentComponent } from './combat-equipment/combat-equipment.component';
import { CombatTechniquesComponent } from './combat-techniques/combat-techniques.component';
import { SpecialAbilitiesComponent } from '../special-abilities/special-abilities.component';

@Component({
  selector: 'app-cs-combat',
  imports: [AccordionModule, CombatEquipmentComponent, CombatTechniquesComponent, SpecialAbilitiesComponent],
  templateUrl: './combat.component.html',
  styleUrl: './combat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatComponent {
  /** Open state of the combat special-abilities accordion (default open). */
  readonly saPanel = signal<string[]>(['sa']);
  onSaPanel(v: string | number | (string | number)[]): void {
    this.saPanel.set((Array.isArray(v) ? v : [v]).map(String));
  }
}
