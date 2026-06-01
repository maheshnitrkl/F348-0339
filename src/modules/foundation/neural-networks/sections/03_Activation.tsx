import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, 
    Activity, 
    HelpCircle, 
    AlertTriangle, 
    Sparkles, 
    CheckCircle,
    Terminal,
    BookOpen,
    Layers,
    Award
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';
import { ActivationPlayground } from '../components/ActivationPlayground';
import { VanishingGradientViz } from '../components/VanishingGradientViz';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT: Activation Section
   ═══════════════════════════════════════════════════════════════════════ */

export const Activation: React.FC = () => {
    const [activeDerivTab, setActiveDerivTab] = useState<'sigmoid' | 'tanh' | 'relu' | 'gelu' | 'silu' | 'softmax'>('sigmoid');

    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-cyan-400 mb-4">
                    <Zap size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 3</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-500 mb-4">
                    Activation Functions
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Unleash non-linear representation. Dive deep into classical and transformer-era activation 
                    functions, derive their analytical gradients, examine the vanishing gradient limitation, 
                    and explore stable Softmax and modern gated variants.
                </p>
            </motion.div>

            {/* ─── 3.1 WHY ACTIVATIONS? ───────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-cyan-400" />}>
                    3.1 — The Non-Linearity Mandate
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="Dimmer Switches, Valves, and Gated Channels">
                        Think of neural activations as physical control mechanisms in a processing pipeline. 
                        A classical **Sigmoid** behaves like a dimmer switch, smoothly scaling inputs between 0 and 1. 
                        A **ReLU** operates like a pressure relief valve, completely closed for negative pressure (outputting 0) but opening linearly once pressure becomes positive. 
                        A modern **GELU** or **Swish** acts like a smooth, probabilistic valve that allows a tiny leak on the negative side before transitioning to full flow, preventing a sudden structural collapse of the gradient signal.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Mathematically, why can we not simply stack linear projections? Consider a network with <MathEquation formula="L" /> layers where each layer is defined without an activation function:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                        <p className="text-xs text-slate-400">Layer propagation without non-linearities:</p>
                        <MathEquation formula="\mathbf{h}^{(l)} = \mathbf{W}^{(l)} \mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}" block />
                        <p className="text-xs text-slate-400">Substituting recursively for a 3-layer model:</p>
                        <MathEquation formula="\hat{\mathbf{y}} = \mathbf{W}^{(3)} \left( \mathbf{W}^{(2)} \left( \mathbf{W}^{(1)} \mathbf{x} + \mathbf{b}^{(1)} \right) + \mathbf{b}^{(2)} \right) + \mathbf{b}^{(3)}" block />
                        <MathEquation formula="\hat{\mathbf{y}} = \left( \mathbf{W}^{(3)}\mathbf{W}^{(2)}\mathbf{W}^{(1)} \right) \mathbf{x} + \left( \mathbf{W}^{(3)}\mathbf{W}^{(2)}\mathbf{b}^{(1)} + \mathbf{W}^{(3)}\mathbf{b}^{(2)} + \mathbf{b}^{(3)} \right)" block />
                        <p className="text-xs text-slate-400">Defining effective parameters:</p>
                        <MathEquation formula="\mathbf{W}_{\mathrm{eff}} = \mathbf{W}^{(3)}\mathbf{W}^{(2)}\mathbf{W}^{(1)}, \quad \mathbf{b}_{\mathrm{eff}} = \mathbf{W}^{(3)}\mathbf{W}^{(2)}\mathbf{b}^{(1)} + \mathbf{W}^{(3)}\mathbf{b}^{(2)} + \mathbf{b}^{(3)}" block />
                        <div className="text-xs text-cyan-400 text-center font-bold">
                            <MathEquation formula="\hat{\mathbf{y}} = \mathbf{W}_{\mathrm{eff}} \mathbf{x} + \mathbf{b}_{\mathrm{eff}}" />
                        </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Because matrix multiplication is associative, stacking <MathEquation formula="L" /> consecutive linear projections collapses algebraically into a single linear map. Non-linear activation functions break this linear chain, allowing each hidden layer to project inputs into complex, curved manifolds.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 3.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-cyan-400" />}>
                    3.2 — Analytical Gradients & Formulations
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Backpropagation utilizes the analytical derivative of each activation function to flow gradients from the output to early layers. Let us derive the exact equations for classical and state-of-the-art functions.
                    </p>

                    {/* Tabs for derivation */}
                    <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
                        {(['sigmoid', 'tanh', 'relu', 'gelu', 'silu', 'softmax'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveDerivTab(tab)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${activeDerivTab === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
                            >
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                        {activeDerivTab === 'sigmoid' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white">Sigmoid Activation</h4>
                                <MathEquation formula="\sigma(x) = \frac{1}{1 + e^{-x}}" block />
                                <strong className="text-xs text-slate-400 block font-mono">Derivative Derivation:</strong>
                                <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
                                    <div>Apply the quotient rule or reciprocal rule:</div>
                                    <MathEquation formula="\frac{d}{dx} (1 + e^{-x})^{-1} = -(1 + e^{-x})^{-2} \cdot (-e^{-x}) = \frac{e^{-x}}{(1 + e^{-x})^2}" block />
                                    <div>Rewrite by adding and subtracting 1 in the numerator:</div>
                                    <MathEquation formula="\frac{e^{-x}}{(1 + e^{-x})^2} = \frac{1}{(1 + e^{-x})} \cdot \frac{e^{-x}}{(1 + e^{-x})} = \sigma(x) \left( \frac{1 + e^{-x} - 1}{1 + e^{-x}} \right)" block />
                                    <MathEquation formula="= \sigma(x) \left( 1 - \frac{1}{1 + e^{-x}} \right) = \sigma(x)(1 - \sigma(x))" block />
                                </div>
                                <Callout variant="pitfall" title="Saturation Danger">
                                    When <MathEquation formula="x \to \pm\infty" />, <MathEquation formula="\sigma(x)" /> approaches 0 or 1. Consequently, the gradient <MathEquation formula="\sigma'(x) = \sigma(x)(1 - \sigma(x))" /> vanishes to 0, stopping updates in early layers.
                                </Callout>
                            </div>
                        )}

                        {activeDerivTab === 'tanh' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white">Hyperbolic Tangent (Tanh)</h4>
                                <MathEquation formula="\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}" block />
                                <strong className="text-xs text-slate-400 block font-mono">Derivative Derivation:</strong>
                                <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
                                    <div>Recall that <MathEquation formula="\tanh(x) = \frac{\sinh(x)}{\cosh(x)}" />:</div>
                                    <MathEquation formula="\frac{d}{dx} \tanh(x) = \frac{\cosh(x)\cosh(x) - \sinh(x)\sinh(x)}{\cosh^2(x)}" block />
                                    <div>Using the hyperbolic identity <MathEquation formula="\cosh^2(x) - \sinh^2(x) = 1" />:</div>
                                    <MathEquation formula="\frac{d}{dx} \tanh(x) = \frac{1}{\cosh^2(x)} = 1 - \frac{\sinh^2(x)}{\cosh^2(x)} = 1 - \tanh^2(x)" block />
                                </div>
                                <Callout variant="insight" title="Zero-Centering">
                                    Unlike Sigmoid, Tanh outputs are zero-centered in <MathEquation formula="[-1, 1]" />. This helps keep activations balanced around zero, preventing systematic weight update biases in subsequent layers.
                                </Callout>
                            </div>
                        )}

                        {activeDerivTab === 'relu' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white">Rectified Linear Unit (ReLU)</h4>
                                <MathEquation formula="f(x) = \max(0, x)" block />
                                <strong className="text-xs text-slate-400 block font-mono">Gradient Derivation:</strong>
                                <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
                                    <div>Because the function has a sharp bend at zero, it is not strictly differentiable at <MathEquation formula="x=0" />. We use subgradient calculus:</div>
                                    <MathEquation formula="f'(x) = \begin{cases} 1 & x > 0 \\ 0 & x < 0 \\ \text{undefined} & x = 0 \end{cases}" block />
                                    <div>In practice, libraries define the derivative at <MathEquation formula="x=0" /> as either 0 or 0.5.</div>
                                </div>
                                <Callout variant="pitfall" title="The Dying ReLU Problem">
                                    If a neuron gets updated such that it always outputs negative values, its gradient becomes 0. The neuron gets permanently deactivated (dies), never learning from any future data point.
                                </Callout>
                            </div>
                        )}

                        {activeDerivTab === 'gelu' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white">Gaussian Error Linear Unit (GELU)</h4>
                                <MathEquation formula="\text{GELU}(x) = x \Phi(x) = x P(X \le x), \quad X \sim \mathcal{N}(0, 1)" block />
                                <p className="text-xs text-slate-400 font-sans">
                                    Here, <MathEquation formula="\Phi(x)" /> is the Cumulative Distribution Function (CDF) of the standard normal distribution.
                                </p>
                                <strong className="text-xs text-slate-400 block font-mono">Hyperbolic Approximation:</strong>
                                <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
                                    <div>To avoid computing the complex error function `erf`, we use a highly accurate tanh-based approximation:</div>
                                    <MathEquation formula="\text{GELU}(x) \approx 0.5x \left( 1 + \tanh\left(\sqrt{\frac{2}{\pi}} \left( x + 0.044715 x^3 \right)\right) \right)" block />
                                </div>
                                <Callout variant="research" title="Standard in Modern LLMs">
                                    GELU weights inputs by their value rather than gating strictly by sign. Near zero, positive values can occasionally be scaled down while negative values are not completely zeroed out. This smooth curve is standard in GPT, BERT, and ViT architectures.
                                </Callout>
                            </div>
                        )}

                        {activeDerivTab === 'silu' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white">SiLU (Swish) & Gated SwiGLU</h4>
                                <MathEquation formula="f(x) = x \cdot \sigma(x) = \frac{x}{1 + e^{-x}}" block />
                                <strong className="text-xs text-slate-400 block font-mono">Derivative Derivation:</strong>
                                <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
                                    <div>Apply the product rule:</div>
                                    <MathEquation formula="f'(x) = 1 \cdot \sigma(x) + x \cdot \sigma'(x)" block />
                                    <div>Recall <MathEquation formula="\sigma'(x) = \sigma(x)(1 - \sigma(x))" />:</div>
                                    <MathEquation formula="f'(x) = \sigma(x) + x \cdot \sigma(x)(1 - \sigma(x)) = \sigma(x) \left( 1 + x(1 - \sigma(x)) \right)" block />
                                    <MathEquation formula="= f(x) + \sigma(x)(1 - f(x))" block />
                                </div>
                                <Callout variant="engineering" title="Gated SwiGLU Expansion">
                                    Modern architectures like LLaMA replace standard MLPs with a **SwiGLU** layer, which splits an input and multiplies a Swish-activated projection with another linear projection:
                                    <div className="mt-2 bg-slate-900/60 p-2.5 rounded border border-slate-800 text-center font-bold">
                                        <MathEquation formula="\text{SwiGLU}(\mathbf{x}) = \text{Swish}(\mathbf{x}\mathbf{W}) \otimes \mathbf{x}\mathbf{V}" />
                                    </div>
                                    This gated multiplication significantly improves scaling efficiency.
                                </Callout>
                            </div>
                        )}

                        {activeDerivTab === 'softmax' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white">Stable Softmax Derivation</h4>
                                <MathEquation formula="\text{Softmax}(\mathbf{x})_i = \frac{e^{x_i}}{\sum_{j=1}^{C} e^{x_j}}" block />
                                <p className="text-xs text-slate-400 font-sans">
                                    Computing exponentials of raw model outputs (logits) directly leads to numerical instability. If <MathEquation formula="x_i = 1000" />, <MathEquation formula="e^{1000} \to \infty" /> (overflow). If all <MathEquation formula="x_i = -1000" />, <MathEquation formula="e^{-1000} \to 0" /> (underflow), leading to division by zero.
                                </p>
                                <strong className="text-xs text-slate-400 block font-mono">Mathematical Proof of Stability Invariance:</strong>
                                <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
                                    <div>Let us subtract a constant <MathEquation formula="C" /> from all elements in the input vector:</div>
                                    <MathEquation formula="\frac{e^{x_i - C}}{\sum_j e^{x_j - C}} = \frac{e^{x_i} \cdot e^{-C}}{\sum_j (e^{x_j} \cdot e^{-C})}" block />
                                    <div>Factor out the constant term:</div>
                                    <MathEquation formula="= \frac{e^{-C} \cdot e^{x_i}}{e^{-C} \sum_j e^{x_j}} = \frac{e^{x_i}}{\sum_j e^{x_j}}" block />
                                    <div>This proves subtracting <MathEquation formula="C = \max(\mathbf{x})" /> preserves the probability distribution exactly while ensuring the maximum input to any exponential is <MathEquation formula="0" /> (since <MathEquation formula="x_i - \max(\mathbf{x}) \le 0" />), guaranteeing <MathEquation formula="e^{x_i - \max(\mathbf{x})} \in (0, 1]" />.</div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE GRAPH PLAYGROUND ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-cyan-400" />}>
                    3.3 — Activation Function Playground
                </SectionTitle>
                <Card>
                    <ActivationPlayground />
                </Card>
            </motion.section>

            {/* ─── VANISHING GRADIENT FLOW VISUALIZER ─────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Layers size={20} className="text-cyan-400" />}>
                    3.4 — Deep Gradient Flow Visualizer
                </SectionTitle>
                <VanishingGradientViz />
            </motion.section>

            {/* ─── 3.5 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Award size={20} className="text-cyan-400" />}>
                    3.5 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: Activation Evaluation at Inputs</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us evaluate Sigmoid, ReLU, GELU, and their analytical derivatives for an input vector:
                            <MathEquation formula="\mathbf{x} = \begin{pmatrix} -1.0 \\ 0.0 \\ 2.0 \end{pmatrix}" block />
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono text-left text-slate-400">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="pb-2">Activation</th>
                                        <th className="pb-2">Evaluation at x = -1.0</th>
                                        <th className="pb-2">Evaluation at x = 0.0</th>
                                        <th className="pb-2">Evaluation at x = 2.0</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900">
                                    <tr>
                                        <td className="py-2.5 text-cyan-400">Sigmoid</td>
                                        <td>
                                            <div>Value: <MathEquation formula="\sigma(-1) \approx 0.2689" /></div>
                                            <div>Deriv: <MathEquation formula="0.2689(1 - 0.2689) \approx 0.1966" /></div>
                                        </td>
                                        <td>
                                            <div>Value: <MathEquation formula="\sigma(0) = 0.5000" /></div>
                                            <div>Deriv: <MathEquation formula="0.5(0.5) = 0.2500" /></div>
                                        </td>
                                        <td>
                                            <div>Value: <MathEquation formula="\sigma(2) \approx 0.8808" /></div>
                                            <div>Deriv: <MathEquation formula="0.8808(1 - 0.8808) \approx 0.1050" /></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-emerald-400">ReLU</td>
                                        <td>
                                            <div>Value: <MathEquation formula="\max(0, -1) = 0.0" /></div>
                                            <div>Deriv: <MathEquation formula="0.0" /></div>
                                        </td>
                                        <td>
                                            <div>Value: <MathEquation formula="\max(0, 0) = 0.0" /></div>
                                            <div>Deriv: <MathEquation formula="0.0" /> (defined analytically)</div>
                                        </td>
                                        <td>
                                            <div>Value: <MathEquation formula="\max(0, 2) = 2.0" /></div>
                                            <div>Deriv: <MathEquation formula="1.0" /></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2.5 text-purple-400">GELU</td>
                                        <td>
                                            <div>Value: <MathEquation formula="G(-1) \approx -0.1587" /></div>
                                            <div>Deriv: <MathEquation formula="G'(-1) \approx 0.0811" /></div>
                                        </td>
                                        <td>
                                            <div>Value: <MathEquation formula="G(0) = 0.0" /></div>
                                            <div>Deriv: <MathEquation formula="G'(0) = 0.5000" /></div>
                                        </td>
                                        <td>
                                            <div>Value: <MathEquation formula="G(2) \approx 1.9546" /></div>
                                            <div>Deriv: <MathEquation formula="G'(2) \approx 1.0828" /></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white">Example B: Stable Softmax Verification</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Consider a high-magnitude logit vector where traditional exponentiation overflows:
                            <MathEquation formula="\mathbf{u} = \begin{pmatrix} 1000.0 \\ 1001.0 \\ 999.0 \end{pmatrix}" block />
                        </p>

                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-3 leading-relaxed">
                            <div>
                                <span className="text-cyan-400 font-bold block mb-1">1. Find Maximum:</span>
                                <div><MathEquation formula="M = \max(\mathbf{u}) = 1001.0" /></div>
                            </div>
                            <div>
                                <span className="text-cyan-400 font-bold block mb-1">2. Subtract Maximum:</span>
                                <MathEquation formula="\mathbf{u} - 1001.0 = \begin{pmatrix} -1.0 \\ 0.0 \\ -2.0 \end{pmatrix}" block />
                            </div>
                            <div>
                                <span className="text-cyan-400 font-bold block mb-1">3. Compute Exponentials:</span>
                                <MathEquation formula="e^{-1.0} \approx 0.367879" block />
                                <MathEquation formula="e^{0.0} = 1.0" block />
                                <MathEquation formula="e^{-2.0} \approx 0.135335" block />
                            </div>
                            <div>
                                <span className="text-cyan-400 font-bold block mb-1">4. Sum of Exponentials:</span>
                                <MathEquation formula="\Sigma = 0.367879 + 1.0 + 0.135335 = 1.503214" block />
                            </div>
                            <div>
                                <span className="text-cyan-400 font-bold block mb-1">5. Final Probabilities:</span>
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    <div><MathEquation formula="p_1 = 0.367879 / 1.503214 \approx 0.2447" /></div>
                                    <div><MathEquation formula="p_2 = 1.0 / 1.503214 \approx 0.6652" /></div>
                                    <div><MathEquation formula="p_3 = 0.135335 / 1.503214 \approx 0.0900" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 3.6 PYTORCH CODE Snippet ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Terminal size={20} className="text-cyan-400" />}>
                    3.6 — PyTorch Custom Implementations
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing numerically stable Softmax, approximated GELU, and the gated SwiGLU layer.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import math

class StableSoftmax(nn.Module):
    def __init__(self, dim: int = -1):
        super(StableSoftmax, self).__init__()
        self.dim = dim

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Subtract max value for numerical stability (avoids overflows)
        max_val = torch.max(x, dim=self.dim, keepdim=True)[0]
        exps = torch.exp(x - max_val)
        return exps / torch.sum(exps, dim=self.dim, keepdim=True)

class ApproximateGELU(nn.Module):
    def __init__(self):
        super(ApproximateGELU, self).__init__()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Hyperbolic approximation formula
        const_val = math.sqrt(2.0 / math.pi)
        return 0.5 * x * (1.0 + torch.tanh(const_val * (x + 0.044715 * torch.pow(x, 3.0))))

class SwiGLU(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int):
        super(SwiGLU, self).__init__()
        # SwiGLU requires projecting input to two intermediate vectors W and V
        self.w_gate = nn.Linear(input_dim, hidden_dim, bias=False)
        self.v_gate = nn.Linear(input_dim, hidden_dim, bias=False)
        self.swish = nn.SiLU() # PyTorch SiLU implements Swish (beta=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Element-wise product of swish-activated gate with linear projection
        gate = self.swish(self.w_gate(x))
        projection = self.v_gate(x)
        return gate * projection

# Execution trace testing
if __name__ == "__main__":
    # Test stable softmax with high values
    stable_sm = StableSoftmax(dim=-1)
    high_inputs = torch.tensor([1000.0, 1001.0, 999.0])
    print("Stable Softmax Probabilities:", stable_sm(high_inputs))
    
    # Test SwiGLU layer
    swiglu = SwiGLU(input_dim=4, hidden_dim=8)
    sample_feat = torch.randn(1, 4)
    print("SwiGLU Layer output shape:", swiglu(sample_feat).shape)`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
