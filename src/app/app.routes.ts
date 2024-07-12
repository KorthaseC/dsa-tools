import { Routes } from '@angular/router';
import { AlchemyComponent } from './alchemy/alchemy.component';
import { BugReportComponent } from './bug-report/bug-report.component';
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
    data: { title: 'overviewTitle' },
  },
  {
    path: 'madaphase',
    component: MadaphaseComponent,
    data: { title: 'madaTitle' },
  },
  {
    path: 'weekday',
    component: WeekdayComponent,
    data: { title: 'weekdayTitle' },
  },
  {
    path: 'currency',
    component: CurrencyComponent,
    data: { title: 'currencyTitle' },
  },
  {
    path: 'alchemy',
    component: AlchemyComponent,
    data: { title: 'alchemyTitle' },
  },
  {
    path: 'tavern',
    component: TavernGeneratorComponent,
    data: { title: 'tavernTitle' },
  },
  {
    path: 'names',
    component: NameGeneratorComponent,
    data: { title: 'nameGeneratorTitle' },
  },
  {
    path: 'smith',
    component: SmithGeneratorComponent,
    data: { title: 'smithGeneratorTitle' },
  },
  {
    path: 'report',
    component: BugReportComponent,
    data: { title: 'reportTitle' },
  },
  {
    path: 'legal',
    component: LegalNoticeComponent,
    data: { title: 'legalTitle' },
  },
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];
