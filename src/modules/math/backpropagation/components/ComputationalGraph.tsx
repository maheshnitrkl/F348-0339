import React, { useState } from 'react';

// Types for our graph nodes
interface Node {
    id: string;
    label: string;
    type: 'input' | 'operation' | 'output';
    value: number;
    grad: number;
    x: number;
    y: number;
    parents: string[];
}

interface Edge {
    from: string;
    to: string;
    label?: string;
}

export const ComputationalGraph: React.FC = () => {
    // Initial state: f(x,y,z) = (x + y) * z
    // Inputs
    const [inputs, setInputs] = useState({ x: -2, y: 5, z: -4 });
    const [step, setStep] = useState<'forward' | 'backward'>('forward');
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

    // Compute forward pass values
    const q_val = inputs.x + inputs.y;
    const f_val = q_val * inputs.z;

    // Compute gradients (backprop)
    // dL/df = 1
    const grad_f = 1.0;
    // df/dz = q, df/dq = z
    const grad_z = q_val * grad_f;
    const grad_q = inputs.z * grad_f;
    // dq/dx = 1, dq/dy = 1
    const grad_x = 1.0 * grad_q;
    const grad_y = 1.0 * grad_q;

    const nodes: Node[] = [
        { id: 'x', label: 'x', type: 'input', value: inputs.x, grad: grad_x, x: 50, y: 50, parents: [] },
        { id: 'y', label: 'y', type: 'input', value: inputs.y, grad: grad_y, x: 50, y: 150, parents: [] },
        { id: 'plus', label: '+', type: 'operation', value: q_val, grad: grad_q, x: 200, y: 100, parents: ['x', 'y'] },
        { id: 'z', label: 'z', type: 'input', value: inputs.z, grad: grad_z, x: 200, y: 200, parents: [] },
        { id: 'mult', label: '*', type: 'operation', value: f_val, grad: grad_f, x: 350, y: 150, parents: ['plus', 'z'] },
        { id: 'f', label: 'L', type: 'output', value: f_val, grad: grad_f, x: 450, y: 150, parents: ['mult'] }
    ];

    const edges: Edge[] = [
        { from: 'x', to: 'plus' },
        { from: 'y', to: 'plus' },
        { from: 'plus', to: 'mult', label: 'q' },
        { from: 'z', to: 'mult' },
        { from: 'mult', to: 'f' }
    ];

    return (
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-6 my-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Interactive Computational Graph</h3>
                    <p className="text-sm text-gray-400">Computing <span className="font-mono text-cyan-300">f = (x + y) * z</span></p>
                </div>

                {/* Controls */}
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">x</label>
                        <input
                            type="number"
                            value={inputs.x}
                            onChange={(e) => setInputs({ ...inputs, x: parseFloat(e.target.value) || 0 })}
                            className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm w-16 text-cyan-400 text-center"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">y</label>
                        <input
                            type="number"
                            value={inputs.y}
                            onChange={(e) => setInputs({ ...inputs, y: parseFloat(e.target.value) || 0 })}
                            className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm w-16 text-cyan-400 text-center"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">z</label>
                        <input
                            type="number"
                            value={inputs.z}
                            onChange={(e) => setInputs({ ...inputs, z: parseFloat(e.target.value) || 0 })}
                            className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm w-16 text-cyan-400 text-center"
                        />
                    </div>

                    <button
                        onClick={() => setStep(s => s === 'forward' ? 'backward' : 'forward')}
                        className={`ml-4 px-4 py-2 rounded-lg text-sm font-bold transition-all ${step === 'forward'
                            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                            : 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
                            }`}
                    >
                        {step === 'forward' ? 'Show Gradients (Backward)' : 'Show Values (Forward)'}
                    </button>
                </div>
            </div>

            <div className="relative h-[300px] w-full bg-black/20 rounded-lg overflow-hidden border border-white/5">
                <svg className="w-full h-full">
                    <defs>
                        <marker id="arrow-head" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                        </marker>
                        <marker id="arrow-head-grad" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#F472B6" />
                        </marker>
                    </defs>

                    {/* Edges */}
                    {edges.map((edge, i) => {
                        const fromNode = nodes.find(n => n.id === edge.from)!;
                        const toNode = nodes.find(n => n.id === edge.to)!;
                        return (
                            <g key={i}>
                                <line
                                    x1={fromNode.x + 25} y1={fromNode.y + 15} // Offset for node center
                                    x2={toNode.x - 25} y2={toNode.y + 15}
                                    stroke={step === 'backward' ? '#F472B6' : '#64748b'}
                                    strokeWidth={2}
                                    strokeDasharray={step === 'backward' ? "4" : "0"}
                                    markerEnd={step === 'backward' ? "" : "url(#arrow-head)"}
                                    className="transition-colors duration-500"
                                />
                                {step === 'backward' && (
                                    <line
                                        x1={toNode.x - 25} y1={toNode.y + 15}
                                        x2={fromNode.x + 25} y2={fromNode.y + 15}
                                        stroke="#F472B6"
                                        strokeWidth={2}
                                        strokeOpacity={0.6}
                                        markerEnd="url(#arrow-head-grad)"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => (
                        <g
                            key={node.id}
                            transform={`translate(${node.x - 25}, ${node.y})`}
                            onMouseEnter={() => setActiveNodeId(node.id)}
                            onMouseLeave={() => setActiveNodeId(null)}
                            className="cursor-pointer"
                        >
                            <rect
                                width="50" height="30" rx="8"
                                fill={node.type === 'operation' ? '#1e293b' : '#0f172a'}
                                stroke={step === 'backward' ? '#F472B6' : '#22d3ee'}
                                strokeWidth={activeNodeId === node.id ? 2 : 1}
                                className="transition-all duration-300"
                            />
                            <text
                                x="25" y="20"
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                                className="pointer-events-none select-none"
                            >
                                {node.label}
                            </text>

                            {/* Value / Grad Display */}
                            <foreignObject x="-10" y="35" width="70" height="40">
                                <div className={`text-[10px] text-center font-mono ${step === 'backward' ? 'text-pink-400' : 'text-cyan-400'}`}>
                                    {step === 'backward' ? `grad: ${node.grad.toFixed(2)}` : `val: ${node.value.toFixed(2)}`}
                                </div>
                            </foreignObject>
                        </g>
                    ))}
                </svg>

                {/* Info Tip */}
                <div className="absolute bottom-4 right-4 text-xs text-gray-500 italic max-w-xs text-right">
                    {step === 'forward'
                        ? 'Forward Pass: Values propagate from inputs to output.'
                        : 'Backward Pass: Gradients propagate from L back to inputs (Chain Rule).'}
                </div>
            </div>
        </div>
    );
};
