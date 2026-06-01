import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Target, 
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
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: Loss curves & Gradient explorer
   ═══════════════════════════════════════════════════════════════════════ */

type LossType = 'mse' | 'bce' | 'focal';

const LossLandscapeExplorer: React.FC = () => {
    const [lossType, setLossType] = useState<LossType>('bce');
    const [prediction, setPrediction] = useState<number>(0.5); // ranges 0.01 - 0.99 for BCE/Focal, or -2 to 2 scaled for MSE
    const [focalGamma, setFocalGamma] = useState<number>(2.0);
    const [focalAlpha, setFocalAlpha] = useState<number>(1.0);

    const W = 560;
    const H = 260;
    const PAD = 40;

    // Functions to compute Loss & Derivative
    const computeMSE = (pred: number) => {
        // True value y = 0
        const loss = 0.5 * pred * pred;
        const deriv = pred;
        return { loss, deriv };
    };

    const computeBCE = (pred: number) => {
        // True value y = 1
        const epsilon = 1e-15;
        const p = Math.max(epsilon, Math.min(1 - epsilon, pred));
        const loss = -Math.log(p);
        const deriv = -1 / p;
        return { loss, deriv };
    };

    const computeFocal = (pred: number, gamma: number, alpha: number) => {
        // True value y = 1
        const epsilon = 1e-15;
        const p = Math.max(epsilon, Math.min(1 - epsilon, pred));
        const loss = -alpha * Math.pow(1 - p, gamma) * Math.log(p);
        // derivative dL/dp:
        const term1 = gamma * Math.pow(1 - p, gamma - 1) * Math.log(p);
        const term2 = Math.pow(1 - p, gamma) / p;
        const deriv = -alpha * (-term1 - term2);
        return { loss, deriv };
    };

    // Coordinate mapping
    const scaleX = (xVal: number) => {
        if (lossType === 'mse') {
            // xVal ranges from -2.0 to 2.0
            return ((xVal + 2) / 4) * (W - 2 * PAD) + PAD;
        } else {
            // xVal is probability p, ranges from 0.0 to 1.0
            return xVal * (W - 2 * PAD) + PAD;
        }
    };

    const scaleY = (yVal: number) => {
        const maxVal = lossType === 'mse' ? 2.0 : 4.6; // Max display height scale
        const clampedY = Math.max(0, Math.min(maxVal, yVal));
        return H - (clampedY / maxVal) * (H - 2 * PAD) - PAD;
    };

    // Get current parameters based on active type
    const getPlotValues = () => {
        if (lossType === 'mse') {
            // Pred slider mapped -2.0 to 2.0
            const predMapped = (prediction * 4) - 2;
            const { loss, deriv } = computeMSE(predMapped);
            return { xVal: predMapped, loss, deriv };
        } else if (lossType === 'bce') {
            const { loss, deriv } = computeBCE(prediction);
            return { xVal: prediction, loss, deriv };
        } else {
            const { loss, deriv } = computeFocal(prediction, focalGamma, focalAlpha);
            return { xVal: prediction, loss, deriv };
        }
    };

    const current = getPlotValues();

    // Build the SVG path for the curve
    const buildPath = () => {
        const pts: string[] = [];
        if (lossType === 'mse') {
            for (let x = -2.0; x <= 2.0; x += 0.04) {
                const { loss } = computeMSE(x);
                pts.push(`${pts.length === 0 ? 'M' : 'L'}${scaleX(x)},${scaleY(loss)}`);
            }
        } else if (lossType === 'bce') {
            for (let p = 0.01; p <= 0.99; p += 0.01) {
                const { loss } = computeBCE(p);
                pts.push(`${pts.length === 0 ? 'M' : 'L'}${scaleX(p)},${scaleY(loss)}`);
            }
        } else {
            for (let p = 0.01; p <= 0.99; p += 0.01) {
                const { loss } = computeFocal(p, focalGamma, focalAlpha);
                pts.push(`${pts.length === 0 ? 'M' : 'L'}${scaleX(p)},${scaleY(loss)}`);
            }
        }
        return pts.join(' ');
    };

    const strokeColor = {
        mse: '#3b82f6',
        bce: '#f43f5e',
        focal: '#fb7185'
    }[lossType];

    return (
        <Card className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sliders size={18} className="text-rose-400" />
                        Loss Function Landscape Explorer
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Toggle different loss formulations. Adjust predictions to witness how loss penalty and gradient slope change.
                    </p>
                </div>
                <div className="flex gap-2">
                    {(['bce', 'mse', 'focal'] as LossType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => {
                                setLossType(t);
                                setPrediction(0.5);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${lossType === t ? 'border shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white border-transparent'}`}
                            style={lossType === t ? { borderColor: strokeColor, backgroundColor: strokeColor + '22', color: strokeColor } : {}}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Focal loss specific hyperparameter adjustments */}
            {lossType === 'focal' && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 flex justify-between">
                            <span>Focus Parameter (γ)</span>
                            <span className="font-mono text-rose-400 font-bold">{focalGamma.toFixed(1)}</span>
                        </label>
                        <input type="range" min="0" max="5" step="0.5" value={focalGamma} onChange={e => setFocalGamma(parseFloat(e.target.value))} className="w-full accent-rose-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 flex justify-between">
                            <span>Class Weight (α)</span>
                            <span className="font-mono text-rose-400 font-bold">{focalAlpha.toFixed(2)}</span>
                        </label>
                        <input type="range" min="0.1" max="1" step="0.05" value={focalAlpha} onChange={e => setFocalAlpha(parseFloat(e.target.value))} className="w-full accent-rose-500" />
                    </div>
                </div>
            )}

            {/* SVG Plot */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
                <div className="px-4 pt-3 flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>True target y = {lossType === 'mse' ? '0.0' : '1.0 (Positive)'}</span>
                    <span>Max y-scale: {lossType === 'mse' ? '2.0' : '4.6'}</span>
                </div>

                <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                        const xVal = lossType === 'mse' ? (pct * 4) - 2 : pct;
                        const yVal = lossType === 'mse' ? pct * 2.0 : pct * 4.6;
                        return (
                            <React.Fragment key={pct}>
                                <line x1={scaleX(xVal)} y1={PAD} x2={scaleX(xVal)} y2={H - PAD} stroke="#1e293b" strokeWidth="1" />
                                <line x1={PAD} y1={scaleY(yVal)} x2={W - PAD} y2={scaleY(yVal)} stroke="#1e293b" strokeWidth="1" />
                            </React.Fragment>
                        );
                    })}

                    {/* Axes */}
                    <line x1={PAD} y1={scaleY(0)} x2={W - PAD} y2={scaleY(0)} stroke="#334155" strokeWidth="1.5" />
                    {lossType === 'mse' ? (
                        <line x1={scaleX(0)} y1={PAD} x2={scaleX(0)} y2={H - PAD} stroke="#334155" strokeWidth="1.5" />
                    ) : (
                        <line x1={scaleX(0)} y1={PAD} x2={scaleX(0)} y2={H - PAD} stroke="#334155" strokeWidth="1.5" />
                    )}

                    {/* Axis Labels */}
                    {lossType === 'mse' ? (
                        [-2, -1, 0, 1, 2].map(x => (
                            <text key={x} x={scaleX(x)} y={scaleY(0) + 14} textAnchor="middle" fill="#475569" fontSize="9">{x}</text>
                        ))
                    ) : (
                        [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(x => (
                            <text key={x} x={scaleX(x)} y={scaleY(0) + 14} textAnchor="middle" fill="#475569" fontSize="9">{x.toFixed(1)}</text>
                        ))
                    )}

                    {/* Curve */}
                    <path d={buildPath()} fill="none" stroke={strokeColor} strokeWidth="3.5" />

                    {/* Marker Dot */}
                    <circle cx={scaleX(current.xVal)} cy={scaleY(current.loss)} r="6" fill={strokeColor} className="animate-pulse" />
                    {/* Glowing highlight */}
                    <circle cx={scaleX(current.xVal)} cy={scaleY(current.loss)} r="12" fill={strokeColor} opacity="0.15" />

                    {/* Labels */}
                    <text x={scaleX(current.xVal) + 8} y={scaleY(current.loss) - 6} fill="#ffffff" fontSize="10" fontWeight="bold">
                        Loss = {current.loss.toFixed(4)}
                    </text>
                    <text x={scaleX(current.xVal) + 8} y={scaleY(current.loss) + 12} fill={strokeColor} fontSize="9" opacity="0.9" fontWeight="bold">
                        Slope (dLoss/dPred) = {current.deriv.toFixed(3)}
                    </text>
                </svg>
            </div>

            {/* Slider */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">
                        {lossType === 'mse' ? 'Model Prediction (ŷ)' : 'Predicted Probability (p)'}
                    </span>
                    <span className="text-sm font-mono font-bold" style={{ color: strokeColor }}>
                        {lossType === 'mse' ? current.xVal.toFixed(2) : current.xVal.toFixed(2)}
                    </span>
                </div>
                <input
                    type="range"
                    min="0.01"
                    max="0.99"
                    step="0.01"
                    value={prediction}
                    onChange={e => setPrediction(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: strokeColor }}
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                    {lossType === 'mse' ? (
                        <><span>-2.0</span><span>0.0</span><span>2.0</span></>
                    ) : (
                        <><span>0.01 (Extremely Confident Wrong Class)</span><span>0.50</span><span>0.99 (Confident Correct Class)</span></>
                    )}
                </div>
            </div>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE: InfoNCE visualizer
   ═══════════════════════════════════════════════════════════════════════ */

const InfoNCEExplorer: React.FC = () => {
    const [simPos, setSimPos] = useState<number>(0.7); // similarity to positive key
    const [simNeg, setSimNeg] = useState<number>(0.2); // similarity to negative key
    const [temp, setTemp] = useState<number>(0.1); // temperature parameter

    // Calculate exponents
    const expPos = Math.exp(simPos / temp);
    const expNeg = Math.exp(simNeg / temp);
    const sum = expPos + expNeg;
    const pPos = expPos / sum;
    const loss = -Math.log(pPos);

    return (
        <Card className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-rose-400" />
                    Contrastive InfoNCE Similarity Explorer
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    Simulate a self-supervised representation match. Tune query similarities to the positive match and negative distractor, and observe how scaling temperature affects contrastive probabilities.
                </p>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Query-Positive Similarity (s₊)</span>
                        <span className="font-mono text-emerald-400 font-bold">{simPos.toFixed(2)}</span>
                    </label>
                    <input type="range" min="-1" max="1" step="0.05" value={simPos} onChange={e => setSimPos(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Query-Negative Similarity (s₋)</span>
                        <span className="font-mono text-red-400 font-bold">{simNeg.toFixed(2)}</span>
                    </label>
                    <input type="range" min="-1" max="1" step="0.05" value={simNeg} onChange={e => setSimNeg(parseFloat(e.target.value))} className="w-full accent-red-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex justify-between">
                        <span>Softmax Temperature (τ)</span>
                        <span className="font-mono text-cyan-400 font-bold">{temp.toFixed(2)}</span>
                    </label>
                    <input type="range" min="0.01" max="0.5" step="0.01" value={temp} onChange={e => setTemp(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
                </div>
            </div>

            {/* Visual Balance Bar */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Contrastive Softmax Distribution</span>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Positive Pair Probability:</span>
                        <span className="text-emerald-400 font-bold">{(pPos * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                        <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${pPos * 100}%` }} />
                        <div className="h-full bg-red-500 transition-all duration-150" style={{ width: `${(1 - pPos) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-500">
                        <span>exp(s₊ / τ) = {expPos.toExponential(2)}</span>
                        <span>exp(s₋ / τ) = {expNeg.toExponential(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-900 pt-3 flex-wrap gap-2">
                    <span className="text-sm font-semibold text-slate-300">Resulting InfoNCE Loss:</span>
                    <span className="text-2xl font-mono font-bold text-rose-400">{loss.toFixed(4)}</span>
                </div>
            </div>

            <Callout variant="insight" title="The Role of Temperature">
                Notice that lowering temperature <MathEquation formula="\tau" /> exponentiates the differences between similarities. If temperature is very low, even minor similarity differences map to highly polarized classification probabilities, providing sharp gradients for negative pair repulsion.
            </Callout>
        </Card>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const LossFunctions: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-rose-400 mb-4">
                    <Target size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 4</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-rose-500 mb-4">
                    Loss Functions
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Formulate the objective of training. Explore regression, classification, and contrastive 
                    representation objectives, derive their analytical gradients, and study stable InfoNCE setups.
                </p>
            </motion.div>

            {/* ─── 4.1 RISK & DIFFERENTIABILITY ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-rose-400" />}>
                    4.1 — Objective Functions & Empirical Risk
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="Measuring Model Incorrectness">
                        Imagine training a neural network as playing a game of darts. 
                        For a regression task like **Mean Squared Error (MSE)**, you are penalized by the squared distance of the dart from the bullseye. The farther you land, the penalty grows quadratically. 
                        For a classification task like **Cross-Entropy (CE)**, you are graded on confidence. If you confidently claim the target is a circle, but it is actually a square, your penalty shoots up exponentially towards infinity. 
                        For self-supervised tasks like **InfoNCE**, you act like a magnet separator: you want to align similar queries and keys together (attraction) while pushing dissimilar distractor keys far away (repulsion).
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        A loss function maps a network's predicted output vector <MathEquation formula="\hat{\mathbf{y}}" /> and ground truth <MathEquation formula="\mathbf{y}" /> to a scalar value <MathEquation formula="\mathcal{L} \in \mathbb{R}" />. Optimization algorithms minimize the Empirical Risk, which represents the average loss evaluated across all training data points:
                    </p>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                        <MathEquation formula="R_{\mathrm{emp}}(\theta) = \frac{1}{N} \sum_{i=1}^{N} \mathcal{L}\left( f_{\theta}(\mathbf{x}_i), \mathbf{y}_i \right)" block />
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        To enable optimization via gradient descent, the loss function must be continuous and differentiable with respect to the network weights <MathEquation formula="\theta" />. Discontinuous metrics (such as raw classification error rate) are unusable because their gradients are zero everywhere, leaving no optimization signals.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 4.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-rose-400" />}>
                    4.2 — Mathematical Formulations & Derivatives
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us derive the exact equations and gradients for classical and modern loss functions.
                    </p>

                    <div className="space-y-8">
                        {/* MSE & MAE */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. Mean Squared Error (MSE) vs. Mean Absolute Error (MAE)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                MSE penalizes errors quadratically, making it sensitive to outliers. MAE penalizes errors linearly, yielding robust predictions at the expense of a discontinuous derivative at zero.
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                                <div>
                                    <MathEquation formula="\mathcal{L}_{\mathrm{MSE}} = \frac{1}{2}(y - \hat{y})^2 \implies \frac{\partial \mathcal{L}_{\mathrm{MSE}}}{\partial \hat{y}} = \hat{y} - y" block />
                                </div>
                                <div className="border-t border-slate-900 pt-3">
                                    <MathEquation formula="\mathcal{L}_{\mathrm{MAE}} = |y - \hat{y}| \implies \frac{\partial \mathcal{L}_{\mathrm{MAE}}}{\partial \hat{y}} = \operatorname{sign}(\hat{y} - y)" block />
                                </div>
                            </div>
                        </div>

                        {/* Cross-Entropy */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Categorical Cross-Entropy (CE) Logit Gradient</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Cross-entropy measures the divergence between target probability <MathEquation formula="\mathbf{y}" /> and softmax prediction <MathEquation formula="\mathbf{p}" />. Let us prove how pairing CE with Softmax yields a simple, stable gradient with respect to raw logits <MathEquation formula="\mathbf{z}" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div>Let <MathEquation formula="\mathcal{L} = -\sum_{k} y_k \log(p_k)" /> where <MathEquation formula="p_k = \frac{e^{z_k}}{\sum_j e^{z_j}}" />.</div>
                                <div>By the chain rule, the gradient with respect to logit <MathEquation formula="z_i" /> is:</div>
                                <MathEquation formula="\frac{\partial \mathcal{L}}{\partial z_i} = \sum_{k} \frac{\partial \mathcal{L}}{\partial p_k} \frac{\partial p_k}{\partial z_i}" block />
                                <div>Note that <MathEquation formula="\frac{\partial \mathcal{L}}{\partial p_k} = -\frac{y_k}{p_k}" />. The derivative of Softmax outputs is:</div>
                                <MathEquation formula="\frac{\partial p_k}{\partial z_i} = p_k(\delta_{ki} - p_i) \quad \text{where } \delta_{ki} = 1 \text{ if } k=i \text{ else } 0" block />
                                <div>Substituting:</div>
                                <MathEquation formula="\frac{\partial \mathcal{L}}{\partial z_i} = -\sum_{k} \frac{y_k}{p_k} p_k(\delta_{ki} - p_i) = -\sum_{k} y_k (\delta_{ki} - p_i)" block />
                                <MathEquation formula="= -y_i + p_i \sum_{k} y_k" block />
                                <div>Since <MathEquation formula="\sum_k y_k = 1" /> (ground truth probability vector):</div>
                                <div className="text-center text-rose-400 font-bold">
                                    <MathEquation formula="\frac{\partial \mathcal{L}}{\partial z_i} = p_i - y_i" block />
                                </div>
                                <p className="text-slate-500 font-sans mt-2">
                                    This elegant simplification is key to numerical updates: the gradient is simply the difference between the predicted distribution and the target.
                                </p>
                            </div>
                        </div>

                        {/* Focal Loss */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Focal Loss (Imbalance Regulation)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Extends cross-entropy by introducing a modulating scaling factor <MathEquation formula="(1 - p_t)^\gamma" /> that suppresses gradients from easy-to-classify examples, letting backprop focus on rare or difficult samples.
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathcal{L}_{\mathrm{Focal}} = -\alpha_t (1 - p_t)^\gamma \log(p_t)" block />
                                <p className="text-slate-500 text-left text-[11px] font-sans mt-2">
                                    Where <MathEquation formula="p_t = p" /> if target is 1 else <MathEquation formula="1-p" />, and <MathEquation formula="\gamma" /> regulates focusing strength. When <MathEquation formula="\gamma=0" />, it collapses back to standard Binary Cross-Entropy.
                                </p>
                            </div>
                        </div>

                        {/* InfoNCE */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. Contrastive InfoNCE Loss</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                InfoNCE treats similarity alignment as a multi-class classification problem. Given a query vector <MathEquation formula="\mathbf{q}" />, positive key <MathEquation formula="\mathbf{k}_+" />, and negative keys <MathEquation formula="\{\mathbf{k}_i^-\}" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathcal{L}_{\mathrm{InfoNCE}} = -\log \frac{\exp(\mathbf{q} \cdot \mathbf{k}_+ / \tau)}{\exp(\mathbf{q} \cdot \mathbf{k}_+ / \tau) + \sum_{i} \exp(\mathbf{q} \cdot \mathbf{k}_i^- / \tau)}" block />
                                <p className="text-slate-500 text-left text-[11px] font-sans mt-2">
                                    Where <MathEquation formula="\tau" /> is the temperature scaling hyperparameter that acts as an entropy regulator.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── LOSS CURVES LANDSCAPE EXPLORER ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-rose-400" />}>
                    4.3 — Interactive Loss & Gradient Explorer
                </SectionTitle>
                <LossLandscapeExplorer />
            </motion.section>

            {/* ─── INFONCE SIMILARITY EXPLORER ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Sliders size={20} className="text-rose-400" />}>
                    4.4 — Interactive InfoNCE Simulator
                </SectionTitle>
                <InfoNCEExplorer />
            </motion.section>

            {/* ─── 4.3 WORKED NUMERICAL EXAMPLES ──────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Award size={20} className="text-rose-400" />}>
                    4.5 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: Binary Cross-Entropy Comparison</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us evaluate Binary Cross-Entropy for target label <MathEquation formula="y = 1" /> given correct high-confidence versus incorrect high-confidence predictions:
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4">
                            <div>
                                <span className="text-rose-400 font-bold block">Case 1: Confident Correct Prediction (p = 0.8)</span>
                                <MathEquation formula="\mathcal{L} = -[1 \log(0.8) + (1-1)\log(1-0.8)] = -\log(0.8) \approx -(-0.2231) = 0.2231" block />
                                <div>Gradient with respect to prediction <MathEquation formula="p" />:</div>
                                <MathEquation formula="\frac{\partial \mathcal{L}}{\partial p} = -\frac{y}{p} + \frac{1-y}{1-p} = -\frac{1}{0.8} + 0 = -1.25" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-rose-400 font-bold block">Case 2: Confident Incorrect Prediction (p = 0.1)</span>
                                <MathEquation formula="\mathcal{L} = -[1 \log(0.1) + (1-1)\log(1-0.1)] = -\log(0.1) \approx -(-2.3025) = 2.3025" block />
                                <div>Gradient with respect to prediction <MathEquation formula="p" />:</div>
                                <MathEquation formula="\frac{\partial \mathcal{L}}{\partial p} = -\frac{1}{0.1} + 0 = -10.0" block />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white">Example B: InfoNCE Contrastive Hand-Trace</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate InfoNCE loss for a query <MathEquation formula="\mathbf{q}" />, positive key <MathEquation formula="\mathbf{k}_+" /> (cosine similarity 0.70) and one negative key <MathEquation formula="\mathbf{k}_-" /> (cosine similarity 0.20) at temperature <MathEquation formula="\tau = 0.1" />.
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3 leading-relaxed">
                            <div>
                                <span className="text-rose-400 font-bold block mb-1">1. Temperature Scaling Logits:</span>
                                <div>Positive similarity scaled logit: <MathEquation formula="s_+ / \tau = 0.7 / 0.1 = 7.0" /></div>
                                <div>Negative similarity scaled logit: <MathEquation formula="s_- / \tau = 0.2 / 0.1 = 2.0" /></div>
                            </div>
                            <div>
                                <span className="text-rose-400 font-bold block mb-1">2. Exponentiation:</span>
                                <div><MathEquation formula="e^{7.0} \approx 1096.63" /></div>
                                <div><MathEquation formula="e^{2.0} \approx 7.39" /></div>
                            </div>
                            <div>
                                <span className="text-rose-400 font-bold block mb-1">3. Softmax Distribution:</span>
                                <MathEquation formula="P_+ = \frac{1096.63}{1096.63 + 7.39} = \frac{1096.63}{1104.02} \approx 0.9933" block />
                            </div>
                            <div>
                                <span className="text-rose-400 font-bold block mb-1">4. Log-Loss:</span>
                                <MathEquation formula="\mathcal{L} = -\log(P_+) = -\log(0.9933) \approx 0.0067" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 4.4 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Terminal size={20} className="text-rose-400" />}>
                    4.6 — PyTorch Loss Implementations
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here are customized PyTorch loss modules implementing Focal Loss and InfoNCE contrastive alignment.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import torch.nn.functional as F

class FocalLoss(nn.Module):
    def __init__(self, alpha: float = 1.0, gamma: float = 2.0, reduction: str = 'mean'):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        # standard binary cross entropy loss
        bce_loss = F.binary_cross_entropy_with_logits(inputs, targets, reduction='none')
        
        # calculate probability corresponding to targets
        probs = torch.sigmoid(inputs)
        p_t = probs * targets + (1 - probs) * (1 - targets)
        
        # focal modulation scaling term
        focal_modulation = torch.pow(1 - p_t, self.gamma)
        loss = self.alpha * focal_modulation * bce_loss
        
        if self.reduction == 'mean':
            return loss.mean()
        elif self.reduction == 'sum':
            return loss.sum()
        return loss

class InfoNCELoss(nn.Module):
    def __init__(self, temperature: float = 0.07):
        super(InfoNCELoss, self).__init__()
        self.temperature = temperature

    def forward(self, query: torch.Tensor, keys: torch.Tensor) -> torch.Tensor:
        """
        query: Tensor of shape [batch_size, feature_dim]
        keys: Tensor of shape [batch_size, feature_dim] (positives correspond to identical indices)
        """
        # Normalize representations to project onto unit hypersphere
        q = F.normalize(query, dim=-1)
        k = F.normalize(keys, dim=-1)
        
        # Compute Cosine similarity matrix [batch_size x batch_size]
        similarity_matrix = torch.matmul(q, k.T) / self.temperature
        
        # Ground truth targets: diagonal elements (positive matches)
        labels = torch.arange(similarity_matrix.size(0), device=query.device)
        
        # Cross Entropy over similarities
        return F.cross_entropy(similarity_matrix, labels)

if __name__ == "__main__":
    # Test Focal Loss
    focal = FocalLoss(alpha=1.0, gamma=2.0)
    pred_logits = torch.tensor([0.5, -1.0, 3.0], requires_grad=True)
    targets = torch.tensor([1.0, 0.0, 1.0])
    loss = focal(pred_logits, targets)
    print("Focal Loss Value:", loss.item())
    
    # Test InfoNCE Loss
    contrastive = InfoNCELoss(temperature=0.1)
    q_vec = torch.randn(4, 8)
    k_vec = q_vec + torch.randn(4, 8) * 0.1 # positive key slightly perturbed
    c_loss = contrastive(q_vec, k_vec)
    print("InfoNCE Loss Value:", c_loss.item())`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
