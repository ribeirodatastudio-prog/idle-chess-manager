import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { calculatePassiveIncomePerSecond, calculateUpgradeCost, calculateOfflineGain, STATS } from '../logic/math';
import { getSkillById } from '../logic/skills';

const INITIAL_STATE = {
  resources: {
    studyTime: 0
  },
  stats: {
    opening: 1,
    midgame: 1,
    endgame: 1,
    tactics: 1,
    sacrifices: 1
  },
  skills: {}, // id -> boolean (owned)
  tournament: {
    wins: 0,
    active: false,
    opponentStats: null, // Will be set when tournament starts
    currentLevel: 1 // Visual tournament number
  },
  lastSaveTime: Date.now()
};

const STORAGE_KEY = 'chess-career-save';

// Helper for consistency
const calculateTotalPoints = (elo, wins) => {
    const fromElo = Math.floor((elo - 100) / 300);
    const fromWins = Math.floor(wins / 10);
    return fromElo + fromWins;
};

export const useGameState = () => {
  const [state, setState] = useState(() => {
    // Load from local storage or use initial state
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure structure compatibility
        return { 
          ...INITIAL_STATE, 
          ...parsed, 
          resources: { ...INITIAL_STATE.resources, ...parsed.resources }, 
          stats: { ...INITIAL_STATE.stats, ...parsed.stats }, 
          tournament: { ...INITIAL_STATE.tournament, ...parsed.tournament },
          skills: { ...INITIAL_STATE.skills, ...(parsed.skills || {}) }
        };
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
    return INITIAL_STATE;
  });

  const stateRef = useRef(state); // Ref to access latest state in intervals if needed

  // Save to local storage effect
  useEffect(() => {
    stateRef.current = state;
    const saveInterval = setInterval(() => {
      const stateToSave = { ...stateRef.current, lastSaveTime: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, 10000); // Save every 10s

    return () => clearInterval(saveInterval);
  }, [state]);

  // Derived State Calculation
  const playerElo = useMemo(() => {
    const totalLevels = Object.values(state.stats).reduce((a, b) => a + b, 0);
    return 100 + totalLevels;
  }, [state.stats]);

  const totalAbilityPoints = useMemo(() => {
    return calculateTotalPoints(playerElo, state.tournament.wins);
  }, [playerElo, state.tournament.wins]);

  const usedAbilityPoints = useMemo(() => {
    return Object.keys(state.skills).reduce((total, skillId) => {
      if (state.skills[skillId]) {
        const skill = getSkillById(skillId);
        return total + (skill ? skill.cost : 1);
      }
      return total;
    }, 0);
  }, [state.skills]);

  const availableAbilityPoints = totalAbilityPoints - usedAbilityPoints;

  // Offline progress (on mount only)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const offlineGain = calculateOfflineGain(parsed.lastSaveTime, parsed.tournament.wins);
      if (offlineGain > 0) {
        console.log(`Offline Gain: ${offlineGain}`);
        setState(prev => ({
          ...prev,
          resources: {
            ...prev.resources,
            studyTime: prev.resources.studyTime + offlineGain
          }
        }));
      }
    }
  }, []);

  // Passive Income Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const income = calculatePassiveIncomePerSecond(prev.tournament.wins);
        return {
          ...prev,
          resources: {
            ...prev.resources,
            studyTime: prev.resources.studyTime + income
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Actions
  const upgradeStat = useCallback((statName) => {
    setState(prev => {
      const currentLevel = prev.stats[statName];
      // Check for Prep Files skill
      const hasPrepFiles = prev.skills && prev.skills['prep_files'];
      const cost = calculateUpgradeCost(currentLevel, hasPrepFiles && statName === 'opening');
      
      if (prev.resources.studyTime >= cost) {
        return {
          ...prev,
          resources: {
            ...prev.resources,
            studyTime: prev.resources.studyTime - cost
          },
          stats: {
            ...prev.stats,
            [statName]: currentLevel + 1
          }
        };
      }
      return prev;
    });
  }, []);

  const purchaseSkill = useCallback((skillId) => {
    setState(prev => {
        // Recalculate available points inside the updater to ensure freshness
        const currentTotalLevels = Object.values(prev.stats).reduce((a, b) => a + b, 0);
        const currentElo = 100 + currentTotalLevels;
        
        const currentTotalPoints = calculateTotalPoints(currentElo, prev.tournament.wins);
        
        const currentUsedPoints = Object.keys(prev.skills).reduce((total, sId) => {
             if (prev.skills[sId]) {
                const s = getSkillById(sId);
                return total + (s ? s.cost : 1);
             }
             return total;
        }, 0);
        
        const currentAvailable = currentTotalPoints - currentUsedPoints;
        const skill = getSkillById(skillId);
        
        if (skill && !prev.skills[skillId] && currentAvailable >= skill.cost) {
             return {
                 ...prev,
                 skills: {
                     ...prev.skills,
                     [skillId]: true
                 }
             };
        }
        return prev;
    });
  }, []);

  const startTournament = useCallback((opponentStats) => {
    setState(prev => ({
      ...prev,
      tournament: {
        ...prev.tournament,
        active: true,
        opponentStats
      }
    }));
  }, []);

  const endTournament = useCallback((result, finalMoveCount) => {
    // result: 'win' | 'loss' | 'draw'
    setState(prev => {
      if (result === 'win') {
        const currentIncome = calculatePassiveIncomePerSecond(prev.tournament.wins);
        let prizeSeconds = 600; // 10 minutes prize
        
        if (prev.skills['book_worm'] && finalMoveCount < 20) {
            prizeSeconds *= 1.5;
        }

        return {
          ...prev,
          resources: {
              ...prev.resources,
              studyTime: prev.resources.studyTime + (currentIncome * prizeSeconds)
          },
          tournament: {
            ...prev.tournament,
            active: false,
            wins: prev.tournament.wins + 1,
            currentLevel: prev.tournament.currentLevel + 1
          }
        };
      } else {
        return {
          ...prev,
          tournament: {
            ...prev.tournament,
            active: false
          }
        };
      }
    });
  }, []);
  
  // Debug / Testing
  const addResource = useCallback((amount) => {
    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, studyTime: prev.resources.studyTime + amount }
    }));
  }, []);
  
  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  }, []);

  const actions = useMemo(() => ({
    upgradeStat,
    purchaseSkill,
    startTournament,
    endTournament,
    addResource,
    resetGame
  }), [upgradeStat, purchaseSkill, startTournament, endTournament, addResource, resetGame]);

  const derivedStats = {
      playerElo,
      availableAbilityPoints,
      totalAbilityPoints
  };

  return {
    state,
    derivedStats,
    actions
  };
};
