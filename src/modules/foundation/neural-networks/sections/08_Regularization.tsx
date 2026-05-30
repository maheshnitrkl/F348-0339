import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Shield, 
    Activity, 
    HelpCircle, 
    AlertTriangle, 
    Sparkles, 
    CheckCircle,
    Terminal,
    BookOpen,
    Sliders,
    Award
} from 'lucide-react';
import { MathEquation } from '../../../advanced/statistical-learning/components/MathEquation';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; color?: string }> = ({ children, icon, color = '#10b981' }) => (
    <div className="flex items-center gap-3 mb-6">
        {icon && <div className="p-2 rounded-xl" style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>{icon}</div>}
        <h2 className="text-2xl md:text-3xl font-bold text-white">{children}</h2>
    </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 ${className}`}>
        {children}
    </div>
);

const Callout: React.FC<{
    variant: 'insight' | 'pitfall' | 'research' | 'engineering' | 'empirical' | 'intuition';
    title: string;
    children: React.ReactNode;
}> = ({ variant, title, children }) => {
    const config = {
        insight: { color: '#8b5cf6', icon: Sparkles, bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
        pitfall: { color: '#ef4444', icon: AlertTriangle, bg: 'bg-red-500/5', border: 'border-red-500/20' },
        research: { color: '#38bdf8', icon: Terminal, bg: 'bg-sky-500/5', border: 'border-sky-500/20' },
        engineering: { color: '#10b981', icon: CheckCircle, bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        empirical: { color: '#fb923c', icon: Activity, bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
        intuition: { color: '#eab308', icon: HelpCircle, bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
    }[variant];

    const Icon = config.icon;

    return (
        <div className={`flex gap-3 p-5 rounded-xl border ${config.bg} ${config.border}`}>
            <Icon size={18} style={{ color: config.color, flexShrink: 0, marginTop: 2 }} />
            <div>
                <span className="text-sm font-bold block mb-1" style={{ color: config.color }}>{title}</span>
                <span className="text-sm text-slate-300 leading-relaxed block font-sans">{children}</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 1: Weight Decay Sparsity Simulator
   ═══════════════════════════════════════════════════════════════════════ */

const INITIAL_WEIGHTS = [1.2, 0.45, -0.85, 0.15, -0.05];

const SparsitySimulator: React.FC = () => {
    const [decayType, setDecayType] = useState<'l1' | 'l2'>('l1');
    const [weights, setWeights] = useState<number[]>([...INITIAL_WEIGHTS]);
    const [stepCount, setStepCount] = useState<number>(0);

    const eta = 0.1;
    const lambda = 0.35;

    const handleReset = () => {
        setWeights([...INITIAL_WEIGHTS]);
        setStepCount(0);
    };

    const handleStep = () => {
        setWeights(prev => prev.map(w => {
            // Tiny gradient noise to represent random loss gradients
            const g = (Math.random() * 0.04) - 0.02;
            
            if (decayType === 'l1') {
                // L1: sign update
                const sign = w > 0 ? 1 : w < 0 ? -1 : 0;
                let nextW = w - eta * g - eta * lambda * sign;
                
                // If weight crossed zero, clamp to exactly zero (sparsity)
                if (w > 0 && nextW < 0) nextW = 0;
                if (w < 0 && nextW > 0) nextW = 0;
                return Math.abs(nextW) < 1e-4 ? 0 : nextW;
            } else {
                // L2: multiplicative decay
                return w * (1 - eta * lambda) - eta * g;
            }
        }));
        setStepCount(prev => prev + 1);
    };

    const W = 400;
    const H = 140;

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Weight Decay & Sparsity Simulator</span>
                <div className="flex gap-1.5">
                    <button onClick={() => setDecayType('l1')} className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${decayType === 'l1' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500'}`}>L1 (LASSO)</button>
                    <button onClick={() => setDecayType('l2')} className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${decayType === 'l2' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500'}`}>L2 (RIDGE)</button>
                </div>
            </div>

            <div className="flex justify-center bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                <svg width={W} height={H} className="block">
                    <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#334155" strokeWidth="1" />
                    {weights.map((w, i) => {
                        const barH = (w / 1.5) * (H / 2 - 10);
                        const x = (i / weights.length) * (W - 60) + 30;
                        return (
                            <g key={i}>
                                <rect 
                                    x={x - 12} 
                                    y={w >= 0 ? H / 2 - barH : H / 2} 
                                    width="24" 
                                    height={Math.abs(barH)} 
                                    fill={w === 0 ? '#1e293b' : w > 0 ? '#10b981' : '#f43f5e'} 
                                    rx="2" 
                                    style={{ transition: 'all 0.2s ease' }}
                                />
                                <text x={x} y={w >= 0 ? H / 2 - barH - 4 : H / 2 - barH + 10} textAnchor="middle" fill={w === 0 ? '#475569' : '#cbd5e1'} fontSize="8" className="font-mono">
                                    {w.toFixed(3)}
                                </text>
                                <text x={x} y={H - 5} textAnchor="middle" fill="#475569" fontSize="8">w{i}</text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="flex gap-2 justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Steps: {stepCount}</span>
                <div className="flex gap-2">
                    <button onClick={handleStep} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all">Apply Decay Step</button>
                    <button onClick={handleReset} className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-all">Reset</button>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                {decayType === 'l1'
                    ? 'Notice that L1 penalty applies a constant magnitude update. As a result, small weights (w3, w4) shrink all the way to EXACTLY zero (sparsity).'
                    : 'Notice that L2 penalty applies a decay proportional to the weight magnitude. Larger weights shrink quickly, but smaller weights decay slower, lingering around zero without hitting it exactly.'
                }
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: Dropout Node Grid
   ═══════════════════════════════════════════════════════════════════════ */

const DropoutVisualizer: React.FC = () => {
    const [rate, setRate] = useState<number>(0.5);
    const [activeMask, setActiveMask] = useState<boolean[]>([true, true, true, true, true, true]);
    const [step, setStep] = useState<number>(0);

    const handleStep = () => {
        // Bernoulli sampling for 6 nodes
        setActiveMask(Array.from({ length: 6 }, () => Math.random() >= rate));
        setStep(prev => prev + 1);
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Dropout Node Co-Adaptation Grid</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Sliders */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 flex justify-between">
                            <span>Dropout Rate (p)</span>
                            <span className="font-mono text-emerald-400 font-bold">{rate.toFixed(1)}</span>
                        </label>
                        <input type="range" min="0" max="0.9" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleStep} className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all">Forward Step</button>
                        <button onClick={() => { setActiveMask([true,true,true,true,true,true]); setStep(0); }} className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white text-xs transition-all">Reset</button>
                    </div>
                </div>

                {/* Node representation */}
                <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-900 flex justify-center">
                    <svg width="220" height="120" viewBox="0 0 220 120">
                        {/* Lines */}
                        {[15, 35, 55, 75, 95, 115].map((y1) => 
                            [15, 35, 55, 75, 95, 115].map((y2, j) => {
                                const active = activeMask[j];
                                return (
                                    <line 
                                        key={`${y1}-${y2}`} 
                                        x1="40" y1={y1 - 5} x2="180" y2={y2 - 5} 
                                        stroke={active ? '#10b981' : '#1e293b'} 
                                        strokeWidth={active ? 1 : 0.5} 
                                        strokeDasharray={active ? 'none' : '3,3'} 
                                        opacity={active ? 0.35 : 0.15}
                                    />
                                );
                            })
                        )}

                        {/* Input nodes */}
                        {[15, 35, 55, 75, 95, 115].map((y, i) => (
                            <circle key={`in-${i}`} cx="40" cy={y - 5} r="6" fill="#047857" />
                        ))}

                        {/* Hidden nodes with dropout mask */}
                        {[15, 35, 55, 75, 95, 115].map((y, i) => {
                            const active = activeMask[i];
                            return (
                                <g key={`hid-${i}`}>
                                    <circle cx="180" cy={y - 5} r="7" fill={active ? '#10b981' : '#1e293b'} stroke={active ? '#6ee7b7' : '#334155'} strokeWidth="1" style={{ transition: 'all 0.2s ease' }} />
                                    {!active && (
                                        <path d={`M177,${y-8} L183,${y-2} M183,${y-8} L177,${y-2}`} stroke="#ef4444" strokeWidth="1.5" />
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                During forward pass, each hidden neuron has a probability <MathEquation formula="p" /> of being shut down (marked with red cross). This forces the remaining active network paths to learn robust features without relying on co-adaptations.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: Normalization dimensions visualizer
   ═══════════════════════════════════════════════════════════════════════ */

type NormDimType = 'batch' | 'layer';

const NormDimensionVisualizer: React.FC = () => {
    const [normType, setNormType] = useState<NormDimType>('layer');

    const handleToggle = (type: NormDimType) => {
        setNormType(type);
    };

    // Draw a mock 3D tensor block grid [B x T x D]
    // B: Batch (vertical, 4 layers)
    // T: Time (horizontal-ish, 4 columns)
    // D: Depth (receding axis, 4 slices)
    const drawBlock = () => {
        const voxels = [];
        const size = 18;
        const gap = 4;
        
        // Isometric project formulas:
        const getProj = (b: number, t: number, d: number) => {
            const x = 110 + t * (size + gap) - d * (size * 0.45);
            const y = 20 + b * (size + gap) + d * (size * 0.4);
            return { x, y };
        };

        for (let d = 0; d < 3; d++) { // Depth index (features)
            for (let b = 0; b < 3; b++) { // Batch index
                for (let t = 0; t < 3; t++) { // Time index
                    const { x, y } = getProj(b, t, d);
                    
                    // Determine if voxel is highlighted based on norm type
                    let highlight = false;
                    if (normType === 'batch') {
                        // BN normalizes over the batch axis (projects across B, keeps T and D independent)
                        // Show highlight on the column slice
                        highlight = (t === 1 && d === 1);
                    } else {
                        // LN normalizes over features (projects across Depth axis D, keeps B and T independent)
                        // Show highlight on the depth row slice
                        highlight = (b === 1 && t === 1);
                    }

                    voxels.push(
                        <g key={`${b}-${t}-${d}`} style={{ transition: 'all 0.3s ease' }}>
                            {/* Voxel base */}
                            <polygon 
                                points={`${x},${y} ${x + size},${y} ${x + size + size*0.4},${y - size*0.4} ${x + size*0.4},${y - size*0.4}`}
                                fill={highlight ? '#10b981' : '#1e293b'} 
                                stroke={highlight ? '#34d399' : '#0f172a'} 
                                strokeWidth="0.8"
                                opacity={highlight ? 0.9 : 0.25}
                            />
                            {/* Front face */}
                            <polygon 
                                points={`${x},${y} ${x + size},${y} ${x + size},${y + size} ${x},${y + size}`}
                                fill={highlight ? '#059669' : '#1e293b'} 
                                stroke={highlight ? '#34d399' : '#0f172a'} 
                                strokeWidth="0.8"
                                opacity={highlight ? 0.9 : 0.25}
                            />
                            {/* Side face */}
                            <polygon 
                                points={`${x + size},${y} ${x + size + size*0.4},${y - size*0.4} ${x + size + size*0.4},${y + size - size*0.4} ${x + size},${y + size}`}
                                fill={highlight ? '#047857' : '#0f172a'} 
                                stroke={highlight ? '#34d399' : '#0f172a'} 
                                strokeWidth="0.8"
                                opacity={highlight ? 0.9 : 0.2}
                            />
                        </g>
                    );
                }
            }
        }
        return voxels;
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Normalization Dimension Visualizer</span>
                <div className="flex gap-1.5">
                    <button onClick={() => handleToggle('batch')} className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${normType === 'batch' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500'}`}>BATCHNORM</button>
                    <button onClick={() => handleToggle('layer')} className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${normType === 'layer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500'}`}>LAYERNORM</button>
                </div>
            </div>

            <div className="flex justify-center bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                <svg width="220" height="120" viewBox="0 0 220 120">
                    {drawBlock()}
                </svg>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                {normType === 'batch'
                    ? 'Batch Normalization normalizes activations vertically across the batch axis. It coordinates samples, which introduces batch size dependencies.'
                    : 'Layer Normalization normalizes activations horizontally across features for each independent sample, making it batch-size independent and ideal for sequential models.'
                }
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const Regularization: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-emerald-400 mb-4">
                    <Shield size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 8</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-500 mb-4">
                    Regularization Techniques
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Constrain parameter search spaces. Derive sparse L1 and decay L2 properties, analyze expected value 
                    scaling in Dropout, and contrast BatchNorm, LayerNorm, and transformer-era RMSNorm.
                </p>
            </motion.div>

            {/* ─── 8.1 GENERALIZATION & DECOMPOSITION ─────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-emerald-400" />}>
                    8.1 — Generalization & Bias-Variance Decomposition
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="Main Textbooks vs Footnote Memorization">
                        Think of a student preparing for a comprehensive subject test. 
                        **L1 / L2 regularization** acts like a study guide that forbids you from reading details in tiny footnotes. It forces you to focus only on main headers and bolded equations, keeping your understanding general. 
                        **Dropout** acts like a study group where a random half of the students are muted on every practice question. This forces every single student to study and answer on their own, preventing the group from relying solely on one smart student. 
                        **Normalization** (BatchNorm/LayerNorm) acts like grading on a curve, adjusting grades across different semesters so that average scores remain comparable, preventing extreme test formats from skewing final class rankings.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Generalization measures a network's capability to perform on unseen datasets. The expected prediction error can be decomposed into three mathematically independent terms:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center font-mono text-xs">
                        <MathEquation formula="\mathbb{E}\left[ (y - \hat{f}(\mathbf{x}))^2 \right] = \operatorname{Bias}\left[\hat{f}(\mathbf{x})\right]^2 + \operatorname{Var}\left[\hat{f}(\mathbf{x})\right] + \sigma_{\mathrm{irreducible}}^2" block />
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        High-capacity models (large depth/width) have very low bias but high variance, easily overfitting to random noise in the training set. Regularization techniques introduce priors or noise to restrict parameter spaces, sacrificing training bias slightly to achieve massive drops in variance.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 8.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-emerald-400" />}>
                    8.2 — Regularization & Normalization Derivations
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us derive the exact equations and updates for classical and modern normalization layers.
                    </p>

                    <div className="space-y-8">
                        {/* L1 vs L2 */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. L1 vs. L2 Weight Decay Updates</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                L1 regularization adds absolute weight magnitude, leading to sparse weights. L2 adds squared weight values, causing exponential decay of large parameters.
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">L1 Penalty Gradient Update</span>
                                    <MathEquation formula="\mathcal{L} = \mathcal{L}_0 + \lambda \sum_i |w_i| \implies \theta_{t+1} = \theta_t - \eta \nabla \mathcal{L}_0 - \eta \lambda \operatorname{sign}(\theta_t)" block />
                                    <p className="text-slate-500 font-sans text-[11px] mt-1">Since the gradient magnitude is constant (<MathEquation formula="\pm 1" />) regardless of how small the weight is, L1 continuously pushes small weights to exactly zero, creating sparse features.</p>
                                </div>
                                <div className="border-t border-slate-900 pt-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">L2 Penalty Gradient Update</span>
                                    <MathEquation formula="\mathcal{L} = \mathcal{L}_0 + \frac{\lambda}{2} \sum_i w_i^2 \implies \theta_{t+1} = (1 - \eta \lambda)\theta_t - \eta \nabla \mathcal{L}_0" block />
                                    <p className="text-slate-500 font-sans text-[11px] mt-1">Weight values are decayed multiplicatively by <MathEquation formula="1 - \eta\lambda" />. The decay rate drops to zero as the weight shrinks, shrinking weights without forcing them to absolute zero.</p>
                                </div>
                            </div>
                        </div>

                        {/* Inverted Dropout */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Inverted Dropout Expectation Scaling</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Classic dropout requires scaling outputs during evaluation to maintain expectation. **Inverted Dropout** scales activations during training by dividing by probability <MathEquation formula="p" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div>Let mask <MathEquation formula="m_i \sim \operatorname{Bernoulli}(p)" /> where <MathEquation formula="P(m_i=1) = p" />. Under inverted dropout:</div>
                                <MathEquation formula="\tilde{h}_i = \frac{h_i \cdot m_i}{p}" block />
                                <div>The expected value of activation is preserved exactly:</div>
                                <MathEquation formula="\mathbb{E}[\tilde{h}_i] = \frac{1}{p} \mathbb{E}[h_i \cdot m_i] = \frac{1}{p} h_i \mathbb{E}[m_i] = \frac{1}{p} h_i p = h_i" block />
                                <p className="text-slate-500 font-sans text-[11px] mt-1">This normalization keeps activation magnitudes stable during training, allowing the model to run in evaluation mode with zero scale adjustments.</p>
                            </div>
                        </div>

                        {/* Normalizations */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Batch Normalization vs. Layer Normalization</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                BatchNorm computes statistics across the mini-batch dimension, coordinating samples. LayerNorm computes statistics across features within each single sample independently.
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Batch Normalization (across Batch B)</span>
                                    <MathEquation formula="\mu_B = \frac{1}{B}\sum_{b=1}^B x_b, \quad \sigma_B^2 = \frac{1}{B}\sum_{b=1}^B (x_b - \mu_B)^2 \implies \hat{x}_b = \frac{x_b - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}" block />
                                </div>
                                <div className="border-t border-slate-900 pt-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Layer Normalization (across Features D)</span>
                                    <MathEquation formula="\mu_L = \frac{1}{D}\sum_{d=1}^D x_d, \quad \sigma_L^2 = \frac{1}{D}\sum_{d=1}^D (x_d - \mu_L)^2 \implies \hat{x}_d = \frac{x_d - \mu_L}{\sqrt{\sigma_L^2 + \epsilon}}" block />
                                </div>
                            </div>
                        </div>

                        {/* RMSNorm */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. RMSNorm (Root Mean Square Normalization)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Modern LLMs (LLaMA) replace LayerNorm with **RMSNorm**. Zhang & Sennrich (2019) demonstrated that the mean-centering step in LayerNorm is redundant for stability. Skipping mean calculation and normalizing solely by Root Mean Square reduces computation time:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\text{RMSNorm}(\mathbf{x})_i = \gamma_i \frac{x_i}{\operatorname{RMS}(\mathbf{x}) + \epsilon}, \quad \text{where } \operatorname{RMS}(\mathbf{x}) = \sqrt{\frac{1}{D}\sum_{j=1}^D x_j^2}" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-emerald-400" />}>
                    8.3 — Regularization & Normalization Sandbox
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SparsitySimulator />
                    <DropoutVisualizer />
                    <NormDimensionVisualizer />
                </div>
            </motion.section>

            {/* ─── 8.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-emerald-400" />}>
                    8.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: L1 vs. L2 Weight Decay Updates</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate a single gradient step for a weight <MathEquation formula="w_0 = 0.05" /> given loss gradient <MathEquation formula="g_0 = 0.02" />, learning rate <MathEquation formula="\eta = 0.1" />, and decay factor <MathEquation formula="\lambda = 0.4" />.
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4">
                            <div>
                                <span className="text-emerald-400 font-bold block">1. L1 Regularization Update</span>
                                <MathEquation formula="w_1 = w_0 - \eta g_0 - \eta \lambda \operatorname{sign}(w_0)" block />
                                <MathEquation formula="= 0.05 - 0.1(0.02) - 0.1(0.4) \operatorname{sign}(0.05) = 0.05 - 0.002 - 0.04(1.0) = 0.008" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-emerald-400 font-bold block">2. L2 Regularization Update</span>
                                <MathEquation formula="w_1 = w_0(1 - \eta \lambda) - \eta g_0" block />
                                <MathEquation formula="= 0.05(1 - 0.1 \cdot 0.4) - 0.1(0.02) = 0.05(0.96) - 0.002 = 0.048 - 0.002 = 0.046" block />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white">Example B: RMSNorm Evaluation</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate the forward normalization of a 3D feature representation vector:
                            <MathEquation formula="\mathbf{x} = \begin{pmatrix} 3.0 \\ 0.0 \\ 4.0 \end{pmatrix}" block />
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3 leading-relaxed">
                            <div>
                                <span className="text-emerald-400 font-bold block mb-1">1. Compute Root Mean Square (RMS):</span>
                                <MathEquation formula="\operatorname{RMS}(\mathbf{x}) = \sqrt{\frac{1}{D}\sum_j x_j^2} = \sqrt{\frac{3^2 + 0^2 + 4^2}{3}} = \sqrt{\frac{9 + 0 + 16}{3}} = \sqrt{\frac{25}{3}} \approx 2.88675" block />
                            </div>
                            <div>
                                <span className="text-emerald-400 font-bold block mb-1">2. Normalize Vector (with ε = 1e-8):</span>
                                <div className="grid grid-cols-1 gap-1 pl-2">
                                    <div><MathEquation formula="\hat{x}_1 = 3.0 / 2.88675 \approx 1.0392" /></div>
                                    <div><MathEquation formula="\hat{x}_2 = 0.0 / 2.88675 = 0.0000" /></div>
                                    <div><MathEquation formula="\hat{x}_3 = 4.0 / 2.88675 \approx 1.3856" /></div>
                                </div>
                            </div>
                            <div className="text-slate-500 font-sans mt-2">
                                Note that normalized vector <MathEquation formula="\hat{\mathbf{x}}" /> has an RMS of exactly 1.0.
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 8.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-emerald-400" />}>
                    8.5 — PyTorch Custom Regularizers & Norms
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a custom RMSNorm layer, standard LayerNorm, and custom inverted Dropout.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn

class CustomRMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super(CustomRMSNorm, self).__init__()
        self.eps = eps
        # Learnable scaling parameter gamma (initialized to 1s)
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Compute RMS: root of mean squared activations along feature dimension
        # x: [batch_size, sequence_len, dim]
        variance = x.pow(2).mean(-1, keepdim=True)
        # Normalize and scale
        return x * torch.rsqrt(variance + self.eps) * self.weight

class CustomInvertedDropout(nn.Module):
    def __init__(self, p: float = 0.5):
        super(CustomInvertedDropout, self).__init__()
        self.p = p # dropout probability

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if not self.training or self.p == 0.0:
            return x
            
        # Bernoulli mask: keep probability = 1 - p
        keep_prob = 1.0 - self.p
        mask = (torch.rand_like(x) < keep_prob).float()
        
        # Scaling activations during training: x * mask / keep_prob
        return x * mask / keep_prob

if __name__ == "__main__":
    # Test RMSNorm
    norm = CustomRMSNorm(dim=3)
    x_test = torch.tensor([[3.0, 0.0, 4.0]])
    print("Custom RMSNorm Output:", norm(x_test))
    
    # Test Inverted Dropout
    dropout = CustomInvertedDropout(p=0.5)
    dropout.train()
    feats = torch.ones(1, 6)
    print("Inverted Dropout active outputs:", dropout(feats))`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
