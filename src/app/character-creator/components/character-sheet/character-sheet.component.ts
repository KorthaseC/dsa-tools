import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { TabsComponent } from './tabs/tabs.component';

@Component({
  selector: 'app-character-sheet',
  imports: [HeaderComponent, TabsComponent],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterSheetComponent {}
