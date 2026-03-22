/** German display names for tavern-generator dropdown options and result tables. */

/** Building types a tavern can be housed in */
export const TAVERN_TYPE_NAMES: Record<string, string> = {
  tent:        'Zelt',
  blockhouse:  'Holzhaus',
  halfTimbered:'Fachwerkhaus',
  stoneHouse:  'Steinhaus',
  tower:       'Turm',
  cellarVault: 'Kellergewölbe',
};

/** Interior furnishing quality (QS = Qualitätsstufe) */
export const FURNISHING_NAMES: Record<string, string> = {
  qs1: 'QS 1: jämmerliche Bruchbude',
  qs2: 'QS 2: dreckige Spelunke',
  qs3: 'QS 3: einfache Herberge',
  qs4: 'QS 4: gutbürgerliches Gasthaus',
  qs5: 'QS 5: exquisites Hotel',
  qs6: 'QS 6: luxuriöse Unterkunft',
};

/** Innkeeper personality descriptions */
export const KEEPER_NAMES: Record<string, string> = {
  chubby:             'ein dicker, gemütlicher Wirt, der ständig das immer gleiche Glas putzt',
  flirtingOldCouple:  'ein älteres Wirtspaar, das ständig miteinander flirtet',
  arguingYoungCouple: 'ein jüngeres Wirtspaar, das sich ständig streitet',
  oldHearingImpaired: 'ein uralter, schwerhöriger Wirt mit Krückstock',
  robustSisters:      'zwei kräftig gebaute Schwestern mit lauten Stimmen',
  hummingBearded:     'ein dürrer Wirt mit Fusselbart, der leise vor sich hin singt',
  irritableWig:       'eine schlanke, leicht reizbare Wirtin mit billiger Perücke',
  cholericPrizefighter:'cholerischer Wirt und Ex-Preisringer',
  baldGambler:        'ein glatzköpfiger Wirt, der mit den Gästen gerne um die Getränke würfelt',
  burlyHighPitched:   'ein bulliger Wirt mit heller Fistelstimme',
  popEyedWeakness:    'ein glupschäugiger Wirt mit Rechenschwäche',
  devoutMissionary:   'eine streng traviagläubige Wirtin mit Missionierungsdrang',
  plumpHeroes:        'ein(e) dralle(r) Wirt(in) mit einer Vorliebe für freshe Helden',
  strongBearded:      'ein streng riechender Wirt mit dichtem Vollbart',
  cheerfulLaugh:      'eine alte Wirtin mit fröhlichem Lachen',
  oneArmedPatch:      'eine einarmige Wirtin mit Augenklappe',
  youngDaughter:      'die zwölfjährige Tochter des Wirts, die an ihrem Geburtstag Wirt spielen darf',
  bottleThrowers:     'ein Wirtspaar, er dick, sie dünn, die sich Flaschen etc. gegenseitig zuwerfen',
  shortBulbousNose:   'ein kleinhwüchsiger Wirt mit dicker, roter Knollennase',
  drunkenAxe:         'ein volltrunkener Wirt, der sich auf eine rostige Axt stützt',
};

/** Times of day used in the guest-level table */
export const DAY_TIME_NAMES: Record<string, string> = {
  morning:     'Morgens',
  lateMorning: 'Vormittags',
  noon:        'Mittags',
  afternoon:   'Nachmittags',
  evening:     'Abends',
  night:       'Nachts',
};

/** How busy the tavern is at a given time */
export const GUEST_LEVEL_NAMES: Record<string, string> = {
  empty:      'leer (abgesehen vom Wirt ist niemand da)',
  low:        'schwach besucht (nur einige Stammgäste)',
  medium:     'mittelmäßig besucht (einige Tische sind leer)',
  high:       'stark besucht (Es gibt noch freie Plätze, aber einen freien Tisch zu finden wird schwierig.)',
  full:       'voll (Es ist richtig was los. Einen freien Platz zu finden wird schwierig.)',
  overfilled: 'überfüllt (Es ist so voll, dass viele Gäste stehen müssen.)',
};

/** Special events happening in the tavern on a given day */
export const EVENT_NAMES: Record<string, string> = {
  weddingParty:         'ausgelassene Hochzeitsfeier',
  funeralFeast:         'Leichenschmaus nach dem Begräbnis',
  pilgrimage:           'perainegefälliger Pilgerzug',
  localHoliday:         'lokaler Feiertag',
  entertainers:         'Gaukler oder Barden treten auf',
  salesEvent:           'Verkaufsveranstaltung eines reisenden Händlers',
  loudMaritalArgument:  'lautstarker Ehestreit',
  boltanTournament:     'Boltantunier',
  largeBrawl:           'große Schlägerei',
  beerWineFestival:     'Brau- oder Weinfest',
  slaughterFestival:    'Schlachtfest',
  famousHeroGuest:      'ein berühmter Held ist Gast im Haus',
  knifeThrowingContest: 'Messerwurfwettbewerb',
  drinkingContest:      'Trinkspielwettbewerb',
  storytellerPerformance:'Auftritt eines Geschichenerzählers',
  grandOpening:         'Neueröffnung',
  fansVictoryMeeting:   'Anhängertreffen nach dem Sieg der hiesigen Immanmannschaft',
  fansDefeatMeeting:    'Anhängertreffen nach der Niederlage der hiesigen Immanmannschaft',
  missionaryAttempts:   'Missionsversuche eines radikalen Wanderpredigers',
  privateParty:         'geschlossene Gesellschaft (1W6: 1: Geburtstagsfeier, 2: Zunftbesäufnis, 3: konspiratives, politisches Treffen, 4: Möchtegerngeheimbund, 5: Heldengruppe, 6: Anhänger eines verbotenen Kultes)',
};

/** Service staff personality descriptions */
export const ATTENDANT_NAMES: Record<string, string> = {
  aloneInBar:         'Wirt ist gerade alleine in der Gaststube',
  twinCouple:         'ein Zwillingspärchen aus Thorwal',
  youngMoha:          'ein achtjähriger Moha, der sich als Sohn des Wirts bezeichnet',
  slenderPoet:        'ein schlaksiger Schankknecht drängt den Gästen ständig seine Gedichte auf',
  clumsyPlump:        'eine ausgesprochen ungeschickte, pummelige Schankmaid',
  harelipAccent:      'ein junger Schankknecht mit Hasenscharte und aufgesetztem Akzent',
  toothlessOld:       'eine uralte, zahnlose Schankmaid',
  nervousThin:        'ein dürrer Schankknecht mit wirren Haaren, der nervös Nägel kaut',
  beardedConfusion:   'ein alter Schankknecht mit Spitzbart, der einen der Helden mit einer Berühmtheit verwechselt',
  friendlyGloomy:     'eine eigentlich freundliche Schankmaid mit finsterem Blick',
  youngCrisis:        'ein junges Pärchen in einer Beziehungskrise',
  amuletSiblings:     'Bruder und Schwester, beide über und über mit Amuletten behängt',
  tattooedGiant:      'ein gesichtsTätowierter Hüne mit buschigem Schnauzbart',
  quietPregnant:      'eine sehr leise sprechende, hochschwangere Schankmaid',
  strongKnife:        'eine kräftige Schankmaid mit Kopftuch, die ein Haumesser am Gürtel trägt',
  goodnaturedShrunkenHead:'ein gutmütiger Schankknecht mit blonden Locken, der einen Schrumpfkopf am Gürtel trägt',
  halfElfJokes:       'ein halbelfischer Schankknecht, der ständig schlechte Witze reißt',
  armWrestling:       'eine dralle Schankmaid, die Gäste zum Armdrücken auffordert',
  lispingFakeRelics:  'ein lispelnder Schankknecht, der unter der Hand gefälschte Reliquien verkauft',
  ghostCleaner:       'ein Geist, der tief in der Nacht die Tische zu putzen scheint',
};

/** Unusual property or secret of the tavern */
export const SPECIAL_FEATURE_NAMES: Record<string, string> = {
  inHouseBrewery:     'hauseigene Brauerei',
  ratInfestation:     'Rattenplage',
  gamblingDen:        'Spielhölle im Hinterzimmer',
  vegetarianOnly:     'nur vegetarische Kost',
  alsoBrothel:        'fungiert auch als Bordell',
  smugglerHideout:    'Schmugglerversteck',
  robberCave:         'Räuberhöhle',
  shrine:             'Schrein (auf 1W20: 1-5: Travia, 6-9: Rahja, 10-12: Peraine, 13-15: Aves, 16-18: Lokalheiliger, 19-20: andere Gottheit)',
  curiosities:        'Sammelsurium (ausgestopfte Tiere, bemalte Teller, Heiligenfiguren, Waffen, Rüstungen, etc.)',
  wantedPosters:      'Aushang mit Steckbriefen',
  dwarfFurniture:     'auch Mobiliar für Zwerge vorhanden',
  noAlcohol:          'kein Alkoholausschank',
  unusualSmell:       'ungewöhnlicher Geruch (Lavendel, Rosenwasser)',
  relayStation:       'Wechselstation für Botenreiter',
  unusuallyDirty:     'ungewöhnlich schmutzig',
  largeSpinetHarp:    'großes Spinett oder eine Standharfe',
  stage:              'Bühne',
  innCat:             'Wirtskatze reibt sich an Heldenbeinen oder springt ihnen unerwartet ins Genick',
  exoticCuisine:      'exotische Küche',
  serialKillerCannibal:'Wirt ist Serienmörder und/oder Kannibale',
};

/** Notable or unusual guests present in the tavern */
export const SPECIAL_GUEST_NAMES: Record<string, string> = {
  moneyChanger:          'Geldwechsler',
  cardPlayingOldMen:     'kartenspielende Altherrenrunde',
  grimMercenaries:       'ein Trupp grimmiger Söldner',
  mysteriousMute:        'mysteriöser, taubstummer Mann',
  mercenaryRecruiter:    'Anwerberin eines Söldnerbanners',
  toothPuller:           'Zahnreißer',
  praiosSchoolClass:     'Klasse einer Praiostagsschule',
  scribe:                'Schreiber',
  travelingSwordFighter: 'reisende Schwertgesellin',
  cityGuard:             'Trupp der Stadtwache',
  exoticDancer:          'exotische Tänzerin',
  craftsmenStammtisch:   'Handwerkerstammtisch',
  messengerRider:        'Botenreiter',
  nineFingeredGuest:     'neunfingriger Gast',
  fugitiveRobberChief:   'flüchtiger Räuberhauptmann',
  incognitoOperaTenor:   'inkognito reisender Operntenor aus Vinsalt',
  highRankingPriest:     'hochrangige Praiosgeweihte mit Gefolge',
  dwarvenGemDealer:      'zwergischer Edelsteinhändler',
  auelfTraveler:         'Auelf(e) auf Reisen',
  halfOrcBirdTrader:     'halborkischer Vogelhändler',
};

// ─── Tavern name generation ────────────────────────────────────────────────

/** Article/adjective prefix — first word group of a compound tavern name */
export const NAME_PART_ONE_NAMES: Record<string, string> = {
  golden:   'Zum/ Zur goldenen ',
  almadinen:'Zum/ Zur almadinenen ',
  dancing:  'Zum/ Zur tanzenden ',
  laughing: 'Zum/ Zur lachenden ',
  drunken:  'Zum/ Zur betrunkenen ',
  happy:    'Zum/ Zur fröhlichen ',
  lucky:    'Zum/ Zur glücklichen ',
  jumping:  'Zum/ Zur springenden ',
  black:    'Zum/ Zur schwarzen ',
  white:    'Zum/ Zur weißen ',
  prancing: 'Zum/ Zur tänzelnden ',
  lonely:   'Zum/ Zur einsamen ',
  emperor:  'Des Kaisers ',
  two:      'Die zwei ',
  three:    'Die drei ',
  four:     'Die vier ',
};

/** Noun in singular form — second word of a compound tavern name */
export const NAME_PART_TWO_SINGULAR_NAMES: Record<string, string> = {
  unicorn:    'Einhorn',
  bull:       'Stier',
  deer:       'Hirsch',
  king:       'König',
  princess:   'Prinzessin',
  boar:       'Keiler',
  eagle:      'Adler',
  crown:      'Krone',
  executioner:'Henker',
  travelers:  'Reisenden',
  jellyfish:  'Qualle',
  dolphin:    'Delphin',
  carp:       'Karpfen',
  pony:       'Pony',
  boot:       'Stiefel',
  vagabonds:  'Vagabunden',
  mare:       'Stute',
  bucket:     'Eimer',
  pilgrim:    'Pilger',
  drum:       'Trommel',
};

/** Noun in plural form — second word when the prefix implies a plural count */
export const NAME_PART_TWO_PLURAL_NAMES: Record<string, string> = {
  unicorn:    'Einhörner',
  bull:       'Stiere',
  deer:       'Hirsche',
  king:       'Könige',
  princess:   'Prinzessinnen',
  boar:       'Keiler',
  eagle:      'Adler',
  crown:      'Kronen',
  executioner:'Henker',
  travelers:  'Reisenden',
  jellyfish:  'Quallen',
  dolphin:    'Delphine',
  carp:       'Karpfen',
  pony:       'Ponys',
  boot:       'Stiefel',
  vagabonds:  'Vagabunden',
  mare:       'Stuten',
  bucket:     'Eimer',
  pilgrim:    'Pilger',
  drum:       'Trommeln',
};

/** Fixed proper names — used when the tavern has a standalone name instead of a generated compound */
export const PROPER_NAME_NAMES: Record<string, string> = {
  mountain: 'Berghof',
  forest:   'Waldhof',
  linde:    'Lindenhof',
  oak:      'Eichenhof',
  emperor:  'Kaiserhof',
  reich:    'Reichshof',
  valpo:    'Valpostube',
  alrik:    'Bei Alrik',
  corner:   'Ums Eck',
  beer:     'Bierschäumme',
  travia:   'Travias Einkehr',
  anker:    'Zum Anker',
};
