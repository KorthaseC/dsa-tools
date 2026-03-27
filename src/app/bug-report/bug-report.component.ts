import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { APP_ROUTES } from '../app.constants';
import { BugReportService } from './bug-report.service';

@Component({
  selector: 'app-bug-report',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    RadioButtonModule,
    DatePickerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './bug-report.component.html',
  styleUrl: './bug-report.component.scss',
})
export class BugReportComponent {
  public readonly routes = APP_ROUTES;
  public bugReportForm: FormGroup;
  public selectedFile: File | null = null;
  public fileTooLarge: boolean = false;
  public submissionCount: number = 0;
  public maxSubmissions: number = 3; // Set max tickets submissions
  public isFormSend: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private bugReportService: BugReportService
  ) {
    this.bugReportForm = this.fb.group({
      reportType: ['bug-report', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.email]],
      date: ['', Validators.required],
      description: ['', Validators.required],
      expected: [''],
      file: [null],
    });
  }

  public onFileChange(event: any): void {
    this.selectedFile = event.target.files[0] || null;
    this.fileTooLarge = this.selectedFile && this.selectedFile.size > 2 * 1024 * 1024; // 2 MB Limit
  }

  public onSubmit(): void {
    if (this.bugReportForm.invalid || this.fileTooLarge || this.submissionCount >= this.maxSubmissions) {
      return;
    }
    this.isLoading = true;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      this.sendToGoogleSheets(base64String);
    };
    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.sendToGoogleSheets('');
    }
  }

  private sendToGoogleSheets(base64String: string): void {
    this.bugReportService.sendBugReport(this.bugReportForm.value, base64String).subscribe({
      next: (response) => {
        this.isFormSend = true;
        this.submissionCount++;
        this.bugReportForm.reset();
        this.selectedFile = null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fehler:', error);
        this.isLoading = false;
      },
    });
  }
}
