import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import packageInfo from '../../../package.json';

import { APP_ROUTES } from '../app.constants';

@Component({
  selector: 'app-footer',
  imports: [ButtonModule, PopoverModule, TooltipModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  public version: string = packageInfo.version;
  public readonly routes = APP_ROUTES;

  constructor() {}

  public goToLink(url: string): void {
    window.open(url, '_blank');
  }
}
