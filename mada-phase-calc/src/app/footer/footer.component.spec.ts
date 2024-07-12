import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import packageInfo from '../../../package.json';
import { FooterComponent } from './footer.component';
import { ulissesIcon } from './footer.constants';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        TranslateModule.forRoot(),
        RouterTestingModule,
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

  it('should have the correct ulissesIcon', () => {
    expect(component.ulissesIcon).toBe(ulissesIcon);
  });

  it('should open link in a new tab', () => {
    spyOn(window, 'open');
    const url = 'https://example.com';
    component.goToLink(url);
    expect(window.open).toHaveBeenCalledWith(url, '_blank');
  });
});
