import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DiceResultComponent } from './dice-result.component';

describe('DiceResultComponent', () => {
  let component: DiceResultComponent;
  let fixture: ComponentFixture<DiceResultComponent>;
  let dialogRef: DynamicDialogRef;
  const mockData = {
    diceType: 6,
    value: 10,
    dice: [3, 4],
    geniusPoints: 2,
    alchemicTable: [
      { diceValueRange: [6, 7], alchemicResult: 'result_6_7' },
      { diceValueRange: [8, 9], alchemicResult: 'result_8_9' },
    ],
    alchemicResult: 'result_8_9',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DiceResultComponent,
      ],
      providers: [
        { provide: DynamicDialogConfig, useValue: { data: mockData } },
        {
          provide: DynamicDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceResultComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(DynamicDialogRef);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.changeDieOne.value).toBe(3);
    expect(component.changeDieTwo.value).toBe(4);
    expect(component.changeDiceOptions.map(o => o.value)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should calculate mod value on init', () => {
    expect(component['modValue']).toBe(3);
  });

  it('should validate form correctly', () => {
    component.changeDieOne.setValue(1);
    component.changeDieTwo.setValue(2);
    expect(component.changeDieOne.valid).toBeTrue();
    expect(component.changeDieTwo.valid).toBeTrue();
  });

  it('should emit dice result and close dialog', () => {
    component.changeDieOne.setValue(2);
    component.changeDieTwo.setValue(4);
    component.emitDiceResult();
    expect(dialogRef.close).toHaveBeenCalledWith({
      geniusPoints: 1,
      diceResult: 9,
    });
  });

  it('should correctly translate and update alchemy result', () => {
    spyOn<any>(component, 'setFinalResult');
    component['translateResult']();
    expect(component['setFinalResult']).toHaveBeenCalledWith('result_8_9');
  });

  it('should correctly determine if there are remaining genius points', () => {
    component.changeDieOne.setValue(2);
    component.changeDieTwo.setValue(4);
    expect(component.hasRemainingGeniusPoints()).toBeTrue();

    component.changeDieOne.setValue(3);
    component.changeDieTwo.setValue(4);
    expect(component.hasRemainingGeniusPoints()).toBeTrue();
  });

  it('should correctly identify unset control', () => {
    component.changeDieOne.setValue(null);
    expect(component.isControlUnset(component.changeDieOne, true)).toBeTrue();

    component.changeDieOne.setValue(3);
    expect(component.isControlUnset(component.changeDieOne, true)).toBeTrue();

    component.changeDieOne.setValue(2);
    expect(component.isControlUnset(component.changeDieOne, true)).toBeFalse();
  });
});
