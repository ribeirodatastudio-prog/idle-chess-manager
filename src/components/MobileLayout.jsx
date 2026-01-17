import React, { useState } from 'react';
import { ArenaPanel } from './ArenaPanel';
import { StatsPanel } from './StatsPanel';
import { SkillsPanel } from './SkillsPanel';
import { LogsPanel } from './LogsPanel';
import PuzzleRoom from './PuzzleRoom';
import { Sword, BarChart2, GraduationCap, ScrollText } from 'lucide-react';
import { formatNumber } from '../logic/format';

export const MobileLayout = ({
    state,
    derivedStats,
    actions,
    simulationState,
    onStartTournament,
    logs
}) => {
    const [activeTab, setActiveTab] = useState('arena');

    // Helper for Income Calculation
    const { playerElo, totalIncomePerMinute } = derivedStats;

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
        <div className="h-screen w-full bg-black text-gray-100 font-sans overflow-hidden flex flex-col">
            {/* Top Bar */}
            <div className="h-14 shrink-0 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20 shadow-md">
                 <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 uppercase tracking-wider">Elo</span>
                     <span className="text-gold-primary font-mono font-bold leading-tight">{playerElo}</span>
                 </div>
                 <div className="flex flex-col items-end">
                     <span className="text-[10px] text-gray-500 uppercase tracking-wider">Prod/Min</span>
                     <span className="text-emerald-400 font-mono font-bold leading-tight">+{formatNumber(totalIncomePerMinute)}</span>
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
