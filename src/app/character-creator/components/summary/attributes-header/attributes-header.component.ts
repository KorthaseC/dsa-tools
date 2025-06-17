import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CharacterStateService } from '../../../services/character-state.service';

@Component({
  selector: 'app-attributes-header',
  standalone: true,
  imports: [FormsModule, InputTextModule, FloatLabel],
  templateUrl: './attributes-header.component.html',
  styleUrl: './attributes-header.component.scss',
})
export class AttributesHeaderComponent {
  private state = inject(CharacterStateService);
  character = this.state.character ?? null;
}
