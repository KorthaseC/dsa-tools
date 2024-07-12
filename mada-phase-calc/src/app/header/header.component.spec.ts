import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AppComponent } from '../app.component';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let appComponent: AppComponent;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();
    const mockRouter = {
      events: routerEventsSubject.asObservable(),
      routerState: {
        root: {},
      },
    };

    appComponent = jasmine.createSpyObj('AppComponent', ['changeLanguage']);
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: AppComponent, useValue: appComponent },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update page title on navigation end', () => {
    spyOn(component as any, 'updatePageTitle');
    component.ngOnInit();
    routerEventsSubject.next(new NavigationEnd(0, '/', '/'));
    expect((component as any).updatePageTitle).toHaveBeenCalled();
  });

  it('should change language when isGerman value changes', () => {
    component.isGerman.setValue(false);
    expect(appComponent.changeLanguage).toHaveBeenCalledWith('en');

    component.isGerman.setValue(true);
    expect(appComponent.changeLanguage).toHaveBeenCalledWith('de');
  });

  it('should deactivate other checkbox when one is activated', () => {
    component.deactivateOtherCheckbox(true, true);
    expect(component.isSelectMulti.value).toBe(false);

    component.deactivateOtherCheckbox(true, false);
    expect(component.isRollMulti.value).toBe(false);
  });

  it('should initialize DiceBox if platform is browser', () => {
    spyOn(component as any, 'initDiceBox');
    component.ngAfterViewInit();
    expect((component as any).initDiceBox).toHaveBeenCalled();
  });

  it('should add dice correctly', () => {
    component['selectDice'] = [];
    component['addDice']('1d6');
    expect(component['selectDice']).toEqual(['1d6']);

    component['addDice']('1d6');
    expect(component['selectDice']).toEqual(['2d6']);

    component['addDice']('1d8');
    expect(component['selectDice']).toEqual(['2d6', '1d8']);
  });

  it('should roll dice correctly', () => {
    component.isSelectMulti.setValue(false);
    component.isRollMulti.setValue(false);
    component['diceBox'] = jasmine.createSpyObj('DiceBox', [
      'roll',
      'add',
      'clear',
    ]);

    component.rollDice('1d6');
    expect(component['diceBox'].roll).toHaveBeenCalledWith('1d6');

    component.isSelectMulti.setValue(true);
    component.rollDice('1d6');
    expect(component['diceBox'].add).not.toHaveBeenCalled();
    expect(component['selectDice']).toContain('1d6');

    component.isRollMulti.setValue(true);
    component.rollDice('1d6');
    expect(component['diceBox'].add).toHaveBeenCalledWith('1d6');
  });

  it('should clear dice', () => {
    component['diceBox'] = jasmine.createSpyObj('DiceBox', ['clear']);
    component.deletDice();
    expect(component['diceBox'].clear).toHaveBeenCalled();
    expect(component['selectDice']).toEqual([]);
  });

  it('should roll all selected dice', () => {
    component['diceBox'] = jasmine.createSpyObj('DiceBox', ['roll']);
    component['selectDice'] = ['1d6', '1d8'];
    component.rollAllDice();
    expect(component['diceBox'].roll).toHaveBeenCalledWith(['1d6', '1d8']);
  });

  it('should find selected die number', () => {
    component['selectDice'] = ['2d6', '3d8'];
    const dieNumber = component.findSelectedDieNumber('1d6');
    expect(dieNumber).toBe(2);

    const dieNumberNotFound = component.findSelectedDieNumber('1d10');
    expect(dieNumberNotFound).toBe(0);
  });

  it('should update page title correctly', () => {
    const mockRoute = {
      snapshot: {
        data: {
          title: 'Test Title',
        },
      },
      firstChild: null,
    } as any;

    spyOn(component as any, 'getActiveRoute').and.returnValue(mockRoute);
    component['updatePageTitle']();
    expect(component.pageTitle).toBe('Test Title');
  });

  it('should get active route', () => {
    const mockRoute = {
      firstChild: {
        firstChild: {
          firstChild: null,
        },
      },
    } as any;

    const activeRoute = component['getActiveRoute'](mockRoute);
    expect(activeRoute).toBe(mockRoute.firstChild.firstChild);
  });
});
