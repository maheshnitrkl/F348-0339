import React from 'react';
import { BiologicalNeuron } from '../components/BiologicalNeuron';
import { XORProblemViz } from '../components/XORProblemViz';
import { PerceptronViz } from '../components/PerceptronViz';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

export const Perceptron: React.FC = () => {
    return (
        <section className="space-y-16">

            {/* ── 01 · Introduction ──────────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-widest text-sm">
                    <span>01</span>
                    <div className="h-px bg-violet-500/50 w-8" />
                    <span>Biological Inspiration</span>
                </div>
                <h2 className="text-4xl font-bold text-white">From Neuron to Perceptron</h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                    The perceptron — invented by Frank Rosenblatt in 1958 — was directly inspired by the biology
                    of a neuron. It receives inputs, weighs their importance, sums them up,
                    and fires an output signal if a threshold is exceeded.
                </p>

                <BiologicalNeuron />
            </div>

            {/* ── 02 · Mathematical Formulation ──────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-widest text-sm">
                    <span>02</span>
                    <div className="h-px bg-violet-500/50 w-8" />
                    <span>The Math</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Mathematical Formulation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h4 className="text-violet-400 font-semibold mb-3">Step 1 · Weighted Sum</h4>
                        <p className="text-slate-400 text-sm mb-3">
                            Each input x<sub>i</sub> is multiplied by a learned weight w<sub>i</sub>. A bias term b shifts the threshold.
                        </p>
                        <MathEquation formula="z = \sum_{i=1}^{n} w_i x_i + b = \mathbf{w}^T \mathbf{x} + b" block />
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h4 className="text-violet-400 font-semibold mb-3">Step 2 · Activation</h4>
                        <p className="text-slate-400 text-sm mb-3">
                            The result is passed through a step function. If it exceeds 0, the neuron "fires."
                        </p>
                        <MathEquation formula="\hat{y} = \begin{cases} 1 & \text{if } z \geq 0 \\ 0 & \text{otherwise} \end{cases}" block />
                    </div>
                </div>

                {/* Interactive Perceptron */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Interactive Perceptron</h3>
                    <p className="text-slate-400 mb-6">
                        Drag the sliders to adjust weights and bias. Try to separate the green points (class 1) from the red points (class 0) by positioning the decision boundary.
                    </p>
                    <PerceptronViz />
                </div>
            </div>

            {/* ── 03 · The XOR Problem ──────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-sm">
                    <span>03</span>
                    <div className="h-px bg-rose-500/50 w-8" />
                    <span>The XOR Problem & AI Winter</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Why a Single Perceptron Isn't Enough</h3>
                <p className="text-slate-400 leading-relaxed max-w-3xl">
                    In 1969, Minsky and Papert proved that a single perceptron <strong className="text-white">cannot</strong> solve
                    XOR — a fundamental logical operation. This theoretical limitation led to the first "AI Winter."
                    It took until 1986 and the invention of backpropagation to revive the field, showing that
                    multi-layer networks <em>can</em> solve XOR by learning a new feature space.
                </p>
                <XORProblemViz />
            </div>

        </section>
    );
};
