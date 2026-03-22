import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';

import { ExperienceLevel } from '../../models/experience-level.model';
import { CharacterStateService } from '../../services/character-state.service';
import { ExperienceLevelService } from '../../services/experience.service';

@Component({
    selector: 'app-experience',
    imports: [
        FormsModule,
        FloatLabelModule,
        SelectModule,
        
    ],
    templateUrl: './experience.component.html',
    styleUrl: './experience.component.scss'
})
export class ExperienceComponent {
  private experienceService = inject(ExperienceLevelService);
  private state = inject(CharacterStateService);

  experienceLevels = this.experienceService.getExperienceLevels();

  selected = signal<ExperienceLevel | null>(this.state.experienceLevel());

  setSelected(level: ExperienceLevel) {
    this.selected.set(level);
    this.state.experienceLevel.set(level);
  }

  canContinue = computed(() => !!this.selected());
}
