import React, { useState, useMemo } from 'react';
import { ShieldAlert, BarChart3 } from 'lucide-react';

// Random but fixed initial weights for visualization consistency
const INITIAL_WEIGHTS = [ 4.2, -3.8, 1.2, -0.9, 2.5, -2.1, 0.4, -0.3, 3.1, -4.5 ];

export function RegularizationViz() {
    const [lambda, setLambda] = useState(0);
    const [type, setType] = useState<'l1' | 'l2'>('l1');

    const weights = useMemo(() => {
        return INITIAL_WEIGHTS.map(w => {
            if (type === 'l2') {
                // L2 smoothly shrinks weights (Weight Decay)
                // Using an exponential decay for visual smoothness
                return w * Math.exp(-lambda / 50); 
            } else {
                // L1 penalizes magnitude directly, pushing strictly to 0
                const penalty = lambda / 20;
                if (w > 0) return Math.max(0, w - penalty);
                return Math.min(0, w + penalty);
            }
        });
    }, [lambda, type]);

    const numZero = weights.filter(w => Math.abs(w) < 0.01).length;

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mt-6">
            <div className="bg-slate-900/80 border-b border-slate-800 p-4 backdrop-blur flex justify-between items-center">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <ShieldAlert className="text-purple-400" size={20} />
                    L1 vs L2 Regularization
                </h4>
                <div className="flex gap-2 bg-slate-950 p-1 rounded-lg">
                    <button 
                        onClick={() => setType('l1')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${type === 'l1' ? 'bg-slate-800 text-pink-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        L1 (Lasso)
                    </button>
                    <button 
                        onClick={() => setType('l2')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${type === 'l2' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        L2 (Ridge)
                    </button>
                </div>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
                
                {/* Bar Chart Visualizer */}
                <div className="flex-1 w-full bg-slate-950 p-6 rounded-xl border border-slate-800 h-[300px] flex items-end justify-between relative">
                    <div className="absolute top-4 left-4 text-xs font-bold text-slate-500">Network Weights</div>
                    <div className="absolute top-4 right-4 text-xs font-bold bg-slate-800/80 px-2 py-1 rounded">
                        Sparsity: <span className={numZero > 0 ? 'text-emerald-400' : 'text-slate-400'}>{numZero} / {weights.length} zeros</span>
                    </div>

                    {/* Zero Line */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-700/50"></div>

                    {weights.map((w, i) => {
                        // Max weight is 5, container is 300px, center is 150px
                        // A weight of 5 = 100px height
                        const h = Math.abs(w) * 25; 
                        const isPositive = w >= 0;
                        const isZero = Math.abs(w) < 0.01;

                        return (
                            <div key={i} className="relative w-8 flex flex-col items-center" style={{ height: '100%', justifyContent: 'center' }}>
                                {/* Positive bar (top half) */}
                                <div className="flex-1 flex items-end w-full pb-[1px]">
                                    {isPositive && !isZero && (
                                        <div 
                                            className={`w-full rounded-t-sm transition-all duration-100 ${type === 'l1' ? 'bg-pink-500' : 'bg-cyan-500'}`} 
                                            style={{ height: `${h}px` }}
                                        ></div>
                                    )}
                                </div>
                                
                                {/* Negative bar (bottom half) */}
                                <div className="flex-1 flex items-start w-full pt-[1px]">
                                    {!isPositive && !isZero && (
                                        <div 
                                            className={`w-full rounded-b-sm transition-all duration-100 ${type === 'l1' ? 'bg-pink-500' : 'bg-cyan-500'}`} 
                                            style={{ height: `${h}px` }}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="w-full md:w-80 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300 font-bold">Penalty Strength (λ)</span>
                            <span className="text-white font-mono">{lambda}</span>
                        </div>
                        <input type="range" min="0" max="100" value={lambda} onChange={e => setLambda(parseInt(e.target.value))} className={`w-full ${type === 'l1' ? 'accent-pink-500' : 'accent-cyan-500'}`} />
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-slate-700 text-sm text-slate-300 space-y-3">
                        <p>
                            <strong className={type === 'l1' ? 'text-pink-400' : 'text-cyan-400'}>
                                {type === 'l1' ? 'L1 Regularization:' : 'L2 Regularization:'}
                            </strong>
                        </p>
                        <p className="text-xs text-slate-400">
                            {type === 'l1' 
                                ? 'Notice how L1 directly subtracts the penalty from the weights. Once a weight hits zero, it stays there. This forces the network to completely ignore less important features, yielding a "sparse" model.' 
                                : 'Notice how L2 multiplicatively shrinks the weights. The penalty gets weaker as the weight gets smaller, meaning it almost never pushes a weight exactly to zero. It just keeps them reasonably small.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
