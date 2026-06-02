import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, 
    Layers, 
    Sliders, 
    Sparkles, 
    BookOpen, 
    Award, 
    Zap,
    Scale,
    Activity
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../components/SectionElements';

// Import sub-modules
import { Part1_CoreAttention } from './transformer/Part1_CoreAttention';
import { Part2_BlocksAndArchitectures } from './transformer/Part2_BlocksAndArchitectures';
import { Part3_TrainingAndEfficiency } from './transformer/Part3_TrainingAndEfficiency';
import { Part4_ModelFamilies } from './transformer/Part4_ModelFamilies';
import { Part5_FrontierAndInterpretability } from './transformer/Part5_FrontierAndInterpretability';

const PARTS = [
    {
        id: 'part1',
        title: 'Part 1: Core Attention',
        subtitle: 'Motivation, SDPA, Multi-Head, & Positional Encoding',
        component: Part1_CoreAttention,
        sections: [
            '1. Motivation for Transformers',
            '2. Attention Mechanism Deep Dive',
            '3. Multi-Head Attention Layouts',
            '4. Sinusoidal & RoPE Positional Encoding'
        ]
    },
    {
        id: 'part2',
        title: 'Part 2: Blocks & Architectures',
        subtitle: 'Complete Block, Norm Highways, & Tokenization',
        component: Part2_BlocksAndArchitectures,
        sections: [
            '5. Pre-LN/Post-LN Blocks & RMSNorm',
            '6. Encoder, Decoder, & Seq2Seq',
            '7. BPE & Subword Tokenization'
        ]
    },
    {
        id: 'part3',
        title: 'Part 3: Training & Efficiency',
        subtitle: 'Schedules, Scaling Laws, FlashAttention, & KV Cache',
        component: Part3_TrainingAndEfficiency,
        sections: [
            '8. Training from Scratch & Cosine LR',
            '9. Linear Attention & FlashAttention',
            '10. KV Cache Inference Optimization'
        ]
    },
    {
        id: 'part4',
        title: 'Part 4: Model Families',
        subtitle: 'BERT, GPT, T5, & Mixture of Experts',
        component: Part4_ModelFamilies,
        sections: [
            '11. BERT & Bidirectional MLM',
            '12. GPT & Autoregressive Decoding',
            '13. T5 Unified Text-to-Text seq2seq',
            '14. Mixture of Experts routing load'
        ]
    },
    {
        id: 'part5',
        title: 'Part 5: Frontier & Interpretability',
        subtitle: 'SSMs, Multimodal, Reasoning, PEFT, & SAEs',
        component: Part5_FrontierAndInterpretability,
        sections: [
            '15. Mamba Selective State Space Models',
            '16. ViT Patching & CLIP Alignment',
            '17. Reasoning o1/R1 & GRPO RL',
            '18. LoRA / QLoRA low-rank updates',
            '19. Mechanistic Interpretability SAEs',
            '20. Frontier benchmark leaderboard'
        ]
    }
];

export const Transformer: React.FC = () => {
    const [activePartIdx, setActivePartIdx] = useState(0);

    // Estimator state
    const [dModel, setDModel] = useState(4096);
    const [nLayers, setNLayers] = useState(32);

    // Calculate parameter estimates:
    // MHA params per block: 4 * d_model^2
    // FFN params per block: 8 * d_model^2 (approx for SwiGLU / standard MLP)
    // Total block params: 12 * d_model^2
    // Total model params: 12 * L * d_model^2
    const totalParams = 12 * nLayers * Math.pow(dModel, 2);
    
    // KV Cache memory per token (FP16): 2 * L * d_model * 2 bytes
    const kvCachePerToken = 2 * nLayers * dModel * 2;

    const ActiveComponent = PARTS[activePartIdx].component;

    return (
        <div className="space-y-8 font-sans">
            
            {/* Header Hero */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800 p-8"
            >
                <div className="flex items-center gap-2 text-indigo-400 mb-3">
                    <Cpu size={18} />
                    <span className="font-mono text-xs tracking-widest uppercase">Chapter 11</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
                    The Transformer Architecture Masterclass
                </h1>
                <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
                    Explore the complete mathematical formulations, structural choices, training schedules, and inference optimizations of self-attention systems from Vaswani (2017) to frontier reasoning models (2025).
                </p>
            </motion.div>

            {/* Dynamic Parameter Estimator */}
            <Card className="space-y-6">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-400" />
                    Dynamic Model Parameter & Memory Estimator
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Sliders */}
                    <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                            <label className="text-slate-400 flex justify-between">
                                <span>Embedding Dimension (<MathEquation formula="d_{\\text{model}}" />):</span>
                                <span className="font-mono text-indigo-400 font-bold">{dModel}</span>
                            </label>
                            <input 
                                type="range" min="1024" max="8192" step="1024"
                                value={dModel} 
                                onChange={e => setDModel(parseInt(e.target.value))} 
                                className="w-full accent-indigo-500 h-1 bg-slate-800 rounded" 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-400 flex justify-between">
                                <span>Number of Layers (<MathEquation formula="L" />):</span>
                                <span className="font-mono text-indigo-400 font-bold">{nLayers}</span>
                            </label>
                            <input 
                                type="range" min="12" max="96" step="4"
                                value={nLayers} 
                                onChange={e => setNLayers(parseInt(e.target.value))} 
                                className="w-full accent-indigo-500 h-1 bg-slate-800 rounded" 
                            />
                        </div>
                    </div>

                    {/* Output display cards */}
                    <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-center">
                            <span className="text-[8px] text-slate-500 uppercase font-mono">Model Parameters</span>
                            <span className="text-lg font-bold text-indigo-400 font-mono">{(totalParams / 1e9).toFixed(1)}B</span>
                            <span className="text-[7px] text-slate-650 font-sans mt-0.5"><MathEquation formula="12 \\cdot L \\cdot d_{\\text{model}}^2" /></span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-center">
                            <span className="text-[8px] text-slate-500 uppercase font-mono">KV Cache / Token</span>
                            <span className="text-lg font-bold text-emerald-450 font-mono">{(kvCachePerToken / 1024).toFixed(1)} KB</span>
                            <span className="text-[7px] text-slate-650 font-sans mt-0.5"><MathEquation formula="4 \\cdot L \\cdot d_{\\text{model}}" /> bytes</span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-center col-span-2 sm:col-span-1">
                            <span className="text-[8px] text-slate-500 uppercase font-mono">Training Compute</span>
                            <span className="text-lg font-bold text-pink-400 font-mono">{(totalParams * 6 / 1e12).toFixed(1)}T FLOPs</span>
                            <span className="text-[7px] text-slate-650 font-sans mt-0.5"><MathEquation formula="6 \\cdot \\text{Params}" /> per token</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Sidebar Navigation & Contents layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Navigation Sidebar */}
                <div className="flex flex-col gap-2 bg-slate-900/10 border border-slate-800/60 p-3 rounded-xl lg:sticky lg:top-4">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider px-2 mb-1 block">Course Syllabus Index</span>
                    
                    {PARTS.map((p, idx) => {
                        const isActive = activePartIdx === idx;
                        return (
                            <div key={p.id} className="space-y-1">
                                <button
                                    onClick={() => setActivePartIdx(idx)}
                                    className={`w-full text-left py-2 px-3 rounded-lg font-mono font-bold text-[10px] transition-all border ${
                                        isActive 
                                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-[0_0_10px_rgba(99,102,241,0.08)]' 
                                            : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                                    }`}
                                >
                                    {p.title}
                                </button>
                                
                                {isActive && (
                                    <div className="pl-4 py-1 space-y-1">
                                        {p.sections.map((sec, sIdx) => (
                                            <span key={`sec-${sIdx}`} className="text-[8px] text-slate-450 block font-sans truncate pr-2">
                                                &bull; {sec}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content Pane */}
                <div className="lg:col-span-3 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePartIdx}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ActiveComponent />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Takeaways */}
            <Card className="bg-slate-950 border border-slate-900 p-6 md:p-8 space-y-4">
                <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Award size={16} className="text-indigo-400" />
                        Key Takeaways & Educational Summary
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Transformers represent a fundamental transition from local receptive operations to global, all-to-all dot-product alignments. By parallelizing computational matrices and applying linear positional structures, these architectures provide the core mathematical machinery supporting scaling breakthroughs in modern AI systems.
                    </p>
                </div>
            </Card>
        </div>
    );
};
