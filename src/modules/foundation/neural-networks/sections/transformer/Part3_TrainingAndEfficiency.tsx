import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, 
    Layers, 
    Sliders, 
    Sparkles, 
    AlertTriangle, 
    Terminal, 
    BookOpen, 
    Award, 
    HelpCircle, 
    CheckCircle,
    Zap,
    Scale
} from 'lucide-react';
import { MathEquation } from '../../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../../components/SectionElements';

/* =========================================================================
   SECTION 8: Training from Scratch
   ========================================================================= */

const ChinchillaCalculatorWidget: React.FC = () => {
    const [computeFlops, setComputeFlops] = useState(24); // ExaFLOPs (1e18)

    // Chinchilla laws suggest N (parameters) and D (tokens) should scale in equal proportion
    // C = 6 * N * D. Optimal N approx 16.7 * C^0.5, D approx 16.7 * C^0.5
    // Let's compute:
    const flopsReal = computeFlops * 1e18;
    const optimalN = 16.7 * Math.sqrt(flopsReal);
    const optimalD = 16.7 * Math.sqrt(flopsReal);

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Sliders size={16} className="text-indigo-400" />
                Chinchilla Compute-Optimal Parameter & Data Allocation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Training Compute Budget (<MathEquation formula="C" />):</span>
                            <span className="font-mono text-indigo-400 font-bold">{computeFlops} ExaFLOPs</span>
                        </label>
                        <input 
                            type="range" min="1" max="100" step="1"
                            value={computeFlops} 
                            onChange={e => setComputeFlops(parseInt(e.target.value))} 
                            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400 space-y-1">
                        <div className="flex justify-between">
                            <span>Optimal Parameters (<MathEquation formula="N" />):</span>
                            <span className="text-white font-bold">{(optimalN / 1e9).toFixed(1)} Billion</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Optimal Tokens (<MathEquation formula="D" />):</span>
                            <span className="text-white font-bold">{(optimalD / 1e12).toFixed(2)} Trillion</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex flex-col justify-center items-center space-y-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[9px]">Chinchilla Scaling Formula</span>
                    <MathEquation formula="C \\approx 6 \\cdot N \\cdot D" block />
                    <p className="text-[10px] text-slate-500 text-center font-sans">
                        For compute-optimal scaling, model size <MathEquation formula="N" /> and dataset tokens <MathEquation formula="D" /> should be scaled equally. 20 tokens per parameter is the optimal ratio.
                    </p>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 9: Efficient Attention Approximations
   ========================================================================= */

const FlashAttnTilingWidget: React.FC = () => {
    const [step, setStep] = useState(0);

    const stages = [
        { title: "1. Retrieve Tiles from HBM", desc: "Split Q, K, V matrices into sub-blocks and load a tile of size B_r x d and B_c x d into SRAM cache memory." },
        { title: "2. Compute Block-Wise Dot Product", desc: "Perform fast matrix multiply on the SRAM tile: S = Q_tile x K_tile^T." },
        { title: "3. Online Softmax Scaling", desc: "Update running softmax normalization scale factors (m, l) on-the-fly without writing the full matrix to HBM." },
        { title: "4. Output Summation", desc: "Accumulate results directly into Output tiles: O_tile = Softmax_tile x V_tile. Finally, write O to HBM." }
    ];

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Cpu size={16} className="text-emerald-400" />
                FlashAttention IO-Aware Tiling & SRAM Cache Pipeline
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setStep(prev => Math.max(0, prev - 1))}
                            className="flex-1 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs"
                            disabled={step === 0}
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setStep(prev => Math.min(stages.length - 1, prev + 1))}
                            className="flex-1 py-1.5 rounded bg-emerald-650 hover:bg-emerald-550 border border-emerald-500/30 text-white font-bold text-xs"
                            disabled={step === stages.length - 1}
                        >
                            Next Step
                        </button>
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400">
                        <span className="text-white font-bold block mb-1">{stages[step].title}</span>
                        {stages[step].desc}
                    </div>
                </div>

                <div className="col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex justify-around items-center relative overflow-hidden">
                    {/* HBM Block */}
                    <div className="w-16 h-20 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-500 font-mono text-center">
                        HBM<br/>(Slow, 80GB)
                    </div>

                    {/* SRAM Cache Block */}
                    <div className={`w-28 h-20 rounded-lg border transition-all duration-300 flex flex-col items-center justify-center text-[9px] font-mono text-center ${
                        step > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                        SRAM Cache<br/>(Fast, 20MB)<br/>
                        {step === 1 && "S = Q_t x K_t^T"}
                        {step === 2 && "Softmax Scalers"}
                        {step === 3 && "O = A_t x V_t"}
                    </div>

                    {/* Flows */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        {step === 0 && <path d="M 120 70 L 195 70" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />}
                        {step === 3 && <path d="M 195 90 L 120 90" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />}
                    </svg>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 10: KV Cache
   ========================================================================= */

const KvCacheCalculatorWidget: React.FC = () => {
    const [layers, setLayers] = useState(32);
    const [heads, setHeads] = useState(32);
    const [seqLen, setSeqLen] = useState(4096);

    const d_k = 128; // Standard dimension size
    // Size = 2 * Layers * Heads * SeqLen * d_k * 2 bytes (FP16)
    const totalBytes = 2 * layers * heads * seqLen * d_k * 2;
    const megabytes = totalBytes / (1024 * 1024);

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Sliders size={16} className="text-violet-400" />
                Autoregressive Generation KV Cache Memory Overhead Tracker
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Number of Layers (<MathEquation formula="L" />):</span>
                            <span className="font-mono text-violet-400 font-bold">{layers}</span>
                        </label>
                        <input 
                            type="range" min="12" max="80" step="4"
                            value={layers} 
                            onChange={e => setLayers(parseInt(e.target.value))} 
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>KV Head Count (<MathEquation formula="H_{kv}" />):</span>
                            <span className="font-mono text-violet-400 font-bold">{heads}</span>
                        </label>
                        <input 
                            type="range" min="4" max="64" step="4"
                            value={heads} 
                            onChange={e => setHeads(parseInt(e.target.value))} 
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Sequence Length Context (<MathEquation formula="T" />):</span>
                            <span className="font-mono text-violet-400 font-bold">{seqLen} tokens</span>
                        </label>
                        <input 
                            type="range" min="1024" max="32768" step="1024"
                            value={seqLen} 
                            onChange={e => setSeqLen(parseInt(e.target.value))} 
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 h-40 flex flex-col justify-center items-center space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-[9px]">KV Cache Memory Footprint</span>
                    <span className="text-2xl font-bold text-violet-400 font-mono">{(megabytes / 1024).toFixed(2)} GB</span>
                    <MathEquation formula="\\text{Size} = 2 \\cdot L \\cdot T \\cdot H_{kv} \\cdot d_k \\cdot 2 \\text{ bytes}" block />
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   PART 3 EXPORT COMPONENT
   ========================================================================= */

export const Part3_TrainingAndEfficiency: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION 8 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Zap size={22} className="text-indigo-400" />}>
                    Section 8: Training Transformers from Scratch
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">8.1 Optimization Setup & Learning Rate Schedules</h4>
                    <p className="text-slate-350 text-sm">
                        Standard LLM training utilizes the **AdamW** optimizer (which decouples weight decay from adaptive gradient calculations) combined with a **linear warmup and cosine decay** learning rate schedule.
                        <MathEquation formula="\\eta_t = \\begin{cases} \\eta_{\\max} \\cdot \\frac{t}{t_w} & t \\le t_w \\\\ \\eta_{\\min} + \\frac{1}{2}(\\eta_{\\max} - \\eta_{\\min})\\left(1 + \\cos\\left(\\frac{\\pi(t - t_w)}{T - t_w}\\right)\\right) & t > t_w \\end{cases}" block />
                        Warmup prevents early optimizer instability, and cosine decay gradually settles learning towards convergence.
                    </p>
                </Card>

                <ChinchillaCalculatorWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">8.2 Mixed Precision & Scaling Laws</h4>
                    <p className="text-slate-355 text-sm">
                        **Mixed Precision (FP16/BF16)**: Matrix multiplies are performed in low-precision 16-bit to double throughput and halve memory, keeping master weights in FP32. Loss scaling (<MathEquation formula="L_{\\text{scaled}} = L \\cdot s" />) is required for FP16 to prevent underflow.
                    </p>
                    <p className="text-slate-355 text-sm">
                        **Chinchilla Scaling Laws** (Hoffmann et al., 2022): Given a compute budget <MathEquation formula="C" /> (in FLOPs), the optimal model parameters <MathEquation formula="N" /> and dataset tokens <MathEquation formula="D" /> should scale in equal proportion:
                        <MathEquation formula="C \\approx 6 \\cdot N \\cdot D" block />
                        suggesting most LLMs historically were over-parameterized and trained on too few tokens.
                    </p>
                </Card>
            </section>

            {/* ─── SECTION 9 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Cpu size={22} className="text-emerald-400" />}>
                    Section 9: Efficient Transformers & Attention Approximations
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">9.1 The Quadratic Bottleneck & Linear Attention</h4>
                    <p className="text-slate-350 text-sm">
                        Standard self-attention forces materializing an <MathEquation formula="n \\times n" /> similarity matrix, leading to <MathEquation formula="O(n^2)" /> memory and time complexity. Linear attention bypasses this using kernel feature maps:
                        <MathEquation formula="\\operatorname{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V})_i = \\frac{\\phi(q_i)^T \\sum_j \\phi(k_j)v_j^T}{\\phi(q_i)^T \\sum_j \\phi(k_j)}" block />
                        Computing <MathEquation formula="\\mathbf{S} = \\sum_j \\phi(k_j)v_j^T" /> first permits <MathEquation formula="O(n)" /> complexity.
                    </p>
                </Card>

                <FlashAttnTilingWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">9.2 FlashAttention IO-Aware Kernel</h4>
                    <p className="text-slate-350 text-sm">
                        FlashAttention (Dao et al.) preserves exact attention computations but optimizes hardware usage. Instead of writing the full <MathEquation formula="n \\times n" /> attention matrix back to slow High-Bandwidth Memory (HBM), it tiles the matrices into blocks loaded into SRAM.
                        It calculates softmax normalization dynamically block-by-block using **online softmax**:
                        <MathEquation formula="\\begin{aligned} m^{(j)} &= \\max(m^{(j-1)}, \\max(S_{\\text{tile}})) \\\\ l^{(j)} &= e^{m^{(j-1)} - m^{(j)}} l^{(j-1)} + \\sum e^{S_{\\text{tile}} - m^{(j)}} \\end{aligned}" block />
                        This reduces GPU memory traffic, speeding up attention calculations by 2-4x.
                    </p>
                </Card>
            </section>

            {/* ─── SECTION 10 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Sliders size={22} className="text-violet-400" />}>
                    Section 10: The KV Cache & Inference Optimization
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">10.1 Autoregressive Memory Overhead</h4>
                    <p className="text-slate-350 text-sm">
                        Generating text token-by-token means each new step recalculates keys and values for all preceding tokens. Caching these representations (**KV Cache**) speeds up generation by reducing FLOPs, but consumes massive memory:
                        <MathEquation formula="\\text{Size} = 2 \\cdot L \\cdot T \\cdot H_{kv} \\cdot d_k \\cdot 2 \\text{ bytes (for FP16)}" block />
                    </p>
                </Card>

                <KvCacheCalculatorWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">10.2 Inference Optimization Strategies</h4>
                    <p className="text-slate-350 text-sm">
                        **PagedAttention** (vLLM): Borrows virtual memory ideas from operating systems. It stores the KV cache in non-contiguous memory blocks (pages) rather than pre-allocating static sequences, eliminating memory fragmentation and maximizing batch throughput.
                    </p>
                    <p className="text-slate-350 text-sm">
                        **Speculative Decoding**: Speeds up generation using a small draft model to generate <MathEquation formula="k" /> tokens quickly. The larger target model verifies them in parallel in a single forward pass, keeping output distribution exact.
                    </p>
                </Card>
            </section>

            {/* ─── PYTORCH CODEBOX ───────────────────────────────────── */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Terminal size={20} className="text-indigo-400" />
                    Part 3 Reference PyTorch Implementations
                </h4>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
{`import torch
import torch.nn as nn
import math

class CosineWarmupScheduler:
    def __init__(self, optimizer, lr_max, lr_min, warmup_steps, total_steps):
        self.optimizer = optimizer
        self.lr_max = lr_max
        self.lr_min = lr_min
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps

    def step(self, current_step):
        if current_step < self.warmup_steps:
            # Linear Warmup
            lr = self.lr_max * (current_step / self.warmup_steps)
        else:
            # Cosine Decay
            progress = (current_step - self.warmup_steps) / (self.total_steps - self.warmup_steps)
            progress = min(1.0, max(0.0, progress))
            cosine_decay = 0.5 * (1.0 + math.cos(math.pi * progress))
            lr = self.lr_min + (self.lr_max - self.lr_min) * cosine_decay
            
        for param_group in self.optimizer.param_groups:
            param_group['lr'] = lr
        return lr


class TabularKVCacheManager:
    """
    Simulated implementation of KV Cache injection during inference forward steps.
    """
    def __init__(self, max_batch_size: int, max_seq_len: int, n_heads: int, d_k: int):
        self.k_cache = torch.zeros(max_batch_size, n_heads, max_seq_len, d_k)
        self.v_cache = torch.zeros(max_batch_size, n_heads, max_seq_len, d_k)

    def update(self, batch_idx, start_pos, k_new, v_new):
        # k_new, v_new: [Batch, Heads, New_Tokens, d_k]
        num_tokens = k_new.size(-2)
        end_pos = start_pos + num_tokens
        
        self.k_cache[batch_idx, :, start_pos:end_pos, :] = k_new
        self.v_cache[batch_idx, :, start_pos:end_pos, :] = v_new
        
        return self.k_cache[batch_idx, :, :end_pos, :], self.v_cache[batch_idx, :, :end_pos, :]`}
                </pre>
            </section>
        </div>
    );
};
