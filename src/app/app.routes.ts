import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { AlchemyComponent } from './alchemy/alchemy.component';
import { APP_ROUTES } from './app.constants';
import { BookGeneratorComponent } from './book-generator/book-generator.component';
import { BugReportComponent } from './bug-report/bug-report.component';
import { CharacterImporterComponent } from './character-creator/components/character-importer/character-importer.component';
import { CharacterLoaderComponent } from './character-creator/components/character-loader/character-loader.component';
import { CharacterWizardComponent } from './character-creator/components/character-wizard/character-wizard.component';
import { CurrencyComponent } from './currency/currency.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { CalendarComponent } from './calendar/calendar.component';
import { NameGeneratorComponent } from './name-generator/name-generator.component';
import { OverviewComponent } from './overview/overview.component';
import { SmithGeneratorComponent } from './smith-generator/smith-generator.component';
import { TavernGeneratorComponent } from './tavern-generator/tavern-generator.component';
import { TokenGeneratorComponent } from './token-generator/token-generator.component';

export const routes: Routes = [
  {
    path: APP_ROUTES.overview.slice(1),
    component: OverviewComponent,
    data: {
      title: 'overviewTitle',
      description: 'overview',
      keywords: 'overview',
    },
  },
  {
    path: APP_ROUTES.calendar.slice(1),
    component: CalendarComponent,
    data: {
      title: 'calendarTitle',
      description: 'calendar',
      keywords: 'calendar',
    },
  },
  {
    path: APP_ROUTES.currency.slice(1),
    component: CurrencyComponent,
    data: {
      title: 'currencyTitle',
      description: 'currency',
      keywords: 'currency',
    },
  },
  {
    path: APP_ROUTES.alchemy.slice(1),
    component: AlchemyComponent,
    data: {
      title: 'alchemyTitle',
      description: 'alchemy',
      keywords: 'alchemy',
    },
  },
  {
    path: APP_ROUTES.tavern.slice(1),
    component: TavernGeneratorComponent,
    data: { title: 'tavernTitle', description: 'tavern', keywords: 'tavern' },
  },
  {
    path: APP_ROUTES.names.slice(1),
    component: NameGeneratorComponent,
    data: {
      title: 'nameGeneratorTitle',
      description: 'names',
      keywords: 'names',
    },
  },
  {
    path: APP_ROUTES.smith.slice(1),
    component: SmithGeneratorComponent,
    data: {
      title: 'smithGeneratorTitle',
      description: 'smith',
      keywords: 'smith',
    },
  },
  {
    path: APP_ROUTES.books.slice(1),
    component: BookGeneratorComponent,
    data: {
      title: 'bookGeneratorTitle',
      description: 'books',
      keywords: 'books',
    },
  },
  {
    path: APP_ROUTES.token.slice(1),
    component: TokenGeneratorComponent,
    data: { title: 'tokenGeneratorTitle', description: 'token', keywords: 'token' },
  },
  {
    path: APP_ROUTES.character.slice(1),
    component: CharacterLoaderComponent,
    data: {
      title: 'characterCreatorTitle',
      description: 'character-creator',
      keywords: 'character-creator',
    },
  },
  {
    path: APP_ROUTES.characterCreator.slice(1),
    component: CharacterWizardComponent,
    data: {
      title: 'characterCreatorTitle',
      description: 'character-creator',
      keywords: 'character-creator',
    },
  },
  {
    path: APP_ROUTES.characterImporter.slice(1),
    component: CharacterImporterComponent,
    data: {
      title: 'characterCreatorTitle',
      description: 'character-creator',
      keywords: 'character-creator',
    },
  },
  {
    path: APP_ROUTES.report.slice(1),
    component: BugReportComponent,
    data: { title: 'reportTitle', description: 'report', keywords: 'report' },
  },
  {
    path: APP_ROUTES.legal.slice(1),
    component: LegalNoticeComponent,
    data: { title: 'legalTitle', description: 'legal', keywords: 'legal' },
  },
  {
    path: APP_ROUTES.imprint.slice(1),
    component: ImpressumComponent,
    data: { title: 'imprintTitle', description: 'impressum', keywords: 'impressum' },
  },
  {
    path: APP_ROUTES.about.slice(1),
    component: AboutComponent,
    data: { title: 'aboutTitle', description: 'about', keywords: 'about' },
  },
  {
    path: '',
    redirectTo: APP_ROUTES.about.slice(1),
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: APP_ROUTES.overview.slice(1),
  },
];
