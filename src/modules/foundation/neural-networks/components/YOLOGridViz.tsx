import React, { useState } from 'react';
import { Target, Eye, BoxSelect } from 'lucide-react';

type ObjectDef = {
    id: number;
    name: string;
    x: number; // grid cell x (0-6)
    y: number; // grid cell y (0-6)
    w: number; // width in grid cells
    h: number; // height in grid cells
    color: string;
};

const objects: ObjectDef[] = [
    { id: 1, name: 'Car', x: 2, y: 4, w: 3, h: 2, color: 'rgb(59, 130, 246)' }, // Blue
    { id: 2, name: 'Dog', x: 5, y: 5, w: 1.5, h: 1.5, color: 'rgb(249, 115, 22)' }, // Orange
    { id: 3, name: 'Person', x: 1, y: 2, w: 1, h: 3, color: 'rgb(16, 185, 129)' }, // Emerald
];

export function YOLOGridViz() {
    const [hoverCell, setHoverCell] = useState<{ x: number, y: number } | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'predictions'>('grid');
    const gridSize = 7;

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mt-6">
            <div className="bg-slate-900/80 border-b border-slate-800 p-4 backdrop-blur flex flex-col sm:flex-row justify-between items-center gap-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Target className="text-rose-400" size={20} />
                    YOLO Grid Prediction Mechanics
                </h4>
                <div className="flex gap-2 bg-slate-950 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${viewMode === 'grid' ? 'bg-slate-800 text-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <BoxSelect size={16} /> Grid View
                    </button>
                    <button 
                        onClick={() => setViewMode('predictions')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${viewMode === 'predictions' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Eye size={16} /> All Predictions
                    </button>
                </div>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-8 items-start">
                
                {/* Visualizer */}
                <div className="w-full max-w-[400px] aspect-square bg-slate-950 border-2 border-slate-800 rounded-lg relative overflow-hidden flex-shrink-0 mx-auto">
                    
                    {/* Simulated Background Scene */}
                    <div className="absolute inset-0 opacity-20">
                        {/* Street */}
                        <div className="absolute bottom-0 w-full h-1/3 bg-slate-500"></div>
                        {/* Sun */}
                        <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-500 rounded-full"></div>
                        {/* Building */}
                        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/2 bg-slate-700"></div>
                    </div>

                    {/* Ground Truth Objects (visualized implicitly) */}
                    {objects.map(obj => (
                        <div key={`gt-${obj.id}`} className="absolute border border-dashed rounded-sm flex items-center justify-center opacity-40 pointer-events-none"
                            style={{
                                left: `${((obj.x - obj.w/2 + 0.5) / gridSize) * 100}%`,
                                top: `${((obj.y - obj.h/2 + 0.5) / gridSize) * 100}%`,
                                width: `${(obj.w / gridSize) * 100}%`,
                                height: `${(obj.h / gridSize) * 100}%`,
                                borderColor: obj.color,
                                backgroundColor: obj.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
                            }}
                        >
                            <span className="text-[10px] font-bold opacity-70" style={{ color: obj.color }}>{obj.name}</span>
                        </div>
                    ))}

                    {/* S x S Grid */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
                        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                            const x = i % gridSize;
                            const y = Math.floor(i / gridSize);
                            const isHovered = hoverCell?.x === x && hoverCell?.y === y;
                            
                            // Check if this cell is responsible for an object (center falls in it)
                            const respObj = objects.find(o => Math.floor(o.x) === x && Math.floor(o.y) === y);

                            return (
                                <div 
                                    key={i} 
                                    className={`border transition-all duration-150 cursor-crosshair
                                        ${viewMode === 'grid' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-transparent'}
                                        ${isHovered && viewMode === 'grid' ? 'bg-slate-700/50 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] z-10' : ''}
                                    `}
                                    onMouseEnter={() => setHoverCell({ x, y })}
                                    onMouseLeave={() => setHoverCell(null)}
                                >
                                    {/* Show specific prediction on hover in grid mode, or all predictions in pred mode */}
                                    {respObj && (viewMode === 'predictions' || (isHovered && viewMode === 'grid')) && (
                                        <div className="absolute w-full h-full pointer-events-none z-20 flex items-center justify-center">
                                            {/* Bounding Box Prediction */}
                                            <div className="absolute border-2 border-solid rounded animate-pulse"
                                                style={{
                                                    width: `${(respObj.w / gridSize) * 400}px`,
                                                    height: `${(respObj.h / gridSize) * 400}px`,
                                                    borderColor: respObj.color,
                                                    boxShadow: `0 0 15px ${respObj.color.replace('rgb', 'rgba').replace(')', ', 0.4)')}`
                                                }}
                                            >
                                                <div className="absolute -top-5 left-[-2px] px-1 text-[10px] font-bold text-white rounded-t" style={{ backgroundColor: respObj.color }}>
                                                    {respObj.name} 0.98
                                                </div>
                                                {/* Center Dot */}
                                                <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white shadow-lg" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="flex-1 space-y-4">
                    <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                        <h5 className="text-white font-bold mb-2">How YOLO Works</h5>
                        <p className="text-sm text-slate-400 mb-4">
                            Instead of running a classifier thousands of times across an image, YOLO divides the image into an <strong className="text-rose-400">S × S grid</strong>. 
                        </p>
                        <p className="text-sm text-slate-400">
                            If the center of an object falls into a grid cell, <strong className="text-cyan-400">that specific cell</strong> is strictly responsible for detecting that object. Hover over the grid to see which cells are active!
                        </p>
                    </div>

                    {hoverCell && viewMode === 'grid' && (
                        <div className="bg-black/40 p-5 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                            <h5 className="text-white font-bold mb-3 flex items-center justify-between">
                                Cell ({hoverCell.x}, {hoverCell.y}) Output Vector
                                {objects.find(o => Math.floor(o.x) === hoverCell.x && Math.floor(o.y) === hoverCell.y) && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Responsible</span>
                                )}
                            </h5>
                            
                            {/* Simulated Tensor Output */}
                            <div className="space-y-3 font-mono text-xs">
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-slate-500">Confidence (<span className="italic">Is there an object?</span>)</span>
                                    <span className={objects.find(o => Math.floor(o.x) === hoverCell.x && Math.floor(o.y) === hoverCell.y) ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                                        {objects.find(o => Math.floor(o.x) === hoverCell.x && Math.floor(o.y) === hoverCell.y) ? '0.99' : '0.01'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-slate-500">Bounding Box <span className="text-blue-400">(x, y, w, h)</span></span>
                                    <span className="text-slate-300">
                                        {(() => {
                                            const obj = objects.find(o => Math.floor(o.x) === hoverCell.x && Math.floor(o.y) === hoverCell.y);
                                            if (obj) return `[${(obj.x % 1).toFixed(2)}, ${(obj.y % 1).toFixed(2)}, ${obj.w.toFixed(1)}, ${obj.h.toFixed(1)}]`;
                                            return `[0.00, 0.00, 0.0, 0.0]`;
                                        })()}
                                    </span>
                                </div>
                                <div className="pt-1">
                                    <span className="text-slate-500 block mb-2">Class Probabilities:</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Car', 'Dog', 'Person'].map(cls => {
                                            const obj = objects.find(o => Math.floor(o.x) === hoverCell.x && Math.floor(o.y) === hoverCell.y);
                                            const isMatch = obj?.name === cls;
                                            return (
                                                <div key={cls} className={`text-center p-1 rounded ${isMatch ? 'bg-slate-800 text-white font-bold' : 'bg-slate-900 text-slate-500'}`}>
                                                    {cls}<br/>{isMatch ? '0.98' : '0.01'}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
