import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Grid as GridIcon, 
    Layers, 
    Activity, 
    Sparkles, 
    AlertTriangle, 
    Terminal, 
    BookOpen, 
    Award, 
    HelpCircle, 
    CheckCircle,
    Eye,
    Zap,
    GitCommit
} from 'lucide-react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

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

const Callout: React.FC<{
    variant: 'insight' | 'pitfall' | 'research' | 'engineering' | 'empirical' | 'intuition';
    title: string;
    children: React.ReactNode;
}> = ({ variant, title, children }) => {
    const config = {
        insight: { color: '#8b5cf6', icon: Sparkles, bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
        pitfall: { color: '#ef4444', icon: AlertTriangle, bg: 'bg-red-500/5', border: 'border-red-500/20' },
        research: { color: '#38bdf8', icon: Terminal, bg: 'bg-sky-500/5', border: 'border-sky-500/20' },
        engineering: { color: '#10b981', icon: CheckCircle, bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        empirical: { color: '#fb923c', icon: Activity, bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
        intuition: { color: '#eab308', icon: HelpCircle, bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
    }[variant];

    const Icon = config.icon;

    return (
        <div className={`flex gap-3 p-5 rounded-xl border ${config.bg} ${config.border}`}>
            <Icon size={18} style={{ color: config.color, flexShrink: 0, marginTop: 2 }} />
            <div>
                <span className="text-sm font-bold block mb-1" style={{ color: config.color }}>{title}</span>
                <span className="text-sm text-slate-300 leading-relaxed block font-sans">{children}</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 1: Interactive 2D Convolution Step Player
   ═══════════════════════════════════════════════════════════════════════ */

const INPUT_VALS = [
    [1, 2, 0, 1, 0],
    [0, 3, 1, 0, 2],
    [2, 1, 1, 3, 0],
    [0, 0, 2, 1, 1],
    [1, 2, 0, 0, 3]
];

const KERNEL_VALS = [
    [1, 0, -1],
    [0, 1, 0],
    [-1, 0, 1]
];

const ConvPlayer: React.FC = () => {
    const [row, setRow] = useState<number>(0);
    const [col, setCol] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // Calculate full output grid
    const getOutputVal = (r: number, c: number) => {
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                sum += INPUT_VALS[r + i][c + j] * KERNEL_VALS[i][j];
            }
        }
        return sum;
    };

    const outputGrid = [
        [getOutputVal(0, 0), getOutputVal(0, 1), getOutputVal(0, 2)],
        [getOutputVal(1, 0), getOutputVal(1, 1), getOutputVal(1, 2)],
        [getOutputVal(2, 0), getOutputVal(2, 1), getOutputVal(2, 2)]
    ];

    // Autoplay loop
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setCol(prevCol => {
                    if (prevCol < 2) {
                        return prevCol + 1;
                    } else {
                        setRow(prevRow => (prevRow < 2 ? prevRow + 1 : 0));
                        return 0;
                    }
                });
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Format sum equation details
    const getEquationDetails = () => {
        const terms: string[] = [];
        let total = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const inVal = INPUT_VALS[row + i][col + j];
                const kVal = KERNEL_VALS[i][j];
                terms.push(`(${inVal} \\times ${kVal})`);
                total += inVal * kVal;
            }
        }
        return {
            formula: terms.join(' + ') + ` = ${total}`,
            total
        };
    };

    const eq = getEquationDetails();

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">2D Convolution (Cross-Correlation) Player</span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${isPlaying ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-300'}`}
                    >
                        {isPlaying ? 'Pause Auto' : 'Auto Play'}
                    </button>
                    <button 
                        onClick={() => {
                            setCol(c => (c < 2 ? c + 1 : 0));
                            if (col === 2) setRow(r => (r < 2 ? r + 1 : 0));
                        }} 
                        disabled={isPlaying}
                        className="px-2.5 py-1 rounded text-xs font-bold bg-slate-850 text-slate-400 hover:bg-slate-800 disabled:opacity-40"
                    >
                        Step →
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Input Grid (5x5) */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-2 font-mono">Input Image (5x5)</span>
                    <div className="grid grid-cols-5 gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                        {INPUT_VALS.map((rVal, rIdx) => 
                            rVal.map((cVal, cIdx) => {
                                const isKernelCover = 
                                    rIdx >= row && rIdx < row + 3 && 
                                    cIdx >= col && cIdx < col + 3;
                                return (
                                    <div 
                                        key={`in-${rIdx}-${cIdx}`} 
                                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono transition-all duration-200 ${
                                            isKernelCover 
                                                ? 'bg-cyan-500/20 border border-cyan-400/60 text-white font-bold' 
                                                : 'bg-slate-950 text-slate-600 border border-transparent'
                                        }`}
                                    >
                                        {cVal}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Kernel Grid (3x3) */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-2 font-mono">Kernel/Filter (3x3)</span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                        {KERNEL_VALS.map((rVal, rIdx) => 
                            rVal.map((cVal, cIdx) => (
                                <div 
                                    key={`k-${rIdx}-${cIdx}`} 
                                    className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 font-bold"
                                >
                                    {cVal}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Output Grid (3x3) */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-2 font-mono">Feature Map (3x3)</span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                        {outputGrid.map((rVal, rIdx) => 
                            rVal.map((cVal, cIdx) => {
                                const isActive = rIdx === row && cIdx === col;
                                return (
                                    <button 
                                        key={`out-${rIdx}-${cIdx}`} 
                                        onClick={() => { setRow(rIdx); setCol(cIdx); setIsPlaying(false); }}
                                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono transition-all duration-200 border ${
                                            isActive 
                                                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300' 
                                                : 'bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-700'
                                        }`}
                                    >
                                        {cVal}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Arithmetic display */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Calculation Details (Element-wise Sum)</span>
                <div className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-nowrap py-1">
                    <MathEquation formula={eq.formula} />
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: Receptive Field Growth visualizer
   ═══════════════════════════════════════════════════════════════════════ */

const ReceptiveFieldVisualizer: React.FC = () => {
    const [hoveredLayer, setHoveredLayer] = useState<'l1' | 'l2' | null>(null);
    const [activeR, setActiveR] = useState<number>(1);
    const [activeC, setActiveC] = useState<number>(1);

    // Layer 1 dimensions: 3x3 output (obtained via 3x3 kernel over 5x5 input)
    // Layer 2 dimensions: 1x1 output (obtained via 3x3 kernel over 3x3 Layer 1)

    // Calculate mapping bounds
    // If hovered on Layer 2 (1x1 at index 0,0):
    // - Layer 1 range: all 3x3 cells (0..2, 0..2)
    // - Input range: all 5x5 cells (0..4, 0..4)
    // If hovered on Layer 1 (at activeR, activeC):
    // - Layer 1: only that cell (activeR, activeC)
    // - Input range: (activeR .. activeR+2, activeC .. activeC+2)

    const getInputHighlightClass = (r: number, c: number) => {
        if (hoveredLayer === 'l2') {
            return 'bg-cyan-500/25 border-cyan-400/60 scale-105';
        }
        if (hoveredLayer === 'l1') {
            const isInside = r >= activeR && r < activeR + 3 && c >= activeC && c < activeC + 3;
            return isInside ? 'bg-cyan-500/40 border-cyan-400/80 scale-105 font-bold text-white' : 'opacity-40';
        }
        return 'opacity-85';
    };

    const getL1HighlightClass = (r: number, c: number) => {
        if (hoveredLayer === 'l2') {
            return 'bg-cyan-500/40 border-cyan-400/80 scale-105';
        }
        if (hoveredLayer === 'l1') {
            const isActive = r === activeR && c === activeC;
            return isActive ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 scale-110' : 'opacity-40';
        }
        return 'opacity-85';
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Receptive Field Growth Map</span>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center py-2">
                {/* Input Grid (5x5) */}
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 mb-1 font-mono">Input (5x5)</span>
                    <div className="grid grid-cols-5 gap-0.5 bg-slate-900/40 p-1.5 rounded border border-slate-900">
                        {Array.from({ length: 5 }).map((_, r) => 
                            Array.from({ length: 5 }).map((_, c) => (
                                <div 
                                    key={`rf-in-${r}-${c}`}
                                    className={`w-5 h-5 flex items-center justify-center rounded-[2px] text-[8px] font-mono border border-slate-900 bg-slate-950 text-slate-500 transition-all duration-300 ${getInputHighlightClass(r, c)}`}
                                >
                                    {r},{c}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="text-slate-700 text-sm hidden sm:block">── Conv 3x3 ──&gt;</div>

                {/* Layer 1 Grid (3x3) */}
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 mb-1 font-mono">Layer 1 (3x3)</span>
                    <div className="grid grid-cols-3 gap-0.5 bg-slate-900/40 p-1.5 rounded border border-slate-900">
                        {Array.from({ length: 3 }).map((_, r) => 
                            Array.from({ length: 3 }).map((_, c) => (
                                <div 
                                    key={`rf-l1-${r}-${c}`}
                                    onMouseEnter={() => { setHoveredLayer('l1'); setActiveR(r); setActiveC(c); }}
                                    onMouseLeave={() => setHoveredLayer(null)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-[3px] text-[9px] font-mono border border-slate-800 bg-slate-950 text-slate-400 cursor-crosshair transition-all duration-200 ${getL1HighlightClass(r, c)}`}
                                >
                                    {r},{c}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="text-slate-700 text-sm hidden sm:block">── Conv 3x3 ──&gt;</div>

                {/* Layer 2 Grid (1x1) */}
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 mb-1 font-mono">Layer 2 (1x1)</span>
                    <div 
                        onMouseEnter={() => setHoveredLayer('l2')}
                        onMouseLeave={() => setHoveredLayer(null)}
                        className={`w-9 h-9 flex items-center justify-center rounded-md border font-mono text-xs cursor-crosshair transition-all duration-300 ${
                            hoveredLayer === 'l2' 
                                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 scale-110 shadow-lg shadow-cyan-500/20' 
                                : 'bg-slate-900 border-slate-750 text-slate-400'
                        }`}
                    >
                        0,0
                    </div>
                </div>
            </div>

            {/* Dynamic details text */}
            <div className="bg-slate-900/30 border border-slate-905 p-3 rounded-lg text-xs leading-relaxed text-slate-400 font-sans">
                {hoveredLayer === 'l2' && (
                    <div>
                        <strong className="text-cyan-400 font-mono">Layer 2 (0,0) Receptive Field: 5 × 5</strong>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Because Layer 2 convolves over a 3x3 area of Layer 1, and each of those Layer 1 cells incorporates a 3x3 area of the Input, the effective footprint covers the entire 5x5 input image.
                        </p>
                    </div>
                )}
                {hoveredLayer === 'l1' && (
                    <div>
                        <strong className="text-cyan-400 font-mono">Layer 1 ({activeR},{activeC}) Receptive Field: 3 × 3</strong>
                        <p className="mt-1 text-[11px] text-slate-500">
                            This neuron looks at inputs from row indices {activeR} to {activeR + 2} and column indices {activeC} to {activeC + 2}.
                        </p>
                    </div>
                )}
                {!hoveredLayer && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Eye size={12} className="text-cyan-500" />
                        <span>Hover over any cell in Layer 1 or Layer 2 to inspect its receptive field footprint on the input image grid.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: Residual Gradient Flow Simulator
   ═══════════════════════════════════════════════════════════════════════ */

const ResidualSimulator: React.FC = () => {
    const [isSevered, setIsSevered] = useState<boolean>(true);
    const [isFlowing, setIsFlowing] = useState<boolean>(false);
    const [flowType, setFlowType] = useState<'forward' | 'backward'>('backward');

    const triggerFlow = (type: 'forward' | 'backward') => {
        if (isFlowing) return;
        setFlowType(type);
        setIsFlowing(true);
        setTimeout(() => setIsFlowing(false), 2400);
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Residual vs Plain Signal Flow</span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsSevered(!isSevered)}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${isSevered ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}`}
                    >
                        {isSevered ? 'Sever Layer 3: ON' : 'Sever Layer 3: OFF'}
                    </button>
                    <button 
                        onClick={() => triggerFlow('backward')} 
                        disabled={isFlowing}
                        className="px-2 py-1 rounded text-xs bg-cyan-600 hover:bg-cyan-505 text-white font-bold disabled:opacity-40 transition-all"
                    >
                        Run Gradient Backprop
                    </button>
                </div>
            </div>

            <div className="space-y-4 font-mono text-[10px]">
                {/* 1. Plain Network */}
                <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-lg space-y-2">
                    <span className="text-slate-500 block">PLAIN CONVNET (NO SKIPS)</span>
                    <div className="flex items-center justify-between px-2 relative h-10">
                        {/* Nodes */}
                        {['IN', 'L1', 'L2', 'L3', 'L4', 'OUT'].map((name, idx) => {
                            const isDead = isSevered && name === 'L3';
                            return (
                                <div key={`p-node-${name}`} className="flex items-center gap-1.5 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                        isDead 
                                            ? 'bg-red-950/80 border-red-500 text-red-400 font-bold scale-95' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}>
                                        {name}
                                    </div>
                                    {idx < 5 && <div className="w-4 h-0.5 bg-slate-800" />}
                                </div>
                            );
                        })}

                        {/* Animated signal dots */}
                        {isFlowing && (
                            <motion.div 
                                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400"
                                initial={flowType === 'forward' ? { left: '16px' } : { right: '16px' }}
                                animate={
                                    flowType === 'forward' 
                                        ? (isSevered ? { left: ['16px', '135px', '135px'] } : { left: ['16px', '320px'] })
                                        : (isSevered ? { right: ['16px', '135px', '135px'] } : { right: ['16px', '320px'] })
                                }
                                transition={{ duration: 2, ease: 'easeInOut' }}
                                style={{ top: '15px' }}
                            />
                        )}
                    </div>
                </div>

                {/* 2. ResNet Block */}
                <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-lg space-y-2 relative">
                    <span className="text-slate-500 block">RESIDUAL NETWORK (WITH SKIPS)</span>
                    <div className="flex items-center justify-between px-2 relative h-14">
                        {/* Nodes */}
                        {['IN', 'L1', 'L2', 'L3', 'L4', 'OUT'].map((name, idx) => {
                            const isDead = isSevered && name === 'L3';
                            return (
                                <div key={`r-node-${name}`} className="flex items-center gap-1.5 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                        isDead 
                                            ? 'bg-red-950/80 border-red-500 text-red-400 font-bold scale-95' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}>
                                        {name}
                                    </div>
                                    {idx < 5 && <div className="w-4 h-0.5 bg-slate-800" />}
                                </div>
                            );
                        })}

                        {/* Skip connection arc */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                            <path 
                                d="M 100 20 Q 155 -5 210 20" 
                                fill="none" 
                                stroke="#06b6d4" 
                                strokeWidth="1.2" 
                                strokeDasharray="3,3" 
                                opacity="0.7"
                            />
                        </svg>

                        {/* Animated signal dots */}
                        {isFlowing && (
                            <>
                                {/* Core path dot */}
                                <motion.div 
                                    className="absolute w-2 h-2 rounded-full bg-cyan-400/50"
                                    initial={flowType === 'forward' ? { left: '16px' } : { right: '16px' }}
                                    animate={
                                        flowType === 'forward' 
                                            ? (isSevered ? { left: ['16px', '135px', '135px'] } : { left: ['16px', '320px'] })
                                            : (isSevered ? { right: ['16px', '135px', '135px'] } : { right: ['16px', '320px'] })
                                    }
                                    transition={{ duration: 2, ease: 'easeInOut' }}
                                    style={{ top: '23px' }}
                                />

                                {/* Skip connection path dot */}
                                <motion.div 
                                    className="absolute w-2 h-2 rounded-full bg-cyan-400"
                                    initial={flowType === 'forward' ? { x: 100, y: 20 } : { x: 210, y: 20 }}
                                    animate={
                                        flowType === 'forward'
                                            ? { x: [100, 155, 210], y: [20, -5, 20] }
                                            : { x: [210, 155, 100], y: [20, -5, 20] }
                                    }
                                    transition={{ duration: 2, ease: 'easeInOut' }}
                                    style={{ top: '3px' }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                {isSevered
                    ? 'With Layer 3 severed, notice how the Plain Network gradient stops dead (vanishing/severed flow). In ResNet, the signal successfully bypasses the dead layer via the identity skip connection arc!'
                    : 'Try turning ON the Sever Layer toggle to see how information and gradients bypass dead or poorly initialized layers.'
                }
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const CNN: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-cyan-400 mb-4">
                    <GridIcon size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 9</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-500 mb-4">
                    Convolutional Neural Networks
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Preserve spatial structure and enforce inductive biases. Derive 2D convolutions, receptive field growth, 
                    and residual pathways that prevent gradient decay in deep spatial topologies.
                </p>
            </motion.div>

            {/* ─── 9.1 TRANSLATION INVARIANCE ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-cyan-400" />}>
                    9.1 — Inductive Biases: Translation Invariance & Spatial Grids
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Waldo Search Analogy">
                        If you are searching for Waldo in a crowded picture, your brain doesn't learn a separate template for "Waldo at the top-left" and another for "Waldo at the bottom-right". Instead, you apply the exact same visual detectors (striped shirt, glasses) across all regions of the page. 
                        This spatial search is **weight sharing**: applying the same local kernel everywhere.
                        Whether Waldo stands on the left or the right side, the features are recognized identically. This is **translation invariance**.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Fully Connected (Dense) layers flatten 2D spatial inputs into 1D vectors, destroying coordinate relationships. Furthermore, for a moderate <MathEquation formula="256 \times 256 \times 3" /> image, a single linear hidden layer with 1000 hidden units requires over 196 million parameters, leading to massive overfitting.
                    </p>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        CNNs solve this by embedding two core spatial inductive biases:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-805">
                            <span className="text-xs font-bold text-cyan-400 block mb-1">1. Locality (Local Receptive Fields)</span>
                            <span className="text-xs text-slate-400 leading-relaxed font-sans">
                                Neurons in a convolutional layer only connect to a small, local patch of the previous layer (e.g. 3x3 pixels), allowing them to extract local structures like edges and corners before forming complex objects.
                            </span>
                        </div>
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-805">
                            <span className="text-xs font-bold text-cyan-400 block mb-1">2. Weight Sharing (Equivariance)</span>
                            <span className="text-xs text-slate-400 leading-relaxed font-sans">
                                The same set of weights (the kernel) is dragged across the entire image space. If a feature is useful in one part of the image, it is useful everywhere. This drastically reduces parameter requirements.
                            </span>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 9.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-cyan-400" />}>
                    9.2 — Convolutional Calculus & Residual Identity Blocks
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us examine the exact mathematical formulations of convolution operations, receptive fields, and residual optimization.
                    </p>

                    <div className="space-y-8">
                        {/* 2D Conv math */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. Discrete 2D Cross-Correlation (Conv Operator)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Although termed "convolution" in deep learning, frameworks actually implement cross-correlation (which skips flipping the kernel axes). For a single channel input <MathEquation formula="I" /> and kernel <MathEquation formula="K" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="(I * K)(i, j) = \sum_{m=0}^{k_h-1} \sum_{n=0}^{k_w-1} I(i + m, j + n) K(m, n)" block />
                            </div>
                        </div>

                        {/* Spatial dimensions */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Spatial Output Dimensions</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                The spatial shape of the output feature map depends on input width <MathEquation formula="W" />, kernel width <MathEquation formula="K" />, padding <MathEquation formula="P" />, and stride <MathEquation formula="S" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="O = \left\lfloor \frac{W - K + 2P}{S} \right\rfloor + 1" block />
                            </div>
                        </div>

                        {/* Backpropagation */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Backpropagation through 2D Convolutions</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Let <MathEquation formula="\mathcal{L}" /> be the loss, and <MathEquation formula="\delta_{i,j} = \frac{\partial\mathcal{L}}{\partial Y_{i,j}}" /> be the upstream gradient. The gradient with respect to kernel weight <MathEquation formula="K_{m,n}" /> is:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\frac{\partial\mathcal{L}}{\partial K_{m,n}} = \sum_{i} \sum_{j} \delta_{i,j} I(i + m, j + n)" block />
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                The gradient with respect to the input <MathEquation formula="I(x, y)" /> is computed by convolving the padded upstream gradient with a spatially rotated version of the kernel.
                            </p>
                        </div>

                        {/* Receptive Field */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. Receptive Field Growth Tracking</h4>
                            <p className="text-slate-405 text-xs leading-relaxed font-sans">
                                The receptive field <MathEquation formula="RF_l" /> measures the input span visible to a unit at layer <MathEquation formula="l" />. Given stride <MathEquation formula="S_l" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                                <MathEquation formula="RF_l = RF_{l-1} + (K_l - 1) \cdot j_{l-1}" block />
                                <div className="text-center">where current cumulative stride is:</div>
                                <MathEquation formula="j_l = j_{l-1} \cdot S_l \quad (\text{with } RF_0 = 1, j_0 = 1)" block />
                            </div>
                        </div>

                        {/* Residual Skip Connections */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">5. Residual Connections & Gradient Preservation</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                ResNet (He et al. 2015) uses identity skip connections: <MathEquation formula="\mathbf{y} = \mathcal{F}(\mathbf{x}) + \mathbf{x}" />. The gradient flow is:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\frac{\partial\mathcal{L}}{\partial \mathbf{x}} = \frac{\partial\mathcal{L}}{\partial \mathbf{y}} \frac{\partial \mathbf{y}}{\partial \mathbf{x}} = \frac{\partial\mathcal{L}}{\partial \mathbf{y}} \left( \frac{\partial \mathcal{F}(\mathbf{x})}{\partial \mathbf{x}} + \mathbf{I} \right)" block />
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Even if the layers within <MathEquation formula="\mathcal{F}" /> suffer from vanishing gradients (<MathEquation formula="\frac{\partial \mathcal{F}}{\partial \mathbf{x}} \to \mathbf{0}" />), the identity term <MathEquation formula="\mathbf{I}" /> ensures that the gradient flows directly back without disappearing, enabling networks to exceed 1000 layers.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-cyan-400" />}>
                    9.3 — Convolutional & Residual Interactive Sandbox
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ConvPlayer />
                    <ReceptiveFieldVisualizer />
                    <ResidualSimulator />
                </div>
            </motion.section>

            {/* ─── 9.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-cyan-400" />}>
                    9.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: 2D Convolution (Cross-Correlation)</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us convolve a <MathEquation formula="3 \times 3" /> input matrix <MathEquation formula="\mathbf{X}" /> with a <MathEquation formula="2 \times 2" /> kernel filter <MathEquation formula="\mathbf{K}" /> (no padding, stride = 1):
                            <MathEquation formula="\mathbf{X} = \begin{pmatrix} 1 & 2 & 0 \\ 0 & 3 & 1 \\ 2 & 1 & 1 \end{pmatrix}, \quad \mathbf{K} = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}" block />
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3 leading-relaxed">
                            <div>
                                <span className="text-cyan-400 font-bold block mb-1">1. Output Cell (0, 0):</span>
                                <MathEquation formula="Y_{0,0} = (X_{0,0} \cdot K_{0,0}) + (X_{0,1} \cdot K_{0,1}) + (X_{1,0} \cdot K_{1,0}) + (X_{1,1} \cdot K_{1,1})" block />
                                <MathEquation formula="= (1 \cdot 1) + (2 \cdot 0) + (0 \cdot 0) + (3 \cdot -1) = 1 - 3 = -2" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-cyan-400 font-bold block mb-1">2. Output Cell (0, 1):</span>
                                <MathEquation formula="Y_{0,1} = (X_{0,1} \cdot K_{0,0}) + (X_{0,2} \cdot K_{0,1}) + (X_{1,1} \cdot K_{1,0}) + (X_{1,2} \cdot K_{1,1})" block />
                                <MathEquation formula="= (2 \cdot 1) + (0 \cdot 0) + (3 \cdot 0) + (1 \cdot -1) = 2 - 1 = 1" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-cyan-400 font-bold block mb-1">3. Output Cell (1, 0):</span>
                                <MathEquation formula="Y_{1,0} = (0 \cdot 1) + (3 \cdot 0) + (2 \cdot 0) + (1 \cdot -1) = -1" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-cyan-400 font-bold block mb-1">4. Output Cell (1, 1):</span>
                                <MathEquation formula="Y_{1,1} = (3 \cdot 1) + (1 \cdot 0) + (1 \cdot 0) + (1 \cdot -1) = 3 - 1 = 2" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-cyan-400 font-bold block mb-1">Final Feature Map output:</span>
                                <MathEquation formula="\mathbf{Y} = \begin{pmatrix} -2 & 1 \\ -1 & 2 \end{pmatrix}" block />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white">Example B: Receptive Field Growth Tracking</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate the receptive field <MathEquation formula="RF_d" /> of a 3-layer convolutional network step-by-step:
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4">
                            <div>
                                <span className="text-cyan-400 font-bold block">1. Layer 1: Kernel = 3x3, Stride = 1</span>
                                <MathEquation formula="RF_1 = RF_0 + (K_1 - 1) \cdot j_0 = 1 + (3 - 1) \cdot 1 = 3" block />
                                <MathEquation formula="j_1 = j_0 \cdot S_1 = 1 \cdot 1 = 1" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-cyan-400 font-bold block">2. Layer 2: Kernel = 3x3, Stride = 2</span>
                                <MathEquation formula="RF_2 = RF_1 + (K_2 - 1) \cdot j_1 = 3 + (3 - 1) \cdot 1 = 5" block />
                                <MathEquation formula="j_2 = j_1 \cdot S_2 = 1 \cdot 2 = 2" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-cyan-400 font-bold block">3. Layer 3: Kernel = 3x3, Stride = 1</span>
                                <MathEquation formula="RF_3 = RF_2 + (K_3 - 1) \cdot j_2 = 5 + (3 - 1) \cdot 2 = 9" block />
                                <MathEquation formula="j_3 = j_2 \cdot S_3 = 2 \cdot 1 = 2" block />
                            </div>
                            <p className="text-slate-500 font-sans text-[11px] mt-1">Note how the receptive field grows non-linearly to 9x9 inputs at Layer 3 due to the striding operation in Layer 2.</p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 9.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-cyan-400" />}>
                    9.5 — PyTorch Custom im2col Convolution & ResNet Blocks
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a custom 2D convolution based on PyTorch's `unfold` (im2col matrix multiplication) and a custom Residual Bottleneck layer.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import torch.nn.functional as F

class Custom2DConv(nn.Module):
    """
    Implements a 2D Convolution using the 'unfold' operator (im2col matrix multiply).
    """
    def __init__(self, in_channels: int, out_channels: int, kernel_size: int, stride: int = 1, padding: int = 0):
        super(Custom2DConv, self).__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        
        # Trainable kernels and biases
        self.weight = nn.Parameter(torch.randn(out_channels, in_channels * kernel_size * kernel_size))
        self.bias = nn.Parameter(torch.zeros(out_channels, 1))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [Batch, In_Channels, Height, Width]
        batch_size, c_in, h, w = x.shape
        
        # 1. Pad input
        x_padded = F.pad(x, (self.padding, self.padding, self.padding, self.padding))
        
        # 2. unfold extracts local sliding blocks: [B, C_in * K * K, L] where L is output spatial count
        x_unfolded = F.unfold(x_padded, kernel_size=self.kernel_size, stride=self.stride)
        
        # 3. Matrix Multiplication: [Out_Channels, C_in * K * K] x [B, C_in * K * K, L]
        # Reshaped to output feature maps
        out = torch.matmul(self.weight, x_unfolded) + self.bias
        
        # Compute output dimensions
        h_out = (h - self.kernel_size + 2 * self.padding) // self.stride + 1
        w_out = (w - self.kernel_size + 2 * self.padding) // self.stride + 1
        
        return out.view(batch_size, self.out_channels, h_out, w_out)

class ResidualBlock(nn.Module):
    """
    Standard ResNet block with learnable projection shortcut if shapes mismatch.
    """
    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        # Projection shortcut if input and output dimensions do not align
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # F(x) path
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        
        # F(x) + x path (Residual Skip Connection)
        out += self.shortcut(x)
        return F.relu(out)

if __name__ == "__main__":
    # Test Custom Conv
    x_test = torch.randn(2, 3, 32, 32)
    custom_conv = Custom2DConv(in_channels=3, out_channels=16, kernel_size=3, stride=1, padding=1)
    print("Custom Conv Output shape:", custom_conv(x_test).shape) # Should be [2, 16, 32, 32]
    
    # Test ResNet Block
    res_block = ResidualBlock(in_channels=3, out_channels=16, stride=2)
    print("Residual Block Output shape:", res_block(x_test).shape) # Should be [2, 16, 16, 16]`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
