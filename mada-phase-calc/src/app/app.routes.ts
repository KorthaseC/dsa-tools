import { Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { WeekdayComponent } from './weekday/weekday.component';
import { MadaphaseComponent } from './madaphase/madaphase.component';
import { CurrencyComponent } from './currency/currency.component';
import { AlchemyComponent } from './alchemy/alchemy.component';

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
    path: '**',
    redirectTo: 'overview',
  },
];
