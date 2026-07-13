import { Injectable, signal } from '@angular/core';

// App-level character-creator settings, persisted to localStorage.
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly BASE_EDIT_KEY = 'dsa-base-value-editing';

  /**
   * Whether the "hard" base values (species/culture/profession) may be edited on the sheet.
   * Off by default — these are normally fixed at creation; enabling is a homebrew opt-in.
   */
  readonly baseValueEditing = signal<boolean>(this.loadBaseEditing());

  setBaseValueEditing(value: boolean): void {
    this.baseValueEditing.set(value);
    try {
      localStorage.setItem(this.BASE_EDIT_KEY, String(value));
    } catch {
      // ignore storage failures (private mode etc.)
    }
  }

  toggleBaseValueEditing(): void {
    this.setBaseValueEditing(!this.baseValueEditing());
  }

  private loadBaseEditing(): boolean {
    try {
      return localStorage.getItem(this.BASE_EDIT_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
