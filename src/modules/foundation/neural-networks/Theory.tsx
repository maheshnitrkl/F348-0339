import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    Zap, 
    Layers, 
    Dumbbell, 
    LayoutGrid, 
    Network,
    Repeat,
    Rocket,
    Target,
    Sliders,
    Shield,
    Grid,
    Cpu,
    Sparkles,
    Wand2,
    GitFork
} from 'lucide-react';

// ── Section Imports ─────────────────────────────────────────────────────────
import { Perceptron } from './sections/01_Perceptron';
import { MLP } from './sections/02_MLP';
import { Activation } from './sections/03_Activation';
import { LossFunctions } from './sections/04_LossFunctions';
import { Backpropagation } from './sections/05_Backpropagation';
import { Optimization } from './sections/06_Optimization';
import { Initialization } from './sections/07_Initialization';
import { Regularization } from './sections/08_Regularization';
import { CNN } from './sections/09_CNN';
import { RNNSeq } from './sections/10_RNNSeq';
import { Transformer } from './sections/11_Transformer';

// ── Placeholder Factory for sequential development ──────────────────────────
const PlaceholderFactory = (title: string, chapter: number) => {
    return () => (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 space-y-4">
            <h3 className="text-2xl font-bold text-white">Chapter {chapter}: {title}</h3>
            <div className="flex items-center gap-3 text-sky-400 bg-sky-500/10 border border-sky-500/25 px-4 py-3 rounded-xl text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This chapter is scheduled for sequential development in the Neural Networks roadmap.</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans">
                We are implementing the Neural Networks module chapters sequentially. This section will soon be populated with mathematical derivations, interactive widgets, hand-worked numerical steps, and PyTorch implementations.
            </p>
        </div>
    );
};

// ── Section Config ───────────────────────────────────────────────────────────
const SECTIONS = [
    {
        id: 'perceptron',
        title: 'Biological Inspiration & The Perceptron',
        subtitle: 'Biological Inspiration & Rosenblatt Perceptron',
        icon: Brain,
        color: '#8b5cf6', // violet-500
        component: Perceptron,
        tracks: ['01 Biological Neuron', '02 McCulloch-Pitts', '03 Perceptron Convergence'],
    },
    {
        id: 'ffn-mlp',
        title: 'Feedforward Neural Networks (MLPs)',
        subtitle: 'Multi-Layer Perceptron Architecture',
        icon: Layers,
        color: '#3b82f6', // blue-500
        component: MLP,
        tracks: ['04 MLP Architecture', '05 Universal Approximation', '06 Depth vs. Width'],
    },
    {
        id: 'activation',
        title: 'Activation Functions',
        subtitle: 'Sigmoid, ReLU, GELU, SwiGLU',
        icon: Zap,
        color: '#22d3ee', // cyan-400
        component: Activation,
        tracks: ['07 Why Non-Linearity', '08 Standard Activations', '09 Modern Gated Activations'],
    },
    {
        id: 'loss-functions',
        title: 'Loss Functions',
        subtitle: 'Regression, Classification & InfoNCE',
        icon: Target,
        color: '#f43f5e', // rose-500
        component: LossFunctions,
        tracks: ['10 Risk Minimization', '11 Triplet & Focal Loss', '12 Contrastive Losses'],
    },
    {
        id: 'backpropagation',
        title: 'Backpropagation & Autodiff',
        subtitle: 'Vector Chain Rule & Reverse-Mode',
        icon: Network,
        color: '#ec4899', // pink-500
        component: Backpropagation,
        tracks: ['13 Vector Chain Rule', '14 Backprop Derivation', '15 Vanishing Gradients'],
    },
    {
        id: 'optimization',
        title: 'Optimization Algorithms',
        subtitle: 'AdamW, Lion, & Curvature Optimizers',
        icon: Dumbbell,
        color: '#fb923c', // orange-400
        component: Optimization,
        tracks: ['16 SGD & Momentum', '17 Adaptive Optimizers', '18 LR Schedules'],
    },
    {
        id: 'initialization',
        title: 'Weight Initialization',
        subtitle: 'Xavier, Kaiming, & Maximal Parameterization',
        icon: Sliders,
        color: '#a855f7', // purple-500
        component: Initialization,
        tracks: ['19 Symmetry Breaking', '20 Glorot & He Derivations', '21 Maximal Update (uP)'],
    },
    {
        id: 'regularization',
        title: 'Regularization Techniques',
        subtitle: 'L1/L2, Dropout, BatchNorm, RMSNorm',
        icon: Shield,
        color: '#10b981', // emerald-500
        component: Regularization,
        tracks: ['22 Bias-Variance Decomposition', '23 Regularizers & Dropout', '24 Normalization Layers'],
    },
    {
        id: 'cnn',
        title: 'Convolutional Neural Networks',
        subtitle: 'Translation Invariance & Spatial Grids',
        icon: Grid,
        color: '#06b6d4', // cyan-500
        component: CNN,
        tracks: ['25 Convolution Operator', '26 Classic Architectures', '27 Residual Connections'],
    },
    {
        id: 'rnn-seq',
        title: 'Recurrent Networks & Sequences',
        subtitle: 'Vanilla RNN, LSTM, GRU & Attention',
        icon: Repeat,
        color: '#6366f1', // indigo-500
        component: RNNSeq,
        tracks: ['28 BPTT & Gradients', '29 Gated Units (LSTM/GRU)', '30 Classic Attention'],
    },
    {
        id: 'transformer',
        title: 'The Transformer Architecture',
        subtitle: 'Scaled Dot-Product & Positional Encoding',
        icon: Cpu,
        color: '#845ef7', // deep purple
        component: Transformer,
        tracks: ['31 Self-Attention Core', '32 Positional Gating (RoPE/ALiBi)', '33 Pre-LN Blocks'],
    },
    {
        id: 'llm-scaling',
        title: 'Large Language Models',
        subtitle: 'Scaling Laws, MoE, LoRA & Quantization',
        icon: Sparkles,
        color: '#38bdf8', // sky-400
        component: PlaceholderFactory('Large Language Models & Scaling', 12),
        tracks: ['34 Chinchilla Scaling', '35 Mixture of Experts', '36 PEFT (LoRA/QLoRA)'],
    },
    {
        id: 'vision-architectures',
        title: 'Computer Vision Architectures',
        subtitle: 'Vision Transformers, Swin, CLIP & SAM',
        icon: LayoutGrid,
        color: '#a78bfa', // soft violet
        component: PlaceholderFactory('Computer Vision Architectures', 13),
        tracks: ['37 Vision Transformer (ViT)', '38 Contrastive Pretraining (CLIP)', '39 Segment Anything'],
    },
    {
        id: 'generative',
        title: 'Generative Models',
        subtitle: 'VAEs, GANs, Diffusion & Flow Matching',
        icon: Wand2,
        color: '#f472b6', // pink-400
        component: PlaceholderFactory('Generative Models', 14),
        tracks: ['40 VAEs & Minimax GANs', '41 Denoising Diffusion (DDPM)', '42 Continuous Flow Matching'],
    },
    {
        id: 'gnn',
        title: 'Graph Neural Networks',
        subtitle: 'Spectral GCN, GraphSAGE, GAT & GIN',
        icon: GitFork,
        color: '#20c997', // teal-400
        component: PlaceholderFactory('Graph Neural Networks (GNNs)', 15),
        tracks: ['43 Message Passing Framework', '44 GCN & GAT Layers', '45 Over-smoothing Limits'],
    },
    {
        id: 'sota-frontier',
        title: 'SOTA & Frontier (2024–2025)',
        subtitle: 'KAN, Mamba Selective SSM & Reasoning',
        icon: Rocket,
        color: '#e64980', // deep pink
        component: PlaceholderFactory('State-of-the-Art & Frontier Topics (2024–2025)', 16),
        tracks: ['46 Kolmogorov-Arnold KAN', '47 Selective Scan Mamba', '48 Reasoning Compute Scaling'],
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
                <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                    {SECTIONS.map((section, idx) => {
                        const Icon = section.icon;
                        const isActive = activeSection === idx;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(idx)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
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
                                className="w-1.5 h-1.5 rounded-full transition-all"
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
