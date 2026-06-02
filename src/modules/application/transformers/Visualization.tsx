import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Cpu, RotateCw, Play, SkipForward, RotateCcw, GitMerge, Layers } from 'lucide-react';
import { MathEquation } from '../../../components/MathEquation';

export const Visualization: React.FC = () => {
    const [subTab, setSubTab] = useState<'attention' | 'kvcache' | 'rope' | 'flashattn' | 'moe' | 'pagedattn' | 'specdec' | 'lora'>('attention');

    return (
        <div className="space-y-6 text-slate-300 font-sans pb-16">
            {/* Sub-tab Navigation */}
            <div className="flex flex-wrap border-b border-white/10 bg-slate-950/40 rounded-xl p-1.5 w-fit gap-1">
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
                    KV Cache
                </button>
                <button
                    onClick={() => setSubTab('rope')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'rope'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    RoPE
                </button>
                <button
                    onClick={() => setSubTab('flashattn')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'flashattn'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    FlashAttention
                </button>
                <button
                    onClick={() => setSubTab('moe')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'moe'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    MoE
                </button>
                <button
                    onClick={() => setSubTab('pagedattn')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'pagedattn'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    PagedAttention
                </button>
                <button
                    onClick={() => setSubTab('specdec')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'specdec'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    Speculative Decoding
                </button>
                <button
                    onClick={() => setSubTab('lora')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        subTab === 'lora'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    LoRA Matrix
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
                    {subTab === 'flashattn' && <FlashAttentionSimulator />}
                    {subTab === 'moe' && <MoESimulator />}
                    {subTab === 'pagedattn' && <PagedAttentionSimulator />}
                    {subTab === 'specdec' && <SpeculativeDecodingSimulator />}
                    {subTab === 'lora' && <LoRASimulator />}
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
    const [isCausal, setIsCausal] = useState<boolean>(false);
    const [hoveredTokenIdx, setHoveredTokenIdx] = useState<number | null>(null);

    // Clean tokens
    const tokens = text.toUpperCase().match(/\b[A-Z0-9']+\b/g) || [];

    // Dynamic attention weight generation based on Head Type and Masking
    const getAttentionWeights = () => {
        const N = tokens.length;
        if (N === 0) return [];
        const weights: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));

        for (let i = 0; i < N; i++) {
            const rowScores = Array(N).fill(0);
            if (selectedHead === 0) {
                // Head 1: Adjacent attention
                for (let j = 0; j < N; j++) {
                    if (i === j) rowScores[j] = 2.0;
                    else if (Math.abs(i - j) === 1) rowScores[j] = 1.5;
                    else rowScores[j] = 0.2;
                }
            } else if (selectedHead === 1) {
                // Head 2: Key-word / Semantic attention
                const keywords = ["CAT", "SAT", "MAT", "ATTENTION", "MODELS", "PREDICT", "TOKENS"];
                for (let j = 0; j < N; j++) {
                    const isKey = keywords.includes(tokens[j]);
                    rowScores[j] = isKey ? 2.5 : 0.4;
                }
            } else if (selectedHead === 2) {
                // Head 3: Global / Uniform attention
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

            // Apply causal masking (j > i scores are set to -1e9, yielding 0% probability)
            if (isCausal) {
                for (let j = 0; j < N; j++) {
                    if (j > i) {
                        rowScores[j] = -1e9;
                    }
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
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Eye className="text-orange-400" size={18} />
                        Multi-Head Attention Simulator
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Select a head behavior to visualize attention weight distribution. Toggle causal masking on to inspect decoder-only behavior.
                    </p>
                </div>

                {/* Causal Masking Toggle */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-mono font-bold px-2 uppercase">Causal Mask</span>
                    <button
                        onClick={() => setIsCausal(!isCausal)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                            isCausal
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                    >
                        {isCausal ? 'Causal (Decoder)' : 'Bidirectional (Encoder)'}
                    </button>
                </div>
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
                    { id: 3, label: "First-Token Focus", desc: "Attends heavily to index 0" }
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
                                const isMasked = isCausal && tgtIdx > srcIdx;
                                if (weight < 0.05 || isMasked) return null;

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

                    {/* Bottom Row (Target) */}
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
                                    const isMasked = isCausal && tgtIdx > srcIdx;
                                    const percent = (val * 100).toFixed(0);
                                    return (
                                        <div
                                            key={`cell-${srcIdx}-${tgtIdx}`}
                                            className={`w-16 h-10 rounded border flex flex-col items-center justify-center transition-all ${
                                                isMasked
                                                    ? 'bg-slate-950/20 border-slate-900/60 text-slate-700 opacity-30 select-none'
                                                    : ''
                                            }`}
                                            style={!isMasked ? {
                                                backgroundColor: `rgba(249, 115, 22, ${Math.min(val * 0.35, 0.4)})`,
                                                borderColor: hoveredTokenIdx === srcIdx ? 'rgba(249, 115, 22, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                                            } : undefined}
                                        >
                                            <span className="font-bold text-[9px]">
                                                {isMasked ? '-∞' : `${percent}%`}
                                            </span>
                                            {isMasked && <span className="text-[7px] text-slate-800 uppercase font-mono">masked</span>}
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

    const getStats = (step: number) => {
        const baseLen = PROMPT_TOKENS.length;
        const totalLen = baseLen + step;

        let totalFlopsNoCache = 0;
        let totalFlopsWithCache = 0;
        let memoryReadsNoCache = 0;
        let memoryReadsWithCache = 0;

        for (let i = 0; i <= step; i++) {
            const currentLen = baseLen + i;
            totalFlopsNoCache += currentLen * currentLen * 20;
            memoryReadsNoCache += currentLen * 50;

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
                    Compare key-value cache memory reuse versus fully recalculating sequence representations at each decoding step.
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
                    {PROMPT_TOKENS.map((tk, i) => (
                        <div key={`pr-${i}`} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850/60 text-xs font-mono font-bold text-slate-400">
                            {tk}
                        </div>
                    ))}

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

    const thetaBase = 30 * Math.PI / 180;
    const qAngle = qPos * thetaBase;
    const kAngle = kPos * thetaBase;

    const qLength = 65;
    const kLength = 65;

    const qx = 100 + qLength * Math.cos(qAngle);
    const qy = 100 - qLength * Math.sin(qAngle);
    const kx = 100 + kLength * Math.cos(kAngle);
    const ky = 100 - kLength * Math.sin(kAngle);

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
                    The inner product is invariant to absolute translation and depends entirely on relative distance.
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
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                        <circle cx="100" cy="100" r="40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1="15" y1="100" x2="185" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="100" y1="15" x2="100" y2="185" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

                        <path
                            d={`M 100 100 L 140 100 A 40 40 0 ${Math.abs(qAngle - kAngle) > Math.PI ? 1 : 0} 0 ${100 + 40 * Math.cos(qAngle)} ${100 - 40 * Math.sin(qAngle)} Z`}
                            fill="rgba(249, 115, 22, 0.05)"
                            stroke="rgba(249, 115, 22, 0.15)"
                            strokeWidth="1"
                        />

                        <line x1="100" y1="100" x2={qx} y2={qy} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                        <circle cx={qx} cy={qy} r="4" fill="#fb923c" />
                        <text x={qx + 5} y={qy - 5} fill="#fb923c" fontSize="9" fontWeight="bold" className="font-mono">q_m</text>

                        <line x1="100" y1="100" x2={kx} y2={ky} stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        <circle cx={kx} cy={ky} r="4" fill="#34d399" />
                        <text x={kx + 5} y={ky + 10} fill="#34d399" fontSize="9" fontWeight="bold" className="font-mono">k_n</text>

                        <circle cx="100" cy="100" r="3" fill="#cbd5e1" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 4: FlashAttention SRAM Tiling Simulator
   ═══════════════════════════════════════════════════════════════════════ */

const FlashAttentionSimulator: React.FC = () => {
    const [step, setStep] = useState<number>(0);

    // Step configuration
    const steps = [
        {
            title: "1. Load First Query Block",
            desc: "Load block Q_0 from High Bandwidth Memory (HBM) into fast GPU SRAM. This block contains queries for the first chunk of tokens.",
            q: "Q_0 [B_c × d_k]",
            kv: "Empty",
            stats: { m: '-∞', d: '0', O: '0' },
            activeMem: "hbm-q"
        },
        {
            title: "2. Load First Key-Value Block",
            desc: "Load K_0 and V_0 blocks from HBM into SRAM. We will now compute the attention scores for Q_0 attending to the K_0 segment.",
            q: "Q_0 [B_c × d_k]",
            kv: "K_0, V_0 [B_r × d_k]",
            stats: { m: '-∞', d: '0', O: '0' },
            activeMem: "hbm-kv"
        },
        {
            title: "3. Compute Local Dot-Products",
            desc: "SRAM computes S_local = Q_0 * K_0^T. Because this is kept in local SRAM, we do not write the large intermediate S matrix back to slow HBM.",
            q: "Q_0 [B_c × d_k]",
            kv: "K_0, V_0 [B_r × d_k]",
            stats: { m: '1.20', d: '1.0', O: '0' },
            activeMem: "sram-comp"
        },
        {
            title: "4. Compute Local Softmax & Output",
            desc: "Compute local max m_0 = 1.20 and sum of exps d_0 = 3.44. Apply softmax to scale V_0 and compile the initial output block O_0.",
            q: "Q_0 [B_c × d_k]",
            kv: "K_0, V_0 [B_r × d_k]",
            stats: { m: '1.20', d: '3.44', O: 'O_0 (local)' },
            activeMem: "sram-comp"
        },
        {
            title: "5. Load Second Key-Value Block",
            desc: "Clear K_0/V_0 from SRAM. Load the next block K_1 and V_1 from HBM. Q_0 remains in SRAM to accumulate the attention contribution.",
            q: "Q_0 [B_c × d_k]",
            kv: "K_1, V_1 [B_r × d_k]",
            stats: { m: '1.20', d: '3.44', O: 'O_0 (local)' },
            activeMem: "hbm-kv"
        },
        {
            title: "6. Compute New Local Dot-Products",
            desc: "Compute new similarity scores S_new = Q_0 * K_1^T in SRAM. We find a new local maximum score of 1.80.",
            q: "Q_0 [B_c × d_k]",
            kv: "K_1, V_1 [B_r × d_k]",
            stats: { m: '1.80', d: '3.44', O: 'O_0 (local)' },
            activeMem: "sram-comp"
        },
        {
            title: "7. Update Global Scaling Variables",
            desc: "Execute online softmax updates! Rescale old sum d_new = d_old * e^(m_old - m_new) + sum(e^(S_new - m_new)) = 3.44 * e^(-0.6) + 2.15 = 4.04.",
            q: "Q_0 [B_c × d_k]",
            kv: "K_1, V_1 [B_r × d_k]",
            stats: { m: '1.80', d: '4.04', O: 'O_0 (local)' },
            activeMem: "sram-comp"
        },
        {
            title: "8. Update Output Accumulator",
            desc: "Rescale old output O_0 by e^(m_old - m_new) = e^(-0.6) and add the contribution of V_1. We now have the globally scaled Output block O_0.",
            q: "Q_0 [B_c × d_k]",
            kv: "K_1, V_1 [B_r × d_k]",
            stats: { m: '1.80', d: '4.04', O: 'O_0 (final)' },
            activeMem: "sram-comp"
        },
        {
            title: "9. Write Output back to HBM",
            desc: "Write the finished Output block O_0 back to HBM. We have calculated exact attention for Q_0 without ever writing the S matrix to HBM!",
            q: "Empty",
            kv: "Empty",
            stats: { m: '-∞', d: '0', O: '0' },
            activeMem: "hbm-out"
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        setStep(prev => (prev < steps.length - 1 ? prev + 1 : 0));
    };

    const handleReset = () => {
        setStep(0);
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Layers className="text-orange-400" size={18} />
                    FlashAttention SRAM Tiling Simulator
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    FlashAttention uses block-wise tiling to compute attention without writing the $N \times N$ attention matrix to slow GPU memory (HBM).
                </p>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-orange-650 hover:bg-orange-550 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                    <SkipForward size={12} /> {step === steps.length - 1 ? "Restart" : "Next Step"}
                </button>
                <button
                    onClick={handleReset}
                    className="px-3 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-450 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                    <RotateCcw size={12} /> Reset
                </button>
            </div>

            {/* Stepper details */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-2">
                <h4 className="text-orange-400 font-bold text-sm font-sans">{currentStep.title}</h4>
                <p className="text-xs text-slate-350 leading-relaxed">{currentStep.desc}</p>
            </div>

            {/* Hardware layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HBM Block */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4 relative">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">GPU HBM (High Bandwidth Memory - SLOW)</span>
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono select-none">
                        <div className={`p-3 rounded border transition-all ${currentStep.activeMem === 'hbm-q' ? 'bg-orange-500/20 border-orange-500 text-white font-bold' : 'bg-slate-900/50 border-slate-800 text-slate-600'}`}>
                            Q_0
                        </div>
                        <div className="p-3 rounded border bg-slate-900/50 border-slate-800 text-slate-600">
                            Q_1
                        </div>
                        <div className={`p-3 rounded border transition-all ${currentStep.activeMem === 'hbm-kv' && step <= 3 ? 'bg-orange-500/20 border-orange-500 text-white font-bold' : 'bg-slate-900/50 border-slate-800 text-slate-600'}`}>
                            K_0, V_0
                        </div>
                        <div className={`p-3 rounded border transition-all ${currentStep.activeMem === 'hbm-kv' && step >= 4 ? 'bg-orange-500/20 border-orange-500 text-white font-bold' : 'bg-slate-900/50 border-slate-800 text-slate-600'}`}>
                            K_1, V_1
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">HBM Output Buffer:</span>
                        <span className={`px-2 py-0.5 rounded border ${currentStep.activeMem === 'hbm-out' ? 'bg-orange-500/25 border-orange-500 text-white font-bold' : 'bg-slate-900 border-slate-850 text-slate-600'}`}>
                            {step === 8 ? "O_0 (WRITTEN)" : "Empty"}
                        </span>
                    </div>
                </div>

                {/* SRAM Block */}
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4 relative">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">GPU SRAM Cache (Fast Local Memory)</span>
                    
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                        <div className="bg-slate-900/40 p-3 rounded border border-slate-850 flex justify-between">
                            <span className="text-slate-500">Query block:</span>
                            <span className={currentStep.q !== 'Empty' ? 'text-orange-400 font-bold' : 'text-slate-700'}>{currentStep.q}</span>
                        </div>
                        <div className="bg-slate-900/40 p-3 rounded border border-slate-850 flex justify-between">
                            <span className="text-slate-500">KV block:</span>
                            <span className={currentStep.kv !== 'Empty' ? 'text-orange-400 font-bold' : 'text-slate-700'}>{currentStep.kv}</span>
                        </div>
                    </div>

                    {/* Local Stats */}
                    <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 space-y-1.5 font-mono text-[9px]">
                        <span className="text-slate-500 font-bold block mb-1">Local Softmax scaling parameters:</span>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Row Max (m_i):</span>
                            <span className="text-white font-bold">{currentStep.stats.m}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Exps Sum (d_i):</span>
                            <span className="text-white font-bold">{currentStep.stats.d}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Output Accumulator (O_i):</span>
                            <span className="text-orange-400 font-bold">{currentStep.stats.O}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* FlashAttention mathematical comparison */}
            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">Online Softmax Update Equations</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-900/40 border border-slate-900 p-2 rounded">
                        <span className="text-orange-400 block mb-1">Rescaling sum d_i:</span>
                        <MathEquation formula="d_i^{\text{new}} = d_i e^{m_i - m_i^{\text{new}}} + \tilde{d}_i e^{\tilde{m}_i - m_i^{\text{new}}}" />
                    </div>
                    <div className="bg-slate-900/40 border border-slate-900 p-2 rounded">
                        <span className="text-orange-400 block mb-1">Rescaling output O_i:</span>
                        <MathEquation formula="O_i^{\text{new}} = \operatorname{diag}(e^{m_i - m_i^{\text{new}}}) O_i + \tilde{P}_i V_i" />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 5: Mixture of Experts (MoE) Routing
   ═══════════════════════════════════════════════════════════════════════ */

const MoESimulator: React.FC = () => {
    const presets = [
        "IF X > 0: RETURN TRUE",
        "THE RADON TRANSFORM OF THE IMAGE",
        "WRITE A POEM ABOUT GRADIENT DESCENT"
    ];

    const [prompt, setPrompt] = useState<string>(presets[0]);
    const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(0);

    const tokens = prompt.toUpperCase().match(/\b[A-Z0-9']+\b/g) || [];

    // Simulated Top-2 routing weights based on semantic tokens
    const getRoutingWeights = (idx: number) => {
        const token = tokens[idx] || "";
        const weights = [0.05, 0.05, 0.05, 0.05]; // Syntax, Code, Math, Creative

        const codeTriggers = ["IF", "RETURN", "TRUE", "X", "WRITE", "DEF", "WHILE"];
        const mathTriggers = ["RADON", "TRANSFORM", "IMAGE", "THE", "GRADIENT", "DESCENT"];
        const creativeTriggers = ["WRITE", "POEM", "ABOUT", "GRADIENT", "DESCENT"];

        if (codeTriggers.includes(token)) {
            weights[0] = 0.35; // Syntax
            weights[1] = 0.55; // Code
        } else if (mathTriggers.includes(token)) {
            weights[2] = 0.70; // Math
            weights[0] = 0.20; // Syntax
        } else if (creativeTriggers.includes(token)) {
            weights[3] = 0.65; // Creative
            weights[0] = 0.25; // Syntax
        } else {
            weights[0] = 0.40;
            weights[3] = 0.35;
        }

        // Normalize
        const sum = weights.reduce((a, b) => a + b, 0);
        return weights.map(w => w / sum);
    };

    const routingWeights = getRoutingWeights(selectedTokenIdx);

    // Find top-2 experts
    const experts = [
        { id: 0, name: "Syntax & Grammar", desc: "Extracts language structure", color: "border-blue-500/40 text-blue-400 bg-blue-500/5" },
        { id: 1, name: "Code & Logic", desc: "Executes conditional routing", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/5" },
        { id: 2, name: "Math & Science", desc: "Performs matrix and calculus transforms", color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/5" },
        { id: 3, name: "Creative & Retrieval", desc: "Generates semantic synthesis", color: "border-purple-500/40 text-purple-400 bg-purple-500/5" }
    ];

    const sortedIndices = routingWeights
        .map((w, i) => ({ w, i }))
        .sort((a, b) => b.w - a.w)
        .map(item => item.i);

    const top2 = sortedIndices.slice(0, 2);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <GitMerge className="text-orange-400" size={18} />
                    Mixture of Experts (MoE) Token Routing
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Select a token. Gating networks direct the active token to only the **Top-2** specialized experts dynamically.
                </p>
            </div>

            {/* Prompt presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-bold uppercase block">Token Prompt Presets</label>
                    <select
                        onChange={e => { setPrompt(e.target.value); setSelectedTokenIdx(0); }}
                        value={prompt}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none focus:border-orange-500/50 transition-all cursor-pointer font-sans"
                    >
                        {presets.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tokens display list */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Select a Token to Route</span>
                <div className="flex flex-wrap gap-2">
                    {tokens.map((tk, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedTokenIdx(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                                selectedTokenIdx === idx
                                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-md shadow-orange-500/5 scale-105'
                                    : 'bg-slate-900 border-slate-850 text-slate-450 hover:border-slate-850 hover:text-slate-350'
                            }`}
                        >
                            {tk}
                        </button>
                    ))}
                </div>
            </div>

            {/* Router Gate and Experts */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                {/* Active Token Router */}
                <div className="md:col-span-2 bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col items-center justify-center space-y-4 text-center h-full min-h-[190px]">
                    <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Routing Token</span>
                        <div className="text-xl font-bold text-white mt-1 font-mono">"{tokens[selectedTokenIdx]}"</div>
                    </div>
                    <div className="w-full bg-slate-900/60 border border-slate-900 rounded-lg p-3 font-mono text-[9px] leading-relaxed text-slate-450">
                        <span className="text-orange-400 block mb-1">Gating Softmax vector:</span>
                        {experts.map(exp => (
                            <div key={exp.id} className="flex justify-between">
                                <span>{exp.name}:</span>
                                <span className={top2.includes(exp.id) ? 'text-white font-bold' : ''}>
                                    {(routingWeights[exp.id] * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4 Experts panels */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {experts.map(exp => {
                        const isTop = top2.includes(exp.id);
                        return (
                            <div
                                key={exp.id}
                                className={`p-4 rounded-xl border transition-all duration-350 ${
                                    isTop
                                        ? `${exp.color} border-solid shadow-[0_0_15px_rgba(249,115,22,0.03)] scale-[1.02]`
                                        : 'bg-slate-950/20 border-slate-900/60 text-slate-650 opacity-40 select-none'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold font-sans">{exp.name}</span>
                                    {isTop && (
                                        <span className="text-[9px] font-mono font-bold bg-orange-500/10 px-1.5 py-0.5 rounded text-orange-400">
                                            ACTIVE (w={(routingWeights[exp.id]).toFixed(2)})
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] mt-1 leading-normal opacity-80">{exp.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Equation explanation */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1">MoE Sparse Gating Formulation</span>
                <MathEquation formula="y = \sum_{i \in \text{Top2}} G(x)_i \cdot E_i(x) \quad \text{where} \quad G(x) = \operatorname{softmax}(\operatorname{Top2}(x \cdot W_g, -\infty))" block />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 6: PagedAttention (vLLM)
   ═══════════════════════════════════════════════════════════════════════ */

const PagedAttentionSimulator: React.FC = () => {
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Layers className="text-orange-400" size={18} />
                    PagedAttention Virtual Memory Simulator
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    By dividing the KV cache into fixed-size physical blocks, vLLM eliminates memory fragmentation and allows dynamic sharing of prefixes.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Logical Token Sequences</span>
                    <div className="space-y-3 font-mono text-xs">
                        <div className="p-3 bg-slate-900 rounded border border-slate-800 flex flex-wrap gap-1">
                            <span className="w-full text-blue-400 font-bold mb-1">Request A (Length: 7)</span>
                            {['THE', 'QUICK', 'BROWN', 'FOX', 'JUMPS', 'OVER', 'THE'].map((tk, i) => (
                                <span key={`ra-${i}`} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[9px] border border-blue-500/30">blk_{Math.floor(i/3)}</span>
                            ))}
                        </div>
                        <div className="p-3 bg-slate-900 rounded border border-slate-800 flex flex-wrap gap-1">
                            <span className="w-full text-emerald-400 font-bold mb-1">Request B (Length: 5)</span>
                            {['HELLO', 'WORLD', 'HOW', 'ARE', 'YOU'].map((tk, i) => (
                                <span key={`rb-${i}`} className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] border border-emerald-500/30">blk_{Math.floor(i/3) + 3}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Physical Memory Pages (Block Size = 3)</span>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 p-2 rounded border border-blue-500/30 flex gap-1">
                            <div className="w-1/3 h-6 bg-blue-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-blue-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-blue-500/20 rounded"></div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-blue-500/30 flex gap-1">
                            <div className="w-1/3 h-6 bg-blue-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-blue-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-blue-500/20 rounded"></div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-blue-500/30 flex gap-1">
                            <div className="w-1/3 h-6 bg-blue-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-slate-800 rounded"></div>
                            <div className="w-1/3 h-6 bg-slate-800 rounded"></div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-emerald-500/30 flex gap-1">
                            <div className="w-1/3 h-6 bg-emerald-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-emerald-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-emerald-500/20 rounded"></div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded border border-emerald-500/30 flex gap-1">
                            <div className="w-1/3 h-6 bg-emerald-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-emerald-500/20 rounded"></div>
                            <div className="w-1/3 h-6 bg-slate-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 7: Speculative Decoding
   ═══════════════════════════════════════════════════════════════════════ */

const SpeculativeDecodingSimulator: React.FC = () => {
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <SkipForward className="text-orange-400" size={18} />
                    Speculative Decoding Verification
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    A small Draft Model proposes tokens. The Target Model evaluates all tokens in a single parallel pass, accepting them up to the first disagreement.
                </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-6 text-center">
                <div className="flex justify-center items-center gap-4">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Draft Proposal (Fast)</span>
                        <div className="flex gap-2 font-mono text-xs text-slate-300">
                            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">The</span>
                            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">cat</span>
                            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">sat</span>
                            <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">on</span>
                        </div>
                    </div>
                    <div className="text-orange-500 font-bold">→</div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Target Verification (Parallel)</span>
                        <div className="flex gap-2 font-mono text-xs text-white">
                            <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-400">The</span>
                            <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-400">cat</span>
                            <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded line-through text-red-400">sat</span>
                            <span className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded opacity-50 text-slate-500">on</span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-400 max-w-lg mx-auto">
                    Target model rejected "sat" (it would have generated "jumped"). Tokens "The" and "cat" are accepted for free in one single step!
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SIMULATOR 8: LoRA Rank Matrix
   ═══════════════════════════════════════════════════════════════════════ */

const LoRASimulator: React.FC = () => {
    const [rank, setRank] = useState<number>(8);
    const dModel = 4096;
    
    const fullParams = dModel * dModel;
    const loraParams = 2 * dModel * rank;
    const savings = ((fullParams - loraParams) / fullParams) * 100;

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="text-orange-400" size={18} />
                    LoRA: Low-Rank Adaptation
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Adjust the Rank ($r$) slider to see how low-rank matrices $A$ and $B$ approximate the massive weight updates $\Delta W$, slashing trainable parameters.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-slate-450 flex justify-between text-xs font-bold uppercase">
                            <span>Matrix Rank (r)</span>
                            <span className="text-orange-400">r = {rank}</span>
                        </label>
                        <input
                            type="range" min="1" max="128" step="1" value={rank}
                            onChange={e => setRank(parseInt(e.target.value))}
                            className="w-full accent-orange-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>
                    
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Base Weight W_0 (Frozen):</span>
                            <span className="text-white font-bold">{fullParams.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">LoRA A + B (Trainable):</span>
                            <span className="text-orange-400 font-bold">{loraParams.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-900 pt-3 text-emerald-400 font-bold text-center">
                            Trainable params reduced by {savings.toFixed(2)}%!
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-center items-center gap-4 text-center font-mono text-[10px]">
                    <div>
                        <div className="w-32 h-32 bg-slate-800 rounded-lg flex items-center justify-center border-2 border-slate-600 opacity-50">
                            W_0<br/>{dModel}×{dModel}
                        </div>
                        <div className="mt-2 text-slate-500 font-bold">Frozen Base</div>
                    </div>
                    <div className="text-2xl text-slate-500">+</div>
                    <div className="flex flex-col gap-2 items-center">
                        <div className="w-32 bg-orange-500/20 border border-orange-500/50 rounded flex items-center justify-center text-orange-400 transition-all" style={{ height: `${Math.max(20, rank * 1.5)}px` }}>
                            B ({dModel}×{rank})
                        </div>
                        <div className="w-32 bg-orange-500/20 border border-orange-500/50 rounded flex items-center justify-center text-orange-400 transition-all" style={{ height: `${Math.max(20, rank * 1.5)}px` }}>
                            A ({rank}×{dModel})
                        </div>
                        <div className="text-orange-400 font-bold">Trainable LoRA</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
