/* eslint-disable */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Armchair, Table2, Minimize2, ArrowRight } from 'lucide-react';
import {
    furnitureEmbeddings,
    findClosestConcept,
    getSimilarityScores,
    type FurnitureEmbedding
} from '../data/furnitureEmbeddings';

const furnitureIcons: Record<string, any> = {
    chair: Armchair,
    stool: Armchair,
    bench: Minimize2,
    table: Table2,
    desk: Table2,
};

export const SymbolGroundingSandbox: React.FC = () => {
    const [selectedConcept, setSelectedConcept] = useState<FurnitureEmbedding>(furnitureEmbeddings[0]);
    const [customVector, setCustomVector] = useState<number[]>(furnitureEmbeddings[0].vector);

    const handleVectorChange = (index: number, value: number) => {
        const newVector = [...customVector];
        newVector[index] = value;
        setCustomVector(newVector);
    };

    const resetToSelected = () => {
        setCustomVector([...selectedConcept.vector]);
    };

    const closestConcept = findClosestConcept(customVector);
    const similarityScores = getSimilarityScores(customVector);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-3">🔬 Symbol Grounding Sandbox</h2>
                <p className="text-gray-400">
                    Explore how AI maps physical concepts to mathematical vectors. Adjust the numbers and watch
                    the meaning morph.
                </p>
            </div>

            {/* Concept Selector */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Choose a Starting Concept</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {furnitureEmbeddings.map((concept) => {
                        const Icon = furnitureIcons[concept.id] || Armchair;
                        return (
                            <button
                                key={concept.id}
                                onClick={() => {
                                    setSelectedConcept(concept);
                                    setCustomVector([...concept.vector]);
                                }}
                                className={`p-4 rounded-xl border-2 transition-all ${selectedConcept.id === concept.id
                                    ? 'bg-[var(--color-electric-cyan)]/20 border-[var(--color-electric-cyan)]'
                                    : 'bg-black/40 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <Icon className="w-8 h-8 mx-auto mb-2 text-white" />
                                <p className="text-sm font-medium text-white">{concept.name}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Vector Space Visualization */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Vector Controls */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                            2. Adjust Vector Dimensions
                        </h3>
                        <button
                            onClick={resetToSelected}
                            className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 transition-all"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="space-y-3">
                        {customVector.map((value, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400 font-mono">dim[{idx}]</span>
                                    <span className="text-[var(--color-electric-cyan)] font-mono">
                                        {value.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.01"
                                    value={value}
                                    onChange={(e) => handleVectorChange(idx, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-200 text-xs">
                            💡 <strong>What you're doing:</strong> Adjusting coordinates in an abstract
                            8-dimensional mathematical space where AI represents concepts.
                        </p>
                    </div>
                </div>

                {/* Right: Current Concept & Similarity */}
                <div className="space-y-4">
                    {/* Morphing Concept Display */}
                    <motion.div
                        key={closestConcept.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-8"
                    >
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Closest Concept:</h3>
                        <div className="flex items-center gap-4 mb-4">
                            {React.createElement(furnitureIcons[closestConcept.id] || Armchair, {
                                className: "w-16 h-16 text-white"
                            })}
                            <div>
                                <h2 className="text-4xl font-bold text-white">{closestConcept.name}</h2>
                                <p className="text-gray-300 text-sm">{closestConcept.description}</p>
                            </div>
                        </div>

                        {closestConcept.id !== selectedConcept.id && (
                            <div className="flex items-center gap-2 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <ArrowRight className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-200">
                                    You morphed <strong>{selectedConcept.name}</strong> into <strong>{closestConcept.name}</strong>!
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Similarity Scores */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Similarity to All Concepts</h3>
                        <div className="space-y-2">
                            {similarityScores.map((score) => (
                                <div key={score.concept}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-300">{score.concept}</span>
                                        <span className="text-[var(--color-electric-cyan)] font-mono">
                                            {(score.similarity * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[var(--color-electric-cyan)] to-[var(--color-soft-violet)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score.similarity * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Educational Explanation */}
            <div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/5 to-[var(--color-soft-violet)]/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-3">🎓 The Symbol Grounding Problem</h4>
                <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                    <p>
                        <strong>The Problem:</strong> How do symbols (like the word "chair") relate to actual physical objects?
                        For humans, "chair" connects to embodied experiences—sitting, physical sensation, visual recognition.
                    </p>
                    <p>
                        <strong>How AI "Understands":</strong> Machine learning maps concepts to points in high-dimensional
                        vector spaces. Similar concepts cluster together. The model learned that chairs and stools are
                        similar (both seats), but chairs and tables are less similar (different functions).
                    </p>
                    <p>
                        <strong>The Philosophical Question:</strong> Is this mathematical clustering genuine understanding,
                        or just sophisticated pattern matching? The AI has never sat in a chair—does it truly "know" what a chair is?
                    </p>
                    <p className="text-[var(--color-electric-cyan)] font-semibold">
                        This is why embodied cognition argues that intelligence requires a body interacting with the world—
                        pure symbol manipulation might be fundamentally limited.
                    </p>
                </div>
            </div>
        </div>
    );
};
