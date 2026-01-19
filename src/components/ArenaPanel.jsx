import React, { useState, memo, useMemo, useEffect } from 'react';
import { TOURNAMENT_CONFIG } from '../logic/tournaments';
import { GAME_MODES } from '../logic/gameModes';
import { getEffectivePhaseStats } from '../logic/simulation';
import { ChessBoardVisualizer } from './ChessBoardVisualizer';
import { Sword, Shield, Eye, EyeOff } from 'lucide-react';
import { FloatingFeedback } from './FloatingFeedback';
import { MatchResultModal } from './MatchResultModal';

// New Component: SacrificeOverlay
const SacrificeOverlay = ({ stage, initiator }) => { // stage: 'drama', 'success', 'fail'
    if (!stage) return null;

    const isPlayer = initiator === 'player';

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in rounded-lg">
            {stage === 'drama' && (
                 <>
                    <div className={`${isPlayer ? 'text-purple-500' : 'text-red-600'} animate-pulse mb-4`}>
                        <Sword size={64} />
                    </div>
                    <h2 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isPlayer ? 'from-purple-400 to-pink-600' : 'from-red-600 to-red-900'} tracking-widest animate-pulse`}>
                        {isPlayer ? 'SACRIFICE' : 'ENEMY SACRIFICE!'}
                    </h2>
                 </>
            )}

            {stage === 'success' && (
                 <div className="animate-bounce text-center">
                    {isPlayer ? (
                        <>
                            <h2 className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)] mb-2">
                                BRILLIANT!!
                            </h2>
                            <p className="text-white font-mono">Immortal Game!</p>
                        </>
                    ) : (
                        <>
                            <div className="text-green-500 mb-2 flex justify-center"><Shield size={64} /></div>
                            <h2 className="text-5xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,1)] mb-2">
                                DENIED!
                            </h2>
                            <p className="text-green-200 font-mono">Solid as a Rock</p>
                        </>
                    )}
                 </div>
            )}

            {stage === 'fail' && (
                 <div className="animate-shake text-center">
                    {isPlayer ? (
                        <>
                            <h2 className="text-5xl font-black text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,1)] mb-2">
                                UNSOUND...
                            </h2>
                            <p className="text-gray-400 font-mono">Refuted.</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-5xl font-black text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,1)] mb-2">
                                DEVASTATING!
                            </h2>
                            <p className="text-red-400 font-mono">Crushing Attack!</p>
                        </>
                    )}
                 </div>
            )}
        </div>
    );
};

const MATCH_INDICATORS = [0, 1, 2];

const ASSESSMENT_CONFIG = {
    hugeDisadvantage: {
        texts: ["Hopeless", "Blunder Prone", "Suicidal"],
        color: "text-red-600"
    },
    disadvantage: {
        texts: ["Dubious", "Under Pressure", "Cramped"],
        color: "text-orange-500"
    },
    even: {
        texts: ["Equal", "Sharp", "Drawish"],
        color: "text-gray-300"
    },
    advantage: {
        texts: ["Comfortable", "Promising", "Active"],
        color: "text-green-400"
    },
    hugeAdvantage: {
        texts: ["Winning", "Dominant", "Crushing"],
        color: "text-emerald-400"
    }
};

const getAssessment = (playerStat, enemyStat) => {
    if (!enemyStat || enemyStat === 0) {
        // Fallback for 0 stat (avoid division by zero), treat as Even/Equal
        const texts = ASSESSMENT_CONFIG.even.texts;
        return {
            text: texts[Math.floor(Math.random() * texts.length)],
            colorClass: ASSESSMENT_CONFIG.even.color
        };
    }

    const ratio = playerStat / enemyStat;
    let config;

    if (ratio < 0.5) {
        config = ASSESSMENT_CONFIG.hugeDisadvantage;
    } else if (ratio <= 0.9) {
        config = ASSESSMENT_CONFIG.disadvantage;
    } else if (ratio <= 1.1) {
        config = ASSESSMENT_CONFIG.even;
    } else if (ratio <= 1.5) {
        config = ASSESSMENT_CONFIG.advantage;
    } else {
        config = ASSESSMENT_CONFIG.hugeAdvantage;
    }

    return {
        text: config.texts[Math.floor(Math.random() * config.texts.length)],
        colorClass: config.color
    };
};

export const ArenaPanel = memo(({
  tournament, 
  simulationState, 
  onStartTournament,
  stats,
  skills,
  canSkip,
  onSkip,
  showLogs,
  setShowLogs
}) => {
  const { active, ranks, opponentStats } = tournament;
  const { evalBar, moveNumber, phase, result, delta, MaxClamp, sacrificeStage, sacrificeInitiator } = simulationState;

  // Local state for Result Modal
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (result && !active) {
        setShowResultModal(true);
    }
  }, [result, active]);

  const handleModalContinue = () => {
      setShowResultModal(false);
  };

  // Calculate specific bad news condition for screen shake
  const isEnemyBadNews = (sacrificeStage === 'drama' && sacrificeInitiator === 'enemy') ||
                         (sacrificeStage === 'fail' && sacrificeInitiator === 'enemy');

  // Local state for mode selection (only when inactive)
  const [selectedMode, setSelectedMode] = useState('bullet'); // 'bullet', 'blitz', 'rapid', 'classical', 'chess960'

  const rankData = active ? ranks[tournament.activeMode] : ranks[selectedMode];

  // Parse Rank Data
  let tIdx = 0, tier = 0, match = 0;
  if (typeof rankData === 'number') {
      tier = Math.floor((rankData - 1) / 10);
      match = (rankData - 1) % 10;
  } else if (rankData) {
      tIdx = rankData.tournamentIndex || 0;
      tier = rankData.tierIndex || 0;
      match = rankData.matchIndex || 0;
  }

  const config = TOURNAMENT_CONFIG[tIdx] || TOURNAMENT_CONFIG[0];
  const tournamentName = config.name;

  // Scouting Data
  const nextOpponent = tournament.nextOpponents?.[selectedMode];
  // If active, show opponentStats identity, else show scouted identity
  const identity = active ? opponentStats?.identity : nextOpponent?.identity;

  // Calculate Comparison Stats for Scouting
  const comparisonStats = useMemo(() => {
      if (!nextOpponent || active) return null;
      return getEffectivePhaseStats(stats, nextOpponent.stats, skills, selectedMode);
  }, [stats, nextOpponent, skills, selectedMode, active]);

  // Memoize the assessment texts to prevent flickering on re-renders
  const assessments = useMemo(() => {
      if (!comparisonStats) return null;
      return {
          Opening: getAssessment(comparisonStats.player.Opening, comparisonStats.enemy.Opening),
          Midgame: getAssessment(comparisonStats.player.Midgame, comparisonStats.enemy.Midgame),
          Endgame: getAssessment(comparisonStats.player.Endgame, comparisonStats.enemy.Endgame)
      };
  }, [comparisonStats]);

  // Calculate bar width percentage (0 to 100)
  // Range is -8 to +8 (New Threshold). Total range 16.
  // -8 => 0%, 0 => 50%, +8 => 100%
  const clampedEval = Math.max(-8, Math.min(8, evalBar));
  const barPercentage = ((clampedEval + 8) / 16) * 100;

  // Helper to handle start
  const handleStart = () => {
      onStartTournament(selectedMode);
  };

  return (
    <div className={`bg-gray-900 p-4 rounded-xl shadow-2xl h-full flex flex-col border border-gray-800 relative overflow-hidden ${isEnemyBadNews ? 'animate-shake' : ''}`}>
      {/* Background Visuals */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

      {/* Log Toggle Button */}
      {active && (
        <button
            onClick={() => setShowLogs(!showLogs)}
            className="absolute top-4 left-4 z-50 p-2 bg-gray-800/80 text-gray-400 hover:text-white rounded-full border border-gray-700 transition-colors shadow-lg backdrop-blur"
            title={showLogs ? "Hide Match Log" : "Show Match Log"}
        >
            {showLogs ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}

      {/* Header & Mode Selector */}
      <div className="relative z-10 shrink-0 mb-4">
          {!active ? (
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {GAME_MODES.map(modeObj => (
                      <button
                        key={modeObj.id}
                        onClick={() => setSelectedMode(modeObj.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors uppercase tracking-wider ${
                            selectedMode === modeObj.id
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                        }`}
                      >
                          {modeObj.label}
                      </button>
                  ))}
              </div>
          ) : (
             <div className="text-center mb-2">
                 <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-500 uppercase tracking-wider">
                     {tournament.activeMode} Mode
                 </span>
             </div>
          )}

          <div className="text-center">
             <div className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-1">
                 {tournamentName}
             </div>
             <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                Tier <span className="text-yellow-500">{tier + 1}</span> / 10
             </h2>
             <div className="flex justify-center space-x-2 mt-1">
                 {MATCH_INDICATORS.map(i => (
                     <div key={i} className={`w-3 h-3 rounded-full border border-gray-600 ${
                         i < match ? 'bg-green-500' :
                         i === match ? 'bg-yellow-500 animate-pulse' : 'bg-gray-800'
                     }`}></div>
                 ))}
             </div>
          </div>
      </div>

      {/* Identity Display (Active Match Only) */}
      {active && identity && (
          <div className="relative z-10 mb-4 text-center animate-fade-in">
              <h3 className={`text-2xl font-black uppercase tracking-wide ${identity.color} drop-shadow-md`}>
                  {identity.title}
              </h3>
              <p className="text-xs text-gray-400 italic">
                  {identity.hint}
              </p>
          </div>
      )}

      {/* Skip Button */}
      {active && canSkip && (
          <button
              onClick={onSkip}
              className="absolute top-16 right-4 z-50 bg-gray-800/80 hover:bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-gray-600 backdrop-blur shadow-lg animate-fade-in"
          >
              Skip »
          </button>
      )}

      {/* Evaluation Bar (Active Match Only) */}
      {active && (
      <div className="mb-6 relative z-10 shrink-0 px-2">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase tracking-widest">
          <span className="font-bold text-emerald-500">Player</span>
          <span className={`font-bold ${clampedEval > 0 ? 'text-emerald-400' : clampedEval < 0 ? 'text-gray-400' : 'text-white'}`}>
            {clampedEval > 0 ? '+' : ''}{clampedEval.toFixed(2)}
          </span>
          <span className="font-bold text-gray-400">Opponent</span>
        </div>

        {/* The Bar Container */}
        <div className="h-4 bg-gray-800 relative border border-gray-700 shadow-inner overflow-hidden">
          
          {/* Background Split */}
          <div 
            className="absolute inset-0 transition-all duration-500 ease-out"
            style={{ 
              background: `linear-gradient(to right, 
                #4CAF50 0%,
                #4CAF50 ${barPercentage}%,
                #333333 ${barPercentage}%,
                #333333 100%)`
             }}
          ></div>

          {/* Middle Marker (Static at 0.0) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/80 z-20 shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>

           {/* Slider Thumb / Split Line (at the boundary) */}
           <div 
             className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] transition-all duration-500 ease-out z-30 transform -translate-x-1/2"
             style={{ left: `${barPercentage}%` }}
           ></div>
        </div>
      </div>
      )}

      {/* Main Action Area */}
      <div className="flex-grow flex flex-col justify-center items-center relative z-10">
        {!active ? (
          <div className="w-full flex flex-col items-center animate-fade-in">
             {/* Scouting Report */}
             {identity && (
                <div className="mb-4 text-center w-full max-w-sm">
                    <h3 className={`text-xl font-black uppercase tracking-wide ${identity.color} drop-shadow-md mb-1`}>
                        {identity.title}
                    </h3>
                    <p className="text-xs text-gray-400 italic mb-4 px-4">
                        "{identity.hint}"
                    </p>

                    {/* Tale of the Tape */}
                    {comparisonStats && (
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-3 mb-4">
                            {['Opening', 'Midgame', 'Endgame'].map(phase => {
                                const pVal = comparisonStats.player[phase];
                                const eVal = comparisonStats.enemy[phase];
                                const isAdvantage = pVal >= eVal;
                                const total = pVal + eVal;
                                const ratio = total > 0 ? (pVal / total) * 100 : 50;
                                const assessment = assessments ? assessments[phase] : { text: '-', colorClass: 'text-gray-500' };

                                return (
                                    <div key={phase} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                            <span>{phase}</span>
                                            <span className={assessment.colorClass}>
                                                {assessment.text}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                                            <div
                                                className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${isAdvantage ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${ratio}%` }}
                                            ></div>
                                            {/* Mid Marker */}
                                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black/50"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <button
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 w-full sm:w-auto rounded-lg sm:rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:scale-105 transition-all text-lg mb-2"
            >
              Start {GAME_MODES.find(m => m.id === selectedMode)?.label} Match
            </button>

            <p className="text-gray-500 text-xs mb-4">
               Tier {tier + 1} • {GAME_MODES.find(m => m.id === selectedMode)?.description}
            </p>

            {result && (
              <div className={`mt-2 text-lg sm:text-xl font-bold ${result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                Result: {result.toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700 shadow-xl relative">
            <SacrificeOverlay stage={sacrificeStage} initiator={sacrificeInitiator} />
            <FloatingFeedback delta={delta} maxClamp={MaxClamp} moveNumber={moveNumber} />

            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Player</div>
                <div className="text-green-400 font-bold text-lg">You</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-white">{moveNumber}/50</div>
                <div className="text-xs text-blue-400 font-bold uppercase tracking-widest">{phase}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Opponent</div>
                <div className="text-red-400 font-bold text-lg">{opponentStats?.totalPower || '?'}</div>
              </div>
            </div>
            
            <div className="flex justify-center py-2">
               <ChessBoardVisualizer
                  phase={phase}
                  moveNumber={moveNumber}
                  evaluation={evalBar}
               />
            </div>
          </div>
        )}

        {/* Match Result Modal */}
        {showResultModal && (
            <MatchResultModal
                result={result}
                matchHistory={simulationState.matchHistory}
                onContinue={handleModalContinue}
            />
        )}
      </div>
    </div>
  );
});
