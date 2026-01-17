import React, { useState } from 'react';
import { ArenaPanel } from './ArenaPanel';
import { StatsPanel } from './StatsPanel';
import { SkillsPanel } from './SkillsPanel';
import { LogsPanel } from './LogsPanel';
import PuzzleRoom from './PuzzleRoom';
import { Sword, BarChart2, GraduationCap, ScrollText, Settings, X } from 'lucide-react';
import { formatNumber } from '../logic/format';
import { useLongPress } from '../hooks/useLongPress';
import { SettingsModal } from './SettingsModal';

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

    // Helper for Income Calculation
    const { playerElo, totalIncomePerMinute, cumulativeTournamentIndex, cumulativeTiersCleared, tenureMultiplier, instinctMultiplier } = derivedStats;
    const { resources, puzzleStats } = state;

    // Multiplier Calculations for LongPress Modal
    const rawBase = 1 + (cumulativeTournamentIndex || 0);
    const tierMultiplier = Math.pow(1.01, cumulativeTiersCleared || 0);
    const puzzleMult = puzzleStats.multiplier || 1.0;

    // Long Press Handlers
    const longPressHandlers = useLongPress(() => setShowMultipliers(true), () => {}, { delay: 500 });

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
            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                actions={actions}
                isDevMode={resources.isDevMode}
            />
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
