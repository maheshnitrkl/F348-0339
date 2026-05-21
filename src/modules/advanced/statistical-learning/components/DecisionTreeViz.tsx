import React, { useState, useRef } from 'react';
import { RefreshCw, Layers } from 'lucide-react';
import { MathEquation } from './MathEquation';

interface Point {
    x: number;
    y: number;
    label: 0 | 1;
}

interface TreeNode {
    depth: number;
    isLeaf: boolean;
    splitFeature?: 'x' | 'y';
    splitValue?: number;
    label?: 0 | 1; // Majority class for leaf
    left?: TreeNode;
    right?: TreeNode;
    region: { xMin: number, xMax: number, yMin: number, yMax: number };
}

export const DecisionTreeViz: React.FC = () => {
    const [points, setPoints] = useState<Point[]>([
        { x: 20, y: 20, label: 0 }, { x: 30, y: 80, label: 0 },
        { x: 80, y: 20, label: 1 }, { x: 70, y: 70, label: 1 },
        { x: 50, y: 50, label: 0 }, { x: 10, y: 90, label: 1 } // Initial noise
    ]);
    const [maxDepth, setMaxDepth] = useState(3);
    const [activeClass, setActiveClass] = useState<0 | 1>(0);
    const canvasRef = useRef<HTMLDivElement>(null);

    // --- Helper: Build Tree ---
    // Simple recursive splitting to minimize weighted impurity (Gini approx)
    const buildTree = (
        data: Point[],
        depth: number,
        region: { xMin: number, xMax: number, yMin: number, yMax: number }
    ): TreeNode => {
        // Stop conditions
        if (depth >= maxDepth || data.length <= 1 || new Set(data.map(p => p.label)).size === 1) {
            const count0 = data.filter(p => p.label === 0).length;
            const count1 = data.filter(p => p.label === 1).length;
            return { depth, isLeaf: true, label: count1 > count0 ? 1 : 0, region };
        }

        // Find best split
        let bestSplit = { feature: 'x' as 'x' | 'y', value: 0, score: Infinity };
        let splitFound = false;

        const trySplit = (feature: 'x' | 'y') => {
            // Sort unique values to try splits strictly between points
            const coords = Array.from(new Set(data.map(p => p[feature]))).sort((a, b) => a - b);

            for (let i = 0; i < coords.length - 1; i++) {
                const splitVal = (coords[i] + coords[i + 1]) / 2;

                const left = data.filter(p => p[feature] <= splitVal);
                const right = data.filter(p => p[feature] > splitVal);

                // Gini Impurity calculation
                const getGini = (subset: Point[]) => {
                    if (subset.length === 0) return 0;
                    const p1 = subset.filter(p => p.label === 1).length / subset.length;
                    return 1 - (p1 * p1 + (1 - p1) * (1 - p1));
                };

                const score = (left.length * getGini(left) + right.length * getGini(right)) / data.length;

                if (score < bestSplit.score) {
                    bestSplit = { feature, value: splitVal, score };
                    splitFound = true;
                }
            }
        };

        trySplit('x');
        trySplit('y');

        if (!splitFound) {
            const count0 = data.filter(p => p.label === 0).length;
            return { depth, isLeaf: true, label: data.length > count0 * 2 ? 1 : 0, region };
        }

        // Recursively build children
        const leftData = data.filter(p => p[bestSplit.feature] <= bestSplit.value);
        const rightData = data.filter(p => p[bestSplit.feature] > bestSplit.value);

        const leftRegion = { ...region };
        const rightRegion = { ...region };

        if (bestSplit.feature === 'x') {
            leftRegion.xMax = bestSplit.value;
            rightRegion.xMin = bestSplit.value;
        } else {
            leftRegion.yMax = bestSplit.value;
            rightRegion.yMin = bestSplit.value;
        }

        return {
            depth,
            isLeaf: false,
            splitFeature: bestSplit.feature,
            splitValue: bestSplit.value,
            region,
            left: buildTree(leftData, depth + 1, leftRegion),
            right: buildTree(rightData, depth + 1, rightRegion)
        };
    };

    const root = buildTree(points, 0, { xMin: 0, xMax: 100, yMin: 0, yMax: 100 });

    // --- Helper: Traverse and collect leaf regions for rendering ---
    const getLeafRegions = (node: TreeNode, regions: TreeNode[] = []) => {
        if (node.isLeaf) {
            regions.push(node);
        } else {
            if (node.left) getLeafRegions(node.left, regions);
            if (node.right) getLeafRegions(node.right, regions);
        }
        return regions;
    };

    const leafRegions = getLeafRegions(root);

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = 100 - ((e.clientY - rect.top) / rect.height) * 100; // Flip Y for cartesian-like feel
        setPoints([...points, { x, y, label: activeClass }]);
    };

    const clearPoints = () => setPoints([]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <span className="text-sm text-slate-400 font-mono uppercase">Add Data:</span>
                    <button
                        onClick={() => setActiveClass(0)}
                        className={`px-3 py-1 rounded flex items-center gap-2 text-sm transition-colors ${activeClass === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className="w-3 h-3 rounded-full bg-blue-500" /> Class 0
                    </button>
                    <button
                        onClick={() => setActiveClass(1)}
                        className={`px-3 py-1 rounded flex items-center gap-2 text-sm transition-colors ${activeClass === 1 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <div className="w-3 h-3 rounded-full bg-rose-500" /> Class 1
                    </button>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <Layers size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-400">Max Depth: {maxDepth}</span>
                    <input
                        type="range" min="1" max="10" value={maxDepth}
                        onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                        className="w-24 accent-violet-500"
                    />
                </div>

                <button onClick={clearPoints} className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                    <RefreshCw size={14} /> Reset
                </button>
            </div>

            <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner cursor-crosshair group"
                ref={canvasRef}
                onClick={handleCanvasClick}
            >
                {/* 1. Render Decision Regions */}
                {leafRegions.map((leaf, idx) => (
                    <div
                        key={idx}
                        className={`absolute border border-white/5 transition-all duration-300 ${leaf.label === 0 ? 'bg-blue-500/10' : 'bg-rose-500/10'}`}
                        style={{
                            left: `${leaf.region.xMin}%`,
                            bottom: `${leaf.region.yMin}%`, // using bottom for cartesian Y
                            width: `${leaf.region.xMax - leaf.region.xMin}%`,
                            height: `${leaf.region.yMax - leaf.region.yMin}%`,
                        }}
                    >
                        {/* Optional Region Label (Gini/Prob?) */}
                    </div>
                ))}

                {/* 2. Render Data Points */}
                {points.map((p, i) => (
                    <div
                        key={i}
                        className={`absolute w-3 h-3 -ml-1.5 -mb-1.5 rounded-full border-2 shadow-sm transition-transform hover:scale-150 ${p.label === 0 ? 'bg-blue-500 border-blue-900' : 'bg-rose-500 border-rose-900'
                            }`}
                        style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
                    />
                ))}

                <div className="absolute top-2 left-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-slate-500 bg-black/50 px-2 py-1 rounded">Click to add points</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Model Complexity</h4>
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-slate-300">Tree Nodes</span>
                        <span className="text-xl font-mono text-violet-400">
                            {/* Count nodes roughly */}
                            {Math.pow(2, maxDepth) - 1} (Max)
                        </span>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Sample Gini Index</h4>
                    <MathEquation formula="G = \sum p_k (1 - p_k)" />
                </div>
            </div>
        </div>
    );
};
