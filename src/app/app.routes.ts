import { Routes } from '@angular/router';
import { APP_ROUTES } from './app.constants';

// All routes are lazy (loadComponent) so each feature — especially the character-creator, which imports
// the large generated DSA catalog consts — lands in its own on-demand chunk and stays OUT of the initial
// bundle. The character-creator's loader/wizard/sheet share one common chunk (state + catalog), loaded
// only when you first enter it.
export const routes: Routes = [
  // The domain root is the strongest URL, so it renders the About content directly instead of
  // redirecting to it. /about stays as a redirect so old links and bookmarks keep working.
  {
    path: '',
    loadComponent: () => import('./about/about.component').then((m) => m.AboutComponent),
    pathMatch: 'full',
    data: { title: 'homeTitle', description: 'home', isHome: true },
  },
  {
    path: APP_ROUTES.about.slice(1),
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: APP_ROUTES.overview.slice(1),
    loadComponent: () => import('./overview/overview.component').then((m) => m.OverviewComponent),
    data: { title: 'overviewTitle', description: 'overview' },
  },
  {
    path: APP_ROUTES.calendar.slice(1),
    loadComponent: () => import('./calendar/calendar.component').then((m) => m.CalendarComponent),
    data: { title: 'calendarTitle', description: 'calendar' },
  },
  {
    path: APP_ROUTES.currency.slice(1),
    loadComponent: () => import('./currency/currency.component').then((m) => m.CurrencyComponent),
    data: { title: 'currencyTitle', description: 'currency' },
  },
  {
    path: APP_ROUTES.alchemy.slice(1),
    loadComponent: () => import('./alchemy/alchemy.component').then((m) => m.AlchemyComponent),
    data: { title: 'alchemyTitle', description: 'alchemy' },
  },
  {
    path: APP_ROUTES.tavern.slice(1),
    loadComponent: () => import('./tavern-generator/tavern-generator.component').then((m) => m.TavernGeneratorComponent),
    data: { title: 'tavernTitle', description: 'tavern' },
  },
  {
    path: APP_ROUTES.names.slice(1),
    loadComponent: () => import('./name-generator/name-generator.component').then((m) => m.NameGeneratorComponent),
    data: { title: 'nameGeneratorTitle', description: 'names' },
  },
  {
    path: APP_ROUTES.smith.slice(1),
    loadComponent: () => import('./smith-generator/smith-generator.component').then((m) => m.SmithGeneratorComponent),
    data: { title: 'smithGeneratorTitle', description: 'smith' },
  },
  {
    path: APP_ROUTES.books.slice(1),
    loadComponent: () => import('./book-generator/book-generator.component').then((m) => m.BookGeneratorComponent),
    data: { title: 'bookGeneratorTitle', description: 'books' },
  },
  {
    path: APP_ROUTES.token.slice(1),
    loadComponent: () => import('./token-generator/token-generator.component').then((m) => m.TokenGeneratorComponent),
    data: { title: 'tokenGeneratorTitle', description: 'token' },
  },
  {
    path: APP_ROUTES.character.slice(1),
    loadComponent: () => import('./character-creator/components/character-loader/character-loader.component').then((m) => m.CharacterLoaderComponent),
    data: { title: 'characterCreatorTitle', description: 'character' },
  },
  // noindex: both are empty without a character in progress, and shared /character's metadata.
  {
    path: APP_ROUTES.characterCreator.slice(1),
    loadComponent: () => import('./character-creator/components/character-wizard/character-wizard.component').then((m) => m.CharacterWizardComponent),
    data: { title: 'characterCreatorTitle', description: 'character-creator', noindex: true },
  },
  {
    path: APP_ROUTES.characterSheet.slice(1),
    loadComponent: () => import('./character-creator/components/character-sheet/character-sheet.component').then((m) => m.CharacterSheetComponent),
    data: { title: 'characterSheetTitle', description: 'character-sheet', noindex: true },
  },
  {
    path: APP_ROUTES.report.slice(1),
    loadComponent: () => import('./bug-report/bug-report.component').then((m) => m.BugReportComponent),
    data: { title: 'reportTitle', description: 'report', noindex: true },
  },
  {
    path: APP_ROUTES.legal.slice(1),
    loadComponent: () => import('./legal-notice/legal-notice.component').then((m) => m.LegalNoticeComponent),
    data: { title: 'legalTitle', description: 'legal' },
  },
  {
    path: APP_ROUTES.imprint.slice(1),
    // 'imprint', not 'impressum' — the METADATA maps are keyed by the route name, and the old
    // mismatch meant this page silently shipped no description at all.
    loadComponent: () => import('./impressum/impressum.component').then((m) => m.ImpressumComponent),
    data: { title: 'imprintTitle', description: 'imprint' },
  },
  // A real 404 page instead of redirecting unknown URLs to /overview, which made every typo look
  // like a valid "Übersicht" page (soft 404) to crawlers.
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { title: 'notFoundTitle', description: 'notFound', noindex: true },
  },
];
