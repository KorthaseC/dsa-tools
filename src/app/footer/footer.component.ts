import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import packageInfo from '../../../package.json';

import { APP_ROUTES } from '../app.constants';

/** External targets, rendered as real <a href> so they are crawlable and openable in a new tab. */
const EXTERNAL_LINKS = {
  github: 'https://github.com/KorthaseC/dsa-tools',
  discord: 'https://discord.com/invite/xftRCTHj7Y',
  ruleWiki: 'https://dsa.ulisses-regelwiki.de/',
} as const;

@Component({
  selector: 'app-footer',
  imports: [ButtonModule, PopoverModule, TooltipModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  public version: string = packageInfo.version;
  public readonly routes = APP_ROUTES;
  public readonly links = EXTERNAL_LINKS;
}
