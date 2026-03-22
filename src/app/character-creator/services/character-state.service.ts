import { computed, Injectable, signal } from "@angular/core";
import { Character } from "../models/base-creation.model";
import { ExperienceLevel } from "../models/experience-level.model";
import { Species } from "../models/species.model";

@Injectable({ providedIn: 'root' })
export class CharacterStateService {
  public character = signal<Character | null>(null);
  public experienceLevel = signal<ExperienceLevel | null>(null);
  public selectedSpecies = signal<Species | null>(null);

  public autoAdvDeselectable = signal(false);
  public recommendedAdvDeselectable = signal(false);

  readonly species = computed(() => this.selectedSpecies());

  public currentAp = computed(() => {
    const char = this.character();
    if (!char) return 0;
  
    const totalAdvantageCost = char.advantages.reduce((sum, adv) => sum + (adv.mandatory ? 0 : adv.cost), 0);
    const speziesCost = char.speciesCost;
    return totalAdvantageCost + speziesCost;
  });

  isCurrentStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.experienceLevel() !== null;
      case 1:
        return this.selectedSpecies() !== null;
      // später mehr cases
      default:
        return false;
    }
  }
}
