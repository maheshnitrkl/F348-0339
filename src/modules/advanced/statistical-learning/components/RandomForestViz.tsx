/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Network, Play } from 'lucide-react';

interface Point {
    x: number;
    y: number;
    label: 0 | 1;
}

export const RandomForestViz: React.FC = () => {
    const [numTrees, setNumTrees] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    // Generate static dataset: two moons / spirals-ish
    const [data] = useState<Point[]>(() => {
        const points: Point[] = [];
        for (let i = 0; i < 50; i++) {
            // Class 0: Center cluster
            points.push({
                x: 50 + (Math.random() - 0.5) * 30,
                y: 50 + (Math.random() - 0.5) * 30,
                label: 0
            });
            // Class 1: Ring
            const angle = Math.random() * Math.PI * 2;
            const r = 35 + (Math.random() - 0.5) * 10;
            points.push({
                x: 50 + Math.cos(angle) * r,
                y: 50 + Math.sin(angle) * r,
                label: 1
            });
        }
        return points;
    });

    // "Train" trees (fake simulation of decision boundaries)
    // We'll generate N decision boundaries.
    // Each tree creates a few random rectangular splits.
    const [trees, setTrees] = useState<{ id: number, rects: any[] }[]>([]);

    const trainForest = (n: number) => {
        const newTrees = [];
        for (let i = 0; i < n; i++) {
            // Each tree gets a random "view" of data (bootstrap)
            // and creates random orthogonal splits
            const rects = [];
            const numSplits = 5 + Math.floor(Math.random() * 5);
            for (let j = 0; j < numSplits; j++) {
                // Random box
                rects.push({
                    x: Math.random() * 80,
                    y: Math.random() * 80,
                    w: 10 + Math.random() * 40,
                    h: 10 + Math.random() * 40,
                    label: Math.random() > 0.5 ? 1 : 0
                });
            }
            newTrees.push({ id: i, rects });
        }
        setTrees(newTrees);
    };

    useEffect(() => {
        trainForest(numTrees);
    }, [numTrees]);

    const runDemo = () => {
        setIsAnimating(true);
        let count = 1;
        setNumTrees(1);
        const interval = setInterval(() => {
            count += Math.ceil(count * 0.2) + 1; // Exponential growth
            if (count > 100) {
                count = 100;
                clearInterval(interval);
                setIsAnimating(false);
            }
            setNumTrees(count);
        }, 100);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Network className="text-emerald-400" />
                        Random Forest Ensemble
                    </h3>
                    <p className="text-slate-400 text-sm">Aggregating {numTrees} weak learners to form a smooth boundary.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setNumTrees(1)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border ${numTrees === 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                        1 Tree
                    </button>
                    <button
                        onClick={() => setNumTrees(10)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border ${numTrees === 10 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                        10 Trees
                    </button>
                    <button
                        onClick={() => setNumTrees(100)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border ${numTrees === 100 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                        100 Trees
                    </button>
                    <button
                        onClick={runDemo}
                        disabled={isAnimating}
                        className="ml-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Play size={16} /> Run Growth Demo
                    </button>
                </div>
            </div>

            <div className="relative w-full aspect-[2/1] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 grid grid-cols-2">

                {/* Left: Individual Tree (Weak Learner) */}
                <div className="relative border-r border-slate-800 p-4">
                    <span className="absolute top-4 left-4 z-10 text-xs font-bold bg-black/50 text-slate-300 px-2 py-1 rounded">Single Tree View (High Variance)</span>
                    {/* Render one random tree from the forest */}
                    <div className="absolute inset-0 opacity-80">
                        {trees[0]?.rects.map((r, i) => (
                            <div key={i} className={`absolute border border-white/10 ${r.label === 0 ? 'bg-blue-500/20' : 'bg-rose-500/20'}`}
                                style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Ensemble (Average) */}
                <div className="relative p-4">
                    <span className="absolute top-4 left-4 z-10 text-xs font-bold bg-black/50 text-emerald-400 px-2 py-1 rounded">Forest Ensemble (Smoothed)</span>

                    {/* Render HEATMAP style accumulation of all trees */}
                    <div className="absolute inset-0 opacity-50 blur-xl scale-110">
                        {trees.slice(0, Math.min(trees.length, 20)).map((tree, ti) => (
                            tree.rects.map((r, i) => (
                                <div key={`${ti}-${i}`} className={`absolute mix-blend-screen ${r.label === 0 ? 'bg-blue-500/10' : 'bg-rose-500/10'}`}
                                    style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
                                />
                            ))
                        ))}
                    </div>

                    {/* Overlay data points - FIXED POSITIONS */}
                    {data.map((p, i) => (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 rounded-full shadow-sm z-20 ${p.label === 0 ? 'bg-blue-400' : 'bg-rose-400'}`}
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        />
                    ))}
                </div>

            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-slate-500 text-xs uppercase mb-1">Variance</div>
                    <div className={`text-lg font-bold ${numTrees > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {numTrees > 50 ? 'Low' : numTrees > 10 ? 'Medium' : 'High'}
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-slate-500 text-xs uppercase mb-1">Bias</div>
                    <div className="text-lg font-bold text-slate-300">
                        Stable
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-slate-500 text-xs uppercase mb-1">Trees</div>
                    <div className="text-lg font-bold text-white">{numTrees}</div>
                </div>
            </div>
        </div>
    );
};
