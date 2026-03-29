import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cs-combat-placeholder',
  imports: [],
  templateUrl: './combat-placeholder.component.html',
  styleUrl: './combat-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatPlaceholderComponent {}
