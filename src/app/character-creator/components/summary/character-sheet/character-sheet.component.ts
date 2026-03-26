import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { TalentsComponent } from './talents/talents.component';

@Component({
  selector: 'app-character-sheet',
  imports: [TabsModule, TalentsComponent],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss',
})
export class CharacterSheetComponent {}
