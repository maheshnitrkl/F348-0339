import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HardDrive,
    Activity,
    Play,
    Pause,
    RotateCcw,
    ArrowRight,
    Sparkles,
    Terminal,
    Info,
    AlertTriangle,
    Zap,
    CheckCircle,
    Sliders,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const KeyInsight: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = '#6366f1' }) => (
    <div className="flex gap-3 p-4 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '30' }}>
        <Sparkles size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <div>
            <span className="text-sm font-semibold block mb-1" style={{ color }}>{title}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
        </div>
    </div>
);

const AlgorithmBox: React.FC<{ title: string; steps: string[]; color?: string }> = ({ title, steps, color = '#6366f1' }) => (
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
   INTERACTIVE: CQL OOD Regularization Graph
   ═══════════════════════════════════════════════════════════════════════ */

export const CQLRegularizationGraph: React.FC = () => {
    const [alpha, setAlpha] = useState<number>(0.0); // CQL penalty
    const [coverageCenter, setCoverageCenter] = useState<number>(-1.5); // center of behavioral dataset

    const W = 500;
    const H = 220;
    const pad = { top: 20, right: 20, bottom: 35, left: 45 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Action coordinates from -3 to +3
    const aMin = -3, aMax = 3;
    const toX = (a: number) => pad.left + ((a - aMin) / (aMax - aMin)) * plotW;
    const toY = (q: number) => pad.top + plotH - ((q - (-4)) / (12 - (-4))) * plotH; // Q values range -4 to 12

    // True Q* function: a quadratic curve centered around +0.5
    const getTrueQ = (a: number) => {
        return -1.0 * Math.pow(a - 0.5, 2) + 9;
    };

    // Behavioral density function (Gaussian)
    const getBehavioralDensity = (a: number) => {
        const std = 0.7;
        const z = (a - coverageCenter) / std;
        return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
    };

    // Offline learned Q function: overestimates OOD actions, pulled down by alpha
    const getOfflineQ = (a: number) => {
        const trueQ = getTrueQ(a);
        const density = getBehavioralDensity(a);
        
        // Extrapolation error: high positive values where density is low and action is positive
        // Overestimation peak around action +1.5
        const isOOD = density < 0.15;
        const extrapolationBoost = isOOD ? Math.max(0, 5.0 * Math.exp(-0.5 * Math.pow(a - 1.5, 2) / 0.5)) : 0;
        
        // CQL penalty pulls values down proportionally to alpha and inversely to density
        const cqlPenalty = alpha * (1.5 / (density + 0.15));

        return trueQ + extrapolationBoost - cqlPenalty;
    };

    // SVG plotting paths
    const generatePath = (fn: (a: number) => number) => {
        const points: string[] = [];
        const resolution = 60;
        for (let i = 0; i <= resolution; i++) {
            const a = aMin + (i / resolution) * (aMax - aMin);
            const x = toX(a);
            const y = toY(fn(a));
            points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
        }
        return points.join(' ');
    };

    const behaviorPath = () => {
        const points: string[] = [];
        const resolution = 60;
        // Start bottom left of area
        points.push(`M ${toX(aMin)} ${toY(-4)}`);
        for (let i = 0; i <= resolution; i++) {
            const a = aMin + (i / resolution) * (aMax - aMin);
            // scale density to fit Q plot height
            const densityY = -4 + getBehavioralDensity(a) * 10;
            points.push(`L ${toX(a)} ${toY(densityY)}`);
        }
        // Close path to bottom right
        points.push(`L ${toX(aMax)} ${toY(-4)} Z`);
        return points.join(' ');
    };

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-indigo-400" />
                        CQL Value Clamping Visualizer
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Drag sliders to adjust behavior data coverage and CQL penalty. Watch values contract into conservative lower bounds.
                    </p>
                </div>
            </div>

            {/* Sliders Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>CQL Regularization Penalty ($\alpha$)</span>
                        <span className="font-mono text-indigo-400 font-bold">{alpha.toFixed(1)}</span>
                    </label>
                    <input type="range" min={0.0} max={2.0} step={0.1} value={alpha}
                        onChange={e => setAlpha(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500" />
                    <span className="text-[10px] text-slate-500 block leading-tight">
                        $\alpha = 0$: Standard Off-Policy backup (severe OOD overestimation). $\alpha \ge 1$: Conservative lower bound enforced.
                    </span>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Behavioral Dataset Support Center</span>
                        <span className="font-mono text-emerald-400 font-bold">{coverageCenter.toFixed(1)}</span>
                    </label>
                    <input type="range" min={-2.0} max={0.0} step={0.1} value={coverageCenter}
                        onChange={e => setCoverageCenter(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500" />
                    <span className="text-[10px] text-slate-500 block leading-tight">
                        Moves the action center of behavior demonstrations. Actions far from this center are OOD.
                    </span>
                </div>
            </div>

            {/* SVG Graph Plot */}
            <div className="flex justify-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="relative w-full max-w-[500px]">
                    <svg className="w-full" viewBox="0 0 500 220" style={{ overflow: 'visible' }}>
                        {/* Grid lines */}
                        <line x1={pad.left} y1={toY(0)} x2={W - pad.right} y2={toY(0)} stroke="#1e293b" strokeWidth={1.5} />
                        <line x1={pad.left} y1={toY(4)} x2={W - pad.right} y2={toY(4)} stroke="#1e293b" strokeDasharray="3,3" />
                        <line x1={pad.left} y1={toY(8)} x2={W - pad.right} y2={toY(8)} stroke="#1e293b" strokeDasharray="3,3" />

                        {/* Behavior data density (Shaded Area) */}
                        <path d={behaviorPath()} fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth={1} />
                        <text x={toX(coverageCenter)} y={toY(-2)} fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="semibold">
                            Behavioral Support
                        </text>

                        {/* True Q* path */}
                        <path d={generatePath(getTrueQ)} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="4,4" />

                        {/* Offline learned Q path */}
                        <path d={generatePath(getOfflineQ)} fill="none" stroke="#6366f1" strokeWidth={2.5} className="transition-all duration-300" />

                        {/* Y-axis Labels */}
                        <text x={pad.left - 8} y={toY(8) + 3} fill="#64748b" fontSize="8" textAnchor="end">Q=8</text>
                        <text x={pad.left - 8} y={toY(0) + 3} fill="#64748b" fontSize="8" textAnchor="end">Q=0</text>
                        
                        {/* X-axis Labels (Actions) */}
                        <text x={toX(-3)} y={H - 6} fill="#64748b" fontSize="8" textAnchor="middle">-3.0</text>
                        <text x={toX(0)} y={H - 6} fill="#64748b" fontSize="8" textAnchor="middle">0.0</text>
                        <text x={toX(3)} y={H - 6} fill="#64748b" fontSize="8" textAnchor="middle">+3.0</text>
                        <text x={W/2} y={H} fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="semibold">Continuous Action Coordinate</text>

                        {/* Legend */}
                        <g transform={`translate(${pad.left + 15}, 20)`} fontSize="9">
                            <line x1="0" y1="5" x2="15" y2="5" stroke="#64748b" strokeWidth={2} strokeDasharray="3,3" />
                            <text x="20" y="8" fill="#64748b">True Q* (Target)</text>
                            
                            <line x1="120" y1="5" x2="135" y2="5" stroke="#6366f1" strokeWidth={2.5} />
                            <text x="140" y="8" fill="#6366f1">Learned Q_offline</text>
                        </g>

                        {/* OOD Exploding Value Annotation */}
                        {alpha === 0 && (
                            <g transform={`translate(${toX(1.8)}, ${toY(11)})`}>
                                <circle cx="0" cy="0" r="5" fill="#ef4444" />
                                <text x="10" y="3" fill="#ef4444" fontSize="8" fontWeight="bold">OOD Overestimation!</text>
                            </g>
                        )}
                        {alpha > 0.5 && (
                            <g transform={`translate(${toX(2.0)}, ${toY(getOfflineQ(2.0)) - 12})`}>
                                <text x="0" y="0" fill="#6366f1" fontSize="8" textAnchor="middle" fontWeight="bold">Conservative Lower Bound</text>
                            </g>
                        )}
                    </svg>
                </div>
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Decision Transformer Sequence Generator
   ═══════════════════════════════════════════════════════════════════════ */

export const DTSequenceGenerator: React.FC = () => {
    const [targetRTG, setTargetRTG] = useState<number>(10.0); // desired outcome
    const [agentPos, setAgentPos] = useState<number>(0); // 1D grid navigation
    const [history, setHistory] = useState<{ rtg: number; s: number; a: string | null }[]>([
        { rtg: 10.0, s: 0, a: null }
    ]);
    const [stepCount, setStepCount] = useState<number>(0);
    const [isFinished, setIsFinished] = useState<boolean>(false);

    const GOAL_POS = 5;

    const resetSimulator = useCallback(() => {
        setAgentPos(0);
        setStepCount(0);
        setIsFinished(false);
        setHistory([{ rtg: targetRTG, s: 0, a: null }]);
    }, [targetRTG]);

    useEffect(() => {
        resetSimulator();
    }, [targetRTG, resetSimulator]);

    const stepDT = () => {
        if (isFinished || agentPos === GOAL_POS) return;

        // Current trajectory elements
        const currentRTG = history[history.length - 1].rtg;
        const currentS = agentPos;

        // Decision Transformer action generation based on Target RTG
        // If Target RTG is high (+10), model generates optimal actions (Right, Right, ...)
        // If Target RTG is medium (+4), model wanders slightly (Right, Stay, Right)
        // If Target RTG is low (-2), model avoids goal (Left or Stay)
        let action: 'Left' | 'Right' | 'Stay';
        const rand = Math.random();

        if (targetRTG >= 8.0) {
            // Optimal policy path straight to goal
            action = 'Right';
        } else if (targetRTG >= 3.0) {
            // Wanders, sub-optimal pathing
            action = rand < 0.65 ? 'Right' : (rand < 0.85 ? 'Stay' : 'Left');
        } else {
            // Adversarial/Low-performance pathing avoiding goal
            action = rand < 0.6 ? 'Left' : 'Stay';
        }

        // Environment reaction
        let nextPos = agentPos;
        if (action === 'Right') nextPos = Math.min(5, agentPos + 1);
        if (action === 'Left') nextPos = Math.max(0, agentPos - 1);

        const actualReward = nextPos === GOAL_POS ? 10.0 : -1.0;
        const nextRTG = currentRTG - actualReward;

        // Append action to last token history and create next state token
        setHistory(prev => {
            const updated = [...prev];
            updated[updated.length - 1].a = action;
            if (nextPos !== GOAL_POS) {
                updated.push({ rtg: nextRTG, s: nextPos, a: null });
            }
            return updated;
        });

        setAgentPos(nextPos);
        setStepCount(prev => prev + 1);

        if (nextPos === GOAL_POS || stepCount >= 8) {
            setIsFinished(true);
        }
    };

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Terminal size={18} className="text-indigo-400" />
                        Decision Transformer Sequence Explorer
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Input a target Return-to-Go and step through causal attention token sequences to generate path actions.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={stepDT} disabled={isFinished || agentPos === GOAL_POS}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-40 transition-colors">
                        Next Token Step
                    </button>
                    <button onClick={resetSimulator}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Target RTG Selector */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Desired Return-to-Go (Goal Conditioning)
                    </label>
                    <div className="flex gap-2">
                        {[10.0, 4.0, -2.0].map(val => {
                            const labels: Record<number, string> = { 10.0: 'High (+10)', 4.0: 'Medium (+4)', [-2.0]: 'Low (-2)' };
                            return (
                                <button key={val} onClick={() => setTargetRTG(val)}
                                    className={`flex-1 py-1 px-3 rounded-lg text-xs font-mono font-bold transition-all ${targetRTG === val ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                    {labels[val]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Current Position</span>
                        <span className="text-sm font-mono font-bold text-white">{agentPos}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Token Count</span>
                        <span className="text-sm font-mono font-bold text-white">{history.length * 3 - (isFinished ? 1 : 2)}</span>
                    </div>
                </div>
            </div>

            {/* 1D Grid View */}
            <div className="space-y-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">1D Arena path</span>
                <div className="grid grid-cols-6 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    {Array.from({ length: 6 }).map((_, idx) => {
                        const isAgent = agentPos === idx;
                        const isGoal = GOAL_POS === idx;
                        return (
                            <div key={idx}
                                className={`py-4 rounded-xl border flex flex-col justify-center items-center font-bold text-sm select-none relative h-16
                                    ${isAgent ? 'bg-indigo-500/20 border-indigo-500/50 shadow-md shadow-indigo-500/10' : 'bg-slate-900 border-slate-800'}
                                `}>
                                {isGoal && <span className="absolute top-1 text-[9px] text-emerald-400">GOAL</span>}
                                {isAgent ? '🤖' : (isGoal ? '🏆' : idx)}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Transformer Causal Context Window (Token Stream) */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                    Causal GPT-Style Context Window
                </span>

                <div className="flex flex-wrap gap-2 items-center text-xs font-mono">
                    {history.map((tok, idx) => (
                        <div key={idx} className="flex gap-2 items-center border border-slate-800/80 p-2 rounded-lg bg-slate-900/60">
                            {/* RTG Token */}
                            <div className="text-center">
                                <span className="text-[8px] text-slate-500 block">RTG</span>
                                <span className="text-indigo-400 font-bold">{tok.rtg.toFixed(1)}</span>
                            </div>
                            <span className="text-slate-700">|</span>
                            {/* State Token */}
                            <div className="text-center">
                                <span className="text-[8px] text-slate-500 block">State</span>
                                <span className="text-white font-bold">{tok.s}</span>
                            </div>
                            {tok.a && (
                                <>
                                    <span className="text-slate-700">|</span>
                                    {/* Action Token */}
                                    <div className="text-center">
                                        <span className="text-[8px] text-slate-500 block">Action</span>
                                        <span className="text-amber-400 font-bold">{tok.a}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {!isFinished && (
                        <div className="p-2 border border-dashed border-slate-700 rounded-lg text-slate-600 animate-pulse">
                            [Next Action]
                        </div>
                    )}
                </div>

                {/* Attention Heatmap Visualization */}
                <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Causal Self-Attention Weight Matrix</span>
                    <div className="flex gap-2">
                        {history.map((_, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                {Array.from({ length: history.length }).map((_, j) => {
                                    const isCausalMask = j > i;
                                    // Highlight self attention weight strength
                                    let weightStyle = 'bg-slate-900 border border-slate-950 text-slate-700';
                                    if (isCausalMask) {
                                        weightStyle = 'bg-slate-950 text-slate-800 line-through';
                                    } else if (i === j) {
                                        weightStyle = 'bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 font-bold';
                                    } else if (j < i) {
                                        weightStyle = 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400/70';
                                    }
                                    return (
                                        <div key={j} className={`w-8 h-8 rounded text-[9px] flex items-center justify-center font-mono ${weightStyle}`}>
                                            {isCausalMask ? '0' : (i === j ? '0.6' : '0.1')}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: OfflineRL Component
   ═══════════════════════════════════════════════════════════════════════ */

export const OfflineRL: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                    <HardDrive size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 11</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500 mb-4">
                    Offline & Batch Reinforcement Learning
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Learn strictly from historical logs without environment exploration: explore Conservative Q-Learning 
                    to handle distribution shifts and the Decision Transformer architecture.
                </p>
            </motion.div>

            {/* ─── 11.1 THE OFFLINE RL PARADIGM ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HardDrive size={20} className="text-indigo-400" />}>
                    11.1 — The Offline RL Paradigm
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Traditional RL algorithms operate in an active, online environment loop. However, in safety-critical settings (e.g. healthcare, industrial control, autonomous driving), running exploratory online policies is dangerous and expensive.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Online RL</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Actively interacts with the environment, collecting new experiences directly via exploration and updating policy values dynamically.
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Off-Policy RL</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Learns from experiences collected by older versions of the same agent (using a replay buffer), but still relies on active environmental rollouts for data collection.
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                            <span className="text-sm font-bold text-white block">Offline (Batch) RL</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Strictly learns from a fixed, static dataset <MathEquation formula="\mathcal{D}" /> collected by a behavioral policy <MathEquation formula="\pi_\beta" />. No online environment interaction is permitted during training.
                            </p>
                        </div>
                    </div>

                    <KeyInsight title="The Core Offline Challenge: Distribution Shift">
                        When learning a policy <MathEquation formula="\pi" /> from a fixed dataset <MathEquation formula="\mathcal{D}" />, the policy will naturally select actions that deviate from the behavioral policy <MathEquation formula="\pi_\beta" />. Because we cannot query the environment for the true outcome of these new actions, value function networks must extrapolate, leading to overestimation.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 11.2 DISTRIBUTIONAL EXTRAPOLATION ERROR ────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<AlertTriangle size={20} className="text-indigo-400" />}>
                    11.2 — Distributional Extrapolation Error
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        If we train a standard off-policy algorithm (like DQN or DDPG) offline, the learned policy crashes instantly when deployed in the real world. This failure is driven by **Distributional Extrapolation Error** (Out-of-Distribution or OOD actions).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-md font-bold text-white">The Bellman Backup Failure</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                In standard temporal difference updates, we evaluate action values using a maximization step over the next state:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-center">
                                <MathEquation formula="Q(s, a) \leftarrow r + \gamma \max_{a'} Q(s', a')" block />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Because we optimize Q-values over the entire action space, we query action values <MathEquation formula="Q(s', a')" /> for actions <MathEquation formula="a'" /> outside the support of the behavioral dataset <MathEquation formula="\mathcal{D}" />. Function approximators cannot predict these values accurately, and any random positive error is magnified by the max operator.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Extrapolation Mechanics</span>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    When the Q-value estimator overestimates OOD actions, the policy is updated to select those actions. Since the agent cannot collect new data to correct this error, the value function explodes during training, leading to policy failure.
                                </p>
                            </div>
                            <div className="mt-4 p-3 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-slate-400 leading-relaxed">
                                <strong>Constraint Methods vs. Conservative Methods:</strong> Constraint methods (BCQ, BEAR) force the policy to stay close to the behavioral data distribution. Conservative methods (CQL) instead lower-bound the value functions for actions outside the dataset.
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 11.3 CONSERVATIVE Q-LEARNING (CQL) ──────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Sliders size={20} className="text-indigo-400" />}>
                    11.3 — Conservative Q-Learning (CQL)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        **Conservative Q-Learning (CQL)** solves the overestimation problem by learning a conservative Q-function that acts as a mathematical lower bound of the true Q-value function.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The CQL Loss Formulation</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                CQL adds a regularization term to the standard Bellman loss to penalize high Q-values on OOD actions while pushing up values for actions inside the dataset:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                                <MathEquation formula="L_{\mathrm{CQL}}(Q) = \alpha \left( \mathbb{E}_{s \sim \mathcal{D}, a \sim \pi(a|s)}[Q(s, a)] - \mathbb{E}_{s \sim \mathcal{D}, a \sim \pi_\beta(a|s)}[Q(s, a)] \right) + \frac{1}{2} L_{\mathrm{Bellman}}(Q)" block />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                where <MathEquation formula="\alpha" /> controls the penalty strength. This regularization guarantees that the expected Q-value is conservative: <MathEquation formula="\mathbb{E}_{\pi}[Q_{\mathrm{CQL}}(s, a)] \le \mathbb{E}_{\pi}[Q^*(s, a)]" />.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <AlgorithmBox
                                title="CQL Update Step"
                                steps={[
                                    "Sample transition tuple $(s, a, r, s')$ from dataset $\\mathcal{D}$",
                                    "Generate candidate actions $a' \\sim \\pi(a|s')$ from current policy",
                                    "Compute target values: $Y = r + \\gamma \\max_{a'} Q(s', a')$",
                                    "Compute OOD action expectations to minimize value projections",
                                    "Calculate Bellman error: $(Q(s, a) - Y)^2$",
                                    "Apply gradient descent step on combined loss $L_{\\mathrm{CQL}}(Q)$"
                                ]}
                            />
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 11.4 CQL GRAPH EXPLORER ────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Activity size={20} className="text-indigo-400" />}>
                    11.4 — CQL OOD Regularization Graph
                </SectionTitle>
                <CQLRegularizationGraph />
            </motion.section>

            {/* ─── 11.5 DECISION TRANSFORMERS ─────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Zap size={20} className="text-indigo-400" />}>
                    11.5 — Sequence Modeling & The Decision Transformer
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Rather than using TD learning, value networks, or policy gradients, **Decision Transformers** (Chen et al., 2021) frame reinforcement learning as a conditional sequence modeling task using causal transformers (GPT-style).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">Return-to-Go (RTG) Tokenization</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Trajectories are tokenized into sequences of Return-to-Go, State, and Action tokens:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-center font-mono text-xs">
                                <MathEquation formula="\tau = \left( \hat{R}_1, S_1, A_1, \hat{R}_2, S_2, A_2, \dots, \hat{R}_T, S_T, A_T \right)" block />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                The **Return-to-Go** represents the remaining reward needed to reach the desired outcome:
                            </p>
                            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                                <MathEquation formula="\hat{R}_t = \sum_{t'=t}^T r_{t'}" block />
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col justify-between">
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Inference by Conditioning</span>
                                <h4 className="text-sm font-bold text-white">Planning without Bellman backups</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    During inference, we specify the desired total reward as the initial Return-to-Go token <MathEquation formula="\hat{R}_1" />. The Causal Transformer generates the next action $A_t$ conditioned on the context window of history:
                                </p>
                                <div className="bg-slate-950/60 p-2.5 rounded font-mono text-[10px] text-indigo-300 text-center border border-slate-800">
                                    GPT(RTG_1, S_1, A_1, ..., RTG_t, S_t) &rarr; A_t
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                If we ask the model for a high Return-to-Go, it generates actions that correspond to high-performance trajectories in the training logs.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 11.6 DECISION TRANSFORMER VISUALIZER ───────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Activity size={20} className="text-indigo-400" />}>
                    11.6 — Decision Transformer Causal Sequence Generator
                </SectionTitle>
                <DTSequenceGenerator />
            </motion.section>

            {/* ─── 11.7 OFFLINE RL ALGORITHMS COMPARISON ──────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle icon={<Sliders size={20} className="text-indigo-400" />}>
                    11.7 — Offline RL Algorithm Comparisons
                </SectionTitle>

                <Card className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-800/80 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 px-4">Algorithm</th>
                                <th className="pb-3 px-4">Approach Type</th>
                                <th className="pb-3 px-4">Main Objective</th>
                                <th className="pb-3 px-4">Value Network?</th>
                                <th className="pb-3 px-4">Key Advantage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-sm">
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">BCQ</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Policy Constraint</td>
                                <td className="py-4 px-4 text-slate-400">Restrict policy to behavioral support</td>
                                <td className="py-4 px-4 text-green-400 font-semibold">Yes</td>
                                <td className="py-4 px-4 text-slate-400">Simple and safe policy updates</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">CQL</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Conservative Value</td>
                                <td className="py-4 px-4 text-slate-400">Learn Q lower-bound to clamp OOD values</td>
                                <td className="py-4 px-4 text-green-400 font-semibold">Yes</td>
                                <td className="py-4 px-4 text-slate-400">Strong theoretical lower-bound guarantees</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">Decision Transformer</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Sequence Modeling</td>
                                <td className="py-4 px-4 text-slate-400">Autoregressive action token generation</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">No</td>
                                <td className="py-4 px-4 text-slate-400">No Bellman updates; leverages causal attention</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
            </motion.section>

        </div>
    );
};
