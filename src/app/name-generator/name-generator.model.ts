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
    title: 'human.title',
    content: [],
    treeData: [
      {
        name: 'human.regionTitle.mittelreich',
        children: [
          {
            name: 'human.albernia',
            region: {
              label: 'human.albernia',
              value: NameRegion.Albernia,
              hasNoble: true,
            },
          },
          {
            name: 'human.almada',
            region: {
              label: 'human.almada',
              value: NameRegion.Almada,
              hasNoble: true,
            },
          },
          {
            name: 'human.garetien',
            region: {
              label: 'human.garetien',
              value: NameRegion.Garetien,
              hasNoble: true,
            },
          },
          {
            name: 'human.greifenfurt',
            region: {
              label: 'human.greifenfurt',
              value: NameRegion.Greifenfurt,
              hasNoble: true,
            },
          },
          {
            name: 'human.kosch',
            region: {
              label: 'human.kosch',
              value: NameRegion.Kosch,
              hasNoble: true,
            },
          },
          {
            name: 'human.nordmarken',
            region: {
              label: 'human.nordmarken',
              value: NameRegion.Nordmarken,
              hasNoble: true,
            },
          },
          {
            name: 'human.perricum',
            region: {
              label: 'human.perricum',
              value: NameRegion.Perricum,
              hasNoble: true,
            },
          },
          {
            name: 'human.rabenmark',
            region: {
              label: 'human.rabenmark',
              value: NameRegion.Rabenmark,
              hasNoble: true,
            },
          },
          {
            name: 'human.rommilyser',
            region: {
              label: 'human.rommilyser',
              value: NameRegion.Rommilyser,
              hasNoble: true,
            },
          },
          {
            name: 'human.sonnenmark',
            region: {
              label: 'human.sonnenmark',
              value: NameRegion.Sonnenmark,
              hasNoble: true,
            },
          },
          {
            name: 'human.tobrien',
            region: {
              label: 'human.tobrien',
              value: NameRegion.Tobrien,
              hasNoble: false,
            },
          },
          {
            name: 'human.trollzacker',
            region: {
              label: 'human.trollzacker',
              value: NameRegion.Trollzacker,
              hasNoble: false,
            },
          },
          {
            name: 'human.warunk',
            region: {
              label: 'human.warunk',
              value: NameRegion.Warunk,
              hasNoble: true,
            },
          },
          {
            name: 'human.weiden',
            region: {
              label: 'human.weiden',
              value: NameRegion.Weiden,
              hasNoble: true,
            },
          },
          {
            name: 'human.windhag',
            region: {
              label: 'human.windhag',
              value: NameRegion.Windhag,
              hasNoble: true,
            },
          },
        ],
      },
      {
        name: 'human.regionTitle.southern',
        children: [
          {
            name: 'human.alAnfa',
            region: {
              label: 'human.alAnfa',
              value: NameRegion.AlAnfa,
              hasNoble: true,
            },
          },
          {
            name: 'human.chirakah',
            region: {
              label: 'human.chirakah',
              value: NameRegion.Chirakah,
              hasNoble: false,
            },
          },
          {
            name: 'human.kemi',
            region: {
              label: 'human.kemi',
              value: NameRegion.Kemi,
              hasNoble: false,
            },
          },
          {
            name: 'human.waldmenschen',
            region: {
              label: 'human.waldmenschen',
              value: NameRegion.Waldmenschen,
              hasNoble: false,
            },
          },
          {
            name: 'human.tocamuya',
            region: {
              label: 'human.tocamuya',
              value: NameRegion.Tocamuya,
              hasNoble: false,
            },
          },
          {
            name: 'human.uthuria',
            region: {
              label: 'human.uthuria',
              value: NameRegion.Uthuria,
              hasNoble: false,
            },
          },
          {
            name: 'human.utulu',
            region: {
              label: 'human.utulu',
              value: NameRegion.Utulu,
              hasNoble: false,
            },
          },
        ],
      },
      {
        name: 'human.regionTitle.tulamidien',
        children: [
          {
            name: 'human.aranien',
            region: {
              label: 'human.aranien',
              value: NameRegion.Aranien,
              hasNoble: true,
            },
          },
          {
            name: 'human.ferkina',
            region: {
              label: 'human.ferkina',
              value: NameRegion.Ferkina,
              hasNoble: false,
            },
          },
          {
            name: 'human.novadi',
            region: {
              label: 'human.novadi',
              value: NameRegion.Novadi,
              hasNoble: false,
            },
          },
          {
            name: 'human.thalusien',
            region: {
              label: 'human.thalusien',
              value: NameRegion.Thalusien,
              hasNoble: false,
            },
          },
          {
            name: 'human.tulamidien',
            region: {
              label: 'human.tulamidien',
              value: NameRegion.Tulamidenlande,
              hasNoble: false,
            },
          },
          {
            name: 'human.urtulamid',
            region: {
              label: 'human.urtulamid',
              value: NameRegion.Urtulamid,
              hasNoble: false,
            },
          },
          {
            name: 'human.zahori',
            region: {
              label: 'human.zahori',
              value: NameRegion.Zahori,
              hasNoble: false,
            },
          },
        ],
      },
      {
        name: 'human.regionTitle.islands',
        children: [
          {
            name: 'human.bosparn',
            region: {
              label: 'human.bosparn',
              value: NameRegion.Bosparn,
              hasNoble: true,
            },
          },
          {
            name: 'human.bukanier',
            region: {
              label: 'human.bukanier',
              value: NameRegion.Bukanier,
              hasNoble: false,
            },
          },
          {
            name: 'human.cyclopeisch',
            region: {
              label: 'human.cyclopeisch',
              value: NameRegion.Cyclopeisch,
              hasNoble: true,
            },
          },
          {
            name: 'human.elemitisch',
            region: {
              label: 'human.elemitisch',
              value: NameRegion.Elemitisch,
              hasNoble: false,
            },
          },
          {
            name: 'human.horasreich',
            region: {
              label: 'human.horasreich',
              value: NameRegion.Horasreich,
              hasNoble: true,
            },
          },
          {
            name: 'human.maraskan',
            region: {
              label: 'human.maraskan',
              value: NameRegion.Maraskan,
              hasNoble: false,
            },
          },
          {
            name: 'human.northProvince',
            region: {
              label: 'human.northProvince',
              value: NameRegion.NorthProvince,
              hasNoble: false,
            },
          },
          {
            name: 'human.selem',
            region: {
              label: 'human.selem',
              value: NameRegion.Selem,
              hasNoble: false,
            },
          },
          {
            name: 'human.zyklopeninsel',
            region: {
              label: 'human.zyklopeninsel',
              value: NameRegion.Zyklopeninsel,
              hasNoble: true,
            },
          },
        ],
      },
      {
        name: 'human.regionTitle.northWest',
        children: [
          {
            name: 'human.gjalsker',
            region: {
              label: 'human.gjalsker',
              value: NameRegion.Gjalsker,
              hasNoble: false,
            },
          },
          {
            name: 'human.svellttal',
            region: {
              label: 'human.svellttal',
              value: NameRegion.Svellttal,
              hasNoble: false,
            },
          },
          {
            name: 'human.thorwal',
            region: {
              label: 'human.thorwal',
              value: NameRegion.Thorwal,
              hasNoble: false,
            },
          },
        ],
      },
      {
        name: 'human.regionTitle.bornland',
        children: [
          {
            name: 'human.alhanisch',
            region: {
              label: 'human.alhanisch',
              value: NameRegion.Alhanisch,
              hasNoble: false,
            },
          },
          {
            name: 'human.andergast',
            region: {
              label: 'human.andergast',
              value: NameRegion.Andergast,
              hasNoble: true,
            },
          },
          {
            name: 'human.bornland',
            region: {
              label: 'human.bornland',
              value: NameRegion.Bornland,
              hasNoble: true,
            },
          },
          {
            name: 'human.freeCityNorth',
            region: {
              label: 'freeCityNorth',
              value: NameRegion.FreeCityNorth,
              hasNoble: true,
            },
          },
          {
            name: 'human.norbarden',
            region: {
              label: 'human.norbarden',
              value: NameRegion.Norbarden,
              hasNoble: false,
            },
          },
          {
            name: 'human.nostria',
            region: {
              label: 'human.nostria',
              value: NameRegion.Nostria,
              hasNoble: true,
            },
          },
          {
            name: 'human.freieSchattenlande',
            region: {
              label: 'human.freieSchattenlande',
              value: NameRegion.FreieSchattenlande,
              hasNoble: true,
            },
          },
          {
            name: 'human.schattenlande',
            region: {
              label: 'human.schattenlande',
              value: NameRegion.Schattenlande,
              hasNoble: true,
            },
          },
        ],
      },
      {
        name: 'human.regionTitle.norhtern',
        children: [
          {
            name: 'human.fjarninger',
            region: {
              label: 'human.fjarninger',
              value: NameRegion.Fjarninger,
              hasNoble: false,
            },
          },
          {
            name: 'human.highNorth',
            region: {
              label: 'human.highNorth',
              value: NameRegion.HighNorth,
              hasNoble: false,
            },
          },
          {
            name: 'human.nivesen',
            region: {
              label: 'human.nivesen',
              value: NameRegion.Nivesen,
              hasNoble: false,
            },
          },
        ],
      },
    ],
  },
  {
    title: 'elven.title',
    content: [
      { label: 'elven.auelfen', value: NameRegion.Auelfen, hasNoble: false },
      {
        label: 'elven.firnelfen',
        value: NameRegion.Firnelfen,
        hasNoble: false,
      },
      {
        label: 'elven.hochelfen',
        value: NameRegion.Hochelfen,
        hasNoble: false,
      },
      {
        label: 'elven.steppenelfen',
        value: NameRegion.Steppenelfen,
        hasNoble: false,
      },
      {
        label: 'elven.shakagra',
        value: NameRegion.Shakagra,
        hasNoble: false,
      },
      {
        label: 'elven.waldelfen',
        value: NameRegion.Waldelfen,
        hasNoble: false,
      },
    ],
    treeData: [],
  },
  {
    title: 'dwarf.title',
    content: [
      { label: 'dwarf.amboss', value: NameRegion.Zwergen, hasNoble: false },
      { label: 'dwarf.brilliant', value: NameRegion.Zwergen, hasNoble: false },
      { label: 'dwarf.brobim', value: NameRegion.Brobim, hasNoble: false },
      { label: 'dwarf.erz', value: NameRegion.Zwergen, hasNoble: false },
      {
        label: 'dwarf.hügelzwerge',
        value: NameRegion.Hugelzwergen,
        hasNoble: false,
      },
      {
        label: 'dwarf.rotezwerge',
        value: NameRegion.Rotezwerge,
        hasNoble: false,
      },
      {
        label: 'dwarf.tiefzwerge',
        value: NameRegion.Tiefzwerge,
        hasNoble: false,
      },
    ],
    treeData: [],
  },
  {
    title: 'god.title',
    content: [
      { label: 'god.praois', value: NameRegion.Praios, hasNoble: false },
      { label: 'god.rondra', value: NameRegion.Rondra, hasNoble: false },
      { label: 'god.efferad', value: NameRegion.Effard, hasNoble: false },
      { label: 'god.travia', value: NameRegion.Travia, hasNoble: false },
      { label: 'god.boron', value: NameRegion.Boron, hasNoble: false },
      { label: 'god.hesinde', value: NameRegion.Hesinde, hasNoble: false },
      { label: 'god.firun', value: NameRegion.Firun, hasNoble: false },
      { label: 'god.tsa', value: NameRegion.Tsa, hasNoble: false },
      { label: 'god.phex', value: NameRegion.Phex, hasNoble: false },
      { label: 'god.peraine', value: NameRegion.Peraine, hasNoble: false },
      { label: 'god.ingerimm', value: NameRegion.Ingerimm, hasNoble: false },
      { label: 'god.halbgott', value: NameRegion.Halbgott, hasNoble: false },
    ],
    treeData: [],
  },
  {
    title: 'other.title',
    content: [
      { label: 'other.achaz', value: NameRegion.Achaz, hasNoble: false },
      { label: 'other.oger', value: NameRegion.Oger, hasNoble: false },
      { label: 'other.orks', value: NameRegion.Orks, hasNoble: false },
      {
        label: 'other.stadtGoblin',
        value: NameRegion.StadtGoblin,
        hasNoble: false,
      },
      { label: 'other.suulak', value: NameRegion.Suulak, hasNoble: false },
      { label: 'other.trolle', value: NameRegion.Trolle, hasNoble: false },
      {
        label: 'other.buehnenZauberer',
        value: NameRegion.BuehnenZauberer,
        hasNoble: false,
      },
      { label: 'other.gaukler', value: NameRegion.Gaukler, hasNoble: false },
      {
        label: 'other.gladiator',
        value: NameRegion.Gladiator,
        hasNoble: false,
      },
      { label: 'other.magier', value: NameRegion.Magier, hasNoble: false },
      {
        label: 'other.quacksalber',
        value: NameRegion.Quacksalber,
        hasNoble: false,
      },
    ],
    treeData: [],
  },
];
