import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TalentDefinition } from '../../../../models/talent.model';
import { CRAFT_TALENTS, KNOWLEDGE_TALENTS, NATURE_TALENTS, PHYSICAL_TALENTS, SOCIAL_TALENTS } from '../../../../constants/talent.const';
import { CharacterStateService } from '../../../../services/character-state.service';
import { DiceRollService } from '../../../../../shared/dice-roll.service';
import { IncreaseFactor, Skill } from '../../../../models/base-creation.model';
import { ATTR_COLORS } from '../../../../constants/attribute-colors.const';

type SkillKey = 'physical' | 'social' | 'nature' | 'knowledge' | 'crafts';

const CATEGORY_DEFS: { label: string; key: SkillKey; talents: TalentDefinition[] }[] = [
  { label: 'Körpertalente', key: 'physical', talents: PHYSICAL_TALENTS },
  { label: 'Gesellschaftstalente', key: 'social', talents: SOCIAL_TALENTS },
  { label: 'Naturtalente', key: 'nature', talents: NATURE_TALENTS },
  { label: 'Wissenstalente', key: 'knowledge', talents: KNOWLEDGE_TALENTS },
  { label: 'Handwerkstalente', key: 'crafts', talents: CRAFT_TALENTS },
];

@Component({
  selector: 'app-cs-talents',
  imports: [FormsModule, AccordionModule, InputNumber, InputTextModule, SelectModule, TableModule, TooltipModule],
  templateUrl: './talents.component.html',
  styleUrl: './talents.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TalentsComponent {
  private state = inject(CharacterStateService);
  private diceService = inject(DiceRollService);
  character = this.state.character;

  readonly attrColors = ATTR_COLORS;

  private readonly LS_KEY = 'dsa-talents-open-panels';

  openPanels = signal<string[]>(
    (() => {
      try {
        const saved = localStorage.getItem('dsa-talents-open-panels');
        return saved ? (JSON.parse(saved) as string[]) : CATEGORY_DEFS.map((c) => c.key);
      } catch {
        return CATEGORY_DEFS.map((c) => c.key);
      }
    })()
  );

  onPanelsChange(val: string | number | string[] | number[]): void {
    const panels = (Array.isArray(val) ? val : [val]).map(String);
    this.openPanels.set(panels);
    localStorage.setItem(this.LS_KEY, JSON.stringify(panels));
  }
  readonly attributeOptions = ['MU', 'KL', 'IN', 'CH', 'FF', 'GE', 'KO', 'KK'];
  readonly increaseFactorOptions = Object.values(IncreaseFactor);
  readonly routineOptions = ['+3', '+2', '+1', '+/-0', '-1', '-2', '-3', '-'];

  private routines = signal<Record<string, string>>({});

  readonly categories = computed(() => {
    const skills = this.character()?.skills;
    return CATEGORY_DEFS.map((cat) => ({
      ...cat,
      rows: cat.talents.map((def) => ({
        def,
        fw: (skills?.[cat.key] as Skill[] | undefined)?.find((s) => s.name === def.name)?.value ?? 0,
      })),
    }));
  });

  getRoutine(name: string): string {
    return this.routines()[name] ?? '-';
  }

  setRoutine(name: string, val: string): void {
    this.routines.update((r) => ({ ...r, [name]: val }));
  }

  readonly pendingFw: Record<string, number> = {};

  commitPendingFw(key: SkillKey, def: TalentDefinition): void {
    const k = `${key}:${def.name}`;
    if (k in this.pendingFw) {
      const value = this.pendingFw[k];
      delete this.pendingFw[k];
      this.updateFw(key, def, value);
    }
  }

  rollCheck(check: [string, string, string]): void {
    const [a, b, c] = check;
    this.diceService.roll('1d20', this.attrColors[a] ?? '#ffffff');
    this.diceService.add('1d20', this.attrColors[b] ?? '#ffffff');
    this.diceService.add('1d20', this.attrColors[c] ?? '#ffffff');
  }

  updateFw(key: SkillKey, def: TalentDefinition, value: number | null): void {
    if (value === null) return;
    this.character.update((c) => {
      if (!c) return c;
      const cat = [...(c.skills[key] as Skill[])];
      const idx = cat.findIndex((s) => s.name === def.name);
      if (idx >= 0) {
        cat[idx] = { ...cat[idx], value };
      } else {
        cat.push({ name: def.name, probe: def.check, value });
      }
      return { ...c, skills: { ...c.skills, [key]: cat } };
    });
  }
}
