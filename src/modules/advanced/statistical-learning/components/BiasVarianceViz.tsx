/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

export const BiasVarianceViz: React.FC = () => {
    const [degree, setDegree] = useState(1);
    const [points, setPoints] = useState<Point[]>([]);
    const [testPoints, setTestPoints] = useState<Point[]>([]);
    const [trainMSE, setTrainMSE] = useState(0);
    const [testMSE, setTestMSE] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Generate synthetic data: y = sin(2*pi*x) + noise
    const generateData = () => {
        const newPoints: Point[] = [];
        const newTestPoints: Point[] = [];
        for (let i = 0; i < 20; i++) {
            const x = Math.random();
            const y = Math.sin(2 * Math.PI * x) + (Math.random() - 0.5) * 0.5; // High noise
            newPoints.push({ x, y });
        }
        for (let i = 0; i < 20; i++) {
            const x = Math.random();
            const y = Math.sin(2 * Math.PI * x) + (Math.random() - 0.5) * 0.5;
            newTestPoints.push({ x, y });
        }
        setPoints(newPoints.sort((a, b) => a.x - b.x));
        setTestPoints(newTestPoints.sort((a, b) => a.x - b.x));
    };

    useEffect(() => {
        generateData();
    }, []);

    // Polynomial Regression
    const fitPolynomial = (data: Point[], deg: number) => {
        const X = [];
        const Y = [];
        for (let i = 0; i < data.length; i++) {
            const row = [];
            for (let j = 0; j <= deg; j++) {
                row.push(Math.pow(data[i].x, j));
            }
            X.push(row);
            Y.push([data[i].y]);
        }

        // Normal Equation: theta = (X^T * X)^-1 * X^T * Y
        // Simplified using a library or basic matrix ops (omitted for brevity, using simple JS implementation)
        // Since we don't have math.js, we'll use a simple Gaussian elimination or similar.
        // For this demo, we'll implement a basic least squares solver.

        return solveLeastSquares(X, Y);
    };

    const solveLeastSquares = (X: number[][], Y: number[][]) => {
        const Xt = transpose(X);
        const XtX = multiply(Xt, X);
        const XtY = multiply(Xt, Y);
        // Add regularization to prevent singular matrix for high degrees
        const lambda = 0.0001;
        for (let i = 0; i < XtX.length; i++) XtX[i][i] += lambda;

        const invXtX = invert(XtX);
        const theta = multiply(invXtX, XtY);
        return theta;
    };

    // Matrix helpers
    const transpose = (m: number[][]) => m[0].map((_, i) => m.map(row => row[i]));
    const multiply = (a: number[][], b: number[][]) => {
        const result = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
        return result.map((row, i) => row.map((_, j) => a[i].reduce((sum, elm, k) => sum + elm * b[k][j], 0)));
    };
    const invert = (m: number[][]) => {
        // Simple Gaussian elimination for matrix inversion
        const n = m.length;
        const A = m.map(row => [...row]);
        const I = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)));

        for (let i = 0; i < n; i++) {
            const pivot = A[i][i];
            for (let j = 0; j < n; j++) {
                A[i][j] /= pivot;
                I[i][j] /= pivot;
            }
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const factor = A[k][i];
                    for (let j = 0; j < n; j++) {
                        A[k][j] -= factor * A[i][j];
                        I[k][j] -= factor * I[i][j];
                    }
                }
            }
        }
        return I;
    };


    useEffect(() => {
        if (!canvasRef.current || points.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Scale helpers
        const toX = (x: number) => x * width;
        const toY = (y: number) => height - (y + 1.5) * (height / 3); // Map y from [-1.5, 1.5]

        // Draw Points
        ctx.fillStyle = '#3b82f6'; // Train Blue
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(toX(p.x), toY(p.y), 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; // Test Red (faint)
        testPoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(toX(p.x), toY(p.y), 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Fit & Draw Curve
        const coeffs = fitPolynomial(points, degree);

        ctx.beginPath();
        ctx.strokeStyle = '#10b981'; // Green fit
        ctx.lineWidth = 2;
        for (let x = 0; x <= 1; x += 0.01) {
            let y = 0;
            for (let j = 0; j < coeffs.length; j++) {
                y += coeffs[j][0] * Math.pow(x, j);
            }
            const canvasX = toX(x);
            const canvasY = toY(y);
            if (x === 0) ctx.moveTo(canvasX, canvasY);
            else ctx.lineTo(canvasX, canvasY);
        }
        ctx.stroke();

        // True Function (dashed)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.setLineDash([5, 5]);
        for (let x = 0; x <= 1; x += 0.01) {
            const y = Math.sin(2 * Math.PI * x);
            const canvasX = toX(x);
            const canvasY = toY(y);
            if (x === 0) ctx.moveTo(canvasX, canvasY);
            else ctx.lineTo(canvasX, canvasY);
        }
        ctx.stroke();
        ctx.setLineDash([]);


        // Calculate MSE
        const calculateMSE = (data: Point[]) => {
            let error = 0;
            data.forEach(p => {
                let pred = 0;
                for (let j = 0; j < coeffs.length; j++) {
                    pred += coeffs[j][0] * Math.pow(p.x, j);
                }
                error += Math.pow(p.y - pred, 2);
            });
            return error / data.length;
        };

        setTrainMSE(calculateMSE(points));
        setTestMSE(calculateMSE(testPoints));

    }, [degree, points, testPoints]);

    return (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" /> Bias-Variance Tradeoff
                    </h3>
                    <p className="text-gray-400 text-sm">Fit a polynomial relative to model complexity.</p>
                </div>
                <button
                    onClick={generateData}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    title="Generate New Data"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Viz */}
                <div className="lg:col-span-2 relative bg-black/40 rounded-lg overflow-hidden border border-white/5">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="w-full h-auto block"
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 text-xs bg-black/60 p-2 rounded backdrop-blur">
                        <span className="text-blue-400 font-bold">● Train Data</span>
                        <span className="text-red-400 font-bold">● Test Data</span>
                        <span className="text-emerald-400 font-bold">─ Model Fit</span>
                        <span className="text-gray-400">--- True f(x)</span>
                    </div>
                </div>

                {/* Controls & Metrics */}
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Polynomial Degree: <span className="text-emerald-400 text-lg ml-1 font-bold">{degree}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="15"
                            value={degree}
                            onChange={(e) => setDegree(parseInt(e.target.value))}
                            className="w-full accent-emerald-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>High Bias (Underfit)</span>
                            <span>High Variance (Overfit)</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Training Error (MSE)</div>
                            <div className="text-2xl font-mono text-blue-400">{trainMSE.toFixed(4)}</div>
                        </div>

                        <div className={`p-4 rounded-lg border border-white/10 transition-colors ${testMSE > 0.5 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5'}`}>
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Test Error (MSE)</div>
                            <div className={`text-2xl font-mono ${testMSE > 0.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {testMSE.toFixed(4)}
                            </div>
                            {testMSE > 0.5 && degree > 10 && (
                                <div className="text-red-400 text-xs mt-2 font-bold animate-pulse">
                                    ⚠️ High Variance Detected!
                                </div>
                            )}
                            {trainMSE > 0.2 && degree < 3 && (
                                <div className="text-yellow-400 text-xs mt-2 font-bold animate-pulse">
                                    ⚠️ High Bias Detected!
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 leading-relaxed">
                        <strong className="text-gray-300">Observation:</strong> As complexity (degree) increases, training error usually drops. However, test error forms a U-shape: high at low complexity (bias) and high at extreme complexity (variance).
                    </div>
                </div>
            </div>
        </div>
    );
};
