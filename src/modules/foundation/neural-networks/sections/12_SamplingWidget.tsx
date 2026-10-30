import React, { useMemo, useState } from 'react';
import { RefreshCw, Dice5, Thermometer } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 4: Decoding/Sampling Playground (temperature · top-k · top-p)
   Covered nowhere else in the codebase: how an LLM turns raw logits into
   the next token, and how the three decoding hyperparameters reshape and
   truncate the next-token probability distribution.
   ═══════════════════════════════════════════════════════════════════════ */

// Plausible next-token candidates for the prompt: "The best neural ______"
const CANDIDATES: { token: string; baseLogit: number; kind: 'sensible' | 'creative' | 'junk' }[] = [
    { token: 'network',     baseLogit: 5.2, kind: 'sensible' },
    { token: 'architecture',baseLogit: 4.4, kind: 'sensible' },
    { token: 'algorithm',   baseLogit: 3.8, kind: 'sensible' },
    { token: 'hyperplane',  baseLogit: 2.9, kind: 'creative' },
    { token: 'manifold',    baseLogit: 2.7, kind: 'creative' },
    { token: 'loom',        baseLogit: 2.2, kind: 'creative' },
    { token: 'gradient',    baseLogit: 1.9, kind: 'creative' },
    { token: 'sandwich',    baseLogit: 1.4, kind: 'junk' },
    { token: 'poplar',      baseLogit: 0.9, kind: 'junk' },
    { token: 'quaffle',     baseLogit: 0.4, kind: 'junk' },
];

const KIND_COLOR: Record<string, string> = {
    sensible: '#38bdf8',
    creative: '#fb923c',
    junk: '#f43f5e',
};

const SamplingPlayground: React.FC = () => {
    const [temperature, setTemperature] = useState(0.7);
    const [topK, setTopK] = useState(10);        // 10 = effectively disabled
    const [topP, setTopP] = useState(1.0);       // 1.0 = effectively disabled
    const [draws, setDraws] = useState<string[]>([]);

    // temperature / top-k / top-p pipeline, recomputed per control change
    const { rows, kept, entropy } = useMemo(() => {
        // 1. temperature scaling: sharper (< 1) or flatter (> 1) logits
        const scaled = CANDIDATES.map(c => ({ ...c, logit: temperature === 0 ? (c.token === CANDIDATES[0].token ? 100 : -100) : c.baseLogit / temperature }));
        const maxLogit = Math.max(...scaled.map(s => s.logit));
        const exps = scaled.map(s => Math.exp(s.logit - maxLogit));   // stable softmax
        const expSum = exps.reduce((a, b) => a + b, 0);
        let rows = scaled.map((s, i) => ({ ...s, prob: exps[i] / expSum, excludedBy: undefined as string | undefined }));

        // 2. top-k truncation
        if (topK < rows.length) {
            const threshold = [...rows].sort((a, b) => b.prob - a.prob)[topK - 1].prob;
            rows = rows.map(r => (r.prob < threshold ? { ...r, excludedBy: 'top-k' } : r));
        }

        // 3. top-p (nucleus) truncation — keep the smallest set with cumulative prob ≥ p
        const sortedByProb = [...rows].sort((a, b) => b.prob - a.prob);
        let cumulative = 0;
        const nucleus = new Set<string>();
        for (const r of sortedByProb) {
            if (cumulative >= topP) break;
            nucleus.add(r.token);
            cumulative += r.prob;
        }
        if (topP < 1) {
            rows = rows.map(r => (nucleus.has(r.token) ? r : { ...r, excludedBy: r.excludedBy ?? 'top-p' }));
        }

        // renormalize survivors + Shannon entropy (bit ceiling of the choice)
        const surviving = rows.filter(r => !r.excludedBy);
        const renorm = surviving.reduce((a, b) => a + b.prob, 0);
        const final = rows.map(r => (r.excludedBy ? r : { ...r, prob: r.prob / renorm }));
        const keptProb = final.filter(r => !r.excludedBy);
        const H = -keptProb.reduce((a, r) => a + (r.prob > 0 ? r.prob * Math.log2(r.prob) : 0), 0);
        return { rows: final, kept: surviving.length, entropy: H };
    }, [temperature, topK, topP]);

    const maxProb = Math.max(...rows.map(r => r.prob));

    const sample = () => {
        let r = Math.random();
        for (const row of rows) {
            if (row.excludedBy) continue;
            r -= row.prob;
            if (r <= 0) {
                setDraws(d => [row.token, ...d].slice(0, 5));
                return;
            }
        }
        // fallback: greedy (floating-point rounding) — take the top token
        const top = rows.filter(r2 => !r2.excludedBy).sort((a, b) => b.prob - a.prob)[0];
        setDraws(d => [top.token, ...d].slice(0, 5));
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Dice5 size={12} /> Decoding Playground — Temperature, Top-k, Top-p
                </span>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Prompt: <span className="font-mono text-sky-400">&quot;The best neural ______&quot;</span>. The bars are the
                next-token probabilities after temperature shaping plus top-k / top-p truncation. Greyed bars are removed from the pool.
            </p>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1"><Thermometer size={10} /> temperature</span>
                        <span className="text-white font-bold">{temperature.toFixed(2)}</span>
                    </div>
                    <input type="range" min={0.05} max={2} step={0.05} value={temperature}
                        onChange={e => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-sky-400" />
                </div>
                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>top-k</span>
                        <span className="text-white font-bold">{topK === 10 ? 'off' : topK}</span>
                    </div>
                    <input type="range" min={1} max={10} step={1} value={topK}
                        onChange={e => setTopK(parseInt(e.target.value))}
                        className="w-full accent-sky-400" />
                </div>
                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>top-p</span>
                        <span className="text-white font-bold">{topP.toFixed(2)}</span>
                    </div>
                    <input type="range" min={0.05} max={1} step={0.05} value={topP}
                        onChange={e => setTopP(parseFloat(e.target.value))}
                        className="w-full accent-sky-400" />
                </div>
            </div>

            {/* Distribution bars */}
            <div className="space-y-1">
                {rows.map((row, idx) => {
                    const excluded = !!row.excludedBy;
                    return (
                        <div key={`${row.token}-${idx}`} className={`flex items-center gap-2 ${excluded ? 'opacity-35' : ''}`}>
                            <span className="w-20 text-[10px] font-mono text-slate-300 text-right truncate">{row.token}</span>
                            <div className="flex-1 h-4 bg-slate-900 rounded overflow-hidden relative" title={excluded ? `removed by ${row.excludedBy}` : undefined}>
                                <div
                                    className="h-full transition-all duration-200"
                                    style={{ width: `${(row.prob / maxProb) * 100}%`, backgroundColor: KIND_COLOR[row.kind] }}
                                />
                                <span className="absolute right-1 top-0 text-[9px] leading-4 font-mono text-white/80">{(row.prob * 100).toFixed(1)}%</span>
                            </div>
                            {excluded && <span className="text-[9px] font-mono text-slate-600 w-10">{row.excludedBy}</span>}
                        </div>
                    );
                })}
            </div>

            {/* Stats + sampler */}
            <div className="flex gap-2 flex-wrap items-center">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-900 font-mono text-[10px] flex gap-4">
                    <span>pool: <b className="text-sky-400">{kept}</b> tokens</span>
                    <span>choice entropy: <b className="text-sky-400">{entropy.toFixed(2)}</b> bits</span>
                </div>
                <button onClick={sample} className="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 text-[10px] font-bold flex items-center gap-1.5">
                    <Dice5 size={11} /> Sample
                </button>
                <button
                    onClick={() => setDraws([])}
                    className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[10px] flex items-center gap-1"
                    title="Clear draws"
                >
                    <RefreshCw size={10} />
                </button>
                {draws.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-400">
                        {'Sampled: '}
                        <b className="text-white">{draws.join(' · ')}</b>
                    </span>
                )}
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                T ≈ 0 → near-greedy (repeat-safe, dull); T ≈ 1 → calibrated; T &gt; 1 → flatter, riskier.
                Top-k clips the tail deterministically; top-p adapts the cut to shape of the distribution,
                keeping all fruitful options for a confident head and fewer for a uniform one.
            </p>
        </div>
    );
};

export { SamplingPlayground };
