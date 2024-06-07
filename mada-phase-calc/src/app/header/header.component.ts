import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import DiceBox from '@3d-dice/dice-box';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

const diceBox = new DiceBox('#dice-box', {
  assetPath: '/assets/dice-box/', // include the trailing backslash
});

diceBox.init().then(() => {
  diceBox.roll('2d20');
});

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
export class HeaderComponent {
  public pageTitle: string = 'Übersicht';
  public isRollMulti: FormControl = new FormControl(false);

  constructor(
    private router: Router,
    private translateService: TranslateService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
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
    console.log('test');
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
