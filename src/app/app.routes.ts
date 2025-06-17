import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { AlchemyComponent } from './alchemy/alchemy.component';
import { BookGeneratorComponent } from './book-generator/book-generator.component';
import { BugReportComponent } from './bug-report/bug-report.component';
import { CharacterImporterComponent } from './character-creator/components/character-importer/character-importer.component';
import { CharacterLoaderComponent } from './character-creator/components/character-loader/character-loader.component';
import { CharacterWizardComponent } from './character-creator/components/character-wizard/character-wizard.component';
import { CurrencyComponent } from './currency/currency.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { MadaphaseComponent } from './madaphase/madaphase.component';
import { NameGeneratorComponent } from './name-generator/name-generator.component';
import { OverviewComponent } from './overview/overview.component';
import { SmithGeneratorComponent } from './smith-generator/smith-generator.component';
import { TavernGeneratorComponent } from './tavern-generator/tavern-generator.component';
import { WeekdayComponent } from './weekday/weekday.component';

export const routes: Routes = [
  {
    path: 'overview',
    component: OverviewComponent,
    data: {
      title: 'overviewTitle',
      description: 'overview',
      keywords: 'overview',
    },
  },
  {
    path: 'madaphase',
    component: MadaphaseComponent,
    data: {
      title: 'madaTitle',
      description: 'madaphase',
      keywords: 'madaphase',
    },
  },
  {
    path: 'weekday',
    component: WeekdayComponent,
    data: {
      title: 'weekdayTitle',
      description: 'weekday',
      keywords: 'weekday',
    },
  },
  {
    path: 'currency',
    component: CurrencyComponent,
    data: {
      title: 'currencyTitle',
      description: 'currency',
      keywords: 'currency',
    },
  },
  {
    path: 'alchemy',
    component: AlchemyComponent,
    data: {
      title: 'alchemyTitle',
      description: 'alchemy',
      keywords: 'alchemy',
    },
  },
  {
    path: 'tavern',
    component: TavernGeneratorComponent,
    data: { title: 'tavernTitle', description: 'tavern', keywords: 'tavern' },
  },
  {
    path: 'names',
    component: NameGeneratorComponent,
    data: {
      title: 'nameGeneratorTitle',
      description: 'names',
      keywords: 'names',
    },
  },
  {
    path: 'smith',
    component: SmithGeneratorComponent,
    data: {
      title: 'smithGeneratorTitle',
      description: 'smith',
      keywords: 'smith',
    },
  },
  {
    path: 'books',
    component: BookGeneratorComponent,
    data: {
      title: 'bookGeneratorTitle',
      description: 'books',
      keywords: 'books',
    },
  },
  {
    path: 'character',
    component: CharacterLoaderComponent,
    data: {
      title: 'characterCreatorTitle',
      description: 'character-creator',
      keywords: 'character-creator',
    },
  },
  {
    path: 'character-creator',
    component: CharacterWizardComponent,
    data: {
      title: 'characterCreatorTitle',
      description: 'character-creator',
      keywords: 'character-creator',
    },
  },
  {
    path: 'character-importer',
    component: CharacterImporterComponent,
    data: {
      title: 'characterCreatorTitle',
      description: 'character-creator',
      keywords: 'character-creator',
    },
  },
  {
    path: 'report',
    component: BugReportComponent,
    data: { title: 'reportTitle', description: 'report', keywords: 'report' },
  },
  {
    path: 'legal',
    component: LegalNoticeComponent,
    data: { title: 'legalTitle', description: 'legal', keywords: 'legal' },
  },
  {
    path: 'about',
    component: AboutComponent,
    data: { title: 'aboutTitle', description: 'about', keywords: 'about' },
  },
  {
    path: '',
    redirectTo: 'about',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];
