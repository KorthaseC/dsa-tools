import { Component, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  languages: string[] = ['en', 'de'];

  private translateService = inject(TranslateService);

  title = 'mada-phase-calc';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const defaultLang: string = localStorage.getItem('language') || 'de';
      this.translateService.setDefaultLang(defaultLang);
      this.translateService.use(defaultLang);
    }
  }

  public changeLanguage(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
  }
}
