import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { calculatePassiveIncomePerSecond, calculateUpgradeCost, calculateOfflineGain } from '../logic/math';
import { getSkillById } from '../logic/skills';

const STORAGE_KEY = 'chess-career-save';

const INITIAL_RESOURCES = {
  studyTime: 0
};

const INITIAL_STATS = {
  opening: 1,
  midgame: 1,
  endgame: 1,
  tactics: 1,
  sacrifices: 1
};

const INITIAL_SKILLS = {}; // id -> boolean

const INITIAL_TOURNAMENT = {
  wins: 0,
  active: false,
  opponentStats: null,
  currentLevel: 1
};

// Helper to read save safely
const loadSave = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to load save", e);
    }
    return null;
};

const calculateTotalPoints = (elo, wins) => {
    const fromElo = Math.floor((elo - 100) / 300);
    const fromWins = Math.floor(wins / 10);
    return fromElo + fromWins;
};

export const useGameState = () => {
  // 1. Resources State with Offline Gain Logic
  const [resources, setResources] = useState(() => {
    const saved = loadSave();
    let initial = { ...INITIAL_RESOURCES };

    if (saved && saved.resources) {
        initial = { ...initial, ...saved.resources };

        // Calculate Offline Gain
        if (saved.lastSaveTime && saved.tournament) {
            const offlineGain = calculateOfflineGain(saved.lastSaveTime, saved.tournament.wins || 0);
            if (offlineGain > 0) {
                console.log(`Offline Gain: ${offlineGain}`);
                initial.studyTime += offlineGain;
            }
        }
    }
    return initial;
  });

  // 2. Stats State
  const [stats, setStats] = useState(() => {
    const saved = loadSave();
    return (saved && saved.stats) ? { ...INITIAL_STATS, ...saved.stats } : { ...INITIAL_STATS };
  });

  // 3. Skills State
  const [skills, setSkills] = useState(() => {
    const saved = loadSave();
    return (saved && saved.skills) ? { ...INITIAL_SKILLS, ...saved.skills } : { ...INITIAL_SKILLS };
  });

  // 4. Tournament State
  const [tournament, setTournament] = useState(() => {
    const saved = loadSave();
    return (saved && saved.tournament) ? { ...INITIAL_TOURNAMENT, ...saved.tournament } : { ...INITIAL_TOURNAMENT };
  });

  // Ref to hold current state for saving
  const stateRef = useRef({ resources, stats, skills, tournament });

  // Keep Ref updated
  useEffect(() => {
    stateRef.current = { resources, stats, skills, tournament };
  }, [resources, stats, skills, tournament]);

  // Save Function
  const saveGame = useCallback(() => {
      const stateToSave = {
          ...stateRef.current,
          lastSaveTime: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, []);

  // Auto-Save Interval (30s)
  useEffect(() => {
      const interval = setInterval(saveGame, 30000);
      return () => clearInterval(interval);
  }, [saveGame]);

  // Trigger-Save on Important Changes (Stats, Skills, Tournament)
  useEffect(() => {
      saveGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, skills, tournament.wins, tournament.active]);
  // Note: We intentionally don't include resources here to avoid saving on every tick

  // Derived Stats
  const playerElo = useMemo(() => {
    const totalLevels = Object.values(stats).reduce((a, b) => a + b, 0);
    return 100 + totalLevels;
  }, [stats]);

  const totalAbilityPoints = useMemo(() => {
    return calculateTotalPoints(playerElo, tournament.wins);
  }, [playerElo, tournament.wins]);

  const usedAbilityPoints = useMemo(() => {
    return Object.keys(skills).reduce((total, skillId) => {
      if (skills[skillId]) {
        const skill = getSkillById(skillId);
        return total + (skill ? skill.cost : 1);
      }
      return total;
    }, 0);
  }, [skills]);

  const availableAbilityPoints = totalAbilityPoints - usedAbilityPoints;

  // Passive Income Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => {
        const income = calculatePassiveIncomePerSecond(tournament.wins);
        return {
          ...prev,
          studyTime: prev.studyTime + income
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament.wins]);

  // Actions
  const upgradeStat = useCallback((statName) => {
    setResources(prevRes => {
        // We need access to current stats inside this updater or use the stats from scope?
        // Using stats from scope is fine because if stats change, the callback is recreated (dep array).
        // BUT for precise calculation, we should probably access the *ref* or careful dependency.
        // Actually, let's use the functional update pattern but we need the cost.
        // The cost depends on the *current level*.
        
        // Issue: If we use `stats` from closure, and `upgradeStat` is called, it's fine.
        // But we need to update both resources AND stats.
        
        const currentLevel = stats[statName];
        const hasPrepFiles = skills['prep_files'];
        const cost = calculateUpgradeCost(currentLevel, hasPrepFiles && statName === 'opening');

        if (prevRes.studyTime >= cost) {
            // Update Stats
            setStats(prevStats => ({
                ...prevStats,
                [statName]: prevStats[statName] + 1
            }));

            return {
                ...prevRes,
                studyTime: prevRes.studyTime - cost
            };
        }
        return prevRes;
    });
  }, [stats, skills]);

  const purchaseSkill = useCallback((skillId) => {
      // Logic for AP check needs latest data.
      // We can use the derived `availableAbilityPoints` from closure.
      const skill = getSkillById(skillId);

      if (skill && !skills[skillId] && availableAbilityPoints >= skill.cost) {
          setSkills(prev => ({
              ...prev,
              [skillId]: true
          }));
      }
  }, [skills, availableAbilityPoints]);

  const startTournament = useCallback((opponentStats) => {
      setTournament(prev => ({
          ...prev,
          active: true,
          opponentStats
      }));
  }, []);

  const endTournament = useCallback((result, finalMoveCount) => {
      if (result === 'win') {
          // Calculate prize
          const currentIncome = calculatePassiveIncomePerSecond(tournament.wins);
          let prizeSeconds = 600;
          if (skills['book_worm'] && finalMoveCount < 20) {
              prizeSeconds *= 1.5;
          }

          setResources(prev => ({
              ...prev,
              studyTime: prev.studyTime + (currentIncome * prizeSeconds)
          }));

          setTournament(prev => ({
              ...prev,
              active: false,
              wins: prev.wins + 1,
              currentLevel: prev.currentLevel + 1
          }));
      } else {
          setTournament(prev => ({
              ...prev,
              active: false
          }));
      }
  }, [tournament.wins, skills]);

  // Debug Actions
  const addResource = useCallback((amount) => {
      setResources(prev => ({ ...prev, studyTime: prev.studyTime + amount }));
  }, []);

  const resetGame = useCallback(() => {
      localStorage.removeItem(STORAGE_KEY);
      setResources(INITIAL_RESOURCES);
      setStats(INITIAL_STATS);
      setSkills(INITIAL_SKILLS);
      setTournament(INITIAL_TOURNAMENT);
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

  // Reconstruct full state object for compatibility with consumers
  const state = {
      resources,
      stats,
      skills,
      tournament,
      lastSaveTime: Date.now() // rough estimate
  };

  return {
      state,
      derivedStats,
      actions
  };
};
