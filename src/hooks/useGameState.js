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

// Updated Tournament Structure
const INITIAL_TOURNAMENT = {
  active: false,
  opponentStats: null,
  activeMode: null, // 'rapid', 'blitz', 'classical'
  ranks: {
    rapid: 1,
    blitz: 1,
    classical: 1
  }
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

// Helper to get total wins from ranks
const getTotalWins = (ranks) => {
    // ranks start at 1. Wins = rank - 1.
    return (ranks.rapid - 1) + (ranks.blitz - 1) + (ranks.classical - 1);
};

export const useGameState = () => {
  // 1. Resources State
  const [resources, setResources] = useState(() => {
    const saved = loadSave();
    let initial = { ...INITIAL_RESOURCES };

    if (saved && saved.resources) {
        initial = { ...initial, ...saved.resources };

        // Calculate Offline Gain
        if (saved.lastSaveTime && saved.tournament) {
            // Handle migration from old structure if necessary
            let wins = 0;
            if (saved.tournament.ranks) {
                wins = getTotalWins(saved.tournament.ranks);
            } else if (saved.tournament.wins) {
                wins = saved.tournament.wins;
            }

            const offlineGain = calculateOfflineGain(saved.lastSaveTime, wins);
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
    if (saved && saved.tournament) {
        // Migration logic: If old structure (wins/currentLevel) exists but ranks doesn't
        if (!saved.tournament.ranks) {
            return {
                ...INITIAL_TOURNAMENT,
                ranks: {
                    rapid: saved.tournament.currentLevel || 1,
                    blitz: 1,
                    classical: 1
                }
            };
        }
        return { ...INITIAL_TOURNAMENT, ...saved.tournament };
    }
    return { ...INITIAL_TOURNAMENT };
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

  // Derived Values
  const totalWins = useMemo(() => {
      return getTotalWins(tournament.ranks);
  }, [tournament.ranks]);

  // Trigger-Save on Important Changes
  useEffect(() => {
      saveGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, skills, totalWins, tournament.active]);

  // Derived Stats
  const playerElo = useMemo(() => {
    const totalLevels = Object.values(stats).reduce((a, b) => a + b, 0);
    return 100 + totalLevels;
  }, [stats]);

  const totalAbilityPoints = useMemo(() => {
    return calculateTotalPoints(playerElo, totalWins);
  }, [playerElo, totalWins]);

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
        // Use totalWins for income
        // We need to access totalWins inside here.
        // Can't use `totalWins` from outer scope easily in interval if we want to avoid recreating interval.
        // But `tournament` changes when ranks change.
        // Let's rely on prev state? No, tournament is separate state.

        // Better: Use `tournament` in dependency array and recreate interval?
        // Or calculate totalWins from `prevTournament` ref if we had one.
        // Actually, we can use the `stateRef` which is always current!

        const currentRanks = stateRef.current.tournament.ranks;
        const currentWins = getTotalWins(currentRanks);

        const income = calculatePassiveIncomePerSecond(currentWins);
        return {
          ...prev,
          studyTime: prev.studyTime + income
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Empty dependency since we use ref

  // Actions
  const upgradeStat = useCallback((statName) => {
    setResources(prevRes => {
        const currentLevel = stats[statName];
        const hasPrepFiles = skills['prep_files'];
        const cost = calculateUpgradeCost(currentLevel, hasPrepFiles && statName === 'opening');

        if (prevRes.studyTime >= cost) {
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
      const skill = getSkillById(skillId);
      if (skill && !skills[skillId] && availableAbilityPoints >= skill.cost) {
          setSkills(prev => ({
              ...prev,
              [skillId]: true
          }));
      }
  }, [skills, availableAbilityPoints]);

  const startTournament = useCallback((opponentStats, mode) => {
      setTournament(prev => ({
          ...prev,
          active: true,
          activeMode: mode,
          opponentStats
      }));
  }, []);

  const endTournament = useCallback((result, finalMoveCount) => {
      setTournament(prev => {
          if (result === 'win') {
              const currentWins = getTotalWins(prev.ranks);
              const currentIncome = calculatePassiveIncomePerSecond(currentWins);

              // Determine prize
              let prizeSeconds = 600;
              if (skills['book_worm'] && finalMoveCount < 20) {
                  prizeSeconds *= 1.5;
              }

              // Award Prize (Side Effect in state update - acceptable here for simplicity)
              setResources(res => ({
                  ...res,
                  studyTime: res.studyTime + (currentIncome * prizeSeconds)
              }));

              const currentMode = prev.activeMode || 'rapid';

              return {
                  ...prev,
                  active: false,
                  activeMode: null,
                  ranks: {
                      ...prev.ranks,
                      [currentMode]: prev.ranks[currentMode] + 1
                  }
              };
          } else {
              return {
                  ...prev,
                  active: false,
                  activeMode: null
              };
          }
      });
  }, [skills]);

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
      totalAbilityPoints,
      totalWins // Export this for UI
  };

  const state = {
      resources,
      stats,
      skills,
      tournament,
      lastSaveTime: Date.now()
  };

  return {
      state,
      derivedStats,
      actions
  };
};
