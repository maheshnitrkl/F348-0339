import React from 'react';
import { CodeBlock } from '../../../components/CodeBlock';

/**
 * Implementation tab for the Calculus & Gradients module (id: math-calc).
 * The theory is covered in Theory.tsx; here we compute the same gradients in
 * Python so the learner can cross-check the math against running code.
 */
export const CalculusCode: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-24 text-slate-300">
            <header className="border-b border-white/5 pb-6 mb-8">
                <h2 className="text-3xl font-bold text-white">Gradients in Code</h2>
                <p className="text-slate-400 mt-2">
                    Everything in the Theory tab comes down to a few lines of NumPy. Below: numerical
                    derivatives, the exact analytic gradients of the worked example
                    <span className="text-white font-mono"> f(x,y) = x² + 3xy + y²</span>, and a runnable
                    gradient-descent loop that trains a tiny linear model.
                </p>
            </header>

            <h3 className="text-xl font-bold text-white mb-2">1. What a gradient actually is</h3>
            <p className="mb-3">
                The gradient is just a vector of partial derivatives. Before trusting autograd, it is worth
                being able to compute one by hand — both analytically and with the finite-difference definition
                <span className="font-mono text-white"> ∂f/∂x ≈ (f(x+h) − f(x−h)) / 2h</span>.
            </p>
            <CodeBlock
                language="python"
                title="partials.py"
                code={`import numpy as np

def f(x, y):
    """The worked example from the theory tab: f(x,y) = x^2 + 3xy + y^2."""
    return x**2 + 3*x*y + y**2

def numerical_gradient(f, x, y, h=1e-6):
    """Central finite differences — the definition made executable."""
    df_dx = (f(x + h, y) - f(x - h, y)) / (2 * h)
    df_dy = (f(x, y + h) - f(x, y - h)) / (2 * h)
    return np.array([df_dx, df_dy])

def analytic_gradient(x, y):
    """d/dx (x^2 + 3xy + y^2) = 2x + 3y ;  d/dy = 3x + 2y."""
    return np.array([2*x + 3*y, 3*x + 2*y])

# Both agree to ~6 decimal places:
print(numerical_gradient(f, 1.0, 2.0))   # [8. 7.]
print(analytic_gradient(1.0, 2.0))       # [8. 7.]`}
            />

            <h3 className="text-xl font-bold text-white mb-2">2. The chain rule, without autograd</h3>
            <p className="mb-3">
                A neural layer is <span className="font-mono text-white">a = σ(Wx + b)</span>. Its gradients are a
                chained product: <span className="font-mono text-white">∂L/∂W = 2·(a − y) ⊙ σ′(z) · xᵀ</span>.
                This tiny two-layer network reproduces the exact equation from section 1.3 of the theory.
            </p>
            <CodeBlock
                language="python"
                title="chain_rule.py"
                code={`import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def sigmoid_grad(z):
    """sigma'(z) = sigma(z) * (1 - sigma(z))"""
    s = sigmoid(z)
    return s * (1 - s)

def backward(x, y_true, W, b):
    """
    One full backward pass through a single sigmoid layer with squared-error
    loss L = (a - y)^2. Falls exactly out of the chain rule:

        dL/da -> dL/dz -> dL/dW (and dL/db)
    """
    z = W @ x + b            # forward: pre-activation
    a = sigmoid(z)           # forward: activation

    dL_da = 2 * (a - y_true)                 # loss gradient
    dL_dz = dL_da * sigmoid_grad(z)          # chain rule step 1
    dL_dW = np.outer(dL_dz, x)               # chain rule step 2
    dL_db = dL_dz                            # z = Wx + b  =>  dz/db = 1

    return a, dL_dW, dL_db

x = np.array([1.0, 2.0])
W = np.array([[0.5, -0.3]])
b = np.array([0.1])
a, dW, db = backward(x, y_true=1.0, W=W, b=b)
print("output:", a, " dW:", dW, " db:", db)`}
            />

            <h3 className="text-xl font-bold text-white mb-2">3. A complete gradient-descent loop</h3>
            <p className="mb-3">
                Putting it together: minimize
                <span className="font-mono text-white"> L(θ) </span> by stepping against the gradient
                <span className="font-mono text-white"> θ ← θ − α∇L</span>. Watch the loss fall —
                that is the whole training loop of every deep learning framework, in miniature.
            </p>
            <CodeBlock
                language="python"
                title="descent.py"
                code={`import numpy as np
rng = np.random.default_rng(42)

# Toy regression: y = 2x + 1 with noise
n = 200
X = rng.uniform(-2, 2, size=(n, 1))
y = 2 * X + 1 + rng.normal(0, 0.2, size=(n, 1))

# Parameters: w (slope), b (bias)
theta = np.zeros(2)          # [w, b]
lr = 0.05

def loss_and_grad(theta):
    w, b = theta
    y_pred = X * w + b
    residual = y_pred - y
    loss = np.mean(residual ** 2)
    grad_w = 2 * np.mean(residual * X)
    grad_b = 2 * np.mean(residual)
    return loss, np.array([grad_w, grad_b])

for epoch in range(61):
    loss, grad = loss_and_grad(theta)
    if epoch % 10 == 0:
        print(f"epoch {epoch:3d}  loss={loss:.4f}  w={theta[0]:.3f}  b={theta[1]:.3f}")
    theta = theta - lr * grad      # <-- the update rule, verbatim`}
            />
            <p className="text-sm text-slate-500 mt-2">
                Try it: raise <span className="font-mono">lr</span> to <span className="font-mono">0.9</span> and the
                loop oscillates or diverges — exactly the learning-rate pathology shown in the
                Training Optimization module.
            </p>
        </div>
    );
};
