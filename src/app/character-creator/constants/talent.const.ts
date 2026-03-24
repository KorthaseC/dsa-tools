import { IncreaseFactor } from '../models/base-creation.model';
import { TalentDefinition, TalentCategory } from '../models/talent.model';

// ─── Talente (Talents / Skills) ──────────────────────────────────────────────
// Source: DSA 5 Regelwerk (Core Rules)
// Total: 59 talents across 5 categories

// ─── Körpertalente (Physical Talents) ────────────────────────────────────────

export const PHYSICAL_TALENTS: TalentDefinition[] = [
  { name: 'Fliegen', label: 'Fliegen', check: ['MU', 'IN', 'GE'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Physical },
  { name: 'Gaukeleien', label: 'Gaukeleien', check: ['MU', 'CH', 'FF'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Physical },
  { name: 'Klettern', label: 'Klettern', check: ['MU', 'GE', 'KK'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Physical },
  { name: 'Körperbeherrschung', label: 'Körperbeherrschung', check: ['GE', 'GE', 'KO'], increaseFactor: IncreaseFactor.D, category: TalentCategory.Physical },
  { name: 'Kraftakt', label: 'Kraftakt', check: ['KO', 'KK', 'KK'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Physical },
  { name: 'Reiten', label: 'Reiten', check: ['CH', 'GE', 'KK'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Physical },
  { name: 'Schwimmen', label: 'Schwimmen', check: ['GE', 'KO', 'KK'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Physical },
  { name: 'Selbstbeherrschung', label: 'Selbstbeherrschung', check: ['MU', 'MU', 'KO'], increaseFactor: IncreaseFactor.D, category: TalentCategory.Physical },
  { name: 'Singen', label: 'Singen', check: ['KL', 'CH', 'KO'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Physical },
  { name: 'Sinnesschärfe', label: 'Sinnesschärfe', check: ['KL', 'IN', 'IN'], increaseFactor: IncreaseFactor.D, category: TalentCategory.Physical },
  { name: 'Tanzen', label: 'Tanzen', check: ['KL', 'CH', 'GE'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Physical },
  { name: 'Taschendiebstahl', label: 'Taschendiebstahl', check: ['MU', 'FF', 'GE'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Physical },
  { name: 'Verbergen', label: 'Verbergen', check: ['MU', 'IN', 'GE'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Physical },
  { name: 'Zechen', label: 'Zechen', check: ['KL', 'KO', 'KK'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Physical },
];

// ─── Gesellschaftstalente (Social Talents) ───────────────────────────────────

export const SOCIAL_TALENTS: TalentDefinition[] = [
  {
    name: 'Bekehren & Überzeugen',
    label: 'Bekehren & Überzeugen',
    check: ['MU', 'KL', 'CH'],
    increaseFactor: IncreaseFactor.B,
    category: TalentCategory.Social,
  },
  { name: 'Betören', label: 'Betören', check: ['MU', 'CH', 'CH'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Social },
  { name: 'Einschüchtern', label: 'Einschüchtern', check: ['MU', 'IN', 'CH'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Social },
  { name: 'Etikette', label: 'Etikette', check: ['KL', 'IN', 'CH'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Social },
  { name: 'Gassenwissen', label: 'Gassenwissen', check: ['KL', 'IN', 'CH'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Social },
  { name: 'Menschenkenntnis', label: 'Menschenkenntnis', check: ['KL', 'IN', 'CH'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Social },
  { name: 'Überreden', label: 'Überreden', check: ['MU', 'IN', 'CH'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Social },
  { name: 'Verkleiden', label: 'Verkleiden', check: ['IN', 'CH', 'GE'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Social },
  { name: 'Willenskraft', label: 'Willenskraft', check: ['MU', 'IN', 'CH'], increaseFactor: IncreaseFactor.D, category: TalentCategory.Social },
];

// ─── Naturtalente (Nature Talents) ───────────────────────────────────────────

export const NATURE_TALENTS: TalentDefinition[] = [
  { name: 'Fährtensuchen', label: 'Fährtensuchen', check: ['MU', 'IN', 'GE'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Nature },
  { name: 'Fesseln', label: 'Fesseln', check: ['KL', 'FF', 'KK'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Nature },
  { name: 'Fischen & Angeln', label: 'Fischen & Angeln', check: ['FF', 'GE', 'KO'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Nature },
  { name: 'Orientierung', label: 'Orientierung', check: ['KL', 'IN', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Nature },
  { name: 'Pflanzenkunde', label: 'Pflanzenkunde', check: ['KL', 'FF', 'KO'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Nature },
  { name: 'Tierkunde', label: 'Tierkunde', check: ['MU', 'MU', 'CH'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Nature },
  { name: 'Wildnisleben', label: 'Wildnisleben', check: ['MU', 'GE', 'KO'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Nature },
];

// ─── Wissenstalente (Knowledge Talents) ──────────────────────────────────────

export const KNOWLEDGE_TALENTS: TalentDefinition[] = [
  {
    name: 'Brett- & Glücksspiel',
    label: 'Brett- & Glücksspiel',
    check: ['KL', 'KL', 'IN'],
    increaseFactor: IncreaseFactor.A,
    category: TalentCategory.Knowledge,
  },
  { name: 'Geographie', label: 'Geographie', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Knowledge },
  { name: 'Geschichtswissen', label: 'Geschichtswissen', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Knowledge },
  { name: 'Götter & Kulte', label: 'Götter & Kulte', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Knowledge },
  { name: 'Kriegskunst', label: 'Kriegskunst', check: ['MU', 'KL', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Knowledge },
  { name: 'Magiekunde', label: 'Magiekunde', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Knowledge },
  { name: 'Mechanik', label: 'Mechanik', check: ['KL', 'KL', 'FF'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Knowledge },
  { name: 'Rechnen', label: 'Rechnen', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Knowledge },
  { name: 'Rechtskunde', label: 'Rechtskunde', check: ['KL', 'IN', 'IN'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Knowledge },
  { name: 'Sagen & Legenden', label: 'Sagen & Legenden', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Knowledge },
  { name: 'Sphärenkunde', label: 'Sphärenkunde', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Knowledge },
  { name: 'Sternkunde', label: 'Sternkunde', check: ['KL', 'KL', 'IN'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Knowledge },
];

// ─── Handwerkstalente (Craft Talents) ────────────────────────────────────────

export const CRAFT_TALENTS: TalentDefinition[] = [
  { name: 'Alchimie', label: 'Alchimie', check: ['MU', 'KL', 'FF'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Crafts },
  { name: 'Boote & Schiffe', label: 'Boote & Schiffe', check: ['FF', 'GE', 'KK'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Crafts },
  { name: 'Fahrzeuge', label: 'Fahrzeuge', check: ['CH', 'FF', 'KO'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Crafts },
  { name: 'Handel', label: 'Handel', check: ['KL', 'IN', 'CH'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Crafts },
  { name: 'Heilkunde Gift', label: 'Heilkunde Gift', check: ['MU', 'KL', 'IN'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Crafts },
  {
    name: 'Heilkunde Krankheiten',
    label: 'Heilkunde Krankheiten',
    check: ['MU', 'IN', 'KO'],
    increaseFactor: IncreaseFactor.B,
    category: TalentCategory.Crafts,
  },
  { name: 'Heilkunde Seele', label: 'Heilkunde Seele', check: ['IN', 'CH', 'KO'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Crafts },
  { name: 'Heilkunde Wunden', label: 'Heilkunde Wunden', check: ['KL', 'FF', 'FF'], increaseFactor: IncreaseFactor.D, category: TalentCategory.Crafts },
  { name: 'Holzbearbeitung', label: 'Holzbearbeitung', check: ['FF', 'GE', 'KK'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Crafts },
  {
    name: 'Lebensmittelbearbeitung',
    label: 'Lebensmittelbearbeitung',
    check: ['IN', 'FF', 'FF'],
    increaseFactor: IncreaseFactor.A,
    category: TalentCategory.Crafts,
  },
  { name: 'Lederbearbeitung', label: 'Lederbearbeitung', check: ['FF', 'GE', 'KO'], increaseFactor: IncreaseFactor.B, category: TalentCategory.Crafts },
  { name: 'Malen & Zeichnen', label: 'Malen & Zeichnen', check: ['IN', 'FF', 'FF'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Crafts },
  { name: 'Metallbearbeitung', label: 'Metallbearbeitung', check: ['FF', 'KO', 'KK'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Crafts },
  { name: 'Musizieren', label: 'Musizieren', check: ['CH', 'FF', 'KO'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Crafts },
  { name: 'Schlösserknacken', label: 'Schlösserknacken', check: ['IN', 'FF', 'FF'], increaseFactor: IncreaseFactor.C, category: TalentCategory.Crafts },
  { name: 'Steinbearbeitung', label: 'Steinbearbeitung', check: ['FF', 'FF', 'KK'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Crafts },
  { name: 'Stoffbearbeitung', label: 'Stoffbearbeitung', check: ['KL', 'FF', 'FF'], increaseFactor: IncreaseFactor.A, category: TalentCategory.Crafts },
];

// ─── All talents combined ────────────────────────────────────────────────────

export const ALL_TALENTS: TalentDefinition[] = [...PHYSICAL_TALENTS, ...SOCIAL_TALENTS, ...NATURE_TALENTS, ...KNOWLEDGE_TALENTS, ...CRAFT_TALENTS];
