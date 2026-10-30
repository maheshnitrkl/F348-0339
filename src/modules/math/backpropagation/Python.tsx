import React from 'react';
import { CodeBlock } from '../../../components/CodeBlock';

/**
 * Implementation tab for the Backpropagation module (id: math-3).
 * The theory tab derives the gradients symbolically and visualizes them; here
 * we rebuild the same computations as clean, runnable NumPy.
 */
export const BackPropagationPython: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-24 text-slate-300">
            <header className="border-b border-white/5 pb-6 mb-8">
                <h2 className="text-3xl font-bold text-white">Backpropagation in Code</h2>
                <p className="text-slate-400 mt-2">
                    The four stages of the theory tab, expressed as code: a computational graph, a manual
                    backward pass, the same network trained with a hand-rolled loop, and finally the
                    autograd equivalent — to prove they agree.
                </p>
            </header>

            <h3 className="text-xl font-bold text-white mb-2">1. A two-layer network, forward pass</h3>
            <p className="mb-3">
                Nothing fancy — every deep network is a repetition of this pattern:
                <span className="font-mono text-white"> z = Wx + b</span>, then a non-linearity.
            </p>
            <CodeBlock
                language="python"
                title="forward.py"
                code={`import numpy as np

def relu(z):
    return np.maximum(0, z)

def forward(X, W1, b1, W2, b2):
    """X: (n, in_dim) -> hidden -> scalar logit output."""
    z1 = X @ W1 + b1          # pre-activation, hidden layer
    a1 = relu(z1)             # non-linearity
    z2 = a1 @ W2 + b2         # output layer
    return z1, a1, z2`}
            />

            <h3 className="text-xl font-bold text-white mb-2">2. The backward pass — the chain rule as code</h3>
            <p className="mb-3">
                Backpropagation <em>is</em> this function. Each line applies one local derivative, and the
                products accumulate backwards through the graph exactly as the computational-graph
                visualization showed: loss → output layer → hidden layer.
            </p>
            <CodeBlock
                language="python"
                title="backward.py"
                code={`import numpy as np

def backward(X, y, W2, z1, a1, z2):
    """
    Gradients of MSE loss L = mean((z2 - y)^2) w.r.t. all parameters.
    Shapes mirror forward.py. ReLU gradient is the indicator z1 > 0.
    """
    n = X.shape[0]

    # --- output layer ------------------------------------------------------
    dL_dz2 = 2 * (z2 - y) / n          # (n, 1)  dL/d(output) — bias-corrected
    dL_dW2 = a1.T @ dL_dz2             # (h, 1)  local grad a1 @ upstream
    dL_db2 = dL_dz2.sum(axis=0)        # (1,)    dz2/db2 = 1

    # --- hidden layer (reverse the relu) ------------------------------------
    dL_da1 = dL_dz2 @ W2.T             # (n, h)  push gradient one layer back
    dL_dz1 = dL_da1 * (z1 > 0)         # (n, h)  relu'(z) = 1[z > 0]
    dL_dW1 = X.T @ dL_dz1              # (in, h)
    dL_db1 = dL_dz1.sum(axis=0)

    return dL_dW1, dL_db1, dL_dW2, dL_db2`}
            />

            <h3 className="text-xl font-bold text-white mb-2">3. Training loop: forward + backward + SGD</h3>
            <p className="mb-3">
                Three lines per step. This trains the same network the TrainingViz demo uses for
                linear regression, but as a true MLP on the toy XOR-style dataset.
            </p>
            <CodeBlock
                language="python"
                title="train.py"
                code={`import numpy as np
rng = np.random.default_rng(0)

# Tiny nonlinear cloud: XOR-style quadrant labels
n = 400
X = rng.uniform(-1, 1, size=(n, 2))
y = ((X[:, 0] * X[:, 1]) > 0).astype(float).reshape(-1, 1)

# Init: small random weights (Xavier-style scaling below)
W1 = rng.normal(0, np.sqrt(1 / 2), (2, 8)); b1 = np.zeros(8)
W2 = rng.normal(0, np.sqrt(1 / 8), (8, 1)); b2 = np.zeros(1)
lr = 0.1

for epoch in range(5001):
    z1, a1, z2 = forward(X, W1, b1, W2, b2)
    loss = np.mean((z2 - y) ** 2)
    gW1, gb1, gW2, gb2 = backward(X, y, W2, z1, a1, z2)

    for P, g in [(W1, gW1), (b1, gb1), (W2, gW2), (b2, gb2)]:
        P -= lr * g                      # plain SGD step

    if epoch % 1000 == 0:
        acc = np.mean(((z2 > 0) == (y > 0.5)).astype(float))
        print(f"epoch {epoch:4d}  loss={loss:.4f}  acc={acc:.2%}")`}
            />

            <h3 className="text-xl font-bold text-white mb-2">4. Checking against autograd</h3>
            <p className="mb-3">
                The professional shortcut: PyTorch builds the computational graph for you and runs
                reverse-mode differentiation. If your manual gradients are right, both must produce
                nearly identical numbers — a <span className="font-mono text-white">gradient check</span>.
            </p>
            <CodeBlock
                language="python"
                title="gradcheck.py"
                code={`import torch
import numpy as np

# Same data and init as steps 1-2
X = torch.tensor(X_np, dtype=torch.float64, requires_grad=False)
W1 = torch.tensor(W1_np, requires_grad=True)
b1 = torch.tensor(b1_np, requires_grad=True)
W2 = torch.tensor(W2_np, requires_grad=True)
b2 = torch.tensor(b2_np, requires_grad=True)
y_t = torch.tensor(y_np, dtype=torch.float64)

def torch_forward():
    a1 = torch.relu(X @ W1 + b1)
    z2 = a1 @ W2 + b2
    return torch.mean((z2 - y_t) ** 2)

loss = torch_forward()
loss.backward()                    # <- autograd: the whole backward pass

print(torch.allclose(W1.grad, torch.tensor(dW1_np, dtype=torch.float64), atol=1e-6))
print(torch.allclose(W2.grad, torch.tensor(dW2_np, dtype=torch.float64), atol=1e-6))
# True: your hand-written chain rule matches PyTorch's computation graph.`}
            />
            <p className="text-sm text-slate-500 mt-2">
                Up next in the Neural Networks module: the same loop at scale, with optimizers that
                adapt the learning rate per-parameter.
            </p>
        </div>
    );
};
