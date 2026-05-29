/* eslint-disable */
import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   Comprehensive SVG Visualizations for Calculus & Probability
   ═══════════════════════════════════════════════════════════ */

// ─── 1. Derivative: tangent line on f(x) = x² ───
export const DerivativeTangentViz: React.FC = () => {
    const [xPos, setXPos] = useState(3);
    const W = 440, H = 240, pad = 35;

    const fx = (x: number) => 0.15 * x * x;
    const dfx = (x: number) => 0.3 * x;

    const toSvg = (x: number, y: number) => ({
        x: pad + ((x + 5) / 10) * (W - 2 * pad),
        y: H - pad - (y / 4) * (H - 2 * pad),
    });

    const curvePts: string[] = [];
    for (let t = -5; t <= 5; t += 0.2) {
        const p = toSvg(t, fx(t));
        curvePts.push(`${p.x},${p.y}`);
    }

    const pOnCurve = toSvg(xPos, fx(xPos));
    const slope = dfx(xPos);
    const tang1 = toSvg(xPos - 2, fx(xPos) - 2 * slope);
    const tang2 = toSvg(xPos + 2, fx(xPos) + 2 * slope);

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Interactive: Tangent Line on f(x) = x²</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>x =</span>
                    <input type="range" min={-4} max={4} step={0.1} value={xPos}
                        onChange={e => setXPos(parseFloat(e.target.value))} className="w-24 accent-cyan-400" />
                    <span className="font-mono text-cyan-400 w-8">{xPos.toFixed(1)}</span>
                </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#333" />
                <line x1={W / 2} y1={pad} x2={W / 2} y2={H - pad} stroke="#333" />
                <polyline points={curvePts.join(' ')} fill="none" stroke="#4ADE80" strokeWidth={2} />
                <line x1={tang1.x} y1={tang1.y} x2={tang2.x} y2={tang2.y} stroke="#F472B6" strokeWidth={2} strokeDasharray="6 3" />
                <circle cx={pOnCurve.x} cy={pOnCurve.y} r={5} fill="#00D9FF" />
                <text x={pOnCurve.x + 10} y={pOnCurve.y - 10} fill="#00D9FF" fontSize={11} fontFamily="monospace">
                    slope = {slope.toFixed(2)}
                </text>
                <text x={W - pad - 80} y={pad + 12} fill="#4ADE80" fontSize={10} fontFamily="monospace">f(x) = x²</text>
            </svg>
        </div>
    );
};

// ─── 2. Activation Functions Comparison ───
export const ActivationFunctionsViz: React.FC = () => {
    const [showDerivatives, setShowDerivatives] = useState(false);
    const W = 500, H = 280, pad = 40;

    const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
    const sigmoidDeriv = (x: number) => { const s = sigmoid(x); return s * (1 - s); };
    const tanh_ = (x: number) => Math.tanh(x);
    const tanhDeriv = (x: number) => 1 - Math.tanh(x) ** 2;
    const relu = (x: number) => Math.max(0, x);
    const reluDeriv = (x: number) => x > 0 ? 1 : 0;
    const gelu = (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));

    const fns = showDerivatives
        ? [
            { fn: sigmoidDeriv, color: '#F472B6', label: "σ'(x)" },
            { fn: tanhDeriv, color: '#00D9FF', label: "tanh'(x)" },
            { fn: reluDeriv, color: '#4ADE80', label: "ReLU'(x)" },
        ]
        : [
            { fn: sigmoid, color: '#F472B6', label: 'Sigmoid' },
            { fn: tanh_, color: '#00D9FF', label: 'Tanh' },
            { fn: relu, color: '#4ADE80', label: 'ReLU' },
            { fn: gelu, color: '#FACC15', label: 'GELU' },
        ];

    const xRange = [-5, 5], yRange = showDerivatives ? [-0.2, 1.2] : [-1.5, 2];
    const toSvg = (x: number, y: number) => ({
        x: pad + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (W - 2 * pad),
        y: H - pad - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (H - 2 * pad),
    });

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                    Activation Functions {showDerivatives ? '— Derivatives' : ''}
                </h4>
                <button onClick={() => setShowDerivatives(!showDerivatives)}
                    className="text-xs px-2 py-1 rounded border border-white/20 bg-white/5 text-gray-400 hover:text-white">
                    {showDerivatives ? 'Show Functions' : 'Show Derivatives'}
                </button>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#333" />
                <line x1={toSvg(0, yRange[0]).x} y1={pad} x2={toSvg(0, yRange[0]).x} y2={H - pad} stroke="#333" />
                {/* y=0 line */}
                <line x1={pad} y1={toSvg(0, 0).y} x2={W - pad} y2={toSvg(0, 0).y} stroke="#222" strokeDasharray="4 4" />
                {/* y=1 line */}
                {!showDerivatives && <line x1={pad} y1={toSvg(0, 1).y} x2={W - pad} y2={toSvg(0, 1).y} stroke="#222" strokeDasharray="4 4" />}

                {/* Functions */}
                {fns.map((f, idx) => {
                    const pts: string[] = [];
                    for (let x = xRange[0]; x <= xRange[1]; x += 0.1) {
                        const y = f.fn(x);
                        const clampY = Math.max(yRange[0], Math.min(yRange[1], y));
                        const p = toSvg(x, clampY);
                        pts.push(`${p.x},${p.y}`);
                    }
                    return <polyline key={idx} points={pts.join(' ')} fill="none" stroke={f.color} strokeWidth={2} />;
                })}

                {/* Legend */}
                {fns.map((f, i) => (
                    <g key={i}>
                        <line x1={W - 100} y1={pad + 10 + i * 18} x2={W - 80} y2={pad + 10 + i * 18} stroke={f.color} strokeWidth={2} />
                        <text x={W - 75} y={pad + 14 + i * 18} fill={f.color} fontSize={10} fontFamily="monospace">{f.label}</text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// ─── 3. Taylor Series Approximation ───
export const TaylorSeriesViz: React.FC = () => {
    const [order, setOrder] = useState(1);
    const W = 440, H = 260, pad = 40;

    const sinFn = (x: number) => Math.sin(x);

    // Taylor expansion of sin(x) at x=0
    const taylorSin = (x: number, n: number) => {
        let sum = 0;
        for (let k = 0; k <= n; k++) {
            const sign = k % 2 === 0 ? 1 : -1;
            const exp = 2 * k + 1;
            let fact = 1;
            for (let j = 2; j <= exp; j++) fact *= j;
            sum += sign * Math.pow(x, exp) / fact;
        }
        return sum;
    };

    const xRange = [-4, 4], yRange = [-2, 2];
    const toSvg = (x: number, y: number) => ({
        x: pad + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (W - 2 * pad),
        y: H - pad - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (H - 2 * pad),
    });

    const sinPts: string[] = [];
    const taylorPts: string[] = [];
    for (let x = xRange[0]; x <= xRange[1]; x += 0.05) {
        const sp = toSvg(x, sinFn(x));
        sinPts.push(`${sp.x},${sp.y}`);
        const ty = Math.max(yRange[0], Math.min(yRange[1], taylorSin(x, order)));
        const tp = toSvg(x, ty);
        taylorPts.push(`${tp.x},${tp.y}`);
    }

    const orderLabels = ['x', 'x − x³/3!', 'x − x³/3! + x⁵/5!', '... + x⁷/7!', '... − x⁹/9!'];

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                    Taylor Series — sin(x) ≈ polynomial of order {2 * order + 1}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Terms:</span>
                    <input type="range" min={0} max={4} step={1} value={order}
                        onChange={e => setOrder(parseInt(e.target.value))} className="w-20 accent-purple-400" />
                    <span className="font-mono text-purple-400 w-6">{order + 1}</span>
                </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <line x1={pad} y1={toSvg(0, 0).y} x2={W - pad} y2={toSvg(0, 0).y} stroke="#333" />
                <line x1={toSvg(0, 0).x} y1={pad} x2={toSvg(0, 0).x} y2={H - pad} stroke="#333" />

                {/* True sin(x) */}
                <polyline points={sinPts.join(' ')} fill="none" stroke="#4ADE80" strokeWidth={2.5} />
                {/* Taylor approximation */}
                <polyline points={taylorPts.join(' ')} fill="none" stroke="#F472B6" strokeWidth={2} strokeDasharray="6 3" />

                <text x={W - pad - 60} y={pad + 15} fill="#4ADE80" fontSize={10} fontFamily="monospace">sin(x)</text>
                <text x={W - pad - 60} y={pad + 30} fill="#F472B6" fontSize={10} fontFamily="monospace">Taylor</text>
                <text x={pad + 5} y={H - pad + 16} fill="#888" fontSize={9} fontFamily="monospace">
                    ≈ {orderLabels[order] || '...'}
                </text>
            </svg>
        </div>
    );
};

// ─── 4. Learning Rate Comparison ───
export const LearningRateViz: React.FC = () => {
    const W = 500, H = 200, pad = 30;

    // Simple quadratic loss L(w) = (w - 3)²
    const simulate = (lr: number) => {
        let w = 8;
        const path: number[] = [w];
        for (let i = 0; i < 20; i++) {
            const grad = 2 * (w - 3);
            w = w - lr * grad;
            path.push(w);
        }
        return path;
    };

    const configs = [
        { lr: 0.01, color: '#00D9FF', label: 'α=0.01 (too slow)' },
        { lr: 0.1, color: '#4ADE80', label: 'α=0.1 (just right)' },
        { lr: 0.95, color: '#F472B6', label: 'α=0.95 (oscillates)' },
    ];

    const toSvg = (step: number, w: number) => ({
        x: pad + (step / 20) * (W - 2 * pad),
        y: H - pad - ((w - (-5)) / 15) * (H - 2 * pad),
    });

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
                Learning Rate Comparison — Converging to w* = 3
            </h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#333" />
                {/* Target line */}
                <line x1={pad} y1={toSvg(0, 3).y} x2={W - pad} y2={toSvg(0, 3).y} stroke="#FACC15" strokeDasharray="4 4" opacity={0.3} />
                <text x={W - pad + 5} y={toSvg(0, 3).y + 3} fill="#FACC15" fontSize={9} opacity={0.6}>w*=3</text>

                {configs.map((cfg, ci) => {
                    const path = simulate(cfg.lr);
                    const pts = path.map((w, i) => {
                        const p = toSvg(i, Math.max(-5, Math.min(10, w)));
                        return `${p.x},${p.y}`;
                    });
                    return (
                        <g key={ci}>
                            <polyline points={pts.join(' ')} fill="none" stroke={cfg.color} strokeWidth={1.5} />
                            {path.slice(0, 10).map((w, i) => {
                                const p = toSvg(i, Math.max(-5, Math.min(10, w)));
                                return <circle key={i} cx={p.x} cy={p.y} r={2} fill={cfg.color} />;
                            })}
                        </g>
                    );
                })}

                {/* Legend */}
                {configs.map((cfg, i) => (
                    <g key={i}>
                        <line x1={pad + 10} y1={pad + 5 + i * 15} x2={pad + 30} y2={pad + 5 + i * 15} stroke={cfg.color} strokeWidth={2} />
                        <text x={pad + 35} y={pad + 9 + i * 15} fill={cfg.color} fontSize={9} fontFamily="monospace">{cfg.label}</text>
                    </g>
                ))}
                <text x={W / 2} y={H - 5} fill="#555" fontSize={9} textAnchor="middle">Training Steps</text>
            </svg>
        </div>
    );
};

// ─── 5. Chain Rule Computation Graph ───
export const ChainRuleGraphViz: React.FC = () => {
    const W = 480, H = 200;

    const nodes = [
        { id: 'x', x: 50, y: 100, label: 'x', color: '#00D9FF' },
        { id: 'h1', x: 160, y: 60, label: 'h₁=σ(w₁x)', color: '#A855F7' },
        { id: 'h2', x: 160, y: 140, label: 'h₂=σ(w₂x)', color: '#A855F7' },
        { id: 'y', x: 300, y: 100, label: 'ŷ=w₃h₁+w₄h₂', color: '#FACC15' },
        { id: 'L', x: 420, y: 100, label: 'L=(y−ŷ)²', color: '#F472B6' },
    ];

    const edges = [
        { from: 'x', to: 'h1', label: 'w₁' },
        { from: 'x', to: 'h2', label: 'w₂' },
        { from: 'h1', to: 'y', label: 'w₃' },
        { from: 'h2', to: 'y', label: 'w₄' },
        { from: 'y', to: 'L', label: '' },
    ];

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
                Computation Graph — Chain Rule in Backpropagation
            </h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <marker id="arrow-chain" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#555" />
                    </marker>
                    <marker id="arrow-back" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
                        <polygon points="8 0, 0 3, 8 6" fill="#F472B6" />
                    </marker>
                </defs>

                {/* Forward edges */}
                {edges.map((e, i) => {
                    const from = nodeMap[e.from], to = nodeMap[e.to];
                    return (
                        <g key={i}>
                            <line x1={from.x + 20} y1={from.y} x2={to.x - 25} y2={to.y}
                                stroke="#555" strokeWidth={1.5} markerEnd="url(#arrow-chain)" />
                            {e.label && (
                                <text x={(from.x + to.x) / 2 + 5} y={(from.y + to.y) / 2 - 8}
                                    fill="#888" fontSize={9} fontFamily="monospace">{e.label}</text>
                            )}
                        </g>
                    );
                })}

                {/* Backward arrows (red, below) */}
                {edges.map((e, i) => {
                    const from = nodeMap[e.from], to = nodeMap[e.to];
                    return (
                        <line key={`b${i}`} x1={to.x - 25} y1={to.y + 12} x2={from.x + 25} y2={from.y + 12}
                            stroke="#F472B6" strokeWidth={1} strokeDasharray="4 2" markerEnd="url(#arrow-back)" opacity={0.5} />
                    );
                })}

                {/* Nodes */}
                {nodes.map(n => (
                    <g key={n.id}>
                        <circle cx={n.x} cy={n.y} r={20} fill="rgba(0,0,0,0.6)" stroke={n.color} strokeWidth={1.5} />
                        <text x={n.x} y={n.y + 4} fill={n.color} fontSize={8} textAnchor="middle" fontFamily="monospace">{n.label.split('=')[0]}</text>
                    </g>
                ))}

                {/* Labels */}
                <text x={W / 2} y={20} fill="#4ADE80" fontSize={10} textAnchor="middle" fontFamily="monospace">
                    Forward Pass →
                </text>
                <text x={W / 2} y={H - 5} fill="#F472B6" fontSize={10} textAnchor="middle" fontFamily="monospace">
                    ← Backward Pass (gradients flow backwards)
                </text>
            </svg>
        </div>
    );
};

// ─── 6. Gradient Vector Field on contour ───
export const GradientVectorFieldViz: React.FC = () => {
    const W = 400, H = 260;

    const contours = [1, 2, 3, 4].map(r => {
        const pts: string[] = [];
        for (let a = 0; a <= 2 * Math.PI; a += 0.1) {
            pts.push(`${W / 2 + r * 30 * Math.cos(a)},${H / 2 + r * 30 * Math.sin(a)}`);
        }
        return pts.join(' ');
    });

    const arrows: { x: number; y: number; dx: number; dy: number }[] = [];
    for (let xi = -3; xi <= 3; xi += 1.5) {
        for (let yi = -2; yi <= 2; yi += 1.5) {
            if (Math.abs(xi) < 0.5 && Math.abs(yi) < 0.5) continue;
            const mag = Math.sqrt(xi * xi + yi * yi);
            arrows.push({ x: W / 2 + xi * 30, y: H / 2 + yi * 30, dx: (xi / mag) * 15, dy: (yi / mag) * 15 });
        }
    }

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Gradient Vector Field — f(x,y) = x² + y²</h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#FACC15" />
                    </marker>
                </defs>
                {contours.map((pts, i) => (
                    <polyline key={i} points={pts} fill="none" stroke={`rgba(0,217,255,${0.15 + i * 0.1})`} strokeWidth={1} />
                ))}
                {arrows.map((a, i) => (
                    <line key={i} x1={a.x} y1={a.y} x2={a.x + a.dx} y2={a.y + a.dy}
                        stroke="#FACC15" strokeWidth={1.5} markerEnd="url(#arrowhead)" opacity={0.8} />
                ))}
                <circle cx={W / 2} cy={H / 2} r={4} fill="#4ADE80" />
                <text x={W / 2 + 8} y={H / 2 + 4} fill="#4ADE80" fontSize={10} fontFamily="monospace">minimum</text>
                <text x={W - 82} y={20} fill="#555" fontSize={9} fontFamily="monospace">∇f points outward</text>
                <text x={W - 82} y={32} fill="#555" fontSize={9} fontFamily="monospace">We go −∇f (inward)</text>
            </svg>
        </div>
    );
};

// ─── 7. Integral: area under curve ───
export const IntegralAreaViz: React.FC = () => {
    const [bound, setBound] = useState<[number, number]>([1.5, 5.5]);
    const W = 440, H = 200, pad = 35;
    const fx = (x: number) => 0.35 * Math.sin(x * 0.8) + 0.55 + 0.05 * x;

    const toSvg = (x: number, y: number) => ({
        x: pad + (x / 8) * (W - 2 * pad),
        y: H - pad - y * (H - 2 * pad),
    });

    const curvePts: string[] = [];
    const areaPts: string[] = [];
    const aStart = toSvg(bound[0], 0);
    areaPts.push(`${aStart.x},${aStart.y}`);

    for (let t = 0; t <= 8; t += 0.05) {
        const p = toSvg(t, fx(t));
        curvePts.push(`${p.x},${p.y}`);
        if (t >= bound[0] && t <= bound[1]) areaPts.push(`${p.x},${p.y}`);
    }
    areaPts.push(`${toSvg(bound[1], 0).x},${toSvg(bound[1], 0).y}`);

    // Approximate integral value using Riemann sum
    let area = 0;
    for (let t = bound[0]; t < bound[1]; t += 0.05) area += fx(t) * 0.05;

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Definite Integral — Area Under The Curve</h4>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>a=</span>
                    <input type="range" min={0.5} max={4} step={0.1} value={bound[0]}
                        onChange={e => setBound([parseFloat(e.target.value), bound[1]])} className="w-16 accent-cyan-400" />
                    <span>b=</span>
                    <input type="range" min={3} max={7.5} step={0.1} value={bound[1]}
                        onChange={e => setBound([bound[0], parseFloat(e.target.value)])} className="w-16 accent-cyan-400" />
                    <span className="font-mono text-cyan-400">≈ {area.toFixed(2)}</span>
                </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#333" />
                <polygon points={areaPts.join(' ')} fill="rgba(0,217,255,0.15)" />
                <polyline points={curvePts.join(' ')} fill="none" stroke="#4ADE80" strokeWidth={2} />
                {bound.map((bx, i) => {
                    const p = toSvg(bx, fx(bx)), base = toSvg(bx, 0);
                    return (
                        <g key={i}>
                            <line x1={p.x} y1={p.y} x2={base.x} y2={base.y} stroke="#00D9FF" strokeDasharray="4 2" />
                            <text x={base.x - 3} y={base.y + 14} fill="#00D9FF" fontSize={10}>{i === 0 ? 'a' : 'b'}</text>
                        </g>
                    );
                })}
                <text x={(toSvg(bound[0], 0).x + toSvg(bound[1], 0).x) / 2 - 20} y={H - pad - 25}
                    fill="rgba(0,217,255,0.6)" fontSize={12} fontFamily="monospace">∫ f(x) dx</text>
            </svg>
        </div>
    );
};

// ─── 8. Gaussian bell curve with σ bands ───
export const GaussianCurveViz: React.FC = () => {
    const [mu, setMu] = useState(0);
    const [sigma, setSigma] = useState(1);
    const W = 460, H = 220, pad = 35;

    const gaussian = (x: number) => (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);

    const toSvg = (x: number, y: number) => ({
        x: pad + ((x + 6) / 12) * (W - 2 * pad),
        y: H - pad - (y / 0.5) * (H - 2 * pad),
    });

    const curvePts: string[] = [];
    for (let t = -6; t <= 6; t += 0.08) {
        const p = toSvg(t, gaussian(t));
        curvePts.push(`${p.x},${p.y}`);
    }

    const bands = [
        { from: mu - 3 * sigma, to: mu + 3 * sigma, color: 'rgba(250,204,21,0.04)', pct: '99.7%' },
        { from: mu - 2 * sigma, to: mu + 2 * sigma, color: 'rgba(168,85,247,0.07)', pct: '95.4%' },
        { from: mu - sigma, to: mu + sigma, color: 'rgba(0,217,255,0.12)', pct: '68.2%' },
    ];

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Gaussian — 68-95-99.7 Rule</h4>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>μ=</span>
                    <input type="range" min={-3} max={3} step={0.1} value={mu}
                        onChange={e => setMu(parseFloat(e.target.value))} className="w-16 accent-purple-400" />
                    <span className="font-mono text-purple-400 w-6">{mu.toFixed(1)}</span>
                    <span>σ=</span>
                    <input type="range" min={0.3} max={2.5} step={0.1} value={sigma}
                        onChange={e => setSigma(parseFloat(e.target.value))} className="w-16 accent-cyan-400" />
                    <span className="font-mono text-cyan-400 w-6">{sigma.toFixed(1)}</span>
                </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#333" />
                {bands.map((band, idx) => {
                    const pts: string[] = [];
                    pts.push(`${toSvg(band.from, 0).x},${toSvg(band.from, 0).y}`);
                    for (let t = band.from; t <= band.to; t += 0.05) pts.push(`${toSvg(t, gaussian(t)).x},${toSvg(t, gaussian(t)).y}`);
                    pts.push(`${toSvg(band.to, 0).x},${toSvg(band.to, 0).y}`);
                    return <polygon key={idx} points={pts.join(' ')} fill={band.color} />;
                })}
                <polyline points={curvePts.join(' ')} fill="none" stroke="#A855F7" strokeWidth={2} />
                <text x={toSvg(mu, 0).x - 8} y={60} fill="rgba(0,217,255,0.7)" fontSize={10} fontFamily="monospace">68.2%</text>
                {[-3, -2, -1, 0, 1, 2, 3].map(s => {
                    const val = mu + s * sigma;
                    const p = toSvg(val, 0);
                    return <text key={s} x={p.x - 6} y={p.y + 14} fill="#555" fontSize={8} fontFamily="monospace">
                        {s === 0 ? 'μ' : `${s > 0 ? '+' : ''}${s}σ`}
                    </text>;
                })}
            </svg>
        </div>
    );
};

// ─── 9. Central Limit Theorem Demo ───
export const CentralLimitTheoremViz: React.FC = () => {
    const [sampleSize, setSampleSize] = useState(5);
    const [numSamples, setNumSamples] = useState(500);
    const W = 460, H = 220, pad = 35;

    // Generate means of uniform [0,1] samples
    const means = React.useMemo(() => {
        const result: number[] = [];
        for (let i = 0; i < numSamples; i++) {
            let sum = 0;
            for (let j = 0; j < sampleSize; j++) sum += Math.random();
            result.push(sum / sampleSize);
        }
        return result;
    }, [sampleSize, numSamples]);

    // Histogram bins
    const bins = 30;
    const hist = Array(bins).fill(0);
    means.forEach(m => {
        const bin = Math.min(bins - 1, Math.floor(m * bins));
        hist[bin]++;
    });
    const maxBin = Math.max(...hist, 1);

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                    Central Limit Theorem — Mean of {sampleSize} uniform samples
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>n=</span>
                    <input type="range" min={1} max={50} step={1} value={sampleSize}
                        onChange={e => setSampleSize(parseInt(e.target.value))} className="w-20 accent-green-400" />
                    <span className="font-mono text-green-400 w-6">{sampleSize}</span>
                    <button onClick={() => setNumSamples(n => n + 1)}
                        className="px-2 py-0.5 rounded border border-white/20 bg-white/5 text-gray-400 hover:text-white text-xs">
                        Resample
                    </button>
                </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#333" />
                {hist.map((count, i) => {
                    const barW = (W - 2 * pad) / bins;
                    const barH = (count / maxBin) * (H - 2 * pad);
                    return (
                        <rect key={i} x={pad + i * barW} y={H - pad - barH} width={barW - 1} height={barH}
                            fill={sampleSize <= 1 ? '#FACC15' : '#4ADE80'} opacity={0.6} rx={1} />
                    );
                })}
                <text x={pad + 5} y={pad + 15} fill="#888" fontSize={9} fontFamily="monospace">
                    {sampleSize <= 1 ? 'Uniform (flat)' : sampleSize < 5 ? 'Getting bell-shaped...' : 'Approximately Gaussian! 🎯'}
                </text>
                <text x={W / 2} y={H - 5} fill="#555" fontSize={9} textAnchor="middle">Sample Mean Value</text>
            </svg>
        </div>
    );
};

// ─── 10. Bayes Theorem visual ───
export const BayesViz: React.FC = () => {
    const W = 420, H = 200;
    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Bayes' Theorem — Visual Intuition</h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <rect x={40} y={20} width={340} height={140} rx={8} fill="none" stroke="#333" />
                <text x={50} y={15} fill="#555" fontSize={10}>Sample Space Ω</text>
                <ellipse cx={180} cy={90} rx={95} ry={55} fill="rgba(168,85,247,0.15)" stroke="#A855F7" strokeWidth={1.5} />
                <text x={100} y={55} fill="#A855F7" fontSize={11} fontWeight="bold">P(H)</text>
                <ellipse cx={250} cy={90} rx={90} ry={50} fill="rgba(0,217,255,0.1)" stroke="#00D9FF" strokeWidth={1.5} />
                <text x={300} y={55} fill="#00D9FF" fontSize={11} fontWeight="bold">P(D)</text>
                <text x={210} y={92} fill="#FACC15" fontSize={10} fontWeight="bold" textAnchor="middle">P(H∩D)</text>
                <text x={210} y={107} fill="#888" fontSize={8} textAnchor="middle">= P(D|H)·P(H)</text>
                <text x={210} y={185} fill="#F472B6" fontSize={11} fontFamily="monospace" textAnchor="middle">
                    P(H|D) = P(H∩D) / P(D)
                </text>
            </svg>
        </div>
    );
};

// ─── 11. Entropy comparison ───
export const EntropyViz: React.FC = () => {
    const W = 440, H = 170;
    const barW = 22, barGap = 8;
    const lowBars = [0.05, 0.05, 0.8, 0.05, 0.05];
    const highBars = [0.2, 0.2, 0.2, 0.2, 0.2];

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Entropy — Predictable vs Uncertain</h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                <text x={70} y={20} fill="#4ADE80" fontSize={11} fontWeight="bold" textAnchor="middle">Low Entropy</text>
                <text x={70} y={32} fill="#666" fontSize={8} textAnchor="middle">H = 0.97 bits</text>
                {lowBars.map((p, i) => (
                    <rect key={i} x={20 + i * (barW + barGap)} y={H - 20 - p * 100} width={barW} height={p * 100} fill="#4ADE80" rx={2} />
                ))}
                <text x={350} y={20} fill="#F472B6" fontSize={11} fontWeight="bold" textAnchor="middle">High Entropy</text>
                <text x={350} y={32} fill="#666" fontSize={8} textAnchor="middle">H = 2.32 bits</text>
                {highBars.map((p, i) => (
                    <rect key={i} x={290 + i * (barW + barGap)} y={H - 20 - p * 100} width={barW} height={p * 100} fill="#F472B6" rx={2} />
                ))}
                <line x1={15} y1={H - 20} x2={180} y2={H - 20} stroke="#333" />
                <line x1={285} y1={H - 20} x2={440} y2={H - 20} stroke="#333" />
            </svg>
        </div>
    );
};

// ─── 12. Loss Landscape with GD path ───
export const LossLandscapeViz: React.FC = () => {
    const W = 440, H = 220;
    const contours = [1, 2, 3, 4, 5].map(r => {
        const pts: string[] = [];
        for (let a = 0; a <= 2 * Math.PI; a += 0.08) {
            const cx = 220 + r * 18 * Math.cos(a) * (1 + 0.3 * Math.sin(2 * a));
            const cy = 110 + r * 14 * Math.sin(a) * (1 + 0.2 * Math.cos(3 * a));
            pts.push(`${cx},${cy}`);
        }
        return pts.join(' ');
    });

    const path: string[] = [];
    let px = 350, py = 170;
    for (let i = 0; i <= 12; i++) {
        path.push(`${px},${py}`);
        px += (220 - px) * 0.25 + Math.sin(i) * 5;
        py += (110 - py) * 0.25 + Math.cos(i) * 3;
    }

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Loss Landscape — Gradient Descent Path</h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                {contours.map((pts, i) => (
                    <polyline key={i} points={pts} fill="none" stroke={`rgba(168,85,247,${0.1 + i * 0.08})`} strokeWidth={1} />
                ))}
                <polyline points={path.join(' ')} fill="none" stroke="#FACC15" strokeWidth={2} strokeDasharray="5 3" />
                {path.map((pt, i) => {
                    const [x, y] = pt.split(',').map(Number);
                    return <circle key={i} cx={x} cy={y} r={i === 0 ? 5 : 3} fill={i === 0 ? '#F472B6' : '#FACC15'} />;
                })}
                <circle cx={220} cy={110} r={5} fill="#4ADE80" />
                <text x={230} y={108} fill="#4ADE80" fontSize={10} fontFamily="monospace">θ*</text>
                <text x={355} y={165} fill="#F472B6" fontSize={9} fontFamily="monospace">θ₀ (start)</text>
                <text x={10} y={15} fill="#555" fontSize={9} fontFamily="monospace">Loss contours</text>
            </svg>
        </div>
    );
};

// ─── 13. Covariance Scatter Plot ───
export const CovarianceViz: React.FC = () => {
    const W = 460, H = 180, pad = 35;

    // Generate correlated data with different correlations
    const makeData = (rho: number, n: number) => {
        const pts: [number, number][] = [];
        // Simple correlated data generation
        for (let i = 0; i < n; i++) {
            const u = (Math.random() - 0.5) * 4;
            const v = (Math.random() - 0.5) * 4;
            const x = u;
            const y = rho * u + Math.sqrt(1 - rho * rho) * v;
            pts.push([x, y]);
        }
        return pts;
    };

    const datasets = [
        { rho: 0.9, label: 'ρ = 0.9', color: '#4ADE80', x0: 10 },
        { rho: 0.0, label: 'ρ = 0.0', color: '#FACC15', x0: 160 },
        { rho: -0.8, label: 'ρ = −0.8', color: '#F472B6', x0: 310 },
    ];

    const toSvg = (x: number, y: number, x0: number) => ({
        x: x0 + pad + ((x + 3) / 6) * 100,
        y: H - pad - ((y + 3) / 6) * (H - 2 * pad),
    });

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
                Covariance & Correlation — How Variables Move Together
            </h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                {datasets.map((ds, di) => {
                    const data = makeData(ds.rho, 60);
                    return (
                        <g key={di}>
                            <text x={ds.x0 + pad + 50} y={18} fill={ds.color} fontSize={10} fontWeight="bold" textAnchor="middle">{ds.label}</text>
                            {data.map((pt, i) => {
                                const p = toSvg(pt[0], pt[1], ds.x0);
                                return <circle key={i} cx={p.x} cy={p.y} r={2} fill={ds.color} opacity={0.5} />;
                            })}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// ─── 14. Momentum vs No Momentum ───
export const MomentumComparisonViz: React.FC = () => {
    const W = 460, H = 200, pad = 35;

    // Simulate on elongated quadratic: f(x,y) = 5x² + 0.5y²
    const simulate = (useMomentum: boolean) => {
        let x = 4, y = 4;
        let vx = 0, vy = 0;
        const lr = 0.02, beta = 0.85;
        const points: [number, number][] = [[x, y]];

        for (let i = 0; i < 50; i++) {
            const gx = 10 * x, gy = 1 * y; // gradient
            if (useMomentum) {
                vx = beta * vx + gx;
                vy = beta * vy + gy;
                x -= lr * vx;
                y -= lr * vy;
            } else {
                x -= lr * gx;
                y -= lr * gy;
            }
            points.push([x, y]);
        }
        return points;
    };

    const pathNoMomentum = simulate(false);
    const pathMomentum = simulate(true);

    const toSvg = (x: number, y: number) => ({
        x: pad + ((x + 5) / 10) * (W - 2 * pad),
        y: H - pad - ((y + 5) / 10) * (H - 2 * pad),
    });

    // Contour lines
    const contours = [0.5, 2, 5, 10, 20].map(level => {
        const pts: string[] = [];
        for (let a = 0; a <= 2 * Math.PI; a += 0.1) {
            const rx = Math.sqrt(level / 5), ry = Math.sqrt(level / 0.5);
            const cx = rx * Math.cos(a), cy = ry * Math.sin(a);
            if (Math.abs(cx) <= 5 && Math.abs(cy) <= 5) {
                const p = toSvg(cx, cy);
                pts.push(`${p.x},${p.y}`);
            }
        }
        return pts.join(' ');
    });

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 my-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
                Momentum vs Plain GD — Elongated Loss Surface
            </h4>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
                {/* Contours */}
                {contours.map((pts, i) => (
                    <polyline key={i} points={pts} fill="none" stroke={`rgba(255,255,255,${0.05 + i * 0.02})`} strokeWidth={1} />
                ))}

                {/* Plain GD */}
                <polyline points={pathNoMomentum.slice(0, 15).map(p => { const s = toSvg(p[0], p[1]); return `${s.x},${s.y}`; }).join(' ')}
                    fill="none" stroke="#F472B6" strokeWidth={1.5} />
                {pathNoMomentum.slice(0, 15).map((p, i) => {
                    const s = toSvg(p[0], p[1]);
                    return <circle key={i} cx={s.x} cy={s.y} r={2} fill="#F472B6" />;
                })}

                {/* Momentum */}
                <polyline points={pathMomentum.slice(0, 15).map(p => { const s = toSvg(p[0], p[1]); return `${s.x},${s.y}`; }).join(' ')}
                    fill="none" stroke="#4ADE80" strokeWidth={1.5} />
                {pathMomentum.slice(0, 15).map((p, i) => {
                    const s = toSvg(p[0], p[1]);
                    return <circle key={i} cx={s.x} cy={s.y} r={2} fill="#4ADE80" />;
                })}

                {/* Minimum */}
                {(() => { const s = toSvg(0, 0); return <circle cx={s.x} cy={s.y} r={4} fill="#FACC15" />; })()}

                {/* Legend */}
                <line x1={pad + 5} y1={pad + 5} x2={pad + 25} y2={pad + 5} stroke="#F472B6" strokeWidth={2} />
                <text x={pad + 30} y={pad + 9} fill="#F472B6" fontSize={9} fontFamily="monospace">Plain SGD (oscillates)</text>
                <line x1={pad + 5} y1={pad + 20} x2={pad + 25} y2={pad + 20} stroke="#4ADE80" strokeWidth={2} />
                <text x={pad + 30} y={pad + 24} fill="#4ADE80" fontSize={9} fontFamily="monospace">With Momentum (smoother)</text>
            </svg>
        </div>
    );
};
