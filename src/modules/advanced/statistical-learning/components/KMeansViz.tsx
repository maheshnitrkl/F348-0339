/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

interface Point { x: number; y: number; cluster: number }
interface Centroid { x: number; y: number; color: string }

export const KMeansViz: React.FC = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const [centroids, setCentroids] = useState<Centroid[]>([]);
    const [iteration, setIteration] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Init data
    useEffect(() => {
        const pts: Point[] = [];
        // Cluster 1
        for (let i = 0; i < 50; i++) pts.push({ x: 100 + Math.random() * 100, y: 100 + Math.random() * 100, cluster: -1 });
        // Cluster 2
        for (let i = 0; i < 50; i++) pts.push({ x: 300 + Math.random() * 100, y: 300 + Math.random() * 100, cluster: -1 });
        // Cluster 3
        for (let i = 0; i < 50; i++) pts.push({ x: 100 + Math.random() * 100, y: 300 + Math.random() * 100, cluster: -1 });

        setPoints(pts);

        // Random centroids
        setCentroids([
            { x: Math.random() * 500, y: Math.random() * 400, color: '#ef4444' },
            { x: Math.random() * 500, y: Math.random() * 400, color: '#3b82f6' },
            { x: Math.random() * 500, y: Math.random() * 400, color: '#10b981' },
        ]);
    }, []);

    const step = () => {
        // 1. Assign
        const newPoints = points.map(p => {
            let minDist = Infinity;
            let cluster = -1;
            centroids.forEach((c, idx) => {
                const d = Math.sqrt(Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2));
                if (d < minDist) { minDist = d; cluster = idx; }
            });
            return { ...p, cluster };
        });
        setPoints(newPoints);

        // 2. Update
        const newCentroids = centroids.map((c, idx) => {
            const clusterPoints = newPoints.filter(p => p.cluster === idx);
            if (clusterPoints.length === 0) return c;
            const avgX = clusterPoints.reduce((s, p) => s + p.x, 0) / clusterPoints.length;
            const avgY = clusterPoints.reduce((s, p) => s + p.y, 0) / clusterPoints.length;
            return { ...c, x: avgX, y: avgY };
        });
        setCentroids(newCentroids);
        setIteration(i => i + 1);
    };

    const reset = () => {
        // Re-randomize centroids
        setCentroids([
            { x: Math.random() * 500, y: Math.random() * 400, color: '#ef4444' },
            { x: Math.random() * 500, y: Math.random() * 400, color: '#3b82f6' },
            { x: Math.random() * 500, y: Math.random() * 400, color: '#10b981' },
        ]);
        setIteration(0);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Draw points
        points.forEach(p => {
            ctx.fillStyle = p.cluster === -1 ? '#475569' : centroids[p.cluster].color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw centroids
        centroids.forEach(c => {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.fillStyle = c.color;
            ctx.beginPath();
            ctx.moveTo(c.x - 8, c.y - 8); ctx.lineTo(c.x + 8, c.y + 8);
            ctx.moveTo(c.x + 8, c.y - 8); ctx.lineTo(c.x - 8, c.y + 8);
            ctx.stroke();
            // Circle around centroid
            ctx.beginPath();
            ctx.arc(c.x, c.y, 10, 0, 2 * Math.PI);
            ctx.stroke();
        });

    }, [points, centroids]);

    return (
        <div className="flex gap-4 items-center">
            <canvas ref={canvasRef} width={500} height={400} className="bg-slate-900 rounded-lg border border-slate-700" />
            <div className="flex flex-col gap-4">
                <div className="text-xl font-bold text-white">Iteration: {iteration}</div>
                <button onClick={step} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white">
                    Step Algorithm
                </button>
                <button onClick={reset} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded font-bold text-white">
                    Reset Centroids
                </button>
            </div>
        </div>
    );
};
