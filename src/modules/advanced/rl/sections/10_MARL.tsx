import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Activity,
    Play,
    Pause,
    RotateCcw,
    ArrowRight,
    Sparkles,
    Terminal,
    Info,
    AlertTriangle,
    Zap,
    CheckCircle,
    Network,
    Sliders,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const KeyInsight: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = '#f43f5e' }) => (
    <div className="flex gap-3 p-4 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '30' }}>
        <Sparkles size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <div>
            <span className="text-sm font-semibold block mb-1" style={{ color }}>{title}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
        </div>
    </div>
);

const AlgorithmBox: React.FC<{ title: string; steps: string[]; color?: string }> = ({ title, steps, color = '#f43f5e' }) => (
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

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Multi-Agent Predator-Prey Simulator
   ═══════════════════════════════════════════════════════════════════════ */

interface GridPos {
    r: number;
    c: number;
}

const GRID_SIZE = 6;

export const PredatorPreySimulator: React.FC = () => {
    const [algorithm, setAlgorithm] = useState<'iql' | 'ctde'>('ctde');
    const [pred1, setPred1] = useState<GridPos>({ r: 0, c: 0 });
    const [pred2, setPred2] = useState<GridPos>({ r: 5, c: 5 });
    const [prey, setPrey] = useState<GridPos>({ r: 2, c: 3 });
    const [stepsCount, setStepsCount] = useState<number>(0);
    const [episodeCount, setEpisodeCount] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [speedMs, setSpeedMs] = useState<number>(200);
    const [history, setHistory] = useState<number[]>([]);

    const resetEpisode = useCallback(() => {
        // Randomize positions, but keep them separated
        setPred1({ r: 0, c: 0 });
        setPred2({ r: 5, c: 5 });
        setPrey({ r: 2 + Math.floor(Math.random() * 2), c: 2 + Math.floor(Math.random() * 2) });
        setStepsCount(0);
    }, []);

    const resetFull = () => {
        setIsRunning(false);
        setHistory([]);
        setEpisodeCount(0);
        resetEpisode();
    };

    const dist = (p1: GridPos, p2: GridPos) => {
        return Math.abs(p1.r - p2.r) + Math.abs(p1.c - p2.c);
    };

    const getFleeMove = (preyPos: GridPos, p1: GridPos, p2: GridPos): { dr: number; dc: number } => {
        const moves = [
            { dr: -1, dc: 0 }, // Up
            { dr: 1, dc: 0 },  // Down
            { dr: 0, dc: -1 }, // Left
            { dr: 0, dc: 1 },  // Right
            { dr: 0, dc: 0 }   // Stay
        ];

        let bestMove = moves[4];
        let maxDist = -Infinity;

        moves.forEach(m => {
            const nextR = preyPos.r + m.dr;
            const nextC = preyPos.c + m.dc;
            
            // Check bounds
            if (nextR >= 0 && nextR < GRID_SIZE && nextC >= 0 && nextC < GRID_SIZE) {
                const nextPos = { r: nextR, c: nextC };
                const d1 = dist(nextPos, p1);
                const d2 = dist(nextPos, p2);
                const minD = Math.min(d1, d2); // distance to closest predator
                
                if (minD > maxDist) {
                    maxDist = minD;
                    bestMove = m;
                }
            }
        });

        // Add 20% randomness to simulate imperfect prey
        if (Math.random() < 0.2) {
            const validMoves = moves.filter(m => {
                const nr = preyPos.r + m.dr;
                const nc = preyPos.c + m.dc;
                return nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE;
            });
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        return bestMove;
    };

    const getPredMove = (predPos: GridPos, targetPos: GridPos): GridPos => {
        const moves = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 }
        ];

        let bestMove = { dr: 0, dc: 0 };
        let minDist = Infinity;

        moves.forEach(m => {
            const nr = predPos.r + m.dr;
            const nc = predPos.c + m.dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                const d = dist({ r: nr, c: nc }, targetPos);
                if (d < minDist) {
                    minDist = d;
                    bestMove = m;
                }
            }
        });

        return { r: predPos.r + bestMove.dr, c: predPos.c + bestMove.dc };
    };

    const stepSimulation = useCallback(() => {
        // 1. Move prey first (fleeing closest predator)
        const preyMove = getFleeMove(prey, pred1, pred2);
        const nextPrey = { r: prey.r + preyMove.dr, c: prey.c + preyMove.dc };

        // 2. Move predators
        let nextPred1: GridPos;
        let nextPred2: GridPos;

        if (algorithm === 'iql') {
            // Independent Q-learning: both predators target prey position directly
            nextPred1 = getPredMove(pred1, nextPrey);
            nextPred2 = getPredMove(pred2, nextPrey);
        } else {
            // Coordinated CTDE: 
            // Predator 1 chases the prey directly.
            // Predator 2 targets a surrounding coordinate: opposite side of the prey relative to Pred 1.
            const offsetR = nextPrey.r - pred1.r;
            const offsetC = nextPrey.c - pred1.c;
            
            // Surrounding target cell: project past the prey
            const targetR = Math.max(0, Math.min(GRID_SIZE - 1, nextPrey.r + Math.sign(offsetR)));
            const targetC = Math.max(0, Math.min(GRID_SIZE - 1, nextPrey.c + Math.sign(offsetC)));
            
            nextPred1 = getPredMove(pred1, nextPrey);
            
            // If Pred 1 is already very close or has same target, let Pred 2 block the secondary escape route
            const d1 = dist(pred1, nextPrey);
            if (d1 <= 2) {
                nextPred2 = getPredMove(pred2, { r: targetR, c: targetC });
            } else {
                nextPred2 = getPredMove(pred2, nextPrey);
            }
        }

        // Avoid predators occupying the exact same cell (unless they catch the prey)
        if (nextPred1.r === nextPred2.r && nextPred1.c === nextPred2.c) {
            const capturesPrey = (nextPred1.r === nextPrey.r && nextPred1.c === nextPrey.c);
            if (!capturesPrey) {
                // Predator 2 stays put or takes a random alternative move
                nextPred2 = { ...pred2 };
            }
        }

        setPrey(nextPrey);
        setPred1(nextPred1);
        setPred2(nextPred2);
        setStepsCount(prev => prev + 1);

        // Check capture condition: either predator occupies the same cell or is adjacent
        const captured1 = nextPred1.r === nextPrey.r && nextPred1.c === nextPrey.c;
        const captured2 = nextPred2.r === nextPrey.r && nextPred2.c === nextPrey.c;

        if (captured1 || captured2 || (dist(nextPred1, nextPrey) <= 1 && dist(nextPred2, nextPrey) <= 1)) {
            // Captured!
            setHistory(prev => [...prev.slice(-30), stepsCount + 1]);
            setEpisodeCount(prev => prev + 1);
            resetEpisode();
        } else if (stepsCount >= 100) {
            // Timeout
            setHistory(prev => [...prev.slice(-30), 100]);
            setEpisodeCount(prev => prev + 1);
            resetEpisode();
        }
    }, [pred1, pred2, prey, algorithm, stepsCount, resetEpisode]);

    // Loop effect
    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(stepSimulation, speedMs);
        return () => clearInterval(interval);
    }, [isRunning, speedMs, stepSimulation]);

    const runMultipleEpisodes = (n: number) => {
        setIsRunning(false);
        let localEp = episodeCount;
        const results: number[] = [];

        for (let i = 0; i < n; i++) {
            let p1 = { r: 0, c: 0 };
            let p2 = { r: 5, c: 5 };
            let pr = { r: 2 + Math.floor(Math.random() * 2), c: 2 + Math.floor(Math.random() * 2) };
            let steps = 0;
            const maxSteps = 100;

            while (steps < maxSteps) {
                // Move prey
                let bestMove = { dr: 0, dc: 0 };
                let maxD = -Infinity;
                const moves = [
                    { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
                    { dr: 0, dc: -1 }, { dr: 0, dc: 1 }, { dr: 0, dc: 0 }
                ];
                moves.forEach(m => {
                    const nr = pr.r + m.dr;
                    const nc = pr.c + m.dc;
                    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                        const d = Math.min(
                            Math.abs(nr - p1.r) + Math.abs(nc - p1.c),
                            Math.abs(nr - p2.r) + Math.abs(nc - p2.c)
                        );
                        if (d > maxD) { maxD = d; bestMove = m; }
                    }
                });
                
                // Imperfect prey simulation
                if (Math.random() < 0.2) {
                    const valids = moves.filter(m => pr.r + m.dr >= 0 && pr.r + m.dr < GRID_SIZE && pr.c + m.dc >= 0 && pr.c + m.dc < GRID_SIZE);
                    bestMove = valids[Math.floor(Math.random() * valids.length)];
                }
                
                pr = { r: pr.r + bestMove.dr, c: pr.c + bestMove.dc };

                // Move predators
                let np1: GridPos;
                let np2: GridPos;

                if (algorithm === 'iql') {
                    // Both chase
                    let bm1 = { dr: 0, dc: 0 }; let md1 = Infinity;
                    let bm2 = { dr: 0, dc: 0 }; let md2 = Infinity;
                    const pm = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];
                    pm.forEach(m => {
                        const nr = p1.r + m.dr; const nc = p1.c + m.dc;
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                            const d = Math.abs(nr - pr.r) + Math.abs(nc - pr.c);
                            if (d < md1) { md1 = d; bm1 = m; }
                        }
                    });
                    pm.forEach(m => {
                        const nr = p2.r + m.dr; const nc = p2.c + m.dc;
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                            const d = Math.abs(nr - pr.r) + Math.abs(nc - pr.c);
                            if (d < md2) { md2 = d; bm2 = m; }
                        }
                    });
                    np1 = { r: p1.r + bm1.dr, c: p1.c + bm1.dc };
                    np2 = { r: p2.r + bm2.dr, c: p2.c + bm2.dc };
                } else {
                    // Centralized Coordination
                    let bm1 = { dr: 0, dc: 0 }; let md1 = Infinity;
                    const pm = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];
                    pm.forEach(m => {
                        const nr = p1.r + m.dr; const nc = p1.c + m.dc;
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                            const d = Math.abs(nr - pr.r) + Math.abs(nc - pr.c);
                            if (d < md1) { md1 = d; bm1 = m; }
                        }
                    });
                    np1 = { r: p1.r + bm1.dr, c: p1.c + bm1.dc };

                    const offsetR = pr.r - p1.r;
                    const offsetC = pr.c - p1.c;
                    const tr = Math.max(0, Math.min(GRID_SIZE - 1, pr.r + Math.sign(offsetR)));
                    const tc = Math.max(0, Math.min(GRID_SIZE - 1, pr.c + Math.sign(offsetC)));
                    
                    const d1 = Math.abs(p1.r - pr.r) + Math.abs(p1.c - pr.c);
                    const target = d1 <= 2 ? { r: tr, c: tc } : pr;

                    let bm2 = { dr: 0, dc: 0 }; let md2 = Infinity;
                    pm.forEach(m => {
                        const nr = p2.r + m.dr; const nc = p2.c + m.dc;
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                            const d = Math.abs(nr - target.r) + Math.abs(nc - target.c);
                            if (d < md2) { md2 = d; bm2 = m; }
                        }
                    });
                    np2 = { r: p2.r + bm2.dr, c: p2.c + bm2.dc };
                }

                if (np1.r === np2.r && np1.c === np2.c) {
                    if (!(np1.r === pr.r && np1.c === pr.c)) {
                        np2 = { ...p2 };
                    }
                }

                p1 = np1;
                p2 = np2;
                steps++;

                const c1 = p1.r === pr.r && p1.c === pr.c;
                const c2 = p2.r === pr.r && p2.c === pr.c;
                const sandwich = (Math.abs(p1.r - pr.r) + Math.abs(p1.c - pr.c) <= 1) && (Math.abs(p2.r - pr.r) + Math.abs(p2.c - pr.c) <= 1);

                if (c1 || c2 || sandwich) {
                    results.push(steps);
                    break;
                }
            }
            if (steps >= maxSteps) {
                results.push(maxSteps);
            }
            localEp++;
        }

        setHistory(prev => [...prev.slice(-(30 - n)), ...results]);
        setEpisodeCount(localEp);
        resetEpisode();
    };

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-rose-500" />
                        Multi-Agent Pursuit Gridworld
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Observe how Independent Q-learning predators fail to trap the prey compared to coordinated (CTDE) agents.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsRunning(!isRunning)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors">
                        {isRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
                    </button>
                    <button onClick={stepSimulation} disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-colors">
                        Step
                    </button>
                    <button onClick={() => runMultipleEpisodes(10)} disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-40 transition-colors">
                        Fast +10 Ep.
                    </button>
                    <button onClick={resetFull}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Config & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Coordination Scheme
                    </label>
                    <div className="flex gap-2">
                        {(['iql', 'ctde'] as const).map(mode => (
                            <button key={mode} onClick={() => { setAlgorithm(mode); resetFull(); }}
                                className={`flex-1 py-1 px-3 rounded-lg text-xs font-mono font-bold transition-all ${algorithm === mode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                {mode === 'iql' ? 'IQL (Selfish)' : 'CTDE (Coordinated)'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Simulation Speed
                    </label>
                    <div className="flex gap-2">
                        {[300, 200, 80].map((ms, idx) => {
                            const labels = ['Slow', 'Medium', 'Fast'];
                            return (
                                <button key={ms} onClick={() => setSpeedMs(ms)}
                                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all ${speedMs === ms ? 'bg-slate-700 text-white border border-slate-600' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                    {labels[idx]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Episode</span>
                        <span className="text-sm font-mono font-bold text-white">{episodeCount}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Steps Taken</span>
                        <span className="text-sm font-mono font-bold text-white">{stepsCount}</span>
                    </div>
                </div>
            </div>

            {/* Arena & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* 6x6 Arena */}
                <div className="lg:col-span-3 flex justify-center">
                    <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative w-full aspect-square max-w-[340px]">
                        {Array.from({ length: GRID_SIZE }).map((_, r) =>
                            Array.from({ length: GRID_SIZE }).map((_, c) => {
                                const isPred1 = pred1.r === r && pred1.c === c;
                                const isPred2 = pred2.r === r && pred2.c === c;
                                const isPrey = prey.r === r && prey.c === c;
                                
                                return (
                                    <div
                                        key={`${r}_${c}`}
                                        className="relative flex items-center justify-center rounded bg-slate-900 border border-slate-800/50 aspect-square text-xs font-mono font-bold"
                                    >
                                        {/* Grid gridlines background */}
                                        <div className="absolute inset-1 rounded bg-slate-950/40" />

                                        {isPrey && (
                                            <motion.div
                                                layoutId="prey"
                                                className="w-7 h-7 rounded-full bg-emerald-500/90 border border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/40 text-[10px] z-10"
                                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                            >
                                                🐭
                                            </motion.div>
                                        )}

                                        {isPred1 && (
                                            <motion.div
                                                layoutId="pred1"
                                                className="w-7 h-7 rounded-full bg-rose-500 border border-white flex items-center justify-center shadow-lg shadow-rose-500/50 text-[10px] z-20"
                                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                            >
                                                🔴1
                                            </motion.div>
                                        )}

                                        {isPred2 && (
                                            <motion.div
                                                layoutId="pred2"
                                                className="w-7 h-7 rounded-full bg-rose-600 border border-white flex items-center justify-center shadow-lg shadow-rose-600/50 text-[10px] z-20"
                                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                            >
                                                🔴2
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Efficiency Graph */}
                <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex-1">
                        <h4 className="text-sm font-semibold text-white">Capture Efficiency Graph</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Fewer steps to capture indicates superior cooperation. Coordinated agents trap the prey quickly, while independent agents chase standard paths and suffer from collision blocks.
                        </p>

                        {/* Chart */}
                        <div className="h-32 w-full border-b border-l border-slate-800 relative mt-4">
                            {history.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600">
                                    No capture trials run yet.
                                </div>
                            ) : (
                                <svg className="w-full h-full overflow-visible">
                                    <line x1="0" y1="20" x2="100%" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                                    <line x1="0" y1="64" x2="100%" y2="64" stroke="#1e293b" strokeDasharray="3,3" />
                                    <line x1="0" y1="108" x2="100%" y2="108" stroke="#1e293b" strokeDasharray="3,3" />

                                    <path
                                        d={history.map((val, idx) => {
                                            const x = (idx / Math.max(1, history.length - 1)) * 100;
                                            const y = 120 - Math.min(100, (val / 60) * 100);
                                            return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}`;
                                        }).join(' ')}
                                        fill="none"
                                        stroke="#f43f5e"
                                        strokeWidth="2"
                                    />
                                    {history.map((val, idx) => {
                                        const x = (idx / Math.max(1, history.length - 1)) * 100;
                                        const y = 120 - Math.min(100, (val / 60) * 100);
                                        return (
                                            <circle
                                                key={idx}
                                                cx={`${x}%`}
                                                cy={y}
                                                r="3"
                                                fill="#ffffff"
                                                stroke="#f43f5e"
                                                strokeWidth="1.5"
                                            />
                                        );
                                    })}
                                </svg>
                            )}
                            <span className="absolute left-1 top-1 text-[9px] text-slate-600 font-mono">60 steps</span>
                            <span className="absolute left-1 bottom-1 text-[9px] text-slate-600 font-mono">0 steps</span>
                            <span className="absolute right-1 bottom-1 text-[9px] text-slate-600 font-mono">Trial: {episodeCount}</span>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900/60">
                        <div className="flex gap-2 items-center text-rose-400 font-bold mb-1">
                            <Info size={12} />
                            <span>Capture Rule</span>
                        </div>
                        Prey is captured when any predator occupies its cell, or when both predators surround it closely on adjacent tiles. Coordinated mode blocks prey exit routes.
                    </div>
                </div>

            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: QMIX Monotonicity Architecture Explorer
   ═══════════════════════════════════════════════════════════════════════ */

export const QMIXExplorer: React.FC = () => {
    const [q1, setQ1] = useState<number>(4.0);
    const [q2, setQ2] = useState<number>(-2.0);
    const [stateS, setStateS] = useState<number>(5.0); // global state

    // Hypernetworks generate weights that MUST be non-negative
    // Let's define them as absolute functions or softplus-like
    const w1 = Math.max(0.01, Math.abs(stateS - 3) / 4 + 0.2);
    const w2 = Math.max(0.01, Math.abs(7 - stateS) / 4 + 0.1);
    
    // State dependent bias V(s)
    const biasV = (stateS - 5) * 1.5;
    
    // Q_tot calculation
    const qTot = w1 * q1 + w2 * q2 + biasV;

    return (
        <Card className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders size={18} className="text-rose-500" />
                    QMIX Monotonicity Architecture Explorer
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    Interact with QMIX utility weights and check how global state hypernetworks feed non-negative values to verify monotonicity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inputs block */}
                <div className="space-y-5 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-2">Sliders Panel</span>
                    
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 flex justify-between">
                            <span>Agent 1 Utility ($Q_1$)</span>
                            <span className="font-mono text-white">{q1.toFixed(1)}</span>
                        </label>
                        <input type="range" min={-10} max={10} step={0.5} value={q1}
                            onChange={e => setQ1(parseFloat(e.target.value))}
                            className="w-full accent-rose-500" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 flex justify-between">
                            <span>Agent 2 Utility ($Q_2$)</span>
                            <span className="font-mono text-white">{q2.toFixed(1)}</span>
                        </label>
                        <input type="range" min={-10} max={10} step={0.5} value={q2}
                            onChange={e => setQ2(parseFloat(e.target.value))}
                            className="w-full accent-rose-500" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 flex justify-between">
                            <span>Global State ($S$)</span>
                            <span className="font-mono text-purple-400">{stateS.toFixed(1)}</span>
                        </label>
                        <input type="range" min={0} max={10} step={0.5} value={stateS}
                            onChange={e => setStateS(parseFloat(e.target.value))}
                            className="w-full accent-purple-500" />
                    </div>
                </div>

                {/* Architecture visualization */}
                <div className="md:col-span-2 flex flex-col justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">Hypernetwork Flow</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={10} /> Monotonicity Met: Yes
                        </span>
                    </div>

                    {/* Network flow drawing */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs py-2">
                        <div className="p-3 bg-slate-900 rounded border border-slate-800 flex flex-col justify-between">
                            <span className="text-slate-500 block uppercase font-mono text-[9px]">Local Utilities</span>
                            <div className="space-y-2 mt-2">
                                <div className="p-1.5 rounded bg-slate-950 font-mono">
                                    Q1 = <span className="text-white font-bold">{q1.toFixed(1)}</span>
                                </div>
                                <div className="p-1.5 rounded bg-slate-950 font-mono">
                                    Q2 = <span className="text-white font-bold">{q2.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-900 rounded border border-slate-800 flex flex-col justify-between">
                            <span className="text-slate-500 block uppercase font-mono text-[9px]">Hypernets (S)</span>
                            <div className="space-y-2 mt-2 font-mono text-[11px]">
                                <div className="p-1 rounded bg-purple-950/40 text-purple-300">
                                    w1 = {w1.toFixed(2)}
                                </div>
                                <div className="p-1 rounded bg-purple-950/40 text-purple-300">
                                    w2 = {w2.toFixed(2)}
                                </div>
                                <div className="p-1 rounded bg-slate-950 text-slate-400">
                                    V(s) = {biasV.toFixed(1)}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-rose-500/10 rounded border border-rose-500/25 flex flex-col justify-between">
                            <span className="text-rose-400 block uppercase font-mono text-[9px]">Mixing Net</span>
                            <div className="mt-4 font-mono">
                                <div className="text-[10px] text-slate-500">Q_tot value</div>
                                <div className="text-lg font-bold text-white mt-1">
                                    {qTot.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monotonicity proof */}
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 text-xs space-y-1.5 text-slate-400">
                        <span className="text-white font-semibold block">Derivative Monotonicity Check:</span>
                        <div className="flex gap-4 font-mono text-[11px]">
                            <div>
                                <MathEquation formula="\frac{\partial Q_{tot}}{\partial Q_1} = w_1 = " /> <span className="text-emerald-400 font-bold">{w1.toFixed(2)}</span> &ge; 0
                            </div>
                            <div>
                                <MathEquation formula="\frac{\partial Q_{tot}}{\partial Q_2} = w_2 = " /> <span className="text-emerald-400 font-bold">{w2.toFixed(2)}</span> &ge; 0
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                            Because weights <MathEquation formula="w_1" /> and <MathEquation formula="w_2" /> are forced to be non-negative (via absolute operations in our hypernetwork), increasing individual agent action values (<MathEquation formula="Q_1" /> or <MathEquation formula="Q_2" />) is guaranteed to never decrease the joint value estimate (<MathEquation formula="Q_{tot}" />).
                        </p>
                    </div>
                </div>

            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: MARL Component
   ═══════════════════════════════════════════════════════════════════════ */

export const MARL: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-rose-400 mb-4">
                    <Users size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 10</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-rose-500 mb-4">
                    Multi-Agent Reinforcement Learning
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Step beyond single-agent environments: master the dynamics of cooperative teams and competitive 
                    adversaries. Explore Markov games, decentralized execution parameters, and value factorization.
                </p>
            </motion.div>

            {/* ─── 10.1 THE MULTI-AGENT TRANSITION ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<Users size={20} className="text-rose-400" />}>
                    10.1 — The Multi-Agent Transition
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        In single-agent RL, the environment is stationary (from the agent's perspective, state transition distributions remain constant). Once we introduce multiple learning agents, the environment becomes **non-stationary**: an agent's optimal action at step $t$ changes because other agents are updating their policies.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Non-Stationarity</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Because other agents update policies concurrently, transition probabilities $P(s' \mid s, a)$ change over time, breaking the theoretical convergence guarantees of single-agent methods (like Q-learning).
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Joint Action Explosion</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Fully centralized approaches model the joint action space <MathEquation formula="\mathbf{A} = A_1 \times \dots \times A_N" />. This space scales exponentially with the number of agents, leading to extreme sample complexity.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-sm font-bold text-white block">Credit Assignment</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                In cooperative tasks with a single shared team reward, it is difficult to determine which agent's actions contributed to a success or failure (the multi-agent credit assignment problem).
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 10.2 STOCHASTIC GAMES ──────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Network size={20} className="text-rose-400" />}>
                    10.2 — Stochastic Games & Game Theory
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        To model multi-agent interactions formally, we transition from Markov Decision Processes (MDPs) to **Stochastic Games** (also known as Markov Games).
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">Formal Definition</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                A Stochastic Game is defined by a tuple:
                            </p>
                            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                                <MathEquation formula="\mathcal{M} = \left( N, \mathcal{S}, \{ \mathcal{A}_i \}_{i=1}^N, \mathcal{P}, \{ \mathcal{R}_i \}_{i=1}^N, \gamma \right)" block />
                            </div>
                            <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2">
                                <li><strong><MathEquation formula="N" /></strong> is the set of agents.</li>
                                <li><strong><MathEquation formula="\mathcal{S}" /></strong> is the global state space.</li>
                                <li><strong><MathEquation formula="\mathcal{A}_i" /></strong> is the local action space of agent $i$. The joint action is <MathEquation formula="\mathbf{a} = (a_1, \dots, a_N) \in \mathbf{\mathcal{A}}" />.</li>
                                <li><strong><MathEquation formula="\mathcal{P}(s' \mid s, \mathbf{a})" /></strong> is the transition probability function, dependent on the joint action.</li>
                                <li><strong><MathEquation formula="\mathcal{R}_i(s, \mathbf{a})" /></strong> is the reward function for agent $i$.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">Nash Equilibrium in Markov Games</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                A joint policy <MathEquation formula="\mathbf{\pi}^* = (\pi_1^*, \dots, \pi_N^*)" /> is in a **Nash Equilibrium** if no agent can unilaterally change their policy to increase their expected return. Formally, for all agents $i$:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                                <MathEquation formula="V_i^{\mathbf{\pi}^*}(s) \ge V_i^{(\pi_i, \mathbf{\pi}_{-i}^*)}(s) \quad \forall s \in \mathcal{S}, \pi_i" block />
                                <p className="text-[10px] text-slate-500 mt-2 text-center">
                                    where <MathEquation formula="\mathbf{\pi}_{-i}^*" /> denotes the policies of all agents *except* agent $i$.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 10.3 CTDE PARADIGM ─────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Sliders size={20} className="text-rose-400" />}>
                    10.3 — Centralized Training with Decentralized Execution
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        To resolve non-stationarity without suffering from joint action space explosion during deployment, modern MARL utilizes the **Centralized Training with Decentralized Execution (CTDE)** paradigm.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-rose-400 uppercase font-bold block">1. Centralized Training</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                During offline training, agents can share weights, local observations, chosen actions, and global environment states. Centralized value networks or critics are updated using joint data, providing stationary targets.
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-rose-400 uppercase font-bold block">2. Decentralized Execution</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                During online execution/deployment, the centralized critic is discarded. Each agent operates independently. Their policy network maps only local observations $o_i$ (or historical memory) to their local action $a_i$, requiring zero real-time communication.
                            </p>
                        </div>
                    </div>

                    <KeyInsight title="Why Simple Independent Q-Learning (IQL) Fails">
                        In Independent Q-Learning, each agent treats others as static parts of the environment. If two agents learn simultaneously, the environment dynamics keep shifting. Thus, IQL policies often fail to converge and get stuck in local optima (like colliding in narrow corridors).
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 10.4 PREDATOR PREY SIMULATOR ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Activity size={20} className="text-rose-400" />}>
                    10.4 — Coordinated Pursuit Demonstration
                </SectionTitle>
                <PredatorPreySimulator />
            </motion.section>

            {/* ─── 10.5 VALUE FACTORIZATION (QMIX) ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Sliders size={20} className="text-rose-400" />}>
                    10.5 — Value Factorization (VDN & QMIX)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        In cooperative MARL, team members receive a shared reward <MathEquation formula="r_{tot}" />. To train local policies decentralized, we must factorize the global value estimate <MathEquation formula="Q_{tot}(\mathbf{s}, \mathbf{a})" /> into individual utilities <MathEquation formula="Q_i(s_i, a_i)" />.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-rose-400 uppercase font-bold block">Value Decomposition Networks (VDN)</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                VDN assumes individual Q-values combine additively. While simple, it cannot model complex interactions where agent actions depend non-linearly on the global state.
                            </p>
                            <div className="pt-2">
                                <MathEquation formula="Q_{tot}(\mathbf{s}, \mathbf{a}) = \sum_{i=1}^N Q_i(s_i, a_i)" block />
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                            <span className="text-xs font-mono text-rose-400 uppercase font-bold block">QMIX (Monotonic Factorization)</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                QMIX relaxes VDN's additive assumption. It requires that the argmax of the joint Q-value matches the set of individual argmaxes. This is guaranteed if the relationship is monotonic:
                            </p>
                            <div className="pt-2">
                                <MathEquation formula="\frac{\partial Q_{tot}(\mathbf{s}, \mathbf{a})}{\partial Q_i(s_i, a_i)} \ge 0 \quad \forall i \in \{1, \dots, N\}" block />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-md font-bold text-white">How QMIX Enforces Monotonicity</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            QMIX passes individual utilities <MathEquation formula="Q_i" /> through a **Mixing Network** to output <MathEquation formula="Q_{tot}" />. The weights of this mixing network are generated by **Hypernetworks** taking the global state <MathEquation formula="S" /> as input. To satisfy the monotonicity constraint, these weights are passed through an absolute value activation, forcing them to be strictly non-negative.
                        </p>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 10.6 QMIX VISUALIZER ───────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Activity size={20} className="text-rose-400" />}>
                    10.6 — QMIX Architecture & Parameter Explorer
                </SectionTitle>
                <QMIXExplorer />
            </motion.section>

            {/* ─── 10.7 MADDPG ────────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle icon={<Network size={20} className="text-rose-400" />}>
                    10.7 — Multi-Agent Deep Deterministic Policy Gradients (MADDPG)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        For continuous action spaces, value factorization methods (like QMIX) cannot be easily applied. Instead, **MADDPG** (Lowe et al., 2017) extends DDPG to multi-agent environments using a centralized critic framework.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The MADDPG Architecture</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Each agent $i$ has:
                            </p>
                            <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2">
                                <li>A decentralized actor policy network <MathEquation formula="\mu_i(o_i)" /> that maps only local observation $o_i$ to continuous action $a_i$.</li>
                                <li>A centralized critic network <MathEquation formula="Q_i^\mu(\mathbf{x}, a_1, \dots, a_N)" /> that takes global state information <MathEquation formula="\mathbf{x}" /> and the actions of all agents as input.</li>
                            </ul>
                            <KeyInsight title="Variance Reduction">
                                Because the critic evaluates joint actions directly, the gradients computed for actor policies account for other agents' concurrent updates, eliminating non-stationarity during training.
                            </KeyInsight>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">Actor Policy Gradient Update</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                The actor is trained by backpropagating gradients from the centralized critic:
                            </p>
                            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                                <MathEquation formula="\nabla_{\theta_i} J(\theta_i) = \mathbb{E}_{\mathbf{x}, \mathbf{a} \sim \mathcal{D}} \left[ \nabla_{\theta_i} \mu_i(a_i | o_i) \nabla_{a_i} Q_i^\mu(\mathbf{x}, a_1, \dots, a_N) \Big|_{a_i = \mu_i(o_i)} \right]" block />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                where <MathEquation formula="\mathcal{D}" /> is a centralized replay buffer storing tuples of <MathEquation formula="(\mathbf{x}, \mathbf{x}', o_1, \dots, o_N, a_1, \dots, a_N, r_1, \dots, r_N)" />.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 10.8 MARL ALGORITHMS COMPARISON ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <SectionTitle icon={<Sliders size={20} className="text-rose-400" />}>
                    10.8 — MARL Algorithm Comparisons
                </SectionTitle>

                <Card className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-800/80 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 px-4">Algorithm</th>
                                <th className="pb-3 px-4">Action Space</th>
                                <th className="pb-3 px-4">Paradigm</th>
                                <th className="pb-3 px-4">Factorization Constraint</th>
                                <th className="pb-3 px-4">Setting</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-sm">
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">IQL</td>
                                <td className="py-4 px-4 text-slate-400">Discrete/Continuous</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Decentralized Train & Exec</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">None (No Centralization)</td>
                                <td className="py-4 px-4 text-slate-400">Any (Cooperative/Mixed)</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">VDN</td>
                                <td className="py-4 px-4 text-slate-400">Discrete</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">CTDE</td>
                                <td className="py-4 px-4 text-purple-400">Additive: <MathEquation formula="Q_{tot} = \sum Q_i" /></td>
                                <td className="py-4 px-4 text-slate-400">Cooperative</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">QMIX</td>
                                <td className="py-4 px-4 text-slate-400">Discrete</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">CTDE</td>
                                <td className="py-4 px-4 text-purple-400">Monotonic: <MathEquation formula="\frac{\partial Q_{tot}}{\partial Q_i} \ge 0" /></td>
                                <td className="py-4 px-4 text-slate-400">Cooperative</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">MADDPG</td>
                                <td className="py-4 px-4 text-slate-400">Continuous</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">CTDE (Central Critic / Local Actor)</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">None (Joint Action Critic)</td>
                                <td className="py-4 px-4 text-slate-400">Any (Cooperative/Mixed)</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">COMA</td>
                                <td className="py-4 px-4 text-slate-400">Discrete</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">CTDE (Counterfactual Actor-Critic)</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">None (Marginalized Baseline)</td>
                                <td className="py-4 px-4 text-slate-400">Cooperative</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
            </motion.section>

        </div>
    );
};
