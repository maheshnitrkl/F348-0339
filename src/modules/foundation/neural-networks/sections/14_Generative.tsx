import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Wand2, 
    Layers, 
    Activity, 
    Sparkles, 
    AlertTriangle, 
    Terminal, 
    BookOpen, 
    Award, 
    HelpCircle, 
    CheckCircle,
    Eye,
    Zap,
    Repeat
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 1: VAE Reparameterization Animator
   ═══════════════════════════════════════════════════════════════════════ */

const ReparameterizationTrick: React.FC = () => {
    const [mu, setMu] = useState<number>(0);
    const [sigma, setSigma] = useState<number>(0.8);
    const [useTrick, setUseTrick] = useState<boolean>(true);
    const [noisePoints, setNoisePoints] = useState<number[]>([]);

    useEffect(() => {
        // Pre-generate standard normal noise points
        const points = Array.from({ length: 25 }, () => {
            const u1 = Math.random();
            const u2 = Math.random();
            // Box-Muller transform
            return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        });
        setNoisePoints(points);
    }, []);

    const W = 220;
    const H = 140;

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">VAE Reparameterization Playground</span>
                <button
                    onClick={() => setUseTrick(!useTrick)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        useTrick 
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                >
                    {useTrick ? 'Reparameterization: ON' : 'Reparameterization: OFF'}
                </button>
            </div>

            {/* Sliders */}
            <div className="space-y-2 text-xs font-sans">
                <div className="space-y-1">
                    <label className="text-slate-400 flex justify-between">
                        <span>Latent Mean (μ)</span>
                        <span className="font-mono text-pink-400 font-bold">μ = {mu.toFixed(1)}</span>
                    </label>
                    <input type="range" min="-1.5" max="1.5" step="0.1" value={mu} onChange={e => setMu(parseFloat(e.target.value))} className="w-full accent-pink-500 h-1 bg-slate-850 rounded" />
                </div>
                <div className="space-y-1">
                    <label className="text-slate-400 flex justify-between">
                        <span>Standard Deviation (σ)</span>
                        <span className="font-mono text-pink-400 font-bold">σ = {sigma.toFixed(1)}</span>
                    </label>
                    <input type="range" min="0.2" max="1.5" step="0.1" value={sigma} onChange={e => setSigma(parseFloat(e.target.value))} className="w-full accent-pink-500 h-1 bg-slate-850 rounded" />
                </div>
            </div>

            {/* Visual plotting canvas */}
            <div className="flex justify-center bg-slate-905 p-2 rounded-lg border border-slate-900">
                <svg width={W} height={H} className="block">
                    {/* Standard Normal curve background */}
                    <path 
                        d={Array.from({ length: 50 }).map((_, i) => {
                            const x = (i / 49) * W;
                            const z = (x - W / 2) / 30;
                            const y = H - 15 - Math.exp(-0.5 * z * z) * 80;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.5"
                    />

                    {/* Sample points based on trick */}
                    {noisePoints.map((eps, idx) => {
                        // z = mu + sigma * eps
                        const z = mu + sigma * eps;
                        const x = W / 2 + z * 30;
                        const y = H - 18 - Math.random() * 25; // jitter for overlap
                        return (
                            <circle 
                                key={`pt-${idx}`} 
                                cx={x} 
                                cy={y} 
                                r="2.5" 
                                fill={useTrick ? "#f472b6" : "#ef4444"}
                                style={{ transition: 'all 0.3s ease-out' }}
                            />
                        );
                    })}

                    {/* Baseline */}
                    <line x1={0} y1={H - 15} x2={W} y2={H - 15} stroke="#334155" strokeWidth="1" />
                </svg>
            </div>

            {/* Differentiable explanation check */}
            <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400">
                {useTrick ? (
                    <div className="text-emerald-450 font-bold flex items-center gap-1.5">
                        <CheckCircle size={10} className="text-emerald-450" />
                        <span>Differentiable. Graph: z = μ + σ ⊙ ε. ε is an external constant. Gradients flow back cleanly.</span>
                    </div>
                ) : (
                    <div className="text-red-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle size={10} className="text-red-400" />
                        <span>Non-Differentiable! Stochastic node z ~ N(μ, σ^2) blocks direct backpropagation gradients.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: GAN Minimax Training Game
   ═══════════════════════════════════════════════════════════════════════ */

const GANMinimax: React.FC = () => {
    const [epochs, setEpochs] = useState<number>(0);

    // Calculate real and fake probability distributions
    // Real centered at x = 0.5
    // Fake starts centered at x = -0.8 and moves to 0.5 as epoch increases
    const getDistributionParameters = () => {
        const t = epochs / 10;
        const fakeMu = -0.8 * (1 - t) + 0.5 * t;
        
        // Discriminator classification scores:
        // D(x) close to 1 for real (0.5), 0 for fake (fakeMu)
        // At epoch 10: D(x) approaches 0.5 everywhere (confusion)
        const dReal = 0.95 - 0.45 * t;
        const dFake = 0.05 + 0.45 * t;

        const dLoss = -0.5 * (Math.log(dReal) + Math.log(1 - dFake));
        const gLoss = -Math.log(dFake);

        return { fakeMu, dReal, dFake, dLoss, gLoss };
    };

    const stats = getDistributionParameters();

    const W = 220;
    const H = 100;

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">GAN Minimax Training Game</span>

            {/* Epoch slider */}
            <div className="space-y-1 text-xs font-sans">
                <label className="text-slate-400 flex justify-between">
                    <span>Adversarial Epochs</span>
                    <span className="font-mono text-pink-400 font-bold">Epoch = {epochs}</span>
                </label>
                <input type="range" min="0" max="10" value={epochs} onChange={e => setEpochs(parseInt(e.target.value))} className="w-full accent-pink-500 h-1 bg-slate-850 rounded" />
            </div>

            {/* SVG Visualizing distributions */}
            <div className="flex justify-center bg-slate-905 p-2 rounded-lg border border-slate-900">
                <svg width={W} height={H} className="block">
                    {/* Real Data Distribution (green curve) */}
                    <path 
                        d={Array.from({ length: 40 }).map((_, i) => {
                            const x = (i / 39) * W;
                            const z = (x - (W / 2 + 0.5 * 50)) / 18;
                            const y = H - 5 - Math.exp(-0.5 * z * z) * 45;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        opacity="0.8"
                    />

                    {/* Generated Data Distribution (pink curve) */}
                    <path 
                        d={Array.from({ length: 40 }).map((_, i) => {
                            const x = (i / 39) * W;
                            const z = (x - (W / 2 + stats.fakeMu * 50)) / 18;
                            const y = H - 5 - Math.exp(-0.5 * z * z) * 45;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#f472b6"
                        strokeWidth="1.8"
                        style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Discriminator Decision Boundary (dotted line) */}
                    {/* Starts sloping down from left to right, flattens to 0.5 (center) at epoch 10 */}
                    <line 
                        x1={10} 
                        y1={H - 5 - (1 - stats.dFake) * 60} 
                        x2={W - 10} 
                        y2={H - 5 - stats.dReal * 60} 
                        stroke="#475569" 
                        strokeWidth="1.2" 
                        strokeDasharray="2,2" 
                        style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Ground line */}
                    <line x1={0} y1={H - 5} x2={W} y2={H - 5} stroke="#334155" strokeWidth="1" />
                </svg>
            </div>

            {/* Loss readout */}
            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] flex justify-between items-center text-slate-400">
                <span>D Loss: <strong className="text-white">{stats.dLoss.toFixed(3)}</strong></span>
                <span>G Loss: <strong className="text-white">{stats.gLoss.toFixed(3)}</strong></span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: Diffusion Denoising Player
   ═══════════════════════════════════════════════════════════════════════ */

// Predefined target smiley face pattern on a 8x8 grid
const SMILEY_GRID = [
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,1,1,0,0,1],
    [0,1,0,0,0,0,1,0],
    [0,0,1,1,1,1,0,0]
];

const DiffusionDenoising: React.FC = () => {
    const [step, setStep] = useState<number>(10); // 10 is pure noise, 0 is clean

    // Compute pixel color: mix target shape with random noise based on step
    const getPixelOpacity = (r: number, c: number) => {
        const isTarget = SMILEY_GRID[r][c] === 1;
        const targetVal = isTarget ? 0.95 : 0.05;
        
        // Generate pseudo-random noise based on coordinates
        const seed = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
        const noiseVal = (seed - Math.floor(seed));

        const t = step / 10; // noised percentage
        const finalVal = targetVal * (1 - t) + noiseVal * t;
        return finalVal;
    };

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">DDPM Step Denoising Simulator</span>

            {/* Step slider */}
            <div className="space-y-1 text-xs font-sans">
                <label className="text-slate-400 flex justify-between">
                    <span>Reverse Denoising Step (t)</span>
                    <span className="font-mono text-pink-400 font-bold">t = {step * 100}</span>
                </label>
                <input type="range" min="0" max="10" value={step} onChange={e => setStep(parseInt(e.target.value))} className="w-full accent-pink-500 h-1 bg-slate-850 rounded" />
            </div>

            {/* Grid */}
            <div className="flex justify-center bg-slate-905 p-2 rounded-lg border border-slate-900">
                <div className="grid grid-cols-8 gap-0.5 bg-slate-950 p-1.5 rounded border border-slate-900">
                    {Array.from({ length: 8 }).map((_, r) => 
                        Array.from({ length: 8 }).map((_, c) => {
                            const opacity = getPixelOpacity(r, c);
                            return (
                                <div 
                                    key={`p-${r}-${c}`}
                                    className="w-4 h-4 rounded-[1px] transition-all duration-200"
                                    style={{
                                        backgroundColor: `rgba(244, 114, 182, ${opacity})`
                                    }}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] flex justify-between items-center text-slate-400">
                <span>Predicted Noise L2 Error:</span>
                <span className="text-pink-400 font-bold">{(step * 0.08 + 0.005).toFixed(4)}</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const Generative: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-pink-400 mb-4">
                    <Wand2 size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 14</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-205 to-pink-500 mb-4">
                    Generative Models
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Map random noise manifolds to complex data distributions. Derive Variational Autoencoder boundaries, 
                    minimax game convergence properties, noising diffusions, and continuous vector fields.
                </p>
            </motion.div>

            {/* ─── 14.1 GENERATIVE PATHWAYS ─────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-pink-400" />}>
                    14.1 — Stochastic Projections: Suitcases, Detectives, and Shredders
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Creative Generation Analogy">
                        **VAEs** act like packing a suitcase tightly. You compress messy clothes (data pixels) into normal rectangular limits (latent distribution parameters) and unpack them, ensuring that unpacking any suitcase layout close to normal forms valid outfits.
                        **GANs** act like a cat-and-mouse game between an art counterfeiter (Generator) and a detective (Discriminator), updating rules until the detective can no longer spot differences.
                        **Diffusion** acts like reassembling shredded paper shreds (noise) step-by-step to reveal the original complete page.
                        **Flow Matching** draws a straight path directly from the shreds to the target page, bypassing curved step loops.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        Generative learning shifts focus from discriminative classification (<MathEquation formula="p(y|\mathbf{x})" />) to modeling joint data distributions (<MathEquation formula="p(\mathbf{x})" />). This enables networks to generate high-fidelity, novel samples from low-dimensional latent variables.
                    </p>
                </Card>
            </motion.section>

            {/* ─── 14.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-pink-400" />}>
                    14.2 — ELBO Lower Bounds, Minimax Boundaries & Flow Vectors
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us derive the math governing Variational Autoencoders, Adversarial minimax targets, and Denoising schedules.
                    </p>

                    <div className="space-y-8">
                        {/* VAE ELBO */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. VAE Evidence Lower Bound (ELBO)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                VAEs maximize the likelihood of data by maximizing the ELBO. Let <MathEquation formula="q_\phi(\mathbf{z}|\mathbf{x})" /> be the encoder and <MathEquation formula="p_\theta(\mathbf{x}|\mathbf{z})" /> be the decoder:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathcal{L}_{\text{ELBO}}(\theta, \phi; \mathbf{x}) = \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}[\log p_\theta(\mathbf{x}|\mathbf{z})] - D_{\text{KL}}(q_\phi(\mathbf{z}|\mathbf{x}) \parallel p(\mathbf{z}))" block />
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                **Reparameterization Trick:** Stochastic sampling <MathEquation formula="\mathbf{z} \sim q_\phi(\mathbf{z}|\mathbf{x})" /> is non-differentiable. To propagate gradients from decoder to encoder, the stochastic node is isolated by scaling standard normal noise:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathbf{z} = \mathbf{\mu}(\mathbf{x}) + \mathbf{\sigma}(\mathbf{x}) \odot \mathbf{\epsilon}, \quad \text{where } \mathbf{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})" block />
                            </div>
                        </div>

                        {/* GAN Minimax */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Generative Adversarial Network (GAN) Minimax</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                GANs optimize a zero-sum game between Discriminator <MathEquation formula="D" /> and Generator <MathEquation formula="G" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\min_{G} \max_{D} V(D, G) = \mathbb{E}_{\mathbf{x} \sim p_{\text{data}}}[\log D(\mathbf{x})] + \mathbb{E}_{\mathbf{z} \sim p_{\mathbf{z}}}[\log (1 - D(G(\mathbf{z})))]" block />
                            </div>
                        </div>

                        {/* DDPM Forward/Backward */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Denoising Diffusion Probabilistic Models (DDPM)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                DDPMs forward-noises image <MathEquation formula="\mathbf{x}_0" /> over steps <MathEquation formula="t" /> using scheduler scale parameter <MathEquation formula="\beta_t" />:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="q(\mathbf{x}_t | \mathbf{x}_0) = \mathcal{N}\left(\mathbf{x}_t; \sqrt{\bar{\alpha}_t}\mathbf{x}_0, (1 - \bar{\alpha}_t)\mathbf{I}\right) \quad \left(\text{where } \alpha_t = 1 - \beta_t, \bar{\alpha}_t = \prod_{s=1}^t \alpha_s\right)" block />
                                <div className="text-center font-sans text-slate-500">The training objective optimizes predicted noise matching:</div>
                                <MathEquation formula="\mathcal{L}_{\text{simple}}(\theta) = \mathbb{E}_{t, \mathbf{x}_0, \mathbf{\epsilon}}\left[ \|\mathbf{\epsilon} - \mathbf{\epsilon}_\theta(\mathbf{x}_t, t)\|^2 \right]" block />
                            </div>
                        </div>

                        {/* CFM */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. Continuous Flow Matching (CFM)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Flow Matching (Lipman et al. 2022) replaces stochastic diffusion paths with flat velocity vector fields, enabling single-step or few-step sampling trajectories:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                                <MathEquation formula="\mathcal{L}_{\text{CFM}}(\theta) = \mathbb{E}_{t, \mathbf{x}_0, \mathbf{x}_1}\left[ \|\mathbf{v}_\theta(\mathbf{t}, \mathbf{x}_t) - (\mathbf{x}_1 - \mathbf{x}_0)\|^2 \right]" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-pink-400" />}>
                    14.3 — Generative Sandbox
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ReparameterizationTrick />
                    <GANMinimax />
                    <DiffusionDenoising />
                </div>
            </motion.section>

            {/* ─── 14.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-pink-400" />}>
                    14.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: VAE KL Divergence calculation</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate the analytical KL divergence for a 1D Gaussian latent variable <MathEquation formula="q(z) \sim \mathcal{N}(\mu, \sigma^2)" /> against a standard normal prior <MathEquation formula="p(z) \sim \mathcal{N}(0, 1)" />:
                            <MathEquation formula="\mu = 0.5, \quad \log \sigma^2 = -0.2 \implies \sigma^2 = e^{-0.2} \approx 0.81873" block />
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-2 leading-relaxed">
                            <div>
                                <span className="text-pink-400 font-bold block mb-1">Evaluate KL formula:</span>
                                <MathEquation formula="D_{\text{KL}}(q \parallel p) = -\frac{1}{2} \left[ 1 + \log(\sigma^2) - \mu^2 - \sigma^2 \right]" block />
                                <MathEquation formula="= -\frac{1}{2} \left[ 1 + (-0.2) - (0.5)^2 - 0.81873 \right]" block />
                                <MathEquation formula="= -\frac{1}{2} \left[ 0.8 - 0.25 - 0.81873 \right]" block />
                                <MathEquation formula="= -\frac{1}{2} \left[ -0.26873 \right] \approx 0.13437" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 14.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-pink-400" />}>
                    14.5 — PyTorch Custom VAEs & Flow Matching Networks
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a Variational Autoencoder with reparameterization mapping and a Continuous Flow Matching velocity net.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn

class VariationalAutoencoder(nn.Module):
    """
    Implements a Variational Autoencoder (VAE) with the reparameterization trick.
    """
    def __init__(self, in_dim: int, latent_dim: int):
        super(VariationalAutoencoder, self).__init__()
        
        # Encoder projects inputs to latent distribution parameters
        self.encoder = nn.Sequential(
            nn.Linear(in_dim, 64),
            nn.ReLU(),
            nn.Linear(64, latent_dim * 2) # Outputs mean and log_var jointly
        )
        
        # Decoder projects latent samples back to input space
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.ReLU(),
            nn.Linear(64, in_dim),
            nn.Sigmoid()
        )

    def reparameterize(self, mu: torch.Tensor, log_var: torch.Tensor) -> torch.Tensor:
        # Compute standard deviation: std = exp(0.5 * log_var)
        std = torch.exp(0.5 * log_var)
        # Sample standard normal noise: epsilon
        eps = torch.randn_like(std)
        # Reparameterized sample: z = mu + std * eps
        return mu + std * eps

    def forward(self, x: torch.Tensor) -> tuple:
        # Encode
        enc_out = self.encoder(x)
        mu, log_var = torch.chunk(enc_out, 2, dim=-1)
        
        # Sample
        z = self.reparameterize(mu, log_var)
        
        # Decode reconstruction
        x_recon = self.decoder(z)
        
        # Compute KL divergence loss term
        kl_loss = -0.5 * torch.sum(1 + log_var - mu.pow(2) - log_var.exp(), dim=-1)
        
        return x_recon, kl_loss.mean()

class FlowMatchingNet(nn.Module):
    """
    Velocity field prediction network for Continuous Flow Matching (CFM).
    """
    def __init__(self, dim: int):
        super(FlowMatchingNet, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(dim + 1, 64), # Inputs (x_t, t)
            nn.ReLU(),
            nn.Linear(64, dim)      # Outputs predicted velocity vector
        )

    def forward(self, x_t: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        # Concatenate coordinate state x_t and scalar time t
        # x_t: [Batch, Dim], t: [Batch, 1]
        inputs = torch.cat([x_t, t], dim=-1)
        return self.net(inputs)

if __name__ == "__main__":
    # Test VAE
    x_in = torch.rand(4, 32)
    vae = VariationalAutoencoder(in_dim=32, latent_dim=4)
    x_rec, kl = vae(x_in)
    print("VAE Reconstruction shape:", x_rec.shape) # Should be [4, 32]
    print("Mean Batch KL Divergence:", kl.item())
    
    # Test Flow Matching Net
    x_coords = torch.randn(4, 8)
    time = torch.ones(4, 1) * 0.5
    cfm_net = FlowMatchingNet(dim=8)
    velocity = cfm_net(x_coords, time)
    print("Predicted velocity shape:", velocity.shape) # Should be [4, 8]`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
