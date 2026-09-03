import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';

import { APP_FEATURES } from '../app.features';
import { PageIntroComponent } from '../shared/page-intro/page-intro.component';

@Component({
  selector: 'app-overview',
  imports: [PageIntroComponent, CardModule, RouterModule],
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  /** Derived from the single feature registry (app.features.ts) — the Overview grid is never hand-maintained. */
  public featureCards = APP_FEATURES.filter((f) => f.surfaces.includes('overview')).map((f) => ({
    title: f.title,
    routerLink: f.route,
    imgSrc: f.icon!,
    imgAlt: f.iconAlt!,
    description: f.overviewDescription,
  }));
}
