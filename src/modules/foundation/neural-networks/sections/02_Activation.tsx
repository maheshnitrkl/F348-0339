import React from 'react';
import { ActivationPlayground } from '../components/ActivationPlayground';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

export const Activation: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-4">2. Activation Functions</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300 leading-relaxed">
                    Without activation functions, a neural network would just be a giant linear regression model.
                    <strong>Non-linearity</strong> allows networks to learn complex patterns and approximate any function (Universal Approximation Theorem).
                </p>

                <div className="my-8">
                    <ActivationPlayground />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                    <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                        <h4 className="text-blue-400 font-bold mb-2">Sigmoid</h4>
                        <MathEquation formula="\sigma(x) = \frac{1}{1 + e^{-x}}" block />
                        <p className="text-sm text-slate-500 mt-2">
                            Smooth, bounded [0, 1]. Historically used, but causes vanishing gradients.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                        <h4 className="text-rose-400 font-bold mb-2">ReLU</h4>
                        <MathEquation formula="f(x) = \max(0, x)" block />
                        <p className="text-sm text-slate-500 mt-2">
                            Standard for hidden layers. Solves vanishing gradient for positive values.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
                        <h4 className="text-emerald-400 font-bold mb-2">Tanh</h4>
                        <MathEquation formula="f(x) = \tanh(x)" block />
                        <p className="text-sm text-slate-500 mt-2">
                            Zero-centered [-1, 1]. Often better than sigmoid for hidden layers.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
