import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ALL_CULTURES } from '../../../../../constants/culture.const';
import { ALL_PROFESSIONS } from '../../../../../constants/profession.const';
import { ALL_SPECIES } from '../../../../../constants/species.const';
import { CharacterStateService } from '../../../../../services/character-state.service';
import { SettingsService } from '../../../../../services/settings.service';

type OriginKey = 'species' | 'culture' | 'profession';
interface OriginOption {
  label: string;
  value: string; // canonical key (species type / culture|profession name)
}

const SPECIES_OPTIONS: OriginOption[] = ALL_SPECIES.map((s) => ({ label: s.label, value: s.type }));
const CULTURE_OPTIONS: OriginOption[] = ALL_CULTURES.map((c) => ({ label: c.label, value: c.name }));
const PROFESSION_OPTIONS: OriginOption[] = ALL_PROFESSIONS.map((p) => ({ label: p.label, value: p.name }));

@Component({
  selector: 'app-cs-origin',
  imports: [FormsModule, AutoCompleteModule, ButtonModule, TooltipModule],
  templateUrl: './origin.component.html',
  styleUrl: './origin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OriginComponent {
  private state = inject(CharacterStateService);
  readonly settings = inject(SettingsService);

  readonly fields: { key: OriginKey; label: string }[] = [
    { key: 'species', label: 'Spezies' },
    { key: 'culture', label: 'Kultur' },
    { key: 'profession', label: 'Profession' },
  ];

  // Two-way models bound to the autocompletes (display labels / free text).
  vals: Record<OriginKey, string> = { species: '', culture: '', profession: '' };
  filtered: Record<OriginKey, string[]> = { species: [], culture: [], profession: [] };

  constructor() {
    // Keep the displayed labels in sync with the stored canonical values (e.g. after import).
    effect(() => {
      const c = this.state.character();
      if (!c) return;
      this.vals = {
        species: this.displayFor('species', c.species),
        culture: this.displayFor('culture', c.culture),
        profession: this.displayFor('profession', c.profession),
      };
    });
  }

  search(key: OriginKey, event: { query: string }): void {
    const q = (event.query ?? '').toLowerCase();
    this.filtered = { ...this.filtered, [key]: this.optionsFor(key).map((o) => o.label).filter((l) => l.toLowerCase().includes(q)) };
  }

  commit(key: OriginKey): void {
    const text = (this.vals[key] ?? '').trim();
    const match = this.optionsFor(key).find((o) => o.label.toLowerCase() === text.toLowerCase());
    const canonical = match ? match.value : text;
    if (key === 'species') this.state.setSpecies(canonical);
    else if (key === 'culture') this.state.setCulture(canonical);
    else this.state.setProfession(canonical);
  }

  private optionsFor(key: OriginKey): OriginOption[] {
    return key === 'species' ? SPECIES_OPTIONS : key === 'culture' ? CULTURE_OPTIONS : PROFESSION_OPTIONS;
  }

  private displayFor(key: OriginKey, value: string): string {
    return this.optionsFor(key).find((o) => o.value === value)?.label ?? value ?? '';
  }
}
