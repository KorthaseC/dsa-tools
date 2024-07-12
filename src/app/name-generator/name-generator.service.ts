import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NameRegion } from './name-generator.model';
import { firstValueFrom } from 'rxjs';

interface NameRequest {
  origin: string;
  gender?: string;
  noble?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NameGeneratorService {
  private namesBaseUrl: string = 'https://dsa-name-generator.onrender.com/';

  constructor(private readonly http: HttpClient) {}

  public async getNameList(
    region: NameRegion,
    gender?: string,
    isNoble?: boolean
  ): Promise<string[]> {
    const url: string = this.namesBaseUrl + 'generate-names';
    const headers = { 'Content-Type': 'application/json' };
    const body: NameRequest = {
      origin: region,
      noble: isNoble ?? false,
    };

    if (gender && gender !== 'all') {
      body.gender = gender;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<string[]>(url, body, { headers })
      );
      return response;
    } catch (error) {
      console.error('Error fetching names:', error);
      return [];
    }
  }
}
