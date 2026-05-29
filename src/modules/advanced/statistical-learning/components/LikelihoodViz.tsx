/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

export const LikelihoodViz: React.FC = () => {
    // Fixed dataset
    const points = [-1.5, -0.5, 0.2, 0.8, 1.2];
    const [muEst, setMuEst] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sigma = 1; // Fixed sigma for simplicity

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const xScale = 50;
        const yScale = 200;
        const xOffset = width / 2;
        const yBase = height - 50;

        // Draw Data Points
        points.forEach(x => {
            const px = xOffset + x * xScale;
            ctx.beginPath();
            ctx.arc(px, yBase, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444'; // Red points
            ctx.fill();
        });

        // Draw Candidate Distribution
        ctx.beginPath();
        ctx.strokeStyle = '#10b981'; // Emerald
        ctx.lineWidth = 2;

        for (let px = 0; px < width; px++) {
            const xVal = (px - xOffset) / xScale;
            const pdf = Math.exp(-0.5 * Math.pow((xVal - muEst) / sigma, 2)); // Unnormalized height for visual
            const py = yBase - (pdf * 150);
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw Likelihood Lines (Heights)
        let totalLogLike = 0;
        points.forEach(x => {
            const px = xOffset + x * xScale;
            const pdfVal = Math.exp(-0.5 * Math.pow((x - muEst) / sigma, 2));
            const py = yBase - (pdfVal * 150);

            ctx.beginPath();
            ctx.moveTo(px, yBase);
            ctx.lineTo(px, py);
            ctx.strokeStyle = '#ef4444';
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);

            totalLogLike += Math.log(pdfVal); // Relative log likelihood
        });

        // Draw Likelihood Score
        ctx.fillStyle = '#10b981';
        ctx.font = '16px monospace';
        ctx.fillText(`Log-Likelihood: ${totalLogLike.toFixed(2)}`, 20, 30);

        // Optimal marker (True mean of sample is roughly 0.04)
        const trueMean = points.reduce((a, b) => a + b, 0) / points.length;
        if (Math.abs(muEst - trueMean) < 0.1) {
            ctx.fillText("MATCH! (MLE)", 20, 50);
        }

    }, [muEst]);

    return (
        <div className="space-y-4">
            <canvas
                ref={canvasRef}
                width={600}
                height={250}
                className="w-full bg-slate-900 rounded-lg border border-slate-700"
            />
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-emerald-400">Estimated Mean ($\hat{'{'}\\mu{'}'}$): {muEst.toFixed(2)}</span>
                <input
                    type="range" min="-3" max="3" step="0.05"
                    value={muEst} onChange={(e) => setMuEst(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500"
                />
            </div>
            <p className="text-xs text-slate-400">
                Move the green distribution. MLE finds the position where the red dashed lines (likelihood of each point) are maximized in total product (or sum of logs).
            </p>
        </div>
    );
};
