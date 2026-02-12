
import React, { useState, useEffect, useRef } from 'react';
import { MathEquation } from './common/MathEquation';

// Signals defined outside component to prevent re-creation on every render
const X_SIGNAL = [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const H_BASE = [1, 0.8, 0.64, 0.51, 0.41, 0.33, 0, 0];
const MAX_N = X_SIGNAL.length + H_BASE.length;

export const ConvolutionDemo: React.FC = () => {
    const [shift, setShift] = useState(-5);
    const [isPlaying, setIsPlaying] = useState(false);

    // Use refs for animation state to avoid closure staleness issues
    const isPlayingRef = useRef(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);

    // Compute full output y[n] ahead of time
    const [y, setY] = useState<number[]>([]);

    useEffect(() => {
        const result = [];
        const x_len = X_SIGNAL.length;
        const h_len = H_BASE.length;
        const total_len = x_len + h_len - 1;

        for (let n = 0; n < total_len; n++) {
            let sum = 0;
            for (let k = 0; k < x_len; k++) {
                if (n - k >= 0 && n - k < h_len) {
                    sum += X_SIGNAL[k] * H_BASE[n - k];
                }
            }
            result.push(sum);
        }
        setY(result);
    }, []);

    // Animation Loop
    useEffect(() => {
        isPlayingRef.current = isPlaying;

        if (isPlaying) {
            const animate = () => {
                if (!isPlayingRef.current) return;

                setShift(prev => {
                    const next = prev + 0.05; // fractional for smooth sliding
                    if (next > MAX_N) {
                        setIsPlaying(false);
                        return MAX_N;
                    }
                    return next;
                });

                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, [isPlaying]);

    /* -------------------------------------------------------------------------- */
    /*                               Draw Function                                */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Only set width/height if needed to avoid flicker
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        } else {
            ctx.clearRect(0, 0, rect.width, rect.height);
        }

        const w = rect.width;
        const h = rect.height;
        const padding = 40;

        const axisY_top = h * 0.35;
        const axisY_bottom = h * 0.85;

        const scaleX = (w - 2 * padding) / (MAX_N + 5);
        const scaleY = 60; // Amplitude scale

        const currentN = shift;

        // Draw Axes
        ctx.lineWidth = 1;
        ctx.font = '10px monospace';

        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(padding, axisY_top);
        ctx.lineTo(w - padding, axisY_top);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('k (Input Index)', w - 80, axisY_top + 15);

        ctx.beginPath();
        ctx.moveTo(padding, axisY_bottom);
        ctx.lineTo(w - padding, axisY_bottom);
        ctx.stroke();
        ctx.fillText('n (Output Index)', w - 80, axisY_bottom + 15);


        /* -------------------------- Graph 1: Input x[k] ------------------------- */
        ctx.fillStyle = '#22d3ee'; // cyan-400
        ctx.strokeStyle = '#22d3ee';
        X_SIGNAL.forEach((val, k) => {
            if (val === 0) return;
            const px = padding + k * scaleX;
            const py = axisY_top - val * scaleY;

            ctx.beginPath();
            ctx.moveTo(px, axisY_top);
            ctx.lineTo(px, py);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        /* ----------------------- Graph 1: Sliding Window h[n-k] ----------------- */
        ctx.fillStyle = '#f472b6'; // pink-400
        ctx.strokeStyle = '#f472b6';

        H_BASE.forEach((val, i) => {
            const k_loc = currentN - i;
            const px = padding + k_loc * scaleX;
            const py = axisY_top - val * scaleY;

            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(px, axisY_top);
            ctx.lineTo(px, py);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        /* --------------------------- Interaction Highlight ---------------------- */
        for (let k = 0; k < X_SIGNAL.length; k++) {
            const idx_in_h = Math.round(currentN - k);

            if (idx_in_h >= 0 && idx_in_h < H_BASE.length) {
                const prod = X_SIGNAL[k] * H_BASE[idx_in_h];
                if (prod > 0.01) {
                    const px = padding + k * scaleX;
                    const py_prod = axisY_top - prod * scaleY;

                    ctx.fillStyle = '#f59e0b'; // amber-500
                    ctx.fillRect(px - 2, py_prod, 4, axisY_top - py_prod);
                }
            }
        }

        /* -------------------------- Graph 2: Output y[n] ------------------------ */
        ctx.fillStyle = '#fbbf24'; // amber-400
        ctx.strokeStyle = '#fbbf24';

        y.forEach((val, n) => {
            if (n > currentN) {
                ctx.globalAlpha = 0.2; // Future
            } else {
                ctx.globalAlpha = 1.0; // Past/Present
            }

            const px = padding + n * scaleX;
            const py = axisY_bottom - val * scaleY;

            ctx.beginPath();
            ctx.moveTo(px, axisY_bottom);
            ctx.lineTo(px, py);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Current n marker
        const markerX = padding + currentN * scaleX;
        ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(markerX, 0);
        ctx.lineTo(markerX, h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;

    }, [shift, y]);


    return (
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-2">Discrete Convolution</h3>

            <div className="mb-6 text-gray-400 text-sm">
                <div className="flex gap-4 items-center">
                    <p>
                        Visualizing the "Flip and Drag" method:
                    </p>
                    <MathEquation
                        formula="y[n] = (x * h)[n] = \sum_{k} x[k] \cdot h[n-k]"
                        className="text-amber-400 text-lg"
                    />
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-400 rounded-full"></div> Input x[k]</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-400 rounded-full"></div> Filter h[n-k] (Flipped)</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-400 rounded-full"></div> Output y[n]</span>
                </div>
            </div>

            <div className="relative border border-white/5 rounded-lg overflow-hidden bg-black/40 mb-4">
                <canvas
                    ref={canvasRef}
                    className="w-full h-80 block"
                />
            </div>

            <div className="flex flex-wrap justify-between items-center bg-black/20 p-4 rounded-lg gap-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-6 py-2 rounded-lg font-bold transition-colors ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                    >
                        {isPlaying ? 'Pause' : 'Play Animation'}
                    </button>
                    <button
                        onClick={() => {
                            setShift(-5);
                            setIsPlaying(true);
                        }}
                        className="px-4 py-2 rounded-lg font-bold bg-white/5 text-gray-400 hover:bg-white/10"
                    >
                        Restart
                    </button>
                </div>

                <div className="flex items-center gap-4 flex-grow max-w-md">
                    <label className="text-xs font-mono text-gray-500 whitespace-nowrap">Shift (n)</label>
                    <input
                        type="range"
                        min={-5}
                        max={MAX_N}
                        step="0.1"
                        value={shift}
                        onChange={(e) => {
                            setShift(parseFloat(e.target.value));
                            setIsPlaying(false);
                        }}
                        className="w-full accent-amber-500"
                    />
                    <span className="font-mono text-amber-400 w-8 text-right">{Math.round(shift)}</span>
                </div>
            </div>
        </div>
    );
};
