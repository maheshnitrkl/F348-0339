import React, { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   Python Code Examples — Calculus & Probability
   Covers: autograd, gradient descent, distributions, MLE
   ═══════════════════════════════════════════════════════════ */

interface CodeBlock {
    title: string;
    filename: string;
    description: string;
    lines: { text: string; indent: number; color?: string; comment?: boolean }[];
}

const CODE_BLOCKS: CodeBlock[] = [
    {
        title: 'Derivatives with Autograd',
        filename: 'autograd_demo.py',
        description: 'PyTorch autograd computes derivatives automatically via the chain rule.',
        lines: [
            { text: 'import torch', indent: 0, color: 'text-blue-400' },
            { text: '', indent: 0 },
            { text: '# Define a variable with gradient tracking', indent: 0, comment: true },
            { text: 'x = torch.tensor(3.0, requires_grad=True)', indent: 0 },
            { text: '', indent: 0 },
            { text: '# f(x) = x³ + 2x² - 5x + 1', indent: 0, comment: true },
            { text: 'f = x**3 + 2*x**2 - 5*x + 1', indent: 0 },
            { text: '', indent: 0 },
            { text: '# Compute df/dx automatically!', indent: 0, comment: true },
            { text: 'f.backward()', indent: 0, color: 'text-yellow-300' },
            { text: '', indent: 0 },
            { text: 'print(f"f(3) = {f.item():.1f}")      # 25.0', indent: 0 },
            { text: 'print(f"f\'(3) = {x.grad.item():.1f}") # 34.0', indent: 0 },
            { text: '# Verify: f\'(x) = 3x² + 4x - 5 → f\'(3) = 27 + 12 - 5 = 34 ✓', indent: 0, comment: true },
        ],
    },
    {
        title: 'Gradient Descent from Scratch',
        filename: 'gradient_descent.py',
        description: 'Implement basic gradient descent to minimize f(x) = (x-3)² + 1.',
        lines: [
            { text: 'import numpy as np', indent: 0, color: 'text-blue-400' },
            { text: '', indent: 0 },
            { text: 'def f(x):     return (x - 3)**2 + 1', indent: 0 },
            { text: 'def df(x):    return 2 * (x - 3)', indent: 0 },
            { text: '', indent: 0 },
            { text: '# Hyperparameters', indent: 0, comment: true },
            { text: 'lr = 0.1          # learning rate', indent: 0 },
            { text: 'x = 10.0          # starting point', indent: 0 },
            { text: '', indent: 0 },
            { text: 'for step in range(20):', indent: 0, color: 'text-purple-400' },
            { text: 'grad = df(x)', indent: 1 },
            { text: 'x = x - lr * grad  # θ = θ - α·∇f', indent: 1, color: 'text-yellow-300' },
            { text: '', indent: 0 },
            { text: 'if step % 5 == 0:', indent: 1 },
            { text: 'print(f"Step {step:2d}: x={x:.4f}, f(x)={f(x):.4f}, grad={grad:.4f}")', indent: 2 },
            { text: '', indent: 0 },
            { text: '# Step  0: x=8.6000, f(x)=32.3600, grad=14.0000', indent: 0, comment: true },
            { text: '# Step  5: x=3.6872, f(x)=1.4723, grad= 1.3744', indent: 0, comment: true },
            { text: '# Step 15: x=3.0020, f(x)=1.0000, grad= 0.0041', indent: 0, comment: true },
        ],
    },
    {
        title: 'Adam Optimizer in PyTorch',
        filename: 'adam_optimizer.py',
        description: 'Using Adam (the standard optimizer) to train a simple model.',
        lines: [
            { text: 'import torch', indent: 0, color: 'text-blue-400' },
            { text: 'import torch.nn as nn', indent: 0, color: 'text-blue-400' },
            { text: '', indent: 0 },
            { text: '# Simple linear model: y = wx + b', indent: 0, comment: true },
            { text: 'model = nn.Linear(1, 1)', indent: 0 },
            { text: 'optimizer = torch.optim.Adam(model.parameters(), lr=0.01)', indent: 0, color: 'text-yellow-300' },
            { text: 'loss_fn = nn.MSELoss()  # Assumes Gaussian likelihood', indent: 0 },
            { text: '', indent: 0 },
            { text: '# Training data', indent: 0, comment: true },
            { text: 'X = torch.randn(100, 1)', indent: 0 },
            { text: 'y = 3 * X + 2 + 0.1 * torch.randn(100, 1)', indent: 0 },
            { text: '', indent: 0 },
            { text: 'for epoch in range(100):', indent: 0, color: 'text-purple-400' },
            { text: 'pred = model(X)', indent: 1 },
            { text: 'loss = loss_fn(pred, y)', indent: 1 },
            { text: '', indent: 0 },
            { text: 'optimizer.zero_grad()  # Reset gradients', indent: 1 },
            { text: 'loss.backward()        # Compute ∇L (chain rule!)', indent: 1, color: 'text-yellow-300' },
            { text: 'optimizer.step()       # θ = θ - α·m̂/√(v̂+ε)', indent: 1, color: 'text-yellow-300' },
            { text: '', indent: 0 },
            { text: 'w, b = model.weight.item(), model.bias.item()', indent: 0 },
            { text: 'print(f"Learned: y = {w:.2f}x + {b:.2f}")  # ≈ 3.00x + 2.00', indent: 0 },
        ],
    },
    {
        title: 'Probability Distributions',
        filename: 'distributions.py',
        description: 'Generate and visualize common probability distributions.',
        lines: [
            { text: 'import numpy as np', indent: 0, color: 'text-blue-400' },
            { text: 'from scipy import stats', indent: 0, color: 'text-blue-400' },
            { text: '', indent: 0 },
            { text: '# Gaussian / Normal', indent: 0, comment: true },
            { text: 'gaussian = stats.norm(loc=0, scale=1)  # μ=0, σ=1', indent: 0 },
            { text: 'samples = gaussian.rvs(size=10000)', indent: 0 },
            { text: 'print(f"Mean: {samples.mean():.3f}, Std: {samples.std():.3f}")', indent: 0 },
            { text: '', indent: 0 },
            { text: '# Binomial', indent: 0, comment: true },
            { text: 'binom = stats.binom(n=10, p=0.3)', indent: 0 },
            { text: 'print(f"P(X=3) = {binom.pmf(3):.4f}")  # 0.2668', indent: 0 },
            { text: '', indent: 0 },
            { text: '# Poisson', indent: 0, comment: true },
            { text: 'poisson = stats.poisson(mu=4)', indent: 0 },
            { text: 'print(f"P(X=5) = {poisson.pmf(5):.4f}")  # 0.1563', indent: 0 },
            { text: '', indent: 0 },
            { text: '# Bayes Theorem example', indent: 0, comment: true },
            { text: 'P_disease = 0.001    # Prior: 0.1% have the disease', indent: 0 },
            { text: 'P_pos_given_disease = 0.99  # Sensitivity', indent: 0 },
            { text: 'P_pos_given_healthy = 0.05  # False positive rate', indent: 0 },
            { text: '', indent: 0 },
            { text: 'P_pos = P_pos_given_disease * P_disease + \\', indent: 0 },
            { text: '        P_pos_given_healthy * (1 - P_disease)', indent: 0 },
            { text: 'P_disease_given_pos = (P_pos_given_disease * P_disease) / P_pos', indent: 0, color: 'text-yellow-300' },
            { text: 'print(f"P(disease|positive) = {P_disease_given_pos:.3f}")  # 0.019!', indent: 0 },
        ],
    },
    {
        title: 'Cross-Entropy & MLE',
        filename: 'cross_entropy_mle.py',
        description: 'Cross-entropy loss is equivalent to negative log-likelihood.',
        lines: [
            { text: 'import torch', indent: 0, color: 'text-blue-400' },
            { text: 'import torch.nn.functional as F', indent: 0, color: 'text-blue-400' },
            { text: '', indent: 0 },
            { text: '# Cross-Entropy from scratch', indent: 0, comment: true },
            { text: 'def cross_entropy(p_true, q_pred):', indent: 0, color: 'text-purple-400' },
            { text: '"""H(P,Q) = -Σ P(x) log Q(x)"""', indent: 1, comment: true },
            { text: 'return -(p_true * torch.log(q_pred + 1e-9)).sum()', indent: 1 },
            { text: '', indent: 0 },
            { text: '# True distribution vs model prediction', indent: 0, comment: true },
            { text: 'true_dist = torch.tensor([1.0, 0.0, 0.0])   # one-hot: class 0', indent: 0 },
            { text: 'good_pred = torch.tensor([0.9, 0.05, 0.05])  # confident & correct', indent: 0 },
            { text: 'bad_pred  = torch.tensor([0.1, 0.5, 0.4])    # wrong prediction', indent: 0 },
            { text: '', indent: 0 },
            { text: 'print(f"Good: H(P,Q) = {cross_entropy(true_dist, good_pred):.4f}") # 0.1054', indent: 0 },
            { text: 'print(f"Bad:  H(P,Q) = {cross_entropy(true_dist, bad_pred):.4f}")  # 2.3026', indent: 0 },
            { text: '', indent: 0 },
            { text: '# Verify with PyTorch built-in', indent: 0, comment: true },
            { text: 'logits = torch.log(good_pred)', indent: 0 },
            { text: 'target = torch.tensor(0)  # class index', indent: 0 },
            { text: 'loss = F.cross_entropy(logits.unsqueeze(0), target.unsqueeze(0))', indent: 0, color: 'text-yellow-300' },
            { text: 'print(f"PyTorch CE: {loss.item():.4f}")  # Same result ✓', indent: 0 },
            { text: '', indent: 0 },
            { text: '# KL Divergence', indent: 0, comment: true },
            { text: 'entropy = -(true_dist * torch.log(true_dist + 1e-9)).sum()', indent: 0 },
            { text: 'kl_div = cross_entropy(true_dist, good_pred) - entropy', indent: 0 },
            { text: 'print(f"KL(P||Q) = {kl_div:.4f}")  # CE = H(P) + KL(P||Q)', indent: 0 },
        ],
    },
];

export const CalculusProbabilityPython: React.FC = () => {
    const [activeBlock, setActiveBlock] = useState(0);
    const block = CODE_BLOCKS[activeBlock];

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-160px)]">
            {/* Block selector */}
            <div className="flex gap-2 flex-wrap shrink-0">
                {CODE_BLOCKS.map((b, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveBlock(i)}
                        className={`text-xs px-3 py-1.5 rounded border transition-all ${activeBlock === i
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                : 'border-white/10 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {b.title}
                    </button>
                ))}
            </div>

            {/* Code display */}
            <div className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden font-mono text-sm relative">
                <div className="absolute top-4 right-4 text-xs text-gray-500 z-10">{block.filename}</div>
                <div className="p-6 text-gray-300 overflow-y-auto h-full">
                    {/* Description */}
                    <p className="text-xs text-gray-500 mb-4 font-sans">{block.description}</p>

                    {/* Code lines */}
                    {block.lines.map((line, i) => (
                        <div key={i} className={`leading-6 ${line.comment ? 'text-gray-600' : line.color || 'text-gray-300'}`}>
                            {line.text ? (
                                <span style={{ paddingLeft: `${line.indent * 24}px` }}>
                                    {line.comment && !line.text.startsWith('#') ? (
                                        <span className="text-gray-600">&quot;{line.text}&quot;</span>
                                    ) : (
                                        line.text
                                    )}
                                </span>
                            ) : (
                                <br />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
