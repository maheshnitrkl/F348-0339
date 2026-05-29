/* eslint-disable */
import React, { useState, useCallback } from 'react';

// A shallow 1-hidden-layer network that approximates target functions
// using sum of sigmoid basis functions

type TargetFn = 'sine' | 'step' | 'gaussian' | 'sawtooth' | 'absolute';

const TARGET_FNS: Record<TargetFn, { label: string; fn: (x: number) => number; color: string }> = {
    sine: { label: 'Sine Wave', fn: x => Math.sin(x * Math.PI), color: '#818cf8' },
    step: { label: 'Step Function', fn: x => x > 0 ? 1 : -1, color: '#34d399' },
    gaussian: { label: 'Gaussian', fn: x => Math.exp(-x * x * 2), color: '#f472b6' },
    sawtooth: { label: 'Sawtooth', fn: x => x - Math.floor(x + 0.5), color: '#fb923c' },
    absolute: { label: '|x| (Absolute)', fn: x => Math.abs(x), color: '#60a5fa' },
};

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

// Fit a shallow network to the target function using gradient descent
function fitNetwork(target: TargetFn, numNeurons: number): (x: number) => number {
    const targetFn = TARGET_FNS[target].fn;
    const N = numNeurons;
    
    // Initialize weights deterministically
    const centers = Array.from({ length: N }, (_, i) => -1 + (i / (N - 1 || 1)) * 2);
    const scales = Array.from({ length: N }, () => 3.0);
    let weights = Array.from({ length: N }, (_, i) => Math.sin(i * 2.1) * 0.5);
    let bias = 0;

    // Mini gradient descent
    const XS = Array.from({ length: 40 }, (_, i) => -1 + (i / 39) * 2);
    const lr = 0.05;
    for (let iter = 0; iter < 200; iter++) {
        const dW = new Array(N).fill(0);
        let dB = 0;
        for (const x of XS) {
            const hiddenActs = centers.map((c, j) => sigmoid(scales[j] * (x - c)));
            const pred = hiddenActs.reduce((s, h, j) => s + weights[j] * h, bias);
            const err = pred - targetFn(x);
            hiddenActs.forEach((h, j) => { dW[j] += err * h; });
            dB += err;
        }
        weights = weights.map((w, j) => w - lr * dW[j] / XS.length);
        bias -= lr * dB / XS.length;
    }

    return (x: number) => {
        const hiddenActs = centers.map((c, j) => sigmoid(scales[j] * (x - c)));
        return hiddenActs.reduce((s, h, j) => s + weights[j] * h, bias);
    };
}

export const UniversalApproximationViz: React.FC = () => {
    const [target, setTarget] = useState<TargetFn>('sine');
    const [numNeurons, setNumNeurons] = useState(4);

    const cfg = TARGET_FNS[target];
    const approxFn = fitNetwork(target, numNeurons);

    const W = 600; const H = 260; const PAD = 30;
    const XS = Array.from({ length: 120 }, (_, i) => -1 + (i / 119) * 2);

    const scaleX = (x: number) => PAD + ((x + 1) / 2) * (W - 2 * PAD);
    const scaleY = (y: number) => H / 2 - y * (H / 2 - PAD);

    const targetPath = XS.map((x, i) => `${i === 0 ? 'M' : 'L'}${scaleX(x)},${scaleY(cfg.fn(x))}`).join(' ');
    const approxPath = XS.map((x, i) => {
        const y = approxFn(x);
        return `${i === 0 ? 'M' : 'L'}${scaleX(x)},${scaleY(Math.max(-1.8, Math.min(1.8, y)))}`;
    }).join(' ');

    // MSE
    const mse = XS.reduce((s, x) => s + Math.pow(approxFn(x) - cfg.fn(x), 2), 0) / XS.length;
    const qualityPct = Math.max(0, 100 - mse * 500);

    const gridYs = [-1, -0.5, 0, 0.5, 1];

    return (
        <div className="space-y-5">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
                    {(Object.keys(TARGET_FNS) as TargetFn[]).map(t => (
                        <button key={t} onClick={() => setTarget(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${target === t ? 'shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            style={target === t ? { backgroundColor: TARGET_FNS[t].color + '22', color: TARGET_FNS[t].color, border: `1px solid ${TARGET_FNS[t].color}50` } : {}}>
                            {TARGET_FNS[t].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Neuron count slider */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <span className="text-white font-semibold">Hidden Neurons: </span>
                        <span className="font-mono text-2xl font-bold" style={{ color: cfg.color }}>{numNeurons}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500">Approximation Quality</div>
                        <div className={`text-lg font-bold ${qualityPct > 80 ? 'text-emerald-400' : qualityPct > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {qualityPct.toFixed(1)}%
                        </div>
                    </div>
                </div>
                <input type="range" min="1" max="20" step="1" value={numNeurons}
                    onChange={e => setNumNeurons(parseInt(e.target.value))}
                    className="w-full" style={{ accentColor: cfg.color }} />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>1 neuron</span>
                    <span>10</span>
                    <span>20 neurons</span>
                </div>
            </div>

            {/* Main Plot */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
                    {/* Grid */}
                    {gridYs.map(y => (
                        <line key={y} x1={PAD} y1={scaleY(y)} x2={W - PAD} y2={scaleY(y)} stroke="#1e293b" strokeWidth="1" />
                    ))}
                    <line x1={PAD} y1={scaleY(0)} x2={W - PAD} y2={scaleY(0)} stroke="#334155" strokeWidth="1.5" />
                    <line x1={scaleX(0)} y1={PAD} x2={scaleX(0)} y2={H - PAD} stroke="#334155" strokeWidth="1.5" />

                    {/* Axis labels */}
                    {gridYs.map(y => (
                        <text key={y} x={PAD - 4} y={scaleY(y) + 3} textAnchor="end" fill="#334155" fontSize="9">{y}</text>
                    ))}

                    {/* Target function */}
                    <path d={targetPath} fill="none" stroke={cfg.color} strokeWidth="2.5" opacity="0.4" strokeDasharray="8,4" />

                    {/* Approximation */}
                    <path d={approxPath} fill="none" stroke={cfg.color} strokeWidth="2.5" />

                    {/* Legend */}
                    <rect x={W - 170} y={8} width={158} height={52} fill="#0f172a" rx="6" opacity="0.9" />
                    <line x1={W - 160} y1={26} x2={W - 130} y2={26} stroke={cfg.color} strokeWidth="2.5" strokeDasharray="8,4" opacity="0.4" />
                    <text x={W - 124} y={30} fill="#94a3b8" fontSize="10">Target f(x)</text>
                    <line x1={W - 160} y1={46} x2={W - 130} y2={46} stroke={cfg.color} strokeWidth="2.5" />
                    <text x={W - 124} y={50} fill="#94a3b8" fontSize="10">Network approx.</text>
                </svg>
            </div>

            {/* Quality meter */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Approximation Error (MSE: {mse.toFixed(4)})</span>
                    <span>{numNeurons} × sigmoid(w·x + b) + bias</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${qualityPct}%`, background: `linear-gradient(to right, #ef4444, #eab308, #10b981)` }} />
                </div>
            </div>

            {/* UAT Theorem Box */}
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
                <p className="text-violet-300 font-semibold text-sm mb-1">🎓 Universal Approximation Theorem (Cybenko, 1989)</p>
                <p className="text-slate-400 text-sm">
                    A feedforward network with a <strong className="text-white">single hidden layer</strong> of sufficiently many neurons
                    can approximate <em>any continuous function</em> on a compact domain to arbitrary precision.
                    This is why neural networks are <strong className="text-white">universal function approximators</strong>.
                </p>
                <p className="text-slate-500 text-xs mt-2">
                    Note: "Sufficiently many" can be exponential. That's why <em>depth</em> (more layers) is often more efficient than <em>width</em>.
                </p>
            </div>
        </div>
    );
};
