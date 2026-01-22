'use client';

import { useEffect } from 'react';

const DisableAds = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.__arbAPI) {
      const originalInit = window.__arbAPI.init;
      const originalInitPageContent = window.__arbAPI.initPageContent;
      
      window.__arbAPI.init = () => {};
      window.__arbAPI.initPageContent = () => {};
      window.__arbAPI.onContentRenderEnded = () => {};
    }
    const removeAds = () => {
      const adPlaces = document.querySelectorAll('.ad-place, .advertisement, [data-ad-mode]');
      adPlaces.forEach((ad) => {
        const parent = ad.closest('.advertisement') || ad.parentElement;
        if (parent && parent.classList.contains('advertisement')) {
          parent.remove();
        } else {
          ad.remove();
        }
      });

      const injectedAds = document.querySelectorAll('[id*="ad"], [class*="ad-"], [data-ad]');
      injectedAds.forEach((ad) => {
        if (ad.textContent?.includes('Advertisement') || 
            ad.getAttribute('data-ad-mode') ||
            ad.classList.contains('ad-place')) {
          ad.remove();
        }
      });
    };

    removeAds();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { 
            const element = node as Element;
            if (element.querySelectorAll) {
              const ads = element.querySelectorAll('.ad-place, .advertisement, [data-ad-mode]');
              ads.forEach((ad) => {
                const parent = ad.closest('.advertisement') || ad.parentElement;
                if (parent && parent.classList.contains('advertisement')) {
                  parent.remove();
                } else {
                  ad.remove();
                }
              });
            }
            if (element.classList?.contains('ad-place') || 
                element.classList?.contains('advertisement') ||
                element.getAttribute('data-ad-mode')) {
              element.remove();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also run periodically to catch any ads that slip through
    const interval = setInterval(removeAds, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default DisableAds;

