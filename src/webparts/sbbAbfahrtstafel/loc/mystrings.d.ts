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
  LanguageFieldLabel: string;
  LanguageAuto: string;
  TransportationsLabel: string;
  TransportTrain: string;
  TransportTram: string;
  TransportBus: string;
  TransportShip: string;
  TransportCableway: string;

}

declare module 'SbbAbfahrtstafelWebPartStrings' {
  const strings: ISbbAbfahrtstafelWebPartStrings;
  export = strings;
}
