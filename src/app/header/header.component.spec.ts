import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();
    const mockRouter = {
      events: routerEventsSubject.asObservable(),
      routerState: {
        root: {},
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterModule.forRoot([]),
      ],
      providers: [
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
