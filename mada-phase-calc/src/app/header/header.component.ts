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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatTooltipModule,
    MatCheckboxModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, AfterViewInit {
  public pageTitle: string = 'Übersicht';
  public isRollMulti: FormControl = new FormControl(false);
  public isSelectMulti: FormControl = new FormControl(false);

  public isGerman: FormControl = new FormControl(true);

  @ViewChild('languageSwitch', { read: ElementRef }) element:
    | ElementRef
    | undefined;

  private selcetDice: string[] = [];

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

  public deactivateOtherCheckbox(event: boolean, isMultiRoll: boolean): void {
    if (event && isMultiRoll) {
      this.isSelectMulti.setValue(false);
    }

    if (event && !isMultiRoll) {
      this.isRollMulti.setValue(false);
    }
  }

  public rollDice(dice: string): void {
    if (this.isSelectMulti.value) {
      this.addDice(dice);
    }
    if (this.isRollMulti.value) {
      diceBox.add(dice);
    }
    if (!this.isSelectMulti.value && !this.isRollMulti.value) {
      diceBox.roll(dice);
    }
  }

  public deletDice(): void {
    diceBox.clear();
    this.selcetDice = [];
  }

  public rollAllDice(): void {
    diceBox.roll(this.selcetDice);
  }

  public findSelectedDieNumber(die: string): number {
    const diceIndex = this.selcetDice.findIndex((item) =>
      item.endsWith(die.slice(1))
    );

    if (diceIndex > -1) {
      const [count] = this.selcetDice[diceIndex].split('d');
      return parseInt(count);
    }
    return 0; // Return 0 if the die is not found in the array
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

  private addDice(dice: string): void {
    // Check if the dice already exists in the array
    const diceIndex = this.selcetDice.findIndex((item) =>
      item.endsWith(dice.slice(1))
    );

    if (diceIndex > -1) {
      // Increment the count of the existing dice
      const [count, die] = this.selcetDice[diceIndex].split('d');
      const newCount = parseInt(count) + 1;
      this.selcetDice[diceIndex] = `${newCount}d${die}`;
    } else {
      // Add the new dice to the array
      this.selcetDice.push(dice);
    }

    // Sort the array
    this.selcetDice.sort((a, b) => {
      const dieA = parseInt(a.split('d')[1]);
      const dieB = parseInt(b.split('d')[1]);
      return dieA - dieB;
    });
  }
}
