import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const DistributionExplorer: React.FC = () => {
    const [mu, setMu] = useState(0);
    const [sigma, setSigma] = useState(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Draw Axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height - 20);
        ctx.lineTo(width, height - 20); // X-axis
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height); // Y-axis
        ctx.stroke();

        // Draw Gaussian PDF
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const pdf = (x: number) => {
            const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
            const exp = Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
            return coeff * exp;
        };

        const xScale = 60; // pixels per unit
        const yScale = 300; // pixels per unit probability

        let first = true;
        for (let px = 0; px < width; px++) {
            const xVal = (px - width / 2) / xScale;
            const yVal = pdf(xVal);
            const py = height - 20 - (yVal * yScale);

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.stroke();

        // Draw Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText('μ', width / 2 + mu * xScale + 5, height - 40);

        // Draw Mean Line
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width / 2 + mu * xScale, 0);
        ctx.lineTo(width / 2 + mu * xScale, height - 20);
        ctx.stroke();
        ctx.setLineDash([]);

    }, [mu, sigma]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="w-full md:w-2/3 bg-slate-900 rounded-lg border border-slate-700"
            />
            <div className="w-full md:w-1/3 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Mean (μ): {mu.toFixed(1)}</label>
                    <input
                        type="range" min="-3" max="3" step="0.1"
                        value={mu} onChange={(e) => setMu(parseFloat(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Std Dev (σ): {sigma.toFixed(1)}</label>
                    <input
                        type="range" min="0.2" max="2" step="0.1"
                        value={sigma} onChange={(e) => setSigma(parseFloat(e.target.value))}
                        className="w-full accent-blue-500"
                    />
                </div>
                <div className="p-4 bg-slate-800 rounded-lg text-xs text-slate-400">
                    <p>The <strong>Gaussian Distribution</strong> is defined by these two parameters. μ determines the center, σ determines the spread.</p>
                </div>
            </div>
        </div>
    );
};
