import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { ExperienceLevel } from '../../models/experience-level.model';
import { CharacterStateService } from '../../services/character-state.service';
import { ExperienceLevelService } from '../../services/experience.service';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [
    MatButtonModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
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
