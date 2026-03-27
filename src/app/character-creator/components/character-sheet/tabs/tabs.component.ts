import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { TalentsComponent } from './talents/talents.component';

@Component({
  selector: 'app-cs-tabs',
  imports: [TabsModule, TalentsComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {}
