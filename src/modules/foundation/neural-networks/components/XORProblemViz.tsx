import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Gate = 'AND' | 'OR' | 'XOR';

const GATE_CONFIGS: Record<Gate, { points: { x: number; y: number; label: number }[]; desc: string; solvable: boolean }> = {
    AND: {
        desc: 'AND Gate: Output is 1 only if BOTH inputs are 1.',
        solvable: true,
        points: [
            { x: 0, y: 0, label: 0 },
            { x: 0, y: 1, label: 0 },
            { x: 1, y: 0, label: 0 },
            { x: 1, y: 1, label: 1 },
        ],
    },
    OR: {
        desc: 'OR Gate: Output is 1 if EITHER input is 1.',
        solvable: true,
        points: [
            { x: 0, y: 0, label: 0 },
            { x: 0, y: 1, label: 1 },
            { x: 1, y: 0, label: 1 },
            { x: 1, y: 1, label: 1 },
        ],
    },
    XOR: {
        desc: 'XOR Gate: Output is 1 only if inputs are DIFFERENT.',
        solvable: false,
        points: [
            { x: 0, y: 0, label: 0 },
            { x: 0, y: 1, label: 1 },
            { x: 1, y: 0, label: 1 },
            { x: 1, y: 1, label: 0 },
        ],
    },
};

// Optimal weights for AND/OR (for display only)
const BEST_WEIGHTS: Record<Gate, { w1: number; w2: number; b: number }> = {
    AND: { w1: 1.0, w2: 1.0, b: -1.5 },
    OR: { w1: 1.0, w2: 1.0, b: -0.5 },
    XOR: { w1: 1.0, w2: -1.0, b: 0.0 }, // No solution exists
};

export const XORProblemViz: React.FC = () => {
    const [gate, setGate] = useState<Gate>('AND');
    const [showMLP, setShowMLP] = useState(false);

    const config = GATE_CONFIGS[gate];
    const weights = BEST_WEIGHTS[gate];

    const activation = (x: number, y: number) =>
        (weights.w1 * x + weights.w2 * y + weights.b) >= 0 ? 1 : 0;

    const scale = (v: number) => 50 + v * 180;
    const invY = (v: number) => 230 - v * 180;

    const getLinePoints = () => {
        if (Math.abs(weights.w2) < 0.01) return null;
        return {
            x1: -0.3, y1: (-weights.w1 * -0.3 - weights.b) / weights.w2,
            x2: 1.3, y2: (-weights.w1 * 1.3 - weights.b) / weights.w2,
        };
    };
    const line = getLinePoints();

    const allCorrect = config.points.every(p => activation(p.x, p.y) === p.label);

    // XOR MLP hidden layer (shows conceptually that 2 layers work)
    const xorHidden = (x: number, y: number) => {
        const h1 = (x + y - 0.5) >= 0 ? 1 : 0; // OR-like
        const h2 = (x + y - 1.5) >= 0 ? 1 : 0; // AND-like
        return (h1 - h2) >= 0.5 ? 1 : 0;
    };

    return (
        <div className="space-y-6">
            {/* Gate Selector */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2 bg-slate-800 p-1 rounded-xl">
                    {(['AND', 'OR', 'XOR'] as Gate[]).map(g => (
                        <button
                            key={g}
                            onClick={() => { setGate(g); setShowMLP(false); }}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${gate === g
                                ? (g === 'XOR' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-violet-500/30 text-violet-300 border border-violet-500/50')
                                : 'text-slate-500 hover:text-white'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${config.solvable
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                    {config.solvable ? '✓ Linearly Separable' : '✗ NOT Linearly Separable'}
                </div>
            </div>

            <p className="text-slate-400 text-sm">{config.desc}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Single Perceptron Attempt */}
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
                    <h4 className="text-sm font-mono text-violet-400 uppercase tracking-widest mb-3">Single Perceptron</h4>
                    <svg viewBox="0 0 280 280" className="w-full">
                        {/* Axes */}
                        <line x1="40" y1="240" x2="240" y2="240" stroke="#334155" strokeWidth="1.5" />
                        <line x1="40" y1="240" x2="40" y2="40" stroke="#334155" strokeWidth="1.5" />
                        <text x="250" y="244" fill="#475569" fontSize="10">x₁</text>
                        <text x="36" y="32" fill="#475569" fontSize="10">x₂</text>
                        <text x="36" y="253" fill="#475569" fontSize="9">0</text>
                        <text x="216" y="253" fill="#475569" fontSize="9">1</text>
                        <text x="24" y="242" fill="#475569" fontSize="9">0</text>
                        <text x="24" y="62" fill="#475569" fontSize="9">1</text>

                        {/* Decision Boundary */}
                        {line && gate !== 'XOR' && (
                            <line
                                x1={scale(line.x1)} y1={invY(line.y1)}
                                x2={scale(line.x2)} y2={invY(line.y2)}
                                stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="6,4"
                            />
                        )}
                        {gate === 'XOR' && (
                            <>
                                {/* Show multiple failed boundaries */}
                                <line x1="40" y1="145" x2="240" y2="145" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5,5" opacity="0.5" />
                                <line x1="140" y1="40" x2="140" y2="240" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5,5" opacity="0.5" />
                                <line x1="40" y1="240" x2="240" y2="40" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5,5" opacity="0.5" />
                                <text x="140" y="150" textAnchor="middle" fill="#f87171" fontSize="9">No line can separate XOR!</text>
                            </>
                        )}

                        {/* Data Points */}
                        {config.points.map((p, i) => {
                            const pred = activation(p.x, p.y);
                            const correct = gate !== 'XOR' ? pred === p.label : false;
                            return (
                                <g key={i}>
                                    <circle
                                        cx={scale(p.x)} cy={invY(p.y)} r={12}
                                        fill={p.label === 1 ? '#10b981' : '#ef4444'}
                                        stroke={correct ? '#fff' : '#fbbf24'}
                                        strokeWidth={correct ? 2 : 3}
                                        opacity={0.9}
                                    />
                                    <text x={scale(p.x)} cy={invY(p.y)} y={invY(p.y) + 4}
                                        textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                                        {p.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    <div className={`mt-2 px-3 py-2 rounded-lg text-sm text-center font-semibold ${allCorrect && gate !== 'XOR'
                        ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {gate === 'XOR' ? '❌ Cannot be solved — impossible to draw one line' : '✅ Solved with a single decision boundary'}
                    </div>
                </div>

                {/* MLP Solution for XOR */}
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-widest">MLP (2 Layers)</h4>
                        {gate === 'XOR' && (
                            <button
                                onClick={() => setShowMLP(!showMLP)}
                                className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                            >
                                {showMLP ? 'Hide Solution' : 'Show Solution ✨'}
                            </button>
                        )}
                    </div>

                    {gate !== 'XOR' ? (
                        <div className="flex items-center justify-center h-48 text-slate-600 text-sm text-center">
                            <div>
                                <p className="text-3xl mb-2">✓</p>
                                <p>{gate} is already solvable by a single perceptron.</p>
                                <p className="mt-1 text-xs">Switch to <span className="text-rose-400 font-bold">XOR</span> to see why we need multi-layer networks.</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {!showMLP ? (
                                <motion.div key="question"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex items-center justify-center h-52 text-center"
                                >
                                    <div className="space-y-3">
                                        <p className="text-5xl">🤔</p>
                                        <p className="text-slate-400 text-sm">XOR is NOT linearly separable.</p>
                                        <p className="text-slate-500 text-xs">But a 2-layer MLP can solve it by learning<br />a NEW feature space where it IS separable.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="solution"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-3"
                                >
                                    {/* MLP Network Diagram */}
                                    <svg viewBox="0 0 280 180" className="w-full">
                                        {/* Layer connections */}
                                        <g stroke="#4c1d95" strokeWidth="1">
                                            {[60, 120].map(iy => [50, 90, 130].map(hy => (
                                                <line key={`${iy}-${hy}`} x1="60" y1={iy} x2="160" y2={hy} />
                                            )))}
                                        </g>
                                        <g stroke="#065f46" strokeWidth="1">
                                            {[50, 90, 130].map(hy => (
                                                <line key={hy} x1="160" y1={hy} x2="240" y2="90" />
                                            ))}
                                        </g>
                                        {/* Input */}
                                        {[60, 120].map((y, i) => (
                                            <g key={i}>
                                                <circle cx="60" cy={y} r="16" fill="#0f172a" stroke="#7c3aed" strokeWidth="2" />
                                                <text x="60" y={y + 4} textAnchor="middle" fill="#c4b5fd" fontSize="10">x{i + 1}</text>
                                            </g>
                                        ))}
                                        {/* Hidden */}
                                        {[50, 90, 130].map((y, i) => (
                                            <g key={i}>
                                                <circle cx="160" cy={y} r="16" fill="#0f172a" stroke="#0891b2" strokeWidth="2" />
                                                <text x="160" y={y + 4} textAnchor="middle" fill="#67e8f9" fontSize="10">h{i + 1}</text>
                                            </g>
                                        ))}
                                        {/* Output */}
                                        <circle cx="240" cy="90" r="16" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                                        <text x="240" y="94" textAnchor="middle" fill="#6ee7b7" fontSize="10">ŷ</text>

                                        {/* Labels */}
                                        <text x="60" y="165" textAnchor="middle" fill="#64748b" fontSize="9">Input</text>
                                        <text x="160" y="165" textAnchor="middle" fill="#64748b" fontSize="9">Hidden</text>
                                        <text x="240" y="165" textAnchor="middle" fill="#64748b" fontSize="9">Output</text>
                                    </svg>
                                    {/* Truth table */}
                                    <div className="grid grid-cols-3 gap-1 text-xs text-center">
                                        <div className="text-slate-500">x₁, x₂</div>
                                        <div className="text-slate-500">Target</div>
                                        <div className="text-emerald-400">MLP Output</div>
                                        {config.points.map((p, i) => (
                                            <React.Fragment key={i}>
                                                <div className="text-slate-400">{p.x}, {p.y}</div>
                                                <div className={p.label === 1 ? 'text-emerald-400' : 'text-red-400'}>{p.label}</div>
                                                <div className="text-emerald-300 font-bold">✓ {xorHidden(p.x, p.y)}</div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Key Insight */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-semibold mb-1">💡 The Key Insight</p>
                <p className="text-slate-400 text-sm">
                    The XOR problem in the 1960s–70s led to the first "AI Winter". It wasn't until 1986, with the invention
                    of <strong className="text-white">backpropagation</strong>, that researchers learned how to train multi-layer networks
                    that could solve XOR — and any non-linear problem. The MLP creates a <em>new feature space</em> in the hidden layer where the data becomes linearly separable.
                </p>
            </div>
        </div>
    );
};
