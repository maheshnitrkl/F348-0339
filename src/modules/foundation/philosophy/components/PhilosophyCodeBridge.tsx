import React from 'react';
import { Code2, Brain, Zap, Eye } from 'lucide-react';

export const PhilosophyCodeBridge: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-3">🌉 Philosophy ↔ Code Bridge</h2>
                <p className="text-gray-400">
                    Where ancient questions about consciousness meet cutting-edge ML efficiency techniques.
                </p>
            </div>

            {/* Main Question */}
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                    🧠 Does Consciousness Require Efficiency?
                </h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                    Humans filter out irrelevant information instinctively. Modern AI does the same through
                    mathematical optimization. But does computational efficiency imply understanding?
                </p>
            </div>

            {/* Bridge Connections */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Selective Attention */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-8 h-8 text-[var(--color-electric-cyan)]" />
                            <h3 className="text-xl font-bold text-white">Philosophy: Selective Attention</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Consciousness isn't about processing everything—it's about <em>selective</em> awareness.
                            When you read this text, you ignore background sounds, visual periphery, even most of the words.
                            This filtering is central to conscious experience.
                        </p>
                        <div className="bg-black/40 rounded-lg p-4">
                            <p className="text-cyan-200 font-semibold text-sm mb-2">Philosophical Question:</p>
                            <p className="text-gray-400 text-xs italic">
                                Is the ability to focus on relevant information a hallmark of consciousness?
                                Or just efficient information processing?
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Code2 className="w-8 h-8 text-pink-400" />
                            <h3 className="text-xl font-bold text-white">Code: Sparse Attention</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Transformers compute attention across <em>all</em> tokens, but sparse attention masks
                            let the model "ignore" irrelevant parts—saving 90%+ of computation.
                        </p>
                        <div className="bg-black/60 rounded-lg p-4 font-mono text-xs">
                            <pre className="text-pink-200">
                                {`# Sparse Attention: AI "ignores" data
# Just like humans filter background noise

attention_mask = create_sparse_mask(
    seq_length=1024,
    sparsity=0.95  # Only attend to 5%
)

# Now the model focuses on what matters,
# without "experiencing" the rest`}</pre>
                        </div>
                    </div>
                </div>

                {/* Working Memory */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-8 h-8 text-yellow-400" />
                            <h3 className="text-xl font-bold text-white">Philosophy: Working Memory Limits</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            George Miller's "The Magical Number Seven": humans can only hold ~7 items in working memory.
                            This limitation shapes how we think, reason, and experience the world.
                        </p>
                        <div className="bg-black/40 rounded-lg p-4">
                            <p className="text-yellow-200 font-semibold text-sm mb-2">Philosophical Question:</p>
                            <p className="text-gray-400 text-xs italic">
                                Are cognitive limitations essential to consciousness? Would unlimited memory fundamentally
                                change subjective experience?
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Code2 className="w-8 h-8 text-green-400" />
                            <h3 className="text-xl font-bold text-white">Code: Memory-Efficient Attention</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Transformers have quadratic memory complexity. Techniques like Flash Attention and
                            gradient checkpointing reduce memory usage while maintaining performance.
                        </p>
                        <div className="bg-black/60 rounded-lg p-4 font-mono text-xs">
                            <pre className="text-green-200">
                                {`# Memory-Efficient Attention
# Trade computation for memory
# Like human working memory limits

from flash_attn import flash_attn_func

# Only store essential activations
# "Forget" intermediate states
output = flash_attn_func(
    q, k, v,
    dropout_p=0.1,
    causal=True,  # Can't see future
    return_attn_weights=False  # Forget
)`}</pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Binding Problem */}
            <div className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-500/30 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-8 h-8 text-violet-400" />
                    <h3 className="text-2xl font-bold text-white">The Binding Problem</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-lg font-semibold text-violet-300 mb-2">🧠 Philosophy</h4>
                        <p className="text-gray-300 text-sm mb-3">
                            When you see a red ball, how does your brain bind the separate features (color: red, shape: round,
                            object: ball) into a unified conscious experience? This is the binding problem of consciousness.
                        </p>
                        <p className="text-gray-400 text-xs italic">
                            Francis Crick proposed synchronized neural firing as the solution. But no one knows for sure how
                            distributed information becomes unified experience.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-pink-300 mb-2">💻 Code: Multi-Head Attention</h4>
                        <p className="text-gray-300 text-sm mb-3">
                            Different attention heads in Transformers focus on different aspects (syntax, semantics, position).
                            The outputs are concatenated and projected to create a unified representation.
                        </p>
                        <div className="bg-black/60 rounded-lg p-3 font-mono text-xs">
                            <pre className="text-pink-200">
                                {`# Different "perspectives" on data
heads = [head_0, head_1, ..., head_n]
# Bind into unified representation
output = concat(heads) @ W_out`}</pre>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                    <p className="text-violet-200 text-sm">
                        <strong>🔬 The Deep Question:</strong> Is the computational solution to binding
                        (concatenation + projection) fundamentally the same as the phenomenological binding of
                        conscious experience? Or are we just using the same word for two completely different things?
                    </p>
                </div>
            </div>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/10 to-[var(--color-soft-violet)]/10 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-6 h-6 text-[var(--color-electric-cyan)]" />
                    <h4 className="text-xl font-bold text-white">The Convergence Hypothesis</h4>
                </div>
                <p className="text-gray-300 leading-relaxed">
                    Perhaps the mathematical structures that make AI efficient (sparse attention, memory constraints,
                    information binding) aren't just engineering tricks—they might mirror the fundamental constraints
                    that gave rise to biological consciousness.
                </p>
                <p className="text-gray-400 mt-3 italic text-sm">
                    Or maybe we're anthropomorphizing silicon. The philosophical questions remain open, but now you
                    have the tools to think about them rigorously—both conceptually and computationally.
                </p>
            </div>
        </div>
    );
};
