import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CharacterStateService } from '../../../services/character-state.service';
import { BesitzComponent } from './besitz/besitz.component';
import { CombatComponent } from './combat/combat.component';
import { HomebrewComponent } from './homebrew/homebrew.component';
import { LiturgyTabComponent } from './liturgy-tab/liturgy-tab.component';
// Sonderfertigkeiten are no longer a top-level tab — the four buckets live in Allgemein/Kampf/Magie/Liturgien.
import { MagicTabComponent } from './magic-tab/magic-tab.component';
import { OverviewComponent } from './overview/overview.component';
import { TalentsComponent } from './talents/talents.component';
import { TraitsComponent } from './traits/traits.component';

@Component({
  selector: 'app-cs-tabs',
  imports: [TabsModule, OverviewComponent, TraitsComponent, TalentsComponent, CombatComponent, BesitzComponent, MagicTabComponent, LiturgyTabComponent, HomebrewComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  readonly state = inject(CharacterStateService);
  readonly activeTab = signal<string | number>('overview');

  constructor() {
    // If the active tab becomes hidden (e.g. Magie/Liturgien when the advantage is removed), fall back.
    effect(() => {
      const t = this.activeTab();
      if (t === 'magic' && !this.state.isZauberer()) this.activeTab.set('overview');
      if (t === 'liturgy' && !this.state.isGeweihter()) this.activeTab.set('overview');
    });
  }
}
