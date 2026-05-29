/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { Target, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Point {
    x: number;
    y: number;
    label: 1 | -1;
}

export const SVMDecisionViz: React.FC = () => {
    const [points, setPoints] = useState<Point[]>([
        { x: 0.3, y: 0.7, label: 1 },
        { x: 0.4, y: 0.6, label: 1 },
        { x: 0.7, y: 0.3, label: -1 },
        { x: 0.8, y: 0.4, label: -1 },
    ]);
    const [kernel, setKernel] = useState<'linear' | 'rbf'>('linear');
    const [C, setC] = useState(1.0); // Regularization parameter
    const [gamma, setGamma] = useState(10.0); // RBF Gamma
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<1 | -1>(1); // Class to add

    // Simple SMO-like or Gradient Descent solver for SVM (client-side)
    // For visualization purposes, we can use a simplified perceptron or kernel method approximation
    // since writing a full SMO solver in JS for a React component might be overkill.
    // However, to show "margins", we need something close.
    // Let's implement a simplified Kernel Perceptron / Online Learning approach which approximates the boundary.

    // Better yet: Compute grid values based on dual coefficients alpha.
    // Decision function: f(x) = sum(alpha_i * y_i * K(x_i, x)) + b

    // We will simulate training step-by-step or "instant" fit with a simple optimizer.

    const trainSVM = () => {
        // Simplified Pegasos algorithm (Primal Estimated sub-GrAdient SOlver for SVM) for Linear
        // For Kernel, we might need a dual solver. 
        // Let's implement a basic dual coordinate ascent (randomized) for the demo.

        const alphas = new Array(points.length).fill(0);
        const b = 0; // Simplified
        const maxIter = 1000;

        // Precompute Kernel Matrix
        const K = (p1: Point, p2: Point) => {
            if (kernel === 'linear') {
                return p1.x * p2.x + p1.y * p2.y;
            } else {
                const dist = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
                return Math.exp(-gamma * dist);
            }
        };

        // Simple Random Coordinate Ascent for Dual Soft-Margin SVM
        // Maximize: sum(alpha) - 0.5 * sum(alpha_i * alpha_j * y_i * y_j * K(x_i, x_j))
        // Subject to: 0 <= alpha <= C, sum(alpha * y) = 0

        // Since enforcing sum constraint is hard with single coordinate, we relax it or use SMO pairs.
        // For this visualizer, let's just train a Kernel Logistic Regression using Gradient Descent? 
        // Actually, let's do a simplified "weighted prototype" approach which behaves similarly visually.

        // fallback: Let's actally try to run a few iterations of a solver that updates alphas.
        // Using a "Kernel Adatron" or simple feedback loop for visualization.

        // "Relaxed" learning:
        const learningRate = 0.01;

        // Let's use a simpler proxy for visualization: Kernel Logistic Regression Gradient Descent
        // Loss = log(1 + exp(-y * f(x))) + lambda * ||w||^2
        // f(x) = sum(alpha_i * K(x_i, x))

        // This is easier to implement:
        // Update alpha_i: alpha_i += learningRate * (y_i - prob_i) (roughly)

        const modelAlphas = new Array(points.length).fill(0);

        for (let iter = 0; iter < 500; iter++) {
            points.forEach((p, i) => {
                let fx = 0;
                for (let j = 0; j < points.length; j++) {
                    fx += modelAlphas[j] * K(points[j], p);
                }

                // Gradient of Hinge Loss approx or Log Loss
                // If y * fx < 1 (margin violation)
                if (p.label * fx < 1) {
                    modelAlphas[i] += learningRate * p.label;
                }
                // Regularization (decay)
                modelAlphas[i] *= (1 - learningRate * (1 / C));
            });
        }

        return { alphas: modelAlphas, bias: 0 };
    };

    useEffect(() => {
        if (!canvasRef.current || points.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const { alphas } = trainSVM();

        // 1. Draw Decision Boundary (Contour Plot)
        const gridSize = 10; // Pixel steps
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        const K_eval = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
            if (kernel === 'linear') {
                return p1.x * p2.x + p1.y * p2.y;
            } else {
                const dist = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
                return Math.exp(-gamma * dist);
            }
        };

        const predict = (x: number, y: number) => {
            let score = 0;
            for (let i = 0; i < points.length; i++) {
                score += alphas[i] * K_eval(points[i], { x, y });
            }
            return score;
        };

        for (let py = 0; py < height; py += 4) { // Optimization: skip pixels
            for (let px = 0; px < width; px += 4) {
                const x = px / width;
                const y = 1 - (py / height); // Invert y for math coords

                const score = predict(x, y);

                // Color Map
                // Blue = Class 1 (Positive), Red = Class -1 (Negative)
                // Intensity based on margin distance
                const idx = (py * width + px) * 4;

                let r = 0, g = 0, b = 0, a = 0;

                if (score > 0) {
                    // Blue
                    b = 255;
                    a = Math.min(Math.abs(score) * 100, 100); // 0.2 opacity max
                } else {
                    // Red
                    r = 255;
                    a = Math.min(Math.abs(score) * 100, 100);
                }

                // Draw 4x4 block
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                ctx.fillRect(px, py, 4, 4);

                // Draw Decision Line (approx)
                if (Math.abs(score) < 0.05) {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(px, py, 4, 4);
                }
                // Draw Margins (+1/-1)
                if (Math.abs(score - 1) < 0.05 || Math.abs(score + 1) < 0.05) {
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(px, py, 4, 4);
                }
            }
        }

        // 2. Draw Points
        points.forEach(p => {
            const cx = p.x * width;
            const cy = (1 - p.y) * height;

            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, Math.PI * 2);
            ctx.fillStyle = p.label === 1 ? '#3b82f6' : '#ef4444'; // Blue vs Red
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        });

    }, [points, kernel, C, gamma]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1 - (e.clientY - rect.top) / rect.height;

        setPoints([...points, { x, y, label: mode }]);
    };

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target size={20} className="text-violet-500" /> Support Vector Machines
                    </h3>
                    <p className="text-gray-400 text-sm">Interactive decision boundary with kernel trick.</p>
                </div>
                <button
                    onClick={() => setPoints([])}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1 rounded"
                >
                    Clear Points
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Canvas */}
                <div className="lg:col-span-2 relative bg-gray-950 rounded-lg overflow-hidden border border-white/10 cursor-crosshair">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="w-full h-full block"
                        onClick={handleCanvasClick}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-4 pointer-events-none">
                        <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded text-xs text-white">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Class +1
                        </div>
                        <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded text-xs text-white">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> Class -1
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    {/* Class Selector */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Add Points</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode(1)}
                                className={`flex-1 py-2 rounded font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-gray-800 text-gray-400'}`}
                            >
                                <div className="w-2 h-2 rounded-full bg-white"></div> Class A
                            </button>
                            <button
                                onClick={() => setMode(-1)}
                                className={`flex-1 py-2 rounded font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === -1 ? 'bg-red-600 text-white shadow-lg shadow-red-500/25' : 'bg-gray-800 text-gray-400'}`}
                            >
                                <div className="w-2 h-2 rounded-full bg-white"></div> Class B
                            </button>
                        </div>
                    </div>

                    {/* Kernel Toggle */}
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Kernel Type</label>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => setKernel('linear')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${kernel === 'linear' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                Linear
                            </button>
                            <button
                                onClick={() => setKernel('rbf')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${kernel === 'rbf' ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                RBF (Radial)
                            </button>
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>C (Regularization)</span>
                                <span>{C.toFixed(1)}</span>
                            </div>
                            <input
                                type="range" min="0.1" max="10" step="0.1"
                                value={C}
                                onChange={(e) => setC(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                            />
                        </div>

                        {kernel === 'rbf' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Gamma (RBF Width)</span>
                                    <span>{gamma.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range" min="1" max="50" step="1"
                                    value={gamma}
                                    onChange={(e) => setGamma(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                />
                            </motion.div>
                        )}
                    </div>

                    <div className="text-xs text-gray-500">
                        <strong>Tip:</strong> RBF Kernel maps inputs to infinite-dimensional space, allowing non-linear separation. Low Gamma = broad influence, High Gamma = tight islands.
                    </div>
                </div>
            </div>
        </div>
    );
};
