import DiceBox from '@3d-dice/dice-box';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DiceRollService {
  private platformId = inject(PLATFORM_ID);
  private diceBox: DiceBox | undefined;
  private ready = false;
  private pendingRolls: (() => void)[] = [];

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.diceBox) return;
    const el = document.querySelector('#dice-box');
    if (!el) return;
    this.diceBox = new DiceBox('#dice-box', { assetPath: '/assets/dice-box/' });
    this.diceBox.init().then(() => {
      this.ready = true;
      this.pendingRolls.forEach((fn) => fn());
      this.pendingRolls = [];
    });
  }

  roll(notation: string, color: string): void {
    const doRoll = () => this.diceBox?.roll(notation, { themeColor: color });
    if (this.ready) {
      doRoll();
    } else {
      this.pendingRolls.push(doRoll);
      this.init();
    }
  }

  add(notation: string, color: string): void {
    if (this.ready) this.diceBox?.add(notation, { themeColor: color });
  }

  clear(): void {
    this.diceBox?.clear();
  }
}
