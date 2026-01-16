import React, { useState } from 'react';
import { SKILLS, getSkillById } from '../logic/skills';
import { Sword, Shield, Skull, Lock, CheckCircle2 } from 'lucide-react';

const TreeColumn = ({ phaseName, parentId, skills, ownedSkills, availableSP, onPurchase, locked }) => {
    const parentSkill = getSkillById(parentId);
    const parentOwned = !!ownedSkills[parentId];

    // If entire column is locked (due to exclusivity)
    if (locked) {
        return (
            <div className="flex flex-col items-center opacity-30 pointer-events-none grayscale">
                <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">{phaseName}</div>
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
            <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">{phaseName}</div>
            {/* Parent Node */}
            <ParentNode
                skill={parentSkill}
                owned={parentOwned}
                canAfford={availableSP >= parentSkill.spCost}
                onPurchase={onPurchase}
            />

            {/* Connector */}
            <div className={`h-8 w-0.5 my-2 transition-colors ${parentOwned ? 'bg-purple-500' : 'bg-gray-700'}`}></div>

            {/* Children */}
            <div className="flex gap-2">
                {skills.map(skill => {
                    const level = typeof ownedSkills[skill.id] === 'number'
                                  ? ownedSkills[skill.id]
                                  : (ownedSkills[skill.id] ? 1 : 0);
                    const isMaxed = level >= skill.maxLevel;
                    const canAfford = availableSP >= skill.spCost;

                    return (
                        <ChildNode
                            key={skill.id}
                            skill={skill}
                            level={level}
                            locked={!parentOwned}
                            canAfford={canAfford}
                            isMaxed={isMaxed}
                            onPurchase={onPurchase}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const InstinctColumn = ({ skill, owned, locked, availableSP, onPurchase }) => {
     return (
        <div className={`flex flex-col items-center ${locked ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
             <ParentNode
                skill={skill}
                owned={owned}
                canAfford={!locked && availableSP >= skill.spCost}
                onPurchase={onPurchase}
                icon={true}
            />
        </div>
     );
}

const ParentNode = ({ skill, owned, canAfford, onPurchase, icon }) => {
    let IconComponent = null;
    if (icon) {
         if (skill.id.includes('tactics')) IconComponent = Sword;
         if (skill.id.includes('defense')) IconComponent = Shield;
         if (skill.id.includes('risk')) IconComponent = Skull;
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

             {/* Tooltip for Description since these are roots */}
             <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-48 bg-gray-900 border border-gray-700 p-3 rounded shadow-xl text-center">
                <div className="text-[10px] text-gray-400 leading-tight">{skill.description}</div>
            </div>

            {owned ? (
                <div className="text-[10px] uppercase font-bold bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Owned
                </div>
            ) : (
                <div className="text-[10px] font-mono opacity-80">{skill.spCost} SP</div>
            )}
        </button>
    );
};

const ChildNode = ({ skill, level, locked, canAfford, isMaxed, onPurchase }) => {
    // Determine Icon based on ID/Name
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
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-32 bg-gray-900 border border-gray-700 p-2 rounded shadow-xl text-center">
                <div className="text-[10px] font-bold text-gray-300 mb-1">{skill.name}</div>
                <div className="text-[9px] text-gray-500 leading-tight">{skill.description}</div>
            </div>
        </button>
    );
};

export const SkillTreeModal = ({ isOpen, onClose, skills, derivedStats, onPurchase }) => {
    if (!isOpen) return null;

    const { studyPoints } = derivedStats;

    // Filter Skills
    const openingChildren = SKILLS.filter(s => s.parentId === 'study_opening');
    const midgameChildren = SKILLS.filter(s => s.parentId === 'study_midgame');
    const endgameChildren = SKILLS.filter(s => s.parentId === 'study_endgame');

    // Instinct Skills
    const instinctTactics = getSkillById('instinct_tactics');
    const instinctDefense = getSkillById('instinct_defense');
    const instinctRisk = getSkillById('instinct_risk');

    // Determine Lock State (Exclusivity - Study Path)
    const hasOpening = !!skills['study_opening'];
    const hasMidgame = !!skills['study_midgame'];
    const hasEndgame = !!skills['study_endgame'];

    const lockOpening = hasMidgame || hasEndgame;
    const lockMidgame = hasOpening || hasEndgame;
    const lockEndgame = hasOpening || hasMidgame;

    // Determine Lock State (Exclusivity - Instinct Path)
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
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#252529]">
                    <div>
                        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                             🎓 Phase Specializations
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Choose your Study Path and Instinct Focus. Paths within each category are mutually exclusive.
                        </p>
                    </div>
                    <div className="text-right">
                         <div className="text-xs text-gray-500 uppercase tracking-widest">Study Points</div>
                         <div className="text-2xl font-mono font-bold text-blue-400">{studyPoints || 0}</div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-10">

                    {/* Study Focus Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center border-b border-gray-800 pb-2">
                            Study Focus (Select One)
                        </h3>
                        <div className="flex justify-center gap-8 md:gap-16">
                            <TreeColumn
                                phaseName="Opening"
                                parentId="study_opening"
                                skills={openingChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockOpening}
                            />

                            <TreeColumn
                                phaseName="Midgame"
                                parentId="study_midgame"
                                skills={midgameChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockMidgame}
                            />

                            <TreeColumn
                                phaseName="Endgame"
                                parentId="study_endgame"
                                skills={endgameChildren}
                                ownedSkills={skills}
                                availableSP={studyPoints || 0}
                                onPurchase={onPurchase}
                                locked={lockEndgame}
                            />
                        </div>
                    </div>

                    {/* Instinct Focus Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center border-b border-gray-800 pb-2">
                            Instinct Focus (Select One)
                        </h3>
                        <div className="flex justify-center gap-8 md:gap-16">
                            <div className="flex flex-col items-center">
                                <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">Tactics</div>
                                <InstinctColumn
                                    skill={instinctTactics}
                                    owned={hasInstinctTactics}
                                    locked={lockInstinctTactics}
                                    availableSP={studyPoints || 0}
                                    onPurchase={onPurchase}
                                />
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">Defense</div>
                                <InstinctColumn
                                    skill={instinctDefense}
                                    owned={hasInstinctDefense}
                                    locked={lockInstinctDefense}
                                    availableSP={studyPoints || 0}
                                    onPurchase={onPurchase}
                                />
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="text-gray-400 font-bold mb-2 uppercase tracking-wider text-xs">Risk</div>
                                <InstinctColumn
                                    skill={instinctRisk}
                                    owned={hasInstinctRisk}
                                    locked={lockInstinctRisk}
                                    availableSP={studyPoints || 0}
                                    onPurchase={onPurchase}
                                />
                            </div>
                        </div>
                    </div>

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
