import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { DiceRollService } from '../shared/dice-roll.service';

@Component({
  selector: 'app-dice-rolls',
  imports: [ButtonModule, CheckboxModule, FormsModule, PopoverModule, TooltipModule],
  templateUrl: './dice-rolls.component.html',
  styleUrl: './dice-rolls.component.scss',
})
export class DiceRollsComponent implements AfterViewInit {
  public isRollMulti = false;
  public isSelectMulti = false;
  public diceList: string[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

  private diceService = inject(DiceRollService);
  private selectDice: string[] = [];
  private colorIndex = 0;

  private readonly dieTypeColors: Record<string, string> = {
    d4: '#e74c3c',
    d6: '#e67e22',
    d8: '#f1c40f',
    d10: '#2ecc71',
    d12: '#3498db',
    d20: '#9b59b6',
  };

  private readonly colorPalette = [
    '#e74c3c',
    '#3498db',
    '#2ecc71',
    '#9b59b6',
    '#e67e22',
    '#1abc9c',
    '#f1c40f',
    '#e91e63',
    '#00bcd4',
    '#ff5722',
    '#8bc34a',
    '#673ab7',
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.diceService.init();
    }
  }

  public deactivateOtherCheckbox(event: boolean, isMultiRoll: boolean): void {
    if (event && isMultiRoll) {
      this.isSelectMulti = false;
    }
    if (event && !isMultiRoll) {
      this.isRollMulti = false;
    }
  }

  public rollDice(dice: string): void {
    if (this.isSelectMulti) {
      this.addDice(dice);
    } else if (this.isRollMulti) {
      const dieKey = 'd' + dice.split('d')[1];
      this.diceService.add(dice, this.dieTypeColors[dieKey] ?? this.nextColor());
    } else {
      const dieKey = 'd' + dice.split('d')[1];
      this.diceService.roll(dice, this.dieTypeColors[dieKey] ?? this.nextColor());
    }
  }

  public deleteDice(): void {
    this.diceService.clear();
    this.selectDice = [];
    this.colorIndex = 0;
  }

  public rollAllDice(): void {
    const notations = this.selectDice.flatMap((notation) => {
      const [qtyStr, sideStr] = notation.split('d');
      const sides = parseInt(sideStr, 10);
      return Array.from({ length: parseInt(qtyStr, 10) }, () => ({
        qty: 1,
        sides,
        themeColor: this.nextColor(),
      }));
    });
    this.diceService.roll(notations as any, '');
  }

  public removeDice(die: string): void {
    const key = die.slice(1); // e.g. 'd6' → '6'
    const diceIndex = this.selectDice.findIndex((item) => item.endsWith(key));
    if (diceIndex === -1) return;
    const [count, side] = this.selectDice[diceIndex].split('d');
    const newCount = parseInt(count) - 1;
    if (newCount <= 0) {
      this.selectDice.splice(diceIndex, 1);
    } else {
      this.selectDice[diceIndex] = `${newCount}d${side}`;
    }
  }

  public findSelectedDieNumber(die: string): number {
    const diceIndex = this.selectDice.findIndex((item) => item.endsWith(die.slice(1)));

    if (diceIndex > -1) {
      const [count] = this.selectDice[diceIndex].split('d');
      return parseInt(count);
    }
    return 0; // Return 0 if the die is not found in the array
  }

  private nextColor(): string {
    return this.colorPalette[this.colorIndex++ % this.colorPalette.length];
  }

  private addDice(dice: string): void {
    // Check if the dice already exists in the array
    const diceIndex = this.selectDice.findIndex((item) => item.endsWith(dice.slice(1)));

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
