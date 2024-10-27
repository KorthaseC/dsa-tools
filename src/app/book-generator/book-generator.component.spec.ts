import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BookGeneratorComponent, BookType } from './book-generator.component';
import { BookGeneratorService } from './book-generator.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('BookGeneratorComponent', () => {
  let component: BookGeneratorComponent;
  let fixture: ComponentFixture<BookGeneratorComponent>;
  let mockBookService: jasmine.SpyObj<BookGeneratorService>;

  beforeEach(async () => {
    mockBookService = jasmine.createSpyObj('BookGeneratorService', [
      'getBooksList',
    ]);

    await TestBed.configureTestingModule({
    imports: [BookGeneratorComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule],
    providers: [{ provide: BookGeneratorService, useValue: mockBookService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(BookGeneratorComponent);
    component = fixture.componentInstance;
    mockBookService = TestBed.inject(
      BookGeneratorService
    ) as jasmine.SpyObj<BookGeneratorService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the form correctly', () => {
    component.bookTypeControl.setValue(BookType.Magic);
    component.featureControl.setValue('yes');
    component.bookCountControl.setValue(5);

    expect(component.isFormValid()).toBeTrue();
  });

  it('should be invalid when form controls are null', () => {
    expect(component.isFormValid()).toBeFalsy();
  });

  it('should load books when getBooks is called', async () => {
    const mockBooks = [
      {
        bookType: BookType.Magic,
        namePartOne: 'Magic',
        namePartTwo: 'of',
        namePartThree: 'Power',
        feature: 'yes',
      },
      {
        bookType: BookType.Divine,
        namePartOne: 'Divine',
        namePartTwo: 'Light',
        namePartThree: 'of Faith',
        feature: 'yes',
      },
    ];

    mockBookService.getBooksList.and.returnValue(Promise.resolve(mockBooks));

    component.bookCountControl.setValue(2);
    component.bookTypeControl.setValue(BookType.Magic);
    component.featureControl.setValue('yes');

    await component.getBooks();

    expect(component.books).toEqual(mockBooks);
    expect(component.isLoading).toBeFalse();
    expect(mockBookService.getBooksList).toHaveBeenCalledWith(
      2,
      BookType.Magic,
      'yes'
    );
  });

  it('should handle errors when loading books', async () => {
    const consoleSpy = spyOn(console, 'error');
    mockBookService.getBooksList.and.returnValue(
      Promise.reject('Error loading books')
    );

    component.bookCountControl.setValue(2);
    component.bookTypeControl.setValue(BookType.Magic);
    component.featureControl.setValue('yes');

    await component.getBooks();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading books:',
      'Error loading books'
    );
    expect(component.isLoading).toBeFalse();
  });

  it('should update displayedBooks when onPageChange is called', () => {
    component.books = Array.from({ length: 20 }).map((_, i) => ({
      bookType: BookType.Magic,
      namePartOne: `Magic ${i}`,
      namePartTwo: 'of',
      namePartThree: `Power ${i}`,
      feature: 'yes',
    }));

    const pageEvent = { pageIndex: 1, pageSize: 5, length: 20 } as PageEvent;

    component.onPageChange(pageEvent);

    expect(component.displayedBooks.length).toBe(5);
    expect(component.displayedBooks[0].namePartOne).toBe('Magic 5');
  });
});
