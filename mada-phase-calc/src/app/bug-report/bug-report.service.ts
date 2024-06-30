import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private scriptID: string =
    'AKfycbxIUYqKgVM-Q9cNCZ22dLOO6eXopTjPcvsP1y1ih4rCL_8T8cTBgxGd9MzRr16tLU_m';
  private googleScriptURL: string = `https://script.google.com/macros/s/${this.scriptID}/exec`;

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
