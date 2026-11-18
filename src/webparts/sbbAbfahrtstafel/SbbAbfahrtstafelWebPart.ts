import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneField,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle,
  PropertyPaneCheckbox,
  PropertyPaneLabel,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'SbbAbfahrtstafelWebPartStrings';
import SbbAbfahrtstafel from './components/SbbAbfahrtstafel';
import type { ISbbAbfahrtstafelProps } from './components/ISbbAbfahrtstafelProps';
import { TransportService, ALL_TRANSPORTATIONS, type Transportation } from './services/TransportService';
import { getBoardStrings, type BoardLanguage } from './i18n/boardStrings';

export interface ISbbAbfahrtstafelWebPartProps {
  station: string;
  title: string;
  language: BoardLanguage;
  limit: number;
  refreshSeconds: number;
  viaCount: number;
  showClock: boolean;
  showTrain: boolean;
  showTram: boolean;
  showBus: boolean;
  showShip: boolean;
  showCableway: boolean;
}

const TRANSPORT_PROPS: Record<Transportation, keyof ISbbAbfahrtstafelWebPartProps> = {
  train: 'showTrain',
  tram: 'showTram',
  bus: 'showBus',
  ship: 'showShip',
  cableway: 'showCableway'
};

export default class SbbAbfahrtstafelWebPart extends BaseClientSideWebPart<ISbbAbfahrtstafelWebPartProps> {
  private _root: Root | undefined;
  private _service!: TransportService;

  protected onInit(): Promise<void> {
    this._service = new TransportService(this.context.httpClient);
    return super.onInit();
  }

  public render(): void {
    const p = this.properties;
    const element: React.ReactElement<ISbbAbfahrtstafelProps> = React.createElement(SbbAbfahrtstafel, {
      service: this._service,
      station: (p.station || '').trim(),
      title: (p.title || '').trim(),
      limit: p.limit || 5,
      refreshSeconds: p.refreshSeconds || 30,
      viaCount: p.viaCount ?? 1,
      showClock: p.showClock !== false,
      // Ohne gespeicherte Einstellung (ältere Instanzen) gilt Deutsch
      texts: getBoardStrings(p.language || 'de', this.context.pageContext.cultureInfo.currentUICultureName),
      transportations: ALL_TRANSPORTATIONS.filter(t => p[TRANSPORT_PROPS[t]] !== false)
    });

    if (!this._root) {
      this._root = createRoot(this.domElement);
    }
    this._root.render(element);
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private async _validateStation(value: string): Promise<string> {
    const query = (value || '').trim();
    if (!query) {
      return strings.StationRequired;
    }
    try {
      const names = await this._service.findStations(query);
      if (names.length === 0) {
        return strings.StationNotFound;
      }
      const exact = names.some(n => n.toLowerCase() === query.toLowerCase());
      return exact ? '' : strings.StationSuggestion.replace('{0}', names.slice(0, 3).join(', '));
    } catch {
      // Validierung soll das Speichern nicht blockieren, wenn die API kurz nicht erreichbar ist
      return '';
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const transportFields: IPropertyPaneField<unknown>[] = [
      PropertyPaneLabel('transportLabel', { text: strings.TransportationsLabel }),
      PropertyPaneCheckbox('showTrain', { text: strings.TransportTrain }),
      PropertyPaneCheckbox('showTram', { text: strings.TransportTram }),
      PropertyPaneCheckbox('showBus', { text: strings.TransportBus }),
      PropertyPaneCheckbox('showShip', { text: strings.TransportShip }),
      PropertyPaneCheckbox('showCableway', { text: strings.TransportCableway })
    ];

    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.StationGroupName,
              groupFields: [
                PropertyPaneTextField('station', {
                  label: strings.StationFieldLabel,
                  description: strings.StationFieldDescription,
                  onGetErrorMessage: this._validateStation.bind(this),
                  deferredValidationTime: 600
                }),
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                  description: strings.TitleFieldDescription
                })
              ]
            },
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneDropdown('language', {
                  label: strings.LanguageFieldLabel,
                  options: [
                    { key: 'auto', text: strings.LanguageAuto },
                    { key: 'de', text: 'Deutsch' },
                    { key: 'fr', text: 'Français' },
                    { key: 'it', text: 'Italiano' },
                    { key: 'en', text: 'English' }
                  ],
                  selectedKey: this.properties.language || 'de'
                }),
                PropertyPaneSlider('limit', { label: strings.LimitFieldLabel, min: 1, max: 20, step: 1 }),
                PropertyPaneSlider('viaCount', { label: strings.ViaFieldLabel, min: 0, max: 3, step: 1 }),
                PropertyPaneSlider('refreshSeconds', { label: strings.RefreshFieldLabel, min: 15, max: 300, step: 15 }),
                PropertyPaneToggle('showClock', { label: strings.ClockFieldLabel }),
                ...transportFields
              ]
            }
          ]
        }
      ]
    };
  }
}
