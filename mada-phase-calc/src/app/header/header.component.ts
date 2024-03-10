import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public pageTitle: string = 'Übersicht';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/madaphase') {
          this.pageTitle = 'Mada Phasen Rechner';
        } else if (event.url === '/weekday') {
          this.pageTitle = 'Wochentag Rechner';
        } else {
          this.pageTitle = 'Übersicht';
        }
      });
  }
}
