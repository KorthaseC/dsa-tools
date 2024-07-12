import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NameGeneratorComponent } from './name-generator.component';
import { NameRegion, RACE_PANEL } from './name-generator.model';
import { NameGeneratorService } from './name-generator.service';

describe('NameGeneratorComponent', () => {
  let component: NameGeneratorComponent;
  let fixture: ComponentFixture<NameGeneratorComponent>;
  let nameService: jasmine.SpyObj<NameGeneratorService>;

  beforeEach(async () => {
    const nameServiceSpy = jasmine.createSpyObj('NameGeneratorService', [
      'getNameList',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        NameGeneratorComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: NameGeneratorService, useValue: nameServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NameGeneratorComponent);
    component = fixture.componentInstance;
    nameService = TestBed.inject(
      NameGeneratorService
    ) as jasmine.SpyObj<NameGeneratorService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize with default values', () => {
    expect(component.openPanelIndex).toBe(-1);
    expect(component.racePanels).toBe(RACE_PANEL);
    expect(component.isNoble.value).toBeFalse();
    expect(component.genderControl.value).toBe('all');
    expect(component.names).toEqual([]);
    expect(component.isLoading).toBeFalse();
    expect(component.hasNotNoble).toBeFalse();
  });

  it('should set race and update tree data', () => {
    component.setRace(0);
    expect(component.openPanelIndex).toBe(0);
    expect(component.dataSource.data).toEqual(RACE_PANEL[0].treeData);

    component.setRace(0);
    expect(component.openPanelIndex).toBe(-1);

    component.setRace(1);
    expect(component.openPanelIndex).toBe(1);
    expect(component.dataSource.data).toEqual(RACE_PANEL[1].treeData);
  });

  it('should validate form correctly', () => {
    component.genderControl.setValue('male');
    component.setRegion({ value: 'region1', hasNoble: true }, false);
    expect(component.isFormValid()).toBeTrue();

    component.genderControl.setValue('');
    expect(component.isFormValid()).toBeFalse();

    component.setRegion(null, false);
    expect(component.isFormValid()).toBeFalse();
  });

  it('should get names and set loading state correctly', async () => {
    const mockNames = ['Name1', 'Name2', 'Name3'];
    nameService.getNameList.and.returnValue(Promise.resolve(mockNames));

    component.setRegion({ value: NameRegion.Garetien, hasNoble: true }, false);
    component.genderControl.setValue('male');
    component.isNoble.setValue(true);

    await component.getNames();

    expect(component.isLoading).toBeFalse();
    expect(component.names).toEqual(mockNames);
    expect(nameService.getNameList).toHaveBeenCalledWith(
      NameRegion.Garetien,
      'male',
      true
    );
  });

  it('should handle errors when getting names', async () => {
    const errorResponse = new ErrorEvent('Network error');
    nameService.getNameList.and.returnValue(Promise.reject(errorResponse));

    spyOn(console, 'error');

    component.setRegion({ value: 'region1', hasNoble: true }, false);
    component.genderControl.setValue('male');
    component.isNoble.setValue(true);

    await component.getNames();

    expect(component.isLoading).toBeFalse();
    expect(component.names).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'Error loading names:',
      errorResponse
    );
  });

  it('should set region and hasNotNoble correctly', () => {
    component.setRegion({ value: 'region1', hasNoble: true }, false);
    expect(component.hasNotNoble).toBeFalse();
    expect(component['region']).toBe('region1');

    component.setRegion({ value: 'region2', hasNoble: false }, false);
    expect(component.hasNotNoble).toBeTrue();
    expect(component['region']).toBe('region2');
  });

  it('should handle tree region selection', () => {
    component.setRegion({ value: NameRegion.Garetien, hasNoble: true }, true);
    expect(component.hasNotNoble).toBeFalse();
    expect(component['region']).toBe(NameRegion.Garetien);

    component.setRegion(
      { value: NameRegion.Waldmenschen, hasNoble: false },
      true
    );
    expect(component.hasNotNoble).toBeTrue();
    expect(component['region']).toBe(NameRegion.Waldmenschen);
  });
});
