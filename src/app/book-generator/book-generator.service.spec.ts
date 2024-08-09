import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Book, BookType } from './book-generator.component';
import { BookGeneratorService } from './book-generator.service';

describe('NameGeneratorService', () => {
  let service: BookGeneratorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookGeneratorService],
    });

    service = TestBed.inject(BookGeneratorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch book list with provided parameters', async () => {
    const mockResponse: Book[] = [
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
        namePartThree: 'Faith',
        feature: 'yes',
      },
    ];
    const bookCount: number = 3;
    const bookType: string = 'magic';
    const feature: string = 'yes';

    const promise = service.getBooksList(bookCount, bookType, feature);

    const req = httpMock.expectOne('http://localhost:3000/generate-books');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      bookCounter: bookCount,
      bookType: bookType,
      feature: true,
    });

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should fetch book list with default parameters', async () => {
    const mockResponse: Book[] = [
      {
        bookType: BookType.None,
        namePartOne: 'Name1',
        namePartTwo: 'of',
        namePartThree: 'Wisdom',
        feature: 'no',
      },
      {
        bookType: BookType.None,
        namePartOne: 'Name2',
        namePartTwo: 'of',
        namePartThree: 'Strength',
        feature: 'no',
      },
    ];
    const bookCount: number = 2;
    const bookType: string = 'none';
    const feature: string = 'random';

    const promise = service.getBooksList(bookCount, bookType, feature);

    const req = httpMock.expectOne('http://localhost:3000/generate-books');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      bookCounter: bookCount,
      feature: false,
    });

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should return an empty array on error', async () => {
    const bookCount: number = 2;
    const bookType: string = 'magic';
    const feature: string = 'yes';

    const promise = service.getBooksList(bookCount, bookType, feature);

    const req = httpMock.expectOne('http://localhost:3000/generate-books');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      bookCounter: bookCount,
      bookType: bookType,
      feature: true,
    });

    req.flush('Error fetching books', {
      status: 500,
      statusText: 'Server Error',
    });

    const result = await promise;
    expect(result).toEqual([]);
  });
});
