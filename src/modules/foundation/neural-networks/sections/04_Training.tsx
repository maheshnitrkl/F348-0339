/* eslint-disable */
import React from 'react';
import { LearningRateExplorer } from '../components/LearningRateExplorer';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

const TRAINING_STEPS = [
    { num: 1, label: 'Sample Mini-Batch', color: '#818cf8', icon: '📦', desc: 'Randomly sample B training examples (x, y) from the dataset. Batch size B is typically 32–256.' },
    { num: 2, label: 'Forward Pass', color: '#60a5fa', icon: '➡️', desc: 'Pass inputs through the network layer by layer to compute predictions ŷ.' },
    { num: 3, label: 'Compute Loss', color: '#f472b6', icon: '📉', desc: 'Measure how wrong the prediction is. For classification: cross-entropy. For regression: MSE.' },
    { num: 4, label: 'Backward Pass', color: '#fb923c', icon: '⬅️', desc: 'Use backpropagation + chain rule to compute ∂L/∂w for every weight. The full mechanics of how this works (chain rule, computational graphs, Jacobians) are covered in depth in the Backpropagation module.' },
    { num: 5, label: 'Update Weights', color: '#34d399', icon: '🔧', desc: 'Apply the optimizer: w ← w − η·∂L/∂w. Repeat from step 1 until convergence.' },
];

export const Training: React.FC = () => {
    const [activeStep, setActiveStep] = React.useState<number | null>(null);

    return (
        <section className="space-y-16">

            {/* ── 10 · The Training Loop ──────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-widest text-sm">
                    <span>10</span>
                    <div className="h-px bg-orange-500/50 w-8" />
                    <span>Optimization</span>
                </div>
                <h2 className="text-4xl font-bold text-white">The Training Loop</h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                    Training a neural network is an iterative optimization process. The same 5 steps repeat thousands
                    of times until the network's predictions are good enough.
                </p>

                {/* 5-Step Loop Diagram */}
                <div className="space-y-3">
                    <p className="text-slate-500 text-sm">Click each step to learn more.</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
                        {/* Connecting arrows */}
                        <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-slate-800 z-0" style={{ margin: '0 10%' }} />

                        {TRAINING_STEPS.map((step, i) => (
                            <button
                                key={step.num}
                                onClick={() => setActiveStep(activeStep === step.num ? null : step.num)}
                                className={`relative z-10 rounded-xl border p-4 text-left transition-all ${activeStep === step.num ? 'shadow-lg scale-105' : 'hover:scale-102 border-slate-800 bg-slate-900/50'}`}
                                style={activeStep === step.num ? { borderColor: step.color + '80', backgroundColor: step.color + '10' } : {}}
                            >
                                <div className="text-2xl mb-2">{step.icon}</div>
                                <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mb-2"
                                    style={{ backgroundColor: step.color + '22', color: step.color }}>
                                    {step.num}
                                </div>
                                <p className="text-xs font-bold" style={{ color: step.color }}>{step.label}</p>
                            </button>
                        ))}
                    </div>

                    {activeStep !== null && (() => {
                        const step = TRAINING_STEPS.find(s => s.num === activeStep)!;
                        return (
                            <div className="rounded-xl border p-4 text-sm text-slate-300 transition-all"
                                style={{ borderColor: step.color + '40', backgroundColor: step.color + '08' }}>
                                <strong style={{ color: step.color }}>Step {step.num}: {step.label}</strong>
                                <p className="mt-1 text-slate-400">{step.desc}</p>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* ── 11 · Loss Functions ─────────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-widest text-sm">
                    <span>11</span>
                    <div className="h-px bg-orange-500/50 w-8" />
                    <span>Loss Functions</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Measuring Wrongness</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    The loss function quantifies how wrong the model's predictions are. It must be differentiable
                    so we can compute gradients. Different tasks require different loss functions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h4 className="text-blue-400 font-bold mb-2">Mean Squared Error (Regression)</h4>
                        <MathEquation formula="\mathcal{L}_{MSE} = \frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2" block />
                        <p className="text-slate-500 text-xs mt-3">Penalizes large errors more than small ones. Sensitive to outliers.</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h4 className="text-pink-400 font-bold mb-2">Cross-Entropy (Classification)</h4>
                        <MathEquation formula="\mathcal{L}_{CE} = -\frac{1}{N} \sum_{i} \sum_{k} y_{ik} \log(\hat{y}_{ik})" block />
                        <p className="text-slate-500 text-xs mt-3">Standard for classification. Derived from maximum likelihood estimation.</p>
                    </div>
                </div>

                {/* Gradient Descent formula */}
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-6">
                    <h4 className="text-orange-400 font-bold mb-3">Gradient Descent Update Rule</h4>
                    <MathEquation formula="\theta_{t+1} = \theta_t - \eta \cdot \nabla_\theta \mathcal{L}(\theta_t)" block />
                    <p className="text-slate-400 text-sm mt-3">
                        Where η is the <strong className="text-white">learning rate</strong> — the most important hyperparameter.
                        Too small: painfully slow. Too large: diverges.
                    </p>
                </div>
            </div>

            {/* ── 12 · Learning Rate Explorer ─────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-sm">
                    <span>12</span>
                    <div className="h-px bg-emerald-500/50 w-8" />
                    <span>Live Experiment</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Learning Rate Explorer</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    Three identical networks train simultaneously with different learning rates.
                    This experiment uses <strong className="text-white">real JavaScript gradient descent</strong> running
                    in your browser — watch how the learning rate completely changes the training trajectory.
                </p>
                <LearningRateExplorer />
            </div>

            {/* ── Optimizers Cheatsheet ─────────────────────────── */}
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Optimizer Cheatsheet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { name: 'SGD', color: '#64748b', formula: 'θ ← θ - η·g', desc: 'Basic. Noisy. Works when tuned carefully. Good for CV fine-tuning.', update: 'w -= lr * grad' },
                        { name: 'Momentum', color: '#818cf8', formula: 'v = βv + g\nθ ← θ - ηv', desc: 'Accumulates velocity. Faster convergence in consistent directions.', update: 'v = 0.9*v + grad' },
                        { name: 'RMSprop', color: '#f472b6', formula: 'E[g²] = βE[g²] + (1-β)g²', desc: 'Adapts per-parameter LR. Good for RNNs and noisy gradients.', update: 'w -= lr/√E[g²]' },
                        { name: 'Adam', color: '#34d399', formula: 'mₜ = β₁mₜ₋₁ + (1-β₁)gₜ\nvₜ = β₂vₜ₋₁ + (1-β₂)gₜ²', desc: 'Combines momentum + adaptive LR. Default for most deep learning tasks.', update: 'w -= lr*m̂/√v̂+ε' },
                    ].map(opt => (
                        <div key={opt.name} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="font-bold text-lg" style={{ color: opt.color }}>{opt.name}</div>
                            <code className="text-xs bg-slate-950 text-slate-300 px-2 py-1.5 rounded block font-mono whitespace-pre">{opt.formula}</code>
                            <p className="text-slate-500 text-xs">{opt.desc}</p>
                            <code className="text-xs text-slate-600 font-mono">{opt.update}</code>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
};
