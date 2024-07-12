import DiceBox from '@3d-dice/dice-box';
import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { AppComponent } from '../app.component';

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
    RouterModule,
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

  private diceBox: DiceBox | undefined;
  private selectDice: string[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appComponent: AppComponent,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public ngOnInit(): void {
    this.isGerman.valueChanges.subscribe((isGerman) => {
      const lang = isGerman ? 'de' : 'en';
      this.appComponent.changeLanguage(lang);
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  //change slide toggle icon
  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initDiceBox();

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
        ).innerHTML = `<img src=${germanFlagLink} />`;
        this.element.nativeElement.querySelector(
          '.mdc-switch__icon--on'
        ).style.backgroundImage = `url(${germanFlagLink})`;
        this.element.nativeElement.querySelector(
          '.mdc-switch__icon--on'
        ).style.backgroundSize = 'contain'; // change size of the image
      }
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
      this.diceBox.add(dice);
    }
    if (!this.isSelectMulti.value && !this.isRollMulti.value) {
      this.diceBox.roll(dice);
    }
  }

  public deletDice(): void {
    this.diceBox.clear();
    this.selectDice = [];
  }

  public rollAllDice(): void {
    this.diceBox.roll(this.selectDice);
  }

  public findSelectedDieNumber(die: string): number {
    const diceIndex = this.selectDice.findIndex((item) =>
      item.endsWith(die.slice(1))
    );

    if (diceIndex > -1) {
      const [count] = this.selectDice[diceIndex].split('d');
      return parseInt(count);
    }
    return 0; // Return 0 if the die is not found in the array
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

  private initDiceBox(): void {
    const diceBoxElement = document.querySelector('#dice-box');
    if (diceBoxElement) {
      this.diceBox = new DiceBox('#dice-box', {
        assetPath: '/assets/dice-box/',
      });

      this.diceBox.init().then(() => {
        // DiceBox is ready
      });
    }
  }

  private addDice(dice: string): void {
    // Check if the dice already exists in the array
    const diceIndex = this.selectDice.findIndex((item) =>
      item.endsWith(dice.slice(1))
    );

    if (diceIndex > -1) {
      // Increment the count of the existing dice
      const [count, die] = this.selectDice[diceIndex].split('d');
      const newCount = parseInt(count) + 1;
      this.selectDice[diceIndex] = `${newCount}d${die}`;
    } else {
      // Add the new dice to the array
      this.selectDice.push(dice);
    }

    // Sort the array
    this.selectDice.sort((a, b) => {
      const dieA = parseInt(a.split('d')[1]);
      const dieB = parseInt(b.split('d')[1]);
      return dieA - dieB;
    });
  }
}
