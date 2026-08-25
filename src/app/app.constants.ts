/** App-level metadata constants: page title, route titles and meta descriptions. */

/** Absolute site origin — used for canonical URLs, Open Graph and JSON-LD. */
export const SITE_URL = 'https://dsa-tools.de';

/**
 * Social preview image: the existing app logo, extracted 1:1 from dsa-tools-icon.ico (which embeds
 * a 256x256 PNG). Square, so the cards are declared as 'summary', not 'summary_large_image'.
 */
export const OG_IMAGE = `${SITE_URL}/assets/og-image.png`;

/** All application route paths defined in one place. */
export const APP_ROUTES = {
  about: '/about',
  overview: '/overview',
  calendar: '/calendar',
  currency: '/currency',
  alchemy: '/alchemy',
  tavern: '/tavern',
  names: '/names',
  smith: '/smith',
  books: '/books',
  token: '/token',
  character: '/character',
  characterCreator: '/character-creator',
  characterSheet: '/character-sheet',
  report: '/report',
  legal: '/legal',
  imprint: '/imprint',
} as const;

/** The base title shown in the browser tab */
export const APP_TITLE = 'DSA Tools';

/**
 * Full <title> of the home page. Unlike every other page this is NOT prefixed with APP_TITLE —
 * the domain root is the strongest URL, so it carries the main keywords itself.
 */
export const HOME_TITLE = 'DSA Tools – Spielhilfen & Generatoren für Das Schwarze Auge (DSA5)';

/** Maps route data keys to their German page titles */
export const ROUTE_TITLES: Record<string, string> = {
  homeTitle: 'Startseite',
  overviewTitle: 'Übersicht',
  calendarTitle: 'Kalender Rechner',
  currencyTitle: 'Währungsrechner',
  alchemyTitle: 'Alchemielabor',
  tavernTitle: 'Tavernen Generator',
  nameGeneratorTitle: 'Namen Generator',
  smithGeneratorTitle: 'Schmiede',
  bookGeneratorTitle: 'Bücher Generator',
  aboutTitle: 'Über diese Seite',
  reportTitle: 'Reports',
  legalTitle: 'Datenschutz',
  imprintTitle: 'Impressum',
  characterCreatorTitle: 'Charaktererschaffung',
  characterSheetTitle: 'Heldenbogen',
  tokenGeneratorTitle: 'Token Generator',
  notFoundTitle: 'Seite nicht gefunden',
};

/** Maps route names to their German meta description content (ideal: ~150–160 Zeichen) */
export const META_DESCRIPTIONS: Record<string, string> = {
  home: 'Kostenlose Spielhilfen für Das Schwarze Auge 5: Charaktererschaffung, Kalender, Währungsrechner, Alchemie, Namens- und Tavernengenerator – direkt im Browser, ohne Anmeldung.',
  about: 'Alle DSA5-Tools dieser Fanseite im Überblick: von Kalenderrechner über Alchemie bis zur kompletten Heldenerschaffung.',
  overview: 'Direkter Zugriff auf alle Tools: Kalender, Währungsrechner, Alchemielabor, Namensgenerator, Schmiede und mehr.',
  calendar: 'Wochentag und Mondphase zu jedem Datum im aventurischen Kalender – praktisch für Zeitangaben im DSA5-Abenteuer.',
  currency: 'Dukaten, Silbertaler, Heller und Kreuzer ineinander umrechnen – für realistische Handelsszenen am Spieltisch.',
  alchemy: 'Tränke und Mixturen nach DSA5-Regeln zusammenstellen, inklusive Zutaten und Wirkungen für deine Alchemisten-Helden.',
  tavern: 'Zufällige Tavernen mit Namen, Wirt und Besonderheiten generieren – für spontane Zwischenstopps im Abenteuer.',
  names: 'Aventurische Namen nach Kulturkreis generieren – für NSCs, Helden oder ganze Sippen in deiner DSA5-Runde.',
  smith: 'Preise, Waffen und Rüstungen beim Schmied berechnen – inklusive zufälliger Sonderfertigkeiten und Materialien.',
  books: 'Zufällige Bücher, Schriftrollen und Aufzeichnungen mit Titel und Inhalt für Bibliotheken und Fundstücke im Abenteuer.',
  token: 'Eigenes Bild in einen runden Charakter-Token umwandeln – passend für Roll20, Foundry VTT oder digitale Spielrunden.',
  character:
    'DSA5-Helden Schritt für Schritt erschaffen: Spezies, Kultur, Profession, Eigenschaften, Talente und Sonderfertigkeiten bis zur fertigen Heldenurkunde als PDF.',
  'character-creator': 'Der Schritt-für-Schritt-Assistent der DSA5-Heldenerschaffung: Spezies, Kultur und Profession wählen, Eigenschaften und Talente verteilen.',
  'character-sheet': 'Der digitale DSA5-Heldenbogen: Eigenschaften, Talente, Kampftechniken, Zauber und Ausrüstung verwalten und als PDF exportieren.',
  report: 'Fehler melden oder Ideen für neue Tools vorschlagen und so bei der Weiterentwicklung dieser Fanseite mithelfen.',
  legal: 'Datenschutzerklärung zu Cookies, Analyse-Tools und Datenverarbeitung auf dieser inoffiziellen DSA-Fanseite.',
  imprint: 'Anbieterkennzeichnung und rechtliche Hinweise zu dieser inoffiziellen Das Schwarze Auge Fanseite.',
  notFound: 'Diese Seite existiert nicht. Zurück zur Übersicht aller DSA5-Spielhilfen.',
};
