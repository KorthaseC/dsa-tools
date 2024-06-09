import { DAYS_IN_MONTH, DAYS_IN_YEAR, Months, Weekdays } from './constant';

export class Utility {
  public static calculateTestDay(
    day: number,
    month: Months,
    year: number
  ): number {
    return (
      day +
      Object.values(Months).indexOf(month) * DAYS_IN_MONTH +
      year * DAYS_IN_YEAR
    );
  }

  public static getWeekdayByIndex(index: number): Weekdays {
    const values = Object.values(Weekdays);
    return values[index];
  }

  public static isWithinRange(value: number, range: [number, number]): boolean {
    return value >= range[0] && value <= range[1];
  }

  public static addNumbers(numbers: number[]): number {
    return numbers.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
  }
}
