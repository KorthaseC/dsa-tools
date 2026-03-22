import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';
import { ROUTE_TITLES } from '../app.constants';
import { DiceRollsComponent } from '../dice-rolls/dice-rolls.component';

@Component({
    selector: 'app-header',
    imports: [TooltipModule, RouterModule, DiceRollsComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public pageTitle: string = 'overviewTitle';

  public readonly pageTitles = ROUTE_TITLES;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  private updatePageTitle(): void {
    const activeRoute: ActivatedRoute = this.getActiveRoute(this.route);
    if (activeRoute && activeRoute.snapshot.data['title']) {
      this.pageTitle = activeRoute.snapshot.data['title'];
    } else {
      this.pageTitle = 'overviewTitle';
    }
  }

  private getActiveRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
