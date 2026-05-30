import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiologicalNeuron } from '../components/BiologicalNeuron';
import { XORProblemViz } from '../components/XORProblemViz';
import { PerceptronViz } from '../components/PerceptronViz';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';
import { Brain, Sliders, Shield, Award, Terminal, Activity, HelpCircle, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#8b5cf6' }) => (
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
   MAIN COMPONENT: Perceptron Section
   ═══════════════════════════════════════════════════════════════════════ */

export const Perceptron: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-violet-400 mb-4">
                    <Brain size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 1</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-400 mb-4">
                    Biological Inspiration & The Perceptron
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Uncover the foundational bridge between neuroscience and computer science. Master the 
                    mathematics of threshold logic gates, analyze Rosenblatt's Perceptron convergence mistake bounds, 
                    and algebraically prove the linear inseparability of the XOR problem.
                </p>
            </motion.div>

            {/* ─── 1.1 INITIATIVE ANALOGY & CONCEPTUAL MAP ───────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<Brain size={20} className="text-violet-400" />}>
                    1.1 — The Biological and Mathematical Connection
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                        <p className="text-sm text-yellow-300 font-bold uppercase tracking-wider mb-1">💡 Real-World Analogy</p>
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            Imagine a security guard stationed at the entrance of a private club. To decide whether to admit a guest (Output = 1) or turn them away (Output = 0), the guard checks multiple conditions (Inputs): Is the guest on the VIP list? Are they wearing the required dress code? Are they behaving appropriately? Each criterion carries different importance (Weight). The guard aggregates these criteria, subtracts a baseline threshold (Bias), and makes a binary choice. If the total positive signal exceeds the threshold, the guest enters.
                        </p>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        A biological neuron operates on a similar thresholding principle. It receives chemical signals via its **dendrites**, aggregates them in the **soma (cell body)**, and if the voltage difference across the cell membrane exceeds a threshold, it fires an electrical impulse (action potential) along the **axon** to downstream neurons through the **synaptic junctions**. 
                    </p>

                    <BiologicalNeuron />

                    <div className="overflow-x-auto mt-6">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                    <th className="pb-3 px-4">Biological Element</th>
                                    <th className="pb-3 px-4">Mathematical Equivalent</th>
                                    <th className="pb-3 px-4">Role in Information Processing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-slate-400 font-sans">
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Dendrites</td>
                                    <td className="py-3 px-4 font-mono text-xs">Input Features (x_i)</td>
                                    <td className="py-3 px-4">Sensory features or outputs from previous layers.</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Synaptic Connections</td>
                                    <td className="py-3 px-4 font-mono text-xs">Weights (w_i)</td>
                                    <td className="py-3 px-4">Learned scaling factors indicating synaptic connection strengths.</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Soma (Cell Body)</td>
                                    <td className="py-3 px-4 font-mono text-xs">Weighted Sum + Bias (z = w^T x + b)</td>
                                    <td className="py-3 px-4">Aggregates inputs, shifted by a threshold parameter (bias).</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Axon Hillock</td>
                                    <td className="py-3 px-4 font-mono text-xs">Activation function (f(z))</td>
                                    <td className="py-3 px-4">Applies a non-linear threshold gate to decide if the cell fires.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 1.2 MCCULLOCH-PITTS NEURON ─────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Terminal size={20} className="text-violet-400" />}>
                    1.2 — The McCulloch-Pitts Neuron (1943)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Warren McCulloch and Walter Pitts proposed the first formal mathematical model of a neuron. Known as the **Threshold Logic Unit (TLU)**, the McCulloch-Pitts neuron receives binary inputs <MathEquation formula="x_i \in \{0, 1\}" /> and produces a binary output:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <MathEquation formula="y = \Theta \left( \sum_{i=1}^{n} w_i x_i - \theta \right) = \begin{cases} 1 & \text{if } \sum w_i x_i \geq \theta \\ 0 & \text{otherwise} \end{cases}" block />
                        
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono text-slate-500">
                                <thead>
                                    <tr>
                                        <th className="pb-1">Variable</th>
                                        <th className="pb-1">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-violet-400 pr-4">x_i</td>
                                        <td>Binary inputs from the environment or preceding nodes</td>
                                    </tr>
                                    <tr>
                                        <td className="text-violet-400">w_i</td>
                                        <td>Excitatory weights (+1) or Inhibitory weights (-inf)</td>
                                    </tr>
                                    <tr>
                                        <td className="text-violet-400">\theta</td>
                                        <td>Firing threshold value</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Because the weights were fixed to excitatory (<MathEquation formula="+1" />) or inhibitory (<MathEquation formula="-\infty" />) values, the TLU was capable of performing boolean logical functions. Let us derive the configurations for standard boolean gates:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">Logical AND</span>
                            <p className="text-xs text-slate-400">Requires both inputs to be active. Set weights to <MathEquation formula="w_1 = w_2 = 1" /> and threshold <MathEquation formula="\theta = 2" />:</p>
                            <div className="bg-slate-900/60 p-2 rounded text-center font-mono text-xs">
                                <MathEquation formula="y = \Theta(x_1 + x_2 - 2)" />
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">Logical OR</span>
                            <p className="text-xs text-slate-400">Requires at least one input active. Set weights to <MathEquation formula="w_1 = w_2 = 1" /> and threshold <MathEquation formula="\theta = 1" />:</p>
                            <div className="bg-slate-900/60 p-2 rounded text-center font-mono text-xs">
                                <MathEquation formula="y = \Theta(x_1 + x_2 - 1)" />
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">Logical NOT</span>
                            <p className="text-xs text-slate-400">Inverts a single input. Set weight to <MathEquation formula="w_1 = -1" /> and threshold <MathEquation formula="\theta = 0" />:</p>
                            <div className="bg-slate-900/60 p-2 rounded text-center font-mono text-xs">
                                <MathEquation formula="y = \Theta(-x_1)" />
                            </div>
                        </div>
                    </div>

                    <Callout variant="pitfall" title="The Limitations of McCulloch-Pitts Units">
                        The McCulloch-Pitts neuron is purely a feedforward mapping machine and <strong>cannot learn</strong>. Weights and thresholds must be handcrafted by mathematicians. Rosenblatt addressed this fatal limitation in 1958 by introducing an automated parameter adjustment loop.
                    </Callout>
                </Card>
            </motion.section>

            {/* ─── 1.3 ROSENBLATT'S PERCEPTRON ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Sliders size={20} className="text-violet-400" />}>
                    1.3 — Rosenblatt's Perceptron (1958)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Frank Rosenblatt extended the threshold logic unit by introducing continuous-valued, learnable weights <MathEquation formula="\mathbf{w} \in \mathbb{R}^d" /> and a bias term <MathEquation formula="b \in \mathbb{R}" />. The output prediction <MathEquation formula="\hat{y}" /> uses the sign activation function:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        <MathEquation formula="\hat{y} = \text{sign}(\mathbf{w}^T \mathbf{x} + b) = \begin{cases} +1 & \text{if } \mathbf{w}^T \mathbf{x} + b \geq 0 \\ -1 & \text{if } \mathbf{w}^T \mathbf{x} + b < 0 \end{cases}" block />
                    </div>

                    <h4 className="text-md font-bold text-white mt-4">The Perceptron Learning Rule</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-sans">
                        Given a training set of pairs <MathEquation formula="(\mathbf{x}_i, y_i)" /> where labels <MathEquation formula="y_i \in \{-1, +1\}" />, the perceptron adjusts its parameters only when it makes a mistake (i.e., when <MathEquation formula="\hat{y}_i \neq y_i" />):
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850">
                                <MathEquation formula="\mathbf{w} \leftarrow \mathbf{w} + \eta(y_i - \hat{y}_i)\mathbf{x}_i" block />
                            </div>
                            <p className="text-xs text-slate-500">
                                where <MathEquation formula="\eta \in (0, 1]" /> is the learning rate. For binary targets <MathEquation formula="y_i \in \{-1, +1\}" />, if a mistake occurs, the term <MathEquation formula="(y_i - \hat{y}_i)" /> evaluates to <MathEquation formula="2y_i" />. We can absorb the constant factor 2 into <MathEquation formula="\eta" />, leading to the simplified rule:
                            </p>
                            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-center">
                                <MathEquation formula="\mathbf{w} \leftarrow \mathbf{w} + \eta y_i \mathbf{x}_i" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850">
                                <MathEquation formula="b \leftarrow b + \eta(y_i - \hat{y}_i)" block />
                            </div>
                            <p className="text-xs text-slate-500">
                                Likewise, the bias term shifts the decision boundary perpendicular to the weight vector, translating the boundary across the feature space:
                            </p>
                            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-center">
                                <MathEquation formula="b \leftarrow b + \eta y_i" />
                            </div>
                        </div>
                    </div>

                    <Callout variant="intuition" title="Geometric Intuition of the Perceptron Update">
                        The weight vector <MathEquation formula="\mathbf{w}" /> acts as a normal vector pointing to the positive side of the decision boundary hyper-plane. If the model misclassifies a positive sample <MathEquation formula="(\mathbf{x}_i, y_i = +1)" /> as negative, it means the angle between <MathEquation formula="\mathbf{w}" /> and <MathEquation formula="\mathbf{x}_i" /> is obtuse. Adding <MathEquation formula="\mathbf{x}_i" /> to <MathEquation formula="\mathbf{w}" /> rotates the weight vector toward <MathEquation formula="\mathbf{x}_i" />, reducing the angle, boosting the dot product, and driving the prediction toward <MathEquation formula="+1" />.
                    </Callout>

                    <PerceptronViz />
                </Card>
            </motion.section>

            {/* ─── 1.4 CONVERGENCE THEOREM ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Shield size={20} className="text-violet-400" />}>
                    1.4 — The Perceptron Convergence Theorem (Novikoff 1962)
                </SectionTitle>

                <Card className="space-y-6 font-sans">
                    <p className="text-slate-300 leading-relaxed">
                        The **Perceptron Convergence Theorem** guarantees that if a dataset <MathEquation formula="\mathcal{D}" /> is linearly separable, the perceptron learning algorithm will converge and stop making mistakes in a finite number of steps.
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                        <strong className="text-sm text-violet-400 block font-mono">Formal Theorem Statement</strong>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Assume there exists an optimal weight vector <MathEquation formula="\mathbf{w}^* \in \mathbb{R}^d" /> with unit norm <MathEquation formula="\|\mathbf{w}^*\| = 1" /> and a margin <MathEquation formula="\gamma > 0" /> such that for all training examples <MathEquation formula="i = 1, \dots, n" />:
                        </p>
                        <div className="bg-slate-900/60 p-3 rounded border border-slate-850 text-center">
                            <MathEquation formula="y_i (\mathbf{w}^{*T} \mathbf{x}_i) \geq \gamma" block />
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Let <MathEquation formula="R = \max_i \|\mathbf{x}_i\|" /> be the maximum norm of any input vector in the dataset. Starting with weight vector <MathEquation formula="\mathbf{w}_0 = \mathbf{0}" />, the total number of mistakes <MathEquation formula="M" /> made by the algorithm is bounded by:
                        </p>
                        <div className="bg-slate-900/60 p-3 rounded border border-slate-850 text-center">
                            <MathEquation formula="M \leq \left(\frac{R}{\gamma}\right)^2" block />
                        </div>
                    </div>

                    <h4 className="text-md font-bold text-white mt-4">Proof Sketch of Convergence</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        We analyze the progression of the weight vector norm after <MathEquation formula="k" /> updates. Let <MathEquation formula="\mathbf{w}_k" /> be the weight vector after the <MathEquation formula="k" />-th mistake on sample <MathEquation formula="(\mathbf{x}_i, y_i)" /> (assuming learning rate <MathEquation formula="\eta=1" />). 
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
                        <div className="space-y-2">
                            <p className="text-violet-400 font-bold">1. Inner Product Lower Bound:</p>
                            <p className="text-slate-300">Compute the projection of the weights onto the optimal vector:</p>
                            <div className="bg-slate-900/40 p-2 rounded">
                                <MathEquation formula="\mathbf{w}_k^T \mathbf{w}^* = (\mathbf{w}_{k-1} + y_i \mathbf{x}_i)^T \mathbf{w}^* = \mathbf{w}_{k-1}^T \mathbf{w}^* + y_i \mathbf{w}^{*T} \mathbf{x}_i" />
                            </div>
                            <p className="text-slate-300">By the definition of the margin, <MathEquation formula="y_i \mathbf{w}^{*T} \mathbf{x}_i \geq \gamma" />. Applying this recursively from <MathEquation formula="\mathbf{w}_0 = \mathbf{0}" /> yields:</p>
                            <div className="bg-slate-900/40 p-2 rounded">
                                <MathEquation formula="\mathbf{w}_k^T \mathbf{w}^* \geq k \gamma" block />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-violet-400 font-bold">2. Weight Norm Upper Bound:</p>
                            <p className="text-slate-300">Compute the squared norm of <MathEquation formula="\mathbf{w}_k" />:</p>
                            <div className="bg-slate-900/40 p-2 rounded">
                                <MathEquation formula="\|\mathbf{w}_k\|^2 = \|\mathbf{w}_{k-1} + y_i \mathbf{x}_i\|^2 = \|\mathbf{w}_{k-1}\|^2 + 2 y_i \mathbf{w}_{k-1}^T \mathbf{x}_i + \|\mathbf{x}_i\|^2" />
                            </div>
                            <p className="text-slate-300">Because an update occurred, the prediction was wrong, meaning <MathEquation formula="y_i \mathbf{w}_{k-1}^T \mathbf{x}_i < 0" />. Furthermore, <MathEquation formula="\|\mathbf{x}_i\|^2 \leq R^2" />. Thus:</p>
                            <div className="bg-slate-900/40 p-2 rounded">
                                <MathEquation formula="\|\mathbf{w}_k\|^2 \leq \|\mathbf{w}_{k-1}\|^2 + R^2" />
                            </div>
                            <p className="text-slate-300">Applying this recursively from <MathEquation formula="\|\mathbf{w}_0\| = 0" /> yields:</p>
                            <div className="bg-slate-900/40 p-2 rounded">
                                <MathEquation formula="\|\mathbf{w}_k\|^2 \leq k R^2" block />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-violet-400 font-bold">3. Combine and Solve:</p>
                            <p className="text-slate-300">Using the Cauchy-Schwarz inequality, <MathEquation formula="\|\mathbf{w}_k\|^2 \|\mathbf{w}^*\|^2 \geq (\mathbf{w}_k^T \mathbf{w}^*)^2" />. Since <MathEquation formula="\|\mathbf{w}^*\| = 1" />:</p>
                            <div className="bg-slate-900/40 p-2.5 rounded">
                                <MathEquation formula="k R^2 \geq \|\mathbf{w}_k\|^2 \geq (\mathbf{w}_k^T \mathbf{w}^*)^2 \geq (k \gamma)^2 = k^2 \gamma^2" block />
                            </div>
                            <p className="text-slate-300">Dividing by <MathEquation formula="k \gamma^2" /> yields the mistake upper bound:</p>
                            <div className="bg-slate-900/40 p-2.5 rounded">
                                <MathEquation formula="k \leq \left( \frac{R}{\gamma} \right)^2" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 1.5 THE XOR LIMITATION ────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<AlertTriangle size={20} className="text-violet-400" />}>
                    1.5 — The XOR Problem & Linear Inseparability
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        In 1969, Marvin Minsky and Seymour Papert published the book *Perceptrons*, proving that a single-layer threshold neuron **cannot compute the XOR logical function**. This mathematical wall led to the first **AI Winter**, drying up research funding for artificial neural networks for over a decade.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4 font-sans">
                            <h4 className="text-md font-bold text-white">Algebraic Proof of XOR Inseparability</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Let inputs <MathEquation formula="x_1, x_2 \in \{0, 1\}" /> and binary target <MathEquation formula="y \in \{0, 1\}" />. Assume there exist weight parameters <MathEquation formula="w_1, w_2" /> and bias <MathEquation formula="b" /> that solve the XOR truth table:
                            </p>

                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span>For <MathEquation formula="(0, 0) \rightarrow 0" />:</span>
                                    <span className="text-rose-400"><MathEquation formula="b < 0" /> (Eq. 1)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>For <MathEquation formula="(0, 1) \rightarrow 1" />:</span>
                                    <span className="text-emerald-400"><MathEquation formula="w_2 + b \geq 0" /> (Eq. 2)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>For <MathEquation formula="(1, 0) \rightarrow 1" />:</span>
                                    <span className="text-emerald-400"><MathEquation formula="w_1 + b \geq 0" /> (Eq. 3)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>For <MathEquation formula="(1, 1) \rightarrow 0" />:</span>
                                    <span className="text-rose-400"><MathEquation formula="w_1 + w_2 + b < 0" /> (Eq. 4)</span>
                                </div>

                                <div className="pt-2 border-t border-slate-900 text-slate-400 leading-relaxed">
                                    Sum Eq. 2 and Eq. 3: <MathEquation formula="w_1 + w_2 + 2b \geq 0" />. <br />
                                    Since <MathEquation formula="b < 0" /> from Eq. 1, we must have: <br />
                                    <MathEquation formula="w_1 + w_2 + b > w_1 + w_2 + 2b \geq 0 \Rightarrow w_1 + w_2 + b \geq 0" />. <br />
                                    This directly contradicts Eq. 4 (<MathEquation formula="w_1 + w_2 + b < 0" />). Thus, no such line exists.
                                </div>
                            </div>
                        </div>

                        <div>
                            <XORProblemViz />
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 1.6 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Activity size={20} className="text-violet-400" />}>
                    1.6 — Worked Numerical Example (AND Gate learning)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us trace a single perceptron learning a logical **AND gate** with inputs <MathEquation formula="x_1, x_2 \in \{0, 1\}" /> and labels <MathEquation formula="y \in \{-1, +1\}" />. 
                        We initialize parameters at <MathEquation formula="\mathbf{w} = [0.0, 0.0]" />, <MathEquation formula="b = 0.0" /> with learning rate <MathEquation formula="\eta = 1.0" />.
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
                        <div className="border-b border-slate-900 pb-3">
                            <span className="text-violet-400 font-bold block mb-1">Step 1: Process Sample (0, 0) | Label y = -1</span>
                            <p>Weighted Sum: <MathEquation formula="z = w_1(0) + w_2(0) + b = 0.0" />. Predict: <MathEquation formula="\hat{y} = \text{sign}(0.0) = +1" />.</p>
                            <p className="text-red-400">Mistake! Update: </p>
                            <p><MathEquation formula="\mathbf{w} \leftarrow [0.0, 0.0] + 1.0(-1)[0.0, 0.0] = [0.0, 0.0]" /></p>
                            <p><MathEquation formula="b \leftarrow 0.0 + 1.0(-1) = -1.0" /></p>
                        </div>

                        <div className="border-b border-slate-900 pb-3">
                            <span className="text-violet-400 font-bold block mb-1">Step 2: Process Sample (1, 1) | Label y = +1</span>
                            <p>Weighted Sum: <MathEquation formula="z = 0.0(1) + 0.0(1) - 1.0 = -1.0" />. Predict: <MathEquation formula="\hat{y} = \text{sign}(-1.0) = -1" />.</p>
                            <p className="text-red-400">Mistake! Update: </p>
                            <p><MathEquation formula="\mathbf{w} \leftarrow [0.0, 0.0] + 1.0(+1)[1.0, 1.0] = [1.0, 1.0]" /></p>
                            <p><MathEquation formula="b \leftarrow -1.0 + 1.0(+1) = 0.0" /></p>
                        </div>

                        <div>
                            <span className="text-violet-400 font-bold block mb-1">Step 3: Process Sample (1, 0) | Label y = -1</span>
                            <p>Weighted Sum: <MathEquation formula="z = 1.0(1) + 1.0(0) + 0.0 = 1.0" />. Predict: <MathEquation formula="\hat{y} = \text{sign}(1.0) = +1" />.</p>
                            <p className="text-red-400">Mistake! Update: </p>
                            <p><MathEquation formula="\mathbf{w} \leftarrow [1.0, 1.0] + 1.0(-1)[1.0, 0.0] = [0.0, 1.0]" /></p>
                            <p><MathEquation formula="b \leftarrow 0.0 + 1.0(-1) = -1.0" /></p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 1.7 PYTORCH CODE Snippet ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SectionTitle icon={<Terminal size={20} className="text-violet-400" />}>
                    1.7 — PyTorch Perceptron Implementation
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a complete, minimal implementation of a Perceptron layer in PyTorch, mapping inputs using standard weight tensors and thresholding.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn

class Perceptron(nn.Module):
    def __init__(self, input_dim: int):
        super(Perceptron, self).__init__()
        # Initializing weights (W) and bias (b) explicitly matching equations
        self.W = nn.Parameter(torch.zeros(input_dim, 1))
        self.b = nn.Parameter(torch.zeros(1))
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Forward Pass: Compute z = W^T x + b
        z = torch.matmul(x, self.W) + self.b
        # Heaviside Activation function (thresholding at 0)
        return torch.where(z >= 0.0, torch.ones_like(z), -torch.ones_like(z))

# Training example on logical AND gate
if __name__ == "__main__":
    # 4 samples: (x1, x2)
    inputs = torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]], dtype=torch.float32)
    labels = torch.tensor([[-1.0], [-1.0], [-1.0], [1.0]], dtype=torch.float32)
    
    perceptron = Perceptron(input_dim=2)
    eta = 1.0
    
    # Simple Rosenblatt learning rule loop
    for epoch in range(10):
        predictions = perceptron(inputs)
        mistakes = (predictions != labels).float()
        if mistakes.sum() == 0:
            print(f"Converged at epoch {epoch}!")
            break
        # Update rule applied to the first mistake
        for i in range(4):
            x_i = inputs[i:i+1]
            y_i = labels[i:i+1]
            y_pred = perceptron(x_i)
            if y_pred != y_i:
                # Gradient update matching math rule
                with torch.no_grad():
                    perceptron.W.add_(eta * y_i[0] * x_i[0].unsqueeze(1))
                    perceptron.b.add_(eta * y_i[0])
                break

    print("Weights:", perceptron.W.flatten().tolist())
    print("Bias:", perceptron.b.tolist())`}</code>
                    </pre>
                </Card>
            </motion.section>

            {/* ─── 1.8 SUMMARY BOX ────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <Card className="bg-violet-950/20 border border-violet-500/20 space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <Award size={18} className="text-violet-400" />
                        Key Takeaways: Chapter 1 Summary
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300 font-sans leading-relaxed">
                        <li><strong>Biological Inspiration:</strong> Synapses map to learnable weights, soma to linear aggregation, and axon thresholds to binary step functions.</li>
                        <li><strong>McCulloch-Pitts Neuron:</strong> The first boolean gate threshold processing unit, incapable of automated training.</li>
                        <li><strong>Rosenblatt's Perceptron:</strong> Automates weight updates via structural error-driven adjustments.</li>
                        <li><strong>Convergence Guarantee:</strong> Converges in a finite step threshold bounded by <MathEquation formula="(R/\gamma)^2" /> if and only if data is linearly separable.</li>
                        <li><strong>The XOR Wall:</strong> Single-layer threshold gates fail on non-linearly separable structures, causing the first historical AI Winter.</li>
                    </ul>
                </Card>
            </motion.section>

        </div>
    );
};
