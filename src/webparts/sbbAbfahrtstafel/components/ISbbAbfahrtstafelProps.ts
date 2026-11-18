import type { TransportService, Transportation } from '../services/TransportService';

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
}
