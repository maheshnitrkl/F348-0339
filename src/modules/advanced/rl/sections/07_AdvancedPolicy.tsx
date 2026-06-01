import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    ArrowRight,
    Play,
    Pause,
    RotateCcw,
    Terminal,
    Sparkles,
    CheckCircle,
    Info,
    TrendingUp,
    Sliders,
    AlertTriangle,
    Zap,
    Lock
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const KeyInsight: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = '#14b8a6' }) => (
    <div className="flex gap-3 p-4 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '30' }}>
        <Sparkles size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <div>
            <span className="text-sm font-semibold block mb-1" style={{ color }}>{title}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
        </div>
    </div>
);

const AlgorithmBox: React.FC<{ title: string; steps: string[]; color?: string }> = ({ title, steps, color = '#14b8a6' }) => (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: color + '40' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: color + '15' }}>
            <Terminal size={14} style={{ color }} />
            <span className="text-sm font-mono font-bold" style={{ color }}>{title}</span>
        </div>
        <div className="bg-slate-950/60 p-4 space-y-1.5">
            {steps.map((step, i) => (
                <div key={i} className="text-sm font-mono text-slate-300 flex gap-2">
                    <span className="text-slate-600 select-none w-5 text-right flex-shrink-0">{i + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: step }} />
                </div>
            ))}
        </div>
    </div>
);

const ComparisonRow: React.FC<{ label: string; trpo: string; ppo: string }> = ({ label, trpo, ppo }) => (
    <tr className="border-b border-slate-800/50">
        <td className="py-3 px-4 text-sm font-medium text-slate-300">{label}</td>
        <td className="py-3 px-4 text-sm text-amber-300">{trpo}</td>
        <td className="py-3 px-4 text-sm text-teal-300">{ppo}</td>
    </tr>
);

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: PPO Clipping Visualizer
   ═══════════════════════════════════════════════════════════════════════ */

const PPOClippingVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [epsilon, setEpsilon] = useState(0.2);
    const [advantage, setAdvantage] = useState(1.0); // positive = good action
    const [hoverRatio, setHoverRatio] = useState<number | null>(null);

    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const pad = { top: 30, right: 30, bottom: 50, left: 60 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        // Clear
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        // Axes ranges
        const rMin = 0;
        const rMax = 2.5;
        const aVal = advantage;
        const yExtent = Math.max(Math.abs(aVal) * 2.5, 1);
        const yMin = -yExtent;
        const yMax = yExtent;

        const toX = (r: number) => pad.left + ((r - rMin) / (rMax - rMin)) * plotW;
        const toY = (y: number) => pad.top + ((yMax - y) / (yMax - yMin)) * plotH;

        // Grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let g = 0; g <= 5; g++) {
            const gy = yMin + (g / 5) * (yMax - yMin);
            ctx.beginPath();
            ctx.moveTo(pad.left, toY(gy));
            ctx.lineTo(W - pad.right, toY(gy));
            ctx.stroke();
        }
        for (let g = 0; g <= 5; g++) {
            const gx = rMin + (g / 5) * (rMax - rMin);
            ctx.beginPath();
            ctx.moveTo(toX(gx), pad.top);
            ctx.lineTo(toX(gx), H - pad.bottom);
            ctx.stroke();
        }

        // Zero line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pad.left, toY(0));
        ctx.lineTo(W - pad.right, toY(0));
        ctx.stroke();

        // r=1 vertical guide
        ctx.strokeStyle = '#475569';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(toX(1), pad.top);
        ctx.lineTo(toX(1), H - pad.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Clipping bounds
        const clipLo = 1 - epsilon;
        const clipHi = 1 + epsilon;

        // Draw clipping region shading
        ctx.fillStyle = '#14b8a620';
        ctx.fillRect(toX(clipLo), pad.top, toX(clipHi) - toX(clipLo), plotH);
        
        // Clipping bound lines
        ctx.strokeStyle = '#14b8a650';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(toX(clipLo), pad.top);
        ctx.lineTo(toX(clipLo), H - pad.bottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(toX(clipHi), pad.top);
        ctx.lineTo(toX(clipHi), H - pad.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        // UNCLIPPED surrogate: L = r * A
        const drawLine = (color: string, fn: (r: number) => number, dash?: number[]) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            if (dash) ctx.setLineDash(dash);
            ctx.beginPath();
            let first = true;
            for (let px = 0; px <= plotW; px += 1) {
                const r = rMin + (px / plotW) * (rMax - rMin);
                const y = fn(r);
                const sy = toY(y);
                if (sy < pad.top - 5 || sy > H - pad.bottom + 5) {
                    first = true;
                    continue;
                }
                if (first) { ctx.moveTo(toX(r), sy); first = false; }
                else ctx.lineTo(toX(r), sy);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        };

        // Unclipped: r * A (dimmer)
        drawLine('#64748b', (r) => r * aVal, [5, 3]);

        // Clipped surrogate: min(r*A, clip(r, 1-eps, 1+eps)*A)
        const clippedSurrogate = (r: number): number => {
            const unclipped = r * aVal;
            const clippedR = Math.max(clipLo, Math.min(clipHi, r));
            const clipped = clippedR * aVal;
            return aVal >= 0 ? Math.min(unclipped, clipped) : Math.max(unclipped, clipped);
        };

        drawLine('#14b8a6', clippedSurrogate);

        // Axes labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Probability Ratio r(θ) = π_new / π_old', W / 2, H - 8);
        
        ctx.save();
        ctx.translate(16, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Objective L(θ)', 0, 0);
        ctx.restore();

        // Tick labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        for (let g = 0; g <= 5; g++) {
            const gx = rMin + (g / 5) * (rMax - rMin);
            ctx.fillText(gx.toFixed(1), toX(gx), H - pad.bottom + 16);
        }
        ctx.textAlign = 'right';
        for (let g = 0; g <= 5; g++) {
            const gy = yMin + (g / 5) * (yMax - yMin);
            ctx.fillText(gy.toFixed(1), pad.left - 8, toY(gy) + 4);
        }

        // Legend
        ctx.font = '11px Inter, system-ui, sans-serif';
        const legY = pad.top + 14;
        
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath(); ctx.moveTo(W - pad.right - 160, legY); ctx.lineTo(W - pad.right - 140, legY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText('Unclipped r·Â', W - pad.right - 135, legY + 4);

        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(W - pad.right - 160, legY + 20); ctx.lineTo(W - pad.right - 140, legY + 20); ctx.stroke();
        ctx.fillStyle = '#14b8a6';
        ctx.fillText('PPO Clipped', W - pad.right - 135, legY + 24);

        // ε annotation
        ctx.fillStyle = '#14b8a6';
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`1-ε = ${clipLo.toFixed(2)}`, toX(clipLo), pad.top - 8);
        ctx.fillText(`1+ε = ${clipHi.toFixed(2)}`, toX(clipHi), pad.top - 8);

        // Hover crosshair
        if (hoverRatio !== null) {
            const hx = toX(hoverRatio);
            const surVal = clippedSurrogate(hoverRatio);
            const hy = toY(surVal);

            ctx.strokeStyle = '#f8fafc40';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.moveTo(hx, pad.top); ctx.lineTo(hx, H - pad.bottom); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pad.left, hy); ctx.lineTo(W - pad.right, hy); ctx.stroke();
            ctx.setLineDash([]);

            // Dot
            ctx.fillStyle = '#14b8a6';
            ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill();

            // Tooltip
            const isClipped = hoverRatio < clipLo || hoverRatio > clipHi;
            ctx.fillStyle = '#1e293bee';
            const tw = 160;
            const th = 42;
            const tx = Math.min(hx + 10, W - pad.right - tw);
            const ty = Math.max(hy - th - 10, pad.top);
            ctx.fillRect(tx, ty, tw, th);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx, ty, tw, th);
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`r = ${hoverRatio.toFixed(3)}`, tx + 8, ty + 14);
            ctx.fillText(`L = ${surVal.toFixed(3)}`, tx + 8, ty + 28);
            ctx.fillStyle = isClipped ? '#f97316' : '#14b8a6';
            ctx.fillText(isClipped ? '● CLIPPED' : '● ACTIVE', tx + 100, ty + 14);
        }

    }, [epsilon, advantage, hoverRatio]);

    useEffect(() => {
        drawChart();
    }, [drawChart]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scaleX;
        const pad = { left: 60, right: 30 };
        const plotW = canvas.width - pad.left - pad.right;
        const r = ((x - pad.left) / plotW) * 2.5;
        if (r >= 0 && r <= 2.5) setHoverRatio(r);
        else setHoverRatio(null);
    };

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield size={18} className="text-teal-400" />
                        Interactive PPO Clipping Visualizer
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Hover over the chart to see how the clipped objective behaves at different probability ratios.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <label className="text-sm text-slate-400 flex justify-between">
                        <span>Clipping Epsilon (ε)</span>
                        <span className="font-mono text-teal-400">{epsilon.toFixed(2)}</span>
                    </label>
                    <input
                        type="range" min={0.05} max={0.5} step={0.01}
                        value={epsilon}
                        onChange={e => setEpsilon(parseFloat(e.target.value))}
                        className="w-full accent-teal-500"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-sm text-slate-400 flex justify-between">
                        <span>Advantage Â</span>
                        <span className={`font-mono ${advantage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{advantage >= 0 ? '+' : ''}{advantage.toFixed(1)}</span>
                    </label>
                    <input
                        type="range" min={-2} max={2} step={0.1}
                        value={advantage}
                        onChange={e => setAdvantage(parseFloat(e.target.value))}
                        className="w-full accent-teal-500"
                    />
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
                <canvas
                    ref={canvasRef}
                    width={720}
                    height={380}
                    className="w-full"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverRatio(null)}
                    style={{ cursor: 'crosshair' }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-center">
                    <div className="text-xs text-teal-400 mb-1">Trust Region</div>
                    <div className="font-mono text-white">[{(1 - epsilon).toFixed(2)}, {(1 + epsilon).toFixed(2)}]</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-xs text-emerald-400 mb-1">Advantage Sign</div>
                    <div className="font-mono text-white">{advantage >= 0 ? 'Positive → Reward ↑' : 'Negative → Penalty ↓'}</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-xs text-amber-400 mb-1">Clipping Effect</div>
                    <div className="font-mono text-white">{advantage >= 0 ? 'Caps ratio at 1+ε' : 'Floors ratio at 1-ε'}</div>
                </div>
            </div>
        </Card>
    );
};


/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: TRPO vs PPO Training Simulator
   ═══════════════════════════════════════════════════════════════════════ */

const TRPOvsPPOSimulator: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [step, setStep] = useState(0);
    const [trpoRewards, setTrpoRewards] = useState<number[]>([0]);
    const [ppoRewards, setPpoRewards] = useState<number[]>([0]);
    const [trpoKL, setTrpoKL] = useState<number[]>([0]);
    const [ppoKL, setPpoKL] = useState<number[]>([0]);
    const [logs, setLogs] = useState<string[]>(['⏳ Ready to simulate. Press Play to begin.']);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const MAX_STEPS = 80;

    // Simulated training dynamics
    const simulateStep = useCallback((s: number) => {
        // TRPO: Slower but more stable convergence, tighter KL
        const trpoR = 80 * (1 - Math.exp(-0.04 * s)) + (Math.random() - 0.5) * 8;
        const trpoKLv = 0.01 * (1 + 0.3 * Math.sin(s * 0.15)) + Math.random() * 0.003;

        // PPO: Faster convergence, slightly noisier, KL more variable
        const ppoR = 90 * (1 - Math.exp(-0.055 * s)) + (Math.random() - 0.5) * 12;
        const ppoKLv = 0.015 * (1 + 0.5 * Math.sin(s * 0.2)) + Math.random() * 0.008;

        return { trpoR, trpoKLv, ppoR, ppoKLv };
    }, []);

    const stepOnce = useCallback(() => {
        setStep(prev => {
            const s = prev + 1;
            if (s > MAX_STEPS) {
                setIsRunning(false);
                return prev;
            }
            const { trpoR, trpoKLv, ppoR, ppoKLv } = simulateStep(s);
            setTrpoRewards(p => [...p, trpoR]);
            setPpoRewards(p => [...p, ppoR]);
            setTrpoKL(p => [...p, trpoKLv]);
            setPpoKL(p => [...p, ppoKLv]);

            if (s % 10 === 0) {
                setLogs(p => [
                    `[Step ${s}] TRPO: R=${trpoR.toFixed(1)}, KL=${trpoKLv.toFixed(4)} | PPO: R=${ppoR.toFixed(1)}, KL=${ppoKLv.toFixed(4)}`,
                    ...p.slice(0, 8)
                ]);
            }
            return s;
        });
    }, [simulateStep]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(stepOnce, 120);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, stepOnce]);

    // Draw reward curves
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 40, left: 50 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (i / 4) * plotH;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        const maxR = 100;
        const toX = (i: number) => pad.left + (i / MAX_STEPS) * plotW;
        const toY = (v: number) => pad.top + ((maxR - v) / maxR) * plotH;

        // Draw curves
        const drawCurve = (data: number[], color: string) => {
            if (data.length < 2) return;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            data.forEach((v, i) => {
                const x = toX(i);
                const y = toY(Math.max(0, Math.min(maxR, v)));
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        };

        drawCurve(trpoRewards, '#f59e0b');
        drawCurve(ppoRewards, '#14b8a6');

        // Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Training Steps', W / 2, H - 6);
        
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const v = (i / 4) * maxR;
            ctx.fillText(v.toFixed(0), pad.left - 8, toY(v) + 4);
        }

        // Legend
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'left';
        ctx.fillText('● TRPO', pad.left + 10, pad.top + 14);
        ctx.fillStyle = '#14b8a6';
        ctx.fillText('● PPO', pad.left + 80, pad.top + 14);

    }, [trpoRewards, ppoRewards]);

    const reset = () => {
        setIsRunning(false);
        setStep(0);
        setTrpoRewards([0]);
        setPpoRewards([0]);
        setTrpoKL([0]);
        setPpoKL([0]);
        setLogs(['⏳ Reset. Press Play to begin.']);
    };

    return (
        <Card className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-teal-400" />
                        TRPO vs PPO Training Dynamics
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Simulated reward convergence comparison.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        disabled={step >= MAX_STEPS}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 disabled:opacity-40 transition-colors"
                    >
                        {isRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
                    </button>
                    <button
                        onClick={reset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2 rounded-lg bg-slate-800/60">
                    <div className="text-xs text-slate-500 mb-0.5">Step</div>
                    <div className="text-sm font-mono text-white">{step}/{MAX_STEPS}</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-xs text-amber-400 mb-0.5">TRPO Reward</div>
                    <div className="text-sm font-mono text-white">{trpoRewards[trpoRewards.length - 1].toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                    <div className="text-xs text-teal-400 mb-0.5">PPO Reward</div>
                    <div className="text-sm font-mono text-white">{ppoRewards[ppoRewards.length - 1].toFixed(1)}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60">
                    <div className="text-xs text-slate-500 mb-0.5">Avg KL (PPO)</div>
                    <div className="text-sm font-mono text-white">{ppoKL.length > 0 ? ppoKL[ppoKL.length - 1].toFixed(4) : '—'}</div>
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
                <canvas ref={canvasRef} width={700} height={280} className="w-full" />
            </div>

            {/* Training log */}
            <div className="bg-slate-950/60 rounded-lg border border-slate-800 p-3 max-h-32 overflow-y-auto font-mono text-xs text-slate-400 space-y-0.5">
                {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </Card>
    );
};


/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: KL Divergence Explorer
   ═══════════════════════════════════════════════════════════════════════ */

const KLDivergenceExplorer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [p, setP] = useState(0.6);
    const [q, setQ] = useState(0.5);

    const klDiv = useCallback((pp: number, qq: number) => {
        if (pp <= 0 || pp >= 1 || qq <= 0 || qq >= 1) return 0;
        return pp * Math.log(pp / qq) + (1 - pp) * Math.log((1 - pp) / (1 - qq));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 45, left: 50 };
        const plotW = W - pad.left - pad.right;
        const plotH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (i / 4) * plotH;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        }

        // KL as a function of q for fixed p
        const maxKL = 3;
        const toX = (v: number) => pad.left + (v / 1) * plotW;
        const toY = (v: number) => pad.top + ((maxKL - v) / maxKL) * plotH;

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= plotW; px++) {
            const qVal = (px / plotW);
            if (qVal <= 0.01 || qVal >= 0.99) continue;
            const kl = klDiv(p, qVal);
            const y = toY(Math.min(kl, maxKL));
            if (first) { ctx.moveTo(toX(qVal), y); first = false; }
            else ctx.lineTo(toX(qVal), y);
        }
        ctx.stroke();

        // Mark current q
        const currentKL = klDiv(p, q);
        const cx = toX(q);
        const cy = toY(Math.min(currentKL, maxKL));

        ctx.fillStyle = '#a855f7';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

        // Mark p
        ctx.strokeStyle = '#14b8a650';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(toX(p), pad.top); ctx.lineTo(toX(p), H - pad.bottom); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#14b8a6';
        ctx.font = '11px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`p = ${p.toFixed(2)}`, toX(p), H - pad.bottom + 30);

        // Axis labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('q (new policy probability)', W / 2, H - 6);
        
        ctx.save();
        ctx.translate(14, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('D_KL(p || q)', 0, 0);
        ctx.restore();

        // Tick labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const v = (i / 4) * maxKL;
            ctx.fillText(v.toFixed(1), pad.left - 8, toY(v) + 4);
        }
        ctx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const v = (i / 4);
            ctx.fillText(v.toFixed(2), toX(v), H - pad.bottom + 16);
        }

        // Tooltip
        ctx.fillStyle = '#1e293bee';
        ctx.fillRect(cx + 10, cy - 30, 120, 28);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(cx + 10, cy - 30, 120, 28);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`KL = ${currentKL.toFixed(4)}`, cx + 18, cy - 12);

    }, [p, q, klDiv]);

    return (
        <Card className="space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-purple-400" />
                KL Divergence Explorer
            </h3>
            <p className="text-sm text-slate-400">Explore how KL divergence measures the "distance" between old policy p and new policy q. The constraint D_KL ≤ δ defines TRPO's trust region.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-slate-400 flex justify-between">
                        <span>Old Policy p(a=1)</span>
                        <span className="font-mono text-teal-400">{p.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.05} max={0.95} step={0.01} value={p}
                        onChange={e => setP(parseFloat(e.target.value))}
                        className="w-full accent-teal-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-slate-400 flex justify-between">
                        <span>New Policy q(a=1)</span>
                        <span className="font-mono text-purple-400">{q.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.05} max={0.95} step={0.01} value={q}
                        onChange={e => setQ(parseFloat(e.target.value))}
                        className="w-full accent-purple-500" />
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
                <canvas ref={canvasRef} width={700} height={260} className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-xs text-purple-400">D_KL(p ∥ q)</div>
                    <div className="text-lg font-mono text-white">{klDiv(p, q).toFixed(5)}</div>
                </div>
                <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                    <div className="text-xs text-teal-400">Typical TRPO δ</div>
                    <div className="text-lg font-mono text-white">0.01</div>
                </div>
            </div>
        </Card>
    );
};


/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: AdvancedPolicy Component
   ═══════════════════════════════════════════════════════════════════════ */

export const AdvancedPolicy: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <Shield size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 7</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 to-teal-500 mb-4">
                    Advanced Policy Optimization
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    From vanilla policy gradients to trust-region methods: learn how TRPO and PPO solve
                    the fundamental challenge of taking large, stable policy improvement steps without
                    catastrophic performance collapse.
                </p>
            </motion.div>

            {/* ─── 7.1 THE PROBLEM: POLICY GRADIENT INSTABILITY ─────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <SectionTitle icon={<AlertTriangle size={20} className="text-teal-400" />}>
                    7.1 — The Step-Size Dilemma
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Vanilla policy gradient methods like REINFORCE and A2C suffer from a critical sensitivity:
                        <strong className="text-white"> the learning rate controls everything</strong>. Too small → agonizingly
                        slow convergence. Too large → the policy jumps into a catastrophic region and may never recover.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                                <AlertTriangle size={14} /> Step Too Large
                            </div>
                            <p className="text-sm text-slate-400">
                                Policy changes drastically → bad actions get high probability → reward collapses → 
                                new gradient pushes back but from a damaged policy → oscillation or divergence.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                <Lock size={14} /> Step Too Small
                            </div>
                            <p className="text-sm text-slate-400">
                                Each gradient step makes negligible progress → millions of samples needed to learn 
                                even simple tasks → computationally wasteful and impractical.
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                        The root cause is that gradient descent in <em>parameter space</em> doesn't correspond to 
                        uniform changes in <em>policy space</em>. A small θ-step can produce a huge change in the action 
                        distribution, or vice versa, depending on the parameterization.
                    </p>

                    <KeyInsight title="Core Idea" color="#14b8a6">
                        Instead of controlling step size in parameter space (‖Δθ‖ ≤ α), control the step size 
                        in <strong>distribution space</strong> using the KL divergence: D_KL(π_old ∥ π_new) ≤ δ.
                        This gives a <em>trust region</em> — a neighborhood where the policy is allowed to change.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 7.2 NATURAL POLICY GRADIENTS ────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <SectionTitle icon={<Sparkles size={20} className="text-teal-400" />}>
                    7.2 — Natural Policy Gradients
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        The Fisher Information Matrix (FIM) captures how sensitive the policy's probability 
                        distribution is to parameter changes. The <strong className="text-white">natural gradient</strong> 
                        {' '}preconditions the vanilla gradient by the inverse of the FIM, producing steps that 
                        are "equally sized" in distribution space regardless of parameterization.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Fisher Information Matrix</p>
                            <MathEquation formula="F_\theta = \mathbb{E}_{\pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a|s)\;\nabla_\theta \log \pi_\theta(a|s)^\top\right]" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Natural Gradient (Amari, 1998)</p>
                            <MathEquation formula="\widetilde{\nabla}_\theta J(\theta) = F_\theta^{-1}\,\nabla_\theta J(\theta)" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Connection to KL Divergence</p>
                            <MathEquation formula="D_{\mathrm{KL}}(\pi_\theta \| \pi_{\theta + \Delta\theta}) \approx \tfrac{1}{2}\,\Delta\theta^\top\,F_\theta\,\Delta\theta" />
                        </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                        The second-order Taylor expansion of KL divergence around the current parameters is exactly
                        the quadratic form with the Fisher matrix. This means constraining the KL divergence is 
                        equivalent to constraining the Fisher-weighted norm of the parameter change.
                    </p>

                    <KeyInsight title="Why Natural Gradients Matter">
                        The natural gradient is <em>parameterization-invariant</em> — it produces the same update 
                        direction regardless of how we parameterize the policy. This is exactly what trust-region
                        methods exploit for stable, large policy improvements.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 7.3 KL DIVERGENCE EXPLORER ──────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <SectionTitle icon={<Sliders size={20} className="text-purple-400" />} color="#a855f7">
                    7.3 — Understanding KL Divergence
                </SectionTitle>

                <Card className="space-y-6 mb-6">
                    <p className="text-slate-300 leading-relaxed">
                        KL divergence quantifies the "information-theoretic distance" between two probability 
                        distributions. In the context of policy optimization, it measures how much the new policy
                        differs from the old policy:
                    </p>

                    <MathEquation formula="D_{\mathrm{KL}}(\pi_{\theta_{\mathrm{old}}} \| \pi_\theta) = \mathbb{E}_{s \sim d^{\pi_{\mathrm{old}}}}\!\left[\mathbb{E}_{a \sim \pi_{\mathrm{old}}}\!\left[\log \frac{\pi_{\theta_{\mathrm{old}}}(a|s)}{\pi_\theta(a|s)}\right]\right]" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-lg bg-slate-800/60">
                            <span className="text-teal-400 font-bold">D_KL = 0</span>
                            <p className="text-slate-400 mt-1">Identical policies</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/60">
                            <span className="text-amber-400 font-bold">D_KL ≈ 0.01</span>
                            <p className="text-slate-400 mt-1">Small, safe update (TRPO default)</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/60">
                            <span className="text-red-400 font-bold">D_KL ≫ 0.1</span>
                            <p className="text-slate-400 mt-1">Dangerously large policy change</p>
                        </div>
                    </div>
                </Card>

                <KLDivergenceExplorer />
            </motion.section>

            {/* ─── 7.4 TRPO: TRUST REGION POLICY OPTIMIZATION ──────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <SectionTitle icon={<Lock size={20} className="text-amber-400" />} color="#f59e0b">
                    7.4 — TRPO: Trust Region Policy Optimization
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        <strong className="text-amber-300">TRPO</strong> (Schulman et al., 2015) directly solves 
                        the constrained optimization problem: maximize the expected advantage of the new policy 
                        subject to a KL divergence constraint.
                    </p>

                    <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                        <p className="text-sm font-bold text-amber-400">TRPO Optimization Problem</p>
                        <MathEquation formula="\max_\theta \;\; \hat{\mathbb{E}}_t\!\left[\frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\mathrm{old}}}(a_t|s_t)}\,\hat{A}_t\right]" />
                        <MathEquation formula="\text{subject to} \;\; \hat{\mathbb{E}}_t\!\left[D_{\mathrm{KL}}\!\left(\pi_{\theta_{\mathrm{old}}}(\cdot|s_t)\,\|\,\pi_\theta(\cdot|s_t)\right)\right] \leq \delta" />
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                        The surrogate objective uses the <strong className="text-white">importance sampling ratio</strong>:
                    </p>

                    <MathEquation formula="r_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\mathrm{old}}}(a_t \mid s_t)}" />

                    <p className="text-slate-300 leading-relaxed">
                        Since the KL constraint makes this a second-order problem, TRPO uses a clever combination of:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                            <div className="text-sm font-bold text-amber-300 mb-2">1. Linear Approx.</div>
                            <p className="text-xs text-slate-400">
                                Linearize the objective around θ_old: L(θ) ≈ g·(θ − θ_old) where g = ∇_θ L.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                            <div className="text-sm font-bold text-amber-300 mb-2">2. Quadratic KL</div>
                            <p className="text-xs text-slate-400">
                                Approximate KL with Fisher: D_KL ≈ ½ Δθ·F·Δθ. The constraint becomes an ellipsoid.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                            <div className="text-sm font-bold text-amber-300 mb-2">3. CG + Line Search</div>
                            <p className="text-xs text-slate-400">
                                Solve F·x = g via conjugate gradient (no explicit F inverse), then backtracking line search.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-slate-500 font-medium">Analytic Solution (Lagrangian)</p>
                        <MathEquation formula="\theta_{\mathrm{new}} = \theta_{\mathrm{old}} + \sqrt{\frac{2\delta}{g^\top F^{-1} g}}\;F^{-1}g" />
                    </div>

                    <AlgorithmBox
                        title="Algorithm: TRPO"
                        color="#f59e0b"
                        steps={[
                            'Collect trajectories τ using current policy π<sub>θ_old</sub>',
                            'Compute advantages Â<sub>t</sub> using GAE(λ)',
                            'Compute policy gradient g = ∇<sub>θ</sub> L<sub>surr</sub>(θ)|<sub>θ_old</sub>',
                            'Compute Fisher-vector product F·v using autodiff (no explicit F)',
                            'Solve F·x = g using Conjugate Gradient (≈10 iters)',
                            'Compute step size β = √(2δ / x<sup>T</sup>Fx)',
                            'Set search direction: Δθ = β·x',
                            'Backtracking line search: check KL ≤ δ and L improves',
                            'Update: θ ← θ_old + α<sub>bt</sub>·Δθ',
                        ]}
                    />

                    <KeyInsight title="TRPO Guarantee (Schulman et al., 2015)" color="#f59e0b">
                        TRPO provides a <em>monotonic improvement guarantee</em>: each update is guaranteed to 
                        improve (or at worst maintain) the true expected return, provided the KL constraint is 
                        satisfied. This theoretical guarantee makes TRPO exceptionally stable.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 7.5 PPO: PROXIMAL POLICY OPTIMIZATION ───────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <SectionTitle icon={<Zap size={20} className="text-teal-400" />}>
                    7.5 — PPO: Proximal Policy Optimization
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        <strong className="text-teal-300">PPO</strong> (Schulman et al., 2017) achieves similar 
                        trust-region benefits to TRPO but with <em>first-order optimization only</em> — no 
                        conjugate gradient, no Fisher-vector products, no line search. The key idea is replacing 
                        the hard KL constraint with a <strong className="text-white">clipped surrogate objective</strong>.
                    </p>

                    <div className="p-5 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-4">
                        <p className="text-sm font-bold text-teal-400">PPO-Clip Objective</p>
                        <MathEquation formula="L^{\mathrm{CLIP}}(\theta) = \hat{\mathbb{E}}_t\!\left[\min\!\left(r_t(\theta)\,\hat{A}_t,\;\;\mathrm{clip}\!\left(r_t(\theta),\,1{-}\varepsilon,\,1{+}\varepsilon\right)\hat{A}_t\right)\right]" />
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                        The <code className="text-teal-400 bg-teal-500/10 px-1 rounded">clip</code> function bounds the 
                        importance sampling ratio to [1−ε, 1+ε], preventing the policy from moving too far in a single update. 
                        The <code className="text-teal-400 bg-teal-500/10 px-1 rounded">min</code> operator then takes the 
                        pessimistic (lower) bound, ensuring the objective is a <em>lower bound</em> on the unclipped objective.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="text-sm font-bold text-emerald-400 mb-2">When Â &gt; 0 (Good Action)</div>
                            <MathEquation formula="L^{\mathrm{CLIP}} = \min\!\left(r\,\hat{A},\;(1{+}\varepsilon)\,\hat{A}\right)" />
                            <p className="text-xs text-slate-400 mt-2">
                                The ratio r is <strong>capped at 1+ε</strong>. The policy cannot increase the 
                                probability of a good action beyond the trust region.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="text-sm font-bold text-red-400 mb-2">When Â &lt; 0 (Bad Action)</div>
                            <MathEquation formula="L^{\mathrm{CLIP}} = \max\!\left(r\,\hat{A},\;(1{-}\varepsilon)\,\hat{A}\right)" />
                            <p className="text-xs text-slate-400 mt-2">
                                The ratio r is <strong>floored at 1−ε</strong>. The policy cannot decrease the 
                                probability of a bad action too aggressively.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-slate-500 font-medium">Full PPO Loss (with Value & Entropy)</p>
                        <MathEquation formula="L(\theta) = \hat{\mathbb{E}}_t\!\left[L_t^{\mathrm{CLIP}}(\theta) - c_1\,L_t^{\mathrm{VF}}(\theta) + c_2\,S[\pi_\theta](s_t)\right]" />
                        <p className="text-sm text-slate-400">
                            Where L<sup>VF</sup> is the squared value prediction error and S[π] is the entropy bonus
                            for exploration. Typical: c₁ = 0.5, c₂ = 0.01, ε = 0.2.
                        </p>
                    </div>

                    <AlgorithmBox
                        title="Algorithm: PPO-Clip"
                        color="#14b8a6"
                        steps={[
                            'for iteration = 1, 2, ... do:',
                            '&nbsp;&nbsp;Collect N timesteps with π<sub>θ_old</sub> across M parallel envs',
                            '&nbsp;&nbsp;Compute advantages Â<sub>t</sub> using GAE(γ, λ)',
                            '&nbsp;&nbsp;for epoch = 1, ..., K (typically K=3-10) do:',
                            '&nbsp;&nbsp;&nbsp;&nbsp;for each mini-batch B ⊂ {1,...,N} do:',
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;r<sub>t</sub>(θ) = π<sub>θ</sub>(a<sub>t</sub>|s<sub>t</sub>) / π<sub>θ_old</sub>(a<sub>t</sub>|s<sub>t</sub>)',
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L<sup>CLIP</sup> = min(r<sub>t</sub>·Â<sub>t</sub>, clip(r<sub>t</sub>, 1-ε, 1+ε)·Â<sub>t</sub>)',
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;θ ← θ + α · ∇<sub>θ</sub> L<sup>CLIP</sup>  (via Adam)',
                            '&nbsp;&nbsp;θ_old ← θ',
                        ]}
                    />

                    <KeyInsight title="Why PPO Dominates in Practice">
                        PPO requires only first-order gradients (no Hessians, no conjugate gradient) → 
                        it's as simple as vanilla PG to implement but nearly as stable as TRPO. This made it 
                        the workhorse behind OpenAI Five (Dota 2), ChatGPT (RLHF), and countless robotics applications.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 7.6 PPO CLIPPING VISUALIZER ─────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <SectionTitle icon={<Shield size={20} className="text-teal-400" />}>
                    7.6 — Interactive PPO Clipping Visualizer
                </SectionTitle>

                <PPOClippingVisualizer />
            </motion.section>

            {/* ─── 7.7 PPO VARIANT: ADAPTIVE KL PENALTY ────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <SectionTitle icon={<Sliders size={20} className="text-teal-400" />}>
                    7.7 — PPO Variant: Adaptive KL Penalty
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        An alternative to clipping is PPO with an <strong className="text-white">adaptive KL penalty</strong>,
                        which adds a KL divergence term to the objective and dynamically adjusts its coefficient:
                    </p>

                    <MathEquation formula="L^{\mathrm{KLPEN}}(\theta) = \hat{\mathbb{E}}_t\!\left[r_t(\theta)\,\hat{A}_t - \beta\,D_{\mathrm{KL}}\!\left(\pi_{\theta_{\mathrm{old}}} \| \pi_\theta\right)\right]" />

                    <AlgorithmBox
                        title="Adaptive β Update Rule"
                        color="#14b8a6"
                        steps={[
                            'd = E[D_KL(π_old ∥ π_θ)]  // Compute mean KL after update',
                            'if d < d_target / 1.5 then β ← β / 2  // KL too small → loosen',
                            'if d > d_target × 1.5 then β ← β × 2  // KL too large → tighten',
                        ]}
                    />

                    <p className="text-sm text-slate-400">
                        In practice, the clipped variant (PPO-Clip) tends to outperform PPO-KL on most benchmarks,
                        which is why it became the default. However, PPO-KL has seen a resurgence in RLHF pipelines
                        (e.g., InstructGPT) where explicit KL control relative to a reference policy is desired.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 7.8 TRPO VS PPO COMPARISON ──────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
            >
                <SectionTitle icon={<TrendingUp size={20} className="text-teal-400" />}>
                    7.8 — TRPO vs PPO: Head-to-Head
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-3 px-4 text-sm font-bold text-slate-400">Property</th>
                                    <th className="py-3 px-4 text-sm font-bold text-amber-400">TRPO</th>
                                    <th className="py-3 px-4 text-sm font-bold text-teal-400">PPO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <ComparisonRow label="Publication" trpo="Schulman et al., 2015" ppo="Schulman et al., 2017" />
                                <ComparisonRow label="Constraint Type" trpo="Hard KL constraint (δ)" ppo="Soft clipping (ε) or KL penalty" />
                                <ComparisonRow label="Optimization" trpo="2nd order (CG + line search)" ppo="1st order (SGD / Adam)" />
                                <ComparisonRow label="Samples per Update" trpo="Single pass through data" ppo="Multiple epochs (K=3-10)" />
                                <ComparisonRow label="Implementation" trpo="Complex (Fisher, CG, backtrack)" ppo="Simple (~20 lines of core logic)" />
                                <ComparisonRow label="Monotonic Guarantee" trpo="Theoretically guaranteed" ppo="Empirically but not guaranteed" />
                                <ComparisonRow label="Wall-clock Speed" trpo="Slow (CG is expensive)" ppo="Fast (just gradient descent)" />
                                <ComparisonRow label="Used in RLHF?" trpo="Rarely" ppo="Standard (ChatGPT, Claude)" />
                                <ComparisonRow label="Scalability" trpo="Struggles at large scale" ppo="Scales to billions of params" />
                            </tbody>
                        </table>
                    </div>

                    <KeyInsight title="The Verdict" color="#14b8a6">
                        PPO delivers ~95% of TRPO's stability at ~10% of the implementation complexity. Its 
                        simplicity, scalability, and compatibility with modern deep learning infrastructure 
                        (distributed training, large batch sizes, Adam optimizer) make it the default choice 
                        for virtually all modern RL applications.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 7.9 TRAINING SIMULATOR ──────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <SectionTitle icon={<Play size={20} className="text-teal-400" />}>
                    7.9 — Training Dynamics Simulator
                </SectionTitle>

                <TRPOvsPPOSimulator />
            </motion.section>

            {/* ─── 7.10 GAE DEEP DIVE ──────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
            >
                <SectionTitle icon={<Sparkles size={20} className="text-teal-400" />}>
                    7.10 — GAE: Generalized Advantage Estimation
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Both TRPO and PPO rely on accurate advantage estimates. 
                        <strong className="text-white"> GAE(γ, λ)</strong> provides a family of estimators that 
                        smoothly interpolate between high-bias (TD residual) and high-variance (Monte Carlo return):
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">TD Residual (1-step advantage)</p>
                            <MathEquation formula="\delta_t^V = r_t + \gamma V(s_{t+1}) - V(s_t)" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">GAE(γ, λ)</p>
                            <MathEquation formula="\hat{A}_t^{\mathrm{GAE}} = \sum_{l=0}^{\infty}(\gamma\lambda)^l\,\delta_{t+l}^V" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Recursive Form (for Implementation)</p>
                            <MathEquation formula="\hat{A}_t = \delta_t + \gamma\lambda\,\hat{A}_{t+1}" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                            <span className="text-blue-400 font-mono font-bold">λ = 0</span>
                            <p className="text-slate-400 mt-1">TD residual only. Low variance, high bias.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-center">
                            <span className="text-teal-400 font-mono font-bold">λ = 0.95</span>
                            <p className="text-slate-400 mt-1">Sweet spot. Default for most PPO implementations.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                            <span className="text-purple-400 font-mono font-bold">λ = 1</span>
                            <p className="text-slate-400 mt-1">Full Monte Carlo. Low bias, high variance.</p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 7.11 IMPLEMENTATION DETAILS ─────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <SectionTitle icon={<Terminal size={20} className="text-teal-400" />}>
                    7.11 — PPO Implementation Details That Matter
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        The "implementation details" of PPO can significantly impact performance — sometimes 
                        more than the algorithm itself. Here are the critical tricks discovered by the community:
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                title: '1. Advantage Normalization',
                                desc: 'Normalize advantages per mini-batch: Â ← (Â − μ) / (σ + 1e-8). Stabilizes training across different reward scales.',
                                color: '#14b8a6'
                            },
                            {
                                title: '2. Value Function Clipping',
                                desc: 'Clip value predictions: V_clip = V_old + clip(V - V_old, -ε, ε). Prevents value function from changing too rapidly.',
                                color: '#f59e0b'
                            },
                            {
                                title: '3. Orthogonal Initialization',
                                desc: 'Initialize policy layers with orthogonal matrices (gain=√2 for hidden, 0.01 for output). Critical for initial exploration.',
                                color: '#8b5cf6'
                            },
                            {
                                title: '4. Reward Clipping / Normalization',
                                desc: 'Use a running mean/std to normalize rewards, or clip to [-10, 10]. Prevents gradient explosion from outlier rewards.',
                                color: '#ec4899'
                            },
                            {
                                title: '5. Learning Rate Annealing',
                                desc: 'Linearly decay the learning rate from α to 0 over training. Helps with fine-grained convergence at the end.',
                                color: '#3b82f6'
                            },
                            {
                                title: '6. Gradient Clipping',
                                desc: 'Clip gradient norm to max_grad_norm = 0.5. Prevents catastrophic updates from rare, high-variance batches.',
                                color: '#ef4444'
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: item.color + '08', border: `1px solid ${item.color}20` }}>
                                <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <div>
                                    <div className="text-sm font-semibold text-white">{item.title}</div>
                                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.section>

            {/* ─── 7.12 HISTORICAL CONTEXT & FRONTIER ──────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
            >
                <SectionTitle icon={<Sparkles size={20} className="text-teal-400" />}>
                    7.12 — PPO at the Frontier (2024–2025)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        PPO remains the backbone algorithm for cutting-edge AI systems:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'RLHF for LLMs', desc: 'InstructGPT, ChatGPT, and Claude all use PPO (or close variants) to align language models with human preferences via reward models.', color: '#14b8a6' },
                            { title: 'GRPO (DeepSeek)', desc: 'Group Relative Policy Optimization removes the critic entirely, using group-level advantage normalization — a PPO descendant for reasoning.', color: '#a855f7' },
                            { title: 'Robotics (RT-2, Mobile ALOHA)', desc: 'PPO fine-tunes vision-language-action models for dexterous manipulation, leveraging its stability with high-dimensional continuous actions.', color: '#f59e0b' },
                            { title: 'DPO & Beyond', desc: 'Direct Preference Optimization bypasses the reward model, but PPO remains competitive when online data collection is feasible.', color: '#ec4899' },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl border" style={{ backgroundColor: item.color + '08', borderColor: item.color + '25' }}>
                                <div className="text-sm font-bold mb-2" style={{ color: item.color }}>{item.title}</div>
                                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.section>

            {/* ─── KEY TAKEAWAYS ───────────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card className="space-y-5 border-teal-500/30 bg-teal-500/5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle size={20} className="text-teal-400" />
                        Chapter 7 Key Takeaways
                    </h3>
                    <div className="space-y-3">
                        {[
                            'Vanilla policy gradients are sensitive to step size — too large causes collapse, too small wastes samples.',
                            'The Fisher Information Matrix connects parameter-space and distribution-space geometry, enabling natural gradients.',
                            'TRPO enforces a hard KL constraint via conjugate gradient + line search, guaranteeing monotonic improvement.',
                            'PPO replaces the hard constraint with a clipped surrogate objective: simple, fast, and nearly as stable.',
                            'PPO-Clip bounds the importance ratio r(θ) to [1−ε, 1+ε], preventing destructive policy updates.',
                            'GAE(γ, λ) provides variance-bias tradeoff for advantage estimation; λ=0.95 is the standard default.',
                            'Implementation details (advantage normalization, gradient clipping, LR annealing) matter enormously.',
                            'PPO powers RLHF, robotics, and game AI — it is the most widely deployed RL algorithm as of 2025.',
                        ].map((point, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                                <span className="text-teal-500 font-bold flex-shrink-0">{i + 1}.</span>
                                <span className="text-slate-300">{point}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.section>

            {/* ─── FURTHER READING ─────────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
            >
                <Card className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Info size={18} className="text-teal-400" />
                        Further Reading
                    </h3>
                    <div className="space-y-2 text-sm text-slate-400">
                        <p>• Schulman, J. et al. (2015). "Trust Region Policy Optimization." ICML. <span className="text-slate-600">arXiv:1502.05477</span></p>
                        <p>• Schulman, J. et al. (2017). "Proximal Policy Optimization Algorithms." <span className="text-slate-600">arXiv:1707.06347</span></p>
                        <p>• Schulman, J. et al. (2016). "High-Dimensional Continuous Control Using GAE." ICLR. <span className="text-slate-600">arXiv:1506.02438</span></p>
                        <p>• Kakade, S. (2001). "A Natural Policy Gradient." NeurIPS.</p>
                        <p>• Engstrom, L. et al. (2020). "Implementation Matters in Deep Policy Gradients." ICLR.</p>
                        <p>• Huang, S. et al. (2022). "The 37 Implementation Details of PPO." ICLR Blog Track.</p>
                    </div>
                </Card>
            </motion.section>
        </div>
    );
};
