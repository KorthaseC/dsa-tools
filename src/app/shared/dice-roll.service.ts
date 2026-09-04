import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

// Type-only — erased at compile time, so no top-level require of the browser-only package.
type DiceBox = InstanceType<typeof import('@3d-dice/dice-box').default>;

@Injectable({ providedIn: 'root' })
export class DiceRollService {
  private platformId = inject(PLATFORM_ID);
  private diceBox: DiceBox | undefined;
  private ready = false;
  private loading = false;
  private pendingRolls: (() => void)[] = [];

  // dice-box touches window/document while its module evaluates, which would crash the prerender of
  // every route (the dice widget lives in the header). Import it lazily, inside the browser guard.
  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.diceBox || this.loading) return;
    const el = document.querySelector('#dice-box');
    if (!el) return;
    this.loading = true;
    try {
      const { default: DiceBox } = await import('@3d-dice/dice-box');
      this.diceBox = new DiceBox('#dice-box', { assetPath: '/assets/dice-box/' });
      await this.diceBox.init();
      this.ready = true;
      this.pendingRolls.forEach((fn) => fn());
      this.pendingRolls = [];
    } finally {
      this.loading = false;
    }
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
