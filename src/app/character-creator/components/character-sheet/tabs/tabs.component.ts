import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CombatComponent } from './combat/combat.component';
import { TalentsComponent } from './talents/talents.component';

@Component({
  selector: 'app-cs-tabs',
  imports: [TabsModule, TalentsComponent, CombatComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {}
