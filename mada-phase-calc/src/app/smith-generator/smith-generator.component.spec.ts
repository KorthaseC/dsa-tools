import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Utility } from '../shared/utility';
import { SmithGeneratorComponent } from './smith-generator.component';
import {
  ArmorBoni,
  ArmorType,
  BlacksmithQualification,
  CraftTechnic,
  Material,
  WeaponBoni,
  WeaponType,
  armorMaterial,
  blacksmithPriceRange,
  weaponMaterial,
} from './smith-generator.model';

describe('SmithGeneratorComponent', () => {
  let component: SmithGeneratorComponent;
  let fixture: ComponentFixture<SmithGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SmithGeneratorComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SmithGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.smithForm).toBeTruthy();
    expect(component.smithForm.get('qualification').value).toBe(
      BlacksmithQualification.Beginner
    );
    expect(component.smithForm.get('price').value).toBe(
      component.sliderOption.startPrice
    );
    expect(component.smithForm.get('attr1').value).toBe(10);
    expect(component.smithForm.get('attr2').value).toBe(10);
    expect(component.smithForm.get('attr3').value).toBe(10);
    expect(component.smithForm.get('fw').value).toBe(7);
  });

  it('should validate form correctly', () => {
    component.smithForm.get('item').setValue(WeaponType.Swords);
    component.smithForm.get('material').setValue(Material.Steel);
    expect(component.smithForm.valid).toBeTrue();
    component.smithForm.get('item').setValue(null);
    expect(component.smithForm.invalid).toBeTrue();
  });

  it('should change qualification and update price range', () => {
    component.changeQualification(BlacksmithQualification.Master);
    expect(component.sliderOption).toEqual(
      blacksmithPriceRange.get(BlacksmithQualification.Master).priceRange
    );
    expect(component.smithForm.get('price').value).toBe(
      component.sliderOption.startPrice
    );
  });

  it('should change item type to weapon and update options', () => {
    component.changeItemType(true);
    expect(component.isWeapon).toBeTrue();
    expect(component.craftingOptions).toEqual(Object.values(WeaponType));
    expect(component.materialOptions).toEqual(weaponMaterial);
    expect(component.boniOptions).toEqual(Object.values(WeaponBoni));
    expect(component.craftTechnicOptions).toEqual([
      CraftTechnic.None,
      CraftTechnic.Falt,
      CraftTechnic.Lehm,
    ]);
  });

  it('should change item type to armor and update options', () => {
    component.changeItemType(false);
    expect(component.isWeapon).toBeFalse();
    expect(component.craftingOptions).toEqual(Object.values(ArmorType));
    expect(component.materialOptions).toEqual(armorMaterial);
    expect(component.boniOptions).toEqual(Object.values(ArmorBoni));
    expect(component.craftTechnicOptions).toEqual([
      CraftTechnic.None,
      CraftTechnic.ChainBuild,
    ]);
  });

  it('should change material and update crafting technique', () => {
    component.changeItemType(true);
    component.changeMaterial(Material.Iron);
    expect(component.smithForm.get('craftTechnic').value).toBe(
      CraftTechnic.None
    );
    expect(component.isWeaponMaterialMetal).toBeTrue();
  });

  it('should disable boni option if already selected in other control', () => {
    component.changeItemType(true);
    component.smithForm.get('boni1').setValue(WeaponBoni.Parade);
    expect(component.isOptionDisabled(WeaponBoni.Parade, 'boni2')).toBeTrue();
  });

  it('should handle crafting failure', () => {
    component.smithForm.patchValue({
      qualification: BlacksmithQualification.Master,
      price: 100,
      attr1: 1,
      attr2: 1,
      attr3: 1,
      fw: 10,
      item: WeaponType.Swords,
      material: Material.Steel,
      standardPrice: 200,
      standardWeight: 1.5,
      boni1: WeaponBoni.None,
      boni2: WeaponBoni.None,
      craftTechnic: CraftTechnic.None,
    });

    component.isWeapon = true;

    spyOn(Utility, 'rollDice').and.returnValues(20, 20, 20);
    component.calculateCraftedPrice();

    expect(component.craftedFailureText).toBe('smith.itemText.failure');
    expect(component.craftedItemText).toBe('');
  });
});
