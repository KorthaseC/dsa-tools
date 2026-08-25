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
  /**
   * Prose intro rendered at the top of the tool page itself (via <app-page-intro />).
   * These pages are otherwise pure form controls with no indexable text — this is the content a
   * search engine actually has to rank on. Omit for pages that already carry their own copy.
   */
  introText?: string;
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
    introText:
      'Alle Spielhilfen dieser Seite auf einen Blick. Jedes Tool arbeitet nach den Regeln von Das Schwarze Auge 5 und läuft direkt im Browser, ohne Anmeldung.',
    surfaces: ['about'],
  },
  {
    route: APP_ROUTES.calendar,
    title: 'Kalender',
    overviewDescription: 'Tool zur Berechnung von Wochentag und Mondphase',
    aboutDescription: 'Berechne Wochentag und Madaphase für ein beliebiges aventurisches Datum im aventurischen Kalender.',
    introText:
      'Der aventurische Kalender zählt zwölf Monate zu je 30 Tagen, benannt nach den Zwölfgöttern, dazu die fünf Namenlosen Tage am Jahresende. Trag ein beliebiges Datum ein und du erhältst sofort den passenden Wochentag und die Madaphase. Praktisch, wenn du als Meister Reisezeiten planst oder wissen willst, ob deine Helden bei Vollmond unterwegs sind.',
    icon: 'assets/icons/satinavs.svg',
    iconAlt: 'Satinav Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.currency,
    title: 'Währungsrechner',
    overviewDescription: 'Tool zur Berechnung der Währungen',
    aboutDescription: 'Konvertiere mühelos zwischen den verschiedenen Währungen Aventuriens, um Handel und Kaufgeschäfte realistisch darzustellen.',
    introText:
      'In Aventurien wird in Dukaten, Silbertalern, Hellern und Kreuzern gezahlt: zehn Kreuzer ergeben einen Heller, zehn Heller einen Silbertaler, zehn Silbertaler einen Dukaten. Der Rechner wandelt jeden Betrag zwischen den Währungen um und rechnet auf Wunsch die regionale Wechselgebühr ein, wenn deine Gruppe im Ausland Geld tauscht.',
    icon: 'assets/icons/phex.svg',
    iconAlt: 'Phex Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.alchemy,
    title: 'Alchemielabor',
    overviewDescription: 'Tool zur Erstellung von alchemistischen Mitteln',
    aboutDescription: 'Nutze unser Alchemie-Tool, um Tränke und Mixturen zu erstellen, die deine Helden im Spiel nutzen können.',
    introText:
      'Nach den DSA5-Regeln hängt die Qualität eines Trankes von der Brauprobe, der Reinheit der Zutaten, dem Laborwert und dem passenden Element ab. Stell hier Trankart, Genius der Alchemie, Element und Zutatenreinheit ein - das Tool ermittelt daraus die erreichte Qualitätsstufe und das Ergebnis deines Brauvorgangs.',
    icon: 'assets/icons/ausfaellen.svg',
    iconAlt: 'Alchemy Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.tavern,
    title: 'Tavernengenerator',
    overviewDescription: 'Tool zur Erstellung von zufälligen Tavernen',
    aboutDescription: 'Erstelle zufällige Tavernen und Gasthäuser, in denen eure Helden einkehren können - inklusive Namen und Besonderheiten.',
    introText:
      'Deine Helden kehren spontan in einem Gasthaus ein und du brauchst sofort Namen, Wirt und Atmosphäre? Der Generator würfelt eine komplette Taverne samt Namen, Wirtsperson, Preisniveau und einer Besonderheit - passend zum gewählten Ort, ob Dorfschenke oder Hafenspelunke.',
    icon: 'assets/icons/travia.svg',
    iconAlt: 'Travia Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.names,
    title: 'Namensgenerator',
    overviewDescription: 'Tool zur Erstellung von zufälligen Namen',
    aboutDescription: 'Finde passende Namen für Charaktere, die in eurer Geschichte vorkommen.',
    introText:
      'Ein NSC taucht auf und du brauchst auf die Schnelle einen Namen, der zur Herkunft passt. Der Generator liefert aventurische Namen nach Spezies und Kulturkreis - von mittelländisch über thorwalsch und tulamidisch bis zu Elfen und Zwergen - wahlweise männlich, weiblich oder gemischt, auf Wunsch mit adeligem Beinamen.',
    icon: 'assets/icons/namenloser.svg',
    iconAlt: 'Nameless Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.smith,
    title: 'Schmiede',
    overviewDescription: 'Tool zur Berechnung von Preisen beim Schmied',
    aboutDescription: 'Generiere zufällige Waffen und Rüstungen mit einzigartigen Eigenschaften.',
    introText:
      'Was kostet eine Klinge aus Meteorstahl, und wie viel schlägt der Meister für seine Qualifikation auf? Gib Talentwert, Attributswerte, Material und die gewünschten Verbesserungen an - das Tool berechnet daraus den Endpreis nach DSA5, damit Handwerksaufträge am Spieltisch nachvollziehbar bleiben.',
    icon: 'assets/icons/ingerimm.svg',
    iconAlt: 'Ingerimm Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.books,
    title: 'Büchergenerator',
    overviewDescription: 'Tool zur Erstellung von zufälligen Büchern',
    aboutDescription: 'Erstelle einzigartige Bücher und Schriftrollen, die eure Helden in der Welt von Aventurien entdecken können.',
    introText:
      'Bibliotheken, Truhen und Fundstücke wirken erst lebendig, wenn die Bücher darin Titel und Inhalt haben. Der Generator erzeugt bis zu 50 Bücher, Schriftrollen und Aufzeichnungen auf einmal, jeweils mit Art, Thema und Besonderheit - genug, um eine ganze Klosterbibliothek in Sekunden zu füllen.',
    icon: 'assets/icons/nandus.svg',
    iconAlt: 'Nandus Symbol',
    surfaces: ['about', 'overview'],
  },
  {
    route: APP_ROUTES.token,
    title: 'Token Generator',
    overviewDescription: 'Tool zur Erstellung von Charakter-Token',
    aboutDescription: 'Erstelle runde Charakter-Token für dein DSA-Abenteuer aus einem eigenen Bild.',
    introText:
      'Für Roll20, Foundry VTT oder andere digitale Spielrunden brauchst du runde Charakter-Token. Lade ein eigenes Bild hoch, rücke den Ausschnitt zurecht und lade den fertigen Token als PNG herunter. Die Verarbeitung läuft komplett in deinem Browser - dein Bild verlässt deinen Rechner nicht.',
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
    introText:
      'Erschaffe einen kompletten DSA5-Helden Schritt für Schritt: Spezies, Kultur und Profession, Eigenschaften, Vor- und Nachteile, Talente, Kampftechniken, Zauber oder Liturgien. Am Ende steht eine fertige Heldenurkunde, die du als PDF exportierst oder später wieder einlädst - inklusive Abenteuerpunkte-Verwaltung für die Steigerung im laufenden Spiel.',
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
