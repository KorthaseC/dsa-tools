import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpeciesComponent } from './species.component';

describe('WeekdayComponent', () => {
  let component: SpeciesComponent;
  let fixture: ComponentFixture<SpeciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SpeciesComponent,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
