import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import packageInfo from '../../../package.json';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        RouterModule.forRoot([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct version', () => {
    expect(component.version).toBe(packageInfo.version);
  });

  it('should open link in a new tab', () => {
    spyOn(window, 'open');
    const url = 'https://example.com';
    component.goToLink(url);
    expect(window.open).toHaveBeenCalledWith(url, '_blank');
  });
});
