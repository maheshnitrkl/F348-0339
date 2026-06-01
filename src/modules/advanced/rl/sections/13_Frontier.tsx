import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket,
    Activity,
    Sliders,
    Sparkles,
    Terminal,
    Info,
    AlertTriangle,
    Zap,
    CheckCircle,
    ChevronRight,
    HelpCircle,
    Play,
    RotateCcw,
    Award,
    Compass
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const KeyInsight: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = '#38bdf8' }) => (
    <div className="flex gap-3 p-4 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '30' }}>
        <Sparkles size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <div>
            <span className="text-sm font-semibold block mb-1" style={{ color }}>{title}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
        </div>
    </div>
);

const AlgorithmBox: React.FC<{ title: string; steps: string[]; color?: string }> = ({ title, steps, color = '#38bdf8' }) => (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: color + '40' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: color + '15' }}>
            <Terminal size={14} style={{ color }} />
            <span className="text-sm font-mono font-bold" style={{ color }}>{title}</span>
        </div>
        <div className="bg-slate-950/60 p-4 space-y-1.5">
            {steps.map((step, i) => (
                <div key={i} className="text-sm font-mono text-slate-300 flex gap-2">
                    <span className="text-slate-600 select-none w-5 text-right flex-shrink-0">{i + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: step }} />
                </div>
            ))}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: GRPO Advantage Explorer
   ═══════════════════════════════════════════════════════════════════════ */

interface CandidateOutput {
    id: number;
    text: string;
    correct: boolean;
    format: boolean; // Correct <think> tags
    length: number;
}

export const GRPOExplorer: React.FC = () => {
    // Sliders
    const [wCorrect, setWCorrect] = useState<number>(1.0);
    const [wFormat, setWFormat] = useState<number>(0.5);
    const [wLength, setWLength] = useState<number>(0.2); // penalty

    // G=4 Candidates for prompt: "Prime numbers between 1 and 10"
    const candidates: CandidateOutput[] = [
        {
            id: 1,
            text: "<think>Primes between 1 and 10 are 2, 3, 5, 7. Sum = 17.</think> The sum is 17.",
            correct: true,
            format: true,
            length: 80
        },
        {
            id: 2,
            text: "<think>Primes: 1, 2, 3, 5, 7. Sum = 18.</think> The sum is 18.",
            correct: false, // 1 is not prime
            format: true,
            length: 60
        },
        {
            id: 3,
            text: "Primes are 2, 3, 5, 7. Sum is 17.",
            correct: true,
            format: false, // missing <think> tags
            length: 34
        },
        {
            id: 4,
            text: "<think>Let me count primes from 1 to 10. 1: no. 2: yes. 3: yes. 4: no. 5: yes. 6: no. 7: yes. 8: no. 9: no. 10: no. The primes are 2, 3, 5, and 7. The sum is 2+3+5+7 = 17.</think> Therefore, the sum is 17.",
            correct: true,
            format: true,
            length: 200 // verbose
        }
    ];

    // Compute raw rewards
    const computedRewards = candidates.map(c => {
        const cReward = c.correct ? wCorrect : 0;
        const fReward = c.format ? wFormat : 0;
        const lPenalty = wLength * (c.length / 100);
        const total = cReward + fReward - lPenalty;
        return {
            ...c,
            cReward,
            fReward,
            lPenalty,
            total
        };
    });

    // Compute stats
    const meanReward = computedRewards.reduce((sum, item) => sum + item.total, 0) / computedRewards.length;
    const variance = computedRewards.reduce((sum, item) => sum + Math.pow(item.total - meanReward, 2), 0) / computedRewards.length;
    const stdDev = Math.sqrt(variance) || 0.001; // prevent div by zero

    // Compute advantages
    const computedAdvantages = computedRewards.map(item => {
        const advantage = (item.total - meanReward) / stdDev;
        return {
            ...item,
            advantage
        };
    });

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sliders size={18} className="text-sky-400" />
                        GRPO Group Advantage & Policy Update Explorer
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Adjust reward weights. Notice how GRPO standardizes rewards within the group of size <MathEquation formula="G=4" /> to compute advantages, removing the need for an active critic.
                    </p>
                </div>
            </div>

            {/* Sliders Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Correctness Weight (<MathEquation formula="W_c" />)</span>
                        <span className="font-mono text-sky-400 font-bold">{wCorrect.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.0} max={2.0} step={0.1} value={wCorrect}
                        onChange={e => setWCorrect(parseFloat(e.target.value))}
                        className="w-full accent-sky-400" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Formatting Weight (<MathEquation formula="W_f" />)</span>
                        <span className="font-mono text-sky-400 font-bold">{wFormat.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.0} max={1.5} step={0.1} value={wFormat}
                        onChange={e => setWFormat(parseFloat(e.target.value))}
                        className="w-full accent-sky-400" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Length Penalty Weight (<MathEquation formula="W_l" />)</span>
                        <span className="font-mono text-sky-400 font-bold">{wLength.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.0} max={1.0} step={0.05} value={wLength}
                        onChange={e => setWLength(parseFloat(e.target.value))}
                        className="w-full accent-sky-400" />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Group Size (<MathEquation formula="G" />)</span>
                    <span className="text-lg font-mono font-bold text-white">4</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Group Mean Reward (<MathEquation formula="\mu" />)</span>
                    <span className="text-lg font-mono font-bold text-sky-400">{meanReward.toFixed(3)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/50 col-span-2 md:col-span-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Group Reward Std Dev (<MathEquation formula="\sigma" />)</span>
                    <span className="text-lg font-mono font-bold text-purple-400">{stdDev.toFixed(3)}</span>
                </div>
            </div>

            {/* Candidates Lists */}
            <div className="space-y-4">
                {computedAdvantages.map((c) => {
                    const isPositive = c.advantage >= 0;
                    return (
                        <div key={c.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            
                            {/* Candidate Output Details */}
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                        Candidate {c.id}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${c.correct ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                                        {c.correct ? "Correct Answer" : "Incorrect Answer"}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${c.format ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                                        {c.format ? "Formatted" : "No <think> tag"}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        Length: {c.length} chars
                                    </span>
                                </div>
                                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono text-xs text-white break-words">
                                    {c.text}
                                </div>
                            </div>

                            {/* Reward Calculation */}
                            <div className="lg:w-44 xl:w-52 space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between border-b border-slate-900 pb-1">
                                    <span className="text-slate-500">Correctness:</span>
                                    <span className="text-emerald-400">+{c.cReward.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1">
                                    <span className="text-slate-500">Format:</span>
                                    <span className="text-indigo-400">+{c.fReward.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-900 pb-1">
                                    <span className="text-slate-500">Length Pen:</span>
                                    <span className="text-red-400">-{c.lPenalty.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold border-b border-slate-800 pb-1 pt-0.5">
                                    <span className="text-slate-300">Raw Reward:</span>
                                    <span className="text-white">{c.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Standardized Advantage & Gradient Update */}
                            <div className="w-full lg:w-44 flex flex-col items-center lg:items-end justify-center p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 gap-1.5 self-stretch">
                                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Advantage (<MathEquation formula="A_i" />)</span>
                                <span className={`text-xl font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isPositive ? "+" : ""}{c.advantage.toFixed(3)}
                                </span>

                                <div className={`w-full text-center py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {isPositive ? "▲ Reinforce Policy" : "▼ Suppress Policy"}
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Reasoning Self-Correction Graph Visualizer
   ═══════════════════════════════════════════════════════════════════════ */

interface ReasoningNode {
    id: string;
    title: string;
    type: 'start' | 'thought' | 'correction' | 'success' | 'error' | 'backtrack';
    desc: string;
    details?: string;
}

export const SelfCorrectionVisualizer: React.FC = () => {
    const [step, setStep] = useState<number>(0);

    const nodes: ReasoningNode[] = [
        {
            id: 'n1',
            title: 'Start Node',
            type: 'start',
            desc: 'Analyze puzzle conditions: A > B, B < C. Question: Is A > C?',
            details: 'Inputs parsed. Initiating reasoning path search.'
        },
        {
            id: 'n2',
            title: 'Hypothesis A > C',
            type: 'thought',
            desc: 'Assume A > C. Formulate linear sequence chain: A > C > B.',
            details: 'Checking constraint B < C... Holds correctly. But is this the unique solution?'
        },
        {
            id: 'n3',
            title: 'OOD Validation Check',
            type: 'thought',
            desc: 'Verify alternate sequence combinations. Try C > A > B.',
            details: 'Both A > C > B and C > A > B satisfy conditions A > B and B < C!'
        },
        {
            id: 'n4',
            title: 'Error Detection & Trigger',
            type: 'correction',
            desc: 'Aha! Error detected: A > C is NOT the only valid arrangement.',
            details: 'Model senses logical gap: "Wait, both sequences work. I cannot assert A > C is uniquely true."'
        },
        {
            id: 'n5',
            title: 'Backtracking Logic',
            type: 'backtrack',
            desc: 'Rollback assumption. Reset relationship between A and C.',
            details: 'Discarding the incorrect path. Moving focus back to variables A & C relation.'
        },
        {
            id: 'n6',
            title: 'Formulate Correct Inference',
            type: 'success',
            desc: 'Logical proof: With no relative boundary between A and C, output is undefined.',
            details: 'Correct Answer: Not enough information. Path verified.'
        }
    ];

    const getBorderColor = (type: string, active: boolean) => {
        if (!active) return 'border-slate-800 opacity-40';
        switch (type) {
            case 'start': return 'border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]';
            case 'thought': return 'border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.2)]';
            case 'correction': return 'border-amber-400 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
            case 'backtrack': return 'border-red-400 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            case 'success': return 'border-emerald-400 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.25)]';
            default: return 'border-slate-800';
        }
    };

    const getIcon = (type: string, active: boolean) => {
        const opacityClass = active ? 'opacity-100' : 'opacity-30';
        switch (type) {
            case 'start': return <Terminal className={`text-sky-400 ${opacityClass}`} size={16} />;
            case 'thought': return <Activity className={`text-indigo-400 ${opacityClass}`} size={16} />;
            case 'correction': return <Zap className={`text-amber-400 ${opacityClass}`} size={16} />;
            case 'backtrack': return <RotateCcw className={`text-red-400 ${opacityClass}`} size={16} />;
            case 'success': return <CheckCircle className={`text-emerald-400 ${opacityClass}`} size={16} />;
            default: return <HelpCircle className={`text-slate-500 ${opacityClass}`} size={16} />;
        }
    };

    return (
        <Card className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Award size={18} className="text-sky-400" />
                        LLM Reasoning & Self-Correction Path Graph
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Step through the model's reasoning sequence tree to see how validation reinforcement shapes back-tracking and correction.
                    </p>
                </div>
                
                {/* Control buttons */}
                <div className="flex items-center gap-2">
                    <button onClick={() => setStep(prev => Math.min(nodes.length - 1, prev + 1))}
                        disabled={step === nodes.length - 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 disabled:opacity-40 transition-colors">
                        <Play size={12} /> Next Step
                    </button>
                    <button onClick={() => setStep(0)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Tree Map Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                
                {nodes.map((node, index) => {
                    const isActive = index <= step;
                    const isCurrent = index === step;
                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0.3, y: 10 }}
                            animate={{ opacity: isActive ? 1.0 : 0.3, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-xl border bg-slate-950/40 relative flex flex-col justify-between min-h-[135px] transition-all duration-300 ${getBorderColor(node.type, isActive)}`}
                        >
                            {/* Connector badge */}
                            {isCurrent && (
                                <span className="absolute -top-2.5 right-3 bg-sky-400 text-slate-950 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                                    Current
                                </span>
                            )}

                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    {getIcon(node.type, isActive)}
                                    <span className={`text-xs font-bold font-mono uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                        {node.title}
                                    </span>
                                </div>
                                <p className={`text-xs font-mono leading-relaxed ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {node.desc}
                                </p>
                            </div>

                            {/* Node status subtext */}
                            <div className="mt-3 border-t border-slate-900 pt-2 text-[10px] text-slate-500 font-mono italic">
                                {isActive ? node.details : "Pending evaluation..."}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Live Console Output */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block">
                    Reasoning Engine Console Log
                </span>
                <div className="font-mono text-xs text-slate-300 space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
                    {nodes.slice(0, step + 1).map((node, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="text-slate-600 font-bold select-none">[node {i + 1}]</span>
                            <span className={node.type === 'backtrack' ? 'text-red-400' : (node.type === 'correction' ? 'text-amber-400' : (node.type === 'success' ? 'text-emerald-400' : 'text-slate-300'))}>
                                {node.type === 'backtrack' ? "↳ [BACKTRACKING]" : (node.type === 'correction' ? "⚡ [CRITICAL CORRECTING]" : "✔")} {node.desc}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: Frontier Component
   ═══════════════════════════════════════════════════════════════════════ */

export const Frontier: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-sky-400 mb-4">
                    <Rocket size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 13</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-sky-500 mb-4">
                    SOTA & Frontier Topics (2025)
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Explore the leading edge of reinforcement learning development. Deep dive into critic-less 
                    preference fine-tuning using Group Relative Policy Optimization (GRPO), LLM reasoning paths 
                    with self-correction loops, and video-based World Foundation Models.
                </p>
            </motion.div>

            {/* ─── 13.1 GROUP RELATIVE POLICY OPTIMIZATION ────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<Zap size={20} className="text-sky-400" />}>
                    13.1 — Group Relative Policy Optimization (GRPO)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        In classic PPO, we instantiate a **Critic Network** (parameterized by value function weights <MathEquation formula="\psi" />) alongside the **Actor Network** (parameterized by <MathEquation formula="\theta" />) to compute the advantage baseline. However, for massive Large Language Models, hosting a secondary critic model of equal size in GPU memory is extremely expensive. 
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        **Group Relative Policy Optimization (GRPO)** (Shao et al., 2024), popularized by DeepSeek-R1, eliminates the critic model. Instead, it generates a group of outputs <MathEquation formula="\{y_1, y_2, \dots, y_G\}" /> from the actor policy <MathEquation formula="\pi_\theta" /> for a given prompt <MathEquation formula="x" />. The advantage of each output is computed directly by normalizing rewards relative to other outputs in the same group:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">GRPO Group Advantage Derivation</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Given a group of size <MathEquation formula="G" /> with individual rewards <MathEquation formula="r_i" />, the relative advantage <MathEquation formula="A_i" /> is defined as:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-center">
                                <MathEquation formula="A_i = \frac{r_i - \text{mean}(r_1, \dots, r_G)}{\text{std}(r_1, \dots, r_G) + \epsilon}" block />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                This mathematically isolates the relative quality. If a reasoning trajectory performs better than the average generated by the model itself, its likelihood is reinforced; if it performs worse, its likelihood is suppressed.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The GRPO Objective Function</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                The optimization goal updates policy weights by maximizing:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                                <MathEquation formula="\mathcal{L}_{\mathrm{GRPO}}(\theta) = \frac{1}{G}\sum_{i=1}^G \left[ \min\left( \frac{\pi_\theta(y_i|x)}{\pi_{\mathrm{old}}(y_i|x)} A_i, \text{clip}\left(\frac{\pi_\theta(y_i|x)}{\pi_{\mathrm{old}}(y_i|x)}, 1-\epsilon, 1+\epsilon\right) A_i \right) - \beta D_{\mathrm{KL}}(\pi_\theta \parallel \pi_{\mathrm{ref}}) \right]" block />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Unlike PPO, this avoids active value approximation updates, resulting in approximately <MathEquation formula="33\% - 50\%" /> GPU memory reductions and higher training throughput.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── GRPO ADVANTAGE EXPLORER ────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Sliders size={20} className="text-sky-400" />}>
                    13.2 — GRPO Group Standardization Sandbox
                </SectionTitle>
                <GRPOExplorer />
            </motion.section>

            {/* ─── 13.2 LLM REASONING & SELF-CORRECTION ───────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-sky-400" />}>
                    13.3 — LLM Reasoning & The Emergence of Self-Correction
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Reinforcement learning applied to reasoning (rationalization) has enabled a new class of models that learn to allocate "test-time compute" before finalizing outputs. By reinforcing tokens enclosed in {"<think>...</think>"} tags and linking them with rule-based correctness rewards (e.g. compilers, test checkers), agents learn complex strategies.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Rule-Based Reward Shaping</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Because model correctness is binary (the math equation is either solved correctly or not), rewards are shaped by external execution outcomes rather than subjective reward neural networks. This makes reward hacking extremely difficult.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Thinking Rationales</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                By allowing agents to output arbitrary-length rationales, the model learns complex structural paths, demonstrating self-explanation, proof checking, and edge-case testing within the text stream.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Emergent Self-Correction</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                During extended RL training, models spontaneously develop backtracking behaviors. If an agent senses a contradiction or mathematical mismatch, it outputs phrases like "Wait, let me double check..." and branches to correct the mistake.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── SELF-CORRECTION VISUALIZER ─────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Terminal size={20} className="text-sky-400" />}>
                    13.4 — Self-Correction Graph Visualizer
                </SectionTitle>
                <SelfCorrectionVisualizer />
            </motion.section>

            {/* ─── 13.3 WORLD FOUNDATION MODELS ────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Compass size={20} className="text-sky-400" />}>
                    13.5 — World Foundation Models & Visual Environments
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Transition dynamics functions have traditionally been the hardest components to construct in model-based RL. Recently, video-based **World Foundation Models** (like Sora, Genie) have emerged as generative physical simulators.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                            <span className="text-sm font-bold text-white block">Generative Physics Simulators</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Rather than building custom 3D engines, these models represent physical motion, material collisions, and action outcomes by training diffusion networks over huge visual libraries. They serve as rich simulators where physical actions can be projected and evaluated.
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                            <span className="text-sm font-bold text-white block">Action-Conditioned Generation</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Models like Genie allow continuous key/mouse inputs to drive frame-by-frame updates. Robotics agents leverage these latent dynamics to play out trajectories in "generative imagination" before executing physical tasks in the real world.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── SOTA & FRONTIER ALGORITHM COMPARISON ───────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Activity size={20} className="text-sky-400" />}>
                    13.6 — Comparison of Paradigm Objectives
                </SectionTitle>

                <Card className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-800/80 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 px-4">Paradigm</th>
                                <th className="pb-3 px-4">Objective Core</th>
                                <th className="pb-3 px-4">Critic Model Required</th>
                                <th className="pb-3 px-4">Primary Feedback Signal</th>
                                <th className="pb-3 px-4">Main Application Area</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-sm">
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">Classic RL (PPO)</td>
                                <td className="py-4 px-4 text-slate-400">Policy ratio advantage optimization</td>
                                <td className="py-4 px-4 text-emerald-400 font-semibold">Yes</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Scalar value critic state approximations</td>
                                <td className="py-4 px-4 text-slate-400">Atari, Robotics, Continuous Control</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">Direct Alignment (DPO)</td>
                                <td className="py-4 px-4 text-slate-400">Pairwise cross-entropy on SFT ratios</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">No</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Frozen SFT model reference probability comparisons</td>
                                <td className="py-4 px-4 text-slate-400">Standard chatbot alignment</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">Reasoning RL (GRPO)</td>
                                <td className="py-4 px-4 text-slate-400">Group-relative advantage optimization</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">No</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Rule-based compilers & group standardized rewards</td>
                                <td className="py-4 px-4 text-slate-400">Mathematical proving, coding logic rationalization</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
            </motion.section>

        </div>
    );
};
