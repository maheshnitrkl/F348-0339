import React from 'react';

export const DLEfficiencyTheory: React.FC = () => {
    return (
        <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
                Modern Deep Learning is constrained by <span className="text-[var(--color-electric-cyan)] font-bold">GPU memory</span>. Two critical techniques for scaling are Gradient Checkpointing and Mixed Precision Training.
            </p>

            <div className="bg-black/40 border border-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-[var(--color-electric-cyan)] mb-3">Gradient Checkpointing</h3>
                <p className="text-gray-400 mb-4">
                    Trades compute for memory by <span className="text-white font-semibold">not storing</span> all intermediate activations during the forward pass; instead, it re-computes them during the backward pass.
                </p>
                <div className="font-mono text-center py-2 bg-black/40 rounded">
                    MemorySaved ∝ O(√N) vs O(N)
                </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[var(--color-soft-violet)] mb-3">Mixed Precision Training</h3>
                <p className="text-gray-400 mb-4">
                    Uses <span className="text-white font-semibold">16-bit floating-point numbers</span> (FP16/BF16) instead of 32-bit for matrix multiplications, doubling throughput and halving memory usage, while maintaining model accuracy through loss scaling.
                </p>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-electric-cyan)]">✓</span>
                        <span>2x faster matrix operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-electric-cyan)]">✓</span>
                        <span>50% memory reduction</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-electric-cyan)]">✓</span>
                        <span>Minimal accuracy loss with proper scaling</span>
                    </li>
                </ul>
            </div>

            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mt-6">
                <p className="text-sm text-gray-400 italic">
                    <span className="text-indigo-400 font-bold">Visualization Note:</span> A bar chart comparison would show GPU VRAM usage. One bar shows 'Standard Training' (full, red), while the second bar shows 'Gradient Checkpointing' (lower, green). Animated blocks would show memory being freed and re-calculated on the fly.
                </p>
            </div>
        </div>
    );
};
