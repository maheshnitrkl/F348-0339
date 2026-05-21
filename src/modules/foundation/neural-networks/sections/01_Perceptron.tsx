import React from 'react';
import { PerceptronViz } from '../components/PerceptronViz';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

export const Perceptron: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-4">1. The Perceptron</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300 leading-relaxed">
                    The Perceptron is the mathematical model of a biological neuron.
                    It receives inputs, aggregates them with weights, adds a bias, and passes the result through a step function.
                </p>

                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 my-8">
                    <h3 className="text-lg font-bold text-violet-400 mb-4">Mathematical Formulation</h3>
                    <p className="mb-4">
                        For inputs <MathEquation formula="x" inline /> and weights <MathEquation formula="w" inline />:
                    </p>
                    <MathEquation formula="z = \sum_{i=1}^{n} w_i x_i + b = w^T x + b" block />

                    <p className="mt-4 mb-2">The output is determined by a step function:</p>
                    <MathEquation formula="y = \begin{cases} 1 & \text{if } z > 0 \\ 0 & \text{otherwise} \end{cases}" block />
                </div>

                <div className="my-12">
                    <h3 className="text-2xl font-bold text-white mb-6">Interactive Visualization</h3>
                    <p className="text-slate-400 mb-6">
                        Adjust the weights and bias to separate the green points (1) from the red points (0).
                        This demonstrates how a single perceptron creates a linear decision boundary.
                    </p>
                    <PerceptronViz />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-2">Biological Analogy</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-400">
                            <li><strong>Inputs:</strong> Dendrites receiving signals</li>
                            <li><strong>Weights:</strong> Synaptic strength</li>
                            <li><strong>Sum:</strong> Cell body accumulation</li>
                            <li><strong>Output:</strong> Axon firing (Action Potential)</li>
                        </ul>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-2">Limitations</h4>
                        <p className="text-slate-400">
                            A single perceptron can only solve <strong>linearly separable</strong> problems.
                            It cannot solve XOR, which led to the first "AI Winter".
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
