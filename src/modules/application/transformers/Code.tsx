import React, { useState } from 'react';
import { Terminal, Cpu, Play, CheckCircle } from 'lucide-react';

export const Code: React.FC = () => {
    return (
        <div className="space-y-8 text-slate-300 font-sans pb-16">
            {/* Shape Calculator */}
            <ShapeCalculator />

            {/* Mock Forward Pass Runtime */}
            <MockRuntime />

            {/* PyTorch Code Reference */}
            <PyTorchReference />
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENT 1: Tensor Shape & Parameter Calculator
   ═══════════════════════════════════════════════════════════════════════ */

const ShapeCalculator: React.FC = () => {
    const [batchSize, setBatchSize] = useState<number>(8);
    const [seqLen, setSeqLen] = useState<number>(512);
    const [dModel, setDModel] = useState<number>(1024);
    const [heads, setHeads] = useState<number>(16);
    const [dFf, setDFf] = useState<number>(4096);

    // Enforce valid head count
    const dK = Math.floor(dModel / heads);
    const isValidHeads = dModel % heads === 0;

    // Weight counts
    // 3 for Q, K, V projections + 1 for Output Projection
    const mhaParams = 4 * dModel * dModel;
    // LLaMA SwiGLU has 3 projections: W_gate, W_down, W_up
    const mlpParams = 3 * dModel * dFf;
    const normParams = 2 * dModel; // RMSNorm parameters (MHA + MLP)
    const totalBlockParams = mhaParams + mlpParams + normParams;

    // KV Cache Memory: 2 (Keys, Values) * batch * seqLen * dModel * 2 bytes (FP16)
    const kvCacheBytes = 2 * batchSize * seqLen * dModel * 2;
    const kvCacheMB = kvCacheBytes / (1024 * 1024);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="text-violet-400" size={18} />
                    Tensor Shapes & Parameter Calculator
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Adjust the architectural hyper-parameters of a single Transformer Decoder Block. 
                    Compute weight counts and trace the live KV cache footprint required for inference.
                </p>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* Batch Size */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold font-sans">
                            <span className="text-slate-450">Batch Size (B)</span>
                            <span className="text-violet-400 font-mono">B = {batchSize}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="64"
                            value={batchSize}
                            onChange={e => setBatchSize(parseInt(e.target.value))}
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>

                    {/* Sequence Length */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold font-sans">
                            <span className="text-slate-450">Sequence Length (S)</span>
                            <span className="text-violet-400 font-mono">S = {seqLen}</span>
                        </div>
                        <input
                            type="range"
                            min="64"
                            max="4096"
                            step="64"
                            value={seqLen}
                            onChange={e => setSeqLen(parseInt(e.target.value))}
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>

                    {/* Model Dimension */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold font-sans">
                            <span className="text-slate-450">Model Dimension (d_model)</span>
                            <span className="text-violet-400 font-mono">d_model = {dModel}</span>
                        </div>
                        <input
                            type="range"
                            min="128"
                            max="4096"
                            step="128"
                            value={dModel}
                            onChange={e => setDModel(parseInt(e.target.value))}
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Attention Heads */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold font-sans">
                            <span className="text-slate-450">Attention Heads (h)</span>
                            <span className="text-violet-400 font-mono">h = {heads}</span>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max="64"
                            step="2"
                            value={heads}
                            onChange={e => setHeads(parseInt(e.target.value))}
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>

                    {/* MLP Dimension */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold font-sans">
                            <span className="text-slate-450">SwiGLU MLP Dimension (d_ff)</span>
                            <span className="text-violet-400 font-mono">d_ff = {dFf}</span>
                        </div>
                        <input
                            type="range"
                            min="512"
                            max="16384"
                            step="512"
                            value={dFf}
                            onChange={e => setDFf(parseInt(e.target.value))}
                            className="w-full accent-violet-500 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                    </div>

                    {/* Divider Check */}
                    <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Head Dimension (d_k):</span>
                        {isValidHeads ? (
                            <span className="text-emerald-400 font-bold">{dK}</span>
                        ) : (
                            <span className="text-amber-500 font-bold">
                                {dK} <span className="text-[9px] text-slate-500">(Not divisible!)</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Calculations Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Shapes list */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5 font-mono text-[10px]">
                    <span className="text-slate-500 font-bold block mb-1 text-[9px] uppercase tracking-wider">Active Tensor Shapes</span>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Embedding matrix:</span>
                        <span className="text-white">[{batchSize}, {seqLen}, {dModel}]</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Projection Heads:</span>
                        <span className="text-white">[{batchSize}, {heads}, {seqLen}, {dK}]</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Attention Scores:</span>
                        <span className="text-white">[{batchSize}, {heads}, {seqLen}, {seqLen}]</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">MLP intermediate:</span>
                        <span className="text-white">[{batchSize}, {seqLen}, {dFf}]</span>
                    </div>
                </div>

                {/* Parameters count */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5 font-mono text-[10px]">
                    <span className="text-slate-500 font-bold block mb-1 text-[9px] uppercase tracking-wider">Weight Parameters (1 Block)</span>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Attention Blocks:</span>
                        <span className="text-white">{(mhaParams / 1e6).toFixed(2)} M</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">SwiGLU MLP:</span>
                        <span className="text-white">{(mlpParams / 1e6).toFixed(2)} M</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-2 font-bold">
                        <span className="text-slate-300">Total Block Params:</span>
                        <span className="text-violet-400">{(totalBlockParams / 1e6).toFixed(2)} M</span>
                    </div>
                </div>

                {/* KV Cache size */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5 font-mono text-[10px]">
                    <span className="text-slate-500 font-bold block mb-1 text-[9px] uppercase tracking-wider">Inference Memory Cost</span>
                    <div className="flex justify-between">
                        <span className="text-slate-400">KV Cache per Token:</span>
                        <span className="text-white">{(2 * dModel * 2).toLocaleString()} bytes</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Batch KV Cache:</span>
                        <span className="text-white">{(kvCacheBytes / 1024).toFixed(0)} KB</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-2 font-bold">
                        <span className="text-slate-300">Total Cache RAM:</span>
                        <span className="text-orange-400">{kvCacheMB.toFixed(2)} MB</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENT 2: Interactive JavaScript Attention Runtime
   ═══════════════════════════════════════════════════════════════════════ */

const MockRuntime: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [attentionProbs, setAttentionProbs] = useState<number[][] | null>(null);

    const executeForwardPass = () => {
        const outLogs: string[] = [];
        outLogs.push("[RUNNER] Initializing 3-token mock sequence forward pass...");
        outLogs.push("[RUNNER] Inputs embedding tensor initialized with shape [S=3, d_model=4]");

        // Mock inputs (3 tokens, 4 embedding dim)
        const X = [
            [1.0, 0.5, -0.2, 0.1], // THE
            [0.2, 1.2, 0.8, -0.5], // CAT
            [0.8, 0.4, 1.5, 0.3]   // SAT
        ];

        // Mock Q, K weight projection matrices (4 x 4)
        const W_q = [
            [0.5, 0.1, -0.2, 0.8],
            [0.2, 0.9, 0.3, -0.1],
            [-0.1, 0.4, 0.6, 0.5],
            [0.3, -0.2, 0.5, 0.7]
        ];

        const W_k = [
            [0.4, 0.2, 0.1, 0.9],
            [0.1, 0.8, -0.3, 0.2],
            [0.6, 0.5, 0.4, -0.1],
            [-0.2, 0.3, 0.7, 0.6]
        ];

        outLogs.push("[RUNNER] Computing Query projection: Q = X * W_q");
        // Q = X * W_q (shape: 3 x 4)
        const Q = Array(3).fill(0).map(() => Array(4).fill(0));
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                let val = 0;
                for (let k = 0; k < 4; k++) {
                    val += X[i][k] * W_q[k][j];
                }
                Q[i][j] = val;
            }
        }
        outLogs.push(`[RUNNER] Projected Q computed. Shape: [3, 4]. Sample row: [${Q[0].map(v => v.toFixed(2)).join(', ')}]`);

        outLogs.push("[RUNNER] Computing Key projection: K = X * W_k");
        // K = X * W_k (shape: 3 x 4)
        const K = Array(3).fill(0).map(() => Array(4).fill(0));
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                let val = 0;
                for (let k = 0; k < 4; k++) {
                    val += X[i][k] * W_k[k][j];
                }
                K[i][j] = val;
            }
        }
        outLogs.push(`[RUNNER] Projected K computed. Shape: [3, 4]. Sample row: [${K[0].map(v => v.toFixed(2)).join(', ')}]`);

        outLogs.push("[RUNNER] Computing similarity dot products (Scores = Q * K^T)");
        // Scores = Q * K^T (shape: 3 x 3)
        const scores = Array(3).fill(0).map(() => Array(3).fill(0));
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let val = 0;
                for (let k = 0; k < 4; k++) {
                    val += Q[i][k] * K[j][k];
                }
                scores[i][j] = val;
            }
        }

        outLogs.push("[RUNNER] Scaling dot products by 1/sqrt(d_k) where d_k = 4");
        // Scale by sqrt(4) = 2
        const scaledScores = scores.map(row => row.map(v => v / 2));

        outLogs.push("[RUNNER] Applying Softmax row-wise to retrieve probabilities");
        // Softmax
        const probs: number[][] = [];
        for (let i = 0; i < 3; i++) {
            const exps = scaledScores[i].map(v => Math.exp(v));
            const sumExp = exps.reduce((a, b) => a + b, 0);
            probs.push(exps.map(e => e / sumExp));
        }

        outLogs.push(`[RUNNER] Attention probability matrix fully compiled!`);
        outLogs.push("[RUNNER] Forward pass simulation completed successfully.");

        setLogs(outLogs);
        setAttentionProbs(probs);
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Terminal className="text-violet-400" size={16} />
                        Interactive JS Forward Pass Runtime
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Run a mock Javascript matrix multiplication to calculate self-attention probabilities for a 3-token sequence.
                    </p>
                </div>
                <button
                    onClick={executeForwardPass}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-550 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                >
                    <Play size={12} /> Execute Forward Pass
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Console Log */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2 h-44 overflow-y-auto scrollbar-hide font-mono text-[9px] text-slate-400">
                    <span className="text-slate-600 font-bold block mb-1 uppercase tracking-wider border-b border-slate-900 pb-1">Console Output Logs</span>
                    {logs.length === 0 ? (
                        <div className="text-slate-700 italic flex items-center h-28 justify-center">Click "Execute Forward Pass" to trace tensor logs...</div>
                    ) : (
                        logs.map((log, idx) => (
                            <div key={idx} className={log.includes("[RUNNER]") ? 'text-violet-400' : 'text-slate-300'}>
                                {log}
                            </div>
                        ))
                    )}
                </div>

                {/* Probabilities Output */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex flex-col justify-between h-44 font-mono text-[9px] text-slate-400">
                    <div>
                        <span className="text-slate-600 font-bold block mb-2 uppercase tracking-wider border-b border-slate-900 pb-1">Resulting Attention Matrix (%)</span>
                        {attentionProbs === null ? (
                            <div className="text-slate-700 italic flex items-center h-24 justify-center">Execution results pending...</div>
                        ) : (
                            <div className="space-y-1.5 mt-2">
                                {["THE", "CAT", "SAT"].map((tk, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-12 text-slate-500 font-bold">{tk}:</span>
                                        <div className="flex-1 flex gap-2">
                                            {attentionProbs[idx].map((prob, jdx) => (
                                                <div key={jdx} className="flex-1 bg-slate-900 p-1 rounded border border-slate-800 text-center font-bold text-white flex items-center justify-between px-2">
                                                    <span className="text-slate-650">to t_{jdx}:</span>
                                                    <span className="text-violet-400">{(prob * 100).toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {attentionProbs !== null && (
                        <span className="text-[8px] text-slate-600 block text-right mt-1">* Rows sum to 100% (Softmax property verified!)</span>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENT 3: PyTorch Reference code Blocks
   ═══════════════════════════════════════════════════════════════════════ */

const PyTorchReference: React.FC = () => {
    const [codeTab, setCodeTab] = useState<'mha' | 'rope' | 'rmsnorm' | 'swiglu' | 'moe' | 'decoder' | 'lora' | 'dpo'>('mha');

    const snippets = {
        mha: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadAttention(nn.Module):
    """
    Standard scaled dot-product attention block with subspace heads projection.
    """
    def __init__(self, d_model: int, n_heads: int, dropout: float = 0.1):
        super().__init__()
        assert d_model % n_heads == 0, "d_model must be divisible by n_heads"
        
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        # Combined projection for optimization
        self.qkv_projection = nn.Linear(d_model, 3 * d_model, bias=False)
        self.out_projection = nn.Linear(d_model, d_model, bias=False)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        # Input shape: [Batch_Size (B), Seq_Len (S), d_model (D)]
        B, S, D = x.shape
        
        # 1. Project Q, K, V simultaneously: [B, S, 3*D]
        qkv = self.qkv_projection(x)
        
        # Reshape to [B, S, 3, h, d_k] -> transpose to [3, B, h, S, d_k]
        q, k, v = qkv.view(B, S, 3, self.n_heads, self.d_k).permute(2, 0, 3, 1, 4)
        
        # 2. Scaled Dot Product attention: [B, h, S, S]
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            # Apply causal triangular mask
            scores = scores.masked_fill(mask == 0, -1e9)
            
        attn_probs = F.softmax(scores, dim=-1)
        attn_probs = self.dropout(attn_probs)
        
        # 3. Aggregate values: [B, h, S, d_k]
        context = torch.matmul(attn_probs, v)
        
        # 4. Concatenate heads & project back: [B, S, D]
        context = context.transpose(1, 2).contiguous().view(B, S, D)
        return self.out_projection(context)`,
        
        rope: `import torch
import torch.nn as nn

class RotaryPositionEmbedding(nn.Module):
    """
    Implements Rotary Position Embeddings (RoPE) as used in LLaMA.
    """
    def __init__(self, dim: int, max_seq_len: int = 4096, theta: float = 10000.0):
        super().__init__()
        # dim: dimension of key/query head
        self.dim = dim
        
        # Compute rotary frequencies: theta^(-2(i-1)/dim)
        inv_freq = 1.0 / (theta ** (torch.arange(0, dim, 2).float() / dim))
        self.register_buffer("inv_freq", inv_freq, persistent=False)
        
        # Precompute frequencies for coordinate rotation
        t = torch.arange(max_seq_len, dtype=torch.float32)
        freqs = torch.outer(t, self.inv_freq)
        
        # Stack values: [cos, sin]
        emb = torch.cat((freqs, freqs), dim=-1)
        self.register_buffer("cos_cached", emb.cos(), persistent=False)
        self.register_buffer("sin_cached", emb.sin(), persistent=False)
 
    def rotate_half(self, x: torch.Tensor) -> torch.Tensor:
        # Split vector features and swap signs to implement complex rotation
        x1 = x[..., :self.dim // 2]
        x2 = x[..., self.dim // 2:]
        return torch.cat((-x2, x1), dim=-1)

    def forward(self, q: torch.Tensor, k: torch.Tensor, seq_len: int) -> tuple:
        # q, k shape: [B, h, S, d_k]
        cos = self.cos_cached[:seq_len, None, :] # [S, 1, d_k]
        sin = self.sin_cached[:seq_len, None, :] # [S, 1, d_k]
        
        # Transpose to align dimensions: [S, B, h, d_k]
        q_rot = (q.transpose(0, 2) * cos) + (self.rotate_half(q.transpose(0, 2)) * sin)
        k_rot = (k.transpose(0, 2) * cos) + (self.rotate_half(k.transpose(0, 2)) * sin)
        
        return q_rot.transpose(0, 2), k_rot.transpose(0, 2)`,

        rmsnorm: `import torch
import torch.nn as nn

class RMSNorm(nn.Module):
    """
    Root Mean Square Normalization (saves computational variance scaling).
    Used in LLaMA models to stabilize training instead of LayerNorm.
    """
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Compute root mean square variance over embedding dimension
        variance = x.pow(2).mean(-1, keepdim=True)
        # Apply inverse square root scaling with scale weight
        return x * torch.rsqrt(variance + self.eps) * self.weight`,

        swiglu: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SwiGLUMLP(nn.Module):
    """
    Swish Gated Linear Unit used in modern Transformer feed-forward networks (e.g. LLaMA).
    Replaces standard two-layer MLP with a gated mechanism.
    """
    def __init__(self, d_model: int, d_ff: int):
        super().__init__()
        # w1 projects to gate dimension, w3 projects to values dimension
        self.w1 = nn.Linear(d_model, d_ff, bias=False)
        self.w3 = nn.Linear(d_model, d_ff, bias=False)
        # w2 projects back to original model dimension
        self.w2 = nn.Linear(d_ff, d_model, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # silu(w1(x)) performs Swish gating on w3(x) before projection back
        return self.w2(F.silu(self.w1(x)) * self.w3(x))`,

        moe: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SparseMoEGating(nn.Module):
    """
    Top-2 Sparse Mixture of Experts (MoE) Gating layer.
    Routes tokens to top-2 experts and computes auxiliary load balancing loss.
    """
    def __init__(self, d_model: int, num_experts: int):
        super().__init__()
        self.num_experts = num_experts
        # Gating network weights projecting to experts
        self.gate = nn.Linear(d_model, num_experts, bias=False)

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        # Input shape: [Tokens (T), d_model (D)]
        T, D = x.shape
        logits = self.gate(x)
        
        if self.training:
            # Add routing noise for exploration during training
            noise = torch.randn_like(logits) * (1.0 / self.num_experts)
            logits = logits + noise
            
        gate_probs = F.softmax(logits, dim=-1) # [T, num_experts]
        
        # Select top-2 experts
        top2_probs, top2_indices = torch.topk(gate_probs, k=2, dim=-1) # [T, 2]
        
        # Normalize top-2 probabilities to sum to 1
        top2_probs = top2_probs / top2_probs.sum(dim=-1, keepdim=True)
        
        # Compute load balancing loss metrics
        top1_indices = top2_indices[:, 0]
        f = torch.zeros(self.num_experts, device=x.device)
        f.scatter_add_(0, top1_indices, torch.ones_like(top1_indices, dtype=torch.float32))
        f = f / T
        
        P = gate_probs.mean(dim=0)
        aux_loss = self.num_experts * torch.sum(f * P)
        
        return top2_probs, top2_indices, aux_loss

class SparseMoELayer(nn.Module):
    """
    Full Sparse MoE layer swapping standard MLP with Experts.
    """
    def __init__(self, d_model: int, d_ff: int, num_experts: int):
        super().__init__()
        self.gating = SparseMoEGating(d_model, num_experts)
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(d_model, d_ff, bias=False),
                nn.SiLU(),
                nn.Linear(d_ff, d_model, bias=False)
            ) for _ in range(num_experts)
        ])

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        orig_shape = x.shape
        x_flat = x.view(-1, orig_shape[-1])
        T, D = x_flat.shape
        
        top2_probs, top2_indices, aux_loss = self.gating(x_flat)
        out = torch.zeros_like(x_flat)
        
        # Process active tokens in batches per expert
        for expert_id, expert in enumerate(self.experts):
            mask = (top2_indices == expert_id)
            token_indices, expert_ranks = torch.where(mask)
            
            if len(token_indices) > 0:
                tokens = x_flat[token_indices]
                expert_out = expert(tokens)
                scaled_out = expert_out * top2_probs[token_indices, expert_ranks].unsqueeze(-1)
                out.index_add_(0, token_indices, scaled_out)
                
        return out.view(*orig_shape), aux_loss`,
        
        decoder: `import torch
import torch.nn as nn

class RMSNorm(nn.Module):
    """
    Root Mean Square Normalization (saves computational variance scaling).
    """
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        variance = x.pow(2).mean(-1, keepdim=True)
        return x * torch.rsqrt(variance + self.eps) * self.weight

class SwiGLUMLP(nn.Module):
    """
    Swish Gated Linear Unit used in modern Transformer feed-forwards.
    """
    def __init__(self, d_model: int, d_ff: int):
        super().__init__()
        self.w1 = nn.Linear(d_model, d_ff, bias=False)
        self.w2 = nn.Linear(d_ff, d_model, bias=False)
        self.w3 = nn.Linear(d_model, d_ff, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Gated Swish activation multiplication
        return self.w2(torch.nn.functional.silu(self.w1(x)) * self.w3(x))

class LLaMADecoderBlock(nn.Module):
    """
    Full Decoder block implementing Pre-LN, RMSNorm, SwiGLU, and Attention.
    """
    def __init__(self, d_model: int, n_heads: int, d_ff: int):
        super().__init__()
        self.attn_norm = RMSNorm(d_model)
        self.attention = MultiHeadAttention(d_model, n_heads)
        
        self.ffn_norm = RMSNorm(d_model)
        self.feed_forward = SwiGLUMLP(d_model, d_ff)

    def forward(self, x: torch.Tensor, mask: torch.Tensor = None) -> torch.Tensor:
        # 1. Pre-LN Self Attention Highway
        x = x + self.attention(self.attn_norm(x), mask=mask)
        
        # 2. Pre-LN Feed Forward Highway
        x = x + self.feed_forward(self.ffn_norm(x))
        return x`,

        lora: `import torch
import torch.nn as nn
import math

class LoRALinear(nn.Module):
    """
    Low-Rank Adaptation (LoRA) for linear layers.
    Freezes the pretrained weight and injects trainable rank decomposition matrices.
    """
    def __init__(self, in_features: int, out_features: int, rank: int = 8, alpha: float = 16.0):
        super().__init__()
        self.linear = nn.Linear(in_features, out_features, bias=False)
        self.linear.weight.requires_grad = False
        
        self.lora_A = nn.Parameter(torch.zeros(rank, in_features))
        self.lora_B = nn.Parameter(torch.zeros(out_features, rank))
        self.scaling = alpha / rank
        
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        base_out = self.linear(x)
        lora_out = (x @ self.lora_A.t()) @ self.lora_B.t()
        return base_out + (lora_out * self.scaling)`,

        dpo: `import torch
import torch.nn.functional as F

def dpo_loss(
    pi_theta_win: torch.Tensor,
    pi_theta_lose: torch.Tensor,
    pi_ref_win: torch.Tensor,
    pi_ref_lose: torch.Tensor,
    beta: float = 0.1
) -> torch.Tensor:
    """
    Direct Preference Optimization (DPO) Loss.
    Optimizes the language model directly on preference pairs.
    Assumes inputs are already log-probabilities summed over the sequence.
    """
    # 1. Compute implicit reward ratios
    pi_theta_ratio = pi_theta_win - pi_theta_lose
    pi_ref_ratio = pi_ref_win - pi_ref_lose
    
    # 2. Compute the scaled difference (logits for the sigmoid)
    logits = beta * (pi_theta_ratio - pi_ref_ratio)
    
    # 3. Binary cross entropy over the preference
    loss = -F.logsigmoid(logits).mean()
    return loss`
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-800 pb-3">
                <span className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle className="text-violet-400" size={16} />
                    Modular PyTorch Implementations
                </span>

                <div className="flex flex-wrap bg-slate-950 p-1 rounded-lg border border-slate-850 gap-1 font-mono text-[9px]">
                    <button
                        onClick={() => setCodeTab('mha')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'mha' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        MULTI-HEAD ATTN
                    </button>
                    <button
                        onClick={() => setCodeTab('rope')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'rope' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        ROPE (ROTARY EMBED)
                    </button>
                    <button
                        onClick={() => setCodeTab('rmsnorm')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'rmsnorm' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        RMSNORM
                    </button>
                    <button
                        onClick={() => setCodeTab('swiglu')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'swiglu' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        SWIGLU MLP
                    </button>
                    <button
                        onClick={() => setCodeTab('moe')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'moe' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        SPARSE MOE
                    </button>
                    <button
                        onClick={() => setCodeTab('decoder')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'decoder' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        LLAMA DECODER BLOCK
                    </button>
                    <button
                        onClick={() => setCodeTab('lora')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'lora' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        LORA LINEAR
                    </button>
                    <button
                        onClick={() => setCodeTab('dpo')}
                        className={`px-2.5 py-1 rounded transition-all ${
                            codeTab === 'dpo' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        DPO LOSS
                    </button>
                </div>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto text-[10px] text-slate-300 font-mono scrollbar-hide max-h-[350px]">
                <code>{snippets[codeTab]}</code>
            </pre>
        </div>
    );
};
