import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';

import { APP_ROUTES } from '../app.constants';

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
  imports: [CardModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  public featureCards: FeatureCard[] = [
    {
      title: 'Kalender',
      routerLink: APP_ROUTES.calendar,
      imgSrc: 'assets/icons/satinavs.svg',
      imgAlt: 'Satinav Symbol',
      description: 'Tool zur Berechnung von Wochentag und Mondphase',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Währungsrechner',
      routerLink: APP_ROUTES.currency,
      imgSrc: 'assets/icons/phex.svg',
      imgAlt: 'Phex Symbol',
      description: 'Tool zur Berechnung der Währungen',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Alchemielabor',
      routerLink: APP_ROUTES.alchemy,
      imgSrc: 'assets/icons/ausfaellen.svg',
      imgAlt: 'Alchemy Symbol',
      description: 'Tool zur Erstellung von alchemistischen Mitteln',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Tavernengenerator',
      routerLink: APP_ROUTES.tavern,
      imgSrc: 'assets/icons/travia.svg',
      imgAlt: 'Travia Symbol',
      description: 'Tool zur Erstellung von zufälligen Tavernen',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Namensgenerator',
      routerLink: APP_ROUTES.names,
      imgSrc: 'assets/icons/namenloser.svg',
      imgAlt: 'Nameless Symbol',
      description: 'Tool zur Erstellung von zufälligen Namen',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Schmiede',
      routerLink: APP_ROUTES.smith,
      imgSrc: 'assets/icons/ingerimm.svg',
      imgAlt: 'Ingerimm Symbol',
      description: 'Tool zur Berechnung von Preisen beim Schmied',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Büchergenerator',
      routerLink: APP_ROUTES.books,
      imgSrc: 'assets/icons/nandus.svg',
      imgAlt: 'Nandus Symbol',
      description: 'Tool zur Erstellung von zufälligen Büchern',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Charaktererschaffer',
      routerLink: APP_ROUTES.character,
      imgSrc: 'assets/icons/tsa.svg',
      imgAlt: 'Tsa Symbol',
      description: 'Tool zur Erstellung von Charakteren',
      description: 'Tool zur Erstellung von zufälligen Büchern',
      cols: 1,
      rows: 1,
    },
    {
      title: 'Token Generator',
      routerLink: '/token',
      imgSrc: 'assets/icons/rur-und-gror.svg',
      imgAlt: 'Rur und Gror Symbol',
      description: 'Tool zur Erstellung von Charakter-Token',
      cols: 1,
      rows: 1,
    },
  ];

  constructor() {}
}
