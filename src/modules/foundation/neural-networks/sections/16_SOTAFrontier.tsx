import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Rocket, 
    Layers, 
    Activity, 
    Sparkles, 
    AlertTriangle, 
    Terminal, 
    BookOpen, 
    Award, 
    HelpCircle, 
    CheckCircle,
    Eye,
    Zap,
    Repeat
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 1: KAN vs MLP Activation Function Editor
   ═══════════════════════════════════════════════════════════════════════ */

const KANVsMLPEditor: React.FC = () => {
    const [mode, setMode] = useState<'mlp' | 'kan'>('kan');
    const [inputValue, setInputValue] = useState<number>(0.4);
    // Spline control coefficients for KAN
    const [c0, setC0] = useState<number>(0.2);
    const [c1, setC1] = useState<number>(0.8);
    const [c2, setC2] = useState<number>(0.4);

    // Calculate basis values for linear spline with knots at 0.0, 0.5, 1.0
    // x is bounded in [0, 1]
    const getSplineValue = (x: number) => {
        if (x <= 0.5) {
            const b0 = (0.5 - x) / 0.5;
            const b1 = x / 0.5;
            return c0 * b0 + c1 * b1;
        } else {
            const b1 = (1.0 - x) / 0.5;
            const b2 = (x - 0.5) / 0.5;
            return c1 * b1 + c2 * b2;
        }
    };

    const xVal = inputValue;
    const yVal = mode === 'mlp' ? Math.max(0, xVal) : getSplineValue(xVal); // ReLU vs Spline

    const W = 220;
    const H = 140;

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">KAN vs MLP Activation</span>
                <div className="flex gap-1.5">
                    <button 
                        onClick={() => setMode('mlp')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            mode === 'mlp' 
                                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                    >
                        MLP (Node)
                    </button>
                    <button 
                        onClick={() => setMode('kan')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            mode === 'kan' 
                                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                    >
                        KAN (Edge)
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-3 text-xs font-sans">
                <div className="space-y-1">
                    <label className="text-slate-405 flex justify-between">
                        <span>Input Signal (x)</span>
                        <span className="font-mono text-pink-400 font-bold">x = {inputValue.toFixed(2)}</span>
                    </label>
                    <input 
                        type="range" 
                        min="0.0" 
                        max="1.0" 
                        step="0.05" 
                        value={inputValue} 
                        onChange={e => setInputValue(parseFloat(e.target.value))} 
                        className="w-full accent-pink-500 h-1 bg-slate-850 rounded" 
                    />
                </div>

                {mode === 'kan' && (
                    <div className="space-y-1.5 p-2 bg-slate-900/60 rounded border border-slate-850">
                        <span className="text-[9px] uppercase font-bold text-slate-550 block mb-1">Learnable Spline Knots</span>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-[9px] text-slate-500 block">Knot 0 (x=0.0)</label>
                                <input type="range" min="-1" max="1" step="0.1" value={c0} onChange={e => setC0(parseFloat(e.target.value))} className="w-full accent-pink-500 h-1 bg-slate-800" />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-500 block">Knot 1 (x=0.5)</label>
                                <input type="range" min="-1" max="1" step="0.1" value={c1} onChange={e => setC1(parseFloat(e.target.value))} className="w-full accent-pink-500 h-1 bg-slate-800" />
                            </div>
                            <div>
                                <label className="text-[9px] text-slate-500 block">Knot 2 (x=1.0)</label>
                                <input type="range" min="-1" max="1" step="0.1" value={c2} onChange={e => setC2(parseFloat(e.target.value))} className="w-full accent-pink-500 h-1 bg-slate-800" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SVG Chart */}
            <div className="flex justify-center bg-slate-905 p-2 rounded-lg border border-slate-900">
                <svg width={W} height={H} className="block">
                    {/* Grid line */}
                    <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
                    
                    {/* Plot curve */}
                    <path 
                        d={Array.from({ length: 41 }).map((_, i) => {
                            const valX = i / 40;
                            const valY = mode === 'mlp' ? Math.max(0, valX) : getSplineValue(valX);
                            const svgX = valX * W;
                            // Map Y range [-1, 1] to SVG coordinates [H-10, 10]
                            const svgY = (H - 20) - ((valY + 1.0) / 2.0) * (H - 20);
                            return `${i === 0 ? 'M' : 'L'} ${svgX} ${svgY}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#e64980"
                        strokeWidth="2"
                    />

                    {/* Input indicator dot */}
                    <circle 
                        cx={xVal * W} 
                        cy={(H - 20) - ((yVal + 1.0) / 2.0) * (H - 20)} 
                        r="4" 
                        fill="#fff" 
                        stroke="#e64980"
                        strokeWidth="2"
                    />

                    {/* baseline */}
                    <line x1={0} y1={H - 10} x2={W} y2={H - 10} stroke="#334155" strokeWidth="1" />
                </svg>
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] text-slate-400">
                {mode === 'mlp' ? (
                    <span><strong>MLP:</strong> Static non-linearity at node (e.g. ReLU). Weights reside on linear inputs.</span>
                ) : (
                    <span><strong>KAN:</strong> Activation function on edge is parameterized via dynamic splines. Outputs sum at nodes.</span>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: Mamba Selective Scan Simulator
   ═══════════════════════════════════════════════════════════════════════ */

const MambaSSM: React.FC = () => {
    const tokens = ["The", "patient", "developed", "acute", "appendicitis", "requiring", "urgent", "surgery"];
    const [index, setIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // Run auto-play loop
    useEffect(() => {
        let interval: any = null;
        if (isPlaying) {
            interval = setInterval(() => {
                setIndex(prev => (prev + 1) % tokens.length);
            }, 1200);
        } else {
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying]);

    // Calculate dynamic parameters based on token importance
    // Nouns/Adjectives ("acute", "appendicitis", "surgery") get large Delta and selective memory coefficients
    const getSSMParams = (tokIndex: number) => {
        const token = tokens[tokIndex];
        let delta = 0.15; // default step size
        let isImportant = false;

        if (token === "acute" || token === "appendicitis" || token === "surgery" || token === "patient") {
            delta = 0.85;
            isImportant = true;
        } else if (token === "developed" || token === "requiring" || token === "urgent") {
            delta = 0.45;
            isImportant = false;
        }

        // B_t (write gate scaling) and C_t (read projection scaling)
        const bVal = isImportant ? 0.90 : 0.10;
        const cVal = isImportant ? 0.95 : 0.20;

        return { delta, bVal, cVal, isImportant };
    };

    const currentParams = getSSMParams(index);

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mamba Selective Scan</span>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-2 py-0.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-[10px] font-bold text-teal-400 rounded"
                >
                    {isPlaying ? 'Pause Sim' : 'Play Sim'}
                </button>
            </div>

            {/* Token Carousel */}
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900/60 rounded-lg border border-slate-850 justify-center">
                {tokens.map((t, idx) => {
                    const isCurrent = index === idx;
                    const params = getSSMParams(idx);
                    return (
                        <div 
                            key={`t-${idx}`}
                            className={`px-2 py-1 rounded text-xs transition-all duration-300 font-sans cursor-pointer ${
                                isCurrent 
                                    ? 'bg-pink-500 text-slate-950 font-bold scale-110 shadow-lg shadow-pink-500/20' 
                                    : params.isImportant 
                                        ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                                        : 'bg-slate-950/40 text-slate-500 border border-slate-900/40'
                            }`}
                            onClick={() => { setIndex(idx); setIsPlaying(false); }}
                        >
                            {t}
                        </div>
                    );
                })}
            </div>

            {/* Live readout */}
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                    <span>Token:</span>
                    <span className="text-pink-400 font-bold">"{tokens[index]}"</span>
                </div>
                <div className="flex justify-between">
                    <span>Step size (Δ_t):</span>
                    <span className="text-pink-400 font-bold">{currentParams.delta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Write Gate (B_t):</span>
                    <span className="text-pink-400 font-bold">{currentParams.bVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between flex-wrap">
                    <span>Selection Mechanism:</span>
                    <span className={`text-[10px] uppercase px-1.5 rounded font-sans font-bold ${
                        currentParams.isImportant 
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                            : 'bg-slate-950/80 text-slate-500'
                    }`}>
                        {currentParams.isImportant ? 'Store in Memory' : 'Skip Context'}
                    </span>
                </div>
            </div>

            {/* Dynamic memory vector visualization */}
            <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-sans block">Latent Memory State (h_t)</span>
                <div className="h-6 bg-slate-900 border border-slate-850 rounded overflow-hidden flex">
                    {tokens.map((_, idx) => {
                        const params = getSSMParams(idx);
                        // Memory fades if index is past, unless it is important
                        const isActive = idx <= index;
                        let opacity = 0.1;
                        if (isActive) {
                            const age = index - idx;
                            opacity = params.isImportant 
                                ? Math.max(0.3, 0.95 - age * 0.08) 
                                : Math.max(0.05, 0.40 - age * 0.15);
                        }

                        return (
                            <div 
                                key={`mem-${idx}`} 
                                className="flex-1 bg-pink-500 border-r border-slate-950/40 last:border-0 transition-all duration-300"
                                style={{ opacity }}
                                title={`Memory contribution of token "${tokens[idx]}"`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: CoT Reasoning Search Tree
   ═══════════════════════════════════════════════════════════════════════ */

interface SearchNode {
    id: string;
    text: string;
    score: number;
    status: 'pending' | 'success' | 'pruned';
    parent?: string;
    children?: string[];
}

const ReasoningTree: React.FC = () => {
    const [treeStep, setTreeStep] = useState<number>(0);

    const nodes: Record<string, SearchNode> = {
        'root': { id: 'root', text: 'Target: Find smallest prime > 100', score: 1.0, status: 'pending', children: ['n101', 'n102', 'n103'] },
        'n101': { id: 'n101', text: 'Try 101: Test prime factors up to sqrt(101) ~ 10', score: 0.98, status: 'success', parent: 'root' },
        'n102': { id: 'n102', text: 'Try 102: Even number (> 2), divisible by 2', score: 0.01, status: 'pruned', parent: 'root' },
        'n103': { id: 'n103', text: 'Try 103: Is prime, but not smallest > 100', score: 0.45, status: 'pruned', parent: 'root' }
    };

    const getStatusColor = (status: 'pending' | 'success' | 'pruned') => {
        if (status === 'success') return 'border-emerald-500/80 bg-emerald-500/5 text-emerald-400';
        if (status === 'pruned') return 'border-red-500/60 bg-red-500/5 text-red-400';
        return 'border-slate-800 bg-slate-950 text-slate-400';
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">System 2 Reasoning Search Tree</span>

            <div className="space-y-3 font-sans text-xs">
                {/* Root node */}
                <div className={`p-2.5 rounded-lg border transition-all ${getStatusColor('pending')}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">Root Query</span>
                        <span className="font-mono text-[9px] bg-slate-900 px-1 py-0.5 rounded text-white">Score: 1.00</span>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-slate-300">"Find the smallest prime number greater than 100."</p>
                </div>

                {/* Sub branches animators */}
                <div className="pl-4 border-l border-slate-800 space-y-2 relative">
                    <AnimatePresence>
                        {treeStep >= 1 && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-2.5 rounded-lg border transition-all ${getStatusColor(nodes.n101.status)}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[10px] text-emerald-450">Path A (101)</span>
                                    <span className="font-mono text-[9px] bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-bold">PRM Score: 0.98</span>
                                </div>
                                <p className="text-[10.5px] leading-relaxed text-slate-350">{nodes.n101.text}</p>
                                <div className="text-[9px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                                    <CheckCircle size={10} />
                                    <span>Verified Prime & Smallest! Path Confirmed.</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {treeStep >= 2 && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-2.5 rounded-lg border transition-all ${getStatusColor(nodes.n102.status)}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[10px] text-red-400">Path B (102)</span>
                                    <span className="font-mono text-[9px] bg-slate-900 px-1 py-0.5 rounded text-red-400 font-bold">PRM Score: 0.01</span>
                                </div>
                                <p className="text-[10.5px] leading-relaxed text-slate-350">{nodes.n102.text}</p>
                                <div className="text-[9px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    <span>Failed prime test. Branch pruned.</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {treeStep >= 3 && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-2.5 rounded-lg border transition-all ${getStatusColor(nodes.n103.status)}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[10px] text-slate-400">Path C (103)</span>
                                    <span className="font-mono text-[9px] bg-slate-900 px-1 py-0.5 rounded text-slate-450 font-bold">PRM Score: 0.45</span>
                                </div>
                                <p className="text-[10.5px] leading-relaxed text-slate-350">{nodes.n103.text}</p>
                                <div className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    <span>Prime but suboptimal (101 is smaller). Pruned.</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tree step controls */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => setTreeStep(prev => Math.min(3, prev + 1))}
                    disabled={treeStep >= 3}
                    className="flex-1 bg-pink-500 hover:bg-pink-650 text-slate-950 font-bold text-xs py-1.5 rounded-lg transition-all disabled:opacity-40"
                >
                    Expand Next Step
                </button>
                <button
                    onClick={() => setTreeStep(0)}
                    className="px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs py-1.5 rounded-lg transition-all"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const SOTAFrontier: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-pink-400 mb-4">
                    <Rocket size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 16</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-pink-500 mb-4">
                    SOTA & Frontier Topics (2024–2025)
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Explore the cutting-edge boundaries of deep learning. Derive Kolmogorov-Arnold Networks, Mamba's input-dependent selective scan state space formulations, and test-time reasoning compute scaling laws.
                </p>
            </motion.div>

            {/* ─── 16.1 KAN ─────────────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-pink-400" />}>
                    16.1 — Kolmogorov-Arnold Networks (KAN): B-Spline Edges
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The escalator tracks analogy">
                        Traditional Multi-Layer Perceptrons are like subway systems where passengers (features) walk along straight tunnels (linear edges) and get compressed or selected when passing through turnstiles (activations inside nodes). KANs flip this design: the stations (nodes) are simple summation chambers, but the tunnels (edges) contain flexible, custom-shaped escalators (learnable B-splines) that warp signals dynamically during transit.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        **Kolmogorov-Arnold Networks (KAN)** (Liu et al. 2024) challenge the fundamental architecture of MLPs. While MLPs place fixed activation functions at the nodes and linear weights on the edges, KANs place learnable 1D functions on the edges.
                    </p>

                    <p className="text-slate-400 text-xs leading-relaxed font-sans">
                        This architecture stems from the Kolmogorov-Arnold representation theorem, which proves that any multivariate continuous function can be represented as a finite composition of univariate functions:
                    </p>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="f(x_1, \dots, x_n) = \sum_{q=1}^{2n+1} \Phi_q \left( \sum_{p=1}^n \phi_{q,p}(x_p) \right)" block />
                    </div>
                </Card>
            </motion.section>

            {/* ─── 16.2 MAMBA SELECTIVE SSM ─────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-pink-400" />}>
                    16.2 — Selective State Space Models (Mamba)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        State Space Models (SSMs) map 1D sequence inputs to 1D sequence outputs via a continuous-time latent space projection:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                        <div className="text-center">
                            <MathEquation formula="h'(t) = \mathbf{A} h(t) + \mathbf{B} x(t)" block />
                            <MathEquation formula="y(t) = \mathbf{C} h(t) + \mathbf{D} x(t)" block />
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-sans font-normal">
                            Discretizing the continuous equations with step size <MathEquation formula="\Delta" /> using Zero-Order Hold (ZOH) yields:
                        </p>
                        <div className="text-center font-mono">
                            <MathEquation formula="\bar{\mathbf{A}} = \exp(\Delta \mathbf{A})" block />
                            <MathEquation formula="\bar{\mathbf{B}} = (\Delta \mathbf{A})^{-1} (\exp(\Delta \mathbf{A}) - \mathbf{I}) \mathbf{B}" block />
                            <MathEquation formula="h_t = \bar{\mathbf{A}} h_{t-1} + \bar{\mathbf{B}} x_t" block />
                            <MathEquation formula="y_t = \mathbf{C} h_t + \mathbf{D} x_t" block />
                        </div>
                    </div>

                    <Callout variant="insight" title="What is the Selection Mechanism?">
                        Standard SSMs are Linear Time-Invariant (LTI)—the matrices <MathEquation formula="\mathbf{A}, \mathbf{B}, \mathbf{C}" /> remain constant across steps, preventing the model from ignoring irrelevant context or selectively focusing. 
                        Mamba makes <MathEquation formula="\mathbf{B}_t" />, <MathEquation formula="\mathbf{C}_t" />, and <MathEquation formula="\Delta_t" /> input-dependent projections of the current input token <MathEquation formula="x_t" />. This allows the model to compress sequences in linear time <MathEquation formula="O(L)" />.
                    </Callout>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-pink-400" />}>
                    16.3 — Frontier Interactive Playground
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <KANVsMLPEditor />
                    <MambaSSM />
                    <ReasoningTree />
                </div>
            </motion.section>

            {/* ─── 16.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-pink-400" />}>
                    16.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: SSM Zero-Order Hold Discretization</h3>
                        <p className="text-slate-350 text-sm font-sans">
                            Let us compute the discrete matrices <MathEquation formula="\bar{A}" /> and <MathEquation formula="\bar{B}" /> for a continuous SSM with 1D parameter scalars <MathEquation formula="A = -2.0, \, B = 3.0" />, given step size <MathEquation formula="\Delta = 0.1" />:
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3 leading-relaxed">
                            <div>
                                <span className="text-pink-400 font-bold block mb-1">1. Compute discrete transition coefficient:</span>
                                <MathEquation formula="\bar{A} = \exp(\Delta A) = \exp(0.1 \times (-2.0)) = \exp(-0.2) \approx 0.81873" block />
                            </div>
                            <div>
                                <span className="text-pink-400 font-bold block mb-1">2. Compute discrete projection scaling:</span>
                                <MathEquation formula="\bar{B} = (\Delta A)^{-1} (\exp(\Delta A) - 1) B" block />
                                <MathEquation formula="= (-0.2)^{-1} (0.81873 - 1) \times 3.0" block />
                                <MathEquation formula="= (-5.0) \times (-0.18127) \times 3.0" block />
                                <MathEquation formula="= 0.90635 \times 3.0 \approx 2.71905" block />
                            </div>
                            <div>
                                <span className="text-pink-400 font-bold block mb-1">3. Step Forward:</span>
                                <p className="text-slate-400 text-xs font-sans mb-1">Assuming initial hidden state <MathEquation formula="h_0 = 0" /> and input <MathEquation formula="x_0 = 1.0" />:</p>
                                <MathEquation formula="h_1 = \bar{A}h_0 + \bar{B}x_0 = 0.81873(0.0) + 2.71905(1.0) = 2.71905" block />
                            </div>
                        </div>

                        <h3 className="text-md font-bold text-white pt-4">Example B: KAN Spline evaluation</h3>
                        <p className="text-slate-350 text-sm font-sans">
                            Trace a 1D KAN activation on a single edge using a 3-interval linear spline (knots at <MathEquation formula="[0.0, 0.5, 1.0]" />) with control coefficients <MathEquation formula="c_0 = 0.2, \, c_1 = 0.8, \, c_2 = 0.4" />. Calculate the spline output for input <MathEquation formula="x = 0.4" />:
                        </p>
                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-2 leading-relaxed">
                            <p className="text-slate-400 text-xs font-sans">Because <MathEquation formula="x = 0.4" /> lies in the first interval <MathEquation formula="[0.0, 0.5]" />, the basis values are:</p>
                            <MathEquation formula="B_0(0.4) = \frac{0.5 - 0.4}{0.5 - 0.0} = 0.2" block />
                            <MathEquation formula="B_1(0.4) = \frac{0.4 - 0.0}{0.5 - 0.0} = 0.8" block />
                            <p className="text-slate-400 text-xs font-sans my-2">The spline output is the weighted sum of basis values:</p>
                            <MathEquation formula="S(0.4) = c_0 B_0(0.4) + c_1 B_1(0.4) = 0.2(0.2) + 0.8(0.8) = 0.04 + 0.64 = 0.68" block />
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 16.5 PYTORCH CODE SNIPPETS ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-pink-400" />}>
                    16.5 — Custom PyTorch KANs & Mamba-style State Spaces
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a basic Kolmogorov-Arnold Linear Layer (parameterized with radial basis splines) and an input-dependent Selective SSM Step.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import torch.nn.functional as F

class KANLinear(nn.Module):
    """
    Simple implementation of a Kolmogorov-Arnold Network (KAN) linear layer
    using Radial Basis Functions (RBFs) to approximate B-splines.
    """
    def __init__(self, in_dim: int, out_dim: int, grid_size: int = 5):
        super(KANLinear, self).__init__()
        self.in_dim = in_dim
        self.out_dim = out_dim
        self.grid_size = grid_size
        
        # Grid parameters: centers for radial basis functions
        self.register_buffer("grid", torch.linspace(-2.0, 2.0, grid_size))
        
        # Learnable scale for RBFs on edges: [in_dim, out_dim, grid_size]
        self.coef = nn.Parameter(torch.randn(in_dim, out_dim, grid_size) * 0.1)
        # Learnable base linear mapping to help coordinate scaling
        self.base_weight = nn.Parameter(torch.randn(out_dim, in_dim) * 0.1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [Batch, in_dim]
        batch_size = x.shape[0]
        
        # 1. Base linear path: W_base * x
        base_out = F.linear(x, self.base_weight) # [Batch, out_dim]
        
        # 2. Spline/RBF path:
        # Reshape input: [Batch, in_dim, 1]
        x_expanded = x.unsqueeze(-1)
        # Compute distances to grid centers: [Batch, in_dim, grid_size]
        # Basis function: exp(-((x - center) / std)^2)
        dist = x_expanded - self.grid.view(1, 1, -1)
        rbf_basis = torch.exp(-torch.pow(dist * 2.0, 2)) # std=0.5 approximation
        
        # Compute weighted RBF values along edges:
        # [Batch, in_dim, grid_size] multiplied by coefficients [in_dim, out_dim, grid_size]
        # Sum over grid dimension -> [Batch, in_dim, out_dim]
        spline_out = torch.einsum("big,iog->bio", rbf_basis, self.coef)
        # Sum over input dimension -> [Batch, out_dim]
        spline_out = spline_out.sum(dim=1)
        
        return base_out + spline_out

class SelectiveSSMStep(nn.Module):
    """
    A single step of Mamba-style Selective State Space Model (SSM).
    Constructs input-dependent Delta_t, B_t, and C_t matrices dynamically.
    """
    def __init__(self, dim: int, d_state: int = 4):
        super(SelectiveSSMStep, self).__init__()
        self.dim = dim
        self.d_state = d_state
        
        # Continuous state matrix A (diagonal representation, fixed and negative)
        self.A = nn.Parameter(torch.linspace(-1.0, -0.1, d_state))
        
        # Linear layers to project input x to B, C, and Delta dynamically
        self.proj_B = nn.Linear(dim, d_state)
        self.proj_C = nn.Linear(dim, d_state)
        self.proj_Delta = nn.Linear(dim, 1)

    def forward(self, x_t: torch.Tensor, h_prev: torch.Tensor) -> tuple:
        # x_t: Current token representation [Batch, Dim]
        # h_prev: Previous latent state [Batch, d_state]
        
        # 1. Generate input-dependent parameters (Selection Mechanism)
        B_t = self.proj_B(x_t)                       # [Batch, d_state]
        C_t = self.proj_C(x_t)                       # [Batch, d_state]
        
        # Step size delta (must be positive, enforce with softplus)
        Delta_t = F.softplus(self.proj_Delta(x_t))   # [Batch, 1]
        
        # 2. ZOH Discretization
        # A_bar = exp(Delta * A) -> [Batch, d_state]
        A_bar = torch.exp(Delta_t * self.A.unsqueeze(0))
        # B_bar = Delta * B -> [Batch, d_state]
        B_bar = Delta_t * B_t
        
        # 3. Update hidden state
        # h_t = A_bar * h_prev + B_bar * x_t
        h_t = A_bar * h_prev + B_bar
        
        # 4. Generate Output projection
        # y_t = C_t * h_t
        y_t = torch.sum(C_t * h_t, dim=-1, keepdim=True) # [Batch, 1]
        
        return y_t, h_t

if __name__ == "__main__":
    # Test KAN
    x_in = torch.randn(4, 8)
    kan = KANLinear(in_dim=8, out_dim=4)
    y_kan = kan(x_in)
    print("KAN Output shape:", y_kan.shape) # Expected [4, 4]
    
    # Test Selective SSM
    x_tok = torch.randn(4, 16)
    h_state = torch.zeros(4, 4)
    ssm = SelectiveSSMStep(dim=16, d_state=4)
    y_ssm, h_next = ssm(x_tok, h_state)
    print("SSM Output shape:", y_ssm.shape) # Expected [4, 1]
    print("SSM Latent shape:", h_next.shape) # Expected [4, 4]`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
