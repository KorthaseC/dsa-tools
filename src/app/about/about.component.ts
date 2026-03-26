import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Feature {
  title: string;
  description: string;
  routerLink: string;
}

@Component({
  selector: 'app-about',
  imports: [RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  public features: Feature[] = [
    {
      title: 'Übersicht',
      description: 'Eine zentrale Anlaufstelle, die alle verfügbaren Funktionen dieser Webseite auf einen Blick zeigt.',
      routerLink: '/overview',
    },
    {
      title: 'Kalender',
      description: 'Berechne Wochentag und Madaphase für ein beliebiges aventurisches Datum im aventurischen Kalender.',
      routerLink: '/calendar',
    },
    {
      title: 'Währungsrechner',
      description: 'Konvertiere mühelos zwischen den verschiedenen Währungen Aventuriens, um Handel und Kaufgeschäfte realistisch darzustellen.',
      routerLink: '/currency',
    },
    {
      title: 'Alchemie',
      description: 'Nutze unser Alchemie-Tool, um Tränke und Mixturen zu erstellen, die deine Helden im Spiel nutzen können.',
      routerLink: '/alchemy',
    },
    {
      title: 'Tavernengenerator',
      description: 'Erstelle zufällige Tavernen und Gasthäuser, in denen eure Helden einkehren können - inklusive Namen und Besonderheiten.',
      routerLink: '/tavern',
    },
    {
      title: 'Namensgenerator',
      description: 'Finde passende Namen für Charaktere, die in eurer Geschichte vorkommen.',
      routerLink: '/names',
    },
    {
      title: 'Schmiedegenerator',
      description: 'Generiere zufällige Waffen und Rüstungen mit einzigartigen Eigenschaften.',
      routerLink: '/smith',
    },
    {
      title: 'Büchergenerator',
      description: 'Erstelle einzigartige Bücher und Schriftrollen, die eure Helden in der Welt von Aventurien entdecken können.',
      routerLink: '/books',
    },
    {
      title: 'Bugreport und Feedback',
      description: 'Hilf uns, die Webseite zu verbessern, indem du Fehler meldest oder Verbesserungsvorschläge machst.',
      routerLink: '/report',
    },
    {
      title: 'Datenschutz',
      description: 'Hier findest du unsere Datenschutzerklärung.',
      routerLink: '/legal',
    },
    {
      title: 'Impressum',
      description: 'Rechtliche Hinweise und Disclaimer zu dieser Fanseite.',
      routerLink: '/imprint',
    },
  ];
}
