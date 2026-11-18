# SBB-Abfahrtstafel (SPFx-Webpart)

Zeigt die nächsten Abfahrten einer Haltestelle des öffentlichen Verkehrs in der Schweiz im Stil der SBB-Anzeigetafeln.
Daten: [transport.opendata.ch](https://transport.opendata.ch) (anonym, kein API-Key nötig).

<img width="441" height="535" alt="image" src="https://github.com/user-attachments/assets/627622e7-2677-43c2-a4c3-5793c7d1cdb6" />
<img width="1074" height="1040" alt="image" src="https://github.com/user-attachments/assets/873b7d82-ff3f-4d34-b7a1-7ceb287e1260" />

## Funktionen

- Haltestelle frei wählbar, mit Prüfung und Vorschlägen im Eigenschaftenfenster
- Anzahl Abfahrten (1–20), Anzahl Via-Halte (0–3), Aktualisierungsintervall (15–300 s)
- Filter nach Verkehrsmittel (Zug, Tram, Bus, Schiff, Seilbahn)
- Linienbezeichnung wie auf den SBB-Anzeigern (IC 21, S31, VAE, Bus 7 …)
- Verspätungen (+n′) und echte Gleisänderungen (rot blinkend, mit geplantem Gleis im Tooltip)
- Keine Abfragen, solange der Browser-Tab im Hintergrund ist
- Sprache der Tafel wählbar: Deutsch, Français, Italiano, English oder automatisch (Sprache von SharePoint); Eigenschaftenfenster auf Deutsch/Englisch

## Entwicklung

| | |
|---|---|
| SPFx | 1.24.1 (Heft) |
| Node | 22.14+ / 24 LTS |
| UI | React 18 |

```bash
npm install
npm start          # lokale Workbench (heft start)
npm run build      # Produktionsbuild + Paket → sharepoint/solution/sbb-abfahrtstafel.sppkg
```

## Deployment

```powershell
Connect-PnPOnline -Url https://<tenant>-admin.sharepoint.com -Interactive -ClientId <ClientId>
Add-PnPApp -Path ./sharepoint/solution/sbb-abfahrtstafel.sppkg -Scope Tenant -Publish -Overwrite
```

Es sind keine API-Berechtigungen (`webApiPermissionRequests`) nötig.
Vor jedem neuen Paket die Version in `config/package-solution.json` erhöhen.
