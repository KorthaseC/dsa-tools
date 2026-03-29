import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CharacterStateService } from '../../../../services/character-state.service';

@Component({
  selector: 'app-cs-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent {
  private state = inject(CharacterStateService);
  character = this.state.character;
}
