import { Component, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, TranslateModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  languages: string[] = ['en', 'de'];

  public title = 'DSA Tools';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translateService: TranslateService,
    private titleService: Title
  ) {}

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const defaultLang: string = localStorage.getItem('language') || 'de';
      this.translateService.setDefaultLang(defaultLang);
      this.translateService.use(defaultLang);

      this.setTitle();

      this.translateService.onLangChange.subscribe(() => {
        this.setTitle(); // Update title when the language changes
      });
    }
  }

  public changeLanguage(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
  }

  private setTitle(): void {
    const translatedTitle = this.translateService.instant('shared.title');
    this.titleService.setTitle(translatedTitle);
  }
}
