import React, { createContext, useContext, useState } from 'react';

interface AdContextType {
  adsEnabled: boolean;
  toggleAds: () => void;
  adFrequency: number;
  setAdFrequency: (frequency: number) => void;
}

const AdContext = createContext<AdContextType>({
  adsEnabled: true,
  toggleAds: () => {},
  adFrequency: 3,
  setAdFrequency: () => {},
});

export function useAds() {
  return useContext(AdContext);
}

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adFrequency, setAdFrequency] = useState(3);

  const toggleAds = () => setAdsEnabled(prev => !prev);

  return (
    <AdContext.Provider value={{
      adsEnabled,
      toggleAds,
      adFrequency,
      setAdFrequency,
    }}>
      {children}
    </AdContext.Provider>
  );
}