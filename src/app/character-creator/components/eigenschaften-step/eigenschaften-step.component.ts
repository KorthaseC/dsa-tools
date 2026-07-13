import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { EXPERIENCE_LEVELS } from '../../constants/experience-levels.const';
import { ATTR_COLORS } from '../../constants/attribute-colors.const';
import { Attribute, Attributes, IncreaseFactor } from '../../models/base-creation.model';
import { CharacterStateService } from '../../services/character-state.service';
import { totalTalentCost } from '../../utils/utils';

interface AttrRow {
  label: Attribute;
  key: keyof Attributes;
  color: string;
  value: number;
  max: number;
  apCost: number;
}

const ATTR_DEFS: { label: Attribute; key: keyof Attributes }[] = [
  { label: 'MU', key: 'courage' },
  { label: 'KL', key: 'sagacity' },
  { label: 'IN', key: 'intuition' },
  { label: 'CH', key: 'charisma' },
  { label: 'FF', key: 'dexterity' },
  { label: 'GE', key: 'agility' },
  { label: 'KO', key: 'constitution' },
  { label: 'KK', key: 'strength' },
];
const MIN = 8;

@Component({
  selector: 'app-eigenschaften-step',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './eigenschaften-step.component.html',
  styleUrl: './eigenschaften-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EigenschaftenStepComponent {
  private state = inject(CharacterStateService);

  readonly rows = computed<AttrRow[]>(() => {
    const c = this.state.character();
    if (!c) return [];
    const baseMax = EXPERIENCE_LEVELS.find((e) => e.id === c.experienceLevel)?.maxAttribute ?? 99;
    return ATTR_DEFS.map((d) => {
      const value = c.attributes[d.key];
      const bonus = c.maxAttributeChanges.filter((m) => m.attribute === d.label).reduce((s, m) => s + m.modifier, 0);
      return { ...d, color: ATTR_COLORS[d.label], value, max: baseMax + bonus, apCost: totalTalentCost(value, IncreaseFactor.E, false, true) };
    });
  });

  readonly sum = computed(() => this.rows().reduce((s, r) => s + r.value, 0));
  readonly maxPoints = computed(() => EXPERIENCE_LEVELS.find((e) => e.id === this.state.character()?.experienceLevel)?.maxAttributePoints ?? 0);

  inc(r: AttrRow): void {
    if (r.value < r.max) this.state.setAttribute(r.key, r.value + 1);
  }
  dec(r: AttrRow): void {
    if (r.value > MIN) this.state.setAttribute(r.key, r.value - 1);
  }

  readonly MIN = MIN;
}
