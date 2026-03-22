import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MOON_ICON, Months, MoonPhase, Weekdays } from '../shared/constant';
import { Utility } from '../shared/utility';
import { CalendarComponent } from './calendar.component';
import { MOON_PHASE_NAMES } from './calendar.constants';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form controls', () => {
    it('should initialize all form controls with null', () => {
      expect(component.dayControl.value).toBeNull();
      expect(component.monthControl.value).toBeNull();
      expect(component.yearControl.value).toBeNull();
    });

    it('should be invalid when all form controls are null', () => {
      expect(component.isFormValid()).toBeFalsy();
    });

    it('should be invalid when day is missing', () => {
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1050);
      expect(component.isFormValid()).toBeFalsy();
    });

    it('should be valid when all form controls have values', () => {
      component.dayControl.setValue(15);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1050);
      expect(component.isFormValid()).toBeTrue();
    });
  });

  describe('nameless days handling', () => {
    it('should switch dayOptions to NAMELESS_DAY_OPTIONS when month is namelessDays', () => {
      component.monthControl.setValue(Months.namelessDays);
      fixture.detectChanges();
      expect(component.dayOptions).toEqual([1, 2, 3, 4, 5]);
    });

    it('should reset dayControl to null if value is greater than 5 when month is namelessDays', () => {
      component.dayControl.setValue(10);
      component.monthControl.setValue(Months.namelessDays);
      fixture.detectChanges();
      expect(component.dayControl.value).toBeNull();
    });

    it('should keep dayControl value if it is 5 or less when month is namelessDays', () => {
      component.dayControl.setValue(4);
      component.monthControl.setValue(Months.namelessDays);
      fixture.detectChanges();
      expect(component.dayControl.value).toBe(4);
    });

    it('should restore full dayOptions when month changes away from namelessDays', () => {
      component.monthControl.setValue(Months.namelessDays);
      fixture.detectChanges();
      component.monthControl.setValue(Months.Boron);
      fixture.detectChanges();
      expect(component.dayOptions.length).toBe(30);
    });
  });

  describe('calcCalendar()', () => {
    it('should call Utility.calculateTestDay with the correct arguments', () => {
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365);
      spyOn(Utility, 'getWeekdayByIndex').and.returnValue(Weekdays.Windday);

      component.dayControl.setValue(18);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1050);
      component.calcCalendar();

      expect(Utility.calculateTestDay).toHaveBeenCalledWith(18, Months.Boron, 1050);
    });

    it('should set weekdayInfo after calcCalendar', () => {
      component.dayControl.setValue(18);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1050);
      component.calcCalendar();
      expect(component.weekdayInfo).toBeTruthy();
    });

    it('should set madaPhaseInfo after calcCalendar', () => {
      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();
      expect(component.madaPhaseInfo).toBeTruthy();
    });
  });

  describe('weekday calculation', () => {
    it('should set weekdayInfo to a known weekday string', () => {
      spyOn(Utility, 'getWeekdayByIndex').and.returnValue(Weekdays.Fireday);

      component.dayControl.setValue(18);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1050);
      component.calcCalendar();

      expect(component.weekdayInfo).toBe('Feuertag');
    });
  });

  describe('moon phase calculation', () => {
    it('should detect FullMoon on the reference day', () => {
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365);

      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();

      expect(component.madaPhaseInfo).toBe(MOON_PHASE_NAMES[MoonPhase.FullMoon]);
      expect(component.moonIcon).toBe(MOON_ICON[MoonPhase.FullMoon]);
    });

    it('should set nextFullMoonInfo to null on exact phase days', () => {
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365);

      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();

      expect(component.nextFullMoonInfo).toBeNull();
    });

    it('should set nextFullMoonInfo with days count when between phase days', () => {
      // 1 day after full moon reference = increasing moon, next full moon in 27 days
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365 + 1);

      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();

      expect(component.nextFullMoonInfo).toContain('Tagen');
    });

    it('should detect Helm phase (quarter moon, 7 days after full moon)', () => {
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365 + 7);

      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();

      expect(component.madaPhaseInfo).toBe(MOON_PHASE_NAMES[MoonPhase.Helmet]);
    });

    it('should detect NewMoon phase (14 days after full moon)', () => {
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365 + 14);

      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();

      expect(component.madaPhaseInfo).toBe(MOON_PHASE_NAMES[MoonPhase.NewMoon]);
    });

    it('should detect Chalice phase (21 days after full moon)', () => {
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365 + 21);

      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();

      expect(component.madaPhaseInfo).toBe(MOON_PHASE_NAMES[MoonPhase.Chalice]);
    });

    it('should use singular "Tag" when next full moon is in exactly 1 day', () => {
      // 27 days after full moon = 1 day until next full moon
      spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365 + 27);

      component.dayControl.setValue(1);
      component.monthControl.setValue(Months.Boron);
      component.yearControl.setValue(1047);
      component.calcCalendar();

      expect(component.nextFullMoonInfo).toContain('1 Tag.');
    });
  });
});

