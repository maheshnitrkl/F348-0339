import React from 'react';

export const CalculusTheory: React.FC = () => {
    return (
        <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
                If Linear Algebra is the skeleton, <span className="text-[var(--color-electric-cyan)] font-bold">Calculus</span> is the muscle that moves it.
            </p>
            <p>
                Training a neural network is an optimization problem: we want to minimize a loss function. To do this, we need to know how changing a weight affects the error. This is where <span className="text-[var(--color-soft-violet)] font-bold">Partial Derivatives</span> come in—they measure the rate of change of the loss with respect to a single weight, holding all others constant.
            </p>

            <div className="bg-black/40 border border-white/5 rounded-xl p-6 relative group">
                <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">The Chain Rule in Backpropagation</h3>
                <div className="text-lg font-mono text-center py-4">
                    <div>∂L/∂w = (∂L/∂y) · (∂y/∂h) · (∂h/∂w)</div>
                </div>
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-sm">
                    <ul className="space-y-2">
                        <li className="flex gap-2"><span className="text-[var(--color-electric-cyan)] font-bold">∂L/∂w:</span> How much the loss changes with weight w</li>
                        <li className="flex gap-2"><span className="text-[var(--color-soft-violet)] font-bold">Chain Rule:</span> Multiply gradients backwards through layers</li>
                    </ul>
                </div>
            </div>

            <p>
                Because neural networks are composed of nested functions, we use the <span className="text-[var(--color-electric-cyan)] font-bold">Chain Rule</span> to propagate these gradients backward from the output to the input.
            </p>

            <p>
                This process, <span className="text-[var(--color-soft-violet)] font-bold">Backpropagation</span>, allows the network to 'learn' by iteratively adjusting its weights to reduce error.
            </p>

            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mt-6">
                <p className="text-sm text-gray-400 italic">
                    <span className="text-indigo-400 font-bold">Visualization Note:</span> A computational graph animation would show nodes lighting up in sequence from left to right (Forward Pass), then a red pulse traveling from right to left (Backward Pass), with gradient expressions appearing at each connection.
                </p>
            </div>
        </div>
    );
};
