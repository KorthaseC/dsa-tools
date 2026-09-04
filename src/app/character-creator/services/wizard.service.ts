import { computed, inject, Injectable, signal } from '@angular/core';
import { CharacterStateService } from './character-state.service';

export type WizardPhase = 'origin' | 'hub' | 'done';

/**
 * Drives the guided creation flow: Phase 1 origin stepper (Erfahrung → Spezies → Kultur →
 * Profession), Phase 2 hub, Phase 3 done. A step unlocks once the previous one is confirmed.
 */
@Injectable({ providedIn: 'root' })
export class WizardService {
  private state = inject(CharacterStateService);

  readonly phase = signal<WizardPhase>('origin');
  readonly originStep = signal(0);
  private readonly maxConfirmed = signal(-1);

  readonly steps = ['Erfahrungsgrad', 'Spezies', 'Kultur', 'Profession'];

  /** Per-origin-step validity gate. Kultur/Profession are placeholders until 5c/5d. */
  isStepValid(index: number): boolean {
    switch (index) {
      case 0:
        return this.state.experienceLevel() !== null;
      case 1: {
        const species = this.state.selectedSpecies();
        if (!species) return false;
        // Require every "choice" attribute modifier (Eigenschaft) to have been picked.
        const requiredChoices = species.attributeMods.filter((m) => m.type === 'choice').length;
        const chosen = (this.state.character()?.maxAttributeChanges ?? []).filter((m) => m.type === 'choice').length;
        return chosen >= requiredChoices;
      }
      case 2:
        return !!this.state.character()?.culture; // Kultur chosen
      case 3:
        return !!this.state.character()?.profession; // Profession chosen
      default:
        return true;
    }
  }

  readonly canAdvance = computed(() => this.isStepValid(this.originStep()));

  /** A step is reachable once everything before it has been confirmed. */
  isUnlocked(index: number): boolean {
    return index <= this.maxConfirmed() + 1;
  }

  isConfirmed(index: number): boolean {
    return index <= this.maxConfirmed();
  }

  /** Confirm the current origin step and advance (to the next step or the hub). */
  next(): void {
    const i = this.originStep();
    if (!this.isStepValid(i)) return;
    if (i > this.maxConfirmed()) this.maxConfirmed.set(i);
    if (i < this.steps.length - 1) this.originStep.set(i + 1);
    else this.phase.set('hub');
  }

  back(): void {
    if (this.phase() === 'hub') {
      this.phase.set('origin');
      this.originStep.set(this.steps.length - 1);
      return;
    }
    if (this.originStep() > 0) this.originStep.set(this.originStep() - 1);
  }

  goToStep(index: number): void {
    if (!this.isUnlocked(index)) return;
    this.phase.set('origin');
    this.originStep.set(index);
  }

  openHub(): void {
    this.phase.set('hub');
  }

  reset(): void {
    this.phase.set('origin');
    this.originStep.set(0);
    this.maxConfirmed.set(-1);
  }
}
