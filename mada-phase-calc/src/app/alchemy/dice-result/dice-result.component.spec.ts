import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiceResultComponent } from './dice-result.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('MachineDetailsComponent', () => {
  let component: DiceResultComponent;
  let fixture: ComponentFixture<DiceResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(DiceResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
