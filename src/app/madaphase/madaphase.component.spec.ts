import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Months, MOON_ICON, MoonPhase } from '../shared/constant';
import { Utility } from '../shared/utility';
import { MadaphaseComponent } from './madaphase.component';

describe('MadaphaseComponent', () => {
  let component: MadaphaseComponent;
  let fixture: ComponentFixture<MadaphaseComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MadaphaseComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MadaphaseComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'instant').and.callFake((key: string) => key);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.dayControl).toBeTruthy();
    expect(component.monthControl).toBeTruthy();
    expect(component.yearControl).toBeTruthy();
  });

  it('should validate form', () => {
    component.dayControl.setValue(15);
    component.monthControl.setValue(Months.Boron);
    component.yearControl.setValue(2023);
    expect(component.isFormValid()).toBeTrue();
  });

  it('should invalidate form with missing values', () => {
    component.dayControl.setValue(null);
    component.monthControl.setValue(Months.Boron);
    component.yearControl.setValue(2023);
    expect(component.isFormValid()).toBeFalse();
  });

  it('should calculate moon phase correctly', () => {
    spyOn(Utility, 'calculateTestDay').and.returnValue(184 + 1047 * 365);
    component.dayControl.setValue(1);
    component.monthControl.setValue(Months.Boron);
    component.yearControl.setValue(1047);
    component.calcMadaPhase();
    expect(component.madaPhaseInfo).toEqual('madaPhase.phase.fullMoon');
    expect(component.moonIcon).toEqual(MOON_ICON[MoonPhase.FullMoon]);
  });

  it('should handle nameless days correctly', () => {
    component.dayControl.setValue(6);
    component.monthControl.setValue(Months.namelessDays);
    fixture.detectChanges();

    expect(component.dayControl.value).toBeNull();
    expect(component.dayOptions).toEqual([1, 2, 3, 4, 5]);
  });

  it('should set next full moon info', () => {
    component.dayControl.setValue(1);
    component.monthControl.setValue(Months.Boron);
    component.yearControl.setValue(1047);
    component.calcMadaPhase();
    expect(component.nextFullMoonInfo).toBeNull(); // Check initial state

    // Set next full moon info
    spyOn<any>(component, 'calcNextFullMoon').and.returnValue(true);
    component['updateMadaPhaseProperties'](10, 10);
    expect(component.nextFullMoonInfo).toContain(
      'madaPhase.nextFullMoon.nextFullMoonIn'
    );
  });

  it('should correctly identify moon phase', () => {
    const phase = component['getMoonPhase'](0, 0);
    expect(phase).toEqual(MoonPhase.FullMoon);

    const increasingPhase = component['getMoonPhase'](10, 10);
    expect(increasingPhase).toEqual(MoonPhase.Decreasing);
  });
});
