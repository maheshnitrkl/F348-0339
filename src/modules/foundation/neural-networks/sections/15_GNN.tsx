import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    GitFork, 
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
    Repeat
} from 'lucide-react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#20c997' }) => (
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
   SUB-WIDGET 1: Graph Sandbox & Propagation
   ═══════════════════════════════════════════════════════════════════════ */

interface Node {
    id: number;
    x: number;
    y: number;
    value: number;
    initialValue: number;
    label: string;
}

interface Edge {
    source: number;
    target: number;
}

const GraphSandbox: React.FC = () => {
    // 6-node fixed layout graph
    const initialNodes: Node[] = [
        { id: 1, x: 70, y: 70, value: 10.0, initialValue: 10.0, label: 'A' },
        { id: 2, x: 210, y: 50, value: 2.0, initialValue: 2.0, label: 'B' },
        { id: 3, x: 100, y: 170, value: 8.0, initialValue: 8.0, label: 'C' },
        { id: 4, x: 240, y: 150, value: 1.0, initialValue: 1.0, label: 'D' },
        { id: 5, x: 120, y: 260, value: 9.0, initialValue: 9.0, label: 'E' },
        { id: 6, x: 260, y: 250, value: 0.0, initialValue: 0.0, label: 'F' }
    ];

    const edges: Edge[] = [
        { source: 1, target: 2 },
        { source: 1, target: 3 },
        { source: 2, target: 4 },
        { source: 3, target: 4 },
        { source: 3, target: 5 },
        { source: 4, target: 6 },
        { source: 5, target: 6 }
    ];

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [step, setStep] = useState<number>(0);
    const [gnnType, setGnnType] = useState<'gcn' | 'gat'>('gcn');
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const [gatTemp, setGatTemp] = useState<number>(1.0); // Temperature for GAT similarity

    // Dirichlet energy history
    const [energyHistory, setEnergyHistory] = useState<number[]>([17.07]); // Initial manually computed energy

    // Helper: get neighbors including self
    const getNeighbors = (nodeId: number) => {
        const neighbors = [nodeId];
        edges.forEach(e => {
            if (e.source === nodeId) neighbors.push(e.target);
            if (e.target === nodeId) neighbors.push(e.source);
        });
        return neighbors;
    };

    // Calculate degree with self-loop
    const getDegree = (nodeId: number) => {
        return getNeighbors(nodeId).length;
    };

    // Calculate Dirichlet Energy: 0.5 * sum_{(u,v) in E} (h_u - h_v)^2
    const calculateDirichletEnergy = (currentNodes: Node[]) => {
        let sum = 0;
        edges.forEach(e => {
            const u = currentNodes.find(n => n.id === e.source);
            const v = currentNodes.find(n => n.id === e.target);
            if (u && v) {
                sum += Math.pow(u.value - v.value, 2);
            }
        });
        return parseFloat((sum * 0.5).toFixed(2));
    };

    const handleStep = () => {
        const nextNodes = nodes.map(node => {
            const neighbors = getNeighbors(node.id);
            if (gnnType === 'gcn') {
                // Symmetric GCN propagation: h_i^(l+1) = sum_{j in N(i)} (1 / sqrt(d_i * d_j)) * h_j^(l)
                const d_i = getDegree(node.id);
                let valSum = 0;
                neighbors.forEach(nbrId => {
                    const nbrNode = nodes.find(n => n.id === nbrId);
                    if (nbrNode) {
                        const d_j = getDegree(nbrId);
                        const weight = 1.0 / Math.sqrt(d_i * d_j);
                        valSum += weight * nbrNode.value;
                    }
                });
                return { ...node, value: parseFloat(valSum.toFixed(2)) };
            } else {
                // GAT propagation: h_i^(l+1) = sum_{j in N(i)} alpha_{ij} * h_j^(l)
                // We model dynamic attention alpha_ij proportional to exp(-|h_i - h_j| / temp)
                const scores = neighbors.map(nbrId => {
                    const nbrNode = nodes.find(n => n.id === nbrId);
                    if (!nbrNode) return { id: nbrId, expVal: 0 };
                    const diff = Math.abs(node.value - nbrNode.value);
                    const expVal = Math.exp(-diff / gatTemp);
                    return { id: nbrId, expVal };
                });
                const sumExp = scores.reduce((sum, item) => sum + item.expVal, 0);
                let valSum = 0;
                neighbors.forEach(nbrId => {
                    const nbrNode = nodes.find(n => n.id === nbrId);
                    const scoreObj = scores.find(s => s.id === nbrId);
                    if (nbrNode && scoreObj && sumExp > 0) {
                        const alpha = scoreObj.expVal / sumExp;
                        valSum += alpha * nbrNode.value;
                    }
                });
                return { ...node, value: parseFloat(valSum.toFixed(2)) };
            }
        });

        const newEnergy = calculateDirichletEnergy(nextNodes);
        setNodes(nextNodes);
        setStep(prev => prev + 1);
        setEnergyHistory(prev => [...prev, newEnergy]);
    };

    const handleReset = () => {
        setNodes(initialNodes);
        setStep(0);
        setEnergyHistory([calculateDirichletEnergy(initialNodes)]);
    };

    // Compute node color scale based on value (0 to 10) mapping to teal gradient
    const getNodeColor = (val: number) => {
        const norm = Math.max(0, Math.min(10, val)) / 10;
        // Map norm [0, 1] to teal colors: HSL 166 (teal) with variable lightness
        // 0 -> dark slate-teal, 10 -> bright glowing teal
        const lightness = 25 + norm * 45; // 25% to 70%
        return `hsl(166, 75%, ${lightness}%)`;
    };

    // Calculate edge alpha weights for rendering when hovered
    const getEdgeAttention = (sourceId: number, targetId: number) => {
        if (hoveredNode === null) return null;
        if (hoveredNode !== sourceId && hoveredNode !== targetId) return 0.1; // Dim other edges
        
        // Calculate GAT-like attention value
        const sNode = nodes.find(n => n.id === sourceId);
        const tNode = nodes.find(n => n.id === targetId);
        if (!sNode || !tNode) return 0.2;

        const diff = Math.abs(sNode.value - tNode.value);
        return parseFloat(Math.exp(-diff / gatTemp).toFixed(2));
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-6 lg:col-span-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">GNN Message Passing Simulator</span>
                    <span className="text-xs text-slate-500 font-sans">Click "Step Forward" to aggregate neighbors' representations.</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setGnnType('gcn'); handleReset(); }}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                            gnnType === 'gcn' 
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                    >
                        GCN Layer
                    </button>
                    <button
                        onClick={() => { setGnnType('gat'); handleReset(); }}
                        className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                            gnnType === 'gat' 
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                    >
                        GAT Layer
                    </button>
                </div>
            </div>

            {gnnType === 'gat' && (
                <div className="space-y-1 text-xs font-sans bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                    <label className="text-slate-400 flex justify-between">
                        <span>Attention Temperature (τ)</span>
                        <span className="font-mono text-teal-400 font-bold">τ = {gatTemp.toFixed(1)}</span>
                    </label>
                    <input 
                        type="range" 
                        min="0.3" 
                        max="3.0" 
                        step="0.1" 
                        value={gatTemp} 
                        onChange={e => { setGatTemp(parseFloat(e.target.value)); handleReset(); }} 
                        className="w-full accent-teal-500 h-1 bg-slate-800 rounded" 
                    />
                    <span className="text-[9px] text-slate-500 block">Lower temperature makes attention focus exclusively on similar values. Hover nodes to view attention weights.</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SVG Graph View */}
                <div className="md:col-span-2 flex justify-center bg-slate-900/60 p-4 rounded-xl border border-slate-850 relative overflow-hidden">
                    <svg width={320} height={320} className="block relative z-10">
                        {/* Render Edges */}
                        {edges.map((e, idx) => {
                            const u = nodes.find(n => n.id === e.source)!;
                            const v = nodes.find(n => n.id === e.target)!;
                            const attVal = getEdgeAttention(e.source, e.target);
                            
                            let strokeColor = '#334155';
                            let strokeWidth = 1.5;
                            let opacity = 1.0;

                            if (attVal !== null) {
                                strokeColor = hoveredNode ? '#20c997' : '#334155';
                                strokeWidth = 1.5 + attVal * 4;
                                opacity = hoveredNode ? Math.max(0.15, attVal) : 1.0;
                            }

                            return (
                                <g key={`edge-${idx}`}>
                                    <line 
                                        x1={u.x} 
                                        y1={u.y} 
                                        x2={v.x} 
                                        y2={v.y} 
                                        stroke={strokeColor} 
                                        strokeWidth={strokeWidth}
                                        strokeOpacity={opacity}
                                        style={{ transition: 'all 0.3s ease' }}
                                    />
                                    {hoveredNode && (hoveredNode === e.source || hoveredNode === e.target) && (
                                        <text
                                            x={(u.x + v.x) / 2}
                                            y={(u.y + v.y) / 2 - 4}
                                            fill="#20c997"
                                            fontSize="9"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            className="font-mono bg-slate-950 px-1"
                                        >
                                            {attVal ? attVal.toFixed(2) : ''}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Render Nodes */}
                        {nodes.map(node => {
                            const isHovered = hoveredNode === node.id;
                            const color = getNodeColor(node.value);

                            return (
                                <g 
                                    key={`node-${node.id}`} 
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {/* Outer glow ring for hovered */}
                                    <circle 
                                        cx={node.x} 
                                        cy={node.y} 
                                        r={isHovered ? 26 : 20} 
                                        fill="transparent" 
                                        stroke="#20c997" 
                                        strokeWidth={isHovered ? 2 : 0}
                                        className="transition-all duration-200"
                                    />
                                    {/* Main Node */}
                                    <circle 
                                        cx={node.x} 
                                        cy={node.y} 
                                        r="18" 
                                        fill={color}
                                        stroke="#0f172a"
                                        strokeWidth="2.5"
                                        style={{ transition: 'fill 0.4s ease' }}
                                    />
                                    {/* Node identifier */}
                                    <text 
                                        x={node.x} 
                                        y={node.y - 1} 
                                        fill={node.value > 5 ? "#000" : "#fff"}
                                        fontSize="11" 
                                        fontWeight="bold"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="font-sans select-none pointer-events-none"
                                    >
                                        {node.label}
                                    </text>
                                    {/* Node value label */}
                                    <text 
                                        x={node.x} 
                                        y={node.y + 28} 
                                        fill="#94a3b8" 
                                        fontSize="9" 
                                        fontFamily="monospace"
                                        textAnchor="middle"
                                        className="select-none pointer-events-none font-bold"
                                    >
                                        {node.value.toFixed(1)}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500 bg-slate-950/80 px-2 py-1 rounded border border-slate-850">
                        {gnnType === 'gcn' ? 'Symmetric GCN Weighting' : 'Dynamic Attention GAT'}
                    </div>
                </div>

                {/* Dashboard Controls */}
                <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-xs space-y-2 font-mono">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Propagation Stats</span>
                            <div className="flex justify-between">
                                <span>Steps Taken:</span>
                                <span className="text-teal-400 font-bold">{step}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Dirichlet Energy:</span>
                                <span className="text-teal-400 font-bold">
                                    {energyHistory[energyHistory.length - 1]}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Var(Features):</span>
                                <span className="text-teal-400 font-bold">
                                    {(nodes.reduce((acc, n) => acc + Math.pow(n.value - 5.0, 2), 0) / 6).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Dirichlet Energy Line Chart */}
                        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-850/60 space-y-2">
                            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-sans">Dirichlet Energy Curve</span>
                            <div className="h-16 flex items-end gap-1 border-b border-slate-800 pb-1 px-1">
                                {energyHistory.map((val, idx) => {
                                    // Scale energy relative to max (18.0)
                                    const hPercent = Math.min(100, (val / 18.0) * 100);
                                    return (
                                        <div 
                                            key={`h-${idx}`} 
                                            className="flex-1 bg-teal-500/80 rounded-t-[1px]"
                                            style={{ height: `${hPercent}%`, transition: 'height 0.3s ease' }}
                                            title={`Step ${idx}: ${val}`}
                                        />
                                    );
                                })}
                            </div>
                            <span className="text-[8px] text-slate-500 block text-right font-mono">Energy → 0 (Over-smoothing)</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={handleStep}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                        >
                            <Repeat size={13} />
                            <span>Step Forward</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-semibold text-xs py-1.5 rounded-lg transition-all"
                        >
                            Reset Graph
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: Over-smoothing Energy Graph representation
   ═══════════════════════════════════════════════════════════════════════ */

const OverSmoothingExplainer: React.FC = () => {
    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Dirichlet Energy Loss</span>
            <p className="text-slate-300 text-xs leading-relaxed font-sans">
                As GNN layers increase (<MathEquation formula="k \to \infty" />), node representations converge to a unified state, meaning the Dirichlet energy approaches zero:
            </p>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-center text-xs">
                <MathEquation formula="\mathcal{E}(\mathbf{H}) = \frac{1}{2} \operatorname{Tr}(\mathbf{H}^T \mathbf{L}_{\text{sym}} \mathbf{H}) \to 0" block />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                This is **over-smoothing**. The node features become linear combinations of the graph's dominant eigenvectors, losing all localized node-specific identity.
            </p>
            <div className="bg-teal-500/5 p-3 rounded border border-teal-500/10 text-[10px] leading-relaxed text-teal-400 font-mono">
                <strong>Countermeasures:</strong> Use Skip Connections (Residuals), Layer Normalization, PairNorm, or restrict GNN depth to 2–4 layers.
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const GNN: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <GitFork size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 15</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 to-teal-500 mb-4">
                    Graph Neural Networks
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Extend neural architectures to non-Euclidean structures. Derive the spectral GCN normalization bounds, 
                    graph attention mechanism updates, over-smoothing limitations, and Weisfeiler-Lehman bounds.
                </p>
            </motion.div>

            {/* ─── 15.1 INDUCTIVE BIASES & MESSAGE PASSING ──────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-teal-400" />}>
                    15.1 — Relational Inductive Biases & Message Passing
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Consensus-Building Analogy">
                        Imagine a social network where individuals talk to their friends to update their opinions (node features). 
                        At each round (message passing step), you aggregate opinions from your immediate friends (neighborhood aggregation) 
                        and merge them with your own (update). 
                        If the network talks indefinitely without adding new thoughts, eventually everyone reaches the exact same opinion—this is **over-smoothing**.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Standard MLPs and CNNs operate on grids or sequences with rigid spatial layouts (Euclidean data). 
                        **Graph Neural Networks (GNNs)** relax this constraint, processing arbitrary topologies represented as a graph 
                        <MathEquation formula="G = (V, E)" />. 
                        Modern spatial GNNs utilize the **Message Passing** paradigm, executing discrete iterations of neighborhood aggregation:
                    </p>

                    <div className="space-y-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                            <div className="text-xs text-slate-400 font-mono">1. Message Generation & Aggregation:</div>
                            <MathEquation formula="\mathbf{m}_v^{(k)} = \operatorname{AGGREGATE}^{(k)}\left(\left\{\mathbf{h}_u^{(k-1)} : u \in \mathcal{N}(v)\right\}\right)" block />
                            <div className="text-xs text-slate-400 font-mono mt-2">2. Feature Update:</div>
                            <MathEquation formula="\mathbf{h}_v^{(k)} = \operatorname{UPDATE}^{(k)}\left(\mathbf{h}_v^{(k-1)}, \mathbf{m}_v^{(k)}\right)" block />
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 15.2 MATHEMATICAL FORMULATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-teal-400" />}>
                    15.2 — Spectral GCNs, Self-Attention & Dirichlet Limits
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-8">
                        {/* Spectral GCN */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. Derivation of Spectral GCN (Kipf & Welling)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Spectral graph convolutions are defined in the Fourier domain using the graph Laplacian eigenvector matrix <MathEquation formula="\mathbf{U}" />.
                                To simplify computational complexity, Kipf & Welling approximate the spectral filter using a localized first-order Chebyshev polynomial expansion:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathbf{g}_\theta \star \mathbf{x} \approx \theta \left( \mathbf{I}_N + \mathbf{D}^{-1/2} \mathbf{A} \mathbf{D}^{-1/2} \right) \mathbf{x}" block />
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Because the spectrum of <MathEquation formula="\mathbf{I}_N + \mathbf{D}^{-1/2} \mathbf{A} \mathbf{D}^{-1/2}" /> is bounded within <MathEquation formula="[0, 2]" />, repeating this operation in deep architectures leads to exploding or vanishing gradients. To resolve this, they introduce the **Renormalization Trick**:
                                Add self-loops to the adjacency matrix: <MathEquation formula="\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}_N" /> with degree matrix <MathEquation formula="\tilde{\mathbf{D}}_{ii} = \sum_j \tilde{\mathbf{A}}_{ij}" />.
                                This bounds eigenvalues and yields the standard layer formulation:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathbf{H}^{(l+1)} = \sigma\left(\tilde{\mathbf{D}}^{-1/2} \tilde{\mathbf{A}} \tilde{\mathbf{D}}^{-1/2} \mathbf{H}^{(l)} \mathbf{W}^{(l)}\right)" block />
                            </div>
                        </div>

                        {/* GAT attention */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Graph Attention Networks (GAT)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                GAT (Veličković et al.) replaces isotropic averaging with anisotropic self-attention. The attention coefficient <MathEquation formula="\alpha_{ij}" /> measures the importance of neighbor node <MathEquation formula="j" />'s features to node <MathEquation formula="i" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\alpha_{ij} = \frac{\exp\left(\operatorname{LeakyReLU}\left(\mathbf{a}^T [\mathbf{W}\mathbf{h}_i \parallel \mathbf{W}\mathbf{h}_j]\right)\right)}{\sum_{k \in \mathcal{N}(i)} \exp\left(\operatorname{LeakyReLU}\left(\mathbf{a}^T [\mathbf{W}\mathbf{h}_i \parallel \mathbf{W}\mathbf{h}_k]\right)\right)}" block />
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Where <MathEquation formula="\mathbf{W}" /> is a linear projection weight matrix, <MathEquation formula="\mathbf{a}" /> is a parameterized attention vector, and <MathEquation formula="\parallel" /> denotes concatenation. Node features are updated as:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathbf{h}_i^{(l+1)} = \sigma\left(\sum_{j \in \mathcal{N}(i)} \alpha_{ij} \mathbf{W}\mathbf{h}_j^{(l)}\right)" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-teal-400" />}>
                    15.3 — GNN Node Propagation Sandbox & Over-smoothing energy
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GraphSandbox />
                    <OverSmoothingExplainer />
                </div>
            </motion.section>

            {/* ─── 15.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-teal-400" />}>
                    15.4 — Worked Numerical Example (Hand-Traced GCN Step)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-slate-350 text-sm font-sans leading-relaxed">
                            Let us hand-trace one step of GCN propagation for a simple undirected path graph containing 3 nodes: 
                            <MathEquation formula="1 \leftrightarrow 2 \leftrightarrow 3" />.
                            Assume initial 1D node features:
                            <MathEquation formula="\mathbf{h}^{(0)} = \begin{bmatrix} 1.0 & 2.0 & 3.0 \end{bmatrix}^T" block />
                            Assume identity transformation weights <MathEquation formula="\mathbf{W} = \mathbf{I}" /> and identity activation function <MathEquation formula="\sigma(x) = x" />.
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4 leading-relaxed">
                            <div>
                                <span className="text-teal-400 font-bold block mb-1">1. Construct Adjacency Matrix with Self-Loops:</span>
                                <p className="text-slate-400 text-xs font-sans mb-2">Adding self-loops adds identity <MathEquation formula="\mathbf{I}_3" /> to the adjacency matrix:</p>
                                <MathEquation formula="\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}_3 = \begin{bmatrix} 1 & 1 & 0 \\ 1 & 1 & 1 \\ 0 & 1 & 1 \end{bmatrix}" block />
                            </div>

                            <div>
                                <span className="text-teal-400 font-bold block mb-1">2. Compute Degrees & Normalized Scaling Matrix:</span>
                                <p className="text-slate-400 text-xs font-sans mb-2">The degrees are the row sums: <MathEquation formula="\tilde{d}_1=2, \, \tilde{d}_2=3, \, \tilde{d}_3=2" />.</p>
                                <MathEquation formula="\tilde{\mathbf{D}}^{-1/2} = \operatorname{diag}\left(\frac{1}{\sqrt{2}}, \frac{1}{\sqrt{3}}, \frac{1}{\sqrt{2}}\right) \approx \operatorname{diag}(0.7071, 0.5774, 0.7071)" block />
                                <p className="text-slate-405 text-xs font-sans my-2">Multiplying yields the symmetric normalized matrix <MathEquation formula="\tilde{\mathbf{S}} = \tilde{\mathbf{D}}^{-1/2} \tilde{\mathbf{A}} \tilde{\mathbf{D}}^{-1/2}" />:</p>
                                <MathEquation formula="\tilde{\mathbf{S}}_{ij} = \frac{\tilde{\mathbf{A}}_{ij}}{\sqrt{\tilde{d}_i \tilde{d}_j}} \implies \tilde{\mathbf{S}} = \begin{bmatrix} 0.5 & 0.4082 & 0 \\ 0.4082 & 0.3333 & 0.4082 \\ 0 & 0.4082 & 0.5 \end{bmatrix}" block />
                            </div>

                            <div>
                                <span className="text-teal-400 font-bold block mb-1">3. Compute Propagation Update:</span>
                                <MathEquation formula="\mathbf{h}^{(1)} = \tilde{\mathbf{S}} \mathbf{h}^{(0)} = \begin{bmatrix} 0.5 & 0.4082 & 0 \\ 0.4082 & 0.3333 & 0.4082 \\ 0 & 0.4082 & 0.5 \end{bmatrix} \begin{bmatrix} 1.0 \\ 2.0 \\ 3.0 \end{bmatrix}" block />
                                <div className="space-y-1 font-sans text-slate-350 text-xs mt-2 pl-4">
                                    <div>Node 1: <MathEquation formula="h_1^{(1)} = 0.5(1.0) + 0.4082(2.0) + 0 \approx 1.316" /></div>
                                    <div>Node 2: <MathEquation formula="h_2^{(1)} = 0.4082(1.0) + 0.3333(2.0) + 0.4082(3.0) \approx 2.299" /></div>
                                    <div>Node 3: <MathEquation formula="h_3^{(1)} = 0 + 0.4082(2.0) + 0.5(3.0) \approx 2.316" /></div>
                                </div>
                                <p className="text-slate-450 text-[10px] font-sans mt-3">Notice how the features have smoothed out toward each other. The variance decreased from 0.67 to 0.20 in a single step.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 15.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-teal-400" />}>
                    15.5 — Pure PyTorch Graph Convolution Layer & Network
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a self-contained PyTorch implementation of a graph convolutional layer and network using basic matrix operations (no external GNN libraries like PyG are required).
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import math

class GCNLayer(nn.Module):
    """
    Symmetric Graph Convolutional Network (GCN) layer.
    Computes: H^(l+1) = \sigma( D^(-1/2) A_tilde D^(-1/2) H^l W )
    """
    def __init__(self, in_features: int, out_features: int):
        super(GCNLayer, self).__init__()
        self.in_features = in_features
        self.out_features = out_features
        
        # Learnable weight matrix
        self.weight = nn.Parameter(torch.FloatTensor(in_features, out_features))
        self.bias = nn.Parameter(torch.FloatTensor(out_features))
        self.reset_parameters()

    def reset_parameters(self):
        # Glorot initialization
        stdv = 1. / math.sqrt(self.weight.size(1))
        self.weight.data.uniform_(-stdv, stdv)
        self.bias.data.fill_(0)

    def forward(self, h: torch.Tensor, adj: torch.Tensor) -> torch.Tensor:
        # h: [N, in_features]
        # adj: [N, N] (adjacency matrix WITH self-loops already added)
        
        # Compute projection: H * W
        support = torch.mm(h, self.weight) # [N, out_features]
        
        # Compute degree sums: d_i = sum_j A_ij
        deg = torch.sum(adj, dim=1) # [N]
        # Compute D^(-1/2)
        deg_inv_sqrt = torch.pow(deg, -0.5)
        deg_inv_sqrt[torch.isinf(deg_inv_sqrt)] = 0.0 # handle potential isolated nodes
        
        # Diagonal degree matrix: D^(-1/2)
        D_inv_sqrt = torch.diag(deg_inv_sqrt) # [N, N]
        
        # Symmetric normalization: D^(-1/2) * A * D^(-1/2)
        sym_adj = torch.mm(torch.mm(D_inv_sqrt, adj), D_inv_sqrt) # [N, N]
        
        # Aggregate features: (D^(-1/2) * A * D^(-1/2)) * (H * W)
        output = torch.mm(sym_adj, support) + self.bias
        return output

class GCNClassifier(nn.Module):
    """
    2-Layer GCN Network for Semi-Supervised Node Classification.
    """
    def __init__(self, num_features: int, num_hidden: int, num_classes: int, dropout: float = 0.5):
        super(GCNClassifier, self).__init__()
        self.gcn1 = GCNLayer(num_features, num_hidden)
        self.gcn2 = GCNLayer(num_hidden, num_classes)
        self.dropout = nn.Dropout(dropout)
        self.relu = nn.ReLU()

    def forward(self, h: torch.Tensor, adj: torch.Tensor) -> torch.Tensor:
        # Layer 1 propagation
        h1 = self.relu(self.gcn1(h, adj))
        h1_drop = self.dropout(h1)
        # Layer 2 propagation (output logits)
        logits = self.gcn2(h1_drop, adj)
        return logits

if __name__ == "__main__":
    # Test batch graph: 4 nodes, 3 features each
    nodes_features = torch.tensor([
        [1.0, 0.0, 2.0],
        [0.0, 1.0, 1.0],
        [2.0, 2.0, 0.0],
        [0.0, 0.0, 3.0]
    ], dtype=torch.float32)
    
    # 4x4 Adjacency matrix with self-loops
    adj_with_loops = torch.tensor([
        [1, 1, 1, 0],
        [1, 1, 0, 0],
        [1, 0, 1, 1],
        [0, 0, 1, 1]
    ], dtype=torch.float32)
    
    model = GCNClassifier(num_features=3, num_hidden=8, num_classes=2, dropout=0.0)
    logits = model(nodes_features, adj_with_loops)
    print("Class Logits Shape:", logits.shape) # Expected [4, 2]
    print("Logits:\n", logits)`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
