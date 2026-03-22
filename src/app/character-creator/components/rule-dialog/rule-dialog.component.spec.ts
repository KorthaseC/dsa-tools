import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleDialogComponent } from './rule-dialog.component';

describe('RuleDialogComponent', () => {
  let component: RuleDialogComponent;
  let fixture: ComponentFixture<RuleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
