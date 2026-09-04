import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../../app.constants';
import { CharacterStateService } from '../../services/character-state.service';
import { CharacterImportService } from '../../services/character-import.service';
import { CharacterPdfService } from '../../services/character-pdf.service';
import { createEmptyCharacter } from '../../models/base-creation.model';
import { PageIntroComponent } from '../../../shared/page-intro/page-intro.component';

@Component({
  selector: 'app-character-loader',
  imports: [PageIntroComponent, ],
  templateUrl: './character-loader.component.html',
  styleUrl: './character-loader.component.scss',
})
export class CharacterLoaderComponent {
  private router = inject(Router);
  private state = inject(CharacterStateService);

  // Enable draft persistence on entering the (lazy) character-creator → a reload restores the character.
  constructor() {
    this.state.enablePersistence();
  }
  private importService = inject(CharacterImportService);
  private pdfService = inject(CharacterPdfService);

  /** Set when a picked file can't be read/parsed — shown under the cards; on success we just land on the sheet. */
  readonly importError = signal<string | null>(null);

  /** Guided, step-by-step creation. */
  goToWizard(): void {
    this.router.navigate([APP_ROUTES.characterCreator]);
  }

  /** Blank sheet, filled in freely. Reset to a fresh character so a previous session never leaks in. */
  goToEmptySheet(): void {
    this.state.character.set(createEmptyCharacter());
    this.router.navigate([APP_ROUTES.characterSheet]);
  }

  /**
   * Import a previously exported character directly from here — no separate import page. Accepts either the
   * plain JSON export or a PDF sheet with the JSON embedded (extracted via CharacterPdfService). On success
   * the resolved character becomes active and we go straight to the sheet (rule validation shows there via
   * the validation bar). A parse/read failure stays on this screen with an error.
   */
  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // reset so the same file can be re-picked after an error
    if (!file) return;

    this.importError.set(null);
    const reader = new FileReader();
    reader.onerror = () => this.importError.set('Fehler beim Einlesen der Datei');

    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
      reader.onload = () => {
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        this.pdfService
          .extractCharacterJson(bytes)
          .then((json) => {
            if (json) this.applyImport(json);
            else this.importError.set('Kein Charakter-Datensatz in diesem PDF gefunden. Bitte ein aus dieser App exportiertes PDF verwenden.');
          })
          .catch(() => this.importError.set('Das PDF konnte nicht gelesen werden.'));
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = () => {
        try {
          this.applyImport(JSON.parse(reader.result as string));
        } catch (e) {
          this.importError.set('Ungültige JSON-Datei: ' + (e instanceof Error ? e.message : 'Unbekannter Fehler'));
        }
      };
      reader.readAsText(file);
    }
  }

  private applyImport(json: unknown): void {
    const result = this.importService.importFromJson(json);
    this.state.character.set(result.character);
    this.router.navigate([APP_ROUTES.characterSheet]);
  }
}
