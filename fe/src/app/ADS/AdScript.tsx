'use client';

import { useEffect } from 'react';

const AdScript = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.__data = window.__data || {};
    window.__data.cfg = window.__data.cfg || {};
    window.__data.cfg.adService = {
      adFormatRequest: ["display", "interstitial", "anchor"],
      contentArb: {
        system: ["adsense"],
        sid: {
          adsense: "ca-pub-4370452252708446"
        }
      }
    };

    const script = document.createElement("script");
    script.src = "https://s3.pubpowerplatform.io/vli-assets/plugins/aff-ads/arb_content.js?v=1.0.1";
    script.defer = true;
    script.type = "text/javascript";
    
    script.onload = () => {
      if (window.__arbAPI) {
        window.__arbAPI.init();
        window.__arbAPI.initPageContent();
        window.__arbAPI.onContentRenderEnded();
      }
      console.log("Ads API loaded:", typeof window.__arbAPI);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default AdScript;