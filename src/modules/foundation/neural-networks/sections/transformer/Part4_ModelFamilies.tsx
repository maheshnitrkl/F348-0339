import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Eye,
    Zap,
    Play,
    Pause
} from 'lucide-react';
import { MathEquation } from '../../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../../components/SectionElements';

/* =========================================================================
   SECTION 11: BERT & Encoder-Only Models
   ========================================================================= */

const BertMaskWidget: React.FC = () => {
    const [selectedWordIdx, setSelectedWordIdx] = useState(2); // "sat"

    const sentence = ["The", "cat", "sat", "on", "the", "mat"];
    
    const mockPredictions = [
        { word: "sat", prob: 0.82 },
        { word: "slept", prob: 0.08 },
        { word: "lay", prob: 0.05 },
        { word: "jumped", prob: 0.02 }
    ];

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Eye size={16} className="text-indigo-400" />
                Masked Language Modeling (MLM) Context-Aware Cloze Probe
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 text-xs font-sans">
                    <span className="text-slate-400">Click a word to mask it:</span>
                    <div className="flex flex-wrap gap-2 py-2">
                        {sentence.map((w, idx) => {
                            const isMasked = selectedWordIdx === idx;
                            return (
                                <button
                                    key={`word-${idx}`}
                                    onClick={() => setSelectedWordIdx(idx)}
                                    className={`px-3 py-1.5 rounded font-mono font-bold text-xs transition-all border ${
                                        isMasked 
                                            ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                            : 'bg-slate-900 text-slate-350 border-slate-800 hover:text-white'
                                    }`}
                                >
                                    {isMasked ? "[MASK]" : w}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Prediction list */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 font-mono text-xs">
                    <span className="text-slate-500 text-[10px] block">Top Predicted Replaces for [MASK]:</span>
                    <div className="space-y-2">
                        {mockPredictions.map((pred, idx) => (
                            <div key={`pred-${idx}`} className="flex justify-between items-center bg-slate-900/60 px-3 py-1.5 rounded border border-slate-900">
                                <span className={idx === 0 ? "text-indigo-400 font-bold" : "text-slate-300"}>
                                    {idx === 0 && selectedWordIdx === 2 ? pred.word : (selectedWordIdx === 1 ? "dog" : (idx === 0 ? sentence[selectedWordIdx] : "word"))}
                                </span>
                                <span className="text-slate-400">{(pred.prob * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 12: GPT & Decoder-Only Models
   ========================================================================= */

const GptGenerationWidget: React.FC = () => {
    const [tokens, setTokens] = useState<string[]>(["The", "LLM", "generates"]);
    const [isPlaying, setIsPlaying] = useState(false);

    const candidates = ["text", "tokens", "sequences", "code", "outputs", "words", "predictions"];

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying) {
            interval = setInterval(() => {
                const nextToken = candidates[Math.floor(Math.random() * candidates.length)];
                setTokens(prev => {
                    if (prev.length > 8) return ["The", "LLM", "generates"];
                    return [...prev, nextToken];
                });
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Terminal size={16} className="text-emerald-400" />
                Autoregressive Generation & Causal Decoding Pipeline
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`flex-1 py-1.5 rounded font-bold text-xs transition-colors ${
                                isPlaying ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                            }`}
                        >
                            {isPlaying ? <Pause className="inline mr-1" size={12} /> : <Play className="inline mr-1" size={12} />}
                            {isPlaying ? "Pause" : "Start Auto-Gen"}
                        </button>
                        <button 
                            onClick={() => { setIsPlaying(false); setTokens(["The", "LLM", "generates"]); }}
                            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400">
                        <div>**Causal probability model**:</div>
                        <MathEquation formula="P(w_t \mid w_{<t})" />
                    </div>
                </div>

                <div className="col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex flex-wrap gap-2 items-center justify-start overflow-y-auto">
                    {tokens.map((tk, idx) => (
                        <div key={`gpt-tk-${idx}`} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded font-mono text-xs shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                            {tk}
                        </div>
                    ))}
                    {isPlaying && (
                        <span className="w-2 h-4 bg-emerald-400 animate-pulse self-center" />
                    )}
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 13: Seq2Seq Models
   ========================================================================= */

const Seq2SeqTasksWidget: React.FC = () => {
    const [selectedTask, setSelectedTask] = useState<'trans' | 'summ' | 'qa'>('trans');

    const tasks = {
        trans: { input: "translate English to German: The cat sat on the mat.", output: "Die Katze sass auf der Matte." },
        summ: { input: "summarize: Transformers replace recurrence with global self-attention to speed up training.", output: "Self-attention speeds up training." },
        qa: { input: "question: What is attention? context: Attention is a lookup.", output: "A lookup." }
    };

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <BookOpen size={16} className="text-indigo-400" />
                T5 Unified Text-to-Text Task Selector & Output Formatting
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col gap-2">
                    {(['trans', 'summ', 'qa'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedTask(t)}
                            className={`py-2 px-3 rounded text-left font-mono font-bold text-[10px] transition-all border ${
                                selectedTask === t 
                                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            {t === 'trans' && "TRANSLATION"}
                            {t === 'summ' && "SUMMARIZATION"}
                            {t === 'qa' && "QUESTION ANSWERING"}
                        </button>
                    ))}
                </div>

                <div className="col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex flex-col justify-center space-y-3 font-mono text-[10px]">
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-900 text-slate-400">
                        <span className="text-[8px] text-slate-500 block mb-0.5">Input Text:</span>
                        {tasks[selectedTask].input}
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-indigo-500/20 text-indigo-300">
                        <span className="text-[8px] text-indigo-400 block mb-0.5">Target Text (Generated):</span>
                        {tasks[selectedTask].output}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 14: Mixture of Experts (MoE)
   ========================================================================= */

const MoeRoutingWidget: React.FC = () => {
    const [activeToken, setActiveToken] = useState("MathToken");

    const tokens = [
        { name: "MathToken", experts: [1, 3] },
        { name: "LanguageToken", experts: [0, 2] },
        { name: "CodeToken", experts: [1, 2] }
    ];

    const currentToken = tokens.find(t => t.name === activeToken) || tokens[0];

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Sliders size={16} className="text-violet-400" />
                Token-to-Expert Gating Routing System (Top-2 Experts)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex flex-col gap-2">
                    {tokens.map(t => (
                        <button
                            key={t.name}
                            onClick={() => setActiveToken(t.name)}
                            className={`py-2 px-3 rounded text-left font-mono font-bold text-[10px] transition-all border ${
                                activeToken === t.name 
                                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>

                <div className="col-span-3 bg-slate-950 p-4 rounded-xl border border-slate-850 h-36 flex items-center justify-around relative">
                    {/* Active Token */}
                    <div className="px-3 py-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold z-10">
                        {activeToken}
                    </div>

                    {/* Experts list */}
                    <div className="grid grid-cols-2 gap-2 z-10">
                        {[...Array(4)].map((_, idx) => {
                            const isActivated = currentToken.experts.includes(idx);
                            return (
                                <div 
                                    key={`expert-${idx}`} 
                                    className={`px-3 py-2 rounded text-[10px] font-mono border transition-all duration-300 ${
                                        isActivated 
                                            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.15)]' 
                                            : 'bg-slate-900/45 border-slate-900 text-slate-550'
                                    }`}
                                >
                                    Expert {idx+1} {idx === 0 && "(NLP)"} {idx === 1 && "(Math)"} {idx === 2 && "(Code)"} {idx === 3 && "(Logics)"}
                                </div>
                            );
                        })}
                    </div>

                    {/* Links */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                        {currentToken.experts.map(expIdx => {
                            const y = expIdx < 2 ? 40 : 96;
                            const x = expIdx % 2 === 0 ? 190 : 270;
                            return (
                                <path key={`link-exp-${expIdx}`} d={`M 110 68 L ${x} ${y}`} fill="none" stroke="#845ef7" strokeWidth="2.5" />
                            );
                        })}
                    </svg>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   PART 4 EXPORT COMPONENT
   ========================================================================= */

export const Part4_ModelFamilies: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION 11 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Eye size={22} className="text-indigo-400" />}>
                    Section 11: BERT & Encoder-Only Transformers
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">11.1 Context-Aware MLM Pretraining</h4>
                    <p className="text-slate-350 text-sm">
                        BERT (Bidirectional Encoder Representations from Transformers) learns context-aware token embeddings using a bidirectional training objective.
                        The **Masked Language Modeling (MLM)** objective masks 15% of tokens in the input text, forcing the network to predict the redacted tokens based on both left and right context:
                        <MathEquation formula="\mathcal{L}_{\text{MLM}} = -\sum_{t \in \text{mask}} \log P(x_t \mid \mathbf{x}_{\setminus\text{mask}})" block />
                    </p>
                </Card>

                <BertMaskWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">11.2 Disentangled Relative Attention (DeBERTa)</h4>
                    <p className="text-slate-350 text-sm">
                        DeBERTa improves BERT representation by separating token attention into content and position vectors.
                        In standard self-attention, content and position vectors are added, combining their properties. DeBERTa calculates attention matrices directly using disentangled cross-products:
                        <MathEquation formula="A_{i,j} = \mathbf{q}_i^T \mathbf{k}_j + \mathbf{q}_i^T \mathbf{r}_{i-j} + \mathbf{r}_{j-i}^T \mathbf{k}_j" block />
                        {"where $\\mathbf{r}_{i-j}$ represents the relative position vector."}
                    </p>
                </Card>
            </section>

            {/* ─── SECTION 12 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Terminal size={22} className="text-emerald-400" />}>
                    Section 12: GPT & Decoder-Only Transformers
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">12.1 Autoregressive Causal Pretraining</h4>
                    <p className="text-slate-350 text-sm">
                        GPT (Generative Pretrained Transformer) uses causal self-attention masks to generate text autoregressively.
                        The **Causal Language Modeling (CLM)** objective trains the network to predict the next token given all previous context tokens:
                        <MathEquation formula="\mathcal{L}_{\text{CLM}} = -\sum_{t=1}^T \log P(x_t \mid x_{<t})" block />
                    </p>
                </Card>

                <GptGenerationWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">12.2 Modern LLaMA-Style Architecture Innovations</h4>
                    <p className="text-slate-350 text-sm">
                        Standard modern decoders (LLaMA-3, Mistral) have consolidated multiple architectural improvements:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1.5">
                        <li>**Pure RoPE**: No absolute positional bias in attention matrices.</li>
                        <li>**Pre-RMSNorm**: Normalizes layer inputs instead of outputs, with no mean centering.</li>
                        <li>**SwiGLU FFN**: Replaces standard FFN layers to improve gating properties.</li>
                    </ul>
                </Card>
            </section>

            {/* ─── SECTION 13 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<BookOpen size={22} className="text-indigo-400" />}>
                    Section 13: T5, BART & Encoder-Decoder Transformers
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">13.1 Unified Text-to-Text Framework</h4>
                    <p className="text-slate-350 text-sm">
                        T5 (Text-to-Text Transfer Transformer) maps all NLP problems (translation, summarization, QA) into a standardized string-to-string format.
                        {"During training, T5 uses a **Span Corruption** denoising objective: it replaces random spans of text (average 3 tokens) with unique sentinel tokens ($ \\langle \\text{extra\\_id\\_0} \\rangle $) and trains the decoder to reconstruct them sequentially."}
                    </p>
                </Card>

                <Seq2SeqTasksWidget />
            </section>

            {/* ─── SECTION 14 ────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Sliders size={22} className="text-violet-400" />}>
                    Section 14: Mixture of Experts (MoE) Transformers
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">14.1 Gating Networks & Load Balancing</h4>
                    <p className="text-slate-350 text-sm">
                        Mixture of Experts (MoE) replaces standard FFN layers with a routing gate and multiple expert networks. This scales model parameter capacity without increasing compute FLOPs per token.
                        The gating network selects the Top-$k$ experts for each input token:
                        <MathEquation formula="y = \sum_{i \in \operatorname{TopK}(x)} G(x)_i \cdot E_i(x)" block />
                        {"where $G(x) = \\operatorname{softmax}(\\operatorname{TopK}(x\\mathbf{W}_g, k))$ are gating coefficients."}
                    </p>
                </Card>

                <MoeRoutingWidget />

                <Card className="space-y-4">
                    <h5 className="text-white font-semibold text-xs mt-2">Load Balancing Loss Prevention</h5>
                    <p className="text-slate-355 text-xs">
                        Without constraints, routing gating networks tend to over-utilize a few experts, leading to expert collapse. To prevent this, an **auxiliary load-balancing loss** is added:
                        <MathEquation formula="\mathcal{L}_{\text{aux}} = \alpha \cdot N \sum_{i=1}^N f_i \cdot p_i" block />
                        where $f_i$ is the fraction of tokens dispatched to expert $i$, and $p_i$ is the average gating probability for expert $i$ across the training batch. Minimizing this forces uniform routing.
                    </p>
                </Card>
            </section>

            {/* ─── PYTORCH CODEBOX ───────────────────────────────────── */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Terminal size={20} className="text-indigo-400" />
                    Part 4 Reference PyTorch Implementations
                </h4>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
{`import torch
import torch.nn as nn
import torch.nn.functional as F

class SparseMoELayer(nn.Module):
    """
    Modular implementation of Top-2 Mixture of Experts (MoE) FFN layer.
    """
    def __init__(self, d_model: int, n_experts: int = 8, active_experts: int = 2):
        super().__init__()
        self.n_experts = n_experts
        self.active_experts = active_experts
        
        # Expert routing gating network
        self.gate = nn.Linear(d_model, n_experts, bias=False)
        
        # Experts definition
        self.experts = nn.ModuleList([
            SwiGLUFFN(d_model, d_model * 4) for _ in range(n_experts)
        ])

    def forward(self, x):
        # x: [Batch, Seq_Len, d_model]
        B, S, C = x.shape
        x_flat = x.view(-1, C) # [B * S, C]
        
        # 1. Compute gating logits: [B * S, n_experts]
        gate_logits = self.gate(x_flat)
        
        # 2. Get Top-k experts and their routing probabilities
        probs = F.softmax(gate_logits, dim=-1)
        top_weights, top_indices = torch.topk(probs, self.active_experts, dim=-1)
        
        # Re-normalize weights over top experts
        top_weights = top_weights / top_weights.sum(dim=-1, keepdim=True)
        
        # 3. Dispatch tokens to selected experts
        out_flat = torch.zeros_like(x_flat)
        for i, expert in enumerate(self.experts):
            # Mask identifying which tokens route to expert i
            token_mask, expert_rank = torch.where(top_indices == i)
            if token_mask.size(0) == 0:
                continue
                
            # Extract inputs and scale weights
            inputs = x_flat[token_mask]
            weights = top_weights[token_mask, expert_rank].unsqueeze(-1)
            
            # Compute expert output and accumulate
            out_flat[token_mask] += expert(inputs) * weights
            
        return out_flat.view(B, S, C)`}
                </pre>
            </section>
        </div>
    );
};
