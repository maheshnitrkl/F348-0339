import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   PCA Eigenvector Explorer
   Implemented from the spec in src/data/learning_content.json:
   a correlated 2D data "pancake cloud", eigenvectors of its covariance,
   a projection slider that flattens the cloud onto its principal axis,
   and live explained-variance / reconstruction-error readouts.
   ═══════════════════════════════════════════════════════════════════════ */

const N_POINTS = 220;
const CANVAS_W = 640;
const CANVAS_H = 420;
const SCALE = 85;   // pixels per data unit

interface Point { x: number; y: number }

/** Closed-form eigen-decomposition of a symmetric 2×2 covariance matrix. */
function eigen2x2(cov: number[][]) {
    const [a, b] = [cov[0][0], cov[0][1]];
    const c = cov[1][1];
    const trace = a + c;
    const det = a * c - b * b;
    const disc = Math.sqrt(Math.max(0, (trace / 2) ** 2 - det));
    const l1 = trace / 2 + disc;
    const l2 = trace / 2 - disc;
    // For each λ: (A - λI)v = 0 → v = [b, λ - a] (fallback when b ≈ 0)
    const eigVec = (lambda: number): number[] => {
        if (Math.abs(b) > 1e-9) {
            const v = [b, lambda - a];
            const norm = Math.hypot(v[0], v[1]);
            return [v[0] / norm, v[1] / norm];
        }
        return Math.abs(a - lambda) < Math.abs(c - lambda) ? [1, 0] : [0, 1];
    };
    return { l1, l2, v1: eigVec(l1), v2: eigVec(l2) };
}

function makeData(seed: number, correlation: number): Point[] {
    // Box-Muller-ish generator with a fixed seed so results are stable
    let s = seed;
    const rand = () => {
        s = (s * 1103515245 + 12345) % 2147483648;
        return s / 2147483648;
    };
    const points: Point[] = [];
    for (let i = 0; i < N_POINTS; i++) {
        // Angle-skewed Gaussians: correlation tightens the cloud along x ≈ y
        const u1 = Math.max(1e-6, rand()), u2 = rand();
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        points.push({
            x: z1,
            y: correlation * z1 + Math.sqrt(Math.max(1e-6, 1 - correlation * correlation)) * z2,
        });
    }
    return points;
}

export const PCAExplorer: React.FC = () => {
    const [seed, setSeed] = useState(7);
    const [correlation, setCorrelation] = useState(0.85);
    const [projT, setProjT] = useState(0);          // 0 = original, 1 = fully projected
    const [showSecond, setShowSecond] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const data = useMemo(() => makeData(seed, correlation), [seed, correlation]);

    const { l1, l2, v1, v2 } = useMemo(() => {
        // Covariance of the (centered) data
        let sx = 0, sy = 0;
        for (const p of data) { sx += p.x; sy += p.y; }
        const mx = sx / data.length, my = sy / data.length;
        let cxx = 0, cxy = 0, cyy = 0;
        for (const p of data) {
            cxx += (p.x - mx) ** 2; cxy += (p.x - mx) * (p.y - my); cyy += (p.y - my) ** 2;
        }
        const cov = [[cxx / (data.length - 1), cxy / (data.length - 1)], [cxy / (data.length - 1), cyy / (data.length - 1)]];
        return eigen2x2(cov);
    }, [data]);

    const explainedPct = ((l1 / Math.max(1e-9, l1 + l2)) * 100).toFixed(1);
    const totalVar = Math.max(1e-9, l1 + l2);
    const retainedPct = ((1 - (projT ** 2) * (l2 / totalVar)) * 100).toFixed(1);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        const cx = CANVAS_W / 2, cy = CANVAS_H / 2;

        // Axes
        ctx.strokeStyle = 'rgba(148,163,184,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, CANVAS_H);
        ctx.moveTo(0, cy); ctx.lineTo(CANVAS_W, cy);
        ctx.stroke();

        // Project fraction projT of each point along the first eigenvector
        const drawPoints = data.map((p) => {
            const dot = v1[0] * p.x + v1[1] * p.y;
            const proj: Point = { x: dot * v1[0], y: dot * v1[1] };
            return { x: p.x * (1 - projT) + proj.x * projT, y: p.y * (1 - projT) + proj.y * projT, original: p };
        });

        // Faded "original" ghost positions while projecting
        if (projT > 0.02) {
            ctx.fillStyle = 'rgba(56,189,248,0.12)';
            for (const p of data) {
                ctx.beginPath();
                ctx.arc(cx + p.x * SCALE, cy - p.y * SCALE, 2.2, 0, 2 * Math.PI);
                ctx.fill();
            }
            // projection drop lines
            ctx.strokeStyle = 'rgba(56,189,248,0.15)';
            ctx.beginPath();
            for (const p of drawPoints) {
                ctx.moveTo(cx + p.original.x * SCALE, cy - p.original.y * SCALE);
                ctx.lineTo(cx + p.x * SCALE, cy - p.y * SCALE);
            }
            ctx.stroke();
        }

        // Data cloud
        for (const p of drawPoints) {
            ctx.fillStyle = 'rgba(56,189,248,0.75)';
            ctx.beginPath();
            ctx.arc(cx + p.x * SCALE, cy - p.y * SCALE, 2.6, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Eigenvector arrows
        const drawArrow = (vec: number[], len: number, color: string, label: string) => {
            const ex = cx + vec[0] * len * SCALE;
            const ey = cy - vec[1] * len * SCALE;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            // arrowhead
            const angle = Math.atan2(ey - cy, ex - cx);
            const hx = ex - 10 * Math.cos(angle), hy = ey - 10 * Math.sin(angle);
            const perp = angle + Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(hx + 5 * Math.cos(perp), hy + 5 * Math.sin(perp));
            ctx.lineTo(hx - 5 * Math.cos(perp), hy - 5 * Math.sin(perp));
            ctx.closePath();
            ctx.fill();
            ctx.font = '11px monospace';
            ctx.fillText(label, ex + 8 * Math.sign(vec[0] || 1), ey - 8);
        };

        drawArrow(v1, Math.sqrt(Math.max(0, l1)) * 1.4, '#a78bfa', `PC1 (λ₁=${l1.toFixed(2)})`);
        if (showSecond) drawArrow(v2, Math.sqrt(Math.max(0.01, l2)) * 1.4, '#f472b6', `PC2 (λ₂=${l2.toFixed(2)})`);

        // Legend
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(148,163,184,0.8)';
        ctx.fillText('purple → principal axis, captures most variance', 12, CANVAS_H - 14);
    }, [data, v1, v2, l1, l2, projT, showSecond]);

    useEffect(() => { draw(); }, [draw]);

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    PCA Explorer — the 2D pancake, flattened live
                </span>
                <button
                    onClick={() => { setSeed(Math.floor(Math.random() * 100000)); setProjT(0); }}
                    className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[10px] flex items-center gap-1 hover:text-white"
                >
                    <RefreshCw size={10} /> New cloud
                </button>
            </div>

            <div className="rounded-lg border border-slate-900 overflow-hidden">
                <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full h-auto max-w-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-900 space-y-2">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>spread (correlation)</span>
                        <span className="text-white font-bold">{correlation.toFixed(2)}</span>
                    </div>
                    <input
                        type="range" min={0} max={0.98} step={0.02} value={correlation}
                        onChange={(e) => { const c = parseFloat(e.target.value); setCorrelation(c); setProjT(0); }}
                        className="w-full accent-violet-400"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>project onto PC1</span>
                        <span className="text-white font-bold">{(projT * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range" min={0} max={1} step={0.01} value={projT}
                        onChange={(e) => setProjT(parseFloat(e.target.value))}
                        className="w-full accent-violet-400"
                    />
                    <label className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                        <input type="checkbox" checked={showSecond} onChange={(e) => setShowSecond(e.target.checked)} className="accent-pink-400" />
                        show second eigenvector
                    </label>
                </div>

                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-900 font-mono text-[11px] space-y-2 text-slate-400">
                    <div className="flex justify-between">
                        <span>variance along PC1</span>
                        <b className="text-violet-400">{explainedPct}%</b>
                    </div>
                    <div className="flex justify-between">
                        <span>variance kept after projection</span>
                        <b className="text-violet-400">{retainedPct}%</b>
                    </div>
                    <div className="flex justify-between">
                        <span>eigenvalues</span>
                        <b className="text-white">λ₁={l1.toFixed(2)}, λ₂={l2.toFixed(2)}</b>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed pt-1">
                        Drag &ldquo;project&rdquo; right: the cloud collapses onto its principal axis. The
                        dropped variance <em>is</em> the reconstruction error of a rank-1 PCA — the same
                        computation that reduces 500 features to 50 in the SVD worked example.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PCAExplorer;
