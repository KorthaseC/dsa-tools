import { AlchemyDiceResult, AlchemyQSResult, PurityOption } from './alchemy.models';

/********************** Alchemy Constants **********************/
export enum ElementsAlchemy {
  Fire = 'fire',
  Water = 'water',
  Humus = 'humus',
  Ice = 'ice',
  Air = 'air',
  Ore = 'ore',
  Magic = 'magic',
  Divine = 'divine',
  Perverted = 'perverted',
  Nameless = 'nameless',
}

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

export enum AlchemicCategory {
  E = 'E', // Example: Elixier
  K = 'K', // Example: Kampf
  T = 'T', // Example: Taktik
  V = 'V', // Example: Verwandlung
  B = 'B', // Example: Buffs
  M = 'M', // Example: Magie
  U = 'U', // Example: Unsichtbarkeit
  H = 'H', // Example: Heilung
  A = 'A', // Example: Antidot
}

export enum EffectCategory {
  Effect = 'effect',
  Ineffectiv = 'ineffectiv',
}

export const STRENGTHENING_ELIXIR = new Map<string, AlchemyDiceResult[]>([
  [
    ElementsAlchemy.Fire,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'MU-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'AT-Elixier',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'Waffenschärfe',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'IN-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'FF-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'Verwandlungs-Elixier',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'KO-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'GE-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'INI-Elixier',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'KL-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'FK-Elixier',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'AW-Elixier',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'CH-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'GS-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'BE-Elixier',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'KK-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'RS-Elixier',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'PA-Elixier',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'SK-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'Magie-Paste',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'Unsichtbarkeit-Elixier',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'SK-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'Göttliche Paste',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'ZK-Elixier',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
]);

export const HEALING_ELIXIR_EFFECTS = new Map<string, AlchemyDiceResult[]>([
  [
    ElementsAlchemy.Fire,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'LeP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'Antidot',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'AsP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'AsP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: '+1 SchiP',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'KaP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'KaP-Heilung',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
]);

export const TALENT_ELIXIR_EFFECTS = new Map<string, AlchemyDiceResult[]>([
  [
    ElementsAlchemy.Fire,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Kampftechniken',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Körperliche Talente',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Naturtalente',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Wissentalente',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Gesellschaftstalente',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Handwerkstalente',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Zauber',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Liturgien',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
]);

export const ELEMENTAR_ELIXIR_EFFECTS = new Map<string, AlchemyDiceResult[]>([
  [
    ElementsAlchemy.Fire,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Feuerimmunität',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Unterwasseratmung',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'immun bis Giftstufe 4',
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'immun bis Giftstufe 4',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Kälteimmunität',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'lässt Fliegen, FW Fliegen + QS',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Dunkelsicht',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Magiesicht (Magische Analyse mit QS)',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'Missions-Elixier + QS',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'wirkungslos',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'chaotische Wirkung',
      },
    ],
  ],
]);

export const EFFECT_DURATIONS = new Map<string, AlchemyDiceResult[]>([
  [
    AlchemicCategory.A,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'in 1 Stunde',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'in 5 Min.',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'in 1 Min.',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'in 1 Min.',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'in 30 KR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'in 30 KR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'in 15 KR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'in 15 KR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'in 5 KR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'in 5 KR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'sofort',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'sofort',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'sofort',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'sofort',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'sofort',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'sofort',
        category: AlchemicCategory.A,
      },
    ],
  ],
  [
    AlchemicCategory.B,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: '5 KR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: '5 KR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: '10 KR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: '10 KR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: '30 KR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: '30 KR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: '1 Tag',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: '1 Tag',
        category: AlchemicCategory.B,
      },
    ],
  ],
  [
    AlchemicCategory.E,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: '5 KR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: '5 KR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: '10 KR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: '10 KR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: '30 KR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: '30 KR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: '1 Tag',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: '1 Tag',
        category: AlchemicCategory.E,
      },
    ],
  ],
  [
    AlchemicCategory.U,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: '5 KR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: '5 KR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: '10 KR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: '10 KR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: '30 KR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: '30 KR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: '1 Tag',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: '1 Tag',
        category: AlchemicCategory.U,
      },
    ],
  ],
  [
    AlchemicCategory.H,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'nächste Regeneration',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'nächste Regeneration',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'nächste Regeneration',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'nächste Regeneration',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'in 1W6 Stunden',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'in 1W6 Stunden',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'in 1 Stunde',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'in 1 Stunde',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'in 1 Min.',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'in 1 Min.',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'in 30 KR',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'in 10 KR',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'in 10 KR',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'sofort',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'sofort',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'sofort',
        category: AlchemicCategory.H,
      },
    ],
  ],
  [
    AlchemicCategory.K,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: '1 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: '1 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: '1 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: '5 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: '5 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: '5 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: '10 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: '10 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: '10 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: '20 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: '20 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: '30 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: '30 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: '40 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: '40 KR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.K,
      },
    ],
  ],
  [
    AlchemicCategory.M,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: '1 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: '1 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: '1 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: '5 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: '5 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: '5 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: '10 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: '10 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: '10 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: '20 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: '20 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: '30 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: '30 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: '40 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: '40 KR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.M,
      },
    ],
  ],
  [
    AlchemicCategory.T,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: '1 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: '1 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: '1 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: '5 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: '5 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: '5 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: '10 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: '10 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: '10 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: '20 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: '20 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: '30 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: '30 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: '40 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: '40 KR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.T,
      },
    ],
  ],
  [
    AlchemicCategory.V,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: '30 KR',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: '30 KR',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: '1 Min.',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: '5 Min.',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: '10 Min.',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'QS Stunden',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: '1 Tag',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: '1 Woche',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: '1 Woche',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: '1 Jahr',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: '10 Jahre',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'permanent',
        category: AlchemicCategory.V,
      },
    ],
  ],
]);

export const ELIXIR_EFFECTS_QS_GROUPS = new Map<string, AlchemyQSResult[]>([
  [
    AlchemicCategory.A,
    [
      {
        qs: 1,
        alchemicResult: 'Neutralisierte Gifte bis Stufe 1',
      },
      {
        qs: 2,
        alchemicResult: 'Neutralisierte Gifte bis Stufe 2',
      },
      {
        qs: 3,
        alchemicResult: 'Neutralisierte Gifte bis Stufe 3',
      },
      {
        qs: 4,
        alchemicResult: 'Neutralisierte Gifte bis Stufe 4',
      },
      {
        qs: 5,
        alchemicResult: 'Neutralisierte Gifte bis Stufe 5',
      },
      {
        qs: 6,
        alchemicResult: 'Neutralisierte Gifte bis Stufe 6',
      },
      {
        qs: 7,
        alchemicResult: 'Neutralisierte Gifte bis Stufe 7',
      },
    ],
  ],
  [
    AlchemicCategory.B,
    [
      {
        qs: 1,
        alchemicResult: 'Belastung -1',
      },
      {
        qs: 2,
        alchemicResult: 'Belastung -1, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 3,
        alchemicResult: 'Belastung -2',
      },
      {
        qs: 4,
        alchemicResult: 'Belastung -2, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 5,
        alchemicResult: 'Belastung -3',
      },
      {
        qs: 6,
        alchemicResult: 'Belastung -3, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 7,
        alchemicResult: 'Belastung -4',
      },
    ],
  ],
  [
    AlchemicCategory.E,
    [
      {
        qs: 1,
        alchemicResult: '+1',
      },
      {
        qs: 2,
        alchemicResult: '+1, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 3,
        alchemicResult: '+2',
      },
      {
        qs: 4,
        alchemicResult: '+2, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 5,
        alchemicResult: '+3',
      },
      {
        qs: 6,
        alchemicResult: '+3, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 7,
        alchemicResult: '+4',
      },
    ],
  ],
  [
    AlchemicCategory.K,
    [
      {
        qs: 1,
        alchemicResult: '+1',
      },
      {
        qs: 2,
        alchemicResult: '+1, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 3,
        alchemicResult: '+2',
      },
      {
        qs: 4,
        alchemicResult: '+2, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 5,
        alchemicResult: '+3',
      },
      {
        qs: 6,
        alchemicResult: '+3, Dauer verlängert sich um 1 Zeiteinheit der Wirkungsdauer',
      },
      {
        qs: 7,
        alchemicResult: '+4',
      },
    ],
  ],
  [
    AlchemicCategory.H,
    [
      {
        qs: 1,
        alchemicResult: '+1W3',
      },
      {
        qs: 2,
        alchemicResult: '+1W6',
      },
      {
        qs: 3,
        alchemicResult: '+1W6+4',
      },
      {
        qs: 4,
        alchemicResult: '+1W6+8',
      },
      {
        qs: 5,
        alchemicResult: '+2W6+4',
      },
      {
        qs: 6,
        alchemicResult: '+2W6+8',
      },
      {
        qs: 7,
        alchemicResult: '+3W6+8',
      },
    ],
  ],
  [
    AlchemicCategory.M,
    [
      {
        qs: 1,
        alchemicResult: 'gegen niedere Dämonen und mag. Wesen',
      },
      {
        qs: 2,
        alchemicResult: 'gegen niedere Dämonen und mag. Wesen',
      },
      {
        qs: 3,
        alchemicResult: 'gegen bis 5-gehörnte Dämonen und mag. Wesen',
      },
      {
        qs: 4,
        alchemicResult: 'gegen bis 5-gehörnte Dämonen und mag. Wesen',
      },
      {
        qs: 5,
        alchemicResult: 'gegen alle Dämonen und mag. Wesen',
      },
      {
        qs: 6,
        alchemicResult: 'gegen alle Dämonen und mag. Wesen',
      },
      {
        qs: 7,
        alchemicResult: 'verletzend gegen Dämonen und mag. Wesen',
      },
    ],
  ],
  [
    AlchemicCategory.T,
    [
      {
        qs: 1,
        alchemicResult: '+1',
      },
      {
        qs: 2,
        alchemicResult: '+2',
      },
      {
        qs: 3,
        alchemicResult: '+3',
      },
      {
        qs: 4,
        alchemicResult: '+1W6',
      },
      {
        qs: 5,
        alchemicResult: '+1W6+3',
      },
      {
        qs: 6,
        alchemicResult: '+1W6+5',
      },
      {
        qs: 7,
        alchemicResult: '+1W6+8',
      },
    ],
  ],
  [
    AlchemicCategory.U,
    [
      {
        qs: 1,
        alchemicResult: 'Körper durchsichtig',
      },
      {
        qs: 2,
        alchemicResult: 'Körper unsichtbar',
      },
      {
        qs: 3,
        alchemicResult: 'Körper unsichtbar',
      },
      {
        qs: 4,
        alchemicResult: 'Körper unsichtbar + Trad.artefakte unsichtbar',
      },
      {
        qs: 5,
        alchemicResult: 'Körper unsichtbar + Trad.artefakte unsichtbar',
      },
      {
        qs: 6,
        alchemicResult: 'Körper unsichtbar + Trad.artefakte unsichtbar + Kleidung unsichtbar',
      },
      {
        qs: 7,
        alchemicResult: 'Körper unsichtbar + Trad.artefakte unsichtbar + Kleidung unsichtbar',
      },
    ],
  ],
  [
    AlchemicCategory.V,
    [
      {
        qs: 1,
        alchemicResult: 'Gleiche Größe',
      },
      {
        qs: 2,
        alchemicResult: 'Gleiche Größe',
      },
      {
        qs: 3,
        alchemicResult: 'max. 1 Kat. kleiner',
      },
      {
        qs: 4,
        alchemicResult: 'max. 1 Kat. größer oder kleiner',
      },
      {
        qs: 5,
        alchemicResult: 'max. 1 Kat. größer oder 2 Kat. kleiner',
      },
      {
        qs: 6,
        alchemicResult: 'max. 1 Kat. größer oder 3 Kat. kleiner',
      },
      {
        qs: 7,
        alchemicResult: 'max. 2 Kat. größer oder 3 Kat. kleiner',
      },
    ],
  ],
]);

//--------poision------------//
export const POISON_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 8], alchemicResult: 'Einnahme' },
  { diceValueRange: [9, 10], alchemicResult: 'Kontakt' },
  {
    diceValueRange: [11, 16],
    alchemicResult: 'Waffengift',
  },
  {
    diceValueRange: [17, 18],
    alchemicResult: 'Einatmen',
  },
  {
    diceValueRange: [19, 19],
    alchemicResult: 'Wähle 2 von: Einnahme, Kontakt, Waffengift, Einatmen',
  },
  {
    diceValueRange: [20, 20],
    alchemicResult: 'wirkungslos',
    category: EffectCategory.Ineffectiv,
  },
];

export const POISON_RESISTANCE: AlchemyDiceResult[] = [
  { diceValueRange: [2, 2], alchemicResult: 'Doppelte Seelenkraft (SK x 2)' },
  { diceValueRange: [3, 6], alchemicResult: 'Seelenkraft (SK)' },
  { diceValueRange: [7, 10], alchemicResult: 'Zähigkeit (ZK)' },
  { diceValueRange: [11, 11], alchemicResult: 'Kein Widerstand' },
  { diceValueRange: [12, 12], alchemicResult: 'Doppelte Zähigkeit (ZK x 2)' },
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
    alchemicResult: '1W6 SP/Min., Beginn: 1 Min., Dauer: QS Min. / 2W3 Min.',
  },
  {
    diceValueRange: [5, 5],
    alchemicResult: '1W6 SP/Min., Beginn: 1 Min., Dauer: QS Min. / QS2 Min.',
  },
  {
    diceValueRange: [6, 6],
    alchemicResult: '1W3 SP/KR, Beginn: 5 KR, Dauer: QS x2 KR / QS KR',
  },
  {
    diceValueRange: [7, 7],
    alchemicResult: '1W3 SP/KR, Beginn: sofort, Dauer: QS x2 KR / QS KR',
  },
  {
    diceValueRange: [8, 8],
    alchemicResult: '{{effect}}, Beginn: 1 KR, Dauer: 2W3 Min.',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [9, 9],
    alchemicResult: '{{effect}}, Beginn: 1 KR, Dauer: 2W3 Min.',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [10, 10],
    alchemicResult: '1W6 SP/Min., Beginn: 5 Min., Dauer: QS x2 Min. / QS Min.',
  },
  {
    diceValueRange: [11, 11],
    alchemicResult: '1W3 SP/KR + {{effect}} / 1 SP/KR + {{effect}}, Beginn: 5 KR, Dauer: 2W3 KR',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [12, 12],
    alchemicResult: '1W3 SP/KR + {{effect}} / 2 SP/KR + {{effect}}, Beginn: sofort, Dauer: 2W3 KR',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [13, 13],
    alchemicResult: '1W6 SP/Min. + {{effect}} / 1W3 SP/Min. + {{effect}}, Beginn: 1 Min., Dauer: 2W3 Min.',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [14, 14],
    alchemicResult: '1W6 SP/KR + {{effect}} / 1W3 SP/KR + {{effect}}, Beginn: 1 KR, Dauer: 2W3 KR',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [15, 20],
    alchemicResult: '1W6 + QS SP/KR + {{effect}} / 1W3 + QS SP/KR + {{effect}}, Beginn: 1 KR, Dauer: 2W3 KR',
    category: EffectCategory.Effect,
  },
];

export const POISON_TRIGGER_EFFECT = new Map<ElementsAlchemy, AlchemyDiceResult[]>([
  [
    ElementsAlchemy.Fire,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Säure kl. Fläche',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Brennend kl. Fläche',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Brennend gr. Fläche',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Furcht',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Blutrausch',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Handlungsunfähig',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Schmerz',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Krank',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Blind',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Verwirrung',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Taub',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Fixiert',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Betäubung',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Stumm',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Bewusstlos',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Paralyse',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Belastung',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Bewegungsunfähig',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Pechmagnet',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Lästige Mindergeister',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Lästige Mindergeister',
      },
    ],
  ],
  [
    ElementsAlchemy.Perverted,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'Lichtempfindlich',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'Hässlich I',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'Hässlich II',
      },
    ],
  ],
  [
    ElementsAlchemy.Nameless,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'Entrückung (Namenloser) + Hörigkeit',
      },
    ],
  ],
]);

export const POISON_EFFECTS_QS_GROUPS: AlchemyQSResult[] = [
  {
    qs: 1,
    alchemicResult: 'Zustand: 1 Stufe / keiner, Status: keiner',
  },
  {
    qs: 2,
    alchemicResult: 'Zustand: 2 Stufen / 1 Stufe, Status: keiner',
  },
  {
    qs: 3,
    alchemicResult: 'Zustand: 3 Stufen / 1 Stufe, Status: ausgelöst / keiner',
  },
  {
    qs: 4,
    alchemicResult: 'Zustand: 4 Stufen / 2 Stufen, Status: ausgelöst / keiner',
  },
  {
    qs: 5,
    alchemicResult: 'Zustand: 4 Stufen / 3 Stufen, Status: ausgelöst / ausgelöst',
  },
  {
    qs: 6,
    alchemicResult: 'Zustand: 4 Stufen / 4 Stufen, Status: ausgelöst / ausgelöst',
  },
  {
    qs: 7,
    alchemicResult: 'Zustand: 4 Stufen / 4 Stufen, Status: ausgelöst / ausgelöst',
  },
];

//--------stimulant------------//
export const STIMULANT_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 10], alchemicResult: 'Einnahme' },
  { diceValueRange: [11, 12], alchemicResult: 'Kontakt' },
  {
    diceValueRange: [13, 19],
    alchemicResult: 'Einatmen',
  },
  {
    diceValueRange: [20, 20],
    alchemicResult: 'wirkungslos',
    category: EffectCategory.Ineffectiv,
  },
];

export const STIMULANT_RESISTANCE: AlchemyDiceResult[] = [
  { diceValueRange: [2, 2], alchemicResult: 'Doppelte Zähigkeit (ZK x 2)' },
  { diceValueRange: [3, 6], alchemicResult: 'Zähigkeit (ZK)' },
  { diceValueRange: [7, 10], alchemicResult: 'Seelenkraft (SK)' },
  { diceValueRange: [11, 11], alchemicResult: 'Kein Widerstand' },
  { diceValueRange: [12, 12], alchemicResult: 'Doppelte Seelenkraft (SK x 2)' },
];

export const STIMULANT_ADDICTION: AlchemyDiceResult[] = [
  {
    diceValueRange: [1, 3],
    alchemicResult: 'keine',
  },
  {
    diceValueRange: [4, 7],
    alchemicResult: 'nach 1W20 Anwendungen',
  },
  {
    diceValueRange: [8, 11],
    alchemicResult: 'nach 1W6 Anwendungen',
  },
  {
    diceValueRange: [12, 14],
    alchemicResult: 'nach 1 Anwendung',
  },
];

export interface StimulantEffect {
  effect: string;
  sideEffect: string;
  overdose: string;
}

export const STIMULANT_EFFECT = new Map<ElementsAlchemy, StimulantEffect>([
  [
    ElementsAlchemy.Fire,
    {
      effect: 'Aufputschmittel: ignoriert bis zu 3 Stufen Furcht für die Wirkungsdauer',
      sideEffect: '2/1 Stufen Furcht',
      overdose: '3 Stufen Überhitzung',
    },
  ],
  [
    ElementsAlchemy.Water,
    {
      effect: '+2/+1 auf Körpertalente',
      sideEffect: '2/1 Stufen Berauscht',
      overdose: '2W6 SP (Ersticken)',
    },
  ],
  [
    ElementsAlchemy.Humus,
    {
      effect: '+2/+1 auf Naturtalente',
      sideEffect: '2/1 Stufe Betäubung',
      overdose: '2W6 SP (Gift)',
    },
  ],
  [
    ElementsAlchemy.Ice,
    {
      effect: 'Geisterweiterung: +2/+1 auf Wissenstalente',
      sideEffect: '2/1 Stufen Schmerz',
      overdose: '3 Stufen Unterkühlung',
    },
  ],
  [
    ElementsAlchemy.Air,
    {
      effect: 'Subtiles Schimmern: +2/+1 auf Gesellschaftstalente',
      sideEffect: 'Stumm / 1 Stufe Paralyse',
      overdose: 'Halluzinationen, Handlungsunfähig',
    },
  ],
  [
    ElementsAlchemy.Ore,
    {
      effect: 'Für ruhige Hände: +2/+1 auf Handwerkstalente',
      sideEffect: '2/1 Stufen Paralyse',
      overdose: 'Lähmung, Bewegungsunfähig',
    },
  ],
  [
    ElementsAlchemy.Magic,
    {
      effect: 'Affinität zu Elementaren',
      sideEffect: '2/1 Stufen Verwirrung',
      overdose: 'verliert 2W6 AsP (oder LeP falls nicht genug)',
    },
  ],
  [
    ElementsAlchemy.Perverted,
    {
      effect: 'Affinität zu Dämonen',
      sideEffect: 'Lichtempfindlich',
      overdose: '2W6+3 SP (Gift)',
    },
  ],
  [
    ElementsAlchemy.Divine,
    {
      effect: 'Höhere Prophezeihung / Prophezeiung',
      sideEffect: '3/2 Stufen Entrückung durch Visionen',
      overdose: 'Verliert 2W6 KaP (oder LeP falls nicht genug)',
    },
  ],
]);

export const STIMULANT_EFFECTS_QS_GROUPS: AlchemyQSResult[] = [
  {
    qs: -1,
    alchemicResult: 'misslungenes Alchimikum',
  },
  {
    qs: 0,
    alchemicResult: 'misslungenes Alchimikum',
  },
  {
    qs: 1,
    alchemicResult: 'Dauer: 5 Minuten / Dauer Nebenwirkung (bei Überdosierung): 10 Minuten, Beginn: 6 SR',
  },
  {
    qs: 2,
    alchemicResult: 'Dauer: 10 Minuten / Dauer Nebenwirkung (bei Überdosierung): 10 Minuten, Beginn: 3 SR',
  },
  {
    qs: 3,
    alchemicResult: 'Dauer: 30 Minuten / Dauer Nebenwirkung (bei Überdosierung): 30 Minuten, Beginn: 1 SR',
  },
  {
    qs: 4,
    alchemicResult: 'Dauer: 1 Stunde / Dauer Nebenwirkung (bei Überdosierung): 30 Minuten, Beginn: 5 KR',
  },
  {
    qs: 5,
    alchemicResult: 'Dauer: 3 Stunden / Dauer Nebenwirkung (bei Überdosierung): 1 Stunden, Beginn: 1 KR',
  },
  {
    qs: 6,
    alchemicResult: 'Dauer: 6 Stunden / Dauer Nebenwirkung (bei Überdosierung): 1 Stunden, Beginn: sofort',
  },
  {
    qs: 7,
    alchemicResult: 'Dauer: 12 Stunden / Dauer Nebenwirkung (bei Überdosierung): 6 Stunden, Beginn: sofort',
  },
  {
    qs: 8,
    alchemicResult: 'Dauer: 12 Stunden / Dauer Nebenwirkung (bei Überdosierung): 6 Stunden, Beginn: sofort',
  },
  {
    qs: 9,
    alchemicResult: 'Dauer: 12 Stunden / Dauer Nebenwirkung (bei Überdosierung): 6 Stunden, Beginn: sofort',
  },
  {
    qs: 10,
    alchemicResult: 'Dauer: 12 Stunden / Dauer Nebenwirkung (bei Überdosierung): 6 Stunden, Beginn: sofort',
  },
];
