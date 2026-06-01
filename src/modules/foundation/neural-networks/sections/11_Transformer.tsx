import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, 
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
    Repeat,
    GitCommit
} from 'lucide-react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#845ef7' }) => (
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
   SUB-WIDGET 1: Self-Attention Vector Dot-Product Map
   ═══════════════════════════════════════════════════════════════════════ */

const TOKENS = ["THE", "CAT", "SAT"];

// Define 2D Query, Key, Value vectors for each token
const Q_VECTORS = [
    [1.0, 0.2], // THE
    [0.1, 1.2], // CAT
    [0.8, 0.6]  // SAT
];

const K_VECTORS = [
    [0.9, 0.1], // THE
    [0.2, 1.0], // CAT
    [0.7, 0.7]  // SAT
];

const V_VECTORS = [
    [10.0, 0.0], // THE
    [0.0, 20.0], // CAT
    [5.0, 5.0]   // SAT
];

const AttentionVectorMap: React.FC = () => {
    const [selectedIdx, setSelectedIdx] = useState<number>(1); // Default: CAT
    const d_k = 2;

    const getMathDetails = () => {
        const q = Q_VECTORS[selectedIdx];
        const scores = K_VECTORS.map(k => q[0]*k[0] + q[1]*k[1]);
        const scaledScores = scores.map(s => s / Math.sqrt(d_k));
        
        // Softmax
        const exps = scaledScores.map(s => Math.exp(s));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(e => e / sumExp);
        
        // Output value mix
        const out = [0, 0];
        for (let i = 0; i < 3; i++) {
            out[0] += probs[i] * V_VECTORS[i][0];
            out[1] += probs[i] * V_VECTORS[i][1];
        }

        return {
            q,
            scores,
            scaledScores,
            probs,
            out
        };
    };

    const details = getMathDetails();

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Self-Attention Step Prober</span>
                <div className="flex gap-1.5">
                    {TOKENS.map((tk, idx) => (
                        <button
                            key={`tk-btn-${idx}`}
                            onClick={() => setSelectedIdx(idx)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                                selectedIdx === idx 
                                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                                    : 'bg-slate-900 text-slate-500 border border-transparent'
                            }`}
                        >
                            {tk}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calculations display */}
            <div className="space-y-3 font-mono text-[10px] text-slate-400">
                <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-lg space-y-1.5">
                    <span className="text-slate-500 block">1. Query Vector (Q) for "{TOKENS[selectedIdx]}":</span>
                    <div className="text-white font-bold text-xs">
                        <MathEquation formula={`\\mathbf{q}_{\\text{${TOKENS[selectedIdx]}}} = \\begin{pmatrix} ${details.q[0].toFixed(2)} \\\\ ${details.q[1].toFixed(2)} \\end{pmatrix}`} />
                    </div>
                </div>

                <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-lg space-y-2">
                    <span className="text-slate-500 block">2. Dot Product Alignment with Keys (K):</span>
                    <div className="space-y-1.5">
                        {TOKENS.map((tk, idx) => (
                            <div key={`dot-${idx}`} className="flex justify-between items-center flex-wrap gap-1">
                                <span>{tk} Key: <MathEquation formula={`\\mathbf{k}_{\\text{${tk}}} = [${K_VECTORS[idx][0].toFixed(1)}, ${K_VECTORS[idx][1].toFixed(1)}]`} /></span>
                                <span className="text-white font-bold">
                                    Score: <MathEquation formula={`s_{${idx}} = ${details.scores[idx].toFixed(3)}`} />
                                    <span> → Scaled: </span>
                                    <MathEquation formula={`\\frac{s_{${idx}}}{\\sqrt{2}} = ${details.scaledScores[idx].toFixed(3)}`} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-lg space-y-1.5">
                    <span className="text-slate-500 block">3. Softmax Attention Distribution (Alpha):</span>
                    <div className="flex justify-around items-center py-1">
                        {TOKENS.map((tk, idx) => (
                            <div key={`prob-${idx}`} className="text-center">
                                <div className="text-xs text-white font-bold">{(details.probs[idx] * 100).toFixed(1)}%</div>
                                <div className="text-[8px] text-slate-500">{tk}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/40 p-2.5 border border-slate-900 rounded-lg space-y-1.5">
                    <span className="text-slate-500 block">4. Mixed Output Vector (V-Weighted Sum):</span>
                    <div className="text-white font-bold text-xs">
                        <MathEquation formula={`\\mathbf{z}_{\\text{${TOKENS[selectedIdx]}}} = \\sum \\alpha_i \\mathbf{v}_i = \\begin{pmatrix} ${details.out[0].toFixed(3)} \\\\ ${details.out[1].toFixed(3)} \\end{pmatrix}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: Rotary Position (RoPE) Rotation Circle
   ═══════════════════════════════════════════════════════════════════════ */

const RoPECircles: React.FC = () => {
    const [qPos, setQPos] = useState<number>(1);
    const [kPos, setKPos] = useState<number>(3);

    const thetaBase = 30 * Math.PI / 180; // 30 degrees per step
    const qAngle = qPos * thetaBase;
    const kAngle = kPos * thetaBase;

    // Vector values
    const qLength = 65;
    const kLength = 65;

    const qx = 100 + qLength * Math.cos(qAngle);
    const qy = 100 - qLength * Math.sin(qAngle);
    const kx = 100 + kLength * Math.cos(kAngle);
    const ky = 100 - kLength * Math.sin(kAngle);

    // Inner product: cos(qAngle - kAngle) * lengths
    const dotProduct = Math.cos(qAngle - kAngle) * 1.0; // Normalized representation

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Rotary Position Embedding (RoPE) Geometry</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Sliders */}
                <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Query Index (m)</span>
                            <span className="font-mono text-violet-400 font-bold">m = {qPos}</span>
                        </label>
                        <input type="range" min="0" max="5" value={qPos} onChange={e => setQPos(parseInt(e.target.value))} className="w-full accent-violet-500 h-1 bg-slate-850 rounded" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Key Index (n)</span>
                            <span className="font-mono text-violet-400 font-bold">n = {kPos}</span>
                        </label>
                        <input type="range" min="0" max="5" value={kPos} onChange={e => setKPos(parseInt(e.target.value))} className="w-full accent-violet-500 h-1 bg-slate-850 rounded" />
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[10px] leading-relaxed">
                        <div className="flex justify-between">
                            <span>Relative Distance:</span>
                            <span className="text-white font-bold">|m - n| = {Math.abs(qPos - kPos)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Dot Product:</span>
                            <span className="text-violet-400 font-bold">cos(θ(m - n)) = {dotProduct.toFixed(3)}</span>
                        </div>
                    </div>
                </div>

                {/* SVG Circle visual */}
                <div className="flex justify-center bg-slate-905 p-2 rounded-lg border border-slate-900">
                    <svg width="200" height="200" className="block">
                        {/* Coordinate grids */}
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="1" />
                        <line x1="20" y1="100" x2="180" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="100" y1="20" x2="100" y2="180" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />

                        {/* Query vector arrow */}
                        <line x1="100" y1="100" x2={qx} y2={qy} stroke="#845ef7" strokeWidth="2.5" />
                        <circle cx={qx} cy={qy} r="4" fill="#a78bfa" />
                        <text x={qx + 5} y={qy - 5} fill="#a78bfa" fontSize="9" fontWeight="bold" className="font-mono">q</text>

                        {/* Key vector arrow */}
                        <line x1="100" y1="100" x2={kx} y2={ky} stroke="#10b981" strokeWidth="2.5" />
                        <circle cx={kx} cy={ky} r="4" fill="#34d399" />
                        <text x={kx + 5} y={ky + 10} fill="#34d399" fontSize="9" fontWeight="bold" className="font-mono">k</text>

                        {/* Center dot */}
                        <circle cx="100" cy="100" r="3" fill="#cbd5e1" />
                    </svg>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                RoPE rotates 2D slices of Query and Key vectors by angles proportional to token indexes. The inner product matrix is invariant to absolute sequence translations and depends entirely on the relative distance <MathEquation formula="m - n" />.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: Pre-LN vs Post-LN Gradient Highway
   ═══════════════════════════════════════════════════════════════════════ */

const NormalizationHighways: React.FC = () => {
    const [normType, setNormType] = useState<'pre' | 'post'>('pre');
    const [isFlowing, setIsFlowing] = useState<boolean>(false);

    const triggerFlow = () => {
        if (isFlowing) return;
        setIsFlowing(true);
        setTimeout(() => setIsFlowing(false), 2200);
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pre-LN vs Post-LN Backprop Highway</span>
                <div className="flex gap-1.5">
                    <button 
                        onClick={() => { setNormType('pre'); setIsFlowing(false); }} 
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${normType === 'pre' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-slate-500'}`}
                    >
                        PRE-LN
                    </button>
                    <button 
                        onClick={() => { setNormType('post'); setIsFlowing(false); }} 
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${normType === 'post' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-slate-500'}`}
                    >
                        POST-LN
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-lg relative min-h-[90px] flex items-center justify-between">
                {normType === 'pre' ? (
                    // Pre-LN diagram: h_{l+1} = h_l + MHA(LN(h_l))
                    <div className="flex items-center justify-between w-full font-mono text-[9px] relative h-12">
                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-450 z-15">IN</div>
                        
                        {/* Direct identity line (bottom) */}
                        <div className="absolute left-8 right-8 h-0.5 bg-violet-500/50" style={{ top: '23px' }} />
                        <span className="absolute left-1/2 -translate-x-1/2 text-[7px] text-violet-500 font-sans" style={{ top: '28px' }}>Direct Gradient Highway (Identity)</span>

                        {/* Block processing path (top branch) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                            <path d="M 32 20 C 45 -5, 80 -5, 95 10" fill="none" stroke="#475569" strokeWidth="1" />
                            <path d="M 135 10 C 150 -5, 185 -5, 198 20" fill="none" stroke="#475569" strokeWidth="1" />
                        </svg>

                        <div className="w-10 h-6 bg-slate-950 border border-slate-800 text-slate-400 rounded flex items-center justify-center z-15" style={{ transform: 'translateY(-14px)' }}>LN</div>
                        <div className="w-10 h-6 bg-slate-950 border border-slate-800 text-slate-400 rounded flex items-center justify-center z-15" style={{ transform: 'translateY(-14px)' }}>MHA</div>

                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-450 z-15">OUT</div>
                    </div>
                ) : (
                    // Post-LN diagram: h_{l+1} = LN(h_l + MHA(h_l))
                    <div className="flex items-center justify-between w-full font-mono text-[9px] relative h-12">
                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-450 z-15">IN</div>

                        {/* Direct addition line (before LN) */}
                        <div className="absolute left-8 right-16 h-0.5 bg-slate-800" style={{ top: '23px' }} />

                        {/* Block processing path (top branch) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                            <path d="M 32 20 C 55 -5, 115 -5, 135 20" fill="none" stroke="#475569" strokeWidth="1" />
                        </svg>
                        <div className="w-10 h-6 bg-slate-950 border border-slate-800 text-slate-400 rounded flex items-center justify-center z-15" style={{ transform: 'translateY(-14px) translateX(24px)' }}>MHA</div>

                        {/* LN at the end of block */}
                        <div className="w-10 h-6 bg-slate-950 border border-slate-800 text-slate-400 rounded flex items-center justify-center z-15">LN</div>

                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-450 z-15">OUT</div>
                    </div>
                )}

                {/* Gradient animated dot */}
                {isFlowing && (
                    <motion.div 
                        className="absolute w-2 h-2 rounded-full bg-violet-400"
                        initial={{ right: '16px' }}
                        animate={
                            normType === 'pre'
                                ? { right: ['16px', '212px'] } // flows back cleanly on pre
                                : { right: ['16px', '74px', '212px'] } // passes through LN first on post
                        }
                        transition={{ duration: 1.8, ease: 'easeInOut' }}
                        style={{ top: '20px', zIndex: 20 }}
                    />
                )}
            </div>

            <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-sans">
                    {normType === 'pre' 
                        ? 'Pre-LN positions LN inside residual paths, keeping the main identity line clean.' 
                        : 'Post-LN normalizes the combined residual sum, adding scale weights to backprop.'
                    }
                </span>
                <button 
                    onClick={triggerFlow}
                    disabled={isFlowing}
                    className="px-2.5 py-1 bg-violet-650 hover:bg-violet-550 text-white font-bold rounded text-[10px] transition-all disabled:opacity-40"
                >
                    Run Backprop Flow
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const Transformer: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-violet-400 mb-4">
                    <Cpu size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 11</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-500 mb-4">
                    The Transformer Architecture
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Abolish recurrence constraints in favor of global parallel attention. Derive Scaled Dot-Product systems, 
                    relative Rotary Positional (RoPE) manifolds, and analyze optimization stability in Pre-LN topologies.
                </p>
            </motion.div>

            {/* ─── 11.1 PARALLEL ATTENTION VS RECURRENCE ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-violet-400" />}>
                    11.1 — The Shift to Parallel Attention
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Filing Cabinet Index Analogy">
                        If you are searching for a specific receipt in a stack, an **RNN** acts like scanning every piece of paper one-by-one from top to bottom. If the stack is deep, you lose track of the beginning pages.
                        A **Transformer** acts like a filing cabinet index. You hold a search **Query** (what you want), match it against folder **Keys** (index tags) in parallel, and directly pull out the folder **Values** (data contents) in a single step, without sequential reading.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Recurrent layers enforce a strict sequential dependency: step <MathEquation formula="t" /> cannot compile until hidden state <MathEquation formula="h_{t-1}" /> is fully computed. This prevents GPU parallelization during training over sequence tokens.
                    </p>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Self-Attention bypasses temporal pathways, allowing every token to communicate directly with every other token in the sequence in a single parallel operation.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 11.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-violet-400" />}>
                    11.2 — Attention Systems, RoPE Rotations & LN Highways
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us examine the exact mathematical formulations of Attention blocks and Positional manifolds.
                    </p>

                    <div className="space-y-8">
                        {/* Scaled Dot-Product */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. Scaled Dot-Product Attention</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                For Query matrices <MathEquation formula="\mathbf{Q}" />, Keys <MathEquation formula="\mathbf{K}" />, and Values <MathEquation formula="\mathbf{V}" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\operatorname{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \operatorname{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}}\right)\mathbf{V}" block />
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                **Why scale by <MathEquation formula="1/\sqrt{d_k}" />?** Assuming components of <MathEquation formula="\mathbf{q}" /> and <MathEquation formula="\mathbf{k}" /> are independent random variables with mean 0 and variance 1, their dot product has mean 0 and variance <MathEquation formula="d_k" />. For large values of <MathEquation formula="d_k" />, dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by <MathEquation formula="\sqrt{d_k}" /> pulls variance back to 1.0, preserving gradient flow.
                            </p>
                        </div>

                        {/* Multi-Head Attention */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Multi-Head Attention (MHA)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Multi-Head Attention projects Q, K, V into separate subspace dimensions, allowing heads to extract diverse contextual features in parallel:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="\operatorname{MultiHead}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \operatorname{Concat}(\text{head}_1, \dots, \text{head}_h)\mathbf{W}^O" block />
                                <div className="text-center">where each independent attention head is calculated as:</div>
                                <MathEquation formula="\text{head}_i = \operatorname{Attention}(\mathbf{Q}\mathbf{W}_i^Q, \mathbf{K}\mathbf{W}_i^K, \mathbf{V}\mathbf{W}_i^V)" block />
                            </div>
                        </div>

                        {/* Positional encodings & RoPE */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Rotary Position Embedding (RoPE)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Because self-attention contains no inherent sequence order information, position vectors must be introduced. Modern LLMs (LLaMA, Mistral) implement relative **RoPE** by applying orthogonal rotation matrices to 2D slices of query and key vectors:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div className="text-center">A 2D slice of Query at position <MathEquation formula="m" /> is rotated by:</div>
                                <MathEquation formula="\mathbf{R}_{\theta, m}^2 \mathbf{q}_m = \begin{pmatrix} \cos m\theta & -\sin m\theta \\ \sin m\theta & \cos m\theta \end{pmatrix} \begin{pmatrix} q_0 \\ q_1 \end{pmatrix}" block />
                                <div className="text-center">This guarantees that query-key inner products preserve relative distance:</div>
                                <MathEquation formula="\langle \mathbf{R}_m \mathbf{q}, \mathbf{R}_n \mathbf{k} \rangle = \mathbf{q}^T \mathbf{R}_{n-m} \mathbf{k}" block />
                            </div>
                        </div>

                        {/* Pre-LN vs Post-LN */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. Pre-LN vs. Post-LN Architectures</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Original Transformer layouts positioned LayerNorm after block additions (Post-LN). Modern variants position LayerNorm on the input branches (Pre-LN):
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div><span className="text-violet-400 block mb-0.5">Post-LN (Original):</span> <MathEquation formula="\mathbf{x}_{l+1} = \operatorname{LN}(\mathbf{x}_l + \mathcal{F}(\mathbf{x}_l))" /></div>
                                <div><span className="text-violet-400 block mb-0.5">Pre-LN (Modern):</span> <MathEquation formula="\mathbf{x}_{l+1} = \mathbf{x}_l + \mathcal{F}(\operatorname{LN}(\mathbf{x}_l))" /></div>
                                <p className="text-slate-500 font-sans text-[11px] mt-1">
                                    Pre-LN creates a direct identity highway from layer 1 to <MathEquation formula="L" />, allowing gradients to flow back unaltered, removing the requirement of learning rate warm-ups.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-violet-400" />}>
                    11.3 — Transformer Blocks Sandbox
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <AttentionVectorMap />
                    <RoPECircles />
                    <NormalizationHighways />
                </div>
            </motion.section>

            {/* ─── 11.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-violet-400" />}>
                    11.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: Self-Attention Matrix Calculation</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us compute self-attention for a sequence length of 2, query matrix <MathEquation formula="\mathbf{Q}" />, key matrix <MathEquation formula="\mathbf{K}" />, and value matrix <MathEquation formula="\mathbf{V}" /> of dimension <MathEquation formula="d_k = 2" />:
                            <MathEquation formula="\mathbf{Q} = \begin{pmatrix} 1 & 0 \\ 0 & 2 \end{pmatrix}, \quad \mathbf{K} = \begin{pmatrix} 1 & 1 \\ 2 & 0 \end{pmatrix}, \quad \mathbf{V} = \begin{pmatrix} 10 & 0 \\ 0 & 20 \end{pmatrix}" block />
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4 leading-relaxed">
                            <div>
                                <span className="text-violet-400 font-bold block mb-1">1. Compute Dot-Products (Q K^T):</span>
                                <MathEquation formula="\mathbf{Q}\mathbf{K}^T = \begin{pmatrix} 1 & 0 \\ 0 & 2 \end{pmatrix} \begin{pmatrix} 1 & 2 \\ 1 & 0 \end{pmatrix} = \begin{pmatrix} 1(1) + 0(1) & 1(2) + 0(0) \\ 0(1) + 2(1) & 0(2) + 2(0) \end{pmatrix} = \begin{pmatrix} 1 & 2 \\ 2 & 0 \end{pmatrix}" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-violet-400 font-bold block mb-1">2. Scale by √d_k (√2 ≈ 1.4142):</span>
                                <MathEquation formula="\mathbf{S} = \frac{1}{1.4142} \begin{pmatrix} 1 & 2 \\ 2 & 0 \end{pmatrix} \approx \begin{pmatrix} 0.707 & 1.414 \\ 1.414 & 0 \end{pmatrix}" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-violet-400 font-bold block mb-1">3. Row-wise Softmax:</span>
                                <div className="space-y-2">
                                    <div>
                                        <strong>Row 0:</strong> Exps: <MathEquation formula="e^{0.707} \approx 2.028, e^{1.414} \approx 4.112" />. Sum = 6.14.
                                        Probs: <MathEquation formula="[2.028/6.14, 4.112/6.14] \approx [0.33, 0.67]" />.
                                    </div>
                                    <div>
                                        <strong>Row 1:</strong> Exps: <MathEquation formula="e^{1.414} \approx 4.112, e^{0} = 1.0" />. Sum = 5.112.
                                        Probs: <MathEquation formula="[4.112/5.112, 1/5.112] \approx [0.80, 0.20]" />.
                                    </div>
                                </div>
                                <MathEquation formula="\mathbf{A} \approx \begin{pmatrix} 0.33 & 0.67 \\ 0.80 & 0.20 \end{pmatrix}" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-violet-400 font-bold block mb-1">4. Multiply by Value matrix (A V):</span>
                                <MathEquation formula="\mathbf{Z} = \mathbf{A}\mathbf{V} \approx \begin{pmatrix} 0.33 & 0.67 \\ 0.80 & 0.20 \end{pmatrix} \begin{pmatrix} 10 & 0 \\ 0 & 20 \end{pmatrix} = \begin{pmatrix} 0.33(10) & 0.67(20) \\ 0.80(10) & 0.20(20) \end{pmatrix} = \begin{pmatrix} 3.3 & 13.4 \\ 8.0 & 4.0 \end{pmatrix}" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 11.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-violet-400" />}>
                    11.5 — PyTorch Custom Self-Attention & Multi-Head Blocks
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a causal self-attention scaling calculation and multi-head subspace splitting.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class ScaledDotProductAttention(nn.Module):
    """
    Computes Scaled Dot-Product attention with optional causal masking.
    """
    def __init__(self, dropout: float = 0.0):
        super(ScaledDotProductAttention, self).__init__()
        self.dropout = nn.Dropout(dropout)

    def forward(self, q: torch.Tensor, k: torch.Tensor, v: torch.Tensor, mask: torch.Tensor = None) -> tuple:
        # q, k, v: [Batch, Heads, Seq_Len, Dim_Head]
        d_k = q.size(-1)
        
        # 1. Similarity Scores: [B, H, S, S]
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)
        
        # 2. Apply Causal/Padding Mask
        if mask is not None:
            # Mask value is -inf (or -1e9) to collapse probability to 0 in softmax
            scores = scores.masked_fill(mask == 0, -1e9)
            
        # 3. Softmax alignment
        attn_probs = F.softmax(scores, dim=-1)
        attn_probs = self.dropout(attn_probs)
        
        # 4. Values weighted aggregation
        output = torch.matmul(attn_probs, v)
        
        return output, attn_probs

class CustomMultiHeadAttention(nn.Module):
    """
    Splits embeddings into multiple heads, computes attention, and projects back.
    """
    def __init__(self, d_model: int, n_heads: int, dropout: float = 0.0):
        super(CustomMultiHeadAttention, self).__init__()
        assert d_model % n_heads == 0, "Embedding size d_model must be divisible by head count"
        
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        # Linear projection matrices
        self.q_linear = nn.Linear(d_model, d_model)
        self.k_linear = nn.Linear(d_model, d_model)
        self.v_linear = nn.Linear(d_model, d_model)
        self.out_projection = nn.Linear(d_model, d_model)
        
        self.attention = ScaledDotProductAttention(dropout)

    def forward(self, q: torch.Tensor, k: torch.Tensor, v: torch.Tensor, mask: torch.Tensor = None) -> tuple:
        batch_size = q.size(0)
        
        # 1. Apply linear projections and reshape to [Batch, Heads, Seq_Len, d_k]
        q_heads = self.q_linear(q).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        k_heads = self.k_linear(k).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        v_heads = self.v_linear(v).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # 2. Compute Scaled Dot Product attention
        out_heads, weights = self.attention(q_heads, k_heads, v_heads, mask)
        
        # 3. Concatenate heads back and apply output projection
        out_concat = out_heads.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        
        return self.out_projection(out_concat), weights

if __name__ == "__main__":
    # Test MHA
    batch = 2
    seq_len = 5
    emb_dim = 64
    heads = 4
    
    mha = CustomMultiHeadAttention(d_model=emb_dim, n_heads=heads)
    x = torch.randn(batch, seq_len, emb_dim)
    
    # Causal mask configuration (lower triangular)
    causal_mask = torch.tril(torch.ones(seq_len, seq_len)).view(1, 1, seq_len, seq_len)
    
    out, weights = mha(x, x, x, mask=causal_mask)
    print("Multi-Head Attention output shape:", out.shape) # Should be [2, 5, 64]
    print("Attention matrix shape:", weights.shape)       # Should be [2, 4, 5, 5]`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
