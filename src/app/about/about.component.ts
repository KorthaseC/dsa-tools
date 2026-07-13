import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { APP_FEATURES } from '../app.features';

@Component({
  selector: 'app-about',
  imports: [RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  /** Derived from the single feature registry (app.features.ts) — the About list is never hand-maintained. */
  public features = APP_FEATURES.filter((f) => f.surfaces.includes('about')).map((f) => ({
    title: f.title,
    description: f.aboutDescription,
    routerLink: f.route,
  }));
}
