import { RenderMode, ServerRoute } from '@angular/ssr';
import { APP_ROUTES } from './app.constants';

/**
 * Render mode per route. Everything is prerendered (outputMode: "static") EXCEPT the two character
 * pages, which are client-rendered.
 *
 * Why: PrimeNG's `p-motion` (accordion/fieldset/panel) writes `visibility: hidden; max-height: 0`
 * as INLINE styles for its collapsed state. Prerendering serialises those into the HTML, and on
 * hydration Motion snapshots the element's current inline styles as the "original" it restores when
 * opening — so the snapshot IS the hidden state and the panel can never expand again. Both pages are
 * `noindex` and show nothing without a character in progress, so prerendering them buys nothing.
 */
export const serverRoutes: ServerRoute[] = [
  { path: APP_ROUTES.characterCreator.slice(1), renderMode: RenderMode.Client },
  { path: APP_ROUTES.characterSheet.slice(1), renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
