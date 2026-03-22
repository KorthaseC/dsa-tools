import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BugReportService } from './bug-report.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('BugReportService', () => {
  let service: BugReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [BugReportService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(BugReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send bug report successfully', () => {
    const mockBugReport = {
      reportType: 'bug-report',
      username: 'testuser',
      email: 'testuser@example.com',
      date: new Date(),
      description: 'This is a test bug report.',
      expected: 'Expected behavior',
    };

    const base64String = 'dGVzdA=='; // Base64 string for 'test'

    service.sendBugReport(mockBugReport, base64String).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(service['googleScriptURL']);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe(
      'text/plain;charset=utf-8'
    );
    expect(req.request.body).toEqual({
      reportType: mockBugReport.reportType,
      username: mockBugReport.username,
      email: mockBugReport.email,
      date: mockBugReport.date,
      description: mockBugReport.description,
      expected: mockBugReport.expected,
      base64String: base64String,
    });

    req.flush({ success: true });
  });

  it('should handle error response', () => {
    const mockBugReport = {
      reportType: 'bug-report',
      username: 'testuser',
      email: 'testuser@example.com',
      date: new Date(),
      description: 'This is a test bug report.',
      expected: 'Expected behavior',
    };

    const base64String = 'dGVzdA=='; // Base64 string for 'test'

    service.sendBugReport(mockBugReport, base64String).subscribe({
      next: () => fail('Should have failed with the 500 error'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(service['googleScriptURL']);
    req.flush('Something went wrong', {
      status: 500,
      statusText: 'Server Error',
    });
  });
});
