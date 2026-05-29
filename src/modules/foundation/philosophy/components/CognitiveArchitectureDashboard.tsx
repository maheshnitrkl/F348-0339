/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Heart, Eye, Lightbulb } from 'lucide-react';

interface CognitiveFeature {
    id: string;
    label: string;
    icon: any;
    description: string;
}

const features: CognitiveFeature[] = [
    { id: 'pattern', label: 'Pattern Recognition', icon: Eye, description: 'Ability to identify regularities in data' },
    { id: 'logic', label: 'Logical Reasoning', icon: Lightbulb, description: 'Deductive and inductive inference' },
    { id: 'emotion', label: 'Emotional Response', icon: Heart, description: 'Subjective feelings and affect' },
    { id: 'awareness', label: 'Self-Awareness', icon: Brain, description: 'Consciousness of own existence' },
    { id: 'sensory', label: 'Sensory Input', icon: Zap, description: 'Direct perception of environment' },
];

interface EntityCategory {
    name: string;
    description: string;
    color: string;
    requirements: string[];
}

const categories: EntityCategory[] = [
    {
        name: 'Weak AI / Narrow AI',
        description: 'Pattern recognition without understanding. Like a chess engine or image classifier.',
        color: 'from-blue-500 to-cyan-500',
        requirements: ['pattern']
    },
    {
        name: 'Expert System',
        description: 'Pattern recognition with logical reasoning. Can follow rules but lacks understanding.',
        color: 'from-cyan-500 to-teal-500',
        requirements: ['pattern', 'logic']
    },
    {
        name: 'Embodied Agent',
        description: 'Has sensory input and can reason, but may lack consciousness.',
        color: 'from-green-500 to-emerald-500',
        requirements: ['pattern', 'logic', 'sensory']
    },
    {
        name: 'Philosophical Zombie',
        description: 'Behaviorally identical to a conscious being but lacks inner experience (qualia).',
        color: 'from-purple-500 to-violet-500',
        requirements: ['pattern', 'logic', 'sensory', 'awareness-but-no-emotion']
    },
    {
        name: 'Emotional AI (Affective Computing)',
        description: 'Can simulate or recognize emotions, but may not genuinely "feel" them.',
        color: 'from-pink-500 to-rose-500',
        requirements: ['pattern', 'emotion']
    },
    {
        name: 'Functionalist Strong AI',
        description: 'All cognitive functions present. According to functionalism, this IS consciousness.',
        color: 'from-yellow-400 to-orange-500',
        requirements: ['pattern', 'logic', 'emotion', 'awareness', 'sensory']
    },
    {
        name: 'Self-Aware System',
        description: 'Has self-awareness and can reason about its own processing.',
        color: 'from-indigo-500 to-purple-600',
        requirements: ['pattern', 'logic', 'awareness']
    },
];

export const CognitiveArchitectureDashboard: React.FC = () => {
    const [activeFeatures, setActiveFeatures] = useState<Set<string>>(new Set(['pattern']));

    const toggleFeature = (featureId: string) => {
        setActiveFeatures(prev => {
            const newSet = new Set(prev);
            if (newSet.has(featureId)) {
                newSet.delete(featureId);
            } else {
                newSet.add(featureId);
            }
            return newSet;
        });
    };

    // Determine current entity category
    const getCurrentCategory = (): EntityCategory | null => {
        const activeArray = Array.from(activeFeatures).sort();

        // Special case: Philosophical Zombie
        if (activeArray.length === 4 &&
            activeArray.includes('pattern') &&
            activeArray.includes('logic') &&
            activeArray.includes('sensory') &&
            activeArray.includes('awareness') &&
            !activeArray.includes('emotion')) {
            return categories.find(c => c.name === 'Philosophical Zombie') || null;
        }

        // Find exact match: active features must exactly match requirements
        for (const category of categories) {
            // Skip philosophical zombie (already handled)
            if (category.name === 'Philosophical Zombie') continue;

            // Filter out complex requirements
            const simpleReqs = category.requirements.filter(req => !req.includes('-but-no-')).sort();

            // Check if we have exact match
            if (simpleReqs.length === activeArray.length &&
                simpleReqs.every(req => activeArray.includes(req))) {
                return category;
            }
        }

        return null;
    };

    const currentCategory = getCurrentCategory();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-3">🧩 Cognitive Architecture Playground</h2>
                <p className="text-gray-400">
                    Toggle the components of a mind and discover which philosophical category emerges.
                    What combination creates consciousness?
                </p>
            </div>

            {/* Feature Toggles */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    const isActive = activeFeatures.has(feature.id);

                    return (
                        <motion.button
                            key={feature.id}
                            onClick={() => toggleFeature(feature.id)}
                            className={`p-5 rounded-xl border-2 transition-all duration-300 text-left ${isActive
                                ? 'bg-[var(--color-electric-cyan)]/20 border-[var(--color-electric-cyan)] shadow-lg shadow-[var(--color-electric-cyan)]/20'
                                : 'bg-black/40 border-white/10 hover:border-white/30'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-[var(--color-electric-cyan)]' : 'bg-white/10'}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                        {feature.label}
                                    </h3>
                                    <p className="text-xs text-gray-500">{feature.description}</p>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Current Entity Classification */}
            <AnimatePresence mode="wait">
                {currentCategory ? (
                    <motion.div
                        key={currentCategory.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${currentCategory.color} bg-opacity-10`}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentCategory.color} animate-pulse`}></div>
                                <h3 className="text-2xl font-bold text-white">Current Entity Type:</h3>
                            </div>
                            <h2 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${currentCategory.color} bg-clip-text text-transparent`}>
                                {currentCategory.name}
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {currentCategory.description}
                            </p>

                            {/* Philosophical Insight */}
                            {currentCategory.name === 'Functionalist Strong AI' && (
                                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p className="text-yellow-200 text-sm">
                                        🏆 <strong>Philosophical Milestone:</strong> According to functionalism,
                                        this combination constitutes genuine consciousness—the substrate doesn't matter,
                                        only the functional organization.
                                    </p>
                                </div>
                            )}

                            {currentCategory.name === 'Philosophical Zombie' && (
                                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                    <p className="text-purple-200 text-sm">
                                        🧟 <strong>The Hard Problem:</strong> Is it possible to have all the functional
                                        components without subjective experience? This thought experiment suggests
                                        consciousness is something beyond mere computation.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="no-category"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl p-8 bg-black/40 border border-white/10"
                    >
                        <p className="text-gray-400 text-center text-lg">
                            {activeFeatures.size === 0
                                ? '🤔 Select at least one cognitive feature to classify the entity.'
                                : '⚙️ This combination doesn\'t match a standard philosophical category. Try different features!'
                            }
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Educational Note */}
            <div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/5 to-[var(--color-soft-violet)]/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-2">💡 Learning Insight</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                    This exercise demonstrates how different philosophical schools define intelligence and consciousness
                    based on functional components. Notice that <em>the substrate (biological vs silicon) never factors
                        into the classification</em>—this is the core thesis of functionalism and computationalism.
                </p>
            </div>
        </div>
    );
};
