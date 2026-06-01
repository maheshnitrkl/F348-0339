import React, { useState } from 'react';
import { MathEquation } from '../../../../components/MathEquation';

export const PerceptronViz: React.FC = () => {
    const [w1, setW1] = useState(0.5);
    const [w2, setW2] = useState(-0.5);
    const [bias, setBias] = useState(0.1);

    // Points to classify (OR gate logic approximation)
    const points = [
        { x: 0, y: 0, label: 0 },
        { x: 0, y: 1, label: 1 },
        { x: 1, y: 0, label: 1 },
        { x: 1, y: 1, label: 1 },
    ];

    const activation = (x: number, y: number) => {
        return (w1 * x + w2 * y + bias) >= 0 ? 1 : 0;
    };

    // Calculate line endpoints for y = (-w1/w2)x - (bias/w2)
    // Avoid division by zero
    const getLinePoints = () => {
        if (Math.abs(w2) < 0.01) return null; // Vertical line approx

        const x1 = -0.5;
        const y1 = (-w1 * x1 - bias) / w2;

        const x2 = 1.5;
        const y2 = (-w1 * x2 - bias) / w2;

        return { x1, y1, x2, y2 };
    };

    const line = getLinePoints();

    // Scale coordinates for SVG (0 to 1 map to 50 to 250)
    const scale = (val: number) => 50 + val * 200;
    const invScaleY = (val: number) => 250 - val * 200; // SVGs y-axis is down

    return (
        <div className="w-full flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 300">
                    {/* Classification Regions (Background) */}
                    {/* Simplified: just show axis and line for now */}
                    <line x1="50" y1="250" x2="250" y2="250" stroke="#475569" strokeWidth="2" />
                    <line x1="50" y1="250" x2="50" y2="50" stroke="#475569" strokeWidth="2" />

                    {/* Decision Boundary */}
                    {line && (
                        <line
                            x1={scale(line.x1)}
                            y1={invScaleY(line.y1)}
                            x2={scale(line.x2)}
                            y2={invScaleY(line.y2)}
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                        />
                    )}

                    {/* Data Points */}
                    {points.map((p, i) => {
                        const pred = activation(p.x, p.y);
                        const isCorrect = pred === p.label;
                        return (
                            <g key={i}>
                                <circle
                                    cx={scale(p.x)}
                                    cy={invScaleY(p.y)}
                                    r="8"
                                    fill={p.label === 1 ? '#10b981' : '#ef4444'}
                                    stroke={isCorrect ? 'white' : 'yellow'}
                                    strokeWidth={isCorrect ? 2 : 3}
                                />
                                {!isCorrect && (
                                    <line x1={scale(p.x) - 5} y1={invScaleY(p.y) - 5} x2={scale(p.x) + 5} y2={invScaleY(p.y) + 5} stroke="yellow" strokeWidth="2" />
                                )}
                            </g>
                        );
                    })}
                </svg>
                <div className="absolute top-2 left-2 text-xs text-slate-500">
                    <span className="text-emerald-500">●</span> Class 1 (Green) <br />
                    <span className="text-red-500">●</span> Class 0 (Red)
                </div>
            </div>

            <div className="w-full md:w-1/2 space-y-6">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Weights & Bias</h4>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Weight 1 (w₁)</span>
                                <span className="text-violet-400 font-mono">{w1.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="-2" max="2" step="0.1"
                                value={w1} onChange={(e) => setW1(parseFloat(e.target.value))}
                                className="w-full accent-violet-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Weight 2 (w₂)</span>
                                <span className="text-violet-400 font-mono">{w2.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="-2" max="2" step="0.1"
                                value={w2} onChange={(e) => setW2(parseFloat(e.target.value))}
                                className="w-full accent-violet-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Bias (b)</span>
                                <span className="text-violet-400 font-mono">{bias.toFixed(2)}</span>
                            </div>
                            <input
                                type="range" min="-2" max="2" step="0.1"
                                value={bias} onChange={(e) => setBias(parseFloat(e.target.value))}
                                className="w-full accent-violet-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">Equation</h4>
                    <MathEquation formula={`y = \\mathbb{I}(${w1}x_1 + ${w2}x_2 + ${bias} \\geq 0)`} />
                </div>
            </div>
        </div>
    );
};
