import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { StepperModule } from 'primeng/stepper';
import { CharacterStateService } from '../../services/character-state.service';
import { ExperienceComponent } from '../experience/experience.component';
import { SpeciesComponent } from '../species/species.component';


@Component({
    selector: 'app-character-wizard',
    imports: [
        FormsModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        TranslateModule,
        StepperModule,
        ButtonModule,
        InputNumberModule,
        ExperienceComponent,
        MatIconModule,
        MatTooltipModule,
        SpeciesComponent,
        CommonModule
    ],
    templateUrl: './character-wizard.component.html',
    styleUrl: './character-wizard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterWizardComponent  {
  private state = inject(CharacterStateService);
  currentStep = 0;

  experienceLevel = this.state.experienceLevel;
  currentAp = this.state.currentAp;

  species = this.state.species


  steps = [
    { label: 'Erfahrungsgrad', completed: false, error: false, unlocked: true },
    { label: 'Spezies', completed: false, error: false, unlocked: false },
    { label: 'Kultur', completed: false, error: false, unlocked: false },
    { label: 'Profession', completed: false, error: false, unlocked: false },
    { label: 'Vor-/Nachteile', completed: false, error: false, unlocked: false },
    { label: 'Talente', completed: false, error: false, unlocked: false },
    { label: 'Abschluss', completed: false, error: false, unlocked: false },
  ];

  goToNextStep() {
    if (this.currentStep < this.steps.length - 1) {
      const isValid = this.state.isCurrentStepValid(this.currentStep);
      this.steps[this.currentStep].completed = isValid;
      this.steps[this.currentStep].error = !isValid;
  
      if (isValid) {
        this.currentStep++;
        this.steps[this.currentStep].unlocked = true;
      }
    }
  }

  goToStep(index: number) {
    const alreadyUnlocked = index <= this.currentStep || this.steps[index].completed;
    if (alreadyUnlocked) {
      this.currentStep = index;
    }
  }

  showContinueButton(index: number): boolean {
    return !this.steps[index].completed && index < this.steps.length - 1;
  }

  canContinue = computed(() => this.state.isCurrentStepValid(this.currentStep));

  isStepDisabled(index: number): boolean {
    return !this.steps[index].unlocked;
  }
}
