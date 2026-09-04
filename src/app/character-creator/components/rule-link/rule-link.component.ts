import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Small "open the rule in the Regelwiki" link. Renders an external-link icon anchor only when a URL is
 * present. Opens in a NEW TAB (`target="_blank" rel="noopener"`) — the app never navigates away, so a
 * misclick can't discard the in-memory character. Embedding the Regelwiki in an iframe is impossible
 * (it sends X-Frame-Options), hence a plain external link instead of a dialog.
 */
@Component({
  selector: 'app-rule-link',
  imports: [TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (href()) {
      <a
        class="c-rule-link"
        [href]="href()"
        target="_blank"
        rel="noopener noreferrer"
        (click)="$event.stopPropagation()"
        pTooltip="Regel im Regelwiki öffnen (neuer Tab)"
        tooltipPosition="top"
        aria-label="Regel im Regelwiki öffnen"
      >
        <i class="pi pi-external-link"></i>
      </a>
    }
  `,
  styles: [
    `
      /* Used on the parchment sheet — a warm brown reads clearly there (matches the sheet's labels). */
      .c-rule-link {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        color: #6f5732;
        text-decoration: none;
        transition: color 0.15s;
      }
      .c-rule-link:hover {
        color: #5a3a10;
      }
      .c-rule-link i {
        font-size: 0.78rem;
      }
    `,
  ],
})
export class RuleLinkComponent {
  /** Full URL (catalog entries carry `url`); or a `path` appended to the Regelwiki base. */
  readonly url = input<string | undefined>('');
  readonly path = input<string>('');

  private readonly base = 'https://dsa.ulisses-regelwiki.de/';

  readonly href = computed(() => {
    const u = (this.url() ?? '').trim();
    if (u) return u;
    const p = this.path().trim();
    return p ? this.base + p : '';
  });
}
