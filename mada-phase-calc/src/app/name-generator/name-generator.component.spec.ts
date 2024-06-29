import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NameGeneratorComponent } from './name-generator.component';

describe('WeekdayComponent', () => {
  let component: NameGeneratorComponent;
  let fixture: ComponentFixture<NameGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameGeneratorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NameGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
