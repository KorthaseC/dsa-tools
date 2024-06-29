import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ArmorBoni,
  ArmorType,
  BlacksmithQualification,
  CraftTechnic,
  Material,
  MaterialProperties,
  MeteorDiceResult,
  MeteorEffect,
  PriceRange,
  WeaponBoni,
  WeaponTechnicModifier,
  WeaponType,
  armorMaterial,
  armorProperties,
  blacksmithPriceRange,
  boniProperties,
  craftProperties,
  materialProperties,
  meteorEffects,
  weaponMaterial,
  weaponMaterialMetal,
  weaponProperties,
} from './smith-generator.model';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Utility } from '../shared/utility';

@Component({
  selector: 'app-smith-generator',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule,
    TranslateModule,
    MatSliderModule,
    MatRadioModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './smith-generator.component.html',
  styleUrl: './smith-generator.component.scss',
})
export class SmithGeneratorComponent {
  public smithForm: FormGroup;
  public smithQualificationOptions: BlacksmithQualification[] = Object.values(
    BlacksmithQualification
  );
  public sliderOption: PriceRange = blacksmithPriceRange.get(
    BlacksmithQualification.Beginner
  ).priceRange;

  public craftingOptions: string[] = [];
  public materialOptions: Material[] = [];
  public boniOptions: string[] = [];
  public craftTechnicOptions: string[] = [];
  public isWeapon: boolean;
  public isWeaponMaterialMetal: boolean;
  public materialProperties: Map<Material, MaterialProperties> =
    materialProperties;
  public craftedItemText: string;
  public craftedFailureText: string = '';
  public craftedItemProperties: {
    price: number;
    time: number;
    meteorEffect?: MeteorEffect;
  };

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.smithForm = this.fb.group({
      qualification: [BlacksmithQualification.Beginner, Validators.required],
      price: [this.sliderOption.startPrice, Validators.required],
      attr1: [10, Validators.required],
      attr2: [10, Validators.required],
      attr3: [10, Validators.required],
      fw: [7, Validators.required],
      item: [null, Validators.required],
      material: [null, Validators.required],
      standardPrice: [100, Validators.required],
      standardWeight: [1, Validators.required],
      boni1: [WeaponBoni.None],
      boni2: [WeaponBoni.None],
      craftTechnic: [CraftTechnic.None],
    });
  }

  public changeQualification(qualification: BlacksmithQualification): void {
    this.sliderOption = blacksmithPriceRange.get(qualification).priceRange;
    this.smithForm.controls['price'].setValue(this.sliderOption.startPrice);
  }

  public changeItemType(isWeapon: boolean): void {
    this.smithForm.get('craftTechnic').setValue(CraftTechnic.None);
    this.isWeapon = isWeapon;
    if (isWeapon) {
      this.craftingOptions = Object.values(WeaponType);
      this.materialOptions = weaponMaterial;
      this.boniOptions = Object.values(WeaponBoni);
      this.craftTechnicOptions = [
        CraftTechnic.None,
        CraftTechnic.Falt,
        CraftTechnic.Lehm,
      ];
    } else {
      this.craftingOptions = Object.values(ArmorType);
      this.materialOptions = armorMaterial;
      this.boniOptions = Object.values(ArmorBoni);
      this.craftTechnicOptions = [CraftTechnic.None, CraftTechnic.ChainBuild];
    }
  }

  public isOptionDisabled(boni: string, controlName: string): boolean {
    const otherControlName = controlName === 'boni1' ? 'boni2' : 'boni1';
    return (
      (boni === WeaponBoni.Parade &&
        this.smithForm.get(otherControlName)!.value === WeaponBoni.Parade) ||
      (boni === ArmorBoni.Armor &&
        this.smithForm.get(otherControlName)!.value === ArmorBoni.Armor)
    );
  }

  public changeMaterial(material: Material): void {
    this.smithForm.get('craftTechnic').setValue(CraftTechnic.None);
    this.isWeaponMaterialMetal =
      this.isWeapon && weaponMaterialMetal.includes(material);
  }

  public calculateCraftedPrice(): void {
    this.craftedItemText = '';
    this.craftedFailureText = '';
    const formValues = this.smithForm.value;
    const workingPrice: number = formValues.price;
    const attr1: number = formValues.attr1;
    const attr2: number = formValues.attr2;
    const attr3: number = formValues.attr3;
    const fw: number = formValues.fw;
    const item: WeaponType | ArmorType = formValues.item;
    const material: Material = formValues.material;
    const itemPrice: number = formValues.standardPrice;
    const itemWeight: number = formValues.standardWeight;
    const boni1: WeaponBoni | ArmorBoni = formValues.boni1;
    const boni2: WeaponBoni | ArmorBoni = formValues.boni2;
    const craftTechnic: CraftTechnic = formValues.craftTechnic;

    const triesCounter: number = materialProperties.get(material).craftingTries;

    const materialPrice: number = this.calcMaterialPrice(
      material,
      itemPrice,
      itemWeight
    );
    const intervalAndDiceModifier: {
      intervalMultipler: number;
      diceModifier: number;
    } = this.calcIntervalAndModifier(
      material,
      boni1,
      boni2,
      craftTechnic,
      item
    );

    const qsAndIntervalCounter: { qsCounter: number; intervalCounter: number } =
      this.calcQuality(
        triesCounter,
        [attr1, attr2, attr3],
        fw,
        intervalAndDiceModifier.diceModifier
      );

    if (qsAndIntervalCounter?.qsCounter >= 10) {
      this.craftedItemProperties = this.getItemResults(
        intervalAndDiceModifier.intervalMultipler,
        qsAndIntervalCounter.intervalCounter,
        workingPrice,
        material,
        materialPrice
      );
      this.craftedItemText = 'smith.itemText.result';
    } else if (this.craftedFailureText !== 'smith.itemText.failure') {
      this.craftedFailureText = 'smith.itemText.failed';
    }
  }

  private calcMaterialPrice(
    material: Material,
    itemPrice: number,
    itemWeight: number
  ): number {
    const reducedPriceMaterials: Material[] = [
      Material.Steel,
      Material.Grassoden,
      Material.FluSteel,
      Material.Kunchomer,
      Material.Mirhamer,
      Material.Premer,
      Material.Uhdenber,
    ];
    if (reducedPriceMaterials.includes(material)) {
      return itemPrice / 4;
    } else {
      return materialProperties.get(material).price * itemWeight;
    }
  }

  private calcIntervalAndModifier(
    material: Material,
    boni1: WeaponBoni | ArmorBoni,
    boni2: WeaponBoni | ArmorBoni,
    craftTechnic: CraftTechnic,
    item: WeaponType | ArmorType
  ): { intervalMultipler: number; diceModifier: number } {
    const itemInterval: number = this.isWeapon
      ? weaponProperties.get(item as WeaponType).interval
      : armorProperties.get(item as ArmorType).interval;
    let meteorInterval: number = 0;
    if (material === Material.Meteor1 || material === Material.Meteor2) {
      meteorInterval = material === Material.Meteor1 ? 5 : 7;
    }

    const materialModifer: number = this.calcMaterialModifer(material, item);

    let diceModifier: number =
      boniProperties.get(boni1).diceModifier +
      boniProperties.get(boni2).diceModifier +
      craftProperties.get(craftTechnic).diceModifier +
      materialModifer;

    let intervalMultipler =
      boniProperties.get(boni1).intervalModifier +
      boniProperties.get(boni2).intervalModifier +
      craftProperties.get(craftTechnic).intervalModifier +
      meteorInterval;
    intervalMultipler === 0 ? itemInterval : itemInterval * intervalMultipler;
    return { intervalMultipler, diceModifier };
  }

  private calcMaterialModifer(
    material: Material,
    item: WeaponType | ArmorType
  ): number {
    const materialProp: MaterialProperties = materialProperties.get(material);
    let materialModifer: number = this.isWeapon
      ? materialProp.modWeapon?.generalMod ?? 0
      : materialProp.modArmor ?? 0;

    if (this.isWeapon && materialProp.modWeapon?.technicMod) {
      const technicMod: number = materialProp.modWeapon.technicMod.find(
        (t: WeaponTechnicModifier) => t.technic === item
      ).mod;
      if (technicMod) {
        materialModifer = technicMod;
      }
    }

    return materialModifer;
  }

  private calcQuality(
    triesCounter: number,
    attributes: number[],
    fw: number,
    modifier: number
  ): { qsCounter: number; intervalCounter: number } {
    let counter = 0;
    let qsCounter: number = 0;
    let intervalCounter: number = 0;
    let missModifer: number = 0;
    let hasDoubleOne: boolean = false;
    while (counter < triesCounter) {
      counter = counter + 1;
      if (qsCounter < 10) {
        intervalCounter = intervalCounter + 1;

        const dice: number[] = [
          Utility.rollDice(20),
          Utility.rollDice(20),
          Utility.rollDice(20),
        ];
        const count20s = dice.filter((dice: number) => dice === 20).length;
        const count1s = dice.filter((dice: number) => dice === 1).length;

        if (count20s >= 2) {
          this.craftedFailureText = 'smith.itemText.failure';
          return null;
        }

        if (count1s >= 2) {
          missModifer = 0;
          hasDoubleOne = true;
        }

        //calc diff between attribute + modiifier and dice roll
        let diff1 = this.calcDiffAttrDice(
          attributes[0],
          missModifer,
          modifier,
          dice[0]
        );
        let diff2 = this.calcDiffAttrDice(
          attributes[1],
          missModifer,
          modifier,
          dice[1]
        );
        let diff3 = this.calcDiffAttrDice(
          attributes[2],
          missModifer,
          modifier,
          dice[2]
        );

        let remainFW = fw + diff1 + diff2 + diff3;

        //Calculate QS
        if (remainFW >= 0) {
          qsCounter = this.calcQualityStep(remainFW, hasDoubleOne, qsCounter);
        } else {
          missModifer = missModifer - 1;
        }
        hasDoubleOne = false;
      }
    }
    return { qsCounter, intervalCounter };
  }

  private calcDiffAttrDice(
    attr: number,
    missModifer: number,
    modifier: number,
    dice: number
  ): number {
    return attr + missModifer + modifier - dice >= 0
      ? 0
      : attr + missModifer + modifier - dice;
  }

  private calcQualityStep(remainFW, hasDoubleOne, qsCounter): number {
    remainFW = Math.min(remainFW, 16); //returns 16 if remainFW>16
    remainFW = Math.max(1, remainFW); //returns 1 if remainFW=0
    let offset = Math.ceil(remainFW / 3);
    if (hasDoubleOne) {
      offset *= 2;
    }
    return qsCounter + offset;
  }

  private getItemResults(
    interval: number,
    intervalCounter: number,
    workingPrice: number,
    material: Material,
    materialPrice: number
  ): { price: number; time: number; meteorEffect?: MeteorEffect } {
    let meteorEffect: MeteorEffect = null;

    let price: number =
      interval * intervalCounter * workingPrice + materialPrice;
    price = Math.round(price * 100) / 100;
    let time: number = interval * intervalCounter;

    if (material === Material.Meteor1 || material === Material.Meteor2) {
      const die: number = Utility.rollDice(20);
      meteorEffect = meteorEffects.find((effect: MeteorDiceResult) =>
        Utility.isWithinRange(die || 0, effect.diceValueRange)
      )?.meteorEffect;
    }

    return { price, time, meteorEffect };
  }
}
