import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface Feature {
  featureName: string;
  routerLink: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslateModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  public features: Feature[] = [
    {
      featureName: 'overview',
      routerLink: '/overview',
    },
    {
      featureName: 'madaphase',
      routerLink: '/madaphase',
    },
    {
      featureName: 'weekday',
      routerLink: '/weekday',
    },
    {
      featureName: 'currency',
      routerLink: '/currency',
    },
    {
      featureName: 'alchemy',
      routerLink: '/alchemy',
    },
    {
      featureName: 'tavern',
      routerLink: '/tavern',
    },
    {
      featureName: 'names',
      routerLink: '/names',
    },
    {
      featureName: 'smith',
      routerLink: '/smith',
    },
    {
      featureName: 'books',
      routerLink: '/books',
    },
    {
      featureName: 'report',
      routerLink: '/report',
    },
    {
      featureName: 'legal',
      routerLink: '/legal',
    },
  ];
}
