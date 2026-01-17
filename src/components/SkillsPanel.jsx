import React, { useState } from 'react';
import { SKILLS, getSkillById } from '../logic/skills';
import { SkillTreeModal } from './SkillTreeModal';
import { GraduationCap } from 'lucide-react';
import { useRepeatingPress } from '../hooks/useRepeatingPress';

const SkillCard = ({ skill, owned, canAfford, isLocked, conflictingSkill, onPurchase }) => {
  const costLabel = skill.costType === 'SP' ? `${skill.spCost} SP` : `${skill.cost} AP`;

  const pressHandlers = useRepeatingPress(() => onPurchase(skill.id));

  return (
    <div className={`p-4 rounded-xl mb-3 transition-all duration-300 border
        ${owned
            ? 'bg-purple-900/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
            : isLocked
                ? 'bg-gray-800/50 border-red-900/30 opacity-70'
                : canAfford
                    ? 'glass-card hover:border-purple-500/40 hover:shadow-lg hover:-translate-y-0.5'
                    : 'glass-card opacity-60 grayscale border-transparent'
    }`}>
      <div className="flex justify-between items-start mb-2">
          <h4 className={`font-bold text-base ${owned ? 'text-purple-300' : isLocked ? 'text-gray-400' : 'text-gray-100'}`}>{skill.name}</h4>
          {owned ? (
              <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  Owned
              </span>
          ) : isLocked ? (
              <span className="text-[10px] uppercase font-bold bg-red-900/20 text-red-400 px-2 py-0.5 rounded border border-red-900/30">
                  Locked
              </span>
          ) : (
              <button
                 {...pressHandlers}
                 disabled={!canAfford}
                 className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                     canAfford 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md hover:shadow-purple-500/25'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                 }`}
              >
                  Buy ({costLabel})
              </button>
          )}
      </div>

      <p className="text-xs text-purple-400/80 mb-1.5 uppercase tracking-wider font-semibold">{skill.category}</p>

      {isLocked && conflictingSkill ? (
          <p className="text-xs text-red-400 mb-1.5 font-bold">
              Exclusive with: {conflictingSkill.name}
          </p>
      ) : null}

      <p className="text-sm text-gray-400 leading-relaxed font-light">{skill.description}</p>
    </div>
  );
};

export const SkillsHeader = ({ derivedStats }) => {
    const { availableAbilityPoints, totalAbilityPoints, studyPoints } = derivedStats;
    return (
        <div className="mb-6 grid grid-cols-2 gap-4">
             {/* AP Card */}
             <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Ability Points</div>
                <div className="text-purple-400 font-mono text-xl font-bold mb-1">
                    {availableAbilityPoints} <span className="text-gray-600 text-sm">/ {totalAbilityPoints}</span>
                </div>
                <div className="text-[10px] text-gray-600">
                    From Tournaments
                </div>
            </div>

             {/* SP Card */}
             <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Study Points</div>
                <div className="text-blue-400 font-mono text-xl font-bold mb-1">
                    {studyPoints || 0}
                </div>
                <div className="text-[10px] text-gray-600">
                    From Clearing Tiers
                </div>
            </div>
      </div>
    );
};

export const SkillsPanel = ({ skills, derivedStats, onPurchase, onTacticalReview }) => {
  const { availableAbilityPoints, studyPoints } = derivedStats;
  const [isTreeOpen, setIsTreeOpen] = useState(false);

  // Group skills by category for better layout
  // Filter out isHidden skills
  const visibleSkills = SKILLS.filter(s => !s.isHidden);
  const categories = [...new Set(visibleSkills.map(s => s.category))];

  // Helper to find conflict
  const findConflict = (skill) => {
      if (!skill.group) return null;
      // Find an owned skill that shares the group
      const ownedIds = Object.keys(skills).filter(id => skills[id]);
      const conflictId = ownedIds.find(id => {
          const s = getSkillById(id);
          return s && s.group === skill.group;
      });
      return conflictId ? getSkillById(conflictId) : null;
  };

  return (
    <div className="p-4 pt-0">

      {/* Specializations Button */}
      <button
        onClick={() => setIsTreeOpen(true)}
        className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 hover:border-blue-400 transition-all group flex items-center justify-between shadow-lg"
      >
          <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300 group-hover:text-white transition-colors">
                  <GraduationCap size={24} />
              </div>
              <div className="text-left">
                  <div className="font-bold text-blue-100 group-hover:text-white">Open Specializations</div>
                  <div className="text-xs text-blue-400/80">Master the 3 Phases of Chess</div>
              </div>
          </div>
          <div className="text-xs font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-all">
              View Tree
          </div>
      </button>

      <SkillTreeModal
        isOpen={isTreeOpen}
        onClose={() => setIsTreeOpen(false)}
        skills={skills}
        derivedStats={derivedStats}
        onPurchase={onPurchase}
        onTacticalReview={onTacticalReview}
      />

      <div className="space-y-6">
          {categories.map(cat => {
              const catSkills = visibleSkills.filter(s => s.category === cat);
              if (catSkills.length === 0) return null;
              return (
                  <div key={cat}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">{cat}</h3>
                      <div>
                          {catSkills.map(skill => {
                              const owned = !!skills[skill.id];
                              let canAfford = false;
                              if (skill.costType === 'SP') {
                                  canAfford = (studyPoints || 0) >= skill.spCost;
                              } else {
                                  canAfford = availableAbilityPoints >= skill.cost;
                              }

                              const conflictingSkill = !owned ? findConflict(skill) : null;
                              const isLocked = !!conflictingSkill;

                              return (
                                  <SkillCard
                                    key={skill.id}
                                    skill={skill}
                                    owned={owned}
                                    canAfford={canAfford}
                                    isLocked={isLocked}
                                    conflictingSkill={conflictingSkill}
                                    onPurchase={onPurchase}
                                  />
                              );
                          })}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
};
