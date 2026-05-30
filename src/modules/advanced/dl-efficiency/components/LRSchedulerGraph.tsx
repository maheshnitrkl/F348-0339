import React, { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export function LRSchedulerGraph() {
    const [maxLR, setMaxLR] = useState(0.1);
    const [warmupEpochs, setWarmupEpochs] = useState(15);
    const totalEpochs = 100;
    const stepSize = 30;
    const decayFactor = 0.5;

    // SVG coordinate space
    const width = 800;
    const height = 300;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Data generation
    const { stepData, cosineData, warmupData } = useMemo(() => {
        const step = [];
        const cosine = [];
        const warmup = [];

        for (let epoch = 0; epoch <= totalEpochs; epoch++) {
            // Step Decay
            const numDrops = Math.floor(epoch / stepSize);
            step.push(maxLR * Math.pow(decayFactor, numDrops));

            // Cosine
            cosine.push((maxLR / 2) * (1 + Math.cos((epoch / totalEpochs) * Math.PI)));

            // Warmup + Cosine
            if (epoch < warmupEpochs) {
                // Linear warmup
                warmup.push((epoch / warmupEpochs) * maxLR);
            } else {
                // Cosine after warmup
                const progress = (epoch - warmupEpochs) / (totalEpochs - warmupEpochs);
                warmup.push((maxLR / 2) * (1 + Math.cos(progress * Math.PI)));
            }
        }
        return { stepData: step, cosineData: cosine, warmupData: warmup };
    }, [maxLR, warmupEpochs]);

    // Helpers to convert to SVG coords
    const getX = (epoch: number) => padding + (epoch / totalEpochs) * graphWidth;
    // Y is inverted in SVG (0 is top)
    const getY = (lr: number) => padding + graphHeight - (lr / 0.15) * graphHeight; // Normalize against absolute max possible (0.15)

    const createPath = (data: number[]) => {
        return data.map((lr, epoch) => `${epoch === 0 ? 'M' : 'L'} ${getX(epoch)} ${getY(lr)}`).join(' ');
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            {/* Header & Controls */}
            <div className="p-5 bg-slate-900/60 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="text-cyan-400" size={20} />
                    <h4 className="text-white font-bold text-lg">Interactive Scheduler</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Max LR Slider */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400 font-medium">Max Learning Rate (<span className="font-mono text-cyan-400">η</span>)</span>
                            <span className="text-white font-mono">{maxLR.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.01"
                            max="0.15"
                            step="0.01"
                            value={maxLR}
                            onChange={(e) => setMaxLR(parseFloat(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                    </div>

                    {/* Warmup Epochs Slider */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400 font-medium">Warmup Epochs</span>
                            <span className="text-white font-mono">{warmupEpochs}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={warmupEpochs}
                            onChange={(e) => setWarmupEpochs(parseInt(e.target.value))}
                            className="w-full accent-violet-500"
                        />
                    </div>
                </div>
            </div>

            {/* SVG Graph */}
            <div className="p-4 bg-slate-950 flex justify-center relative overflow-x-auto">
                {/* Legend */}
                <div className="absolute top-6 right-8 bg-slate-900/80 p-3 rounded-lg border border-slate-800 backdrop-blur text-xs flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-emerald-500 rounded"></div>
                        <span className="text-emerald-400 font-bold">Step Decay</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-cyan-500 rounded"></div>
                        <span className="text-cyan-400 font-bold">Cosine Annealing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-violet-500 rounded"></div>
                        <span className="text-violet-400 font-bold">Warmup + Cosine</span>
                    </div>
                </div>

                <svg width={width} height={height} className="max-w-full">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                        const y = padding + graphHeight * pct;
                        return (
                            <g key={pct}>
                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                                <text x={padding - 10} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" className="font-mono">
                                    {(0.15 * (1 - pct)).toFixed(2)}
                                </text>
                            </g>
                        );
                    })}
                    
                    {/* Axes */}
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#64748b" strokeWidth="2" />
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#64748b" strokeWidth="2" />
                    
                    {/* X-axis labels */}
                    {[0, 25, 50, 75, 100].map(epoch => (
                        <text key={epoch} x={getX(epoch)} y={height - padding + 20} fill="#64748b" fontSize="10" textAnchor="middle" className="font-mono">
                            Ep {epoch}
                        </text>
                    ))}

                    {/* Step Decay Line */}
                    <path d={createPath(stepData)} fill="none" stroke="#10b981" strokeWidth="3" className="transition-all duration-300" opacity={0.8} />
                    
                    {/* Cosine Line */}
                    <path d={createPath(cosineData)} fill="none" stroke="#06b6d4" strokeWidth="3" className="transition-all duration-300" opacity={0.8} />
                    
                    {/* Warmup Line */}
                    <path d={createPath(warmupData)} fill="none" stroke="#8b5cf6" strokeWidth="4" className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                </svg>
            </div>
        </div>
    );
}
