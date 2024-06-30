import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Report {
  reportType: string;
  username: string;
  email: string;
  date: Date;
  description: string;
  expected?: string;
  base64String: string;
}

@Injectable({
  providedIn: 'root',
})
export class BugReportService {
  private googleScriptURL =
    'https://script.google.com/macros/s/AKfycbwc-_ZFO34epFCC-TlMPaBA7X9uMHM-WVWSiehgsFSEbdGGdlSiaxvpPmVDg1cRyJ07/exec';

  constructor(private http: HttpClient) {}

  sendBugReport(bugReport: any, base64String: string): Observable<any> {
    const body: Report = {
      reportType: bugReport.reportType,
      username: bugReport.username,
      email: bugReport.email,
      date: bugReport.date,
      description: bugReport.description,
      expected: bugReport.expected ? bugReport.expected : '',
      base64String: base64String ? base64String : '',
    };

    return this.http.post(this.googleScriptURL, body);
  }
}
