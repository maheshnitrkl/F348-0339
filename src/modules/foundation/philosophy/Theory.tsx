import React from 'react';

export const PhilosophyTheory: React.FC = () => {
    return (
        <div className="space-y-8 text-gray-300 leading-relaxed">
            {/* Header */}
            <div>
                <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Philosophy of AI
                </h1>
                <p className="text-xl text-gray-400">
                    Before diving into mathematics and code, we must ask the fundamental question:
                    <span className="text-[var(--color-electric-cyan)] font-bold"> What is Intelligence?</span>
                </p>
            </div>

            {/* Historical Foundation */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">Historical Foundation</h2>

                <div className="space-y-4">
                    <p>
                        The question of machine intelligence didn't begin with computers—it emerged from centuries of
                        philosophical inquiry into the nature of mind and thought itself.
                    </p>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-[var(--color-electric-cyan)] mb-3">Plato's Cave (375 BCE)</h3>
                        <p className="text-gray-400 mb-2">
                            Plato's allegory of prisoners watching shadows on a cave wall raises a crucial question:
                            <em> Is perception reality, or just a simulation?</em> Modern AI systems process patterns in data—
                            but do they see reality, or just shadows?
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-[var(--color-electric-cyan)] mb-3">Descartes' Cogito (1637)</h3>
                        <p className="text-gray-400 mb-2">
                            <em>"I think, therefore I am."</em> René Descartes established consciousness as the foundation of existence.
                            But can a machine think? Does a neural network that processes information "exist" in any meaningful sense?
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-[var(--color-electric-cyan)] mb-3">Leibniz's Computing Machine (1685)</h3>
                        <p className="text-gray-400">
                            Gottfried Leibniz envisioned a machine that could resolve all disagreements through calculation.
                            His dream of a "universal characteristic" foreshadowed formal logic and computation—the bedrock of AI.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Turing Inflection Point */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">The Turing Inflection Point (1950)</h2>

                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-[var(--color-electric-cyan)]/30 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-3">The Turing Test</h3>
                    <p className="text-gray-300 mb-4">
                        Alan Turing's 1950 paper <em>"Computing Machinery and Intelligence"</em> reframed the question
                        from "Can machines think?" to <strong>"Can machines behave indistinguishably from humans who think?"</strong>
                    </p>

                    <div className="bg-black/40 rounded-lg p-4 mb-4">
                        <p className="font-mono text-sm text-gray-400 mb-2">The Imitation Game:</p>
                        <ol className="list-decimal list-inside space-y-2 text-gray-300">
                            <li>An interrogator (you) communicates via text with two entities: a human and a machine</li>
                            <li>You can ask any question to determine which is which</li>
                            <li>If you cannot reliably distinguish the machine from the human, the machine has "passed"</li>
                        </ol>
                    </div>

                    <p className="text-gray-400 italic">
                        Turing predicted machines would pass this test by the year 2000. Modern LLMs like GPT-4 and Claude
                        arguably meet this criterion—yet the philosophical debate rages on.
                    </p>
                </div>
            </section>

            {/* Thought Experiments */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">Core Thought Experiments</h2>

                <div className="space-y-6">
                    {/* Chinese Room */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-3">🏮 The Chinese Room Argument (1980)</h3>
                        <p className="text-gray-300 mb-3">
                            Philosopher John Searle's most famous critique of Strong AI: <em>syntax is not semantics.</em>
                        </p>

                        <div className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 rounded-lg p-4 mb-3">
                            <p className="text-gray-200 mb-2 font-semibold">The Setup:</p>
                            <p className="text-gray-300 text-sm">
                                You're locked in a room with a rule book. Chinese symbols come in through a slot.
                                You look up each symbol in the book, find the matching pattern, and output the corresponding response.
                                To observers outside, you appear to understand Chinese perfectly.
                            </p>
                        </div>

                        <p className="text-[var(--color-electric-cyan)] font-semibold mb-2">The Punchline:</p>
                        <p className="text-gray-300 mb-3">
                            You successfully communicated in Chinese, but you don't understand a single word. You're just
                            manipulating symbols according to rules—<strong>exactly what computers do.</strong>
                        </p>

                        <p className="text-gray-400 text-sm italic">
                            💡 This argument suggests that current AI systems (including LLMs) might be performing symbol
                            manipulation without genuine understanding or consciousness.
                        </p>
                    </div>

                    {/* Mary's Room */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-3">🎨 Mary's Room (Knowledge Argument)</h3>
                        <p className="text-gray-300 mb-3">
                            Frank Jackson's thought experiment about the limits of physical knowledge.
                        </p>

                        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 mb-3">
                            <p className="text-gray-300 text-sm">
                                Mary is a brilliant scientist who has lived her entire life in a black-and-white room.
                                She knows <em>everything</em> physical about color: wavelengths, neural processing, photoreceptor biology.
                                One day, she steps outside and sees red for the first time.
                            </p>
                        </div>

                        <p className="text-[var(--color-electric-cyan)] font-semibold mb-2">The Question:</p>
                        <p className="text-gray-300">
                            Did Mary learn something new when she experienced red? If yes, then there's something about
                            consciousness (qualia) that can't be captured by physical facts alone.
                        </p>
                    </div>

                    {/* Philosophical Zombies */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-3">🧟 Philosophical Zombies</h3>
                        <p className="text-gray-300 mb-3">
                            Imagine a being that is physically and behaviorally identical to you—but has no conscious experience.
                            No qualia, no inner life. Just... lights off inside.
                        </p>

                        <p className="text-gray-400">
                            If such a being is conceivable, it suggests consciousness is something <em>additional</em> to
                            physical processing. Could current AI be philosophical zombies—performing complex tasks without
                            any inner experience?
                        </p>
                    </div>
                </div>
            </section>

            {/* Schools of Thought */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">Competing Philosophical Positions</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-[var(--color-electric-cyan)]/30 rounded-xl p-5">
                        <h3 className="text-xl font-bold text-white mb-2">💪 Strong AI (Computationalism)</h3>
                        <p className="text-gray-300 text-sm mb-2">
                            The mind <em>is</em> a computational process. Consciousness emerges from information processing.
                        </p>
                        <p className="text-gray-400 text-xs">
                            <strong>Implication:</strong> Sufficiently advanced AI could genuinely think and be conscious.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-yellow-500/30 rounded-xl p-5">
                        <h3 className="text-xl font-bold text-white mb-2">⚠️ Weak AI (Instrumentalism)</h3>
                        <p className="text-gray-300 text-sm mb-2">
                            AI can <em>simulate</em> thinking, but never genuinely possess consciousness or understanding.
                        </p>
                        <p className="text-gray-400 text-xs">
                            <strong>Implication:</strong> Current AI is just sophisticated pattern matching—useful tools, not minds.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-400/30 rounded-xl p-5">
                        <h3 className="text-xl font-bold text-white mb-2">🧠 Functionalism</h3>
                        <p className="text-gray-300 text-sm mb-2">
                            Mental states are defined by their functional role, not their physical substrate.
                        </p>
                        <p className="text-gray-400 text-xs">
                            <strong>Implication:</strong> Mind can be implemented in silicon just as well as neurons.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-400/30 rounded-xl p-5">
                        <h3 className="text-xl font-bold text-white mb-2">🌿 Embodied Cognition</h3>
                        <p className="text-gray-300 text-sm mb-2">
                            Intelligence is inseparable from having a body that interacts with the world.
                        </p>
                        <p className="text-gray-400 text-xs">
                            <strong>Implication:</strong> Disembodied text models might be fundamentally limited.
                        </p>
                    </div>
                </div>
            </section>

            {/* Modern AI Ethics */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">The Ethics Frontier</h2>

                <div className="space-y-4">
                    <p className="text-gray-300">
                        As AI systems become more capable, philosophical questions become practical urgencies.
                    </p>

                    <div className="bg-black/40 border border-red-500/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-red-400 mb-3">⚡ The Alignment Problem</h3>
                        <p className="text-gray-300 text-sm">
                            How do we ensure AI systems pursue goals aligned with human values? Even a system optimizing
                            a seemingly harmless objective could cause catastrophic harm if misaligned.
                        </p>
                    </div>

                    <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-yellow-400 mb-3">⚖️ Bias and Fairness</h3>
                        <p className="text-gray-300 text-sm mb-3">
                            AI systems trained on historical data inherit historical biases. A model predicting loan
                            approvals might perpetuate systemic discrimination against certain communities.
                        </p>
                        <p className="text-gray-400 text-xs italic">
                            We'll explore this hands-on in the Ethics Playground component below.
                        </p>
                    </div>

                    <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-purple-400 mb-3">🤖 AI Moral Status</h3>
                        <p className="text-gray-300 text-sm">
                            If an AI becomes conscious, does it deserve moral consideration? Rights?
                            This isn't science fiction—we need to decide our ethical framework <em>before</em> we create
                            potentially sentient systems.
                        </p>
                    </div>
                </div>
            </section>

            {/* Conclusion */}
            <div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/10 to-[var(--color-soft-violet)]/10 border border-white/10 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-3">The Philosophical Foundation</h3>
                <p className="text-gray-300">
                    These aren't just abstract debates—they shape how we build, deploy, and regulate AI systems.
                    As you progress through this curriculum, you'll implement the mathematical and computational
                    techniques that power modern AI. But never forget: <strong>the philosophical questions remain open.</strong>
                </p>
            </div>
        </div>
    );
};
