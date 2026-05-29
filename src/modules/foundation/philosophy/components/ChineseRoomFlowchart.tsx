/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ArrowRight, Eye, EyeOff, CheckCircle, MessageSquare } from 'lucide-react';
import { chineseRoomRules, type ChineseRoomRule } from '../data/chineseRoomRules';

type FlowStep = 'input' | 'lookup' | 'output' | 'reflection';

export const ChineseRoomFlowchart: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<FlowStep>('input');
    const [currentRuleIndex, setCurrentRuleIndex] = useState<number>(
        Math.floor(Math.random() * chineseRoomRules.length)
    );
    const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | null>(null);
    const [showMeaning, setShowMeaning] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<ChineseRoomRule[]>([]);

    const currentRule = chineseRoomRules[currentRuleIndex];

    const startNewConversation = () => {
        const newIndex = Math.floor(Math.random() * chineseRoomRules.length);
        setCurrentRuleIndex(newIndex);
        setCurrentStep('input');
        setSelectedRuleIndex(null);
        setShowMeaning(false);
    };

    const handlePatternSelect = (index: number) => {
        setSelectedRuleIndex(index);
    };

    const submitResponse = () => {
        if (selectedRuleIndex === currentRuleIndex) {
            setConversationHistory(prev => [...prev, currentRule]);
            setCurrentStep('output');
        }
    };

    const moveToReflection = () => {
        setCurrentStep('reflection');
        setShowMeaning(true);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-3">🏮 The Chinese Room Experiment</h2>
                <p className="text-gray-400">
                    Step into John Searle's thought experiment. You'll successfully communicate in Chinese—
                    without understanding a single word.
                </p>
            </div>

            {/* Flow Progress Indicator */}
            <div className="flex items-center justify-between gap-4">
                {[
                    { id: 'input', label: 'Input', icon: MessageSquare },
                    { id: 'lookup', label: 'Rule Book', icon: Book },
                    { id: 'output', label: 'Output', icon: ArrowRight },
                    { id: 'reflection', label: 'Reflection', icon: Eye },
                ].map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = ['input', 'lookup', 'output', 'reflection'].indexOf(currentStep) > idx;

                    return (
                        <React.Fragment key={step.id}>
                            <div className={`flex items-center gap-2 ${isActive ? 'text-[var(--color-electric-cyan)]' : isCompleted ? 'text-green-400' : 'text-gray-600'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-[var(--color-electric-cyan)] bg-[var(--color-electric-cyan)]/20' :
                                    isCompleted ? 'border-green-400 bg-green-400/20' :
                                        'border-gray-600 bg-black/40'
                                    }`}>
                                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className="text-sm font-medium hidden md:inline">{step.label}</span>
                            </div>
                            {idx < 3 && (
                                <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-green-400' : 'bg-gray-700'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {/* Step 1: Input */}
                {currentStep === 'input' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-red-900/20 to-yellow-900/20 border border-red-500/30 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-4">📨 New Message Received</h3>
                            <p className="text-gray-300 mb-6">
                                You're in a room with no windows. A slip of paper slides under the door with these characters:
                            </p>

                            {/* Chinese Input Display */}
                            <div className="bg-black/60 rounded-xl p-8 mb-6">
                                <div className="text-center">
                                    <div className="text-6xl font-serif text-white mb-4">
                                        {currentRule.input}
                                    </div>
                                    <p className="text-gray-500 text-sm italic">
                                        (You have no idea what this means)
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep('lookup')}
                                className="w-full py-3 px-6 bg-[var(--color-electric-cyan)] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                            >
                                Consult the Rule Book →
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Lookup */}
                {currentStep === 'lookup' && (
                    <motion.div
                        key="lookup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-4">📖 The Rule Book</h3>
                            <p className="text-gray-300 mb-6">
                                Match the pattern you received with one of these rules:
                            </p>

                            <div className="grid gap-3 mb-6">
                                {chineseRoomRules.map((rule, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handlePatternSelect(idx)}
                                        className={`text-left p-4 rounded-lg border-2 transition-all ${selectedRuleIndex === idx
                                            ? 'bg-[var(--color-electric-cyan)]/20 border-[var(--color-electric-cyan)]'
                                            : 'bg-black/40 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-300 text-sm">{rule.pattern}</p>
                                                <p className="text-gray-500 text-xs mt-1">→ Output: {rule.output}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={submitResponse}
                                disabled={selectedRuleIndex === null}
                                className={`w-full py-3 px-6 font-bold rounded-lg transition-all ${selectedRuleIndex !== null
                                    ? 'bg-[var(--color-electric-cyan)] text-black hover:brightness-110'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {selectedRuleIndex !== null ? 'Send Response →' : 'Select a pattern first'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Output */}
                {currentStep === 'output' && (
                    <motion.div
                        key="output"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-4">✅ Response Sent</h3>
                            <p className="text-gray-300 mb-6">
                                Following the rule book, you write down these characters and slide them back under the door:
                            </p>

                            <div className="bg-black/60 rounded-xl p-8 mb-6">
                                <div className="text-center">
                                    <div className="text-5xl font-serif text-white mb-4">
                                        {currentRule.output}
                                    </div>
                                    <p className="text-gray-500 text-sm italic">
                                        (You still have no idea what any of this means)
                                    </p>
                                </div>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                                <p className="text-green-200 text-sm">
                                    🎉 <strong>Success!</strong> From outside the room, it appears you can speak Chinese fluently.
                                </p>
                            </div>

                            <button
                                onClick={moveToReflection}
                                className="w-full py-3 px-6 bg-[var(--color-electric-cyan)] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                            >
                                Continue to Reflection →
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Reflection */}
                {currentStep === 'reflection' && (
                    <motion.div
                        key="reflection"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-4">🤔 The Philosophical Question</h3>

                            <div className="bg-black/60 rounded-xl p-6 mb-6">
                                <p className="text-xl text-white mb-4 font-semibold">
                                    Do you understand Chinese?
                                </p>
                                <p className="text-gray-300 mb-4">
                                    You successfully communicated, responding appropriately to the input. From an external
                                    observer's perspective, you appear to understand Chinese perfectly.
                                </p>
                                <p className="text-red-400 font-bold text-lg">
                                    But you don't understand a single word.
                                </p>
                            </div>

                            {/* Reveal Meaning */}
                            <button
                                onClick={() => setShowMeaning(!showMeaning)}
                                className="w-full mb-4 py-3 px-6 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                {showMeaning ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                {showMeaning ? 'Hide' : 'Reveal'} What You Actually Communicated
                            </button>

                            {showMeaning && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6"
                                >
                                    <p className="text-yellow-200 mb-2">
                                        <strong>The actual conversation:</strong>
                                    </p>
                                    <p className="text-white text-lg">
                                        {currentRule.meaning}
                                    </p>
                                </motion.div>
                            )}

                            {/* Searle's Argument */}
                            <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-500/30 rounded-xl p-6">
                                <h4 className="text-lg font-bold text-white mb-3">💡 Searle's Argument</h4>
                                <div className="space-y-3 text-gray-300 text-sm">
                                    <p>
                                        <strong>1. Syntax ≠ Semantics:</strong> You manipulated symbols (syntax) perfectly,
                                        but understood nothing (no semantics).
                                    </p>
                                    <p>
                                        <strong>2. This is What Computers Do:</strong> Modern AI systems, including large
                                        language models, manipulate patterns in data. They might pass the Turing Test,
                                        but do they truly "understand"?
                                    </p>
                                    <p>
                                        <strong>3. The Implication:</strong> If strong AI is true, understanding should
                                        emerge from symbol manipulation. But this exercise suggests understanding requires
                                        something more—perhaps grounding in the real world.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={startNewConversation}
                                    className="flex-1 py-3 px-6 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
                                >
                                    Try Another Conversation
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-white mb-3">
                        📜 Conversations You've Had ({conversationHistory.length})
                    </h4>
                    <div className="space-y-2">
                        {conversationHistory.map((conv, idx) => (
                            <div key={idx} className="text-sm text-gray-400 flex gap-2">
                                <span className="text-gray-600">#{idx + 1}:</span>
                                <span>{conv.input} → {conv.output}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
