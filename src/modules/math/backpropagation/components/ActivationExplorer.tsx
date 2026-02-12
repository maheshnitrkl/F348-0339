import React, { useState } from 'react';

type ActivationType = 'sigmoid' | 'tanh' | 'relu' | 'leaky_relu' | 'swish';

interface ActivationDef {
    fn: (x: number) => number;
    deriv: (x: number) => number;
    label: string;
    color: string;
    formula: string;
    derivFormula: string;
    pros: string;
    cons: string;
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

const ACTIVATIONS: Record<ActivationType, ActivationDef> = {
    sigmoid: {
        fn: sigmoid,
        deriv: (x: number) => { const s = sigmoid(x); return s * (1 - s); },
        label: 'Sigmoid', color: '#3b82f6',
        formula: 'σ(x) = 1 / (1 + e⁻ˣ)',
        derivFormula: "σ'(x) = σ(x)(1 - σ(x))",
        pros: 'Smooth, bounded (0,1)',
        cons: 'Vanishing gradients, not zero-centered',
    },
    tanh: {
        fn: Math.tanh,
        deriv: (x: number) => 1 - Math.tanh(x) ** 2,
        label: 'Tanh', color: '#f59e0b',
        formula: 'tanh(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)',
        derivFormula: "tanh'(x) = 1 - tanh²(x)",
        pros: 'Zero-centered, stronger gradients than sigmoid',
        cons: 'Still vanishes for large |x|',
    },
    relu: {
        fn: (x: number) => Math.max(0, x),
        deriv: (x: number) => x > 0 ? 1 : 0,
        label: 'ReLU', color: '#22c55e',
        formula: 'f(x) = max(0, x)',
        derivFormula: "f'(x) = { 1 if x > 0, 0 otherwise }",
        pros: 'Fast, no vanishing gradient for x > 0',
        cons: '"Dead neurons" when x < 0',
    },
    leaky_relu: {
        fn: (x: number) => x > 0 ? x : 0.01 * x,
        deriv: (x: number) => x > 0 ? 1 : 0.01,
        label: 'Leaky ReLU', color: '#06b6d4',
        formula: 'f(x) = { x if x > 0, 0.01x otherwise }',
        derivFormula: "f'(x) = { 1 if x > 0, 0.01 otherwise }",
        pros: 'Fixes dead neuron problem',
        cons: 'Small arbitrary slope for negatives',
    },
    swish: {
        fn: (x: number) => x * sigmoid(x),
        deriv: (x: number) => { const s = sigmoid(x); return s + x * s * (1 - s); },
        label: 'Swish', color: '#a855f7',
        formula: 'f(x) = x · σ(x)',
        derivFormula: "f'(x) = σ(x) + x·σ(x)(1-σ(x))",
        pros: 'Smooth, non-monotonic, SOTA in some tasks',
        cons: 'Slightly more compute than ReLU',
    },
};

const SVG_W = 600;
const SVG_H = 250;
const X_RANGE = [-6, 6] as const;
const Y_RANGE = [-1.5, 2] as const;

function mapX(x: number): number {
    return ((x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * SVG_W;
}
function mapY(y: number): number {
    return SVG_H - ((y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0])) * SVG_H;
}

function plotPath(fn: (x: number) => number): string {
    let path = '';
    for (let px = 0; px <= SVG_W; px += 2) {
        const x = X_RANGE[0] + (px / SVG_W) * (X_RANGE[1] - X_RANGE[0]);
        const y = fn(x);
        const clampedY = Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], y));
        const sy = mapY(clampedY);
        path += px === 0 ? `M ${px} ${sy}` : ` L ${px} ${sy}`;
    }
    return path;
}

export const ActivationExplorer: React.FC = () => {
    const [selected, setSelected] = useState<ActivationType[]>(['sigmoid', 'relu']);
    const [showDerivative, setShowDerivative] = useState(false);

    const toggle = (key: ActivationType) => {
        setSelected(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Activation Function Explorer</h3>
                <button onClick={() => setShowDerivative(!showDerivative)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${showDerivative ? 'bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/50' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >{showDerivative ? "Showing f'(x)" : "Show Derivative"}</button>
            </div>

            {/* Toggle buttons */}
            <div className="flex gap-2 mb-4">
                {(Object.keys(ACTIVATIONS) as ActivationType[]).map(key => (
                    <button key={key} onClick={() => toggle(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selected.includes(key) ? '' : 'border-transparent bg-white/5 text-gray-500 hover:bg-white/10'}`}
                        style={selected.includes(key) ? {
                            backgroundColor: `${ACTIVATIONS[key].color}15`,
                            color: ACTIVATIONS[key].color,
                            borderColor: `${ACTIVATIONS[key].color}40`,
                        } : {}}
                    >{ACTIVATIONS[key].label}</button>
                ))}
            </div>

            {/* Plot */}
            <div className="bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: '300px' }}>
                    {/* Grid */}
                    <line x1={0} y1={mapY(0)} x2={SVG_W} y2={mapY(0)} stroke="#ffffff15" strokeWidth="1" />
                    <line x1={mapX(0)} y1={0} x2={mapX(0)} y2={SVG_H} stroke="#ffffff15" strokeWidth="1" />
                    {[-4, -2, 2, 4].map(x => (
                        <text key={`xl-${x}`} x={mapX(x)} y={mapY(0) + 14} textAnchor="middle" fill="#555" fontSize="9">{x}</text>
                    ))}
                    {[-1, 1].map(y => (
                        <text key={`yl-${y}`} x={mapX(0) + 8} y={mapY(y) + 3} fill="#555" fontSize="9">{y}</text>
                    ))}

                    {/* Function curves */}
                    {selected.map(key => {
                        const act = ACTIVATIONS[key];
                        const fn = showDerivative ? act.deriv : act.fn;
                        return (
                            <path key={key}
                                d={plotPath(fn)}
                                fill="none"
                                stroke={act.color}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Info cards for selected */}
            {selected.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {selected.map(key => {
                        const act = ACTIVATIONS[key];
                        return (
                            <div key={key} className="p-3 rounded-lg border bg-black/20"
                                style={{ borderColor: `${act.color}20` }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: act.color }} />
                                    <span className="font-bold text-sm text-white">{act.label}</span>
                                </div>
                                <div className="font-mono text-xs text-gray-400 mb-2">
                                    {showDerivative ? act.derivFormula : act.formula}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    <span className="text-green-400">+</span> {act.pros} &nbsp;
                                    <span className="text-red-400">-</span> {act.cons}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
