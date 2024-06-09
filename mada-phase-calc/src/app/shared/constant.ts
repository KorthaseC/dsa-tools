/********************** Calendar Constants **********************/
export enum Months {
  Praios = 'praios',
  Rondra = 'rondra',
  Efferd = 'efferd',
  Travia = 'travia',
  Boron = 'boron',
  Hesinde = 'hesinde',
  Firun = 'firun',
  Tsa = 'tsa',
  Phex = 'phex',
  Peraine = 'peraine',
  Ingerimm = 'ingerimm',
  Rahja = 'rahja',
  namelessDays = 'namelessDays',
}

export enum Weekdays {
  Windday = 'windday',
  Earthday = 'earthday',
  Marketday = 'marketday',
  Praiosday = 'praiosday',
  Rohalsday = 'rohalsday',
  Fireday = 'fireday',
  Waterday = 'waterday',
}

export enum MoonPhase {
  Increasing = 'increasing',
  Decreasing = 'decreasing',
  Helmet = 'helmet',
  NewMoon = 'newMoon',
  Chalice = 'chalice',
  FullMoon = 'fullMoon',
}

export const MOON_ICON = {
  increasing: '🌒',
  decreasing: '🌖',
  helmet: '🌗',
  newMoon: '🌑',
  chalice: '🌓',
  fullMoon: '🌕',
};

export const DAYS_IN_MONTH: number = 30;
export const DAYS_IN_YEAR: number = 365;

/********************** Currency Constants **********************/
export enum CurrencyRegion {
  Middenrealm = 'middenrealm', // Mittelreich
  DuchyOfPaavi = 'duchyOfPaavi', // Herzogtum Paavi
  Bornland = 'bornland', // Bornland
  Vallusa = 'vallusa', // Vallusa
  KingdomsOfAndergast = 'kingdomsOfAndergast', // Königreiche Andergast
  KingdomsOfNostria = 'kingdomsOfNostria', // Königreiche Nostria
  HorasianEmpire = 'horasianEmpire', // Horasreich
  AmazonQueendom = 'amazonQueendom', // Königinnenreich der Amazonen
  MountainKingdom = 'mountainKingdom', // Bergkönigreich
  MhararanyatOfArania = 'mhararanyatOfArania', // Mhaharanyat Aranien
  Caliphate = 'caliphate', // Kalifat
  GrandEmirateOfMengbilla = 'grandEmirateOfMengbilla', // Großemirat Mengbilla
  AlAnfanEmpire = 'alAnfanEmpire', // Alanfanisches Imperium
  KingdomOfBrabakIn = 'kingdomOfBrabakIn', // Königreich Brabak (in Brabak)
  KingdomOfBrabakOut = 'kingdomOfBrabakOut', // Königreich Brabak (außerhalb Brabak)
  KahetNiKemi = 'kahetNiKemi', // Káhet Ni Kemi
}

export interface CurrencyValue {
  name: string;
  relativeValue: number;
}

export const CURRENCYMAP = new Map<CurrencyRegion, CurrencyValue[]>([
  [
    CurrencyRegion.Middenrealm,
    [
      { name: 'kreutzer', relativeValue: 1 },
      { name: 'haler', relativeValue: 10 },
      { name: 'silverThaler', relativeValue: 100 },
      { name: 'ducat', relativeValue: 1000 },
    ],
  ],
  [CurrencyRegion.DuchyOfPaavi, [{ name: 'guilder', relativeValue: 500 }]],
  [
    CurrencyRegion.Bornland,
    [
      { name: 'penny', relativeValue: 10 },
      { name: 'silverGroschen', relativeValue: 100 },
      { name: 'batze', relativeValue: 1000 },
    ],
  ],
  [
    CurrencyRegion.Vallusa,
    [
      { name: 'flindrich', relativeValue: 10 },
      { name: 'stuiver', relativeValue: 100 },
      { name: 'witten', relativeValue: 1000 },
    ],
  ],
  [
    CurrencyRegion.KingdomsOfAndergast,
    [{ name: 'andrathaler', relativeValue: 500 }],
  ],
  [
    CurrencyRegion.KingdomsOfNostria,
    [{ name: 'nostrianCrown', relativeValue: 500 }],
  ],
  [
    CurrencyRegion.HorasianEmpire,
    [
      { name: 'kreutzer', relativeValue: 1 },
      { name: 'haler', relativeValue: 10 },
      { name: 'silverThaler', relativeValue: 100 },
      { name: 'ducat', relativeValue: 1000 },
      { name: 'kuslikWheel', relativeValue: 20000 },
    ],
  ],
  [
    CurrencyRegion.AmazonQueendom,
    [{ name: 'amazonCrown', relativeValue: 1200 }],
  ],
  [
    CurrencyRegion.MountainKingdom,
    [
      { name: 'atebrox', relativeValue: 20 },
      { name: 'arganbrox', relativeValue: 200 },
      { name: 'auromox', relativeValue: 1200 },
    ],
  ],
  [
    CurrencyRegion.MhararanyatOfArania,
    [
      { name: 'kurush', relativeValue: 1 },
      { name: 'hallah', relativeValue: 10 },
      { name: 'shekel', relativeValue: 100 },
      { name: 'dinar', relativeValue: 1000 },
    ],
  ],
  [
    CurrencyRegion.Caliphate,
    [
      { name: 'muwlat', relativeValue: 5 },
      { name: 'zechine', relativeValue: 200 },
      { name: 'maravedi', relativeValue: 2000 },
    ],
  ],
  [
    CurrencyRegion.GrandEmirateOfMengbilla,
    [
      { name: 'ikossar', relativeValue: 5 },
      { name: 'tessar', relativeValue: 25 },
      { name: 'telar', relativeValue: 100 },
      { name: 'dekat', relativeValue: 1000 },
    ],
  ],
  [
    CurrencyRegion.AlAnfanEmpire,
    [
      { name: 'dirham', relativeValue: 1 },
      { name: 'smallOreal', relativeValue: 5 },
      { name: 'oreal', relativeValue: 100 },
      { name: 'doubloon', relativeValue: 2000 },
    ],
  ],
  [
    CurrencyRegion.KingdomOfBrabakIn,
    [
      { name: 'brabacPenny', relativeValue: 1 },
      { name: 'brabacCrown', relativeValue: 1000 }, // Local value
    ],
  ],
  [
    CurrencyRegion.KingdomOfBrabakOut,
    [
      { name: 'brabacPenny', relativeValue: 1 },
      { name: 'brabacCrownOutsideBrabak', relativeValue: 500 },
    ],
  ],
  [
    CurrencyRegion.KahetNiKemi,
    [
      { name: 'shard', relativeValue: 1 },
      { name: 'chryskl', relativeValue: 10 },
      { name: 'hedsch', relativeValue: 100 },
      { name: 'suvar', relativeValue: 1000 },
    ],
  ],
]);
