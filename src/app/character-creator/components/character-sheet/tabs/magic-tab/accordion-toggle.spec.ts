import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';

// Mirrors how the sheet's tabs drive their accordions: one-way [value] from a signal plus a
// (valueChange) handler writing it back. Runs against the real PrimeNG build AND the real global
// stylesheet (karma loads src/styles.scss), so a broken style override shows up here.
@Component({
  standalone: true,
  imports: [AccordionModule, InputTextModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <p-accordion [multiple]="true" [value]="open()" (valueChange)="onChange($event)">
      <p-accordion-panel value="sa">
        <p-accordion-header>Magische Sonderfertigkeiten</p-accordion-header>
        <p-accordion-content>
          <div class="probe">Inhalt</div>
        </p-accordion-content>
      </p-accordion-panel>
    </p-accordion>

    <input pInputText class="locked" value="AM1 114" [disabled]="true" />
  `,
})
class HostComponent {
  readonly open = signal<string[]>(['sa']);
  onChange(v: string | number | (string | number)[]): void {
    this.open.set((Array.isArray(v) ? v : [v]).map(String));
  }
}

/** WCAG relative-luminance contrast ratio of two `rgb(...)` strings. */
function contrastRatio(a: string, b: string): number {
  const channels = (c: string) => (c.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
  const luminance = (c: string) => {
    const [r, g, bl] = channels(c).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('sheet accordions + locked fields', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  beforeEach(async () => {
    document.body.classList.add('app-dark'); // the theme tokens hang off body.app-dark
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => document.body.classList.remove('app-dark'));

  const header = (): HTMLElement => fixture.nativeElement.querySelector('.p-accordionheader');
  const panelIsActive = (): boolean => !!fixture.nativeElement.querySelector('.p-accordionpanel-active');
  /** The open/close animation needs real frames — a synchronous detectChanges() alone leaves the
   *  content in its collapsed "from" state, which looks exactly like a broken accordion. */
  const settle = async () => {
    await new Promise((r) => setTimeout(r, 600));
    fixture.detectChanges();
  };

  it('starts open, as the tabs configure it', () => {
    expect(host.open()).toEqual(['sa']);
    expect(panelIsActive()).toBe(true);
  });

  it('closes on the first header click and RE-OPENS on the next', () => {
    header().click();
    fixture.detectChanges();
    expect(host.open()).toEqual([]);
    expect(panelIsActive()).toBe(false);

    header().click();
    fixture.detectChanges();
    expect(host.open()).toEqual(['sa']);
    expect(panelIsActive()).toBe(true);
  });

  it('actually shows its content once the animation has run', async () => {
    await settle();
    const content = fixture.nativeElement.querySelector('.p-accordioncontent') as HTMLElement;
    expect(getComputedStyle(content).visibility).toBe('visible');
    expect(content.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it('keeps a locked (disabled) field readable — WCAG AA, 4.5:1', () => {
    // These fields are read-only, not unavailable: spell source/cost, tradition, species/culture.
    // $gold-dim used to paint them at 2.5:1, below even the 3:1 floor for UI elements.
    const input = fixture.nativeElement.querySelector('input.locked') as HTMLElement;
    const style = getComputedStyle(input);
    // WebKit/Blink paint disabled inputs with -webkit-text-fill-color, not `color`.
    const ink = style.webkitTextFillColor || style.color;
    expect(contrastRatio(ink, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  });
});
