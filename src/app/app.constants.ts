/** App-level metadata constants: page title, route titles, meta descriptions and keywords. */

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

/** Maps route data keys to their German page titles */
export const ROUTE_TITLES: Record<string, string> = {
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
  tokenGeneratorTitle: 'Token Generator',
};

/** Maps route names to their German meta description content (ideal: ~150–160 Zeichen) */
export const META_DESCRIPTIONS: Record<string, string> = {
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
  'character-creator':
    'DSA5-Helden Schritt für Schritt erschaffen: Spezies, Kultur, Profession, Eigenschaften, Talente und Sonderfertigkeiten bis zur fertigen Heldenurkunde als PDF.',
  report: 'Fehler melden oder Ideen für neue Tools vorschlagen und so bei der Weiterentwicklung dieser Fanseite mithelfen.',
  legal: 'Datenschutzerklärung zu Cookies, Analyse-Tools und Datenverarbeitung auf dieser inoffiziellen DSA-Fanseite.',
  imprint: 'Anbieterkennzeichnung und rechtliche Hinweise zu dieser inoffiziellen Das Schwarze Auge Fanseite.',
};

/** Maps route names to their German meta keywords content */
export const META_KEYWORDS: Record<string, string> = {
  about: 'Das Schwarze Auge, DSA, Rollenspiel-Tools, DSA Generatoren, Aventurien, Spielhilfe',
  overview: 'DSA Übersicht, Rollenspiel-Tools, Das Schwarze Auge Funktionen, Aventurien Tools',
  calendar: 'Aventurischer Kalender, DSA Wochentag, Mondphase, Das Schwarze Auge Zeitrechnung',
  currency: 'DSA Währungsrechner, Aventurien Währung, Handel in Das Schwarze Auge',
  alchemy: 'DSA Alchemie, Tränke erstellen, Das Schwarze Auge Mixturen, Magie in Aventurien',
  tavern: 'DSA Tavernengenerator, Das Schwarze Auge Tavernen, Aventurische Gasthäuser',
  names: 'DSA Namensgenerator, Das Schwarze Auge Namen, Charaktere benennen',
  smith: 'DSA Schmiedegenerator, Waffen und Rüstungen, Das Schwarze Auge Handwerk',
  books: 'DSA Büchergenerator, Das Schwarze Auge Bücher, Aventurische Schriftrollen',
  token: 'DSA Token, Charakter Token, Das Schwarze Auge Token, Charakter Bild',
  character: 'DSA Charaktererschaffung, Heldenerschaffung, DSA5 Charakterbogen, Das Schwarze Auge Helden erstellen',
  'character-creator': 'DSA Charaktererschaffung, Heldenerschaffung, DSA5 Charakterbogen, Das Schwarze Auge Helden erstellen',
  report: 'DSA Feedback, Bugreport, Das Schwarze Auge Support',
  legal: 'DSA Rechtliches, Datenschutz, Das Schwarze Auge Rechtlich',
  imprint: 'DSA Impressum, Das Schwarze Auge Impressum, rechtliche Hinweise',
};
