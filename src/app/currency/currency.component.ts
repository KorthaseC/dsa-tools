import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CURRENCYMAP, CurrencyRegion, CurrencyValue } from '../shared/constant';

@Component({
    selector: 'app-currency',
    imports: [
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    
],
    templateUrl: './currency.component.html',
    styleUrl: './currency.component.scss'
})
export class CurrencyComponent implements OnInit {
  public readonly regionNames: Record<string, string> = {
    middenrealm: 'Mittelreich',
    duchyOfPaavi: 'Herzogtum Paavi',
    bornland: 'Bornland',
    vallusa: 'Vallusa',
    kingdomsOfAndergast: 'Königreiche Andergast',
    kingdomsOfNostria: 'Königreiche Nostria',
    horasianEmpire: 'Horasreich',
    amazonQueendom: 'Königinnenreich der Amazonen',
    mountainKingdom: 'Bergkönigreich',
    mhararanyatOfArania: 'Mhaharanyat Aranien',
    caliphate: 'Kalifat',
    grandEmirateOfMengbilla: 'Großemirat Mengbilla',
    alAnfanEmpire: 'Alanfanisches Imperium',
    kingdomOfBrabakIn: 'Königreich Brabak (in Brabak)',
    kingdomOfBrabakOut: 'Königreich Brabak (außerhalb Brabak)',
    kahetNiKemi: 'Káhet Ni Kemi',
  };

  public readonly currencyNames: Record<string, string> = {
    kreutzer: 'Kreuzer', haler: 'Heller', silverThaler: 'Silbertaler',
    ducat: 'Dukaten', guilder: 'Gulden', penny: 'Deut',
    silverGroschen: 'Silbergroschen', batze: 'Batzen', flindrich: 'Flindrich',
    stuiver: 'Stüber', witten: 'Witten', andrathaler: 'Andrataler',
    nostrianCrown: 'Nostrische Krone', kuslikWheel: 'Kusliker Rad',
    amazonCrown: 'Amazonenkrone', atebrox: 'Atebrox', arganbrox: 'Arganbrox',
    auromox: 'Auromox', kurush: 'Kurush', hallah: 'Hallah', shekel: 'Schekel',
    dinar: 'Dinar', muwlat: 'Muwlat', zechine: 'Zechine', maravedi: 'Maravedi',
    ikossar: 'Ikossar', tessar: 'Tessar', telar: 'Telar', dekat: 'Dekat',
    dirham: 'Dirham', smallOreal: 'Kleines Oreal', oreal: 'Oreal',
    doubloon: 'Dublone', brabacPenny: 'Brabakpfennig',
    brabacCrown: 'Brabakerrkrone', brabacCrownOutsideBrabak: 'Brabakerkrone (außerhalb)',
    shard: 'Scherbe', chryskl: 'Chryskl', hedsch: 'Hedsch', suvar: 'Suvar',
  };

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

  public currencyOptions = Object.values(CurrencyRegion).map((key) => ({
    label: this.regionNames[key] ?? key,
    value: key,
  }));
  public currencyValues: CurrencyValue[][] = [[], []]; // 0 for currencyOne, 1 for currencyTwo
  public remainderText: string = '';

  constructor() {}

  public ngOnInit(): void {
    this.currencyOne.valueChanges.subscribe((value: CurrencyRegion) =>
      this.updateCurrency(0, value)
    );
    this.currencyTwo.valueChanges.subscribe((value: CurrencyRegion) =>
      this.updateCurrency(1, value)
    );
  }

  public isFormValid(): boolean {
    return this.currencyOne.valid && this.currencyTwo.valid;
  }

  public sortCurrencyValue(currencies: CurrencyValue[]): CurrencyValue[] {
    return [...currencies].sort((a, b) => a.relativeValue - b.relativeValue);
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
    const currencyValues = [...this.currencyValues[0]].reverse();
    const remainders = currencyValues
      .map((value) => {
        const count = Math.floor(amount / value.relativeValue);
        amount %= value.relativeValue;
        const currencyName = this.currencyNames[value.name] ?? value.name;
        return count > 0 ? `${count} ${currencyName}` : '';
      })
      .filter((text) => text !== '');

    if (remainders.length === 0) {
      return 'Es ist kein Restgeld übrig.';
    }

    const remaindersText = remainders
      .join(', ')
      .replace(/, (?=[^,]*$)/, ' und ');
    return `Es sind noch ${remaindersText} übrig.`;
  }

  private updateCurrency(index: number, currency: CurrencyRegion): void {
    this.currencyValues[index] = CURRENCYMAP.get(currency) || [];
    this.coinControls[index] = this.currencyValues[index].map(
      () => new FormControl(0)
    );
    this.remainderText = '';
    this.recalculate();
  }
}
