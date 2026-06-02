import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, BookOpen, Layers, Zap, GitPullRequest } from 'lucide-react';
import { MathEquation } from '../../../components/MathEquation';
import { SectionTitle, Card, Callout } from '../../../components/SectionElements';

export const Theory: React.FC = () => {
    return (
        <div className="space-y-12 text-slate-300 leading-relaxed font-sans pb-16">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-2 text-violet-400">
                    <Cpu size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Application Module</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-500">
                    Transformers & Generative Systems
                </h1>
                <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
                    Explore the self-attention revolution that unified natural language processing, vision, and reasoning. 
                    Derive parallel attention mechanisms, compare architectural paradigms, and analyze production-grade optimizations.
                </p>
            </motion.div>

            {/* Section 1: The Core Attention Paradigm */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
            >
                <SectionTitle icon={<BookOpen size={20} className="text-violet-400" />} color="#8b5cf6">
                    The Self-Attention Mechanism
                </SectionTitle>

                <Card className="space-y-6">
                    <Callout variant="intuition" title="The Filing Cabinet Index Analogy">
                        If you are searching for a specific receipt in a stack, an **RNN** acts like scanning every piece of paper one-by-one from top to bottom. If the stack is deep, you lose track of the beginning pages.
                        A **Transformer** acts like a filing cabinet index. You hold a search **Query** (what you want), match it against folder **Keys** (index tags) in parallel, and directly pull out the folder **Values** (data contents) in a single step.
                    </Callout>

                    <p>
                        Recurrent layers enforce a strict sequential dependency: step <MathEquation formula="t" /> cannot compile until hidden state <MathEquation formula="h_{t-1}" /> is fully computed. This prevents GPU parallelization during training. 
                        Self-Attention bypasses temporal pathways, allowing every token to communicate directly with every other token in the sequence in a single parallel operation.
                    </p>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                        <span className="text-xs text-slate-400 font-mono block">Scaled Dot-Product Attention Equation:</span>
                        <MathEquation formula={String.raw`\operatorname{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \operatorname{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}}\right)\mathbf{V}`} block />
                        <p className="text-xs text-slate-500 font-sans mt-2">
                            Where <MathEquation formula="\mathbf{Q}" /> is the Query matrix, <MathEquation formula="\mathbf{K}" /> is the Key matrix, and <MathEquation formula="\mathbf{V}" /> is the Value matrix. The scaling factor <MathEquation formula="1/\sqrt{d_k}" /> prevents dot products from growing excessively large in magnitude, which would push the softmax function into regions with extremely small gradients.
                        </p>
                    </div>

                    <p>
                        In a full model, we project queries, keys, and values <MathEquation formula="h" /> times using different learned projection matrices, computing attention in parallel over these distinct subspaces. This is **Multi-Head Attention (MHA)**, allowing the model to simultaneously attend to different aspects (e.g., grammar, syntax, reference resolution) of the sequence.
                    </p>
                </Card>
            </motion.section>

            {/* Section 2: Architectural Taxonomies */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-6"
            >
                <SectionTitle icon={<Layers size={20} className="text-violet-400" />} color="#8b5cf6">
                    Architectural Taxonomies
                </SectionTitle>

                <Card className="space-y-6">
                    <p>
                        Depending on how attention blocks are connected and masked, transformers are categorized into three main archetypes:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/80 space-y-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                ENCODER-ONLY (Bidirectional)
                            </span>
                            <h4 className="text-white font-bold text-base">Context Understanding</h4>
                            <p className="text-xs text-slate-400">
                                Tokens attend to all other tokens in both directions. Ideal for feature extraction, classification, and sequence tagging.
                            </p>
                            <div className="text-[11px] text-slate-500 font-mono">
                                <strong>Masking:</strong> None (Full Grid)<br />
                                <strong>Example:</strong> BERT, RoBERTa
                            </div>
                        </div>

                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/80 space-y-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                DECODER-ONLY (Causal)
                            </span>
                            <h4 className="text-white font-bold text-base">Autoregressive Generation</h4>
                            <p className="text-xs text-slate-400">
                                Tokens are masked from attending to future tokens. Ideal for text generation, conversational systems, and instruction-following.
                            </p>
                            <div className="text-[11px] text-slate-500 font-mono">
                                <strong>Masking:</strong> Lower-Triangular Causal<br />
                                <strong>Example:</strong> GPT series, LLaMA, Mistral
                            </div>
                        </div>

                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/80 space-y-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                ENCODER-DECODER (Seq2Seq)
                            </span>
                            <h4 className="text-white font-bold text-base">Translation & Mapping</h4>
                            <p className="text-xs text-slate-400">
                                An encoder processes the input source, and a decoder auto-regressively generates target tokens using cross-attention.
                            </p>
                            <div className="text-[11px] text-slate-500 font-mono">
                                <strong>Masking:</strong> Causal in Decoder only<br />
                                <strong>Example:</strong> T5, BART, Original Vaswani
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* Section 3: Modern Sub-Components */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
            >
                <SectionTitle icon={<Zap size={20} className="text-violet-400" />} color="#8b5cf6">
                    Normalization, Gating & Position
                </SectionTitle>

                <Card className="space-y-6">
                    <p>
                        Modern LLMs have evolved from the original 2017 design, substituting specific components to stabilize deep training and improve representation capabilities:
                    </p>

                    <div className="space-y-4">
                        <div className="border-l-2 border-violet-500/50 pl-4 space-y-2">
                            <h4 className="text-white font-semibold">Pre-LN vs Post-LN Architecture</h4>
                            <p className="text-sm text-slate-400">
                                Original transformers placed LayerNorm after residual additions. Modern models use **Pre-LN** (LayerNorm on the input branches of blocks). This creates a clean identity highway, allowing gradients to flow back unaltered and eliminating the strict need for learning rate warm-ups.
                            </p>
                        </div>

                        <div className="border-l-2 border-emerald-500/50 pl-4 space-y-2">
                            <h4 className="text-white font-semibold">Rotary Position Embeddings (RoPE)</h4>
                            <p className="text-sm text-slate-400">
                                Instead of adding absolute positional vectors, **RoPE** applies orthogonal rotation matrices to 2D slices of the query and key vectors. The attention dot product depends entirely on the relative distance <MathEquation formula="m-n" /> between tokens, allowing models to generalize to longer context windows.
                            </p>
                        </div>

                        <div className="border-l-2 border-orange-500/50 pl-4 space-y-2">
                            <h4 className="text-white font-semibold">RMSNorm & SwiGLU Gated MLPs</h4>
                            <p className="text-sm text-slate-400">
                                Standard LayerNorm computes mean and variance; **RMSNorm** simplifies this by scaling only by the Root Mean Square, saving compute. Additionally, standard MLPs are replaced by **SwiGLU** (Swish Gated Linear Units), which perform element-wise gating to represent complex operations.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* Section 4: Production Scale Optimizations */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-6"
            >
                <SectionTitle icon={<GitPullRequest size={20} className="text-violet-400" />} color="#8b5cf6">
                    Frontier Optimizations at Scale
                </SectionTitle>

                <Card className="space-y-6">
                    <p>
                        Training and deploying models with billions of parameters requires specialized hardware-aware optimizations to overcome memory bandwidth bottlenecks:
                    </p>

                    <div className="space-y-6">
                        {/* GQA */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-3">
                            <h4 className="text-white font-bold">1. Grouped-Query Attention (GQA)</h4>
                            <p className="text-sm text-slate-400">
                                Autoregressive generation caches keys and values to avoid re-computation (KV Cache). However, the KV cache scales with sequence length and batch size, dominating GPU memory. 
                                **GQA** groups multiple query heads to share a single key-value head, drastically reducing memory bandwidth during inference while retaining performance.
                            </p>
                        </div>

                        {/* FlashAttention */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                            <h4 className="text-white font-bold">2. FlashAttention (IO-Aware Tiling)</h4>
                            <p className="text-sm text-slate-400">
                                Standard attention writes the intermediate $N \times N$ attention matrix to slow High Bandwidth Memory (HBM). **FlashAttention** computes softmax incrementally by dividing keys and queries into blocks, loading them into fast SRAM, computing attention, and updating the output without materializing the full matrix.
                            </p>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 space-y-3">
                                <span className="text-xs text-violet-400 font-mono font-bold block">Online Softmax Update Mathematics</span>
                                <p className="text-xs text-slate-400">
                                    To compute attention block-by-block without global communication, FlashAttention tracks running row-wise maximums <MathEquation formula="m_i" /> and scaling denominators <MathEquation formula="d_i" />. When combining a current block state with a new block segment (denoted with tildes <MathEquation formula="\tilde{m}_i" />, <MathEquation formula="\tilde{d}_i" />, and <MathEquation formula="\tilde{O}_i" />), the parameters update as follows:
                                </p>
                                <div className="space-y-2.5 pt-1">
                                    <div className="text-[11px] font-mono text-slate-350">
                                        <span className="text-slate-500 font-bold block">1. Update Row Max:</span>
                                        <MathEquation formula="m_i^{\text{new}} = \max(m_i, \tilde{m}_i)" block />
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-350">
                                        <span className="text-slate-500 font-bold block">2. Update Normalizing Denominator:</span>
                                        <MathEquation formula="d_i^{\text{new}} = d_i e^{m_i - m_i^{\text{new}}} + \tilde{d}_i e^{\tilde{m}_i - m_i^{\text{new}}}" block />
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-350">
                                        <span className="text-slate-500 font-bold block">3. Update Output Accumulator:</span>
                                        <MathEquation formula="O_i^{\text{new}} = \operatorname{diag}\left(e^{m_i - m_i^{\text{new}}}\right) O_i + e^{\tilde{m}_i - m_i^{\text{new}}} \tilde{P}_i V_i" block />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MoE */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                            <h4 className="text-white font-bold">3. Mixture of Experts (MoE)</h4>
                            <p className="text-sm text-slate-400">
                                Scaling dense networks increases computational cost per token. **MoE** replaces feed-forward layers with a set of independent "experts". An active routing gate directs each token to only one or two experts, allowing models to scale to trillions of parameters while keeping active FLOPs per token constant.
                            </p>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 space-y-3">
                                <span className="text-xs text-violet-400 font-mono font-bold block">Differentiable Load Balancing Loss</span>
                                <p className="text-xs text-slate-400">
                                    Without constraints, routing gates often collapse to a few popular experts. To ensure balanced routing across <MathEquation formula="N" /> experts for a batch of <MathEquation formula="T" /> tokens, models optimize an auxiliary load balancing loss:
                                </p>
                                <MathEquation formula="L_{\text{bal}} = N \sum_{i=1}^N f_i \cdot P_i" block />
                                <div className="space-y-1.5 text-[11px] font-sans text-slate-450 leading-relaxed">
                                    <p>
                                        Where <MathEquation formula="f_i" /> is the actual fraction of tokens routed to expert <MathEquation formula="i" />:
                                        <MathEquation formula="f_i = \frac{1}{T} \sum_{t=1}^T \mathbb{I}(\text{Expert } i \text{ is selected for token } t)" block />
                                    </p>
                                    <p>
                                        And <MathEquation formula="P_i" /> is the average gating probability assigned to expert <MathEquation formula="i" /> across the batch:
                                        <MathEquation formula="P_i = \frac{1}{T} \sum_{t=1}^T G(x_t)_i" block />
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PagedAttention */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                            <h4 className="text-white font-bold">4. PagedAttention (vLLM)</h4>
                            <p className="text-sm text-slate-400">
                                In standard decoding, KV cache memory is allocated contiguously. Because sequence lengths are unpredictable, this leads to severe memory fragmentation. **PagedAttention** borrows OS-level virtual memory paging: it divides the KV cache into non-contiguous blocks. This enables continuous batching and nearly zero waste.
                            </p>
                        </div>

                        {/* Speculative Decoding */}
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                            <h4 className="text-white font-bold">5. Speculative Decoding</h4>
                            <p className="text-sm text-slate-400">
                                Generation is memory-bandwidth bound, meaning the large model under-utilizes GPU compute cores while waiting for weights to load. **Speculative Decoding** uses a tiny, fast "draft" model to propose multiple tokens at once, and the large model evaluates all proposed tokens in a single parallel forward pass, accepting them via a verification tree.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* Section 5: Context Extension & Fine-Tuning */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
            >
                <SectionTitle icon={<Layers size={20} className="text-violet-400" />} color="#8b5cf6">
                    Context Extension & PEFT
                </SectionTitle>

                <Card className="space-y-6">
                    <p>
                        Extending model capabilities post-training requires careful manipulation of parameters and positional embeddings to avoid catastrophic forgetting:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/80 space-y-3">
                            <h4 className="text-white font-bold text-base">RoPE Context Scaling (YaRN)</h4>
                            <p className="text-xs text-slate-400">
                                If a model trained on 4k context sees 8k tokens, unseen high-frequency RoPE rotations cause failures. Instead of naive interpolation, modern scaling (like YaRN) mathematically alters the rotation frequencies of lower dimensions to "squeeze" larger contexts into the known dimensional space.
                            </p>
                        </div>

                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/80 space-y-3">
                            <h4 className="text-white font-bold text-base">LoRA (Low-Rank Adaptation)</h4>
                            <p className="text-xs text-slate-400">
                                Freezes the massive pre-trained weights <MathEquation formula="W_0" /> and injects trainable rank decomposition matrices <MathEquation formula="A" /> and <MathEquation formula="B" />. The forward pass becomes <MathEquation formula="h = W_0 x + \Delta W x = W_0 x + B A x" />. This reduces trainable parameters by 10,000x while maintaining near-full-parameter performance.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* Section 6: Alignment & Beyond Attention */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-6"
            >
                <SectionTitle icon={<BookOpen size={20} className="text-violet-400" />} color="#8b5cf6">
                    Alignment & Alternative Architectures
                </SectionTitle>

                <Card className="space-y-6">
                    <div className="space-y-6">
                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                            <h4 className="text-white font-bold">Direct Preference Optimization (DPO)</h4>
                            <p className="text-sm text-slate-400">
                                RLHF relies on a complex pipeline involving a Reward Model and PPO optimization, which is unstable and memory-intensive. **DPO** bypasses the reward model entirely by formulating the language model itself as the reward model, directly optimizing on human preference pairs:
                            </p>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 overflow-x-auto">
                                <MathEquation formula="L_{\text{DPO}} = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w | x)}{\pi_{\text{ref}}(y_w | x)} - \beta \log \frac{\pi_\theta(y_l | x)}{\pi_{\text{ref}}(y_l | x)} \right) \right]" block />
                            </div>
                        </div>

                        <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 space-y-4">
                            <h4 className="text-white font-bold">State Space Models (SSMs) & Mamba</h4>
                            <p className="text-sm text-slate-400">
                                Attention scales quadratically <MathEquation formula="O(N^2)" />. **State Space Models (like Mamba)** return to recurrent architectures but with hardware-aware parallel scans and selective state updates. They achieve linear <MathEquation formula="O(N)" /> scaling, unbounded context lengths, and 5x faster inference, forming the basis for new hybrid models like Jamba.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.section>
        </div>
    );
};
