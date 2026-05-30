import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    Database, 
    TrendingUp, 
    Cpu, 
    Compass, 
    Sliders, 
    Network, 
    Users, 
    HardDrive, 
    Heart, 
    Rocket,
    Network as NetworkIcon,
    GitCommit,
    Shield,
    Sparkles
} from 'lucide-react';

// Section Imports
import { Foundations } from './sections/01_Foundations';
import { DynamicProgramming } from './sections/02_DynamicProgramming';
import { ModelFree } from './sections/03_ModelFree';
import { FunctionApprox } from './sections/04_FunctionApprox';
import { DeepRL } from './sections/05_DeepRL';
import { PolicyGradient } from './sections/06_PolicyGradient';
import { AdvancedPolicy } from './sections/07_AdvancedPolicy';
import { ContinuousControl } from './sections/08_ContinuousControl';
import { ModelBased } from './sections/09_ModelBased';
import { MARL } from './sections/10_MARL';
import { OfflineRL } from './sections/11_OfflineRL';

// Placeholders for sections 2 to 13 to be populated sequentially
const PlaceholderFactory = (title: string, chapter: number) => {
    return () => (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 space-y-4">
            <h3 className="text-2xl font-bold text-white">Chapter {chapter}: {title}</h3>
            <div className="flex items-center gap-3 text-amber-400 bg-amber-500/10 border border-amber-500/25 px-4 py-3 rounded-xl text-sm">
                <InfoIcon size={20} className="flex-shrink-0" />
                <span>This chapter is in the queue for sequential writing. The foundational scaffolding and registry are fully operational.</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
                We are implementing the RL modules sequentially. Once Chapter 1 is fully approved and validated, we will begin writing the mathematical derivations, interactive widgets, algorithms, and benchmark codes for this chapter.
            </p>
        </div>
    );
};

const InfoIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SECTIONS = [
    {
        id: 'foundations',
        title: 'Foundations of RL',
        subtitle: 'MDPs & Bellman Equations',
        icon: Brain,
        color: '#8b5cf6', // violet-500
        component: Foundations,
        tracks: ['01 Agent-Env Loop', '02 MDP Formalism', '03 Bellman Derivation'],
    },
    {
        id: 'dp',
        title: 'Dynamic Programming',
        subtitle: 'Policy & Value Iteration',
        icon: Database,
        color: '#3b82f6', // blue-500
        component: DynamicProgramming,
        tracks: ['04 Policy Iteration', '05 Value Iteration', '06 GPI Framework'],
    },
    {
        id: 'model-free',
        title: 'Model-Free Control',
        subtitle: 'Q-Learning & SARSA',
        icon: TrendingUp,
        color: '#10b981', // emerald-500
        component: ModelFree,
        tracks: ['07 MC Methods', '08 TD(0) & TD(λ)', '09 Q-Learning & SARSA'],
    },
    {
        id: 'function-approx',
        title: 'Function Approximation',
        subtitle: 'Scaling up Tabular RL',
        icon: Sliders,
        color: '#ec4899', // pink-500
        component: FunctionApprox,
        tracks: ['10 Linear FA', '11 Semi-Gradient TD', '12 The Deadly Triad'],
    },
    {
        id: 'deep-rl',
        title: 'Deep Reinforcement Learning',
        subtitle: 'DQN & Improvements',
        icon: Cpu,
        color: '#f59e0b', // amber-500
        component: DeepRL,
        tracks: ['13 Deep Q-Networks', '14 Rainbow DQN', '15 Double & Dueling'],
    },
    {
        id: 'policy-gradient',
        title: 'Policy Gradient Methods',
        subtitle: 'REINFORCE & Actor-Critic',
        icon: GitCommit,
        color: '#ef4444', // red-500
        component: PolicyGradient,
        tracks: ['16 Policy Theorem', '17 Baselines & GAE', '18 Actor-Critic (A2C)'],
    },
    {
        id: 'advanced-policy',
        title: 'Advanced Policy Opt.',
        subtitle: 'TRPO & PPO',
        icon: Shield,
        color: '#14b8a6', // teal-500
        component: AdvancedPolicy,
        tracks: ['19 Trust Regions', '20 PPO-Clip Objective', '21 Natural Gradients'],
    },
    {
        id: 'continuous-spaces',
        title: 'Continuous Control',
        subtitle: 'DDPG, TD3, & SAC',
        icon: Sliders,
        color: '#06b6d4', // cyan-500
        component: ContinuousControl,
        tracks: ['22 DPG Theorem', '23 Twin Critic (TD3)', '24 Soft Actor-Critic'],
    },
    {
        id: 'model-based',
        title: 'Model-Based RL',
        subtitle: 'Dyna, World Models & MCTS',
        icon: Compass,
        color: '#a855f7', // purple-500
        component: ModelBased,
        tracks: ['25 Dyna-Q Architecture', '26 Dreamer & Latent', '27 MCTS & MuZero'],
    },
    {
        id: 'marl',
        title: 'Multi-Agent RL',
        subtitle: 'Cooperative & Competitive',
        icon: Users,
        color: '#f43f5e', // rose-500
        component: MARL,
        tracks: ['28 Stochastic Games', '29 QMIX Monotonicity', '30 MADDPGcentralized'],
    },
    {
        id: 'offline-rl',
        title: 'Offline & Batch RL',
        subtitle: 'CQL & Decision Transformer',
        icon: HardDrive,
        color: '#6366f1', // indigo-500
        component: OfflineRL,
        tracks: ['31 Extrapolation Error', '32 Conservative Q', '33 Sequence Models'],
    },
    {
        id: 'rlhf-alignment',
        title: 'RLHF & Alignment',
        subtitle: 'Reward Models, PPO, & DPO',
        icon: Heart,
        color: '#ec4899', // pink-500
        component: PlaceholderFactory('RL from Human Feedback (RLHF) & Alignment', 12),
        tracks: ['34 Preference Loss', '35 Reward Hacking', '36 Direct Opt. (DPO)'],
    },
    {
        id: 'sota-frontier',
        title: 'SOTA & Frontier (2025)',
        subtitle: 'DeepSeek-R1, GRPO & Robotics',
        icon: Rocket,
        color: '#38bdf8', // sky-400
        component: PlaceholderFactory('State-of-the-Art & Frontier Topics (2024–2025)', 13),
        tracks: ['37 GRPO & Reasoning', '38 World Found. Models', '39 Scientific RL'],
    },
];

export const RLTheory: React.FC = () => {
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
                                <NetworkIcon size={16} />
                                <span className="font-mono text-xs tracking-widest uppercase">Advanced Track</span>
                            </div>
                            <h1 className="text-lg font-bold text-white leading-tight">Reinforcement Learning</h1>
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
                            <span>Chapters</span>
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
                            Reinforcement Learning
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-400 mb-4">
                            Decision Making under Uncertainty
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-8">
                            Master the mechanics of agents learning from environmental rewards: from tabular MDP dynamic programming to deep continuous policy gradients and frontier human-aligned systems.
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
