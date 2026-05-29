/* eslint-disable */
import React, { useState } from 'react';
import type { ConceptModule } from '../../../types/module';
import { PhilosophyTheory } from './Theory';
import { PhilosophyPython } from './Python';
import { CognitiveArchitectureDashboard } from './components/CognitiveArchitectureDashboard';
import { ChineseRoomFlowchart } from './components/ChineseRoomFlowchart';
import { SymbolGroundingSandbox } from './components/SymbolGroundingSandbox';
import { EthicsPlayground } from './components/EthicsPlayground';
import { PhilosophyCodeBridge } from './components/PhilosophyCodeBridge';
import { Book, Code2, Cpu, Lightbulb, Scale, Brain, Code } from 'lucide-react';

// Main wrapper component that includes tabbed navigation
const PhilosophyMainView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('theory');

    const tabs = [
        { id: 'theory', label: 'Theory', icon: Book },
        { id: 'cognitive', label: 'Cognitive Architecture', icon: Brain },
        { id: 'chinese-room', label: 'Chinese Room', icon: Lightbulb },
        { id: 'symbol-grounding', label: 'Symbol Grounding', icon: Cpu },
        { id: 'ethics', label: 'Ethics Playground', icon: Scale },
        { id: 'bridge', label: 'Philosophy ↔ Code', icon: Code2 },
        { id: 'python', label: 'Python Examples', icon: Code },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'theory':
                return <PhilosophyTheory />;
            case 'cognitive':
                return <CognitiveArchitectureDashboard />;
            case 'chinese-room':
                return <ChineseRoomFlowchart />;
            case 'symbol-grounding':
                return <SymbolGroundingSandbox />;
            case 'ethics':
                return <EthicsPlayground />;
            case 'bridge':
                return <PhilosophyCodeBridge />;
            case 'python':
                return <PhilosophyPython />;
            default:
                return <PhilosophyTheory />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                                ? 'bg-[var(--color-electric-cyan)] text-black font-bold'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-screen">
                {renderContent()}
            </div>
        </div>
    );
};

export const PhilosophyModule: ConceptModule = {
    id: 'foundation-1',
    title: 'Philosophy of AI',
    description: 'Understanding intelligence, Turing Tests, and the history of thought.',
    components: {
        Theory: PhilosophyMainView,
        Code: PhilosophyPython,
    },
};
