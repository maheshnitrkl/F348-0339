import React, { useState, useEffect, useRef } from 'react';

export const ROCCurveBuilder: React.FC = () => {
    const [threshold, setThreshold] = useState(0.5);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Simulated data: Positive (Signal) and Negative (Noise) distributions
    // Generate scores for 50 negatives (mean 0.3) and 50 positives (mean 0.7)
    // Memoizing data to prevent regeneration on render would be better, but simple let const here
    const [data] = useState(() => {
        const negs = Array.from({ length: 50 }, () => 0.3 + (Math.random() - 0.5) * 0.3);
        const pos = Array.from({ length: 50 }, () => 0.7 + (Math.random() - 0.5) * 0.3);
        return { negatives: negs, positives: pos };
    });

    const { negatives, positives } = data;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Layout: Left side (Distributions), Right side (ROC Curve)
        const margin = 40;
        const split = w / 2;

        // Draw Negatives (Blue) points
        ctx.fillStyle = '#3b82f6';
        negatives.forEach((v) => ctx.fillRect(margin + v * (split - 2 * margin), h - margin - 50 - (Math.random() * 30), 3, 3));

        // Draw Positives (Red) points
        ctx.fillStyle = '#ef4444';
        positives.forEach((v) => ctx.fillRect(margin + v * (split - 2 * margin), h - margin - 50 - (Math.random() * 30), 3, 3));

        // Draw Threshold Line
        const threshX = margin + threshold * (split - 2 * margin);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(threshX, margin);
        ctx.lineTo(threshX, h - margin);
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.fillText("Threshold", threshX - 20, margin - 10);

        // Calc TPR / FPR
        const tp = positives.filter(x => x >= threshold).length;
        const fp = negatives.filter(x => x >= threshold).length;
        const tpr = tp / positives.length;
        const fpr = fp / negatives.length;

        ctx.fillStyle = 'white';
        ctx.fillText(`TPR: ${tpr.toFixed(2)}`, margin, margin + 20);
        ctx.fillText(`FPR: ${fpr.toFixed(2)}`, margin, margin + 40);


        // --- Right: ROC Space ---
        const rocX = split + margin;
        const rocW = w - split - 2 * margin;
        const rocH = h - 2 * margin;
        const rocY = h - margin;

        // Axis
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(rocX, rocY); ctx.lineTo(rocX + rocW, rocY); // X (FPR)
        ctx.moveTo(rocX, rocY); ctx.lineTo(rocX, rocY - rocH); // Y (TPR)
        ctx.stroke();

        // Diagonal
        ctx.strokeStyle = '#334155';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(rocX, rocY);
        ctx.lineTo(rocX + rocW, rocY - rocH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Current Point
        const px = rocX + fpr * rocW;
        const py = rocY - tpr * rocH;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Trace the curve (Pre-calculated)
        const allScores = [...negatives.map(v => ({ v, t: 0 })), ...positives.map(v => ({ v, t: 1 }))].sort((a, b) => b.v - a.v);
        let ctp = 0; let cfp = 0;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rocX, rocY); // Start at 0,0 (actually FPR=0, TPR=0 is bottom left, wait... FPR=0, TPR=0 is bottom left)
        // Wait, standard ROC is (0,0) to (1,1). (0,0) is bottom-left.
        // My axes are drawn: rocX, rocY is bottom-left. Yes.

        allScores.forEach(item => {
            if (item.t === 1) ctp++; else cfp++;
            const _fpr = cfp / negatives.length;
            const _tpr = ctp / positives.length;
            ctx.lineTo(rocX + _fpr * rocW, rocY - _tpr * rocH);
        });
        ctx.stroke();

    }, [threshold, negatives, positives]);

    return (
        <div className="flex flex-col md:flex-row items-center gap-8">
            <canvas ref={canvasRef} width={800} height={300} className="w-full bg-slate-900 rounded-lg border border-slate-700" />
            <div className="w-64">
                <label className="block text-sm font-medium text-slate-400 mb-2">Threshold: {threshold.toFixed(2)}</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full accent-yellow-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                    Move threshold left (lower) &rarr; Higher TPR, but Higher FPR.
                </p>
            </div>
        </div>
    );
};
