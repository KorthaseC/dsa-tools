/********************** Calendar Constants **********************/
export const MONTHS: string[] = [
  'Praios',
  'Rondra',
  'Efferd',
  'Travia',
  'Boron',
  'Hesinde',
  'Firun',
  'Tsa',
  'Phex',
  'Peraine',
  'Ingerimm',
  'Rahja',
  'Namenlose Tage',
];

export const WEEKDAYS: string[] = [
  'Windstag',
  'Erdtag',
  'Markttag',
  'Praiostag',
  'Rohalstag',
  'Feuertag',
  'Wassertag',
];

export enum MoonPhase {
  Increasing = 'zunehmend',
  Decreasing = 'abnehmend',
  Helm = 'Helm',
  NewMoon = 'Tote Mada/Neumond',
  Chalice = 'Kelch',
  FullMoon = 'Rad/Vollmond',
}

export const MOON_ICON = {
  Increasing: '🌒',
  Decreasing: '🌖',
  Helm: '🌗',
  NewMoon: '🌑',
  Chalice: '🌓',
  FullMoon: '🌕',
};

export const DAYS_IN_MONTH: number = 30;
export const DAYS_IN_YEAR: number = 365;

/********************** Currency Constants **********************/
export const CURRENCIES: string[] = [
  'Mittelreich',
  'Herzogtum Paavi',
  'Bornland',
  'Vallusa',
  'Königreiche Andergast',
  'Königreiche Nostria',
  'Horasreich',
  'Königinnenreich der Amazonen',
  'Bergkönigreich',
  'Mhaharanyat Aranien',
  'Kalifat',
  'Großemirat Mengbilla',
  'Alanfanisches Imperium',
  'Königreich Brabak (in Brabak)',
  'Königreich Brabak (außerhalb Brabak)',
  'Káhet Ni Kemi',
];

export interface CurrencyValue {
  name: string;
  relativeValue: number;
}

export const CURRENCYMAP = new Map<string, CurrencyValue[]>([
  [
    'Mittelreich',
    [
      { name: 'Kreuzer', relativeValue: 1 },
      { name: 'Heller', relativeValue: 10 },
      { name: 'Silbertaler', relativeValue: 100 },
      { name: 'Dukaten', relativeValue: 1000 },
    ],
  ],
  ['Herzogtum Paavi', [{ name: 'Gulden', relativeValue: 500 }]],
  [
    'Bornland',
    [
      { name: 'Deut', relativeValue: 10 },
      { name: 'Silbergroschen', relativeValue: 100 },
      { name: 'Batzen', relativeValue: 1000 },
    ],
  ],
  [
    'Vallusa',
    [
      { name: 'Flindrich', relativeValue: 10 },
      { name: 'Stüber', relativeValue: 100 },
      { name: 'Witten', relativeValue: 1000 },
    ],
  ],
  ['Königreiche Andergast', [{ name: 'Andrataler', relativeValue: 500 }]],
  ['Königreiche Nostria', [{ name: 'Nostrische Krone', relativeValue: 500 }]],
  [
    'Horasreich',
    [
      { name: 'Kreuzer', relativeValue: 1 },
      { name: 'Heller', relativeValue: 10 },
      { name: 'Silbertaler', relativeValue: 100 },
      { name: 'Dukaten', relativeValue: 1000 },
      { name: 'Kusliker Rad', relativeValue: 20000 },
    ],
  ],
  [
    'Königinnenreich der Amazonen',
    [{ name: 'Amazonenkrone', relativeValue: 1200 }],
  ],
  [
    'Bergkönigreich',
    [
      { name: 'Atebrox', relativeValue: 20 },
      { name: 'Arganbrox', relativeValue: 200 },
      { name: 'Auromox', relativeValue: 1200 },
    ],
  ],
  [
    'Mhaharanyat Aranien',
    [
      { name: 'Kurush', relativeValue: 1 },
      { name: 'Hallah', relativeValue: 10 },
      { name: 'Schekel', relativeValue: 100 },
      { name: 'Dinar', relativeValue: 1000 },
    ],
  ],
  [
    'Kalifat',
    [
      { name: 'Muwlat', relativeValue: 5 },
      { name: 'Zechine', relativeValue: 200 },
      { name: 'Marawedi', relativeValue: 2000 },
    ],
  ],
  [
    'Großemirat Mengbilla',
    [
      { name: 'Ikossar', relativeValue: 5 },
      { name: 'Tessar', relativeValue: 25 },
      { name: 'Telár', relativeValue: 100 },
      { name: 'Dekat', relativeValue: 1000 },
    ],
  ],
  [
    'Alanfanisches Imperium',
    [
      { name: 'Dirham', relativeValue: 1 },
      { name: 'Kleiner Oreal', relativeValue: 5 },
      { name: 'Oreal', relativeValue: 100 },
      { name: 'Dublone', relativeValue: 2000 },
    ],
  ],
  [
    'Königreich Brabak (in Brabak)',
    [
      { name: 'Brabaker Kreuzer', relativeValue: 1 },
      { name: 'Brabaker Krone', relativeValue: 1000 }, // Lokaler Wert
    ],
  ],
  [
    'Königreich Brabak (außerhalb Brabak)',
    [
      { name: 'Brabaker Kreuzer', relativeValue: 1 },
      { name: 'Brabaker Krone außerhalb Brabaks', relativeValue: 500 },
    ],
  ],
  [
    'Káhet Ni Kemi',
    [
      { name: 'Trümmer', relativeValue: 1 },
      { name: "Ch'ryskl", relativeValue: 10 },
      { name: 'Hedsch', relativeValue: 100 },
      { name: 'Suvar', relativeValue: 1000 },
    ],
  ],
]);
