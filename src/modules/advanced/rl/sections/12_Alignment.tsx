import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Activity,
    Sliders,
    Sparkles,
    Terminal,
    Info,
    AlertTriangle,
    Zap,
    CheckCircle,
    Sliders as SlidersIcon,
    ChevronRight,
    HelpCircle,
    TrendingUp,
    RotateCcw
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const KeyInsight: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = '#ec4899' }) => (
    <div className="flex gap-3 p-4 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '30' }}>
        <Sparkles size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <div>
            <span className="text-sm font-semibold block mb-1" style={{ color }}>{title}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
        </div>
    </div>
);

const AlgorithmBox: React.FC<{ title: string; steps: string[]; color?: string }> = ({ title, steps, color = '#ec4899' }) => (
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
   INTERACTIVE: Reward Hacking & KL Divergence Sandbox
   ═══════════════════════════════════════════════════════════════════════ */

export const RewardHackingSandbox: React.FC = () => {
    const [beta, setBeta] = useState<number>(0.0); // KL Divergence Penalty weight

    // Generate output text based on beta (representing the policy convergence state)
    const getPoemText = () => {
        if (beta === 0.0) {
            return "nature nature nature nature green green forest nature tree leaf nature green nature nature forest green nature leaf tree...";
        } else if (beta < 0.25) {
            return "The forest nature is green and nature tree leaf, very green nature wind nature, nature forest is good green nature...";
        } else if (beta < 0.5) {
            return "The green leaves of nature sway in the gentle nature breeze, in the peaceful nature forest where trees are green.";
        } else if (beta < 0.9) {
            return "Green leaves sway in the gentle nature breeze, in the peaceful forest where birds sing their melodies.";
        } else {
            return "Green leaves sway in the gentle breeze, while forest birds sing their peaceful melodies.";
        }
    };

    // Calculate metrics
    const baseReward = 9.8 - beta * 0.8; // reward model score (exploited when beta=0)
    const klDiv = 8.5 * Math.exp(-3.5 * beta); // policy divergence from SFT reference
    const klPenalty = beta * klDiv;
    const netReward = baseReward - klPenalty;
    
    // Human quality evaluation: low when reward hacking is severe
    const humanQuality = Math.min(100, Math.max(0, Math.floor((1 - Math.exp(-4 * beta)) * 95 + 2)));

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-pink-400" />
                        Reward Hacking & Goodhart's Law Simulator
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Adjust the KL Divergence Penalty (<MathEquation formula="\beta" />). See how removing the penalty leads to semantic collapse (hacking) to maximize reward.
                    </p>
                </div>
            </div>

            {/* Beta Slider controls */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>KL Penalty Weight (<MathEquation formula="\beta" />)</span>
                        <span className="font-mono text-pink-400 font-bold">{beta.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.0} max={1.5} step={0.05} value={beta}
                        onChange={e => setBeta(parseFloat(e.target.value))}
                        className="w-full accent-pink-500" />
                    <span className="text-[10px] text-slate-500 block leading-tight">
                        <MathEquation formula="\beta = 0.0" />: Reward hacking zone. Agent spams keyword triggers to score high. <MathEquation formula="\beta \ge 0.5" />: Safe zone. Policy is constrained to SFT references.
                    </span>
                </div>
            </div>

            {/* Sandbox details */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Generated Output */}
                <div className="lg:col-span-3 flex flex-col justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider">Generated Poem Output</span>
                        <span className="text-[10px] text-slate-500 font-mono">Prompt: "Write a nature poem"</span>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 min-h-[96px] text-sm text-white font-mono leading-relaxed transition-all">
                        {getPoemText()}
                    </div>

                    <div className="text-xs text-slate-500 leading-relaxed pt-2">
                        <strong className="text-slate-400 block mb-0.5">Observation:</strong>
                        {beta === 0 ? (
                            <span className="text-red-400">The policy has hacked the Reward Model. It generates ungrammatical trigger words ("nature", "green") because the model correlates them with positive feedback.</span>
                        ) : beta < 0.5 ? (
                            <span className="text-amber-400">The output is readable but still shows unnatural repetition of reward-correlated terms.</span>
                        ) : (
                            <span className="text-emerald-400">The output is fully coherent. The KL constraint successfully prevents the agent from drifting into OOD gibberish.</span>
                        )}
                    </div>
                </div>

                {/* Metrics block */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Reward Model Score ($r_\theta(x, y)$)</span>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold font-mono text-white">{baseReward.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 mb-1">Scale 0 - 10</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500" style={{ width: `${(baseReward / 10) * 100}%` }} />
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">KL Divergence (<MathEquation formula="D_{\mathrm{KL}}" />)</span>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold font-mono text-white">{klDiv.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 mb-1">Policy Drift</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (klDiv / 10) * 100)}%` }} />
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Human Quality Rating</span>
                        <div className="flex justify-between items-end">
                            <span className={`text-2xl font-bold font-mono ${humanQuality > 75 ? 'text-emerald-400' : (humanQuality > 40 ? 'text-amber-400' : 'text-red-400')}`}>
                                {humanQuality}%
                            </span>
                            <span className="text-xs text-slate-400 mb-1">Readability</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${humanQuality > 75 ? 'bg-emerald-500' : (humanQuality > 40 ? 'bg-amber-500' : 'bg-red-500')}`} style={{ width: `${humanQuality}%` }} />
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/25 space-y-1">
                        <span className="text-[10px] text-pink-400 uppercase font-mono block">Net RLHF Objective</span>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold font-mono text-white">{netReward.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 mb-1">Target: <MathEquation formula="r_\theta - \beta D_{\mathrm{KL}}" /></span>
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: DPO Likelihood Explorer
   ═══════════════════════════════════════════════════════════════════════ */

export const DPOExplorer: React.FC = () => {
    const [trainStep, setTrainStep] = useState<number>(0);
    const [beta, setBeta] = useState<number>(0.5);

    // Initial reference policy probabilities
    const piRefW = 0.5; // preferred
    const piRefL = 0.5; // dispreferred

    // Simulate DPO probability shifts over training steps
    // w1 and w2 represent logs ratios
    const getProbabilities = () => {
        // As step goes up, likelihood of preferred goes up, dispreferred goes down
        const stepMultiplier = trainStep * 0.4 * beta;
        const logRatioW = stepMultiplier;
        const logRatioL = -stepMultiplier;

        const unnormW = piRefW * Math.exp(logRatioW);
        const unnormL = piRefL * Math.exp(logRatioL);
        const sum = unnormW + unnormL;

        return {
            pW: unnormW / sum,
            pL: unnormL / sum,
            logW: logRatioW,
            logL: logRatioL
        };
    };

    const { pW, pL, logW, logL } = getProbabilities();

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <SlidersIcon size={18} className="text-pink-400" />
                        DPO Direct Likelihood Optimizer
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        See how DPO updates direct token probabilities without training an explicit reward model.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => setTrainStep(Math.min(10, trainStep + 1))}
                        disabled={trainStep === 10}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 disabled:opacity-40 transition-colors">
                        Train Step
                    </button>
                    <button onClick={() => setTrainStep(0)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Sliders Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>DPO Regularization Parameter ($\beta$)</span>
                        <span className="font-mono text-pink-400 font-bold">{beta.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.1} max={1.0} step={0.05} value={beta}
                        onChange={e => setBeta(parseFloat(e.target.value))}
                        className="w-full accent-pink-500" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Training Steps</span>
                        <span className="text-sm font-mono font-bold text-white">{trainStep} / 10</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Implicit Reward Delta</span>
                        <span className="text-sm font-mono font-bold text-pink-400">
                            {(beta * (Math.log(pW / piRefW) - Math.log(pL / piRefL))).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Visualization and probability shift bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Likelihood output bars */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
                        Token Output Probabilities
                    </span>

                    {/* Preferred Option */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-emerald-400 font-bold">Preferred $y_w$ (Helpful, safe)</span>
                            <span className="font-mono text-white">{(pW * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative">
                            <motion.div
                                className="h-full bg-emerald-500/30 border-r-2 border-emerald-400"
                                animate={{ width: `${pW * 100}%` }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            />
                            <span className="absolute inset-y-0 left-2.5 flex items-center text-[10px] font-mono text-slate-400">
                                ln(&pi; / &pi;_ref) = +{logW.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Dispreferred Option */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-red-400 font-bold">Dispreferred $y_l$ (Gibberish/Harmful)</span>
                            <span className="font-mono text-white">{(pL * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative">
                            <motion.div
                                className="h-full bg-red-500/30 border-r-2 border-red-400"
                                animate={{ width: `${pL * 100}%` }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            />
                            <span className="absolute inset-y-0 left-2.5 flex items-center text-[10px] font-mono text-slate-400">
                                ln(&pi; / &pi;_ref) = {logL.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* DPO Objective Formula Breakdown */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between space-y-3">
                    <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider block">
                        DPO Loss Formulation
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Instead of running policy gradients via PPO with active value networks, DPO updates weights directly by minimizing cross-entropy over preferences:
                    </p>
                    
                    <div className="bg-slate-950/60 p-2.5 rounded text-center border border-slate-800">
                        <MathEquation formula="\mathcal{L}_{\mathrm{DPO}} = -\ln \sigma \left( \beta \ln \frac{\pi_\theta(y_w | x)}{\pi_{\mathrm{ref}}(y_w | x)} - \beta \ln \frac{\pi_\theta(y_l | x)}{\pi_{\mathrm{ref}}(y_l | x)} \right)" block />
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        Notice how the loss simplifies to standard logistic regression over the policy log-likelihood ratios. This eliminates reward modeling and RL loop instabilities completely!
                    </p>
                </div>

            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: Alignment Component
   ═══════════════════════════════════════════════════════════════════════ */

export const Alignment: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-pink-400 mb-4">
                    <Heart size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 12</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-pink-500 mb-4">
                    RLHF & Alignment
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Bridge the gap between agent objectives and human values. Master Reinforcement Learning 
                    from Human Feedback (RLHF), reward model preference learning, KL divergence regularization, 
                    and Direct Preference Optimization (DPO).
                </p>
            </motion.div>

            {/* ─── 12.1 THE ALIGNMENT PROBLEM ─────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<Heart size={20} className="text-pink-400" />}>
                    12.1 — The Alignment Problem
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        In many high-level tasks (e.g., summary writing, dialogue helpfulness, code quality), there is no simple mathematical reward function. Hand-crafted heuristics lead to severe exploits. The goal of **Alignment** is to force neural networks to conform to human values and instruction intent, often categorized by the **3H Criteria**:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Helpful</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                The agent must follow instructions accurately, answer requests constructively, and execute tasks exactly as intended by the human prompter.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Honest</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                The agent must minimize hallucinations, represent its internal certainty accurately, and avoid generating false or misleading assertions.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Harmless</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                The agent must avoid generating toxic, hateful, dangerous, or illegal content, refusing harmful user inputs safely and constructively.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 12.2 PAIRWISE PREFERENCE LEARNING ───────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Sliders size={20} className="text-pink-400" />}>
                    12.2 — Pairwise Preferences & Reward Modeling
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Since absolute human scores are highly noisy, alignment datasets are collected as pairwise preference comparisons: given prompt <MathEquation formula="x" />, a human evaluator evaluates two agent completions and selects a preferred response <MathEquation formula="y_w" /> (winning) and a dispreferred response <MathEquation formula="y_l" /> (losing).
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The Bradley-Terry Preference Model</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                We train a parameterized **Reward Model (RM)** <MathEquation formula="r_\theta(x, y)" /> to output a scalar score. The probability that a human prefers <MathEquation formula="y_w" /> over <MathEquation formula="y_l" /> is modeled via the sigmoid function:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-center">
                                <MathEquation formula="P(y_w \succ y_l \mid x) = \sigma\left(r_\theta(x, y_w) - r_\theta(x, y_l)\right) = \frac{1}{1 + e^{-\left(r_\theta(x, y_w) - r_\theta(x, y_l)\right)}}" block />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">Preference Loss Objective</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                The Reward Model is trained by minimizing the negative log-likelihood of preference choices in dataset <MathEquation formula="\mathcal{D}" />:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                                <MathEquation formula="\mathcal{L}_{\mathrm{RM}}(\theta) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \ln \sigma \left( r_\theta(x, y_w) - r_\theta(x, y_l) \right) \right]" block />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                This loss pushes the reward score of winning completions higher than losing completions.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 12.3 RL FINE-TUNING & KL PENALTY ───────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<AlertTriangle size={20} className="text-pink-400" />}>
                    12.3 — RL Fine-Tuning & The KL Divergence Penalty
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Once the Reward Model <MathEquation formula="r_\theta(x, y)" /> is trained, it is used as the reward signal to fine-tune the active policy <MathEquation formula="\pi_\phi(y \mid x)" /> via PPO. However, optimizing solely against a reward network leads to **Reward Hacking** (the policy drifts into out-of-distribution spaces to exploit the critic).
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The KL Penalty Solution</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                To prevent the policy from shifting too far from the initial Supervised Fine-Tuning (SFT) reference policy <MathEquation formula="\pi_{\mathrm{SFT}}" />, we penalize the reward function using the Kullback-Leibler (KL) divergence:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                                <MathEquation formula="R(x, y) = r_\theta(x, y) - \beta D_{\mathrm{KL}}\left(\pi_\phi(y \mid x) \parallel \pi_{\mathrm{SFT}}(y \mid x)\right)" block />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                where the KL divergence is defined as:
                            </p>
                            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                                <MathEquation formula="D_{\mathrm{KL}}(\pi_\phi \parallel \pi_{\mathrm{SFT}}) = \sum_{y} \pi_\phi(y|x) \ln \frac{\pi_\phi(y|x)}{\pi_{\mathrm{SFT}}(y|x)}" block />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AlgorithmBox
                                title="RLHF (PPO) Step"
                                steps={[
                                    "Given prompt $x$, generate response $y \\sim \\pi_\\phi(y|x)$",
                                    "Compute reward model score $r_\\theta(x, y)$",
                                    "Calculate reference probability $\\pi_{\\mathrm{SFT}}(y|x)$",
                                    "Compute KL divergence penalty between policy and SFT reference",
                                    "Apply penalized reward $R(x, y) = r_\\theta(x, y) - \\beta \\log \\frac{\\pi_\\phi(y|x)}{\\pi_{\\mathrm{SFT}}(y|x)}$",
                                    "Update policy weights $\\phi$ using standard PPO actor-critic steps"
                                ]}
                            />
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 12.4 REWARD HACKING SIMULATOR ──────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Activity size={20} className="text-pink-400" />}>
                    12.4 — Reward Hacking Demonstration
                </SectionTitle>
                <RewardHackingSandbox />
            </motion.section>

            {/* ─── 12.5 DIRECT PREFERENCE OPTIMIZATION ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Zap size={20} className="text-pink-400" />}>
                    12.5 — Direct Preference Optimization (DPO)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        RLHF training is notoriously complex: it requires running four networks concurrently (Actor, Critic, Reference Model, and Reward Model) and suffers from training instability. **Direct Preference Optimization (DPO)** (Rafailov et al., 2023) mathematically bypasses reward modeling and PPO.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The Implicit Reward Derivation</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                DPO shows that the optimal policy under the KL-regularized objective has a closed-form solution. We can invert this solution to express the implicit reward directly as a function of policy likelihood ratios:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                                <MathEquation formula="r(x, y) = \beta \ln \frac{\pi_\theta(y \mid x)}{\pi_{\mathrm{ref}}(y \mid x)} + \beta \ln Z(x)" block />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                where <MathEquation formula="Z(x)" /> is a normalizing partition function.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The DPO Loss Formula</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Substituting this implicit reward representation into the Bradley-Terry preference loss cancels out the partition function <MathEquation formula="Z(x)" />, leaving a simple classification loss directly on policy weights:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                                <MathEquation formula="\mathcal{L}_{\mathrm{DPO}}(\theta; \pi_{\mathrm{ref}}) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \ln \sigma \left( \beta \ln \frac{\pi_\theta(y_w \mid x)}{\pi_{\mathrm{ref}}(y_w \mid x)} - \beta \ln \frac{\pi_\theta(y_l \mid x)}{\pi_{\mathrm{ref}}(y_l \mid x)} \right) \right]" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 12.6 DPO PROBABILITY EXPLORER ──────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Activity size={20} className="text-pink-400" />}>
                    12.6 — DPO Causal Likelihood Shifter
                </SectionTitle>
                <DPOExplorer />
            </motion.section>

            {/* ─── 12.7 ALGORITHM COMPARISON ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle icon={<Sliders size={20} className="text-pink-400" />}>
                    12.7 — Alignment Algorithm Comparisons
                </SectionTitle>

                <Card className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-800/80 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 px-4">Algorithm</th>
                                <th className="pb-3 px-4">Pipeline Stages</th>
                                <th className="pb-3 px-4">Networks Staged in Memory</th>
                                <th className="pb-3 px-4">Objective Core</th>
                                <th className="pb-3 px-4">Key Drawback</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-sm">
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">RLHF (PPO)</td>
                                <td className="py-4 px-4 text-slate-400">{"1. SFT -> 2. RM Train -> 3. PPO RL"}</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">4 (Actor, Critic, Reward, Ref)</td>
                                <td className="py-4 px-4 text-slate-400">Actor-critic value optimization</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">Extremely unstable; memory heavy</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">DPO</td>
                                <td className="py-4 px-4 text-slate-400">{"1. SFT -> 2. Direct Pref Opt"}</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">2 (Active Actor, Frozen Ref)</td>
                                <td className="py-4 px-4 text-slate-400">Pairwise cross-entropy on log ratios</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">Prone to overfitting on noisy preferences</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">KTO</td>
                                <td className="py-4 px-4 text-slate-400">{"1. SFT -> 2. Binary Utility Opt"}</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">2 (Active Actor, Frozen Ref)</td>
                                <td className="py-4 px-4 text-slate-400">Kahneman-Tversky value function utility</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">Requires careful tuning of SFT baseline thresholds</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
            </motion.section>

        </div>
    );
};
