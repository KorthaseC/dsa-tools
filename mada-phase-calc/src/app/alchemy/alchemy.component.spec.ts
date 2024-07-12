import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AlchemyComponent } from './alchemy.component';
import { ElementsAlchemy } from './alchemy.constants';
import { DiceChangeResult } from './alcheny.models';
import { DiceResultComponent } from './dice-result/dice-result.component';

describe('AlchemyComponent', () => {
  let component: AlchemyComponent;
  let fixture: ComponentFixture<AlchemyComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

    await TestBed.configureTestingModule({
      imports: [
        AlchemyComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlchemyComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.potionType).toBeTruthy();
    expect(component.genieAlchemy).toBeTruthy();
    expect(component.elementType).toBeTruthy();
    expect(component.purityIngredient).toBeTruthy();
    expect(component.qsBrewing).toBeTruthy();
  });

  it('should validate form correctly', () => {
    component.potionType.setValue('ELIXIR');
    component.genieAlchemy.setValue(1);
    component.elementType.setValue(ElementsAlchemy.Fire);
    component.purityIngredient.setValue(3);
    component.qsBrewing.setValue(2);
    expect(component.isFormValid()).toBeTrue();

    component.potionType.setValue('');
    expect(component.isFormValid()).toBeFalse();
  });

  it('should open dialog with correct data', async () => {
    const mockDiceChangeResult: DiceChangeResult = {
      geniusPoints: 1,
      diceResult: 10,
    };
    const dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(mockDiceChangeResult),
    });
    dialog.open.and.returnValue(dialogRefSpyObj as MatDialogRef<any>);

    const result = await component['openDiceResultDialog'](
      2,
      10,
      'Anwendung',
      'result_8_9',
      6,
      [3, 4]
    );

    expect(dialog.open).toHaveBeenCalledWith(DiceResultComponent, {
      width: '600px',
      height: '300px',
      data: {
        potionType: '',
        geniusPoints: 2,
        element: null,
        value: 10,
        type: 'Anwendung',
        alchemicResult: 'result_8_9',
        diceType: 6,
        dice: [3, 4],
        alchemicTable: undefined,
      },
    });
    expect(result).toEqual(mockDiceChangeResult);
  });

  it('should call elixirMaking when potion type is ELIXIR', () => {
    spyOn<any>(component, 'elixirMaking');
    component.potionType.setValue('ELIXIR');
    component.potionMaking();
    expect(component['elixirMaking']).toHaveBeenCalled();
  });

  it('should call poisonMaking when potion type is POISON', () => {
    spyOn<any>(component, 'poisonMaking');
    component.potionType.setValue('POISON');
    component.potionMaking();
    expect(component['poisonMaking']).toHaveBeenCalled();
  });

  it('should call stimulantMaking when potion type is STIMULANT', () => {
    spyOn<any>(component, 'stimulantMaking');
    component.potionType.setValue('STIMULANT');
    component.potionMaking();
    expect(component['stimulantMaking']).toHaveBeenCalled();
  });

  it('should process elixir making correctly', async () => {
    spyOn<any>(component, 'processStep').and.returnValue(Promise.resolve(1));
    spyOn<any>(component, 'processDuration').and.returnValue(
      Promise.resolve(1)
    );
    component.elementType.setValue(ElementsAlchemy.Air);
    component.qsBrewing.setValue(5);

    await component['elixirMaking']();
    expect(component['processStep']).toHaveBeenCalledWith(
      6,
      'Anwendung',
      jasmine.any(Array)
    );
    expect(component['processStep']).toHaveBeenCalledWith(
      6,
      'Wirkung',
      jasmine.any(Array)
    );
    expect(component['processStep']).toHaveBeenCalledWith(
      20,
      'Genaue Wirkung',
      jasmine.any(Array)
    );
    expect(component['processDuration']).toHaveBeenCalledWith(6, 'Dauer');
  });

  it('should process poison making correctly', async () => {
    spyOn<any>(component, 'processStep').and.returnValue(Promise.resolve(2));
    component.qsBrewing.setValue(5);

    await component['poisonMaking']();
    expect(component['processStep']).toHaveBeenCalledWith(
      20,
      'Anwendung',
      jasmine.any(Array)
    );
    expect(component['processStep']).toHaveBeenCalledWith(
      12,
      'Widerstandsprobe',
      jasmine.any(Array)
    );
    expect(component['processStep']).toHaveBeenCalledWith(
      12,
      'Wirkung',
      jasmine.any(Array),
      0
    );
  });

  it('should process stimulant making correctly', async () => {
    spyOn<any>(component, 'processStep').and.returnValue(Promise.resolve(1));
    await component['stimulantMaking']();
    expect(component['processStep']).toHaveBeenCalledWith(
      20,
      'Anwendung',
      jasmine.any(Array)
    );
    expect(component['processStep']).toHaveBeenCalledWith(
      12,
      'Widerstandsprobe',
      jasmine.any(Array)
    );
    expect(component['processStep']).toHaveBeenCalledWith(
      12,
      'Sucht',
      jasmine.any(Array),
      0
    );
  });
});
