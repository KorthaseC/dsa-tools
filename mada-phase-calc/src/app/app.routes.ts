import { Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { WeekdayComponent } from './weekday/weekday.component';
import { MadaphaseComponent } from './madaphase/madaphase.component';
import { CurrencyComponent } from './currency/currency.component';
import { AlchemyComponent } from './alchemy/alchemy.component';
import { TavernGeneratorComponent } from './tavern-generator/tavern-generator.component';
import { NameGeneratorComponent } from './name-generator/name-generator.component';
import { SmithGeneratorComponent } from './smith-generator/smith-generator.component';
import { BugReportComponent } from './bug-report/bug-report.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';

export const routes: Routes = [
  {
    path: 'overview',
    component: OverviewComponent,
  },
  {
    path: 'madaphase',
    component: MadaphaseComponent,
  },
  {
    path: 'weekday',
    component: WeekdayComponent,
  },
  {
    path: 'currency',
    component: CurrencyComponent,
  },
  {
    path: 'alchemy',
    component: AlchemyComponent,
  },
  {
    path: 'tavern',
    component: TavernGeneratorComponent,
  },
  {
    path: 'names',
    component: NameGeneratorComponent,
  },
  {
    path: 'smith',
    component: SmithGeneratorComponent,
  },
  {
    path: 'report',
    component: BugReportComponent,
  },
  {
    path: 'legal',
    component: LegalNoticeComponent,
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
