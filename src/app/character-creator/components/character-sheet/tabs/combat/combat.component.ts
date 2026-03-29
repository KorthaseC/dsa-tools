import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CombatPlaceholderComponent } from './combat-placeholder/combat-placeholder.component';
import { CombatTechniquesComponent } from './combat-techniques/combat-techniques.component';

@Component({
  selector: 'app-cs-combat',
  imports: [CombatPlaceholderComponent, CombatTechniquesComponent],
  templateUrl: './combat.component.html',
  styleUrl: './combat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatComponent {}
