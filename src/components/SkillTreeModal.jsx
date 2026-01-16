import React, { useState } from 'react';
import { SKILLS, getSkillById } from '../logic/skills';
import { Sword, Shield, Skull, Lock, CheckCircle2 } from 'lucide-react';

const getBonusText = (skill, level) => {
    if (level === 0) return null;
    // Instinct Risk Sub-skills
    if (skill.id.includes('inst_sac')) return `+${level}% Chance`;
    // Instinct Tactics/Defense Sub-skills
    if (skill.id.includes('inst_')) return `+${level}%`;
    // Phase Mastery (Study) Sub-skills
    if (skill.category === 'Phase Mastery') return `+${level * 10}%`;
    return null;
};

const TreeColumn = ({ title, parentId, skills, ownedSkills, availableSP, onPurchase, locked }) => {
    const parentSkill = getSkillById(parentId);
    const parentOwned = !!ownedSkills[parentId];

    // Parent Bonus (Fixed 10% for these roots)
    const parentBonus = parentOwned ? "+10%" : null;

    if (locked) {
        return (
            <div className="flex flex-col items-center opacity-30 pointer-events-none grayscale">
                <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">{title}</div>
                <ParentNode skill={parentSkill} owned={false} />
                <div className="h-8 w-0.5 bg-gray-700 my-2"></div>
                <div className="flex gap-2">
                     {skills.map(s => <ChildNode key={s.id} skill={s} locked={true} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">{title}</div>

            <ParentNode
                skill={parentSkill}
                owned={parentOwned}
                canAfford={availableSP >= parentSkill.spCost}
                onPurchase={onPurchase}
                bonusText={parentBonus}
                icon={true} // Always show icon if available
            />

            <div className={`h-8 w-0.5 my-2 transition-colors ${parentOwned ? 'bg-purple-500' : 'bg-gray-700'}`}></div>

            <div className="flex gap-2">
                {skills.map(skill => {
                    const level = typeof ownedSkills[skill.id] === 'number'
                                  ? ownedSkills[skill.id]
                                  : (ownedSkills[skill.id] ? 1 : 0);
                    const isMaxed = level >= skill.maxLevel;
                    const canAfford = availableSP >= skill.spCost;
                    const bonusText = getBonusText(skill, level);

                    return (
                        <ChildNode
                            key={skill.id}
                            skill={skill}
                            level={level}
                            locked={!parentOwned}
                            canAfford={canAfford}
                            isMaxed={isMaxed}
                            onPurchase={onPurchase}
                            bonusText={bonusText}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const ParentNode = ({ skill, owned, canAfford, onPurchase, icon, bonusText }) => {
    let IconComponent = null;
    if (icon) {
         if (skill.id.includes('tactics')) IconComponent = Sword;
         if (skill.id.includes('defense')) IconComponent = Shield;
         if (skill.id.includes('risk') || skill.id.includes('sac')) IconComponent = Skull;
    }

    return (
        <button
            onClick={() => !owned && canAfford && onPurchase(skill.id)}
            disabled={owned || !canAfford}
            className={`w-40 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 relative group
                ${owned
                    ? 'bg-purple-900/30 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : canAfford
                        ? 'bg-gray-800 border-gray-600 hover:border-purple-400 hover:bg-gray-700 text-gray-200'
                        : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                }
            `}
        >
            {IconComponent && <IconComponent size={20} className="mb-1 text-purple-400" />}
            <div className="font-bold text-sm text-center leading-tight">{skill.name}</div>

             <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-48 bg-gray-900 border border-gray-700 p-3 rounded shadow-xl text-center">
                <div className="text-[10px] text-gray-400 leading-tight">{skill.description}</div>
            </div>

            {owned ? (
                <div className="text-[10px] uppercase font-bold bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    {bonusText || 'Owned'}
                </div>
            ) : (
                <div className="text-[10px] font-mono opacity-80">{skill.spCost} SP</div>
            )}
        </button>
    );
};

const ChildNode = ({ skill, level, locked, canAfford, isMaxed, onPurchase, bonusText }) => {
    let Icon = Sword;
    if (skill.id.includes('def')) Icon = Shield;
    if (skill.id.includes('sac')) Icon = Skull;

    return (
        <button
            onClick={() => !locked && !isMaxed && canAfford && onPurchase(skill.id)}
            disabled={locked || isMaxed || !canAfford}
            title={skill.description}
            className={`w-16 h-20 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all relative group
                ${locked
                    ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed'
                    : isMaxed
                        ? 'bg-purple-900/20 border-purple-500/50 text-purple-300'
                        : canAfford
                            ? 'bg-gray-800 border-gray-600 hover:border-purple-400 text-gray-200'
                            : 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed'
                }
            `}
        >
            {locked && <Lock size={12} className="absolute top-1 right-1 text-gray-700" />}

            <Icon size={18} />

            <div className="flex flex-col items-center">
                 <div className="text-[10px] font-bold">Lvl {level}</div>
                 {!isMaxed && !locked && (
                     <div className="text-[9px] opacity-60 font-mono">{skill.spCost} SP</div>
                 )}
                 {bonusText && (
                     <div className="text-[9px] text-purple-300 font-bold mt-0.5">{bonusText}</div>
                 )}
            </div>

            <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-32 bg-gray-900 border border-gray-700 p-2 rounded shadow-xl text-center">
                <div className="text-[10px] font-bold text-gray-300 mb-1">{skill.name}</div>
                <div className="text-[9px] text-gray-500 leading-tight">{skill.description}</div>
            </div>
        </button>
    );
};

export const SkillTreeModal = ({ isOpen, onClose, skills, derivedStats, onPurchase }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState('study'); // 'study' | 'instinct'

    const { studyPoints } = derivedStats;

    // Study Skills Children
    const openingChildren = SKILLS.filter(s => s.parentId === 'study_opening');
    const midgameChildren = SKILLS.filter(s => s.parentId === 'study_midgame');
    const endgameChildren = SKILLS.filter(s => s.parentId === 'study_endgame');

    // Instinct Skills Children
    const instinctTacticsChildren = SKILLS.filter(s => s.parentId === 'instinct_tactics');
    const instinctDefenseChildren = SKILLS.filter(s => s.parentId === 'instinct_defense');
    const instinctRiskChildren = SKILLS.filter(s => s.parentId === 'instinct_risk');

    // Locks (Study)
    const hasOpening = !!skills['study_opening'];
    const hasMidgame = !!skills['study_midgame'];
    const hasEndgame = !!skills['study_endgame'];

    const lockOpening = hasMidgame || hasEndgame;
    const lockMidgame = hasOpening || hasEndgame;
    const lockEndgame = hasOpening || hasMidgame;

    // Locks (Instinct)
    const hasInstinctTactics = !!skills['instinct_tactics'];
    const hasInstinctDefense = !!skills['instinct_defense'];
    const hasInstinctRisk = !!skills['instinct_risk'];

    const lockInstinctTactics = hasInstinctDefense || hasInstinctRisk;
    const lockInstinctDefense = hasInstinctTactics || hasInstinctRisk;
    const lockInstinctRisk = hasInstinctTactics || hasInstinctDefense;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1E1E24] w-full max-w-5xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-700 bg-[#252529]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                                🎓 Phase Specializations
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Choose your specialized path. Paths within each category are mutually exclusive.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-widest">Study Points</div>
                            <div className="text-2xl font-mono font-bold text-blue-400">{studyPoints || 0}</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('study')}
                            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                                activeTab === 'study'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            Study Focus
                        </button>
                        <button
                            onClick={() => setActiveTab('instinct')}
                            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                                activeTab === 'instinct'
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            Instinct Focus
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 flex flex-col items-center">

                    {activeTab === 'study' && (
                        <div className="flex justify-center gap-8 md:gap-16 fade-in">
                            <TreeColumn
                                title="Opening"
                                parentId="study_opening"
                                skills={openingChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockOpening}
                            />

                            <TreeColumn
                                title="Midgame"
                                parentId="study_midgame"
                                skills={midgameChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockMidgame}
                            />

                            <TreeColumn
                                title="Endgame"
                                parentId="study_endgame"
                                skills={endgameChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockEndgame}
                            />
                        </div>
                    )}

                    {activeTab === 'instinct' && (
                        <div className="flex justify-center gap-8 md:gap-16 fade-in">
                            <TreeColumn
                                title="Tactics"
                                parentId="instinct_tactics"
                                skills={instinctTacticsChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockInstinctTactics}
                            />

                            <TreeColumn
                                title="Defense"
                                parentId="instinct_defense"
                                skills={instinctDefenseChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockInstinctDefense}
                            />

                            <TreeColumn
                                title="Risk"
                                parentId="instinct_risk"
                                skills={instinctRiskChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockInstinctRisk}
                            />
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 bg-[#252529] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};
