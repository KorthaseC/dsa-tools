import { DAYS_IN_YEAR } from '../shared/constant';

/** Length of one complete moon cycle in days */
export const MOON_CYCLE_DAYS: number = 28;

/**
 * Reference day for a known full moon on the 184th day of the year 1047 BF.
 * Used as the anchor point for all moon-phase calculations.
 */
export const FULL_MOON_REFERENCE_DAY: number = 184 + 1047 * DAYS_IN_YEAR;

/**
 * Reference day for calculating the aventurian weekday.
 * The 183rd day of the year 1047 BF fell on a Windstag (index 0).
 */
export const WINDSTAG_REFERENCE_DAY: number = 183 + 1047 * DAYS_IN_YEAR;

/** German display names for each moon phase */
export const MOON_PHASE_NAMES: Record<string, string> = {
  increasing: 'zunehmend',
  decreasing: 'abnehmend',
  helmet:     'Helm',
  newMoon:    'Tote Mada/Neumond',
  chalice:    'Kelch',
  fullMoon:   'Rad/Vollmond',
};
