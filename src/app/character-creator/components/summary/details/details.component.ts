import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterStateService } from '../../../services/character-state.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent {
  private state = inject(CharacterStateService);
  character = this.state.character;
}
