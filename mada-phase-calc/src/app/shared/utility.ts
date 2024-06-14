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

  public static rollDice(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  public static getEnumValueByNumber<T>(
    enumObj: T,
    number: number
  ): T[keyof T] | undefined {
    const enumValues = Object.values(enumObj);
    const index = number - 1;

    if (index >= 0 && index < enumValues.length) {
      return enumValues[index];
    }

    throw new Error(
      `Invalid number ${number}. Must be between 1 and ${enumValues.length}.`
    );
  }
}
