import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';
import { APP_ROUTES, ROUTE_TITLES } from '../app.constants';
import { DiceRollsComponent } from '../dice-rolls/dice-rolls.component';

@Component({
  selector: 'app-header',
  imports: [TooltipModule, RouterModule, DiceRollsComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public pageTitle: string = 'overviewTitle';
  /** On the home page the content supplies the <h1>, so the header renders a plain paragraph. */
  public isHome = false;

  public readonly pageTitles = ROUTE_TITLES;
  public readonly routes = APP_ROUTES;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    // Resolve once up front: during prerender no further NavigationEnd fires, so without this every
    // prerendered page would ship the default <h1> ("Übersicht") instead of its own title.
    this.updatePageTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updatePageTitle();
    });
  }

  private updatePageTitle(): void {
    const activeRoute: ActivatedRoute = this.getActiveRoute(this.route);
    // snapshot can still be undefined when this runs before the first navigation resolves.
    const data = activeRoute?.snapshot?.data ?? {};
    this.pageTitle = data['title'] ?? 'overviewTitle';
    this.isHome = data['isHome'] === true;
  }

  private getActiveRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
