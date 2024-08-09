import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Book } from './book-generator.component';

interface BookRequestApi {
  bookType?: string;
  feature: boolean;
  bookCounter: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookGeneratorService {
  private apiBaseUrl: string = 'https://dsa-name-generator.onrender.com/';

  constructor(private readonly http: HttpClient) {}

  public async getBooksList(
    bookCount: number,
    bookType?: string,
    feature?: string
  ): Promise<Book[]> {
    const url: string = this.apiBaseUrl + 'generate-books';
    const headers = { 'Content-Type': 'application/json' };
    const body: BookRequestApi = {
      bookCounter: bookCount,
      feature: feature === 'yes',
    };

    if (bookType && bookType !== 'none') {
      body.bookType = bookType;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<Book[]>(url, body, { headers })
      );
      return response;
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  }
}
