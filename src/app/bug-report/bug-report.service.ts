import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private googleScriptURL: string = `https://script.google.com/macros/s/${environment.googleScriptId}/exec`;

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

    const headers = new HttpHeaders({
      'Content-Type': 'text/plain;charset=utf-8',
    });

    return this.http.post(this.googleScriptURL, body, { headers });
  }
}
