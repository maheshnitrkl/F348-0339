import React from 'react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

export const Architecture: React.FC = () => {
    return (
        <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-4">3. Neural Architecture (MLP)</h2>

            <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl text-slate-300 leading-relaxed">
                    A Multi-Layer Perceptron (MLP) consists of an input layer, one or more hidden layers, and an output layer.
                    This architecture allows the network to learn non-linear combinations of features.
                </p>

                <div className="my-12 p-8 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
                    {/* SVG Diagram of MLP */}
                    <svg width="600" height="400" viewBox="0 0 600 400">
                        <defs>
                            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
                            </marker>
                        </defs>

                        {/* Connections Input -> Hidden */}
                        <g stroke="#334155" strokeWidth="1">
                            <line x1="100" y1="100" x2="300" y2="100" />
                            <line x1="100" y1="100" x2="300" y2="200" />
                            <line x1="100" y1="100" x2="300" y2="300" />

                            <line x1="100" y1="200" x2="300" y2="100" />
                            <line x1="100" y1="200" x2="300" y2="200" />
                            <line x1="100" y1="200" x2="300" y2="300" />

                            <line x1="100" y1="300" x2="300" y2="100" />
                            <line x1="100" y1="300" x2="300" y2="200" />
                            <line x1="100" y1="300" x2="300" y2="300" />
                        </g>

                        {/* Connections Hidden -> Output */}
                        <g stroke="#334155" strokeWidth="1">
                            <line x1="300" y1="100" x2="500" y2="200" />
                            <line x1="300" y1="200" x2="500" y2="200" />
                            <line x1="300" y1="300" x2="500" y2="200" />
                        </g>

                        {/* Input Layer */}
                        <g transform="translate(100,0)">
                            <circle cx="0" cy="100" r="20" fill="#0f172a" stroke="#d8b4fe" strokeWidth="2" />
                            <text x="0" y="105" textAnchor="middle" fill="white" fontSize="12">x₁</text>

                            <circle cx="0" cy="200" r="20" fill="#0f172a" stroke="#d8b4fe" strokeWidth="2" />
                            <text x="0" y="205" textAnchor="middle" fill="white" fontSize="12">x₂</text>

                            <circle cx="0" cy="300" r="20" fill="#0f172a" stroke="#d8b4fe" strokeWidth="2" />
                            <text x="0" y="305" textAnchor="middle" fill="white" fontSize="12">x₃</text>

                            <text x="0" y="360" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">Input</text>
                        </g>

                        {/* Hidden Layer */}
                        <g transform="translate(300,0)">
                            <circle cx="0" cy="100" r="20" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
                            <text x="0" y="105" textAnchor="middle" fill="white" fontSize="12">h₁</text>

                            <circle cx="0" cy="200" r="20" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
                            <text x="0" y="205" textAnchor="middle" fill="white" fontSize="12">h₂</text>

                            <circle cx="0" cy="300" r="20" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
                            <text x="0" y="305" textAnchor="middle" fill="white" fontSize="12">h₃</text>

                            <text x="0" y="360" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">Hidden</text>
                        </g>

                        {/* Output Layer */}
                        <g transform="translate(500,0)">
                            <circle cx="0" cy="200" r="20" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
                            <text x="0" y="205" textAnchor="middle" fill="white" fontSize="12">y-hat</text>

                            <text x="0" y="360" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">Output</text>
                        </g>
                    </svg>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-indigo-400 mb-4">Forward Propagation</h3>
                        <p className="mb-4">The signal flows from input to output:</p>
                        <MathEquation formula="h = \sigma(W^{(1)}x + b^{(1)})" block />
                        <MathEquation formula="\hat{y} = \text{softmax}(W^{(2)}h + b^{(2)})" block />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-emerald-400 mb-4">Universal Approximation</h3>
                        <p className="text-slate-400">
                            A feedforward network with a single hidden layer containing a finite number of neurons
                            can approximate continuous functions on compact subsets of R^n, under mild assumptions
                            on the activation function.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
