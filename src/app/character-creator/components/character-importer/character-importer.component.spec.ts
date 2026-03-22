import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterImporterComponent } from './character-importer.component';

describe('CharacterImporterComponent', () => {
  let component: CharacterImporterComponent;
  let fixture: ComponentFixture<CharacterImporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterImporterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
