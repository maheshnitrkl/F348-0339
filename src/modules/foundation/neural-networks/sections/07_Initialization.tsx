import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Sliders, 
    Activity, 
    HelpCircle, 
    AlertTriangle, 
    Sparkles, 
    CheckCircle,
    Terminal,
    BookOpen,
    Award
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Symmetry & Variance Propagation Simulator
   ═══════════════════════════════════════════════════════════════════════ */

type InitMethod = 'zero' | 'constant' | 'small' | 'large' | 'xavier' | 'kaiming';
type ActType = 'tanh' | 'relu';

const VarianceSimulator: React.FC = () => {
    const [initMethod, setInitMethod] = useState<InitMethod>('xavier');
    const [actType, setActType] = useState<ActType>('tanh');
    const [numLayers, setNumLayers] = useState<number>(6);
    
    const [activationVariances, setActivationVariances] = useState<number[]>([]);
    const [gradientVariances, setGradientVariances] = useState<number[]>([]);
    const [neuronSymmetry, setNeuronSymmetry] = useState<number[][]>([]); // Sample activations per layer

    // Helper: generate normal distribution sample (Box-Muller transform)
    const randomNormal = (mean = 0, stdDev = 1) => {
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + z * stdDev;
    };

    // Run propagation simulation
    const runSimulation = () => {
        const M = 48; // Layer width
        const sampleSize = 5; // Samples to visualize color symmetry
        
        // 1. Initialize input x ~ N(0, 1)
        let h = Array.from({ length: M }, () => randomNormal(0, 1));
        
        const actVars: number[] = [];
        const gradVars: number[] = [];
        const symGrid: number[][] = [];
        
        // Calculate sample variance
        const getVariance = (arr: number[]) => {
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
            return variance;
        };

        actVars.push(getVariance(h));
        symGrid.push(h.slice(0, sampleSize));

        // Keep weight matrices for backward pass
        const weights: number[][][] = [];
        const preActivations: number[][] = [];

        // Forward propagation
        for (let l = 0; l < numLayers; l++) {
            let stdDev = 1.0;
            if (initMethod === 'zero') stdDev = 0;
            else if (initMethod === 'constant') stdDev = 0; // all weights set to 0.2
            else if (initMethod === 'small') stdDev = 0.01;
            else if (initMethod === 'large') stdDev = 3.0;
            else if (initMethod === 'xavier') {
                stdDev = Math.sqrt(2.0 / (M + M)); // Xavier normal
            } else if (initMethod === 'kaiming') {
                stdDev = Math.sqrt(2.0 / M); // Kaiming normal
            }

            // Create weight matrix W [M x M]
            const W: number[][] = [];
            for (let j = 0; j < M; j++) {
                const row = Array.from({ length: M }, () => {
                    if (initMethod === 'zero') return 0;
                    if (initMethod === 'constant') return 0.2;
                    return randomNormal(0, stdDev);
                });
                W.push(row);
            }
            weights.push(W);

            // Compute pre-activations z = W @ h
            const z: number[] = [];
            for (let j = 0; j < M; j++) {
                let sum = 0;
                for (let i = 0; i < M; i++) {
                    sum += W[j][i] * h[i];
                }
                z.push(sum);
            }
            preActivations.push(z);

            // Compute activations h = f(z)
            h = z.map(val => {
                if (actType === 'tanh') return Math.tanh(val);
                return Math.max(0, val); // ReLU
            });

            actVars.push(getVariance(h));
            symGrid.push(h.slice(0, sampleSize));
        }

        // Backward propagation
        // Start with final layer gradient delta^(L) ~ N(0, 1)
        let delta = Array.from({ length: M }, () => randomNormal(0, 1));
        gradVars.unshift(getVariance(delta));

        for (let l = numLayers - 1; l >= 0; l--) {
            const W = weights[l];
            const z = preActivations[l];
            
            // f'(z) activation derivative
            const deriv = z.map(val => {
                if (actType === 'tanh') {
                    const t = Math.tanh(val);
                    return 1 - t * t;
                }
                return val > 0 ? 1 : 0; // ReLU
            });

            // Backpropagate error: delta^(l-1) = (W.T @ delta) * f'(z)
            const nextDelta: number[] = [];
            for (let i = 0; i < M; i++) {
                let sum = 0;
                for (let j = 0; j < M; j++) {
                    sum += W[j][i] * delta[j]; // Transposed matrix multiply
                }
                nextDelta.push(sum * deriv[i]);
            }
            delta = nextDelta;
            gradVars.unshift(getVariance(delta));
        }

        setActivationVariances(actVars);
        setGradientVariances(gradVars);
        setNeuronSymmetry(symGrid);
    };

    useEffect(() => {
        runSimulation();
    }, [initMethod, actType, numLayers]);

    const W = 500;
    const H = 140;

    // Helper: Map variance value to SVG bar height (log-scaled or linear clamped)
    const getBarHeight = (variance: number) => {
        if (isNaN(variance) || variance <= 1e-10) return 2;
        // Clamp between 0.001 and 100 for display
        const val = Math.max(0.001, Math.min(100.0, variance));
        const pct = Math.log10(val * 1000) / 5; // maps 0.001 -> 0%, 100 -> 100%
        return Math.max(2, Math.min(H - 30, pct * (H - 30)));
    };

    // Helper: Map activation to node color
    const getNodeColor = (val: number) => {
        if (initMethod === 'zero') return 'rgb(30, 41, 59)'; // Slate-800
        if (initMethod === 'constant') return 'rgb(147, 51, 234)'; // Purple-600 (identical)
        
        // Map -1 to 1 to red-blue gradient
        const clamped = Math.max(-1, Math.min(1, val));
        const r = Math.floor((clamped + 1) * 127);
        const b = Math.floor((1 - clamped) * 127);
        const g = 100;
        return `rgb(${r}, ${g}, ${b})`;
    };

    const strokeColor = '#a855f7';

    return (
        <Card className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sliders size={18} className="text-purple-400" />
                        Symmetry & Variance Propagation Simulator
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Tweak initialization standard deviations. Trace activation variance forward, gradient variance backward, and check symmetry breaking.
                    </p>
                </div>
            </div>

            {/* Selectors grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 block font-bold">Initialization Method</label>
                    <select 
                        value={initMethod} 
                        onChange={e => setInitMethod(e.target.value as InitMethod)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded p-2 text-xs font-mono"
                    >
                        <option value="zero">Zero Init (all weights = 0)</option>
                        <option value="constant">Constant Init (all weights = 0.2)</option>
                        <option value="small">Small Variance (σ = 0.01)</option>
                        <option value="large">Large Variance (σ = 3.0)</option>
                        <option value="xavier">Xavier Normal (balanced)</option>
                        <option value="kaiming">Kaiming Normal (ReLU optimized)</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 block font-bold">Activation Function</label>
                    <div className="flex gap-2">
                        <button onClick={() => setActType('tanh')} className={`flex-1 py-2 rounded text-xs font-bold font-mono border ${actType === 'tanh' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>TANH</button>
                        <button onClick={() => setActType('relu')} className={`flex-1 py-2 rounded text-xs font-bold font-mono border ${actType === 'relu' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>RELU</button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Network Depth</span>
                        <span className="font-mono text-purple-400 font-bold">{numLayers} layers</span>
                    </label>
                    <input type="range" min="3" max="10" step="1" value={numLayers} onChange={e => setNumLayers(parseInt(e.target.value))} className="w-full accent-purple-500 mt-1" />
                </div>
            </div>

            {/* Visualizing Symmetry */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Neuron Symmetry Map (First 5 Neurons per Layer)</span>
                
                <div className="flex justify-between items-center overflow-x-auto py-2">
                    {neuronSymmetry.map((neurons, layerIdx) => (
                        <div key={layerIdx} className="flex flex-col items-center gap-2 px-3">
                            <span className="text-[9px] font-mono text-slate-600">L{layerIdx}</span>
                            <div className="flex flex-col gap-1">
                                {neurons.map((val, nIdx) => (
                                    <div 
                                        key={nIdx} 
                                        className="w-5 h-5 rounded-full border border-black/40 transition-colors"
                                        style={{ backgroundColor: getNodeColor(val) }}
                                        title={`Val: ${val.toFixed(4)}`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-[10px] text-slate-500 font-sans leading-relaxed">
                    {initMethod === 'zero' || initMethod === 'constant' ? (
                        <span className="text-rose-400 font-semibold block">⚠️ SYMMETRY COLLAPSE DETECTED: All hidden nodes in the same layer compute identical activations! The representation has collapsed to a single coordinate.</span>
                    ) : (
                        <span>✅ SYMMETRY BROKEN: Randomized color configurations confirm neurons are learning distinct directional features.</span>
                    )}
                </div>
            </div>

            {/* Forward and Backward variance graphs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Activation Variance */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Forward Pass Activation Variance (Target: Var ≈ 1.0)</span>
                    
                    <svg width="100%" height={H} className="block">
                        <line x1={0} y1={H - 20} x2={W} y2={H - 20} stroke="#334155" strokeWidth="1" />
                        {activationVariances.map((v, i) => {
                            const barH = getBarHeight(v);
                            const x = (i / activationVariances.length) * (W - 40) + 20;
                            return (
                                <g key={i}>
                                    <rect x={x - 10} y={H - 20 - barH} width="20" height={barH} fill="url(#purpleGrad)" rx="2" />
                                    <text x={x} y={H - 5} textAnchor="middle" fill="#475569" fontSize="8">L{i}</text>
                                    <text x={x} y={H - 23 - barH} textAnchor="middle" fill="#a5f3fc" fontSize="7" className="font-mono">{v.toFixed(3)}</text>
                                </g>
                            );
                        })}
                        <defs>
                            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#c084fc" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Gradient Variance */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Backward Pass Gradient Variance</span>
                    
                    <svg width="100%" height={H} className="block">
                        <line x1={0} y1={H - 20} x2={W} y2={H - 20} stroke="#334155" strokeWidth="1" />
                        {gradientVariances.map((v, i) => {
                            const barH = getBarHeight(v);
                            const x = (i / gradientVariances.length) * (W - 40) + 20;
                            return (
                                <g key={i}>
                                    <rect x={x - 10} y={H - 20 - barH} width="20" height={barH} fill="url(#pinkGrad)" rx="2" />
                                    <text x={x} y={H - 5} textAnchor="middle" fill="#475569" fontSize="8">L{i}</text>
                                    <text x={x} y={H - 23 - barH} textAnchor="middle" fill="#f472b6" fontSize="7" className="font-mono">{v.toFixed(3)}</text>
                                </g>
                            );
                        })}
                        <defs>
                            <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f472b6" />
                                <stop offset="100%" stopColor="#db2777" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* Diagnostic readout */}
            <div className={`p-4 rounded-xl border text-sm font-semibold ${
                initMethod === 'zero' || initMethod === 'constant'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : initMethod === 'small'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : initMethod === 'large'
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
                {initMethod === 'zero' || initMethod === 'constant'
                    ? '❌ Collapse: Symmetry is not broken. Gradients for hidden neurons will remain identical, preventing specialized feature representation.'
                    : initMethod === 'small'
                    ? '❌ Vanishing: Variance decays exponentially. After a few layers, activation variance is near 0, stalling gradient backpropagation.'
                    : initMethod === 'large'
                    ? '⚠️ Explosion: Variance explodes exponentially. Outputs quickly overflow or saturate activations (tanh limits to 1.0, ReLU overflows to infinity).'
                    : `✅ Stable: ${initMethod.toUpperCase()} initialization scales weight variance relative to width (1/N), preserving stable variance throughout deep projection chains.`
                }
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const Initialization: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                    <Sliders size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 7</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-500 mb-4">
                    Weight Initialization
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Set the starting state. Derive symmetry breaking math, master Glorot and Kaiming scaling bounds, 
                    and explore Maximal Update Parameterization (μP) for infinite-width networks.
                </p>
            </motion.div>

            {/* ─── 7.1 SYMMETRY & VARIANCE STABILIZATION ──────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-purple-400" />}>
                    7.1 — Symmetry Breaking & Variance Management
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="Mixer Volume Symmetry">
                        Imagine a multi-track audio console mixing 32 instruments. 
                        If every volume dial starts at exactly **zero**, no sound flows (all inputs are squashed). 
                        If every dial starts at exactly **0.5**, all tracks are mixed with the exact same weight. Since no channel is distinguished, you cannot EQ the drums differently from the guitar. This is **Symmetry**. 
                        If the dials are set randomly but too high, you get ear-shattering feedback (**Exploding Variance**). If set too low, the signal decays to silence before reaching the amplifiers (**Vanishing Variance**). 
                        To keep the overall volume constant, we scale the dial starting points based on how many cords are plugged into each channel (**Xavier/He Scaling**).
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        If all weights in a hidden layer are initialized to the same constant value (e.g., zero), then every hidden neuron receives the exact same inputs and computes the exact same activation output. During backpropagation, their pre-activation gradients will be identical:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                        <span className="text-purple-400 font-bold block">Symmetry Math Collapse Proof:</span>
                        <div>Let weights <MathEquation formula="W_{ji}^{(l)} = c" /> for all <MathEquation formula="j" />.</div>
                        <div>The activations computed are:</div>
                        <MathEquation formula="h_j^{(l)} = f\left(\sum_i c \cdot h_i^{(l-1)}\right) = f\left(c \sum_i h_i^{(l-1)}\right) = h_{\mathrm{same}}" block />
                        <div>The pre-activation backpropagated error is:</div>
                        <MathEquation formula="\delta_j^{(l)} = \left(\sum_k W_{kj}^{(l+1)} \delta_k^{(l+1)}\right) f'(z_j^{(l)}) = \left(c \sum_k \delta_k^{(l+1)}\right) f'(z_{\mathrm{same}}) = \delta_{\mathrm{same}}" block />
                        <div>Consequently, the weight updates are identical:</div>
                        <MathEquation formula="\Delta W_{ji}^{(l)} = -\eta \delta_j^{(l)} h_i^{(l-1)} = -\eta \delta_{\mathrm{same}} h_i^{(l-1)}" block />
                        <p className="text-rose-400 font-sans text-xs mt-1">
                            This algebraic equality remains locked over all training iterations. The neurons can never specialize, collapsing the representation capacity of the layer to that of a single unit. Weight randomization is required to break symmetry.
                        </p>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 7.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-purple-400" />}>
                    7.2 — Derivations of Glorot & He Bounds
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        To prevent activations from vanishing or exploding, we derive weight standard deviations that preserve activation variance across deep layered chains.
                    </p>

                    <div className="space-y-8">
                        {/* Glorot Derivation */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. Glorot / Xavier Initialization (Linear/Tanh)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Assumes activations are symmetric with zero mean, and the activation function operates in its linear region (slope <MathEquation formula="\approx 1" />, like Tanh near zero). Let output <MathEquation formula="y = \sum_{i=1}^{n_{\mathrm{in}}} w_i x_i" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div>Assume weights <MathEquation formula="w_i" /> and inputs <MathEquation formula="x_i" /> are independent and zero-mean:</div>
                                <MathEquation formula="\operatorname{Var}(y) = \sum_{i=1}^{n_{\mathrm{in}}} \operatorname{Var}(w_i x_i) = n_{\mathrm{in}} \left( \operatorname{Var}(w)\operatorname{Var}(x) + \mathbb{E}[w]^2\operatorname{Var}(x) + \mathbb{E}[x]^2\operatorname{Var}(w) \right)" block />
                                <div>Since <MathEquation formula="\mathbb{E}[w] = 0" /> and <MathEquation formula="\mathbb{E}[x] = 0" />:</div>
                                <MathEquation formula="\operatorname{Var}(y) = n_{\mathrm{in}} \operatorname{Var}(w) \operatorname{Var}(x)" block />
                                <div>To maintain variance across layers (<MathEquation formula="\operatorname{Var}(y) = \operatorname{Var}(x)" />), we require:</div>
                                <MathEquation formula="\operatorname{Var}(w) = \frac{1}{n_{\mathrm{in}}}" block />
                                <div>Applying this same principle to backward gradient propagation yields:</div>
                                <MathEquation formula="\operatorname{Var}(w) = \frac{1}{n_{\mathrm{out}}}" block />
                                <div>Taking the harmonic mean of both constraints yields the Glorot variance:</div>
                                <div className="text-purple-400 font-bold"><MathEquation formula="\operatorname{Var}(w) = \frac{2}{n_{\mathrm{in}} + n_{\mathrm{out}}}" block /></div>
                                <div>For a Uniform Distribution <MathEquation formula="W \sim \mathcal{U}(-a, a)" /> where <MathEquation formula="\operatorname{Var}(W) = \frac{a^2}{3}" />:</div>
                                <MathEquation formula="\frac{a^2}{3} = \frac{2}{n_{\mathrm{in}} + n_{\mathrm{out}}} \implies a = \sqrt{\frac{6}{n_{\mathrm{in}} + n_{\mathrm{out}}}}" block />
                            </div>
                        </div>

                        {/* He Derivation */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Kaiming / He Initialization (ReLU)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                ReLU sets all negative values to zero. If the input distribution is symmetric around zero, ReLU zeroes out exactly half of the activations on average, halving the variance. Kaiming et al. (2015) updated Xavier to compensate for this:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div>Because ReLU outputs are zero for negative pre-activations, the output variance is:</div>
                                <MathEquation formula="\operatorname{Var}(y) = n_{\mathrm{in}} \operatorname{Var}(w) \cdot \frac{1}{2} \operatorname{Var}(x)" block />
                                <div>To maintain constant variance (<MathEquation formula="\operatorname{Var}(y) = \operatorname{Var}(x)" />):</div>
                                <div className="text-purple-400 font-bold"><MathEquation formula="\operatorname{Var}(w) = \frac{2}{n_{\mathrm{in}}}" block /></div>
                                <div>For a Uniform Distribution <MathEquation formula="W \sim \mathcal{U}(-a, a)" />:</div>
                                <MathEquation formula="\frac{a^2}{3} = \frac{2}{n_{\mathrm{in}}} \implies a = \sqrt{\frac{6}{n_{\mathrm{in}}}}" block />
                            </div>
                        </div>

                        {/* uP Scaling */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Maximal Update Parameterization (μP)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                When scaling model width <MathEquation formula="n" /> in standard PyTorch setups, learning updates can diverge or freeze because gradients grow or shrink relative to width. Under **μP** (Yang et al. 2021), weight initializations and learning rates are scaled explicitly by width:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-[11px] font-mono leading-relaxed space-y-2">
                                <div>• Hidden layers weights: Scale initialization standard deviation by <MathEquation formula="O(1/\sqrt{n_{\mathrm{in}}})" />.</div>
                                <div>• Output projection layer weights: Scale initialization standard deviation by <MathEquation formula="O(1/n_{\mathrm{in}})" />.</div>
                                <div>• Learning rates: Scale learning rate of parameters by width coefficients.</div>
                                <p className="text-slate-400 font-sans mt-2">
                                    This ensures that the feature update magnitude <MathEquation formula="\Delta h" /> remains exactly <MathEquation formula="O(1)" /> as width approaches infinity, letting engineers train small models to find optimal hyperparameters and transfer them directly to scale up models with zero adjustments.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── VARIANCE SIMULATION PLAYGROUND ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-purple-400" />}>
                    7.3 — Symmetry & Variance Playground
                </SectionTitle>
                <VarianceSimulator />
            </motion.section>

            {/* ─── 7.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-purple-400" />}>
                    7.4 — Worked Numerical Example (Hand-Trace)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: Xavier vs. Kaiming Bounds</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate the uniform distribution initialization bounds for a layer with input size <MathEquation formula="n_{\mathrm{in}} = 256" /> and output size <MathEquation formula="n_{\mathrm{out}} = 512" />.
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4">
                            <div>
                                <span className="text-purple-400 font-bold block">1. Glorot / Xavier Uniform Bound</span>
                                <MathEquation formula="a = \sqrt{\frac{6}{n_{\mathrm{in}} + n_{\mathrm{out}}}} = \sqrt{\frac{6}{256 + 512}} = \sqrt{\frac{6}{768}} = \sqrt{0.0078125} \approx 0.08839" block />
                                <div className="text-slate-500 font-sans mt-1">Weights are sampled uniformly from the interval <MathEquation formula="[-0.08839, 0.08839]" />.</div>
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-purple-400 font-bold block">2. Kaiming / He Uniform Bound</span>
                                <MathEquation formula="a = \sqrt{\frac{6}{n_{\mathrm{in}}}} = \sqrt{\frac{6}{256}} = \sqrt{0.0234375} \approx 0.15309" block />
                                <div className="text-slate-500 font-sans mt-1">Weights are sampled uniformly from the interval <MathEquation formula="[-0.15309, 0.15309]" /> (a wider range to offset ReLU's zeroing actions).</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white">Example B: Linear Chain Variance Propagation</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us hand-trace variance propagation over a 3-layer deep linear chain of neurons where <MathEquation formula="y^{(l)} = w^{(l)} y^{(l-1)}" />. Let input variance <MathEquation formula="\operatorname{Var}(y^{(0)}) = 1.0" />. Let weights be initialized with zero-mean standard deviations:
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4 leading-relaxed">
                            <div>
                                <span className="text-purple-400 font-bold block">Case 1: Under-parameterized Init (σ = 0.5)</span>
                                <div className="pl-2">
                                    <div>• Layer 1: <MathEquation formula="\operatorname{Var}(y^{(1)}) = \operatorname{Var}(w^{(1)}) \operatorname{Var}(y^{(0)}) = (0.5)^2 \cdot 1.0 = 0.25" /></div>
                                    <div>• Layer 2: <MathEquation formula="\operatorname{Var}(y^{(2)}) = (0.5)^2 \cdot 0.25 = 0.0625" /></div>
                                    <div>• Layer 3: <MathEquation formula="\operatorname{Var}(y^{(3)}) = (0.5)^2 \cdot 0.0625 = 0.015625" /></div>
                                    <div className="text-rose-400 font-sans text-xs mt-1">Variance decays exponentially to zero (vanishing activations).</div>
                                </div>
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-purple-400 font-bold block">Case 2: Over-parameterized Init (σ = 2.0)</span>
                                <div className="pl-2">
                                    <div>• Layer 1: <MathEquation formula="\operatorname{Var}(y^{(1)}) = (2.0)^2 \cdot 1.0 = 4.0" /></div>
                                    <div>• Layer 2: <MathEquation formula="\operatorname{Var}(y^{(2)}) = (2.0)^2 \cdot 4.0 = 16.0" /></div>
                                    <div>• Layer 3: <MathEquation formula="\operatorname{Var}(y^{(3)}) = (2.0)^2 \cdot 16.0 = 64.0" /></div>
                                    <div className="text-yellow-400 font-sans text-xs mt-1">Variance explodes exponentially, leading to numerical overflow.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 7.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-purple-400" />}>
                    7.5 — PyTorch Implementation & μP Scaling
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing custom weight initialization loops and a width-scaled Maximal Update Parameterization (μP) layer.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import math

def custom_kaiming_uniform_(tensor: torch.Tensor, a: float = 0.0):
    """
    Manually initialise tensor with Kaiming uniform distribution.
    a: negative slope of ReLU (0 for standard ReLU)
    """
    fan_in = tensor.size(1)
    # Gain for ReLU: sqrt(2 / (1 + a^2))
    gain = math.sqrt(2.0 / (1.0 + a ** 2))
    std = gain / math.sqrt(fan_in)
    
    # Uniform boundary: sqrt(3) * std
    bound = math.sqrt(3.0) * std
    
    with torch.no_grad():
        return tensor.uniform_(-bound, bound)

class MuPLinear(nn.Module):
    """
    Linear layer scaled according to Maximal Update Parameterisation (uP).
    Adapts weight init and lr coefficients dynamically based on layer width.
    """
    def __init__(self, in_features: int, out_features: int, is_output_layer: bool = False):
        super(MuPLinear, self).__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.is_output_layer = is_output_layer
        
        self.weight = nn.Parameter(torch.empty(out_features, in_features))
        self.bias = nn.Parameter(torch.zeros(out_features))
        
        self.reset_parameters()

    def reset_parameters(self):
        # Base Kaiming initialization
        std = 1.0 / math.sqrt(self.in_features)
        
        if self.is_output_layer:
            # Output layers scaled down by width: O(1/width)
            # This prevents output representations from exploding as model widens
            std = std / math.sqrt(self.in_features)
            
        with torch.no_grad():
            self.weight.normal_(0.0, std)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.is_output_layer:
            # Under uP, learning rate of output layer is scaled up
            # which is mathematically equivalent to scaling output layer activations down
            # by 1/width during forward pass
            return (x @ self.weight.t()) / self.in_features + self.bias
        return x @ self.weight.t() + self.bias

if __name__ == "__main__":
    # Test custom Kaiming uniform initialization
    w = torch.empty(2, 256)
    custom_kaiming_uniform_(w)
    print("Manual Kaiming Uniform weights standard deviation:", w.std().item())
    
    # Test uP Linear Layer scaling
    mup_hidden = MuPLinear(in_features=256, out_features=512)
    mup_output = MuPLinear(in_features=512, out_features=10, is_output_layer=True)
    
    feat = torch.randn(1, 256)
    h = mup_hidden(feat)
    out = mup_output(h)
    print("μP Output representation shape:", out.shape)`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
