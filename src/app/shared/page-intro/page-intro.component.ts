import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_FEATURES } from '../../app.features';

/**
 * Renders the current page's prose intro from the single feature registry (app.features.ts).
 *
 * The tool pages are otherwise nothing but form controls, so this is the only indexable text they
 * have. Keeping the copy in APP_FEATURES means each text exists exactly once and cannot drift from
 * the card descriptions that point at the same tool.
 */
@Component({
  selector: 'app-page-intro',
  template: `
    @if (introText) {
      <p class="c-page-intro">{{ introText }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './page-intro.component.scss',
})
export class PageIntroComponent {
  // Optional: this is a purely presentational component, and hard-requiring the router would force
  // every host component's unit test to set up routing just to render an intro paragraph.
  private readonly router = inject(Router, { optional: true });
  private readonly route = inject(ActivatedRoute, { optional: true });

  /** Resolved once at construction — a page intro never changes while the page is open. */
  public readonly introText = this.resolveIntro();

  private resolveIntro(): string | undefined {
    // Prefer the route's own path over router.url, which still carries query params and fragments.
    const configPath = this.route?.snapshot.routeConfig?.path;
    const urlPath = this.router?.url.split(/[?#]/)[0].replace(/^\//, '');
    const path = configPath ?? urlPath;
    if (path === undefined) return undefined;
    return APP_FEATURES.find((f) => f.route === `/${path}`)?.introText;
  }
}
