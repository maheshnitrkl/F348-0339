import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Cpu, RotateCw, Play, SkipForward, RotateCcw } from 'lucide-react';
import { MathEquation } from '../../../components/MathEquation';

export const Visualization: React.FC = () => {
    const [subTab, setSubTab] = useState<'attention' | 'kvcache' | 'rope'>('attention');

    return (
        <div className="space-y-6 text-slate-300 font-sans pb-16">
            {/* Sub-tab Navigation */}
            <div className="flex border-b border-white/10 bg-slate-950/40 rounded-xl p-1.5 w-fit gap-1">
                <button
                    onClick={() => setSubTab('attention')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'attention'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Attention Matrix
                </button>
                <button
                    onClick={() => setSubTab('kvcache')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'kvcache'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    KV Cache Simulator
                </button>
                <button
                    onClick={() => setSubTab('rope')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'rope'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    RoPE Geometry
                </button>
            </div>

            {/* Sub-tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={subTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {subTab === 'attention' && <AttentionSimulator />}
                    {subTab === 'kvcache' && <KVCacheSimulator />}
                    {subTab === 'rope' && <RoPESimulator />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 1: Multi-Head Attention Alignment
   ═══════════════════════════════════════════════════════════════════════ */

const AttentionSimulator: React.FC = () => {
    const presets = [
        "The cat sat on the mat.",
        "Attention is all you need.",
        "Generative models predict next tokens."
    ];

    const [text, setText] = useState<string>(presets[0]);
    const [selectedHead, setSelectedHead] = useState<number>(0);
    const [hoveredTokenIdx, setHoveredTokenIdx] = useState<number | null>(null);

    // Clean tokens
    const tokens = text.toUpperCase().match(/\b[A-Z0-9']+\b/g) || [];

    // Dynamic attention weight generation based on Head Type
    const getAttentionWeights = () => {
        const N = tokens.length;
        if (N === 0) return [];
        const weights: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));

        for (let i = 0; i < N; i++) {
            const rowScores = Array(N).fill(0);
            if (selectedHead === 0) {
                // Head 1: Adjacent attention (attends to self & previous/next token)
                for (let j = 0; j < N; j++) {
                    if (i === j) rowScores[j] = 2.0;
                    else if (Math.abs(i - j) === 1) rowScores[j] = 1.5;
                    else rowScores[j] = 0.2;
                }
            } else if (selectedHead === 1) {
                // Head 2: Key-word / Semantic attention (attends to verbs and nouns)
                const keywords = ["CAT", "SAT", "MAT", "ATTENTION", "MODELS", "PREDICT", "TOKENS"];
                for (let j = 0; j < N; j++) {
                    const isKey = keywords.includes(tokens[j]);
                    rowScores[j] = isKey ? 2.5 : 0.4;
                }
            } else if (selectedHead === 2) {
                // Head 3: Global / Uniform attention (equal weight)
                for (let j = 0; j < N; j++) {
                    rowScores[j] = 1.0;
                }
            } else {
                // Head 4: First-token focus
                for (let j = 0; j < N; j++) {
                    if (j === 0) rowScores[j] = 3.0;
                    else rowScores[j] = 0.3;
                }
            }

            // Softmax row-wise
            const exps = rowScores.map(s => Math.exp(s));
            const sumExp = exps.reduce((a, b) => a + b, 0);
            weights[i] = exps.map(e => e / sumExp);
        }

        return weights;
    };

    const attentionMatrix = getAttentionWeights();

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Eye className="text-orange-400" size={18} />
                    Multi-Head Attention Simulator
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Select a head behavior to visualize how tokens distribute attention weights across the sequence. 
                    Hover over a token below to trace alignment connections.
                </p>
            </div>

            {/* Input & Presets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Custom Prompt</label>
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type a custom sentence..."
                        maxLength={50}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 outline-none focus:border-orange-500/50 transition-all font-sans"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Or select Preset</label>
                    <select
                        onChange={e => setText(e.target.value)}
                        value={text}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-orange-500/50 transition-all cursor-pointer font-sans"
                    >
                        {presets.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Head Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-2 border border-slate-800/80 rounded-xl">
                {[
                    { id: 0, label: "Positional Adjacent", desc: "Attends to surrounding context" },
                    { id: 1, label: "Semantic / Noun Focus", desc: "Highlights core content keywords" },
                    { id: 2, label: "Uniform Context", desc: "Attends evenly across sequence" },
                    { id: 3, label: "First-Token Delimiter Focus", desc: "Attends heavily to index 0" }
                ].map(head => (
                    <button
                        key={head.id}
                        onClick={() => setSelectedHead(head.id)}
                        className={`p-3 rounded-lg text-left border transition-all ${
                            selectedHead === head.id
                                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-md shadow-orange-500/5'
                                : 'bg-slate-950/20 border-transparent text-slate-500 hover:border-slate-800 hover:text-slate-350'
                        }`}
                    >
                        <div className="text-xs font-bold font-sans">{head.label}</div>
                        <div className="text-[10px] opacity-70 mt-0.5 leading-normal">{head.desc}</div>
                    </button>
                ))}
            </div>

            {/* SVG Alignment Connectors */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col items-center relative overflow-hidden select-none">
                <span className="absolute top-2 left-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Interactive Alignment Trace</span>

                <div className="w-full max-w-lg mt-8 flex flex-col gap-24 relative z-10">
                    {/* Top Row (Source) */}
                    <div className="flex justify-between w-full">
                        {tokens.map((tk, idx) => (
                            <div
                                key={`src-${idx}`}
                                onMouseEnter={() => setHoveredTokenIdx(idx)}
                                onMouseLeave={() => setHoveredTokenIdx(null)}
                                className={`px-2 py-1 rounded border text-[10px] font-mono transition-all cursor-pointer ${
                                    hoveredTokenIdx === idx
                                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-bold scale-105'
                                        : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                            >
                                {tk}
                            </div>
                        ))}
                    </div>

                    {/* SVG Connector Canvas */}
                    <svg className="absolute top-7 left-0 w-full h-[96px] pointer-events-none overflow-visible">
                        {tokens.map((_, srcIdx) => {
                            const showConnections = hoveredTokenIdx === null || hoveredTokenIdx === srcIdx;
                            return tokens.map((_, tgtIdx) => {
                                const weight = attentionMatrix[srcIdx]?.[tgtIdx] || 0;
                                if (weight < 0.05) return null;

                                // Approximate center coordinates
                                const count = tokens.length;
                                const x1 = (srcIdx + 0.5) * (100 / count);
                                const x2 = (tgtIdx + 0.5) * (100 / count);

                                return (
                                    <line
                                        key={`line-${srcIdx}-${tgtIdx}`}
                                        x1={`${x1}%`}
                                        y1="0"
                                        x2={`${x2}%`}
                                        y2="96"
                                        stroke="#f97316"
                                        strokeWidth={weight * 3.5}
                                        opacity={showConnections ? Math.max(weight * 0.8, 0.1) : 0.03}
                                        className="transition-all duration-300"
                                    />
                                );
                            });
                        })}
                    </svg>

                    {/* Bottom Row (Target / Context-Weighted) */}
                    <div className="flex justify-between w-full">
                        {tokens.map((tk, idx) => (
                            <div
                                key={`tgt-${idx}`}
                                className="px-2 py-1 rounded border bg-slate-900 border-slate-800 text-[10px] font-mono text-slate-500"
                            >
                                {tk}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Heatmap Matrix Display */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Softmax Attention Matrix (%)</span>
                <div className="overflow-x-auto">
                    <div className="min-w-[400px] flex flex-col gap-1.5 font-mono text-[10px]">
                        {/* Headers */}
                        <div className="flex gap-1.5 items-center">
                            <div className="w-16 text-right text-slate-600 font-bold pr-2">SOURCE</div>
                            {tokens.map((tk, idx) => (
                                <div key={`hdr-${idx}`} className="w-16 text-center text-slate-500 truncate" title={tk}>{tk}</div>
                            ))}
                        </div>

                        {/* Rows */}
                        {tokens.map((srcTk, srcIdx) => (
                            <div key={`row-${srcIdx}`} className="flex gap-1.5 items-center">
                                <div className="w-16 text-right text-slate-400 font-bold truncate pr-2" title={srcTk}>{srcTk}</div>
                                {tokens.map((_, tgtIdx) => {
                                    const val = attentionMatrix[srcIdx]?.[tgtIdx] || 0;
                                    const percent = (val * 100).toFixed(0);
                                    return (
                                        <div
                                            key={`cell-${srcIdx}-${tgtIdx}`}
                                            className="w-16 h-10 rounded border flex flex-col items-center justify-center transition-all"
                                            style={{
                                                backgroundColor: `rgba(249, 115, 22, ${Math.min(val * 0.35, 0.4)})`,
                                                borderColor: hoveredTokenIdx === srcIdx ? 'rgba(249, 115, 22, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                                            }}
                                        >
                                            <span className="text-white font-bold text-[9px]">{percent}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 2: KV Cache Autoregressive Stepper
   ═══════════════════════════════════════════════════════════════════════ */

const PROMPT_TOKENS = ["THE", "MODEL", "GENERATES"];
const GENERATION_LIST = ["A", "WORD", "TOKEN", "BY", "TOKEN", "WITH", "CACHING", "SPEED"];

const KVCacheSimulator: React.FC = () => {

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [useCache, setUseCache] = useState<boolean>(true);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    // Calculation parameters per token
    // Flops without cache: sum(4 * i) for i in 1..seq_len (computes Q, K, V for all tokens at every step)
    // Flops with cache: only compute Q, K, V for the newest token, plus compute self-attention scaling.
    const getStats = (step: number) => {
        const baseLen = PROMPT_TOKENS.length;
        const totalLen = baseLen + step;

        let totalFlopsNoCache = 0;
        let totalFlopsWithCache = 0;
        let memoryReadsNoCache = 0;
        let memoryReadsWithCache = 0;

        for (let i = 0; i <= step; i++) {
            const currentLen = baseLen + i;
            // No cache: projects weights for all currentLen tokens. FLOPs scale quadratically.
            totalFlopsNoCache += currentLen * currentLen * 20; // mock computational density
            memoryReadsNoCache += currentLen * 50;

            // With cache: projects weights only for 1 token at step i, plus computes dot products.
            totalFlopsWithCache += (1 * 20) + (currentLen * 5);
            memoryReadsWithCache += (1 * 50) + (currentLen * 10);
        }

        return {
            totalLen,
            noCacheFlops: totalFlopsNoCache,
            withCacheFlops: totalFlopsWithCache,
            noCacheMem: memoryReadsNoCache,
            withCacheMem: memoryReadsWithCache,
        };
    };

    const stats = getStats(currentStep);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRunning) {
            interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= GENERATION_LIST.length) {
                        setIsRunning(false);
                        return prev;
                    }
                    const next = prev + 1;
                    if (next >= GENERATION_LIST.length) {
                        setIsRunning(false);
                    }
                    return next;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    const handleReset = () => {
        setCurrentStep(0);
        setIsRunning(false);
    };

    const currentSequence = [...PROMPT_TOKENS, ...GENERATION_LIST.slice(0, currentStep)];

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="text-orange-400" size={18} />
                    KV Cache Performance Simulator
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Compare key-value cache memory reuse versus fully wiggling sequence calculations. 
                    Step forward to trigger auto-regressive generation and note the FLOPS scaling differences.
                </p>
            </div>

            {/* Mode Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        disabled={currentStep >= GENERATION_LIST.length}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-550 disabled:opacity-30 disabled:hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                        {isRunning ? <RotateCw className="animate-spin" size={13} /> : <Play size={13} />}
                        {isRunning ? 'Running...' : 'Auto Play'}
                    </button>
                    <button
                        onClick={() => setCurrentStep(prev => Math.min(GENERATION_LIST.length, prev + 1))}
                        disabled={currentStep >= GENERATION_LIST.length}
                        className="px-4 py-2 bg-slate-850 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                        <SkipForward size={13} /> Step Forward
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-450 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                        <RotateCcw size={13} /> Reset
                    </button>
                </div>

                <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                        onClick={() => setUseCache(true)}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                            useCache ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'text-slate-500'
                        }`}
                    >
                        KV CACHE ENABLED
                    </button>
                    <button
                        onClick={() => setUseCache(false)}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                            !useCache ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'text-slate-500'
                        }`}
                    >
                        RE-COMPUTE ALL
                    </button>
                </div>
            </div>

            {/* Generated Sequence Stream */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Output Generation stream</span>
                <div className="flex flex-wrap gap-2 min-h-12 items-center">
                    {/* Prompt Tokens (Gray) */}
                    {PROMPT_TOKENS.map((tk, i) => (
                        <div key={`pr-${i}`} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850/60 text-xs font-mono font-bold text-slate-400">
                            {tk}
                        </div>
                    ))}

                    {/* Generated Tokens (Orange) */}
                    {GENERATION_LIST.slice(0, currentStep).map((tk, i) => (
                        <motion.div
                            key={`gen-${i}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs font-mono font-bold text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                        >
                            {tk}
                        </motion.div>
                    ))}

                    {currentStep < GENERATION_LIST.length && (
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="w-2.5 h-4 bg-orange-400 rounded-sm ml-1"
                        />
                    )}
                </div>
            </div>

            {/* KV Cache Matrix Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KV Cache State */}
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">KV Cache Memory Storage Block</span>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Key Cache */}
                        <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 space-y-2">
                            <span className="text-[9px] font-bold text-orange-400 font-mono">KEY CACHE matrix (K_cache)</span>
                            <div className="flex flex-col gap-1 text-[9px] font-mono">
                                {currentSequence.map((tk, i) => (
                                    <div key={`k-c-${i}`} className="flex justify-between items-center bg-slate-950/80 px-2 py-1.5 rounded border border-slate-850">
                                        <span>k<sub>{i}</sub> ({tk})</span>
                                        <span className="text-slate-500 font-bold bg-slate-900 px-1 rounded">[1, h, d_k]</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Value Cache */}
                        <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 space-y-2">
                            <span className="text-[9px] font-bold text-orange-400 font-mono">VALUE CACHE matrix (V_cache)</span>
                            <div className="flex flex-col gap-1 text-[9px] font-mono">
                                {currentSequence.map((tk, i) => (
                                    <div key={`v-c-${i}`} className="flex justify-between items-center bg-slate-950/80 px-2 py-1.5 rounded border border-slate-850">
                                        <span>v<sub>{i}</sub> ({tk})</span>
                                        <span className="text-slate-500 font-bold bg-slate-900 px-1 rounded">[1, h, d_k]</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-[9px] font-sans text-slate-500 leading-relaxed">
                        * When cache is enabled, we only calculate <MathEquation formula="\mathbf{q}" />, <MathEquation formula="\mathbf{k}" />, and <MathEquation formula="\mathbf{v}" /> for the single new token at step <MathEquation formula="t" />. The queries query this whole key/value memory block in a single dot-product matrix.
                    </div>
                </div>

                {/* Efficiency Stats Card */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-3">Generation Stats</span>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Step index:</span>
                                <span className="text-white font-bold">{currentStep} / {GENERATION_LIST.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Seq length:</span>
                                <span className="text-white font-bold">{stats.totalLen} tokens</span>
                            </div>
                            <div className="border-t border-slate-900 pt-3 flex justify-between items-center">
                                <span className="text-slate-400">Total FLOPs:</span>
                                <div className="text-right">
                                    <div className="text-white font-bold">
                                        {useCache ? stats.withCacheFlops.toLocaleString() : stats.noCacheFlops.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-slate-500">
                                        {useCache ? 'O(N) linear complexity' : 'O(N²) quadratic complexity'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-slate-400">Memory Reads:</span>
                                <div className="text-right">
                                    <div className="text-white font-bold">
                                        {useCache ? stats.withCacheMem.toLocaleString() : stats.noCacheMem.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-slate-500">
                                        bandwidth load
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-900 text-[10px] text-center font-sans text-slate-400 leading-normal">
                        {useCache ? (
                            <span className="text-emerald-400 font-bold">
                                Cache saving: ~{(((stats.noCacheFlops - stats.withCacheFlops) / (stats.noCacheFlops || 1)) * 100).toFixed(0)}% FLOPS reduced!
                            </span>
                        ) : (
                            <span className="text-red-400 font-bold">
                                Recalculating old tokens wastes GPU core flops.
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 3: RoPE Rotation dynamics
   ═══════════════════════════════════════════════════════════════════════ */

const RoPESimulator: React.FC = () => {
    const [qPos, setQPos] = useState<number>(1);
    const [kPos, setKPos] = useState<number>(3);

    // Theta base angle (30 degrees per step)
    const thetaBase = 30 * Math.PI / 180;
    const qAngle = qPos * thetaBase;
    const kAngle = kPos * thetaBase;

    const qLength = 65;
    const kLength = 65;

    const qx = 100 + qLength * Math.cos(qAngle);
    const qy = 100 - qLength * Math.sin(qAngle);
    const kx = 100 + kLength * Math.cos(kAngle);
    const ky = 100 - kLength * Math.sin(kAngle);

    // Inner product decay is invariant of absolute position, only depends on distance |m - n|
    const dotProduct = Math.cos(qAngle - kAngle) * 1.0;

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <RotateCw className="text-orange-400" size={18} />
                    Rotary Position Embedding (RoPE) Geometry
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Adjust the position indexes of Query (<MathEquation formula="m" />) and Key (<MathEquation formula="n" />) to observe how vectors are rotated on a 2D slice. 
                    The inner product is invariant to absolute translation and decays as relative distance grows.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Inputs & Values */}
                <div className="space-y-5 text-sm font-sans">
                    <div className="space-y-1.5">
                        <label className="text-slate-450 flex justify-between text-xs font-bold">
                            <span>Query Token Position (m)</span>
                            <span className="font-mono text-orange-400 font-bold">m = {qPos} ({qPos * 30}° rotation)</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="6"
                            value={qPos}
                            onChange={e => setQPos(parseInt(e.target.value))}
                            className="w-full accent-orange-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-450 flex justify-between text-xs font-bold">
                            <span>Key Token Position (n)</span>
                            <span className="font-mono text-orange-400 font-bold">n = {kPos} ({kPos * 30}° rotation)</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="6"
                            value={kPos}
                            onChange={e => setKPos(parseInt(e.target.value))}
                            className="w-full accent-orange-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Relative distance (|m - n|):</span>
                            <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {Math.abs(qPos - kPos)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                            <span className="text-slate-500">Dot-product value (similarity):</span>
                            <span className="text-orange-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {dotProduct.toFixed(4)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SVG Visual Circle */}
                <div className="flex justify-center bg-slate-950/60 p-4 border border-slate-800 rounded-xl relative overflow-hidden">
                    <span className="absolute top-2 left-3 text-[9px] font-mono text-slate-650 uppercase tracking-wider">Complex Phase Space</span>
                    <svg width="200" height="200" className="block my-2">
                        {/* Circle grids */}
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                        <circle cx="100" cy="100" r="40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1="15" y1="100" x2="185" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="100" y1="15" x2="100" y2="185" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

                        {/* Angle Arc representation */}
                        <path
                            d={`M 100 100 L 140 100 A 40 40 0 ${Math.abs(qAngle - kAngle) > Math.PI ? 1 : 0} 0 ${100 + 40 * Math.cos(qAngle)} ${100 - 40 * Math.sin(qAngle)} Z`}
                            fill="rgba(249, 115, 22, 0.05)"
                            stroke="rgba(249, 115, 22, 0.15)"
                            strokeWidth="1"
                        />

                        {/* Query vector arrow */}
                        <line x1="100" y1="100" x2={qx} y2={qy} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                        <circle cx={qx} cy={qy} r="4" fill="#fb923c" />
                        <text x={qx + 5} y={qy - 5} fill="#fb923c" fontSize="9" fontWeight="bold" className="font-mono">q_m</text>

                        {/* Key vector arrow */}
                        <line x1="100" y1="100" x2={kx} y2={ky} stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        <circle cx={kx} cy={ky} r="4" fill="#34d399" />
                        <text x={kx + 5} y={ky + 10} fill="#34d399" fontSize="9" fontWeight="bold" className="font-mono">k_n</text>

                        {/* Center pivot */}
                        <circle cx="100" cy="100" r="3" fill="#cbd5e1" />
                    </svg>
                </div>
            </div>
            
            <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-white block mb-1">Mathematical Property Invariance:</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Because Rotary Position Embeddings (RoPE) represent pos-based adjustments as simple complex matrix rotations, calculating <MathEquation formula="\langle \mathbf{R}_m \mathbf{q}, \mathbf{R}_n \mathbf{k} \rangle" /> yields <MathEquation formula="\mathbf{q}^T \mathbf{R}_{n-m} \mathbf{k}" />. This mathematically guarantees that translation (shifting both words in a sentence by a constant amount) retains the identical query-key similarity.
                </p>
            </div>
        </div>
    );
};
