import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterWizardComponent } from './character-wizard.component';

describe('CharacterWizardComponent', () => {
  let component: CharacterWizardComponent ;
  let fixture: ComponentFixture<CharacterWizardComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CharacterWizardComponent ,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterWizardComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
