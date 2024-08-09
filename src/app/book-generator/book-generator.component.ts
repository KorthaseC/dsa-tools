import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BookGeneratorService } from './book-generator.service';

export enum BookType {
  None = 'none',
  Magic = 'magic',
  Divine = 'divine',
  Profane = 'profane',
}

export interface Book {
  bookType: BookType;
  namePartOne: string;
  namePartTwo: string;
  namePartThree: string;
  feature: string;
}

@Component({
  selector: 'app-book-generator',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    CommonModule,
    MatTooltip,
    MatIcon,
  ],
  templateUrl: './book-generator.component.html',
  styleUrl: './book-generator.component.scss',
})
export class BookGeneratorComponent {
  public bookTypeControl = new FormControl<BookType>(null);
  public featureControl = new FormControl<string>(null);
  public bookCountControl = new FormControl<number>(null);

  public isLoading: boolean = false;

  public bookTypeOptions: BookType[] = Object.values(BookType);
  public featureOptions: string[] = ['yes', 'random'];

  public books: Book[];

  public displayedBooks: Book[] = []; // books, currently displayed
  pageSize = 10; // number of books per page
  currentPage = 0; // current page

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private bookService: BookGeneratorService) {}

  public isFormValid(): boolean {
    return (
      this.bookTypeControl.valid &&
      this.featureControl.valid &&
      this.bookCountControl.valid
    );
  }

  public async getBooks(): Promise<void> {
    this.isLoading = true;
    try {
      this.books = await this.bookService.getBooksList(
        this.bookCountControl.value,
        this.bookTypeControl.value,
        this.featureControl.value
      );
      this.updateDisplayedBooks();
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      this.isLoading = false;
    }
  }

  public onPageChange(pageEvent: PageEvent): void {
    this.currentPage = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    this.updateDisplayedBooks();
  }

  private updateDisplayedBooks(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedBooks = this.books.slice(startIndex, endIndex);
  }
}
