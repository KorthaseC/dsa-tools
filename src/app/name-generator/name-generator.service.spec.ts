import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NameRegion } from './name-generator.model';
import { NameGeneratorService } from './name-generator.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NameGeneratorService', () => {
  let service: NameGeneratorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [NameGeneratorService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(NameGeneratorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch name list with provided parameters', async () => {
    const mockResponse = ['Name1', 'Name2', 'Name3'];
    const region: NameRegion = NameRegion.Garetien;
    const gender = 'male';
    const isNoble = true;

    const promise = service.getNameList(region, gender, isNoble);

    const req = httpMock.expectOne(
      'https://dsa-name-generator.onrender.com/generate-names'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      origin: region,
      gender: gender,
      noble: isNoble,
    });

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should fetch name list with default parameters', async () => {
    const mockResponse = ['Name1', 'Name2', 'Name3'];
    const region: NameRegion = NameRegion.Almada;

    const promise = service.getNameList(region);

    const req = httpMock.expectOne(
      'https://dsa-name-generator.onrender.com/generate-names'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      origin: region,
      noble: false,
    });

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should return an empty array on error', async () => {
    const region: NameRegion = NameRegion.Auelfen;
    const gender = 'female';
    const isNoble = false;

    const promise = service.getNameList(region, gender, isNoble);

    const req = httpMock.expectOne(
      'https://dsa-name-generator.onrender.com/generate-names'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      origin: region,
      gender: gender,
      noble: isNoble,
    });

    req.flush('Error fetching names', {
      status: 500,
      statusText: 'Server Error',
    });

    const result = await promise;
    expect(result).toEqual([]);
  });
});
