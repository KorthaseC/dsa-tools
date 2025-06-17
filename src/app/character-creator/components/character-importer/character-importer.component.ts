import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CharacterStateService } from '../../services/character-state.service';
import { AttributesHeaderComponent } from '../summary/attributes-header/attributes-header.component';

@Component({
  selector: 'app-character-importer',
  standalone: true,
  imports: [FormsModule, InputTextModule, FloatLabel, FileUploadModule, AttributesHeaderComponent],
  templateUrl: './character-importer.component.html',
  styleUrl: './character-importer.component.scss',
})
export class CharacterImporterComponent {
  private state = inject(CharacterStateService);
  character = this.state.character ?? null;

  onUpload(event: any) {
    const file: File = event.files?.[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        console.log('Character JSON:', json);
        this.mapImportChar(json);
      } catch (e) {
        console.error('Ungültige JSON-Datei', e);
      }
    };

    reader.onerror = (error) => {
      console.error('Fehler beim Einlesen der Datei:', error);
    };

    reader.readAsText(file);
  }

  private mapImportChar(json): void {
    this.character.update((c) => ({
      ...c,
      name: json.characterName,
    }));
  }
}
