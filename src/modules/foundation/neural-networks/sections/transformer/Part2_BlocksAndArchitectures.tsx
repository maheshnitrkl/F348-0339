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
    Eye,
    Zap
} from 'lucide-react';
import { MathEquation } from '../../../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../../../components/SectionElements';

/* =========================================================================
   SECTION 5: Complete Block
   ========================================================================= */

const PrePostLnWidget: React.FC = () => {
    const [layout, setLayout] = useState<'pre' | 'post'>('pre');
    const [backpropSignal, setBackpropSignal] = useState(1.0);

    // Simulated gradient calculation
    // Post-LN diminishes gradients by depth L because gradients must pass through LN derivative (usually < 1 scaling)
    // Pre-LN keeps gradient magnitude stable at ~1.0
    const finalGradient = layout === 'pre' ? backpropSignal : backpropSignal * 0.35;

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Layers size={16} className="text-indigo-400" />
                Normalization Topologies & Backpropagation Gradient Magnitudes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setLayout('pre')}
                            className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] transition-all border ${
                                layout === 'pre' 
                                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            PRE-LN (Modern)
                        </button>
                        <button
                            onClick={() => setLayout('post')}
                            className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] transition-all border ${
                                layout === 'post' 
                                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            POST-LN (Original)
                        </button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-slate-400 flex justify-between">
                            <span>Incoming Gradient (<MathEquation formula="\\partial \\mathcal{L} / \\partial h" />):</span>
                            <span className="font-mono text-indigo-400 font-bold">{backpropSignal.toFixed(2)}</span>
                        </label>
                        <input 
                            type="range" min="0.2" max="2.0" step="0.1"
                            value={backpropSignal} 
                            onChange={e => setBackpropSignal(parseFloat(e.target.value))} 
                            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded" 
                        />
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[9px] leading-relaxed text-slate-400">
                        <div>**Calculated Gradient at Early Layer**:</div>
                        <div className="text-white font-bold text-xs mt-1">
                            <MathEquation formula="\\nabla_{\\text{early}} = " />{finalGradient.toFixed(3)}
                        </div>
                    </div>
                </div>

                <div className="col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-850 h-36 flex flex-col justify-center space-y-4">
                    {/* Visual block flow */}
                    <div className="flex items-center justify-around text-xs font-mono text-slate-400 relative">
                        <span className="w-8 text-center text-slate-500">Input</span>
                        <div className="flex items-center gap-1">
                            {layout === 'pre' && <div className="px-1.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded text-[9px]">LN</div>}
                            <div className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[9px]">Attention</div>
                            {layout === 'post' && <div className="px-1.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded text-[9px]">LN</div>}
                        </div>
                        <span className="text-slate-500">&rarr;</span>
                        <div className="flex items-center gap-1">
                            {layout === 'pre' && <div className="px-1.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded text-[9px]">LN</div>}
                            <div className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[9px]">FFN</div>
                            {layout === 'post' && <div className="px-1.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded text-[9px]">LN</div>}
                        </div>
                        <span className="w-8 text-center text-slate-500">Output</span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-sans text-center leading-relaxed">
                        {layout === 'pre' 
                            ? "Pre-LN provides a clean gradient highway. Gradients bypass Normalization during backprop."
                            : "Post-LN layers wrap the addition, forcing gradients through normalizers, causing attenuation."
                        }
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 6: Architectures
   ========================================================================= */

const MaskMatrixWidget: React.FC = () => {
    const [maskType, setMaskType] = useState<'full' | 'causal' | 'cross'>('causal');

    const size = 5;
    const tokens = ["The", "cat", "sat", "on", "mat"];

    const getCellOpacity = (r: number, c: number) => {
        if (maskType === 'full') return 1.0;
        if (maskType === 'causal') return c <= r ? 1.0 : 0.05;
        // Cross-attention allows attending to all tokens, but let's mock it
        return 1.0;
    };

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Eye size={16} className="text-emerald-400" />
                Attention Masking Configurations (Mask Matrix Heatmap)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col gap-2">
                    {(['full', 'causal', 'cross'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setMaskType(type)}
                            className={`py-2 px-3 rounded text-left font-mono font-bold text-[10px] transition-all border ${
                                maskType === type 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-slate-900 text-slate-500 border-transparent'
                            }`}
                        >
                            {type === 'full' && "BIDIRECTIONAL (Encoder)"}
                            {type === 'causal' && "CAUSAL (Decoder)"}
                            {type === 'cross' && "CROSS-ATTENTION"}
                        </button>
                    ))}
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 text-[9px] font-sans text-slate-500 leading-relaxed mt-2">
                        {maskType === 'full' && "Encoder mask: Every token attends to all positions in the sequence. Bidirectional learning."}
                        {maskType === 'causal' && "Decoder mask: Tokens are blocked from looking forward in time. Lower-triangular attention matrix."}
                        {maskType === 'cross' && "Cross attention: Queries from decoder match against all keys/values from encoder. No time masks needed."}
                    </div>
                </div>

                <div className="col-span-2 flex justify-center bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <div className="grid grid-cols-6 gap-1 w-full max-w-[280px]">
                        {/* Header corner */}
                        <div className="h-8 w-8" />
                        {tokens.map((tk, idx) => (
                            <div key={`col-${idx}`} className="h-8 w-8 flex items-center justify-center text-[8px] font-mono text-slate-500 rotate-45">
                                {tk}
                            </div>
                        ))}

                        {tokens.map((rtk, r) => (
                            <React.Fragment key={`row-${r}`}>
                                <div className="h-8 w-8 flex items-center justify-end pr-2 text-[8px] font-mono text-slate-500">
                                    {rtk}
                                </div>
                                {[...Array(size)].map((_, c) => {
                                    const opacity = getCellOpacity(r, c);
                                    return (
                                        <div 
                                            key={`cell-${r}-${c}`} 
                                            className={`h-8 w-8 rounded transition-all duration-300 border ${
                                                opacity > 0.1 
                                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                                                    : 'bg-slate-900/20 border-slate-900/40 text-slate-700'
                                            } flex items-center justify-center text-[7px] font-mono`}
                                        >
                                            {opacity > 0.1 ? "Attend" : "Mask"}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   SECTION 7: Tokenization & Embeddings
   ========================================================================= */

const BpeTokenizerWidget: React.FC = () => {
    const [bpeStep, setBpeStep] = useState(0);

    const steps = [
        { text: "t e e t h / t o o t h / t o o t / t e e", merges: "Vocabulary: {t, e, h, o, u, /}" },
        { text: "te e th / t o o th / t o o t / te e", merges: "Merge 1: (t, e) -> te" },
        { text: "tee th / t o o th / t o o t / tee", merges: "Merge 2: (te, e) -> tee" },
        { text: "tee th / to o th / to o t / tee", merges: "Merge 3: (t, o) -> to" },
        { text: "tee th / too th / too t / tee", merges: "Merge 4: (to, o) -> too" },
        { text: "tee th / tooth / toot / tee", merges: "Merge 5: (too, th) -> tooth" }
    ];

    return (
        <Card className="space-y-6">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                <Terminal size={16} className="text-indigo-400" />
                Byte Pair Encoding (BPE) Subword Consolidation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-4 text-xs font-sans">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setBpeStep(prev => Math.max(0, prev - 1))}
                            className="flex-1 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs"
                            disabled={bpeStep === 0}
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setBpeStep(prev => Math.min(steps.length - 1, prev + 1))}
                            className="flex-1 py-1.5 rounded bg-indigo-650 hover:bg-indigo-550 border border-indigo-500/30 text-white font-bold text-xs"
                            disabled={bpeStep === steps.length - 1}
                        >
                            Next Step
                        </button>
                    </div>

                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-900 font-mono text-[10px] leading-relaxed text-slate-400">
                        <span className="text-white font-bold block mb-1">State:</span>
                        {steps[bpeStep].merges}
                    </div>
                </div>

                <div className="col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-850 h-32 flex flex-col justify-center items-center space-y-4">
                    <div className="font-mono text-md tracking-widest text-indigo-300 transition-all duration-300">
                        {steps[bpeStep].text}
                    </div>
                    <p className="text-[10px] text-slate-500 text-center font-sans">
                        BPE counts character pair occurrences and merges the most frequent pairs recursively to build the subword token vocabulary.
                    </p>
                </div>
            </div>
        </Card>
    );
};

/* =========================================================================
   PART 2 EXPORT COMPONENT
   ========================================================================= */

export const Part2_BlocksAndArchitectures: React.FC = () => {
    return (
        <div className="space-y-12">
            
            {/* ─── SECTION 5 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Layers size={22} className="text-indigo-400" />}>
                    Section 5: The Complete Transformer Block
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">5.1 Residual Connections & Pre-LN Stability</h4>
                    <p className="text-slate-350 text-sm">
                        Original Transformers placed LayerNorm on the output of residual blocks (**Post-LN**). Modern architectures place LayerNorm on input branches (**Pre-LN**).
                        Let us examine block formulations:
                        <MathEquation formula="\\begin{aligned} \\text{Post-LN (Original)}: \\\\ \\mathbf{h} &= \\operatorname{LN}(\\mathbf{x} + \\operatorname{MHA}(\\mathbf{x})) \\\\ \\mathbf{y} &= \\operatorname{LN}(\\mathbf{h} + \\operatorname{FFN}(\\mathbf{h})) \\\\\\\\ \\text{Pre-LN (Modern)}: \\\\ \\mathbf{h} &= \\mathbf{x} + \\operatorname{MHA}(\\operatorname{LN}(\\mathbf{x})) \\\\ \\mathbf{y} &= \\mathbf{h} + \\operatorname{FFN}(\\operatorname{LN}(\\mathbf{h})) \\end{aligned}" block />
                    </p>

                    <h5 className="text-white font-semibold text-xs mt-2">Gradient Stability Proof</h5>
                    <p className="text-slate-350 text-xs">
                        During backpropagation, early layer gradients in Pre-LN blocks receive addition signals directly through identity paths:
                        <MathEquation formula="\\frac{\\partial \\mathbf{y}}{\\partial \\mathbf{x}} = \\mathbf{I} + \\frac{\\partial \\operatorname{FFN}(\\operatorname{LN}(\\mathbf{h}))}{\\partial \\mathbf{x}}" block />
                        The identity matrix <MathEquation formula="\\mathbf{I}" /> guarantees that gradients flow back without decaying. In Post-LN, layers are wrapped by LayerNorm functions recursively:
                        <MathEquation formula="\\mathbf{x}_L = \\operatorname{LN}(\\mathbf{x}_{L-1} + \\mathcal{F}(\\mathbf{x}_{L-1}))" />
                        Differentiating this forces multiplication by normalizers' scaling matrices, diminishing signals exponentially as depth <MathEquation formula="L" /> grows.
                    </p>
                </Card>

                <PrePostLnWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">5.2 Normalization & Gated SwiGLU FFN</h4>
                    <p className="text-slate-350 text-sm">
                        **RMSNorm** (Root Mean Square Normalization) simplifies standard LayerNorm by removing mean subtraction, leaving scaling computations:
                        <MathEquation formula="\\operatorname{RMSNorm}(\\mathbf{x}) = \\frac{\\mathbf{x}}{\\sqrt{\\frac{1}{d} \\sum_{i=1}^d x_i^2 + \\epsilon}} \\odot \\boldsymbol{\\gamma}" block />
                        This reduces FLOP overhead while matching normalization accuracy.
                    </p>
                    <p className="text-slate-350 text-sm">
                        Modern Feed-Forward networks use **SwiGLU** gating instead of simple ReLU:
                        <MathEquation formula="\\operatorname{FFN}_{\\text{SwiGLU}}(\\mathbf{x}) = \\left(\\operatorname{Swish}(\\mathbf{x}\\mathbf{W}_1) \\odot \\mathbf{x}\\mathbf{V}\\right)\\mathbf{W}_2" block />
                        where <MathEquation formula="\\operatorname{Swish}(a) = a \\cdot \\sigma(a)" />.
                    </p>

                    <h5 className="text-white font-semibold text-xs mt-2">FFN as Key-Value Memory Networks</h5>
                    <p className="text-slate-350 text-xs">
                        Geva et al. (2021) demonstrated that an FFN layer is equivalent to an associative key-value memory database.
                        In <MathEquation formula="\\mathbf{y} = \\mathbf{W}_2 \\operatorname{ReLU}(\\mathbf{W}_1 \\mathbf{x} + \\mathbf{b}_1)" />:
                        <br/>
                        - Each row of projection matrix <MathEquation formula="\\mathbf{W}_1" /> functions as a **key** vector representing an input pattern.
                        <br/>
                        - Each column of projection matrix <MathEquation formula="\\mathbf{W}_2" /> functions as a **value** vector representing a output concept.
                        <br/>
                        - When the input <MathEquation formula="\\mathbf{x}" /> aligns with key <MathEquation formula="i" />, its activation is high, writing the associated value vector directly into the residual stream.
                    </p>
                </Card>
            </section>

            {/* ─── SECTION 6 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<Eye size={22} className="text-emerald-400" />}>
                    Section 6: Encoder, Decoder, and Seq2Seq
                </SectionTitle>

                <Card className="space-y-4">
                    <p className="text-slate-350 text-sm">
                        Transformers are configured in three primary styles:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1.5">
                        <li>**Encoder-Only (BERT)**: Uses bidirectional self-attention. Excellent for extraction, classification, and sequence tagging.</li>
                        <li>**Decoder-Only (GPT)**: Uses causal masked self-attention. Excellent for generative autoregressive language modeling.</li>
                        <li>**Encoder-Decoder (T5, BART)**: The encoder processes inputs bidirectionally, and the decoder generates outputs causally, reading encoder outputs via cross-attention layers.</li>
                    </ul>
                </Card>

                <MaskMatrixWidget />
            </section>

            {/* ─── SECTION 7 ─────────────────────────────────────────── */}
            <section className="space-y-6">
                <SectionTitle icon={<BookOpen size={22} className="text-indigo-400" />}>
                    Section 7: Tokenization & Embeddings
                </SectionTitle>

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">7.1 Subword Tokenization Algorithms</h4>
                    <p className="text-slate-350 text-sm">
                        To process text, we segment words into subword tokens. This resolves Out-Of-Vocabulary (OOV) errors and balances vocabulary size <MathEquation formula="|V|" />.
                    </p>
                    <p className="text-slate-350 text-sm">
                        **Byte Pair Encoding (BPE)**: Initializes vocab with raw characters, then iteratively merges the most frequent adjacent byte/character pair.
                        <br/>
                        **Unigram LM**: Starts with a massive vocabulary and iteratively prunes low-probability tokens using an Expectation-Maximization (EM) loss objective:
                        <MathEquation formula="\\mathcal{L} = -\\sum_{x \\in \\mathcal{D}} \\log P(x)" block />
                    </p>
                </Card>

                <BpeTokenizerWidget />

                <Card className="space-y-4">
                    <h4 className="text-white font-bold text-md">7.2 Embedding Weight Tying</h4>
                    <p className="text-slate-350 text-sm">
                        In many language models, the token embedding matrix <MathEquation formula="\\mathbf{W}_E \\in \\mathbb{R}^{|V| \\times d_{\\text{model}}}" /> and output unembedding matrix <MathEquation formula="\\mathbf{W}_U \\in \\mathbb{R}^{|V| \\times d_{\\text{model}}}" /> share parameters:
                        <MathEquation formula="\\mathbf{W}_U = \\mathbf{W}_E" block />
                        This reduces parameter overhead by <MathEquation formula="|V| \\times d_{\\text{model}}" />, preventing output projections from overfitting on rare tokens.
                    </p>
                </Card>
            </section>

            {/* ─── PYTORCH CODEBOX ───────────────────────────────────── */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <Terminal size={20} className="text-indigo-400" />
                    Part 2 Reference PyTorch Implementations
                </h4>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
{`import torch
import torch.nn as nn

class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.gamma = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        # x: [Batch, Seq_Len, Dim]
        variance = x.pow(2).mean(-1, keepdim=True)
        return x * torch.rsqrt(variance + self.eps) * self.gamma


class SwiGLUFFN(nn.Module):
    def __init__(self, d_model: int, d_ff: int):
        super().__init__()
        self.w1 = nn.Linear(d_model, d_ff, bias=False)
        self.v = nn.Linear(d_model, d_ff, bias=False)
        self.w2 = nn.Linear(d_ff, d_model, bias=False)

    def forward(self, x):
        # x: [Batch, Seq_Len, d_model]
        # Swish(x * W1) * (x * V) projected back through W2
        return self.w2(F.silu(self.w1(x)) * self.v(x))


class PreLNTransformerBlock(nn.Module):
    def __init__(self, d_model: int, n_heads: int, d_ff: int):
        super().__init__()
        self.norm1 = RMSNorm(d_model)
        self.attn = CustomMultiHeadAttention(d_model, n_heads)
        self.norm2 = RMSNorm(d_model)
        self.ffn = SwiGLUFFN(d_model, d_ff)

    def forward(self, x, mask=None):
        # 1. Attention residual path
        x = x + self.attn(self.norm1(x), self.norm1(x), self.norm1(x), mask)[0]
        # 2. FFN residual path
        x = x + self.ffn(self.norm2(x))
        return x`}
                </pre>
            </section>
        </div>
    );
};
