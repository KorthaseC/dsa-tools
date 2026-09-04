import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { DerivedStats } from '../../../../../models/base-creation.model';
import { CharacterStateService } from '../../../../../services/character-state.service';

type PoolKey = 'lifePoints' | 'astralPoints' | 'karmaPoints' | 'fatePoints';
type SecondaryKey = 'spirit' | 'toughness' | 'dodge' | 'initiative' | 'movement' | 'woundThreshold';

@Component({
  selector: 'app-cs-derived-panel',
  imports: [FormsModule, InputNumber, TooltipModule],
  templateUrl: './derived-panel.component.html',
  styleUrl: './derived-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DerivedPanelComponent {
  private state = inject(CharacterStateService);

  readonly derived = computed<DerivedStats | undefined>(() => this.state.character()?.derived);

  // Energien with a real Zukauf (attribute-capped) + permanent loss / buy-back. Schicksalspunkte are
  // handled separately (no Zukauf), so they are NOT in this list.
  readonly energies: { key: PoolKey; label: string }[] = [
    { key: 'lifePoints', label: 'Lebensenergie (LeP)' },
    { key: 'astralPoints', label: 'Astralenergie (AsP)' },
    { key: 'karmaPoints', label: 'Karmaenergie (KaP)' },
  ];

  // Secondary values are raised ONLY via boni (advantages, …) — no Zukauf column.
  readonly secondary: { key: SecondaryKey; label: string }[] = [
    { key: 'spirit', label: 'Seelenkraft (SK)' },
    { key: 'toughness', label: 'Zähigkeit (ZK)' },
    { key: 'dodge', label: 'Ausweichen (AW)' },
    { key: 'initiative', label: 'Initiative (INI)' },
    { key: 'movement', label: 'Geschwindigkeit (GS)' },
    { key: 'woundThreshold', label: 'Wundschwelle (WS)' },
  ];

  update(stat: keyof DerivedStats, field: 'bonus' | 'bought' | 'current' | 'permanentLost' | 'boughtBack', value: number | null): void {
    this.state.updateDerived(stat, field, value ?? 0);
  }

  /**
   * The "Verlust" field shows the COMBINED permanent loss: the program-derived part (`autoLost`, e.g.
   * bound tradition artifacts) plus the manual part. Editing it only changes the manual part — the auto
   * part always stays included, so the input can't drop below `autoLost`.
   */
  setLost(stat: PoolKey, value: number | null): void {
    const auto = this.derived()?.[stat].autoLost ?? 0;
    this.update(stat, 'permanentLost', Math.max(0, (value ?? 0) - auto));
  }
}
