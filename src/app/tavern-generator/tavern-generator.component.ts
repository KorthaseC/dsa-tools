import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Utility } from '../shared/utility';
import {
  Attendant,
  BED_PRICE_MODIFIER,
  BED_SPREAD,
  GUEST_DAY_TIME_MODIFIERS,
  GUEST_PRESENT,
  Keeper,
  PRICE_GUEST_LVL,
  RoomDistribution,
  SpecialGuest,
  TAVERN_BUILDING,
  TAVERN_LOCATIONS,
  TAVERN_QS,
  TaverNamePartOne,
  TaverProperNameOne,
  TaverProperNameTwo,
  TavernDiceResult,
  TavernEvent,
  TavernLocation,
  TavernNamePartTwo,
  TavernSpecialFeature,
} from './tavern-generator.model';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    TranslateModule,
    MatTableModule,
  ],
  templateUrl: './tavern-generator.component.html',
  styleUrl: './tavern-generator.component.scss',
})
export class TavernGeneratorComponent implements AfterViewInit {
  public location = new FormControl<TavernLocation>(null, Validators.required);
  public displayedColumns: string[] = ['dayTime', 'guestLevel'];
  public locationOptions: TavernLocation[] = [...TAVERN_LOCATIONS];
  public tavernName: string = '';
  public tavernType: string = '';
  public tavernQs: TavernDiceResult;
  public priceGuestLvl: number = 0;
  public seats: number = 0;
  public beds: number = 0;
  public distributedBeds: RoomDistribution;
  public guestLevels: { dayTime: string; guestLevel: string }[] = [];
  public keeper: string = '';

  // optional
  public attendant: string = '';
  public specialFeature: string = '';
  public activeDays: string[] = [];
  public specialEvent: string = '';
  public specialGuest: string = '';

  private groupBeds: number;

  constructor(private translateService: TranslateService) {}

  ngAfterViewInit(): void {
    this.getGuestLevel();
    this.activeDays = this.getActiveDayTimes();
  }

  public isFormValid(): boolean {
    return this.location.valid;
  }

  public getTavern(): void {
    if (!this.location.valid) return;

    this.tavernName = this.generateTavernName();
    this.tavernType = this.generateTavernType();
    this.tavernQs = this.generateTavernQs();
    this.priceGuestLvl = this.generatePriceGuestLvl();

    this.seats = this.calculateSeats(Utility.rollDice(6));
    this.beds = this.calculateBeds(Utility.rollDice(6));
    this.distributedBeds = this.distributeBeds(this.beds);

    this.keeper = this.generateKeeper();
    this.attendant = this.generateAttendant();

    this.getGuestLevel();
    this.activeDays = this.getActiveDayTimes();
    if (this.activeDays.length > 0) {
      this.specialEvent = this.generateSpecialEvent();
    }

    this.specialFeature = this.generateSpecialFeature();
    this.specialGuest = this.generateSpecialGuest();
  }

  public getEventDaysText(): string {
    const orText: string = this.translateService.instant('shared.or');
    const translatedActiveDays: string[] = this.activeDays.map((dayTime) =>
      this.translateService.instant('tavern.guestLvl.' + dayTime)
    );
    const activeDaysJoined: string = translatedActiveDays
      .join(', ')
      .replace(/, (?=[^,]*$)/, ` ${orText} `);

    return this.translateService.instant('tavern.events.text', {
      dayTimes: activeDaysJoined,
    });
  }

  public calculateBedPrice(): string {
    const priceModifier: number = BED_PRICE_MODIFIER[this.priceGuestLvl - 1];

    return this.translateService.instant('tavern.beds.price', {
      priceGroupRooom: 6 * priceModifier,
      priceTwinRoom: 5 * priceModifier,
      singleRoom: 3 * priceModifier,
    });
  }

  public distributeBedsText(): string {
    let descriptionParts: string[] = [];

    if (this.distributedBeds.group > 0) {
      descriptionParts.push(
        this.translateService.instant('tavern.rooms.group', {
          count: this.distributedBeds.group,
          beds: this.groupBeds,
        })
      );
    }

    if (this.distributedBeds.twin > 0) {
      descriptionParts.push(
        this.translateService.instant('tavern.rooms.twin', {
          count: this.distributedBeds.twin,
        })
      );
    }

    if (this.distributedBeds.single > 0) {
      descriptionParts.push(
        this.translateService.instant('tavern.rooms.single', {
          count: this.distributedBeds.single,
        })
      );
    }

    const andText = this.translateService.instant('shared.and', {});
    const roomsText = descriptionParts
      .join(', ')
      .replace(/, (?=[^,]*$)/, ` ${andText} `);

    const values = Object.values(this.distributedBeds);
    const isOnlyOneRoom: boolean =
      values.reduce((acc: number, value: number) => acc + value, 0) === 1;

    const translateKey: string = isOnlyOneRoom
      ? 'tavern.rooms.available.single'
      : 'tavern.rooms.available.multi';
    return this.translateService.instant(translateKey, {
      rooms: roomsText,
    });
  }

  private generateTavernType(): string {
    const buildingDie: number = Utility.rollDice(20);
    return TAVERN_BUILDING.find((building: TavernDiceResult) =>
      Utility.isWithinRange(buildingDie, building.diceValueRange)
    ).tavernResult;
  }

  private generateTavernQs(): TavernDiceResult {
    const qsDie: number = Utility.rollDice(20);
    return TAVERN_QS.find((qs: TavernDiceResult) =>
      Utility.isWithinRange(qsDie, qs.diceValueRange)
    );
  }

  private generatePriceGuestLvl(): number {
    const priceGuestDie = Utility.rollDice(20);
    const priceGuest = PRICE_GUEST_LVL.find((priceGuest: TavernDiceResult) =>
      Utility.isWithinRange(priceGuestDie, priceGuest.diceValueRange)
    );

    return (
      Math.max(1, Math.min(this.tavernQs.modValue + priceGuest?.modValue, 6)) ||
      0
    );
  }

  private generateKeeper(): string {
    const keeperDie = Utility.rollDice(20);
    return Utility.getEnumValueByNumber(Keeper, keeperDie);
  }

  private generateAttendant(): string {
    const attendantDie = Utility.rollDice(20);
    return Utility.getEnumValueByNumber(Attendant, attendantDie);
  }

  private generateSpecialEvent(): string {
    const eventDie = Utility.rollDice(20);
    return Utility.getEnumValueByNumber(TavernEvent, eventDie);
  }

  private generateSpecialFeature(): string {
    const specialFeatureDie = Utility.rollDice(20);
    return Utility.getEnumValueByNumber(
      TavernSpecialFeature,
      specialFeatureDie
    );
  }

  private generateSpecialGuest(): string {
    const specialGuestDie = Utility.rollDice(20);
    return Utility.getEnumValueByNumber(SpecialGuest, specialGuestDie);
  }

  private generateTavernName(): string {
    const namePart1Dice: number = Utility.rollDice(20);
    let namePart2Dice: number | null = null;

    if (namePart1Dice > 16) {
      const properNameDice: number = Utility.rollDice(6);
      const properNameEnum =
        namePart1Dice < 19 ? TaverProperNameTwo : TaverProperNameOne;
      const properName = Utility.getEnumValueByNumber(
        properNameEnum,
        properNameDice
      );
      return this.translateService.instant(
        'tavern.name.properName.' + properName
      );
    } else {
      namePart2Dice = Utility.rollDice(20);
      const namePartOne = this.translateService.instant(
        'tavern.name.partOne.' +
          Utility.getEnumValueByNumber(TaverNamePartOne, namePart1Dice)
      );
      const transKeyPrefix =
        namePart1Dice < 13
          ? 'tavern.name.partTwo.singular.'
          : 'tavern.name.partTwo.plural.';
      const namePartTwo = this.translateService.instant(
        transKeyPrefix +
          Utility.getEnumValueByNumber(TavernNamePartTwo, namePart2Dice)
      );
      return namePartOne + namePartTwo;
    }
  }

  private calculateSeats(diceRoll: number): number {
    if (diceRoll < 1 || diceRoll > 6)
      throw new Error('Dice result must be between 1 and 6.');

    const baseValues: number[] = [3, 9, 15, 21, 26, 37];
    const multipliers: number[] = [1, 1, 1, 1, 2, 2];

    const d6: number = Utility.rollDice(6);
    return baseValues[diceRoll - 1] + multipliers[diceRoll - 1] * d6;
  }

  private calculateBeds(diceRoll: number): number {
    if (diceRoll < 1 || diceRoll > 6)
      throw new Error('Dice result must be between 1 and 6.');

    const baseValues: number[] = [0, 0, 3, 6, 9, 15];
    const dice: number[] = [0, 3, 3, 3, 6, 6];

    return this.tavernType !== 'tent'
      ? baseValues[diceRoll - 1] + Utility.rollDice(dice[diceRoll - 1])
      : 0;
  }

  private getGuestLevel(): void {
    const guestsDie: number = Utility.rollDice(20);
    this.guestLevels = GUEST_DAY_TIME_MODIFIERS.map((dayTime) => {
      const dieValue = guestsDie + dayTime.modValue;
      const guestResult = GUEST_PRESENT.find((guests) =>
        Utility.isWithinRange(dieValue, guests.diceValueRange)
      );
      return {
        dayTime: dayTime.dayTime,
        guestLevel: guestResult?.tavernResult,
      };
    });
  }

  private getActiveDayTimes(): string[] {
    return this.guestLevels
      .filter(
        (level: { dayTime: string; guestLevel: string }) =>
          level.guestLevel !== 'empty' && level.guestLevel !== 'low'
      )
      .map((level: { dayTime: string; guestLevel: string }) => level.dayTime);
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  private distributeBeds(totalBeds: number): RoomDistribution {
    let bedSpread = BED_SPREAD[this.tavernQs.modValue - 1];

    if (!bedSpread) {
      throw new Error('Invalid qs value provided');
    }

    let remainingBeds: number = totalBeds;
    let rooms: RoomDistribution = { group: 0, twin: 0, single: 0 };

    //if only 1 bedm always single room
    if (remainingBeds === 1) {
      return { group: 0, twin: 0, single: 1 };
    }

    //if qs 1 and atleast 5 beds always group room
    if (this.tavernQs.modValue === 1 && remainingBeds >= 5) {
      this.groupBeds = remainingBeds;
      rooms.group = 1;
      remainingBeds = 0;
      return rooms;
    }

    //if beds less than 5, spread between twin and single rooms
    if (remainingBeds < 5) {
      bedSpread = {
        qs: this.tavernQs.modValue,
        group: 0,
        twin: 0.5,
        single: 0.5,
      };
    }

    // Calculate number of group rooms
    if (bedSpread.group > 0 && remainingBeds >= 5) {
      const maxGroupBeds = Math.floor(bedSpread.group * totalBeds);
      this.groupBeds = Math.min(
        remainingBeds,
        Math.max(5, this.getRandomInt(maxGroupBeds - 4) + 5)
      );
      rooms.group = 1;
      remainingBeds -= this.groupBeds;
    }

    // Calculate random number of twin rooms and single rooms
    while (remainingBeds > 0) {
      if (remainingBeds >= 2 && Math.random() < bedSpread.twin) {
        rooms.twin++;
        remainingBeds -= 2;
      } else {
        rooms.single++;
        remainingBeds--;
      }
    }

    return rooms;
  }
}
