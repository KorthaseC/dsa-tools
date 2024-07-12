import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Months, Weekdays } from '../shared/constant';
import { Utility } from '../shared/utility';
import { WeekdayComponent } from './weekday.component';

describe('WeekdayComponent', () => {
  let component: WeekdayComponent;
  let fixture: ComponentFixture<WeekdayComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WeekdayComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WeekdayComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'instant').and.callFake((key: string) => key);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls with null', () => {
    expect(component.dayControl.value).toBeNull();
    expect(component.monthControl.value).toBeNull();
    expect(component.yearControl.value).toBeNull();
  });

  it('should be invalid when form controls are null', () => {
    expect(component.isFormValid()).toBeFalsy();
  });

  it('should handle nameless days correctly', () => {
    component.dayControl.setValue(6);
    component.monthControl.setValue(Months.namelessDays);
    fixture.detectChanges();

    expect(component.dayControl.value).toBeNull();
    expect(component.dayOptions).toEqual([1, 2, 3, 4, 5]);
  });

  it('should reset dayControl value if it is greater than 5 when month is namelessDays', () => {
    component.dayControl.setValue(10);
    component.monthControl.setValue(Months.namelessDays);
    fixture.detectChanges();
    expect(component.dayControl.value).toBeNull();
  });

  it('should calculate weekday correctly', () => {
    spyOn(Utility, 'calculateTestDay').and.returnValue(1050 * 365 + 18);
    spyOn(Utility, 'getWeekdayByIndex').and.returnValue(Weekdays.Fireday);

    component.dayControl.setValue(18);
    component.monthControl.setValue(Months.Boron);
    component.yearControl.setValue(1050);

    component.calcWeekday();

    expect(Utility.calculateTestDay).toHaveBeenCalledWith(
      18,
      Months.Boron,
      1050
    );
    expect(Utility.getWeekdayByIndex).toHaveBeenCalledWith(jasmine.any(Number));
    expect(translateService.instant).toHaveBeenCalledWith(
      'weekday.day.fireday'
    );
  });
});
