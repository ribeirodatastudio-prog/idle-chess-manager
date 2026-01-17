import React, { useState } from 'react';
import { ArenaPanel } from './ArenaPanel';
import { StatsPanel } from './StatsPanel';
import { SkillsPanel } from './SkillsPanel';
import { LogsPanel } from './LogsPanel';
import PuzzleRoom from './PuzzleRoom';
import { Sword, BarChart2, GraduationCap, ScrollText, Settings, X } from 'lucide-react';
import { formatNumber } from '../logic/format';
import { useLongPress } from '../hooks/useLongPress';

export const MobileLayout = ({
    state,
    derivedStats,
    actions,
    simulationState,
    onStartTournament,
    logs
}) => {
    const [activeTab, setActiveTab] = useState('arena');

    // UI States
    const [showMultipliers, setShowMultipliers] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Reset Logic States
    const [resetStep, setResetStep] = useState('idle'); // 'idle', 'confirm', 'math'
    const [mathProblem, setMathProblem] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');

    // Helper for Income Calculation
    const { playerElo, totalIncomePerMinute, cumulativeTournamentIndex, cumulativeTiersCleared, tenureMultiplier, instinctMultiplier } = derivedStats;
    const { resources, puzzleStats } = state;

    // Multiplier Calculations for LongPress Modal
    const rawBase = 1 + (cumulativeTournamentIndex || 0);
    const tierMultiplier = Math.pow(1.01, cumulativeTiersCleared || 0);
    const puzzleMult = puzzleStats.multiplier || 1.0;

    // Long Press Handlers
    const longPressHandlers = useLongPress(() => setShowMultipliers(true), () => {}, { delay: 500 });

    // Reset Flow Handlers
    const startResetFlow = () => setResetStep('confirm');

    const confirmReset = () => {
        // Generate Math Problem
        const a = Math.floor(Math.random() * 90) + 10;
        const b = Math.floor(Math.random() * 90) + 10;
        const isAdd = Math.random() > 0.5;

        setMathProblem({
            text: `${a} ${isAdd ? '+' : '-'} ${b}`,
            answer: isAdd ? a + b : a - b
        });
        setResetStep('math');
        setUserAnswer('');
    };

    const submitMathAnswer = () => {
        if (userAnswer.trim().toLowerCase() === 'dev') {
            actions.enableDevMode();
            alert('Dev Mode Enabled: Infinite Study Time');
            setSettingsOpen(false);
            setResetStep('idle');
            return;
        }

        if (parseInt(userAnswer) === mathProblem.answer) {
            actions.resetGame();
            setSettingsOpen(false);
            setResetStep('idle');
        } else {
            alert('Incorrect answer. Reset cancelled.');
            setResetStep('idle');
            setSettingsOpen(false); // Close everything on fail to punish/reset flow
        }
    };

    const closeSettings = () => {
        setSettingsOpen(false);
        setResetStep('idle');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'arena':
                return (
                    <ArenaPanel
                        tournament={state.tournament}
                        simulationState={simulationState}
                        onStartTournament={onStartTournament}
                    />
                );
            case 'stats':
                return (
                    <div className="space-y-6">
                        <StatsPanel
                            stats={state.stats}
                            resources={state.resources}
                            onUpgrade={actions.upgradeStat}
                        />
                        <PuzzleRoom state={state} actions={actions} />
                    </div>
                );
            case 'skills':
                return (
                    <SkillsPanel
                        skills={state.skills}
                        derivedStats={derivedStats}
                        onPurchase={actions.purchaseSkill}
                        onTacticalReview={actions.tacticalReview}
                    />
                );
            case 'logs':
                return <LogsPanel logs={logs} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-screen w-full bg-black text-gray-100 font-sans overflow-hidden flex flex-col relative">
            {/* Top Bar */}
            <div className="h-14 shrink-0 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20 shadow-md">
                 {/* Left: Elo */}
                 <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 uppercase tracking-wider">Elo</span>
                     <span className="text-gold-primary font-mono font-bold leading-tight">{playerElo}</span>
                 </div>

                 {/* Right: Study Time & Rate & Settings */}
                 <div className="flex items-center gap-4">
                     {/* Study Time */}
                     <div className="flex flex-col items-end">
                         <span className="text-[10px] text-gray-500 uppercase tracking-wider">Study Time</span>
                         <span className="text-blue-400 font-mono font-bold leading-tight">{formatNumber(resources.studyTime)}</span>
                     </div>

                     {/* Study/Min (with Long Press) */}
                     <div
                        className="flex flex-col items-end cursor-pointer active:scale-95 transition-transform select-none"
                        {...longPressHandlers}
                     >
                         <span className="text-[10px] text-gray-500 uppercase tracking-wider">Study/Min</span>
                         <span className="text-emerald-400 font-mono font-bold leading-tight">+{formatNumber(totalIncomePerMinute)}</span>
                     </div>

                     {/* Settings Button */}
                     <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-lg active:scale-95 transition-all"
                     >
                         <Settings size={18} />
                     </button>
                 </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                 {renderContent()}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 h-16 glass-card border-t border-gray-700/50 flex justify-around items-center z-50 pb-safe">
                <NavButton
                    id="arena"
                    icon={Sword}
                    label="Arena"
                    active={activeTab === 'arena'}
                    onClick={setActiveTab}
                />
                <NavButton
                    id="stats"
                    icon={BarChart2}
                    label="Stats"
                    active={activeTab === 'stats'}
                    onClick={setActiveTab}
                />
                <NavButton
                    id="skills"
                    icon={GraduationCap}
                    label="Skills"
                    active={activeTab === 'skills'}
                    onClick={setActiveTab}
                />
                <NavButton
                    id="logs"
                    icon={ScrollText}
                    label="Log"
                    active={activeTab === 'logs'}
                    onClick={setActiveTab}
                />
            </div>

            {/* Multipliers Modal (Overlay) */}
            {showMultipliers && (
                <div
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    onClick={() => setShowMultipliers(false)}
                >
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                            <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Income Multipliers</span>
                            <button onClick={() => setShowMultipliers(false)} className="text-gray-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-2 font-mono text-xs">
                             <div className="flex justify-between">
                                 <span className="text-gray-400">Base Rate</span>
                                 <span className="text-white">{formatNumber(rawBase)}/min</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-400">Tier Bonus (x1.01^N)</span>
                                 <span className="text-purple-400">x{tierMultiplier.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-400">Puzzle Multiplier</span>
                                 <span className="text-yellow-400">x{puzzleMult.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-400">Tenure Multiplier</span>
                                 <span className="text-blue-400">x{tenureMultiplier.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-400">Instinct Multiplier</span>
                                 <span className="text-red-400">x{instinctMultiplier.toFixed(2)}</span>
                             </div>
                             <div className="h-px bg-gray-700 my-2"></div>
                             <div className="flex justify-between font-bold text-sm">
                                 <span className="text-emerald-500">Total</span>
                                 <span className="text-emerald-400">{formatNumber(totalIncomePerMinute)}/min</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal (Overlay) */}
            {settingsOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    onClick={closeSettings}
                >
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-sm shadow-2xl text-center" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-bold text-white">Settings</span>
                            <button onClick={closeSettings} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Step 1: Menu */}
                        {resetStep === 'idle' && (
                            <div className="space-y-4">
                                <button
                                    onClick={startResetFlow}
                                    className="w-full py-3 px-4 bg-red-900/20 border border-red-500/30 text-red-500 rounded-lg font-bold hover:bg-red-900/40 transition-colors"
                                >
                                    Reset Account
                                </button>
                                <p className="text-[10px] text-gray-500">
                                    Version 0.3 (Mobile)
                                </p>
                            </div>
                        )}

                        {/* Step 2: Confirmation */}
                        {resetStep === 'confirm' && (
                            <div className="space-y-4">
                                <div className="text-red-400 font-bold mb-2">ARE YOU SURE?</div>
                                <p className="text-xs text-gray-400 mb-4">
                                    This will completely wipe your save file. This action cannot be undone.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setResetStep('idle')}
                                        className="py-2 px-3 bg-gray-800 text-gray-300 rounded-lg font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmReset}
                                        className="py-2 px-3 bg-red-600 text-white rounded-lg font-bold shadow-red-glow"
                                    >
                                        Yes, Wipe It
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Math Verification */}
                        {resetStep === 'math' && mathProblem && (
                            <div className="space-y-4">
                                <div className="text-gray-300 font-bold mb-2">Security Check</div>
                                <p className="text-xs text-gray-400">
                                    Solve to confirm:
                                </p>
                                <div className="text-xl font-mono text-blue-400 font-bold my-2">
                                    {mathProblem.text} = ?
                                </div>
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="?"
                                    className="w-full bg-black/50 border border-gray-600 rounded-lg p-2 text-center text-white font-mono text-lg focus:border-blue-500 outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={submitMathAnswer}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold mt-2"
                                >
                                    Confirm Reset
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

const NavButton = ({ id, icon: Icon, label, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200
            ${active ? 'text-blue-400 -translate-y-1' : 'text-gray-500 hover:text-gray-300'}
        `}
    >
        <div className={`p-1.5 rounded-xl mb-0.5 ${active ? 'bg-blue-500/20' : ''}`}>
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </button>
);
