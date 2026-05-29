/* eslint-disable */
import React, { useState } from 'react';
import type { ConceptModule } from '../../../types/module';
import { CalculusProbabilityTheory } from './Theory';
import { CalculusProbabilityPython } from './Python';
import { GradientDescentVisualization } from './Visualization';
import { DistributionExplorer } from './components/DistributionExplorer';

// Main component with tab navigation
const CalculusProbabilityContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'theory' | 'gradient' | 'distributions' | 'code'>('theory');

    const tabs = [
        { id: 'theory' as const, label: 'Theory', icon: '📚' },
        { id: 'gradient' as const, label: 'Gradient Descent', icon: '⬇️' },
        { id: 'distributions' as const, label: 'Distributions', icon: '📊' },
        { id: 'code' as const, label: 'Python', icon: '💻' },
    ];

    return (
        <div className="min-h-screen">
            {/* Tab Navigation */}
            <div className="sticky top-0 z-40 border-b border-white/10 bg-[var(--color-deep-space)]/95 backdrop-blur-sm">
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
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-electric-cyan)]" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-full mx-auto px-8 py-12">
                {activeTab === 'theory' && <CalculusProbabilityTheory />}
                {activeTab === 'gradient' && <GradientDescentVisualization />}
                {activeTab === 'distributions' && <DistributionExplorer />}
                {activeTab === 'code' && <CalculusProbabilityPython />}
            </div>
        </div>
    );
};

export const CalculusProbabilityModule: ConceptModule = {
    id: 'math-2', // Matches roadmap ID for Calculus & Probability
    title: 'Calculus & Probability',
    description: 'Derivatives, optimization, distributions & information theory for ML.',
    components: {
        Theory: CalculusProbabilityContent,
        Code: CalculusProbabilityPython,
    },
};
