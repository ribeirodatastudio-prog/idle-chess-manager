import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameState } from './hooks/useGameState';
import { calculateMove, PHASES, getPhaseConfig, simulateGame } from './logic/simulation';
import { StatsPanel, StatsHeader } from './components/StatsPanel';
import { ArenaPanel } from './components/ArenaPanel';
import { LogsPanel } from './components/LogsPanel';
import { SkillsPanel, SkillsHeader } from './components/SkillsPanel';
import { OfflineModal } from './components/OfflineModal';
import PuzzleRoom from './components/PuzzleRoom';
import { useIsMobile } from './hooks/useIsMobile';
import { MobileLayout } from './components/MobileLayout';
import { SettingsModal } from './components/SettingsModal';
import { Settings } from 'lucide-react';
import { TOURNAMENT_CONFIG, TIERS_PER_TOURNAMENT } from './logic/tournaments';
import { GAME_MODES } from './logic/gameModes';

// Helper: Calculate Total Tier Score (0-N)
const getTierScore = (rankData) => {
    if (!rankData) return 0;
    if (typeof rankData === 'number') {
        // Legacy: rankData is wins + 1. Approximate tier.
        return Math.floor((rankData - 1) / 10); // Only returns Tier index (0-9)
        // Wait, legacy doesn't capture Tournament Index. Assuming T0.
    }
    return (rankData.tournamentIndex * TIERS_PER_TOURNAMENT) + rankData.tierIndex;
};

const DesktopLayout = ({
    state,
    derivedStats,
    actions,
    simulationState,
    handleStartTournament,
    logs,
    activeTab,
    setActiveTab,
    canSkip,
    onSkip,
    opacityState
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500 selection:text-white p-2 sm:p-4 overflow-hidden relative">
      {/* Settings Button (Desktop) - Fades in focus mode */}
      <button
          onClick={() => setSettingsOpen(true)}
          style={{ opacity: opacityState.peripheral, pointerEvents: opacityState.peripheral === 0 ? 'none' : 'auto', transition: 'opacity 1s ease' }}
          className="fixed top-4 right-4 z-50 p-2 text-gray-500 hover:text-white bg-gray-900/80 backdrop-blur rounded-lg border border-gray-700 hover:border-gray-500 transition-all shadow-xl"
      >
          <Settings size={20} />
      </button>

      <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          actions={actions}
          isDevMode={state.resources.isDevMode}
      />

      <div className="max-w-7xl mx-auto h-[95vh] grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left Panel: Upgrades & Skills (3 cols) - Fades in focus mode */}
        <div
            style={{ opacity: opacityState.peripheral, transition: 'opacity 1s ease' }}
            className="lg:col-span-3 h-full flex flex-col overflow-hidden bg-gray-900 rounded-xl border border-gray-800 shadow-2xl"
        >
           <div className="flex border-b border-gray-700 shrink-0">
               <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 py-3 font-bold text-center transition-colors ${activeTab === 'stats' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:bg-gray-800/50'}`}
               >
                   Stats
               </button>
               <button
                  onClick={() => setActiveTab('skills')}
                  className={`flex-1 py-3 font-bold text-center transition-colors ${activeTab === 'skills' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:bg-gray-800/50'}`}
               >
                   Skills
               </button>
           </div>

           {/* Sticky Header Area */}
           <div className="p-4 pb-0 bg-gray-900 z-10 shrink-0">
               {activeTab === 'stats' ? (
                   <StatsHeader
                        resources={state.resources}
                        playerElo={derivedStats.playerElo}
                        tournamentIndex={derivedStats.cumulativeTournamentIndex}
                        tiersCleared={derivedStats.cumulativeTiersCleared}
                        puzzleMultiplier={state.puzzleStats.multiplier}
                        tenureMultiplier={derivedStats.tenureMultiplier}
                        instinctMultiplier={derivedStats.instinctMultiplier}
                        totalIncome={derivedStats.totalIncomePerMinute}
                   />
               ) : (
                   <SkillsHeader derivedStats={derivedStats} />
               )}
           </div>

           {/* Scrollable Content Area */}
           <div className="flex-1 overflow-y-auto pb-20">
               {activeTab === 'stats' ? (
                   <>
                        <StatsPanel
                            stats={state.stats}
                            resources={state.resources}
                            onUpgrade={actions.upgradeStat}
                        />
                        <PuzzleRoom state={state} actions={actions} />
                   </>
               ) : (
                    <SkillsPanel
                        skills={state.skills}
                        derivedStats={derivedStats}
                        onPurchase={actions.purchaseSkill}
                        onTacticalReview={actions.tacticalReview}
                    />
               )}
           </div>
        </div>

        {/* Center Panel: Arena (6 cols) */}
        <div className={`${showLogs ? 'lg:col-span-6' : 'lg:col-span-9'} h-full overflow-hidden transition-all duration-300`}>
          <ArenaPanel
            tournament={state.tournament}
            simulationState={simulationState}
            onStartTournament={handleStartTournament}
            stats={state.stats}
            skills={state.skills}
            canSkip={canSkip}
            onSkip={onSkip}
            showLogs={showLogs}
            setShowLogs={setShowLogs}
          />
        </div>

        {/* Right Panel: Logs (3 cols) - Fades in focus mode */}
        {showLogs && (
            <div
                style={{ opacity: opacityState.peripheral, transition: 'opacity 1s ease' }}
                className="lg:col-span-3 h-full overflow-hidden animate-slide-in-right"
            >
              <LogsPanel logs={logs} />
            </div>
        )}

      </div>

      {/* Footer / Version */}
      <div className="text-center text-gray-800 text-xs fixed bottom-1 left-0 right-0 pointer-events-none">
        Chess Career Idle v0.3 • Game Modes Added
      </div>

      <OfflineModal
        isOpen={state.isOfflineLoading || !!state.offlineReport}
        isLoading={state.isOfflineLoading}
        data={state.offlineReport}
        onClaim={actions.claimOfflineReward}
      />
    </div>
  );
};

function App() {
  const { state, derivedStats, actions } = useGameState();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'skills'
  
  const [simulationState, setSimulationState] = useState({
    evalBar: 0.3,
    moveNumber: 0,
    phase: '',
    result: null, // 'win' | 'loss' | 'draw'
    phase1Won: false,
    move11Eval: 0,
    delta: 0,
    MaxClamp: 0,
    sacrificeStage: null,
    sacrificeInitiator: null,
    matchHistory: []
  });
  
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const [logs, setLogs] = useState([]);

  // Calculate Skip Eligibility
  const canSkip = useMemo(() => {
      if (!state.tournament.active) return false;

      // Calculate Max Global Tier
      let maxGlobal = 0;
      GAME_MODES.forEach(m => {
          const score = getTierScore(state.tournament.ranks[m.id]);
          if (score > maxGlobal) maxGlobal = score;
      });

      const currentScore = getTierScore(state.tournament.ranks[state.tournament.activeMode]);

      // "2 tiers below".
      // If Max is T5 (Index 4). Current is T3 (Index 2). 2 <= 4 - 2. True.
      return currentScore <= (maxGlobal - 2);
  }, [state.tournament.active, state.tournament.activeMode, state.tournament.ranks]);

  const handleSkip = useCallback(() => {
      if (canSkip && simulationState.matchHistory.length > 0) {
          setPlaybackIndex(simulationState.matchHistory.length - 1);
          setSimulationState(prev => ({ ...prev, sacrificeStage: null, sacrificeInitiator: null }));
      }
  }, [canSkip, simulationState.matchHistory]);

  // Start Tournament Handler (Playback)
  const handleStartTournament = useCallback((mode) => {
    // Check for Gambiteer skill
    const startEval = state.skills['gambiteer'] ? -0.5 : 0.3;

    // Run Full Simulation
    const history = simulateGame(state.stats, state.tournament.nextOpponents[mode].stats, state.skills, mode);

    const initialState = {
      evalBar: startEval,
      moveNumber: 0,
      phase: 'Opening',
      result: null,
      phase1Won: false,
      phase2Won: false,
      move11Eval: 0,
      sacrificesCount: 0,
      hasSacrificed: false,
      delta: 0,
      MaxClamp: 0,
      sacrificeStage: null,
      sacrificeInitiator: null,
      matchHistory: history
    };

    setSimulationState(initialState);
    setLogs([]);
    setPlaybackIndex(0);
    
    // Update global state
    actions.startTournament(mode);
  }, [actions, state.skills, state.stats, state.tournament.nextOpponents]);

  // Playback Loop
  useEffect(() => {
    if (!state.tournament.active || !simulationState.matchHistory.length) return;

    // Check if finished or not started
    if (playbackIndex < 0 || playbackIndex >= simulationState.matchHistory.length) {
         return;
    }

    const frame = simulationState.matchHistory[playbackIndex];

    // Log Logic (Only add log if it's a new frame index)
    // We can rely on playbackIndex changing.

    // Sacrifice Handling
    if (frame.hasSacrificed) {
         // Logic to handle the sequence
         if (simulationState.sacrificeStage === null) {
             setSimulationState(prev => ({
                 ...prev,
                 sacrificeStage: 'drama',
                 sacrificeInitiator: frame.sacrificeInitiator
             }));

             // 1. Drama (1.5s)
             setTimeout(() => {
                 const success = frame.sacrificeSwing > 0;

                 // 2. Reveal (Update Board)
                 setSimulationState(prev => ({
                     ...prev,
                     sacrificeStage: success ? 'success' : 'fail',
                     evalBar: frame.newEval,
                     moveNumber: frame.moveNumber,
                     phase: frame.phase,
                     delta: frame.delta,
                     MaxClamp: frame.MaxClamp,
                     sacrificeInitiator: frame.sacrificeInitiator
                 }));

                 // Log here
                 const swingMsg = frame.sacrificeSwing !== 0
                    ? ` (Swing: ${frame.sacrificeSwing > 0 ? '+' : ''}${frame.sacrificeSwing.toFixed(2)})`
                    : '';
                 const logMsg = `Delta: ${frame.delta > 0 ? '+' : ''}${frame.delta.toFixed(2)}${swingMsg}. Eval: ${frame.newEval.toFixed(2)}`;
                 setLogs(prev => [...prev, { move: frame.moveNumber, message: frame.logMessage || logMsg }]);

                 // 3. Finish (2s)
                 setTimeout(() => {
                     setSimulationState(prev => ({ ...prev, sacrificeStage: null, sacrificeInitiator: null }));
                     // If result, don't increment, just process result
                     if (frame.result) {
                         actions.endTournament(frame.result, frame.moveNumber);
                         setSimulationState(prev => ({ ...prev, result: frame.result }));
                         // setPlaybackIndex(prev => prev + 1); // Will go out of bounds, effectively stop
                         setPlaybackIndex(simulationState.matchHistory.length); // Mark done
                     } else {
                         setPlaybackIndex(prev => prev + 1);
                     }
                 }, 2000);
             }, 1500);
             return; // Stop normal flow
         } else {
             // Waiting for timeouts
             return;
         }
    }

    // Normal Move
    setSimulationState(prev => ({
        ...prev,
        evalBar: frame.newEval,
        moveNumber: frame.moveNumber,
        phase: frame.phase,
        result: frame.result, // will be null unless end
        delta: frame.delta,
        MaxClamp: frame.MaxClamp
    }));

    // Log
    const swingMsg = frame.sacrificeSwing !== 0
       ? ` (Swing: ${frame.sacrificeSwing > 0 ? '+' : ''}${frame.sacrificeSwing.toFixed(2)})`
       : '';
    const logMsg = `Delta: ${frame.delta > 0 ? '+' : ''}${frame.delta.toFixed(2)}${swingMsg}. Eval: ${frame.newEval.toFixed(2)}`;
    setLogs(prev => [...prev, { move: frame.moveNumber, message: frame.logMessage || logMsg }]);

    // Trigger Brilliant Bounty
    if (frame.triggerBrilliantBounty) {
        actions.triggerSacrificeBonus();
    }

    // Check End Game
    if (frame.result) {
        actions.endTournament(frame.result, frame.moveNumber);
        setPlaybackIndex(simulationState.matchHistory.length); // Mark done
        return;
    }

    // Schedule Next
    const timer = setTimeout(() => {
        setPlaybackIndex(prev => prev + 1);
    }, 500); // Standard Speed

    return () => clearTimeout(timer);

  }, [playbackIndex, state.tournament.active]); // Only depend on index + active check

  // Opacity State Calculation
  const opacityState = useMemo(() => {
      const { moveNumber, phase } = simulationState;
      if (!state.tournament.active) return { peripheral: 1.0 };

      if (phase === 'Opening') return { peripheral: 1.0 };
      if (phase === 'Endgame') return { peripheral: 0.0 };

      // Midgame: 11-30.
      // 11 -> 1.0. 30 -> 0.2?
      const progress = (moveNumber - 10) / 20; // 0.05 to 1.0
      const op = 1.0 - (progress * 0.8);
      return { peripheral: Math.max(0.2, op) };
  }, [simulationState.moveNumber, simulationState.phase, state.tournament.active]);


  // Render logic
  if (isMobile) {
      return (
          <>
            <MobileLayout
                state={state}
                derivedStats={derivedStats}
                actions={actions}
                simulationState={simulationState}
                onStartTournament={handleStartTournament}
                logs={logs}
                canSkip={canSkip}
                onSkip={handleSkip}
                opacityState={opacityState}
            />
            <OfflineModal
                isOpen={state.isOfflineLoading || !!state.offlineReport}
                isLoading={state.isOfflineLoading}
                data={state.offlineReport}
                onClaim={actions.claimOfflineReward}
            />
          </>
      );
  }

  return (
    <DesktopLayout
        state={state}
        derivedStats={derivedStats}
        actions={actions}
        simulationState={simulationState}
        handleStartTournament={handleStartTournament}
        logs={logs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canSkip={canSkip}
        onSkip={handleSkip}
        opacityState={opacityState}
    />
  );
}

export default App;
