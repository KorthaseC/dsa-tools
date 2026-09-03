import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SeoRouteData, SeoService } from './shared/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public ngOnInit(): void {
    // Also runs on the server: this is what writes title/description/canonical/OG into the
    // prerendered HTML. Resolve once synchronously, because during prerender no NavigationEnd
    // follows — every page would otherwise ship the bare defaults.
    this.applySeo();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.getPrimaryRoute().snapshot.data as SeoRouteData)
      )
      .subscribe((data) => this.seo.update(data, this.router.url));
  }

  private applySeo(): void {
    const route = this.getPrimaryRoute();
    this.seo.update(route.snapshot.data as SeoRouteData, this.router.url);
  }

  private getPrimaryRoute(): ActivatedRoute {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
