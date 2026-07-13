import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Shared "roll a d20 check" button. ONE d20 SVG, recoloured via a CSS mask + `currentColor` — so it can
 * be any colour (per-attribute, gold, …) with no per-icon assets and no brittle `filter` hacks.
 *
 * Two looks:
 *  - default (borderless): the glyph itself takes `color` — used in Talents / Magie / Liturgien (gold),
 *    so they finally look identical and need no button chrome (less space, not more).
 *  - `disc`: a filled circle in `color` with a cream glyph on top — used for the attributes, where the
 *    colour codes the attribute AND stays visible on the dark header even for dark colours (e.g. CH).
 */
@Component({
  selector: 'app-d20-roll',
  imports: [TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="c-d20"
      [class.c-d20--disc]="disc()"
      [style.color]="color()"
      [style.--d20-size]="size() + 'px'"
      [disabled]="disabled()"
      (click)="$event.stopPropagation(); roll.emit()"
      [pTooltip]="label()"
      tooltipPosition="top"
      [attr.aria-label]="label()"
    >
      <span class="c-d20__glyph c-d20-mask"></span>
    </button>
  `,
  styles: [
    `
      .c-d20 {
        --d20-size: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--d20-size);
        height: var(--d20-size);
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        line-height: 0;
        opacity: 0.9;
        transition:
          opacity 0.15s,
          transform 0.15s;
      }
      .c-d20:hover:not(:disabled) {
        opacity: 1;
        transform: scale(1.18);
      }
      .c-d20:disabled {
        opacity: 0.3;
        cursor: default;
      }
      /* mask (the d20 shape) comes from the global .c-d20-mask class; here just size + fill. */
      .c-d20__glyph {
        width: 100%;
        height: 100%;
        background-color: currentColor;
      }
      /* disc: the button is a filled circle in the colour; the glyph on top is cream so it reads on any colour. */
      .c-d20--disc {
        border-radius: 50%;
        background: currentColor;
        padding: 13%;
      }
      .c-d20--disc .c-d20__glyph {
        background-color: #f6edd6;
      }
    `,
  ],
})
export class D20RollButtonComponent {
  /** Glyph colour (default look) or disc colour (disc mode). */
  readonly color = input<string>('#c8a96e');
  readonly size = input<number>(18);
  readonly disc = input<boolean>(false);
  readonly label = input<string>('Probe würfeln');
  readonly disabled = input<boolean>(false);
  readonly roll = output<void>();
}
