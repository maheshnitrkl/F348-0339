import React, { useState, useRef, useEffect } from 'react';

interface Point { x: number; y: number; label: number }
interface Split { axis: 'x' | 'y'; value: number; depth: number }

export const InteractiveTreeViz: React.FC = () => {
    const [splits, setSplits] = useState<Split[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Init random points
    useEffect(() => {
        const pts: Point[] = [];
        for (let i = 0; i < 30; i++) pts.push({ x: Math.random() * 300, y: Math.random() * 300, label: 0 }); // Class 0
        for (let i = 0; i < 30; i++) pts.push({ x: Math.random() * 300 + 100, y: Math.random() * 300 + 100, label: 1 }); // Class 1
        setPoints(pts);
    }, []);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Simple heuristic: alternate split axis based on depth
        // In reality, trees search for best split. Here we let user "draw" splits by clicking.
        const axis = splits.length % 2 === 0 ? 'x' : 'y';
        const value = axis === 'x' ? x : y;

        setSplits([...splits, { axis, value, depth: splits.length }]);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Draw Regions (Simplified visualization of recursive partition)
        // Correctly drawing regions for arbitrary user splits is complex (Kd-tree)
        // Visual hack: just draw the split lines

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        splits.forEach(split => {
            ctx.beginPath();
            if (split.axis === 'x') {
                ctx.moveTo(split.value, 0); ctx.lineTo(split.value, h);
            } else {
                ctx.moveTo(0, split.value); ctx.lineTo(w, split.value);
            }
            ctx.stroke();
        });

        // Draw Points
        points.forEach(p => {
            ctx.fillStyle = p.label === 0 ? '#3b82f6' : '#f59e0b';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

    }, [splits, points]);

    return (
        <div className="flex gap-4">
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                onClick={handleCanvasClick}
                className="bg-slate-900 rounded-lg border border-slate-700 cursor-crosshair"
            />
            <div className="flex-1 text-sm text-slate-400">
                <p className="mb-4">Click on the canvas to add a split decision.</p>
                <ul className="list-disc pl-4 space-y-2">
                    <li>Current Depth: {splits.length}</li>
                    <li>
                        A real Decision Tree algorithm (CART) automatically finds the split that maximizes "Information Gain" (reduces Entropy).
                    </li>
                </ul>
                <button
                    onClick={() => setSplits([])}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded"
                >
                    Reset Tree
                </button>
            </div>
        </div>
    );
};
