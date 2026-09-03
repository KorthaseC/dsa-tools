import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';

import { EXPERIENCE_LEVELS } from '../../constants/experience-levels.const';
import { ExperienceLevel } from '../../models/experience-level.model';
import { CharacterStateService } from '../../services/character-state.service';

@Component({
  selector: 'app-experience',
  imports: [FormsModule, FloatLabelModule, SelectModule],
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  private state = inject(CharacterStateService);

  readonly experienceLevels = EXPERIENCE_LEVELS;
  readonly selected = this.state.experienceLevel;

  setSelected(level: ExperienceLevel): void {
    this.state.setExperienceLevel(level);
  }

  canContinue = computed(() => !!this.selected());
}
