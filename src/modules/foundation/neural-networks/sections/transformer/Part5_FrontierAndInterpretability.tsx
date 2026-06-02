import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, 
    Layers, 
    Sliders, 
    Sparkles, 
    AlertTriangle, 
    Terminal, 
    BookOpen, 
    Award, 
    HelpCircle, 
    CheckCircle,
    Zap,
    Scale
} from 'lucide-react';
import { MathEquation } from '../../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../../components/SectionElements';

/* =========================================================================
   SECTION 15: State Space Models (SSMs)
   ========================================================================= */

const SsmVisualizerWidget: React.FC = () => {
    const [mode, setMode] = useState<'recurrent' | 'convolutional'>('recurrent');
    const [steps, setSteps] = useState<string[]>(["h_0 = 0"]);

    const runRecurrentStep = () => {
        setSteps(prev => {
            const nextIdx = prev.length;
            if (nextIdx > 4) return ["h_0 = 0"];
            return [...prev, `h_${nextIdx} = Ā h_${nextIdx-1} + B̄ u_${nextIdx}`];
        });
    };

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Cpu size={16} className="text-indigo-400" />
                State Space Model (SSM): Recurrent Step vs. Parallel Convolution
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => { setMode('recurrent'); setSteps(["h_0 = 0"]); }}
                        className={`py-2 px-3 rounded text-left font-mono font-bold text-[10px] transition-all border ${
                            mode === 'recurrent' 
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                                : 'bg-slate-900 text-slate-500 border-transparent'
                        }`}
                    >
                        RECURRENT MODE (Inference)
                    </button>
                    <button
                        onClick={() => setMode('convolutional')}
                        className={`py-2 px-3 rounded text-left font-mono font-bold text-[10px] transition-all border ${
                            mode === 'convolutional' 
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                                : 'bg-slate-900 text-slate-500 border-transparent'
                        }`}
                    >
                        CONVOLUTIONAL MODE (Training)
                    </button>

                    {mode === 'recurrent' && (
                        <button 
                            onClick={runRecurrentStep}
                            className="mt-2 py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded text-[10px]"
                        >
                            Step Recurrence
                        </button>
                    )}
                </div>

                <div className="col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex flex-col justify-center items-center space-y-3 font-mono text-[10px]">
                    {mode === 'recurrent' ? (
                        <div className="space-y-1 text-indigo-300">
                            {steps.map((st, idx) => <div key={idx}>&gt; {st}</div>)}
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <MathEquation formula="y = \\bar{\\mathbf{K}} * u" block />
                            <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                                Continuous systems can be unrolled during training into a single parallel convolution: <MathEquation formula="\\bar{K} = (C\\bar{B}, C\\bar{A}\\bar{B}, \\dots)" />, evaluated in <MathEquation formula="O(N \\log N)" /> time using Fast Fourier Transforms (FFT).
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 16: Multimodal Transformers
   ========================================================================= */

const VitPatchWidget: React.FC = () => {
    const [numPatches, setNumPatches] = useState(16);

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Sliders size={16} className="text-emerald-400" />
                Vision Transformer (ViT) Image Patch Tokenization
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-3 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Image Partition Patches (<MathEquation formula="N" />):</span>
                            <span className="font-mono text-emerald-400 font-bold">{numPatches}</span>
                        </label>
                        <input 
                            type="range" min="4" max="64" step="4"
                            value={numPatches} 
                            onChange={e => setNumPatches(parseInt(e.target.value))} 
                            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>
                </div>

                <div className="col-span-2 flex justify-center bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 items-center">
                    <div 
                        className="grid gap-1 border border-slate-800 p-1 bg-slate-900/60"
                        style={{
                            gridTemplateColumns: `repeat(${Math.sqrt(numPatches)}, minmax(0, 1fr))`
                        }}
                    >
                        {[...Array(numPatches)].map((_, idx) => (
                            <div key={`patch-${idx}`} className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-[7px] text-emerald-300 font-mono">
                                p_{idx+1}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 17: Reasoning Models
   ========================================================================= */

const GrpoAdvantageWidget: React.FC = () => {
    const [rewards, setRewards] = useState([1.5, 0.5, -0.5, 2.5]);

    const handleRewardChange = (idx: number, val: number) => {
        setRewards(prev => {
            const next = [...prev];
            next[idx] = val;
            return next;
        });
    };

    const mean = rewards.reduce((a, b) => a + b, 0) / rewards.length;
    const variance = rewards.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rewards.length;
    const stdDev = Math.sqrt(variance) || 1e-6;

    const advantages = rewards.map(r => (r - mean) / stdDev);

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Scale size={16} className="text-indigo-400" />
                Group Relative Policy Optimization (GRPO) Advantage Normalization
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs font-sans">
                <div className="space-y-3">
                    <span className="text-slate-400 font-bold block mb-1">Interactive Group Rewards:</span>
                    {rewards.map((r, idx) => (
                        <div key={`rew-in-${idx}`} className="flex justify-between items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">Output {idx+1}:</span>
                            <input 
                                type="range" min="-3.0" max="3.0" step="0.1"
                                value={r} 
                                onChange={e => handleRewardChange(idx, parseFloat(e.target.value))} 
                                className="w-32 accent-indigo-500 h-1 bg-slate-800 rounded" 
                            />
                            <span className="font-mono text-white font-bold w-8 text-right">{r.toFixed(1)}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-44 flex flex-col justify-center space-y-2 font-mono text-[9px] text-slate-400">
                    <span className="text-white font-bold">Relative Advantages (<MathEquation formula="A_i" />):</span>
                    {advantages.map((adv, idx) => (
                        <div key={`adv-out-${idx}`} className="flex justify-between">
                            <span>Output {idx+1}:</span>
                            <span className={adv >= 0 ? "text-emerald-400 font-bold" : "text-rose-400"}>
                                {adv >= 0 ? "+" : ""}{adv.toFixed(3)}
                            </span>
                        </div>
                    ))}
                    <div className="border-t border-slate-900 pt-1.5 flex justify-between text-[8px] text-slate-500">
                        <span>Group Mean: {mean.toFixed(2)}</span>
                        <span>Group StdDev: {stdDev.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 18: Fine-Tuning & Alignment
   ========================================================================= */

const LoraRankWidget: React.FC = () => {
    const [rank, setRank] = useState(8);

    const d_model = 4096;
    // Parameter counts
    const baseParams = d_model * d_model;
    const loraParams = 2 * d_model * rank;
    const ratio = baseParams / loraParams;

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Sliders size={16} className="text-emerald-400" />
                LoRA Rank Decomposition Parameter Compression Calculator
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>LoRA Target Rank (<MathEquation formula="r" />):</span>
                            <span className="font-mono text-emerald-400 font-bold">r = {rank}</span>
                        </label>
                        <input 
                            type="range" min="4" max="64" step="4"
                            value={rank} 
                            onChange={e => setRank(parseInt(e.target.value))} 
                            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400 space-y-1">
                        <div className="flex justify-between">
                            <span>Standard Linear Parameters:</span>
                            <span className="text-white font-bold">{(baseParams / 1e6).toFixed(2)} Million</span>
                        </div>
                        <div className="flex justify-between">
                            <span>LoRA (A + B) Parameters:</span>
                            <span className="text-white font-bold">{(loraParams / 1e3).toFixed(1)} Thousand</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex flex-col justify-center items-center space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-[9px]">Compression Ratio</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono">{ratio.toFixed(0)}x Fewer</span>
                    <p className="text-[9px] text-slate-500 text-center font-sans">
                        Instead of updating the full <MathEquation formula="d \\times d" /> weight matrix, LoRA trains two low-rank matrices <MathEquation formula="A" /> and <MathEquation formula="B" /> size <MathEquation formula="d \\times r" />, saving parameter storage.
                    </p>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 19: Mechanistic Interpretability
   ========================================================================= */

const LogitLensWidget: React.FC = () => {
    const [layer, setLayer] = useState(1);

    const layerPredictions = [
        { l: 1, top: "cat", prob: 0.12, second: "mat", sprob: 0.08 },
        { l: 2, top: "cat", prob: 0.28, second: "on", sprob: 0.14 },
        { l: 3, top: "cat", prob: 0.52, second: "the", sprob: 0.10 },
        { l: 4, top: "cat", prob: 0.94, second: "mat", sprob: 0.02 }
    ];

    const currentPred = layerPredictions.find(lp => lp.l === layer) || layerPredictions[0];

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Sliders size={16} className="text-indigo-400" />
                Logit Lens intermediate Layer Probability Projection
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Layer projection step (<MathEquation formula="l" />):</span>
                            <span className="font-mono text-indigo-400 font-bold">Layer {layer} / 4</span>
                        </label>
                        <input 
                            type="range" min="1" max="4" step="1"
                            value={layer} 
                            onChange={e => setLayer(parseInt(e.target.value))} 
                            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex flex-col justify-center space-y-2 font-mono text-[10px] text-slate-400">
                    <span className="text-white font-bold">Unembedded residual predictions:</span>
                    <div className="flex justify-between bg-slate-900/50 p-1.5 rounded border border-slate-900">
                        <span className="text-indigo-400 font-bold">1. {currentPred.top}</span>
                        <span>{(currentPred.prob * 100).toFixed(0)}% probability</span>
                    </div>
                    <div className="flex justify-between bg-slate-900/30 p-1.5 rounded border border-slate-900">
                        <span>2. {currentPred.second}</span>
                        <span>{(currentPred.sprob * 100).toFixed(0)}% probability</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 20: SOTA Leaderboard
   ========================================================================= */

const SotaLeaderboardWidget: React.FC = () => {
    const [sortBy, setSortBy] = useState<'mmlu' | 'math' | 'context'>('mmlu');

    const models = [
        { name: "Claude 3.7 Sonnet", mmlu: 89.2, math: 74.5, context: 200 },
        { name: "GPT-4o", mmlu: 88.7, math: 72.0, context: 128 },
        { name: "Gemini 1.5 Pro", mmlu: 85.9, math: 67.7, context: 2000 },
        { name: "DeepSeek-V3", mmlu: 88.5, math: 71.2, context: 128 }
    ];

    const sortedModels = [...models].sort((a, b) => b[sortBy] - a[sortBy]);

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Award size={16} className="text-emerald-400" />
                Frontier Transformer Benchmark Leaderboard (2024-2025)
            </h4>

            <div className="space-y-4">
                <div className="flex gap-2 justify-start flex-wrap">
                    {(['mmlu', 'math', 'context'] as const).map(field => (
                        <button
                            key={field}
                            onClick={() => setSortBy(field)}
                            className={`py-1.5 px-3 rounded font-mono font-bold text-[9px] transition-all border ${
                                sortBy === field 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            SORT BY {field.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto text-[10px] font-mono">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-550 uppercase">
                                <th className="pb-2 px-2">Model</th>
                                <th className="pb-2 px-2 text-right">MMLU (%)</th>
                                <th className="pb-2 px-2 text-right">MATH (%)</th>
                                <th className="pb-2 px-2 text-right">Context (k)</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-850/40">
                            {sortedModels.map((m, idx) => (
                                <tr key={`lead-${idx}`} className={idx === 0 ? "bg-emerald-500/5" : ""}>
                                    <td className="py-2.5 px-2 font-sans font-bold text-white">{m.name}</td>
                                    <td className="py-2.5 px-2 text-right">{m.mmlu.toFixed(1)}</td>
                                    <td className="py-2.5 px-2 text-right">{m.math.toFixed(1)}</td>
                                    <td className="py-2.5 px-2 text-right">{m.context >= 1000 ? `${m.context/1000}M` : `${m.context}k`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   PART 5 EXPORT COMPONENT
   ========================================================================= */

export const Part5_FrontierAndInterpretability: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION 15 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Cpu size={22} className="text-indigo-400" />}>
                    Section 15: State Space Models (SSMs) & Alternatives
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">15.1 Continuous-Time Systems & ZOH Discretization</h4>
                    <p className="text-slate-350 text-sm">
                        State Space Models map a 1D input sequence <MathEquation formula="u(t)" /> to a 1D output sequence <MathEquation formula="y(t)" /> through an <MathEquation formula="N" />-dimensional hidden state <MathEquation formula="x(t)" />:
                        <MathEquation formula="\\begin{aligned} x'(t) &= \\mathbf{A}x(t) + \\mathbf{B}u(t) \\\\ y(t) &= \\mathbf{C}x(t) + \\mathbf{D}u(t) \\end{aligned}" block />
                        To process discrete tokens, the continuous parameters are discretized using the Zero-Order Hold (ZOH) method with step size <MathEquation formula="\\Delta" />:
                        <MathEquation formula="\\bar{\\mathbf{A}} = \\exp(\\Delta \\mathbf{A}), \\quad \\bar{\\mathbf{B}} = (\\Delta \\mathbf{A})^{-1}(\\exp(\\Delta \\mathbf{A}) - \\mathbf{I}) \\cdot \\Delta \\mathbf{B}" block />
                        This unrolls into a recurrent step for fast inference:
                        <MathEquation formula="h_t = \\bar{\\mathbf{A}} h_{t-1} + \\bar{\\mathbf{B}} u_t, \\quad y_t = \\mathbf{C}h_t" block />
                    </p>
                </Card>

                <SsmVisualizerWidget />
            </section>

            {/* ─── SECTION 16 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Zap size={22} className="text-emerald-400" />}>
                    Section 16: Multimodal Transformers
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">16.1 Vision Transformers (ViT) & CLIP Contrastive Alignment</h4>
                    <p className="text-slate-350 text-sm">
                        Vision Transformers (ViT) process images by dividing them into <MathEquation formula="N" /> local patches of size <MathEquation formula="P \\times P \\times C" />. These patches are flattened and projected into token embeddings:
                        <MathEquation formula="\\mathbf{z}_0 = [\\mathbf{x}_{\\text{class}}; \\mathbf{x}_p \\mathbf{E}] + \\mathbf{E}_{\\text{pos}}" block />
                    </p>
                    <p className="text-slate-350 text-sm">
                        CLIP (Contrastive Language-Image Pretraining) aligns vision and text embeddings into a shared semantic subspace using a dual-encoder contrastive loss objective over a batch of <MathEquation formula="N" /> pairs:
                        <MathEquation formula="\\mathcal{L}_{\\text{CLIP}} = -\\frac{1}{N} \\sum_i \\log \\frac{e^{f(I_i)^T g(T_i) / \\tau}}{\\sum_j e^{f(I_i)^T g(T_j) / \\tau}}" block />
                    </p>
                </Card>

                <VitPatchWidget />
            </section>

            {/* ─── SECTION 17 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Scale size={22} className="text-indigo-400" />}>
                    Section 17: Reasoning Models & Test-Time Compute
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">17.1 Group Relative Policy Optimization (GRPO)</h4>
                    <p className="text-slate-350 text-sm">
                        GRPO (used in reasoning models like DeepSeek-R1) replaces standard actor-critic RL methods (PPO) by sampling a group of <MathEquation formula="G" /> outputs per prompt.
                        This eliminates the value-model critic, calculating advantages directly relative to the group mean and standard deviation:
                        <MathEquation formula="A_i = \\frac{r_i - \\operatorname{mean}(\\mathbf{r})}{\\operatorname{std}(\\mathbf{r})}" block />
                        The optimization loss is:
                        <MathEquation formula="\\mathcal{L}_{\\text{GRPO}} = \\frac{1}{G} \\sum_i \\min\\left( \\frac{\\pi_\\theta(o_i|q)}{\\pi_{\\theta_{\\text{old}}}(o_i|q)} A_i, \\operatorname{clip}\\left(\\frac{\\pi_\\theta(o_i|q)}{\\pi_{\\theta_{\\text{old}}}(o_i|q)}, 1-\\epsilon, 1+\\epsilon\\right) A_i \\right) - \\beta D_{\\text{KL}}(\\pi_\\theta \\mid\\mid \\pi_{\\text{ref}})" block />
                    </p>
                </Card>

                <GrpoAdvantageWidget />
            </section>

            {/* ─── SECTION 18 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Sliders size={22} className="text-emerald-400" />}>
                    Section 18: Fine-Tuning, PEFT & Alignment
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">18.1 Low-Rank Adaptation (LoRA)</h4>
                    <p className="text-slate-350 text-sm">
                        LoRA (Low-Rank Adaptation) updates model weights by adding a low-rank decomposed matrix product, leaving base weights <MathEquation formula="W_0" /> frozen:
                        <MathEquation formula="W = W_0 + \\Delta W = W_0 + \\mathbf{B}\\mathbf{A}" block />
                        where <MathEquation formula="\\mathbf{B} \\in \\mathbb{R}^{d \\times r}, \\mathbf{A} \\in \\mathbb{R}^{r \\times k}" />, with rank <MathEquation formula="r \\ll \\min(d, k)" />.
                    </p>
                </Card>

                <LoraRankWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">18.2 Direct Preference Optimization (DPO)</h4>
                    <p className="text-slate-350 text-sm">
                        DPO simplifies alignment by deriving a closed-form substitution that optimizes policies directly on preference pairs (<MathEquation formula="y_w, y_l" />) without training a separate reward model:
                        <MathEquation formula="\\mathcal{L}_{\\text{DPO}}(\\pi_\\theta) = -\\mathbb{E}_{(x, y_w, y_l)} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{\\text{ref}}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{\\text{ref}}(y_l|x)} \\right) \\right]" block />
                    </p>
                </Card>
            </section>

            {/* ─── SECTION 19 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<BookOpen size={22} className="text-indigo-400" />}>
                    Section 19: Mechanistic Interpretability
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">19.1 The Residual Stream Communication Channel</h4>
                    <p className="text-slate-350 text-sm">
                        Mechanistic interpretability treats the Transformer's residual stream as a shared communication channel.
                        Each layer reads patterns from the stream, processes them, and writes output features additively back into the stream:
                        <MathEquation formula="\\mathbf{x}^{(l)} = \\mathbf{x}^{(l-1)} + \\operatorname{Attn}^{(l)}(\\mathbf{x}^{(l-1)}) + \\operatorname{FFN}^{(l)}(\\mathbf{x}^{(l-1)})" block />
                    </p>
                </Card>

                <LogitLensWidget />
            </section>

            {/* ─── SECTION 20 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Award size={22} className="text-emerald-400" />}>
                    Section 20: State-of-the-Art Models & Frontier (2024–2025)
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-350 text-sm">
                        The frontier in 2025 is dominated by multimodal Mixture-of-Experts reasoning architectures (Claude 3.7, DeepSeek-R1, Gemini 1.5 Pro).
                    </p>
                </Card>

                <SotaLeaderboardWidget />
            </section>

            {/* ─── PYTORCH CODEBOX ───────────────────────────────────── */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Terminal size={20} className="text-indigo-400" />
                    Part 5 Reference PyTorch Implementations
                </h4>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
{`import torch
import torch.nn as nn
import torch.nn.functional as F

class LoRALinear(nn.Module):
    """
    Decomposed Low-Rank Adaptation (LoRA) projection layer.
    """
    def __init__(self, in_features: int, out_features: int, rank: int = 8, alpha: float = 16.0):
        super().__init__()
        self.linear = nn.Linear(in_features, out_features, bias=False)
        self.rank = rank
        self.scaling = alpha / rank
        
        # Decomposed trainable matrices
        self.lora_A = nn.Parameter(torch.zeros(rank, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank))
        
        # Initialize parameters
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)

    def forward(self, x):
        # x: [Batch, Seq_Len, in_features]
        base_out = self.linear(x)
        
        # Compute low-rank path
        lora_out = F.linear(x, self.lora_B @ self.lora_A) * self.scaling
        
        return base_out + lora_out


class SelectiveSSMStep(nn.Module):
    """
    Simulated Mamba Selective SSM inference step (S6 model).
    """
    def __init__(self, d_state: int):
        super().__init__()
        self.d_state = d_state

    def forward(self, u_t, h_prev, delta_t, A, B_t, C_t):
        # Discretize on-the-fly based on step size delta_t
        A_bar = torch.exp(delta_t * A)
        B_bar = delta_t * B_t
        
        # Step recurrence
        h_t = A_bar * h_prev + B_bar * u_t
        y_t = torch.matmul(h_t, C_t.transpose(-2, -1))
        
        return y_t, h_t`}
                </pre>
            </section>
        </div>
    );
};
