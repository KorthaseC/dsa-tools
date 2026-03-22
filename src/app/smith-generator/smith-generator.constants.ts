/** German display names for smith-generator dropdown options and result tables. */

/** Blacksmith qualification levels */
export const QUALIFICATION_NAMES: Record<string, string> = {
  beginner:   'Anfänger',
  apprentice: 'Geselle',
  master:     'Meister',
  specialist: 'Spezialist',
};

/** Craftable item types (weapons and armour) */
export const ITEM_NAMES: Record<string, string> = {
  // Weapons
  crossbows:                  'Armbrüste',
  bows:                       'Bögen',
  daggers:                    'Dolche',
  fencingWeapons:             'Fechtwaffen',
  bludgeoningWeapons:         'Hiebwaffen',
  chainWeapons:               'Kettenwaffen',
  lances:                     'Lanzen',
  whips:                      'Peitschen',
  grappling:                  'Raufen',
  shields:                    'Schilde',
  slings:                     'Schleudern',
  swords:                     'Schwerter',
  polearms:                   'Stangenwaffen',
  throwingWeapons:            'Wurfwaffen',
  twoHandedBludgeoningWeapons:'Zweihandhiebwaffen',
  twoHandedSwords:            'Zweihandschwerter',
  // Armour
  normalCloth:    'Normale Kleidung',
  heavyCloth:     'Schwere Kleidung',
  clothArmor:     'Stoffrüstung',
  leatherArmor:   'Lederrüstung',
  woodenArmor:    'Holzrüstung',
  chainArmor:     'Kettenrüstung',
  scaleArmor:     'Schuppenrüstung',
  plateArmor:     'Plattenrüstung',
  tournamentArmor:'Turnierrüstung',
};

/** Crafting materials — standard metals, wood/bone, and magical alloys */
export const MATERIAL_NAMES: Record<string, string> = {
  // Standard metals
  steel:    'Stahl',
  bronze:   'Bronze',
  iron:     'Eisen',
  grassoden:'Grassodenerz',
  // Regional steels
  fluSteel: 'Großer Fluss-Stahl',
  kunchomer:'Khunchomer Stahl',
  maraskan: 'Maraskanstahl',
  mirhamer: 'Mirhamer Stahl',
  premer:   'Premer Stahl',
  toschkril:'Toschkril',
  uhdenber: 'Uhdenberger Stahl',
  dwarf:    'Zwergenstahl',
  // Wood & organic
  ebenwood: 'Ebenholz',
  ironwood: 'Eisenbaum',
  stonewood:'Steineiche',
  zykolp:   'Zyklopenzeder',
  horn:     'Horn',
  bone:     'Knochen',
  // Rare / magical
  vulcan:   'Vulkanglas',
  fire:     'Feuerstein',
  // Mindorium alloys (% indicates magical infusion level)
  mindorium10:  'Mindorium 10%',
  mindorium25:  'Mindorium 25%',
  mindorium50:  'Mindorium 50%',
  mindorium75:  'Mindorium 75%',
  mindorium100: 'Mindorium 100%',
  // Arkanium alloys
  arkanium10:   'Arkanium 10%',
  arkanium25:   'Arkanium 25%',
  arkanium50:   'Arkanium 50%',
  arkanium75:   'Arkanium 75%',
  arkanium100:  'Arkanium 100%',
  // Endurium alloys
  endurium10:  'Endurium 10%',
  endurium25:  'Endurium 25%',
  endurium50:  'Endurium 50%',
  endurium100: 'Endurium 100%',
  // Titanium alloys
  titanium10:  'Titanium 10%',
  titanium25:  'Titanium 25%',
  titanium50:  'Titanium 50%',
  titanium100: 'Titanium 100%',
  // Meteorite iron
  meteor1: 'gewöhnliches Meteoreisen',
  meteor2: 'schweres Meteoreisen',
  // Restriction hints (referenced by MaterialProperties.tooltip)
  tooltip1: 'Nur bestimmte Waffen/Rüstungen, etwa Speere, Beile und Messer eignen sich als Steinwaffen.',
  tooltip2: 'Aus diesen Materialien lassen sich nur Streitkolben, Rabenschnäbel, Morgensterne und ähnliche Wuchtwaffen ohne Klinge herstellen.',
  tooltip3: 'Aus diesen Materialien lassen sich nur Plattenrüstungen herstellen.',
  // Textile / leather
  droler:   'Drôler Stoff',
  phrai:    'Phraischafwolle',
  iryan:    'Iryanleder',
  woolnose: 'Wollnashornleder',
};

/** Optional stat bonuses that can be applied to the crafted item */
export const BONI_NAMES: Record<string, string> = {
  none:        'Keine',
  attack:      '+1 AT-Modifikator',
  parade:      '+1 PA-Modifikator',
  damage:      '+1 TP',
  range:       '+10 % Reichweite von Fernkampfwaffen',
  breakfactor: '+1 Bruchfaktorwert',
  armor:       '+1 RS',
  speed:       'Ignorieren von -1 GS durch BE oder zusätzliche Abzüge',
  initiative:  'Ignorieren von -1 INI durch BE oder zusätzliche Abzüge',
  stability:   '+1 Stabilitätswert',
};

/** Advanced crafting techniques that modify the production process */
export const CRAFT_TECHNIC_NAMES: Record<string, string> = {
  none:       'Keine',
  falt:       'Fältungstechnik',
  lehm:       'Lehmbacktechnik',
  chainBuild: 'Filigranes Kettenknüpfen',
};

/** Magic effects of meteor iron — rolled when meteorite material is used */
export const METEOR_EFFECT_NAMES: Record<string, string> = {
  magic:    'Das Objekt ist permanent magisch.',
  vibrating:'Das Objekt vibriert bei Vollmond.',
  damage:   'Das Objekt verursacht +2 TP gegen Wesen, die nicht aus der 3. Sphäre stammen.',
  voices:   'Der Träger des Objekts hört alle 1W6 Tage wispernde Stimmen in einer ihm unbekannten Sprache.',
  invisible:'Bei Vollmond ist das Objekt voll zu sehen, aber es wird mit abnehmendem Mond immer durchscheinender. Während des Neumonds ist das Objekt praktisch unsichtbar.',
  wolves:   'Wölfe in bis zu 9 Meilen Entfernung beschützen den Träger des Objekts und heulen jede Nacht.',
  life:     'Der Träger verliert jeden Tag 1 LeP, der von dem Objekt aufgenommen wird.',
  magentic: 'Das Objekt ist magnetisch.',
  focus:    'Für den Träger sind Beschwörungen von außersphärischen Wesen bei 1-3 auf W6 um 1 erleichtert, bei 4-6 um 1 erschwert, wenn das Objekt als Fokus benutzt wird.',
  gravity:  'Einmal alle 1W6 Tage wird die Schwerkraft in einem Radius von 9 Schritt für 1W20 Sekunden außer Kraft gesetzt.',
  fluid:    'Der Gegenstand verflüssigt sich nach 1W20 Tagen.',
};
