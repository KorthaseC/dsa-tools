import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let translateService: TranslateService;
  let titleService: Title;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
      ],
      providers: [TranslateService, Title],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(Title);
    spyOn(translateService, 'instant').and.callFake((key: string) => key);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'DSA Tools' title`, () => {
    expect(component.title).toEqual('DSA Tools');
  });

  it('should set the default language on init', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(translateService, 'setDefaultLang');
    spyOn(translateService, 'use');
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('de');
    expect(translateService.use).toHaveBeenCalledWith('de');
  });

  it('should set the language from localStorage on init', () => {
    spyOn(localStorage, 'getItem').and.returnValue('en');
    spyOn(translateService, 'setDefaultLang');
    spyOn(translateService, 'use');
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
  });

  it('should change language and set it to localStorage', () => {
    spyOn(localStorage, 'setItem');
    spyOn(translateService, 'use');
    component.changeLanguage('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(localStorage.setItem).toHaveBeenCalledWith('language', 'en');
  });

  it('should update the title on language change', () => {
    const langChangeEmitter = new EventEmitter<LangChangeEvent>();
    spyOnProperty(translateService, 'onLangChange', 'get').and.returnValue(
      langChangeEmitter
    );
    spyOn(titleService, 'setTitle');
    component.ngOnInit();

    langChangeEmitter.emit({ lang: 'en', translations: {} });

    expect(titleService.setTitle).toHaveBeenCalledWith('shared.title');
  });
});
