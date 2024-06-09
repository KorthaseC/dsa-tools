import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import DiceBox from '@3d-dice/dice-box';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from '../app.component';

const diceBox = new DiceBox('#dice-box', {
  assetPath: '/assets/dice-box/', // include the trailing backslash
});

diceBox.init().then(() => {});

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSlideToggleModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, AfterViewInit {
  public pageTitle: string = 'Übersicht';
  public isRollMulti: FormControl = new FormControl(false);

  public isGerman: FormControl = new FormControl(true);

  @ViewChild('languageSwitch', { read: ElementRef }) element:
    | ElementRef
    | undefined;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private appComponent: AppComponent
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
  }

  public ngOnInit(): void {
    this.isGerman.valueChanges.subscribe((isGerman) => {
      const lang = isGerman ? 'de' : 'en';
      this.appComponent.changeLanguage(lang);
      this.updatePageTitle(this.router.url);
    });
  }

  //change slide toggle icon
  public ngAfterViewInit(): void {
    if (this.element) {
      const usaFlagLink: string =
        'https://upload.wikimedia.org/wikipedia/commons/8/88/United-states_flag_icon_round.svg';
      this.element.nativeElement.querySelector(
        '.mdc-switch__icon--off'
      ).innerHTML = `<img src=${usaFlagLink} />`;
      this.element.nativeElement.querySelector(
        '.mdc-switch__icon--off'
      ).style.backgroundImage = `url(${usaFlagLink})`;
      this.element.nativeElement.querySelector(
        '.mdc-switch__icon--off'
      ).style.backgroundSize = 'contain'; // change size of the image

      const germanFlagLink: string =
        'https://upload.wikimedia.org/wikipedia/commons/4/46/Flag_orb_Germany.svg';
      this.element.nativeElement.querySelector(
        '.mdc-switch__icon--on'
      ).innerHTML = `
        <img src=${germanFlagLink} />
      `;
      this.element.nativeElement.querySelector(
        '.mdc-switch__icon--on'
      ).style.backgroundImage = `url(${germanFlagLink})`;
      this.element.nativeElement.querySelector(
        '.mdc-switch__icon--on'
      ).style.backgroundSize = 'contain'; // change size of the image
    }
  }

  private updatePageTitle(url: string): void {
    let translationKey: string;
    switch (url) {
      case '/madaphase':
        translationKey = 'header.madaTitle';
        break;
      case '/weekday':
        translationKey = 'header.weekdayTitle';
        break;
      case '/currency':
        translationKey = 'header.currencyTitle';
        break;
      case '/alchemy':
        translationKey = 'header.alchemyTitle';
        break;
      default:
        translationKey = 'header.overviewTitle';
        break;
    }

    this.translateService
      .get(translationKey)
      .subscribe((translation: string) => {
        this.pageTitle = translation;
      });
  }

  public rollDice(dice: string): void {
    if (this.isRollMulti.value) {
      diceBox.add(dice);
    } else {
      diceBox.roll(dice);
    }
  }

  public deletDice(): void {
    diceBox.clear();
  }
}
