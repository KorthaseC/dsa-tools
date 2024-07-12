import {
  AlchemyDiceResult,
  AlchemyQSResult,
  PurityOption,
} from './alcheny.models';

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
  { text: 'alchemy.purityIngedients.minHalfImpure', mod: -2 },
  { text: 'alchemy.purityIngedients.minOneImpure', mod: -1 },
  { text: 'alchemy.purityIngedients.allMinSufficient', mod: 0 },
  { text: 'alchemy.purityIngedients.allMinPure', mod: +1 },
  { text: 'alchemy.purityIngedients.minOneHighPure', mod: +2 },
  { text: 'alchemy.purityIngedients.allMinHighPure', mod: +3 },
];

export const PURITY_OPTIONS_STIMULANT: PurityOption[] = [
  { text: 'alchemy.purityIngedients.minHalfImpure', mod: 2, qs: -2 },
  { text: 'alchemy.purityIngedients.minOneImpure', mod: 1, qs: -1 },
  { text: 'alchemy.purityIngedients.allMinSufficient', mod: 1, qs: 0 },
  { text: 'alchemy.purityIngedients.minOneHighPure', mod: -1, qs: 2 },
  { text: 'alchemy.purityIngedients.allMinHighPure', mod: -1, qs: 3 },
];

export const ELIXIR_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 3], alchemicResult: 'alchemy.application.ingestion' },
  { diceValueRange: [4, 5], alchemicResult: 'alchemy.application.contact' },
  { diceValueRange: [6, 6], alchemicResult: 'alchemy.application.inhalation' },
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
        alchemicResult: 'alchemy.elixir.strengthening.mu',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.at',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.weaponSharpness',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.elixir.strengthening.in',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.ff',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.transformation',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.elixir.strengthening.ko',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.ge',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.ini',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.elixir.strengthening.kl',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.fk',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.aw',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.elixir.strengthening.ch',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.gs',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.be',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.elixir.strengthening.kk',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.rs',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.pa',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.elixir.strengthening.sk',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.magicPaste',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.invisibility',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.elixir.strengthening.sk',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 12],
        alchemicResult: 'alchemy.elixir.strengthening.divinePaste',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [13, 18],
        alchemicResult: 'alchemy.elixir.strengthening.zk',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
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
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.lep',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.antidote',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.lep',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.antidote',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.lep',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.antidote',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.lep',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.antidote',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.lep',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.antidote',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.lep',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.antidote',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.asp',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.asp',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.healing.schip',
      },
      {
        diceValueRange: [2, 13],
        alchemicResult: 'alchemy.elixir.healing.kap',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 18],
        alchemicResult: 'alchemy.elixir.healing.kap',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
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
        alchemicResult: 'alchemy.elixir.talent.combat',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.talent.physical',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.talent.nature',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.talent.knowledge',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.talent.social',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.talent.craft',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.talent.spell',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.talent.liturgy',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
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
        alchemicResult: 'alchemy.elixir.elemental.fireImmunity',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.elemental.underwaterBreathing',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.elixir.elemental.poisonImmunity4',
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.elemental.poisonImmunity4',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.elemental.coldImmunity',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.elemental.flying',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.elemental.darkVision',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.elemental.magicVision',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
      },
    ],
  ],
  [
    ElementsAlchemy.Divine,
    [
      {
        diceValueRange: [1, 18],
        alchemicResult: 'alchemy.elixir.elemental.mission',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [19, 19],
        alchemicResult: 'alchemy.potion.ineffective',
        category: EffectCategory.Ineffectiv,
      },
      {
        diceValueRange: [20, 20],
        alchemicResult: 'alchemy.potion.chaoticEffect',
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
        alchemicResult: 'alchemy.elixir.duration.inOneHour',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.inFiveMinutes',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.inOneMinute',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.inOneMinute',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.inThirtyKR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.inThirtyKR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.inFifteenKR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.inFifteenKR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.inFiveKR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.inFiveKR',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.A,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.A,
      },
    ],
  ],
  [
    AlchemicCategory.B,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.oneDay',
        category: AlchemicCategory.B,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.oneDay',
        category: AlchemicCategory.B,
      },
    ],
  ],
  [
    AlchemicCategory.E,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.oneDay',
        category: AlchemicCategory.E,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.oneDay',
        category: AlchemicCategory.E,
      },
    ],
  ],
  [
    AlchemicCategory.U,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.oneDay',
        category: AlchemicCategory.U,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.oneDay',
        category: AlchemicCategory.U,
      },
    ],
  ],
  [
    AlchemicCategory.H,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.nextRegen',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.nextRegen',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.nextRegen',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.nextRegen',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.inOneDSixHours',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.inOneDSixHours',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.inOneHour',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.inOneHour',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.inOneMinute',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.inOneMinute',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.inThirtyKR',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.inTenKR',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.inTenKR',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.H,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.immediately',
        category: AlchemicCategory.H,
      },
    ],
  ],
  [
    AlchemicCategory.K,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.twentyKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.twentyKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.fortyKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.fortyKR',
        category: AlchemicCategory.K,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.K,
      },
    ],
  ],
  [
    AlchemicCategory.M,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.twentyKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.twentyKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.fortyKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.fortyKR',
        category: AlchemicCategory.M,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.M,
      },
    ],
  ],
  [
    AlchemicCategory.T,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.oneKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.fiveKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.tenKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.twentyKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.twentyKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.fortyKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.fortyKR',
        category: AlchemicCategory.T,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.T,
      },
    ],
  ],
  [
    AlchemicCategory.V,
    [
      {
        diceValueRange: [0, 0],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [1, 1],
        alchemicResult: 'alchemy.elixir.duration.thirtyKR',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [2, 2],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [3, 3],
        alchemicResult: 'alchemy.elixir.duration.oneMinute',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [4, 4],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [5, 5],
        alchemicResult: 'alchemy.elixir.duration.fiveMinutes',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [7, 7],
        alchemicResult: 'alchemy.elixir.duration.tenMinutes',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [8, 8],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [9, 9],
        alchemicResult: 'alchemy.elixir.duration.qsHours',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [10, 10],
        alchemicResult: 'alchemy.elixir.duration.oneDay',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [11, 11],
        alchemicResult: 'alchemy.elixir.duration.oneWeek',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [12, 12],
        alchemicResult: 'alchemy.elixir.duration.oneWeek',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [13, 13],
        alchemicResult: 'alchemy.elixir.duration.oneYear',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [14, 14],
        alchemicResult: 'alchemy.elixir.duration.tenYears',
        category: AlchemicCategory.V,
      },
      {
        diceValueRange: [15, 15],
        alchemicResult: 'alchemy.elixir.duration.permanent',
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
        alchemicResult: 'alchemy.elixir.qsEffect.neutralizedPoisons1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.neutralizedPoisons2',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.neutralizedPoisons3',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.neutralizedPoisons4',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.neutralizedPoisons5',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.neutralizedPoisons6',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.neutralizedPoisons7',
      },
    ],
  ],
  [
    AlchemicCategory.B,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.burdenMinus1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.burdenMinus1Star',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.burdenMinus2',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.burdenMinus2Star',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.burdenMinus3',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.burdenMinus3Star',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.burdenMinus4',
      },
    ],
  ],
  [
    AlchemicCategory.E,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.plus1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.plus1Star',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.plus2',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.plus2Star',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.plus3',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.plus3Star',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.plus4',
      },
    ],
  ],
  [
    AlchemicCategory.K,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.plus1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.plus1Star',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.plus2',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.plus2Star',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.plus3',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.plus3Star',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.plus4',
      },
    ],
  ],
  [
    AlchemicCategory.H,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.healing1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.healing2',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.healing3',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.healing4',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.healing5',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.healing6',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.healing7',
      },
    ],
  ],
  [
    AlchemicCategory.M,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.magic1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.magic1',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.magic2',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.magic2',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.magic3',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.magic3',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.magic4',
      },
    ],
  ],
  [
    AlchemicCategory.T,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.tp1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.tp2',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.tp3',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.tp4',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.tp5',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.tp6',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.tp7',
      },
    ],
  ],
  [
    AlchemicCategory.U,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.invisible1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.invisible2',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.invisible2',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.invisible3',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.invisible3',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.invisible4',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.invisible4',
      },
    ],
  ],
  [
    AlchemicCategory.V,
    [
      {
        qs: 1,
        alchemicResult: 'alchemy.elixir.qsEffect.transform1',
      },
      {
        qs: 2,
        alchemicResult: 'alchemy.elixir.qsEffect.transform1',
      },
      {
        qs: 3,
        alchemicResult: 'alchemy.elixir.qsEffect.transform2',
      },
      {
        qs: 4,
        alchemicResult: 'alchemy.elixir.qsEffect.transform3',
      },
      {
        qs: 5,
        alchemicResult: 'alchemy.elixir.qsEffect.transform4',
      },
      {
        qs: 6,
        alchemicResult: 'alchemy.elixir.qsEffect.transform5',
      },
      {
        qs: 7,
        alchemicResult: 'alchemy.elixir.qsEffect.transform6',
      },
    ],
  ],
]);

//--------poision------------//
export const POISON_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 8], alchemicResult: 'alchemy.application.ingestion' },
  { diceValueRange: [9, 10], alchemicResult: 'alchemy.application.contact' },
  {
    diceValueRange: [11, 16],
    alchemicResult: 'alchemy.application.weaponPoison',
  },
  {
    diceValueRange: [17, 18],
    alchemicResult: 'alchemy.application.inhalation',
  },
  {
    diceValueRange: [19, 19],
    alchemicResult: 'alchemy.application.chooseTwo',
  },
  {
    diceValueRange: [20, 20],
    alchemicResult: 'alchemy.potion.ineffective',
    category: EffectCategory.Ineffectiv,
  },
];

export const POISON_RESISTANCE: AlchemyDiceResult[] = [
  { diceValueRange: [2, 2], alchemicResult: 'alchemy.resistance.doubleSK' },
  { diceValueRange: [3, 6], alchemicResult: 'alchemy.resistance.sk' },
  { diceValueRange: [7, 10], alchemicResult: 'alchemy.resistance.zk' },
  { diceValueRange: [11, 11], alchemicResult: 'alchemy.resistance.none' },
  { diceValueRange: [12, 12], alchemicResult: 'alchemy.resistance.doubleZK' },
];

export const POISON_EFFECT: AlchemyDiceResult[] = [
  {
    diceValueRange: [-10, 0],
    alchemicResult: 'alchemy.poison.effect.minDamageOnce',
  },
  {
    diceValueRange: [1, 1],
    alchemicResult: 'alchemy.poison.effect.lowDamageOnce',
  },
  {
    diceValueRange: [2, 2],
    alchemicResult: 'alchemy.poison.effect.lowDamageOnce',
  },
  {
    diceValueRange: [3, 3],
    alchemicResult: 'alchemy.poison.effect.lowDamageImmediate',
  },
  {
    diceValueRange: [4, 4],
    alchemicResult: 'alchemy.poison.effect.mediumDamageShort',
  },
  {
    diceValueRange: [5, 5],
    alchemicResult: 'alchemy.poison.effect.mediumDamageMedium',
  },
  {
    diceValueRange: [6, 6],
    alchemicResult: 'alchemy.poison.effect.highDamageMedium',
  },
  {
    diceValueRange: [7, 7],
    alchemicResult: 'alchemy.poison.effect.highDamageImmediate',
  },
  {
    diceValueRange: [8, 8],
    alchemicResult: 'alchemy.poison.effect.shortEffect',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [9, 9],
    alchemicResult: 'alchemy.poison.effect.shortEffect',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [10, 10],
    alchemicResult: 'alchemy.poison.effect.longDamageShort',
  },
  {
    diceValueRange: [11, 11],
    alchemicResult: 'alchemy.poison.effect.lowDamageEffect',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [12, 12],
    alchemicResult: 'alchemy.poison.effect.lowDamageEffectImmediate',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [13, 13],
    alchemicResult: 'alchemy.poison.effect.mediumDamageEffect',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [14, 14],
    alchemicResult: 'alchemy.poison.effect.highDamageEffect',
    category: EffectCategory.Effect,
  },
  {
    diceValueRange: [15, 20],
    alchemicResult: 'alchemy.poison.effect.veryHighDamageEffect',
    category: EffectCategory.Effect,
  },
];

export const POISON_TRIGGER_EFFECT = new Map<
  ElementsAlchemy,
  AlchemyDiceResult[]
>([
  [
    ElementsAlchemy.Fire,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.acidSmallArea',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.burningSmallArea',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.burningLargeArea',
      },
    ],
  ],
  [
    ElementsAlchemy.Water,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.fear',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.bloodrage',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.helpless',
      },
    ],
  ],
  [
    ElementsAlchemy.Humus,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.pain',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.sick',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.blind',
      },
    ],
  ],
  [
    ElementsAlchemy.Ice,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.confusion',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.deaf',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.fixed',
      },
    ],
  ],
  [
    ElementsAlchemy.Air,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.stun',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.mute',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.unconscious',
      },
    ],
  ],
  [
    ElementsAlchemy.Ore,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.paralysis',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.burden',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.immobile',
      },
    ],
  ],
  [
    ElementsAlchemy.Magic,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.badLuck',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.minorSpirits',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.minorSpirits',
      },
    ],
  ],
  [
    ElementsAlchemy.Perverted,
    [
      {
        diceValueRange: [1, 3],
        alchemicResult: 'alchemy.poison.triggerEffect.lightSensitive',
      },
      {
        diceValueRange: [4, 5],
        alchemicResult: 'alchemy.poison.triggerEffect.uglyI',
      },
      {
        diceValueRange: [6, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.uglyII',
      },
    ],
  ],
  [
    ElementsAlchemy.Nameless,
    [
      {
        diceValueRange: [1, 6],
        alchemicResult: 'alchemy.poison.triggerEffect.possessionObedience',
      },
    ],
  ],
]);

export const POISON_EFFECTS_QS_GROUPS: AlchemyQSResult[] = [
  {
    qs: 1,
    alchemicResult: 'alchemy.poison.status.condition1',
  },
  {
    qs: 2,
    alchemicResult: 'alchemy.poison.status.condition2',
  },
  {
    qs: 3,
    alchemicResult: 'alchemy.poison.status.condition3',
  },
  {
    qs: 4,
    alchemicResult: 'alchemy.poison.status.condition4',
  },
  {
    qs: 5,
    alchemicResult: 'alchemy.poison.status.condition5',
  },
  {
    qs: 6,
    alchemicResult: 'alchemy.poison.status.condition6',
  },
  {
    qs: 7,
    alchemicResult: 'alchemy.poison.status.condition7',
  },
];

//--------stimulant------------//
export const STIMULANT_APPLICATION: AlchemyDiceResult[] = [
  { diceValueRange: [1, 10], alchemicResult: 'alchemy.application.ingestion' },
  { diceValueRange: [11, 12], alchemicResult: 'alchemy.application.contact' },
  {
    diceValueRange: [13, 19],
    alchemicResult: 'alchemy.application.inhalation',
  },
  {
    diceValueRange: [20, 20],
    alchemicResult: 'alchemy.potion.ineffective',
    category: EffectCategory.Ineffectiv,
  },
];

export const STIMULANT_RESISTANCE: AlchemyDiceResult[] = [
  { diceValueRange: [2, 2], alchemicResult: 'alchemy.resistance.doubleZK' },
  { diceValueRange: [3, 6], alchemicResult: 'alchemy.resistance.zk' },
  { diceValueRange: [7, 10], alchemicResult: 'alchemy.resistance.sk' },
  { diceValueRange: [11, 11], alchemicResult: 'alchemy.resistance.none' },
  { diceValueRange: [12, 12], alchemicResult: 'alchemy.resistance.doubleSK' },
];

export const STIMULANT_ADDICTION: AlchemyDiceResult[] = [
  {
    diceValueRange: [1, 3],
    alchemicResult: 'alchemy.stimulant.addiction.none',
  },
  {
    diceValueRange: [4, 7],
    alchemicResult: 'alchemy.stimulant.addiction.afterManyUses',
  },
  {
    diceValueRange: [8, 11],
    alchemicResult: 'alchemy.stimulant.addiction.afterFewUses',
  },
  {
    diceValueRange: [12, 14],
    alchemicResult: 'alchemy.stimulant.addiction.afterOneUse',
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
      effect: 'alchemy.stimulant.effect.fire.effect',
      sideEffect: 'alchemy.stimulant.effect.fire.sideEffect',
      overdose: 'alchemy.stimulant.effect.fire.overdose',
    },
  ],
  [
    ElementsAlchemy.Water,
    {
      effect: 'alchemy.stimulant.effect.water.effect',
      sideEffect: 'alchemy.stimulant.effect.water.sideEffect',
      overdose: 'alchemy.stimulant.effect.water.overdose',
    },
  ],
  [
    ElementsAlchemy.Humus,
    {
      effect: 'alchemy.stimulant.effect.humus.effect',
      sideEffect: 'alchemy.stimulant.effect.humus.sideEffect',
      overdose: 'alchemy.stimulant.effect.humus.overdose',
    },
  ],
  [
    ElementsAlchemy.Ice,
    {
      effect: 'alchemy.stimulant.effect.ice.effect',
      sideEffect: 'alchemy.stimulant.effect.ice.sideEffect',
      overdose: 'alchemy.stimulant.effect.ice.overdose',
    },
  ],
  [
    ElementsAlchemy.Air,
    {
      effect: 'alchemy.stimulant.effect.air.effect',
      sideEffect: 'alchemy.stimulant.effect.air.sideEffect',
      overdose: 'alchemy.stimulant.effect.air.overdose',
    },
  ],
  [
    ElementsAlchemy.Ore,
    {
      effect: 'alchemy.stimulant.effect.ore.effect',
      sideEffect: 'alchemy.stimulant.effect.ore.sideEffect',
      overdose: 'alchemy.stimulant.effect.ore.overdose',
    },
  ],
  [
    ElementsAlchemy.Magic,
    {
      effect: 'alchemy.stimulant.effect.magic.effect',
      sideEffect: 'alchemy.stimulant.effect.magic.sideEffect',
      overdose: 'alchemy.stimulant.effect.magic.overdose',
    },
  ],
  [
    ElementsAlchemy.Perverted,
    {
      effect: 'alchemy.stimulant.effect.perverted.effect',
      sideEffect: 'alchemy.stimulant.effect.perverted.sideEffect',
      overdose: 'alchemy.stimulant.effect.perverted.overdose',
    },
  ],
  [
    ElementsAlchemy.Divine,
    {
      effect: 'alchemy.stimulant.effect.divine.effect',
      sideEffect: 'alchemy.stimulant.effect.divine.sideEffect',
      overdose: 'alchemy.stimulant.effect.divine.overdose',
    },
  ],
]);

export const STIMULANT_EFFECTS_QS_GROUPS: AlchemyQSResult[] = [
  {
    qs: -1,
    alchemicResult: 'alchemy.stimulant.status.condition0',
  },
  {
    qs: 0,
    alchemicResult: 'alchemy.stimulant.status.condition0',
  },
  {
    qs: 1,
    alchemicResult: 'alchemy.stimulant.status.condition1',
  },
  {
    qs: 2,
    alchemicResult: 'alchemy.stimulant.status.condition2',
  },
  {
    qs: 3,
    alchemicResult: 'alchemy.stimulant.status.condition3',
  },
  {
    qs: 4,
    alchemicResult: 'alchemy.stimulant.status.condition4',
  },
  {
    qs: 5,
    alchemicResult: 'alchemy.stimulant.status.condition5',
  },
  {
    qs: 6,
    alchemicResult: 'alchemy.stimulant.status.condition6',
  },
  {
    qs: 7,
    alchemicResult: 'alchemy.stimulant.status.condition7',
  },
  {
    qs: 8,
    alchemicResult: 'alchemy.stimulant.status.condition7',
  },
  {
    qs: 9,
    alchemicResult: 'alchemy.stimulant.status.condition7',
  },
  {
    qs: 10,
    alchemicResult: 'alchemy.stimulant.status.condition7',
  },
];
