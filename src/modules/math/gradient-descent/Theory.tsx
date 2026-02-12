import React from 'react';
import {
    DerivativeTangentViz,
    ActivationFunctionsViz,
    TaylorSeriesViz,
    LearningRateViz,
    ChainRuleGraphViz,
    GradientVectorFieldViz,
    IntegralAreaViz,
    GaussianCurveViz,
    CentralLimitTheoremViz,
    BayesViz,
    EntropyViz,
    LossLandscapeViz,
    CovarianceViz,
    MomentumComparisonViz,
} from './components/TheoryVisualizations';

export const CalculusProbabilityTheory: React.FC = () => {
    return (
        <div className="space-y-8 text-gray-300 leading-relaxed">
            {/* ══════════════════════════════════════════════════════════ */}
            {/* PART I — CALCULUS                                        */}
            {/* ══════════════════════════════════════════════════════════ */}

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">📐</span>
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight">Part I — Calculus</h2>
                        <p className="text-gray-500 text-sm">The language of change that powers every gradient update</p>
                    </div>
                </div>

                <p className="text-lg mb-4">
                    Calculus is the mathematical toolkit for understanding <strong className="text-[var(--color-electric-cyan)]">change</strong>.
                    In machine learning, every time a model "learns," it's performing calculus — computing how small changes in
                    weights affect the loss, then adjusting accordingly. Without calculus, neural networks would be static.
                </p>

                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 mb-4">
                    <p className="text-cyan-300 font-bold text-sm mb-2">🧠 WHY THIS MATTERS FOR ML</p>
                    <p className="text-gray-400 text-sm">
                        Every <code className="text-cyan-400">loss.backward()</code> call in PyTorch is computing derivatives.
                        Every <code className="text-cyan-400">optimizer.step()</code> is applying gradient descent.
                        Understanding calculus means understanding <em>what your model is actually doing when it trains</em>.
                    </p>
                </div>
            </section>

            {/* ─── Limits & Continuity ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">∞ Limits & Continuity</h2>

                <p className="mb-4">
                    A <strong className="text-[var(--color-electric-cyan)]">limit</strong> describes where a function is
                    <em> heading</em> as the input approaches some value. It's the foundation every derivative is built on.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Definition — Limit</h3>
                    <div className="text-xl font-mono text-center py-4 text-white">
                        lim<sub>x→a</sub> f(x) = L
                    </div>
                    <p className="text-gray-400 text-sm text-center">
                        "As x gets arbitrarily close to a, f(x) gets arbitrarily close to L."
                    </p>
                </div>

                <p className="mb-4">
                    <strong className="text-white">Continuity</strong> means there are no jumps, holes, or breaks in the function.
                    A function f is continuous at x = a if:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400 mb-4 ml-4">
                    <li>f(a) is defined</li>
                    <li>lim<sub>x→a</sub> f(x) exists</li>
                    <li>lim<sub>x→a</sub> f(x) = f(a)</li>
                </ol>

                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                    <p className="text-yellow-300 font-bold text-sm mb-1">⚡ L'Hôpital's Rule</p>
                    <p className="text-gray-400 text-sm mb-2">
                        When a limit gives 0/0 or ∞/∞, differentiate top and bottom separately:
                    </p>
                    <div className="font-mono text-center text-white">
                        lim<sub>x→a</sub> f(x)/g(x) = lim<sub>x→a</sub> f'(x)/g'(x)
                    </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-purple-300 font-bold text-sm mb-1">🤖 In ML</p>
                    <p className="text-gray-400 text-sm">
                        Loss functions must be continuous (and ideally smooth) for gradient-based optimization to work.
                        Discontinuities create "cliffs" where gradients become undefined or infinite —
                        that's why ReLU's non-differentiable point at x = 0 uses a sub-gradient convention.
                    </p>
                </div>
            </section>

            {/* ─── Derivatives ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">📈 Derivatives: The Rate of Change</h2>

                <p className="mb-4">
                    The <strong className="text-[var(--color-electric-cyan)]">derivative</strong> of a function at a point
                    measures its instantaneous rate of change — the slope of the tangent line at that point.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Definition — Derivative</h3>
                    <div className="text-xl font-mono text-center py-4 text-white">
                        f'(x) = lim<sub>h→0</sub> [f(x + h) − f(x)] / h
                    </div>
                    <p className="text-gray-400 text-sm text-center">
                        The slope of the secant line becomes the slope of the tangent as h → 0.
                    </p>
                </div>

                <DerivativeTangentViz />

                <h3 className="text-xl font-bold text-white mt-6 mb-3">Essential Differentiation Rules</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Power Rule</h4>
                        <div className="font-mono text-white text-center py-2">d/dx [x<sup>n</sup>] = n·x<sup>n−1</sup></div>
                        <p className="text-xs text-gray-500 mt-2">Example: d/dx [x³] = 3x²</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-purple-400 mb-2">Chain Rule</h4>
                        <div className="font-mono text-white text-center py-2">d/dx [f(g(x))] = f'(g(x)) · g'(x)</div>
                        <p className="text-xs text-gray-500 mt-2">The backbone of backpropagation!</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-yellow-400 mb-2">Product Rule</h4>
                        <div className="font-mono text-white text-center py-2">d/dx [f·g] = f'g + fg'</div>
                        <p className="text-xs text-gray-500 mt-2">Derivative of a product of two functions</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-pink-400 mb-2">Quotient Rule</h4>
                        <div className="font-mono text-white text-center py-2">d/dx [f/g] = (f'g − fg') / g²</div>
                        <p className="text-xs text-gray-500 mt-2">For ratios of functions</p>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-bold text-green-400 mb-2">Key Derivatives in ML</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-sm">
                        <div className="text-center">
                            <div className="text-white">d/dx [e<sup>x</sup>] = e<sup>x</sup></div>
                            <div className="text-xs text-gray-500 mt-1">Exponential (softmax)</div>
                        </div>
                        <div className="text-center">
                            <div className="text-white">d/dx [ln(x)] = 1/x</div>
                            <div className="text-xs text-gray-500 mt-1">Log-likelihood</div>
                        </div>
                        <div className="text-center">
                            <div className="text-white">σ'(x) = σ(x)(1 − σ(x))</div>
                            <div className="text-xs text-gray-500 mt-1">Sigmoid derivative</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-cyan-300 font-bold text-sm mb-1">🔗 Chain Rule = Backpropagation</p>
                    <p className="text-gray-400 text-sm">
                        The chain rule is <em>literally</em> backpropagation. When computing ∂L/∂w for a deep network,
                        we're composing derivatives layer by layer:
                    </p>
                    <div className="font-mono text-center text-white mt-2 text-sm">
                        ∂L/∂w₁ = ∂L/∂ŷ · ∂ŷ/∂h₃ · ∂h₃/∂h₂ · ∂h₂/∂h₁ · ∂h₁/∂w₁
                    </div>
                </div>

                <ChainRuleGraphViz />
            </section>

            {/* ─── Activation Functions ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">⚡ Activation Functions & Their Derivatives</h2>

                <p className="mb-4">
                    Activation functions introduce <strong className="text-[var(--color-electric-cyan)]">non-linearity</strong> into
                    neural networks. Without them, stacking layers would be equivalent to a single linear transformation.
                    Understanding their derivatives is critical because they directly affect gradient flow.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-pink-400 mb-2">Sigmoid σ(x)</h4>
                        <div className="font-mono text-white text-center py-2 text-sm">σ(x) = 1/(1+e<sup>−x</sup>)</div>
                        <p className="text-xs text-gray-400 mt-2">Output in (0,1). Saturates for large |x|, causing <strong className="text-red-400">vanishing gradients</strong>.</p>
                        <p className="text-xs text-gray-500">🤖 Binary classification output, gates in LSTMs</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Tanh(x)</h4>
                        <div className="font-mono text-white text-center py-2 text-sm">tanh(x) = (e<sup>x</sup>−e<sup>−x</sup>)/(e<sup>x</sup>+e<sup>−x</sup>)</div>
                        <p className="text-xs text-gray-400 mt-2">Output in (−1,1). Zero-centered, better than sigmoid for hidden layers.</p>
                        <p className="text-xs text-gray-500">🤖 RNN hidden states, normalization</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-green-400 mb-2">ReLU(x)</h4>
                        <div className="font-mono text-white text-center py-2 text-sm">ReLU(x) = max(0, x)</div>
                        <p className="text-xs text-gray-400 mt-2">Simple and efficient. Can "die" if neurons always output 0 (<strong className="text-red-400">dying ReLU</strong>).</p>
                        <p className="text-xs text-gray-500">🤖 Default for hidden layers in most architectures</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-yellow-400 mb-2">GELU(x)</h4>
                        <div className="font-mono text-white text-center py-2 text-sm">GELU(x) ≈ x·Φ(x)</div>
                        <p className="text-xs text-gray-400 mt-2">Smooth approximation of ReLU. Probabilistically gates values.</p>
                        <p className="text-xs text-gray-500">🤖 Transformers (BERT, GPT), modern architectures</p>
                    </div>
                </div>

                <ActivationFunctionsViz />

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
                    <p className="text-red-300 font-bold text-sm mb-1">⚠️ Vanishing & Exploding Gradients</p>
                    <p className="text-gray-400 text-sm">
                        When derivatives are consistently &lt; 1 (sigmoid/tanh saturation), gradients shrink exponentially through layers — <strong className="text-white">vanishing gradients</strong>.
                        When derivatives are &gt; 1, they grow exponentially — <strong className="text-white">exploding gradients</strong>.
                        Solutions: ReLU activations, residual connections, gradient clipping, and careful initialization.
                    </p>
                </div>
            </section>

            {/* ─── Taylor Series ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">📐 Taylor Series Approximation</h2>

                <p className="mb-4">
                    A <strong className="text-[var(--color-electric-cyan)]">Taylor series</strong> approximates any smooth function
                    as an infinite polynomial. This is fundamental to understanding why first-order optimizers (gradient descent)
                    work and why second-order methods (Newton's) can be better.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Taylor Expansion at x = a</h3>
                    <div className="text-lg font-mono text-center py-3 text-white">
                        f(x) = f(a) + f'(a)(x−a) + f''(a)(x−a)²/2! + f'''(a)(x−a)³/3! + ...
                    </div>
                    <p className="text-gray-400 text-sm text-center mt-2">
                        Gradient descent uses the <strong className="text-cyan-400">1st-order</strong> Taylor approximation.
                        Newton's method uses <strong className="text-purple-400">2nd-order</strong>.
                    </p>
                </div>

                <TaylorSeriesViz />

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-4">
                    <p className="text-purple-300 font-bold text-sm mb-1">🤖 Why This Matters</p>
                    <p className="text-gray-400 text-sm">
                        GD approximates the loss as a plane (1st-order) and steps along it. Newton's method approximates it as a
                        parabola (2nd-order) and jumps to the minimum directly. The trade-off: Newton's is more accurate but
                        requires computing the Hessian (O(n²) memory for n parameters).
                    </p>
                </div>
            </section>

            {/* ─── Partial Derivatives & Gradients ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">🧭 Partial Derivatives & The Gradient</h2>

                <p className="mb-4">
                    When a function depends on <strong className="text-white">multiple variables</strong> (like a loss function
                    depends on millions of weights), we take <strong className="text-[var(--color-electric-cyan)]">partial derivatives</strong> —
                    the rate of change with respect to one variable while holding all others constant.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">The Gradient Vector</h3>
                    <div className="text-xl font-mono text-center py-4 text-white">
                        ∇f(x₁, x₂, ..., xₙ) = [∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ]
                    </div>
                    <p className="text-gray-400 text-sm text-center">
                        The gradient points in the direction of <strong className="text-white">steepest ascent</strong>.
                        To minimize loss, we go in the <strong className="text-red-400">opposite</strong> direction.
                    </p>
                </div>

                <GradientVectorFieldViz />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-yellow-400 mb-2">Jacobian Matrix</h4>
                        <p className="text-xs text-gray-400 mb-2">
                            Generalizes the gradient for vector-valued functions. Each row is the gradient of one output component.
                        </p>
                        <div className="font-mono text-white text-center text-sm py-2">
                            J = [∂f<sub>i</sub>/∂x<sub>j</sub>]
                        </div>
                        <p className="text-xs text-gray-500">Used in: Neural network layer transformations</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-pink-400 mb-2">Hessian Matrix</h4>
                        <p className="text-xs text-gray-400 mb-2">
                            Matrix of second-order partial derivatives. Describes the <em>curvature</em> of the loss surface.
                        </p>
                        <div className="font-mono text-white text-center text-sm py-2">
                            H = [∂²f/∂x<sub>i</sub>∂x<sub>j</sub>]
                        </div>
                        <p className="text-xs text-gray-500">Used in: Newton's method, second-order optimizers</p>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-300 font-bold text-sm mb-1">⚠️ Saddle Points</p>
                    <p className="text-gray-400 text-sm">
                        In high-dimensional spaces, most critical points (where ∇f = 0) are <strong className="text-white">saddle points</strong>,
                        not local minima. The Hessian at a saddle point has both positive and negative eigenvalues —
                        it curves up in some directions and down in others. Modern optimizers like Adam handle this well.
                    </p>
                </div>
            </section>

            {/* ─── Gradient Descent & Optimization ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">⬇️ Gradient Descent & Optimization</h2>

                <p className="mb-4">
                    <strong className="text-[var(--color-electric-cyan)]">Gradient Descent</strong> is the workhorse algorithm of deep learning.
                    It iteratively updates parameters by moving in the direction opposite to the gradient of the loss function.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4 relative group">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Parameter Update Rule</h3>
                    <div className="text-2xl font-mono text-center py-4 text-white">
                        θ<sub>t+1</sub> = θ<sub>t</sub> − α · ∇J(θ<sub>t</sub>)
                    </div>
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-sm rounded-xl">
                        <ul className="space-y-2">
                            <li className="flex gap-2"><span className="text-cyan-400 font-bold">θ:</span> Model parameters (weights & biases)</li>
                            <li className="flex gap-2"><span className="text-purple-400 font-bold">α:</span> Learning rate — step size</li>
                            <li className="flex gap-2"><span className="text-yellow-400 font-bold">∇J(θ):</span> Gradient of loss w.r.t. parameters</li>
                        </ul>
                    </div>
                </div>

                <LearningRateViz />

                <div className="my-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
                    <p className="text-cyan-300 font-bold text-lg mb-2">⬇️ Interactive Gradient Descent</p>
                    <p className="text-gray-400 text-sm">Watch gradient descent navigate a 3D loss landscape in real-time.</p>
                    <p className="text-gray-500 text-xs mt-2">Switch to the <strong className="text-cyan-400">Gradient Descent</strong> tab above ↑</p>
                </div>

                <h3 className="text-xl font-bold text-white mt-6 mb-3">Variants of Gradient Descent</h3>

                <div className="space-y-3 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                            <h4 className="text-sm font-bold text-white">Batch Gradient Descent</h4>
                        </div>
                        <p className="text-xs text-gray-400">Computes gradient over the <em>entire</em> dataset. Stable but slow and memory-hungry.</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            <h4 className="text-sm font-bold text-white">Stochastic Gradient Descent (SGD)</h4>
                        </div>
                        <p className="text-xs text-gray-400">Uses a <em>single sample</em> per step. Noisy but fast, the noise actually helps escape local minima.</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            <h4 className="text-sm font-bold text-white">Mini-Batch SGD</h4>
                        </div>
                        <p className="text-xs text-gray-400">The standard in practice. Uses a batch of 32–512 samples. Balances noise and stability.</p>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mt-6 mb-3">Advanced Optimizers</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-yellow-400 mb-2">Momentum</h4>
                        <div className="font-mono text-xs text-center text-white py-2">
                            v<sub>t</sub> = βv<sub>t-1</sub> + ∇J(θ)<br />
                            θ = θ − α·v<sub>t</sub>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Accumulates past gradients like a ball rolling downhill. Accelerates in consistent directions.</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-pink-400 mb-2">RMSProp</h4>
                        <div className="font-mono text-xs text-center text-white py-2">
                            s<sub>t</sub> = βs<sub>t-1</sub> + (1−β)∇J²<br />
                            θ = θ − α·∇J/√(s<sub>t</sub>+ε)
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Adapts learning rate per parameter. Divides by running average of squared gradients.</p>
                    </div>
                    <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-4 ring-1 ring-cyan-500/20">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Adam ⭐</h4>
                        <div className="font-mono text-xs text-center text-white py-2">
                            m = β₁m + (1−β₁)∇J<br />
                            v = β₂v + (1−β₂)∇J²<br />
                            θ = θ − α·m̂/√(v̂+ε)
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Combines momentum + RMSProp. The default optimizer for most deep learning.</p>
                    </div>
                </div>

                <MomentumComparisonViz />
            </section>

            {/* ─── Integrals ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">∫ Integration: Accumulation</h2>

                <p className="mb-4">
                    If derivatives measure <em>rate of change</em>, integrals measure <strong className="text-[var(--color-electric-cyan)]">accumulation</strong>.
                    The definite integral of a function is the total area under its curve.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Fundamental Theorem of Calculus</h3>
                    <div className="text-xl font-mono text-center py-4 text-white">
                        ∫<sub>a</sub><sup>b</sup> f(x) dx = F(b) − F(a)
                    </div>
                    <p className="text-gray-400 text-sm text-center">
                        where F'(x) = f(x). Differentiation and integration are inverse operations.
                    </p>
                </div>

                <IntegralAreaViz />

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-4">
                    <p className="text-purple-300 font-bold text-sm mb-1">🤖 In ML</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                        <li>• <strong className="text-white">Expected Value:</strong> E[X] = ∫ x·f(x) dx — the "average" outcome weighted by probability</li>
                        <li>• <strong className="text-white">Marginalization:</strong> P(x) = ∫ P(x,y) dy — summing out variables in probability</li>
                        <li>• <strong className="text-white">Normalization:</strong> For a valid PDF, ∫ f(x) dx = 1</li>
                        <li>• <strong className="text-white">KL Divergence:</strong> D<sub>KL</sub>(P‖Q) = ∫ P(x) log[P(x)/Q(x)] dx</li>
                    </ul>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* PART II — PROBABILITY                                    */}
            {/* ══════════════════════════════════════════════════════════ */}

            <section className="pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🎲</span>
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight">Part II — Probability</h2>
                        <p className="text-gray-500 text-sm">Quantifying uncertainty — the foundation of every ML prediction</p>
                    </div>
                </div>

                <p className="text-lg mb-4">
                    Machine learning is fundamentally about <strong className="text-[var(--color-electric-cyan)]">uncertainty</strong>.
                    Every classification is a probability distribution over classes. Every regression predicts a mean and variance.
                    Generative models learn the probability distribution of the data itself.
                </p>
            </section>

            {/* ─── Probability Fundamentals ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">📊 Probability Fundamentals</h2>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Kolmogorov Axioms</h3>
                    <ol className="space-y-2 text-sm">
                        <li className="flex gap-3">
                            <span className="text-cyan-400 font-bold shrink-0">Axiom 1:</span>
                            <span>P(A) ≥ 0 for any event A <span className="text-gray-500">(probabilities are non-negative)</span></span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-purple-400 font-bold shrink-0">Axiom 2:</span>
                            <span>P(Ω) = 1 <span className="text-gray-500">(something must happen)</span></span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-yellow-400 font-bold shrink-0">Axiom 3:</span>
                            <span>P(A ∪ B) = P(A) + P(B) if A ∩ B = ∅ <span className="text-gray-500">(additive for disjoint events)</span></span>
                        </li>
                    </ol>
                </div>

                <h3 className="text-xl font-bold text-white mt-6 mb-3">Conditional Probability & Independence</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Conditional Probability</h4>
                        <div className="font-mono text-white text-center py-2 text-lg">
                            P(A|B) = P(A ∩ B) / P(B)
                        </div>
                        <p className="text-xs text-gray-500 mt-2">The probability of A given that B has occurred.</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-purple-400 mb-2">Independence</h4>
                        <div className="font-mono text-white text-center py-2 text-lg">
                            P(A ∩ B) = P(A) · P(B)
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Events A and B are independent if knowing one tells you nothing about the other.</p>
                    </div>
                </div>
            </section>

            {/* ─── Bayes' Theorem ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">🔮 Bayes' Theorem</h2>

                <p className="mb-4">
                    <strong className="text-[var(--color-electric-cyan)]">Bayes' theorem</strong> is the engine of probabilistic
                    reasoning. It tells us how to update our beliefs when we observe new evidence.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Bayes' Theorem</h3>
                    <div className="text-2xl font-mono text-center py-4 text-white">
                        P(H|D) = P(D|H) · P(H) / P(D)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-xs">
                        <div className="text-center"><span className="text-cyan-400 font-bold">P(H|D)</span><br /><span className="text-gray-500">Posterior</span></div>
                        <div className="text-center"><span className="text-yellow-400 font-bold">P(D|H)</span><br /><span className="text-gray-500">Likelihood</span></div>
                        <div className="text-center"><span className="text-purple-400 font-bold">P(H)</span><br /><span className="text-gray-500">Prior</span></div>
                        <div className="text-center"><span className="text-pink-400 font-bold">P(D)</span><br /><span className="text-gray-500">Evidence</span></div>
                    </div>
                </div>

                <BayesViz />

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-4">
                    <p className="text-purple-300 font-bold text-sm mb-1">🤖 In ML</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                        <li>• <strong className="text-white">Naive Bayes classifier</strong> — directly applies Bayes' theorem for classification</li>
                        <li>• <strong className="text-white">MAP estimation</strong> — finding the most probable parameters given data</li>
                        <li>• <strong className="text-white">Bayesian neural networks</strong> — distributions over weights instead of point estimates</li>
                        <li>• <strong className="text-white">Variational inference (VAEs)</strong> — approximate posterior with a simpler distribution</li>
                    </ul>
                </div>
            </section>

            {/* ─── Random Variables ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">🎯 Random Variables & Distributions</h2>

                <p className="mb-4">
                    A <strong className="text-[var(--color-electric-cyan)]">random variable</strong> assigns a numerical value to each
                    outcome of a random experiment. Its <strong className="text-white">distribution</strong> tells us the probabilities
                    of its possible values.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Discrete: PMF</h4>
                        <p className="text-xs text-gray-400 mb-2">Probability Mass Function — for countable outcomes (coin flips, dice rolls, class labels)</p>
                        <div className="font-mono text-white text-center text-sm">P(X = x) = p(x)</div>
                        <div className="font-mono text-gray-500 text-center text-xs mt-1">∑ p(x) = 1</div>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-purple-400 mb-2">Continuous: PDF</h4>
                        <p className="text-xs text-gray-400 mb-2">Probability Density Function — for infinite outcomes (heights, temperatures, pixel values)</p>
                        <div className="font-mono text-white text-center text-sm">P(a ≤ X ≤ b) = ∫<sub>a</sub><sup>b</sup> f(x) dx</div>
                        <div className="font-mono text-gray-500 text-center text-xs mt-1">∫ f(x) dx = 1</div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mt-6 mb-3">Key Statistics</h3>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <h4 className="text-sm font-bold text-cyan-400 mb-1">Expectation (Mean)</h4>
                            <div className="font-mono text-white text-sm">E[X] = ∑ x·P(x)</div>
                            <div className="font-mono text-white text-xs mt-1">E[X] = ∫ x·f(x) dx</div>
                            <p className="text-xs text-gray-500 mt-2">The "center of mass" of the distribution</p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-bold text-yellow-400 mb-1">Variance</h4>
                            <div className="font-mono text-white text-sm">Var(X) = E[(X − μ)²]</div>
                            <div className="font-mono text-white text-xs mt-1">= E[X²] − (E[X])²</div>
                            <p className="text-xs text-gray-500 mt-2">How "spread out" the distribution is</p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-bold text-pink-400 mb-1">Standard Deviation</h4>
                            <div className="font-mono text-white text-sm">σ = √Var(X)</div>
                            <p className="text-xs text-gray-500 mt-2">Same units as X —  more interpretable than variance</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Key Distributions ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">📈 Key Probability Distributions</h2>

                <p className="mb-4">
                    These distributions appear <em>everywhere</em> in machine learning — from binary classification to generative models.
                </p>

                <div className="space-y-4 mb-4">
                    {/* Bernoulli */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-cyan-400">Bernoulli Distribution</h4>
                            <span className="text-xs text-gray-500 font-mono">X ~ Bernoulli(p)</span>
                        </div>
                        <div className="font-mono text-white text-center text-sm py-1">P(X=1) = p,  P(X=0) = 1−p</div>
                        <p className="text-xs text-gray-400 mt-2">Single yes/no trial. E[X] = p, Var(X) = p(1−p)</p>
                        <p className="text-xs text-gray-500">🤖 Binary classification output, dropout mask</p>
                    </div>

                    {/* Binomial */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-purple-400">Binomial Distribution</h4>
                            <span className="text-xs text-gray-500 font-mono">X ~ Bin(n, p)</span>
                        </div>
                        <div className="font-mono text-white text-center text-sm py-1">P(X=k) = C(n,k) · p<sup>k</sup> · (1−p)<sup>n−k</sup></div>
                        <p className="text-xs text-gray-400 mt-2">Number of successes in n trials. E[X] = np, Var(X) = np(1−p)</p>
                        <p className="text-xs text-gray-500">🤖 Accuracy metrics, batch success counts</p>
                    </div>

                    {/* Gaussian */}
                    <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-4 ring-1 ring-cyan-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-cyan-400">Gaussian (Normal) Distribution ⭐</h4>
                            <span className="text-xs text-gray-500 font-mono">X ~ N(μ, σ²)</span>
                        </div>
                        <div className="font-mono text-white text-center text-sm py-1">
                            f(x) = (1/√(2πσ²)) · exp(−(x−μ)²/(2σ²))
                        </div>
                        <p className="text-xs text-gray-400 mt-2">The "bell curve." Central Limit Theorem: averages of anything tend toward Gaussian.</p>
                        <p className="text-xs text-gray-500">🤖 Weight initialization, noise models, VAE latent space, batch normalization</p>
                    </div>

                    {/* Poisson */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-yellow-400">Poisson Distribution</h4>
                            <span className="text-xs text-gray-500 font-mono">X ~ Poisson(λ)</span>
                        </div>
                        <div className="font-mono text-white text-center text-sm py-1">P(X=k) = (λ<sup>k</sup> · e<sup>−λ</sup>) / k!</div>
                        <p className="text-xs text-gray-400 mt-2">Count of events per interval. E[X] = Var(X) = λ</p>
                        <p className="text-xs text-gray-500">🤖 Event count prediction, rare event modeling</p>
                    </div>

                    {/* Exponential */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-pink-400">Exponential Distribution</h4>
                            <span className="text-xs text-gray-500 font-mono">X ~ Exp(λ)</span>
                        </div>
                        <div className="font-mono text-white text-center text-sm py-1">f(x) = λ · e<sup>−λx</sup> for x ≥ 0</div>
                        <p className="text-xs text-gray-400 mt-2">Time between events. E[X] = 1/λ, Var(X) = 1/λ²</p>
                        <p className="text-xs text-gray-500">🤖 Learning rate schedules, survival analysis</p>
                    </div>
                </div>

                <GaussianCurveViz />

                <div className="my-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
                    <p className="text-cyan-300 font-bold text-lg mb-2">📊 Interactive Distribution Explorer</p>
                    <p className="text-gray-400 text-sm">Adjust parameters and see distributions change in real-time.</p>
                    <p className="text-gray-500 text-xs mt-2">Switch to the <strong className="text-cyan-400">Distributions</strong> tab above ↑</p>
                </div>

                <hr className="my-12 border-white/10" />
            </section>

            {/* ─── Central Limit Theorem ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">🎯 Central Limit Theorem</h2>

                <p className="mb-4">
                    The <strong className="text-[var(--color-electric-cyan)]">Central Limit Theorem (CLT)</strong> is one of the
                    most remarkable results in statistics: the average of many independent random variables tends toward a
                    <strong className="text-white">Gaussian distribution</strong>, regardless of the original distribution.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Central Limit Theorem</h3>
                    <div className="text-lg font-mono text-center py-3 text-white">
                        X̄ₙ = (X₁ + X₂ + ... + Xₙ)/n → N(μ, σ²/n) as n → ∞
                    </div>
                    <p className="text-gray-400 text-sm text-center mt-2">
                        The sample mean of n i.i.d. variables converges to a normal distribution.
                    </p>
                </div>

                <CentralLimitTheoremViz />

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-4">
                    <p className="text-purple-300 font-bold text-sm mb-1">🤖 In ML</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                        <li>• <strong className="text-white">Mini-batch gradients</strong> — averaging over a batch makes the gradient estimate more Gaussian</li>
                        <li>• <strong className="text-white">Weight initialization</strong> — CLT justifies Gaussian init for many neurons</li>
                        <li>• <strong className="text-white">Batch Normalization</strong> — normalizes using batch statistics (mean/variance)</li>
                        <li>• <strong className="text-white">Confidence intervals</strong> — CLT enables uncertainty quantification</li>
                    </ul>
                </div>
            </section>

            {/* ─── Covariance & Correlation ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">📈 Covariance & Correlation</h2>

                <p className="mb-4">
                    <strong className="text-[var(--color-electric-cyan)]">Covariance</strong> measures how two variables change together.
                    Understanding it is crucial for PCA, multivariate distributions, and feature analysis.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">Covariance</h4>
                        <div className="font-mono text-white text-center py-2 text-sm">Cov(X,Y) = E[(X−μₓ)(Y−μᵧ)]</div>
                        <p className="text-xs text-gray-400 mt-2">Positive: move together. Negative: move apart. Zero: no linear relationship.</p>
                    </div>
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-purple-400 mb-2">Correlation (Pearson's ρ)</h4>
                        <div className="font-mono text-white text-center py-2 text-sm">ρ = Cov(X,Y) / (σₓ · σᵧ)</div>
                        <p className="text-xs text-gray-400 mt-2">Normalized covariance in [−1, 1]. Scale-invariant measure of linear relationship.</p>
                    </div>
                </div>

                <CovarianceViz />

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mt-4">
                    <h4 className="text-sm font-bold text-yellow-400 mb-2">Covariance Matrix</h4>
                    <p className="text-xs text-gray-400 mb-2">
                        For d-dimensional data, the <strong className="text-white">covariance matrix</strong> Σ is d×d where Σᵢⱼ = Cov(Xᵢ, Xⱼ).
                    </p>
                    <div className="font-mono text-white text-center text-sm py-2">
                        Σ = E[(X − μ)(X − μ)ᵀ]
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        🤖 Used in: PCA (eigenvectors of Σ), Gaussian Mixture Models, Mahalanobis distance, multivariate normal
                    </p>
                </div>
            </section>

            {/* ─── Information Theory ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">📡 Information Theory</h2>

                <p className="mb-4">
                    Information theory is the bridge between probability and machine learning loss functions.
                    It quantifies <strong className="text-[var(--color-electric-cyan)]">information</strong>, <strong className="text-[var(--color-electric-cyan)]">surprise</strong>,
                    and <strong className="text-[var(--color-electric-cyan)]">divergence</strong> between distributions.
                </p>

                <div className="space-y-4 mb-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-cyan-400 mb-2">Entropy — Uncertainty of a Distribution</h3>
                        <div className="text-xl font-mono text-center py-3 text-white">
                            H(X) = −∑ P(x) · log P(x)
                        </div>
                        <p className="text-gray-400 text-sm text-center">
                            High entropy = high uncertainty (uniform distribution). Low entropy = predictable.
                        </p>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-yellow-400 mb-2">Cross-Entropy — The ML Loss Function</h3>
                        <div className="text-xl font-mono text-center py-3 text-white">
                            H(P, Q) = −∑ P(x) · log Q(x)
                        </div>
                        <p className="text-gray-400 text-sm text-center">
                            Measures how well distribution Q approximates the true distribution P.
                            <strong className="text-white"> This is your classification loss function.</strong>
                        </p>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-pink-400 mb-2">KL Divergence — Distance Between Distributions</h3>
                        <div className="text-xl font-mono text-center py-3 text-white">
                            D<sub>KL</sub>(P‖Q) = ∑ P(x) · log[P(x)/Q(x)]
                        </div>
                        <p className="text-gray-400 text-sm text-center">
                            D<sub>KL</sub> ≥ 0, equals 0 only when P = Q. Note: <strong className="text-red-400">not symmetric!</strong>
                        </p>
                        <div className="mt-2 text-center font-mono text-xs text-gray-500">
                            Cross-Entropy = Entropy + KL Divergence → H(P,Q) = H(P) + D<sub>KL</sub>(P‖Q)
                        </div>
                    </div>
                </div>

                <EntropyViz />

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-4">
                    <p className="text-purple-300 font-bold text-sm mb-1">🤖 In ML</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                        <li>• <strong className="text-white">Cross-entropy loss</strong> = <code className="text-cyan-400">nn.CrossEntropyLoss()</code> in PyTorch</li>
                        <li>• <strong className="text-white">KL divergence</strong> = regularization in VAEs, knowledge distillation</li>
                        <li>• <strong className="text-white">Mutual information</strong> = feature selection, representation learning</li>
                        <li>• <strong className="text-white">Binary cross-entropy</strong> = <code className="text-cyan-400">nn.BCELoss()</code> for binary classification</li>
                    </ul>
                </div>
            </section>

            {/* ─── Maximum Likelihood Estimation ──── */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">🎯 Maximum Likelihood Estimation (MLE)</h2>

                <p className="mb-4">
                    <strong className="text-[var(--color-electric-cyan)]">MLE</strong> is the principle that unifies loss functions
                    in ML. Given observed data, find the parameters that make the data <em>most probable</em>.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">MLE Objective</h3>
                    <div className="text-xl font-mono text-center py-4 text-white">
                        θ* = argmax<sub>θ</sub> ∏<sub>i</sub> P(x<sub>i</sub> | θ)
                    </div>
                    <p className="text-gray-400 text-sm text-center mt-2">
                        Taking the log converts the product to a sum (easier to optimize):
                    </p>
                    <div className="text-lg font-mono text-center py-2 text-white">
                        θ* = argmax<sub>θ</sub> ∑<sub>i</sub> log P(x<sub>i</sub> | θ)
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2">MLE for Gaussian</h4>
                        <p className="text-xs text-gray-400 mb-2">Maximizing likelihood for Gaussian data recovers:</p>
                        <div className="font-mono text-white text-center text-sm">
                            μ̂ = (1/n)∑x<sub>i</sub> (sample mean)<br />
                            σ̂² = (1/n)∑(x<sub>i</sub>−μ̂)² (sample variance)
                        </div>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-purple-400 mb-2">MLE = Minimizing Cross-Entropy</h4>
                        <p className="text-xs text-gray-400 mb-2">
                            Maximizing log-likelihood is equivalent to minimizing cross-entropy loss:
                        </p>
                        <div className="font-mono text-white text-center text-sm">
                            max ∑ log P(y|x;θ) = min H(P<sub>data</sub>, P<sub>model</sub>)
                        </div>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-bold text-yellow-400 mb-2">MAP Estimation: MLE + Prior</h4>
                    <p className="text-xs text-gray-400 mb-2">
                        <strong className="text-white">Maximum A Posteriori</strong> adds a prior belief about parameters:
                    </p>
                    <div className="font-mono text-white text-center text-sm py-2">
                        θ* = argmax<sub>θ</sub> [log P(D|θ) + log P(θ)]
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        The prior term <code className="text-cyan-400">log P(θ)</code> acts as <strong className="text-white">regularization</strong>.
                        Gaussian prior on weights → L2 regularization. Laplace prior → L1 regularization.
                    </p>
                </div>

                <LossLandscapeViz />

                <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6 mt-4">
                    <p className="text-green-300 font-bold text-sm mb-2">🏗️ The Grand Unification</p>
                    <p className="text-gray-400 text-sm">
                        Nearly every loss function in ML is a special case of negative log-likelihood under some assumed distribution:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs font-mono">
                        <div className="bg-black/40 p-2 rounded"><span className="text-cyan-400">MSE Loss</span> → Gaussian likelihood</div>
                        <div className="bg-black/40 p-2 rounded"><span className="text-purple-400">Cross-Entropy</span> → Categorical likelihood</div>
                        <div className="bg-black/40 p-2 rounded"><span className="text-yellow-400">BCE Loss</span> → Bernoulli likelihood</div>
                        <div className="bg-black/40 p-2 rounded"><span className="text-pink-400">L2 Regularization</span> → Gaussian prior (MAP)</div>
                    </div>
                </div>
            </section>
        </div>
    );
};
