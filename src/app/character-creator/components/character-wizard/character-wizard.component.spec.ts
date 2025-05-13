import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CharacterWizardComponent } from './character-wizard.component';

describe('WeekdayComponent', () => {
  let component: CharacterWizardComponent ;
  let fixture: ComponentFixture<CharacterWizardComponent >;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CharacterWizardComponent ,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterWizardComponent );
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'instant').and.callFake((key: string) => key);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
