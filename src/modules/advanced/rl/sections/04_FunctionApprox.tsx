import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sliders, 
    ArrowRight, 
    Play, 
    Pause, 
    RotateCcw, 
    Terminal, 
    Sparkles, 
    CheckCircle, 
    Info, 
    AlertTriangle,
    Layers,
    LineChart
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';

export const FunctionApprox: React.FC = () => {
    // --- 1. Feature Representation State ---
    const [featureMode, setFeatureMode] = useState<'tile' | 'rbf'>('tile');
    const [inputValue, setInputValue] = useState<number>(5.0); // Continuous 1D state [0, 10]

    // --- 2. Baird's Counterexample Simulator State ---
    const [bairdPlaying, setBairdPlaying] = useState<boolean>(false);
    const [bairdStep, setBairdStep] = useState<number>(0);
    const [bairdLR, setBairdLR] = useState<number>(0.01);
    const [policyMode, setPolicyMode] = useState<'off-policy' | 'on-policy'>('off-policy');
    const [bairdWeights, setBairdWeights] = useState<number[]>([1, 1, 1, 1, 1, 1, 10, 1]); // w1..w8
    const [weightsHistory, setWeightsHistory] = useState<number[][]>([]);
    const [divergenceStatus, setDivergenceStatus] = useState<string>('Stable');
    const [bairdHistory, setBairdHistory] = useState<string[]>(['Baird system initialized with w7=10, others=1.']);

    // --- Tile Coding Configuration ---
    // 3 overlapping tilings of width 3.0
    const tilings = [
        { offset: 0.0, color: 'border-rose-500/40 bg-rose-500/5 text-rose-400' },
        { offset: 1.0, color: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400' },
        { offset: 2.0, color: 'border-violet-500/40 bg-violet-500/5 text-violet-400' }
    ];
    const getActiveTile = (val: number, offset: number): number => {
        const shifted = val - offset;
        return Math.floor(shifted / 3.0);
    };

    // --- Radial Basis Functions (RBF) Configuration ---
    // 5 Gaussian RBFs centered at 1, 3, 5, 7, 9
    const rbfCenters = [1.0, 3.0, 5.0, 7.0, 9.0];
    const sigma = 1.5;
    const getRbfActivation = (val: number, center: number): number => {
        return Math.exp(-Math.pow(val - center, 2) / (2 * Math.pow(sigma, 2)));
    };

    // --- Baird's Counterexample Step Logic ---
    // States 0..5 represent the 6 dashed states, State 6 represents the solid state (7th state)
    // Feature vector function for Baird's 7 states
    const getBairdFeature = (stateIdx: number, weightVector: number[]): number => {
        if (stateIdx >= 0 && stateIdx <= 5) {
            // Dashed states: s_i has feature w_i + 2 * w_8
            return weightVector[stateIdx] + 2 * weightVector[7];
        } else {
            // Solid state (State 6): s_7 has feature 2 * w_7 + w_8
            return 2 * weightVector[6] + weightVector[7];
        }
    };

    const runBairdStep = () => {
        const gamma = 0.99;
        const newWeights = [...bairdWeights];
        let nextStateIdx = 0;
        let importanceSamplingWeight = 1.0;
        let actionTaken = 'solid';

        // Choose starting state uniformly from all 7 states
        const startStateIdx = Math.floor(Math.random() * 7);

        if (policyMode === 'off-policy') {
            // Target policy always chooses Solid (takes to State 6 / s_7)
            // Behavior policy chooses Dashed with prob 6/7, Solid with prob 1/7
            const rand = Math.random();
            if (rand < 6/7) {
                // Dashed action
                actionTaken = 'dashed';
                nextStateIdx = Math.floor(Math.random() * 6); // goes to one of s_1..s_6
                // IS weight = target_prob / behavior_prob = 0 / (6/7) = 0
                importanceSamplingWeight = 0.0;
            } else {
                // Solid action
                actionTaken = 'solid';
                nextStateIdx = 6; // goes to s_7
                // IS weight = target_prob / behavior_prob = 1 / (1/7) = 7.0
                importanceSamplingWeight = 7.0;
            }
        } else {
            // On-policy: Behavior matches target policy (always takes Solid action to s_7)
            actionTaken = 'solid';
            nextStateIdx = 6;
            importanceSamplingWeight = 1.0;
        }

        // Calculate reward (always 0 in Baird's Counterexample)
        const reward = 0;

        // Current value estimate
        // V(S_t) = w^T x(S_t)
        const vStart = getBairdFeature(startStateIdx, bairdWeights);
        const vNext = getBairdFeature(nextStateIdx, bairdWeights);

        // TD target: R + gamma * V(S_t+1)
        const tdTarget = reward + gamma * vNext;
        const tdError = tdTarget - vStart;

        // Update weights using semi-gradient TD(0)
        // w <- w + alpha * rho * (Target - V(S)) * grad(V(S))
        // gradient with respect to w_i:
        // for dashed state s_i (0..5): grad = [0..1 at index i..0, 2 at index 7]
        // for solid state s_7 (6): grad = [0..2 at index 6, 1 at index 7]
        if (startStateIdx >= 0 && startStateIdx <= 5) {
            newWeights[startStateIdx] += bairdLR * importanceSamplingWeight * tdError * 1.0;
            newWeights[7] += bairdLR * importanceSamplingWeight * tdError * 2.0;
        } else {
            newWeights[6] += bairdLR * importanceSamplingWeight * tdError * 2.0;
            newWeights[7] += bairdLR * importanceSamplingWeight * tdError * 1.0;
        }

        // Track max weight value to detect divergence
        const maxVal = Math.max(...newWeights.map(Math.abs));
        if (maxVal > 1e4) {
            setDivergenceStatus('DIVERGED');
            setBairdPlaying(false);
        } else if (maxVal > 50) {
            setDivergenceStatus('UNSTABLE / GROWING');
        } else {
            setDivergenceStatus('Stable');
        }

        setBairdWeights(newWeights);
        setBairdStep(prev => prev + 1);
        setWeightsHistory(prev => [...prev.slice(-20), newWeights]); // keep last 20 steps
        
        const logMsg = `Step ${bairdStep + 1}: Start state S${startStateIdx + 1} -> took ${actionTaken.toUpperCase()} (ρ=${importanceSamplingWeight.toFixed(1)}) -> target value ${vNext.toFixed(2)}. Weights updated. Max |w| = ${maxVal.toFixed(2)}`;
        setBairdHistory(prev => [logMsg, ...prev.slice(0, 5)]);
    };

    // Auto Baird loop
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (bairdPlaying) {
            interval = setInterval(() => {
                runBairdStep();
            }, 100);
        }
        return () => clearInterval(interval);
    }, [bairdPlaying, bairdWeights, bairdLR, policyMode]);

    const resetBaird = () => {
        setBairdPlaying(false);
        setBairdStep(0);
        setBairdWeights([1, 1, 1, 1, 1, 1, 10, 1]);
        setWeightsHistory([]);
        setDivergenceStatus('Stable');
        setBairdHistory(['Baird system reset. w7=10, others=1.']);
    };

    return (
        <div className="space-y-12">
            {/* Header section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-bl-3xl flex items-center justify-center text-pink-400 font-bold border-l border-b border-pink-500/20">
                    Ch. 4
                </div>
                <div className="flex items-center gap-2 text-pink-400 mb-2 font-mono text-xs uppercase tracking-wider">
                    <Sliders size={14} />
                    Module 4 / 13
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Value Function Approximation</h2>
                <p className="text-lg text-slate-400 max-w-4xl leading-relaxed">
                    Tabular reinforcement learning methods cannot scale to large or continuous state spaces due to memory and time constraints (the curse of dimensionality). Value Function Approximation resolves this by mapping states to lower-dimensional parameter spaces, allowing agents to generalize experiences from visited states to structurally similar, unvisited states.
                </p>
            </div>

            {/* Section 1: Intro & MSVE */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-pink-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">1. The Generalization Objective</h3>
                </div>
                <p className="text-slate-400">
                    Instead of maintaining a massive table of values for every state <MathEquation formula="s" />, we represent the value function using a parameter vector <MathEquation formula="\mathbf{w} \in \mathbb{R}^d" />:
                </p>
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 text-center">
                    <MathEquation formula="\hat{v}(s, \mathbf{w}) \approx v_\pi(s)" />
                </div>
                <p className="text-slate-400">
                    Because we have far fewer parameters than states (<MathEquation formula="d \ll |S|" />), modifying the parameter vector to improve the value estimate of one state automatically alters the value estimates of many other states. To find the optimal parameter weights, we define the **Mean Squared Value Error (MSVE)** objective function, weighted by a state distribution <MathEquation formula="d(s)" /> representing how often the agent visits each state:
                </p>
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                    <MathEquation formula="\overline{\text{VE}}(\mathbf{w}) = \sum_{s \in S} d(s) \left[ v_\pi(s) - \hat{v}(s, \mathbf{w}) \right]^2" block />
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        where <MathEquation formula="d(s)" /> represents the stationary state distribution under target policy <MathEquation formula="\pi" />.
                    </p>
                </div>
            </section>

            {/* Section 2: Linear FA & Feature Representations */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-pink-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">2. Linear Function Approximation</h3>
                </div>
                <p className="text-slate-400">
                    One of the most robust and theoretically understood function approximation methods is **Linear Approximation**. We map each state <MathEquation formula="s" /> to a feature vector <MathEquation formula="\mathbf{x}(s) = [x_1(s), x_2(s), \dots, x_d(s)]^T" />, and approximate the value as the dot product of the weights and the features:
                </p>
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 text-center">
                    <MathEquation formula="\hat{v}(s, \mathbf{w}) = \mathbf{w}^T \mathbf{x}(s) = \sum_{i=1}^d w_i x_i(s)" />
                </div>
                <p className="text-slate-400">
                    The gradient of the value function with respect to the weights is simply the feature vector itself: <MathEquation formula="\nabla_{\mathbf{w}} \hat{v}(s, \mathbf{w}) = \mathbf{x}(s)" />. This means updates are highly efficient and linear in complexity.
                </p>

                <h4 className="text-white font-bold text-lg">Key Feature Extraction Methods</h4>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800 space-y-2">
                        <h5 className="font-bold text-white">Tile Coding (Coarse Coding)</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Divides the state space into multiple overlapping partitions (tilings). Each tiling outputs a binary feature (1 if the state falls in a tile, 0 otherwise). The receptive fields overlap, enabling rapid local generalization.
                        </p>
                    </div>
                    <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800 space-y-2">
                        <h5 className="font-bold text-white">Radial Basis Functions (RBFs)</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Maps states to continuous activations using Gaussians centered at designated points <MathEquation formula="c_i" />. Represents continuous generalization but is computationally more expensive than binary tile coding:
                        </p>
                        <MathEquation formula="x_i(s) = \exp\left(-\frac{\|s - c_i\|^2}{2\sigma_i^2}\right)" block />
                    </div>
                </div>
            </section>

            {/* Interactive Feature Activation Explorer */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                        <Sparkles size={18} className="text-pink-500" />
                        Interactive Feature Space Visualizer
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        Slide across the continuous 1D state coordinate and visualize how features activate under different representation algorithms.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Controls Panel */}
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono text-slate-400">
                                <span>Continuous State (s):</span>
                                <span className="text-pink-400 font-bold">{inputValue.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" min="0" max="10" step="0.1" value={inputValue} 
                                onChange={(e) => setInputValue(parseFloat(e.target.value))}
                                className="w-full accent-pink-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[11px] text-slate-500 block">Select Representation:</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setFeatureMode('tile')}
                                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${featureMode === 'tile' ? 'bg-pink-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                                >
                                    Tile Coding
                                </button>
                                <button 
                                    onClick={() => setFeatureMode('rbf')}
                                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${featureMode === 'rbf' ? 'bg-pink-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                                >
                                    Gaussian RBFs
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Graph Panel */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[160px] flex flex-col justify-center">
                        {featureMode === 'tile' ? (
                            <div className="space-y-4">
                                <span className="text-xs text-slate-400 font-bold block">3 Overlapping Tilings (Tiling width = 3.0):</span>
                                <div className="space-y-3 font-mono text-xs">
                                    {tilings.map((tiling, idx) => {
                                        const tile = getActiveTile(inputValue, tiling.offset);
                                        return (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-500">
                                                    <span>Tiling {idx + 1} (Offset +{tiling.offset.toFixed(1)})</span>
                                                    <span className="text-pink-400 font-bold">Active Tile index: {tile}</span>
                                                </div>
                                                <div className="h-6 w-full bg-slate-950 rounded border border-slate-800 flex overflow-hidden relative">
                                                    {/* Mark active tile visually */}
                                                    {Array.from({ length: 4 }).map((_, tileIdx) => {
                                                        const start = tileIdx * 3.0 + tiling.offset;
                                                        const end = start + 3.0;
                                                        const isActive = tile === tileIdx && inputValue >= start && inputValue < end;
                                                        return (
                                                            <div 
                                                                key={tileIdx} 
                                                                className={`flex-1 flex items-center justify-center border-r border-slate-800/30 text-[9px] ${
                                                                    isActive ? 'bg-pink-500/20 text-pink-400 font-bold border-l-2 border-pink-500' : 'text-slate-600'
                                                                }`}
                                                            >
                                                                Tile {tileIdx} [{start.toFixed(0)}, {end.toFixed(0)}]
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <span className="text-xs text-slate-400 font-bold block">5 Gaussian RBF Activations (σ = 1.5):</span>
                                <div className="space-y-2.5 font-mono text-xs">
                                    {rbfCenters.map((center, idx) => {
                                        const act = getRbfActivation(inputValue, center);
                                        return (
                                            <div key={idx} className="flex items-center gap-4">
                                                <span className="w-16 text-[10px] text-slate-500">Center {center.toFixed(1)}</span>
                                                <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-100" 
                                                        style={{ width: `${act * 100}%` }}
                                                    />
                                                </div>
                                                <span className="w-12 text-right text-pink-400 font-bold">{act.toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 3: Semi-Gradients & Deadly Triad */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-pink-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">3. Semi-Gradient Updates & The Deadly Triad</h3>
                </div>
                
                <h4 className="text-white font-bold text-lg">Why "Semi-Gradient"?</h4>
                <p className="text-slate-400">
                    In standard supervised gradient descent, targets are independent of parameters <MathEquation formula="\mathbf{w}" />. However, in reinforcement learning methods that bootstrap (like TD and DP), the update target <MathEquation formula="U_t" /> depends on <MathEquation formula="\mathbf{w}_t" />:
                </p>
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                    <div>For TD(0), Target: <MathEquation formula="U_t = R_{t+1} + \gamma \hat{v}(S_{t+1}, \mathbf{w}_t)" /></div>
                </div>
                <p className="text-slate-400">
                    A true gradient update would differentiate the target with respect to the weights. In **Semi-Gradient** methods, we ignore this dependency, taking the gradient only with respect to the estimate <MathEquation formula="\hat{v}(S_t, \mathbf{w}_t)" />. This is computationally much simpler and converges robustly in on-policy settings:
                </p>
                <div className="bg-black/50 p-4 rounded-lg text-center font-mono text-xs border border-slate-800">
                    <MathEquation formula="\mathbf{w}_{t+1} \leftarrow \mathbf{w}_t + \alpha \left[ R_{t+1} + \gamma \hat{v}(S_{t+1}, \mathbf{w}_t) - \hat{v}(S_t, \mathbf{w}_t) \right] \nabla_{\mathbf{w}} \hat{v}(S_t, \mathbf{w}_t)" block />
                </div>

                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <AlertTriangle className="text-rose-500" size={22} />
                    The Deadly Triad
                </h4>
                <p className="text-slate-400">
                    While semi-gradient methods converge reliably under on-policy state distributions, they can become completely **unstable and diverge to infinity** when three specific properties are active simultaneously. This is called the **Deadly Triad**:
                </p>

                {/* The Deadly Triad Table */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden p-6 space-y-4">
                    <div className="grid grid-cols-3 text-center border-b border-slate-800 pb-3 mb-3 text-xs font-mono text-slate-500 uppercase font-bold">
                        <div>Property</div>
                        <div>Description</div>
                        <div>Role in Divergence</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2.5 text-sm text-slate-300 border-b border-slate-900">
                        <div className="font-bold text-white flex items-center justify-center gap-1">1. Function Approx</div>
                        <div className="text-slate-400 text-xs">Mapping states to lower-dimensional parameters.</div>
                        <div className="text-rose-400 text-xs">Forces parameter sharing, meaning updates overflow to other states.</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2.5 text-sm text-slate-300 border-b border-slate-900">
                        <div className="font-bold text-white flex items-center justify-center gap-1">2. Bootstrapping</div>
                        <div className="text-slate-400 text-xs">Updating value estimates based on successor value estimates.</div>
                        <div className="text-rose-400 text-xs">Allows target values to grow continuously, creating feedback loops.</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2.5 text-sm text-slate-300">
                        <div className="font-bold text-white flex items-center justify-center gap-1">3. Off-Policy Training</div>
                        <div className="text-slate-400 text-xs">Evaluating target policy using behavior trajectories.</div>
                        <div className="text-rose-400 text-xs">Decouples updates from the actual state visit distribution, removing convergence anchors.</div>
                    </div>
                </div>
            </section>

            {/* Interactive Baird's Counterexample Simulator */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-rose-500 animate-pulse" size={20} />
                        Baird's Counterexample: Divergence in Action
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Baird's counterexample is the classic 7-state MDP showing that off-policy semi-gradient TD(0) with linear function approximation diverges to infinity.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Controls Panel */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Simulation Settings</h5>

                            {/* Policy mode select */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-slate-500 block">Training Policy Regime:</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setPolicyMode('off-policy'); resetBaird(); }}
                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${policyMode === 'off-policy' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        Off-Policy (Divergent)
                                    </button>
                                    <button 
                                        onClick={() => { setPolicyMode('on-policy'); resetBaird(); }}
                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${policyMode === 'on-policy' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        On-Policy (Stable)
                                    </button>
                                </div>
                            </div>

                            {/* Learning rate */}
                            <div>
                                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                    <span>Learning Rate (α):</span>
                                    <span className="text-white font-bold">{bairdLR}</span>
                                </div>
                                <input 
                                    type="range" min="0.005" max="0.05" step="0.005" value={bairdLR}
                                    onChange={(e) => setBairdLR(parseFloat(e.target.value))}
                                    className="w-full accent-rose-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Step Controls */}
                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                                <button 
                                    onClick={runBairdStep}
                                    disabled={divergenceStatus === 'DIVERGED'}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    Step Update
                                </button>
                                <button 
                                    onClick={() => setBairdPlaying(!bairdPlaying)}
                                    disabled={divergenceStatus === 'DIVERGED'}
                                    className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${
                                        divergenceStatus === 'DIVERGED' ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
                                        bairdPlaying ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-rose-500 text-white hover:bg-rose-600'
                                    }`}
                                >
                                    {bairdPlaying ? 'Pause' : 'Auto Step'}
                                </button>
                                <button 
                                    onClick={resetBaird}
                                    className="px-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Status Monitor */}
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Steps taken:</span>
                                <span className="text-white font-bold">{bairdStep}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Stability Status:</span>
                                <span className={`font-bold ${
                                    divergenceStatus === 'Stable' ? 'text-emerald-400' : 
                                    divergenceStatus === 'DIVERGED' ? 'text-rose-500 animate-pulse' : 'text-amber-400'
                                }`}>
                                    {divergenceStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Weight Values & Circle Graphic */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Graphic showing star architecture */}
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
                                <span className="text-[10px] text-slate-500 font-mono mb-2">Baird MDP Star Graph</span>
                                <svg viewBox="0 0 200 200" className="w-full max-w-[140px] h-auto">
                                    {/* Dashed States s1..s6 */}
                                    {Array.from({ length: 6 }).map((_, idx) => {
                                        const angle = (idx * 2 * Math.PI) / 6;
                                        const cx = 100 + 60 * Math.cos(angle);
                                        const cy = 100 + 60 * Math.sin(angle);
                                        const stateVal = getBairdFeature(idx, bairdWeights);
                                        return (
                                            <g key={idx}>
                                                {/* Arrow to s7 */}
                                                <line x1={cx} y1={cy} x2={100} y2={100} stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
                                                <circle cx={cx} cy={cy} r="14" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                                                <text x={cx} y={cy - 2} fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">S{idx + 1}</text>
                                                <text x={cx} y={cy + 7} fill="#fda4af" fontSize="6" textAnchor="middle">{stateVal.toFixed(1)}</text>
                                            </g>
                                        );
                                    })}
                                    {/* Solid State s7 */}
                                    <circle cx="100" cy="100" r="18" fill="#1c1917" stroke="#ea580c" strokeWidth="2" />
                                    <text x="100" y="98" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">S7</text>
                                    <text x="100" y="107" fill="#f97316" fontSize="6" textAnchor="middle">
                                        {getBairdFeature(6, bairdWeights).toFixed(1)}
                                    </text>
                                </svg>
                            </div>

                            {/* Weight Table */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10px] space-y-1.5">
                                <span className="text-slate-400 font-bold block mb-1">Parameter Vector (w):</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {bairdWeights.map((w, idx) => (
                                        <div key={idx} className="flex justify-between border-b border-slate-800 pb-0.5">
                                            <span className="text-slate-500">w{idx + 1}:</span>
                                            <span className={`font-bold ${Math.abs(w) > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                                                {w.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Experience Log */}
                        <div className="bg-black/50 p-4 border border-slate-800 rounded-xl h-24 overflow-y-auto font-mono text-xs text-slate-400 scrollbar-hide">
                            <span className="text-rose-400 font-bold block mb-1">&gt; Baird Transition Logs:</span>
                            {bairdHistory.map((log, i) => (
                                <div key={i} className={i === 0 ? 'text-slate-200' : ''}>
                                    - {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Worked Numerical Example */}
            <section className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="text-pink-400" size={20} />
                    Worked Numerical Example: Linear TD(0) Step
                </h4>
                <p className="text-sm text-slate-400">
                    Let's trace a single step of Linear Semi-Gradient TD(0). Assume a 2D state feature vector:
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                    <div>
                        <strong>1. Initial Setup:</strong>
                        <ul className="list-disc pl-5 mt-1 text-slate-400">
                            <li>Current state feature: <MathEquation formula="\mathbf{x}(S_t) = [1.0, 0.5]^T" />.</li>
                            <li>Successor state feature: <MathEquation formula="\mathbf{x}(S_{t+1}) = [0.8, 1.2]^T" />.</li>
                            <li>Current weights: <MathEquation formula="\mathbf{w}_t = [2.0, -1.0]^T" />.</li>
                            <li>Step parameters: <MathEquation formula="\alpha = 0.1" />, <MathEquation formula="\gamma = 0.9" />.</li>
                        </ul>
                    </div>
                    <div>
                        <strong>2. Value Estimates:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            <MathEquation formula="\hat{v}(S_t, \mathbf{w}_t) = 2.0 \times 1.0 + (-1.0) \times 0.5 = 2.0 - 0.5 = 1.5" />
                            <br />
                            <MathEquation formula="\hat{v}(S_{t+1}, \mathbf{w}_t) = 2.0 \times 0.8 + (-1.0) \times 1.2 = 1.6 - 1.2 = 0.4" />
                        </div>
                    </div>
                    <div>
                        <strong>3. Transition Step:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            Observe step reward: <MathEquation formula="R_{t+1} = +2.0" />.
                            <br />
                            Calculate TD target: <MathEquation formula="U_t = R_{t+1} + \gamma \hat{v}(S_{t+1}, \mathbf{w}_t) = 2.0 + 0.9 \times 0.4 = 2.0 + 0.36 = 2.36" />.
                            <br />
                            Calculate TD error: <MathEquation formula="\delta_t = U_t - \hat{v}(S_t, \mathbf{w}_t) = 2.36 - 1.5 = 0.86" />.
                        </div>
                    </div>
                    <div>
                        <strong>4. Weight Vector Update:</strong>
                        <div className="pl-4 mt-1 text-slate-400 font-bold text-pink-400">
                            <MathEquation formula="\mathbf{w}_{t+1} = \mathbf{w}_t + \alpha \delta_t \mathbf{x}(S_t)" />
                            <br />
                            <MathEquation formula="w_1 \leftarrow 2.0 + 0.1 \times 0.86 \times 1.0 = 2.0 + 0.086 = 2.086" />
                            <br />
                            <MathEquation formula="w_2 \leftarrow -1.0 + 0.1 \times 0.86 \times 0.5 = -1.0 + 0.043 = -0.957" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Key takeaways */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <CheckCircle className="text-pink-400" size={20} />
                    Key Takeaways: Value Function Approximation
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
                    <li><strong>Generalization:</strong> By replacing large tables with weight parameters, updates to visited states naturally propagate to similar unvisited states.</li>
                    <li><strong>Semi-Gradient TD:</strong> Updates values using estimates that ignore the target's dependency on parameter weights, reducing computation at the cost of slight estimation bias.</li>
                    <li><strong>The Deadly Triad:</strong> Instability and weight divergence occur when combining Function Approximation, Bootstrapping, and Off-Policy updates. Baird's Counterexample visually proves this behavior.</li>
                </ul>
            </section>

            {/* References */}
            <section className="space-y-2 text-xs text-slate-500">
                <h5 className="font-bold uppercase tracking-wider text-slate-400">Further Readings & References</h5>
                <p>1. Sutton, R. S., & Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em>. MIT Press. Chapters 9, 10, & 11.</p>
                <p>2. Baird, L. (1995). <em>Residual algorithms: Reinforcement learning with function approximation</em>. In Machine Learning Proceedings (pp. 30-37).</p>
                <p>3. Tsitsiklis, J. N., & Van Roy, B. (1997). <em>An analysis of temporal-difference learning with function approximation</em>. IEEE Transactions on Automatic Control, 42(5), 674-690.</p>
            </section>
        </div>
    );
};
