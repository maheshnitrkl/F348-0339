import React from 'react';
import type { ConceptModule } from '../../../types/module';
import { ComputationalGraph } from './components/ComputationalGraph';
import { AutogradDemo } from './components/AutogradDemo';
import { ChainRuleViz } from './components/ChainRuleViz';
import { MathDerivation } from './components/MathDerivation';
import { TrainingViz } from './components/TrainingViz';
import { MatrixGradients } from './components/MatrixGradients';
import { NeuralNetworkBackpropViz } from './components/NeuralNetworkBackpropViz';
import { LossLandscape3D } from './components/LossLandscape3D';
import { GradientFlowDemo } from './components/GradientFlowDemo';
import { StepByStepCalculator } from './components/StepByStepCalculator';
import { ActivationExplorer } from './components/ActivationExplorer';

const BackPropagationContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pt-24 font-sans selection:bg-cyan-500/30">
            <div className="max-w-6xl mx-auto space-y-24">

                {/* Header Section */}
                <header className="space-y-6 text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4">
                        Module 3: Optimization Engine
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                        Backpropagation
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        The algorithm that powers the modern AI revolution.
                        It efficiently computes gradients by propagating errors backwards through the network.
                    </p>
                </header>

                {/* ╔══════════════════════════════════════════╗ */}
                {/* ║         TRACK 1: INTUITION               ║ */}
                {/* ╚══════════════════════════════════════════╝ */}

                {/* Section 1: The Concept */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-sm">
                            <span>01</span>
                            <div className="h-px bg-purple-500/50 w-8"></div>
                            <span>Intuition</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">The &ldquo;Blame&rdquo; Game</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Imagine a neural network as a massive team of workers passing a product down an assembly line.
                            At the end, the quality inspector (Loss Function) finds a defect.
                            Who is responsible? And by how much?
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                            <strong>Backpropagation</strong> is the process of walking back from the inspector to the start,
                            assigning &ldquo;blame&rdquo; (gradients) to each worker (weight) so they can adjust their work for the next batch.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 p-8 rounded-2xl border border-white/10 shadow-2xl shadow-cyan-900/10">
                        <ChainRuleViz />
                    </div>
                </section>

                {/* Section 2: Activation Functions */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-2">02 &bull; Building Blocks</div>
                        <h2 className="text-3xl font-bold text-white mb-4">Activation Functions</h2>
                        <p className="text-slate-400">
                            Before we can differentiate anything, we need to understand the non-linear functions that make neural networks powerful.
                            Each has different characteristics for gradient flow.
                        </p>
                    </div>
                    <ActivationExplorer />
                </section>

                {/* Section 3: Computational Graph */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-2">03 &bull; Computation</div>
                        <h2 className="text-3xl font-bold text-white mb-4">Computational Graphs</h2>
                        <p className="text-slate-400">
                            To teach a computer calculus, we represent equations as graphs.
                            Nodes are operations, edges are data flow. This structure allows us to automate the Chain Rule.
                        </p>
                    </div>
                    <ComputationalGraph />
                </section>


                {/* ╔══════════════════════════════════════════╗ */}
                {/* ║     TRACK 2: MATHEMATICS DEEP DIVE       ║ */}
                {/* ╚══════════════════════════════════════════╝ */}

                <div className="relative py-12">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-slate-950 px-4 text-sm text-slate-500 font-mono">DEEP DIVE: MATHEMATICS</span>
                    </div>
                </div>

                {/* Section 4: The 4 Equations */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-2">04 &bull; Theory</div>
                        <h2 className="text-3xl font-bold text-white mb-4">The Mathematics of Learning</h2>
                        <p className="text-slate-400">
                            We don&apos;t just &ldquo;wiggle&rdquo; weights randomly. We follow the gradient precisely using these four fundamental equations.
                        </p>
                    </div>
                    <MathDerivation />
                </section>

                {/* Section 5: Matrix Gradients */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-4">Dimensional Analysis</h2>
                        <p className="text-slate-400">
                            One of the biggest hurdles in implementing backprop is getting the shapes right.
                        </p>
                    </div>
                    <MatrixGradients />
                </section>

                {/* Section 6: Step by Step */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-2">05 &bull; Worked Example</div>
                        <h2 className="text-3xl font-bold text-white mb-4">Computing by Hand</h2>
                        <p className="text-slate-400">
                            Walk through a complete forward and backward pass on a concrete neural network
                            with actual numbers. Every step, every multiplication.
                        </p>
                    </div>
                    <StepByStepCalculator />
                </section>


                {/* ╔══════════════════════════════════════════╗ */}
                {/* ║      TRACK 3: PRACTICE & APPLICATION     ║ */}
                {/* ╚══════════════════════════════════════════╝ */}

                <div className="relative py-12">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-slate-950 px-4 text-sm text-slate-500 font-mono">PRACTICE: CODE &amp; DATA</span>
                    </div>
                </div>

                {/* Section 7: Live Neural Network */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">06 &bull; Live Demo</div>
                        <h2 className="text-3xl font-bold text-white mb-4">Backprop in a Real Network</h2>
                        <p className="text-slate-400">
                            Watch a real neural network compute forward activations, then propagate errors backwards.
                            Neurons light up with activations (cyan) and then with gradients (pink).
                        </p>
                    </div>
                    <NeuralNetworkBackpropViz />
                </section>

                {/* Section 8: The Engine (Autograd) */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">07 &bull; Implementation</div>
                        <h2 className="text-3xl font-bold text-white mb-4">Under the Hood: Autograd</h2>
                        <p className="text-slate-400">
                            Deep Learning frameworks like PyTorch and TensorFlow don&apos;t solve derivatives by hand.
                            They build these graphs dynamically. Here is a live, miniature autograd engine.
                        </p>
                    </div>
                    <AutogradDemo />
                </section>


                {/* ╔══════════════════════════════════════════╗ */}
                {/* ║     TRACK 4: OPTIMIZATION & CHALLENGES   ║ */}
                {/* ╚══════════════════════════════════════════╝ */}

                <div className="relative py-12">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-slate-950 px-4 text-sm text-slate-500 font-mono">OPTIMIZATION &amp; CHALLENGES</span>
                    </div>
                </div>

                {/* Section 9: Loss Landscape */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-2">08 &bull; Landscape</div>
                        <h2 className="text-3xl font-bold text-white mb-4">Navigating the Loss Surface</h2>
                        <p className="text-slate-400">
                            The loss function defines a high-dimensional surface.
                            Gradient descent follows the steepest slope downhill. Watch it find the minimum in 3D.
                        </p>
                    </div>
                    <LossLandscape3D />
                </section>

                {/* Section 10: Training Viz */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-2">09 &bull; Application</div>
                        <h2 className="text-3xl font-bold text-white mb-4">Seeing it Work: Linear Regression</h2>
                        <p className="text-slate-400">
                            What is all this calculus for? It&apos;s to minimize error.
                            Watch backpropagation automatically find the best fit line for a dataset.
                        </p>
                    </div>
                    <TrainingViz />
                </section>

                {/* Section 11: Gradient Flow */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-2">10 &bull; Pathology</div>
                        <h2 className="text-3xl font-bold text-white mb-4">When Gradients Fail</h2>
                        <p className="text-slate-400">
                            Deep networks face the vanishing and exploding gradient problem.
                            Adjust the network depth and activation function to see how gradients degrade across layers.
                        </p>
                    </div>
                    <GradientFlowDemo />
                </section>

                {/* Footer / Next Steps */}
                <footer className="border-t border-white/10 pt-12 pb-24 text-center">
                    <h3 className="text-2xl font-bold text-white mb-6">What&apos;s Next?</h3>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <div className="p-6 bg-slate-900 rounded-xl border border-white/10 max-w-xs hover:border-cyan-500/50 transition-colors cursor-pointer group">
                            <h4 className="font-bold text-cyan-400 mb-2 group-hover:text-cyan-300">Neural Networks</h4>
                            <p className="text-sm text-slate-500">
                                Now that you have the engine, let&apos;s build the car. Learn about Perceptrons and MLPs.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-xl border border-white/10 max-w-xs hover:border-violet-500/50 transition-colors cursor-pointer group">
                            <h4 className="font-bold text-violet-400 mb-2 group-hover:text-violet-300">Training Optimization</h4>
                            <p className="text-sm text-slate-500">
                                Adam, learning rate schedules, batch normalization — making backprop practical.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export const BackPropagationModule: ConceptModule = {
    id: 'math-3',
    title: 'Backpropagation',
    description: 'The engine of learning: Computational graphs & chain rule.',
    components: {
        Theory: BackPropagationContent,
    },
};
