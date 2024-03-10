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
}
