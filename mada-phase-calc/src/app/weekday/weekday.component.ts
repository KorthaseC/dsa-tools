import { Component, effect, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MONTHS, WEEKDAYS } from '../shared/constant';
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
  ],
  templateUrl: './weekday.component.html',
  styleUrl: './weekday.component.scss',
})
export class WeekdayComponent {
  public dayControl = new FormControl('');
  public monthControl = new FormControl('');
  public yearControl = new FormControl('');

  public monthSignal = signal(this.monthControl.value);

  public dayOptions: number[] = dayOptions;
  public monthOptions: string[] = MONTHS;

  public weekdayInfo: string;

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

  public calcWeekday(): void {
    const testDay: number = Utility.calculateTestDay(
      parseInt(this.dayControl.value),
      this.monthControl.value,
      parseInt(this.yearControl.value)
    );
    let daysSinceWindstag: number = testDay - WINDSTAG_REFERENCE_DAY;

    if (daysSinceWindstag < 0) {
      daysSinceWindstag =
        (daysSinceWindstag % WEEKDAYS.length) + WEEKDAYS.length;
    }

    const weekdayIndex: number = daysSinceWindstag % WEEKDAYS.length;
    this.weekdayInfo = WEEKDAYS[weekdayIndex];
  }
}
