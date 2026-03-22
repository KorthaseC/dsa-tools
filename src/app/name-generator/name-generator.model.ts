export interface RaceRegion {
  label: string;
  value: NameRegion;
  hasNoble?: boolean;
}

export interface RacePanel {
  title: string;
  content: RaceRegion[];
  treeData?: TreeNode[];
}

export interface TreeNode {
  name: string;
  region?: RaceRegion; // Add this to hold the region data
  children?: TreeNode[];
}
export enum NameRegion {
  Achaz = 'achaz',
  AlAnfa = 'alAnfa',
  Albernia = 'albernia',
  Alhanisch = 'alhanisch',
  Almada = 'almada',
  Andergast = 'andergast',
  Aranien = 'aranien',
  Auelfen = 'auelfen',
  Bornland = 'bornland',
  Boron = 'boron',
  Bosparn = 'bosparn',
  Brobim = 'brobim',
  BuehnenZauberer = 'buehnenZauberer',
  Bukanier = 'bukanier',
  Chirakah = 'chirakah',
  Cyclopeisch = 'cyclopeisch',
  Effard = 'effard',
  Elemitisch = 'elemitisch',
  Ferkina = 'ferkina',
  Firnelfen = 'firnelfen',
  Firun = 'firun',
  Fjarninger = 'fjarninger',
  FreeCityNorth = 'freeCityNorth',
  FreieSchattenlande = 'freieSchattenlande',
  Garetien = 'garetien',
  Gaukler = 'gaukler',
  Gjalsker = 'gjalsker',
  Gladiator = 'gladiator',
  Greifenfurt = 'greifenfurt',
  Halbgott = 'halbgott',
  Hesinde = 'hesinde',
  HighNorth = 'highNorth',
  Hochelfen = 'hochelfen',
  Horasreich = 'horasreich',
  Hugelzwergen = 'hugelzwergen',
  Ingerimm = 'ingerimm',
  Kemi = 'kemi',
  Kosch = 'kosch',
  Magier = 'magier',
  Maraskan = 'maraskan',
  Nivesen = 'nivesen',
  Norbarden = 'norbarden',
  Nordmarken = 'nordmarken',
  NorthProvince = 'northProvince',
  Nostria = 'nostria',
  Novadi = 'novadi',
  Oger = 'oger',
  Orks = 'orks',
  Peraine = 'peraine',
  Perricum = 'perricum',
  Phex = 'phex',
  Praios = 'praios',
  Quacksalber = 'quacksalber',
  Rabenmark = 'rabenmark',
  Rahja = 'rahja',
  Rommilyser = 'rommilyser',
  Rondra = 'rondra',
  Rotezwerge = 'rotezwerge',
  Schattenlande = 'schattenlande',
  Selem = 'selem',
  Shakagra = 'shakagra',
  Sonnenmark = 'sonnenmark',
  StadtGoblin = 'stadtGoblin',
  Steppenelfen = 'steppenelfen',
  Suulak = 'suulak',
  Svellttal = 'svellttal',
  Thalusien = 'thalusien',
  Thorwal = 'thorwal',
  Tiefzwerge = 'tiefzwerge',
  Tobrien = 'tobrien',
  Tocamuya = 'tocamuya',
  Travia = 'travia',
  Trolle = 'trolle',
  Trollzacker = 'trollzacker',
  Tsa = 'tsa',
  Tulamidenlande = 'tulamidenlande',
  Urtulamid = 'urtulamid',
  Uthuria = 'uthuria',
  Utulu = 'utulu',
  Waldelfen = 'waldelfen',
  Waldmenschen = 'waldmenschen',
  Warunk = 'warunk',
  Weiden = 'weiden',
  Windhag = 'windhag',
  Zahori = 'zahori',
  Zwergen = 'zwergen',
  Zyklopeninsel = 'zyklopeninsel',
}

export const RACE_PANEL: RacePanel[] = [
  {
    title: 'Menschen',
    content: [],
    treeData: [
      {
        name: 'Mittelreich',
        children: [
          {
            name: 'Albernia',
            region: {
              label: 'Albernia',
              value: NameRegion.Albernia,
              hasNoble: true,
            },
          },
          {
            name: 'Almada',
            region: {
              label: 'Almada',
              value: NameRegion.Almada,
              hasNoble: true,
            },
          },
          {
            name: 'Garetien',
            region: {
              label: 'Garetien',
              value: NameRegion.Garetien,
              hasNoble: true,
            },
          },
          {
            name: 'Greifenfurt',
            region: {
              label: 'Greifenfurt',
              value: NameRegion.Greifenfurt,
              hasNoble: true,
            },
          },
          {
            name: 'Kosch',
            region: {
              label: 'Kosch',
              value: NameRegion.Kosch,
              hasNoble: true,
            },
          },
          {
            name: 'Nordmarken',
            region: {
              label: 'Nordmarken',
              value: NameRegion.Nordmarken,
              hasNoble: true,
            },
          },
          {
            name: 'Perricum',
            region: {
              label: 'Perricum',
              value: NameRegion.Perricum,
              hasNoble: true,
            },
          },
          {
            name: 'Rabenmark',
            region: {
              label: 'Rabenmark',
              value: NameRegion.Rabenmark,
              hasNoble: true,
            },
          },
          {
            name: 'Rommilyser',
            region: {
              label: 'Rommilyser',
              value: NameRegion.Rommilyser,
              hasNoble: true,
            },
          },
          {
            name: 'Sonnenmark',
            region: {
              label: 'Sonnenmark',
              value: NameRegion.Sonnenmark,
              hasNoble: true,
            },
          },
          {
            name: 'Tobrien',
            region: {
              label: 'Tobrien',
              value: NameRegion.Tobrien,
              hasNoble: false,
            },
          },
          {
            name: 'Trollzacker',
            region: {
              label: 'Trollzacker',
              value: NameRegion.Trollzacker,
              hasNoble: false,
            },
          },
          {
            name: 'Warunk',
            region: {
              label: 'Warunk',
              value: NameRegion.Warunk,
              hasNoble: true,
            },
          },
          {
            name: 'Weiden',
            region: {
              label: 'Weiden',
              value: NameRegion.Weiden,
              hasNoble: true,
            },
          },
          {
            name: 'Windhag',
            region: {
              label: 'Windhag',
              value: NameRegion.Windhag,
              hasNoble: true,
            },
          },
        ],
      },
      {
        name: 'Südliches Aventurien',
        children: [
          {
            name: 'Al\'Anfa',
            region: {
              label: 'Al\'Anfa',
              value: NameRegion.AlAnfa,
              hasNoble: true,
            },
          },
          {
            name: 'Chirakah',
            region: {
              label: 'Chirakah',
              value: NameRegion.Chirakah,
              hasNoble: false,
            },
          },
          {
            name: 'Kemi',
            region: {
              label: 'Kemi',
              value: NameRegion.Kemi,
              hasNoble: false,
            },
          },
          {
            name: 'Waldmenschen',
            region: {
              label: 'Waldmenschen',
              value: NameRegion.Waldmenschen,
              hasNoble: false,
            },
          },
          {
            name: 'Tocamuya',
            region: {
              label: 'Tocamuya',
              value: NameRegion.Tocamuya,
              hasNoble: false,
            },
          },
          {
            name: 'Uthuria',
            region: {
              label: 'Uthuria',
              value: NameRegion.Uthuria,
              hasNoble: false,
            },
          },
          {
            name: 'Utulu',
            region: {
              label: 'Utulu',
              value: NameRegion.Utulu,
              hasNoble: false,
            },
          },
        ],
      },
      {
        name: 'Tulamiditsche Gebiete',
        children: [
          {
            name: 'Aranien',
            region: {
              label: 'Aranien',
              value: NameRegion.Aranien,
              hasNoble: true,
            },
          },
          {
            name: 'Ferkina',
            region: {
              label: 'Ferkina',
              value: NameRegion.Ferkina,
              hasNoble: false,
            },
          },
          {
            name: 'Novadi',
            region: {
              label: 'Novadi',
              value: NameRegion.Novadi,
              hasNoble: false,
            },
          },
          {
            name: 'Thalusien',
            region: {
              label: 'Thalusien',
              value: NameRegion.Thalusien,
              hasNoble: false,
            },
          },
          {
            name: 'Tulamidien',
            region: {
              label: 'Tulamidien',
              value: NameRegion.Tulamidenlande,
              hasNoble: false,
            },
          },
          {
            name: 'Urtulamid',
            region: {
              label: 'Urtulamid',
              value: NameRegion.Urtulamid,
              hasNoble: false,
            },
          },
          {
            name: 'Zahori',
            region: {
              label: 'Zahori',
              value: NameRegion.Zahori,
              hasNoble: false,
            },
          },
        ],
      },
      {
        name: 'Inselgebiete',
        children: [
          {
            name: 'Bosparan',
            region: {
              label: 'Bosparan',
              value: NameRegion.Bosparn,
              hasNoble: true,
            },
          },
          {
            name: 'Bukanier',
            region: {
              label: 'Bukanier',
              value: NameRegion.Bukanier,
              hasNoble: false,
            },
          },
          {
            name: 'Cyclopeisch',
            region: {
              label: 'Cyclopeisch',
              value: NameRegion.Cyclopeisch,
              hasNoble: true,
            },
          },
          {
            name: 'Elemitisch',
            region: {
              label: 'Elemitisch',
              value: NameRegion.Elemitisch,
              hasNoble: false,
            },
          },
          {
            name: 'Horasreich',
            region: {
              label: 'Horasreich',
              value: NameRegion.Horasreich,
              hasNoble: true,
            },
          },
          {
            name: 'Maraskan',
            region: {
              label: 'Maraskan',
              value: NameRegion.Maraskan,
              hasNoble: false,
            },
          },
          {
            name: 'Nordprovinz',
            region: {
              label: 'Nordprovinz',
              value: NameRegion.NorthProvince,
              hasNoble: false,
            },
          },
          {
            name: 'Selem',
            region: {
              label: 'Selem',
              value: NameRegion.Selem,
              hasNoble: false,
            },
          },
          {
            name: 'Zyklopeninsel',
            region: {
              label: 'Zyklopeninsel',
              value: NameRegion.Zyklopeninsel,
              hasNoble: true,
            },
          },
        ],
      },
      {
        name: 'Nordwestliches Aventurien',
        children: [
          {
            name: 'Gjalsker',
            region: {
              label: 'Gjalsker',
              value: NameRegion.Gjalsker,
              hasNoble: false,
            },
          },
          {
            name: 'Svellttal',
            region: {
              label: 'Svellttal',
              value: NameRegion.Svellttal,
              hasNoble: false,
            },
          },
          {
            name: 'Thorwal',
            region: {
              label: 'Thorwal',
              value: NameRegion.Thorwal,
              hasNoble: false,
            },
          },
        ],
      },
      {
        name: 'Bornland und freie Städte',
        children: [
          {
            name: 'Alhanisch',
            region: {
              label: 'Alhanisch',
              value: NameRegion.Alhanisch,
              hasNoble: false,
            },
          },
          {
            name: 'Andergast',
            region: {
              label: 'Andergast',
              value: NameRegion.Andergast,
              hasNoble: true,
            },
          },
          {
            name: 'Bornland',
            region: {
              label: 'Bornland',
              value: NameRegion.Bornland,
              hasNoble: true,
            },
          },
          {
            name: 'Freie Stadt im Norden',
            region: {
              label: 'Freie Stadt im Norden',
              value: NameRegion.FreeCityNorth,
              hasNoble: true,
            },
          },
          {
            name: 'Norbarden',
            region: {
              label: 'Norbarden',
              value: NameRegion.Norbarden,
              hasNoble: false,
            },
          },
          {
            name: 'Nostria',
            region: {
              label: 'Nostria',
              value: NameRegion.Nostria,
              hasNoble: true,
            },
          },
          {
            name: 'Freie Schattenlande',
            region: {
              label: 'Freie Schattenlande',
              value: NameRegion.FreieSchattenlande,
              hasNoble: true,
            },
          },
          {
            name: 'Schattenlande',
            region: {
              label: 'Schattenlande',
              value: NameRegion.Schattenlande,
              hasNoble: true,
            },
          },
        ],
      },
      {
        name: 'Nördliches Aventurien',
        children: [
          {
            name: 'Fjarninger',
            region: {
              label: 'Fjarninger',
              value: NameRegion.Fjarninger,
              hasNoble: false,
            },
          },
          {
            name: 'Hoch Norden',
            region: {
              label: 'Hoch Norden',
              value: NameRegion.HighNorth,
              hasNoble: false,
            },
          },
          {
            name: 'Nivesen',
            region: {
              label: 'Nivesen',
              value: NameRegion.Nivesen,
              hasNoble: false,
            },
          },
        ],
      },
    ],
  },
  {
    title: 'Elfen',
    content: [
      { label: 'Auelfen', value: NameRegion.Auelfen, hasNoble: false },
      {
        label: 'Firnelfen',
        value: NameRegion.Firnelfen,
        hasNoble: false,
      },
      {
        label: 'Hochelfen',
        value: NameRegion.Hochelfen,
        hasNoble: false,
      },
      {
        label: 'Steppenelfen',
        value: NameRegion.Steppenelfen,
        hasNoble: false,
      },
      {
        label: 'Shakagra',
        value: NameRegion.Shakagra,
        hasNoble: false,
      },
      {
        label: 'Waldelfen',
        value: NameRegion.Waldelfen,
        hasNoble: false,
      },
    ],
    treeData: [],
  },
  {
    title: 'Zwerge',
    content: [
      { label: 'Ambosszwerge', value: NameRegion.Zwergen, hasNoble: false },
      { label: 'Brillantzwerge', value: NameRegion.Zwergen, hasNoble: false },
      { label: 'Brobim', value: NameRegion.Brobim, hasNoble: false },
      { label: 'Erzzwerge', value: NameRegion.Zwergen, hasNoble: false },
      {
        label: 'Hügelzwerge',
        value: NameRegion.Hugelzwergen,
        hasNoble: false,
      },
      {
        label: 'Rote Zwerge',
        value: NameRegion.Rotezwerge,
        hasNoble: false,
      },
      {
        label: 'Tiefzwerge',
        value: NameRegion.Tiefzwerge,
        hasNoble: false,
      },
    ],
    treeData: [],
  },
  {
    title: 'Götter',
    content: [
      { label: 'Praios', value: NameRegion.Praios, hasNoble: false },
      { label: 'Rondra', value: NameRegion.Rondra, hasNoble: false },
      { label: 'Efferd', value: NameRegion.Effard, hasNoble: false },
      { label: 'Travia', value: NameRegion.Travia, hasNoble: false },
      { label: 'Boron', value: NameRegion.Boron, hasNoble: false },
      { label: 'Hesinde', value: NameRegion.Hesinde, hasNoble: false },
      { label: 'Firun', value: NameRegion.Firun, hasNoble: false },
      { label: 'Tsa', value: NameRegion.Tsa, hasNoble: false },
      { label: 'Phex', value: NameRegion.Phex, hasNoble: false },
      { label: 'Peraine', value: NameRegion.Peraine, hasNoble: false },
      { label: 'Ingerimm', value: NameRegion.Ingerimm, hasNoble: false },
      { label: 'Halbgötter', value: NameRegion.Halbgott, hasNoble: false },
    ],
    treeData: [],
  },
  {
    title: 'Andere',
    content: [
      { label: 'Achaz', value: NameRegion.Achaz, hasNoble: false },
      { label: 'Oger', value: NameRegion.Oger, hasNoble: false },
      { label: 'Orks', value: NameRegion.Orks, hasNoble: false },
      {
        label: 'Stadt-Goblin',
        value: NameRegion.StadtGoblin,
        hasNoble: false,
      },
      { label: 'Suulak', value: NameRegion.Suulak, hasNoble: false },
      { label: 'Trolle', value: NameRegion.Trolle, hasNoble: false },
      {
        label: 'Bühnenzauberer',
        value: NameRegion.BuehnenZauberer,
        hasNoble: false,
      },
      { label: 'Gaukler', value: NameRegion.Gaukler, hasNoble: false },
      {
        label: 'Gladiator',
        value: NameRegion.Gladiator,
        hasNoble: false,
      },
      { label: 'Magier', value: NameRegion.Magier, hasNoble: false },
      {
        label: 'Quacksalber',
        value: NameRegion.Quacksalber,
        hasNoble: false,
      },
    ],
    treeData: [],
  },
];
