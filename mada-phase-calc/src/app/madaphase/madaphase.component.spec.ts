import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MadaphaseComponent } from './madaphase.component';

describe('MadaphaseComponent', () => {
  let component: MadaphaseComponent;
  let fixture: ComponentFixture<MadaphaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MadaphaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MadaphaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
