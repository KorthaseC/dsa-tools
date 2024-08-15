import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap } from 'rxjs';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, TranslateModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  languages: string[] = ['en', 'de'];

  private readonly defaultLang = 'de';
  private readonly titleKey = 'shared.title';
  private readonly descriptionKeyPrefix = 'meta.';
  private readonly keywordsKeyPrefix = 'meta.';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translateService: TranslateService,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Guard clause to exit if not in the browser environment
    }

    this.initializeLanguageSettings();
    this.handleRouteChanges();
  }

  public changeLanguage(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
    this.updateTitleAndMetaForCurrentRoute(); // Ensure title and meta tags are updated on language change
  }

  private initializeLanguageSettings(): void {
    const savedLang = localStorage.getItem('language') || this.defaultLang;
    this.translateService.setDefaultLang(savedLang);
    this.translateService.use(savedLang);

    this.translateService.onLangChange.subscribe(() => {
      this.updateTitleAndMetaForCurrentRoute();
    });
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

  private updateTitleAndMetaForCurrentRoute(): void {
    const activeRoute = this.getPrimaryRoute();
    activeRoute.data.subscribe((data: any) => {
      this.setTitleAndMeta(data);
    });
  }

  private setTitleAndMeta(data?: any): void {
    const translatedTitle = this.getTranslatedTitle(data?.title);
    this.titleService.setTitle(translatedTitle);

    this.updateMetaTags(data);
  }

  private getTranslatedTitle(routeTitleKey?: string): string {
    const baseTitle = this.translateService.instant(this.titleKey);
    if (routeTitleKey) {
      const routeTitle = this.translateService.instant(
        `header.${routeTitleKey}`
      );
      return `${baseTitle} - ${routeTitle}`;
    }
    return baseTitle;
  }

  private updateMetaTags(data?: any): void {
    if (data?.description) {
      this.metaService.updateTag({
        name: 'description',
        content: this.translateService.instant(
          `${this.descriptionKeyPrefix}${data.description}.description`
        ),
      });
    }

    if (data?.keywords) {
      this.metaService.updateTag({
        name: 'keywords',
        content: this.translateService.instant(
          `${this.keywordsKeyPrefix}${data.keywords}.keywords`
        ),
      });
    }
  }
}
