import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Repeat, 
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
    Cpu,
    GitFork
} from 'lucide-react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#6366f1' }) => (
    <div className="flex items-center gap-3 mb-6">
        {icon && <div className="p-2 rounded-xl" style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>{icon}</div>}
        <h2 className="text-2xl md:text-3xl font-bold text-white">{children}</h2>
    </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 ${className}`}>
        {children}
    </div>
);

const Callout: React.FC<{
    variant: 'insight' | 'pitfall' | 'research' | 'engineering' | 'empirical' | 'intuition';
    title: string;
    children: React.ReactNode;
}> = ({ variant, title, children }) => {
    const config = {
        insight: { color: '#8b5cf6', icon: Sparkles, bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
        pitfall: { color: '#ef4444', icon: AlertTriangle, bg: 'bg-red-500/5', border: 'border-red-500/20' },
        research: { color: '#38bdf8', icon: Terminal, bg: 'bg-sky-500/5', border: 'border-sky-500/20' },
        engineering: { color: '#10b981', icon: CheckCircle, bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        empirical: { color: '#fb923c', icon: Activity, bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
        intuition: { color: '#eab308', icon: HelpCircle, bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
    }[variant];

    const Icon = config.icon;

    return (
        <div className={`flex gap-3 p-5 rounded-xl border ${config.bg} ${config.border}`}>
            <Icon size={18} style={{ color: config.color, flexShrink: 0, marginTop: 2 }} />
            <div>
                <span className="text-sm font-bold block mb-1" style={{ color: config.color }}>{title}</span>
                <span className="text-sm text-slate-300 leading-relaxed block font-sans">{children}</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 1: Sequential Hidden State Runner
   ═══════════════════════════════════════════════════════════════════════ */

const RNNRunner: React.FC = () => {
    const [word, setWord] = useState<string>('RNN');
    const [step, setStep] = useState<number>(0);
    const [hiddenState, setHiddenState] = useState<number[]>([0, 0, 0, 0, 0]);

    const handleReset = () => {
        setStep(0);
        setHiddenState([0, 0, 0, 0, 0]);
    };

    const handleStep = () => {
        if (step >= word.length) return;
        const char = word[step];
        const ascii = char.charCodeAt(0);
        
        // Mock recurrence update: h_t = tanh(0.7 * h_{t-1} + 0.3 * x_t)
        setHiddenState(prev => prev.map((h, i) => {
            const xi = Math.sin(ascii * (i + 1)) * 0.8; // mock input encoding vector
            const nextH = Math.tanh(0.7 * h + 0.5 * xi);
            return parseFloat(nextH.toFixed(3));
        }));
        setStep(prev => prev + 1);
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sequential Hidden State Runner</span>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        maxLength={6}
                        value={word}
                        onChange={e => { setWord(e.target.value.toUpperCase()); handleReset(); }}
                        className="bg-slate-900 border border-slate-850 rounded px-2 py-0.5 text-xs text-indigo-300 font-mono font-bold w-16 text-center outline-none focus:border-indigo-500"
                    />
                    <button onClick={handleReset} className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] transition-all">Reset</button>
                </div>
            </div>

            {/* Sequence Tokens */}
            <div className="flex gap-2 justify-center">
                {word.split('').map((char, idx) => {
                    const isActive = idx === step - 1;
                    const isNext = idx === step;
                    return (
                        <div 
                            key={`rnn-token-${idx}`}
                            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono transition-all duration-300 ${
                                isActive 
                                    ? 'bg-indigo-600 text-white font-bold scale-105 shadow-md shadow-indigo-600/20 border border-indigo-400' 
                                    : isNext 
                                        ? 'bg-slate-900 text-indigo-400 border border-indigo-500/30' 
                                        : 'bg-slate-950 text-slate-650 border border-transparent'
                            }`}
                        >
                            <span className="text-xs">{char}</span>
                            <span className="text-[8px] opacity-55 font-sans">t={idx+1}</span>
                        </div>
                    );
                })}
            </div>

            {/* Hidden State Vector representation */}
            <div className="space-y-2">
                <span className="text-[9px] text-slate-500 font-mono block">Hidden State Vector (h_t)</span>
                <div className="flex justify-center items-end h-20 gap-3 bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                    {hiddenState.map((val, idx) => {
                        const barHeight = Math.abs(val) * 55;
                        const isPositive = val >= 0;
                        return (
                            <div key={`h-bar-${idx}`} className="flex flex-col items-center justify-end h-full w-5">
                                <div className="text-[7px] text-slate-500 font-mono mb-1">{val.toFixed(2)}</div>
                                <div 
                                    className={`w-3.5 rounded transition-all duration-350 ${isPositive ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                    style={{ height: `${barHeight}px` }}
                                />
                                <div className="text-[8px] text-slate-600 font-mono mt-1">h{idx}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-mono">Step: {step}/{word.length}</span>
                <button 
                    onClick={handleStep}
                    disabled={step >= word.length}
                    className="px-3 py-1 bg-indigo-650 hover:bg-indigo-550 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded transition-all"
                >
                    Step Forward
                </button>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                As you step through each character, the hidden state vector accumulates temporal representations. The current state is calculated recursively: <MathEquation formula="h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t)" />.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: LSTM Gate Controller
   ═══════════════════════════════════════════════════════════════════════ */

const LSTMGateController: React.FC = () => {
    const [fGate, setFGate] = useState<number>(0.9);
    const [iGate, setIGate] = useState<number>(0.3);
    const [oGate, setOGate] = useState<number>(0.7);

    // Initial parameters
    const cPrev = 2.0;
    const cCand = 1.5;

    // LSTM formulas:
    // C_t = f_t * C_{t-1} + i_t * \tilde{C}_t
    // h_t = o_t * tanh(C_t)
    const cVal = fGate * cPrev + iGate * cCand;
    const hVal = oGate * Math.tanh(cVal);

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">LSTM Cell Gate Controller</span>

            {/* Sliders */}
            <div className="space-y-2">
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 flex justify-between">
                        <span>Forget Gate (f_t) - memory retention</span>
                        <span className="font-mono text-indigo-400 font-bold">{fGate.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={fGate} onChange={e => setFGate(parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-850 rounded" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 flex justify-between">
                        <span>Input Gate (i_t) - incoming write</span>
                        <span className="font-mono text-indigo-400 font-bold">{iGate.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={iGate} onChange={e => setIGate(parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-850 rounded" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 flex justify-between">
                        <span>Output Gate (o_t) - hidden projection</span>
                        <span className="font-mono text-indigo-400 font-bold">{oGate.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={oGate} onChange={e => setOGate(parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-850 rounded" />
                </div>
            </div>

            {/* Display math computations */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-900 text-[10px] space-y-2 font-mono leading-relaxed">
                <div>
                    <span className="text-slate-500 block mb-0.5">Cell State update calculation:</span>
                    <MathEquation formula={`C_t = (${fGate.toFixed(2)} \\times ${cPrev}) + (${iGate.toFixed(2)} \\times ${cCand}) = ${cVal.toFixed(3)}`} />
                </div>
                <div className="border-t border-slate-850/60 pt-2">
                    <span className="text-slate-500 block mb-0.5">Hidden State update calculation:</span>
                    <MathEquation formula={`h_t = ${oGate.toFixed(2)} \\times \\tanh(${cVal.toFixed(3)}) = ${hVal.toFixed(3)}`} />
                </div>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Notice that if the **Forget Gate** is <MathEquation formula="0.0" />, previous cell state memory is completely wiped. The additive update mechanism allows the cell gradient to backpropagate with constant scaling when gates are open.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: Seq2Seq Attention Matrix Playground
   ═══════════════════════════════════════════════════════════════════════ */

const ATTN_SCORES = [
    // Rows: target words ["I", "am", "a", "student"]
    // Cols: source words ["Je", "suis", "étudiant"]
    [0.9, 0.08, 0.02], // I
    [0.05, 0.92, 0.03], // am
    [0.1, 0.4, 0.5],   // a
    [0.01, 0.04, 0.95] // student
];

const SRC_TOKENS = ["Je", "suis", "étudiant"];
const TGT_TOKENS = ["I", "am", "a", "student"];

const AttentionPlayground: React.FC = () => {
    const [activeTarget, setActiveTarget] = useState<number>(3); // default: student

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Seq2Seq Cross-Attention Matrix</span>

            <div className="flex flex-col gap-3">
                {/* Horizontal target tokens */}
                <div className="flex gap-2 justify-center">
                    {TGT_TOKENS.map((token, idx) => (
                        <button
                            key={`tgt-${idx}`}
                            onMouseEnter={() => setActiveTarget(idx)}
                            onClick={() => setActiveTarget(idx)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                                activeTarget === idx
                                    ? 'bg-indigo-650 text-white font-bold border-indigo-400'
                                    : 'bg-slate-900 text-slate-450 border-slate-850 hover:border-slate-800'
                            }`}
                        >
                            {token}
                        </button>
                    ))}
                </div>

                {/* Vertical alignment values */}
                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-900 space-y-2">
                    <span className="text-[9px] text-slate-500 font-mono block">Context Distribution over Source Tokens</span>
                    <div className="space-y-1.5">
                        {SRC_TOKENS.map((srcToken, srcIdx) => {
                            const val = ATTN_SCORES[activeTarget][srcIdx];
                            return (
                                <div key={`src-${srcIdx}`} className="flex items-center gap-3 text-xs font-mono">
                                    <div className="w-16 text-slate-400 text-right">{srcToken}</div>
                                    <div className="flex-1 h-3 bg-slate-950 border border-slate-850 rounded overflow-hidden relative">
                                        <div 
                                            className="h-full bg-indigo-500/70 transition-all duration-300"
                                            style={{ width: `${val * 100}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-end px-2 text-[8px] text-slate-500 font-bold">
                                            {(val * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Equation details */}
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 text-[10px] font-mono leading-relaxed text-slate-400">
                <span className="text-slate-500 block mb-1">Attention Context Vector calculation:</span>
                <MathEquation formula={`\\mathbf{c}_{${activeTarget}} = ` + SRC_TOKENS.map((tk, idx) => `(${ATTN_SCORES[activeTarget][idx].toFixed(2)} \\cdot \\mathbf{h}_{\\text{${tk}}})`).join(' + ')} />
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Hover over the target English words. Notice how selecting **"student"** pushes attention probability almost entirely (<MathEquation formula="95\%" />) to the French source word **"étudiant"**, allowing correct semantic alignment.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const RNNSeq: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                    <Repeat size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 10</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-205 to-indigo-500 mb-4">
                    Recurrent Networks & Sequences
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Model variables over temporal contexts. Derive Backpropagation Through Time, dissect LSTM & GRU 
                    gating pathways, and trace classic Seq2Seq cross-attention mechanisms.
                </p>
            </motion.div>

            {/* ─── 10.1 RECURRENT TOPOLOGIES ────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-indigo-400" />}>
                    10.1 — Sequential Contexts & Parameter Sharing
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Sentence Reading Analogy">
                        Think of how you read this sentence. 
                        As your eyes jump from word to word, you don't boot up a fresh memory from scratch for every term. Instead, you hold a running "mental summary" in your mind. Every new word you read updates this summary. 
                        This is the **hidden state** (<MathEquation formula="h_t" />). 
                        The rules your brain uses to digest a word are the same whether it is the first word or the last word on the page. This is **recurrent parameter sharing**.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        While MLPs map inputs to outputs along a static feedforward track, sequences (like text, speech, or time-series data) have variable lengths and dense temporal dependencies. Stacking static projection layers over long inputs leads to parameters growing linearly with input width.
                    </p>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Recurrent Neural Networks (RNNs) solve this by feeding hidden activations back into the neuron alongside the new input at step <MathEquation formula="t" />, applying identical weight projections <MathEquation formula="\mathbf{W}_{hh}" /> at every temporal step.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 10.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-indigo-400" />}>
                    10.2 — BPTT Dynamics, Gated High-Ways & Alignment
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us derive the mathematics governing backpropagation through time, memory cells, and alignment attention.
                    </p>

                    <div className="space-y-8">
                        {/* RNN updates */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. Vanilla RNN Updates</h4>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="\mathbf{h}_t = \tanh(\mathbf{W}_{hh} \mathbf{h}_{t-1} + \mathbf{W}_{xh} \mathbf{x}_t + \mathbf{b}_h)" block />
                                <MathEquation formula="\hat{\mathbf{y}}_t = \operatorname{softmax}(\mathbf{W}_{hy} \mathbf{h}_t + \mathbf{b}_y)" block />
                            </div>
                        </div>

                        {/* BPTT */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Backpropagation Through Time (BPTT) Jacobian Dynamics</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                The gradient of the loss <MathEquation formula="\mathcal{L}" /> with respect to recurrent weights <MathEquation formula="\mathbf{W}_{hh}" /> requires unrolling the computational graph back to step <MathEquation formula="0" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
                                <MathEquation formula="\frac{\partial\mathcal{L}}{\partial \mathbf{W}_{hh}} = \sum_{t=1}^T \sum_{k=1}^t \frac{\partial\mathcal{L}_t}{\partial \mathbf{h}_t} \frac{\partial \mathbf{h}_t}{\partial \mathbf{h}_k} \frac{\partial \mathbf{h}_k}{\partial \mathbf{W}_{hh}}" block />
                                <div className="text-center font-sans text-slate-500">The central hidden-to-hidden gradient path expands to a product of Jacobians:</div>
                                <MathEquation formula="\frac{\partial \mathbf{h}_t}{\partial \mathbf{h}_k} = \prod_{j=k+1}^t \frac{\partial \mathbf{h}_j}{\partial \mathbf{h}_{j-1}} = \prod_{j=k+1}^t \operatorname{diag}\left(1 - \mathbf{h}_j^2\right) \mathbf{W}_{hh}^T" block />
                                <p className="text-slate-500 font-sans text-[11px] mt-1">
                                    If the largest eigenvalue of <MathEquation formula="\mathbf{W}_{hh}" /> is less than 1, the product decays exponentially to zero as sequence length <MathEquation formula="T" /> grows, causing the **vanishing gradient** problem. If the eigenvalue exceeds 1, it blows up, causing **exploding gradients**.
                                </p>
                            </div>
                        </div>

                        {/* LSTM */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Long Short-Term Memory (LSTM) Gated Highway</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                LSTM (Hochreiter & Schmidhuber 1997) decouples cell state <MathEquation formula="\mathbf{C}_t" /> from hidden output activations. Let <MathEquation formula="\sigma" /> represent sigmoid:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-indigo-400 block mb-0.5">Forget Gate</span>
                                        <MathEquation formula="\mathbf{f}_t = \sigma(\mathbf{W}_f [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_f)" block />
                                    </div>
                                    <div>
                                        <span className="text-indigo-400 block mb-0.5">Input Gate</span>
                                        <MathEquation formula="\mathbf{i}_t = \sigma(\mathbf{W}_i [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_i)" block />
                                    </div>
                                    <div>
                                        <span className="text-indigo-400 block mb-0.5">Candidate Cell State</span>
                                        <MathEquation formula="\tilde{\mathbf{C}}_t = \tanh(\mathbf{W}_c [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_c)" block />
                                    </div>
                                    <div>
                                        <span className="text-indigo-400 block mb-0.5">Output Gate</span>
                                        <MathEquation formula="\mathbf{o}_t = \sigma(\mathbf{W}_o [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_o)" block />
                                    </div>
                                </div>
                                <div className="border-t border-slate-900 pt-3 text-center">
                                    <span className="text-indigo-400 block mb-1">Additive Cell State Update</span>
                                    <MathEquation formula="\mathbf{C}_t = \mathbf{f}_t \odot \mathbf{C}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{C}}_t" block />
                                    <span className="text-indigo-400 block mt-2 mb-1">Hidden Output Projection</span>
                                    <MathEquation formula="\mathbf{h}_t = \mathbf{o}_t \odot \tanh(\mathbf{C}_t)" block />
                                </div>
                                <p className="text-slate-500 font-sans text-[11px] mt-2">
                                    Because cell state updates additively, the derivative of cell error <MathEquation formula="\frac{\partial \mathbf{C}_t}{\partial \mathbf{C}_{t-1}}" /> has a term containing forget gate <MathEquation formula="\mathbf{f}_t" />. If <MathEquation formula="\mathbf{f}_t \approx 1" />, error flows back through time indefinitely without decay.
                                </p>
                            </div>
                        </div>

                        {/* GRU */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. Gated Recurrent Unit (GRU)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                GRU (Cho et al. 2014) merges cell and hidden state, using only reset <MathEquation formula="\mathbf{r}_t" /> and update <MathEquation formula="\mathbf{z}_t" /> gates:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="\mathbf{z}_t = \sigma(\mathbf{W}_z [\mathbf{h}_{t-1}, \mathbf{x}_t]), \\ \quad \mathbf{r}_t = \sigma(\mathbf{W}_r [\mathbf{h}_{t-1}, \mathbf{x}_t])" block />
                                <MathEquation formula="\tilde{\mathbf{h}}_t = \tanh(\mathbf{W} [\mathbf{r}_t \odot \mathbf{h}_{t-1}, \mathbf{x}_t])" block />
                                <MathEquation formula="\mathbf{h}_t = (1 - \mathbf{z}_t) \odot \mathbf{h}_{t-1} + \mathbf{z}_t \odot \tilde{\mathbf{h}}_t" block />
                            </div>
                        </div>

                        {/* Bahdanau / Luong */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">5. Classic Seq2Seq Attention Mechanisms</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Attention builds direct pathways connecting target decode states <MathEquation formula="\mathbf{s}_i" /> to source encode states <MathEquation formula="\mathbf{h}_j" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-indigo-400 block mb-0.5">Bahdanau Score (Additive)</span>
                                        <MathEquation formula="e_{ij} = \mathbf{v}_a^T \tanh(\mathbf{W}_a \mathbf{s}_{i-1} + \mathbf{U}_a \mathbf{h}_j)" block />
                                    </div>
                                    <div>
                                        <span className="text-indigo-400 block mb-0.5">Luong Score (Dot-Product)</span>
                                        <MathEquation formula="e_{ij} = \mathbf{s}_i^T \mathbf{W}_a \mathbf{h}_j" block />
                                    </div>
                                </div>
                                <div className="border-t border-slate-900 pt-3 text-center">
                                    <span className="text-indigo-400 block mb-1">Alignment Softmax Distributions</span>
                                    <MathEquation formula="\alpha_{ij} = \frac{\exp(e_{ij})}{\sum_{k=1}^{T_x} \exp(e_{ik})}" block />
                                    <span className="text-indigo-400 block mt-2 mb-1">Context Vector Output</span>
                                    <MathEquation formula="\mathbf{c}_i = \sum_{j=1}^{T_x} \alpha_{ij} \mathbf{h}_j" block />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-indigo-400" />}>
                    10.3 — Temporal & Attention Sandbox
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <RNNRunner />
                    <LSTMGateController />
                    <AttentionPlayground />
                </div>
            </motion.section>

            {/* ─── 10.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-indigo-400" />}>
                    10.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: 1D Vanilla RNN Forward pass</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate the temporal unrolling for steps <MathEquation formula="t=1" /> and <MathEquation formula="t=2" />.
                            Input sequence: <MathEquation formula="x_1 = 0.5, x_2 = -1.0" />.
                            Parameters: <MathEquation formula="W_{hh} = 0.8, W_{xh} = 0.5, b_h = -0.1" />.
                            Initial hidden state: <MathEquation formula="h_0 = 0.0" />.
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4 leading-relaxed">
                            <div>
                                <span className="text-indigo-400 font-bold block">1. Time Step t = 1:</span>
                                <MathEquation formula="z_1 = W_{hh} h_0 + W_{xh} x_1 + b_h" block />
                                <MathEquation formula="= 0.8(0.0) + 0.5(0.5) - 0.1 = 0.0 + 0.25 - 0.1 = 0.15" block />
                                <MathEquation formula="h_1 = \tanh(z_1) = \tanh(0.15) \approx 0.14888" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-indigo-400 font-bold block">2. Time Step t = 2:</span>
                                <MathEquation formula="z_2 = W_{hh} h_1 + W_{xh} x_2 + b_h" block />
                                <MathEquation formula="= 0.8(0.14888) + 0.5(-1.0) - 0.1 = 0.11910 - 0.5 - 0.1 = -0.4809" block />
                                <MathEquation formula="h_2 = \tanh(z_2) = \tanh(-0.4809) \approx -0.44688" block />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white">Example B: Dot-Product Attention Similarity alignment</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate cross-attention similarities for a query vector <MathEquation formula="\mathbf{q} = \begin{pmatrix} 1.0 \\ 0.0 \end{pmatrix}" /> over two key hidden states:
                            <MathEquation formula="\mathbf{k}_1 = \begin{pmatrix} 0.8 \\ 0.6 \end{pmatrix}, \quad \mathbf{k}_2 = \begin{pmatrix} -0.5 \\ 0.5 \end{pmatrix}" block />
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3 leading-relaxed">
                            <div>
                                <span className="text-indigo-400 font-bold block mb-1">1. Compute Dot-Product scores:</span>
                                <MathEquation formula="e_1 = \mathbf{q}^T \mathbf{k}_1 = 1.0(0.8) + 0.0(0.6) = 0.8" block />
                                <MathEquation formula="e_2 = \mathbf{q}^T \mathbf{k}_2 = 1.0(-0.5) + 0.0(0.5) = -0.5" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-indigo-400 font-bold block mb-1">2. Softmax Normalization:</span>
                                <MathEquation formula="\exp(e_1) = e^{0.8} \approx 2.22554, \\ \quad \exp(e_2) = e^{-0.5} \approx 0.60653" block />
                                <MathEquation formula="\text{Sum} = 2.22554 + 0.60653 = 2.83207" block />
                                <div className="grid grid-cols-1 gap-1 pl-2 mt-1">
                                    <div><MathEquation formula="\alpha_1 = 2.22554 / 2.83207 \approx 0.7858" /></div>
                                    <div><MathEquation formula="\alpha_2 = 0.60653 / 2.83207 \approx 0.2142" /></div>
                                </div>
                            </div>
                            <div className="text-slate-500 font-sans mt-2">
                                The decoder focuses <MathEquation formula="78.6\%" /> of its context weights on Key 1.
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 10.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-indigo-400" />}>
                    10.5 — PyTorch Custom LSTM Cells & Attention Layers
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a from-scratch LSTM cell update and dot-product attention calculation.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import math

class CustomLSTMCell(nn.Module):
    """
    Implements a standard LSTM recurrent cell equations from scratch.
    """
    def __init__(self, input_size: int, hidden_size: int):
        super(CustomLSTMCell, self).__init__()
        self.hidden_size = hidden_size
        
        # Combine all gates projection matrices together for speed
        # Gates: Forget, Input, Cell-Candidate, Output (4 * hidden_size)
        self.xh_projection = nn.Linear(input_size, 4 * hidden_size)
        self.hh_projection = nn.Linear(hidden_size, 4 * hidden_size)

    def forward(self, x: torch.Tensor, state: tuple) -> tuple:
        # state: (h_prev, c_prev)
        h_prev, c_prev = state
        
        # Compute joint projections
        gate_projections = self.xh_projection(x) + self.hh_projection(h_prev)
        
        # Split projections into 4 equal segments
        f_proj, i_proj, c_proj, o_proj = torch.split(gate_projections, self.hidden_size, dim=-1)
        
        # Apply non-linearities
        f = torch.sigmoid(f_proj)
        i = torch.sigmoid(i_proj)
        c_cand = torch.tanh(c_proj)
        o = torch.sigmoid(o_proj)
        
        # Additive cell updates
        c_t = f * c_prev + i * c_cand
        h_t = o * torch.tanh(c_t)
        
        return h_t, c_t

class DotProductAttention(nn.Module):
    """
    Computes standard Luong scaling dot-product alignment weights.
    """
    def __init__(self):
        super(DotProductAttention, self).__init__()

    def forward(self, query: torch.Tensor, keys: torch.Tensor, values: torch.Tensor) -> tuple:
        # query: [Batch, 1, Dim]
        # keys: [Batch, Seq_Len, Dim]
        # values: [Batch, Seq_Len, Dim]
        
        # Compute alignment scores
        scores = torch.bmm(query, keys.transpose(1, 2)) # [B, 1, Seq_Len]
        
        # Scale scores by square root of dimensions
        dim = query.shape[-1]
        scores = scores / math.sqrt(dim)
        
        # Softmax alignment weight matrix
        weights = torch.softmax(scores, dim=-1) # [B, 1, Seq_Len]
        
        # Weighted context sum output
        context = torch.bmm(weights, values) # [B, 1, Dim]
        
        return context, weights

if __name__ == "__main__":
    # Test LSTM Cell
    batch = 2
    in_dim = 8
    hid_dim = 16
    cell = CustomLSTMCell(in_dim, hid_dim)
    
    x_t = torch.randn(batch, in_dim)
    h_0 = torch.zeros(batch, hid_dim)
    c_0 = torch.zeros(batch, hid_dim)
    
    h_1, c_1 = cell(x_t, (h_0, c_0))
    print("LSTM Hidden output shape:", h_1.shape) # Should be [2, 16]
    
    # Test Attention
    attn = DotProductAttention()
    q = torch.randn(batch, 1, hid_dim)
    k = torch.randn(batch, 5, hid_dim)
    v = torch.randn(batch, 5, hid_dim)
    ctx, w = attn(q, k, v)
    print("Attention context output shape:", ctx.shape) # Should be [2, 1, 16]
    print("Alignment weights shape:", w.shape) # Should be [2, 1, 5]`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
