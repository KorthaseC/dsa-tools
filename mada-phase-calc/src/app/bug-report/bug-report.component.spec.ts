import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BugReportComponent } from './bug-report.component';
import { BugReportService } from './bug-report.service';

describe('BugReportComponent', () => {
  let component: BugReportComponent;
  let fixture: ComponentFixture<BugReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BugReportComponent,
        BrowserAnimationsModule,
      ],
      providers: [BugReportService, TranslateService],
    }).compileComponents();

    fixture = TestBed.createComponent(BugReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form when all fields are filled', () => {
    component.bugReportForm.controls['reportType'].setValue('bug-report');
    component.bugReportForm.controls['username'].setValue('testuser');
    component.bugReportForm.controls['email'].setValue('testuser@example.com');
    component.bugReportForm.controls['date'].setValue(new Date());
    component.bugReportForm.controls['description'].setValue(
      'This is a test bug report.'
    );

    expect(component.bugReportForm.valid).toBeTruthy();
  });

  it('should have an invalid form when required fields are empty', () => {
    component.bugReportForm.controls['reportType'].setValue('');
    component.bugReportForm.controls['username'].setValue('');
    component.bugReportForm.controls['email'].setValue('');
    component.bugReportForm.controls['date'].setValue('');
    component.bugReportForm.controls['description'].setValue('');

    expect(component.bugReportForm.invalid).toBeTruthy();
  });

  it('should set fileTooLarge to true when file size exceeds limit', () => {
    // Create a file with content that exceeds 2 MB
    const largeContent = new Array(3 * 1024 * 1024).join('a'); // 3 MB content
    const mockFile = new File([largeContent], 'filename.txt', {
      type: 'text/plain',
    });
    const event = { target: { files: [mockFile] } };

    component.onFileChange(event);

    expect(component.fileTooLarge).toBe(true);
  });

  it('should call sendToGoogleSheets when onSubmit is called with valid form', () => {
    spyOn(component as any, 'sendToGoogleSheets');

    component.bugReportForm.controls['reportType'].setValue('bug-report');
    component.bugReportForm.controls['username'].setValue('testuser');
    component.bugReportForm.controls['email'].setValue('testuser@example.com');
    component.bugReportForm.controls['date'].setValue(new Date());
    component.bugReportForm.controls['description'].setValue(
      'This is a test bug report.'
    );
    component.onSubmit();

    expect((component as any).sendToGoogleSheets).toHaveBeenCalled();
  });
});
