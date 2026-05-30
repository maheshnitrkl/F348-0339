import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Sliders,
    ArrowRight,
    Play,
    Pause,
    RotateCcw,
    Terminal,
    Sparkles,
    CheckCircle,
    Info,
    TrendingUp,
    AlertTriangle,
    Zap,
    Shield,
    Layers,
    Target,
    Activity
} from 'lucide-react';
import { MathEquation } from '../components/MathEquation';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#06b6d4' }) => (
    <div className="flex items-center gap-3 mb-6">
        {icon && <div className="p-2 rounded-xl" style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>{icon}</div>}
        <h2 className="text-2xl md:text-3xl font-bold text-white">{children}</h2>
    </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 ${className}`}>
        {children}
    </div>
);

const KeyInsight: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = '#06b6d4' }) => (
    <div className="flex gap-3 p-4 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '30' }}>
        <Sparkles size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <div>
            <span className="text-sm font-semibold block mb-1" style={{ color }}>{title}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
        </div>
    </div>
);

const AlgorithmBox: React.FC<{ title: string; steps: string[]; color?: string }> = ({ title, steps, color = '#06b6d4' }) => (
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

const ComparisonRow: React.FC<{ label: string; ddpg: string; td3: string; sac: string }> = ({ label, ddpg, td3, sac }) => (
    <tr className="border-b border-slate-800/50">
        <td className="py-3 px-4 text-sm font-medium text-slate-300">{label}</td>
        <td className="py-3 px-4 text-sm text-amber-300">{ddpg}</td>
        <td className="py-3 px-4 text-sm text-cyan-300">{td3}</td>
        <td className="py-3 px-4 text-sm text-purple-300">{sac}</td>
    </tr>
);


/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Pendulum Swing-Up Simulator
   ═══════════════════════════════════════════════════════════════════════ */

const PendulumSimulator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [algorithm, setAlgorithm] = useState<'random' | 'ddpg' | 'td3' | 'sac'>('sac');
    const [episode, setEpisode] = useState(0);
    const [totalReward, setTotalReward] = useState(0);
    const [step, setStep] = useState(0);

    // Pendulum state: angle (theta), angular velocity (omega)
    const stateRef = useRef({ theta: Math.PI, omega: 0 }); // starts hanging down
    const rewardRef = useRef(0);
    const frameRef = useRef<number | null>(null);
    const stepRef = useRef(0);

    const MAX_STEPS = 200;
    const DT = 0.05;
    const G = 9.81;
    const L = 1.0;
    const M = 1.0;
    const MAX_TORQUE = 2.0;

    // Simulated policy: quality improves with algorithm sophistication
    const getAction = useCallback((theta: number, omega: number, algo: string): number => {
        // Normalize angle to [-pi, pi]
        const th = ((theta + Math.PI) % (2 * Math.PI)) - Math.PI;

        if (algo === 'random') {
            return (Math.random() - 0.5) * 2 * MAX_TORQUE;
        }

        // Simple energy-based swing-up controller (simulates a learned policy)
        const energy = 0.5 * M * L * L * omega * omega - M * G * L * Math.cos(th);
        const targetEnergy = M * G * L; // energy at top

        let torque: number;

        if (algo === 'ddpg') {
            // DDPG-like: decent but noisy
            if (Math.abs(th) < 0.5) {
                torque = -8 * th - 2 * omega; // PD control near top
            } else {
                torque = omega * Math.sign(energy - targetEnergy) * 0.8;
            }
            torque += (Math.random() - 0.5) * 0.6; // exploration noise (OU-like)
        } else if (algo === 'td3') {
            // TD3-like: less noisy, more precise
            if (Math.abs(th) < 0.6) {
                torque = -10 * th - 3 * omega;
            } else {
                torque = omega * Math.sign(energy - targetEnergy) * 1.0;
            }
            torque += (Math.random() - 0.5) * 0.3; // clipped noise
        } else {
            // SAC-like: best exploration-exploitation, stochastic
            if (Math.abs(th) < 0.7) {
                torque = -12 * th - 3.5 * omega;
            } else {
                torque = omega * Math.sign(energy - targetEnergy) * 1.2;
            }
            // Entropy-driven: Gaussian exploration (smaller std when confident)
            const confidence = Math.max(0, 1 - Math.abs(th) / Math.PI);
            torque += (Math.random() - 0.5) * (0.5 - 0.4 * confidence);
        }

        return Math.max(-MAX_TORQUE, Math.min(MAX_TORQUE, torque));
    }, []);

    const physicsStep = useCallback((theta: number, omega: number, torque: number) => {
        // Simple pendulum dynamics: theta'' = (-3g/2L)*sin(theta) + (3/(mL^2))*torque
        const thetaDDot = (-3 * G / (2 * L)) * Math.sin(theta + Math.PI) + (3 / (M * L * L)) * torque;
        const newOmega = Math.max(-8, Math.min(8, omega + thetaDDot * DT));
        const newTheta = theta + newOmega * DT;
        // Reward: -(theta^2 + 0.1*omega^2 + 0.001*torque^2)
        const th = ((newTheta + Math.PI) % (2 * Math.PI)) - Math.PI;
        const reward = -(th * th + 0.1 * newOmega * newOmega + 0.001 * torque * torque);
        return { theta: newTheta, omega: newOmega, reward };
    }, []);

    const drawPendulum = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const armLen = 80;

        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        // Grid circles
        for (let r = 20; r <= 100; r += 20) {
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Target zone (top)
        ctx.strokeStyle = '#06b6d430';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - armLen - 15);
        ctx.lineTo(cx, cy - armLen + 15);
        ctx.stroke();
        ctx.setLineDash([]);

        // Goal indicator at top
        ctx.fillStyle = '#06b6d440';
        ctx.beginPath();
        ctx.arc(cx, cy - armLen, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#06b6d4';
        ctx.font = '10px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL', cx, cy - armLen - 14);

        // Pendulum arm
        const { theta } = stateRef.current;
        const endX = cx + armLen * Math.sin(theta);
        const endY = cy + armLen * Math.cos(theta); // +cos because 0 is down in physics

        // Arm shadow
        ctx.strokeStyle = '#06b6d420';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arm
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Pivot
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Bob
        const th = ((theta + Math.PI) % (2 * Math.PI)) - Math.PI;
        const closeness = 1 - Math.abs(th) / Math.PI;
        const r = Math.floor(6 + closeness * 180);
        const g = Math.floor(182 + closeness * 73);
        const b = Math.floor(212);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(endX, endY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // HUD
        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`θ = ${th.toFixed(2)} rad`, 10, 20);
        ctx.fillText(`ω = ${stateRef.current.omega.toFixed(2)} rad/s`, 10, 36);
        ctx.fillText(`Step: ${stepRef.current}/${MAX_STEPS}`, 10, 52);

        ctx.textAlign = 'right';
        const algoColors: Record<string, string> = { random: '#ef4444', ddpg: '#f59e0b', td3: '#06b6d4', sac: '#a855f7' };
        ctx.fillStyle = algoColors[algorithm] || '#64748b';
        ctx.fillText(algorithm.toUpperCase(), W - 10, 20);
        ctx.fillStyle = '#64748b';
        ctx.fillText(`R = ${rewardRef.current.toFixed(1)}`, W - 10, 36);
    }, [algorithm]);

    // Animation loop
    useEffect(() => {
        if (!isRunning) {
            drawPendulum();
            return;
        }

        let running = true;
        const loop = () => {
            if (!running) return;

            const s = stateRef.current;
            const action = getAction(s.theta, s.omega, algorithm);
            const result = physicsStep(s.theta, s.omega, action);

            stateRef.current = { theta: result.theta, omega: result.omega };
            rewardRef.current += result.reward;
            stepRef.current += 1;

            setTotalReward(rewardRef.current);
            setStep(stepRef.current);

            drawPendulum();

            if (stepRef.current >= MAX_STEPS) {
                setIsRunning(false);
                setEpisode(prev => prev + 1);
                return;
            }

            frameRef.current = requestAnimationFrame(loop);
        };

        frameRef.current = requestAnimationFrame(loop);
        return () => {
            running = false;
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isRunning, algorithm, getAction, physicsStep, drawPendulum]);

    // Initial draw
    useEffect(() => { drawPendulum(); }, [drawPendulum]);

    const reset = () => {
        setIsRunning(false);
        stateRef.current = { theta: Math.PI + (Math.random() - 0.5) * 0.5, omega: (Math.random() - 0.5) * 0.5 };
        rewardRef.current = 0;
        stepRef.current = 0;
        setTotalReward(0);
        setStep(0);
        setTimeout(() => drawPendulum(), 0);
    };

    return (
        <Card className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-cyan-400" />
                        Pendulum Swing-Up Simulator
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Compare how DDPG, TD3 and SAC control a continuous-action pendulum.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsRunning(!isRunning)}
                        disabled={step >= MAX_STEPS}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-40 transition-colors">
                        {isRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
                    </button>
                    <button onClick={reset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Algorithm selector */}
            <div className="flex gap-2 flex-wrap">
                {(['random', 'ddpg', 'td3', 'sac'] as const).map(algo => {
                    const colors: Record<string, string> = { random: '#ef4444', ddpg: '#f59e0b', td3: '#06b6d4', sac: '#a855f7' };
                    const isActive = algorithm === algo;
                    return (
                        <button key={algo} onClick={() => { setAlgorithm(algo); reset(); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
                            style={{
                                backgroundColor: isActive ? colors[algo] + '25' : '#1e293b',
                                border: `1px solid ${isActive ? colors[algo] + '60' : '#334155'}`,
                                color: isActive ? colors[algo] : '#64748b'
                            }}>
                            {algo.toUpperCase()}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-xl overflow-hidden border border-slate-800">
                    <canvas ref={canvasRef} width={400} height={300} className="w-full" />
                </div>
                <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-800/60">
                        <div className="text-xs text-slate-500 mb-0.5">Episode</div>
                        <div className="text-lg font-mono text-white">{episode}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/60">
                        <div className="text-xs text-slate-500 mb-0.5">Step</div>
                        <div className="text-lg font-mono text-white">{step}/{MAX_STEPS}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <div className="text-xs text-cyan-400 mb-0.5">Total Reward</div>
                        <div className="text-lg font-mono text-white">{totalReward.toFixed(1)}</div>
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">
                        The pendulum starts hanging <strong className="text-slate-300">down</strong> (θ≈π). 
                        The goal is to swing it <strong className="text-slate-300">up</strong> (θ=0) and balance 
                        using continuous torque ∈ [−2, 2].
                    </div>
                </div>
            </div>
        </Card>
    );
};


/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Noise Comparison Visualizer
   ═══════════════════════════════════════════════════════════════════════ */

const NoiseVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [noiseType, setNoiseType] = useState<'ou' | 'gaussian' | 'clipped'>('ou');
    const [sigma, setSigma] = useState(0.3);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const pad = { top: 20, right: 20, bottom: 35, left: 45 };
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

        // Zero line
        const zeroY = pad.top + plotH / 2;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad.left, zeroY); ctx.lineTo(W - pad.right, zeroY); ctx.stroke();

        const N = 200;
        const yScale = plotH / 4; // ±2 range
        const toX = (i: number) => pad.left + (i / N) * plotW;
        const toY = (v: number) => zeroY - v * yScale;

        // Generate noise samples
        const samples: number[] = [];
        let ouState = 0;
        const theta_ou = 0.15;
        const dt = 1;

        for (let i = 0; i < N; i++) {
            let noise: number;
            if (noiseType === 'ou') {
                ouState = ouState + theta_ou * (0 - ouState) * dt + sigma * Math.sqrt(dt) * (Math.random() * 2 - 1) * 1.2;
                noise = ouState;
            } else if (noiseType === 'gaussian') {
                // Box-Muller transform
                const u1 = Math.random();
                const u2 = Math.random();
                noise = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            } else {
                // Clipped Gaussian (TD3-style)
                const u1 = Math.random();
                const u2 = Math.random();
                noise = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                noise = Math.max(-0.5, Math.min(0.5, noise));
            }
            samples.push(noise);
        }

        // Draw noise signal
        const colors: Record<string, string> = { ou: '#f59e0b', gaussian: '#06b6d4', clipped: '#a855f7' };
        ctx.strokeStyle = colors[noiseType];
        ctx.lineWidth = 2;
        ctx.beginPath();
        samples.forEach((v, i) => {
            const x = toX(i);
            const y = toY(Math.max(-2, Math.min(2, v)));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Clipping bounds for TD3
        if (noiseType === 'clipped') {
            ctx.strokeStyle = '#a855f750';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(pad.left, toY(0.5)); ctx.lineTo(W - pad.right, toY(0.5)); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pad.left, toY(-0.5)); ctx.lineTo(W - pad.right, toY(-0.5)); ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#a855f7';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('c = 0.5', pad.left + 5, toY(0.5) - 4);
            ctx.fillText('c = -0.5', pad.left + 5, toY(-0.5) + 12);
        }

        // Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Time Step', W / 2, H - 6);

        ctx.textAlign = 'right';
        ctx.fillText('+2', pad.left - 6, pad.top + 6);
        ctx.fillText('0', pad.left - 6, zeroY + 4);
        ctx.fillText('-2', pad.left - 6, pad.top + plotH + 4);

        // Legend
        ctx.fillStyle = colors[noiseType];
        ctx.font = '11px Inter, system-ui';
        ctx.textAlign = 'left';
        const labels: Record<string, string> = { ou: 'Ornstein-Uhlenbeck (DDPG)', gaussian: 'Gaussian (uncorrelated)', clipped: 'Clipped Gaussian (TD3)' };
        ctx.fillText(`● ${labels[noiseType]}`, pad.left + 5, pad.top + 14);

    }, [noiseType, sigma]);

    return (
        <Card className="space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                Exploration Noise Comparison
            </h3>
            <p className="text-sm text-slate-400">Compare different noise processes used for exploration in continuous action spaces.</p>

            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex gap-2">
                    {(['ou', 'gaussian', 'clipped'] as const).map(t => {
                        const colors: Record<string, string> = { ou: '#f59e0b', gaussian: '#06b6d4', clipped: '#a855f7' };
                        const labels: Record<string, string> = { ou: 'OU (DDPG)', gaussian: 'Gaussian', clipped: 'Clipped (TD3)' };
                        return (
                            <button key={t} onClick={() => setNoiseType(t)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    backgroundColor: noiseType === t ? colors[t] + '20' : '#1e293b',
                                    border: `1px solid ${noiseType === t ? colors[t] + '60' : '#334155'}`,
                                    color: noiseType === t ? colors[t] : '#64748b'
                                }}>
                                {labels[t]}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                    <span className="text-xs text-slate-500">σ</span>
                    <input type="range" min={0.05} max={0.8} step={0.01} value={sigma}
                        onChange={e => setSigma(parseFloat(e.target.value))}
                        className="flex-1 accent-cyan-500" />
                    <span className="text-xs font-mono text-cyan-400 w-8">{sigma.toFixed(2)}</span>
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
                <canvas ref={canvasRef} width={700} height={220} className="w-full" />
            </div>
        </Card>
    );
};


/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Entropy Temperature Visualizer (SAC)
   ═══════════════════════════════════════════════════════════════════════ */

const EntropyTempVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [alpha, setAlpha] = useState(0.2);
    const [mu, setMu] = useState(0.5);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const pad = { top: 25, right: 20, bottom: 40, left: 50 };
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

        // Action range [-2, 2]
        const aMin = -2, aMax = 2;
        const toX = (a: number) => pad.left + ((a - aMin) / (aMax - aMin)) * plotW;

        // Gaussian PDF
        const gaussian = (x: number, mean: number, std: number) => {
            const z = (x - mean) / std;
            return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
        };

        // Draw PDFs for different alpha values
        const stds = [
            { std: Math.sqrt(alpha * 0.5), color: '#a855f7', label: `α=${alpha.toFixed(2)} (current)` },
            { std: Math.sqrt(0.01), color: '#06b6d440', label: 'α≈0 (greedy)' },
            { std: Math.sqrt(1.0), color: '#f59e0b40', label: 'α=1.0 (max entropy)' },
        ];

        // Find max PDF value for scaling
        const maxPdf = gaussian(mu, mu, stds[0].std);
        const toY = (p: number) => pad.top + plotH - (p / Math.max(maxPdf * 1.2, 0.1)) * plotH;

        stds.reverse().forEach(({ std, color, label }) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = color.includes('40') ? 1.5 : 2.5;
            if (color.includes('40')) ctx.setLineDash([4, 4]);

            ctx.beginPath();
            for (let px = 0; px <= plotW; px++) {
                const a = aMin + (px / plotW) * (aMax - aMin);
                const p = gaussian(a, mu, std);
                const y = toY(p);
                if (px === 0) ctx.moveTo(toX(a), y);
                else ctx.lineTo(toX(a), y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Fill under current distribution
        ctx.fillStyle = '#a855f710';
        ctx.beginPath();
        ctx.moveTo(toX(aMin), toY(0));
        for (let px = 0; px <= plotW; px++) {
            const a = aMin + (px / plotW) * (aMax - aMin);
            const p = gaussian(a, mu, stds[2].std);
            ctx.lineTo(toX(a), toY(p));
        }
        ctx.lineTo(toX(aMax), toY(0));
        ctx.closePath();
        ctx.fill();

        // Mean marker
        ctx.strokeStyle = '#a855f7';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(toX(mu), pad.top);
        ctx.lineTo(toX(mu), pad.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Action a', W / 2, H - 6);

        ctx.save();
        ctx.translate(14, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('π(a|s)', 0, 0);
        ctx.restore();

        // Tick labels
        ctx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const a = aMin + (i / 4) * (aMax - aMin);
            ctx.fillText(a.toFixed(1), toX(a), pad.top + plotH + 16);
        }

        // Legend
        ctx.font = '10px Inter, system-ui';
        ctx.textAlign = 'left';
        stds.reverse().forEach(({ color, label }, i) => {
            ctx.fillStyle = color.replace('40', '');
            ctx.fillText(`● ${label}`, W - pad.right - 180, pad.top + 14 + i * 16);
        });

    }, [alpha, mu]);

    return (
        <Card className="space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                SAC Entropy Temperature Explorer
            </h3>
            <p className="text-sm text-slate-400">Visualize how the temperature α controls the policy's stochasticity in SAC. Higher α → wider distribution → more exploration.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-slate-400 flex justify-between">
                        <span>Temperature α</span>
                        <span className="font-mono text-purple-400">{alpha.toFixed(2)}</span>
                    </label>
                    <input type="range" min={0.01} max={1.0} step={0.01} value={alpha}
                        onChange={e => setAlpha(parseFloat(e.target.value))}
                        className="w-full accent-purple-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-slate-400 flex justify-between">
                        <span>Mean Action μ</span>
                        <span className="font-mono text-cyan-400">{mu.toFixed(2)}</span>
                    </label>
                    <input type="range" min={-1.5} max={1.5} step={0.05} value={mu}
                        onChange={e => setMu(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500" />
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
                <canvas ref={canvasRef} width={700} height={280} className="w-full" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <div className="text-xs text-cyan-400">α → 0</div>
                    <div className="text-slate-300 mt-1">Deterministic (greedy)</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-xs text-purple-400">α = optimal</div>
                    <div className="text-slate-300 mt-1">Balanced explore/exploit</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-xs text-amber-400">α → ∞</div>
                    <div className="text-slate-300 mt-1">Maximum entropy (random)</div>
                </div>
            </div>
        </Card>
    );
};


/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: ContinuousControl Component
   ═══════════════════════════════════════════════════════════════════════ */

export const ContinuousControl: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-cyan-400 mb-4">
                    <Sliders size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 8</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-500 mb-4">
                    Continuous Action Spaces
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    From discrete action selection to continuous control: master DDPG, TD3, and SAC — 
                    the algorithms that enable robots to walk, drones to fly, and industrial systems 
                    to operate with precision.
                </p>
            </motion.div>

            {/* ─── 8.1 THE CONTINUOUS ACTION CHALLENGE ──────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<AlertTriangle size={20} className="text-cyan-400" />}>
                    8.1 — The Continuous Action Challenge
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        In many real-world control problems, actions are <strong className="text-white">continuous-valued</strong>: 
                        joint torques for a robot arm, throttle and steering for a vehicle, voltage levels for 
                        industrial control. DQN-style methods that enumerate actions become infeasible — 
                        you can't compute max<sub>a</sub> Q(s, a) when the action space is ℝ<sup>d</sup>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                                <AlertTriangle size={14} /> DQN Limitations
                            </div>
                            <p className="text-sm text-slate-400">
                                DQN outputs Q(s, a) for each discrete action. With continuous actions, 
                                the argmax requires solving an inner optimization problem at every step — 
                                computationally prohibitive.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <div className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                <Zap size={14} /> The Solution
                            </div>
                            <p className="text-sm text-slate-400">
                                Use a <strong>deterministic policy network</strong> μ(s) that directly outputs 
                                the continuous action, trained via the <strong>Deterministic Policy Gradient (DPG)</strong> theorem.
                            </p>
                        </div>
                    </div>

                    <KeyInsight title="Key Distinction">
                        Stochastic policies π(a|s) sample from a distribution (e.g., Gaussian). 
                        Deterministic policies μ(s) → a output a single action directly. 
                        The DPG theorem shows we can compute policy gradients for deterministic policies 
                        by backpropagating through the Q-function.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 8.2 DETERMINISTIC POLICY GRADIENT THEOREM ───────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Sparkles size={20} className="text-cyan-400" />}>
                    8.2 — The Deterministic Policy Gradient Theorem
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Silver et al. (2014) proved that even without stochasticity, we can compute the 
                        policy gradient for a deterministic policy μ<sub>θ</sub>(s):
                    </p>

                    <div className="p-5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-4">
                        <p className="text-sm font-bold text-cyan-400">Deterministic Policy Gradient (DPG) Theorem</p>
                        <MathEquation formula="\nabla_\theta J(\theta) = \mathbb{E}_{s \sim d^\mu}\!\left[\nabla_\theta \mu_\theta(s)\;\nabla_a Q^\mu(s, a)\Big|_{a = \mu_\theta(s)}\right]" />
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                        The gradient flows through two networks via the <strong className="text-white">chain rule</strong>:
                    </p>

                    <div className="flex items-center gap-3 flex-wrap justify-center py-4">
                        {['∇θ J', '=', '∇θ μθ(s)', '×', '∇a Q(s,a)|a=μ'].map((item, i) => (
                            <div key={i} className={`px-3 py-2 rounded-lg text-sm font-mono ${
                                i === 0 ? 'bg-cyan-500/20 text-cyan-300 font-bold' :
                                i === 2 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                                i === 4 ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                                'text-slate-500'
                            }`}>
                                {item}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <div className="text-sm font-bold text-amber-400 mb-2">∇<sub>θ</sub> μ<sub>θ</sub>(s)</div>
                            <p className="text-xs text-slate-400">
                                How the policy's output changes w.r.t. its parameters. Standard backprop through 
                                the actor network.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <div className="text-sm font-bold text-purple-400 mb-2">∇<sub>a</sub> Q(s, a)|<sub>a=μ</sub></div>
                            <p className="text-xs text-slate-400">
                                How the Q-value changes w.r.t. the action. Backprop through the critic network's 
                                action input.
                            </p>
                        </div>
                    </div>

                    <KeyInsight title="Efficiency Gain" color="#06b6d4">
                        DPG integrates over the <em>state space</em> only (not actions), requiring far fewer 
                        samples than stochastic PG which must integrate over both states and actions. 
                        This is why actor-critic methods for continuous control are so sample-efficient.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 8.3 DDPG ───────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Layers size={20} className="text-amber-400" />} color="#f59e0b">
                    8.3 — DDPG: Deep Deterministic Policy Gradient
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        <strong className="text-amber-300">DDPG</strong> (Lillicrap et al., 2016) combines 
                        the DPG theorem with the tricks from DQN: experience replay and target networks. 
                        It's essentially <em>"DQN for continuous actions."</em>
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">DDPG Architecture: Four Networks</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                {[
                                    { name: 'Actor μθ', desc: 's → a', color: '#f59e0b' },
                                    { name: 'Critic Qφ', desc: '(s, a) → Q', color: '#06b6d4' },
                                    { name: 'Target Actor μθ\'', desc: 'Slow copy', color: '#f59e0b80' },
                                    { name: 'Target Critic Qφ\'', desc: 'Slow copy', color: '#06b6d480' },
                                ].map((net, i) => (
                                    <div key={i} className="p-3 rounded-lg border" style={{ backgroundColor: net.color + '10', borderColor: net.color + '30' }}>
                                        <div className="text-xs font-bold" style={{ color: net.color.replace('80', '') }}>{net.name}</div>
                                        <div className="text-xs text-slate-400 mt-1">{net.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Critic (TD) Loss</p>
                            <MathEquation formula="L(\phi) = \mathbb{E}\!\left[\left(Q_\phi(s, a) - \left(r + \gamma\,Q_{\phi'}(s', \mu_{\theta'}(s'))\right)\right)^2\right]" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Actor Update (DPG)</p>
                            <MathEquation formula="\nabla_\theta J \approx \mathbb{E}\!\left[\nabla_\theta \mu_\theta(s)\;\nabla_a Q_\phi(s, a)\Big|_{a=\mu_\theta(s)}\right]" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Soft Target Update (Polyak Averaging)</p>
                            <MathEquation formula="\theta' \leftarrow \tau\,\theta + (1-\tau)\,\theta', \quad \phi' \leftarrow \tau\,\phi + (1-\tau)\,\phi' \quad (\tau = 0.005)" />
                        </div>
                    </div>

                    <AlgorithmBox
                        title="Algorithm: DDPG"
                        color="#f59e0b"
                        steps={[
                            'Initialize actor μ<sub>θ</sub>, critic Q<sub>φ</sub>, targets θ\' ← θ, φ\' ← φ',
                            'Initialize replay buffer D, OU noise process N',
                            'for each episode do:',
                            '&nbsp;&nbsp;Observe s, select a = μ<sub>θ</sub>(s) + N<sub>t</sub> (OU noise)',
                            '&nbsp;&nbsp;Execute a, observe r, s\', done',
                            '&nbsp;&nbsp;Store (s, a, r, s\', done) in D',
                            '&nbsp;&nbsp;Sample mini-batch B from D',
                            '&nbsp;&nbsp;y = r + γ(1-done)·Q<sub>φ\'</sub>(s\', μ<sub>θ\'</sub>(s\'))',
                            '&nbsp;&nbsp;Update critic: minimize (Q<sub>φ</sub>(s,a) - y)²',
                            '&nbsp;&nbsp;Update actor: maximize Q<sub>φ</sub>(s, μ<sub>θ</sub>(s))',
                            '&nbsp;&nbsp;Soft update: θ\' ← τθ + (1-τ)θ\', φ\' ← τφ + (1-τ)φ\'',
                        ]}
                    />

                    <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                        <div className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} /> DDPG's Weaknesses
                        </div>
                        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                            <li><strong className="text-slate-300">Q-value overestimation</strong>: The critic tends to overestimate Q, causing the actor to exploit errors</li>
                            <li><strong className="text-slate-300">Hyperparameter sensitivity</strong>: Very sensitive to learning rates, noise, and network architecture</li>
                            <li><strong className="text-slate-300">Brittle convergence</strong>: Often fails to learn or suddenly collapses mid-training</li>
                        </ul>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 8.4 TD3 ─────────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Shield size={20} className="text-cyan-400" />}>
                    8.4 — TD3: Twin Delayed DDPG
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        <strong className="text-cyan-300">TD3</strong> (Fujimoto et al., 2018) fixes DDPG's 
                        overestimation problem with three elegant tricks:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <div className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                <Layers size={14} /> 1. Twin Critics
                            </div>
                            <p className="text-sm text-slate-400 mb-3">
                                Maintain <strong className="text-slate-200">two independent Q-networks</strong> 
                                (Q<sub>φ₁</sub>, Q<sub>φ₂</sub>) and use the minimum for target computation:
                            </p>
                            <MathEquation formula="y = r + \gamma \min_{i=1,2} Q_{\phi_i'}(s', \tilde{a}')" />
                        </div>
                        <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <div className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                <Pause size={14} /> 2. Delayed Updates
                            </div>
                            <p className="text-sm text-slate-400 mb-3">
                                Update the actor (and targets) <strong className="text-slate-200">less frequently</strong> 
                                than the critic (every d steps, typically d=2):
                            </p>
                            <p className="text-xs text-slate-500 italic">
                                This ensures the critic has a more accurate Q before the actor exploits it.
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <div className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                <Activity size={14} /> 3. Target Smoothing
                            </div>
                            <p className="text-sm text-slate-400 mb-3">
                                Add <strong className="text-slate-200">clipped noise</strong> to target actions, 
                                acting as a regularizer:
                            </p>
                            <MathEquation formula="\tilde{a}' = \mu_{\theta'}(s') + \mathrm{clip}(\epsilon, -c, c)" />
                        </div>
                    </div>

                    <AlgorithmBox
                        title="Algorithm: TD3"
                        color="#06b6d4"
                        steps={[
                            'Initialize actor μ<sub>θ</sub>, critics Q<sub>φ₁</sub>, Q<sub>φ₂</sub>, targets θ\', φ₁\', φ₂\'',
                            'for each timestep do:',
                            '&nbsp;&nbsp;a = μ<sub>θ</sub>(s) + ε, ε ~ N(0, σ) (exploration noise)',
                            '&nbsp;&nbsp;Store (s, a, r, s\', done) in replay buffer D',
                            '&nbsp;&nbsp;Sample mini-batch B from D',
                            '&nbsp;&nbsp;ã\' = μ<sub>θ\'</sub>(s\') + clip(ε, -c, c), ε ~ N(0, σ̃)',
                            '&nbsp;&nbsp;y = r + γ · min(Q<sub>φ₁\'</sub>(s\', ã\'), Q<sub>φ₂\'</sub>(s\', ã\'))',
                            '&nbsp;&nbsp;Update both critics: minimize (Q<sub>φᵢ</sub>(s,a) - y)²',
                            '&nbsp;&nbsp;if t mod d == 0:  (delayed actor + target update)',
                            '&nbsp;&nbsp;&nbsp;&nbsp;Update actor: maximize Q<sub>φ₁</sub>(s, μ<sub>θ</sub>(s))',
                            '&nbsp;&nbsp;&nbsp;&nbsp;Soft update all targets: θ\', φ₁\', φ₂\'',
                        ]}
                    />

                    <KeyInsight title="Why Twin Critics Work" color="#06b6d4">
                        Taking min(Q₁, Q₂) systematically underestimates the Q-value, counteracting the 
                        overestimation bias from function approximation. This is analogous to Double DQN 
                        for the continuous case — and it works remarkably well in practice.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 8.5 SAC ─────────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Sparkles size={20} className="text-purple-400" />} color="#a855f7">
                    8.5 — SAC: Soft Actor-Critic
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        <strong className="text-purple-300">SAC</strong> (Haarnoja et al., 2018) fundamentally rethinks the 
                        objective: instead of maximizing expected return alone, it maximizes return 
                        <em> plus entropy</em>, yielding a <strong className="text-white">stochastic policy</strong> 
                        {' '}that naturally balances exploration and exploitation.
                    </p>

                    <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-4">
                        <p className="text-sm font-bold text-purple-400">Maximum Entropy RL Objective</p>
                        <MathEquation formula="J(\pi) = \sum_{t=0}^{T} \mathbb{E}_{(s_t, a_t) \sim \rho_\pi}\!\left[r(s_t, a_t) + \alpha\,\mathcal{H}\!\left(\pi(\cdot|s_t)\right)\right]" />
                        <p className="text-sm text-slate-400">
                            Where <MathEquation formula="\mathcal{H}(\pi(\cdot|s)) = -\mathbb{E}_{a \sim \pi}[\log \pi(a|s)]" /> is the 
                            entropy of the policy and α is the temperature parameter.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Soft Bellman Equation</p>
                            <MathEquation formula="Q^\pi(s, a) = r + \gamma\,\mathbb{E}_{s'}\!\left[V^\pi(s')\right], \quad V^\pi(s) = \mathbb{E}_{a \sim \pi}\!\left[Q^\pi(s,a) - \alpha \log \pi(a|s)\right]" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Critic Target (with Entropy)</p>
                            <MathEquation formula="y = r + \gamma\!\left(\min_{i=1,2} Q_{\phi_i'}(s', \tilde{a}') - \alpha \log \pi_\theta(\tilde{a}'|s')\right), \quad \tilde{a}' \sim \pi_\theta(\cdot|s')" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Actor Loss (KL Minimization)</p>
                            <MathEquation formula="J_\pi(\theta) = \mathbb{E}_{s \sim D}\!\left[\mathbb{E}_{a \sim \pi_\theta}\!\left[\alpha \log \pi_\theta(a|s) - Q_\phi(s, a)\right]\right]" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-2 font-medium">Automatic Temperature Tuning</p>
                            <MathEquation formula="J(\alpha) = \mathbb{E}_{a \sim \pi_t}\!\left[-\alpha \log \pi_t(a|s) - \alpha\,\bar{\mathcal{H}}\right]" />
                            <p className="text-xs text-slate-500 mt-1">
                                Where H̄ is the target entropy, typically set to −dim(A) for continuous actions.
                            </p>
                        </div>
                    </div>

                    <AlgorithmBox
                        title="Algorithm: SAC (with Auto-α)"
                        color="#a855f7"
                        steps={[
                            'Initialize policy π<sub>θ</sub>, critics Q<sub>φ₁</sub>, Q<sub>φ₂</sub>, targets φ₁\', φ₂\', α',
                            'Set target entropy H̄ = -dim(A)',
                            'for each timestep do:',
                            '&nbsp;&nbsp;a ~ π<sub>θ</sub>(·|s)  (sample from squashed Gaussian)',
                            '&nbsp;&nbsp;Store (s, a, r, s\', done) in replay buffer D',
                            '&nbsp;&nbsp;Sample mini-batch B from D',
                            '&nbsp;&nbsp;ã\' ~ π<sub>θ</sub>(·|s\'), compute log π<sub>θ</sub>(ã\'|s\')',
                            '&nbsp;&nbsp;y = r + γ(1-done)·(min Q<sub>φᵢ\'</sub>(s\', ã\') - α·log π(ã\'|s\'))',
                            '&nbsp;&nbsp;Update both critics: minimize (Q<sub>φᵢ</sub>(s,a) - y)²',
                            '&nbsp;&nbsp;Update actor: minimize α·log π<sub>θ</sub>(ã|s) - min Q<sub>φᵢ</sub>(s, ã)',
                            '&nbsp;&nbsp;Update α: minimize -α·(log π<sub>θ</sub>(ã|s) + H̄)',
                            '&nbsp;&nbsp;Soft update targets: φ₁\', φ₂\'',
                        ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <div className="text-sm font-bold text-purple-400 mb-2">Squashed Gaussian</div>
                            <p className="text-xs text-slate-400">
                                SAC uses a Gaussian distribution followed by a <code className="text-purple-300 bg-purple-500/10 px-1 rounded">tanh</code> squashing 
                                function to bound actions to [-1, 1]. The log-probability requires a change-of-variables 
                                correction: log π(a|s) = log μ(u|s) − Σ log(1 − tanh²(uᵢ))
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <div className="text-sm font-bold text-purple-400 mb-2">Reparameterization Trick</div>
                            <p className="text-xs text-slate-400">
                                To backprop through the stochastic sampling: a = tanh(μ<sub>θ</sub>(s) + σ<sub>θ</sub>(s) ⊙ ε), 
                                where ε ~ N(0, I). This makes the gradient estimator low-variance compared to REINFORCE.
                            </p>
                        </div>
                    </div>

                    <KeyInsight title="Why SAC Is the Gold Standard (2024–2025)" color="#a855f7">
                        SAC's entropy regularization provides <em>automatic exploration</em> without manual noise 
                        tuning, its twin critics prevent overestimation, and its automatic temperature α adjustment 
                        removes a critical hyperparameter. It consistently achieves SOTA on MuJoCo benchmarks 
                        and is the default algorithm for continuous control in robotics.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 8.6 NOISE VISUALIZER ────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Activity size={20} className="text-cyan-400" />}>
                    8.6 — Exploration Noise Comparison
                </SectionTitle>

                <Card className="space-y-4 mb-6">
                    <p className="text-slate-300 leading-relaxed">
                        Each algorithm handles exploration differently:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <span className="text-amber-400 font-bold">DDPG</span>
                            <p className="text-slate-400 mt-1">Ornstein-Uhlenbeck process — temporally correlated noise for smooth exploration.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <span className="text-cyan-400 font-bold">TD3</span>
                            <p className="text-slate-400 mt-1">Clipped Gaussian noise added to target actions for regularization.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <span className="text-purple-400 font-bold">SAC</span>
                            <p className="text-slate-400 mt-1">No external noise — exploration emerges from the entropy-maximizing stochastic policy.</p>
                        </div>
                    </div>
                </Card>

                <NoiseVisualizer />
            </motion.section>

            {/* ─── 8.7 ENTROPY TEMPERATURE VISUALIZER ──────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle icon={<Sparkles size={20} className="text-purple-400" />} color="#a855f7">
                    8.7 — SAC Entropy Temperature
                </SectionTitle>

                <EntropyTempVisualizer />
            </motion.section>

            {/* ─── 8.8 PENDULUM SIMULATOR ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <SectionTitle icon={<Target size={20} className="text-cyan-400" />}>
                    8.8 — Pendulum Swing-Up Simulator
                </SectionTitle>

                <PendulumSimulator />
            </motion.section>

            {/* ─── 8.9 HEAD-TO-HEAD COMPARISON ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <SectionTitle icon={<TrendingUp size={20} className="text-cyan-400" />}>
                    8.9 — DDPG vs TD3 vs SAC
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-3 px-4 text-sm font-bold text-slate-400">Property</th>
                                    <th className="py-3 px-4 text-sm font-bold text-amber-400">DDPG</th>
                                    <th className="py-3 px-4 text-sm font-bold text-cyan-400">TD3</th>
                                    <th className="py-3 px-4 text-sm font-bold text-purple-400">SAC</th>
                                </tr>
                            </thead>
                            <tbody>
                                <ComparisonRow label="Policy Type" ddpg="Deterministic" td3="Deterministic" sac="Stochastic (Gaussian)" />
                                <ComparisonRow label="Critics" ddpg="Single Q" td3="Twin Q (min)" sac="Twin Q (min)" />
                                <ComparisonRow label="Exploration" ddpg="OU noise (external)" td3="Gaussian (external)" sac="Entropy (internal)" />
                                <ComparisonRow label="Target Smoothing" ddpg="No" td3="Yes (clipped noise)" sac="N/A (stochastic)" />
                                <ComparisonRow label="Actor Update Freq" ddpg="Every step" td3="Every d steps" sac="Every step" />
                                <ComparisonRow label="Entropy Bonus" ddpg="None" td3="None" sac="α · H(π)" />
                                <ComparisonRow label="Auto Temperature" ddpg="N/A" td3="N/A" sac="Yes (dual gradient)" />
                                <ComparisonRow label="Hyperparameter Ease" ddpg="Very sensitive" td3="Moderate" sac="Robust (few knobs)" />
                                <ComparisonRow label="Sample Efficiency" ddpg="Moderate" td3="Good" sac="Best" />
                                <ComparisonRow label="Stability" ddpg="Poor" td3="Good" sac="Excellent" />
                            </tbody>
                        </table>
                    </div>

                    <KeyInsight title="Practical Recommendation" color="#06b6d4">
                        <strong>Start with SAC</strong> for most continuous control tasks — it's the most robust and 
                        requires the least tuning. Use TD3 when you need deterministic policies (e.g., for sim-to-real 
                        transfer where stochasticity is undesirable). Avoid DDPG unless you have a specific reason.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 8.10 IMPLEMENTATION TIPS ────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <SectionTitle icon={<Terminal size={20} className="text-cyan-400" />}>
                    8.10 — Implementation Best Practices
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        {[
                            { title: '1. Action Rescaling', desc: 'Networks output in [-1, 1] via tanh. Rescale to env bounds: a_env = low + (a + 1)/2 × (high - low).', color: '#06b6d4' },
                            { title: '2. Large Replay Buffers', desc: 'Use at least 1M transitions. Off-policy methods benefit enormously from diverse, decorrelated data.', color: '#f59e0b' },
                            { title: '3. Warm-up Period', desc: 'Collect 10-25K random transitions before training begins. Ensures diverse initial data for stable early gradients.', color: '#a855f7' },
                            { title: '4. Layer Normalization', desc: 'Apply LayerNorm (not BatchNorm) in critic networks. Helps with varying scale of state/action inputs.', color: '#ec4899' },
                            { title: '5. Network Architecture', desc: '2 hidden layers, 256 units each, ReLU activation. Bigger isn\'t always better for continuous control.', color: '#10b981' },
                            { title: '6. Reward Scaling', desc: 'Some envs need reward scaling (÷10 or ÷100). SAC\'s auto-α helps but extreme scales still cause issues.', color: '#ef4444' },
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

            {/* ─── KEY TAKEAWAYS ───────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="space-y-5 border-cyan-500/30 bg-cyan-500/5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle size={20} className="text-cyan-400" />
                        Chapter 8 Key Takeaways
                    </h3>
                    <div className="space-y-3">
                        {[
                            'Continuous action spaces require specialized algorithms — DQN cannot compute argmax over ℝᵈ.',
                            'The Deterministic Policy Gradient (DPG) theorem enables gradient computation by backprop through the Q-function.',
                            'DDPG combines DPG with experience replay and target networks but suffers from Q-value overestimation.',
                            'TD3 fixes DDPG with three tricks: twin critics (min Q), delayed actor updates, and target action smoothing.',
                            'SAC maximizes return + entropy, producing stochastic policies with automatic exploration-exploitation balance.',
                            'SAC\'s automatic temperature tuning (α) adapts exploration throughout training — fewer hyperparameters to tune.',
                            'The reparameterization trick enables low-variance gradients through stochastic sampling in SAC.',
                            'SAC is the recommended default for continuous control; TD3 when deterministic policies are needed.',
                        ].map((point, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                                <span className="text-cyan-500 font-bold flex-shrink-0">{i + 1}.</span>
                                <span className="text-slate-300">{point}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.section>

            {/* ─── FURTHER READING ─────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                <Card className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Info size={18} className="text-cyan-400" />
                        Further Reading
                    </h3>
                    <div className="space-y-2 text-sm text-slate-400">
                        <p>• Silver, D. et al. (2014). "Deterministic Policy Gradient Algorithms." ICML. <span className="text-slate-600">arXiv:1509.02971</span></p>
                        <p>• Lillicrap, T. et al. (2016). "Continuous Control with Deep Reinforcement Learning." ICLR. <span className="text-slate-600">arXiv:1509.02971</span></p>
                        <p>• Fujimoto, S. et al. (2018). "Addressing Function Approximation Error in Actor-Critic Methods." ICML. <span className="text-slate-600">arXiv:1802.09477</span></p>
                        <p>• Haarnoja, T. et al. (2018). "Soft Actor-Critic: Off-Policy Maximum Entropy Deep RL." ICML. <span className="text-slate-600">arXiv:1801.01290</span></p>
                        <p>• Haarnoja, T. et al. (2019). "Soft Actor-Critic Algorithms and Applications." <span className="text-slate-600">arXiv:1812.05905</span></p>
                        <p>• SpinningUp documentation by OpenAI — excellent DDPG, TD3, SAC implementations.</p>
                    </div>
                </Card>
            </motion.section>
        </div>
    );
};
