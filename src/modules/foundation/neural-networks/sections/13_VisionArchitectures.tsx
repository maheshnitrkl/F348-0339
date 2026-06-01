import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutGrid, 
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
    Image as ImageIcon
} from 'lucide-react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#a78bfa' }) => (
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
   SUB-WIDGET 1: ViT Patch Slicer & Attention Map
   ═══════════════════════════════════════════════════════════════════════ */

const ViTPatchMap: React.FC = () => {
    const [focusedIdx, setFocusedIdx] = useState<number>(5); // Default: center patch 5

    // Mock attention weights α from focusedIdx to all 16 patches
    const getAttentionWeights = (from: number) => {
        const weights = Array.from({ length: 16 }, () => 0.03); // baseline background
        
        // Define high attention links representing semantic connection
        weights[from] = 0.35; // self attention
        
        // Mocking semantic correlation mapping (e.g. if focused center, link to eyes/face region)
        const faceRegion = [5, 6, 9, 10];
        if (faceRegion.includes(from)) {
            faceRegion.forEach(idx => {
                if (idx !== from) weights[idx] = 0.15;
            });
            weights[0] = 0.05; // background link
        } else {
            // Background patches link to adjacent background
            const neighbors = [from - 1, from + 1, from - 4, from + 4];
            neighbors.forEach(n => {
                if (n >= 0 && n < 16) weights[n] = 0.18;
            });
        }

        // Normalize sum to 1
        const sum = weights.reduce((a, b) => a + b, 0);
        return weights.map(w => w / sum);
    };

    const attn = getAttentionWeights(focusedIdx);

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">ViT Self-Attention Patch Slicer</span>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                {/* 4x4 Patch Grid */}
                <div className="grid grid-cols-4 gap-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-900">
                    {Array.from({ length: 16 }).map((_, idx) => {
                        const alpha = attn[idx];
                        const isFocused = idx === focusedIdx;
                        return (
                            <button
                                key={`patch-${idx}`}
                                onClick={() => setFocusedIdx(idx)}
                                className="w-10 h-10 rounded border border-slate-850 relative overflow-hidden transition-all duration-200 hover:border-violet-500"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(139, 92, 246, ${isFocused ? 0.7 : alpha * 1.5}), rgba(139, 92, 246, ${isFocused ? 0.7 : alpha * 1.5}))`,
                                }}
                            >
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-slate-350">
                                    P{idx}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Calculation breakdown */}
                <div className="text-[10px] font-mono text-slate-400 space-y-2 flex-1">
                    <span className="text-slate-500 block">Query Token patch: P{focusedIdx}</span>
                    <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Top-3 Attention Links:</span>
                        {attn
                            .map((val, idx) => ({ val, idx }))
                            .sort((a, b) => b.val - a.val)
                            .slice(0, 3)
                            .map((item, i) => (
                                <div key={i} className="flex justify-between">
                                    <span>P{focusedIdx} → P{item.idx}:</span>
                                    <span className="text-violet-400 font-bold">{(item.val * 100).toFixed(1)}%</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Click on any patch in the grid. Self-attention enables non-local, global communication in a single layer. Notice how focused patches align immediately to distant, semantically-related features (e.g. face regions).
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: Swin Shifted Window Grid
   ═══════════════════════════════════════════════════════════════════════ */

const SwinWindowGrid: React.FC = () => {
    const [isShifted, setIsShifted] = useState<boolean>(false);

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Swin Shifted Window Partitioning</span>
                <button
                    onClick={() => setIsShifted(!isShifted)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        isShifted 
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                            : 'bg-slate-900 text-slate-450'
                    }`}
                >
                    {isShifted ? 'Shifted Windows' : 'Standard Windows'}
                </button>
            </div>

            {/* Grid SVG illustrating windows */}
            <div className="flex justify-center bg-slate-905 p-2 rounded-lg border border-slate-900">
                <svg width="180" height="180" className="block">
                    {/* Background patches */}
                    {Array.from({ length: 4 }).map((_, r) => 
                        Array.from({ length: 4 }).map((_, c) => (
                            <rect 
                                key={`rect-${r}-${c}`}
                                x={c * 40 + 10} 
                                y={r * 40 + 10} 
                                width="36" 
                                height="36" 
                                fill="#1e293b" 
                                rx="2" 
                                opacity="0.35"
                            />
                        ))
                    )}

                    {/* Window Partition Boundaries */}
                    {isShifted ? (
                        // Shifted: partition shifted by 1 patch (40px)
                        <>
                            {/* Window 1: 3x3 patches */}
                            <rect x="8" y="8" width="120" height="120" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="3,3" />
                            {/* Boundary lines */}
                            <line x1="128" y1="8" x2="128" y2="168" stroke="#ef4444" strokeWidth="2" />
                            <line x1="8" y1="128" x2="168" y2="128" stroke="#ef4444" strokeWidth="2" />
                        </>
                    ) : (
                        // Standard: four 2x2 windows
                        <>
                            <rect x="8" y="8" width="80" height="80" fill="none" stroke="#a78bfa" strokeWidth="2" />
                            <rect x="92" y="8" width="80" height="80" fill="none" stroke="#a78bfa" strokeWidth="2" />
                            <rect x="8" y="92" width="80" height="80" fill="none" stroke="#a78bfa" strokeWidth="2" />
                            <rect x="92" y="92" width="80" height="80" fill="none" stroke="#a78bfa" strokeWidth="2" />
                        </>
                    )}
                </svg>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                {isShifted
                    ? 'Shifted window partitions translate boundaries by half a window. This allows cross-window connections to be learned across layers while maintaining local window O(N) complexity.'
                    : 'Standard windows restrict self-attention to independent local grids. This prevents long-range global communication.'
                }
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: CLIP Contrastive Alignment
   ═══════════════════════════════════════════════════════════════════════ */

const CLIPAlignment: React.FC = () => {
    const [epoch, setEpoch] = useState<number>(0);

    const getClipSimilarities = () => {
        // T: target diagonal should go up, off-diagonal down
        const t = epoch / 10;
        
        // Cosine scores mapping: [Image_Idx][Text_Idx]
        const baseMatrix = [
            [0.35, 0.30, 0.35], // Dog
            [0.28, 0.44, 0.28], // Cat
            [0.33, 0.33, 0.34]  // Car
        ];

        const targetMatrix = [
            [0.92, 0.05, 0.03],
            [0.04, 0.94, 0.02],
            [0.02, 0.03, 0.95]
        ];

        // Interpolate linearly
        const currentMatrix = baseMatrix.map((row, r) => 
            row.map((val, c) => val * (1 - t) + targetMatrix[r][c] * t)
        );

        // Loss calculation: -mean(log(diagonals))
        let sumLogDiag = 0;
        for (let i = 0; i < 3; i++) {
            sumLogDiag += Math.log(currentMatrix[i][i]);
        }
        const loss = -sumLogDiag / 3;

        return { currentMatrix, loss };
    };

    const { currentMatrix, loss } = getClipSimilarities();

    const labels = ["Dog", "Cat", "Car"];

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">CLIP Contrastive Alignment Matrix</span>

            {/* Slider */}
            <div className="space-y-1 text-xs font-sans">
                <label className="text-slate-400 flex justify-between">
                    <span>Training Epochs</span>
                    <span className="font-mono text-violet-400 font-bold">{epoch} / 10</span>
                </label>
                <input type="range" min="0" max="10" value={epoch} onChange={e => setEpoch(parseInt(e.target.value))} className="w-full accent-violet-500 h-1 bg-slate-850 rounded" />
            </div>

            {/* 3x3 Matrix Grid */}
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 space-y-1.5 font-mono text-[9px]">
                <div className="grid grid-cols-4 gap-1 text-center text-slate-500 font-bold">
                    <div></div>
                    <div>T: Dog</div>
                    <div>T: Cat</div>
                    <div>T: Car</div>
                </div>
                {labels.map((rowLabel, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-4 gap-1 items-center text-center">
                        <span className="text-slate-550 font-bold text-left px-1">I: {rowLabel}</span>
                        {Array.from({ length: 3 }).map((_, cIdx) => {
                            const val = currentMatrix[rIdx][cIdx];
                            const isDiag = rIdx === cIdx;
                            return (
                                <div 
                                    key={cIdx} 
                                    className={`py-1 rounded text-center transition-all ${
                                        isDiag 
                                            ? 'bg-violet-500/20 text-violet-400 font-bold border border-violet-550/30' 
                                            : 'bg-slate-950 text-slate-600'
                                    }`}
                                    style={isDiag ? { opacity: 0.4 + val * 0.6 } : {}}
                                >
                                    {val.toFixed(2)}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[10px] flex justify-between items-center">
                <span>Contrastive InfoNCE Loss:</span>
                <span className="text-violet-400 font-bold">{loss.toFixed(4)}</span>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                As training epochs increase, the cross-modal similarity diagonal expands toward 1.0, aligning text query captions directly with their matching visual pixel frames.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const VisionArchitectures: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-violet-400 mb-4">
                    <LayoutGrid size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 13</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-500 mb-4">
                    Computer Vision Architectures
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Map spatial dimensions to global semantic models. Derive Vision Transformer patch embedding algorithms, 
                    Swin sliding complexity constraints, and cross-modal CLIP alignment projections.
                </p>
            </motion.div>

            {/* ─── 13.1 VISUAL TOPOGRAPHIES ──────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-violet-400" />}>
                    13.1 — Slicing Puzzles: Vision Transformers & Swin
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Image Puzzle Analogy">
                        If you want to solve an image puzzle, a standard **CNN** acts like looking at adjacent puzzle pieces one group at a time. It works outward slowly to understand the whole picture. 
                        A **Vision Transformer (ViT)** acts like slicing the entire picture into 16 square segments right away. You label each square piece with a coordinate sticker (positional embedding), lay them all out on a table, and compare every single piece to every other piece simultaneously to construct global relationships in one step.
                        **Swin** acts like grouping adjacent puzzle pieces into local tables first, then joining adjacent tables to keep complexity low.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        While CNNs utilize strict local receptive field convolutions, Vision Transformers (ViTs) demonstrate that applying standard self-attention directly over flattened image patches scales more effectively for large pretraining datasets.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 13.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-violet-400" />}>
                    13.2 — Patch Embedding Projections & Contrastive Alignment
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us derive the exact mathematics governing image patches, Swin computational complexity, and cross-modal contrastive learning.
                    </p>

                    <div className="space-y-8">
                        {/* ViT patch projection */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. ViT Patch Grid Projection</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                An image <MathEquation formula="\mathbf{x} \in \mathbb{R}^{H \times W \times C}" /> is divided into <MathEquation formula="N = \frac{HW}{P^2}" /> non-overlapping patches <MathEquation formula="\mathbf{x}_p \in \mathbb{R}^{N \times (P^2 C)}" /> of size <MathEquation formula="P \times P" />. Patches are projected linearly to dimension <MathEquation formula="D" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathbf{z}_0 = [\mathbf{x}_{\text{class}}; \mathbf{x}_p^1 \mathbf{E}; \dots; \mathbf{x}_p^N \mathbf{E}] + \mathbf{E}_{\text{pos}}" block />
                                <div className="text-left font-sans text-slate-500 text-[11px] mt-2">
                                    where <MathEquation formula="\mathbf{E} \in \mathbb{R}^{(P^2 C) \times D}" /> is the linear patch projection weight matrix, and <MathEquation formula="\mathbf{E}_{\text{pos}} \in \mathbb{R}^{(N+1) \times D}" /> contains absolute positional encodings.
                                </div>
                            </div>
                        </div>

                        {/* Swin Complexity */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Swin Shifted Window Complexity Analysis</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Global attention requires $O((hw)^2)$ calculations, which is prohibitive for high-resolution images. Swin restricts self-attention to local patches within a window of size <MathEquation formula="M \times M" />. The complexity comparison is:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                                <div className="flex justify-between"><span>Standard Global Self-Attention Complexity:</span> <MathEquation formula="\Omega(\text{Global}) = 4hwD^2 + 2(hw)^2D" /></div>
                                <div className="flex justify-between border-t border-slate-900 pt-2"><span>Swin Local Window Self-Attention Complexity:</span> <MathEquation formula="\Omega(\text{Swin}) = 4hwD^2 + 2M^2hwD" /></div>
                            </div>
                        </div>

                        {/* CLIP Contrastive Loss */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. CLIP Joint Contrastive InfoNCE Loss</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                CLIP aligns image embeddings <MathEquation formula="\mathbf{v}" /> and text embeddings <MathEquation formula="\mathbf{t}" /> symmetrically inside a shared embedding space. Given batch size <MathEquation formula="B" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="\mathcal{L} = \frac{1}{2B} \sum_{k=1}^B \left(\mathcal{L}_{\text{img}\to\text{txt}}^{(k)} + \mathcal{L}_{\text{txt}\to\text{img}}^{(k)}\right)" block />
                                <div className="text-center font-sans text-slate-500">where the directional image-to-text cross-entropy is:</div>
                                <MathEquation formula="\mathcal{L}_{\text{img}\to\text{txt}}^{(k)} = -\log \frac{\exp\left(\mathbf{v}_k^T \mathbf{t}_k / \tau\right)}{\sum_{j=1}^B \exp\left(\mathbf{v}_k^T \mathbf{t}_j / \tau\right)}" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-violet-400" />}>
                    13.3 — Vision Architectures Sandbox
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ViTPatchMap />
                    <SwinWindowGrid />
                    <CLIPAlignment />
                </div>
            </motion.section>

            {/* ─── 13.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-violet-400" />}>
                    13.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: ViT Patch Projection</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us project a single <MathEquation formula="2 \times 2" /> patch <MathEquation formula="\mathbf{x}_p" /> of a single-channel image to dimension <MathEquation formula="D = 3" />:
                            <MathEquation formula="\mathbf{x}_p = \begin{pmatrix} 1 & 0 \\ 2 & 1 \end{pmatrix} \implies \text{flat vector } \mathbf{x}_{\text{flat}} = \begin{pmatrix} 1 & 0 & 2 & 1 \end{pmatrix}" block />
                            Let projection matrix <MathEquation formula="\mathbf{E}" /> be:
                            <MathEquation formula="\mathbf{E} = \begin{pmatrix} 1.0 & 0.0 & -0.5 \\ 0.0 & 2.0 & 0.5 \\ 0.5 & -0.5 & 1.0 \\ -1.0 & 0.0 & 0.0 \end{pmatrix}" block />
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-2 leading-relaxed">
                            <div>
                                <span className="text-violet-400 font-bold block mb-1">Multiply flattened patch by E:</span>
                                <MathEquation formula="\mathbf{z} = \mathbf{x}_{\text{flat}} \mathbf{E}" block />
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    <div><MathEquation formula="z_0 = 1(1.0) + 0(0.0) + 2(0.5) + 1(-1.0) = 1.0 + 0 + 1.0 - 1.0 = 1.0" /></div>
                                    <div><MathEquation formula="z_1 = 1(0.0) + 0(2.0) + 2(-0.5) + 1(0.0) = 0 + 0 - 1.0 + 0 = -1.0" /></div>
                                    <div><MathEquation formula="z_2 = 1(-0.5) + 0(0.5) + 2(1.0) + 1(0.0) = -0.5 + 0 + 2.0 + 0 = 1.5" /></div>
                                </div>
                                <div className="mt-2 text-white font-bold">
                                    Output patch embedding: <MathEquation formula="\mathbf{z} = \begin{pmatrix} 1.0 & -1.0 & 1.5 \end{pmatrix}" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 13.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-violet-400" />}>
                    13.5 — PyTorch ViT Patch Projection & CLIP Loss
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing patch extraction using Conv2D structures and a symmetric CLIP InfoNCE contrastive loss module.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import torch.nn.functional as F

class PatchEmbedding(nn.Module):
    """
    Slices images into patches and projects them to embedding dimension D.
    """
    def __init__(self, image_size: int = 224, patch_size: int = 16, in_channels: int = 3, embed_dim: int = 768):
        super(PatchEmbedding, self).__init__()
        self.patch_size = patch_size
        self.num_patches = (image_size // patch_size) ** 2
        
        # Convolution projection performs slicing and projection in a single step
        self.projection = nn.Conv2d(
            in_channels, 
            embed_dim, 
            kernel_size=patch_size, 
            stride=patch_size
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [Batch, Channels, Height, Width]
        # projection output: [Batch, embed_dim, Height_out, Width_out]
        x_proj = self.projection(x)
        
        # Flatten spatial dimensions and transpose to sequence format: [Batch, num_patches, embed_dim]
        return x_proj.flatten(2).transpose(1, 2)

class CLIPLoss(nn.Module):
    """
    Computes symmetric InfoNCE contrastive loss over image and text pairs.
    """
    def __init__(self):
        super(CLIPLoss, self).__init__()

    def forward(self, image_embeddings: torch.Tensor, text_embeddings: torch.Tensor, logit_scale: torch.Tensor) -> torch.Tensor:
        # Normalize embeddings to unit vectors
        img_feats = F.normalize(image_embeddings, p=2, dim=-1)
        txt_feats = F.normalize(text_embeddings, p=2, dim=-1)
        
        # Cosine similarity matrix: [Batch, Batch]
        t = logit_scale.exp()
        logits = torch.matmul(img_feats, txt_feats.t()) * t
        
        # Symmetric ground-truth labels (identity matrix indexing diagonal positive pairs)
        labels = torch.arange(logits.size(0), device=logits.device)
        
        # Cross entropy loss along both directions
        loss_img = F.cross_entropy(logits, labels)
        loss_txt = F.cross_entropy(logits.t(), labels)
        
        return (loss_img + loss_txt) / 2.0

if __name__ == "__main__":
    # Test Patch Embedding
    x_img = torch.randn(2, 3, 224, 224)
    patch_embed = PatchEmbedding()
    print("ViT Patch Embedding output shape:", patch_embed(x_img).shape) # Should be [2, 196, 768]
    
    # Test CLIP Loss
    B = 4
    dim = 128
    img_emb = torch.randn(B, dim)
    txt_emb = torch.randn(B, dim)
    scale = nn.Parameter(torch.ones([]) * torch.log(torch.tensor(1.0 / 0.07))) # learnable log scale
    
    loss_module = CLIPLoss()
    loss_val = loss_module(img_emb, txt_emb, scale)
    print("Symmetric CLIP loss:", loss_val.item())`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
