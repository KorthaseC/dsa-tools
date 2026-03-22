import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import Aura from '@primeng/themes/aura';
import { DialogService } from 'primeng/dynamicdialog';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

const DE_TRANSLATION = {
  dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  today: 'Heute',
  clear: 'Leeren',
  accept: 'Ja',
  reject: 'Nein',
  cancel: 'Abbrechen',
  close: 'Schließen',
  apply: 'Übernehmen',
  choose: 'Auswählen',
  upload: 'Hochladen',
  firstDayOfWeek: 1,
  dateFormat: 'dd.mm.yy',
  emptyFilterMessage: 'Keine Ergebnisse gefunden',
  emptyMessage: 'Keine Einträge gefunden',
  aria: {
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    nullLabel: 'Nicht ausgewählt',
    close: 'Schließen',
    previous: 'Zurück',
    next: 'Weiter',
    navigation: 'Navigation',
    chooseYear: 'Jahr auswählen',
    chooseMonth: 'Monat auswählen',
    chooseDate: 'Datum auswählen',
    prevDecade: 'Vorheriges Jahrzehnt',
    nextDecade: 'Nächstes Jahrzehnt',
    prevYear: 'Vorheriges Jahr',
    nextYear: 'Nächstes Jahr',
    prevMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    prevHour: 'Vorherige Stunde',
    nextHour: 'Nächste Stunde',
    prevMinute: 'Vorherige Minute',
    nextMinute: 'Nächste Minute',
    selectRow: 'Zeile ausgewählt',
    unselectRow: 'Zeile abgewählt',
    pageLabel: 'Seite {page}',
    firstPageLabel: 'Erste Seite',
    lastPageLabel: 'Letzte Seite',
    nextPageLabel: 'Nächste Seite',
    prevPageLabel: 'Vorherige Seite',
    rowsPerPageLabel: 'Zeilen pro Seite',
    clear: 'Leeren',
    apply: 'Übernehmen',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
      translation: DE_TRANSLATION,
    }),
    provideHttpClient(),
    DialogService,
  ],
};
