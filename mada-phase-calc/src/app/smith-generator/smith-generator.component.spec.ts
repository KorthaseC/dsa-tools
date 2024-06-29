import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmithGeneratorComponent } from './smith-generator.component';

describe('SmithGeneratorComponent', () => {
  let component: SmithGeneratorComponent;
  let fixture: ComponentFixture<SmithGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmithGeneratorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SmithGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
