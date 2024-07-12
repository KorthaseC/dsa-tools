import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Utility } from '../shared/utility';
import { TavernGeneratorComponent } from './tavern-generator.component';
import { BED_PRICE_MODIFIER, TAVERN_LOCATIONS } from './tavern-generator.model';

describe('TavernGeneratorComponent', () => {
  let component: TavernGeneratorComponent;
  let fixture: ComponentFixture<TavernGeneratorComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TavernGeneratorComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TavernGeneratorComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'instant').and.callFake((key: string) => key);
    spyOn(translateService, 'get').and.callFake((key: string) => of(key));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form control and properties', () => {
    expect(component.location).toBeTruthy();
    expect(component.locationOptions).toEqual(TAVERN_LOCATIONS);
    expect(component.tavernName).toBe('');
    expect(component.tavernType).toBe('');
    expect(component.tavernQs).toBeUndefined();
    expect(component.priceGuestLvl).toBe(0);
    expect(component.seats).toBe(0);
    expect(component.beds).toBe(0);
    expect(component.keeper).toBe('');
  });

  it('should validate form correctly', () => {
    expect(component.isFormValid()).toBeFalse();
    component.location.setValue(TAVERN_LOCATIONS[0]);
    expect(component.isFormValid()).toBeTrue();
  });

  it('should generate tavern details correctly', () => {
    spyOn<any>(component, 'generateTavernName').and.returnValue('Test Tavern');
    spyOn<any>(component, 'generateTavernType').and.returnValue('Inn');
    spyOn<any>(component, 'generateTavernQs').and.returnValue({
      diceValueRange: [1, 20],
      tavernResult: 'Quality Service',
      modValue: 3,
    });
    spyOn<any>(component, 'generatePriceGuestLvl').and.returnValue(4);
    spyOn<any>(component, 'calculateSeats').and.returnValue(30);
    spyOn<any>(component, 'calculateBeds').and.returnValue(10);
    spyOn<any>(component, 'distributeBeds').and.returnValue({
      group: 1,
      twin: 3,
      single: 2,
    });
    spyOn<any>(component, 'generateKeeper').and.returnValue('John Doe');
    spyOn<any>(component, 'generateAttendant').and.returnValue('Jane Doe');
    spyOn<any>(component, 'generateSpecialEvent').and.returnValue('Festival');
    spyOn<any>(component, 'generateSpecialFeature').and.returnValue(
      'Fireplace'
    );
    spyOn<any>(component, 'generateSpecialGuest').and.returnValue('Nobleman');

    component.location.setValue(TAVERN_LOCATIONS[0]);
    component.getTavern();

    expect(component.tavernName).toBe('Test Tavern');
    expect(component.tavernType).toBe('Inn');
    expect(component.tavernQs).toEqual({
      diceValueRange: [1, 20],
      tavernResult: 'Quality Service',
      modValue: 3,
    });
    expect(component.priceGuestLvl).toBe(4);
    expect(component.seats).toBe(30);
    expect(component.beds).toBe(10);
    expect(component.distributedBeds).toEqual({
      group: 1,
      twin: 3,
      single: 2,
    });
    expect(component.keeper).toBe('John Doe');
    expect(component.attendant).toBe('Jane Doe');
    expect(component.specialEvent).toBe('Festival');
    expect(component.specialFeature).toBe('Fireplace');
    expect(component.specialGuest).toBe('Nobleman');
  });

  it('should calculate bed price correctly', () => {
    component.priceGuestLvl = 3;
    const expectedPrice = {
      priceGroupRooom: 6 * BED_PRICE_MODIFIER[2],
      priceTwinRoom: 5 * BED_PRICE_MODIFIER[2],
      singleRoom: 3 * BED_PRICE_MODIFIER[2],
    };
    const bedPriceText = component.calculateBedPrice();
    expect(bedPriceText).toBe('tavern.beds.price');
    expect(translateService.instant).toHaveBeenCalledWith(
      'tavern.beds.price',
      expectedPrice
    );
  });

  it('should distribute beds correctly', () => {
    const totalBeds = 10;
    component.tavernQs = {
      diceValueRange: [1, 20],
      tavernResult: 'Quality Service',
      modValue: 3,
    };
    const distributedBeds = component['distributeBeds'](totalBeds);

    expect(distributedBeds).toEqual(jasmine.any(Object));
    expect(distributedBeds.group).toBeGreaterThanOrEqual(0);
    expect(distributedBeds.twin).toBeGreaterThanOrEqual(0);
    expect(distributedBeds.single).toBeGreaterThanOrEqual(0);
  });

  it('should calculate seats correctly', () => {
    spyOn(Utility, 'rollDice').and.returnValue(4);
    const seats = component['calculateSeats'](3);
    expect(seats).toBeGreaterThanOrEqual(19);
    expect(seats).toBeLessThanOrEqual(27);
  });

  it('should calculate beds correctly', () => {
    spyOn(Utility, 'rollDice').and.returnValue(3);
    component.tavernType = 'Inn';
    const beds = component['calculateBeds'](3);
    expect(beds).toBe(6);
  });

  it('should get guest levels correctly', () => {
    spyOn(Utility, 'rollDice').and.returnValue(10);
    component['getGuestLevel']();
    expect(component.guestLevels).toEqual(jasmine.any(Array));
    expect(component.guestLevels.length).toBeGreaterThan(0);
  });

  it('should get active day times correctly', () => {
    component.guestLevels = [
      { dayTime: 'morning', guestLevel: 'high' },
      { dayTime: 'afternoon', guestLevel: 'low' },
      { dayTime: 'evening', guestLevel: 'medium' },
    ];
    const activeDays = component['getActiveDayTimes']();
    expect(activeDays).toEqual(['morning', 'evening']);
  });

  it('should generate event days text correctly', () => {
    component.activeDays = ['morning', 'evening'];
    const eventDaysText = component.getEventDaysText();
    expect(eventDaysText).toBe('tavern.events.text');
    expect(translateService.instant).toHaveBeenCalledWith('shared.or');
    expect(translateService.instant).toHaveBeenCalledWith(
      'tavern.guestLvl.morning'
    );
    expect(translateService.instant).toHaveBeenCalledWith(
      'tavern.guestLvl.evening'
    );
    expect(translateService.instant).toHaveBeenCalledWith(
      'tavern.events.text',
      {
        dayTimes: 'tavern.guestLvl.morning shared.or tavern.guestLvl.evening',
      }
    );
  });

  it('should generate distribute beds text correctly', () => {
    component.distributedBeds = { group: 1, twin: 2, single: 3 };
    component['groupBeds'] = 5;
    const bedsText = component.distributeBedsText();
    expect(bedsText).toBe('tavern.rooms.available.multi');

    expect(translateService.instant).toHaveBeenCalledWith(
      'tavern.rooms.group',
      { count: 1, beds: 5 }
    );
    expect(translateService.instant).toHaveBeenCalledWith('tavern.rooms.twin', {
      count: 2,
    });
    expect(translateService.instant).toHaveBeenCalledWith(
      'tavern.rooms.single',
      { count: 3 }
    );
    expect(translateService.instant).toHaveBeenCalledWith('shared.and', {});
    expect(translateService.instant).toHaveBeenCalledWith(
      'tavern.rooms.available.multi',
      {
        rooms:
          'tavern.rooms.group, tavern.rooms.twin shared.and tavern.rooms.single',
      }
    );
  });
});
