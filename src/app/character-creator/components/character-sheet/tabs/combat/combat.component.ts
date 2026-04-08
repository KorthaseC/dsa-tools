import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CombatEquipmentComponent } from './combat-equipment/combat-equipment.component';
import { CombatTechniquesComponent } from './combat-techniques/combat-techniques.component';

@Component({
  selector: 'app-cs-combat',
  imports: [CombatEquipmentComponent, CombatTechniquesComponent],
  templateUrl: './combat.component.html',
  styleUrl: './combat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatComponent {}
