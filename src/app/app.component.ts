import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';
import { APP_TITLE, META_DESCRIPTIONS, META_KEYWORDS, ROUTE_TITLES } from './app.constants';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.handleRouteChanges();
  }

  private handleRouteChanges(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.getPrimaryRoute()),
        mergeMap((route) => route.data)
      )
      .subscribe((data: any) => {
        this.setTitleAndMeta(data);
      });
  }

  private getPrimaryRoute(): ActivatedRoute {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private setTitleAndMeta(data?: any): void {
    if (data?.title) {
      const routeTitle = ROUTE_TITLES[data.title] ?? data.title;
      this.titleService.setTitle(`${APP_TITLE} - ${routeTitle}`);
    } else {
      this.titleService.setTitle(APP_TITLE);
    }

    if (data?.description) {
      const description = META_DESCRIPTIONS[data.description];
      if (description) {
        this.metaService.updateTag({ name: 'description', content: description });
      }
    }

    if (data?.keywords) {
      const keywords = META_KEYWORDS[data.keywords];
      if (keywords) {
        this.metaService.updateTag({ name: 'keywords', content: keywords });
      }
    }
  }
}
