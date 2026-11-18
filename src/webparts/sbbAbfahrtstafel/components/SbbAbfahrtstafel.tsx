import * as React from 'react';
import styles from './SbbAbfahrtstafel.module.scss';
import type { ISbbAbfahrtstafelProps } from './ISbbAbfahrtstafelProps';
import type { IDeparture, IStationboard } from '../services/TransportService';
import type { IBoardStrings } from '../i18n/boardStrings';

const pad = (n: number): string => (n < 10 ? `0${n}` : String(n));
const formatTime = (d: Date): string => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** CSS-Klasse für das Kategorie-Badge */
function categoryClass(category: string): string {
  switch (category.toUpperCase()) {
    case 'IC':
    case 'ICE':
    case 'IR':
    case 'EC':
    case 'EN':
    case 'NJ':
    case 'RJX':
    case 'TGV':
    case 'PE':
    case 'RE':
      return styles.catLongDistance;
    case 'S':
    case 'SN':
    case 'R':
      return styles.catRegional;
    case 'B':
    case 'BUS':
    case 'NFB':
      return styles.catBus;
    case 'T':
    case 'TRAM':
    case 'NFT':
      return styles.catTram;
    case 'BAT':
    case 'FAE':
      return styles.catShip;
    default:
      return styles.catDefault;
  }
}

function useNow(enabled: boolean): Date {
  const [now, setNow] = React.useState<Date>(() => new Date());
  React.useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

const DepartureRow: React.FC<{ dep: IDeparture; t: IBoardStrings }> = ({ dep, t }) => {
  const platform = dep.changedPlatform ?? dep.platform ?? '–';
  const ariaLabel = [
    formatTime(dep.departure),
    dep.lineLabel,
    `${t.direction} ${dep.destination}`,
    dep.delay ? t.delayAria.replace('{0}', String(dep.delay)) : '',
    `${t.platform} ${platform}`,
    dep.changedPlatform ? t.platformChanged : ''
  ].filter(Boolean).join(', ');

  return (
    <li className={styles.row} aria-label={ariaLabel}>
      <div className={styles.time} aria-hidden="true">
        {formatTime(dep.departure)}
        {dep.delay ? <span className={styles.delay}>+{dep.delay}&#8242;</span> : undefined}
      </div>
      <div className={styles.info} aria-hidden="true">
        <div className={styles.destination} title={dep.destination}>{dep.destination}</div>
        <div className={styles.trainInfo}>
          <span className={`${styles.category} ${categoryClass(dep.category)}`}>{dep.lineLabel}</span>
          {dep.via.length > 0 && (
            <span className={styles.via} title={dep.via.join(' · ')}>
              {t.via} {dep.via.join(' · ')}
            </span>
          )}
        </div>
      </div>
      <div
        className={`${styles.platform} ${dep.changedPlatform ? styles.platformChanged : ''}`}
        title={dep.changedPlatform ? `${t.platformChanged} (${t.planned}: ${dep.platform ?? '–'})` : undefined}
        aria-hidden="true"
      >
        {platform}
      </div>
    </li>
  );
};

const SbbAbfahrtstafel: React.FC<ISbbAbfahrtstafelProps> = (props) => {
  const { service, station, title, limit, refreshSeconds, transportations, viaCount, showClock, texts: t } = props;

  const [board, setBoard] = React.useState<IStationboard | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = React.useState<Date | undefined>(undefined);
  const now = useNow(showClock);

  const transportKey = transportations.join(',');

  React.useEffect(() => {
    let disposed = false;
    let timer: number | undefined;

    const load = async (): Promise<void> => {
      if (!station) {
        return;
      }
      try {
        const result = await service.getStationboard(station, limit, transportations, viaCount);
        if (disposed) {
          return;
        }
        setBoard(result);
        setError(undefined);
        setLastUpdate(new Date());
      } catch (e) {
        if (disposed) {
          return;
        }
        // Bestehende Daten stehen lassen, nur Fehler anzeigen
        setError((e as Error).message || t.unknownError);
        console.error('SBB-Abfahrtstafel:', e);
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    const schedule = (): void => {
      window.clearInterval(timer);
      timer = window.setInterval(() => { load().catch(() => undefined); }, Math.max(15, refreshSeconds) * 1000);
    };

    // Im Hintergrund-Tab nicht abfragen (schont das API-Kontingent)
    const onVisibility = (): void => {
      if (document.hidden) {
        window.clearInterval(timer);
        timer = undefined;
      } else {
        load().catch(() => undefined);
        schedule();
      }
    };

    setLoading(true);
    load().catch(() => undefined);
    schedule();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [service, station, limit, refreshSeconds, transportKey, viaCount]);

  const heading = title || board?.stationName || station;

  let body: React.ReactNode;
  if (!station) {
    body = <div className={styles.message}>{t.noStationConfigured}</div>;
  } else if (loading && !board) {
    body = (
      <div className={styles.message} role="status">
        <div className={styles.dots} aria-hidden="true"><span /><span /><span /></div>
        {t.loading}
      </div>
    );
  } else if (error && !board) {
    body = (
      <div className={`${styles.message} ${styles.error}`} role="alert">
        <div>⚠️ {t.connectionError}</div>
        <div className={styles.errorDetail}>{error}</div>
      </div>
    );
  } else if (board && board.departures.length === 0) {
    body = <div className={styles.message}>{t.noDepartures}</div>;
  } else {
    body = (
      <ul className={styles.list}>
        {board?.departures.map(d => <DepartureRow key={d.key} dep={d} t={t} />)}
      </ul>
    );
  }

  return (
    <section className={styles.board} aria-label={`${t.boardAriaLabel} ${heading}`}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoBox}>SBB CFF FFS</span>
          <h2 className={styles.stationName}>{heading}</h2>
        </div>
        {showClock && <div className={styles.clock} aria-hidden="true">{formatTime(now)}</div>}
      </header>

      <div className={styles.boardHead} aria-hidden="true">
        <div>{t.colTime}</div>
        <div>{t.colTrain}</div>
        <div className={styles.center}>{t.colPlatform}</div>
      </div>

      {body}

      <footer className={styles.footer}>
        <div className={styles.autoRefresh}>
          <span className={`${styles.indicator} ${error ? styles.indicatorError : ''}`} />
          <span>{error && board ? t.updateFailed : t.autoUpdate}</span>
        </div>
        <div>{lastUpdate ? formatTime(lastUpdate) : '--:--'}</div>
      </footer>
    </section>
  );
};

export default SbbAbfahrtstafel;
