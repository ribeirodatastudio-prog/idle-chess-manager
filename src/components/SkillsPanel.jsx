import React from 'react';
import { SKILLS } from '../logic/skills';

const SkillCard = ({ skill, owned, canAfford, onPurchase }) => {
  return (
    <div className={`p-3 rounded-lg border mb-3 transition-all ${
        owned 
            ? 'bg-purple-900/20 border-purple-500/50' 
            : canAfford 
                ? 'bg-gray-800 border-gray-600 hover:border-purple-400' 
                : 'bg-gray-800/50 border-gray-700 opacity-70'
    }`}>
      <div className="flex justify-between items-start mb-1">
          <h4 className={`font-bold ${owned ? 'text-purple-300' : 'text-gray-200'}`}>{skill.name}</h4>
          {owned ? (
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Owned</span>
          ) : (
              <button
                 onClick={() => onPurchase(skill.id)}
                 disabled={!canAfford}
                 className={`text-xs px-2 py-1 rounded font-bold ${
                     canAfford 
                        ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                 }`}
              >
                  Buy ({skill.cost} AP)
              </button>
          )}
      </div>
      <p className="text-xs text-gray-400 mb-1 italic">{skill.category}</p>
      <p className="text-xs text-gray-300 leading-tight">{skill.description}</p>
    </div>
  );
};

export const SkillsHeader = ({ derivedStats }) => {
    const { availableAbilityPoints, totalAbilityPoints } = derivedStats;
    return (
        <div className="mb-4 text-gray-300 bg-gray-800 p-3 rounded text-center border border-gray-700">
            <div>Ability Points</div>
            <div className="text-purple-400 font-mono text-xl">
                {availableAbilityPoints} <span className="text-gray-500 text-sm">/ {totalAbilityPoints}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                <span>Earn AP by clearing Tournaments</span>
                <span>(Rapid, Blitz, Classical)</span>
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
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">{cat}</h3>
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
