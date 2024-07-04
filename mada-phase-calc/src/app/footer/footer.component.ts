import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { version } from '../../../package.json';
import { ulissesIcon } from './footer.constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    TranslateModule,
    RouterModule,
    MatTooltipModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  public version: string = version;
  public ulissesIcon: string = ulissesIcon;

  constructor() {}

  public goToLink(url: string): void {
    window.open(url, '_blank');
  }
}
