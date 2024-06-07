import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlchemyComponent } from './alchemy.component';

describe('WeekdayComponent', () => {
  let component: AlchemyComponent;
  let fixture: ComponentFixture<AlchemyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlchemyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlchemyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
