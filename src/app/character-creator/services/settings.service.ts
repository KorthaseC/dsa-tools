import { Injectable, signal } from '@angular/core';

// App-level character-creator settings. Most are persisted to localStorage; the hint filter is
// deliberately sessionStorage, matching the character draft's lifetime (see CharacterStateService).
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly BASE_EDIT_KEY = 'dsa-base-value-editing';
  private readonly HIDE_HINTS_KEY = 'dsa-hide-manual-hints';

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

  /**
   * Whether the "manuell prüfen" hints are folded away in the validation bar. Those come from rule
   * texts the engine cannot check (narrative prerequisites) — on a finished character they are read
   * once and then just noise. Session-scoped on purpose: it is a per-sitting view preference, not a
   * lasting setting, so a new tab starts with everything visible again.
   */
  readonly hideManualHints = signal<boolean>(this.loadHideManualHints());

  setHideManualHints(value: boolean): void {
    this.hideManualHints.set(value);
    try {
      sessionStorage.setItem(this.HIDE_HINTS_KEY, String(value));
    } catch {
      // ignore storage failures (private mode, prerender)
    }
  }

  private loadHideManualHints(): boolean {
    try {
      return sessionStorage.getItem(this.HIDE_HINTS_KEY) === 'true';
    } catch {
      return false; // no sessionStorage during prerender → default to showing everything
    }
  }

  private loadBaseEditing(): boolean {
    try {
      return localStorage.getItem(this.BASE_EDIT_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
