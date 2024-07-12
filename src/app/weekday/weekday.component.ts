import { Component, effect, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Months, Weekdays } from '../shared/constant';
import { Utility } from '../shared/utility';

const dayOptions: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
const namelessDayOptions: number[] = [1, 2, 3, 4, 5];
const DAYS_IN_YEAR: number = 365;
// Reference day for a full moon on the 18th day of the year in 1047 (Windstag)
const WINDSTAG_REFERENCE_DAY: number = 183 + 1047 * DAYS_IN_YEAR;

@Component({
  selector: 'app-weekday',
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
  templateUrl: './weekday.component.html',
  styleUrl: './weekday.component.scss',
})
export class WeekdayComponent {
  public dayControl = new FormControl<number>(null);
  public monthControl = new FormControl<Months>(null);
  public yearControl = new FormControl<number>(null);

  public monthSignal = signal(this.monthControl.value);

  public dayOptions: number[] = dayOptions;
  public monthOptions: string[] = Object.values(Months);

  public weekdayInfo: string;

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

  public calcWeekday(): void {
    const testDay: number = Utility.calculateTestDay(
      this.dayControl.value,
      this.monthControl.value,
      this.yearControl.value
    );
    let daysSinceWindstag: number = testDay - WINDSTAG_REFERENCE_DAY;

    if (daysSinceWindstag < 0) {
      daysSinceWindstag =
        (daysSinceWindstag % Object.values(Weekdays).length) +
        Object.values(Weekdays).length;
    }

    const weekdayIndex: number =
      daysSinceWindstag % Object.values(Weekdays).length;
    this.weekdayInfo = this.translateService.instant(
      `weekday.day.${Utility.getWeekdayByIndex(weekdayIndex)}`
    );
  }
}
