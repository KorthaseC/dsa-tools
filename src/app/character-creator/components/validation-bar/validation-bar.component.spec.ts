import { TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { ValidationBarComponent } from './validation-bar.component';
import { CharacterStateService } from '../../services/character-state.service';
import { SettingsService } from '../../services/settings.service';
import { CharacterResolverService } from '../../services/character-resolver.service';
import { createDefaultSaveData } from '../../models/character-save.model';
import { ExperienceLevelId } from '../../models/experience-level.model';
import { SpeciesType } from '../../models/species.model';

describe('ValidationBarComponent — hiding the manual-check hints', () => {
  let component: ValidationBarComponent;
  let ref: ComponentRef<ValidationBarComponent>;
  let settings: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ValidationBarComponent] });
    settings = TestBed.inject(SettingsService);
    settings.setHideManualHints(false);

    // A character carrying a narrative ("manuell prüfen") prerequisite: Kontakt's own rule text is
    // narrative, so the requirement rule reports it as an info.
    const state = TestBed.inject(CharacterStateService);
    state.character.set(
      new CharacterResolverService().resolve({
        ...createDefaultSaveData(),
        experienceLevelId: ExperienceLevelId.Experienced,
        speciesType: SpeciesType.Human,
        entries: [{ kind: 'specialAbility', id: 'berufsgeheimnis', options: [{ key: 'param', id: 'antidot' }] }],
      }),
    );

    const fixture = TestBed.createComponent(ValidationBarComponent);
    component = fixture.componentInstance;
    ref = fixture.componentRef;
  });

  const enableFilter = () => ref.setInput('allowHidingHints', true);

  it('produces at least one manual hint to work with', () => {
    expect(component.infos().length).toBeGreaterThan(0);
  });

  it('shows every hint while the filter is off', () => {
    enableFilter();
    expect(component.hintsHidden()).toBe(false);
    expect(component.visibleInfos().length).toBe(component.infos().length);
    expect(component.hiddenHintCount()).toBe(0);
  });

  it('folds the hints away and reports how many, once switched on', () => {
    enableFilter();
    component.setHideHints(true);
    expect(component.visibleInfos()).toEqual([]);
    expect(component.hiddenHintCount()).toBe(component.infos().length);
    expect(component.hintCount()).toBe(component.warnings().length); // badge drops the hidden ones
  });

  it('KEEPS the panel reachable while hints are hidden — otherwise the switch is unreachable', () => {
    enableFilter();
    component.setHideHints(true);
    expect(component.errors().length + component.hintCount()).toBe(0); // nothing left to show …
    expect(component.hasPanelContent()).toBe(true); // … but the panel still opens
  });

  it('ignores the setting where the filter is not offered (the wizard)', () => {
    component.setHideHints(true); // e.g. set earlier on the sheet
    expect(component.allowHidingHints()).toBe(false);
    expect(component.hintsHidden()).toBe(false);
    expect(component.visibleInfos().length).toBe(component.infos().length);
  });

  it('persists the choice for the session only', () => {
    enableFilter();
    component.setHideHints(true);
    expect(sessionStorage.getItem('dsa-hide-manual-hints')).toBe('true');
    expect(localStorage.getItem('dsa-hide-manual-hints')).toBeNull(); // not a lasting setting
  });

  afterEach(() => settings.setHideManualHints(false));
});
