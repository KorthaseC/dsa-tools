import { APP_ROUTES } from './app.constants';

/** Surfaces that list a feature. Order within a surface follows the APP_FEATURES array order. */
export type FeatureSurface = 'about' | 'overview';

/**
 * A single tool/page of the app. This is the ONE source of truth for the feature listings shown on the
 * About page and the Overview grid — both derive their lists from APP_FEATURES (filtered by `surfaces`),
 * so a feature is defined exactly once and can never drift between the two pages again.
 *
 * (Routes stay hand-written in app.routes.ts: their `loadComponent: () => import('literal')` must be a
 * static specifier for the lazy per-feature chunks. Route titles / SEO meta live in app.constants.ts,
 * keyed by route data.)
 */
export interface AppFeature {
  /** Target route (a value from APP_ROUTES). */
  route: string;
  /** Canonical display name — used identically on the About card and the Overview card. */
  title: string;
  /** Short card text for the Overview grid. */
  overviewDescription: string;
  /** Longer descriptive text for the About list. */
  aboutDescription: string;
  /** Overview card icon (assets/icons/*.svg). About renders no icons, so About-only entries omit it. */
  icon?: string;
  iconAlt?: string;
  /** Where this feature is listed. */
  surfaces: readonly FeatureSurface[];
}

/** The single registry of features. Array order = display order on every surface. */
export const APP_FEATURES: AppFeature[] = [
  {
    route: APP_ROUTES.overview,
    title: 'Übersicht',
    overviewDescription: 'Zentrale Anlaufstelle für alle Funktionen',
    aboutDescription: 'Eine zentrale Anlaufstelle, die alle verfügbaren Funktionen dieser Webseite auf einen Blick zeigt.',
    surfaces: ['about'],
  },
  {
    route: APP_ROUTES.calendar,
    title: 'Kalender',
    overviewDescription: 'Tool zur Berechnung von Wochentag und Mondphase',
    aboutDescription: 'Berechne Wochentag und Madaphase für ein beliebiges aventurisches Datum im aventurischen Kalender.',
    icon: 'assets/icons/satinavs.svg',
    iconAlt: 'Satinav Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.currency,
    title: 'Währungsrechner',
    overviewDescription: 'Tool zur Berechnung der Währungen',
    aboutDescription: 'Konvertiere mühelos zwischen den verschiedenen Währungen Aventuriens, um Handel und Kaufgeschäfte realistisch darzustellen.',
    icon: 'assets/icons/phex.svg',
    iconAlt: 'Phex Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.alchemy,
    title: 'Alchemielabor',
    overviewDescription: 'Tool zur Erstellung von alchemistischen Mitteln',
    aboutDescription: 'Nutze unser Alchemie-Tool, um Tränke und Mixturen zu erstellen, die deine Helden im Spiel nutzen können.',
    icon: 'assets/icons/ausfaellen.svg',
    iconAlt: 'Alchemy Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.tavern,
    title: 'Tavernengenerator',
    overviewDescription: 'Tool zur Erstellung von zufälligen Tavernen',
    aboutDescription: 'Erstelle zufällige Tavernen und Gasthäuser, in denen eure Helden einkehren können - inklusive Namen und Besonderheiten.',
    icon: 'assets/icons/travia.svg',
    iconAlt: 'Travia Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.names,
    title: 'Namensgenerator',
    overviewDescription: 'Tool zur Erstellung von zufälligen Namen',
    aboutDescription: 'Finde passende Namen für Charaktere, die in eurer Geschichte vorkommen.',
    icon: 'assets/icons/namenloser.svg',
    iconAlt: 'Nameless Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.smith,
    title: 'Schmiede',
    overviewDescription: 'Tool zur Berechnung von Preisen beim Schmied',
    aboutDescription: 'Generiere zufällige Waffen und Rüstungen mit einzigartigen Eigenschaften.',
    icon: 'assets/icons/ingerimm.svg',
    iconAlt: 'Ingerimm Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.books,
    title: 'Büchergenerator',
    overviewDescription: 'Tool zur Erstellung von zufälligen Büchern',
    aboutDescription: 'Erstelle einzigartige Bücher und Schriftrollen, die eure Helden in der Welt von Aventurien entdecken können.',
    icon: 'assets/icons/nandus.svg',
    iconAlt: 'Nandus Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.token,
    title: 'Token Generator',
    overviewDescription: 'Tool zur Erstellung von Charakter-Token',
    aboutDescription: 'Erstelle runde Charakter-Token für dein DSA-Abenteuer aus einem eigenen Bild.',
    icon: 'assets/icons/rur-und-gror.svg',
    iconAlt: 'Rur und Gror Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.character,
    title: 'Charaktererschaffung',
    overviewDescription: 'Tool zur Erstellung und Bearbeitung von Helden',
    aboutDescription:
      'Erschaffe und verwalte komplette DSA5-Helden Schritt für Schritt – von Spezies, Kultur und Profession über Eigenschaften, Talente und Sonderfertigkeiten bis zur fertigen Heldenurkunde als PDF.',
    icon: 'assets/icons/tsa.svg',
    iconAlt: 'Tsa Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.report,
    title: 'Bugreport und Feedback',
    overviewDescription: 'Fehler melden und Verbesserungen vorschlagen',
    aboutDescription: 'Hilf uns, die Webseite zu verbessern, indem du Fehler meldest oder Verbesserungsvorschläge machst.',
    surfaces: ['about'],
  },
  {
    route: APP_ROUTES.legal,
    title: 'Datenschutz',
    overviewDescription: 'Unsere Datenschutzerklärung',
    aboutDescription: 'Hier findest du unsere Datenschutzerklärung.',
    surfaces: ['about'],
  },
  {
    route: APP_ROUTES.imprint,
    title: 'Impressum',
    overviewDescription: 'Rechtliche Hinweise und Disclaimer',
    aboutDescription: 'Rechtliche Hinweise und Disclaimer zu dieser Fanseite.',
    surfaces: ['about'],
  },
];
