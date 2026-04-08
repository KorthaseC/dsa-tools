/** App-level metadata constants: page title, route titles, meta descriptions and keywords. */

/** The base title shown in the browser tab */
export const APP_TITLE = 'DSA Tools';

/** Maps route data keys to their German page titles */
export const ROUTE_TITLES: Record<string, string> = {
  overviewTitle: 'Übersicht',
  calendarTitle: 'Kalender Rechner',
  madaTitle: 'Mada Phasen Rechner',
  weekdayTitle: 'Wochentag Rechner',
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
  characterCreatorTitle: 'Helden Ersteller',
  tokenGeneratorTitle: 'Token Generator',
};

/** Maps route names to their German meta description content */
export const META_DESCRIPTIONS: Record<string, string> = {
  about: 'Entdecke Tools und Generatoren, die dir bei deinen Abenteuern in der Welt von Das Schwarze Auge helfen.',
  overview: 'Eine zentrale Anlaufstelle für alle verfügbaren Funktionen dieser Webseite, um deine DSA-Abenteuer zu unterstützen.',
  calendar: 'Berechne Wochentag und Mondphase im aventurischen Kalender für dein DSA-Abenteuer.',
  madaphase: 'Berechne die aktuelle Mada-Phase und entdecke die magischen Einflüsse in Aventurien.',
  weekday: 'Bestimme den aktuellen Wochentag im aventurischen Kalender und verleihe deinem Abenteuer mehr Tiefe.',
  currency: 'Konvertiere Währungen in Aventurien und gestalte realistische Handelsgeschäfte in deinem DSA-Abenteuer.',
  alchemy: 'Erstelle Tränke und Mixturen für deine Helden in Aventurien mit unserem Alchemie-Tool.',
  tavern: 'Erstelle zufällige Tavernen und Gasthäuser für dein DSA-Abenteuer mit einzigartigen Namen und Besonderheiten.',
  names: 'Finde den perfekten Namen für Charaktere in deinem DSA-Abenteuer mit unserem Namensgenerator.',
  smith: 'Generiere einzigartige Waffen und Rüstungen für deine Helden in Aventurien mit unserem Schmiedegenerator.',
  books: 'Erstelle einzigartige Bücher und Schriftrollen, die deine Helden in Aventurien entdecken können.',
  report: 'Hilf uns, die Webseite zu verbessern, indem du Fehler meldest oder Verbesserungsvorschläge machst.',
  legal: 'Hier findest du rechtliche Hinweise zu unserer inoffiziellen DSA-Hilfeseite.',
  token: 'Erstelle einen runden Charakter-Token für dein DSA-Abenteuer aus einem eigenen Bild.',
};

/** Maps route names to their German meta keywords content */
export const META_KEYWORDS: Record<string, string> = {
  about: 'Das Schwarze Auge, DSA, Rollenspiel-Tools, DSA Generatoren, Aventurien, Spielhilfe',
  overview: 'DSA Übersicht, Rollenspiel-Tools, Das Schwarze Auge Funktionen, Aventurien Tools',
  calendar: 'Aventurischer Kalender, DSA Wochentag, Mondphase, Das Schwarze Auge Zeitrechnung',
  madaphase: 'Mada-Phase, Mondphasen Aventurien, Magie in DSA, Das Schwarze Auge Magie',
  weekday: 'Aventurischer Kalender, DSA Wochentag, Das Schwarze Auge Zeitrechnung',
  currency: 'DSA Währungsrechner, Aventurien Währung, Handel in Das Schwarze Auge',
  alchemy: 'DSA Alchemie, Tränke erstellen, Das Schwarze Auge Mixturen, Magie in Aventurien',
  tavern: 'DSA Tavernengenerator, Das Schwarze Auge Tavernen, Aventurische Gasthäuser',
  names: 'DSA Namensgenerator, Das Schwarze Auge Namen, Charaktere benennen',
  smith: 'DSA Schmiedegenerator, Waffen und Rüstungen, Das Schwarze Auge Handwerk',
  books: 'DSA Büchergenerator, Das Schwarze Auge Bücher, Aventurische Schriftrollen',
  report: 'DSA Feedback, Bugreport, Das Schwarze Auge Support',
  legal: 'DSA Rechtliches, Das Schwarze Auge Rechtlich, rechtliche Hinweise',
  token: 'DSA Token, Charakter Token, Das Schwarze Auge Token, Charakter Bild',
};
