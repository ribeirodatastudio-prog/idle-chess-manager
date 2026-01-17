import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose, actions, isDevMode }) => {
    // Reset Logic States
    const [resetStep, setResetStep] = useState('idle'); // 'idle', 'confirm', 'math'
    const [mathProblem, setMathProblem] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');

    useEffect(() => {
        if (isOpen) {
            setResetStep('idle');
            setUserAnswer('');
            setMathProblem(null);
        }
    }, [isOpen]);

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
            alert('Dev Mode Enabled');
            onClose();
            return;
        }

        if (parseInt(userAnswer) === mathProblem.answer) {
            actions.resetGame();
            onClose();
        } else {
            alert('Incorrect answer. Reset cancelled.');
            setResetStep('idle');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={onClose}
        >
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-sm shadow-2xl text-center" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-white">Settings</span>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Step 1: Menu */}
                {resetStep === 'idle' && (
                    <div className="space-y-4">
                        {isDevMode && (
                             <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg mb-4">
                                <h3 className="text-purple-400 font-bold text-sm mb-2">DEV MODE ACTIVE</h3>
                                <button
                                    onClick={() => {
                                        if(confirm("Win entire tournament?")) {
                                            actions.completeTournament();
                                            onClose();
                                        }
                                    }}
                                    className="w-full py-2 px-3 bg-purple-600 text-white rounded font-bold hover:bg-purple-500 transition-colors text-xs"
                                >
                                    Win Tournament (Rapid)
                                </button>
                             </div>
                        )}

                        <button
                            onClick={startResetFlow}
                            className="w-full py-3 px-4 bg-red-900/20 border border-red-500/30 text-red-500 rounded-lg font-bold hover:bg-red-900/40 transition-colors"
                        >
                            Reset Account
                        </button>
                        <p className="text-[10px] text-gray-500">
                            Version 0.3
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
    );
};
