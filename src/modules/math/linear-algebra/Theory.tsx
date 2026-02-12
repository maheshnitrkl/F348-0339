import React from 'react';
import {

    NormBallsViz,
    DeterminantAreaViz,
    LinearIndependenceViz,
    EigenViz,
    SVDStepsViz,
    PositiveDefiniteViz,
    ProjectionViz,
    GradientDescentViz,
    TensorShapeViz,
} from './components/TheoryVisualizations';

export const LinearAlgebraTheory: React.FC = () => {
    return (
        <div className="space-y-8 text-gray-300 leading-relaxed">
            {/* Introduction */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-4">Linear Algebra: The Language of ML</h1>
                <p className="text-lg">
                    Every neural network, every recommendation system, every computer vision algorithm—
                    all built on <span className="text-[var(--color-electric-cyan)] font-bold">linear algebra</span>.
                    This isn't abstract math. This is how machines "see" and "understand" data.
                </p>
            </div>

            {/* Vectors */}
            <section>
                <h2 className="text-3xl font-bold text-white mb-4">📐 Vectors: Data as Geometry</h2>
                <p className="mb-4">
                    A vector is both a <strong>list of numbers</strong> and a <strong>geometric object</strong>:
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-[var(--color-electric-cyan)] font-bold mb-2">Algebraic View</h4>
                            <div className="font-mono text-sm">
                                v = [2, 3]<br />
                                w = [-1, 2]
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[var(--color-soft-violet)] font-bold mb-2">Geometric View</h4>
                            <p className="text-sm">
                                Arrows in space pointing from origin to a location
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-200 text-sm">
                        💡 <strong>In ML:</strong> Each data point is a vector. An image of 28×28 pixels =
                        a vector in 784-dimensional space!
                    </p>
                </div>
            </section>

            {/* Vector Operations */}
            <section>
                <h3 className="text-2xl font-bold text-white mb-3">Vector Operations</h3>

                <div className="space-y-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Addition: v + w</h4>
                        <p className="text-sm text-gray-400">
                            Add componentwise: [2,3] + [-1,2] = [1,5]
                        </p>
                        <p className="text-sm text-[var(--color-electric-cyan)] mt-2">
                            Geometrically: Place tail of w at head of v (tip-to-tail method)
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Scalar Multiplication: cv</h4>
                        <p className="text-sm text-gray-400">
                            2 × [2,3] = [4,6]
                        </p>
                        <p className="text-sm text-[var(--color-electric-cyan)] mt-2">
                            Geometrically: Stretch/shrink the vector (negative c flips direction)
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Dot Product: v · w</h4>
                        <p className="text-sm text-gray-400 font-mono">
                            [2,3] · [-1,2] = (2)(-1) + (3)(2) = 4
                        </p>
                        <p className="text-sm text-[var(--color-electric-cyan)] mt-2">
                            Measures: How much do vectors point in the same direction? (Cosine similarity in ML)
                        </p>
                    </div>
                </div>



                <div className="my-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
                    <p className="text-cyan-300 font-bold text-lg mb-2">🎯 Interactive Vector Playground</p>
                    <p className="text-gray-400 text-sm">Drag, add, and combine vectors interactively.</p>
                    <p className="text-gray-500 text-xs mt-2">Switch to the <strong className="text-cyan-400">Vector Playground</strong> tab above ↑</p>
                </div>
            </section >

            {/* Linear Combinations and Span */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-3">Linear Combinations & Span</h3>

                <p className="mb-4">
                    A <strong className="text-[var(--color-electric-cyan)]">linear combination</strong> is when you
                    scale vectors and add them together. This is the fundamental building block of linear algebra:
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <div className="font-mono text-center text-xl mb-2">
                        c₁v₁ + c₂v₂ + ... + cₙvₙ
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                        where c₁, c₂, ..., cₙ are scalars (numbers)
                    </p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
                    <h4 className="text-white font-bold mb-2">Example</h4>
                    <p className="text-sm text-gray-400 font-mono mb-2">
                        2[1,0] + 3[0,1] = [2,0] + [0,3] = [2,3]
                    </p>
                    <p className="text-xs text-[var(--color-electric-cyan)]">
                        Any 2D vector can be written as a linear combination of [1,0] and [0,1]!
                    </p>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">The Span</h4>
                <p className="mb-4">
                    The <strong>span</strong> of a set of vectors is all possible linear combinations you can make with them.
                </p>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="text-blue-300 font-bold mb-2">One Vector</div>
                        <div>Span = a line through the origin</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                        <div className="text-purple-300 font-bold mb-2">Two Independent Vectors (2D)</div>
                        <div>Span = the entire 2D plane</div>
                    </div>
                </div>
            </section >

            {/* Vector Norms and Distance */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-3">📏 Vector Norms: Measuring Length</h3>

                <p className="mb-4">
                    A <strong>norm</strong> measures the "size" or "length" of a vector. Different norms give different notions of distance:
                </p>

                <div className="space-y-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">L² Norm (Euclidean Distance)</h4>
                        <p className="text-sm text-gray-400 font-mono mb-2">
                            ||v||₂ = √(v₁² + v₂² + ... + vₙ²)
                        </p>
                        <p className="text-xs text-[var(--color-electric-cyan)]">
                            The "straight-line" distance. Most common in ML (e.g., Mean Squared Error)
                        </p>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">L¹ Norm (Manhattan Distance)</h4>
                        <p className="text-sm text-gray-400 font-mono mb-2">
                            ||v||₁ = |v₁| + |v₂| + ... + |vₙ|
                        </p>
                        <p className="text-xs text-[var(--color-electric-cyan)]">
                            Sum of absolute values. Used in Lasso regression for sparsity
                        </p>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">L∞ Norm (Maximum Norm)</h4>
                        <p className="text-sm text-gray-400 font-mono mb-2">
                            ||v||∞ = max(|v₁|, |v₂|, ..., |vₙ|)
                        </p>
                        <p className="text-xs text-[var(--color-electric-cyan)]">
                            The largest component. Used in robust optimization
                        </p>
                    </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-4">
                    <p className="text-green-200 text-sm">
                        💡 <strong>Unit Vectors:</strong> A vector with norm = 1. Normalization (v/||v||)
                        is crucial in ML for feature scaling!
                    </p>
                </div>

                <NormBallsViz />
            </section >

            {/* Matrix Operations */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🧮 Matrix Operations</h2>

                <p className="mb-4">
                    Before we can transform space, we need to understand how to manipulate matrices themselves.
                </p>

                <h3 className="text-xl font-bold text-white mb-3">Matrix Addition & Subtraction</h3>
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-sm mb-2">Add/subtract corresponding elements (matrices must have same dimensions):</p>
                    <div className="font-mono text-sm text-center">
                        <div className="mb-2">
                            [1  2]   [5  6]   [6   8]<br />
                            [3  4] + [7  8] = [10 12]
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Matrix Multiplication</h3>
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 mb-4">
                    <p className="text-sm mb-4">
                        <strong className="text-orange-300">WARNING:</strong> Order matters! AB ≠ BA in general.
                    </p>

                    <div className="bg-black/40 rounded-lg p-4 mb-4">
                        <h4 className="text-white font-bold mb-2">How to Multiply</h4>
                        <p className="text-sm text-gray-300 mb-2">
                            (AB)<sub>ij</sub> = (row i of A) · (column j of B)
                        </p>
                        <div className="font-mono text-xs text-center mt-4">
                            <div>[1 2] [5 6]   [1×5+2×7  1×6+2×8]   [19 22]</div>
                            <div>[3 4] [7 8] = [3×5+4×7  3×6+4×8] = [43 50]</div>
                        </div>
                    </div>

                    <div className="text-sm space-y-2">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-400">⚡</span>
                            <div><strong>Dimension Rule:</strong> (m×n) × (n×p) = (m×p). The inner dimensions must match!</div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-400">⚡</span>
                            <div><strong>Geometric Meaning:</strong> AB means "apply B first, then A" (composition of transformations)</div>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Transpose</h3>
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-sm mb-2">Flip rows and columns: (A<sup>T</sup>)<sub>ij</sub> = A<sub>ji</sub></p>
                    <div className="font-mono text-sm text-center mb-3">
                        <div>    [1 2]<sup>T</sup>   [1 3]</div>
                        <div>    [3 4]    = [2 4]</div>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                        <div>• (A<sup>T</sup>)<sup>T</sup> = A</div>
                        <div>• (AB)<sup>T</sup> = B<sup>T</sup>A<sup>T</sup> (order reverses!)</div>
                        <div>• Symmetric matrix: A<sup>T</sup> = A (special properties in eigenanalysis)</div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Identity Matrix & Inverse</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <h4 className="text-blue-300 font-bold mb-2">Identity Matrix (I)</h4>
                        <div className="font-mono text-xs mb-2 text-center">
                            <div>[1 0 0]</div>
                            <div>[0 1 0]</div>
                            <div>[0 0 1]</div>
                        </div>
                        <p className="text-xs">AI = IA = A (does nothing, like multiplying by 1)</p>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <h4 className="text-purple-300 font-bold mb-2">Inverse Matrix (A<sup>-1</sup>)</h4>
                        <div className="font-mono text-xs mb-2 text-center">
                            AA<sup>-1</sup> = A<sup>-1</sup>A = I
                        </div>
                        <p className="text-xs">Only exists if det(A) ≠ 0 (matrix is "invertible")</p>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-200 text-sm">
                        ⚠️ <strong>Not all matrices have inverses!</strong> If det(A) = 0, the matrix is "singular"
                        and transforms space into a lower dimension (information is lost).
                    </p>
                </div>
            </section >

            {/* Matrix Transformation Visualizer */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-4">Interactive Matrix Transformer</h3>
                <p className="mb-4 text-gray-300">
                    Visualize how matrices transform the entire grid. Watch how the basis vectors <span className="text-yellow-400 font-bold">i</span> and <span className="text-pink-400 font-bold">j</span> move!
                </p>
                <div className="my-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
                    <p className="text-cyan-300 font-bold text-lg mb-2">🔄 Interactive Matrix Transformer</p>
                    <p className="text-gray-400 text-sm">Visualize how matrices warp space in real-time 3D.</p>
                    <p className="text-gray-500 text-xs mt-2">Switch to the <strong className="text-cyan-400">Matrix Transform</strong> tab above ↑</p>
                </div>
            </section >

            {/* Matrices as Transformations */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🔄 Matrices: Functions That Transform Space</h2>

                <p className="mb-4">
                    A matrix isn't just a grid of numbers—it's a <strong>linear transformation</strong>.
                    When you multiply a vector by a matrix, you're transforming that vector into a new position.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <div className="font-mono text-center text-lg mb-4">
                        <div>Av = b</div>
                        <div className="text-sm text-gray-500 mt-2">(Matrix times vector equals new vector)</div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="text-[var(--color-electric-cyan)] font-bold mb-1">Rotation</div>
                            <div className="font-mono text-xs">
                                [cos θ  -sin θ]<br />
                                [sin θ   cos θ]
                            </div>
                        </div>
                        <div>
                            <div className="text-[var(--color-soft-violet)] font-bold mb-1">Scaling</div>
                            <div className="font-mono text-xs">
                                [sx   0]<br />
                                [0   sy]
                            </div>
                        </div>
                        <div>
                            <div className="text-[var(--color-electric-yellow)] font-bold mb-1">Shear</div>
                            <div className="font-mono text-xs">
                                [1   k]<br />
                                [0   1]
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-yellow-200 text-sm">
                        🎯 <strong>Key Insight:</strong> The columns of a matrix tell you where the basis vectors (î, ĵ) land after transformation!
                    </p>
                </div>
            </section >

            {/* Linear Independence and Basis */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-3">Linear Independence & Basis</h3>

                <p className="mb-4">
                    These are two of the most important concepts for understanding the "structure" of data.
                </p>

                <h4 className="text-xl font-bold text-white mb-2">Linear Independence</h4>
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-sm mb-2">
                        A set of vectors is <strong>independent</strong> if no vector can be made from a linear combination of the others.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <div className="text-green-300 font-bold mb-1">Independent</div>
                            <div>New info! Each vector points in a "new" direction.</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <div className="text-red-300 font-bold mb-1">Dependent</div>
                            <div>Redundant. One vector is just a mix of the others.</div>
                        </div>
                    </div>
                </div>

                <LinearIndependenceViz />

                <h4 className="text-xl font-bold text-white mb-2">Basis & Dimension</h4>
                <div className="mb-4 space-y-3">
                    <p className="text-sm">
                        A <strong>basis</strong> is a minimal set of vectors that spans a space (independent + spans).
                    </p>
                    <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                        <div className="font-mono text-sm text-[var(--color-electric-cyan)] mb-1">Dimension</div>
                        <p className="text-xs text-gray-400">
                            The number of vectors in a basis. A line is 1D, a plane is 2D.
                            If you have 3 vectors in 2D, they MUST be dependent!
                        </p>
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-blue-300 font-bold mb-2">Rank of a Matrix</h4>
                    <p className="text-sm mb-2">
                        The <strong>rank</strong> is the number of independent columns (or rows).
                        It tells you the true dimension of the data.
                    </p>
                    <p className="text-xs text-gray-300">
                        Top Tip: Full rank matrices preserve information. Low rank matrices compress it
                        (useful for compression, bad for solving equations).
                    </p>
                </div>
            </section >

            {/* Systems of Linear Equations */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-3">Systems of Equations (Ax = b)</h3>

                <p className="mb-4">
                    This is arguably the "main problem" of linear algebra. We want to find a vector
                    <span className="font-mono text-[var(--color-electric-cyan)] mx-1">x</span>
                    that the matrix <span className="font-mono">A</span> maps to
                    <span className="font-mono mx-1">b</span>.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">The Inverse Method</h4>
                        <div className="font-mono text-sm mb-2">x = A<sup>-1</sup>b</div>
                        <p className="text-xs text-gray-400">
                            Only works if A is square and invertible. Computationally expensive for large matrices.
                        </p>
                    </div>
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Gaussian Elimination</h4>
                        <p className="text-xs text-gray-400">
                            Systematically eliminating variables to reach "row echelon form".
                            The standard algorithm for solving systems efficiently.
                        </p>
                    </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">Number of Solutions</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded">
                        <span className="text-green-400 font-bold">1 Solution</span>
                        <span>Lines intersect at one point (A is invertible)</span>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded">
                        <span className="text-yellow-400 font-bold">∞ Solutions</span>
                        <span>Lines are identical (redundant info)</span>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded">
                        <span className="text-red-400 font-bold">0 Solutions</span>
                        <span>Lines are parallel (contradiction)</span>
                    </div>
                </div>
            </section >

            {/* Determinant */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🔢 Determinant: The Matrix "Fingerprint"</h2>

                <p className="mb-4">
                    The determinant is a single number that captures fundamental properties of a matrix:
                    whether it's invertible, how it scales areas/volumes, and whether it flips orientation.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xl font-bold text-white mb-3">What Does It Tell You?</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            <span className="text-green-400 font-bold min-w-[120px]">det(A) = 2</span>
                            <span>Areas are doubled. Matrix is invertible.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-400 font-bold min-w-[120px]">det(A) = -3</span>
                            <span>Areas are tripled AND orientation flips (mirror reflection).</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-red-400 font-bold min-w-[120px]">det(A) = 0</span>
                            <span>Space collapses! Matrix is <strong>singular</strong> (no inverse exists).</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-400 font-bold min-w-[120px]">|det(A)| = 1</span>
                            <span>Pure rotation/reflection — no stretching. Orthogonal matrix!</span>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">How to Compute</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">2×2 (Easy!)</h4>
                        <div className="font-mono text-sm text-center mb-2">
                            <div>|a  b|</div>
                            <div>|c  d| = ad - bc</div>
                        </div>
                        <div className="bg-black/40 rounded p-2 text-xs font-mono text-center">
                            |3  1|<br />
                            |2  4| = (3)(4) - (1)(2) = 10
                        </div>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">3×3 (Cofactor Expansion)</h4>
                        <p className="text-xs text-gray-300 mb-2">
                            Expand along the first row: multiply each element by its cofactor (the determinant
                            of the 2×2 remaining after removing its row and column), alternating signs (+, -, +).
                        </p>
                        <div className="font-mono text-xs bg-black/40 rounded p-2 text-center">
                            det(A) = a₁₁·C₁₁ - a₁₂·C₁₂ + a₁₃·C₁₃
                        </div>
                    </div>
                </div>

                {/* Worked Example */}
                <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-2xl p-6 mb-4">
                    <h4 className="text-lg font-bold text-yellow-300 mb-3">📝 Worked Example: 3×3 Determinant</h4>
                    <div className="font-mono text-xs mb-3 text-center">
                        <div>|1  2  3|</div>
                        <div>|4  5  6|</div>
                        <div>|7  8  0|</div>
                    </div>
                    <div className="space-y-2 text-xs text-gray-300">
                        <div>= 1·|5 6; 8 0| - 2·|4 6; 7 0| + 3·|4 5; 7 8|</div>
                        <div>= 1·(5·0 - 6·8) - 2·(4·0 - 6·7) + 3·(4·8 - 5·7)</div>
                        <div>= 1·(-48) - 2·(-42) + 3·(-3)</div>
                        <div>= -48 + 84 - 9</div>
                        <div className="text-white font-bold text-sm">= 27</div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Key Properties</h3>
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-4">
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                            <div><span className="font-mono text-[var(--color-electric-cyan)]">det(AB)</span> = det(A) · det(B)</div>
                            <div><span className="font-mono text-[var(--color-electric-cyan)]">det(A<sup>T</sup>)</span> = det(A)</div>
                            <div><span className="font-mono text-[var(--color-electric-cyan)]">det(A<sup>-1</sup>)</span> = 1/det(A)</div>
                        </div>
                        <div className="space-y-2">
                            <div><span className="font-mono text-[var(--color-electric-cyan)]">det(cA)</span> = c<sup>n</sup>·det(A) for n×n matrix</div>
                            <div>Swapping two rows → multiplies det by -1</div>
                            <div>Two identical rows → det = 0</div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-blue-300 font-bold mb-2">Cramer's Rule</h4>
                    <p className="text-xs text-gray-300 mb-2">
                        Solve Ax = b by replacing columns of A with b and taking determinant ratios:
                    </p>
                    <div className="font-mono text-xs text-center">
                        x<sub>i</sub> = det(A<sub>i</sub>) / det(A)
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Elegant but O(n!) — impractical for large systems. Great for theory and small problems.
                    </p>
                </div>

                <DeterminantAreaViz />
            </section >

            {/* Orthogonality */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-3">Orthogonality & Projections</h3>

                <p className="mb-4">
                    <strong>Orthogonal</strong> is just the linear algebra word for "perpendicular".
                    When vectors are orthogonal, they are independent and easy to work with.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-4">
                    <h4 className="text-white font-bold mb-2">The Test</h4>
                    <div className="font-mono text-center text-lg mb-2">
                        v · w = 0
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                        If dot product is zero, vectors are orthogonal (90° angle).
                    </p>
                </div>

                <ProjectionViz />

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 rounded-xl p-4">
                        <h4 className="text-indigo-300 font-bold mb-2">Orthonormal Basis</h4>
                        <p className="text-sm mb-2">
                            The "perfect" basis. All vectors are:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                            <li>Orthogonal (perpendicular)</li>
                            <li>Normalized (length = 1)</li>
                        </ul>
                        <div className="mt-3 text-xs font-mono bg-black/40 p-2 rounded">
                            Q<sup>T</sup>Q = I
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl p-4">
                        <h4 className="text-pink-300 font-bold mb-2">Gram-Schmidt Process</h4>
                        <p className="text-sm mb-2">
                            An algorithm to take <em>any</em> messy basis and turn it into a nice orthonormal basis.
                        </p>
                        <p className="text-xs text-gray-400">
                            Iteratively subtracts "overlapping" parts of vectors.
                        </p>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <h4 className="text-white font-bold mb-2">QR Decomposition</h4>
                    <p className="text-sm font-mono mb-2">A = QR</p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
                        <div><strong className="text-[var(--color-electric-cyan)]">Q:</strong> Orthonormal matrix (rotation)</div>
                        <div><strong className="text-[var(--color-soft-violet)]">R:</strong> Upper triangular matrix (scaling/shear)</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Used heavily in solving least-squares problems (e.g., Linear Regression).
                    </p>
                </div>
            </section >

            {/* Vector Spaces and Subspaces */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🌌 Vector Spaces & Subspaces</h2>

                <p className="mb-4">
                    A <strong>vector space</strong> is just a collection of vectors that you can add and scale.
                    But the real magic happens in the <strong>subspaces</strong> defined by a matrix.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xl font-bold text-white mb-3">The Four Fundamental Subspaces</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <div className="text-blue-300 font-bold mb-1">1. Column Space (C(A))</div>
                                <div className="text-xs text-gray-300">All possible outputs (Av). It tells you what equations <em>can</em> be solved.</div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                <div className="text-purple-300 font-bold mb-1">2. Row Space (C(A<sup>T</sup>))</div>
                                <div className="text-xs text-gray-300">All linear combinations of rows. Perpendicular to the Null Space.</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <div className="text-red-300 font-bold mb-1">3. Null Space (N(A))</div>
                                <div className="text-xs text-gray-300">All inputs x where Ax = 0. The "blind spot" of the matrix.</div>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <div className="text-yellow-300 font-bold mb-1">4. Left Null Space (N(A<sup>T</sup>))</div>
                                <div className="text-xs text-gray-300">All vectors orthogonal to the Column Space.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h4 className="text-green-300 font-bold mb-2">Rank-Nullity Theorem</h4>
                    <p className="font-mono text-center text-lg mb-2">
                        Rank + Nullity = n
                        <span className="text-xs text-gray-400 block mt-1">(Dimension of Column Space + Dimension of Null Space = Total Columns)</span>
                    </p>
                    <p className="text-xs text-gray-300 mt-2">
                        Fundamental conservation law of linear algebra! Info goes into either the output (Rank) or gets lost (Nullity).
                    </p>
                </div>
            </section >

            {/* Eigenvalues and Eigenvectors */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🌀 Eigenvalues & Eigenvectors: The "Natural" Axes</h2>

                <p className="mb-4">
                    Most vectors change direction when transformed by a matrix. But special vectors—
                    <strong className="text-[var(--color-electric-cyan)]">eigenvectors</strong>—
                    only get stretched or squished, never rotated.
                </p>

                <EigenViz />

                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-8 mb-4">
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">The Eigenvalue Equation</h3>
                    <div className="font-mono text-3xl text-center py-4 text-white">
                        Av = λv
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm mt-6">
                        <div className="bg-black/40 rounded-lg p-4">
                            <div className="text-[var(--color-electric-cyan)] font-bold mb-2">v = Eigenvector</div>
                            <div>The special direction that doesn't rotate under transformation A</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-4">
                            <div className="text-[var(--color-soft-violet)] font-bold mb-2">λ = Eigenvalue</div>
                            <div>The scaling factor (how much v stretches/shrinks)</div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">How to Find Them</h4>
                        <p className="text-sm mb-2">Solve the characteristic equation:</p>
                        <div className="font-mono text-center text-[var(--color-electric-purple)] mb-2">
                            det(A - λI) = 0
                        </div>
                        <p className="text-xs text-gray-400">
                            The roots of this polynomial are the eigenvalues.
                        </p>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Symmetric Matrices</h4>
                        <p className="text-sm mb-2">
                            If A is symmetric (A = A<sup>T</sup>), then:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                            <li>All eigenvalues are <strong>real</strong> numbers</li>
                            <li>Eigenvectors are using <strong>orthogonal</strong> (perpendicular)</li>
                        </ul>
                        <p className="text-xs text-[var(--color-electric-cyan)] mt-2">
                            Crucial for covariance matrices in PCA!
                        </p>
                    </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                    <p className="text-green-200 text-sm">
                        ✨ <strong>Spectral Theorem:</strong> Any symmetric matrix can be decomposed into
                        <span className="font-mono mx-1">QΛQ<sup>T</sup></span>. This is the "Holy Grail" of linear algebra.
                    </p>
                </div>

                <h4 className="text-xl font-bold text-white mb-3">Diagonalization</h4>
                <div className="bg-black/60 border border-white/10 rounded-xl p-6">
                    <div className="font-mono text-center text-xl mb-2">
                        A = QΛQ<sup>-1</sup>
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                        Q = eigenvectors (columns), Λ = diagonal matrix of eigenvalues
                    </p>
                    <p className="text-sm text-[var(--color-electric-cyan)] mt-4">
                        This view reveals what A "really" does: Rotate (Q<sup>-1</sup>) → Stretch (Λ) → Rotate back (Q).
                    </p>
                </div>
            </section >

            {/* Positive Definite Matrices */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">⚡ Positive Definite Matrices</h2>

                <p className="mb-4">
                    A <strong>positive definite</strong> matrix is one where
                    <span className="font-mono text-[var(--color-electric-cyan)] mx-1">x<sup>T</sup>Ax &gt; 0</span>
                    for all non-zero vectors x. These matrices are the <strong>heroes of optimization</strong>.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xl font-bold text-white mb-3">How to Test</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 font-bold">Test 1:</span>
                            <span>All eigenvalues are <strong className="text-white">positive</strong> (λ<sub>i</sub> &gt; 0)</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 font-bold">Test 2:</span>
                            <span>All pivots are positive (from Gaussian elimination)</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 font-bold">Test 3:</span>
                            <span>All leading minors (sub-determinants) are positive</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 font-bold">Test 4:</span>
                            <span>A = R<sup>T</sup>R for some matrix R with independent columns</span>
                        </div>
                    </div>
                </div>

                <PositiveDefiniteViz />

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-4">
                        <h4 className="text-green-300 font-bold mb-2">✅ Positive Definite</h4>
                        <p className="text-xs text-gray-300 mb-2">All eigenvalues &gt; 0</p>
                        <p className="text-xs text-gray-400">
                            The function x<sup>T</sup>Ax forms a "bowl" — has a unique minimum.
                            <strong className="text-white"> Gradient descent WILL converge!</strong>
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-4">
                        <h4 className="text-yellow-300 font-bold mb-2">⚠️ Positive Semi-Definite</h4>
                        <p className="text-xs text-gray-300 mb-2">All eigenvalues ≥ 0 (some can be zero)</p>
                        <p className="text-xs text-gray-400">
                            The "bowl" has flat regions — minimum exists but may not be unique.
                            Covariance matrices are always at least semi-definite.
                        </p>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <h4 className="text-red-300 font-bold mb-2">🎯 Why This Matters for ML</h4>
                    <div className="grid md:grid-cols-3 gap-3 text-xs text-gray-300">
                        <div>
                            <strong className="text-white">Loss Functions:</strong> If the Hessian is
                            positive definite at a point, that point is a <strong>local minimum</strong>.
                        </div>
                        <div>
                            <strong className="text-white">Covariance:</strong> X<sup>T</sup>X is always positive
                            semi-definite. This guarantees PCA always works!
                        </div>
                        <div>
                            <strong className="text-white">Kernels:</strong> Kernel matrices must be positive
                            semi-definite (Mercer's theorem) for SVMs to work.
                        </div>
                    </div>
                </div>
            </section >

            {/* SVD */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🏆 Singular Value Decomposition (SVD)</h2>

                <p className="mb-4">
                    The <strong>most important matrix decomposition in ML</strong>. Unlike eigendecomposition
                    (which only works for square matrices), SVD works for ANY matrix:
                </p>

                <SVDStepsViz />

                <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-8 mb-4">
                    <div className="font-mono text-3xl text-center py-4 text-white">
                        A = UΣV<sup>T</sup>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm mt-6">
                        <div className="bg-black/40 rounded-lg p-4">
                            <div className="text-orange-400 font-bold mb-2">U (Left Singular Vectors)</div>
                            <div>Orthonormal basis for column space</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-4">
                            <div className="text-red-400 font-bold mb-2">Σ (Singular Values)</div>
                            <div>Diagonal matrix (importance/energy)</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-4">
                            <div className="text-yellow-400 font-bold mb-2">V (Right Singular Vectors)</div>
                            <div>Orthonormal basis for row space</div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h4 className="text-xl font-bold text-white mb-3">Geometric Interpretation</h4>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-center">
                        <div className="flex-1">
                            <div className="text-[var(--color-electric-yellow)] font-bold mb-1">1. Rotate (V<sup>T</sup>)</div>
                            <div className="text-xs text-gray-400">Aligns input vectors with axes</div>
                        </div>
                        <div className="text-2xl text-gray-600">→</div>
                        <div className="flex-1">
                            <div className="text-[var(--color-electric-red)] font-bold mb-1">2. Stretch (Σ)</div>
                            <div className="text-xs text-gray-400">Scales along axes by singular values</div>
                        </div>
                        <div className="text-2xl text-gray-600">→</div>
                        <div className="flex-1">
                            <div className="text-[var(--color-electric-orange)] font-bold mb-1">3. Rotate (U)</div>
                            <div className="text-xs text-gray-400">Rotates to final output orientation</div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <h4 className="text-blue-300 font-bold mb-2">The Pseudoinverse (A<sup>+</sup>)</h4>
                        <p className="text-sm mb-2">
                            If A isn't invertible, we can't find A<sup>-1</sup>. But SVD gives us the "best" replacement:
                        </p>
                        <div className="font-mono text-center text-sm my-2">
                            A<sup>+</sup> = VΣ<sup>-1</sup>U<sup>T</sup>
                        </div>
                        <p className="text-xs text-gray-400">
                            Used to solve Ax=b when no exact solution exists (least squares)!
                        </p>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <h4 className="text-purple-300 font-bold mb-2">Low-Rank Approximation</h4>
                        <p className="text-sm mb-2">
                            Keep only the top k singular values in Σ.
                        </p>
                        <p className="text-xs text-gray-400">
                            The resulting matrix is the "closest" rank-k matrix to A.
                            This is how image compression and noise reduction work!
                        </p>
                    </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">Applications</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="text-[var(--color-electric-cyan)]">📷</span>
                        <div><strong>Image Compression:</strong> Keep only top k singular values (JPEG uses similar DCT)</div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-[var(--color-electric-cyan)]">🎬</span>
                        <div><strong>Recommender Systems:</strong> Netflix prize winners used matrix factorization (SVD)</div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-[var(--color-electric-cyan)]">📝</span>
                        <div><strong>NLP:</strong> Latent Semantic Analysis (find hidden topics in documents)</div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-[var(--color-electric-cyan)]">🔍</span>
                        <div><strong>Data Denoising:</strong> Separate signal from noise</div>
                    </div>
                </div>
            </section >

            {/* Other Decompositions */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-3">Other Matrix Decompositions</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                        <h4 className="text-indigo-300 font-bold mb-2">LU Decomposition</h4>
                        <div className="font-mono text-xs mb-2 text-center">A = LU</div>
                        <p className="text-xs text-gray-300">
                            Decomposes A into Lower and Upper triangular matrices.
                            Used by computers to solve Ax=b faster than finding A<sup>-1</sup>.
                        </p>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                        <h4 className="text-rose-300 font-bold mb-2">Cholesky Decomposition</h4>
                        <div className="font-mono text-xs mb-2 text-center">A = LL<sup>T</sup></div>
                        <p className="text-xs text-gray-300">
                            For symmetric, positive-definite matrices (like covariance matrices).
                            2x faster than LU!
                        </p>
                    </div>
                </div>
            </section >

            {/* ML Applications */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🤖 Linear Algebra in Machine Learning</h2>

                <div className="space-y-6">
                    {/* PCA Deep Dive */}
                    <div className="bg-black/60 border border-indigo-500/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-indigo-300 mb-3">1. Principal Component Analysis (PCA)</h3>
                        <p className="text-sm mb-4">
                            PCA reduces dimensionality by finding the "most important" directions (eigenvectors).
                        </p>
                        <div className="grid md:grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-white/5 p-2 rounded">
                                <div className="font-bold text-white mb-1">Step 1</div>
                                <div>Center Data (subtract mean)</div>
                            </div>
                            <div className="bg-white/5 p-2 rounded">
                                <div className="font-bold text-white mb-1">Step 2</div>
                                <div>Compute Covariance Matrix (X<sup>T</sup>X)</div>
                            </div>
                            <div className="bg-white/5 p-2 rounded">
                                <div className="font-bold text-white mb-1">Step 3</div>
                                <div>Find Eigenvectors (Principal Components)</div>
                            </div>
                            <div className="bg-white/5 p-2 rounded">
                                <div className="font-bold text-white mb-1">Step 4</div>
                                <div>Project Data onto Top k Eigenvectors</div>
                            </div>
                        </div>
                    </div>

                    {/* Linear Regression Deep Dive */}
                    <div className="bg-black/60 border border-blue-500/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-blue-300 mb-3">2. Linear Regression (Normal Equations)</h3>
                        <p className="text-sm mb-4">
                            We want to solve <span className="font-mono">Ax = b</span>, but usually there's no exact solution (overdetermined).
                            So we minimize the error ||Ax - b||².
                        </p>
                        <div className="bg-black/40 p-4 rounded-lg font-mono text-sm text-center">
                            A<sup>T</sup>Ax = A<sup>T</sup>b
                            <div className="text-xs text-gray-400 mt-2">
                                (Multiply both sides by A<sup>T</sup> to make it solvable!)
                            </div>
                        </div>
                    </div>

                    {/* Neural Networks */}
                    <div className="bg-black/60 border border-green-500/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-green-300 mb-3">3. Neural Networks</h3>
                        <p className="text-sm mb-2">
                            A neural network is just a series of matrix multiplications and non-linear functions.
                        </p>
                        <div className="font-mono text-sm bg-black/40 p-3 rounded mb-2">
                            output = activation(W<sub>2</sub> · activation(W<sub>1</sub> · input + b<sub>1</sub>) + b<sub>2</sub>)
                        </div>
                        <p className="text-xs text-gray-400">
                            <strong>Backpropagation:</strong> Just the chain rule applied to these matrix operations (gradients!).
                        </p>
                    </div>

                    {/* Word Embeddings & Attention */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                            <h4 className="text-pink-300 font-bold mb-2">Word Embeddings</h4>
                            <p className="text-xs text-gray-300">
                                Words is infinite space? No, mapped to R<sup>300</sup>.
                                "King" - "Man" + "Woman" ≈ "Queen" is strictly vector arithmetic.
                            </p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                            <h4 className="text-purple-300 font-bold mb-2">Attention (Transformers)</h4>
                            <div className="font-mono text-xs mb-1">softmax(QK<sup>T</sup>/√d)V</div>
                            <p className="text-xs text-gray-300">
                                The <strong className="text-white">QK<sup>T</sup></strong> part is just a dot product similarity check between all words!
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            {/* Computational Aspects */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">💻 Computational Aspects</h2>
                <p className="mb-4">
                    In the real world, math isn't perfect. We use computers, and computers create errors.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Floating Point</h4>
                        <p className="text-xs text-gray-300 mb-2">Computers have finite precision.</p>
                        <code className="bg-black/40 text-[var(--color-electric-red)] px-2 py-1 rounded text-xs">
                            0.1 + 0.2 != 0.3
                        </code>
                        <p className="text-xs text-gray-400 mt-2">
                            Always check for equality with a small threshold (epsilon).
                        </p>
                    </div>

                    <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Condition Number</h4>
                        <p className="text-xs text-gray-300 mb-2">
                            Measures how sensitive a matrix is to errors.
                        </p>
                        <div className="text-xs text-gray-400">
                            <strong>High Condition Number:</strong> Small changes in input → HUGE changes in output. Bad!
                        </div>
                    </div>

                    <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Computational Cost</h4>
                        <p className="text-xs text-gray-300 mb-2">
                            Matrix multiplication is expensive.
                        </p>
                        <div className="font-mono text-xs text-center bg-black/40 p-1 rounded">
                            O(n<sup>3</sup>)
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Doubling data size = 8x slower! This is why we need GPUs.
                        </p>
                    </div>
                </div>
            </section >

            {/* Matrix Calculus */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">📐 Matrix Calculus: The Bridge to Deep Learning</h2>

                <p className="mb-4">
                    Every time you train a neural network, the computer is doing <strong>matrix calculus</strong>.
                    Understanding these three objects unlocks how backpropagation actually works.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4">
                        <h4 className="text-blue-300 font-bold mb-2">Gradient (∇f)</h4>
                        <p className="text-xs text-gray-300 mb-2">
                            The gradient of a scalar function with respect to a vector.
                            Points in the direction of <strong className="text-white">steepest ascent</strong>.
                        </p>
                        <div className="font-mono text-xs bg-black/40 p-2 rounded text-center">
                            ∇f = [∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ]
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Gradient descent: move <em>opposite</em> to the gradient to minimize loss.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4">
                        <h4 className="text-purple-300 font-bold mb-2">Jacobian (J)</h4>
                        <p className="text-xs text-gray-300 mb-2">
                            When a <strong>vector</strong> function maps to another <strong>vector</strong>,
                            the Jacobian is the matrix of all partial derivatives.
                        </p>
                        <div className="font-mono text-xs bg-black/40 p-2 rounded text-center">
                            J<sub>ij</sub> = ∂f<sub>i</sub>/∂x<sub>j</sub>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Each layer in a neural network has a Jacobian → chain them = backprop!
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-4">
                        <h4 className="text-red-300 font-bold mb-2">Hessian (H)</h4>
                        <p className="text-xs text-gray-300 mb-2">
                            The matrix of <strong>second derivatives</strong>. Tells you about
                            the <em>curvature</em> of the loss surface.
                        </p>
                        <div className="font-mono text-xs bg-black/40 p-2 rounded text-center">
                            H<sub>ij</sub> = ∂²f/∂x<sub>i</sub>∂x<sub>j</sub>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Positive definite Hessian → you're at a minimum! (Second-order optimization)
                        </p>
                    </div>
                </div>

                <GradientDescentViz />

                <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-white mb-3">🔗 Backpropagation = Chain Rule on Matrices</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="text-sm">
                            <p className="mb-2">For a neural network with layers:</p>
                            <div className="font-mono text-xs bg-black/40 p-3 rounded space-y-1">
                                <div>z₁ = W₁x + b₁</div>
                                <div>a₁ = σ(z₁)</div>
                                <div>z₂ = W₂a₁ + b₂</div>
                                <div>loss = L(z₂, y)</div>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="mb-2">Backprop computes:</p>
                            <div className="font-mono text-xs bg-black/40 p-3 rounded space-y-1">
                                <div>∂L/∂W₂ = ∂L/∂z₂ · a₁<sup>T</sup></div>
                                <div>∂L/∂W₁ = (W₂<sup>T</sup> · ∂L/∂z₂ ⊙ σ'(z₁)) · x<sup>T</sup></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Just matrix multiplications and element-wise operations!
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            {/* Tensor Operations */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">🧊 Tensors: Beyond Matrices</h2>

                <p className="mb-4">
                    A <strong>tensor</strong> is just a generalization of vectors and matrices to higher dimensions.
                    This is the native data structure of deep learning frameworks.
                </p>

                <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-4">
                    <h3 className="text-xl font-bold text-white mb-3">The Dimension Hierarchy</h3>
                    <div className="grid md:grid-cols-4 gap-4 text-center text-xs">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <div className="text-blue-300 font-bold mb-1">Scalar</div>
                            <div className="font-mono">0D Tensor</div>
                            <div className="text-gray-400 mt-1">Just a number: 42</div>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                            <div className="text-purple-300 font-bold mb-1">Vector</div>
                            <div className="font-mono">1D Tensor</div>
                            <div className="text-gray-400 mt-1">[1, 2, 3]</div>
                        </div>
                        <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
                            <div className="text-pink-300 font-bold mb-1">Matrix</div>
                            <div className="font-mono">2D Tensor</div>
                            <div className="text-gray-400 mt-1">Rows × Cols</div>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                            <div className="text-orange-300 font-bold mb-1">Tensor</div>
                            <div className="font-mono">3D+ Tensor</div>
                            <div className="text-gray-400 mt-1">Batch × Rows × Cols</div>
                        </div>
                    </div>
                </div>

                <TensorShapeViz />

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Batched Matrix Multiplication</h4>
                        <p className="text-xs text-gray-300 mb-2">
                            GPUs process many matrices at once. Instead of one W×x, compute
                            W × [x₁, x₂, ..., x<sub>batch</sub>] simultaneously.
                        </p>
                        <div className="font-mono text-xs bg-black/40 p-2 rounded text-center">
                            (B × M × N) @ (B × N × P) → (B × M × P)
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            This is why mini-batch training is fast — it's parallel matrix multiplication!
                        </p>
                    </div>

                    <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Real-World Tensor Shapes</h4>
                        <div className="space-y-2 text-xs text-gray-300">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--color-electric-cyan)]">📷</span>
                                <span><strong>Image batch:</strong> (batch, channels, height, width)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--color-electric-cyan)]">📝</span>
                                <span><strong>Text batch:</strong> (batch, seq_len, embedding_dim)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--color-electric-cyan)]">🎥</span>
                                <span><strong>Video:</strong> (batch, frames, channels, H, W)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-200 text-sm">
                        💡 <strong>Einstein Notation (einsum):</strong> A compact way to describe any tensor operation.{' '}
                        <span className="font-mono text-xs">torch.einsum('ij,jk-&gt;ik', A, B)</span> = matrix multiplication.
                        Once you learn it, you'll use it everywhere!
                    </p>
                </div>
            </section >

            {/* Sparse Matrices */}
            < section >
                <h3 className="text-2xl font-bold text-white mb-3">🕸️ Sparse Matrices</h3>

                <p className="mb-4">
                    In the real world, most large matrices are <strong>mostly zeros</strong>. Storing all those
                    zeros wastes memory and computation. Sparse formats solve this.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">📝</div>
                        <h4 className="text-white font-bold text-sm mb-1">NLP</h4>
                        <p className="text-xs text-gray-400">
                            Vocabulary of 50,000 words → Each document vector is 99.9% zeros
                        </p>
                    </div>
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">🌐</div>
                        <h4 className="text-white font-bold text-sm mb-1">Graph Networks</h4>
                        <p className="text-xs text-gray-400">
                            Social network with 1B users → adjacency matrix is 99.99% zeros
                        </p>
                    </div>
                    <div className="bg-black/60 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-2">🎬</div>
                        <h4 className="text-white font-bold text-sm mb-1">Recommenders</h4>
                        <p className="text-xs text-gray-400">
                            User-item matrix: most users rate &lt;1% of all items
                        </p>
                    </div>
                </div>

                <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                    <h4 className="text-white font-bold mb-2">Storage Formats</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-[var(--color-electric-cyan)] font-bold">CSR</span> (Compressed Sparse Row):
                            Store non-zero values + their column indices. Fast for row operations.
                        </div>
                        <div>
                            <span className="text-[var(--color-electric-cyan)] font-bold">COO</span> (Coordinate):
                            Store (row, col, value) triplets. Best for constructing sparse matrices.
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        <strong>Memory savings:</strong> A 10,000 × 10,000 matrix with 1% non-zeros:
                        Dense = 800MB, Sparse = ~2.4MB → <strong className="text-green-400">330× smaller!</strong>
                    </p>
                </div>
            </section >

            {/* Worked Examples */}
            < section >
                <h2 className="text-3xl font-bold text-white mb-4">📝 Worked Examples</h2>

                <p className="mb-4">
                    Theory without practice is incomplete. Let's work through key computations step by step.
                </p>

                {/* Eigenvalue worked example */}
                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-purple-300 mb-3">Example 1: Finding Eigenvalues & Eigenvectors</h3>
                    <p className="text-sm text-gray-300 mb-3">
                        Find the eigenvalues and eigenvectors of:
                    </p>
                    <div className="font-mono text-sm text-center mb-4 bg-black/40 p-3 rounded">
                        A = [4  1]<br />
                        {'    '}[2  3]
                    </div>

                    <div className="space-y-4 text-sm">
                        <div>
                            <div className="text-white font-bold mb-1">Step 1: Characteristic Equation</div>
                            <div className="font-mono text-xs bg-black/40 p-2 rounded">
                                det(A - λI) = det([4-λ  1; 2  3-λ]) = 0<br />
                                (4-λ)(3-λ) - (1)(2) = 0<br />
                                12 - 4λ - 3λ + λ² - 2 = 0<br />
                                λ² - 7λ + 10 = 0
                            </div>
                        </div>

                        <div>
                            <div className="text-white font-bold mb-1">Step 2: Solve for λ</div>
                            <div className="font-mono text-xs bg-black/40 p-2 rounded">
                                (λ - 5)(λ - 2) = 0<br />
                                <span className="text-[var(--color-electric-cyan)]">λ₁ = 5, λ₂ = 2</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-white font-bold mb-1">Step 3: Find Eigenvectors</div>
                            <div className="font-mono text-xs bg-black/40 p-2 rounded mb-2">
                                For λ₁ = 5: (A - 5I)v = 0<br />
                                [-1  1; 2  -2]v = 0 → v₁ = [1, 1]
                            </div>
                            <div className="font-mono text-xs bg-black/40 p-2 rounded">
                                For λ₂ = 2: (A - 2I)v = 0<br />
                                [2  1; 2  1]v = 0 → v₂ = [1, -2]
                            </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-xs">
                            ✅ <strong>Verify:</strong> A·v₁ = [4+1, 2+3] = [5, 5] = 5·[1, 1] ✓
                        </div>
                    </div>
                </div>

                {/* SVD worked example */}
                <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-orange-300 mb-3">Example 2: Applying SVD for Dimensionality Reduction</h3>
                    <div className="space-y-3 text-sm">
                        <p className="text-gray-300">
                            Given a 1000×500 data matrix X (1000 samples, 500 features):
                        </p>
                        <div className="font-mono text-xs bg-black/40 p-3 rounded space-y-1">
                            <div>U, Σ, V<sup>T</sup> = SVD(X)    <span className="text-gray-500"># Full decomposition</span></div>
                            <div>Σ = [σ₁, σ₂, ..., σ₅₀₀]  <span className="text-gray-500"># Sorted: σ₁ ≥ σ₂ ≥ ...</span></div>
                            <div></div>
                            <div><span className="text-gray-500"># If first 50 singular values capture 95% of energy:</span></div>
                            <div>X̃ = U[:,:50] · Σ[:50,:50] · V<sup>T</sup>[:50,:]</div>
                            <div><span className="text-gray-500"># Reduced from 500 features → 50 features (10× compression)</span></div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs">
                            💡 <strong>Rule of thumb:</strong> Keep enough singular values to capture 95% of total energy
                            (Σ of σᵢ² / total Σ σᵢ²).
                        </div>
                    </div>
                </div>

                {/* Solving Systems worked example */}
                <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-300 mb-3">Example 3: Solving Ax = b via Gaussian Elimination</h3>
                    <div className="space-y-3 text-sm">
                        <div className="font-mono text-xs bg-black/40 p-3 rounded">
                            [2  1  -1 | 8 ]     R2 -= 3/2·R1     [2   1  -1 |  8 ]<br />
                            [3  2   1 | 11]     ──────────→      [0  1/2 5/2 | -1 ]<br />
                            [1  3   2 | 12]     R3 -= 1/2·R1     [0  5/2 5/2 |  8 ]
                        </div>
                        <div className="font-mono text-xs bg-black/40 p-3 rounded">
                            R3 -= 5·R2           [2  1  -1 |  8 ]<br />
                            ──────────→          [0 1/2 5/2 | -1 ]<br />
                            {'                    '}[0  0  -10 | 13 ]
                        </div>
                        <div className="text-xs text-gray-300">
                            <strong>Back-substitute:</strong> x₃ = -13/10, x₂ = (−1 − 5/2·x₃)/(1/2), x₁ = ...
                        </div>
                    </div>
                </div>
            </section >

            {/* Conclusion */}
            < div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/10 to-[var(--color-soft-violet)]/10 border border-white/10 rounded-xl p-6" >
                <h3 className="text-xl font-bold text-white mb-3">🎯 The Bottom Line</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                    Linear algebra isn't just prerequisites—it's the actual machinery inside every ML algorithm.
                    From vectors and matrices to eigendecomposition, SVD, and tensor operations—these tools
                    power everything from PCA to Transformers.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-400">
                    <div>
                        <strong className="text-white block mb-1">Foundations</strong>
                        Vectors, matrices, transformations, systems of equations, determinants
                    </div>
                    <div>
                        <strong className="text-white block mb-1">Decompositions</strong>
                        Eigendecomposition, SVD, LU, Cholesky, QR — each with specific use cases
                    </div>
                    <div>
                        <strong className="text-white block mb-1">ML Bridge</strong>
                        Matrix calculus, tensors, sparse representations — the practical toolkit
                    </div>
                </div>
            </div >
        </div >
    );
};
