import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterStateService } from '../../../services/character-state.service';
import { AttributesHeaderComponent } from './attributes-header.component';

describe('AttributesHeaderComponent', () => {
  let component: AttributesHeaderComponent;
  let fixture: ComponentFixture<AttributesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributesHeaderComponent],
      providers: [
        {
          provide: CharacterStateService,
          useValue: { character: signal({ name: '' }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttributesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

