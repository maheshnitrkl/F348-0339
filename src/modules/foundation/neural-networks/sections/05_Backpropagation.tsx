import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Network, 
    Activity, 
    HelpCircle, 
    AlertTriangle, 
    Sparkles, 
    CheckCircle,
    Terminal,
    BookOpen,
    Play,
    RotateCcw,
    Award
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Computational Graph Trace Playground
   ═══════════════════════════════════════════════════════════════════════ */

const ComputationalGraphPlayground: React.FC = () => {
    const [wVal, setWVal] = useState<number>(-1.5);
    const [xVal, setXVal] = useState<number>(2.0);
    const [bVal, setBVal] = useState<number>(0.5);
    const [yVal, setYVal] = useState<number>(1.0); // Target toggle 0 or 1
    const [step, setStep] = useState<number>(0); // 0: Idle, 1-4: Forward, 5-8: Backward

    // Forward computations
    const uVal = wVal * xVal;
    const vVal = uVal + bVal;
    const pVal = 1 / (1 + Math.exp(-vVal));
    const lossVal = - (yVal * Math.log(pVal) + (1 - yVal) * Math.log(1 - pVal));

    // Backward adjoint computations
    const dLoss_dLoss = 1.0;
    const dLoss_dp = (pVal - yVal) / (pVal * (1 - pVal));
    const dLoss_dv = pVal - yVal; // simplified Sigmoid-BCE derivative
    const dLoss_du = dLoss_dv;
    const dLoss_db = dLoss_dv;
    const dLoss_dw = dLoss_du * xVal;
    const dLoss_dx = dLoss_du * wVal;

    // Node state styles for animation highlighting
    const getNodeStyle = (activeSteps: number[]) => {
        const isActive = activeSteps.includes(step);
        return {
            fill: isActive ? '#ec489920' : '#0f172a',
            stroke: isActive ? '#ec4899' : '#334155',
            strokeWidth: isActive ? 2.5 : 1.5,
            transition: 'all 0.3s ease'
        };
    };

    const getArrowStyle = (activeSteps: number[]) => {
        const isActive = activeSteps.includes(step);
        return {
            stroke: isActive ? '#ec4899' : '#1e293b',
            strokeWidth: isActive ? 2.5 : 1.5,
            transition: 'all 0.3s ease'
        };
    };

    const stepLabels = [
        'Idle — Click Next to start the Forward Pass',
        'Forward Step 1: Compute product u = w * x',
        'Forward Step 2: Add bias v = u + b',
        'Forward Step 3: Compute prediction p = σ(v)',
        'Forward Step 4: Evaluate Binary Cross-Entropy Loss L',
        'Backward Step 1: Flow starting gradient (dL/dL = 1.0) and calculate dL/dp',
        'Backward Step 2: Propagate back through Sigmoid: dL/dv = dL/dp * σ\'(v)',
        'Backward Step 3: Distribute gradients to sum inputs: dL/du = dL/dv and dL/db = dL/dv',
        'Backward Step 4: Calculate parameter updates: dL/dw = dL/du * x and dL/dx = dL/du * w'
    ];

    return (
        <Card className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Network size={18} className="text-pink-400" />
                        Computational Graph Step-by-Step Debugger
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Trace forward operations and backward analytical gradients through a single neuron node model: <MathEquation formula="z = \sigma(w \cdot x + b)" />.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStep(prev => Math.max(0, prev - 1))}
                        disabled={step === 0}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition-all"
                    >
                        Prev Step
                    </button>
                    <button
                        onClick={() => setStep(prev => Math.min(8, prev + 1))}
                        disabled={step === 8}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-pink-600 text-white hover:bg-pink-500 disabled:opacity-40 transition-all flex items-center gap-1"
                    >
                        <Play size={12} />
                        Next Step
                    </button>
                    <button
                        onClick={() => setStep(0)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                        title="Reset"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Slider parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Weight (w)</span>
                        <span className="font-mono text-pink-400 font-bold">{wVal.toFixed(1)}</span>
                    </label>
                    <input type="range" min="-3" max="3" step="0.5" value={wVal} onChange={e => { setWVal(parseFloat(e.target.value)); setStep(0); }} className="w-full accent-pink-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Input (x)</span>
                        <span className="font-mono text-pink-400 font-bold">{xVal.toFixed(1)}</span>
                    </label>
                    <input type="range" min="0.5" max="3.0" step="0.1" value={xVal} onChange={e => { setXVal(parseFloat(e.target.value)); setStep(0); }} className="w-full accent-pink-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Bias (b)</span>
                        <span className="font-mono text-pink-400 font-bold">{bVal.toFixed(1)}</span>
                    </label>
                    <input type="range" min="-2" max="2" step="0.5" value={bVal} onChange={e => { setBVal(parseFloat(e.target.value)); setStep(0); }} className="w-full accent-pink-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>True Label (y)</span>
                        <span className="font-mono text-pink-400 font-bold">{yVal}</span>
                    </label>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => { setYVal(0); setStep(0); }} className={`flex-1 py-1 rounded text-xs font-bold ${yVal === 0 ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>0</button>
                        <button onClick={() => { setYVal(1); setStep(0); }} className={`flex-1 py-1 rounded text-xs font-bold ${yVal === 1 ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>1</button>
                    </div>
                </div>
            </div>

            {/* Step Explanation Banner */}
            <div className="bg-pink-500/10 border border-pink-500/25 p-3 rounded-xl flex items-center justify-between text-xs text-pink-300">
                <span className="font-mono font-bold">Step {step}/8:</span>
                <span className="font-medium text-right ml-2">{stepLabels[step]}</span>
            </div>

            {/* SVG Computational Graph */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto flex justify-center">
                <svg width="680" height="240" viewBox="0 0 680 240" className="max-w-full">
                    {/* DEF arrows */}
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e293b" />
                        </marker>
                        <marker id="arrow-pink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
                        </marker>
                    </defs>

                    {/* CONNECTIONS (Arrows) */}
                    {/* w -> x (1) */}
                    <line x1="50" y1="50" x2="120" y2="90" markerEnd={step >= 1 ? 'url(#arrow-pink)' : 'url(#arrow)'} style={getArrowStyle([1, 8])} />
                    {/* x -> x (1) */}
                    <line x1="50" y1="150" x2="120" y2="110" markerEnd={step >= 1 ? 'url(#arrow-pink)' : 'url(#arrow)'} style={getArrowStyle([1, 8])} />
                    
                    {/* x -> + (2) */}
                    <line x1="180" y1="100" x2="260" y2="100" markerEnd={step >= 2 ? 'url(#arrow-pink)' : 'url(#arrow)'} style={getArrowStyle([2, 7])} />
                    {/* b -> + (2) */}
                    <line x1="290" y1="190" x2="290" y2="135" markerEnd={step >= 2 ? 'url(#arrow-pink)' : 'url(#arrow)'} style={getArrowStyle([2, 7])} />
                    
                    {/* + -> sigmoid (3) */}
                    <line x1="320" y1="100" x2="400" y2="100" markerEnd={step >= 3 ? 'url(#arrow-pink)' : 'url(#arrow)'} style={getArrowStyle([3, 6])} />
                    
                    {/* sigmoid -> Loss (4) */}
                    <line x1="460" y1="100" x2="540" y2="100" markerEnd={step >= 4 ? 'url(#arrow-pink)' : 'url(#arrow)'} style={getArrowStyle([4, 5])} />

                    {/* NODES */}
                    
                    {/* Input w */}
                    <g className="cursor-pointer">
                        <circle cx="50" cy="50" r="24" style={getNodeStyle([0, 8])} />
                        <text x="50" y="46" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">w (weight)</text>
                        <text x="50" y="58" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold">{wVal.toFixed(1)}</text>
                        {step >= 8 && (
                            <text x="50" y="88" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold" className="font-mono">
                                ∂L/∂w = {dLoss_dw.toFixed(3)}
                            </text>
                        )}
                    </g>

                    {/* Input x */}
                    <g className="cursor-pointer">
                        <circle cx="50" cy="150" r="24" style={getNodeStyle([0, 8])} />
                        <text x="50" y="146" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">x (input)</text>
                        <text x="50" y="158" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold">{xVal.toFixed(1)}</text>
                        {step >= 8 && (
                            <text x="50" y="188" textAnchor="middle" fill="#94a3b8" fontSize="8" className="font-mono">
                                ∂L/∂x = {dLoss_dx.toFixed(3)}
                            </text>
                        )}
                    </g>

                    {/* Operator * */}
                    <g className="cursor-pointer">
                        <circle cx="150" cy="100" r="30" style={getNodeStyle([1, 8])} />
                        <text x="150" y="92" textAnchor="middle" fill="#94a3b8" fontSize="16" fontWeight="bold">×</text>
                        {step >= 1 ? (
                            <text x="150" y="108" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="font-mono">
                                u = {uVal.toFixed(2)}
                            </text>
                        ) : (
                            <text x="150" y="108" textAnchor="middle" fill="#475569" fontSize="8">w * x</text>
                        )}
                        {step >= 7 && (
                            <text x="150" y="146" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold" className="font-mono">
                                ∂L/∂u = {dLoss_du.toFixed(3)}
                            </text>
                        )}
                    </g>

                    {/* Input b */}
                    <g className="cursor-pointer">
                        <circle cx="290" cy="190" r="24" style={getNodeStyle([0, 7])} />
                        <text x="290" y="186" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">b (bias)</text>
                        <text x="290" y="198" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold">{bVal.toFixed(1)}</text>
                        {step >= 7 && (
                            <text x="354" y="206" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold" className="font-mono">
                                ∂L/∂b = {dLoss_db.toFixed(3)}
                            </text>
                        )}
                    </g>

                    {/* Operator + */}
                    <g className="cursor-pointer">
                        <circle cx="290" cy="100" r="30" style={getNodeStyle([2, 7])} />
                        <text x="290" y="92" textAnchor="middle" fill="#94a3b8" fontSize="16" fontWeight="bold">+</text>
                        {step >= 2 ? (
                            <text x="290" y="108" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="font-mono">
                                v = {vVal.toFixed(2)}
                            </text>
                        ) : (
                            <text x="290" y="108" textAnchor="middle" fill="#475569" fontSize="8">u + b</text>
                        )}
                        {step >= 7 && (
                            <text x="290" y="54" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold" className="font-mono">
                                ∂L/∂v = {dLoss_dv.toFixed(3)}
                            </text>
                        )}
                    </g>

                    {/* Activation σ */}
                    <g className="cursor-pointer">
                        <circle cx="430" cy="100" r="30" style={getNodeStyle([3, 6])} />
                        <text x="430" y="94" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">σ (sigmoid)</text>
                        {step >= 3 ? (
                            <text x="430" y="110" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="font-mono">
                                p = {pVal.toFixed(3)}
                            </text>
                        ) : (
                            <text x="430" y="110" textAnchor="middle" fill="#475569" fontSize="8">1/(1+e⁻ᵛ)</text>
                        )}
                        {step >= 5 && (
                            <text x="430" y="146" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold" className="font-mono">
                                ∂L/∂p = {dLoss_dp.toFixed(3)}
                            </text>
                        )}
                    </g>

                    {/* Loss Evaluation */}
                    <g className="cursor-pointer">
                        <rect x="540" y="70" width="80" height="60" rx="8" style={getNodeStyle([4, 5])} />
                        <text x="580" y="88" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">L (BCE Loss)</text>
                        {step >= 4 ? (
                            <text x="580" y="108" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" className="font-mono">
                                {lossVal.toFixed(4)}
                            </text>
                        ) : (
                            <text x="580" y="108" textAnchor="middle" fill="#475569" fontSize="8">Objective</text>
                        )}
                        {step >= 5 && (
                            <text x="580" y="146" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold" className="font-mono">
                                ∂L/∂L = {dLoss_dLoss.toFixed(1)}
                            </text>
                        )}
                    </g>
                </svg>
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const Backpropagation: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-pink-400 mb-4">
                    <Network size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 5</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-pink-500 mb-4">
                    Backpropagation & Autodiff
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Trace gradients recursively. Derive the vector chain rule, master the mechanical backpropagation 
                    equations across stacked matrix chains, compare automatic differentiation modes, and check custom 
                    numerical derivatives.
                </p>
            </motion.div>

            {/* ─── 5.1 COMPUTATIONAL GRAPHS & AUTODIFF ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-pink-400" />}>
                    5.1 — Computational Graphs & Adjoint Propagation
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="Attributing Blame in a Decision Hierarchy">
                        Consider a multi-stage corporate hierarchy compiling a project proposal. 
                        Junior analysts feed raw data (Inputs), project coordinators assemble it into slides (Hidden Layer 1), directors select which slides to show (Hidden Layer 2), and the VP gives the final client presentation (Output). 
                        If the proposal is rejected by the client (Loss), how do we improve? We don't guess randomly. 
                        Instead, we trace the presentation slide by slide *backwards* through the hierarchy. The VP reviews which slides were poor, blaming the directors; directors trace the poor slides back to the coordinators; coordinators pinpoint the analytical calculation error. 
                        This backward trace allows every contributor to learn exactly how to adjust their parameters (weights) to reduce the error on the next proposal.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Any differentiable function can be represented as a **Computational Graph**, where vertices are mathematical operators (addition, multiplication, activations) and edges represent intermediate variables or tensor values.
                    </p>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        During the **Forward Pass**, inputs propagate from left to right, evaluating and storing intermediate nodes. During the **Backward Pass**, we flow gradients in reverse from right to left using the chain rule. We define the **Adjoint** of an intermediate variable <MathEquation formula="v" /> as its derivative with respect to the loss:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="\bar{v} = \frac{\partial \mathcal{L}}{\partial v}" block />
                    </div>

                    <h4 className="text-md font-bold text-white mt-4">Forward-Mode vs. Reverse-Mode Autodiff</h4>
                    <p className="text-slate-300 leading-relaxed font-sans">
                        There are two core modes of Automatic Differentiation (Autodiff):
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400 leading-relaxed font-sans">
                        <li><strong>Forward-Mode Autodiff:</strong> Computes derivatives <MathEquation formula="\frac{\partial \mathbf{y}}{\partial x}" /> from inputs to outputs. It tracks how a single input affects all intermediate variables. Ideal when the number of inputs is very small compared to outputs.</li>
                        <li><strong>Reverse-Mode Autodiff (Backpropagation):</strong> Computes gradients <MathEquation formula="\frac{\partial \mathcal{L}}{\partial \mathbf{x}}" /> from output loss to input variables. It requires a single backward sweep to find gradients for all parameters. Because neural networks have millions of input parameters (<MathEquation formula="P" />) and only a single scalar output loss (<MathEquation formula="O=1" />), Reverse-Mode is exponentially more efficient: <MathEquation formula="O(1)" /> backward passes instead of <MathEquation formula="O(P)" /> forward passes.</li>
                    </ul>
                </Card>
            </motion.section>

            {/* ─── 5.2 MATHEMATICAL DERIVATION ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-pink-400" />}>
                    5.2 — Vector Chain Rule & Layer Derivations
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        To propagate error gradients through vector-valued layers, we formulate the multivariate **Vector Chain Rule**. Let <MathEquation formula="\mathbf{y} = g(\mathbf{x})" /> and <MathEquation formula="z = f(\mathbf{y})" />:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center font-bold">
                        <MathEquation formula="\nabla_{\mathbf{x}} z = \left( \frac{\partial \mathbf{y}}{\partial \mathbf{x}} \right)^T \nabla_{\mathbf{y}} z" block />
                        <p className="text-xs text-slate-500 font-normal text-left mt-2">
                            Where <MathEquation formula="\frac{\partial \mathbf{y}}{\partial \mathbf{x}}" /> represents the Jacobian matrix of partial derivatives where element <MathEquation formula="J_{ij} = \frac{\partial y_i}{\partial x_j}" />.
                        </p>
                    </div>

                    <h4 className="text-md font-bold text-white mt-6">The Four Fundamental Equations of Backpropagation</h4>
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Consider a layer <MathEquation formula="l" /> computing pre-activation <MathEquation formula="\mathbf{z}^{(l)} = \mathbf{W}^{(l)} \mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}" /> and activation output <MathEquation formula="\mathbf{h}^{(l)} = f^{(l)}(\mathbf{z}^{(l)})" />. We define the error vector <MathEquation formula="\delta^{(l)}" /> of layer <MathEquation formula="l" /> as the gradient with respect to pre-activations:
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-6 text-xs font-mono">
                        <div className="space-y-1.5">
                            <span className="text-pink-400 font-bold block">1. Error at Output Layer L:</span>
                            <MathEquation formula="\delta^{(L)} = \nabla_{\mathbf{h}^{(L)}} \mathcal{L} \odot f'\left(\mathbf{z}^{(L)}\right)" block />
                            <span className="text-slate-500 font-sans block text-[11px]">Calculates the final layer error. Pair-wise multiplies (Hadamard product $\odot$) the loss derivative with the activation gradient.</span>
                        </div>

                        <div className="border-t border-slate-900 pt-4 space-y-1.5">
                            <span className="text-pink-400 font-bold block">2. Error Propagation to Hidden Layer l:</span>
                            <MathEquation formula="\delta^{(l)} = \left( \mathbf{W}^{(l+1)T} \delta^{(l+1)} \right) \odot f'\left(\mathbf{z}^{(l)}\right)" block />
                            <span className="text-slate-500 font-sans block text-[11px]">Recursively projects the error backward from layer $l+1$ to $l$ using transposed weights.</span>
                        </div>

                        <div className="border-t border-slate-900 pt-4 space-y-1.5">
                            <span className="text-pink-400 font-bold block">3. Weight Parameter Gradient:</span>
                            <MathEquation formula="\frac{\partial \mathcal{L}}{\partial \mathbf{W}^{(l)}} = \delta^{(l)} \left( \mathbf{h}^{(l-1)} \right)^T" block />
                            <span className="text-slate-500 font-sans block text-[11px]">Inner product matrix calculation mapping error at output neurons with input activations.</span>
                        </div>

                        <div className="border-t border-slate-900 pt-4 space-y-1.5">
                            <span className="text-pink-400 font-bold block">4. Bias Parameter Gradient:</span>
                            <MathEquation formula="\frac{\partial \mathcal{L}}{\partial \mathbf{b}^{(l)}} = \delta^{(l)}" block />
                            <span className="text-slate-500 font-sans block text-[11px]">Since bias is additive, its gradient is identically equal to the accumulated layer error.</span>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── GRAPH PLAYGROUND VISUALIZATION ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-pink-400" />}>
                    5.3 — Step-by-Step Computational Trace
                </SectionTitle>
                <ComputationalGraphPlayground />
            </motion.section>

            {/* ─── 5.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-pink-400" />}>
                    5.4 — Worked Numerical Example (Hand-Trace)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us trace a single-neuron forward and backward propagation pass using concrete values. Let:
                        <MathEquation formula="x = 2.0, \quad w = -1.5, \quad b = 0.5, \quad \text{target } y = 1.0" block />
                        We use Binary Cross-Entropy loss <MathEquation formula="\mathcal{L} = -y \ln(p) - (1-y)\ln(1-p)" /> paired with Sigmoid activation <MathEquation formula="p = \sigma(v)" />.
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4 leading-relaxed">
                        <div>
                            <span className="text-pink-400 font-bold block mb-1">Phase I: Forward Pass Evaluation</span>
                            <div className="space-y-1 pl-2">
                                <div>1. Multiplication output: <MathEquation formula="u = w \cdot x = (-1.5) \cdot 2.0 = -3.0" /></div>
                                <div>2. Sum pre-activation: <MathEquation formula="v = u + b = -3.0 + 0.5 = -2.5" /></div>
                                <div>3. Sigmoid output prediction: <MathEquation formula="p = \sigma(-2.5) = \frac{1}{1 + e^{2.5}} \approx \frac{1}{1 + 12.1825} \approx 0.07585" /></div>
                                <div>4. Objective Loss value: <MathEquation formula="\mathcal{L} = -[1 \ln(0.07585) + 0] = -\ln(0.07585) \approx 2.5790" /></div>
                            </div>
                        </div>

                        <div className="border-t border-slate-900 pt-3">
                            <span className="text-pink-400 font-bold block mb-1">Phase II: Backward Pass Derivative Flow</span>
                            <div className="space-y-1 pl-2">
                                <div>1. Base loss derivative: <MathEquation formula="\frac{\partial \mathcal{L}}{\partial \mathcal{L}} = 1.0" /></div>
                                <div>2. Prediction gradient: <MathEquation formula="\bar{p} = \frac{\partial \mathcal{L}}{\partial p} = -\frac{y}{p} = -\frac{1}{0.07585} \approx -13.1837" /></div>
                                <div>3. Pre-activation gradient: <MathEquation formula="\bar{v} = \bar{p} \cdot \sigma'(v) = \bar{p} \cdot p(1-p) = -13.1837 \cdot 0.07585 \cdot (1 - 0.07585)" /></div>
                                <div className="text-cyan-400 font-bold"><MathEquation formula="\bar{v} = p - y = 0.07585 - 1.0 = -0.92415" /> (matching simplified derivation!)</div>
                                <div>4. Bias gradient: <MathEquation formula="\bar{b} = \bar{v} \cdot \frac{\partial v}{\partial b} = -0.92415 \cdot 1.0 = -0.92415" /></div>
                                <div>5. Product gradient: <MathEquation formula="\bar{u} = \bar{v} \cdot \frac{\partial v}{\partial u} = -0.92415 \cdot 1.0 = -0.92415" /></div>
                                <div>6. Weight parameter gradient: <MathEquation formula="\bar{w} = \bar{u} \cdot \frac{\partial u}{\partial w} = \bar{u} \cdot x = -0.92415 \cdot 2.0 = -1.8483" /></div>
                                <div>7. Input gradient: <MathEquation formula="\bar{x} = \bar{u} \cdot \frac{\partial u}{\partial x} = \bar{u} \cdot w = -0.92415 \cdot (-1.5) = 1.3862" /></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 5.5 PYTORCH MANUALLY GRADIENT SNIPPET ───────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-pink-400" />}>
                    5.5 — PyTorch Custom Autograd Implementations
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        You can override PyTorch Autograd mechanisms to implement manual backpropagation. Here is a custom linear projection followed by a Sigmoid layer with manual analytical derivative updates.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch

class CustomLinearSigmoidFunction(torch.autograd.Function):
    @staticmethod
    def forward(ctx, x, w, b):
        """
        x: input tensor [batch_size, input_dim]
        w: weight tensor [output_dim, input_dim]
        b: bias tensor [output_dim]
        """
        # Save tensors for backward pass calculations
        ctx.save_for_backward(x, w, b)
        
        # Linear projection: v = x @ w.T + b
        v = torch.matmul(x, w.t()) + b
        
        # Sigmoid activation: p = 1 / (1 + exp(-v))
        p = 1.0 / (1.0 + torch.exp(-v))
        
        # Save output prediction since we need it for gradient
        ctx.saved_predictions = p
        return p

    @staticmethod
    def backward(ctx, grad_output):
        """
        grad_output: gradient of Loss w.r.t prediction (dL/dp)
        """
        x, w, b = ctx.saved_tensors
        p = ctx.saved_predictions
        
        # Derivative of Sigmoid: dp/dv = p * (1 - p)
        # Gradient w.r.t pre-activation: dL/dv = dL/dp * dp/dv
        dL_dv = grad_output * p * (1.0 - p)
        
        # Gradients w.r.t parameters
        # dL/dw = dL/dv.t() @ x
        dL_dw = torch.matmul(dL_dv.t(), x)
        
        # dL/db = sum over batch dimension of dL/dv
        dL_db = dL_dv.sum(dim=0)
        
        # dL/dx = dL/dv @ w
        dL_dx = torch.matmul(dL_dv, w)
        
        return dL_dx, dL_dw, dL_db

# Wire custom layer as nn.Module
class CustomLinearSigmoid(torch.nn.Module):
    def __init__(self, in_features, out_features):
        super(CustomLinearSigmoid, self).__init__()
        self.w = torch.nn.Parameter(torch.randn(out_features, in_features))
        self.b = torch.nn.Parameter(torch.randn(out_features))

    def forward(self, x):
        return CustomLinearSigmoidFunction.apply(x, self.w, self.b)

if __name__ == "__main__":
    # Test correct implementation matching PyTorch automatic autodiff
    layer = CustomLinearSigmoid(in_features=3, out_features=2)
    x_test = torch.randn(1, 3, requires_grad=True)
    
    # Check gradients using PyTorch's gradcheck
    # gradcheck takes double precision tensors to check analytical vs numerical gradients
    test_w = torch.randn(2, 3, dtype=torch.float64, requires_grad=True)
    test_b = torch.randn(2, dtype=torch.float64, requires_grad=True)
    test_x = torch.randn(1, 3, dtype=torch.float64, requires_grad=True)
    
    test_passed = torch.autograd.gradcheck(
        CustomLinearSigmoidFunction.apply, 
        (test_x, test_w, test_b), 
        eps=1e-6, 
        atol=1e-4
    )
    print("Autograd Gradcheck Passed?", test_passed)`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
