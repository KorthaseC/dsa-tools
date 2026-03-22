import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';

interface FeatureCard {
  title: string;
  routerLink: string;
  imgSrc: string;
  imgAlt: string;
  description: string;
  cols: number;
  rows: number;
}

@Component({
    selector: 'app-overview',
    imports: [CardModule, RouterModule, ],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  public featureCards: FeatureCard[] = [
    {
      title: 'Kalender',
      routerLink: '/calendar',
      imgSrc: 'assets/icons/satinavs.svg',
      imgAlt: 'Satinav Symbol',
      description: 'Tool zur Berechnung von Wochentag und Mondphase',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Währungsrechner',
      routerLink: '/currency',
      imgSrc: 'assets/icons/phex.svg',
      imgAlt: 'Phex Symbol',
      description: 'Tool zur Berechnung der Währungen',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Alchemielabor',
      routerLink: '/alchemy',
      imgSrc: 'assets/icons/ausfaellen.svg',
      imgAlt: 'Alchemy Symbol',
      description: 'Tool zur Erstellung von alchemistischen Mitteln',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Tavernengenerator',
      routerLink: '/tavern',
      imgSrc: 'assets/icons/travia.svg',
      imgAlt: 'Travia Symbol',
      description: 'Tool zur Erstellung von zufälligen Tavernen',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Namensgenerator',
      routerLink: '/names',
      imgSrc: 'assets/icons/namenloser.svg',
      imgAlt: 'Nameless Symbol',
      description: 'Tool zur Erstellung von zufälligen Namen',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Schmiede',
      routerLink: '/smith',
      imgSrc: 'assets/icons/ingerimm.svg',
      imgAlt: 'Ingerimm Symbol',
      description: 'Tool zur Berechnung von Preisen beim Schmied',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Büchergenerator',
      routerLink: '/books',
      imgSrc: 'assets/icons/nandus.svg',
      imgAlt: 'Nandus Symbol',
      description: 'Tool zur Erstellung von zufälligen Büchern',
      cols: 1,
      rows: 1,
    },
  ];

  constructor() {}
}
