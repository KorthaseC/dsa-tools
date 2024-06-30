import { Component } from '@angular/core';
import { BugReportService } from './bug-report.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-bug-report',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    TranslateModule,
    MatRadioModule,
    MatTooltipModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './bug-report.component.html',
  styleUrl: './bug-report.component.scss',
})
export class BugReportComponent {
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
    this.fileTooLarge =
      this.selectedFile && this.selectedFile.size > 2 * 1024 * 1024; // 2 MB Limit
  }

  public onSubmit(): void {
    if (
      this.bugReportForm.invalid ||
      this.fileTooLarge ||
      this.submissionCount >= this.maxSubmissions
    ) {
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
    this.bugReportService
      .sendBugReport(this.bugReportForm.value, base64String)
      .subscribe({
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
