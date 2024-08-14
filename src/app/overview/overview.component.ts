import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GridColsDirective } from '../shared/grid-cols.directive';

interface FeatureCard {
  title: string;
  routerLink: string;
  imgSrc: string;
  imgAlt: string;
  discritpion: string;
  cols: number;
  rows: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    MatCardModule,
    RouterModule,
    TranslateModule,
    MatGridListModule,
    GridColsDirective,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  public featureCards: FeatureCard[] = [
    {
      title: 'overview.madaPhase.title',
      routerLink: '/madaphase',
      imgSrc: 'assets/icons/mada.svg',
      imgAlt: 'Mada Symbol',
      discritpion: 'overview.madaPhase.description',
      cols: 1,
      rows: 1,
    },
    {
      title: 'overview.weekdays.title',
      routerLink: '/weekday',
      imgSrc: 'assets/icons/satinavs.svg',
      imgAlt: 'Satinav Symbol',
      discritpion: 'overview.weekdays.description',
      cols: 1,
      rows: 1,
    },
    {
      title: 'overview.currencyCalc.title',
      routerLink: '/currency',
      imgSrc: 'assets/icons/phex.svg',
      imgAlt: 'Phex Symbol',
      discritpion: 'overview.currencyCalc.description',
      cols: 1,
      rows: 1,
    },
    {
      title: 'overview.alchemy.title',
      routerLink: '/alchemy',
      imgSrc: 'assets/icons/ausfaellen.svg',
      imgAlt: 'Alchemy Symbol',
      discritpion: 'overview.madaPhase.description',
      cols: 1,
      rows: 1,
    },
    {
      title: 'overview.tavern.title',
      routerLink: '/tavern',
      imgSrc: 'assets/icons/travia.svg',
      imgAlt: 'Travia Symbol',
      discritpion: 'overview.tavern.description',
      cols: 1,
      rows: 1,
    },
    {
      title: 'overview.nameGenerator.title',
      routerLink: '/names',
      imgSrc: 'assets/icons/namenloser.svg',
      imgAlt: 'Nameless Symbol',
      discritpion: 'overview.nameGenerator.description',
      cols: 1,
      rows: 1,
    },
    {
      title: 'overview.smithGenerator.title',
      routerLink: '/smith',
      imgSrc: 'assets/icons/ingerimm.svg',
      imgAlt: 'Ingerimm Symbol',
      discritpion: 'overview.smithGenerator.description',
      cols: 1,
      rows: 1,
    },
    {
      title: 'overview.bookGenerator.title',
      routerLink: '/books',
      imgSrc: 'assets/icons/nandus.svg',
      imgAlt: 'Nandus Symbol',
      discritpion: 'overview.bookGenerator.description',
      cols: 1,
      rows: 1,
    },
  ];

  constructor() {}
}
