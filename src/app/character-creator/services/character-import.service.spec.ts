import { TestBed } from '@angular/core/testing';
import { CharacterImportService } from './character-import.service';

describe('CharacterImportService', () => {
  let service: CharacterImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterImportService);
  });

  // Regression: extractPoolInput dropped `boughtBack`, so an imported character lost its bought-back
  // permanent LeP/AsP/KaP (max energy came out too low even though the export wrote it).
  it('preserves bought-back permanent points (boughtBack) on import', () => {
    const json = {
      version: 3,
      speciesType: 'human',
      attributes: { MU: 12, KL: 12, IN: 12, CH: 10, FF: 10, GE: 10, KO: 12, KK: 12 },
      energies: {
        lifePoints: { bought: 0, current: 30, permanentLost: 5, boughtBack: 5 },
        astralPoints: { bought: 0, current: 0, permanentLost: 0, boughtBack: 0 },
        karmaPoints: { bought: 0, current: 0, permanentLost: 0, boughtBack: 0 },
        fatePoints: { bought: 0, current: 3, permanentLost: 0, boughtBack: 0 },
      },
      entries: [],
    };

    const { character } = service.importFromJson(json);
    const lep = character.derived.lifePoints;

    expect(lep.boughtBack).toBe(5); // was 0 before the fix (field dropped by the parser)
    expect(lep.permanentLost).toBe(5);
    // 5 lost fully bought back → net loss 0 → max is NOT reduced by the loss.
    expect(lep.max).toBe(lep.base + lep.bonus + lep.bought);
  });
});
