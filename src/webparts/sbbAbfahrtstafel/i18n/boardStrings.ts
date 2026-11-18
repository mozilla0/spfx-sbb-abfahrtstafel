/** Sprachen, in denen die Abfahrtstafel angezeigt werden kann */
export type BoardLanguage = 'auto' | 'de' | 'fr' | 'it' | 'en';

export interface IBoardStrings {
  boardAriaLabel: string;
  colTime: string;
  colTrain: string;
  colPlatform: string;
  via: string;
  direction: string;
  platform: string;
  planned: string;
  platformChanged: string;
  /** {0} = Minuten */
  delayAria: string;
  loading: string;
  noStationConfigured: string;
  noDepartures: string;
  connectionError: string;
  unknownError: string;
  autoUpdate: string;
  updateFailed: string;
}

const STRINGS: Record<Exclude<BoardLanguage, 'auto'>, IBoardStrings> = {
  de: {
    boardAriaLabel: 'Abfahrtstafel',
    colTime: 'Zeit',
    colTrain: 'Zug / Richtung',
    colPlatform: 'Gl.',
    via: 'via',
    direction: 'Richtung',
    platform: 'Gleis',
    planned: 'geplant',
    platformChanged: 'Gleisänderung',
    delayAria: '{0} Minuten später',
    loading: 'Abfahrten werden geladen …',
    noStationConfigured: 'Bitte im Eigenschaftenfenster eine Haltestelle festlegen.',
    noDepartures: 'Keine Abfahrten gefunden.',
    connectionError: 'Verbindungsfehler',
    unknownError: 'Unbekannter Fehler',
    autoUpdate: 'Auto-Update aktiv',
    updateFailed: 'Aktualisierung fehlgeschlagen'
  },
  fr: {
    boardAriaLabel: 'Tableau des départs',
    colTime: 'Heure',
    colTrain: 'Train / Destination',
    colPlatform: 'Voie',
    via: 'via',
    direction: 'direction',
    platform: 'voie',
    planned: 'prévue',
    platformChanged: 'Changement de voie',
    delayAria: '{0} minutes de retard',
    loading: 'Chargement des départs …',
    noStationConfigured: 'Veuillez définir un arrêt dans le volet des propriétés.',
    noDepartures: 'Aucun départ trouvé.',
    connectionError: 'Erreur de connexion',
    unknownError: 'Erreur inconnue',
    autoUpdate: 'Actualisation auto',
    updateFailed: 'Échec de l’actualisation'
  },
  it: {
    boardAriaLabel: 'Tabellone partenze',
    colTime: 'Ora',
    colTrain: 'Treno / Direzione',
    colPlatform: 'Bin.',
    via: 'via',
    direction: 'direzione',
    platform: 'binario',
    planned: 'previsto',
    platformChanged: 'Cambiamento di binario',
    delayAria: '{0} minuti di ritardo',
    loading: 'Caricamento partenze …',
    noStationConfigured: 'Definire una fermata nel riquadro delle proprietà.',
    noDepartures: 'Nessuna partenza trovata.',
    connectionError: 'Errore di connessione',
    unknownError: 'Errore sconosciuto',
    autoUpdate: 'Aggiornamento automatico',
    updateFailed: 'Aggiornamento non riuscito'
  },
  en: {
    boardAriaLabel: 'Departure board',
    colTime: 'Time',
    colTrain: 'Train / Destination',
    colPlatform: 'Pl.',
    via: 'via',
    direction: 'to',
    platform: 'platform',
    planned: 'planned',
    platformChanged: 'Platform changed',
    delayAria: '{0} minutes late',
    loading: 'Loading departures …',
    noStationConfigured: 'Please set a stop in the property pane.',
    noDepartures: 'No departures found.',
    connectionError: 'Connection error',
    unknownError: 'Unknown error',
    autoUpdate: 'Auto refresh on',
    updateFailed: 'Refresh failed'
  }
};

/**
 * Liefert die Texte der Tafel. Bei «auto» wird die Sprache der SharePoint-Oberfläche verwendet;
 * wird diese nicht unterstützt, gilt Deutsch.
 */
export function getBoardStrings(language: BoardLanguage, uiCulture: string): IBoardStrings {
  if (language !== 'auto') {
    return STRINGS[language] ?? STRINGS.de;
  }
  const code = (uiCulture || '').slice(0, 2).toLowerCase() as Exclude<BoardLanguage, 'auto'>;
  return STRINGS[code] ?? STRINGS.de;
}
