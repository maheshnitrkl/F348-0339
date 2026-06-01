import React, { useState } from 'react';
import { Network, Target, GitCommit, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';

type StepInfo = {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    desc: string;
    math: string;
};

const STEPS: StepInfo[] = [
    {
        id: 'forward',
        title: 'Forward Pass',
        icon: <Network size={20} />,
        color: 'text-cyan-400',
        desc: "Input data flows sequentially through the network's layers, undergoing linear transformations and non-linear activations. The output is the model's prediction based on its current parameters.",
        math: "\\hat{y} = f(W_2 \cdot f(W_1 \cdot x + b_1) + b_2)"
    },
    {
        id: 'loss',
        title: 'Loss Computation',
        icon: <Target size={20} />,
        color: 'text-rose-400',
        desc: "The predicted output is mathematically compared to the actual ground truth using a loss function. This scalar value acts as a proxy for the model's overall performance.",
        math: "L = \\text{Loss}(\\hat{y}, y_{true})"
    },
    {
        id: 'backprop',
        title: 'Backpropagation',
        icon: <GitCommit size={20} />,
        color: 'text-violet-400',
        desc: "The gradient of the loss is calculated with respect to every parameter in the network by applying the chain rule of calculus backward from the output to the input.",
        math: "\\nabla W = \\frac{\\partial L}{\\partial W}"
    },
    {
        id: 'update',
        title: 'Parameter Update',
        icon: <Activity size={20} />,
        color: 'text-emerald-400',
        desc: "Optimization algorithms (like SGD or Adam) use the calculated gradients to update the weights and biases, stepping the parameters in the direction that minimizes the loss.",
        math: "W_{new} = W_{old} - \\eta \\cdot \\nabla W"
    }
];

export function TrainingLifecycleViz() {
    const [currentStep, setCurrentStep] = useState(0);
    
    // SVG Dimensions
    const width = 800;
    const height = 400;
    
    // Network Layout
    const layers = [
        { id: 'input', nodes: 3, x: 150 },
        { id: 'hidden', nodes: 5, x: 400 },
        { id: 'output', nodes: 2, x: 650 }
    ];

    const getNodeY = (layerIdx: number, nodeIdx: number) => {
        const totalNodes = layers[layerIdx].nodes;
        const spacing = 60;
        const startY = height / 2 - ((totalNodes - 1) * spacing) / 2;
        return startY + nodeIdx * spacing;
    };

    const nextStep = () => setCurrentStep(prev => (prev + 1) % 4);
    const prevStep = () => setCurrentStep(prev => (prev - 1 + 4) % 4);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Custom CSS for Flow Animations */}
            <style>
                {`
                @keyframes flowForward {
                    0% { stroke-dashoffset: 20; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes flowBackward {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 20; }
                }
                @keyframes pulseWeight {
                    0% { stroke-width: 1; opacity: 0.2; }
                    50% { stroke-width: 4; opacity: 0.8; stroke: #10b981; }
                    100% { stroke-width: 1; opacity: 0.2; }
                }
                .edge-forward {
                    stroke-dasharray: 5, 5;
                    animation: flowForward 0.5s linear infinite;
                    stroke: #06b6d4;
                    opacity: 0.6;
                    stroke-width: 2;
                }
                .edge-backward {
                    stroke-dasharray: 5, 5;
                    animation: flowBackward 0.5s linear infinite;
                    stroke: #8b5cf6;
                    opacity: 0.6;
                    stroke-width: 2;
                }
                .edge-update {
                    animation: pulseWeight 1.5s ease-in-out infinite;
                }
                .edge-idle {
                    stroke: #334155;
                    stroke-width: 1;
                    opacity: 0.3;
                }
                `}
            </style>

            {/* SVG Visualizer Canvas */}
            <div className="flex-1 bg-slate-950 p-6 flex justify-center items-center relative min-h-[400px]">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="max-w-full">
                    
                    {/* Draw Edges */}
                    {layers.map((layer, lIdx) => {
                        if (lIdx === layers.length - 1) return null;
                        const nextLayer = layers[lIdx + 1];
                        
                        return Array.from({ length: layer.nodes }).map((_, n1) => {
                            return Array.from({ length: nextLayer.nodes }).map((_, n2) => {
                                const x1 = layer.x;
                                const y1 = getNodeY(lIdx, n1);
                                const x2 = nextLayer.x;
                                const y2 = getNodeY(lIdx + 1, n2);
                                
                                let edgeClass = 'edge-idle';
                                if (currentStep === 0) edgeClass = 'edge-forward';
                                if (currentStep === 2) edgeClass = 'edge-backward';
                                if (currentStep === 3) edgeClass = 'edge-update';

                                // Add stagger to update animation
                                const delay = (n1 * nextLayer.nodes + n2) * 0.05;

                                return (
                                    <line 
                                        key={`edge-${lIdx}-${n1}-${n2}`}
                                        x1={x1} y1={y1} x2={x2} y2={y2}
                                        className={edgeClass}
                                        style={currentStep === 3 ? { animationDelay: `${delay}s` } : {}}
                                    />
                                );
                            });
                        });
                    })}

                    {/* Draw Nodes */}
                    {layers.map((layer, lIdx) => {
                        return Array.from({ length: layer.nodes }).map((_, nIdx) => {
                            const cx = layer.x;
                            const cy = getNodeY(lIdx, nIdx);
                            
                            let fill = '#1e293b';
                            let stroke = '#475569';
                            let glow = false;

                            if (currentStep === 0 && lIdx === 0) { fill = '#0891b2'; glow = true; } // Input glowing forward
                            if (currentStep === 0 && lIdx === 1) { fill = '#0e7490'; }
                            if (currentStep === 1 && lIdx === 2) { fill = '#e11d48'; glow = true; stroke = '#f43f5e'; } // Output glowing loss
                            if (currentStep === 2 && lIdx === 2) { fill = '#7c3aed'; glow = true; stroke = '#8b5cf6'; } // Output backprop start
                            if (currentStep === 2 && lIdx === 1) { fill = '#6d28d9'; } 
                            if (currentStep === 3) { stroke = '#10b981'; } // All nodes green outline

                            return (
                                <g key={`node-${lIdx}-${nIdx}`}>
                                    {glow && (
                                        <circle cx={cx} cy={cy} r={20} fill={fill} opacity={0.3} className="animate-ping" />
                                    )}
                                    <circle cx={cx} cy={cy} r={14} fill={fill} stroke={stroke} strokeWidth={3} className="transition-all duration-300" />
                                </g>
                            );
                        });
                    })}

                    {/* Target Node & Loss Connection (Step 1) */}
                    {currentStep === 1 && (
                        <g className="animate-fade-in">
                            <text x={750} y={height/2 - 40} fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle">Loss computed</text>
                            <line x1={650} y1={height/2 - 30} x2={750} y2={height/2} stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
                            <line x1={650} y1={height/2 + 30} x2={750} y2={height/2} stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
                            
                            {/* Ground Truth Node */}
                            <circle cx={750} cy={height/2} r={16} fill="#0f172a" stroke="#22c55e" strokeWidth={3} />
                            <text x={750} y={height/2 + 35} fill="#22c55e" fontSize="12" textAnchor="middle">Target (y)</text>
                        </g>
                    )}

                    {/* Labels */}
                    <text x={150} y={40} fill="#64748b" fontSize="14" fontWeight="bold" textAnchor="middle">Input (x)</text>
                    <text x={400} y={40} fill="#64748b" fontSize="14" fontWeight="bold" textAnchor="middle">Hidden Layers</text>
                    <text x={650} y={40} fill="#64748b" fontSize="14" fontWeight="bold" textAnchor="middle">Prediction (ŷ)</text>
                </svg>
            </div>

            {/* Sidebar Controls & Content */}
            <div className="w-full md:w-80 bg-slate-900/80 p-6 flex flex-col border-l border-slate-800">
                <h4 className="text-white font-bold text-xl mb-6">Interactive Lifecycle</h4>
                
                {/* Stepper Buttons */}
                <div className="flex flex-col gap-2 mb-8">
                    {STEPS.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(idx)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all border text-left ${
                                currentStep === idx 
                                    ? `bg-slate-800 border-${step.color.split('-')[1]}-500/50 shadow-lg scale-105` 
                                    : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:bg-slate-800/60'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${currentStep === idx ? `bg-slate-900 ${step.color}` : 'bg-slate-900/50'}`}>
                                {step.icon}
                            </div>
                            <div className="flex-1">
                                <span className="text-xs text-slate-500 block mb-0.5">Step {idx + 1}</span>
                                <span className={`font-bold ${currentStep === idx ? 'text-white' : ''}`}>{step.title}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Dynamic Content Panel */}
                <div className="mt-auto bg-black/40 p-5 rounded-xl border border-slate-800 relative overflow-hidden min-h-[160px]">
                    <div className={`absolute top-0 left-0 w-1 h-full bg-${STEPS[currentStep].color.split('-')[1]}-500`}></div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={STEPS[currentStep].color}>{STEPS[currentStep].icon}</span>
                        <h5 className="font-bold text-white">{STEPS[currentStep].title}</h5>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                        {STEPS[currentStep].desc}
                    </p>
                    <div className="bg-slate-900 rounded p-2 text-center">
                        <MathEquation formula={STEPS[currentStep].math} />
                    </div>
                </div>

                {/* Prev / Next Controls */}
                <div className="flex gap-2 mt-4">
                    <button onClick={prevStep} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold flex items-center justify-center gap-1 transition-colors">
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button onClick={nextStep} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold flex items-center justify-center gap-1 transition-colors">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
