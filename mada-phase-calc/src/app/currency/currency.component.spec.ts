import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CURRENCYMAP, CurrencyRegion, CurrencyValue } from '../shared/constant';
import { CurrencyComponent } from './currency.component';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CurrencyComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.currencyOne).toBeTruthy();
    expect(component.currencyTwo).toBeTruthy();
    expect(component.exchangeRate).toBeTruthy();
    expect(component.coinControls).toBeTruthy();
  });

  it('should validate form correctly', () => {
    component.currencyOne.setValue(CurrencyRegion.Bornland);
    component.currencyTwo.setValue(CurrencyRegion.HorasianEmpire);
    component.exchangeRate.setValue(5);
    expect(component.isFormValid()).toBeTrue();

    component.currencyOne.setValue(null);
    expect(component.isFormValid()).toBeFalse();
  });

  it('should sort currency values correctly', () => {
    const currencies: CurrencyValue[] = [
      { name: 'SilverThaler', relativeValue: 1 },
      { name: 'Kreutzer', relativeValue: 0.01 },
      { name: 'Haler', relativeValue: 0.1 },
    ];
    const sortedCurrencies = component.sortCurrencyValue(currencies);
    expect(sortedCurrencies).toEqual([
      { name: 'Kreutzer', relativeValue: 0.01 },
      { name: 'Haler', relativeValue: 0.1 },
      { name: 'SilverThaler', relativeValue: 1 },
    ]);
  });

  it('should recalculate amount correctly', () => {
    component.currencyOne.setValue(CurrencyRegion.Bornland);
    component.currencyTwo.setValue(CurrencyRegion.HorasianEmpire);
    component.exchangeRate.setValue(10);

    component.coinControls[0] = [new FormControl(5), new FormControl(3)];

    component.currencyValues[0] = [
      { name: 'SilverThaler', relativeValue: 1 },
      { name: 'Haler', relativeValue: 0.1 },
    ];

    component.currencyValues[1] = [
      { name: 'Gold', relativeValue: 1 },
      { name: 'Metal', relativeValue: 0.01 },
    ];

    spyOn<any>(component, 'calculateAmount').and.callThrough();
    spyOn<any>(component, 'calculateChange').and.callThrough();
    spyOn<any>(component, 'calculateRemainderText').and.callThrough();

    component.recalculate();

    expect(component['calculateAmount']).toHaveBeenCalled();
    expect(component['calculateChange']).toHaveBeenCalled();
    expect(component['calculateRemainderText']).toHaveBeenCalled();
  });

  it('should update currency values and controls correctly', () => {
    const currency: CurrencyRegion = CurrencyRegion.Bornland;
    const currencyValues: CurrencyValue[] = [
      { name: 'SilverThaler', relativeValue: 1 },
      { name: 'Haler', relativeValue: 0.1 },
    ];
    spyOn(component, 'recalculate');
    CURRENCYMAP.set(currency, currencyValues);

    component['updateCurrency'](0, currency);

    expect(component.currencyValues[0]).toEqual(currencyValues);
    expect(component.coinControls[0].length).toBe(currencyValues.length);
    expect(component.recalculate).toHaveBeenCalled();
  });
});
