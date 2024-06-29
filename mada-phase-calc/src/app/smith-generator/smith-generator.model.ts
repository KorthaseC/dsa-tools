export enum BlacksmithQualification {
  Beginner = 'beginner',
  Apprentice = 'apprentice',
  Master = 'master',
  Specialist = 'specialist',
}

export interface BlacksmithProperties {
  attribute: number;
  talent: number;
  priceRange: PriceRange;
}

export interface PriceRange {
  min: number;
  max: number;
  step: number;
  startPrice: number;
}

export const blacksmithPriceRange = new Map<
  BlacksmithQualification,
  BlacksmithProperties
>([
  [
    BlacksmithQualification.Beginner,
    {
      attribute: 10,
      talent: 7,
      priceRange: { min: 0.1, max: 0.9, step: 0.01, startPrice: 0.1 },
    },
  ],
  [
    BlacksmithQualification.Apprentice,
    {
      attribute: 10,
      talent: 7,
      priceRange: { min: 1, max: 4, step: 0.01, startPrice: 1 },
    },
  ],
  [
    BlacksmithQualification.Master,
    {
      attribute: 10,
      talent: 7,
      priceRange: { min: 5, max: 9, step: 0.01, startPrice: 5 },
    },
  ],
  [
    BlacksmithQualification.Specialist,
    {
      attribute: 10,
      talent: 7,
      priceRange: { min: 10, max: 50, step: 0.01, startPrice: 10 },
    },
  ],
]);

export enum Material {
  Steel = 'steel',
  Bronze = 'bronze',
  Iron = 'iron',
  Grassoden = 'grassoden',
  FluSteel = 'fluSteel',
  Kunchomer = 'kunchomer',
  Maraskan = 'maraskan',
  Mirhamer = 'mirhamer',
  Premer = 'premer',
  Toschkril = 'toschkril',
  Uhdenber = 'uhdenber',
  Dwarf = 'dwarf',
  Ebenwood = 'ebenwood',
  Ironwood = 'ironwood',
  Stonewood = 'stonewood',
  Zykolp = 'zykolp',
  Horn = 'horn',
  Bone = 'bone',
  Vulcan = 'vulcan',
  Fire = 'fire',
  Mindorium10 = 'mindorium10',
  Mindorium25 = 'mindorium25',
  Mindorium50 = 'mindorium50',
  Mindorium75 = 'mindorium75',
  Mindorium100 = 'mindorium100',
  Arkanium10 = 'arkanium10',
  Arkanium25 = 'arkanium25',
  Arkanium50 = 'arkanium50',
  Arkanium75 = 'arkanium75',
  Arkanium100 = 'arkanium100',
  Endurium10 = 'endurium10',
  Endurium25 = 'endurium25',
  Endurium50 = 'endurium50',
  Endurium100 = 'endurium100',
  Titanium10 = 'titanium10',
  Titanium25 = 'titanium25',
  Titanium50 = 'titanium50',
  Titanium100 = 'titanium100',
  Meteor1 = 'meteor1',
  Meteor2 = 'meteor2',
  Droler = 'droler',
  Phrai = 'phrai',
  Iryan = 'iryan',
  Woolnose = 'woolnose',
}

export const weaponMaterial: Material[] = [
  Material.Steel,
  Material.Bronze,
  Material.Iron,
  Material.Grassoden,
  Material.FluSteel,
  Material.Kunchomer,
  Material.Maraskan,
  Material.Mirhamer,
  Material.Premer,
  Material.Toschkril,
  Material.Uhdenber,
  Material.Dwarf,
  Material.Ebenwood,
  Material.Ironwood,
  Material.Stonewood,
  Material.Zykolp,
  Material.Horn,
  Material.Bone,
  Material.Vulcan,
  Material.Fire,
  Material.Mindorium50,
  Material.Mindorium75,
  Material.Mindorium100,
  Material.Arkanium50,
  Material.Arkanium75,
  Material.Arkanium100,
  Material.Endurium25,
  Material.Endurium50,
  Material.Endurium100,
  Material.Titanium25,
  Material.Titanium50,
  Material.Titanium100,
  Material.Meteor1,
  Material.Meteor2,
];

export const armorMaterial: Material[] = [
  Material.Steel,
  Material.Bronze,
  Material.FluSteel,
  Material.Kunchomer,
  Material.Maraskan,
  Material.Mirhamer,
  Material.Premer,
  Material.Toschkril,
  Material.Uhdenber,
  Material.Dwarf,
  Material.Ebenwood,
  Material.Ironwood,
  Material.Stonewood,
  Material.Zykolp,
  Material.Horn,
  Material.Bone,
  Material.Droler,
  Material.Phrai,
  Material.Iryan,
  Material.Woolnose,
  Material.Mindorium10,
  Material.Mindorium25,
  Material.Arkanium10,
  Material.Arkanium25,
  Material.Endurium10,
  Material.Endurium25,
  Material.Endurium100,
  Material.Titanium10,
  Material.Titanium25,
  Material.Titanium100,
  Material.Meteor1,
  Material.Meteor2,
];

export const weaponMaterialMetal: Material[] = [
  Material.Steel,
  Material.Bronze,
  Material.Iron,
  Material.Grassoden,
  Material.FluSteel,
  Material.Kunchomer,
  Material.Maraskan,
  Material.Mirhamer,
  Material.Premer,
  Material.Toschkril,
  Material.Uhdenber,
  Material.Dwarf,
  Material.Mindorium50,
  Material.Mindorium75,
  Material.Mindorium100,
  Material.Arkanium50,
  Material.Arkanium75,
  Material.Arkanium100,
  Material.Endurium25,
  Material.Endurium50,
  Material.Endurium100,
  Material.Titanium25,
  Material.Titanium50,
  Material.Titanium100,
  Material.Meteor1,
  Material.Meteor2,
];

export enum WeaponType {
  Crossbows = 'crossbows',
  Bows = 'bows',
  Daggers = 'daggers',
  FencingWeapons = 'fencingWeapons',
  BludgeoningWeapons = 'bludgeoningWeapons',
  ChainWeapons = 'chainWeapons',
  Lances = 'lances',
  Whips = 'whips',
  Grappling = 'grappling',
  Shields = 'shields',
  Slings = 'slings',
  Swords = 'swords',
  Polearms = 'polearms',
  ThrowingWeapons = 'throwingWeapons',
  TwoHandedBludgeoningWeapons = 'twoHandedBludgeoningWeapons',
  TwoHandedSwords = 'twoHandedSwords',
}

export enum ArmorType {
  NormalCloth = 'normalCloth',
  HeavyCloth = 'heavyCloth',
  ClothArmor = 'clothArmor',
  LeatherArmor = 'leatherArmor',
  WoodenArmor = 'woodenArmor',
  ChainArmor = 'chainArmor',
  ScaleArmor = 'scaleArmor',
  PlateArmor = 'plateArmor',
  TournamentArmor = 'tournamentArmor',
}

export interface TypeProperties {
  interval: number;
  specificMaterial?: Material[];
}

export const weaponProperties = new Map<WeaponType, TypeProperties>([
  [WeaponType.Crossbows, { interval: 3 }],
  [WeaponType.Bows, { interval: 0.75 }],
  [WeaponType.Daggers, { interval: 0.5 }],
  [WeaponType.FencingWeapons, { interval: 1 }],
  [WeaponType.BludgeoningWeapons, { interval: 0.25 }],
  [WeaponType.ChainWeapons, { interval: 0.75 }],
  [WeaponType.Lances, { interval: 0.25 }],
  [WeaponType.Whips, { interval: 0.25 }],
  [WeaponType.Grappling, { interval: 0.25 }],
  [WeaponType.Shields, { interval: 0.5 }],
  [WeaponType.Slings, { interval: 0.125 }],
  [WeaponType.Swords, { interval: 1 }],
  [WeaponType.Polearms, { interval: 0.75 }],
  [WeaponType.ThrowingWeapons, { interval: 0.5 }],
  [WeaponType.TwoHandedBludgeoningWeapons, { interval: 1 }],
  [WeaponType.TwoHandedSwords, { interval: 1 }],
]);

export const armorProperties = new Map<ArmorType, TypeProperties>([
  [ArmorType.NormalCloth, { interval: 0.25 }],
  [ArmorType.HeavyCloth, { interval: 0.25 }],
  [ArmorType.ClothArmor, { interval: 0.375 }],
  [ArmorType.LeatherArmor, { interval: 0.75 }],
  [ArmorType.WoodenArmor, { interval: 1 }],
  [ArmorType.ChainArmor, { interval: 1 }],
  [ArmorType.ScaleArmor, { interval: 1.5 }],
  [ArmorType.PlateArmor, { interval: 1 }],
  [ArmorType.TournamentArmor, { interval: 2 }],
]);

export interface MaterialProperties {
  price: number;
  modWeapon?: WeaponModifier;
  modArmor?: number;
  breakfactor?: number;
  stability?: number;
  effectWeapon?: string;
  effectArmor?: string;
  tooltip?: string;
  craftingTries: number;
}

export interface WeaponModifier {
  generalMod: number;
  technicMod?: WeaponTechnicModifier[];
}

export interface WeaponTechnicModifier {
  technic: string;
  mod: number;
}

export const materialProperties = new Map<Material, MaterialProperties>([
  [
    Material.Steel,
    {
      price: 0,
      modWeapon: { generalMod: 0 },
      modArmor: 0,
      breakfactor: 0,
      stability: 0,
      craftingTries: 7,
    },
  ],
  [
    Material.Bronze,
    {
      price: 40,
      modWeapon: { generalMod: 1 },
      modArmor: 2,
      breakfactor: -4,
      stability: -4,
      effectWeapon: '-1 TP',
      effectArmor: '-1 RS',
      craftingTries: 7,
    },
  ],
  [
    Material.Iron,
    {
      price: 8,
      modWeapon: { generalMod: 1 },
      breakfactor: -2,
      effectWeapon: '-1 TP',
      craftingTries: 7,
    },
  ],
  [
    Material.Grassoden,
    {
      price: 0,
      modWeapon: { generalMod: -1 },
      breakfactor: -2,
      craftingTries: 7,
    },
  ],
  [
    Material.FluSteel,
    {
      price: 0,
      modWeapon: { generalMod: 0 },
      modArmor: 0,
      breakfactor: 0,
      craftingTries: 7,
    },
  ],
  [
    Material.Kunchomer,
    {
      price: 0,
      modWeapon: {
        generalMod: 0,
        technicMod: [
          { technic: WeaponType.FencingWeapons, mod: -1 },
          { technic: WeaponType.Swords, mod: 1 },
        ],
      },
      breakfactor: 0,
      stability: -1,
      effectArmor: 'Abzüge auf INI durch BE können ignoriert werden',
      craftingTries: 7,
    },
  ],
  [
    Material.Maraskan,
    {
      price: 65,
      modWeapon: { generalMod: 1 },
      modArmor: 1,
      breakfactor: 1,
      stability: 1,
      craftingTries: 7,
    },
  ],
  [
    Material.Mirhamer,
    {
      price: 0,
      breakfactor: 0,
      stability: 0,
      effectWeapon: 'Resistenz gegen Rost',
      effectArmor: 'Resistenz gegen Rost',
      craftingTries: 7,
    },
  ],
  [
    Material.Premer,
    {
      price: 0,
      modWeapon: { generalMod: -1 },
      modArmor: 1,
      breakfactor: 0,
      stability: 0,
      craftingTries: 7,
    },
  ],
  [
    Material.Toschkril,
    {
      price: 750,
      modWeapon: { generalMod: -3 },
      modArmor: -3,
      breakfactor: 4,
      stability: 4,
      effectWeapon: '+2 TP, Resistenz gegen Säure',
      effectArmor: '+1 RS',
      craftingTries: 5,
    },
  ],
  [
    Material.Uhdenber,
    {
      price: 0,
      modWeapon: { generalMod: -1 },
      modArmor: -1,
      breakfactor: 0,
      stability: 0,
      craftingTries: 7,
    },
  ],
  [
    Material.Dwarf,
    {
      price: 160,
      modWeapon: { generalMod: 2 },
      modArmor: 2,
      breakfactor: 2,
      stability: 2,
      craftingTries: 7,
    },
  ],
  [
    Material.Ebenwood,
    {
      price: 20,
      modWeapon: {
        generalMod: 0,
        technicMod: [{ technic: WeaponType.Bows, mod: 2 }],
      },
      modArmor: -1,
      breakfactor: 1,
      stability: 1,
      craftingTries: 7,
    },
  ],
  [
    Material.Ironwood,
    {
      price: 80,
      modWeapon: { generalMod: -2 },
      modArmor: -2,
      breakfactor: 3,
      stability: 3,
      effectWeapon: '+1 TP',
      effectArmor: 'Abzüge auf GS und INI durch BE können ignoriert werden',
      craftingTries: 7,
    },
  ],
  [
    Material.Stonewood,
    {
      price: 75,
      modWeapon: { generalMod: -1 },
      modArmor: -1,
      breakfactor: 4,
      stability: 4,
      effectWeapon: '+1 TP',
      effectArmor: '+1 RS, +2 BE',
      craftingTries: 7,
    },
  ],
  [
    Material.Zykolp,
    {
      price: 15,
      modWeapon: { generalMod: 1 },
      modArmor: 1,
      breakfactor: 0,
      stability: 0,
      craftingTries: 7,
    },
  ],
  [
    Material.Horn,
    {
      price: 10,
      modWeapon: { generalMod: 1 },
      modArmor: -1,
      breakfactor: -2,
      stability: -2,
      effectWeapon: '-1',
      tooltip: 'tooltip1',
      craftingTries: 7,
    },
  ],
  [
    Material.Bone,
    {
      price: 10,
      modWeapon: { generalMod: 0 },
      modArmor: -1,
      breakfactor: -2,
      stability: -2,
      effectWeapon: '-2',
      tooltip: 'tooltip1',
      craftingTries: 7,
    },
  ],
  [
    Material.Vulcan,
    {
      price: 15,
      modWeapon: { generalMod: 2 },
      breakfactor: -2,
      effectWeapon: '-1 TP',
      tooltip: 'tooltip1',
      craftingTries: 7,
    },
  ],
  [
    Material.Fire,
    {
      price: 5,
      modWeapon: { generalMod: -4 },
      breakfactor: 1,
      effectWeapon: '-1 TP gegen Metallrüstungen',
      tooltip: 'tooltip1',
      craftingTries: 7,
    },
  ],
  [
    Material.Mindorium10,
    {
      price: 200,
      modArmor: -2,
      stability: 0,
      effectArmor: '+1 RS gegen Geister, Rüstung magisch',
      craftingTries: 7,
    },
  ],
  [
    Material.Mindorium25,
    {
      price: 500,
      modArmor: -4,
      stability: 0,
      effectArmor: '+2 RS gegen Geister, Rüstung magisch',
      craftingTries: 7,
    },
  ],
  [
    Material.Mindorium50,
    {
      price: 1000,
      modWeapon: { generalMod: 0 },
      breakfactor: -1,
      effectWeapon: '+1 TP gegen magische Wesen, Waffe magisch',
      craftingTries: 7,
    },
  ],
  [
    Material.Mindorium75,
    {
      price: 1500,
      modWeapon: { generalMod: -1 },
      breakfactor: -1,
      effectWeapon:
        '+1 TP gegen magische Wesen, doppelter Schaden gegen Geister (dafür kein Bonus-TP von +1), Waffe magisch',
      craftingTries: 7,
    },
  ],
  [
    Material.Mindorium100,
    {
      price: 2000,
      modWeapon: { generalMod: -2 },
      breakfactor: -1,
      effectWeapon:
        '+2 TP gegen magische Wesen, doppelter Schaden gegen Geister (dafür keine Bonus-TP von +2), Waffe magisch',
      craftingTries: 7,
    },
  ],
  [
    Material.Arkanium10,
    {
      price: 2000,
      modArmor: -3,
      stability: 0,
      effectArmor: '+1 RS gegen magische Angriffe, Rüstung magisch',
      tooltip: 'tooltip3',
      craftingTries: 7,
    },
  ],
  [
    Material.Arkanium25,
    {
      price: 5000,
      modArmor: -6,
      stability: 0,
      effectArmor: '+2 RS gegen magische Angriffe, Rüstung magisch',
      tooltip: 'tooltip3',
      craftingTries: 7,
    },
  ],
  [
    Material.Arkanium50,
    {
      price: 10000,
      modWeapon: { generalMod: 0 },
      breakfactor: -1,
      stability: 0,
      effectWeapon: '+2 TP gegen magische Wesen, Waffe magisch',
      tooltip: 'tooltip2',
      craftingTries: 7,
    },
  ],
  [
    Material.Arkanium75,
    {
      price: 15000,
      modWeapon: { generalMod: -1 },
      breakfactor: 0,
      stability: 0,
      effectWeapon: '+3 TP gegen magische Wesen, Waffe magisch',
      tooltip: 'tooltip2',
      craftingTries: 7,
    },
  ],
  [
    Material.Arkanium100,
    {
      price: 20000,
      modWeapon: { generalMod: -2 },
      breakfactor: 1,
      stability: 0,
      effectWeapon: '+4 TP gegen magische Wesen, Waffe magisch',
      tooltip: 'tooltip2',
      craftingTries: 7,
    },
  ],
  [
    Material.Endurium10,
    {
      price: 12000,
      modArmor: -2,
      stability: 1,
      effectArmor: '+1 RS, Rüstung magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Endurium25,
    {
      price: 30000,
      modWeapon: { generalMod: -3 },
      modArmor: -3,
      breakfactor: 1,
      stability: 2,
      effectWeapon: '+1 TP, Waffe magisch',
      effectArmor: '+2 RS, Rüstung magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Endurium50,
    {
      price: 60000,
      modWeapon: { generalMod: -3 },
      breakfactor: 2,
      effectWeapon: '+1 TP, +1 AT-Mod, Waffe magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Endurium100,
    {
      price: 120000,
      modWeapon: { generalMod: -3 },
      modArmor: -4,
      breakfactor: 4,
      stability: 8,
      effectWeapon: '+2 TP, +1 AT-Mod, Waffe magisch',
      effectArmor: '	+3 RS, Rüstung magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Titanium10,
    {
      price: 30000,
      modArmor: -5,
      stability: 5,
      effectArmor:
        '+2 RS, Abzüge auf GS und INI durch BE können ignoriert werden, Rüstung magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Titanium25,
    {
      price: 50000,
      modWeapon: { generalMod: -5 },
      modArmor: -6,
      breakfactor: 5,
      stability: 10,
      effectArmor:
        '+3 RS, Abzüge auf GS und INI durch BE können ignoriert werden, Rüstung magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Titanium50,
    {
      price: 100000,
      modWeapon: { generalMod: -5 },
      breakfactor: 10,
      effectWeapon: '	+3 TP, +1 AT-Mod, unzerbrechlich, Waffe magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Titanium100,
    {
      price: 200000,
      modWeapon: { generalMod: -5 },
      modArmor: -7,
      breakfactor: 15,
      stability: 15,
      effectWeapon: '+4 TP, +1 AT-Mod, unzerbrechlich, Waffe magisch',
      effectArmor:
        '+4 RS, Abzüge auf GS und INI durch BE können ignoriert werden, Rüstung magisch',
      craftingTries: 5,
    },
  ],
  [
    Material.Meteor1,
    {
      price: 50,
      modWeapon: { generalMod: -3 },
      modArmor: -3,
      breakfactor: 0,
      stability: 2,
      effectWeapon: 'effect',
      effectArmor: 'effect',
      craftingTries: 7,
    },
  ],
  [
    Material.Meteor2,
    {
      price: 80,
      modWeapon: { generalMod: -4 },
      modArmor: -4,
      breakfactor: 0,
      stability: 4,
      effectWeapon: '+2 TP, effect',
      effectArmor: '+4 RS, effect',
      craftingTries: 7,
    },
  ],
  [Material.Droler, { price: 20, modArmor: 1, stability: 0, craftingTries: 7 }],
  [
    Material.Phrai,
    {
      price: 25,
      modArmor: 0,
      stability: 1,
      effectArmor: 'Abzüge auf GS durch BE können ignoriert werden',
      craftingTries: 7,
    },
  ],
  [
    Material.Iryan,
    {
      price: 30,
      modArmor: 1,
      stability: 0,
      effectArmor: 'feuerfest',
      craftingTries: 7,
    },
  ],
  [
    Material.Woolnose,
    {
      price: 30,
      modArmor: -1,
      stability: 1,
      effectArmor: 'kein Schaden durch Messergras',
      craftingTries: 7,
    },
  ],
]);

export enum WeaponBoni {
  None = 'none',
  Attack = 'attack',
  Parade = 'parade',
  Damage = 'damage',
  Range = 'range',
  Breakfactor = 'breakfactor',
}

export enum ArmorBoni {
  None = 'none',
  Armor = 'armor',
  Speed = 'speed',
  Initiative = 'initiative',
  Stability = 'stability',
}

export interface BoniProperties {
  diceModifier: number;
  intervalModifier: number;
}

export const boniProperties = new Map<WeaponBoni | ArmorBoni, BoniProperties>([
  [WeaponBoni.None, { diceModifier: 0, intervalModifier: 0 }],
  [WeaponBoni.Attack, { diceModifier: -1, intervalModifier: 2 }],
  [WeaponBoni.Parade, { diceModifier: -2, intervalModifier: 3 }],
  [WeaponBoni.Damage, { diceModifier: -1, intervalModifier: 4 }],
  [WeaponBoni.Range, { diceModifier: -1, intervalModifier: 3 }],
  [WeaponBoni.Breakfactor, { diceModifier: -1, intervalModifier: 1.5 }],
  [ArmorBoni.None, { diceModifier: 0, intervalModifier: 0 }],
  [ArmorBoni.Armor, { diceModifier: -5, intervalModifier: 5 }],
  [ArmorBoni.Speed, { diceModifier: -1, intervalModifier: 2 }],
  [ArmorBoni.Initiative, { diceModifier: -1, intervalModifier: 2 }],
  [ArmorBoni.Stability, { diceModifier: -1, intervalModifier: 1.5 }],
]);

export enum CraftTechnic {
  None = 'none',
  Falt = 'falt',
  Lehm = 'lehm',
  ChainBuild = 'chain',
}

export interface CraftProperties {
  diceModifier: number;
  intervalModifier: number;
}

export const craftProperties = new Map<CraftTechnic, CraftProperties>([
  [CraftTechnic.None, { diceModifier: 0, intervalModifier: 0 }],
  [CraftTechnic.Falt, { diceModifier: -1, intervalModifier: 5 }],
  [CraftTechnic.Lehm, { diceModifier: 1, intervalModifier: 3 }],
  [CraftTechnic.ChainBuild, { diceModifier: -1, intervalModifier: 3 }],
]);

export enum MeteorEffect {
  Magic = 'magic',
  Vibrating = 'vibrating',
  Damage = 'damage',
  Voices = 'voices',
  Invisible = 'invisible',
  Wolves = 'wolves',
  Life = 'life',
  Magnetic = 'magentic',
  Focus = 'focus',
  Gravity = 'gravity',
  Fluid = 'fluid',
}

export interface MeteorDiceResult {
  diceValueRange: [number, number];
  meteorEffect: MeteorEffect;
}

export const meteorEffects: MeteorDiceResult[] = [
  { diceValueRange: [1, 3], meteorEffect: MeteorEffect.Magic },
  { diceValueRange: [4, 5], meteorEffect: MeteorEffect.Vibrating },
  { diceValueRange: [6, 6], meteorEffect: MeteorEffect.Damage },
  { diceValueRange: [7, 9], meteorEffect: MeteorEffect.Voices },
  { diceValueRange: [10, 11], meteorEffect: MeteorEffect.Invisible },
  { diceValueRange: [12, 12], meteorEffect: MeteorEffect.Wolves },
  { diceValueRange: [13, 13], meteorEffect: MeteorEffect.Life },
  { diceValueRange: [14, 15], meteorEffect: MeteorEffect.Magnetic },
  { diceValueRange: [16, 18], meteorEffect: MeteorEffect.Focus },
  { diceValueRange: [19, 19], meteorEffect: MeteorEffect.Gravity },
  { diceValueRange: [20, 20], meteorEffect: MeteorEffect.Fluid },
];
