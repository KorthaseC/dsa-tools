
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TabsModule } from 'primeng/tabs';
import { Utility } from '../shared/utility';
import {
  BONI_NAMES,
  CRAFT_TECHNIC_NAMES,
  ITEM_NAMES,
  MATERIAL_NAMES,
  METEOR_EFFECT_NAMES,
  QUALIFICATION_NAMES,
} from './smith-generator.constants';
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

@Component({
    selector: 'app-smith-generator',
    imports: [
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    SliderModule,
    TabsModule,
    PopoverModule,
],
    templateUrl: './smith-generator.component.html',
    styleUrl: './smith-generator.component.scss'
})
export class SmithGeneratorComponent {
  public smithForm: FormGroup;
  public smithQualificationOptions = Object.values(BlacksmithQualification).map((v) => ({
    label: QUALIFICATION_NAMES[v] ?? v,
    value: v,
  }));
  public sliderOption: PriceRange = blacksmithPriceRange.get(
    BlacksmithQualification.Beginner
  ).priceRange;

  public craftingOptions: { label: string; value: string }[] = [];
  public materialOptions: { label: string; value: string }[] = [];
  public boniOptions: { label: string; value: string }[] = [];
  public craftTechnicOptions: { label: string; value: string }[] = [];
  public isWeapon: boolean;
  public isWeaponMaterialMetal: boolean;
  public materialProperties: Map<Material, MaterialProperties> =
    materialProperties;
  // Lookup maps — delegates to smith-generator.constants.ts
  public readonly qualificationNames = QUALIFICATION_NAMES;
  public readonly itemNames          = ITEM_NAMES;
  public readonly materialNames      = MATERIAL_NAMES;
  public readonly boniNames          = BONI_NAMES;
  public readonly craftTechnicNames  = CRAFT_TECHNIC_NAMES;
  public readonly meteorEffectNames  = METEOR_EFFECT_NAMES;
  public craftedItemText: string;
  public craftedFailureText: string = '';
  public isCalculating = false;
  public craftedItemSummary: {
    item: string;
    material: string;
    materialEffect: string;
    boni1: string;
    boni2: string;
    craftTechnic: string;
  } | null = null;
  public activeTab: string = 'weapon';
  public sliderPrice: number;
  public craftedItemProperties: {
    price: number;
    time: number;
    meteorEffect?: MeteorEffect;
  };

  constructor(
    private fb: FormBuilder
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
    this.changeItemType(true);
    this.sliderPrice = this.sliderOption.startPrice;
  }

  public onTabChange(value: string | number): void {
    this.activeTab = String(value);
    this.changeItemType(value === 'weapon');
  }

  public changeQualification(qualification: BlacksmithQualification): void {
    this.sliderOption = blacksmithPriceRange.get(qualification).priceRange;
    this.sliderPrice = this.sliderOption.startPrice;
    this.smithForm.controls['price'].setValue(this.sliderPrice);
  }

  public changeItemType(isWeapon: boolean): void {
    this.smithForm.get('craftTechnic').setValue(CraftTechnic.None);
    this.isWeapon = isWeapon;
    if (isWeapon) {
      this.craftingOptions = Object.values(WeaponType).map((v) => ({ label: ITEM_NAMES[v] ?? v, value: v }));
      this.materialOptions = weaponMaterial.map((v) => ({ label: MATERIAL_NAMES[v] ?? v, value: v }));
      this.boniOptions = Object.values(WeaponBoni).map((v) => ({ label: BONI_NAMES[v] ?? v, value: v }));
      this.craftTechnicOptions = [CraftTechnic.None, CraftTechnic.Falt, CraftTechnic.Lehm].map((v) => ({ label: CRAFT_TECHNIC_NAMES[v] ?? v, value: v }));
    } else {
      this.craftingOptions = Object.values(ArmorType).map((v) => ({ label: ITEM_NAMES[v] ?? v, value: v }));
      this.materialOptions = armorMaterial.map((v) => ({ label: MATERIAL_NAMES[v] ?? v, value: v }));
      this.boniOptions = Object.values(ArmorBoni).map((v) => ({ label: BONI_NAMES[v] ?? v, value: v }));
      this.craftTechnicOptions = [CraftTechnic.None, CraftTechnic.ChainBuild].map((v) => ({ label: CRAFT_TECHNIC_NAMES[v] ?? v, value: v }));
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
    this.isCalculating = true;
    const formValues = this.smithForm.value;
    const matProps = materialProperties.get(formValues.material);
    this.craftedItemSummary = {
      item: this.itemNames[formValues.item] ?? formValues.item,
      material: this.materialNames[formValues.material] ?? formValues.material,
      materialEffect: this.isWeapon ? (matProps?.effectWeapon ?? '') : (matProps?.effectArmor ?? ''),
      boni1: formValues.boni1 !== WeaponBoni.None && formValues.boni1 !== ArmorBoni.None ? (this.boniNames[formValues.boni1] ?? formValues.boni1) : '',
      boni2: formValues.boni2 !== WeaponBoni.None && formValues.boni2 !== ArmorBoni.None ? (this.boniNames[formValues.boni2] ?? formValues.boni2) : '',
      craftTechnic: formValues.craftTechnic !== CraftTechnic.None ? (this.craftTechnicNames[formValues.craftTechnic] ?? formValues.craftTechnic) : '',
    };
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
      this.craftedItemText = `Die Herstellungskosten für die gewählten Einstellungen betragen ${this.craftedItemProperties.price} Silbertaler. Der Schmied brauchte ${this.craftedItemProperties.time} Tage für die Herstellung.`;
    } else if (this.craftedFailureText !== 'Kritischer Fehlschlag bei der Herstellung') {
      this.craftedFailureText = 'Die Ausrüstung konnte nicht hergestellt werden.';
    }
    setTimeout(() => { this.isCalculating = false; }, 150);
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
    intervalMultipler = intervalMultipler === 0 ? itemInterval : itemInterval * intervalMultipler;
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
      const technicMod = materialProp.modWeapon.technicMod.find(
        (t: WeaponTechnicModifier) => t.technic === item
      )?.mod;
      if (technicMod !== undefined) {
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
          this.craftedFailureText = 'Kritischer Fehlschlag bei der Herstellung';
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
