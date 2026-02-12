import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const LinearAlgebraPython: React.FC = () => {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const examples = [
        {
            id: 'numpy-basics',
            title: 'NumPy Basics',
            description: 'Essential vector and matrix operations',
            code: `import numpy as np

# Create vectors
v = np.array([2, 3, 1])
w = np.array([1, -2, 4])

# Vector operations
print("v + w =", v + w)
print("2v =", 2 * v)
print("v · w (dot product) =", np.dot(v, w))

# Create matrices
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Matrix operations
print("\\nA @ B (matrix multiplication):")
print(A @ B)
print("\\nA.T (transpose):", A.T)
print("det(A) =", np.linalg.det(A))
print("\\nInverse of A:")
print(np.linalg.inv(A))`
        },
        {
            id: 'eigendecomp',
            title: 'Eigendecomposition & PCA',
            description: 'Finding principal components from scratch',
            code: `import numpy as np
import matplotlib.pyplot as plt

# Generate correlated 2D data
np.random.seed(42)
mean = [0, 0]
cov = [[3, 2], [2, 2]]  # Covariance matrix
data = np.random.multivariate_normal(mean, cov, 200)

# Compute covariance matrix
cov_matrix = np.cov(data.T)
print("Covariance Matrix:")
print(cov_matrix)

# Eigendecomposition
eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)

print("\\nEigenvalues (variance along each PC):", eigenvalues)
print("Eigenvectors (principal components):")
print(eigenvectors)

# Variance explained
total_var = eigenvalues.sum()
var_explained = eigenvalues / total_var * 100

print(f"\\nPC1 explains {var_explained[0]:.1f}% of variance")
print(f"PC2 explains {var_explained[1]:.1f}% of variance")

# Project data onto first principal component
first_pc = eigenvectors[:, 0]
projected = data @ first_pc

print(f"\\nOriginal data shape: {data.shape}")
print(f"Projected data shape: {projected.shape}")
print("Dimensionality reduced from 2D to 1D!")`
        },
        {
            id: 'svd',
            title: 'SVD for Image Compression',
            description: 'Compress images using singular value decomposition',
            code: `import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

# Create a simple 10x10 grayscale "image" (matrix)
img_matrix = np.random.rand(10, 10) * 255

# Perform SVD
U, S, Vt = np.linalg.svd(img_matrix, full_matrices=False)

print(f"Original matrix shape: {img_matrix.shape}")
print(f"U shape: {U.shape}, S shape: {S.shape}, Vt shape: {Vt.shape}")

# Reconstruct with only top k singular values
k = 5  # Keep only 5 out of 10
S_k = S.copy()
S_k[k:] = 0  # Zero out smaller singular values

reconstructed = U @ np.diag(S_k) @ Vt

# Compression ratio
original_elements = img_matrix.size
compressed_elements = U[:, :k].size + k + Vt[:k, :].size
ratio = compressed_elements / original_elements

print(f"\\nCompression ratio: {ratio:.2%}")
print(f"Reconstruction error (MSE): {np.mean((img_matrix - reconstructed)**2):.4f}")

# With real images:
# img = Image.open('photo.jpg').convert('L')
# img_array = np.array(img)
# U, S, Vt = np.linalg.svd(img_array, full_matrices=False)
# # Reconstruct with top 50 singular values
# reconstructed = (U[:, :50] @ np.diag(S[:50]) @ Vt[:50, :])`
        },
        {
            id: 'linear-regression',
            title: 'Linear Regression from Scratch',
            description: 'Solving the normal equation using linear algebra',
            code: `import numpy as np

# Generate synthetic data: y = 3x + 2 + noise
np.random.seed(42)
X = np.random.rand(100, 1) * 10  # 100 samples, 1 feature
y = 3 * X + 2 + np.random.randn(100, 1) * 2  # Add noise

# Add bias term (column of ones)
X_b = np.c_[np.ones((100, 1)), X]  # Add x0 = 1 for intercept

# Normal equation: β = (X^T X)^(-1) X^T y
beta = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y

print("Estimated parameters (intercept, slope):")
print(f"β₀ (intercept) = {beta[0][0]:.3f}  (true: 2)")
print(f"β₁ (slope) = {beta[1][0]:.3f}      (true: 3)")

# Make prediction
X_new = np.array([[0], [5]])
X_new_b = np.c_[np.ones((2, 1)), X_new]
y_pred = X_new_b @ beta

print(f"\\nPredictions:")
print(f"X = 0 → y = {y_pred[0][0]:.2f}")
print(f"X = 5 → y = {y_pred[1][0]:.2f}")

# This is exactly what sklearn's LinearRegression does!`
        },
        {
            id: 'solve-system',
            title: 'Solving Linear Systems',
            description: 'Solve Ax = b for unknown x',
            code: `import numpy as np

# System of equations:
# 3x + 2y = 7
# 1x + 2y = 4

A = np.array([[3, 2],
              [1, 2]])
b = np.array([7, 4])

# Method 1: Direct solve (most efficient)
x = np.linalg.solve(A, b)
print("Solution using np.linalg.solve:")
print(f"x = {x[0]:.2f}, y = {x[1]:.2f}")

# Method 2: Using matrix inverse (less efficient)
x_inv = np.linalg.inv(A) @ b
print(f"\\nSolution using inverse:")
print(f"x = {x_inv[0]:.2f}, y = {x_inv[1]:.2f}")

# Verify solution
result = A @ x
print(f"\\nVerification: A @ x = {result}")
print(f"Should equal b = {b}")
print(f"Close enough? {np.allclose(result, b)}")

# Overdetermined system (more equations than unknowns)
# Use least squares: x = (A^T A)^(-1) A^T b
A_over = np.array([[3, 2], [1, 2], [2, 1]])
b_over = np.array([7, 4, 5])
x_ls = np.linalg.lstsq(A_over, b_over, rcond=None)[0]
print(f"\\nLeast squares solution: {x_ls}")`
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white mb-4">💻 Linear Algebra in Python</h1>
                <p className="text-gray-400 text-lg">
                    Practical NumPy implementations of core linear algebra concepts.
                    All examples are production-ready code you can run directly.
                </p>
            </div>

            <div className="space-y-6">
                {examples.map((example) => (
                    <div
                        key={example.id}
                        className="bg-black/60 border border-white/10 rounded-xl overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/20 to-[var(--color-soft-violet)]/20 border-b border-white/10 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{example.title}</h3>
                                    <p className="text-sm text-gray-400">{example.description}</p>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(example.code, example.id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    {copied === example.id ? (
                                        <>
                                            <Check className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-green-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-400">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <pre className="font-mono text-sm text-gray-300 overflow-x-auto">
                                <code>{example.code}</code>
                            </pre>
                        </div>
                    </div>
                ))}
            </div>

            {/* Learning Resources */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📚 Learning Path</h3>
                <div className="space-y-3 text-gray-300">
                    <div className="flex items-start gap-3">
                        <span className="text-[var(--color-electric-cyan)] font-bold">1.</span>
                        <div>
                            <strong>Master the basics:</strong> Matrices as transformations, eigendecomposition
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-[var(--color-electric-cyan)] font-bold">2.</span>
                        <div>
                            <strong>Implement PCA:</strong> Dimensionality reduction is the gateway to ML
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-[var(--color-electric-cyan)] font-bold">3.</span>
                        <div>
                            <strong>Explore SVD:</strong> The Swiss Army knife of matrix decompositions
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-[var(--color-electric-cyan)] font-bold">4.</span>
                        <div>
                            <strong>Build neural nets:</strong> Every layer is just Wx + b (matrix multiplication!)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
