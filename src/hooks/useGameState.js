import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { calculatePassiveIncomePerSecond, calculateUpgradeCost } from '../logic/math';
import { getSkillById } from '../logic/skills';
import { TOURNAMENT_CONFIG, TIERS_PER_TOURNAMENT, MATCHES_PER_TIER } from '../logic/tournaments';
import { useOfflineProgress } from './useOfflineProgress';

const STORAGE_KEY = 'chess-career-save';

const INITIAL_RESOURCES = {
  studyTime: 0
};

const INITIAL_STATS = {
  opening: 1,
  midgame: 1,
  endgame: 1,
  tactics: 1,
  sacrifices: 1,
  defense: 1
};

const INITIAL_SKILLS = {}; // id -> boolean

// Updated Tournament Structure
const INITIAL_TOURNAMENT = {
  active: false,
  opponentStats: null,
  activeMode: null, // 'rapid', 'blitz', 'classical'
  ranks: {
    rapid: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
    blitz: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
    classical: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 }
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
    let total = 0;
    ['rapid', 'blitz', 'classical'].forEach(mode => {
        const r = ranks[mode];
        if (typeof r === 'number') {
             // Fallback/Legacy
             total += r - 1;
        } else if (r) {
             total += (r.tournamentIndex * TIERS_PER_TOURNAMENT * MATCHES_PER_TIER) +
                      (r.tierIndex * MATCHES_PER_TIER) +
                      r.matchIndex;
        }
    });
    return total;
};

export const useGameState = () => {
  // 1. Resources State
  const [resources, setResources] = useState(() => {
    const saved = loadSave();
    let initial = { ...INITIAL_RESOURCES };
    if (saved && saved.resources) {
        initial = { ...initial, ...saved.resources };
    }
    return initial;
  });

  // Calculate Initial Rate for Offline Progress
  const initialProductionRate = useMemo(() => {
      const saved = loadSave();
      if (saved && saved.tournament) {
          // Migration logic to get ranks safe
          let ranks = saved.tournament.ranks;
          if (!ranks) {
              const lvl = saved.tournament.currentLevel || 1;
              ranks = { rapid: lvl, blitz: 1, classical: 1 };
          }

          // Calculate Rate (Cumulative)
          const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
          const cumulativeIdx = (ranks.rapid ? getIdx(ranks.rapid) : 0) +
                                (ranks.blitz ? getIdx(ranks.blitz) : 0) +
                                (ranks.classical ? getIdx(ranks.classical) : 0);

          return calculatePassiveIncomePerSecond(cumulativeIdx);
      }
      return 0;
  }, []);

  // Offline Hook
  const { isLoading: isOfflineLoading, offlineReport, clearReport } = useOfflineProgress(initialProductionRate);

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
        let savedRanks = saved.tournament.ranks;

        // Migration 1: No ranks, only wins/currentLevel (Oldest)
        if (!savedRanks) {
             const lvl = saved.tournament.currentLevel || 1;
             savedRanks = { rapid: lvl, blitz: 1, classical: 1 };
        }

        // Migration 2: Ranks are numbers (Previous Version)
        const migratedRanks = { ...INITIAL_TOURNAMENT.ranks };
        let needsMigration = false;

        ['rapid', 'blitz', 'classical'].forEach(mode => {
            const r = savedRanks[mode];
            if (typeof r === 'number') {
                needsMigration = true;
                const oldRank = r;
                // safeTIdx caps at max tournaments
                const tIdx = Math.min(Math.floor((oldRank - 1) / TIERS_PER_TOURNAMENT), TOURNAMENT_CONFIG.length - 1);
                const tierIdx = (oldRank - 1) % TIERS_PER_TOURNAMENT;

                migratedRanks[mode] = {
                    tournamentIndex: tIdx,
                    tierIndex: tierIdx,
                    matchIndex: 0
                };
            } else if (r) {
                migratedRanks[mode] = r;
            }
        });

        if (needsMigration) {
             return { ...INITIAL_TOURNAMENT, ...saved.tournament, ranks: migratedRanks };
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

  // Emergency Save on Close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGame();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveGame]);

  // Derived Values
  const totalWins = useMemo(() => {
      return getTotalWins(tournament.ranks);
  }, [tournament.ranks]);

  // Calculate Cumulative Tournament Index across all modes for economy
  const cumulativeTournamentIndex = useMemo(() => {
      const { rapid, blitz, classical } = tournament.ranks;
      const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
      return getIdx(rapid) + getIdx(blitz) + getIdx(classical);
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
      // Pause if calculating offline progress or showing report
      if (isOfflineLoading || offlineReport) return;

      setResources(prev => {
        const currentRanks = stateRef.current.tournament.ranks;

        // Calculate Cumulative Tournament Index
        const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
        const cumulativeIdx = getIdx(currentRanks.rapid) + getIdx(currentRanks.blitz) + getIdx(currentRanks.classical);

        const income = calculatePassiveIncomePerSecond(cumulativeIdx);
        return {
          ...prev,
          studyTime: prev.studyTime + income
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOfflineLoading, offlineReport]);

  // Actions
  const upgradeStat = useCallback((statName) => {
    // Hard Cap for Sacrifices
    if (statName === 'sacrifices' && stats.sacrifices >= 500) {
        return;
    }

    setResources(prevRes => {
        const currentLevel = stats[statName];
        const hasPrepFiles = skills['prep_files'];
        // Pass statName to calculation for custom logic (Sacrifice Wall)
        const cost = calculateUpgradeCost(currentLevel, hasPrepFiles, statName);

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
              const currentMode = prev.activeMode || 'rapid';
              const currentRank = prev.ranks[currentMode];

              // Check for Tier Clear (Match 0, 1, 2 -> Clear if matchIndex + 1 == 3)
              const isTierClear = (currentRank.matchIndex + 1) === MATCHES_PER_TIER;

              if (isTierClear) {
                  // Calculate Income based on Cumulative Tournament Index
                  const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
                  const cumulativeIdx = getIdx(prev.ranks.rapid) + getIdx(prev.ranks.blitz) + getIdx(prev.ranks.classical);
                  const currentIncome = calculatePassiveIncomePerSecond(cumulativeIdx);

                  // Determine prize
                  let prizeSeconds = 600;
                  if (skills['book_worm'] && finalMoveCount < 20) {
                      prizeSeconds *= 1.5;
                  }

                  // Award Prize
                  setResources(res => ({
                      ...res,
                      studyTime: res.studyTime + (currentIncome * prizeSeconds)
                  }));
              }

              // Progression Logic
              let newMatch = currentRank.matchIndex + 1;
              let newTier = currentRank.tierIndex;
              let newTourn = currentRank.tournamentIndex;

              if (newMatch >= MATCHES_PER_TIER) {
                  newMatch = 0;
                  newTier++;
                  if (newTier >= TIERS_PER_TOURNAMENT) {
                      newTier = 0;
                      newTourn++;
                      if (newTourn >= TOURNAMENT_CONFIG.length) {
                          newTourn = TOURNAMENT_CONFIG.length - 1; // Cap at max
                          newTier = TIERS_PER_TOURNAMENT - 1; // Cap at max tier
                          newMatch = MATCHES_PER_TIER - 1; // Cap at max match
                      }
                  }
              }

              return {
                  ...prev,
                  active: false,
                  activeMode: null,
                  ranks: {
                      ...prev.ranks,
                      [currentMode]: {
                          tournamentIndex: newTourn,
                          tierIndex: newTier,
                          matchIndex: newMatch
                      }
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

  const claimOfflineReward = useCallback(() => {
      if (offlineReport) {
          setResources(prev => ({
              ...prev,
              studyTime: prev.studyTime + offlineReport.gain
          }));
          clearReport();
      }
  }, [offlineReport, clearReport]);

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
      clearReport();
  }, [clearReport]);

  const actions = useMemo(() => ({
      upgradeStat,
      purchaseSkill,
      startTournament,
      endTournament,
      addResource,
      resetGame,
      claimOfflineReward
  }), [upgradeStat, purchaseSkill, startTournament, endTournament, addResource, resetGame, claimOfflineReward]);

  const derivedStats = {
      playerElo,
      availableAbilityPoints,
      totalAbilityPoints,
      totalWins,
      cumulativeTournamentIndex // Export for UI
  };

  const state = {
      resources,
      stats,
      skills,
      tournament,
      offlineReport,
      isOfflineLoading,
      lastSaveTime: Date.now()
  };

  return {
      state,
      derivedStats,
      actions
  };
};
