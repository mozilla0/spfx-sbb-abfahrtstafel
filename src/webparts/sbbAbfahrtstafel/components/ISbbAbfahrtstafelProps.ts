import type { TransportService, Transportation } from '../services/TransportService';
import type { IBoardStrings } from '../i18n/boardStrings';

export interface ISbbAbfahrtstafelProps {
  service: TransportService;
  station: string;
  /** Optionaler Anzeigetitel; leer = Name der Haltestelle */
  title: string;
  limit: number;
  refreshSeconds: number;
  transportations: Transportation[];
  viaCount: number;
  showClock: boolean;
  /** Texte der Tafel in der gewählten Sprache */
  texts: IBoardStrings;
}
