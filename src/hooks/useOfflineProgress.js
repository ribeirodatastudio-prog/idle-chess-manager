import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateOfflineGain } from '../logic/math';

const STORAGE_KEY = 'chess-career-save-v2';

export const useOfflineProgress = (productionRatePerSecond) => {
  const [isLoading, setIsLoading] = useState(false);
  const [offlineReport, setOfflineReport] = useState(null);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      const lastSaveTime = parsed.lastSaveTime;

      const result = calculateOfflineGain(lastSaveTime, productionRatePerSecond);

      if (result) {
        setIsLoading(true);
        // Simulate "Calculating" delay
        setTimeout(() => {
          setOfflineReport(result);
          setIsLoading(false);
        }, 2000);
      }
    } catch (e) {
      console.error("Failed to check offline progress", e);
    }
  }, [productionRatePerSecond]);

  const clearReport = useCallback(() => {
    setOfflineReport(null);
  }, []);

  return {
    isLoading,
    offlineReport,
    clearReport
  };
};
