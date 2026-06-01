import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Layers, 
    Activity, 
    AlertTriangle, 
    Terminal, 
    BookOpen, 
    Award, 
    HelpCircle, 
    CheckCircle,
    Eye,
    Zap,
    Cpu,
    GitFork
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: Reusable styled sub-components
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 1: MoE Gating Router
   ═══════════════════════════════════════════════════════════════════════ */

const EXPERTS = [
    { name: "Expert 1 (Coding)", color: "#10b981" },
    { name: "Expert 2 (Math/Logic)", color: "#fb923c" },
    { name: "Expert 3 (Creative)", color: "#ec4899" },
    { name: "Expert 4 (General)", color: "#845ef7" }
];

const MoERouter: React.FC = () => {
    const [coding, setCoding] = useState<number>(0.8);
    const [math, setMath] = useState<number>(0.2);
    const [creative, setCreative] = useState<number>(0.1);

    const getRoutingScores = () => {
        // Calculate raw linear projections
        const rawScores = [
            1.5 * coding - 0.2 * creative, // Exp 1
            1.4 * math - 0.1 * coding,     // Exp 2
            1.2 * creative - 0.3 * math,   // Exp 3
            0.4 * coding + 0.4 * math + 0.4 * creative // Exp 4
        ];

        // Find top 2 indices
        const indexed = rawScores.map((score, idx) => ({ score, idx }));
        indexed.sort((a, b) => b.score - a.score);
        const top2 = [indexed[0], indexed[1]];

        // Softmax over Top-2
        const exps = top2.map(item => Math.exp(item.score));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(e => e / sumExp);

        // Map back to full expert routing percentages
        const finalRouting = [0, 0, 0, 0];
        finalRouting[top2[0].idx] = probs[0];
        finalRouting[top2[1].idx] = probs[1];

        return finalRouting;
    };

    const routing = getRoutingScores();

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Sparse MoE Gating Router (Top-2)</span>

            {/* Intensity sliders */}
            <div className="space-y-2 text-xs font-sans">
                <div className="space-y-1">
                    <label className="text-slate-400 flex justify-between">
                        <span>Coding Intent</span>
                        <span className="font-mono text-sky-400 font-bold">{coding.toFixed(1)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.1" value={coding} onChange={e => setCoding(parseFloat(e.target.value))} className="w-full accent-sky-500 h-1 bg-slate-850 rounded" />
                </div>
                <div className="space-y-1">
                    <label className="text-slate-400 flex justify-between">
                        <span>Math & Logic Intent</span>
                        <span className="font-mono text-sky-400 font-bold">{math.toFixed(1)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.1" value={math} onChange={e => setMath(parseFloat(e.target.value))} className="w-full accent-sky-500 h-1 bg-slate-850 rounded" />
                </div>
                <div className="space-y-1">
                    <label className="text-slate-400 flex justify-between">
                        <span>Creative Writing Intent</span>
                        <span className="font-mono text-sky-400 font-bold">{creative.toFixed(1)}</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.1" value={creative} onChange={e => setCreative(parseFloat(e.target.value))} className="w-full accent-sky-500 h-1 bg-slate-850 rounded" />
                </div>
            </div>

            {/* Dynamic Routing Diagram */}
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 space-y-3 relative font-mono text-[10px]">
                <span className="text-slate-500 block mb-1">Gating Load Allocations:</span>
                <div className="space-y-2">
                    {EXPERTS.map((expert, idx) => {
                        const load = routing[idx];
                        const isActive = load > 0;
                        return (
                            <div key={`expert-${idx}`} className="flex items-center gap-3">
                                <div className="w-24 text-slate-400 text-right">{expert.name}</div>
                                <div className="flex-1 h-3 bg-slate-950 border border-slate-850 rounded overflow-hidden relative">
                                    <div 
                                        className="h-full transition-all duration-300"
                                        style={{ width: `${load * 100}%`, backgroundColor: expert.color, opacity: isActive ? 0.8 : 0.2 }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-end px-2 text-[8px] text-slate-500 font-bold">
                                        {(load * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                The gating network takes Query inputs, projects them to expert dimensions, and applies Top-2 Softmax. Notice how only two experts are activated for any input state, saving substantial processing compute.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 2: LoRA Low-Rank Dimension Solver
   ═══════════════════════════════════════════════════════════════════════ */

const LORADimensionSolver: React.FC = () => {
    const [rank, setRank] = useState<number>(2);

    const d_model = 64; // mock embedding size
    const d_out = 64;
    const baseParams = d_model * d_out;
    const loraParams = rank * (d_model + d_out);
    const savings = (1 - loraParams / baseParams) * 100;

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">LoRA Dimension Solver & parameter Savings</span>

            <div className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                    <label className="text-slate-400 flex justify-between">
                        <span>LoRA Rank (r)</span>
                        <span className="font-mono text-sky-400 font-bold">r = {rank}</span>
                    </label>
                    <input type="range" min="1" max="16" value={rank} onChange={e => setRank(parseInt(e.target.value))} className="w-full accent-sky-500 h-1 bg-slate-850 rounded" />
                </div>

                <div className="bg-slate-900/50 p-3 rounded border border-slate-900 font-mono text-[10px] space-y-2 leading-relaxed">
                    <div className="flex justify-between">
                        <span>Base Linear Weight Matrix (<MathEquation formula="W_0" />):</span>
                        <span className="text-slate-400">{d_model} × {d_out} = {baseParams} params</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Adapter Matrix B (<MathEquation formula="d\_in \times r" />):</span>
                        <span className="text-slate-400">{d_model} × {rank} = {d_model * rank} params</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Adapter Matrix A (<MathEquation formula="r \times d\_out" />):</span>
                        <span className="text-slate-400">{rank} × {d_out} = {rank * d_out} params</span>
                    </div>
                    <div className="border-t border-slate-850 pt-2 flex justify-between font-bold">
                        <span>Total Trainable Adapters:</span>
                        <span className="text-white">{loraParams} parameters</span>
                    </div>
                    <div className="flex justify-between font-bold text-sky-450">
                        <span>Parameters Reduction:</span>
                        <span className="text-sky-400">{savings.toFixed(1)}% savings</span>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                By projecting updates through two low-rank matrices (<MathEquation formula="\mathbf{B}\mathbf{A}" />), LoRA compresses the parameter footprint. At rank <MathEquation formula="r=2" />, training requires less than <MathEquation formula="7\%" /> of the base parameters.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-WIDGET 3: Quantization Precision Bit-Shrinker
   ═══════════════════════════════════════════════════════════════════════ */

const QuantizationBitShrinker: React.FC = () => {
    const [bits, setBits] = useState<number>(8);

    // Calculate quantized values and Mean Squared Error for sine wave
    // Sine values range from -1.0 to 1.0.
    // 2-bit -> 4 levels: -1.0, -0.33, 0.33, 1.0
    // 4-bit -> 16 levels
    // 8-bit -> 256 levels
    // 32-bit -> Infinite precision
    const getQuantizedPoints = () => {
        const points = [];
        let totalSqErr = 0;
        const steps = 30;
        const levels = Math.pow(2, bits);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = t * Math.PI * 2;
            const yOriginal = Math.sin(x);
            
            let yQuantized = yOriginal;
            if (bits < 32) {
                // Map [-1.0, 1.0] to [0, levels - 1]
                const scaled = (yOriginal + 1) / 2 * (levels - 1);
                const quantized = Math.round(scaled);
                yQuantized = (quantized / (levels - 1)) * 2 - 1;
            }

            totalSqErr += Math.pow(yOriginal - yQuantized, 2);
            points.push({
                x: t * 180 + 10,
                y: 50 - yQuantized * 35,
                origY: 50 - yOriginal * 35
            });
        }

        const mse = totalSqErr / (steps + 1);
        return { points, mse };
    };

    const { points, mse } = getQuantizedPoints();

    return (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quantization Precision Bit-Shrinker</span>
                <div className="flex gap-1.5">
                    {[2, 4, 8, 32].map(b => (
                        <button
                            key={`bit-btn-${b}`}
                            onClick={() => setBits(b)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                                bits === b 
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                                    : 'bg-slate-900 text-slate-500 border border-transparent'
                            }`}
                        >
                            {b === 32 ? 'FP32' : `${b}-BIT`}
                        </button>
                    ))}
                </div>
            </div>

            {/* SVG Plot */}
            <div className="flex justify-center bg-slate-905 p-2 rounded-lg border border-slate-900">
                <svg width="200" height="100" className="block">
                    {/* Zero line */}
                    <line x1="10" y1="50" x2="190" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
                    
                    {/* Original smooth wave path */}
                    <path 
                        d={"M " + points.map(p => `${p.x} ${p.origY}`).join(" L ")}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.5"
                    />

                    {/* Quantized stepped wave path */}
                    <path 
                        d={"M " + points.map(p => `${p.x} ${p.y}`).join(" L ")}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Discrete data points */}
                    {points.map((p, idx) => (
                        <circle key={`pt-${idx}`} cx={p.x} cy={p.y} r="2.2" fill="#7dd3fc" />
                    ))}
                </svg>
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[10px] flex justify-between items-center">
                <span>Quantization Noise Distortion (MSE):</span>
                <span className="text-sky-400 font-bold">{mse === 0 ? "0.000" : mse.toExponential(3)}</span>
            </div>

            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Linear quantization scales continuous weights to finite bins. Reducing precision to 2-bit introduces significant noise (high MSE), while 8-bit keeps distortion minimal, saving <MathEquation formula="75\%" /> GPU VRAM memory.
            </p>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHAPTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export const LLMScaling: React.FC = () => {
    return (
        <div className="space-y-12">

            {/* ─── SECTION HERO ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 text-sky-400 mb-4">
                    <Sparkles size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 12</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-sky-505 mb-4">
                    Large Language Models & Scaling
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Balance scaling dimensions and adapt parameters efficiently. Derive Chinchilla allocations, sparse 
                    MoE gating routing manifolds, low-rank adapters, and linear scale integer quantization.
                </p>
            </motion.div>

            {/* ─── 12.1 SCALING & EFFICIENCY ────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionTitle icon={<HelpCircle size={20} className="text-sky-400" />}>
                    12.1 — LLM Scaling, MoEs, PEFT & Quantization
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Resource Allocation Analogy">
                        **Chinchilla Scaling** acts like budgeting for study prep. If you buy a massive, detailed syllabus (parameters) but only study it for 5 minutes (tokens), you fail. Likewise, studying a 1-page booklet (tokens) for 100 hours is useless. You must scale parameters and token size in exact, equal proportions.
                        **Mixture of Experts (MoE)** acts like routing office queries. Instead of forcing every employee (dense network) to read every query, a routing assistant directs incoming logic/code tasks only to specialized departments (experts), minimizing operational costs.
                        **LoRA** acts like inserting custom sticky notes into a textbook instead of reprinting the entire edited edition.
                    </Callout>

                    <p className="text-slate-300 leading-relaxed font-sans">
                        As transformer architectures scale, training costs explode. To address this, modern deep learning utilizes compute-optimal budgets (Scaling Laws), activates pathways dynamically (MoEs), adapts weights in low-rank subspaces (PEFT/LoRA), and compresses precision parameters (Quantization).
                    </p>
                </Card>
            </motion.section>

            {/* ─── 12.2 MATHEMATICAL DERIVATIONS ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionTitle icon={<BookOpen size={20} className="text-sky-400" />}>
                    12.2 — Scaling Equations, Router Optimization & Subspaces
                </SectionTitle>

                <Card className="space-y-6">
                    <p className="text-slate-300 leading-relaxed font-sans">
                        Let us derive the core formulations of scaling constraints, low-rank updates, and quantization boundaries.
                    </p>

                    <div className="space-y-8">
                        {/* Scaling Laws */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">1. Chinchilla Scaling Laws (Hoffmann et al. 2022)</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Kaplan et al. originally argued that parameters should scale faster than data tokens. Hoffmann et al. demonstrated that parameters and token dataset sizes should scale in equal proportion:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <div>Total training FLOP compute is approximately:</div>
                                <MathEquation formula="C \approx 6 N D" block />
                                <div>Optimal allocation given budget <MathEquation formula="C" /> dictates parameters <MathEquation formula="N" /> and tokens <MathEquation formula="D" /> scale as:</div>
                                <MathEquation formula="N \propto C^a, \quad D \propto C^b \quad (\text{where } a \approx 0.5, b \approx 0.5)" block />
                            </div>
                        </div>

                        {/* MoE Gating */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">2. Sparse MoE Routing & Load Balancing</h4>
                            <p className="text-slate-405 text-xs leading-relaxed font-sans">
                                An MoE layer activates subsets of experts. For input token vector <MathEquation formula="\mathbf{x}" />, routing weights <MathEquation formula="G(\mathbf{x})" /> are:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="G(\mathbf{x}) = \operatorname{softmax}\left(\operatorname{KeepTopK}(\mathbf{H}\mathbf{x}, k)\right)" block />
                                <div className="text-center">The layer output is the weighted sum of expert allocations:</div>
                                <MathEquation formula="\mathbf{y} = \sum_{i \in \text{TopK}} G(\mathbf{x})_i E_i(\mathbf{x})" block />
                                <p className="text-slate-500 font-sans text-[11px] mt-1">
                                    To prevent **expert collapse** (where the gating network always routes queries to the same expert), a load balancing loss <MathEquation formula="\mathcal{L}_{\text{balance}} = \alpha \sum_{j=1}^E f_j P_j" /> is added, minimizing routing variance.
                                </p>
                            </div>
                        </div>

                        {/* LoRA */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">3. Low-Rank Adaptation (LoRA) updates</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                LoRA freezes base weights <MathEquation formula="\mathbf{W}_0" /> and adds a low-rank adapter path:
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="\mathbf{W} = \mathbf{W}_0 + \Delta \mathbf{W} = \mathbf{W}_0 + \frac{\alpha}{r} \mathbf{B}\mathbf{A}" block />
                                <div className="text-center font-sans text-slate-500">For input <MathEquation formula="\mathbf{x}" />, the forward pass activation output is:</div>
                                <MathEquation formula="\mathbf{h} = \mathbf{W}_0 \mathbf{x} + \frac{\alpha}{r} \mathbf{B}\mathbf{A}\mathbf{x}" block />
                                <p className="text-slate-505 font-sans text-[11px] mt-1">
                                    Here, <MathEquation formula="\mathbf{B} \in \mathbb{R}^{d \times r}" /> is initialized to 0, and <MathEquation formula="\mathbf{A} \in \mathbb{R}^{r \times k}" /> is initialized randomly from a Gaussian. This guarantees <MathEquation formula="\Delta \mathbf{W} = \mathbf{0}" /> at the start of training, ensuring zero perturbation to base predictions.
                                </p>
                            </div>
                        </div>

                        {/* Quantization */}
                        <div className="border-l-2 border-slate-800 pl-4 space-y-3">
                            <h4 className="text-md font-bold text-white">4. Linear Scale Quantization</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                Quantization projects 32-bit floats down to lower bit widths (e.g. INT8 or INT4):
                            </p>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                                <MathEquation formula="q = \operatorname{round}\left( \frac{x}{S} \right) + Z, \\ \quad S = \frac{\max(x) - \min(x)}{2^b - 1}" block />
                                <div className="text-center font-sans text-slate-500">Symmetric quantization (with Zero-point Z = 0) simplifies to:</div>
                                <MathEquation formula="q = \operatorname{round}\left(\frac{x}{S}\right), \quad S = \frac{\max(|x|)}{2^{b-1} - 1}" block />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── INTERACTIVE SANDBOX ────────────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionTitle icon={<Activity size={20} className="text-sky-400" />}>
                    12.3 — Large Language Model Scaling Sandbox
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <MoERouter />
                    <LORADimensionSolver />
                    <QuantizationBitShrinker />
                </div>
            </motion.section>

            {/* ─── 12.4 WORKED NUMERICAL EXAMPLE ───────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SectionTitle icon={<Award size={20} className="text-sky-400" />}>
                    12.4 — Worked Numerical Examples (Hand-Traces)
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-bold text-white">Example A: LoRA Forward Pass calculation</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us calculate a forward step with input <MathEquation formula="\mathbf{x} = \begin{pmatrix} 1.0 \\ -1.0 \end{pmatrix}" /> through base weights <MathEquation formula="\mathbf{W}_0" /> and rank <MathEquation formula="r=1" /> matrices <MathEquation formula="\mathbf{A}, \mathbf{B}" /> (with scale coefficient <MathEquation formula="\alpha = 1" />):
                            <MathEquation formula="\mathbf{W}_0 = \begin{pmatrix} 0.5 & 0.2 \\ -0.1 & 0.4 \end{pmatrix}, \quad \mathbf{A} = \begin{pmatrix} 1.0 & 2.0 \end{pmatrix}, \quad \mathbf{B} = \begin{pmatrix} -0.5 \\ 0.8 \end{pmatrix}" block />
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-4 leading-relaxed">
                            <div>
                                <span className="text-sky-400 font-bold block mb-1">1. Base Layer Output (W_0 x):</span>
                                <MathEquation formula="\mathbf{y}_0 = \begin{pmatrix} 0.5 & 0.2 \\ -0.1 & 0.4 \end{pmatrix} \begin{pmatrix} 1.0 \\ -1.0 \end{pmatrix} = \begin{pmatrix} 0.5(1) + 0.2(-1) \\ -0.1(1) + 0.4(-1) \end{pmatrix} = \begin{pmatrix} 0.3 \\ -0.5 \end{pmatrix}" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-sky-400 font-bold block mb-1">2. LoRA Adapter Step (B A x):</span>
                                <MathEquation formula="\mathbf{A}\mathbf{x} = \begin{pmatrix} 1.0 & 2.0 \end{pmatrix} \begin{pmatrix} 1.0 \\ -1.0 \end{pmatrix} = 1.0(1) + 2.0(-1) = -1.0" block />
                                <MathEquation formula="\Delta \mathbf{y} = \frac{\alpha}{r} \mathbf{B} (\mathbf{A}\mathbf{x}) = 1.0 \begin{pmatrix} -0.5 \\ 0.8 \end{pmatrix} (-1.0) = \begin{pmatrix} 0.5 \\ -0.8 \end{pmatrix}" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-sky-400 font-bold block mb-1">3. Final Combined Activation Output (y_0 + Δy):</span>
                                <MathEquation formula="\mathbf{y} = \mathbf{y}_0 + \Delta \mathbf{y} = \begin{pmatrix} 0.3 \\ -0.5 \end{pmatrix} + \begin{pmatrix} 0.5 \\ -0.8 \end{pmatrix} = \begin{pmatrix} 0.8 \\ -1.3 \end{pmatrix}" block />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-6 space-y-4">
                        <h3 className="text-md font-bold text-white">Example B: Symmetric INT8 Quantization</h3>
                        <p className="text-slate-300 text-sm font-sans">
                            Let us quantize a FP32 weights vector <MathEquation formula="\mathbf{w} = \begin{pmatrix} 3.5 \\ -2.0 \\ 0.5 \\ -4.0 \end{pmatrix}" /> to 8-bit integers symmetrically:
                        </p>

                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 font-mono text-xs space-y-3 leading-relaxed">
                            <div>
                                <span className="text-sky-400 font-bold block mb-1">1. Find Absolute Max & Scale (S):</span>
                                <MathEquation formula="\max(|w|) = 4.0, \\ \quad \text{INT8 Max Bound} = 2^7 - 1 = 127" block />
                                <MathEquation formula="S = \frac{\max(|w|)}{127} = \frac{4.0}{127} \approx 0.031496" block />
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-sky-400 font-bold block mb-1">2. Project and Round Values to INT8 (q = round(w / S)):</span>
                                <div className="grid grid-cols-1 gap-1 pl-2 mt-1">
                                    <div><MathEquation formula="q_0 = \operatorname{round}(3.5 / 0.031496) = \operatorname{round}(111.12) = 111" /></div>
                                    <div><MathEquation formula="q_1 = \operatorname{round}(-2.0 / 0.031496) = \operatorname{round}(-63.50) = -64" /></div>
                                    <div><MathEquation formula="q_2 = \operatorname{round}(0.5 / 0.031496) = \operatorname{round}(15.87) = 16" /></div>
                                    <div><MathEquation formula="q_3 = \operatorname{round}(-4.0 / 0.031496) = \operatorname{round}(-127.00) = -127" /></div>
                                </div>
                            </div>
                            <div className="border-t border-slate-900 pt-3">
                                <span className="text-sky-400 font-bold block mb-1">3. Dequantized check (w_approx = q * S):</span>
                                <div className="grid grid-cols-1 gap-1 pl-2 mt-1">
                                    <div><MathEquation formula="w_0 \approx 111 \times 0.031496 = 3.496 \quad (\\Delta = -0.004)" /></div>
                                    <div><MathEquation formula="w_1 \approx -64 \times 0.031496 = -2.016 \quad (\\Delta = -0.016)" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* ─── 12.5 PYTORCH CODE SNIPPET ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SectionTitle icon={<Terminal size={20} className="text-sky-400" />}>
                    12.5 — PyTorch Custom LoRA & Sparse MoE Layers
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-300 text-sm font-sans">
                        Here is a modular Python implementation showcasing a custom LoRA Linear wrapper layer and a sparse Mixture of Experts module.
                    </p>

                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono">
<code>{`import torch
import torch.nn as nn
import torch.nn.functional as F

class LoraLinear(nn.Module):
    """
    Wraps a standard linear layer with trainable low-rank adapters A and B.
    """
    def __init__(self, in_features: int, out_features: int, rank: int = 4, alpha: float = 8.0):
        super(LoraLinear, self).__init__()
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank
        
        # Frozen base weight matrix
        self.base_layer = nn.Linear(in_features, out_features)
        self.base_layer.weight.requires_grad = False
        
        # Trainable low-rank adapters
        self.lora_A = nn.Parameter(torch.randn(rank, in_features) * (1.0 / rank))
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank)) # Zero init to keep change zero at start

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Base forward pass
        y_base = self.base_layer(x)
        
        # Low rank forward: x x A_T x B_T
        y_lora = F.linear(F.linear(x, self.lora_A), self.lora_B) * self.scaling
        
        return y_base + y_lora

class SparseMoELayer(nn.Module):
    """
    Routes inputs to Top-K selected experts dynamically.
    """
    def __init__(self, d_model: int, num_experts: int = 4, top_k: int = 2):
        super(SparseMoELayer, self).__init__()
        self.num_experts = num_experts
        self.top_k = top_k
        
        # Gating network
        self.router = nn.Linear(d_model, num_experts)
        
        # Experts
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(d_model, d_model * 2),
                nn.ReLU(),
                nn.Linear(d_model * 2, d_model)
            ) for _ in range(num_experts)
        ])

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [Batch, Seq_Len, Dim]
        batch, seq, dim = x.shape
        x_flat = x.view(-1, dim)
        
        # 1. Compute gating logits
        logits = self.router(x_flat) # [B * S, num_experts]
        
        # 2. Get Top-K experts
        topk_logits, topk_indices = torch.topk(logits, self.top_k, dim=-1)
        topk_probs = F.softmax(topk_logits, dim=-1) # [B * S, top_k]
        
        # Create output placeholder
        output = torch.zeros_like(x_flat)
        
        # 3. Route elements to their corresponding experts
        for i in range(self.num_experts):
            # Mask identifying if expert 'i' was selected in Top-K
            mask = (topk_indices == i)
            if not mask.any():
                continue
                
            # Retrieve flat indices of inputs mapped to expert 'i'
            token_indices, topk_pos = torch.where(mask)
            tokens = x_flat[token_indices]
            
            # Compute expert output
            expert_out = self.experts[i](tokens)
            
            # Weighted accumulate in output
            weights = topk_probs[token_indices, topk_pos].unsqueeze(-1)
            output[token_indices] += weights * expert_out
            
        return output.view(batch, seq, dim)

if __name__ == "__main__":
    # Test LoRA
    x_test = torch.randn(2, 10)
    lora = LoraLinear(10, 20, rank=2)
    print("LoRA output shape:", lora(x_test).shape) # Should be [2, 20]
    
    # Test MoE
    x_moe = torch.randn(2, 5, 16)
    moe = SparseMoELayer(d_model=16, num_experts=4)
    print("MoE output shape:", moe(x_moe).shape)   # Should be [2, 5, 16]`}</code>
                    </pre>
                </Card>
            </motion.section>

        </div>
    );
};
