import { inject, Injectable } from '@angular/core';
import { Character } from '../models/base-creation.model';
import { CharacterResolverService } from './character-resolver.service';

@Injectable({ providedIn: 'root' })
export class CharacterExportService {
  private resolver = inject(CharacterResolverService);

  /** Serializes a character to the portable save-data JSON string. */
  toJsonString(character: Character): string {
    return JSON.stringify(this.resolver.toSaveData(character), null, 2);
  }

  /** Triggers a browser download of the character as a JSON file. */
  download(character: Character, filename?: string): void {
    const json = this.toJsonString(character);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `${this.safeName(character)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  private safeName(character: Character): string {
    const name = character.bio.name?.trim() || 'held';
    return name.replace(/[^\p{L}\p{N}_-]+/gu, '_').toLowerCase();
  }
}
