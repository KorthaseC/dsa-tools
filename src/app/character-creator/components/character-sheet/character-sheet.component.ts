import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { TabsComponent } from './tabs/tabs.component';
import { ValidationBarComponent } from '../validation-bar/validation-bar.component';
import { CharacterStateService } from '../../services/character-state.service';

@Component({
  selector: 'app-character-sheet',
  imports: [HeaderComponent, TabsComponent, ValidationBarComponent],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterSheetComponent {
  // Enable draft persistence when entering the (lazy-loaded) character-creator, so a reload restores the
  // in-progress character. Idempotent; the same call sits on the loader + wizard entry points.
  constructor() {
    inject(CharacterStateService).enablePersistence();
  }
}
