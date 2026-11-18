declare interface ISbbAbfahrtstafelWebPartStrings {
  PropertyPaneDescription: string;
  StationGroupName: string;
  StationFieldLabel: string;
  StationFieldDescription: string;
  StationRequired: string;
  StationNotFound: string;
  StationSuggestion: string;
  TitleFieldLabel: string;
  TitleFieldDescription: string;
  DisplayGroupName: string;
  LimitFieldLabel: string;
  ViaFieldLabel: string;
  RefreshFieldLabel: string;
  ClockFieldLabel: string;
  TransportationsLabel: string;
  TransportTrain: string;
  TransportTram: string;
  TransportBus: string;
  TransportShip: string;
  TransportCableway: string;

  BoardAriaLabel: string;
  ColTime: string;
  ColTrain: string;
  ColPlatform: string;
  Via: string;
  Direction: string;
  Platform: string;
  Planned: string;
  PlatformChanged: string;
  DelayAria: string;
  Loading: string;
  NoStationConfigured: string;
  NoDepartures: string;
  ConnectionError: string;
  UnknownError: string;
  AutoUpdate: string;
  UpdateFailed: string;
}

declare module 'SbbAbfahrtstafelWebPartStrings' {
  const strings: ISbbAbfahrtstafelWebPartStrings;
  export = strings;
}
