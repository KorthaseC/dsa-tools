export interface TavernLocation {
  location: string;
  modValue: number;
}

export interface TavernDiceResult {
  diceValueRange: [number, number];
  tavernResult: string;
  modValue?: number;
}

export const TAVERN_LOCATIONS: TavernLocation[] = [
  { location: 'tavern.location.countryRoad', modValue: -7 },
  { location: 'tavern.location.reichsstrasse', modValue: 0 },
  { location: 'tavern.location.village', modValue: 2 },
  { location: 'tavern.location.city', modValue: 4 },
];

export enum TaverProperNameOne {
  Mountain = 'mountain',
  Forest = 'forest',
  Linde = 'linde',
  Oak = 'oak',
  Emperor = 'emperor',
  Reich = 'reich',
}

export enum TaverProperNameTwo {
  Valpo = 'valpo',
  Alrik = 'alrik',
  Corner = 'corner',
  Beer = 'beer',
  Travia = 'travia',
  Anker = 'anker',
}

export enum TaverNamePartOne {
  Golden = 'golden',
  Almadinen = 'almadinen',
  Dancing = 'dancing',
  Laughing = 'laughing',
  Drunken = 'drunken',
  Happy = 'happy',
  Lucky = 'lucky',
  Jumping = 'jumping',
  Black = 'black',
  White = 'white',
  Prancing = 'prancing',
  Lonely = 'lonely',
  Emperor = 'emperor',
  Two = 'two',
  Three = 'three',
  Four = 'four',
}

export enum TavernNamePartTwo {
  Unicorn = 'unicorn',
  Bull = 'bull',
  Deer = 'deer',
  King = 'king',
  Princess = 'princess',
  Boar = 'boar',
  Eagle = 'eagle',
  Crown = 'crown',
  Executioner = 'executioner',
  Travelers = 'travelers',
  Jellyfish = 'jellyfish',
  Dolphin = 'dolphin',
  Carp = 'carp',
  Pony = 'pony',
  Boot = 'boot',
  Vagabonds = 'vagabonds',
  Mare = 'mare',
  Bucket = 'bucket',
  Pilgrim = 'pilgrim',
  Drum = 'drum',
}

export interface GuestDayTimeModifier {
  dayTime: string;
  modValue: number;
}

export const GUEST_DAY_TIME_MODIFIERS: GuestDayTimeModifier[] = [
  { dayTime: 'morning', modValue: -3 },
  { dayTime: 'lateMorning', modValue: -5 },
  { dayTime: 'noon', modValue: 2 },
  { dayTime: 'afternoon', modValue: 0 },
  { dayTime: 'evening', modValue: 2 },
  { dayTime: 'night', modValue: -7 },
];

export const TAVERN_BUILDING: TavernDiceResult[] = [
  { diceValueRange: [1, 3], tavernResult: 'tent' },
  { diceValueRange: [4, 7], tavernResult: 'blockhouse' },
  { diceValueRange: [8, 13], tavernResult: 'halfTimbered' },
  { diceValueRange: [14, 17], tavernResult: 'stoneHouse' },
  { diceValueRange: [18, 18], tavernResult: 'tower' },
  { diceValueRange: [19, 20], tavernResult: 'cellarVault' },
];

export const TAVERN_QS: TavernDiceResult[] = [
  { diceValueRange: [1, 3], tavernResult: 'qs1', modValue: 1 },
  { diceValueRange: [4, 6], tavernResult: 'qs2', modValue: 2 },
  { diceValueRange: [7, 12], tavernResult: 'qs3', modValue: 3 },
  { diceValueRange: [13, 17], tavernResult: 'qs4', modValue: 4 },
  { diceValueRange: [18, 19], tavernResult: 'qs5', modValue: 5 },
  { diceValueRange: [20, 20], tavernResult: 'qs6', modValue: 6 },
];

export const PRICE_GUEST_LVL: TavernDiceResult[] = [
  { diceValueRange: [1, 2], tavernResult: 'priceGuest', modValue: -2 },
  { diceValueRange: [3, 6], tavernResult: 'priceGuest', modValue: -1 },
  { diceValueRange: [7, 14], tavernResult: 'priceGuest', modValue: 0 },
  { diceValueRange: [15, 18], tavernResult: 'priceGuest', modValue: 1 },
  { diceValueRange: [19, 20], tavernResult: 'priceGuest', modValue: 2 },
];

export const GUEST_PRESENT: TavernDiceResult[] = [
  { diceValueRange: [-10, 2], tavernResult: 'empty' },
  { diceValueRange: [3, 5], tavernResult: 'low' },
  { diceValueRange: [6, 10], tavernResult: 'medium' },
  { diceValueRange: [11, 15], tavernResult: 'high' },
  { diceValueRange: [16, 18], tavernResult: 'full' },
  { diceValueRange: [19, 25], tavernResult: 'overfilled' },
];

export enum Keeper {
  Chubby = 'chubby',
  FlirtingOldCouple = 'flirtingOldCouple',
  ArguingYoungCouple = 'arguingYoungCouple',
  OldHearingImpaired = 'oldHearingImpaired',
  RobustSisters = 'robustSisters',
  HummingBearded = 'hummingBearded',
  IrritableWig = 'irritableWig',
  CholericPrizefighter = 'cholericPrizefighter',
  BaldGambler = 'baldGambler',
  BurlyHighPitched = 'burlyHighPitched',
  PopEyedWeakness = 'popEyedWeakness',
  DevoutMissionary = 'devoutMissionary',
  PlumpHeroes = 'plumpHeroes',
  StrongBearded = 'strongBearded',
  CheerfulLaugh = 'cheerfulLaugh',
  OneArmedPatch = 'oneArmedPatch',
  YoungDaughter = 'youngDaughter',
  BottleThrowers = 'bottleThrowers',
  ShortBulbousNose = 'shortBulbousNose',
  DrunkenAxe = 'drunkenAxe',
}

export enum Attendant {
  AloneInBar = 'aloneInBar',
  TwinCouple = 'twinCouple',
  YoungMoha = 'youngMoha',
  SlenderPoet = 'slenderPoet',
  ClumsyPlump = 'clumsyPlump',
  HarelipAccent = 'harelipAccent',
  ToothlessOld = 'toothlessOld',
  NervousThin = 'nervousThin',
  BeardedConfusion = 'beardedConfusion',
  FriendlyGloomy = 'friendlyGloomy',
  YoungCrisis = 'youngCrisis',
  AmuletSiblings = 'amuletSiblings',
  TattooedGiant = 'tattooedGiant',
  QuietPregnant = 'quietPregnant',
  StrongKnife = 'strongKnife',
  GoodnaturedShrunkenHead = 'goodnaturedShrunkenHead',
  HalfElfJokes = 'halfElfJokes',
  ArmWrestling = 'armWrestling',
  LispingFakeRelics = 'lispingFakeRelics',
  GhostCleaner = 'ghostCleaner',
}

export enum TavernEvent {
  WeddingParty = 'weddingParty',
  FuneralFeast = 'funeralFeast',
  Pilgrimage = 'pilgrimage',
  LocalHoliday = 'localHoliday',
  Entertainers = 'entertainers',
  SalesEvent = 'salesEvent',
  LoudMaritalArgument = 'loudMaritalArgument',
  BoltonTournament = 'boltonTournament',
  LargeBrawl = 'largeBrawl',
  BeerWineFestival = 'beerWineFestival',
  SlaughterFestival = 'slaughterFestival',
  FamousHeroGuest = 'famousHeroGuest',
  KnifeThrowingContest = 'knifeThrowingContest',
  DrinkingContest = 'drinkingContest',
  StorytellerPerformance = 'storytellerPerformance',
  GrandOpening = 'grandOpening',
  FansVictoryMeeting = 'fansVictoryMeeting',
  FansDefeatMeeting = 'fansDefeatMeeting',
  MissionaryAttempts = 'missionaryAttempts',
  PrivateParty = 'privateParty',
}

export enum TavernSpecialFeature {
  InHouseBrewery = 'inHouseBrewery',
  RatInfestation = 'ratInfestation',
  GamblingDen = 'gamblingDen',
  VegetarianOnly = 'vegetarianOnly',
  AlsoBrothel = 'alsoBrothel',
  SmugglerHideout = 'smugglerHideout',
  RobberCave = 'robberCave',
  Shrine = 'shrine',
  Curiosities = 'curiosities',
  WantedPosters = 'wantedPosters',
  DwarfFurniture = 'dwarfFurniture',
  NoAlcohol = 'noAlcohol',
  UnusualSmell = 'unusualSmell',
  RelayStation = 'relayStation',
  UnusuallyDirty = 'unusuallyDirty',
  LargeSpinetHarp = 'largeSpinetHarp',
  Stage = 'stage',
  InnCat = 'innCat',
  ExoticCuisine = 'exoticCuisine',
  SerialKillerCannibal = 'serialKillerCannibal',
}

export enum SpecialGuest {
  MoneyChanger = 'moneyChanger',
  CardPlayingOldMen = 'cardPlayingOldMen',
  GrimMercenaries = 'grimMercenaries',
  MysteriousMute = 'mysteriousMute',
  MercenaryRecruiter = 'mercenaryRecruiter',
  ToothPuller = 'toothPuller',
  PraiosSchoolClass = 'praiosSchoolClass',
  Scribe = 'scribe',
  TravelingSwordFighter = 'travelingSwordFighter',
  CityGuard = 'cityGuard',
  ExoticDancer = 'exoticDancer',
  CraftsmenStammtisch = 'craftsmenStammtisch',
  MessengerRider = 'messengerRider',
  NineFingeredGuest = 'nineFingeredGuest',
  FugitiveRobberChief = 'fugitiveRobberChief',
  IncognitoOperaTenor = 'incognitoOperaTenor',
  HighRankingPriest = 'highRankingPriest',
  DwarvenGemDealer = 'dwarvenGemDealer',
  AuelfTraveler = 'auelfTraveler',
  HalfOrcBirdTrader = 'halfOrcBirdTrader',
}

export const BED_PRICE_MODIFIER: number[] = [0.5, 0.75, 1, 1.5, 2, 4];

export interface BedSpread {
  qs: number;
  group: number;
  twin: number;
  single: number;
}

export const BED_SPREAD: BedSpread[] = [
  { qs: 1, group: 1, twin: 0, single: 0 },
  { qs: 2, group: 0.6, twin: 0.2, single: 0.2 },
  { qs: 3, group: 0.4, twin: 0.3, single: 0.3 },
  { qs: 4, group: 0.4, twin: 0.3, single: 0.3 },
  { qs: 5, group: 0, twin: 0.6, single: 0.4 },
  { qs: 6, group: 0, twin: 0.4, single: 0.6 },
];

export interface RoomDistribution {
  group: number;
  twin: number;
  single: number;
}
