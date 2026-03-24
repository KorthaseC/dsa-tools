import { Component, computed, inject, signal } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { CharacterStateService } from '../../services/character-state.service';
import { CharacterImportService, ImportResult } from '../../services/character-import.service';
import { AttributesHeaderComponent } from '../summary/attributes-header/attributes-header.component';
import { ValidationResult } from '../../models/validation.model';

@Component({
    selector: 'app-character-importer',
    imports: [FileUploadModule, AttributesHeaderComponent],
    templateUrl: './character-importer.component.html',
    styleUrl: './character-importer.component.scss'
})
export class CharacterImporterComponent {
  private state = inject(CharacterStateService);
  private importService = inject(CharacterImportService);

  character = this.state.character;
  validationResults = signal<ValidationResult[]>([]);
  parseWarnings = signal<string[]>([]);
  importError = signal<string | null>(null);

  errors = computed(() => this.validationResults().filter(r => r.severity === 'error'));
  warnings = computed(() => this.validationResults().filter(r => r.severity === 'warning'));
  infos = computed(() => this.validationResults().filter(r => r.severity === 'info'));

  onUpload(event: any) {
    const file: File = event.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        this.processImport(json);
      } catch (e) {
        this.importError.set('Ungültige JSON-Datei: ' + (e instanceof Error ? e.message : 'Unbekannter Fehler'));
      }
    };

    reader.onerror = () => {
      this.importError.set('Fehler beim Einlesen der Datei');
    };

    reader.readAsText(file);
  }

  private processImport(json: unknown): void {
    const result: ImportResult = this.importService.importFromJson(json);

    this.state.character.set(result.character);
    this.validationResults.set(result.validationResults);
    this.parseWarnings.set(result.parseWarnings);
    this.importError.set(null);
  }
}
