import React, { useState, useMemo } from 'react';
import { Target, Maximize, ActivitySquare } from 'lucide-react';

type VizMode = 'regression' | 'classification' | 'segmentation';

// --- Regression View ---
function RegressionView() {
    const [delta, setDelta] = useState(1.0);
    const width = 800, height = 300, padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const data = useMemo(() => {
        const mse = [], mae = [], huber = [];
        for (let x = -5; x <= 5; x += 0.1) {
            mse.push({ x, y: x * x });
            mae.push({ x, y: Math.abs(x) });
            huber.push({
                x, 
                y: Math.abs(x) <= delta 
                    ? 0.5 * x * x 
                    : delta * (Math.abs(x) - 0.5 * delta)
            });
        }
        return { mse, mae, huber };
    }, [delta]);

    const getX = (val: number) => padding + ((val + 5) / 10) * graphWidth;
    const getY = (val: number) => padding + graphHeight - (val / 25) * graphHeight; // Max MSE is 25

    const createPath = (dataset: {x: number, y: number}[]) => 
        dataset.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.x)} ${getY(pt.y)}`).join(' ');

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="w-1/2">
                    <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Huber Delta (<span className="text-cyan-400 font-mono">δ</span>)</span>
                        <span className="text-white font-mono">{delta.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0.1" max="5.0" step="0.1" value={delta} onChange={e => setDelta(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
                </div>
                <div className="text-xs text-slate-400 max-w-[200px] text-right">
                    Notice how Huber (Cyan) acts like MSE for small errors and MAE for large ones.
                </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center relative">
                <div className="absolute top-6 right-8 flex flex-col gap-2 text-xs bg-slate-900/80 p-3 rounded backdrop-blur">
                    <div className="flex items-center gap-2"><div className="w-4 h-1 bg-red-500 rounded"></div><span className="text-red-400 font-bold">MSE (x²)</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-1 bg-emerald-500 rounded"></div><span className="text-emerald-400 font-bold">MAE (|x|)</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-1 bg-cyan-500 rounded"></div><span className="text-cyan-400 font-bold">Huber</span></div>
                </div>

                <svg width={width} height={height} className="max-w-full">
                    {/* Grid */}
                    <line x1={padding} y1={getY(0)} x2={width - padding} y2={getY(0)} stroke="#475569" strokeWidth="2" />
                    <line x1={getX(0)} y1={padding} x2={getX(0)} y2={height - padding} stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
                    
                    {/* Labels */}
                    <text x={width/2} y={height - 10} fill="#64748b" fontSize="12" textAnchor="middle">Error (y_pred - y_true)</text>
                    <text x={10} y={height/2} fill="#64748b" fontSize="12" textAnchor="middle" transform={`rotate(-90 15 ${height/2})`}>Loss Penalty</text>

                    {/* Paths */}
                    <path d={createPath(data.mse)} fill="none" stroke="#ef4444" strokeWidth="3" opacity={0.5} />
                    <path d={createPath(data.mae)} fill="none" stroke="#10b981" strokeWidth="3" opacity={0.5} />
                    <path d={createPath(data.huber)} fill="none" stroke="#06b6d4" strokeWidth="4" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-100" />
                </svg>
            </div>
        </div>
    );
}

// --- Classification View ---
function ClassificationView() {
    const [gamma, setGamma] = useState(2.0);
    const width = 800, height = 300, padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const data = useMemo(() => {
        const ce = [], focal = [];
        for (let p = 0.01; p <= 0.99; p += 0.01) {
            const ceLoss = -Math.log(p);
            ce.push({ x: p, y: ceLoss });
            focal.push({ x: p, y: Math.pow(1 - p, gamma) * ceLoss });
        }
        return { ce, focal };
    }, [gamma]);

    const getX = (val: number) => padding + val * graphWidth;
    const getY = (val: number) => padding + graphHeight - (val / 5) * graphHeight; // Max visual loss ~5

    const createPath = (dataset: {x: number, y: number}[]) => 
        dataset.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.x)} ${getY(pt.y)}`).join(' ');

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="w-1/2">
                    <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Focal Gamma (<span className="text-purple-400 font-mono">γ</span>)</span>
                        <span className="text-white font-mono">{gamma.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="5.0" step="0.5" value={gamma} onChange={e => setGamma(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                </div>
                <div className="text-xs text-slate-400 max-w-[250px] text-right">
                    Increasing Gamma squashes the loss for easy examples (Prob &gt; 0.5), forcing the model to focus on hard mistakes.
                </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center relative">
                <div className="absolute top-6 right-8 flex flex-col gap-2 text-xs bg-slate-900/80 p-3 rounded backdrop-blur">
                    <div className="flex items-center gap-2"><div className="w-4 h-1 bg-slate-400 rounded"></div><span className="text-slate-300 font-bold">Cross Entropy (CE)</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-1 bg-purple-500 rounded"></div><span className="text-purple-400 font-bold">Focal Loss</span></div>
                </div>

                <svg width={width} height={height} className="max-w-full">
                    <line x1={padding} y1={getY(0)} x2={width - padding} y2={getY(0)} stroke="#475569" strokeWidth="2" />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="2" />
                    
                    <text x={width/2} y={height - 10} fill="#64748b" fontSize="12" textAnchor="middle">Predicted Probability of True Class P(y=1)</text>
                    <text x={10} y={height/2} fill="#64748b" fontSize="12" textAnchor="middle" transform={`rotate(-90 15 ${height/2})`}>Loss Penalty</text>

                    {[0.2, 0.4, 0.6, 0.8, 1.0].map(p => (
                        <text key={p} x={getX(p)} y={getY(0) + 15} fill="#475569" fontSize="10" textAnchor="middle">{p}</text>
                    ))}

                    <path d={createPath(data.ce)} fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6 4" opacity={0.6} />
                    <path d={createPath(data.focal)} fill="none" stroke="#a855f7" strokeWidth="4" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-100" />
                </svg>
            </div>
        </div>
    );
}

// --- Segmentation View ---
function SegmentationView() {
    const [distance, setDistance] = useState(40); // 0 to 100
    
    // SVG Dimensions
    const size = 300;
    const center = size / 2;
    const r = 60; // radius of masks
    
    // Calculate overlapping area of two identical circles
    // distance d is distance between centers
    const d = (distance / 100) * (r * 2.5); 
    
    let intersectionArea = 0;
    if (d >= r * 2) {
        intersectionArea = 0;
    } else if (d === 0) {
        intersectionArea = Math.PI * r * r;
    } else {
        const d2 = d * d;
        const r2 = r * r;
        const alpha = 2 * Math.acos(d / (2 * r));
        intersectionArea = r2 * (alpha - Math.sin(alpha));
    }

    const areaA = Math.PI * r * r; // True Area
    const areaB = Math.PI * r * r; // Pred Area
    const unionArea = areaA + areaB - intersectionArea;
    
    const iou = intersectionArea / unionArea;
    const dice = (2 * intersectionArea) / (areaA + areaB);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                
                {/* SVG Visualizer */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-shrink-0 relative">
                    <svg width={size} height={size} className="bg-slate-900 rounded-lg">
                        {/* Define masks for intersection highlight */}
                        <defs>
                            <clipPath id="trueMask">
                                <circle cx={center - d/2} cy={center} r={r} />
                            </clipPath>
                        </defs>
                        
                        {/* True Mask (Ground Truth) */}
                        <circle cx={center - d/2} cy={center} r={r} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx={center - d/2} cy={center} r={r} fill="#3b82f6" opacity={0.2} />
                        
                        {/* Pred Mask */}
                        <circle cx={center + d/2} cy={center} r={r} fill="none" stroke="#ef4444" strokeWidth="2" />
                        <circle cx={center + d/2} cy={center} r={r} fill="#ef4444" opacity={0.2} />

                        {/* Intersection (True Positive) */}
                        <circle cx={center + d/2} cy={center} r={r} fill="#22c55e" opacity={0.6} clipPath="url(#trueMask)" />
                    </svg>

                    {/* Legend overlays */}
                    <div className="absolute top-8 left-8 text-[10px] font-bold text-blue-400">Ground Truth</div>
                    <div className="absolute bottom-8 right-8 text-[10px] font-bold text-red-400">Prediction</div>
                </div>

                {/* Controls and Metrics */}
                <div className="flex-1 w-full bg-slate-900/60 p-6 rounded-xl border border-slate-800 flex flex-col gap-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300 font-bold">Prediction Shift (Error)</span>
                        </div>
                        <input type="range" min="0" max="100" value={distance} onChange={e => setDistance(parseFloat(e.target.value))} className="w-full accent-yellow-500" />
                        <p className="text-xs text-slate-500 mt-2">Drag to move the prediction mask away from the ground truth. Observe how the IoU and Dice scores drop exponentially as the overlap decreases.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-4 rounded-lg border border-slate-700/50 text-center">
                            <h5 className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">IoU (Jaccard)</h5>
                            <div className="text-2xl font-mono text-cyan-400">{(iou * 100).toFixed(1)}%</div>
                            <div className="text-[10px] text-slate-500 mt-1">Intersection / Union</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg border border-slate-700/50 text-center">
                            <h5 className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Dice Coefficient</h5>
                            <div className="text-2xl font-mono text-emerald-400">{(dice * 100).toFixed(1)}%</div>
                            <div className="text-[10px] text-slate-500 mt-1">2×Intersect / (A + B)</div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded text-xs space-y-2 text-slate-300">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500/60 rounded"></div> <strong>True Positives (TP)</strong>: The overlapping area.</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/20 rounded"></div> <strong>False Positives (FP)</strong>: Red area outside intersection.</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500/20 rounded"></div> <strong>False Negatives (FN)</strong>: Blue area outside intersection.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LossVisualizer() {
    const [mode, setMode] = useState<VizMode>('regression');

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mt-6">
            {/* Header / Tabs */}
            <div className="bg-slate-900/80 border-b border-slate-800 p-4 backdrop-blur">
                <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    Interactive Loss Visualizer
                </h4>
                <div className="flex gap-2 bg-slate-950 p-1 rounded-lg w-fit">
                    <button 
                        onClick={() => setMode('regression')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${mode === 'regression' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <ActivitySquare size={16} /> Regression
                    </button>
                    <button 
                        onClick={() => setMode('classification')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${mode === 'classification' ? 'bg-slate-800 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Target size={16} /> Classification
                    </button>
                    <button 
                        onClick={() => setMode('segmentation')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${mode === 'segmentation' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Maximize size={16} /> Segmentation
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5">
                {mode === 'regression' && <RegressionView />}
                {mode === 'classification' && <ClassificationView />}
                {mode === 'segmentation' && <SegmentationView />}
            </div>
        </div>
    );
}
