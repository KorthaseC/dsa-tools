import { AlchemyDiceResult, PurityOption } from './alcheny.models';

/********************** Alchemy Constants **********************/
export const ELEMENTS_ALCHEMY: string[] = [
  'Feuer',
  'Wasser',
  'Humus',
  'Eis',
  'Luft',
  'Erz',
  'Magisch',
];

export const PURITY_OPTIONS_STANDARD: PurityOption[] = [
  { text: 'min. Hälfte unrein', mod: -2 },
  { text: 'min. 1 unrein', mod: -1 },
  { text: 'alle min. ausreichend', mod: 0 },
  { text: 'alle min. rein', mod: +1 },
  { text: 'min. 1 hochrein, kein unrein', mod: +2 },
  { text: 'alle min. hochrein', mod: +3 },
];

export const PURITY_OPTIONS_STIMULANT: PurityOption[] = [
  { text: 'min. Hälfte unrein', mod: 2, qs: -2 },
  { text: 'min. 1 unrein', mod: 1, qs: -1 },
  { text: 'alle min. ausreichend', mod: 1, qs: 0 },
  { text: 'alle min. rein', mod: 0, qs: 1 },
  { text: 'min. 1 hochrein, kein unrein', mod: -1, qs: 2 },
  { text: 'alle min. hochrein', mod: -1, qs: 3 },
];

export const ELIXIR_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 3], alchemicResult: 'Einnahme' },
  { diceValueRange: [4, 5], alchemicResult: 'Kontakt' },
  { diceValueRange: [6, 6], alchemicResult: 'Einatmen' },
];

export const ELIXIR_EFFECT: AlchemyDiceResult[] = [
  { diceValueRange: [1, 2], alchemicResult: 'Stärkungselixier' },
  { diceValueRange: [3, 4], alchemicResult: 'Heilmittel' },
  { diceValueRange: [5, 5], alchemicResult: 'Fertigkeitselixier' },
  { diceValueRange: [6, 6], alchemicResult: 'Elementarelixier' },
];

export const STRENGTHENING_ELIXIR = new Map<string, AlchemyDiceResult[]>([
  [
    'Feuer',
    [
      { diceValueRange: [1, 6], alchemicResult: 'MU-Elixier', category: 'E' },
      { diceValueRange: [7, 12], alchemicResult: 'AT-Elixier', category: 'K' },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'Waffenschärfe',
        category: 'T',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Wasser',
    [
      { diceValueRange: [1, 6], alchemicResult: 'IN-Elixier', category: 'E' },
      { diceValueRange: [7, 12], alchemicResult: 'FF-Elixier', category: 'E' },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'Verwandlungs-Elixier',
        category: 'V',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Humus',
    [
      { diceValueRange: [1, 6], alchemicResult: 'KO-Elixier', category: 'E' },
      { diceValueRange: [7, 12], alchemicResult: 'GE-Elixier', category: 'E' },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'INI-Elixier',
        category: 'K',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Eis',
    [
      { diceValueRange: [1, 6], alchemicResult: 'KL-Elixier', category: 'E' },
      { diceValueRange: [7, 12], alchemicResult: 'FK-Elixier', category: 'K' },
      { diceValueRange: [13, 18], alchemicResult: 'AW-Elixier', category: 'K' },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Luft',
    [
      { diceValueRange: [1, 6], alchemicResult: 'CH-Elixier', category: 'E' },
      { diceValueRange: [7, 12], alchemicResult: 'GS-Elixier', category: 'E' },
      { diceValueRange: [13, 18], alchemicResult: 'BE-Elixier', category: 'B' },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Erz',
    [
      { diceValueRange: [1, 6], alchemicResult: 'KK-Elixier', category: 'E' },
      { diceValueRange: [7, 12], alchemicResult: 'RS-Elixier', category: 'K' },
      { diceValueRange: [13, 18], alchemicResult: 'PA-Elixier', category: 'K' },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Magisch',
    [
      { diceValueRange: [1, 6], alchemicResult: 'SK-Elixier', category: 'E' },
      { diceValueRange: [7, 12], alchemicResult: 'Magie-Paste', category: 'M' },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'Unsichtbarkeit-Elixier',
        category: 'U',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Göttlich',
    [
      { diceValueRange: [1, 6], alchemicResult: 'SK-Elixier', category: 'E' },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'Göttliche Paste',
        category: 'M',
      },
      { diceValueRange: [13, 18], alchemicResult: 'ZK-Elixier', category: 'E' },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
]);

export const HEALING_ELIXIR_EFFECTS = new Map<string, AlchemyDiceResult[]>([
  [
    'Feuer',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot (A)',
        category: 'A',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Wasser',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot (A)',
        category: 'A',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Humus',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot (A)',
        category: 'A',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Eis',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot (A)',
        category: 'A',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Luft',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot (A)',
        category: 'A',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Erz',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot (A)',
        category: 'A',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Magisch',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'AsP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'AsP-Heilung (H)',
        category: 'H',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Göttlich',
    [
      { diceValueRange: [1, 1], alchemicResult: '+1 SchiP' },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'KaP-Heilung (H)',
        category: 'H',
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'KaP-Heilung (H)',
        category: 'H',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
]);

export const TALENT_ELIXIR_EFFECTS = new Map<string, AlchemyDiceResult[]>([
  [
    'Feuer',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Kampftechniken',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Wasser',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Körperliche Talente',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Humus',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Naturtalente',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Eis',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Wissentalente',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Luft',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Gesellschaftstalente',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Erz',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Handwerkstalente',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Magisch',
    [
      { diceValueRange: [1, 18], alchemicResult: 'Zauber', category: 'E' },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Göttlich',
    [
      { diceValueRange: [1, 18], alchemicResult: 'Liturgien', category: 'E' },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
]);

export const ELEMENTAR_ELIXIR_EFFECTS = new Map<string, AlchemyDiceResult[]>([
  [
    'Feuer',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Feuerimmunität',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Wasser',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Unterwasseratmung',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'immun bis Giftstufe 4' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Humus',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'immun bis Giftstufe 4',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Eis',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Kälteimmunität',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Luft',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'lässt Fliegen, FW Fliegen + QS',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Erz',
    [
      { diceValueRange: [1, 18], alchemicResult: 'Dunkelsicht', category: 'E' },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Magisch',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Magiesicht (Magische Analyse mit QS)',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
  [
    'Göttlich',
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Missions-Elixier + QS',
        category: 'E',
      },
      { diceValueRange: [19, 19], alchemicResult: 'wirkungslos' },
      { diceValueRange: [20, 20], alchemicResult: 'chaotische Wirkung' },
    ],
  ],
]);

export const EFFECT_DURATIONS = new Map<string, AlchemyDiceResult[]>([
  [
    'A',
    [
      { diceValueRange: [0, 0], alchemicResult: 'in 1 Stunde' },
      { diceValueRange: [1, 1], alchemicResult: 'in 5 Min.' },
      { diceValueRange: [2, 2], alchemicResult: 'in 1 Min.' },
      { diceValueRange: [3, 3], alchemicResult: 'in 1 Min.' },
      { diceValueRange: [4, 4], alchemicResult: 'in 30 KR' },
      { diceValueRange: [5, 5], alchemicResult: 'in 30 KR' },
      { diceValueRange: [6, 6], alchemicResult: 'in 15 KR' },
      { diceValueRange: [7, 7], alchemicResult: 'in 15 KR' },
      { diceValueRange: [8, 8], alchemicResult: 'in 5 KR' },
      { diceValueRange: [9, 9], alchemicResult: 'in 5 KR' },
      { diceValueRange: [10, 10], alchemicResult: 'sofort' },
      { diceValueRange: [11, 11], alchemicResult: 'sofort' },
      { diceValueRange: [12, 12], alchemicResult: 'sofort' },
      { diceValueRange: [13, 13], alchemicResult: 'sofort' },
      { diceValueRange: [14, 14], alchemicResult: 'sofort' },
      { diceValueRange: [15, 15], alchemicResult: 'sofort' },
    ],
  ],
  [
    'B',
    [
      { diceValueRange: [0, 0], alchemicResult: '5 KR' },
      { diceValueRange: [1, 1], alchemicResult: '5 KR' },
      { diceValueRange: [2, 2], alchemicResult: '10 KR' },
      { diceValueRange: [3, 3], alchemicResult: '10 KR' },
      { diceValueRange: [4, 4], alchemicResult: '30 KR' },
      { diceValueRange: [5, 5], alchemicResult: '30 KR' },
      { diceValueRange: [6, 6], alchemicResult: '1 Min.' },
      { diceValueRange: [7, 7], alchemicResult: '1 Min.' },
      { diceValueRange: [8, 8], alchemicResult: '5 Min.' },
      { diceValueRange: [9, 9], alchemicResult: '5 Min.' },
      { diceValueRange: [10, 10], alchemicResult: '10 Min.' },
      { diceValueRange: [11, 11], alchemicResult: '10 Min.' },
      { diceValueRange: [12, 12], alchemicResult: 'QS Stunden' },
      { diceValueRange: [13, 13], alchemicResult: 'QS Stunden' },
      { diceValueRange: [14, 14], alchemicResult: '1 Tag' },
      { diceValueRange: [15, 15], alchemicResult: '1 Tag' },
    ],
  ],
  [
    'E',
    [
      { diceValueRange: [0, 0], alchemicResult: '5 KR' },
      { diceValueRange: [1, 1], alchemicResult: '5 KR' },
      { diceValueRange: [2, 2], alchemicResult: '10 KR' },
      { diceValueRange: [3, 3], alchemicResult: '10 KR' },
      { diceValueRange: [4, 4], alchemicResult: '30 KR' },
      { diceValueRange: [5, 5], alchemicResult: '30 KR' },
      { diceValueRange: [6, 6], alchemicResult: '1 Min.' },
      { diceValueRange: [7, 7], alchemicResult: '1 Min.' },
      { diceValueRange: [8, 8], alchemicResult: '5 Min.' },
      { diceValueRange: [9, 9], alchemicResult: '5 Min.' },
      { diceValueRange: [10, 10], alchemicResult: '10 Min.' },
      { diceValueRange: [11, 11], alchemicResult: '10 Min.' },
      { diceValueRange: [12, 12], alchemicResult: 'QS Stunden' },
      { diceValueRange: [13, 13], alchemicResult: 'QS Stunden' },
      { diceValueRange: [14, 14], alchemicResult: '1 Tag' },
      { diceValueRange: [15, 15], alchemicResult: '1 Tag' },
    ],
  ],
  [
    'U',
    [
      { diceValueRange: [0, 0], alchemicResult: '5 KR' },
      { diceValueRange: [1, 1], alchemicResult: '5 KR' },
      { diceValueRange: [2, 2], alchemicResult: '10 KR' },
      { diceValueRange: [3, 3], alchemicResult: '10 KR' },
      { diceValueRange: [4, 4], alchemicResult: '30 KR' },
      { diceValueRange: [5, 5], alchemicResult: '30 KR' },
      { diceValueRange: [6, 6], alchemicResult: '1 Min.' },
      { diceValueRange: [7, 7], alchemicResult: '1 Min.' },
      { diceValueRange: [8, 8], alchemicResult: '5 Min.' },
      { diceValueRange: [9, 9], alchemicResult: '5 Min.' },
      { diceValueRange: [10, 10], alchemicResult: '10 Min.' },
      { diceValueRange: [11, 11], alchemicResult: '10 Min.' },
      { diceValueRange: [12, 12], alchemicResult: 'QS Stunden' },
      { diceValueRange: [13, 13], alchemicResult: 'QS Stunden' },
      { diceValueRange: [14, 14], alchemicResult: '1 Tag' },
      { diceValueRange: [15, 15], alchemicResult: '1 Tag' },
    ],
  ],
  [
    'H',
    [
      { diceValueRange: [0, 0], alchemicResult: 'nächste Regeneration' },
      { diceValueRange: [1, 1], alchemicResult: 'nächste Regeneration' },
      { diceValueRange: [2, 2], alchemicResult: 'nächste Regeneration' },
      { diceValueRange: [3, 3], alchemicResult: 'nächste Regeneration' },
      { diceValueRange: [4, 4], alchemicResult: 'in 1W6 Stunden' },
      { diceValueRange: [5, 5], alchemicResult: 'in 1W6 Stunden' },
      { diceValueRange: [6, 6], alchemicResult: 'in 1 Stunde' },
      { diceValueRange: [7, 7], alchemicResult: 'in 1 Stunde' },
      { diceValueRange: [8, 8], alchemicResult: 'in 1 Min.' },
      { diceValueRange: [9, 9], alchemicResult: 'in 1 Min.' },
      { diceValueRange: [10, 10], alchemicResult: 'in 30 KR' },
      { diceValueRange: [11, 11], alchemicResult: 'in 10 KR' },
      { diceValueRange: [12, 12], alchemicResult: 'in 10 KR' },
      { diceValueRange: [13, 13], alchemicResult: 'sofort' },
      { diceValueRange: [14, 14], alchemicResult: 'sofort' },
      { diceValueRange: [15, 15], alchemicResult: 'sofort' },
    ],
  ],
  [
    'K',
    [
      { diceValueRange: [0, 0], alchemicResult: '1 KR' },
      { diceValueRange: [1, 1], alchemicResult: '1 KR' },
      { diceValueRange: [2, 2], alchemicResult: '1 KR' },
      { diceValueRange: [3, 3], alchemicResult: '5 KR' },
      { diceValueRange: [4, 4], alchemicResult: '5 KR' },
      { diceValueRange: [5, 5], alchemicResult: '5 KR' },
      { diceValueRange: [6, 6], alchemicResult: '10 KR' },
      { diceValueRange: [7, 7], alchemicResult: '10 KR' },
      { diceValueRange: [8, 8], alchemicResult: '10 KR' },
      { diceValueRange: [9, 9], alchemicResult: '20 KR' },
      { diceValueRange: [10, 10], alchemicResult: '20 KR' },
      { diceValueRange: [11, 11], alchemicResult: '30 KR' },
      { diceValueRange: [12, 12], alchemicResult: '30 KR' },
      { diceValueRange: [13, 13], alchemicResult: '40 KR' },
      { diceValueRange: [14, 14], alchemicResult: '40 KR' },
      { diceValueRange: [15, 15], alchemicResult: '1 Min.' },
    ],
  ],
  [
    'M',
    [
      { diceValueRange: [0, 0], alchemicResult: '1 KR' },
      { diceValueRange: [1, 1], alchemicResult: '1 KR' },
      { diceValueRange: [2, 2], alchemicResult: '1 KR' },
      { diceValueRange: [3, 3], alchemicResult: '5 KR' },
      { diceValueRange: [4, 4], alchemicResult: '5 KR' },
      { diceValueRange: [5, 5], alchemicResult: '5 KR' },
      { diceValueRange: [6, 6], alchemicResult: '10 KR' },
      { diceValueRange: [7, 7], alchemicResult: '10 KR' },
      { diceValueRange: [8, 8], alchemicResult: '10 KR' },
      { diceValueRange: [9, 9], alchemicResult: '20 KR' },
      { diceValueRange: [10, 10], alchemicResult: '20 KR' },
      { diceValueRange: [11, 11], alchemicResult: '30 KR' },
      { diceValueRange: [12, 12], alchemicResult: '30 KR' },
      { diceValueRange: [13, 13], alchemicResult: '40 KR' },
      { diceValueRange: [14, 14], alchemicResult: '40 KR' },
      { diceValueRange: [15, 15], alchemicResult: '1 Min.' },
    ],
  ],
  [
    'T',
    [
      { diceValueRange: [0, 0], alchemicResult: '1 KR' },
      { diceValueRange: [1, 1], alchemicResult: '1 KR' },
      { diceValueRange: [2, 2], alchemicResult: '1 KR' },
      { diceValueRange: [3, 3], alchemicResult: '5 KR' },
      { diceValueRange: [4, 4], alchemicResult: '5 KR' },
      { diceValueRange: [5, 5], alchemicResult: '5 KR' },
      { diceValueRange: [6, 6], alchemicResult: '10 KR' },
      { diceValueRange: [7, 7], alchemicResult: '10 KR' },
      { diceValueRange: [8, 8], alchemicResult: '10 KR' },
      { diceValueRange: [9, 9], alchemicResult: '20 KR' },
      { diceValueRange: [10, 10], alchemicResult: '20 KR' },
      { diceValueRange: [11, 11], alchemicResult: '30 KR' },
      { diceValueRange: [12, 12], alchemicResult: '30 KR' },
      { diceValueRange: [13, 13], alchemicResult: '40 KR' },
      { diceValueRange: [14, 14], alchemicResult: '40 KR' },
      { diceValueRange: [15, 15], alchemicResult: '1 Min.' },
    ],
  ],
  [
    'V',
    [
      { diceValueRange: [0, 0], alchemicResult: '30 KR' },
      { diceValueRange: [1, 1], alchemicResult: '30 KR' },
      { diceValueRange: [2, 2], alchemicResult: '1 Min.' },
      { diceValueRange: [3, 3], alchemicResult: '1 Min.' },
      { diceValueRange: [4, 4], alchemicResult: '5 Min.' },
      { diceValueRange: [5, 5], alchemicResult: '5 Min.' },
      { diceValueRange: [6, 6], alchemicResult: '10 Min.' },
      { diceValueRange: [7, 7], alchemicResult: '10 Min.' },
      { diceValueRange: [8, 8], alchemicResult: 'QS Stunden' },
      { diceValueRange: [9, 9], alchemicResult: 'QS Stunden' },
      { diceValueRange: [10, 10], alchemicResult: '1 Tag' },
      { diceValueRange: [11, 11], alchemicResult: '1 Woche' },
      { diceValueRange: [12, 12], alchemicResult: '1 Woche' },
      { diceValueRange: [13, 13], alchemicResult: '1 Jahr' },
      { diceValueRange: [14, 14], alchemicResult: '10 Jahre' },
      { diceValueRange: [15, 15], alchemicResult: 'permanent' },
    ],
  ],
]);

//--------poision------------//
export const POISON_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 8], alchemicResult: 'Einnahme' },
  { diceValueRange: [9, 10], alchemicResult: 'Kontakt' },
  { diceValueRange: [11, 16], alchemicResult: 'Waffengift' },
  { diceValueRange: [17, 18], alchemicResult: 'Einatmen' },
  {
    diceValueRange: [19, 19],
    alchemicResult: 'Wähle 2 von: Einnahme, Kontakt, Waffengift, Einatmen',
  },
  { diceValueRange: [20, 20], alchemicResult: 'wirkungslos' },
];

export const POISON_RESISTANCE: AlchemyDiceResult[] = [
  { diceValueRange: [2, 2], alchemicResult: 'Doppelte Seelenkraft (SK x 2)' },
  { diceValueRange: [3, 6], alchemicResult: 'Seelenkraft (SK)' },
  { diceValueRange: [7, 10], alchemicResult: 'Zähigkeit (ZK)' },
  { diceValueRange: [11, 11], alchemicResult: 'Kein Widerstand' },
  {
    diceValueRange: [12, 12],
    alchemicResult: 'Doppelte Zähigkeit (ZK x 2)',
  },
];

export const POISON_EFFECT: AlchemyDiceResult[] = [
  {
    diceValueRange: [-10, 0],
    alchemicResult: '1W3 SP / 1 SP, Beginn: 7 - QS Min., Dauer: einmalig',
  },
  {
    diceValueRange: [1, 1],
    alchemicResult: '1W6 SP / 1W3 SP, Beginn: 7 - QS Min., Dauer: einmalig',
  },
  {
    diceValueRange: [2, 2],
    alchemicResult: '1W6 SP / 1W3 SP, Beginn: 7 - QS Min., Dauer: einmalig',
  },
  {
    diceValueRange: [3, 3],
    alchemicResult: '1W6 SP / 1W3 SP, Beginn: sofort, Dauer: einmalig',
  },
  {
    diceValueRange: [4, 4],
    alchemicResult: '1W6 SP / Min., Beginn: 1 Min., Dauer: QS Min. / 2W3 Min.',
  },
  {
    diceValueRange: [5, 5],
    alchemicResult: '1W6 SP / Min., Beginn: 1 Min., Dauer: QS Min. / QS2 Min.',
  },
  {
    diceValueRange: [6, 6],
    alchemicResult: '1W3 SP / KR, Beginn: 5 KR, Dauer: QS x2 KR / QS KR',
  },
  {
    diceValueRange: [7, 7],
    alchemicResult: '1W3 SP / KR, Beginn: sofort, Dauer: QS x2 KR / QS KR',
  },
  {
    diceValueRange: [8, 8],
    alchemicResult: 'Effekt, Beginn: 1 KR, Dauer: 2W3 Min.',
    category: 'effect',
  },
  {
    diceValueRange: [9, 9],
    alchemicResult: 'Effekt, Beginn: 1 KR, Dauer: 2W3 Min.',
    category: 'effect',
  },
  {
    diceValueRange: [10, 10],
    alchemicResult:
      '1W6 SP / Min., Beginn: 5 Min., Dauer: QS x2 Min. / QS Min.',
  },
  {
    diceValueRange: [11, 11],
    alchemicResult:
      '1W3 SP / KR + Effekt / 1 SP / KR + Effekt, Beginn: 5 KR, Dauer: 2W3 KR',
    category: 'effect',
  },
  {
    diceValueRange: [12, 12],
    alchemicResult:
      '1W3 SP / KR + Effekt / 2 SP / KR + Effekt, Beginn: sofort, Dauer: 2W3 KR',
    category: 'effect',
  },
  {
    diceValueRange: [13, 13],
    alchemicResult:
      '1W6 SP / Min. + Effekt / 1W3 SP / Min. + Effekt, Beginn: 1 Min., Dauer: 2W3 Min.',
    category: 'effect',
  },
  {
    diceValueRange: [14, 14],
    alchemicResult:
      '1W6 SP / KR + Effekt / 1W3 SP / KR + Effekt, Beginn: 1 KR, Dauer: 2W3 KR',
    category: 'effect',
  },
  {
    diceValueRange: [15, 20],
    alchemicResult:
      '1W6 + QS SP / KR + Effekt / 1W3 + QS SP / KR + Effekt, Beginn: 1 KR, Dauer: 2W3 KR',
    category: 'effect',
  },
];

export const POISON_TRIGGER_EFFECT = new Map<string, AlchemyDiceResult[]>([
  [
    'Feuer',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Säure kl. Fläche' },
      { diceValueRange: [4, 5], alchemicResult: 'Brennend kl. Fläche' },
      { diceValueRange: [6, 6], alchemicResult: 'Brennend gr. Fläche' },
    ],
  ],
  [
    'Wasser',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Furcht' },
      { diceValueRange: [4, 5], alchemicResult: 'Blutrausch' },
      { diceValueRange: [6, 6], alchemicResult: 'Handlungsunfähig' },
    ],
  ],
  [
    'Humus',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Schmerz' },
      { diceValueRange: [4, 5], alchemicResult: 'Krank' },
      { diceValueRange: [6, 6], alchemicResult: 'Blind' },
    ],
  ],
  [
    'Eis',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Verwirrung' },
      { diceValueRange: [4, 5], alchemicResult: 'Taub' },
      { diceValueRange: [6, 6], alchemicResult: 'Fixiert' },
    ],
  ],
  [
    'Luft',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Betäubung' },
      { diceValueRange: [4, 5], alchemicResult: 'Stumm' },
      { diceValueRange: [6, 6], alchemicResult: 'Bewusstlos' },
    ],
  ],
  [
    'Erz',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Paralyse' },
      { diceValueRange: [4, 5], alchemicResult: 'Belastung' },
      { diceValueRange: [6, 6], alchemicResult: 'Bewegungsunfähig' },
    ],
  ],
  [
    'Magisch',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Pechmagnet' },
      { diceValueRange: [4, 5], alchemicResult: 'Lästige Mindergeister' },
      { diceValueRange: [6, 6], alchemicResult: 'Lästige Mindergeister' },
    ],
  ],
  [
    'Perviertiert',
    [
      { diceValueRange: [1, 3], alchemicResult: 'Lichtempfindlich' },
      { diceValueRange: [4, 5], alchemicResult: 'Hässlich I' },
      { diceValueRange: [6, 6], alchemicResult: 'Hässlich II' },
    ],
  ],
  [
    'Namenlos',
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'Entrückung (Namenloser) + Hörigkeit',
      },
    ],
  ],
]);

//--------stimulant------------//
export const STIMULANT_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 10], alchemicResult: 'Einnahme' },
  { diceValueRange: [11, 12], alchemicResult: 'Kontakt' },
  { diceValueRange: [13, 19], alchemicResult: 'Einatmen' },
  { diceValueRange: [20, 20], alchemicResult: 'wirkungslos' },
];

export const STIMULANT_RESISTANCE: AlchemyDiceResult[] = [
  { diceValueRange: [2, 2], alchemicResult: 'Doppelte Zähigkeit (SK x 2)' },
  { diceValueRange: [3, 6], alchemicResult: 'Zähigkeit (ZK)' },
  { diceValueRange: [7, 10], alchemicResult: 'Seelenkraft (SK)' },
  { diceValueRange: [11, 11], alchemicResult: 'Kein Widerstand' },
  {
    diceValueRange: [12, 12],
    alchemicResult: 'Doppelte Seelenkraft (ZK x 2)',
  },
];

export const STIMULANT_ADDICTION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 3], alchemicResult: 'keine' },
  { diceValueRange: [4, 7], alchemicResult: 'nach 1W20 Anwendungen' },
  { diceValueRange: [8, 11], alchemicResult: 'nach 1W6 Anwendungen' },
  { diceValueRange: [12, 14], alchemicResult: 'nach 1. Anwendungen' },
];

export interface StimulantEffect {
  effect: string;
  sideEffect: string;
  overdose: string;
}

export const STIMULANT_EFFECT = new Map<string, StimulantEffect>([
  [
    'Feuer',
    {
      effect:
        'Aufputschmittel: ignoriert bis zu 3 Stufen Furcht für die Wirkungsdauer',
      sideEffect: '2/1 Stufen Furcht',
      overdose: '3 Stufen Überhitzung',
    },
  ],
  [
    'Wasser',
    {
      effect: '+2/+1 auf Körpertalente',
      sideEffect: '2/1 Stufen Berauscht',
      overdose: '2W6 SP (Ersticken)',
    },
  ],
  [
    'Humus',
    {
      effect: '+2/+1 auf Naturtalente',
      sideEffect: '2/1 Stufe Betäubung',
      overdose: '2W6 SP (Gift)',
    },
  ],
  [
    'Eis',
    {
      effect: 'Geisterweiterung: +2/+1 auf Wissenstalente',
      sideEffect: '2/1 Stufen Schmerz',
      overdose: '3 Stufen Unterkühlung',
    },
  ],
  [
    'Luft',
    {
      effect: 'Subtiles Schimmern: +2/+1 auf Gesellschaftstalente',
      sideEffect: 'Stumm / 1 Stufe Paralyse',
      overdose: 'Halluzinationen, Handlungsunfähig',
    },
  ],
  [
    'Erz',
    {
      effect: 'Für ruhige Hände: +2/+1 auf Handwerkstalente',
      sideEffect: '2/1 Stufen Paralyse',
      overdose: 'Lähmung, Bewegungsunfähig',
    },
  ],
  [
    'Magisch',
    {
      effect: 'Affinität zu Elementaren',
      sideEffect: '2/1 Stufen Verwirrung',
      overdose: 'verliert 2W6 AsP (oder LeP falls nicht genug)',
    },
  ],
  [
    'Perviertiert',
    {
      effect: 'Affinität zu Dämonen',
      sideEffect: 'Lichtempfindlich',
      overdose: '2W6+3 SP (Gift)',
    },
  ],
  [
    'Göttlich',
    {
      effect: 'Höhere Prophezeihung / Prophezeiung',
      sideEffect: '3/2 Stufen Entrückung durch Visionen',
      overdose: 'Verliert 2W6 KaP (oder LeP falls nicht genug)',
    },
  ],
]);
