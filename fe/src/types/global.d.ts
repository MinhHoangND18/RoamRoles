export {};

declare global {
  interface Window {
    __data: {
      cfg?: {
        adService?: {
          adFormatRequest: string[];
          contentArb: {
            system: string[];
            sid: {
              adsense: string;
            };
          };
        };
      };
    };
    __arbAPI: {
      init: () => void;
      initPageContent: () => void;
      onContentRenderEnded: () => void;
    };
  }
}