import { computed, Injectable, signal } from '@angular/core';
import { Character } from '../models/base-creation.model';
import { ExperienceLevel } from '../models/experience-level.model';
import { Species } from '../models/species.model';

const MOCK_CHARACTER: Character = {
  name: 'Alaric',
  experienceLevel: 'Erfahren',
  maxAp: 1100,
  species: 'Mensch',
  speciesCost: 0,
  maxAttributeChanges: [],
  culture: 'Mittelreich',
  profession: 'Krieger',
  attributes: {
    courage: 12,
    sagacity: 11,
    intuition: 13,
    charisma: 10,
    dexterity: 11,
    agility: 14,
    constitution: 13,
    strength: 15,
    lifePoints: 30,
    lifePointsMax: 30,
    astralPoints: 0,
    astralPointsMax: 0,
    spirit: 2,
    toughness: 3,
    dodge: 7,
    movement: 8,
    initiative: 13,
    fatePoints: 3,
    fatePointsMax: 3,
  },
  advantages: [],
  disadvantages: [],
  specialAbilities: { combat: [], general: [], magic: [] },
  languages: [],
  combatTechniques: {},
  skills: { physical: [], social: [], nature: [], knowledge: [], crafts: [] },
  magic: [],
  equipment: { closeCombat: [], rangeCombat: [], armor: [], general: [] },
  currency: { ducats: 25, silverthalers: 0, haler: 0, kreutzer: 0 },
  notes: '',
};

@Injectable({ providedIn: 'root' })
export class CharacterStateService {
  public character = signal<Character | null>(MOCK_CHARACTER);
  public experienceLevel = signal<ExperienceLevel | null>(null);
  public selectedSpecies = signal<Species | null>(null);

  public autoAdvDeselectable = signal(false);
  public recommendedAdvDeselectable = signal(false);

  readonly species = computed(() => this.selectedSpecies());

  public currentAp = computed(() => {
    const char = this.character();
    if (!char) return 0;

    const advantageCost = char.advantages.reduce((sum, adv) => sum + (adv.mandatory ? 0 : adv.cost), 0);
    const disadvantageCost = char.disadvantages?.reduce((sum, dis) => sum + (dis.mandatory ? 0 : dis.cost), 0) ?? 0;
    const speziesCost = char.speciesCost;
    return advantageCost + disadvantageCost + speziesCost;
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
