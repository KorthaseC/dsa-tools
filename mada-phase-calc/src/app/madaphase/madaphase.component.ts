import { Component, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DAYS_IN_YEAR, MOON_ICON, Months, MoonPhase } from '../shared/constant';
import { Utility } from '../shared/utility';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const dayOptions: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
const namelessDayOptions: number[] = [1, 2, 3, 4, 5];
const MOON_CYCLE_DAYS: number = 28;
// Reference day for a full moon on the 184th day of the year in 1047
const FULL_MOON_REFERENCE_DAY: number = 184 + 1047 * DAYS_IN_YEAR;

@Component({
  selector: 'app-madaphase',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './madaphase.component.html',
  styleUrl: './madaphase.component.scss',
})
export class MadaphaseComponent {
  public dayControl = new FormControl<number>(null);
  public monthControl = new FormControl<Months>(null);
  public yearControl = new FormControl<number>(null);

  public monthSignal = signal(this.monthControl.value);

  public dayOptions: number[] = dayOptions;
  public monthOptions: string[] = Object.values(Months);

  //Info data, shown in html
  public madaPhaseInfo: string;
  public nextFullMoonInfo: string;
  public moonIcon: string;
  public cycleDays: number;

  constructor(private translateService: TranslateService) {
    this.monthControl.valueChanges.subscribe((newMonth) => {
      this.monthSignal.set(newMonth);
    });

    effect(() => {
      const selectedMonth = this.monthSignal();
      if (selectedMonth === Months.namelessDays) {
        this.dayOptions = namelessDayOptions;
        this.dayControl.setValue(
          this.dayControl.value > 5 ? null : this.dayControl.value
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
    const testDay: number = Utility.calculateTestDay(
      this.dayControl.value,
      this.monthControl.value,
      this.yearControl.value
    );
    let daysSinceFullMoon: number = testDay - FULL_MOON_REFERENCE_DAY;
    let cycleDaysPos: number = Math.abs(daysSinceFullMoon);

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
    const phase: MoonPhase = this.getMoonPhase(
      madaPhaseFraction,
      daysSinceFullMoon
    );
    this.madaPhaseInfo = this.translateService.instant(
      `madaPhase.phase.${phase}`
    );
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
    // Check for special moon phases based on the calculated value
    switch (madaPhaseCalc) {
      case 25:
        return MoonPhase.Helmet;
      case 50:
        return MoonPhase.NewMoon;
      case 75:
        return MoonPhase.Chalice;
      case 0:
        return MoonPhase.FullMoon;
      default:
        // For values not matching special cases, determine if the moon is increasing or decreasing
        return this.calcNextFullMoon(daysSinceFullMoon)
          ? MoonPhase.Increasing
          : MoonPhase.Decreasing;
    }
  }

  private setNextFullMoonInfo(daysSinceFullMoon: number): void {
    const isAscending = this.calcNextFullMoon(daysSinceFullMoon);

    if (isAscending) {
      this.nextFullMoonInfo = this.translateService.instant(
        this.cycleDays === 1
          ? 'madaPhase.nextFullMoon.nextFullMoonInSingular'
          : 'madaPhase.nextFullMoon.nextFullMoonIn',
        { days: this.cycleDays }
      );
    } else {
      this.nextFullMoonInfo = this.translateService.instant(
        this.cycleDays === 1
          ? 'madaPhase.nextFullMoon.lastFullMoonWasSingular'
          : 'madaPhase.nextFullMoon.lastFullMoonWas',
        { days: MOON_CYCLE_DAYS - this.cycleDays }
      );
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
