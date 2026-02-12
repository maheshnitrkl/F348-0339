import React, { useEffect, useRef } from 'react';
import { MathEquation } from './common/MathEquation';

export const WaveletDemo: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Visualizing the Time-Frequency Resolution Trade-off (Heisenberg Uncertainty)
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Only resize if needed
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        } else {
            ctx.clearRect(0, 0, rect.width, rect.height);
        }

        const w = rect.width;
        const h = rect.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Draw STFT Grid (Fixed Resolution)
        // Left side
        const stftX = w * 0.05;
        const stftW = w * 0.4;
        const baseY = h * 0.2;
        const gridH = h * 0.6;

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STFT (Fixed Window)', stftX + stftW / 2, baseY - 20);

        ctx.strokeStyle = '#38bdf8'; // Sky blue
        ctx.lineWidth = 1;

        // Draw uniform grid
        const rows = 8;
        const cols = 8;
        const cellW = stftW / cols;
        const cellH = gridH / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                ctx.strokeRect(stftX + c * cellW, baseY + r * cellH, cellW, cellH);
            }
        }

        // Draw Wavelet Grid (Multi-Resolution)
        // Right side
        const cwtX = w * 0.55;
        const cwtW = w * 0.4;

        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Wavelet Transform (Multi-Res)', cwtX + cwtW / 2, baseY - 20);

        ctx.strokeStyle = '#f472b6'; // Pink

        // Rows (Scales) have different time resolutions
        for (let r = 0; r < rows; r++) {
            // Lower frequency (Higher r index in this viz) -> Higher Frequency Resolution, Lower Time Resolution
            // Wait, usually top is high freq.
            // Let's say top (r=0) is High Freq -> Short Time Windows
            const y = baseY + r * cellH;

            // Number of time cells doubles as we go to higher frequencies (lower scale)
            // Or rather: High Freq (Top) = Short time windows (Many cols)
            // Low Freq (Bottom) = Long time windows (Few cols)

            // Let's make top row have 32 cols, bottom row have 2 cols
            const subdivisions = Math.pow(2, Math.floor((rows - 1 - r) / 2) + 1);
            // r=7 (bottom, low freq) -> sub=2
            // r=0 (top, high freq) -> sub=16

            const rowCellW = cwtW / subdivisions;

            for (let i = 0; i < subdivisions; i++) {
                ctx.strokeRect(cwtX + i * rowCellW, y, rowCellW, cellH);
            }
        }

        // Add labels
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.font = '10px monospace';

        ctx.fillText('High Freq', w * 0.01, baseY + 10);
        ctx.fillText('Low Freq', w * 0.01, baseY + gridH - 5);
        ctx.fillText('Time ->', w * 0.2, baseY + gridH + 15);

        ctx.fillText('High Freq', w * 0.51, baseY + 10);
        ctx.fillText('Low Freq', w * 0.51, baseY + gridH - 5);
        ctx.fillText('Time ->', w * 0.7, baseY + gridH + 15);

    }, []);

    return (
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-2">Time-Frequency Resolution (Heisenberg Limit)</h3>

            <div className="text-gray-400 text-sm mb-6 space-y-2">
                <p>
                    The Gabor Limit (Uncertainty Principle for Signals) states: <MathEquation formula="\sigma_t \cdot \sigma_\omega \ge \frac{1}{2}" />
                </p>
                <p>
                    You cannot simultaneously know the exact time and exact frequency of a signal.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <canvas
                    ref={canvasRef}
                    className="w-full h-64 bg-black/40 rounded-lg border border-white/5"
                />

                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-200">
                        <strong>STFT (Short-Time Fourier Transform)</strong>
                        <div className="my-2 opacity-70">
                            <MathEquation formula="X[n, k] = \sum_{m} x[m] w[n-m] e^{-j2\pi k m/N}" />
                        </div>
                        Uses a <strong>fixed window size</strong> (blue grid).
                        Wide window = Good Freq Res, Bad Time Res.
                        Narrow window = Good Time Res, Bad Freq Res.
                    </div>
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-200">
                        <strong>Wavelet Transform (Multi-Resolution)</strong>
                        <div className="my-2 opacity-70">
                            <MathEquation formula="W(s, \tau) = \frac{1}{\sqrt{|s|}} \int_{-\infty}^{\infty} x(t) \psi^*(\frac{t-\tau}{s}) dt" />
                        </div>
                        Adapts the window size (pink grid).
                        Small scale (top) = <strong>Short windows</strong> for High Freq (Transient spikes).
                        Large scale (bottom) = <strong>Long windows</strong> for Low Freq (Rhythm).
                    </div>
                </div>
            </div>
        </div>
    );
};
