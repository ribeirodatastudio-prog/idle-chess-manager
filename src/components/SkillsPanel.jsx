import React from 'react';
import { SKILLS } from '../logic/skills';

const SkillCard = ({ skill, owned, canAfford, onPurchase }) => {
  return (
    <div className={`p-4 rounded-xl mb-3 transition-all duration-300 border
        ${owned
            ? 'bg-purple-900/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
            : canAfford 
                ? 'glass-card hover:border-purple-500/40 hover:shadow-lg hover:-translate-y-0.5'
                : 'glass-card opacity-60 grayscale border-transparent'
    }`}>
      <div className="flex justify-between items-start mb-2">
          <h4 className={`font-bold text-base ${owned ? 'text-purple-300' : 'text-gray-100'}`}>{skill.name}</h4>
          {owned ? (
              <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  Owned
              </span>
          ) : (
              <button
                 onClick={() => onPurchase(skill.id)}
                 disabled={!canAfford}
                 className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                     canAfford 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md hover:shadow-purple-500/25'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                 }`}
              >
                  Buy ({skill.cost} AP)
              </button>
          )}
      </div>
      <p className="text-xs text-purple-400/80 mb-1.5 uppercase tracking-wider font-semibold">{skill.category}</p>
      <p className="text-sm text-gray-400 leading-relaxed font-light">{skill.description}</p>
    </div>
  );
};

export const SkillsHeader = ({ derivedStats }) => {
    const { availableAbilityPoints, totalAbilityPoints } = derivedStats;
    return (
        <div className="mb-6 glass-card p-4 rounded-xl text-center">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Ability Points</div>
            <div className="text-purple-400 font-mono text-2xl font-bold mb-2">
                {availableAbilityPoints} <span className="text-gray-600 text-base">/ {totalAbilityPoints}</span>
            </div>
            <div className="text-xs text-gray-500 flex flex-col gap-1">
                <span>Earn AP by clearing Tournaments</span>
                <span className="opacity-70">(Rapid, Blitz, Classical)</span>
            </div>
      </div>
    );
};

export const SkillsPanel = ({ skills, derivedStats, onPurchase }) => {
  const { availableAbilityPoints } = derivedStats;

  // Group skills by category for better layout
  const categories = [...new Set(SKILLS.map(s => s.category))];

  return (
    <div className="p-4 pt-0">
      <div className="space-y-6">
          {categories.map(cat => {
              const catSkills = SKILLS.filter(s => s.category === cat);
              if (catSkills.length === 0) return null;
              return (
                  <div key={cat}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">{cat}</h3>
                      <div>
                          {catSkills.map(skill => (
                              <SkillCard 
                                key={skill.id}
                                skill={skill}
                                owned={!!skills[skill.id]}
                                canAfford={availableAbilityPoints >= skill.cost}
                                onPurchase={onPurchase}
                              />
                          ))}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
};
