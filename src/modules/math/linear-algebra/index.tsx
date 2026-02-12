import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConceptModule } from '../../../types/module';
import { LinearAlgebraTheory } from './Theory';
import { LinearAlgebraPython } from './Python';
import { VectorSpacePlayground } from './components/VectorSpacePlayground';
import { MatrixTransformVisualizer } from './components/MatrixTransformVisualizer';

// Main component with tab navigation
const LinearAlgebraContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'theory' | 'playground' | 'transform' | 'code'>('theory');

    const tabs = [
        { id: 'theory' as const, label: 'Theory', icon: '📚' },
        { id: 'playground' as const, label: 'Vector Playground', icon: '📐' },
        { id: 'transform' as const, label: 'Matrix Transform', icon: '🔄' },
        { id: 'code' as const, label: 'Python', icon: '💻' },
    ];

    return (
        <div className="min-h-screen">
            {/* Tab Navigation */}
            <div className="sticky top-[70px] z-40 border-b border-white/10 bg-[var(--color-deep-space)]/95 backdrop-blur-sm">
                <div className="max-w-full mx-auto px-8">
                    <nav className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-6 py-4 font-semibold transition-all ${activeTab === tab.id
                                    ? 'text-[var(--color-electric-cyan)]'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-electric-cyan)]"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-full mx-auto px-8 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'theory' && <LinearAlgebraTheory />}
                        {activeTab === 'playground' && <VectorSpacePlayground />}
                        {activeTab === 'transform' && <MatrixTransformVisualizer />}
                        {activeTab === 'code' && <LinearAlgebraPython />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export const LinearAlgebraModule: ConceptModule = {
    id: 'math-lin-alg',
    title: 'Linear Algebra',
    description: 'The Skeleton of Data - Matrix Decomposition and Eigenvalues',
    components: {
        Theory: LinearAlgebraContent,
        Code: LinearAlgebraPython,
    },
};
