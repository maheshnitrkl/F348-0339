import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Compass,
    Database,
    Sliders,
    Cpu,
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
    HelpCircle,
    Network,
    TrendingUp,
    ChevronRight,
    BookOpen
} from 'lucide-react';
import { MathEquation } from '../components/MathEquation';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#a855f7' }) => (
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

const KeyInsight: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ title, children, color = '#a855f7' }) => (
    <div className="flex gap-3 p-4 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '30' }}>
        <Sparkles size={18} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <div>
            <span className="text-sm font-semibold block mb-1" style={{ color }}>{title}</span>
            <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
        </div>
    </div>
);

const AlgorithmBox: React.FC<{ title: string; steps: string[]; color?: string }> = ({ title, steps, color = '#a855f7' }) => (
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
   INTERACTIVE: Dyna-Q Gridworld Explorer
   ═══════════════════════════════════════════════════════════════════════ */

interface GridCell {
    row: number;
    col: number;
}

const DYNA_WALLS = [
    { r: 1, c: 2 },
    { r: 2, c: 2 },
    { r: 3, c: 2 },
    { r: 4, c: 2 },
    { r: 4, c: 3 },
    { r: 4, c: 4 },
];

const START_CELL: GridCell = { row: 5, col: 0 };
const GOAL_CELL: GridCell = { row: 0, col: 5 };
const ROWS = 6;
const COLS = 6;

const isWall = (r: number, c: number) => {
    return DYNA_WALLS.some(w => w.r === r && w.c === c);
};

export const DynaQGridworld: React.FC = () => {
    const [planningSteps, setPlanningSteps] = useState<number>(5);
    const [agentPos, setAgentPos] = useState<GridCell>(START_CELL);
    const [stepsCount, setStepsCount] = useState<number>(0);
    const [episodeCount, setEpisodeCount] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [speedMs, setSpeedMs] = useState<number>(150);
    const [lastPlanningUpdates, setLastPlanningUpdates] = useState<GridCell[]>([]);
    
    // Q-table: Q[row][col][action] where action is 0:Up, 1:Down, 2:Left, 3:Right
    const qTableRef = useRef<number[][][]>(
        Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => [0, 0, 0, 0])
        )
    );
    
    // Model transitions: model[`${r}_${c}_${a}`] = { nextR, nextC, reward }
    const modelRef = useRef<Record<string, { nextR: number; nextC: number; reward: number }>>({});
    // Set of visited state-actions: array of { r, c, a }
    const visitedSARef = useRef<{ r: number; c: number; a: number }[]>([]);
    // Historical performance: list of steps per episode
    const [episodeHistory, setEpisodeHistory] = useState<number[]>([]);

    const alpha = 0.1;
    const gamma = 0.95;
    const epsilon = 0.1;

    // Directions: 0: Up, 1: Down, 2: Left, 3: Right
    const ACTIONS = [
        { dr: -1, dc: 0, label: '↑' },
        { dr: 1, dc: 0, label: '↓' },
        { dr: 0, dc: -1, label: '←' },
        { dr: 0, dc: 1, label: '→' }
    ];

    const resetAgent = useCallback(() => {
        setAgentPos(START_CELL);
        setStepsCount(0);
    }, []);

    const resetFull = () => {
        setIsRunning(false);
        qTableRef.current = Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => [0, 0, 0, 0])
        );
        modelRef.current = {};
        visitedSARef.current = [];
        setEpisodeHistory([]);
        setEpisodeCount(0);
        setLastPlanningUpdates([]);
        resetAgent();
    };

    const getBestAction = (r: number, c: number): number => {
        const qVals = qTableRef.current[r][c];
        let maxVal = -Infinity;
        let bestAct = 0;
        // Break ties randomly
        const candidates: number[] = [];
        
        for (let a = 0; a < 4; a++) {
            if (qVals[a] > maxVal) {
                maxVal = qVals[a];
                candidates.length = 0;
                candidates.push(a);
            } else if (qVals[a] === maxVal) {
                candidates.push(a);
            }
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const stepSimulation = useCallback(() => {
        const r = agentPos.row;
        const c = agentPos.col;

        if (r === GOAL_CELL.row && c === GOAL_CELL.col) {
            // Already at goal, shouldn't happen but fallback
            resetAgent();
            return;
        }

        // Action selection (epsilon-greedy)
        let action: number;
        if (Math.random() < epsilon) {
            action = Math.floor(Math.random() * 4);
        } else {
            action = getBestAction(r, c);
        }

        const dir = ACTIONS[action];
        let nextR = r + dir.dr;
        let nextC = c + dir.dc;

        // Boundaries and wall collision
        if (nextR < 0 || nextR >= ROWS || nextC < 0 || nextC >= COLS || isWall(nextR, nextC)) {
            nextR = r;
            nextC = c;
        }

        // Reward structure: Sutton's standard gridworld: +1 at goal, 0 otherwise
        // Let's use +10 at Goal, 0 otherwise to make value gradients clearly visible
        const isGoal = nextR === GOAL_CELL.row && nextC === GOAL_CELL.col;
        const reward = isGoal ? 10 : 0;

        // 1. Direct Q-learning Update
        const currentQ = qTableRef.current[r][c][action];
        const nextMaxQ = isGoal ? 0 : Math.max(...qTableRef.current[nextR][nextC]);
        qTableRef.current[r][c][action] = currentQ + alpha * (reward + gamma * nextMaxQ - currentQ);

        // 2. Model learning
        const saKey = `${r}_${c}_${action}`;
        if (!modelRef.current[saKey]) {
            visitedSARef.current.push({ r, c, a: action });
        }
        modelRef.current[saKey] = { nextR, nextC, reward };

        // 3. Planning Loop
        const planningUpdates: GridCell[] = [];
        const numPlanning = Math.min(planningSteps, visitedSARef.current.length);
        
        for (let p = 0; p < numPlanning; p++) {
            // Pick random previously visited state-action
            const randomIdx = Math.floor(Math.random() * visitedSARef.current.length);
            const sa = visitedSARef.current[randomIdx];
            
            // Query model
            const mKey = `${sa.r}_${sa.c}_${sa.a}`;
            const outcome = modelRef.current[mKey];
            
            if (outcome) {
                const targetMaxQ = (outcome.nextR === GOAL_CELL.row && outcome.nextC === GOAL_CELL.col) 
                    ? 0 
                    : Math.max(...qTableRef.current[outcome.nextR][outcome.nextC]);
                
                const qSA = qTableRef.current[sa.r][sa.c][sa.a];
                qTableRef.current[sa.r][sa.c][sa.a] = qSA + alpha * (outcome.reward + gamma * targetMaxQ - qSA);
                
                planningUpdates.push({ row: sa.r, col: sa.c });
            }
        }
        
        setLastPlanningUpdates(planningUpdates);
        setStepsCount(prev => prev + 1);

        if (isGoal) {
            // Episode finished
            setEpisodeHistory(prev => [...prev.slice(-30), stepsCount + 1]); // keep last 30
            setEpisodeCount(prev => prev + 1);
            resetAgent();
        } else {
            setAgentPos({ row: nextR, col: nextC });
        }
    }, [agentPos, planningSteps, stepsCount, resetAgent]);

    // Play loop
    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            stepSimulation();
        }, speedMs);
        return () => clearInterval(interval);
    }, [isRunning, speedMs, stepSimulation]);

    const runMultipleEpisodes = (n: number) => {
        setIsRunning(false);
        let currentPos = { ...agentPos };
        let localSteps = stepsCount;
        let localEpisode = episodeCount;
        const newHistory: number[] = [];

        for (let ep = 0; ep < n; ep++) {
            let steps = 0;
            const maxAllowedSteps = 200; // prevent infinite loops
            
            while (steps < maxAllowedSteps) {
                const r = currentPos.row;
                const c = currentPos.col;
                
                let action: number;
                if (Math.random() < epsilon) {
                    action = Math.floor(Math.random() * 4);
                } else {
                    action = getBestAction(r, c);
                }

                const dir = ACTIONS[action];
                let nextR = r + dir.dr;
                let nextC = c + dir.dc;

                if (nextR < 0 || nextR >= ROWS || nextC < 0 || nextC >= COLS || isWall(nextR, nextC)) {
                    nextR = r;
                    nextC = c;
                }

                const isGoal = nextR === GOAL_CELL.row && nextC === GOAL_CELL.col;
                const reward = isGoal ? 10 : 0;

                // Update Q
                const currentQ = qTableRef.current[r][c][action];
                const nextMaxQ = isGoal ? 0 : Math.max(...qTableRef.current[nextR][nextC]);
                qTableRef.current[r][c][action] = currentQ + alpha * (reward + gamma * nextMaxQ - currentQ);

                // Update Model
                const saKey = `${r}_${c}_${action}`;
                if (!modelRef.current[saKey]) {
                    visitedSARef.current.push({ r, c, a: action });
                }
                modelRef.current[saKey] = { nextR, nextC, reward };

                // Planning
                const numPlanning = Math.min(planningSteps, visitedSARef.current.length);
                for (let p = 0; p < numPlanning; p++) {
                    const randomIdx = Math.floor(Math.random() * visitedSARef.current.length);
                    const sa = visitedSARef.current[randomIdx];
                    const outcome = modelRef.current[`${sa.r}_${sa.c}_${sa.a}`];
                    if (outcome) {
                        const targetMaxQ = (outcome.nextR === GOAL_CELL.row && outcome.nextC === GOAL_CELL.col) ? 0 : Math.max(...qTableRef.current[outcome.nextR][outcome.nextC]);
                        const qSA = qTableRef.current[sa.r][sa.c][sa.a];
                        qTableRef.current[sa.r][sa.c][sa.a] = qSA + alpha * (outcome.reward + gamma * targetMaxQ - qSA);
                    }
                }

                steps++;
                if (isGoal) {
                    newHistory.push(steps);
                    localEpisode++;
                    currentPos = { ...START_CELL };
                    break;
                } else {
                    currentPos = { row: nextR, col: nextC };
                }
            }
        }
        
        setEpisodeHistory(prev => [...prev.slice(-(30 - n)), ...newHistory]);
        setEpisodeCount(localEpisode);
        setAgentPos(START_CELL);
        setStepsCount(0);
        setLastPlanningUpdates([]);
    };

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-purple-400" />
                        Dyna-Q Gridworld Interactive Simulator
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Watch how planning steps (simulated experiences) propagate state-action values backward.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsRunning(!isRunning)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                        {isRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
                    </button>
                    <button onClick={stepSimulation} disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-colors">
                        Step
                    </button>
                    <button onClick={() => runMultipleEpisodes(10)} disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 disabled:opacity-40 transition-colors">
                        Fast +10 Ep.
                    </button>
                    <button onClick={resetFull}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Settings panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Planning Steps ($N$) per Environment Step
                    </label>
                    <div className="flex gap-2">
                        {[0, 5, 50].map(val => (
                            <button key={val} onClick={() => setPlanningSteps(val)}
                                className={`flex-1 py-1 px-3 rounded-lg text-xs font-mono font-bold transition-all ${planningSteps === val ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                {val === 0 ? '0 (Model-Free)' : `N = ${val}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Simulation Speed
                    </label>
                    <div className="flex gap-2">
                        {[300, 150, 50].map((ms, idx) => {
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
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Steps in Ep.</span>
                        <span className="text-sm font-mono font-bold text-white">{stepsCount}</span>
                    </div>
                </div>
            </div>

            {/* Simulation Canvas / Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* 6x6 Grid visualization */}
                <div className="lg:col-span-3 flex justify-center">
                    <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative w-full aspect-square max-w-[340px]">
                        {Array.from({ length: ROWS }).map((_, r) =>
                            Array.from({ length: COLS }).map((_, c) => {
                                const wall = isWall(r, c);
                                const isStart = r === START_CELL.row && c === START_CELL.col;
                                const isGoal = r === GOAL_CELL.row && c === GOAL_CELL.col;
                                const isAgent = r === agentPos.row && c === agentPos.col;
                                
                                // Color strength based on Max Q value
                                const qVals = qTableRef.current[r][c];
                                const maxQ = Math.max(...qVals);
                                const intensity = maxQ > 0 ? Math.min(0.8, maxQ / 10) : 0;
                                
                                // Best action indicator arrow
                                const bestActIdx = getBestAction(r, c);
                                const showArrow = maxQ > 0.01 && !wall && !isGoal;
                                const arrow = ACTIONS[bestActIdx].label;

                                // Has this cell been selected in recent planning step?
                                const planned = lastPlanningUpdates.some(cell => cell.row === r && cell.col === c);

                                return (
                                    <div
                                        key={`${r}_${c}`}
                                        className={`relative flex items-center justify-center rounded transition-all select-none aspect-square text-xs font-mono font-bold
                                            ${wall ? 'bg-slate-800 text-slate-600' : 'bg-slate-900 border border-slate-800/50'}
                                        `}
                                        style={{
                                            backgroundColor: wall 
                                                ? undefined 
                                                : intensity > 0 
                                                    ? `rgba(168, 85, 247, ${intensity})` 
                                                    : undefined,
                                            boxShadow: planned ? 'inset 0 0 8px rgba(192, 132, 252, 0.9)' : undefined
                                        }}
                                    >
                                        {/* Grid labels */}
                                        {isStart && <span className="absolute top-1 left-1 text-[9px] text-slate-500 font-sans">START</span>}
                                        {isGoal && <span className="absolute top-1 left-1 text-[9px] text-purple-300 font-sans">GOAL</span>}
                                        
                                        {!wall && !isGoal && showArrow && (
                                            <span className="text-[14px] text-white/60">{arrow}</span>
                                        )}

                                        {isGoal && <span className="text-amber-400 font-bold">🏆</span>}
                                        {isStart && !isAgent && <span className="text-slate-400">S</span>}

                                        {/* Agent marker */}
                                        {isAgent && (
                                            <motion.div 
                                                layoutId="grid_agent"
                                                className="w-6 h-6 rounded-full bg-purple-500 border border-white flex items-center justify-center shadow-lg shadow-purple-500/50 z-10"
                                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            >
                                                🤖
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Performance chart & Info */}
                <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex-1">
                        <h4 className="text-sm font-semibold text-white">Sample Efficiency Graph</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Fewer steps per episode indicates faster path finding. Notice how planning ($N=50$) reduces steps drastically after 1 episode!
                        </p>

                        {/* Custom SVG Learning Curve */}
                        <div className="h-32 w-full border-b border-l border-slate-800 relative mt-4">
                            {episodeHistory.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600">
                                    No episodes completed yet.
                                </div>
                            ) : (
                                <svg className="w-full h-full overflow-visible">
                                    {/* Grid Lines */}
                                    <line x1="0" y1="20" x2="100%" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                                    <line x1="0" y1="64" x2="100%" y2="64" stroke="#1e293b" strokeDasharray="3,3" />
                                    <line x1="0" y1="108" x2="100%" y2="108" stroke="#1e293b" strokeDasharray="3,3" />

                                    {/* Data path */}
                                    <path
                                        d={episodeHistory.map((val, idx) => {
                                            const x = (idx / Math.max(1, episodeHistory.length - 1)) * 100;
                                            // Max steps height scale = 150
                                            const y = 120 - Math.min(100, (val / 120) * 100);
                                            return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}`;
                                        }).join(' ')}
                                        fill="none"
                                        stroke="#a855f7"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Data dots */}
                                    {episodeHistory.map((val, idx) => {
                                        const x = (idx / Math.max(1, episodeHistory.length - 1)) * 100;
                                        const y = 120 - Math.min(100, (val / 120) * 100);
                                        return (
                                            <circle
                                                key={idx}
                                                cx={`${x}%`}
                                                cy={y}
                                                r="3"
                                                fill="#ffffff"
                                                stroke="#a855f7"
                                                strokeWidth="1.5"
                                            />
                                        );
                                    })}
                                </svg>
                            )}
                            
                            {/* Legend labels */}
                            <span className="absolute left-1 top-1 text-[9px] text-slate-600 font-mono">120 steps</span>
                            <span className="absolute left-1 bottom-1 text-[9px] text-slate-600 font-mono">0 steps</span>
                            <span className="absolute right-1 bottom-1 text-[9px] text-slate-600 font-mono">Ep: {episodeCount}</span>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900/60">
                        <div className="flex gap-2 items-center text-purple-400 font-bold mb-1">
                            <Info size={12} />
                            <span>Planning Visualization</span>
                        </div>
                        Grid cells flashing with a <strong className="text-purple-300">purple border glow</strong> show where model transitions are actively simulated and planned. Larger $N$ updates values instantly!
                    </div>
                </div>

            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: MCTS Tree Visualizer
   ═══════════════════════════════════════════════════════════════════════ */

interface MCTSNode {
    id: string;
    label: string;
    parent: string | null;
    x: number;
    y: number;
    n: number; // visit count
    w: number; // total reward
    q: number; // average value
    terminalReward?: number;
    children: string[];
}

const INITIAL_TREE_NODES: Record<string, MCTSNode> = {
    root: { id: 'root', label: 'Root', parent: null, x: 250, y: 30, n: 0, w: 0, q: 0, children: ['A', 'B'] },
    A: { id: 'A', label: 'A', parent: 'root', x: 130, y: 110, n: 0, w: 0, q: 0, children: ['A1', 'A2'] },
    B: { id: 'B', label: 'B', parent: 'root', x: 370, y: 110, n: 0, w: 0, q: 0, children: ['B1', 'B2'] },
    A1: { id: 'A1', label: 'A1 (10)', parent: 'A', x: 70, y: 190, n: 0, w: 0, q: 0, terminalReward: 10, children: [] },
    A2: { id: 'A2', label: 'A2 (2)', parent: 'A', x: 190, y: 190, n: 0, w: 0, q: 0, terminalReward: 2, children: [] },
    B1: { id: 'B1', label: 'B1 (-5)', parent: 'B', x: 310, y: 190, n: 0, w: 0, q: 0, terminalReward: -5, children: [] },
    B2: { id: 'B2', label: 'B2 (8)', parent: 'B', x: 430, y: 190, n: 0, w: 0, q: 0, terminalReward: 8, children: [] },
};

type MCTSPhase = 'idle' | 'selection' | 'expansion' | 'simulation' | 'backprop';

export const MCTSTreeVisualizer: React.FC = () => {
    const [tree, setTree] = useState<Record<string, MCTSNode>>(INITIAL_TREE_NODES);
    const [phase, setPhase] = useState<MCTSPhase>('idle');
    const [selectedPath, setSelectedPath] = useState<string[]>([]);
    const [activeNode, setActiveNode] = useState<string | null>(null);
    const [rolloutReward, setRolloutReward] = useState<number | null>(null);
    const [iterationCount, setIterationCount] = useState<number>(0);
    const [log, setLog] = useState<string[]>(['Click "Next Step" to start MCTS search.']);

    const C = 1.41; // Exploration constant

    const getUCB = (node: MCTSNode, parentNode: MCTSNode): number => {
        if (node.n === 0) return Infinity;
        return node.q + C * Math.sqrt(Math.log(parentNode.n) / node.n);
    };

    const addLog = (msg: string) => {
        setLog(prev => [msg, ...prev.slice(0, 7)]);
    };

    const resetTree = () => {
        setTree(JSON.parse(JSON.stringify(INITIAL_TREE_NODES)));
        setPhase('idle');
        setSelectedPath([]);
        setActiveNode(null);
        setRolloutReward(null);
        setIterationCount(0);
        setLog(['Tree statistics reset. Click "Next Step" to begin.']);
    };

    // Performs one step of MCTS cycle
    const nextStep = () => {
        if (phase === 'idle' || phase === 'backprop') {
            // Start Selection
            setPhase('selection');
            setRolloutReward(null);
            
            // Traverse tree using UCB
            const path: string[] = ['root'];
            let current = tree['root'];
            
            addLog(`Selection started from Root (N=${current.n}).`);

            while (current.children.length > 0) {
                // If any child has 0 visits, selection stops and we will expand one
                const unvisitedChildren = current.children.filter(cid => tree[cid].n === 0);
                if (unvisitedChildren.length > 0) {
                    addLog(`Found unvisited child node: ${unvisitedChildren[0]}. Halting Selection.`);
                    break;
                }

                // All children visited, choose child with max UCB
                let bestChildId = current.children[0];
                let bestValue = -Infinity;
                
                current.children.forEach(cid => {
                    const val = getUCB(tree[cid], current);
                    if (val > bestValue) {
                        bestValue = val;
                        bestChildId = cid;
                    }
                });

                path.push(bestChildId);
                addLog(`Selected child ${bestChildId} with highest UCB.`);
                current = tree[bestChildId];
            }
            
            setSelectedPath(path);
            setActiveNode(path[path.length - 1]);
            addLog(`Selected path: ${path.join(' ➔ ')}`);
        } 
        else if (phase === 'selection') {
            // Expansion
            setPhase('expansion');
            const currNode = tree[activeNode!];
            
            if (currNode.children.length > 0) {
                // Find unvisited child
                const unvisited = currNode.children.filter(cid => tree[cid].n === 0);
                const nextToExpand = unvisited[0]; // expand the first one
                
                setSelectedPath(prev => [...prev, nextToExpand]);
                setActiveNode(nextToExpand);
                addLog(`Expanded tree node: ${nextToExpand}`);
            } else {
                // It is already a leaf node (A1, A2, B1, B2)
                addLog(`Node ${currNode.id} is a terminal leaf node. Direct evaluation.`);
            }
        } 
        else if (phase === 'expansion') {
            // Simulation (Rollout)
            setPhase('simulation');
            const currNode = tree[activeNode!];
            
            // In our toy tree, we simply extract the terminal value of the leaf
            const reward = currNode.terminalReward ?? 0;
            setRolloutReward(reward);
            addLog(`Simulation rollout from ${currNode.id} yielded reward R = ${reward}`);
        } 
        else if (phase === 'simulation') {
            // Backpropagation
            setPhase('backprop');
            const reward = rolloutReward ?? 0;
            
            setTree(prev => {
                const nextTree = { ...prev };
                selectedPath.forEach(nid => {
                    const node = { ...nextTree[nid] };
                    node.n += 1;
                    node.w += reward;
                    node.q = node.w / node.n;
                    nextTree[nid] = node;
                });
                return nextTree;
            });
            
            addLog(`Backpropagated R = ${reward} along path. Updates completed.`);
            setIterationCount(prev => prev + 1);
        }
    };

    // Runs a complete cycle (4 phases) instantly
    const runFullIteration = () => {
        // Selection
        let path: string[] = ['root'];
        let current = tree['root'];
        
        while (current.children.length > 0) {
            const unvisited = current.children.filter(cid => tree[cid].n === 0);
            if (unvisited.length > 0) break;

            let bestChild = current.children[0];
            let bestValue = -Infinity;
            current.children.forEach(cid => {
                const val = getUCB(tree[cid], current);
                if (val > bestValue) {
                    bestValue = val;
                    bestChild = cid;
                }
            });
            path.push(bestChild);
            current = tree[bestChild];
        }

        // Expansion
        let expandedId = path[path.length - 1];
        if (tree[expandedId].children.length > 0) {
            const unvisited = tree[expandedId].children.filter(cid => tree[cid].n === 0);
            if (unvisited.length > 0) {
                expandedId = unvisited[0];
                path.push(expandedId);
            }
        }

        // Simulation
        const reward = tree[expandedId].terminalReward ?? 0;

        // Backprop
        setTree(prev => {
            const nextTree = { ...prev };
            path.forEach(nid => {
                const node = { ...nextTree[nid] };
                node.n += 1;
                node.w += reward;
                node.q = node.w / node.n;
                nextTree[nid] = node;
            });
            return nextTree;
        });

        setSelectedPath(path);
        setActiveNode(expandedId);
        setRolloutReward(reward);
        setPhase('backprop');
        setIterationCount(prev => prev + 1);
        addLog(`Full MCTS iteration completed (R = ${reward}).`);
    };

    const runMultipleIterations = (count: number) => {
        setIsRunning(true);
        // We will execute them synchronously with state
        let currentTree = { ...tree };
        
        for (let iter = 0; iter < count; iter++) {
            let path: string[] = ['root'];
            let current = currentTree['root'];
            
            while (current.children.length > 0) {
                const unvisited = current.children.filter(cid => currentTree[cid].n === 0);
                if (unvisited.length > 0) break;

                let bestChild = current.children[0];
                let bestValue = -Infinity;
                
                // inline UCB calculator
                current.children.forEach(cid => {
                    const child = currentTree[cid];
                    const val = child.n === 0 ? Infinity : child.q + C * Math.sqrt(Math.log(current.n) / child.n);
                    if (val > bestValue) {
                        bestValue = val;
                        bestChild = cid;
                    }
                });
                
                path.push(bestChild);
                current = currentTree[bestChild];
            }

            let expandedId = path[path.length - 1];
            if (currentTree[expandedId].children.length > 0) {
                const unvisited = currentTree[expandedId].children.filter(cid => currentTree[cid].n === 0);
                if (unvisited.length > 0) {
                    expandedId = unvisited[0];
                    path.push(expandedId);
                }
            }

            const reward = currentTree[expandedId].terminalReward ?? 0;

            // Update local tree object
            path.forEach(nid => {
                const n = { ...currentTree[nid] };
                n.n += 1;
                n.w += reward;
                n.q = n.w / n.n;
                currentTree[nid] = n;
            });
        }
        
        setTree(currentTree);
        setSelectedPath([]);
        setActiveNode(null);
        setRolloutReward(null);
        setPhase('idle');
        setIterationCount(prev => prev + count);
        setIsRunning(false);
        addLog(`Successfully completed ${count} MCTS simulations.`);
    };

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Network size={18} className="text-purple-400" />
                        MCTS Step-by-Step Game Tree Visualizer
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Interact with the Monte Carlo Tree Search loop (Selection, Expansion, Simulation, Backprop).
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={nextStep} disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                        {phase === 'idle' || phase === 'backprop' ? 'Start Search' : 'Next Phase'}
                    </button>
                    <button onClick={runFullIteration} disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        Full Iteration
                    </button>
                    <button onClick={() => runMultipleIterations(20)} disabled={isRunning}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                        Auto-Run 20 Iter.
                    </button>
                    <button onClick={resetTree}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Stage Indicators */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono tracking-wider font-bold">
                {[
                    { id: 'selection', label: '1. SELECTION' },
                    { id: 'expansion', label: '2. EXPANSION' },
                    { id: 'simulation', label: '3. SIMULATION' },
                    { id: 'backprop', label: '4. BACKPROP' },
                    { id: 'idle', label: 'COMPLETED' },
                ].map(p => {
                    const isCurrent = phase === p.id || (p.id === 'idle' && phase === 'idle' && iterationCount > 0);
                    return (
                        <div key={p.id}
                            className={`py-1.5 rounded-lg border transition-all ${isCurrent ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20' : 'bg-slate-950/40 text-slate-600 border-slate-900'}`}>
                            {p.label}
                        </div>
                    );
                })}
            </div>

            {/* Canvas Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SVG Visualizer */}
                <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center">
                    <svg className="w-full max-w-[500px]" viewBox="0 0 500 230">
                        {/* Draw connector lines */}
                        {Object.values(tree).map(node => {
                            if (!node.parent) return null;
                            const pNode = tree[node.parent];
                            const isPath = selectedPath.includes(node.id) && selectedPath.includes(pNode.id);
                            return (
                                <line
                                    key={`line_${node.id}`}
                                    x1={pNode.x}
                                    y1={pNode.y}
                                    x2={node.x}
                                    y2={node.y}
                                    stroke={isPath ? '#c084fc' : '#1e293b'}
                                    strokeWidth={isPath ? 3 : 1.5}
                                    strokeDasharray={phase === 'simulation' && activeNode === node.id ? '4,4' : undefined}
                                />
                            );
                        })}

                        {/* Draw nodes */}
                        {Object.values(tree).map(node => {
                            const isPath = selectedPath.includes(node.id);
                            const isActive = activeNode === node.id;
                            let circleFill = '#0f172a';
                            let circleStroke = '#334155';
                            
                            if (isActive) {
                                circleStroke = '#c084fc';
                                circleFill = '#3b0764';
                            } else if (isPath) {
                                circleStroke = '#a855f7';
                            }

                            return (
                                <g key={`node_${node.id}`}>
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r="22"
                                        fill={circleFill}
                                        stroke={circleStroke}
                                        strokeWidth={isActive ? 3 : 1.5}
                                        className="transition-all duration-300"
                                    />
                                    
                                    {/* Node label */}
                                    <text
                                        x={node.x}
                                        y={node.y - 4}
                                        fill="#ffffff"
                                        fontSize="9"
                                        textAnchor="middle"
                                        fontFamily="monospace"
                                        fontWeight="bold"
                                    >
                                        {node.id}
                                    </text>

                                    {/* Stats (N & Q) */}
                                    <text
                                        x={node.x}
                                        y={node.y + 8}
                                        fill="#94a3b8"
                                        fontSize="8"
                                        textAnchor="middle"
                                        fontFamily="monospace"
                                    >
                                        {`N:${node.n} Q:${node.q.toFixed(1)}`}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Rollout Animation Indicator */}
                        {phase === 'simulation' && rolloutReward !== null && (
                            <g>
                                <circle
                                    cx={tree[activeNode!].x}
                                    cy={tree[activeNode!].y}
                                    r="30"
                                    fill="none"
                                    stroke="#eab308"
                                    strokeWidth="1.5"
                                    strokeDasharray="4,4"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0 250 120"
                                        to="360 250 120"
                                        dur="5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                <text
                                    x={tree[activeNode!].x}
                                    y={tree[activeNode!].y + 36}
                                    fill="#eab308"
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    fontFamily="monospace"
                                >
                                    {`Rollout: R=${rolloutReward}`}
                                </text>
                            </g>
                        )}
                    </svg>
                </div>

                {/* Log & Stats Panel */}
                <div className="flex flex-col justify-between space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex-1">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-white">Execution Log</h4>
                            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/25 px-1.5 py-0.5 rounded">
                                Iter: {iterationCount}
                            </span>
                        </div>
                        
                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 h-40 overflow-y-auto space-y-1.5 scrollbar-hide">
                            {log.map((entry, idx) => (
                                <div key={idx} className="text-xs font-mono text-slate-300 leading-relaxed flex gap-1">
                                    <ChevronRight size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>{entry}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col space-y-2 text-xs text-slate-400">
                        <div className="text-white font-semibold flex items-center gap-1.5">
                            <Info size={12} className="text-purple-400" />
                            <span>Selection Rule (PUCT / UCB)</span>
                        </div>
                        <p className="leading-relaxed">
                            Nodes with $N=0$ are chosen immediately. Otherwise, selection maximizes:
                        </p>
                        <div className="bg-slate-950/60 p-2 rounded text-center text-purple-300 font-mono text-[10px]">
                            UCB = Q + 1.41 * sqrt(ln(N_parent) / N_child)
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT: ModelBased Component
   ═══════════════════════════════════════════════════════════════════════ */

export const ModelBased: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                    <Compass size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 9</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-500 mb-4">
                    Model-Based Reinforcement Learning
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Learn to plan inside imagination: bridge the gap between direct experience (model-free) 
                    and internal environment forecasting. Master Dyna-Q, deep latent World Models, 
                    and Monte Carlo Tree Search.
                </p>
            </motion.div>

            {/* ─── 9.1 THE MODEL-BASED PARADIGM ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<Brain size={20} className="text-purple-400" />}>
                    9.1 — The Model-Based RL Paradigm
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        At its core, reinforcement learning divides into two pathways based on whether the agent constructs a representation of environment dynamics:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                                <Activity size={16} />
                                <span>Model-Free RL</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Learns policies or value functions directly from raw interactions with the environment.
                                <strong>Advantages:</strong> Robust against model bias. Simple architectures.
                                <strong>Disadvantages:</strong> Highly sample-inefficient. Needs millions of samples.
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                                <Cpu size={16} />
                                <span>Model-Based RL</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Learns an internal transition function $T(s, a) \rightarrow s'$ and reward function $R(s, a) \rightarrow r$, then uses them to plan.
                                <strong>Advantages:</strong> Outstanding sample efficiency; plans inside imagination.
                                <strong>Disadvantages:</strong> Suffers from model errors which compound during long rollouts.
                            </p>
                        </div>
                    </div>

                    <KeyInsight title="Prediction vs. Planning">
                        A learned model predicts what the environment will do next. <strong>Planning</strong> refers to the computational process of query-looping this model to optimize actions *before* taking them in the real world.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 9.2 DYNA-Q ARCHITECTURE ────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Database size={20} className="text-purple-400" />}>
                    9.2 — The Dyna-Q Architecture
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Sutton's <strong>Dyna-Q</strong> architecture is one of the earliest integrations of model-free learning, model learning, and planning. It treats real environment experience as a source of direct updates *and* model updates, while using planning steps to query the model for imaginary updates.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">Mathematical Updates</h4>
                            <div className="space-y-4 text-sm text-slate-300">
                                <div>
                                    <span className="text-purple-400 font-bold">1. Direct Experience Update:</span>
                                    <MathEquation formula="Q(s, a) \leftarrow Q(s, a) + \alpha \left[ r + \gamma \max_{a'} Q(s', a') - Q(s, a) \right]" block />
                                </div>
                                <div>
                                    <span className="text-purple-400 font-bold">2. Model Learning:</span>
                                    <MathEquation formula="\mathrm{Model}(s, a) \leftarrow (s', r)" block />
                                </div>
                                <div>
                                    <span className="text-purple-400 font-bold">3. Planning updates ($N$ times):</span>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Sample a previously visited state $s_p$ and action $a_p$. Query the model for predicted $s'_p, r_p$, then update:
                                    </p>
                                    <MathEquation formula="Q(s_p, a_p) \leftarrow Q(s_p, a_p) + \alpha \left[ r_p + \gamma \max_{a'} Q(s'_p, a') - Q(s_p, a_p) \right]" block />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AlgorithmBox
                                title="Dyna-Q Loop"
                                steps={[
                                    "Initialize $Q(s, a)$ and $\\mathrm{Model}(s, a)$ for all $s, a$",
                                    "Loop forever: (a) $s \\leftarrow$ current state",
                                    "(b) Choose $a \\leftarrow \\epsilon\\text{-greedy}(s, Q)$",
                                    "(c) Take action $a$, observe reward $r$ and next state $s'$",
                                    "(d) Update Q-value directly using transition $(s, a, r, s')$",
                                    "(e) Update Model: $\\mathrm{Model}(s, a) \\leftarrow (s', r)$",
                                    "(f) Loop $N$ times: choose random visited state $s_k$, random action $a_k$ previously taken in $s_k$",
                                    "Query model: $s'_k, r_k \\leftarrow \\mathrm{Model}(s_k, a_k)$",
                                    "Update Q-value with planned experience $(s_k, a_k, r_k, s'_k)$"
                                ]}
                            />
                        </div>
                    </div>

                    <KeyInsight title="Dyna-Q+ for Changing Environments" color="#eab308">
                        If an environment changes, a learned model becomes stale. <strong>Dyna-Q+</strong> adds an exploration bonus to planning updates. If a transition has not been tried for $\tau$ steps, its planning reward is boosted: $R_p \leftarrow R_p + \kappa \sqrt{\tau}$, encouraging the agent to plan exploration.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 9.3 DYNA-Q INTERACTIVE EXPLORER ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-purple-400" />}>
                    9.3 — Dyna-Q Gridworld Explorer
                </SectionTitle>
                <DynaQGridworld />
            </motion.section>

            {/* ─── 9.4 WORLD MODELS (HA & SCHMIDHUBER) ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Cpu size={20} className="text-purple-400" />}>
                    9.4 — World Models (VAE + MDN-RNN)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        In high-dimensional environments (e.g. video frames), planning directly on raw inputs is too complex. Schmidhuber & Ha (2018) proposed the classic <strong>World Models</strong> framework, decomposing the agent into three modular components:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-purple-400 uppercase font-bold block">1. Vision Model (V)</span>
                            <span className="text-sm font-bold text-white block">Variational Autoencoder (VAE)</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Compresses the high-dimensional observation frame $x_t$ (e.g., $64\times64\times3$ pixel image) into a low-dimensional latent code $z_t \in \mathbb{R}^{32}$.
                            </p>
                            <div className="pt-2">
                                <MathEquation formula="z_t \sim q_\phi(z_t | x_t)" block />
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-purple-400 uppercase font-bold block">2. Memory Model (M)</span>
                            <span className="text-sm font-bold text-white block">MDN-RNN</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                A Recurrent Neural Network coupled with a Mixture Density Network (MDN) that models the temporal dynamics in latent space, predicting the probability of the next latent code.
                            </p>
                            <div className="pt-2">
                                <MathEquation formula="P(z_{t+1} | a_t, z_t, h_{t-1})" block />
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-purple-400 uppercase font-bold block">3. Controller (C)</span>
                            <span className="text-sm font-bold text-white block">Linear Layer / Policy</span>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                A simple, feedforward network maps the combination of the current latent code $z_t$ and the RNN hidden state $h_t$ directly to action $a_t$.
                            </p>
                            <div className="pt-2">
                                <MathEquation formula="a_t = W_c [z_t, h_t] + b_c" block />
                            </div>
                        </div>
                    </div>

                    <KeyInsight title="Training in Imagination">
                        Because the combination of $V$ and $M$ creates a complete simulator in the latent space, the Controller $C$ can be trained entirely **inside the simulated memory model** (imagination) using evolutionary strategies (like CMA-ES) or policy gradient methods.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 9.5 LATENT WORLD MODELS (DREAMER) ──────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Sliders size={20} className="text-purple-400" />}>
                    9.5 — Latent World Models (Dreamer series)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        Modern model-based deep RL relies on **Latent World Models**, popularized by the **Dreamer** (V1, V2, V3) series (Hafner et al.). Rather than predicting raw pixel frames, Dreamer learns a model entirely in a compact state space using the **Recurrent State Space Model (RSSM)**.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-md font-bold text-white">The RSSM Core Mechanics</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                A deterministic RNN state $h_t$ is combined with a stochastic state $s_t$. Transition dynamics are split into two branches:
                            </p>
                            <div className="space-y-2 text-xs text-slate-300">
                                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                                    <strong className="text-purple-400 font-mono block mb-1">Stochastic Prior (Predictive):</strong>
                                    <p className="text-slate-400">Forecasts without looking at the next observation.</p>
                                    <MathEquation formula="\hat{s}_t \sim p_\theta(\hat{s}_t | h_t)" block />
                                </div>
                                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                                    <strong className="text-purple-400 font-mono block mb-1">Stochastic Posterior (Corrective):</strong>
                                    <p className="text-slate-400">Corrects the prior using current frame embeddings $e_t$.</p>
                                    <MathEquation formula="s_t \sim q_\phi(s_t | h_t, e_t)" block />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-between">
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">Imagination Optimization</span>
                                <h4 className="text-sm font-bold text-white">How Dreamer Learns</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Instead of rolling out transitions in the real environment, Dreamer uses RSSM to generate trajectories in latent space:
                                </p>
                                <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1.5">
                                    <li>An Actor-Critic network operates on latent states $(h_t, s_t)$.</li>
                                    <li>The critic predicts rewards and value targets inside imagination.</li>
                                    <li>Analytic gradients are backpropagated through latent trajectories directly into the policy.</li>
                                </ul>
                            </div>
                            <div className="mt-4 p-3 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                                <strong className="text-white block mb-0.5">DreamerV3 Milestone:</strong> Uses normalized targets (symlog) and fixed hyperparameters to master diverse games (Minecraft diamond collection, Atari, Roboschool) without custom tuning.
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 9.6 MONTE CARLO TREE SEARCH (MCTS) ─────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Compass size={20} className="text-purple-400" />}>
                    9.6 — Monte Carlo Tree Search (MCTS)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        For discrete action tasks (like chess, Go, or grid navigation), planning is done using **Monte Carlo Tree Search (MCTS)**. It builds a search tree where nodes represent states and edges represent actions, and iteratively allocates computations using exploration-exploitation bounds.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { num: '1', title: 'Selection', desc: 'Starting at root, select child nodes using a UCB selection policy until an unexpanded leaf is reached.' },
                            { num: '2', title: 'Expansion', desc: 'Unless the leaf represents a terminal state, create one or more child nodes to expand the search tree.' },
                            { num: '3', title: 'Simulation', desc: 'Perform a rollout (random playout) from the expanded node to obtain an estimated outcome/reward.' },
                            { num: '4', title: 'Backpropagation', desc: 'Propagate the simulation reward up the selected path, incrementing node visit counts and updating average values.' }
                        ].map(item => (
                            <div key={item.num} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 relative">
                                <span className="absolute right-3 top-2 text-2xl font-mono text-purple-500/20 font-bold">{item.num}</span>
                                <span className="text-sm font-bold text-white block">{item.title}</span>
                                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <KeyInsight title="The UCT Formula (Upper Confidence bounds for Trees)">
                        During selection, we balance exploiting branches with high values ($Q_j$) and exploring branches with low visit counts ($n_j$):
                        <MathEquation formula="a_t = \operatorname{argmax}_a \left[ Q(s, a) + c \sqrt{\frac{\ln N_p}{n(s,a)}} \right]" block />
                        where $N_p$ is the visit count of the parent node, $n(s,a)$ is the visit count of the action branch, and $c$ is the exploration constant.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 9.7 MCTS TREE VISUALIZER WIDGET ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle icon={<Activity size={20} className="text-purple-400" />}>
                    9.7 — MCTS Search Tree Explorer
                </SectionTitle>
                <MCTSTreeVisualizer />
            </motion.section>

            {/* ─── 9.8 ALPHAGO, ALPHAZERO, & MUZERO ───────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <SectionTitle icon={<Network size={20} className="text-purple-400" />}>
                    9.8 — From AlphaGo to AlphaZero and MuZero
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed">
                        DeepMind revolutionized board games by combining neural networks with Monte Carlo Tree Search. This progression led to agents that do not even require a simulator or rules of the game.
                    </p>

                    <div className="space-y-4">
                        <div className="border-l-2 border-purple-500 pl-4 space-y-1">
                            <span className="text-xs font-mono text-purple-400 uppercase font-bold">Step 1: AlphaGo</span>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Used human game data to pretrain a Policy Network via supervised learning. Then applied self-play reinforcement learning to train a Value Network (predicting board state outcomes) and refined MCTS policy selections.
                            </p>
                        </div>

                        <div className="border-l-2 border-purple-500 pl-4 space-y-1">
                            <span className="text-xs font-mono text-purple-400 uppercase font-bold">Step 2: AlphaZero</span>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Discarded all human data. Learned from scratch solely via self-play RL using a single dual-headed network. Outputted both policy probabilities $\mathbf{p}$ and state value $v$. The policy network acts as a guide to prune MCTS branches, discarding rollouts entirely in favor of value predictions.
                            </p>
                        </div>

                        <div className="border-l-2 border-purple-500 pl-4 space-y-1">
                            <span className="text-xs font-mono text-purple-400 uppercase font-bold">Step 3: MuZero</span>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Removed the requirement of knowing game rules or transition physics. Instead of searching over actual game states, **MuZero learns a latent model of game dynamics** that predicts policy, value, and reward inside an embedding space:
                            </p>
                        </div>
                    </div>

                    {/* MuZero Equations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <div className="p-3 text-center space-y-1">
                            <span className="text-xs font-mono text-purple-400 font-bold block uppercase">Representation ($h$)</span>
                            <MathEquation formula="s_0 = h_\theta(o_1, \dots, o_t)" block />
                            <p className="text-[10px] text-slate-500">Maps historical observation frames to initial latent state.</p>
                        </div>
                        <div className="p-3 text-center space-y-1">
                            <span className="text-xs font-mono text-purple-400 font-bold block uppercase">Dynamics ($g$)</span>
                            <MathEquation formula="s_k, r_k = g_\theta(s_{k-1}, a_k)" block />
                            <p className="text-[10px] text-slate-500">Predicts next latent state and reward given action.</p>
                        </div>
                        <div className="p-3 text-center space-y-1">
                            <span className="text-xs font-mono text-purple-400 font-bold block uppercase">Prediction ($f$)</span>
                            <MathEquation formula="\mathbf{p}_k, v_k = f_\theta(s_k)" block />
                            <p className="text-[10px] text-slate-500">Outputs policy logits and value target from latent state.</p>
                        </div>
                    </div>

                    <KeyInsight title="Why MuZero is the Pinnacle of Model-Based RL">
                        During planning, MCTS is run entirely using the *learned* dynamics function $g_\theta$ inside the latent space. The agent never interacts with the real game simulator during tree rollouts, allowing it to master Atari, chess, and shogi without rules or physics.
                    </KeyInsight>
                </Card>
            </motion.section>

            {/* ─── 9.9 COMPARISON TABLE ───────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <SectionTitle icon={<Sliders size={20} className="text-purple-400" />}>
                    9.9 — Model-Based RL Algorithm Comparisons
                </SectionTitle>

                <Card className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-800/80 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 px-4">Algorithm</th>
                                <th className="pb-3 px-4">State Representation</th>
                                <th className="pb-3 px-4">Planning Method</th>
                                <th className="pb-3 px-4">Simulator Required?</th>
                                <th className="pb-3 px-4">Main Focus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-sm">
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">Dyna-Q</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Tabular States ($S$)</td>
                                <td className="py-4 px-4 text-slate-400">Random Model Updates</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">Yes (Learned Tabular)</td>
                                <td className="py-4 px-4 text-slate-400">Integrating learning and planning</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">World Models</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Latent ($z_t$) via VAE</td>
                                <td className="py-4 px-4 text-slate-400">RNN Playouts</td>
                                <td className="py-4 px-4 text-green-400 font-semibold">No (Self-Simulating)</td>
                                <td className="py-4 px-4 text-slate-400">Learning policy in imagination</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">Dreamer (V3)</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Latent ($h_t, s_t$) via RSSM</td>
                                <td className="py-4 px-4 text-slate-400">Actor-Critic in RSSM</td>
                                <td className="py-4 px-4 text-green-400 font-semibold">No (Self-Simulating)</td>
                                <td className="py-4 px-4 text-slate-400">Deep policy gradients in latent space</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">AlphaZero</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Board Coordinates</td>
                                <td className="py-4 px-4 text-slate-400">MCTS + Neural Selection</td>
                                <td className="py-4 px-4 text-red-400 font-semibold">Yes (Game Rules)</td>
                                <td className="py-4 px-4 text-slate-400">Zero-knowledge board game play</td>
                            </tr>
                            <tr className="hover:bg-slate-900/10">
                                <td className="py-4 px-4 font-bold text-white">MuZero</td>
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">Latent ($s_k$) via Dynamics</td>
                                <td className="py-4 px-4 text-slate-400">MCTS in Latent Space</td>
                                <td className="py-4 px-4 text-green-400 font-semibold">No (Self-Simulating)</td>
                                <td className="py-4 px-4 text-slate-400">Rule-free planning in games/Atari</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
            </motion.section>

            {/* ─── 9.10 DEPLOYMENT TIPS & PITFALLS ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <SectionTitle icon={<CheckCircle size={20} className="text-purple-400" />}>
                    9.10 — Implementation Details & Pitfalls
                </SectionTitle>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="space-y-4">
                        <h4 className="text-md font-bold text-white flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" />
                            Model Bias & Exploding Error
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            A learned model is never perfect. When planning, early prediction errors feed into subsequent steps as inputs, causing **compounding errors**. Over multiple steps of imagination, the predicted states drift into unvisited state domains where model errors explode.
                        </p>
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-slate-400 leading-relaxed">
                            <strong>Mitigation:</strong> Keep rollout lengths short (e.g. Dreamer plans only 15 steps into the future), utilize ensemble models to estimate dynamics variance (e.g. MBPO), or stick to value-equivalent models (like MuZero) that only predict value targets.
                        </div>
                    </Card>

                    <Card className="space-y-4">
                        <h4 className="text-md font-bold text-white flex items-center gap-2">
                            <Zap size={18} className="text-purple-400" />
                            Value-Equivalent Planning
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Traditional model-based methods predict observation frames (e.g., recreating the details of moving leaves in the background of a video). This wastes representation capacity on details that do not affect the optimal policy (the "decoy state" problem).
                        </p>
                        <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-slate-400 leading-relaxed">
                            <strong>Solution:</strong> Focus model predictions only on aspects relevant to action selection. Force the latent representation to discard background noise by training it via end-to-end value targets (like in MuZero or TreeSTRAP).
                        </div>
                    </Card>
                </div>
            </motion.section>

        </div>
    );
};
