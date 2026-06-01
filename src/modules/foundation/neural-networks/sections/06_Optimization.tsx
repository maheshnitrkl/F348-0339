import React from 'react';
import { motion } from 'framer-motion';
import { 
    Dumbbell, 
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
import { OptimizerLandscape3D } from '../components/OptimizerLandscape3D';
import { LearningRateExplorer } from '../components/LearningRateExplorer';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const Optimization: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-orange-400 mb-4">
                    <Dumbbell size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 6</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-orange-500 mb-4">
                    Optimization Algorithms
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Navigate the loss landscape. Study classic momentum, adaptive coordinate scaling, decoupled weight 
                    decay formulations, sign-based optimization, and trace dynamic trajectories.
                </p>
            </motion.div>

            {/* ─── 6.1 THE FOGGY MOUNTAIN DESCENDER ───────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-orange-400" />}>
                    6.1 — Non-Convex Optimization Landscapes
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="Foggy Ridge Descents & Adaptive Sleds">
                        Imagine trying to find the lowest valley of a mountain range in heavy fog. 
                        Classic **SGD** is like stepping in the steepest immediate direction. It is slow, highly noisy, and gets stuck in tiny craters. 
                        **Momentum** is like riding a heavy sled down the slope. It accumulates momentum from the general downhill sweep, allowing it to glide over small craters and speed past flat spots. 
                        **Adam** is like riding an intelligent hoverboard. It keeps track of how bumpy and steep the path is in each direction. If it goes along a wide, flat ridge, it speeds up; if it enters a steep, rocky ravine, it scales down its steps to avoid flying off-course. 
                        Google's **Lion** acts like a compass that only tells you the binary direction (positive/negative) to take, keeping step updates strictly uniform in scale.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        In deep learning, the loss function forms a high-dimensional, non-convex landscape. Optimization algorithms are tasked with finding weight updates that navigate this surface to find local minima while avoiding:
                    </p>

                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400 leading-relaxed font-sans">
                        <li><strong>Saddle Points:</strong> Plateaus where the gradient is zero, but the surface slopes down in other dimensions. High-dimensional landscapes contain exponentially more saddle points than local minima.</li>
                        <li><strong>Ravines (Ill-conditioned Curvature):</strong> Narrow valleys where the loss changes rapidly in one direction but slowly in another, causing standard gradient descent to oscillate wildly.</li>
                    </ul>
                </Card>
            </motion.section>

            {/* ─── 6.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-orange-400" />}>
                    6.2 — Mathematical Formulations
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us examine the exact mathematical update equations for classic, adaptive, and modern optimizers.
                    </p>

                    <div className="space-y-8">
                        {/* SGD & Momentum */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. SGD & Classical Momentum</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                SGD updates weights directly opposite the gradient. Momentum adds a fraction <MathEquation formula="\beta" /> of the previous update vector to speed up convergence in low-gradient directions.
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Stochastic Gradient Descent</span>
                                    <MathEquation formula="\theta_{t+1} = \theta_t - \eta \mathbf{g}_t" block />
                                </div>
                                <div className="border-t border-slate-900 pt-3">
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">SGD with Momentum</span>
                                    <MathEquation formula="\mathbf{v}_t = \beta \mathbf{v}_{t-1} + \mathbf{g}_t" block />
                                    <MathEquation formula="\theta_{t+1} = \theta_t - \eta \mathbf{v}_t" block />
                                </div>
                            </div>
                        </div>

                        {/* Adam */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Adam (Adaptive Moment Estimation)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Adam tracks both the running average of gradients (first moment <MathEquation formula="\mathbf{m}_t" />) and the running average of squared gradients (second moment <MathEquation formula="\mathbf{v}_t" />).
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
                                <div>1. Update biased first and second moment estimates:</div>
                                <MathEquation formula="\mathbf{m}_t = \beta_1 \mathbf{m}_{t-1} + (1 - \beta_1)\mathbf{g}_t" block />
                                <MathEquation formula="\mathbf{v}_t = \beta_2 \mathbf{v}_{t-1} + (1 - \beta_2)\mathbf{g}_t^2" block />
                                
                                <div>2. Compute bias-corrected estimates (to compensate for initialization at zero):</div>
                                <MathEquation formula="\hat{\mathbf{m}}_t = \frac{\mathbf{m}_t}{1 - \beta_1^t}, \quad \hat{\mathbf{v}}_t = \frac{\mathbf{v}_t}{1 - \beta_2^t}" block />
                                
                                <div>3. Apply the update rule:</div>
                                <MathEquation formula="\theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{\hat{\mathbf{v}}_t} + \epsilon} \odot \hat{\mathbf{m}}_t" block />
                            </div>
                        </div>

                        {/* AdamW */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. AdamW (Decoupled Weight Decay)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                In standard Adam, adding L2 regularization changes the gradient <MathEquation formula="\mathbf{g}_t" />. This means the L2 penalty is scaled by the adaptive second moment <MathEquation formula="\mathbf{v}_t" />. Loshchilov & Hutter (2017) proved that this coupling scales down L2 decay on parameters with large gradients. **AdamW** decouples decay, subtracting it directly:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\theta_{t+1} = (1 - \lambda \eta)\theta_t - \frac{\eta}{\sqrt{\hat{\mathbf{v}}_t} + \epsilon} \odot \hat{\mathbf{m}}_t" block />
                                <p className="text-slate-500 text-left text-[11px] font-sans mt-2">
                                    Where <MathEquation formula="\lambda" /> is the weight decay rate, independent of the adaptive gradients.
                                </p>
                            </div>
                        </div>

                        {/* Lion */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. Lion (EvoLved Sign Momentum)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Developed by Google Brain (2023) using program search, **Lion** uses only the sign of the accumulated momentum to make updates, reducing memory overhead and improving scaling:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div>1. Compute update vector:</div>
                                <MathEquation formula="\mathbf{c}_t = \operatorname{sign}\left(\beta_1 \mathbf{m}_{t-1} + (1 - \beta_1)\mathbf{g}_t\right)" block />
                                <div>2. Update parameters with decoupled decay:</div>
                                <MathEquation formula="\theta_{t+1} = \theta_t - \eta \left( \mathbf{c}_t + \lambda \theta_t \right)" block />
                                <div>3. Update momentum buffer for next step:</div>
                                <MathEquation formula="\mathbf{m}_t = \beta_2 \mathbf{m}_{t-1} + (1 - \beta_2)\mathbf{g}_t" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 3D OPTIMIZATION LANDSCAPE ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-orange-400" />}>
                    6.3 — 3D Optimization Surface Race
                </SectionTitle>
                <OptimizerLandscape3D />
            </motion.section>

            {/* ─── LEARNING RATE SOLVER EXPLORER ─────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Activity size={20} className="text-orange-400" />}>
                    6.4 — Learning Rate & Convergence Trajectories
                </SectionTitle>
                <LearningRateExplorer />
            </motion.section>

            {/* ─── 6.5 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Award size={20} className="text-orange-400" />}>
                    6.5 — Worked Numerical Example (Hand-Trace)
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us trace updates for a single parameter <MathEquation formula="\theta" /> (starting at <MathEquation formula="\theta_0 = 0" />) with a learning rate <MathEquation formula="\eta = 0.1" />. 
                        Assume consecutive gradient steps are:
                        <MathEquation formula="g_1 = 2.0, \quad g_2 = -1.0" block />
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4 leading-relaxed">
                        {/* SGD */}
                        <div>
                            <span className="text-orange-400 font-bold block">1. Stochastic Gradient Descent (SGD)</span>
                            <div className="pl-2 space-y-1">
                                <div>• Step 1: <MathEquation formula="\theta_1 = \theta_0 - \eta g_1 = 0 - 0.1(2.0) = -0.2" /></div>
                                <div>• Step 2: <MathEquation formula="\theta_2 = \theta_1 - \eta g_2 = -0.2 - 0.1(-1.0) = -0.1" /></div>
                            </div>
                        </div>

                        {/* Momentum */}
                        <div className="border-t border-slate-900 pt-3">
                            <span className="text-orange-400 font-bold block">2. SGD with Momentum (β = 0.9, starting v₀ = 0)</span>
                            <div className="pl-2 space-y-1">
                                <div>• Step 1:</div>
                                <div className="pl-2"><MathEquation formula="v_1 = \beta v_0 + g_1 = 0.9(0) + 2.0 = 2.0" /></div>
                                <div className="pl-2"><MathEquation formula="\theta_1 = \theta_0 - \eta v_1 = 0 - 0.1(2.0) = -0.2" /></div>
                                <div>• Step 2:</div>
                                <div className="pl-2"><MathEquation formula="v_2 = \beta v_1 + g_2 = 0.9(2.0) - 1.0 = 1.8 - 1.0 = 0.8" /></div>
                                <div className="pl-2"><MathEquation formula="\theta_2 = \theta_1 - \eta v_2 = -0.2 - 0.1(0.8) = -0.28" /></div>
                            </div>
                        </div>

                        {/* Adam */}
                        <div className="border-t border-slate-900 pt-3">
                            <span className="text-orange-400 font-bold block">3. Adam (β₁ = 0.9, β₂ = 0.99, ε = 1e-8, starting m₀ = 0, v₀ = 0)</span>
                            <div className="pl-2 space-y-3">
                                <div>
                                    <div className="font-semibold text-slate-400">• Step 1 (t = 1):</div>
                                    <div className="pl-2">1. Moments: <MathEquation formula="m_1 = 0.9(0) + (1-0.9)(2.0) = 0.2" /></div>
                                    <div className="pl-2">2. Variance: <MathEquation formula="v_1 = 0.99(0) + (1-0.99)(2.0)^2 = 0.01(4.0) = 0.04" /></div>
                                    <div className="pl-2">3. Bias correction: <MathEquation formula="\hat{m}_1 = \frac{0.2}{1 - 0.9^1} = 2.0, \quad \hat{v}_1 = \frac{0.04}{1 - 0.99^1} = 4.0" /></div>
                                    <div className="pl-2 text-cyan-400 font-bold">4. Update: <MathEquation formula="\theta_1 = 0 - 0.1 \cdot \frac{2.0}{\sqrt{4.0} + 1e-8} = -0.1 \cdot 1.0 = -0.1" /></div>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-400">• Step 2 (t = 2):</div>
                                    <div className="pl-2">1. Moments: <MathEquation formula="m_2 = 0.9(0.2) + 0.1(-1.0) = 0.18 - 0.1 = 0.08" /></div>
                                    <div className="pl-2">2. Variance: <MathEquation formula="v_2 = 0.99(0.04) + 0.01(-1.0)^2 = 0.0396 + 0.01 = 0.0496" /></div>
                                    <div className="pl-2">3. Bias correction: <MathEquation formula="\hat{m}_2 = \frac{0.08}{1 - 0.9^2} = \frac{0.08}{0.19} \approx 0.421, \quad \hat{v}_2 = \frac{0.0496}{1 - 0.99^2} = \frac{0.0496}{0.0199} \approx 2.492" /></div>
                                    <div className="pl-2 text-cyan-400 font-bold">4. Update: <MathEquation formula="\theta_2 = -0.1 - 0.1 \cdot \frac{0.421}{\sqrt{2.492} + 1e-8} \approx -0.1 - 0.1 \cdot \frac{0.421}{1.5786} \approx -0.1267" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 6.6 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionTitle icon={<Terminal size={20} className="text-orange-400" />}>
                    6.6 — PyTorch Custom Optimizer Implementations
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a custom AdamW weight decay solver and the modern Lion optimizer subclasses.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
from torch.optim import Optimizer

class CustomAdamW(Optimizer):
    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=1e-2):
        defaults = dict(lr=lr, betas=betas, eps=eps, weight_decay=weight_decay)
        super(CustomAdamW, self).__init__(params, defaults)

    @torch.no_grad()
    def step(self, closure=None):
        loss = None
        if closure is not None:
            with torch.enable_grad():
                loss = closure()

        for group in self.param_groups:
            lr = group['lr']
            beta1, beta2 = group['betas']
            eps = group['eps']
            wd = group['weight_decay']

            for p in group['params']:
                if p.grad is None:
                    continue
                grad = p.grad

                # 1. Decoupled weight decay update
                if wd != 0:
                    p.mul_(1.0 - lr * wd)

                state = self.state[p]
                # State initialization
                if len(state) == 0:
                    state['step'] = 0
                    state['exp_avg'] = torch.zeros_like(p)
                    state['exp_avg_sq'] = torch.zeros_like(p)

                exp_avg, exp_avg_sq = state['exp_avg'], state['exp_avg_sq']
                state['step'] += 1
                step = state['step']

                # 2. Update moments
                exp_avg.mul_(beta1).add_(grad, alpha=1 - beta1)
                exp_avg_sq.mul_(beta2).addcmul_(grad, grad, value=1 - beta2)

                # 3. Bias correction terms
                bias_correction1 = 1.0 - beta1 ** step
                bias_correction2 = 1.0 - beta2 ** step

                step_size = lr / bias_correction1
                denom = (exp_avg_sq.sqrt() / math.sqrt(bias_correction2)).add_(eps)

                # 4. Apply step
                p.addcdiv_(exp_avg, denom, value=-step_size)

        return loss

class CustomLion(Optimizer):
    def __init__(self, params, lr=1e-4, betas=(0.9, 0.99), weight_decay=0.0):
        defaults = dict(lr=lr, betas=betas, weight_decay=weight_decay)
        super(CustomLion, self).__init__(params, defaults)

    @torch.no_grad()
    def step(self, closure=None):
        loss = None
        if closure is not None:
            with torch.enable_grad():
                loss = closure()

        for group in self.param_groups:
            lr = group['lr']
            beta1, beta2 = group['betas']
            wd = group['weight_decay']

            for p in group['params']:
                if p.grad is None:
                    continue
                grad = p.grad
                
                # 1. Decoupled weight decay
                if wd != 0:
                    p.mul_(1.0 - lr * wd)

                state = self.state[p]
                if len(state) == 0:
                    state['exp_avg'] = torch.zeros_like(p)

                exp_avg = state['exp_avg']

                # 2. Calculate sign update vector using intermediate beta1
                update = exp_avg.clone().mul_(beta1).add_(grad, alpha=1.0 - beta1).sign_()

                # 3. Apply parameter updates
                p.add_(update, alpha=-lr)

                # 4. Update momentum buffer using beta2 for next step
                exp_avg.mul_(beta2).add_(grad, alpha=1.0 - beta2)

        return loss`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
