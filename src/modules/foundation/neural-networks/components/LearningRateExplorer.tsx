/* eslint-disable */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// ── Training Loop for a tiny regression network ───────────────────────────────
// Network: 2 inputs → 4 hidden (ReLU) → 1 output
// Task: learn y = sin(x) over [-π, π]

const relu = (x: number) => Math.max(0, x);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

interface Optimizer { type: 'sgd' | 'momentum' | 'adam'; lr: number; }

// Minimal scalar NN: y = w2 · relu(w1 · x + b1) + b2
// (Simplified 1D network for visualization clarity)
function trainStep(
    w1: number[], b1: number[], w2: number[], b2Ref: { v: number },
    xs: number[], ys: number[],
    opt: Optimizer,
    momentums: { dw1: number[]; db1: number[]; dw2: number[]; db2: number },
    adamState: { mw1: number[]; vw1: number[]; mb1: number[]; vb1: number[]; mw2: number[]; vw2: number[]; mb2: number; vb2: number; t: number },
) {
    const N = xs.length;
    const H = w1.length;
    const dw1 = new Array(H).fill(0);
    const db1 = new Array(H).fill(0);
    const dw2 = new Array(H).fill(0);
    let db2 = 0;
    let loss = 0;

    for (let i = 0; i < N; i++) {
        const x = xs[i]; const y = ys[i];
        // Forward
        const h = w1.map((w, j) => relu(w * x + b1[j]));
        const pred = h.reduce((s, hj, j) => s + w2[j] * hj, b2Ref.v);
        const err = pred - y;
        loss += err * err;

        // Backward
        h.forEach((hj, j) => {
            dw2[j] += err * hj;
            const dhj = err * w2[j] * (w1[j] * x + b1[j] > 0 ? 1 : 0);
            dw1[j] += dhj * x;
            db1[j] += dhj;
        });
        db2 += err;
    }

    // Apply optimizer
    const lr = opt.lr;
    if (opt.type === 'sgd') {
        for (let j = 0; j < H; j++) { w1[j] -= lr * dw1[j] / N; b1[j] -= lr * db1[j] / N; w2[j] -= lr * dw2[j] / N; }
        b2Ref.v -= lr * db2 / N;
    } else if (opt.type === 'momentum') {
        const beta = 0.9;
        for (let j = 0; j < H; j++) {
            momentums.dw1[j] = beta * momentums.dw1[j] + (1 - beta) * dw1[j] / N;
            momentums.db1[j] = beta * momentums.db1[j] + (1 - beta) * db1[j] / N;
            momentums.dw2[j] = beta * momentums.dw2[j] + (1 - beta) * dw2[j] / N;
            w1[j] -= lr * momentums.dw1[j]; b1[j] -= lr * momentums.db1[j]; w2[j] -= lr * momentums.dw2[j];
        }
        momentums.db2 = beta * momentums.db2 + (1 - beta) * db2 / N;
        b2Ref.v -= lr * momentums.db2;
    } else if (opt.type === 'adam') {
        const beta1 = 0.9; const beta2 = 0.999; const eps = 1e-8;
        adamState.t++;
        const t = adamState.t;
        for (let j = 0; j < H; j++) {
            const gw1 = dw1[j] / N; const gb1 = db1[j] / N; const gw2 = dw2[j] / N;
            adamState.mw1[j] = beta1 * adamState.mw1[j] + (1 - beta1) * gw1;
            adamState.vw1[j] = beta2 * adamState.vw1[j] + (1 - beta2) * gw1 * gw1;
            adamState.mb1[j] = beta1 * adamState.mb1[j] + (1 - beta1) * gb1;
            adamState.vb1[j] = beta2 * adamState.vb1[j] + (1 - beta2) * gb1 * gb1;
            adamState.mw2[j] = beta1 * adamState.mw2[j] + (1 - beta1) * gw2;
            adamState.vw2[j] = beta2 * adamState.vw2[j] + (1 - beta2) * gw2 * gw2;
            const mHat1 = adamState.mw1[j] / (1 - Math.pow(beta1, t));
            const vHat1 = adamState.vw1[j] / (1 - Math.pow(beta2, t));
            w1[j] -= lr * mHat1 / (Math.sqrt(vHat1) + eps);
            const mHat1b = adamState.mb1[j] / (1 - Math.pow(beta1, t));
            const vHat1b = adamState.vb1[j] / (1 - Math.pow(beta2, t));
            b1[j] -= lr * mHat1b / (Math.sqrt(vHat1b) + eps);
            const mHat2 = adamState.mw2[j] / (1 - Math.pow(beta1, t));
            const vHat2 = adamState.vw2[j] / (1 - Math.pow(beta2, t));
            w2[j] -= lr * mHat2 / (Math.sqrt(vHat2) + eps);
        }
        const gdb2 = db2 / N;
        adamState.mb2 = beta1 * adamState.mb2 + (1 - beta1) * gdb2;
        adamState.vb2 = beta2 * adamState.vb2 + (1 - beta2) * gdb2 * gdb2;
        const mHat2b = adamState.mb2 / (1 - Math.pow(beta1, t));
        const vHat2b = adamState.vb2 / (1 - Math.pow(beta2, t));
        b2Ref.v -= lr * mHat2b / (Math.sqrt(vHat2b) + eps);
    }

    return loss / N;
}

export const LearningRateExplorer: React.FC = () => {
    const OPT_CONFIGS: { label: string; type: 'sgd' | 'momentum' | 'adam'; lr: number; color: string }[] = [
        { label: 'Too Small (SGD lr=0.001)', type: 'sgd', lr: 0.001, color: '#fb923c' },
        { label: 'Just Right (Adam lr=0.01)', type: 'adam', lr: 0.01, color: '#34d399' },
        { label: 'Too Large (SGD lr=0.5)', type: 'sgd', lr: 0.5, color: '#f87171' },
    ];

    const H_SIZE = 6;
    const [lossHistories, setLossHistories] = useState<number[][]>([[], [], []]);
    const [isRunning, setIsRunning] = useState(false);
    const stateRef = useRef<any[]>([]);
    const animRef = useRef<number | null>(null);
    const stepRef = useRef(0);

    // Training data: y = sin(x)
    const xs = Array.from({ length: 30 }, (_, i) => -Math.PI + (i / 29) * 2 * Math.PI);
    const ys = xs.map(x => Math.sin(x));

    const initState = () => OPT_CONFIGS.map(() => ({
        w1: Array.from({ length: H_SIZE }, (_, i) => Math.sin(i * 1.7) * 0.3),
        b1: new Array(H_SIZE).fill(0.1),
        w2: Array.from({ length: H_SIZE }, (_, i) => Math.cos(i * 1.3) * 0.3),
        b2: { v: 0 },
        momentums: { dw1: new Array(H_SIZE).fill(0), db1: new Array(H_SIZE).fill(0), dw2: new Array(H_SIZE).fill(0), db2: 0 },
        adamState: {
            mw1: new Array(H_SIZE).fill(0), vw1: new Array(H_SIZE).fill(0),
            mb1: new Array(H_SIZE).fill(0), vb1: new Array(H_SIZE).fill(0),
            mw2: new Array(H_SIZE).fill(0), vw2: new Array(H_SIZE).fill(0),
            mb2: 0, vb2: 0, t: 0,
        },
    }));

    const start = () => {
        setLossHistories([[], [], []]);
        stateRef.current = initState();
        stepRef.current = 0;
        setIsRunning(true);

        const run = () => {
            if (stepRef.current >= 200) { setIsRunning(false); return; }

            const losses: number[] = [];
            stateRef.current.forEach((s, i) => {
                const loss = trainStep(s.w1, s.b1, s.w2, s.b2, xs, ys, OPT_CONFIGS[i], s.momentums, s.adamState);
                losses.push(loss);
            });

            setLossHistories(prev => prev.map((h, i) => [...h, Math.min(losses[i], 5)]));
            stepRef.current++;
            animRef.current = requestAnimationFrame(run);
        };
        animRef.current = requestAnimationFrame(run);
    };

    useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

    const W = 580; const H = 240; const PAD = 40;
    const maxLoss = 2;
    const scaleX = (step: number, total: number) => PAD + (step / Math.max(total - 1, 1)) * (W - 2 * PAD);
    const scaleY = (loss: number) => H - PAD - (Math.min(loss, maxLoss) / maxLoss) * (H - 2 * PAD);

    const buildPath = (history: number[]) => history.map((l, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i, history.length)},${scaleY(l)}`).join(' ');

    const gridYs = [0, 0.5, 1.0, 1.5, 2.0];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                    Training 3 identical networks with different learning rates. Watch how convergence behavior differs.
                </p>
                <button onClick={start} disabled={isRunning}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isRunning ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'}`}>
                    {isRunning ? '⟳ Training…' : '▶ Start Training'}
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
                {OPT_CONFIGS.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-white/5">
                        <div className="w-6 h-0.5 rounded" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-slate-400">{c.label}</span>
                        {lossHistories[i].length > 0 && (
                            <span className="text-xs font-mono ml-1" style={{ color: c.color }}>
                                {lossHistories[i][lossHistories[i].length - 1].toFixed(4)}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Loss Plot */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
                    {/* Grid */}
                    {gridYs.map(y => (
                        <g key={y}>
                            <line x1={PAD} y1={scaleY(y)} x2={W - PAD} y2={scaleY(y)} stroke="#1e293b" strokeWidth="1" />
                            <text x={PAD - 4} y={scaleY(y) + 3} textAnchor="end" fill="#334155" fontSize="9">{y.toFixed(1)}</text>
                        </g>
                    ))}
                    {/* X Axis labels */}
                    {[0, 50, 100, 150, 200].map(s => (
                        <text key={s} x={scaleX(s, 201)} y={H - 8} textAnchor="middle" fill="#334155" fontSize="9">{s}</text>
                    ))}
                    <text x={W / 2} y={H - 2} textAnchor="middle" fill="#475569" fontSize="9">Training Steps</text>
                    <text x={8} y={H / 2} fill="#475569" fontSize="9" transform={`rotate(-90, 8, ${H / 2})`}>Loss (MSE)</text>

                    {/* Loss curves */}
                    {lossHistories.map((history, i) => (
                        history.length > 1 && (
                            <path key={i} d={buildPath(history)} fill="none" stroke={OPT_CONFIGS[i].color} strokeWidth="2.5" />
                        )
                    ))}

                    {/* Empty state */}
                    {lossHistories[0].length === 0 && (
                        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#334155" fontSize="14">Press "Start Training" to begin</text>
                    )}
                </svg>
            </div>

            {/* Insight cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-orange-400 text-xs font-bold mb-1 flex items-center gap-1">
                        <span style={{ backgroundColor: '#fb923c', width: 12, height: 3, display: 'inline-block', borderRadius: 2 }} />
                        Too Small
                    </p>
                    <p className="text-slate-400 text-xs">Loss decreases very slowly. Will converge eventually, but may take 100× longer. Impractical in real training.</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-1">
                        <span style={{ backgroundColor: '#34d399', width: 12, height: 3, display: 'inline-block', borderRadius: 2 }} />
                        Just Right (Adam)
                    </p>
                    <p className="text-slate-400 text-xs">Fast convergence, stable descent. Adam adapts its learning rate per-parameter, making it robust.</p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
                    <p className="text-rose-400 text-xs font-bold mb-1 flex items-center gap-1">
                        <span style={{ backgroundColor: '#f87171', width: 12, height: 3, display: 'inline-block', borderRadius: 2 }} />
                        Too Large
                    </p>
                    <p className="text-slate-400 text-xs">Loss oscillates or diverges. Overshoots the minimum, bouncing wildly around the loss landscape.</p>
                </div>
            </div>
        </div>
    );
};
