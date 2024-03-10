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
