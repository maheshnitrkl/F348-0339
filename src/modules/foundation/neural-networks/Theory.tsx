import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Layers, Dumbbell, LayoutGrid, Network } from 'lucide-react';

// ── Section Imports ─────────────────────────────────────────────────────────
import { Perceptron } from './sections/01_Perceptron';
import { Activation } from './sections/02_Activation';
import { Architecture } from './sections/03_Architecture';
import { Training } from './sections/04_Training';
import { ArchitectureZoo } from './sections/05_ArchitectureZoo';
import { TransferLearning } from './sections/06_TransferLearning';
import { StateOfTheArt } from './sections/07_StateOfTheArt';
import { ObjectDetection } from './sections/08_ObjectDetection';
import { Segmentation } from './sections/09_Segmentation';
import { Repeat, Rocket, Target, Map } from 'lucide-react';

// ── Section Config ───────────────────────────────────────────────────────────
const SECTIONS = [
    {
        id: 'perceptron',
        title: 'The Perceptron',
        subtitle: 'Biological Inspiration',
        icon: Brain,
        color: '#8b5cf6',
        component: Perceptron,
        tracks: ['01 Biological Inspiration', '02 The Math', '03 XOR Problem'],
    },
    {
        id: 'activation',
        title: 'Activation Functions',
        subtitle: 'Non-Linearity',
        icon: Zap,
        color: '#22d3ee',
        component: Activation,
        tracks: ['04 Why Non-Linearity', '05 8 Functions', '06 Vanishing Gradients'],
    },
    {
        id: 'architecture',
        title: 'Architecture (MLP)',
        subtitle: 'Structure & Flow',
        icon: Layers,
        color: '#818cf8',
        component: Architecture,
        tracks: ['07 MLP Anatomy', '08 Forward Pass', '09 Universal Approx.'],
    },
    {
        id: 'training',
        title: 'Training & Loss',
        subtitle: 'Optimization',
        icon: Dumbbell,
        color: '#fb923c',
        component: Training,
        tracks: ['10 Training Loop', '11 Loss Functions', '12 Learning Rate'],
    },
    {
        id: 'zoo',
        title: 'Architecture Zoo',
        subtitle: 'CNN, RNN, Transformer…',
        icon: LayoutGrid,
        color: '#f59e0b',
        component: ArchitectureZoo,
        tracks: ['13 6 Architectures', 'Timeline', "What's Next"],
    },
    {
        id: 'object-detection',
        title: 'Object Detection',
        subtitle: 'Bounding Boxes & YOLO',
        icon: Target,
        color: '#10b981',
        component: ObjectDetection,
        tracks: ['14 R-CNN', '15 YOLO Grid', '16 Anchors & NMS'],
    },
    {
        id: 'segmentation',
        title: 'Image Segmentation',
        subtitle: 'Pixel-Perfect Masks & U-Net',
        icon: Map,
        color: '#3b82f6',
        component: Segmentation,
        tracks: ['17 Semantic', '18 Instance', '19 U-Net'],
    },
    {
        id: 'transfer-learning',
        title: 'Transfer Learning',
        subtitle: 'Feature Extraction & Fine-Tuning',
        icon: Repeat,
        color: '#ec4899', // pink-500
        component: TransferLearning,
        tracks: ['14 Why Transfer?', '15 The Architect', '16 Paradigms'],
    },
    {
        id: 'state-of-the-art',
        title: 'State of the Art',
        subtitle: '3D Viz, Transformers, & LLMs',
        icon: Rocket,
        color: '#f43f5e', // rose-500
        component: StateOfTheArt,
        tracks: ['17 3D Neural Nets', '18 Attention', '19 Modern Optimizers'],
    },
];

// ── Component ────────────────────────────────────────────────────────────────
export const Theory: React.FC = () => {
    const [activeSection, setActiveSection] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const ActiveComponent = SECTIONS[activeSection].component;
    const currentSection = SECTIONS[activeSection];

    // Scroll to top when switching sections
    useEffect(() => {
        if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeSection]);

    return (
        <div className="h-full flex bg-gray-950 text-slate-300 overflow-hidden">

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <div className={`flex-shrink-0 border-r border-white/10 bg-gray-900/50 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-14' : 'w-72'}`}>

                {/* Module Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    {!sidebarCollapsed && (
                        <div>
                            <div className="flex items-center gap-2 text-violet-400 mb-1">
                                <Network size={16} />
                                <span className="font-mono text-xs tracking-widest uppercase">Foundation</span>
                            </div>
                            <h1 className="text-lg font-bold text-white leading-tight">Neural Networks</h1>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors flex-shrink-0"
                    >
                        {sidebarCollapsed ? '›' : '‹'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {SECTIONS.map((section, idx) => {
                        const Icon = section.icon;
                        const isActive = activeSection === idx;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(idx)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left ${isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                style={isActive ? { backgroundColor: section.color + '20', border: `1px solid ${section.color}40` } : { border: '1px solid transparent' }}
                                title={sidebarCollapsed ? section.title : undefined}
                            >
                                <Icon size={18} style={{ color: isActive ? section.color : undefined, flexShrink: 0 }} />
                                {!sidebarCollapsed && (
                                    <div className="min-w-0">
                                        <div className="font-semibold truncate">{section.title}</div>
                                        <div className="text-xs text-slate-600 truncate">{section.subtitle}</div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sub-tracks (only when sidebar open) */}
                {!sidebarCollapsed && (
                    <div className="p-4 border-t border-white/5">
                        <p className="text-xs text-slate-600 uppercase tracking-widest mb-2">In this section</p>
                        <div className="space-y-1">
                            {currentSection.tracks.map((track, i) => (
                                <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                                    {track}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {!sidebarCollapsed && (
                    <div className="px-4 pb-4">
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{activeSection + 1}/{SECTIONS.length}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${((activeSection + 1) / SECTIONS.length) * 100}%`, backgroundColor: currentSection.color }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Main Content ─────────────────────────────────────────── */}
            <div ref={contentRef} className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
                {/* Section Header Banner */}
                <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-white/5 px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentSection.color }} />
                        <span className="text-sm font-semibold text-white">{currentSection.title}</span>
                        <span className="text-xs text-slate-600">—</span>
                        <span className="text-xs text-slate-500">{currentSection.subtitle}</span>
                    </div>

                    {/* Prev/Next nav */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                            disabled={activeSection === 0}
                            className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Prev
                        </button>
                        {SECTIONS.map((s, i) => (
                            <button key={i} onClick={() => setActiveSection(i)}
                                className="w-2 h-2 rounded-full transition-all"
                                style={{ backgroundColor: i === activeSection ? s.color : '#334155' }}
                            />
                        ))}
                        <button
                            onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                            disabled={activeSection === SECTIONS.length - 1}
                            className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {/* Module Main Header (first view) */}
                {activeSection === 0 && (
                    <div className="px-8 pt-10 pb-0">
                        <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono tracking-widest uppercase mb-4">
                            Foundation Module
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-400 mb-4">
                            Neural Networks
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-8">
                            From a single artificial neuron to the architectures that power modern AI.
                            Build deep understanding through interactive visualizations and real mathematics.
                        </p>
                        {/* Track overview pills */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {SECTIONS.map((s, i) => (
                                <button key={i} onClick={() => setActiveSection(i)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
                                    style={{ borderColor: s.color + '40', backgroundColor: s.color + '10', color: s.color }}>
                                    <s.icon size={12} />
                                    {s.title}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-white/5 mb-8" />
                    </div>
                )}

                {/* Content Area */}
                <div className="px-8 py-8 max-w-7xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <ActiveComponent />
                        </motion.div>
                    </AnimatePresence>

                    {/* Bottom Nav */}
                    <div className="flex justify-between items-center mt-16 pt-8 border-t border-white/5">
                        <button
                            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                            disabled={activeSection === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ← {activeSection > 0 ? SECTIONS[activeSection - 1].title : 'Start'}
                        </button>
                        <span className="text-xs text-slate-600">{activeSection + 1} / {SECTIONS.length}</span>
                        <button
                            onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                            disabled={activeSection === SECTIONS.length - 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            style={activeSection < SECTIONS.length - 1 ? {
                                backgroundColor: SECTIONS[activeSection + 1].color + '20',
                                border: `1px solid ${SECTIONS[activeSection + 1].color}40`,
                                color: SECTIONS[activeSection + 1].color,
                            } : { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#64748b' }}
                        >
                            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].title : 'Complete'} →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
