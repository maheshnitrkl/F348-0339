/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

type FuncType = 'sigmoid' | 'relu' | 'tanh' | 'leaky_relu' | 'elu' | 'gelu' | 'swish' | 'softplus';

interface FuncConfig {
    label: string;
    color: string;
    formula: string;
    range: string;
    era: string;
    pros: string;
    cons: string;
    use: string;
    fn: (x: number) => number;
    deriv: (x: number) => number;
}

const FUNCS: Record<FuncType, FuncConfig> = {
    sigmoid: {
        label: 'Sigmoid', color: '#818cf8', era: 'Classic',
        formula: 'σ(x) = 1/(1+e⁻ˣ)', range: '[0, 1]',
        pros: 'Smooth, probabilistic interpretation', cons: 'Vanishing gradients, not zero-centered',
        use: 'Output layers (binary classification)',
        fn: x => 1 / (1 + Math.exp(-x)),
        deriv: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); },
    },
    tanh: {
        label: 'Tanh', color: '#34d399', era: 'Classic',
        formula: 'tanh(x)', range: '[-1, 1]',
        pros: 'Zero-centered, stronger gradients than sigmoid', cons: 'Still vanishing gradients for deep nets',
        use: 'Hidden layers (when sigmoid alternatives needed)',
        fn: x => Math.tanh(x),
        deriv: x => 1 - Math.pow(Math.tanh(x), 2),
    },
    relu: {
        label: 'ReLU', color: '#f87171', era: 'Modern',
        formula: 'max(0, x)', range: '[0, ∞)',
        pros: 'No vanishing gradient (positive), fast, sparse', cons: '"Dying ReLU" — neurons can permanently die',
        use: 'Default for hidden layers in CNNs, MLPs',
        fn: x => Math.max(0, x),
        deriv: x => x > 0 ? 1 : 0,
    },
    leaky_relu: {
        label: 'Leaky ReLU', color: '#fb923c', era: 'Modern',
        formula: 'max(0.01x, x)', range: '(-∞, ∞)',
        pros: 'Fixes dying ReLU, negative slope preserved', cons: 'Slope 0.01 is a hyperparameter',
        use: 'When ReLU neurons are dying',
        fn: x => Math.max(0.01 * x, x),
        deriv: x => x > 0 ? 1 : 0.01,
    },
    elu: {
        label: 'ELU', color: '#a78bfa', era: 'Modern',
        formula: 'x if x>0, α(eˣ-1) otherwise', range: '(-α, ∞)',
        pros: 'Smooth negative side, pushes mean to zero', cons: 'Slightly more expensive to compute',
        use: 'Deep networks where Leaky ReLU fails',
        fn: x => x > 0 ? x : 1.0 * (Math.exp(x) - 1),
        deriv: x => x > 0 ? 1 : Math.exp(x),
    },
    gelu: {
        label: 'GELU', color: '#60a5fa', era: 'Transformer-era',
        formula: 'x·Φ(x) ≈ x·σ(1.702x)', range: '≈(-0.17, ∞)',
        pros: 'State-of-the-art, stochastic regularization', cons: 'More complex, slower than ReLU',
        use: 'BERT, GPT, ViT — modern transformers',
        fn: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
        deriv: x => {
            const t = Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)));
            return 0.5 * (1 + t) + x * 0.5 * (1 - t * t) * Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * x * x);
        },
    },
    swish: {
        label: 'Swish', color: '#f472b6', era: 'Transformer-era',
        formula: 'x·σ(x)', range: '≈(-0.28, ∞)',
        pros: 'Smooth, non-monotonic, often beats ReLU', cons: 'Not zero-centered, more expensive',
        use: 'EfficientNet, MobileNetV3',
        fn: x => x / (1 + Math.exp(-x)),
        deriv: x => { const s = 1 / (1 + Math.exp(-x)); return s + x * s * (1 - s); },
    },
    softplus: {
        label: 'Softplus', color: '#4ade80', era: 'Modern',
        formula: 'log(1 + eˣ)', range: '(0, ∞)',
        pros: 'Smooth ReLU approximation, always differentiable', cons: 'Slow saturation for large negative x',
        use: 'Theoretical work, smooth alternatives',
        fn: x => Math.log(1 + Math.exp(x)),
        deriv: x => 1 / (1 + Math.exp(-x)),
    },
};

const ERA_COLORS: Record<string, string> = {
    Classic: '#64748b',
    Modern: '#7c3aed',
    'Transformer-era': '#0891b2',
};

export const ActivationPlayground: React.FC = () => {
    const [selected, setSelected] = useState<FuncType>('relu');
    const [inputX, setInputX] = useState(0);
    const canvasRef = useRef<SVGSVGElement>(null);

    const cfg = FUNCS[selected];
    const W = 560; const H = 280; const PAD = 40;

    const scaleX = (x: number) => ((x + 5) / 10) * (W - 2 * PAD) + PAD;
    const scaleY = (y: number) => H - ((y + 1.5) / 4) * (H - 2 * PAD) - PAD;

    const buildPath = (key: 'y' | 'd') => {
        const pts: string[] = [];
        for (let xi = -5; xi <= 5; xi += 0.05) {
            const yi = key === 'y' ? cfg.fn(xi) : cfg.deriv(xi);
            const sx = scaleX(xi); const sy = scaleY(Math.max(-2, Math.min(3, yi)));
            pts.push(`${pts.length === 0 ? 'M' : 'L'}${sx},${sy}`);
        }
        return pts.join(' ');
    };

    const markerX = scaleX(inputX);
    const markerYFn = scaleY(Math.max(-2, Math.min(3, cfg.fn(inputX))));
    const markerYDeriv = scaleY(Math.max(-2, Math.min(3, cfg.deriv(inputX))));

    return (
        <div className="space-y-6">
            {/* Function Selector Grid */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
                {(Object.keys(FUNCS) as FuncType[]).map(f => (
                    <button key={f} onClick={() => setSelected(f)}
                        className={`px-2 py-2 rounded-lg text-xs font-bold transition-all text-center ${selected === f ? 'border-2 shadow-lg' : 'bg-slate-800/60 text-slate-500 hover:text-white border border-white/5'}`}
                        style={selected === f ? { borderColor: FUNCS[f].color, backgroundColor: FUNCS[f].color + '22', color: FUNCS[f].color } : {}}
                    >
                        {FUNCS[f].label}
                    </button>
                ))}
            </div>

            {/* Main Plot */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 pt-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-bold">{cfg.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full text-slate-400 border border-slate-700" style={{ borderColor: ERA_COLORS[cfg.era] + '66', color: ERA_COLORS[cfg.era] }}>{cfg.era}</span>
                        <code className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{cfg.formula}</code>
                    </div>
                    <span className="text-xs text-slate-600">Range: {cfg.range}</span>
                </div>

                <svg ref={canvasRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
                    {/* Grid */}
                    {[-1, 0, 1, 2].map(y => (
                        <line key={y} x1={PAD} y1={scaleY(y)} x2={W - PAD} y2={scaleY(y)} stroke="#1e293b" strokeWidth="1" />
                    ))}
                    {[-4, -2, 0, 2, 4].map(x => (
                        <line key={x} x1={scaleX(x)} y1={PAD} x2={scaleX(x)} y2={H - PAD} stroke="#1e293b" strokeWidth="1" />
                    ))}
                    {/* Axes */}
                    <line x1={PAD} y1={scaleY(0)} x2={W - PAD} y2={scaleY(0)} stroke="#334155" strokeWidth="1.5" />
                    <line x1={scaleX(0)} y1={PAD} x2={scaleX(0)} y2={H - PAD} stroke="#334155" strokeWidth="1.5" />

                    {/* Axis Labels */}
                    {[-4, -2, 0, 2, 4].map(x => (
                        <text key={x} x={scaleX(x)} y={scaleY(0) + 14} textAnchor="middle" fill="#475569" fontSize="9">{x}</text>
                    ))}
                    {[-1, 0, 1, 2].map(y => (
                        <text key={y} x={scaleX(0) - 8} y={scaleY(y) + 3} textAnchor="end" fill="#475569" fontSize="9">{y}</text>
                    ))}

                    {/* Function curve */}
                    <path d={buildPath('y')} fill="none" stroke={cfg.color} strokeWidth="3" />
                    {/* Derivative curve */}
                    <path d={buildPath('d')} fill="none" stroke={cfg.color} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />

                    {/* Hover marker */}
                    <line x1={markerX} y1={PAD} x2={markerX} y2={H - PAD} stroke="#ffffff" strokeWidth="1" opacity="0.2" />
                    <circle cx={markerX} cy={markerYFn} r="5" fill={cfg.color} />
                    <circle cx={markerX} cy={markerYDeriv} r="4" fill={cfg.color} opacity={0.6} stroke="white" strokeWidth="1" />

                    {/* Value labels */}
                    <text x={markerX + 8} y={markerYFn - 6} fill={cfg.color} fontSize="10" fontWeight="bold">
                        f({inputX.toFixed(1)}) = {cfg.fn(inputX).toFixed(3)}
                    </text>
                    <text x={markerX + 8} y={markerYDeriv + 14} fill={cfg.color} fontSize="9" opacity="0.7">
                        f'({inputX.toFixed(1)}) = {cfg.deriv(inputX).toFixed(3)}
                    </text>

                    {/* Legend */}
                    <rect x={W - 150} y={12} width={138} height={52} fill="#0f172a" rx="6" opacity="0.9" />
                    <line x1={W - 140} y1={30} x2={W - 110} y2={30} stroke={cfg.color} strokeWidth="3" />
                    <text x={W - 105} y={34} fill="#cbd5e1" fontSize="10">f(x) — function</text>
                    <line x1={W - 140} y1={50} x2={W - 110} y2={50} stroke={cfg.color} strokeWidth="1.5" strokeDasharray="5,3" />
                    <text x={W - 105} y={54} fill="#cbd5e1" fontSize="10">f'(x) — derivative</text>
                </svg>
            </div>

            {/* Input Slider */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Input value x</span>
                    <div className="flex gap-4 text-sm font-mono">
                        <span style={{ color: cfg.color }}>f({inputX.toFixed(2)}) = <strong>{cfg.fn(inputX).toFixed(4)}</strong></span>
                        <span className="text-slate-500">f'({inputX.toFixed(2)}) = {cfg.deriv(inputX).toFixed(4)}</span>
                    </div>
                </div>
                <input type="range" min="-5" max="5" step="0.1" value={inputX}
                    onChange={e => setInputX(parseFloat(e.target.value))}
                    className="w-full" style={{ accentColor: cfg.color }} />
                <div className="flex justify-between text-xs text-slate-600 mt-1"><span>-5</span><span>0</span><span>5</span></div>
            </div>

            {/* Properties Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400 text-xs font-bold mb-1">✓ Pros</p>
                    <p className="text-slate-400 text-xs">{cfg.pros}</p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
                    <p className="text-rose-400 text-xs font-bold mb-1">✗ Cons</p>
                    <p className="text-slate-400 text-xs">{cfg.cons}</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-xs font-bold mb-1">📍 Use When</p>
                    <p className="text-slate-400 text-xs">{cfg.use}</p>
                </div>
            </div>
        </div>
    );
};
