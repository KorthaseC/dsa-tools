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

  // These used to be (click) handlers on p-button/<a> without href, which made them invisible to
  // crawlers. Keep them real anchors.
  it('should render external links as real anchors with href and rel="noopener"', () => {
    const anchors: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a[href^="http"]'));
    const hrefs = anchors.map((a) => a.getAttribute('href'));

    expect(hrefs).toContain(component.links.github);
    expect(hrefs).toContain(component.links.discord);
    expect(hrefs).toContain(component.links.ruleWiki);
    anchors.forEach((a) => {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener');
    });
  });
});
