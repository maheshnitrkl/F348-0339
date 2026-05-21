import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Layers, Network } from 'lucide-react';

// Import Sections
import { Simple } from './sections/Simple';
import { Perceptron } from './sections/01_Perceptron';
import { Activation } from './sections/02_Activation';
import { Architecture } from './sections/03_Architecture';

export const Theory: React.FC = () => {
    const [activeSection, setActiveSection] = useState(0);

    const sections = [
        // { id: 0, title: "Simple Debug", icon: Brain, component: Simple },
        { id: 0, title: "The Perceptron", icon: Brain, component: Perceptron },
        { id: 1, title: "Activation Functions", icon: Zap, component: Activation },
        { id: 2, title: "Architecture (MLP)", icon: Layers, component: Architecture },
    ];

    const ActiveComponent = sections[activeSection].component;

    return (
        <div className="h-full flex bg-gray-950 text-slate-300 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-72 border-r border-white/10 bg-gray-900/50 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 text-violet-400 mb-2">
                        <Network size={20} />
                        <span className="font-mono text-xs tracking-widest uppercase">Overview</span>
                    </div>
                    <h1 className="text-xl font-bold text-white">Neural Networks</h1>
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
