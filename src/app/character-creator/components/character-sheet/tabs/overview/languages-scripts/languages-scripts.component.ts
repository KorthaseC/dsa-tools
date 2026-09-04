import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ALL_SPECIAL_ABILITIES } from '../../../../../constants/special-ability.const';
import { LanguageRef, ScriptRef } from '../../../../../models/base-creation.model';
import { SpecialAbility } from '../../../../../models/special-ability.model';
import { CharacterStateService, specialAbilityCost } from '../../../../../services/character-state.service';
import { ActionSelectDirective } from '../../../../../directives/action-select.directive';

function mapFor(category: string): Map<string, SpecialAbility> {
  return new Map(ALL_SPECIAL_ABILITIES.filter((s) => (s.category as string) === category).map((s) => [s.name, s]));
}
const LANG_MAP = mapFor('language');
const SCRIPT_MAP = mapFor('script');
const toOptions = (m: Map<string, SpecialAbility>) =>
  [...m.values()].map((s) => ({ label: s.label, value: s.name })).sort((a, b) => a.label.localeCompare(b.label, 'de'));
const LANG_OPTIONS = toOptions(LANG_MAP);
const SCRIPT_OPTIONS = toOptions(SCRIPT_MAP);

@Component({
  selector: 'app-cs-languages-scripts',
  imports: [FormsModule, ButtonModule, CheckboxModule, InputNumber, SelectModule, TooltipModule, ActionSelectDirective],
  templateUrl: './languages-scripts.component.html',
  styleUrl: './languages-scripts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguagesScriptsComponent {
  private state = inject(CharacterStateService);

  readonly addLangModel = signal<string | null>(null);
  readonly addScriptModel = signal<string | null>(null);

  readonly cost = specialAbilityCost;

  readonly languages = computed(() => (this.state.character()?.languages ?? []).map((ref) => ({ ref, sa: LANG_MAP.get(ref.name) })));
  readonly scripts = computed(() => (this.state.character()?.scripts ?? []).map((ref) => ({ ref, sa: SCRIPT_MAP.get(ref.name) })));

  readonly langOptions = computed(() => {
    const taken = new Set((this.state.character()?.languages ?? []).map((l) => l.name));
    return LANG_OPTIONS.filter((o) => !taken.has(o.value));
  });
  readonly scriptOptions = computed(() => {
    const taken = new Set((this.state.character()?.scripts ?? []).map((s) => s.name));
    return SCRIPT_OPTIONS.filter((o) => !taken.has(o.value));
  });

  maxLvl(ref: LanguageRef): number {
    return LANG_MAP.get(ref.name)?.maxLvl ?? 3;
  }

  addLanguage(name: string | null): void {
    if (name) this.state.updateLanguages((list) => (list.some((l) => l.name === name) ? list : [...list, { name, lvl: 1 }]));
    this.addLangModel.set(null);
  }

  removeLanguage(name: string): void {
    this.state.updateLanguages((list) => list.filter((l) => l.name !== name));
  }

  setLanguageLevel(name: string, lvl: number | null): void {
    this.state.updateLanguages((list) => list.map((l) => (l.name === name ? { ...l, lvl: lvl ?? 1 } : l)));
  }

  /** Toggle a language as the (single) free mother tongue — pins level 3 and clears any other mother. */
  setMother(name: string, mother: boolean): void {
    this.state.updateLanguages((list) =>
      list.map((l) => (l.name === name ? { ...l, mother, lvl: mother ? 3 : l.lvl } : mother ? { ...l, mother: false } : l))
    );
  }

  addScript(name: string | null): void {
    if (name) this.state.updateScripts((list) => (list.some((s) => s.name === name) ? list : [...list, { name }]));
    this.addScriptModel.set(null);
  }

  removeScript(name: string): void {
    this.state.updateScripts((list) => list.filter((s) => s.name !== name));
  }
}
