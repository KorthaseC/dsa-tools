import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CharacterStateService } from '../../../../services/character-state.service';
import { CharacterExportService } from '../../../../services/character-export.service';
import { CharacterPdfService } from '../../../../services/character-pdf.service';
import { ALL_SPECIES } from '../../../../constants/species.const';
import { ALL_PROFESSIONS } from '../../../../constants/profession.const';

@Component({
  selector: 'app-cs-details',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent {
  private state = inject(CharacterStateService);
  private exportService = inject(CharacterExportService);
  private pdfService = inject(CharacterPdfService);
  character = this.state.character;
  ap = this.state.ap;

  // Species/profession are stored by their canonical slug; show the display label in the header.
  speciesLabel = computed(() => {
    const t = this.character()?.species;
    return t ? (ALL_SPECIES.find((s) => s.type === t)?.label ?? t) : '';
  });
  professionLabel = computed(() => {
    const n = this.character()?.profession;
    return n ? (ALL_PROFESSIONS.find((p) => p.name === n)?.label ?? n) : '';
  });

  exportJson(): void {
    const c = this.character();
    if (c) this.exportService.download(c);
  }

  /** Exports a printable PDF character sheet with the save-JSON embedded (re-importable). */
  exportPdf(): void {
    const c = this.character();
    if (c) void this.pdfService.download(c);
  }

  /** Same PDF but with a white background (no parchment fill) — saves ink when printing. */
  exportPdfWhite(): void {
    const c = this.character();
    if (c) void this.pdfService.download(c, { whiteBackground: true });
  }
}
