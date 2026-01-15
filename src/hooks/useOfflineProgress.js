import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateOfflineGain } from '../logic/math';

const STORAGE_KEY = 'chess-career-save-v2';

export const useOfflineProgress = (productionRatePerSecond) => {
  const [isLoading, setIsLoading] = useState(false);
  const [offlineReport, setOfflineReport] = useState(null);
  const hasChecked = useRef(false);

  // Manual check function
  const checkProgress = useCallback((lastTime) => {
      if (!lastTime) return;

      try {
          const result = calculateOfflineGain(lastTime, productionRatePerSecond);

          if (result) {
              setIsLoading(true);
              // Simulate "Calculating" delay
              setTimeout(() => {
                  setOfflineReport(result);
                  setIsLoading(false);
              }, 2000);
          }
      } catch (e) {
          console.error("Failed to calculate offline progress", e);
      }
  }, [productionRatePerSecond]);

  // Initial Cold Start Check
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      const lastSaveTime = parsed.lastSaveTime;

      if (lastSaveTime) {
          checkProgress(lastSaveTime);
      }
    } catch (e) {
      console.error("Failed to check offline progress", e);
    }
  }, [checkProgress]);

  const clearReport = useCallback(() => {
    setOfflineReport(null);
  }, []);

  return {
    isLoading,
    offlineReport,
    checkProgress,
    clearReport
  };
};
