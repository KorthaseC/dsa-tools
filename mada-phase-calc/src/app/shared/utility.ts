import { DAYS_IN_MONTH, DAYS_IN_YEAR, MONTHS } from './constant';

export class Utility {
  public static calculateTestDay(
    day: number,
    month: string,
    year: number
  ): number {
    return (
      day +
      MONTHS.findIndex((monthOptions) => monthOptions === month) *
        DAYS_IN_MONTH +
      year * DAYS_IN_YEAR
    );
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
