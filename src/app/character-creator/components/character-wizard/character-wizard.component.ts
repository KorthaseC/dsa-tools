import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { APP_ROUTES } from '../../../app.constants';
import { EXPERIENCE_LEVELS } from '../../constants/experience-levels.const';
import { createEmptyCharacter } from '../../models/base-creation.model';
import { CharacterStateService } from '../../services/character-state.service';
import { CharacterValidationService } from '../../services/character-validation.service';
import { WizardService } from '../../services/wizard.service';
import { advantageCost } from '../../utils/utils';
import { BesitzComponent } from '../character-sheet/tabs/besitz/besitz.component';
import { CombatComponent } from '../character-sheet/tabs/combat/combat.component';
import { HomebrewComponent } from '../character-sheet/tabs/homebrew/homebrew.component';
import { LiturgyTabComponent } from '../character-sheet/tabs/liturgy-tab/liturgy-tab.component';
import { MagicTabComponent } from '../character-sheet/tabs/magic-tab/magic-tab.component';
import { SpecialAbilitiesComponent } from '../character-sheet/tabs/special-abilities/special-abilities.component';
import { TalentsComponent } from '../character-sheet/tabs/talents/talents.component';
import { TraitsComponent } from '../character-sheet/tabs/traits/traits.component';
import { CultureStepComponent } from '../culture-step/culture-step.component';
import { EigenschaftenStepComponent } from '../eigenschaften-step/eigenschaften-step.component';
import { ExperienceComponent } from '../experience/experience.component';
import { ProfessionStepComponent } from '../profession-step/profession-step.component';
import { SpeciesComponent } from '../species/species.component';
import { ValidationBarComponent } from '../validation-bar/validation-bar.component';

interface HubSection {
  key: string;
  label: string;
  figure: string;
  status: 'ok' | 'error';
}

@Component({
  selector: 'app-character-wizard',
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmPopupModule,
    InputTextModule,
    MessageModule,
    ExperienceComponent,
    SpeciesComponent,
    CultureStepComponent,
    ProfessionStepComponent,
    EigenschaftenStepComponent,
    TraitsComponent,
    TalentsComponent,
    CombatComponent,
    MagicTabComponent,
    LiturgyTabComponent,
    SpecialAbilitiesComponent,
    BesitzComponent,
    HomebrewComponent,
    ValidationBarComponent,
  ],
  templateUrl: './character-wizard.component.html',
  styleUrl: './character-wizard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterWizardComponent {
  private state = inject(CharacterStateService);

  // Enable draft persistence on entering the (lazy) character-creator → a reload restores the character.
  constructor() {
    this.state.enablePersistence();

    // The hub nav is dynamic (Zauber/Liturgien only for Zauberer/Geweihte). If the active section
    // disappears — e.g. the Zauberer advantage is removed — fall back to the first one; otherwise
    // @switch points at a key that no longer exists and the content pane renders empty.
    effect(() => {
      const sections = this.hubSections();
      if (sections.length && !sections.some((s) => s.key === this.hubSection())) {
        this.hubSection.set(sections[0].key);
      }
    });
  }
  private validation = inject(CharacterValidationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  readonly wizard = inject(WizardService);

  readonly ap = this.state.ap;

  readonly validationResults = computed(() => {
    const c = this.state.character();
    return c ? this.validation.validate(c) : [];
  });
  readonly errors = computed(() => this.validationResults().filter((r) => r.severity === 'error'));
  readonly warnings = computed(() => this.validationResults().filter((r) => r.severity === 'warning'));

  readonly isLastOriginStep = computed(() => this.wizard.originStep() === this.wizard.steps.length - 1);

  // The profession step previews its pick locally and only commits it to the character on "Weiter"
  // (so browsing professions doesn't apply every one's grants). Query it to drive the gate + commit.
  private readonly professionStep = viewChild(ProfessionStepComponent);

  /** Whether the current origin step may advance. Step 3 (Profession) gates on the PREVIEWED pick. */
  readonly canAdvance = computed(() => {
    if (this.wizard.originStep() === 3) return !!this.professionStep()?.selected();
    return this.wizard.canAdvance();
  });

  /** Confirm + advance the current origin step; commit the previewed profession first when leaving step 3. */
  advance(): void {
    if (this.wizard.originStep() === 3) this.professionStep()?.commit();
    this.wizard.next();
  }

  // ── Phase 2 hub ──────────────────────────────────────────────────────────────
  readonly hubSection = signal<string>('eigenschaften');

  readonly hubSections = computed<HubSection[]>(() => {
    const c = this.state.character();
    if (!c) return [];
    const lvl = EXPERIENCE_LEVELS.find((e) => e.id === c.experienceLevel);
    const a = c.attributes;
    const attrSum = a.courage + a.sagacity + a.intuition + a.charisma + a.dexterity + a.agility + a.constitution + a.strength;
    const maxPts = lvl?.maxAttributePoints ?? 0;
    const picks = this.state.picks();
    const advAP = picks.advantages.reduce((s, x) => s + (x.mandatory ? 0 : advantageCost(x)), 0);
    const disAP = picks.disadvantages.reduce((s, x) => s + (x.mandatory ? 0 : advantageCost(x)), 0);

    const all: (HubSection & { visible: boolean })[] = [
      { key: 'eigenschaften', label: 'Eigenschaften', figure: `${attrSum}/${maxPts}`, status: maxPts && attrSum > maxPts ? 'error' : 'ok', visible: true },
      { key: 'traits', label: 'Vor- & Nachteile', figure: `${advAP}/80 · ${-disAP}/80`, status: advAP > 80 || disAP < -80 ? 'error' : 'ok', visible: true },
      { key: 'talente', label: 'Talente', figure: '', status: 'ok', visible: true },
      { key: 'kampf', label: 'Kampf', figure: '', status: 'ok', visible: true },
      { key: 'zauber', label: 'Zauber & Rituale', figure: '', status: 'ok', visible: this.state.isZauberer() },
      { key: 'liturgien', label: 'Liturgien', figure: '', status: 'ok', visible: this.state.isGeweihter() },
      { key: 'sf', label: 'Allgemeine SF', figure: '', status: 'ok', visible: true },
      { key: 'besitz', label: 'Ausrüstung', figure: '', status: 'ok', visible: true },
      { key: 'homebrew', label: 'Homebrew', figure: c.homebrew.length ? String(c.homebrew.length) : '', status: 'ok', visible: true },
      { key: 'abschluss', label: 'Abschluss', figure: this.errors().length ? String(this.errors().length) : '', status: this.errors().length ? 'error' : 'ok', visible: true },
    ];
    return all.filter((s) => s.visible).map(({ visible, ...s }) => s);
  });

  // ── Hub navigation ───────────────────────────────────────────────────────────
  // Always index into hubSections(), never a fixed order: "Zauber & Rituale" and "Liturgien" are
  // conditionally visible and get filtered out of that list.

  /** Position of the active section within the *visible* list (−1 while it has just disappeared). */
  private readonly hubIndex = computed(() => this.hubSections().findIndex((s) => s.key === this.hubSection()));

  /** Next visible section — null on "Abschluss", which has no forward button. */
  readonly nextHubSection = computed(() => {
    const i = this.hubIndex();
    return i < 0 ? null : (this.hubSections()[i + 1] ?? null);
  });

  /** Previous visible section — null on the first one, where "back" leaves the hub entirely. */
  readonly prevHubSection = computed(() => {
    const i = this.hubIndex();
    return i > 0 ? (this.hubSections()[i - 1] ?? null) : null;
  });

  /** Back-button label: the previous section, or the last origin step ("Profession") at the top. */
  readonly hubBackLabel = computed(() => this.prevHubSection()?.label ?? this.wizard.steps[this.wizard.steps.length - 1]);

  hubNext(): void {
    const s = this.nextHubSection();
    if (s) this.goToHubSection(s.key);
  }

  /** From the first section, "back" leaves the hub (→ Profession); otherwise it steps one section back. */
  hubBack(): void {
    const s = this.prevHubSection();
    if (s) this.goToHubSection(s.key);
    else this.wizard.back();
  }

  /** Switch section and scroll to the top — long panels (Talente) would otherwise open mid-content. */
  goToHubSection(key: string): void {
    this.hubSection.set(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get heroName(): string {
    return this.state.character()?.bio.name ?? '';
  }
  set heroName(value: string) {
    this.state.updateBio({ name: value });
  }

  // Finishing is always allowed once the hero has a name — rule violations (Regelverstöße) do NOT block it;
  // they stay visible on the Abschluss panel as information, but the player may proceed regardless.
  readonly canFinish = computed(() => !!this.state.character()?.bio.name?.trim());

  finish(): void {
    this.wizard.phase.set('done');
    this.router.navigate([APP_ROUTES.characterSheet]);
  }

  /**
   * Discard the current draft and begin a brand-new hero at zero. Available from every step (not just the
   * hub), because resuming a session draft drops you into the origin stepper — without this you'd have to
   * click through the whole stepper to reach the reset. Confirmed first, since the draft is deliberately
   * kept across navigation/reload and a stray click shouldn't wipe it.
   */
  startOver(event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Aktuellen Entwurf verwerfen und einen neuen Helden bei 0 beginnen?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Neu beginnen',
      rejectLabel: 'Abbrechen',
      accept: () => {
        this.state.character.set(createEmptyCharacter());
        this.state.experienceLevel.set(null);
        this.state.selectedSpecies.set(null);
        this.hubSection.set('eigenschaften');
        this.wizard.reset();
      },
    });
  }
}
