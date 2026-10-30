import React from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    GitBranch, 
    Calculator, 
    Target,
    Zap,
    Activity,
    ArrowRight,
    BookOpen
} from 'lucide-react';
import { MathEquation } from '../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../components/SectionElements';
import { QuizCard, type QuizQuestion } from '../../../components/QuizCard';
import { Term } from '../../../components/Term';

const calculusQuiz: QuizQuestion[] = [
    {
        id: 'calc-1',
        question: 'The gradient ∇L points in the direction of steepest ascent. What step does gradient descent take?',
        options: [
            'A step along ∇L, scaled by the learning rate',
            'A step opposite to ∇L, scaled by the learning rate',
            'A step perpendicular to ∇L',
            'A random step, since ∇L only measures curvature',
        ],
        correctIndex: 1,
        explanation: 'θ ← θ − α∇L — we move against the gradient to descend the loss surface. The learning rate α scales the step length.',
    },
    {
        id: 'calc-2',
        question: 'For f(x, y) = x² + 3xy + y², what is ∂f/∂x?',
        options: ['2x + 3y', '2x', '3x + 2y', 'x² + 3y'],
        correctIndex: 0,
        explanation: 'Differentiate with respect to x while holding y fixed: 2x (from x²) + 3y (from 3xy). By symmetry ∂f/∂y = 3x + 2y.',
    },
    {
        id: 'calc-3',
        question: 'Backpropagation applies the chain rule through a computational graph. Why can gradients vanish in deep networks?',
        options: [
            'Partial derivatives are only defined for convex loss surfaces',
            'Each layer multiplies by derivatives; many values below 1 compound toward zero',
            'Accumulated gradients are summed rather than multiplied',
            'Autograd stores activations in reduced precision',
        ],
        correctIndex: 1,
        explanation: 'Each activation derivative < 1 (e.g. sigmoid at its tails, max 0.25) compounds multiplicatively across layers, driving the product toward zero. ReLU (derivative exactly 1 when positive) mitigates this.',
    },
    {
        id: 'calc-4',
        question: 'Which optimizer is the de facto default for training large transformer models today?',
        options: ['Vanilla SGD', 'SGD + Momentum', 'AdamW', 'RMSprop'],
        correctIndex: 2,
        explanation: 'AdamW — Adam with decoupled weight decay — combines adaptive per-parameter learning rates with momentum and cleaner regularization, and is the standard for LLMs and ViTs.',
    },
];

export const CalculusTheory: React.FC = () => {
    return (
        <div className="space-y-12">
            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                    <TrendingUp size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Calculus & Gradients</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-400 mb-4">
                    Calculus: The Engine of Learning
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed mb-6">
                    Calculus provides the mathematical foundation for optimization in machine learning. 
                    Understanding gradients, partial derivatives, and the chain rule is essential to comprehend 
                    how neural networks learn by minimizing loss functions.
                </p>

                {/* Learning Objectives */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                        <BookOpen size={18} />
                        Learning Objectives
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>Understand why calculus drives gradient-based learning</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>Master partial derivatives and gradients</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>Apply the chain rule to multi-layer functions</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>Compare modern gradient descent optimizers</span>
                        </li>
                    </ul>
                </div>
            </motion.div>

            {/* ─── 1. WHY CALCULUS MATTERS ─────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<Target size={20} className="text-blue-400" />}>
                    1.1 — Why Calculus Matters for Machine Learning
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        At its core, training a neural network is an <strong className="text-white">optimization problem</strong>. 
                        We define a loss function <MathEquation formula="L(\theta)" /> that measures how poorly our model 
                        performs with parameters <MathEquation formula="\theta = \{W^{(1)}, b^{(1)}, ..., W^{(L)}, b^{(L)}\}" />. 
                        Our goal is to find the parameters that minimize this loss:
                    </p>

                    <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="\theta^* = \arg\min_{\theta} L(\theta)" block />
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        To find this minimum, we use <strong className="text-blue-400"><Term word="Gradient Descent">gradient descent</Term></strong>. 
                        The gradient tells us the direction of steepest ascent, so we move in the opposite direction 
                        to go downhill:
                    </p>

                    <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="\theta_{t+1} = \theta_t - \alpha \nabla_\theta L(\theta_t)" block />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="text-blue-300 font-bold mb-2">∇L</div>
                            <div className="text-slate-400">Gradient vector of partial derivatives</div>
                        </div>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                            <div className="text-cyan-300 font-bold mb-2">α</div>
                            <div className="text-slate-400">Learning rate (step size)</div>
                        </div>
                        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
                            <div className="text-violet-300 font-bold mb-2">Goal</div>
                            <div className="text-slate-400">Iteratively decrease loss</div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 2. PARTIAL DERIVATIVES ──────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<Calculator size={20} className="text-blue-400" />}>
                    1.2 — Partial Derivatives
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        In neural networks, loss is a function of many variables (all weights and biases). 
                        A <strong className="text-blue-400">partial derivative</strong> measures how the function changes 
                        when we vary one variable while holding all others constant.
                    </p>

                    <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800">
                        <p className="text-slate-400 mb-4 text-sm">For a function <MathEquation formula="f(x,y)" />, the partial derivatives are:</p>
                        <div className="space-y-3 text-center">
                            <MathEquation formula="\frac{\partial f}{\partial x} = \lim_{h\to0}\frac{f(x+h,y) - f(x,y)}{h}" block />
                            <MathEquation formula="\frac{\partial f}{\partial y} = \lim_{h\to0}\frac{f(x,y+h) - f(x,y)}{h}" block />
                        </div>
                    </div>

                    <Callout variant="intuition" title="Intuition">
                        Think of a mountain landscape (loss surface). The partial derivative with respect to weight w tells 
                        you how steep the slope is if you only move along the w direction. The gradient combines all these 
                        directions to point you down the steepest path.
                    </Callout>

                    <h3 className="text-xl font-bold text-white">Example: Simple Quadratic Function</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Consider <MathEquation formula="f(x,y) = x^2 + 3xy + y^2" />. Compute partial derivatives:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                            <div className="text-sm text-slate-400 mb-2">∂f/∂x</div>
                            <MathEquation formula="\frac{\partial f}{\partial x} = 2x + 3y" block />
                        </div>
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                            <div className="text-sm text-slate-400 mb-2">∂f/∂y</div>
                            <MathEquation formula="\frac{\partial f}{\partial y} = 3x + 2y" block />
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 3. THE CHAIN RULE ───────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<GitBranch size={20} className="text-blue-400" />}>
                    1.3 — The Chain Rule: Connecting the Dots
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Neural networks are <strong className="text-white">compositions of functions</strong>. 
                        A simple example: if <MathEquation formula="z = g(h(x))" /> where <MathEquation formula="h(x)=2x+1" /> and <MathEquation formula="g(z)=z^2" />, 
                        then to find <MathEquation formula="dz/dx" /> we use the chain rule:
                    </p>

                    <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="\frac{dz}{dx} = \frac{dz}{dh} \cdot \frac{dh}{dx} = g'(h(x)) \cdot h'(x)" block />
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        This is the fundamental principle behind <strong className="text-blue-400"><Term word="backpropagation">backpropagation</Term></strong>. 
                        We compute gradients layer by layer, multiplying them backwards from the output to the input.
                    </p>

                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
                        <h4 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                            <Zap size={18} />
                            In a Neural Network
                        </h4>
                        <p className="text-slate-300 text-sm mb-4">
                            For a simple layer: <MathEquation formula="a = \sigma(z), z = Wx + b" />
                        </p>
                        <div className="space-y-2 text-center">
                            <MathEquation formula="\frac{\partial L}{\partial W} = \frac{\partial L}{\partial a}\frac{\partial a}{\partial z}\frac{\partial z}{\partial W}" block />
                            <MathEquation formula="\frac{\partial L}{\partial b} = \frac{\partial L}{\partial a}\frac{\partial a}{\partial z}\frac{\partial z}{\partial b}" block />
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 4. GRADIENTS IN VECTOR FORM ─────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Activity size={20} className="text-blue-400" />}>
                    1.4 — Gradients in Vector & Matrix Form
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        In practice, we work with vectors and matrices for efficiency. The gradient of a scalar function 
                        with respect to a vector is itself a vector of partial derivatives.
                    </p>

                    <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800">
                        <p className="text-slate-400 mb-4 text-sm">If <MathEquation formula="f: \mathbb{R}^n \to \mathbb{R}" /> and <MathEquation formula="\mathbf{x} = [x_1, ..., x_n]^T" />, then:</p>
                        <div className="text-center">
                            <MathEquation formula="\nabla_\mathbf{x} f = \begin{bmatrix}
\frac{\partial f}{\partial x_1}\\ 
\frac{\partial f}{\partial x_2}\\ 
\vdots\\ 
\frac{\partial f}{\partial x_n}
\end{bmatrix}" block />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white">Jacobian & Backpropagation</h3>
                    <p className="text-slate-300 leading-relaxed">
                        When functions map vectors to vectors, we use the <strong className="text-blue-400">Jacobian matrix</strong>. 
                        The chain rule becomes matrix multiplication:
                    </p>

                    <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="(\nabla_\mathbf{x} f)^T = (\nabla_\mathbf{z} f)^T J_\mathbf{x}g,\quad \text{where}\quad \mathbf{z}=g(\mathbf{x})" block />
                    </div>

                    <p className="text-slate-300 leading-relaxed text-sm">
                        In modern deep learning frameworks like PyTorch, this is handled automatically by <strong>automatic differentiation (autograd)</strong>, 
                        which builds a computational graph and applies the chain rule in reverse mode.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 5. GRADIENT DESCENT ALGORITHMS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<ArrowRight size={20} className="text-blue-400" />}>
                    1.5 — Gradient-Based Optimization
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Vanilla gradient descent can be slow or unstable. Modern optimizers use momentum, 
                        adaptive learning rates, and other techniques to converge faster.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs font-mono text-slate-500 uppercase tracking-wider">
                                    <th className="pb-3 px-4">Optimizer</th>
                                    <th className="pb-3 px-4">Update Rule</th>
                                    <th className="pb-3 px-4">Key Idea</th>
                                    <th className="pb-3 px-4">Use Case</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-slate-400 font-sans">
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">SGD</td>
                                    <td className="py-3 px-4 font-mono text-xs"><MathEquation formula="\theta \leftarrow \theta - \alpha \nabla L" /></td>
                                    <td className="py-3 px-4">Basic gradient descent</td>
                                    <td className="py-3 px-4">Simple problems, good baseline</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">SGD + Momentum</td>
                                    <td className="py-3 px-4 font-mono text-xs"><MathEquation formula="v_t = \beta v_{t-1} + \nabla L;\; \theta \leftarrow \theta - \alpha v_t" /></td>
                                    <td className="py-3 px-4">Accelerates in consistent directions</td>
                                    <td className="py-3 px-4">Avoids oscillations</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">RMSprop</td>
                                    <td className="py-3 px-4 font-mono text-xs">Adaptive per-parameter rates</td>
                                    <td className="py-3 px-4">Normalizes by recent gradient magnitudes</td>
                                    <td className="py-3 px-4">RNNs, non-stationary objectives</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">Adam</td>
                                    <td className="py-3 px-4 font-mono text-xs">Momentum + RMSprop + bias correction</td>
                                    <td className="py-3 px-4">Adaptive with momentum</td>
                                    <td className="py-3 px-4">Most general-purpose, great default</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-white">AdamW</td>
                                    <td className="py-3 px-4 font-mono text-xs">Adam with decoupled weight decay</td>
                                    <td className="py-3 px-4">Better regularization</td>
                                    <td className="py-3 px-4">Transformers, LLMs, modern deep learning</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.section>

            {/* ─── SUMMARY ─────────────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Card className="bg-blue-950/20 border border-blue-500/20 space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <BookOpen size={18} className="text-blue-400" />
                        Key Takeaways
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300 font-sans leading-relaxed">
                        <li><strong>Optimization Goal:</strong> Find parameters minimizing loss via gradient descent: <MathEquation formula="\theta \leftarrow \theta - \alpha \nabla L" /></li>
                        <li><strong>Partial Derivatives:</strong> Measure rate of change with respect to one variable while others are fixed</li>
                        <li><strong>Chain Rule:</strong> Enables backpropagation by decomposing complex functions into products of derivatives</li>
                        <li><strong>Gradients:</strong> Vectors pointing in direction of steepest ascent; we go opposite for minimization</li>
                        <li><strong>Backpropagation:</strong> Efficient algorithm to compute all gradients using reverse-mode automatic differentiation</li>
                        <li><strong>Modern Optimizers:</strong> AdamW is the de facto standard for training large neural networks</li>
                    </ul>
                </Card>
            </motion.section>

            {/* ─── KNOWLEDGE CHECK ──────────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <QuizCard
                    id="math-calc.quiz"
                    title="Calculus Knowledge Check"
                    questions={calculusQuiz}
                    nextHint="Scored it? Mark the module as complete from the sidebar to unlock the next stage."
                />
            </motion.section>
        </div>
    );
};
