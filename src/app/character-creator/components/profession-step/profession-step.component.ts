import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ALL_PROFESSIONS } from '../../constants/profession.const';
import { ALL_SPECIAL_ABILITIES } from '../../constants/special-ability.const';
import { LanguageRef, ScriptRef } from '../../models/base-creation.model';
import { Profession, ProfessionCategory } from '../../models/profession.model';
import { SpecialAbility } from '../../models/special-ability.model';
import { CharacterStateService, specialAbilityCost } from '../../services/character-state.service';
import { ActionSelectDirective } from '../../directives/action-select.directive';

const CATEGORY_LABEL: Record<ProfessionCategory, string> = {
  profane: 'Profan',
  magic: 'Magisch',
  karmal: 'Geweiht',
};

const LANG_MAP = new Map<string, SpecialAbility>(ALL_SPECIAL_ABILITIES.filter((s) => (s.category as string) === 'language').map((s) => [s.name, s]));
const SCRIPT_MAP = new Map<string, SpecialAbility>(ALL_SPECIAL_ABILITIES.filter((s) => (s.category as string) === 'script').map((s) => [s.name, s]));
const toOptions = (m: Map<string, SpecialAbility>) => [...m.values()].map((s) => ({ label: s.label, value: s.name })).sort((a, b) => a.label.localeCompare(b.label, 'de'));
const LANG_OPTIONS = toOptions(LANG_MAP);
const SCRIPT_OPTIONS = toOptions(SCRIPT_MAP);

/** A picked language slot (lvl unused for scripts). */
interface SlotChoice {
  name: string | null;
  lvl: number;
}

@Component({
  selector: 'app-profession-step',
  imports: [FormsModule, ButtonModule, InputNumber, InputTextModule, SelectModule, TooltipModule, ActionSelectDirective],
  templateUrl: './profession-step.component.html',
  styleUrl: './profession-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionStepComponent {
  private state = inject(CharacterStateService);

  readonly filter = signal('');
  readonly subTypeFilter = signal<string | null>(null);
  readonly categories: { key: ProfessionCategory; label: string }[] = [
    { key: 'profane', label: CATEGORY_LABEL.profane },
    { key: 'magic', label: CATEGORY_LABEL.magic },
    { key: 'karmal', label: CATEGORY_LABEL.karmal },
  ];

  // ── Language/script slot selection ─────────────────────────────────────────────
  readonly slotChoice = signal<SlotChoice[]>([]); // one per profession languageGrants slot
  readonly extraLangs = signal<LanguageRef[]>([]); // leftover-AP extras
  readonly extraScripts = signal<string[]>([]);
  readonly addExtraLangModel = signal<string | null>(null);
  readonly addExtraScriptModel = signal<string | null>(null);
  readonly langLabel = (name: string) => LANG_MAP.get(name)?.label ?? SCRIPT_MAP.get(name)?.label ?? name;
  readonly maxLangLvl = 3;
  readonly baseKtw = 6; // every combat technique starts at KTW 6; profession grants are increments above it
  private lastProf = '';

  // The profession the user is BROWSING. It is NOT applied to the character until commit() (called by the
  // wizard on "Weiter") — so clicking through professions no longer pours every profession's grants onto
  // the character. When the step is re-entered with a profession already committed, `selected` falls back
  // to it (below), so the detail + gate still work without re-selecting.
  readonly preview = signal<Profession | undefined>(undefined);

  constructor() {
    // Reset the language/script pickers whenever the previewed profession changes.
    effect(
      () => {
        const p = this.selected();
        const key = p?.name ?? '';
        if (key === this.lastProf) return;
        this.lastProf = key;
        this.slotChoice.set((p?.languageGrants ?? []).map((g) => ({ name: null, lvl: g.level || 1 })));
        this.extraLangs.set([]);
        this.extraScripts.set([]);
      },
      { allowSignalWrites: true }
    );
  }

  /** Distinct sub-types (precise PDF "Typ"), narrowed to those still visible under the text filter. */
  readonly subTypeOptions = computed(() => {
    const q = this.filter().toLowerCase().trim();
    const matched = q ? ALL_PROFESSIONS.filter((p) => p.label.toLowerCase().includes(q)) : ALL_PROFESSIONS;
    return [...new Set(matched.map((p) => p.subType).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));
  });

  /** Professions matching the text + sub-type filters, grouped by big-3 category. */
  readonly groups = computed(() => {
    const q = this.filter().toLowerCase().trim();
    const sub = this.subTypeFilter();
    const matched = ALL_PROFESSIONS.filter((p) => (!q || p.label.toLowerCase().includes(q)) && (!sub || p.subType === sub));
    return this.categories
      .map(({ key, label }) => ({ key, label, items: matched.filter((p) => p.category === key) }))
      .filter((g) => g.items.length > 0);
  });

  /** The profession shown in the detail: the previewed one, or (on re-entry) the committed one. */
  readonly selected = computed<Profession | undefined>(() => {
    const p = this.preview();
    if (p) return p;
    const name = this.state.character()?.profession;
    return name ? ALL_PROFESSIONS.find((x) => x.name === name) : undefined;
  });

  /** AP the chosen languages/scripts WOULD cost (from the local, not-yet-committed picks). */
  readonly langSpent = computed(() => {
    const { langs, scripts } = this.buildPicks();
    return langs.reduce((s, l) => s + specialAbilityCost(l), 0) + scripts.reduce((s, x) => s + specialAbilityCost(x), 0);
  });

  isScript(name: string | null): boolean {
    return !!name && SCRIPT_MAP.has(name);
  }

  /** Options for a slot: languages, plus scripts when the slot allows "oder Schrift". */
  slotOptions(scriptAllowed: boolean): { label: string; value: string }[] {
    return scriptAllowed ? [...LANG_OPTIONS, ...SCRIPT_OPTIONS] : LANG_OPTIONS;
  }

  extraLangOptions(): { label: string; value: string }[] {
    const taken = new Set([...this.usedLanguages()]);
    return LANG_OPTIONS.filter((o) => !taken.has(o.value));
  }
  extraScriptOptions(): { label: string; value: string }[] {
    const taken = new Set([...this.usedScripts()]);
    return SCRIPT_OPTIONS.filter((o) => !taken.has(o.value));
  }

  isSelected(p: Profession): boolean {
    return this.selected()?.name === p.name;
  }

  /** Preview only — the profession is applied to the character in commit() (wizard "Weiter"). */
  select(p: Profession): void {
    this.preview.set(p);
  }

  /**
   * Apply the previewed profession to the character. Called by the wizard when advancing past this step.
   * No-op if nothing was newly previewed this visit (`preview` unset) — so re-entering the step and
   * clicking "Weiter" without changes keeps the already-committed profession AND its languages intact
   * (applyProfession would otherwise reset languages, and the slot pickers start empty on re-entry).
   */
  commit(): void {
    const p = this.preview();
    if (!p) return;
    this.state.applyProfession(p); // replaces any prior profession's grants + sets required attribute minima
    this.syncLanguages(); // layer the locally-chosen languages/scripts on top (applyProfession kept only the mother tongue)
  }

  // ── Slot mutations (local only — written to the character in commit()) ────────────
  setSlotName(i: number, name: string | null): void {
    this.slotChoice.update((list) => list.map((s, idx) => (idx === i ? { name, lvl: s.lvl } : s)));
  }
  setSlotLevel(i: number, lvl: number | null): void {
    this.slotChoice.update((list) => list.map((s, idx) => (idx === i ? { ...s, lvl: lvl ?? 1 } : s)));
  }

  addExtraLanguage(name: string | null): void {
    if (name) this.extraLangs.update((l) => (l.some((x) => x.name === name) ? l : [...l, { name, lvl: 1 }]));
    this.addExtraLangModel.set(null);
  }
  setExtraLangLevel(name: string, lvl: number | null): void {
    this.extraLangs.update((l) => l.map((x) => (x.name === name ? { ...x, lvl: lvl ?? 1 } : x)));
  }
  removeExtraLanguage(name: string): void {
    this.extraLangs.update((l) => l.filter((x) => x.name !== name));
  }
  addExtraScript(name: string | null): void {
    if (name) this.extraScripts.update((s) => (s.includes(name) ? s : [...s, name]));
    this.addExtraScriptModel.set(null);
  }
  removeExtraScript(name: string): void {
    this.extraScripts.update((s) => s.filter((x) => x !== name));
  }

  // ── Sync component picks → character.languages/scripts ──────────────────────────
  private usedLanguages(): string[] {
    return [...this.slotChoice().filter((s) => s.name && LANG_MAP.has(s.name)).map((s) => s.name as string), ...this.extraLangs().map((l) => l.name)];
  }
  private usedScripts(): string[] {
    return [...this.slotChoice().filter((s) => s.name && SCRIPT_MAP.has(s.name)).map((s) => s.name as string), ...this.extraScripts()];
  }

  /** Build the deduped language/script picks from the local slot + extra selections. */
  private buildPicks(): { langs: LanguageRef[]; scripts: ScriptRef[] } {
    const langs = new Map<string, LanguageRef>();
    const scripts = new Map<string, ScriptRef>();
    for (const s of this.slotChoice()) {
      if (!s.name) continue;
      if (LANG_MAP.has(s.name)) langs.set(s.name, { name: s.name, lvl: s.lvl });
      else if (SCRIPT_MAP.has(s.name)) scripts.set(s.name, { name: s.name });
    }
    for (const l of this.extraLangs()) langs.set(l.name, l);
    for (const name of this.extraScripts()) scripts.set(name, { name });
    return { langs: [...langs.values()], scripts: [...scripts.values()] };
  }

  /** Write the local picks to the character, keeping the culture's free mother tongue. */
  private syncLanguages(): void {
    const { langs, scripts } = this.buildPicks();
    this.state.updateLanguages((cur) => [...cur.filter((l) => l.mother), ...langs]);
    this.state.updateScripts(() => scripts);
  }
}
