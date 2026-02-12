import React, { useState, useEffect } from 'react';

interface Point {
    x: number;
    y: number;
}

const INITIAL_DATA: Point[] = [
    { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 4 }, { x: 4, y: 8 }, { x: 5, y: 9 }
];

export const TrainingViz: React.FC = () => {
    const [params, setParams] = useState({ m: 0.5, b: 0.0 });
    const [isTraining, setIsTraining] = useState(false);
    const [epoch, setEpoch] = useState(0);
    const learningRate = 0.05;
    const data = INITIAL_DATA;

    // Training Loop
    useEffect(() => {
        if (!isTraining) return;

        const interval = setInterval(() => {
            setParams(prev => {
                let grad_m = 0;
                let grad_b = 0;
                const n = data.length;

                for (let i = 0; i < n; i++) {
                    const y_pred = prev.m * data[i].x + prev.b;
                    const error = y_pred - data[i].y;
                    grad_m += error * data[i].x;
                    grad_b += error;
                }

                return {
                    m: prev.m - learningRate * (2 / n) * grad_m,
                    b: prev.b - learningRate * (2 / n) * grad_b
                };
            });
            setEpoch(prev => prev + 1);
        }, 50);

        return () => clearInterval(interval);
    }, [isTraining, data, learningRate]);

    // Compute current MSE
    const mse = data.reduce((sum, p) => {
        const pred = params.m * p.x + params.b;
        return sum + (pred - p.y) ** 2;
    }, 0) / data.length;

    // SVG scaling
    const W = 500;
    const H = 300;
    const maxX = 6;
    const maxY = 12;

    const toSvg = (x: number, y: number) => ({
        x: (x / maxX) * W,
        y: H - (y / maxY) * H
    });

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 my-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Visual Training Loop</h3>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setParams({ m: Math.random() * 2 - 1, b: Math.random() * 5 });
                            setIsTraining(false);
                            setEpoch(0);
                        }}
                        className="px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20 transition-colors"
                    >
                        Randomize Weights
                    </button>
                    <button
                        onClick={() => setIsTraining(!isTraining)}
                        className={`px-4 py-1 rounded text-sm font-bold transition-colors ${isTraining ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                    >
                        {isTraining ? 'Stop Training' : 'Start Training'}
                    </button>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Graph */}
                <div className="relative border border-white/10 bg-black/40 rounded-lg overflow-hidden flex-1 h-[300px]">
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                        {/* Grid lines */}
                        {[0, 2, 4, 6, 8, 10].map(y => (
                            <line key={`grid-y-${y}`}
                                x1="0" y1={toSvg(0, y).y}
                                x2={W} y2={toSvg(0, y).y}
                                stroke="#ffffff08" strokeWidth="1"
                            />
                        ))}
                        {[1, 2, 3, 4, 5].map(x => (
                            <line key={`grid-x-${x}`}
                                x1={toSvg(x, 0).x} y1="0"
                                x2={toSvg(x, 0).x} y2={H}
                                stroke="#ffffff08" strokeWidth="1"
                            />
                        ))}

                        {/* Axes */}
                        <line x1="0" y1={H} x2={W} y2={H} stroke="#555" strokeWidth="1" />
                        <line x1="0" y1="0" x2="0" y2={H} stroke="#555" strokeWidth="1" />

                        {/* Error lines (residuals) */}
                        {data.map((p, i) => {
                            const actual = toSvg(p.x, p.y);
                            const predicted = toSvg(p.x, params.m * p.x + params.b);
                            return (
                                <line key={`err-${i}`}
                                    x1={actual.x} y1={actual.y}
                                    x2={predicted.x} y2={predicted.y}
                                    stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.5"
                                />
                            );
                        })}

                        {/* Regression Line */}
                        <line
                            x1={toSvg(0, params.b).x}
                            y1={toSvg(0, params.b).y}
                            x2={toSvg(maxX, params.m * maxX + params.b).x}
                            y2={toSvg(maxX, params.m * maxX + params.b).y}
                            stroke="#22d3ee"
                            strokeWidth="3"
                        />

                        {/* Data Points (on top) */}
                        {data.map((p, i) => {
                            const svgP = toSvg(p.x, p.y);
                            return (
                                <circle key={i} cx={svgP.x} cy={svgP.y} r="6"
                                    fill="#F472B6" stroke="#fff" strokeWidth="1"
                                />
                            );
                        })}
                    </svg>
                </div>

                {/* Stats */}
                <div className="w-48 space-y-4 font-mono text-sm text-gray-300">
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Epoch</div>
                        <div className="text-xl text-white">{epoch}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Weight (m)</div>
                        <div className="text-xl text-cyan-400">{params.m.toFixed(4)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Bias (b)</div>
                        <div className="text-xl text-cyan-400">{params.b.toFixed(4)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">MSE Loss</div>
                        <div className={`text-xl ${mse < 1 ? 'text-green-400' : 'text-orange-400'}`}>
                            {mse.toFixed(4)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Learning Rate</div>
                        <div className="text-sm text-gray-400">{learningRate}</div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 italic">
                Backpropagation calculates gradients for &apos;m&apos; and &apos;b&apos; to minimize the distance between the cyan line and pink dots.
                Dashed red lines show the error (residual) for each point.
            </p>
        </div>
    );
};
