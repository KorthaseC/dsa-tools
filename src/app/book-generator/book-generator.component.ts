import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { BookGeneratorService } from './book-generator.service';
import {
  BOOK_FEATURE_NAMES,
  BOOK_NAMES_PART_ONE,
  BOOK_NAMES_PART_THREE,
  BOOK_NAMES_PART_TWO,
  BOOK_TYPE_NAMES,
  FEATURE_NAMES,
} from './book-generator.constants';

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
    imports: [
        FormsModule,
        FloatLabelModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        SelectModule,
        
        ProgressSpinnerModule,
        PaginatorModule,
    ],
    templateUrl: './book-generator.component.html',
    styleUrl: './book-generator.component.scss'
})
export class BookGeneratorComponent {
  public bookTypeControl = new FormControl<BookType>(null, Validators.required);
  public featureControl = new FormControl<string>(null, Validators.required);
  public bookCountControl = new FormControl<number>(null, [Validators.required, Validators.min(1), Validators.max(50)]);

  public isLoading: boolean = false;

  public bookTypeOptions = Object.values(BookType).map(v => ({ label: BOOK_TYPE_NAMES[v], value: v }));
  public featureOptions = (['yes', 'random'] as const).map(v => ({ label: FEATURE_NAMES[v], value: v }));

  // Lookup maps — delegates to book-generator.constants.ts
  public readonly bookTypeNames         = BOOK_TYPE_NAMES;
  public readonly featureNames          = FEATURE_NAMES;
  public readonly bookNamesPartOneNames = BOOK_NAMES_PART_ONE;
  public readonly bookNamesPartTwoNames = BOOK_NAMES_PART_TWO;
  public readonly bookNamesPartThreeNames = BOOK_NAMES_PART_THREE;
  public readonly bookFeatureNames      = BOOK_FEATURE_NAMES;

  public readonly Math = Math;

  public books: Book[];

  public displayedBooks: Book[] = []; // books, currently displayed
  pageSize = 10; // number of books per page
  currentPage = 0; // current page

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

  public onPageChange(event: PaginatorState): void {
    this.currentPage = event.page ?? 0;
    this.pageSize = event.rows ?? 10;
    this.updateDisplayedBooks();
  }

  private updateDisplayedBooks(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedBooks = this.books.slice(startIndex, endIndex);
  }
}
