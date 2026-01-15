'use client';

import { useEffect } from 'react';

const DisableAds = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Disable ads API if it exists
    if (window.__arbAPI) {
      // Prevent ads from being initialized
      const originalInit = window.__arbAPI.init;
      const originalInitPageContent = window.__arbAPI.initPageContent;
      
      window.__arbAPI.init = () => {};
      window.__arbAPI.initPageContent = () => {};
      window.__arbAPI.onContentRenderEnded = () => {};
    }

    // Remove any existing ad elements
    const removeAds = () => {
      // Remove ad placeholders
      const adPlaces = document.querySelectorAll('.ad-place, .advertisement, [data-ad-mode]');
      adPlaces.forEach((ad) => {
        const parent = ad.closest('.advertisement') || ad.parentElement;
        if (parent && parent.classList.contains('advertisement')) {
          parent.remove();
        } else {
          ad.remove();
        }
      });

      // Remove ads injected by the script
      const injectedAds = document.querySelectorAll('[id*="ad"], [class*="ad-"], [data-ad]');
      injectedAds.forEach((ad) => {
        // Only remove if it's clearly an ad element
        if (ad.textContent?.includes('Advertisement') || 
            ad.getAttribute('data-ad-mode') ||
            ad.classList.contains('ad-place')) {
          ad.remove();
        }
      });
    };

    // Run immediately and also set up observer
    removeAds();

    // Use MutationObserver to remove ads as they're injected
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
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
            // Check if the node itself is an ad
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

