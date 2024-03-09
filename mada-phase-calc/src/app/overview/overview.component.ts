import { Component, OnInit, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Observable, map, startWith } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MONTHS, MOON_ICON, MoonPhase } from '../shared/constant';

const dayOptions: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
const namelessDayOptions: number[] = [1, 2, 3, 4, 5];
const DAYS_IN_YEAR: number = 365;
const DAYS_IN_MONTH: number = 30;
const MOON_CYCLE_DAYS: number = 28;
// Reference day for a full moon on the 184th day of the year in 1047
const FULL_MOON_REFERENCE_DAY: number = 184 + 1047 * DAYS_IN_YEAR;

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  public dayControl = new FormControl('');
  public monthControl = new FormControl('');
  public yearControl = new FormControl('');

  public monthSignal = signal(this.monthControl.value);

  public dayOptions: number[] = dayOptions;
  public monthOptions: string[] = MONTHS;

  //Info data, shown in html
  public madaPhaseInfo: string;
  public nextFullMoonInfo: string;
  public moonIcon: string;
  public cycleDays: number;

  constructor() {
    this.monthControl.valueChanges.subscribe((newMonth) => {
      this.monthSignal.set(newMonth);
    });

    effect(() => {
      const selectedMonth = this.monthSignal();
      if (selectedMonth === 'Namenlose Tage') {
        this.dayOptions = namelessDayOptions;
        this.dayControl.setValue(
          parseInt(this.dayControl.value) > 5 ? null : this.dayControl.value
        );
      } else {
        this.dayOptions = dayOptions;
      }
    });
  }

  public isFormValid(): boolean {
    return (
      this.dayControl.valid && this.monthControl.valid && this.yearControl.valid
    );
  }

  public calcMadaPhase(): void {
    const testDay: number = this.calculateTestDay();
    let daysSinceFullMoon: number = testDay - FULL_MOON_REFERENCE_DAY;
    let cycleDaysPos: number = Math.abs(daysSinceFullMoon);

    const madaPhaseFraction = this.calculateCycleDayFraction(cycleDaysPos);

    this.updateMadaPhaseProperties(madaPhaseFraction, daysSinceFullMoon);
  }

  private calculateTestDay(): number {
    return (
      parseInt(this.dayControl.value) +
      this.monthOptions.findIndex(
        (month) => month === this.monthControl.value
      ) *
        DAYS_IN_MONTH +
      parseInt(this.yearControl.value) * DAYS_IN_YEAR
    );
  }

  private calculateCycleDayFraction(cycleDaysPos: number): number {
    return parseInt((cycleDaysPos / MOON_CYCLE_DAYS).toFixed(2).split('.')[1]);
  }

  private updateMadaPhaseProperties(
    madaPhaseFraction: number,
    daysSinceFullMoon: number
  ): void {
    const phase = this.getMoonPhase(madaPhaseFraction, daysSinceFullMoon);
    this.madaPhaseInfo = MoonPhase[phase];
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
  ): keyof typeof MoonPhase {
    // Check for special moon phases based on the calculated value
    switch (madaPhaseCalc) {
      case 25:
        return 'Helm';
      case 50:
        return 'NewMoon';
      case 75:
        return 'Chalice';
      case 0:
        return 'FullMoon';
      default:
        // For values not matching special cases, determine if the moon is increasing or decreasing
        return this.calcNextFullMoon(daysSinceFullMoon)
          ? 'Increasing'
          : 'Decreasing';
    }
  }

  private setNextFullMoonInfo(daysSinceFullMoon: number): void {
    const isAscending = this.calcNextFullMoon(daysSinceFullMoon);
    const dayString =
      this.cycleDays === 1 || this.cycleDays === 27 ? ' Tag' : ' Tagen';
    if (isAscending) {
      this.nextFullMoonInfo =
        'Der nächste Vollmond ist in ' + this.cycleDays + dayString + '.';
    } else {
      this.nextFullMoonInfo =
        'Der letzte Vollmond war vor ' +
        (MOON_CYCLE_DAYS - this.cycleDays) +
        dayString +
        '.';
    }
  }

  private calcNextFullMoon(daysSinceFullMoon: number): boolean {
    let isAscendingMoon: boolean = false;

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
