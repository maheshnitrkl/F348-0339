import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScatterChart, Brain, GitGraph, Database, Network } from 'lucide-react';

// Import Sections
import { Foundations } from './sections/01_Foundations';
import { Regularization } from './sections/02_Regularization';
import { TreeMethods } from './sections/03_TreeMethods';
import { Classification } from './sections/03_Classification';
import { Unsupervised } from './sections/05_Unsupervised';

export const Theory: React.FC = () => {
    const [activeSection, setActiveSection] = useState(0);

    const sections = [
        { id: 0, title: "Foundations", icon: Brain, component: Foundations },
        { id: 1, title: "Linear Models", icon: GitGraph, component: Regularization }, // Alias for now
        { id: 2, title: "Tree Methods", icon: Network, component: TreeMethods },
        { id: 3, title: "Classification", icon: TargetIcon, component: Classification },
        { id: 4, title: "Unsupervised", icon: Database, component: Unsupervised },
    ];

    const ActiveComponent = sections[activeSection].component;

    return (
        <div className="h-full flex bg-gray-950 text-slate-300 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-72 border-r border-white/10 bg-gray-900/50 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 text-violet-400 mb-2">
                        <ScatterChart size={20} />
                        <span className="font-mono text-xs tracking-widest uppercase">Overview</span>
                    </div>
                    <h1 className="text-xl font-bold text-white">Statistical Learning</h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {sections.map((section, idx) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(idx)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === idx
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <section.icon size={18} />
                            {section.title}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/10">
                    <p className="text-xs text-slate-500">
                        Based on "The Elements of Statistical Learning" (Hastie et al.)
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="w-full max-w-none px-12 py-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ActiveComponent />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Helper Icon for Classification (Local fallback if icon import fails or to keep generic)
function TargetIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}
