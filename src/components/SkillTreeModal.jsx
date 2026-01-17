import React, { useState } from 'react';
import { SKILLS, getSkillById, getBranchTierStatus, calculateTenureMultiplier } from '../logic/skills';
import { Sword, Shield, Skull, Lock, CheckCircle2, Trophy, Clock, RefreshCw, X } from 'lucide-react';
import { useLongPress } from '../hooks/useLongPress';

const getBonusText = (skill, level) => {
    if (level === 0) return null;
    // Instinct Risk Sub-skills
    if (skill.id.includes('inst_sac')) return `+${level}% Chance`;
    // Instinct Tactics/Defense Sub-skills
    if (skill.id.includes('inst_')) return `+${level}%`;
    // Phase Mastery (Study) Sub-skills
    // Check specific new Tier 3
    if (skill.id.includes('novelty') || skill.id.includes('cloud') || skill.id.includes('tablebase')) return `-${level * 3}% Enemy`;
    if (skill.id.includes('space') || skill.id.includes('simplify')) return `+${level * 4}% All`;
    if (skill.id.includes('zugzwang')) return `-${level}%/Turn`;

    if (skill.category === 'Phase Mastery') return `+${level * 10}%`;
    return null;
};

const SkillDetailOverlay = ({ skill, onClose }) => {
    if (!skill) return null;

    let Icon = Sword;
    if (skill.id.includes('def')) Icon = Shield;
    if (skill.id.includes('sac') || skill.id.includes('risk')) Icon = Skull;
    if (skill.id.includes('extender')) Icon = Clock;
    if (skill.id.includes('boost') || skill.id.includes('caro')) Icon = Trophy;
    if (skill.id.includes('tactics')) Icon = Sword;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 border border-gray-600 rounded-xl shadow-2xl p-6 w-full max-w-sm relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-gray-800 rounded-full mb-3 border border-gray-700">
                        <Icon size={32} className="text-purple-400" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{skill.name}</h3>
                    <div className="text-xs text-purple-300 font-bold uppercase tracking-widest mb-4">{skill.category}</div>

                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                        {skill.description}
                    </p>

                    <div className="bg-gray-800 rounded-lg p-3 w-full border border-gray-700 flex justify-between items-center">
                         <span className="text-xs text-gray-500 uppercase font-bold">Cost</span>
                         <span className="text-white font-mono font-bold">{skill.spCost} SP</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TreeColumn = ({ title, parentId, skills, ownedSkills, availableSP, onPurchase, locked, branch, onShowDetails }) => {
    const parentSkill = getSkillById(parentId);
    const parentOwned = !!ownedSkills[parentId];

    // Parent Bonus (Fixed 10% for these roots)
    const parentBonus = parentOwned ? "+10%" : null;

    const tier1 = skills.filter(s => s.tier === 1 || !s.tier); // Default to Tier 1 if undefined (Instinct)
    const tier2 = skills.filter(s => s.tier === 2);
    const tier3 = skills.filter(s => s.tier === 3);

    const { tier2Unlocked, tier3Unlocked } = branch ? getBranchTierStatus(branch, ownedSkills) : { tier2Unlocked: true, tier3Unlocked: true };

    if (locked) {
        return (
            <div className="flex flex-col items-center opacity-30 pointer-events-none grayscale min-w-[140px]">
                <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">{title}</div>
                <ParentNode skill={parentSkill} owned={false} onShowDetails={onShowDetails} />
                <div className="h-8 w-0.5 bg-gray-700 my-2"></div>
                <div className="flex gap-6 md:gap-2">
                     {tier1.map(s => <ChildNode key={s.id} skill={s} locked={true} onShowDetails={onShowDetails} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-w-[140px]">
            <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">{title}</div>

            {/* TIER 0 (ROOT) */}
            <ParentNode
                skill={parentSkill}
                owned={parentOwned}
                canAfford={availableSP >= parentSkill.spCost}
                onPurchase={onPurchase}
                bonusText={parentBonus}
                icon={true} // Always show icon if available
                onShowDetails={onShowDetails}
            />

            <div className={`h-8 w-0.5 my-2 transition-colors ${parentOwned ? 'bg-purple-500' : 'bg-gray-700'}`}></div>

            {/* TIER 1 */}
            <div className="flex gap-6 md:gap-2">
                {tier1.map(skill => {
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
                            onShowDetails={onShowDetails}
                        />
                    );
                })}
            </div>

            {/* TIER 2 SECTION (Only if Tier 2 skills exist) */}
            {tier2.length > 0 && (
                <>
                    <div className="relative h-12 w-full flex justify-center items-center">
                        <div className={`absolute top-0 bottom-0 w-0.5 ${tier2Unlocked ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
                         {!tier2Unlocked && (
                             <div className="absolute z-10 bg-gray-800 p-1.5 rounded-full border border-gray-600 group">
                                 <Lock size={14} className="text-gray-400" />
                                 <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-32 bg-black border border-gray-700 p-2 rounded text-[10px] text-center">
                                     Unlock: 5 Total Levels in Tier 1
                                 </div>
                             </div>
                         )}
                    </div>

                    <div className="flex gap-6 md:gap-2">
                        {tier2.map(skill => {
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
                                    locked={!tier2Unlocked}
                                    canAfford={canAfford}
                                    isMaxed={isMaxed}
                                    onPurchase={onPurchase}
                                    bonusText={bonusText}
                                    onShowDetails={onShowDetails}
                                />
                            );
                        })}
                    </div>
                </>
            )}

            {/* TIER 3 SECTION (Only if Tier 3 skills exist) */}
            {tier3.length > 0 && (
                <>
                    <div className="relative h-12 w-full flex justify-center items-center">
                        <div className={`absolute top-0 bottom-0 w-0.5 ${tier3Unlocked ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
                         {!tier3Unlocked && (
                             <div className="absolute z-10 bg-gray-800 p-1.5 rounded-full border border-gray-600 group">
                                 <Lock size={14} className="text-gray-400" />
                                 <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-32 bg-black border border-gray-700 p-2 rounded text-[10px] text-center">
                                     Unlock: 1 Total Level in Tier 2
                                 </div>
                             </div>
                         )}
                    </div>

                    <div className="flex gap-6 md:gap-2">
                        {tier3.map(skill => {
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
                                    locked={!tier3Unlocked}
                                    canAfford={canAfford}
                                    isMaxed={isMaxed}
                                    onPurchase={onPurchase}
                                    bonusText={bonusText}
                                    highlight={true}
                                    onShowDetails={onShowDetails}
                                />
                            );
                        })}
                    </div>
                </>
            )}

        </div>
    );
};

const ParentNode = ({ skill, owned, canAfford, onPurchase, icon, bonusText, onShowDetails }) => {
    let IconComponent = null;
    if (icon) {
         if (skill.id.includes('tactics')) IconComponent = Sword;
         if (skill.id.includes('defense')) IconComponent = Shield;
         if (skill.id.includes('risk') || skill.id.includes('sac')) IconComponent = Skull;
    }

    const clickAction = () => {
        if (!owned && canAfford) {
            onPurchase(skill.id);
        }
    };

    const pressHandlers = useLongPress(() => onShowDetails(skill), clickAction, { delay: 500 });

    return (
        <button
            {...pressHandlers}
            className={`w-40 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 relative group select-none touch-manipulation
                ${owned
                    ? 'bg-purple-900/30 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : canAfford
                        ? 'bg-gray-800 border-gray-600 hover:border-purple-400 hover:bg-gray-700 text-gray-200'
                        : 'bg-gray-900 border-gray-800 text-gray-600 opacity-70'
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

const ChildNode = ({ skill, level, locked, canAfford, isMaxed, onPurchase, bonusText, highlight, onShowDetails }) => {
    let Icon = Sword;
    if (skill.id.includes('def')) Icon = Shield;
    if (skill.id.includes('sac')) Icon = Skull;
    if (skill.id.includes('extender')) Icon = Clock;
    if (skill.id.includes('boost') || skill.id.includes('caro')) Icon = Trophy;
    if (skill.tier === 3) Icon = Trophy; // Grandmaster Skills

    const clickAction = () => {
        if (!locked && !isMaxed && canAfford) {
            onPurchase(skill.id);
        }
    };

    const pressHandlers = useLongPress(() => onShowDetails(skill), clickAction, { delay: 500 });

    return (
        <button
            {...pressHandlers}
            title={skill.description}
            className={`w-16 h-20 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all relative group select-none touch-manipulation shrink-0
                ${highlight && !locked ? 'shadow-[0_0_10px_rgba(168,85,247,0.2)]' : ''}
                ${locked
                    ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed opacity-70'
                    : isMaxed
                        ? 'bg-purple-900/20 border-purple-500/50 text-purple-300'
                        : canAfford
                            ? 'bg-gray-800 border-gray-600 hover:border-purple-400 text-gray-200'
                            : 'bg-gray-900 border-gray-800 text-gray-500 opacity-70'
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

export const SkillTreeModal = ({ isOpen, onClose, skills, derivedStats, onPurchase, onTacticalReview }) => {
    const [activeTab, setActiveTab] = useState('study'); // 'study' | 'instinct'
    const [selectedSkill, setSelectedSkill] = useState(null);

    if (!isOpen) return null;

    const { studyPoints, reviewTokens } = derivedStats;

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

    // Calculate Tenure Multiplier
    const tenureMult = calculateTenureMultiplier(skills);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <SkillDetailOverlay skill={selectedSkill} onClose={() => setSelectedSkill(null)} />

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
                        <div className="text-right flex flex-col items-end gap-2">
                             {/* Review Button */}
                             <button
                                 onClick={() => {
                                     if (reviewTokens > 0) {
                                         if (window.confirm("Tactical Review will reset ALL skills (SP and AP) and refund SP. This costs 1 Token. Are you sure?")) {
                                             onTacticalReview();
                                         }
                                     }
                                 }}
                                 disabled={!reviewTokens || reviewTokens <= 0}
                                 className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-all ${
                                     reviewTokens > 0
                                         ? 'bg-red-900/30 border-red-500/30 text-red-300 hover:bg-red-900/50 hover:text-white cursor-pointer'
                                         : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                 }`}
                             >
                                 <RefreshCw size={12} />
                                 Tactical Review ({reviewTokens || 0}/3)
                             </button>

                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">Study Points</div>
                                <div className="text-2xl font-mono font-bold text-blue-400">{studyPoints || 0}</div>
                            </div>

                            {/* Tenure Display */}
                             <div className="bg-purple-900/30 border border-purple-500/30 px-3 py-1 rounded text-right">
                                <div className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Academic Tenure</div>
                                <div className="text-sm font-mono text-purple-100">
                                    x{tenureMult.toFixed(2)} Production
                                </div>
                            </div>
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
                <div className="p-4 md:p-8 overflow-y-auto flex-1 flex flex-col items-center w-full">

                    {activeTab === 'study' && (
                        <div className="w-full flex justify-start md:justify-center overflow-x-auto gap-8 md:gap-16 fade-in pb-4 px-4 snap-x">
                            <TreeColumn
                                title="Opening"
                                parentId="study_opening"
                                skills={openingChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockOpening}
                                branch="opening"
                                onShowDetails={setSelectedSkill}
                            />

                            <TreeColumn
                                title="Midgame"
                                parentId="study_midgame"
                                skills={midgameChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockMidgame}
                                branch="midgame"
                                onShowDetails={setSelectedSkill}
                            />

                            <TreeColumn
                                title="Endgame"
                                parentId="study_endgame"
                                skills={endgameChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockEndgame}
                                branch="endgame"
                                onShowDetails={setSelectedSkill}
                            />
                        </div>
                    )}

                    {activeTab === 'instinct' && (
                        <div className="w-full flex justify-start md:justify-center overflow-x-auto gap-8 md:gap-16 fade-in pb-4 px-4 snap-x">
                            <TreeColumn
                                title="Tactics"
                                parentId="instinct_tactics"
                                skills={instinctTacticsChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockInstinctTactics}
                                onShowDetails={setSelectedSkill}
                            />

                            <TreeColumn
                                title="Defense"
                                parentId="instinct_defense"
                                skills={instinctDefenseChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockInstinctDefense}
                                onShowDetails={setSelectedSkill}
                            />

                            <TreeColumn
                                title="Risk"
                                parentId="instinct_risk"
                                skills={instinctRiskChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockInstinctRisk}
                                onShowDetails={setSelectedSkill}
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
