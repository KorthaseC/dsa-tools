import { Component, effect, signal } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DiceResultComponent } from './dice-result/dice-result.component';
import {
  EFFECT_DURATIONS,
  ELEMENTAR_ELIXIR_EFFECTS,
  ELIXIR_APPLICATION,
  ELIXIR_EFFECT,
  HEALING_ELIXIR_EFFECTS,
  POISON_APPLICATION,
  POISON_RESISTANCE,
  POISON_EFFECT,
  POISON_TRIGGER_EFFECT,
  PURITY_OPTIONS_STANDARD,
  PURITY_OPTIONS_STIMULANT,
  STIMULANT_ADDICTION,
  STIMULANT_APPLICATION,
  STIMULANT_EFFECT,
  STIMULANT_RESISTANCE,
  STRENGTHENING_ELIXIR,
  StimulantEffect,
  TALENT_ELIXIR_EFFECTS,
  ElementsAlchemy,
  EffectCategory,
  ELIXIR_EFFECTS_QS_GROUPS,
  POISON_EFFECTS_QS_GROUPS,
  STIMULANT_EFFECTS_QS_GROUPS,
} from './alchemy.constants';
import { lastValueFrom } from 'rxjs';
import { Utility } from '../shared/utility';
import {
  AlchemyDiceResult,
  AlchemyQSResult,
  DiceChangeResult,
  PurityOption,
} from './alcheny.models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

enum PotionType {
  Elixir = 'ELIXIR',
  Poison = 'POISON',
  Stimulant = 'STIMULANT',
}

@Component({
  selector: 'app-alchemy',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './alchemy.component.html',
  styleUrl: './alchemy.component.scss',
})
export class AlchemyComponent {
  public potionType = new FormControl('', Validators.required);
  public genieAlchemy = new FormControl(0, Validators.required);
  public elementType = new FormControl<ElementsAlchemy>(
    null,
    Validators.required
  );
  public purityIngredient = new FormControl<number>(null, Validators.required);
  public qsBrewing = new FormControl<number>(null, Validators.required);

  public potionOptions: string[] = Object.values(PotionType);
  public genieAlchemyOptions: number[] = [0, 1, 2, 3];
  public elementTypeOptions: string[] = Object.values(ElementsAlchemy);
  public purityOptions: PurityOption[];
  public potionText: string = '';
  public qsEffectText: string = '';
  public qsBrewingOptions: number[] = [1, 2, 3, 4, 5, 6];

  public potionTypeSignal = signal(this.potionType.value);

  private application: AlchemyDiceResult;
  private effect: AlchemyDiceResult;
  private specificEffect: AlchemyDiceResult;

  private applicationDie: number = null;
  private effectDie: number = null;
  private resistanceDie: number = null;
  private specificEffectDie: number = null;
  private durationDie: number = null;

  private geniusPoints: number = 0;

  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.potionType.valueChanges.subscribe((newPotionType) => {
      this.potionTypeSignal.set(newPotionType);
    });

    effect(() => {
      const selectedPotionType = this.potionTypeSignal();
      switch (selectedPotionType) {
        case PotionType.Elixir:
          this.elementTypeOptions = [
            ...Object.values(ElementsAlchemy).filter(
              (element: ElementsAlchemy) =>
                element !== ElementsAlchemy.Perverted &&
                element !== ElementsAlchemy.Nameless
            ),
          ];
          this.purityOptions = [...PURITY_OPTIONS_STANDARD];
          break;
        case PotionType.Poison:
          this.elementTypeOptions = [
            ...Object.values(ElementsAlchemy).filter(
              (element: ElementsAlchemy) => element !== ElementsAlchemy.Divine
            ),
          ];
          this.purityOptions = [...PURITY_OPTIONS_STANDARD];
          break;
        case PotionType.Stimulant:
          this.elementTypeOptions = [
            ...Object.values(ElementsAlchemy).filter(
              (element) => element !== ElementsAlchemy.Nameless
            ),
          ];
          this.purityOptions = [...PURITY_OPTIONS_STIMULANT];
          break;
        default:
          console.error('Error: no potion type found');
      }
    });
  }

  public isFormValid(): boolean {
    return (
      this.potionType.valid &&
      this.genieAlchemy.valid &&
      this.elementType.valid &&
      this.purityIngredient.valid &&
      this.qsBrewing.valid
    );
  }

  public potionMaking(): void {
    switch (this.potionType.value) {
      case PotionType.Elixir:
        this.elixirMaking();
        break;
      case PotionType.Poison:
        this.poisonMaking();
        break;
      case PotionType.Stimulant:
        this.stimulantMaking();
        break;
      default:
        console.error('Error: no potion type found');
    }
  }

  private rollDice(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  private async openDiceResultDialog(
    geniusPoints: number,
    value: number,
    type: string,
    alchemicResult: string,
    diceType: number,
    dice: number[],
    alchemicTable?: AlchemyDiceResult[]
  ): Promise<DiceChangeResult> {
    const dialogRef = this.dialog.open(DiceResultComponent, {
      width: '600px',
      height: '300px',
      data: {
        potionType: this.potionType.value,
        geniusPoints,
        element: this.elementType.value,
        value,
        type,
        alchemicResult,
        diceType,
        dice,
        alchemicTable,
      },
    });

    return lastValueFrom(dialogRef.afterClosed());
  }

  private async elixirMaking(): Promise<void> {
    this.geniusPoints = this.genieAlchemy.value || 0;
    this.applicationDie = await this.processStep(
      6,
      'Anwendung',
      ELIXIR_APPLICATION
    );
    this.effectDie = await this.processStep(6, 'Wirkung', ELIXIR_EFFECT);

    const elementsMap: Map<string, AlchemyDiceResult[]> = this.getElixirTypeMap(
      this.effectDie || 0
    );
    this.specificEffectDie = await this.processStep(
      20,
      'Genaue Wirkung',
      elementsMap.get(this.elementType.value || '') || []
    );
    this.specificEffect = elementsMap
      .get(this.elementType.value || '')
      ?.find((elixir) =>
        Utility.isWithinRange(
          this.specificEffectDie || 0,
          elixir.diceValueRange
        )
      );

    if (this.specificEffect?.category !== EffectCategory.Ineffectiv) {
      this.durationDie = await this.processDuration(6, 'Dauer');
    }

    this.updatePotionText();
  }

  private async poisonMaking(): Promise<void> {
    this.geniusPoints = this.genieAlchemy.value || 0;
    this.applicationDie = await this.processStep(
      20,
      'Anwendung',
      POISON_APPLICATION
    );
    this.application = POISON_APPLICATION.find((poison: AlchemyDiceResult) =>
      Utility.isWithinRange(this.applicationDie || 0, poison.diceValueRange)
    );

    if (this.application?.category !== EffectCategory.Ineffectiv) {
      this.resistanceDie = await this.processStep(
        12,
        'Widerstandsprobe',
        POISON_RESISTANCE
      );
      this.effectDie = await this.processStep(
        12,
        'Wirkung',
        POISON_EFFECT,
        this.purityIngredient.value || 0
      );
      this.effect = POISON_EFFECT.find((poison: AlchemyDiceResult) =>
        Utility.isWithinRange(this.effectDie || 0, poison.diceValueRange)
      );

      if (this.effect?.category === 'effect') {
        this.specificEffectDie = await this.processStep(
          6,
          'Dauer',
          POISON_TRIGGER_EFFECT.get(this.elementType.value) || []
        );
      }
      this.updatePoisonText();
    } else {
      this.potionText =
        this.createResultPotionText() +
        this.translateService.instant('alchemy.potionText.poisonUseless');
    }
  }

  private async stimulantMaking(): Promise<void> {
    this.geniusPoints = this.genieAlchemy.value || 0;
    this.applicationDie = await this.processStep(
      20,
      'Anwendung',
      STIMULANT_APPLICATION
    );
    this.application = STIMULANT_APPLICATION.find((stimulant) =>
      Utility.isWithinRange(this.applicationDie || 0, stimulant.diceValueRange)
    );

    if (this.application?.alchemicResult !== 'wirkunglos') {
      this.resistanceDie = await this.processStep(
        12,
        'Widerstandsprobe',
        STIMULANT_RESISTANCE
      );
      this.effectDie = await this.processStep(
        12,
        'Sucht',
        STIMULANT_ADDICTION,
        this.purityIngredient.value || 0
      );
      this.updateStimulantText();
    } else {
      this.potionText =
        this.createResultPotionText() +
        this.translateService.instant('alchemy.potionText.stimulantUseless');
    }
  }

  private async processStep(
    diceSides: number,
    type: string,
    alchemicTable: AlchemyDiceResult[],
    modifier: number = 0
  ): Promise<number> {
    const dice: number[] = Array.from(
      { length: diceSides === 12 ? 2 : 1 },
      () => this.rollDice(6)
    );
    const die: number = diceSides === 12 ? Utility.addNumbers(dice) : dice[0];
    const result: AlchemyDiceResult = alchemicTable.find((elixir) =>
      Utility.isWithinRange(die + modifier, elixir.diceValueRange)
    );
    if (!result) throw new Error(`No result found for ${type}`);
    const diceChangeResult: DiceChangeResult = await this.openDiceResultDialog(
      this.geniusPoints,
      die + modifier,
      type,
      result.alchemicResult,
      diceSides,
      dice,
      alchemicTable
    );
    this.geniusPoints = diceChangeResult.geniusPoints;
    return diceChangeResult.diceResult;
  }

  private getElixirTypeMap(
    effectDie: number
  ): Map<string, AlchemyDiceResult[]> {
    switch (effectDie) {
      case 1:
      case 2:
        return STRENGTHENING_ELIXIR;
      case 3:
      case 4:
        return HEALING_ELIXIR_EFFECTS;
      case 5:
        return TALENT_ELIXIR_EFFECTS;
      case 6:
        return ELEMENTAR_ELIXIR_EFFECTS;
      default:
        throw new Error('Invalid effectDie value');
    }
  }

  private async processDuration(
    diceSides: number,
    type: string
  ): Promise<number> {
    const dice: number[] = [this.rollDice(6), this.rollDice(6)];
    const durationDie: number = Utility.addNumbers(dice);
    const result: AlchemyDiceResult | undefined = EFFECT_DURATIONS.get(
      this.specificEffect?.category || ''
    )?.find((elixir) =>
      Utility.isWithinRange(
        durationDie + (this.purityIngredient.value || 0),
        elixir.diceValueRange
      )
    );
    if (!result) throw new Error(`No result found for ${type}`);
    const diceChangeResult: DiceChangeResult = await this.openDiceResultDialog(
      this.geniusPoints,
      durationDie + (this.purityIngredient.value || 0),
      type,
      result.alchemicResult,
      diceSides,
      dice,
      EFFECT_DURATIONS.get(this.specificEffect?.category || '') || []
    );
    this.geniusPoints = diceChangeResult.geniusPoints;
    return diceChangeResult.diceResult;
  }

  private createResultPotionText(): string {
    const potionType: string = this.translateService.instant(
      'alchemy.potionType.' + this.potionType.value
    );
    return this.translateService.instant('alchemy.potionIntroText', {
      potionType: potionType,
    });
  }

  private updatePotionText(): void {
    if (this.specificEffect?.alchemicResult !== EffectCategory.Ineffectiv) {
      const effectResult: string =
        this.translateService.instant(
          ELIXIR_EFFECT.find((elixir) =>
            Utility.isWithinRange(this.effectDie || 0, elixir.diceValueRange)
          )?.alchemicResult
        ) || '';
      const specificEffectResult: string =
        this.translateService.instant(this.specificEffect.alchemicResult) || '';
      const applicationResult: string =
        this.translateService.instant(
          ELIXIR_APPLICATION.find((elixir) =>
            Utility.isWithinRange(
              this.applicationDie || 0,
              elixir.diceValueRange
            )
          )?.alchemicResult
        ) || '';
      const durationResult: string =
        this.translateService.instant(
          EFFECT_DURATIONS.get(this.specificEffect.category)?.find((elixir) =>
            Utility.isWithinRange(this.durationDie || 0, elixir.diceValueRange)
          )?.alchemicResult
        ) || '';

      this.potionText =
        this.createResultPotionText() +
        this.translateService.instant('alchemy.potionText.elixir', {
          effect: effectResult,
          specificEffect: specificEffectResult,
          application: applicationResult,
          duration: durationResult,
        });
    } else {
      this.potionText =
        this.createResultPotionText() +
        this.translateService.instant('alchemy.potionText.elixirUseless');
    }

    const effectsForCategory = ELIXIR_EFFECTS_QS_GROUPS.get(
      this.specificEffect.category
    );

    if (effectsForCategory) {
      const qsEffect = effectsForCategory.find(
        (qsEffect: AlchemyQSResult) => qsEffect.qs === this.qsBrewing.value
      );
      this.qsEffectText = this.translateService.instant(
        qsEffect.alchemicResult
      );
    } else {
      console.error(`No effects found for category: ${this.effect.category}`);
    }
  }

  private updatePoisonText(): void {
    const applicationResult: string =
      this.translateService.instant(this.application?.alchemicResult) || '';
    const resistanceResult: string =
      this.translateService.instant(
        POISON_RESISTANCE.find((poison) =>
          Utility.isWithinRange(this.resistanceDie || 0, poison.diceValueRange)
        )?.alchemicResult
      ) || '';

    let triggerEffect: string = '';

    if (this.effect?.category === EffectCategory.Effect) {
      this.specificEffect = POISON_TRIGGER_EFFECT.get(
        this.elementType.value
      ).find((poison: AlchemyDiceResult) =>
        Utility.isWithinRange(
          this.specificEffectDie || 0,
          poison.diceValueRange
        )
      );
      triggerEffect = this.translateService.instant(
        this.specificEffect?.alchemicResult
      );
    }
    const effectResult: string =
      this.translateService.instant(this.effect?.alchemicResult, {
        effect: triggerEffect,
      }) || '';

    this.potionText =
      this.createResultPotionText() +
      this.translateService.instant('alchemy.potionText.poison', {
        effect: effectResult,
        resistance: resistanceResult,
        application: applicationResult,
      });

    const qsEffect = POISON_EFFECTS_QS_GROUPS.find(
      (qsEffect: AlchemyQSResult) => qsEffect.qs === this.qsBrewing.value
    );
    this.qsEffectText = this.translateService.instant(qsEffect.alchemicResult);
  }

  private updateStimulantText(): void {
    const stimulantEffect: StimulantEffect | undefined = STIMULANT_EFFECT.get(
      this.elementType.value
    );
    if (!stimulantEffect) return;
    const applicationResult: string =
      this.translateService.instant(this.application?.alchemicResult) || '';
    const resistanceResult: string =
      this.translateService.instant(
        STIMULANT_RESISTANCE.find((stimulant) =>
          Utility.isWithinRange(
            this.resistanceDie || 0,
            stimulant.diceValueRange
          )
        )?.alchemicResult
      ) || '';
    const effectResult: string =
      this.translateService.instant(
        STIMULANT_ADDICTION.find((stimulant) =>
          Utility.isWithinRange(
            (this.effectDie || 0) + (this.purityIngredient.value || 0),
            stimulant.diceValueRange
          )
        )?.alchemicResult
      ) || '';

    this.potionText =
      this.createResultPotionText() +
      this.translateService.instant('alchemy.potionText.stimulant', {
        effect: this.translateService.instant(stimulantEffect.effect),
        addiction: effectResult,
        sideEffect: this.translateService.instant(stimulantEffect.sideEffect),
        overdose: this.translateService.instant(stimulantEffect.overdose),
        resistance: resistanceResult,
        application: applicationResult,
      });

    const qsEffect = STIMULANT_EFFECTS_QS_GROUPS.find(
      (qsEffect: AlchemyQSResult) => qsEffect.qs === this.qsBrewing.value
    );
    this.qsEffectText = this.translateService.instant(qsEffect.alchemicResult);
  }
}
