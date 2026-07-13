import { TestBed } from '@angular/core/testing';
import { CharacterPdfService } from './character-pdf.service';
import { CharacterResolverService } from './character-resolver.service';
import { createDefaultSaveData } from '../models/character-save.model';

describe('CharacterPdfService', () => {
  let pdf: CharacterPdfService;
  let resolver: CharacterResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pdf = TestBed.inject(CharacterPdfService);
    resolver = TestBed.inject(CharacterResolverService);
  });

  it('round-trips the embedded save-JSON through build → extract (incl. boughtBack)', async () => {
    const saveData: any = {
      ...createDefaultSaveData(),
      speciesType: 'elf',
      profession: 'gildenlosermagierinolporthallederwinde',
      magicTradition: 'Gildenmagier',
      magicGuidingAttribute: 'KL',
      bio: { name: 'Lîriel Silberschaum', socialStatus: 'Frei' },
      attributes: { MU: 14, KL: 15, IN: 11, CH: 13, FF: 12, GE: 12, KO: 11, KK: 10 },
      energies: {
        lifePoints: { bought: 0, current: 16, permanentLost: 0, boughtBack: 0 },
        astralPoints: { bought: 0, current: 20, permanentLost: 0, boughtBack: 4 },
        karmaPoints: { bought: 0, current: 0, permanentLost: 0, boughtBack: 0 },
        fatePoints: { bought: 0, current: 3, permanentLost: 0, boughtBack: 0 },
      },
      entries: [
        { kind: 'advantage', id: 'zauberer' },
        { kind: 'specialAbility', id: 'bindungdesstabesaktivieren' },
        { kind: 'specialAbility', id: 'bindungdermagierkugelaktivieren' },
      ],
    };

    const character = resolver.resolve(saveData);
    // JSON-normalize (drop undefined-valued keys) so toEqual matches what JSON.stringify actually embeds.
    const expected = JSON.parse(JSON.stringify(resolver.toSaveData(character)));

    const bytes = await pdf.buildPdf(character);
    expect(bytes.length).toBeGreaterThan(0);

    const extracted = await pdf.extractCharacterJson(bytes);
    expect(extracted).toEqual(expected as any);
    expect((extracted as any).energies.astralPoints.boughtBack).toBe(4);
  });

  it('returns null for a PDF without embedded character data', async () => {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    doc.addPage();
    const plainBytes = await doc.save();
    expect(await pdf.extractCharacterJson(plainBytes)).toBeNull();
  });
});
