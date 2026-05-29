import React from 'react';
import { ActivationPlayground } from '../components/ActivationPlayground';
import { VanishingGradientViz } from '../components/VanishingGradientViz';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

export const Activation: React.FC = () => {
    return (
        <section className="space-y-16">

            {/* ── 04 · Why Activation Functions ──────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm">
                    <span>04</span>
                    <div className="h-px bg-cyan-500/50 w-8" />
                    <span>Non-Linearity</span>
                </div>
                <h2 className="text-4xl font-bold text-white">Activation Functions</h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                    Without activation functions, a neural network — no matter how deep — would be equivalent to
                    a <strong>single linear transformation</strong>. Non-linearity is what allows networks to
                    approximate any function (the Universal Approximation Theorem).
                </p>

                {/* Why we need them */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-white font-bold mb-3">Without activation: just linear</h4>
                    <p className="text-slate-400 text-sm mb-3">If every layer is just W·x + b, then the entire stack collapses:</p>
                    <MathEquation formula="W_3(W_2(W_1 x + b_1) + b_2) + b_3 = W_{eff} x + b_{eff}" block />
                    <p className="text-slate-500 text-sm mt-3">
                        No matter how many layers you stack, you still just get a single linear model. That's useless for images, text, or any complex pattern.
                    </p>
                </div>
            </div>

            {/* ── 05 · Playground ────────────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm">
                    <span>05</span>
                    <div className="h-px bg-cyan-500/50 w-8" />
                    <span>Explore 8 Functions</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Activation Function Playground</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    Explore all major activation functions — from the classic Sigmoid to modern GELU used in GPT.
                    Use the input slider to see exact function values and their derivatives.
                </p>
                <ActivationPlayground />
            </div>

            {/* ── 06 · Vanishing Gradient ─────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-sm">
                    <span>06</span>
                    <div className="h-px bg-rose-500/50 w-8" />
                    <span>The Core Problem</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Vanishing & Exploding Gradients</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    Deep networks suffer from a critical training problem: gradients become exponentially small (vanishing)
                    or exponentially large (exploding) as they propagate backward through many layers.
                    This is why activation function choice is critical, and why ReLU revolutionized deep learning.
                </p>
                <VanishingGradientViz />
            </div>

            {/* ── Quick Reference Table ──────────────────────── */}
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Quick Reference Guide</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Function</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Era</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Range</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Best For</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Watch Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Sigmoid', color: '#818cf8', era: 'Classic', range: '[0,1]', use: 'Output (binary)', warn: 'Vanishing gradients, not zero-centered' },
                                { name: 'Tanh', color: '#34d399', era: 'Classic', range: '[-1,1]', use: 'Hidden layers (better than sigmoid)', warn: 'Still vanishing in deep nets' },
                                { name: 'ReLU', color: '#f87171', era: 'Modern', range: '[0,∞)', use: 'Default for hidden layers', warn: 'Dying ReLU (neurons → 0)' },
                                { name: 'Leaky ReLU', color: '#fb923c', era: 'Modern', range: '(-∞,∞)', use: 'When ReLU neurons die', warn: 'Negative slope is a hyperparameter' },
                                { name: 'ELU', color: '#a78bfa', era: 'Modern', range: '(-α,∞)', use: 'Deep residual nets', warn: 'Slower computation' },
                                { name: 'GELU', color: '#60a5fa', era: 'Transformer', range: '≈(-0.17,∞)', use: 'BERT, GPT, ViT', warn: 'More expensive' },
                                { name: 'Swish', color: '#f472b6', era: 'Transformer', range: '≈(-0.28,∞)', use: 'EfficientNet, MobileNet', warn: 'Non-monotonic can be tricky' },
                                { name: 'Softmax', color: '#4ade80', era: 'Always', range: '[0,1] (sum=1)', use: 'Output (multi-class)', warn: 'Only for output layers' },
                            ].map((row) => (
                                <tr key={row.name} className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                                    <td className="py-3 px-4 font-semibold" style={{ color: row.color }}>{row.name}</td>
                                    <td className="py-3 px-4 text-slate-500 text-xs">{row.era}</td>
                                    <td className="py-3 px-4 font-mono text-slate-400 text-xs">{row.range}</td>
                                    <td className="py-3 px-4 text-slate-400 text-xs">{row.use}</td>
                                    <td className="py-3 px-4 text-slate-600 text-xs">{row.warn}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </section>
    );
};
