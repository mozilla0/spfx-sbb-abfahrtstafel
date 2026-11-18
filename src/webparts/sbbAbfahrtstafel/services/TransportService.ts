/* eslint-disable @rushstack/no-new-null -- die externe API (transport.opendata.ch) liefert null-Werte */
import { HttpClient, type HttpClientResponse } from '@microsoft/sp-http';

/** Verkehrsmittel gemäss transport.opendata.ch */
export type Transportation = 'train' | 'tram' | 'ship' | 'bus' | 'cableway';

export const ALL_TRANSPORTATIONS: Transportation[] = ['train', 'tram', 'bus', 'ship', 'cableway'];

interface IApiStation {
  id: string | null;
  name: string | null;
}

interface IApiPrognosis {
  platform: string | null;
  departure: string | null;
}

interface IApiStop {
  station: IApiStation;
  departure: string | null;
  departureTimestamp: number | null;
  delay: number | null;
  platform: string | null;
  prognosis: IApiPrognosis | null;
}

interface IApiConnection {
  stop: IApiStop;
  name: string | null;
  category: string | null;
  number: string | null;
  operator: string | null;
  to: string | null;
  passList: IApiStop[] | null;
}

interface IApiStationboardResponse {
  station: IApiStation | null;
  stationboard: IApiConnection[] | null;
}

interface IApiLocationsResponse {
  stations: IApiStation[] | null;
}

/** Aufbereitete Abfahrt für die Anzeige */
export interface IDeparture {
  key: string;
  /** Geplante Abfahrt */
  departure: Date;
  /** Verspätung in Minuten (0 = pünktlich, undefined = keine Echtzeitdaten) */
  delay: number | undefined;
  /** Kategorie, z. B. IC, IR, S, B */
  category: string;
  /** Anzeigename der Linie, z. B. «IC 21», «S31», «VAE», «Bus 1» */
  lineLabel: string;
  destination: string;
  /** Geplantes Gleis/Kante */
  platform: string | undefined;
  /** Gleis gemäss Prognose, falls abweichend vom geplanten */
  changedPlatform: string | undefined;
  /** Ausgewählte Zwischenhalte */
  via: string[];
  operator: string | undefined;
}

export interface IStationboard {
  stationName: string;
  departures: IDeparture[];
}

const API_BASE = 'https://transport.opendata.ch/v1';

export class TransportService {
  public constructor(private readonly _httpClient: HttpClient) {}

  public async getStationboard(
    station: string,
    limit: number,
    transportations: Transportation[],
    viaCount: number
  ): Promise<IStationboard> {
    const params: string[] = [
      `station=${encodeURIComponent(station)}`,
      `limit=${limit}`
    ];
    // Nur filtern, wenn nicht alle Verkehrsmittel gewählt sind
    if (transportations.length > 0 && transportations.length < ALL_TRANSPORTATIONS.length) {
      transportations.forEach(t => params.push(`transportations[]=${t}`));
    }

    const data = await this._getJson<IApiStationboardResponse>(`${API_BASE}/stationboard?${params.join('&')}`);
    const connections = data.stationboard ?? [];

    return {
      stationName: data.station?.name ?? station,
      departures: connections
        .filter(c => !!c.stop.departure)
        .map((c, i) => TransportService._mapConnection(c, i, viaCount))
    };
  }

  /** Sucht Haltestellen; wird zur Validierung im Eigenschaftenfenster verwendet. */
  public async findStations(query: string): Promise<string[]> {
    const data = await this._getJson<IApiLocationsResponse>(
      `${API_BASE}/locations?type=station&query=${encodeURIComponent(query)}`
    );
    return (data.stations ?? [])
      .map(s => s.name)
      .filter((n): n is string => !!n);
  }

  private async _getJson<T>(url: string): Promise<T> {
    const response: HttpClientResponse = await this._httpClient.get(url, HttpClient.configurations.v1, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  }

  private static _mapConnection(c: IApiConnection, index: number, viaCount: number): IDeparture {
    const stop = c.stop;
    const category = (c.category ?? '').trim();
    const plannedPlatform = stop.platform ?? undefined;
    const prognosisPlatform = stop.prognosis?.platform ?? undefined;

    return {
      key: `${c.name ?? ''}-${stop.departureTimestamp ?? index}`,
      departure: new Date(stop.departure as string),
      delay: stop.delay === null ? undefined : stop.delay,
      category,
      lineLabel: TransportService._lineLabel(category, (c.number ?? '').trim(), (c.name ?? '').trim()),
      destination: c.to ?? '',
      platform: plannedPlatform,
      changedPlatform:
        prognosisPlatform && prognosisPlatform !== plannedPlatform ? prognosisPlatform : undefined,
      via: TransportService._pickVia(c.passList ?? [], viaCount),
      operator: c.operator ?? undefined
    };
  }

  /**
   * Baut die Linienbezeichnung wie auf den SBB-Anzeigern.
   * Die API liefert in «name» die Zugnummer (z. B. 000675), in «number» die Linie (z. B. 21 oder VAE).
   */
  private static _lineLabel(category: string, lineNumber: string, trainNumber: string): string {
    const cat = category.toUpperCase();
    const isTrainNumber = !lineNumber || lineNumber === trainNumber || /^0\d+$/.test(lineNumber);

    if (cat === 'B' || cat === 'BUS') {
      return isTrainNumber ? 'Bus' : `Bus ${lineNumber}`;
    }
    if (cat === 'T' || cat === 'TRAM') {
      return isTrainNumber ? 'Tram' : `Tram ${lineNumber}`;
    }
    if (isTrainNumber) {
      return category || '–';
    }
    if (cat === 'S' || cat === 'SN') {
      return `${category}${lineNumber}`;
    }
    // Benannte Linien wie VAE, GEX, BEX werden ohne Kategorie angezeigt
    if (!/^\d/.test(lineNumber)) {
      return lineNumber;
    }
    return `${category} ${lineNumber}`;
  }

  /** Wählt gleichmässig verteilte Zwischenhalte (ohne Start- und Endhalt). */
  private static _pickVia(passList: IApiStop[], count: number): string[] {
    const names = passList
      .slice(1, -1)
      .map(s => s.station?.name)
      .filter((n): n is string => !!n);
    if (count <= 0 || names.length === 0) {
      return [];
    }
    if (names.length <= count) {
      return names;
    }
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(((i + 1) * names.length) / (count + 1));
      const name = names[Math.min(idx, names.length - 1)];
      if (result.indexOf(name) === -1) {
        result.push(name);
      }
    }
    return result;
  }
}
