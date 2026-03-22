import { Component, effect, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DAY_OPTIONS, MONTH_NAMES, MOON_ICON, NAMELESS_DAY_OPTIONS, WEEKDAY_NAMES, Months, MoonPhase, Weekdays } from '../shared/constant';
import { Utility } from '../shared/utility';
import { FULL_MOON_REFERENCE_DAY, MOON_CYCLE_DAYS, MOON_PHASE_NAMES, WINDSTAG_REFERENCE_DAY } from './calendar.constants';

@Component({
    selector: 'app-calendar',
    imports: [
        FormsModule,
        FloatLabelModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        SelectModule,
    ],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  public dayControl   = new FormControl<number>(null);
  public monthControl = new FormControl<Months>(null);
  public yearControl  = new FormControl<number>(null);

  public monthSignal = signal(this.monthControl.value);

  public readonly monthNames = MONTH_NAMES;
  public dayOptions: number[] = DAY_OPTIONS;
  public monthOptions = Object.values(Months).map(m => ({ label: MONTH_NAMES[m] ?? m, value: m }));

  public weekdayInfo: string;
  public madaPhaseInfo: string;
  public nextFullMoonInfo: string;
  public moonIcon: string;

  private cycleDays: number;

  constructor() {
    this.monthControl.valueChanges.subscribe((newMonth) => {
      this.monthSignal.set(newMonth);
    });

    effect(() => {
      const selectedMonth = this.monthSignal();
      if (selectedMonth === Months.namelessDays) {
        this.dayOptions = NAMELESS_DAY_OPTIONS;
        this.dayControl.setValue(
          this.dayControl.value > 5 ? null : this.dayControl.value
        );
      } else {
        this.dayOptions = DAY_OPTIONS;
      }
    });
  }

  public isFormValid(): boolean {
    return (
      this.dayControl.valid && this.monthControl.valid && this.yearControl.valid
    );
  }

  public calcCalendar(): void {
    const testDay = Utility.calculateTestDay(
      this.dayControl.value,
      this.monthControl.value,
      this.yearControl.value
    );
    this.calcWeekday(testDay);
    this.calcMadaPhase(testDay);
  }

  private calcWeekday(testDay: number): void {
    let daysSinceWindstag = testDay - WINDSTAG_REFERENCE_DAY;

    if (daysSinceWindstag < 0) {
      daysSinceWindstag =
        (daysSinceWindstag % Object.values(Weekdays).length) +
        Object.values(Weekdays).length;
    }

    const weekdayIndex = daysSinceWindstag % Object.values(Weekdays).length;
    this.weekdayInfo =
      WEEKDAY_NAMES[Utility.getWeekdayByIndex(weekdayIndex)] ??
      Utility.getWeekdayByIndex(weekdayIndex);
  }

  private calcMadaPhase(testDay: number): void {
    const daysSinceFullMoon = testDay - FULL_MOON_REFERENCE_DAY;
    const cycleDaysPos = Math.abs(daysSinceFullMoon);
    const madaPhaseFraction = this.calculateCycleDayFraction(cycleDaysPos);
    this.updateMadaPhaseProperties(madaPhaseFraction, daysSinceFullMoon);
  }

  private calculateCycleDayFraction(cycleDaysPos: number): number {
    return parseInt((cycleDaysPos / MOON_CYCLE_DAYS).toFixed(2).split('.')[1]);
  }

  private updateMadaPhaseProperties(
    madaPhaseFraction: number,
    daysSinceFullMoon: number
  ): void {
    const phase = this.getMoonPhase(madaPhaseFraction, daysSinceFullMoon);
    this.madaPhaseInfo = MOON_PHASE_NAMES[phase] ?? phase;
    this.moonIcon = MOON_ICON[phase];

    if ([25, 50, 75, 0].includes(madaPhaseFraction)) {
      this.nextFullMoonInfo = null;
    } else {
      this.setNextFullMoonInfo(daysSinceFullMoon);
    }
  }

  private getMoonPhase(
    madaPhaseCalc: number,
    daysSinceFullMoon: number
  ): MoonPhase {
    switch (madaPhaseCalc) {
      case 25: return MoonPhase.Helmet;
      case 50: return MoonPhase.NewMoon;
      case 75: return MoonPhase.Chalice;
      case  0: return MoonPhase.FullMoon;
      default:
        return this.calcNextFullMoon(daysSinceFullMoon)
          ? MoonPhase.Increasing
          : MoonPhase.Decreasing;
    }
  }

  private setNextFullMoonInfo(daysSinceFullMoon: number): void {
    const isAscending = this.calcNextFullMoon(daysSinceFullMoon);
    if (isAscending) {
      this.nextFullMoonInfo =
        this.cycleDays === 1
          ? `Der nächste Vollmond ist in ${this.cycleDays} Tag.`
          : `Der nächste Vollmond ist in ${this.cycleDays} Tagen.`;
    } else {
      this.nextFullMoonInfo =
        this.cycleDays === 1
          ? `Der letzte Vollmond war vor ${MOON_CYCLE_DAYS - this.cycleDays} Tag.`
          : `Der letzte Vollmond war vor ${MOON_CYCLE_DAYS - this.cycleDays} Tagen.`;
    }
  }

  private calcNextFullMoon(daysSinceFullMoon: number): boolean {
    let isAscendingMoon = false;
    for (let i = 1; i < MOON_CYCLE_DAYS; i++) {
      const dayOffset = daysSinceFullMoon + i;
      const madaPhaseFraction = this.calculateCycleDayFraction(dayOffset);
      if (madaPhaseFraction === 0) {
        this.cycleDays = i;
        isAscendingMoon = i <= MOON_CYCLE_DAYS / 2;
        break;
      }
    }
    return isAscendingMoon;
  }
}
