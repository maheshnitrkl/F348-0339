import React, { useState, useEffect, useRef } from 'react';

export const RegularizationGeometryViz: React.FC = () => {
    const [constraint, setConstraint] = useState(1.5);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const scale = 60; // pixels per unit

        // Draw Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(width, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
        ctx.stroke();

        // Draw RSS Contours (Ellipses centered at "OLS Solution" e.g., (2, 2))
        const betaHat = { x: 2, y: 1.5 }; // OLS solution
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        for (let r = 0.5; r < 5; r += 0.5) {
            ctx.beginPath();
            ctx.ellipse(
                cx + betaHat.x * scale,
                cy - betaHat.y * scale,
                r * scale,
                r * scale * 0.7, // Elliptical nature
                Math.PI / 4,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }

        // Draw L1 Constraint (Diamond)
        const sizeL1 = constraint * scale;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; // Emerald transparent
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(cx, cy - sizeL1);
        ctx.lineTo(cx + sizeL1, cy);
        ctx.lineTo(cx, cy + sizeL1);
        ctx.lineTo(cx - sizeL1, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw L2 Constraint (Circle) - For comparison, usually dashed
        const sizeL2 = constraint * scale;
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(cx, cy, sizeL2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f8fafc';
        ctx.fillText("L2 (Ridge)", cx + sizeL2 + 5, cy);
        ctx.fillStyle = '#10b981';
        ctx.fillText("L1 (Lasso)", cx, cy - sizeL1 - 10);

        // Draw OLS Point
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(cx + betaHat.x * scale, cy - betaHat.y * scale, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.fillText("β_OLS", cx + betaHat.x * scale + 10, cy - betaHat.y * scale);

        // Visual Logic: Check if Lasso hits axis
        // Intersection logic is complex, approximating for visual education
        // If constraint is small enough, the "touch point" is likely a corner (axis)
        // For educational purposes, we highlight the corner if it's "close" to optimal

        if (constraint < 1.8) {
            // Highlight corner contact
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(cx, cy - sizeL1, 6, 0, 2 * Math.PI); // Top corner (0, beta)
            ctx.fill();
            ctx.fillText("Solution (Likely Sparse)", cx + 10, cy - sizeL1);
        }

    }, [constraint]);

    return (
        <div className="flex flex-col md:flex-row gap-8 items-center">
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="bg-slate-900 rounded-lg border border-slate-700"
            />
            <div className="flex-1 space-y-4">
                <h4 className="text-lg font-bold text-white">Constraint Budget (t)</h4>
                <input
                    type="range" min="0.5" max="3" step="0.1"
                    value={constraint} onChange={(e) => setConstraint(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                />
                <p className="text-sm text-slate-400">
                    Control the size of the constraint region ($\sum |\beta| \le t$).
                </p>
                <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg text-sm text-emerald-200">
                    <strong>Observation:</strong> As you shrink the budget, the Diamond (Lasso) often hits the contours at a sharp corner—which lies exactly on an axis.
                    This means one coefficient becomes exactly zero.
                    The Circle (Ridge) usually hits somewhere in between, keeping all coefficients non-zero.
                </div>
            </div>
        </div>
    );
};
