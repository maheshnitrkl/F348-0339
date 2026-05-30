import React, { useState, useMemo } from 'react';
import { ActivitySquare } from 'lucide-react';

export function HyperparameterSandbox() {
    const [lr, setLr] = useState(5); // 1-10
    const [capacity, setCapacity] = useState(5); // 1-10
    const [reg, setReg] = useState(2); // 1-10

    const width = 700;
    const height = 300;
    const padding = 40;
    const epochs = 100;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const data = useMemo(() => {
        const trainLoss = [];
        const valLoss = [];
        
        let tLoss = 4.0;
        let vLoss = 4.0;

        for (let i = 0; i < epochs; i++) {
            // Very simplified simulation logic to visually demonstrate concepts
            
            // Learning Rate effect
            let step = (lr / 10) * 0.1;
            if (lr > 8) { // Learning rate too high -> divergence/bouncing
                step = -0.05 * (lr - 8); 
                tLoss += (Math.random() - 0.4) * 0.2;
            } else if (lr < 3) { // Learning rate too slow
                step = 0.01;
            }

            // Capacity effect
            const capacityFactor = capacity / 10;
            
            // Train loss naturally decreases
            tLoss = Math.max(0.1, tLoss - step * capacityFactor);
            
            // Validation loss follows train loss, but...
            vLoss = tLoss + 0.2;
            
            // Overfitting: High capacity, low regularization, high epochs
            if (capacity > 5 && reg < 4) {
                const overfitStart = 100 - (capacity * 5); // When it starts overfitting
                if (i > overfitStart) {
                    vLoss += (i - overfitStart) * 0.02 * ((capacity - reg)/5);
                }
            }

            // Underfitting: Low capacity
            if (capacity < 4) {
                tLoss = Math.max(1.5, tLoss);
                vLoss = Math.max(1.6, vLoss);
            }

            // Add slight noise
            tLoss += (Math.random() - 0.5) * 0.02;
            vLoss += (Math.random() - 0.5) * 0.03;

            trainLoss.push({ x: i, y: tLoss });
            valLoss.push({ x: i, y: vLoss });
        }

        return { trainLoss, valLoss };
    }, [lr, capacity, reg]);

    const getX = (val: number) => padding + (val / epochs) * graphWidth;
    const getY = (val: number) => padding + graphHeight - Math.min(1, (val / 5)) * graphHeight; // Max visual loss is 5

    const createPath = (dataset: {x: number, y: number}[]) => 
        dataset.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.x)} ${getY(pt.y)}`).join(' ');

    // Determine current state text
    let stateTitle = "Good Fit";
    let stateColor = "text-emerald-400";
    if (lr > 8) { stateTitle = "Diverging (LR too high)"; stateColor = "text-red-500"; }
    else if (capacity < 4) { stateTitle = "Underfitting (Capacity too low)"; stateColor = "text-yellow-500"; }
    else if (capacity > 5 && reg < 4) { stateTitle = "Overfitting (Memorizing noise)"; stateColor = "text-orange-500"; }
    else if (lr < 3) { stateTitle = "Slow Convergence (LR too low)"; stateColor = "text-cyan-500"; }

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mt-6">
            <div className="bg-slate-900/80 border-b border-slate-800 p-4 backdrop-blur">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <ActivitySquare className="text-emerald-400" size={20} />
                    Training Sandbox (Underfitting vs Overfitting)
                </h4>
            </div>

            <div className="p-6 flex flex-col lg:flex-row gap-6 items-center">
                
                {/* SVG Graph */}
                <div className="flex-1 w-full bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex flex-col gap-1 text-xs bg-slate-900/80 p-2 rounded backdrop-blur border border-slate-800">
                        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded"></div><span className="text-blue-400">Train Loss</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-orange-500 rounded"></div><span className="text-orange-400">Val Loss</span></div>
                    </div>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-bold text-sm bg-slate-900/90 px-3 py-1 rounded border border-slate-700 shadow-xl z-10">
                        Status: <span className={stateColor}>{stateTitle}</span>
                    </div>

                    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="max-w-full block">
                        <line x1={padding} y1={getY(0)} x2={width - padding} y2={getY(0)} stroke="#475569" strokeWidth="2" />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="2" />
                        
                        <text x={width/2} y={height - 5} fill="#64748b" fontSize="12" textAnchor="middle">Epochs</text>
                        <text x={12} y={height/2} fill="#64748b" fontSize="12" textAnchor="middle" transform={`rotate(-90 12 ${height/2})`}>Loss</text>

                        <path d={createPath(data.trainLoss)} fill="none" stroke="#3b82f6" strokeWidth="3" opacity={0.8} className="transition-all duration-300" />
                        <path d={createPath(data.valLoss)} fill="none" stroke="#f97316" strokeWidth="3" opacity={0.8} className="transition-all duration-300" />
                    </svg>
                </div>

                {/* Controls */}
                <div className="w-full lg:w-72 flex flex-col gap-5">
                    <div>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-slate-300">Model Capacity (Complexity)</span>
                        </div>
                        <input type="range" min="1" max="10" value={capacity} onChange={e => setCapacity(parseInt(e.target.value))} className="w-full accent-blue-500" />
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">High capacity easily memorizes training data (overfits) if unchecked.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-slate-300">Regularization (L1/L2/Dropout)</span>
                        </div>
                        <input type="range" min="1" max="10" value={reg} onChange={e => setReg(parseInt(e.target.value))} className="w-full accent-purple-500" />
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">Higher regularization limits model capacity to prevent overfitting.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                            <span className="text-slate-300">Learning Rate</span>
                        </div>
                        <input type="range" min="1" max="10" value={lr} onChange={e => setLr(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">Too low = slow training. Too high = divergence.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
