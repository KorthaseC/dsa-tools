import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Bio } from '../../../../../models/base-creation.model';
import { CharacterStateService } from '../../../../../services/character-state.service';

interface BioField {
  key: keyof Bio;
  label: string;
}

@Component({
  selector: 'app-cs-bio',
  imports: [FormsModule, InputTextModule],
  templateUrl: './bio.component.html',
  styleUrl: './bio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BioComponent {
  private state = inject(CharacterStateService);

  readonly bio = computed<Bio>(() => this.state.character()?.bio ?? { name: '' });

  readonly fields: BioField[] = [
    { key: 'name', label: 'Name' },
    { key: 'family', label: 'Familie' },
    { key: 'birthplace', label: 'Geburtsort' },
    { key: 'birthday', label: 'Geburtsdatum' },
    { key: 'age', label: 'Alter' },
    { key: 'gender', label: 'Geschlecht' },
    { key: 'height', label: 'Größe' },
    { key: 'weight', label: 'Gewicht' },
    { key: 'hairColor', label: 'Haarfarbe' },
    { key: 'eyeColor', label: 'Augenfarbe' },
    { key: 'title', label: 'Titel' },
    { key: 'socialStatus', label: 'Sozialstatus' },
  ];

  update(key: keyof Bio, value: string): void {
    this.state.updateBio({ [key]: value });
  }
}
