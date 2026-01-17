import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { calculatePassiveIncomePerSecond, calculateUpgradeCost } from '../logic/math';
import { getSkillById, calculateTenureMultiplier, calculateBranchSP } from '../logic/skills';
import { TOURNAMENT_CONFIG, TIERS_PER_TOURNAMENT, MATCHES_PER_TIER } from '../logic/tournaments';
import { GAME_MODES } from '../logic/gameModes';
import { useOfflineProgress } from './useOfflineProgress';
import { PUZZLE_THEMES } from '../data/puzzles';
import { calculatePuzzleDifficulty, resolvePuzzle } from '../logic/puzzles';

const STORAGE_KEY = 'chess-career-save-v2';

const INITIAL_RESOURCES = {
  studyTime: 0,
  studyPoints: 0,
  reviewTokens: 1 // Start with 1 token
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
  activeMode: null, // 'rapid', 'blitz', 'classical', 'bullet', 'chess960'
  ranks: {
    rapid: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
    blitz: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
    classical: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
    bullet: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
    chess960: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 }
  }
};

const INITIAL_PUZZLE_STATS = {
    elo: 10,
    multiplier: 1.0,
    solvedCount: 0
};

// Helper to get Level
const getLevel = (skills, id) => {
    const val = skills[id];
    if (typeof val === 'number') return val;
    return val ? 1 : 0;
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

// Helper to get total wins from ranks
const getTotalWins = (ranks) => {
    let total = 0;
    GAME_MODES.forEach(modeObj => {
        const r = ranks[modeObj.id];
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

// Helper to calculate total cleared tiers
const calculateTotalTiersCleared = (ranks) => {
    let total = 0;
    GAME_MODES.forEach(modeObj => {
        const r = ranks[modeObj.id];
        if (typeof r === 'object') {
             total += (r.tournamentIndex * TIERS_PER_TOURNAMENT) + r.tierIndex;
        }
    });
    return total;
};

// Helper to calculate used SP
const calculateUsedStudyPoints = (skills) => {
    return Object.keys(skills).reduce((total, skillId) => {
        const skill = getSkillById(skillId);
        if (!skill) return total;

        if (skill.costType === 'SP') {
            const level = typeof skills[skillId] === 'number' ? skills[skillId] : (skills[skillId] ? 1 : 0);
            return total + (skill.spCost * level);
        }
        return total;
    }, 0);
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
      let multiplier = 1.0;

      // Puzzle Multiplier
      if (saved && saved.puzzleStats) {
           multiplier *= (saved.puzzleStats.multiplier || 1.0);
      }

      // Tenure & Instinct Multiplier
      let skills = {};
      if (saved && saved.skills) {
          skills = saved.skills;
      }
      multiplier *= calculateTenureMultiplier(skills);

      // Instinct Hustle
      const tacEcon = getLevel(skills, 'inst_tac_econ');
      const defEcon = getLevel(skills, 'inst_def_econ');
      const riskEcon = getLevel(skills, 'inst_risk_econ');

      let instinctMult = 1.0;
      if (tacEcon > 0) {
          const sp = calculateBranchSP(skills, 'instinct_tactics');
          instinctMult *= (1 + (0.01 * tacEcon * sp));
      }
      if (defEcon > 0) {
          const sp = calculateBranchSP(skills, 'instinct_defense');
          instinctMult *= (1 + (0.01 * defEcon * sp));
      }
      if (riskEcon > 0) {
          const sp = calculateBranchSP(skills, 'instinct_risk');
          instinctMult *= (1 + (0.01 * riskEcon * sp));
      }
      multiplier *= instinctMult;

      if (saved && saved.tournament) {
          // Migration logic to get ranks safe
          let ranks = saved.tournament.ranks;
          if (!ranks) {
              const lvl = saved.tournament.currentLevel || 1;
              ranks = { rapid: lvl, blitz: 1, classical: 1 };
          }

          // Calculate Rate (Cumulative)
          const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
          const getTiers = (r) => (typeof r === 'object' ? (r.tournamentIndex * TIERS_PER_TOURNAMENT + r.tierIndex) : 0);

          let cumulativeIdx = 0;
          let cumulativeTiers = 0;
          GAME_MODES.forEach(m => {
              if (ranks[m.id]) {
                  cumulativeIdx += getIdx(ranks[m.id]);
                  cumulativeTiers += getTiers(ranks[m.id]);
              }
          });

          return calculatePassiveIncomePerSecond(cumulativeIdx, cumulativeTiers) * multiplier;
      }
      return 0;
  }, []);

  // Offline Hook
  const { isLoading: isOfflineLoading, offlineReport, clearReport, checkProgress } = useOfflineProgress(initialProductionRate);

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

        // Migration 2: Ranks are numbers (Previous Version) & New Modes
        const migratedRanks = { ...INITIAL_TOURNAMENT.ranks };

        GAME_MODES.forEach(modeObj => {
            const mode = modeObj.id;
            const r = savedRanks[mode];
            if (typeof r === 'number') {
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
            // If missing (undefined), it stays as default from INITIAL_TOURNAMENT.ranks
        });

        return { ...INITIAL_TOURNAMENT, ...saved.tournament, ranks: migratedRanks };
    }
    return { ...INITIAL_TOURNAMENT };
  });

  // 5. Puzzle State
  const [puzzleStats, setPuzzleStats] = useState(() => {
      const saved = loadSave();
      return (saved && saved.puzzleStats) ? { ...INITIAL_PUZZLE_STATS, ...saved.puzzleStats } : { ...INITIAL_PUZZLE_STATS };
  });

  const [activePuzzle, setActivePuzzle] = useState(() => {
      const saved = loadSave();
      return (saved && saved.activePuzzle) ? saved.activePuzzle : null;
  });

  // Ref to hold current state for saving
  const stateRef = useRef({ resources, stats, skills, tournament, puzzleStats, activePuzzle });
  const saveTimeoutRef = useRef(null);

  // Track last tick for visibility/tab switching gap detection
  const lastTickRef = useRef(Date.now());

  // Keep Ref updated
  useEffect(() => {
    stateRef.current = { resources, stats, skills, tournament, puzzleStats, activePuzzle };
  }, [resources, stats, skills, tournament, puzzleStats, activePuzzle]);

  // Synchronous Save (Core Logic)
  const persistState = useCallback(() => {
      if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
      }
      const stateToSave = {
          ...stateRef.current,
          lastSaveTime: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, []);

  // Debounced Save Wrapper
  const saveGame = useCallback(() => {
      if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
          persistState();
          saveTimeoutRef.current = null;
      }, 2000); // 2 Second Delay
  }, [persistState]);

  // Auto-Save Interval (30s) - Uses debounced save to avoid conflict, or force save?
  // Using debounced save is safer to avoid double-writing if a user action just happened.
  useEffect(() => {
      const interval = setInterval(() => {
          saveGame();
      }, 30000);
      return () => clearInterval(interval);
  }, [saveGame]);

  // Emergency Save on Close - MUST be Synchronous
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistState();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [persistState]);

  // Derived Values
  const totalWins = useMemo(() => {
      return getTotalWins(tournament.ranks);
  }, [tournament.ranks]);

  // Calculate Cumulative Tournament Index across all modes for economy
  const cumulativeTournamentIndex = useMemo(() => {
      const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
      return GAME_MODES.reduce((sum, m) => sum + getIdx(tournament.ranks[m.id]), 0);
  }, [tournament.ranks]);

  const cumulativeTiersCleared = useMemo(() => {
      const getTiers = (r) => (typeof r === 'object' ? (r.tournamentIndex * TIERS_PER_TOURNAMENT + r.tierIndex) : 0);
      return GAME_MODES.reduce((sum, m) => sum + getTiers(tournament.ranks[m.id]), 0);
  }, [tournament.ranks]);

  // Trigger-Save on Important Changes
  useEffect(() => {
      saveGame();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, skills, totalWins, tournament.active, puzzleStats, activePuzzle]);

  // Fix Missing Solved Count (Legacy Save Support)
  useEffect(() => {
      setPuzzleStats(prev => {
          const derived = Math.round(Math.log(prev.multiplier || 1.0) / Math.log(1.01));
          if (prev.solvedCount === undefined || derived > (prev.solvedCount || 0)) {
               return { ...prev, solvedCount: derived };
          }
          return prev;
      });
  }, []);

  // Retroactive SP Check
  useEffect(() => {
      // Calculate expected total SP based on Tiers Cleared + Solved Puzzles
      const tiersSP = calculateTotalTiersCleared(tournament.ranks);
      const solvedSP = puzzleStats.solvedCount || 0;
      const expectedSP = tiersSP + solvedSP;

      // Calculate current total SP (Available + Used)
      const currentUsedSP = calculateUsedStudyPoints(skills);
      const currentAvailableSP = resources.studyPoints || 0;
      const currentTotalSP = currentAvailableSP + currentUsedSP;

      // If we have less SP than we should, grant the difference
      if (currentTotalSP < expectedSP) {
          const diff = expectedSP - currentTotalSP;
          setResources(prev => ({
              ...prev,
              studyPoints: (prev.studyPoints || 0) + diff
          }));
      }
  }, [tournament.ranks, skills, resources.studyPoints, puzzleStats.solvedCount]);

  // Derived Stats
  const playerElo = useMemo(() => {
    const totalLevels = Object.values(stats).reduce((a, b) => a + b, 0);
    return 100 + totalLevels;
  }, [stats]);

  // New Multiplier Exports for UI
  const tenureMultiplier = useMemo(() => calculateTenureMultiplier(skills), [skills]);
  const instinctMultiplier = useMemo(() => {
    const tacEcon = getLevel(skills, 'inst_tac_econ');
    const defEcon = getLevel(skills, 'inst_def_econ');
    const riskEcon = getLevel(skills, 'inst_risk_econ');

    let mult = 1.0;
    if (tacEcon > 0) {
        const sp = calculateBranchSP(skills, 'instinct_tactics');
        mult *= (1 + (0.01 * tacEcon * sp));
    }
    if (defEcon > 0) {
        const sp = calculateBranchSP(skills, 'instinct_defense');
        mult *= (1 + (0.01 * defEcon * sp));
    }
    if (riskEcon > 0) {
        const sp = calculateBranchSP(skills, 'instinct_risk');
        mult *= (1 + (0.01 * riskEcon * sp));
    }
    return mult;
  }, [skills]);

  // Income Calculation (Derived)
  const totalIncomePerMinute = useMemo(() => {
      const rawBase = 1 + cumulativeTournamentIndex;
      const tierMultiplier = Math.pow(1.01, cumulativeTiersCleared);
      const puzzleMult = puzzleStats.multiplier || 1.0;
      return rawBase * tierMultiplier * puzzleMult * tenureMultiplier * instinctMultiplier;
  }, [cumulativeTournamentIndex, cumulativeTiersCleared, puzzleStats.multiplier, tenureMultiplier, instinctMultiplier]);

  // NEW SKILL POINT LOGIC
  const totalAbilityPoints = useMemo(() => {
    const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
    // Initial 3 + 1 per Tournament Index per Mode
    const totalIdx = GAME_MODES.reduce((sum, m) => sum + getIdx(tournament.ranks[m.id]), 0);
    return 3 + totalIdx;
  }, [tournament.ranks]);

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

      const now = Date.now();
      let delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // Cap delta at 24 hours to prevent crazy values from system clock changes
      if (delta > 86400) delta = 86400;

      // Prevent negative delta
      if (delta < 0) delta = 0;

      if (delta > 0) {
        setResources(prev => {
            const currentRanks = stateRef.current.tournament.ranks;
            const currentPuzzleStats = stateRef.current.puzzleStats; // Access via Ref for fresh value

            // Calculate Cumulative Tournament Index
            const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
            const getTiers = (r) => (typeof r === 'object' ? (r.tournamentIndex * TIERS_PER_TOURNAMENT + r.tierIndex) : 0);

            const cumulativeIdx = GAME_MODES.reduce((sum, m) => sum + getIdx(currentRanks[m.id]), 0);
            const cumulativeTiers = GAME_MODES.reduce((sum, m) => sum + getTiers(currentRanks[m.id]), 0);

            let income = calculatePassiveIncomePerSecond(cumulativeIdx, cumulativeTiers);

            // Apply Puzzle Multiplier
            if (currentPuzzleStats && currentPuzzleStats.multiplier) {
                income *= currentPuzzleStats.multiplier;
            }

            // Apply Tenure Multiplier
            const currentSkills = stateRef.current.skills;
            income *= calculateTenureMultiplier(currentSkills);

            // Apply Instinct Multiplier
            const tacEcon = getLevel(currentSkills, 'inst_tac_econ');
            const defEcon = getLevel(currentSkills, 'inst_def_econ');
            const riskEcon = getLevel(currentSkills, 'inst_risk_econ');

            let instinctMult = 1.0;
            if (tacEcon > 0) {
                const sp = calculateBranchSP(currentSkills, 'instinct_tactics');
                instinctMult *= (1 + (0.01 * tacEcon * sp));
            }
            if (defEcon > 0) {
                const sp = calculateBranchSP(currentSkills, 'instinct_defense');
                instinctMult *= (1 + (0.01 * defEcon * sp));
            }
            if (riskEcon > 0) {
                const sp = calculateBranchSP(currentSkills, 'instinct_risk');
                instinctMult *= (1 + (0.01 * riskEcon * sp));
            }
            income *= instinctMult;

            return {
            ...prev,
            studyTime: prev.studyTime + (income * delta)
            };
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOfflineLoading, offlineReport]);

  // Visibility / Tab Switch Handler
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
              // Force a tick update logic if needed?
              // Actually, the interval will fire naturally.
              // We just ensure we don't reset lastTickRef here.
          }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Actions
  const upgradeStat = useCallback((statName) => {
    // Hard Cap for Sacrifices
    if (statName === 'sacrifices' && stats.sacrifices >= 500) {
        return;
    }

    setResources(prevRes => {
        const currentLevel = stats[statName];

        // Pass full stats to calculation for Focus Tax logic
        const cost = calculateUpgradeCost(currentLevel, stats, statName);

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
  }, [stats]);

  const purchaseSkill = useCallback((skillId) => {
      const skill = getSkillById(skillId);
      // Access latest state via ref to avoid dependency on frequently changing resources
      const currentSkills = stateRef.current.skills;
      const currentResources = stateRef.current.resources;

      if (!skill) return;

      // Exclusivity Check
      if (skill.group) {
          const hasConflict = Object.keys(currentSkills).some(ownedId => {
              if (!currentSkills[ownedId]) return false;
              const ownedSkill = getSkillById(ownedId);
              // Only block if conflict exists AND it's not the same skill (allow upgrades if applicable)
              return ownedSkill && ownedSkill.group === skill.group && ownedSkill.id !== skillId;
          });
          if (hasConflict) return;
      }

      // Requirement Check (Parent Skill)
      if (skill.parentId) {
          const parentOwned = currentSkills[skill.parentId];
          // Parent must be owned (true or level >= 1)
          if (!parentOwned) return;
      }

      // Handle Leveling Logic
      const currentLevel = typeof currentSkills[skillId] === 'number'
          ? currentSkills[skillId]
          : (currentSkills[skillId] ? 1 : 0);

      const maxLevel = skill.maxLevel || 1;

      if (currentLevel >= maxLevel) return;

      if (skill.costType === 'SP') {
          const spCost = skill.spCost || 0;
          const currentSP = currentResources.studyPoints || 0;

          if (currentSP >= spCost) {
              // Increment Level
              const newLevel = currentLevel + 1;
              setSkills(prev => ({ ...prev, [skillId]: newLevel }));
              setResources(prev => ({ ...prev, studyPoints: (prev.studyPoints || 0) - spCost }));
          }
      } else {
          // AP Logic
          if (availableAbilityPoints >= skill.cost) {
              setSkills(prev => ({
                  ...prev,
                  [skillId]: true
              }));
          }
      }
  }, [availableAbilityPoints]);

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

              // Calculate Income for Prize
              const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
              const getTiers = (r) => (typeof r === 'object' ? (r.tournamentIndex * TIERS_PER_TOURNAMENT + r.tierIndex) : 0);

              const cumulativeIdx = GAME_MODES.reduce((sum, m) => sum + getIdx(prev.ranks[m.id]), 0);
              const cumulativeTiers = GAME_MODES.reduce((sum, m) => sum + getTiers(prev.ranks[m.id]), 0);

              let currentIncome = calculatePassiveIncomePerSecond(cumulativeIdx, cumulativeTiers);

              const pStats = stateRef.current.puzzleStats;
              if (pStats && pStats.multiplier) {
                  currentIncome *= pStats.multiplier;
              }

              // Apply Tenure Multiplier
              const currentSkills = stateRef.current.skills;
              currentIncome *= calculateTenureMultiplier(currentSkills);

              // Apply Instinct Multiplier (Prize Calculation - Logic Duplication)
              // Ideally extract this calc, but keeping inline for now
              const tacEcon = getLevel(currentSkills, 'inst_tac_econ');
              const defEcon = getLevel(currentSkills, 'inst_def_econ');
              const riskEcon = getLevel(currentSkills, 'inst_risk_econ');

              let instinctMult = 1.0;
              if (tacEcon > 0) {
                  const sp = calculateBranchSP(currentSkills, 'instinct_tactics');
                  instinctMult *= (1 + (0.01 * tacEcon * sp));
              }
              if (defEcon > 0) {
                  const sp = calculateBranchSP(currentSkills, 'instinct_defense');
                  instinctMult *= (1 + (0.01 * defEcon * sp));
              }
              if (riskEcon > 0) {
                  const sp = calculateBranchSP(currentSkills, 'instinct_risk');
                  instinctMult *= (1 + (0.01 * riskEcon * sp));
              }
              currentIncome *= instinctMult;

              // Progression Logic
              let newMatch = currentRank.matchIndex + 1;
              let newTier = currentRank.tierIndex;
              let newTourn = currentRank.tournamentIndex;
              let tokenAward = 0;

              if (newMatch >= MATCHES_PER_TIER) {
                  newMatch = 0;
                  newTier++;
                  if (newTier >= TIERS_PER_TOURNAMENT) {
                      newTier = 0;
                      newTourn++;

                      // Award Review Token on Tournament Advance
                      if (newTourn > currentRank.tournamentIndex) {
                          tokenAward = 1;
                      }

                      if (newTourn >= TOURNAMENT_CONFIG.length) {
                          newTourn = TOURNAMENT_CONFIG.length - 1; // Cap at max
                          newTier = TIERS_PER_TOURNAMENT - 1; // Cap at max tier
                          newMatch = MATCHES_PER_TIER - 1; // Cap at max match
                      }
                  }
              }

              // Determine prize
              let prizeSeconds = 60; // Base Match Win (1 minute)
              let spAward = 0;

              if (isTierClear) {
                  prizeSeconds += 600; // Tier Clear Bonus (10 minutes)
                  spAward = 1;
              }

              // Award Prize
              setResources(res => ({
                  ...res,
                  studyTime: res.studyTime + (currentIncome * prizeSeconds),
                  studyPoints: (res.studyPoints || 0) + spAward,
                  reviewTokens: Math.min(3, (res.reviewTokens || 0) + tokenAward)
              }));

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
  }, []);

  const claimOfflineReward = useCallback(() => {
      if (offlineReport) {
          setResources(prev => ({
              ...prev,
              studyTime: prev.studyTime + offlineReport.gain
          }));
          clearReport();
      }
  }, [offlineReport, clearReport]);

  // NEW: Trigger Sacrifice Bonus (Brilliant Bounty)
  const triggerSacrificeBonus = useCallback(() => {
      const currentRanks = stateRef.current.tournament.ranks;
      const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
      const getTiers = (r) => (typeof r === 'object' ? (r.tournamentIndex * TIERS_PER_TOURNAMENT + r.tierIndex) : 0);

      const cumulativeIdx = GAME_MODES.reduce((sum, m) => sum + getIdx(currentRanks[m.id]), 0);
      const cumulativeTiers = GAME_MODES.reduce((sum, m) => sum + getTiers(currentRanks[m.id]), 0);

      let income = calculatePassiveIncomePerSecond(cumulativeIdx, cumulativeTiers);

      const pStats = stateRef.current.puzzleStats;
      if (pStats && pStats.multiplier) {
          income *= pStats.multiplier;
      }

      // Apply Tenure Multiplier
      const currentSkills = stateRef.current.skills;
      income *= calculateTenureMultiplier(currentSkills);

      // Apply Instinct Multiplier (Sacrifice Bonus Calc - Duplication)
      const tacEcon = getLevel(currentSkills, 'inst_tac_econ');
      const defEcon = getLevel(currentSkills, 'inst_def_econ');
      const riskEcon = getLevel(currentSkills, 'inst_risk_econ');

      let instinctMult = 1.0;
      if (tacEcon > 0) {
          const sp = calculateBranchSP(currentSkills, 'instinct_tactics');
          instinctMult *= (1 + (0.01 * tacEcon * sp));
      }
      if (defEcon > 0) {
          const sp = calculateBranchSP(currentSkills, 'instinct_defense');
          instinctMult *= (1 + (0.01 * defEcon * sp));
      }
      if (riskEcon > 0) {
          const sp = calculateBranchSP(currentSkills, 'instinct_risk');
          instinctMult *= (1 + (0.01 * riskEcon * sp));
      }
      income *= instinctMult;

      const bonus = income * 600; // 10 minutes
      setResources(prev => ({
          ...prev,
          studyTime: prev.studyTime + bonus
      }));
  }, []);

  // --- PUZZLE LOGIC ---

  const generatePuzzle = useCallback(() => {
    setPuzzleStats(currentStats => {
        const theme = PUZZLE_THEMES[Math.floor(Math.random() * PUZZLE_THEMES.length)];
        const target = calculatePuzzleDifficulty(currentStats.elo);

        // Name Suffix Logic
        let suffix = ' I';
        if (currentStats.elo >= 500) suffix = ' III';
        else if (currentStats.elo >= 100) suffix = ' II';

        const newPuzzle = {
            themeId: theme.id,
            name: theme.name + suffix,
            flavor: theme.flavor,
            skills: theme.skills,
            difficulty: target
        };

        setActivePuzzle(newPuzzle);
        return currentStats; // No change to stats here
    });
  }, []);

  // Ensure puzzle exists on load
  useEffect(() => {
      if (!activePuzzle) {
          generatePuzzle();
      }
  }, [activePuzzle, generatePuzzle]);

  const solvePuzzle = useCallback(() => {
    if (!activePuzzle) return { success: false };

    const result = resolvePuzzle(activePuzzle, stats, activePuzzle.difficulty);

    let nextElo = puzzleStats.elo;
    let nextMult = puzzleStats.multiplier;
    let nextSolved = puzzleStats.solvedCount || 0;

    if (result.success) {
        nextElo = Math.floor(nextElo * 1.15);
        nextMult = nextMult * 1.01;
        nextSolved += 1;

        // Award SP
        setResources(prev => ({
            ...prev,
            studyPoints: (prev.studyPoints || 0) + 1
        }));
    } else {
        // Difficulty should never go lower
        // nextElo = Math.floor(nextElo * 0.90);
    }

    setPuzzleStats({
        elo: nextElo,
        multiplier: nextMult,
        solvedCount: nextSolved
    });

    // Generate new puzzle immediately based on NEW elo
    const theme = PUZZLE_THEMES[Math.floor(Math.random() * PUZZLE_THEMES.length)];
    const nextTarget = calculatePuzzleDifficulty(nextElo);
    let suffix = ' I';
    if (nextElo >= 500) suffix = ' III';
    else if (nextElo >= 100) suffix = ' II';

    setActivePuzzle({
        themeId: theme.id,
        name: theme.name + suffix,
        flavor: theme.flavor,
        skills: theme.skills,
        difficulty: nextTarget
    });

    return result;
  }, [activePuzzle, stats, puzzleStats]);

  const tacticalReview = useCallback(() => {
      const currentRes = stateRef.current.resources;
      const currentSkills = stateRef.current.skills;

      if (!currentRes.reviewTokens || currentRes.reviewTokens <= 0) return;

      // Refund SP Calculation
      let totalRefund = 0;
      Object.keys(currentSkills).forEach(skillId => {
          const skill = getSkillById(skillId);
          if (skill && skill.costType === 'SP') {
              const level = getLevel(currentSkills, skillId);
              totalRefund += (skill.spCost * level);
          }
      });

      // Reset Skills
      setSkills(INITIAL_SKILLS);

      // Update Resources
      setResources(prev => ({
          ...prev,
          studyPoints: (prev.studyPoints || 0) + totalRefund,
          reviewTokens: prev.reviewTokens - 1
      }));

      // Force Save
      saveGame();

  }, [saveGame]);

  const enableDevMode = useCallback(() => {
    setResources(prev => ({
        ...prev,
        studyTime: 1e30 // Infinite study time
    }));
  }, []);

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
      setPuzzleStats(INITIAL_PUZZLE_STATS);
      setActivePuzzle(null);
      clearReport();
  }, [clearReport]);

  const actions = useMemo(() => ({
      upgradeStat,
      purchaseSkill,
      startTournament,
      endTournament,
      addResource,
      resetGame,
      claimOfflineReward,
      triggerSacrificeBonus,
      solvePuzzle,
      tacticalReview,
      enableDevMode
  }), [upgradeStat, purchaseSkill, startTournament, endTournament, addResource, resetGame, claimOfflineReward, triggerSacrificeBonus, solvePuzzle, tacticalReview, enableDevMode]);

  const derivedStats = {
      playerElo,
      availableAbilityPoints,
      totalAbilityPoints,
      totalWins,
      cumulativeTournamentIndex, // Export for UI
      cumulativeTiersCleared,
      studyPoints: resources.studyPoints || 0,
      reviewTokens: resources.reviewTokens || 0,
      tenureMultiplier,
      instinctMultiplier,
      totalIncomePerMinute
  };

  const state = {
      resources,
      stats,
      skills,
      tournament,
      puzzleStats,
      activePuzzle,
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
