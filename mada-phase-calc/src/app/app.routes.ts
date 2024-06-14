import { Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { WeekdayComponent } from './weekday/weekday.component';
import { MadaphaseComponent } from './madaphase/madaphase.component';
import { CurrencyComponent } from './currency/currency.component';
import { AlchemyComponent } from './alchemy/alchemy.component';
import { TavernGeneratorComponent } from './tavern-generator/tavern-generator.component';

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
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];
