import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { CharacterWizardComponent } from './character-wizard.component';

describe('CharacterWizardComponent', () => {
  let component: CharacterWizardComponent ;
  let fixture: ComponentFixture<CharacterWizardComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CharacterWizardComponent ,
      ],
      providers: [ConfirmationService], // globally provided in app.config; the component test needs it too
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterWizardComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
