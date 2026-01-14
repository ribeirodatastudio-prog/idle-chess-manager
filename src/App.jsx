import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { generateOpponentStats, calculateMove, PHASES } from './logic/simulation';
import { StatsPanel, StatsHeader } from './components/StatsPanel';
import { ArenaPanel } from './components/ArenaPanel';
import { LogsPanel } from './components/LogsPanel';
import { SkillsPanel, SkillsHeader } from './components/SkillsPanel';
import { OfflineModal } from './components/OfflineModal';

function App() {
  const { state, derivedStats, actions } = useGameState();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'skills'
  
  const [simulationState, setSimulationState] = useState({
    evalBar: 0.3,
    moveNumber: 0,
    phase: '',
    result: null, // 'win' | 'loss' | 'draw'
    phase1Won: false,
    move11Eval: 0
  });
  const [logs, setLogs] = useState([]);
  
  // Ref to hold the current simulation state to access inside interval
  const simulationStateRef = useRef(simulationState);

  // Update ref whenever state changes
  useEffect(() => {
    simulationStateRef.current = simulationState;
  }, [simulationState]);
  
  // Ref for the simulation interval
  const simulationInterval = useRef(null);

  // Start Tournament Handler (Updated for Modes)
  const handleStartTournament = (mode) => {
    // Generate opponent based on current rank object
    const currentModeRank = state.tournament.ranks[mode];

    // Generate FULL opponent stats (including identity)
    const fullOpponentStats = generateOpponentStats(currentModeRank);
    
    // Check for Gambiteer skill
    const startEval = state.skills['gambiteer'] ? -0.5 : 0.3;

    // Reset local simulation state
    const initialState = {
      evalBar: startEval,
      moveNumber: 0,
      phase: 'Opening',
      result: null,
      phase1Won: false,
      move11Eval: 0,
      hasSacrificed: false
    };
    setSimulationState(initialState);
    simulationStateRef.current = initialState;
    setLogs([]);
    
    // Update global state - passing the FULL object to preserve identity
    actions.startTournament(fullOpponentStats, mode);
  };

  // Simulation Loop
  useEffect(() => {
    if (state.tournament.active && !simulationState.result) {
      simulationInterval.current = setInterval(() => {
        const currentSimState = simulationStateRef.current;
        
        // Safety check to ensure we don't simulate on a finished game
        if (currentSimState.result || !state.tournament.active) {
            clearInterval(simulationInterval.current);
            return;
        }

        const nextMove = currentSimState.moveNumber + 1;
        
        // Calculate the move result
        const moveResult = calculateMove(
          nextMove,
          state.stats,
          state.tournament.opponentStats.stats,
          currentSimState.evalBar,
          state.skills,
          currentSimState.phase1Won,
          currentSimState.move11Eval,
          state.tournament.activeMode, // Pass the active mode
          currentSimState.hasSacrificed // Pass sacrifice state
        );
        
        // Construct Log Message
        const swingMsg = moveResult.sacrificeSwing !== 0 
          ? ` (Swing: ${moveResult.sacrificeSwing > 0 ? '+' : ''}${moveResult.sacrificeSwing.toFixed(2)})` 
          : '';
        const logMsg = `Delta: ${moveResult.delta > 0 ? '+' : ''}${moveResult.delta.toFixed(2)}${swingMsg}. Eval: ${moveResult.newEval.toFixed(2)}`;
        
        // Update Logs
        setLogs(prevLogs => [...prevLogs, { move: nextMove, message: moveResult.logMessage || logMsg }]);
        
        let nextPhase1Won = currentSimState.phase1Won;
        let nextMove11Eval = currentSimState.move11Eval;
        
        // Logic Triggers for Skill Conditions
        // Check Phase 1 Win (At Move 10)
        if (nextMove === 10) {
            if (moveResult.newEval > 0) {
                nextPhase1Won = true;
            }
        }
        // Capture Move 11 Eval for Counter-Play
        if (nextMove === 11) {
            nextMove11Eval = moveResult.newEval;
        }

        // Check if game ended
        if (moveResult.result) {
          clearInterval(simulationInterval.current);
          actions.endTournament(moveResult.result, nextMove);
          setSimulationState(prev => ({
            ...prev,
            evalBar: moveResult.newEval,
            moveNumber: nextMove,
            phase: moveResult.phase,
            result: moveResult.result,
            phase1Won: nextPhase1Won,
            move11Eval: nextMove11Eval,
            hasSacrificed: prev.hasSacrificed || moveResult.hasSacrificed
          }));
        } else {
            setSimulationState(prev => ({
                ...prev,
                evalBar: moveResult.newEval,
                moveNumber: nextMove,
                phase: moveResult.phase,
                phase1Won: nextPhase1Won,
                move11Eval: nextMove11Eval,
                hasSacrificed: prev.hasSacrificed || moveResult.hasSacrificed
            }));
        }
      }, 500); // 0.5s per move
    }

    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, [state.tournament.active, state.tournament.opponentStats, state.tournament.activeMode, state.stats, state.skills, actions]); // Dependencies

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500 selection:text-white p-2 sm:p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-[95vh] grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Panel: Upgrades & Skills (3 cols) */}
        <div className="lg:col-span-3 h-full flex flex-col overflow-hidden bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
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
                   />
               ) : (
                   <SkillsHeader derivedStats={derivedStats} />
               )}
           </div>

           {/* Scrollable Content Area */}
           <div className="flex-1 overflow-y-auto pb-20">
               {activeTab === 'stats' ? (
                   <StatsPanel
                        stats={state.stats} 
                        resources={state.resources} 
                        onUpgrade={actions.upgradeStat} 
                   />
               ) : (
                    <SkillsPanel
                        skills={state.skills}
                        derivedStats={derivedStats}
                        onPurchase={actions.purchaseSkill}
                    />
               )}
           </div>
        </div>

        {/* Center Panel: Arena (6 cols) */}
        <div className="lg:col-span-6 h-full overflow-hidden">
          <ArenaPanel 
            tournament={state.tournament}
            simulationState={simulationState}
            onStartTournament={handleStartTournament}
          />
        </div>

        {/* Right Panel: Logs (3 cols) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <LogsPanel logs={logs} />
        </div>

      </div>
      
      {/* Footer / Version */}
      <div className="text-center text-gray-800 text-xs fixed bottom-1 left-0 right-0 pointer-events-none">
        Chess Career Idle v0.3 • Game Modes Added
      </div>

      <OfflineModal
        isOpen={!!state.offlineReport}
        data={state.offlineReport}
        onClaim={actions.claimOfflineReward}
      />
    </div>
  );
}

export default App;
