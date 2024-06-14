import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TavernGeneratorComponent } from './tavern-generator.component';

describe('WeekdayComponent', () => {
  let component: TavernGeneratorComponent;
  let fixture: ComponentFixture<TavernGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TavernGeneratorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TavernGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
