import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Layers, 
    Sliders, 
    Shield, 
    Award, 
    Terminal, 
    Activity, 
    HelpCircle, 
    AlertTriangle, 
    Sparkles, 
    CheckCircle,
    Play,
    RotateCcw
} from 'lucide-react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';
import { ForwardPassAnimator } from '../components/ForwardPassAnimator';
import { UniversalApproximationViz } from '../components/UniversalApproximationViz';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#3b82f6' }) => (
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
   INTERACTIVE: MLP Layer-Dimension Parameter Builder
   ═══════════════════════════════════════════════════════════════════════ */

export const MLPParameterBuilder: React.FC = () => {
    const [n0, setN0] = useState<number>(3); // Input
    const [n1, setN1] = useState<number>(5); // Hidden 1
    const [n2, setN2] = useState<number>(4); // Hidden 2
    const [n3, setN3] = useState<number>(2); // Output

    // Calculate parameter counts
    const w1Params = n1 * n0;
    const b1Params = n1;
    const w2Params = n2 * n1;
    const b2Params = n2;
    const w3Params = n3 * n2;
    const b3Params = n3;

    const totalParams = w1Params + b1Params + w2Params + b2Params + w3Params + b3Params;

    return (
        <Card className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders size={18} className="text-blue-400" />
                    Interactive MLP Parameter & Dimension Builder
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    Adjust the size of each layer. Witness how the weight matrix dimensions and bias vector shapes adapt to form the computational chain, updating the parameter count.
                </p>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Input Features (n₀)</span>
                        <span className="font-mono text-blue-400 font-bold">{n0}</span>
                    </label>
                    <input type="range" min={1} max={10} value={n0} onChange={e => setN0(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Hidden Neurons 1 (n₁)</span>
                        <span className="font-mono text-blue-400 font-bold">{n1}</span>
                    </label>
                    <input type="range" min={1} max={16} value={n1} onChange={e => setN1(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Hidden Neurons 2 (n₂)</span>
                        <span className="font-mono text-blue-400 font-bold">{n2}</span>
                    </label>
                    <input type="range" min={1} max={16} value={n2} onChange={e => setN2(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Output Neurons (n₃)</span>
                        <span className="font-mono text-blue-400 font-bold">{n3}</span>
                    </label>
                    <input type="range" min={1} max={5} value={n3} onChange={e => setN3(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
            </div>

            {/* Matrix dimension chart */}
            <div className="space-y-3 font-mono text-xs">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Matrix Dimensional Chains</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Layer 1 */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-white block">Layer 1 Projection</span>
                        <div className="space-y-1 text-slate-400">
                            <div className="flex justify-between">
                                <span>W⁽¹⁾ shape:</span>
                                <span className="text-blue-400 font-bold">[{n1} × {n0}]</span>
                            </div>
                            <div className="flex justify-between">
                                <span>b⁽¹⁾ shape:</span>
                                <span className="text-purple-400">[{n1} × 1]</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-900 pt-1 mt-1 text-[10px] text-slate-500">
                                <span>Params:</span>
                                <span>{w1Params} (W) + {b1Params} (b) = {w1Params + b1Params}</span>
                            </div>
                        </div>
                    </div>

                    {/* Layer 2 */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-white block">Layer 2 Projection</span>
                        <div className="space-y-1 text-slate-400">
                            <div className="flex justify-between">
                                <span>W⁽²⁾ shape:</span>
                                <span className="text-blue-400 font-bold">[{n2} × {n1}]</span>
                            </div>
                            <div className="flex justify-between">
                                <span>b⁽²⁾ shape:</span>
                                <span className="text-purple-400">[{n2} × 1]</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-900 pt-1 mt-1 text-[10px] text-slate-500">
                                <span>Params:</span>
                                <span>{w2Params} (W) + {b2Params} (b) = {w2Params + b2Params}</span>
                            </div>
                        </div>
                    </div>

                    {/* Layer 3 */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-white block">Layer 3 Projection</span>
                        <div className="space-y-1 text-slate-400">
                            <div className="flex justify-between">
                                <span>W⁽³⁾ shape:</span>
                                <span className="text-blue-400 font-bold">[{n3} × {n2}]</span>
                            </div>
                            <div className="flex justify-between">
                                <span>b⁽³⁾ shape:</span>
                                <span className="text-purple-400">[{n3} × 1]</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-900 pt-1 mt-1 text-[10px] text-slate-500">
                                <span>Params:</span>
                                <span>{w3Params} (W) + {b3Params} (b) = {w3Params + b3Params}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total parameters banner */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 flex justify-between items-center flex-wrap gap-2">
                <span className="text-sm font-semibold text-slate-300">Total Trainable Network Parameters:</span>
                <span className="text-2xl font-mono font-bold text-white">{totalParams}</span>
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT: MLP Section
   ═══════════════════════════════════════════════════════════════════════ */

export const MLP: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                    <Layers size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 2</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500 mb-4">
                    Feedforward Neural Networks (MLPs)
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Step beyond single-hyperplane boundaries. Explore Multi-Layer Perceptrons (MLPs), 
                    derive the mathematical forward propagation chain, examine the Universal Approximation 
                    Theorem, and mathematically verify how lack of activations collapses representations.
                </p>
            </motion.div>

            {/* ─── 2.1 MLP ARCHITECTURE ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<Layers size={20} className="text-blue-400" />}>
                    2.1 — Multi-Layer Perceptron (MLP) Architecture
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                        <p className="text-sm text-yellow-300 font-bold uppercase tracking-wider mb-1">💡 Real-World Analogy</p>
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            Think of an organizational hierarchy in a major corporation. Front-line analysts (Input Layer) gather raw data and numbers. Lower-level managers (Hidden Layer 1) analyze those numbers looking for specific local trends. Division directors (Hidden Layer 2) aggregate the managers' reports to detect broader regional movements. Finally, the CEO (Output Layer) combines all director inputs to make a single final executive decision (e.g. launch or cancel a product line). Stacking these layers allows the network to learn increasingly abstract feature representations.
                        </p>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        A Multi-Layer Perceptron is a feedforward neural network comprising multiple layers of computational units. Signal flows in one direction: inputs enter the input layer, propagate through one or more hidden layers, and terminate at the output layer. There are no cycles or loops in the graph.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 2.2 MATHEMATICAL DERIVATION ─────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Activity size={20} className="text-blue-400" />}>
                    2.2 — Forward Propagation & Dimensional Chains
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us represent an <MathEquation formula="L" />-layer feedforward network. The output of layer <MathEquation formula="l" /> is computed recursively by multiplying the activations of the previous layer by the weight matrix of the current layer, adding a bias vector, and passing the result through a non-linear activation function <MathEquation formula="f^{(l)}" />:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                        <MathEquation formula="\mathbf{z}^{(l)} = \mathbf{W}^{(l)} \mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}" block />
                        <MathEquation formula="\mathbf{h}^{(l)} = f^{(l)}\left(\mathbf{z}^{(l)}\right)" block />
                        
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono text-slate-500">
                                <thead>
                                    <tr>
                                        <th className="pb-1">Variable</th>
                                        <th className="pb-1">Dimensions</th>
                                        <th className="pb-1">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-blue-400 pr-4"><MathEquation formula="\mathbf{h}^{(0)}" /></td>
                                        <td className="text-slate-400 pr-4">[n_0 \times 1]</td>
                                        <td>Input feature vector <MathEquation formula="\mathbf{x}" /></td>
                                    </tr>
                                    <tr>
                                        <td className="text-blue-400"><MathEquation formula="\mathbf{W}^{(l)}" /></td>
                                        <td className="text-slate-400"><MathEquation formula="[n_l \times n_{l-1}]" /></td>
                                        <td>Weight matrix mapping layer <MathEquation formula="l-1" /> to layer <MathEquation formula="l" /></td>
                                    </tr>
                                    <tr>
                                        <td className="text-blue-400"><MathEquation formula="\mathbf{b}^{(l)}" /></td>
                                        <td className="text-slate-400">[n_l \times 1]</td>
                                        <td>Bias vector shifting thresholds of layer <MathEquation formula="l" /></td>
                                    </tr>
                                    <tr>
                                        <td className="text-blue-400"><MathEquation formula="\mathbf{z}^{(l)}" /></td>
                                        <td className="text-slate-400">[n_l \times 1]</td>
                                        <td>Pre-activation vector of layer <MathEquation formula="l" /></td>
                                    </tr>
                                    <tr>
                                        <td className="text-blue-400"><MathEquation formula="\mathbf{h}^{(l)}" /></td>
                                        <td className="text-slate-400">[n_l \times 1]</td>
                                        <td>Activation/representation vector of layer <MathEquation formula="l" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h4 className="text-md font-bold text-white mt-4">The Entire Network Chain</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-sans">
                        For an <MathEquation formula="L" />-layer neural network, the full mapping is:
                    </p>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="\hat{\mathbf{y}} = f^{(L)}\left( \mathbf{W}^{(L)} f^{(L-1)}\left( \dots f^{(1)}\left(\mathbf{W}^{(1)}\mathbf{x} + \mathbf{b}^{(1)}\right)\dots \right) + \mathbf{b}^{(L)} \right)" block />
                    </div>

                    <Callout variant="pitfall" title="The Linear Collapse Proof">
                        What happens if we omit the non-linear activation functions <MathEquation formula="f^{(l)}" />? The network collapses into a single linear layer!
                        <div className="mt-2 bg-slate-950/40 p-3 rounded border border-slate-850 font-mono text-xs space-y-1.5">
                            <div>For a 2-layer network with no activation: <MathEquation formula="\mathbf{h}^{(1)} = \mathbf{W}^{(1)} \mathbf{x} + \mathbf{b}^{(1)}" /></div>
                            <div>Substitute into layer 2: <MathEquation formula="\hat{\mathbf{y}} = \mathbf{W}^{(2)}\mathbf{h}^{(1)} + \mathbf{b}^{(2)} = \mathbf{W}^{(2)}(\mathbf{W}^{(1)}\mathbf{x} + \mathbf{b}^{(1)}) + \mathbf{b}^{(2)}" /></div>
                            <div>Distributing: <MathEquation formula="\hat{\mathbf{y}} = (\mathbf{W}^{(2)}\mathbf{W}^{(1)})\mathbf{x} + (\mathbf{W}^{(2)}\mathbf{b}^{(1)} + \mathbf{b}^{(2)})" /></div>
                            <div>Define effective parameters: <MathEquation formula="\mathbf{W}_{\mathrm{eff}} = \mathbf{W}^{(2)}\mathbf{W}^{(1)}" /> and <MathEquation formula="\mathbf{b}_{\mathrm{eff}} = \mathbf{W}^{(2)}\mathbf{b}^{(1)} + \mathbf{b}^{(2)}" /></div>
                            <div className="text-red-400">Thus: <MathEquation formula="\hat{\mathbf{y}} = \mathbf{W}_{\mathrm{eff}} \mathbf{x} + \mathbf{b}_{\mathrm{eff}}" /></div>
                        </div>
                        No matter how many hidden layers are stacked, a linear model cannot learn non-linear boundaries. Stacking linear operations is algebraically redundant.
                    </Callout>
                </Card>
            </motion.section>

            {/* ─── PARAMETER BUILDER VISUALIZATION ───────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <MLPParameterBuilder />
            </motion.section>

            {/* ─── FORWARD PASS ANIMATOR VISUALIZATION ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Activity size={20} className="text-blue-400" />}>
                    2.3 — Forward Pass Flow Simulation
                </SectionTitle>
                <ForwardPassAnimator />
            </motion.section>

            {/* ─── 2.4 UNIVERSAL APPROXIMATION THEOREM ────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<CheckCircle size={20} className="text-blue-400" />}>
                    2.4 — Universal Approximation Theorem
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        The mathematical justification for why feedforward neural networks are such powerful function fitters rests on the **Universal Approximation Theorem** (formalized by George Cybenko in 1989 for sigmoids, and generalized by Kurt Hornik in 1991 for arbitrary non-constant activations):
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                        <strong className="text-sm text-blue-400 block font-mono">Formal Theorem Statement</strong>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Let <MathEquation formula="\sigma(\cdot)" /> be a non-constant, bounded, and continuous activation function. Let <MathEquation formula="I_n" /> denote the compact unit hypercube <MathEquation formula="[0, 1]^n" />. Then, for any continuous target function <MathEquation formula="f: I_n \rightarrow \mathbb{R}" /> and any arbitrarily small <MathEquation formula="\epsilon > 0" />, there exists a single hidden layer feedforward network with <MathEquation formula="N" /> neurons:
                        </p>
                        <div className="bg-slate-900/60 p-3 rounded border border-slate-850 text-center">
                            <MathEquation formula="G(\mathbf{x}) = \sum_{j=1}^{N} v_j \sigma\left( \mathbf{w}_j^T \mathbf{x} + b_j \right)" block />
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            such that <MathEquation formula="G(\mathbf{x})" /> approximates <MathEquation formula="f" /> uniformly:
                        </p>
                        <div className="bg-slate-900/60 p-3 rounded border border-slate-850 text-center">
                            <MathEquation formula="\sup_{\mathbf{x} \in I_n} |G(\mathbf{x}) - f(\mathbf{x})| < \epsilon" block />
                        </div>
                    </div>

                    <Callout variant="insight" title="Depth vs. Width Tradeoff">
                        While the theorem guarantees a single hidden layer can fit any function, it says nothing about the required width <MathEquation formula="N" />. In the worst case, <MathEquation formula="N" /> can grow exponentially with input dimension (<MathEquation formula="O(2^n)" />). Modern deep learning bypasses this curse of dimensionality by stacking narrow, deep layers, allowing the network to build hierarchical, compositional features efficiently.
                    </Callout>
                </Card>
            </motion.section>

            {/* ─── UAT VISUALIZATION ─────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Sliders size={20} className="text-blue-400" />}>
                    2.5 — Universal Approximation Simulator
                </SectionTitle>
                <UniversalApproximationViz />
            </motion.section>

            {/* ─── 2.5 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle icon={<Activity size={20} className="text-blue-400" />}>
                    2.6 — Worked Numerical Example (Forward Pass Trace)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us manually compute the forward pass of a 2D input vector <MathEquation formula="\mathbf{x} = [0.5, -0.2]^T" /> through a network with one hidden layer (2 neurons, ReLU activation) and one output neuron (Sigmoid activation).
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
                        <div className="border-b border-slate-900 pb-3">
                            <span className="text-blue-400 font-bold block mb-1">1. Parameter Matrices Given:</span>
                            <div className="bg-slate-900/40 p-2.5 rounded space-y-1">
                                <div><MathEquation formula="\mathbf{W}^{(1)} = \begin{pmatrix} 1.0 & 2.0 \\ -1.0 & 0.5 \end{pmatrix}" /></div>
                                <div><MathEquation formula="\mathbf{b}^{(1)} = \begin{pmatrix} 0.1 \\ -0.2 \end{pmatrix}" /></div>
                                <div><MathEquation formula="\mathbf{W}^{(2)} = \begin{pmatrix} 0.5 & -1.0 \end{pmatrix}" /></div>
                                <div><MathEquation formula="b^{(2)} = 0.3" /></div>
                            </div>
                        </div>

                        <div className="border-b border-slate-900 pb-3">
                            <span className="text-blue-400 font-bold block mb-1">2. Hidden Layer Pre-Activations z⁽¹⁾:</span>
                            <div className="bg-slate-900/40 p-2.5 rounded">
                                <MathEquation formula="\mathbf{z}^{(1)} = \mathbf{W}^{(1)} \mathbf{x} + \mathbf{b}^{(1)} = \begin{pmatrix} 1.0(0.5) + 2.0(-0.2) \\ -1.0(0.5) + 0.5(-0.2) \end{pmatrix} + \begin{pmatrix} 0.1 \\ -0.2 \end{pmatrix}" block />
                                <MathEquation formula="\mathbf{z}^{(1)} = \begin{pmatrix} 0.5 - 0.4 \\ -0.5 - 0.1 \end{pmatrix} + \begin{pmatrix} 0.1 \\ -0.2 \end{pmatrix} = \begin{pmatrix} 0.1 \\ -0.6 \end{pmatrix} + \begin{pmatrix} 0.1 \\ -0.2 \end{pmatrix} = \begin{pmatrix} 0.2 \\ -0.8 \end{pmatrix}" block />
                            </div>
                        </div>

                        <div className="border-b border-slate-900 pb-3">
                            <span className="text-blue-400 font-bold block mb-1">3. Hidden Layer Activations h⁽¹⁾ (ReLU):</span>
                            <p className="text-slate-400">Apply <MathEquation formula="f(x) = \max(0, x)" /> component-wise:</p>
                            <div className="bg-slate-900/40 p-2.5 rounded">
                                <MathEquation formula="\mathbf{h}^{(1)} = \max\left( \mathbf{0}, \mathbf{z}^{(1)} \right) = \begin{pmatrix} \max(0, 0.2) \\ \max(0, -0.8) \end{pmatrix} = \begin{pmatrix} 0.2 \\ 0.0 \end{pmatrix}" block />
                            </div>
                        </div>

                        <div>
                            <span className="text-blue-400 font-bold block mb-1">4. Output Layer Activation y-hat (Sigmoid):</span>
                            <p className="text-slate-400">Compute pre-activation <MathEquation formula="z^{(2)}" />:</p>
                            <div className="bg-slate-900/40 p-2.5 rounded mb-2">
                                <MathEquation formula="z^{(2)} = \mathbf{W}^{(2)} \mathbf{h}^{(1)} + b^{(2)} = \begin{pmatrix} 0.5 & -1.0 \end{pmatrix} \begin{pmatrix} 0.2 \\ 0.0 \end{pmatrix} + 0.3" block />
                                <MathEquation formula="z^{(2)} = 0.5(0.2) - 1.0(0.0) + 0.3 = 0.1 + 0.3 = 0.4" block />
                            </div>
                            <p className="text-slate-400 font-sans">Apply Sigmoid Activation:</p>
                            <div className="bg-slate-900/40 p-2.5 rounded">
                                <MathEquation formula="\hat{y} = \sigma(z^{(2)}) = \frac{1}{1 + e^{-0.4}} \approx \frac{1}{1 + 0.6703} \approx 0.5987" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 2.6 PYTORCH MLP SNIPPET ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <SectionTitle icon={<Terminal size={20} className="text-blue-400" />}>
                    2.7 — PyTorch MLP Implementation
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Multi-Layer Perceptron (MLP) implementation in PyTorch, initializing weight parameters matching our dimensional notations.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn

class MultiLayerPerceptron(nn.Module):
    def __init__(self, input_dim: int, hidden_dims: list, output_dim: int):
        super(MultiLayerPerceptron, self).__init__()
        
        self.layers = nn.ModuleList()
        prev_dim = input_dim
        
        # Build hidden projection layers matching matrix notations W^(l)
        for h_dim in hidden_dims:
            self.layers.append(nn.Linear(prev_dim, h_dim))
            prev_dim = h_dim
            
        # Final output layer
        self.output_layer = nn.Linear(prev_dim, output_dim)
        self.activation = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Propagate through sequential hidden layers
        h = x
        for layer in self.layers:
            # Linear summation (z = W h + b) followed by ReLU activation
            h = self.activation(layer(h))
            
        # Output layer with sigmoid mapping
        return self.sigmoid(self.output_layer(h))

# Test with a single forward pass
if __name__ == "__main__":
    # Concrete dimensions: Input=2, Hidden=[2], Output=1
    mlp = MultiLayerPerceptron(input_dim=2, hidden_dims=[2], output_dim=1)
    
    # Trace identical tensor to our worked example
    x_test = torch.tensor([[0.5, -0.2]], dtype=torch.float32)
    y_pred = mlp(x_test)
    
    print("Network output value:", y_pred.item())`}</code>
                    </pre>
                </Card>
            </motion.section>

            {/* ─── SUMMARY BOX ────────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="bg-blue-950/20 border border-blue-500/20 space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <Award size={18} className="text-blue-400" />
                        Key Takeaways: Chapter 2 Summary
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300 font-sans leading-relaxed">
                        <li><strong>Compositional Learning:</strong> Stacking layers creates hierarchical representations, finding patterns of patterns to yield high-level abstractions.</li>
                        <li><strong>Weight and Bias Shapes:</strong> Weight matrices have shapes <MathEquation formula="[n_l \times n_{l-1}]" />, vector multiplies map previous activations smoothly.</li>
                        <li><strong>The Collapsing Danger:</strong> Without non-linear activation functions, consecutive matrices multiply together, compressing the deep network into a single linear projection.</li>
                        <li><strong>Universal Approximator:</strong> A single hidden layer with continuous activations can fit any continuous function, though deep representations are exponentially more parameter-efficient.</li>
                    </ul>
                </Card>
            </motion.section>

        </div>
    );
};
