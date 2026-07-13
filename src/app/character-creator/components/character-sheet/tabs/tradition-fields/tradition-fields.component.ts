import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import { SELECTION_OPTIONS } from '../../../../constants/selection-options.const';
import { KARMAL_TRADITION_SPECIAL_ABILITIES } from '../../../../constants/special-ability-karmal.const';
import { MAGIC_TRADITION_SPECIAL_ABILITIES } from '../../../../constants/special-ability-magic.const';
import { SpellTrait } from '../../../../models/magic.model';
import { CharacterStateService } from '../../../../services/character-state.service';

interface Option {
  label: string;
  value: string;
}

const ATTRIBUTE_OPTIONS: Option[] = [
  { value: 'MU', label: 'Mut (MU)' },
  { value: 'KL', label: 'Klugheit (KL)' },
  { value: 'IN', label: 'Intuition (IN)' },
  { value: 'CH', label: 'Charisma (CH)' },
  { value: 'FF', label: 'Fingerfertigkeit (FF)' },
  { value: 'GE', label: 'Gewandtheit (GE)' },
  { value: 'KO', label: 'Konstitution (KO)' },
  { value: 'KK', label: 'Körperkraft (KK)' },
];

/** "Tradition (Gildenmagier)" → "Gildenmagier" (the bare tradition name stored on the character). */
const traditionName = (label: string): string => {
  const m = /\(([^)]*)\)/.exec(label);
  return (m ? m[1] : label).trim();
};

const toTraditionOptions = (list: readonly { label: string }[]): Option[] =>
  [...new Set(list.map((sa) => traditionName(sa.label)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'de'))
    .map((v) => ({ value: v, label: v }));

const MAGIC_TRADITION_OPTIONS = toTraditionOptions(MAGIC_TRADITION_SPECIAL_ABILITIES);
const KARMAL_TRADITION_OPTIONS = toTraditionOptions(KARMAL_TRADITION_SPECIAL_ABILITIES);
const MERKMAL_OPTIONS: Option[] = Object.values(SpellTrait).map((t) => ({ value: t, label: t }));
const ASPEKT_OPTIONS: Option[] = (SELECTION_OPTIONS['AspektArray'] ?? []).map((o) => ({ value: o.label, label: o.label }));

/**
 * The three tradition boxes shown under Zaubertricks (magic) / Segnungen (liturgy): Leiteigenschaft,
 * Merkmal/Aspekt and Tradition. These are normally set automatically from the profession, so the fields
 * are locked by default and only become editable via the shared lock toggle. Writes straight to the
 * character via `patchCharacter`; the unlock flag is UI-only (not persisted).
 */
@Component({
  selector: 'app-cs-tradition-fields',
  imports: [FormsModule, ButtonModule, SelectModule, TooltipModule],
  templateUrl: './tradition-fields.component.html',
  styleUrl: './tradition-fields.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraditionFieldsComponent {
  private state = inject(CharacterStateService);
  private readonly character = this.state.character;

  readonly mode = input<'magic' | 'liturgy'>('magic');

  readonly unlocked = this.state.traditionFieldsUnlocked;

  readonly attributeOptions = ATTRIBUTE_OPTIONS;
  readonly traditionOptions = computed(() => (this.mode() === 'magic' ? MAGIC_TRADITION_OPTIONS : KARMAL_TRADITION_OPTIONS));
  readonly traitOptions = computed(() => (this.mode() === 'magic' ? MERKMAL_OPTIONS : ASPEKT_OPTIONS));
  readonly traitLabel = computed(() => (this.mode() === 'magic' ? 'Merkmal' : 'Aspekt'));

  readonly guiding = computed(() => {
    const c = this.character();
    return (this.mode() === 'magic' ? c?.magicGuidingAttribute : c?.karmalGuidingAttribute) ?? null;
  });
  readonly trait = computed(() => {
    const c = this.character();
    return (this.mode() === 'magic' ? c?.magicTrait : c?.karmalAspect) ?? null;
  });
  readonly tradition = computed(() => {
    const c = this.character();
    return (this.mode() === 'magic' ? c?.magicTradition : c?.karmalTradition) ?? null;
  });

  toggleUnlocked(): void {
    this.unlocked.set(!this.unlocked());
  }

  setGuiding(v: string | null): void {
    this.state.patchCharacter(this.mode() === 'magic' ? { magicGuidingAttribute: v ?? undefined } : { karmalGuidingAttribute: v ?? undefined });
  }
  setTrait(v: string | null): void {
    this.state.patchCharacter(this.mode() === 'magic' ? { magicTrait: v ?? undefined } : { karmalAspect: v ?? undefined });
  }
  setTradition(v: string | null): void {
    this.state.patchCharacter(this.mode() === 'magic' ? { magicTradition: v ?? undefined } : { karmalTradition: v ?? undefined });
  }
}
