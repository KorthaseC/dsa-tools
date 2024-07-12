import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DiceResultComponent } from './dice-result.component';

describe('DiceResultComponent', () => {
  let component: DiceResultComponent;
  let fixture: ComponentFixture<DiceResultComponent>;
  let translateService: TranslateService;
  let dialogRef: MatDialogRef<DiceResultComponent>;
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
      imports: [TranslateModule.forRoot(), BrowserAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
        TranslateService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceResultComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    dialogRef = TestBed.inject(MatDialogRef);
    spyOn(translateService, 'instant').and.callFake((key: string) => key);
    spyOn(translateService, 'get').and.callFake((key: string) => of(key));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.changeDieOne.value).toBe(3);
    expect(component.changeDieTwo.value).toBe(4);
    expect(component.changeDiceOptions).toEqual([1, 2, 3, 4, 5, 6]);
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
    expect(translateService.get).toHaveBeenCalledWith('result_8_9');
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

  it('should correctly update the dice result', () => {
    (component.data.alchemicTable = [
      { diceValueRange: [6, 7], alchemicResult: 'result_6_7' },
      { diceValueRange: [8, 9], alchemicResult: 'result_8_9' },
    ]),
      component.changeDieOne.setValue(3);
    component.changeDieTwo.setValue(2);
    component['modValue'] = 3;

    const result = component.changeDiceResult();
    expect(result).toBe('result_8_9');
  });

  it('should handle missing alchemic table', () => {
    component.data.alchemicTable = null;
    const result = component.changeDiceResult();
    expect(result).toBe('No table found');
  });
});
