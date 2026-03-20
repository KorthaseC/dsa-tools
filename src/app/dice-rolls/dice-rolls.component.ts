import DiceBox from '@3d-dice/dice-box';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuModule } from 'primeng/menu';


@Component({
    selector: 'app-dice-rolls',
    imports: [TranslateModule, NgTemplateOutlet, MatButtonModule, MatCheckboxModule, MatTooltipModule, MenuModule],
    templateUrl: './dice-rolls.component.html',
    styleUrl: './dice-rolls.component.scss'
})
export class DiceRollsComponent implements AfterViewInit {
  public isRollMulti = signal(false);
  public isSelectMulti: FormControl = new FormControl(false);
  public diceList: string[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

  private diceBox: DiceBox | undefined;
  private selectDice: string[] = [];

  constructor(private translateService: TranslateService, @Inject(PLATFORM_ID) private platformId: Object) {}

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initDiceBox();
    }
  }

  public deactivateOtherCheckbox(event: boolean, isMultiRoll: boolean): void {
    if (event && isMultiRoll) {
      this.isSelectMulti.setValue(false);
    }

    if (event && !isMultiRoll) {
      this.isRollMulti.set(false);
    }
  }

  public rollDice(dice: string): void {
    if (this.isSelectMulti.value) {
      this.addDice(dice);
    }
    if (this.isRollMulti()) {
      this.diceBox.add(dice);
    }
    if (!this.isSelectMulti.value && !this.isRollMulti()) {
      this.diceBox.roll(dice);
    }
  }

  public deleteDice(): void {
    this.diceBox.clear();
    this.selectDice = [];
  }

  public rollAllDice(): void {
    this.diceBox.roll(this.selectDice);
  }

  public findSelectedDieNumber(die: string): number {
    const diceIndex = this.selectDice.findIndex((item) =>
      item.endsWith(die.slice(1))
    );

    if (diceIndex > -1) {
      const [count] = this.selectDice[diceIndex].split('d');
      return parseInt(count);
    }
    return 0; // Return 0 if the die is not found in the array
  }

  private initDiceBox(): void {
    const diceBoxElement = document.querySelector('#dice-box');
    if (diceBoxElement) {
      this.diceBox = new DiceBox('#dice-box', {
        assetPath: '/assets/dice-box/',
      });

      this.diceBox.init().then(() => {
        // DiceBox is ready
      });
    }
  }

  private addDice(dice: string): void {
    // Check if the dice already exists in the array
    const diceIndex = this.selectDice.findIndex((item) =>
      item.endsWith(dice.slice(1))
    );

    if (diceIndex > -1) {
      // Increment the count of the existing dice
      const [count, die] = this.selectDice[diceIndex].split('d');
      const newCount = parseInt(count) + 1;
      this.selectDice[diceIndex] = `${newCount}d${die}`;
    } else {
      // Add the new dice to the array
      this.selectDice.push(dice);
    }

    // Sort the array
    this.selectDice.sort((a, b) => {
      const dieA = parseInt(a.split('d')[1]);
      const dieB = parseInt(b.split('d')[1]);
      return dieA - dieB;
    });
  }
}
