import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CURRENCYMAP, CurrencyRegion, CurrencyValue } from '../shared/constant';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.scss',
})
export class CurrencyComponent implements OnInit {
  public currencyOne = new FormControl<CurrencyRegion>(
    null,
    Validators.required
  );
  public currencyTwo = new FormControl<CurrencyRegion>(
    null,
    Validators.required
  );
  public exchangeRate = new FormControl(0, Validators.min(0));
  public coinControls: FormControl[][] = [[], []]; // 0 for currencyOne, 1 for currencyTwo

  public currencyOptions: string[] = Object.values(CurrencyRegion);
  public currencyValues: CurrencyValue[][] = [[], []]; // 0 for currencyOne, 1 for currencyTwo
  public remainderText: string = '';

  constructor(private translateService: TranslateService) {}

  public ngOnInit(): void {
    this.currencyOne.valueChanges.subscribe((value: CurrencyRegion) =>
      this.updateCurrency(0, value)
    );
    this.currencyTwo.valueChanges.subscribe((value: CurrencyRegion) =>
      this.updateCurrency(1, value)
    );
  }

  public isFormValid(): boolean {
    return this.currencyOne.valid && this.currencyOne.valid;
  }

  public sortCurrencyValue(currencies: CurrencyValue[]): CurrencyValue[] {
    return currencies.sort((a, b) => a.relativeValue - b.relativeValue);
  }

  public recalculate(): void {
    if (!this.currencyOne.valid || !this.currencyTwo.valid) return;

    let amount = this.calculateAmount(
      this.coinControls[0],
      this.currencyValues[0]
    );
    amount *= (100 - this.exchangeRate.value) / 100;

    amount = this.calculateChange(amount, 1);
    this.remainderText = this.calculateRemainderText(amount);
  }

  private calculateAmount(
    coinControls: FormControl[],
    currencyValues: CurrencyValue[]
  ): number {
    return coinControls.reduce((total, control, index) => {
      return (
        total + control.value * (currencyValues[index]?.relativeValue || 0)
      );
    }, 0);
  }

  private calculateChange(amount: number, index: number): number {
    const currencyValues: CurrencyValue[] = this.currencyValues[index];
    const controls: FormControl[] = this.coinControls[index];

    const currencyCount: number = currencyValues.length;

    for (let i = 1; i <= currencyCount; i++) {
      controls[currencyCount - i].setValue(
        Math.floor(amount / currencyValues[currencyCount - i].relativeValue)
      );
      amount %= currencyValues[currencyCount - i].relativeValue;
    }
    return amount;
  }

  private calculateRemainderText(amount: number): string {
    const currencyValues = this.currencyValues[0].reverse();
    const remainders = currencyValues
      .map((value) => {
        const count = Math.floor(amount / value.relativeValue);
        amount %= value.relativeValue;
        const currencyName = this.translateService.instant(
          `currency.currencyName.${value.name}`
        );
        return count > 0 ? `${count} ${currencyName}` : '';
      })
      .filter((text) => text !== '');

    if (remainders.length === 0) {
      return this.translateService.instant('currency.noRemainingCoins');
    }

    const andText = this.translateService.instant('shared.and');
    const remaindersText = remainders
      .join(', ')
      .replace(/, (?=[^,]*$)/, ` ${andText} `);
    return this.translateService.instant('currency.remainingCoins', {
      remainders: remaindersText,
    });
  }

  private updateCurrency(index: number, currency: CurrencyRegion): void {
    this.currencyValues[index] = CURRENCYMAP.get(currency) || [];
    this.coinControls[index] = this.currencyValues[index].map(
      () => new FormControl(0)
    );
    this.recalculate();
  }
}
