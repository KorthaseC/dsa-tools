
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { Utility } from '../../shared/utility';
import { AlchemyDiceResult } from '../alcheny.models';

@Component({
    selector: 'app-dice-results',
    imports: [
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    ButtonModule,
    SelectModule,
    
],
    templateUrl: './dice-result.component.html',
    styleUrl: './dice-result.component.scss'
})
export class DiceResultComponent implements OnInit {
  public changeDieOne = new FormControl<number>(null, Validators.required);
  public changeDieTwo = new FormControl<number>(null, Validators.required);
  public changeDiceOptions: { label: string; value: number }[] = [];

  public alchemyResult: string = '';
  public changeDicePreview: string = '';

  private changeDiceOptionsSixSided = Array.from({ length: 6 }, (_, i) => i + 1);
  private changeDiceOptionstwentySided = Array.from({ length: 20 }, (_, i) => i + 1);
  private modValue: number;

  public get data(): any {
    return this.config.data;
  }

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  public ngOnInit(): void {
    const rawOptions =
      this.data.diceType === 6 || this.data.diceType === 12
        ? this.changeDiceOptionsSixSided
        : this.changeDiceOptionstwentySided;

    this.modValue = this.data.value - Utility.addNumbers(this.data.dice);

    this.changeDiceOptions = rawOptions.map((n) => ({
      label: this.buildOptionLabel(n),
      value: n,
    }));

    this.changeDieOne.setValue(this.data.dice[0]);
    this.changeDieTwo.setValue(this.data.dice.length > 1 ? this.data.dice[1] : null);

    this.changeDieOne.valueChanges.subscribe(() => this.updatePreview());
    this.changeDieTwo.valueChanges.subscribe(() => this.updatePreview());

    this.translateResult();
  }

  public emitDiceResult(): void {
    const dieOneValue: number = this.changeDieOne.value;
    const dieTwoValue: number = this.changeDieTwo.value;

    let geniusPoints: number = this.data.geniusPoints;
    let diceResult: number = 0;

    if (dieOneValue && dieOneValue !== this.data.dice[0]) {
      geniusPoints -= 1;
      diceResult += dieOneValue;
    } else {
      diceResult += this.data.dice[0]; // Origin value of dice 1
    }

    if (
      dieTwoValue !== null &&
      this.data.dice.length > 1 &&
      dieTwoValue !== this.data.dice[1]
    ) {
      geniusPoints -= 1;
      diceResult += dieTwoValue;
    } else if (this.data.dice.length > 1) {
      diceResult += this.data.dice[1]; // Origin value of dice 2
    }

    // Add modValue only once
    diceResult += this.modValue;

    this.dialogRef.close({ geniusPoints, diceResult });
  }

  private buildOptionLabel(dieValue: number): string {
    // For two-dice rolls, just show the number — the combined result is shown in the preview
    if (this.data.dice.length > 1) return String(dieValue);
    if (!this.data.alchemicTable) return String(dieValue);
    const sum = dieValue + this.modValue;
    const result = this.data.alchemicTable.find((a: AlchemyDiceResult) =>
      Utility.isWithinRange(sum, a.diceValueRange)
    );
    const text = result ? result.alchemicResult.replace(/\{\{effect\}\}/g, 'Effekt') : '';
    return text ? `${dieValue} – ${text}` : String(dieValue);
  }

  private updatePreview(): void {
    if (!this.data.alchemicTable) return;
    const one = this.changeDieOne.value ?? this.data.dice[0];
    const two = this.data.dice.length > 1 ? (this.changeDieTwo.value ?? this.data.dice[1]) : 0;
    const sum = one + two + this.modValue;
    const result = this.data.alchemicTable.find((a: AlchemyDiceResult) =>
      Utility.isWithinRange(sum, a.diceValueRange)
    );
    if (!result) { this.changeDicePreview = ''; return; }
    let text = result.alchemicResult.replace(/\{\{effect\}\}/g, 'Effekt');
    this.changeDicePreview = text;
  }

  public hasRemainingGeniusPoints(): boolean {
    let geniusPoints: number = this.data.geniusPoints;
    if (
      this.changeDieOne.value !== null &&
      this.changeDieOne.value !== this.data.dice[0]
    ) {
      geniusPoints -= 1;
    }
    if (
      this.changeDieTwo.value !== null &&
      this.changeDieTwo.value !== this.data.dice[1]
    ) {
      geniusPoints -= 1;
    }
    return geniusPoints > 0;
  }

  public isControlUnset(
    control: FormControl<number>,
    dieOne: boolean
  ): boolean {
    return (
      control.value === null ||
      (dieOne
        ? control.value === this.data.dice[0]
        : control.value === this.data.dice[1])
    );
  }

  private translateResult(): void {
    let result = this.data.alchemicResult as string;
    if (result.includes('{{effect}}')) {
      result = result.replace(/\{\{effect\}\}/g, 'Effekt');
    }
    this.setFinalResult(result);
  }

  private setFinalResult(alchemicResult: string): void {
    this.alchemyResult = `Dabei handelt es sich um: <strong>${alchemicResult}</strong>`;
  }
}
