import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    ArrowRight, 
    Play, 
    Pause, 
    RotateCcw, 
    Sliders, 
    Sparkles, 
    AlertTriangle, 
    Terminal, 
    BookOpen, 
    Award, 
    HelpCircle, 
    CheckCircle,
    Cpu,
    Zap,
    Scale
} from 'lucide-react';
import { MathEquation } from '../../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../../components/SectionElements';

/* =========================================================================
   SECTION 1: Motivation & Sequences
   ========================================================================= */

const RNNvsTransformerWidget: React.FC = () => {
    const [rnnStep, setRnnStep] = useState(0);
    const [isRnnPlaying, setIsRnnPlaying] = useState(false);
    const rnnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const tokens = ["The", "quick", "brown", "fox"];

    useEffect(() => {
        if (isRnnPlaying) {
            rnnIntervalRef.current = setInterval(() => {
                setRnnStep(prev => (prev + 1) % (tokens.length + 1));
            }, 1000);
        } else {
            if (rnnIntervalRef.current) clearInterval(rnnIntervalRef.current);
        }
        return () => { if (rnnIntervalRef.current) clearInterval(rnnIntervalRef.current); };
    }, [isRnnPlaying]);

    const resetRnn = () => {
        setIsRnnPlaying(false);
        setRnnStep(0);
    };

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Cpu size={16} className="text-indigo-400" />
                Execution Mode: RNN (Sequential) vs. Transformer (Parallel)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* RNN Panel */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">RNN Sequential Step</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsRnnPlaying(!isRnnPlaying)} 
                                className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300"
                            >
                                {isRnnPlaying ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                            <button onClick={resetRnn} className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300">
                                <RotateCcw size={12} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-around items-center h-28 relative">
                        {tokens.map((t, idx) => {
                            const isProcessed = rnnStep > idx;
                            const isCurrent = rnnStep === idx;
                            return (
                                <div key={`rnn-${idx}`} className="flex flex-col items-center relative z-10">
                                    <div className={`w-12 h-12 rounded-lg border flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                                        isCurrent ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.4)]' :
                                        isProcessed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                        'bg-slate-900 border-slate-800 text-slate-500'
                                    }`}>
                                        {t}
                                    </div>
                                    <span className="text-[9px] text-slate-500 mt-1">t = {idx+1}</span>
                                </div>
                            );
                        })}

                        {/* Connection line */}
                        <div className="absolute left-8 right-8 h-0.5 bg-slate-800 top-[40px] -z-0" />
                        {rnnStep > 0 && (
                            <motion.div 
                                className="absolute h-0.5 bg-emerald-500 top-[40px] left-8"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(rnnStep, tokens.length - 1) * 28}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans min-h-[30px]">
                        {rnnStep === 0 && "Waiting to start. RNN processes tokens one at a time."}
                        {rnnStep > 0 && rnnStep <= tokens.length && `Processing token "${tokens[rnnStep-1]}". Dependency on previous hidden state h_${rnnStep-1} blocks parallel computation.`}
                        {rnnStep > tokens.length && "Finished. Information must travel step-by-step through the entire network sequence length."}
                    </p>
                </div>

                {/* Transformer Panel */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Transformer Parallel Attention</span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded font-mono">O(1) Pathways</span>
                    </div>

                    <div className="flex justify-around items-center h-28 relative">
                        {tokens.map((t, idx) => (
                            <div key={`trans-${idx}`} className="flex flex-col items-center relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-mono text-xs shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                                    {t}
                                </div>
                                <span className="text-[9px] text-slate-400 mt-1">t = All</span>
                            </div>
                        ))}

                        {/* All-to-all attention lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                            <path d="M 40 50 Q 120 15 200 50 M 40 50 Q 180 -10 320 50 M 120 50 Q 220 10 320 50 M 40 50 L 120 50 L 200 50 L 320 50" fill="none" stroke="#845ef7" strokeWidth="1" strokeDasharray="3 3" />
                        </svg>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                        All tokens processed simultaneously. Self-attention routes connections directly between any token pair in a single step, bypassing time-based sequence steps entirely.
                    </p>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 2: Attention Mechanism Deep Dive
   ========================================================================= */

const SoftmaxVarianceWidget: React.FC = () => {
    const [d_k, setD_k] = useState(64);
    const [useScaling, setUseScaling] = useState(true);

    const getDistribution = () => {
        // Mocking a dot product distribution of size 8
        // Variance is d_k if unscaled, 1 if scaled
        const variance = useScaling ? 1.0 : d_k;
        const stdDev = Math.sqrt(variance);

        // Pre-defined random raw inputs sampled from N(0, d_k)
        const baseInputs = [-0.8, 1.2, -0.3, 2.1, -1.5, 0.4, 0.9, -0.1];
        
        // Scale inputs based on variance requirement
        // standard input = base * stdDev
        const inputs = baseInputs.map(x => x * (useScaling ? 1.0 : stdDev));

        // Softmax computation
        const exps = inputs.map(x => Math.exp(x));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(e => e / sumExp);

        return { inputs, probs };
    };

    const { inputs, probs } = getDistribution();

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Scale size={16} className="text-emerald-400" />
                Softmax Saturation Visualizer (Scaling Factor: 1 / √{d_k})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Key Dimension ($d_k$):</span>
                            <span className="font-mono text-emerald-400 font-bold">{d_k}</span>
                        </label>
                        <input 
                            type="range" min="16" max="256" step="16"
                            value={d_k} 
                            onChange={e => setD_k(parseInt(e.target.value))} 
                            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setUseScaling(true)}
                            className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] transition-all border ${
                                useScaling 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            SCALED (√d_k)
                        </button>
                        <button
                            onClick={() => setUseScaling(false)}
                            className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] transition-all border ${
                                !useScaling 
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            UNSCALED
                        </button>
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400">
                        <div className="flex justify-between">
                            <span>Input Variance:</span>
                            <span className="text-white font-bold">{useScaling ? "1.00" : d_k.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Max Probability:</span>
                            <span className="text-white font-bold">{(Math.max(...probs) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                {/* Plot Panel */}
                <div className="col-span-2 bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-end h-32 relative">
                    <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">Softmax Output Probability Distribution</div>
                    
                    <div className="flex justify-around items-end h-20 w-full">
                        {probs.map((p, idx) => (
                            <div key={`prob-bar-${idx}`} className="flex flex-col items-center w-full group relative">
                                {/* Hover tooltip */}
                                <div className="absolute bottom-full mb-1 bg-slate-900 border border-slate-800 text-white font-mono text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    in: {inputs[idx].toFixed(2)}<br/>
                                    prob: {p.toFixed(3)}
                                </div>
                                <div 
                                    className={`w-5 rounded-t transition-all duration-300 ${
                                        useScaling ? 'bg-emerald-500/60 group-hover:bg-emerald-400' : 'bg-red-500/60 group-hover:bg-red-400'
                                    }`}
                                    style={{ height: `${p * 60}px` }}
                                />
                                <span className="text-[8px] text-slate-500 font-mono mt-1">K_{idx}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Notice that without scaling (Unscaled), the inputs to the softmax have high variance ($\sigma^2 = d_k$), causing one token to monopolize the distribution (100% saturation). This kills the gradients for all other elements. Scaling by $1/\sqrt{d_k}$ compresses the variance to 1.0, preserving multiple soft activations and enabling continuous gradient flow.
            </p>
        </Card>
    );
};

/* =========================================================================
   SECTION 3: Multi-Head Attention
   ========================================================================= */

const MhaProjectionWidget: React.FC = () => {
    const [mode, setMode] = useState<'mha' | 'gqa' | 'mqa'>('mha');

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Sliders size={16} className="text-violet-400" />
                Query-Key-Value Sharing Layout: MHA vs. GQA vs. MQA
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex flex-col gap-2">
                    {(['mha', 'gqa', 'mqa'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`py-2 px-3 rounded text-left font-mono font-bold text-[10px] transition-all border ${
                                mode === m 
                                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            {m.toUpperCase()}
                        </button>
                    ))}

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 text-[9px] font-sans text-slate-500 leading-relaxed mt-2">
                        {mode === 'mha' && "MHA: Every query head has an independent key and value head. Maximum representation ability, high memory footprint."}
                        {mode === 'gqa' && "GQA: Query heads are grouped. Each group shares a single Key and Value head. Highly efficient, standard in LLaMA-3."}
                        {mode === 'mqa' && "MQA: All query heads share a single Key and Value head. Lowest KV cache size, but slightly compromised performance."}
                    </div>
                </div>

                <div className="col-span-3 bg-slate-950 p-4 rounded-xl border border-slate-850 h-40 flex items-center justify-around relative overflow-hidden">
                    {/* Left queries column */}
                    <div className="flex flex-col gap-1.5 z-10">
                        <span className="text-[8px] text-slate-500 font-mono text-center">Queries (Q)</span>
                        {[...Array(8)].map((_, i) => (
                            <div key={`q-head-${i}`} className="w-8 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-center font-mono text-[8px] text-rose-300">
                                H_{i+1}
                            </div>
                        ))}
                    </div>

                    {/* Middle keys column */}
                    <div className="flex flex-col gap-1.5 z-10">
                        <span className="text-[8px] text-slate-500 font-mono text-center">Keys (K)</span>
                        {mode === 'mha' && [...Array(8)].map((_, i) => (
                            <div key={`k-head-mha-${i}`} className="w-8 py-0.5 rounded bg-teal-500/20 border border-teal-500/40 text-center font-mono text-[8px] text-teal-300">
                                K_{i+1}
                            </div>
                        ))}
                        {mode === 'gqa' && [...Array(2)].map((_, i) => (
                            <div key={`k-head-gqa-${i}`} className="w-8 py-4 rounded bg-teal-500/20 border border-teal-500/40 text-center font-mono text-[8px] text-teal-300">
                                GK_{i+1}
                            </div>
                        ))}
                        {mode === 'mqa' && (
                            <div className="w-8 py-10 rounded bg-teal-500/20 border border-teal-500/40 text-center font-mono text-[8px] text-teal-300">
                                Single K
                            </div>
                        )}
                    </div>

                    {/* Right values column */}
                    <div className="flex flex-col gap-1.5 z-10">
                        <span className="text-[8px] text-slate-500 font-mono text-center">Values (V)</span>
                        {mode === 'mha' && [...Array(8)].map((_, i) => (
                            <div key={`v-head-mha-${i}`} className="w-8 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-center font-mono text-[8px] text-sky-300">
                                V_{i+1}
                            </div>
                        ))}
                        {mode === 'gqa' && [...Array(2)].map((_, i) => (
                            <div key={`v-head-gqa-${i}`} className="w-8 py-4 rounded bg-sky-500/20 border border-sky-500/40 text-center font-mono text-[8px] text-sky-300">
                                GV_{i+1}
                            </div>
                        ))}
                        {mode === 'mqa' && (
                            <div className="w-8 py-10 rounded bg-sky-500/20 border border-sky-500/40 text-center font-mono text-[8px] text-sky-300">
                                Single V
                            </div>
                        )}
                    </div>

                    {/* Connectivity links */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                        {mode === 'mha' && [...Array(8)].map((_, i) => (
                            <path key={`line-mha-${i}`} d={`M 90 ${32 + i*16} L 180 ${32 + i*16} M 180 ${32 + i*16} L 270 ${32 + i*16}`} fill="none" stroke="#ffffff" strokeWidth="1" />
                        ))}
                        {mode === 'gqa' && [...Array(8)].map((_, i) => {
                            const groupIdx = Math.floor(i / 4);
                            const kY = groupIdx === 0 ? 50 : 110;
                            return (
                                <g key={`line-gqa-${i}`}>
                                    <path d={`M 90 ${32 + i*16} L 180 ${kY}`} fill="none" stroke="#ffffff" strokeWidth="1" />
                                    <path d={`M 180 ${kY} L 270 ${kY}`} fill="none" stroke="#ffffff" strokeWidth="1" />
                                </g>
                            );
                        })}
                        {mode === 'mqa' && [...Array(8)].map((_, i) => (
                            <g key={`line-mqa-${i}`}>
                                <path d={`M 90 ${32 + i*16} L 180 80`} fill="none" stroke="#ffffff" strokeWidth="1" />
                                <path d="M 180 80 L 270 80" fill="none" stroke="#ffffff" strokeWidth="1" />
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 4: Positional Encoding
   ========================================================================= */

const RoPERotationCircle: React.FC = () => {
    const [pos, setPos] = useState(1);
    const [theta, setTheta] = useState(45); // angle in degrees

    const rad = (pos * theta * Math.PI) / 180;
    const x = 70 * Math.cos(rad);
    const y = -70 * Math.sin(rad);

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <RotateCcw size={16} className="text-indigo-400" />
                Rotary Positional Embedding (RoPE) 2D Orthogonal Rotation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Sequence Position ($m$):</span>
                            <span className="font-mono text-indigo-400 font-bold">{pos}</span>
                        </label>
                        <input 
                            type="range" min="0" max="8" step="1"
                            value={pos} 
                            onChange={e => setPos(parseInt(e.target.value))} 
                            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Base Frequency Angle ($\theta$):</span>
                            <span className="font-mono text-indigo-400 font-bold">{theta}°</span>
                        </label>
                        <input 
                            type="range" min="15" max="90" step="15"
                            value={theta} 
                            onChange={e => setTheta(parseInt(e.target.value))} 
                            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400">
                        <div className="text-white font-bold mb-1">Rotation Matrix:</div>
                        <MathEquation formula={`\\mathbf{R}_{\\theta, m} = \\begin{pmatrix} \\cos(${pos} \\cdot ${theta}^\\circ) & -\\sin(${pos} \\cdot ${theta}^\\circ) \\\\ \\sin(${pos} \\cdot ${theta}^\\circ) & \\cos(${pos} \\cdot ${theta}^\\circ) \\end{pmatrix}`} />
                        <div className="mt-2 text-white font-bold">Vector position:</div>
                        <div>Angle: {(pos * theta)}° ({(rad).toFixed(3)} rad)</div>
                    </div>
                </div>

                <div className="flex justify-center bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <svg width="180" height="180">
                        {/* Circle boundary */}
                        <circle cx="90" cy="90" r="70" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                        <line x1="10" y1="90" x2="170" y2="90" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="90" y1="10" x2="90" y2="170" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

                        {/* Base vector reference (pos 0) */}
                        <line x1="90" y1="90" x2="160" y2="90" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                        <text x="162" y="94" fill="#475569" fontSize="8" className="font-mono">pos=0</text>

                        {/* Rotated query vector */}
                        <motion.line 
                            x1="90" y1="90" x2={90 + x} y2={90 + y} 
                            stroke="#845ef7" strokeWidth="2.5" 
                        />
                        <circle cx={90 + x} cy={90 + y} r="4" fill="#a78bfa" />
                        <text x={90 + x + (x >= 0 ? 5 : -15)} y={90 + y + (y >= 0 ? -5 : 12)} fill="#a78bfa" fontSize="9" fontWeight="bold" className="font-mono">q_m</text>
                    </svg>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   PART 1 EXPORT COMPONENT
   ========================================================================= */

export const Part1_CoreAttention: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION 1 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Brain size={22} className="text-indigo-400" />}>
                    Section 1: The Problem With Sequences — Motivation for Transformers
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Prior to 2017, sequence modeling relied on recurrent neural networks (RNNs, LSTMs) or convolutional networks (CNNs). Both architectures enforce computational tradeoffs that restrict their capacity to scale to ultra-long contexts.
                    </p>

                    <h4 className="text-white font-bold text-md mt-4">1.1 Real-World Analogy: Scanning a Stack vs. File Directory</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Imagine searching for a specific transaction on a bank statement.
                        <br/>
                        An **RNN** operates like reading the bank statement line-by-line from top to bottom. If you want to check line 100, you must read the first 99 lines. By the time you reach the bottom, your working memory of the top lines has degraded (vanishing gradients).
                        <br/>
                        A **Transformer** acts like searching a database index. You input a **Query** (specific search term) and match it against all **Keys** (index items) in parallel, directly fetching the correct **Value** (transaction detail) in a single step, regardless of whether it resides on line 1 or line 10,000.
                    </p>
                </Card>

                <RNNvsTransformerWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">1.2 Limitations of Predecessors</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                                <AlertTriangle size={14} /> RNN Limitations
                            </span>
                            <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1">
                                <li>{"**Sequential Bottleneck**: Hidden state $h_t = f(h_{t-1}, x_t)$ forces step-by-step evaluation, blocking parallel training."}</li>
                                <li>**Vanishing Gradients**: Long dependencies fade as gradients multiply through long temporal chains.</li>
                                <li>**Hidden Bottleneck**: Compressing a variable-length sequence into a single fixed vector $h_t$ creates an information bottleneck.</li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                                <AlertTriangle size={14} /> CNN Limitations
                            </span>
                            <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1">
                                <li>**Local Receptive Field**: Convolution kernels only capture local dependencies in early layers.</li>
                                <li>**Logarithmic Paths**: Connecting distant tokens requires stacking multiple layers, scaling as $O(\log_k n)$ with a k-ary receptive tree.</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">1.3 Path Length & Complexity Analysis</h4>
                    <p className="text-slate-350 text-sm">
                        The Transformer replaces recurrence and convolution entirely with self-attention. This change dramatically improves path lengths and computational properties:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono">
                                    <th className="pb-3 px-4">Layer Type</th>
                                    <th className="pb-3 px-4">Complexity per Layer</th>
                                    <th className="pb-3 px-4">Sequential Operations</th>
                                    <th className="pb-3 px-4">Maximum Path Length</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-slate-400">
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Self-Attention</td>
                                    <td className="py-3 px-4 font-mono">$O(n^2 \cdot d)$</td>
                                    <td className="py-3 px-4 font-mono">$O(1)$</td>
                                    <td className="py-3 px-4 font-mono">$O(1)$</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Recurrent</td>
                                    <td className="py-3 px-4 font-mono">$O(n \cdot d^2)$</td>
                                    <td className="py-3 px-4 font-mono">$O(n)$</td>
                                    <td className="py-3 px-4 font-mono">$O(n)$</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Convolutional</td>
                                    <td className="py-3 px-4 font-mono">$O(k \cdot n \cdot d^2)$</td>
                                    <td className="py-3 px-4 font-mono">$O(1)$</td>
                                    <td className="py-3 px-4 font-mono">$O(\log_k n)$</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h5 className="text-white font-semibold text-sm mt-4">Proof of Permutation Equivariance</h5>
                    <p className="text-slate-350 text-xs">
                        Without positional information, a self-attention layer is permutation equivariant. If we permute the input sequence by a permutation matrix $P$, the output is permuted by the exact same matrix $P$.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                        {"Let $A(Q,K,V) = \\text{softmax}(QK^T / \\sqrt{d_k})V$."}
                        <br/>
                        For any permutation matrix $P$, we have:
                        <br/>
                        {"$A(PQ, PK, PV) = \\text{softmax}((PQ)(PK)^T / \\sqrt{d_k})(PV)$"}
                        <br/>
                        Since $P^T P = I$ for a permutation matrix:
                        <br/>
                        {"$A(PQ, PK, PV) = \\text{softmax}(P Q K^T P^T / \\sqrt{d_k}) P V = P \\text{softmax}(Q K^T / \\sqrt{d_k}) V = P \\cdot A(Q,K,V)$."}
                    </div>
                </Card>
            </section>

            {/* ─── SECTION 2 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Zap size={22} className="text-emerald-400" />}>
                    Section 2: Attention Mechanism — Deep Dive
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">2.1 Intuition: Soft Dictionary Lookup</h4>
                    <p className="text-slate-350 text-sm">
                        In computer science, a dictionary lookup is **hard**: we seek an exact key match to pull a value.
                        <MathEquation formula="\text{Lookup}(q, \mathbf{K}, \mathbf{V}) = \mathbf{V}[\operatorname{argmax}_i(q == k_i)]" block />
                        Self-attention computes a **soft** dictionary lookup. It measures similarity scores across all keys and scales them into a probability distribution via softmax, returning a weighted average of all values.
                        <MathEquation formula="\text{SoftLookup}(q, \mathbf{K}, \mathbf{V}) = \sum_i \operatorname{softmax}\left(\frac{q \cdot k_i}{\tau}\right) v_i" block />
                    </p>
                </Card>

                <SoftmaxVarianceWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">2.2 Mathematical Formulations & Saturation Proof</h4>
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                        <h5 className="text-white font-bold text-sm mb-2">Scaled Dot-Product Attention</h5>
                        <MathEquation formula="\operatorname{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \operatorname{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}}\right)\mathbf{V}" block />
                        
                        <div className="mt-4 overflow-x-auto text-[11px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono">
                                        <th className="pb-1.5">Symbol</th>
                                        <th className="pb-1.5">Dimensions</th>
                                        <th className="pb-1.5">Meaning</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300 font-mono">
                                    <tr>
                                        <td>{"$\\mathbf{Q}$"}</td>
                                        <td>{"$\\mathbb{R}^{n \\times d_k}$"}</td>
                                        <td>Queries matrix ($n$ sequence tokens)</td>
                                    </tr>
                                    <tr>
                                        <td>{"$\\mathbf{K}$"}</td>
                                        <td>{"$\\mathbb{R}^{m \\times d_k}$"}</td>
                                        <td>Keys matrix ($m$ context tokens)</td>
                                    </tr>
                                    <tr>
                                        <td>{"$\\mathbf{V}$"}</td>
                                        <td>{"$\\mathbb{R}^{m \\times d_v}$"}</td>
                                        <td>Values matrix containing representations</td>
                                    </tr>
                                    <tr>
                                        <td>{"$d_k$"}</td>
                                        <td>Scalar</td>
                                        <td>Dimensionality of queries and keys</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h5 className="text-white font-semibold text-sm mt-4">Variance Saturation Proof</h5>
                    <p className="text-slate-350 text-xs">
                        {"Let query component $q_a \\sim \\mathcal{N}(0, 1)$ and key component $k_a \\sim \\mathcal{N}(0, 1)$ be independent random variables."}
                        The dot product is:
                        <MathEquation formula="q \cdot k = \sum_{a=1}^{d_k} q_a k_a" block />
                        Since they are independent:
                        <MathEquation formula="\mathbb{E}[q \cdot k] = \sum_{a=1}^{d_k} \mathbb{E}[q_a] \mathbb{E}[k_a] = 0" block />
                        The variance of the product of two independent zero-mean unit-variance variables is:
                        <MathEquation formula="\operatorname{Var}(q_a k_a) = \mathbb{E}[q_a^2 k_a^2] - \mathbb{E}[q_a k_a]^2 = \mathbb{E}[q_a^2]\mathbb{E}[k_a^2] - 0 = (1)(1) = 1" block />
                        Summing over $d_k$ independent dimensions yields:
                        <MathEquation formula="\operatorname{Var}(q \cdot k) = \sum_{a=1}^{d_k} \operatorname{Var}(q_a k_a) = d_k" block />
                        Thus, the variance grows linearly with dimension size $d_k$. If $d_k$ is large, the inputs to softmax will contain massive differences.
                        Softmax gradients collapse under high magnitude inputs, as:
                        <MathEquation formula="\frac{\partial \operatorname{softmax}(z)_i}{\partial z_j} = \operatorname{softmax}(z)_i(\delta_{ij} - \operatorname{softmax}(z)_j)" block />
                        {"If one score dominates, its softmax probability approaches 1 and others approach 0, zeroing out the gradient product. Scaling by $1/\\sqrt{d_k}$ yields a unit variance:"}
                        <MathEquation formula="\operatorname{Var}\left(\frac{q \cdot k}{\sqrt{d_k}}\right) = \frac{1}{d_k} \operatorname{Var}(q \cdot k) = 1" block />
                        This stabilizes optimization.
                    </p>
                </Card>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">2.3 Masking & Connection to Kernel Regression</h4>
                    <p className="text-slate-350 text-sm">
                        To preserve causality in decoder blocks, a causal look-ahead mask is added to the scaled dot-product:
                        <MathEquation formula="\operatorname{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}, \mathbf{M}) = \operatorname{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^T + \mathbf{M}}{\sqrt{d_k}}\right)\mathbf{V}" block />
                        {"where $\\mathbf{M}_{ij} = 0$ if $j \\le i$, and $-\\infty$ if $j > i$."}
                    </p>
                    <p className="text-slate-350 text-sm">
                        Self-attention is also equivalent to **Nadaraya-Watson Kernel Regression**. The attention weights behave as a normalized similarity kernel:
                        <MathEquation formula="f(q) = \frac{\sum_j \kappa(q, k_j) v_j}{\sum_j \kappa(q, k_j)}" block />
                        {"where the exponential kernel is $\\kappa(q, k) = \\exp(q \\cdot k / \\sqrt{d_k})$."}
                    </p>

                    <h5 className="text-white font-semibold text-sm mt-4">Worked Numerical Example: Concrete Attention Trace</h5>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                        <div>
                            {"**Inputs**: $n=2$, $d_k=2$."}
                            <br/>
                            {"$\\mathbf{Q} = \\begin{pmatrix} 1.0 & 2.0 \\\\ 0.0 & 1.0 \\end{pmatrix}, \\quad \\mathbf{K} = \\begin{pmatrix} 2.0 & 0.0 \\\\ 1.0 & 1.0 \\end{pmatrix}, \\quad \\mathbf{V} = \\begin{pmatrix} 10.0 \\\\ 20.0 \\end{pmatrix}$"}
                        </div>
                        <div>
                            {"**1. Dot product $\\mathbf{Q}\\mathbf{K}^T$**:"}
                            <br/>
                            {"$\\mathbf{Q}\\mathbf{K}^T = \\begin{pmatrix} (1 \\cdot 2) + (2 \\cdot 0) & (1 \\cdot 1) + (2 \\cdot 1) \\\\ (0 \\cdot 2) + (1 \\cdot 0) & (0 \\cdot 1) + (1 \\cdot 1) \\end{pmatrix} = \\begin{pmatrix} 2.0 & 3.0 \\\\ 0.0 & 1.0 \\end{pmatrix}$"}
                        </div>
                        <div>
                            {"**2. Scale by $\\sqrt{d_k} = \\sqrt{2} \\approx 1.414$**:"}
                            <br/>
                            {"$\\mathbf{S} = \\begin{pmatrix} 2.0 / 1.414 & 3.0 / 1.414 \\\\ 0.0 / 1.414 & 1.0 / 1.414 \\end{pmatrix} \\approx \\begin{pmatrix} 1.414 & 2.121 \\\\ 0.0 & 0.707 \\end{pmatrix}$"}
                        </div>
                        <div>
                            **3. Row Softmax**:
                            <br/>
                            {"Row 0: $e^{1.414} \\approx 4.112$, $e^{2.121} \\approx 8.339$. Sum = 12.451."}
                            <br/>
                            {"Probs: $[4.112 / 12.451, 8.339 / 12.451] \\approx [0.33, 0.67]$."}
                            <br/>
                            {"Row 1: $e^{0} = 1.0$, $e^{0.707} \\approx 2.028$. Sum = 3.028."}
                            <br/>
                            {"Probs: $[1.0 / 3.028, 2.028 / 3.028] \\approx [0.33, 0.67]$."}
                        </div>
                        <div>
                            {"**4. Weighted output $\\mathbf{Z} = \\mathbf{A}\\mathbf{V}$**:"}
                            <br/>
                            {"$\\mathbf{Z} = \\begin{pmatrix} 0.33 & 0.67 \\\\ 0.33 & 0.67 \\end{pmatrix} \\begin{pmatrix} 10.0 \\\\ 20.0 \\end{pmatrix} = \\begin{pmatrix} (0.33 \\cdot 10) + (0.67 \\cdot 20) \\\\ (0.33 \\cdot 10) + (0.67 \\cdot 20) \\end{pmatrix} = \\begin{pmatrix} 16.7 \\\\ 16.7 \\end{pmatrix}$"}
                        </div>
                    </div>
                </Card>
            </section>

            {/* ─── SECTION 3 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Sliders size={22} className="text-violet-400" />}>
                    Section 3: Multi-Head Attention
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-350 text-sm">
                        Single-head attention forces the network to average representations across all tokens, which can blur distinct syntactic relationships. Multi-Head Attention projects features into multiple representation subspaces, allowing heads to specialize in parallel.
                    </p>

                    <h4 className="text-white font-bold text-md mt-4">3.1 Real-World Analogy: Multiple Camera Angles</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Imagine analyzing a high-stakes football play. 
                        If you only have one camera pointing at the field (Single-head), you must choose whether to follow the quarterback, the wide receiver, or the block line. 
                        By having multiple cameras (Multi-Head), one camera focuses on the quarterback's footwork (syntactic structure), another tracks the receiver's path (semantic mapping), and a third monitors defensive coverage (positional tracking). 
                        All views are combined at the end to get the full picture.
                    </p>
                </Card>

                <MhaProjectionWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">3.2 Mathematical Subspace Formulations</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                        <MathEquation formula="\operatorname{MultiHead}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \operatorname{Concat}(\text{head}_1, \dots, \text{head}_h)\mathbf{W}^O" block />
                        <div className="text-center text-xs text-slate-500 my-1">where each individual head is:</div>
                        <MathEquation formula="\text{head}_i = \operatorname{Attention}(\mathbf{Q}\mathbf{W}_i^Q, \mathbf{K}\mathbf{W}_i^K, \mathbf{V}\mathbf{W}_i^V)" block />
                        
                        <div className="mt-4 overflow-x-auto text-[10px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono">
                                        <th className="pb-1">Projection Matrix</th>
                                        <th className="pb-1">Dimensions</th>
                                        <th className="pb-1">Meaning</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300 font-mono">
                                    <tr>
                                        <td>{"$\\mathbf{W}_i^Q$"}</td>
                                        <td>{"$\\mathbb{R}^{d_{\\text{model}} \\times d_k}$"}</td>
                                        <td>Query projection matrix for head $i$</td>
                                    </tr>
                                    <tr>
                                        <td>{"$\\mathbf{W}_i^K$"}</td>
                                        <td>{"$\\mathbb{R}^{d_{\\text{model}} \\times d_k}$"}</td>
                                        <td>Key projection matrix for head $i$</td>
                                    </tr>
                                    <tr>
                                        <td>{"$\\mathbf{W}_i^V$"}</td>
                                        <td>{"$\\mathbb{R}^{d_{\\text{model}} \\times d_v}$"}</td>
                                        <td>Value projection matrix for head $i$</td>
                                    </tr>
                                    <tr>
                                        <td>{"$\\mathbf{W}^O$"}</td>
                                        <td>{"$\\mathbb{R}^{h \\cdot d_v \\times d_{\\text{model}}}$"}</td>
                                        <td>Output projection matrix aggregating all heads</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h4 className="text-white font-bold text-md mt-4">3.3 Modern KV Cache Sharing Layouts (MQA, GQA, MLA)</h4>
                    <p className="text-slate-350 text-sm">
                        During generation, keys and values must be cached for all previous tokens (the **KV Cache**), which consumes massive memory. Modern architectures implement compressed attention layouts:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1.5">
                        <li>**Multi-Query Attention (MQA)**: Shares a single key and value head across all query heads. This yields maximum memory compression, but can limit generation performance.</li>
                        <li>**Grouped-Query Attention (GQA)**: Divides query heads into groups. Each group shares a single key and value head. This balances memory and representation capacity.</li>
                        <li>**Multi-Head Latent Attention (MLA)**: Implemented in DeepSeek models. Compresses Keys and Values into a low-rank latent subspace during caching, decomposing them on-the-fly for attention calculations. Saves cache memory without degradation.</li>
                    </ul>
                </Card>
            </section>

            {/* ─── SECTION 4 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<RotateCcw size={22} className="text-indigo-400" />}>
                    Section 4: Positional Encoding
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-350 text-sm">
                        Because self-attention operates as a set-to-set function, it is completely invariant to word order. To model sequence structure, we must explicitly inject position vectors.
                    </p>

                    <h4 className="text-white font-bold text-md mt-4">4.1 Real-World Analogy: Envelope Serial Numbers</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Imagine sending a letter divided into 10 separate envelopes. 
                        If you mail them without any marks, the recipient receives them as an unordered pile. 
                        To solve this, you stamp a serial number (1/10, 2/10, etc.) on each envelope. 
                        This is **Absolute Positional Encoding**.
                        Alternatively, you can write instructions relative to other pages, e.g., "this page immediately follows page A". This represents **Relative Positional Encoding**.
                    </p>
                </Card>

                <RoPERotationCircle />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">4.2 Sinusoidal Positional Encoding (Absolute)</h4>
                    <p className="text-slate-350 text-sm">
                        Vaswani et al. (2017) utilized static sinusoidal functions:
                        <MathEquation formula="\begin{aligned} PE_{(pos, 2i)} &= \sin\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right) \\ PE_{(pos, 2i+1)} &= \cos\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right) \end{aligned}" block />
                    </p>
                    <h5 className="text-white font-semibold text-xs mt-2">Why Sinusoids? The Translation Projection Proof</h5>
                    <p className="text-slate-350 text-xs">
                        {"This formula allows the model to learn to attend by relative positions easily. For any fixed offset $k$, the positional encoding $PE_{(pos+k)}$ can be represented as a linear projection of $PE_{(pos)}$:"}
                        <MathEquation formula="PE_{(pos+k)} = \mathbf{M}_k PE_{(pos)}" block />
                        {"where $\\mathbf{M}_k$ is a block-diagonal rotation matrix:"}
                        <MathEquation formula="\begin{pmatrix} \sin(a+b) \\ \cos(a+b) \end{pmatrix} = \begin{pmatrix} \cos(b) & \sin(b) \\ -\sin(b) & \cos(b) \end{pmatrix} \begin{pmatrix} \sin(a) \\ \cos(a) \end{pmatrix}" block />
                        This means the dot product of two positional encodings depends only on their relative distance $k$.
                    </p>
                </Card>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">4.3 Rotary Position Embeddings (RoPE)</h4>
                    <p className="text-slate-350 text-sm">
                        RoPE (Su et al., 2021) is the standard positional method for modern models (LLaMA, Mistral, Qwen). Instead of *adding* positional encodings to token embeddings, RoPE applies a rotation to queries and keys in 2D planes:
                        <MathEquation formula="\mathbf{R}_{\theta, m} \mathbf{q}_m = \begin{pmatrix} \cos m\theta & -\sin m\theta \\ \sin m\theta & \cos m\theta \end{pmatrix} \begin{pmatrix} q_0 \\ q_1 \end{pmatrix}" block />
                        Applying this rotation to $Q$ and $K$ means that their dot product is invariant to absolute translation and encodes relative distance directly:
                        <MathEquation formula="\langle \mathbf{R}_m \mathbf{q}, \mathbf{R}_n \mathbf{k} \rangle = \mathbf{q}^T \mathbf{R}_{n-m} \mathbf{k}" block />
                    </p>
                </Card>
            </section>

            {/* ─── PYTORCH CODEBOX ───────────────────────────────────── */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Terminal size={20} className="text-indigo-400" />
                    Part 1 Reference PyTorch Implementations
                </h4>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
{`import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, dropout: float = 0.0):
        super().__init__()
        self.dropout = nn.Dropout(dropout)

    def forward(self, q, k, v, mask=None):
        # Dimensionality analysis:
        # q: [Batch, Heads, Seq_Len_Q, Dim_Key]
        # k: [Batch, Heads, Seq_Len_K, Dim_Key]
        # v: [Batch, Heads, Seq_Len_K, Dim_Val]
        d_k = q.size(-1)
        
        # 1. Similarity mapping
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)
        
        # 2. Apply optional causal or padding mask
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
            
        # 3. Softmax activation
        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        
        # 4. Values aggregation
        output = torch.matmul(attn_weights, v)
        return output, attn_weights


class GroupedQueryAttention(nn.Module):
    def __init__(self, d_model: int, n_heads: int, n_kv_heads: int):
        super().__init__()
        assert n_heads % n_kv_heads == 0, "Query heads must be divisible by KV heads"
        self.d_model = d_model
        self.n_heads = n_heads
        self.n_kv_heads = n_kv_heads
        self.d_k = d_model // n_heads
        self.group_size = n_heads // n_kv_heads
        
        self.q_proj = nn.Linear(d_model, d_model, bias=False)
        self.k_proj = nn.Linear(d_model, n_kv_heads * self.d_k, bias=False)
        self.v_proj = nn.Linear(d_model, n_kv_heads * self.d_k, bias=False)
        self.out_proj = nn.Linear(d_model, d_model, bias=False)
        self.attn = ScaledDotProductAttention()

    def forward(self, x, mask=None):
        B, S, _ = x.shape
        
        # Project and reshape:
        # q: [B, n_heads, S, d_k]
        # k, v: [B, n_kv_heads, S, d_k]
        q = self.q_proj(x).view(B, S, self.n_heads, self.d_k).transpose(1, 2)
        k = self.k_proj(x).view(B, S, self.n_kv_heads, self.d_k).transpose(1, 2)
        v = self.v_proj(x).view(B, S, self.n_kv_heads, self.d_k).transpose(1, 2)
        
        # Expand K, V to match Q heads by repeating groups
        # k, v: [B, n_kv_heads * group_size, S, d_k] -> [B, n_heads, S, d_k]
        k = k.repeat_interleave(self.group_size, dim=1)
        v = v.repeat_interleave(self.group_size, dim=1)
        
        out, _ = self.attn(q, k, v, mask)
        out = out.transpose(1, 2).contiguous().view(B, S, self.d_model)
        return self.out_proj(out)`}
                </pre>
            </section>
        </div>
    );
};
