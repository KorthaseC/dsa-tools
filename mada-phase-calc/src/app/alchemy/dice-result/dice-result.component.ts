import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Utility } from '../../shared/utility';
import { AlchemyDiceResult } from '../alcheny.models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dice-results',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './dice-result.component.html',
  styleUrl: './dice-result.component.scss',
})
export class DiceResultComponent implements OnInit {
  public changeDieOne = new FormControl<number>(null, Validators.required);
  public changeDieTwo = new FormControl<number>(null, Validators.required);
  public changeDiceOptions: number[];

  private changeDiceOptionsSixSided = Array.from(
    { length: 6 },
    (_, i) => i + 1
  );
  private changeDiceOptionstwentySided = Array.from(
    { length: 20 },
    (_, i) => i + 1
  );
  private modValue: number;

  constructor(
    public dialogRef: MatDialogRef<DiceResultComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.changeDiceOptions =
      this.data.diceType === 6 || this.data.diceType === 12
        ? this.changeDiceOptionsSixSided
        : this.changeDiceOptionstwentySided;

    this.modValue = this.data.value - Utility.addNumbers(this.data.dice);

    this.changeDieOne.setValue(this.data.dice[0]);
    this.changeDieTwo.setValue(
      this.data.dice.length > 1 ? this.data.dice[1] : null
    );
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
      diceResult += this.data.dice[0]; // Ursprünglicher Wert von dice 1
    }

    if (
      dieTwoValue !== null &&
      this.data.dice.length > 1 &&
      dieTwoValue !== this.data.dice[1]
    ) {
      geniusPoints -= 1;
      diceResult += dieTwoValue;
    } else if (this.data.dice.length > 1) {
      diceResult += this.data.dice[1]; // Ursprünglicher Wert von dice 2
    }

    // Add modValue only once
    diceResult += this.modValue;

    this.dialogRef.close({ geniusPoints, diceResult });
  }

  public changeDiceResult(): string {
    if (!this.data.alchemicTable) {
      console.log('Error no alchemy table found');
      return '';
    }
    let dieOneValue: number = this.changeDieOne.value ?? this.data.dice[0];
    let dieTwoValue: number =
      this.data.dice.length > 1
        ? this.changeDieTwo.value ?? this.data.dice[1]
        : 0;

    const result = this.data.alchemicTable.find((alchemy: AlchemyDiceResult) =>
      Utility.isWithinRange(
        dieOneValue + dieTwoValue + this.modValue,
        alchemy.diceValueRange
      )
    );
    return result ? result.alchemicResult : 'No result found';
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
}
