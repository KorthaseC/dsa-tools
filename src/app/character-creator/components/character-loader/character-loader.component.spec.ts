import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterLoaderComponent } from './character-loader.component';

describe('CharacterLoaderComponent', () => {
  let component: CharacterLoaderComponent;
  let fixture: ComponentFixture<CharacterLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
